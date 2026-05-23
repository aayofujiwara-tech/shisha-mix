import { useRef, useState } from 'react'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../firebase'
import './PhotoUploader.css'

interface Props {
  photos: string[]
  onChange: (photos: string[]) => void
  userId: string
  recipeId: string
}

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const MAX = 1200
      let { width, height } = img
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height / width) * MAX); width = MAX }
        else { width = Math.round((width / height) * MAX); height = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('compress failed'))
      }, 'image/webp', 0.85)
    }
    img.onerror = reject
    img.src = url
  })
}

export default function PhotoUploader({ photos, onChange, userId, recipeId }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFiles = async (files: FileList) => {
    const remaining = 5 - photos.length
    const toUpload = Array.from(files).slice(0, remaining)
    if (toUpload.length === 0) return

    setUploading(true)
    try {
      const urls: string[] = []
      for (const file of toUpload) {
        const compressed = await compressImage(file)
        const filename = `photo_${Date.now()}.webp`
        const path = `recipes/${userId}/${recipeId}/${filename}`
        const ref = storageRef(storage, path)
        await uploadBytes(ref, compressed, { contentType: 'image/webp' })
        const url = await getDownloadURL(ref)
        urls.push(url)
      }
      onChange([...photos, ...urls])
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = async (url: string) => {
    const match = url.match(/recipes%2F[^?]+/)
    if (match) {
      try {
        const path = decodeURIComponent(match[0])
        await deleteObject(storageRef(storage, path))
      } catch (_) { /* ignore */ }
    }
    onChange(photos.filter((p) => p !== url))
  }

  return (
    <div className="photo-uploader">
      <div className="photo-grid">
        {photos.map((url, i) => (
          <div key={i} className="photo-thumb">
            <img src={url} alt={`photo ${i + 1}`} />
            <button className="photo-remove" onClick={() => removePhoto(url)} type="button">✕</button>
          </div>
        ))}
        {photos.length < 5 && (
          <button
            className="photo-add"
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <div className="spinner" /> : <>
              <span className="photo-add-icon">📷</span>
              <span className="photo-add-text">{photos.length === 0 ? '写真を追加' : '追加'}</span>
            </>}
          </button>
        )}
      </div>
      <p className="photo-hint">最大5枚 · JPEG/PNG/WEBP (自動圧縮)</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
    </div>
  )
}
