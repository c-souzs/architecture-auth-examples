import { useAuth } from './useAuth'

export interface PermissionRequirement {
  roles?: string[]
  authorities?: string[]
}

export function usePermissions() {
  const { user } = useAuth()

  function canAccess({ roles, authorities }: PermissionRequirement): boolean {
    if (!user) return false

    if (roles?.length && roles.some(r => user.roles.includes(r))) return true
    if (authorities?.length && authorities.some(a => user.authorities.includes(a))) return true

    return false
  }

  return { canAccess }
}
