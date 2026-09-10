import { useEffect, useState } from 'react'
import { API_BASE } from './api'

const API_URL = `${API_BASE}/api/gallery`
const ROTATE_MS = 6000

function PhotoFrame() {
  const [photos, setPhotos] = useState([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetch(API_URL)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setPhotos(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (photos.length < 2) return
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length)
    }, ROTATE_MS)
    return () => clearInterval(timer)
  }, [photos.length])

  if (photos.length === 0) return null

  return (
    <div className="photo-frame">
      <div className="photo-frame-inner">
        {photos.map((photo, i) => (
          <img
            key={photo.id}
            src={photo.photo_url}
            alt=""
            className={`photo-frame-img${i === index ? ' active' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}

export default PhotoFrame
