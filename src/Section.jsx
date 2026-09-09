function Section({ title, onBack, children }) {
  return (
    <div className="section">
      <div className="section-header">
        <button type="button" className="back-button" onClick={onBack} aria-label="Volver">
          ←
        </button>
        <h2>{title}</h2>
        <span className="back-button-spacer" aria-hidden="true" />
      </div>
      {children}
    </div>
  )
}

export default Section
