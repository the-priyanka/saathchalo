import { describe, expect, it } from 'vitest';
import {
  mapBookingRow,
  mapBookingWithPassenger,
  mapBookingWithRide,
  splitMyBookings,
  type BookingRow,
  type BookingWithRideRow,
} from '@/lib/booking-mapping';
import type { BookingWithRide } from '@/lib/types';

const row: BookingRow = {
  id: 'b1',
  ride_id: 'r1',
  passenger_id: 'p1',
  seats: 2,
  status: 'pending',
  created_at: '2026-10-06T04:30:00+00:00',
};

describe('booking mapping', () => {
  it('maps a booking row', () => {
    expect(mapBookingRow(row)).toEqual({
      id: 'b1',
      rideId: 'r1',
      passengerId: 'p1',
      seats: 2,
      status: 'pending',
      createdAt: '2026-10-06T04:30:00+00:00',
    });
  });

  it('maps a booking with its passenger', () => {
    const mapped = mapBookingWithPassenger({ ...row, passenger: { id: 'p1', full_name: 'Asha Rao' } });
    expect(mapped.passenger).toEqual({ id: 'p1', name: 'Asha Rao' });
    expect(mapped.seats).toBe(2);
  });

  it('maps a booking with its ride and driver', () => {
    const rideRow = {
      id: 'r1', driver_id: 'd1', from_city: 'Delhi', to_city: 'Jaipur', pickup_point: 'Kashmere Gate',
      drop_point: 'Sindhi Camp', departure_time: '2026-10-09T03:30:00+00:00', duration_mins: 330,
      price_per_seat: 500, seats_left: 2, seats_total: 4, car_model: 'Swift', car_color: 'White',
      pref_ac: true, pref_music: false, pref_pets: false, pref_luggage: true, status: 'active' as const,
      driver: { id: 'd1', full_name: 'Rohan', bio: '', avatar_url: null, rating: 4.8, review_count: 3, verified: true, member_since: 2022 },
    };
    const mapped = mapBookingWithRide({ ...row, ride: rideRow } as BookingWithRideRow);
    expect(mapped.ride.from).toBe('Delhi');
    expect(mapped.ride.departureTime).toBe('2026-10-09T09:00:00+05:30');
    expect(mapped.ride.driver.name).toBe('Rohan');
  });
});

describe('splitMyBookings', () => {
  const NOW = Date.parse('2026-10-06T04:30:00Z');
  const make = (id: string, status: BookingWithRide['status'], departure: string, rideStatus: 'active' | 'cancelled' = 'active') =>
    ({
      id,
      rideId: id,
      passengerId: 'p',
      seats: 1,
      status,
      createdAt: '2026-10-05T00:00:00Z',
      ride: { departureTime: departure, status: rideStatus },
    }) as unknown as BookingWithRide;

  it('puts active bookings on upcoming active rides into upcoming, earliest first', () => {
    const result = splitMyBookings(
      [
        make('later', 'accepted', '2026-10-12T09:00:00+05:30'),
        make('sooner', 'pending', '2026-10-08T09:00:00+05:30'),
      ],
      NOW,
    );
    expect(result.upcoming.map((b) => b.id)).toEqual(['sooner', 'later']);
    expect(result.past).toEqual([]);
  });

  it('puts finished, terminal, and cancelled-ride bookings into past, latest first', () => {
    const result = splitMyBookings(
      [
        make('old', 'accepted', '2026-10-01T09:00:00+05:30'),
        make('rejected', 'rejected', '2026-10-10T09:00:00+05:30'),
        make('ride-cancelled', 'cancelled_by_driver', '2026-10-11T09:00:00+05:30', 'cancelled'),
        make('cancelled-ride-still-active-status', 'pending', '2026-10-12T09:00:00+05:30', 'cancelled'),
      ],
      NOW,
    );
    expect(result.upcoming).toEqual([]);
    expect(result.past.map((b) => b.id)).toEqual([
      'cancelled-ride-still-active-status',
      'ride-cancelled',
      'rejected',
      'old',
    ]);
  });
});
