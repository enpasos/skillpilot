import assert from 'node:assert/strict'
import type { LearnerLearningPlansResponse } from '../learnerLearningPlanTypes'
import {
  COCKPIT_START_REQUEST_MAX_AGE_MS,
  LEARNING_PLANS_START_DELAY_MS,
  resetCockpitStartRequests,
  startCockpitRequests,
  takeStartedLearnerState,
  takeStartedLearningPlans,
} from './cockpitStartRequests'
import {
  LEARNER_PROFILE_START_WINDOW_MS,
  LearnerProfileRequestError,
  loadLearnerProfile,
  resetLearnerProfileRequests,
} from './learnerProfileRequest'

const learner = 'learner-a'
const plans = { asOf: '2026-11-12', followLearningPlans: true, plans: [] } as unknown as LearnerLearningPlansResponse

const harness = () => {
  let time = 1_000
  const events: string[] = []
  let releaseDelay: () => void = () => undefined
  const stateAnswer = { stateMachine: { requiredAction: 'teachActiveGoal' } }
  const options = {
    now: () => time,
    fetchImpl: (async (url: string) => {
      events.push(`fetch ${url}`)
      return { ok: true, json: async () => stateAnswer } as Response
    }) as typeof fetch,
    delay: (milliseconds: number) => new Promise<void>((resolve) => {
      events.push(`delay ${milliseconds}`)
      releaseDelay = resolve
    }),
    loadLearningPlans: async (id: string, language: 'de' | 'en') => {
      events.push(`plans ${id} ${language}`)
      return plans
    },
  }
  return { events, options, stateAnswer, advance: (milliseconds: number) => { time += milliseconds }, release: () => releaseDelay() }
}

// The state is requested at once, the plans only after their head start.
{
  resetCockpitStartRequests()
  const { events, options, stateAnswer, release } = harness()
  startCockpitRequests(learner, 'de', options)
  assert.deepEqual(events, [`fetch /api/ui/learners/${learner}/state`, `delay ${LEARNING_PLANS_START_DELAY_MS}`],
    'The state gates the first view, so it is on its way before the plans.')

  const state = takeStartedLearnerState(learner, options.now)
  assert(state, 'The first Cockpit load receives the started state request.')
  assert.deepEqual(await state, { ok: true, payload: stateAnswer })
  assert.equal(takeStartedLearnerState(learner, options.now), null, 'A refresh never reuses the start request.')

  const startedPlans = takeStartedLearningPlans(learner, 'de', options.now)
  assert(startedPlans)
  release()
  assert.equal(await startedPlans, plans)
  assert.deepEqual(events.slice(2), [`plans ${learner} de`])
  assert.equal(takeStartedLearningPlans(learner, 'de', options.now), null)

  // A language change, another route or a re-render must not request the state again.
  startCockpitRequests(learner, 'en', options)
  startCockpitRequests(learner, 'de', options)
  assert.equal(events.length, 3)
  assert.equal(takeStartedLearnerState(learner, options.now), null)
}

// A plan answer in another display language and an outdated start request are not used.
{
  resetCockpitStartRequests()
  const { options, advance } = harness()
  startCockpitRequests(learner, 'de', options)
  assert.equal(takeStartedLearningPlans(learner, 'en', options.now), null,
    'The plan status is worded in the display language.')
  assert.equal(takeStartedLearnerState('learner-b', options.now), null)
  advance(COCKPIT_START_REQUEST_MAX_AGE_MS)
  assert.equal(takeStartedLearnerState(learner, options.now), null, 'An old answer is not a current state.')
  assert.equal(takeStartedLearnerState(learner, options.now), null)
}

// A failed start request reaches its consumer as a failure and nobody else.
{
  resetCockpitStartRequests()
  const { options } = harness()
  const unhandled: unknown[] = []
  const onUnhandled = (reason: unknown) => unhandled.push(reason)
  process.on('unhandledRejection', onUnhandled)
  startCockpitRequests(learner, 'de', {
    ...options,
    fetchImpl: (async () => { throw new Error('offline') }) as typeof fetch,
  })
  const state = takeStartedLearnerState(learner, options.now)
  assert(state)
  await assert.rejects(state, /offline/u)
  startCockpitRequests('learner-c', 'de', {
    ...options,
    fetchImpl: (async () => ({ ok: false, json: async () => ({}) }) as Response) as typeof fetch,
  })
  assert.deepEqual(await takeStartedLearnerState('learner-c', options.now), { ok: false, payload: null },
    'An error status carries no payload; the Cockpit then asks again itself.')
  await new Promise((resolve) => setImmediate(resolve))
  process.off('unhandledRejection', onUnhandled)
  assert.deepEqual(unhandled, [], 'An unused failed start request must not surface as an unhandled rejection.')
}

// Learner profile: the app shell and the first Cockpit read share one request.
{
  resetLearnerProfileRequests()
  let time = 5_000
  let requests = 0
  const options = {
    now: () => time,
    fetchImpl: (async () => {
      requests += 1
      return { ok: true, json: async () => ({ personalCurriculum: '{}', nested: { revision: requests } }) } as Response
    }) as typeof fetch,
  }
  const shell = await loadLearnerProfile<{ nested: { revision: number } }>(learner, options)
  const cockpit = await loadLearnerProfile<{ nested: { revision: number } }>(learner, { ...options, reuseStartRequest: true })
  assert.equal(requests, 1)
  assert.deepEqual(cockpit, shell)
  cockpit.nested.revision = 99
  assert.equal(shell.nested.revision, 1, 'Each reader owns its copy of the answer.')

  await loadLearnerProfile(learner, options)
  assert.equal(requests, 2, 'Without the explicit start reuse every read asks the backend.')
  await loadLearnerProfile('learner-b', { ...options, reuseStartRequest: true })
  assert.equal(requests, 3, 'Another learner never receives a shared answer.')
  await loadLearnerProfile(learner, { ...options, reuseStartRequest: true })
  assert.equal(requests, 4, 'Only the most recent request of the same learner is shared.')
  time += LEARNER_PROFILE_START_WINDOW_MS
  await loadLearnerProfile(learner, { ...options, reuseStartRequest: true })
  assert.equal(requests, 5, 'After the start window the profile is read again.')
}

// A failed profile request is reported with its status and never shared.
{
  resetLearnerProfileRequests()
  let requests = 0
  const failing = {
    now: () => 0,
    fetchImpl: (async () => {
      requests += 1
      return { ok: false, status: 404, json: async () => ({}) } as Response
    }) as typeof fetch,
  }
  await assert.rejects(loadLearnerProfile(learner, failing), (error: unknown) =>
    error instanceof LearnerProfileRequestError && error.status === 404)
  await assert.rejects(loadLearnerProfile(learner, { ...failing, reuseStartRequest: true }), LearnerProfileRequestError)
  assert.equal(requests, 2)
}

console.log('Cockpit start request and learner profile request tests passed.')
