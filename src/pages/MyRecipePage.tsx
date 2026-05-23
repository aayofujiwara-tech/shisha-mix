import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useMyRecipes } from '../hooks/useRecipes'
import RecipeCard from '../components/RecipeCard'
import './MyRecipePage.css'

export default function MyRecipePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { recipes, loading, deleteRecipe } = useMyRecipes(user?.uid ?? null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  if (!user) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-icon">🔒</div>
          <p className="empty-state-text">マイレシピの管理にはログインが必要です</p>
          <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/login')}>ログイン</button>
        </div>
      </div>
    )
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await deleteRecipe(deleteTarget)
    setDeleteTarget(null)
    setDeleting(false)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">マイレシピ</h1>
        <button className="add-recipe-btn" onClick={() => navigate('/my/new')}>＋ 作成</button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" />読み込み中...</div>
      ) : recipes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <p className="empty-state-text">まだレシピがありません<br />「＋ 作成」ボタンで最初のレシピを作りましょう！</p>
        </div>
      ) : (
        <>
          <p className="my-recipe-count">{recipes.length}件のレシピ</p>
          {recipes.map((r) => (
            <div key={r.id} className="my-recipe-item">
              <RecipeCard recipe={r} />
              <div className="my-recipe-actions">
                <button className="my-recipe-edit" onClick={() => navigate(`/my/edit/${r.id}`)}>編集</button>
                <button className="my-recipe-delete" onClick={() => setDeleteTarget(r.id)}>削除</button>
              </div>
            </div>
          ))}
        </>
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ marginBottom: 12, fontSize: 16 }}>レシピを削除しますか？</h3>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 24 }}>
              この操作は取り消せません。
            </p>
            <button className="btn-danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? '削除中...' : '削除する'}
            </button>
            <button className="btn-ghost" style={{ marginTop: 12 }} onClick={() => setDeleteTarget(null)}>
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
