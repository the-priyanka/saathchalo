import { describe, expect, it } from 'vitest';
import {
  BOOKING_ERROR_CODES,
  BookingError,
  bookingErrorMessage,
  isBookingErrorCode,
  mapBookingError,
} from '@/lib/booking-errors';

describe('mapBookingError', () => {
  it('maps every database message to its code', () => {
    for (const code of BOOKING_ERROR_CODES.filter((c) => c !== 'unknown')) {
      const error = mapBookingError({ message: code, code: 'P0001' });
      expect(error).toBeInstanceOf(BookingError);
      expect(error.code).toBe(code);
    }
  });

  it('finds the code inside a longer message', () => {
    expect(mapBookingError({ message: 'something: booking_exists (context)' }).code).toBe('booking_exists');
  });

  it('maps a permission error to not_allowed', () => {
    expect(mapBookingError({ message: 'permission denied for function request_booking', code: '42501' }).code).toBe('not_allowed');
  });

  it('maps everything else to unknown and keeps the detail', () => {
    const error = mapBookingError({ message: 'boom', code: '99999' });
    expect(error.code).toBe('unknown');
    expect(error.message).toBe('boom');
    expect(mapBookingError({}).code).toBe('unknown');
  });
});

describe('bookingErrorMessage', () => {
  it('has a friendly sentence for every code', () => {
    expect(bookingErrorMessage('not_signed_in')).toBe('Please log in to continue.');
    expect(bookingErrorMessage('ride_not_bookable')).toBe('This ride can no longer be booked.');
    expect(bookingErrorMessage('own_ride')).toBe('You cannot book your own ride.');
    expect(bookingErrorMessage('not_enough_seats')).toBe('Not enough seats are left.');
    expect(bookingErrorMessage('booking_exists')).toBe('You already have an active booking on this ride.');
    expect(bookingErrorMessage('not_allowed')).toBe('This action is not allowed.');
    expect(bookingErrorMessage('booking_not_pending')).toBe('This request was already answered.');
    expect(bookingErrorMessage('booking_not_active')).toBe('This booking is no longer active.');
    expect(bookingErrorMessage('unknown')).toBe('Something went wrong. Please try again.');
    for (const code of BOOKING_ERROR_CODES) expect(bookingErrorMessage(code).length).toBeGreaterThan(5);
  });
});

describe('isBookingErrorCode', () => {
  it('recognizes only known codes', () => {
    expect(isBookingErrorCode('own_ride')).toBe(true);
    expect(isBookingErrorCode('delete')).toBe(false);
    expect(isBookingErrorCode('')).toBe(false);
  });
});
