import { BookingError } from './booking-errors';
import { createClient } from '@/lib/supabase/server';

export async function getMyPhone(userId: string): Promise<string | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profile_contacts')
    .select('phone')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new BookingError('unknown', error.message);
  return (data as { phone: string } | null)?.phone;
}

/** Phone numbers by user id. Row Level Security only returns the numbers the caller may see. */
export async function getPhones(userIds: string[]): Promise<Record<string, string>> {
  if (userIds.length === 0) return {};
  const supabase = await createClient();
  const { data, error } = await supabase.from('profile_contacts').select('user_id, phone').in('user_id', userIds);
  if (error) throw new BookingError('unknown', error.message);
  const phones: Record<string, string> = {};
  for (const row of data as unknown as { user_id: string; phone: string }[]) phones[row.user_id] = row.phone;
  return phones;
}

/** Update first, insert when there is no row yet (an upsert would also need to update user_id). */
export async function savePhone(userId: string, phone: string): Promise<void> {
  const supabase = await createClient();
  const updated = await supabase.from('profile_contacts').update({ phone }).eq('user_id', userId).select('user_id');
  if (updated.error) throw new BookingError('unknown', updated.error.message);
  if (updated.data && updated.data.length > 0) return;
  const inserted = await supabase.from('profile_contacts').insert({ user_id: userId, phone });
  if (inserted.error) throw new BookingError('unknown', inserted.error.message);
}

export async function removePhone(userId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('profile_contacts').delete().eq('user_id', userId);
  if (error) throw new BookingError('unknown', error.message);
}
