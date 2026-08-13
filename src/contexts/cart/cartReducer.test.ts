import { describe, it, expect } from 'vitest'
import { cartReducer, initialCartState } from './cartReducer'
import type { CartItem, Product } from '../../types'

// ── Fixtures ───────────────────────────────────────────────────────────────────

const productFixture: Product = {
  id: 'p_1',
  name: 'Suculenta Test',
  nameLower: 'suculenta test',
  description: 'Planta de prueba',
  price: 1000,
  category: 'suculentas',
  imageUrl: '',
  stock: 10,
  createdAt: null,
}

const product2Fixture: Product = {
  ...productFixture,
  id: 'p_2',
  name: 'Cactus Test',
  nameLower: 'cactus test',
  price: 500,
  stock: 5,
}

function makeItem(product: Product, quantity: number): CartItem {
  return { product, quantity, addedAt: new Date() }
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('cartReducer', () => {

  // 1. ADD_ITEM — producto nuevo
  it('ADD_ITEM agrega un producto nuevo al carrito', () => {
    // Arrange: carrito vacío
    const state = initialCartState

    // Act: agregar un producto con quantity 1
    const next = cartReducer(state, {
      type: 'ADD_ITEM',
      payload: { product: productFixture, quantity: 1 },
    })

    // Assert: hay 1 item con el id correcto y el total es el precio del producto
    expect(next.items).toHaveLength(1)
    expect(next.items[0].product.id).toBe(productFixture.id)
    expect(next.items[0].quantity).toBe(1)
    expect(next.total).toBe(1000)
  })

  // 2. ADD_ITEM — producto repetido acumula quantity
  it('ADD_ITEM con producto existente incrementa la quantity sin duplicar', () => {
    // Arrange: carrito con 1 unidad del producto
    const state = {
      items: [makeItem(productFixture, 1)],
      total: 1000,
    }

    // Act: agregar 2 unidades más del mismo producto
    const next = cartReducer(state, {
      type: 'ADD_ITEM',
      payload: { product: productFixture, quantity: 2 },
    })

    // Assert: sigue siendo 1 item pero con quantity 3
    expect(next.items).toHaveLength(1)
    expect(next.items[0].quantity).toBe(3)
    expect(next.total).toBe(3000)
  })

  // 3. REMOVE_ITEM — elimina el producto correcto
  it('REMOVE_ITEM elimina solo el producto indicado', () => {
    // Arrange: carrito con dos productos distintos
    const state = {
      items: [makeItem(productFixture, 2), makeItem(product2Fixture, 1)],
      total: 2500,
    }

    // Act: eliminar el primero
    const next = cartReducer(state, {
      type: 'REMOVE_ITEM',
      payload: productFixture.id,
    })

    // Assert: queda solo el segundo producto
    expect(next.items).toHaveLength(1)
    expect(next.items[0].product.id).toBe(product2Fixture.id)
    expect(next.total).toBe(500)
  })

  // 4. UPDATE_QUANTITY — actualiza correctamente
  it('UPDATE_QUANTITY cambia la quantity y recalcula el total', () => {
    // Arrange: carrito con 1 unidad
    const state = {
      items: [makeItem(productFixture, 1)],
      total: 1000,
    }

    // Act: cambiar a 4 unidades
    const next = cartReducer(state, {
      type: 'UPDATE_QUANTITY',
      payload: { productId: productFixture.id, quantity: 4 },
    })

    // Assert: quantity es 4 y total es 4000
    expect(next.items[0].quantity).toBe(4)
    expect(next.total).toBe(4000)
  })

  // 5. UPDATE_QUANTITY a 0 → elimina el item (edge case crítico del L9)
  it('UPDATE_QUANTITY a 0 elimina el item del carrito', () => {
    // Arrange: carrito con 2 unidades
    const state = {
      items: [makeItem(productFixture, 2)],
      total: 2000,
    }

    // Act: setear quantity = 0
    const next = cartReducer(state, {
      type: 'UPDATE_QUANTITY',
      payload: { productId: productFixture.id, quantity: 0 },
    })

    // Assert: el carrito queda vacío
    expect(next.items).toHaveLength(0)
    expect(next.total).toBe(0)
  })

  // 6. CLEAR_CART — vacía completamente el carrito
  it('CLEAR_CART vacía el carrito y resetea el total', () => {
    // Arrange: carrito con productos
    const state = {
      items: [makeItem(productFixture, 3), makeItem(product2Fixture, 2)],
      total: 4000,
    }

    // Act: limpiar el carrito
    const next = cartReducer(state, { type: 'CLEAR_CART' })

    // Assert: estado inicial
    expect(next.items).toHaveLength(0)
    expect(next.total).toBe(0)
  })

  // 7. REMOVE_ITEM con id inexistente → no altera el estado
  it('REMOVE_ITEM con producto inexistente no altera el carrito', () => {
    // Arrange: carrito con un producto
    const state = {
      items: [makeItem(productFixture, 1)],
      total: 1000,
    }

    // Act: intentar eliminar un id que no existe
    const next = cartReducer(state, {
      type: 'REMOVE_ITEM',
      payload: 'id_que_no_existe',
    })

    // Assert: el estado no cambia
    expect(next.items).toHaveLength(1)
    expect(next.total).toBe(1000)
  })

  // 8. LOAD_FROM_STORAGE — restaura el carrito y recalcula el total
  it('LOAD_FROM_STORAGE restaura los items y recalcula el total correctamente', () => {
    // Arrange: items guardados (simulando lo que viene de localStorage)
    const storedItems: CartItem[] = [
      makeItem(productFixture, 2),   // 2 × $1000 = $2000
      makeItem(product2Fixture, 3),  // 3 × $500  = $1500
    ]

    // Act: restaurar desde storage
    const next = cartReducer(initialCartState, {
      type: 'LOAD_FROM_STORAGE',
      payload: storedItems,
    })

    // Assert: items restaurados y total recalculado
    expect(next.items).toHaveLength(2)
    expect(next.total).toBe(3500)
  })
})
