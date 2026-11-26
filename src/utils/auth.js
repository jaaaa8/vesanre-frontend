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

const NAME = /^(?=.{2,50}$)[\p{L}\p{M}]+( [\p{L}\p{M}]+)*$/u
const PASSWORD = /^(?=.*\p{L})(?=.*\d)\S{8,32}$/u
const LEGAL_NAME = /^(?=.{2,200}$)[\p{L}\p{M}\d .,&()-]+$/u
const TAX_ID = /^$|^\d{10}(-\d{3})?$/u
const SHOP_NAME = /^$|^(?=.{2,160}$)[\p{L}\p{M}\d .,&()-]+$/u
const REVIEW_COMMENT = /^(?=[\s\S]{10,500}$)(?!([\s\S])\1*$)\S[\s\S]*\S$/u

// Same rules as AuthPatterns.java in the backend.
export const validName = (value) => NAME.test(value.trim())
export const validPassword = (value) => PASSWORD.test(value)
export const validLegalName = (value) => LEGAL_NAME.test(value.trim())
export const validTaxId = (value) => TAX_ID.test(value.trim())
export const validShopName = (value) => SHOP_NAME.test(value.trim())
// Empty means "no comment".
export const validReviewComment = (value) => value.trim() === '' || REVIEW_COMMENT.test(value.trim())

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
