import { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { getCourtAvailability } from '../../utils/api'
import { formatVnd } from '../../utils/format'
import { addDays, clampDate, todayIn } from '../../utils/publicRules'
import AsyncView from '../common/AsyncView'

export default function CourtSlots({ court }) {
  // Recomputed each render so a page left open past midnight never asks for a past date.
  const today = todayIn()
  const [raw, setRaw] = useState(today)
  const date = clampDate(raw, today)
  const availability = useApi(() => getCourtAvailability(court.id, date), [court.id, date])
  const data = availability.data

  return (
    <div className="pub-slots">
      <label className="ui-field pub-date">
        <span>Ngày</span>
        {/* No clamping in onChange: Chrome fires it while each date segment is still being typed. */}
        <input type="date" min={today} max={addDays(today, 30)} value={raw} onChange={(e) => setRaw(e.target.value)} onBlur={() => setRaw(date)} />
      </label>
      <AsyncView state={availability}>
        <div aria-busy={availability.loading} className={availability.loading ? 'pub-reloading' : undefined}>
          {data?.closed ? (
            <p className="ui-muted">Sân nghỉ ngày này</p>
          ) : data?.slots.length === 0 ? (
            <p className="ui-muted">Không có khung giờ nào</p>
          ) : (
            <ul className="pub-slot-grid">
              {data?.slots.map((s) => (
                <li key={s.start} className={s.available ? undefined : 'off'}>
                  <strong>{`${s.start.slice(0, 5)}–${s.end.slice(0, 5)}`}</strong>
                  <span>{formatVnd(s.price)}</span>
                  {!s.available && <small>Đã kín</small>}
                </li>
              ))}
            </ul>
          )}
          {data && (
            <p className="pub-slot-note">
              Mỗi khung {data.bookingStepMinutes} phút · đặt từ {data.minBookingMinutes} đến {data.maxBookingMinutes} phút
            </p>
          )}
        </div>
      </AsyncView>
      <div className="pub-book">
        <button type="button" className="ui-btn primary" disabled>
          Đặt sân
        </button>
        <span>Sắp ra mắt</span>
      </div>
    </div>
  )
}
