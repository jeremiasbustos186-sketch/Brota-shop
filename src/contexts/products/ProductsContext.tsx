import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import { getProducts, type GetProductsParams } from '../../services/productService'
import type { Product, ProductCategory } from '../../types'
import type { DocumentSnapshot } from 'firebase/firestore'

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface ProductsContextValue {
  products: Product[]
  loading: boolean          // primera carga
  loadingMore: boolean      // carga de página siguiente
  error: string | null
  hasMore: boolean
  search: string
  category: ProductCategory | ''
  setSearch: (q: string) => void
  setCategory: (c: ProductCategory | '') => void
  loadFirstPage: () => Promise<void>
  loadMore: () => Promise<void>
  reset: () => void
}

const ProductsContext = createContext<ProductsContextValue | null>(null)

// ── Provider ───────────────────────────────────────────────────────────────────

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<ProductCategory | ''>('')

  // ── Primera página ─────────────────────────────────────────────────────────

  const loadFirstPage = useCallback(async () => {
    setLoading(true)
    setError(null)
    setLastDoc(null)

    const params: GetProductsParams = {}
    if (search) params.search = search
    else if (category) params.category = category
    if (!search) params.orderByField = 'createdAt'

    try {
      const result = await getProducts({ ...params, pageSize: 12 })
      setProducts(result.products)
      setLastDoc(result.lastDoc)
      setHasMore(result.hasMore)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [search, category])

  // ── Página siguiente (cursor) ──────────────────────────────────────────────

  const loadMore = useCallback(async () => {
    if (!hasMore || !lastDoc || loadingMore) return

    setLoadingMore(true)

    const params: GetProductsParams = { lastDoc }
    if (search) params.search = search
    else if (category) params.category = category
    if (!search) params.orderByField = 'createdAt'

    try {
      const result = await getProducts({ ...params, pageSize: 12 })
      setProducts((prev) => [...prev, ...result.products])
      setLastDoc(result.lastDoc)
      setHasMore(result.hasMore)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoadingMore(false)
    }
  }, [hasMore, lastDoc, loadingMore, search, category])

  // ── Reset (cuando cambian filtros) ─────────────────────────────────────────

  const reset = useCallback(() => {
    setProducts([])
    setLastDoc(null)
    setHasMore(false)
    setError(null)
  }, [])

  const value = useMemo<ProductsContextValue>(
    () => ({
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
    }),
    [products, loading, loadingMore, error, hasMore, search, category, loadFirstPage, loadMore, reset]
  )

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

// ── Hook con guard ─────────────────────────────────────────────────────────────

export function useProducts(): ProductsContextValue {
  const ctx = useContext(ProductsContext)
  if (!ctx) {
    throw new Error('useProducts debe usarse dentro de <ProductsProvider>')
  }
  return ctx
}
