import { expireSession, getSession } from './auth'
import { toQuery } from './query'

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export class ApiError extends Error {
  constructor(message, status, detail = message) {
    super(message)
    this.status = status
    // Raw backend text, kept for comparisons so the shown message can be translated freely.
    this.detail = detail
  }
}

// Backend messages a customer meets while booking; anything else is shown as sent.
const VI_MESSAGES = {
  'Insufficient coins': 'Số dư coin không đủ',
  'Slot is no longer available': 'Khung giờ này vừa có người đặt, hãy chọn giờ khác',
  'Requested time is not bookable': 'Khung giờ đã chọn không đặt được',
  'Booking duration is out of range': 'Thời lượng đặt không hợp lệ',
  'date must be within the next 30 days': 'Chỉ đặt được trong 30 ngày tới',
  'Court not found': 'Sân không còn hoạt động',
  'Booking not found': 'Không tìm thấy lượt đặt',
  'Booking already started': 'Lượt đặt đã bắt đầu, không thể huỷ',
  'Deposit is too small': 'Tiền cọc quá nhỏ',
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
    const detail = body?.detail || body?.message || (response.status === 401 ? 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.' : null) || 'Không thể xử lý yêu cầu. Vui lòng thử lại.'
    throw new ApiError(VI_MESSAGES[detail] ?? detail, response.status, detail)
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

// Admin: Sprint 4
export const listAdminUsers = (q) => request(`/api/admin/users${toQuery(q)}`)
export const suspendUser = (id, reason) => post(`/api/admin/users/${id}/suspend`, { reason })
export const reactivateUser = (id) => post(`/api/admin/users/${id}/reactivate`)

export const listAuditLogs = (q) => request(`/api/admin/audit-logs${toQuery(q)}`)

export const listAdminReviews = (q) => request(`/api/admin/reviews${toQuery(q)}`)
export const hideReview = (id, reason) => post(`/api/admin/reviews/${id}/hide`, { reason })
export const unhideReview = (id) => post(`/api/admin/reviews/${id}/unhide`)

export const listAdminWithdrawals = (q) => request(`/api/admin/withdrawals${toQuery(q)}`)
export const markWithdrawalPaid = (id, bankTransactionRef) => post(`/api/admin/withdrawals/${id}/mark-paid`, { bankTransactionRef })
export const rejectWithdrawal = (id, reason) => post(`/api/admin/withdrawals/${id}/reject`, { reason })

export const getTopShops = (q) => request(`/api/admin/reports/top-shops${toQuery(q)}`)
export const getFinanceReport = (q) => request(`/api/admin/reports/finance${toQuery(q)}`)

// Wallet
export const getWallet = () => request('/api/wallet')
export const getWalletEntries = (q) => request(`/api/wallet/entries${toQuery(q)}`)
export const createTopUp = (coins) => post('/api/wallet/top-ups', { coins })
export const getTopUp = (id) => request(`/api/wallet/top-ups/${id}`)

// Bookings (customer)
export const createBooking = (body) => post('/api/bookings', body)
export const listBookings = (q) => request(`/api/bookings${toQuery(q)}`)
export const getBooking = (id) => request(`/api/bookings/${id}`)
export const cancelBooking = (id, reason) => post(`/api/bookings/${id}/cancel`, reason ? { reason } : undefined)

// Notifications
export const listNotifications = (q) => request(`/api/notifications${toQuery(q)}`)
export const markNotificationRead = (id) => post(`/api/notifications/${id}/read`)

// Provider: bookings and shop wallet
export const listProviderBookings = (q) => request(`/api/provider/bookings${toQuery(q)}`)
export const getProviderBooking = (id) => request(`/api/provider/bookings/${id}`)
export const cancelProviderBooking = (id, reason) => post(`/api/provider/bookings/${id}/cancel`, { reason })
export const getShopWallet = () => request('/api/provider/wallet')

// Provider: Sprint 4
export const createWithdrawal = (body) => post('/api/provider/withdrawals', body)
export const listShopWithdrawals = (q) => request(`/api/provider/withdrawals${toQuery(q)}`)
export const listProviderReviews = (q) => request(`/api/provider/reviews${toQuery(q)}`)
export const replyReview = (id, reply) => post(`/api/provider/reviews/${id}/reply`, { reply })
export const getMonthlyBookings = (months) => request(`/api/provider/reports/monthly-bookings${toQuery({ months })}`)

// Reviews
export const createReview = (bookingId, body) => post(`/api/bookings/${bookingId}/review`, body)
export const listVenueReviews = (venueId, q) => request(`/api/catalog/venues/${venueId}/reviews${toQuery(q)}`, PUBLIC)
