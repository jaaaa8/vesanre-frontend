export const EMPTY_COURT = {
  code: '',
  name: '',
  description: '',
  capacity: '',
  bookingStepMinutes: '30',
  minBookingMinutes: '60',
  maxBookingMinutes: '180',
}

export const courtToForm = (court) => Object.fromEntries(Object.keys(EMPTY_COURT).map((k) => [k, court[k] == null ? '' : String(court[k])]))

export const courtPayload = (form) => ({
  code: form.code.trim(),
  name: form.name.trim(),
  description: form.description.trim() || null,
  capacity: Number(form.capacity),
  bookingStepMinutes: Number(form.bookingStepMinutes),
  minBookingMinutes: Number(form.minBookingMinutes),
  maxBookingMinutes: Number(form.maxBookingMinutes),
})
