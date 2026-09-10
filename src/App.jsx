import { useState } from 'react'
import Countdown from './Countdown'
import HomeMenu from './HomeMenu'
import Section from './Section'
import Guests from './Guests'
import Ideas from './Ideas'
import Tasks from './Tasks'
import Storage from './Storage'
import PhotoFrame from './PhotoFrame'
import ComingSoon from './ComingSoon'
import VersionBadge from './VersionBadge'
import './App.css'

const SECTION_TITLES = {
  guests: 'Invitados',
  ideas: 'Ideas',
  tasks: 'Tareas',
  'soon-3': 'Próximamente',
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
          <HomeMenu onSelect={setView} />
          <PhotoFrame />
        </>
      ) : (
        <Section title={SECTION_TITLES[view]} onBack={() => setView('home')}>
          {view === 'guests' ? (
            <Guests />
          ) : view === 'ideas' ? (
            <Ideas />
          ) : view === 'tasks' ? (
            <Tasks />
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
