import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getOrdersByUser } from '../services/orderService'
import { LoadingState } from '../components/ui/LoadingState'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import type { Order } from '../types'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  processing: 'En proceso',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return

    getOrdersByUser(user.uid)
      .then(setOrders)
      .catch(() => setError('No se pudieron cargar tus órdenes.'))
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <LoadingState message="Cargando tus órdenes..." />
  if (error) return <ErrorState message={error} />

  if (orders.length === 0) {
    return (
      <EmptyState
        icon="📦"
        title="Todavía no tenés órdenes"
        description="Cuando hagas tu primera compra, aparecerá acá."
        action={
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Ver catálogo
          </Link>
        }
      />
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Mis órdenes</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="block bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-gray-400 font-mono mb-1">#{order.id.slice(0, 12)}...</p>
                <p className="text-sm text-gray-600">
                  {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                </p>
                {order.createdAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    {order.createdAt.toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>

              <div className="text-right">
                <p className="font-bold text-green-700 text-lg mb-1">
                  ${order.total.toLocaleString()}
                </p>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    STATUS_COLORS[order.status] ?? ''
                  }`}
                >
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
