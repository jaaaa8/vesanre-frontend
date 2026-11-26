import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useApi } from '../../hooks/useApi'
import { createBooking, getVenueAvailability, getWallet } from '../../utils/api'
import { getSession, hasRole } from '../../utils/auth'
import { endOptions, estimateDeposit } from '../../utils/bookingRules'
import { formatDayDate, formatVnd } from '../../utils/format'
import { slotErrorText } from '../../utils/publicRules'
import AsyncView from '../common/AsyncView'
import ConfirmDialog from '../common/ConfirmDialog'

const topUpLink = <Link to="/tai-khoan#wallet">Nạp coin</Link>
const hhmm = (t) => t.slice(0, 5)

export default function VenueSlots({ venue, date }) {
  const availability = useApi(() => getVenueAvailability(venue.id, date), [venue.id, date])
  const data = availability.data
  const deadEnd = slotErrorText(availability.error?.status)
  // Selection remembers its date, so changing the date drops it without an effect.
  const [picked, setPicked] = useState(null)
  const selection = data && picked?.date === date ? picked : null
  const ends = selection ? endOptions(data.slots, selection.start) : []
  const end = selection?.end != null ? ends[selection.end] : null
  const percent = data?.depositPercent ?? venue.depositPercent
  const info = end && {
    startTime: data.slots[selection.start].start,
    endTime: end.endTime,
    minutes: end.minutes,
    subtotal: end.subtotal,
    depositCoins: estimateDeposit(end.subtotal, percent),
  }
  const error = info && percent > 0 && info.depositCoins === 0 ? 'Khoảng giờ quá ngắn để đặt cọc' : null
  const [confirm, setConfirm] = useState(null)
  const [busy, setBusy] = useState(false)
  const session = getSession()
  const loggedIn = !!session
  // Booking endpoints require CUSTOMER; a provider-only or admin-only account would get 403.
  const canBook = hasRole(session, 'CUSTOMER')

  const openConfirm = async () => {
    // No deposit: the wallet is never read.
    if (percent === 0) return setConfirm({ info, balance: null })
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
      const booking = await createBooking({ venueId: venue.id, date, startTime: chosen.startTime, endTime: chosen.endTime })
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

  const short = !!confirm && confirm.balance != null && confirm.balance < confirm.info.depositCoins
  const courtCount = data?.courtCount ?? venue.courtCount
  const depositText = (i) =>
    percent === 0 ? 'Không cần đặt cọc · trả tại sân' : `Cọc ước tính ${i.depositCoins} coin (${percent}%), trả phần còn lại tại sân`

  return (
    <div className="pub-slots">
      <p className="pub-slot-head">{[formatDayDate(date), venue.sport, `${courtCount} sân`].filter(Boolean).join(' · ')}</p>
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
              <>
                <p className="pub-slot-step">Chọn giờ bắt đầu</p>
                <ul className="pub-slot-grid">
                  {data?.slots.map((s, i) => (
                    <li key={s.start}>
                      <button
                        type="button"
                        disabled={s.freeCourts === 0}
                        aria-pressed={selection?.start === i}
                        onClick={() => setPicked({ date, start: i, end: null })}
                      >
                        <strong>{hhmm(s.start)}</strong>
                        <span>{formatVnd(s.price)}</span>
                        {s.freeCourts === 0 ? <small>hết</small> : s.freeCourts < data.courtCount && <small>còn {s.freeCourts}</small>}
                      </button>
                    </li>
                  ))}
                </ul>
                {selection && (
                  <>
                    <p className="pub-slot-step">Chọn giờ kết thúc</p>
                    <ul className="pub-slot-grid">
                      {ends.map((o, k) => (
                        <li key={o.endTime}>
                          <button type="button" aria-pressed={selection.end === k} onClick={() => setPicked({ ...selection, end: k })}>
                            <strong>{hhmm(o.endTime)}</strong>
                            <span>{formatVnd(o.subtotal)}</span>
                            <small>{o.minutes / 60} tiếng</small>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
            <p className="pub-slot-note">Đặt theo giờ tròn · từ 1 đến 2 tiếng</p>
          </div>
        </AsyncView>
      )}
      <div className="pub-bar">
        {info && (
          <div className="pub-summary" aria-live="polite">
            <span>
              Đã chọn {hhmm(info.startTime)}–{hhmm(info.endTime)} · {info.minutes / 60} tiếng
            </span>
            {error ? (
              <span className="err">{error}</span>
            ) : (
              <span>
                Tổng {formatVnd(info.subtotal)} · {depositText(info)}
              </span>
            )}
          </div>
        )}
        <div className="pub-book">
          {loggedIn && !canBook ? (
            <span className="ui-muted">Tài khoản này không đặt sân được, hãy dùng tài khoản khách hàng.</span>
          ) : loggedIn ? (
            <button type="button" className="ui-btn primary" disabled={!info || !!error || busy} onClick={openConfirm}>
              Đặt sân
            </button>
          ) : (
            <Link className="ui-btn primary" to={`/dang-nhap?next=/san/${venue.id}`}>
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
                {venue.name} · {formatDayDate(date)} · {hhmm(confirm.info.startTime)}–{hhmm(confirm.info.endTime)}
              </p>
              <p>
                Tổng {formatVnd(confirm.info.subtotal)} ·{' '}
                {percent === 0 ? 'Không cần đặt cọc · trả tại sân' : `Cọc ước tính ${confirm.info.depositCoins} coin`}
              </p>
              {confirm.balance != null && <p>Số dư hiện tại: {confirm.balance} coin</p>}
              {short && <p className="pub-short">Số dư không đủ để đặt cọc. {topUpLink}</p>}
            </>
          )
        }
      />
    </div>
  )
}
