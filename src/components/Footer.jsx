import { ArrowUpRight } from '@phosphor-icons/react'
import Brand from './Brand'

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-cta">
        <div><span>Bắt đầu ngay</span><h2>Trận đấu tiếp theo bắt đầu từ đây.</h2></div>
        <a className="button button-light" href="#top">Tìm sân gần bạn <ArrowUpRight size={18} /></a>
      </div>
      <div className="footer-grid">
        <div className="footer-brand">
          <Brand light />
          <p>Nền tảng giúp người chơi và chủ sân kết nối, đặt lịch và thi đấu dễ dàng.</p>
          <a href="mailto:support@sporthub.vn">support@sporthub.vn</a>
          <a href="tel:+842873008888">+84 (028) 7300 8888</a>
        </div>
        <FooterLinks title="Môn thể thao" links={['Bóng đá', 'Pickleball', 'Tennis', 'Cầu lông', 'Bóng rổ']} href="#sports" />
        <FooterLinks title="Nền tảng" links={['Tìm sân', 'Bảng giá', 'Cổng chủ sân', 'Ứng dụng di động']} href="#venues" />
        <FooterLinks title="Công ty" links={['Về chúng tôi', 'Hợp tác', 'Tuyển dụng', 'Liên hệ']} href="#contact" />
      </div>
      <div className="footer-bottom"><span>© 2026 SportHub. Bảo lưu mọi quyền.</span><span>Quyền riêng tư · Điều khoản</span></div>
    </footer>
  )
}

function FooterLinks({ title, links, href }) {
  return <nav className="footer-links" aria-label={title}><h3>{title}</h3>{links.map((link) => <a key={link} href={href}>{link}</a>)}</nav>
}
