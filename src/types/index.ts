// ── Usuarios ──────────────────────────────────────────────
export type UserRole = 'customer' | 'admin'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  role: UserRole
  createdAt: Date | null
}

// ── Productos ──────────────────────────────────────────────
export type ProductCategory =
  | 'suculentas'
  | 'tropicales'
  | 'cactus'
  | 'exterior'
  | 'accesorios'

export interface Product {
  id: string
  name: string
  nameLower: string       // para búsqueda por prefijo en Firestore (L4)
  description: string
  price: number
  category: ProductCategory
  imageUrl: string
  stock: number
  createdAt: Date | null
  updatedAt?: Date | null // se setea cuando el admin edita el producto (L7)
}

// ── Carrito ────────────────────────────────────────────────
export interface CartItem {
  product: Product
  quantity: number
  addedAt: Date           // timestamp local para ordenar por reciente (L5)
}

export interface CartState {
  items: CartItem[]
  total: number           // precio total calculado (L5)
}

// Acciones que puede hacer el carrito (discriminated union para useReducer)
export type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: string }       // payload: product id
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_FROM_STORAGE'; payload: CartItem[] } // para restaurar desde localStorage

// ── Órdenes ────────────────────────────────────────────────
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled'

// Snapshot del producto al momento de la compra (denormalización Firestore)
// No se guarda el Product completo — solo los datos que importan para el historial
export interface OrderItem {
  productId: string
  name: string           // nombre al momento de comprar (puede cambiar después)
  priceAtPurchase: number // precio al momento de comprar (puede cambiar después)
  quantity: number
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]   // snapshot, NO CartItem[] (que tiene el Product completo)
  total: number
  status: OrderStatus
  createdAt: Date | null
  updatedAt?: Date | null // se setea cuando el admin cambia el status (L8)
}
