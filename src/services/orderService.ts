import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { orderConverter } from './converters/orderConverter'
import type { Order, OrderItem, OrderStatus } from '../types'

const ordersRef = collection(db, 'orders').withConverter(orderConverter)

// ── Leer ──────────────────────────────────────────────────────────────────────

/**
 * Trae el historial de órdenes de un usuario.
 * Requiere índice compuesto en Firestore: userId ASC + createdAt DESC
 */
export async function getOrdersByUser(userId: string, maxResults = 20): Promise<Order[]> {
  const q = query(
    ordersRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(maxResults)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data())
}

/**
 * Trae todas las órdenes (panel admin).
 */
export async function getAllOrders(maxResults = 100): Promise<Order[]> {
  const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(maxResults))
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data())
}

/**
 * Trae órdenes filtradas por status (panel admin).
 * Requiere índice compuesto: status ASC + createdAt DESC
 */
export async function getOrdersByStatus(status: OrderStatus, maxResults = 100): Promise<Order[]> {
  const q = query(
    ordersRef,
    where('status', '==', status),
    orderBy('createdAt', 'desc'),
    limit(maxResults)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data())
}

/**
 * Trae una orden por ID.
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  const ref = doc(db, 'orders', orderId).withConverter(orderConverter)
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}

// ── Escribir ──────────────────────────────────────────────────────────────────

export type CreateOrderInput = {
  userId: string
  items: OrderItem[]
  total: number
}

/**
 * Crea una orden usando un ID pre-generado (idempotencia mínima del L8).
 * Si el checkout falla y el usuario reintenta, el orderId se reutiliza
 * y setDoc simplemente sobreescribe el mismo documento — no hay duplicados.
 */
export async function createOrder(
  input: CreateOrderInput,
  orderId?: string // si se pasa, se reutiliza (idempotencia); si no, se genera uno nuevo
): Promise<Order> {
  if (!input.userId || input.items.length === 0 || input.total <= 0) {
    throw new Error('[createOrder] Input inválido: revisá userId, items y total')
  }

  // Pre-generar ID o reutilizar el que viene (para evitar duplicados en reintentos)
  // Nota: escribimos SIN converter para poder usar serverTimestamp() (FieldValue no es Date)
  const bareRef = orderId
    ? doc(db, 'orders', orderId)
    : doc(collection(db, 'orders'))

  await setDoc(bareRef, {
    userId: input.userId,
    items: input.items,
    total: input.total,
    status: 'pending',
    createdAt: serverTimestamp(), // timestamp real del servidor
  })

  // Re-leer CON converter para obtener el tipo Order tipado
  const typedRef = bareRef.withConverter(orderConverter)
  const saved = await getDoc(typedRef)
  if (!saved.exists()) throw new Error('[createOrder] Error al leer la orden creada')
  return saved.data()
}

/**
 * Actualiza el estado de una orden (solo admin).
 * También registra updatedAt con serverTimestamp.
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  const ref = doc(db, 'orders', orderId)
  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
  })
}
