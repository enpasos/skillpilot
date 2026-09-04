import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { LearnerPlanTodayOverview } from '../src/components/LearnerPlanTodayOverview'
import type { LearnerLearningPlanSummary } from '../src/learnerLearningPlanTypes'

const plan = (
  planId: string,
  landscapeId: string,
  openDueThroughToday: number,
  nextGoalId: string | null,
): LearnerLearningPlanSummary => ({
  planId,
  revision: 3,
  landscapeId,
  planLabel: landscapeId === 'math' ? 'Mathematik bis zum Abitur' : 'Physik bis zum Abitur',
  stale: false,
  period: { startDate: '2026-09-01', endDate: '2027-04-30' },
  currentBlock: {
    blockId: `${planId}-analysis`,
    kind: 'learning',
    title: landscapeId === 'math' ? 'Analysis' : 'Mechanik',
    startDate: '2026-09-01',
    endDate: '2026-09-18',
  },
  nextMilestone: {
    blockId: `${planId}-test`,
    title: 'Klausur',
    date: '2026-09-25',
  },
  metrics: {
    dueThroughToday: 12,
    completedDueThroughToday: 12 - openDueThroughToday,
    openDueThroughToday,
    dueToday: 3,
    completedDueToday: Math.max(0, 3 - Math.min(3, openDueThroughToday)),
    openDueToday: Math.min(3, openDueThroughToday),
    totalPlanned: 42,
  },
  buffer: { totalWorkdays: 8, remainingWorkdays: 6 },
  pace: { status: 'neutral', reason: 'mastery-history-not-event-backed' },
  nextEligibleGoal: nextGoalId ? { goalId: nextGoalId } : null,
  continueReason: nextGoalId ? null : 'no-open-due-frontier-goal',
  canContinue: Boolean(nextGoalId),
})

const math = plan('plan-math', 'math', 5, 'analysis-next')
const physics = plan('plan-physics', 'physics', 3, 'mechanics-next')
const subjectLabels = new Map([['math', 'Mathematik'], ['physics', 'Physik']])
const goalLabels = new Map([
  ['analysis-current', 'Ableitungsregeln anwenden'],
  ['analysis-next', 'Kurvendiskussion'],
  ['mechanics-next', 'Kräfte addieren'],
])

const enabledMarkup = renderToStaticMarkup(
  <LearnerPlanTodayOverview
    plans={[math, physics]}
    language="de"
    planModeEnabled
    subjectLabel={(id) => subjectLabels.get(id) ?? id}
    goalLabel={(id) => goalLabels.get(id)}
    activeGoalId="analysis-current"
    activeLandscapeId="math"
    onContinue={() => undefined}
    onSwitch={() => undefined}
    onOpenSettings={() => undefined}
  />,
)

assert.match(enabledMarkup, /<section[^>]+data-testid="learner-plan-today-overview"[^>]+aria-labelledby="[^"]+"[^>]+aria-describedby="[^"]+"/u)
assert.match(enabledMarkup, />Heute</u)
assert.match(enabledMarkup, /8 Planziele sind bis heute noch offen/u)
assert.match(enabledMarkup, /Rückstände aus früheren Tagen sind mitgezählt/u)
assert.match(enabledMarkup, /2 gültige Fachpläne/u)
assert.match(enabledMarkup, /Du lernst gerade · Mathematik/u)
assert.match(enabledMarkup, /Ableitungsregeln anwenden/u)
assert.match(enabledMarkup, /data-testid="learner-plan-continue"/u)
assert.match(enabledMarkup, />Weiterlernen</u)
assert.match(enabledMarkup, /Mathematik/u)
assert.match(enabledMarkup, /Physik/u)
assert.match(enabledMarkup, /Aktuelles Fach/u)
assert.match(enabledMarkup, /Zu Physik wechseln/u)
assert.equal((enabledMarkup.match(/data-testid="learner-plan-switch"/gu) ?? []).length, 1)
assert.equal((enabledMarkup.match(/<details/gu) ?? []).length, 2)
assert.match(enabledMarkup, /Plandetails: Mathematik/u)
assert.match(enabledMarkup, /Analysis/u)
assert.match(enabledMarkup, /Klausur/u)
assert.match(enabledMarkup, /6 von 8 Werktagen verbleiben/u)
assert.doesNotMatch(enabledMarkup, /Tempo der letzten 7 Tage/u)
assert.doesNotMatch(enabledMarkup, /Nächstes Planziel starten/u)
assert.doesNotMatch(enabledMarkup, /learner-plan-pace-neutral/u)

