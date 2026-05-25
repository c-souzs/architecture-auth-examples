import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { usePermissions, type PermissionRequirement } from '@/hooks/usePermissions'

interface AuthorizedRouteProps {
  children: ReactNode
  permission?: PermissionRequirement
}

export function AuthorizedRoute({ children, permission }: AuthorizedRouteProps) {
  const { canAccess } = usePermissions()

  if (permission && !canAccess(permission)) {
    return <Navigate to="/forbidden" replace />
  }

  return <>{children}</>
}
