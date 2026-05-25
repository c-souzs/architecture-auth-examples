import { NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { to: '/users', label: 'Usuários' },
  { to: '/categories', label: 'Categorias' },
  { to: '/products', label: 'Produtos' },
  { to: '/customers', label: 'Clientes' },
  { to: '/stock', label: 'Estoque' },
  { to: '/orders', label: 'Pedidos' },
]

export function Sidebar() {
  const { logout } = useAuth()

  return (
    <aside className="w-56 min-h-screen bg-gray-900 flex flex-col">
      <div className="px-5 py-5 border-b border-gray-700">
        <span className="text-white font-semibold text-sm tracking-wide">Auth Examples</span>
      </div>
      <nav className="flex flex-col gap-0.5 px-2 py-3 flex-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
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
