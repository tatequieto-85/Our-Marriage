import { useEffect, useRef, useState } from 'react'
import { CameraIcon, VideoIcon } from './icons'

function AddPlaceModal({ onSave, onCancel, saving, error }) {
  const [name, setName] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [videoFile, setVideoFile] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const photoInputRef = useRef(null)
  const videoInputRef = useRef(null)

  useEffect(() => {
    if (!photoPreview) return
    return () => URL.revokeObjectURL(photoPreview)
  }, [photoPreview])

  useEffect(() => {
    if (!videoPreview) return
    return () => URL.revokeObjectURL(videoPreview)
  }, [videoPreview])

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

  function handleVideoChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setVideoFile(file)
    setVideoPreview(URL.createObjectURL(file))
  }

  function removeVideo() {
    setVideoFile(null)
    setVideoPreview(null)
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), photo: photoFile, video: videoFile })
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Nuevo lugar a visitar</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre del lugar"
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

            <button
              type="button"
              className="media-btn"
              onClick={() => videoInputRef.current?.click()}
              aria-label="Agregar video"
            >
              <VideoIcon />
            </button>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              capture="environment"
              onChange={handleVideoChange}
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

          {videoPreview && (
            <div className="media-preview">
              <video src={videoPreview} controls className="place-video-preview" />
              <button type="button" className="media-remove" onClick={removeVideo} aria-label="Quitar video">
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

export default AddPlaceModal
