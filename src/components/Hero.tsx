import { ChevronDownIcon, GearIcon, SparkIcon } from './Icons'
import heroImg from '../assets/hero-character.webp'
import chestImg from '../assets/muscles/chest.webp'

type Props = { muscle: string; title: string; subtitle: string }

export function Hero({ muscle, title, subtitle }: Props) {
  return (
    <section className="hero" aria-label="Тренировка на сегодня">
      <div className="hero__figure">
        <img src={heroImg} alt="" width={302} height={452} draggable={false} />
        <img className="hero__muscle-layer" src={chestImg} alt="" width={302} height={452} draggable={false} />
      </div>

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
          {title} <SparkIcon className="hero__spark" width={15} height={15} />
        </h1>
        <p className="hero__sub">{subtitle}</p>
      </div>
    </section>
  )
}
