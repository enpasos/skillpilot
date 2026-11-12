// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import type { LearningGoal } from '../src/landscapeTypes'
import {
  fingerprintPrerequisiteReductionDocument as digest,
  fingerprintPrerequisiteReductionRecord,
  BATCHED_PREREQUISITE_REDUCTION_CONTRACT,
  APPLICABILITY_REFRESH_PREREQUISITE_REDUCTION_CONTRACT,
  BASIS_BOUND_PREREQUISITE_REDUCTION_CONTRACT,
  GOAL_SCOPED_PREREQUISITE_REDUCTION_CONTRACT,
  deriveGoalScopedPrerequisiteReductionRegistry,
  type GoalScopedPrerequisiteReductionRegistry,
  type BasisBoundPrerequisiteReductionRegistry,
  type AssessmentBasisReductionEntry,
  type ApplicabilityRefreshPrerequisiteReductionRegistry,
  type BatchedPrerequisiteReductionRegistry,
  type BatchedPrerequisiteReductionOperation,
  type BatchWitnessContinuation,
  type PrerequisiteReductionBatch,
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
    for (const id of ['a', 'b']) { const source = document.goals.find((entry) => entry.id === id)!; source.requires = [...(source.requires ?? []), 'r'] }
  },
) {
  const checkpoint = structuredClone(before)
  checkpoint.goals[0].requires = before.goals[0].requires.filter(raw => raw !== 'r')
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
function clusterTargetFixture(document = clusterTargetBaseline(), before = orderedBaseline()) {
  const f = continuedFixture(before)
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

function batchFixture(document = clusterTargetBaseline(), before = orderedBaseline(), legacy?: {
  operation: DirectPrerequisiteReduction | ClusterPrerequisiteReduction; original: string[]; after: string[]
}) {
  const initialDocument = structuredClone(document)
  const parentFixture = clusterTargetFixture(document, before)
  if (legacy) {
    const registry = parentFixture.registry
    registry.removals.push(structuredClone(legacy.operation))
    registry.originalRequires.push({ source: legacy.operation.source, requires: [...legacy.original] })
    const sourceId = legacy.operation.source.split(':')[1]
    initialDocument.goals.find(goal => goal.id === sourceId)!.requires = [...legacy.after]
    document.goals.find(goal => goal.id === sourceId)!.requires = [...legacy.after]
    const boundary = digest(initialDocument)
    const catalogs = (bindings: Array<{ path: string; currentDocumentDigest: string }>) => registry.catalogSources.map(source => ({ ...source,
      currentDocumentDigest: source.landscapeId === document.landscapeId ? boundary : bindings.find(entry => entry.path === source.path)!.currentDocumentDigest }))
    const v2: LegacyPrerequisiteReductionRegistry = { schemaVersion: registry.schemaVersion,
      proofContract: CLUSTER_PREREQUISITE_REDUCTION_CONTRACT, auditScope: registry.auditScope,
      catalogSources: catalogs(registry.v2Checkpoint.currentDocumentDigests), originalRequires: registry.originalRequires, removals: registry.removals }
    registry.v2Checkpoint = { registryDigest: digest(v2), currentDocumentDigests: v2.catalogSources.map(({ path, currentDocumentDigest }) => ({ path, currentDocumentDigest })) }
    const v3: OrderedPrerequisiteReductionRegistry = { ...v2, proofContract: ORDERED_PREREQUISITE_REDUCTION_CONTRACT,
      catalogSources: catalogs(registry.v3Checkpoint.currentDocumentDigests), v2Checkpoint: registry.v2Checkpoint,
      suffixOriginalRequires: registry.suffixOriginalRequires, suffix: registry.suffix }
    registry.v3Checkpoint = { registryDigest: digest(v3), currentDocumentDigests: v3.catalogSources.map(({ path, currentDocumentDigest }) => ({ path, currentDocumentDigest })) }
    const v4: ContinuedPrerequisiteReductionRegistry = { ...v3, proofContract: CONTINUED_PREREQUISITE_REDUCTION_CONTRACT,
      catalogSources: catalogs(registry.v4Checkpoint.currentDocumentDigests), v3Checkpoint: registry.v3Checkpoint,
      tailOriginalRequires: registry.tailOriginalRequires, atomicRemovals: registry.atomicRemovals, witnessContinuations: registry.witnessContinuations }
    registry.v4Checkpoint = { registryDigest: digest(v4), currentDocumentDigests: v4.catalogSources.map(({ path, currentDocumentDigest }) => ({ path, currentDocumentDigest })) }
    parentFixture.save()
  }
  const parent = structuredClone(parentFixture.registry)
  const documents = [parentFixture.current, parentFixture.document]
  const registry: BatchedPrerequisiteReductionRegistry = {
    ...structuredClone(parent), proofContract: BATCHED_PREREQUISITE_REDUCTION_CONTRACT,
    v5Checkpoint: { registryDigest: digest(parent), currentDocumentDigests: parent.catalogSources
      .map(({ path, currentDocumentDigest }) => ({ path, currentDocumentDigest })) }, batches: [],
  }
  const get = (key: string) => {
    const [owner, id] = key.split(':')
    const raw = documents.find(doc => doc.landscapeId === owner)?.goals.find(goal => goal.id === id)
    assert.ok(raw, `fixture source ${key}`)
    return raw
  }
  const bindings = () => registry.catalogSources.map(source => ({ path: source.path,
    currentDocumentDigest: digest(documents.find(doc => doc.landscapeId === source.landscapeId)!) }))
  const save = () => {
    for (const source of registry.catalogSources) {
      const document = documents.find(doc => doc.landscapeId === source.landscapeId)!
      source.currentDocumentDigest = digest(document)
      writeFileSync(resolve(parentFixture.directory, source.path), JSON.stringify(document))
    }
    writeFileSync(resolve(parentFixture.directory, 'proof.json'), JSON.stringify(registry))
  }
  const add = (operations: BatchedPrerequisiteReductionOperation[], change: () => void,
    continuations: BatchWitnessContinuation[] = []) => {
    const sources = [...new Set(operations.flatMap(operation => 'steps' in operation
      ? operation.steps.map(step => step.source) : [operation.step.source]))]
    const originalRequires = sources.map(source => ({ source,
      requires: Object.hasOwn(get(source), 'requires') ? [...get(source).requires] : null }))
    const previousDigest = registry.batches.length ? digest(registry.batches.at(-1)) : registry.v5Checkpoint.registryDigest
    change()
    const batch: PrerequisiteReductionBatch = { id: `batch-${registry.batches.length + 1}`, previousDigest,
      originalRequires, operations: structuredClone(operations), currentDocumentDigests: bindings(), legacyContinuations: structuredClone(continuations) }
    registry.batches.push(batch)
    save()
    return batch
  }
  const load = () => loadVerifiedPrerequisiteReductionContext({ repositoryRoot: parentFixture.directory,
    registryPath: 'proof.json', catalogPath: 'canonical' })
  return { ...parentFixture, parent, registry, documents, get, add, save, load }
}
const targetKey = (id: string) => `cluster-target-test:${id}`
function atomicBatchFixture(document = clusterTargetBaseline()) {
  document.goals.push(goal('u', ['v', 'w']), goal('v', ['w']), goal('w'))
  const f = batchFixture(document)
  const operation: BatchedPrerequisiteReductionOperation = { id: 'cut-u-w', step: {
    source: targetKey('u'), prerequisite: targetKey('w'), witness: ['u', 'v', 'w'].map(targetKey),
  }, endWitness: ['u', 'v', 'w'].map(targetKey) }
  f.add([operation], () => { f.get(targetKey('u')).requires = ['v'] })
  return { ...f, operation }
}
function applicabilityRefreshFixture(present = true, empty = false, additionalGoals: Goal[] = []) {
  const document = clusterTargetBaseline()
  document.goals.push(...structuredClone(additionalGoals))
  for (const id of ['cache', 'cache-other']) {
    const cached = { ...goal(id), ...(empty ? {} : {
      extendedData: { applicabilityOverrides: { jurisdiction: ['DE-BY'] } },
    }) } as Goal
    if (present || id === 'cache-other') cached.applicability = { jurisdiction: ['DE-HE'] }
    document.goals.push(cached)
  }
  const f = atomicBatchFixture(document), parentRegistry = structuredClone(f.registry)
  const parentFile = resolve(f.directory, 'parent-v6.json')
  const parentBytes = Buffer.from(`${JSON.stringify(parentRegistry, null, 2)}\n`)
  writeFileSync(parentFile, parentBytes)
  const originalApplicability = ['cache', 'cache-other'].map(id => {
    const raw = f.get(targetKey(id)), present = Object.hasOwn(raw, 'applicability')
    const original = { source: targetKey(id), present,
      value: present ? structuredClone(raw.applicability) as Record<string, unknown> : null }
    if (empty) delete raw.applicability
    else raw.applicability = { jurisdiction: ['DE-BY'] }
    return original
  })
  const registry: ApplicabilityRefreshPrerequisiteReductionRegistry = {
    schemaVersion: 1, proofContract: APPLICABILITY_REFRESH_PREREQUISITE_REDUCTION_CONTRACT,
    auditScope: 'origin-source-landscape-closure', catalogSources: structuredClone(parentRegistry.catalogSources),
    parentRegistryPath: 'parent-v6.json',
    parentRegistryRawDigest: `sha256:${createHash('sha256').update(parentBytes).digest('hex')}`,
    originalApplicability,
  }
  const save = () => {
    for (const source of registry.catalogSources) {
      const document = f.documents.find(document => document.landscapeId === source.landscapeId)!
      source.currentDocumentDigest = digest(document)
      writeFileSync(resolve(f.directory, source.path), JSON.stringify(document))
    }
    writeFileSync(resolve(f.directory, 'proof.json'), JSON.stringify(registry))
  }
  const rewriteParent = () => {
    const bytes = Buffer.from(`${JSON.stringify(parentRegistry, null, 2)}\n`)
    writeFileSync(parentFile, bytes)
    registry.parentRegistryRawDigest = `sha256:${createHash('sha256').update(bytes).digest('hex')}`
  }
  save()
  return { ...f, registry, parentRegistry, parentFile, parentBytes, save, rewriteParent }
}
const neuroId = '487c79f5-7e4d-5da8-ad8f-f0f96c23a974'
const byNeuroId = '11675f1a-5de2-5926-be78-1e8275f19f5b'
const heNeuroId = 'afde0001-d7d7-5ed3-8a60-383e8da5620e'
const neuroOriginalClusters = ['02f8a5a3-9c44-50ec-b9b8-a0b7f402aaa8',
  '7e6b9185-f261-5c76-961a-c61e1cc4ef8d', '485ef1c3-8997-52b7-91f5-b1ddf179013d']
function basisBoundFixture(cachePresent = true) {
  // Three real endpoint records retain their actual immediate refs and source
  // metadata. They come from a snapshot of canonical Biology at the freeze, so the
  // fixtures stay the same when the live catalog changes. Minimal dependency
  // clusters isolate the real neuro all-of counterexample; this fixture is not the
  // complete Biology certificate.
  // Without `cachePresent` the reviewed cache goal lacks the `applicability` field.
  const biology = JSON.parse(readFileSync(resolve(root,
    'app/scripts/fixtures/prerequisite-reduction-basis-bound-goals.json'), 'utf8')) as Document
  const raw = (id: string) => structuredClone(biology.goals.find(goal => goal.id === id)!)
  const neuro = raw(neuroId), by = raw(byNeuroId), he = raw(heNeuroId)
  assert.ok(neuro && by && he)
  neuro.requires = [...neuroOriginalClusters]
  delete (neuro.extendedData as Record<string, unknown>).assessmentApplicabilityBasis
  const extra = [neuro, by, he,
    ...new Set([...by.requires, ...he.requires])].flatMap(entry => typeof entry === 'string' ? [goal(entry)] : [entry])
  for (const id of neuroOriginalClusters) extra.push({ ...goal(id), type: 'cluster', contains: [byNeuroId, heNeuroId] })
  for (const [id, prerequisite] of [['basis-control-by', byNeuroId], ['basis-control-he', heNeuroId]])
    extra.push({ ...goal(id, [prerequisite]), tags: ['Assessment'], extendedData: { applicabilityFromRequires: true } })
  extra.push({ ...goal('zz-basis-history-parent', ['basis-history-x']), type: 'cluster', contains: ['v'] },
    goal('basis-history-x', ['w']), goal('basis-next-source', ['basis-next-mid', 'basis-next-end']),
    goal('basis-next-mid', ['basis-next-end']), goal('basis-next-end'))
  const f = applicabilityRefreshFixture(cachePresent, false, extra)
  const parentRegistry = structuredClone(f.registry), parentPath = 'basis-parent-v7.json'
  const parentFile = resolve(f.directory, parentPath)
  const parentBytes = Buffer.from(JSON.stringify(parentRegistry, null, 2) + '\n')
  writeFileSync(parentFile, parentBytes)
  const source = targetKey(neuroId), originalRequires = [{ source, requires: [...neuro.requires] },
    { source: targetKey('v'), requires: [...f.get(targetKey('v')).requires] }]
  const operations: BatchedPrerequisiteReductionOperation[] = neuroOriginalClusters.map((cluster, index) => ({
    id: `basis-neuro-cluster-${index}`,
    steps: [...(index === 0 ? [byNeuroId, heNeuroId].map(prerequisite => ({
      operation: 'materialize-atomic' as const, source, prerequisite: targetKey(prerequisite),
      origin: { source, prerequisite: cluster, sourceContainsPath: [source],
        prerequisiteContainsPath: [targetKey(cluster), targetKey(prerequisite)] },
    })) : []), { operation: 'remove-cluster-target' as const, source, prerequisite: targetKey(cluster) }],
    endAtomicWitnesses: [byNeuroId, heNeuroId].map(id => [source, targetKey(id)]),
  }))
  operations.push({ id: 'basis-v-x', step: { operation: 'materialize-atomic', source: targetKey('v'),
    prerequisite: targetKey('basis-history-x'), origin: { source: targetKey('zz-basis-history-parent'),
      prerequisite: 'basis-history-x', sourceContainsPath: ['zz-basis-history-parent', 'v'].map(targetKey),
      prerequisiteContainsPath: [targetKey('basis-history-x')] } },
    endWitness: ['v', 'basis-history-x'].map(targetKey) },
  { id: 'basis-cut-v-w', step: { source: targetKey('v'), prerequisite: targetKey('w'),
    witness: ['v', 'basis-history-x', 'w'].map(targetKey) },
    endWitness: ['v', 'basis-history-x', 'w'].map(targetKey) })
  f.get(source).requires = [byNeuroId, heNeuroId]
  ;(f.get(source).extendedData as Record<string, unknown>).assessmentApplicabilityBasis = {
    kind: 'allOfGoalApplicability', goalRefs: [...neuroOriginalClusters],
  }
  f.get(targetKey('v')).requires = ['basis-history-x']
  const bindings = () => f.registry.catalogSources.map(({ path, landscapeId }) => ({ path,
    currentDocumentDigest: digest(f.documents.find(document => document.landscapeId === landscapeId)!) }))
  const batch: PrerequisiteReductionBatch = { id: 'basis-bio-batch',
    previousDigest: `sha256:${createHash('sha256').update(parentBytes).digest('hex')}`,
    originalRequires, operations, currentDocumentDigests: bindings(),
    legacyContinuations: [{ witness: { kind: 'batch-path', operationId: 'cut-u-w' }, edgeIndex: 1, removalId: 'basis-cut-v-w' }] }
  const entry: AssessmentBasisReductionEntry = { basisBindings: [{ operation: 'bind-assessment-applicability-basis', source }], batch }
  const registry: BasisBoundPrerequisiteReductionRegistry = {
    schemaVersion: 1, proofContract: BASIS_BOUND_PREREQUISITE_REDUCTION_CONTRACT,
    auditScope: 'origin-source-landscape-closure', catalogSources: structuredClone(parentRegistry.catalogSources),
    parentRegistryPath: parentPath, parentRegistryRawDigest: batch.previousDigest, entries: [entry],
  }
  const save = () => {
    registry.entries.at(-1)!.batch.currentDocumentDigests = bindings()
    for (const source of registry.catalogSources) {
      const document = f.documents.find(document => document.landscapeId === source.landscapeId)!
      source.currentDocumentDigest = digest(document)
      writeFileSync(resolve(f.directory, source.path), JSON.stringify(document))
    }
    writeFileSync(resolve(f.directory, 'proof.json'), JSON.stringify(registry))
  }
  const rewriteParent = () => {
    const bytes = Buffer.from(JSON.stringify(parentRegistry, null, 2) + '\n')
    writeFileSync(parentFile, bytes)
    registry.parentRegistryRawDigest = `sha256:${createHash('sha256').update(bytes).digest('hex')}`
    registry.entries[0].batch.previousDigest = registry.parentRegistryRawDigest
  }
  save()
  return { ...f, registry, entry, source, parentFile, parentRegistry, parentBytes, save, rewriteParent }
}
async function runBasisBoundFixtureRegressions() {
  const f = basisBoundFixture(), context = await f.load()
  assert.ok(context)
  assert.equal(verifiedPrerequisiteReductionSummary(context)!.proofContract, BASIS_BOUND_PREREQUISITE_REDUCTION_CONTRACT)
  const historical = reviewBindingGoal(context, f.source, f.get(f.source))
  assert.deepEqual(historical.requires, neuroOriginalClusters)
  assert.equal(Object.hasOwn(historical.extendedData as object, 'assessmentApplicabilityBasis'), false)
  assert.deepEqual(f.get(f.source).requires, [byNeuroId, heNeuroId])
  for (const id of ['basis-control-by', 'basis-control-he'])
    assert.equal(Object.hasOwn(f.get(targetKey(id)).extendedData as object, 'assessmentApplicabilityBasis'), false)
  const { buildGoalDescriptionCanonicalContext } = await import('./validateGoalDescriptionReviewCampaign')
  assert.throws(() => buildGoalDescriptionCanonicalContext(f.get(f.source)), /requires a verified V8 baseline/u)
  assert.deepEqual(buildGoalDescriptionCanonicalContext(historical).requires, neuroOriginalClusters)
  assert.throws(() => reviewBindingGoal({} as VerifiedPrerequisiteReductionContext, f.source, f.get(f.source)), /forged/u)
  assert.throws(() => reviewBindingGoal(context, f.source, { ...f.get(f.source), title: 'unverified current drift' }), /current goal differs/u)
  let checks = 1
  const reject = async (mutate: (f: ReturnType<typeof basisBoundFixture>) => void, expected: RegExp) => {
    const invalid = basisBoundFixture(); mutate(invalid); invalid.save()
    await assert.rejects(invalid.load, expected); checks++
  }
  await reject(f => { writeFileSync(f.parentFile, Buffer.concat([f.parentBytes, Buffer.from(' ')])) }, /parent raw digest differs/u)
  await reject(f => { f.registry.parentRegistryPath = './basis-parent-v7.json' }, /canonical and relative/u)
  await reject(f => { f.registry.parentRegistryRawDigest = `sha256:${'0'.repeat(64)}` }, /parent raw digest differs/u)
  await reject(f => { f.parentRegistry.parentRegistryRawDigest = `sha256:${'0'.repeat(64)}`; f.rewriteParent() }, /parent raw digest differs/u)
  await reject(f => { f.registry.entries[0].batch.previousDigest = digest({ wrong: true }) }, /entry predecessor/u)
  await reject(f => { f.entry.basisBindings = [] }, /entry start document digest/u)
  await reject(f => { f.entry.basisBindings.push(structuredClone(f.entry.basisBindings[0])) }, /duplicate assessment basis binding/u)
  await reject(f => { f.entry.basisBindings.push({ operation: 'bind-assessment-applicability-basis', source: targetKey('basis-control-by') });
    (f.get(targetKey('basis-control-by')).extendedData as Record<string, unknown>).assessmentApplicabilityBasis = {
      kind: 'allOfGoalApplicability', goalRefs: [byNeuroId],
    } }, /cover exactly changed eligible/u)
  for (const refs of [[...neuroOriginalClusters].reverse(), [byNeuroId, heNeuroId], ['unknown'], [neuroId]])
    await reject(f => { (f.get(f.source).extendedData as Record<string, unknown>).assessmentApplicabilityBasis = {
      kind: 'allOfGoalApplicability', goalRefs: refs,
    } }, /document digest differs|basis references changed/u)
  for (const field of ['title', 'contains', 'applicability', 'sourceRef', 'extendedData'])
    await reject(f => { const current = f.get(f.source)
      if (field === 'contains') current.contains = [byNeuroId]
      else if (field === 'applicability') current.applicability = { jurisdiction: ['DE-BY'] }
      else if (field === 'extendedData') (current.extendedData as Record<string, unknown>).unchecked = true
      else current[field] = 'undeclared drift'
    }, /entry start document digest/u)
  await reject(f => { f.entry.batch.legacyContinuations = [] }, /literal atomic witness edge missing/u)
  await reject(f => { const cut = f.entry.batch.operations.at(-1)!; assert.ok('step' in cut && 'witness' in cut.step)
    cut.step.witness = ['v', 'u', 'w'].map(targetKey)
  }, /literal atomic witness edge missing/u)
  const appended = basisBoundFixture(), source = targetKey('basis-next-source')
  const originalRequires = [...appended.get(source).requires]
  appended.get(source).requires = ['basis-next-mid']
  appended.registry.entries.push({ basisBindings: [], batch: {
    id: 'basis-next-flat-batch', previousDigest: digest(appended.entry), originalRequires: [{ source, requires: originalRequires }],
    operations: [{ id: 'basis-next-cut', step: { source, prerequisite: targetKey('basis-next-end'),
      witness: ['basis-next-source', 'basis-next-mid', 'basis-next-end'].map(targetKey) },
      endWitness: ['basis-next-source', 'basis-next-mid', 'basis-next-end'].map(targetKey) }],
    currentDocumentDigests: [], legacyContinuations: [],
  } })
  appended.save()
  assert.ok(await appended.load(), 'later subjects append a flat entry under the same fixed V7 contract')
  checks++
  console.log(`Basis-bound public loader fixtures passed: ${checks}; real neuro predicate shape, exact old refs, per-cut witnesses and prefix continuation retained`)
}

// V9 freezes the complete V8 fixture proof: its exact bytes stay beside the catalog as the
// frozen parent, and `proof.json` becomes the goal-scoped registry derived from them.
const goalScopedParentPath = 'frozen-parent-v8.json'
const rawDigest = (bytes: Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
// Equal parent bytes bind equal catalogs, so one complete V8 derivation serves every fresh copy.
const goalScopedDerivations = new Map<string, string>()
async function goalScopedFixture(cachePresent = true) {
  const f = basisBoundFixture(cachePresent), frozenParentFile = resolve(f.directory, goalScopedParentPath)
  const frozenParentBytes = readFileSync(resolve(f.directory, 'proof.json')), parentDigest = rawDigest(frozenParentBytes)
  writeFileSync(frozenParentFile, frozenParentBytes)
  const derive = () => deriveGoalScopedPrerequisiteReductionRegistry({
    repositoryRoot: f.directory, parentRegistryPath: goalScopedParentPath, catalogPath: 'canonical' })
  if (!goalScopedDerivations.has(parentDigest)) goalScopedDerivations.set(parentDigest, JSON.stringify((await derive()).registry))
  const frozen = JSON.parse(goalScopedDerivations.get(parentDigest)!) as GoalScopedPrerequisiteReductionRegistry
  const transfer = (source: string) => {
    const found = frozen.transfers.find(entry => entry.source === source)
    assert.ok(found, `fixture transfer ${source}`)
    return found
  }
  // Unlike the V8 `save`, this never touches the frozen parent or any document binding.
  const save = () => {
    for (const { path, landscapeId } of f.registry.catalogSources)
      writeFileSync(resolve(f.directory, path), JSON.stringify(f.documents.find(document => document.landscapeId === landscapeId)))
    writeFileSync(resolve(f.directory, 'proof.json'), JSON.stringify(frozen))
  }
  const loadParent = () => loadVerifiedPrerequisiteReductionContext({
    repositoryRoot: f.directory, registryPath: goalScopedParentPath, catalogPath: 'canonical' })
  save()
  return { ...f, frozen, frozenParentFile, frozenParentBytes, transfer, derive, save, loadParent }
}
type GoalScopedFixture = Awaited<ReturnType<typeof goalScopedFixture>>
// The documents the verifier loads from a catalog directory, by the rule of `catalogFiles` in
// the proof module: every `.json` file below it, recursively, whose name does not contain `_deck`.
const catalogFiles = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? catalogFiles(resolve(directory, entry.name))
    : entry.isFile() && /\.json$/iu.test(entry.name) && !/_deck/iu.test(entry.name) ? [resolve(directory, entry.name)] : []).sort()
const catalogDocuments = (catalog: string) => catalogFiles(catalog).map(file => JSON.parse(readFileSync(file, 'utf8')) as Document)
const goalsOf = (documents: Document[]) => new Map<string, Goal>(documents.flatMap(document =>
  document.goals.map(goal => [`${document.landscapeId}:${goal.id}`, goal] as const)))
// Every goal of the catalog on disk, including documents the registry has never seen.
const catalogGoals = (directory: string) => goalsOf(catalogDocuments(resolve(directory, 'canonical')))
// An active transfer source gets its reviewed value from the freeze; every other goal gets its current value.
function assertGoalScopedReview(
  context: VerifiedPrerequisiteReductionContext | undefined, directory: string,
  reviewed: ReadonlyMap<string, unknown>, active: string[], label: string,
) {
  assert.ok(context, label)
  const summary = verifiedPrerequisiteReductionSummary(context)!
  assert.equal(summary.proofContract, GOAL_SCOPED_PREREQUISITE_REDUCTION_CONTRACT, label)
  assert.deepEqual(summary.affectedGoalIds, active, `${label}: active transfers`)
  for (const [key, goal] of catalogGoals(directory))
    assert.deepEqual(reviewBindingGoal(context, key, goal), active.includes(key) ? reviewed.get(key) : goal, `${label}: ${key}`)
}
async function runGoalScopedFixtureRegressions() {
  let accepted = 0, rejected = 0
  const f = await goalScopedFixture(), sources = f.frozen.transfers.map(({ source }) => source), goals = catalogGoals(f.directory)
  const complete = await f.loadParent(), context = await f.load()
  assert.ok(complete && context)
  const proven = verifiedPrerequisiteReductionSummary(complete)!
  assert.equal(proven.proofContract, BASIS_BOUND_PREREQUISITE_REDUCTION_CONTRACT)
  const reviewed = new Map([...goals].map(([key, goal]) => [key, reviewBindingGoal(complete, key, goal)]))
  for (const [key, goal] of goals) assert.deepEqual(reviewBindingGoal(context, key, goal), reviewed.get(key),
    `the frozen registry gives every goal the reviewed value of the complete proof: ${key}`)
  assertGoalScopedReview(context, f.directory, reviewed, sources, 'every transfer is active at the freeze')
  const basis = f.transfer(f.source), basisData = basis.reviewedFields.extendedData as Record<string, unknown>
  assert.deepEqual(basis.reviewedFields.requires, neuroOriginalClusters, 'the basis transfer restores the original cluster requires')
  assert.ok(basisData && !Object.hasOwn(basisData, 'assessmentApplicabilityBasis'), 'the basis transfer restores extendedData without the basis')
  const again = await f.derive()
  assert.equal(JSON.stringify(again.registry), JSON.stringify(f.frozen), 'deriving twice gives the same registry')
  assert.equal(again.provenSources, proven.affectedGoalIds.length, 'the derivation counts every source of the complete proof')
  assert.deepEqual(again.provenSourcesWithoutTransfer, [], 'every proven fixture source changed, so each has a transfer')
  // The V7 cache refresh changed goals outside the requires history; their reviews need a transfer as well.
  assert.deepEqual(sources.filter(source => !proven.affectedGoalIds.includes(source)), ['cache', 'cache-other'].map(targetKey),
    'the cache refresh adds transfers outside the requires history')
  for (const key of [f.source, targetKey('w')]) {
    assert.equal(sources.includes(key), key === f.source, `only the basis source of the two has a transfer: ${key}`)
    assert.throws(() => reviewBindingGoal(context, key, { ...goals.get(key)!, title: 'unverified drift' }),
      /current goal differs from verified snapshot/u, `a caller goal other than the loaded one is rejected: ${key}`)
  }
  accepted++

  // A field the reviews never saw is restored by deleting it.
  const absent = await goalScopedFixture(false), absentComplete = await absent.loadParent(), absentContext = await absent.load()
  assert.ok(absentComplete && absentContext)
  assert.deepEqual(absent.transfer(targetKey('cache')).reviewedAbsentFields, ['applicability'], 'the reviewed cache goal had no applicability')
  for (const [key, goal] of catalogGoals(absent.directory))
    assert.deepEqual(reviewBindingGoal(absentContext, key, goal), reviewBindingGoal(absentComplete, key, goal),
      `an absent-field transfer gives every goal the reviewed value of the complete proof: ${key}`)
  accepted++

  // The complete V8 parent binds whole documents; the frozen registry binds only its transfer goals.
  const unrelated = async (label: string, change: (g: GoalScopedFixture) => void, parent?: RegExp) => {
    const g = await goalScopedFixture(); change(g); g.save()
    assertGoalScopedReview(await g.load(), g.directory, reviewed, sources, `${label} keeps every transfer`)
    if (parent) await assert.rejects(g.loadParent, parent, `${label} stales the complete V8 parent`)
    else assert.ok(await g.loadParent(), `${label} leaves the complete V8 parent valid as well`)
    accepted++
  }
  await unrelated('a new goal', g => { g.documents[0].goals.push(goal('goal-scoped-new')) }, /current document digest differs/u)
  await unrelated('a changed title without transfer', g => { g.get(targetKey('w')).title = 'Changed after the freeze' },
    /current document digest differs/u)
  await unrelated('changed requires off every witness', g => { g.get(targetKey('basis-next-source')).requires = ['basis-next-mid'] },
    /current document digest differs/u)
  // basis-history-x -> w is the last edge of the end witness v -> basis-history-x -> w of the supported goal v.
  await unrelated('changed requires on a witness path', g => { g.get(targetKey('basis-history-x')).requires = [] },
    /current document digest differs/u)
  await unrelated('a new canonical document', g => {
    writeFileSync(resolve(g.directory, 'canonical/goal-scoped-extra.json'),
      JSON.stringify({ landscapeId: 'goal-scoped-extra', title: 'Extra', goals: [goal('n')] }))
  }, /catalog source paths are missing, new, or duplicated/u)
  // V8 projects the layer out of every document digest, so neither contract sees it.
  await unrelated('a learning-unit layer', g => {
    const document = g.documents[1] as Document & Record<string, unknown>
    document.programUnits = [learningUnit('unit')]
    document.goalPlacements = [{ goalId: 'z', unitId: 'unit', relation: 'own' }]
    document.learningUnitCoverage = 'partial'
  })

  const release = async (label: string, source: string, change: (documentGoals: Goal[], index: number) => void) => {
    const g = await goalScopedFixture(), [owner, id] = source.split(':')
    const document = g.documents.find(entry => entry.landscapeId === owner)!, index = document.goals.findIndex(entry => entry.id === id)
    const frozenGoal = structuredClone(document.goals[index])
    change(document.goals, index); g.save()
    const changed = await g.load()
    assertGoalScopedReview(changed, g.directory, reviewed, sources.filter(entry => entry !== source), `${label} releases exactly ${source}`)
    if (!catalogGoals(g.directory).has(source))
      assert.throws(() => reviewBindingGoal(changed, source, frozenGoal), /current goal differs from verified snapshot/u,
        `a removed goal has no verified snapshot: ${source}`)
    const restored = document.goals.filter(entry => entry.id !== id)
    restored.splice(index, 0, frozenGoal)
    document.goals = restored; g.save()
    assertGoalScopedReview(await g.load(), g.directory, reviewed, sources, `restoring the frozen ${source} reactivates its transfer`)
    accepted += 2
  }
  await release('a changed title', f.source, (documentGoals, index) => { documentGoals[index].title = 'Changed after the freeze' })
  await release('changed requires', local('q'), (documentGoals, index) => { documentGoals[index].requires = ['p', 's'] })
  await release('a removed goal', targetKey('u'), (documentGoals, index) => { documentGoals.splice(index, 1) })

  const tampered = async (mutate: (g: GoalScopedFixture) => void, expected: RegExp, cachePresent = true) => {
    const g = await goalScopedFixture(cachePresent); mutate(g); g.save()
    await assert.rejects(g.load, expected, `a tampered goal-scoped registry is rejected: ${expected.source}`); rejected++
  }
  const zero = `sha256:${'0'.repeat(64)}`
  await tampered(g => { g.transfer(targetKey('v')).reviewedFields.requires = ['w', 'basis-history-x'] },
    /reviewed goal digest differs: cluster-target-test:v/u)
  await tampered(g => { g.transfer(local('q')).reviewedAbsentFields.push('title') }, /reviewed goal digest differs: proof-test:q/u)
  await tampered(g => { g.transfer(targetKey('cache')).reviewedAbsentFields = ['description'] },
    /reviewed goal digest differs: cluster-target-test:cache/u, false)
  await tampered(g => { writeFileSync(g.frozenParentFile, Buffer.concat([g.frozenParentBytes, Buffer.from(' ')])) },
    /frozen parent raw digest differs/u)
  await tampered(g => { g.frozen.parentRegistryRawDigest = zero }, /frozen parent raw digest differs/u)
  await tampered(g => {
    writeFileSync(resolve(g.directory, 'frozen-parent-copy.json'), g.frozenParentBytes)
    rmSync(g.frozenParentFile); symlinkSync('frozen-parent-copy.json', g.frozenParentFile)
  }, /frozen parent must be a regular file/u)
  await tampered(g => {
    mkdirSync(resolve(g.directory, 'parent-directory'))
    writeFileSync(resolve(g.directory, 'parent-directory', goalScopedParentPath), g.frozenParentBytes)
    symlinkSync('parent-directory', resolve(g.directory, 'parent-alias'))
    g.frozen.parentRegistryPath = `parent-alias/${goalScopedParentPath}`
  }, /frozen parent path contains a symlink/u)
  for (const alias of [`./${goalScopedParentPath}`, `history/../${goalScopedParentPath}`])
    await tampered(g => { g.frozen.parentRegistryPath = alias }, /frozen parent path must be canonical and relative/u)
  await tampered(g => { g.frozen.parentRegistryPath = g.frozenParentFile }, /frozen parent path must be canonical and relative/u)
  await tampered(g => { g.frozen.parentRegistryPath = '../outside.json' }, /path escapes repository/u)
  await tampered(g => { g.frozen.parentRegistryPath = 'basis-parent-v7.json'; g.frozen.parentRegistryRawDigest = rawDigest(g.parentBytes) },
    /goal-scoped registry requires a strict V8 parent/u)
  await tampered(g => { g.frozen.frozenCatalogSources[0].frozenDocumentDigest = zero }, /frozen catalog bindings differ from the frozen parent/u)
  await tampered(g => { g.frozen.frozenCatalogSources.reverse() }, /frozen catalog bindings differ from the frozen parent/u)
  await tampered(g => { Object.assign(g.frozen, { extra: true }) }, /invalid goal-scoped registry fields/u)
  await tampered(g => { Object.assign(g.frozen, { schemaVersion: 2 }) }, /invalid goal-scoped parent or scope/u)
  await tampered(g => { Object.assign(g.frozen.frozenCatalogSources[0], { extra: true }) }, /invalid frozen catalog source fields/u)
  await tampered(g => { g.frozen.frozenCatalogSources.push(structuredClone(g.frozen.frozenCatalogSources[0])) },
    /invalid or duplicate frozen catalog source/u)
  await tampered(g => { Object.assign(g.frozen.transfers[0], { extra: true }) }, /invalid review transfer fields/u)
  for (const mutate of [
    (g: GoalScopedFixture) => { g.frozen.transfers.reverse() },
    (g: GoalScopedFixture) => { g.frozen.transfers.splice(1, 0, structuredClone(g.frozen.transfers[0])) },
    (g: GoalScopedFixture) => { g.frozen.transfers.push({ ...structuredClone(g.frozen.transfers.at(-1)!), source: 'zz-unknown-landscape:q' }) },
  ]) await tampered(mutate, /invalid, unsorted or duplicate review transfer source/u)
  await tampered(g => { g.frozen.transfers[0].reviewedGoalDigest = g.frozen.transfers[0].frozenGoalDigest }, /invalid or no-op review transfer digests/u)
  for (const mutate of [
    (g: GoalScopedFixture) => { Object.assign(g.frozen.transfers[0], { reviewedFields: {}, reviewedAbsentFields: [] }) },
    (g: GoalScopedFixture) => { g.frozen.transfers[0].reviewedFields.id = 'renamed' },
    (g: GoalScopedFixture) => { g.frozen.transfers[0].reviewedAbsentFields = Object.keys(g.frozen.transfers[0].reviewedFields).slice(0, 1) },
  ]) await tampered(mutate, /empty, duplicate or identity-changing reviewed fields/u)
  await tampered(g => { g.frozen.transfers = [] }, /empty review transfers/u)

  // The registry is immutable evidence: a consistently rebound transfer cannot be told apart
  // at load. The derivation from the frozen parent, run at the freeze, exposes it.
  const forged = await goalScopedFixture(), forgedTransfer = forged.transfer(targetKey('v'))
  forgedTransfer.reviewedFields.requires = ['basis-history-x', 'w']
  const forgedGoal: Record<string, unknown> = { ...structuredClone(forged.get(targetKey('v'))), ...structuredClone(forgedTransfer.reviewedFields) }
  for (const field of forgedTransfer.reviewedAbsentFields) delete forgedGoal[field]
  forgedTransfer.reviewedGoalDigest = fingerprintPrerequisiteReductionRecord(forgedGoal)
  forged.save()
  const forgedContext = await forged.load()
  assert.ok(forgedContext, 'a consistently rebound transfer loads')
  assert.deepEqual(reviewBindingGoal(forgedContext, targetKey('v'), forged.get(targetKey('v'))), forgedGoal,
    'a forged registry supplies its forged reviewed value')
  assert.notEqual(JSON.stringify((await forged.derive()).registry), JSON.stringify(forged.frozen),
    'the derivation from the frozen parent differs from a forged registry')
  accepted++

  // Only the proof's end state can be frozen.
  const moved = await goalScopedFixture()
  moved.get(targetKey('w')).title = 'Changed after the freeze'; moved.save()
  await assert.rejects(moved.derive, /current document digest differs/u, 'the derivation refuses a catalog past the end state'); rejected++
  await assert.rejects(deriveGoalScopedPrerequisiteReductionRegistry({ repositoryRoot: f.directory,
    parentRegistryPath: 'basis-parent-v7.json', catalogPath: 'canonical' }), /strict V8 parent/u, 'only a V8 proof can be frozen'); rejected++
  console.log(`Goal-scoped V9 fixtures passed: ${accepted} accepted and ${rejected} rejected cases; ${sources.length} transfers reproduce every reviewed value of the complete V8 proof, unrelated changes keep them and a changed goal releases only itself.`)
}

async function runApplicabilityRefreshFixtureRegressions() {
  let checks = 0
  for (const [present, empty] of [[false, false], [true, false], [true, true]]) {
    const f = applicabilityRefreshFixture(present, empty), context = await f.load()
    assert.ok(context)
    assert.equal(verifiedPrerequisiteReductionSummary(context)!.proofContract, APPLICABILITY_REFRESH_PREREQUISITE_REDUCTION_CONTRACT)
    assert.deepEqual(verifiedPrerequisiteReductionSummary(context)!.affectedGoalIds,
      [...earliestBatchTestOriginals(f.parentRegistry).keys()].sort(), 'cache sources do not enlarge requires history')
    const current = f.get(targetKey('cache')), historical = reviewBindingGoal(context, targetKey('cache'), current)
    assert.equal(Object.hasOwn(historical, 'applicability'), present)
    if (present) assert.deepEqual(historical.applicability, { jurisdiction: ['DE-HE'] })
    if (empty) assert.equal(Object.hasOwn(current, 'applicability'), false, 'empty compiled maps delete the cache field')
    else assert.deepEqual(current.applicability, { jurisdiction: ['DE-BY'] })
    assert.equal(fingerprintSemanticKindSourceGoal(current), fingerprintSemanticKindSourceGoal(historical))
    assert.deepEqual(readFileSync(f.parentFile), f.parentBytes)
    checks++
  }
  const reject = async (mutate: (f: ReturnType<typeof applicabilityRefreshFixture>) => void, expected: RegExp) => {
    const f = applicabilityRefreshFixture()
    mutate(f); f.save()
    await assert.rejects(f.load, expected); checks++
  }
  await reject(f => { f.get(targetKey('u')).extendedData = {
    assessmentApplicabilityBasis: { kind: 'allOfGoalApplicability', goalRefs: ['v'] },
  } }, /current document digest differs/u)
  await reject(f => { f.registry.originalApplicability.push(structuredClone(f.registry.originalApplicability[0])) }, /duplicate original applicability/u)
  await reject(f => { Object.assign(f.registry, { extra: true }) }, /invalid applicability refresh registry fields/u)
  await reject(f => { Object.assign(f.registry.originalApplicability[0], { extra: true }) }, /invalid original applicability fields/u)
  await reject(f => { f.registry.originalApplicability.pop() }, /current document digest differs/u)
  await reject(f => { f.registry.originalApplicability[0].source = targetKey('unknown') }, /unknown original applicability source/u)
  await reject(f => { f.registry.originalApplicability.push({ source: targetKey('u'), present: false, value: null }) }, /no-op applicability refresh/u)
  await reject(f => { f.registry.originalApplicability[0].present = false }, /invalid or duplicate original applicability/u)
  await reject(f => { f.registry.originalApplicability[0].value = null }, /invalid or duplicate original applicability/u)
  await reject(f => { f.registry.originalApplicability[0] = { source: targetKey('cache'), present: false, value: null } }, /current document digest differs/u)
  await reject(f => { f.registry.originalApplicability[0].value = {} }, /current document digest differs/u)
  await reject(f => { f.get(targetKey('cache')).applicability = { jurisdiction: ['DE-BW'] } }, /compiled cache-only frame/u)
  await reject(f => { f.get(targetKey('u')).applicability = { jurisdiction: ['DE-BY'] } }, /current document digest differs/u)
  for (const [field, value] of [
    ['requires', ['v']], ['contains', ['v']], ['title', 'Undeclared text'],
    ['extendedData', { applicabilityOverrides: { jurisdiction: ['DE-HE'] } }],
  ] as const) await reject(f => { Object.assign(f.get(targetKey('cache')), { [field]: structuredClone(value) }) }, /current document digest differs/u)
  await reject(f => { f.registry.catalogSources[0].baselineDocumentDigest = `sha256:${'0'.repeat(64)}` }, /parent catalog bindings differ/u)
  await reject(f => { f.registry.parentRegistryRawDigest = `sha256:${'0'.repeat(64)}` }, /parent raw digest differs/u)
  await reject(f => { f.parentRegistry.v5Checkpoint.registryDigest = `sha256:${'0'.repeat(64)}`; f.rewriteParent() }, /historical V5 registry digest differs/u)
  await reject(f => {
    const bytes = Buffer.from(JSON.stringify(f.registry)); writeFileSync(f.parentFile, bytes)
    f.registry.parentRegistryRawDigest = `sha256:${createHash('sha256').update(bytes).digest('hex')}`
  }, /requires a strict V6 parent/u)
  await reject(f => { f.registry.parentRegistryPath = '../outside.json' }, /path escapes repository/u)
  for (const alias of ['./parent-v6.json', 'history/../parent-v6.json'])
    await reject(f => { f.registry.parentRegistryPath = alias }, /parent path must be canonical and relative/u)
  await reject(f => { f.registry.parentRegistryPath = f.parentFile }, /parent path must be canonical and relative/u)
  await reject(f => {
    writeFileSync(resolve(f.directory, 'other-parent.json'), f.parentBytes)
    rmSync(f.parentFile); symlinkSync('other-parent.json', f.parentFile)
  }, /parent must be a regular file/u)
  await reject(f => {
    mkdirSync(resolve(f.directory, 'parent-directory'))
    writeFileSync(resolve(f.directory, 'parent-directory/parent.json'), f.parentBytes)
    symlinkSync('parent-directory', resolve(f.directory, 'parent-alias'))
    f.registry.parentRegistryPath = 'parent-alias/parent.json'
  }, /parent path contains a symlink/u)
  const wrongCurrent = applicabilityRefreshFixture()
  wrongCurrent.registry.catalogSources[0].currentDocumentDigest = `sha256:${'0'.repeat(64)}`
  writeFileSync(resolve(wrongCurrent.directory, 'proof.json'), JSON.stringify(wrongCurrent.registry))
  await assert.rejects(wrongCurrent.load, /current document digest differs/u); checks++
  const changingParent = applicabilityRefreshFixture(), pending = changingParent.load()
  writeFileSync(changingParent.parentFile, Buffer.concat([changingParent.parentBytes, Buffer.from('\n')]))
  await assert.rejects(pending, /parent raw digest differs/u); checks++
  console.log(`V7 applicability refresh fixture checks passed: ${checks}`)
}
function sourceProductFixture() {
  const document = clusterTargetBaseline()
  document.goals.push({ ...goal('sc', ['tc']), type: 'cluster', contains: ['sa', 'sb'] },
    { ...goal('tc'), type: 'cluster', contains: ['ta', 'tb'] }, goal('sa', ['ta']), goal('sb'), goal('ta'), goal('tb'))
  for (const id of ['sa', 'sb', 'ta', 'tb']) delete document.goals.find(goal => goal.id === id)!.type
  const f = batchFixture(document)
  const additions: BatchedPrerequisiteReductionOperation[] = [['sa', 'tb'], ['sb', 'ta'], ['sb', 'tb']].map(([source, target]) => ({
    id: `add-${source}-${target}`, step: { operation: 'materialize-atomic', source: targetKey(source), prerequisite: targetKey(target),
      origin: { source: targetKey('sc'), prerequisite: 'tc', sourceContainsPath: ['sc', source].map(targetKey),
        prerequisiteContainsPath: ['tc', target].map(targetKey) } }, endWitness: [source, target].map(targetKey),
  }))
  const coverage = ['sa', 'sb'].flatMap(source => ['ta', 'tb'].map(target => [source, target].map(targetKey)))
  const cut: BatchedPrerequisiteReductionOperation = { id: 'cut-sc-tc', step: { operation: 'remove-cluster',
    source: targetKey('sc'), prerequisite: targetKey('tc'), atomicWitnesses: coverage }, endAtomicWitnesses: coverage }
  f.add([...additions, cut], () => {
    f.get(targetKey('sa')).requires = ['ta', 'tb']
    f.get(targetKey('sb')).requires = ['ta', 'tb']
    f.get(targetKey('sc')).requires = []
  })
  return f
}
let batchChecks = 0
async function rejectBatch(mutate: (f: ReturnType<typeof atomicBatchFixture>) => void, expected: RegExp) {
  const f = atomicBatchFixture()
  mutate(f); f.save()
  await assert.rejects(f.load, expected); batchChecks++
}
async function runBatchFixtureRegressions() {
  const f = atomicBatchFixture(), context = await f.load()
  assert.ok(context)
  assert.equal(verifiedPrerequisiteReductionSummary(context)!.proofContract, BATCHED_PREREQUISITE_REDUCTION_CONTRACT)
  assert.deepEqual(reviewBindingGoal(context, targetKey('u'), f.get(targetKey('u'))).requires, ['v', 'w'])
  assert.equal(digest(f.parent), f.registry.v5Checkpoint.registryDigest)
  assert.deepEqual(f.registry.originalRequires, f.parent.originalRequires)
  assert.deepEqual(f.registry.atomicRemovals, f.parent.atomicRemovals)
  batchChecks++

  // V6 canonical structural leaves permit absent type; explicit contradictory type remains invalid.
  const structural = atomicBatchFixture()
  // This change is part of the genuine parent document, not a post-hoc digest bypass.
  const structuralDocument = clusterTargetBaseline()
  structuralDocument.goals.push(goal('u', ['v', 'w']), goal('v', ['w']), goal('w'))
  for (const id of ['u', 'v', 'w']) delete structuralDocument.goals.find(goal => goal.id === id)!.type
  const validStructural = batchFixture(structuredClone(structuralDocument))
  validStructural.add([structuredClone(structural.operation)], () => { validStructural.get(targetKey('u')).requires = ['v'] })
  assert.ok(await validStructural.load()); batchChecks++
  const invalidDocument = structuredClone(structuralDocument)
  invalidDocument.goals.find(goal => goal.id === 'v')!.type = 'cluster'
  const invalidStructural = batchFixture(invalidDocument)
  invalidStructural.add([structuredClone(structural.operation)], () => { invalidStructural.get(targetKey('u')).requires = ['v'] })
  await assert.rejects(invalidStructural.load, /structural canonical leaf/u); batchChecks++

  // Canonical C-source×C-target expansion retains an already-direct leaf and adds only the missing Cartesian pairs.
  const product = sourceProductFixture()
  assert.ok(await product.load())
  assert.deepEqual(product.get(targetKey('sa')).requires, ['ta', 'tb']); batchChecks++
  const incomplete = sourceProductFixture()
  const removal = incomplete.registry.batches[0].operations.at(-1)!
  assert.ok('endAtomicWitnesses' in removal)
  removal.endAtomicWitnesses.pop(); incomplete.save()
  await assert.rejects(incomplete.load, /coverage differs|coverage is incomplete/u); batchChecks++
  const badFresh = sourceProductFixture()
  const badCut = badFresh.registry.batches[0].operations.at(-1)!
  assert.ok('step' in badCut && 'atomicWitnesses' in badCut.step)
  badCut.step.atomicWitnesses.pop(); badFresh.save()
  await assert.rejects(badFresh.load, /Cartesian coverage is incomplete/u); batchChecks++

  // Multiple batches can touch the same source, including a prior historical source. No overlap exclusion.
  const overlapDoc = clusterTargetBaseline()
  overlapDoc.goals.push(goal('u', ['v', 'w', 'x']), goal('v', ['w']), goal('w', ['x']), goal('x'))
  const overlap = batchFixture(overlapDoc)
  overlap.add([{ id: 'remove-u-x', step: { source: targetKey('u'), prerequisite: targetKey('x'),
    witness: ['u', 'w', 'x'].map(targetKey) }, endWitness: ['u', 'v', 'w', 'x'].map(targetKey) }],
  () => { overlap.get(targetKey('u')).requires = ['v', 'w'] })
  overlap.add([{ id: 'remove-u-w', step: { source: targetKey('u'), prerequisite: targetKey('w'),
    witness: ['u', 'v', 'w'].map(targetKey) }, endWitness: ['u', 'v', 'w'].map(targetKey) }],
  () => { overlap.get(targetKey('u')).requires = ['v'] })
  assert.ok(await overlap.load()); batchChecks++

  // A genuine foreign historical V2 obligation is continued; the unchanged V4 continuation is resolved first.
  const historyDoc = clusterTargetBaseline()
  historyDoc.goals.push(goal('h0', ['h1', 'h2', 'h3']), goal('h1', ['h2']), goal('h2'), goal('h3', ['h1']))
  const legacy = batchFixture(historyDoc, orderedBaseline(), { operation: {
    source: targetKey('h0'), prerequisite: targetKey('h2'), witness: ['h0', 'h1', 'h2'].map(targetKey) },
  original: ['h1', 'h2', 'h3'], after: ['h1', 'h3'] })
  const continuation: BatchWitnessContinuation = { witness: { kind: 'legacy-path', path: '/removals/1/witness' }, edgeIndex: 0, removalId: 'remove-h0-h1' }
  legacy.add([{ id: 'remove-h0-h1', step: { source: targetKey('h0'), prerequisite: targetKey('h1'), witness: ['h0', 'h3', 'h1'].map(targetKey) },
    endWitness: ['h0', 'h3', 'h1'].map(targetKey) }], () => { legacy.get(targetKey('h0')).requires = ['h3'] }, [continuation])
  assert.ok(await legacy.load()); batchChecks++
  legacy.registry.batches[0].legacyContinuations = []; legacy.save()
  await assert.rejects(legacy.load, /literal atomic witness edge missing/u); batchChecks++
  legacy.registry.batches[0].legacyContinuations = [continuation, structuredClone(continuation)]; legacy.save()
  await assert.rejects(legacy.load, /duplicate or already continued/u); batchChecks++

  // Historical cluster-descendant positions retain their complete source coverage after continuation.
  const coverageDoc = clusterTargetBaseline()
  coverageDoc.goals.push({ ...goal('hc', ['hr']), type: 'cluster', contains: ['ha', 'hb'] },
    goal('ha', ['hp', 'hr']), goal('hb', ['hr']), goal('hp', ['hr']), goal('hr'))
  const covered = batchFixture(coverageDoc, orderedBaseline(), { operation: { source: targetKey('hc'), prerequisite: targetKey('hr'),
    atomicWitnesses: [['ha', 'hr'].map(targetKey), ['hb', 'hr'].map(targetKey)] }, original: ['hr'], after: [] })
  covered.add([{ id: 'remove-ha-hr', step: { source: targetKey('ha'), prerequisite: targetKey('hr'), witness: ['ha', 'hp', 'hr'].map(targetKey) },
    endWitness: ['ha', 'hp', 'hr'].map(targetKey) }], () => { covered.get(targetKey('ha')).requires = ['hp'] },
  [{ witness: { kind: 'legacy-path', path: '/removals/1/atomicWitnesses/0' }, edgeIndex: 0, removalId: 'remove-ha-hr' }])
  assert.ok(await covered.load()); batchChecks++

  // A V5 leaf coverage duty can be continued by a verified new atomic cut, without altering the V5 prefix.
  const targetDoc = clusterTargetBaseline(); targetDoc.goals.find(goal => goal.id === 'p')!.requires = ['a']
  const target = batchFixture(targetDoc)
  target.add([{ id: 'remove-z-a', step: { source: targetKey('z'), prerequisite: targetKey('a'), witness: ['z', 'p', 'a'].map(targetKey) },
    endWitness: ['z', 'p', 'a'].map(targetKey) }], () => { target.get(targetKey('z')).requires = ['p', 'b'] },
  [{ witness: { kind: 'legacy-cluster-target', leaf: targetKey('a') }, edgeIndex: 0, removalId: 'remove-z-a' }])
  assert.ok(await target.load()); batchChecks++

  // V5 grouping can run repeatedly and retain an existing direct target leaf, with a true absent-field snapshot too.
  const absentDoc = clusterTargetBaseline()
  absentDoc.goals.push({ ...goal('d', ['p']), type: 'cluster', contains: ['n'] }, goal('n'))
  delete (absentDoc.goals.find(goal => goal.id === 'n') as Partial<Goal>).requires
  const absent = batchFixture(absentDoc)
  absent.add([{ id: 'add-n-p', step: { operation: 'materialize-atomic', source: targetKey('n'), prerequisite: targetKey('p'),
    origin: { source: targetKey('d'), prerequisite: 'p', sourceContainsPath: ['d', 'n'].map(targetKey), prerequisiteContainsPath: [targetKey('p')] } },
  endWitness: ['n', 'p'].map(targetKey) }], () => { absent.get(targetKey('n')).requires = ['p'] })
  assert.equal(absent.registry.batches[0].originalRequires[0].requires, null)
  const absentContext = await absent.load(); assert.ok(absentContext)
  assert.equal(Object.hasOwn(reviewBindingGoal(absentContext, targetKey('n'), absent.get(targetKey('n'))), 'requires'), false); batchChecks++
  const retainedDoc = clusterTargetBaseline()
  retainedDoc.goals.push({ ...goal('d'), type: 'cluster', contains: ['da', 'db'] }, goal('da'), goal('db'), goal('o', ['d', 'da']))
  const retained = batchFixture(retainedDoc)
  retained.add([{ id: 'normalize-o-d', steps: [{ operation: 'materialize-atomic', source: targetKey('o'), prerequisite: targetKey('db'),
    origin: { source: targetKey('o'), prerequisite: 'd', sourceContainsPath: [targetKey('o')], prerequisiteContainsPath: ['d', 'db'].map(targetKey) } },
  { operation: 'remove-cluster-target', source: targetKey('o'), prerequisite: targetKey('d') }],
  endAtomicWitnesses: [['o', 'da'].map(targetKey), ['o', 'db'].map(targetKey)] }],
  () => { retained.get(targetKey('o')).requires = ['da', 'db'] })
  assert.ok(await retained.load()); batchChecks++

  await rejectBatch(f => { f.registry.v5Checkpoint.registryDigest = digest({ tampered: true }) }, /historical V5 registry digest/u)
  await rejectBatch(f => { f.registry.batches[0].previousDigest = digest({ different: true }) }, /predecessor digest/u)
  await rejectBatch(f => { f.registry.batches[0].originalRequires = [] }, /empty batch original/u)
  await rejectBatch(f => { f.registry.batches[0].originalRequires.push({ source: targetKey('v'), requires: ['w'] }) }, /extra, duplicate, or unknown batch original/u)
  await rejectBatch(f => { f.registry.batches[0].originalRequires[0].requires = null }, /batch .*start document digest/u)
  await rejectBatch(f => { f.registry.batches[0].currentDocumentDigests.pop() }, /paths missing, extra, or duplicated/u)
  await rejectBatch(f => { f.registry.batches[0].currentDocumentDigests.push(structuredClone(f.registry.batches[0].currentDocumentDigests[0])) }, /paths missing, extra, or duplicated/u)
  await rejectBatch(f => { f.registry.batches[0].operations[0].id = f.registry.batches[0].id }, /duplicate V6 identifier/u)
  await rejectBatch(f => { const op = f.registry.batches[0].operations[0]; assert.ok('step' in op); op.step = { source: targetKey('u'), prerequisite: targetKey('w'), witness: ['u', 'w'].map(targetKey) } }, /invalid removal/u)
  await rejectBatch(f => { const op = f.registry.batches[0].operations[0]; assert.ok('endWitness' in op); op.endWitness = ['u', 'w'].map(targetKey) }, /invalid atomic removal end witness/u)
  await rejectBatch(f => { const op = f.registry.batches[0].operations[0]; assert.ok('endWitness' in op); op.endWitness = ['u', 'missing', 'w'].map(targetKey) }, /structural canonical leaf/u)
  await rejectBatch(f => { (f.registry.batches[0] as unknown as Record<string, unknown>).unchecked = true }, /invalid batch fields/u)
  await rejectBatch(f => { f.registry.batches[0].legacyContinuations.push({ witness: { kind: 'legacy-path', path: '/untrusted/witness' }, edgeIndex: 0, removalId: 'cut-u-w' }) }, /unsupported legacy witness path/u)
  await rejectBatch(f => { f.registry.batches[0].legacyContinuations.push({ witness: { kind: 'legacy-path', path: '/removals/0/witness' }, edgeIndex: 0, removalId: 'cut-u-w' }) }, /endpoints differ/u)
  await rejectBatch(f => { f.registry.batches[0].legacyContinuations.push({ witness: { kind: 'legacy-path', path: '/removals/0/witness' }, edgeIndex: 0, removalId: 'unknown-removal' }) }, /non-atomic continuation reference/u)
  await rejectBatch(f => { f.registry.batches[0].legacyContinuations.push({ witness: { kind: 'batch-path', operationId: 'cut-u-w' }, edgeIndex: 0, removalId: 'cut-u-w' }) }, /current-batch/u)
  await rejectBatch(f => { f.get(targetKey('u')).title = 'undeclared'; f.registry.batches[0].currentDocumentDigests = f.registry.catalogSources.map(source => ({ path: source.path,
    currentDocumentDigest: digest(f.documents.find(doc => doc.landscapeId === source.landscapeId)!) })) }, /batch .*start document digest/u)
  console.log(`V6 synthetic fixture checks passed: ${batchChecks}`)
}
async function runBatchRequiredNegativeRegressions() {
  const unusedDocument = clusterTargetBaseline()
  unusedDocument.goals.find(goal => goal.id === 'p')!.type = 'cluster'
  unusedDocument.goals.find(goal => goal.id === 'p')!.contains = ['a']
  unusedDocument.goals.find(goal => goal.id === 'b')!.requires = ['a']
  const unused = batchFixture(unusedDocument)
  unused.add([
    { id: 'cut-z-a', step: { source: targetKey('z'), prerequisite: targetKey('a'), witness: ['z', 'b', 'a'].map(targetKey) },
      endWitness: ['z', 'b', 'a'].map(targetKey) },
    { id: 'restore-z-a-from-p', step: { operation: 'materialize-atomic', source: targetKey('z'), prerequisite: targetKey('a'),
      origin: { source: targetKey('z'), prerequisite: 'p', sourceContainsPath: [targetKey('z')], prerequisiteContainsPath: ['p', 'a'].map(targetKey) } },
    endWitness: ['z', 'a'].map(targetKey) },
  ], () => { unused.get(targetKey('z')).requires = ['p', 'b', 'a'] },
  [{ witness: { kind: 'legacy-cluster-target', leaf: targetKey('a') }, edgeIndex: 0, removalId: 'cut-z-a' }])
  await assert.rejects(unused.load, /unused continuation for a surviving literal edge/u)
  const appDocument = clusterTargetBaseline()
  appDocument.goals.push({ ...goal('u', ['v', 'w']), tags: ['Assessment'], extendedData: { applicabilityFromRequires: true } },
    { ...goal('v', ['w']), tags: ['memorization'], extendedData: { applicabilityOverrides: { jurisdiction: ['DE-HE'] } } },
    { ...goal('w'), extendedData: { applicabilityOverrides: { jurisdiction: ['DE-BY'] } } })
  const app = batchFixture(appDocument)
  app.add([{ id: 'app-cut', step: { source: targetKey('u'), prerequisite: targetKey('w'), witness: ['u', 'v', 'w'].map(targetKey) },
    endWitness: ['u', 'v', 'w'].map(targetKey) }], () => { app.get(targetKey('u')).requires = ['v'] })
  await assert.rejects(app.load, /compiled applicability changed after batches/u)
  // A valid, coincidentally equal predicate still is an undeclared raw-field
  // change under V6. Keep every historical original/checkpoint immutable.
  const equalDocument = clusterTargetBaseline()
  equalDocument.goals.push({ ...goal('u', ['v', 'w']), tags: ['Assessment'],
    extendedData: { applicabilityFromRequires: true } },
  { ...goal('v', ['w']), extendedData: { applicabilityOverrides: { jurisdiction: ['DE-HE'] } } },
  { ...goal('w'), extendedData: { applicabilityOverrides: { jurisdiction: ['DE-HE'] } } })
  const undeclaredBasis = batchFixture(equalDocument)
  undeclaredBasis.add([{ id: 'equal-cut', step: { source: targetKey('u'), prerequisite: targetKey('w'),
    witness: ['u', 'v', 'w'].map(targetKey) }, endWitness: ['u', 'v', 'w'].map(targetKey) }],
  () => { undeclaredBasis.get(targetKey('u')).requires = ['v'] })
  assert.ok(await undeclaredBasis.load())
  const { buildApplicabilityCompilation } = await import('./applicabilityCompiler')
  const compiled = () => buildApplicabilityCompilation(undeclaredBasis.documents.map(landscape => ({
    file: resolve(undeclaredBasis.directory, `${landscape.landscapeId}.json`),
    landscape: landscape as unknown as import('../src/landscapeTypes').SkillLandscape,
  }))).reports.flatMap(report => report.goals.map(goal => ({
    key: `${report.landscapeId}:${goal.goalId}`, value: goal.compiledApplicability,
  })))
  const beforeBasis = compiled()
  undeclaredBasis.get(targetKey('u')).extendedData = {
    applicabilityFromRequires: true,
    assessmentApplicabilityBasis: { kind: 'allOfGoalApplicability', goalRefs: ['v', 'w'] },
  }
  assert.deepEqual(compiled(), beforeBasis, 'coincidentally equal applicability cannot authorize a new raw field')
  undeclaredBasis.save()
  await assert.rejects(undeclaredBasis.load, /final batch document digest differs/u)
  console.log('V6 required extra negative fixture checks passed: 3')
}

function earliestBatchTestOriginals(registry: BatchedPrerequisiteReductionRegistry) {
  const originals = new Map<string, { source: string; requires: string[] | null }>()
  for (const original of [...registry.originalRequires, ...registry.suffixOriginalRequires,
    ...registry.tailOriginalRequires, ...registry.clusterTargetOriginalRequires,
    ...registry.batches.flatMap(batch => batch.originalRequires)]) {
    if (!originals.has(original.source)) originals.set(original.source, structuredClone(original))
  }
  return originals
}

// A learning unit is an orthogonal placement layer: the proof fingerprints each catalog
// document without it, so the layer never stales a proof, and everything else still does.
type Layered = Document & Record<string, unknown> & { programUnits: Record<string, unknown>[]; goalPlacements: Record<string, unknown>[] }
const layeredBaseline = (): Document => ({ ...baseline(), description: 'Placement fixture',
  programUnits: [{ id: 'program', kind: 'program', label: 'Program' },
    { id: 'stage', kind: 'stage', label: 'Stage', parentUnitId: 'program' }],
  goalPlacements: [{ goalId: 'q', unitId: 'stage', relation: 'primary', context: { stage: 'SekI' } },
    { goalId: 'p', unitId: 'stage', relation: 'secondary' }, { goalId: 'r', unitId: 'program', relation: 'assessed' }],
} as Document)
const learningUnit = (id: string, extra: Record<string, unknown> = {}) => ({ id, kind: 'learningUnit', label: `Unit ${id}`,
  labelEn: `Unit ${id}`, promise: 'Ich kann es.', promiseEn: 'I can do it.', revision: '2026-11-12-v1', ...extra })
function addLearningUnitLayer(document: Document, unit = learningUnit('unit'), own: Record<string, unknown> = {}) {
  const layered = document as Layered
  layered.programUnits.push(unit)
  layered.goalPlacements.push({ goalId: 'q', unitId: unit.id, relation: 'own', ...own }, { goalId: 'p', unitId: unit.id, relation: 'own' })
  layered.learningUnitCoverage = 'partial'
}
async function runLearningUnitLayerRegressions() {
  const layeredFixture = () => { const f = fixture(layeredBaseline()); addLearningUnitLayer(f.current); f.save(); return f }
  assert.ok(await layeredFixture().load(), 'a learning-unit layer on a proven document keeps the proof valid')
  const accept = async (mutate: (document: Layered) => void, label: string) => {
    const f = layeredFixture(); mutate(f.current as Layered); f.save()
    assert.ok(await f.load(), label)
  }
  await accept(document => { document.programUnits.at(-1)!.promise = 'Ich kann mehr.' }, 'a unit edit keeps the proof')
  await accept(document => { document.programUnits.at(-1)!.revision = '2026-11-13-v2' }, 'a unit revision keeps the proof')
  await accept(document => { document.goalPlacements = document.goalPlacements.filter(item => item.goalId !== 'p' || item.relation !== 'own') },
    'an ownership change keeps the proof')
  await accept(document => { document.programUnits.push(learningUnit('second')); document.learningUnitCoverage = 'complete' },
    'another unit and a coverage claim keep the proof')
  const reject = async (mutate: (document: Layered) => void, label: string) => {
    const f = layeredFixture(); mutate(f.current as Layered); f.save()
    await assert.rejects(f.load, /current document digest differs/u, label)
  }
  await reject(document => { document.goals[2].title = 'Changed goal' }, 'a goal object change stays visible')
  await reject(document => { document.goals[1].requires = [] }, 'a requires change stays visible')
  await reject(document => { document.goals[2].contains = ['x'] }, 'a contains change stays visible')
  await reject(document => { document.programUnits[1].label = 'Renamed stage' }, 'a calendar unit change stays visible')
  await reject(document => { document.programUnits.splice(1, 1) }, 'a removed calendar unit stays visible')
  await reject(document => { (document.goalPlacements[0].context as Record<string, string>).stage = 'SekII' },
    'a primary placement change stays visible')
  await reject(document => { document.goalPlacements.splice(1, 1) }, 'a removed secondary placement stays visible')
  await reject(document => { document.goalPlacements[2].unitId = 'stage' }, 'an assessed placement change stays visible')
  await reject(document => { document.title = 'Renamed landscape' }, 'another top-level field change stays visible')
  await reject(document => { document.extra = true }, 'a new top-level field stays visible')
  // Content placed inside the layer cannot hide a goal change: the projection drops a
  // learning-unit entry or an own placement as a whole and never touches a goal.
  const hidden = { goals: [{ ...goal('r'), title: 'Changed goal' }], requires: ['proof-test:q'] }
  await reject(document => { document.programUnits.push(learningUnit('hiding', hidden)); document.goals[2].title = 'Changed goal' },
    'an undefined field on a learning unit does not hide a goal change')
  await reject(document => { document.goalPlacements.push({ goalId: 'r', unitId: 'unit', relation: 'own', ...hidden })
    document.goals[2].title = 'Changed goal' }, 'an undefined field on an own placement does not hide a goal change')
  // The undefined field itself is invisible to the proof; the unit validator rejects it.
  const strayField = layeredFixture(); (strayField.current as Layered).programUnits.push(learningUnit('hiding', hidden)); strayField.save()
  assert.ok(await strayField.load(), 'the proof ignores the learning-unit layer, including its undefined fields')
  const { deriveLearningUnits } = await import('./lib/learningUnitContracts')
  const findings = deriveLearningUnits([strayField.current as never]).findings.map(finding => `${finding.code} ${finding.message}`)
  assert.ok(findings.some(finding => /^LU-UNIT .*field goals is not part of the contract/u.test(finding)), findings.join('\n'))
  await assert.rejects(async () => {
    const f = layeredFixture(); (f.current as Layered).programUnits.push({ id: 'year', kind: 'year', label: 'Year', parentUnitId: 'unit' }); f.save()
    await f.load()
  }, /learning-unit parent/u, 'an unprojectable layer fails closed')

  // The same through the complete V8 chain (V8 -> V7 -> V6 -> V5 checkpoint).
  const basis = basisBoundFixture()
  const layerAll = (f: ReturnType<typeof basisBoundFixture>) => {
    for (const source of f.registry.catalogSources) {
      const document = f.documents.find(entry => entry.landscapeId === source.landscapeId)! as Document & Record<string, unknown>
      assert.ok(!Object.hasOwn(document, 'programUnits') && !Object.hasOwn(document, 'goalPlacements'))
      document.programUnits = [learningUnit('unit')]
      document.goalPlacements = [{ goalId: document.goals[0].id, unitId: 'unit', relation: 'own' }]
      document.learningUnitCoverage = 'partial'
      writeFileSync(resolve(f.directory, source.path), JSON.stringify(document))
    }
  }
  const unlayered = await basis.load()
  assert.ok(unlayered)
  layerAll(basis)
  const layered = await basis.load()
  assert.ok(layered, 'a learning-unit layer keeps the complete V8 chain valid without any registry change')
  assert.deepEqual(verifiedPrerequisiteReductionSummary(layered), verifiedPrerequisiteReductionSummary(unlayered))
  const drift = basisBoundFixture(); layerAll(drift)
  drift.documents[0].goals[0].title = 'undeclared drift'
  const driftSource = drift.registry.catalogSources.find(source => source.landscapeId === drift.documents[0].landscapeId)!
  writeFileSync(resolve(drift.directory, driftSource.path), JSON.stringify(drift.documents[0]))
  await assert.rejects(drift.load, /current document digest differs/u, 'a goal change beside the layer stays visible in V8')
  // Rebinding every current and final-entry digest by hand is still rejected with the layer present.
  const rebound = basisBoundFixture(); layerAll(rebound)
  rebound.documents[0].goals[0].title = 'undeclared drift'
  rebound.save()
  await assert.rejects(rebound.load, /differ/u, 'a rebound V8 end digest cannot certify an undeclared goal change')
  console.log('Learning-unit layer regressions passed: 4 layer edits accepted, 13 non-layer changes rejected, V8 chain valid with layers, rebinding rejected.')
}

// The proof is frozen: the active registry is the goal-scoped V9 registry, and the complete V8
// proof survives only as its byte-bound parent, which is never replayed here. A transfer binds a
// single goal, so every assertion below holds for any later catalog: a new goal or document has
// no transfer, a changed or removed goal releases only its own transfer, and a learning unit
// changes no goal object.
async function verifyActualFrozenRegistry() {
  const registryBytes = readFileSync(resolve(root, PREREQUISITE_REDUCTION_REGISTRY_PATH))
  const frozen = JSON.parse(registryBytes.toString('utf8')) as GoalScopedPrerequisiteReductionRegistry
  assert.equal(frozen.proofContract, GOAL_SCOPED_PREREQUISITE_REDUCTION_CONTRACT,
    'the prerequisite-reduction proof is frozen: the active registry is the goal-scoped V9 registry')
  // The frozen registry is immutable evidence: once the catalog has moved on, nothing can
  // derive it again, so its exact bytes are pinned here.
  assert.equal(rawDigest(registryBytes), 'sha256:a48b52ca0449ff75dce93e93a3ade8982210d32a03f9a585a03b935ebed052b7',
    'the registry frozen on 12 November 2026 is unchanged')
  assert.equal(frozen.transfers.length, 1361, 'the frozen registry records 1361 transfers')
  const parentBytes = readFileSync(resolve(root, frozen.parentRegistryPath))
  assert.equal(rawDigest(parentBytes), frozen.parentRegistryRawDigest, 'the frozen parent keeps its bound raw bytes')
  assert.equal((JSON.parse(parentBytes.toString('utf8')) as { proofContract?: unknown }).proofContract,
    BASIS_BOUND_PREREQUISITE_REDUCTION_CONTRACT, 'the frozen parent is the complete V8 proof')

  const context = await loadVerifiedPrerequisiteReductionContext({ repositoryRoot: root })
  assert.ok(context, 'the active frozen registry loads')
  const summary = verifiedPrerequisiteReductionSummary(context)!
  assert.equal(summary.proofContract, GOAL_SCOPED_PREREQUISITE_REDUCTION_CONTRACT, 'the active live registry is the frozen goal-scoped registry')
  assert.equal(summary.registryDigest, rawDigest(registryBytes), 'the context verified the pinned registry bytes')
  const documents = catalogDocuments(resolve(root, 'curricula/DE/Gymnasium/canonical')), goals = goalsOf(documents)
  // A transfer is active while its goal still is the frozen goal; any other transfer is released.
  const active = new Map(frozen.transfers.filter(({ source, frozenGoalDigest }) => {
    const goal = goals.get(source)
    return goal !== undefined && fingerprintPrerequisiteReductionRecord(goal) === frozenGoalDigest
  }).map(transfer => [transfer.source, transfer]))
  assert.deepEqual(summary.affectedGoalIds, [...active.keys()].sort(), 'exactly the transfers whose goal is unchanged since the freeze are active')
  for (const [source, goal] of goals) {
    const reviewed = reviewBindingGoal(context, source, goal), transfer = active.get(source)
    if (!transfer) {
      assert.deepEqual(reviewed, goal, `a goal without an active transfer is reviewed with its current value: ${source}`)
      continue
    }
    const expected: Record<string, unknown> = { ...structuredClone(goal), ...structuredClone(transfer.reviewedFields) }
    for (const field of transfer.reviewedAbsentFields) delete expected[field]
    assert.deepEqual(reviewed, expected, `an active transfer changes exactly its reviewed fields: ${source}`)
    assert.equal(fingerprintPrerequisiteReductionRecord(reviewed), transfer.reviewedGoalDigest, `the reviewed value has the reviewed goal digest: ${source}`)
    assert.notDeepStrictEqual(reviewed, goal, `the reviewed value differs from the current goal: ${source}`)
    // Reviewed values are earliest baselines; the complete proof binds an assessment
    // applicability basis only in its V8 entries, after its basis-free V7 prefix.
    assert.equal(Object.hasOwn((reviewed.extendedData as Record<string, unknown> | undefined) ?? {}, 'assessmentApplicabilityBasis'), false,
      `the reviewed value is basis-free: ${source}`)
  }
  const released = frozen.transfers.length - active.size
  console.log(`Frozen goal-scoped registry: ${active.size} of ${frozen.transfers.length} transfers active, ${released} released; ${goals.size} goals in ${documents.length} documents checked.`)
}

try {
  const basisOnly = process.argv.slice(2)
  assert.ok(basisOnly.length === 0 || basisOnly.length === 1 && basisOnly[0] === '--basis-bound-fixtures-only', 'unknown proof test selector')
  await runBasisBoundFixtureRegressions()
  await runGoalScopedFixtureRegressions()
  await runLearningUnitLayerRegressions()
  if (basisOnly.length === 0) {
  await runApplicabilityRefreshFixtureRegressions()
  await runBatchFixtureRegressions()
  await runBatchRequiredNegativeRegressions()
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

  await verifyActualFrozenRegistry()
  }
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true })
}
