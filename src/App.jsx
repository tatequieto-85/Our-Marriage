import { useState } from 'react'
import Countdown from './Countdown'
import HomeMenu from './HomeMenu'
import Section from './Section'
import Guests from './Guests'
import ComingSoon from './ComingSoon'
import VersionBadge from './VersionBadge'
import './App.css'

const SECTION_TITLES = {
  guests: 'Invitados',
  'soon-1': 'Próximamente',
  'soon-2': 'Próximamente',
  'soon-3': 'Próximamente',
  'soon-4': 'Próximamente',
  'soon-5': 'Próximamente',
}

function App() {
  const [view, setView] = useState('home')

  return (
    <div className="app">
      <VersionBadge />
      <Countdown />

      {view === 'home' ? (
        <HomeMenu onSelect={setView} />
      ) : (
        <Section title={SECTION_TITLES[view]} onBack={() => setView('home')}>
          {view === 'guests' ? <Guests /> : <ComingSoon />}
        </Section>
      )}
    </div>
  )
}

export default App
