import { ArrowRightIcon, DumbbellIcon } from './Icons'
import legsImg from '../assets/legs-placeholder.jpg'

type Props = { title: string; meta: string; when: string }

export function LastWorkout({ title, meta, when }: Props) {
  return (
    <section className="card last" aria-label="Прошлая тренировка">
      <header className="last__head">
        <DumbbellIcon width={20} height={20} className="last__icon" />
        <h2 className="card__title">Прошлая тренировка</h2>
        <span className="last__when">{when}</span>
      </header>
      <button type="button" className="last__row tappable">
        <img className="last__thumb" src={legsImg} alt="" width={73} height={58} draggable={false} />
        <span className="last__text">
          <span className="last__name">{title}</span>
          <span className="last__meta">{meta}</span>
        </span>
        <ArrowRightIcon className="last__go" width={22} height={22} />
      </button>
    </section>
  )
}
