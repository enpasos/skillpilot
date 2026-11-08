// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import type { LearningGoal } from '../src/landscapeTypes'
import {
  fingerprintPrerequisiteReductionDocument as digest,
  loadVerifiedPrerequisiteReductionContext,
  CLUSTER_PREREQUISITE_REDUCTION_CONTRACT,
  PREREQUISITE_REDUCTION_CONTRACT,
  PREREQUISITE_REDUCTION_REGISTRY_PATH,
  reviewBindingGoal,
  verifiedPrerequisiteReductionSummary,
  type PrerequisiteReductionRegistry,
  type DirectPrerequisiteReduction,
  type ClusterPrerequisiteReduction,
  type VerifiedPrerequisiteReductionContext,
} from './prerequisiteReductionProof'
import {
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceProfile,
  fingerprintPositiveGoalEvidenceReviewInput,
  validatePositiveGoalEvidenceRecordSemantics,
  type PositiveGoalEvidenceReviewRecord,
} from './positiveGoalEvidenceProfileModel'
import { validateGoalBookEvidenceReviewRecordSemantics } from './goalBookEvidenceReviewLoader'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

type Goal = Record<string, unknown> & { id: string; requires: string[]; contains: string[] }
type Document = { landscapeId: string; title: string; goals: Goal[] }
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const temporaryParent = resolve(root, 'app/node_modules/.tmp')
mkdirSync(temporaryParent, { recursive: true })
const temporaryRoot = mkdtempSync(resolve(temporaryParent, 'prerequisite-proof-test-'))
const goal = (id: string, requires: string[] = []): Goal => ({
  id, type: 'atomic', title: `Goal ${id}`, description: `Assessable competence ${id}.`,
  weight: 1, contains: [], requires,
  resourceLinks: [{ type: 'goal-visualization', url: '/asset.png', role: 'primary', altText: 'Fixture' }],
})
const baseline = (): Document => ({
  landscapeId: 'proof-test', title: 'Reduction fixture', goals: [goal('q', ['p', 'r']), goal('p', ['r']), goal('r')],
})
const firstRemoval = { source: 'proof-test:q', prerequisite: 'proof-test:r', witness: ['proof-test:q', 'proof-test:p', 'proof-test:r'] }
let count = 0
function fixture(before: Document = baseline(), after?: Document) {
  const directory = resolve(temporaryRoot, String(count++))
  mkdirSync(resolve(directory, 'canonical'), { recursive: true })
  const current = after ?? structuredClone(before)
  if (!after) current.goals[0].requires = ['p']
  const registry: Omit<PrerequisiteReductionRegistry, 'removals'> & { removals: DirectPrerequisiteReduction[] } = {
    schemaVersion: 1, proofContract: PREREQUISITE_REDUCTION_CONTRACT, auditScope: 'origin-source-landscape-closure',
    catalogSources: [{ path: 'canonical/test.json', landscapeId: before.landscapeId,
      baselineDocumentDigest: digest(before), currentDocumentDigest: digest(current) }],
    originalRequires: [{ source: `${before.landscapeId}:q`, requires: [...before.goals[0].requires] }],
    removals: [structuredClone(firstRemoval)],
  }
  const save = () => {
    writeFileSync(resolve(directory, 'canonical/test.json'), JSON.stringify(current))
    writeFileSync(resolve(directory, 'proof.json'), JSON.stringify(registry))
  }
  const load = () => loadVerifiedPrerequisiteReductionContext({
    repositoryRoot: directory, registryPath: 'proof.json', catalogPath: 'canonical',
  })
  save()
  return { directory, current, registry, save, load }
}
const clusterBaseline = (): Document => ({
  landscapeId: 'proof-test', title: 'Cluster normalization fixture', goals: [
    { ...goal('k', ['r']), type: 'cluster', contains: ['a'] },
    goal('a', ['p']), goal('p', ['r']), goal('r'),
  ],
})
function clusterFixture(before = clusterBaseline()) {
  const current = structuredClone(before)
  current.goals[0].requires = []
  const f = fixture(before, current)
  const registry: PrerequisiteReductionRegistry = f.registry
  registry.proofContract = CLUSTER_PREREQUISITE_REDUCTION_CONTRACT
  registry.originalRequires = [{ source: 'proof-test:k', requires: [...before.goals[0].requires] }]
  const operation: ClusterPrerequisiteReduction = {
    source: 'proof-test:k', prerequisite: 'proof-test:r', atomicWitnesses: [['a', 'p', 'r'].map((id) => `proof-test:${id}`)],
  }
  registry.removals = [operation]
  f.save()
  return { ...f, registry, operation }
}
function foreignSource(f: ReturnType<typeof clusterFixture>, document: Document) {
  const path = `canonical/${document.landscapeId}.json`
  writeFileSync(resolve(f.directory, path), JSON.stringify(document))
  f.registry.catalogSources.push({ path, landscapeId: document.landscapeId,
    baselineDocumentDigest: digest(document), currentDocumentDigest: digest(document) })
  f.save()
}
async function rejectMutation(
  mutate: (f: ReturnType<typeof fixture>) => void,
  expected: RegExp,
  before?: Document,
) {
  const f = fixture(before)
  mutate(f)
  f.save()
  await assert.rejects(f.load, expected)
}

