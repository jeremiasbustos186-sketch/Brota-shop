import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProductById } from '../services/productService'
import { useCart } from '../contexts/cart/CartContext'
import { LoadingState } from '../components/ui/LoadingState'
import { ErrorState } from '../components/ui/ErrorState'
import { Button } from '../components/ui/Button'
import type { Product } from '../types'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getProductById(id)
      .then((p) => {
        if (!p) setError('Producto no encontrado.')
        else setProduct(p)
      })
      .catch(() => setError('Error al cargar el producto.'))
      .finally(() => setLoading(false))
  }, [id])

  function handleAddToCart() {
    if (!product) return
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return <LoadingState />
  if (error || !product) return <ErrorState message={error} onRetry={() => navigate(-1)} />

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-500 hover:text-green-600 mb-6 flex items-center gap-1"
      >
        ← Volver
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2">
            <img
              src={product.imageUrl || '/placeholder.png'}
              alt={product.name}
              className="w-full h-80 md:h-full object-cover"
            />
          </div>

          <div className="md:w-1/2 p-8 flex flex-col gap-4">
            <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">
              {product.category}
            </p>
            <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            <div className="text-3xl font-bold text-green-700">
              ${product.price.toLocaleString()}
            </div>

            {product.stock > 0 ? (
              <p className="text-sm text-gray-500">Stock: {product.stock} unidades</p>
            ) : (
              <p className="text-sm text-red-500 font-medium">Sin stock</p>
            )}

            {product.stock > 0 && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Cantidad:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                  >
                    −
                  </button>
                  <span className="px-4 py-1 text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <Button
              fullWidth
              size="lg"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {added ? '✓ Agregado al carrito' : 'Agregar al carrito'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
