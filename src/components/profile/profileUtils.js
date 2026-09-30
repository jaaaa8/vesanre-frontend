export const USER_KEY = 'sporthub_user'
export const BOOKINGS_KEY = 'sporthub_bookings'

export const HERO_IMG =
  'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=2000&q=80&auto=format&fit=crop'

export const TABS = [
  { id: 'profile', label: 'Thông tin cá nhân', icon: '👤' },
  { id: 'bookings', label: 'Lịch sử đặt sân', icon: '📅' },
  { id: 'payments', label: 'Phương thức thanh toán', icon: '💳' },
  { id: 'notifications', label: 'Thông báo', icon: '🔔' },
  { id: 'security', label: 'Đổi mật khẩu', icon: '🔒' },
]

export const SPORT_OPTIONS = ['Bóng đá', 'Pickleball', 'Cầu lông', 'Tennis']
export const GENDER_OPTIONS = ['Nam', 'Nữ', 'Khác']

export const DEFAULT_BOOKINGS = [
  {
    id: 'GT-7719',
    qr: 'GT-7719',
    title: 'Goal Time Stadium — Sân 7',
    meta: 'Bóng đá · Hôm nay 19:00 – 20:30 · Quận 7, TP.HCM',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80&auto=format&fit=crop',
    alt: 'Goal Time Stadium',
    badges: [
      { label: 'Đã xác nhận', kind: 'confirmed' },
      { label: 'Sắp diễn ra', kind: 'upcoming' },
    ],
    cancellable: true,
  },
  {
    id: 'HB-2204',
    qr: 'HB-2204',
    title: 'Harbor Pickleball Club — Sân 2',
    meta: 'Pickleball · Ngày mai 07:00 – 09:00 · Thủ Đức, TP.HCM',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80&auto=format&fit=crop',
    alt: 'Harbor Pickleball Club',
    badges: [
      { label: 'Đã xác nhận', kind: 'confirmed' },
      { label: 'Giờ vàng', kind: 'vip' },
    ],
    cancellable: true,
  },
  {
    id: 'AX-0912',
    qr: 'AX-0912',
    title: 'Apex Arena — Sân Cầu lông A1',
    meta: 'Cầu lông · 12/09/2026 18:00 – 19:00 · Cầu Giấy, Hà Nội',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80&auto=format&fit=crop',
    alt: 'Apex Arena',
    badges: [{ label: 'Đã hoàn thành', kind: 'completed' }],
    cancellable: false,
  },
]

export const INITIAL_NOTIFS = [
  {
    id: 'reminder',
    title: 'Nhắc lịch trước giờ đấu',
    desc: 'SMS + Push trước 2 giờ thi đấu.',
    on: true,
    dotActive: true,
    label: 'Bật nhắc lịch',
  },
  {
    id: 'promo',
    title: 'Ưu đãi giờ vàng',
    desc: 'Giảm 20% khung 07:00 – 09:00 mỗi cuối tuần.',
    on: false,
    dotActive: false,
    label: 'Bật ưu đãi',
  },
  {
    id: 'sms',
    title: 'Xác nhận đặt sân qua SMS',
    desc: 'Luôn bật để giữ chỗ đảm bảo.',
    on: true,
    dotActive: true,
    label: 'Bật SMS',
  },
]

export function initialsOf(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'A'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function readStoredUser() {
  try {
    const raw = window.localStorage.getItem(USER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.user ?? parsed
  } catch {
    return null
  }
}

export function normalizeForm(source) {
  if (!source) return { fFullName: '', fPhone: '', fEmail: '', fDob: '', gender: 'Nam', sports: ['Bóng đá'] }
  const contact = source.contact || ''
  const isEmail = contact.includes('@')
  return {
    fFullName: source.name || source.displayName || '',
    fEmail: source.email || (isEmail ? contact : ''),
    fPhone: source.phone || (!isEmail ? contact : ''),
    fDob: source.dob || source.birthDate || '',
    gender: source.gender || 'Nam',
    sports: Array.isArray(source.sports) && source.sports.length > 0 ? source.sports : ['Bóng đá'],
  }
}

export function sideIdOf(user) {
  const id = String(user?.contact || user?.phone || user?.email || 'SH').replace(/\D/g, '').slice(-4) || '2026'
  return `ID: SH-${id}`
}

function deriveBadges(raw) {
  if (Array.isArray(raw.badges) && raw.badges.length > 0) {
    return raw.badges
      .map((b, i) => {
        if (typeof b === 'string') return { label: b, kind: 'confirmed' }
        if (b && typeof b === 'object')
          return { label: b.label || b.text || `Trạng thái ${i + 1}`, kind: b.kind || b.type || 'confirmed' }
        return null
      })
      .filter(Boolean)
  }
  return [
    { label: 'Đã xác nhận', kind: 'confirmed' },
    { label: 'Sắp diễn ra', kind: 'upcoming' },
  ]
}

export function normalizeBooking(raw, index) {
  if (!raw || typeof raw !== 'object') return null
  const id = raw.id || raw.qr || raw.code || `BK-${index + 1}`
  const qr = raw.qr || raw.id || raw.code || id
  if (raw.title && raw.meta && Array.isArray(raw.badges)) return { ...raw, id, qr }
  const title = raw.title || raw.venue || raw.name || 'Sân đã đặt'
  const sport = raw.sport || raw.sportType || raw.type || ''
  const date = raw.date || raw.day || ''
  const time = raw.time || raw.slot || raw.timeSlot || ''
  const location = raw.location || raw.address || raw.area || ''
  const dateTime = [date, time].filter(Boolean).join(' ')
  const meta =
    raw.meta ||
    [sport, dateTime, location].filter((part) => String(part || '').trim() !== '').join(' · ') ||
    'Chi tiết lịch đặt'
  const statusText = String(raw.status || '').toLowerCase()
  const isDone =
    statusText.includes('hoàn thành') || statusText.includes('complete') || statusText.includes('done')
  return {
    id,
    qr,
    title,
    meta,
    image:
      raw.image ||
      raw.img ||
      raw.cover ||
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80&auto=format&fit=crop',
    alt: raw.alt || title,
    badges: deriveBadges(raw),
    cancellable: raw.cancellable ?? !isDone,
  }
}

export function readStoredBookings() {
  try {
    const raw = window.localStorage.getItem(BOOKINGS_KEY)
    if (raw === null) return [...DEFAULT_BOOKINGS]
    const parsed = JSON.parse(raw)
    const arr = Array.isArray(parsed) ? parsed : parsed?.bookings
    if (!Array.isArray(arr)) return [...DEFAULT_BOOKINGS]
    return arr.map((item, index) => normalizeBooking(item, index)).filter(Boolean)
  } catch {
    return [...DEFAULT_BOOKINGS]
  }
}

export function persistBookings(next) {
  try {
    window.localStorage.setItem(BOOKINGS_KEY, JSON.stringify(next))
  } catch {
    /* storage blocked — state still updates */
  }
}

/* Centralized user persistence. Returns false when browser storage is blocked. */
export function saveStoredUser(nextUser) {
  try {
    window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    return true
  } catch {
    return false
  }
}

export function resolveInitialTab() {
  try {
    if (window.location.hash === '#bookings') return 'bookings'
    if (new URLSearchParams(window.location.search).get('tab') === 'bookings') return 'bookings'
  } catch {
    /* ignore */
  }
  return 'profile'
}
