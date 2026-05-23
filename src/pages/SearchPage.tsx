import { useState, useMemo } from 'react'
import RecipeCard from '../components/RecipeCard'
import { usePublicRecipes } from '../hooks/useRecipes'
import { presets } from '../data/presets'
import { CATEGORIES, BRANDS, STRENGTH_LABELS, SWEETNESS_LABELS } from '../types'
import type { Recipe } from '../types'
import './SearchPage.css'

const STRENGTH_OPTS = Object.entries(STRENGTH_LABELS) as [Recipe['strength'], string][]
const SWEET_OPTS = Object.entries(SWEETNESS_LABELS) as [Recipe['sweetness'], string][]

export default function SearchPage() {
  const { recipes: communityRecipes, loading } = usePublicRecipes()
  const [keyword, setKeyword] = useState('')
  const [selCategories, setSelCategories] = useState<string[]>([])
  const [selBrands, setSelBrands] = useState<string[]>([])
  const [selStrengths, setSelStrengths] = useState<Recipe['strength'][]>([])
  const [selSweetness, setSelSweetness] = useState<Recipe['sweetness'][]>([])
  const [showFilters, setShowFilters] = useState(false)

  const allRecipes = useMemo(() => {
    const map = new Map<string, Recipe>()
    presets.forEach((r) => map.set(r.id, r))
    communityRecipes.forEach((r) => { if (!map.has(r.id)) map.set(r.id, r) })
    return Array.from(map.values())
  }, [communityRecipes])

  const filtered = useMemo(() => {
    let result = allRecipes
    if (keyword.trim()) {
      const kw = keyword.toLowerCase()
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(kw) ||
          r.flavors.some((f) => f.name.toLowerCase().includes(kw) || f.brand.toLowerCase().includes(kw))
      )
    }
    if (selCategories.length) {
      result = result.filter((r) => selCategories.some((c) => r.category.includes(c)))
    }
    if (selBrands.length) {
      result = result.filter((r) => r.flavors.some((f) => selBrands.includes(f.brand)))
    }
    if (selStrengths.length) {
      result = result.filter((r) => selStrengths.includes(r.strength))
    }
    if (selSweetness.length) {
      result = result.filter((r) => selSweetness.includes(r.sweetness))
    }
    return result
  }, [allRecipes, keyword, selCategories, selBrands, selStrengths, selSweetness])

  const toggleArr = <T extends string>(_arr: T[], val: T, set: React.Dispatch<React.SetStateAction<T[]>>) => {
    set((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val])
  }

  const hasFilter = selCategories.length + selBrands.length + selStrengths.length + selSweetness.length > 0

  return (
    <div className="page">
      <div className="search-header">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="search"
            placeholder="レシピ名・フレーバー・ブランドで検索"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="search-input"
          />
          {keyword && (
            <button className="search-clear" onClick={() => setKeyword('')}>✕</button>
          )}
        </div>
        <button
          className={`filter-btn${hasFilter ? ' active' : ''}`}
          onClick={() => setShowFilters((v) => !v)}
        >
          🎛️{hasFilter ? ` (${selCategories.length + selBrands.length + selStrengths.length + selSweetness.length})` : ''}
        </button>
      </div>

      {showFilters && (
        <div className="filter-panel card">
          <div className="filter-section">
            <p className="section-label">系統</p>
            <div className="filter-chips">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  className={`filter-chip${selCategories.includes(c) ? ' selected' : ''}`}
                  onClick={() => toggleArr(selCategories, c, setSelCategories)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-section">
            <p className="section-label">ブランド</p>
            <div className="filter-chips">
              {BRANDS.map((b) => (
                <button
                  key={b}
                  className={`filter-chip${selBrands.includes(b) ? ' selected' : ''}`}
                  onClick={() => toggleArr(selBrands, b, setSelBrands)}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-row">
            <div className="filter-section half">
              <p className="section-label">強度</p>
              <div className="filter-chips">
                {STRENGTH_OPTS.map(([k, v]) => (
                  <button
                    key={k}
                    className={`filter-chip${selStrengths.includes(k) ? ' selected' : ''}`}
                    onClick={() => toggleArr(selStrengths, k, setSelStrengths)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-section half">
              <p className="section-label">甘さ</p>
              <div className="filter-chips">
                {SWEET_OPTS.map(([k, v]) => (
                  <button
                    key={k}
                    className={`filter-chip${selSweetness.includes(k) ? ' selected' : ''}`}
                    onClick={() => toggleArr(selSweetness, k, setSelSweetness)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {hasFilter && (
            <button className="btn-ghost" style={{ marginTop: 8 }} onClick={() => {
              setSelCategories([]); setSelBrands([]); setSelStrengths([]); setSelSweetness([])
            }}>
              フィルタークリア
            </button>
          )}
        </div>
      )}

      <div className="search-results-header">
        <span className="search-results-count">{filtered.length}件</span>
        {loading && <span className="search-loading">読み込み中...</span>}
      </div>

      {filtered.length === 0 && !loading ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p className="empty-state-text">条件に一致するレシピが見つかりません</p>
        </div>
      ) : (
        filtered.map((r) => <RecipeCard key={r.id} recipe={r} showAuthor />)
      )}
    </div>
  )
}
