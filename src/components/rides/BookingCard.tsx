import Link from 'next/link';
import { cancelBookingAction, requestBookingAction } from '@/app/bookings/actions';
import CancelBookingButton from '@/components/bookings/CancelBookingButton';
import StatusBadge from '@/components/bookings/StatusBadge';
import {
  BOOKING_STATUS_LABELS,
  canPassengerCancel,
  isActiveBookingStatus,
  isRideUpcoming,
} from '@/lib/booking-status';
import { formatINR } from '@/lib/format';
import type { Booking, Ride } from '@/lib/types';
import RequestForm from './RequestForm';

type Props = {
  ride: Ride;
  viewerId: string | null;
  myBooking: Booking | undefined;
};

const noticeClass = 'mt-5 rounded-lg bg-slate-50 p-3 text-sm text-slate-700';

function Body({ ride, viewerId, myBooking }: Props) {
  const upcoming = isRideUpcoming(ride);
  const active = myBooking && isActiveBookingStatus(myBooking.status) ? myBooking : undefined;

  if (ride.status === 'cancelled') {
    return <p className={noticeClass}>This ride was cancelled.</p>;
  }
  if (!upcoming) {
    return <p className={noticeClass}>This ride has already left.</p>;
  }
  if (viewerId !== null && viewerId === ride.driverId) {
    return (
      <div className={noticeClass}>
        This is your ride.{' '}
        <Link href={`/my-rides/${ride.id}`} className="font-semibold text-brand-600 hover:underline">
          Manage requests
        </Link>
      </div>
    );
  }
  if (active) {
    return (
      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Your booking</span>
          <StatusBadge status={active.status} />
        </div>
        <p className="text-sm text-slate-600">
          {active.seats} {active.seats === 1 ? 'seat' : 'seats'}, {formatINR(ride.pricePerSeat * active.seats)} in total.
        </p>
        {canPassengerCancel(active.status, upcoming) && (
          <CancelBookingButton action={cancelBookingAction.bind(null, active.id)} />
        )}
      </div>
    );
  }
  if (viewerId === null) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/rides/${ride.id}`)}`}
        className="mt-5 block w-full rounded-full bg-brand-600 px-5 py-3 text-center font-semibold text-white hover:bg-brand-700"
      >
        Log in to book
      </Link>
    );
  }
  if (ride.seatsLeft < 1) {
    return <p className={noticeClass}>No seats left on this ride.</p>;
  }
  return (
    <>
      {myBooking && (
        <p className="mt-5 text-sm text-slate-500">
          Your last request was {BOOKING_STATUS_LABELS[myBooking.status].toLowerCase()}.
        </p>
      )}
      <RequestForm
        action={requestBookingAction.bind(null, ride.id)}
        seatsLeft={ride.seatsLeft}
        pricePerSeat={ride.pricePerSeat}
      />
    </>
  );
}

export default function BookingCard(props: Props) {
  const { ride } = props;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-3xl font-bold text-brand-600">{formatINR(ride.pricePerSeat)}</p>
      <p className="text-sm text-slate-500">per seat</p>
      <Body {...props} />
      <p className="mt-4 text-xs text-slate-500">
        Pay the driver directly. Payments are not part of SaathChalo.
      </p>
    </div>
  );
}
