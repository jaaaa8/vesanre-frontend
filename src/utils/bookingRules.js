import { timeToMinutes } from './format.js'

export const DEPOSIT_PERCENT = 30

// Mirrors backend BookingPricing: floor(subtotal * percent / 100 / 1000) coins.
export const estimateDeposit = (subtotal, percent = DEPOSIT_PERCENT) => Math.floor((Number(subtotal) * percent) / 100000)

// A slot ending at midnight reads "00:00", hence the wrap.
const slotMinutes = (s) => (timeToMinutes(s.end) - timeToMinutes(s.start) + 1440) % 1440 || 1440

export function selectRange(slots, selection, index, maxMinutes) {
  if (!slots[index]?.available) return selection
  if (selection && selection.from === selection.to && index >= selection.from) {
    let minutes = 0
    let ok = true
    for (let k = selection.from; k <= index && ok; k++) {
      ok = slots[k].available && (k === index || slots[k].end === slots[k + 1].start)
      minutes += slotMinutes(slots[k])
    }
    if (ok && minutes <= maxMinutes) return { from: selection.from, to: index }
  }
  return { from: index, to: index }
}

export function rangeInfo(slots, selection, { minBookingMinutes }) {
  if (!selection) return null
  const picked = slots.slice(selection.from, selection.to + 1)
  const minutes = picked.reduce((sum, s) => sum + slotMinutes(s), 0)
  const subtotal = picked.reduce((sum, s) => sum + Number(s.price), 0)
  const depositCoins = estimateDeposit(subtotal)
  let error = null
  if (minutes < minBookingMinutes) error = `Đặt tối thiểu ${minBookingMinutes} phút`
  else if (depositCoins === 0) error = 'Khoảng giờ quá ngắn để đặt cọc'
  return { startTime: picked[0].start, endTime: picked.at(-1).end, minutes, subtotal, depositCoins, error }
}

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

// Backend answers 400 to a date filter without venueId/courtId, so date is dropped in that case.
export function readProviderBookingParams(search) {
  const uuid = (key) => (UUID.test(search.get(key) ?? '') ? search.get(key) : '')
  const venueId = uuid('venueId')
  const courtId = uuid('courtId')
  const rawDate = search.get('date') ?? ''
  const status = search.get('status')
  const page = search.get('page') ?? ''
  return {
    venueId,
    courtId,
    date: /^\d{4}-\d{2}-\d{2}$/.test(rawDate) && (venueId || courtId) ? rawDate : '',
    status: PROVIDER_STATUSES.includes(status) ? status : 'CONFIRMED',
    page: /^\d{1,9}$/.test(page) ? Number(page) : 0,
  }
}
