import { learnerPlanStatus } from '../../scripts/fixtures/learnerPlanStatus'
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
  parseLearnerPlanStatus,
  parsePreviewLearnerLearningPlansResponse,
  previewLearnerLearningPlans,
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
  buffer: { totalWorkdays: 8, remainingWorkdays: 6 },
  nextEligibleGoal: { goalId: 'analysis-1' },
  continueReason: null,
  canContinue: true,
}

const planDetail: LearnerLearningPlanDetail = {
  ...parseLearnerLearningPlansResponse({
    asOf: '2026-09-10',
    followLearningPlans: true,
    plans: [planSummary],
  status: learnerPlanStatus('2026-09-10', [planSummary.landscapeId]),
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
  status: learnerPlanStatus('2026-09-10', [planSummary.landscapeId], { followLearningPlans: false }),
  futureField: 'ignored',
})
assert.equal(parsed.followLearningPlans, false)
assert.equal(parsed.plans[0]?.currentBlock?.blockId, 'block-analysis')
assert.equal(parsed.plans[0]?.nextMilestone?.date, '2026-09-25')
assert.equal(parsed.plans[0]?.nextEligibleGoal?.goalId, 'analysis-1')
assert.equal('metrics' in parsed.plans[0], false)
assert.equal('pace' in parsed.plans[0], false)
assert.equal('statusDirection' in parsed.status, false, 'there is no cross-subject balance')
assert.deepEqual(parsed.status.subjects[0].periodGauge, { completed: 0, target: 2, needlePosition: 0 })
assert.deepEqual(parsed.status.subjects[0].balanceGauge, {
  net: 0, typicalAmount: 2, scaleLimit: 4, needlePosition: 0,
  severeBehind: false, strongAhead: false,
})
assert.throws(() => parseLearnerLearningPlansResponse({ ...parsed, status: null }), /status/u)
assert.throws(() => parseLearnerLearningPlansResponse({
  ...parsed, status: { ...parsed.status, asOf: '2026-09-11', periodStart: '2026-09-11', periodEnd: '2026-09-11' },
}), /status.snapshot/u)
assert.throws(() => parseLearnerPlanStatus({ ...parsed.status, subjects: [{ ...parsed.status.subjects[0], periodText: null }] }), /evaluability/u)
assert.throws(() => parseLearnerPlanStatus({ ...parsed.status, subjects: [{ ...parsed.status.subjects[0], periodGauge: undefined }] }), /periodGauge/u)
assert.throws(() => parseLearnerPlanStatus({ ...parsed.status, subjects: [{ ...parsed.status.subjects[0], periodGauge: { completed: 3, target: 2, needlePosition: 1 } }] }), /periodGauge/u)
assert.throws(() => parseLearnerPlanStatus({ ...parsed.status, subjects: [{ ...parsed.status.subjects[0], balanceGauge: { ...parsed.status.subjects[0].balanceGauge, needlePosition: 1.1 } }] }), /needlePosition/u)
assert.doesNotThrow(() => parseLearnerPlanStatus({ ...parsed.status, subjects: [{
  ...parsed.status.subjects[0], periodText: 'Heute kein Tagesziel',
  periodGauge: { completed: 0, target: 0, needlePosition: null }, balanceGauge: null,
}] }), 'a subject with no positive scheduled quota remains evaluable without a balance scale')
assert.throws(() => parseLearnerPlanStatus({ ...parsed.status, subjects: [{
  ...parsed.status.subjects[0], evaluable: false, periodText: null,
  planStatusText: null, subjectLine: null, statusDirection: null,
}] }), /evaluability/u, 'unevaluable subjects cannot carry quantitative gauges')

const legacySubject = { ...parsed.status.subjects[0] }
delete legacySubject.achievedGoalCount
delete legacySubject.targetGoalCount
delete legacySubject.balanceDialText
const parseSubjectUpdate = (changes: Record<string, unknown>) => parseLearnerPlanStatus({
  ...parsed.status,
  subjects: [{ ...legacySubject, ...changes }],
}).subjects[0]
const parsedLegacySubject = parseSubjectUpdate({})
assert.equal(Object.prototype.hasOwnProperty.call(parsedLegacySubject, 'achievedGoalCount'), false)
assert.equal(Object.prototype.hasOwnProperty.call(parsedLegacySubject, 'targetGoalCount'), false)
assert.equal(Object.prototype.hasOwnProperty.call(parsedLegacySubject, 'balanceDialText'), false)

const countedSubject = parseSubjectUpdate({
  achievedGoalCount: 10,
  targetGoalCount: 364,
  statusDirection: 'behind',
  planStatusText: 'Ein Lernziel im Rückstand',
  balanceDialText: '1 im Rückstand',
})
assert.equal(countedSubject.achievedGoalCount, 10)
assert.equal(countedSubject.targetGoalCount, 364)
assert.equal(countedSubject.planStatusText, 'Ein Lernziel im Rückstand')
assert.equal(countedSubject.balanceDialText, '1 im Rückstand')
const unavailableCounts = parseSubjectUpdate({ achievedGoalCount: null, targetGoalCount: null })
assert.deepEqual(
  [unavailableCounts.achievedGoalCount, unavailableCounts.targetGoalCount],
  [null, null],
)
for (const invalid of [
  { achievedGoalCount: 10 },
  { targetGoalCount: 364 },
  { achievedGoalCount: 10, targetGoalCount: null },
  { achievedGoalCount: null, targetGoalCount: 364 },
  { achievedGoalCount: 11, targetGoalCount: 10 },
  { achievedGoalCount: -1, targetGoalCount: 10 },
  { achievedGoalCount: 1.5, targetGoalCount: 10 },
  { achievedGoalCount: Number.MAX_SAFE_INTEGER + 1, targetGoalCount: Number.MAX_SAFE_INTEGER + 1 },
  { achievedGoalCount: 10, targetGoalCount: '364' },
]) {
  assert.throws(() => parseSubjectUpdate(invalid), /goalCounts|achievedGoalCount|targetGoalCount/u)
}
for (const invalid of [null, '', '   ', 1]) {
  assert.throws(() => parseSubjectUpdate({ balanceDialText: invalid }), /evaluability/u)
}
const unevaluableSubject = {
  evaluable: false,
  periodText: null,
  planStatusText: null,
  subjectLine: null,
  statusDirection: null,
  periodGauge: null,
  balanceGauge: null,
  balanceDialText: null,
  achievedGoalCount: 10,
  targetGoalCount: 364,
}
assert.equal(parseSubjectUpdate(unevaluableSubject).achievedGoalCount, 10,
  'goal counts may be available even when the plan balance is not evaluable')
for (const invalid of ['', '1 im Rückstand', undefined]) {
  assert.throws(() => parseSubjectUpdate({ ...unevaluableSubject, balanceDialText: invalid }), /evaluability/u)
}
assert.equal(parseSubjectUpdate({
  periodGauge: { completed: 0, target: 0, needlePosition: null },
  balanceGauge: null,
  balanceDialText: 'im Plan',
}).balanceDialText, 'im Plan', 'zero scheduled quota still permits a localized balance label')

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
  status: learnerPlanStatus('2026-09-10', [planSummary.landscapeId]),
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

// Plans are ordered by subject, exactly as the backend orders its status lines, so the
// cockpit and the chat never disagree about the order of subjects. Only unusable plans
// sort last; no urgency is derived from plan metrics any more.
const sorted = sortLearnerLearningPlansForToday([
  { ...parsed.plans[0], planId: 'stale', landscapeId: 'z', stale: true, canContinue: false, continueReason: 'personal-curriculum-changed' },
  { ...parsed.plans[0], planId: 'done', landscapeId: 'a', canContinue: false, continueReason: 'no-open-due-frontier-goal' },
  { ...parsed.plans[0], planId: 'actionable', landscapeId: 'p' },
])
assert.deepEqual(sorted.map(({ planId }) => planId), ['done', 'actionable', 'stale'])
assert.deepEqual(sortLearnerLearningPlansForToday([
  { ...parsed.plans[0], planId: 'physics', landscapeId: 'z' },
  { ...parsed.plans[0], planId: 'maths', landscapeId: 'a' },
], (landscapeId) => (landscapeId === 'a' ? 'Mathematik' : 'Physik'))
  .map(({ planId }) => planId), ['maths', 'physics'], 'subjects sort by their label')

let capturedUrl = ''
let capturedInit: RequestInit | undefined
let responseBody: unknown = {
  asOf: '2026-09-10',
  followLearningPlans: true,
  plans: [planSummary],
  status: learnerPlanStatus('2026-09-10', [planSummary.landscapeId]),
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
  language: 'en',
  fetchImpl,
})
assert.equal(
  capturedUrl,
  'https://api.example.test/api/ui/learners/learner-42/learning-plans?asOf=2026-09-10&language=en',
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

const previewRequest = {
  asOf: '2026-10-24',
  plans: [{ landscapeId: planDetail.landscapeId, expectedRevision: 3, blocks: [] }],
}
const previewResponse = {
  asOf: previewRequest.asOf,
  days: Array.from({ length: 7 }, (_, index) => {
    const date = `2026-10-${24 + index}`
    return { date, status: learnerPlanStatus(date, [planDetail.landscapeId]) }
  }),
}
assert.deepEqual(parsePreviewLearnerLearningPlansResponse(previewResponse, previewRequest), previewResponse)
for (const invalid of [
  { ...previewResponse, asOf: '2026-10-25' },
  { ...previewResponse, days: previewResponse.days.slice(1) },
  { ...previewResponse, days: previewResponse.days.map((day, index) => index === 1 ? { ...day, date: '2026-10-26' } : day) },
  { ...previewResponse, days: previewResponse.days.map((day) => ({ ...day, status: null })) },
  { ...previewResponse, days: previewResponse.days.map((day) => ({ ...day, status: { ...day.status, subjects: [] } })) },
  { ...previewResponse, days: previewResponse.days.map((day) => ({ ...day, status: { ...day.status, subjects: [...day.status.subjects, ...day.status.subjects] } })) },
  { ...previewResponse, days: previewResponse.days.map((day) => ({ ...day, status: { ...day.status, subjects: [{ ...day.status.subjects[0], landscapeIds: ['unexpected'] }] } })) },
]) assert.throws(() => parsePreviewLearnerLearningPlansResponse(invalid, previewRequest), /Invalid learning-plan/u)
const previewController = new AbortController()
let previewRequestCount = 0
assert.deepEqual(await previewLearnerLearningPlans('learner-42', previewRequest, {
  signal: previewController.signal,
  language: 'en',
  fetchImpl: (async (url, init) => {
    previewRequestCount += 1
    assert.equal(url, '/api/ui/learners/learner-42/learning-plans/preview?language=en')
    assert.equal(init?.method, 'POST')
    assert.equal(init?.credentials, 'include')
    assert.equal(init?.cache, 'no-store')
    assert.equal(init?.signal, previewController.signal)
    assert.deepEqual(JSON.parse(String(init?.body)), previewRequest)
    return new Response(JSON.stringify(previewResponse), { status: 200 })
  }) as typeof fetch,
}), previewResponse)
assert.equal(previewRequestCount, 1, 'preview never invokes activation or other writes')

console.log('Learner learning-plan API tests passed')
