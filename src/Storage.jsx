import { useEffect, useRef, useState } from 'react'
import StorageIndicator from './StorageIndicator'
import GalleryThumb from './GalleryThumb'
import { CameraIcon } from './icons'
import { API_BASE } from './api'

const API_URL = `${API_BASE}/api/gallery`

function Storage() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const photoInputRef = useRef(null)

  useEffect(() => {
    loadPhotos()
  }, [])

  async function loadPhotos() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(API_URL)
      if (!res.ok) throw new Error('No se pudo cargar la galería')
      setPhotos(await res.json())
    } catch {
      setError('No se pudo cargar la galería.')
    } finally {
      setLoading(false)
    }
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0]
    if (photoInputRef.current) photoInputRef.current.value = ''
    if (!file) return

    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('photo', file)
      const res = await fetch(API_URL, { method: 'POST', body: formData })
      if (!res.ok) throw new Error('No se pudo subir la foto')
      const photo = await res.json()
      setPhotos((prev) => [...prev, photo])
    } catch {
      setError('No se pudo subir la foto. Intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  async function removePhoto(id) {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('No se pudo eliminar')
      setPhotos((prev) => prev.filter((p) => p.id !== id))
    } catch {
      setError('No se pudo eliminar la foto.')
    }
  }

  return (
    <div className="storage-section">
      <StorageIndicator />
      <p className="storage-card-note">Tarjeta registrada en Cloudflare: Nu (Royer)</p>

      <div className="gallery-header">
        <h3 className="tasks-done-title">Galería</h3>
        <button
          type="button"
          className="media-btn"
          onClick={() => photoInputRef.current?.click()}
          aria-label="Agregar foto"
          disabled={uploading}
        >
          <CameraIcon />
        </button>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          hidden
        />
      </div>

      {error && <p className="guests-error">{error}</p>}
      {uploading && <p className="guests-empty">Subiendo…</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : photos.length === 0 ? (
        <p className="guests-empty">Aún no hay fotos. ¡Agrega la primera!</p>
      ) : (
        <div className="gallery-grid">
          {photos.map((photo) => (
            <GalleryThumb key={photo.id} photo={photo} onDelete={removePhoto} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Storage
