import { useState } from 'react'
import { WEEKDAYS } from '../../utils/format'
import { validateOperatingHours } from '../../utils/providerRules'

const toRows = (items) =>
  WEEKDAYS.map((_, weekday) => {
    const d = items.find((x) => x.weekday === weekday)
    if (!d) return { weekday, closed: false, opensAt: '06:00', closesAt: '22:00' }
    return { weekday, closed: d.closed, opensAt: d.opensAt?.slice(0, 5) || '06:00', closesAt: d.closesAt?.slice(0, 5) || '22:00' }
  })

const toPayload = (rows) =>
  rows.map((r) => (r.closed ? { weekday: r.weekday, closed: true, opensAt: null, closesAt: null } : { weekday: r.weekday, closed: false, opensAt: `${r.opensAt}:00`, closesAt: `${r.closesAt}:00` }))

export default function OperatingHoursTab({ value, onSave, busy }) {
  const [rows, setRows] = useState(() => toRows(value))
  const payload = toPayload(rows)
  const error = validateOperatingHours(payload)

  const set = (weekday, patch) => setRows(rows.map((r) => (r.weekday === weekday ? { ...r, ...patch } : r)))
  const copyMonday = () => setRows(rows.map((r) => ({ ...rows[0], weekday: r.weekday })))

  const save = (event) => {
    event.preventDefault()
    if (!error) onSave(payload)
  }

  return (
    <form className="pv-grid" onSubmit={save}>
      {value.length === 0 && <p className="pv-muted">Chưa thiết lập giờ mở cửa — đang hiển thị mặc định 06:00–22:00.</p>}
      <div className="pv-table-wrap">
        <table className="pv-table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Nghỉ</th>
              <th>Mở cửa</th>
              <th>Đóng cửa</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.weekday}>
                <td>{WEEKDAYS[r.weekday]}</td>
                <td>
                  <input type="checkbox" aria-label={`Nghỉ ${WEEKDAYS[r.weekday]}`} checked={r.closed} onChange={(e) => set(r.weekday, { closed: e.target.checked })} />
                </td>
                <td>
                  <input type="time" step={60} value={r.opensAt} disabled={r.closed} onChange={(e) => set(r.weekday, { opensAt: e.target.value })} />
                </td>
                <td>
                  <input type="time" step={60} value={r.closesAt} disabled={r.closed} onChange={(e) => set(r.weekday, { closesAt: e.target.value })} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && <p className="pv-error">{error}</p>}
      <div className="ui-actions">
        <button type="button" className="ui-btn ghost" onClick={copyMonday} disabled={busy}>
          Áp dụng dòng Thứ 2 cho cả tuần
        </button>
        <button type="submit" className="ui-btn primary" disabled={busy || Boolean(error)}>
          {busy ? 'Đang lưu…' : 'Lưu giờ mở cửa'}
        </button>
      </div>
    </form>
  )
}
