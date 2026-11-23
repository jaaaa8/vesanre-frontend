import { useState } from 'react'
import { toast } from 'react-toastify'
import { useApi } from '../../hooks/useApi'
import { getSports, getVenueSetup, setVenueSetup } from '../../utils/api'
import { setupError } from '../../utils/providerRules'
import AsyncView from '../common/AsyncView'
import OperatingHoursTab from './OperatingHoursTab'
import PricingTab from './PricingTab'

const DEFAULT_WEEK = Array.from({ length: 7 }, (_, weekday) => ({ weekday, closed: false, opensAt: '06:00:00', closesAt: '22:00:00' }))

const toForm = (setup) => ({
  sportCode: setup.sportCode ?? '',
  courtCount: String(setup.courtCount || 1),
  depositPercent: String(setup.depositPercent),
  operatingHours: setup.operatingHours.length === 7 ? setup.operatingHours : DEFAULT_WEEK,
  pricingRules: setup.pricingRules,
})

const toPayload = (form) => ({
  ...form,
  courtCount: Number(form.courtCount),
  depositPercent: Number(form.depositPercent),
  pricingRules: form.pricingRules.map((r) => ({ ...r, pricePerHour: Number(r.pricePerHour) })),
})

export default function VenueSetupTab({ venueId }) {
  const setup = useApi(() => getVenueSetup(venueId), [venueId])
  const sports = useApi(getSports, [])
  return (
    <AsyncView state={setup}>
      {setup.data && sports.data && <SetupForm key={JSON.stringify(setup.data)} venueId={venueId} setup={setup.data} sports={sports.data} onSaved={setup.setData} />}
    </AsyncView>
  )
}

function SetupForm({ venueId, setup, sports, onSaved }) {
  const [form, setForm] = useState(() => toForm(setup))
  const [busy, setBusy] = useState(false)
  const error = setupError(form)
  const set = (key) => (value) => setForm({ ...form, [key]: value })
  const input = (key) => (e) => set(key)(e.target.value)

  const save = async (event) => {
    event.preventDefault()
    if (error) return
    setBusy(true)
    try {
      onSaved(await setVenueSetup(venueId, toPayload(form)))
      toast.success('Đã lưu sân & lịch')
    } catch (e) {
      toast.error(e.status === 409 ? 'Còn lượt đặt sắp tới trên các sân cần bớt' : e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="pv-grid" onSubmit={save}>
      {setup.courtCount === 0 && <p className="pv-muted">Chưa thiết lập sân — đang hiển thị giờ mặc định 06:00–22:00.</p>}
      <div className="pv-grid two">
        <label className="ui-field">
          <span>Môn thể thao *</span>
          <select required value={form.sportCode} onChange={input('sportCode')} disabled={busy}>
            <option value="">— Chọn môn —</option>
            {sports.map((s) => (
              <option key={s.id} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="ui-field">
          <span>Số sân *</span>
          <input type="number" min={1} max={50} step={1} required value={form.courtCount} onChange={input('courtCount')} disabled={busy} />
        </label>
        <label className="ui-field">
          <span>% đặt cọc (0 = không cần cọc)</span>
          <input type="number" min={0} max={100} step={1} required value={form.depositPercent} onChange={input('depositPercent')} disabled={busy} />
        </label>
      </div>
      <h3>Giờ mở cửa</h3>
      <OperatingHoursTab value={form.operatingHours} onChange={set('operatingHours')} busy={busy} />
      <h3>Bảng giá</h3>
      <PricingTab value={form.pricingRules} onChange={set('pricingRules')} busy={busy} />
      {error && <p className="pv-error">{error}</p>}
      <div className="ui-actions">
        <button type="submit" className="ui-btn primary" disabled={busy || Boolean(error)}>
          {busy ? 'Đang lưu…' : 'Lưu sân & lịch'}
        </button>
      </div>
    </form>
  )
}
