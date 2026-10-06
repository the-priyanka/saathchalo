import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import MyRideCard from '@/components/rides/MyRideCard';
import { getCurrentUser } from '@/lib/auth';
import { bookingErrorMessage, isBookingErrorCode } from '@/lib/booking-errors';
import { getBookingCounts, type BookingCounts } from '@/lib/bookings';
import { getMyRides } from '@/lib/driver-rides';
import { firstParam } from '@/lib/safe-next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'My rides' };

const NOTICES: Record<string, { text: string; tone: 'ok' | 'error' }> = {
  posted: { text: 'Your ride is posted and visible in search.', tone: 'ok' },
  updated: { text: 'Your ride was updated.', tone: 'ok' },
  deleted: { text: 'Your ride was deleted.', tone: 'ok' },
};

export default async function MyRidesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/my-rides');

  const params = await searchParams;
  const errorCode = firstParam(params.error);
  let notice: { text: string; tone: 'ok' | 'error' } | undefined;
  if (errorCode) {
    notice = {
      text: bookingErrorMessage(isBookingErrorCode(errorCode) ? errorCode : 'unknown'),
      tone: 'error',
    };
  } else if (firstParam(params.notice) === 'ride-cancelled') {
    notice = { text: 'Your ride was cancelled and its bookings were cancelled with it.', tone: 'ok' };
  } else {
    const key = ['posted', 'updated', 'deleted'].find((k) => firstParam(params[k]));
    notice = key ? NOTICES[key] : undefined;
  }
  const { upcoming, past } = await getMyRides(user.id);
  let counts: Record<string, BookingCounts> = {};
  try {
    counts = await getBookingCounts([...upcoming, ...past].map((ride) => ride.id));
  } catch {
    // The list still works without the booking counts.
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">My rides</h1>
        <Link
          href="/rides/new"
          className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Offer a ride
        </Link>
      </div>

      {notice && (
        <p
          role={notice.tone === 'error' ? 'alert' : 'status'}
          className={`mt-6 rounded-lg p-3 text-sm ${notice.tone === 'error' ? 'bg-red-50 text-red-700' : 'bg-accent-50 text-accent-700'}`}
        >
          {notice.text}
        </p>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-slate-300 p-6 text-slate-600">
            You have no upcoming rides.{' '}
            <Link href="/rides/new" className="font-semibold text-brand-600 hover:underline">
              Offer a ride
            </Link>
          </p>
        ) : (
          <ul className="mt-3 space-y-4">
            {upcoming.map((ride) => (
              <li key={ride.id}>
                <MyRideCard ride={ride} editable counts={counts[ride.id]} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Past</h2>
        {past.length === 0 ? (
          <p className="mt-3 text-slate-600">No past rides yet.</p>
        ) : (
          <ul className="mt-3 space-y-4">
            {past.map((ride) => (
              <li key={ride.id}>
                <MyRideCard ride={ride} editable={false} counts={counts[ride.id]} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
