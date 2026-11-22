import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { createCourt } from '../../utils/api'
import { validateCourt } from '../../utils/providerRules'
import StatusBadge from '../common/StatusBadge'
import CourtForm from './CourtForm'
import { courtPayload, EMPTY_COURT } from './courtFields'

export default function CourtList({ venueId, courts }) {
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  return (
    <div className="pv-grid">
      <div className="pv-card-head">
        <span className="pv-muted">{courts.length} sân con</span>
        <button type="button" className="ui-btn primary" onClick={() => setCreating(true)}>
          + Thêm sân con
        </button>
      </div>
      {courts.length === 0 ? (
        <p className="ui-empty">Chưa có sân con nào.</p>
      ) : (
        <div className="pv-table-wrap">
          <table className="pv-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {courts.map((c) => (
                <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/provider/courts/${c.id}`)}>
                  <td>{c.code}</td>
                  <td>
                    <a href={`/provider/courts/${c.id}`} onClick={(e) => e.preventDefault()}>
                      {c.name}
                    </a>
                  </td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <CreateCourtDialog
        venueId={venueId}
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(court) => navigate(`/provider/courts/${court.id}`)}
      />
    </div>
  )
}

function CreateCourtDialog({ venueId, open, onClose, onCreated }) {
  const ref = useRef(null)
  const [form, setForm] = useState(EMPTY_COURT)
  const [busy, setBusy] = useState(false)
  const error = validateCourt(form)

  useEffect(() => {
    if (open) ref.current.showModal()
    else if (ref.current.open) ref.current.close()
  }, [open])

  const submit = async (event) => {
    event.preventDefault()
    if (error) return
    setBusy(true)
    try {
      const court = await createCourt(venueId, courtPayload(form))
      toast.success('Đã tạo sân con')
      onCreated(court)
    } catch (cause) {
      toast.error(cause.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <dialog
      ref={ref}
      className="ui-dialog"
      style={{ width: 'min(40rem, calc(100vw - 2rem))' }}
      onCancel={(e) => {
        e.preventDefault()
        if (!busy) onClose()
      }}
    >
      <form onSubmit={submit}>
        <h3>Thêm sân con</h3>
        <CourtForm value={form} onChange={setForm} />
        {form.capacity === '' ? <p className="pv-muted">Nhập sức chứa để tạo sân con.</p> : error && <p className="pv-error">{error}</p>}
        <div className="ui-actions">
          <button type="button" className="ui-btn ghost" onClick={onClose} disabled={busy}>
            Hủy
          </button>
          <button type="submit" className="ui-btn primary" disabled={busy || Boolean(error)}>
            {busy ? 'Đang tạo…' : 'Tạo sân con'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
