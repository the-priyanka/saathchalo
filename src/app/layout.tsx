import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { getCurrentUser } from '@/lib/auth';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'SaathChalo | Travel together across India',
    template: '%s | SaathChalo',
  },
  description:
    'Find a ride to your next city or share your empty seats and split the fuel cost. SaathChalo is a carpooling demo built for India.',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col">
        <Navbar user={user ? { fullName: user.fullName } : null} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
