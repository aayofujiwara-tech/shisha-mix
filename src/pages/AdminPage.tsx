import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ref, get } from 'firebase/database'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../firebase'
import './AdminPage.css'

const ADMIN_UID = import.meta.env.VITE_ADMIN_UID

interface RecipeRow {
  id: string
  name: string
  likes: number
}

interface FeedbackRow {
  id: string
  overall: number
  willPay: 'yes' | 'maybe' | 'no'
  comment: string | null
  createdAt: number
}

interface AdminData {
  userCount: number
  recipeTotal: number
  recipePublic: number
  likesTotal: number
  top10: RecipeRow[]
  feedbackCount: number
  avgOverall: number | null
  willPayYes: number
  willPayMaybe: number
  willPayNo: number
  recentFeedbacks: FeedbackRow[]
  diaryTotal: number
  sessionUserCount: number
  storeUserCount: number
}

const WILL_PAY_LABEL: Record<string, string> = { yes: '使う', maybe: '内容次第', no: '使わない' }

function fmtDate(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function AdminPage() {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    if (!ADMIN_UID) { navigate('/'); return }
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user || user.uid !== ADMIN_UID) {
        navigate('/')
      } else {
        setAuthed(true)
      }
      setAuthChecked(true)
    })
    return unsub
  }, [navigate])

  const fetchAdminData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [usersR, recipesR, feedbacksR, diariesR, sessionsR, storesR] = await Promise.allSettled([
        get(ref(db, 'users')),
        get(ref(db, 'recipes')),
        get(ref(db, 'feedbacks')),
        get(ref(db, 'diaries')),
        get(ref(db, 'sessions')),
        get(ref(db, 'stores')),
      ])

      // Users
      const userCount =
        usersR.status === 'fulfilled' && usersR.value.exists()
          ? Object.keys(usersR.value.val() as Record<string, unknown>).length
          : 0

      // Recipes
      let recipeTotal = 0, recipePublic = 0, likesTotal = 0
      const top10: RecipeRow[] = []
      if (recipesR.status === 'fulfilled' && recipesR.value.exists()) {
        const val = recipesR.value.val() as Record<string, { name?: string; isPublic?: boolean; likes?: number }>
        const entries = Object.entries(val).map(([id, r]) => ({
          id,
          name: r.name ?? '(名称不明)',
          isPublic: r.isPublic ?? false,
          likes: r.likes ?? 0,
        }))
        recipeTotal = entries.length
        recipePublic = entries.filter((e) => e.isPublic).length
        likesTotal = entries.reduce((s, e) => s + e.likes, 0)
        top10.push(...entries.sort((a, b) => b.likes - a.likes).slice(0, 10))
      }

      // Feedbacks (failure treated as empty)
      let feedbackCount = 0, avgOverall: number | null = null
      let willPayYes = 0, willPayMaybe = 0, willPayNo = 0
      const recentFeedbacks: FeedbackRow[] = []
      if (feedbacksR.status === 'fulfilled' && feedbacksR.value.exists()) {
        const val = feedbacksR.value.val() as Record<string, {
          overall?: number; willPay?: string; comment?: string | null; createdAt?: number
        }>
        const entries = Object.entries(val).map(([id, f]) => ({
          id,
          overall: f.overall ?? 0,
          willPay: (f.willPay ?? 'no') as 'yes' | 'maybe' | 'no',
          comment: f.comment ?? null,
          createdAt: f.createdAt ?? 0,
        }))
        feedbackCount = entries.length
        if (entries.length > 0) {
          avgOverall = entries.reduce((s, e) => s + e.overall, 0) / entries.length
        }
        entries.forEach((e) => {
          if (e.willPay === 'yes') willPayYes++
          else if (e.willPay === 'maybe') willPayMaybe++
          else willPayNo++
        })
        recentFeedbacks.push(...entries.sort((a, b) => b.createdAt - a.createdAt).slice(0, 20))
      }

      // Diaries — sum entries across all users
      let diaryTotal = 0
      if (diariesR.status === 'fulfilled' && diariesR.value.exists()) {
        const val = diariesR.value.val() as Record<string, Record<string, unknown>>
        for (const userEntries of Object.values(val)) {
          if (userEntries && typeof userEntries === 'object') {
            diaryTotal += Object.keys(userEntries).length
          }
        }
      }

      // Sessions — count users who have any session data
      const sessionUserCount =
        sessionsR.status === 'fulfilled' && sessionsR.value.exists()
          ? Object.keys(sessionsR.value.val() as Record<string, unknown>).length
          : 0

      // Stores — count users who have a store
      const storeUserCount =
        storesR.status === 'fulfilled' && storesR.value.exists()
          ? Object.keys(storesR.value.val() as Record<string, unknown>).length
          : 0

      setData({
        userCount, recipeTotal, recipePublic, likesTotal, top10,
        feedbackCount, avgOverall, willPayYes, willPayMaybe, willPayNo, recentFeedbacks,
        diaryTotal, sessionUserCount, storeUserCount,
      })
      setLastUpdated(new Date())
    } catch (e) {
      setError(e instanceof Error ? e.message : '取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) fetchAdminData()
  }, [authed, fetchAdminData])

  if (!authChecked) {
    return (
      <div className="page">
        <div className="loading"><div className="spinner" />認証確認中...</div>
      </div>
    )
  }

  const maxLikes = data?.top10[0]?.likes ?? 1

  return (
    <div className="page admin-page">
      <div className="page-header admin-header">
        <h1 className="page-title">管理者ダッシュボード</h1>
        <div className="admin-header-right">
          {lastUpdated && (
            <span className="admin-last-updated">{lastUpdated.toLocaleTimeString('ja-JP')} 更新</span>
          )}
          <button className="btn-primary admin-refresh-btn" onClick={fetchAdminData} disabled={loading}>
            {loading ? '取得中...' : '更新'}
          </button>
        </div>
      </div>

      {error && <p className="admin-error">{error}</p>}

      {loading && !data && (
        <div className="loading"><div className="spinner" />読み込み中...</div>
      )}

      {data && (
        <>
          {/* Summary cards */}
          <div className="admin-stats">
            {[
              { label: 'ユーザー数', value: data.userCount },
              { label: 'レシピ総数', value: data.recipeTotal },
              { label: '公開レシピ', value: data.recipePublic },
              { label: 'いいね合計', value: data.likesTotal },
              {
                label: 'フィードバック',
                value: data.feedbackCount,
                sub: data.avgOverall != null ? `平均 ★${data.avgOverall.toFixed(1)}` : undefined,
              },
              { label: '日記エントリ', value: data.diaryTotal },
            ].map(({ label, value, sub }) => (
              <div key={label} className="admin-stat-card">
                <span className="admin-stat-value">{value}</span>
                {sub && <span className="admin-stat-sub">{sub}</span>}
                <span className="admin-stat-label">{label}</span>
              </div>
            ))}
          </div>

          {/* Top 10 recipes by likes */}
          {data.top10.length > 0 && (
            <div className="card admin-section">
              <h2 className="admin-section-title">❤️ いいね数 Top {data.top10.length}</h2>
              <div className="admin-bar-list">
                {data.top10.map((r, i) => (
                  <div key={r.id} className="admin-bar-row">
                    <span className="admin-bar-rank">#{i + 1}</span>
                    <span className="admin-bar-name">{r.name}</span>
                    <div className="admin-bar-track">
                      <div
                        className="admin-bar-fill"
                        style={{ width: `${(r.likes / maxLikes) * 100}%` }}
                      />
                    </div>
                    <span className="admin-bar-count">{r.likes}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* willPay breakdown */}
          <div className="card admin-section">
            <h2 className="admin-section-title">💰 有料化意向（フィードバック {data.feedbackCount} 件）</h2>
            <div className="admin-willpay">
              <div className="admin-willpay-item admin-willpay-yes">
                <span className="admin-willpay-count">{data.willPayYes}</span>
                <span className="admin-willpay-label">使う</span>
              </div>
              <div className="admin-willpay-item admin-willpay-maybe">
                <span className="admin-willpay-count">{data.willPayMaybe}</span>
                <span className="admin-willpay-label">内容次第</span>
              </div>
              <div className="admin-willpay-item admin-willpay-no">
                <span className="admin-willpay-count">{data.willPayNo}</span>
                <span className="admin-willpay-label">使わない</span>
              </div>
            </div>
          </div>

          {/* Recent feedbacks */}
          {data.recentFeedbacks.length > 0 && (
            <div className="card admin-section">
              <h2 className="admin-section-title">💬 最近のフィードバック（最大20件）</h2>
              <div className="admin-feedback-list">
                {data.recentFeedbacks.map((f) => (
                  <div key={f.id} className="admin-feedback-row">
                    <div className="admin-feedback-meta">
                      <span className="admin-feedback-date">{fmtDate(f.createdAt)}</span>
                      <span className="admin-feedback-stars">
                        {'★'.repeat(f.overall)}{'☆'.repeat(Math.max(0, 5 - f.overall))}
                      </span>
                      <span className="admin-feedback-willpay">
                        {WILL_PAY_LABEL[f.willPay] ?? f.willPay}
                      </span>
                    </div>
                    {f.comment && <p className="admin-feedback-comment">{f.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
