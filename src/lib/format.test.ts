import { describe, expect, it } from 'vitest';
import { formatArrival, formatDate, formatDuration, formatINR, formatTime } from '@/lib/format';

describe('formatINR', () => {
  it('formats rupees with Indian grouping and no decimals', () => {
    expect(formatINR(650)).toBe('₹650');
    expect(formatINR(1200)).toBe('₹1,200');
    expect(formatINR(125000)).toBe('₹1,25,000');
  });
});

describe('formatDuration', () => {
  it('formats hours and minutes', () => {
    expect(formatDuration(300)).toBe('5h');
    expect(formatDuration(330)).toBe('5h 30m');
    expect(formatDuration(45)).toBe('45m');
  });
});

describe('formatTime', () => {
  it('formats the clock digits of an IST ISO string in 12 hour time', () => {
    expect(formatTime('2026-10-02T06:30:00+05:30')).toBe('6:30 AM');
    expect(formatTime('2026-10-02T14:00:00+05:30')).toBe('2:00 PM');
    expect(formatTime('2026-10-02T12:00:00+05:30')).toBe('12:00 PM');
    expect(formatTime('2026-10-02T00:15:00+05:30')).toBe('12:15 AM');
  });
});

describe('formatArrival', () => {
  it('adds the duration to the departure time', () => {
    expect(formatArrival('2026-10-02T06:30:00+05:30', 300)).toBe('11:30 AM');
    expect(formatArrival('2026-10-02T14:00:00+05:30', 330)).toBe('7:30 PM');
  });
});

describe('formatDate', () => {
  it('formats weekday, day, and month from the date part', () => {
    expect(formatDate('2026-10-02T06:30:00+05:30')).toBe('Fri, 2 Oct');
    expect(formatDate('2026-10-15T06:30:00+05:30')).toBe('Thu, 15 Oct');
  });
});
