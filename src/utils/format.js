const vnd = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 })

export const formatVnd = (n) => `${vnd.format(Number(n)).replace(/\s/g, '.')} đ`

const pad = (n) => String(n).padStart(2, '0')

export const minutesToTime = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`

export function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export const WEEKDAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric' })

const dateTimeParts = (iso, timeZone) =>
  Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date(iso))
      .map((p) => [p.type, p.value]),
  )

export function formatDateTimeIn(iso, timeZone) {
  const p = dateTimeParts(iso, timeZone)
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`
}

export function formatTimeIn(iso, timeZone) {
  const p = dateTimeParts(iso, timeZone)
  return `${p.hour}:${p.minute}`
}

export const formatCoins = (n) => `${vnd.format(Number(n)).replace(/\s/g, '.')} coin`

export const formatStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating)

export const formatDecimal1 = (n) => Number(n).toFixed(1).replace('.', ',').replace('-', '−')
