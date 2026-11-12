import type { LearnerLearningPlansResponse } from '../learnerLearningPlanTypes'

/**
 * Requests for the first Cockpit view, started as soon as the app knows the
 * learner instead of after the skill graph, the composition views and the
 * Cockpit code have arrived. The learner state gates the first view and takes
 * the longest on the backend, so starting it early removes that wait from the
 * end of the loading sequence.
 *
 * Each started request serves exactly one consumer: the first load of the
 * Cockpit takes it, and every later load or refresh asks the backend again.
 */
export const COCKPIT_START_REQUEST_MAX_AGE_MS = 15_000

/**
 * The backend answers the state and the plans of one learner one after the
 * other. The state decides when the Cockpit appears, so it goes first.
 */
export const LEARNING_PLANS_START_DELAY_MS = 150

export type LearnerStateStartAnswer = { ok: boolean; payload: unknown }

type StartedRequest = { startedAt: number; answer: Promise<unknown> }

const startedRequests = new Map<string, StartedRequest>()
const startedLearners = new Set<string>()

const learnerStateKey = (skillpilotId: string) => `state\u0000${skillpilotId}`
const learningPlansKey = (skillpilotId: string, language: string) => `plans\u0000${skillpilotId}\u0000${language}`

const start = (key: string, load: () => Promise<unknown>, now: () => number) => {
  const answer = load()
  // Nobody may be waiting when a start request fails; its consumer handles it.
  answer.catch(() => undefined)
  startedRequests.set(key, { startedAt: now(), answer })
}

const take = <T,>(key: string, now: () => number): Promise<T> | null => {
  const started = startedRequests.get(key)
  if (!started) return null
  startedRequests.delete(key)
  if (now() - started.startedAt >= COCKPIT_START_REQUEST_MAX_AGE_MS) return null
  return started.answer as Promise<T>
}

interface StartOptions {
  now?: () => number
  fetchImpl?: typeof fetch
  loadLearningPlans?: (skillpilotId: string, language: 'de' | 'en') => Promise<LearnerLearningPlansResponse>
  delay?: (milliseconds: number) => Promise<void>
}

/**
 * Starts the state and plan requests of one learner, once per page load. A
 * language change, a new route or a re-render never starts them again.
 */
export function startCockpitRequests(
  skillpilotId: string,
  language: 'de' | 'en',
  options: StartOptions = {},
): void {
  if (!skillpilotId || startedLearners.has(skillpilotId)) return
  startedLearners.add(skillpilotId)
  const now = options.now ?? Date.now
  const fetchImpl = options.fetchImpl ?? fetch
  const delay = options.delay
    ?? ((milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds)))
  // The plan API is loaded on demand so the app shell of every page stays small.
  const loadLearningPlans = options.loadLearningPlans
    ?? (async (id: string, planLanguage: 'de' | 'en') => {
      const { getLearnerLearningPlans } = await import('./learnerLearningPlanApi')
      return getLearnerLearningPlans(id, undefined, { language: planLanguage })
    })
  const apiBase = (import.meta.env?.VITE_API_BASE ?? '').replace(/\/+$/, '')

  start(learnerStateKey(skillpilotId), async (): Promise<LearnerStateStartAnswer> => {
    const response = await fetchImpl(`${apiBase}/api/ui/learners/${skillpilotId}/state`)
    return { ok: response.ok, payload: response.ok ? await response.json() : null }
  }, now)
  start(learningPlansKey(skillpilotId, language), async () => {
    await delay(LEARNING_PLANS_START_DELAY_MS)
    return loadLearningPlans(skillpilotId, language)
  }, now)
}

/** The started state request, if the first Cockpit load has not used it yet. */
export function takeStartedLearnerState(
  skillpilotId: string,
  now: () => number = Date.now,
): Promise<LearnerStateStartAnswer> | null {
  return take<LearnerStateStartAnswer>(learnerStateKey(skillpilotId), now)
}

/** The started plan request for this display language, if still unused. */
export function takeStartedLearningPlans(
  skillpilotId: string,
  language: 'de' | 'en',
  now: () => number = Date.now,
): Promise<LearnerLearningPlansResponse> | null {
  return take<LearnerLearningPlansResponse>(learningPlansKey(skillpilotId, language), now)
}

/** Test seam: forget everything started on this page. */
export function resetCockpitStartRequests() {
  startedRequests.clear()
  startedLearners.clear()
}
