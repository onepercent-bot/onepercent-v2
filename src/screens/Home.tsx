import { Hero } from '../components/Hero'
import { WeekPlan } from '../components/WeekPlan'
import { LastWorkout } from '../components/LastWorkout'
import { ArrowRightIcon } from '../components/Icons'
import { homeMock } from '../data/home'

export function Home() {
  const { muscle, coach, week, last } = homeMock
  return (
    <main className="home">
      <Hero muscle={muscle} title={coach.title} subtitle={coach.subtitle} />
      <div className="home__body">
        <button type="button" className="cta tappable">
          Начать тренировку
          <ArrowRightIcon width={22} height={22} />
        </button>
        <WeekPlan days={week} />
        <LastWorkout title={last.title} meta={last.meta} when={last.when} />
      </div>
    </main>
  )
}
