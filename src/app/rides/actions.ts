'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { createRide, deleteRide, updateRide } from '@/lib/driver-rides';
import type { FormState } from '@/lib/form-state';
import {
  rideFormRawFromFormData,
  rideRawToValues,
  validateRideInput,
} from '@/lib/ride-validation';
import { RideWriteError, rideWriteMessage } from '@/lib/ride-write-error';

function messageFor(error: unknown): string {
  return rideWriteMessage(error instanceof RideWriteError ? error.code : 'unknown');
}

export async function createRideAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/rides/new');

  const raw = rideFormRawFromFormData(formData);
  const values = rideRawToValues(raw);
  const parsed = validateRideInput(raw);
  if (!parsed.ok) return { fieldErrors: parsed.errors, values };

  try {
    await createRide(user.id, parsed.value);
  } catch (error) {
    return { error: messageFor(error), values };
  }

  revalidatePath('/my-rides');
  revalidatePath('/rides');
  redirect('/my-rides?posted=1');
}

export async function updateRideAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/my-rides/${encodeURIComponent(id)}/edit`);

  const raw = rideFormRawFromFormData(formData);
  const values = rideRawToValues(raw);
  const parsed = validateRideInput(raw);
  if (!parsed.ok) return { fieldErrors: parsed.errors, values };

  try {
    await updateRide(id, user.id, parsed.value);
  } catch (error) {
    return { error: messageFor(error), values };
  }

  revalidatePath('/my-rides');
  revalidatePath('/rides');
  revalidatePath(`/rides/${id}`);
  redirect('/my-rides?updated=1');
}

export async function deleteRideAction(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/my-rides');

  let failed = false;
  try {
    await deleteRide(id, user.id);
  } catch (error) {
    // A ride that is already gone counts as deleted. Anything else is shown on the page.
    failed = !(error instanceof RideWriteError && error.code === 'not_found');
  }

  revalidatePath('/my-rides');
  revalidatePath('/rides');
  redirect(failed ? '/my-rides?error=delete' : '/my-rides?deleted=1');
}
