import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/cart/CartContext'

export function Header() {
  const { user, profile, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-green-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-white flex items-center gap-1.5">
          🌿 <span>Brota</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-6">
          <Link to="/" className="text-sm text-green-100 hover:text-white transition-colors font-medium">
            Catálogo
          </Link>
          {profile?.role === 'admin' && (
            <Link to="/admin" className="text-sm text-green-100 hover:text-white transition-colors font-medium">
              Admin
            </Link>
          )}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Carrito */}
          <Link
            to="/cart"
            className="relative p-2 text-green-100 hover:text-white transition-colors"
            aria-label="Carrito"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-green-900 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>

          {/* Auth */}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-green-200 hidden sm:block font-medium">
                {profile?.displayName || user.email}
              </span>
              <Link to="/orders" className="text-sm text-green-100 hover:text-white transition-colors hidden sm:block">
                Mis órdenes
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm border border-green-500 text-green-100 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm text-green-100 hover:text-white transition-colors">
                Ingresar
              </Link>
              <Link
                to="/signup"
                className="text-sm bg-white text-green-800 hover:bg-green-50 px-4 py-1.5 rounded-lg font-semibold transition-colors"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
