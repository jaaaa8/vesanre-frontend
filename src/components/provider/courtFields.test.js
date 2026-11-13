import assert from 'node:assert/strict'
import test from 'node:test'
import { courtPayload, EMPTY_COURT } from './courtFields.js'

test('courtPayload gửi chuỗi rỗng để xóa mô tả (null nghĩa là không đổi)', () => {
  assert.equal(courtPayload({ ...EMPTY_COURT, description: '   ' }).description, '')
})
