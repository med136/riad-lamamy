import { sourceLabel,type CalendarItem } from '@/lib/channel-manager/calendar'

const tone=(source:string)=>source==='direct'?'bg-[#EAF3EF] border-[#0F5A46]/20':'bg-[#FFF7E8] border-[#D2AA5A]/30'
export function ReservationCalendar({items}:{items:CalendarItem[]}){
  const grouped=Map.groupBy(items,item=>item.checkIn)
  return <section className="rounded-3xl border border-[#B28A47]/15 bg-white p-5 shadow-sm"><h2 className="font-serif text-xl text-[#2B1C17]">Séjours et indisponibilités</h2>
    <div className="mt-4 space-y-4">{[...grouped.entries()].map(([date,entries])=><div key={date} className="grid gap-2 sm:grid-cols-[120px_1fr]"><time className="pt-3 text-xs font-bold text-[#6F625C]">{new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'})}</time><div className="grid gap-2 lg:grid-cols-2">{entries.map(item=><article key={item.id} className={`rounded-2xl border p-3 ${tone(item.source)}`}><div className="flex items-start justify-between gap-2"><div><p className="font-semibold text-[#2B1C17]">{item.roomName}</p><p className="text-xs text-[#6F625C]">{item.guestName} · {item.reference}</p></div><span className="rounded-full bg-white/70 px-2 py-1 text-[10px] font-bold">{sourceLabel(item.source)}</span></div><p className="mt-2 text-xs text-[#6F625C]">{item.checkIn} → {item.checkOut} · {item.status}</p></article>)}</div></div>)}{!items.length?<p className="py-12 text-center text-sm text-[#6F625C]">Aucune réservation sur cette période.</p>:null}</div>
  </section>
}
