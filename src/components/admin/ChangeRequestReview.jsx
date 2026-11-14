import { useEffect, useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { approveChangeRequest, listChangeRequests, rejectChangeRequest } from '../../utils/api'
import { changeRows, fallbackPage } from '../../utils/adminRules'
import { formatDate } from '../../utils/format'
import AsyncView from '../common/AsyncView'
import ConfirmDialog from '../common/ConfirmDialog'
import Pagination from '../common/Pagination'
import StatusBadge from '../common/StatusBadge'
import { VENUE_LABELS } from '../provider/venueFields'
import StatusTabs from './StatusTabs'
import { useAdminAction } from './useAdminAction'
import { useListParams } from './useListParams'

const TABS = [
  ['PENDING', 'Chờ duyệt'],
  ['APPROVED', 'Đã duyệt'],
  ['REJECTED', 'Bị từ chối'],
  ['CANCELLED', 'Đã hủy'],
]
const STATUSES = TABS.map(([k]) => k)
const EXTRA = [{ key: 'targetType', values: ['SHOP', 'VENUE'] }]
const TYPE_LABELS = { SHOP: 'Cửa hàng', VENUE: 'Cơ sở' }

const fieldLabel = (type, key) => (type === 'SHOP' && key === 'name' ? 'Tên cửa hàng' : VENUE_LABELS[key] || key)
const show = (v) => (v == null || v === '' ? '(để trống)' : String(v))

export default function ChangeRequestReview({ onLogout }) {
  const { params, setParams } = useListParams(STATUSES, EXTRA)
  const { status, targetType, page } = params
  const list = useApi(() => listChangeRequests({ status, targetType, page, size: 20 }), [status, targetType, page])
  const { busy, run } = useAdminAction(list.reload)
  const [dialog, setDialog] = useState(null) // { kind: 'approve' | 'reject', item }

  useEffect(() => {
    if (list.loading || !list.data) return
    const p = fallbackPage(page, list.data.items, list.data.totalPages)
    if (p !== null) setParams({ page: p })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.data, list.loading])

  const confirm = async (reason) => {
    const { kind, item } = dialog
    if (kind === 'approve') await run(() => approveChangeRequest(item.id), 'Đã duyệt yêu cầu')
    else await run(() => rejectChangeRequest(item.id, reason), 'Đã từ chối yêu cầu')
    setDialog(null)
  }

  return (
    <section className="pv-main">
      <div className="pv-card">
        <div className="pv-card-head">
          <h2>Yêu cầu thay đổi</h2>
          <select aria-label="Loại" value={targetType} onChange={(e) => setParams({ targetType: e.target.value })}>
            <option value="">Tất cả</option>
            <option value="SHOP">Cửa hàng</option>
            <option value="VENUE">Cơ sở</option>
          </select>
        </div>
        <StatusTabs options={TABS} value={status} onChange={(s) => setParams({ status: s })} />
      </div>
      <AsyncView state={list} empty={list.data?.items.length === 0} emptyText="Không có yêu cầu nào." onLogout={onLogout}>
        {list.data?.items.map((r) => (
          <article key={r.id} className="pv-card">
            <div className="pv-card-head">
              <h2>
                {TYPE_LABELS[r.targetType] || r.targetType}: {r.targetName}
              </h2>
              <div className="meta">
                <StatusBadge status={r.status} />
                {r.status === 'PENDING' && (
                  <>
                    <button type="button" className="ui-btn primary" disabled={busy} onClick={() => setDialog({ kind: 'approve', item: r })}>
                      Duyệt
                    </button>
                    <button type="button" className="ui-btn" disabled={busy} onClick={() => setDialog({ kind: 'reject', item: r })}>
                      Từ chối
                    </button>
                  </>
                )}
              </div>
            </div>
            <p className="pv-muted">
              Gửi bởi {r.submittedBy} · {formatDate(r.createdAt)}
            </p>
            <div className="pv-table-wrap">
              <table className="pv-table">
                <thead>
                  <tr>
                    <th>Trường</th>
                    <th>Hiện tại</th>
                    <th>Đề xuất</th>
                  </tr>
                </thead>
                <tbody>
                  {changeRows(r.current, r.proposed).map((row) => (
                    <tr key={row.key}>
                      <td>{fieldLabel(r.targetType, row.key)}</td>
                      <td>{show(row.from)}</td>
                      <td>{row.changed ? <strong>{show(row.to)}</strong> : show(row.to)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ))}
        <Pagination page={page} totalPages={list.data?.totalPages ?? 0} onChange={(p) => setParams({ page: p })} />
      </AsyncView>
      <ConfirmDialog
        open={Boolean(dialog)}
        title={dialog?.kind === 'reject' ? 'Từ chối yêu cầu' : 'Duyệt yêu cầu'}
        message={dialog && `${dialog.kind === 'reject' ? 'Từ chối' : 'Duyệt'} yêu cầu thay đổi "${dialog.item.targetName}"?`}
        requireReason={dialog?.kind === 'reject'}
        confirmText={dialog?.kind === 'reject' ? 'Từ chối' : 'Duyệt'}
        busy={busy}
        onConfirm={confirm}
        onCancel={() => setDialog(null)}
      />
    </section>
  )
}
