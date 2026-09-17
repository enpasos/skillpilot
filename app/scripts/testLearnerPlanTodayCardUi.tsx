import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { LearnerPlanTodayOverview } from '../src/components/LearnerPlanTodayOverview'
import type {
  LearnerLearningPlanSummary,
  LearnerPlanStatus,
  LearnerPlanSubjectStatus,
} from '../src/learnerLearningPlanTypes'

const plan = (
  planId: string,
  landscapeId: string,
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
  nextMilestone: { blockId: `${planId}-test`, title: 'Klausur', date: '2026-09-25' },
  metrics: {
    dueThroughToday: 12,
    completedDueThroughToday: 7,
    openDueThroughToday: 5,
    dueToday: 3,
    completedDueToday: 0,
    openDueToday: 3,
    totalPlanned: 42,
  },
  buffer: { totalWorkdays: 8, remainingWorkdays: 6 },
  pace: { status: 'neutral', reason: 'mastery-history-not-event-backed' },
  nextEligibleGoal: nextGoalId ? { goalId: nextGoalId } : null,
  continueReason: nextGoalId ? null : 'no-open-due-frontier-goal',
  canContinue: Boolean(nextGoalId),
})

const subject = (
  subjectKey: string,
  subjectLabel: string,
  periodText: string,
  planStatusText: string,
  statusDirection: 'behind' | 'on_track' | 'ahead',
  extra: Partial<LearnerPlanSubjectStatus> = {},
): LearnerPlanSubjectStatus => ({
  subjectKey,
  subjectLabel,
  evaluable: true,
  periodText,
  planStatusText,
  subjectLine: `${subjectLabel}: ${periodText} · ${planStatusText}`,
  statusDirection,
  current: false,
  canContinue: true,
  ...extra,
})

const status = (subjects: LearnerPlanSubjectStatus[], overrides: Partial<LearnerPlanStatus> = {}): LearnerPlanStatus => ({
  asOf: '2026-09-04',
  periodBasis: 'DAY',
  periodStart: '2026-09-04',
  periodEnd: '2026-09-04',
  timeZone: 'Europe/Berlin',
  language: 'de',
  evaluable: subjects.every((entry) => entry.evaluable),
  statusText: subjects.map((entry) => entry.subjectLine ?? '').filter(Boolean).join('\n'),
  statusDirection: 'behind',
  activeGoal: null,
  followLearningPlans: true,
  resumeAvailable: true,
  subjects,
  unavailablePlanCount: 0,
  ...overrides,
})

const math = plan('plan-math', 'math', 'analysis-next')
const physics = plan('plan-physics', 'physics', 'mechanics-next')
const subjectLabels = new Map([['math', 'Mathematik'], ['physics', 'Physik']])
const goalLabels = new Map([
  ['analysis-current', 'Ableitungsregeln anwenden'],
  ['analysis-next', 'Kurvendiskussion'],
  ['mechanics-next', 'Kräfte addieren'],
])

const mathsBehind = subject('mathematik', 'Mathematik', 'Tagesziel 0 von 3', '2 Lernziele im Rückstand', 'behind', { current: true })
const physicsOnTrack = subject('physik', 'Physik', 'Tagesziel 1 von 2', 'im Plan', 'on_track')

