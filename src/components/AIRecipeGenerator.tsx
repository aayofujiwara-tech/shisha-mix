import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { useAuth } from '../hooks/useAuth'
import { useInventory } from '../hooks/useInventory'
import { useMyRecipes } from '../hooks/useRecipes'
import { useSessionTimer } from '../hooks/useSessionTimer'
import type { Recipe } from '../types'
import { STRENGTH_LABELS, SWEETNESS_LABELS } from '../types'
import './AIRecipeGenerator.css'

const RATIO_COLORS = ['#f59e0b','#3b82f6','#22c55e','#a855f7','#ef4444','#06b6d4','#f97316','#14b8a6']

interface AIRecipe {
  name: string
  flavors: Array<{ name: string; brand: string; ratio: number }>
  category: string[]
  strength: Recipe['strength']
  sweetness: Recipe['sweetness']
  memo?: string
}

export default function AIRecipeGenerator() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { requestStart } = useSessionTimer()
  const { flavors: inventory } = useInventory(user?.uid ?? null)
  const { createRecipe } = useMyRecipes(user?.uid ?? null)

  const [input, setInput] = useState('')
  const [useInventoryFlavors, setUseInventoryFlavors] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generated, setGenerated] = useState<AIRecipe | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [cooldown, setCooldown] = useState(false)

  const generate = async () => {
    if (!input.trim() || loading || cooldown) return
    setLoading(true)
    setError(null)
    setGenerated(null)
    setSaved(false)

    const inventoryPayload =
      useInventoryFlavors && user
        ? inventory
            .filter((f) => f.status !== 'empty')
            .map((f) => ({ name: f.name, brand: f.brand }))
        : undefined

    try {
      const idToken = await auth.currentUser?.getIdToken()
      if (!idToken) throw new Error('ログインが必要です')
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ userInput: input, inventory: inventoryPayload }),
      })
      const data = await res.json() as { recipe?: AIRecipe; error?: string }
      if (!res.ok || data.error) throw new Error(data.error ?? 'エラーが発生しました')
      setGenerated(data.recipe!)
    } catch (err) {
      setError((err as Error).message || '生成に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
      setCooldown(true)
      setTimeout(() => setCooldown(false), 3000)
    }
  }

  const handleSave = async () => {
    if (!user) { navigate('/login'); return }
    if (!generated) return
    setSaving(true)
    const now = Date.now()
    await createRecipe({
      userId: user.uid,
      authorName: user.displayName || 'ゲスト',
      name: generated.name,
      flavors: generated.flavors,
      category: generated.category,
      strength: generated.strength,
      sweetness: generated.sweetness,
      memo: generated.memo ?? '',
      photos: [],
      bowl: '',
      charcoal: '',
      packing: '',
      isPublic: false,
      visibility: { photos: true, bowl: true, charcoal: true, packing: true, memo: true },
      likes: 0,
      createdAt: now,
      updatedAt: now,
    })
    setSaving(false)
    setSaved(true)
  }

  const handleRegenerate = () => {
    setGenerated(null)
    setSaved(false)
    generate()
  }

  const totalRatio = generated?.flavors.reduce((s, f) => s + f.ratio, 0) ?? 0

  return (
    <div className="ai-gen">
      <div className="ai-gen-header">
        <span className="ai-gen-badge">AI</span>
        <h2 className="ai-gen-title">AIにレシピを考えてもらう</h2>
      </div>

      <div className="ai-gen-form">
        <textarea
          className="ai-gen-textarea"
          placeholder="今日の気分や要望を入力...&#10;例：爽やかで甘め、グレープを使いたい"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          disabled={loading}
        />

        {user && (
          <label className="ai-gen-inventory-row">
            <input
              type="checkbox"
              checked={useInventoryFlavors}
              onChange={(e) => setUseInventoryFlavors(e.target.checked)}
              disabled={loading || inventory.filter((f) => f.status !== 'empty').length === 0}
            />
            <span className="ai-gen-inventory-label">
              在庫のフレーバーを使う
              {inventory.filter((f) => f.status !== 'empty').length > 0 && (
                <span className="ai-gen-inventory-count">
                  ({inventory.filter((f) => f.status !== 'empty').length}種)
                </span>
              )}
            </span>
          </label>
        )}

        <button
          className="ai-gen-btn"
          onClick={generate}
          disabled={loading || cooldown || !input.trim()}
        >
          {loading ? (
            <><span className="ai-gen-spinner" /> Claudeがレシピを考えています...</>
          ) : (
            '✨ AIレシピを生成する'
          )}
        </button>

        {error && <p className="ai-gen-error">{error}</p>}
      </div>

      {generated && (
        <div className="ai-gen-result">
          <div className="ai-gen-result-header">
            <div>
              <h3 className="ai-gen-result-name">{generated.name}</h3>
              <p className="ai-gen-result-by">by Claude AI</p>
            </div>
          </div>

          <div className="ratio-bar-container" style={{ height: 8, marginBottom: 10 }}>
            {generated.flavors.map((f, i) => (
              <div
                key={i}
                className="ratio-bar-segment"
                style={{ flex: f.ratio, background: RATIO_COLORS[i % RATIO_COLORS.length] }}
              />
            ))}
          </div>

          {generated.flavors.map((f, i) => (
            <div key={i} className="ai-gen-flavor-row">
              <span className="ai-gen-flavor-dot" style={{ background: RATIO_COLORS[i % RATIO_COLORS.length] }} />
              <span className="ai-gen-flavor-name">{f.name}</span>
              <span className="ai-gen-flavor-brand">({f.brand})</span>
              <span className="ai-gen-flavor-ratio">
                {totalRatio > 0 ? Math.round((f.ratio / totalRatio) * 100) : f.ratio}%
              </span>
            </div>
          ))}

          <div className="ai-gen-tags">
            {generated.category.map((c) => (
              <span key={c} className="tag">{c}</span>
            ))}
            <span className="tag tag-muted">強度: {STRENGTH_LABELS[generated.strength]}</span>
            <span className="tag tag-muted">甘さ: {SWEETNESS_LABELS[generated.sweetness]}</span>
          </div>

          {generated.memo && <p className="ai-gen-memo">{generated.memo}</p>}

          <div className="ai-gen-result-actions">
            <button className="btn-secondary ai-gen-action-btn" onClick={handleRegenerate} disabled={loading || cooldown}>
              🔄 再生成
            </button>
            <button
              className="btn-primary ai-gen-action-btn"
              onClick={handleSave}
              disabled={saving || saved}
            >
              {saved ? '✓ 保存済み' : saving ? '保存中...' : '🍃 マイレシピに保存'}
            </button>
          </div>

          <button
            className="btn-start-session"
            onClick={() => requestStart('ai-' + Date.now(), generated.name)}
          >
            ▶ このレシピでセッション開始
          </button>
        </div>
      )}
    </div>
  )
}
