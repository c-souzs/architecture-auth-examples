import { Authority } from '@/models/permissions'
import type { PermissionRequirement } from '@/hooks/usePermissions'
import type { UserInfo } from '@/models/auth'

export interface RouteConfig {
  path: string
  label: string
  permission?: PermissionRequirement
}

export const appRoutes: RouteConfig[] = [
  { path: '/users',      label: 'Usuários',   permission: { authorities: [Authority.USER_READ] } },
  { path: '/categories', label: 'Categorias', permission: { authorities: [Authority.CATEGORY_READ] } },
  { path: '/products',   label: 'Produtos',   permission: { authorities: [Authority.PRODUCT_READ, Authority.PRODUCT_CATALOG] } },
  { path: '/customers',  label: 'Clientes',   permission: { authorities: [Authority.CUSTOMER_READ] } },
  { path: '/stock',      label: 'Estoque',    permission: { authorities: [Authority.STOCK_READ] } },
  { path: '/orders',     label: 'Pedidos',    permission: { authorities: [Authority.ORDER_READ, Authority.ORDER_OWN] } },
]

function userCanAccess(user: UserInfo, permission?: PermissionRequirement): boolean {
  if (!permission) return true
  const { roles = [], authorities = [] } = permission
  if (!roles.length && !authorities.length) return true
  return roles.some(r => user.roles.includes(r)) ||
         authorities.some(a => user.authorities.includes(a))
}

export function resolveRedirect(from: string, user: UserInfo): string {
  const route = appRoutes.find(r => r.path === from)
  if (route && userCanAccess(user, route.permission)) return from
  return appRoutes.find(r => userCanAccess(user, r.permission))?.path ?? '/forbidden'
}
