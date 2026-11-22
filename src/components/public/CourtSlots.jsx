import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useApi } from '../../hooks/useApi'
import { createBooking, getCourtAvailability, getWallet } from '../../utils/api'
import { getSession, hasRole } from '../../utils/auth'
import { DEPOSIT_PERCENT, rangeInfo, selectRange } from '../../utils/bookingRules'
import { formatDayDate, formatVnd } from '../../utils/format'
import { slotErrorText } from '../../utils/publicRules'
import AsyncView from '../common/AsyncView'
import ConfirmDialog from '../common/ConfirmDialog'

const topUpLink = <Link to="/tai-khoan#wallet">Nạp coin</Link>
const hhmm = (t) => t.slice(0, 5)

export default function CourtSlots({ court, date }) {
  const { id: venueId } = useParams()
  const availability = useApi(() => getCourtAvailability(court.id, date), [court.id, date])
  const data = availability.data
  const deadEnd = slotErrorText(availability.error?.status)
  // Selection remembers its date, so changing the date drops it without an effect.
  const [picked, setPicked] = useState(null)
  const selection = data && picked?.date === date ? picked.range : null
  const info = data && rangeInfo(data.slots, selection, data)
  const [confirm, setConfirm] = useState(null)
  const [busy, setBusy] = useState(false)
  const session = getSession()
  const loggedIn = !!session
  // Booking endpoints require CUSTOMER; a provider-only or admin-only account would get 403.
  const canBook = hasRole(session, 'CUSTOMER')

  const pick = (index) => setPicked({ date, range: selectRange(data.slots, selection, index, data.maxBookingMinutes) })

  const openConfirm = async () => {
    setBusy(true)
    try {
      const wallet = await getWallet()
      setConfirm({ info, balance: wallet.balance })
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
  }

  const book = async () => {
    const chosen = confirm.info
    setBusy(true)
    try {
      const booking = await createBooking({ courtId: court.id, date, startTime: chosen.startTime, endTime: chosen.endTime })
      toast.success(
        <span>
          Đã đặt {booking.bookingCode}. <Link to="/tai-khoan#bookings">Xem lịch đặt</Link>
        </span>,
      )
    } catch (e) {
      toast.error(
        <span>
          {e.message}
          {e.detail === 'Insufficient coins' && <> · {topUpLink}</>}
        </span>,
      )
    } finally {
      setBusy(false)
      setConfirm(null)
      setPicked(null)
      availability.reload()
    }
  }

  const short = !!confirm && confirm.balance < confirm.info.depositCoins

  return (
    <div className="pub-slots">
      {deadEnd ? (
        <p className="ui-muted" role="alert">{deadEnd}</p>
      ) : (
        <AsyncView state={availability}>
          <div aria-busy={availability.loading} className={availability.loading ? 'pub-reloading' : undefined}>
            {data?.closed ? (
              <p className="ui-muted">Sân nghỉ ngày này</p>
            ) : data?.slots.length === 0 ? (
              <p className="ui-muted">Không có khung giờ nào</p>
            ) : (
              <ul className="pub-slot-grid">
                {data?.slots.map((s, i) => (
                  <li key={s.start}>
                    <button
                      type="button"
                      disabled={!s.available}
                      aria-pressed={!!selection && i >= selection.from && i <= selection.to}
                      onClick={() => pick(i)}
                    >
                      <strong>{`${hhmm(s.start)}–${hhmm(s.end)}`}</strong>
                      <span>{formatVnd(s.price)}</span>
                      {!s.available && <small>Đã kín</small>}
                    </button>
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
      )}
      <div className="pub-bar">
        {info && (
          <div className="pub-summary" aria-live="polite">
            <span>
              Đã chọn {hhmm(info.startTime)}–{hhmm(info.endTime)} · {info.minutes} phút
            </span>
            {info.error ? (
              <span className="err">{info.error}</span>
            ) : (
              <span>
                Tổng {formatVnd(info.subtotal)} · Cọc ước tính {info.depositCoins} coin ({DEPOSIT_PERCENT}%), trả phần còn lại tại sân
              </span>
            )}
          </div>
        )}
        <div className="pub-book">
          {loggedIn && !canBook ? (
            <span className="ui-muted">Tài khoản này không đặt sân được, hãy dùng tài khoản khách hàng.</span>
          ) : loggedIn ? (
            <button type="button" className="ui-btn primary" disabled={!info || !!info.error || busy} onClick={openConfirm}>
              Đặt sân
            </button>
          ) : (
            <Link className="ui-btn primary" to={`/dang-nhap?next=/san/${venueId}`}>
              Đăng nhập để đặt
            </Link>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={!!confirm}
        title="Xác nhận đặt sân"
        confirmText="Đặt sân"
        busy={busy}
        confirmDisabled={short}
        onCancel={() => setConfirm(null)}
        onConfirm={book}
        message={
          confirm && (
            <>
              <p>
                {court.name} · {formatDayDate(date)} · {hhmm(confirm.info.startTime)}–{hhmm(confirm.info.endTime)}
              </p>
              <p>
                Tổng {formatVnd(confirm.info.subtotal)} · Cọc ước tính {confirm.info.depositCoins} coin
              </p>
              <p>Số dư hiện tại: {confirm.balance} coin</p>
              {short && <p className="pub-short">Số dư không đủ để đặt cọc. {topUpLink}</p>}
            </>
          )
        }
      />
    </div>
  )
}
