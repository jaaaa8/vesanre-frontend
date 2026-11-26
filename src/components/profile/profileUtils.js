export const USER_KEY = 'sporthub_user'

export const HERO_IMG =
  'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=2000&q=80&auto=format&fit=crop'

export const TABS = [
  { id: 'profile', label: 'Thông tin cá nhân', icon: '👤' },
  { id: 'bookings', label: 'Lịch đặt sân', icon: '📅' },
  { id: 'wallet', label: 'Ví coin', icon: '🪙' },
  { id: 'notifications', label: 'Thông báo', icon: '🔔' },
  { id: 'security', label: 'Đổi mật khẩu', icon: '🔒' },
]

export const SPORT_OPTIONS = ['Bóng đá', 'Pickleball', 'Cầu lông', 'Tennis']
export const GENDER_OPTIONS = ['Nam', 'Nữ', 'Khác']

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
    fFullName: source.displayName || source.name || '',
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

export function saveStoredUser(nextUser) {
  try {
    window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    return true
  } catch {
    return false
  }
}

export const HASH_TABS = ['bookings', 'wallet', 'notifications']

export function resolveInitialTab(location = window.location) {
  try {
    const hashTab = location.hash.slice(1)
    if (HASH_TABS.includes(hashTab)) return hashTab
    if (new URLSearchParams(location.search).get('tab') === 'bookings') return 'bookings'
  } catch {
    // Malformed location: fall back to the default tab.
  }
  return 'profile'
}
