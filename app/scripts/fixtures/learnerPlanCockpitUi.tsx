/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'

import '../../src/index.css'
import { LearnerPlanTodayCard } from '../../src/components/LearnerPlanTodayCard'
import { PersonalCurriculumSetup } from '../../src/components/PersonalCurriculumSetup'
import { LanguageProvider } from '../../src/contexts/LanguageContext'
import type { LearnerLearningPlanSummary } from '../../src/learnerLearningPlanTypes'
import { navigateToLearnerLearningPlanGoal } from '../../src/utils/learnerLearningPlanNavigation'
import { isLearnerPlanActionAvailable } from '../../src/utils/learnerLearningPlanReadModel'

const plan = (
  planId: string,
  landscapeId: string,
  label: string,
  canContinue: boolean,
): LearnerLearningPlanSummary => ({
  planId,
  revision: 4,
  landscapeId,
  planLabel: label,
  stale: false,
  period: { startDate: '2026-09-01', endDate: '2027-06-30' },
  currentBlock: {
    blockId: `${planId}-current`,
    kind: 'learning',
    title: 'Aktueller Lernabschnitt',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
  },
  nextMilestone: null,
  metrics: canContinue
    ? { dueThroughToday: 6, completedDueThroughToday: 4, openDueThroughToday: 2, dueToday: 2, completedDueToday: 0, openDueToday: 2, totalPlanned: 24 }
    : { dueThroughToday: 4, completedDueThroughToday: 4, openDueThroughToday: 0, dueToday: 1, completedDueToday: 1, openDueToday: 0, totalPlanned: 18 },
  buffer: { totalWorkdays: 5, remainingWorkdays: 5 },
  pace: { status: 'neutral', reason: 'mastery-history-not-event-backed' },
  nextEligibleGoal: canContinue ? { goalId: 'physics-goal-1' } : null,
  continueReason: canContinue ? null : 'no-open-due-frontier-goal',
  canContinue,
})

const Fixture = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const currentLandscapeId = new URLSearchParams(location.search).get('l') ?? 'math/sek-i'
  const selectGoal = (goalId: string) => navigate(`/learner/${goalId}${location.search}`)
  const selectGoalInLandscape = (landscapeId: string, goalId: string) => {
    const params = new URLSearchParams(location.search)
    params.set('l', landscapeId)
    navigate(`/learner/${goalId}?${params.toString()}`)
  }

  return (
    <main data-testid="cockpit-fixture" className="mx-auto flex max-w-5xl flex-col gap-4 p-4">
      <output data-testid="cockpit-route">{`${location.pathname}${location.search}`}</output>
      <button
        type="button"
        onClick={() => navigateToLearnerLearningPlanGoal(
          currentLandscapeId,
          { landscapeId: 'physics/sek-ii', activeGoalId: 'physics-auto-goal' },
          { selectGoal, selectGoalInLandscape },
        )}
      >
        Automatischen Plan-Handoff simulieren
      </button>
      <LearnerPlanTodayCard
        plan={plan('math-plan', 'math/sek-i', 'Mathematik bis Klasse 10', false)}
        subjectLabel="Mathematik"
        language="de"
        planModeEnabled
        onContinue={() => undefined}
      />
      <LearnerPlanTodayCard
        plan={plan('physics-plan', 'physics/sek-ii', 'Physik Oberstufe', true)}
        subjectLabel="Physik"
        language="de"
        planModeEnabled
        onContinue={() => navigateToLearnerLearningPlanGoal(
          currentLandscapeId,
          { landscapeId: 'physics/sek-ii', activeGoalId: 'physics-goal-1' },
          { selectGoal, selectGoalInLandscape },
        )}
      />
    </main>
  )
}

const InFlightRefreshFixture = () => {
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready'>('ready')
  const releaseRef = useRef<(() => void) | null>(null)

  const beginRefresh = () => {
    setLoadStatus('loading')
    void new Promise<void>((resolve) => {
      releaseRef.current = resolve
    }).then(() => {
      releaseRef.current = null
      setLoadStatus('ready')
    })
  }

  return (
    <section data-testid="in-flight-refresh-fixture">
      <output data-testid="in-flight-status">{loadStatus}</output>
      <button type="button" onClick={beginRefresh}>Aktualisierung starten</button>
      <button type="button" onClick={() => releaseRef.current?.()}>Aktualisierung abschließen</button>
      <LearnerPlanTodayCard
        plan={plan('deferred-plan', 'math/sek-i', 'Gespeicherter Stand', true)}
        subjectLabel="Mathematik"
        language="de"
        planModeEnabled
        actionsDisabled={!isLearnerPlanActionAvailable(loadStatus)}
        onContinue={() => undefined}
      />
    </section>
  )
}

const PreferenceSyncFixture = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [backendFollowLearningPlans, setBackendFollowLearningPlans] = useState(false)
  const [appliedFollowLearningPlans, setAppliedFollowLearningPlans] = useState<boolean | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setBackendFollowLearningPlans(true), 50)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>Einstellungen öffnen</button>
      <output data-testid="plan-mode-backend-prop">{String(backendFollowLearningPlans)}</output>
      <output data-testid="plan-mode-applied">{String(appliedFollowLearningPlans)}</output>
      <PersonalCurriculumSetup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        availableLandscapes={[]}
        initialFollowLearningPlans={backendFollowLearningPlans}
        onApply={(_config, preferences) => {
          setAppliedFollowLearningPlans(preferences.followLearningPlans)
        }}
      />
    </>
  )
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('missing fixture root')

createRoot(rootElement).render(
  <MemoryRouter initialEntries={['/learner/math-goal-1?l=math%2Fsek-i']}>
    <LanguageProvider>
      <PreferenceSyncFixture />
      <Fixture />
      <InFlightRefreshFixture />
    </LanguageProvider>
  </MemoryRouter>,
)
