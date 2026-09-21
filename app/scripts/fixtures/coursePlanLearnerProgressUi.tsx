/* eslint-disable react-refresh/only-export-components */
import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../../src/index.css'
import { CoursePlanLearnerProgress } from '../../src/components/CoursePlanLearnerProgress'
import { dispatchLearnerUiRefresh } from '../../src/utils/learnerUiEvents'

const Fixture = () => {
  const [learnerId, setLearnerId] = useState('learner-a')
  const [landscapeId, setLandscapeId] = useState('math')
  const [mode, setMode] = useState<'single' | 'class' | 'empty'>('single')
  const [language, setLanguage] = useState<'de' | 'en'>('de')
  const learners = mode === 'empty' ? [] : mode === 'class'
    ? ['a', 'b', 'c', 'd', 'e', 'f'].map((suffix) => ({ id: `learner-${suffix}`, name: `Person ${suffix.toUpperCase()}` }))
    : [{ id: learnerId, name: learnerId === 'learner-a' ? 'Person A' : 'Person B' }]
  return <main className="mx-auto max-w-3xl space-y-3 p-4">
    <div className="flex flex-wrap gap-3">
      <button onClick={() => setLearnerId((value) => value === 'learner-a' ? 'learner-b' : 'learner-a')}>Switch learner</button>
      <button onClick={() => setLandscapeId((value) => value === 'math' ? 'physics' : 'math')}>Switch subject</button>
      <button onClick={() => setMode('class')}>Show class</button>
      <button onClick={() => setMode('empty')}>Empty class</button>
      <button onClick={() => setLanguage((value) => value === 'de' ? 'en' : 'de')}>Switch language</button>
      <button onClick={() => dispatchLearnerUiRefresh({ skillpilotId: learnerId, targets: ['tree'] })}>Refresh event</button>
      <button onClick={() => dispatchLearnerUiRefresh({ skillpilotId: 'unrelated-learner' })}>Unrelated event</button>
    </div>
    <p>Stable planning snapshot: 598 open goals</p>
    <CoursePlanLearnerProgress learners={learners} landscapeId={landscapeId} language={language} />
  </main>
}

createRoot(document.getElementById('root')!).render(<Fixture />)
