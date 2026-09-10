function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p className="idea-detail-text">{message}</p>
        <div className="guest-edit-actions">
          <button type="button" className="guest-action-btn delete" onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button type="button" className="guest-action-btn cancel" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
