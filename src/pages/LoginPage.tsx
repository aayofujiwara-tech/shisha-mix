import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './LoginPage.css'

type Mode = 'login' | 'signup'

export default function LoginPage() {
  const { signInWithGoogle, signUpWithEmail, signInWithEmail, sendPasswordReset } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePasswordReset = async () => {
    setError('')
    setResetMessage('')
    if (!email) {
      setError('メールアドレスを入力してください')
      return
    }
    try {
      await sendPasswordReset(email)
      setResetMessage('パスワードリセットメールを送信しました。メールをご確認ください。')
    } catch {
      setError('メールアドレスが登録されていません')
    }
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
      navigate('/')
    } catch (e) {
      setError('Googleログインに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password, displayName)
      } else {
        await signInWithEmail(email, password)
      }
      navigate('/')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('email-already-in-use')) setError('このメールアドレスは既に登録されています')
      else if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) setError('メールアドレスまたはパスワードが正しくありません')
      else if (msg.includes('weak-password')) setError('パスワードは6文字以上にしてください')
      else setError('エラーが発生しました。再度お試しください')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="login-icon">🪔</div>
        <h1 className="login-title">SheeshaMix</h1>
        <p className="login-subtitle">あなたのレシピを、もっと自由に。</p>
      </div>

      <div className="login-card card">
        <div className="login-tabs">
          <button className={`login-tab${mode === 'login' ? ' active' : ''}`} onClick={() => setMode('login')}>ログイン</button>
          <button className={`login-tab${mode === 'signup' ? ' active' : ''}`} onClick={() => setMode('signup')}>新規登録</button>
        </div>

        <button className="google-btn" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
            <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Googleで{mode === 'signup' ? '登録' : 'ログイン'}
        </button>

        <div className="login-or"><span>または</span></div>

        <form onSubmit={handleEmail}>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="field-label">ニックネーム</label>
              <input
                type="text"
                placeholder="あなたの名前"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label className="field-label">メールアドレス</label>
            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="field-label">パスワード</label>
            <input
              type="password"
              placeholder="6文字以上"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            {mode === 'login' && (
              <button type="button" className="password-reset-link" onClick={handlePasswordReset}>
                パスワードをお忘れの方
              </button>
            )}
          </div>
          {error && <p className="login-error">{error}</p>}
          {resetMessage && <p className="login-success">{resetMessage}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '処理中...' : mode === 'signup' ? 'アカウント作成' : 'ログイン'}
          </button>
        </form>

        <p className="login-skip">
          <button className="btn-ghost" onClick={() => navigate('/')}>ログインせずに閲覧する</button>
        </p>
      </div>
    </div>
  )
}
