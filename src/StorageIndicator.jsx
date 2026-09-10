import { useEffect, useState } from 'react'
import { API_BASE } from './api'

const USAGE_URL = `${API_BASE}/api/storage-usage`

function formatBytes(bytes) {
  const mb = bytes / (1024 * 1024)
  if (mb < 1024) return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`
  return `${(mb / 1024).toFixed(1)} GB`
}

function StorageIndicator({ refreshKey }) {
  const [usage, setUsage] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch(USAGE_URL)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setUsage(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [refreshKey])

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
