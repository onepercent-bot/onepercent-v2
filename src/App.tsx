import { useState } from 'react'
import { Home } from './screens/Home'
import { Profile } from './screens/Profile'
import { Exercises } from './screens/Exercises'
import { Progress } from './screens/Progress'
import { Workout } from './screens/Workout'
import { Summit } from './screens/Summit'
import { Welcome } from './screens/Welcome'
import { Onboarding } from './screens/onboarding/Onboarding'
import { BottomNav, type Tab } from './components/BottomNav'
import { isOnboarded, markOnboarded, saveProfile } from './onboarding'

type Screen = 'welcome' | 'onboarding' | 'summit' | 'app'

export function App() {
  const [screen, setScreen] = useState<Screen>(() => (isOnboarded() ? 'app' : 'welcome'))
  const [tab, setTab] = useState<Tab>('home')
  // группа, которую открыть в «Упражнениях» (переход из «Прогресса»)
  const [exGroup, setExGroup] = useState<string | undefined>()
  // откуда открыта анкета: «назад» с первого шага возвращает туда же
  const [from, setFrom] = useState<'welcome' | 'profile'>('welcome')
  // «Тренировка дня» поверх вкладок (открывается с Главной)
  const [workout, setWorkout] = useState(false)

  if (screen === 'welcome')
    return (
      <Welcome
        onStart={() => {
          setFrom('welcome')
          setScreen('onboarding')
        }}
      />
    )

  if (screen === 'onboarding') {
    return (
      <Onboarding
        onExit={() => setScreen(from === 'profile' ? 'app' : 'welcome')}
        onDone={(profile) => {
          saveProfile(profile)
          markOnboarded()
          setScreen('summit')
        }}
      />
    )
  }

  if (screen === 'summit') {
    return (
      <Summit
        onDone={() => {
          setTab('home')
          setScreen('app')
        }}
      />
    )
  }

  if (workout)
    return (
      <div className="app">
        <Workout onClose={() => setWorkout(false)} />
      </div>
    )

  return (
    <div className="app">
      {tab === 'profile' ? <Profile
          onRestartOnboarding={() => {
            setFrom('profile')
            setScreen('onboarding')
          }}
        /> : tab === 'exercises' ? <Exercises initialGroup={exGroup} /> : tab === 'progress' ? (
          <Progress
            onOpenGroup={(g) => {
              setExGroup(g)
              setTab('exercises')
            }}
          />
        ) : <Home onWorkout={() => setWorkout(true)} />}
      <BottomNav
        active={tab}
        onSelect={(t) => {
          setExGroup(undefined)
          setTab(t)
        }}
      />
    </div>
  )
}
