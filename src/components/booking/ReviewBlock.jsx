import { useState } from 'react'
import { createReview } from '../../utils/api'
import { validReviewComment } from '../../utils/auth'
import { canReview } from '../../utils/bookingRules'
import { formatStars } from '../../utils/format'
import './booking.css'

export default function ReviewBlock({ booking, onSubmitted, onToast }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const review = booking.review

  const submit = async (e) => {
    e.preventDefault()
    if (!validReviewComment(comment)) return onToast('Bình luận 10–500 ký tự và không chỉ lặp một ký tự.')
    setBusy(true)
    try {
      await createReview(booking.id, { rating, comment: comment.trim() || undefined })
      onToast('Đã gửi đánh giá')
      onSubmitted()
    } catch (err) {
      onToast(err.message)
      if (err.status === 409) onSubmitted()
    } finally {
      setBusy(false)
    }
  }

  if (canReview(booking)) {
    return (
      <form className="bk-review" onSubmit={submit}>
        <h4>Đánh giá trận này</h4>
        <div className="bk-stars">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" aria-label={`${n} sao`} aria-pressed={rating === n} onClick={() => setRating(n)}>
              {n <= rating ? '★' : '☆'}
            </button>
          ))}
        </div>
        <label className="ui-field">
          <span>Bình luận (không bắt buộc)</span>
          <textarea rows={3} maxLength={500} value={comment} onChange={(e) => setComment(e.target.value)} />
          <small className="bk-count">{comment.length}/500</small>
        </label>
        <div className="ui-actions">
          <button type="submit" className="ui-btn primary" disabled={!rating || busy}>
            Gửi
          </button>
        </div>
      </form>
    )
  }

  if (!review) return null

  return (
    <section className="bk-review">
      <h4>Đánh giá của bạn</h4>
      <span aria-label={`${review.rating} sao`}>{formatStars(review.rating)}</span>
      {review.comment && <p>{review.comment}</p>}
      {review.providerReply && <p className="bk-reply">Chủ sân trả lời: {review.providerReply}</p>}
      {review.status === 'HIDDEN' && <p className="bk-count">Đánh giá này đã bị ẩn khỏi trang sân</p>}
    </section>
  )
}
