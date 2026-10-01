import { ArrowRight, BadgeCheck, Star } from 'lucide-react';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import { formatArrival, formatDate, formatDuration, formatINR, formatTime } from '@/lib/format';
import type { RideWithDriver } from '@/lib/types';

export default function RideCard({ ride }: { ride: RideWithDriver }) {
  const { driver } = ride;

  return (
    <Link
      href={`/rides/${ride.id}`}
      className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-500 hover:shadow-md"
    >
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
          <p className="text-sm text-slate-500">{formatDuration(ride.durationMins)}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-brand-600">{formatINR(ride.pricePerSeat)}</p>
          <p className="text-xs text-slate-500">per seat</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-3">
          <Avatar name={driver.name} />
          <div>
            <p className="flex items-center gap-1 font-medium text-slate-900">
              {driver.name}
              {driver.verified && (
                <BadgeCheck className="h-4 w-4 text-accent-700" aria-label="Verified driver" />
              )}
            </p>
            <p className="flex items-center gap-1 text-sm text-slate-500">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
              {driver.rating.toFixed(1)} ({driver.reviewCount})
            </p>
          </div>
        </div>
        <p className="text-sm font-medium text-accent-700">
          {ride.seatsLeft} {ride.seatsLeft === 1 ? 'seat' : 'seats'} left
        </p>
      </div>
    </Link>
  );
}
