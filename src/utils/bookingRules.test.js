import assert from 'node:assert/strict'
import test from 'node:test'
import {
  BOOKING_STATUS_LABELS,
  canCancel,
  canReview,
  estimateDeposit,
  rangeInfo,
  readProviderBookingParams,
  selectRange,
} from './bookingRules.js'

const slot = (start, end, available = true, price = '50000.00') => ({ start, end, available, price })
const GAP = [slot('18:00:00', '18:30:00'), slot('18:30:00', '19:00:00'), slot('19:00:00', '19:30:00', false), slot('19:30:00', '20:00:00')]
const OPEN = [slot('18:00:00', '18:30:00'), slot('18:30:00', '19:00:00'), slot('19:00:00', '19:30:00'), slot('19:30:00', '20:00:00')]

test('estimateDeposit làm tròn xuống', () => {
  assert.equal(estimateDeposit(250000), 75)
  assert.equal(estimateDeposit('255500.00'), 76)
  assert.equal(estimateDeposit(3000), 0)
})

test('selectRange chọn khoảng liền nhau, còn trống', () => {
  assert.deepEqual(selectRange(GAP, null, 0, 180), { from: 0, to: 0 })
  assert.deepEqual(selectRange(GAP, { from: 0, to: 0 }, 1, 180), { from: 0, to: 1 })
  assert.deepEqual(selectRange(GAP, { from: 0, to: 0 }, 3, 180), { from: 3, to: 3 })
  assert.deepEqual(selectRange(GAP, { from: 0, to: 1 }, 3, 180), { from: 3, to: 3 })
  const sel = { from: 0, to: 0 }
  assert.equal(selectRange(GAP, sel, 2, 180), sel)
  assert.deepEqual(selectRange(OPEN, { from: 0, to: 0 }, 1, 60), { from: 0, to: 1 })
  assert.deepEqual(selectRange(OPEN, { from: 0, to: 0 }, 2, 60), { from: 2, to: 2 })
})

test('rangeInfo tính giờ, tổng, cọc và lỗi', () => {
  const opts = { minBookingMinutes: 60, maxBookingMinutes: 180 }
  assert.deepEqual(rangeInfo(OPEN, { from: 0, to: 1 }, opts), {
    startTime: '18:00:00',
    endTime: '19:00:00',
    minutes: 60,
    subtotal: 100000,
    depositCoins: 30,
    error: null,
  })
  assert.equal(rangeInfo(OPEN, { from: 0, to: 0 }, opts).error, 'Đặt tối thiểu 60 phút')
  const cheap = OPEN.map((s) => ({ ...s, price: '1000.00' }))
  const info = rangeInfo(cheap, { from: 0, to: 1 }, opts)
  assert.equal(info.depositCoins, 0)
  assert.equal(info.error, 'Khoảng giờ quá ngắn để đặt cọc')
  assert.equal(rangeInfo(OPEN, null, opts), null)
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
    courtId: ID,
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
