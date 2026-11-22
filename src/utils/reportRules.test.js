import assert from 'node:assert/strict'
import test from 'node:test'
import { barPercent, formatChange, formatPercent, monthLabel } from './reportRules.js'

test('barPercent làm tròn và không ra NaN khi max 0', () => {
  assert.equal(barPercent(5, 10), 50)
  assert.equal(barPercent(0, 0), 0)
  assert.equal(barPercent(7, 12), 58)
})

test('monthLabel đổi YYYY-MM thành MM/YYYY', () => {
  assert.equal(monthLabel('2026-01'), '01/2026')
})

test('formatChange có dấu và phần trăm', () => {
  assert.equal(formatChange(1, 50), '+1 (+50,0%)')
  assert.equal(formatChange(-2, -66.7), '−2 (−66,7%)')
  assert.equal(formatChange(0, 0), '0 (0,0%)')
  assert.equal(formatChange(1, null), '+1')
})

test('formatPercent', () => {
  assert.equal(formatPercent(null), '—')
  assert.equal(formatPercent(50), '+50,0%')
  assert.equal(formatPercent(-66.7), '−66,7%')
})
