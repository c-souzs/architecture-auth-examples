import type { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface AccessGuardProps {
  children: ReactNode
  roles?: string[]
  authorities?: string[]
}

export function AccessGuard({ children, roles, authorities }: AccessGuardProps) {
  const { user } = useAuth()

  if (!user) return null

  const hasAccess = (): boolean => {
    if (!roles && !authorities) return true
    const roleMatch = roles ? roles.some(r => user.roles.includes(r)) : false
    const authorityMatch = authorities ? authorities.some(a => user.authorities.includes(a)) : false
    return roleMatch || authorityMatch
  }

  if (!hasAccess()) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2 text-center">
        <p className="text-lg font-semibold text-gray-700">Acesso negado</p>
        <p className="text-sm text-gray-500">Você não tem permissão para visualizar este conteúdo.</p>
      </div>
    )
  }

  return <>{children}</>
}
