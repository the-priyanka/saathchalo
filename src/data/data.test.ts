import { describe, expect, it } from 'vitest';
import { drivers } from '@/data/drivers';
import { buildRides } from '@/data/rides';
import { CITIES } from '@/lib/cities';

// 10:00 IST on 1 October 2026
const NOW = new Date('2026-10-01T04:30:00Z');

describe('mock data', () => {
  const rides = buildRides(NOW);

  it('has 8 drivers and 14 rides', () => {
    expect(drivers).toHaveLength(8);
    expect(rides).toHaveLength(14);
  });

  it('has unique ride ids', () => {
    expect(new Set(rides.map((r) => r.id)).size).toBe(rides.length);
  });

  it('gives every ride an existing driver', () => {
    const ids = new Set(drivers.map((d) => d.id));
    for (const ride of rides) expect(ids.has(ride.driverId)).toBe(true);
  });

  it('only uses known cities', () => {
    const cities: readonly string[] = CITIES;
    for (const ride of rides) {
      expect(cities).toContain(ride.from);
      expect(cities).toContain(ride.to);
    }
  });

  it('keeps seatsLeft between 1 and seatsTotal', () => {
    for (const ride of rides) {
      expect(ride.seatsLeft).toBeGreaterThanOrEqual(1);
      expect(ride.seatsLeft).toBeLessThanOrEqual(ride.seatsTotal);
    }
  });

  it('builds IST ISO times', () => {
    for (const ride of rides) {
      expect(ride.departureTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\+05:30$/);
    }
  });

  it('schedules every ride 1 to 14 days after today in IST', () => {
    for (const ride of rides) {
      const date = ride.departureTime.slice(0, 10);
      expect(date >= '2026-10-02').toBe(true);
      expect(date <= '2026-10-15').toBe(true);
    }
  });

  it('moves dates forward when now moves forward', () => {
    const later = buildRides(new Date('2026-10-11T04:30:00Z'));
    expect(later[0].departureTime.slice(0, 10)).toBe('2026-10-12');
  });
});
