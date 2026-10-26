import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import '@fontsource/bebas-neue'
import '@fontsource/barlow-semi-condensed/400.css'
import '@fontsource/barlow-semi-condensed/600.css'
import '@fontsource/barlow-semi-condensed/700.css'
import '@fontsource/barlow-semi-condensed/800.css'
import './index.css'
import App from './components/app/App'
import { ResponsiveProvider } from './context/ResponsiveContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ResponsiveProvider>
      <App/>
    </ResponsiveProvider>
  </StrictMode>,
)
