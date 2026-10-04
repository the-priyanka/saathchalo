import { createClient } from '@supabase/supabase-js';
import { readSupabaseEnv } from '@/lib/env';

/** Stateless anon client for public reads. Row Level Security decides what it can see. */
export function createPublicClient() {
  const { url, anonKey } = readSupabaseEnv();
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
