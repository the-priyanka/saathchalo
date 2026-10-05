import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import RideForm from '@/components/rides/RideForm';
import { updateRideAction } from '@/app/rides/actions';
import { getCurrentUser } from '@/lib/auth';
import { getMyRide } from '@/lib/driver-rides';
import { rideToFormValues } from '@/lib/ride-validation';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Edit ride' };

export default async function EditRidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/my-rides/${encodeURIComponent(id)}/edit`);

  const ride = await getMyRide(id, user.id);
  if (!ride) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Edit ride</h1>
      <p className="mt-2 text-slate-600">
        {ride.from} to {ride.to}. Changing the departure time needs a time between 1 hour and 90 days from now.
      </p>
      <div className="mt-8">
        <RideForm
          action={updateRideAction.bind(null, ride.id)}
          initial={rideToFormValues(ride)}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
