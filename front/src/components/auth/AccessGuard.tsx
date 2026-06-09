import type { ReactNode } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import type { PermissionRequirement } from '@/hooks/usePermissions'

interface AccessGuardProps {
  permission: PermissionRequirement
  children: ReactNode
  fallback?: ReactNode
}

export function AccessGuard({ permission, children, fallback = null }: AccessGuardProps) {
  const { canAccess } = usePermissions()
  return canAccess(permission) ? <>{children}</> : <>{fallback}</>
}
