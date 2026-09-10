import { useState } from 'react'
import Countdown from './Countdown'
import HomeMenu from './HomeMenu'
import Section from './Section'
import Guests from './Guests'
import Ideas from './Ideas'
import Tasks from './Tasks'
import Gallery from './Gallery'
import Storage from './Storage'
import PhotoCarousel from './PhotoCarousel'
import ComingSoon from './ComingSoon'
import VersionBadge from './VersionBadge'
import './App.css'

const SECTION_TITLES = {
  guests: 'Invitados',
  ideas: 'Ideas',
  tasks: 'Tareas',
  gallery: 'Galería',
  'soon-4': 'Próximamente',
  storage: 'Almacenamiento',
}

function App() {
  const [view, setView] = useState('home')

  return (
    <div className="app">
      <div className={`top-bar${view === 'home' ? ' home-size' : ' compact-size'}`}>
        <VersionBadge />
        <Countdown compact={view !== 'home'} />
      </div>

      {view === 'home' ? (
        <>
          <PhotoCarousel />
          <HomeMenu onSelect={setView} />
        </>
      ) : (
        <Section title={SECTION_TITLES[view]} onBack={() => setView('home')}>
          {view === 'guests' ? (
            <Guests />
          ) : view === 'ideas' ? (
            <Ideas />
          ) : view === 'tasks' ? (
            <Tasks />
          ) : view === 'gallery' ? (
            <Gallery />
          ) : view === 'storage' ? (
            <Storage />
          ) : (
            <ComingSoon />
          )}
        </Section>
      )}
    </div>
  )
}

export default App
