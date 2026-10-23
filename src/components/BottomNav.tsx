import { BarsIcon, ExercisesIcon, HomeIcon, UserIcon } from './Icons'

const items = [
  { id: 'home', label: 'Главная', Icon: HomeIcon },
  { id: 'exercises', label: 'Упражнения', Icon: ExercisesIcon },
  { id: 'analytics', label: 'Аналитика', Icon: BarsIcon },
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
          <Icon />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
