const COLORS = ['bg-brand-500', 'bg-accent-600', 'bg-indigo-500', 'bg-rose-500', 'bg-amber-600'];

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function colorFor(name: string): string {
  let sum = 0;
  for (const char of name) sum += char.charCodeAt(0);
  return COLORS[sum % COLORS.length];
}

export default function Avatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  const dimensions = size === 'lg' ? 'h-16 w-16 text-xl' : 'h-10 w-10 text-sm';
  return (
    <span
      aria-hidden="true"
      className={`inline-flex ${dimensions} shrink-0 items-center justify-center rounded-full font-semibold text-white ${colorFor(name)}`}
    >
      {initials(name)}
    </span>
  );
}
