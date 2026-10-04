export type SupabaseEnv = { url: string; anonKey: string };

export function requireSupabaseEnv(values: { url?: string; anonKey?: string }): SupabaseEnv {
  const url = values.url?.trim();
  const anonKey = values.anonKey?.trim();
  if (!url || !anonKey) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see .env.example).',
    );
  }
  return { url, anonKey };
}

/** Literal property reads on purpose: Next.js only inlines NEXT_PUBLIC_ vars written this way. */
export function readSupabaseEnv(): SupabaseEnv {
  return requireSupabaseEnv({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

export function hasSupabaseEnv(): boolean {
  try {
    readSupabaseEnv();
    return true;
  } catch {
    return false;
  }
}
