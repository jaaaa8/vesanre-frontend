import { Fragment, useEffect, useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { listAuditLogs } from '../../utils/api'
import { AUDIT_ENTITY_LABELS, auditActionLabel, fallbackPage } from '../../utils/adminRules'
import { formatDateTimeIn } from '../../utils/format'
import AsyncView from '../common/AsyncView'
import Pagination from '../common/Pagination'
import { useListParams } from './useListParams'

const EXTRA = [{ key: 'entityType', values: Object.keys(AUDIT_ENTITY_LABELS) }]

const Json = ({ data }) => (data == null ? <p>—</p> : <pre className="pv-json">{JSON.stringify(data, null, 2)}</pre>)

export default function AuditLog({ onLogout }) {
  // 'ALL' is the only status: it just lets the shared hook handle paging and the extra filter.
  const { params, setParams } = useListParams(['ALL'], EXTRA)
  const { entityType, page } = params
  const list = useApi(() => listAuditLogs({ entityType, page, size: 20 }), [entityType, page])
  const [open, setOpen] = useState(null)

  useEffect(() => {
    if (list.loading || !list.data) return
    const p = fallbackPage(page, list.data.items, list.data.totalPages)
    if (p !== null) setParams({ page: p })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.data, list.loading])

  return (
    <section className="pv-card">
      <div className="pv-card-head">
        <h2>Nhật ký</h2>
        <select aria-label="Loại đối tượng" value={entityType} onChange={(e) => setParams({ entityType: e.target.value })}>
          <option value="">Tất cả</option>
          {Object.entries(AUDIT_ENTITY_LABELS).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <AsyncView state={list} empty={list.data?.items.length === 0} emptyText="Chưa có nhật ký nào." onLogout={onLogout}>
        <div aria-busy={list.loading} className={list.loading ? 'pv-reloading' : undefined}>
          <div className="pv-table-wrap">
            <table className="pv-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Người thực hiện</th>
                  <th>Hành động</th>
                  <th>Đối tượng</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.data?.items.map((a) => (
                  <Fragment key={a.id}>
                    <tr>
                      <td>{formatDateTimeIn(a.createdAt, 'Asia/Ho_Chi_Minh')}</td>
                      <td>{a.actor?.displayName ?? 'Hệ thống'}</td>
                      <td>{auditActionLabel(a.action)}</td>
                      <td>
                        {AUDIT_ENTITY_LABELS[a.entityType] ?? a.entityType} · {a.entityId.slice(0, 8)}
                      </td>
                      <td>
                        <button type="button" className="ui-btn ghost" aria-expanded={open === a.id} onClick={() => setOpen(open === a.id ? null : a.id)}>
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                    {open === a.id && (
                      <tr>
                        <td colSpan={5}>
                          <div className="pv-grid two">
                            <div>
                              <strong>Trước</strong>
                              <Json data={a.beforeData} />
                            </div>
                            <div>
                              <strong>Sau</strong>
                              <Json data={a.afterData} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={list.data?.totalPages ?? 0} onChange={(p) => setParams({ page: p })} />
        </div>
      </AsyncView>
    </section>
  )
}
