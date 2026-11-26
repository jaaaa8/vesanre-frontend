import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeForm, resolveInitialTab } from './profileUtils.js'

test('resolveInitialTab đọc hash và ?tab', () => {
  assert.equal(resolveInitialTab({ hash: '#wallet', search: '' }), 'wallet')
  assert.equal(resolveInitialTab({ hash: '#notifications', search: '' }), 'notifications')
  assert.equal(resolveInitialTab({ hash: '#bookings', search: '' }), 'bookings')
  assert.equal(resolveInitialTab({ hash: '', search: '?tab=bookings' }), 'bookings')
  assert.equal(resolveInitialTab({ hash: '#foo', search: '' }), 'profile')
})

test('normalizeForm ưu tiên displayName của server hơn name cũ', () => {
  assert.equal(normalizeForm({ name: 'Bileyghas1ye', displayName: 'Phạm Thị Hồng' }).fFullName, 'Phạm Thị Hồng')
})
