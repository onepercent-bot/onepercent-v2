import { CheckIcon, ChevronRightIcon } from './Icons'
import type { DayState } from '../data/home'

type Day = { label: string; state: DayState; today?: boolean }

export function WeekPlan({ days }: { days: Day[] }) {
  return (
    <section className="card week" aria-label="План на неделю">
      <header className="week__head">
        <h2 className="card__title">План на неделю</h2>
        <button type="button" className="week__all tappable">
          Все <ChevronRightIcon width={14} height={14} />
        </button>
      </header>
      <ul className="week__days">
        {days.map((d) => (
          <li key={d.label} className={`day day--${d.state}${d.today ? ' day--today' : ''}`}>
            <span className="day__label">{d.label}</span>
            <span className="day__dot">{d.state === 'done' && <CheckIcon width={14} height={14} />}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
