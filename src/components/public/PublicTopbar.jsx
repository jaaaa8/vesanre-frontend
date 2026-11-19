import { Link } from 'react-router-dom'
import { getSession } from '../../utils/auth'
import Brand from '../Brand'
import NotificationBell from '../common/NotificationBell'

export default function PublicTopbar() {
  return (
    <header className="pub-top">
      <Brand />
      <span className="pub-top-actions">
        {getSession() && <NotificationBell />}
        <Link to="/san">Tìm sân</Link>
      </span>
    </header>
  )
}
