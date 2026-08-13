import type { FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore'
import { Timestamp } from 'firebase/firestore'
import type { Product } from '../../types'

/**
 * Converter para Product:
 * - toFirestore: convierte Date → Timestamp, incluye nameLower y updatedAt
 * - fromFirestore: convierte Timestamp → Date, valida campos obligatorios
 */
export const productConverter: FirestoreDataConverter<Product> = {
  toFirestore(product: Product) {
    const data: Record<string, unknown> = {
      name: product.name,
      nameLower: product.name.toLowerCase(), // siempre sincronizado con name
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl ?? '',
      stock: product.stock ?? 0,
      createdAt:
        product.createdAt instanceof Date
          ? Timestamp.fromDate(product.createdAt)
          : product.createdAt,
    }

    if (product.updatedAt !== undefined) {
      data.updatedAt =
        product.updatedAt instanceof Date
          ? Timestamp.fromDate(product.updatedAt)
          : product.updatedAt
    }

    return data
  },

  fromFirestore(snapshot: QueryDocumentSnapshot): Product {
    const data = snapshot.data()

    if (
      typeof data.name !== 'string' ||
      typeof data.price !== 'number' ||
      typeof data.category !== 'string'
    ) {
      throw new Error(
        `[productConverter] Documento inválido en products/${snapshot.id}: falta name, price o category`
      )
    }

    return {
      id: snapshot.id,
      name: data.name,
      nameLower: data.nameLower ?? data.name.toLowerCase(),
      description: data.description ?? '',
      price: data.price,
      category: data.category,
      imageUrl: data.imageUrl ?? '',
      stock: data.stock ?? 0,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
    }
  },
}
