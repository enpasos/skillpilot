import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'katex/dist/katex.min.css'
import './index.css'
import App from './App.tsx'
import { LegalWaiverModal } from './components/LegalWaiverModal'


import { ThemeProvider } from './contexts/ThemeContext'

import { LanguageProvider } from './contexts/LanguageContext'

const routerBase = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={routerBase}>
      <LanguageProvider>
        <ThemeProvider>
          <LegalWaiverModal />
          <App />
        </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
