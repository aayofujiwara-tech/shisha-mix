import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useProfile, useUserPublicRecipes } from '../hooks/useProfile'
import { getRecipe } from '../hooks/useRecipes'
import RecipeCard from '../components/RecipeCard'
import type { Recipe } from '../types'
import './ProfilePage.css'

export default function UserPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile, loading } = useProfile(userId)
  const { recipes, loading: recipesLoading } = useUserPublicRecipes(userId)
  const [loadedMixes, setLoadedMixes] = useState<(Recipe | null)[]>([])

  useEffect(() => {
    if (user && userId && user.uid === userId) {
      navigate('/profile', { replace: true })
    }
  }, [user, userId, navigate])

  const favMixIds: string[] = profile?.favoriteMixes ?? []
  const favMixIdsKey = JSON.stringify(favMixIds)

  useEffect(() => {
    const ids: string[] = JSON.parse(favMixIdsKey)
    if (!ids.length) { setLoadedMixes([]); return }
    let cancelled = false
    Promise.all(ids.map((id) => getRecipe(id))).then((results) => {
      if (!cancelled) setLoadedMixes(results)
    })
    return () => { cancelled = true }
  }, [favMixIdsKey])

  if (loading) {
    return <div className="page"><div className="loading"><div className="spinner" />読み込み中...</div></div>
  }

  if (!profile) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-icon">👤</div>
          <p className="empty-state-text">ユーザーが見つかりません</p>
          <button className="btn-ghost" onClick={() => navigate(-1)}>戻る</button>
        </div>
      </div>
    )
  }

  const displayName = profile.displayName || 'ユーザー'
  const joinDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })
    : ''
  const totalLikes = recipes.reduce((s, r) => s + (r.likes ?? 0), 0)

  return (
    <div className="page">
      {/* プロフィールヘッダー */}
      <div className="profile-hero card">
        <div className="profile-hero-avatar">
          {profile.photoURL ? (
            <img src={profile.photoURL} alt="avatar" className="profile-avatar-lg" />
          ) : (
            <div className="profile-avatar-placeholder-lg">{displayName[0].toUpperCase()}</div>
          )}
        </div>
        <div className="profile-hero-info">
          <h1 className="profile-hero-name">{displayName}</h1>
          {joinDate && <p className="profile-hero-date">登録: {joinDate}</p>}
          <div className="profile-hero-stats">
            <span>📝 {recipes.length}件</span>
            <span>❤️ {totalLikes}</span>
          </div>
        </div>
      </div>

      {/* 自己紹介・タグ */}
      {(profile.bio || (profile.favoriteCategory?.length ?? 0) > 0 || (profile.favoriteBrand?.length ?? 0) > 0) && (
        <div className="card" style={{ marginTop: 12 }}>
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          {(profile.favoriteCategory?.length ?? 0) > 0 && (
            <div className="profile-tags-group">
              <p className="profile-tags-label">好きな系統</p>
              <div className="profile-tags">
                {profile.favoriteCategory.map((c) => <span key={c} className="tag">{c}</span>)}
              </div>
            </div>
          )}
          {(profile.favoriteBrand?.length ?? 0) > 0 && (
            <div className="profile-tags-group">
              <p className="profile-tags-label">よく使うブランド</p>
              <div className="profile-tags">
                {profile.favoriteBrand.map((b) => <span key={b} className="tag tag-muted">{b}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* お気に入りミックス */}
      {favMixIds.length > 0 && (
        <div className="card" style={{ marginTop: 12 }}>
          <h2 className="section-title">⭐ お気に入りミックス</h2>
          <div className="mix-grid">
            {favMixIds.map((id, i) => {
              const recipe = loadedMixes[i]
              return (
                <div
                  key={id}
                  className="mix-card"
                  onClick={() => recipe && navigate(`/recipe/${recipe.id}`)}
                >
                  {recipe ? (
                    <>
                      <p className="mix-card-name">{recipe.name}</p>
                      <p className="mix-card-flavors">{recipe.flavors.map((f) => f.name).join(' × ')}</p>
                    </>
                  ) : (
                    <p className="mix-card-loading">読込中...</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 公開レシピ一覧 */}
      <div style={{ marginTop: 12 }}>
        <h2 className="section-title" style={{ marginBottom: 8 }}>📝 公開レシピ</h2>
        {recipesLoading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : recipes.length > 0 ? (
          recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)
        ) : (
          <div className="card">
            <p className="profile-empty-text">公開レシピはありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
