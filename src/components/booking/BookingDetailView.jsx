import { canCancel } from '../../utils/bookingRules'
import { formatDateTimeIn, formatTimeIn, formatVnd } from '../../utils/format'
import { BookingStatus } from './BookingCard'
import './booking.css'

const SOURCE_LABELS = { CUSTOMER: 'Khách hàng', PROVIDER: 'Chủ sân', ADMIN: 'Quản trị viên' }

export default function BookingDetailView({ booking: b, onCancel, showCustomer }) {
  const at = (iso) => formatDateTimeIn(iso, b.timezone)
  const milestones = [
    ['Đặt lúc', b.createdAt],
    ['Xác nhận', b.confirmedAt],
    ['Hủy lúc', b.cancelledAt],
    ['Hoàn tất', b.completedAt],
  ].filter(([, iso]) => iso)

  return (
    <article className="bk-detail">
      <header className="bk-card-top">
        <h3>{b.bookingCode}</h3>
        <BookingStatus status={b.status} />
      </header>
      <dl className="bk-dl">
        <dt>Sân</dt>
        <dd>
          {b.shopName} · {b.venueName} · {b.courtName}
        </dd>
        <dt>Giờ chơi</dt>
        <dd>
          {at(b.startAt)}–{formatTimeIn(b.endAt, b.timezone)} <small className="ui-muted">({b.timezone})</small>
        </dd>
        {showCustomer && b.customer && (
          <>
            <dt>Khách</dt>
            <dd>
              {b.customer.displayName}
              {b.customer.phone && (
                <>
                  {' · '}
                  <a href={`tel:${b.customer.phone}`}>{b.customer.phone}</a>
                </>
              )}
            </dd>
          </>
        )}
      </dl>
      <table className="bk-prices">
        <tbody>
          {b.priceBreakdown.map((line) => (
            <tr key={line.start}>
              <td>
                {line.start.slice(0, 5)}–{line.end.slice(0, 5)}
              </td>
              <td>{formatVnd(line.price)}</td>
            </tr>
          ))}
          <tr>
            <th>Tổng</th>
            <th>{formatVnd(b.subtotalAmount)}</th>
          </tr>
          <tr>
            <td>Cọc ({b.depositPercent}%)</td>
            <td>{b.depositCoins} coin</td>
          </tr>
        </tbody>
      </table>
      <dl className="bk-dl">
        {milestones.map(([label, iso]) => (
          <div key={label} className="bk-row">
            <dt>{label}</dt>
            <dd>{at(iso)}</dd>
          </div>
        ))}
        {b.cancellationSource && (
          <div className="bk-row">
            <dt>Người hủy</dt>
            <dd>{SOURCE_LABELS[b.cancellationSource] || b.cancellationSource}</dd>
          </div>
        )}
        {b.cancellationReason && (
          <div className="bk-row">
            <dt>Lý do hủy</dt>
            <dd>{b.cancellationReason}</dd>
          </div>
        )}
      </dl>
      {onCancel && canCancel(b) && (
        <div className="ui-actions">
          <button type="button" className="ui-btn" onClick={onCancel}>
            Hủy đặt
          </button>
        </div>
      )}
    </article>
  )
}
