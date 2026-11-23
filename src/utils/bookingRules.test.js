import assert from 'node:assert/strict'
import test from 'node:test'
import {
  BOOKING_STATUS_LABELS,
  canCancel,
  canReview,
  endOptions,
  estimateDeposit,
  readProviderBookingParams,
  startOptions,
} from './bookingRules.js'

const slot = (start, end, freeCourts = 2, freeCourts2h = 2, price = '80000.00') => ({ start, end, price, freeCourts, freeCourts2h })
const DAY = [slot('07:00:00', '08:00:00'), slot('08:00:00', '09:00:00', 1, 0), slot('09:00:00', '10:00:00', 0, 0)]

test('estimateDeposit làm tròn xuống', () => {
  assert.equal(estimateDeposit(250000, 30), 75)
  assert.equal(estimateDeposit('255500.00', 30), 76)
  assert.equal(estimateDeposit(3000, 30), 0)
  assert.equal(estimateDeposit(160000, 0), 0)
  assert.equal(estimateDeposit(160000, 30), 48)
})

test('endOptions gives +1h and +2h when freeCourts2h > 0', () => {
  assert.deepEqual(endOptions(DAY, 0), [
    { endTime: '08:00:00', minutes: 60, subtotal: 80000 },
    { endTime: '09:00:00', minutes: 120, subtotal: 160000 },
  ])
})

test('endOptions hides +2h when freeCourts2h is 0', () => {
  assert.deepEqual(endOptions(DAY, 1), [{ endTime: '09:00:00', minutes: 60, subtotal: 80000 }])
})

test('startOptions skips full hours', () => {
  assert.deepEqual(startOptions(DAY), [DAY[0], DAY[1]])
})

test('canCancel chỉ khi CONFIRMED và chưa tới giờ', () => {
  const now = Date.parse('2026-11-21T10:00:00Z')
  assert.equal(canCancel({ status: 'CONFIRMED', startAt: '2026-11-21T11:00:00Z' }, now), true)
  assert.equal(canCancel({ status: 'CONFIRMED', startAt: '2026-11-21T09:00:00Z' }, now), false)
  assert.equal(canCancel({ status: 'CANCELLED', startAt: '2026-11-21T11:00:00Z' }, now), false)
})

test('BOOKING_STATUS_LABELS', () => {
  assert.equal(BOOKING_STATUS_LABELS.COMPLETED, 'Đã hoàn tất')
})

const ID = '3f2b8c1e-1d2a-4c5b-9e8f-0a1b2c3d4e5f'
const read = (qs) => readProviderBookingParams(new URLSearchParams(qs))

test('readProviderBookingParams chuẩn hóa bộ lọc', () => {
  assert.equal(read('date=2026-11-21').date, '')
  assert.equal(read('venueId=abc').venueId, '')
  assert.equal(read('').status, 'CONFIRMED')
  assert.equal(read('status=HELD').status, 'CONFIRMED')
  assert.equal(read('status=ALL').status, 'ALL')
  assert.equal(read('page=-1').page, 0)
  assert.deepEqual(read(`venueId=${ID}&courtId=${ID}&date=2026-11-21&status=CANCELLED&page=2`), {
    venueId: ID,
    date: '2026-11-21',
    status: 'CANCELLED',
    page: 2,
  })
})

test('canReview chỉ COMPLETED chưa có đánh giá', () => {
  assert.equal(canReview({ status: 'COMPLETED', review: null }), true)
  assert.equal(canReview({ status: 'COMPLETED', review: { id: 'x' } }), false)
  assert.equal(canReview({ status: 'CONFIRMED', review: null }), false)
})
