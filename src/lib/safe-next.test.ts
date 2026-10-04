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

  it('rejects control characters that could be stripped by URL parser', () => {
    expect(safeNextPath('/\t/evil.com')).toBe('/account');
    expect(safeNextPath('/\n/evil.com')).toBe('/account');
    expect(safeNextPath('/\r/evil.com')).toBe('/account');
  });

  it('allows encoded slashes and query strings', () => {
    expect(safeNextPath('/%2F%2Fevil.com')).toBe('/%2F%2Fevil.com');
    expect(safeNextPath('/account?x=1#top')).toBe('/account?x=1#top');
  });
});

describe('firstParam', () => {
  it('returns the first value of a repeated param', () => {
    expect(firstParam(['a', 'b'])).toBe('a');
    expect(firstParam('a')).toBe('a');
    expect(firstParam(undefined)).toBeUndefined();
  });
});
