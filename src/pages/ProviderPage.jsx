import { Link, NavLink, Route, Routes } from 'react-router-dom'
import CourtDetail from '../components/provider/CourtDetail'
import ProviderBookingDetail from '../components/provider/ProviderBookingDetail'
import ProviderBookings from '../components/provider/ProviderBookings'
import ShopReports from '../components/provider/ShopReports'
import ShopReviews from '../components/provider/ShopReviews'
import ShopSection from '../components/provider/ShopSection'
import ShopWallet from '../components/provider/ShopWallet'
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
          <NavLink to="/provider/bookings">Lịch đặt</NavLink>
          <NavLink to="/provider/wallet">Ví shop</NavLink>
          <NavLink to="/provider/reviews">Đánh giá</NavLink>
          <NavLink to="/provider/reports">Báo cáo</NavLink>
        </nav>
        <main className="pv-main">
          <Routes>
            <Route index element={<ShopSection onLogout={onLogout} />} />
            <Route path="venues" element={<VenueList onLogout={onLogout} />} />
            <Route path="venues/:id" element={<VenueDetail onLogout={onLogout} />} />
            <Route path="courts/:id" element={<CourtDetail onLogout={onLogout} />} />
            <Route path="bookings" element={<ProviderBookings onLogout={onLogout} />} />
            <Route path="bookings/:id" element={<ProviderBookingDetail onLogout={onLogout} />} />
            <Route path="wallet" element={<ShopWallet onLogout={onLogout} />} />
            <Route path="reviews" element={<ShopReviews onLogout={onLogout} />} />
            <Route path="reports" element={<ShopReports onLogout={onLogout} />} />
            <Route path="*" element={<p className="pv-muted">Không tìm thấy trang.</p>} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
