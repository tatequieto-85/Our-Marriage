import { useEffect, useState } from 'react'
import GuestItem from './GuestItem'
import AddGuestModal from './AddGuestModal'
import { API_BASE, apiFetch } from './api'

const API_URL = `${API_BASE}/api/guests`

function Guests() {
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(null)

  useEffect(() => {
    loadGuests()
  }, [])

  async function loadGuests() {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch(API_URL)
      if (!res.ok) throw new Error('No se pudo cargar la lista')
      setGuests(await res.json())
    } catch {
      setError('No se pudo cargar la lista de invitados.')
    } finally {
      setLoading(false)
    }
  }

  async function addGuest({ name, rsvp }) {
    setAdding(true)
    setAddError(null)
    try {
      const res = await apiFetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rsvp }),
      })
      if (!res.ok) throw new Error('No se pudo agregar')
      const guest = await res.json()
      setGuests((prev) => [...prev, guest])
      setShowAddModal(false)
    } catch {
      setAddError('No se pudo agregar el invitado. Intenta de nuevo.')
    } finally {
      setAdding(false)
    }
  }

  async function saveGuest(id, updates) {
    try {
      const res = await apiFetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('No se pudo actualizar')
      const updated = await res.json()
      setGuests((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
    } catch {
      setError('No se pudo actualizar el invitado.')
    }
  }

  async function removeGuest(id) {
    try {
      const res = await apiFetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('No se pudo eliminar')
      setGuests((prev) => prev.filter((g) => g.id !== id))
    } catch {
      setError('No se pudo eliminar el invitado.')
    }
  }

  const summary = guests.reduce(
    (acc, guest) => {
      acc[guest.rsvp] = (acc[guest.rsvp] || 0) + (guest.guests_count || 1)
      return acc
    },
    { yes: 0, no: 0, pending: 0 }
  )

  function toggleStatusFilter(status) {
    setStatusFilter((prev) => (prev === status ? null : status))
  }

  const normalizedSearch = search.trim().toLowerCase()
  const filteredGuests = guests
    .filter((guest) => !statusFilter || guest.rsvp === statusFilter)
    .filter((guest) => !normalizedSearch || guest.name.toLowerCase().includes(normalizedSearch))

  return (
    <>
      {error && <p className="guests-error">{error}</p>}

      <div className="guests-search-bar">
        <input
          type="text"
          className="guests-search-input"
          placeholder="Buscar invitado..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {!loading && guests.length > 0 && (
        <div className="guests-summary">
          <span
            className={`guests-summary-item rsvp-yes${statusFilter === 'yes' ? ' active' : ''}`}
            onDoubleClick={() => toggleStatusFilter('yes')}
          >
            {summary.yes} asisten
          </span>
          <span
            className={`guests-summary-item rsvp-no${statusFilter === 'no' ? ' active' : ''}`}
            onDoubleClick={() => toggleStatusFilter('no')}
          >
            {summary.no} no asisten
          </span>
          <span
            className={`guests-summary-item rsvp-pending${statusFilter === 'pending' ? ' active' : ''}`}
            onDoubleClick={() => toggleStatusFilter('pending')}
          >
            {summary.pending} pendientes
          </span>
        </div>
      )}

      {loading ? (
        <p>Cargando...</p>
      ) : guests.length === 0 ? (
        <p className="guests-empty">Aún no hay invitados. ¡Agrega el primero!</p>
      ) : filteredGuests.length === 0 ? (
        <p className="guests-empty">No se encontraron invitados.</p>
      ) : (
        <ul className="guests-list">
          {filteredGuests.map((guest) => (
            <GuestItem key={guest.id} guest={guest} onSave={saveGuest} onDelete={removeGuest} />
          ))}
        </ul>
      )}

      <button type="button" className="fab-button" onClick={() => setShowAddModal(true)}>
        + Agregar invitado
      </button>

      {showAddModal && (
        <AddGuestModal
          onSave={addGuest}
          onCancel={() => setShowAddModal(false)}
          saving={adding}
          error={addError}
        />
      )}
    </>
  )
}

export default Guests
