import { Car } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-lg font-bold text-brand-600">
            <Car className="h-5 w-5" aria-hidden="true" />
            SaathChalo
          </p>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Travel together across India. A portfolio project, rides shown here are sample data.
          </p>
        </div>
        <ul className="flex gap-6 text-sm font-medium text-slate-600">
          <li><Link href="/" className="hover:text-brand-600">Home</Link></li>
          <li><Link href="/rides" className="hover:text-brand-600">Find a ride</Link></li>
          <li><Link href="/about" className="hover:text-brand-600">About</Link></li>
        </ul>
      </div>
      <p className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} SaathChalo. All rights reserved.
      </p>
    </footer>
  );
}
