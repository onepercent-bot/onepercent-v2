import { ChevronDownIcon } from './Icons'
import { myCharacter } from '../data/character'

export function Hero({ muscle }: { muscle: string }) {
  const hero = myCharacter()
  return (
    <section className="hero" aria-label="План на сегодня">
      <img className="hero__art" src={hero.src} alt="" width={hero.w} height={hero.h} draggable={false} />
      <h1 className="hero__title">План на сегодня</h1>
      <button type="button" className="hero__muscle tappable">
        {muscle}
        <ChevronDownIcon />
      </button>
    </section>
  )
}
