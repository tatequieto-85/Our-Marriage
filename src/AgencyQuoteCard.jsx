import { useEffect, useRef, useState } from 'react'
import { useLongPress } from './hooks/useLongPress'
import QuoteObservationsModal from './QuoteObservationsModal'

function formatPrice(price) {
  if (price === null || price === undefined) return 'Sin precio'
  return new Intl.NumberFormat('es', { style: 'currency', currency: 'USD' }).format(price)
}

// mode: 'view' (normal) | 'actions' (mantener presionado) | 'edit' (botón Editar)
function AgencyQuoteCard({ quote, onSave, onDelete, onAddObservation, addingObservation, observationError }) {
  const [mode, setMode] = useState('view')
  const [price, setPrice] = useState(quote.price ?? '')
  const [showObservations, setShowObservations] = useState(false)
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
    setPrice(quote.price ?? '')
    setMode('edit')
  }

  function handleSave(event) {
    event.preventDefault()
    onSave(quote.id, price === '' ? null : Number(price))
    setMode('view')
  }

  function handleDelete() {
    onDelete(quote.id)
    setMode('view')
  }

  if (mode === 'edit') {
    return (
      <li className="guest-item" ref={itemRef}>
        <form className="guest-edit-form" onSubmit={handleSave}>
          <input
            type="number"
            step="0.01"
            placeholder="Precio"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            autoFocus
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
      <li className="guest-item" ref={itemRef}>
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
    <>
      <li className="guest-item" ref={itemRef} onClick={() => setShowObservations(true)} {...longPressHandlers}>
        <div className="task-info">
          <span className="idea-text agency-quote-price">{formatPrice(quote.price)}</span>
          <span className="task-date">
            {quote.observations.length} {quote.observations.length === 1 ? 'observación' : 'observaciones'}
          </span>
        </div>
      </li>

      {showObservations && (
        <QuoteObservationsModal
          quote={quote}
          onAddObservation={(data) => onAddObservation(quote.id, data)}
          onClose={() => setShowObservations(false)}
          saving={addingObservation}
          error={observationError}
        />
      )}
    </>
  )
}

export default AgencyQuoteCard
