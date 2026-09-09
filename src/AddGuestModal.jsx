import { useState } from 'react'

function AddGuestModal({ onSave, onCancel, saving, error }) {
  const [name, setName] = useState('')
  const [guestsCount, setGuestsCount] = useState(1)

  function handleSubmit(event) {
    event.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), guests_count: Number(guestsCount) || 1 })
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Nuevo invitado</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre del invitado"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <input
            type="number"
            min="1"
            value={guestsCount}
            onChange={(e) => setGuestsCount(e.target.value)}
            title="Número de personas"
          />
          {error && <p className="guests-error">{error}</p>}
          <div className="guest-edit-actions">
            <button type="submit" className="guest-action-btn save" disabled={saving}>
              {saving ? 'Guardando…' : 'Agregar'}
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

export default AddGuestModal
