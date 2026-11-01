import { useState } from 'react'
import { Home } from './screens/Home'
import { Profile } from './screens/Profile'
import { Summit } from './screens/Summit'
import { Welcome } from './screens/Welcome'
import { Onboarding } from './screens/onboarding/Onboarding'
import { BottomNav, type Tab } from './components/BottomNav'
import { isOnboarded, markOnboarded, saveProfile } from './onboarding'

type Screen = 'welcome' | 'onboarding' | 'summit' | 'app'

export function App() {
  const [screen, setScreen] = useState<Screen>(() => (isOnboarded() ? 'app' : 'welcome'))
  const [tab, setTab] = useState<Tab>('home')
  // откуда открыта анкета: «назад» с первого шага возвращает туда же
  const [from, setFrom] = useState<'welcome' | 'profile'>('welcome')

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

  return (
    <div className="app">
      {tab === 'profile' ? <Profile
          onRestartOnboarding={() => {
            setFrom('profile')
            setScreen('onboarding')
          }}
        /> : <Home />}
      <BottomNav active={tab === 'profile' ? 'profile' : 'home'} onSelect={(t) => (t === 'home' || t === 'profile') && setTab(t)} />
    </div>
  )
}
