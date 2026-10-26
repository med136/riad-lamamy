create table public.booking_channels (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 120),
  provider text not null check (provider in ('airbnb', 'booking', 'expedia', 'vrbo', 'tripadvisor', 'custom')),
  connection_type text not null check (connection_type in ('import', 'export', 'bidirectional')),
  enabled boolean not null default false,
  import_url_encrypted text,
  import_url_host text,
  sync_interval_minutes integer not null default 60 check (sync_interval_minutes between 15 and 10080),
  health text not null default 'not_configured' check (health in ('not_configured', 'healthy', 'degraded', 'failing', 'disabled')),
  consecutive_failures integer not null default 0 check (consecutive_failures >= 0),
  last_synced_at timestamptz,
  last_error_code text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.channel_room_mappings (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.booking_channels(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete restrict,
  enabled boolean not null default false,
  external_room_id text,
  export_token_hash text,
  export_token_hint text,
  stale_observation_count integer not null default 0 check (stale_observation_count >= 0),
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (channel_id, room_id)
);

create table public.channel_sync_runs (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.booking_channels(id) on delete restrict,
  mapping_id uuid references public.channel_room_mappings(id) on delete set null,
  trigger text not null check (trigger in ('manual', 'scheduled', 'retry', 'validation')),
  status text not null check (status in ('running', 'succeeded', 'partial', 'failed', 'skipped')),
  fetched_count integer not null default 0 check (fetched_count >= 0),
  created_count integer not null default 0 check (created_count >= 0),
  updated_count integer not null default 0 check (updated_count >= 0),
  cancelled_count integer not null default 0 check (cancelled_count >= 0),
  conflict_count integer not null default 0 check (conflict_count >= 0),
  error_code text,
  error_summary text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.reservation_conflicts (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid references public.reservations(id) on delete set null,
  conflicting_reservation_id uuid references public.reservations(id) on delete set null,
  channel_id uuid references public.booking_channels(id) on delete set null,
  mapping_id uuid references public.channel_room_mappings(id) on delete set null,
  external_uid text,
  kind text not null check (kind in ('overlap', 'invalid_dates', 'unsupported_recurrence', 'external_update')),
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  details jsonb not null default '{}'::jsonb,
  resolution_note text,
  resolved_at timestamptz,
  resolved_by uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.reservations
  add column external_missing_observations integer not null default 0
    check (external_missing_observations >= 0),
  add constraint reservations_channel_id_fkey foreign key (channel_id)
    references public.booking_channels(id) on delete set null,
  add constraint reservations_channel_mapping_id_fkey foreign key (channel_mapping_id)
    references public.channel_room_mappings(id) on delete set null;

create unique index reservations_external_event_identity
  on public.reservations (channel_mapping_id, external_uid)
  where channel_mapping_id is not null and external_uid is not null;
create index booking_channels_due_sync_idx
  on public.booking_channels (enabled, last_synced_at, sync_interval_minutes)
  where archived_at is null;
create index channel_room_mappings_room_idx on public.channel_room_mappings (room_id, enabled);
create index channel_sync_runs_channel_started_idx on public.channel_sync_runs (channel_id, started_at desc);
create index reservation_conflicts_open_idx on public.reservation_conflicts (status, created_at desc)
  where status = 'open';

create trigger booking_channels_touch_updated_at
  before update on public.booking_channels
  for each row execute function public.update_updated_at_column();
create trigger channel_room_mappings_touch_updated_at
  before update on public.channel_room_mappings
  for each row execute function public.update_updated_at_column();
create trigger reservation_conflicts_touch_updated_at
  before update on public.reservation_conflicts
  for each row execute function public.update_updated_at_column();

alter table public.booking_channels enable row level security;
alter table public.channel_room_mappings enable row level security;
alter table public.channel_sync_runs enable row level security;
alter table public.reservation_conflicts enable row level security;

revoke all on public.booking_channels from public, anon, authenticated;
revoke all on public.channel_room_mappings from public, anon, authenticated;
revoke all on public.channel_sync_runs from public, anon, authenticated;
revoke all on public.reservation_conflicts from public, anon, authenticated;
grant all on public.booking_channels to service_role;
grant all on public.channel_room_mappings to service_role;
grant all on public.channel_sync_runs to service_role;
grant all on public.reservation_conflicts to service_role;
