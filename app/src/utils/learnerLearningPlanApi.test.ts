import assert from 'node:assert/strict'
import type { LearnerLearningPlanDetail } from '../learnerLearningPlanTypes'
import {
  LearnerLearningPlanApiError,
  activateLearnerLearningPlans,
  buildActivateLearnerLearningPlansEndpoint,
  buildContinueLearnerLearningPlanEndpoint,
  buildLearnerLearningPlanEndpoint,
  buildLearnerLearningPlansEndpoint,
  buildReconcileLearnerLearningPlansEndpoint,
  buildSwitchLearnerLearningPlanEndpoint,
  continueLearnerLearningPlan,
  getLearnerLearningPlan,
  getLearnerLearningPlans,
  parseLearnerLearningPlansResponse,
  reconcileLearnerLearningPlans,
  saveLearnerLearningPlan,
  switchLearnerLearningPlan,
} from './learnerLearningPlanApi'
import {
  formatLearnerLearningPlanDate,
  formatLearnerLearningPlanPeriod,
  isLearnerPlanActionAvailable,
  millisecondsUntilNextBerlinDateBoundary,
  selectScopedLearnerLearningPlans,
  sortLearnerLearningPlansForToday,
} from './learnerLearningPlanReadModel'

const planSummary = {
  planId: 'plan-math',
  revision: 3,
  landscapeId: 'math/sek-ii',
  planLabel: 'Mathematik bis zum Abitur',
  stale: false,
  period: { startDate: '2026-09-01', endDate: '2027-04-30' },
  currentBlock: {
    id: 'block-analysis',
    kind: 'learning',
    title: 'Analysis',
    goalId: 'analysis-root',
    startDate: '2026-09-01',
    endDate: '2026-09-18',
  },
  nextMilestone: {
    id: 'milestone-klausur',
    title: 'Klausur Analysis',
    dueDate: '2026-09-25',
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
  nextEligibleGoal: { goalId: 'analysis-1' },
  continueReason: null,
  canContinue: true,
}

const planDetail: LearnerLearningPlanDetail = {
  ...parseLearnerLearningPlansResponse({
    asOf: '2026-09-10',
    followLearningPlans: true,
    plans: [planSummary],
  }).plans[0],
  blocks: [
    {
      id: 'block-analysis',
      kind: 'learning',
      goalId: 'analysis-root',
      startDate: '2026-09-01',
      endDate: '2026-09-18',
      atomicGoalIds: ['analysis-1', 'analysis-2'],
    },
  ],
}

assert.equal(
  buildLearnerLearningPlansEndpoint(
    ' learner / 42 ',
    '2026-09-10',
    'https://api.example.test/',
  ),
  'https://api.example.test/api/ui/learners/learner%2F42/learning-plans?asOf=2026-09-10',
)
assert.equal(
  buildLearnerLearningPlansEndpoint('learner-42', undefined, 'https://api.example.test/'),
  'https://api.example.test/api/ui/learners/learner-42/learning-plans',
)
assert.equal(
  buildLearnerLearningPlanEndpoint(
    'learner-42',
    'math/sek-ii',
    'https://api.example.test/',
  ),
  'https://api.example.test/api/ui/learners/learner-42/learning-plans/by-landscape?landscapeId=math%2Fsek-ii',
)
assert.equal(
  buildContinueLearnerLearningPlanEndpoint(
    'learner-42',
    'plan/math',
    'https://api.example.test/',
  ),
  'https://api.example.test/api/ui/learners/learner-42/learning-plans/plan%2Fmath/continue',
)
assert.equal(
  buildReconcileLearnerLearningPlansEndpoint('learner-42', 'https://api.example.test/'),
  'https://api.example.test/api/ui/learners/learner-42/learning-plans/reconcile',
)
assert.equal(
  buildSwitchLearnerLearningPlanEndpoint(
    'learner-42',
    'plan/math',
    'https://api.example.test/',
  ),
  'https://api.example.test/api/ui/learners/learner-42/learning-plans/plan%2Fmath/switch',
)
assert.equal(
  buildActivateLearnerLearningPlansEndpoint('learner-42', 'https://api.example.test/'),
  'https://api.example.test/api/ui/learners/learner-42/learning-plans/activate',
)

const parsed = parseLearnerLearningPlansResponse({
  asOf: '2026-09-10',
  followLearningPlans: false,
  plans: [planSummary],
  futureField: 'ignored',
})
assert.equal(parsed.followLearningPlans, false)
assert.equal(parsed.plans[0]?.currentBlock?.blockId, 'block-analysis')
assert.equal(parsed.plans[0]?.nextMilestone?.date, '2026-09-25')
assert.equal(parsed.plans[0]?.metrics.openDueThroughToday, 5)
assert.equal(parsed.plans[0]?.metrics.openDueToday, 2)
assert.equal(parsed.plans[0]?.nextEligibleGoal?.goalId, 'analysis-1')

assert.throws(
  () => parseLearnerLearningPlansResponse({
    asOf: '2026-09-10',
    followLearningPlans: true,
    plans: [{
      ...planSummary,
      metrics: { ...planSummary.metrics, openDueThroughToday: 6 },
    }],
  }),
  /metrics\.cardinality/u,
)

assert.equal(formatLearnerLearningPlanDate('2026-09-01', 'de'), '01.09.2026')
assert.equal(formatLearnerLearningPlanDate('2026-09-01', 'en'), '01/09/2026')
assert.equal(
  formatLearnerLearningPlanPeriod('2026-09-01', '2026-09-18', 'de'),
  '01.09.2026 – 18.09.2026',
)
assert.equal(
  selectScopedLearnerLearningPlans(
    parseLearnerLearningPlansResponse({
      asOf: '2026-09-10',
      followLearningPlans: true,
      plans: [planSummary],
    }),
    'learner-a:math',
    'learner-b:physics',
  ),
  null,
)
assert.equal(isLearnerPlanActionAvailable('loading'), false)
assert.equal(isLearnerPlanActionAvailable('error'), false)
assert.equal(isLearnerPlanActionAvailable('ready'), true)
assert.equal(isLearnerPlanActionAvailable('ready', true), false)

const sorted = sortLearnerLearningPlansForToday([
  { ...parsed.plans[0], planId: 'stale', landscapeId: 'z', stale: true, canContinue: false, continueReason: 'personal-curriculum-changed' },
  { ...parsed.plans[0], planId: 'done', landscapeId: 'a', canContinue: false, continueReason: 'no-open-due-frontier-goal', metrics: { ...parsed.plans[0].metrics, dueToday: 0, completedDueToday: 0, openDueToday: 0, openDueThroughToday: 0, completedDueThroughToday: parsed.plans[0].metrics.dueThroughToday } },
  { ...parsed.plans[0], planId: 'actionable', landscapeId: 'p' },
])
assert.deepEqual(sorted.map(({ planId }) => planId), ['actionable', 'done', 'stale'])

let capturedUrl = ''
let capturedInit: RequestInit | undefined
let responseBody: unknown = {
  asOf: '2026-09-10',
  followLearningPlans: true,
  plans: [planSummary],
}
const fetchImpl: typeof fetch = async (input, init) => {
  capturedUrl = String(input)
  capturedInit = init
  return new Response(JSON.stringify(responseBody), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

await getLearnerLearningPlans('learner-42', '2026-09-10', {
  apiBase: 'https://api.example.test',
  fetchImpl,
})
assert.equal(
  capturedUrl,
  'https://api.example.test/api/ui/learners/learner-42/learning-plans?asOf=2026-09-10',
)
assert.equal(capturedInit?.method, undefined)
assert.equal(capturedInit?.credentials, 'include')
assert.equal(capturedInit?.cache, 'no-store')

responseBody = planDetail
await getLearnerLearningPlan('learner-42', 'math/sek-ii', '2026-09-10', {
  apiBase: 'https://api.example.test',
  fetchImpl,
})
assert.equal(
  capturedUrl,
  'https://api.example.test/api/ui/learners/learner-42/learning-plans/by-landscape?landscapeId=math%2Fsek-ii&asOf=2026-09-10',
)
assert.equal(capturedInit?.cache, 'no-store')

const saveRequest = {
  expectedRevision: 3,
  planLabel: 'Mathematik bis zum Abitur',
  blocks: [{
    id: 'block-analysis',
    kind: 'learning' as const,
    goalId: 'analysis-root',
    startDate: '2026-09-01',
    endDate: '2026-09-18',
    atomicGoalIds: ['analysis-1', 'analysis-2'],
  }],
}
await saveLearnerLearningPlan('learner-42', 'math/sek-ii', saveRequest, {
  apiBase: 'https://api.example.test',
  fetchImpl,
})
assert.equal(capturedInit?.method, 'PUT')
assert.equal(capturedInit?.credentials, 'include')
assert.equal(capturedInit?.headers && (capturedInit.headers as Record<string, string>)['Content-Type'], 'application/json')
assert.equal(capturedInit?.body, JSON.stringify(saveRequest))

responseBody = {
  planId: 'plan-math',
  revision: 3,
  landscapeId: 'math/sek-ii',
  focusGoalId: 'analysis-root',
  activeGoalId: 'analysis-1',
  state: { skillpilotId: 'learner-42' },
}
const continued = await continueLearnerLearningPlan(
  'learner-42',
  'plan-math',
  { expectedRevision: 3 },
  { apiBase: 'https://api.example.test', fetchImpl },
)
assert.equal(capturedInit?.method, 'POST')
assert.equal(capturedInit?.body, JSON.stringify({ expectedRevision: 3 }))
assert.equal(continued.activeGoalId, 'analysis-1')

responseBody = {
  planId: 'plan-math',
  revision: 3,
  landscapeId: 'math/sek-ii',
  focusGoalId: 'analysis-root',
  activeGoalId: 'analysis-1',
  changed: true,
  state: { stateMachine: { activeGoal: { id: 'analysis-1' } } },
}
const reconciled = await reconcileLearnerLearningPlans(
  'learner-42',
  { asOf: '2026-09-10' },
  { apiBase: 'https://api.example.test', fetchImpl },
)
assert.equal(
  capturedUrl,
  'https://api.example.test/api/ui/learners/learner-42/learning-plans/reconcile',
)
assert.equal(capturedInit?.method, 'POST')
assert.equal(capturedInit?.credentials, 'include')
assert.equal(capturedInit?.body, JSON.stringify({ asOf: '2026-09-10' }))
assert.equal(reconciled?.changed, true)
assert.equal(reconciled?.activeGoalId, 'analysis-1')

responseBody = {
  planId: 'plan-physics',
  revision: 7,
  landscapeId: 'physics/sek-ii',
  focusGoalId: 'mechanics-root',
  activeGoalId: 'mechanics-1',
  changed: true,
  state: { stateMachine: { activeGoal: { id: 'mechanics-1' } } },
}
const switched = await switchLearnerLearningPlan(
  'learner-42',
  'plan-physics',
  { expectedRevision: 7, asOf: '2026-09-10' },
  { apiBase: 'https://api.example.test', fetchImpl },
)
assert.equal(
  capturedUrl,
  'https://api.example.test/api/ui/learners/learner-42/learning-plans/plan-physics/switch',
)
assert.equal(capturedInit?.body, JSON.stringify({ expectedRevision: 7, asOf: '2026-09-10' }))
assert.equal(switched?.landscapeId, 'physics/sek-ii')

responseBody = null
assert.equal(
  await reconcileLearnerLearningPlans(
    'learner-42',
    { asOf: '2026-09-10' },
    { apiBase: 'https://api.example.test', fetchImpl },
  ),
  null,
)

const activationRequest = {
  asOf: '2026-09-10',
  plans: [{
    landscapeId: 'math/sek-ii',
    expectedRevision: 3,
    planLabel: 'Mathematik bis zum Abitur',
    blocks: saveRequest.blocks,
  }],
}
responseBody = {
  asOf: '2026-09-10',
  followLearningPlans: true,
  plans: [planDetail],
  selectedPlanId: 'plan-math',
  selectedLandscapeId: 'math/sek-ii',
  focusGoalId: 'analysis-root',
  activeGoalId: 'analysis-1',
  state: { stateMachine: { activeGoal: { id: 'analysis-1' } } },
}
const activated = await activateLearnerLearningPlans(
  'learner-42',
  activationRequest,
  { apiBase: 'https://api.example.test', fetchImpl },
)
assert.equal(
  capturedUrl,
  'https://api.example.test/api/ui/learners/learner-42/learning-plans/activate',
)
assert.equal(capturedInit?.method, 'POST')
assert.equal(capturedInit?.body, JSON.stringify(activationRequest))
assert.equal(activated.followLearningPlans, true)
assert.equal(activated.plans[0]?.blocks[0]?.id, 'block-analysis')
assert.equal(activated.selectedLandscapeId, 'math/sek-ii')

responseBody = {
  changed: false,
  state: { stateMachine: { activeGoal: null } },
}
const noTransition = await reconcileLearnerLearningPlans(
  'learner-42',
  { asOf: '2026-09-10' },
  { apiBase: 'https://api.example.test', fetchImpl },
)
assert.deepEqual(noTransition, {
  planId: null,
  revision: null,
  landscapeId: null,
  focusGoalId: null,
  activeGoalId: null,
  changed: false,
  state: { stateMachine: { activeGoal: null } },
})

responseBody = {
  changed: true,
  state: { stateMachine: { activeGoal: null } },
}
const clearedCompletedPointer = await reconcileLearnerLearningPlans(
  'learner-42',
  { asOf: '2026-09-10' },
  { apiBase: 'https://api.example.test', fetchImpl },
)
assert.equal(clearedCompletedPointer?.changed, true)
assert.equal(clearedCompletedPointer?.activeGoalId, null)

responseBody = {
  planId: 'plan-math',
  changed: true,
  state: { stateMachine: { activeGoal: null } },
}
await assert.rejects(
  () => reconcileLearnerLearningPlans(
    'learner-42',
    { asOf: '2026-09-10' },
    { apiBase: 'https://api.example.test', fetchImpl },
  ),
  /target context without active goal/u,
)

responseBody = {
  asOf: '2026-09-10',
  followLearningPlans: true,
  plans: [planDetail],
  selectedPlanId: 'plan-math',
  state: { stateMachine: { activeGoal: null } },
}
await assert.rejects(
  () => activateLearnerLearningPlans(
    'learner-42',
    activationRequest,
    { apiBase: 'https://api.example.test', fetchImpl },
  ),
  /selection is incomplete/u,
)

await assert.rejects(
  () => getLearnerLearningPlans('learner-42', '2026-09-10', {
    fetchImpl: async () => new Response('Plan revision conflict', { status: 409 }),
  }),
  (error: unknown) => error instanceof LearnerLearningPlanApiError
    && error.status === 409
    && error.message === 'Plan revision conflict',
)

await assert.rejects(
  () => activateLearnerLearningPlans('learner-42', activationRequest, {
    fetchImpl: async () => new Response(JSON.stringify({
      errorCode: 'LEARNING_PLAN_PREREQUISITE_SCHEDULE_CONFLICT',
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    }),
  }),
  (error: unknown) => error instanceof LearnerLearningPlanApiError
    && error.status === 400
    && error.errorCode === 'LEARNING_PLAN_PREREQUISITE_SCHEDULE_CONFLICT'
    && !error.message.includes('PREREQUISITE_SCHEDULE_CONFLICT'),
)

const withinOneSecond = (actual: number, expected: number) => {
  assert.ok(actual >= expected, `${actual} must not precede ${expected}`)
  assert.ok(actual <= expected + 1_001, `${actual} must stay within one second of ${expected}`)
}
withinOneSecond(
  millisecondsUntilNextBerlinDateBoundary(Date.parse('2026-03-28T22:00:00Z')),
  60 * 60 * 1_000,
)
withinOneSecond(
  millisecondsUntilNextBerlinDateBoundary(Date.parse('2026-03-29T20:00:00Z')),
  2 * 60 * 60 * 1_000,
)
withinOneSecond(
  millisecondsUntilNextBerlinDateBoundary(Date.parse('2026-10-24T22:00:00Z')),
  25 * 60 * 60 * 1_000,
)

console.log('Learner learning-plan API tests passed')
