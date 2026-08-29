import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from '../../src/App'
import { LanguageProvider } from '../../src/contexts/LanguageContext'
import { ThemeProvider } from '../../src/contexts/ThemeContext'

// The fixture document is loaded from /scripts/fixtures first. Replace that
// bootstrap URL before BrowserRouter starts so the test exercises the actual
// App, useAppCore and TrainerView route contract with native browser history.
window.history.replaceState(
  {},
  '',
  '/trainer?l=trainer-navigation-landscape&f=GK',
)

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
