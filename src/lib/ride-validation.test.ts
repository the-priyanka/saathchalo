import { describe, expect, it } from 'vitest';
import {
  rideFormRawFromFormData,
  rideRawToValues,
  rideToFormValues,
  validateRideInput,
  type RideFormRaw,
} from '@/lib/ride-validation';
import type { Ride } from '@/lib/types';

// 10:00 IST on 5 October 2026
const NOW = new Date('2026-10-05T04:30:00Z');

const valid: RideFormRaw = {
  fromCity: 'Delhi',
  toCity: 'Jaipur',
  pickupPoint: 'Kashmere Gate',
  dropPoint: 'Sindhi Camp',
  departure: '2026-10-06T09:00',
  durationHours: '5',
  durationMinutes: '30',
  pricePerSeat: '500',
  seatsTotal: '3',
  carModel: 'Maruti Swift',
  carColor: 'White',
  prefAc: true,
  prefMusic: false,
  prefPets: false,
  prefLuggage: true,
};

const errorsFor = (changes: Partial<RideFormRaw>) => {
  const result = validateRideInput({ ...valid, ...changes }, NOW);
  return result.ok ? undefined : result.errors;
};

describe('validateRideInput', () => {
  it('accepts a valid ride and returns the typed value', () => {
    expect(validateRideInput(valid, NOW)).toEqual({
      ok: true,
      value: {
        from: 'Delhi',
        to: 'Jaipur',
        pickupPoint: 'Kashmere Gate',
        dropPoint: 'Sindhi Camp',
        departureTime: '2026-10-06T09:00:00+05:30',
        durationMins: 330,
        pricePerSeat: 500,
        seatsTotal: 3,
        car: { model: 'Maruti Swift', color: 'White' },
        preferences: { ac: true, music: false, pets: false, luggage: true },
      },
    });
  });

  it('uses the canonical spelling for known cities', () => {
    const result = validateRideInput({ ...valid, fromCity: 'delhi ', toCity: 'MYSURU' }, NOW);
    expect(result.ok && result.value.from).toBe('Delhi');
    expect(result.ok && result.value.to).toBe('Mysuru');
  });

  it('keeps an unknown city as typed', () => {
    const result = validateRideInput({ ...valid, toCity: ' Agra ' }, NOW);
    expect(result.ok && result.value.to).toBe('Agra');
  });

  it('trims text fields', () => {
    const result = validateRideInput({ ...valid, fromCity: '  Delhi ', carModel: ' Swift  ' }, NOW);
    expect(result.ok && result.value.from).toBe('Delhi');
    expect(result.ok && result.value.car.model).toBe('Swift');
  });

  describe('cities', () => {
    it('needs 2 to 60 characters', () => {
      expect(errorsFor({ fromCity: 'D' })?.fromCity).toBe('From city must be 2 to 60 characters.');
      expect(errorsFor({ toCity: ' ' })?.toCity).toBe('To city must be 2 to 60 characters.');
      expect(errorsFor({ fromCity: 'a'.repeat(61) })?.fromCity).toBeDefined();
      expect(errorsFor({ fromCity: 'a'.repeat(60), toCity: 'b'.repeat(60) })).toBeUndefined();
    });

    it('rejects the same city on both sides in any case', () => {
      expect(errorsFor({ toCity: 'delhi ' })?.toCity).toBe('Pick a different city for the destination.');
    });
  });

  describe('pickup, drop, and car text', () => {
    it('enforces the length limits', () => {
      expect(errorsFor({ pickupPoint: 'ab' })?.pickupPoint).toBe('Pickup point must be 3 to 80 characters.');
      expect(errorsFor({ dropPoint: 'a'.repeat(81) })?.dropPoint).toBe('Drop point must be 3 to 80 characters.');
      expect(errorsFor({ carModel: 'a' })?.carModel).toBe('Car model must be 2 to 40 characters.');
      expect(errorsFor({ carColor: 'a'.repeat(41) })?.carColor).toBe('Car color must be 2 to 40 characters.');
      expect(errorsFor({ pickupPoint: 'abc', dropPoint: 'abc', carModel: 'ab', carColor: 'ab' })).toBeUndefined();
    });
  });

  describe('departure', () => {
    const message = 'Choose a departure between 1 hour and 90 days from now.';

    it('rejects less than 1 hour ahead and accepts exactly 1 hour', () => {
      expect(errorsFor({ departure: '2026-10-05T10:59' })?.departure).toBe(message);
      expect(errorsFor({ departure: '2026-10-05T11:00' })).toBeUndefined();
      expect(errorsFor({ departure: '2026-10-05T11:01' })).toBeUndefined();
    });

    it('rejects the past', () => {
      expect(errorsFor({ departure: '2026-10-04T10:00' })?.departure).toBe(message);
    });

    it('accepts up to 90 days and rejects beyond', () => {
      expect(errorsFor({ departure: '2027-01-03T10:00' })).toBeUndefined();
      expect(errorsFor({ departure: '2027-01-03T10:01' })?.departure).toBe(message);
      expect(errorsFor({ departure: '2027-01-04T10:00' })?.departure).toBe(message);
    });

    it('rejects malformed or impossible values', () => {
      const invalid = 'Enter a valid departure date and time.';
      expect(errorsFor({ departure: '' })?.departure).toBe(invalid);
      expect(errorsFor({ departure: 'tomorrow' })?.departure).toBe(invalid);
      expect(errorsFor({ departure: '2026-10-06' })?.departure).toBe(invalid);
      expect(errorsFor({ departure: '2026-02-30T10:00' })?.departure).toBe(invalid);
      expect(errorsFor({ departure: '2026-10-06T25:00' })?.departure).toBe(invalid);
    });

    describe('when editing an existing ride', () => {
      const soon = '2026-10-05T10:30';
      const run = (departure: string, currentDeparture: string) => {
        const result = validateRideInput({ ...valid, departure }, NOW, { currentDeparture });
        return result.ok ? undefined : result.errors;
      };

      it('rejects a departure 30 minutes ahead without options', () => {
        expect(errorsFor({ departure: soon })?.departure).toBe(message);
      });

      it('accepts the same departure when it is unchanged', () => {
        expect(run(soon, '2026-10-05T10:30:00+05:30')).toBeUndefined();
      });

      it('still rejects a changed departure inside the window', () => {
        expect(run(soon, '2026-10-05T10:45:00+05:30')?.departure).toBe(message);
      });

      it('still rejects an invalid format', () => {
        const invalid = 'Enter a valid departure date and time.';
        expect(run('tomorrow', '2026-10-05T10:30:00+05:30')?.departure).toBe(invalid);
      });
    });
  });

  describe('duration', () => {
    const message = 'Duration must be between 15 minutes and 24 hours, with minutes from 0 to 59.';

    it('enforces the bounds', () => {
      expect(errorsFor({ durationHours: '0', durationMinutes: '14' })?.duration).toBe(message);
      expect(errorsFor({ durationHours: '0', durationMinutes: '15' })).toBeUndefined();
      expect(errorsFor({ durationHours: '24', durationMinutes: '0' })).toBeUndefined();
      expect(errorsFor({ durationHours: '24', durationMinutes: '1' })?.duration).toBe(message);
      expect(errorsFor({ durationHours: '1', durationMinutes: '60' })?.duration).toBe(message);
    });

    it('treats blank boxes as zero and rejects the empty total', () => {
      expect(errorsFor({ durationHours: '', durationMinutes: '' })?.duration).toBe(message);
      expect(errorsFor({ durationHours: '2', durationMinutes: '' })).toBeUndefined();
    });

    it('rejects non whole numbers', () => {
      expect(errorsFor({ durationHours: '1.5', durationMinutes: '0' })?.duration).toBe(
        'Enter whole numbers for hours and minutes.',
      );
      expect(errorsFor({ durationHours: 'x', durationMinutes: '0' })?.duration).toBe(
        'Enter whole numbers for hours and minutes.',
      );
    });

    it('combines hours and minutes', () => {
      const result = validateRideInput({ ...valid, durationHours: '1', durationMinutes: '45' }, NOW);
      expect(result.ok && result.value.durationMins).toBe(105);
    });
  });

  describe('price per seat', () => {
    const message = 'Price per seat must be a whole number between ₹50 and ₹5,000.';

    it('enforces 50 to 5000', () => {
      expect(errorsFor({ pricePerSeat: '49' })?.pricePerSeat).toBe(message);
      expect(errorsFor({ pricePerSeat: '50' })).toBeUndefined();
      expect(errorsFor({ pricePerSeat: '5000' })).toBeUndefined();
      expect(errorsFor({ pricePerSeat: '5001' })?.pricePerSeat).toBe(message);
    });

    it('rejects decimals, text, empty, and huge values', () => {
      for (const bad of ['12.5', 'abc', '', '99999999999999999999', '-100']) {
        expect(errorsFor({ pricePerSeat: bad })?.pricePerSeat).toBe(message);
      }
    });
  });

  describe('seats', () => {
    const message = 'Seats must be a whole number between 1 and 6.';

    it('enforces 1 to 6', () => {
      expect(errorsFor({ seatsTotal: '0' })?.seatsTotal).toBe(message);
      expect(errorsFor({ seatsTotal: '1' })).toBeUndefined();
      expect(errorsFor({ seatsTotal: '6' })).toBeUndefined();
      expect(errorsFor({ seatsTotal: '7' })?.seatsTotal).toBe(message);
      expect(errorsFor({ seatsTotal: '2.5' })?.seatsTotal).toBe(message);
    });
  });

  it('reports every invalid field at once', () => {
    const result = validateRideInput(
      {
        ...valid,
        fromCity: '',
        pickupPoint: '',
        departure: '',
        pricePerSeat: '1',
        seatsTotal: '0',
        carModel: '',
      },
      NOW,
    );
    expect(result.ok).toBe(false);
    expect(!result.ok && Object.keys(result.errors).sort()).toEqual(
      ['carModel', 'departure', 'fromCity', 'pickupPoint', 'pricePerSeat', 'seatsTotal'].sort(),
    );
  });
});

