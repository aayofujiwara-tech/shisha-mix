import { useState, useEffect, useCallback, useRef } from 'react'
import { ref, set, update, remove, push, onValue } from 'firebase/database'
import { db } from '../firebase'
import type { StoreTable, CoalChangeRecord, TableStatus } from '../types'

type RawTable = {
  tableNumber?: string
  pipeNumber?: number
  label?: string
  customerCount?: number
  startTime?: number
  recipeId?: string
  recipeName?: string
  coalInterval?: number
  lastCoalChange?: number
  coalChangeCount?: number
  coalChangeHistory?: Record<string, CoalChangeRecord>
  memo?: string
}

function computeStatus(t: Omit<StoreTable, 'status'>): TableStatus {
  if (!t.startTime) return 'empty'
  const elapsed = Date.now() - t.lastCoalChange
  const interval = t.coalInterval * 60000
  if (elapsed >= interval) return 'overdue'
  if (elapsed >= (t.coalInterval - 5) * 60000) return 'warning'
  return 'active'
}

export function useStore(userId: string | null) {
  const [storeName, setStoreName] = useState('')
  const [tables, setTables] = useState<StoreTable[]>([])
  const [loading, setLoading] = useState(false)
  const rawRef = useRef<Omit<StoreTable, 'status'>[]>([])

  useEffect(() => {
    if (!userId) { setTables([]); setStoreName(''); return }
    setLoading(true)
    const unsub = onValue(
      ref(db, `stores/${userId}`),
      (snap) => {
        const list: Omit<StoreTable, 'status'>[] = []
        if (snap.exists()) {
          const data = snap.val()
          setStoreName(data.name ?? '')
          if (data.tables) {
            Object.entries(data.tables as Record<string, RawTable>).forEach(([id, raw]) => {
              const history: CoalChangeRecord[] = raw.coalChangeHistory
                ? Object.values(raw.coalChangeHistory).sort((a, b) => a.time - b.time)
                : []
              list.push({
                id,
                tableNumber: raw.tableNumber ?? '',
                pipeNumber: raw.pipeNumber ?? 1,
                label: raw.label ?? `${raw.tableNumber ?? ''} / ${raw.pipeNumber ?? 1}番台`,
                customerCount: raw.customerCount ?? 0,
                startTime: raw.startTime ?? 0,
                recipeId: raw.recipeId ?? '',
                recipeName: raw.recipeName ?? '',
                coalInterval: raw.coalInterval ?? 20,
                lastCoalChange: raw.lastCoalChange ?? 0,
                coalChangeCount: raw.coalChangeCount ?? 0,
                coalChangeHistory: history,
                memo: raw.memo ?? '',
              })
            })
            list.sort((a, b) => a.label.localeCompare(b.label, 'ja'))
          }
        } else {
          setStoreName('')
        }
        rawRef.current = list
        setTables(list.map((t) => ({ ...t, status: computeStatus(t) })))
        setLoading(false)
      },
      () => { rawRef.current = []; setTables([]); setLoading(false) }
    )
    return unsub
  }, [userId])

  // Recompute status every second for live countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      if (rawRef.current.length > 0) {
        setTables(rawRef.current.map((t) => ({ ...t, status: computeStatus(t) })))
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const updateStoreName = useCallback(async (name: string) => {
    if (!userId) return
    await set(ref(db, `stores/${userId}/name`), name || 'マイ店舗')
  }, [userId])

  const addTable = useCallback(async (data: { tableNumber: string; pipeNumber: number; coalInterval: number }) => {
    if (!userId) return
    const newRef = push(ref(db, `stores/${userId}/tables`))
    await set(newRef, {
      tableNumber: data.tableNumber,
      pipeNumber: data.pipeNumber,
      label: `${data.tableNumber} / ${data.pipeNumber}番台`,
      coalInterval: data.coalInterval,
      customerCount: 0,
      startTime: 0,
      lastCoalChange: 0,
      coalChangeCount: 0,
    })
  }, [userId])

  const updateTable = useCallback(async (id: string, data: { tableNumber: string; pipeNumber: number; coalInterval: number }) => {
    if (!userId) return
    await update(ref(db, `stores/${userId}/tables/${id}`), {
      tableNumber: data.tableNumber,
      pipeNumber: data.pipeNumber,
      label: `${data.tableNumber} / ${data.pipeNumber}番台`,
      coalInterval: data.coalInterval,
    })
  }, [userId])

  const removeTable = useCallback(async (id: string) => {
    if (!userId) return
    await remove(ref(db, `stores/${userId}/tables/${id}`))
  }, [userId])

  const startSession = useCallback(async (
    id: string,
    opts: { customerCount: number; recipeId: string; recipeName: string; memo: string; coalInterval: number }
  ) => {
    if (!userId) return
    const now = Date.now()
    await update(ref(db, `stores/${userId}/tables/${id}`), {
      customerCount: opts.customerCount,
      recipeId: opts.recipeId || null,
      recipeName: opts.recipeName || null,
      memo: opts.memo || null,
      coalInterval: opts.coalInterval,
      startTime: now,
      lastCoalChange: now,
      coalChangeCount: 0,
      coalChangeHistory: null,
    })
  }, [userId])

  const recordCoalChange = useCallback(async (id: string, currentCount: number) => {
    if (!userId) return
    const now = Date.now()
    const histRef = push(ref(db, `stores/${userId}/tables/${id}/coalChangeHistory`))
    await set(histRef, { time: now, memo: '' })
    await update(ref(db, `stores/${userId}/tables/${id}`), {
      lastCoalChange: now,
      coalChangeCount: currentCount + 1,
    })
  }, [userId])

  const endSession = useCallback(async (id: string) => {
    if (!userId) return
    await update(ref(db, `stores/${userId}/tables/${id}`), {
      customerCount: 0,
      startTime: 0,
      recipeId: null,
      recipeName: null,
      lastCoalChange: 0,
      coalChangeCount: 0,
      coalChangeHistory: null,
      memo: null,
    })
  }, [userId])

  const updateMemo = useCallback(async (id: string, memo: string) => {
    if (!userId) return
    await set(ref(db, `stores/${userId}/tables/${id}/memo`), memo || null)
  }, [userId])

  return {
    storeName, tables, loading,
    updateStoreName, addTable, updateTable, removeTable,
    startSession, recordCoalChange, endSession, updateMemo,
  }
}
