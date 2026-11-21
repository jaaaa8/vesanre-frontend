import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { getFinanceReport, getTopShops } from '../../utils/api'
import { isMonth } from '../../utils/adminRules'
import { formatCoins, formatVnd } from '../../utils/format'
import { monthLabel } from '../../utils/reportRules'
import AsyncView from '../common/AsyncView'
import { TopShopBars } from './AdminOverview'

export default function AdminReports({ onLogout }) {
  const [search, setSearch] = useSearchParams()
  const raw = search.get('month')
  // No valid month → send none, so the backend picks the current month in VN time.
  const month = raw !== null && isMonth(raw) ? raw : ''

  useEffect(() => {
    if (raw !== null && !isMonth(raw)) setSearch({}, { replace: true })
  }, [raw, setSearch])

  const finance = useApi(() => getFinanceReport({ month }), [month])
  const top = useApi(() => getTopShops({ month, limit: 10 }), [month])
  const label = finance.data && monthLabel(finance.data.month)

  return (
    <>
      <section className="pv-card">
        <div className="pv-card-head">
          <h2>Báo cáo</h2>
          <input
            type="month"
            aria-label="Tháng"
            value={month || finance.data?.month || ''}
            onChange={(e) => setSearch(e.target.value ? { month: e.target.value } : {}, { replace: true })}
          />
        </div>
      </section>
      <section className="pv-card">
        <AsyncView state={finance} onLogout={onLogout}>
          {finance.data && (
            <>
              <h2>Tài chính {label}</h2>
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
              <h3>Hiện tại (không theo tháng)</h3>
              <div className="pv-stats">
                <div className="pv-stat">
                  <strong>{formatCoins(finance.data.shopWalletCoins)}</strong>
                  <span>Ví shop</span>
                </div>
                <div className="pv-stat">
                  <strong>{formatCoins(finance.data.pendingWithdrawalCoins)}</strong>
                  <span>Đang chờ rút</span>
                </div>
              </div>
            </>
          )}
        </AsyncView>
      </section>
      <section className="pv-card">
        <h2>Top shop</h2>
        <AsyncView state={top} onLogout={onLogout}>
          {top.data && <TopShopBars items={top.data} />}
        </AsyncView>
      </section>
    </>
  )
}
