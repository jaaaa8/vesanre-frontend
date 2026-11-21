import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { getFinanceReport, getTopShops, listAdminProviders, listAdminVenues, listAdminWithdrawals, listChangeRequests } from '../../utils/api'
import { formatCoins, formatVnd } from '../../utils/format'
import { barPercent, monthLabel } from '../../utils/reportRules'
import AsyncView from '../common/AsyncView'

// Each count loads and fails on its own: one broken list must not blank the dashboard.
function PendingCount({ label, to, load }) {
  const state = useApi(load, [])
  const count = state.data?.totalElements
  return (
    <Link to={to} className={`pv-stat${count > 0 ? ' is-hot' : ''}`}>
      <strong>{state.error ? '—' : state.loading ? '…' : count}</strong>
      <span>{label}</span>
      {state.error && <small className="pv-error">Không tải được</small>}
    </Link>
  )
}

export function TopShopBars({ items }) {
  if (items.length === 0) return <p className="pv-muted">Chưa có đơn trong tháng này</p>
  const max = Math.max(0, ...items.map((i) => i.bookings))
  return (
    <div className="pv-bars">
      {items.map((i) => (
        <div key={i.shopId} className="pv-bar">
          <span>{i.shopName}</span>
          <div className="pv-bar-track">
            <div className="pv-bar-fill" style={{ width: `${barPercent(i.bookings, max)}%` }} />
          </div>
          <span>{i.bookings}</span>
        </div>
      ))}
    </div>
  )
}

export default function AdminOverview() {
  const finance = useApi(() => getFinanceReport({}), [])
  const top = useApi(() => getTopShops({ limit: 5 }), [])
  const month = finance.data && monthLabel(finance.data.month)

  return (
    <>
      <section className="pv-card">
        <h2>Việc chờ xử lý</h2>
        <div className="pv-stats">
          <PendingCount label="Chủ sân" to="/admin/providers?status=PENDING" load={() => listAdminProviders({ status: 'PENDING', size: 1 })} />
          <PendingCount label="Cơ sở" to="/admin/venues?status=PENDING_REVIEW" load={() => listAdminVenues({ status: 'PENDING_REVIEW', size: 1 })} />
          <PendingCount label="Yêu cầu thay đổi" to="/admin/change-requests?status=PENDING" load={() => listChangeRequests({ status: 'PENDING', size: 1 })} />
          <PendingCount label="Lệnh rút" to="/admin/withdrawals?status=PENDING" load={() => listAdminWithdrawals({ status: 'PENDING', size: 1 })} />
        </div>
      </section>
      <section className="pv-card">
        <AsyncView state={finance}>
          {finance.data && (
            <>
              <h2>Tiền tháng {month}</h2>
              <div className="pv-stats">
                <div className="pv-stat">
                  <strong>{formatVnd(finance.data.customerTopUpVnd)}</strong>
                  <span>Khách nạp</span>
                </div>
                <div className="pv-stat">
                  <strong>{formatVnd(finance.data.providerFeeVnd)}</strong>
                  <span>Phí rút</span>
                </div>
                <div className="pv-stat">
                  <strong>{formatVnd(finance.data.providerPayoutVnd)}</strong>
                  <span>Đã chuyển shop</span>
                </div>
              </div>
              <p className="pv-muted">
                Hiện tại: Ví shop {formatCoins(finance.data.shopWalletCoins)} · Đang chờ rút {formatCoins(finance.data.pendingWithdrawalCoins)}
              </p>
            </>
          )}
        </AsyncView>
      </section>
      <section className="pv-card">
        <h2>{month ? `Top shop tháng ${month}` : 'Top shop tháng này'}</h2>
        <AsyncView state={top}>{top.data && <TopShopBars items={top.data} />}</AsyncView>
        <Link to="/admin/reports" className="pv-back">
          Xem báo cáo đầy đủ →
        </Link>
      </section>
    </>
  )
}
