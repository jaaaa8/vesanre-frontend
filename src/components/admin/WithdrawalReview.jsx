import { useEffect, useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { listAdminWithdrawals, markWithdrawalPaid, rejectWithdrawal } from '../../utils/api'
import { fallbackPage } from '../../utils/adminRules'
import { formatDate, formatVnd } from '../../utils/format'
import AsyncView from '../common/AsyncView'
import ConfirmDialog from '../common/ConfirmDialog'
import Pagination from '../common/Pagination'
import StatusBadge from '../common/StatusBadge'
import StatusTabs from './StatusTabs'
import { useAdminAction } from './useAdminAction'
import { useListParams } from './useListParams'

const TABS = [
  ['PENDING', 'Chờ xử lý'],
  ['PAID', 'Đã chuyển'],
  ['REJECTED', 'Từ chối'],
  ['ALL', 'Tất cả'],
]

export default function WithdrawalReview({ onLogout }) {
  const { params, setParams } = useListParams(TABS.map(([k]) => k))
  const { status, page } = params
  const list = useApi(() => listAdminWithdrawals({ status: status === 'ALL' ? '' : status, page, size: 20 }), [status, page])
  const { busy, run } = useAdminAction(list.reload)
  const [dialog, setDialog] = useState(null) // { kind: 'paid' | 'reject', item }

  useEffect(() => {
    if (list.loading || !list.data) return
    const p = fallbackPage(page, list.data.items, list.data.totalPages)
    if (p !== null) setParams({ page: p })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.data, list.loading])

  const confirm = async (value) => {
    const { kind, item } = dialog
    if (kind === 'paid') await run(() => markWithdrawalPaid(item.id, value), 'Đã đánh dấu đã chuyển')
    else await run(() => rejectWithdrawal(item.id, value), 'Đã từ chối, coin đã hoàn vào ví shop')
    setDialog(null)
  }

  const paid = dialog?.kind === 'paid'

  return (
    <section className="pv-card">
      <h2>Lệnh rút</h2>
      <StatusTabs options={TABS} value={status} onChange={(s) => setParams({ status: s })} />
      <AsyncView state={list} empty={list.data?.items.length === 0} emptyText="Không có lệnh rút nào ở trạng thái này." onLogout={onLogout}>
        <div aria-busy={list.loading} className={list.loading ? 'pv-reloading' : undefined}>
          <div className="pv-table-wrap">
            <table className="pv-table">
              <thead>
                <tr>
                  <th>Shop</th>
                  <th>Coin</th>
                  <th>Phí</th>
                  <th>Thực nhận</th>
                  <th>Ngân hàng</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.data?.items.map((w) => (
                  <tr key={w.id}>
                    <td>{w.shopName}</td>
                    <td>{w.coinAmount}</td>
                    <td>{w.feeCoins}</td>
                    <td>{formatVnd(w.payoutVnd)}</td>
                    <td>
                      {w.bankName}
                      <br />
                      {w.bankAccountNumber}
                      <br />
                      {w.bankAccountName}
                    </td>
                    <td>{formatDate(w.createdAt)}</td>
                    <td>
                      <StatusBadge status={w.status} />
                      {w.status === 'PAID' && (
                        <div className="pv-muted">
                          Mã GD {w.bankTransactionRef} · {formatDate(w.paidAt)}
                        </div>
                      )}
                      {w.status === 'REJECTED' && <div className="pv-muted">Lý do: {w.rejectionReason}</div>}
                    </td>
                    <td>
                      {w.status === 'PENDING' && (
                        <div className="pv-row">
                          <button type="button" className="ui-btn primary" disabled={busy || list.loading} onClick={() => setDialog({ kind: 'paid', item: w })}>
                            Đã chuyển
                          </button>
                          <button type="button" className="ui-btn" disabled={busy || list.loading} onClick={() => setDialog({ kind: 'reject', item: w })}>
                            Từ chối
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={list.data?.totalPages ?? 0} onChange={(p) => setParams({ page: p })} />
        </div>
      </AsyncView>
      <ConfirmDialog
        open={Boolean(dialog)}
        title={paid ? 'Đánh dấu đã chuyển' : 'Từ chối lệnh rút'}
        message={paid ? dialog && `Đã chuyển ${formatVnd(dialog.item.payoutVnd)} cho ${dialog.item.shopName}?` : 'Coin sẽ hoàn vào ví shop.'}
        requireReason
        reasonLabel={paid ? 'Mã giao dịch ngân hàng' : undefined}
        maxLength={paid ? 120 : 500}
        confirmText={paid ? 'Đã chuyển' : 'Từ chối'}
        busy={busy}
        onConfirm={confirm}
        onCancel={() => setDialog(null)}
      />
    </section>
  )
}
