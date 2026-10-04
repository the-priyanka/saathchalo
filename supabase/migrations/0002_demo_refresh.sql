-- Moves every demo ride to (today in IST) + demo_day_offset days at demo_time (IST).
create or replace function public.refresh_demo_rides()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.rides
  set departure_time =
    ((((now() at time zone 'Asia/Kolkata')::date + demo_day_offset) + demo_time) at time zone 'Asia/Kolkata')
  where is_demo
    and demo_day_offset is not null
    and demo_time is not null;
$$;

revoke execute on function public.refresh_demo_rides() from public, anon, authenticated;
grant execute on function public.refresh_demo_rides() to service_role;

-- Requires the pg_cron extension (Database > Extensions in the Supabase dashboard).
-- 18:35 UTC is 00:05 IST. Scheduling again with the same name updates the existing job.
select cron.schedule(
  'refresh-demo-rides',
  '35 18 * * *',
  $$select public.refresh_demo_rides()$$
);
