import { useEffect, useRef, useState } from 'react'
import { CameraIcon, MicIcon, DocumentIcon } from './icons'

function formatDate(value) {
  const date = new Date(value.includes('T') ? value : `${value.replace(' ', 'T')}Z`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function QuoteObservationsModal({ quote, onAddObservation, onClose, saving, error }) {
  const [text, setText] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [documentFile, setDocumentFile] = useState(null)
  const [recording, setRecording] = useState(false)
  const [recordError, setRecordError] = useState(null)

  const photoInputRef = useRef(null)
  const documentInputRef = useRef(null)
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

  function handleDocumentChange(event) {
    const file = event.target.files?.[0]
    setDocumentFile(file ?? null)
  }

  function removeDocument() {
    setDocumentFile(null)
    if (documentInputRef.current) documentInputRef.current.value = ''
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
    onAddObservation({ text: text.trim(), photo: photoFile, audio: audioBlob, document: documentFile })
    setText('')
    removePhoto()
    removeAudio()
    removeDocument()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Observaciones</h2>
        <p className="idea-detail-text">{quote.text}</p>

        {quote.photo_url && <img src={quote.photo_url} alt="" className="idea-detail-photo" />}
        {quote.audio_url && <audio src={quote.audio_url} controls className="idea-detail-audio" />}

        {quote.document_url && (
          <a href={quote.document_url} target="_blank" rel="noopener noreferrer" className="idea-detail-link">
            {quote.document_name || 'Ver documento'}
          </a>
        )}

        {quote.observations.length > 0 && (
          <ul className="quote-observations-list">
            {quote.observations.map((obs) => (
              <li key={obs.id}>
                <span className="quote-observation-date">{formatDate(obs.created_at)}</span>
                <span>{obs.text}</span>
                {obs.photo_url && <img src={obs.photo_url} alt="" className="quote-observation-photo" />}
                {obs.audio_url && <audio src={obs.audio_url} controls className="quote-observation-audio" />}
                {obs.document_url && (
                  <a href={obs.document_url} target="_blank" rel="noopener noreferrer" className="idea-detail-link">
                    {obs.document_name || 'Ver documento'}
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleSubmit}>
          <textarea
            className="idea-textarea"
            placeholder="Agregar una observación..."
            value={text}
            onChange={(e) => setText(e.target.value)}
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
              className={`media-btn${recording ? ' recording' : ''}`}
              onClick={recording ? stopRecording : startRecording}
              aria-label={recording ? 'Detener grabación' : 'Grabar audio'}
            >
              <MicIcon />
            </button>

            <button
              type="button"
              className="media-btn"
              onClick={() => documentInputRef.current?.click()}
              aria-label="Adjuntar documento"
            >
              <DocumentIcon />
            </button>
            <input ref={documentInputRef} type="file" onChange={handleDocumentChange} hidden />
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
              <button type="button" className="media-remove" onClick={removeDocument} aria-label="Quitar documento">
                ✕
              </button>
            </div>
          )}

          {error && <p className="guests-error">{error}</p>}
          <div className="guest-edit-actions">
            <button type="submit" className="guest-action-btn save" disabled={saving || !text.trim()}>
              {saving ? 'Guardando…' : 'Agregar observación'}
            </button>
            <button type="button" className="guest-action-btn cancel" onClick={onClose} disabled={saving}>
              Cerrar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuoteObservationsModal
