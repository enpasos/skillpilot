import assert from 'node:assert/strict'
import { HE_LK_ONLY_QUANTUM_GOAL_IDS as quantum, stripHeQuantumOverridesFromClonedView } from './lib/hePhysicsQuantumScope'

type FixtureNode = { kind: string; id?: string; goalId?: string; projectionRole?: string; retained?: string; children?: FixtureNode[] }
const support = (goalId: string, kind = 'canonicalSubtree'): FixtureNode => ({ kind, goalId, projectionRole: 'prerequisiteOnly', retained: goalId })
const fixture: { scope: { jurisdiction: string }; rootNodes: FixtureNode[] } = {
  scope: { jurisdiction: 'DE-HE' },
  rootNodes: [{ kind: 'structure', id: 'physics-q3', children: [
    { kind: 'structure', id: 'he-physics-topic-dd5a8efd-5d11-5388-aa2a-5147dec4348f', children: [
      ...quantum.map(id => support(id)), support('unrelated-atom'),
    ] },
    ...quantum.map(id => support(id, 'goalEntry')), support('unrelated-override', 'goalEntry'),
    { kind: 'structure', id: 'unrelated-q3-topic', children: [support(quantum[0])] },
  ] }, { kind: 'structure', id: 'physics-e-phase', children: [support(quantum[0], 'goalEntry')] }],
}
const current = structuredClone(fixture)
stripHeQuantumOverridesFromClonedView(current)
const expected = structuredClone(fixture)
const phase = expected.rootNodes[0]
phase.children = phase.children!.filter(node => !(node.kind === 'goalEntry' && quantum.includes(node.goalId as typeof quantum[number])))
const atomField = phase.children[0]
assert(atomField.kind === 'structure' && 'children' in atomField)
for (const child of atomField.children ?? []) {
  if ('goalId' in child && quantum.includes(child.goalId as typeof quantum[number])) delete child.projectionRole
}
assert.deepEqual(current, expected,
  'Only the two pinned HE exclusions change; unrelated IDs, fields, phases and all other metadata survive.')
stripHeQuantumOverridesFromClonedView(current)
assert.deepEqual(current, expected, 'Template cleanup is idempotent.')
for (const jurisdiction of ['DE-BB', 'DE-BE', 'DE-BY']) {
  const other = { ...structuredClone(fixture), scope: { jurisdiction } }, snapshot = structuredClone(other)
  stripHeQuantumOverridesFromClonedView(other)
  assert.deepEqual(other, snapshot, `Template cleanup must not rewrite ${jurisdiction}.`)
}
const unresolved = { rootNodes: structuredClone(fixture.rootNodes) }, unresolvedSnapshot = structuredClone(unresolved)
stripHeQuantumOverridesFromClonedView(unresolved)
assert.deepEqual(unresolved, unresolvedSnapshot, 'Missing HE scope cannot authorize template cleanup.')
const unknownQ3 = structuredClone(fixture)
unknownQ3.rootNodes[0].id = 'unrelated-phase'
const unknownSnapshot = structuredClone(unknownQ3)
stripHeQuantumOverridesFromClonedView(unknownQ3)
assert.deepEqual(unknownQ3, unknownSnapshot, 'A different structure cannot acquire the Q3-specific cleanup.')
console.log('HE quantum template cleanup passed: exact two exclusions, opened field, unrelated scopes/IDs/structures and idempotence.')
