export const TOP_UP_MIN = 10
export const TOP_UP_MAX = 5000
export const TOP_UP_PRESETS = [50, 100, 200, 500]

export function topUpError(value) {
  if (!/^\d+$/.test(value)) return 'Nhập số coin là số nguyên'
  const coins = Number(value)
  if (coins < TOP_UP_MIN || coins > TOP_UP_MAX) return `Nạp từ ${TOP_UP_MIN} đến ${TOP_UP_MAX} coin`
  return null
}

export const coinsToVnd = (coins) => coins * 1000

// EXPIRED is not final: a late transfer can still turn it PAID, so polling continues.
export const isFinal = (status) => status === 'PAID'

export const ENTRY_LABELS = {
  TOP_UP: 'Nạp coin',
  BOOKING_DEPOSIT: 'Đặt cọc',
  BOOKING_DEPOSIT_RETURN: 'Hoàn cọc',
  BOOKING_PAYOUT: 'Nhận cọc',
}

export const secondsLeft = (expiresAt, now = Date.now()) => Math.max(0, Math.floor((Date.parse(expiresAt) - now) / 1000))

export const WITHDRAWAL_MIN = 100

// Mirrors backend: fee = 20 + ceil(x * 5%) coins, payout = (x - fee) * 1000 VND.
export const withdrawalFee = (x) => 20 + Math.ceil((x * 5) / 100)
export const withdrawalPayoutVnd = (x) => (x - withdrawalFee(x)) * 1000

export function withdrawalError(value, balance) {
  if (!/^\d+$/.test(value)) return 'Nhập số coin là số nguyên'
  const coins = Number(value)
  if (coins < WITHDRAWAL_MIN) return `Rút tối thiểu ${WITHDRAWAL_MIN} coin`
  if (coins > balance) return 'Vượt quá số dư'
  return null
}

export const WITHDRAWAL_STATUS_LABELS = { PENDING: 'Chờ xử lý', PAID: 'Đã chuyển', REJECTED: 'Bị từ chối' }
