import assert from 'node:assert/strict'
import type { UiGoal } from '../goalTypes'
import type { MapPracticeMaterial } from '../components/learningUnitMap/types'
import { requestUnitIntroductionGate, unitIntroductionForSelection } from './unitIntroduction'

const material: MapPracticeMaterial = { unit: { landscapeId: 'informatics', compositionNodeId: 'networks',
  viewIds: ['local-network-view'], orientationGoalId: 'network-introduction' },
intro: { de: { question: 'Wie kommt eine Nachricht an?', promise: 'Du erklärst den Weg einer Nachricht.' },
  en: { question: 'How does a message arrive?', promise: 'Explain the path of a message.' } }, exercises: [] }
const scope = { id: 'unit', landscapeId: 'informatics', extendedData: { compositionNodeId: 'networks', compositionViewId: 'local-network-view' } } as unknown as UiGoal
const introduction = { id: 'network-introduction', landscapeId: 'informatics' } as UiGoal
const leaf = { id: 'packet', landscapeId: 'informatics' } as UiGoal
const goals = new Map([scope, introduction, leaf].map(goal => [goal.id, goal]))
assert.equal(unitIntroductionForSelection(scope, [scope.id], goals, [material]), material)
assert.equal(unitIntroductionForSelection(introduction, [introduction.id, scope.id], goals, [material]), material)
assert.equal(unitIntroductionForSelection(introduction, [introduction.id], goals, [material]), undefined,
  'An orientation ID alone does not prove applicability in the selected view')
assert.equal(unitIntroductionForSelection(leaf, [leaf.id, scope.id], goals, [material]), undefined,
  'Browsing an atomic goal stays on that goal')
assert.equal(unitIntroductionForSelection({ ...scope, extendedData: { ...scope.extendedData, compositionViewId: 'other-view' } },
  [scope.id], goals, [material]), undefined)
let requests = 0
const fetchImpl: typeof fetch = async (url, options) => {
  requests++
  assert.equal(options?.cache, 'no-store')
  const parsed = new URL(String(url))
  assert.equal(parsed.pathname, '/api/ui/learners/learner%2Fone/unit-introduction')
  assert.equal(parsed.searchParams.get('goalId'), 'unit:network & packet')
  return new Response(JSON.stringify({ orientationGoalId: requests === 1 ? introduction.id : null }))
}
assert.equal(await requestUnitIntroductionGate('learner/one', 'unit:network & packet', { fetchImpl, apiBase: 'https://example.test/' }), introduction.id)
assert.equal(await requestUnitIntroductionGate('learner/one', 'unit:network & packet', { fetchImpl, apiBase: 'https://example.test' }), null)
for (const body of [{}, { orientationGoalId: '' }, { orientationGoalId: false }, [], null]) {
  await assert.rejects(requestUnitIntroductionGate('learner', 'goal', {
    fetchImpl: async () => new Response(JSON.stringify(body)), apiBase: '',
  }))
}
await assert.rejects(requestUnitIntroductionGate('learner', 'goal', {
  fetchImpl: async () => new Response('', { status: 503 }), apiBase: '',
}))
console.log('Unit introduction: view-bound selection, independent Informatics content, encoded read-only backend gate, fail-closed unavailable/invalid responses passed.')
