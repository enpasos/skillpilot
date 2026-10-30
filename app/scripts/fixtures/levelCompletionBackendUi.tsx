/* eslint-disable react-refresh/only-export-components */
import React, { useCallback, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, useLocation } from 'react-router-dom'
import '../../src/index.css'
import { SessionSetup } from '../../src/components/SessionSetup'
import { LanguageProvider } from '../../src/contexts/LanguageContext'
import { ThemeProvider } from '../../src/contexts/ThemeContext'
import type { UiGoal } from '../../src/goalTypes'
import { LearnerView } from '../../src/views/LearnerView'

const learner = new URLSearchParams(window.location.search).get('learner') ?? ''
if (!/^completion-browser-[a-f0-9-]{36}$/u.test(learner)) throw new Error('Synthetic test learner required')
const rootId = 'a0e13c56-c25f-4742-9272-3a1a603ee52e'
const mathId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const preparationId = '3016ec37-1c2e-47db-83f5-e767923bc97e'
const examId = 'e98672c6-871a-5d0b-889c-5afc51040f0d'
// Only the surrounding navigation tree is reduced. Completion state, profile,
// actions, conflicts and provider sessions use the real HTTP backend unchanged.
const goal = (id: string, title: string, children: string[] = []): UiGoal => ({
  id, title, landscapeId: mathId, description: title, phase: 'Q2', themenfeld: '', area: 'Geometrie',
  level: 1, core: true, weight: 1, tags: [], leitideen: [], kompetenzen: [], sourceRef: '',
  requires: [], contains: children, examples: [], type: children.length ? 'cluster' : 'atomic', nodeKind: 'tutor',
})
const math = goal(mathId, 'Mathematik', [preparationId, examId])
math.tags = ['root']
const preparation = goal(preparationId, 'Skalarprodukt und orthogonale Projektion')
const exam = goal(examId, 'Skalarprodukt prüfen')
const goals = new Map([math, preparation, exam].map((entry) => [entry.id, entry]))
const roots = [math]
const landscapes = [{ landscapeId: mathId, title: 'Mathematik' }]
const getMastery = () => 0

const Fixture = () => {
  const location = useLocation()
  const [role, setRole] = useState<'learner' | 'trainer' | 'explorer' | null>('learner')
  const [learnerId, setLearnerId] = useState(learner)
  const [currentGoal, setCurrentGoal] = useState(preparation)
  const select = useCallback((id: string) => {
    const selected = goals.get(id)
    if (selected) setCurrentGoal(selected)
  }, [])
  const selectInLandscape = useCallback((_landscape: string, id: string) => select(id), [select])
  if (location.pathname === '/') return <SessionSetup role={role} setRole={setRole}
    skillpilotId={learnerId} setSkillpilotId={setLearnerId} onStart={() => undefined} />
  return <LearnerView rootGoals={roots} goalIndexAll={goals} getMastery={getMastery}
    currentGoal={currentGoal} onSelectGoal={select} onSelectGoalInLandscape={selectInLandscape}
    routeGoalId={currentGoal.id} skillpilotId={learnerId} landscapeId={rootId} rootLandscapeId={rootId}
    currentLandscapeHasMatchedCompositionView availableLandscapes={landscapes} />
}

const element = document.getElementById('root')
if (!element) throw new Error('Missing fixture root')
createRoot(element).render(<MemoryRouter initialEntries={[`/learner/${preparationId}`]}>
  <LanguageProvider><ThemeProvider><Fixture /></ThemeProvider></LanguageProvider>
</MemoryRouter>)
