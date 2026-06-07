import { useState, useEffect } from 'react'
import { useFeedback, FeedbackData } from '../hooks/useFeedback'
import './FeedbackForm.css'

interface Props {
  userId: string | null
  onClose: () => void
}

export default function FeedbackForm({ userId, onClose }: Props) {
  const { submitFeedback } = useFeedback()

  const [overall, setOverall] = useState<number>(0)
  const [usability, setUsability] = useState<number>(0)
  const [features, setFeatures] = useState<number>(0)
  const [design, setDesign] = useState<number>(0)
  const [willPay, setWillPay] = useState<'yes' | 'maybe' | 'no' | ''>('')
  const [priceRange, setPriceRange] = useState<'~300' | '~500' | '~1000' | '1000+' | ''>('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => onClose(), 3000)
      return () => clearTimeout(timer)
    }
  }, [submitted, onClose])

  const canSubmit = overall > 0 && willPay !== ''

  async function handleSubmit() {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    try {
      const data: FeedbackData = {
        userId,
        overall,
        usability: usability > 0 ? usability : null,
        features: features > 0 ? features : null,
        design: design > 0 ? design : null,
        willPay: willPay as 'yes' | 'maybe' | 'no',
        priceRange: (willPay === 'yes' || willPay === 'maybe') && priceRange !== ''
          ? priceRange as '~300' | '~500' | '~1000' | '1000+'
          : null,
        comment: comment.trim() !== '' ? comment.trim() : null,
        createdAt: Date.now(),
      }
      await submitFeedback(data)
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  function Stars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
      <div className="feedback-stars">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            className={`feedback-star${value >= n ? ' on' : ''}`}
            onClick={() => onChange(n)}
          >
            ★
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-content" style={{ position: 'relative' }}>
        <div className="modal-handle" />
        <button className="feedback-close-btn" onClick={onClose} aria-label="閉じる">×</button>

        {submitted ? (
          <div className="feedback-thanks">
            ありがとうございました！<br />フィードバックを受け取りました。
          </div>
        ) : (
          <>
            <h2 className="feedback-modal-title">フィードバック</h2>

            <div className="feedback-section">
              <span className="feedback-section-label">SheeshaMixを使ってみていかがでしたか？（必須）</span>
              <Stars value={overall} onChange={setOverall} />
            </div>

            <div className="feedback-section">
              <span className="feedback-section-label">使いやすさ（任意）</span>
              <Stars value={usability} onChange={setUsability} />
            </div>

            <div className="feedback-section">
              <span className="feedback-section-label">機能の充実度（任意）</span>
              <Stars value={features} onChange={setFeatures} />
            </div>

            <div className="feedback-section">
              <span className="feedback-section-label">デザイン（任意）</span>
              <Stars value={design} onChange={setDesign} />
            </div>

            <div className="feedback-section">
              <span className="feedback-section-label">今後、一部機能が有料になった場合、使いますか？（必須）</span>
              <div className="feedback-chips">
                {(['yes', 'maybe', 'no'] as const).map(v => (
                  <button
                    key={v}
                    type="button"
                    className={`feedback-chip${willPay === v ? ' selected' : ''}`}
                    onClick={() => setWillPay(v)}
                  >
                    {v === 'yes' ? '使う' : v === 'maybe' ? '内容次第で使う' : '使わない'}
                  </button>
                ))}
              </div>
            </div>

            {(willPay === 'yes' || willPay === 'maybe') && (
              <div className="feedback-section">
                <span className="feedback-section-label">払えそうな月額は？</span>
                <div className="feedback-chips">
                  {(['~300', '~500', '~1000', '1000+'] as const).map(v => (
                    <button
                      key={v}
                      type="button"
                      className={`feedback-chip${priceRange === v ? ' selected' : ''}`}
                      onClick={() => setPriceRange(v)}
                    >
                      {v === '~300' ? '〜300円' : v === '~500' ? '〜500円' : v === '~1000' ? '〜1000円' : '1000円以上'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="feedback-section">
              <span className="feedback-section-label">要望・改善点・感想など（任意）</span>
              <textarea
                className="feedback-textarea"
                maxLength={500}
                placeholder="どんなことでもお気軽にどうぞ"
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
              <p className="feedback-char-count">{comment.length} / 500</p>
            </div>

            <button
              className="btn-primary feedback-submit-btn"
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
            >
              {submitting ? '送信中...' : '送信する'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
