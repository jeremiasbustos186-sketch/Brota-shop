import type { CartItem, Order, Product, UserProfile } from '../types'

// ── Producto ───────────────────────────────────────────────────────────────────

export const productFixture: Product = {
  id: 'p_test_1',
  name: 'Suculenta Test',
  nameLower: 'suculenta test',
  description: 'Planta de prueba para tests',
  price: 1000,
  category: 'suculentas',
  imageUrl: 'https://example.com/suculenta.jpg',
  stock: 10,
  createdAt: new Date('2024-01-01'),
}

export const product2Fixture: Product = {
  ...productFixture,
  id: 'p_test_2',
  name: 'Cactus Test',
  nameLower: 'cactus test',
  price: 500,
  category: 'cactus',
  stock: 5,
}

// ── Cart item ──────────────────────────────────────────────────────────────────

export const cartItemFixture: CartItem = {
  product: productFixture,
  quantity: 1,
  addedAt: new Date('2024-01-01T10:00:00'),
}

// ── CartState ──────────────────────────────────────────────────────────────────

export const cartStateFixture = {
  items: [] as CartItem[],
  total: 0,
}

export const cartStatWithItemFixture = {
  items: [cartItemFixture],
  total: 1000,
}

// ── Usuarios ───────────────────────────────────────────────────────────────────

export const userCustomerFixture = {
  uid: 'user_customer_1',
  email: 'customer@test.com',
  displayName: 'Cliente Test',
}

export const userAdminFixture = {
  uid: 'user_admin_1',
  email: 'admin@test.com',
  displayName: 'Admin Test',
}

export const profileCustomerFixture: UserProfile = {
  uid: 'user_customer_1',
  email: 'customer@test.com',
  displayName: 'Cliente Test',
  role: 'customer',
  createdAt: new Date('2024-01-01'),
}

export const profileAdminFixture: UserProfile = {
  uid: 'user_admin_1',
  email: 'admin@test.com',
  displayName: 'Admin Test',
  role: 'admin',
  createdAt: new Date('2024-01-01'),
}

// ── Orden ──────────────────────────────────────────────────────────────────────

export const orderFixture: Order = {
  id: 'order_test_1',
  userId: 'user_customer_1',
  items: [
    {
      productId: productFixture.id,
      name: productFixture.name,
      priceAtPurchase: productFixture.price,
      quantity: 2,
    },
  ],
  total: 2000,
  status: 'pending',
  createdAt: new Date('2024-01-01T12:00:00'),
}
