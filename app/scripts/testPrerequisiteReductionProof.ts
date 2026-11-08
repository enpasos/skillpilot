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
  ORDERED_PREREQUISITE_REDUCTION_CONTRACT,
  CONTINUED_PREREQUISITE_REDUCTION_CONTRACT,
  CLUSTER_TARGET_PREREQUISITE_REDUCTION_CONTRACT,
  PREREQUISITE_REDUCTION_CONTRACT,
  PREREQUISITE_REDUCTION_REGISTRY_PATH,
  reviewBindingGoal,
  verifiedPrerequisiteReductionSummary,
  type PrerequisiteReductionRegistry,
  type LegacyPrerequisiteReductionRegistry,
  type OrderedPrerequisiteReductionRegistry,
  type ContinuedPrerequisiteReductionRegistry,
  type ClusterTargetPrerequisiteReductionRegistry,
  type AtomicPrerequisiteMaterialization,
  type OrderedPrerequisiteReductionStep,
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
  const registry: Omit<LegacyPrerequisiteReductionRegistry, 'removals'> & { removals: DirectPrerequisiteReduction[] } = {
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
const local = (id: string) => `proof-test:${id}`
const materialization = (id: string): AtomicPrerequisiteMaterialization => ({
  operation: 'materialize-atomic', source: local(id), prerequisite: local('r'),
  origin: { source: local('k'), prerequisite: 'r',
    sourceContainsPath: ['k', 'h', id].map(local), prerequisiteContainsPath: [local('r')] },
})
const orderedBaseline = (): Document => ({ ...baseline(), goals: [
  ...baseline().goals,
  { ...goal('k', ['r']), type: 'cluster', contains: ['h'] },
  { ...goal('h'), type: 'cluster', contains: ['a', 'b'] },
  goal('a'), goal('b'),
] })
function orderedFixture(
  before = orderedBaseline(),
  suffix: OrderedPrerequisiteReductionStep[] = [materialization('a'), materialization('b'), {
    operation: 'remove-cluster', source: local('k'), prerequisite: local('r'),
    atomicWitnesses: [['a', 'r'].map(local), ['b', 'r'].map(local)],
  }],
  changeFinal: (document: Document) => void = (document) => {
    document.goals.find(({ id }) => id === 'k')!.requires = []
    for (const id of ['a', 'b']) document.goals.find((entry) => entry.id === id)!.requires = ['r']
  },
) {
  const checkpoint = structuredClone(before)
  checkpoint.goals[0].requires = ['p']
  const f = fixture(before, checkpoint)
  f.registry.proofContract = CLUSTER_PREREQUISITE_REDUCTION_CONTRACT
  const history = structuredClone(f.registry) as LegacyPrerequisiteReductionRegistry
  const registry = Object.assign(f.registry, {
    proofContract: ORDERED_PREREQUISITE_REDUCTION_CONTRACT,
    v2Checkpoint: {
      registryDigest: digest(history),
      currentDocumentDigests: history.catalogSources.map(({ path, currentDocumentDigest }) => ({ path, currentDocumentDigest })),
    },
    suffixOriginalRequires: [...new Set(suffix.map(({ source }) => source))]
      .filter((source) => !history.originalRequires.some((entry) => entry.source === source))
      .map((source) => {
        const raw = before.goals.find(({ id }) => local(id) === source)!
        return { source, requires: Object.hasOwn(raw, 'requires') ? structuredClone(raw.requires) : null }
      }),
    suffix: structuredClone(suffix),
  }) as OrderedPrerequisiteReductionRegistry
  changeFinal(f.current)
  const save = () => {
    registry.catalogSources[0].currentDocumentDigest = digest(f.current)
    f.save()
  }
  save()
  return { ...f, registry, history, save }
}
async function rejectOrderedMutation(
  mutate: (f: ReturnType<typeof orderedFixture>) => void, expected: RegExp,
) {
  const f = orderedFixture()
  mutate(f)
  f.save()
  await assert.rejects(f.load, expected)
}
function unchangedOrderedDocument(f: ReturnType<typeof orderedFixture>, document: Document) {
  const path = `canonical/${document.landscapeId}.json`
  writeFileSync(resolve(f.directory, path), JSON.stringify(document))
  const binding = { path, landscapeId: document.landscapeId,
    baselineDocumentDigest: digest(document), currentDocumentDigest: digest(document) }
  f.registry.catalogSources.push(binding)
  f.history.catalogSources.push(structuredClone(binding))
  f.registry.v2Checkpoint.currentDocumentDigests.push({ path, currentDocumentDigest: digest(document) })
  f.registry.v2Checkpoint.registryDigest = digest(f.history)
  f.save()
}
function continuedFixture(before = orderedBaseline()) {
  before.goals.find(({ id }) => id === 'p')!.requires = ['r', 's']
  before.goals.push(goal('s', ['r']))
  const f = orderedFixture(before)
  const parentDocument = structuredClone(f.current), parent = structuredClone(f.registry)
  const registry = Object.assign(f.registry, {
    proofContract: CONTINUED_PREREQUISITE_REDUCTION_CONTRACT,
    v3Checkpoint: { registryDigest: digest(parent), currentDocumentDigests: parent.catalogSources
      .map(({ path, currentDocumentDigest }) => ({ path, currentDocumentDigest })) },
    tailOriginalRequires: [{ source: local('p'), requires: ['r', 's'] }],
    atomicRemovals: [{ source: local('p'), prerequisite: local('r'), witness: ['p', 's', 'r'].map(local) }],
    witnessContinuations: [{ historicalRemovalIndex: 0, edgeIndex: 1, tailRemovalIndex: 0 }],
  }) as ContinuedPrerequisiteReductionRegistry
  f.current.goals.find(({ id }) => id === 'p')!.requires = ['s']
  const save = () => { registry.catalogSources[0].currentDocumentDigest = digest(f.current); f.save() }
  save()
  return { ...f, registry, parent, parentDocument, save }
}
function unchangedContinuedDocument(f: ReturnType<typeof continuedFixture>, document: Document) {
  const path = `canonical/${document.landscapeId}.json`, currentDocumentDigest = digest(document)
  writeFileSync(resolve(f.directory, path), JSON.stringify(document))
  const binding = { path, landscapeId: document.landscapeId, baselineDocumentDigest: currentDocumentDigest, currentDocumentDigest }
  f.registry.catalogSources.push(structuredClone(binding)); f.parent.catalogSources.push(structuredClone(binding))
  f.history.catalogSources.push(structuredClone(binding))
  f.registry.v2Checkpoint.currentDocumentDigests.push({ path, currentDocumentDigest })
  f.registry.v2Checkpoint.registryDigest = digest(f.history)
  f.parent.v2Checkpoint = structuredClone(f.registry.v2Checkpoint)
  f.registry.v3Checkpoint.currentDocumentDigests.push({ path, currentDocumentDigest })
  f.registry.v3Checkpoint.registryDigest = digest(f.parent)
  f.save()
}
function clusterTargetBaseline(): Document {
  return { landscapeId: 'cluster-target-test', title: 'Canonical cluster target', goals: [
    goal('z', ['c', 'p']), { ...goal('c'), type: 'cluster', contains: ['k', 'b'] },
    { ...goal('k'), type: 'cluster', contains: ['a'] }, goal('a'), goal('b'), goal('p'),
  ] }
}
function clusterTargetFixture(document = clusterTargetBaseline()) {
  const f = continuedFixture()
  unchangedContinuedDocument(f, document)
  const parent = structuredClone(f.registry), parentDocument = structuredClone(document)
  const owner = document.landscapeId, key = (id: string) => `${owner}:${id}`
  const additions: AtomicPrerequisiteMaterialization[] = ['a', 'b'].map(id => ({
    operation: 'materialize-atomic', source: key('z'), prerequisite: key(id),
    origin: { source: key('z'), prerequisite: 'c', sourceContainsPath: [key('z')],
      prerequisiteContainsPath: (id === 'a' ? ['c', 'k', 'a'] : ['c', 'b']).map(key) },
  }))
  const registry = Object.assign(f.registry, { proofContract: CLUSTER_TARGET_PREREQUISITE_REDUCTION_CONTRACT,
    v4Checkpoint: { registryDigest: digest(parent), currentDocumentDigests: parent.catalogSources
      .map(({ path, currentDocumentDigest }) => ({ path, currentDocumentDigest })) },
    clusterTargetOriginalRequires: [{ source: key('z'), requires: [...document.goals[0].requires] }],
    clusterTargetSuffix: [...additions, { operation: 'remove-cluster-target', source: key('z'), prerequisite: key('c') }],
  }) as ClusterTargetPrerequisiteReductionRegistry
  document.goals[0].requires = ['p', 'a', 'b']
  const save = () => {
    registry.catalogSources.find(entry => entry.landscapeId === owner)!.currentDocumentDigest = digest(document)
    writeFileSync(resolve(f.directory, `canonical/${owner}.json`), JSON.stringify(document))
    f.save()
  }
  save()
  return { ...f, registry, parent, parentDocument, document, additions, key, save }
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

  const ordered = orderedFixture()
  const orderedContext = await ordered.load()
  assert.ok(orderedContext, 'nested materializations precede the existing complete cluster cut')
  assert.equal(verifiedPrerequisiteReductionSummary(orderedContext)!.proofContract, ORDERED_PREREQUISITE_REDUCTION_CONTRACT)
  assert.deepEqual(verifiedPrerequisiteReductionSummary(orderedContext)!.affectedGoalIds, ['a', 'b', 'k', 'q'].map(local))
  assert.deepEqual(ordered.registry.originalRequires, ordered.history.originalRequires)
  assert.deepEqual(ordered.registry.removals, ordered.history.removals)
  assert.deepEqual(ordered.registry.catalogSources.map(({ baselineDocumentDigest }) => baselineDocumentDigest),
    ordered.history.catalogSources.map(({ baselineDocumentDigest }) => baselineDocumentDigest))
  for (const id of ['a', 'b', 'k', 'q']) {
    const current = ordered.current.goals.find((entry) => entry.id === id)!
    assert.deepEqual(reviewBindingGoal(orderedContext, local(id), current).requires,
      orderedBaseline().goals.find((entry) => entry.id === id)!.requires)
  }
  assert.deepEqual(ordered.current.goals.find(({ id }) => id === 'a')!.requires, ['r'])
  assert.deepEqual(ordered.current.goals.find(({ id }) => id === 'k')!.requires, [])
  const noRequires = orderedBaseline()
  delete (noRequires.goals.find(({ id }) => id === 'a')! as Record<string, unknown>).requires
  const absent = orderedFixture(noRequires)
  const absentContext = await absent.load()
  assert.ok(absentContext)
  assert.equal(Object.hasOwn(reviewBindingGoal(absentContext, local('a'),
    absent.current.goals.find(({ id }) => id === 'a')!), 'requires'), false,
  'null overlay restores absent fields rather than introducing empty arrays')
  assert.equal(absent.registry.suffixOriginalRequires.find(({ source }) => source === local('a'))!.requires, null)

  const clusterTarget = orderedBaseline()
  clusterTarget.goals.find(({ id }) => id === 'a')!.requires = ['target']
  clusterTarget.goals.push({ ...goal('target'), type: 'cluster', contains: ['inner'] },
    { ...goal('inner'), type: 'cluster', contains: ['r'] })
  const reflexive: AtomicPrerequisiteMaterialization = {
    ...materialization('a'), origin: { source: local('a'), prerequisite: 'target',
      sourceContainsPath: [local('a')], prerequisiteContainsPath: ['target', 'inner', 'r'].map(local) },
  }
  const expanded = orderedFixture(clusterTarget, [reflexive], (document) => {
    document.goals.find(({ id }) => id === 'a')!.requires = ['target', 'r']
  })
  assert.ok(await expanded.load(), 'atomic source reflexivity and nested cluster-target expansion use actual paths')
  assert.deepEqual(expanded.current.goals.find(({ id }) => id === 'a')!.requires, ['target', 'r'],
    'the deterministic local reference appends after the original ordered array')

  const crossStep: AtomicPrerequisiteMaterialization = { ...materialization('a'), prerequisite: 'foreign:r',
    origin: { source: 'foreign:k', prerequisite: ':target',
      sourceContainsPath: ['foreign:k', local('a')], prerequisiteContainsPath: ['foreign:target', 'foreign:r'] } }
  const cross = orderedFixture(orderedBaseline(), [crossStep], (document) => {
    document.goals.find(({ id }) => id === 'a')!.requires = ['foreign:r']
  })
  const foreign: Document = { landscapeId: 'foreign', title: 'Qualified cross-landscape origin', goals: [
    { ...goal('k', [':target']), type: 'cluster', contains: [local('a')] },
    { ...goal('target'), type: 'cluster', contains: ['r'] }, goal('r'),
  ] }
  unchangedOrderedDocument(cross, foreign)
  assert.ok(await cross.load(), 'qualified foreign origin and foreign raw-reference append are verified')
  const ambiguousOrigin = orderedFixture(orderedBaseline(), [{ ...crossStep, origin: {
    ...crossStep.origin, source: 'third:k', prerequisite: 'r', sourceContainsPath: ['third:k', local('a')],
  } }], (document) => { document.goals.find(({ id }) => id === 'a')!.requires = ['foreign:r'] })
  unchangedOrderedDocument(ambiguousOrigin, { landscapeId: 'foreign', title: 'Another r', goals: [goal('r')] })
  unchangedOrderedDocument(ambiguousOrigin, { landscapeId: 'third', title: 'Ambiguous raw origin', goals: [
    { ...goal('k', ['r']), type: 'cluster', contains: [local('a')] },
  ] })
  await assert.rejects(ambiguousOrigin.load, /ambiguous (?:or unknown )?reference/iu)
  const historicalSourceBefore = orderedBaseline()
  historicalSourceBefore.goals.find(({ id }) => id === 'h')!.contains.push('q')
  historicalSourceBefore.goals.find(({ id }) => id === 'k')!.requires = ['s']
  historicalSourceBefore.goals.push(goal('s'))
  const historicalSourceStep = materialization('q')
  historicalSourceStep.prerequisite = local('s')
  historicalSourceStep.origin.prerequisite = 's'
  historicalSourceStep.origin.prerequisiteContainsPath = [local('s')]
  const historicalSource = orderedFixture(historicalSourceBefore, [historicalSourceStep], (document) => {
    document.goals[0].requires = ['p', 's']
  })
  assert.ok(await historicalSource.load(), 'an already historical source needs no duplicate original overlay')
  assert.deepEqual(historicalSource.registry.suffixOriginalRequires, [])
  assert.deepEqual(historicalSource.registry.originalRequires, historicalSource.history.originalRequires)

  await rejectOrderedMutation(({ registry }) => registry.suffix.reverse(), /not directly authored/u)
  await rejectOrderedMutation(({ registry }) => {
    registry.suffix.splice(1, 1)
    registry.suffixOriginalRequires = registry.suffixOriginalRequires.filter(({ source }) => source !== local('b'))
  }, /baseline document digest|not directly authored/u)
  const incomplete = orderedFixture(orderedBaseline(), [materialization('a'), {
    operation: 'remove-cluster', source: local('k'), prerequisite: local('r'), atomicWitnesses: [['a', 'r'].map(local)],
  }], (document) => {
    document.goals.find(({ id }) => id === 'a')!.requires = ['r']
    document.goals.find(({ id }) => id === 'k')!.requires = []
  })
  await assert.rejects(incomplete.load, /descendant coverage/u,
    'a cut after partial materialization still needs all actual canonical descendants')
  for (const endpoint of ['k', 'unknown']) {
    await rejectOrderedMutation(({ registry }) => registry.suffix[0].prerequisite = local(endpoint), /actual atomic leaves/u)
    await rejectOrderedMutation(({ registry }) => registry.suffix[0].source = local(endpoint),
      /suffix original|unknown suffix original/u)
  }
  await rejectOrderedMutation(({ registry }) => registry.suffix[0].prerequisite = local('a'), /self materialization/u)
  await rejectOrderedMutation(({ registry }) => registry.suffix.splice(1, 0, structuredClone(registry.suffix[0])),
    /already directly authored/u)
  const aliasDuplicate = orderedBaseline()
  aliasDuplicate.goals.find(({ id }) => id === 'a')!.requires = [':r']
  await assert.rejects(orderedFixture(aliasDuplicate).load, /already directly authored/u,
    'resolved raw aliases cannot be added again')
  for (const mutate of [
    (step: AtomicPrerequisiteMaterialization) => { step.origin.prerequisite = 'proof-test:r' },
    (step: AtomicPrerequisiteMaterialization) => { step.origin.source = local('unknown') },
    (step: AtomicPrerequisiteMaterialization) => { step.origin.prerequisite = 'unknown' },
  ]) await rejectOrderedMutation(({ registry }) => mutate(registry.suffix[0] as AtomicPrerequisiteMaterialization),
    /origin is not directly authored/u)
  for (const path of [['k', 'a'], ['k', 'h', 'unknown', 'a'], ['h', 'a'], ['k', 'h', 'k', 'a']]) {
    await rejectOrderedMutation(({ registry }) => {
      (registry.suffix[0] as AtomicPrerequisiteMaterialization).origin.sourceContainsPath = path.map(local)
    }, /contains path/u)
  }
  await rejectOrderedMutation(({ registry }) => {
    (registry.suffix[0] as AtomicPrerequisiteMaterialization).origin.prerequisiteContainsPath = [local('p'), local('r')]
  }, /contains path endpoints/u)
  const transitive = orderedBaseline()
  transitive.goals.find(({ id }) => id === 'k')!.requires = ['p']
  const merelyTransitive = materialization('a')
  merelyTransitive.origin.prerequisite = 'p'
  merelyTransitive.origin.prerequisiteContainsPath = ['p', 'r'].map(local)
  await assert.rejects(orderedFixture(transitive, [merelyTransitive], (document) => {
    document.goals.find(({ id }) => id === 'a')!.requires = ['r']
  }).load, /contains path edge/u, 'transitive requires reachability is not immediate induced atomic demand')
  const unknownReference = orderedBaseline()
  unknownReference.goals.find(({ id }) => id === 'k')!.requires = ['absent:r']
  const unknownOrigin = materialization('a')
  unknownOrigin.origin.prerequisite = 'absent:r'
  await assert.rejects(orderedFixture(unknownReference, [unknownOrigin], (document) => {
    document.goals.find(({ id }) => id === 'a')!.requires = ['r']
  }).load, /unknown reference/iu)
  const cyclicMaterialization = orderedBaseline()
  cyclicMaterialization.goals.find(({ id }) => id === 'a')!.requires = ['target']
  cyclicMaterialization.goals.find(({ id }) => id === 'b')!.requires = ['a']
  cyclicMaterialization.goals.push({ ...goal('target'), type: 'cluster', contains: ['b'] })
  const cycleStep: AtomicPrerequisiteMaterialization = { ...materialization('a'), prerequisite: local('b'),
    origin: { source: local('a'), prerequisite: 'target', sourceContainsPath: [local('a')],
      prerequisiteContainsPath: ['target', 'b'].map(local) } }
  await assert.rejects(orderedFixture(cyclicMaterialization, [cycleStep], (document) => {
    document.goals.find(({ id }) => id === 'a')!.requires = ['target', 'b']
  }).load, /cycle/iu, 'an addition-only suffix cannot expose an atomic cycle through cluster-target expansion')
  for (const change of [
    (f: ReturnType<typeof orderedFixture>) => { f.current.goals.find(({ id }) => id === 'a')!.title = 'Undeclared text' },
    (f: ReturnType<typeof orderedFixture>) => { f.current.goals.find(({ id }) => id === 'a')!.contains = ['r'] },
    (f: ReturnType<typeof orderedFixture>) => { f.current.goals.find(({ id }) => id === 'a')!.requires = [':r'] },
    (f: ReturnType<typeof orderedFixture>) => { f.current.goals.find(({ id }) => id === 'h')!.contains.reverse() },
  ]) await rejectOrderedMutation(change, /baseline document digest|replay differs/u)
  await rejectOrderedMutation(({ registry }) => registry.suffixOriginalRequires.pop(), /missing suffix original/u)
  await rejectOrderedMutation(({ registry }) => registry.suffixOriginalRequires.push({ source: local('p'), requires: ['r'] }),
    /extra or duplicate suffix original/u)
  await rejectOrderedMutation(({ registry }) => registry.suffixOriginalRequires.push({ source: local('q'), requires: ['p', 'r'] }),
    /extra or duplicate suffix original/u)
  await rejectOrderedMutation(({ registry }) => registry.catalogSources[0].baselineDocumentDigest = `sha256:${'0'.repeat(64)}`,
    /historical V2 registry digest/u)
  await rejectOrderedMutation(({ registry }) => registry.v2Checkpoint.registryDigest = `sha256:${'0'.repeat(64)}`,
    /historical V2 registry digest/u)
  await rejectOrderedMutation(({ registry, history }) => {
    registry.v2Checkpoint.currentDocumentDigests[0].currentDocumentDigest = `sha256:${'0'.repeat(64)}`
    history.catalogSources[0].currentDocumentDigest = registry.v2Checkpoint.currentDocumentDigests[0].currentDocumentDigest
    registry.v2Checkpoint.registryDigest = digest(history)
  }, /V2 checkpoint document digest/u)
  await rejectOrderedMutation(({ registry }) => registry.removals[0].source = local('p'), /historical V2 registry digest/u)
  await rejectOrderedMutation(({ registry }) => registry.originalRequires[0].requires.reverse(), /historical V2 registry digest/u)
  await rejectOrderedMutation(({ registry }) => registry.v2Checkpoint.currentDocumentDigests.push(
    { ...registry.v2Checkpoint.currentDocumentDigests[0] }), /V2 checkpoint paths/u)
  for (const mutate of [
    (registry: OrderedPrerequisiteReductionRegistry) => Object.assign(registry, { operations: [] }),
    (registry: OrderedPrerequisiteReductionRegistry) => Object.assign(registry.suffix[0], { rawReference: 'r' }),
    (registry: OrderedPrerequisiteReductionRegistry) => Object.assign((registry.suffix[0] as AtomicPrerequisiteMaterialization).origin,
      { witness: [] }),
    (registry: OrderedPrerequisiteReductionRegistry) => Object.assign(registry.suffix[0], { operation: 'remove-atomic' }),
    (registry: OrderedPrerequisiteReductionRegistry) => Object.assign(registry.suffix[2], { witness: ['a', 'r'].map(local) }),
  ]) await rejectOrderedMutation(({ registry }) => mutate(registry), /fields|unsupported ordered operation/u)
  await rejectOrderedMutation(({ registry }) => {
    delete (registry.suffix[0] as unknown as Record<string, unknown>).origin
  }, /materialization fields/u)
  const unsupportedTarget = orderedFixture()
  unsupportedTarget.registry.suffix[2].prerequisite = local('h')
  unsupportedTarget.save()
  await assert.rejects(unsupportedTarget.load, /actual atomic leaves/u, 'new cluster-to-cluster cuts remain unsupported')

  const badHistoryBefore = orderedBaseline()
  badHistoryBefore.goals.find(({ id }) => id === 'p')!.requires = ['r', 's', 'target']
  badHistoryBefore.goals.push(goal('s', ['r']), { ...goal('target'), type: 'cluster', contains: ['r'] })
  const healingStep: AtomicPrerequisiteMaterialization = { ...materialization('p'), origin: {
    source: local('p'), prerequisite: 'target', sourceContainsPath: [local('p')],
    prerequisiteContainsPath: ['target', 'r'].map(local),
  } }
  const heal = orderedFixture(badHistoryBefore, [healingStep], (document) => {
    document.goals.find(({ id }) => id === 'p')!.requires = ['s', 'target', 'r']
  })
  heal.registry.originalRequires.push({ source: local('p'), requires: ['r', 's', 'target'] })
  heal.registry.removals.push({ source: local('p'), prerequisite: local('r'), witness: ['p', 's', 'r'].map(local) })
  heal.registry.suffixOriginalRequires = []
  heal.history.originalRequires = structuredClone(heal.registry.originalRequires)
  heal.history.removals = structuredClone(heal.registry.removals)
  const brokenCheckpoint = structuredClone(badHistoryBefore)
  brokenCheckpoint.goals[0].requires = ['p']
  brokenCheckpoint.goals.find(({ id }) => id === 'p')!.requires = ['s', 'target']
  heal.history.catalogSources[0].currentDocumentDigest = digest(brokenCheckpoint)
  heal.registry.v2Checkpoint.currentDocumentDigests[0].currentDocumentDigest = digest(brokenCheckpoint)
  heal.registry.v2Checkpoint.registryDigest = digest(heal.history)
  heal.save()
  await assert.rejects(heal.load, /witness edge.*deleted/u, 'a later materialization cannot repair invalid historical end witnesses')

  const changedApplicability = orderedBaseline()
  const assessment = changedApplicability.goals.find(({ id }) => id === 'a')!
  assessment.extendedData = { applicabilityFromRequires: true }
  assessment.tags = ['Assessment']
  changedApplicability.goals.find(({ id }) => id === 'r')!.extendedData = {
    applicabilityOverrides: { jurisdiction: ['DE-BY'] },
  }
  await assert.rejects(orderedFixture(changedApplicability).load, /compiled applicability changed/u)
  const continued = continuedFixture()
  const continuedContext = await continued.load()
  assert.ok(continuedContext)
  assert.equal(verifiedPrerequisiteReductionSummary(continuedContext)!.proofContract, CONTINUED_PREREQUISITE_REDUCTION_CONTRACT)
  assert.deepEqual(verifiedPrerequisiteReductionSummary(continuedContext)!.affectedGoalIds, ['a', 'b', 'k', 'p', 'q'].map(local))
  const finalP = continued.current.goals.find(({ id }) => id === 'p')!
  assert.deepEqual(reviewBindingGoal(continuedContext, local('p'), finalP).requires, ['r', 's'])
  assert.deepEqual(finalP.requires, ['s'])
  assert.throws(() => reviewBindingGoal(continuedContext, local('p'), { ...finalP, requires: ['r', 's'] }), /snapshot/u,
    'the V3 current snapshot cannot be substituted for the V4 final snapshot')
  assert.throws(() => reviewBindingGoal({} as VerifiedPrerequisiteReductionContext, local('p'), finalP), /forged/u)
  const continuedReject = async (mutate: (fixture: ReturnType<typeof continuedFixture>) => void, expected: RegExp) => {
    const f = continuedFixture(); mutate(f); f.save(); await assert.rejects(f.load, expected)
  }
  await continuedReject(({ registry }) => { registry.witnessContinuations = [] }, /missing witness continuation/u)
  await continuedReject(({ registry }) => registry.witnessContinuations.push({ ...registry.witnessContinuations[0] }), /duplicate witness continuation/u)
  await continuedReject(({ registry }) => { registry.witnessContinuations[0].edgeIndex = 0 }, /continuation endpoints/u)
  await continuedReject(({ registry }) => { registry.witnessContinuations[0].tailRemovalIndex = 1 }, /continuation references/u)
  await continuedReject(({ registry }) => Object.assign(registry.witnessContinuations[0], { witnessIndex: 0 }), /continuation fields/u)
  await continuedReject(({ registry }) => { registry.tailOriginalRequires = [] }, /tail original/u)
  await continuedReject(({ registry }) => registry.tailOriginalRequires.push({ source: local('r'), requires: [] }), /extra or duplicate tail original/u)
  await continuedReject(({ registry }) => { registry.tailOriginalRequires[0].requires = null }, /current document digest/u)
  await continuedReject(({ registry }) => { registry.tailOriginalRequires[0].requires = ['s', 'r'] }, /current document digest/u)
  await continuedReject(({ registry }) => { registry.v3Checkpoint.registryDigest = `sha256:${'0'.repeat(64)}` }, /historical V3 registry digest/u)
  await continuedReject(({ registry, parent }) => {
    registry.v3Checkpoint.currentDocumentDigests[0].currentDocumentDigest = `sha256:${'0'.repeat(64)}`
    parent.catalogSources[0].currentDocumentDigest = registry.v3Checkpoint.currentDocumentDigests[0].currentDocumentDigest
    registry.v3Checkpoint.registryDigest = digest(parent)
  }, /current document digest/u)
  await continuedReject(({ registry }) => { registry.atomicRemovals[0].witness = ['p', 's', 'p', 'r'].map(local) }, /repeat a vertex/u)
  const missingContinued = continuedFixture()
  rmSync(resolve(missingContinued.directory, 'canonical/test.json'))
  await assert.rejects(missingContinued.load, /catalog source paths/u)
  const foreignAncestor = continuedFixture()
  unchangedContinuedDocument(foreignAncestor, { landscapeId: 'foreign', title: 'Foreign ancestor', goals: [
    { ...goal('parent', [local('r')]), type: 'cluster', contains: [local('a')] },
  ] })
  await assert.rejects(foreignAncestor.load, /closed atomic scope has a foreign requirement origin/u,
    'fully bound valid V3 history does not permit a foreign inherited requirement in the atomic fast path')
  const foreignChildBefore = orderedBaseline()
  foreignChildBefore.goals.push({ ...goal('holder'), type: 'cluster', contains: ['foreign:child'] })
  const foreignChild = continuedFixture(foreignChildBefore)
  unchangedContinuedDocument(foreignChild, { landscapeId: 'foreign', title: 'Expanded foreign child', goals: [goal('child')] })
  await assert.rejects(foreignChild.load, /closed atomic scope has expanded foreign nodes/u,
    'an expanded foreign contains child is rejected despite consistent parent/current digests')
  const harmlessAncestor = continuedFixture()
  unchangedContinuedDocument(harmlessAncestor, { landscapeId: 'foreign', title: 'Empty foreign ancestor', goals: [
    { ...goal('parent'), type: 'cluster', contains: [local('a')] },
  ] })
  assert.ok(await harmlessAncestor.load(), 'a requirement-free foreign inheritance ancestor is explicitly permitted')
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

  const targetFixture = clusterTargetFixture()
  const targetContext = await targetFixture.load()
  assert.ok(targetContext)
  assert.equal(verifiedPrerequisiteReductionSummary(targetContext)!.proofContract, CLUSTER_TARGET_PREREQUISITE_REDUCTION_CONTRACT)
  assert.deepEqual(reviewBindingGoal(targetContext, targetFixture.key('z'), targetFixture.document.goals[0]), targetFixture.parentDocument.goals[0])
  const targetReject = async (mutate: (f: ReturnType<typeof clusterTargetFixture>) => void, expected: RegExp) => {
    const f = clusterTargetFixture(); mutate(f); f.save(); await assert.rejects(f.load, expected)
  }
  await targetReject(f => { f.registry.v4Checkpoint.registryDigest = `sha256:${'0'.repeat(64)}` }, /historical V4 registry digest differs/u)
  await targetReject(f => { f.registry.v4Checkpoint.currentDocumentDigests.pop() }, /V4 checkpoint paths/u)
  await targetReject(f => { f.registry.clusterTargetOriginalRequires = [] }, /exactly one original snapshot/u)
  await targetReject(f => { f.registry.clusterTargetOriginalRequires.push(structuredClone(f.registry.clusterTargetOriginalRequires[0])) }, /exactly one original snapshot/u)
  await targetReject(f => { f.registry.clusterTargetOriginalRequires[0].source = f.key('a') }, /snapshot source differs/u)
  await targetReject(f => { f.registry.clusterTargetOriginalRequires[0].requires = ['p'] }, /current document digest differs/u)
  await targetReject(f => { f.registry.clusterTargetOriginalRequires[0].requires = null }, /current document digest differs/u)
  await targetReject(f => { f.registry.clusterTargetSuffix.splice(1, 1) }, /leaf coverage is incomplete/u)
  await targetReject(f => { f.registry.clusterTargetSuffix.splice(1, 0, structuredClone(f.additions[0])) }, /already directly authored/u)
  await targetReject(f => { f.additions[0].prerequisite = f.key('p') }, /source or leaf differs/u)
  await targetReject(f => { f.additions[0].origin.source = local('k') }, /source or leaf differs/u)
  await targetReject(f => { f.additions[0].origin.prerequisite = 'missing' }, /original literal cluster origin/u)
  await targetReject(f => { f.additions[0].origin.sourceContainsPath = [f.key('z'), f.key('z')] }, /source or leaf differs/u)
  await targetReject(f => { f.additions[0].origin.prerequisiteContainsPath = [f.key('c'), f.key('a')] }, /not directly authored/u)
  await targetReject(f => { f.registry.clusterTargetSuffix.reverse() }, /invalid cluster-target removal fields/u)
  await targetReject(f => { (f.registry.clusterTargetSuffix.at(-1) as unknown as Record<string, unknown>).witness = [] }, /invalid cluster-target removal fields/u)
  await targetReject(f => { f.document.goals[0].title = 'Undeclared content drift' }, /current document digest differs/u)
  await targetReject(f => { f.document.goals[1].contains.reverse() }, /current document digest differs/u)
  await targetReject(f => { f.document.goals[0].requires.reverse() }, /cluster-target replay differs/u)
  const structuralTarget = clusterTargetBaseline()
  structuralTarget.goals.forEach(entry => { delete entry.type })
  assert.ok(await clusterTargetFixture(structuralTarget).load(), 'V5 structural leaves and clusters permit absent consistent optional type')
  const alreadyMaterialized = clusterTargetBaseline()
  alreadyMaterialized.goals[0].requires.push('a', 'b')
  const zeroAdds = clusterTargetFixture(alreadyMaterialized)
  zeroAdds.registry.clusterTargetSuffix = zeroAdds.registry.clusterTargetSuffix.slice(-1)
  zeroAdds.save()
  assert.ok(await zeroAdds.load(), 'a complete existing direct leaf basis needs only the final cut')
  const badParent = clusterTargetFixture()
  badParent.registry.atomicRemovals[0].witness[1] = local('q')
  badParent.parent.atomicRemovals = structuredClone(badParent.registry.atomicRemovals)
  badParent.registry.v4Checkpoint.registryDigest = digest(badParent.parent)
  badParent.save()
  await assert.rejects(badParent.load, /atomic tail witness|witness edge/u)

  // Replay the actual first Math case against the complete current catalog in
  // an ignored fixture. No live canonical or historical review file is edited.
  const catalog = resolve(root, 'curricula/DE/Gymnasium/canonical')
  const files = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? files(resolve(directory, entry.name))
      : /\.json$/iu.test(entry.name) && !/_deck/iu.test(entry.name) ? [resolve(directory, entry.name)] : []).sort()
  const liveRegistry = JSON.parse(readFileSync(resolve(root, PREREQUISITE_REDUCTION_REGISTRY_PATH), 'utf8')) as PrerequisiteReductionRegistry
  assert.equal(liveRegistry.proofContract, CLUSTER_TARGET_PREREQUISITE_REDUCTION_CONTRACT, 'the live registry uses the cluster-target V5 contract')
  const liveTarget = liveRegistry as ClusterTargetPrerequisiteReductionRegistry
  const { v4Checkpoint, clusterTargetOriginalRequires, clusterTargetSuffix, ...livePrefix } = liveTarget
  const v4Digests = new Map(v4Checkpoint.currentDocumentDigests.map(entry => [entry.path, entry.currentDocumentDigest]))
  const liveContinued: ContinuedPrerequisiteReductionRegistry = { ...livePrefix, proofContract: CONTINUED_PREREQUISITE_REDUCTION_CONTRACT,
    catalogSources: liveTarget.catalogSources.map(entry => ({ ...entry, currentDocumentDigest: v4Digests.get(entry.path)! })) }
  assert.equal(digest(liveContinued), 'sha256:b43287aac991215610cf9a3fa01a766c17d9a3e4bc47eb4cc45d61573ddb9803')
  assert.equal(v4Checkpoint.registryDigest, digest(liveContinued))
  assert.equal(`sha256:${createHash('sha256').update(`${JSON.stringify(liveContinued, null, 2)}\n`).digest('hex')}`,
    'sha256:94f65d3338c901f5160b2b9d123a692639b0a5f455eb33d23b7d1c3853ddf394', 'the complete V4 parent remains byte-reconstructable')
  const parentDigests = new Map(liveContinued.v3Checkpoint.currentDocumentDigests.map(entry => [entry.path, entry.currentDocumentDigest]))
  const liveOrdered: OrderedPrerequisiteReductionRegistry = {
    schemaVersion: liveContinued.schemaVersion, proofContract: ORDERED_PREREQUISITE_REDUCTION_CONTRACT,
    auditScope: liveContinued.auditScope,
    catalogSources: liveContinued.catalogSources.map(entry => ({ ...entry, currentDocumentDigest: parentDigests.get(entry.path)! })),
    originalRequires: liveContinued.originalRequires, removals: liveContinued.removals,
    v2Checkpoint: liveContinued.v2Checkpoint, suffixOriginalRequires: liveContinued.suffixOriginalRequires, suffix: liveContinued.suffix,
  }
  const v3Digest = 'sha256:55bbd974c3265cd3802b7bf5d8622beeb2d3d5ac4795d4e0dfdb27b63302f06b'
  assert.equal(digest(liveOrdered), v3Digest)
  assert.equal(liveContinued.v3Checkpoint.registryDigest, v3Digest)
  assert.equal(liveContinued.v3Checkpoint.currentDocumentDigests.length, 21)
  assert.equal(`sha256:${createHash('sha256').update(`${JSON.stringify(liveOrdered, null, 2)}\n`).digest('hex')}`,
    'sha256:deb3d78f5e5f2797dd88d2776c7e9645f9d8869d7e375a00f2790f970d7aae29', 'the complete previous V3 registry remains reconstructable byte for byte')
  const originals = files(catalog).map((path) => ({ path, document: JSON.parse(readFileSync(path, 'utf8')) as Document }))
  for (const { path, document } of originals) {
    for (const original of clusterTargetOriginalRequires) {
      if (!original.source.startsWith(`${document.landscapeId}:`)) continue
      const goal = document.goals.find(entry => `${document.landscapeId}:${entry.id}` === original.source)!
      if (original.requires === null) delete (goal as Record<string, unknown>).requires
      else goal.requires = structuredClone(original.requires)
    }
    assert.equal(digest(document), v4Digests.get(relative(root, path)), `restored V4 parent document: ${path}`)
  }
  const tailOriginals = new Map(liveContinued.tailOriginalRequires.map(entry => [entry.source, entry.requires]))
  for (const { path, document } of originals) {
    for (const goal of document.goals) {
      const key = `${document.landscapeId}:${goal.id}`
      if (!tailOriginals.has(key)) continue
      const before = tailOriginals.get(key)!
      if (before === null) delete (goal as Record<string, unknown>).requires
      else goal.requires = structuredClone(before)
    }
    assert.equal(digest(document), parentDigests.get(relative(root, path)), `restored V3 parent document: ${path}`)
  }
  if (liveOrdered) {
    // Keep this isolated V1 replay on the actual historical V2 checkpoint even
    // when the live catalog has already applied the ordered V3 suffix.
    const suffixOriginals = new Map(liveOrdered.suffixOriginalRequires.map((entry) => [entry.source, entry.requires]))
    const checkpointDigests = new Map(liveOrdered.v2Checkpoint.currentDocumentDigests
      .map(({ path, currentDocumentDigest }) => [path, currentDocumentDigest]))
    for (const { path, document } of originals) {
      for (const goal of document.goals) {
        const key = `${document.landscapeId}:${goal.id}`
        if (!suffixOriginals.has(key)) continue
        const original = suffixOriginals.get(key)!
        if (original === null) delete (goal as Record<string, unknown>).requires
        else goal.requires = structuredClone(original)
      }
      assert.equal(digest(document), checkpointDigests.get(relative(root, path)),
        `isolated first Math fixture starts from the V2 checkpoint: ${path}`)
    }
  }
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
  const liveContext = await loadVerifiedPrerequisiteReductionContext()
  assert.ok(liveContext)
  const liveGoals = new Map<string, Goal>(files(catalog).flatMap((path) => {
    const document = JSON.parse(readFileSync(path, 'utf8')) as Document
    return document.goals.map((goal) => [`${document.landscapeId}:${goal.id}`, goal] as const)
  }))
  assert.equal(liveGoals.size, 6524)
  assert.equal(liveRegistry.catalogSources.length, 21)
  assert.equal(liveRegistry.removals.length, 204)
  assert.equal(liveRegistry.originalRequires.length, 200)
  const historicalRegistry: LegacyPrerequisiteReductionRegistry = liveOrdered ? {
    schemaVersion: liveOrdered.schemaVersion,
    proofContract: CLUSTER_PREREQUISITE_REDUCTION_CONTRACT,
    auditScope: liveOrdered.auditScope,
    catalogSources: liveOrdered.catalogSources.map((entry) => {
      const checkpoints = liveOrdered.v2Checkpoint.currentDocumentDigests.filter(({ path }) => path === entry.path)
      assert.equal(checkpoints.length, 1, `one historical checkpoint binding: ${entry.path}`)
      return { ...entry, currentDocumentDigest: checkpoints[0].currentDocumentDigest }
    }),
    originalRequires: liveOrdered.originalRequires,
    removals: liveOrdered.removals,
  } : liveRegistry as LegacyPrerequisiteReductionRegistry
  assert.equal(historicalRegistry.proofContract, CLUSTER_PREREQUISITE_REDUCTION_CONTRACT)
  // Fixed pins of the actual historical prefix, independent of fixture edits.
  const historicalDigest = 'sha256:9142a16a3418ec77a7689a14c74eb86d0f77ee6e0ed166fac39c0f4737c0650f'
  assert.equal(digest(historicalRegistry), historicalDigest)
  assert.equal(digest(liveRegistry.catalogSources.map(({ path, landscapeId, baselineDocumentDigest }) =>
    ({ path, landscapeId, baselineDocumentDigest }))), 'sha256:356ffe9a535fb4b35734c7c1bee0c5e9258feab163ea6dec83c4260d793d1471')
  assert.equal(digest(liveRegistry.removals), 'sha256:2c533d75b972288ab828a7312af9156d59c738e9d4a0e5755c3b25862470630f')
  assert.equal(digest(liveRegistry.originalRequires), 'sha256:b731e23f6ef9e142d4efb7b95c844f8bed84f11e71c462fa21e40d9b2dc6583c')
  assert.equal(liveRegistry.removals[0].source, `${math.document.landscapeId}:${q.id}`,
    'the original first Math operation stays first')
  assert.deepEqual(liveRegistry.originalRequires[0], {
    source: `${math.document.landscapeId}:${q.id}`, requires: q.requires,
  })
  const allOriginals: Array<{ source: string; requires: string[] | null }> = [...liveRegistry.originalRequires]
  if (liveOrdered) {
    assert.equal(liveOrdered.v2Checkpoint.registryDigest, historicalDigest)
    assert.equal(liveOrdered.v2Checkpoint.currentDocumentDigests.length, 21)
    assert.equal(liveOrdered.suffix.length, 29)
    assert.equal(liveOrdered.suffix.filter(({ operation }) => operation === 'materialize-atomic').length, 27)
    assert.equal(liveOrdered.suffix.filter(({ operation }) => operation === 'remove-cluster').length, 2)
    assert.equal(liveOrdered.suffixOriginalRequires.length, 29)
    const historicalSources = new Set(liveRegistry.originalRequires.map(({ source }) => source))
    assert.ok(liveOrdered.suffixOriginalRequires.every(({ source }) => !historicalSources.has(source)),
      'all 29 suffix overlays are new sources, without rewriting the historical prefix')
    assert.deepEqual(liveOrdered.suffixOriginalRequires.map(({ source }) => source).sort(),
      [...new Set(liveOrdered.suffix.map(({ source }) => source))].sort())
    allOriginals.push(...liveOrdered.suffixOriginalRequires)
    assert.equal(new Set(allOriginals.map(({ source }) => source)).size, 229)
  }
  assert.equal(liveContinued.atomicRemovals.length, 922)
  assert.equal(liveContinued.tailOriginalRequires.length, 490)
  assert.equal(tailOriginals.size, 490)
  assert.deepEqual([...tailOriginals.keys()].sort(), [...new Set(liveContinued.atomicRemovals.map(entry => entry.source))].sort())
  const prefixSources = new Set(allOriginals.map(entry => entry.source))
  assert.ok([...tailOriginals.keys()].every(source => !prefixSources.has(source)), 'all 490 tail sources are additional sources')
  assert.deepEqual(liveContinued.witnessContinuations, [{ historicalRemovalIndex: 0, edgeIndex: 1, tailRemovalIndex: 608 }])
  assert.deepEqual(liveContinued.atomicRemovals[608].witness, ['91e2f564-3bc8-4924-af85-2a3fa84c1471',
    '71683f37-24de-4e0f-badd-858b56fa4d64', '71cec9fb-3751-4d61-8b34-c5adbbf6e5f2'].map(id => `${math.document.landscapeId}:${id}`))
  allOriginals.push(...liveContinued.tailOriginalRequires)
  assert.equal(new Set(allOriginals.map(entry => entry.source)).size, 719)
  assert.deepEqual(verifiedPrerequisiteReductionSummary(liveContext)!.affectedGoalIds,
    allOriginals.map(({ source }) => source).sort())
  for (const original of allOriginals) {
    const raw = liveGoals.get(original.source)!
    const historical = reviewBindingGoal(liveContext, original.source, raw)
    assert.equal(Object.hasOwn(historical, 'requires'), original.requires !== null,
      `exact original requires presence: ${original.source}`)
    if (original.requires !== null) {
      assert.deepEqual(historical.requires, original.requires, `exact ordered original requires: ${original.source}`)
    }
    const restoredCurrent = structuredClone(historical)
    if (Object.hasOwn(raw, 'requires')) restoredCurrent.requires = structuredClone(raw.requires)
    else delete restoredCurrent.requires
    assert.deepEqual(restoredCurrent, raw,
      `historical binding changes only requires: ${original.source}`)
    assert.equal(reviewBindingGoal(undefined, original.source, raw), raw,
      `missing context retains the strict current raw value: ${original.source}`)
    assert.notEqual(fingerprintSemanticKindSourceGoal(raw), fingerprintSemanticKindSourceGoal(historical),
      `historical comparison requires the verified capability: ${original.source}`)
  }
  console.log(`Prerequisite reduction proof: strict negatives, bound V3 parent, ${liveRegistry.removals.length} historical operations, ${liveOrdered.suffix.length} suffix steps, ${liveContinued.atomicRemovals.length} atomic cuts and ${allOriginals.length} snapshots passed.`)
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true })
}
