import { Link, NavLink, Route, Routes } from 'react-router-dom'
import ChangeRequestReview from '../components/admin/ChangeRequestReview'
import AdminVenueDetail from '../components/admin/AdminVenueDetail'
import ProviderReview from '../components/admin/ProviderReview'
import VenueReview from '../components/admin/VenueReview'
import '../components/provider/provider.css'

export default function AdminPage({ onLogout }) {
  return (
    <div className="pv-page">
      <header className="pv-top">
        <Link to="/" className="brand">
          SportHub
        </Link>
        <h1>Quản trị</h1>
        <button type="button" className="ui-btn" onClick={onLogout}>
          Đăng xuất
        </button>
      </header>
      <div className="pv-body">
        <nav className="pv-nav" aria-label="Quản trị">
          <NavLink to="/admin" end>
            Chủ sân
          </NavLink>
          <NavLink to="/admin/venues">Cơ sở</NavLink>
          <NavLink to="/admin/change-requests">Yêu cầu thay đổi</NavLink>
        </nav>
        <main className="pv-main">
          <Routes>
            <Route index element={<ProviderReview onLogout={onLogout} />} />
            <Route path="venues" element={<VenueReview onLogout={onLogout} />} />
            <Route path="venues/:id" element={<AdminVenueDetail onLogout={onLogout} />} />
            <Route path="change-requests" element={<ChangeRequestReview onLogout={onLogout} />} />
            <Route path="*" element={<p className="pv-muted">Không tìm thấy trang.</p>} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