const reconcilingMarkup = renderToStaticMarkup(
  <LearnerPlanTodayOverview
    plans={[math, physics]}
    language="de"
    planModeEnabled
    subjectLabel={(id) => subjectLabels.get(id) ?? id}
    goalLabel={(id) => goalLabels.get(id)}
    isReconciling
    actionsDisabled
    onContinue={() => undefined}
    onSwitch={() => undefined}
    onOpenSettings={() => undefined}
  />,
)
assert.match(reconcilingMarkup, /SkillPilot wählt dein nächstes fälliges Lernziel aus/u)
assert.doesNotMatch(reconcilingMarkup, /data-testid="learner-plan-continue"/u)
assert.doesNotMatch(reconcilingMarkup, /Nächstes Planziel starten/u)

const stale = { ...physics, planId: 'stale-physics', stale: true }
const staleMarkup = renderToStaticMarkup(
  <LearnerPlanTodayOverview
    plans={[math, stale]}
    language="de"
    planModeEnabled
    subjectLabel={(id) => subjectLabels.get(id) ?? id}
    goalLabel={(id) => goalLabels.get(id)}
    staleDataMessage="Angezeigt wird der letzte Stand vom 01.09.2026."
    actionError="Das nächste Planziel konnte nicht automatisch ausgewählt werden."
    onContinue={() => undefined}
    onSwitch={() => undefined}
    onOpenSettings={() => undefined}
    onRetry={() => undefined}
  />,
)
assert.match(staleMarkup, /5 Planziele sind bis heute noch offen/u, 'stale plans do not inflate the combined count')
assert.match(staleMarkup, /Plan veraltet/u)
assert.match(staleMarkup, /letzte Stand vom 01\.09\.2026/u)
assert.match(staleMarkup, /konnte nicht automatisch ausgewählt werden/u)
assert.match(staleMarkup, />Erneut versuchen</u)
assert.match(staleMarkup, /data-testid="learner-plan-switch" disabled=""/u)

const disabledModeMarkup = renderToStaticMarkup(
  <LearnerPlanTodayOverview
    plans={[math, physics]}
    language="de"
    planModeEnabled={false}
    subjectLabel={(id) => subjectLabels.get(id) ?? id}
    goalLabel={(id) => goalLabels.get(id)}
    activeGoalId="analysis-current"
    activeLandscapeId="math"
    onContinue={() => undefined}
    onSwitch={() => undefined}
    onOpenSettings={() => undefined}
  />,
)
assert.match(disabledModeMarkup, /Planmodus ist ausgeschaltet/u)
assert.match(disabledModeMarkup, /Einstellungen öffnen/u)
assert.doesNotMatch(disabledModeMarkup, /data-testid="learner-plan-continue"/u)
assert.doesNotMatch(disabledModeMarkup, /data-testid="learner-plan-switch"/u)

const blockedPhysics = {
  ...physics,
  nextEligibleGoal: null,
  canContinue: false,
  continueReason: 'no-open-due-frontier-goal' as const,
}
const blockedMarkup = renderToStaticMarkup(
  <LearnerPlanTodayOverview
    plans={[blockedPhysics]}
    language="de"
    planModeEnabled
    subjectLabel={(id) => subjectLabels.get(id) ?? id}
    goalLabel={(id) => goalLabels.get(id)}
    onContinue={() => undefined}
    onSwitch={() => undefined}
    onOpenSettings={() => undefined}
  />,
)
assert.match(blockedMarkup, /Voraussetzungen fehlen noch/u)
assert.match(blockedMarkup, /Lernvoraussetzungen sind noch nicht erfüllt/u)
assert.doesNotMatch(blockedMarkup, /data-testid="learner-plan-switch"/u)

const englishMarkup = renderToStaticMarkup(
  <LearnerPlanTodayOverview
    plans={[math, physics]}
    language="en"
    planModeEnabled
    subjectLabel={(id) => id === 'math' ? 'Mathematics' : 'Physics'}
    goalLabel={(id) => goalLabels.get(id)}
    activeGoalId="analysis-current"
    activeLandscapeId="math"
    onContinue={() => undefined}
    onSwitch={() => undefined}
    onOpenSettings={() => undefined}
  />,
)
assert.match(englishMarkup, /8 planned goals are still open through today/u)
assert.match(englishMarkup, /Switch to Physics/u)
assert.match(englishMarkup, /Continue learning/u)
assert.doesNotMatch(englishMarkup, /Pace over the last 7 days/u)

console.log('Learner plan today overview UI tests passed')
