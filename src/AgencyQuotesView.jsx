import { useEffect, useState } from 'react'
import AgencyQuoteCard from './AgencyQuoteCard'
import AddAgencyQuoteModal from './AddAgencyQuoteModal'
import { API_BASE } from './api'

function AgencyQuotesView({ agency }) {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState(null)
  const [addingObservation, setAddingObservation] = useState(false)
  const [observationError, setObservationError] = useState(null)

  const QUOTES_URL = `${API_BASE}/api/agencies/${agency.id}/quotes`
  const ALL_QUOTES_URL = `${API_BASE}/api/quotes`

  useEffect(() => {
    loadQuotes()
  }, [])

  async function loadQuotes() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(QUOTES_URL)
      if (!res.ok) throw new Error('No se pudo cargar')
      setQuotes(await res.json())
    } catch {
      setError('No se pudo cargar las cotizaciones.')
    } finally {
      setLoading(false)
    }
  }

  async function addQuote({ price, currency, text }) {
    setAdding(true)
    setAddError(null)
    try {
      const res = await fetch(QUOTES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price, currency, text }),
      })
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

  async function saveQuotePrice(id, price, currency) {
    try {
      const quote = quotes.find((q) => q.id === id)
      const res = await fetch(`${ALL_QUOTES_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: quote.text, price, currency }),
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
      const res = await fetch(`${ALL_QUOTES_URL}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('No se pudo eliminar')
      setQuotes((prev) => prev.filter((q) => q.id !== id))
    } catch {
      setError('No se pudo eliminar la cotización.')
    }
  }

  async function addObservation(id, { text, photo, audio, document }) {
    setAddingObservation(true)
    setObservationError(null)
    try {
      const formData = new FormData()
      formData.append('text', text)
      if (photo) formData.append('photo', photo)
      if (audio) formData.append('audio', audio, 'audio.webm')
      if (document) formData.append('document', document)

      const res = await fetch(`${ALL_QUOTES_URL}/${id}/observations`, { method: 'POST', body: formData })
      if (!res.ok) throw new Error('No se pudo agregar')
      const updated = await res.json()
      setQuotes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))
    } catch {
      setObservationError('No se pudo agregar la observación. Intenta de nuevo.')
    } finally {
      setAddingObservation(false)
    }
  }

  return (
    <div className="sub-section">
      {error && <p className="guests-error">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : quotes.length === 0 ? (
        <p className="guests-empty">Aún no hay cotizaciones. ¡Agrega la primera!</p>
      ) : (
        <ul className="guests-list">
          {quotes.map((quote) => (
            <AgencyQuoteCard
              key={quote.id}
              quote={quote}
              onSave={saveQuotePrice}
              onDelete={removeQuote}
              onAddObservation={addObservation}
              addingObservation={addingObservation}
              observationError={observationError}
            />
          ))}
        </ul>
      )}

      <button type="button" className="inline-add-btn" onClick={() => setShowAddModal(true)}>
        + Hacer cotización
      </button>

      {showAddModal && (
        <AddAgencyQuoteModal
          onSave={addQuote}
          onCancel={() => setShowAddModal(false)}
          saving={adding}
          error={addError}
        />
      )}
    </div>
  )
}

export default AgencyQuotesView
