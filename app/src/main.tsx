import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'katex/dist/katex.min.css'
import './index.css'
import App from './App.tsx'
import { installModuleLoadRecovery } from './utils/moduleLoadRecovery'


import { ThemeProvider } from './contexts/ThemeContext'

import { LanguageProvider } from './contexts/LanguageContext'

const routerBase = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '')

installModuleLoadRecovery()

// Handle OAuth redirect before React initializes
// When returning from OAuth, the service worker might serve a cached version of the app
// that doesn't recognize the new URL. We detect this and force a clean reload.
const params = new URLSearchParams(window.location.search)
if (params.get('auth_success')) {
  // Store a flag to prevent reload loop
  const reloadFlag = 'skillpilot_oauth_reload'
  if (!sessionStorage.getItem(reloadFlag)) {
    sessionStorage.setItem(reloadFlag, 'true')
    // Force reload bypassing cache
    window.location.reload()
  } else {
    // Clear the flag after successful reload
    sessionStorage.removeItem(reloadFlag)
    // Also clear the auth_success param from URL
    params.delete('auth_success')
    const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '')
    window.history.replaceState({}, '', newUrl)
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={routerBase}>
      <LanguageProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
