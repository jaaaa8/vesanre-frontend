import { Link } from 'react-router-dom'
import { TABS } from './profileUtils'

export default function ProfileSidebar({ displayName, initials, contact, sideId, activeTab, onTabChange, children }) {
  return (
    <aside className="side">
      <div className="user-card">
        <div className="user-top">
          <span className="uavatar" id="sideAvatar">
            {initials}
          </span>
          <div>
            <b id="sideName">{displayName}</b>
            <small id="sideId">{sideId}</small>
          </div>
        </div>
        <span className="contact-badge" id="sideContact">
          {contact}
        </span>
        <div className="rank-row">
          <span>🏅 Hạng thành viên</span>
          <span className="rank">Silver</span>
        </div>
      </div>
      {children}
      <nav className="tabnav" id="tabNav" aria-label="Điều hướng hồ sơ">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
            data-tab={tab.id}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="ico">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
      <Link to="/" className="ghost-btn" style={{ justifyContent: 'center', textDecoration: 'none' }}>
        ← Về trang chủ
      </Link>
    </aside>
  )
}
