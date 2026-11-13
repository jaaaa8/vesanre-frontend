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
  const isForm = options.body instanceof FormData
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body && !isForm ? { 'Content-Type': 'application/json' } : {}),
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

export function applyProvider(payload) {
  return request('/api/profile/provider-application', { method: 'POST', body: JSON.stringify(payload) })
}

const json = (method, body) => ({ method, body: JSON.stringify(body) })

function fileForm(file) {
  const form = new FormData()
  form.append('file', file)
  return form
}

// Catalog
export const getSports = () => request('/api/catalog/sports')
export const getAmenities = () => request('/api/catalog/amenities')

// Provider: shop
export const getShop = () => request('/api/provider/shop')
export const updateShop = (body) => request('/api/provider/shop', json('PATCH', body))
export const uploadShopLogo = (file) => request('/api/provider/shop/logo', { method: 'PUT', body: fileForm(file) })
export const deleteShopLogo = () => request('/api/provider/shop/logo', { method: 'DELETE' })
export const submitShopChange = (body) => request('/api/provider/shop/change-request', json('POST', body))
export const cancelChangeRequest = (id) => request(`/api/provider/change-requests/${id}/cancel`, { method: 'POST' })

// Provider: venues
export const listVenues = () => request('/api/provider/venues')
export const createVenue = (body) => request('/api/provider/venues', json('POST', body))
export const getVenue = (id) => request(`/api/provider/venues/${id}`)
export const updateVenue = (id, body) => request(`/api/provider/venues/${id}`, json('PATCH', body))
export const submitVenueChange = (id, body) => request(`/api/provider/venues/${id}/change-request`, json('POST', body))
export const deleteVenue = (id) => request(`/api/provider/venues/${id}`, { method: 'DELETE' })
export const submitVenue = (id) => request(`/api/provider/venues/${id}/submit`, { method: 'POST' })
export const setVenueAmenities = (id, items) => request(`/api/provider/venues/${id}/amenities`, json('PUT', items))

// Provider: courts
export const createCourt = (venueId, body) => request(`/api/provider/venues/${venueId}/courts`, json('POST', body))
export const getCourt = (id) => request(`/api/provider/courts/${id}`)
export const updateCourt = (id, body) => request(`/api/provider/courts/${id}`, json('PATCH', body))
export const setCourtSports = (id, items) => request(`/api/provider/courts/${id}/sports`, json('PUT', items))
export const setCourtAmenities = (id, items) => request(`/api/provider/courts/${id}/amenities`, json('PUT', items))
export const setOperatingHours = (id, items) => request(`/api/provider/courts/${id}/operating-hours`, json('PUT', items))
export const setPricingRules = (id, items) => request(`/api/provider/courts/${id}/pricing-rules`, json('PUT', items))

// Provider: images. kind is 'venues' or 'courts'.
export const uploadImage = (kind, id, file) => request(`/api/provider/${kind}/${id}/images`, { method: 'POST', body: fileForm(file) })
export const reorderImages = (kind, id, items) => request(`/api/provider/${kind}/${id}/images`, json('PUT', items))
export const deleteImage = (kind, id, imageId) => request(`/api/provider/${kind}/${id}/images/${imageId}`, { method: 'DELETE' })
