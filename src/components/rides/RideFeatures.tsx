import { Briefcase, Car, Music, PawPrint, Snowflake } from 'lucide-react';
import type { Ride } from '@/lib/types';

export default function RideFeatures({ ride }: { ride: Ride }) {
  const features = [
    { icon: Snowflake, label: 'Air conditioning', on: ride.preferences.ac },
    { icon: Music, label: 'Music', on: ride.preferences.music },
    { icon: PawPrint, label: 'Pets allowed', on: ride.preferences.pets },
    { icon: Briefcase, label: 'Luggage allowed', on: ride.preferences.luggage },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Car and preferences</h2>
      <p className="mt-3 flex items-center gap-2 text-slate-700">
        <Car className="h-5 w-5 text-slate-400" aria-hidden="true" />
        {ride.car.color} {ride.car.model}
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {features.map((feature) => (
          <li
            key={feature.label}
            className={`flex items-center gap-2 text-sm ${feature.on ? 'text-slate-800' : 'text-slate-400 line-through'}`}
          >
            <feature.icon className="h-4 w-4" aria-hidden="true" />
            {feature.label}
            <span className="sr-only">{feature.on ? ' (yes)' : ' (no)'}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
