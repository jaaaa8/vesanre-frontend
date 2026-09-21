import { ArrowLeft, FloppyDisk } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ApiError, getProfile, updateProfile } from '../utils/api'

export default function ProfilePage({ user, onProfile, onUnauthorized }) {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(user)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getProfile().then((nextProfile) => {
      setProfile(nextProfile)
      onProfile(nextProfile)
    }).catch((cause) => {
      if (cause instanceof ApiError && cause.status === 401) {
        onUnauthorized()
        navigate('/dang-nhap', { replace: true })
        return
      }
      setError(cause.message)
    }).finally(() => setLoading(false))
  }, [navigate, onProfile, onUnauthorized])

  const submit = async (event) => {
    event.preventDefault()
    if (profile.displayName.trim().length < 2) return setError('Tên hiển thị cần ít nhất 2 ký tự.')
    setError('')
    setSaving(true)
    try {
      const nextProfile = await updateProfile({ displayName: profile.displayName.trim(), phone: profile.phone?.trim() || null })
      setProfile(nextProfile)
      onProfile(nextProfile)
      toast.success('Đã cập nhật hồ sơ')
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) {
        await onUnauthorized()
        navigate('/dang-nhap', { replace: true })
        return
      }
      setError(cause.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <main className="profile-page"><p>Đang tải hồ sơ...</p></main>

  return (
    <main className="profile-page">
      <Link className="profile-back" to="/"><ArrowLeft size={18} /> Trang chủ</Link>
      <section className="profile-card">
        <div className="auth-title"><span>Tài khoản SportHub</span><h2>Hồ sơ của bạn</h2><p>Cập nhật thông tin liên hệ và tên hiển thị.</p></div>
        <form className="auth-form" onSubmit={submit} noValidate>
          <label className="field"><span>Email</span><input value={profile.email} disabled /></label>
          <label className="field" htmlFor="display-name"><span>Tên hiển thị</span><input id="display-name" value={profile.displayName} onChange={(event) => setProfile((current) => ({ ...current, displayName: event.target.value }))} /></label>
          <label className="field" htmlFor="profile-phone"><span>Số điện thoại</span><input id="profile-phone" value={profile.phone || ''} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} autoComplete="tel" /></label>
          <dl className="profile-meta"><div><dt>Vai trò</dt><dd>{profile.roles?.join(', ') || 'CUSTOMER'}</dd></div>{profile.providerStatus && <div><dt>Trạng thái chủ sân</dt><dd>{profile.providerStatus}</dd></div>}</dl>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={saving}>{saving ? 'Đang lưu...' : <>Lưu thay đổi <FloppyDisk size={19} /></>}</button>
        </form>
      </section>
    </main>
  )
}
