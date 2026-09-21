import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Brand from '../components/Brand'
import PasswordField from '../components/PasswordField'
import { validEmail } from '../utils/auth'
import { ApiError, login } from '../utils/api'

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const [contact, setContact] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (!validEmail(contact)) return setError('Vui lòng nhập email hợp lệ.')
    if (password.length < 6) return setError('Mật khẩu cần ít nhất 6 ký tự.')
    setError('')
    setLoading(true)
    try {
      const session = await login(contact.trim(), password)
      onLogin(session, remember)
      toast.success('Đăng nhập thành công')
      navigate('/')
    } catch (cause) {
      setError(cause instanceof ApiError && cause.status === 401 ? 'Email hoặc mật khẩu không đúng.' : cause.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual login-visual">
        <div className="auth-visual-shade" /><Brand light />
        <div><span>Trở lại sân đấu</span><h1>Lịch chơi của bạn đang chờ.</h1><p>Quản lý đặt sân, lịch thi đấu và ưu đãi thành viên ở một nơi.</p></div>
      </section>
      <section className="auth-content">
        <Link className="back-link" to="/"><ArrowLeft size={18} /> Trang chủ</Link>
        <form className="auth-form" onSubmit={submit} noValidate>
          <div className="auth-title"><span>Đăng nhập</span><h2>Chào mừng trở lại</h2><p>Nhập thông tin để tiếp tục với SportHub.</p></div>
          <label className="field" htmlFor="contact"><span>Email</span><input id="contact" type="email" value={contact} onChange={(event) => setContact(event.target.value)} autoComplete="username" placeholder="ten@email.com" /></label>
          <PasswordField id="password" label="Mật khẩu" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Nhập mật khẩu" />
          <div className="form-row"><label className="checkbox"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Ghi nhớ đăng nhập</label><button type="button" onClick={() => toast.info('Tính năng đặt lại mật khẩu sẽ được bổ sung sau.')}>Quên mật khẩu?</button></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Đang đăng nhập...' : <>Đăng nhập <ArrowRight size={20} /></>}</button>
          <p className="auth-switch">Chưa có tài khoản? <Link to="/dang-ky">Đăng ký ngay</Link></p>
        </form>
      </section>
    </main>
  )
}
