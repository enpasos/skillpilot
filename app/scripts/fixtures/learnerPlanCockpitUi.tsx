/* eslint-disable react-refresh/only-export-components */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'

import '../../src/index.css'
import { LearnerPlanTodayOverview } from '../../src/components/LearnerPlanTodayOverview'
import { PersonalCurriculumSetup } from '../../src/components/PersonalCurriculumSetup'
import { LanguageProvider } from '../../src/contexts/LanguageContext'
import type { LearnerLearningPlanSummary } from '../../src/learnerLearningPlanTypes'
import {
  LearnerLearningPlanApiError,
  reconcileLearnerLearningPlans,
  switchLearnerLearningPlan,
} from '../../src/utils/learnerLearningPlanApi'
import { getLearnerLearningPlanCopy } from '../../src/utils/learnerLearningPlanCopy'
import { navigateToLearnerLearningPlanGoal } from '../../src/utils/learnerLearningPlanNavigation'
import { isLearnerPlanActionAvailable } from '../../src/utils/learnerLearningPlanReadModel'

const plan = (
  planId: string,
  landscapeId: string,
  label: string,
  openDueThroughToday: number,
  nextGoalId: string,
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
  metrics: {
    dueThroughToday: 6,
    completedDueThroughToday: 6 - openDueThroughToday,
    openDueThroughToday,
    dueToday: Math.min(2, openDueThroughToday),
    completedDueToday: 0,
    openDueToday: Math.min(2, openDueThroughToday),
    totalPlanned: 24,
  },
  buffer: { totalWorkdays: 5, remainingWorkdays: 5 },
  pace: { status: 'neutral', reason: 'mastery-history-not-event-backed' },
  nextEligibleGoal: { goalId: nextGoalId },
  continueReason: null,
  canContinue: true,
})

const PLANS = [
  plan('math-plan', 'math/sek-i', 'Mathematik bis Klasse 10', 2, 'math-goal-1'),
  plan('physics-plan', 'physics/sek-ii', 'Physik Oberstufe', 3, 'physics-goal-1'),
]

