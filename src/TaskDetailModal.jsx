function formatDate(value) {
  if (!value) return ''
  const date = new Date(value.includes('T') || value.includes(' ') ? value : `${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })
}

function TaskDetailModal({ task, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Tarea</h2>
        {task.photo_url && <img src={task.photo_url} alt="" className="idea-detail-photo" />}
        <p className="idea-detail-text">{task.text}</p>
        <p className="task-detail-date">
          {task.completed_at ? 'Realizada el ' : 'Vence el '}
          {formatDate(task.completed_at ?? task.due_date)}
        </p>
        {task.url && (
          <a href={task.url} target="_blank" rel="noopener noreferrer" className="idea-detail-link">
            {task.url}
          </a>
        )}
        {task.audio_url && <audio src={task.audio_url} controls className="idea-detail-audio" />}
        {task.completed_at && task.comment && (
          <p className="idea-detail-text">
            <strong>Comentarios:</strong> {task.comment}
          </p>
        )}
        <div className="guest-edit-actions">
          <button type="button" className="guest-action-btn cancel" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskDetailModal
