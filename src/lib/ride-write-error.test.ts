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
