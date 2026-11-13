export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  return (
    <nav className="ui-pagination" aria-label="Phân trang">
      <button type="button" className="ui-btn ghost" disabled={page <= 0} onClick={() => onChange(page - 1)}>
        ‹ Trước
      </button>
      <span>
        Trang {page + 1}/{totalPages}
      </span>
      <button type="button" className="ui-btn ghost" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>
        Sau ›
      </button>
    </nav>
  )
}
