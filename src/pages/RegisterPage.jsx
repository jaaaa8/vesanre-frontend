import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import '../styles/Auth.css'

const AUTH_KEY = 'sporthub_user'
const BG_URL = 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=2000&q=80&auto=format&fit=crop'

function validContact(c) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c) || /^[0-9+\s.()-]{9,15}$/.test(c)
}

function saveSession(user) {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user))
  } catch {
    // Storage may be unavailable; navigation still proceeds.
  }
}

export default function RegisterPage({ onRegister }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showPw2, setShowPw2] = useState(false)
  const [terms, setTerms] = useState(false)
  const [error, setError] = useState('')

  const redirect =
    searchParams.get('next') || searchParams.get('redirect') || searchParams.get('from') || searchParams.get('returnUrl') || '/'
  const loginHref = redirect !== '/' ? `/login?next=${encodeURIComponent(redirect)}` : '/login'

  const submit = (event) => {
    event.preventDefault()
    const trimmedName = name.trim()
    const trimmedContact = contact.trim()
    if (trimmedName.length < 2) return setError('Vui lòng nhập họ và tên.')
    if (!validContact(trimmedContact)) return setError('Vui lòng nhập email hoặc số điện thoại hợp lệ.')
    if (password.length < 6) return setError('Mật khẩu cần ít nhất 6 ký tự.')
    if (password !== confirmPassword) return setError('Mật khẩu xác nhận chưa khớp.')
    if (!terms) return setError('Bạn cần đồng ý với Điều khoản & Chính sách của SportHub.')
    setError('')

    const user = { name: trimmedName, contact: trimmedContact, provider: 'local', loginAt: new Date().toISOString() }
    saveSession(user)
    if (typeof onRegister === 'function') {
      onRegister({ accessToken: 'demo-token', user: { name: trimmedName, email: trimmedContact } }, true)
    }
    toast.success(`Chào mừng ${trimmedName} đến với SportHub!`)
    navigate(redirect, { replace: true })
  }

  return (
    <main className="auth-page">
      <div className="auth-bg" aria-hidden="true">
        <img src={BG_URL} alt="" fetchpriority="high" />
        <div className="auth-shade" />
      </div>
      <Link className="backFab" to="/">
        &#8592; Trang ch&#7911;
      </Link>

      <section className="auth-card auth-card--register" role="main" aria-labelledby="regTitle">
        <Link className="authBrand" to="/" aria-label="SportHub Trang chủ">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v18M3 12h18" />
            <circle cx="12" cy="12" r="2.2" />
          </svg>
          <span>SportHub</span>
        </Link>
        <h1 id="regTitle">ĐĂNG KÝ TÀI KHOẢN NGƯỜI CHƠI</h1>
        <p className="authSub">Tham gia cộng đồng 12.000+ người chơi thể thao.</p>

        <form className="modal-form" onSubmit={submit} noValidate>
          <div>
            <label className="flabel" htmlFor="regName">
              Họ và tên
            </label>
            <input
              className="finput"
              id="regName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Nguyễn Văn A"
              autoComplete="name"
            />
          </div>
          <div>
            <label className="flabel" htmlFor="regContact">
              Email / Số điện thoại
            </label>
            <input
              className="finput"
              id="regContact"
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="ten@email.com hoặc 0901234567"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="flabel" htmlFor="regPw">
              Mật khẩu
            </label>
            <div className="pwWrap">
              <input
                className="finput"
                id="regPw"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
              />
              <button
                type="button"
                className={showPw ? 'eye' : 'eye off'}
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </div>
          <div>
            <label className="flabel" htmlFor="regPw2">
              Xác nhận mật khẩu
            </label>
            <div className="pwWrap">
              <input
                className="finput"
                id="regPw2"
                type={showPw2 ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
              />
              <button
                type="button"
                className={showPw2 ? 'eye' : 'eye off'}
                onClick={() => setShowPw2((v) => !v)}
                aria-label={showPw2 ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </div>
          <div className="termsRow">
            <label className="chk chk--terms">
              <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
              <span className="box">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span>Tôi đồng ý với Điều khoản &amp; Chính sách của SportHub</span>
            </label>
          </div>
          <div className="ferr" role="alert">
            {error}
          </div>
          <button className="authSubmit" type="submit">
            TẠO TÀI KHOẢN NGƯỜI CHƠI ↗
          </button>
        </form>

        <p className="switcher">
          Đã có tài khoản? <Link to={loginHref}>Đăng nhập</Link>
        </p>
      </section>
    </main>
  )
}
