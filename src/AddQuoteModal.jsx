import { useEffect, useRef, useState } from 'react'
import { CameraIcon, MicIcon, DocumentIcon } from './icons'

function AddQuoteModal({ onSave, onCancel, saving, error }) {
  const [text, setText] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [documentFile, setDocumentFile] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [recording, setRecording] = useState(false)
  const [recordError, setRecordError] = useState(null)

  const fileInputRef = useRef(null)
  const photoInputRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)

  useEffect(() => {
    if (!photoPreview) return
    return () => URL.revokeObjectURL(photoPreview)
  }, [photoPreview])

  useEffect(() => {
    if (!audioUrl) return
    return () => URL.revokeObjectURL(audioUrl)
  }, [audioUrl])

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  function handleFileChange(event) {
    const file = event.target.files?.[0]
    setDocumentFile(file ?? null)
  }

  function removeFile() {
    setDocumentFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

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

  async function startRecording() {
    setRecordError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((track) => track.stop())
      }
      mediaRecorderRef.current = recorder
      recorder.start()
      setRecording(true)
    } catch {
      setRecordError('No se pudo acceder al micrófono.')
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  function removeAudio() {
    setAudioBlob(null)
    setAudioUrl(null)
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!text.trim()) return
    onSave({
      text: text.trim(),
      price: price.trim(),
      currency,
      document: documentFile,
      photo: photoFile,
      audio: audioBlob,
    })
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Nueva cotización</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            className="idea-textarea"
            placeholder="Describe la cotización..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            autoFocus
          />

          <div className="guest-edit-row">
            <input
              type="number"
              step="0.01"
              placeholder="Precio (opcional)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="USD">USD</option>
              <option value="PESOS">Pesos</option>
            </select>
          </div>

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
              className={`media-btn${recording ? ' recording' : ''}`}
              onClick={recording ? stopRecording : startRecording}
              aria-label={recording ? 'Detener grabación' : 'Grabar audio'}
            >
              <MicIcon />
            </button>

            <button
              type="button"
              className="media-btn"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Adjuntar documento"
            >
              <DocumentIcon />
            </button>
            <input ref={fileInputRef} type="file" onChange={handleFileChange} hidden />
          </div>

          {recordError && <p className="guests-error">{recordError}</p>}

          {photoPreview && (
            <div className="media-preview">
              <img src={photoPreview} alt="" />
              <button type="button" className="media-remove" onClick={removePhoto} aria-label="Quitar foto">
                ✕
              </button>
            </div>
          )}

          {audioUrl && (
            <div className="media-preview">
              <audio src={audioUrl} controls />
              <button type="button" className="media-remove" onClick={removeAudio} aria-label="Quitar audio">
                ✕
              </button>
            </div>
          )}

          {documentFile && (
            <div className="media-preview">
              <span className="quote-file-name">{documentFile.name}</span>
              <button type="button" className="media-remove" onClick={removeFile} aria-label="Quitar documento">
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

export default AddQuoteModal
