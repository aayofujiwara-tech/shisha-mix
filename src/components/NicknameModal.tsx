import { useState } from 'react'
import './NicknameModal.css'

interface Props {
  defaultName: string
  onSubmit: (nickname: string) => Promise<void>
}

export default function NicknameModal({ defaultName, onSubmit }: Props) {
  const [name, setName] = useState(defaultName)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) return
    setSaving(true)
    await onSubmit(name.trim())
    setSaving(false)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-handle" />
        <h2 className="nickname-modal-title">ニックネームを設定してください</h2>
        <p className="nickname-modal-sub">
          他のユーザーに表示される名前です。後からプロフィールページで変更できます。
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          placeholder="ニックネームを入力"
          autoFocus
        />
        <button
          className="btn-primary nickname-modal-btn"
          onClick={handleSubmit}
          disabled={!name.trim() || saving}
        >
          {saving ? '保存中...' : 'この名前で始める'}
        </button>
      </div>
    </div>
  )
}
