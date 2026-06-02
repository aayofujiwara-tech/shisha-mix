import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import RecipeCard from '../components/RecipeCard'
import RecipeDetailPanel from '../components/RecipeDetailPanel'
import CommentSection from '../components/CommentSection'
import FlavorCalculator from '../components/FlavorCalculator'
import { usePublicRecipes, useLikes, useMyLikedRecipeIds } from '../hooks/useRecipes'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useAuth } from '../hooks/useAuth'
import { useSessionTimer } from '../hooks/useSessionTimer'
import { presets } from '../data/presets'
import { CATEGORIES, BRANDS, STRENGTH_LABELS, SWEETNESS_LABELS } from '../types'
import type { Recipe } from '../types'
import './SearchPage.css'
import '../components/SessionTimer.css'

const STRENGTH_OPTS = Object.entries(STRENGTH_LABELS) as [Recipe['strength'], string][]
const SWEET_OPTS = Object.entries(SWEETNESS_LABELS) as [Recipe['sweetness'], string][]
const RATIO_COLORS = ['#f59e0b','#3b82f6','#22c55e','#a855f7','#ef4444','#06b6d4','#f97316','#14b8a6']

function FilterPanel({
  keyword, setKeyword,
  selCategories, setSelCategories,
  selBrands, setSelBrands,
  selStrengths, setSelStrengths,
  selSweetness, setSelSweetness,
  showLikedOnly, setShowLikedOnly,
  hasLikedFilter,
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
  showLikedOnly: boolean; setShowLikedOnly: (v: boolean) => void
  hasLikedFilter: boolean
  resultCount: number
  loading: boolean
}) {
  const toggle = <T extends string>(val: T, arr: T[], set: (v: T[]) => void) => {
    set(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val])
  }

  const hasFilter = selCategories.length + selBrands.length + selStrengths.length + selSweetness.length + (showLikedOnly ? 1 : 0) > 0

  const clearAll = () => {
    setSelCategories([]); setSelBrands([]); setSelStrengths([]); setSelSweetness([]); setShowLikedOnly(false)
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

      {/* Liked only (shown only when user is logged in) */}
      {hasLikedFilter && (
        <>
          <p className="filter-section-label">いいね</p>
          <div className="filter-chips">
            <button
              className={`filter-chip${showLikedOnly ? ' selected' : ''}`}
              onClick={() => setShowLikedOnly(!showLikedOnly)}
            >❤️ いいね済みのみ</button>
          </div>
        </>
      )}
    </div>
  )
}

