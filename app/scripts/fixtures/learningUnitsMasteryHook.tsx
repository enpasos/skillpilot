import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { GoalCard } from '../../src/components/GoalCard'
import { LanguageProvider } from '../../src/contexts/LanguageContext'
import type { UiGoal } from '../../src/goalTypes'
import { useLearnerProgress } from '../../src/hooks/useLearnerProgress'

function Fixture() {
  const [learner, setLearner] = useState('snapshot-test')
  const [landscape, setLandscape] = useState('first')
  const [active, setActive] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const atom: UiGoal = { id: 'A', title: 'Projektion', description: '', phase: '', themenfeld: '', area: '', level: 1, core: true, weight: 1, leitideen: [], kompetenzen: [], sourceRef: '', requires: [], contains: [], examples: [] }
  const progress = useLearnerProgress({ landscapeEntries: ['first', 'second'].map(landscapeId => ({
    meta: { landscapeId, locale: 'de-DE', title: landscapeId, description: '', goals: [] }, goals: [],
  })), selectedLandscapeId: landscape, skillpilotId: learner })
  const practise = async (goalId: string) => {
    const response = await fetch(`/api/ui/learners/${learner}/active-goal`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ goalId, redirect: false }) })
    if (response.ok) setActive((await response.json()).activeGoal?.id === goalId)
  }
  return <main>
    <button onClick={() => void progress.refreshMastery()}>Refresh</button>
    <button onClick={() => progress.updateMasteryForCurrent(previous => ({ ...previous, Q: 0 }))}>Correct Q</button>
    <button onClick={() => setLearner('other-learner')}>Other learner</button>
    <button onClick={() => setLandscape('second')}>Other curriculum</button>
    <LanguageProvider><GoalCard goal={atom} masteryValue={progress.mastery.A ?? 0} showLearnerTools
      recognized={progress.learningUnits?.recognizedGoalIds.includes('A')} isActive={active}
      onSetActive={practise} onRevealActive={() => setRevealed(true)}
      onVoluntaryPractice={progress.learningUnits?.voluntaryGoalIds.includes('A') ? practise : undefined} /></LanguageProvider>
    <output data-testid="revealed">{String(revealed)}</output>
    <pre data-testid="snapshot">{JSON.stringify({ explicit: progress.explicitMastery, effective: progress.mastery, units: progress.learningUnits })}</pre>
  </main>
}
createRoot(document.getElementById('root')!).render(<Fixture />)
