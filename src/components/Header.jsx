import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

const links = [
  ['#venues', 'Sân & Địa điểm'],
  ['#sports', 'Môn thể thao & Giá'],
  ['#owners', 'Dành cho chủ sân'],
  ['#testimonials', 'Đánh giá'],
]

const menuLinks = [
  ['#venues', 'Địa điểm'],
  ['#sports', 'Môn thể thao'],
  ['#owners', 'Chủ sân'],
  ['#testimonials', 'Đánh giá'],
  ['#contact', 'Liên hệ'],
]

function initials(name) {
  const parts = (name || '').trim().split(/\s+/)
  if (!parts[0]) return 'A'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function displayNameOf(user) {
  if (!user) return ''
  return user.displayName || user.name || user.email || 'Người chơi'
}

export default function Header({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const name = displayNameOf(user)

  useEffect(() => {
    if (!profileOpen) return
    const close = (e) => {
      if (!e.target.closest?.('.profile')) setProfileOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setProfileOpen(false)
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [profileOpen])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const logout = async () => {
    await onLogout()
    setProfileOpen(false)
    setMenuOpen(false)
    toast.success('Đã đăng xuất thành công')
  }

  const scrollToVenues = () => {
    document.querySelector('#venues')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <header className="site-header">
        <nav className="nav-left" aria-label="Điều hướng chính">
          {links.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <div className="brand-center" aria-label="SportHub">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v18M3 12h18" />
            <circle cx="12" cy="12" r="2.2" />
          </svg>
          <span>SportHub</span>
        </div>
        <div className="head-right">
          <button type="button" className="book-visit-link" onClick={scrollToVenues}>
            Tìm sân
          </button>
          {user ? (
            <span className={`profile${profileOpen ? ' open' : ''}`}>
              <button
                type="button"
                className="capsule"
                aria-haspopup="true"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((v) => !v)}
              >
                <span className="avatar">{initials(name)}</span>
                <span>{name}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <span className="dropdown" role="menu">
                <Link to="/profile" onClick={() => setProfileOpen(false)}>
                  ○ Thông tin cá nhân
                </Link>
                <button type="button" className="danger" onClick={logout}>
                  ↩ Đăng xuất
                </button>
              </span>
            </span>
          ) : (
            <span>
              <Link className="auth-login" to="/login">
                Đăng nhập
              </Link>{' '}
              <Link className="btn-register" to="/register">
                Đăng ký
              </Link>
            </span>
          )}
          <button type="button" className="burger" onClick={() => setMenuOpen(true)} aria-label="Mở menu">
            <span>
              <i />
              <i />
            </span>
          </button>
        </div>
      </header>

      <div id="menuWrap" className={menuOpen ? 'open' : ''} aria-hidden={!menuOpen}>
        <div className="menu-bg" onClick={() => setMenuOpen(false)} />
        <div className="menu-panel">
          <div className="menu-inner">
            <div className="menu-top">
              <div className="bc">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3v18M3 12h18" />
                  <circle cx="12" cy="12" r="2.2" />
                </svg>
                <span>SportHub</span>
              </div>
              <button type="button" className="menu-x" onClick={() => setMenuOpen(false)} aria-label="Đóng menu">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <nav className="menu-nav">
              {menuLinks.map(([href, label], i) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  style={menuOpen ? { transitionDelay: `${120 + i * 70}ms` } : undefined}
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="menu-auth">
              {user ? (
                <>
                  <span className="menu-user">
                    Xin chào, <b>{name}</b>
                  </span>
                  <div className="row">
                    <Link className="pill-btn light" to="/profile" onClick={() => setMenuOpen(false)}>
                      Hồ sơ
                    </Link>
                    <button type="button" className="pill-btn orange" onClick={logout}>
                      Đăng xuất
                    </button>
                  </div>
                </>
              ) : (
                <div className="row">
                  <Link className="pill-btn light" to="/login" onClick={() => setMenuOpen(false)}>
                    Đăng nhập
                  </Link>
                  <Link className="pill-btn orange" to="/register" onClick={() => setMenuOpen(false)}>
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
            <div className="menu-bottom">
              <button type="button" className="pill-btn light" onClick={() => { setMenuOpen(false); scrollToVenues() }}>
                Tìm sân{' '}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
              <nav className="menu-social">
                <a href="#instagram">Instagram</a>
                <a href="#x">X</a>
                <a href="#youtube">YouTube</a>
                <a href="#linkedin">LinkedIn</a>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
