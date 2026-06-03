import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useInventory } from '../hooks/useInventory'
import { flavorDB } from '../data/flavorDB'
import { BRANDS, CATEGORIES, STATUS_LABELS } from '../types'
import type { InventoryFlavor } from '../types'
import FlavorCompatibility from '../components/FlavorCompatibility'
import './InventoryPage.css'

export default function InventoryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { flavors, loading, addFlavor, updateStatus, removeFlavor } = useInventory(user?.uid ?? null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addMode, setAddMode] = useState<'db' | 'custom'>('db')
  const [dbSearch, setDbSearch] = useState('')
  const [customName, setCustomName] = useState('')
  const [customBrand, setCustomBrand] = useState('Al Fakher')
  const [customCategory, setCustomCategory] = useState('フルーツ系')
  const [filterStatus, setFilterStatus] = useState<InventoryFlavor['status'] | 'all'>('all')
  const [adding, setAdding] = useState(false)
  const [activeTab, setActiveTab] = useState<'inventory' | 'compat'>('inventory')

  if (!user) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-icon">🔒</div>
          <p className="empty-state-text">在庫管理にはログインが必要です</p>
          <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/login')}>ログイン</button>
        </div>
      </div>
    )
  }

  const filtered = filterStatus === 'all' ? flavors : flavors.filter((f) => f.status === filterStatus)
  const emptyList = flavors.filter((f) => f.status === 'empty')

  const dbResults = dbSearch.trim()
    ? flavorDB.filter((f) => f.name.toLowerCase().includes(dbSearch.toLowerCase()) || f.brand.toLowerCase().includes(dbSearch.toLowerCase()))
    : []

  const handleAddFromDB = async (item: typeof flavorDB[0]) => {
    setAdding(true)
    await addFlavor({
      name: item.name,
      brand: item.brand,
      category: item.category,
      status: 'full',
      isCustom: false,
      addedAt: Date.now(),
    })
    setAdding(false)
    setShowAddModal(false)
    setDbSearch('')
  }

  const handleAddCustom = async () => {
    if (!customName.trim()) return
    setAdding(true)
    await addFlavor({
      name: customName.trim(),
      brand: customBrand,
      category: customCategory,
      status: 'full',
      isCustom: true,
      addedAt: Date.now(),
    })
    setAdding(false)
    setShowAddModal(false)
    setCustomName('')
  }

  const copyShoppingList = () => {
    const text = emptyList.map((f) => `${f.name}（${f.brand}）`).join('\n')
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">在庫管理</h1>
        <button className="add-recipe-btn" onClick={() => setShowAddModal(true)}>＋ 追加</button>
      </div>

      <div className="inv-tab-row">
        <button className={`inv-tab${activeTab === 'inventory' ? ' active' : ''}`} onClick={() => setActiveTab('inventory')}>在庫一覧</button>
        <button className={`inv-tab${activeTab === 'compat' ? ' active' : ''}`} onClick={() => setActiveTab('compat')}>相性診断</button>
      </div>

      {activeTab === 'inventory' && (
        <>
          {/* ステータスフィルター */}
          <div className="inv-filter-row">
            {(['all', 'full', 'low', 'empty'] as const).map((s) => (
              <button
                key={s}
                className={`inv-filter-btn${filterStatus === s ? ' active' : ''}`}
                onClick={() => setFilterStatus(s)}
              >
                {s === 'all' ? `すべて (${flavors.length})` :
                 s === 'full' ? `あり (${flavors.filter((f) => f.status === 'full').length})` :
                 s === 'low' ? `残り少し (${flavors.filter((f) => f.status === 'low').length})` :
                 `なし (${emptyList.length})`}
              </button>
            ))}
          </div>

          {/* 買い物リスト */}
          {emptyList.length > 0 && (
            <div className="shopping-list-banner card">
              <div>
                <p className="shopping-list-title">🛒 買い物リスト ({emptyList.length}件)</p>
                <p className="shopping-list-items">{emptyList.map((f) => f.name).join('・')}</p>
              </div>
              <button className="copy-btn" onClick={copyShoppingList}>コピー</button>
            </div>
          )}

          {loading ? (
            <div className="loading"><div className="spinner" />読み込み中...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <p className="empty-state-text">
                {flavors.length === 0 ? '在庫フレーバーを追加しましょう' : '該当するフレーバーがありません'}
              </p>
            </div>
          ) : (
            <div className="inv-grid">
              {filtered.map((f) => (
                <div key={f.id} className="inv-item card">
                  <div className="inv-item-info">
                    <p className="inv-item-name">{f.name}</p>
                    <p className="inv-item-brand">{f.brand} · {f.category}</p>
                  </div>
                  <div className="inv-item-controls">
                    <select
                      value={f.status}
                      onChange={(e) => updateStatus(f.id, e.target.value as InventoryFlavor['status'])}
                      className={`inv-status-select status-${f.status}`}
                    >
                      <option value="full">あり</option>
                      <option value="low">残り少し</option>
                      <option value="empty">なし</option>
                    </select>
                    <button className="inv-remove-btn" onClick={() => removeFlavor(f.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 追加モーダル */}
          {showAddModal && (
            <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-handle" />
                <h3 style={{ marginBottom: 16, fontSize: 16 }}>フレーバーを追加</h3>

                <div className="add-mode-tabs">
                  <button className={`add-mode-tab${addMode === 'db' ? ' active' : ''}`} onClick={() => setAddMode('db')}>DBから選択</button>
                  <button className={`add-mode-tab${addMode === 'custom' ? ' active' : ''}`} onClick={() => setAddMode('custom')}>手入力</button>
                </div>

                {addMode === 'db' ? (
                  <>
                    <input
                      type="search"
                      placeholder="フレーバー名・ブランドで検索"
                      value={dbSearch}
                      onChange={(e) => setDbSearch(e.target.value)}
                      style={{ marginBottom: 8 }}
                    />
                    <div className="db-results">
                      {dbResults.length === 0 && dbSearch && (
                        <p className="db-no-result">見つかりません。手入力で追加できます。</p>
                      )}
                      {!dbSearch && (
                        <p className="db-hint">フレーバー名やブランド名で検索してください</p>
                      )}
                      {dbResults.map((item) => {
                        const already = flavors.some((f) => f.name === item.name && f.brand === item.brand)
                        return (
                          <button
                            key={item.id}
                            className={`db-result-item${already ? ' already' : ''}`}
                            onClick={() => !already && handleAddFromDB(item)}
                            disabled={already || adding}
                          >
                            <span className="db-result-name">{item.name}</span>
                            <span className="db-result-meta">{item.brand} · {item.category}</span>
                            {already && <span className="db-already-badge">追加済み</span>}
                          </button>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="field-label">フレーバー名</label>
                      <input
                        type="text"
                        placeholder="例：カスタムフレーバー"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="field-label">ブランド</label>
                      <select value={customBrand} onChange={(e) => setCustomBrand(e.target.value)}>
                        {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="field-label">系統</label>
                      <select value={customCategory} onChange={(e) => setCustomCategory(e.target.value)}>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <button className="btn-primary" onClick={handleAddCustom} disabled={!customName.trim() || adding}>
                      {adding ? '追加中...' : '追加する'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'compat' && <FlavorCompatibility userId={user.uid} />}
    </div>
  )
}

export { STATUS_LABELS }
