import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { listAdminVenues } from '../../utils/api'
import { fallbackPage } from '../../utils/adminRules'
import { formatDate } from '../../utils/format'
import AsyncView from '../common/AsyncView'
import Pagination from '../common/Pagination'
import StatusBadge from '../common/StatusBadge'
import StatusTabs from './StatusTabs'
import { useListParams } from './useListParams'

const TABS = [
  ['PENDING_REVIEW', 'Chờ duyệt'],
  ['ACTIVE', 'Hoạt động'],
  ['SUSPENDED', 'Tạm ngưng'],
  ['REJECTED', 'Bị từ chối'],
  ['DRAFT', 'Nháp'],
]

export default function VenueReview({ onLogout }) {
  const { params, setParams } = useListParams(TABS.map(([k]) => k))
  const { status, page } = params
  const list = useApi(() => listAdminVenues({ status, page, size: 20 }), [status, page])

  useEffect(() => {
    if (list.loading || !list.data) return
    const p = fallbackPage(page, list.data.items, list.data.totalPages)
    if (p !== null) setParams({ page: p })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.data, list.loading])

  return (
    <section className="pv-card">
      <h2>Cơ sở</h2>
      <StatusTabs options={TABS} value={status} onChange={(s) => setParams({ status: s })} />
      <AsyncView state={list} empty={list.data?.items.length === 0} emptyText="Không có cơ sở nào ở trạng thái này." onLogout={onLogout}>
        <div aria-busy={list.loading} className={list.loading ? 'pv-reloading' : undefined}>
        <div className="pv-table-wrap">
          <table className="pv-table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Shop</th>
                <th>Địa chỉ</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {list.data?.items.map((v) => (
                <tr key={v.id}>
                  <td>
                    <Link to={`/admin/venues/${v.id}`}>{v.name}</Link>
                  </td>
                  <td>{v.shopName}</td>
                  <td>{[v.addressLine, v.district, v.city].filter(Boolean).join(', ')}</td>
                  <td>{formatDate(v.createdAt)}</td>
                  <td>
                    <StatusBadge status={v.status} />
                  </td>
                </tr>
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