const enabledMarkup = renderToStaticMarkup(
  <LearnerPlanTodayOverview
    status={status([mathsBehind, physicsOnTrack])}
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

assert.match(enabledMarkup, /<section[^>]+data-testid="learner-plan-today-overview"[^>]+aria-labelledby="[^"]+"/u)
// The description only exists while there is a notice to describe.
assert.doesNotMatch(enabledMarkup, /aria-describedby/u)
assert.match(enabledMarkup, />Heute</u)
// Every visible status string comes from the backend verbatim, one line per subject,
// with the period text and the plan-status label rendered as delivered.
assert.match(enabledMarkup, /Tagesziel 0 von 3/u)
assert.match(enabledMarkup, /2 Lernziele im Rückstand/u)
assert.match(enabledMarkup, /Tagesziel 1 von 2/u)
assert.match(enabledMarkup, />im Plan</u)
// The combined text is not repeated on top of the rows.
assert.doesNotMatch(enabledMarkup, /Mathematik: Tagesziel 0 von 3 · 2 Lernziele im Rückstand/u)
// The colour comes from the delivered direction only.
assert.match(enabledMarkup, /data-status-direction="behind"/u)
assert.match(enabledMarkup, /data-status-direction="on_track"/u)
// No count, progress bar or locally derived balance survives anywhere in the cockpit.
assert.doesNotMatch(enabledMarkup, /<progress/u)
assert.doesNotMatch(enabledMarkup, /Bis heute insgesamt|Zusätzlich|Tempo der letzten 7 Tage|gültige Fachpläne/u)
assert.match(enabledMarkup, /Du lernst gerade · Mathematik/u)
assert.match(enabledMarkup, /Ableitungsregeln anwenden/u)
assert.match(enabledMarkup, /data-testid="learner-plan-continue"/u)
assert.match(enabledMarkup, />Weiterlernen</u)
assert.match(enabledMarkup, /Aktuelles Fach/u)
assert.match(enabledMarkup, /Zu Physik wechseln/u)
assert.equal((enabledMarkup.match(/data-testid="learner-plan-switch"/gu) ?? []).length, 1)
assert.match(enabledMarkup, /Plandetails: Mathematik/u)
assert.match(enabledMarkup, /Analysis/u)
assert.match(enabledMarkup, /Klausur/u)
assert.match(enabledMarkup, /6 von 8 Werktagen verbleiben/u)

// An unevaluable subject keeps its own state: no direction, no invented balance, and
// continuation stays a separate question.
const unevaluable: LearnerPlanSubjectStatus = {
  subjectKey: 'chemie',
  subjectLabel: 'Chemie',
  evaluable: false,
  periodText: null,
  planStatusText: null,
  subjectLine: null,
  statusDirection: null,
  current: false,
  canContinue: true,
}
const unevaluableMarkup = renderToStaticMarkup(
  <LearnerPlanTodayOverview
    status={status([unevaluable], { evaluable: false, statusDirection: null, statusText: '1 Fachplan nicht auswertbar (Chemie).' })}
    plans={[]}
    language="de"
    planModeEnabled
    subjectLabel={(id) => subjectLabels.get(id) ?? id}
    goalLabel={() => undefined}
    onContinue={() => undefined}
    onSwitch={() => undefined}
    onOpenSettings={() => undefined}
  />,
)
assert.match(unevaluableMarkup, /data-testid="learner-plan-status-notice"/u)
assert.match(unevaluableMarkup, /aria-describedby="[^"]+"/u, 'the notice is wired up for screen readers')
assert.match(unevaluableMarkup, /Weiterlernen bleibt möglich/u)
assert.doesNotMatch(unevaluableMarkup, /data-status-direction/u)
assert.doesNotMatch(unevaluableMarkup, /data-testid="learner-plan-switch"/u, 'no plan backs this subject')

const reconcilingMarkup = renderToStaticMarkup(
  <LearnerPlanTodayOverview
    status={status([mathsBehind, physicsOnTrack])}
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

const staleMarkup = renderToStaticMarkup(
  <LearnerPlanTodayOverview
    status={status([mathsBehind, { ...physicsOnTrack, current: false }])}
    plans={[math, { ...physics, planId: 'stale-physics', stale: true }]}
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
assert.match(staleMarkup, /letzte Stand vom 01\.09\.2026/u)
assert.match(staleMarkup, /konnte nicht automatisch ausgewählt werden/u)
assert.match(staleMarkup, />Erneut versuchen</u)
assert.doesNotMatch(staleMarkup, /data-testid="learner-plan-switch"[^>]*>(?!.*disabled)/u)

const disabledModeMarkup = renderToStaticMarkup(
  <LearnerPlanTodayOverview
    status={status([mathsBehind, physicsOnTrack])}
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

// A reached period target never revokes the switch capability the backend published.
const reachedTarget = subject('mathematik', 'Mathematik', 'Tagesziel erreicht', '2 Lernziele vorgearbeitet', 'ahead')
const reachedMarkup = renderToStaticMarkup(
  <LearnerPlanTodayOverview
    status={status([reachedTarget], { statusDirection: 'ahead' })}
    plans={[math]}
    language="de"
    planModeEnabled
    subjectLabel={() => 'Mathematik'}
    goalLabel={() => 'Kurvendiskussion'}
    onContinue={() => undefined}
    onSwitch={() => undefined}
    onOpenSettings={() => undefined}
  />,
)
assert.match(reachedMarkup, /Tagesziel erreicht/u)
assert.match(reachedMarkup, /2 Lernziele vorgearbeitet/u)
assert.match(reachedMarkup, /data-status-direction="ahead"/u)
assert.match(reachedMarkup, /data-testid="learner-plan-switch"/u)

const weeklyMarkup = renderToStaticMarkup(
  <LearnerPlanTodayOverview
    status={status(
      [subject('mathematik', 'Mathematik', 'Wochenziel 2 von 5', 'im Plan', 'on_track')],
      { periodBasis: 'WEEK', periodStart: '2026-08-31', periodEnd: '2026-09-06', statusDirection: 'on_track' },
    )}
    plans={[math]}
    language="de"
    planModeEnabled
    subjectLabel={() => 'Mathematik'}
    goalLabel={() => undefined}
    onContinue={() => undefined}
    onSwitch={() => undefined}
    onOpenSettings={() => undefined}
  />,
)
assert.match(weeklyMarkup, />Diese Woche</u, 'the week basis reaches the heading too')
assert.match(weeklyMarkup, /Wochenziel 2 von 5/u)

const englishMarkup = renderToStaticMarkup(
  <LearnerPlanTodayOverview
    status={status(
      [subject('mathematik', 'Mathematics', 'Daily target 0 of 3', '2 learning goals behind', 'behind')],
      { language: 'en' },
    )}
    plans={[math]}
    language="en"
    planModeEnabled
    subjectLabel={() => 'Mathematics'}
    goalLabel={(id) => goalLabels.get(id)}
    onContinue={() => undefined}
    onSwitch={() => undefined}
    onOpenSettings={() => undefined}
  />,
)
assert.match(englishMarkup, /Daily target 0 of 3/u)
assert.match(englishMarkup, /2 learning goals behind/u)
assert.doesNotMatch(englishMarkup, /Pace over the last 7 days/u)

console.log('Learner plan today overview UI tests passed')
