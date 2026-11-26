import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { approveVenue, getAdminVenue, getSports, reactivateVenue, rejectVenue, suspendVenue } from '../../utils/api'
import { WEEKDAYS } from '../../utils/format'
import { priceRows } from '../../utils/publicRules'
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
        <div aria-busy={detail.loading} className={detail.loading ? 'pv-reloading' : undefined}>
          <VenueView venue={detail.data.venue} setup={detail.data.setup}>
            {(ACTIONS[detail.data.venue.status] || []).map((a) => (
              <button key={a.key} type="button" className={a.reason ? 'ui-btn' : 'ui-btn primary'} disabled={busy || detail.loading} onClick={() => setAction(a)}>
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
        </div>
      )}
    </AsyncView>
  )
}

function VenueView({ venue, setup, children }) {
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
        <h2>Sân &amp; lịch</h2>
        <SetupSummary setup={setup} />
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

const hoursText = (d) => (d.closed ? 'Nghỉ' : `${d.opensAt.slice(0, 5)}–${d.closesAt.slice(0, 5)}`)

// Weekdays with the same hours collapse into one entry, like the public price table.
function hoursSummary(hours) {
  const groups = new Map()
  for (const d of hours) groups.set(hoursText(d), [...(groups.get(hoursText(d)) ?? []), WEEKDAYS[d.weekday]])
  return [...groups].map(([text, days]) => (days.length === 7 ? `Mỗi ngày ${text}` : `${days.join(', ')}: ${text}`)).join(' · ')
}

function SetupSummary({ setup }) {
  const sports = useApi(getSports, [])
  if (setup.courtCount === 0) return <p className="pv-muted">Chưa thiết lập sân.</p>
  const sport = sports.data?.find((s) => s.code === setup.sportCode)?.name ?? setup.sportCode ?? '—'
  return (
    <div className="pv-grid">
      <p>
        {sport} · {setup.courtCount} sân · {setup.depositPercent === 0 ? 'Không cọc' : `Cọc ${setup.depositPercent}%`}
      </p>
      <p>Giờ mở cửa: {setup.operatingHours.length === 0 ? 'Chưa đặt' : hoursSummary(setup.operatingHours)}</p>
      <p>
        Bảng giá:{' '}
        {setup.pricingRules.length === 0 ? 'Chưa có bảng giá' : priceRows(setup.pricingRules).map((r) => `${r.days} ${r.text}`).join(' · ')}
      </p>
    </div>
  )
}
