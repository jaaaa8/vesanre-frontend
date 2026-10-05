import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Toast from '../components/common/Toast'
import ProfileHero from '../components/profile/ProfileHero'
import ProfileSidebar from '../components/profile/ProfileSidebar'
import BookingsTab from '../components/profile/tabs/BookingsTab'
import NotificationsTab from '../components/profile/tabs/NotificationsTab'
import PaymentsTab from '../components/profile/tabs/PaymentsTab'
import ProfileInfoTab from '../components/profile/tabs/ProfileInfoTab'
import SecurityTab from '../components/profile/tabs/SecurityTab'
import '../components/profile/Profile.css'
import { useFluidRem } from '../hooks/useFluidRem'
import { ApiError, getProfile } from '../utils/api'
import {
  BOOKINGS_KEY,
  INITIAL_NOTIFS,
  initialsOf,
  normalizeForm,
  persistBookings,
  readStoredBookings,
  readStoredUser,
  resolveInitialTab,
  saveStoredUser,
  sideIdOf,
} from '../components/profile/profileUtils'

let toastSeq = 0

export default function ProfilePage({ user, onProfile, onUnauthorized }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(resolveInitialTab)
  const [storedUser, setStoredUser] = useState(() => user || readStoredUser())
  const [form, setForm] = useState(() => normalizeForm(user || readStoredUser()))
  const [profileErr, setProfileErr] = useState('')
  const [bookings, setBookings] = useState(readStoredBookings)
  const [qrBooking, setQrBooking] = useState(null)
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS)
  const [toasts, setToasts] = useState([])
  const [profileOpen, setProfileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const timers = useRef([])
  const wrapRef = useRef(null)

  useFluidRem()

  /* ---------- Toast system (spring slide-in, auto-dismiss) ---------- */
  const pushToast = useCallback((message) => {
    const id = `toast-${Date.now()}-${toastSeq++}`
    setToasts((current) => [...current.slice(-2), { id, message }])
    const timer = window.setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id))
    }, 3200)
    timers.current.push(timer)
  }, [])

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t))
    },
    [],
  )

  /* ---------- Auth guard: localStorage sporthub_user ---------- */
  useEffect(() => {
    const effective = user || readStoredUser()
    if (
      !effective ||
      (!effective.name && !effective.email && !effective.phone && !effective.contact && !effective.displayName)
    ) {
      navigate('/dang-nhap', { replace: true })
    }
    // Initial state already hydrates from prop || localStorage; remote sync below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  /* ---------- Cross-tab bookings sync ---------- */
  useEffect(() => {
    const onStorage = (event) => {
      if (!event.key || event.key === BOOKINGS_KEY) setBookings(readStoredBookings())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  /* ---------- Best-effort backend profile sync ---------- */
  useEffect(() => {
    let cancelled = false
    getProfile()
      .then((remote) => {
        if (cancelled || !remote) return
        setStoredUser((current) => ({ ...current, ...remote }))
        setForm(normalizeForm({ ...readStoredUser(), ...remote }))
        onProfile?.(remote)
      })
      .catch((cause) => {
        if (cause instanceof ApiError && cause.status === 401) onUnauthorized?.()
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ---------- Escape closes menu / dropdown / QR ---------- */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setProfileOpen(false)
        setMenuOpen(false)
        setQrBooking(null)
      }
    }
    const onClick = (e) => {
      if (!e.target.closest?.('#profileArea')) setProfileOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [])

  const displayName = useMemo(
    () => (form.fFullName || storedUser?.name || storedUser?.displayName || 'Thành viên').trim() || 'Thành viên',
    [form.fFullName, storedUser],
  )
  const sideContact =
    storedUser?.contact || storedUser?.email || storedUser?.phone || form.fEmail || form.fPhone || 'Chưa cập nhật liên hệ'

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const toggleSport = (sport) => {
    setForm((current) => ({
      ...current,
      sports: current.sports.includes(sport)
        ? current.sports.filter((s) => s !== sport)
        : [...current.sports, sport],
    }))
  }

  const switchTab = (name) => {
    setActiveTab(name)
    try {
      if (name === 'bookings') window.history.replaceState(null, '', '#bookings')
    } catch {
      /* ignore */
    }
  }

  const gotoBookings = () => {
    switchTab('bookings')
    setProfileOpen(false)
    setMenuOpen(false)
    wrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleLogout = () => {
    setProfileOpen(false)
    setMenuOpen(false)
    try {
      onUnauthorized?.()
    } finally {
      navigate('/', { replace: true })
    }
  }

  const handleProfileSubmit = (event) => {
    event.preventDefault()
    const name = form.fFullName.trim()
    const phone = form.fPhone.trim()
    const email = form.fEmail.trim()
    const dob = form.fDob
    if (name.length < 2) {
      setProfileErr('Vui lòng nhập họ và tên.')
      return
    }
    if (phone && !/^[0-9+\s.()-]{9,15}$/.test(phone)) {
      setProfileErr('Số điện thoại chưa hợp lệ.')
      return
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setProfileErr('Email chưa hợp lệ.')
      return
    }
    setProfileErr('')
    const nextUser = {
      ...(storedUser || {}),
      name,
      displayName: name,
      phone,
      email,
      dob,
      gender: form.gender || 'Nam',
      sports: form.sports,
      contact: email || phone || storedUser?.contact || '',
    }
    if (!saveStoredUser(nextUser)) {
      setProfileErr('Không thể lưu hồ sơ: bộ nhớ trình duyệt bị chặn.')
      return
    }
    setStoredUser(nextUser)
    onProfile?.(nextUser)
    pushToast('Cập nhật thông tin thành công!')
  }

  const handleReset = () => {
    const current = readStoredUser() || storedUser
    if (current) setForm(normalizeForm(current))
    setProfileErr('')
  }

  const handleCancelBooking = (qr) => {
    setBookings((current) => {
      const next = current.filter((b) => b.qr !== qr && b.id !== qr)
      persistBookings(next)
      return next
    })
    setQrBooking((current) => (current && (current.qr === qr || current.id === qr) ? null : current))
    pushToast('Đã hủy đặt sân thành công.')
  }

  const handleQr = (booking) => {
    setQrBooking(booking)
    pushToast(`Mã vé ${booking.qr} — xuất trình QR tại quầy check-in!`)
  }

  const toggleNotif = (id) => {
    setNotifs((current) => {
      const next = current.map((n) => (n.id === id ? { ...n, on: !n.on } : n))
      const changed = next.find((n) => n.id === id)
      pushToast(changed.on ? 'Đã bật thông báo!' : 'Đã tắt thông báo.')
      return next
    })
  }

  return (
    <>
      <main>
        <ProfileHero
          displayName={displayName}
          initials={initialsOf(displayName)}
          bookingCount={bookings.length}
          profileOpen={profileOpen}
          onToggleProfile={() => setProfileOpen((v) => !v)}
          onBookings={gotoBookings}
          onLogout={handleLogout}
          onOpenMenu={() => setMenuOpen(true)}
        />

        <div className="profile-wrap" ref={wrapRef}>
          <div className="profile-grid" id="profileGrid">
            <ProfileSidebar
              displayName={displayName}
              initials={initialsOf(displayName)}
              contact={sideContact}
              sideId={sideIdOf(storedUser)}
              activeTab={activeTab}
              onTabChange={switchTab}
            />
            <div className="content">
              <ProfileInfoTab
                active={activeTab === 'profile'}
                form={form}
                profileErr={profileErr}
                onField={setField}
                onToggleSport={toggleSport}
                onSubmit={handleProfileSubmit}
                onReset={handleReset}
              />
              <BookingsTab
                active={activeTab === 'bookings'}
                bookings={bookings}
                qrBooking={qrBooking}
                onQr={handleQr}
                onCancel={handleCancelBooking}
                onCloseQr={() => setQrBooking(null)}
              />
              <PaymentsTab
                active={activeTab === 'payments'}
                onAddCard={() => pushToast('Liên kết thẻ mới — đang mở cổng thanh toán...')}
                onSetDefault={() => pushToast('Đã đặt MoMo làm mặc định!')}
              />
              <NotificationsTab active={activeTab === 'notifications'} notifs={notifs} onToggle={toggleNotif} />
              <SecurityTab active={activeTab === 'security'} onToast={pushToast} />
            </div>
          </div>
        </div>

        <footer className="footer" id="contact">
          <div className="cta-band">
            <div>
              <span className="eyebrow light">
                <i />
                Bắt đầu ngay
              </span>
              <p className="cta-title" id="ctaTitle">
                Sẵn sàng
                <br />
                Chơi ngay?
              </p>
            </div>
            <Link className="pill-btn light" to="/#venues" style={{ textDecoration: 'none' }}>
              Tìm sân gần bạn ↗{' '}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
          <div className="foot-cols">
            <div className="foot-brand">
              <div className="bc">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3v18M3 12h18" />
                  <circle cx="12" cy="12" r="2.2" />
                </svg>
                <span>SportHub</span>
              </div>
              <p className="foot-blurb">
                SportHub là nền tảng đặt sân tất cả trong một cho vận động viên, người chơi phong trào và chủ sân kết
                nối, thi đấu.
              </p>
              <address>
                <a href="mailto:support@sporthub.vn">support@sporthub.vn</a>
                <a href="tel:+842873008888">+84 (028) 7300 8888</a>
                <span className="mut">Đà Nẵng &amp; TP. Hồ Chí Minh, Việt Nam</span>
              </address>
            </div>
            <nav className="fnav">
              <h4>Môn thể thao</h4>
              <ul>
                <li>
                  <Link to="/#sports">Bóng đá</Link>
                </li>
                <li>
                  <Link to="/#sports">Pickleball</Link>
                </li>
                <li>
                  <Link to="/#sports">Tennis</Link>
                </li>
                <li>
                  <Link to="/#sports">Cầu lông</Link>
                </li>
                <li>
                  <Link to="/#sports">Bóng rổ</Link>
                </li>
              </ul>
            </nav>
            <nav className="fnav">
              <h4>Nền tảng</h4>
              <ul>
                <li>
                  <Link to="/#venues">Tìm sân</Link>
                </li>
                <li>
                  <Link to="/#sports">Bảng giá</Link>
                </li>
                <li>
                  <Link to="/#owners">Cổng chủ sân</Link>
                </li>
                <li>
                  <Link to="/#contact">Ứng dụng di động</Link>
                </li>
              </ul>
            </nav>
            <nav className="fnav">
              <h4>Công ty</h4>
              <ul>
                <li>
                  <Link to="/#trust">Về chúng tôi</Link>
                </li>
                <li>
                  <Link to="/#owners">Hợp tác cùng SportHub</Link>
                </li>
                <li>
                  <Link to="/#contact">Tuyển dụng</Link>
                </li>
                <li>
                  <Link to="/#contact">Liên hệ</Link>
                </li>
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
              <a href="#privacy">Quyền riêng tư</a>
              <a href="#terms">Điều khoản</a>
            </nav>
          </div>
        </footer>
      </main>

      <div id="menuWrap" className={menuOpen ? 'open' : ''} aria-hidden={menuOpen ? 'false' : 'true'}>
        <div id="menuBg" className="menu-bg" data-close-menu onClick={() => setMenuOpen(false)} />
        <div id="menuPanel" className="menu-panel">
          <div className="menu-inner">
            <div className="menu-top">
              <div className="bc">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3v18M3 12h18" />
                  <circle cx="12" cy="12" r="2.2" />
                </svg>
                <span>SportHub</span>
              </div>
              <button
                className="menu-x"
                data-close-menu
                type="button"
                aria-label="Đóng menu"
                onClick={() => setMenuOpen(false)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <nav className="menu-nav" id="menuNav">
              <Link to="/#venues" onClick={() => setMenuOpen(false)}>
                Địa điểm
              </Link>
              <Link to="/#sports" onClick={() => setMenuOpen(false)}>
                Môn thể thao
              </Link>
              <Link to="/#owners" onClick={() => setMenuOpen(false)}>
                Chủ sân
              </Link>
              <span style={{ color: 'var(--brand-light)' }}>Hồ sơ</span>
              <Link to="/#contact" onClick={() => setMenuOpen(false)}>
                Liên hệ
              </Link>
            </nav>
            <div className="menu-auth" id="menuAuth">
              <span className="menu-user">
                Xin chào, <b>{displayName}</b>
              </span>
              <div className="row">
                <button type="button" className="pill-btn light" onClick={handleLogout}>
                  Đăng xuất
                </button>
                <button type="button" className="pill-btn light" onClick={gotoBookings}>
                  Sân đã đặt
                </button>
              </div>
            </div>
            <div className="menu-bottom">
              <Link
                className="pill-btn light"
                to="/#venues"
                style={{ textDecoration: 'none' }}
                onClick={() => setMenuOpen(false)}
              >
                Tìm sân{' '}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
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

      <Toast toasts={toasts} />
    </>
  )
}
