import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { HERO_IMG } from './profileUtils'

export default function ProfileHero({
  displayName,
  initials,
  bookingCount,
  profileOpen,
  onToggleProfile,
  onBookings,
  onLogout,
  onOpenMenu,
}) {
  const bgRef = useRef(null)

  // Parallax on own bg node — no getElementById, no cross-component queries.
  useEffect(() => {
    const node = bgRef.current
    if (!node) return undefined
    const onScroll = () => {
      const y = Math.min(1, window.scrollY / (window.innerHeight || 800))
      node.style.transform = `translateY(${(y * 12).toFixed(2)}%)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="hero profile-hero" id="top">
      <div className="hero-bg">
        <div className="hero-bg-inner" ref={bgRef}>
          <img src={HERO_IMG} alt="Sân vận động SportHub về đêm" fetchPriority="high" />
          <div className="hero-shade" />
        </div>
      </div>
      <header className="site-header">
        <nav className="nav-left">
          <Link to="/#venues">Sân &amp; Địa điểm</Link>
          <Link to="/#sports">Môn thể thao &amp; Giá</Link>
          <Link to="/#owners">Dành cho chủ sân</Link>
          <Link to="/#testimonials">Đánh giá</Link>
        </nav>
        <Link className="brand-center" to="/" aria-label="SportHub Trang chủ">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v18M3 12h18" />
            <circle cx="12" cy="12" r="2.2" />
          </svg>
          <span>SportHub</span>
        </Link>
        <div className="head-right">
          <Link className="book-visit-link" to="/#venues">
            Tìm sân
          </Link>
          <span id="profileArea" className={`profile${profileOpen ? ' open' : ''}`}>
            <button
              className="capsule"
              id="capsuleBtn"
              type="button"
              aria-haspopup="true"
              aria-expanded={profileOpen ? 'true' : 'false'}
              onClick={(e) => {
                e.stopPropagation()
                onToggleProfile()
              }}
            >
              <span className="avatar" id="avatarTx">
                {initials}
              </span>
              <span id="userName">{displayName}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <span className="dropdown" id="profileMenu">
              <Link to="/">⌂ Trang chủ</Link>
              <button type="button" data-act="bookings" onClick={onBookings}>
                ◷ Sân đã đặt
              </button>
              <button type="button" data-act="logout" className="danger" onClick={onLogout}>
                ↩ Đăng xuất
              </button>
            </span>
          </span>
          <button className="burger" id="burger" type="button" aria-label="Mở menu" onClick={onOpenMenu}>
            <span>
              <i />
              <i />
            </span>
          </button>
        </div>
      </header>
      <div className="profile-hero-title">
        <div>
          <div className="profile-crumb">
            <Link to="/">Trang chủ</Link>
            <span>·</span>
            <span>Hồ sơ cá nhân</span>
          </div>
          <h1>
            Hồ sơ
            <br />
            của tôi
          </h1>
          <p className="profile-sub">
            Quản lý thông tin cá nhân, lịch đặt sân và phương thức thanh toán — mọi thứ đồng bộ tức thì với SportHub.
          </p>
        </div>
        <div className="profile-glass-stat">
          <div className="glass">
            <div style={{ fontSize: '1.6rem' }}>🏅</div>
            <div>
              <b>Silver</b>
              <span>Hạng thành viên</span>
            </div>
          </div>
          <div className="glass">
            <div style={{ fontSize: '1.6rem' }}>⚡</div>
            <div>
              <b id="statBookings">{bookingCount}</b>
              <span>Lượt đặt sân</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
