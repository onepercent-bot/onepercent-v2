import { useState } from 'react'
import { Home } from './screens/Home'
import { Welcome } from './screens/Welcome'
import { Onboarding } from './screens/onboarding/Onboarding'
import { BottomNav } from './components/BottomNav'
import { isOnboarded, markOnboarded, saveProfile } from './onboarding'

type Screen = 'welcome' | 'onboarding' | 'home'

export function App() {
  const [screen, setScreen] = useState<Screen>(() => (isOnboarded() ? 'home' : 'welcome'))

  if (screen === 'welcome') return <Welcome onStart={() => setScreen('onboarding')} />

  if (screen === 'onboarding') {
    return (
      <Onboarding
        onExit={() => setScreen('welcome')}
        onDone={(profile) => {
          saveProfile(profile)
          markOnboarded()
          setScreen('home')
        }}
      />
    )
  }

  return (
    <div className="app">
      <Home />
      <BottomNav active="home" />
    </div>
  )
}
