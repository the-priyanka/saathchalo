import { isActiveBookingStatus } from './booking-status';
import { mapRide, type RideWithDriverRow } from './ride-mapping';
import type { Booking, BookingStatus, BookingWithPassenger, BookingWithRide } from './types';

export type BookingRow = {
  id: string;
  ride_id: string;
  passenger_id: string;
  seats: number;
  status: BookingStatus;
  created_at: string;
};

export type BookingWithRideRow = BookingRow & { ride: RideWithDriverRow };
export type BookingWithPassengerRow = BookingRow & { passenger: { id: string; full_name: string } };

export function mapBookingRow(row: BookingRow): Booking {
  return {
    id: row.id,
    rideId: row.ride_id,
    passengerId: row.passenger_id,
    seats: row.seats,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function mapBookingWithRide(row: BookingWithRideRow): BookingWithRide {
  return { ...mapBookingRow(row), ride: mapRide(row.ride) };
}

export function mapBookingWithPassenger(row: BookingWithPassengerRow): BookingWithPassenger {
  return {
    ...mapBookingRow(row),
    passenger: { id: row.passenger.id, name: row.passenger.full_name },
  };
}

/** Upcoming: an active booking on an upcoming active ride (earliest first). Everything else is history (latest first). */
export function splitMyBookings(
  bookings: BookingWithRide[],
  now: number = Date.now(),
): { upcoming: BookingWithRide[]; past: BookingWithRide[] } {
  const isUpcoming = (b: BookingWithRide) =>
    isActiveBookingStatus(b.status) && b.ride.status === 'active' && Date.parse(b.ride.departureTime) > now;
  const byDeparture = (a: BookingWithRide, b: BookingWithRide) =>
    Date.parse(a.ride.departureTime) - Date.parse(b.ride.departureTime);

  return {
    upcoming: bookings.filter(isUpcoming).sort(byDeparture),
    past: bookings.filter((b) => !isUpcoming(b)).sort((a, b) => byDeparture(b, a)),
  };
}
