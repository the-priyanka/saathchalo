export default function ContactPhone({ label, phone }: { label: string; phone: string | undefined }) {
  if (!phone) return null;
  return (
    <p className="mt-1 text-sm text-slate-700">
      {label}:{' '}
      <a href={`tel:${phone}`} className="font-semibold text-brand-600 hover:underline">
        {phone}
      </a>
    </p>
  );
}