function PCDetailView({ recipe, onClose, userId, userName }: {
  recipe: Recipe; onClose: () => void; userId?: string; userName?: string
}) {
  const navigate = useNavigate()
  const { liked, loading: likesLoading, likesCount, toggle } = useLikes(recipe.id, userId, recipe.likes)
  const { requestStart } = useSessionTimer()
  const flavors = recipe.flavors ?? []
  const photos = recipe.photos ?? []
  const totalRatio = flavors.reduce((s, f) => s + (f.ratio ?? 0), 0)

  const handleLike = async () => {
    if (!userId) { navigate('/login'); return }
    await toggle()
  }

  return (
    <div className="pc-detail-view">
      {/* Left: name / author / tags / fields / memo */}
      <div className="pc-detail-left">
        <div className="pc-detail-top-row">
          <div className="pc-detail-meta">
            {photos.length > 0 && (
              <img src={photos[0]} alt={recipe.name} className="pc-detail-photo" />
            )}
            <div className="pc-detail-title-block">
              <div className="pc-detail-title-row">
                <h2 className="pc-detail-title">{recipe.name}</h2>
                <button
                  className={`dp-like${liked ? ' liked' : ''}`}
                  onClick={handleLike}
                  disabled={likesLoading}
                >
                  {liked ? '❤️' : '🤍'} {likesCount}
                </button>
              </div>
              <p className="pc-detail-author">by {recipe.authorName}</p>
            </div>
          </div>
          <button className="pc-detail-close" onClick={onClose}>✕</button>
        </div>

        <div className="pc-detail-tags">
          {(recipe.category ?? []).map((c) => <span key={c} className="tag">{c}</span>)}
          <span className="tag tag-muted">強度: {STRENGTH_LABELS[recipe.strength]}</span>
          <span className="tag tag-muted">甘さ: {SWEETNESS_LABELS[recipe.sweetness]}</span>
        </div>

        {(recipe.bowl || recipe.charcoal || recipe.packing) && (
          <div className="pc-detail-fields">
            {recipe.bowl && (
              <div className="pc-detail-field">
                <span className="pc-detail-field-label">ボウル</span>
                <span>{recipe.bowl}</span>
              </div>
            )}
            {recipe.charcoal && (
              <div className="pc-detail-field">
                <span className="pc-detail-field-label">炭</span>
                <span>{recipe.charcoal}</span>
              </div>
            )}
            {recipe.packing && (
              <div className="pc-detail-field">
                <span className="pc-detail-field-label">パッキング</span>
                <span>{recipe.packing}</span>
              </div>
            )}
          </div>
        )}

        {recipe.memo && <p className="pc-detail-memo">{recipe.memo}</p>}
        <CommentSection recipeId={recipe.id} userId={userId} userName={userName} />
      </div>

      {/* Right: flavor composition */}
      <div className="pc-detail-right">
        <p className="pc-detail-section-title">フレーバー構成</p>
        {totalRatio > 0 && (
          <div className="ratio-bar-container" style={{ height: 8, marginBottom: 10 }}>
            {flavors.map((f, i) => (
              <div
                key={i}
                className="ratio-bar-segment"
                style={{ flex: f.ratio ?? 0, background: RATIO_COLORS[i % RATIO_COLORS.length] }}
              />
            ))}
          </div>
        )}
        <div className="pc-detail-flavors">
          {flavors.map((f, i) => (
            <div key={i} className="pc-detail-flavor-row">
              <span className="pc-detail-flavor-dot" style={{ background: RATIO_COLORS[i % RATIO_COLORS.length] }} />
              <span className="pc-detail-flavor-name">{f.name}</span>
              <span className="pc-detail-flavor-brand">{f.brand}</span>
              <span className="pc-detail-flavor-ratio">
                {totalRatio > 0 ? Math.round(((f.ratio ?? 0) / totalRatio) * 100) : (f.ratio ?? 0)}%
              </span>
            </div>
          ))}
        </div>
        <button
          className="btn-start-session"
          onClick={() => requestStart(recipe.id, recipe.name)}
        >
          ▶ このレシピでセッション開始
        </button>
        <FlavorCalculator recipe={recipe} />
      </div>
    </div>
  )
}

