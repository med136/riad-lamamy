'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, CalendarSync, CheckCircle2, Copy, Link2, Loader2, Play, Plus, Power, RefreshCw, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { ChannelAdminDto, ChannelConnectionType, ChannelProvider, MappingAdminDto } from '@/lib/channel-manager/types'

type Room = { id: number; name: string }
type SyncRun = { id: string; trigger: string; status: string; fetched_count: number; created_count: number; updated_count: number; cancelled_count: number; conflict_count: number; error_code: string | null; started_at: string }

const providers: Array<{ value: ChannelProvider; label: string }> = [
  { value: 'airbnb', label: 'Airbnb' }, { value: 'booking', label: 'Booking.com' },
  { value: 'expedia', label: 'Expedia' }, { value: 'vrbo', label: 'Vrbo' },
  { value: 'tripadvisor', label: 'Tripadvisor' }, { value: 'custom', label: 'Calendrier personnalisé' },
]
const types: Array<{ value: ChannelConnectionType; label: string }> = [
  { value: 'import', label: 'Import uniquement' }, { value: 'export', label: 'Export uniquement' },
  { value: 'bidirectional', label: 'Import + export' },
]

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } })
  const body = response.status === 204 ? null : await response.json()
  if (!response.ok) throw new Error(body?.error ?? 'request_failed')
  return body as T
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<ChannelAdminDto[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mappings, setMappings] = useState<MappingAdminDto[]>([])
  const [runs, setRuns] = useState<SyncRun[]>([])
  const [busy, setBusy] = useState<string | null>('load')
  const [form, setForm] = useState({ name: '', provider: 'airbnb' as ChannelProvider, connectionType: 'bidirectional' as ChannelConnectionType, importUrl: '', syncIntervalMinutes: 60 })
  const [roomId, setRoomId] = useState('')
  const [replacementImportUrl, setReplacementImportUrl] = useState('')
  const selected = useMemo(() => channels.find((item) => item.id === selectedId) ?? null, [channels, selectedId])

  const load = useCallback(async () => {
    const [channelBody, roomBody] = await Promise.all([
      api<{ channels: ChannelAdminDto[] }>('/api/admin/channels'),
      api<Room[] | { rooms: Room[] }>('/api/admin/rooms'),
    ])
    setChannels(channelBody.channels)
    setRooms(Array.isArray(roomBody) ? roomBody : roomBody.rooms)
    setSelectedId((current) => current && channelBody.channels.some((item) => item.id === current) ? current : channelBody.channels[0]?.id ?? null)
  }, [])

  const loadDetails = useCallback(async (id: string) => {
    const [mappingBody, runBody] = await Promise.all([
      api<{ mappings: MappingAdminDto[] }>(`/api/admin/channels/${id}/mappings`),
      api<{ runs: SyncRun[] }>(`/api/admin/channels/${id}/runs?limit=10`),
    ])
    setMappings(mappingBody.mappings)
    setRuns(runBody.runs)
  }, [])

  useEffect(() => { load().catch(() => toast.error('Impossible de charger les canaux')).finally(() => setBusy(null)) }, [load])
  useEffect(() => { if (selectedId) loadDetails(selectedId).catch(() => toast.error('Impossible de charger les détails')) }, [selectedId, loadDetails])

  const action = async (key: string, operation: () => Promise<void>, success: string) => {
    setBusy(key)
    try { await operation(); toast.success(success) } catch (error) { toast.error(error instanceof Error ? error.message : 'Erreur') } finally { setBusy(null) }
  }

  const createChannel = () => action('create', async () => {
    const body = await api<{ channel: ChannelAdminDto }>('/api/admin/channels', { method: 'POST', body: JSON.stringify({ ...form, importUrl: form.importUrl || undefined }) })
    setChannels((items) => [...items, body.channel]); setSelectedId(body.channel.id)
    setForm({ name: '', provider: 'airbnb', connectionType: 'bidirectional', importUrl: '', syncIntervalMinutes: 60 })
  }, 'Canal créé en mode désactivé')

  const patchChannel = (patch: Record<string, unknown>, success: string) => selected && action('channel', async () => {
    const body = await api<{ channel: ChannelAdminDto }>(`/api/admin/channels/${selected.id}`, { method: 'PATCH', body: JSON.stringify(patch) })
    setChannels((items) => items.map((item) => item.id === selected.id ? body.channel : item))
  }, success)

  const addMapping = () => selected && roomId && action('mapping', async () => {
    await api(`/api/admin/channels/${selected.id}/mappings`, { method: 'POST', body: JSON.stringify({ roomId: Number(roomId) }) })
    await loadDetails(selected.id); setRoomId('')
  }, 'Chambre liée au canal')

  const patchMapping = (mapping: MappingAdminDto, patch: Record<string, unknown>) => selected && action(`mapping-${mapping.id}`, async () => {
    await api(`/api/admin/channels/${selected.id}/mappings/${mapping.id}`, { method: 'PATCH', body: JSON.stringify(patch) })
    await loadDetails(selected.id)
  }, 'Liaison mise à jour')

  const rotate = (mapping: MappingAdminDto) => selected && action(`token-${mapping.id}`, async () => {
    const body = await api<{ exportUrl: string }>(`/api/admin/channels/${selected.id}/mappings/${mapping.id}/rotate-token`, { method: 'POST' })
    await navigator.clipboard.writeText(body.exportUrl)
    await loadDetails(selected.id)
    toast.success('Nouvelle URL copiée. Elle ne sera plus affichée en entier.')
  }, 'URL d’export renouvelée')

  return <div className="mx-auto max-w-[1500px] space-y-6 p-5 sm:p-7 lg:p-9">
    <section className="rounded-[28px] bg-[linear-gradient(135deg,#083D31,#0F5A46)] p-6 text-white shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-[.3em] text-[#F2D390]">Distribution</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-serif text-3xl">Canaux & calendriers</h1><p className="mt-2 max-w-2xl text-sm text-white/70">Configurez Airbnb, Booking.com et les calendriers iCal. Rien n’est publié avant validation et activation explicite.</p></div><div className="flex gap-3 text-center"><Stat label="Canaux" value={channels.length}/><Stat label="Actifs" value={channels.filter((x) => x.enabled).length}/><Stat label="Alertes" value={channels.filter((x) => ['degraded','failing'].includes(x.health)).length}/></div></div>
    </section>

    <section className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <div className="space-y-4">
        <div className="rounded-3xl border border-[#B28A47]/15 bg-white p-5 shadow-sm">
          <h2 className="font-serif text-xl text-[#2B1C17]">Ajouter un canal</h2>
          <div className="mt-4 space-y-3">
            <Field label="Nom"><input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} className="input" placeholder="Airbnb principal"/></Field>
            <Field label="Plateforme"><select value={form.provider} onChange={(e)=>setForm({...form,provider:e.target.value as ChannelProvider})} className="input">{providers.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}</select></Field>
            <Field label="Connexion"><select value={form.connectionType} onChange={(e)=>setForm({...form,connectionType:e.target.value as ChannelConnectionType})} className="input">{types.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}</select></Field>
            <Field label="URL iCal d’import (HTTPS)"><input value={form.importUrl} onChange={(e)=>setForm({...form,importUrl:e.target.value})} className="input" placeholder="https://…/calendar.ics"/></Field>
            <Field label="Fréquence"><select value={form.syncIntervalMinutes} onChange={(e)=>setForm({...form,syncIntervalMinutes:Number(e.target.value)})} className="input"><option value={15}>15 minutes</option><option value={30}>30 minutes</option><option value={60}>1 heure</option><option value={360}>6 heures</option></select></Field>
            <button disabled={!form.name.trim() || busy==='create'} onClick={createChannel} className="btn-primary w-full"><Plus size={16}/>{busy==='create'?'Création…':'Créer désactivé'}</button>
          </div>
        </div>
        <div className="space-y-2">{channels.map((channel)=><button key={channel.id} onClick={()=>setSelectedId(channel.id)} className={`w-full rounded-2xl border p-4 text-left transition ${selectedId===channel.id?'border-[#0F5A46] bg-[#EAF3EF]':'border-[#B28A47]/15 bg-white hover:border-[#B28A47]/40'}`}><div className="flex items-center justify-between gap-2"><span className="font-semibold text-[#2B1C17]">{channel.name}</span><Health value={channel.health}/></div><p className="mt-1 text-xs text-[#6F625C]">{providers.find(x=>x.value===channel.provider)?.label} · {channel.sync_interval_minutes} min</p></button>)}</div>
      </div>

      {selected ? <div className="space-y-5">
        <div className="rounded-3xl border border-[#B28A47]/15 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-3"><h2 className="font-serif text-2xl text-[#2B1C17]">{selected.name}</h2><Health value={selected.health}/></div><p className="mt-1 text-xs text-[#6F625C]">Import : {selected.hasImportUrl ? selected.importHost : 'non configuré'} · Dernière synchro : {selected.last_synced_at ? new Date(selected.last_synced_at).toLocaleString('fr-FR') : 'jamais'}</p></div><div className="flex flex-wrap gap-2"><Action icon={CheckCircle2} label="Valider" onClick={()=>action('validate',async()=>{await api(`/api/admin/channels/${selected.id}/validate`,{method:'POST'});await load()},'Flux iCal validé')}/><Action icon={Play} label="Synchroniser" onClick={()=>action('sync',async()=>{await api(`/api/admin/channels/${selected.id}/sync`,{method:'POST'});await Promise.all([load(),loadDetails(selected.id)])},'Synchronisation terminée')}/><Action icon={Power} label={selected.enabled?'Désactiver':'Activer'} onClick={()=>patchChannel({enabled:!selected.enabled},selected.enabled?'Canal désactivé':'Canal activé')}/><Action danger icon={Trash2} label="Archiver" onClick={()=>action('delete',async()=>{await api(`/api/admin/channels/${selected.id}`,{method:'DELETE'});await load()},'Canal archivé')}/></div></div>
          <div className="mt-5 grid gap-3 md:grid-cols-3"><Field label="Nom"><input defaultValue={selected.name} onBlur={(e)=>e.target.value!==selected.name&&patchChannel({name:e.target.value},'Nom enregistré')} className="input"/></Field><Field label="Type"><select value={selected.connection_type} onChange={(e)=>patchChannel({connectionType:e.target.value},'Type enregistré')} className="input">{types.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}</select></Field><Field label="Intervalle"><select value={selected.sync_interval_minutes} onChange={(e)=>patchChannel({syncIntervalMinutes:Number(e.target.value)},'Fréquence enregistrée')} className="input"><option value={15}>15 minutes</option><option value={30}>30 minutes</option><option value={60}>1 heure</option><option value={360}>6 heures</option></select></Field></div>
          {selected.connection_type !== 'export' ? <div className="mt-4 flex flex-wrap items-end gap-2"><div className="min-w-64 flex-1"><Field label="Remplacer l’URL iCal d’import"><input value={replacementImportUrl} onChange={(e)=>setReplacementImportUrl(e.target.value)} className="input" placeholder="https://…/calendar.ics"/></Field></div><button disabled={!replacementImportUrl} onClick={()=>{patchChannel({importUrl:replacementImportUrl},'URL iCal enregistrée');setReplacementImportUrl('')}} className="btn-primary">Enregistrer l’URL</button>{selected.hasImportUrl?<button onClick={()=>patchChannel({importUrl:null},'URL iCal supprimée')} className="btn-danger">Supprimer l’URL</button>:null}</div>:null}
        </div>

        <div className="rounded-3xl border border-[#B28A47]/15 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="flex items-center gap-2 font-serif text-xl text-[#2B1C17]"><Link2 size={18}/> Chambres liées</h3><p className="mt-1 text-xs text-[#6F625C]">Activez chaque liaison puis générez l’URL à coller chez le partenaire.</p></div><div className="flex gap-2"><select value={roomId} onChange={(e)=>setRoomId(e.target.value)} className="input min-w-52"><option value="">Choisir une chambre</option>{rooms.filter(r=>!mappings.some(m=>m.room_id===r.id)).map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select><button onClick={addMapping} disabled={!roomId} className="btn-primary"><Plus size={16}/>Lier</button></div></div>
          <div className="mt-4 divide-y divide-[#B28A47]/10">{mappings.length?mappings.map(mapping=><div key={mapping.id} className="flex flex-wrap items-center gap-3 py-4"><div className="min-w-48 flex-1"><p className="font-semibold text-[#2B1C17]">{rooms.find(r=>r.id===mapping.room_id)?.name ?? `Chambre ${mapping.room_id}`}</p><p className="text-xs text-[#6F625C]">Export : {mapping.hasExportToken ? `configuré ${mapping.exportTokenHint}` : 'non configuré'}</p></div><button onClick={()=>patchMapping(mapping,{enabled:!mapping.enabled})} className="btn-secondary">{mapping.enabled?'Désactiver':'Activer'}</button><button onClick={()=>rotate(mapping)} className="btn-secondary"><Copy size={14}/> {mapping.hasExportToken?'Renouveler URL':'Créer URL'}</button></div>):<p className="py-8 text-center text-sm text-[#6F625C]">Aucune chambre liée.</p>}</div>
        </div>

        <div className="rounded-3xl border border-[#B28A47]/15 bg-white p-5 shadow-sm"><h3 className="flex items-center gap-2 font-serif text-xl text-[#2B1C17]"><Activity size={18}/> Historique des synchronisations</h3><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-xs"><thead className="text-[#6F625C]"><tr><th className="pb-3">Date</th><th>Déclencheur</th><th>État</th><th>Lus</th><th>Créés</th><th>Modifiés</th><th>Conflits</th><th>Erreur</th></tr></thead><tbody className="divide-y divide-[#B28A47]/10">{runs.map(run=><tr key={run.id}><td className="py-3">{new Date(run.started_at).toLocaleString('fr-FR')}</td><td>{run.trigger}</td><td><Health value={run.status}/></td><td>{run.fetched_count}</td><td>{run.created_count}</td><td>{run.updated_count}</td><td>{run.conflict_count}</td><td>{run.error_code??'—'}</td></tr>)}</tbody></table>{!runs.length?<p className="py-7 text-center text-[#6F625C]">Aucune synchronisation enregistrée.</p>:null}</div></div>
      </div>:<div className="grid min-h-80 place-items-center rounded-3xl border border-dashed border-[#B28A47]/30 bg-white"><div className="text-center text-[#6F625C]"><CalendarSync className="mx-auto mb-3"/>Créez un canal pour commencer.</div></div>}
    </section>
    {busy==='load'?<div className="fixed inset-0 z-50 grid place-items-center bg-white/60"><Loader2 className="animate-spin text-[#0F5A46]"/></div>:null}
  </div>
}

function Field({label,children}:{label:string;children:React.ReactNode}) { return <label className="block text-xs font-semibold text-[#6F625C]"><span className="mb-1.5 block">{label}</span>{children}</label> }
function Stat({label,value}:{label:string;value:number}) { return <div className="min-w-20 rounded-2xl bg-white/10 px-4 py-3"><p className="text-2xl font-semibold">{value}</p><p className="text-[10px] text-white/60">{label}</p></div> }
function Health({value}:{value:string}) { const good=['healthy','succeeded'].includes(value), bad=['failing','failed'].includes(value); return <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${good?'bg-emerald-100 text-emerald-700':bad?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}`}>{value.replaceAll('_',' ')}</span> }
function Action({icon:Icon,label,onClick,danger=false}:{icon:typeof RefreshCw;label:string;onClick:()=>void;danger?:boolean}) { return <button onClick={onClick} className={danger?'btn-danger':'btn-secondary'}><Icon size={14}/>{label}</button> }
