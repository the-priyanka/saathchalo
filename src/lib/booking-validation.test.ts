import { describe, expect, it } from 'vitest';
import { validatePhone, validateSeatsRequest } from '@/lib/booking-validation';

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

describe('validatePhone', () => {
  it('accepts 10 to 15 digits with an optional plus', () => {
    expect(validatePhone('9876543210')).toEqual({ ok: true, value: '9876543210' });
    expect(validatePhone('+919876543210')).toEqual({ ok: true, value: '+919876543210' });
    expect(validatePhone('+1 (415) 555-0123')).toEqual({ ok: true, value: '+14155550123' });
    expect(validatePhone('98765 43210')).toEqual({ ok: true, value: '9876543210' });
    expect(validatePhone('123456789012345')).toEqual({ ok: true, value: '123456789012345' });
  });

  it('treats a blank value as removing the phone', () => {
    expect(validatePhone('')).toEqual({ ok: true, value: null });
    expect(validatePhone('   ')).toEqual({ ok: true, value: null });
  });

  it('rejects numbers that are too short, too long, or not numbers', () => {
    const error = { ok: false, errors: { phone: 'Enter a valid phone number: 10 to 15 digits, with an optional + at the start.' } };
    for (const bad of ['123456789', '1234567890123456', 'abcdefghij', '98765x43210', '++919876543210', '91+9876543210']) {
      expect(validatePhone(bad)).toEqual(error);
    }
  });
});
