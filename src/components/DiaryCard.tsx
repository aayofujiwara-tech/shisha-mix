import type { DiaryEntry } from '../types'
import './DiaryCard.css'

interface Props {
  entry: DiaryEntry
  onEdit: () => void
  onDelete: () => void
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="dc-stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? 'dc-star filled' : 'dc-star'}>★</span>
      ))}
    </span>
  )
}

export default function DiaryCard({ entry, onEdit, onDelete }: Props) {
  return (
    <div className="dc-card card">
      <div className="dc-header">
        <div className="dc-title-row">
          <span className="dc-recipe">{entry.recipeName || '記録'}</span>
          <Stars rating={entry.rating} />
        </div>
        <div className="dc-actions">
          <button className="dc-action-btn" onClick={onEdit} title="編集">✏️</button>
          <button className="dc-action-btn dc-delete-btn" onClick={onDelete} title="削除">🗑</button>
        </div>
      </div>

      <div className="dc-meta">
        <span className="dc-meta-item">⏱ {entry.sessionDuration}分</span>
        <span className="dc-sep">·</span>
        <span className="dc-meta-item">🪨 炭{entry.coalCount}個</span>
        {entry.mood.length > 0 && (
          <>
            <span className="dc-sep">·</span>
            <span className="dc-meta-item">{entry.mood.join(' / ')}</span>
          </>
        )}
      </div>

      {entry.memo && (
        <p className="dc-memo">{entry.memo}</p>
      )}

      {entry.photos.length > 0 && (
        <div className="dc-photos">
          {entry.photos.map((url, i) => (
            <img key={i} src={url} alt={`photo ${i + 1}`} className="dc-photo" />
          ))}
        </div>
      )}
    </div>
  )
}
