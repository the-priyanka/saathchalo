import { BookingError, mapBookingError } from './booking-errors';
import {
  mapBookingRow,
  mapBookingWithPassenger,
  mapBookingWithRide,
  splitMyBookings,
  type BookingRow,
  type BookingWithPassengerRow,
  type BookingWithRideRow,
} from './booking-mapping';
import { createClient } from '@/lib/supabase/server';
import type { Booking, BookingWithPassenger, BookingWithRide } from './types';

export type BookingCounts = { pending: number; accepted: number; total: number };

export async function requestBooking(rideId: string, seats: number): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('request_booking', { p_ride_id: rideId, p_seats: seats });
  if (error) throw mapBookingError(error);
  return data as string;
}

export async function respondToBooking(bookingId: string, accept: boolean): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('respond_booking', { p_booking_id: bookingId, p_accept: accept });
  if (error) throw mapBookingError(error);
}

export async function cancelBooking(bookingId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('cancel_booking', { p_booking_id: bookingId });
  if (error) throw mapBookingError(error);
}

export async function cancelRide(rideId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('cancel_ride', { p_ride_id: rideId });
  if (error) throw mapBookingError(error);
}

export async function getMyBookingForRide(rideId: string, userId: string): Promise<Booking | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('ride_id', rideId)
    .eq('passenger_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw mapBookingError(error);
  const rows = data as unknown as BookingRow[];
  return rows.length > 0 ? mapBookingRow(rows[0]) : undefined;
}

export async function getMyBookings(
  userId: string,
): Promise<{ upcoming: BookingWithRide[]; past: BookingWithRide[] }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*, ride:rides(*, driver:profiles(*))')
    .eq('passenger_id', userId);
  if (error) throw mapBookingError(error);
  return splitMyBookings((data as unknown as BookingWithRideRow[]).map(mapBookingWithRide));
}

export async function getBookingsForRide(rideId: string): Promise<BookingWithPassenger[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*, passenger:profiles(id, full_name)')
    .eq('ride_id', rideId)
    .order('created_at', { ascending: false });
  if (error) throw mapBookingError(error);
  const bookings = (data as unknown as BookingWithPassengerRow[]).map(mapBookingWithPassenger);
  // Pending requests first, the rest keep their newest first order.
  return [...bookings].sort((a, b) => Number(b.status === 'pending') - Number(a.status === 'pending'));
}

export async function getBookingCounts(rideIds: string[]): Promise<Record<string, BookingCounts>> {
  if (rideIds.length === 0) return {};
  const supabase = await createClient();
  const { data, error } = await supabase.from('bookings').select('ride_id, status').in('ride_id', rideIds);
  if (error) throw new BookingError('unknown', error.message);

  const counts: Record<string, BookingCounts> = {};
  for (const row of data as unknown as { ride_id: string; status: string }[]) {
    const entry = (counts[row.ride_id] ??= { pending: 0, accepted: 0, total: 0 });
    entry.total += 1;
    if (row.status === 'pending') entry.pending += 1;
    if (row.status === 'accepted') entry.accepted += 1;
  }
  return counts;
}
