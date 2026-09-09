import { useEffect, useState } from 'react'
import { useLongPress } from './hooks/useLongPress'
import WeddingDateModal from './WeddingDateModal'
import { API_BASE } from './api'

const SETTINGS_URL = `${API_BASE}/api/settings/wedding-date`

// Se usa mientras carga o si aún no se ha configurado ninguna fecha en el servidor.
const DEFAULT_DATE = new Date('2026-12-12T17:00:00')

function getTimeLeft(target) {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)
  return { days, hours, minutes, seconds, done: false }
}

function Countdown({ compact = false }) {
  const [weddingDate, setWeddingDate] = useState(DEFAULT_DATE)
  const [, forceTick] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function loadDate() {
      try {
        const res = await fetch(SETTINGS_URL)
        if (res.ok) {
          const { value } = await res.json()
          const date = new Date(value)
          if (!cancelled && !Number.isNaN(date.getTime())) {
            setWeddingDate(date)
          }
        }
      } catch {
        // Se mantiene la fecha por defecto si no se pudo cargar.
      }
    }
    loadDate()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => forceTick((t) => t + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const timeLeft = getTimeLeft(weddingDate)

  const longPressHandlers = useLongPress(() => {
    setSaveError(null)
    setShowModal(true)
  })

  async function handleSaveDate(date) {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch(SETTINGS_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: date.toISOString() }),
      })
      if (!res.ok) throw new Error('No se pudo guardar')
      setWeddingDate(date)
      setShowModal(false)
    } catch {
      setSaveError('No se pudo guardar la fecha. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  if (timeLeft.done) {
    return (
      <div className={`countdown${compact ? ' compact' : ''}`} {...longPressHandlers}>
        <h1>¡Ya nos casamos! 💍</h1>
      </div>
    )
  }

  const pad = (n) => String(n).padStart(2, '0')

  return (
    <>
      <div className={`countdown${compact ? ' compact' : ''}`} {...longPressHandlers}>
        {compact ? (
          <span className="countdown-compact-text">
            {pad(timeLeft.days)}:{pad(timeLeft.hours)}:{pad(timeLeft.minutes)}
          </span>
        ) : (
          <div className="countdown-grid">
            <div className="countdown-item">
              <span className="countdown-number">{timeLeft.days}</span>
              <span className="countdown-label">Días</span>
            </div>
            <div className="countdown-item">
              <span className="countdown-number">{timeLeft.hours}</span>
              <span className="countdown-label">Horas</span>
            </div>
            <div className="countdown-item">
              <span className="countdown-number">{timeLeft.minutes}</span>
              <span className="countdown-label">Minutos</span>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <WeddingDateModal
          initialDate={weddingDate}
          onSave={handleSaveDate}
          onCancel={() => setShowModal(false)}
          saving={saving}
          error={saveError}
        />
      )}
    </>
  )
}

export default Countdown
