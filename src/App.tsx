import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import BottomNav from './components/BottomNav'
import SideNav from './components/SideNav'
import ProtectedRoute from './components/ProtectedRoute'
import SessionTimer from './components/SessionTimer'
import InstallPrompt from './components/InstallPrompt'
import ErrorBoundary from './components/ErrorBoundary'
import { SessionTimerProvider } from './hooks/useSessionTimer'

const LoginPage        = lazy(() => import('./pages/LoginPage'))
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

function AppRoutes() {
  const { user, loading } = useAuth()

  return (
    <div className="app-shell">
      <SideNav />
      <main className="app-main">
        <ErrorBoundary>
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </main>
      <BottomNav />
      <SessionTimer />
      <InstallPrompt />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <SessionTimerProvider>
        <AppRoutes />
      </SessionTimerProvider>
    </BrowserRouter>
  )
}
