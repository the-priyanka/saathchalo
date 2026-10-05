import type { Validation } from './auth-validation';
import type { Ride } from './types';

export type RideFormRaw = {
  fromCity: string;
  toCity: string;
  pickupPoint: string;
  dropPoint: string;
  /** datetime-local value, for example 2026-10-06T09:00, interpreted as IST */
  departure: string;
  durationHours: string;
  durationMinutes: string;
  pricePerSeat: string;
  seatsTotal: string;
  carModel: string;
  carColor: string;
  prefAc: boolean;
  prefMusic: boolean;
  prefPets: boolean;
  prefLuggage: boolean;
};

export type RideField =
  | 'fromCity'
  | 'toCity'
  | 'pickupPoint'
  | 'dropPoint'
  | 'departure'
  | 'duration'
  | 'pricePerSeat'
  | 'seatsTotal'
  | 'carModel'
  | 'carColor';

export type RideInput = {
  from: string;
  to: string;
  pickupPoint: string;
  dropPoint: string;
  /** ISO string with the IST offset, for example 2026-10-06T09:00:00+05:30 */
  departureTime: string;
  durationMins: number;
  pricePerSeat: number;
  seatsTotal: number;
  car: { model: string; color: string };
  preferences: { ac: boolean; music: boolean; pets: boolean; luggage: boolean };
};

const DEPARTURE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const WHOLE_NUMBER_RE = /^\d+$/;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const IST_OFFSET_MS = 5.5 * HOUR_MS;

const DEPARTURE_INVALID = 'Enter a valid departure date and time.';
const DEPARTURE_WINDOW = 'Choose a departure between 1 hour and 90 days from now.';
const DURATION_WHOLE = 'Enter whole numbers for hours and minutes.';
const DURATION_RANGE = 'Duration must be between 15 minutes and 24 hours, with minutes from 0 to 59.';
const PRICE_ERROR = 'Price per seat must be a whole number between ₹50 and ₹5,000.';
const SEATS_ERROR = 'Seats must be a whole number between 1 and 6.';

const inRange = (value: number, min: number, max: number) => value >= min && value <= max;
const lengthMessage = (label: string, min: number, max: number) =>
  `${label} must be ${min} to ${max} characters.`;

function parseDeparture(value: string, now: Date): { time: string } | { error: string } {
  const text = value.trim();
  if (!DEPARTURE_RE.test(text)) return { error: DEPARTURE_INVALID };
  const instant = new Date(`${text}:00+05:30`);
  if (Number.isNaN(instant.getTime())) return { error: DEPARTURE_INVALID };
  // Rejects impossible dates that some parsers roll over, such as 2026-02-30.
  if (new Date(instant.getTime() + IST_OFFSET_MS).toISOString().slice(0, 16) !== text) {
    return { error: DEPARTURE_INVALID };
  }
  const earliest = now.getTime() + HOUR_MS;
  const latest = now.getTime() + 90 * DAY_MS;
  if (instant.getTime() < earliest || instant.getTime() > latest) return { error: DEPARTURE_WINDOW };
  return { time: `${text}:00+05:30` };
}

