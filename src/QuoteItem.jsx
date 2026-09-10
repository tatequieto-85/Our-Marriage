import { useEffect, useRef, useState } from 'react'
import { useLongPress } from './hooks/useLongPress'
import { useSwipe } from './hooks/useSwipe'
import QuoteObservationsModal from './QuoteObservationsModal'
import ConvertToTaskModal from './ConvertToTaskModal'

// mode: 'view' (normal) | 'actions' (mantener presionado) | 'edit' (botón Editar)
function QuoteItem({ quote, onSave, onDelete, onDismiss, onSchedule, onAddObservation, scheduling, addingObservation, observationError }) {
  const isDismissed = quote.status === 'desestimada'
  const [mode, setMode] = useState('view')
  const [text, setText] = useState(quote.text)
  const [showObservations, setShowObservations] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const itemRef = useRef(null)

  const longPressHandlers = useLongPress(() => setMode('actions'))
  const { handlers: swipeHandlers, dragX, dragging } = useSwipe({
    disabled: isDismissed,
    onSwipeLeft: () => onDismiss(quote.id),
    onSwipeRight: () => setShowSchedule(true),
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
    setText(quote.text)
    setMode('edit')
  }

  function handleSave(event) {
    event.preventDefault()
    if (!text.trim()) return
    onSave(quote.id, text.trim())
    setMode('view')
  }

  function handleDelete() {
    onDelete(quote.id)
    setMode('view')
  }

  function handleSchedule(dueDate) {
    onSchedule(quote.id, dueDate, () => setShowSchedule(false))
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
        {!isDismissed && (
          <div className={`task-swipe-bg${dragX < 0 ? ' delete' : dragX > 0 ? ' complete' : ''}`}>
            <span>{dragX < 0 ? 'Desestimar' : dragX > 0 ? 'Programar tarea' : ''}</span>
          </div>
        )}
        <div
          className={`guest-item task-item${isDismissed ? ' completed' : ''}`}
          ref={itemRef}
          onDoubleClick={() => setShowObservations(true)}
          style={{
            transform: `translateX(${dragX}px)`,
            transition: dragging ? 'none' : 'transform 0.25s ease',
          }}
          {...(isDismissed ? {} : swipeHandlers)}
          {...longPressHandlers}
        >
          <div className="task-info">
            <span className="idea-text">{quote.text}</span>
            {quote.observations.length > 0 && (
              <span className="task-date">
                {quote.observations.length} {quote.observations.length === 1 ? 'observación' : 'observaciones'}
              </span>
            )}
          </div>
        </div>
      </li>

      {showObservations && (
        <QuoteObservationsModal
          quote={quote}
          onAddObservation={(text) => onAddObservation(quote.id, text)}
          onClose={() => setShowObservations(false)}
          saving={addingObservation}
          error={observationError}
        />
      )}

      {showSchedule && (
        <ConvertToTaskModal
          onConfirm={handleSchedule}
          onCancel={() => setShowSchedule(false)}
          saving={scheduling}
          title="Programar tarea"
          message="Se creará una tarea de seguimiento para esta cotización. Elige la fecha."
          confirmLabel="Programar"
          savingLabel="Programando…"
        />
      )}
    </>
  )
}

export default QuoteItem
