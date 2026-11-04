import {
  clearDeletedLearnerBrowserState,
  LearnerDataApiError,
  requestLearnerDeletion,
  requestLearnerResume,
  requestLearnerRetention,
} from './learnerDataManagement'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const assertRejects = async (
  action: () => Promise<unknown>,
  verify: (error: unknown) => boolean,
  message: string,
) => {
  try {
    await action()
  } catch (error) {
    if (verify(error)) return
    throw new Error(`${message}: unexpected error ${String(error)}`)
  }
  throw new Error(message)
}

interface CapturedRequest {
  input: RequestInfo | URL
  init?: RequestInit
}

const createFetcher = (response: Response) => {
  const requests: CapturedRequest[] = []
  const fetcher = (async (input: RequestInfo | URL, init?: RequestInit) => {
    requests.push({ input, init })
    return response
  }) as typeof fetch
  return { fetcher, requests }
}

const retentionPayload = {
  lastActivityAt: '2026-08-13T08:00:00Z',
  scheduledDeletionAt: '2027-08-13T08:00:00Z',
}

{
  const { fetcher, requests } = createFetcher(new Response(
    JSON.stringify(retentionPayload),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  ))
  const result = await requestLearnerResume(fetcher, 'https://example.test/', ' learner-id ')
  assert(result.lastActivityAt === retentionPayload.lastActivityAt, 'resume returns lastActivityAt')
  assert(result.scheduledDeletionAt === retentionPayload.scheduledDeletionAt, 'resume returns scheduledDeletionAt')
  assert(requests.length === 1, 'resume performs one request')
  assert(String(requests[0].input) === 'https://example.test/api/ui/learners/learner-id/resume', 'resume uses the exact endpoint')
  assert(requests[0].init?.method === 'POST', 'resume uses POST')
  assert(requests[0].init?.body === undefined, 'resume deliberately sends no request body')
}

{
  const { fetcher, requests } = createFetcher(new Response(
    JSON.stringify(retentionPayload),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  ))
  await requestLearnerRetention(fetcher, '', 'learner/id')
  assert(String(requests[0].input) === '/api/ui/learners/learner%2Fid/retention', 'retention encodes the learner ID')
  assert(requests[0].init?.method === 'GET', 'retention uses a read-only GET')
}

{
  const { fetcher, requests } = createFetcher(new Response(null, { status: 204 }))
  await requestLearnerDeletion(fetcher, '', 'learner-id')
  assert(String(requests[0].input) === '/api/ui/learners/learner-id', 'deletion targets the learner resource')
  assert(requests[0].init?.method === 'DELETE', 'deletion uses DELETE')
  assert(
    requests[0].init?.body === JSON.stringify({ confirmationSkillpilotId: 'learner-id' }),
    'deletion sends the exact ID confirmation object',
  )
  const headers = new Headers(requests[0].init?.headers)
  assert(headers.get('Content-Type') === 'application/json', 'deletion declares its JSON confirmation')
}

{
  const { fetcher } = createFetcher(new Response(null, { status: 404 }))
  await assertRejects(
    () => requestLearnerRetention(fetcher, '', 'missing-id'),
    error => error instanceof LearnerDataApiError && error.status === 404,
    'retention exposes a typed not-found error',
  )
}

