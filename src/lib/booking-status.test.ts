import { describe, expect, it } from 'vitest';
import {
  BOOKING_STATUS_LABELS,
  bookingStatusTone,
  canDriverAccept,
  canDriverRespond,
  canPassengerCancel,
  isActiveBookingStatus,
  isRideUpcoming,
} from '@/lib/booking-status';

describe('isRideUpcoming', () => {
  const NOW = Date.parse('2026-10-06T04:30:00Z');

  it('is true for an active ride that has not left', () => {
    expect(isRideUpcoming({ departureTime: '2026-10-08T09:00:00+05:30', status: 'active' }, NOW)).toBe(true);
  });

  it('is false once the ride has left, even by a second', () => {
    expect(isRideUpcoming({ departureTime: '2026-10-06T10:00:00+05:30', status: 'active' }, NOW)).toBe(false);
    expect(isRideUpcoming({ departureTime: '2026-10-06T09:59:59+05:30', status: 'active' }, NOW)).toBe(false);
    expect(isRideUpcoming({ departureTime: '2026-10-06T10:00:01+05:30', status: 'active' }, NOW)).toBe(true);
  });

  it('is false for a cancelled ride', () => {
    expect(isRideUpcoming({ departureTime: '2026-10-08T09:00:00+05:30', status: 'cancelled' }, NOW)).toBe(false);
  });
});

describe('booking status', () => {
  it('has a label for every status', () => {
    expect(BOOKING_STATUS_LABELS).toEqual({
      pending: 'Pending',
      accepted: 'Accepted',
      rejected: 'Rejected',
      cancelled: 'Cancelled',
      cancelled_by_driver: 'Cancelled by driver',
    });
  });

  it('treats only pending and accepted as active', () => {
    expect(isActiveBookingStatus('pending')).toBe(true);
    expect(isActiveBookingStatus('accepted')).toBe(true);
    for (const status of ['rejected', 'cancelled', 'cancelled_by_driver'] as const) {
      expect(isActiveBookingStatus(status)).toBe(false);
    }
  });

  it('maps statuses to tones', () => {
    expect(bookingStatusTone('pending')).toBe('pending');
    expect(bookingStatusTone('accepted')).toBe('success');
    expect(bookingStatusTone('rejected')).toBe('danger');
    expect(bookingStatusTone('cancelled')).toBe('muted');
    expect(bookingStatusTone('cancelled_by_driver')).toBe('muted');
  });

  it('lets a passenger cancel active bookings on upcoming rides only', () => {
    expect(canPassengerCancel('pending', true)).toBe(true);
    expect(canPassengerCancel('accepted', true)).toBe(true);
    expect(canPassengerCancel('pending', false)).toBe(false);
    expect(canPassengerCancel('rejected', true)).toBe(false);
    expect(canPassengerCancel('cancelled', true)).toBe(false);
  });

  it('lets a driver respond only to pending requests on upcoming rides', () => {
    expect(canDriverRespond('pending', true)).toBe(true);
    expect(canDriverRespond('pending', false)).toBe(false);
    expect(canDriverRespond('accepted', true)).toBe(false);
  });

  it('lets a driver accept only when enough seats are left', () => {
    expect(canDriverAccept('pending', true, 3, 3)).toBe(true);
    expect(canDriverAccept('pending', true, 2, 3)).toBe(false);
    expect(canDriverAccept('pending', false, 5, 1)).toBe(false);
    expect(canDriverAccept('accepted', true, 5, 1)).toBe(false);
  });
});
