import assert from 'node:assert/strict'
import test from 'node:test'
import {
  imageOrderPayload,
  moveItem,
  setupError,
  validateImageFile,
  validateOperatingHours,
  validatePricing,
  venueChangePayload,
  venuePatchPayload,
} from './providerRules.js'

const week = () => Array.from({ length: 7 }, (_, weekday) => ({ weekday, opensAt: '06:00', closesAt: '22:00', closed: false }))

test('validateOperatingHours: đủ 7 ngày, ngày nghỉ không có giờ, mở < đóng', () => {
  assert.equal(validateOperatingHours(week()), null)
  assert.ok(validateOperatingHours(week().slice(0, 6)))
  const dup = week()
  dup[6].weekday = 0
  assert.ok(validateOperatingHours(dup))
  const closedWithTime = week()
  closedWithTime[2].closed = true
  assert.ok(validateOperatingHours(closedWithTime))
  const closedOk = week()
  closedOk[2] = { weekday: 2, opensAt: null, closesAt: null, closed: true }
  assert.equal(validateOperatingHours(closedOk), null)
  const reversed = week()
  reversed[1].opensAt = '22:00'
  reversed[1].closesAt = '06:00'
  assert.ok(validateOperatingHours(reversed))
})

test('validatePricing: khoảng hợp lệ, giá > 0, không chồng lấn cùng ngày', () => {
  const a = { weekday: 0, startMinute: 360, endMinute: 720, pricePerHour: 100000 }
  const b = { weekday: 0, startMinute: 700, endMinute: 900, pricePerHour: 120000 }
  assert.ok(validatePricing([a, b]))
  assert.equal(validatePricing([a, { ...b, weekday: 1 }]), null)
  assert.equal(validatePricing([a, { ...b, startMinute: 720 }]), null)
  assert.ok(validatePricing([{ ...a, startMinute: 720 }]))
  assert.ok(validatePricing([{ ...a, endMinute: 1441 }]))
  assert.ok(validatePricing([{ ...a, pricePerHour: 0 }]))
  assert.equal(validatePricing([]), null)
})

test('validateImageFile: loại, dung lượng, số lượng', () => {
  const ok = { type: 'image/png', size: 1000 }
  assert.equal(validateImageFile(ok, 0), null)
  assert.equal(validateImageFile({ type: 'image/webp', size: 5 * 1024 * 1024 }, 9), null)
  assert.ok(validateImageFile({ type: 'image/gif', size: 1 }, 0))
  assert.ok(validateImageFile({ type: 'image/jpeg', size: 5 * 1024 * 1024 + 1 }, 0))
  assert.ok(validateImageFile(ok, 10))
})

const venue = { name: 'A', addressLine: 'X', ward: null, district: 'Q1', city: 'HCM', province: null, postalCode: null, latitude: 10.1, longitude: 106.2, description: 'd', phone: null }
const formOf = (v) => Object.fromEntries(Object.entries(v).map(([k, val]) => [k, val == null ? '' : String(val)]))

test('venueChangePayload: chỉ trường quan trọng đã đổi, quy tắc tọa độ', () => {
  assert.deepEqual(venueChangePayload(venue, { ...formOf(venue), name: 'B', description: 'changed' }), { payload: { name: 'B' }, error: null })
  assert.ok(venueChangePayload(venue, { ...formOf(venue), latitude: '10.5', longitude: '' }).error)
  assert.equal(venueChangePayload(venue, formOf(venue)).error, 'Chưa có thay đổi')
  assert.equal(venueChangePayload(venue, { ...formOf(venue), latitude: '', longitude: '' }).error, 'Chưa có thay đổi')
  assert.deepEqual(venueChangePayload(venue, { ...formOf(venue), latitude: '10.5' }).payload, { latitude: 10.5, longitude: 106.2 })
  assert.deepEqual(venueChangePayload(venue, { ...formOf(venue), ward: 'P1' }).payload, { ward: 'P1' })
  assert.deepEqual(venueChangePayload({ ...venue, ward: 'P1' }, { ...formOf(venue), ward: '' }).payload, { ward: '' })
})

test('venuePatchPayload: chỉ xét các field được truyền', () => {
  const form = { ...formOf(venue), name: 'B', phone: '0901234567' }
  assert.deepEqual(venuePatchPayload(venue, form, ['description', 'phone']), { payload: { phone: '0901234567' }, error: null })
  const noCoords = { ...venue, latitude: null, longitude: null }
  assert.deepEqual(venuePatchPayload(noCoords, { ...formOf(noCoords), latitude: '10', longitude: '106' }, ['latitude', 'longitude']).payload, { latitude: 10, longitude: 106 })
})

test('imageOrderPayload giữ altText; moveItem đổi chỗ và chặn biên', () => {
  assert.deepEqual(imageOrderPayload([{ id: '1', altText: 'x', url: 'u' }, { id: '2', altText: null }]), [{ id: '1', altText: 'x' }, { id: '2', altText: null }])
  assert.deepEqual(moveItem(['a', 'b', 'c'], 0, 1), ['b', 'a', 'c'])
  assert.deepEqual(moveItem(['a', 'b', 'c'], 2, -1), ['a', 'c', 'b'])
  const arr = ['a', 'b']
  assert.deepEqual(moveItem(arr, 0, -1), ['a', 'b'])
  assert.deepEqual(arr, ['a', 'b'])
})

test('validateOperatingHours chặn ô giờ bị xóa hoặc gõ dở', () => {
  for (const bad of [':00', '', '6:00:00']) {
    const days = week()
    days[0] = { ...days[0], closed: false, opensAt: bad, closesAt: '22:00:00' }
    assert.equal(validateOperatingHours(days), 'Giờ mở cửa phải trước giờ đóng cửa')
  }
})

test('validatePricing: giá VND phải là số nguyên, tối đa 10 chữ số', () => {
  const r = (pricePerHour) => [{ weekday: 0, startMinute: 360, endMinute: 720, pricePerHour }]
  assert.equal(validatePricing(r(150000)), null)
  assert.equal(validatePricing(r(9999999999)), null)
  assert.equal(validatePricing(r(150000.5)), 'Giá phải là số nguyên, tối đa 10 chữ số')
  assert.equal(validatePricing(r(1e10)), 'Giá phải là số nguyên, tối đa 10 chữ số')
})

test('setupError: số sân 1–50, giờ tròn, form hợp lệ trả null', () => {
  const valid = { sportCode: 'BADMINTON', courtCount: 4, depositPercent: 30, operatingHours: week(), pricingRules: [{ weekday: 0, startMinute: 360, endMinute: 1020, pricePerHour: 60000 }] }
  assert.equal(setupError({ courtCount: 0 }), 'Số sân từ 1 đến 50')
  assert.equal(setupError({ ...valid, courtCount: 51 }), 'Số sân từ 1 đến 50')
  const halfHour = week()
  halfHour[0].opensAt = '06:30'
  assert.ok(setupError({ ...valid, operatingHours: halfHour }))
  assert.ok(setupError({ ...valid, pricingRules: [{ ...valid.pricingRules[0], startMinute: 390 }] }))
  assert.ok(setupError({ ...valid, sportCode: '' }))
  assert.ok(setupError({ ...valid, depositPercent: 101 }))
  assert.equal(setupError(valid), null)
  assert.equal(setupError({ ...valid, courtCount: '4', depositPercent: '0' }), null)
})
