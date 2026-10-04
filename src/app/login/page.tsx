import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import LoginForm from '@/components/auth/LoginForm';
import { getCurrentUser } from '@/lib/auth';
import { firstParam, safeNextPath } from '@/lib/safe-next';

export const metadata: Metadata = { title: 'Log in' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (await getCurrentUser()) redirect('/account');
  const next = safeNextPath(firstParam((await searchParams).next));

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to your SaathChalo account."
      footer={
        <>
          New here?{' '}
          <Link href="/signup" className="font-semibold text-brand-600 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm next={next} />
    </AuthCard>
  );
}
