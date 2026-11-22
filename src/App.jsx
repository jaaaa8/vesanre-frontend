import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import AdminPage from './pages/AdminPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import ProviderPage from './pages/ProviderPage'
import RegisterPage from './pages/RegisterPage'
import SearchPage from './pages/SearchPage'
import VenueDetailPage from './pages/VenueDetailPage'
import RequireRole from './components/RequireRole'
import './components/common/common.css'
import { clearSession, getSession, saveSession, SESSION_EXPIRED } from './utils/auth'
import { logout as logoutRequest } from './utils/api'
import { legacySportCode, searchHref } from './utils/publicRules'

function SportsDetailRedirect() {
  const slug = new URLSearchParams(useLocation().search).get('sport')
  return <Navigate to={searchHref({ sport: legacySportCode(slug) })} replace />
}

function App() {
  const [session, setSession] = useState(getSession)
  const user = session?.user

  useEffect(() => {
    const expire = () => setSession(null)
    window.addEventListener(SESSION_EXPIRED, expire)
    return () => window.removeEventListener(SESSION_EXPIRED, expire)
  }, [])

  const authenticate = useCallback((nextSession, remember) => {
    saveSession(nextSession, remember)
    setSession(nextSession)
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } catch {
      // Client logout must still succeed when the token has expired or the API is offline.
    } finally {
      clearSession()
      setSession(null)
    }
  }, [])

  const updateProfile = useCallback((nextUser) => {
    setSession((current) => {
      const nextSession = { ...current, user: nextUser }
      saveSession(nextSession, window.localStorage.getItem('sporthub_session') !== null)
      return nextSession
    })
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage user={user} onLogout={logout} />} />
        <Route path="/dang-nhap" element={user ? <Navigate to="/" replace /> : <LoginPage onLogin={authenticate} />} />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage onLogin={authenticate} />} />
        <Route path="/dang-ky" element={user ? <Navigate to="/" replace /> : <RegisterPage onRegister={authenticate} />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage onRegister={authenticate} />} />
        <Route
          path="/tai-khoan"
          element={user ? <ProfilePage user={user} onProfile={updateProfile} onUnauthorized={logout} /> : <Navigate to="/dang-nhap" replace />}
        />
        <Route
          path="/profile"
          element={user ? <ProfilePage user={user} onProfile={updateProfile} onUnauthorized={logout} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/provider/*"
          element={
            <RequireRole session={session} role="PROVIDER">
              <ProviderPage onLogout={logout} />
            </RequireRole>
          }
        />
        <Route
          path="/admin/*"
          element={
            <RequireRole session={session} role="ADMIN">
              <AdminPage onLogout={logout} />
            </RequireRole>
          }
        />
        <Route path="/san" element={<SearchPage />} />
        <Route path="/san/:id" element={<VenueDetailPage />} />
        <Route path="/sports-detail" element={<SportsDetailRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3200} hideProgressBar theme="light" />
    </BrowserRouter>
  )
}

export default App
