import { formatArrival, formatDate, formatDuration, formatTime } from '@/lib/format';
import type { Ride } from '@/lib/types';

export default function RouteTimeline({ ride }: { ride: Ride }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-sm text-slate-500">{formatDate(ride.departureTime)}</p>
      <ol className="mt-4">
        <li className="relative flex gap-4 pb-8">
          <span className="absolute left-[4.6rem] top-3 h-full w-px bg-slate-300" aria-hidden="true" />
          <p className="w-16 shrink-0 text-right font-semibold text-slate-900">
            {formatTime(ride.departureTime)}
          </p>
          <span className="relative mt-1.5 h-3 w-3 shrink-0 rounded-full bg-brand-600" aria-hidden="true" />
          <div>
            <p className="font-semibold text-slate-900">{ride.from}</p>
            <p className="text-sm text-slate-500">Pickup: {ride.pickupPoint}</p>
          </div>
        </li>
        <li className="flex gap-4">
          <p className="w-16 shrink-0 text-right font-semibold text-slate-900">
            {formatArrival(ride.departureTime, ride.durationMins)}
          </p>
          <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-accent-600" aria-hidden="true" />
          <div>
            <p className="font-semibold text-slate-900">{ride.to}</p>
            <p className="text-sm text-slate-500">Drop: {ride.dropPoint}</p>
          </div>
        </li>
      </ol>
      <p className="mt-6 text-sm text-slate-500">Trip time: {formatDuration(ride.durationMins)}</p>
    </section>
  );
}
