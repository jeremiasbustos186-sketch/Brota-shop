import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/admin/products', label: '📦 Productos' },
  { to: '/admin/orders', label: '🧾 Órdenes' },
]

export function AdminLayout() {
  return (
    <div className="flex gap-8">
      {/* Sidebar */}
      <aside className="w-48 shrink-0">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Panel Admin
        </h2>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'block px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  )
}
