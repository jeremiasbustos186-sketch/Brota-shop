import { Link } from 'react-router-dom'
import { useCart } from '../contexts/cart/CartContext'
import { Button } from './ui/Button'
import type { Product } from '../types'

type ProductCardProps =
  | { layout: 'grid'; product: Product }
  | { layout: 'list'; product: Product }

const CATEGORY_EMOJIS: Record<string, string> = {
  suculentas: '🪴',
  tropicales: '🌴',
  cactus: '🌵',
  exterior: '🌻',
  accesorios: '🧰',
}

export function ProductCard({ layout, product }: ProductCardProps) {
  const { addItem } = useCart()
  const emoji = CATEGORY_EMOJIS[product.category] ?? '🌿'

  if (layout === 'list') {
    return (
      <div className="flex gap-4 bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all">
        <Link to={`/products/${product.id}`} className="shrink-0">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-24 h-24 object-cover rounded-xl"
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl flex items-center justify-center text-3xl">
              {emoji}
            </div>
          )}
        </Link>
        <div className="flex flex-col flex-1 gap-1">
          <Link to={`/products/${product.id}`}>
            <h3 className="font-semibold text-gray-800 hover:text-green-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-green-600 font-medium capitalize">{product.category}</p>
          <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-green-700 font-bold text-lg">${product.price.toLocaleString()}</span>
            <Button size="sm" onClick={() => addItem(product)} disabled={product.stock === 0}>
              {product.stock === 0 ? 'Sin stock' : 'Agregar'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // layout === 'grid'
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <Link to={`/products/${product.id}`} className="relative block overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-52 bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 flex items-center justify-center">
            <span className="text-7xl">{emoji}</span>
          </div>
        )}

        {/* Badge categoría */}
        <span className="absolute top-3 left-3 bg-white/90 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full capitalize shadow-sm">
          {product.category}
        </span>

        {/* Badge stock bajo */}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="absolute top-3 right-3 bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            ¡Solo {product.stock}!
          </span>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-800 hover:text-green-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 line-clamp-2 flex-1">{product.description}</p>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
          <span className="text-green-700 font-bold text-xl">
            ${product.price.toLocaleString()}
          </span>
          <Button size="sm" onClick={() => addItem(product)} disabled={product.stock === 0}>
            {product.stock === 0 ? 'Sin stock' : 'Agregar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
