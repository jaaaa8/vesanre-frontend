import { useEffect, useRef, useState } from 'react'
import { ShieldCheck, SignOut, SquaresFour, User } from '@phosphor-icons/react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getSession, hasRole } from '../utils/auth'
import { scrollToSection } from '../utils/scroll'
import NotificationBell from './common/NotificationBell'

const links = [
  ['/#venues', 'Sân & Địa điểm'],
  ['/#sports', 'Môn thể thao & Giá'],
  ['/#owners', 'Dành cho chủ sân'],
  ['/#testimonials', 'Đánh giá'],
]

const menuLinks = [
  ['/#venues', 'Địa điểm'],
  ['/#sports', 'Môn thể thao'],
  ['/#owners', 'Chủ sân'],
  ['/#testimonials', 'Đánh giá'],
  ['/#contact', 'Liên hệ'],
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
  const isProvider = Boolean(user) && hasRole(getSession(), 'PROVIDER')
  const isAdmin = Boolean(user) && hasRole(getSession(), 'ADMIN')
  const burgerRef = useRef(null)
  const closeRef = useRef(null)
  const wasMenuOpen = useRef(false)

  useEffect(() => {
    if (!profileOpen && !menuOpen) return
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
  }, [profileOpen, menuOpen])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    // Move focus into the overlay on open and back to the burger on close.
    if (menuOpen) closeRef.current?.focus()
    else if (wasMenuOpen.current) burgerRef.current?.focus()
    wasMenuOpen.current = menuOpen
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

  const navigate = useNavigate()
  // Pages without a #venues section (venue detail) go to the search page instead.
  const scrollToVenues = () => (document.getElementById('venues') ? scrollToSection('venues') : navigate('/san'))

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
          {user && <NotificationBell />}
          {user ? (
            <span className={`profile${profileOpen ? ' open' : ''}`}>
              <button
                type="button"
                className="capsule"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((v) => !v)}
              >
                <span className="avatar">{initials(name)}</span>
                <span>{name}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <span className="dropdown" inert={!profileOpen}>
                <Link to="/profile" onClick={() => setProfileOpen(false)}>
                  <User size={16} aria-hidden="true" /> Thông tin cá nhân
                </Link>
                {isProvider && (
                  <Link to="/provider" onClick={() => setProfileOpen(false)}>
                    <SquaresFour size={16} aria-hidden="true" /> Quản lý sân
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin" onClick={() => setProfileOpen(false)}>
                    <ShieldCheck size={16} aria-hidden="true" /> Quản trị
                  </Link>
                )}
                <button type="button" className="danger" onClick={logout}>
                  <SignOut size={16} aria-hidden="true" /> Đăng xuất
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
          <button type="button" className="burger" ref={burgerRef} onClick={() => setMenuOpen(true)} aria-label="Mở menu" aria-expanded={menuOpen}>
            <span>
              <i />
              <i />
            </span>
          </button>
        </div>
      </header>

      <div id="menuWrap" className={menuOpen ? 'open' : ''} inert={!menuOpen} role="dialog" aria-modal="true" aria-label="Menu">
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
              <button type="button" className="menu-x" ref={closeRef} onClick={() => setMenuOpen(false)} aria-label="Đóng menu">
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
                    {isProvider && (
                      <Link className="pill-btn light" to="/provider" onClick={() => setMenuOpen(false)}>
                        Quản lý sân
                      </Link>
                    )}
                    {isAdmin && (
                      <Link className="pill-btn light" to="/admin" onClick={() => setMenuOpen(false)}>
                        Quản trị
                      </Link>
                    )}
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
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
