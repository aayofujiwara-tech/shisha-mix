import { useState } from 'react'
import type { Recipe } from '../types'
import './FlavorCalculator.css'

const RATIO_COLORS = ['#f59e0b','#3b82f6','#22c55e','#a855f7','#ef4444','#06b6d4','#f97316','#14b8a6']
const PRESETS = [10, 20, 25, 30, 50]

interface FlavorCalculatorProps {
  recipe: Recipe
}

export default function FlavorCalculator({ recipe }: FlavorCalculatorProps) {
  const [open, setOpen] = useState(false)
  const [totalGrams, setTotalGrams] = useState(20)
  const [copied, setCopied] = useState(false)

  const flavors = recipe.flavors ?? []
  const totalRatio = flavors.reduce((s, f) => s + (f.ratio ?? 0), 0)

  const getGrams = (ratio: number) => {
    if (totalRatio === 0) return 0
    const effectiveRatio = ratio / totalRatio
    return totalGrams * effectiveRatio
  }

  const getDisplayRatio = (ratio: number) => {
    if (totalRatio === 0) return ratio
    return Math.round((ratio / totalRatio) * 100)
  }

  const handleChange = (val: number) => {
    setTotalGrams(Math.min(100, Math.max(1, val)))
  }

  const handleCopy = async () => {
    const flavorNames = flavors.map((f) => f.name).join('×')
    const separator = '─────────────'
    const lines = [
      `${flavorNames}（${totalGrams}g）`,
      separator,
      ...flavors.map((f) => `${f.name}（${f.brand}）: ${getGrams(f.ratio ?? 0).toFixed(1)}g`),
      separator,
      `合計: ${totalGrams.toFixed(1)}g`,
      'SheeshaMixより',
    ]
    await navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fc-calc">
      <button className="fc-calc-toggle" onClick={() => setOpen((v) => !v)}>
        <span>📊 消費量を計算</span>
        <span className="fc-calc-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="fc-calc-body">
          <div className="fc-calc-divider" />

          <div className="fc-calc-input-row">
            <span className="fc-calc-label">合計グラム数</span>
            <div className="fc-calc-input-group">
              <input
                type="number"
                className="fc-calc-input"
                value={totalGrams}
                min={1}
                max={100}
                onChange={(e) => handleChange(parseInt(e.target.value) || 1)}
              />
              <span className="fc-calc-unit">g</span>
              <div className="fc-calc-spin">
                <button className="fc-calc-spin-btn" onClick={() => handleChange(totalGrams + 1)}>▲</button>
                <button className="fc-calc-spin-btn" onClick={() => handleChange(totalGrams - 1)}>▼</button>
              </div>
            </div>
          </div>

          <div className="fc-calc-presets">
            {PRESETS.map((g) => (
              <button
                key={g}
                className={`fc-calc-preset${totalGrams === g ? ' active' : ''}`}
                onClick={() => handleChange(g)}
              >
                {g}g
              </button>
            ))}
          </div>

          <div className="fc-calc-divider" />

          <div className="fc-calc-rows">
            {flavors.map((f, i) => (
              <div key={i} className="fc-calc-row">
                <span className="fc-calc-dot" style={{ background: RATIO_COLORS[i % RATIO_COLORS.length] }} />
                <span className="fc-calc-fname">{f.name}</span>
                <span className="fc-calc-fbrand">({f.brand})</span>
                <span className="fc-calc-fratio">{getDisplayRatio(f.ratio ?? 0)}%</span>
                <span className="fc-calc-arrow">→</span>
                <span className="fc-calc-fgrams">{getGrams(f.ratio ?? 0).toFixed(1)}g</span>
              </div>
            ))}
          </div>

          <div className="fc-calc-divider" />

          <div className="fc-calc-total-row">
            <span className="fc-calc-total-label">合計</span>
            <span className="fc-calc-total-value">{totalGrams.toFixed(1)}g</span>
          </div>

          <button className="fc-calc-copy" onClick={handleCopy}>
            {copied ? '✓ コピーしました' : '📋 コピー'}
          </button>
        </div>
      )}
    </div>
  )
}
