import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AppLayout } from './AppLayout'

export function ProtectedRoute() {
  const { isAuthenticated, initializing, isLoggingOut } = useAuth()
  const location = useLocation()

  if (initializing) return null

  if (!isAuthenticated) {
    if (isLoggingOut) return <Navigate to="/login" replace />
    const from = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?from=${from}`} replace />
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
