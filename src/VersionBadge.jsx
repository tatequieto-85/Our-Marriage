import { useState } from 'react'
import { useLongPress } from './hooks/useLongPress'

function VersionBadge() {
  const [checking, setChecking] = useState(false)

  function forceUpdate() {
    setChecking(true)
    const url = new URL(window.location.href)
    url.searchParams.set('_v', Date.now().toString())
    window.location.replace(url.toString())
  }

  const longPressHandlers = useLongPress(forceUpdate)

  return (
    <button type="button" className="version-badge" {...longPressHandlers}>
      v{__APP_VERSION__}
      {checking ? ' · buscando actualización…' : ''}
    </button>
  )
}

export default VersionBadge
