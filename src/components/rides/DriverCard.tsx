import { BadgeCheck, Star } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import type { Driver } from '@/lib/types';

export default function DriverCard({ driver }: { driver: Driver }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Your driver</h2>
      <div className="mt-4 flex items-center gap-4">
        <Avatar name={driver.name} size="lg" />
        <div>
          <p className="flex items-center gap-1 text-lg font-semibold text-slate-900">
            {driver.name}
            {driver.verified && <BadgeCheck className="h-5 w-5 text-accent-600" aria-label="Verified driver" />}
          </p>
          <p className="flex items-center gap-1 text-sm text-slate-600">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
            {driver.rating.toFixed(1)} ({driver.reviewCount} reviews)
          </p>
          <p className="text-sm text-slate-500">Member since {driver.memberSince}</p>
        </div>
      </div>
      <p className="mt-4 text-slate-600">{driver.bio}</p>
    </section>
  );
}
