import { useCallback, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import { clearSession, getSession, saveSession } from './utils/auth'
import { logout as logoutRequest } from './utils/api'

function App() {
  const [session, setSession] = useState(getSession)
  const user = session?.user

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
        <Route path="/dang-ky" element={user ? <Navigate to="/" replace /> : <RegisterPage onRegister={authenticate} />} />
        <Route path="/tai-khoan" element={user ? <ProfilePage user={user} onProfile={updateProfile} onUnauthorized={logout} /> : <Navigate to="/dang-nhap" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3200} hideProgressBar theme="light" />
    </BrowserRouter>
  )
}

export default App
