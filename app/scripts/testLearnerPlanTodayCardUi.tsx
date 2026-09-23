import { TrainerLearningPlanPreviewSummary } from '../src/components/TrainerLearningPlanPreview'
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
  buffer: { totalWorkdays: 8, remainingWorkdays: 6 },
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
): LearnerPlanSubjectStatus => {
  const count = /(\d+) (?:von|of) (\d+)/u.exec(periodText)
  const target = count ? Number(count[2]) : periodText.includes('erreicht') ? 2 : 0
  const completed = count ? Number(count[1]) : target
  const net = statusDirection === 'behind' ? -2 : statusDirection === 'ahead' ? 2 : 0
  return {
    subjectKey,
    landscapeIds: [subjectKey === 'mathematik' ? 'math' : subjectKey === 'physik' ? 'physics' : subjectKey],
    subjectLabel,
    evaluable: true,
    periodText,
    planStatusText,
    subjectLine: `${subjectLabel}: ${periodText} · ${planStatusText}`,
    statusDirection,
    periodGauge: { completed, target, needlePosition: target === 0 ? null : completed / target },
    balanceGauge: { net, typicalAmount: 2, scaleLimit: 4, needlePosition: net < 0 ? net / 5 : net / 4, severeBehind: false, strongAhead: false },
    current: false,
    canContinue: true,
    ...extra,
  }
}

