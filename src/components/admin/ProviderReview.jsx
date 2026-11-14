import { Fragment, useEffect, useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { approveProvider, listAdminProviders, rejectProvider } from '../../utils/api'
import { fallbackPage, parseDocuments } from '../../utils/adminRules'
import { formatDate } from '../../utils/format'
import AsyncView from '../common/AsyncView'
import ConfirmDialog from '../common/ConfirmDialog'
import Pagination from '../common/Pagination'
import StatusBadge from '../common/StatusBadge'
import StatusTabs from './StatusTabs'
import { useAdminAction } from './useAdminAction'
import { useListParams } from './useListParams'

const TABS = [
  ['PENDING', 'Chờ duyệt'],
  ['VERIFIED', 'Đã duyệt'],
  ['REJECTED', 'Bị từ chối'],
  ['SUSPENDED', 'Tạm ngưng'],
]

export default function ProviderReview({ onLogout }) {
  const { params, setParams } = useListParams(TABS.map(([k]) => k))
  const { status, page } = params
  const list = useApi(() => listAdminProviders({ status, page, size: 20 }), [status, page])
  const { busy, run } = useAdminAction(list.reload)
  const [open, setOpen] = useState(null)
  const [dialog, setDialog] = useState(null) // { kind: 'approve' | 'reject', item }

  useEffect(() => {
    if (list.loading || !list.data) return
    const p = fallbackPage(page, list.data.items, list.data.totalPages)
    if (p !== null) setParams({ page: p })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.data, list.loading])

  const confirm = async (reason) => {
    const { kind, item } = dialog
    if (kind === 'approve') await run(() => approveProvider(item.userId), 'Đã duyệt chủ sân')
    else await run(() => rejectProvider(item.userId, reason), 'Đã từ chối chủ sân')
    setDialog(null)
  }

  return (
    <section className="pv-card">
      <h2>Chủ sân</h2>
      <StatusTabs options={TABS} value={status} onChange={(s) => setParams({ status: s })} />
      <AsyncView state={list} empty={list.data?.items.length === 0} emptyText="Không có chủ sân nào ở trạng thái này." onLogout={onLogout}>
        <div className="pv-table-wrap">
          <table className="pv-table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Email</th>
                <th>SĐT</th>
                <th>Pháp nhân</th>
                <th>MST</th>
                <th>Ngày gửi</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.data?.items.map((p) => (
                <Fragment key={p.userId}>
                  <tr>
                    <td>{p.displayName}</td>
                    <td>{p.email}</td>
                    <td>{p.phone || '—'}</td>
                    <td>{p.legalName}</td>
                    <td>{p.taxId || '—'}</td>
                    <td>{formatDate(p.createdAt)}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>
                      <div className="pv-row">
                        <button type="button" className="ui-btn ghost" aria-expanded={open === p.userId} onClick={() => setOpen(open === p.userId ? null : p.userId)}>
                          Chi tiết
                        </button>
                        {p.status === 'PENDING' && (
                          <>
                            <button type="button" className="ui-btn primary" disabled={busy} onClick={() => setDialog({ kind: 'approve', item: p })}>
                              Duyệt
                            </button>
                            <button type="button" className="ui-btn" disabled={busy} onClick={() => setDialog({ kind: 'reject', item: p })}>
                              Từ chối
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  {open === p.userId && (
                    <tr>
                      <td colSpan={8}>
                        <ProviderExtra provider={p} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={list.data?.totalPages ?? 0} onChange={(p) => setParams({ page: p })} />
      </AsyncView>
      <ConfirmDialog
        open={Boolean(dialog)}
        title={dialog?.kind === 'reject' ? 'Từ chối chủ sân' : 'Duyệt chủ sân'}
        message={dialog?.kind === 'reject' ? `Từ chối ${dialog.item.displayName}?` : dialog && `Duyệt ${dialog.item.displayName} làm chủ sân?`}
        requireReason={dialog?.kind === 'reject'}
        confirmText={dialog?.kind === 'reject' ? 'Từ chối' : 'Duyệt'}
        busy={busy}
        onConfirm={confirm}
        onCancel={() => setDialog(null)}
      />
    </section>
  )
}

function ProviderExtra({ provider }) {
  const documents = parseDocuments(provider.verification?.documents)
  return (
    <div className="pv-grid">
      <div>
        <strong>Shop: </strong>
        {provider.shop ? (
          <>
            {provider.shop.name} <StatusBadge status={provider.shop.status} />
          </>
        ) : (
          'Chưa có shop'
        )}
      </div>
      <div>
        <strong>Giấy tờ: </strong>
        {documents.length === 0 ? (
          'Chưa có giấy tờ'
        ) : (
          <ul>
            {documents.map((d, i) => (
              <li key={i}>{JSON.stringify(d)}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
