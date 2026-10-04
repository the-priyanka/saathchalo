import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import VerifyForm from '@/components/auth/VerifyForm';
import { firstParam, safeNextPath } from '@/lib/safe-next';

export const metadata: Metadata = { title: 'Verify your email' };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const email = firstParam(params.email)?.trim();
  if (!email) redirect('/signup');
  const next = safeNextPath(firstParam(params.next));

  return (
    <AuthCard title="Check your email" subtitle={`We sent a 6 digit code to ${email}. Enter it below to verify your account.`}>
      <VerifyForm email={email} next={next} />
    </AuthCard>
  );
}
