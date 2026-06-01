import type { StoreTable } from '../types'
import './TableCard.css'

function fmtElapsed(ms: number): string {
  const m = Math.floor(ms / 60000)
  const h = Math.floor(m / 60)
  return h > 0 ? `${h}h${m % 60}m` : `${m}分`
}

function coalCountdown(table: StoreTable): string {
  const remaining = table.coalInterval * 60000 - (Date.now() - table.lastCoalChange)
  if (remaining <= 0) {
    return `${Math.ceil(-remaining / 60000)}分超過`
  }
  const m = Math.floor(remaining / 60000)
  const s = Math.floor((remaining % 60000) / 1000)
  return `${m}:${String(s).padStart(2, '0')}`
}

interface Props {
  table: StoreTable
  selected: boolean
  onClick: () => void
  onEdit: () => void
}

export default function TableCard({ table, selected, onClick, onEdit }: Props) {
  const isActive = table.status !== 'empty'

  return (
    <div
      className={`table-card table-card--${table.status}${selected ? ' table-card--selected' : ''}`}
      onClick={onClick}
    >
      <div className="table-card-header">
        <span className="table-card-label">{table.label}</span>
        <div className="table-card-header-right">
          {isActive && <span className={`table-status-dot status-dot--${table.status}`} />}
          <button
            className="table-card-edit-btn"
            onClick={(e) => { e.stopPropagation(); onEdit() }}
            title="設定"
          >
            ⋮
          </button>
        </div>
      </div>

      {isActive ? (
        <div className="table-card-body">
          <div className="table-card-row">
            <span className="table-card-count">{table.customerCount}名</span>
            <span className={`table-card-status-badge status-badge--${table.status}`}>
              {table.status === 'overdue' ? '🔴 炭交換してください' : table.status === 'warning' ? '⚠️ もうすぐ炭替え' : '使用中'}
            </span>
          </div>
          <div className="table-card-coal">
            炭交換まで <strong className={`coal-time--${table.status}`}>{coalCountdown(table)}</strong>
          </div>
          {table.recipeName && (
            <div className="table-card-recipe">🍃 {table.recipeName}</div>
          )}
          <div className="table-card-elapsed">
            経過: {fmtElapsed(Date.now() - table.startTime)}
          </div>
        </div>
      ) : (
        <div className="table-card-empty">
          <p className="table-card-empty-label">空席</p>
          <p className="table-card-empty-hint">タップして開始</p>
        </div>
      )}
    </div>
  )
}
