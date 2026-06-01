import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import BottomNav from './components/BottomNav'
import SideNav from './components/SideNav'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import SearchPage from './pages/SearchPage'
import RecipeDetailPage from './pages/RecipeDetailPage'
import MyRecipePage from './pages/MyRecipePage'
import RecipeFormPage from './pages/RecipeFormPage'
import InventoryPage from './pages/InventoryPage'
import SuggestPage from './pages/SuggestPage'
import ProfilePage from './pages/ProfilePage'
import StorePage from './pages/StorePage'

function AppRoutes() {
  const { user, loading } = useAuth()

  return (
    <div className="app-shell">
      <SideNav />
      <main className="app-main">
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
