/**
 * Convierte códigos de error de Firebase Auth en mensajes legibles para el usuario.
 * Los códigos vienen en el campo `code` del FirebaseError.
 */
export function getAuthErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'Email o contraseña incorrectos.',
    'auth/user-not-found': 'No existe una cuenta con ese email.',
    'auth/wrong-password': 'Contraseña incorrecta.',
    'auth/email-already-in-use': 'Ya existe una cuenta con ese email.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/invalid-email': 'El email no tiene un formato válido.',
    'auth/too-many-requests': 'Demasiados intentos fallidos. Intentá de nuevo más tarde.',
    'auth/network-request-failed': 'Error de conexión. Verificá tu internet.',
    'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de completar el login.',
    'auth/cancelled-popup-request': 'Solo puede abrirse un popup a la vez.',
    'auth/operation-not-allowed': 'Este método de login no está habilitado.',
    'auth/user-disabled': 'Esta cuenta fue deshabilitada.',
  }

  return messages[code] ?? 'Ocurrió un error inesperado. Intentá de nuevo.'
}
