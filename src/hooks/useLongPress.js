import { useCallback, useRef } from 'react'

const DEFAULT_DELAY_MS = 500

// Devuelve handlers de mouse/touch para detectar "mantener presionado"
// sobre un elemento, funcionando tanto en desktop como en móvil.
export function useLongPress(onLongPress, delay = DEFAULT_DELAY_MS) {
  const timerRef = useRef(null)

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const start = useCallback(
    (...args) => {
      clear()
      timerRef.current = setTimeout(() => onLongPress(...args), delay)
    },
    [onLongPress, delay, clear]
  )

  return {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: clear,
    onTouchMove: clear,
    onContextMenu: (event) => event.preventDefault(),
  }
}
