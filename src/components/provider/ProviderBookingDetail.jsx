import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useApi } from '../../hooks/useApi'
import { cancelProviderBooking, getProviderBooking } from '../../utils/api'
import BookingDetailView from '../booking/BookingDetailView'
import AsyncView from '../common/AsyncView'
import ConfirmDialog from '../common/ConfirmDialog'

export default function ProviderBookingDetail({ onLogout }) {
  const { id } = useParams()
  const booking = useApi(() => getProviderBooking(id), [id])
  const [cancelOpen, setCancelOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const b = booking.data

  const cancel = async (reason) => {
    setBusy(true)
    try {
      booking.setData(await cancelProviderBooking(id, reason))
      toast.success(`Đã hủy, khách được trả lại ${b.depositCoins} coin`)
    } catch (e) {
      toast.error(e.message)
      booking.reload()
    } finally {
      setBusy(false)
      setCancelOpen(false)
    }
  }

  return (
    <section className="pv-card">
      <Link to="/provider/bookings" className="pv-back">
        ← Lịch đặt
      </Link>
      <AsyncView state={booking} onLogout={onLogout}>
        {b && (
          <>
            <BookingDetailView booking={b} showCustomer onCancel={() => setCancelOpen(true)} />
            <ConfirmDialog
              open={cancelOpen}
              title={`Hủy ${b.bookingCode}?`}
              message={`Khách sẽ được trả lại ${b.depositCoins} coin`}
              requireReason
              maxLength={500}
              confirmText="Hủy đặt"
              busy={busy}
              onCancel={() => setCancelOpen(false)}
              onConfirm={cancel}
            />
          </>
        )}
      </AsyncView>
    </section>
  )
}
