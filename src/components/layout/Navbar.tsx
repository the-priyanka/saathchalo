'use client';

import { Car, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { signOutAction } from '@/app/auth/actions';

const links = [
  { href: '/', label: 'Home' },
  { href: '/rides', label: 'Find a ride' },
  { href: '/about', label: 'About' },
];

const outlineButton =
  'rounded-full border border-brand-600 px-4 py-2 text-center text-sm font-semibold text-brand-600 hover:bg-brand-50';
const solidButton =
  'rounded-full bg-brand-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-brand-700';

type Props = { user: { fullName: string } | null };

export default function Navbar({ user }: Props) {
  const [open, setOpen] = useState(false);
  const firstName = user?.fullName.split(' ')[0];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4" aria-label="Main">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-brand-600">
          <Car className="h-6 w-6" aria-hidden="true" />
          SaathChalo
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-sm font-medium text-slate-600 hover:text-brand-600">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/rides/new" className={outlineButton}>
            Offer a ride
          </Link>
          {user ? (
            <>
              <Link href="/my-rides" className="text-sm font-medium text-slate-700 hover:text-brand-600">
                My rides
              </Link>
              <Link href="/account" className="text-sm font-medium text-slate-700 hover:text-brand-600">
                Hi, {firstName}
              </Link>
              <form action={signOutAction}>
                <button type="submit" className={solidButton}>
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-brand-600">
                Log in
              </Link>
              <Link href="/signup" className={solidButton}>
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-slate-700 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 font-medium text-slate-700 hover:bg-brand-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {user && (
              <>
                <li>
                  <Link
                    href="/my-rides"
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2 font-medium text-slate-700 hover:bg-brand-50"
                  >
                    My rides
                  </Link>
                </li>
                <li>
                  <Link
                    href="/account"
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2 font-medium text-slate-700 hover:bg-brand-50"
                  >
                    My account
                  </Link>
                </li>
              </>
            )}
          </ul>
          <div className="mt-4 flex gap-3">
            <Link href="/rides/new" onClick={() => setOpen(false)} className={`flex-1 ${outlineButton}`}>
              Offer a ride
            </Link>
            {user ? (
              <form action={signOutAction} className="flex-1">
                <button type="submit" className={`w-full ${solidButton}`}>
                  Log out
                </button>
              </form>
            ) : (
              <Link href="/signup" onClick={() => setOpen(false)} className={`flex-1 ${solidButton}`}>
                Sign up
              </Link>
            )}
          </div>
          {!user && (
            <p className="mt-3 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link href="/login" onClick={() => setOpen(false)} className="font-semibold text-brand-600">
                Log in
              </Link>
            </p>
          )}
        </div>
      )}
    </header>
  );
}
