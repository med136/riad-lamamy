import assert from 'node:assert/strict'
import test from 'node:test'
import {readFile} from 'node:fs/promises'

test('calendar and conflict routes require the shared admin guard',async()=>{
  const files=['../../src/app/api/admin/reservation-calendar/route.ts','../../src/app/api/admin/reservation-conflicts/route.ts','../../src/app/api/admin/reservation-conflicts/[id]/route.ts']
  for(const file of files){const source=await readFile(new URL(file,import.meta.url),'utf8');assert.match(source,/withAdminRoute/)}
})

test('conflict resolution is constrained to explicit audited actions',async()=>{
  const route=await readFile(new URL('../../src/app/api/admin/reservation-conflicts/[id]/route.ts',import.meta.url),'utf8')
  assert.match(route,/dismiss_external/);assert.match(route,/cancel_imported/);assert.match(route,/mark_resolved/)
  assert.match(route,/resolve_reservation_conflict/);assert.match(route,/mutation:true/)
})
