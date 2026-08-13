import { useState, useEffect } from 'react'

/**
 * Retrasa la actualización de un valor hasta que el usuario deja de cambiar el input.
 * Evita disparar una query Firestore en cada keystroke (L4).
 *
 * @param value  El valor que puede cambiar rápido (ej: lo que escribe el usuario)
 * @param delay  Tiempo de espera en ms (default: 400ms)
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cancelar el timer si el valor cambia antes de que se cumpla el delay
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
