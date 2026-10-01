import { describe, expect, it } from 'vitest';
import { parseSearchParams, toSearchHref } from '@/lib/search-params';

describe('parseSearchParams', () => {
  it('returns defaults for empty params', () => {
    expect(parseSearchParams({})).toEqual({ query: { seats: 1 }, filters: {}, sort: 'earliest' });
  });

  it('trims from and to and drops blank values', () => {
    const { query } = parseSearchParams({ from: '  Delhi ', to: '   ' });
    expect(query.from).toBe('Delhi');
    expect(query.to).toBeUndefined();
  });

  it('keeps a valid date and drops invalid ones', () => {
    expect(parseSearchParams({ date: '2026-10-02' }).query.date).toBe('2026-10-02');
    expect(parseSearchParams({ date: '2026-13-45' }).query.date).toBeUndefined();
    expect(parseSearchParams({ date: '02-10-2026' }).query.date).toBeUndefined();
  });

  it('falls back to 1 seat when seats is invalid or out of range', () => {
    expect(parseSearchParams({ seats: 'abc' }).query.seats).toBe(1);
    expect(parseSearchParams({ seats: '0' }).query.seats).toBe(1);
    expect(parseSearchParams({ seats: '9' }).query.seats).toBe(1);
    expect(parseSearchParams({ seats: '3' }).query.seats).toBe(3);
  });

  it('parses filters', () => {
    const { filters } = parseSearchParams({
      maxPrice: '500',
      time: 'morning,evening,night',
      minRating: '4.5',
      verified: '1',
    });
    expect(filters).toEqual({
      maxPrice: 500,
      timeOfDay: ['morning', 'evening'],
      minRating: 4.5,
      verifiedOnly: true,
    });
  });

  it('ignores invalid filters', () => {
    const { filters } = parseSearchParams({ maxPrice: '-5', minRating: '9', verified: '0', time: 'night' });
    expect(filters).toEqual({});
  });

  it('parses sort and falls back to earliest', () => {
    expect(parseSearchParams({ sort: 'cheapest' }).sort).toBe('cheapest');
    expect(parseSearchParams({ sort: 'bogus' }).sort).toBe('earliest');
  });

  it('uses the first value when a param is repeated', () => {
    expect(parseSearchParams({ from: ['Delhi', 'Pune'] }).query.from).toBe('Delhi');
  });
});

describe('toSearchHref', () => {
  it('returns /rides when nothing is set', () => {
    expect(toSearchHref({}, {}, 'earliest')).toBe('/rides');
  });

  it('omits blank from and to, seats of 1, and the default sort', () => {
    expect(toSearchHref({ from: '  ', to: 'Pune', seats: 1 }, {}, 'earliest')).toBe('/rides?to=Pune');
  });

  it('builds a full URL', () => {
    const href = toSearchHref(
      { from: 'Delhi', to: 'Chandigarh', date: '2026-10-02', seats: 2 },
      { maxPrice: 500, timeOfDay: ['morning', 'evening'], minRating: 4.5, verifiedOnly: true },
      'cheapest',
    );
    expect(href).toBe(
      '/rides?from=Delhi&to=Chandigarh&date=2026-10-02&seats=2&maxPrice=500&time=morning%2Cevening&minRating=4.5&verified=1&sort=cheapest',
    );
  });

  it('round-trips through parseSearchParams', () => {
    const query = { from: 'Delhi', to: 'Chandigarh', date: '2026-10-02', seats: 2 };
    const filters = { maxPrice: 500, timeOfDay: ['morning' as const], minRating: 4.5, verifiedOnly: true };
    const href = toSearchHref(query, filters, 'best-rated');
    const raw = Object.fromEntries(new URLSearchParams(href.split('?')[1]));
    expect(parseSearchParams(raw)).toEqual({ query, filters, sort: 'best-rated' });
  });
});
