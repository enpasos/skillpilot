/* eslint-disable react-refresh/only-export-components */
import React, { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import App from '../../src/App'
import { SessionSetup } from '../../src/components/SessionSetup'
import { LanguageProvider } from '../../src/contexts/LanguageContext'
import { ThemeProvider } from '../../src/contexts/ThemeContext'

type Role = 'learner' | 'trainer' | 'explorer'

declare global {
  interface Window {
    __sessionSetupStartProbe?: Array<{
      id: string
      landscapeId?: string
      role?: Role
    }>
  }
}

const Fixture = () => {
  const [role, setRole] = useState<Role | null>(null)
  const [skillpilotId, setSkillpilotId] = useState('')

  return (
    <MemoryRouter initialEntries={['/']}>
      <LanguageProvider>
        <ThemeProvider>
          <SessionSetup
            role={role}
            setRole={setRole}
            skillpilotId={skillpilotId}
            setSkillpilotId={setSkillpilotId}
            onStart={(id, landscapeId, startRole) => {
              const probe = window.__sessionSetupStartProbe ?? []
              probe.push({ id, landscapeId, role: startRole })
              window.__sessionSetupStartProbe = probe
            }}
          />
        </ThemeProvider>
      </LanguageProvider>
    </MemoryRouter>
  )
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('missing fixture root')

const fixtureMode = new URLSearchParams(window.location.search).get('fixture')
if (fixtureMode === 'trainer-app-entry' || fixtureMode === 'trainer-direct-entry') {
  window.history.replaceState({}, '', fixtureMode === 'trainer-direct-entry' ? '/trainer' : '/')
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
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <Fixture />
    </StrictMode>,
  )
}
