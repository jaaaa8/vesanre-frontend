import assert from 'node:assert/strict'
import test from 'node:test'
import { coinsToVnd, ENTRY_LABELS, isFinal, secondsLeft, topUpError } from './walletRules.js'

test('isFinal chỉ PAID', () => {
  assert.equal(isFinal('PAID'), true)
  assert.equal(isFinal('PENDING'), false)
  assert.equal(isFinal('EXPIRED'), false)
})

test('coinsToVnd và nhãn', () => {
  assert.equal(coinsToVnd(100), 100000)
  assert.equal(ENTRY_LABELS.BOOKING_DEPOSIT_RETURN, 'Hoàn cọc')
})

test('topUpError', () => {
  for (const v of ['9', '5001', '10.5', '', 'abc', '1e2', ' 10']) assert.ok(topUpError(v), v)
  assert.equal(topUpError('10'), null)
  assert.equal(topUpError('5000'), null)
})

test('secondsLeft không âm', () => {
  const now = Date.parse('2026-11-21T10:00:00Z')
  assert.equal(secondsLeft('2026-11-21T09:59:00Z', now), 0)
  assert.equal(secondsLeft('2026-11-21T10:01:30Z', now), 90)
})
