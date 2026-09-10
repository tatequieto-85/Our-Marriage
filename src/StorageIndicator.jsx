function formatBytes(bytes) {
  const mb = bytes / (1024 * 1024)
  if (mb < 1024) return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`
  return `${(mb / 1024).toFixed(1)} GB`
}

function StorageIndicator({ usage }) {
  if (!usage) return null

  const percent = Math.min(100, (usage.used_bytes / usage.limit_bytes) * 100)
  const level = percent >= 90 ? 'danger' : percent >= 70 ? 'warning' : 'ok'

  return (
    <div className="storage-indicator">
      <div className="storage-bar">
        <div className={`storage-bar-fill ${level}`} style={{ width: `${percent}%` }} />
      </div>
      <span className="storage-label">
        {formatBytes(usage.used_bytes)} de {formatBytes(usage.limit_bytes)} usados
      </span>
    </div>
  )
}

export default StorageIndicator
