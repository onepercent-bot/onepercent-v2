import { BarsIcon, DumbbellIcon, HomeIcon, UserIcon } from './Icons'

const items = [
  { id: 'home', label: 'Главная', Icon: HomeIcon },
  { id: 'exercises', label: 'Упражнения', Icon: DumbbellIcon },
  { id: 'progress', label: 'Прогресс', Icon: BarsIcon },
  { id: 'profile', label: 'Профиль', Icon: UserIcon },
] as const

export function BottomNav({ active }: { active: (typeof items)[number]['id'] }) {
  return (
    <nav className="nav" aria-label="Основная навигация">
      {items.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={`nav__item tappable${id === active ? ' is-active' : ''}`}
          aria-current={id === active ? 'page' : undefined}
        >
          <Icon width={26} height={26} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
