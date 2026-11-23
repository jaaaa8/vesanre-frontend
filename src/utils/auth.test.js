import assert from 'node:assert/strict'
import test from 'node:test'
import { clearSession, expireSession, SESSION_EXPIRED, getSession, hasRole, saveSession, tokenRoles, toBackendRole, validEmail, validLegalName, validName, validPassword, validPhone, validReviewComment, validShopName, validTaxId } from './auth.js'

function memoryStorage() {
  const values = new Map()
  return { getItem: (key) => values.get(key) || null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) }
}

test('email và vai trò UI được ánh xạ đúng contract backend', () => {
  assert.equal(validEmail('minh.tran@example.com'), true)
  assert.equal(validEmail('0901234567'), false)
  assert.equal(validEmail('a@b'), false)
  assert.equal(validPhone('0901234567'), true)
  assert.equal(validPhone('+84381234567'), true)
  assert.equal(validPhone('0201234567'), false)
  assert.equal(validPhone('090 123 4567'), false)
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

function token(payload) {
  const bytes = new TextEncoder().encode(JSON.stringify(payload))
  const json = btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `h.${json}.s`
}

test('tokenRoles đọc roles từ JWT, không tin session.user.roles', () => {
  assert.deepEqual(tokenRoles({ accessToken: token({ roles: ['CUSTOMER', 'PROVIDER'] }) }), ['CUSTOMER', 'PROVIDER'])
  assert.deepEqual(tokenRoles({ accessToken: 'bad' }), [])
  assert.deepEqual(tokenRoles(null), [])
  const stale = { accessToken: token({ roles: ['CUSTOMER'] }), user: { roles: ['PROVIDER'] } }
  assert.equal(hasRole(stale, 'PROVIDER'), false)
  assert.equal(hasRole(stale, 'CUSTOMER'), true)
})

test('tokenRoles decode base64url có ký tự - _ và UTF-8', () => {
  const payload = { displayName: 'Nguyễn Văn Ơ ~~~???>>>', roles: ['ADMIN'] }
  const t = token(payload)
  assert.match(t, /[-_]/)
  assert.deepEqual(tokenRoles({ accessToken: t }), ['ADMIN'])
})

test('expireSession xóa phiên và báo SESSION_EXPIRED cho App', () => {
  const events = []
  globalThis.window = { localStorage: memoryStorage(), sessionStorage: memoryStorage(), dispatchEvent: (e) => events.push(e.type) }
  saveSession({ accessToken: 'token', user: {} }, true)
  expireSession()
  assert.equal(getSession(), null)
  assert.deepEqual(events, [SESSION_EXPIRED])
  delete globalThis.window
})

test('clearSession xoá luôn hồ sơ cục bộ sporthub_user', () => {
  globalThis.window = { localStorage: memoryStorage(), sessionStorage: memoryStorage() }
  window.localStorage.setItem('sporthub_user', JSON.stringify({ name: 'Bileyghas1ye' }))
  clearSession()
  assert.equal(window.localStorage.getItem('sporthub_user'), null)
  delete globalThis.window
})

test('validators theo bảng regex', () => {
  assert.equal(validName('Phạm Thị Hồng'), true)
  assert.equal(validName('Nguyễn An'), true)
  assert.equal(validName('A'), false)
  assert.equal(validName('An1'), false)
  assert.equal(validName('An  Bình'), false)
  assert.equal(validName('a'.repeat(51)), false)

  assert.equal(validPassword('Demo@123'), true)
  assert.equal(validPassword('abcdefgh'), false)
  assert.equal(validPassword('12345678'), false)
  assert.equal(validPassword('abc 12345'), false)
  assert.equal(validPassword('a1'.repeat(17)), false)

  assert.equal(validLegalName('Công ty TNHH Goal Time (CN 2)'), true)
  assert.equal(validLegalName('A'), false)
  assert.equal(validLegalName('Shop<script>'), false)

  assert.equal(validTaxId(''), true)
  assert.equal(validTaxId('0401234567'), true)
  assert.equal(validTaxId('0401234567-001'), true)
  assert.equal(validTaxId('04012'), false)
  assert.equal(validTaxId('TAX1'), false)

  assert.equal(validShopName(''), true)
  assert.equal(validShopName('Goal Time Stadium'), true)
  assert.equal(validShopName('X'), false)

  assert.equal(validReviewComment(''), true)
  assert.equal(validReviewComment('Sân đẹp, nhân viên thân thiện'), true)
  assert.equal(validReviewComment('ngắn'), false)
  assert.equal(validReviewComment('aaaaaaaaaaaa'), false)
  assert.equal(validReviewComment('x'.repeat(501)), false)
})
