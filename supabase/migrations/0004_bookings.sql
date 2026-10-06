-- Phase 2C part 1: bookings.

-- Ride status and the seat count that demo rides return to every night.
alter table public.rides
  add column status text not null default 'active' check (status in ('active', 'cancelled')),
  add column demo_seats_left integer check (demo_seats_left >= 0);

-- Bookings. Clients can only read them. Every change goes through the functions below.
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  ride_id text not null references public.rides (id) on delete cascade,
  passenger_id uuid not null references public.profiles (id) on delete cascade,
  seats integer not null check (seats between 1 and 6),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'cancelled', 'cancelled_by_driver')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One active booking per passenger per ride.
create unique index bookings_one_active_per_ride
  on public.bookings (ride_id, passenger_id)
  where status in ('pending', 'accepted');
create index bookings_ride_idx on public.bookings (ride_id);
create index bookings_passenger_idx on public.bookings (passenger_id);

alter table public.bookings enable row level security;

create policy "passengers and drivers read their bookings"
  on public.bookings for select
  to authenticated
  using (
    passenger_id = (select auth.uid())
    or exists (
      select 1 from public.rides r
      where r.id = bookings.ride_id and r.driver_id = (select auth.uid())
    )
  );

revoke all on public.bookings from anon, authenticated;
grant select on public.bookings to authenticated;
grant all on public.bookings to service_role;

-- A ride that ever had a booking is cancelled, never deleted.
drop policy "drivers delete their own upcoming rides" on public.rides;

create policy "drivers delete their own upcoming rides"
  on public.rides for delete
  to authenticated
  using (
    driver_id = (select auth.uid())
    and is_demo = false
    and departure_time > now()
    and not exists (select 1 from public.bookings b where b.ride_id = rides.id)
  );

-- Replaces the Phase 2B trigger function: seats_left now follows bookings, and booked rides are locked.
create or replace function public.rides_enforce_rules()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  booked integer;
begin
  if tg_op = 'INSERT' then
    new.seats_left := new.seats_total;
  elsif new.seats_total is distinct from old.seats_total then
    booked := old.seats_total - old.seats_left;
    if new.seats_total < booked then
      raise exception 'seats_below_booked';
    end if;
    new.seats_left := new.seats_total - booked;
  end if;

  -- Writes from roles other than the API roles (the service role, the SQL editor, migrations, the functions below) skip the rules.
  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.departure_time < now() + interval '1 hour' or new.departure_time > now() + interval '90 days' then
      raise exception 'ride_time_window';
    end if;
    if (
      select count(*)
      from public.rides r
      where r.driver_id = new.driver_id
        and not r.is_demo
        and r.status = 'active'
        and r.departure_time > now()
    ) >= 10 then
      raise exception 'ride_limit_reached';
    end if;
  else
    if (
      new.from_city is distinct from old.from_city
      or new.to_city is distinct from old.to_city
      or new.pickup_point is distinct from old.pickup_point
      or new.drop_point is distinct from old.drop_point
      or new.departure_time is distinct from old.departure_time
    ) and exists (
      select 1 from public.bookings b
      where b.ride_id = new.id and b.status in ('pending', 'accepted')
    ) then
      raise exception 'ride_locked';
    end if;

    if new.departure_time is distinct from old.departure_time then
      if new.departure_time < now() + interval '1 hour' or new.departure_time > now() + interval '90 days' then
        raise exception 'ride_time_window';
      end if;
    end if;
  end if;

  return new;
end;
$$;

-- Passenger asks for seats. Demo rides confirm instantly so visitors can try the flow.
create function public.request_booking(p_ride_id text, p_seats integer)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  r public.rides%rowtype;
  new_id uuid;
begin
  if uid is null then
    raise exception 'not_signed_in';
  end if;
  if p_seats is null or p_seats < 1 or p_seats > 6 then
    raise exception 'not_enough_seats';
  end if;

  select * into r from public.rides where id = p_ride_id for update;
  if not found or r.status <> 'active' or r.departure_time <= now() then
    raise exception 'ride_not_bookable';
  end if;
  if r.driver_id = uid then
    raise exception 'own_ride';
  end if;
  if p_seats > r.seats_left then
    raise exception 'not_enough_seats';
  end if;

  begin
    insert into public.bookings (ride_id, passenger_id, seats, status)
    values (r.id, uid, p_seats, case when r.is_demo then 'accepted' else 'pending' end)
    returning id into new_id;
  exception when unique_violation then
    raise exception 'booking_exists';
  end;

  if r.is_demo then
    update public.rides set seats_left = seats_left - p_seats where id = r.id;
  end if;

  return new_id;
