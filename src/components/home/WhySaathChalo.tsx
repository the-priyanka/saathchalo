import { BadgeCheck, ShieldCheck, Star, Wallet } from 'lucide-react';

const reasons = [
  { icon: BadgeCheck, title: 'Verified profiles', text: 'Drivers can verify their identity so you know who you are riding with.' },
  { icon: Wallet, title: 'Fair cost sharing', text: 'Pay only your share of the fuel and tolls. Prices stay low.' },
  { icon: Star, title: 'Ratings you can trust', text: 'Every trip is rated, so good drivers and passengers stand out.' },
  { icon: ShieldCheck, title: 'Safer travel', text: 'See the driver, the car, and the pickup point before you book.' },
];

export default function WhySaathChalo() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Why SaathChalo</h2>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map((reason) => (
          <li key={reason.title}>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
              <reason.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-semibold text-slate-900">{reason.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{reason.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
