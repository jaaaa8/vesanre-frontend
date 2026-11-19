import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApi } from '../../../hooks/useApi'
import { cancelBooking, getBooking, listBookings } from '../../../utils/api'
import { getSession, hasRole } from '../../../utils/auth'
import { BOOKING_FILTERS } from '../../../utils/bookingRules'
import StatusTabs from '../../admin/StatusTabs'
import BookingCard from '../../booking/BookingCard'
import BookingDetailView from '../../booking/BookingDetailView'
import AsyncView from '../../common/AsyncView'
import ConfirmDialog from '../../common/ConfirmDialog'
import EmptyState from '../../common/EmptyState'
import Pagination from '../../common/Pagination'

const idle = () => Promise.resolve(null)

export default function BookingsTab({ active, onToast, openBookingId, onOpenHandled }) {
  const navigate = useNavigate()
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const [detail, setDetail] = useState(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const list = useApi(active ? () => listBookings({ status, page, size: 10 }) : idle, [active, status, page])

  const open = (id) =>
    getBooking(id).then(setDetail, (e) => {
      // A provider following a notification about a customer's booking lands on the shop view instead.
      if (e.status === 404 && hasRole(getSession(), 'PROVIDER')) navigate(`/provider/bookings/${id}`)
      else onToast('Không mở được booking này')
    })

  useEffect(() => {
    if (!openBookingId) return
    open(openBookingId)
    onOpenHandled()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openBookingId])

  const cancel = async (reason) => {
    setBusy(true)
    try {
      const result = await cancelBooking(detail.id, reason)
      setDetail(result)
      list.reload()
      onToast(`Đã hủy, ${result.depositCoins} coin đã về ví`)
    } catch (e) {
      onToast(e.message)
      open(detail.id)
    } finally {
      setBusy(false)
      setCancelOpen(false)
    }
  }

  const filter = (next) => {
    setStatus(next)
    setPage(0)
  }

  return (
    <section className={`panel${active ? ' active' : ''}`} id="panel-bookings">
      <div className="panel-head">
        <div>
          <span className="eyebrow dark">
            <i />
            Lịch của tôi
          </span>
          <h2>Lịch đặt sân</h2>
          <p>Xem lại các lần đặt sân, chi tiết giá và hủy khi chưa tới giờ chơi.</p>
        </div>
      </div>
      {detail ? (
        <>
          <button type="button" className="ui-btn ghost" onClick={() => setDetail(null)}>
            ← Quay lại
          </button>
          <BookingDetailView booking={detail} onCancel={() => setCancelOpen(true)} />
          <ConfirmDialog
            open={cancelOpen}
            title={`Hủy ${detail.bookingCode}?`}
            message={`Bạn sẽ được trả lại ${detail.depositCoins} coin`}
            reasonOptional
            maxLength={500}
            confirmText="Hủy đặt"
            busy={busy}
            onCancel={() => setCancelOpen(false)}
            onConfirm={cancel}
          />
        </>
      ) : (
        <>
          <StatusTabs options={BOOKING_FILTERS} value={status} onChange={filter} />
          <AsyncView state={list}>
            {list.data &&
              (list.data.items.length === 0 ? (
                <EmptyState text="Chưa có lịch đặt nào">
                  <Link to="/san" className="ui-btn primary">
                    Tìm sân
                  </Link>
                </EmptyState>
              ) : (
                <>
                  <ul className="bk-list">
                    {list.data.items.map((b) => (
                      <li key={b.id}>
                        <BookingCard booking={b} onOpen={open} />
                      </li>
                    ))}
                  </ul>
                  <Pagination page={list.data.page} totalPages={list.data.totalPages} onChange={setPage} />
                </>
              ))}
          </AsyncView>
        </>
      )}
    </section>
  )
}
