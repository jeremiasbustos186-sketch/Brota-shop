import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { UserProfile, UserRole } from '../types'

// ── Tipos del contexto ────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null          // usuario de Firebase Auth
  profile: UserProfile | null // perfil extendido con rol (de Firestore)
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
}

// ── Contexto ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Escucha cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        // Busca el perfil del usuario en Firestore
        const userProfile = await fetchUserProfile(firebaseUser.uid)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    // Limpia el listener cuando el componente se desmonta
    return unsubscribe
  }, [])

  // Obtiene el perfil desde Firestore (rol incluido)
  async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
    const ref = doc(db, 'users', uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return snap.data() as UserProfile
  }

  // Crea el perfil en Firestore si no existe (para nuevos usuarios)
  async function createUserProfile(
    uid: string,
    email: string,
    displayName: string,
    role: UserRole = 'customer'
  ): Promise<UserProfile> {
    const newProfile: UserProfile = {
      uid,
      email,
      displayName,
      role,
      createdAt: null, // serverTimestamp lo reemplaza en Firestore
    }

    await setDoc(doc(db, 'users', uid), {
      ...newProfile,
      createdAt: serverTimestamp(),
    })

    return newProfile
  }

  // ── Métodos de autenticación ────────────────────────────────────────────────

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password)
    // onAuthStateChanged se encarga de actualizar el estado
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const { uid, email, displayName } = result.user

    // Si es la primera vez que entra con Google, creamos su perfil
    const existing = await fetchUserProfile(uid)
    if (!existing) {
      const created = await createUserProfile(
        uid,
        email ?? '',
        displayName ?? 'Usuario'
      )
      setProfile(created)
    }
  }

  async function register(email: string, password: string, displayName: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    const created = await createUserProfile(
      result.user.uid,
      email,
      displayName
    )
    setProfile(created)
  }

  async function logout() {
    await signOut(auth)
  }

  // ── Valor del contexto ──────────────────────────────────────────────────────

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
  }

  // Mientras carga el estado inicial, no renderiza los hijos
  // (evita un flash de contenido incorrecto)
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ── Hook personalizado ────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
