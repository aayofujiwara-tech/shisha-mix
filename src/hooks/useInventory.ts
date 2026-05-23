import { useState, useEffect, useCallback } from 'react'
import { ref, set, remove, push, onValue } from 'firebase/database'
import { db } from '../firebase'
import type { InventoryFlavor } from '../types'

export function useInventory(userId: string | null) {
  const [flavors, setFlavors] = useState<InventoryFlavor[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) { setFlavors([]); return }
    setLoading(true)
    const invRef = ref(db, `inventory/${userId}/flavors`)
    const unsub = onValue(invRef, (snap) => {
      const list: InventoryFlavor[] = []
      snap.forEach((child) => {
        list.push({ id: child.key!, ...child.val() } as InventoryFlavor)
      })
      list.sort((a, b) => b.addedAt - a.addedAt)
      setFlavors(list)
      setLoading(false)
    })
    return unsub
  }, [userId])

  const addFlavor = useCallback(async (data: Omit<InventoryFlavor, 'id'>, uid: string) => {
    const newRef = push(ref(db, `inventory/${uid}/flavors`))
    await set(newRef, data)
  }, [])

  const updateStatus = useCallback(async (id: string, status: InventoryFlavor['status'], uid: string) => {
    await set(ref(db, `inventory/${uid}/flavors/${id}/status`), status)
  }, [])

  const removeFlavor = useCallback(async (id: string, uid: string) => {
    await remove(ref(db, `inventory/${uid}/flavors/${id}`))
  }, [])

  return { flavors, loading, addFlavor, updateStatus, removeFlavor }
}
