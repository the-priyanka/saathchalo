import { createClient } from '@/lib/supabase/server';
import { mapRideRow, type RideRow } from './ride-mapping';
import type { RideInput } from './ride-validation';
import { RideWriteError, mapWriteError } from './ride-write-error';
import type { Ride } from './types';

function toColumns(input: RideInput) {
  return {
    from_city: input.from,
    to_city: input.to,
    pickup_point: input.pickupPoint,
    drop_point: input.dropPoint,
    departure_time: input.departureTime,
    duration_mins: input.durationMins,
    price_per_seat: input.pricePerSeat,
    seats_total: input.seatsTotal,
    car_model: input.car.model,
    car_color: input.car.color,
    pref_ac: input.preferences.ac,
    pref_music: input.preferences.music,
    pref_pets: input.preferences.pets,
    pref_luggage: input.preferences.luggage,
  };
}

export async function getMyRides(userId: string): Promise<{ upcoming: Ride[]; past: Ride[] }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rides')
    .select('*')
    .eq('driver_id', userId)
    .order('departure_time', { ascending: true });
  if (error) throw mapWriteError(error);

  const now = Date.now();
  const rides = (data as unknown as RideRow[]).map((row) => ({
    ride: mapRideRow(row),
    time: Date.parse(row.departure_time),
  }));
  return {
    upcoming: rides.filter((r) => r.time > now).map((r) => r.ride),
    past: rides
      .filter((r) => r.time <= now)
      .reverse()
      .map((r) => r.ride),
  };
}

export async function getMyRide(id: string, userId: string): Promise<Ride | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rides')
    .select('*')
    .eq('id', id)
    .eq('driver_id', userId)
    .gt('departure_time', new Date().toISOString())
    .maybeSingle();
  if (error) throw mapWriteError(error);
  return data ? mapRideRow(data as unknown as RideRow) : undefined;
}

export async function createRide(userId: string, input: RideInput): Promise<{ id: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rides')
    .insert({ driver_id: userId, ...toColumns(input) })
    .select('id')
    .single();
  if (error) throw mapWriteError(error);
  return { id: (data as { id: string }).id };
}

export async function updateRide(id: string, userId: string, input: RideInput): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rides')
    .update(toColumns(input))
    .eq('id', id)
    .eq('driver_id', userId)
    .select('id');
  if (error) throw mapWriteError(error);
  // Zero rows means the ride is missing, not owned, or already in the past.
  if (!data || data.length === 0) throw new RideWriteError('not_found');
}

export async function deleteRide(id: string, userId: string): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rides')
    .delete()
    .eq('id', id)
    .eq('driver_id', userId)
    .select('id');
  if (error) throw mapWriteError(error);
  if (!data || data.length === 0) throw new RideWriteError('not_found');
}
