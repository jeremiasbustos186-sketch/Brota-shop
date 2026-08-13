import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingState } from './ui/LoadingState'

/**
 * Ruta protegida para administradores.
 * Flujo: loading → user → role === 'admin' → Outlet (L6)
 *
 * La doble verificación (user + profile.role) asegura que incluso si alguien
 * está autenticado, no puede acceder al panel admin sin el rol correcto.
 */
export function AdminRoute() {
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingState />
  if (!user) return <Navigate to="/login" replace />
  if (profile?.role !== 'admin') return <Navigate to="/" replace />

  return <Outlet />
}
