import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getOrderById } from '../services/orderService'
import { useAuth } from '../contexts/AuthContext'
import { LoadingState } from '../components/ui/LoadingState'
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

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!orderId) return

    getOrderById(orderId)
      .then((o) => {
        if (!o) {
          setError('Orden no encontrada.')
          return
        }
        // Verificar que la orden le pertenece al usuario (la Firestore Rule también lo hace)
        if (o.userId !== user?.uid) {
          setError('No tenés permiso para ver esta orden.')
          return
        }
        setOrder(o)
      })
      .catch(() => setError('No se pudo cargar la orden.'))
      .finally(() => setLoading(false))
  }, [orderId, user])

  if (loading) return <LoadingState />
  if (error || !order) return <ErrorState message={error} onRetry={() => navigate('/orders')} />

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to="/orders"
        className="text-sm text-gray-500 hover:text-green-600 mb-6 flex items-center gap-1"
      >
        ← Mis órdenes
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Detalle de orden</h1>
            <p className="text-xs text-gray-400 font-mono">{order.id}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              STATUS_COLORS[order.status] ?? ''
            }`}
          >
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
        </div>

        {order.createdAt && (
          <p className="text-sm text-gray-500 mb-6">
            Fecha:{' '}
            <strong>
              {order.createdAt.toLocaleDateString('es-AR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </strong>
          </p>
        )}

        {/* Items — snapshot inmutable (L2/L8) */}
        <div className="space-y-3 mb-6">
          <h2 className="font-semibold text-gray-700">Productos</h2>
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0"
            >
              <div>
                <p className="font-medium text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-400">
                  ${item.priceAtPurchase.toLocaleString()} × {item.quantity}
                </p>
              </div>
              <p className="font-semibold text-gray-700">
                ${(item.priceAtPurchase * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <hr className="border-gray-200 mb-4" />

        <div className="flex justify-between font-bold text-lg">
          <span className="text-gray-800">Total pagado</span>
          <span className="text-green-700">${order.total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
