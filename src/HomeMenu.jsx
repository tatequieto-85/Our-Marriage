import { GuestsIcon, IdeasIcon, TasksIcon, QuotesIcon, HoneymoonIcon, GalleryIcon } from './icons'

const ITEMS = [
  { id: 'guests', label: 'Invitados', Icon: GuestsIcon },
  { id: 'ideas', label: 'Ideas', Icon: IdeasIcon },
  { id: 'tasks', label: 'Tareas', Icon: TasksIcon },
  { id: 'quotes', label: 'Cotizaciones', Icon: QuotesIcon },
  { id: 'honeymoon', label: 'Luna de miel', Icon: HoneymoonIcon },
  { id: 'storage', label: 'Galería', Icon: GalleryIcon },
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
