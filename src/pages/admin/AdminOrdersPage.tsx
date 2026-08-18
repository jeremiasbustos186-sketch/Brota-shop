import { useEffect, useState } from 'react'
import { getAllOrders, getOrdersByStatus, updateOrderStatus } from '../../services/orderService'
import { LoadingState } from '../../components/ui/LoadingState'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import type { Order, OrderStatus } from '../../types'

const ALL_STATUSES: Array<{ value: OrderStatus | ''; label: string }> = [
  { value: '', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'processing', label: 'En proceso' },
  { value: 'completed', label: 'Completadas' },
  { value: 'cancelled', label: 'Canceladas' },
]

// Máquina de estados: transiciones permitidas (L8)
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending: ['processing', 'cancelled'],
  processing: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  async function fetchOrders() {
    setLoading(true)
    setError('')
    try {
      const result = statusFilter
        ? await getOrdersByStatus(statusFilter)
        : await getAllOrders()
      setOrders(result)
    } catch (e) {
      console.error('[AdminOrdersPage] Error cargando órdenes:', e)
      setError('No se pudieron cargar las órdenes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [statusFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStatusChange(order: Order, newStatus: OrderStatus) {
    setUpdatingId(order.id)
    try {
      await updateOrderStatus(order.id, newStatus)
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
      )
    } catch {
      alert('No se pudo actualizar el estado.')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) return <LoadingState message="Cargando órdenes..." />
  if (error) return <ErrorState message={error} onRetry={fetchOrders} />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Órdenes</h1>
        <div className="flex gap-2">
          {ALL_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={[
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                statusFilter === s.value
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              ].join(' ')}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState icon="🧾" title="No hay órdenes" description="Con el filtro actual no se encontraron órdenes." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500 text-xs uppercase tracking-wider">
                <th className="pb-3 pr-4">ID</th>
                <th className="pb-3 pr-4">Usuario</th>
                <th className="pb-3 pr-4">Total</th>
                <th className="pb-3 pr-4">Estado</th>
                <th className="pb-3 pr-4">Fecha</th>
                <th className="pb-3">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => {
                const nextStatuses = NEXT_STATUS[order.status] ?? []
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4">
                      <span className="font-mono text-xs text-gray-500">
                        {order.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-600 text-xs">{order.userId.slice(0, 8)}...</td>
                    <td className="py-3 pr-4 font-semibold text-gray-800">
                      ${order.total.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-500 text-xs">
                      {order.createdAt?.toLocaleDateString('es-AR') ?? '—'}
                    </td>
                    <td className="py-3">
                      {nextStatuses.length > 0 ? (
                        <select
                          disabled={updatingId === order.id}
                          defaultValue=""
                          onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                          className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50"
                        >
                          <option value="" disabled>Cambiar...</option>
                          {nextStatuses.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
