import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-icon">👤</div>
          <p className="empty-state-text">マイページはログインが必要です</p>
          <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/login')}>ログイン</button>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">マイページ</h1>
      </div>

      <div className="profile-card card">
        <div className="profile-avatar">
          {user.photoURL ? (
            <img src={user.photoURL} alt="avatar" className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar-placeholder">{(user.displayName || user.email || '?')[0].toUpperCase()}</div>
          )}
        </div>
        <div className="profile-info">
          <p className="profile-name">{user.displayName || 'ユーザー'}</p>
          <p className="profile-email">{user.email}</p>
        </div>
      </div>

      <div className="divider" />

      <div className="profile-section">
        <button className="profile-menu-item" onClick={() => navigate('/my')}>
          <span>📝 マイレシピ</span>
          <span className="profile-menu-arrow">›</span>
        </button>
        <button className="profile-menu-item" onClick={() => navigate('/inventory')}>
          <span>📦 在庫管理</span>
          <span className="profile-menu-arrow">›</span>
        </button>
      </div>

      <div className="divider" />

      <div className="profile-section">
        <p className="profile-legal-title">セキュリティルール</p>
        <p className="profile-legal-text">あなたのレシピと在庫データは安全に保護されています。公開設定したデータのみ他のユーザーに共有されます。</p>
      </div>

      <button className="btn-danger" style={{ marginTop: 32 }} onClick={handleLogout}>
        ログアウト
      </button>
    </div>
  )
}
