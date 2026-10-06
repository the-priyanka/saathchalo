import type { BookingStatus } from './types';

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  cancelled_by_driver: 'Cancelled by driver',
};

export function isActiveBookingStatus(status: BookingStatus): boolean {
  return status === 'pending' || status === 'accepted';
}

export type StatusTone = 'pending' | 'success' | 'danger' | 'muted';

export function bookingStatusTone(status: BookingStatus): StatusTone {
  if (status === 'accepted') return 'success';
  if (status === 'pending') return 'pending';
  if (status === 'rejected') return 'danger';
  return 'muted';
}

/** An active ride that has not left yet. A helper so components never call Date.now() themselves. */
export function isRideUpcoming(
  ride: { departureTime: string; status: string },
  now: number = Date.now(),
): boolean {
  return ride.status === 'active' && Date.parse(ride.departureTime) > now;
}

export function canPassengerCancel(status: BookingStatus, rideUpcoming: boolean): boolean {
  return rideUpcoming && isActiveBookingStatus(status);
}

export function canDriverRespond(status: BookingStatus, rideUpcoming: boolean): boolean {
  return rideUpcoming && status === 'pending';
}

export function canDriverAccept(
  status: BookingStatus,
  rideUpcoming: boolean,
  seatsLeft: number,
  seats: number,
): boolean {
  return canDriverRespond(status, rideUpcoming) && seats <= seatsLeft;
}
