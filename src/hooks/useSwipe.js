import { useRef, useState } from 'react'

const SWIPE_THRESHOLD = 90

// Detecta un deslizamiento horizontal (izquierda/derecha) sobre un elemento,
// con retroalimentación visual (dragX) mientras se arrastra.
export function useSwipe({ onSwipeLeft, onSwipeRight, disabled = false }) {
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startXRef = useRef(0)
  const activeRef = useRef(false)

  function onPointerDown(event) {
    if (disabled) return
    activeRef.current = true
    startXRef.current = event.clientX
    setDragging(true)
  }

  function onPointerMove(event) {
    if (!activeRef.current) return
    const delta = event.clientX - startXRef.current
    setDragX(delta)
  }

  function endDrag(finalX) {
    if (!activeRef.current) return
    activeRef.current = false
    setDragging(false)
    if (finalX <= -SWIPE_THRESHOLD) {
      onSwipeLeft?.()
    } else if (finalX >= SWIPE_THRESHOLD) {
      onSwipeRight?.()
    }
    setDragX(0)
  }

  function onPointerUp(event) {
    endDrag(event.clientX - startXRef.current)
  }

  function onPointerLeave(event) {
    if (!activeRef.current) return
    endDrag(event.clientX - startXRef.current)
  }

  return {
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerLeave,
      onPointerCancel: () => {
        activeRef.current = false
        setDragging(false)
        setDragX(0)
      },
    },
    dragX,
    dragging,
  }
}
