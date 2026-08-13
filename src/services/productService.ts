import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  type DocumentSnapshot,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { productConverter } from './converters/productConverter'
import type { Product, ProductCategory } from '../types'

// Referencia tipada — todos los docs retornan Product gracias al converter
const productsRef = collection(db, 'products').withConverter(productConverter)

// ── Leer ──────────────────────────────────────────────────────────────────────

export type GetProductsParams = {
  category?: ProductCategory
  search?: string              // prefijo para nameLower (L4)
  orderByField?: 'price' | 'createdAt'
  direction?: 'asc' | 'desc'
  pageSize?: number
  lastDoc?: DocumentSnapshot   // cursor para paginación (L4) — debe ser DocumentSnapshot completo
}

export type GetProductsResult = {
  products: Product[]
  lastDoc: DocumentSnapshot | null  // null si no hay más páginas
  hasMore: boolean
}

/**
 * Lista productos con filtros, búsqueda por prefijo y paginación por cursor.
 * Si combinás category + orderBy → índice compuesto requerido en Firestore.
 */
export async function getProducts(params: GetProductsParams = {}): Promise<GetProductsResult> {
  const pageSize = params.pageSize ?? 12

  let q = query(productsRef, limit(pageSize + 1)) // +1 para detectar hasMore

  if (params.search) {
    // Búsqueda por prefijo: nameLower >= 'abc' AND nameLower < 'abd'
    const searchLower = params.search.toLowerCase()
    const endStr = searchLower.slice(0, -1) + String.fromCharCode(searchLower.charCodeAt(searchLower.length - 1) + 1)
    q = query(q, where('nameLower', '>=', searchLower), where('nameLower', '<', endStr))
  } else if (params.category) {
    q = query(q, where('category', '==', params.category))
  }

  if (params.orderByField && !params.search) {
    q = query(q, orderBy(params.orderByField, params.direction ?? 'asc'))
  }

  if (params.lastDoc) {
    q = query(q, startAfter(params.lastDoc))
  }

  const snap = await getDocs(q)
  const docs = snap.docs
  const hasMore = docs.length > pageSize
  const pageDocs = hasMore ? docs.slice(0, pageSize) : docs

  return {
    products: pageDocs.map((d) => d.data()),
    lastDoc: pageDocs.length > 0 ? pageDocs[pageDocs.length - 1] : null,
    hasMore,
  }
}

/**
 * Trae un producto por ID. Retorna null si no existe.
 */
export async function getProductById(productId: string): Promise<Product | null> {
  const ref = doc(db, 'products', productId).withConverter(productConverter)
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}

// ── Escribir (solo admin) ─────────────────────────────────────────────────────

/**
 * Crea un producto nuevo.
 * nameLower se genera automáticamente desde el converter.
 */
export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'nameLower'>
): Promise<string> {
  const docRef = await addDoc(collection(db, 'products'), {
    ...data,
    nameLower: data.name.toLowerCase(),
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

/**
 * Actualiza campos de un producto existente.
 * Si se actualiza name, también se actualiza nameLower.
 */
export async function updateProduct(
  productId: string,
  data: Partial<Omit<Product, 'id' | 'createdAt' | 'nameLower'>>
): Promise<void> {
  const ref = doc(db, 'products', productId)
  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: serverTimestamp(),
  }
  // Sincronizar nameLower si se cambió el name
  if (data.name) {
    updateData.nameLower = data.name.toLowerCase()
  }
  await updateDoc(ref, updateData)
}

/**
 * Elimina un producto.
 */
export async function deleteProduct(productId: string): Promise<void> {
  const ref = doc(db, 'products', productId)
  await deleteDoc(ref)
}
