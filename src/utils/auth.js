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
  storage().forEach((item) => {
    item.removeItem(AUTH_KEY)
    item.removeItem('sporthub_user')
  })
}

// Kept identical to AuthPatterns.java in the backend.
export const SESSION_EXPIRED = 'sporthub:session-expired'

export function expireSession() {
  clearSession()
  window.dispatchEvent(new Event(SESSION_EXPIRED))
}

export function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

// Vietnamese mobile: 0 or +84, then a 3/5/7/8/9 prefix and 8 digits.
export function validPhone(value) {
  return /^(0|\+84)[35789][0-9]{8}$/.test(value.trim())
}

export function toBackendRole(role) {
  return role === 'owner' ? 'PROVIDER' : 'CUSTOMER'
}

// Backend authorizes from the JWT "roles" claim; session.user.roles can be refreshed from the DB and run ahead of it.
export function tokenRoles(session) {
  try {
    const part = session.accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const binary = atob(part.padEnd(part.length + ((4 - (part.length % 4)) % 4), '='))
    const payload = JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0))))
    return Array.isArray(payload.roles) ? payload.roles : []
  } catch {
    return []
  }
}

export function hasRole(session, role) {
  return tokenRoles(session).includes(role)
}
