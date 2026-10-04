-- Profiles: one row per auth user, created by a trigger on signup.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  bio text not null default '',
  avatar_url text,
  rating numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  review_count integer not null default 0 check (review_count >= 0),
  verified boolean not null default false,
  member_since integer not null default (extract(year from now())::integer),
  created_at timestamptz not null default now(),
  constraint profiles_full_name_check check (char_length(trim(full_name)) between 1 and 80),
  constraint profiles_bio_check check (char_length(bio) <= 500)
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'Traveller')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Rides
create table public.rides (
  id text primary key,
  driver_id uuid not null references public.profiles (id) on delete cascade,
  from_city text not null,
  to_city text not null,
  pickup_point text not null,
  drop_point text not null,
  departure_time timestamptz not null,
  duration_mins integer not null check (duration_mins > 0),
  price_per_seat integer not null check (price_per_seat >= 0),
  seats_left integer not null,
  seats_total integer not null,
  car_model text not null,
  car_color text not null,
  pref_ac boolean not null default false,
  pref_music boolean not null default false,
  pref_pets boolean not null default false,
  pref_luggage boolean not null default false,
  is_demo boolean not null default false,
  demo_day_offset integer check (demo_day_offset between 1 and 14),
  demo_time time,
  created_at timestamptz not null default now(),
  constraint rides_seats_check check (seats_left >= 0 and seats_left <= seats_total),
  constraint rides_seats_total_check check (seats_total > 0),
  constraint rides_demo_fields_check check (not is_demo or (demo_day_offset is not null and demo_time is not null))
);

create index rides_route_time_idx on public.rides (from_city, to_city, departure_time);
create index rides_departure_idx on public.rides (departure_time);
create index rides_driver_idx on public.rides (driver_id);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.rides enable row level security;

-- profiles: everyone can read, users can edit only their own name, bio and avatar.
create policy "profiles are public"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "users update their own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name, bio, avatar_url) on public.profiles to authenticated;

-- rides: everyone can read, drivers manage only their own non-demo rides.
create policy "rides are public"
  on public.rides for select
  to anon, authenticated
  using (true);

create policy "drivers insert their own rides"
  on public.rides for insert
  to authenticated
  with check (driver_id = (select auth.uid()) and is_demo = false);

create policy "drivers update their own rides"
  on public.rides for update
  to authenticated
  using (driver_id = (select auth.uid()) and is_demo = false)
  with check (driver_id = (select auth.uid()) and is_demo = false);

create policy "drivers delete their own rides"
  on public.rides for delete
  to authenticated
  using (driver_id = (select auth.uid()) and is_demo = false);

revoke insert, update, delete on public.rides from anon;

-- Explicit grants so access does not depend on project default privileges.
grant select on public.profiles to anon, authenticated;
grant select on public.rides to anon, authenticated;
grant insert, update, delete on public.rides to authenticated;
grant all on public.profiles, public.rides to service_role;
