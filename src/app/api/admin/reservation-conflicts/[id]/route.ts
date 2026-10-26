import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withAdminRoute } from '@/lib/api/admin-route'
import { uuidSchema } from '@/lib/channel-manager/validation'

type Context={params:Promise<{id:string}>}
const resolutionSchema=z.object({action:z.enum(['dismiss_external','cancel_imported','mark_resolved']),note:z.string().trim().max(1000).default('')}).strict()

export const PATCH=(request:Request,context:Context)=>withAdminRoute(request,async({admin,userId})=>{
  const {id}=await context.params;uuidSchema.parse(id)
  const input=resolutionSchema.parse(await request.json())
  const {data,error}=await admin.rpc('resolve_reservation_conflict',{p_conflict_id:id,p_action:input.action,p_note:input.note,p_admin_id:userId})
  if(error){
    if(['invalid_resolution','imported_block_required'].includes(error.message)) return NextResponse.json({error:error.message},{status:409})
    if(error.message==='open_conflict_not_found') return NextResponse.json({error:error.message},{status:404})
    throw error
  }
  return NextResponse.json({conflict:data})
},{mutation:true})
