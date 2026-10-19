import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import './styles/tokens.css'
import './styles/base.css'
import { initTelegram } from './telegram'
import { App } from './App'

initTelegram()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
