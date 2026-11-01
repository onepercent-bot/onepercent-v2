import { Hero } from '../components/Hero'
import { Recommended } from '../components/Recommended'
import { WeekPlan } from '../components/WeekPlan'
import { LastWorkout } from '../components/LastWorkout'
import { ArrowRightIcon } from '../components/Icons'
import { homeMock } from '../data/home'

export function Home() {
  const { muscle, coach, week, last } = homeMock
  return (
    <main className="home">
      <Hero muscle={muscle} />
      <div className="home__body">
        <Recommended title={coach.title} subtitle={coach.subtitle} />
        <button type="button" className="cta tappable">
          Начать тренировку
          <ArrowRightIcon />
        </button>
        <WeekPlan days={week} />
        <LastWorkout muscle={last.muscle} minutes={last.minutes} exercises={last.exercises} />
      </div>
    </main>
  )
}
