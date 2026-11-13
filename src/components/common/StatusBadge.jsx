const LABELS = {
  DRAFT: 'Nháp',
  PENDING_REVIEW: 'Chờ duyệt',
  PENDING: 'Chờ duyệt',
  ACTIVE: 'Hoạt động',
  REJECTED: 'Bị từ chối',
  SUSPENDED: 'Tạm ngưng',
  INACTIVE: 'Ngừng dùng',
  VERIFIED: 'Đã duyệt',
  APPROVED: 'Đã duyệt',
  CANCELLED: 'Đã hủy',
}

export default function StatusBadge({ status }) {
  return <span className={`ui-badge is-${String(status).toLowerCase()}`}>{LABELS[status] || status}</span>
}
