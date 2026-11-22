import { useState } from 'react'
import { toast } from 'react-toastify'
import { useApi } from '../../hooks/useApi'
import { listVenueReviews } from '../../utils/api'
import { formatDate, formatStars } from '../../utils/format'
import AsyncView from '../common/AsyncView'

const SIZE = 5

export default function VenueReviews({ venueId }) {
  const first = useApi(() => listVenueReviews(venueId, { page: 0, size: SIZE }), [venueId])
  const [more, setMore] = useState(null) // { items, page, totalPages } of pages loaded via "Xem thêm"
  const [loadingMore, setLoadingMore] = useState(false)

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const next = await listVenueReviews(venueId, { page: (more?.page ?? first.data.page) + 1, size: SIZE })
      setMore((prev) => ({ items: [...(prev?.items ?? []), ...next.items], page: next.page, totalPages: next.totalPages }))
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoadingMore(false)
    }
  }

  // A review posted between two loads shifts older ones onto the next page, hence the dedupe by id.
  const seen = new Set()
  const items = [...(first.data?.items ?? []), ...(more?.items ?? [])].filter((r) => !seen.has(r.id) && seen.add(r.id))
  const page = more?.page ?? first.data?.page ?? 0
  const totalPages = more?.totalPages ?? first.data?.totalPages ?? 0

  return (
    <section className="pub-reviews">
      <h2>Đánh giá</h2>
      <AsyncView state={first} empty={first.data?.items.length === 0} emptyText="Chưa có đánh giá">
        <ul className="pub-review-list">
          {items.map((r) => (
            <li key={r.id} className="pub-review">
              <p>
                <span aria-label={`${r.rating} sao`}>{formatStars(r.rating)}</span> <b>{r.customerName}</b>{' '}
                <span className="pub-muted">{formatDate(r.createdAt)}</span>
              </p>
              {r.comment && <p>{r.comment}</p>}
              {r.providerReply && <p className="pub-reply">Chủ sân trả lời: {r.providerReply}</p>}
            </li>
          ))}
        </ul>
        {page + 1 < totalPages && (
          <button type="button" className="ui-btn" disabled={loadingMore} onClick={loadMore}>
            {loadingMore ? 'Đang tải…' : 'Xem thêm'}
          </button>
        )}
      </AsyncView>
    </section>
  )
}
