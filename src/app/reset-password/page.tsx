import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { firstParam } from '@/lib/safe-next';

export const metadata: Metadata = { title: 'Reset password' };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const email = firstParam((await searchParams).email)?.trim();
  if (!email) redirect('/forgot-password');

  return (
    <AuthCard
      title="Set a new password"
      subtitle={`If an account exists for ${email}, we sent a 6 digit code. Enter it below and choose a new password.`}
      footer={
        <>
          Did not get a code?{' '}
          <Link href="/forgot-password" className="font-semibold text-brand-600 hover:underline">
            Request a new one
          </Link>
        </>
      }
    >
      <ResetPasswordForm email={email} />
    </AuthCard>
  );
}
