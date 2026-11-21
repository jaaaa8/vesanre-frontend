// Invalid query values fall back to defaults: the backend answers 400 on an unknown enum or an int overflow.
export function readListParams(search, statuses, extra = []) {
  const status = search.get('status')
  const page = search.get('page') ?? ''
  const params = {
    status: statuses.includes(status) ? status : statuses[0],
    page: /^\d{1,9}$/.test(page) ? Number(page) : 0,
  }
  for (const { key, values, test } of extra) {
    if (test) {
      const value = (search.get(key) ?? '').trim()
      params[key] = test(value) ? value : ''
    } else {
      const value = search.get(key)
      params[key] = values.includes(value) ? value : ''
    }
  }
  return params
}

// Changing any filter resets to page 0: page 3 of the old filter is usually empty under the new one.
export function patchParams(params, patch) {
  const next = { ...params, ...patch }
  if (Object.keys(patch).some((k) => k !== 'page')) next.page = 0
  return next
}

export const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/
export const isMonth = (v) => MONTH_RE.test(v)

export const canSuspend = (user) => user.status === 'ACTIVE' && !user.roles.includes('ADMIN')
export const canReactivate = (user) => user.status === 'SUSPENDED'

export const ROLE_LABELS = { CUSTOMER: 'Khách', PROVIDER: 'Chủ sân', ADMIN: 'Admin' }
export const USER_STATUS_LABELS = { ACTIVE: 'Hoạt động', SUSPENDED: 'Bị khóa', DEACTIVATED: 'Vô hiệu' }

export const AUDIT_ENTITY_LABELS = {
  USER: 'Người dùng',
  PROVIDER_PROFILE: 'Chủ sân',
  VENUE: 'Cơ sở',
  CATALOG_CHANGE_REQUEST: 'Yêu cầu thay đổi',
  REVIEW: 'Đánh giá',
  WITHDRAWAL: 'Lệnh rút',
}

export const AUDIT_ACTION_LABELS = {
  PROVIDER_APPROVED: 'Duyệt chủ sân',
  PROVIDER_REJECTED: 'Từ chối chủ sân',
  VENUE_APPROVED: 'Duyệt cơ sở',
  VENUE_REJECTED: 'Từ chối cơ sở',
  VENUE_SUSPENDED: 'Tạm ngưng cơ sở',
  VENUE_REACTIVATED: 'Mở lại cơ sở',
  CHANGE_REQUEST_APPROVED: 'Duyệt yêu cầu thay đổi',
  CHANGE_REQUEST_REJECTED: 'Từ chối yêu cầu thay đổi',
  REVIEW_HIDDEN: 'Ẩn đánh giá',
  REVIEW_UNHIDDEN: 'Hiện lại đánh giá',
  USER_SUSPENDED: 'Khóa người dùng',
  USER_REACTIVATED: 'Mở khóa người dùng',
  WITHDRAWAL_PAID: 'Đã chuyển tiền rút',
  WITHDRAWAL_REJECTED: 'Từ chối lệnh rút',
}

export const auditActionLabel = (action) => AUDIT_ACTION_LABELS[action] ?? action

// A status-filtered list shrinks after a decision; an empty page > 0 hides Pagination, so step back.
export const fallbackPage = (page, items, totalPages) => (items.length === 0 && page > 0 ? Math.max(totalPages - 1, 0) : null)

const norm = (v) => (v == null ? '' : String(v))

export const changeRows = (current, proposed) =>
  Object.keys(proposed).map((key) => {
    const from = current?.[key]
    const to = proposed[key]
    return { key, from, to, changed: norm(from) !== norm(to) }
  })

export function parseDocuments(text) {
  try {
    const value = JSON.parse(text)
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

// True when the URL carries a param whose raw value was discarded by readListParams.
export const needsRewrite = (search, params) => Object.entries(params).some(([k, v]) => search.has(k) && search.get(k) !== String(v))
