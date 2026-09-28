import { Link, useSearchParams } from 'react-router-dom'

const DETAILS = {
  football: {
    title: 'Bóng đá & Futsal',
    desc: 'Sân 5, sân 7 và mặt cỏ nhân tạo có đèn chiếu sáng. Đặt theo giờ, giữ chỗ tức thì, có trọng tài và cho thuê bóng.',
  },
  pickleball: {
    title: 'Pickleball & Tennis',
    desc: 'Sân cứng cao cấp, sân trong nhà kèm dịch vụ cho thuê vợt, bóng và huấn luyện viên theo buổi.',
  },
  badminton: {
    title: 'Cầu lông & Bóng chuyền',
    desc: 'Nhà thi đấu trần cao, sàn gỗ và thảm cao su chuyên nghiệp. Lịch trống theo thời gian thực.',
  },
  basketball: {
    title: 'Bóng rổ & Squash',
    desc: 'Thuê nguyên sân, bảng điểm điện tử và phòng thay đồ đầy đủ. Phù hợp cả latihan đội và giải phong trào.',
  },
}

export default function SportsDetailPage() {
  const [params] = useSearchParams()
  const sport = params.get('sport') || 'football'
  const detail = DETAILS[sport] || DETAILS.football

  return (
    <main>
      <section className="sports-detail">
        <div className="sports-detail-card">
          <span className="eyebrow dark">
            <i />
            Chi tiết môn thể thao
          </span>
          <h1>{detail.title}</h1>
          <p>{detail.desc}</p>
          <p>
            Mã môn: <strong>{sport}</strong> · Giá từ 120.000đ/giờ · Xác nhận tức thì qua SMS.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <Link className="pill-btn solidbg" to="/">
              ← Về trang chủ
            </Link>
            <a className="pill-btn light" href="#venues" onClick={(e) => { e.preventDefault(); window.location.href = '/#venues' }}>
              Tìm sân {detail.title} →
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
