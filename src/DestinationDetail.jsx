import { useEffect, useState } from 'react'
import SimpleNameItem from './SimpleNameItem'
import PlaceItem from './PlaceItem'
import AddNameModal from './AddNameModal'
import AddPlaceModal from './AddPlaceModal'
import { API_BASE, apiFetch } from './api'

function DestinationDetail({ destination, onSelectAgency }) {
  const [agencies, setAgencies] = useState([])
  const [places, setPlaces] = useState([])
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showAddAgency, setShowAddAgency] = useState(false)
  const [showAddPlace, setShowAddPlace] = useState(false)
  const [showAddHotel, setShowAddHotel] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const BASE_URL = `${API_BASE}/api/destinations/${destination.id}`

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    setError(null)
    try {
      const [agenciesRes, placesRes, hotelsRes] = await Promise.all([
        apiFetch(`${BASE_URL}/agencies`),
        apiFetch(`${BASE_URL}/places`),
        apiFetch(`${BASE_URL}/hotels`),
      ])
      setAgencies(await agenciesRes.json())
      setPlaces(await placesRes.json())
      setHotels(await hotelsRes.json())
    } catch {
      setError('No se pudo cargar el destino.')
    } finally {
      setLoading(false)
    }
  }

  async function addAgency(name) {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await apiFetch(`${BASE_URL}/agencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('No se pudo agregar')
      const agency = await res.json()
      setAgencies((prev) => [...prev, agency])
      setShowAddAgency(false)
    } catch {
      setSaveError('No se pudo agregar la agencia. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  async function saveAgency(id, name) {
    try {
      const res = await apiFetch(`${API_BASE}/api/agencies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('No se pudo actualizar')
      const updated = await res.json()
      setAgencies((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
    } catch {
      setError('No se pudo actualizar la agencia.')
    }
  }

  async function removeAgency(id) {
    try {
      const res = await apiFetch(`${API_BASE}/api/agencies/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('No se pudo eliminar')
      setAgencies((prev) => prev.filter((a) => a.id !== id))
    } catch {
      setError('No se pudo eliminar la agencia.')
    }
  }

  async function addPlace({ name, photo, video }) {
    setSaving(true)
    setSaveError(null)
    try {
      const formData = new FormData()
      formData.append('name', name)
      if (photo) formData.append('photo', photo)
      if (video) formData.append('video', video)

      const res = await apiFetch(`${BASE_URL}/places`, { method: 'POST', body: formData })
      if (!res.ok) throw new Error('No se pudo agregar')
      const place = await res.json()
      setPlaces((prev) => [...prev, place])
      setShowAddPlace(false)
    } catch {
      setSaveError('No se pudo agregar el lugar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  async function savePlace(id, name) {
    const current = places.find((p) => p.id === id)
    try {
      const res = await apiFetch(`${API_BASE}/api/places/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, is_favorite: current?.is_favorite ?? false }),
      })
      if (!res.ok) throw new Error('No se pudo actualizar')
      const updated = await res.json()
      setPlaces((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    } catch {
      setError('No se pudo actualizar el lugar.')
    }
  }

  async function togglePlaceFavorite(id) {
    const current = places.find((p) => p.id === id)
    if (!current) return
    try {
      const res = await apiFetch(`${API_BASE}/api/places/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: current.name, is_favorite: !current.is_favorite }),
      })
      if (!res.ok) throw new Error('No se pudo actualizar')
      const updated = await res.json()
      setPlaces((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    } catch {
      setError('No se pudo actualizar el favorito.')
    }
  }

  async function removePlace(id) {
    try {
      const res = await apiFetch(`${API_BASE}/api/places/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('No se pudo eliminar')
      setPlaces((prev) => prev.filter((p) => p.id !== id))
    } catch {
      setError('No se pudo eliminar el lugar.')
    }
  }

  async function addHotel(name) {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await apiFetch(`${BASE_URL}/hotels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('No se pudo agregar')
      const hotel = await res.json()
      setHotels((prev) => [...prev, hotel])
      setShowAddHotel(false)
    } catch {
      setSaveError('No se pudo agregar el hotel. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  async function saveHotel(id, name) {
    try {
      const res = await apiFetch(`${API_BASE}/api/hotels/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('No se pudo actualizar')
      const updated = await res.json()
      setHotels((prev) => prev.map((h) => (h.id === updated.id ? updated : h)))
    } catch {
      setError('No se pudo actualizar el hotel.')
    }
  }

  async function removeHotel(id) {
    try {
      const res = await apiFetch(`${API_BASE}/api/hotels/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('No se pudo eliminar')
      setHotels((prev) => prev.filter((h) => h.id !== id))
    } catch {
      setError('No se pudo eliminar el hotel.')
    }
  }

  return (
    <div className="sub-section">
      {destination.photo_url && <img src={destination.photo_url} alt="" className="idea-detail-photo" />}
      {error && <p className="guests-error">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <div className="honeymoon-subgroup">
            <h4 className="honeymoon-subtitle">Agencias de viaje</h4>
            {agencies.length === 0 ? (
              <p className="guests-empty">Sin agencias todavía.</p>
            ) : (
              <ul className="guests-list compact-list">
                {agencies.map((agency) => (
                  <SimpleNameItem
                    key={agency.id}
                    item={agency}
                    onSave={saveAgency}
                    onDelete={removeAgency}
                    onClick={() => onSelectAgency(agency)}
                  />
                ))}
              </ul>
            )}
            <button type="button" className="inline-add-btn" onClick={() => setShowAddAgency(true)}>
              + Agregar agencia
            </button>
          </div>

          <div className="honeymoon-subgroup">
            <h4 className="honeymoon-subtitle">Lugares a visitar</h4>
            {places.length === 0 ? (
              <p className="guests-empty">Sin lugares todavía.</p>
            ) : (
              <ul className="guests-list compact-list">
                {places.map((place) => (
                  <PlaceItem
                    key={place.id}
                    place={place}
                    onSave={savePlace}
                    onDelete={removePlace}
                    onToggleFavorite={togglePlaceFavorite}
                  />
                ))}
              </ul>
            )}
            <button type="button" className="inline-add-btn" onClick={() => setShowAddPlace(true)}>
              + Agregar lugar
            </button>
          </div>

          <div className="honeymoon-subgroup">
            <h4 className="honeymoon-subtitle">Hoteles</h4>
            {hotels.length === 0 ? (
              <p className="guests-empty">Sin hoteles todavía.</p>
            ) : (
              <ul className="guests-list compact-list">
                {hotels.map((hotel) => (
                  <SimpleNameItem key={hotel.id} item={hotel} onSave={saveHotel} onDelete={removeHotel} />
                ))}
              </ul>
            )}
            <button type="button" className="inline-add-btn" onClick={() => setShowAddHotel(true)}>
              + Agregar hotel
            </button>
          </div>
        </>
      )}

      {showAddAgency && (
        <AddNameModal
          title="Nueva agencia de viaje"
          placeholder="Nombre de la agencia"
          onSave={addAgency}
          onCancel={() => setShowAddAgency(false)}
          saving={saving}
          error={saveError}
        />
      )}

      {showAddPlace && (
        <AddPlaceModal
          onSave={addPlace}
          onCancel={() => setShowAddPlace(false)}
          saving={saving}
          error={saveError}
        />
      )}

      {showAddHotel && (
        <AddNameModal
          title="Nuevo hotel"
          placeholder="Nombre del hotel"
          onSave={addHotel}
          onCancel={() => setShowAddHotel(false)}
          saving={saving}
          error={saveError}
        />
      )}
    </div>
  )
}

export default DestinationDetail
