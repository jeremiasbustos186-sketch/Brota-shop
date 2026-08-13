import type { ReactNode } from 'react'
import { AuthProvider } from './AuthContext'
import { CartProvider } from './cart/CartContext'
import { ProductsProvider } from './products/ProductsContext'

/**
 * Agrupa todos los providers en un solo componente.
 * Evita el "provider hell" en main.tsx (L5).
 *
 * Orden: Auth → Products → Cart
 * (Cart podría necesitar saber si hay usuario en el futuro)
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProductsProvider>
        <CartProvider>{children}</CartProvider>
      </ProductsProvider>
    </AuthProvider>
  )
}
