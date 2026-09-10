import { useEffect, useRef, useState } from 'react'
import { useLongPress } from './hooks/useLongPress'

function GalleryThumb({ photo, onDelete }) {
  const [showDelete, setShowDelete] = useState(false)
  const thumbRef = useRef(null)

  const longPressHandlers = useLongPress(() => setShowDelete(true))

  useEffect(() => {
    if (!showDelete) return
    function handleOutsideClick(event) {
      if (thumbRef.current && !thumbRef.current.contains(event.target)) {
        setShowDelete(false)
      }
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [showDelete])

  return (
    <div className="gallery-thumb" ref={thumbRef} {...longPressHandlers}>
      <img src={photo.photo_url} alt="" />
      {showDelete && (
        <button
          type="button"
          className="gallery-thumb-delete"
          onClick={() => onDelete(photo.id)}
          aria-label="Borrar foto"
        >
          Borrar
        </button>
      )}
    </div>
  )
}

export default GalleryThumb
