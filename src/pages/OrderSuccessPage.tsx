import { Link, useParams, Navigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>()

  if (!orderId) return <Navigate to="/" replace />

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">¡Compra confirmada!</h1>
        <p className="text-gray-500 mb-4">
          Tu orden fue procesada exitosamente.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-xs text-gray-500 mb-1">Número de orden</p>
          <p className="font-mono text-sm font-bold text-green-800 break-all">{orderId}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/orders">
            <Button variant="solid">Ver mis órdenes</Button>
          </Link>
          <Link to="/">
            <Button variant="outline">Seguir comprando</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
