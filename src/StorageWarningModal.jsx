function StorageWarningModal({ onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Espacio casi lleno</h2>
        <p className="idea-detail-text">
          Ya casi se llegan los 10 GB gratis de almacenamiento. Después de esa cantidad, Cloudflare
          empezará a cobrar el excedente a la tarjeta Nu de Royer, registrada en la cuenta de
          Cloudflare de tatequieto (byco85@gmail.com).
        </p>
        <div className="guest-edit-actions">
          <button type="button" className="guest-action-btn cancel" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}

export default StorageWarningModal
