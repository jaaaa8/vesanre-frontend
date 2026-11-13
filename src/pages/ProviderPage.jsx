import { Link, NavLink, Route, Routes } from 'react-router-dom'
import ShopSection from '../components/provider/ShopSection'
import VenueDetail from '../components/provider/VenueDetail'
import VenueList from '../components/provider/VenueList'
import '../components/provider/provider.css'

export default function ProviderPage({ onLogout }) {
  return (
    <div className="pv-page">
      <header className="pv-top">
        <Link to="/" className="brand">
          SportHub
        </Link>
        <h1>Quản lý sân</h1>
        <button type="button" className="ui-btn" onClick={onLogout}>
          Đăng xuất
        </button>
      </header>
      <div className="pv-body">
        <nav className="pv-nav" aria-label="Quản lý sân">
          <NavLink to="/provider" end>
            Cửa hàng
          </NavLink>
          <NavLink to="/provider/venues">Cơ sở</NavLink>
        </nav>
        <main className="pv-main">
          <Routes>
            <Route index element={<ShopSection onLogout={onLogout} />} />
            <Route path="venues" element={<VenueList onLogout={onLogout} />} />
            <Route path="venues/:id" element={<VenueDetail onLogout={onLogout} />} />
            <Route path="*" element={<p className="pv-muted">Không tìm thấy trang.</p>} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
