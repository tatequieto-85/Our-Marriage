import { useEffect, useRef, useState } from 'react'
import { HeartIcon } from './icons'
import { API_BASE, apiFetch } from './api'

const API_URL = `${API_BASE}/api/gallery`
const ROTATE_MS = 6000

function shuffle(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function PhotoCarousel() {
  const [photos, setPhotos] = useState([])
  const containerRef = useRef(null)
  const indexRef = useRef(0)
  const scrollTimeoutRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    apiFetch(API_URL)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setPhotos(shuffle(data))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (photos.length < 2) return
    const timer = setInterval(() => {
      const next = (indexRef.current + 1) % photos.length
      indexRef.current = next
      const el = containerRef.current?.children[next]
      el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }, ROTATE_MS)
    return () => clearInterval(timer)
  }, [photos.length])

  function handleScroll() {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    scrollTimeoutRef.current = setTimeout(() => {
      const container = containerRef.current
      if (!container) return
      const containerCenter = container.scrollLeft + container.clientWidth / 2
      let closest = 0
      let closestDist = Infinity
      Array.from(container.children).forEach((child, i) => {
        const dist = Math.abs(child.offsetLeft + child.offsetWidth / 2 - containerCenter)
        if (dist < closestDist) {
          closestDist = dist
          closest = i
        }
      })
      indexRef.current = closest
    }, 150)
  }

  async function toggleFavorite(photo) {
    const nextFavorite = !photo.is_favorite
    setPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, is_favorite: nextFavorite } : p)))
    try {
      await apiFetch(`${API_URL}/${photo.id}/favorite`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: nextFavorite }),
      })
    } catch {
      setPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, is_favorite: photo.is_favorite } : p)))
    }
  }

  if (photos.length === 0) return null

  return (
    <div className="photo-carousel" ref={containerRef} onScroll={handleScroll}>
      {photos.map((photo) => (
        <div className="photo-carousel-slide" key={photo.id} onDoubleClick={() => toggleFavorite(photo)}>
          <img src={photo.photo_url} alt="" />
          <span className={`photo-favorite-heart${photo.is_favorite ? ' favorite' : ''}`}>
            <HeartIcon filled={photo.is_favorite} />
          </span>
        </div>
      ))}
    </div>
  )
}

export default PhotoCarousel
