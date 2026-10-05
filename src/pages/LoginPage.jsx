import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import '../styles/Auth.css'
import { ApiError, login } from '../utils/api'
import { validEmail } from '../utils/auth'

const BG_URL = 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=2000&q=80&auto=format&fit=crop'

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [contact, setContact] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const redirect =
    searchParams.get('next') || searchParams.get('redirect') || searchParams.get('from') || searchParams.get('returnUrl') || '/'
  const registerHref = redirect !== '/' ? `/register?next=${encodeURIComponent(redirect)}` : '/register'

  const submit = async (event) => {
    event.preventDefault()
    if (!validEmail(contact)) return setError('Vui lòng nhập email hợp lệ.')
    if (!password) return setError('Vui lòng nhập mật khẩu.')
    setError('')
    setSubmitting(true)
    try {
      const session = await login(contact.trim(), password)
      onLogin?.(session, remember)
      navigate(redirect, { replace: true })
    } catch (cause) {
      setError(
        cause instanceof ApiError && cause.status === 401
          ? 'Email hoặc mật khẩu không đúng.'
          : cause instanceof ApiError
            ? cause.message
            : 'Không thể kết nối máy chủ. Vui lòng thử lại.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const social = (provider) => toast.info(`Đăng nhập bằng ${provider} chưa được hỗ trợ.`)

  return (
    <main className="auth-page">
      <div className="auth-bg" aria-hidden="true">
        <img src={BG_URL} alt="" fetchpriority="high" />
        <div className="auth-shade" />
      </div>
      <Link className="backFab" to="/">
        &#8592; Trang ch&#7911;
      </Link>

      <section className="auth-card" role="main" aria-labelledby="loginTitle">
        <Link className="authBrand" to="/" aria-label="SportHub Trang chủ">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v18M3 12h18" />
            <circle cx="12" cy="12" r="2.2" />
          </svg>
          <span>SportHub</span>
        </Link>
        <h1 id="loginTitle">ĐĂNG NHẬP</h1>
        <p className="authSub">Một tài khoản duy nhất — đặt sân, theo dõi lịch đấu &amp; nhận ưu đãi.</p>

        <form className="modal-form" onSubmit={submit} noValidate>
          <div>
            <label className="flabel" htmlFor="loginContact">
              Email
            </label>
            <input
              className="finput"
              id="loginContact"
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="ten@email.com"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="flabel" htmlFor="loginPw">
              M&#7853;t kh&#7849;u
            </label>
            <div className="pwWrap">
              <input
                className="finput"
                id="loginPw"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
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
          <div className="authRow">
            <label className="chk">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span className="box">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </span>
              Ghi nh&#7899; &#273;&#259;ng nh&#7853;p
            </label>
            <button type="button" className="linkBtn" onClick={() => toast.info('Liên kết đặt lại mật khẩu đã gửi qua SMS!')}>
              Qu&ecirc;n m&#7853;t kh&#7849;u?
            </button>
          </div>
          <div className="ferr" role="alert">
            {error}
          </div>
          <button className="authSubmit" type="submit" disabled={submitting}>
            ĐĂNG NHẬP ↗
          </button>
        </form>

        <div className="orRow">
          <span />
          Ho&#7863;c &#273;&#259;ng nh&#7853;p b&#7857;ng
          <span />
        </div>
        <div className="socRow">
          <button type="button" className="socBtn" onClick={() => social('Google')}>
            <svg viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>
          <button type="button" className="socBtn" onClick={() => social('Apple')}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.36 12.76c0-2.3 1.88-3.4 1.97-3.45-1.07-1.57-2.74-1.78-3.34-1.81-1.42-.14-2.77.84-3.49.84-.72 0-1.83-.82-3.02-.8-1.55.02-2.98.9-3.78 2.29-1.61 2.8-.41 6.94 1.16 9.21.76 1.1 1.67 2.34 2.87 2.3 1.15-.05 1.59-.74 2.98-.74s1.78.74 3 .72c1.24-.02 2.02-1.12 2.78-2.23.88-1.28 1.24-2.52 1.26-2.59-.03-.01-2.42-.93-2.39-3.74zM14.16 5.53c.64-.77 1.07-1.84.95-2.91-.92.04-2.03.61-2.69 1.38-.59.68-1.11 1.77-.97 2.81 1.02.08 2.07-.52 2.71-1.28z" />
            </svg>
            Apple
          </button>
        </div>

        <p className="switcher">
          Ch&#432;a c&oacute; t&agrave;i kho&#7843;n? <Link to={registerHref}>&#272;&#259;ng k&yacute; ngay</Link>
        </p>
        <p className="fineprint">Bằng việc tiếp tục, bạn đồng ý với Điều khoản &amp; Chính sách của SportHub.</p>
      </section>
    </main>
  )
}
