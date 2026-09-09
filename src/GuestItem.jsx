import { useEffect, useRef, useState } from 'react'
import { useLongPress } from './hooks/useLongPress'
import { RSVP_LABELS } from './rsvp'

function toForm(guest) {
  return {
    name: guest.name,
    guests_count: guest.guests_count,
    notes: guest.notes ?? '',
    rsvp: guest.rsvp,
  }
}

// mode: 'view' (normal) | 'actions' (mantener presionado) | 'edit' (doble clic / botón Editar)
function GuestItem({ guest, onSave, onDelete }) {
  const [mode, setMode] = useState('view')
  const [form, setForm] = useState(() => toForm(guest))
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
    setForm(toForm(guest))
    setMode('edit')
  }

  function handleSave(event) {
    event.preventDefault()
    if (!form.name.trim()) return
    onSave(guest.id, {
      name: form.name.trim(),
      guests_count: Number(form.guests_count) || 1,
      notes: form.notes.trim() || null,
      rsvp: form.rsvp,
    })
    setMode('view')
  }

  function handleDelete() {
    onDelete(guest.id)
    setMode('view')
  }

  if (mode === 'edit') {
    return (
      <li className="guest-item" ref={itemRef}>
        <form className="guest-edit-form" onSubmit={handleSave}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            autoFocus
          />
          <div className="guest-edit-row">
            <input
              type="number"
              min="1"
              value={form.guests_count}
              onChange={(e) => setForm((f) => ({ ...f, guests_count: e.target.value }))}
              title="Número de personas"
            />
            <select
              value={form.rsvp}
              onChange={(e) => setForm((f) => ({ ...f, rsvp: e.target.value }))}
            >
              {Object.entries(RSVP_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="Notas (opcional)"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
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
      <li className={`guest-item rsvp-${guest.rsvp}`} ref={itemRef}>
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
    <li
      className={`guest-item rsvp-${guest.rsvp}`}
      ref={itemRef}
      onDoubleClick={openEdit}
      {...longPressHandlers}
    >
      <div className="guest-info">
        <span className="guest-name">{guest.name}</span>
        <span className="guest-count">
          {guest.guests_count} {guest.guests_count === 1 ? 'persona' : 'personas'}
        </span>
      </div>
      <span className="guest-rsvp-badge">{RSVP_LABELS[guest.rsvp]}</span>
    </li>
  )
}

export default GuestItem
