import type { FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore'
import { Timestamp } from 'firebase/firestore'
import type { Order } from '../../types'

/**
 * Converter para Order:
 * Cada orden guarda un snapshot de sus items (nombre + precio al momento de comprar)
 * → así el historial es inmutable aunque el producto cambie de precio o desaparezca
 */
export const orderConverter: FirestoreDataConverter<Order> = {
  toFirestore(order: Order) {
    return {
      userId: order.userId,
      items: order.items, // array de OrderItem (snapshot plano, Firestore lo serializa bien)
      total: order.total,
      status: order.status,
      createdAt:
        order.createdAt instanceof Date
          ? Timestamp.fromDate(order.createdAt)
          : order.createdAt,
    }
  },

  fromFirestore(snapshot: QueryDocumentSnapshot): Order {
    const data = snapshot.data()

    if (!data.userId || !Array.isArray(data.items)) {
      throw new Error(
        `[orderConverter] Documento inválido en orders/${snapshot.id}: falta userId o items`
      )
    }

    return {
      id: snapshot.id,
      userId: data.userId,
      items: data.items,
      total: data.total ?? 0,
      status: data.status ?? 'pending',
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
    }
  },
}
