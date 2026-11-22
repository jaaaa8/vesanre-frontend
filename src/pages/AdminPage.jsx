import { Link, NavLink, Route, Routes } from 'react-router-dom'
import AdminOverview from '../components/admin/AdminOverview'
import AdminReports from '../components/admin/AdminReports'
import ChangeRequestReview from '../components/admin/ChangeRequestReview'
import AdminVenueDetail from '../components/admin/AdminVenueDetail'
import AuditLog from '../components/admin/AuditLog'
import ProviderReview from '../components/admin/ProviderReview'
import ReviewModeration from '../components/admin/ReviewModeration'
import UserAdmin from '../components/admin/UserAdmin'
import VenueReview from '../components/admin/VenueReview'
import WithdrawalReview from '../components/admin/WithdrawalReview'
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
            Tổng quan
          </NavLink>
          <NavLink to="/admin/providers">Chủ sân</NavLink>
          <NavLink to="/admin/venues">Cơ sở</NavLink>
          <NavLink to="/admin/change-requests">Yêu cầu thay đổi</NavLink>
          <NavLink to="/admin/withdrawals">Lệnh rút</NavLink>
          <NavLink to="/admin/reviews">Đánh giá</NavLink>
          <NavLink to="/admin/users">Người dùng</NavLink>
          <NavLink to="/admin/reports">Báo cáo</NavLink>
          <NavLink to="/admin/audit">Nhật ký</NavLink>
        </nav>
        <main className="pv-main">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="providers" element={<ProviderReview onLogout={onLogout} />} />
            <Route path="venues" element={<VenueReview onLogout={onLogout} />} />
            <Route path="venues/:id" element={<AdminVenueDetail onLogout={onLogout} />} />
            <Route path="change-requests" element={<ChangeRequestReview onLogout={onLogout} />} />
            <Route path="withdrawals" element={<WithdrawalReview onLogout={onLogout} />} />
            <Route path="reviews" element={<ReviewModeration onLogout={onLogout} />} />
            <Route path="users" element={<UserAdmin onLogout={onLogout} />} />
            <Route path="reports" element={<AdminReports onLogout={onLogout} />} />
            <Route path="audit" element={<AuditLog onLogout={onLogout} />} />
            <Route path="*" element={<p className="pv-muted">Không tìm thấy trang.</p>} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
