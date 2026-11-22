import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useApi } from '../../hooks/useApi'
import { getCourt, setCourtAmenities, setCourtSports, setOperatingHours, setPricingRules, updateCourt } from '../../utils/api'
import { validateCourt } from '../../utils/providerRules'
import AsyncView from '../common/AsyncView'
import StatusBadge from '../common/StatusBadge'
import AmenityPicker from './AmenityPicker'
import CourtForm from './CourtForm'
import CourtSportsTab from './CourtSportsTab'
import { courtPayload, courtToForm } from './courtFields'
import ImageManager from './ImageManager'
import OperatingHoursTab from './OperatingHoursTab'
import PricingTab from './PricingTab'

const TABS = [
  ['info', 'Thông tin'],
  ['sports', 'Môn thể thao'],
  ['amenities', 'Tiện ích'],
  ['hours', 'Giờ mở cửa'],
  ['pricing', 'Bảng giá'],
  ['images', 'Hình ảnh'],
]

export default function CourtDetail({ onLogout }) {
  const { id } = useParams()
  const court = useApi(() => getCourt(id), [id])
  return (
    <AsyncView state={court} onLogout={onLogout}>
      {court.data && <CourtBody court={court.data} setCourt={court.setData} />}
    </AsyncView>
  )
}

function CourtBody({ court, setCourt }) {
  const [params, setParams] = useSearchParams()
  const tab = TABS.some(([k]) => k === params.get('tab')) ? params.get('tab') : 'info'
  const [busy, setBusy] = useState(false)

  const save = async (action, success) => {
    setBusy(true)
    try {
      setCourt(await action())
      toast.success(success)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="pv-card">
      <Link to={`/provider/venues/${court.venueId}?tab=courts`} className="pv-back">
        ‹ Quay lại cơ sở
      </Link>
      <div className="pv-card-head">
        <h2>
          {court.name} <span className="pv-muted">({court.code})</span>
        </h2>
        <StatusBadge status={court.status} />
      </div>

      <div className="pv-tabs" role="tablist">
        {TABS.map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setParams({ tab: key }, { replace: true })}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'info' && <CourtInfoTab key={JSON.stringify(court)} court={court} busy={busy} onSave={(body) => save(() => updateCourt(court.id, body), 'Đã lưu')} />}
      {tab === 'sports' && (
        <CourtSportsTab value={court.sports} busy={busy} onSave={(items) => save(() => setCourtSports(court.id, items), 'Đã lưu môn thể thao')} />
      )}
      {tab === 'amenities' && (
        <AmenityPicker
          scope="COURT"
          value={court.amenities}
          busy={busy}
          onSave={(items) => save(() => setCourtAmenities(court.id, items), 'Đã lưu tiện ích')}
        />
      )}
      {tab === 'hours' && (
        <OperatingHoursTab
          key={JSON.stringify(court.operatingHours)}
          value={court.operatingHours}
          busy={busy}
          onSave={(items) => save(() => setOperatingHours(court.id, items), 'Đã lưu giờ mở cửa')}
        />
      )}
      {tab === 'pricing' && (
        <PricingTab
          key={JSON.stringify(court.pricingRules)}
          value={court.pricingRules}
          busy={busy}
          onSave={(items) => save(() => setPricingRules(court.id, items), 'Đã lưu bảng giá')}
        />
      )}
      {tab === 'images' && <ImageManager kind="courts" ownerId={court.id} images={court.images} onChange={(images) => setCourt({ ...court, images })} />}
    </section>
  )
}

function CourtInfoTab({ court, busy, onSave }) {
  const [form, setForm] = useState(() => courtToForm(court))
  const [status, setStatus] = useState(court.status)
  const error = validateCourt(form)

  const submit = (event) => {
    event.preventDefault()
    if (!error) onSave({ ...courtPayload(form), status })
  }

  return (
    <form className="pv-grid" onSubmit={submit}>
      <CourtForm value={form} onChange={setForm} />
      <label className="ui-field" style={{ maxWidth: '16rem' }}>
        <span>Trạng thái</span>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="ACTIVE">Hoạt động</option>
          <option value="INACTIVE">Ngừng dùng</option>
        </select>
      </label>
      {error && <p className="pv-error">{error}</p>}
      <div className="ui-actions">
        <button type="submit" className="ui-btn primary" disabled={busy || Boolean(error)}>
          {busy ? 'Đang lưu…' : 'Lưu thay đổi'}
        </button>
      </div>
    </form>
  )
}