export default function SearchPage() {
  const { recipes: communityRecipes, loading } = usePublicRecipes()
  const isPC = useMediaQuery('(min-width: 768px)')
  const navigate = useNavigate()
  const { user } = useAuth()
  const likedIds = useMyLikedRecipeIds(user?.uid)

  const [keyword, setKeyword] = useState('')
  const [selCategories, setSelCategories] = useState<string[]>([])
  const [selBrands, setSelBrands] = useState<string[]>([])
  const [selStrengths, setSelStrengths] = useState<Recipe['strength'][]>([])
  const [selSweetness, setSelSweetness] = useState<Recipe['sweetness'][]>([])
  const [showLikedOnly, setShowLikedOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [showMobileDetail, setShowMobileDetail] = useState(false)

  const allRecipes = useMemo(() => {
    const map = new Map<string, Recipe>()
    presets.forEach((r) => map.set(r.id, r))
    communityRecipes.forEach((r) => map.set(r.id, r)) // Firebase version takes precedence post-migration
    return Array.from(map.values())
  }, [communityRecipes])

  const filtered = useMemo(() => {
    let result = allRecipes
    if (keyword.trim()) {
      const kw = keyword.toLowerCase()
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(kw) ||
          (r.flavors ?? []).some((f) => f.name.toLowerCase().includes(kw) || f.brand.toLowerCase().includes(kw))
      )
    }
    if (selCategories.length) result = result.filter((r) => selCategories.some((c) => (r.category ?? []).includes(c)))
    if (selBrands.length) result = result.filter((r) => (r.flavors ?? []).some((f) => selBrands.includes(f.brand)))
    if (selStrengths.length) result = result.filter((r) => selStrengths.includes(r.strength))
    if (selSweetness.length) result = result.filter((r) => selSweetness.includes(r.sweetness))
    if (showLikedOnly) result = result.filter((r) => likedIds.has(r.id))
    return result
  }, [allRecipes, keyword, selCategories, selBrands, selStrengths, selSweetness, showLikedOnly, likedIds])

  const filterProps = {
    keyword, setKeyword,
    selCategories, setSelCategories,
    selBrands, setSelBrands,
    selStrengths, setSelStrengths,
    selSweetness, setSelSweetness,
    showLikedOnly, setShowLikedOnly,
    hasLikedFilter: !!user,
    resultCount: filtered.length,
    loading,
  }

  const hasFilter = selCategories.length + selBrands.length + selStrengths.length + selSweetness.length + (showLikedOnly ? 1 : 0) > 0
  const toggleSelected = (recipe: Recipe) =>
    setSelectedRecipe((prev) => prev?.id === recipe.id ? null : recipe)

  const handleMobileSelect = (recipe: Recipe) => {
    if (recipe.isPreset === true || recipe.userId === 'system') {
      setSelectedRecipe(recipe)
      setShowMobileDetail(true)
    } else {
      navigate(`/recipe/${recipe.id}`)
    }
  }

  /* ===== PC layout ===== */
  if (isPC) {
    return (
      <div className="search-pc-wrap">
        {/* Left: filter sidebar */}
        <aside className="search-pc-sidebar">
          <h2 className="search-pc-sidebar-title">絞り込み</h2>
          <FilterPanel {...filterProps} />
        </aside>

        {/* Main: top detail + bottom grid */}
        <div className="search-pc-main">
          {/* Top: detail panel (40vh) */}
          <div className="search-pc-detail-top">
            {selectedRecipe ? (
              <PCDetailView
                key={selectedRecipe.id}
                recipe={selectedRecipe}
                onClose={() => setSelectedRecipe(null)}
                userId={user?.uid}
                userName={user?.displayName || undefined}
              />
            ) : (
              <div className="search-pc-no-selection">
                <span>👆</span>
                <p>レシピを選択すると詳細が表示されます</p>
              </div>
            )}
          </div>

          {/* Bottom: 2-col recipe grid (60vh) */}
          <div className="search-pc-grid-wrap">
            {filtered.length === 0 && !loading ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <p className="empty-state-text">条件に一致するレシピが見つかりません</p>
              </div>
            ) : (
              <div className="recipe-grid-2col">
                {filtered.map((r) => (
                  <RecipeCard
                    key={r.id}
                    recipe={r}
                    showAuthor
                    selected={selectedRecipe?.id === r.id}
                    onSelect={toggleSelected}
                  />
                ))}
              </div>
            )}
          </div>
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
              setSelCategories([]); setSelBrands([]); setSelStrengths([]); setSelSweetness([]); setShowLikedOnly(false)
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
        filtered.map((r) => (
          <RecipeCard key={r.id} recipe={r} showAuthor onSelect={handleMobileSelect} />
        ))
      )}

      {showMobileDetail && selectedRecipe && (
        <div className="mobile-detail-overlay">
          <RecipeDetailPanel
            key={selectedRecipe.id}
            recipe={selectedRecipe}
            onClose={() => setShowMobileDetail(false)}
          />
        </div>
      )}
    </div>
  )
}
