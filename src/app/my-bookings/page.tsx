import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import MyBookingCard from '@/components/bookings/MyBookingCard';
import { getCurrentUser } from '@/lib/auth';
import { bookingErrorMessage, isBookingErrorCode } from '@/lib/booking-errors';
import { getMyBookings } from '@/lib/bookings';
import { getPhones } from '@/lib/contacts';
import { firstParam } from '@/lib/safe-next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'My bookings' };

export default async function MyBookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/my-bookings');

  const params = await searchParams;
  const errorCode = firstParam(params.error);
  let notice: { text: string; tone: 'ok' | 'error' } | undefined;
  if (errorCode) {
    notice = { text: bookingErrorMessage(isBookingErrorCode(errorCode) ? errorCode : 'unknown'), tone: 'error' };
  } else if (firstParam(params.requested)) {
    notice = { text: 'Your booking request was submitted. Its status is shown below.', tone: 'ok' };
  } else if (firstParam(params.notice) === 'cancelled') {
    notice = { text: 'Your booking was cancelled.', tone: 'ok' };
  }

  const { upcoming, past } = await getMyBookings(user.id);
  const driverIds = [...upcoming, ...past].filter((b) => b.status === 'accepted').map((b) => b.ride.driverId);
  let phones: Record<string, string> = {};
  try {
    phones = await getPhones([...new Set(driverIds)]);
  } catch {
    phones = {};
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">My bookings</h1>

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
            You have no upcoming bookings.{' '}
            <Link href="/rides" className="font-semibold text-brand-600 hover:underline">
              Find a ride
            </Link>
          </p>
        ) : (
          <ul className="mt-3 space-y-4">
            {upcoming.map((booking) => (
              <li key={booking.id}>
                <MyBookingCard booking={booking} upcoming driverPhone={phones[booking.ride.driverId]} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Past</h2>
        {past.length === 0 ? (
          <p className="mt-3 text-slate-600">No past bookings yet.</p>
        ) : (
          <ul className="mt-3 space-y-4">
            {past.map((booking) => (
              <li key={booking.id}>
                <MyBookingCard booking={booking} upcoming={false} driverPhone={phones[booking.ride.driverId]} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
