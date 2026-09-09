import { useState } from 'react'

function AddIdeaModal({ onSave, onCancel, saving, error }) {
  const [text, setText] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (!text.trim()) return
    onSave({ text: text.trim() })
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Nueva idea</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            className="idea-textarea"
            placeholder="Escribe tu idea..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            autoFocus
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

export default AddIdeaModal
