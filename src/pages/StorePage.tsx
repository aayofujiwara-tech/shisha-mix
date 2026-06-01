import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useStore } from '../hooks/useStore'
import { useMyRecipes } from '../hooks/useRecipes'
import TableCard from '../components/TableCard'
import TableDetailPanel from '../components/TableDetailPanel'
import TableFormModal from '../components/TableFormModal'
import type { StoreTable } from '../types'
import './StorePage.css'

export default function StorePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    storeName, tables, loading,
    updateStoreName, addTable, updateTable, removeTable,
    startSession, recordCoalChange, endSession, updateMemo,
  } = useStore(user?.uid ?? null)
  const { recipes } = useMyRecipes(user?.uid ?? null)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingTable, setEditingTable] = useState<StoreTable | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')

  if (!user) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-icon">🔒</div>
          <p className="empty-state-text">店舗管理にはログインが必要です</p>
          <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/login')}>
            ログイン
          </button>
        </div>
      </div>
    )
  }

  const selected = selectedId ? (tables.find((t) => t.id === selectedId) ?? null) : null
  const overdue = tables.filter((t) => t.status === 'overdue')
  const warning = tables.filter((t) => t.status === 'warning')

  const openAdd = () => { setEditingTable(null); setShowFormModal(true) }
  const openEdit = (t: StoreTable) => { setEditingTable(t); setShowFormModal(true) }

  const handleSaveTable = async (data: { tableNumber: string; pipeNumber: number; coalInterval: number }) => {
    if (editingTable) {
      await updateTable(editingTable.id, data)
    } else {
      await addTable(data)
    }
    setShowFormModal(false)
    setEditingTable(null)
  }

  const handleDeleteTable = async (id: string) => {
    await removeTable(id)
    setShowFormModal(false)
    setEditingTable(null)
    if (selectedId === id) setSelectedId(null)
  }

  const handleSaveName = async () => {
    await updateStoreName(nameInput.trim())
    setEditingName(false)
  }

  return (
    <div className="page store-page">
      <div className="store-header">
        {editingName ? (
          <input
            className="store-name-input"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            autoFocus
          />
        ) : (
          <h1
            className="store-name"
            onClick={() => { setNameInput(storeName || 'マイ店舗'); setEditingName(true) }}
          >
            {storeName || 'マイ店舗'} <span className="store-name-edit-icon">✏️</span>
          </h1>
        )}
        <button className="add-table-btn" onClick={openAdd}>＋ 台を追加</button>
      </div>

      {(overdue.length > 0 || warning.length > 0) && (
        <div className="coal-alert-banner">
          <span>⚠️ 炭交換が必要：</span>
          {overdue.length > 0 && (
            <span className="alert-overdue">{overdue.map((t) => t.label).join('、')}</span>
          )}
          {warning.length > 0 && (
            <span className="alert-warning">
              {overdue.length > 0 ? '　' : ''}{warning.map((t) => t.label).join('、')}
            </span>
          )}
        </div>
      )}

      {loading ? (
        <div className="loading"><div className="spinner" />読み込み中...</div>
      ) : tables.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🪑</div>
          <p className="empty-state-text">
            まだ台が登録されていません<br />
            「＋ 台を追加」から登録してください
          </p>
        </div>
      ) : (
        <div className="tables-grid">
          {tables.map((t) => (
            <TableCard
              key={t.id}
              table={t}
              selected={t.id === selectedId}
              onClick={() => setSelectedId(t.id === selectedId ? null : t.id)}
              onEdit={() => openEdit(t)}
            />
          ))}
        </div>
      )}

      {selected && (
        <TableDetailPanel
          key={selected.id}
          table={selected}
          recipes={recipes}
          onClose={() => setSelectedId(null)}
          onStartSession={(opts) => startSession(selected.id, opts)}
          onCoalChange={() => recordCoalChange(selected.id, selected.coalChangeCount)}
          onEndSession={async () => { await endSession(selected.id); setSelectedId(null) }}
          onUpdateMemo={(memo) => updateMemo(selected.id, memo)}
          onEditTable={() => openEdit(selected)}
        />
      )}

      {showFormModal && (
        <TableFormModal
          table={editingTable}
          onSave={handleSaveTable}
          onDelete={editingTable ? () => handleDeleteTable(editingTable.id) : undefined}
          onClose={() => { setShowFormModal(false); setEditingTable(null) }}
        />
      )}
    </div>
  )
}
