import { useEffect, useState } from 'react'
import GuestItem from './GuestItem'

const API_URL = 'https://nuestra-boda-api.byco85.workers.dev/api/guests'

function Guests() {
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [name, setName] = useState('')
  const [guestsCount, setGuestsCount] = useState(1)

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

  async function addGuest(e) {
    e.preventDefault()
    if (!name.trim()) return
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), guests_count: Number(guestsCount) || 1 }),
      })
      if (!res.ok) throw new Error('No se pudo agregar')
      const guest = await res.json()
      setGuests((prev) => [guest, ...prev])
      setName('')
      setGuestsCount(1)
    } catch {
      setError('No se pudo agregar el invitado.')
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
    <div className="guests">
      <h2>Lista de invitados</h2>

      <form className="guests-form" onSubmit={addGuest}>
        <input
          type="text"
          placeholder="Nombre del invitado"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          min="1"
          value={guestsCount}
          onChange={(e) => setGuestsCount(e.target.value)}
          title="Número de personas"
        />
        <button type="submit">Agregar</button>
      </form>

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
    </div>
  )
}

export default Guests
