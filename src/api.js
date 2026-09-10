export const API_BASE = 'https://nuestra-boda-api.byco85.workers.dev'
export const GOOGLE_CLIENT_ID = '238269964490-0j25880mvbdnfmpte1u65jdnf3cc4l3h.apps.googleusercontent.com'

const TOKEN_KEY = 'nb_session_token'
const AUTH_EXPIRED_EVENT = 'nb-auth-expired'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

function base64UrlDecode(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
  return atob(padded)
}

// Lee el correo de la sesión guardada localmente (sin verificar la firma;
// la verificación real la hace el worker en cada solicitud).
export function getSessionEmail() {
  const token = getToken()
  if (!token) return null
  try {
    const [payloadEncoded] = token.split('.')
    const payload = JSON.parse(base64UrlDecode(payloadEncoded))
    if (!payload.email || Date.now() > payload.exp) return null
    return payload.email
  } catch {
    return null
  }
}

export function onAuthExpired(callback) {
  window.addEventListener(AUTH_EXPIRED_EVENT, callback)
  return () => window.removeEventListener(AUTH_EXPIRED_EVENT, callback)
}

// Reemplazo de fetch: agrega el token de sesión y cierra sesión sola si el
// worker responde 401 (token vencido o revocado).
export async function apiFetch(input, options = {}) {
  const token = getToken()
  const headers = new Headers(options.headers || {})
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(input, { ...options, headers })
  if (res.status === 401) {
    clearToken()
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
  }
  return res
}
