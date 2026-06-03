import { useState, useEffect, useMemo } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'
import { usePublicRecipes } from '../hooks/useRecipes'
import { presets } from '../data/presets'
import type { Recipe } from '../types'
import './RecipeRanking.css'

type RankingTab = 'weekly' | 'total' | 'comments'

export interface RecipeRankingProps {
  onSelectRecipe: (recipe: Recipe) => void
}

const STORAGE_KEY = 'ranking-collapsed'
const MEDALS = ['🥇', '🥈', '🥉']

export default function RecipeRanking({ onSelectRecipe }: RecipeRankingProps) {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'true' } catch { return false }
  })
  const [tab, setTab] = useState<RankingTab>('weekly')
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({})
  const [refreshKey, setRefreshKey] = useState(0)

  const { recipes: publicRecipes, loading } = usePublicRecipes()

  const allRecipes = useMemo(() => {
    const map = new Map<string, Recipe>()
    presets.forEach((r) => map.set(r.id, r))
    publicRecipes.forEach((r) => map.set(r.id, r))
    return Array.from(map.values())
  }, [publicRecipes])

  useEffect(() => {
    return onValue(ref(db, 'comments'), (snap) => {
      const counts: Record<string, number> = {}
      snap.forEach((recipeSnap) => {
        let count = 0
        recipeSnap.forEach(() => { count++ })
        counts[recipeSnap.key!] = count
      })
      setCommentCounts(counts)
    })
  }, [refreshKey])

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem(STORAGE_KEY, String(next)) } catch {}
      return next
    })
  }

  const ranked = useMemo(() => {
    if (tab === 'weekly') {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      const weekly = allRecipes.filter((r) => (r.createdAt ?? 0) >= sevenDaysAgo)
      const sorted = [...weekly].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
      // fallback to all-time likes when fewer than 5 weekly recipes exist
      if (sorted.length >= 5) return sorted.slice(0, 5)
      return [...allRecipes].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0)).slice(0, 5)
    }
    if (tab === 'total') {
      return [...allRecipes].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0)).slice(0, 5)
    }
    return [...allRecipes]
      .sort((a, b) => (commentCounts[b.id] ?? 0) - (commentCounts[a.id] ?? 0))
      .slice(0, 5)
  }, [allRecipes, tab, commentCounts])

  const tabs: [RankingTab, string][] = [
    ['weekly', '🔥 今週'],
    ['total', '❤️ 総合'],
    ['comments', '💬 コメント'],
  ]

  return (
    <div className="ranking-section">
      <div className="ranking-header">
        <span className="ranking-title">🏆 人気ランキング</span>
        <div className="ranking-header-right">
          <button className="ranking-refresh-btn" onClick={() => setRefreshKey((k) => k + 1)}>
            ↻ 更新
          </button>
          <button className="ranking-toggle-btn" onClick={toggleCollapsed}>
            {collapsed ? '▼ 開く' : '▲ 閉じる'}
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="ranking-tabs">
            {tabs.map(([key, label]) => (
              <button
                key={key}
                className={`ranking-tab${tab === key ? ' active' : ''}`}
                onClick={() => setTab(key)}
              >{label}</button>
            ))}
          </div>

          <div className="ranking-list">
            {loading && ranked.length === 0 ? (
              <p className="ranking-loading">読み込み中...</p>
            ) : ranked.map((recipe, i) => {
              const score = tab === 'comments'
                ? (commentCounts[recipe.id] ?? 0)
                : (recipe.likes ?? 0)
              const icon = tab === 'comments' ? '💬' : '❤️'

              return (
                <button
                  key={recipe.id}
                  className={`ranking-item rank-pos-${i + 1}`}
                  onClick={() => onSelectRecipe(recipe)}
                >
                  <span className="ranking-medal-col">
                    {i < 3
                      ? <span className="ranking-medal">{MEDALS[i]}</span>
                      : <span className="ranking-num">{i + 1}位</span>
                    }
                  </span>
                  <span className="ranking-content">
                    <span className="ranking-name">{recipe.name}</span>
                    <span className="ranking-meta">
                      {icon} {score}　by {recipe.authorName}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
