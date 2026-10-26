-- Phase 0: canonical room inventory and authoritative reservation insertion.
-- This migration is additive and preserves all existing reservation rows.

create extension if not exists btree_gist with schema extensions;

alter table public.rooms
  add column if not exists base_price numeric(10,2),
  add column if not exists max_guests integer,
  add column if not exists seasonal_prices jsonb not null default '{}'::jsonb;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'rooms' and column_name = 'price'
  ) then
    execute 'update public.rooms set base_price = coalesce(base_price, price) where base_price is null';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'rooms' and column_name = 'base_price_per_night'
  ) then
    execute 'update public.rooms set base_price = coalesce(base_price, base_price_per_night) where base_price is null';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'rooms' and column_name = 'max_capacity'
  ) then
    execute 'update public.rooms set max_guests = coalesce(max_guests, max_capacity) where max_guests is null';
  end if;
end $$;

update public.rooms
set base_price = coalesce(base_price, 0),
    max_guests = coalesce(max_guests, 2),
    seasonal_prices = coalesce(seasonal_prices, '{}'::jsonb);

alter table public.rooms
  alter column base_price set default 0,
  alter column base_price set not null,
  alter column max_guests set default 2,
  alter column max_guests set not null;

alter table public.rooms
  drop constraint if exists rooms_base_price_nonnegative,
  add constraint rooms_base_price_nonnegative check (base_price >= 0),
  drop constraint if exists rooms_max_guests_positive,
  add constraint rooms_max_guests_positive check (max_guests > 0);

-- Convert the legacy enum to a constrained text column. This avoids unsafe
-- same-transaction enum-value usage while retaining a closed status set.
alter table public.reservations alter column status drop default;
alter table public.reservations
  alter column status type text using status::text;
alter table public.reservations
  alter column status set default 'pending',
  alter column status set not null;
alter table public.reservations
  drop constraint if exists reservations_status_valid,
  add constraint reservations_status_valid
    check (status in ('pending', 'confirmed', 'blocked', 'cancelled', 'completed', 'rejected'));

alter table public.reservations
  add column if not exists source text not null default 'direct',
  add column if not exists channel_id uuid,
  add column if not exists channel_mapping_id uuid,
  add column if not exists external_uid text,
  add column if not exists external_revision text,
  add column if not exists external_status text,
  add column if not exists imported_at timestamptz,
  add column if not exists last_seen_at timestamptz,
  add column if not exists raw_external_data jsonb;

alter table public.reservations
  drop constraint if exists reservations_dates_valid,
  add constraint reservations_dates_valid check (check_out > check_in),
  drop constraint if exists reservations_source_valid,
  add constraint reservations_source_valid
    check (source in ('direct', 'airbnb', 'booking', 'expedia', 'tripadvisor', 'custom'));

create index if not exists reservations_room_dates_idx
  on public.reservations (room_id, check_in, check_out);
create index if not exists reservations_source_idx
  on public.reservations (source, status);

create or replace function public.reservation_overlap_preflight()
returns table (
  room_id uuid,
  first_reservation_id uuid,
  second_reservation_id uuid,
  first_check_in date,
  first_check_out date,
  second_check_in date,
  second_check_out date
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    first_reservation.room_id,
    first_reservation.id,
    second_reservation.id,
    first_reservation.check_in,
    first_reservation.check_out,
    second_reservation.check_in,
    second_reservation.check_out
  from public.reservations first_reservation
  join public.reservations second_reservation
    on second_reservation.room_id = first_reservation.room_id
   and second_reservation.id > first_reservation.id
   and daterange(second_reservation.check_in, second_reservation.check_out, '[)')
       && daterange(first_reservation.check_in, first_reservation.check_out, '[)')
  where first_reservation.room_id is not null
    and first_reservation.status in ('pending', 'confirmed', 'blocked')
    and second_reservation.status in ('pending', 'confirmed', 'blocked');
$$;

revoke all on function public.reservation_overlap_preflight() from public, anon, authenticated;
grant execute on function public.reservation_overlap_preflight() to service_role;

do $$
begin
  if exists (select 1 from public.reservation_overlap_preflight() limit 1) then
    raise exception using
      errcode = 'P0001',
      message = 'existing_reservation_overlaps',
      hint = 'Resolve rows returned by reservation_overlap_preflight() before retrying.';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.reservations'::regclass
      and conname = 'reservations_no_active_overlap'
  ) then
    alter table public.reservations
      add constraint reservations_no_active_overlap
      exclude using gist (
        room_id with =,
        daterange(check_in, check_out, '[)') with &&
      )
      where (
        room_id is not null
        and status in ('pending', 'confirmed', 'blocked')
      );
  end if;
end $$;

create or replace function public.create_reservation_authoritatively(
  p_reference text,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_guest_count integer,
  p_room_id uuid,
  p_check_in date,
  p_check_out date,
  p_total_amount numeric,
  p_paid_amount numeric default 0,
  p_status text default 'pending',
  p_special_requests text default null,
  p_admin_notes text default null,
  p_source text default 'direct'
)
returns public.reservations
language plpgsql
security invoker
set search_path = public
as $$
declare
  selected_room public.rooms%rowtype;
  created_reservation public.reservations%rowtype;
begin
  if p_check_in is null or p_check_out is null or p_check_out <= p_check_in then
    raise exception using errcode = '22007', message = 'invalid_dates';
  end if;

  if coalesce(p_guest_count, 0) < 1 then
    raise exception using errcode = '22023', message = 'invalid_guest_count';
  end if;

  select * into selected_room
  from public.rooms
  where id = p_room_id;

  if not found then
    raise exception using errcode = 'P0002', message = 'room_not_found';
  end if;

  if selected_room.status::text <> 'available' then
    raise exception using errcode = 'P0001', message = 'room_unavailable';
  end if;

  if p_guest_count > selected_room.max_guests then
    raise exception using errcode = '22023', message = 'capacity_exceeded';
  end if;

  if p_status not in ('pending', 'confirmed', 'blocked') then
    raise exception using errcode = '22023', message = 'invalid_initial_status';
  end if;

  begin
    insert into public.reservations (
      reference,
      guest_name,
      guest_email,
      guest_phone,
      guest_count,
      room_id,
      check_in,
      check_out,
      total_amount,
      paid_amount,
      status,
      special_requests,
      admin_notes,
      source
    ) values (
      p_reference,
      trim(p_guest_name),
      lower(trim(p_guest_email)),
      nullif(trim(p_guest_phone), ''),
      p_guest_count,
      p_room_id,
      p_check_in,
      p_check_out,
      p_total_amount,
      coalesce(p_paid_amount, 0),
      p_status,
      nullif(trim(p_special_requests), ''),
      nullif(trim(p_admin_notes), ''),
      p_source
    )
    returning * into created_reservation;
  exception
    when exclusion_violation then
      raise exception using errcode = 'P0001', message = 'availability_conflict';
  end;

  return created_reservation;
end;
$$;

revoke all on function public.create_reservation_authoritatively(
  text, text, text, text, integer, uuid, date, date, numeric, numeric, text, text, text, text
) from public, anon, authenticated;
grant execute on function public.create_reservation_authoritatively(
  text, text, text, text, integer, uuid, date, date, numeric, numeric, text, text, text, text
) to service_role;
