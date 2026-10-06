import { randomUUID } from 'node:crypto';
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

const HOUR_MS = 60 * 60 * 1000;
const inHours = (hours: number) => new Date(Date.now() + hours * HOUR_MS).toISOString();

const goodRide = (driverId: string, overrides: Record<string, unknown> = {}) => ({
  driver_id: driverId,
  from_city: 'Delhi',
  to_city: 'Jaipur',
  pickup_point: 'Kashmere Gate',
  drop_point: 'Sindhi Camp',
  departure_time: inHours(48),
  duration_mins: 330,
  price_per_seat: 500,
  seats_total: 3,
  car_model: 'Maruti Swift',
  car_color: 'White',
  pref_ac: true,
  pref_music: false,
  pref_pets: false,
  pref_luggage: true,
  ...overrides,
});

async function driverRideChecks() {
  const { data: me } = await anon.auth.getUser();
  const demoId = me.user?.id;
  if (!demoId) {
    check('demo user is signed in for the driver ride checks', false);
    return;
  }
  const code = (error: { code?: string; message?: string } | null) => error?.code;
  const message = (error: { message?: string } | null) => error?.message ?? '';

  let foreignDriverId: string | undefined;
  try {
    // Create, read back, update, and the seats rule.
    const created = await anon.from('rides').insert(goodRide(demoId)).select('id, seats_left, seats_total').single();
    const rideId = created.data?.id as string | undefined;
    check('user can create a valid ride', created.error === null && typeof rideId === 'string', created.error);
    if (!rideId) return;
    check('created ride gets a generated id and all seats free', created.data?.seats_left === 3 && created.data?.seats_total === 3 && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rideId), created.data);
    check('created ride appears in search', ids(await searchRides({ from: 'Delhi', to: 'Jaipur' })).includes(rideId));

    const priceUpdate = await anon.from('rides').update({ price_per_seat: 600 }).eq('id', rideId).select('price_per_seat');
    check('user can edit their own upcoming ride', priceUpdate.error === null && priceUpdate.data?.[0]?.price_per_seat === 600, priceUpdate.error);
    const seatsUpdate = await anon.from('rides').update({ seats_total: 4 }).eq('id', rideId).select('seats_left, seats_total');
    check('seats_left follows seats_total on update', seatsUpdate.data?.[0]?.seats_left === 4 && seatsUpdate.data?.[0]?.seats_total === 4, seatsUpdate.data);
    const edited = await getRide(rideId);
    check('edited ride shows the new price in search data', edited?.pricePerSeat === 600);

    // Columns clients must never write.
    const withId = await anon.from('rides').insert({ ...goodRide(demoId), id: 'custom-id' });
    check('user cannot choose the ride id', code(withId.error) === '42501', withId.error);
    const withDemo = await anon.from('rides').insert({ ...goodRide(demoId), is_demo: true });
    check('user cannot set is_demo', code(withDemo.error) === '42501', withDemo.error);
    const withSeatsLeft = await anon.from('rides').insert({ ...goodRide(demoId), seats_left: 1 });
    check('user cannot set seats_left', code(withSeatsLeft.error) === '42501', withSeatsLeft.error);

    // Protected columns cannot be changed by an update either.
    const protectedUpdates: [string, Record<string, unknown>][] = [
      ['seats_left', { seats_left: 1 }],
      ['is_demo', { is_demo: true }],
      ['id', { id: 'x' }],
      ['created_at', { created_at: new Date().toISOString() }],
      ['driver_id', { driver_id: '00000000-0000-0000-0000-000000000000' }],
    ];
    for (const [column, change] of protectedUpdates) {
      const result = await anon.from('rides').update(change).eq('id', rideId).select('id');
      check(`database rejects updating ${column}`, code(result.error) === '42501', result.error);
    }

    // Constraints (check violation is 23514).
    const bad: [string, Record<string, unknown>][] = [
      ['price below 50', { price_per_seat: 49 }],
      ['price above 5000', { price_per_seat: 5001 }],
      ['zero seats', { seats_total: 0 }],
      ['seven seats', { seats_total: 7 }],
      ['duration below 15 minutes', { duration_mins: 14 }],
      ['duration above 24 hours', { duration_mins: 1441 }],
      ['same city on both sides', { to_city: 'delhi ' }],
      ['one letter city', { from_city: 'D' }],
      ['two letter pickup', { pickup_point: 'ab' }],
    ];
    for (const [label, overrides] of bad) {
      const result = await anon.from('rides').insert(goodRide(demoId, overrides));
      check(`database rejects ${label}`, code(result.error) === '23514', result.error);
    }

    // Time window.
    for (const [label, hours] of [['30 minutes ahead', 0.5], ['91 days ahead', 91 * 24], ['in the past', -5]] as [string, number][]) {
      const result = await anon.from('rides').insert(goodRide(demoId, { departure_time: inHours(hours) }));
      check(`database rejects a departure ${label}`, message(result.error).includes('ride_time_window'), result.error);
    }
    const moveToPast = await anon.from('rides').update({ departure_time: inHours(0.5) }).eq('id', rideId).select('id');
    check('database rejects moving an upcoming ride into the next hour', message(moveToPast.error).includes('ride_time_window'), moveToPast.error ?? moveToPast.data);

    // Other people's rides.
    // If one of these fails the demo ride may be changed: run npm run db:seed to restore it.
    const foreignUpdate = await anon.from('rides').update({ price_per_seat: 100 }).eq('id', 'r1').select('id');
    check("user cannot edit someone else's ride", foreignUpdate.error !== null || (foreignUpdate.data ?? []).length === 0, foreignUpdate.error ?? foreignUpdate.data);
    const foreignDelete = await anon.from('rides').delete().eq('id', 'r1').select('id');
    check("user cannot delete someone else's ride", foreignDelete.error !== null || (foreignDelete.data ?? []).length === 0, foreignDelete.error ?? foreignDelete.data);
    check('demo ride r1 is untouched', (await getRide('r1'))?.pricePerSeat === 450);
    foreignDriverId = (await getRide('r1'))?.driverId;
    const forOther = foreignDriverId ? await anon.from('rides').insert(goodRide(foreignDriverId)) : null;
    check('user cannot post a ride as someone else', forOther !== null && code(forOther.error) === '42501', forOther?.error);

    // Past rides are read only. The service role can create one because it skips the time rules.
    const past = await admin.from('rides').insert(goodRide(demoId, { departure_time: inHours(-48) })).select('id').single();
    const pastId = past.data?.id as string | undefined;
    check('service role can create a past ride for the test', past.error === null && typeof pastId === 'string', past.error);
    if (pastId) {
      const pastUpdate = await anon.from('rides').update({ price_per_seat: 100 }).eq('id', pastId).select('id');
      check('user cannot edit a past ride', pastUpdate.error !== null || (pastUpdate.data ?? []).length === 0, pastUpdate.error ?? pastUpdate.data);
      const pastDelete = await anon.from('rides').delete().eq('id', pastId).select('id');
      check('user cannot delete a past ride', pastDelete.error !== null || (pastDelete.data ?? []).length === 0, pastDelete.error ?? pastDelete.data);
      const stillThere = await admin.from('rides').select('id').eq('id', pastId);
      check('the past ride is still there', (stillThere.data ?? []).length === 1);
    }

    // Limit of 10 upcoming rides (one already exists).
    let createdMore = 0;
    for (let i = 0; i < 9; i++) {
      const result = await anon.from('rides').insert(goodRide(demoId, { departure_time: inHours(50 + i) }));
      if (result.error === null) createdMore += 1;
    }
    check('user can create up to 10 upcoming rides', createdMore === 9, createdMore);
    const eleventh = await anon.from('rides').insert(goodRide(demoId, { departure_time: inHours(70) }));
    check('the 11th upcoming ride is rejected', message(eleventh.error).includes('ride_limit_reached'), eleventh.error);

    // Delete and the nightly cleanup of rides posted from the demo account.
    const ownDelete = await anon.from('rides').delete().eq('id', rideId).select('id');
    check('user can delete their own upcoming ride', ownDelete.error === null && (ownDelete.data ?? []).length === 1, ownDelete.error);

    const refreshed = await admin.rpc('refresh_demo_rides');
    check('refresh_demo_rides runs after the migration', refreshed.error === null, refreshed.error?.message);
    const leftovers = await admin.from('rides').select('id').eq('driver_id', demoId).eq('is_demo', false);
    check('refresh removes rides posted from the demo account', (leftovers.data ?? []).length === 0, leftovers.data);
    const demoRides = await admin.from('rides').select('id').eq('is_demo', true);
    check('the 14 demo rides are kept', (demoRides.data ?? []).length === 14, demoRides.data?.length);
  } finally {
    // Always clean up everything this block created, even if a check crashed.
    await admin.from('rides').delete().eq('driver_id', demoId).eq('is_demo', false);
    if (foreignDriverId) await admin.from('rides').delete().eq('driver_id', foreignDriverId).eq('is_demo', false);
  }
}

