import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BookingCard from '@/components/rides/BookingCard';
import DriverCard from '@/components/rides/DriverCard';
import RideFeatures from '@/components/rides/RideFeatures';
import RouteTimeline from '@/components/rides/RouteTimeline';
import { getCurrentUser } from '@/lib/auth';
import { getMyBookingForRide } from '@/lib/bookings';
import { getPhones } from '@/lib/contacts';
import { getRide } from '@/lib/rides';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ride = await getRide((await params).id);
  return { title: ride ? `${ride.from} to ${ride.to}` : 'Ride not found' };
}

export default async function RideDetailsPage({ params }: Props) {
  const { id } = await params;
  const ride = await getRide(id);
  if (!ride) notFound();

  const user = await getCurrentUser();
  let myBooking;
  if (user) {
    try {
      myBooking = await getMyBookingForRide(ride.id, user.id);
    } catch {
      // A failed booking lookup must not hide the ride itself.
      myBooking = undefined;
    }
  }

  let driverPhone: string | undefined;
  if (myBooking?.status === 'accepted') {
    try {
      driverPhone = (await getPhones([ride.driverId]))[ride.driverId];
    } catch {
      driverPhone = undefined;
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
        {ride.from} to {ride.to}
      </h1>
      {ride.status === 'cancelled' && (
        <p className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
          Cancelled
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <RouteTimeline ride={ride} />
          <DriverCard driver={ride.driver} />
          <RideFeatures ride={ride} />
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <BookingCard ride={ride} viewerId={user?.id ?? null} myBooking={myBooking} driverPhone={driverPhone} />
        </div>
      </div>
    </div>
  );
}
