import { Link } from 'react-router-dom'
import { useUnreadCount } from '../../hooks/useUnreadCount'
import './notificationBell.css'

export default function NotificationBell() {
  const count = useUnreadCount()
  if (count === null) return null
  return (
    <Link
      to="/tai-khoan#notifications"
      className="nt-bell"
      aria-label={count > 0 ? `Thông báo, ${count} chưa đọc` : 'Thông báo'}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z" />
        <path d="M10 20a2 2 0 0 0 4 0" />
      </svg>
      {count > 0 && <span className="nt-bell-count">{count > 99 ? '99+' : count}</span>}
    </Link>
  )
}
