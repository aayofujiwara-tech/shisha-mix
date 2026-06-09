import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'

export default function AdminPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user || user.uid !== import.meta.env.VITE_ADMIN_UID) {
        navigate('/')
      }
    })
    return () => unsub()
  }, [navigate])

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>管理者ダッシュボード</p>
      <p style={{ color: '#888', marginTop: '1rem' }}>現在準備中です</p>
    </div>
  )
}
