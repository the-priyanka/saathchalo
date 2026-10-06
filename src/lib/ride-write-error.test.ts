import { describe, expect, it } from 'vitest';
import { RideWriteError, mapWriteError, rideWriteMessage } from '@/lib/ride-write-error';

describe('mapWriteError', () => {
  it('maps the time window message', () => {
    const error = mapWriteError({ message: 'ride_time_window', code: 'P0001' });
    expect(error).toBeInstanceOf(RideWriteError);
    expect(error.code).toBe('time_window');
  });

  it('maps the limit message', () => {
    expect(mapWriteError({ message: 'ride_limit_reached', code: 'P0001' }).code).toBe('limit_reached');
  });

  it('maps a permission error to not_found so existence is not revealed', () => {
    expect(mapWriteError({ message: 'permission denied for table rides', code: '42501' }).code).toBe('not_found');
  });

  it('maps everything else to unknown and keeps the detail for logs', () => {
    const error = mapWriteError({ message: 'boom', code: '99999' });
    expect(error.code).toBe('unknown');
    expect(error.message).toBe('boom');
  });

  it('handles missing fields', () => {
    expect(mapWriteError({}).code).toBe('unknown');
  });
});

describe('rideWriteMessage', () => {
  it('has a friendly sentence for every code', () => {
    expect(rideWriteMessage('time_window')).toBe('Choose a departure between 1 hour and 90 days from now.');
    expect(rideWriteMessage('limit_reached')).toBe('You can have at most 10 upcoming rides. Delete one first.');
    expect(rideWriteMessage('not_found')).toBe('This ride can no longer be changed.');
    expect(rideWriteMessage('unknown')).toBe('Could not save the ride. Please try again.');
  });
});

describe('booking related ride write errors', () => {
  it('maps the edit lock and the seat floor', () => {
    expect(mapWriteError({ message: 'ride_locked', code: 'P0001' }).code).toBe('ride_locked');
    expect(mapWriteError({ message: 'seats_below_booked', code: 'P0001' }).code).toBe('seats_below_booked');
  });

  it('has friendly sentences for them', () => {
    expect(rideWriteMessage('ride_locked')).toBe(
      'This ride has bookings, so its route and time cannot be changed. Cancel the ride and post a new one instead.',
    );
    expect(rideWriteMessage('seats_below_booked')).toBe('You cannot offer fewer seats than are already booked.');
  });
});
