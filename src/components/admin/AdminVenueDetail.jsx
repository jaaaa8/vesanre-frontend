import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { approveVenue, getAdminVenue, reactivateVenue, rejectVenue, suspendVenue } from '../../utils/api'
import { formatVnd, minutesToTime, WEEKDAYS } from '../../utils/format'
import AsyncView from '../common/AsyncView'
import ConfirmDialog from '../common/ConfirmDialog'
import StatusBadge from '../common/StatusBadge'
import { VENUE_LABELS } from '../provider/venueFields'
import { useAdminAction } from './useAdminAction'

// Allowed decisions per venue status; reason marks the ones the backend requires a reason for.
const ACTIONS = {
  PENDING_REVIEW: [
    { key: 'approve', label: 'Duyệt', call: (id) => approveVenue(id), done: 'Đã duyệt cơ sở' },
    { key: 'reject', label: 'Từ chối', reason: true, call: (id, r) => rejectVenue(id, r), done: 'Đã từ chối cơ sở' },
  ],
  ACTIVE: [{ key: 'suspend', label: 'Tạm ngưng', reason: true, call: (id, r) => suspendVenue(id, r), done: 'Đã tạm ngưng cơ sở' }],
  SUSPENDED: [{ key: 'reactivate', label: 'Kích hoạt lại', call: (id) => reactivateVenue(id), done: 'Đã kích hoạt lại cơ sở' }],
}

export default function AdminVenueDetail({ onLogout }) {
  const { id } = useParams()
  const detail = useApi(() => getAdminVenue(id), [id])
  const { busy, run } = useAdminAction(detail.reload)
  const [action, setAction] = useState(null)

  const confirm = async (reason) => {
    await run(() => action.call(id, reason), action.done)
    setAction(null)
  }

  return (
    <AsyncView state={detail} onLogout={onLogout}>
      {detail.data && (
        <>
          <VenueView venue={detail.data.venue} courts={detail.data.courts}>
            {(ACTIONS[detail.data.venue.status] || []).map((a) => (
              <button key={a.key} type="button" className={a.reason ? 'ui-btn' : 'ui-btn primary'} disabled={busy} onClick={() => setAction(a)}>
                {a.label}
              </button>
            ))}
          </VenueView>
          <ConfirmDialog
            open={Boolean(action)}
            title={action ? `${action.label} cơ sở` : ''}
            message={action && `${action.label} "${detail.data.venue.name}"?`}
            requireReason={Boolean(action?.reason)}
            confirmText={action?.label}
            busy={busy}
            onConfirm={confirm}
            onCancel={() => setAction(null)}
          />
        </>
      )}
    </AsyncView>
  )
}

function VenueView({ venue, courts, children }) {
  const hasCoords = venue.latitude != null && venue.longitude != null
  return (
    <>
      <Link to={`/admin/venues?status=${venue.status}`}>‹ Quay lại danh sách</Link>
      <section className="pv-card">
        <div className="pv-card-head">
          <h2>{venue.name}</h2>
          <div className="meta">
            <StatusBadge status={venue.status} />
            {children}
          </div>
        </div>
        <dl className="pv-grid two">
          {Object.entries(VENUE_LABELS).map(([key, label]) => (
            <div key={key}>
              <dt className="pv-muted">{label}</dt>
              <dd>{venue[key] == null || venue[key] === '' ? '—' : String(venue[key])}</dd>
            </div>
          ))}
        </dl>
        {hasCoords && (
          <a href={`https://www.google.com/maps?q=${venue.latitude},${venue.longitude}`} target="_blank" rel="noreferrer">
            Xem trên Google Maps
          </a>
        )}
      </section>
      <section className="pv-card">
        <h2>Tiện ích</h2>
        {venue.amenities.length === 0 ? (
          <p className="pv-muted">Chưa có tiện ích.</p>
        ) : (
          <ul>
            {venue.amenities.map((a) => (
              <li key={a.amenityId}>
                {a.name}
                {a.details && ` — ${a.details}`}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="pv-card">
        <h2>Hình ảnh</h2>
        <Images images={venue.images} alt={venue.name} />
      </section>
      <section className="pv-card">
        <h2>Sân con</h2>
        {courts.length === 0 ? <p className="pv-muted">Chưa có sân con.</p> : courts.map((c) => <CourtView key={c.id} court={c} />)}
      </section>
    </>
  )
}

function Images({ images, alt }) {
  if (images.length === 0) return <p className="pv-muted">Chưa có ảnh.</p>
  return (
    <div className="pv-images">
      {images.map((img) => (
        <div key={img.id} className="pv-image">
          <img src={img.url} alt={img.altText || alt} />
        </div>
      ))}
    </div>
  )
}

function hoursText(court, weekday) {
  const d = court.operatingHours.find((h) => h.weekday === weekday)
  if (!d) return 'Chưa đặt'
  if (d.closed) return 'Nghỉ'
  return `${d.opensAt.slice(0, 5)}–${d.closesAt.slice(0, 5)}`
}

function CourtView({ court }) {
  return (
    <article className="pv-grid" style={{ borderTop: '1px solid var(--hairline)', paddingTop: '1rem' }}>
      <div className="pv-row">
        <strong>
          {court.name} ({court.code})
        </strong>
        <StatusBadge status={court.status} />
      </div>
      <p className="pv-muted">
        Sức chứa: {court.capacity ?? '—'} · Bước {court.bookingStepMinutes} phút · Tối thiểu {court.minBookingMinutes} phút · Tối đa {court.maxBookingMinutes} phút
      </p>
      <p>Môn: {court.sports.length === 0 ? '—' : court.sports.map((s) => s.name + (s.primary ? ' (chính)' : '')).join(', ')}</p>
      <div className="pv-grid two">
        <table className="pv-table">
          <caption>Giờ mở cửa</caption>
          <tbody>
            {WEEKDAYS.map((label, weekday) => (
              <tr key={weekday}>
                <td>{label}</td>
                <td>{hoursText(court, weekday)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table className="pv-table">
          <caption>Bảng giá</caption>
          <tbody>
            {court.pricingRules.length === 0 ? (
              <tr>
                <td className="pv-muted">Chưa có bảng giá.</td>
              </tr>
            ) : (
              court.pricingRules.map((r) => (
                <tr key={r.id}>
                  <td>{WEEKDAYS[r.weekday]}</td>
                  <td>
                    {minutesToTime(r.startMinute)}–{minutesToTime(r.endMinute)}
                  </td>
                  <td>{formatVnd(r.pricePerHour)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Images images={court.images} alt={court.name} />
    </article>
  )
}
