'use client'

export type Filters={roomId:string;source:string;status:string}
export function CalendarFilters({value,onChange,rooms}:{value:Filters;onChange:(value:Filters)=>void;rooms:Array<{id:number;name:string}>}){
  return <div className="grid gap-3 rounded-3xl border border-[#B28A47]/15 bg-white p-4 sm:grid-cols-3">
    <label className="text-xs font-semibold text-[#6F625C]">Chambre<select className="input mt-1" value={value.roomId} onChange={e=>onChange({...value,roomId:e.target.value})}><option value="">Toutes</option>{rooms.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
    <label className="text-xs font-semibold text-[#6F625C]">Source<select className="input mt-1" value={value.source} onChange={e=>onChange({...value,source:e.target.value})}><option value="">Toutes</option><option value="direct">Direct</option><option value="airbnb">Airbnb</option><option value="booking">Booking.com</option><option value="expedia">Expedia</option><option value="vrbo">Vrbo</option><option value="tripadvisor">Tripadvisor</option><option value="custom">iCal</option></select></label>
    <label className="text-xs font-semibold text-[#6F625C]">Statut<select className="input mt-1" value={value.status} onChange={e=>onChange({...value,status:e.target.value})}><option value="">Tous</option><option value="pending">En attente</option><option value="confirmed">Confirmée</option><option value="blocked">Bloquée</option><option value="completed">Terminée</option><option value="cancelled">Annulée</option></select></label>
  </div>
}
