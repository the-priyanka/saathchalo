import { createClient } from '@supabase/supabase-js';
import { getDriver, getPopularRoutes, getRide, searchRides } from '@/lib/rides';
import { DEMO_USER } from './demo-user';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !anonKey || !serviceKey) {
  console.error('Missing Supabase keys in .env.local (URL, anon key, and service role key are all needed).');
  process.exit(1);
}

const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, serviceKey, options);
const anon = createClient(url, anonKey, options);

let failures = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  if (ok) {
    console.log(`PASS ${name}`);
  } else {
    failures += 1;
    console.log(`FAIL ${name}${detail === undefined ? '' : ` -> ${JSON.stringify(detail)}`}`);
  }
}
const ids = (rides: { id: string }[]) => rides.map((r) => r.id);
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** IST calendar date (YYYY-MM-DD) `days` days from today. */
function istDate(days: number): string {
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000 + days * 24 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 10);
}

async function dataLayerChecks() {
  const route = { from: 'Delhi', to: 'Chandigarh' };

  check('14 upcoming rides', (await searchRides()).length === 14);
  check('every searched ride has a driver attached', (await searchRides()).every((r) => r.driver && r.driver.name.length > 0));
  check('route search is case-insensitive and ordered by time', same(ids(await searchRides({ from: ' delhi ', to: 'CHANDIGARH' })), ['r1', 'r2', 'r3']));
  check('unknown route is empty', (await searchRides({ from: 'Delhi', to: 'Pune' })).length === 0);
  check('date filter day 1', same(ids(await searchRides({ ...route, date: istDate(1) })), ['r1', 'r2']));
  check('date filter day 2', same(ids(await searchRides({ ...route, date: istDate(2) })), ['r3']));
  check('seats filter', same(ids(await searchRides({ ...route, seats: 3 })), ['r1']));
  check('max price filter', same(ids(await searchRides(route, { maxPrice: 450 })), ['r1', 'r3']));
  check('time of day filter', same(ids(await searchRides(route, { timeOfDay: ['morning'] })), ['r1']));
  check('min rating filter', same(ids(await searchRides(route, { minRating: 4.7 })), ['r1']));
  check('verified filter', same(ids(await searchRides(route, { verifiedOnly: true })), ['r1', 'r2']));
  check('sort cheapest', same(ids(await searchRides(route, {}, 'cheapest')), ['r3', 'r1', 'r2']));
  check('sort best rated', same(ids(await searchRides(route, {}, 'best-rated')), ['r1', 'r2', 'r3']));

  const r1 = await getRide('r1');
  check('getRide returns the ride with its driver', r1?.driver.name === 'Rohan Mehta' && r1.departureTime.endsWith('+05:30'), r1);
  check('getRide unknown id is undefined', (await getRide('nope')) === undefined);
  check('getDriver returns a driver', r1 !== undefined && (await getDriver(r1.driverId))?.name === 'Rohan Mehta');
  check('getDriver with a non-uuid is undefined', (await getDriver('zzz')) === undefined);
  check('getDriver with an unknown uuid is undefined', (await getDriver('00000000-0000-0000-0000-000000000000')) === undefined);

  const popular = await getPopularRoutes();
  check('popular routes', popular.length === 6 && popular[0].from === 'Delhi' && popular[0].to === 'Chandigarh' && popular[0].startingPrice === 400 && popular[0].rideCount === 3, popular[0]);

  check('wildcard * in city search matches nothing', (await searchRides({ from: 'Del*' })).length === 0);
  for (const raw of ['%', '_', '\\']) {
    try {
      check(`city search with ${raw} matches nothing`, (await searchRides({ from: raw })).length === 0);
    } catch (error) {
      check(`city search with ${raw} does not throw`, false, error instanceof Error ? error.message : error);
    }
  }

  const { data: rideToModify } = await admin.from('rides').select('id').eq('is_demo', true).limit(1).single();
  if (!rideToModify?.id) {
    check('found a demo ride for the past-ride check', false);
  } else {
    const { error: updateError } = await admin
      .from('rides')
      .update({ departure_time: new Date(Date.now() - 3600_000).toISOString() })
      .eq('id', rideToModify.id);
    if (updateError) {
      check('past rides are excluded from search', false, updateError.message);
    } else {
      try {
        check('past rides are excluded from search', (await searchRides()).length === 13);
      } finally {
        const { error: restoreError } = await admin.rpc('refresh_demo_rides');
        check('demo rides restored after the past-ride check', restoreError === null, restoreError?.message);
      }
    }
  }
}

async function rlsChecks() {
  const { data: rohan } = await admin.from('profiles').select('id').eq('full_name', 'Rohan Mehta').single();
  if (!rohan) {
    check('found a demo driver profile', false);
    return;
  }

  const ridePayload = (id: string) => ({ id, driver_id: rohan.id, from_city: 'A', to_city: 'B', pickup_point: 'x', drop_point: 'y', departure_time: new Date().toISOString(), duration_mins: 10, price_per_seat: 1, seats_left: 1, seats_total: 1, car_model: 'c', car_color: 'c' });
  const denied = (error: { code?: string } | null) => error?.code === '42501';

  const insert = await anon.from('rides').insert(ridePayload('rls-test'));
  check('anon cannot insert rides', denied(insert.error), insert.error);

  const anonUpdate = await anon.from('profiles').update({ bio: 'hacked' }).eq('id', rohan.id).select();
  check('anon cannot update profiles', anonUpdate.error === null ? (anonUpdate.data ?? []).length === 0 : denied(anonUpdate.error), anonUpdate.error ?? anonUpdate.data);

  const signIn = await anon.auth.signInWithPassword({ email: DEMO_USER.email, password: DEMO_USER.password });
  const demoId = signIn.data.user?.id;
  check('demo user can sign in', signIn.error === null && demoId !== undefined, signIn.error?.message);
  if (!demoId) return;

  const ownBio = await anon.from('profiles').update({ bio: 'Checked by db:check' }).eq('id', demoId).select();
  check('user can edit their own bio', ownBio.error === null && (ownBio.data ?? []).length === 1, ownBio.error?.message);
  await anon.from('profiles').update({ bio: '' }).eq('id', demoId);

  const ownRating = await anon.from('profiles').update({ rating: 5 }).eq('id', demoId).select();
  check('user cannot change their own rating', denied(ownRating.error), ownRating.error ?? ownRating.data);

  const ownVerified = await anon.from('profiles').update({ verified: true }).eq('id', demoId).select();
  check('user cannot change their own verified flag', denied(ownVerified.error), ownVerified.error ?? ownVerified.data);

  const other = await anon.from('profiles').update({ bio: 'hacked' }).eq('id', rohan.id).select();
  check("user cannot edit someone else's profile", other.error === null ? (other.data ?? []).length === 0 : denied(other.error), other.error ?? other.data);

  const ride = await anon.from('rides').insert(ridePayload('rls-test-2'));
  check('user cannot create a ride for someone else', denied(ride.error), ride.error);
}

async function refreshCheck() {
  const { error } = await admin.rpc('refresh_demo_rides');
  check('refresh_demo_rides runs', error === null, error?.message);
  const { data } = await admin.from('rides').select('departure_time').eq('is_demo', true);
  const ok = (data ?? []).length === 14 && (data ?? []).every((row) => {
    const day = new Date(Date.parse(row.departure_time) + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return day >= istDate(1) && day <= istDate(14);
  });
  check('every demo ride is 1 to 14 IST days ahead', ok);
}

async function main() {
  await dataLayerChecks();
  await rlsChecks();
  await refreshCheck();
  console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error('Check crashed:', error);
  process.exit(1);
});
