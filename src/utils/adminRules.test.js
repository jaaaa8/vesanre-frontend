import assert from 'node:assert/strict'
import test from 'node:test'
import { AUDIT_ACTION_LABELS, auditActionLabel, canReactivate, canSuspend, changeRows, fallbackPage, isMonth, parseDocuments, patchParams, readListParams, needsRewrite } from './adminRules.js'

const S = ['PENDING', 'VERIFIED']
const read = (qs, statuses = S, extra) => readListParams(new URLSearchParams(qs), statuses, extra)

test('readListParams đọc giá trị hợp lệ', () => {
  assert.deepEqual(read('status=VERIFIED&page=2'), { status: 'VERIFIED', page: 2 })
})

test('readListParams quay về mặc định khi giá trị sai', () => {
  assert.deepEqual(read('status=FOO&page=-1'), { status: 'PENDING', page: 0 })
  for (const page of ['abc', '1.5', '99999999999']) assert.equal(read(`page=${page}`).page, 0)
})

test('readListParams xử lý tham số phụ', () => {
  const extra = [{ key: 'targetType', values: ['SHOP', 'VENUE'] }]
  assert.deepEqual(read('targetType=SHOP', ['PENDING'], extra), { status: 'PENDING', page: 0, targetType: 'SHOP' })
  assert.equal(read('targetType=X', ['PENDING'], extra).targetType, '')
})

test('fallbackPage lùi về trang cuối còn dữ liệu', () => {
  assert.equal(fallbackPage(3, [], 2), 1)
  assert.equal(fallbackPage(0, [], 0), null)
  assert.equal(fallbackPage(1, [{}], 2), null)
  assert.equal(fallbackPage(2, [], 0), 0)
})

test('changeRows so sánh theo key của proposed', () => {
  assert.deepEqual(changeRows({ name: 'A', latitude: 40.1 }, { name: 'B', latitude: '40.1', ward: '' }), [
    { key: 'name', from: 'A', to: 'B', changed: true },
    { key: 'latitude', from: 40.1, to: '40.1', changed: false },
    { key: 'ward', from: undefined, to: '', changed: false },
  ])
  assert.equal(changeRows(null, { name: 'B' })[0].changed, true)
})

test('parseDocuments không làm vỡ khi dữ liệu xấu', () => {
  assert.deepEqual(parseDocuments('[]'), [])
  assert.deepEqual(parseDocuments('[{"url":"x"}]'), [{ url: 'x' }])
  for (const bad of ['{bad', null, '{"a":1}']) assert.deepEqual(parseDocuments(bad), [])
})

test('needsRewrite: true only when a present param differs from its normalized value', () => {
  const S = ['PENDING', 'APPROVED']
  const extra = [{ key: 'targetType', values: ['SHOP', 'VENUE'] }]
  const check = (qs) => {
    const search = new URLSearchParams(qs)
    return needsRewrite(search, readListParams(search, S, extra))
  }
  assert.equal(check(''), false)
  assert.equal(check('status=APPROVED&page=2&targetType=SHOP'), false)
  assert.equal(check('status=FOO'), true)
  assert.equal(check('page=abc'), true)
  assert.equal(check('targetType=X'), true)
})

test('readListParams giữ tab ALL không đứng đầu, thiếu status thì về mặc định', () => {
  const W = ['PENDING', 'PAID', 'REJECTED', 'ALL']
  assert.equal(read('status=ALL', W).status, 'ALL')
  assert.equal(read('', W).status, 'PENDING')
})

test('isMonth chỉ nhận YYYY-MM hợp lệ', () => {
  assert.equal(isMonth('2026-11'), true)
  for (const bad of ['2026-13', '2026-00', 'abc', '']) assert.equal(isMonth(bad), false)
})

test('readListParams đọc tham số phụ kiểu test', () => {
  const extra = [{ key: 'q', test: (v) => v.length <= 100 }]
  assert.equal(read('q=%20an%20', ['ALL'], extra).q, 'an')
  assert.equal(read('', ['ALL'], extra).q, '')
})

test('patchParams đưa page về 0 khi đổi bộ lọc', () => {
  assert.equal(patchParams({ status: 'ALL', page: 3, q: '' }, { q: 'an' }).page, 0)
  assert.equal(patchParams({ status: 'ALL', page: 3 }, { page: 4 }).page, 4)
  assert.equal(patchParams({ status: 'PENDING', page: 2, targetType: '' }, { targetType: 'SHOP' }).page, 0)
})

test('canSuspend và canReactivate', () => {
  assert.equal(canSuspend({ status: 'ACTIVE', roles: ['CUSTOMER'] }), true)
  assert.equal(canSuspend({ status: 'ACTIVE', roles: ['CUSTOMER', 'ADMIN'] }), false)
  assert.equal(canSuspend({ status: 'SUSPENDED', roles: ['CUSTOMER'] }), false)
  assert.equal(canReactivate({ status: 'SUSPENDED' }), true)
  assert.equal(canReactivate({ status: 'ACTIVE' }), false)
  assert.equal(canReactivate({ status: 'DEACTIVATED' }), false)
})

test('nhãn action audit đủ 14 và action lạ hiện mã gốc', () => {
  assert.equal(Object.keys(AUDIT_ACTION_LABELS).length, 14)
  assert.equal(auditActionLabel('WITHDRAWAL_PAID'), 'Đã chuyển tiền rút')
  assert.equal(auditActionLabel('FOO'), 'FOO')
})
