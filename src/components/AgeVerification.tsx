import { useState, useEffect } from 'react'
import { ref, get, set } from 'firebase/database'
import { db } from '../firebase'
import { useAuth } from '../hooks/useAuth'

const STORAGE_KEY = 'age_verified'

export default function AgeVerification() {
  const { user, loading } = useAuth()
  const [closed, setClosed] = useState(false)
  const [firebaseVerified, setFirebaseVerified] = useState(false)
  const [firebaseCheckDone, setFirebaseCheckDone] = useState(false)

  useEffect(() => {
    if (!user) {
      setFirebaseVerified(false)
      setFirebaseCheckDone(true)
      return
    }
    setFirebaseCheckDone(false)
    get(ref(db, `users/${user.uid}/ageVerified`))
      .then((snap) => {
        setFirebaseVerified(snap.val() === true)
        setFirebaseCheckDone(true)
      })
      .catch(() => {
        setFirebaseVerified(false)
        setFirebaseCheckDone(true)
      })
  }, [user])

  if (loading || !firebaseCheckDone) return null
  if (user && firebaseVerified) return null
  if (!user && sessionStorage.getItem(STORAGE_KEY) === 'true') return null
  if (closed) return null

  const handleYes = async () => {
    if (user) {
      await set(ref(db, `users/${user.uid}/ageVerified`), true)
    } else {
      sessionStorage.setItem(STORAGE_KEY, 'true')
    }
    setClosed(true)
  }

  const handleNo = () => {
    window.location.href = 'https://www.google.com'
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        padding: '32px 24px',
        maxWidth: '360px',
        width: '100%',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🪔</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-amber)', marginBottom: 16 }}>
          SheeshaMix
        </h1>
        <p style={{ color: 'var(--color-text)', marginBottom: 8, lineHeight: 1.7, fontSize: 14 }}>
          このサービスはシーシャ（水タバコ）に関する<br />
          情報を提供しています。
        </p>
        <p style={{ color: 'var(--color-text)', marginBottom: 24, lineHeight: 1.7, fontSize: 14 }}>
          20歳以上の方のみご利用いただけます。<br />
          <strong style={{ fontSize: 16 }}>あなたは20歳以上ですか？</strong>
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={handleYes}
            style={{
              background: 'var(--color-amber)',
              color: '#0d1b2a',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 0',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            はい、20歳以上です
          </button>
          <button
            onClick={handleNo}
            style={{
              background: 'transparent',
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 0',
              fontSize: 14,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            いいえ
          </button>
        </div>
      </div>
    </div>
  )
}
