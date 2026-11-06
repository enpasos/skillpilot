import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from '../goalBookModel'
import { mathCanonicalPath, type MathGoal } from '../learningUnitsMathAuthoring'
import { prepareBatch, type Batch, type Landscape } from './batchAuthoring'

const source: Landscape = { landscapeId: 'math', programUnits: [{ id: 'stage' }], goalPlacements: [], goals: [
  { id: 'root', type: 'cluster', contains: ['a', 'old-q'] },
  { id: 'a', type: 'atomic', title: 'Prior competence', requires: [] },
  { id: 'old-q', type: 'atomic', nodeKind: 'exam', title: 'Prior exam', requires: ['a'] },
] }
const ledger = { decisions: source.goals.map(goal => ({ goalId: goal.id,
  sourceFingerprint: fingerprintSemanticKindSourceGoal(goal), semanticKind: goal.id === 'root' ? 'curricularArea' : goal.id === 'a' ? 'curricularAtomic' : 'practiceAssessment',
  decisionStatus: 'authoritative', decisionBasis: 'fixture-reviewed' })), counts: { total: 3, curricularArea: 1, curricularAtomic: 1, practiceAssessment: 1 } }
const ordinary: MathGoal = { id: 'new-a', type: 'atomic', semanticKind: 'curricularAtomic', title: 'New competence', requires: ['a'] }
const exam: MathGoal = { id: 'new-q', type: 'atomic', nodeKind: 'exam', requires: ['new-a'], examData: {
  taskContent: 'Apply the complete new competence.', solutionContent: 'Complete independent application.', coveredGoalIds: ['new-a'],
  scoring: { maxPoints: 9, passingPoints: 7, steps: [{ id: 'normal', points: 9, description: 'Normal grading only.' }] } } }
const cluster: MathGoal = { id: 'new-cluster', type: 'cluster', contains: ['new-a', 'new-q'], requires: [], extendedData: { applicabilityMappingInheritance: 'boundary' } }
const files = new Map([['a.json', JSON.stringify(ordinary)], ['q.json', JSON.stringify(exam)], ['cluster.json', JSON.stringify(cluster)]])
const read = (path: string) => { assert.ok(files.has(path), `Missing ${path}`); return files.get(path)! }
const batch: Batch = { schemaVersion: 1, generation: 'extension-test', baselineRef: 'fixture',
  newGoalPaths: ['q.json'], newOrdinaryGoalPaths: ['a.json'], newClusterGoalPaths: ['cluster.json'],
  canonicalClusterAdditions: [{ clusterId: 'root', goalIds: ['new-cluster'] }], removeRedundantRequires: [], compositionViews: {},
  packets: [{ contractId: 'new-unit', revision: 'v1', programUnitId: 'unit', parentUnitId: 'stage', placementRevision: 'v1',
    title: { de: 'Neu', en: 'New' }, promise: { de: 'Anwenden', en: 'Apply' }, introduction: { de: 'Prüfen', en: 'Check' },
    ownGoalIds: ['new-a', 'new-q'], requiredChildContractRefs: [], reviewRef: 'review.md', reviewReceiptPath: 'receipt.json',
    additionalInputPaths: [], assessmentClaims: { 'new-q': { coveredGoalIds: ['new-a'] } } }] }
const prepare = (config = batch, baseline = source, decisions = ledger, reader = read) => prepareBatch(config, baseline, decisions, { contracts: [] }, reader, true)
const result = prepare()
assert.deepEqual(result.proof.newAssessmentGoalIds, ['new-q'])
assert.deepEqual(result.proof.newOrdinaryGoalIds, ['new-a'])
assert.deepEqual(result.proof.newClusterGoalIds, ['new-cluster'])
assert.equal(result.proof.newGoalsCanonicalRootReachable, true)
assert.deepEqual(result.ledger.counts, { total: 6, curricularArea: 2, curricularAtomic: 2, practiceAssessment: 2 })
for (const [id, expected] of [['new-a', 'curricularAtomic'], ['new-q', 'practiceAssessment'], ['new-cluster', 'curricularArea']]) {
  assert.equal(result.ledger.decisions.find(d => d.goalId === id)?.semanticKind, expected)
}
assert.deepEqual(result.source.goals.find(g => g.id === 'a'), source.goals[1], 'Old ordinary meaning and object retained')
assert.deepEqual(result.source.goals.find(g => g.id === 'old-q'), source.goals[2], 'Old exam remains unchanged and unowned')
assert.deepEqual(result.reviews[0].reviewInput.definition.ownGoalIds, ['new-a', 'new-q'])
assert.deepEqual(source.goals[0].contains, ['a', 'old-q'], 'Preparation is pure')

