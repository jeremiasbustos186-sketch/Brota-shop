import { useState, useRef } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { doc, collection } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { createOrder } from '../services/orderService'
import { useCart } from '../contexts/cart/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import type { OrderItem } from '../types'

export function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Pre-generar orderId para idempotencia (L8):
  // Si el usuario hace doble submit, reutiliza el mismo ID y setDoc sobrescribe en lugar de duplicar.
  const orderIdRef = useRef<string>(doc(collection(db, 'orders')).id)

  if (items.length === 0) {
    return <Navigate to="/cart" replace />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  async function handleConfirm() {
    if (isSubmitting) return // barrera contra doble click

    setIsSubmitting(true)
    setError('')

    try {
      // Convertir CartItems → OrderItems (snapshot inmutable, L2/L8)
      const orderItems: OrderItem[] = items.map((cartItem) => ({
        productId: cartItem.product.id,
        name: cartItem.product.name,
        priceAtPurchase: cartItem.product.price,
        quantity: cartItem.quantity,
      }))

      const order = await createOrder(
        { userId: user!.uid, items: orderItems, total },
        orderIdRef.current // reutilizar el mismo ID si hay reintento
      )

      // Solo limpiar el carrito DESPUÉS de confirmar éxito (L8)
      clearCart()
      navigate(`/checkout/success/${order.id}`)
    } catch {
      setError('No pudimos procesar tu compra. Revisá tu conexión y volvé a intentar.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Confirmar compra</h1>

      {/* Resumen del carrito */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Tus productos</h2>
        <div className="space-y-3">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {product.name} × {quantity}
              </span>
              <span className="font-medium text-gray-800">
                ${(product.price * quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <hr className="border-gray-200 my-4" />

        <div className="flex justify-between font-bold text-lg">
          <span className="text-gray-800">Total</span>
          <span className="text-green-700">${total.toLocaleString()}</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Botón de confirmación — deshabilitado mientras procesa */}
      <Button
        fullWidth
        size="lg"
        loading={isSubmitting}
        onClick={handleConfirm}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Procesando...' : 'Confirmar compra'}
      </Button>

      <p className="text-xs text-gray-400 text-center mt-3">
        Al confirmar, aceptás los términos de la tienda.
      </p>
    </div>
  )
}