type TestUser = { id: string; email: string; client: typeof anon };

async function findUserIdByEmail(email: string): Promise<string | undefined> {
  const perPage = 200;
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (hit) return hit.id;
    if (data.users.length < perPage) return undefined;
  }
  return undefined;
}

/** Creates a confirmed test user (replacing a leftover from a crashed run) and signs it in. */
async function createTestUser(email: string, fullName: string): Promise<TestUser> {
  const stale = await findUserIdByEmail(email);
  if (stale) await admin.auth.admin.deleteUser(stale);
  const password = randomUUID();
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (created.error || !created.data.user) throw created.error ?? new Error(`Could not create ${email}`);
  const client = createClient(url as string, anonKey as string, options);
  const signedIn = await client.auth.signInWithPassword({ email, password });
  if (signedIn.error) throw signedIn.error;
  return { id: created.data.user.id, email, client };
}

const seatsLeftOf = async (rideId: string) =>
  (await admin.from('rides').select('seats_left').eq('id', rideId).single()).data?.seats_left;

async function bookingChecks() {
  const users: TestUser[] = [];
  const message = (error: { message?: string } | null) => error?.message ?? '';
  const code = (error: { code?: string } | null) => error?.code;

  try {
    const driver = await createTestUser('check-driver@saathchalo.test', 'Check Driver');
    users.push(driver);
    const passenger = await createTestUser('check-passenger@saathchalo.test', 'Check Passenger');
    users.push(passenger);
    const demo = anon; // signed in as the demo user by the earlier checks

    const created = await admin
      .from('rides')
      .insert(goodRide(driver.id, { seats_total: 4 }))
      .select('id')
      .single();
    const rideId = created.data?.id as string | undefined;
    check('service role can create a ride for the booking checks', created.error === null && typeof rideId === 'string', created.error);
    if (!rideId) return;
    check('a new ride has all seats free', (await seatsLeftOf(rideId)) === 4);

    // Requests.
    const b1 = await passenger.client.rpc('request_booking', { p_ride_id: rideId, p_seats: 2 });
    check('passenger can request seats', b1.error === null && typeof b1.data === 'string', b1.error);
    check('a pending request does not change seats_left', (await seatsLeftOf(rideId)) === 4);

    const own = await driver.client.rpc('request_booking', { p_ride_id: rideId, p_seats: 1 });
    check('a driver cannot request their own ride', message(own.error).includes('own_ride'), own.error);
    const dup = await passenger.client.rpc('request_booking', { p_ride_id: rideId, p_seats: 1 });
    check('a second active request on the same ride is rejected', message(dup.error).includes('booking_exists'), dup.error);
    const tooMany = await demo.rpc('request_booking', { p_ride_id: rideId, p_seats: 5 });
    check('requesting more seats than are left is rejected', message(tooMany.error).includes('not_enough_seats'), tooMany.error);
    const zero = await demo.rpc('request_booking', { p_ride_id: rideId, p_seats: 0 });
    check('requesting zero seats is rejected', message(zero.error).includes('not_enough_seats'), zero.error);
    const unknownRide = await demo.rpc('request_booking', { p_ride_id: 'does-not-exist', p_seats: 1 });
    check('requesting an unknown ride is rejected', message(unknownRide.error).includes('ride_not_bookable'), unknownRide.error);
    const signedOut = await createClient(url as string, anonKey as string, options).rpc('request_booking', { p_ride_id: rideId, p_seats: 1 });
    check('a signed-out visitor cannot call request_booking', code(signedOut.error) === '42501', signedOut.error);

    const b2 = await demo.rpc('request_booking', { p_ride_id: rideId, p_seats: 3 });
    check('a second passenger can request seats', b2.error === null && typeof b2.data === 'string', b2.error);
    const b1Id = b1.data as string;
    const b2Id = b2.data as string;

    // Privacy and write protection.
    const seenByPassenger = await passenger.client.from('bookings').select('id');
    check('a passenger sees only their own bookings', same((seenByPassenger.data ?? []).map((b) => b.id), [b1Id]), seenByPassenger.data);
    const seenByDriver = await driver.client.from('bookings').select('id').eq('ride_id', rideId);
    check('the driver sees every booking on their ride', (seenByDriver.data ?? []).length === 2, seenByDriver.data);
    const insertDirect = await passenger.client.from('bookings').insert({ ride_id: rideId, passenger_id: passenger.id, seats: 1 });
    check('a client cannot insert into bookings', code(insertDirect.error) === '42501', insertDirect.error);
    const updateDirect = await passenger.client.from('bookings').update({ status: 'accepted' }).eq('id', b1Id).select('id');
    check('a client cannot update bookings', code(updateDirect.error) === '42501', updateDirect.error);
    const deleteDirect = await passenger.client.from('bookings').delete().eq('id', b1Id).select('id');
    check('a client cannot delete bookings', code(deleteDirect.error) === '42501', deleteDirect.error);

    // Responses.
    const wrongResponder = await demo.rpc('respond_booking', { p_booking_id: b1Id, p_accept: true });
    check('only the driver can respond', message(wrongResponder.error).includes('not_allowed'), wrongResponder.error);
    const wrongCanceller = await passenger.client.rpc('cancel_booking', { p_booking_id: b2Id });
    check("a passenger cannot cancel someone else's booking", message(wrongCanceller.error).includes('not_allowed'), wrongCanceller.error);

    const acceptB2 = await driver.client.rpc('respond_booking', { p_booking_id: b2Id, p_accept: true });
    check('the driver can accept a request', acceptB2.error === null, acceptB2.error);
    check('accepting reduces seats_left', (await seatsLeftOf(rideId)) === 1);
    const acceptAgain = await driver.client.rpc('respond_booking', { p_booking_id: b2Id, p_accept: true });
    check('a request cannot be answered twice', message(acceptAgain.error).includes('booking_not_pending'), acceptAgain.error);
    const acceptTooMany = await driver.client.rpc('respond_booking', { p_booking_id: b1Id, p_accept: true });
    check('accepting more seats than are left is rejected', message(acceptTooMany.error).includes('not_enough_seats'), acceptTooMany.error);
    const reject = await driver.client.rpc('respond_booking', { p_booking_id: b1Id, p_accept: false });
    check('the driver can reject a request', reject.error === null, reject.error);
    check('a rejected request leaves seats alone', (await seatsLeftOf(rideId)) === 1);

    // Cancel by the passenger.
    const cancelB2 = await demo.rpc('cancel_booking', { p_booking_id: b2Id });
    check('a passenger can cancel an accepted booking', cancelB2.error === null, cancelB2.error);
    check('cancelling an accepted booking returns the seats', (await seatsLeftOf(rideId)) === 4);
    const cancelAgain = await demo.rpc('cancel_booking', { p_booking_id: b2Id });
    check('a cancelled booking cannot be cancelled again', message(cancelAgain.error).includes('booking_not_active'), cancelAgain.error);

    // A rejected request frees the passenger to ask again.
    const b3 = await passenger.client.rpc('request_booking', { p_ride_id: rideId, p_seats: 2 });
    check('a passenger can request again after a rejection', b3.error === null && typeof b3.data === 'string', b3.error);
    const b3Id = b3.data as string;

    // Edit lock and seat floor while a booking is active.
    const moveTime = await driver.client.from('rides').update({ departure_time: inHours(72) }).eq('id', rideId).select('id');
    check('the departure of a ride with bookings is locked', message(moveTime.error).includes('ride_locked'), moveTime.error ?? moveTime.data);
    const moveRoute = await driver.client.from('rides').update({ from_city: 'Agra' }).eq('id', rideId).select('id');
    check('the route of a ride with bookings is locked', message(moveRoute.error).includes('ride_locked'), moveRoute.error ?? moveRoute.data);
    const price = await driver.client.from('rides').update({ price_per_seat: 600 }).eq('id', rideId).select('price_per_seat');
    check('the price of a ride with bookings can still change', price.error === null && price.data?.[0]?.price_per_seat === 600, price.error);
    const acceptB3 = await driver.client.rpc('respond_booking', { p_booking_id: b3Id, p_accept: true });
    check('the driver accepts the new request', acceptB3.error === null && (await seatsLeftOf(rideId)) === 2, acceptB3.error);
    const belowBooked = await driver.client.from('rides').update({ seats_total: 1 }).eq('id', rideId).select('id');
    check('seats cannot drop below the booked seats', message(belowBooked.error).includes('seats_below_booked'), belowBooked.error ?? belowBooked.data);
    const moreSeats = await driver.client.from('rides').update({ seats_total: 6 }).eq('id', rideId).select('seats_left, seats_total');
    check('raising seats keeps seats_left consistent', moreSeats.data?.[0]?.seats_left === 4 && moreSeats.data?.[0]?.seats_total === 6, moreSeats.error ?? moreSeats.data);

    // Delete is blocked once a ride had bookings.
    const deleteWithBookings = await driver.client.from('rides').delete().eq('id', rideId).select('id');
    const stillThere = await admin.from('rides').select('id').eq('id', rideId);
    check('a ride with bookings cannot be deleted', (deleteWithBookings.data ?? []).length === 0 && (stillThere.data ?? []).length === 1, deleteWithBookings.error ?? deleteWithBookings.data);

    // Cancel ride.
    const wrongRideCanceller = await passenger.client.rpc('cancel_ride', { p_ride_id: rideId });
    check('only the driver can cancel a ride', message(wrongRideCanceller.error).includes('not_allowed'), wrongRideCanceller.error);
    const cancelRide = await driver.client.rpc('cancel_ride', { p_ride_id: rideId });
    check('the driver can cancel a ride', cancelRide.error === null, cancelRide.error);
    const afterCancel = await admin.from('bookings').select('status').eq('id', b3Id).single();
    check('cancelling a ride cancels its active bookings', afterCancel.data?.status === 'cancelled_by_driver', afterCancel.data);
    const rideStatus = await admin.from('rides').select('status').eq('id', rideId).single();
    check('a cancelled ride has the cancelled status', rideStatus.data?.status === 'cancelled', rideStatus.data);
    check('a cancelled ride is hidden from search', !ids(await searchRides({ from: 'Delhi', to: 'Jaipur' })).includes(rideId));
    const cancelTwice = await driver.client.rpc('cancel_ride', { p_ride_id: rideId });
    check('a cancelled ride cannot be cancelled again', message(cancelTwice.error).includes('ride_not_bookable'), cancelTwice.error);
    const requestCancelled = await demo.rpc('request_booking', { p_ride_id: rideId, p_seats: 1 });
    check('a cancelled ride cannot be booked', message(requestCancelled.error).includes('ride_not_bookable'), requestCancelled.error);

    // Past rides cannot be booked.
    const past = await admin.from('rides').insert(goodRide(driver.id, { departure_time: inHours(-48) })).select('id').single();
    const pastRequest = await passenger.client.rpc('request_booking', { p_ride_id: past.data?.id as string, p_seats: 1 });
    check('a ride that has left cannot be booked', message(pastRequest.error).includes('ride_not_bookable'), pastRequest.error);

    // Demo rides confirm instantly and reset every night.
    const before = await seatsLeftOf('r1');
    const demoBooking = await passenger.client.rpc('request_booking', { p_ride_id: 'r1', p_seats: 1 });
    const demoStatus = await admin.from('bookings').select('status').eq('id', demoBooking.data as string).single();
    check('a request on a demo ride is accepted at once', demoBooking.error === null && demoStatus.data?.status === 'accepted', demoBooking.error ?? demoStatus.data);
    check('a demo booking reduces its seats', (await seatsLeftOf('r1')) === (before ?? 0) - 1);
    const demoCancel = await passenger.client.rpc('cancel_booking', { p_booking_id: demoBooking.data as string });
    check('a demo booking can be cancelled and returns its seat', demoCancel.error === null && (await seatsLeftOf('r1')) === before);
    await passenger.client.rpc('request_booking', { p_ride_id: 'r1', p_seats: 1 });
    await admin.rpc('refresh_demo_rides');
    const leftover = await admin.from('bookings').select('id').eq('ride_id', 'r1');
    check('the nightly refresh clears bookings on demo rides', (leftover.data ?? []).length === 0, leftover.data);
    check('the nightly refresh restores demo seats', (await seatsLeftOf('r1')) === before);
  } finally {
    // Deleting the test users removes their profiles, rides, and bookings (cascade), even if a check crashed.
    for (const user of users) await admin.auth.admin.deleteUser(user.id);
    await admin.rpc('refresh_demo_rides');
  }
}

async function main() {
  const reset = await admin.rpc('refresh_demo_rides');
  check('refresh_demo_rides clears posts from the demo account before the checks', reset.error === null, reset.error?.message);
  await dataLayerChecks();
  await rlsChecks();
  await driverRideChecks();
  await bookingChecks();
  await refreshCheck();
  console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error('Check crashed:', error);
  process.exit(1);
});
