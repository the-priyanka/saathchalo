export const BOOKING_ERROR_CODES = [
  'not_signed_in',
  'ride_not_bookable',
  'own_ride',
  'not_enough_seats',
  'booking_exists',
  'not_allowed',
  'booking_not_pending',
  'booking_not_active',
  'unknown',
] as const;

export type BookingErrorCode = (typeof BOOKING_ERROR_CODES)[number];

export class BookingError extends Error {
  readonly code: BookingErrorCode;

  constructor(code: BookingErrorCode, detail?: string) {
    super(detail ?? code);
    this.name = 'BookingError';
    this.code = code;
  }
}

const KNOWN = BOOKING_ERROR_CODES.filter((code) => code !== 'unknown');

/** Turns a PostgREST error from a booking function into a BookingError. */
export function mapBookingError(error: { message?: string; code?: string }): BookingError {
  const message = error.message ?? '';
  const found = KNOWN.find((code) => message.includes(code));
  if (found) return new BookingError(found);
  // A permission error must not reveal whether a booking or ride exists.
  if (error.code === '42501') return new BookingError('not_allowed');
  return new BookingError('unknown', message || undefined);
}

const MESSAGES: Record<BookingErrorCode, string> = {
  not_signed_in: 'Please log in to continue.',
  ride_not_bookable: 'This ride can no longer be booked.',
  own_ride: 'You cannot book your own ride.',
  not_enough_seats: 'Not enough seats are left.',
  booking_exists: 'You already have an active booking on this ride.',
  not_allowed: 'This action is not allowed.',
  booking_not_pending: 'This request was already answered.',
  booking_not_active: 'This booking is no longer active.',
  unknown: 'Something went wrong. Please try again.',
};

export function bookingErrorMessage(code: BookingErrorCode): string {
  return MESSAGES[code];
}

export function isBookingErrorCode(value: string): value is BookingErrorCode {
  return (BOOKING_ERROR_CODES as readonly string[]).includes(value);
}