const status = (subjects: LearnerPlanSubjectStatus[], overrides: Partial<LearnerPlanStatus> = {}): LearnerPlanStatus => ({
  asOf: '2026-09-04',
  periodBasis: 'DAY',
  periodStart: '2026-09-04',
  periodEnd: '2026-09-04',
  timeZone: 'Europe/Berlin',
  language: 'de',
  evaluable: subjects.every((entry) => entry.evaluable),
  statusText: subjects.map((entry) => entry.subjectLine ?? '').filter(Boolean).join('\n'),
  noticeText: null,
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
    onSwitch={() => undefined}
  />,
)

assert.match(enabledMarkup, /<section[^>]+data-testid="learner-plan-today-overview"[^>]+aria-labelledby="[^"]+"/u)
// The description only exists while there is a notice to describe.
assert.doesNotMatch(enabledMarkup, /aria-describedby/u)
assert.match(enabledMarkup, />Heute</u)
// The first dial states the period and quota; the second uses the backend status wording.
assert.doesNotMatch(enabledMarkup, /Tagesziel 0 von 3/u)
assert.match(enabledMarkup, /2 Lernziele im Rückstand/u)
assert.doesNotMatch(enabledMarkup, /Tagesziel 1 von 2/u)
assert.match(enabledMarkup, />im Plan</u)
assert.doesNotMatch(enabledMarkup, /<span class="text-sm text-text-primary">Tagesziel/u,
  'the dial replaces the duplicate period sentence in Plan mode')
// The combined text is not repeated on top of the rows.
assert.doesNotMatch(enabledMarkup, /Mathematik: Tagesziel 0 von 3 · 2 Lernziele im Rückstand/u)
// The colour comes from the delivered direction only.
assert.match(enabledMarkup, /data-status-direction="behind"/u)
assert.match(enabledMarkup, /data-status-direction="on_track"/u)
// The two real gauges use backend positions and show planned-goal counts.
assert.equal((enabledMarkup.match(/data-testid="learner-plan-period-gauge"/gu) ?? []).length, 2)
assert.equal((enabledMarkup.match(/data-testid="learner-plan-balance-gauge"/gu) ?? []).length, 2)
assert.match(enabledMarkup, /0 von 3 Zielen/u)
assert.doesNotMatch(enabledMarkup, /Frühere Abschlüsse werden angerechnet|Typisch:/u)
assert.match(enabledMarkup, /data-needle-position="-0\.4"/u)
assert.match(enabledMarkup, /aria-label="Mathematik: Heute, 0 von 3 Zielen"/u)
assert.doesNotMatch(enabledMarkup, /<linearGradient\b|<stop\b/u,
  'the dials use distinct progress and balance segments rather than a continuous gradient')
assert.doesNotMatch(enabledMarkup, /<progress/u)
assert.doesNotMatch(enabledMarkup, /Bis heute insgesamt|Zusätzlich|Tempo der letzten 7 Tage|gültige Fachpläne/u)
assert.match(enabledMarkup, /Du lernst gerade · Mathematik/u)
assert.match(enabledMarkup, /Ableitungsregeln anwenden/u)
assert.doesNotMatch(enabledMarkup, /data-testid="learner-plan-continue"|>Weiterlernen<|>Einstellungen öffnen</u,
  'the Today panel only reports progress and the active goal; navigation lives outside it')
assert.match(enabledMarkup, /Aktuelles Fach/u)
assert.match(enabledMarkup, /Zu Physik wechseln/u)
assert.equal((enabledMarkup.match(/data-testid="learner-plan-switch"/gu) ?? []).length, 1)
assert.match(enabledMarkup, /Plandetails: Mathematik/u)
assert.match(enabledMarkup, /Analysis/u)
assert.match(enabledMarkup, /Klausur/u)
assert.match(enabledMarkup, /6 von 8 Werktagen verbleiben/u)

// Plandetails only name schedule elements that exist. A plan without a current
// block, milestone, or reserved workdays still has its overall plan period.
const unstructuredPlan: LearnerLearningPlanSummary = {
  ...math,
  currentBlock: null,
  nextMilestone: null,
  buffer: { totalWorkdays: 0, remainingWorkdays: 0 },
  nextEligibleGoal: null,
  continueReason: 'no-open-due-frontier-goal',
  canContinue: false,
}
const unstructuredMarkup = renderToStaticMarkup(
  <LearnerPlanTodayOverview
    status={status([{ ...mathsBehind, canContinue: false }])}
    plans={[unstructuredPlan]}
    language="de"
    planModeEnabled
    subjectLabel={(id) => subjectLabels.get(id) ?? id}
    goalLabel={(id) => goalLabels.get(id)}
    onSwitch={() => undefined}
  />,
)
assert.match(unstructuredMarkup, /Plandetails: Mathematik/u)
assert.match(unstructuredMarkup, /Planzeitraum/u)
assert.doesNotMatch(unstructuredMarkup, /Aktueller Planabschnitt|Für heute ist kein Lernabschnitt aktiv/u)
assert.doesNotMatch(unstructuredMarkup, /Nächster Termin|Kein weiterer Termin geplant/u)
assert.doesNotMatch(unstructuredMarkup, />Puffer<|0 von 0 Werktagen/u)

// A real buffer remains visible even after all of its workdays are used.
const exhaustedBufferMarkup = renderToStaticMarkup(
  <LearnerPlanTodayOverview
    status={status([{ ...mathsBehind, canContinue: false }])}
    plans={[{ ...unstructuredPlan, buffer: { totalWorkdays: 8, remainingWorkdays: 0 } }]}
    language="de"
    planModeEnabled
    subjectLabel={(id) => subjectLabels.get(id) ?? id}
    goalLabel={(id) => goalLabels.get(id)}
    onSwitch={() => undefined}
  />,
)
assert.match(exhaustedBufferMarkup, />Puffer<\/span>/u)
assert.match(exhaustedBufferMarkup, /0 von 8 Werktagen verbleiben/u)

// An unevaluable subject keeps its own state: no direction, no invented balance, and
// continuation stays a separate question.
const unevaluable: LearnerPlanSubjectStatus = {
  subjectKey: 'chemie',
  landscapeIds: ['chemistry'],
  subjectLabel: 'Chemie',
  evaluable: false,
  periodText: null,
  planStatusText: null,
  subjectLine: null,
  statusDirection: null,
  periodGauge: null,
  balanceGauge: null,
  current: false,
  canContinue: true,
}
const unevaluableMarkup = renderToStaticMarkup(
  <LearnerPlanTodayOverview
    status={status([unevaluable], { evaluable: false, noticeText: '1 Fachplan nicht auswertbar (Chemie).', statusText: '1 Fachplan nicht auswertbar (Chemie).' })}
    plans={[]}
    language="de"
    planModeEnabled
    subjectLabel={(id) => subjectLabels.get(id) ?? id}
    goalLabel={() => undefined}
    onSwitch={() => undefined}
  />,
)
assert.match(unevaluableMarkup, /data-testid="learner-plan-status-notice"/u)
assert.match(unevaluableMarkup, /aria-describedby="[^"]+"/u, 'the notice is wired up for screen readers')
assert.match(unevaluableMarkup, /1 Fachplan nicht auswertbar \(Chemie\)\./u)
assert.doesNotMatch(unevaluableMarkup, /data-status-direction/u)
assert.match(unevaluableMarkup, /learner-plan-gauges-unavailable/u)
assert.equal((unevaluableMarkup.match(/data-testid="learner-plan-period-gauge"/gu) ?? []).length, 1)
assert.equal((unevaluableMarkup.match(/data-testid="learner-plan-balance-gauge"/gu) ?? []).length, 1)
assert.doesNotMatch(unevaluableMarkup, /data-needle-position/u, 'unavailable dials have no needles')
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
    onSwitch={() => undefined}
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
    onSwitch={() => undefined}
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
    onSwitch={() => undefined}
  />,
)
assert.match(disabledModeMarkup, /Planmodus ist ausgeschaltet/u)
assert.match(disabledModeMarkup, /<span class="text-sm text-text-primary">Tagesziel 0 von 3<\/span>/u,
  'without dials the complete backend text remains visible')