end;
$$;

-- Driver accepts or rejects a pending request.
create function public.respond_booking(p_booking_id uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  b public.bookings%rowtype;
  r public.rides%rowtype;
begin
  if uid is null then
    raise exception 'not_signed_in';
  end if;

  select * into b from public.bookings where id = p_booking_id;
  if not found then
    raise exception 'not_allowed';
  end if;

  select * into r from public.rides where id = b.ride_id for update;
  if not found or r.driver_id <> uid then
    raise exception 'not_allowed';
  end if;

  -- Read the booking again now that the ride is locked.
  select * into b from public.bookings where id = p_booking_id for update;
  if b.status <> 'pending' then
    raise exception 'booking_not_pending';
  end if;
  if r.status <> 'active' or r.departure_time <= now() then
    raise exception 'ride_not_bookable';
  end if;

  if p_accept then
    if r.seats_left < b.seats then
      raise exception 'not_enough_seats';
    end if;
    update public.rides set seats_left = seats_left - b.seats where id = r.id;
    update public.bookings set status = 'accepted', updated_at = now() where id = b.id;
  else
    update public.bookings set status = 'rejected', updated_at = now() where id = b.id;
  end if;
end;
$$;

-- Passenger cancels a pending or accepted booking before departure.
create function public.cancel_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  b public.bookings%rowtype;
  r public.rides%rowtype;
begin
  if uid is null then
    raise exception 'not_signed_in';
  end if;

  select * into b from public.bookings where id = p_booking_id;
  if not found or b.passenger_id <> uid then
    raise exception 'not_allowed';
  end if;

  select * into r from public.rides where id = b.ride_id for update;
  select * into b from public.bookings where id = p_booking_id for update;
  if b.status not in ('pending', 'accepted') then
    raise exception 'booking_not_active';
  end if;
  if r.departure_time <= now() then
    raise exception 'ride_not_bookable';
  end if;

  if b.status = 'accepted' then
    update public.rides set seats_left = least(seats_total, seats_left + b.seats) where id = r.id;
  end if;
  update public.bookings set status = 'cancelled', updated_at = now() where id = b.id;
end;
$$;

-- Driver cancels a whole ride. Its pending and accepted bookings are cancelled with it.
create function public.cancel_ride(p_ride_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  r public.rides%rowtype;
begin
  if uid is null then
    raise exception 'not_signed_in';
  end if;

  select * into r from public.rides where id = p_ride_id for update;
  if not found or r.driver_id <> uid or r.is_demo then
    raise exception 'not_allowed';
  end if;
  if r.status <> 'active' or r.departure_time <= now() then
    raise exception 'ride_not_bookable';
  end if;

  update public.bookings
  set status = 'cancelled_by_driver', updated_at = now()
  where ride_id = r.id and status in ('pending', 'accepted');
  update public.rides set status = 'cancelled' where id = r.id;
end;
$$;

revoke execute on function public.request_booking(text, integer) from public, anon;
revoke execute on function public.respond_booking(uuid, boolean) from public, anon;
revoke execute on function public.cancel_booking(uuid) from public, anon;
revoke execute on function public.cancel_ride(text) from public, anon;
grant execute on function public.request_booking(text, integer) to authenticated;
grant execute on function public.respond_booking(uuid, boolean) to authenticated;
grant execute on function public.cancel_booking(uuid) to authenticated;
grant execute on function public.cancel_ride(text) to authenticated;

-- Nightly refresh: also restores demo seats and clears bookings on demo rides.
create or replace function public.refresh_demo_rides()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.rides
  set departure_time =
        ((((now() at time zone 'Asia/Kolkata')::date + demo_day_offset) + demo_time) at time zone 'Asia/Kolkata'),
      seats_left = coalesce(demo_seats_left, seats_left)
  where is_demo
    and demo_day_offset is not null
    and demo_time is not null;

  delete from public.bookings
  where ride_id in (select id from public.rides where is_demo);

  delete from public.rides
  where not is_demo
    and driver_id in (select id from auth.users where email = 'demo@saathchalo.test');
$$;
