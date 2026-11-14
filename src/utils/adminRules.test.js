import assert from 'node:assert/strict'
import test from 'node:test'
import { changeRows, fallbackPage, parseDocuments, readListParams } from './adminRules.js'

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
