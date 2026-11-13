import { useState } from 'react'
import { formatVnd, minutesToTime, WEEKDAYS } from '../../utils/format'
import { validatePricing } from '../../utils/providerRules'

const SLOTS = Array.from({ length: 49 }, (_, i) => i * 30)
let seq = 0
const row = (r) => ({ key: ++seq, weekday: r.weekday, startMinute: r.startMinute, endMinute: r.endMinute, pricePerHour: String(r.pricePerHour) })

export default function PricingTab({ value, onSave, busy }) {
  const [rows, setRows] = useState(() => value.map(row))
  const [sourceDay, setSourceDay] = useState(0)
  const payload = rows.map(({ weekday, startMinute, endMinute, pricePerHour }) => ({ weekday, startMinute, endMinute, pricePerHour: Number(pricePerHour) }))
  const error = validatePricing(payload)

  const set = (key, patch) => setRows(rows.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  const add = () => setRows([...rows, row({ weekday: sourceDay, startMinute: 360, endMinute: 1320, pricePerHour: '' })])
  const copyToAll = () => {
    const source = rows.filter((r) => r.weekday === sourceDay)
    const copies = WEEKDAYS.flatMap((_, d) => (d === sourceDay ? [] : source.map((r) => row({ ...r, weekday: d }))))
    setRows([...source, ...copies])
  }

  const save = (event) => {
    event.preventDefault()
    if (!error) onSave(payload)
  }

  return (
    <form className="pv-grid" onSubmit={save}>
      {rows.length === 0 ? (
        <p className="ui-empty">Chưa có khung giá nào.</p>
      ) : (
        <div className="pv-table-wrap">
          <table className="pv-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Từ</th>
                <th>Đến</th>
                <th>Giá mỗi giờ (đ)</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key}>
                  <td>
                    <select aria-label="Ngày" value={r.weekday} onChange={(e) => set(r.key, { weekday: Number(e.target.value) })}>
                      {WEEKDAYS.map((label, d) => (
                        <option key={d} value={d}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  {['startMinute', 'endMinute'].map((field) => (
                    <td key={field}>
                      <select aria-label={field === 'startMinute' ? 'Từ giờ' : 'Đến giờ'} value={r[field]} onChange={(e) => set(r.key, { [field]: Number(e.target.value) })}>
                        {SLOTS.map((m) => (
                          <option key={m} value={m}>
                            {minutesToTime(m)}
                          </option>
                        ))}
                      </select>
                    </td>
                  ))}
                  <td>
                    <input type="number" aria-label="Giá mỗi giờ" min={1} step="any" value={r.pricePerHour} onChange={(e) => set(r.key, { pricePerHour: e.target.value })} />
                    {Number(r.pricePerHour) > 0 && <div className="pv-muted">{formatVnd(r.pricePerHour)}</div>}
                  </td>
                  <td>
                    <button type="button" className="ui-btn ghost" onClick={() => setRows(rows.filter((x) => x.key !== r.key))} disabled={busy}>
                      Xóa dòng
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {error && <p className="pv-error">{error}</p>}
      <div className="ui-actions" style={{ flexWrap: 'wrap' }}>
        <select aria-label="Ngày nguồn" value={sourceDay} onChange={(e) => setSourceDay(Number(e.target.value))}>
          {WEEKDAYS.map((label, d) => (
            <option key={d} value={d}>
              {label}
            </option>
          ))}
        </select>
        <button type="button" className="ui-btn ghost" onClick={add} disabled={busy}>
          + Thêm dòng
        </button>
        <button type="button" className="ui-btn ghost" onClick={copyToAll} disabled={busy}>
          Sao chép sang mọi ngày
        </button>
        <button type="submit" className="ui-btn primary" disabled={busy || Boolean(error)}>
          {busy ? 'Đang lưu…' : 'Lưu bảng giá'}
        </button>
      </div>
    </form>
  )
}
