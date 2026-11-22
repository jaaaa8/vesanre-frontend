import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveInitialTab } from './profileUtils.js'

test('resolveInitialTab đọc hash và ?tab', () => {
  assert.equal(resolveInitialTab({ hash: '#wallet', search: '' }), 'wallet')
  assert.equal(resolveInitialTab({ hash: '#notifications', search: '' }), 'notifications')
  assert.equal(resolveInitialTab({ hash: '#bookings', search: '' }), 'bookings')
  assert.equal(resolveInitialTab({ hash: '', search: '?tab=bookings' }), 'bookings')
  assert.equal(resolveInitialTab({ hash: '#foo', search: '' }), 'profile')
})
