import { useState } from 'react'
import { toast } from 'react-toastify'
import { useApi } from '../../hooks/useApi'
import { listProviderReviews, replyReview } from '../../utils/api'
import { formatDate, formatStars } from '../../utils/format'
import AsyncView from '../common/AsyncView'
import Pagination from '../common/Pagination'

function ReplyForm({ reviewId, onReplied }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await replyReview(reviewId, text.trim())
      toast.success('Đã trả lời')
      onReplied()
    } catch (err) {
      toast.error(err.message)
      if (err.status === 409) onReplied()
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="pv-grid" onSubmit={submit}>
      <label className="ui-field">
        <span>Trả lời khách</span>
        <textarea rows={3} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <div className="ui-actions">
        <button type="submit" className="ui-btn primary" disabled={!text.trim() || busy}>
          Trả lời
        </button>
      </div>
    </form>
  )
}

export default function ShopReviews({ onLogout }) {
  const [page, setPage] = useState(0)
  const list = useApi(() => listProviderReviews({ page, size: 10 }), [page])

  return (
    <section className="pv-card">
      <h2>Đánh giá</h2>
      <AsyncView state={list} empty={list.data?.items.length === 0} emptyText="Chưa có đánh giá nào." onLogout={onLogout}>
        <div className="pv-reviews">
          {list.data?.items.map(({ review, venueName, bookingCode }) => (
            <article key={review.id} className="pv-review">
              <div className="pv-row">
                <span aria-label={`${review.rating} sao`}>{formatStars(review.rating)}</span>
                {review.status === 'HIDDEN' && <span className="ui-badge is-hidden">Đã bị admin ẩn</span>}
              </div>
              <p>{review.comment || '—'}</p>
              <p className="pv-muted">
                {review.customerName} · {venueName} · {bookingCode} · {formatDate(review.createdAt)}
              </p>
              {review.providerReply ? (
                <div className="pv-reply">
                  <p>Chủ sân trả lời: {review.providerReply}</p>
                  <p className="pv-muted">{formatDate(review.repliedAt)}</p>
                </div>
              ) : (
                <ReplyForm reviewId={review.id} onReplied={list.reload} />
              )}
            </article>
          ))}
        </div>
        <Pagination page={page} totalPages={list.data?.totalPages ?? 0} onChange={setPage} />
      </AsyncView>
    </section>
  )
}