assert.doesNotMatch(disabledModeMarkup, /Einstellungen öffnen/u)
assert.doesNotMatch(disabledModeMarkup, /data-testid="learner-plan-continue"/u)
assert.doesNotMatch(disabledModeMarkup, /data-testid="learner-plan-switch"/u)
assert.doesNotMatch(disabledModeMarkup, /data-testid="learner-plan-period-gauge"/u)

// A reached period target never revokes the switch capability the backend published.
const reachedTarget = subject('mathematik', 'Mathematik', 'Tagesziel erreicht', '2 Lernziele vorgearbeitet', 'ahead')
const reachedMarkup = renderToStaticMarkup(
  <LearnerPlanTodayOverview
    status={status([reachedTarget], {})}
    plans={[math]}
    language="de"
    planModeEnabled
    subjectLabel={() => 'Mathematik'}
    goalLabel={() => 'Kurvendiskussion'}
    onSwitch={() => undefined}
  />,
)
assert.match(reachedMarkup, /2 von 2 Zielen/u)
assert.match(reachedMarkup, /2 Lernziele vorgearbeitet/u)
assert.match(reachedMarkup, /data-status-direction="ahead"/u)
assert.match(reachedMarkup, /data-testid="learner-plan-switch"/u)

const noTargetMarkup = renderToStaticMarkup(<LearnerPlanTodayOverview
  status={status([subject('mathematik', 'Mathematik', 'Heute kein Tagesziel', 'im Plan', 'on_track', {
    periodGauge: { completed: 0, target: 0, needlePosition: null },
    balanceGauge: { net: 0, typicalAmount: 2, scaleLimit: 4, needlePosition: 0, severeBehind: false, strongAhead: false },
  })])}
  plans={[math]} language="de" planModeEnabled subjectLabel={() => 'Mathematik'} goalLabel={() => undefined}
  onSwitch={() => undefined}
/>)
assert.match(noTargetMarkup, /Heute kein Tagesziel/u)
assert.match(noTargetMarkup, /Keine Ziele geplant/u)
assert.doesNotMatch(noTargetMarkup, /0 von 0 Planzielen|>0%</u)
assert.match(noTargetMarkup, /data-testid="learner-plan-period-gauge"[^>]*>/u)

