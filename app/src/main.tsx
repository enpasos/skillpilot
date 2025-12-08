import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { LegalWaiverModal } from './components/LegalWaiverModal'


import { ThemeProvider } from './contexts/ThemeContext'

import { LanguageProvider } from './contexts/LanguageContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <ThemeProvider>
          <LegalWaiverModal />
          <App />
        </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
