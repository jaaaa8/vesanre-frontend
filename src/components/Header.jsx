import { CaretDown, List, SignOut, UserCircle, X } from '@phosphor-icons/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Brand from './Brand'

const links = [
  ['#venues', 'Sân & Địa điểm'], ['#sports', 'Môn thể thao & Giá'],
  ['#owners', 'Dành cho chủ sân'], ['#testimonials', 'Đánh giá'],
]

export default function Header({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const logout = () => {
    onLogout()
    setProfileOpen(false)
    setMenuOpen(false)
    toast.success('Đã đăng xuất thành công')
  }

  return (
    <header className="site-header">
      <Brand light />
      <nav className="desktop-nav" aria-label="Điều hướng chính">
        {links.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
      </nav>
      <div className="header-actions">
        {user ? (
          <div className="profile-menu">
            <button className="profile-button" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen}>
              <span className="avatar">{user.displayName.charAt(0).toUpperCase()}</span><span>{user.displayName}</span><CaretDown size={15} />
            </button>
            {profileOpen && (
              <div className="profile-dropdown">
                <Link to="/tai-khoan" onClick={() => setProfileOpen(false)}><UserCircle size={18} /> Tài khoản</Link>
                <button type="button" className="danger" onClick={logout}><SignOut size={18} /> Đăng xuất</button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-links"><Link to="/dang-nhap">Đăng nhập</Link><Link className="button button-light" to="/dang-ky">Đăng ký</Link></div>
        )}
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}>
          {menuOpen ? <X size={22} /> : <List size={22} />}
        </button>
      </div>
      {menuOpen && (
        <nav className="mobile-nav" aria-label="Điều hướng di động">
          {links.map(([href, label]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
          {!user && <Link to="/dang-nhap">Đăng nhập</Link>}
          {!user && <Link to="/dang-ky">Đăng ký</Link>}
          {user && <button type="button" onClick={logout}>Đăng xuất</button>}
        </nav>
      )}
    </header>
  )
}
