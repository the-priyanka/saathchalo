import { respondBookingAction } from '@/app/bookings/actions';
import { canDriverAccept, canDriverRespond } from '@/lib/booking-status';
import { formatDate } from '@/lib/format';
import { toIstIso } from '@/lib/ride-mapping';
import type { BookingWithPassenger, Ride } from '@/lib/types';
import StatusBadge from './StatusBadge';

type Props = { booking: BookingWithPassenger; ride: Ride; upcoming: boolean };

export default function BookingRequestRow({ booking, ride, upcoming }: Props) {
  const canRespond = canDriverRespond(booking.status, upcoming);
  const canAccept = canDriverAccept(booking.status, upcoming, ride.seatsLeft, booking.seats);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-900">{booking.passenger.name}</p>
          <p className="text-sm text-slate-600">
            {booking.seats} {booking.seats === 1 ? 'seat' : 'seats'}
          </p>
          <p className="text-xs text-slate-500">Requested on {formatDate(toIstIso(booking.createdAt))}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {canRespond && (
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
          <form action={respondBookingAction.bind(null, ride.id, booking.id, true)}>
            <button
              type="submit"
              disabled={!canAccept}
              aria-label={`Accept the request from ${booking.passenger.name}`}
              className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Accept
            </button>
          </form>
          <form action={respondBookingAction.bind(null, ride.id, booking.id, false)}>
            <button
              type="submit"
              aria-label={`Reject the request from ${booking.passenger.name}`}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reject
            </button>
          </form>
          {!canAccept && <p className="text-sm text-slate-500">Not enough seats are left to accept this request.</p>}
        </div>
      )}
    </div>
  );
}
