import { useState } from 'react'
import artImg from '../assets/welcome-art.webp'
import { ArrowRightIcon, BarsFilledIcon, BoltIcon, ChevronRightIcon, DumbbellIcon } from '../components/Icons'

const features = [
  {
    title: 'План под вас',
    sub: 'Учитывает цели, уровень и время',
    more: 'AI узнаёт вашу цель, уровень и сколько времени у вас есть, и составляет тренировки именно под вас.',
    Icon: DumbbellIcon,
  },
  {
    title: 'Умная нагрузка',
    sub: 'Оптимальные тренировки и прогресс',
    more: 'После каждой тренировки One% смотрит, как вы справились. Если нужно, следующая станет легче или тяжелее.',
    Icon: BoltIcon,
  },
  {
    title: 'Отслеживание прогресса',
    sub: 'Видите результаты в динамике',
    more: 'Все тренировки и результаты сохраняются. Вы видите, как растут веса и повторы, а программа меняется вместе с вами.',
    Icon: BarsFilledIcon,
  },
]

export function Welcome({ onStart }: { onStart: () => void }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <main className="welcome-screen">
      <div className="welcome">
        <div className="welcome__art">
          <img src={artImg} alt="One% — Мини-приложение" width={941} height={977} draggable={false} />
        </div>
        <h1 className="welcome__lead">
          Персональный план тренировок
          <br />
          под ваши цели, уровень и время.
        </h1>
        <ul className="welcome__card">
          {features.map(({ title, sub, more, Icon }, i) => {
            const isOpen = open === i
            return (
              <li key={title} className={`welcome__item welcome__item--${i + 1}${isOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="welcome__row"
                  aria-expanded={isOpen}
                  aria-controls={`welcome-more-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className="welcome__icon">
                    <Icon />
                  </span>
                  <span className="welcome__text">
                    <span className="welcome__title">{title}</span>
                    <span className="welcome__sub">{sub}</span>
                  </span>
                  <ChevronRightIcon className="welcome__chev" />
                </button>
                <div className="welcome__panel" id={`welcome-more-${i}`} role="region">
                  <p className="welcome__more">{more}</p>
                </div>
              </li>
            )
          })}
        </ul>
        <button type="button" className="welcome__start tappable" onClick={onStart}>
          Начать
          <ArrowRightIcon />
        </button>
        <p className="welcome__note">Заполнение анкеты займёт 1–2 минуты</p>
      </div>
    </main>
  )
}