{
  const { fetcher } = createFetcher(new Response(
    JSON.stringify({ ...retentionPayload, scheduledDeletionAt: 'not-a-date' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  ))
  await assertRejects(
    () => requestLearnerResume(fetcher, '', 'learner-id'),
    error => String(error).includes('invalid-learner-retention-response:scheduledDeletionAt'),
    'resume rejects a malformed retention contract',
  )
}

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>()

  get length() {
    return this.values.size
  }

  clear() {
    this.values.clear()
  }

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  setItem(key: string, value: string) {
    this.values.set(key, String(value))
  }
}

{
  const learnerId = 'learner-id'
  const local = new MemoryStorage()
  const session = new MemoryStorage()
  const deletedKeys = [
    `srs_state_${learnerId}_goal-a`,
    `srs_state_last_sync_${learnerId}_goal-a`,
    `verified_recall_batch_size_${learnerId}_goal-a`,
    `skillpilot:learner-tree-expanded:${learnerId}:curriculum`,
    `skillpilot_abi26_personalization_initialized:${encodeURIComponent(learnerId)}:curriculum`,
  ]
  deletedKeys.forEach(key => local.setItem(key, 'value'))
  local.setItem('skillpilot_id', learnerId)
  local.setItem('skillpilot_role', 'learner')
  local.setItem('skillpilot_learner_landscape', 'curriculum')
  local.setItem('skillpilot_lang', 'de')
  local.setItem('skillpilot_theme', 'dark')
  local.setItem('skillpilot_terms_accepted_version', '1.0.0')
  local.setItem('srs_state_other-id_goal-a', 'keep')
  local.setItem('skillpilot_campaign_context', JSON.stringify({ skillpilotId: learnerId }))
  local.setItem('skillpilot_campaign_events', JSON.stringify([
    { skillpilotId: learnerId, event: 'delete' },
    { skillpilotId: 'other-id', event: 'keep' },
  ]))
  local.setItem('skillpilot_classes', JSON.stringify([
    {
      id: 'class-a',
      name: 'Class A',
      students: [
        { id: learnerId, name: 'Deleted learner' },
        { id: 'other-id', name: 'Other learner' },
      ],
    },
    {
      id: 'class-b',
      name: 'Class B',
      students: [{ id: 'third-id', name: 'Third learner' }],
    },
  ]))
  session.setItem('skillpilot_ui_session_id', 'ui-session')
  session.setItem('skillpilot_openai_mcp_eligibility_confirmed', learnerId)
  session.setItem('unrelated-session-setting', 'keep')

  clearDeletedLearnerBrowserState(local, session, learnerId)

  for (const key of deletedKeys) {
    assert(local.getItem(key) === null, `cleanup removes learner-specific ${key}`)
  }
  assert(local.getItem('skillpilot_id') === null, 'cleanup removes the current deleted learner ID')
  assert(local.getItem('skillpilot_role') === null, 'cleanup removes the current learner role')
  assert(local.getItem('skillpilot_learner_landscape') === null, 'cleanup removes the current learner landscape')
  assert(local.getItem('skillpilot_campaign_context') === null, 'cleanup removes matching campaign context')
  assert(session.getItem('skillpilot_ui_session_id') === null, 'cleanup removes the current UI session')
  assert(session.getItem('skillpilot_openai_mcp_eligibility_confirmed') === null, 'cleanup removes matching provider eligibility')
  assert(local.getItem('skillpilot_lang') === 'de', 'cleanup preserves the shared language preference')
  assert(local.getItem('skillpilot_theme') === 'dark', 'cleanup preserves the shared theme preference')
  assert(local.getItem('skillpilot_terms_accepted_version') === '1.0.0', 'cleanup preserves legal acceptance')
  assert(local.getItem('srs_state_other-id_goal-a') === 'keep', 'cleanup preserves data for another learner ID')
  assert(session.getItem('unrelated-session-setting') === 'keep', 'cleanup preserves unrelated session state')
  assert(
    local.getItem('skillpilot_campaign_events') === JSON.stringify([
      { skillpilotId: 'other-id', event: 'keep' },
    ]),
    'cleanup filters only the deleted learner campaign events',
  )
  assert(
    local.getItem('skillpilot_classes') === JSON.stringify([
      {
        id: 'class-a',
        name: 'Class A',
        students: [{ id: 'other-id', name: 'Other learner' }],
      },
      {
        id: 'class-b',
        name: 'Class B',
        students: [{ id: 'third-id', name: 'Third learner' }],
      },
    ]),
    'cleanup filters only the deleted learner from locally stored trainer classes',
  )
}

{
  const local = new MemoryStorage()
  const session = new MemoryStorage()
  local.setItem('skillpilot_classes', '{not-json')

  clearDeletedLearnerBrowserState(local, session, 'learner-id')

  assert(
    local.getItem('skillpilot_classes') === '{not-json',
    'cleanup preserves malformed shared trainer data instead of rewriting it',
  )
}

console.log('learner data management API and cleanup tests passed')
