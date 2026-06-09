import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import type { PermissionRequirement } from '@/hooks/usePermissions'

interface AuthorizedRouteProps {
  permission: PermissionRequirement
  children: ReactNode
}

export function AuthorizedRoute({ permission, children }: AuthorizedRouteProps) {
  const { canAccess } = usePermissions()

  if (!canAccess(permission)) {
    return <Navigate to="/forbidden" replace />
  }

  return <>{children}</>
}
