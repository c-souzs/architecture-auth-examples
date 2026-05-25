import { useAuth } from '@/hooks/useAuth'

export interface PermissionRequirement {
  roles?: string[]
  authorities?: string[]
}

export function usePermissions() {
  const { user } = useAuth()

  function canAccess({ roles, authorities }: PermissionRequirement): boolean {
    if (!user) return false
    if (!roles?.length && !authorities?.length) return true
    const roleMatch = roles?.some(r => user.roles.includes(r)) ?? false
    const authorityMatch = authorities?.some(a => user.authorities.includes(a)) ?? false
    return roleMatch || authorityMatch
  }

  return { canAccess }
}
