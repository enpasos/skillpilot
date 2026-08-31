/* eslint-disable react-refresh/only-export-components */
import React from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

import '../../src/index.css'
import { LearnerGoalFeedbackAction } from '../../src/components/LearnerGoalFeedbackAction'
import { LanguageProvider } from '../../src/contexts/LanguageContext'
import { ThemeProvider } from '../../src/contexts/ThemeContext'

const eligibleGoal = {
  id: 'cf474eab-1379-4877-907e-58b0892ce734',
  title: 'Natürliche Zahlen darstellen und am Zahlenstrahl verorten',
  landscapeId: '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced',
  type: 'atomic' as const,
  contains: [],
}

const FeedbackDestination = () => {
  const location = useLocation()
  return (
    <main className="p-4">
      <h1>Bestehender Feedbackweg</h1>
      <output data-testid="feedback-search">{location.search}</output>
      <output data-testid="feedback-state">{JSON.stringify(location.state)}</output>
    </main>
  )
}

const Fixture = () => (
  <MemoryRouter initialEntries={['/learner']}>
    <Routes>
      <Route
        path="/learner"
        element={(
          <main className="mx-auto w-full max-w-3xl p-4">
            <LearnerGoalFeedbackAction goal={eligibleGoal} />
            <LearnerGoalFeedbackAction
              goal={{
                ...eligibleGoal,
                id: 'memory-goal',
                title: 'Karteikarten üben',
                nodeKind: 'memory',
              }}
            />
            <LearnerGoalFeedbackAction
              goal={{
                ...eligibleGoal,
                id: 'exam-goal',
                title: 'Prüfungsaufgabe',
                nodeKind: 'exam',
                examData: {},
              }}
            />
            <LearnerGoalFeedbackAction
              goal={{
                ...eligibleGoal,
                id: 'orientation-goal',
                title: 'Orientierung',
                semanticKind: 'orientation',
              }}
            />
            <LearnerGoalFeedbackAction
              goal={{
                ...eligibleGoal,
                id: 'unpublished-goal',
                title: 'Nicht publiziertes Ziel',
                landscapeId: '99999999-9999-4999-8999-999999999999',
              }}
            />
          </main>
        )}
      />
      <Route path="/lernziel-feedback" element={<FeedbackDestination />} />
    </Routes>
  </MemoryRouter>
)

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('missing fixture root')

createRoot(rootElement).render(
  <LanguageProvider>
    <ThemeProvider>
      <Fixture />
    </ThemeProvider>
  </LanguageProvider>,
)
