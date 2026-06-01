import { useState, useMemo } from 'react'
import { useInventory } from '../hooks/useInventory'
import { usePublicRecipes } from '../hooks/useRecipes'
import { useSessionTimer } from '../hooks/useSessionTimer'
import { presets } from '../data/presets'
import { flavorDB } from '../data/flavorDB'
import { STRENGTH_LABELS, SWEETNESS_LABELS } from '../types'
import type { Recipe } from '../types'
import './FlavorCompatibility.css'

// ── CompatibilityCard ──────────────────────────────────────────────────────

interface CompatibilityCardProps {
  recipe: Recipe
  selectedFlavors: string[]
  score: number
  onStart: () => void
}

function CompatibilityCard({ recipe, selectedFlavors, score, onStart }: CompatibilityCardProps) {
  const selectedLower = selectedFlavors.map((s) => s.toLowerCase())
  const flavors = recipe.flavors ?? []
  const otherFlavors = flavors.filter((f) => !selectedLower.includes(f.name.toLowerCase()))

  return (
    <div className="fc-card card">
      <div className="fc-card-top">
        <div className="fc-card-info">
          <p className="fc-card-name">{recipe.name}</p>
          <p className="fc-card-author">by {recipe.authorName}</p>
        </div>
        <div className="fc-card-score-box">
          <span className="fc-score-num">{Math.round(score * 100)}</span>
          <span className="fc-score-unit">%</span>
        </div>
      </div>

      <div className="fc-card-tags">
        {(recipe.category ?? []).map((c) => (
          <span key={c} className="tag">{c}</span>
        ))}
        <span className="tag tag-muted">強度: {STRENGTH_LABELS[recipe.strength]}</span>
        <span className="tag tag-muted">甘さ: {SWEETNESS_LABELS[recipe.sweetness]}</span>
      </div>

      <div className="fc-score-bar-wrap">
        <div className="fc-score-bar" style={{ width: `${Math.round(score * 100)}%` }} />
      </div>

      <div className="fc-flavor-list">
        {flavors.map((f, i) => (
          <span
            key={i}
            className={`fc-flavor-tag${selectedLower.includes(f.name.toLowerCase()) ? ' fc-flavor-tag--hl' : ''}`}
          >
            {f.name}{f.ratio ? ` ${f.ratio}%` : ''}
          </span>
        ))}
      </div>

      {otherFlavors.length > 0 && (
        <div className="fc-partners">
          <p className="fc-partners-label">一緒に使うフレーバー</p>
          <div className="fc-partner-list">
            {otherFlavors.map((f, i) => (
              <span key={i} className="fc-partner-item">
                {f.name}<span className="fc-partner-brand"> ({f.brand})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <button className="btn-start-session" onClick={onStart}>▶ このレシピで試す</button>
    </div>
  )
}

// ── FlavorCompatibility ────────────────────────────────────────────────────

interface FlavorCompatibilityProps {
  userId?: string
}

export default function FlavorCompatibility({ userId }: FlavorCompatibilityProps) {
  const { flavors: inventory } = useInventory(userId ?? null)
  const { recipes: communityRecipes } = usePublicRecipes()
  const { requestStart } = useSessionTimer()

  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const [flavorSearch, setFlavorSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [inventoryOnly, setInventoryOnly] = useState(false)

  const availableInventory = useMemo(
    () => inventory.filter((f) => f.status !== 'empty'),
    [inventory]
  )

  const allRecipes = useMemo(() => {
    const map = new Map<string, Recipe>()
    for (const r of presets) map.set(r.id, r)
    for (const r of communityRecipes) map.set(r.id, r)
    return Array.from(map.values())
  }, [communityRecipes])

  const flavorSuggestions = useMemo(() => {
    const search = flavorSearch.trim().toLowerCase()

    let candidates: { name: string; brand: string }[]

    if (search) {
      // Filter available inventory
      const invMatches = availableInventory.filter(
        (f) =>
          f.name.toLowerCase().includes(search) ||
          f.brand.toLowerCase().includes(search)
      )
      // Filter flavorDB
      const dbMatches = flavorDB.filter(
        (f) =>
          f.name.toLowerCase().includes(search) ||
          f.brand.toLowerCase().includes(search)
      )

      // Deduplicate by name (inventory first)
      const seen = new Set<string>()
      candidates = []
      for (const f of invMatches) {
        const key = f.name.toLowerCase()
        if (!seen.has(key)) { seen.add(key); candidates.push({ name: f.name, brand: f.brand }) }
      }
      for (const f of dbMatches) {
        const key = f.name.toLowerCase()
        if (!seen.has(key)) { seen.add(key); candidates.push({ name: f.name, brand: f.brand }) }
      }
    } else {
      candidates = availableInventory.map((f) => ({ name: f.name, brand: f.brand }))
    }

    // Exclude already selected
    const selectedLower = selectedFlavors.map((s) => s.toLowerCase())
    return candidates.filter((f) => !selectedLower.includes(f.name.toLowerCase())).slice(0, 8)
  }, [flavorSearch, availableInventory, selectedFlavors])

  const availableInventoryNames = useMemo(
    () => availableInventory.map((f) => f.name.toLowerCase()),
    [availableInventory]
  )

  const results = useMemo(() => {
    if (selectedFlavors.length === 0) return []
    const selectedLower = selectedFlavors.map((s) => s.toLowerCase())

    let matching = allRecipes.filter((r) =>
      selectedLower.every((sel) =>
        r.flavors.some((f) => f.name.toLowerCase() === sel)
      )
    )

    if (inventoryOnly && userId) {
      matching = matching.filter((r) =>
        r.flavors.every((f) => availableInventoryNames.includes(f.name.toLowerCase()))
      )
    }

    const maxLikes = Math.max(...matching.map((r) => r.likes ?? 0), 1)

    return matching
      .map((r) => {
        const selectedRatio = r.flavors
          .filter((f) => selectedLower.includes(f.name.toLowerCase()))
          .reduce((s, f) => s + (f.ratio ?? 0), 0)
        const score =
          (Math.min(selectedRatio, 100) / 100) * 0.6 +
          ((r.likes ?? 0) / maxLikes) * 0.4
        return { recipe: r, score }
      })
      .sort((a, b) => b.score - a.score)
  }, [selectedFlavors, allRecipes, inventoryOnly, userId, availableInventoryNames])

  const addFlavor = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    if (selectedFlavors.map((s) => s.toLowerCase()).includes(trimmed.toLowerCase())) return
    setSelectedFlavors((prev) => [...prev, trimmed])
    setFlavorSearch('')
    setShowDropdown(false)
  }

  const removeFlavor = (name: string) => {
    setSelectedFlavors((prev) => prev.filter((s) => s !== name))
  }

  return (
    <div className="fc-wrap">
      <div className="fc-selector card">
        <p className="fc-selector-label">診断するフレーバーを選択</p>

        {selectedFlavors.length > 0 && (
          <div className="fc-chips">
            {selectedFlavors.map((name) => (
              <span key={name} className="fc-chip">
                {name}
                <button onClick={() => removeFlavor(name)}>✕</button>
              </span>
            ))}
          </div>
        )}

        <div className="fc-input-wrap">
          <input
            type="text"
            placeholder="フレーバー名で検索・入力"
            value={flavorSearch}
            onChange={(e) => { setFlavorSearch(e.target.value); setShowDropdown(true) }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            className="fc-search-input"
          />
          {flavorSearch.trim() && (
            <button className="fc-add-btn" onMouseDown={() => addFlavor(flavorSearch.trim())}>追加</button>
          )}
        </div>

        {showDropdown && flavorSuggestions.length > 0 && (
          <div className="fc-suggestions">
            {flavorSuggestions.map((f) => {
              const selected = selectedFlavors.map((s) => s.toLowerCase()).includes(f.name.toLowerCase())
              return (
                <button
                  key={f.name}
                  className={`fc-suggestion-item${selected ? ' selected' : ''}`}
                  onMouseDown={() => addFlavor(f.name)}
                >
                  <span className="fc-sug-name">{f.name}</span>
                  <span className="fc-sug-brand">{f.brand}</span>
                </button>
              )
            })}
          </div>
        )}

        {userId && (
          <div className="fc-toggle-row">
            <div>
              <p className="fc-toggle-title">在庫縛り</p>
              <p className="fc-toggle-desc">在庫ありのフレーバーだけで作れるレシピに絞る</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={inventoryOnly}
                onChange={(e) => setInventoryOnly(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        )}
      </div>

      {selectedFlavors.length === 0 ? (
        <div className="fc-placeholder">
          <div className="empty-state-icon">🔬</div>
          <p className="empty-state-text">フレーバーを選択すると相性の良いレシピを提案します</p>
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">😕</div>
          <p className="empty-state-text">条件に合うレシピが見つかりません</p>
        </div>
      ) : (
        <>
          <p className="fc-results-label">{results.length}件の相性レシピ</p>
          {results.map(({ recipe, score }) => (
            <CompatibilityCard
              key={recipe.id}
              recipe={recipe}
              selectedFlavors={selectedFlavors}
              score={score}
              onStart={() => requestStart(recipe.id, recipe.name)}
            />
          ))}
        </>
      )}
    </div>
  )
}
