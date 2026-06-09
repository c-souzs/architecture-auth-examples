import type { PermissionRequirement } from '@/hooks/usePermissions'
import { Authority } from '@/models/permissions'
import type { UserInfo } from '@/models/auth'

export interface RouteConfig {
  path: string
  label: string
  permission?: PermissionRequirement
}

export const appRoutes: RouteConfig[] = [
  { path: '/users', label: 'Usuários', permission: { authorities: [Authority.USER_READ] } },
  { path: '/categories', label: 'Categorias', permission: { authorities: [Authority.CATEGORY_READ] } },
  {
    path: '/products',
    label: 'Produtos',
    permission: { authorities: [Authority.PRODUCT_READ, Authority.PRODUCT_CATALOG] },
  },
  { path: '/customers', label: 'Clientes', permission: { authorities: [Authority.CUSTOMER_READ] } },
  { path: '/stock', label: 'Estoque', permission: { authorities: [Authority.STOCK_READ] } },
  {
    path: '/orders',
    label: 'Pedidos',
    permission: { authorities: [Authority.ORDER_READ, Authority.ORDER_OWN] },
  },
]

function canAccessRoute(route: RouteConfig, user: UserInfo): boolean {
  if (!route.permission) return true
  return (
    (route.permission.authorities?.some(a => user.authorities.includes(a)) ?? false) ||
    (route.permission.roles?.some(r => user.roles.includes(r)) ?? false)
  )
}

export function resolveRedirect(from: string, user: UserInfo): string {
  const known = appRoutes.map(r => r.path)

  if (known.includes(from)) {
    const target = appRoutes.find(r => r.path === from)!
    if (canAccessRoute(target, user)) return from
  }

  return appRoutes.find(r => canAccessRoute(r, user))?.path ?? '/forbidden'
}