try {
  const f = fixture()
  rmSync(resolve(f.directory, 'proof.json'))
  assert.equal(await f.load(), undefined, 'absent registry preserves the old strict path')
  f.save()
  const context = await f.load()
  assert.ok(context)
  assert.ok(Object.isFrozen(context))
  assert.equal(verifiedPrerequisiteReductionSummary(undefined), undefined)
  const summary = verifiedPrerequisiteReductionSummary(context)!
  assert.equal(summary.proofContract, PREREQUISITE_REDUCTION_CONTRACT)
  assert.equal(summary.mode, 'current-or-certified-baseline-comparison')
  assert.equal(summary.registryDigest,
    `sha256:${createHash('sha256').update(readFileSync(resolve(f.directory, 'proof.json'))).digest('hex')}`)
  assert.deepEqual(summary.affectedGoalIds, ['proof-test:q'])
  assert.ok(Object.isFrozen(summary) && Object.isFrozen(summary.affectedGoalIds))
  assert.throws(() => verifiedPrerequisiteReductionSummary({} as VerifiedPrerequisiteReductionContext), /forged/u)
  const currentQ = f.current.goals[0]
  const historicalQ = reviewBindingGoal(context, 'proof-test:q', currentQ)
  assert.deepEqual(historicalQ.requires, ['p', 'r'])
  assert.deepEqual(currentQ.requires, ['p'], 'comparison cannot restore runtime content')
  assert.equal(reviewBindingGoal(undefined, 'proof-test:q', currentQ), currentQ)
  assert.throws(() => reviewBindingGoal({} as VerifiedPrerequisiteReductionContext, 'proof-test:q', currentQ), /forged/u)
  assert.throws(() => Object.assign(context, { forged: true }), TypeError)
  assert.throws(() => (historicalQ.requires as string[]).push('s'), TypeError)
  assert.throws(() => reviewBindingGoal(context, 'proof-test:q', { ...currentQ, title: 'Changed' }), /snapshot/u)
  assert.throws(() => reviewBindingGoal(context, 'proof-test:missing', currentQ), /snapshot/u)
  assert.notEqual(fingerprintSemanticKindSourceGoal(currentQ), fingerprintSemanticKindSourceGoal(historicalQ))

  // Only the review-input comparison receives the historical value. Other
  // fingerprints, profile decisions, and current asset bytes stay strict.
  const sample = JSON.parse(readFileSync(resolve(root,
    'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-29/bf17-bounded-source-p-v2/positive-evidence.review.jsonl'),
  'utf8').trim().split('\n')[0]) as PositiveGoalEvidenceReviewRecord
  const kind = 'curricularAtomic'
  const record: PositiveGoalEvidenceReviewRecord = {
    ...sample, landscapeId: 'proof-test', goalId: 'q',
    goalFingerprint: fingerprintGoalForPositiveEvidence(currentQ as unknown as LearningGoal, kind),
    reviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(historicalQ as unknown as LearningGoal,
      sample.reviewCriteriaFingerprint, { '/asset.png': 'sha256:old' }, kind),
    profileFingerprint: fingerprintPositiveGoalEvidenceProfile(sample.profile),
  }
  const validate = (candidate = record, resources = { '/asset.png': 'sha256:old' }) =>
    validatePositiveGoalEvidenceRecordSemantics(candidate, currentQ as unknown as LearningGoal, resources, kind, context)
  assert.match(validatePositiveGoalEvidenceRecordSemantics(record, currentQ as unknown as LearningGoal,
    { '/asset.png': 'sha256:old' }, kind).join('\n'), /stale reviewInputFingerprint/u)
  assert.match(validatePositiveGoalEvidenceRecordSemantics({ ...record,
    reviewInputFingerprint: undefined as unknown as string,
  }, currentQ as unknown as LearningGoal, {}, kind).join('\n'), /stale reviewInputFingerprint/u)
  assert.deepEqual(validate(), [])
  assert.deepEqual(validate({ ...record, reviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(
    currentQ as unknown as LearningGoal, sample.reviewCriteriaFingerprint, { '/asset.png': 'sha256:old' }, kind,
  ) }), [], 'fresh current reviews remain valid with a verified context')
  assert.match(validatePositiveGoalEvidenceRecordSemantics({ ...record,
    reviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(currentQ as unknown as LearningGoal,
      sample.reviewCriteriaFingerprint, { '/asset.png': 'sha256:old' }, kind),
  }, { ...currentQ, requires: [] } as unknown as LearningGoal, { '/asset.png': 'sha256:old' }, kind,
  undefined, currentQ).join('\n'), /stale reviewInputFingerprint/u,
  'without a context a separate raw value cannot replace the old consumer-goal comparison')
  assert.deepEqual(validateGoalBookEvidenceReviewRecordSemantics(record, currentQ as unknown as LearningGoal,
    { '/asset.png': 'sha256:old' }, kind, context, currentQ), [])
  assert.match(validate({ ...record, goalFingerprint: 'sha256:changed' }).join('\n'), /stale goalFingerprint/u)
  assert.match(validate({ ...record, profileFingerprint: 'sha256:changed' }).join('\n'), /profileFingerprint/u)
  assert.match(validate({ ...record, status: 'approved', reviewAuthority: 'ai_candidate' }).join('\n'), /human/u)
  assert.match(validate(record, { '/asset.png': 'sha256:changed' }).join('\n'), /reviewInputFingerprint/u)
  for (const changed of [
    { ...currentQ, requires: [] }, { ...currentQ, contains: ['r'] },
    { ...currentQ, examples: ['changed'] }, { ...currentQ, resourceLinks: [] },
  ]) assert.match(validatePositiveGoalEvidenceRecordSemantics(record, changed as unknown as LearningGoal,
    { '/asset.png': 'sha256:old' }, kind, context, currentQ).join('\n'), /consumer goal differs/u)
  assert.throws(() => validatePositiveGoalEvidenceRecordSemantics(record, currentQ as unknown as LearningGoal,
    {}, kind, {} as VerifiedPrerequisiteReductionContext), /forged/u)

  await rejectMutation(({ registry }) => registry.catalogSources.push({ ...registry.catalogSources[0] }), /paths/u)
  await rejectMutation(({ registry }) => registry.catalogSources[0].path = 'canonical/missing.json', /undeclared/u)
  await rejectMutation(({ directory }) => writeFileSync(resolve(directory, 'canonical/new.json'), JSON.stringify({
    landscapeId: 'new', title: 'New landscape', goals: [goal('new')],
  })), /paths/u)
  const missing = fixture()
  rmSync(resolve(missing.directory, 'canonical/test.json'))
  await assert.rejects(missing.load, /paths/u)
  await rejectMutation(({ current }) => current.goals.push(structuredClone(current.goals[0])), /duplicate goal/u)
  for (const mutate of [
    (g: Goal) => { g.title = 'Undeclared text edit' },
    (g: Goal) => { g.contains = ['r'] },
    (g: Goal) => { g.resourceLinks = [{ type: 'goal-visualization', url: '/new.png' }] },
    (g: Goal) => { g.requires = [] },
  ]) {
    await rejectMutation(({ current, registry }) => {
      mutate(current.goals[1])
      registry.catalogSources[0].currentDocumentDigest = digest(current)
    }, /baseline document digest/u)
  }
  await rejectMutation(({ registry }) => registry.originalRequires[0].requires.reverse(), /baseline document digest/u)
  const reorderBaseline = baseline()
  reorderBaseline.goals[0].requires.push('s')
  reorderBaseline.goals.push(goal('s'))
  await rejectMutation(({ current, registry }) => {
    current.goals[0].requires = ['s', 'p']
    registry.catalogSources[0].currentDocumentDigest = digest(current)
  }, /replay differs/u, reorderBaseline)
  await rejectMutation(({ current, registry }) => {
    current.goals[0].requires = []
    registry.catalogSources[0].currentDocumentDigest = digest(current)
  }, /replay differs/u)
  await rejectMutation(({ current, registry }) => {
    current.goals[0].requires = ['p', ':r']
    registry.catalogSources[0].currentDocumentDigest = digest(current)
  }, /replay differs/u)
  await rejectMutation(({ current, registry }) => {
    current.goals[0].requires = ['proof-test:p']
    registry.catalogSources[0].currentDocumentDigest = digest(current)
  }, /replay differs/u)
  await rejectMutation(({ registry }) => registry.removals[0] = {
    source: 'proof-test:q', prerequisite: 'proof-test:p', witness: ['proof-test:q', 'proof-test:r', 'proof-test:p'],
  }, /no matching concrete/u)
  await rejectMutation(({ registry }) => registry.removals[0].witness = ['proof-test:q', 'proof-test:absent', 'proof-test:r'],
    /no matching concrete/u)
  const cluster = baseline()
  cluster.goals[1].type = 'cluster'
  await assert.rejects(fixture(cluster).load, /actual atomic leaves/u)
  const inherited = baseline()
  inherited.goals[1].requires = []
  inherited.goals.push({ ...goal('parent', ['r']), type: 'cluster', contains: ['p'] })
  await assert.rejects(fixture(inherited).load, /not directly authored|inherited/u)
  const deletedSupport = baseline()
  deletedSupport.goals[1].requires = ['r', 's']
  deletedSupport.goals.push(goal('s', ['r']))
  const supportFixture = fixture(deletedSupport)
  supportFixture.current.goals[1].requires = ['s']
  supportFixture.registry.catalogSources[0].currentDocumentDigest = digest(supportFixture.current)
  supportFixture.registry.originalRequires.push({ source: 'proof-test:p', requires: ['r', 's'] })
  supportFixture.registry.removals.push({ source: 'proof-test:p', prerequisite: 'proof-test:r',
    witness: ['proof-test:p', 'proof-test:s', 'proof-test:r'] })
  supportFixture.save()
  await assert.rejects(supportFixture.load, /witness edge.*deleted/u)
  supportFixture.registry.removals.reverse()
  supportFixture.save()
  await assert.rejects(supportFixture.load, /no matching concrete/u,
    'prerequisite-first ordering still requires a fresh auditor witness')
  supportFixture.registry.removals[1].witness = ['q', 'p', 's', 'r'].map((id) => `proof-test:${id}`)
  supportFixture.save()
  assert.ok(await supportFixture.load(),
    'prerequisite-first removal with refreshed witnesses survives the complete replay')

  const normalized = clusterFixture()
  const normalizedContext = await normalized.load()
  assert.ok(normalizedContext)
  assert.throws(() => reviewBindingGoal(normalizedContext, 'proof-test:q', currentQ), /snapshot/u,
    'a verified context from another snapshot cannot authorize the current goal')
  assert.equal(verifiedPrerequisiteReductionSummary(normalizedContext)!.proofContract,
    CLUSTER_PREREQUISITE_REDUCTION_CONTRACT)
  assert.deepEqual(reviewBindingGoal(normalizedContext, 'proof-test:k', normalized.current.goals[0]).requires, ['r'])
  assert.deepEqual(normalized.current.goals[0].requires, [], 'cluster normalization changes current raw content only')
  assert.throws(() => reviewBindingGoal(normalizedContext, 'proof-test:k', {
    ...normalized.current.goals[0], contains: ['p'],
  }), /snapshot/u)
  assert.throws(() => reviewBindingGoal({} as VerifiedPrerequisiteReductionContext,
    'proof-test:k', normalized.current.goals[0]), /forged/u)

  const nested = clusterBaseline()
  nested.goals[0].contains = ['h']
  nested.goals.push({ ...goal('h'), type: 'cluster', contains: ['a'] })
  assert.ok(await clusterFixture(nested).load(), 'nested descendants without incoming cluster edges are covered')
  const nestedIncoming = structuredClone(nested)
  nestedIncoming.goals.push(goal('z', ['h']))
  await assert.rejects(clusterFixture(nestedIncoming).load, /incoming requires to affected cluster/u,
    'k contains h contains a, a has raw coverage, but z requires h would lose pre-expansion p')
  for (const incoming of ['k', ':k', 'proof-test:k']) {
    const input = clusterBaseline()
    input.goals.push(goal('z', [incoming]))
    await assert.rejects(clusterFixture(input).load, /incoming requires to affected cluster/u)
  }
  for (const incoming of ['k', 'proof-test:k']) {
    const input = clusterFixture()
    foreignSource(input, { landscapeId: 'foreign', title: 'Foreign incoming', goals: [goal('z', [incoming])] })
    await assert.rejects(input.load, /incoming requires to affected cluster/u)
  }
  const unclearIncoming = clusterFixture()
  foreignSource(unclearIncoming, {
    landscapeId: 'foreign', title: 'Unresolved possible incoming', goals: [goal('z', ['absent:k'])],
  })
  await assert.rejects(unclearIncoming.load, /unknown reference/u)
  const ambiguousIncoming = clusterFixture()
  foreignSource(ambiguousIncoming, { landscapeId: 'other', title: 'Same local ID', goals: [goal('k')] })
  foreignSource(ambiguousIncoming, { landscapeId: 'foreign', title: 'Ambiguous incoming', goals: [goal('z', ['k'])] })
  await assert.rejects(ambiguousIncoming.load, /ambiguous or unknown reference/u)
  const unrelatedUnknown = clusterFixture()
  foreignSource(unrelatedUnknown, {
    landscapeId: 'foreign', title: 'Independent unresolved experimental reference', goals: [goal('z', ['unknown-experimental'])],
  })
  assert.ok(await unrelatedUnknown.load(), 'unrelated unknown requires is not falsely resolved or a new all-root gate')

  const clusterReject = async (
    mutate: (f: ReturnType<typeof clusterFixture>) => void, expected: RegExp, before = clusterBaseline(),
  ) => {
    const f = clusterFixture(before)
    mutate(f)
    f.save()
    await assert.rejects(f.load, expected)
  }
  const twoAtoms = clusterBaseline()
  twoAtoms.goals[0].contains.push('b')
  twoAtoms.goals.push(goal('b', ['p']))
  await assert.rejects(clusterFixture(twoAtoms).load, /descendant coverage/u, 'every canonical atom descendant is required')
  const completeAtoms = clusterFixture(twoAtoms)
  completeAtoms.operation.atomicWitnesses.push(['b', 'p', 'r'].map((id) => `proof-test:${id}`))
  completeAtoms.save()
  assert.ok(await completeAtoms.load())
  const multiplePrerequisites = clusterBaseline()
  multiplePrerequisites.goals[0].requires = ['s', 'r']
  multiplePrerequisites.goals.find(({ id }) => id === 'p')!.requires = ['s', 'r']
  multiplePrerequisites.goals.push(goal('s'))
  const multipleCuts = clusterFixture(multiplePrerequisites)
  await assert.rejects(multipleCuts.load, /replay differs/u,
    'a second cluster-edge deletion must have its own declared operation')
  multipleCuts.registry.removals.push({ source: 'proof-test:k', prerequisite: 'proof-test:s',
    atomicWitnesses: [['a', 'p', 's'].map((id) => `proof-test:${id}`)] })
  multipleCuts.save()
  const multipleContext = await multipleCuts.load()
  assert.ok(multipleContext)
  assert.deepEqual(reviewBindingGoal(multipleContext, 'proof-test:k', multipleCuts.current.goals[0]).requires,
    ['s', 'r'], 'multiple cuts share one exact ordered original raw array')
  multipleCuts.registry.originalRequires[0].requires.reverse()
  multipleCuts.save()
  await assert.rejects(multipleCuts.load, /baseline document digest/u)
  await clusterReject(({ operation }) => operation.atomicWitnesses.push([...operation.atomicWitnesses[0]]), /descendant coverage/u)
  await clusterReject(({ operation }) => operation.atomicWitnesses.push(['proof-test:p', 'proof-test:r']), /descendant coverage/u)
  await clusterReject(({ operation }) => operation.atomicWitnesses[0] = ['proof-test:a', 'proof-test:unknown', 'proof-test:r'],
    /actual atomic leaves|not directly authored/u)
  const inheritedOnly = clusterBaseline()
  inheritedOnly.goals[1].requires = []
  await clusterReject(({ operation }) => operation.atomicWitnesses[0] = ['proof-test:a', 'proof-test:r'],
    /not directly authored/u, inheritedOnly)
  for (const id of ['p', 'r']) {
    const input = clusterBaseline()
    const node = input.goals.find((entry) => entry.id === id)!
    node.type = 'cluster'
    node.contains = ['extra']
    input.goals.push(goal('extra'))
    await assert.rejects(clusterFixture(input).load, /actual atomic leaves/u)
  }
  const atomicSource = clusterBaseline()
  atomicSource.goals[0].type = 'atomic'
  atomicSource.goals[0].contains = []
  await assert.rejects(clusterFixture(atomicSource).load, /nonempty cluster source/u)
  const unknownDescendant = clusterBaseline()
  unknownDescendant.goals[0].contains = ['unknown']
  await assert.rejects(clusterFixture(unknownDescendant).load, /[Uu]nknown reference/u)
  const containsCycle = structuredClone(nested)
  containsCycle.goals.find(({ id }) => id === 'h')!.contains.push('k')
  await assert.rejects(clusterFixture(containsCycle).load, /cycle/iu)
  await clusterReject(({ registry }) => registry.proofContract = PREREQUISITE_REDUCTION_CONTRACT, /removal fields/u)
  await clusterReject(({ registry }) => Object.assign(registry, { proofContract: 'effective-prerequisite-reduction-v2' }),
    /unsupported registry contract/u, clusterBaseline())
  await clusterReject(({ operation }) => Object.assign(operation, { witness: ['proof-test:k', 'proof-test:r'] }),
    /cluster removal fields/u)
  await clusterReject(({ operation }) => Object.assign(operation, { supportingOrigins: [] }), /cluster removal fields/u)
  await clusterReject(({ operation }) => operation.atomicWitnesses = [], /invalid cluster removal/u)
  await clusterReject(({ current, registry }) => {
    current.goals[1].title = 'Undeclared text'
    registry.catalogSources[0].currentDocumentDigest = digest(current)
  }, /baseline document digest/u)
  await clusterReject(({ current, registry }) => {
    current.goals[0].requires = [':r']
    registry.catalogSources[0].currentDocumentDigest = digest(current)
  }, /replay differs/u)
  const aliasInput = clusterBaseline()
  aliasInput.goals[0].requires = ['r', ':r', 'proof-test:r']
  assert.ok(await clusterFixture(aliasInput).load(), 'all raw aliases of a cluster relationship are removed')

  const laterDeleted = clusterBaseline()
  laterDeleted.goals.find(({ id }) => id === 'p')!.requires.push('s')
  laterDeleted.goals.push(goal('s', ['r']))
  const later = clusterFixture(laterDeleted)
  later.current.goals.find(({ id }) => id === 'p')!.requires = ['s']
  later.registry.catalogSources[0].currentDocumentDigest = digest(later.current)
  later.registry.originalRequires.push({ source: 'proof-test:p', requires: ['r', 's'] })
  later.registry.removals.push({ source: 'proof-test:p', prerequisite: 'proof-test:r',
    witness: ['p', 's', 'r'].map((id) => `proof-test:${id}`) })
  later.save()
  await assert.rejects(later.load, /witness edge.*deleted/u, 'later atomic deletion cannot invalidate a cluster witness')
  later.registry.removals.reverse()
  later.operation.atomicWitnesses = [['a', 'p', 's', 'r'].map((id) => `proof-test:${id}`)]
  later.save()
  assert.ok(await later.load(), 'refreshed final raw witnesses cover the sequential normalization')
  for (const before of [cluster, inherited]) {
    const legacy = fixture(before)
    legacy.registry.proofContract = CLUSTER_PREREQUISITE_REDUCTION_CONTRACT
    legacy.save()
    await assert.rejects(legacy.load, /actual atomic leaves|not directly authored|inherited/u,
      'the new contract does not relax legacy direct-leaf operations')
  }
  const applicability = baseline()
  applicability.goals[0].extendedData = { applicabilityFromRequires: true }
  applicability.goals[0].tags = ['Assessment']
  applicability.goals[1].tags = ['memorization']
  applicability.goals[1].extendedData = { applicabilityOverrides: { jurisdiction: ['DE-HE'] } }
  applicability.goals[2].extendedData = { applicabilityOverrides: { jurisdiction: ['DE-BY'] } }
  await assert.rejects(fixture(applicability).load, /compiled applicability changed/u)
  const malformed = fixture()
  writeFileSync(resolve(malformed.directory, 'proof.json'), '{}')
  await assert.rejects(malformed.load, /invalid registry/u)
  writeFileSync(resolve(malformed.directory, 'proof.json'), '{')
  await assert.rejects(malformed.load, SyntaxError)
  const dangling = fixture()
  rmSync(resolve(dangling.directory, 'proof.json'))
  symlinkSync('missing-proof.json', resolve(dangling.directory, 'proof.json'))
  await assert.rejects(dangling.load, /registry must be a regular file/u,
    'a dangling declared registry is invalid, not absent')
  const linked = fixture()
  writeFileSync(resolve(linked.directory, 'valid-proof.json'), JSON.stringify(linked.registry))
  rmSync(resolve(linked.directory, 'proof.json'))
  symlinkSync('valid-proof.json', resolve(linked.directory, 'proof.json'))
  await assert.rejects(linked.load, /registry must be a regular file/u,
    'even a symlink to valid proof bytes is rejected before reading')
  const directory = fixture()
  rmSync(resolve(directory.directory, 'proof.json'))
  mkdirSync(resolve(directory.directory, 'proof.json'))
  await assert.rejects(directory.load, /registry must be a regular file/u)
  if (process.platform !== 'win32') {
    const fifo = fixture()
    rmSync(resolve(fifo.directory, 'proof.json'))
    execFileSync('mkfifo', [resolve(fifo.directory, 'proof.json')])
    // A subprocess deadline catches a regression that blocks on reading the FIFO.
    const script = `const { loadVerifiedPrerequisiteReductionContext } = await import(${JSON.stringify(
      pathToFileURL(resolve(root, 'app/scripts/prerequisiteReductionProof.ts')).href,
    )}); await loadVerifiedPrerequisiteReductionContext(${JSON.stringify({
      repositoryRoot: fifo.directory, registryPath: 'proof.json', catalogPath: 'canonical',
    })});`
    const result = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '--eval', script], {
      cwd: resolve(root, 'app'), encoding: 'utf8', timeout: 5000,
    })
    assert.equal(result.error, undefined, 'a FIFO must be rejected before a blocking read')
    assert.equal(result.status, 1)
    assert.match(result.stderr, /registry must be a regular file/u)
  }
  const aliases = baseline()
  aliases.goals[0].requires = ['p', 'r', ':r', 'proof-test:r']
  const aliasContext = await fixture(aliases).load()
  assert.ok(aliasContext, 'all raw aliases of the removed relationship are removed together')

  // Replay the actual first Math case against the complete current catalog in
  // an ignored fixture. No live canonical or historical review file is edited.
  const catalog = resolve(root, 'curricula/DE/Gymnasium/canonical')
  const files = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? files(resolve(directory, entry.name))
      : /\.json$/iu.test(entry.name) && !/_deck/iu.test(entry.name) ? [resolve(directory, entry.name)] : []).sort()
  const originals = files(catalog).map((path) => ({ path, document: JSON.parse(readFileSync(path, 'utf8')) as Document }))
  const math = originals.find(({ document }) => document.goals.some(({ id }) => id === 'bf17cada-3ccd-5d9a-b9e3-42065cfdbb01'))!
  const q = math.document.goals.find(({ id }) => id === 'bf17cada-3ccd-5d9a-b9e3-42065cfdbb01')!
  q.requires = ['91e2f564-3bc8-4924-af85-2a3fa84c1471', '71cec9fb-3751-4d61-8b34-c5adbbf6e5f2']
  const complete = resolve(temporaryRoot, 'complete')
  const registry: PrerequisiteReductionRegistry = {
    schemaVersion: 1, proofContract: PREREQUISITE_REDUCTION_CONTRACT, auditScope: 'origin-source-landscape-closure', catalogSources: [],
    originalRequires: [{ source: `${math.document.landscapeId}:${q.id}`, requires: [...q.requires] }],
    removals: [{ source: `${math.document.landscapeId}:${q.id}`,
      prerequisite: `${math.document.landscapeId}:71cec9fb-3751-4d61-8b34-c5adbbf6e5f2`,
      witness: [q.id, ...q.requires].map((id) => `${math.document.landscapeId}:${id}`) }],
  }
  for (const { path, document } of originals) {
    const current = structuredClone(document)
    const target = current.goals.find(({ id }) => id === q.id)
    if (target) target.requires = [q.requires[0]]
    const local = `canonical/${relative(catalog, path)}`
    mkdirSync(dirname(resolve(complete, local)), { recursive: true })
    writeFileSync(resolve(complete, local), JSON.stringify(current))
    registry.catalogSources.push({ path: local, landscapeId: document.landscapeId,
      baselineDocumentDigest: digest(document), currentDocumentDigest: digest(current) })
  }
  writeFileSync(resolve(complete, 'proof.json'), JSON.stringify(registry))
  const actual = await loadVerifiedPrerequisiteReductionContext({
    repositoryRoot: complete, registryPath: 'proof.json', catalogPath: 'canonical',
  })
  assert.ok(actual)
  const current = { ...q, requires: [q.requires[0]] }
  assert.deepEqual(reviewBindingGoal(actual, `${math.document.landscapeId}:${q.id}`, current), q)
  // Exercise the actual cumulative registry, not just the isolated first case.
  const liveRegistry = JSON.parse(readFileSync(resolve(root, PREREQUISITE_REDUCTION_REGISTRY_PATH), 'utf8')) as PrerequisiteReductionRegistry
  const liveContext = await loadVerifiedPrerequisiteReductionContext()
  assert.ok(liveContext)
  const liveGoals = new Map(files(catalog).flatMap((path) => {
    const document = JSON.parse(readFileSync(path, 'utf8')) as Document
    return document.goals.map((goal) => [`${document.landscapeId}:${goal.id}`, goal] as const)
  }))
  assert.equal(liveGoals.size, 6524)
  assert.equal(liveRegistry.catalogSources.length, 21)
  assert.equal(liveRegistry.removals[0].source, `${math.document.landscapeId}:${q.id}`,
    'the original first Math operation stays first')
  assert.deepEqual(liveRegistry.originalRequires[0], {
    source: `${math.document.landscapeId}:${q.id}`, requires: q.requires,
  })
  assert.deepEqual(verifiedPrerequisiteReductionSummary(liveContext)!.affectedGoalIds,
    liveRegistry.originalRequires.map(({ source }) => source).sort())
  for (const original of liveRegistry.originalRequires) {
    const raw = liveGoals.get(original.source)!
    const historical = reviewBindingGoal(liveContext, original.source, raw)
    assert.deepEqual(historical.requires, original.requires, `exact ordered original requires: ${original.source}`)
    assert.deepEqual({ ...historical, requires: raw.requires }, raw,
      `historical binding changes only requires: ${original.source}`)
    assert.equal(reviewBindingGoal(undefined, original.source, raw), raw,
      `missing context retains the strict current raw value: ${original.source}`)
    assert.notEqual(fingerprintSemanticKindSourceGoal(raw), fingerprintSemanticKindSourceGoal(historical),
      `historical comparison requires the verified capability: ${original.source}`)
  }
  console.log(`Prerequisite reduction proof: strict negatives, refreshed multi-removal witnesses, first Math and ${liveRegistry.removals.length} cumulative operations passed.`)
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true })
}
