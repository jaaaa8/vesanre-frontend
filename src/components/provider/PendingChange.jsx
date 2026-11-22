import { formatDate } from '../../utils/format'

export default function PendingChange({ change, labels, onCancel, busy }) {
  return (
    <div className="pv-pending">
      <b>Yêu cầu thay đổi đang chờ admin duyệt</b>
      <dl>
        {Object.entries(change.proposed || {}).map(([key, value]) => (
          <div key={key} style={{ display: 'contents' }}>
            <dt>{labels[key] || key}</dt>
            <dd>{value === '' || value == null ? '(để trống)' : String(value)}</dd>
          </div>
        ))}
      </dl>
      <div className="pv-row">
        <span className="pv-muted">Gửi ngày {formatDate(change.createdAt)}</span>
        <button type="button" className="ui-btn danger" onClick={onCancel} disabled={busy}>
          Hủy yêu cầu
        </button>
      </div>
    </div>
  )
}
