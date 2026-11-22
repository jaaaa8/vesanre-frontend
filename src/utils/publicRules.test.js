import assert from 'node:assert/strict'
import test from 'node:test'
import { addDays, clampDate, districtsOf, formatRating, legacySportCode, mapsUrl, readSearchParams, searchHref, slotErrorText, todayIn } from './publicRules.js'

const read = (qs) => readSearchParams(new URLSearchParams(qs))
const EMPTY = { q: '', city: '', district: '', sport: '', minPrice: '', maxPrice: '', sort: 'newest', page: 0 }

test('readSearchParams trả mặc định khi URL rỗng', () => {
  assert.deepEqual(read(''), EMPTY)
})

test('readSearchParams bỏ giá trị sai', () => {
  const p = read('sort=foo&page=-1&minPrice=abc&maxPrice=200000')
  assert.equal(p.sort, 'newest')
  assert.equal(p.page, 0)
  assert.equal(p.minPrice, '')
  assert.equal(p.maxPrice, '200000')
})

test('readSearchParams bỏ cả hai giá khi min > max', () => {
  const p = read('minPrice=500000&maxPrice=100000')
  assert.equal(p.minPrice, '')
  assert.equal(p.maxPrice, '')
})

test('readSearchParams cắt q còn 100 ký tự, không để khoảng trắng cuối', () => {
  assert.equal(read(`q=${encodeURIComponent('  ' + 'a'.repeat(300))}`).q.length, 100)
  const q = read(`q=${encodeURIComponent('a'.repeat(99) + '   b')}`).q
  assert.equal(q, 'a'.repeat(99))
})

test('readSearchParams giữ page hợp lệ và trim city', () => {
  const p = read(`page=3&city=${encodeURIComponent(' Đà Nẵng ')}`)
  assert.equal(p.page, 3)
  assert.equal(p.city, 'Đà Nẵng')
})

test('searchHref không ghi sort mặc định và page 0', () => {
  assert.equal(searchHref({ ...EMPTY }), '/san')
  assert.equal(searchHref({ sport: 'BADMINTON', sort: 'price_asc', page: 2 }), '/san?sport=BADMINTON&sort=price_asc&page=2')
})

test('districtsOf', () => {
  assert.deepEqual(districtsOf([{ city: 'HCM', districts: ['Q1'] }], 'HCM'), ['Q1'])
  assert.deepEqual(districtsOf([{ city: 'HCM', districts: ['Q1'] }], 'HN'), [])
})

test('todayIn tính theo giờ VN', () => {
  assert.equal(todayIn('Asia/Ho_Chi_Minh', new Date('2026-11-20T18:30:00Z')), '2026-11-21')
})

test('addDays qua năm mới', () => {
  assert.equal(addDays('2026-12-25', 10), '2027-01-04')
})

test('clampDate giữ trong [today, today+30]', () => {
  const today = '2026-11-20'
  assert.equal(clampDate('2026-12-20', today), '2026-12-20')
  assert.equal(clampDate('2026-12-21', today), today)
  assert.equal(clampDate('2026-11-19', today), today)
  assert.equal(clampDate('', today), today)
})

test('mapsUrl', () => {
  assert.match(mapsUrl(16.06, 108.22), /query=16\.06,108\.22$/)
  assert.equal(mapsUrl(null, 108.22), null)
})

test('legacySportCode', () => {
  assert.equal(legacySportCode('badminton'), 'BADMINTON')
  assert.equal(legacySportCode('chess'), '')
  assert.equal(legacySportCode('constructor'), '')
})

test('slotErrorText maps dead-end statuses to Vietnamese, leaves others retryable', () => {
  assert.equal(slotErrorText(404), 'Sân không còn hoạt động')
  assert.equal(slotErrorText(400), 'Ngày không hợp lệ, hãy chọn ngày khác')
  assert.equal(slotErrorText(500), null)
  assert.equal(slotErrorText(undefined), null)
})

test('formatRating', () => {
  assert.equal(formatRating(4, 1), '★ 4,0 (1 đánh giá)')
  assert.equal(formatRating(4.25, 12), '★ 4,3 (12 đánh giá)')
  assert.equal(formatRating(null, 0), 'Chưa có đánh giá')
})
