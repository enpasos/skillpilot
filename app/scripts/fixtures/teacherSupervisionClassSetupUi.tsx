/* eslint-disable react-refresh/only-export-components */
import React, { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { ClassSetup } from '../../src/components/ClassSetup'
import { LanguageProvider } from '../../src/contexts/LanguageContext'
import { ThemeProvider } from '../../src/contexts/ThemeContext'
import type { LandscapeEntry } from '../../src/hooks/useLandscapes'
import type { ClassSession } from '../../src/trainerTypes'
import { hasTeacherPendingSupervisionRecord } from '../../src/utils/teacherSupervision'
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
] as LandscapeEntry[]

const Fixture = () => {
  const [saved, setSaved] = useState<ClassSession | null>(null)
  const [isCreating, setIsCreating] = useState(hasTeacherPendingSupervisionRecord)
  if (saved) return <pre data-testid="saved-linked-session">{JSON.stringify(saved)}</pre>
  if (!isCreating) {
    return <button type="button" onClick={() => setIsCreating(true)}>+ Neue Klasse</button>
  }
  return (
    <ClassSetup
      landscapes={landscapes}
      rootLandscapeId={rootLandscapeId}
      onSave={(session) => {
        if (sessionStorage.getItem('teacher-supervision-fixture-reject-save') === 'true') return false
        setSaved(session)
        return true
      }}
      onCancel={() => setIsCreating(false)}
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
