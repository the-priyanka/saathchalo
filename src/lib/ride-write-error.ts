export type RideWriteErrorCode = 'time_window' | 'limit_reached' | 'ride_locked' | 'seats_below_booked' | 'not_found' | 'unknown';

export class RideWriteError extends Error {
  readonly code: RideWriteErrorCode;

  constructor(code: RideWriteErrorCode, detail?: string) {
    super(detail ?? code);
    this.name = 'RideWriteError';
    this.code = code;
  }
}

/** Turns a PostgREST error from a ride write into a RideWriteError. */
export function mapWriteError(error: { message?: string; code?: string }): RideWriteError {
  const message = error.message ?? '';
  if (message.includes('ride_time_window')) return new RideWriteError('time_window');
  if (message.includes('ride_limit_reached')) return new RideWriteError('limit_reached');
  if (message.includes('ride_locked')) return new RideWriteError('ride_locked');
  if (message.includes('seats_below_booked')) return new RideWriteError('seats_below_booked');
  // A permission error must look like "not found" so a user cannot probe other people's rides.
  if (error.code === '42501') return new RideWriteError('not_found');
  return new RideWriteError('unknown', message || undefined);
}

const MESSAGES: Record<RideWriteErrorCode, string> = {
  time_window: 'Choose a departure between 1 hour and 90 days from now.',
  limit_reached: 'You can have at most 10 upcoming rides. Delete one first.',
  ride_locked:
    'This ride has bookings, so its route and time cannot be changed. Cancel the ride and post a new one instead.',
  seats_below_booked: 'You cannot offer fewer seats than are already booked.',
  not_found: 'This ride can no longer be changed.',
  unknown: 'Could not save the ride. Please try again.',
};

export function rideWriteMessage(code: RideWriteErrorCode): string {
  return MESSAGES[code];
}
