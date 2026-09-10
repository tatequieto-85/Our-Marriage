import { useState } from 'react'
import Countdown from './Countdown'
import HomeMenu from './HomeMenu'
import Section from './Section'
import Guests from './Guests'
import Ideas from './Ideas'
import Storage from './Storage'
import ComingSoon from './ComingSoon'
import VersionBadge from './VersionBadge'
import './App.css'

const SECTION_TITLES = {
  guests: 'Invitados',
  ideas: 'Ideas',
  'soon-2': 'Próximamente',
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
        <HomeMenu onSelect={setView} />
      ) : (
        <Section title={SECTION_TITLES[view]} onBack={() => setView('home')}>
          {view === 'guests' ? (
            <Guests />
          ) : view === 'ideas' ? (
            <Ideas />
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
