import assert from 'node:assert/strict'
import test from 'node:test'
import { barPercent, monthLabel } from './reportRules.js'

test('barPercent làm tròn và không ra NaN khi max 0', () => {
  assert.equal(barPercent(5, 10), 50)
  assert.equal(barPercent(0, 0), 0)
  assert.equal(barPercent(7, 12), 58)
})

test('monthLabel đổi YYYY-MM thành MM/YYYY', () => {
  assert.equal(monthLabel('2026-01'), '01/2026')
})
