import { useEffect } from 'react'
import { useProducts } from '../contexts/products/ProductsContext'
import { useDebounce } from '../hooks/useDebounce'
import { ProductCard } from '../components/ProductCard'
import { SkeletonGrid } from '../components/ui/SkeletonCard'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { Button } from '../components/ui/Button'
import type { ProductCategory } from '../types'

const CATEGORIES: Array<{ value: ProductCategory | ''; label: string; emoji: string }> = [
  { value: '', label: 'Todas', emoji: '🌿' },
  { value: 'suculentas', label: 'Suculentas', emoji: '🪴' },
  { value: 'tropicales', label: 'Tropicales', emoji: '🌴' },
  { value: 'cactus', label: 'Cactus', emoji: '🌵' },
  { value: 'exterior', label: 'Exterior', emoji: '🌻' },
  { value: 'accesorios', label: 'Accesorios', emoji: '🧰' },
]

export function CatalogPage() {
  const {
    products,
    loading,
    loadingMore,
    error,
    hasMore,
    search,
    category,
    setSearch,
    setCategory,
    loadFirstPage,
    loadMore,
    reset,
  } = useProducts()

  const debouncedSearch = useDebounce(search, 400)

  useEffect(() => {
    reset()
    loadFirstPage()
  }, [debouncedSearch, category]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value)
    if (category) setCategory('')
  }

  function handleCategoryChange(cat: ProductCategory | '') {
    setCategory(cat)
    setSearch('')
  }

  return (
    <div>
      {/* Hero banner */}
      <div className="relative bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 rounded-3xl p-8 mb-8 overflow-hidden">
        {/* Círculos decorativos */}
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute -bottom-16 -left-6 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />

        <div className="relative">
          <p className="text-green-200 text-xs font-semibold mb-2 uppercase tracking-widest">
            Vivero online 🌱
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Encontrá tu planta perfecta
          </h1>
          <p className="text-green-100 text-base mb-6">
            Suculentas, tropicales, cactus y accesorios. Con cuidado de verdad.
          </p>

          {/* Buscador */}
          <div className="relative max-w-xl">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Buscar plantas..."
              className="w-full bg-white/20 border border-white/30 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

      {/* Filtros por categoría */}
      <div className="flex gap-2 flex-wrap mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => handleCategoryChange(cat.value)}
            className={[
              'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all',
              category === cat.value
                ? 'bg-green-700 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-700',
            ].join(' ')}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Contenido */}
      {loading ? (
        <SkeletonGrid count={8} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadFirstPage} />
      ) : products.length === 0 ? (
        <EmptyState
          icon="🌱"
          title="No encontramos productos"
          description={
            search
              ? `No hay resultados para "${search}". Probá con otro término.`
              : 'Esta categoría no tiene productos aún.'
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} layout="grid" product={product} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-10">
              <Button variant="outline" loading={loadingMore} onClick={loadMore}>
                {loadingMore ? 'Cargando más...' : 'Cargar más'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
