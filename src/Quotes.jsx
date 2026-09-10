import { useEffect, useState } from 'react'
import QuoteItem from './QuoteItem'
import AddQuoteModal from './AddQuoteModal'
import { API_BASE } from './api'

const API_URL = `${API_BASE}/api/quotes`

function Quotes() {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState(null)
  const [scheduling, setScheduling] = useState(false)
  const [addingObservation, setAddingObservation] = useState(false)
  const [observationError, setObservationError] = useState(null)

  useEffect(() => {
    loadQuotes()
  }, [])

  async function loadQuotes() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(API_URL)
      if (!res.ok) throw new Error('No se pudo cargar la lista')
      setQuotes(await res.json())
    } catch {
      setError('No se pudo cargar las cotizaciones.')
    } finally {
      setLoading(false)
    }
  }

  async function addQuote({ text, document }) {
    setAdding(true)
    setAddError(null)
    try {
      const formData = new FormData()
      formData.append('text', text)
      if (document) formData.append('document', document)

      const res = await fetch(API_URL, { method: 'POST', body: formData })
      if (!res.ok) throw new Error('No se pudo agregar')
      const quote = await res.json()
      setQuotes((prev) => [...prev, quote])
      setShowAddModal(false)
    } catch {
      setAddError('No se pudo agregar la cotización. Intenta de nuevo.')
    } finally {
      setAdding(false)
    }
  }

  async function saveQuote(id, text) {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error('No se pudo actualizar')
      const updated = await res.json()
      setQuotes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))
    } catch {
      setError('No se pudo actualizar la cotización.')
    }
  }

  async function removeQuote(id) {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('No se pudo eliminar')
      setQuotes((prev) => prev.filter((q) => q.id !== id))
    } catch {
      setError('No se pudo eliminar la cotización.')
    }
  }

  async function dismissQuote(id) {
    try {
      const res = await fetch(`${API_URL}/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'desestimada' }),
      })
      if (!res.ok) throw new Error('No se pudo actualizar')
      const updated = await res.json()
      setQuotes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))
    } catch {
      setError('No se pudo desestimar la cotización.')
    }
  }

  async function scheduleTask(id, dueDate, onDone) {
    setScheduling(true)
    try {
      const res = await fetch(`${API_URL}/${id}/schedule-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ due_date: dueDate }),
      })
      if (!res.ok) throw new Error('No se pudo programar')
      onDone()
    } catch {
      setError('No se pudo programar la tarea.')
    } finally {
      setScheduling(false)
    }
  }

  async function addObservation(id, text) {
    setAddingObservation(true)
    setObservationError(null)
    try {
      const res = await fetch(`${API_URL}/${id}/observations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error('No se pudo agregar')
      const updated = await res.json()
      setQuotes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))
    } catch {
      setObservationError('No se pudo agregar la observación. Intenta de nuevo.')
    } finally {
      setAddingObservation(false)
    }
  }

  const pending = quotes.filter((q) => q.status !== 'desestimada')
  const dismissed = quotes.filter((q) => q.status === 'desestimada')

  return (
    <>
      {error && <p className="guests-error">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : quotes.length === 0 ? (
        <p className="guests-empty">Aún no hay cotizaciones. ¡Agrega la primera!</p>
      ) : (
        <>
          <ul className="guests-list">
            {pending.map((quote) => (
              <QuoteItem
                key={quote.id}
                quote={quote}
                onSave={saveQuote}
                onDelete={removeQuote}
                onDismiss={dismissQuote}
                onSchedule={scheduleTask}
                onAddObservation={addObservation}
                scheduling={scheduling}
                addingObservation={addingObservation}
                observationError={observationError}
              />
            ))}
          </ul>

          {dismissed.length > 0 && (
            <div className="tasks-done-section">
              <h3 className="tasks-done-title">Desestimadas</h3>
              <ul className="guests-list">
                {dismissed.map((quote) => (
                  <QuoteItem
                    key={quote.id}
                    quote={quote}
                    onSave={saveQuote}
                    onDelete={removeQuote}
                    onDismiss={dismissQuote}
                    onSchedule={scheduleTask}
                    onAddObservation={addObservation}
                    scheduling={scheduling}
                    addingObservation={addingObservation}
                    observationError={observationError}
                  />
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <button type="button" className="fab-button" onClick={() => setShowAddModal(true)}>
        + Agregar cotización
      </button>

      {showAddModal && (
        <AddQuoteModal
          onSave={addQuote}
          onCancel={() => setShowAddModal(false)}
          saving={adding}
          error={addError}
        />
      )}
    </>
  )
}

export default Quotes
