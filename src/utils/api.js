import { expireSession, getSession } from './auth'
import { toQuery } from './query'

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

// auth: false skips the bearer token: an expired token on a permitAll endpoint still gets 401 from the resource server.
async function request(path, options = {}) {
  const { auth = true, ...init } = options
  const session = auth ? getSession() : null
  const isForm = init.body instanceof FormData
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...(init.body && !isForm ? { 'Content-Type': 'application/json' } : {}),
      ...(session ? { Authorization: `Bearer ${session.accessToken}` } : {}),
      ...init.headers,
    },
  })
  if (response.status === 401 && session) expireSession()
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(body?.detail || body?.message || (response.status === 401 ? 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.' : null) || 'Không thể xử lý yêu cầu. Vui lòng thử lại.', response.status)
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
const PUBLIC = { auth: false }
export const getSports = () => request('/api/catalog/sports', PUBLIC)
export const getAmenities = () => request('/api/catalog/amenities', PUBLIC)
export const searchVenues = (params) => request(`/api/catalog/venues${toQuery(params)}`, PUBLIC)
export const getLocations = () => request('/api/catalog/locations', PUBLIC)
export const getPublicVenue = (id) => request(`/api/catalog/venues/${id}`, PUBLIC)
export const getCourtAvailability = (courtId, date) =>
  request(`/api/catalog/courts/${courtId}/availability${toQuery({ date })}`, PUBLIC)

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

// Admin
const post = (path, body) => request(path, body === undefined ? { method: 'POST' } : json('POST', body))

export const listAdminProviders = (q) => request(`/api/admin/providers${toQuery(q)}`)
export const approveProvider = (userId) => post(`/api/admin/providers/${userId}/approve`)
export const rejectProvider = (userId, reason) => post(`/api/admin/providers/${userId}/reject`, { reason })

export const listAdminVenues = (q) => request(`/api/admin/venues${toQuery(q)}`)
export const getAdminVenue = (id) => request(`/api/admin/venues/${id}`)
export const approveVenue = (id) => post(`/api/admin/venues/${id}/approve`)
export const rejectVenue = (id, reason) => post(`/api/admin/venues/${id}/reject`, { reason })
export const suspendVenue = (id, reason) => post(`/api/admin/venues/${id}/suspend`, { reason })
export const reactivateVenue = (id) => post(`/api/admin/venues/${id}/reactivate`)

export const listChangeRequests = (q) => request(`/api/admin/change-requests${toQuery(q)}`)
export const approveChangeRequest = (id) => post(`/api/admin/change-requests/${id}/approve`)
export const rejectChangeRequest = (id, reason) => post(`/api/admin/change-requests/${id}/reject`, { reason })
