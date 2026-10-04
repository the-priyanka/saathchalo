import type { ReactNode } from 'react';

type Props = { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode };

export default function AuthCard({ title, subtitle, children, footer }: Props) {
  return (
    <div className="mx-auto max-w-md px-4 py-12 md:py-20">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-2 text-slate-600">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <p className="mt-6 text-center text-sm text-slate-600">{footer}</p>}
    </div>
  );
}