const replacing = (path: string, value: unknown) => (requested: string) => requested === path ? JSON.stringify(value) : read(requested)
assert.throws(() => prepare(batch, source, ledger, replacing('a.json', { ...ordinary, id: 'a' })), /must not retype/)
assert.throws(() => prepare(batch, source, ledger, replacing('a.json', exam)), /cannot be an exam/)
assert.throws(() => prepare(batch, source, ledger, replacing('a.json', { ...ordinary, nodeKind: 'memory' })), /cannot be an exam, card/)
assert.throws(() => prepare(batch, source, ledger, replacing('cluster.json', { ...cluster, examData: exam.examData })), /cluster cannot be an exam/)
assert.throws(() => prepare({ ...batch, canonicalClusterAdditions: [] }), /not reachable from an existing canonical root/)
assert.throws(() => prepare(batch, source, ledger, replacing('cluster.json', { ...cluster, contains: ['new-cluster', 'new-a', 'new-q'] })), /Contains cycle/)
assert.throws(() => prepare(batch, source, ledger, replacing('a.json', { ...ordinary, requires: ['new-q'] })), /Cyclic full atomic demand/)
const stale = structuredClone(ledger); stale.decisions[1].sourceFingerprint = 'sha256:stale'
assert.throws(() => prepare(batch, source, stale), /Stale baseline semantic decision/)
assert.throws(() => prepare(batch, source, ledger, replacing('q.json', { ...exam, examData: { ...exam.examData, taskContentEn: 'Unsupported normal variant' } })), /Translated tasks require independent variant attestations/)
const demandedCluster = structuredClone(source); demandedCluster.goals[2].requires = ['root']
assert.throws(() => prepare(batch, demandedCluster), /changed original demand|Cyclic/)

// Reproduce existing archives from their own immutable view generations. No
// optional extension fields means identical existing proof and archive bytes.
const root = resolve(import.meta.dirname, '../../..')
const repoRead = (path: string) => readFileSync(resolve(root, 'curricula', path), 'utf8')
for (const generation of ['math-2026-11-05-batch-a', 'math-2026-11-05-batch-b-approved']) {
  const config = JSON.parse(readFileSync(resolve(root, `app/scripts/config/learning-units/${generation}.json`), 'utf8')) as Batch
  assert.equal(config.newOrdinaryGoalPaths, undefined); assert.equal(config.newClusterGoalPaths, undefined)
  const fromGit = (path: string) => execFileSync('git', ['show', `${config.baselineRef}:${path}`], { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
  const frozenViews = new Map(Object.entries(config.compositionViews).map(([id, path]) => [path,
    repoRead(`DE/Gymnasium/learning-units/sources/${generation}/views/${id}.view.json`)]))
  for (const edit of config.compositionViewEdits ?? []) frozenViews.set(edit.path, fromGit(`curricula/${edit.path}`))
  const legacy = prepareBatch(config, JSON.parse(fromGit(mathCanonicalPath)),
    JSON.parse(fromGit('curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json')),
    JSON.parse(fromGit('curricula/DE/Gymnasium/learning-units/catalog.json')), path => frozenViews.get(path) ?? repoRead(path), false)
  assert.equal(`${JSON.stringify(legacy.proof, null, 2)}\n`, repoRead(config.qualityProofPath!), `${generation} proof bytes remain identical`)
  assert.equal(Object.hasOwn(legacy.proof, 'newOrdinaryGoalIds'), false)
  for (const [path, bytes] of legacy.artifacts) {
    if (/^DE\/Gymnasium\/learning-units\/(sources|contracts|inputs)\//.test(path)) assert.equal(bytes, repoRead(path), `Historical archive unchanged ${path}`)
  }
}
console.log('Batch extension: distinct A/Q/cluster decisions, full R and roots checked; stale/retyped/cyclic/orphan/EN inputs rejected; both legacy generations reproduce unchanged')
