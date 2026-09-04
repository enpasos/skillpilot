/* eslint-disable react-refresh/only-export-components */
import React, { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'

import '../../src/index.css'
import { LanguageProvider } from '../../src/contexts/LanguageContext'
import { ThemeProvider } from '../../src/contexts/ThemeContext'
import type { UiGoal } from '../../src/goalTypes'
import { LearnerView } from '../../src/views/LearnerView'

class QuietEventSource {
  static readonly CONNECTING = 0
  static readonly OPEN = 1
  static readonly CLOSED = 2
  readonly CONNECTING = 0
  readonly OPEN = 1
  readonly CLOSED = 2
  readonly readyState = 1
  readonly withCredentials = false
  readonly url: string
  onopen = null
  onmessage = null
  onerror = null

  constructor(url: string | URL) {
    this.url = String(url)
  }

  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true }
  close() {}
}

Object.defineProperty(window, 'EventSource', {
  configurable: true,
  value: QuietEventSource,
})

const goal = (id: string, landscapeId: string, title: string): UiGoal => ({
  id,
  landscapeId,
  title,
  description: `Die lernende Person kann ${title.toLowerCase()}.`,
  phase: 'GLOBAL',
  themenfeld: '',
  area: 'Test',
  level: 1,
  core: true,
  weight: 1,
  tags: [],
  leitideen: [],
  kompetenzen: [],
  sourceRef: '',
  requires: [],
  contains: [],
  examples: [],
  type: 'atomic',
  nodeKind: 'tutor',
})

const mathGoal = goal('math-goal-1', 'math/sek-i', 'Lineare Gleichungen lösen')
const physicsGoal = goal('physics-goal-1', 'physics/sek-ii', 'Kräfte und Bewegung erklären')
const goals = new Map([mathGoal, physicsGoal].map((entry) => [entry.id, entry]))

const Fixture = () => {
  const [currentGoal, setCurrentGoal] = useState(mathGoal)
  const [landscapeId, setLandscapeId] = useState(mathGoal.landscapeId ?? 'math/sek-i')

  const selectGoal = (goalId: string) => {
    const selected = goals.get(goalId)
    if (selected) setCurrentGoal(selected)
  }

  return (
    <LearnerView
      rootGoals={[mathGoal]}
      goalIndexAll={goals}
      getMastery={() => 0}
      currentGoal={currentGoal}
      onSelectGoal={selectGoal}
      onSelectGoalInLandscape={(nextLandscapeId, goalId) => {
        setLandscapeId(nextLandscapeId)
        selectGoal(goalId)
      }}
      routeGoalId={currentGoal.id}
      skillpilotId="learner-42"
      landscapeId={landscapeId}
      currentLandscapeHasMatchedCompositionView={false}
      availableLandscapes={[
        { landscapeId: 'math/sek-i', title: 'Mathematik' },
        { landscapeId: 'physics/sek-ii', title: 'Physik' },
      ]}
      rootLandscapeId="school-root"
      parentMap={new Map()}
    />
  )
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('missing fixture root')

createRoot(rootElement).render(
  <StrictMode>
    <MemoryRouter initialEntries={['/learner/math-goal-1?l=math%2Fsek-i']}>
      <LanguageProvider>
        <ThemeProvider>
          <Fixture />
        </ThemeProvider>
      </LanguageProvider>
    </MemoryRouter>
  </StrictMode>,
)
