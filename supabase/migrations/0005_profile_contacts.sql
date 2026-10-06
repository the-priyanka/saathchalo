-- Phase 2C part 2: optional phone numbers, shown only to the two sides of an accepted booking.
create table public.profile_contacts (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  phone text not null check (phone ~ '^\+?[0-9]{10,15}$')
);

alter table public.profile_contacts enable row level security;

-- The shared demo account has a public password, so it must never read or store phones: otherwise any visitor could read a real passenger's phone or plant one.
-- The owner, or the other side of an accepted booking until 24 hours after departure.
create policy "owners and accepted booking partners read phone numbers"
  on public.profile_contacts for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or (
      (select auth.jwt() ->> 'email') is distinct from 'demo@saathchalo.test'
      and exists (
        select 1
        from public.bookings b
        join public.rides r on r.id = b.ride_id
        where b.status = 'accepted'
          and r.departure_time > now() - interval '24 hours'
          and (
            (b.passenger_id = (select auth.uid()) and r.driver_id = profile_contacts.user_id)
            or (r.driver_id = (select auth.uid()) and b.passenger_id = profile_contacts.user_id)
          )
      )
    )
  );

create policy "owners add their phone number"
  on public.profile_contacts for insert
  to authenticated
  with check (user_id = (select auth.uid()) and (select auth.jwt() ->> 'email') is distinct from 'demo@saathchalo.test');

create policy "owners change their phone number"
  on public.profile_contacts for update
  to authenticated
  using (user_id = (select auth.uid()) and (select auth.jwt() ->> 'email') is distinct from 'demo@saathchalo.test')
  with check (user_id = (select auth.uid()) and (select auth.jwt() ->> 'email') is distinct from 'demo@saathchalo.test');

create policy "owners remove their phone number"
  on public.profile_contacts for delete
  to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.profile_contacts from anon, authenticated;
grant select, delete on public.profile_contacts to authenticated;
grant insert (user_id, phone) on public.profile_contacts to authenticated;
-- user_id is included because a PostgREST upsert on user_id sets it in ON CONFLICT DO UPDATE. The update policy check still stops anyone changing the owner.
grant update (user_id, phone) on public.profile_contacts to authenticated;
grant all on public.profile_contacts to service_role;
