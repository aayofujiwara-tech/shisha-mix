import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLikes } from '../hooks/useRecipes'
import { useSessionTimer } from '../hooks/useSessionTimer'
import type { Recipe } from '../types'
import { STRENGTH_LABELS, SWEETNESS_LABELS } from '../types'
import CommentSection from './CommentSection'
import './RecipeDetailPanel.css'
import './SessionTimer.css'

const RATIO_COLORS = ['#f59e0b','#3b82f6','#22c55e','#a855f7','#ef4444','#06b6d4','#f97316','#14b8a6']

interface Props {
  recipe: Recipe
  onClose: () => void
}

export default function RecipeDetailPanel({ recipe: initial, onClose }: Props) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { requestStart } = useSessionTimer()
  const [recipe] = useState(initial)
  const flavors = recipe.flavors ?? []
  const photos = recipe.photos ?? []
  const categories = recipe.category ?? []
  const [photoIdx, setPhotoIdx] = useState(0)
  const { liked, loading: likesLoading, likesCount, toggle } = useLikes(recipe.id, user?.uid, initial.likes)

  const isOwner = user?.uid === recipe.userId
  const canShowField = (field: keyof typeof recipe.visibility) =>
    recipe.visibility[field] || isOwner

  const handleLike = async () => {
    if (!user) { navigate('/login'); return }
    await toggle()
  }

  return (
    <div className="detail-panel">
      <div className="detail-panel-header">
        <h2 className="detail-panel-title">レシピ詳細</h2>
        <div className="detail-panel-actions">
          {isOwner && (
            <button className="detail-panel-edit" onClick={() => navigate(`/my/edit/${recipe.id}`)}>
              編集
            </button>
          )}
          <button className="detail-panel-close" onClick={onClose}>✕</button>
        </div>
      </div>

      <div className="detail-panel-body">
        {photos.length > 0 && canShowField('photos') && (
          <div className="dp-photos">
            <div className="dp-photo-main">
              <img src={photos[photoIdx]} alt={recipe.name} />
            </div>
            {photos.length > 1 && (
              <div className="dp-photo-thumbs">
                {photos.map((url, i) => (
                  <button
                    key={i}
                    className={`dp-photo-thumb${i === photoIdx ? ' active' : ''}`}
                    onClick={() => setPhotoIdx(i)}
                  >
                    <img src={url} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="dp-title-row">
          <h1 className="dp-title">{recipe.name}</h1>
          <button
            className={`dp-like${liked ? ' liked' : ''}`}
            onClick={handleLike}
            disabled={likesLoading}
          >
            {liked ? '❤️' : '🤍'} {likesCount}
          </button>
        </div>

        <p className="dp-author">by {recipe.authorName}</p>

        <div className="dp-tags">
          {categories.map((c) => <span key={c} className="tag">{c}</span>)}
          <span className={`tag tag-muted strength-${recipe.strength}`}>
            強度: {STRENGTH_LABELS[recipe.strength]}
          </span>
          <span className="tag tag-muted">甘さ: {SWEETNESS_LABELS[recipe.sweetness]}</span>
        </div>

        <div className="divider" />

        <h3 className="dp-section-title">フレーバー構成</h3>
        <div className="ratio-bar-container" style={{ marginBottom: 12, height: 10 }}>
          {flavors.map((f, i) => (
            <div key={i} className="ratio-bar-segment"
              style={{ flex: f.ratio ?? 0, background: RATIO_COLORS[i % RATIO_COLORS.length] }} />
          ))}
        </div>
        {flavors.map((f, i) => (
          <div key={i} className="dp-flavor-row">
            <span className="dp-flavor-dot" style={{ background: RATIO_COLORS[i % RATIO_COLORS.length] }} />
            <span className="dp-flavor-name">{f.name}</span>
            <span className="dp-flavor-brand">{f.brand}</span>
            <span className="dp-flavor-ratio">{f.ratio ?? 0}%</span>
          </div>
        ))}

        {(canShowField('bowl') && recipe.bowl) ||
         (canShowField('charcoal') && recipe.charcoal) ||
         (canShowField('packing') && recipe.packing) ? (
          <>
            <div className="divider" />
            {canShowField('bowl') && recipe.bowl && (
              <div className="dp-field">
                <span className="dp-field-label">ボウル</span>
                <span className="dp-field-value">{recipe.bowl}</span>
              </div>
            )}
            {canShowField('charcoal') && recipe.charcoal && (
              <div className="dp-field">
                <span className="dp-field-label">炭</span>
                <span className="dp-field-value">{recipe.charcoal}</span>
              </div>
            )}
            {canShowField('packing') && recipe.packing && (
              <div className="dp-field">
                <span className="dp-field-label">パッキング</span>
                <span className="dp-field-value">{recipe.packing}</span>
              </div>
            )}
          </>
        ) : null}

        {canShowField('memo') && recipe.memo && (
          <>
            <div className="divider" />
            <h3 className="dp-section-title">メモ・感想</h3>
            <p className="dp-memo">{recipe.memo}</p>
          </>
        )}

        <button
          className="btn-start-session"
          onClick={() => requestStart(recipe.id, recipe.name)}
        >
          ▶ このレシピでセッション開始
        </button>

        <CommentSection
          recipeId={recipe.id}
          userId={user?.uid}
          userName={user?.displayName || undefined}
        />
      </div>
    </div>
  )
}
