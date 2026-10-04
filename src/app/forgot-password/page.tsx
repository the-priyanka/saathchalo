import type { Metadata } from 'next';
import Link from 'next/link';
import AuthCard from '@/components/auth/AuthCard';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = { title: 'Forgot password' };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we will send you a 6 digit code."
      footer={
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Back to log in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