export function validateRideInput(
  raw: RideFormRaw,
  now: Date = new Date(),
): Validation<RideInput, RideField> {
  const errors: Partial<Record<RideField, string>> = {};

  const from = raw.fromCity.trim();
  const to = raw.toCity.trim();
  const pickupPoint = raw.pickupPoint.trim();
  const dropPoint = raw.dropPoint.trim();
  const carModel = raw.carModel.trim();
  const carColor = raw.carColor.trim();

  if (!inRange(from.length, 2, 60)) errors.fromCity = lengthMessage('From city', 2, 60);
  if (!inRange(to.length, 2, 60)) errors.toCity = lengthMessage('To city', 2, 60);
  else if (!errors.fromCity && from.toLowerCase() === to.toLowerCase()) {
    errors.toCity = 'Pick a different city for the destination.';
  }
  if (!inRange(pickupPoint.length, 3, 80)) errors.pickupPoint = lengthMessage('Pickup point', 3, 80);
  if (!inRange(dropPoint.length, 3, 80)) errors.dropPoint = lengthMessage('Drop point', 3, 80);
  if (!inRange(carModel.length, 2, 40)) errors.carModel = lengthMessage('Car model', 2, 40);
  if (!inRange(carColor.length, 2, 40)) errors.carColor = lengthMessage('Car color', 2, 40);

  const departure = parseDeparture(raw.departure, now);
  if ('error' in departure) errors.departure = departure.error;

  const hoursText = raw.durationHours.trim() || '0';
  const minutesText = raw.durationMinutes.trim() || '0';
  let durationMins = 0;
  if (!WHOLE_NUMBER_RE.test(hoursText) || !WHOLE_NUMBER_RE.test(minutesText)) {
    errors.duration = DURATION_WHOLE;
  } else {
    const minutes = Number(minutesText);
    durationMins = Number(hoursText) * 60 + minutes;
    if (minutes > 59 || !inRange(durationMins, 15, 1440)) errors.duration = DURATION_RANGE;
  }

  const priceText = raw.pricePerSeat.trim();
  const pricePerSeat = WHOLE_NUMBER_RE.test(priceText) ? Number(priceText) : NaN;
  if (!inRange(pricePerSeat, 50, 5000)) errors.pricePerSeat = PRICE_ERROR;

  const seatsText = raw.seatsTotal.trim();
  const seatsTotal = WHOLE_NUMBER_RE.test(seatsText) ? Number(seatsText) : NaN;
  if (!inRange(seatsTotal, 1, 6)) errors.seatsTotal = SEATS_ERROR;

  if (Object.keys(errors).length > 0 || 'error' in departure) return { ok: false, errors };

  return {
    ok: true,
    value: {
      from,
      to,
      pickupPoint,
      dropPoint,
      departureTime: departure.time,
      durationMins,
      pricePerSeat,
      seatsTotal,
      car: { model: carModel, color: carColor },
      preferences: {
        ac: raw.prefAc,
        music: raw.prefMusic,
        pets: raw.prefPets,
        luggage: raw.prefLuggage,
      },
    },
  };
}

const text = (formData: FormData, key: string) => String(formData.get(key) ?? '');

export function rideFormRawFromFormData(formData: FormData): RideFormRaw {
  return {
    fromCity: text(formData, 'fromCity'),
    toCity: text(formData, 'toCity'),
    pickupPoint: text(formData, 'pickupPoint'),
    dropPoint: text(formData, 'dropPoint'),
    departure: text(formData, 'departure'),
    durationHours: text(formData, 'durationHours'),
    durationMinutes: text(formData, 'durationMinutes'),
    pricePerSeat: text(formData, 'pricePerSeat'),
    seatsTotal: text(formData, 'seatsTotal'),
    carModel: text(formData, 'carModel'),
    carColor: text(formData, 'carColor'),
    prefAc: formData.get('prefAc') === 'on',
    prefMusic: formData.get('prefMusic') === 'on',
    prefPets: formData.get('prefPets') === 'on',
    prefLuggage: formData.get('prefLuggage') === 'on',
  };
}

const checkbox = (value: boolean) => (value ? 'on' : '');

export function rideRawToValues(raw: RideFormRaw): Record<string, string> {
  return {
    fromCity: raw.fromCity,
    toCity: raw.toCity,
    pickupPoint: raw.pickupPoint,
    dropPoint: raw.dropPoint,
    departure: raw.departure,
    durationHours: raw.durationHours,
    durationMinutes: raw.durationMinutes,
    pricePerSeat: raw.pricePerSeat,
    seatsTotal: raw.seatsTotal,
    carModel: raw.carModel,
    carColor: raw.carColor,
    prefAc: checkbox(raw.prefAc),
    prefMusic: checkbox(raw.prefMusic),
    prefPets: checkbox(raw.prefPets),
    prefLuggage: checkbox(raw.prefLuggage),
  };
}

/** Prefills the form from an existing ride. `departureTime` already holds IST digits. */
export function rideToFormValues(ride: Ride): Record<string, string> {
  return {
    fromCity: ride.from,
    toCity: ride.to,
    pickupPoint: ride.pickupPoint,
    dropPoint: ride.dropPoint,
    departure: ride.departureTime.slice(0, 16),
    durationHours: String(Math.floor(ride.durationMins / 60)),
    durationMinutes: String(ride.durationMins % 60),
    pricePerSeat: String(ride.pricePerSeat),
    seatsTotal: String(ride.seatsTotal),
    carModel: ride.car.model,
    carColor: ride.car.color,
    prefAc: checkbox(ride.preferences.ac),
    prefMusic: checkbox(ride.preferences.music),
    prefPets: checkbox(ride.preferences.pets),
    prefLuggage: checkbox(ride.preferences.luggage),
  };
}
