import { Navigate } from 'react-router-dom'
import { hasRole } from '../utils/auth'

export default function RequireRole({ session, role, children }) {
  if (!session) return <Navigate to="/login" replace />
  if (!hasRole(session, role)) return <Navigate to="/" replace />
  return children
}
