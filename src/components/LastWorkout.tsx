import { useId, useState } from 'react'
import { ChevronDownIcon, ClockIcon } from './Icons'

type Exercise = { name: string; sets: number }
type Props = { muscle: string; minutes: number; exercises: Exercise[] }

const sum = (xs: Exercise[]) => xs.reduce((n, x) => n + x.sets, 0)

export function LastWorkout({ muscle, minutes, exercises }: Props) {
  const [open, setOpen] = useState(false)
  const listId = useId()
  return (
    <section className={`card last${open ? ' is-open' : ''}`} aria-label="Прошлая тренировка">
      <button
        type="button"
        className="last__row tappable"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="icon-disc last__icon">
          <ClockIcon />
        </span>
        <span className="last__text">
          <span className="last__name">Прошлая тренировка</span>
          <span className="last__meta">
            {muscle} • {minutes} мин • {exercises.length} упражнений • {sum(exercises)} подходов
          </span>
        </span>
        <ChevronDownIcon className="last__chev" />
      </button>
      <div className="last__panel" id={listId}>
        <ul className="last__list">
          {exercises.map((e, i) => (
            <li key={e.name} className="last__item">
              <span className="last__num">{i + 1}</span>
              <span className="last__ex">{e.name}</span>
              <span className="last__sets">{e.sets} подх.</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
