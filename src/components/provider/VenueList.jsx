import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useApi } from '../../hooks/useApi'
import { createVenue, listVenues } from '../../utils/api'
import { venuePatchPayload } from '../../utils/providerRules'
import AsyncView from '../common/AsyncView'
import StatusBadge from '../common/StatusBadge'
import VenueForm from './VenueForm'
import { EMPTY_VENUE } from './venueFields'

export default function VenueList({ onLogout }) {
  const venues = useApi(listVenues, [])
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)

  return (
    <section className="pv-card">
      <div className="pv-card-head">
        <h2>Cơ sở của tôi</h2>
        <button type="button" className="ui-btn primary" onClick={() => setCreating(true)}>
          + Thêm cơ sở
        </button>
      </div>
      <AsyncView state={venues} empty={venues.data?.length === 0} emptyText="Bạn chưa có cơ sở nào." onLogout={onLogout}>
        <div className="pv-table-wrap">
          <table className="pv-table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Khu vực</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {venues.data?.map((v) => (
                <tr key={v.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/provider/venues/${v.id}`)}>
                  <td>
                    <a href={`/provider/venues/${v.id}`} onClick={(e) => e.preventDefault()}>
                      {v.name}
                    </a>
                  </td>
                  <td>{[v.district, v.city].filter(Boolean).join(', ')}</td>
                  <td>
                    <StatusBadge status={v.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AsyncView>
      <CreateVenueDialog open={creating} onClose={() => setCreating(false)} onCreated={(v) => navigate(`/provider/venues/${v.id}`)} />
    </section>
  )
}

function CreateVenueDialog({ open, onClose, onCreated }) {
  const ref = useRef(null)
  const [form, setForm] = useState(EMPTY_VENUE)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) ref.current.showModal()
    else if (ref.current.open) ref.current.close()
  }, [open])

  const submit = async (event) => {
    event.preventDefault()
    const { payload, error: invalid } = venuePatchPayload(EMPTY_VENUE, form, Object.keys(EMPTY_VENUE))
    if (invalid) return setError(invalid)
    setError('')
    setBusy(true)
    try {
      const venue = await createVenue(payload)
      toast.success('Đã tạo cơ sở')
      setForm(EMPTY_VENUE)
      onCreated(venue)
    } catch (cause) {
      setError(cause.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <dialog
      ref={ref}
      className="ui-dialog"
      style={{ width: 'min(46rem, calc(100vw - 2rem))' }}
      onCancel={(e) => {
        e.preventDefault()
        if (!busy) onClose()
      }}
    >
      <form onSubmit={submit}>
        <h3>Thêm cơ sở</h3>
        <VenueForm value={form} onChange={setForm} />
        {error && <p className="pv-error">{error}</p>}
        <div className="ui-actions">
          <button type="button" className="ui-btn ghost" onClick={onClose} disabled={busy}>
            Hủy
          </button>
          <button type="submit" className="ui-btn primary" disabled={busy}>
            {busy ? 'Đang tạo…' : 'Tạo cơ sở'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
