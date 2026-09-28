import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { stats, testimonials, venues } from '../../data/content'

const SPORT_ROWS = [
  { idx: '01', name: 'Bóng đá & Futsal', desc: 'Sân 5, sân 7 và mặt cỏ nhân tạo có đèn chiếu sáng.', slug: 'football' },
  { idx: '02', name: 'Pickleball & Tennis', desc: 'Sân cứng cao cấp, sân trong nhà kèm dịch vụ cho thuê dụng cụ.', slug: 'pickleball' },
  { idx: '03', name: 'Cầu lông & Bóng chuyền', desc: 'Nhà thi đấu trần cao, sàn gỗ và thảm cao su chuyên nghiệp.', slug: 'badminton' },
  { idx: '04', name: 'Bóng rổ & Squash', desc: 'Thuê nguyên sân, bảng điểm và phòng thay đồ đầy đủ.', slug: 'basketball' },
]

const TRUST_SLIDES = [
  {
    h: ['FAST', 'EASY', 'INSTANT', 'BOOKING'],
    img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80&auto=format&fit=crop',
    name: 'Goal Time Stadium',
    role: '4.9★ · Bóng đá & Pickleball',
    alt: 'Sân bóng đá Goal Time Stadium rực rỡ ánh đèn',
  },
  {
    h: ['SMART', 'LOCAL', 'EVERY', 'COURT'],
    img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80&auto=format&fit=crop',
    name: 'Apex Arena',
    role: '4.8★ · Cầu lông & Bóng rổ',
    alt: 'Sân bóng rổ và cầu lông trong nhà Apex Arena',
  },
  {
    h: ['PLAY', 'SCORE', 'WIN', 'DAILY'],
    img: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80&auto=format&fit=crop',
    name: 'Strike Court',
    role: '5.0★ · Tennis & Bóng chuyền',
    alt: 'Sân tennis cao cấp Strike Court',
  },
]

const FAC_BODY =
  'Khám phá các sân thể thao đã xác thực với đèn chiếu sáng chuyên nghiệp, tiện nghi sạch sẽ và lịch trống theo thời gian thực gần bạn.'

function StackedTitle({ lines, id }) {
  return (
    <span id={id} style={{ display: 'block' }}>
      {lines.map((ln) => (
        <span key={ln} className="lmask in">
          <span>{ln}</span>
        </span>
      ))}
    </span>
  )
}

export function TrustSection() {
  const [ti, setTi] = useState(0)
  const slide = TRUST_SLIDES[ti]
  const setTrust = useCallback((n) => {
    setTi(((n % TRUST_SLIDES.length) + TRUST_SLIDES.length) % TRUST_SLIDES.length)
  }, [])

  return (
    <section className="trust" id="trust">
      <div className="trust-top">
        <div className="pct-badge" data-inview>
          <b>99%</b>
          <span>Xác nhận tức thì &amp; Giữ chỗ đảm bảo</span>
        </div>
        <article className="badge-card" data-inview>
          <span className="idx">#01</span>
          <h3>Ứng dụng đặt sân số 1</h3>
          <p>
            Từ trận bóng cuối tuần đến giải đấu cạnh tranh, hơn 12.000 người chơi đặt sân yêu thích mỗi ngày, nhanh gọn
            không phiền phức.
          </p>
        </article>
      </div>
      <h2 id="trust-title" aria-live="polite">
        <div className="trow">
          <span className="ghost-w in">
            <span>{slide.h[0]}</span>
          </span>
          <span className="ghost-w in">
            <span>{slide.h[1]}</span>
          </span>
        </div>
        <div className="trow">
          <span className="ghost-w ink in">
            <span>{slide.h[2]}</span>
          </span>
          <span className="ghost-w in">
            <span>{slide.h[3]}</span>
          </span>
        </div>
      </h2>
      <div className="coach-wrap in">
        <div className="coach-card">
          <figure>
            <img src={slide.img} alt={slide.alt} loading="lazy" />
            <figcaption className="coach-cap">
              <b>{slide.name}</b>
              <span>{slide.role}</span>
            </figcaption>
          </figure>
        </div>
      </div>
      <div className="trust-ctrl">
        <button type="button" className="abtn outline" onClick={() => setTrust(ti - 1)} aria-label="Trước">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ transform: 'scaleX(-1)' }}>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
        <div className="dots dark" role="tablist" aria-label="Chọn sân nổi bật">
          {TRUST_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              className={i === ti ? 'on' : ''}
              aria-label={`Đến slide ${i + 1}`}
              aria-current={i === ti}
              onClick={() => setTrust(i)}
            >
              <i />
            </button>
          ))}
        </div>
        <button type="button" className="abtn solid" onClick={() => setTrust(ti + 1)} aria-label="Tiếp">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </section>
  )
}

