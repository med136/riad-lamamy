import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withAdminRoute } from '@/lib/api/admin-route'
import { projectCalendarRows } from '@/lib/channel-manager/calendar'

const querySchema = z.object({
  from: z.iso.date(), to: z.iso.date(), roomId: z.uuid().optional(),
  source: z.string().trim().max(40).optional(), status: z.string().trim().max(40).optional(), channelId: z.uuid().optional(),
})

export const GET = (request: Request) => withAdminRoute(request, async ({admin}) => {
  const url = new URL(request.url)
  const input = querySchema.parse(Object.fromEntries(url.searchParams))
  if (input.from >= input.to) return NextResponse.json({error:'invalid_date_range'},{status:400})
  let query = admin.from('reservations')
    .select('id, reference, guest_name, room_id, check_in, check_out, status, source, channel_id, rooms(name), booking_channels(name, provider)')
    .lt('check_in', input.to).gt('check_out', input.from).order('check_in').limit(500)
  if (input.roomId) query = query.eq('room_id', input.roomId)
  if (input.source) query = query.eq('source', input.source)
  if (input.status) query = query.eq('status', input.status)
  if (input.channelId) query = query.eq('channel_id', input.channelId)
  const {data,error}=await query
  if(error) throw error
  return NextResponse.json({items:projectCalendarRows(data??[])})
})
