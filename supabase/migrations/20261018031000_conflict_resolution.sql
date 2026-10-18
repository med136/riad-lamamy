create or replace function public.resolve_reservation_conflict(
  p_conflict_id uuid,
  p_action text,
  p_note text,
  p_admin_id uuid
)
returns public.reservation_conflicts
language plpgsql
security invoker
set search_path = public
as $$
declare
  conflict_row public.reservation_conflicts;
begin
  if p_action not in ('dismiss_external', 'cancel_imported', 'mark_resolved') then
    raise exception using errcode = '22023', message = 'invalid_resolution';
  end if;
  select * into conflict_row from public.reservation_conflicts where id = p_conflict_id for update;
  if not found or conflict_row.status <> 'open' then
    raise exception using errcode = 'P0002', message = 'open_conflict_not_found';
  end if;
  if p_action = 'cancel_imported' then
    update public.reservations
    set status = 'cancelled', admin_notes = concat_ws(E'\n', nullif(admin_notes, ''), 'Cancelled during conflict resolution')
    where id = conflict_row.reservation_id and status = 'blocked' and channel_mapping_id is not null;
    if not found then raise exception using errcode = '22023', message = 'imported_block_required'; end if;
  end if;
  update public.reservation_conflicts
  set status = case when p_action = 'dismiss_external' then 'dismissed' else 'resolved' end,
      resolution_note = nullif(trim(p_note), ''), resolved_at = now(), resolved_by = p_admin_id,
      details = details || jsonb_build_object('resolution_action', p_action)
  where id = p_conflict_id returning * into conflict_row;
  return conflict_row;
end;
$$;

revoke all on function public.resolve_reservation_conflict(uuid, text, text, uuid) from public, anon, authenticated;
grant execute on function public.resolve_reservation_conflict(uuid, text, text, uuid) to service_role;
