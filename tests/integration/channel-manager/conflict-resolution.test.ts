import assert from 'node:assert/strict'
import test from 'node:test'
import {createClient} from '@supabase/supabase-js'

const live=process.env.VALIDATE_SUPABASE_CONFLICTS==='1'
test('resolves conflicts atomically and only cancels imported blocks',{skip:!live},async()=>{
  const url=process.env.LOCAL_SUPABASE_URL??'';assert.ok(['127.0.0.1','localhost'].includes(new URL(url).hostname))
  const client=createClient(url,process.env.LOCAL_SUPABASE_SERVICE_ROLE_KEY??'')
  const email=`conflict-admin-${Date.now()}@example.test`
  const {data:createdUser,error:userError}=await client.auth.admin.createUser({email,password:'Local-test-only-Password-42!',email_confirm:true});assert.ifError(userError)
  const admin={id:createdUser.user.id}
  const {error:adminError}=await client.from('admin_profiles').insert({id:admin.id,full_name:'Conflict Test Admin',role:'admin'});assert.ifError(adminError)
  const {data:room,error:roomError}=await client.from('rooms').select('id').limit(1).single();assert.ifError(roomError)
  const {data:channel,error:channelError}=await client.from('booking_channels').insert({name:`conflict-${Date.now()}`,provider:'custom',connection_type:'import'}).select('id').single();assert.ifError(channelError)
  const {data:mapping,error:mappingError}=await client.from('channel_room_mappings').insert({channel_id:channel.id,room_id:room.id}).select('id').single();assert.ifError(mappingError)
  const {data:reservation,error:reservationError}=await client.from('reservations').insert({reference:`EXT-${Date.now()}`,guest_name:'External availability',guest_email:`ext-${Date.now()}@calendar.invalid`,guest_count:1,room_id:room.id,check_in:'2040-01-01',check_out:'2040-01-02',total_amount:0,paid_amount:0,status:'blocked',source:'custom',channel_id:channel.id,channel_mapping_id:mapping.id}).select('id').single();assert.ifError(reservationError)
  const {data:conflict,error:conflictError}=await client.from('reservation_conflicts').insert({reservation_id:reservation.id,channel_id:channel.id,mapping_id:mapping.id,kind:'overlap'}).select('id').single();assert.ifError(conflictError)
  try{const result=await client.rpc('resolve_reservation_conflict',{p_conflict_id:conflict.id,p_action:'cancel_imported',p_note:'verified',p_admin_id:admin.id});assert.ifError(result.error);const [{data:updatedReservation},{data:updatedConflict}]=await Promise.all([client.from('reservations').select('status').eq('id',reservation.id).single(),client.from('reservation_conflicts').select('status,resolved_by').eq('id',conflict.id).single()]);assert.equal(updatedReservation?.status,'cancelled');assert.equal(updatedConflict?.status,'resolved');assert.equal(updatedConflict?.resolved_by,admin.id)}finally{await client.from('reservation_conflicts').delete().eq('id',conflict.id);await client.from('reservations').delete().eq('id',reservation.id);await client.from('channel_room_mappings').delete().eq('id',mapping.id);await client.from('booking_channels').delete().eq('id',channel.id);await client.auth.admin.deleteUser(admin.id)}
})
