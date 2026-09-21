import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Brand from '../components/Brand'
import PasswordField from '../components/PasswordField'
import { toBackendRole, validEmail } from '../utils/auth'
import { ApiError, login, register } from '../utils/api'

export default function RegisterPage({ onRegister }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ role: 'player', name: '', email: '', phone: '', password: '', confirm: '', legalName: '', terms: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event) => {
    event.preventDefault()
    if (form.name.trim().length < 2) return setError('Vui lòng nhập họ và tên.')
    if (!validEmail(form.email)) return setError('Vui lòng nhập email hợp lệ.')
    if (form.password.length < 8) return setError('Mật khẩu cần ít nhất 8 ký tự.')
    if (form.password !== form.confirm) return setError('Mật khẩu xác nhận chưa khớp.')
    if (form.role === 'owner' && form.legalName.trim().length < 2) return setError('Vui lòng nhập tên pháp lý của chủ sân.')
    if (!form.terms) return setError('Bạn cần đồng ý với điều khoản sử dụng.')
    setError('')
    setLoading(true)
    try {
      await register({
        email: form.email.trim(), password: form.password, displayName: form.name.trim(), phone: form.phone.trim() || null,
        role: toBackendRole(form.role), legalName: form.role === 'owner' ? form.legalName.trim() : null, taxId: null,
      })
      onRegister(await login(form.email.trim(), form.password), true)
      toast.success('Tạo tài khoản thành công')
      navigate('/')
    } catch (cause) {
      setError(cause instanceof ApiError && cause.status === 409 ? 'Email này đã được đăng ký.' : cause.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual register-visual">
        <div className="auth-visual-shade" /><Brand light />
        <div><span>Tham gia SportHub</span><h1>Trận đấu hay bắt đầu từ đúng sân.</h1><p>Tạo tài khoản để đặt sân nhanh hơn và quản lý mọi lịch chơi.</p></div>
      </section>
      <section className="auth-content register-content">
        <Link className="back-link" to="/"><ArrowLeft size={18} /> Trang chủ</Link>
        <form className="auth-form" onSubmit={submit} noValidate>
          <div className="auth-title"><span>Đăng ký</span><h2>Tạo tài khoản SportHub</h2><p>Chọn vai trò và điền thông tin của bạn.</p></div>
          <div className="role-switch" aria-label="Chọn vai trò"><button type="button" className={form.role === 'player' ? 'active' : ''} onClick={() => update('role', 'player')}>Người chơi</button><button type="button" className={form.role === 'owner' ? 'active' : ''} onClick={() => update('role', 'owner')}>Chủ sân</button></div>
          <label className="field" htmlFor="name"><span>Họ và tên</span><input id="name" value={form.name} onChange={(event) => update('name', event.target.value)} autoComplete="name" placeholder="Nguyễn Văn An" /></label>
          <label className="field" htmlFor="register-email"><span>Email</span><input id="register-email" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} autoComplete="username" placeholder="ten@email.com" /></label>
          <label className="field" htmlFor="register-phone"><span>Số điện thoại (không bắt buộc)</span><input id="register-phone" value={form.phone} onChange={(event) => update('phone', event.target.value)} autoComplete="tel" placeholder="0901234567" /></label>
          {form.role === 'owner' && <label className="field" htmlFor="legal-name"><span>Tên pháp lý chủ sân</span><input id="legal-name" value={form.legalName} onChange={(event) => update('legalName', event.target.value)} placeholder="Công ty hoặc hộ kinh doanh" /></label>}
          <div className="form-columns"><PasswordField id="register-password" label="Mật khẩu" value={form.password} onChange={(event) => update('password', event.target.value)} autoComplete="new-password" /><PasswordField id="confirm-password" label="Xác nhận mật khẩu" value={form.confirm} onChange={(event) => update('confirm', event.target.value)} autoComplete="new-password" /></div>
          <label className="checkbox terms"><input type="checkbox" checked={form.terms} onChange={(event) => update('terms', event.target.checked)} /> Tôi đồng ý với Điều khoản và Chính sách của SportHub.</label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Đang tạo tài khoản...' : <>Tạo tài khoản <ArrowRight size={20} /></>}</button>
          <p className="auth-switch">Đã có tài khoản? <Link to="/dang-nhap">Đăng nhập</Link></p>
        </form>
      </section>
    </main>
  )
}
