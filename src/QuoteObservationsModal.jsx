import { useState } from 'react'

function formatDate(value) {
  const date = new Date(value.includes('T') ? value : `${value.replace(' ', 'T')}Z`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function QuoteObservationsModal({ quote, onAddObservation, onClose, saving, error }) {
  const [text, setText] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (!text.trim()) return
    onAddObservation(text.trim())
    setText('')
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Observaciones</h2>
        <p className="idea-detail-text">{quote.text}</p>

        {quote.document_url && (
          <a href={quote.document_url} target="_blank" rel="noopener noreferrer" className="idea-detail-link">
            {quote.document_name || 'Ver documento'}
          </a>
        )}

        {quote.observations.length > 0 && (
          <ul className="quote-observations-list">
            {quote.observations.map((obs) => (
              <li key={obs.id}>
                <span className="quote-observation-date">{formatDate(obs.created_at)}</span>
                <span>{obs.text}</span>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleSubmit}>
          <textarea
            className="idea-textarea"
            placeholder="Agregar una observación..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
          />
          {error && <p className="guests-error">{error}</p>}
          <div className="guest-edit-actions">
            <button type="submit" className="guest-action-btn save" disabled={saving || !text.trim()}>
              {saving ? 'Guardando…' : 'Agregar observación'}
            </button>
            <button type="button" className="guest-action-btn cancel" onClick={onClose} disabled={saving}>
              Cerrar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuoteObservationsModal
