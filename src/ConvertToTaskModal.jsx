import { useState } from 'react'

function todayISO() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function ConvertToTaskModal({ onConfirm, onCancel, saving, error }) {
  const [dueDate, setDueDate] = useState(todayISO())

  function handleSubmit(event) {
    event.preventDefault()
    if (!dueDate) return
    onConfirm(dueDate)
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Convertir en tarea</h2>
        <form onSubmit={handleSubmit}>
          <p className="idea-detail-text">¿Quieres convertir esta idea en una tarea? Elige la fecha para realizarla.</p>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required autoFocus />
          {error && <p className="guests-error">{error}</p>}
          <div className="guest-edit-actions">
            <button type="submit" className="guest-action-btn save" disabled={saving}>
              {saving ? 'Convirtiendo…' : 'Convertir'}
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

export default ConvertToTaskModal
