import { useEffect, useState } from 'react'
import Countdown from './Countdown'
import HomeMenu from './HomeMenu'
import Section from './Section'
import Guests from './Guests'
import Ideas from './Ideas'
import Tasks from './Tasks'
import Quotes from './Quotes'
import Honeymoon from './Honeymoon'
import Storage from './Storage'
import PhotoCarousel from './PhotoCarousel'
import VersionBadge from './VersionBadge'
import Login from './Login'
import { getSessionEmail, onAuthExpired } from './api'
import './App.css'

const SECTION_TITLES = {
  guests: 'Invitados',
  ideas: 'Ideas',
  tasks: 'Tareas',
  quotes: 'Cotizaciones',
  honeymoon: 'Luna de miel',
  storage: 'Galería',
}

function App() {
  const [email, setEmail] = useState(() => getSessionEmail())
  const [view, setView] = useState('home')
  const [subHeader, setSubHeader] = useState(null)

  useEffect(() => onAuthExpired(() => setEmail(null)), [])

  function navigate(next) {
    setSubHeader(null)
    setView(next)
  }

  if (!email) {
    return <Login onLogin={setEmail} />
  }

  return (
    <div className="app">
      <div className={`top-bar${view === 'home' ? ' home-size' : ' compact-size'}`}>
        <VersionBadge />
        <Countdown compact={view !== 'home'} />
      </div>

      {view === 'home' ? (
        <>
          <HomeMenu onSelect={navigate} />
          <PhotoCarousel />
        </>
      ) : (
        <Section
          title={subHeader?.title ?? SECTION_TITLES[view]}
          onBack={subHeader?.onBack ?? (() => navigate('home'))}
        >
          {view === 'guests' ? (
            <Guests />
          ) : view === 'ideas' ? (
            <Ideas />
          ) : view === 'tasks' ? (
            <Tasks />
          ) : view === 'quotes' ? (
            <Quotes />
          ) : view === 'honeymoon' ? (
            <Honeymoon onHeaderChange={setSubHeader} />
          ) : (
            <Storage />
          )}
        </Section>
      )}
    </div>
  )
}

export default App
