/* eslint-disable react-refresh/only-export-components */
import React, { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { ClassSetup } from '../../src/components/ClassSetup'
import { LanguageProvider } from '../../src/contexts/LanguageContext'
import { ThemeProvider } from '../../src/contexts/ThemeContext'
import type { LandscapeEntry } from '../../src/hooks/useLandscapes'
import type { ClassSession } from '../../src/trainerTypes'
import '../../src/index.css'

const rootLandscapeId = 'gymnasium-root'
const landscapes = [
  {
    meta: {
      landscapeId: rootLandscapeId,
      title: 'Gymnasium',
      subject: 'Gymnasium',
      filters: [{ id: 'DE-HE', label: 'Hessen' }],
    },
    goals: [],
  },
  {
    meta: {
      landscapeId: 'math',
      title: 'Mathematik',
      subject: 'Mathematik',
      filters: [{ id: 'LK', label: 'Leistungskurs' }],
    },
    goals: [],
  },
  {
    meta: {
      landscapeId: 'physics',
      title: 'Physik',
      subject: 'Physik',
      filters: [{ id: 'LK', label: 'Leistungskurs' }],
    },
    goals: [],
  },
] as unknown as LandscapeEntry[]

const Fixture = () => {
  const [saved, setSaved] = useState<ClassSession | null>(null)
  if (saved) return <pre data-testid="saved-existing-learner-session">{JSON.stringify(saved)}</pre>
  return (
    <ClassSetup
      landscapes={landscapes}
      rootLandscapeId={rootLandscapeId}
      onSave={(session) => {
        setSaved(session)
        return true
      }}
      onCancel={() => {}}
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
