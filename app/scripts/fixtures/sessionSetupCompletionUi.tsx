/* eslint-disable react-refresh/only-export-components */
import React, { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { SessionSetup } from '../../src/components/SessionSetup'
import { LanguageProvider } from '../../src/contexts/LanguageContext'
import { ThemeProvider } from '../../src/contexts/ThemeContext'

type Role = 'learner' | 'trainer' | 'explorer'

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
            onStart={() => undefined}
          />
        </ThemeProvider>
      </LanguageProvider>
    </MemoryRouter>
  )
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('missing fixture root')

createRoot(rootElement).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
)
