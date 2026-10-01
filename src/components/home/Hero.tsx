import SearchBox from './SearchBox';

export default function Hero() {
  return (
    <section className="bg-brand-50">
      <div className="mx-auto max-w-6xl px-4 py-16 text-center md:py-24">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
          Travel together, save together
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          Find a ride to your next city, or share your empty seats and split the fuel cost with people
          going your way.
        </p>
        <div className="mt-10">
          <SearchBox />
        </div>
      </div>
    </section>
  );
}
