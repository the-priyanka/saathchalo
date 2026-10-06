'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { BookingError, bookingErrorMessage, type BookingErrorCode } from '@/lib/booking-errors';
import { validateSeatsRequest } from '@/lib/booking-validation';
import { cancelBooking, cancelRide, requestBooking, respondToBooking } from '@/lib/bookings';
import type { FormState } from '@/lib/form-state';

const codeOf = (error: unknown): BookingErrorCode =>
  error instanceof BookingError ? error.code : 'unknown';

export async function requestBookingAction(
  rideId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/rides/${rideId}`)}`);

  const raw = String(formData.get('seats') ?? '');
  const values = { seats: raw };
  // The database checks the real seats left. The app only checks the shape here.
  const parsed = validateSeatsRequest(raw, 6);
  if (!parsed.ok) return { fieldErrors: parsed.errors, values };

  try {
    await requestBooking(rideId, parsed.value);
  } catch (error) {
    return { error: bookingErrorMessage(codeOf(error)), values };
  }

  revalidatePath(`/rides/${rideId}`);
  revalidatePath('/rides');
  revalidatePath('/my-bookings');
  redirect('/my-bookings?requested=1');
}

export async function respondBookingAction(
  rideId: string,
  bookingId: string,
  accept: boolean,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/my-rides/${rideId}`)}`);

  let failure: BookingErrorCode | undefined;
  try {
    await respondToBooking(bookingId, accept);
  } catch (error) {
    failure = codeOf(error);
  }

  revalidatePath(`/my-rides/${rideId}`);
  revalidatePath(`/rides/${rideId}`);
  revalidatePath('/my-rides');
  redirect(
    failure
      ? `/my-rides/${encodeURIComponent(rideId)}?error=${failure}`
      : `/my-rides/${encodeURIComponent(rideId)}?notice=${accept ? 'accepted' : 'rejected'}`,
  );
}

export async function cancelBookingAction(bookingId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/my-bookings');

  let failure: BookingErrorCode | undefined;
  try {
    await cancelBooking(bookingId);
  } catch (error) {
    failure = codeOf(error);
  }

  revalidatePath('/my-bookings');
  revalidatePath('/rides');
  redirect(failure ? `/my-bookings?error=${failure}` : '/my-bookings?notice=cancelled');
}

export async function cancelRideAction(rideId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/my-rides');

  let failure: BookingErrorCode | undefined;
  try {
    await cancelRide(rideId);
  } catch (error) {
    failure = codeOf(error);
  }

  revalidatePath('/my-rides');
  revalidatePath(`/rides/${rideId}`);
  revalidatePath('/rides');
  redirect(failure ? `/my-rides?error=${failure}` : '/my-rides?notice=ride-cancelled');
}
