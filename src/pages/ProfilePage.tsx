import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { useMyRecipes, getRecipe } from '../hooks/useRecipes'
import { useDiary } from '../hooks/useDiary'
import RecipeCard from '../components/RecipeCard'
import type { Recipe } from '../types'
import { CATEGORIES, BRANDS } from '../types'
import { presets } from '../data/presets'
import './ProfilePage.css'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, deleteAccount } = useAuth()
  const { profile, loading, saveProfile } = useProfile(user?.uid)
  const { recipes: myRecipes } = useMyRecipes(user?.uid ?? null)
  const { entries: diaryEntries } = useDiary(user?.uid ?? null)

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editCategories, setEditCategories] = useState<string[]>([])
  const [editBrands, setEditBrands] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [isMixEditing, setIsMixEditing] = useState(false)
  const [showMixPicker, setShowMixPicker] = useState(false)
  const [mixSearch, setMixSearch] = useState('')
  const [loadedMixes, setLoadedMixes] = useState<(Recipe | null)[]>([])

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

  const publicRecipes = useMemo(() => myRecipes.filter((r) => r.isPublic), [myRecipes])
  const totalLikes = useMemo(() => myRecipes.reduce((s, r) => s + (r.likes ?? 0), 0), [myRecipes])
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthlySessions = useMemo(
    () => diaryEntries.filter((e) => e.date?.startsWith(currentMonth)).length,
    [diaryEntries, currentMonth]
  )
  const mostUsedFlavor = useMemo(() => {
    const counts: Record<string, number> = {}
    myRecipes.forEach((r) => r.flavors?.forEach((f) => { counts[f.name] = (counts[f.name] ?? 0) + 1 }))
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0]
  }, [myRecipes])

  const allPickable = useMemo(() => {
    const myIds = new Set(myRecipes.map((r) => r.id))
    return [...myRecipes, ...presets.filter((p) => !myIds.has(p.id))]
  }, [myRecipes])

  const filteredPickable = useMemo(() => {
    const q = mixSearch.toLowerCase()
    return q ? allPickable.filter((r) => r.name.toLowerCase().includes(q)) : allPickable
  }, [allPickable, mixSearch])

  if (!user) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-icon">👤</div>
          <p className="empty-state-text">マイページはログインが必要です</p>
          <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/login')}>
            ログイン
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="page"><div className="loading"><div className="spinner" />読み込み中...</div></div>
  }

  const displayName = profile?.displayName || user.displayName || 'ユーザー'
  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })
    : ''

  const startEditing = () => {
    setEditName(profile?.displayName || user.displayName || '')
    setEditBio(profile?.bio ?? '')
    setEditCategories(profile?.favoriteCategory ?? [])
    setEditBrands(profile?.favoriteBrand ?? [])
    setIsEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    await saveProfile({
      displayName: editName.trim() || displayName,
      bio: editBio,
      favoriteCategory: editCategories,
      favoriteBrand: editBrands,
    })
    setSaving(false)
    setIsEditing(false)
  }

  const toggleCategory = (cat: string) =>
    setEditCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat])

  const toggleBrand = (brand: string) =>
    setEditBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand])

  const addMix = async (recipeId: string) => {
    if (favMixIds.includes(recipeId) || favMixIds.length >= 3) return
    await saveProfile({ favoriteMixes: [...favMixIds, recipeId] })
    setShowMixPicker(false)
    setMixSearch('')
  }

  const removeMix = async (recipeId: string) => {
    await saveProfile({ favoriteMixes: favMixIds.filter((id) => id !== recipeId) })
  }

  const handleLogout = async () => { await logout(); navigate('/') }

  const handleDeleteAccount = async () => {
    if (!user) return
    const confirmed = window.confirm(
      '退会すると在庫・日記・店舗データが削除されます。投稿したレシピは残ります。\n本当に退会しますか？'
    )
    if (!confirmed) return
    setDeleting(true)
    try {
      await deleteAccount(user)
      navigate('/')
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (code === 'auth/requires-recent-login') {
        alert('セキュリティのため、一度ログアウトして再ログイン後に退会操作を行ってください。')
      } else {
        alert('退会処理に失敗しました。時間をおいて再試行してください。')
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="page">
      {/* プロフィールヘッダー */}
      <div className="profile-hero card">
        <div className="profile-hero-avatar">
          {user.photoURL ? (
            <img src={user.photoURL} alt="avatar" className="profile-avatar-lg" />
          ) : (
            <div className="profile-avatar-placeholder-lg">{displayName[0].toUpperCase()}</div>
          )}
        </div>
        <div className="profile-hero-info">
          <h1 className="profile-hero-name">{displayName}</h1>
          {joinDate && <p className="profile-hero-date">登録: {joinDate}</p>}
          <div className="profile-hero-stats">
            <span>📝 {publicRecipes.length}件</span>
            <span>❤️ {totalLikes}</span>
          </div>
        </div>
        {!isEditing && (
          <button className="btn-ghost profile-edit-btn" onClick={startEditing}>編集</button>
        )}
      </div>

      {/* 編集フォーム or プロフィール表示 */}
      {isEditing ? (
        <div className="card" style={{ marginTop: 12 }}>
          <h2 className="section-title">プロフィール編集</h2>

          <div className="form-group">
            <label className="field-label">表示名</label>
            <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="表示名" maxLength={30} />
          </div>

          <div className="form-group">
            <label className="field-label">
              自己紹介 <span className="char-count">{editBio.length}/100</span>
            </label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="自己紹介を入力..."
              maxLength={100}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="field-label">好きな系統</label>
            <div className="chip-group">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`chip${editCategories.includes(cat) ? ' chip-selected' : ''}`}
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="field-label">よく使うブランド</label>
            <div className="chip-group">
              {BRANDS.map((brand) => (
                <button
                  key={brand}
                  className={`chip${editBrands.includes(brand) ? ' chip-selected' : ''}`}
                  onClick={() => toggleBrand(brand)}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </button>
            <button className="btn-ghost" onClick={() => setIsEditing(false)}>キャンセル</button>
          </div>
        </div>
      ) : (
        (profile?.bio || (profile?.favoriteCategory?.length ?? 0) > 0 || (profile?.favoriteBrand?.length ?? 0) > 0) && (
          <div className="card" style={{ marginTop: 12 }}>
            {profile?.bio && <p className="profile-bio">{profile.bio}</p>}
            {(profile?.favoriteCategory?.length ?? 0) > 0 && (
              <div className="profile-tags-group">
                <p className="profile-tags-label">好きな系統</p>
                <div className="profile-tags">
                  {profile!.favoriteCategory.map((c) => <span key={c} className="tag">{c}</span>)}
                </div>
              </div>
            )}
            {(profile?.favoriteBrand?.length ?? 0) > 0 && (
              <div className="profile-tags-group">
                <p className="profile-tags-label">よく使うブランド</p>
                <div className="profile-tags">
                  {profile!.favoriteBrand.map((b) => <span key={b} className="tag tag-muted">{b}</span>)}
                </div>
              </div>
            )}
          </div>
        )
      )}

      {/* お気に入りミックス */}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="section-header-row">
          <h2 className="section-title">⭐ お気に入りミックス</h2>
          <button className="btn-ghost" onClick={() => setIsMixEditing(!isMixEditing)}>
            {isMixEditing ? '完了' : '編集'}
          </button>
        </div>
        <div className="mix-grid">
          {favMixIds.map((id, i) => {
            const recipe = loadedMixes[i]
            return (
              <div
                key={id}
                className="mix-card"
                onClick={() => !isMixEditing && recipe && navigate(`/recipe/${recipe.id}`)}
              >
                {isMixEditing && (
                  <button
                    className="mix-remove-btn"
                    onClick={(e) => { e.stopPropagation(); removeMix(id) }}
                  >
                    ✕
                  </button>
                )}
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

          {isMixEditing && favMixIds.length < 3 && (
            <button
              className="mix-card mix-card-add"
              onClick={() => { setMixSearch(''); setShowMixPicker(true) }}
            >
              <span className="mix-add-icon">＋</span>
              <span className="mix-add-label">追加</span>
            </button>
          )}

          {!isMixEditing && favMixIds.length === 0 && (
            <p className="mix-empty-hint">「編集」でお気に入りを登録できます</p>
          )}
        </div>
      </div>

      {/* 自分の公開レシピ一覧 */}
      <div style={{ marginTop: 12 }}>
        <div className="section-header-row" style={{ marginBottom: 8 }}>
          <h2 className="section-title">📝 公開レシピ</h2>
          <button className="btn-ghost" onClick={() => navigate('/my')}>管理 ›</button>
        </div>
        {publicRecipes.length > 0 ? (
          publicRecipes.map((r) => <RecipeCard key={r.id} recipe={r} />)
        ) : (
          <div className="card">
            <p className="profile-empty-text">公開レシピはありません</p>
          </div>
        )}
      </div>

      {/* 統計 */}
      <div className="card" style={{ marginTop: 12 }}>
        <h2 className="section-title">📊 統計</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{monthlySessions}</span>
            <span className="stat-label">今月のセッション</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{totalLikes}</span>
            <span className="stat-label">獲得いいね</span>
          </div>
        </div>
        {mostUsedFlavor && (
          <p className="stat-flavor">
            よく使うフレーバー: <strong>{mostUsedFlavor}</strong>
          </p>
        )}
      </div>

      <button className="btn-danger" style={{ marginTop: 24 }} onClick={handleLogout}>
        ログアウト
      </button>

      <button
        onClick={handleDeleteAccount}
        disabled={deleting}
        style={{
          display: 'block',
          margin: '12px auto 0',
          background: 'transparent',
          color: 'var(--color-error)',
          border: 'none',
          fontSize: 13,
          cursor: deleting ? 'not-allowed' : 'pointer',
          opacity: deleting ? 0.5 : 1,
          textDecoration: 'underline',
        }}
      >
        {deleting ? '退会処理中...' : '退会する'}
      </button>

      {/* レシピ選択モーダル */}
      {showMixPicker && (
        <div className="modal-overlay" onClick={() => setShowMixPicker(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 style={{ marginBottom: 12, fontSize: 17 }}>レシピを選択</h2>
            <input
              placeholder="レシピ名で検索..."
              value={mixSearch}
              onChange={(e) => setMixSearch(e.target.value)}
              style={{ marginBottom: 12 }}
              autoFocus
            />
            <div className="mix-picker-list">
              {filteredPickable.slice(0, 50).map((recipe) => {
                const isSelected = favMixIds.includes(recipe.id)
                return (
                  <div
                    key={recipe.id}
                    className={`mix-picker-item${isSelected ? ' mix-picker-item-selected' : ''}`}
                    onClick={() => !isSelected && addMix(recipe.id)}
                  >
                    <div>
                      <p className="mix-picker-item-name">{recipe.name}</p>
                      <p className="mix-picker-item-flavors">
                        {recipe.flavors.map((f) => f.name).join(' × ')}
                      </p>
                    </div>
                    {isSelected && <span className="mix-picker-check">✓</span>}
                  </div>
                )
              })}
              {filteredPickable.length === 0 && (
                <p className="mix-picker-empty">レシピが見つかりません</p>
              )}
            </div>
            <button
              className="btn-ghost"
              style={{ width: '100%', marginTop: 8 }}
              onClick={() => setShowMixPicker(false)}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
