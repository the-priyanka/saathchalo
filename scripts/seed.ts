import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { drivers } from '@/data/drivers';
import { rideTemplates } from '@/data/rides';
import { DEMO_USER } from './demo-user';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.');
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findUserId(email: string): Promise<string | undefined> {
  const perPage = 200;
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const hit = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (hit) return hit.id;
    if (data.users.length < perPage) return undefined;
  }
  return undefined;
}

async function ensureUser(email: string, password: string, fullName: string): Promise<string> {
  const existing = await findUserId(email);
  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(existing, {
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (error) throw error;
    return existing;
  }
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error || !data.user) throw error ?? new Error(`Could not create ${email}`);
  return data.user.id;
}

async function main() {
  // 1. Demo drivers: real auth users so the profiles foreign key holds.
  const authIdByDriverId = new Map<string, string>();
  for (const [index, driver] of drivers.entries()) {
    const email = `driver${index + 1}@demo.saathchalo.test`;
    const id = await ensureUser(email, randomUUID(), driver.name);
    const { error } = await admin
      .from('profiles')
      .update({
        full_name: driver.name,
        bio: driver.bio,
        rating: driver.rating,
        review_count: driver.reviewCount,
        verified: driver.verified,
        member_since: driver.memberSince,
      })
      .eq('id', id);
    if (error) throw error;
    authIdByDriverId.set(driver.id, id);
  }
  console.log(`Seeded ${drivers.length} demo drivers.`);

  // 2. Demo user for visitors to log in with.
  const demoId = await ensureUser(DEMO_USER.email, DEMO_USER.password, DEMO_USER.fullName);
  const { error: demoResetError } = await admin
    .from('profiles')
    .update({ bio: '', full_name: DEMO_USER.fullName })
    .eq('id', demoId);
  if (demoResetError) throw demoResetError;
  console.log(`Demo user ready: ${DEMO_USER.email}`);

  // 3. Demo rides: replace all of them.
  const { error: deleteError } = await admin.from('rides').delete().eq('is_demo', true);
  if (deleteError) throw deleteError;

  const rows = rideTemplates.map((ride) => {
    const driverId = authIdByDriverId.get(ride.driverId);
    if (!driverId) throw new Error(`No auth user for driver ${ride.driverId}`);
    return {
      id: ride.id,
      driver_id: driverId,
      from_city: ride.from,
      to_city: ride.to,
      pickup_point: ride.pickupPoint,
      drop_point: ride.dropPoint,
      departure_time: new Date().toISOString(), // placeholder, refresh_demo_rides() sets the real value
      duration_mins: ride.durationMins,
      price_per_seat: ride.pricePerSeat,
      seats_left: ride.seatsLeft,
      seats_total: ride.seatsTotal,
      car_model: ride.car.model,
      car_color: ride.car.color,
      pref_ac: ride.preferences.ac,
      pref_music: ride.preferences.music,
      pref_pets: ride.preferences.pets,
      pref_luggage: ride.preferences.luggage,
      is_demo: true,
      demo_day_offset: ride.dayOffset,
      demo_time: `${ride.time}:00`,
    };
  });
  const { error: insertError } = await admin.from('rides').insert(rows);
  if (insertError) throw insertError;

  // 4. Move the dates relative to today.
  const { error: refreshError } = await admin.rpc('refresh_demo_rides');
  if (refreshError) throw refreshError;
  console.log(`Seeded ${rows.length} demo rides.`);
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
