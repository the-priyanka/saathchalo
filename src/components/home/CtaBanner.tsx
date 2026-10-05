import Link from 'next/link';

export default function CtaBanner() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <div className="rounded-3xl bg-brand-600 px-6 py-12 text-center text-white md:px-12">
        <h2 className="text-2xl font-bold md:text-3xl">Driving somewhere?</h2>
        <p className="mx-auto mt-3 max-w-xl text-brand-100">
          Share your empty seats, meet good people, and cover your fuel cost.
        </p>
        <Link
          href="/rides/new"
          className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-brand-700 hover:bg-brand-50"
        >
          Offer a ride
        </Link>
      </div>
    </section>
  );
}
