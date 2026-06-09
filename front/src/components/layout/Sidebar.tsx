import { NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { usePermissions } from '@/hooks/usePermissions'
import { appRoutes } from '@/router/routeConfig'

interface SidebarProps {
  cartCount: number
  onCartClick: () => void
}

export function Sidebar({ cartCount, onCartClick }: SidebarProps) {
  const { logout } = useAuth()
  const { canAccess } = usePermissions()

  const visibleRoutes = appRoutes.filter(r => !r.permission || canAccess(r.permission))

  return (
    <aside className="w-56 min-h-screen bg-gray-900 flex flex-col">
      <div className="px-5 py-5 border-b border-gray-700">
        <span className="text-white font-semibold text-sm tracking-wide">Auth Examples</span>
      </div>
      <nav className="flex flex-col gap-0.5 px-2 py-3 flex-1">
        {visibleRoutes.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-2 pb-3 border-t border-gray-700 pt-2 flex flex-col gap-1">
        <button
          onClick={onCartClick}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <span>Carrinho</span>
          {cartCount > 0 && (
            <span className="bg-indigo-600 text-white text-xs font-medium px-2 py-0.5 rounded-full min-w-[20px] text-center">
              {cartCount}
            </span>
          )}
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          Sair
        </button>
      </div>
    </aside>
  )
}
