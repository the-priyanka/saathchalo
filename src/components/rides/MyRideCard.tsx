import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cancelRideAction } from '@/app/bookings/actions';
import { deleteRideAction } from '@/app/rides/actions';
import CancelRideButton from '@/components/bookings/CancelRideButton';
import { formatArrival, formatDate, formatDuration, formatINR, formatTime } from '@/lib/format';
import type { BookingCounts } from '@/lib/bookings';
import type { Ride } from '@/lib/types';
import DeleteRideButton from './DeleteRideButton';

export default function MyRideCard({
  ride,
  editable,
  counts,
}: {
  ride: Ride;
  editable: boolean;
  counts?: BookingCounts;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{formatDate(ride.departureTime)}</p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-lg font-semibold text-slate-900">
            {formatTime(ride.departureTime)}
            <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
            {formatArrival(ride.departureTime, ride.durationMins)}
          </p>
          <p className="mt-1 text-slate-700">
            {ride.from} to {ride.to}
          </p>
          {ride.status === 'cancelled' && (
            <span className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Cancelled
            </span>
          )}
          <p className="text-sm text-slate-500">
            {formatDuration(ride.durationMins)} · {ride.car.color} {ride.car.model}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-brand-600">{formatINR(ride.pricePerSeat)}</p>
          <p className="text-xs text-slate-500">per seat</p>
          <p className="mt-2 text-sm font-medium text-accent-700">
            {ride.seatsLeft} of {ride.seatsTotal} seats
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
        <Link
          href={`/rides/${ride.id}`}
          aria-label={`View ride from ${ride.from} to ${ride.to}`}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          View
        </Link>
        {counts && counts.total > 0 && (
          <Link
            href={`/my-rides/${ride.id}`}
            aria-label={`Requests for ride from ${ride.from} to ${ride.to}`}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Requests{counts.pending > 0 ? ` (${counts.pending} pending)` : ''}
          </Link>
        )}
        {editable && (
          <>
            <Link
              href={`/my-rides/${ride.id}/edit`}
              aria-label={`Edit ride from ${ride.from} to ${ride.to}`}
              className="rounded-full border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50"
            >
              Edit
            </Link>
            {counts && counts.total > 0 ? (
              <CancelRideButton
                action={cancelRideAction.bind(null, ride.id)}
                label={`Cancel ride from ${ride.from} to ${ride.to}`}
              />
            ) : (
              <DeleteRideButton
                action={deleteRideAction.bind(null, ride.id)}
                label={`Delete ride from ${ride.from} to ${ride.to}`}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
