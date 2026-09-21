const AUTH_KEY = 'sporthub_session'

function storage() {
  if (typeof window === 'undefined') return []
  return [window.localStorage, window.sessionStorage]
}

export function getSession() {
  for (const item of storage()) {
    try {
      const session = JSON.parse(item.getItem(AUTH_KEY))
      if (session?.accessToken && session?.user) return session
    } catch {
      // Ignore a stale or malformed browser value.
    }
  }
  return null
}

export function saveSession(session, remember) {
  clearSession()
  const target = storage()[remember ? 0 : 1]
  target?.setItem(AUTH_KEY, JSON.stringify(session))
}

export function clearSession() {
  storage().forEach((item) => item.removeItem(AUTH_KEY))
}

export function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function toBackendRole(role) {
  return role === 'owner' ? 'PROVIDER' : 'CUSTOMER'
}
