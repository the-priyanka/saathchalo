import type { Validation } from './auth-validation';

const MAX_SEATS_PER_REQUEST = 6;

export function validateSeatsRequest(raw: string, seatsLeft: number): Validation<number, 'seats'> {
  if (seatsLeft < 1) return { ok: false, errors: { seats: 'No seats are left on this ride.' } };

  const text = raw.trim();
  if (!/^\d+$/.test(text)) return { ok: false, errors: { seats: 'Choose how many seats you need.' } };

  const max = Math.min(MAX_SEATS_PER_REQUEST, seatsLeft);
  const seats = Number(text);
  if (seats < 1 || seats > max) return { ok: false, errors: { seats: `Choose between 1 and ${max}.` } };

  return { ok: true, value: seats };
}