const noScaleMarkup = renderToStaticMarkup(<LearnerPlanTodayOverview
  status={status([subject('mathematik', 'Mathematik', 'Heute kein Tagesziel', 'im Plan', 'on_track', {
    periodGauge: { completed: 0, target: 0, needlePosition: null }, balanceGauge: null,
  })])}
  plans={[math]} language="de" planModeEnabled subjectLabel={() => 'Mathematik'} goalLabel={() => undefined}
  onSwitch={() => undefined}
/>)
assert.match(noScaleMarkup, /Skala nicht verfügbar/u)
assert.match(noScaleMarkup, /data-testid="learner-plan-balance-gauge"/u)

const overshootMarkup = renderToStaticMarkup(<LearnerPlanTodayOverview
  status={status([subject('mathematik', 'Mathematik', 'Tagesziel erreicht', '17 Lernziele im Rückstand', 'behind', {
    periodGauge: { completed: 2, target: 2, needlePosition: 1 },
    balanceGauge: { net: -17, typicalAmount: 2, scaleLimit: 4, needlePosition: -1, severeBehind: true, strongAhead: false },
  })])}
  plans={[math]} language="de" planModeEnabled subjectLabel={() => 'Mathematik'} goalLabel={() => undefined}
  onSwitch={() => undefined}
/>)
assert.match(overshootMarkup, /2 von 2 Zielen/u)
assert.match(overshootMarkup, /17 Lernziele im Rückstand/u, 'the backend wording preserves the actual balance past the dial stop')
assert.match(overshootMarkup, /data-severity="severe-behind"/u)
assert.match(overshootMarkup, /data-needle-position="-1"/u)
assert.doesNotMatch(overshootMarkup, /&gt;4 zurück|0 · im Plan|Typisch:/u)

const exactThresholdMarkup = renderToStaticMarkup(<LearnerPlanTodayOverview
  status={status([subject('mathematik', 'Mathematik', 'Tagesziel erreicht', '4 Lernziele im Rückstand', 'behind', {
    periodGauge: { completed: 2, target: 2, needlePosition: 1 },
    balanceGauge: { net: -4, typicalAmount: 2, scaleLimit: 4, needlePosition: -0.8, severeBehind: false, strongAhead: false },
  })])}
  plans={[math]} language="de" planModeEnabled subjectLabel={() => 'Mathematik'} goalLabel={() => undefined}
  onSwitch={() => undefined}
/>)
assert.match(exactThresholdMarkup, /data-needle-position="-0\.8"/u)
assert.doesNotMatch(exactThresholdMarkup, /data-severity="severe-behind"/u)

const aheadThresholdMarkup = renderToStaticMarkup(<LearnerPlanTodayOverview
  status={status([subject('mathematik', 'Mathematik', 'Tagesziel erreicht', '4 Lernziele vorgearbeitet', 'ahead', {
    periodGauge: { completed: 2, target: 2, needlePosition: 1 },
    balanceGauge: { net: 4, typicalAmount: 2, scaleLimit: 4, needlePosition: 1, severeBehind: false, strongAhead: true },
  })])}
  plans={[math]} language="de" planModeEnabled subjectLabel={() => 'Mathematik'} goalLabel={() => undefined}
  onSwitch={() => undefined}
/>)
assert.match(aheadThresholdMarkup, /data-severity="strong-ahead"/u)
assert.match(aheadThresholdMarkup, /data-needle-position="1"/u)

const weeklyMarkup = renderToStaticMarkup(
  <LearnerPlanTodayOverview
    status={status(
      [subject('mathematik', 'Mathematik', 'Wochenziel 2 von 5', 'im Plan', 'on_track')],
      { periodBasis: 'WEEK', periodStart: '2026-08-31', periodEnd: '2026-09-06' },
    )}
    plans={[math]}
    language="de"
    planModeEnabled
    subjectLabel={() => 'Mathematik'}
    goalLabel={() => undefined}
    onSwitch={() => undefined}
  />,
)
assert.match(weeklyMarkup, />Diese Woche</u, 'the week basis reaches the heading too')
assert.doesNotMatch(weeklyMarkup, /Wochenziel 2 von 5/u)
assert.match(weeklyMarkup, /2 von 5 Zielen/u)

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
    onSwitch={() => undefined}
  />,
)
assert.match(englishMarkup, /0 of 3 goals/u)
assert.match(englishMarkup, />Overall</u)
assert.match(englishMarkup, /2 learning goals behind/u)
assert.doesNotMatch(englishMarkup, /Pace over the last 7 days/u)


