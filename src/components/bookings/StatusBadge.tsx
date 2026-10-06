import { BOOKING_STATUS_LABELS, bookingStatusTone, type StatusTone } from '@/lib/booking-status';
import type { BookingStatus } from '@/lib/types';

const TONES: Record<StatusTone, string> = {
  pending: 'bg-amber-50 text-amber-800',
  success: 'bg-accent-50 text-accent-700',
  danger: 'bg-red-50 text-red-700',
  muted: 'bg-slate-100 text-slate-600',
};

export default function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${TONES[bookingStatusTone(status)]}`}>
      {BOOKING_STATUS_LABELS[status]}
    </span>
  );
}
