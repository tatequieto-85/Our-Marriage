import { useState } from 'react'

function toDatetimeLocal(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function WeddingDateModal({ initialDate, onSave, onCancel, saving, error }) {
  const [value, setValue] = useState(() => toDatetimeLocal(initialDate))

  function handleSubmit(event) {
    event.preventDefault()
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return
    onSave(date)
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Fecha de la boda</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            autoFocus
          />
          {error && <p className="guests-error">{error}</p>}
          <div className="guest-edit-actions">
            <button type="submit" className="guest-action-btn save" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
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

export default WeddingDateModal
