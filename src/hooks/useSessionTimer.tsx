import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { ref, set, onValue, remove } from 'firebase/database'
import { db } from '../firebase'
import { useAuth } from './useAuth'

export interface SessionData {
  recipeId: string
  recipeName: string
  startTime: number
  coalInterval: number
  lastCoalChange: number
  coalChangeCount: number
  isActive: boolean
}

export type TimerStatus = 'active' | 'warning' | 'overdue'

export type PendingStart =
  | { type: 'busy' }
  | { type: 'ready'; recipeId: string; recipeName: string }

interface ContextValue {
  session: SessionData | null
  isActive: boolean
  elapsedSeconds: number
  coalCountdown: number
  status: TimerStatus
  pendingStart: PendingStart | null
  completedSession: SessionData | null
  completedElapsed: number
  clearCompletedSession: () => void
  requestStart: (recipeId: string, recipeName: string) => void
  dismissPending: () => void
  startSession: (recipeId: string, recipeName: string, coalInterval: number) => Promise<void>
  changeCoal: () => Promise<void>
  endSession: () => Promise<void>
}

const Ctx = createContext<ContextValue | null>(null)

const SS_KEY = 'sheeshamix_session'

function readSS(): SessionData | null {
  try { return JSON.parse(localStorage.getItem(SS_KEY) ?? 'null') } catch { return null }
}
function writeSS(d: SessionData | null) {
  d ? localStorage.setItem(SS_KEY, JSON.stringify(d)) : localStorage.removeItem(SS_KEY)
}

export function SessionTimerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [session, setSession] = useState<SessionData | null>(null)
  const [, setTick] = useState(0)
  const [pendingStart, setPendingStart] = useState<PendingStart | null>(null)
  const [completedSession, setCompletedSession] = useState<SessionData | null>(null)
  const [completedElapsed, setCompletedElapsed] = useState(0)

  useEffect(() => {
    if (user) {
      const unsub = onValue(
        ref(db, `sessions/${user.uid}/current`),
        (snap) => setSession(snap.exists() && snap.val().isActive ? (snap.val() as SessionData) : null),
        () => setSession(null)
      )
      return unsub
    } else {
      const d = readSS()
      setSession(d?.isActive ? d : null)
    }
  }, [user])

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const now = Date.now()
  const elapsedSeconds = session ? Math.floor((now - session.startTime) / 1000) : 0
  const coalRemMs = session ? session.coalInterval * 60000 - (now - session.lastCoalChange) : 0
  const coalCountdown = Math.max(0, Math.floor(coalRemMs / 1000))
  const status: TimerStatus = !session || coalRemMs > 5 * 60000 ? 'active' : coalRemMs <= 0 ? 'overdue' : 'warning'

  const persist = useCallback(async (data: SessionData | null) => {
    if (user) {
      if (data) {
        await set(ref(db, `sessions/${user.uid}/current`), data)
      } else {
        await remove(ref(db, `sessions/${user.uid}/current`))
      }
    } else {
      writeSS(data)
      setSession(data)
    }
  }, [user])

  const requestStart = useCallback((recipeId: string, recipeName: string) => {
    setPendingStart(session ? { type: 'busy' } : { type: 'ready', recipeId, recipeName })
  }, [session])

  const dismissPending = useCallback(() => setPendingStart(null), [])

  const startSession = useCallback(async (recipeId: string, recipeName: string, coalInterval: number) => {
    const t = Date.now()
    setPendingStart(null)
    await persist({
      recipeId,
      recipeName: recipeName || 'セッション',
      startTime: t,
      coalInterval,
      lastCoalChange: t,
      coalChangeCount: 0,
      isActive: true,
    })
  }, [persist])

  const changeCoal = useCallback(async () => {
    if (!session) return
    await persist({ ...session, lastCoalChange: Date.now(), coalChangeCount: session.coalChangeCount + 1 })
  }, [session, persist])

  const clearCompletedSession = useCallback(() => setCompletedSession(null), [])

  const endSession = useCallback(async () => {
    if (session) {
      setCompletedSession(session)
      setCompletedElapsed(Math.floor((Date.now() - session.startTime) / 1000))
    }
    await persist(null)
  }, [session, persist])

  return (
    <Ctx.Provider value={{
      session, isActive: !!session, elapsedSeconds, coalCountdown, status,
      pendingStart, completedSession, completedElapsed, clearCompletedSession,
      requestStart, dismissPending, startSession, changeCoal, endSession,
    }}>
      {children}
    </Ctx.Provider>
  )
}

const FALLBACK: ContextValue = {
  session: null,
  isActive: false,
  elapsedSeconds: 0,
  coalCountdown: 0,
  status: 'active',
  pendingStart: null,
  completedSession: null,
  completedElapsed: 0,
  clearCompletedSession: () => {},
  requestStart: () => {},
  dismissPending: () => {},
  startSession: async () => {},
  changeCoal: async () => {},
  endSession: async () => {},
}

export function useSessionTimer() {
  return useContext(Ctx) ?? FALLBACK
}
