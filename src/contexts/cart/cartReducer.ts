import type { CartAction, CartItem, CartState } from '../../types'

// ── Estado inicial ─────────────────────────────────────────────────────────────

export const initialCartState: CartState = {
  items: [],
  total: 0,
}

// ── Helper: calcular total ─────────────────────────────────────────────────────

function calculateTotal(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
}

// ── Reducer puro ───────────────────────────────────────────────────────────────
// NUNCA muta el estado. Siempre retorna un objeto nuevo.
// Es una función pura: mismo input → mismo output. No tiene side effects.

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity = 1 } = action.payload
      const existing = state.items.find((i) => i.product.id === product.id)

      let newItems: CartItem[]

      if (existing) {
        // Producto ya en carrito → acumular, sin duplicar
        newItems = state.items.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      } else {
        // Producto nuevo → agregar al final
        newItems = [...state.items, { product, quantity, addedAt: new Date() }]
      }

      return { items: newItems, total: calculateTotal(newItems) }
    }

    case 'REMOVE_ITEM': {
      const productId = action.payload
      const newItems = state.items.filter((i) => i.product.id !== productId)
      return { items: newItems, total: calculateTotal(newItems) }
    }

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload

      // Quantity = 0 → eliminar el item (edge case crítico del L9)
      if (quantity <= 0) {
        const newItems = state.items.filter((i) => i.product.id !== productId)
        return { items: newItems, total: calculateTotal(newItems) }
      }

      const newItems = state.items.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      )
      return { items: newItems, total: calculateTotal(newItems) }
    }

    case 'CLEAR_CART': {
      return initialCartState
    }

    case 'LOAD_FROM_STORAGE': {
      // Restaurar desde localStorage (lazy initializer del CartContext)
      const items = action.payload
      return { items, total: calculateTotal(items) }
    }

    default:
      return state
  }
}
