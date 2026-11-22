import { useEffect, useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { hideReview, listAdminReviews, unhideReview } from '../../utils/api'
import { fallbackPage } from '../../utils/adminRules'
import { formatDate, formatStars } from '../../utils/format'
import AsyncView from '../common/AsyncView'
import ConfirmDialog from '../common/ConfirmDialog'
import Pagination from '../common/Pagination'
import StatusBadge from '../common/StatusBadge'
import StatusTabs from './StatusTabs'
import { useAdminAction } from './useAdminAction'
import { useListParams } from './useListParams'

const TABS = [
  ['PUBLISHED', 'Đang hiện'],
  ['HIDDEN', 'Đã ẩn'],
  ['ALL', 'Tất cả'],
]

export default function ReviewModeration({ onLogout }) {
  const { params, setParams } = useListParams(TABS.map(([k]) => k))
  const { status, page } = params
  const list = useApi(() => listAdminReviews({ status: status === 'ALL' ? '' : status, page, size: 20 }), [status, page])
  const { busy, run } = useAdminAction(list.reload)
  const [dialog, setDialog] = useState(null) // { kind: 'hide' | 'unhide', item }

  useEffect(() => {
    if (list.loading || !list.data) return
    const p = fallbackPage(page, list.data.items, list.data.totalPages)
    if (p !== null) setParams({ page: p })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.data, list.loading])

  const confirm = async (reason) => {
    const { kind, item } = dialog
    if (kind === 'hide') await run(() => hideReview(item.review.id, reason), 'Đã ẩn đánh giá')
    else await run(() => unhideReview(item.review.id), 'Đã hiện lại đánh giá')
    setDialog(null)
  }

  const hide = dialog?.kind === 'hide'

  return (
    <section className="pv-card">
      <h2>Đánh giá</h2>
      <StatusTabs options={TABS} value={status} onChange={(s) => setParams({ status: s })} />
      <AsyncView state={list} empty={list.data?.items.length === 0} emptyText="Không có đánh giá nào ở trạng thái này." onLogout={onLogout}>
        <div aria-busy={list.loading} className={list.loading ? 'pv-reloading' : undefined}>
          <div className="pv-table-wrap">
            <table className="pv-table">
              <thead>
                <tr>
                  <th>Sao</th>
                  <th>Bình luận</th>
                  <th>Khách</th>
                  <th>Cơ sở</th>
                  <th>Mã booking</th>
                  <th>Ngày</th>
                  <th>Trạng thái</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.data?.items.map(({ review, venueName, bookingCode }) => (
                  <tr key={review.id}>
                    <td>
                      <span aria-label={`${review.rating} sao`}>{formatStars(review.rating)}</span>
                    </td>
                    <td className="pv-comment">
                      {review.comment || '—'}
                      {review.providerReply && <div className="pv-muted">Chủ sân trả lời: {review.providerReply}</div>}
                    </td>
                    <td>{review.customerName}</td>
                    <td>{venueName}</td>
                    <td>{bookingCode}</td>
                    <td>{formatDate(review.createdAt)}</td>
                    <td>
                      <StatusBadge status={review.status} />
                    </td>
                    <td>
                      {review.status === 'PUBLISHED' && (
                        <button type="button" className="ui-btn" disabled={busy || list.loading} onClick={() => setDialog({ kind: 'hide', item: { review } })}>
                          Ẩn
                        </button>
                      )}
                      {review.status === 'HIDDEN' && (
                        <button type="button" className="ui-btn" disabled={busy || list.loading} onClick={() => setDialog({ kind: 'unhide', item: { review } })}>
                          Hiện lại
                        </button>
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
        title={hide ? 'Ẩn đánh giá' : 'Hiện lại đánh giá'}
        message={dialog && `${hide ? 'Ẩn' : 'Hiện lại'} đánh giá của ${dialog.item.review.customerName}?`}
        requireReason={hide}
        maxLength={500}
        confirmText={hide ? 'Ẩn' : 'Hiện lại'}
        busy={busy}
        onConfirm={confirm}
        onCancel={() => setDialog(null)}
      />
    </section>
  )
}
