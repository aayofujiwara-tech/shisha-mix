import { Navigate } from 'react-router-dom'
import type { User } from 'firebase/auth'

interface Props {
  user: User | null
  loading: boolean
  children: React.ReactNode
}

export default function ProtectedRoute({ user, loading, children }: Props) {
  if (loading) return <div className="loading"><div className="spinner" />読み込み中...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
