/* eslint-disable react-refresh/only-export-components */
import React, { useCallback, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'

import '../../src/index.css'
import { LanguageProvider } from '../../src/contexts/LanguageContext'
import { ThemeProvider } from '../../src/contexts/ThemeContext'
import type { UiGoal } from '../../src/goalTypes'
import { CANONICAL_GYMNASIUM_ROOT_ID } from '../../src/utils/curriculumDisplay'
import { LearnerView } from '../../src/views/LearnerView'

// Exercise the real SSE hook without opening a production connection. Only the
// local browser test dispatches these fixture events; close removes old scopes.
class ControlledEventSource extends EventTarget {
  readonly readyState = 1
  readonly url: string
  onopen = null
  onerror = null
  onmessage: ((event: MessageEvent) => void) | null = null
  private readonly receive = (event: Event) => {
    const detail = (event as CustomEvent).detail as { learnerId: string; type: string; nodeId?: string }
    if (this.url.endsWith(`/${detail.learnerId}`)) {
      this.onmessage?.(new MessageEvent('message', { data: JSON.stringify(detail) }))
    }
  }

  constructor(url: string | URL) {
    super()
    this.url = String(url)
    window.addEventListener('learner-startup-fixture-sse', this.receive)
  }

  close() { window.removeEventListener('learner-startup-fixture-sse', this.receive) }
}
Object.defineProperty(window, 'EventSource', { configurable: true, value: ControlledEventSource })

const mathId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const physicsId = 'e6f2b9c1-7a3d-4e8f-9c2b-6d1e0f4a9b52'
const goal = (id: string, landscapeId: string, title: string, phase: string, children: string[] = []): UiGoal => ({
  id, landscapeId, title, phase,
  description: `Die lernende Person kann ${title.toLowerCase()}.`,
  themenfeld: '', area: 'Test', level: 1, core: true, weight: 1,
  tags: [], leitideen: [], kompetenzen: [], sourceRef: '', requires: [],
  contains: children, examples: [], type: children.length ? 'cluster' : 'atomic', nodeKind: 'tutor',
})
const mathRoot = goal('math-root', mathId, 'Mathematik', 'GLOBAL', ['math-sek-i', 'math-sek-ii'])
const physicsRoot = goal('physics-root', physicsId, 'Physik', 'GLOBAL', ['physics-sek-i', 'physics-sek-ii'])
const mathUpper = goal('math-upper', mathId, 'Ableitungen für Wachstumsmodelle deuten', 'SekII')
const physicsUpper = goal('physics-upper', physicsId, 'Elektrische Felder untersuchen', 'SekII')
const allGoals = new Map([
  mathRoot, physicsRoot,
  goal('math-sek-i', mathId, 'Sekundarstufe I', 'SekI', ['math-lower']),
  goal('math-sek-ii', mathId, 'Sekundarstufe II', 'SekII', [mathUpper.id]),
  goal('physics-sek-i', physicsId, 'Sekundarstufe I', 'SekI', ['physics-lower']),
  goal('physics-sek-ii', physicsId, 'Sekundarstufe II', 'SekII', [physicsUpper.id]),
  goal('math-lower', mathId, 'Lineare Gleichungen lösen', 'SekI'),
  goal('physics-lower', physicsId, 'Kräfte und Bewegung erklären', 'SekI'),
  mathUpper, physicsUpper,
].map((entry) => [entry.id, entry]))
const rootGoals = [mathRoot, physicsRoot]
const landscapes = [{ landscapeId: mathId, title: 'Mathematik' }, { landscapeId: physicsId, title: 'Physik' }]
const getMastery = () => 0

const Fixture = () => {
  const [learnerId, setLearnerId] = useState('fixture-learner-a')
  const [currentGoal, setCurrentGoal] = useState(mathUpper)
  const selectGoal = useCallback((id: string) => {
    const selected = allGoals.get(id)
    if (selected) setCurrentGoal(selected)
  }, [])
  const selectInLandscape = useCallback((_landscape: string, id: string) => selectGoal(id), [selectGoal])
  return (
    <div className="flex h-full flex-col">
      <button type="button" data-testid="fixture-switch-learner" onClick={() => {
        setLearnerId('fixture-learner-b')
        setCurrentGoal(physicsUpper)
      }}>Test: anderen Lernenden öffnen</button>
      <div className="min-h-0 flex-1">
        <LearnerView
          rootGoals={rootGoals}
          goalIndexAll={allGoals}
          getMastery={getMastery}
          currentGoal={currentGoal}
          onSelectGoal={selectGoal}
          onSelectGoalInLandscape={selectInLandscape}
          routeGoalId={currentGoal.id}
          skillpilotId={learnerId}
          landscapeId={CANONICAL_GYMNASIUM_ROOT_ID}
          rootLandscapeId={CANONICAL_GYMNASIUM_ROOT_ID}
          currentLandscapeHasMatchedCompositionView
          availableLandscapes={landscapes}
        />
      </div>
    </div>
  )
}

const element = document.getElementById('root')
if (!element) throw new Error('missing fixture root')
// Production mount semantics: StrictMode's development-only effect replay is
// deliberately not counted as an independent duplicate fetch here.
createRoot(element).render(
  <MemoryRouter initialEntries={['/learner/math-upper']}>
    <LanguageProvider><ThemeProvider><Fixture /></ThemeProvider></LanguageProvider>
  </MemoryRouter>,
)
