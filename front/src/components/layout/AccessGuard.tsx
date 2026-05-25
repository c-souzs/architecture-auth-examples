import type { ReactNode } from 'react'
import { usePermissions, type PermissionRequirement } from '@/hooks/usePermissions'

interface AccessGuardProps extends PermissionRequirement {
  children: ReactNode
}

export function AccessGuard({ children, roles, authorities }: AccessGuardProps) {
  const { canAccess } = usePermissions()

  if (!canAccess({ roles, authorities })) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2 text-center">
        <p className="text-lg font-semibold text-gray-700">Acesso negado</p>
        <p className="text-sm text-gray-500">Você não tem permissão para visualizar este conteúdo.</p>
      </div>
    )
  }

  return <>{children}</>
}
