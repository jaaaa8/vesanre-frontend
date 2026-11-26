// Mirrors backend BookingPricing: floor(subtotal * percent / 100 / 1000) coins.
export const estimateDeposit = (subtotal, percent) => Math.floor((Number(subtotal) * percent) / 100000)

export const startOptions = (slots) => slots.filter((s) => s.freeCourts > 0)

// Hourly slots, 1–2h per booking: +1h always, +2h when one court is free for both hours.
export function endOptions(slots, startIndex) {
  const first = slots[startIndex]
  const options = [{ endTime: first.end, minutes: 60, subtotal: Number(first.price) }]
  const next = slots[startIndex + 1]
  if (first.freeCourts2h > 0 && next) {
    options.push({ endTime: next.end, minutes: 120, subtotal: Number(first.price) + Number(next.price) })
  }
  return options
}

export const canReview = (booking) => booking.status === 'COMPLETED' && booking.review == null

export const canCancel = (booking, now = Date.now()) => booking.status === 'CONFIRMED' && Date.parse(booking.startAt) > now

export const BOOKING_STATUS_LABELS = {
  CONFIRMED: 'Đã xác nhận',
  CANCELLED: 'Đã hủy',
  COMPLETED: 'Đã hoàn tất',
  HELD: 'Đang giữ chỗ',
  EXPIRED: 'Hết hạn',
}

export const BOOKING_FILTERS = [
  ['', 'Tất cả'],
  ['CONFIRMED', BOOKING_STATUS_LABELS.CONFIRMED],
  ['COMPLETED', BOOKING_STATUS_LABELS.COMPLETED],
  ['CANCELLED', BOOKING_STATUS_LABELS.CANCELLED],
]

export const PROVIDER_BOOKING_FILTERS = [
  ['CONFIRMED', 'Đã xác nhận'],
  ['ALL', 'Tất cả'],
  ['COMPLETED', 'Đã hoàn tất'],
  ['CANCELLED', 'Đã hủy'],
]

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PROVIDER_STATUSES = PROVIDER_BOOKING_FILTERS.map(([key]) => key)

// Backend answers 400 to a date filter without venueId, so date is dropped in that case.
export function readProviderBookingParams(search) {
  const uuid = (key) => (UUID.test(search.get(key) ?? '') ? search.get(key) : '')
  const venueId = uuid('venueId')
  const rawDate = search.get('date') ?? ''
  const status = search.get('status')
  const page = search.get('page') ?? ''
  return {
    venueId,
    date: /^\d{4}-\d{2}-\d{2}$/.test(rawDate) && venueId ? rawDate : '',
    status: PROVIDER_STATUSES.includes(status) ? status : 'CONFIRMED',
    page: /^\d{1,9}$/.test(page) ? Number(page) : 0,
  }
}
