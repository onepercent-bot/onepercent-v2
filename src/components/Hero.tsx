import { ChevronDownIcon, GearIcon, SparkIcon } from './Icons'
import heroImg from '../assets/hero-placeholder.jpg'

type Props = { muscle: string; title: string; subtitle: string }

export function Hero({ muscle, title, subtitle }: Props) {
  return (
    <section className="hero" aria-label="Тренировка на сегодня">
      <img className="hero__figure" src={heroImg} alt="" width={225} height={305} draggable={false} />

      <span className="hero__today">Сегодня</span>
      <button type="button" className="hero__muscle tappable">
        {muscle}
        <ChevronDownIcon width={18} height={18} />
      </button>
      <button type="button" className="hero__settings tappable" aria-label="Настройки">
        <GearIcon width={24} height={24} />
      </button>

      <div className="hero__coach">
        <h1 className="hero__title">
          {title} <SparkIcon className="hero__spark" width={15} height={15} /> тренера
        </h1>
        <p className="hero__sub">{subtitle}</p>
      </div>
    </section>
  )
}
