const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDuration(mins: number): string {
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  if (hours === 0) return `${rest}m`;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

function formatClock(hour24: number, minute: number): string {
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const suffix = hour24 < 12 ? 'AM' : 'PM';
  return `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

/** Reads the clock digits straight from an IST ISO string such as 2026-10-02T06:30:00+05:30. */
export function formatTime(iso: string): string {
  return formatClock(Number(iso.slice(11, 13)), Number(iso.slice(14, 16)));
}

export function formatArrival(iso: string, durationMins: number): string {
  const arrival = new Date(Date.parse(iso) + durationMins * 60_000 + IST_OFFSET_MS);
  return formatClock(arrival.getUTCHours(), arrival.getUTCMinutes());
}

export function formatDate(iso: string): string {
  const date = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  return `${DAYS[date.getUTCDay()]}, ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
}
