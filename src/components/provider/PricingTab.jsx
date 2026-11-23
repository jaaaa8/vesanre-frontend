import { useState } from 'react'
import { formatVnd, minutesToTime, WEEKDAYS } from '../../utils/format'

// Whole hours only, matching the hourly booking grid.
const SLOTS = Array.from({ length: 25 }, (_, i) => i * 60)

// value: PricingRuleRequest items; pricePerHour stays as typed until the parent sends it.
export default function PricingTab({ value: rows, onChange: setRows, busy }) {
  const [sourceDay, setSourceDay] = useState(0)

  const set = (index, patch) => setRows(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  const add = () => setRows([...rows, { weekday: sourceDay, startMinute: 360, endMinute: 1320, pricePerHour: '' }])
  const copyToAll = () => {
    const source = rows.filter((r) => r.weekday === sourceDay)
    const copies = WEEKDAYS.flatMap((_, d) => (d === sourceDay ? [] : source.map((r) => ({ ...r, weekday: d }))))
    setRows([...source, ...copies])
  }

  return (
    <div className="pv-grid">
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
              {/* Index keys are safe: every cell is controlled by value, so nothing goes stale on delete. */}
              {rows.map((r, index) => (
                <tr key={index}>
                  <td>
                    <select aria-label="Ngày" value={r.weekday} onChange={(e) => set(index, { weekday: Number(e.target.value) })}>
                      {WEEKDAYS.map((label, d) => (
                        <option key={d} value={d}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  {['startMinute', 'endMinute'].map((field) => (
                    <td key={field}>
                      <select aria-label={field === 'startMinute' ? 'Từ giờ' : 'Đến giờ'} value={r[field]} onChange={(e) => set(index, { [field]: Number(e.target.value) })}>
                        {!SLOTS.includes(r[field]) && <option value={r[field]}>{minutesToTime(r[field])}</option>}
                        {SLOTS.map((m) => (
                          <option key={m} value={m}>
                            {minutesToTime(m)}
                          </option>
                        ))}
                      </select>
                    </td>
                  ))}
                  <td>
                    <input type="number" aria-label="Giá mỗi giờ" min={1} step="any" value={r.pricePerHour} onChange={(e) => set(index, { pricePerHour: e.target.value })} />
                    {Number(r.pricePerHour) > 0 && <div className="pv-muted">{formatVnd(r.pricePerHour)}</div>}
                  </td>
                  <td>
                    <button type="button" className="ui-btn ghost" onClick={() => setRows(rows.filter((_, i) => i !== index))} disabled={busy}>
                      Xóa dòng
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
        <button type="button" className="ui-btn ghost" onClick={copyToAll} disabled={busy || !rows.some((r) => r.weekday === sourceDay)}>
          Sao chép sang mọi ngày
        </button>
      </div>
    </div>
  )
}
