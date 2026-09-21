import { ArrowRight, CheckCircle } from '@phosphor-icons/react'
import { sports, stats, testimonials, venues } from '../../data/content'

export function TrustSection() {
  return (
    <section className="trust-section section-shell">
      <div className="trust-facts">
        <div className="trust-score"><strong>99%</strong><span>Xác nhận tức thì và giữ chỗ đảm bảo</span></div>
        <div className="trust-note"><CheckCircle size={28} weight="fill" /><div><h2>Đặt sân không còn phiền phức</h2><p>Kiểm tra lịch trống, giá thuê và xác nhận trong một luồng rõ ràng.</p></div></div>
      </div>
      <div className="featured-venue">
        <div><span>Sân nổi bật</span><h2>Tìm đúng sân.<br />Vào đúng trận.</h2><p>Hơn 50 địa điểm được xác thực với lịch trống cập nhật liên tục.</p><a href="#venues">Khám phá địa điểm <ArrowRight size={18} /></a></div>
        <figure><img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1100&q=85&auto=format&fit=crop" alt="Sân bóng đá Goal Time Stadium" loading="lazy" /><figcaption><strong>Goal Time Stadium</strong><span>4,9/5 - Bóng đá và Pickleball</span></figcaption></figure>
      </div>
    </section>
  )
}

export function SportsSection() {
  return (
    <section className="sports-section" id="sports">
      <div className="section-heading"><span>Môn thể thao</span><h2>Mọi trận đấu.<br />Một nơi để đặt.</h2></div>
      <div className="sports-list">{sports.map(([name, description], index) => <a href="#venues" key={name}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{name}</h3><p>{description}</p></div><ArrowRight size={28} /></a>)}</div>
    </section>
  )
}

export function VenuesSection() {
  return (
    <section className="venues-section section-shell" id="venues">
      <div className="venue-intro"><span>Địa điểm đã xác thực</span><h2>Chất lượng bạn có thể nhìn thấy.</h2><p>Sân có đèn chiếu sáng tốt, tiện nghi sạch sẽ và lịch trống theo thời gian thực.</p></div>
      <div className="venue-grid">{venues.map((venue) => <figure key={venue.name}><img src={venue.image} alt={venue.alt} loading="lazy" /><figcaption><strong>{venue.name}</strong><span>{venue.detail}</span></figcaption></figure>)}</div>
    </section>
  )
}

export function StatsSection() {
  return (
    <section className="stats-section" id="owners">
      <div className="section-heading light"><span>Dành cho người chơi và chủ sân</span><h2>Một cộng đồng<br />đang lớn lên mỗi ngày.</h2></div>
      <dl className="stats-grid">{stats.map(([value, label]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    </section>
  )
}

export function TestimonialsSection() {
  return (
    <section className="testimonials-section section-shell" id="testimonials">
      <div className="section-heading"><span>Đánh giá người chơi</span><h2>Được tin dùng<br />sau mỗi trận đấu.</h2></div>
      <div className="testimonial-grid">{testimonials.map(([quote, name, role]) => <figure key={name}><blockquote>“{quote}”</blockquote><figcaption><strong>{name}</strong><span>{role}</span></figcaption></figure>)}</div>
    </section>
  )
}
