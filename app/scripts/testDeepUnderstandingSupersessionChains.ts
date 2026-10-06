import assert from 'node:assert/strict'
import {
  buildResolutionSupersessionChains,
  hasIntactResolutionSupersessionChain,
} from './reportDeepUnderstandingRollout'

const edge = (from: string, to: string, goalId = 'goal-a') => ({
  goalId, supersededIndexPath: from, replacementIndexPath: to,
})
const registered = ['original.json', 'revision.json', 'current.json', 'other.json']
const current = new Set(['goal-a', 'goal-b'])
const twoEdges = [edge('original.json', 'revision.json'), edge('revision.json', 'current.json')]
const expected = [{ goalId: 'goal-a', indexPaths: ['original.json', 'revision.json', 'current.json'] }]
for (const ordered of [twoEdges, [...twoEdges].reverse()]) {
  const result = buildResolutionSupersessionChains(ordered, registered, current)
  assert.deepEqual(result.chains, expected, 'A two-step replacement keeps both historical indices and the current terminal.')
  assert.deepEqual(result.issues, [])
  assert.equal(result.invalidGoalIds.size, 0)
}
assert.deepEqual(buildResolutionSupersessionChains([twoEdges[0]], registered, current).chains,
  [{ goalId: 'goal-a', indexPaths: ['original.json', 'revision.json'] }],
  'Existing single replacements keep their previous meaning.')
const invalidCases = [
  [twoEdges[0], edge('original.json', 'other.json')], // fork
  [twoEdges[0], edge('other.json', 'revision.json')], // merging histories
  [twoEdges[0], edge('revision.json', 'original.json')], // cycle
  [twoEdges[0], edge('current.json', 'other.json')], // disconnected chains
  [...twoEdges, edge('current.json', 'unregistered.json')],
  [edge('unregistered.json', 'current.json')],
  [edge('original.json', 'original.json')],
  [twoEdges[0], twoEdges[0]], // duplicate edge
  [edge('original.json', 'current.json', 'retired-goal')],
]
for (const edges of invalidCases) {
  const result = buildResolutionSupersessionChains(edges, registered, current)
  assert.equal(result.chains.length, 0, JSON.stringify(edges))
  assert.equal(result.invalidGoalIds.size, 1)
  assert.equal(result.issues.length, 1)
}
const mixed = buildResolutionSupersessionChains([
  ...twoEdges, edge('original.json', 'other.json'), edge('original.json', 'current.json', 'goal-b'),
], registered, current)
assert.deepEqual(mixed.chains, [{ goalId: 'goal-b', indexPaths: ['original.json', 'current.json'] }],
  'Invalidity is isolated to the actual goal; another valid chain retains its historical claims.')

const index = (path: string, terminal = false) => ({
  path, ready: new Set(terminal ? ['goal-a'] : []),
  claimedGoalIds: new Set(terminal ? ['goal-a'] : []), historicalClaimedGoalIds: new Set(['goal-a']),
  issues: [] as string[],
})
const complete = [index('original.json'), index('revision.json'), index('current.json', true)]
assert.equal(hasIntactResolutionSupersessionChain(expected[0], complete), true)
assert.equal(hasIntactResolutionSupersessionChain(expected[0], [...complete].reverse()), true,
  'Native index validation order does not change ownership.')
for (const position of [0, 1, 2]) {
  const changed = complete.map((value, i) => i === position ? { ...value, historicalClaimedGoalIds: new Set(['different-goal']) } : value)
  assert.equal(hasIntactResolutionSupersessionChain(expected[0], changed), false,
    'Every source and replacement must actually claim the same current goal.')
  assert.equal(hasIntactResolutionSupersessionChain(expected[0], complete.filter((_, i) => i !== position)), false)
  assert.equal(hasIntactResolutionSupersessionChain(expected[0], complete.map((value, i) => i === position ? { ...value, issues: ['Broken historical digest or current review binding'] } : value)), false)
}
assert.equal(hasIntactResolutionSupersessionChain(expected[0], complete.map((value, i) => i === 2 ? { ...value, ready: new Set<string>() } : value)), false,
  'An open or stale terminal cannot restore historical completion.')
assert.equal(hasIntactResolutionSupersessionChain(expected[0], complete.map((value, i) => i === 1 ? { ...value, claimedGoalIds: new Set(['goal-a']) } : value)), false,
  'An intermediate index cannot retain an operative competing claim.')
assert.equal(hasIntactResolutionSupersessionChain(expected[0], [...complete, complete[2]]), false,
  'An ambiguous terminal validation fails closed.')
assert.equal(hasIntactResolutionSupersessionChain({ goalId: 'goal-a', indexPaths: ['original.json', 'current.json', 'original.json'] }, complete), false)
console.log('Deep-understanding supersession chain checks passed.')
