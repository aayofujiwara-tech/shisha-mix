import { useState, useEffect, useCallback } from 'react'
import { ref, onValue, update, query, orderByChild, equalTo } from 'firebase/database'
import { db } from '../firebase'
import type { UserProfile, Recipe } from '../types'

export function useProfile(userId: string | null | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setProfile(null); setLoading(false); return }
    setLoading(true)
    return onValue(
      ref(db, `users/${userId}`),
      (snap) => { setProfile(snap.exists() ? (snap.val() as UserProfile) : null); setLoading(false) },
      () => { setProfile(null); setLoading(false) }
    )
  }, [userId])

  const saveProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!userId) return
    await update(ref(db, `users/${userId}`), data as Record<string, unknown>)
  }, [userId])

  return { profile, loading, saveProfile }
}

export function useUserPublicRecipes(userId: string | null | undefined) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setRecipes([]); setLoading(false); return }
    setLoading(true)
    const recipesRef = query(ref(db, 'recipes'), orderByChild('isPublic'), equalTo(true))
    return onValue(
      recipesRef,
      (snap) => {
        const list: Recipe[] = []
        snap.forEach((child) => {
          const r = { id: child.key!, ...child.val() } as Recipe
          if (r.userId === userId) list.push(r)
        })
        list.sort((a, b) => b.updatedAt - a.updatedAt)
        setRecipes(list)
        setLoading(false)
      },
      () => { setRecipes([]); setLoading(false) }
    )
  }, [userId])

  return { recipes, loading }
}
