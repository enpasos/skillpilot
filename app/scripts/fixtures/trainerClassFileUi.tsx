import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from '../../src/App'
import { LanguageProvider } from '../../src/contexts/LanguageContext'
import { ThemeProvider } from '../../src/contexts/ThemeContext'

window.history.replaceState({}, '', '/trainer?l=trainer-class-file-landscape&f=LK')

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('missing fixture root')

createRoot(rootElement).render(
  <BrowserRouter>
    <LanguageProvider>
      <ThemeProvider>
        <StrictMode>
          <App />
        </StrictMode>
      </ThemeProvider>
    </LanguageProvider>
  </BrowserRouter>,
)
