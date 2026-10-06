import { describe, expect, it } from 'vitest';
import { mapProfile, mapRide, mapRideRow, toIstIso, type ProfileRow, type RideWithDriverRow } from '@/lib/ride-mapping';

const profile: ProfileRow = {
  id: '11111111-1111-1111-1111-111111111111',
  full_name: 'Rohan Mehta',
  bio: 'Calm driver',
  avatar_url: null,
  rating: 4.8,
  review_count: 126,
  verified: true,
  member_since: 2022,
};

const row: RideWithDriverRow = {
  id: 'r1',
  driver_id: profile.id,
  from_city: 'Delhi',
  to_city: 'Chandigarh',
  pickup_point: 'Kashmere Gate ISBT',
  drop_point: 'Sector 17 ISBT',
  departure_time: '2026-10-02T01:00:00+00:00',
  duration_mins: 300,
  price_per_seat: 450,
  seats_left: 3,
  seats_total: 4,
  car_model: 'Maruti Swift',
  car_color: 'White',
  pref_ac: true,
  pref_music: true,
  pref_pets: false,
  pref_luggage: true,
  status: 'active',
  driver: profile,
};

describe('toIstIso', () => {
  it('converts a UTC instant to an IST ISO string', () => {
    expect(toIstIso('2026-10-02T01:00:00+00:00')).toBe('2026-10-02T06:30:00+05:30');
  });

  it('rolls the date over when IST is past midnight', () => {
    expect(toIstIso('2026-10-01T18:30:00Z')).toBe('2026-10-02T00:00:00+05:30');
  });

  it('accepts instants that already carry an offset', () => {
    expect(toIstIso('2026-10-02T06:30:00+05:30')).toBe('2026-10-02T06:30:00+05:30');
  });
});

describe('mapProfile', () => {
  it('maps snake_case profile columns to a Driver', () => {
    expect(mapProfile(profile)).toEqual({
      id: profile.id,
      name: 'Rohan Mehta',
      photo: null,
      rating: 4.8,
      reviewCount: 126,
      verified: true,
      memberSince: 2022,
      bio: 'Calm driver',
    });
  });

  it('turns a numeric string rating into a number', () => {
    expect(mapProfile({ ...profile, rating: '4.5' as unknown as number }).rating).toBe(4.5);
  });
});

describe('mapRide', () => {
  it('maps a joined row to a RideWithDriver with an IST departure time', () => {
    const ride = mapRide(row);
    expect(ride).toMatchObject({
      id: 'r1',
      from: 'Delhi',
      to: 'Chandigarh',
      pickupPoint: 'Kashmere Gate ISBT',
      dropPoint: 'Sector 17 ISBT',
      departureTime: '2026-10-02T06:30:00+05:30',
      durationMins: 300,
      pricePerSeat: 450,
      seatsLeft: 3,
      seatsTotal: 4,
      driverId: profile.id,
      car: { model: 'Maruti Swift', color: 'White' },
      preferences: { ac: true, music: true, pets: false, luggage: true },
    });
    expect(ride.driver.name).toBe('Rohan Mehta');
  });
});

describe('mapRideRow', () => {
  it('maps a ride row to a ride and never includes a joined driver', () => {
    const ride = mapRideRow(row);
    expect(ride).toEqual({
      id: 'r1',
      from: 'Delhi',
      to: 'Chandigarh',
      pickupPoint: 'Kashmere Gate ISBT',
      dropPoint: 'Sector 17 ISBT',
      departureTime: '2026-10-02T06:30:00+05:30',
      durationMins: 300,
      pricePerSeat: 450,
      seatsLeft: 3,
      seatsTotal: 4,
      driverId: profile.id,
      status: 'active',
      car: { model: 'Maruti Swift', color: 'White' },
      preferences: { ac: true, music: true, pets: false, luggage: true },
    });
    expect('driver' in ride).toBe(false);
  });

  it('maps a cancelled ride', () => {
    expect(mapRideRow({ ...row, status: 'cancelled' }).status).toBe('cancelled');
  });
});
