import { useEffect, useRef, useState } from 'react'
import { CameraIcon } from './icons'

function AddDestinationModal({ onSave, onCancel, saving, error }) {
  const [name, setName] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const photoInputRef = useRef(null)

  useEffect(() => {
    if (!photoPreview) return
    return () => URL.revokeObjectURL(photoPreview)
  }, [photoPreview])

  function handlePhotoChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function removePhoto() {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (photoInputRef.current) photoInputRef.current.value = ''
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), photo: photoFile })
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Nuevo destino</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre del destino"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <div className="media-row">
            <button
              type="button"
              className="media-btn"
              onClick={() => photoInputRef.current?.click()}
              aria-label="Tomar foto"
            >
              <CameraIcon />
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              hidden
            />
          </div>

          {photoPreview && (
            <div className="media-preview">
              <img src={photoPreview} alt="" />
              <button type="button" className="media-remove" onClick={removePhoto} aria-label="Quitar foto">
                ✕
              </button>
            </div>
          )}

          {error && <p className="guests-error">{error}</p>}
          <div className="guest-edit-actions">
            <button type="submit" className="guest-action-btn save" disabled={saving}>
              {saving ? 'Guardando…' : 'Agregar'}
            </button>
            <button type="button" className="guest-action-btn cancel" onClick={onCancel} disabled={saving}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddDestinationModal
