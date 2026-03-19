import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
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
