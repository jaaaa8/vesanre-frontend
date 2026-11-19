import { BOOKING_STATUS_LABELS } from '../../utils/bookingRules'
import { formatDateTimeIn, formatTimeIn, formatVnd } from '../../utils/format'
import './booking.css'

export function BookingStatus({ status }) {
  return <span className={`ui-badge is-${status.toLowerCase()}`}>{BOOKING_STATUS_LABELS[status] || status}</span>
}

export default function BookingCard({ booking, onOpen }) {
  return (
    <button type="button" className="bk-card" onClick={() => onOpen(booking.id)}>
      <span className="bk-card-top">
        <b>{booking.bookingCode}</b>
        <BookingStatus status={booking.status} />
      </span>
      <span>
        {booking.venueName} · {booking.courtName}
      </span>
      <span className="ui-muted">
        {formatDateTimeIn(booking.startAt, booking.timezone)}–{formatTimeIn(booking.endAt, booking.timezone)}
      </span>
      <span>
        Tổng {formatVnd(booking.subtotalAmount)} · Cọc {booking.depositCoins} coin
      </span>
    </button>
  )
}
