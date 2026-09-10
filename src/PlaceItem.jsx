import { useEffect, useRef, useState } from 'react'
import { useLongPress } from './hooks/useLongPress'
import { HeartIcon } from './icons'

function PlaceItem({ place, onSave, onDelete, onToggleFavorite }) {
  const [mode, setMode] = useState('view')
  const [name, setName] = useState(place.name)
  const [showDetail, setShowDetail] = useState(false)
  const itemRef = useRef(null)

  const longPressHandlers = useLongPress(() => setMode('actions'))

  useEffect(() => {
    if (mode !== 'actions') return
    function handleOutsideClick(event) {
      if (itemRef.current && !itemRef.current.contains(event.target)) {
        setMode('view')
      }
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [mode])

  function openEdit() {
    setName(place.name)
    setMode('edit')
  }

  function handleSave(event) {
    event.preventDefault()
    if (!name.trim()) return
    onSave(place.id, name.trim())
    setMode('view')
  }

  function handleDelete() {
    onDelete(place.id)
    setMode('view')
  }

  function handleToggleFavorite(event) {
    event.stopPropagation()
    onToggleFavorite(place.id)
  }

  if (mode === 'edit') {
    return (
      <li className="guest-item" ref={itemRef}>
        <form className="guest-edit-form" onSubmit={handleSave}>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          <div className="guest-edit-actions">
            <button type="submit" className="guest-action-btn save">
              Guardar
            </button>
            <button type="button" className="guest-action-btn cancel" onClick={() => setMode('view')}>
              Cancelar
            </button>
          </div>
        </form>
      </li>
    )
  }

  if (mode === 'actions') {
    return (
      <li className="guest-item" ref={itemRef}>
        <div className="guest-actions-panel">
          <button type="button" className="guest-action-btn edit" onClick={openEdit}>
            Editar
          </button>
          <button type="button" className="guest-action-btn delete" onClick={handleDelete}>
            Borrar
          </button>
        </div>
      </li>
    )
  }

  return (
    <>
      <li
        className="guest-item place-row"
        ref={itemRef}
        onDoubleClick={() => setShowDetail(true)}
        {...longPressHandlers}
      >
        {place.photo_url ? (
          <img src={place.photo_url} alt="" className="place-row-thumb" />
        ) : place.video_url ? (
          <video src={place.video_url} className="place-row-thumb" muted />
        ) : (
          <div className="place-row-thumb place-thumb-empty" />
        )}
        <span className="idea-text place-row-name">{place.name}</span>
        <button
          type="button"
          className={`place-favorite-btn${place.is_favorite ? ' favorite' : ''}`}
          onClick={handleToggleFavorite}
          aria-label={place.is_favorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
        >
          <HeartIcon filled={place.is_favorite} />
        </button>
      </li>

      {showDetail && (
        <div className="modal-backdrop" onClick={() => setShowDetail(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>{place.name}</h2>
            {place.photo_url && <img src={place.photo_url} alt="" className="idea-detail-photo" />}
            {place.video_url && <video src={place.video_url} controls className="place-video-preview" />}
            <div className="guest-edit-actions">
              <button type="button" className="guest-action-btn cancel" onClick={() => setShowDetail(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PlaceItem
