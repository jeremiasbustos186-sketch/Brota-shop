import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { UserProfile, UserRole } from '../types'

// ── Leer ──────────────────────────────────────────────────────────────────────

/**
 * Trae el perfil de un usuario de Firestore.
 * Retorna null si el documento no existe todavía.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return snap.data() as UserProfile
}

// ── Escribir ──────────────────────────────────────────────────────────────────

/**
 * Crea el perfil de un usuario nuevo en Firestore.
 * Se llama la primera vez que alguien se registra o entra con Google.
 */
export async function createUserProfile(
  uid: string,
  email: string,
  displayName: string,
  role: UserRole = 'customer'
): Promise<UserProfile> {
  const profile: UserProfile = {
    uid,
    email,
    displayName,
    role,
    createdAt: null, // serverTimestamp lo reemplaza en Firestore
  }

  await setDoc(doc(db, 'users', uid), {
    ...profile,
    createdAt: serverTimestamp(),
  })

  return profile
}

/**
 * Actualiza el rol de un usuario (solo admin).
 */
export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  const ref = doc(db, 'users', uid)
  await updateDoc(ref, { role })
}
