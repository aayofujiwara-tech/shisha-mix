import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import BottomNav from './components/BottomNav'
import SideNav from './components/SideNav'
import ProtectedRoute from './components/ProtectedRoute'
import SessionTimer from './components/SessionTimer'
import InstallPrompt from './components/InstallPrompt'
import ErrorBoundary from './components/ErrorBoundary'
import AgeVerification from './components/AgeVerification'
import { SessionTimerProvider } from './hooks/useSessionTimer'
import FeedbackButton from './components/FeedbackButton'
import { trackPageView } from './firebase'

const LoginPage        = lazy(() => import('./pages/LoginPage'))
const PrivacyPage      = lazy(() => import('./pages/PrivacyPage'))
const SearchPage       = lazy(() => import('./pages/SearchPage'))
const RecipeDetailPage = lazy(() => import('./pages/RecipeDetailPage'))
const MyRecipePage     = lazy(() => import('./pages/MyRecipePage'))
const RecipeFormPage   = lazy(() => import('./pages/RecipeFormPage'))
const InventoryPage    = lazy(() => import('./pages/InventoryPage'))
const SuggestPage      = lazy(() => import('./pages/SuggestPage'))
const ProfilePage      = lazy(() => import('./pages/ProfilePage'))
const UserPage         = lazy(() => import('./pages/UserPage'))
const StorePage        = lazy(() => import('./pages/StorePage'))
const DiaryPage        = lazy(() => import('./pages/DiaryPage'))
const AdminPage        = lazy(() => import('./pages/AdminPage'))

function AppRoutes() {
  const { user, loading } = useAuth()
  const location = useLocation()

  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])

  if (loading) {
    return (
      <div style={{
        height: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
      }}>
        <div className="loading">
          <div className="spinner" />
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <SideNav />
      <main className="app-main">
        <ErrorBoundary key={location.pathname}>
        <Suspense fallback={<div className="loading"><div className="spinner" />読み込み中...</div>}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<SearchPage />} />
            <Route path="/recipe/:id" element={<RecipeDetailPage />} />
            <Route path="/my" element={
              <ProtectedRoute user={user} loading={loading}>
                <MyRecipePage />
              </ProtectedRoute>
            } />
            <Route path="/my/new" element={
              <ProtectedRoute user={user} loading={loading}>
                <RecipeFormPage />
              </ProtectedRoute>
            } />
            <Route path="/my/edit/:id" element={
              <ProtectedRoute user={user} loading={loading}>
                <RecipeFormPage />
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute user={user} loading={loading}>
                <InventoryPage />
              </ProtectedRoute>
            } />
            <Route path="/suggest" element={<SuggestPage />} />
            <Route path="/user/:userId" element={<UserPage />} />
            <Route path="/profile" element={
              <ProtectedRoute user={user} loading={loading}>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/store" element={
              <ProtectedRoute user={user} loading={loading}>
                <StorePage />
              </ProtectedRoute>
            } />
            <Route path="/diary" element={
              <ProtectedRoute user={user} loading={loading}>
                <DiaryPage />
              </ProtectedRoute>
            } />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </main>
      <footer style={{ textAlign: 'center', padding: '8px 0 4px', flexShrink: 0 }}>
        <Link
          to="/privacy"
          style={{ fontSize: 11, color: 'var(--color-text-muted)', textDecoration: 'none' }}
        >
          プライバシーポリシー
        </Link>
      </footer>
      <BottomNav />
      <SessionTimer />
      <InstallPrompt />
      <FeedbackButton userId={user?.uid ?? null} />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AgeVerification />
      <SessionTimerProvider>
        <AppRoutes />
      </SessionTimerProvider>
    </BrowserRouter>
  )
}
