import { useState } from 'react'
import type { StoreTable } from '../types'

interface Props {
  table: StoreTable | null
  onSave: (data: { tableNumber: string; pipeNumber: number; coalInterval: number }) => Promise<void>
  onDelete?: () => void
  onClose: () => void
}

export default function TableFormModal({ table, onSave, onDelete, onClose }: Props) {
  const [tableNumber, setTableNumber] = useState(table?.tableNumber ?? '')
  const [pipeNumber, setPipeNumber] = useState(table?.pipeNumber ?? 1)
  const [coalInterval, setCoalInterval] = useState(table?.coalInterval ?? 20)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSave = async () => {
    if (!tableNumber.trim()) return
    setSaving(true)
    try {
      await onSave({ tableNumber: tableNumber.trim(), pipeNumber, coalInterval })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <h3 style={{ marginBottom: 16, fontSize: 16 }}>
          {table ? '台を編集' : '台を追加'}
        </h3>

        <div className="form-group">
          <label className="field-label">
            テーブル番号 <span style={{ color: 'var(--color-error)' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="例：A-1、101"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="field-label">台番号</label>
          <input
            type="number"
            min={1}
            max={10}
            value={pipeNumber}
            onChange={(e) => setPipeNumber(Math.max(1, Number(e.target.value)))}
          />
        </div>

        <div className="form-group">
          <label className="field-label">デフォルト炭交換間隔（分）</label>
          <input
            type="number"
            min={5}
            max={120}
            value={coalInterval}
            onChange={(e) => setCoalInterval(Math.max(5, Number(e.target.value)))}
          />
        </div>

        {confirmDelete ? (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 14, color: 'var(--color-error)', marginBottom: 12 }}>
              本当に削除しますか？この操作は取り消せません。
            </p>
            <button className="btn-danger" onClick={onDelete} style={{ marginBottom: 8 }}>
              削除する
            </button>
            <button
              className="btn-ghost"
              style={{ display: 'block', width: '100%' }}
              onClick={() => setConfirmDelete(false)}
            >
              キャンセル
            </button>
          </div>
        ) : (
          <>
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={saving || !tableNumber.trim()}
              style={{ marginTop: 8 }}
            >
              {saving ? '保存中...' : '保存'}
            </button>
            {table && onDelete && (
              <button
                className="btn-ghost"
                style={{ display: 'block', width: '100%', marginTop: 8, color: 'var(--color-error)' }}
                onClick={() => setConfirmDelete(true)}
              >
                この台を削除
              </button>
            )}
            <button
              className="btn-ghost"
              style={{ display: 'block', width: '100%', marginTop: 8 }}
              onClick={onClose}
            >
              キャンセル
            </button>
          </>
        )}
      </div>
    </div>
  )
}
