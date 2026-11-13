import { useState } from 'react'
import { toast } from 'react-toastify'
import { cancelChangeRequest, submitVenueChange, updateVenue } from '../../utils/api'
import { ALL_FIELDS, FREE_FIELDS, IMPORTANT_FIELDS, venueChangePayload, venuePatchPayload } from '../../utils/providerRules'
import PendingChange from './PendingChange'
import VenueForm from './VenueForm'
import { VENUE_LABELS, venueToForm } from './venueFields'

const EDITABLE_ALL = new Set(['DRAFT', 'REJECTED'])

export default function VenueInfoTab({ venue, onSaved, reload }) {
  const editAll = EDITABLE_ALL.has(venue.status)
  const fields = editAll ? ALL_FIELDS : FREE_FIELDS
  const [form, setForm] = useState(() => venueToForm(venue))
  const [proposal, setProposal] = useState(null)
  const [busy, setBusy] = useState(false)

  const patch = venuePatchPayload(venue, form, fields)
  const change = proposal && venueChangePayload(venue, proposal)
  const locked = editAll ? new Set() : new Set(IMPORTANT_FIELDS)

  const run = async (action, success) => {
    setBusy(true)
    try {
      const result = await action()
      toast.success(success)
      return result ?? true
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }

  const save = async (event) => {
    event.preventDefault()
    if (patch.error) return
    const next = await run(() => updateVenue(venue.id, patch.payload), 'Đã lưu')
    if (next) onSaved(next)
  }

  const propose = async (event) => {
    event.preventDefault()
    if (change.error) return
    if (await run(() => submitVenueChange(venue.id, change.payload), 'Đã gửi đề xuất thay đổi')) {
      setProposal(null)
      reload()
    }
  }

  const cancel = async () => {
    if (await run(() => cancelChangeRequest(venue.pendingChange.id), 'Đã hủy yêu cầu')) reload()
  }

  return (
    <div className="pv-grid">
      {venue.status === 'PENDING_REVIEW' && <p className="pv-muted">Đang chờ duyệt lần đầu — các thông tin địa chỉ tạm khóa.</p>}
      <form className="pv-grid" onSubmit={save}>
        <VenueForm value={form} onChange={setForm} disabledFields={locked} />
        {patch.error && patch.error !== 'Chưa có thay đổi' && <p className="pv-error">{patch.error}</p>}
        <div className="ui-actions">
          <button type="submit" className="ui-btn primary" disabled={busy || Boolean(patch.error)}>
            Lưu thay đổi
          </button>
        </div>
      </form>

      {(venue.status === 'ACTIVE' || venue.status === 'SUSPENDED') && (
        <div className="pv-grid">
          <h3>Thay đổi thông tin quan trọng</h3>
          <p className="pv-muted">Tên và địa chỉ của cơ sở đang hoạt động chỉ thay đổi sau khi admin duyệt.</p>
          {venue.pendingChange ? (
            <PendingChange change={venue.pendingChange} labels={VENUE_LABELS} onCancel={cancel} busy={busy} />
          ) : proposal ? (
            <form className="pv-grid" onSubmit={propose}>
              <VenueForm value={proposal} onChange={setProposal} fields={IMPORTANT_FIELDS} />
              {change.error && <p className="pv-error">{change.error}</p>}
              <div className="ui-actions">
                <button type="button" className="ui-btn ghost" onClick={() => setProposal(null)} disabled={busy}>
                  Hủy
                </button>
                <button type="submit" className="ui-btn primary" disabled={busy || Boolean(change.error)}>
                  Gửi đề xuất
                </button>
              </div>
            </form>
          ) : (
            <div>
              <button type="button" className="ui-btn" onClick={() => setProposal(venueToForm(venue))}>
                Đề xuất thay đổi
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
