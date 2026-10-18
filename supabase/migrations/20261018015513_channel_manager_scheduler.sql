alter table public.channel_room_mappings
  add column sync_lock_token uuid,
  add column sync_lock_until timestamptz,
  add column next_retry_at timestamptz;

create or replace function public.claim_channel_sync_lock(
  p_mapping_id uuid,
  p_lock_token uuid,
  p_ttl_seconds integer default 300
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  affected integer := 0;
begin
  if p_ttl_seconds < 30 or p_ttl_seconds > 900 then
    raise exception using errcode = '22023', message = 'invalid_lock_ttl';
  end if;
  if not pg_try_advisory_xact_lock(hashtextextended(p_mapping_id::text, 0)) then
    return false;
  end if;
  update public.channel_room_mappings
  set sync_lock_token = p_lock_token,
      sync_lock_until = now() + make_interval(secs => p_ttl_seconds)
  where id = p_mapping_id
    and enabled = true
    and (sync_lock_until is null or sync_lock_until < now());
  get diagnostics affected = row_count;
  return affected = 1;
end;
$$;

create or replace function public.release_channel_sync_lock(
  p_mapping_id uuid,
  p_lock_token uuid
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  affected integer := 0;
begin
  update public.channel_room_mappings
  set sync_lock_token = null, sync_lock_until = null
  where id = p_mapping_id and sync_lock_token = p_lock_token;
  get diagnostics affected = row_count;
  return affected = 1;
end;
$$;

revoke all on function public.claim_channel_sync_lock(uuid, uuid, integer) from public, anon, authenticated;
revoke all on function public.release_channel_sync_lock(uuid, uuid) from public, anon, authenticated;
grant execute on function public.claim_channel_sync_lock(uuid, uuid, integer) to service_role;
grant execute on function public.release_channel_sync_lock(uuid, uuid) to service_role;
