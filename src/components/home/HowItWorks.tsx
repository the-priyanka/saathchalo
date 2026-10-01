import { Search, Ticket, Users } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Search',
    text: 'Enter where you are going and when. Compare rides, prices, and drivers.',
  },
  {
    icon: Ticket,
    title: 'Book a seat',
    text: 'Pick the ride that suits you and request a seat. Drivers confirm quickly.',
  },
  {
    icon: Users,
    title: 'Travel together',
    text: 'Meet at the pickup point, share the ride, and split the cost of the trip.',
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-slate-900 md:text-3xl">How it works</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                <step.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {index + 1}. {step.title}
              </h3>
              <p className="mt-2 text-slate-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
