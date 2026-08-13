import { render, type RenderOptions } from '@testing-library/react'
import { type ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { CartProvider } from '../contexts/cart/CartContext'
import { ProductsProvider } from '../contexts/products/ProductsContext'
import { AuthProvider } from '../contexts/AuthContext'

/**
 * Wrapper de testing que compone todos los providers reales (L9).
 *
 * Ventajas:
 * - Los componentes reciben los mismos providers que en producción
 * - Los tests verifican comportamiento observable, no implementación interna
 * - Mocking solo donde sea necesario (vi.mock para Firebase, MSW para HTTP)
 */

type Options = RenderOptions & {
  initialRoute?: string
}

function AllProviders({ children, initialRoute = '/' }: { children: ReactNode; initialRoute?: string }) {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>{children}</CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </MemoryRouter>
  )
}

export function renderWithProviders(
  ui: ReactNode,
  { initialRoute, ...options }: Options = {}
) {
  return render(
    <AllProviders initialRoute={initialRoute}>{ui}</AllProviders>,
    options
  )
}

// Re-exportar todo de testing-library para que los tests solo importen de acá
export * from '@testing-library/react'