describe('form data helpers', () => {
  it('reads a FormData into a raw object', () => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(rideRawToValues(valid))) formData.set(key, value);
    expect(rideFormRawFromFormData(formData)).toEqual(valid);
  });

  it('treats a missing checkbox as false', () => {
    const formData = new FormData();
    formData.set('fromCity', 'Delhi');
    const raw = rideFormRawFromFormData(formData);
    expect(raw.prefAc).toBe(false);
    expect(raw.fromCity).toBe('Delhi');
    expect(raw.toCity).toBe('');
  });

  it('echoes raw values as strings with on or empty checkboxes', () => {
    const values = rideRawToValues(valid);
    expect(values.fromCity).toBe('Delhi');
    expect(values.prefAc).toBe('on');
    expect(values.prefMusic).toBe('');
  });
});

describe('rideToFormValues', () => {
  const ride: Ride = {
    id: 'abc',
    from: 'Delhi',
    to: 'Jaipur',
    pickupPoint: 'Kashmere Gate',
    dropPoint: 'Sindhi Camp',
    departureTime: '2026-10-06T09:00:00+05:30',
    durationMins: 330,
    pricePerSeat: 500,
    seatsLeft: 3,
    seatsTotal: 3,
    driverId: 'd',
    car: { model: 'Maruti Swift', color: 'White' },
    preferences: { ac: true, music: false, pets: false, luggage: true },
  };

  it('prefills the form from a ride', () => {
    expect(rideToFormValues(ride)).toEqual(rideRawToValues(valid));
  });

  it('splits the duration into hours and minutes', () => {
    const values = rideToFormValues({ ...ride, durationMins: 105 });
    expect(values.durationHours).toBe('1');
    expect(values.durationMinutes).toBe('45');
  });
});