// Stable backend identifiers bind actions even when translations collide or differ.
const renamedMarkup = renderToStaticMarkup(<LearnerPlanTodayOverview
  status={status([{ ...physicsOnTrack, subjectLabel: 'Naturwissenschaften' }])}
  plans={[physics]} language="de" planModeEnabled
  subjectLabel={() => 'Mathematik'} goalLabel={() => undefined}
  onSwitch={() => undefined}
/>)
assert.match(renamedMarkup, /Zu Naturwissenschaften wechseln/u)
assert.match(renamedMarkup, /Plandetails: Naturwissenschaften/u)

const weeklyBackendText = 'Mathematik: Wochenziel erreicht · 2 Lernziele im Rückstand\n1 Fachplan nicht auswertbar (Physik).'
const weeklyPreview = renderToStaticMarkup(<TrainerLearningPlanPreviewSummary
  preview={{ asOf: '2026-09-04', days: [{ date: '2026-09-04', status: status([mathsBehind], {
    periodBasis: 'WEEK', periodStart: '2026-08-31', periodEnd: '2026-09-06',
    statusText: weeklyBackendText,
  }) }] }} subjects={[]} language="de" compact
/>)
assert.ok(weeklyPreview.includes(weeklyBackendText), 'preview preserves the complete weekly backend statement and evaluation notice')
assert.doesNotMatch(weeklyPreview, /Heute geschafft|Weiterer Rückstand|Tagespensum|Gesamt/u)


const groupedWeeklyPreview = renderToStaticMarkup(<TrainerLearningPlanPreviewSummary
  preview={{ asOf: '2026-09-04', days: Array.from({ length: 7 }, (_, index) => {
    const nextWeek = index >= 3
    const date = `2026-09-${String(4 + index).padStart(2, '0')}`
    return { date, status: status([], {
      asOf: date, periodBasis: 'WEEK',
      periodStart: nextWeek ? '2026-09-07' : '2026-08-31',
      periodEnd: nextWeek ? '2026-09-13' : '2026-09-06',
      statusText: nextWeek ? 'Mathematik: Wochenziel 0 von 9 · im Plan' : weeklyBackendText,
    }) }
  }) }} subjects={[]} language="de"
/>)
assert.equal(groupedWeeklyPreview.split(weeklyBackendText).length - 1, 1, 'the current week is displayed once')
assert.equal(groupedWeeklyPreview.split('Mathematik: Wochenziel 0 von 9 · im Plan').length - 1, 1, 'the next week is displayed once within the seven-day horizon')
assert.match(groupedWeeklyPreview, /07\.09\.2026 – 13\.09\.2026/u)

const mergedPlansMarkup = renderToStaticMarkup(<LearnerPlanTodayOverview
  status={status([{ ...mathsBehind, current: false }])}
  plans={[{ ...math, planLabel: 'Mathematik A' }, { ...math, planId: 'other-math-plan', planLabel: 'Mathematik B' }]}
  language="de" planModeEnabled subjectLabel={() => 'Mathematik'} goalLabel={() => undefined}
  onSwitch={() => undefined}
/>)
assert.match(mergedPlansMarkup, /Mathematik A/u)
assert.match(mergedPlansMarkup, /Mathematik B/u)
assert.doesNotMatch(mergedPlansMarkup, /data-testid="learner-plan-switch"/u, 'merged plans expose details without guessing a navigation target')
console.log('Learner plan overview and shared weekly preview UI tests passed')
