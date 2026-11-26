import { minutesToTime, WEEKDAYS } from '../../utils/format'

// Whole hours only (backend rejects 06:30); a booking slot is one hour.
const HOURS = Array.from({ length: 24 }, (_, h) => minutesToTime(h * 60))
const hhmm = (t, fallback) => t?.slice(0, 5) || fallback

// value: 7 OperatingHourRequest items. Reopening a closed day restores 06:00–22:00.
export default function OperatingHoursTab({ value, onChange, busy }) {
  const set = (weekday, patch) =>
    onChange(
      value.map((d) => {
        if (d.weekday !== weekday) return d
        const next = { ...d, ...patch }
        return next.closed
          ? { weekday, closed: true, opensAt: null, closesAt: null }
          : { weekday, closed: false, opensAt: `${hhmm(next.opensAt, '06:00')}:00`, closesAt: `${hhmm(next.closesAt, '22:00')}:00` }
      }),
    )
  const copyMonday = () => onChange(value.map((d) => ({ ...value[0], weekday: d.weekday })))

  const select = (d, field) => {
    const current = hhmm(d[field], '')
    return (
      <select
        aria-label={`${field === 'opensAt' ? 'Mở cửa' : 'Đóng cửa'} ${WEEKDAYS[d.weekday]}`}
        value={current}
        disabled={d.closed || busy}
        onChange={(e) => set(d.weekday, { [field]: e.target.value })}
      >
        {/* A closed day, or a stored non-whole hour, still needs an option to show. */}
        {!HOURS.includes(current) && <option value={current}>{current || '—'}</option>}
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
    )
  }

  return (
    <div className="pv-grid">
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
            {value.map((d) => (
              <tr key={d.weekday}>
                <td>{WEEKDAYS[d.weekday]}</td>
                <td>
                  <input type="checkbox" aria-label={`Nghỉ ${WEEKDAYS[d.weekday]}`} checked={d.closed} disabled={busy} onChange={(e) => set(d.weekday, { closed: e.target.checked })} />
                </td>
                <td>{select(d, 'opensAt')}</td>
                <td>{select(d, 'closesAt')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ui-actions">
        <button type="button" className="ui-btn ghost" onClick={copyMonday} disabled={busy}>
          Áp dụng dòng Thứ 2 cho cả tuần
        </button>
      </div>
    </div>
  )
}
