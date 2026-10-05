import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import RideForm from '@/components/rides/RideForm';
import { getCurrentUser } from '@/lib/auth';
import { createRideAction } from '@/app/rides/actions';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Offer a ride' };

const DEFAULTS = { prefAc: 'on', prefLuggage: 'on' };

export default async function NewRidePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/rides/new');

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Offer a ride</h1>
      <p className="mt-2 text-slate-600">
        Share your empty seats and split the cost of the trip. Departure must be between 1 hour and 90 days from now.
      </p>
      <div className="mt-8">
        <RideForm action={createRideAction} initial={DEFAULTS} submitLabel="Post ride" />
      </div>
    </div>
  );
}
