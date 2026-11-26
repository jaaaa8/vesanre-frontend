import { timeToMinutes } from './format.js'

export const IMPORTANT_FIELDS = ['name', 'addressLine', 'ward', 'district', 'city', 'province', 'postalCode', 'latitude', 'longitude']
export const FREE_FIELDS = ['description', 'phone']
export const ALL_FIELDS = [...IMPORTANT_FIELDS, ...FREE_FIELDS]

const TIME = /^\d{2}:\d{2}(:\d{2})?$/

export function validateOperatingHours(items) {
  const days = new Set(items.map((d) => d.weekday))
  if (items.length !== 7 || days.size !== 7 || [...days].some((d) => d < 0 || d > 6)) return 'Cần đủ giờ mở cửa cho 7 ngày'
  for (const d of items) {
    if (d.closed) {
      if (d.opensAt != null || d.closesAt != null) return 'Ngày nghỉ không được có giờ mở/đóng'
    } else if (!TIME.test(d.opensAt ?? '') || !TIME.test(d.closesAt ?? '') || timeToMinutes(d.opensAt) >= timeToMinutes(d.closesAt)) {
      return 'Giờ mở cửa phải trước giờ đóng cửa'
    }
  }
  return null
}

export function validatePricing(items) {
  for (const r of items) {
    if (!(r.startMinute >= 0 && r.startMinute < r.endMinute && r.endMinute <= 1440)) return 'Khung giờ không hợp lệ'
    if (!(Number(r.pricePerHour) > 0)) return 'Giá phải lớn hơn 0'
    if (!Number.isInteger(Number(r.pricePerHour)) || Number(r.pricePerHour) >= 1e10) return 'Giá phải là số nguyên, tối đa 10 chữ số'
  }
  const sorted = [...items].sort((a, b) => a.weekday - b.weekday || a.startMinute - b.startMinute)
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i - 1].weekday === sorted[i].weekday && sorted[i - 1].endMinute > sorted[i].startMinute) return 'Các khung giá trong cùng ngày bị chồng lấn'
  }
  return null
}

const intIn = (v, min, max) => v !== '' && v != null && Number.isInteger(Number(v)) && Number(v) >= min && Number(v) <= max
const wholeHour = (t) => t == null || /^\d{2}:00(:00)?$/.test(t)

// Mirrors backend VenueSetupService.validate.
export function setupError({ sportCode, courtCount, depositPercent, operatingHours, pricingRules }) {
  if (!intIn(courtCount, 1, 50)) return 'Số sân từ 1 đến 50'
  if (!sportCode) return 'Chọn môn thể thao'
  if (!intIn(depositPercent, 0, 100)) return '% cọc từ 0 đến 100'
  const hoursError = validateOperatingHours(operatingHours)
  if (hoursError) return hoursError
  if (!operatingHours.every((d) => wholeHour(d.opensAt) && wholeHour(d.closesAt))) return 'Giờ mở/đóng cửa phải là giờ tròn'
  const pricingError = validatePricing(pricingRules)
  if (pricingError) return pricingError
  if (pricingRules.some((r) => r.startMinute % 60 || r.endMinute % 60)) return 'Khung giá phải theo giờ tròn'
  return null
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function validateImageFile(file, currentCount) {
  if (!IMAGE_TYPES.includes(file.type)) return 'Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP'
  if (file.size > 5 * 1024 * 1024) return 'Ảnh không được vượt quá 5MB'
  if (currentCount >= 10) return 'Tối đa 10 ảnh'
  return null
}

const text = (v) => (v == null ? '' : String(v).trim())

export function venuePatchPayload(venue, form, fields) {
  const payload = {}
  fields.filter((k) => k !== 'latitude' && k !== 'longitude').forEach((k) => {
    if (text(form[k]) !== text(venue[k])) payload[k] = text(form[k])
  })
  if (fields.includes('latitude') || fields.includes('longitude')) {
    const lat = text(form.latitude)
    const lng = text(form.longitude)
    if (!lat !== !lng) return { payload: null, error: 'Nhập cả vĩ độ và kinh độ, hoặc bỏ trống cả hai' }
    if (lat) {
      const la = Number(lat)
      const lo = Number(lng)
      if (!Number.isFinite(la) || !Number.isFinite(lo) || Math.abs(la) > 90 || Math.abs(lo) > 180) return { payload: null, error: 'Tọa độ không hợp lệ' }
      if (la !== venue.latitude || lo !== venue.longitude) Object.assign(payload, { latitude: la, longitude: lo })
    }
  }
  return Object.keys(payload).length ? { payload, error: null } : { payload: null, error: 'Chưa có thay đổi' }
}

export const venueChangePayload = (venue, form) => venuePatchPayload(venue, form, IMPORTANT_FIELDS)

export const imageOrderPayload = (images) => images.map(({ id, altText }) => ({ id, altText }))

export function moveItem(arr, index, delta) {
  const target = index + delta
  if (target < 0 || target >= arr.length) return [...arr]
  const next = [...arr]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}
