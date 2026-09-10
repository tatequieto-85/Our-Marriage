import { useRef, useState } from 'react'
import { DocumentIcon } from './icons'

function AddQuoteModal({ onSave, onCancel, saving, error }) {
  const [text, setText] = useState('')
  const [documentFile, setDocumentFile] = useState(null)
  const fileInputRef = useRef(null)

  function handleFileChange(event) {
    const file = event.target.files?.[0]
    setDocumentFile(file ?? null)
  }

  function removeFile() {
    setDocumentFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!text.trim()) return
    onSave({ text: text.trim(), document: documentFile })
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

          <div className="media-row">
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
