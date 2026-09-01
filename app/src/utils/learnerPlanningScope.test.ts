import assert from 'node:assert/strict'

import { fetchLearnerPlanningScope } from './learnerPlanningScope'

const originalFetch = globalThis.fetch
let requestedUrl = ''
let requestedCache: RequestCache | undefined

try {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    requestedUrl = String(input)
    requestedCache = init?.cache
    return new Response(JSON.stringify({
      curriculumId: 'canonical-mathematics',
      landscapeId: 'canonical-mathematics',
      scopeAtomicGoalIds: ['sek1-a', 'sek1-b', 'sek2-a'],
      totalAtomicGoalCount: 3,
      masteredAtomicGoalCount: 1,
      openAtomicGoalIds: ['sek1-b', 'sek2-a'],
      capturedAt: '2026-09-01T08:00:00.000Z',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }) as typeof fetch

  const baseline = await fetchLearnerPlanningScope({
    learnerId: 'learner / 1',
    landscapeId: 'canonical-mathematics',
  })
  const url = new URL(requestedUrl, 'https://skillpilot.example')
  assert.equal(url.pathname, '/api/ui/learners/learner%20%2F%201/planning-scope')
  assert.equal(url.searchParams.get('landscapeId'), 'canonical-mathematics')
  assert.equal(url.searchParams.has('scopeGoalId'), false)
  assert.equal(requestedCache, 'no-store')
  assert.deepEqual(baseline, {
    source: 'learner-planning-landscape-v1',
    curriculumId: 'canonical-mathematics',
    landscapeId: 'canonical-mathematics',
    scopeAtomicGoalIds: ['sek1-a', 'sek1-b', 'sek2-a'],
    openAtomicGoalIds: ['sek1-b', 'sek2-a'],
    totalAtomicGoalCount: 3,
    masteredAtomicGoalCount: 1,
    capturedAt: '2026-09-01T08:00:00.000Z',
  })
} finally {
  globalThis.fetch = originalFetch
}

console.log('Learner planning-scope client tests passed.')
