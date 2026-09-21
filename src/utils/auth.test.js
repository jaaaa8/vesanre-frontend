import assert from 'node:assert/strict'
import test from 'node:test'
import { clearSession, getSession, saveSession, toBackendRole, validEmail } from './auth.js'

function memoryStorage() {
  const values = new Map()
  return { getItem: (key) => values.get(key) || null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) }
}

test('email và vai trò UI được ánh xạ đúng contract backend', () => {
  assert.equal(validEmail('minh.tran@example.com'), true)
  assert.equal(validEmail('0901234567'), false)
  assert.equal(toBackendRole('player'), 'CUSTOMER')
  assert.equal(toBackendRole('owner'), 'PROVIDER')
})

test('phiên ghi nhớ dùng localStorage, phiên tạm dùng sessionStorage', () => {
  globalThis.window = { localStorage: memoryStorage(), sessionStorage: memoryStorage() }
  const session = { accessToken: 'token', user: { displayName: 'Minh' } }
  saveSession(session, false)
  assert.deepEqual(getSession(), session)
  assert.equal(window.localStorage.getItem('sporthub_session'), null)
  saveSession(session, true)
  assert.deepEqual(getSession(), session)
  clearSession()
  assert.equal(getSession(), null)
  delete globalThis.window
})
