import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import BioForm from '@/components/auth/BioForm';
import Avatar from '@/components/ui/Avatar';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'My account' };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/account');

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">My account</h1>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <Avatar name={user.fullName} size="lg" />
          <div>
            <p className="text-lg font-semibold text-slate-900">{user.fullName}</p>
            <p className="text-sm text-slate-600">{user.email}</p>
            <p className="text-sm text-slate-500">Member since {user.memberSince}</p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">About you</h2>
        <div className="mt-4">
          <BioForm bio={user.bio} />
        </div>
      </section>
    </div>
  );
}
