import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRecipe, useLikes } from '../hooks/useRecipes'
import { useAuth } from '../hooks/useAuth'
import { useSessionTimer } from '../hooks/useSessionTimer'
import type { Recipe } from '../types'
import { STRENGTH_LABELS, SWEETNESS_LABELS } from '../types'
import FlavorCalculator from '../components/FlavorCalculator'
import RecipeShare from '../components/RecipeShare'
import './RecipeDetailPage.css'
import '../components/SessionTimer.css'

const RATIO_COLORS = ['#f59e0b','#3b82f6','#22c55e','#a855f7','#ef4444','#06b6d4','#f97316','#14b8a6']

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { requestStart } = useSessionTimer()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [photoIdx, setPhotoIdx] = useState(0)
  const { liked, loading: likesLoading, likesCount, toggle } = useLikes(id ?? '', user?.uid)

  useEffect(() => {
    if (!id) return
    getRecipe(id).then((r) => { setRecipe(r); setLoading(false) }).catch(() => { setRecipe(null); setLoading(false) })
  }, [id])

  if (loading) return <div className="loading"><div className="spinner" />読み込み中...</div>
  if (!recipe) return (
    <div className="page">
      <div className="empty-state">
        <div className="empty-state-icon">😕</div>
        <p className="empty-state-text">レシピが見つかりません</p>
        <button className="btn-secondary" style={{ marginTop: 16 }} onClick={() => navigate(-1)}>戻る</button>
      </div>
    </div>
  )

  const isOwner = user?.uid === recipe.userId
  const visibility = recipe.visibility ?? { photos: true, bowl: true, charcoal: true, packing: true, memo: true }
  const canShowField = (field: keyof typeof visibility) =>
    visibility[field] || isOwner

  const photos = recipe.photos ?? []
  const categories = recipe.category ?? []
  const flavors = recipe.flavors ?? []

  const handleLike = async () => {
    if (!user) { navigate('/login'); return }
    await toggle()
  }

  return (
    <div className="page recipe-detail-page">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← 戻る</button>
        {isOwner && (
          <button className="edit-btn" onClick={() => navigate(`/my/edit/${recipe.id}`)}>編集</button>
        )}
      </div>

      {photos.length > 0 && canShowField('photos') && (
        <div className="detail-photos">
          <div className="detail-photo-main">
            <img src={photos[photoIdx]} alt={recipe.name} />
          </div>
          {photos.length > 1 && (
            <div className="detail-photo-thumbs">
              {photos.map((url, i) => (
                <button
                  key={i}
                  className={`detail-photo-thumb${i === photoIdx ? ' active' : ''}`}
                  onClick={() => setPhotoIdx(i)}
                >
                  <img src={url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="detail-body">
        <div className="detail-title-row">
          <h1 className="detail-title">{recipe.name}</h1>
          <button
            className={`like-btn${liked ? ' liked' : ''}`}
            onClick={handleLike}
            disabled={likesLoading}
          >
            {liked ? '❤️' : '🤍'} {likesCount}
          </button>
        </div>

        <p className="detail-author">by {recipe.authorName}</p>

        <div className="detail-tags">
          {categories.map((c) => <span key={c} className="tag">{c}</span>)}
          <span className={`tag tag-muted strength-${recipe.strength}`}>強度: {STRENGTH_LABELS[recipe.strength]}</span>
          <span className="tag tag-muted">甘さ: {SWEETNESS_LABELS[recipe.sweetness]}</span>
        </div>

        <div className="divider" />

        <h2 className="detail-section-title">フレーバー構成</h2>
        <div className="ratio-bar-container" style={{ marginBottom: 12, height: 12 }}>
          {flavors.map((f, i) => (
            <div key={i} className="ratio-bar-segment" style={{ flex: f.ratio, background: RATIO_COLORS[i % RATIO_COLORS.length] }} />
          ))}
        </div>
        {flavors.map((f, i) => (
          <div key={i} className="flavor-row">
            <span className="flavor-dot" style={{ background: RATIO_COLORS[i % RATIO_COLORS.length] }} />
            <span className="flavor-name">{f.name}</span>
            <span className="flavor-brand">{f.brand}</span>
            <span className="flavor-ratio">{f.ratio}%</span>
          </div>
        ))}

        {canShowField('bowl') && recipe.bowl && <>
          <div className="divider" />
          <div className="detail-field">
            <span className="detail-field-label">ボウル</span>
            <span className="detail-field-value">{recipe.bowl}</span>
          </div>
        </>}

        {canShowField('charcoal') && recipe.charcoal && <>
          <div className="detail-field">
            <span className="detail-field-label">炭</span>
            <span className="detail-field-value">{recipe.charcoal}</span>
          </div>
        </>}

        {canShowField('packing') && recipe.packing && <>
          <div className="detail-field">
            <span className="detail-field-label">パッキング</span>
            <span className="detail-field-value">{recipe.packing}</span>
          </div>
        </>}

        {canShowField('memo') && recipe.memo && <>
          <div className="divider" />
          <h2 className="detail-section-title">メモ・感想</h2>
          <p className="detail-memo">{recipe.memo}</p>
        </>}

        {isOwner && (
          <div className="detail-visibility-note">
            <span>公開設定: </span>
            <span className={recipe.isPublic ? 'badge badge-green' : 'badge badge-red'}>
              {recipe.isPublic ? '公開中' : '非公開'}
            </span>
          </div>
        )}

        <button
          className="btn-start-session"
          onClick={() => requestStart(recipe.id, recipe.name)}
        >
          ▶ このレシピでセッション開始
        </button>

        <FlavorCalculator recipe={recipe} />
        <RecipeShare recipe={recipe} />
      </div>
    </div>
  )
}
