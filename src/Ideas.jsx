import { useEffect, useState } from 'react'
import IdeaItem from './IdeaItem'
import AddIdeaModal from './AddIdeaModal'
import { API_BASE } from './api'

const API_URL = `${API_BASE}/api/ideas`

function Ideas() {
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState(null)
  const [converting, setConverting] = useState(false)
  const [convertError, setConvertError] = useState(null)

  useEffect(() => {
    loadIdeas()
  }, [])

  async function loadIdeas() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(API_URL)
      if (!res.ok) throw new Error('No se pudo cargar la lista')
      setIdeas(await res.json())
    } catch {
      setError('No se pudo cargar las ideas.')
    } finally {
      setLoading(false)
    }
  }

  async function addIdea({ text, url, photo, audio }) {
    setAdding(true)
    setAddError(null)
    try {
      const formData = new FormData()
      formData.append('text', text)
      if (url) formData.append('url', url)
      if (photo) formData.append('photo', photo)
      if (audio) formData.append('audio', audio, 'audio.webm')

      const res = await fetch(API_URL, { method: 'POST', body: formData })
      if (!res.ok) throw new Error('No se pudo agregar')
      const idea = await res.json()
      setIdeas((prev) => [...prev, idea])
      setShowAddModal(false)
    } catch {
      setAddError('No se pudo agregar la idea. Intenta de nuevo.')
    } finally {
      setAdding(false)
    }
  }

  async function saveIdea(id, updates) {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('No se pudo actualizar')
      const updated = await res.json()
      setIdeas((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
    } catch {
      setError('No se pudo actualizar la idea.')
    }
  }

  async function removeIdea(id) {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('No se pudo eliminar')
      setIdeas((prev) => prev.filter((i) => i.id !== id))
    } catch {
      setError('No se pudo eliminar la idea.')
    }
  }

  async function convertIdea(id, dueDate, text, onDone) {
    setConverting(true)
    setConvertError(null)
    try {
      const res = await fetch(`${API_URL}/${id}/convert-to-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ due_date: dueDate, text }),
      })
      if (!res.ok) throw new Error('No se pudo convertir')
      setIdeas((prev) => prev.filter((i) => i.id !== id))
      onDone()
    } catch {
      setConvertError('No se pudo convertir la idea en tarea. Intenta de nuevo.')
    } finally {
      setConverting(false)
    }
  }

  return (
    <>
      {error && <p className="guests-error">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : ideas.length === 0 ? (
        <p className="guests-empty">Aún no hay ideas. ¡Agrega la primera!</p>
      ) : (
        <ul className="guests-list">
          {ideas.map((idea) => (
            <IdeaItem
              key={idea.id}
              idea={idea}
              onSave={saveIdea}
              onDelete={removeIdea}
              onConvert={convertIdea}
              converting={converting}
              convertError={convertError}
            />
          ))}
        </ul>
      )}

      <button type="button" className="fab-button" onClick={() => setShowAddModal(true)}>
        + Agregar idea
      </button>

      {showAddModal && (
        <AddIdeaModal
          onSave={addIdea}
          onCancel={() => setShowAddModal(false)}
          saving={adding}
          error={addError}
        />
      )}
    </>
  )
}

export default Ideas
