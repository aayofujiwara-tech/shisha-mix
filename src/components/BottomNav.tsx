import { NavLink } from 'react-router-dom'
import './BottomNav.css'

const tabs = [
  { to: '/', label: '検索', icon: '🔍', exact: true },
  { to: '/my', label: 'マイレシピ', icon: '📝', exact: false },
  { to: '/inventory', label: '在庫', icon: '📦', exact: false },
  { to: '/suggest', label: '提案', icon: '🎲', exact: false },
  { to: '/store', label: '店舗', icon: '🏪', exact: false },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.exact}
          className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
        >
          <span className="bottom-nav-icon">{tab.icon}</span>
          <span className="bottom-nav-label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
