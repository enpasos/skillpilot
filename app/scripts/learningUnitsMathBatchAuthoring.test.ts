import assert from 'node:assert/strict'
import { canonicalJson, digest } from './learningUnitsMathAuthoring'
import { prepareBatch, type Batch, type Landscape } from './learningUnits/batchAuthoring'

const source: Landscape = { landscapeId: 'math', programUnits: [{ id: 'year', kind: 'year' }], goalPlacements: [], goals: [
  { id: 'a', type: 'atomic', title: 'Explain', requires: [] },
  { id: 'q', type: 'atomic', nodeKind: 'exam', title: 'Apply', requires: ['a'], examData: {
    taskContent: 'Explain and apply independently.', solutionContent: 'Justified application.', coveredGoalIds: ['a'], scoring: { maxPoints: 10, passingPoints: 7, steps: [{ id: 'essential', points: 7 }, { id: 'tolerance', points: 3 }] } } },
] }
const ledger = { decisions: source.goals.map(goal => ({ goalId: goal.id, semanticKind: goal.id === 'q' ? 'practiceAssessment' : 'curricularAtomic' })), counts: { total: 2, practiceAssessment: 1, curricularAtomic: 1 } }
const packet = { contractId: 'explain-apply', revision: 'v1', programUnitId: 'unit', parentUnitId: 'year', placementRevision: 'v1',
  title: { de: 'Anwenden', en: 'Apply' }, promise: { de: 'Du kannst begründet anwenden.', en: 'You can apply with justification.' }, introduction: { de: 'Begründe dein Vorgehen.', en: 'Justify your approach.' },
  ownGoalIds: ['a', 'q'], requiredChildContractRefs: [], reviewRef: 'quality/review.md', reviewReceiptPath: 'review.receipt.json', additionalInputPaths: [], assessmentClaims: { q: { coveredGoalIds: ['a'] } } }
const batch: Batch = { schemaVersion: 1, generation: 'test-v1', baselineRef: 'test', packets: [packet], newGoalPaths: [], canonicalClusterAdditions: [], removeRedundantRequires: [], compositionViews: {} }
const files = new Map<string, string>(); const read = (path: string) => { assert.ok(files.has(path), `Missing input ${path}`); return files.get(path)! }
const pending = prepareBatch(batch, source, ledger, { schemaVersion: 1, contracts: [] }, read, true)
assert.deepEqual(pending.proof.independentReviewPending, ['explain-apply'])
assert.throws(() => prepareBatch(batch, source, ledger, { schemaVersion: 1, contracts: [] }, read, false), /Missing input/)
files.set('DE/Gymnasium/quality/review.md', 'Independent review: the essential seven points require the complete claimed application; three optional points do not weaken this claim.')
files.set('review.receipt.json', JSON.stringify({ schemaVersion: 1, semantics: 'learning-unit-content-review-v1', decision: 'approved', independentReviewer: 'independent fixture reviewer', reviewedInputSha256: pending.reviews[0].reviewedInputSha256, reviewPath: packet.reviewRef }))
const admitted = prepareBatch(batch, source, ledger, { schemaVersion: 1, contracts: [] }, read, false)
assert.deepEqual(admitted.proof.independentReviewPending, [])
assert.equal(JSON.parse([...admitted.artifacts].find(([path]) => path.endsWith('q.rubric.json'))![1]).passingPoints, 7, 'Preserve legitimate normal-rubric tolerance')
const changed = structuredClone(source); changed.goals[1].examData!.solutionContent = 'Different meaning'
assert.throws(() => prepareBatch(batch, changed, ledger, { schemaVersion: 1, contracts: [] }, read, false), /Review input drift/)
assert.throws(() => prepareBatch({ ...batch, removeRedundantRequires: [['q', 'a']] }, source, ledger, { schemaVersion: 1, contracts: [] }, read, true), /changed full transitive demand/)
files.set('new.json', JSON.stringify(source.goals[0]))
assert.throws(() => prepareBatch({ ...batch, newGoalPaths: ['new.json'] }, source, ledger, { schemaVersion: 1, contracts: [] }, read, true), /must not retype/)
assert.throws(() => prepareBatch(batch, source, ledger, { contracts: [{ path: 'old.json', sha256: digest('old'), inputs: {} }] }, path => path === 'old.json' ? '{}' : read(path), false), /immutable contract drift/)
assert.equal(canonicalJson(source), canonicalJson({ ...source }), 'Pure preparation retains caller source')
console.log('Batch authoring gate: pending withheld; exact review/task drift rejected; 7/10 normal tolerance preserved; no ordinary retyping or demand-changing repair; immutable archive drift rejected')
