import type { Driver, RideWithDriver } from './types';

export type ProfileRow = {
  id: string;
  full_name: string;
  bio: string;
  avatar_url: string | null;
  rating: number;
  review_count: number;
  verified: boolean;
  member_since: number;
};

export type RideRow = {
  id: string;
  driver_id: string;
  from_city: string;
  to_city: string;
  pickup_point: string;
  drop_point: string;
  departure_time: string;
  duration_mins: number;
  price_per_seat: number;
  seats_left: number;
  seats_total: number;
  car_model: string;
  car_color: string;
  pref_ac: boolean;
  pref_music: boolean;
  pref_pets: boolean;
  pref_luggage: boolean;
};

export type RideWithDriverRow = RideRow & { driver: ProfileRow };

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Any ISO instant to an ISO string with the IST offset, which the Phase 1 formatters expect. */
export function toIstIso(iso: string): string {
  const shifted = new Date(Date.parse(iso) + IST_OFFSET_MS);
  return `${shifted.toISOString().slice(0, 19)}+05:30`;
}

export function mapProfile(row: ProfileRow): Driver {
  return {
    id: row.id,
    name: row.full_name,
    photo: row.avatar_url,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    verified: row.verified,
    memberSince: row.member_since,
    bio: row.bio,
  };
}

export function mapRide(row: RideWithDriverRow): RideWithDriver {
  return {
    id: row.id,
    from: row.from_city,
    to: row.to_city,
    pickupPoint: row.pickup_point,
    dropPoint: row.drop_point,
    departureTime: toIstIso(row.departure_time),
    durationMins: row.duration_mins,
    pricePerSeat: row.price_per_seat,
    seatsLeft: row.seats_left,
    seatsTotal: row.seats_total,
    driverId: row.driver_id,
    car: { model: row.car_model, color: row.car_color },
    preferences: {
      ac: row.pref_ac,
      music: row.pref_music,
      pets: row.pref_pets,
      luggage: row.pref_luggage,
    },
    driver: mapProfile(row.driver),
  };
}
