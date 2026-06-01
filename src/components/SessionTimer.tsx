import { useState, useEffect } from 'react'
import { useSessionTimer } from '../hooks/useSessionTimer'
import './SessionTimer.css'

const PRESETS = [15, 20, 25, 30]

function fmt(s: number): string {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export default function SessionTimer() {
  const {
    session, isActive, elapsedSeconds, coalCountdown, status,
    pendingStart, requestStart, dismissPending, startSession, changeCoal, endSession,
  } = useSessionTimer()

  const [interval, setIntervalMin] = useState(20)
  const [customVal, setCustomVal] = useState('')
  const [coalAnim, setCoalAnim] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--session-bar-height', isActive ? '72px' : '0px')
    return () => root.style.setProperty('--session-bar-height', '0px')
  }, [isActive])

  const handleCoalChange = async () => {
    await changeCoal()
    setCoalAnim(true)
    setTimeout(() => setCoalAnim(false), 700)
  }

  const handleConfirmStart = async () => {
    if (pendingStart?.type !== 'ready') return
    await startSession(pendingStart.recipeId, pendingStart.recipeName, interval)
    setIntervalMin(20)
    setCustomVal('')
  }

  const handleCustomChange = (v: string) => {
    setCustomVal(v)
    const n = parseInt(v, 10)
    if (!isNaN(n) && n >= 5) setIntervalMin(n)
  }

  /* ---- Busy alert ---- */
  if (pendingStart?.type === 'busy') {
    return (
      <div className="st-busy-toast">
        <span>⚠️ セッション中です。終了してから開始してください。</span>
        <button className="st-busy-close" onClick={dismissPending}>✕</button>
      </div>
    )
  }

  /* ---- Interval picker ---- */
  if (pendingStart?.type === 'ready') {
    return (
      <div className="st-overlay" onClick={dismissPending}>
        <div className="st-interval-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-handle" />
          <h3 className="st-interval-title">炭交換のリマインダー間隔</h3>
          {pendingStart.recipeName && (
            <p className="st-interval-recipe">🍃 {pendingStart.recipeName}</p>
          )}
          <div className="st-interval-options">
            {PRESETS.map((m) => (
              <button
                key={m}
                className={`st-interval-opt${interval === m ? ' selected' : ''}`}
                onClick={() => { setIntervalMin(m); setCustomVal('') }}
              >
                {m}分
              </button>
            ))}
          </div>
          <div className="st-interval-custom-row">
            <label className="field-label" style={{ margin: 0 }}>カスタム（分）</label>
            <input
              type="number"
              min={5}
              max={120}
              placeholder="例：18"
              value={customVal}
              onChange={(e) => handleCustomChange(e.target.value)}
              style={{ width: 90, textAlign: 'center' }}
            />
          </div>
          <div className="st-interval-footer">
            <button className="btn-ghost" onClick={dismissPending}>キャンセル</button>
            <button className="btn-primary st-interval-start" onClick={handleConfirmStart}>
              ▶ 開始する
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ---- Floating start button (no active session) ---- */
  if (!isActive) {
    return (
      <button
        className="st-fab"
        onClick={() => requestStart('', 'セッション')}
        title="タイマーなしでセッション開始"
      >
        🪔
      </button>
    )
  }

  /* ---- Active session bar ---- */
  return (
    <div className={`st-bar st-bar--${status}`}>
      <div className="st-bar-info">
        <span className="st-bar-name">🪔 {session?.recipeName}</span>
        <div className="st-bar-times">
          <span>経過 {fmt(elapsedSeconds)}</span>
          <span className="st-bar-dot">·</span>
          <span className={`st-bar-coal${status !== 'active' ? ` st-bar-coal--${status}` : ''}`}>
            炭交換まで{' '}
            {status === 'overdue'
              ? `${Math.ceil((session!.coalInterval * 60000 - (Date.now() - session!.lastCoalChange)) / -60000)}分超過`
              : fmt(coalCountdown)}
          </span>
        </div>
      </div>
      <div className="st-bar-actions">
        <button
          className={`st-coal-btn${coalAnim ? ' st-coal-btn--done' : ''}`}
          onClick={handleCoalChange}
        >
          {coalAnim ? '✓' : '炭交換'}
        </button>
        <button className="st-end-btn" onClick={endSession}>終了</button>
      </div>
    </div>
  )
}
