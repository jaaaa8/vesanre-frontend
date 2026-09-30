export default function NotificationsTab({ active, notifs, onToggle }) {
  return (
    <section className={`panel${active ? ' active' : ''}`} id="panel-notifications">
      <div className="panel-head">
        <div>
          <span className="eyebrow dark">
            <i />
            Cập nhật
          </span>
          <h2>Thông báo</h2>
          <p>Chọn kênh bạn muốn nhận nhắc lịch và ưu đãi.</p>
        </div>
      </div>
      <div className="booking-list">
        {notifs.map((notif) => (
          <div className="notif-row" key={notif.id}>
            <span className="notif-dot" style={notif.dotActive ? undefined : { background: 'var(--ghost)' }} />
            <div>
              <b>{notif.title}</b>
              <br />
              <small style={{ color: 'var(--ink-soft)' }}>{notif.desc}</small>
            </div>
            <button
              type="button"
              className={`switch${notif.on ? ' on' : ''}`}
              aria-label={notif.label}
              onClick={() => onToggle(notif.id)}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
