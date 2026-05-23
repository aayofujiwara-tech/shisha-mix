import { useState, useMemo } from 'react'
import RecipeCard from '../components/RecipeCard'
import RecipeDetailPanel from '../components/RecipeDetailPanel'
import { usePublicRecipes } from '../hooks/useRecipes'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { presets } from '../data/presets'
import { CATEGORIES, BRANDS, STRENGTH_LABELS, SWEETNESS_LABELS } from '../types'
import type { Recipe } from '../types'
import './SearchPage.css'

const STRENGTH_OPTS = Object.entries(STRENGTH_LABELS) as [Recipe['strength'], string][]
const SWEET_OPTS = Object.entries(SWEETNESS_LABELS) as [Recipe['sweetness'], string][]

function FilterPanel({
  keyword, setKeyword,
  selCategories, setSelCategories,
  selBrands, setSelBrands,
  selStrengths, setSelStrengths,
  selSweetness, setSelSweetness,
  resultCount,
  loading,
}: {
  keyword: string; setKeyword: (v: string) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selCategories: string[]; setSelCategories: (v: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selBrands: string[]; setSelBrands: (v: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selStrengths: Recipe['strength'][]; setSelStrengths: (v: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selSweetness: Recipe['sweetness'][]; setSelSweetness: (v: any) => void
  resultCount: number
  loading: boolean
}) {
  const toggle = <T extends string>(val: T, arr: T[], set: (v: T[]) => void) => {
    set(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val])
  }

  const hasFilter = selCategories.length + selBrands.length + selStrengths.length + selSweetness.length > 0

  const clearAll = () => {
    setSelCategories([]); setSelBrands([]); setSelStrengths([]); setSelSweetness([])
  }

  return (
    <div className="filter-panel-inner">
      {/* Search */}
      <div className="filter-search-wrap">
        <span className="search-icon-inner">🔍</span>
        <input
          type="search"
          placeholder="レシピ名・フレーバー"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="filter-search-input"
        />
        {keyword && (
          <button className="search-clear" onClick={() => setKeyword('')}>✕</button>
        )}
      </div>

      <div className="filter-result-row">
        <span className="filter-result-count">{resultCount}件{loading ? ' …' : ''}</span>
        {hasFilter && (
          <button className="filter-clear-all" onClick={clearAll}>クリア</button>
        )}
      </div>

      {/* Category */}
      <p className="filter-section-label">系統</p>
      <div className="filter-chips">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`filter-chip${selCategories.includes(c) ? ' selected' : ''}`}
            onClick={() => toggle(c, selCategories, setSelCategories)}
          >{c}</button>
        ))}
      </div>

      {/* Brand */}
      <p className="filter-section-label">ブランド</p>
      <div className="filter-chips">
        {BRANDS.map((b) => (
          <button
            key={b}
            className={`filter-chip${selBrands.includes(b) ? ' selected' : ''}`}
            onClick={() => toggle(b, selBrands, setSelBrands)}
          >{b}</button>
        ))}
      </div>

      {/* Strength */}
      <p className="filter-section-label">強度</p>
      <div className="filter-chips">
        {STRENGTH_OPTS.map(([k, v]) => (
          <button
            key={k}
            className={`filter-chip${selStrengths.includes(k) ? ' selected' : ''}`}
            onClick={() => toggle(k, selStrengths, setSelStrengths)}
          >{v}</button>
        ))}
      </div>

      {/* Sweetness */}
      <p className="filter-section-label">甘さ</p>
      <div className="filter-chips">
        {SWEET_OPTS.map(([k, v]) => (
          <button
            key={k}
            className={`filter-chip${selSweetness.includes(k) ? ' selected' : ''}`}
            onClick={() => toggle(k, selSweetness, setSelSweetness)}
          >{v}</button>
        ))}
      </div>
    </div>
  )
}

export default function SearchPage() {
  const { recipes: communityRecipes, loading } = usePublicRecipes()
  const isPC = useMediaQuery('(min-width: 768px)')

  const [keyword, setKeyword] = useState('')
  const [selCategories, setSelCategories] = useState<string[]>([])
  const [selBrands, setSelBrands] = useState<string[]>([])
  const [selStrengths, setSelStrengths] = useState<Recipe['strength'][]>([])
  const [selSweetness, setSelSweetness] = useState<Recipe['sweetness'][]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

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
    if (selCategories.length) result = result.filter((r) => selCategories.some((c) => r.category.includes(c)))
    if (selBrands.length) result = result.filter((r) => r.flavors.some((f) => selBrands.includes(f.brand)))
    if (selStrengths.length) result = result.filter((r) => selStrengths.includes(r.strength))
    if (selSweetness.length) result = result.filter((r) => selSweetness.includes(r.sweetness))
    return result
  }, [allRecipes, keyword, selCategories, selBrands, selStrengths, selSweetness])

  const filterProps = {
    keyword, setKeyword,
    selCategories, setSelCategories,
    selBrands, setSelBrands,
    selStrengths, setSelStrengths,
    selSweetness, setSelSweetness,
    resultCount: filtered.length,
    loading,
  }

  const hasFilter = selCategories.length + selBrands.length + selStrengths.length + selSweetness.length > 0

  /* ===== PC layout ===== */
  if (isPC) {
    return (
      <div className="search-pc-shell">
        {/* Left: always-visible filter panel */}
        <aside className="search-pc-filters">
          <h2 className="search-pc-filters-title">検索・絞り込み</h2>
          <FilterPanel {...filterProps} />
        </aside>

        {/* Center: recipe grid */}
        <div className={`search-pc-results${selectedRecipe ? ' has-detail' : ''}`}>
          {filtered.length === 0 && !loading ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p className="empty-state-text">条件に一致するレシピが見つかりません</p>
            </div>
          ) : (
            <div className={`recipe-grid${selectedRecipe ? ' grid-compact' : ''}`}>
              {filtered.map((r) => (
                <RecipeCard
                  key={r.id}
                  recipe={r}
                  showAuthor
                  selected={selectedRecipe?.id === r.id}
                  onSelect={(recipe) => setSelectedRecipe(
                    selectedRecipe?.id === recipe.id ? null : recipe
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: detail panel (slide in) */}
        <div className={`search-pc-detail${selectedRecipe ? ' open' : ''}`}>
          {selectedRecipe && (
            <RecipeDetailPanel
              key={selectedRecipe.id}
              recipe={selectedRecipe}
              onClose={() => setSelectedRecipe(null)}
            />
          )}
        </div>
      </div>
    )
  }

  /* ===== Mobile layout ===== */
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
          <FilterPanel {...filterProps} />
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
