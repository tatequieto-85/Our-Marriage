import { useEffect, useRef, useState } from 'react'
import { API_BASE, GOOGLE_CLIENT_ID, setToken } from './api'

function Login({ onLogin }) {
  const buttonRef = useRef(null)
  const [error, setError] = useState(null)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function handleCredentialResponse(response) {
      setVerifying(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential }),
        })
        const data = await res.json().catch(() => null)
        if (!res.ok || !data?.token) {
          setError(
            res.status === 403
              ? 'Esta cuenta de Google no tiene acceso a la app.'
              : 'No se pudo iniciar sesión. Intenta de nuevo.'
          )
          return
        }
        setToken(data.token)
        onLogin(data.email)
      } catch {
        setError('No se pudo iniciar sesión. Revisa tu conexión.')
      } finally {
        if (!cancelled) setVerifying(false)
      }
    }

    function setup() {
      if (cancelled || !window.google?.accounts?.id) return
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      })
      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 280,
        })
      }
    }

    if (window.google?.accounts?.id) {
      setup()
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval)
          setup()
        }
      }, 200)
      return () => {
        cancelled = true
        clearInterval(interval)
      }
    }

    return () => {
      cancelled = true
    }
  }, [onLogin])

  return (
    <div className="login-screen">
      <h1 className="login-title">Nuestra Boda</h1>
      <p className="login-subtitle">Inicia sesión para continuar</p>
      <div ref={buttonRef} className="login-google-btn" />
      {verifying && <p className="login-status">Verificando…</p>}
      {error && <p className="guests-error">{error}</p>}
    </div>
  )
}

export default Login
