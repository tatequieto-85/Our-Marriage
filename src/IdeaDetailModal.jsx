function IdeaDetailModal({ idea, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Idea</h2>
        {idea.photo_url && (
          <img src={idea.photo_url} alt="" className="idea-detail-photo" />
        )}
        <p className="idea-detail-text">{idea.text}</p>
        {idea.audio_url && <audio src={idea.audio_url} controls className="idea-detail-audio" />}
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
