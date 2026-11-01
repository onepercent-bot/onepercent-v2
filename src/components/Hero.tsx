import { ChevronDownIcon } from './Icons'
import heroImg from '../assets/home-hero.webp'

export function Hero({ muscle }: { muscle: string }) {
  return (
    <section className="hero" aria-label="План на сегодня">
      <img className="hero__art" src={heroImg} alt="" width={853} height={799} draggable={false} />
      <h1 className="hero__title">План на сегодня</h1>
      <button type="button" className="hero__muscle tappable">
        {muscle}
        <ChevronDownIcon />
      </button>
    </section>
  )
}
