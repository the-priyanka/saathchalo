export type Driver = {
  id: string;
  name: string;
  photo: string | null;
  rating: number;
  reviewCount: number;
  verified: boolean;
  memberSince: number;
  bio: string;
};

export type RideStatus = 'active' | 'cancelled';

export type Ride = {
  id: string;
  from: string;
  to: string;
  pickupPoint: string;
  dropPoint: string;
  /** ISO string with the IST offset, for example 2026-10-02T06:30:00+05:30 */
  departureTime: string;
  durationMins: number;
  /** INR */
  pricePerSeat: number;
  seatsLeft: number;
  seatsTotal: number;
  driverId: string;
  status: RideStatus;
  car: { model: string; color: string };
  preferences: { ac: boolean; music: boolean; pets: boolean; luggage: boolean };
};

export type RideWithDriver = Ride & { driver: Driver };

export type SearchQuery = {
  from?: string;
  to?: string;
  /** YYYY-MM-DD */
  date?: string;
  seats?: number;
};

export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export type RideFilters = {
  maxPrice?: number;
  timeOfDay?: TimeOfDay[];
  minRating?: number;
  verifiedOnly?: boolean;
};

export type SortKey = 'cheapest' | 'earliest' | 'best-rated';

export type PopularRoute = {
  from: string;
  to: string;
  startingPrice: number;
  rideCount: number;
};

export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'cancelled_by_driver';

export type Booking = {
  id: string;
  rideId: string;
  passengerId: string;
  seats: number;
  status: BookingStatus;
  /** ISO instant in UTC */
  createdAt: string;
};

export type BookingWithRide = Booking & { ride: RideWithDriver };

export type BookingWithPassenger = Booking & { passenger: { id: string; name: string } };
