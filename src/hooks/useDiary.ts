import { useState, useEffect, useCallback } from 'react'
import { ref, set, remove, push, onValue, get } from 'firebase/database'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase'
import type { DiaryEntry } from '../types'

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
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('compress failed')),
        'image/webp',
        0.85,
      )
    }
    img.onerror = reject
    img.src = url
  })
}

async function uploadPhotos(userId: string, entryId: string, files: File[]): Promise<string[]> {
  const urls: string[] = []
  for (const file of files.slice(0, 3)) {
    const blob = await compressImage(file)
    const sRef = storageRef(storage, `diaries/${userId}/${entryId}/photo_${Date.now()}.webp`)
    await uploadBytes(sRef, blob, { contentType: 'image/webp' })
    urls.push(await getDownloadURL(sRef))
  }
  return urls
}

export function useDiary(userId: string | null) {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) { setEntries([]); return }
    setLoading(true)
    const diaryRef = ref(db, `diaries/${userId}`)
    const unsub = onValue(diaryRef, (snap) => {
      const list: DiaryEntry[] = []
      snap.forEach((child) => {
        list.push({ id: child.key!, ...child.val() } as DiaryEntry)
      })
      list.sort((a, b) => b.createdAt - a.createdAt)
      setEntries(list)
      setLoading(false)
    })
    return unsub
  }, [userId])

  const addEntry = useCallback(async (
    data: Omit<DiaryEntry, 'id' | 'photos' | 'createdAt'>,
    photoFiles: File[],
  ): Promise<string | null> => {
    if (!userId) return null
    const newRef = push(ref(db, `diaries/${userId}`))
    const entryId = newRef.key!
    const photos = await uploadPhotos(userId, entryId, photoFiles)
    await set(newRef, { ...data, photos, createdAt: Date.now() })
    return entryId
  }, [userId])

  const updateEntry = useCallback(async (
    id: string,
    data: Partial<Omit<DiaryEntry, 'id' | 'createdAt'>>,
    keptPhotos: string[],
    newPhotoFiles: File[],
  ): Promise<void> => {
    if (!userId) return
    const newUrls = await uploadPhotos(userId, id, newPhotoFiles.slice(0, Math.max(0, 3 - keptPhotos.length)))
    const photos = [...keptPhotos, ...newUrls].slice(0, 3)
    const entryRef = ref(db, `diaries/${userId}/${id}`)
    const snap = await get(entryRef)
    if (snap.exists()) {
      await set(entryRef, { ...snap.val(), ...data, photos })
    }
  }, [userId])

  const deleteEntry = useCallback(async (id: string) => {
    if (!userId) return
    await remove(ref(db, `diaries/${userId}/${id}`))
  }, [userId])

  return { entries, loading, addEntry, updateEntry, deleteEntry }
}
