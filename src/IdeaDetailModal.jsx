function IdeaDetailModal({ idea, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Idea</h2>
        <p className="idea-detail-text">{idea.text}</p>
        <div className="guest-edit-actions">
          <button type="button" className="guest-action-btn cancel" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default IdeaDetailModal
