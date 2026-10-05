import { Link } from 'react-router-dom'
import { scrollToSection } from '../utils/scroll'

export default function Footer() {
  const scrollToVenues = () => scrollToSection('venues')

  return (
    <footer className="footer" id="contact">
      <div className="cta-band">
        <div>
          <span className="eyebrow light">
            <i />
            Bắt đầu ngay
          </span>
          <p className="cta-title">
            <span className="lmask in">
              <span>Sẵn sàng</span>
            </span>
            <span className="lmask in">
              <span>Chơi ngay?</span>
            </span>
          </p>
        </div>
        <button type="button" className="pill-btn light" data-inview onClick={scrollToVenues}>
          Tìm sân gần bạn ↗{' '}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
      <div className="foot-cols">
        <div className="foot-brand">
          <div className="bc">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3v18M3 12h18" />
              <circle cx="12" cy="12" r="2.2" />
            </svg>
            <span>SportHub</span>
          </div>
          <p className="foot-blurb">
            SportHub là nền tảng đặt sân tất cả trong một cho vận động viên, người chơi phong trào và chủ sân kết nối,
            thi đấu.
          </p>
          <address>
            <a href="mailto:support@sporthub.vn">support@sporthub.vn</a>
            <a href="tel:+842873008888">+84 (028) 7300 8888</a>
            <span className="mut">Đà Nẵng &amp; TP. Hồ Chí Minh, Việt Nam</span>
          </address>
        </div>
        <nav className="fnav" aria-label="Môn thể thao">
          <h4>Môn thể thao</h4>
          <ul>
            <li><a href="#sports">Bóng đá</a></li>
            <li><a href="#sports">Pickleball</a></li>
            <li><a href="#sports">Tennis</a></li>
            <li><a href="#sports">Cầu lông</a></li>
            <li><a href="#sports">Bóng rổ</a></li>
          </ul>
        </nav>
        <nav className="fnav" aria-label="Nền tảng">
          <h4>Nền tảng</h4>
          <ul>
            <li><a href="#venues">Tìm sân</a></li>
            <li><a href="#sports">Bảng giá</a></li>
            <li><a href="#owners">Cổng chủ sân</a></li>
            <li><a href="#contact">Ứng dụng di động</a></li>
          </ul>
        </nav>
        <nav className="fnav" aria-label="Công ty">
          <h4>Công ty</h4>
          <ul>
            <li><a href="#trust">Về chúng tôi</a></li>
            <li><a href="#owners">Hợp tác cùng SportHub</a></li>
            <li><a href="#contact">Tuyển dụng</a></li>
            <li><a href="#contact">Liên hệ</a></li>
          </ul>
        </nav>
      </div>
      <div className="foot-bottom">
        <span>© 2026 SportHub. Bảo lưu mọi quyền.</span>
        <nav>
          <a href="#instagram">Instagram</a>
          <a href="#x">X</a>
          <a href="#youtube">YouTube</a>
          <a href="#linkedin">LinkedIn</a>
        </nav>
        <nav>
          <Link to="/login">Đăng nhập</Link>
          <Link to="/register">Đăng ký</Link>
        </nav>
      </div>
    </footer>
  )
}
