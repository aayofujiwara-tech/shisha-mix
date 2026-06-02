import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useMyRecipes, usePublicRecipes } from '../hooks/useRecipes'
import { useInventory } from '../hooks/useInventory'
import { useSessionTimer } from '../hooks/useSessionTimer'
import { presets } from '../data/presets'
import { flavorDB } from '../data/flavorDB'
import { CATEGORIES, STRENGTH_LABELS, SWEETNESS_LABELS } from '../types'
import type { Recipe } from '../types'
import RecipeCard from '../components/RecipeCard'
import AIRecipeGenerator from '../components/AIRecipeGenerator'
import './SuggestPage.css'
import '../components/SessionTimer.css'

export default function SuggestPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { requestStart } = useSessionTimer()
  const { recipes: communityRecipes } = usePublicRecipes()
  const { flavors: inventory } = useInventory(user?.uid ?? null)
  const { createRecipe } = useMyRecipes(user?.uid ?? null)

  const [baseFlavor, setBaseFlavor] = useState('')
  const [selCategories, setSelCategories] = useState<string[]>([])
  const [selStrengths, setSelStrengths] = useState<Recipe['strength'][]>([])
  const [selSweetness, setSelSweetness] = useState<Recipe['sweetness'][]>([])
  const [inventoryOnly, setInventoryOnly] = useState(false)
  const [suggested, setSuggested] = useState<Recipe | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [baseSearch, setBaseSearch] = useState('')

  const allRecipes = useMemo(() => {
    const map = new Map<string, Recipe>()
    presets.forEach((r) => map.set(r.id, r))
    communityRecipes.forEach((r) => map.set(r.id, r)) // Firebase version takes precedence post-migration
    return Array.from(map.values())
  }, [communityRecipes])

  const availableFlavorNames = useMemo(() =>
    inventory.filter((f) => f.status !== 'empty').map((f) => f.name.toLowerCase()),
    [inventory]
  )

  const suggest = () => {
    setSaved(false)
    let pool = allRecipes

    if (baseFlavor.trim()) {
      const bf = baseFlavor.toLowerCase()
      pool = pool.filter((r) => r.flavors.some((f) => f.name.toLowerCase().includes(bf)))
    }
    if (selCategories.length) {
      pool = pool.filter((r) => selCategories.some((c) => r.category.includes(c)))
    }
    if (selStrengths.length) {
      pool = pool.filter((r) => selStrengths.includes(r.strength))
    }
    if (selSweetness.length) {
      pool = pool.filter((r) => selSweetness.includes(r.sweetness))
    }
    if (inventoryOnly && inventory.length > 0) {
      pool = pool.filter((r) =>
        r.flavors.every((f) => availableFlavorNames.includes(f.name.toLowerCase()))
      )
    }
    if (pool.length === 0) {
      setSuggested(null)
      alert('条件に合うレシピが見つかりません。条件を緩めてみてください。')
      return
    }
    const weights = pool.map((r) => (r.isPreset === true || r.userId === 'system') ? 2 : 1)
    const total = weights.reduce((s, w) => s + w, 0)
    let rand = Math.random() * total
    let pick = pool[0]
    for (let i = 0; i < pool.length; i++) {
      rand -= weights[i]
      if (rand <= 0) { pick = pool[i]; break }
    }
    setSuggested(pick)
  }

  const saveToMyRecipe = async () => {
    if (!suggested || !user) { navigate('/login'); return }
    setSaving(true)
    const now = Date.now()
    const { id: _id, ...suggestedWithoutId } = suggested
    void _id
    await createRecipe({
      ...suggestedWithoutId,
      userId: user.uid,
      authorName: user.displayName || 'ゲスト',
      isPublic: false,
      likes: 0,
      createdAt: now,
      updatedAt: now,
    })
    setSaving(false)
    setSaved(true)
    setToast('マイレシピに保存しました ✓')
    setTimeout(() => setToast(null), 3000)
  }

  const baseFlavorSuggestions = baseSearch.trim()
    ? flavorDB.filter((f) => f.name.toLowerCase().includes(baseSearch.toLowerCase())).slice(0, 5)
    : []

  return (
    <div className="page">
      <AIRecipeGenerator />

      <div className="page-header" style={{ marginTop: 8 }}>
        <h1 className="page-title">🎲 ランダム提案</h1>
      </div>

      <div className="suggest-form card">
        {/* ベースフレーバー */}
        <div className="form-group">
          <label className="field-label">ベースフレーバー（任意）</label>
          <div className="suggest-base-wrap">
            <input
              type="text"
              placeholder="例：ウォーターメロン"
              value={baseSearch || baseFlavor}
              onChange={(e) => {
                setBaseSearch(e.target.value)
                setBaseFlavor(e.target.value)
              }}
              onBlur={() => setTimeout(() => setBaseSearch(''), 150)}
            />
            {baseFlavorSuggestions.length > 0 && baseSearch && (
              <div className="flavor-suggestions">
                {baseFlavorSuggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="flavor-suggestion-item"
                    onMouseDown={() => { setBaseFlavor(s.name); setBaseSearch('') }}
                  >
                    <span>{s.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{s.brand}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 系統 */}
        <div className="form-group">
          <label className="field-label">系統（任意・複数可）</label>
          <div className="suggest-categories">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className={`filter-chip${selCategories.includes(c) ? ' selected' : ''}`}
                onClick={() => setSelCategories((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* 強度 */}
        <div className="form-group">
          <label className="field-label">強度（任意・複数可）</label>
          <div className="suggest-categories">
            {(Object.entries(STRENGTH_LABELS) as [Recipe['strength'], string][]).map(([k, v]) => (
              <button
                key={k}
                type="button"
                className={`filter-chip${selStrengths.includes(k) ? ' selected' : ''}`}
                onClick={() => setSelStrengths((prev) => prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k])}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* 甘さ */}
        <div className="form-group">
          <label className="field-label">甘さ（任意・複数可）</label>
          <div className="suggest-categories">
            {(Object.entries(SWEETNESS_LABELS) as [Recipe['sweetness'], string][]).map(([k, v]) => (
              <button
                key={k}
                type="button"
                className={`filter-chip${selSweetness.includes(k) ? ' selected' : ''}`}
                onClick={() => setSelSweetness((prev) => prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k])}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* 在庫縛り */}
        {user && (
          <div className="suggest-inventory-row">
            <div>
              <p className="suggest-inventory-title">在庫縛り</p>
              <p className="suggest-inventory-desc">「あり」のフレーバーだけで作れるレシピに絞る</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={inventoryOnly} onChange={(e) => setInventoryOnly(e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>
        )}

        <button className="btn-primary" onClick={suggest} style={{ marginTop: 8 }}>
          🎲 提案する
        </button>
      </div>

      {suggested && (
        <div className="suggest-result">
          <p className="suggest-result-label">提案されたレシピ</p>
          <RecipeCard recipe={suggested} showAuthor onSelect={() => {}} />
          <div className="suggest-result-actions">
            <button className="btn-secondary" onClick={suggest}>もう一度</button>
            <button
              className="btn-primary"
              onClick={saveToMyRecipe}
              disabled={saving || saved}
              style={{ flex: 1 }}
            >
              {saved ? '✓ 保存済み' : saving ? '保存中...' : '📝 マイレシピに保存'}
            </button>
          </div>
          <button
            className="btn-start-session"
            onClick={() => requestStart(suggested.id, suggested.name)}
          >
            ▶ このレシピでセッション開始
          </button>
        </div>
      )}

      {toast && <div className="suggest-toast">{toast}</div>}

      {!suggested && (
        <div className="suggest-placeholder">
          <div className="suggest-placeholder-icon">🎲</div>
          <p className="suggest-placeholder-text">条件を選んで「提案する」ボタンを押してください</p>
        </div>
      )}
    </div>
  )
}
