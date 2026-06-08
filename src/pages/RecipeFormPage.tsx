import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useMyRecipes, getRecipe } from '../hooks/useRecipes'
import PhotoUploader from '../components/PhotoUploader'
import { flavorDB } from '../data/flavorDB'
import { CATEGORIES, BRANDS } from '../types'
import type { Recipe, FlavorItem, RecipeVisibility } from '../types'
import './RecipeFormPage.css'

const EMPTY_VISIBILITY: RecipeVisibility = { photos: true, bowl: true, charcoal: true, packing: true, memo: true }

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="vis-toggle">
      <span className="vis-toggle-label">{label}</span>
      <label className="toggle-switch">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="toggle-slider" />
      </label>
    </label>
  )
}

export default function RecipeFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { createRecipe, updateRecipe } = useMyRecipes(user?.uid ?? null)
  const [recipeId] = useState(() => id ?? `recipe_${Date.now()}`)

  const [name, setName] = useState('')
  const [flavors, setFlavors] = useState<FlavorItem[]>([{ name: '', brand: 'Al Fakher', ratio: 100 }])
  const [category, setCategory] = useState<string[]>([])
  const [strength, setStrength] = useState<Recipe['strength']>('medium')
  const [sweetness, setSweetness] = useState<Recipe['sweetness']>('medium')
  const [photos, setPhotos] = useState<string[]>([])
  const [bowl, setBowl] = useState('')
  const [charcoal, setCharcoal] = useState('')
  const [packing, setPacking] = useState('')
  const [memo, setMemo] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [visibility, setVisibility] = useState<RecipeVisibility>(EMPTY_VISIBILITY)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [existingLikes, setExistingLikes] = useState(0)
  const [existingCreatedAt, setExistingCreatedAt] = useState(0)
  const [flavorSearch, setFlavorSearch] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState<number | null>(null)

  useEffect(() => {
    if (!isEdit || !id) return
    if (authLoading) return
    getRecipe(id)
      .then((r) => {
        if (!r) { setLoadError(true); return }
        if (r.userId !== user?.uid) { navigate('/my'); return }
        const loadedFlavors = (r.flavors ?? []).length > 0
          ? r.flavors.map((f) => ({
              name: f.name ?? '',
              brand: f.brand ?? 'Al Fakher',
              ratio: Number(f.ratio ?? 0),
            }))
          : [{ name: '', brand: 'Al Fakher', ratio: 100 }]
        setName(r.name ?? '')
        setFlavors(loadedFlavors)
        setFlavorSearch(loadedFlavors.map(() => ''))
        setCategory(r.category ?? [])
        setStrength(r.strength ?? 'medium')
        setSweetness(r.sweetness ?? 'medium')
        setPhotos(r.photos ?? [])
        setBowl(r.bowl ?? '')
        setCharcoal(r.charcoal ?? '')
        setPacking(r.packing ?? '')
        setMemo(r.memo ?? '')
        setIsPublic(r.isPublic ?? false)
        setVisibility(r.visibility ?? EMPTY_VISIBILITY)
        setExistingLikes(r.likes ?? 0)
        setExistingCreatedAt(r.createdAt ?? Date.now())
      })
      .catch(() => setLoadError(true))
  }, [isEdit, id, user, authLoading])

  const addFlavor = () => setFlavors((prev) => [...prev, { name: '', brand: 'Al Fakher', ratio: 0 }])
  const removeFlavor = (i: number) => setFlavors((prev) => prev.filter((_, idx) => idx !== i))
  const updateFlavor = (i: number, field: keyof FlavorItem, value: string | number) => {
    setFlavors((prev) => prev.map((f, idx) => idx === i ? { ...f, [field]: value } : f))
  }

  const totalRatio = flavors.reduce((sum, f) => sum + Number(f.ratio ?? 0), 0)

  const getSuggestions = (idx: number) => {
    const q = flavorSearch[idx] ?? ''
    if (!q.trim()) return []
    return flavorDB.filter((f) => f.name.toLowerCase().includes(q.toLowerCase()) || f.brand.toLowerCase().includes(q.toLowerCase())).slice(0, 6)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!name.trim()) return
    if (flavors.some((f) => !f.name.trim())) return
    if (totalRatio !== 100) {
      setSaveError(`フレーバーの合計が ${totalRatio}% です。100% になるよう調整してください。`)
      return
    }

    setLoading(true)
    setSaveError(null)
    try {
      const now = Date.now()
      const data: Omit<Recipe, 'id'> = {
        userId: user.uid,
        authorName: user.displayName || 'ゲスト',
        name: name.trim(),
        flavors: flavors.map((f) => ({ ...f, ratio: Number(f.ratio ?? 0) })),
        category,
        strength,
        sweetness,
        photos,
        ...(bowl.trim() ? { bowl: bowl.trim() } : {}),
        ...(charcoal.trim() ? { charcoal: charcoal.trim() } : {}),
        ...(packing.trim() ? { packing: packing.trim() } : {}),
        ...(memo.trim() ? { memo: memo.trim() } : {}),
        isPublic,
        visibility,
        likes: isEdit ? existingLikes : 0,
        createdAt: isEdit ? existingCreatedAt : now,
        updatedAt: now,
      }
      if (isEdit && id) {
        await updateRecipe(id, { ...data, id })
      } else {
        await createRecipe(data)
      }
      navigate('/my')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('PERMISSION_DENIED') || msg.includes('permission')) {
        setSaveError('保存権限がありません。再ログインしてお試しください。')
      } else {
        setSaveError('保存に失敗しました。時間をおいて再試行してください。')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loadError) {
    return (
      <div className="page recipe-form-page">
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <p className="empty-state-text">データの読み込みに失敗しました</p>
          <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/my')}>
            マイレシピ一覧に戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page recipe-form-page">
      <div className="page-header">
        <button className="back-btn-sm" onClick={() => navigate(-1)}>← 戻る</button>
        <h1 className="page-title">{isEdit ? 'レシピ編集' : '新規レシピ'}</h1>
        <div />
      </div>

      <form onSubmit={handleSubmit}>
        {/* レシピ名 */}
        <div className="form-group">
          <label className="field-label">レシピ名 <span className="required">*</span></label>
          <input
            type="text"
            placeholder="例：ウォーターメロン×ミント"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* フレーバー */}
        <div className="form-group">
          <label className="field-label">フレーバー <span className="required">*</span></label>
          {flavors.map((f, i) => (
            <div key={i} className="flavor-input-row">
              <div className="flavor-input-name-wrap">
                <input
                  type="text"
                  placeholder="フレーバー名"
                  value={flavorSearch[i] !== undefined ? (showSuggestions === i ? flavorSearch[i] : f.name) : f.name}
                  onChange={(e) => {
                    const v = e.target.value
                    setFlavorSearch((prev) => { const a = [...prev]; a[i] = v; return a })
                    updateFlavor(i, 'name', v)
                    setShowSuggestions(i)
                  }}
                  onFocus={() => { setFlavorSearch((prev) => { const a = [...prev]; a[i] = f.name; return a }); setShowSuggestions(i) }}
                  onBlur={() => setTimeout(() => setShowSuggestions(null), 150)}
                  required
                  className="flavor-name-input"
                />
                {showSuggestions === i && getSuggestions(i).length > 0 && (
                  <div className="flavor-suggestions">
                    {getSuggestions(i).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className="flavor-suggestion-item"
                        onMouseDown={() => {
                          updateFlavor(i, 'name', s.name)
                          updateFlavor(i, 'brand', s.brand)
                          setFlavorSearch((prev) => { const a = [...prev]; a[i] = s.name; return a })
                          setShowSuggestions(null)
                        }}
                      >
                        <span>{s.name}</span>
                        <span className="flavor-suggestion-brand">{s.brand}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <select
                value={f.brand}
                onChange={(e) => updateFlavor(i, 'brand', e.target.value)}
                className="flavor-brand-select"
              >
                {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <input
                type="number"
                min={0}
                max={100}
                value={f.ratio}
                onChange={(e) => updateFlavor(i, 'ratio', Number(e.target.value))}
                className="flavor-ratio-input"
                placeholder="%"
              />
              {flavors.length > 1 && (
                <button type="button" className="flavor-remove" onClick={() => removeFlavor(i)}>✕</button>
              )}
            </div>
          ))}
          {flavors.length < 8 && (
            <button type="button" className="add-flavor-btn" onClick={addFlavor}>+ フレーバーを追加</button>
          )}
          <div className={`ratio-total-indicator${totalRatio === 100 ? ' ok' : ''}`}>
            合計: <strong>{totalRatio}%</strong> / 100%
            {totalRatio !== 100 && <span className="ratio-total-hint"> （100% になるよう調整してください）</span>}
          </div>
        </div>

        {/* 系統タグ */}
        <div className="form-group">
          <label className="field-label">系統タグ</label>
          <div className="filter-chips" style={{ flexWrap: 'wrap', gap: 6, display: 'flex' }}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className={`filter-chip${category.includes(c) ? ' selected' : ''}`}
                onClick={() => setCategory((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* 強度・甘さ */}
        <div className="form-row">
          <div className="form-group half">
            <label className="field-label">強度</label>
            <select value={strength} onChange={(e) => setStrength(e.target.value as Recipe['strength'])}>
              <option value="weak">弱</option>
              <option value="medium">中</option>
              <option value="strong">強</option>
            </select>
          </div>
          <div className="form-group half">
            <label className="field-label">甘さ</label>
            <select value={sweetness} onChange={(e) => setSweetness(e.target.value as Recipe['sweetness'])}>
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
        </div>

        {/* 写真 */}
        <div className="form-group">
          <div className="field-row">
            <label className="field-label">写真</label>
            <Toggle checked={visibility.photos} onChange={(v) => setVisibility((p) => ({ ...p, photos: v }))} label="公開" />
          </div>
          <PhotoUploader photos={photos} onChange={setPhotos} userId={user?.uid ?? 'guest'} recipeId={recipeId} />
        </div>

        {/* ボウル */}
        <div className="form-group">
          <div className="field-row">
            <label className="field-label">ボウル種類</label>
            <Toggle checked={visibility.bowl} onChange={(v) => setVisibility((p) => ({ ...p, bowl: v }))} label="公開" />
          </div>
          <input type="text" placeholder="例：ファネルボウル" value={bowl} onChange={(e) => setBowl(e.target.value)} />
        </div>

        {/* 炭 */}
        <div className="form-group">
          <div className="field-row">
            <label className="field-label">炭の種類・数</label>
            <Toggle checked={visibility.charcoal} onChange={(v) => setVisibility((p) => ({ ...p, charcoal: v }))} label="公開" />
          </div>
          <input type="text" placeholder="例：ネコチャ 3個" value={charcoal} onChange={(e) => setCharcoal(e.target.value)} />
        </div>

        {/* パッキング */}
        <div className="form-group">
          <div className="field-row">
            <label className="field-label">パッキング方法</label>
            <Toggle checked={visibility.packing} onChange={(v) => setVisibility((p) => ({ ...p, packing: v }))} label="公開" />
          </div>
          <input type="text" placeholder="例：フラットパック" value={packing} onChange={(e) => setPacking(e.target.value)} />
        </div>

        {/* メモ */}
        <div className="form-group">
          <div className="field-row">
            <label className="field-label">感想・メモ</label>
            <Toggle checked={visibility.memo} onChange={(v) => setVisibility((p) => ({ ...p, memo: v }))} label="公開" />
          </div>
          <textarea
            placeholder="味・香り・改善点など自由に記録"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={4}
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* 公開設定 */}
        <div className="form-group">
          <div className="public-toggle-row card">
            <div>
              <p className="public-toggle-title">レシピを公開する</p>
              <p className="public-toggle-desc">ONにすると検索・提案画面に表示されます</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        {saveError && <p className="form-save-error">{saveError}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? '保存中...' : isEdit ? '変更を保存' : 'レシピを作成'}
        </button>
      </form>
    </div>
  )
}
