import { useState } from 'react'
import type { StoreTable, Recipe } from '../types'
import { presets } from '../data/presets'

interface SessionStartOpts {
  customerCount: number
  recipeId: string
  recipeName: string
  memo: string
  coalInterval: number
}

interface Props {
  table: StoreTable
  recipes: Recipe[]
  onClose: () => void
  onStartSession: (opts: SessionStartOpts) => Promise<void>
  onCoalChange: () => Promise<void>
  onEndSession: () => Promise<void>
  onUpdateMemo: (memo: string) => Promise<void>
  onEditTable: () => void
}

function fmt2(ms: number): string {
  if (ms <= 0) return '00:00'
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function fmtTime(ts: number): string {
  const d = new Date(ts)
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

function fmtElapsed(ms: number): string {
  const m = Math.floor(ms / 60000)
  const h = Math.floor(m / 60)
  return h > 0 ? `${h}時間${m % 60}分` : `${m}分`
}

export default function TableDetailPanel({
  table, recipes, onClose, onStartSession, onCoalChange, onEndSession, onUpdateMemo, onEditTable,
}: Props) {
  const [customerCount, setCustomerCount] = useState(table.customerCount || 1)
  const [recipeSearch, setRecipeSearch] = useState('')
  const [selectedRecipeId, setSelectedRecipeId] = useState(table.recipeId || '')
  const [selectedRecipeName, setSelectedRecipeName] = useState(table.recipeName || '')
  const [coalInterval, setCoalInterval] = useState(table.coalInterval || 20)
  const [formMemo, setFormMemo] = useState('')
  const [showDd, setShowDd] = useState(false)
  const [starting, setStarting] = useState(false)

  const [localMemo, setLocalMemo] = useState(table.memo || '')
  const [savingCoal, setSavingCoal] = useState(false)
  const [endConfirm, setEndConfirm] = useState(false)

  const isActive = table.status !== 'empty'
  const now = Date.now()
  const coalRemaining = table.coalInterval * 60000 - (now - table.lastCoalChange)
  const elapsed = now - table.startTime

  const allRecipes: Recipe[] = [...presets, ...recipes]
  const suggs = recipeSearch.trim()
    ? allRecipes
        .filter((r) => {
          const q = recipeSearch.toLowerCase()
          return (
            r.name.toLowerCase().includes(q) ||
            (r.flavors ?? []).some((f) => f.name.toLowerCase().includes(q))
          )
        })
        .slice(0, 5)
    : []

  const selectRecipe = (r: Recipe) => {
    setSelectedRecipeId(r.id)
    setSelectedRecipeName(r.name)
    setRecipeSearch('')
    setShowDd(false)
  }

  const clearRecipe = () => {
    setSelectedRecipeId('')
    setSelectedRecipeName('')
    setRecipeSearch('')
  }

  const handleStart = async () => {
    if (customerCount < 1) return
    setStarting(true)
    try {
      await onStartSession({
        customerCount,
        recipeId: selectedRecipeId,
        recipeName: selectedRecipeName,
        memo: formMemo,
        coalInterval,
      })
    } finally {
      setStarting(false)
    }
  }

  const handleCoalChange = async () => {
    setSavingCoal(true)
    try {
      await onCoalChange()
    } finally {
      setSavingCoal(false)
    }
  }

  const handleEnd = async () => {
    setEndConfirm(false)
    await onEndSession()
  }

  return (
    <div className="table-detail-overlay" onClick={onClose}>
      <div className="table-detail-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />

        <div className="table-detail-header">
          <h3 className="table-detail-title">{table.label}</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 13 }} onClick={onEditTable}>
              設定
            </button>
            <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 13 }} onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {!isActive ? (
          <div className="session-form">
            <div className="form-group">
              <label className="field-label">人数</label>
              <div className="count-stepper">
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => setCustomerCount((v) => Math.max(1, v - 1))}
                >−</button>
                <span className="stepper-val">{customerCount}名</span>
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => setCustomerCount((v) => Math.min(10, v + 1))}
                >＋</button>
              </div>
            </div>

            <div className="form-group">
              <label className="field-label">レシピ（任意）</label>
              {selectedRecipeId ? (
                <div className="recipe-selected-chip">
                  <span className="recipe-chip-name">🍃 {selectedRecipeName}</span>
                  <button type="button" className="recipe-chip-clear" onClick={clearRecipe}>✕</button>
                </div>
              ) : (
                <div className="recipe-search-wrap">
                  <input
                    type="text"
                    placeholder="🔍 レシピを検索..."
                    value={recipeSearch}
                    onChange={(e) => { setRecipeSearch(e.target.value); setShowDd(true) }}
                    onFocus={() => setShowDd(true)}
                    onBlur={() => setTimeout(() => setShowDd(false), 150)}
                    autoComplete="off"
                  />
                  {showDd && suggs.length > 0 && (
                    <div className="recipe-suggestions">
                      {suggs.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          className="recipe-suggestion-item"
                          onMouseDown={() => selectRecipe(r)}
                        >
                          <span className="rs-name">{r.name}</span>
                          <span className="rs-flavors">
                            {(r.flavors ?? []).slice(0, 3).map((f) => f.name).join(' · ')}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="field-label">炭交換間隔（分）</label>
              <input
                type="number"
                min={5}
                max={120}
                value={coalInterval}
                onChange={(e) => setCoalInterval(Math.max(5, Number(e.target.value)))}
              />
            </div>

            <div className="form-group">
              <label className="field-label">メモ</label>
              <textarea
                placeholder="メモを入力..."
                value={formMemo}
                onChange={(e) => setFormMemo(e.target.value)}
                rows={2}
              />
            </div>

            <button
              className="btn-primary"
              onClick={handleStart}
              disabled={starting}
              style={{ marginTop: 8 }}
            >
              {starting ? '開始中...' : 'セッション開始'}
            </button>
          </div>
        ) : (
          <div className="active-session">
            <div className="session-info-row">
              <span className="session-info-item">👥 {table.customerCount}名</span>
              <span className="session-info-item">開始 {fmtTime(table.startTime)}</span>
              <span className="session-info-item">経過 {fmtElapsed(elapsed)}</span>
            </div>

            <div className={`coal-countdown-block coal-countdown--${table.status}`}>
              <div className="coal-countdown-label">炭交換まで</div>
              <div className="coal-countdown-time">
                {coalRemaining > 0 ? fmt2(coalRemaining) : `${Math.ceil(-coalRemaining / 60000)}分超過`}
              </div>
              {table.status === 'warning' && (
                <div className="coal-countdown-sub">⚠️ もうすぐ炭替え時間です</div>
              )}
              {table.status === 'overdue' && (
                <div className="coal-countdown-sub">🔴 今すぐ炭交換してください！</div>
              )}
            </div>

            <button
              className={`coal-change-btn${savingCoal ? ' coal-change-btn--loading' : ''}`}
              onClick={handleCoalChange}
              disabled={savingCoal}
            >
              🔥 炭を交換した
            </button>

            {table.coalChangeCount > 0 && (
              <div className="coal-history">
                <p className="coal-history-title">炭交換履歴（{table.coalChangeCount}回）</p>
                {[...table.coalChangeHistory].reverse().slice(0, 5).map((h, i) => (
                  <div key={i} className="coal-history-item">
                    <span>{fmtTime(h.time)}</span>
                    <span className="coal-history-elapsed">{fmtElapsed(h.time - table.startTime)}目</span>
                  </div>
                ))}
              </div>
            )}

            {table.recipeName && (
              <div className="session-recipe">🍃 {table.recipeName}</div>
            )}

            <div className="form-group" style={{ marginTop: 12 }}>
              <label className="field-label">メモ</label>
              <textarea
                value={localMemo}
                onChange={(e) => setLocalMemo(e.target.value)}
                onBlur={() => onUpdateMemo(localMemo)}
                rows={2}
                placeholder="メモを入力..."
              />
            </div>

            {endConfirm ? (
              <div className="end-confirm">
                <p style={{ fontSize: 14, marginBottom: 12, color: 'var(--color-text-muted)' }}>
                  セッションを終了しますか？
                </p>
                <button className="btn-danger" onClick={handleEnd} style={{ marginBottom: 8 }}>
                  終了する
                </button>
                <button
                  className="btn-ghost"
                  style={{ display: 'block', width: '100%' }}
                  onClick={() => setEndConfirm(false)}
                >
                  キャンセル
                </button>
              </div>
            ) : (
              <button
                className="btn-secondary"
                style={{ marginTop: 12, borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                onClick={() => setEndConfirm(true)}
              >
                セッション終了
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
