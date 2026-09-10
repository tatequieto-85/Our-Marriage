import { GuestsIcon, IdeasIcon, TasksIcon, GalleryIcon, SparkleIcon, StorageIcon } from './icons'

const ITEMS = [
  { id: 'guests', label: 'Invitados', Icon: GuestsIcon },
  { id: 'ideas', label: 'Ideas', Icon: IdeasIcon },
  { id: 'tasks', label: 'Tareas', Icon: TasksIcon },
  { id: 'gallery', label: 'Galería', Icon: GalleryIcon },
  { id: 'soon-4', label: 'Próximamente', Icon: SparkleIcon },
  { id: 'storage', label: 'Almacenamiento', Icon: StorageIcon },
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
