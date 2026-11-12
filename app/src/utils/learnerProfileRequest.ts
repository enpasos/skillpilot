/**
 * One request for the learner profile while the Cockpit starts.
 *
 * The app shell reads the profile to choose the composition views, and the
 * Cockpit reads the same profile a moment later for its settings. Within the
 * short start window both use one answer; every later read — after a change,
 * a reload request or a refresh — asks the backend again.
 */
export type LearnerProfilePayload = Record<string, unknown>

/** How long the Cockpit may reuse the profile the app shell has just requested. */
export const LEARNER_PROFILE_START_WINDOW_MS = 10_000

type ProfileRequest = {
  skillpilotId: string
  startedAt: number
  payload: Promise<LearnerProfilePayload>
}

let latestRequest: ProfileRequest | null = null

const learnerProfileUrl = (skillpilotId: string) => {
  const apiBase = (import.meta.env?.VITE_API_BASE ?? '').replace(/\/+$/, '')
  return apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}` : `/api/ui/learners/${skillpilotId}`
}

export class LearnerProfileRequestError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`Failed to load learner profile (${status})`)
    this.name = 'LearnerProfileRequestError'
    this.status = status
  }
}

/**
 * Loads the learner profile. With `reuseStartRequest` a request started within
 * the start window is shared instead of repeated. Each caller receives its own
 * copy of the answer.
 */
export function loadLearnerProfile<T = LearnerProfilePayload>(
  skillpilotId: string,
  options: { reuseStartRequest?: boolean; now?: () => number; fetchImpl?: typeof fetch } = {},
): Promise<T> {
  const now = options.now ?? Date.now
  const reusable = options.reuseStartRequest
    && latestRequest?.skillpilotId === skillpilotId
    && now() - latestRequest.startedAt < LEARNER_PROFILE_START_WINDOW_MS
    ? latestRequest
    : null
  if (reusable) return reusable.payload.then((payload) => structuredClone(payload) as T)

  const request: ProfileRequest = {
    skillpilotId,
    startedAt: now(),
    payload: (options.fetchImpl ?? fetch)(learnerProfileUrl(skillpilotId)).then(async (response) => {
      if (!response.ok) throw new LearnerProfileRequestError(response.status)
      return await response.json() as LearnerProfilePayload
    }),
  }
  latestRequest = request
  // A failed request is never handed to a later caller.
  request.payload.catch(() => {
    if (latestRequest === request) latestRequest = null
  })
  return request.payload.then((payload) => structuredClone(payload) as T)
}

/** Test seam: forget the request of the start window. */
export function resetLearnerProfileRequests() {
  latestRequest = null
}
