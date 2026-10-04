import { describe, expect, it } from 'vitest';
import { requireSupabaseEnv } from '@/lib/env';

describe('requireSupabaseEnv', () => {
  it('returns trimmed values when both are set', () => {
    expect(requireSupabaseEnv({ url: ' https://x.supabase.co ', anonKey: ' key ' })).toEqual({
      url: 'https://x.supabase.co',
      anonKey: 'key',
    });
  });

  it('throws a helpful error when the url is missing', () => {
    expect(() => requireSupabaseEnv({ anonKey: 'key' })).toThrow(/Supabase is not configured/);
  });

  it('throws when the key is blank', () => {
    expect(() => requireSupabaseEnv({ url: 'https://x.supabase.co', anonKey: '  ' })).toThrow(
      /\.env\.local/,
    );
  });
});
