type Props = {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
  placeholder?: string;
  error?: string;
  inputMode?: 'numeric' | 'email' | 'text';
  maxLength?: number;
  required?: boolean;
  list?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
};

export default function FormField({ label, name, error, ...inputProps }: Props) {
  const errorId = `${name}-error`;
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        {...inputProps}
      />
      {error && (
        <span id={errorId} className="mt-1 block text-sm text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}
