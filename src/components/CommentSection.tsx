import { useState } from 'react'
import { useComments, useRatings } from '../hooks/useComments'
import './CommentSection.css'

function Stars({
  value, max = 5, interactive = false, onChange,
}: {
  value: number; max?: number; interactive?: boolean; onChange?: (n: number) => void
}) {
  const [hover, setHover] = useState(0)
  const display = interactive ? (hover || value) : value
  return (
    <div className={`stars${interactive ? ' interactive' : ''}`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`star${i < display ? ' on' : ''}`}
          onClick={() => interactive && onChange?.(i + 1)}
          onMouseEnter={() => interactive && setHover(i + 1)}
          onMouseLeave={() => interactive && setHover(0)}
        >★</span>
      ))}
    </div>
  )
}

function fmtDate(ts: number) {
  const d = new Date(ts)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

interface Props {
  recipeId: string
  userId?: string
  userName?: string
}

export default function CommentSection({ recipeId, userId, userName }: Props) {
  const { comments, loading, addComment, deleteComment } = useComments(recipeId)
  const { ratingMap, average, count, submitRating } = useRatings(recipeId)
  const [text, setText] = useState('')
  const [rating, setRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const myRating = userId ? (ratingMap[userId] ?? 0) : 0

  const handleSubmit = async () => {
    if (!userId || !userName || !text.trim() || rating < 1) return
    setSubmitting(true)
    try {
      await addComment(userId, userName, text, rating)
      if (rating !== myRating) await submitRating(userId, rating)
      setText('')
      setRating(0)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="comment-section">
      <div className="comment-divider" />

      {/* Rating summary */}
      <div className="comment-rating-summary">
        <div className="comment-rating-avg">
          <Stars value={Math.round(average)} />
          <span className="comment-rating-num">{average > 0 ? average.toFixed(1) : '-'}</span>
        </div>
        <span className="comment-rating-count">{count > 0 ? `${count}件の評価` : '評価なし'}</span>
      </div>

      {/* Post form */}
      {userId ? (
        <div className="comment-form">
          <div className="comment-form-stars-row">
            <span className="comment-form-label">評価</span>
            <Stars value={rating} interactive onChange={setRating} />
            {myRating > 0 && <span className="comment-my-rating">あなたの評価: {myRating}★</span>}
          </div>
          <textarea
            className="comment-textarea"
            placeholder="コメントを入力（最大200文字）"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 200))}
            rows={3}
          />
          <div className="comment-form-footer">
            <span className="comment-char-count">{text.length}/200</span>
            <button
              className="btn-primary comment-submit-btn"
              onClick={handleSubmit}
              disabled={submitting || !text.trim() || rating < 1}
            >
              {submitting ? '投稿中...' : '投稿する'}
            </button>
          </div>
        </div>
      ) : (
        <p className="comment-login-prompt">コメント・評価するにはログインが必要です</p>
      )}

      {/* Comment list */}
      <h4 className="comment-list-title">コメント ({loading ? '…' : comments.length})</h4>
      <div className="comment-list">
        {loading ? (
          <p className="comment-loading">読み込み中...</p>
        ) : comments.length === 0 ? (
          <p className="comment-empty">まだコメントがありません</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="comment-item">
              <div className="comment-item-header">
                <span className="comment-author">{c.authorName}</span>
                <Stars value={c.rating} />
                <span className="comment-date">{fmtDate(c.createdAt)}</span>
                {userId === c.userId && (
                  <button className="comment-delete" onClick={() => deleteComment(c.id)} title="削除">✕</button>
                )}
              </div>
              <p className="comment-text">{c.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
