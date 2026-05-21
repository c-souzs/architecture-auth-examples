import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/users', label: 'Usuários' },
  { to: '/categories', label: 'Categorias' },
  { to: '/products', label: 'Produtos' },
  { to: '/customers', label: 'Clientes' },
  { to: '/stock', label: 'Estoque' },
  { to: '/orders', label: 'Pedidos' },
]

export function Sidebar() {
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
    </aside>
  )
}
