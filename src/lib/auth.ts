import { cache } from 'react';
import { hasSupabaseEnv } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';

/** The shared demo account (public password). It cannot store or read phone numbers. */
export const DEMO_EMAIL = 'demo@saathchalo.test';

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  bio: string;
  memberSince: number;
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!hasSupabaseEnv()) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, bio, member_since')
      .eq('id', user.id)
      .maybeSingle();

    return {
      id: user.id,
      email: user.email ?? '',
      fullName: profile?.full_name ?? user.email?.split('@')[0] ?? 'Traveller',
      bio: profile?.bio ?? '',
      memberSince: profile?.member_since ?? new Date().getFullYear(),
    };
  } catch {
    return null;
  }
});
