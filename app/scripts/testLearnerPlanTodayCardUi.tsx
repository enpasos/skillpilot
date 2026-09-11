import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { LearnerPlanTodayOverview } from '../src/components/LearnerPlanTodayOverview'
import { LearnerPlanTodayCard } from '../src/components/LearnerPlanTodayCard'
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
assert.match(enabledMarkup, /Noch 6 Lernziele bis zu deinen heutigen Tageszielen/u)
assert.match(enabledMarkup, /Auch ein heute abgeschlossenes Ziel aus früheren Tagen zählt für dein Tagesziel/u)
assert.match(enabledMarkup, /<progress[^>]+aria-label="Tagesziel: Mathematik"[^>]+value="0"[^>]+max="3"/u)
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
assert.match(staleMarkup, /Noch 3 Lernziele bis zu deinen heutigen Tageszielen/u, 'stale plans do not inflate the combined count')
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
assert.match(englishMarkup, /6 learning goals left to reach your daily targets/u)
assert.match(englishMarkup, /Switch to Physics/u)
assert.match(englishMarkup, /Continue learning/u)
assert.doesNotMatch(englishMarkup, /Pace over the last 7 days/u)

const quotaDoneWithBacklog = {
  ...math,
  metrics: { ...math.metrics, completedDueToday: 3, openDueToday: 0, extraCompletedToday: 2 },
}
for (const language of ['de', 'en'] as const) {
  const markup = renderToStaticMarkup(
    <LearnerPlanTodayOverview
      plans={[quotaDoneWithBacklog]}
      language={language}
      planModeEnabled
      subjectLabel={() => language === 'de' ? 'Mathematik' : 'Mathematics'}
      goalLabel={() => 'Next goal'}
      onContinue={() => undefined}
      onSwitch={() => undefined}
      onOpenSettings={() => undefined}
    />,
  )
  assert.match(markup, /value="3" max="3"/u, 'bonus does not inflate the daily progress bar')
  assert.match(markup, language === 'de' ? /Deine Tagesziele sind erreicht/u : /You have reached your daily targets/u)
  assert.match(markup, language === 'de' ? /Zusätzlich 2 Lernziele geschafft/u : /2 extra learning goals completed/u)
  assert.match(markup, language === 'de' ? /Freiwillig weiter in Mathematik/u : /Keep learning voluntarily in Mathematics/u)
  assert.doesNotMatch(markup, /Lernvoraussetzungen sind noch nicht erfüllt|learning prerequisites are not yet met/u)
  assert.doesNotMatch(markup, /<details[^>]+open/u, 'backlog starts collapsed')
}

const standaloneDone = renderToStaticMarkup(
  <LearnerPlanTodayCard plan={quotaDoneWithBacklog} subjectLabel="Mathematik" language="de" planModeEnabled onContinue={() => undefined} />,
)
assert.match(standaloneDone, /Tagesziel erreicht!/u)
assert.match(standaloneDone, /Freiwillig weiterlernen/u)
assert.match(standaloneDone, /<details/u)
assert.doesNotMatch(standaloneDone, /<details[^>]+open/u)

const blockedExtra = renderToStaticMarkup(
  <LearnerPlanTodayOverview
    plans={[{ ...quotaDoneWithBacklog, nextEligibleGoal: null, canContinue: false, continueReason: 'no-open-due-frontier-goal' }]}
    language="de" planModeEnabled subjectLabel={() => 'Mathematik'} goalLabel={() => undefined}
    onContinue={() => undefined} onSwitch={() => undefined} onOpenSettings={() => undefined}
  />,
)
assert.match(blockedExtra, /Deine Tagesziele sind erreicht/u)
assert.doesNotMatch(blockedExtra, /Voraussetzungen|data-testid="learner-plan-switch"/u)

const noQuota = renderToStaticMarkup(
  <LearnerPlanTodayOverview
    plans={[{ ...quotaDoneWithBacklog, metrics: { ...quotaDoneWithBacklog.metrics, dueToday: 0, completedDueToday: 0, extraCompletedToday: 0 } }]}
    language="de" planModeEnabled subjectLabel={() => 'Mathematik'} goalLabel={() => undefined}
    onContinue={() => undefined} onSwitch={() => undefined} onOpenSettings={() => undefined}
  />,
)
assert.match(noQuota, /Heute ist kein Tagespensum geplant/u)
assert.doesNotMatch(noQuota, /<progress|Tagesziel erreicht/u, 'a free day does not fabricate completed work')

const noNavigation = renderToStaticMarkup(
  <LearnerPlanTodayOverview
    plans={[quotaDoneWithBacklog]} navigationAvailable={() => false}
    language="de" planModeEnabled subjectLabel={() => 'Mathematik'} goalLabel={() => undefined}
    onContinue={() => undefined} onSwitch={() => undefined} onOpenSettings={() => undefined}
  />,
)
assert.doesNotMatch(noNavigation, /data-testid="learner-plan-switch"/u, 'voluntary work retains the navigation gate')

console.log('Learner plan today overview UI tests passed')
