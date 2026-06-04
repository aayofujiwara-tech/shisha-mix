import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useDiary } from '../hooks/useDiary'
import type { DiaryEntry } from '../types'
import SessionCalendar from '../components/SessionCalendar'
import DiaryCard from '../components/DiaryCard'
import DiaryForm from '../components/DiaryForm'
import './DiaryPage.css'

interface Prefill {
  recipeName?: string
  duration?: number
  coalCount?: number
}

interface LocationState {
  prefill?: Prefill
}

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}分`
  return m === 0 ? `${h}時間` : `${h}時間${m}分`
}

function topName(entries: DiaryEntry[]): string {
  const count: Record<string, number> = {}
  for (const e of entries) {
    if (e.recipeName) {
      count[e.recipeName] = (count[e.recipeName] ?? 0) + 1
    }
    if (e.flavors) {
      for (const f of e.flavors) {
        count[f.name] = (count[f.name] ?? 0) + 0.5
      }
    }
  }
  const top = Object.entries(count).sort((a, b) => b[1] - a[1])[0]
  return top ? top[0] : '—'
}

export default function DiaryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as LocationState | null
  const prefill = locationState?.prefill

  const { entries, loading, deleteEntry } = useDiary(user?.uid ?? null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [statsYear, setStatsYear] = useState(new Date().getFullYear())
  const [statsMonth, setStatsMonth] = useState(new Date().getMonth())
  const [showForm, setShowForm] = useState(false)
  const [editEntry, setEditEntry] = useState<DiaryEntry | undefined>(undefined)
  const [formPrefill, setFormPrefill] = useState<Prefill | undefined>(undefined)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    if (prefill) {
      setFormPrefill(prefill)
      setShowForm(true)
      window.history.replaceState({}, '')
    }
  }, [prefill])

  if (!user) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-icon">🔒</div>
          <p className="empty-state-text">日記にはログインが必要です</p>
          <button
            className="btn-primary"
            style={{ marginTop: 20, width: 'auto', padding: '12px 32px' }}
            onClick={() => navigate('/login')}
          >
            ログイン
          </button>
        </div>
      </div>
    )
  }

  const monthPrefix = `${statsYear}-${String(statsMonth + 1).padStart(2, '0')}`
  const monthEntries = entries.filter((e) => e.date.startsWith(monthPrefix))

  const totalDuration = monthEntries.reduce((s, e) => s + e.sessionDuration, 0)
  const avgRating = monthEntries.length > 0
    ? (monthEntries.reduce((s, e) => s + e.rating, 0) / monthEntries.length).toFixed(1)
    : '—'

  const selectedEntries = selectedDate
    ? entries.filter((e) => e.date === selectedDate)
    : []

  const openNewForm = () => {
    setEditEntry(undefined)
    setFormPrefill(undefined)
    setShowForm(true)
  }

  const openEditForm = (entry: DiaryEntry) => {
    setEditEntry(entry)
    setFormPrefill(undefined)
    setShowForm(true)
  }

  const handleFormSaved = () => {
    setShowForm(false)
    setEditEntry(undefined)
    setFormPrefill(undefined)
  }

  const handleDelete = async (id: string) => {
    await deleteEntry(id)
    setConfirmDeleteId(null)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">📔 日記</h1>
        <button className="dp-add-btn" onClick={openNewForm}>＋ 記録する</button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" />読み込み中...</div>
      ) : (
        <>
          <div className="diary-pc-layout">
          <div className="diary-pc-left">
          <SessionCalendar
            entries={entries}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onMonthChange={(y, m) => { setStatsYear(y); setStatsMonth(m) }}
          />
          </div>
          <div className="diary-pc-right">

          {/* Stats */}
          <div className="dp-stats">
            <div className="dp-stat-card">
              <span className="dp-stat-value">{monthEntries.length}</span>
              <span className="dp-stat-label">{statsMonth + 1}月のセッション</span>
            </div>
            <div className="dp-stat-card">
              <span className="dp-stat-value dp-stat-value--sm">
                {monthEntries.length > 0 ? formatMinutes(totalDuration) : '—'}
              </span>
              <span className="dp-stat-label">{statsMonth + 1}月の合計時間</span>
            </div>
            <div className="dp-stat-card">
              <span className="dp-stat-value dp-stat-value--sm dp-stat-value--ellipsis">
                {topName(monthEntries)}
              </span>
              <span className="dp-stat-label">よく使ったレシピ</span>
            </div>
            <div className="dp-stat-card">
              <span className="dp-stat-value">{avgRating}</span>
              <span className="dp-stat-label">平均評価</span>
            </div>
          </div>

          {/* Entry list */}
          {selectedDate ? (
            <div className="dp-entries">
              <div className="dp-entries-header">
                <span className="dp-entries-date">{selectedDate.replace(/-/g, '/')}</span>
                <button className="dp-clear-btn" onClick={() => setSelectedDate(null)}>✕ 選択解除</button>
              </div>
              {selectedEntries.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📭</div>
                  <p className="empty-state-text">この日の記録はありません</p>
                  <button
                    className="btn-secondary"
                    style={{ marginTop: 16, width: 'auto', padding: '10px 24px' }}
                    onClick={openNewForm}
                  >
                    ＋ 記録する
                  </button>
                </div>
              ) : (
                selectedEntries.map((entry) => (
                  <DiaryCard
                    key={entry.id}
                    entry={entry}
                    onEdit={() => openEditForm(entry)}
                    onDelete={() => setConfirmDeleteId(entry.id)}
                  />
                ))
              )}
            </div>
          ) : entries.length > 0 ? (
            <div className="dp-recent">
              <p className="section-label">最近の記録</p>
              {entries.slice(0, 5).map((entry) => (
                <DiaryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={() => openEditForm(entry)}
                  onDelete={() => setConfirmDeleteId(entry.id)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📔</div>
              <p className="empty-state-text">まだ記録がありません<br />「＋ 記録する」から最初の記録を追加しましょう</p>
            </div>
          )}
          </div>{/* diary-pc-right */}
          </div>{/* diary-pc-layout */}
        </>
      )}

      {/* Diary form modal */}
      {showForm && (
        <DiaryForm
          userId={user.uid}
          onClose={() => { setShowForm(false); setEditEntry(undefined); setFormPrefill(undefined) }}
          onSaved={handleFormSaved}
          entry={editEntry}
          prefill={formPrefill}
        />
      )}

      {/* Delete confirm */}
      {confirmDeleteId && (
        <div className="modal-overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="modal-content dp-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 className="dp-confirm-title">記録を削除しますか？</h3>
            <p className="dp-confirm-body">この操作は取り消せません。</p>
            <div className="dp-confirm-actions">
              <button className="btn-ghost" onClick={() => setConfirmDeleteId(null)}>キャンセル</button>
              <button className="btn-danger dp-delete-btn" onClick={() => handleDelete(confirmDeleteId)}>
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
