import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/cart/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'

export function CartPage() {
  const { items, total, totalItems, removeItem, updateQuantity, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <EmptyState
        icon="🛒"
        title="Tu carrito está vacío"
        description="Explorá el catálogo y agregá tus plantas favoritas."
        action={
          <Link to="/">
            <Button>Ver catálogo</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Carrito <span className="text-lg text-gray-500">({totalItems} items)</span>
        </h1>
        <Button variant="ghost" size="sm" onClick={clearCart}>
          Vaciar carrito
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Lista de items */}
        <div className="flex-1 space-y-4">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex gap-4 bg-white rounded-xl border border-gray-100 p-4"
            >
              <Link to={`/products/${product.id}`} className="shrink-0">
                <img
                  src={product.imageUrl || '/placeholder.png'}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              </Link>

              <div className="flex flex-col flex-1 gap-1">
                <Link to={`/products/${product.id}`}>
                  <h3 className="font-semibold text-gray-800 hover:text-green-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                <p className="text-green-700 font-bold">
                  ${(product.price * quantity).toLocaleString()}
                </p>

                <div className="flex items-center gap-3 mt-auto">
                  {/* Control de cantidad */}
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg text-sm"
                    >
                      −
                    </button>
                    <span className="px-3 py-1 text-sm">{quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(product.id, Math.min(product.stock, quantity + 1))
                      }
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg text-sm"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(product.id)}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="lg:w-80">
          <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
            <h2 className="font-bold text-gray-800 mb-4">Resumen</h2>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between">
                  <span>
                    {product.name} × {quantity}
                  </span>
                  <span>${(product.price * quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <hr className="border-gray-200 mb-4" />

            <div className="flex justify-between font-bold text-gray-800 mb-6">
              <span>Total</span>
              <span className="text-green-700 text-lg">${total.toLocaleString()}</span>
            </div>

            {user ? (
              <Button fullWidth onClick={() => navigate('/checkout')}>
                Continuar al pago
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 text-center">
                  Necesitás una cuenta para comprar
                </p>
                <Button fullWidth onClick={() => navigate('/login', { state: { from: '/checkout' } })}>
                  Ingresar para comprar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
