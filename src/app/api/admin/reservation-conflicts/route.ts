import { NextResponse } from 'next/server'
import { withAdminRoute } from '@/lib/api/admin-route'

export const GET = (request:Request) => withAdminRoute(request,async({admin})=>{
  const url=new URL(request.url)
  const status=url.searchParams.get('status')??'open'
  if(!['open','resolved','dismissed','all'].includes(status)) return NextResponse.json({error:'invalid_status'},{status:400})
  let query=admin.from('reservation_conflicts')
    .select('id, reservation_id, channel_id, mapping_id, external_uid, kind, status, details, resolution_note, resolved_at, created_at, booking_channels(name, provider), channel_room_mappings(room_id, rooms(name))',{count:'exact'})
    .order('created_at',{ascending:false}).limit(100)
  if(status!=='all') query=query.eq('status',status)
  const {data,error,count}=await query
  if(error) throw error
  return NextResponse.json({conflicts:data??[],count:count??0})
})
