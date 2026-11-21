import { useEffect, useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { listAdminUsers, reactivateUser, suspendUser } from '../../utils/api'
import { canReactivate, canSuspend, fallbackPage, ROLE_LABELS, USER_STATUS_LABELS } from '../../utils/adminRules'
import { formatDate } from '../../utils/format'
import AsyncView from '../common/AsyncView'
import ConfirmDialog from '../common/ConfirmDialog'
import Pagination from '../common/Pagination'
import StatusTabs from './StatusTabs'
import { useAdminAction } from './useAdminAction'
import { useListParams } from './useListParams'

const TABS = [
  ['ALL', 'Tất cả'],
  ['ACTIVE', 'Hoạt động'],
  ['SUSPENDED', 'Bị khóa'],
  ['DEACTIVATED', 'Vô hiệu'],
]
const STATUSES = TABS.map(([k]) => k)
const EXTRA = [
  { key: 'role', values: Object.keys(ROLE_LABELS) },
  { key: 'q', test: (v) => v.length <= 100 },
]

// Keyed by the URL q, so it resets itself when q changes without a set-state effect.
function SearchForm({ initial, onSubmit }) {
  const [text, setText] = useState(initial)
  return (
    <form
      className="pv-row"
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(text.trim())
      }}
    >
      <input type="search" aria-label="Tìm theo email hoặc tên" placeholder="Email hoặc tên" maxLength={100} value={text} onChange={(e) => setText(e.target.value)} />
      <button type="submit" className="ui-btn">
        Tìm
      </button>
    </form>
  )
}

export default function UserAdmin({ onLogout }) {
  const { params, setParams } = useListParams(STATUSES, EXTRA)
  const { status, role, q, page } = params
  const list = useApi(() => listAdminUsers({ q, role, status: status === 'ALL' ? '' : status, page, size: 20 }), [q, role, status, page])
  const { busy, run } = useAdminAction(list.reload)
  const [dialog, setDialog] = useState(null) // { kind: 'suspend' | 'reactivate', item }

  useEffect(() => {
    if (list.loading || !list.data) return
    const p = fallbackPage(page, list.data.items, list.data.totalPages)
    if (p !== null) setParams({ page: p })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.data, list.loading])

  const confirm = async (reason) => {
    const { kind, item } = dialog
    if (kind === 'suspend') await run(() => suspendUser(item.id, reason), 'Đã khóa người dùng')
    else await run(() => reactivateUser(item.id), 'Đã mở khóa người dùng')
    setDialog(null)
  }

  const suspend = dialog?.kind === 'suspend'

  return (
    <section className="pv-card">
      <div className="pv-card-head">
        <h2>Người dùng</h2>
        <div className="pv-row">
          <SearchForm key={q} initial={q} onSubmit={(text) => setParams({ q: text })} />
          <select aria-label="Vai trò" value={role} onChange={(e) => setParams({ role: e.target.value })}>
            <option value="">Tất cả vai trò</option>
            {Object.entries(ROLE_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <StatusTabs options={TABS} value={status} onChange={(s) => setParams({ status: s })} />
      <AsyncView state={list} empty={list.data?.items.length === 0} emptyText="Không có người dùng nào." onLogout={onLogout}>
        <div aria-busy={list.loading} className={list.loading ? 'pv-reloading' : undefined}>
          <div className="pv-table-wrap">
            <table className="pv-table">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>SĐT</th>
                  <th>Vai trò</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.data?.items.map((u) => (
                  <tr key={u.id}>
                    <td>{u.displayName}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td>{u.roles.map((r) => ROLE_LABELS[r] ?? r).join(', ')}</td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>
                      <span className={`ui-badge is-${u.status.toLowerCase()}`}>{USER_STATUS_LABELS[u.status] ?? u.status}</span>
                    </td>
                    <td>
                      {canSuspend(u) && (
                        <button type="button" className="ui-btn" disabled={busy || list.loading} onClick={() => setDialog({ kind: 'suspend', item: u })}>
                          Khóa
                        </button>
                      )}
                      {canReactivate(u) && (
                        <button type="button" className="ui-btn" disabled={busy || list.loading} onClick={() => setDialog({ kind: 'reactivate', item: u })}>
                          Mở khóa
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
        title={suspend ? 'Khóa người dùng' : 'Mở khóa người dùng'}
        message={
          dialog &&
          (suspend
            ? `Khóa ${dialog.item.displayName}? Người dùng sẽ không đăng nhập được; phiên đang mở vẫn dùng được đến khi hết hạn.`
            : `Mở khóa ${dialog.item.displayName}?`)
        }
        requireReason={suspend}
        maxLength={500}
        confirmText={suspend ? 'Khóa' : 'Mở khóa'}
        busy={busy}
        onConfirm={confirm}
        onCancel={() => setDialog(null)}
      />
    </section>
  )
}