export function SportsSection() {
  const navigate = useNavigate()
  const goSport = (slug) => navigate(`/sports-detail?sport=${slug}`)

  return (
    <section className="programs" id="sports">
      <span className="eyebrow dark">
        <i />
        Môn thể thao
      </span>
      <h2 className="stack-title">
        <StackedTitle lines={['Chọn môn', 'Yêu thích']} id="programs-title" />
      </h2>
      <ul className="prog-list">
        {SPORT_ROWS.map((row) => (
          <li key={row.idx}>
            <button
              type="button"
              className="prog-row"
              data-inview
              onClick={() => goSport(row.slug)}
              aria-label={`${row.name} — xem chi tiết`}
            >
              <div className="prog-inner">
                <span className="prog-idx">{row.idx}</span>
                <div className="prog-main">
                  <div className="prog-name">{row.name}</div>
                  <div className="prog-desc">{row.desc}</div>
                </div>
                <span className="prog-arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function VenuesSection() {
  return (
    <section className="facilities" id="venues">
      <div className="fac-grid">
        <div className="fac-intro">
          <img
            className="fac-icon"
            data-inview
            src="https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&q=80&auto=format&fit=crop"
            alt="Huy hiệu sân hiện đại — sân cỏ có đèn chiếu sáng"
            loading="lazy"
          />
          <h2 className="stack-title">
            <StackedTitle lines={['Sân nổi bật', 'Được đánh', 'Giá tốt nhất']} id="facilities-title" />
          </h2>
          <p className="fac-body in" data-inview>
            {FAC_BODY.split(' ').map((w, i) => (
              <span key={i}>
                <span className="bw" style={{ opacity: 1, transform: 'none' }}>
                  {w}
                </span>{' '}
              </span>
            ))}
          </p>
        </div>
        <div className="court-row">
          {venues.map((venue, i) => (
            <figure key={venue.name} className={`court${i === 1 ? ' offset' : ''}`} data-inview>
              <img src={venue.image} alt={venue.alt} loading="lazy" />
              <figcaption className={i === 1 ? 'cap-blue' : 'cap-clay'}>
                <b>{venue.name}</b>
                <span>{venue.detail}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

export function StatsSection() {
  return (
    <section className="stats" id="owners">
      <span className="eyebrow light">
        <i />
        Số liệu nổi bật
      </span>
      <h2 className="stack-title">
        <StackedTitle lines={['Con số', 'Tạo niềm tin']} id="stats-title" />
      </h2>
      <dl className="stat-grid">
        {stats.map(([value, label]) => (
          <div key={label} className="stat" data-inview>
            <dt className="sr-only">{label}</dt>
            <dd>
              <b>{value}</b>
              <span>{label}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function TestimonialsSection() {
  return (
    <section className="testi" id="testimonials">
      <span className="eyebrow dark">
        <i />
        Đánh giá người chơi
      </span>
      <h2 className="stack-title">
        <StackedTitle lines={['Được yêu mến', 'Bởi cộng đồng']} id="testimonials-title" />
      </h2>
      <ul className="testi-grid">
        {testimonials.map(([quote, name, role]) => (
          <li key={name}>
            <figure className="tcard" data-inview>
              <div>
                <div className="q">“</div>
                <blockquote>{quote}</blockquote>
              </div>
              <figcaption>
                <b>{name}</b>
                <span>{role}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}
