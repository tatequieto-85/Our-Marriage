import { useEffect, useRef, useState } from 'react'
import { useLongPress } from './hooks/useLongPress'

// mode: 'view' (normal) | 'actions' (mantener presionado) | 'edit' (botón Editar)
function SimpleNameItem({ item, onSave, onDelete, onClick }) {
  const [mode, setMode] = useState('view')
  const [name, setName] = useState(item.name)
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
    setName(item.name)
    setMode('edit')
  }

  function handleSave(event) {
    event.preventDefault()
    if (!name.trim()) return
    onSave(item.id, name.trim())
    setMode('view')
  }

  function handleDelete() {
    onDelete(item.id)
    setMode('view')
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
    <li className="guest-item" ref={itemRef} onDoubleClick={onClick} {...longPressHandlers}>
      <span className="idea-text">{item.name}</span>
    </li>
  )
}

export default SimpleNameItem
