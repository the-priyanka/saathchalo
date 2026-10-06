import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cancelBookingAction } from '@/app/bookings/actions';
import { canPassengerCancel } from '@/lib/booking-status';
import { formatArrival, formatDate, formatINR, formatTime } from '@/lib/format';
import type { BookingWithRide } from '@/lib/types';
import CancelBookingButton from './CancelBookingButton';
import ContactPhone from './ContactPhone';
import StatusBadge from './StatusBadge';

type Props = { booking: BookingWithRide; upcoming: boolean; driverPhone?: string };

export default function MyBookingCard({ booking, upcoming, driverPhone }: Props) {
  const { ride } = booking;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{formatDate(ride.departureTime)}</p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-lg font-semibold text-slate-900">
            {formatTime(ride.departureTime)}
            <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
            {formatArrival(ride.departureTime, ride.durationMins)}
          </p>
          <p className="mt-1 text-slate-700">
            {ride.from} to {ride.to}
          </p>
          <p className="text-sm text-slate-500">Driver: {ride.driver.name}</p>
          {booking.status === 'accepted' && <ContactPhone label="Driver phone" phone={driverPhone} />}
        </div>
        <div className="text-right">
          <StatusBadge status={booking.status} />
          <p className="mt-3 text-sm text-slate-600">
            {booking.seats} {booking.seats === 1 ? 'seat' : 'seats'}
          </p>
          <p className="text-lg font-bold text-brand-600">{formatINR(ride.pricePerSeat * booking.seats)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
        <Link
          href={`/rides/${ride.id}`}
          aria-label={`View ride from ${ride.from} to ${ride.to}`}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          View ride
        </Link>
        {upcoming && canPassengerCancel(booking.status, true) && (
          <CancelBookingButton
            action={cancelBookingAction.bind(null, booking.id)}
            label={`Cancel booking for ${ride.from} to ${ride.to}`}
          />
        )}
      </div>
    </div>
  );
}
