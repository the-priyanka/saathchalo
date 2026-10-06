import { describe, expect, it } from 'vitest';
import { validateSeatsRequest } from '@/lib/booking-validation';

describe('validateSeatsRequest', () => {
  it('accepts 1 up to the seats left', () => {
    expect(validateSeatsRequest('1', 4)).toEqual({ ok: true, value: 1 });
    expect(validateSeatsRequest(' 3 ', 4)).toEqual({ ok: true, value: 3 });
    expect(validateSeatsRequest('4', 4)).toEqual({ ok: true, value: 4 });
  });

  it('never allows more than 6 even with more seats left', () => {
    expect(validateSeatsRequest('6', 8)).toEqual({ ok: true, value: 6 });
    expect(validateSeatsRequest('7', 8)).toEqual({ ok: false, errors: { seats: 'Choose between 1 and 6.' } });
  });

  it('rejects zero and more than the seats left', () => {
    expect(validateSeatsRequest('0', 4)).toEqual({ ok: false, errors: { seats: 'Choose between 1 and 4.' } });
    expect(validateSeatsRequest('5', 4)).toEqual({ ok: false, errors: { seats: 'Choose between 1 and 4.' } });
  });

  it('rejects non whole numbers and blanks', () => {
    for (const bad of ['', 'x', '1.5', '-1']) {
      expect(validateSeatsRequest(bad, 4)).toEqual({ ok: false, errors: { seats: 'Choose how many seats you need.' } });
    }
  });

  it('reports a ride without seats', () => {
    expect(validateSeatsRequest('1', 0)).toEqual({ ok: false, errors: { seats: 'No seats are left on this ride.' } });
  });
});
