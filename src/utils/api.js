import { clearSession, getSession } from './auth'

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path, options = {}) {
  const session = getSession()
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(session ? { Authorization: `Bearer ${session.accessToken}` } : {}),
      ...options.headers,
    },
  })
  if (response.status === 401) clearSession()
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(body?.detail || body?.message || 'Không thể xử lý yêu cầu. Vui lòng thử lại.', response.status)
  }
  return response.status === 204 ? null : response.json()
}

export function login(email, password) {
  return request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}

export function register(payload) {
  return request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) })
}

export function logout() {
  return request('/api/auth/logout', { method: 'POST' })
}

export function getProfile() {
  return request('/api/profile/me')
}

export function updateProfile(payload) {
  return request('/api/profile/me', { method: 'PATCH', body: JSON.stringify(payload) })
}
