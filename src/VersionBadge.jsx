import { useState } from 'react'
import { useLongPress } from './hooks/useLongPress'

const RAW_VERSION = import.meta.env.VITE_APP_VERSION
const VERSION = RAW_VERSION ? RAW_VERSION.slice(0, 7) : 'dev'

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
      v{VERSION}
      {checking ? ' · buscando actualización…' : ''}
    </button>
  )
}

export default VersionBadge