const Fixture = () => {
  const copy = getLearnerLearningPlanCopy('de')
  const location = useLocation()
  const navigate = useNavigate()
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null)
  const [activeLandscapeId, setActiveLandscapeId] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionsBlocked, setActionsBlocked] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const actionInFlightRef = useRef(false)
  const reconcileKeyRef = useRef<string | null>(null)
  const pendingFocusGoalRef = useRef<string | null>(null)
  const goalContentRef = useRef<HTMLDivElement | null>(null)
  const currentLandscapeId = new URLSearchParams(location.search).get('l') ?? 'math/sek-i'
  const selectedGoalId = location.pathname.split('/').at(-1) ?? ''
  const planKey = useMemo(
    () => `2026-09-04|${PLANS.map((entry) => `${entry.planId}:${entry.revision}`).join('|')}`,
    [],
  )

  const selectGoal = useCallback((goalId: string) => {
    navigate(`/learner/${goalId}${location.search}`)
  }, [location.search, navigate])
  const selectGoalInLandscape = useCallback((landscapeId: string, goalId: string) => {
    const params = new URLSearchParams(location.search)
    params.set('l', landscapeId)
    navigate(`/learner/${goalId}?${params.toString()}`)
  }, [location.search, navigate])
  const applyTarget = useCallback((landscapeId: string, goalId: string) => {
    setActiveLandscapeId(landscapeId)
    setActiveGoalId(goalId)
    pendingFocusGoalRef.current = goalId
    if (!navigateToLearnerLearningPlanGoal(
      currentLandscapeId,
      { landscapeId, activeGoalId: goalId },
      { selectGoal, selectGoalInLandscape },
    )) {
      throw new Error('navigation-unavailable')
    }
  }, [currentLandscapeId, selectGoal, selectGoalInLandscape])

  useEffect(() => {
    const pendingGoalId = pendingFocusGoalRef.current
    if (!pendingGoalId || pendingGoalId !== selectedGoalId) return
    const frame = window.requestAnimationFrame(() => {
      if (pendingFocusGoalRef.current !== pendingGoalId) return
      goalContentRef.current?.scrollIntoView({ block: 'start' })
      goalContentRef.current?.focus({ preventScroll: true })
      pendingFocusGoalRef.current = null
    })
    return () => window.cancelAnimationFrame(frame)
  }, [selectedGoalId])

  useEffect(() => {
    if (activeGoalId || reconcileKeyRef.current === planKey || actionInFlightRef.current) return
    reconcileKeyRef.current = planKey
    actionInFlightRef.current = true
    setActionId('reconcile')
    void reconcileLearnerLearningPlans('learner-42', { asOf: '2026-09-04' })
      .then((result) => {
        if (result?.activeGoalId && result.landscapeId) {
          applyTarget(result.landscapeId, result.activeGoalId)
        }
        setActionsBlocked(false)
      })
      .catch(() => {
        setActionsBlocked(true)
        setActionError(copy.reconcileFailed)
      })
      .finally(() => {
        actionInFlightRef.current = false
        setActionId(null)
      })
  }, [activeGoalId, applyTarget, copy.reconcileFailed, planKey])

  const switchPlan = async (planId: string) => {
    const targetPlan = PLANS.find((entry) => entry.planId === planId)
    if (!targetPlan || actionInFlightRef.current || actionsBlocked) return
    actionInFlightRef.current = true
    setActionId(planId)
    setActionError(null)
    try {
      const result = await switchLearnerLearningPlan('learner-42', planId, {
        expectedRevision: targetPlan.revision,
        asOf: '2026-09-04',
      })
      if (!result?.activeGoalId || !result.landscapeId) throw new Error('missing-target')
      applyTarget(result.landscapeId, result.activeGoalId)
      setActionsBlocked(false)
    } catch (error) {
      setActionError(
        error instanceof LearnerLearningPlanApiError && (error.status === 409 || error.status === 412)
          ? copy.continueConflict
          : copy.switchFailed,
      )
    } finally {
      actionInFlightRef.current = false
      setActionId(null)
    }
  }

  const continueLearning = () => {
    if (!activeGoalId || !activeLandscapeId) return
    pendingFocusGoalRef.current = activeGoalId
    if (selectedGoalId === activeGoalId) {
      goalContentRef.current?.scrollIntoView({ block: 'start' })
      goalContentRef.current?.focus({ preventScroll: true })
      pendingFocusGoalRef.current = null
      return
    }
    applyTarget(activeLandscapeId, activeGoalId)
  }

  return (
    <main data-testid="cockpit-fixture" className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
      <output data-testid="cockpit-route">{`${location.pathname}${location.search}`}</output>
      <output data-testid="mastery-snapshot">math-goal-1:0.5;physics-goal-1:0</output>
      <output data-testid="retry-count">{retryCount}</output>
      <LearnerPlanTodayOverview
        plans={PLANS}
        language="de"
        planModeEnabled
        subjectLabel={(landscapeId) => landscapeId.startsWith('math') ? 'Mathematik' : 'Physik'}
        goalLabel={(goalId) => goalId === 'math-goal-1'
          ? 'Lineare Gleichungen lösen'
          : 'Kräfte und Bewegung erklären'}
        activeGoalId={activeGoalId}
        activeLandscapeId={activeLandscapeId}
        actionsDisabled={actionsBlocked}
        isReconciling={actionId === 'reconcile'}
        switchingPlanId={actionId === 'reconcile' ? null : actionId}
        actionError={actionError ?? undefined}
        onContinue={continueLearning}
        onSwitch={(planId) => { void switchPlan(planId) }}
        onOpenSettings={() => undefined}
        onRetry={() => {
          setRetryCount((count) => count + 1)
          setActionError(null)
          setActionsBlocked(false)
        }}
      />
      <div aria-hidden="true" className="h-[900px]" />
      <div
        ref={goalContentRef}
        data-testid="learner-current-goal"
        tabIndex={-1}
        className="rounded-xl border border-border-color bg-sidebar-bg p-6 focus:outline-none focus:ring-2 focus:ring-sky-500"
      >
        Aktives Lernziel: {selectedGoalId}
      </div>
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
    <section data-testid="in-flight-refresh-fixture" className="mx-auto mt-8 max-w-3xl p-4">
      <output data-testid="in-flight-status">{loadStatus}</output>
      <button type="button" onClick={beginRefresh}>Aktualisierung starten</button>
      <button type="button" onClick={() => releaseRef.current?.()}>Aktualisierung abschließen</button>
      <LearnerPlanTodayOverview
        plans={[PLANS[0]]}
        language="de"
        planModeEnabled
        subjectLabel={() => 'Mathematik'}
        goalLabel={() => 'Lineare Gleichungen lösen'}
        activeGoalId="math-goal-1"
        activeLandscapeId="math/sek-i"
        actionsDisabled={!isLearnerPlanActionAvailable(loadStatus)}
        onContinue={() => undefined}
        onSwitch={() => undefined}
        onOpenSettings={() => undefined}
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
  <MemoryRouter initialEntries={['/learner/overview?l=math%2Fsek-i']}>
    <LanguageProvider>
      <PreferenceSyncFixture />
      <Fixture />
      <InFlightRefreshFixture />
    </LanguageProvider>
  </MemoryRouter>,
)
