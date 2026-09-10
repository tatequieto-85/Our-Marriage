import { useState } from 'react'

function TaskCompleteModal({ onConfirm, onCancel, saving }) {
  const [comment, setComment] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    onConfirm(comment.trim())
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Marcar como realizada</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            className="idea-textarea"
            placeholder="Comentarios (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            autoFocus
          />
          <div className="guest-edit-actions">
            <button type="submit" className="guest-action-btn save" disabled={saving}>
              {saving ? 'Guardando…' : 'Confirmar'}
            </button>
            <button type="button" className="guest-action-btn cancel" onClick={onCancel} disabled={saving}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskCompleteModal
