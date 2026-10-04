import { describe, expect, it } from 'vitest';
import { firstParam, safeNextPath } from '@/lib/safe-next';

describe('safeNextPath', () => {
  it('keeps same-site paths', () => {
    expect(safeNextPath('/account')).toBe('/account');
    expect(safeNextPath('/rides?from=Delhi&to=Pune')).toBe('/rides?from=Delhi&to=Pune');
  });

  it('falls back for anything that could leave the site', () => {
    for (const bad of ['//evil.com', 'https://evil.com', '/\\evil.com', 'javascript:alert(1)', 'account', '']) {
      expect(safeNextPath(bad)).toBe('/account');
    }
    expect(safeNextPath(undefined)).toBe('/account');
    expect(safeNextPath(null, '/')).toBe('/');
  });
});

describe('firstParam', () => {
  it('returns the first value of a repeated param', () => {
    expect(firstParam(['a', 'b'])).toBe('a');
    expect(firstParam('a')).toBe('a');
    expect(firstParam(undefined)).toBeUndefined();
  });
});
