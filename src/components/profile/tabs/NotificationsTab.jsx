import { useState } from 'react'
import { useApi } from '../../../hooks/useApi'
import { listNotifications, markNotificationRead } from '../../../utils/api'
import { formatDateTimeIn } from '../../../utils/format'
import StatusTabs from '../../admin/StatusTabs'
import AsyncView from '../../common/AsyncView'
import EmptyState from '../../common/EmptyState'
import Pagination from '../../common/Pagination'
import '../../common/notificationBell.css'

const idle = () => Promise.resolve(null)
const FILTERS = [
  ['', 'Tất cả'],
  ['unread', 'Chưa đọc'],
]

export default function NotificationsTab({ active, onToast, onOpenBooking }) {
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(0)
  const list = useApi(
    active ? () => listNotifications({ unreadOnly: filter === 'unread' ? true : '', page, size: 10 }) : idle,
    [active, filter, page],
  )

  const openItem = async (n) => {
    if (!n.readAt) {
      try {
        await markNotificationRead(n.id)
        const readAt = new Date().toISOString()
        list.setData((d) => ({
          ...d,
          unreadCount: Math.max(0, d.unreadCount - 1),
          items: d.items.map((i) => (i.id === n.id ? { ...i, readAt } : i)),
        }))
      } catch (e) {
        onToast(e.message)
      }
    }
    if (n.bookingId) onOpenBooking(n.bookingId)
  }

  const changeFilter = (next) => {
    setFilter(next)
    setPage(0)
  }

  return (
    <section className={`panel${active ? ' active' : ''}`} id="panel-notifications">
      <div className="panel-head">
        <div>
          <span className="eyebrow dark">
            <i />
            Cập nhật
          </span>
          <h2>Thông báo</h2>
          <p>{list.data?.unreadCount ? `${list.data.unreadCount} thông báo chưa đọc.` : 'Cập nhật về lịch đặt và ví coin của bạn.'}</p>
        </div>
      </div>
      <StatusTabs options={FILTERS} value={filter} onChange={changeFilter} />
      <AsyncView state={list}>
        {list.data &&
          (list.data.items.length === 0 ? (
            <EmptyState text={filter ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'} />
          ) : (
            <>
              <ul className="booking-list nt-list">
                {list.data.items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      className={`notif-row nt-row${n.readAt ? '' : ' is-unread'}`}
                      onClick={() => openItem(n)}
                    >
                      <span className="notif-dot" aria-label={n.readAt ? undefined : 'Chưa đọc'} />
                      <span>
                        <b>{n.title}</b>
                        <br />
                        <small>{n.body}</small>
                        <br />
                        <small className="ui-muted">{formatDateTimeIn(n.createdAt, 'Asia/Ho_Chi_Minh')}</small>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <Pagination page={list.data.page} totalPages={list.data.totalPages} onChange={setPage} />
            </>
          ))}
      </AsyncView>
    </section>
  )
}
