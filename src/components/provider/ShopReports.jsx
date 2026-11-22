import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { getMonthlyBookings } from '../../utils/api'
import { barPercent, formatChange, formatPercent, monthLabel } from '../../utils/reportRules'
import StatusTabs from '../admin/StatusTabs'
import AsyncView from '../common/AsyncView'

const RANGES = [
  [6, '6 tháng'],
  [12, '12 tháng'],
]

export default function ShopReports({ onLogout }) {
  const [months, setMonths] = useState(6)
  const report = useApi(() => getMonthlyBookings(months), [months])
  const rows = report.data ?? []
  const max = Math.max(0, ...rows.map((r) => r.bookings))

  return (
    <section className="pv-card">
      <div className="pv-card-head">
        <h2>Báo cáo số đơn</h2>
        <StatusTabs options={RANGES} value={months} onChange={setMonths} />
      </div>
      {report.error?.status === 404 ? (
        <p className="pv-muted">
          Bạn chưa có cửa hàng. <Link to="/provider">Tạo cửa hàng</Link>
        </p>
      ) : (
        <AsyncView state={report} onLogout={onLogout}>
          <div className="pv-vbars" aria-hidden="true">
            {rows.map((r) => (
              <div key={r.month} className="pv-vbar">
                <div className="pv-vbar-track">
                  <span className="pv-vbar-value">{r.bookings}</span>
                  <div className="pv-vbar-fill" style={{ height: `${barPercent(r.bookings, max)}%` }} />
                </div>
                <span className="pv-muted">{monthLabel(r.month)}</span>
              </div>
            ))}
          </div>
          <div className="pv-table-wrap">
            <table className="pv-table">
              <thead>
                <tr>
                  <th>Tháng</th>
                  <th>Số đơn</th>
                  <th>So với tháng trước</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.month}>
                    <td>{monthLabel(r.month)}</td>
                    <td>{r.bookings}</td>
                    <td>{formatChange(r.changeFromPrevious, null)}</td>
                    <td>{formatPercent(r.changePercent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="pv-muted">Đếm đơn đã xác nhận và hoàn tất, theo tháng diễn ra trận.</p>
        </AsyncView>
      )}
    </section>
  )
}
