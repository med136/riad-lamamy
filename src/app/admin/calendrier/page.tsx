'use client'
import { useCallback,useEffect,useMemo,useState } from 'react'
import { ChevronLeft,ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { CalendarFilters,type Filters } from '@/components/admin/calendar/CalendarFilters'
import { ReservationCalendar } from '@/components/admin/calendar/ReservationCalendar'
import { ConflictPanel,type Conflict } from '@/components/admin/calendar/ConflictPanel'
import type { CalendarItem } from '@/lib/channel-manager/calendar'

type Room={id:number;name:string}
const monthBounds=(value:Date)=>{const from=new Date(value.getFullYear(),value.getMonth(),1);const to=new Date(value.getFullYear(),value.getMonth()+1,1);const iso=(d:Date)=>d.toISOString().slice(0,10);return{from:iso(from),to:iso(to)}}
async function json<T>(url:string,init?:RequestInit){const response=await fetch(url,{...init,headers:{'Content-Type':'application/json',...init?.headers}});const body=await response.json();if(!response.ok)throw new Error(body.error??'request_failed');return body as T}

export default function CalendarPage(){
  const [month,setMonth]=useState(()=>new Date())
  const [filters,setFilters]=useState<Filters>({roomId:'',source:'',status:''})
  const [rooms,setRooms]=useState<Room[]>([]);const [items,setItems]=useState<CalendarItem[]>([]);const [conflicts,setConflicts]=useState<Conflict[]>([]);const [loading,setLoading]=useState(true)
  const bounds=useMemo(()=>monthBounds(month),[month])
  const load=useCallback(async()=>{setLoading(true);try{const params=new URLSearchParams(bounds);if(filters.roomId)params.set('roomId',filters.roomId);if(filters.source)params.set('source',filters.source);if(filters.status)params.set('status',filters.status);const [calendar,conflictBody,roomBody]=await Promise.all([json<{items:CalendarItem[]}>(`/api/admin/reservation-calendar?${params}`),json<{conflicts:Conflict[]}>('/api/admin/reservation-conflicts?status=open'),json<Room[]|{rooms:Room[]}>('/api/admin/rooms')]);setItems(calendar.items);setConflicts(conflictBody.conflicts);setRooms(Array.isArray(roomBody)?roomBody:roomBody.rooms)}catch(error){toast.error(error instanceof Error?error.message:'Erreur de chargement')}finally{setLoading(false)}},[bounds,filters])
  useEffect(()=>{void load()},[load])
  const resolve=async(id:string,action:'dismiss_external'|'cancel_imported'|'mark_resolved')=>{if(!window.confirm('Confirmer cette résolution ? Cette action sera auditée.'))return;try{await json(`/api/admin/reservation-conflicts/${id}`,{method:'PATCH',body:JSON.stringify({action,note:''})});toast.success('Conflit traité');await load()}catch(error){toast.error(error instanceof Error?error.message:'Résolution impossible')}}
  return <div className="mx-auto max-w-[1600px] space-y-5 p-5 sm:p-7 lg:p-9"><header className="flex flex-wrap items-end justify-between gap-4 rounded-[28px] bg-[linear-gradient(135deg,#083D31,#0F5A46)] p-6 text-white"><div><p className="text-xs font-semibold uppercase tracking-[.3em] text-[#F2D390]">Planning central</p><h1 className="mt-2 font-serif text-3xl">Calendrier des réservations</h1><p className="mt-2 text-sm text-white/65">Vue unifiée des réservations directes et des indisponibilités importées.</p></div><div className="flex items-center gap-2"><button aria-label="Mois précédent" className="rounded-full bg-white/10 p-2" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}><ChevronLeft/></button><span className="min-w-40 text-center font-semibold capitalize">{month.toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}</span><button aria-label="Mois suivant" className="rounded-full bg-white/10 p-2" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}><ChevronRight/></button></div></header><CalendarFilters value={filters} onChange={setFilters} rooms={rooms}/><div className="grid gap-5 2xl:grid-cols-[1fr_430px]"><div className={loading?'opacity-50':''}><ReservationCalendar items={items}/></div><ConflictPanel conflicts={conflicts} onResolve={resolve}/></div></div>
}
