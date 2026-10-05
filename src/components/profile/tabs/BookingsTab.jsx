import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function BookingsTab({ active, bookings, qrBooking, onQr, onCancel, onCloseQr }) {
  const [leavingQr, setLeavingQr] = useState(null)

  const handleCancel = (qr) => {
    setLeavingQr(qr)
    window.setTimeout(() => {
      onCancel(qr)
      setLeavingQr(null)
    }, 350)
  }

  return (
    <section className={`panel${active ? ' active' : ''}`} id="panel-bookings">
      <div className="panel-head">
        <div>
          <span className="eyebrow dark">
            <i />
            Lịch của tôi
          </span>
          <h2>Lịch sử đặt sân</h2>
          <p>Theo dõi vé, mã QR và trạng thái giữ chỗ theo thời gian thực.</p>
        </div>
      </div>
      {bookings.length === 0 ? (
        <div className="empty-state show">
          <div className="eicon">📅</div>
          <h2>Bạn chưa có lịch đặt sân nào</h2>
          <p>Khám phá hàng trăm sân bóng đá, pickleball, cầu lông và tennis gần bạn, đặt sân chỉ trong 30 giây.</p>
          <Link to="/#venues" className="save-btn" style={{ textDecoration: 'none' }}>
            Tìm sân ngay
          </Link>
        </div>
      ) : (
        <div className="booking-list" id="bookingList">
          {bookings.map((booking) => (
            <article
              className={`booking-card${leavingQr === (booking.qr || booking.id) ? ' is-leaving' : ''}`}
              key={booking.qr || booking.id}
            >
              <img src={booking.image} alt={booking.alt} loading="lazy" />
              <div className="booking-body">
                <h3>{booking.title}</h3>
                <div className="booking-meta">{booking.meta}</div>
                <div className="badge-row">
                  {booking.badges.map((badge) => (
                    <span key={`${booking.qr}-${badge.label}`} className={`badge ${badge.kind}`}>
                      {badge.label}
                    </span>
                  ))}
                </div>
                <div className="booking-actions">
                  <button type="button" className="btn-qr" data-qr={booking.qr} onClick={() => onQr(booking)}>
                    Xem vé / QR
                  </button>
                  {booking.cancellable !== false && (
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => handleCancel(booking.qr || booking.id)}
                    >
                      Hủy đặt
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {qrBooking && (
        <div
          className="qr-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`Mã vé ${qrBooking.qr}`}
          onClick={onCloseQr}
        >
          <div className="qr-box" onClick={(e) => e.stopPropagation()}>
            <p className="qr-title">
              Vé {qrBooking.qr} · {qrBooking.title}
            </p>
            <div className="qr-code" aria-hidden="true" />
            <p className="booking-meta">{qrBooking.meta}</p>
            <button type="button" className="btn-qr" onClick={onCloseQr}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
