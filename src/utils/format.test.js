import assert from 'node:assert/strict'
import test from 'node:test'
import { formatCoins, formatDate, formatDateTimeIn, formatStars, formatTimeIn, formatVnd, minutesToTime, timeToMinutes, WEEKDAYS } from './format.js'

test('format tiền, giờ, thứ, ngày', () => {
  assert.equal(formatVnd(150000), '150.000 đ')
  assert.equal(formatVnd('80000.00'), '80.000 đ')
  assert.equal(minutesToTime(0), '00:00')
  assert.equal(minutesToTime(390), '06:30')
  assert.equal(minutesToTime(1440), '24:00')
  assert.equal(timeToMinutes('06:30'), 390)
  assert.equal(timeToMinutes('06:30:00'), 390)
  assert.equal(WEEKDAYS.length, 7)
  assert.equal(WEEKDAYS[0], 'Thứ 2')
  assert.equal(WEEKDAYS[6], 'Chủ nhật')
  assert.equal(formatDate('2026-11-20T03:00:00Z'), '20/11/2026')
  assert.equal(formatDate('2026-01-05'), '05/01/2026')
})

test('format giờ theo timezone và coin', () => {
  assert.equal(formatDateTimeIn('2026-11-21T11:00:00Z', 'Asia/Ho_Chi_Minh'), '21/11/2026 18:00')
  assert.equal(formatTimeIn('2026-11-21T11:00:00Z', 'Asia/Ho_Chi_Minh'), '18:00')
  assert.equal(formatCoins(1250), '1.250 coin')
})

test('formatStars vẽ 5 sao', () => {
  assert.equal(formatStars(4), '★★★★☆')
  assert.equal(formatStars(1), '★☆☆☆☆')
})
