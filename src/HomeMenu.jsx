import { GuestsIcon, SparkleIcon } from './icons'

const ITEMS = [
  { id: 'guests', label: 'Invitados', Icon: GuestsIcon },
  { id: 'soon-1', label: 'Próximamente', Icon: SparkleIcon },
  { id: 'soon-2', label: 'Próximamente', Icon: SparkleIcon },
  { id: 'soon-3', label: 'Próximamente', Icon: SparkleIcon },
  { id: 'soon-4', label: 'Próximamente', Icon: SparkleIcon },
  { id: 'soon-5', label: 'Próximamente', Icon: SparkleIcon },
]

function HomeMenu({ onSelect }) {
  return (
    <div className="home-menu">
      {ITEMS.map(({ id, label, Icon }) => (
        <button key={id} type="button" className="menu-item" onClick={() => onSelect(id)}>
          <span className="menu-icon">
            <Icon />
          </span>
          <span className="menu-label">{label}</span>
        </button>
      ))}
    </div>
  )
}

export default HomeMenu
