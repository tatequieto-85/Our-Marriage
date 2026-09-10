import { useEffect, useRef, useState } from 'react'
import { useLongPress } from './hooks/useLongPress'
import { useSwipe } from './hooks/useSwipe'
import IdeaDetailModal from './IdeaDetailModal'
import ConvertToTaskModal from './ConvertToTaskModal'

// mode: 'view' (normal) | 'actions' (mantener presionado) | 'edit' (botón Editar)
function IdeaItem({ idea, onSave, onDelete, onConvert, converting, convertError }) {
  const [mode, setMode] = useState('view')
  const [text, setText] = useState(idea.text)
  const [url, setUrl] = useState(idea.url ?? '')
  const [showDetail, setShowDetail] = useState(false)
  const [showConvert, setShowConvert] = useState(false)
  const itemRef = useRef(null)

  const longPressHandlers = useLongPress(() => setMode('actions'))
  const { handlers: swipeHandlers, dragX, dragging } = useSwipe({
    onSwipeRight: () => setShowConvert(true),
  })

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
    setText(idea.text)
    setUrl(idea.url ?? '')
    setMode('edit')
  }

  function handleSave(event) {
    event.preventDefault()
    if (!text.trim()) return
    onSave(idea.id, { text: text.trim(), url: url.trim() })
    setMode('view')
  }

  function handleDelete() {
    onDelete(idea.id)
    setMode('view')
  }

  function handleConfirmConvert(dueDate, text) {
    onConvert(idea.id, dueDate, text, () => setShowConvert(false))
  }

  if (mode === 'edit') {
    return (
      <li className="guest-item" ref={itemRef}>
        <form className="guest-edit-form" onSubmit={handleSave}>
          <textarea
            className="idea-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            autoFocus
          />
          <input
            type="url"
            placeholder="URL (opcional)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
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
      <li className="task-item-wrapper">
        {dragX > 0 && (
          <div className="task-swipe-bg complete">
            <span>Convertir en tarea</span>
          </div>
        )}
        <div
          className="guest-item task-item"
          ref={itemRef}
          onDoubleClick={() => setShowDetail(true)}
          style={{
            transform: `translateX(${dragX}px)`,
            transition: dragging ? 'none' : 'transform 0.25s ease',
          }}
          {...swipeHandlers}
          {...longPressHandlers}
        >
          <span className="idea-text">{idea.text}</span>
        </div>
      </li>

      {showDetail && <IdeaDetailModal idea={idea} onClose={() => setShowDetail(false)} />}

      {showConvert && (
        <ConvertToTaskModal
          onConfirm={handleConfirmConvert}
          onCancel={() => setShowConvert(false)}
          saving={converting}
          error={convertError}
        />
      )}
    </>
  )
}

export default IdeaItem
