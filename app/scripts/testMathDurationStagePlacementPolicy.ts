// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {
  mathDurationViewSha256, replayMathDurationStagePlacements,
  type MathDurationStagePlacementPolicy,
} from './mathDurationStagePlacementPolicy'

const base = { viewId: 'duration-policy-fixture', rootNodes: [
  { kind: 'structure', id: 'year8', children: [{ kind: 'goalEntry', goalId: 'algebra' }] },
] }
const expected = { viewId: base.viewId, rootNodes: [
  { kind: 'structure', id: 'year8', children: [
    { kind: 'goalEntry', goalId: 'algebra' }, { kind: 'goalEntry', goalId: 'assessment' },
  ] },
] }
const policy: MathDurationStagePlacementPolicy = {
  schemaVersion: 1, canonicalSha256WithoutLearningUnitLayer: 'canonical-fixture',
  nodes: { assessment: { kind: 'goalEntry', goalId: 'assessment' } },
  views: [{ fileName: 'fixture.view.json', viewId: base.viewId,
    generatedSha256: mathDurationViewSha256(base), resultSha256: mathDurationViewSha256(expected),
    operations: [{ parentId: 'year8', index: 1, deleteCount: 0, insertNodeKeys: ['assessment'] }],
  }],
}
const replay = (p = policy, v = base, canonical = 'canonical-fixture', file = 'fixture.view.json') =>
  replayMathDurationStagePlacements(v, file, canonical, p)
const original = structuredClone({ base, policy })
assert.deepEqual(replay(), expected)
assert.deepEqual({ base, policy }, original, 'Replay must not mutate its source or policy')
let negatives = 0
const rejects = (edit: (p: MathDurationStagePlacementPolicy) => void, pattern: RegExp) => {
  const p = structuredClone(policy); edit(p); assert.throws(() => replay(p), pattern); negatives++
}
rejects(p => { p.schemaVersion = 2 }, /policy input/)
assert.throws(() => replay(policy, base, 'changed-canonical'), /policy input/); negatives++
assert.throws(() => replay(policy, base, 'canonical-fixture', 'other.view.json'), /Missing or duplicate/); negatives++
rejects(p => { p.views.push(structuredClone(p.views[0])) }, /Missing or duplicate/)
rejects(p => { p.views[0].viewId = 'wrong-view' }, /Missing or duplicate/)
assert.throws(() => replay(policy, { ...base, rootNodes: [] }), /before stage placements/); negatives++
rejects(p => { p.views[0].operations[0].parentId = 'absent' }, /Invalid stage-placement parent/)
rejects(p => { p.views[0].operations[0].index = -1 }, /Invalid stage-placement splice/)
rejects(p => { p.views[0].operations[0].index = 0.5 }, /Invalid stage-placement splice/)
rejects(p => { p.views[0].operations[0].deleteCount = 2 }, /Invalid stage-placement splice/)
rejects(p => { p.views[0].operations[0].insertNodeKeys = ['absent'] }, /Unknown stage-placement node/)
rejects(p => { p.views[0].resultSha256 = 'wrong-result' }, /stage-placement result/)
// Pinning a changed result cannot bypass the caller's existing strict compiler.
// This helper only transports authored tree operations; it does not approve goals.
console.log(`Mathematics duration stage-placement replay passed: immutable successful replay and ${negatives} fail-closed cases.`)
