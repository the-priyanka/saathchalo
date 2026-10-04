import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import SignupForm from '@/components/auth/SignupForm';
import { getCurrentUser } from '@/lib/auth';
import { firstParam, safeNextPath } from '@/lib/safe-next';

export const metadata: Metadata = { title: 'Sign up' };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (await getCurrentUser()) redirect('/account');
  const next = safeNextPath(firstParam((await searchParams).next));

  return (
    <AuthCard
      title="Create your account"
      subtitle="Join SaathChalo to book rides and offer seats."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <SignupForm next={next} />
    </AuthCard>
  );
}
