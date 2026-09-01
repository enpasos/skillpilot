/* eslint-disable react-refresh/only-export-components */
import React, { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { ClassSetup } from '../../src/components/ClassSetup'
import { LanguageProvider } from '../../src/contexts/LanguageContext'
import { ThemeProvider } from '../../src/contexts/ThemeContext'
import type { ClassSession } from '../../src/trainerTypes'
import '../../src/index.css'

const Fixture = () => {
  const [saved, setSaved] = useState<ClassSession | null>(null)
  const [cancelled, setCancelled] = useState(false)
  if (saved) return <pre data-testid="saved-existing-learner-session">{JSON.stringify(saved)}</pre>
  if (cancelled) return <p data-testid="cancelled-existing-learner-session">Abgebrochen</p>
  return (
    <ClassSetup
      landscapes={[]}
      onSave={(session) => {
        setSaved(session)
        return true
      }}
      onCancel={() => setCancelled(true)}
    />
  )
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('missing fixture root')

createRoot(rootElement).render(
  <LanguageProvider>
    <ThemeProvider>
      <StrictMode><Fixture /></StrictMode>
    </ThemeProvider>
  </LanguageProvider>,
)
