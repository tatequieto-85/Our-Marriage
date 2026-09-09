import { useEffect, useState } from 'react'
import GuestItem from './GuestItem'
import AddGuestModal from './AddGuestModal'
import { API_BASE } from './api'

const API_URL = `${API_BASE}/api/guests`

function Guests() {
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState(null)

  useEffect(() => {
    loadGuests()
  }, [])

  async function loadGuests() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(API_URL)
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
      const res = await fetch(API_URL, {
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
      const res = await fetch(`${API_URL}/${id}`, {
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
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('No se pudo eliminar')
      setGuests((prev) => prev.filter((g) => g.id !== id))
    } catch {
      setError('No se pudo eliminar el invitado.')
    }
  }

  return (
    <>
      <p className="guests-hint">Mantén presionado un invitado para editarlo o borrarlo.</p>

      {error && <p className="guests-error">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : guests.length === 0 ? (
        <p className="guests-empty">Aún no hay invitados. ¡Agrega el primero!</p>
      ) : (
        <ul className="guests-list">
          {guests.map((guest) => (
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
