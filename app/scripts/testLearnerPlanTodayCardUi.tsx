import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { LearnerPlanTodayCard } from '../src/components/LearnerPlanTodayCard'
import type { LearnerLearningPlanSummary } from '../src/learnerLearningPlanTypes'

const plan: LearnerLearningPlanSummary = {
  planId: 'plan-math',
  revision: 3,
  landscapeId: 'math',
  planLabel: 'Mathematik bis zum Abitur',
  stale: false,
  period: { startDate: '2026-09-01', endDate: '2027-04-30' },
  currentBlock: {
    blockId: 'analysis',
    kind: 'learning',
    title: 'Analysis',
    startDate: '2026-09-01',
    endDate: '2026-09-18',
  },
  nextMilestone: {
    blockId: 'analysis-test',
    title: 'Klausur Analysis',
    date: '2026-09-25',
  },
  metrics: {
    dueThroughToday: 12,
    completedDueThroughToday: 7,
    openDueThroughToday: 5,
    dueToday: 3,
    completedDueToday: 1,
    openDueToday: 2,
    totalPlanned: 42,
  },
  buffer: { totalWorkdays: 8, remainingWorkdays: 6 },
  pace: { status: 'neutral', reason: 'mastery-history-not-event-backed' },
  nextEligibleGoal: { goalId: 'analysis-next' },
  continueReason: null,
  canContinue: true,
}

const enabledMarkup = renderToStaticMarkup(
  <LearnerPlanTodayCard
    plan={plan}
    subjectLabel="Mathematik"
    language="de"
    planModeEnabled
    nextGoalLabel="Ableitungsregeln anwenden"
    onContinue={() => undefined}
  />,
)

assert.match(enabledMarkup, /<article[^>]+aria-labelledby="[^"]+"[^>]+aria-describedby="[^"]+"/u)
assert.match(enabledMarkup, /Mein Plan für Mathematik/u)
assert.match(enabledMarkup, /Heute neu fällig/u)
assert.match(enabledMarkup, /Davon beherrscht/u)
assert.match(enabledMarkup, /Heute noch offen/u)
assert.match(enabledMarkup, />3</u)
assert.match(enabledMarkup, />1</u)
assert.match(enabledMarkup, />2</u)
assert.match(enabledMarkup, /Bis heute insgesamt: 7 von 12 beherrscht/u)
assert.match(enabledMarkup, /3 offene Ziele aus früheren Tagen/u)
assert.match(enabledMarkup, /42 Ziele im Plan/u)
assert.match(enabledMarkup, /Ableitungsregeln anwenden/u)
assert.doesNotMatch(enabledMarkup, /analysis-next/u)
assert.match(enabledMarkup, /Aktueller Planabschnitt/u)
assert.match(enabledMarkup, /Analysis/u)
assert.match(enabledMarkup, /Nächster Termin/u)
assert.match(enabledMarkup, /Klausur Analysis/u)
assert.match(enabledMarkup, /Puffer/u)
assert.match(enabledMarkup, /6 von 8 Werktagen verbleiben/u)
assert.match(enabledMarkup, /Tempo der letzten 7 Tage/u)
assert.match(enabledMarkup, /Noch nicht bewertbar/u)
assert.match(enabledMarkup, /<svg/u)
assert.match(enabledMarkup, /data-status="neutral"/u)
assert.match(enabledMarkup, /data-status="unavailable"/u)
assert.match(enabledMarkup, /keine einzelnen Abschlüsse pro Tag/u)
assert.match(enabledMarkup, /data-testid="learner-plan-continue"/u)
assert.match(enabledMarkup, /Nächstes Planziel starten/u)
assert.doesNotMatch(enabledMarkup, /heute geschafft/iu)
assert.doesNotMatch(enabledMarkup, /bg-(?:red|rose|green|emerald|amber)-/u)
assert.doesNotMatch(enabledMarkup, /text-(?:red|rose|green|emerald|amber)-/u)

const disabledModeMarkup = renderToStaticMarkup(
  <LearnerPlanTodayCard
    plan={{ ...plan, landscapeId: 'physics', planId: 'plan-physics' }}
    subjectLabel="Physik"
    language="de"
    planModeEnabled={false}
    onContinue={() => undefined}
  />,
)
assert.match(disabledModeMarkup, /Mein Plan für Physik/u)
assert.doesNotMatch(disabledModeMarkup, /Planmodus ist ausgeschaltet/u)
assert.match(disabledModeMarkup, /Heute neu fällig/u)
assert.doesNotMatch(disabledModeMarkup, /data-testid="learner-plan-continue"/u)

