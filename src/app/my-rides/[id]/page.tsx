import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { cancelRideAction } from '@/app/bookings/actions';
import BookingRequestRow from '@/components/bookings/BookingRequestRow';
import CancelRideButton from '@/components/bookings/CancelRideButton';
import { getCurrentUser } from '@/lib/auth';
import { bookingErrorMessage, isBookingErrorCode } from '@/lib/booking-errors';
import { getBookingsForRide } from '@/lib/bookings';
import { getPhones } from '@/lib/contacts';
import { isRideUpcoming } from '@/lib/booking-status';
import { getOwnedRide } from '@/lib/driver-rides';
import { formatArrival, formatDate, formatINR, formatTime } from '@/lib/format';
import { firstParam } from '@/lib/safe-next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Manage ride' };

export default async function ManageRidePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/my-rides/${id}`)}`);

  const ride = await getOwnedRide(id, user.id);
  if (!ride) notFound();

  const query = await searchParams;
  const errorCode = firstParam(query.error);
  const notice = firstParam(query.notice);
  let banner: { text: string; tone: 'ok' | 'error' } | undefined;
  if (errorCode) {
    banner = { text: bookingErrorMessage(isBookingErrorCode(errorCode) ? errorCode : 'unknown'), tone: 'error' };
  } else if (notice === 'accepted') {
    banner = { text: 'Request accepted.', tone: 'ok' };
  } else if (notice === 'rejected') {
    banner = { text: 'Request rejected.', tone: 'ok' };
  }

  const bookings = await getBookingsForRide(ride.id);
  const upcoming = isRideUpcoming(ride);
  const accepted = bookings.filter((b) => b.status === 'accepted').map((b) => b.passenger.id);
  let phones: Record<string, string> = {};
  try {
    phones = await getPhones([...new Set(accepted)]);
  } catch {
    phones = {};
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/my-rides" className="text-sm font-semibold text-brand-600 hover:underline">
        Back to my rides
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">
        {ride.from} to {ride.to}
      </h1>
      <p className="mt-1 text-slate-600">
        {formatDate(ride.departureTime)}, {formatTime(ride.departureTime)} to{' '}
        {formatArrival(ride.departureTime, ride.durationMins)} · {formatINR(ride.pricePerSeat)} per seat ·{' '}
        {ride.seatsLeft} of {ride.seatsTotal} seats left
      </p>
      {ride.status === 'cancelled' && (
        <p className="mt-3 inline-block rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
          Cancelled
        </p>
      )}

      {banner && (
        <p
          role={banner.tone === 'error' ? 'alert' : 'status'}
          className={`mt-6 rounded-lg p-3 text-sm ${banner.tone === 'error' ? 'bg-red-50 text-red-700' : 'bg-accent-50 text-accent-700'}`}
        >
          {banner.text}
        </p>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Requests</h2>
        {bookings.length === 0 ? (
          <p className="mt-3 text-slate-600">No one has asked for a seat on this ride yet.</p>
        ) : (
          <ul className="mt-3 space-y-4">
            {bookings.map((booking) => (
              <li key={booking.id}>
                <BookingRequestRow booking={booking} ride={ride} upcoming={upcoming} phone={phones[booking.passenger.id]} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {upcoming && (
        <section className="mt-10 border-t border-slate-200 pt-6">
          <h2 className="text-lg font-semibold text-slate-900">Cancel this ride</h2>
          <p className="mt-1 text-sm text-slate-600">
            The ride disappears from search and every pending or accepted booking is cancelled.
          </p>
          <div className="mt-3">
            <CancelRideButton action={cancelRideAction.bind(null, ride.id)} />
          </div>
        </section>
      )}
    </div>
  );
}
