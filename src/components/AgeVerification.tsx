import { useState } from 'react'

const STORAGE_KEY = 'age_verified'

export default function AgeVerification() {
  const [verified, setVerified] = useState(() =>
    localStorage.getItem(STORAGE_KEY) === 'true'
  )

  if (verified) return null

  const handleYes = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setVerified(true)
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
