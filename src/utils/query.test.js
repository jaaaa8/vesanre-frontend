import assert from 'node:assert/strict'
import test from 'node:test'
import { toQuery } from './query.js'

test('toQuery bỏ tham số rỗng, giữ số 0', () => {
  assert.equal(toQuery({}), '')
  assert.equal(toQuery({ q: 'sân 5', page: 0, city: '', sport: null, x: undefined }), '?q=s%C3%A2n+5&page=0')
})
