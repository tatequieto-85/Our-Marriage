import { useEffect, useState } from 'react'
import TaskItem from './TaskItem'
import AddTaskModal from './AddTaskModal'
import { API_BASE } from './api'

const API_URL = `${API_BASE}/api/tasks`

function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState(null)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    loadTasks()
  }, [])

  async function loadTasks() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(API_URL)
      if (!res.ok) throw new Error('No se pudo cargar la lista')
      setTasks(await res.json())
    } catch {
      setError('No se pudo cargar las tareas.')
    } finally {
      setLoading(false)
    }
  }

  async function addTask({ text, due_date, url, photo, audio }) {
    setAdding(true)
    setAddError(null)
    try {
      const formData = new FormData()
      formData.append('text', text)
      formData.append('due_date', due_date)
      if (url) formData.append('url', url)
      if (photo) formData.append('photo', photo)
      if (audio) formData.append('audio', audio, 'audio.webm')

      const res = await fetch(API_URL, { method: 'POST', body: formData })
      if (!res.ok) throw new Error('No se pudo agregar')
      const task = await res.json()
      setTasks((prev) => [...prev, task])
      setShowAddModal(false)
    } catch {
      setAddError('No se pudo agregar la tarea. Intenta de nuevo.')
    } finally {
      setAdding(false)
    }
  }

  async function saveTask(id, updates) {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('No se pudo actualizar')
      const updated = await res.json()
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    } catch {
      setError('No se pudo actualizar la tarea.')
    }
  }

  async function removeTask(id) {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('No se pudo eliminar')
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch {
      setError('No se pudo eliminar la tarea.')
    }
  }

  async function completeTask(id, comment) {
    setCompleting(true)
    try {
      const res = await fetch(`${API_URL}/${id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment }),
      })
      if (!res.ok) throw new Error('No se pudo completar')
      const updated = await res.json()
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    } catch {
      setError('No se pudo marcar la tarea como realizada.')
    } finally {
      setCompleting(false)
    }
  }

  const pending = tasks
    .filter((t) => !t.completed_at)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
  const done = tasks
    .filter((t) => t.completed_at)
    .sort((a, b) => a.completed_at.localeCompare(b.completed_at))

  return (
    <>
      {error && <p className="guests-error">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : tasks.length === 0 ? (
        <p className="guests-empty">Aún no hay tareas. ¡Agrega la primera!</p>
      ) : (
        <>
          <ul className="guests-list">
            {pending.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onSave={saveTask}
                onDelete={removeTask}
                onComplete={completeTask}
                completing={completing}
              />
            ))}
          </ul>

          {done.length > 0 && (
            <div className="tasks-done-section">
              <h3 className="tasks-done-title">Realizadas</h3>
              <ul className="guests-list">
                {done.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onSave={saveTask}
                    onDelete={removeTask}
                    onComplete={completeTask}
                    completing={completing}
                  />
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <button type="button" className="fab-button" onClick={() => setShowAddModal(true)}>
        + Agregar tarea
      </button>

      {showAddModal && (
        <AddTaskModal
          onSave={addTask}
          onCancel={() => setShowAddModal(false)}
          saving={adding}
          error={addError}
        />
      )}
    </>
  )
}

export default Tasks