const blockedMarkup = renderToStaticMarkup(
  <LearnerPlanTodayCard
    plan={{ ...plan, canContinue: false }}
    subjectLabel="Mathematik"
    language="de"
    planModeEnabled
    onContinue={() => undefined}
  />,
)
assert.match(blockedMarkup, /data-testid="learner-plan-continue-status"/u)
assert.match(blockedMarkup, /Lernvoraussetzungen sind noch nicht erfüllt/u)
assert.match(blockedMarkup, /Fokus bleibt unverändert/u)
assert.doesNotMatch(blockedMarkup, /data-testid="learner-plan-continue"/u)

const unavailableNavigationMarkup = renderToStaticMarkup(
  <LearnerPlanTodayCard
    plan={plan}
    subjectLabel="Physik"
    language="de"
    planModeEnabled
    navigationAvailable={false}
    onContinue={() => undefined}
  />,
)
assert.match(unavailableNavigationMarkup, /data-testid="learner-plan-navigation-unavailable"/u)
assert.match(unavailableNavigationMarkup, /nicht sicher geöffnet/u)
assert.doesNotMatch(unavailableNavigationMarkup, /data-testid="learner-plan-continue"/u)

const staleDataMarkup = renderToStaticMarkup(
  <LearnerPlanTodayCard
    plan={plan}
    subjectLabel="Mathematik"
    language="de"
    planModeEnabled
    staleDataMessage="Angezeigt wird der letzte Stand vom 01.09.2026."
    onContinue={() => undefined}
  />,
)
assert.match(staleDataMarkup, /letzte Stand vom 01\.09\.2026/u)
assert.doesNotMatch(staleDataMarkup, /data-testid="learner-plan-continue"/u)

const refreshingMarkup = renderToStaticMarkup(
  <LearnerPlanTodayCard
    plan={plan}
    subjectLabel="Mathematik"
    language="de"
    planModeEnabled
    actionsDisabled
    onContinue={() => undefined}
  />,
)
assert.match(refreshingMarkup, /Mein Plan für Mathematik/u)
assert.doesNotMatch(refreshingMarkup, /data-testid="learner-plan-continue"/u)

const activeGoalMarkup = renderToStaticMarkup(
  <LearnerPlanTodayCard
    plan={{ ...plan, canContinue: false, continueReason: 'active-goal-in-progress' }}
    subjectLabel="Physik"
    language="de"
    planModeEnabled
    onContinue={() => undefined}
  />,
)
assert.match(activeGoalMarkup, /Beende zuerst dein aktuelles Lernziel/u)
assert.match(activeGoalMarkup, /verdrängt kein noch laufendes Ziel/u)

const nothingDueMarkup = renderToStaticMarkup(
  <LearnerPlanTodayCard
    plan={{
      ...plan,
      canContinue: false,
      continueReason: 'no-open-due-frontier-goal',
      metrics: {
        ...plan.metrics,
        dueThroughToday: 7,
        completedDueThroughToday: 7,
        openDueThroughToday: 0,
        dueToday: 1,
        completedDueToday: 1,
        openDueToday: 0,
      },
    }}
    subjectLabel="Mathematik"
    language="de"
    planModeEnabled
    onContinue={() => undefined}
  />,
)
assert.match(nothingDueMarkup, /Bis heute ist kein offenes Planziel fällig/u)

const subjectCardsMarkup = renderToStaticMarkup(
  <div>
    {[
      { plan, subjectLabel: 'Mathematik' },
      {
        plan: { ...plan, planId: 'plan-physics', landscapeId: 'physics' },
        subjectLabel: 'Physik',
      },
    ].map((entry) => (
      <LearnerPlanTodayCard
        key={entry.plan.planId}
        plan={entry.plan}
        subjectLabel={entry.subjectLabel}
        language="de"
        planModeEnabled
        onContinue={() => undefined}
      />
    ))}
  </div>,
)
assert.equal((subjectCardsMarkup.match(/<article/gmu) ?? []).length, 2)
assert.match(subjectCardsMarkup, /Mein Plan für Mathematik/u)
assert.match(subjectCardsMarkup, /Mein Plan für Physik/u)

const englishMarkup = renderToStaticMarkup(
  <LearnerPlanTodayCard
    plan={plan}
    subjectLabel="Mathematics"
    language="en"
    planModeEnabled
    onContinue={() => undefined}
  />,
)
assert.match(englishMarkup, /Newly due today/u)
assert.match(englishMarkup, /Already mastered/u)
assert.match(englishMarkup, /Still open today/u)
assert.match(englishMarkup, /Pace over the last 7 days/u)
assert.doesNotMatch(englishMarkup, /completed today/iu)

console.log('Learner plan today card UI tests passed')
