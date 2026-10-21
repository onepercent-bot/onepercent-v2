import { Home } from './screens/Home'
import { BottomNav } from './components/BottomNav'

export function App() {
  return (
    <div className="app">
      <Home />
      <BottomNav active="home" />
    </div>
  )
}
