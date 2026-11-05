import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { atomicRelation, canonicalJson, digest, fullClosure, mathCanonicalPath, reachable } from './learningUnitsMathAuthoring'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const load = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const source = load(mathCanonicalPath)
const contract = load('curricula/DE/Gymnasium/learning-units/contracts/math-dot-product-projection/2026-11-05-v1.json')
const frozenS2Source = load('curricula/DE/Gymnasium/learning-units/sources/math-2026-11-05-s2-v1.source.json').landscapes[0]
const relation = atomicRelation(source.goals)
const actual = Object.fromEntries([...reachable(contract.ownGoalIds, relation)].sort().map(id => [id, relation[id]]))
assert.deepEqual(actual, contract.atomicPrerequisites, 'Frozen contract must equal actual source demand')
assert.equal(Object.keys(actual).length, 10)
for (const [sourceId, edges] of Object.entries(actual) as Array<[string, string[]]>) {
  for (const edge of edges) {
    const without = edges.filter(id => id !== edge)
    assert.ok(!reachable(without, actual).has(edge), `Redundant contract edge ${sourceId} -> ${edge}`)
  }
}
const proof = load('curricula/DE/Gymnasium/quality/learning-units/math-dot-product-projection-2026-11-05-minimality.json')
assert.equal(proof.atomicGoalCount, 978)
assert.equal(proof.removedAuthoredEdges.length, 3)
assert.equal(proof.beforeFullReachabilitySha256, proof.afterFullReachabilitySha256)
assert.equal(digest(canonicalJson(fullClosure(atomicRelation(frozenS2Source.goals)))), proof.afterFullReachabilitySha256,
  'Historical S2 proof binds its own complete frozen source, while later units may add legitimate new targets')
assert.equal(contract.ownResolvedKinds[contract.ownAssessmentGoalIds[0]], 'assessment')
for (const [id, claim] of Object.entries(contract.assessmentClaims) as Array<[string, { taskRevision: string; rubricRevision: string }]>) {
  const exam = source.goals.find((goal: { id: string }) => goal.id === id).examData
  assert.equal(digest(canonicalJson({ taskContent: exam.taskContent, solutionContent: exam.solutionContent })), claim.taskRevision)
  assert.equal(digest(canonicalJson(exam.scoring)), claim.rubricRevision)
}
const throughMastered = { Q: ['B'], B: ['A'], A: [] }
assert.ok(reachable(['Q'], throughMastered).has('A'), 'Structural demand includes mastered intermediate identities')
assert.throws(() => atomicRelation([{ id: 'A', contains: ['missing'] }]), /Missing contains reference/)
assert.throws(() => atomicRelation([{ id: 'A', contains: ['B'] }, { id: 'B', contains: ['A'] }]), /Contains cycle/)
console.log('S2 source/claim bindings, three repairs, full closure equality and minimal own-context edges passed')
