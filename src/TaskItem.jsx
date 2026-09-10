import { useEffect, useRef, useState } from 'react'
import { useLongPress } from './hooks/useLongPress'
import { useSwipe } from './hooks/useSwipe'
import ConfirmModal from './ConfirmModal'
import TaskCompleteModal from './TaskCompleteModal'
import TaskDetailModal from './TaskDetailModal'

function formatShortDate(value) {
  if (!value) return ''
  const date = new Date(value.includes('T') || value.includes(' ') ? value : `${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

// mode: 'view' (normal) | 'actions' (mantener presionado) | 'edit' (botón Editar)
function TaskItem({ task, onSave, onDelete, onComplete, completing }) {
  const isCompleted = Boolean(task.completed_at)
  const [mode, setMode] = useState('view')
  const [text, setText] = useState(task.text)
  const [dueDate, setDueDate] = useState(task.due_date)
  const [url, setUrl] = useState(task.url ?? '')
  const [showDetail, setShowDetail] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const itemRef = useRef(null)

  const longPressHandlers = useLongPress(() => setMode('actions'))
  const { handlers: swipeHandlers, dragX, dragging } = useSwipe({
    disabled: isCompleted,
    onSwipeLeft: () => setPendingAction('delete'),
    onSwipeRight: () => setPendingAction('complete'),
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
    setText(task.text)
    setDueDate(task.due_date)
    setUrl(task.url ?? '')
    setMode('edit')
  }

  function handleSave(event) {
    event.preventDefault()
    if (!text.trim() || !dueDate) return
    onSave(task.id, { text: text.trim(), due_date: dueDate, url: url.trim() })
    setMode('view')
  }

  function handleConfirmDelete() {
    onDelete(task.id)
    setPendingAction(null)
  }

  function handleConfirmComplete(comment) {
    onComplete(task.id, comment)
    setPendingAction(null)
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
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          <input type="url" placeholder="URL (opcional)" value={url} onChange={(e) => setUrl(e.target.value)} />
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
        </div>
      </li>
    )
  }

  return (
    <>
      <li className="task-item-wrapper">
        {!isCompleted && (
          <div className={`task-swipe-bg${dragX < 0 ? ' delete' : dragX > 0 ? ' complete' : ''}`}>
            <span>{dragX < 0 ? 'Borrar' : dragX > 0 ? 'Realizada' : ''}</span>
          </div>
        )}
        <div
          className={`guest-item task-item${isCompleted ? ' completed' : ''}`}
          ref={itemRef}
          onDoubleClick={() => setShowDetail(true)}
          style={{
            transform: `translateX(${dragX}px)`,
            transition: dragging ? 'none' : 'transform 0.25s ease',
          }}
          {...(isCompleted ? {} : swipeHandlers)}
          {...(isCompleted ? {} : longPressHandlers)}
        >
          <div className="task-info">
            <span className="idea-text">{task.text}</span>
            <span className="task-date">
              {isCompleted ? `Realizada ${formatShortDate(task.completed_at)}` : formatShortDate(task.due_date)}
            </span>
          </div>
        </div>
      </li>

      {showDetail && <TaskDetailModal task={task} onClose={() => setShowDetail(false)} />}

      {pendingAction === 'delete' && (
        <ConfirmModal
          title="Eliminar tarea"
          message="¿Seguro que quieres eliminar esta tarea?"
          confirmLabel="Eliminar"
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingAction(null)}
        />
      )}

      {pendingAction === 'complete' && (
        <TaskCompleteModal
          onConfirm={handleConfirmComplete}
          onCancel={() => setPendingAction(null)}
          saving={completing}
        />
      )}
    </>
  )
}

export default TaskItem
