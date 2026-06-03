import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './SideNav.css'

const navItems = [
  { to: '/', label: '検索', icon: '🔍', exact: true },
  { to: '/my', label: 'マイレシピ', icon: '📝', exact: false },
  { to: '/inventory', label: '在庫', icon: '📦', exact: false },
  { to: '/suggest', label: '提案', icon: '🎲', exact: false },
  { to: '/store', label: '店舗', icon: '🏪', exact: false },
  { to: '/diary', label: '日記', icon: '📔', exact: false },
]

export default function SideNav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <aside className="side-nav">
      <div className="side-nav-logo" onClick={() => navigate('/')}>
        <span className="side-nav-logo-icon">🪔</span>
        <span className="side-nav-logo-text">SheeshaMix</span>
      </div>

      <nav className="side-nav-links">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) => `side-nav-link${isActive ? ' active' : ''}`}
          >
            <span className="side-nav-item-icon">{item.icon}</span>
            <span className="side-nav-item-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="side-nav-footer">
        {user ? (
          <div className="side-nav-user" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="avatar" className="side-nav-avatar-img" />
            ) : (
              <div className="side-nav-avatar-placeholder">
                {(user.displayName || user.email || '?')[0].toUpperCase()}
              </div>
            )}
            <div className="side-nav-user-info">
              <p className="side-nav-user-name">{user.displayName || 'ユーザー'}</p>
              <button className="side-nav-logout" onClick={(e) => { e.stopPropagation(); logout() }}>
                ログアウト
              </button>
            </div>
          </div>
        ) : (
          <button className="side-nav-login-btn" onClick={() => navigate('/login')}>
            ログイン / 登録
          </button>
        )}
      </div>
    </aside>
  )
}
