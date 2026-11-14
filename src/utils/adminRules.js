// Invalid query values fall back to defaults: the backend answers 400 on an unknown enum or an int overflow.
export function readListParams(search, statuses, extra = []) {
  const status = search.get('status')
  const page = search.get('page') ?? ''
  const params = {
    status: statuses.includes(status) ? status : statuses[0],
    page: /^\d{1,9}$/.test(page) ? Number(page) : 0,
  }
  for (const { key, values } of extra) {
    const value = search.get(key)
    params[key] = values.includes(value) ? value : ''
  }
  return params
}

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
