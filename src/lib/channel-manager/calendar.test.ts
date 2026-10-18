import assert from 'node:assert/strict'
import test from 'node:test'
import { calendarMonthBounds, overlapsRange, projectCalendarRows, sourceLabel } from './calendar.ts'

test('uses half-open boundaries so same-day turnover does not overlap', () => {
  assert.equal(overlapsRange('2030-05-01','2030-05-03','2030-05-03','2030-05-05'), false)
  assert.equal(overlapsRange('2030-05-01','2030-05-04','2030-05-03','2030-05-05'), true)
})

test('builds stable local calendar month boundaries without UTC shifting', () => {
  assert.deepEqual(calendarMonthBounds(2026, 9), {from:'2026-10-01',to:'2026-11-01'})
  assert.deepEqual(calendarMonthBounds(2026, 11), {from:'2026-12-01',to:'2027-01-01'})
})

test('projects minimal operations data and hides imported synthetic identities', () => {
  const [item] = projectCalendarRows([{ id:'r1', reference:'EXT-1', guest_name:'External availability', room_id:2, check_in:'2030-05-01', check_out:'2030-05-02', status:'blocked', source:'airbnb', channel_id:'c1', rooms:{name:'Atlas'}, booking_channels:{name:'Airbnb principal',provider:'airbnb'} }])
  assert.equal(item.guestName, 'Disponibilité externe')
  assert.equal(item.roomName, 'Atlas')
  assert.equal(item.channelName, 'Airbnb principal')
  assert.equal(sourceLabel('booking'), 'Booking.com')
})
