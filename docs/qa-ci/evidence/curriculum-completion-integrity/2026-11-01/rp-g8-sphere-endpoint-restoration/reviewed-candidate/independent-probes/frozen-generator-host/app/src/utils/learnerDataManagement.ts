import { sanitizeSkillpilotId } from './skillpilotId'

export interface LearnerRetentionStatus {
  lastActivityAt: string
  scheduledDeletionAt: string
}

export class LearnerDataApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'LearnerDataApiError'
    this.status = status
  }
}

type FetchLike = typeof fetch

interface MutableStorage {
  readonly length: number
  getItem(key: string): string | null
  key(index: number): string | null
  removeItem(key: string): void
  setItem(key: string, value: string): void
}

const learnerUrl = (apiBase: string, skillpilotId: string, suffix: string) => {
  const base = apiBase.replace(/\/+$/, '')
  const path = `/api/ui/learners/${encodeURIComponent(skillpilotId)}${suffix}`
  return base ? `${base}${path}` : path
}

const requireSkillpilotId = (value: string) => {
  const sanitized = sanitizeSkillpilotId(value)
  if (!sanitized) throw new Error('missing-skillpilot-id')
  return sanitized
}

const requireInstant = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || !value.trim() || !Number.isFinite(Date.parse(value))) {
    throw new Error(`invalid-learner-retention-response:${field}`)
  }
  return value
}

const parseRetentionStatus = (value: unknown): LearnerRetentionStatus => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('invalid-learner-retention-response')
  }
  const record = value as Record<string, unknown>
  return {
    lastActivityAt: requireInstant(record.lastActivityAt, 'lastActivityAt'),
    scheduledDeletionAt: requireInstant(record.scheduledDeletionAt, 'scheduledDeletionAt'),
  }
}

const requireOk = async (response: Response, operation: string) => {
  if (response.ok) return
  throw new LearnerDataApiError(response.status, `${operation}-failed:${response.status}`)
}

export const requestLearnerResume = async (
  fetcher: FetchLike,
  apiBase: string,
  skillpilotId: string,
): Promise<LearnerRetentionStatus> => {
  const id = requireSkillpilotId(skillpilotId)
  const response = await fetcher(learnerUrl(apiBase, id, '/resume'), {
    method: 'POST',
    headers: { Accept: 'application/json' },
  })
  await requireOk(response, 'learner-resume')
  return parseRetentionStatus(await response.json())
}

export const requestLearnerRetention = async (
  fetcher: FetchLike,
  apiBase: string,
  skillpilotId: string,
): Promise<LearnerRetentionStatus> => {
  const id = requireSkillpilotId(skillpilotId)
  const response = await fetcher(learnerUrl(apiBase, id, '/retention'), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })
  await requireOk(response, 'learner-retention')
  return parseRetentionStatus(await response.json())
}

export const requestLearnerDeletion = async (
  fetcher: FetchLike,
  apiBase: string,
  skillpilotId: string,
): Promise<void> => {
  const id = requireSkillpilotId(skillpilotId)
  const response = await fetcher(learnerUrl(apiBase, id, ''), {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ confirmationSkillpilotId: id }),
  })
  await requireOk(response, 'learner-deletion')
  if (response.status !== 204) {
    throw new Error(`invalid-learner-deletion-response:${response.status}`)
  }
}

const removeKeysWithPrefixes = (
  storage: MutableStorage,
  prefixes: readonly string[],
) => {
  const keys: string[] = []
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index)
    if (key && prefixes.some(prefix => key.startsWith(prefix))) keys.push(key)
  }
  keys.forEach(key => storage.removeItem(key))
}

const removeMatchingCampaignContext = (storage: MutableStorage, skillpilotId: string) => {
  const key = 'skillpilot_campaign_context'
  try {
    const raw = storage.getItem(key)
    if (!raw) return
    const value = JSON.parse(raw) as Record<string, unknown>
    if (value?.skillpilotId === skillpilotId) storage.removeItem(key)
  } catch {
    // A malformed shared entry is not proven to belong to the deleted learner.
  }
}

const removeMatchingCampaignEvents = (storage: MutableStorage, skillpilotId: string) => {
  const key = 'skillpilot_campaign_events'
  try {
    const raw = storage.getItem(key)
    if (!raw) return
    const value = JSON.parse(raw) as unknown
    if (!Array.isArray(value)) return
    const retained = value.filter(event => (
      !event
      || typeof event !== 'object'
      || (event as Record<string, unknown>).skillpilotId !== skillpilotId
    ))
    if (retained.length === 0) storage.removeItem(key)
    else if (retained.length !== value.length) storage.setItem(key, JSON.stringify(retained))
  } catch {
    // A malformed shared entry is not proven to belong to the deleted learner.
  }
}

const removeMatchingTrainerStudents = (storage: MutableStorage, skillpilotId: string) => {
  const key = 'skillpilot_classes'
  try {
    const raw = storage.getItem(key)
    if (!raw) return
    const value = JSON.parse(raw) as unknown
    if (!Array.isArray(value)) return
    let changed = false
    const retained = value.map((classSession) => {
      if (!classSession || typeof classSession !== 'object' || Array.isArray(classSession)) {
        return classSession
      }
      const record = classSession as Record<string, unknown>
      if (!Array.isArray(record.students)) return classSession
      const students = record.students.filter((student) => (
        !student
        || typeof student !== 'object'
        || Array.isArray(student)
        || (student as Record<string, unknown>).id !== skillpilotId
      ))
      if (students.length === record.students.length) return classSession
      changed = true
      return { ...record, students }
    })
    if (changed) storage.setItem(key, JSON.stringify(retained))
  } catch {
    // Malformed shared trainer data is not rewritten during learner cleanup.
  }
}

/**
 * Removes only browser state attributable to one successfully deleted learner.
 * Shared preferences and legal acceptance deliberately remain untouched.
 */
export const clearDeletedLearnerBrowserState = (
  local: MutableStorage,
  session: MutableStorage,
  skillpilotId: string,
) => {
  const id = requireSkillpilotId(skillpilotId)
  const wasCurrentLearner = local.getItem('skillpilot_id') === id

  removeKeysWithPrefixes(local, [
    `srs_state_${id}_`,
    `srs_state_last_sync_${id}_`,
    `verified_recall_batch_size_${id}_`,
    `skillpilot:learner-tree-expanded:${id}:`,
    `skillpilot_abi26_personalization_initialized:${encodeURIComponent(id)}:`,
  ])
  removeMatchingCampaignContext(local, id)
  removeMatchingCampaignEvents(local, id)
  removeMatchingTrainerStudents(local, id)

  if (wasCurrentLearner) {
    local.removeItem('skillpilot_id')
    local.removeItem('skillpilot_role')
    local.removeItem('skillpilot_learner_landscape')
    session.removeItem('skillpilot_ui_session_id')
  }
  if (session.getItem('skillpilot_openai_mcp_eligibility_confirmed') === id) {
    session.removeItem('skillpilot_openai_mcp_eligibility_confirmed')
  }
}
