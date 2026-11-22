import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { getShopWallet, listShopWithdrawals } from '../../utils/api'
import { formatCoins, formatDate, formatVnd } from '../../utils/format'
import { WITHDRAWAL_STATUS_LABELS } from '../../utils/walletRules'
import AsyncView from '../common/AsyncView'
import Pagination from '../common/Pagination'
import WithdrawalForm from './WithdrawalForm'

const idle = () => Promise.resolve(null)

export default function ShopWallet({ onLogout }) {
  const wallet = useApi(getShopWallet, [])
  const [page, setPage] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const history = useApi(wallet.data ? () => listShopWithdrawals({ page, size: 10 }) : idle, [Boolean(wallet.data), page])

  const done = () => {
    setFormOpen(false)
    wallet.reload()
    history.reload()
  }

  return (
    <>
      <section className="pv-card">
        <div className="pv-card-head">
          <h2>Ví shop</h2>
          {wallet.data && (
            <button type="button" className="ui-btn primary" onClick={() => setFormOpen((o) => !o)}>
              Rút coin
            </button>
          )}
        </div>
        {wallet.error?.status === 404 ? (
          <p className="pv-muted">
            Bạn chưa có cửa hàng. <Link to="/provider">Tạo cửa hàng</Link>
          </p>
        ) : (
          <AsyncView state={wallet} onLogout={onLogout}>
            {wallet.data && (
              <>
                <p className="pv-balance">
                  <b>{formatCoins(wallet.data.balance)}</b> <span className="pv-muted">≈ {formatVnd(wallet.data.balance * 1000)}</span>
                </p>
                <p className="pv-muted">
                  Coin cọc của khách vào ví khi booking hoàn tất. Coin bị trừ ngay khi gửi lệnh; nếu admin từ chối, coin được hoàn lại.
                </p>
                {formOpen && (
                  <WithdrawalForm balance={wallet.data.balance} onDone={done} onCancel={() => setFormOpen(false)} onBalanceStale={wallet.reload} />
                )}
              </>
            )}
          </AsyncView>
        )}
      </section>
      {wallet.data && (
        <section className="pv-card">
          <h2>Lịch sử rút</h2>
          <AsyncView state={history} empty={history.data?.items.length === 0} emptyText="Chưa có lệnh rút nào." onLogout={onLogout}>
            <div className="pv-table-wrap">
              <table className="pv-table">
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Coin</th>
                    <th>Phí</th>
                    <th>Thực nhận</th>
                    <th>Ngân hàng</th>
                    <th>Trạng thái</th>
                    <th>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {history.data?.items.map((w) => (
                    <tr key={w.id}>
                      <td>{formatDate(w.createdAt)}</td>
                      <td>{w.coinAmount}</td>
                      <td>{w.feeCoins}</td>
                      <td>{formatVnd(w.payoutVnd)}</td>
                      <td>
                        {w.bankName} · {w.bankAccountNumber}
                      </td>
                      <td>
                        <span className={`ui-badge is-${w.status.toLowerCase()}`}>{WITHDRAWAL_STATUS_LABELS[w.status] ?? w.status}</span>
                      </td>
                      <td>
                        {w.status === 'PAID' && `Mã GD ${w.bankTransactionRef}`}
                        {w.status === 'REJECTED' && w.rejectionReason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={history.data?.totalPages ?? 0} onChange={setPage} />
          </AsyncView>
        </section>
      )}
    </>
  )
}
