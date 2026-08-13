import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingState } from './ui/LoadingState'

/**
 * Ruta protegida para usuarios autenticados.
 * Flujo: loading → user → Outlet (L6)
 *
 * Si Firebase aún no resolvió si hay usuario (loading = true),
 * mostramos un spinner para evitar redirección prematura.
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingState />
  if (!user) return <Navigate to="/login" replace />

  return <Outlet />
}
