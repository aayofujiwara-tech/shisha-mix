import { useState, useRef, useEffect } from 'react'
import type { DiaryEntry } from '../types'
import { MOOD_TAGS } from '../types'
import { useDiary } from '../hooks/useDiary'
import { trackDiaryWrite } from '../firebase'
import './DiaryForm.css'

interface Prefill {
  recipeName?: string
  duration?: number
  coalCount?: number
}

interface Props {
  userId: string
  onClose: () => void
  onSaved: () => void
  entry?: DiaryEntry
  prefill?: Prefill
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function DiaryForm({ userId, onClose, onSaved, entry, prefill }: Props) {
  const { addEntry, updateEntry } = useDiary(userId)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const [date, setDate] = useState(entry?.date ?? todayStr())
  const [recipeName, setRecipeName] = useState(entry?.recipeName ?? prefill?.recipeName ?? '')
  const [sessionDuration, setSessionDuration] = useState(entry?.sessionDuration ?? prefill?.duration ?? 45)
  const [coalCount, setCoalCount] = useState(entry?.coalCount ?? prefill?.coalCount ?? 3)
  const [rating, setRating] = useState(entry?.rating ?? 3)
  const [mood, setMood] = useState<string[]>(entry?.mood ?? [])
  const [memo, setMemo] = useState(entry?.memo ?? '')
  const [existingPhotos, setExistingPhotos] = useState<string[]>(entry?.photos ?? [])
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([])
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    return () => newPhotoPreviews.forEach(URL.revokeObjectURL)
  }, [newPhotoPreviews])

  const totalPhotos = existingPhotos.length + newPhotoFiles.length

  const handlePhotoFiles = (files: FileList) => {
    const remaining = 3 - totalPhotos
    const toAdd = Array.from(files).slice(0, remaining)
    if (toAdd.length === 0) return
    const previews = toAdd.map((f) => URL.createObjectURL(f))
    setNewPhotoFiles((prev) => [...prev, ...toAdd])
    setNewPhotoPreviews((prev) => [...prev, ...previews])
  }

  const removeExistingPhoto = (url: string) => {
    setExistingPhotos((prev) => prev.filter((p) => p !== url))
  }

  const removeNewPhoto = (index: number) => {
    URL.revokeObjectURL(newPhotoPreviews[index])
    setNewPhotoFiles((prev) => prev.filter((_, i) => i !== index))
    setNewPhotoPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleMood = (tag: string) => {
    setMood((prev) => prev.includes(tag) ? prev.filter((m) => m !== tag) : [...prev, tag])
  }

  const handleSave = async () => {
    if (!date) { setError('日付を入力してください'); return }
    setSaving(true)
    setError('')
    try {
      const data = { date, recipeName, sessionDuration, coalCount, rating, mood, memo }
      if (entry) {
        await updateEntry(entry.id, data, existingPhotos, newPhotoFiles)
      } else {
        await addEntry(data, newPhotoFiles)
        trackDiaryWrite()
      }
      onSaved()
    } catch {
      setError('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content df-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <h3 className="df-title">{entry ? '記録を編集' : 'セッションを記録'}</h3>

        {/* Date */}
        <div className="df-field">
          <label className="field-label">日付</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        {/* Recipe name */}
        <div className="df-field">
          <label className="field-label">レシピ名（任意）</label>
          <input
            type="text"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            placeholder="例：グレープ×ミント"
          />
        </div>

        {/* Duration + Coal count */}
        <div className="df-row">
          <div className="df-field df-field--half">
            <label className="field-label">セッション時間（分）</label>
            <div className="df-spinner">
              <button type="button" className="df-spin-btn" onClick={() => setSessionDuration(v => Math.max(1, v - 5))}>−</button>
              <input
                type="number"
                min={1}
                max={480}
                value={sessionDuration}
                onChange={(e) => setSessionDuration(Math.max(1, parseInt(e.target.value) || 1))}
                className="df-spin-input"
              />
              <button type="button" className="df-spin-btn" onClick={() => setSessionDuration(v => Math.min(480, v + 5))}>＋</button>
            </div>
          </div>
          <div className="df-field df-field--half">
            <label className="field-label">炭の数</label>
            <div className="df-spinner">
              <button type="button" className="df-spin-btn" onClick={() => setCoalCount(v => Math.max(0, v - 1))}>−</button>
              <input
                type="number"
                min={0}
                max={20}
                value={coalCount}
                onChange={(e) => setCoalCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="df-spin-input"
              />
              <button type="button" className="df-spin-btn" onClick={() => setCoalCount(v => Math.min(20, v + 1))}>＋</button>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="df-field">
          <label className="field-label">自己評価</label>
          <div className="df-stars">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                className={`df-star-btn${s <= rating ? ' filled' : ''}`}
                onClick={() => setRating(s)}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Mood tags */}
        <div className="df-field">
          <label className="field-label">気分タグ（複数選択可）</label>
          <div className="df-mood-tags">
            {MOOD_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`df-mood-tag${mood.includes(tag) ? ' selected' : ''}`}
                onClick={() => toggleMood(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Memo */}
        <div className="df-field">
          <label className="field-label">メモ</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="今日のセッションについて..."
            rows={3}
            className="df-textarea"
          />
        </div>

        {/* Photos */}
        <div className="df-field">
          <label className="field-label">写真（最大3枚）</label>
          <div className="df-photo-row">
            {existingPhotos.map((url, i) => (
              <div key={`ex-${i}`} className="df-photo-thumb">
                <img src={url} alt="" />
                <button type="button" className="df-photo-remove" onClick={() => removeExistingPhoto(url)}>✕</button>
              </div>
            ))}
            {newPhotoPreviews.map((preview, i) => (
              <div key={`new-${i}`} className="df-photo-thumb">
                <img src={preview} alt="" />
                <button type="button" className="df-photo-remove" onClick={() => removeNewPhoto(i)}>✕</button>
              </div>
            ))}
            {totalPhotos < 3 && (
              <button
                type="button"
                className="df-photo-add"
                onClick={() => photoInputRef.current?.click()}
              >
                <span>📷</span>
                <span className="df-photo-add-label">{totalPhotos === 0 ? '写真追加' : '追加'}</span>
              </button>
            )}
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => e.target.files && handlePhotoFiles(e.target.files)}
          />
        </div>

        {error && <p className="df-error">{error}</p>}

        <div className="df-footer">
          <button className="btn-ghost" onClick={onClose} disabled={saving}>キャンセル</button>
          <button className="btn-primary df-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存する'}
          </button>
        </div>
      </div>
    </div>
  )
}
