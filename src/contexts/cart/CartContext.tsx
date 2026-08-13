import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react'
import { cartReducer, initialCartState } from './cartReducer'
import type { CartItem, CartState, Product } from '../../types'

// ── Tipos del contexto ─────────────────────────────────────────────────────────

interface CartContextValue extends CartState {
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number  // cantidad total de unidades (suma de quantities)
}

// ── Constantes ─────────────────────────────────────────────────────────────────

const CART_STORAGE_KEY = 'brota_cart'

// ── Lazy initializer (carga localStorage solo en el primer render) ──────────────

function initializeCart(): typeof initialCartState {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (!stored) return initialCartState

    const parsed = JSON.parse(stored) as CartItem[]

    // Restaurar addedAt como Date (JSON.parse lo convierte en string)
    const items = parsed.map((item) => ({
      ...item,
      addedAt: new Date(item.addedAt),
    }))

    const total = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0)
    return { items, total }
  } catch {
    return initialCartState
  }
}

// ── Contexto ───────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null)

// ── Provider ───────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, initializeCart)

  // Persistir en localStorage cada vez que cambia el carrito
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items))
    } catch {
      // localStorage puede fallar en modo privado o sin espacio
    }
  }, [state.items])

  // useCallback: estabiliza las funciones para que no recreen en cada render
  const addItem = useCallback((product: Product, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } })
  }, [])

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId })
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
  }, [])

  // useMemo: estabiliza el objeto de contexto (evita re-renders innecesarios)
  const value = useMemo<CartContextValue>(
    () => ({
      ...state,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems: state.items.reduce((acc, i) => acc + i.quantity, 0),
    }),
    [state, addItem, removeItem, updateQuantity, clearCart]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// ── Hook con guard ─────────────────────────────────────────────────────────────
// Exportado desde aquí para mantener todo junto

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart debe usarse dentro de <CartProvider>')
  }
  return ctx
}
