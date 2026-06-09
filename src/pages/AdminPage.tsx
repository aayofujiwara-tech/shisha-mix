import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ref, get, type DataSnapshot } from 'firebase/database'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../firebase'
import './AdminPage.css'

const ADMIN_UID = import.meta.env.VITE_ADMIN_UID as string | undefined

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

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout: ${label}`)), 5000)
    ),
  ])
}

async function safeGet(path: string): Promise<DataSnapshot | null> {
  try {
    return await withTimeout(get(ref(db, path)), path)
  } catch (e) {
    console.error(`[Admin] Failed to fetch "${path}":`, e)
    return null
  }
}

export default function AdminPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'auth' | 'loading' | 'ready' | 'error'>('auth')
  const [data, setData] = useState<AdminData | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchAdminData = useCallback(async () => {
    setStatus('loading')
    setFetchError(null)
    try {
      const [usersSnap, recipesSnap, feedbacksSnap, diariesSnap, sessionsSnap, storesSnap] =
        await Promise.all([
          safeGet('users'),
          safeGet('recipes'),
          safeGet('feedbacks'),
          safeGet('diaries'),
          safeGet('sessions'),
          safeGet('stores'),
        ])

      // Users
      const userCount = usersSnap?.exists()
        ? Object.keys(usersSnap.val() as Record<string, unknown>).length
        : 0

      // Recipes
      let recipeTotal = 0, recipePublic = 0, likesTotal = 0
      const top10: RecipeRow[] = []
      if (recipesSnap?.exists()) {
        const val = recipesSnap.val() as Record<string, { name?: string; isPublic?: boolean; likes?: number }>
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

      // Feedbacks (PERMISSION_DENIED is caught by safeGet, treated as empty)
      let feedbackCount = 0, avgOverall: number | null = null
      let willPayYes = 0, willPayMaybe = 0, willPayNo = 0
      const recentFeedbacks: FeedbackRow[] = []
      if (feedbacksSnap?.exists()) {
        const val = feedbacksSnap.val() as Record<string, {
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
      if (diariesSnap?.exists()) {
        const val = diariesSnap.val() as Record<string, Record<string, unknown>>
        for (const userEntries of Object.values(val)) {
          if (userEntries && typeof userEntries === 'object') {
            diaryTotal += Object.keys(userEntries).length
          }
        }
      }

      // Sessions
      const sessionUserCount = sessionsSnap?.exists()
        ? Object.keys(sessionsSnap.val() as Record<string, unknown>).length
        : 0

      // Stores
      const storeUserCount = storesSnap?.exists()
        ? Object.keys(storesSnap.val() as Record<string, unknown>).length
        : 0

      setData({
        userCount, recipeTotal, recipePublic, likesTotal, top10,
        feedbackCount, avgOverall, willPayYes, willPayMaybe, willPayNo, recentFeedbacks,
        diaryTotal, sessionUserCount, storeUserCount,
      })
      setLastUpdated(new Date())
    } catch (e) {
      console.error('[Admin] Fetch error:', e)
      setFetchError(e instanceof Error ? e.message : '取得に失敗しました')
    } finally {
      console.log('[Admin] Fetch complete (with or without errors)')
      setStatus('ready')
    }
  }, [])

  useEffect(() => {
    console.log('[Admin] Admin UID from env:', ADMIN_UID)
    if (!ADMIN_UID) {
      console.warn('[Admin] VITE_ADMIN_UID not configured — redirecting')
      navigate('/')
      return
    }

    const unsub = onAuthStateChanged(auth, (user) => {
      console.log('[Admin] Auth state:', user?.uid ?? 'not logged in')
      if (!user || user.uid !== ADMIN_UID) {
        console.warn('[Admin] UID mismatch — redirecting')
        navigate('/')
        return
      }
      fetchAdminData()
    })
    return unsub
  }, [navigate, fetchAdminData])

  // Auth pending
  if (status === 'auth') {
    return (
      <div className="page">
        <div className="loading"><div className="spinner" />認証確認中...</div>
      </div>
    )
  }

  // Initial load (no data yet)
  if (status === 'loading' && !data) {
    return (
      <div className="page">
        <div className="loading"><div className="spinner" />読み込み中...</div>
      </div>
    )
  }

  // Error with no data
  if (!data) {
    return (
      <div className="page admin-page">
        <div className="page-header">
          <h1 className="page-title">管理者ダッシュボード</h1>
        </div>
        <p className="admin-error">{fetchError ?? 'データを取得できませんでした'}</p>
      </div>
    )
  }

  const maxLikes = data.top10[0]?.likes || 1

  return (
    <div className="page admin-page">
      <div className="page-header admin-header">
        <h1 className="page-title">管理者ダッシュボード</h1>
        <div className="admin-header-right">
          {lastUpdated && (
            <span className="admin-last-updated">{lastUpdated.toLocaleTimeString('ja-JP')} 更新</span>
          )}
          <button
            className="btn-primary admin-refresh-btn"
            onClick={fetchAdminData}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? '取得中...' : '更新'}
          </button>
        </div>
      </div>

      {fetchError && <p className="admin-error">{fetchError}</p>}

      <div className="admin-content">
        {/* Summary cards */}
        <div className="admin-stats">
          {([
            { label: 'ユーザー数',      value: data.userCount },
            { label: 'レシピ総数',      value: data.recipeTotal },
            { label: '公開レシピ',      value: data.recipePublic },
            { label: 'いいね合計',      value: data.likesTotal },
            { label: 'フィードバック',  value: data.feedbackCount,
              sub: data.avgOverall != null ? `平均 ★${data.avgOverall.toFixed(1)}` : undefined },
            { label: '日記エントリ',    value: data.diaryTotal },
          ] as { label: string; value: number; sub?: string }[]).map(({ label, value, sub }) => (
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
                  <span className="admin-bar-name" title={r.name}>{r.name}</span>
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
          <h2 className="admin-section-title">
            💰 有料化意向（フィードバック {data.feedbackCount} 件）
          </h2>
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

        {/* Recent feedbacks table */}
        {data.recentFeedbacks.length > 0 && (
          <div className="card admin-section">
            <h2 className="admin-section-title">💬 最近のフィードバック（最大20件）</h2>
            <div className="admin-feedback-table-wrap">
              <table className="admin-feedback-table">
                <colgroup>
                  <col className="col-date" />
                  <col className="col-stars" />
                  <col className="col-willpay" />
                  <col />
                </colgroup>
                <thead>
                  <tr>
                    <th>日時</th>
                    <th>評価</th>
                    <th>意向</th>
                    <th>コメント</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentFeedbacks.map((f) => (
                    <tr key={f.id}>
                      <td className="admin-td-date">{fmtDate(f.createdAt)}</td>
                      <td className="admin-td-stars">{'★'.repeat(f.overall)}</td>
                      <td className="admin-td-willpay">{WILL_PAY_LABEL[f.willPay] ?? f.willPay}</td>
                      <td className="admin-td-comment">{f.comment ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
