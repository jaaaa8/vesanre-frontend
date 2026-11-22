import { formatDecimal1 } from './format.js'
import { toQuery } from './query.js'

export const SORTS = ['newest', 'price_asc', 'price_desc']
export const SEARCH_SIZE = 12

const DIGITS = /^\d{1,9}$/

// Backend answers 400 to any of these out of range, so the URL is normalised before it is sent.
export function readSearchParams(search) {
  const text = (key) => (search.get(key) ?? '').trim()
  const price = (key) => (DIGITS.test(search.get(key) ?? '') ? search.get(key) : '')
  let minPrice = price('minPrice')
  let maxPrice = price('maxPrice')
  if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) minPrice = maxPrice = ''
  const sort = search.get('sort')
  const page = search.get('page') ?? ''
  return {
    q: text('q').slice(0, 100).trim(),
    city: text('city'),
    district: text('district'),
    sport: text('sport'),
    minPrice,
    maxPrice,
    sort: SORTS.includes(sort) ? sort : 'newest',
    page: DIGITS.test(page) ? Number(page) : 0,
  }
}

export const searchHref = (params) =>
  '/san' + toQuery({ ...params, sort: params.sort === 'newest' ? '' : params.sort, page: params.page || '' })

export const districtsOf = (locations, city) => locations.find((l) => l.city === city)?.districts ?? []

export const todayIn = (timeZone = 'Asia/Ho_Chi_Minh', now = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone }).format(now)

export function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

export const clampDate = (value, today) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= today && value <= addDays(today, 30) ? value : today

export const mapsUrl = (lat, lng) =>
  lat == null || lng == null ? null : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`

const LEGACY_SPORTS = { football: 'FOOTBALL_5', pickleball: 'PICKLEBALL', badminton: 'BADMINTON', basketball: 'BASKETBALL' }

export const legacySportCode = (slug) => (Object.hasOwn(LEGACY_SPORTS, slug) ? LEGACY_SPORTS[slug] : '')

// 404/400 from availability are dead ends (venue gone, date rejected): retrying cannot help.
const SLOT_ERRORS = { 404: 'Sân không còn hoạt động', 400: 'Ngày không hợp lệ, hãy chọn ngày khác' }
export const slotErrorText = (status) => SLOT_ERRORS[status] ?? null

export const formatRating = (avg, count) => (count === 0 ? 'Chưa có đánh giá' : `★ ${formatDecimal1(avg)} (${count} đánh giá)`)

// Placeholder photos for venues without a cover; picked by id so a card keeps the same photo across reloads.
const PLACEHOLDER_PHOTOS = [
  'photo-1574629810360-7efbbe195018',
  'photo-1546519638-68e109498ffc',
  'photo-1554068865-24cecd4e34b8',
  'photo-1459865264687-595d652de67e',
].map((p) => `https://images.unsplash.com/${p}?w=800&q=80&auto=format&fit=crop`)

export function venueCover(venue) {
  if (venue.coverImageUrl) return venue.coverImageUrl
  const id = String(venue.id ?? '')
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return PLACEHOLDER_PHOTOS[h % PLACEHOLDER_PHOTOS.length]
}
