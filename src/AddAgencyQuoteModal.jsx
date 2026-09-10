import { useState } from 'react'

function AddAgencyQuoteModal({ onSave, onCancel, saving, error }) {
  const [price, setPrice] = useState('')
  const [text, setText] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    onSave({ price: price === '' ? null : Number(price), text: text.trim() })
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Nueva cotización</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            step="0.01"
            placeholder="Precio"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            autoFocus
          />
          <input
            type="text"
            placeholder="Descripción (opcional)"
            value={text}
            onChange={(e) => setText(e.target.value)}
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

export default AddAgencyQuoteModal
