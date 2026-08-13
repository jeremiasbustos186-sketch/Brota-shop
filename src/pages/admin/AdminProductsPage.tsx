import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, deleteProduct } from '../../services/productService'
import { LoadingState } from '../../components/ui/LoadingState'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Button } from '../../components/ui/Button'
import type { Product } from '../../types'

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null) // per-row deleting state (L7)

  async function fetchProducts() {
    setLoading(true)
    setError('')
    try {
      const result = await getProducts({ pageSize: 50 })
      setProducts(result.products)
    } catch {
      setError('No se pudieron cargar los productos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  async function handleDelete(product: Product) {
    if (!confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return

    setDeletingId(product.id)
    try {
      await deleteProduct(product.id)
      setProducts((prev) => prev.filter((p) => p.id !== product.id))
    } catch {
      alert('No se pudo eliminar el producto.')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <LoadingState message="Cargando productos..." />
  if (error) return <ErrorState message={error} onRetry={fetchProducts} />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
        <Link to="/admin/products/new">
          <Button size="sm">+ Nuevo producto</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No hay productos"
          description="Creá el primer producto del catálogo."
          action={
            <Link to="/admin/products/new">
              <Button size="sm">Crear producto</Button>
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500 text-xs uppercase tracking-wider">
                <th className="pb-3 pr-4">Producto</th>
                <th className="pb-3 pr-4">Categoría</th>
                <th className="pb-3 pr-4">Precio</th>
                <th className="pb-3 pr-4">Stock</th>
                <th className="pb-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.imageUrl || '/placeholder.png'}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-medium text-gray-800">{product.name}</p>
                        <p className="text-xs text-gray-400 line-clamp-1">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 capitalize text-gray-600">{product.category}</td>
                  <td className="py-3 pr-4 font-semibold text-gray-800">
                    ${product.price.toLocaleString()}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`font-medium ${
                        product.stock === 0 ? 'text-red-500' : 'text-gray-700'
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/products/${product.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={deletingId === product.id}
                        onClick={() => handleDelete(product)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
