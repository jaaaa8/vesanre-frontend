import EmptyState from './EmptyState'

export default function AsyncView({ state, empty, emptyText = 'Chưa có dữ liệu', onRetry, onLogout, children }) {
  if (state.loading && !state.data) return <p className="ui-muted" role="status">Đang tải…</p>
  if (state.error) {
    if (state.error.status === 403) {
      return (
        <div className="ui-error" role="alert">
          <p>Bạn không có quyền, hãy đăng nhập lại.</p>
          {onLogout && (
            <button type="button" className="ui-btn" onClick={onLogout}>
              Đăng xuất
            </button>
          )}
        </div>
      )
    }
    return (
      <div className="ui-error" role="alert">
        <p>{state.error.message || 'Không thể tải dữ liệu.'}</p>
        <button type="button" className="ui-btn" onClick={onRetry || state.reload}>
          Thử lại
        </button>
      </div>
    )
  }
  if (empty) return <EmptyState text={emptyText} />
  return children
}
