import { NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { usePermissions } from '@/hooks/usePermissions'
import { appRoutes } from '@/router/routeConfig'

export function Sidebar() {
  const { logout } = useAuth()
  const { canAccess } = usePermissions()

  const visibleRoutes = appRoutes.filter(route =>
    !route.permission || canAccess(route.permission)
  )

  return (
    <aside className="w-56 min-h-screen bg-gray-900 flex flex-col">
      <div className="px-5 py-5 border-b border-gray-700">
        <span className="text-white font-semibold text-sm tracking-wide">Auth Examples</span>
      </div>
      <nav className="flex flex-col gap-0.5 px-2 py-3 flex-1">
        {visibleRoutes.map(route => (
          <NavLink
            key={route.path}
            to={route.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            {route.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-2 py-3 border-t border-gray-700">
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
