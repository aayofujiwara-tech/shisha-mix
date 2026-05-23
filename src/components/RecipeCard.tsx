import { useNavigate } from 'react-router-dom'
import type { Recipe } from '../types'
import { STRENGTH_LABELS, SWEETNESS_LABELS } from '../types'
import './RecipeCard.css'

const RATIO_COLORS = [
  '#f59e0b', '#3b82f6', '#22c55e', '#a855f7', '#ef4444',
  '#06b6d4', '#f97316', '#14b8a6',
]

interface Props {
  recipe: Recipe
  showAuthor?: boolean
  selected?: boolean
  onSelect?: (recipe: Recipe) => void
}

export default function RecipeCard({ recipe, showAuthor = false, selected = false, onSelect }: Props) {
  const navigate = useNavigate()
  const totalRatio = recipe.flavors.reduce((s, f) => s + f.ratio, 0)

  const handleClick = () => {
    if (onSelect) onSelect(recipe)
    else navigate(`/recipe/${recipe.id}`)
  }

  return (
    <div
      className={`recipe-card card${selected ? ' selected' : ''}`}
      onClick={handleClick}
    >
      {recipe.photos.length > 0 && (
        <div className="recipe-card-photo">
          <img src={recipe.photos[0]} alt={recipe.name} />
        </div>
      )}
      <div className="recipe-card-body">
        <div className="recipe-card-header">
          <h3 className="recipe-card-name">{recipe.name}</h3>
          {recipe.isPublic && <span className="badge badge-amber">公開</span>}
        </div>

        {showAuthor && (
          <p className="recipe-card-author">by {recipe.authorName}</p>
        )}

        <div className="recipe-card-flavors">
          {recipe.flavors.map((f, i) => (
            <span key={i} className="recipe-card-flavor">
              <span className="recipe-card-flavor-dot" style={{ background: RATIO_COLORS[i % RATIO_COLORS.length] }} />
              {f.name} <span className="recipe-card-flavor-brand">({f.brand})</span>
            </span>
          ))}
        </div>

        {totalRatio > 0 && (
          <div className="ratio-bar-container" style={{ marginTop: 8 }}>
            {recipe.flavors.map((f, i) => (
              <div
                key={i}
                className="ratio-bar-segment"
                style={{
                  flex: f.ratio,
                  background: RATIO_COLORS[i % RATIO_COLORS.length],
                  opacity: 0.85,
                }}
              />
            ))}
          </div>
        )}

        <div className="recipe-card-tags">
          {recipe.category.map((c) => (
            <span key={c} className="tag">{c}</span>
          ))}
        </div>

        <div className="recipe-card-meta">
          <span className={`recipe-card-strength strength-${recipe.strength}`}>
            強度: {STRENGTH_LABELS[recipe.strength]}
          </span>
          <span className="recipe-card-divider">·</span>
          <span className="recipe-card-sweetness">
            甘さ: {SWEETNESS_LABELS[recipe.sweetness]}
          </span>
          <span className="recipe-card-divider">·</span>
          <span className="recipe-card-likes">❤️ {recipe.likes}</span>
        </div>
      </div>
    </div>
  )
}
