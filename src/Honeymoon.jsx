import { useEffect, useState } from 'react'
import DestinationItem from './DestinationItem'
import AddDestinationModal from './AddDestinationModal'
import DestinationDetail from './DestinationDetail'
import AgencyQuotesView from './AgencyQuotesView'
import { API_BASE } from './api'

const API_URL = `${API_BASE}/api/destinations`

function Honeymoon({ onHeaderChange }) {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState(null)
  const [selectedDestination, setSelectedDestination] = useState(null)
  const [selectedAgency, setSelectedAgency] = useState(null)

  useEffect(() => {
    loadDestinations()
  }, [])

  useEffect(() => {
    if (selectedAgency) {
      onHeaderChange({ title: selectedAgency.name, onBack: () => setSelectedAgency(null) })
    } else if (selectedDestination) {
      onHeaderChange({ title: selectedDestination.name, onBack: () => setSelectedDestination(null) })
    } else {
      onHeaderChange(null)
    }
  }, [selectedDestination, selectedAgency, onHeaderChange])

  async function loadDestinations() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(API_URL)
      if (!res.ok) throw new Error('No se pudo cargar la lista')
      setDestinations(await res.json())
    } catch {
      setError('No se pudo cargar los destinos.')
    } finally {
      setLoading(false)
    }
  }

  async function addDestination({ name, photo }) {
    setAdding(true)
    setAddError(null)
    try {
      const formData = new FormData()
      formData.append('name', name)
      if (photo) formData.append('photo', photo)

      const res = await fetch(API_URL, { method: 'POST', body: formData })
      if (!res.ok) throw new Error('No se pudo agregar')
      const destination = await res.json()
      setDestinations((prev) => [...prev, destination])
      setShowAddModal(false)
    } catch {
      setAddError('No se pudo agregar el destino. Intenta de nuevo.')
    } finally {
      setAdding(false)
    }
  }

  async function saveDestination(id, name) {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('No se pudo actualizar')
      const updated = await res.json()
      setDestinations((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
    } catch {
      setError('No se pudo actualizar el destino.')
    }
  }

  async function removeDestination(id) {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('No se pudo eliminar')
      setDestinations((prev) => prev.filter((d) => d.id !== id))
    } catch {
      setError('No se pudo eliminar el destino.')
    }
  }

  if (selectedAgency) {
    return <AgencyQuotesView agency={selectedAgency} />
  }

  if (selectedDestination) {
    return (
      <DestinationDetail
        destination={selectedDestination}
        onSelectAgency={setSelectedAgency}
      />
    )
  }

  return (
    <>
      {error && <p className="guests-error">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : destinations.length === 0 ? (
        <p className="guests-empty">Aún no hay destinos. ¡Agrega el primero!</p>
      ) : (
        <ul className="guests-list">
          {destinations.map((destination) => (
            <DestinationItem
              key={destination.id}
              destination={destination}
              onSave={saveDestination}
              onDelete={removeDestination}
              onClick={() => setSelectedDestination(destination)}
            />
          ))}
        </ul>
      )}

      <button type="button" className="fab-button" onClick={() => setShowAddModal(true)}>
        + Agregar destino
      </button>

      {showAddModal && (
        <AddDestinationModal
          onSave={addDestination}
          onCancel={() => setShowAddModal(false)}
          saving={adding}
          error={addError}
        />
      )}
    </>
  )
}

export default Honeymoon
