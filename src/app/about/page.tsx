import { Handshake, Leaf, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About',
  description: 'Why SaathChalo exists and how it keeps shared rides safe and fair.',
};

const values = [
  {
    icon: Handshake,
    title: 'Community first',
    text: 'Every ride starts with two people agreeing to help each other get somewhere.',
  },
  {
    icon: Leaf,
    title: 'Fewer empty seats',
    text: 'More people per car means fewer cars on the road and less fuel burned.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust by design',
    text: 'Clear profiles, honest ratings, and visible pickup points build confidence.',
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-brand-50">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center md:py-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            About SaathChalo
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            &quot;Saath chalo&quot; means &quot;let us go together&quot;. That is the whole idea.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-900">Our story</h2>
        <p className="mt-4 text-slate-600">
          Millions of people travel between Indian cities every week, and many of them drive with empty
          seats while others pay a lot for a bus or a taxi. SaathChalo connects the two. Drivers share
          their trip and split the cost. Passengers get a comfortable, affordable ride.
        </p>
        <p className="mt-4 text-slate-600">
          Our mission is simple: make intercity travel cheaper, friendlier, and better for the planet.
        </p>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center text-2xl font-bold text-slate-900">What we stand for</h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <li key={value.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                  <value.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{value.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{value.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-900">Safety and trust</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600">
          <li>Drivers can verify their identity, and verified drivers get a badge on their profile.</li>
          <li>After every trip, drivers and passengers rate each other.</li>
          <li>You see the driver, the car, and the exact pickup and drop points before you book.</li>
          <li>Prices are a share of trip costs, so rides stay affordable and fair.</li>
        </ul>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20">
        <div className="rounded-2xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900">Built by Priyanka</h2>
          <p className="mt-2 text-slate-600">
            SaathChalo is a portfolio project that shows a full carpooling experience: search, filters,
            ride details, and a data layer ready for a real backend. Rides on this site are sample data.
          </p>
          <Link href="/rides" className="mt-4 inline-block font-semibold text-brand-600 hover:underline">
            Try the ride search
          </Link>
        </div>
      </section>
    </>
  );
}
