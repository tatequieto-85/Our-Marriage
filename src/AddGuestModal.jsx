import { useState } from 'react'
import { RSVP_LABELS } from './rsvp'

function AddGuestModal({ onSave, onCancel, saving, error }) {
  const [name, setName] = useState('')
  const [rsvp, setRsvp] = useState('pending')

  function handleSubmit(event) {
    event.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), rsvp })
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
          <select value={rsvp} onChange={(e) => setRsvp(e.target.value)}>
            {Object.entries(RSVP_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
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
