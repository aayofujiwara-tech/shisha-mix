import { useState, useEffect, useCallback } from 'react'
import { ref, onValue, push, set, remove, query, orderByChild } from 'firebase/database'
import { db } from '../firebase'

export interface Comment {
  id: string
  recipeId: string
  userId: string
  authorName: string
  text: string
  rating: number
  createdAt: number
}

export function useComments(recipeId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!recipeId) return
    const q = query(ref(db, `comments/${recipeId}`), orderByChild('createdAt'))
    const unsub = onValue(q, (snap) => {
      const list: Comment[] = []
      snap.forEach((child) => list.push({ id: child.key!, ...child.val() } as Comment))
      setComments(list.reverse())
      setLoading(false)
    })
    return unsub
  }, [recipeId])

  const addComment = useCallback(async (
    userId: string, authorName: string, text: string, rating: number
  ) => {
    const newRef = push(ref(db, `comments/${recipeId}`))
    await set(newRef, {
      id: newRef.key,
      recipeId,
      userId,
      authorName,
      text: text.trim(),
      rating,
      createdAt: Date.now(),
    })
  }, [recipeId])

  const deleteComment = useCallback(async (commentId: string) => {
    await remove(ref(db, `comments/${recipeId}/${commentId}`))
  }, [recipeId])

  return { comments, loading, addComment, deleteComment }
}

export function useRatings(recipeId: string) {
  const [ratingMap, setRatingMap] = useState<Record<string, number>>({})
  const [average, setAverage] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!recipeId) return
    const unsub = onValue(ref(db, `ratings/${recipeId}`), (snap) => {
      if (!snap.exists()) { setRatingMap({}); setAverage(0); setCount(0); return }
      const data = snap.val() as Record<string, { rating: number }>
      const map: Record<string, number> = {}
      let sum = 0, n = 0
      Object.entries(data).forEach(([uid, v]) => {
        if (typeof v?.rating === 'number') { map[uid] = v.rating; sum += v.rating; n++ }
      })
      setRatingMap(map)
      setCount(n)
      setAverage(n > 0 ? Math.round((sum / n) * 10) / 10 : 0)
    })
    return unsub
  }, [recipeId])

  const submitRating = useCallback(async (userId: string, rating: number) => {
    await set(ref(db, `ratings/${recipeId}/${userId}`), { rating, createdAt: Date.now() })
  }, [recipeId])

  return { ratingMap, average, count, submitRating }
}
