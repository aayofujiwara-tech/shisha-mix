import { useState, useEffect, useCallback } from 'react'
import { ref, set, get, remove, push, query, orderByChild, equalTo, onValue, runTransaction } from 'firebase/database'
import { db } from '../firebase'
import type { Recipe } from '../types'

export function useMyRecipes(userId: string | null) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) { setRecipes([]); return }
    setLoading(true)
    const recipesRef = query(ref(db, 'recipes'), orderByChild('userId'), equalTo(userId))
    const unsub = onValue(recipesRef, (snap) => {
      const list: Recipe[] = []
      snap.forEach((child) => {
        list.push({ id: child.key!, ...child.val() } as Recipe)
      })
      list.sort((a, b) => b.updatedAt - a.updatedAt)
      setRecipes(list)
      setLoading(false)
    })
    return unsub
  }, [userId])

  const createRecipe = useCallback(async (data: Omit<Recipe, 'id'>) => {
    const newRef = push(ref(db, 'recipes'))
    const recipe: Recipe = { ...data, id: newRef.key! }
    await set(newRef, recipe)
    return recipe
  }, [])

  const updateRecipe = useCallback(async (id: string, data: Partial<Recipe>) => {
    await set(ref(db, `recipes/${id}`), { ...data, id })
  }, [])

  const deleteRecipe = useCallback(async (id: string) => {
    await remove(ref(db, `recipes/${id}`))
  }, [])

  return { recipes, loading, createRecipe, updateRecipe, deleteRecipe }
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  const snap = await get(ref(db, `recipes/${id}`))
  if (!snap.exists()) return null
  return { id: snap.key!, ...snap.val() } as Recipe
}

export function usePublicRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const recipesRef = query(ref(db, 'recipes'), orderByChild('isPublic'), equalTo(true))
    const unsub = onValue(recipesRef, (snap) => {
      const list: Recipe[] = []
      snap.forEach((child) => {
        list.push({ id: child.key!, ...child.val() } as Recipe)
      })
      list.sort((a, b) => b.updatedAt - a.updatedAt)
      setRecipes(list)
      setLoading(false)
    })
    return unsub
  }, [])

  return { recipes, loading }
}

export function useLikes(recipeId: string, userId: string | undefined) {
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!recipeId || !userId) { setLiked(false); setLoading(false); return }
    return onValue(ref(db, `likes/${recipeId}/${userId}`), (snap) => {
      setLiked(snap.exists())
      setLoading(false)
    })
  }, [recipeId, userId])

  const toggle = useCallback(async () => {
    if (!userId || loading) return
    const likeRef = ref(db, `likes/${recipeId}/${userId}`)
    const countRef = ref(db, `recipes/${recipeId}/likes`)
    if (liked) {
      await remove(likeRef)
      await runTransaction(countRef, (v) => Math.max(0, (v ?? 0) - 1))
    } else {
      await set(likeRef, true)
      await runTransaction(countRef, (v) => (v ?? 0) + 1)
    }
  }, [recipeId, userId, liked, loading])

  return { liked, loading, toggle }
}
