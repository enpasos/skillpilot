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
  BATCHED_PREREQUISITE_REDUCTION_CONTRACT,
  APPLICABILITY_REFRESH_PREREQUISITE_REDUCTION_CONTRACT,
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
function applicabilityRefreshFixture(present = true, empty = false) {
  const document = clusterTargetBaseline()
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

type BatchTestDocument = { path: string; document: Document }
const batchTestSources = (batch: PrerequisiteReductionBatch) => [...new Set(batch.operations.flatMap(operation =>
  'steps' in operation ? operation.steps.map(step => step.source) : [operation.step.source]))].sort()
function batchTestGoals(documents: BatchTestDocument[]) {
  const result = new Map<string, Goal>(documents.flatMap(({ document }) => document.goals.map(goal =>
    [`${document.landscapeId}:${goal.id}`, goal] as const)))
  assert.equal(result.size, documents.reduce((sum, { document }) => sum + document.goals.length, 0), 'unique canonical goals')
  return result
}
function assertBatchTestDocuments(
  documents: BatchTestDocument[], registry: Pick<BatchedPrerequisiteReductionRegistry, 'catalogSources'>,
  bindings: Array<{ path: string; currentDocumentDigest: string }>, label: string,
) {
  assert.equal(new Set(bindings.map(entry => entry.path)).size, bindings.length, `${label}: unique document bindings`)
  assert.deepEqual(bindings.map(entry => entry.path).sort(), registry.catalogSources.map(entry => entry.path).sort(),
    `${label}: complete document bindings`)
  assert.deepEqual(documents.map(entry => entry.path).sort(), bindings.map(entry => entry.path).sort(), `${label}: actual catalog paths`)
  for (const { path, document } of documents) {
    assert.equal(document.landscapeId, registry.catalogSources.find(entry => entry.path === path)!.landscapeId, `${label}: actual owner`)
    assert.equal(digest(document), bindings.find(entry => entry.path === path)!.currentDocumentDigest, `${label}: full document ${path}`)
  }
}
function restoreBoundV5TestCheckpoint(registry: BatchedPrerequisiteReductionRegistry, current: BatchTestDocument[]) {
  assert.equal(registry.proofContract, BATCHED_PREREQUISITE_REDUCTION_CONTRACT)
  assert.ok(registry.batches.length > 0)
  assertBatchTestDocuments(current, registry, registry.catalogSources, 'current')
  const { v5Checkpoint, batches, ...prefix } = structuredClone(registry)
  assert.equal(new Set(v5Checkpoint.currentDocumentDigests.map(entry => entry.path)).size,
    v5Checkpoint.currentDocumentDigests.length, 'unique V5 checkpoint document bindings')
  assert.deepEqual(v5Checkpoint.currentDocumentDigests.map(entry => entry.path).sort(),
    registry.catalogSources.map(entry => entry.path).sort(), 'complete V5 checkpoint document bindings')
  const parent: ClusterTargetPrerequisiteReductionRegistry = { ...prefix,
    proofContract: CLUSTER_TARGET_PREREQUISITE_REDUCTION_CONTRACT,
    catalogSources: prefix.catalogSources.map(entry => ({ ...entry,
      currentDocumentDigest: v5Checkpoint.currentDocumentDigests.find(binding => binding.path === entry.path)!.currentDocumentDigest })) }
  assert.equal(digest(parent), v5Checkpoint.registryDigest, 'complete unchanged V5 registry checkpoint')
  let predecessor = v5Checkpoint.registryDigest
  for (const batch of batches) {
    assert.equal(batch.previousDigest, predecessor, 'append-only batch predecessor')
    assert.deepEqual(batch.originalRequires.map(entry => entry.source).sort(), batchTestSources(batch), 'exact batch original source set')
    predecessor = digest(batch)
  }
  const documents = structuredClone(current), goals = batchTestGoals(documents)
  for (let index = batches.length - 1; index >= 0; index--) {
    const batch = batches[index]
    assertBatchTestDocuments(documents, registry, batch.currentDocumentDigests, `reverse ${batch.id} end`)
    for (const snapshot of batch.originalRequires) {
      const goal = goals.get(snapshot.source)
      assert.ok(goal, `known batch original ${snapshot.source}`)
      if (snapshot.requires === null) delete (goal as Partial<Goal>).requires
      else goal.requires = structuredClone(snapshot.requires)
    }
    assertBatchTestDocuments(documents, registry, index ? batches[index - 1].currentDocumentDigests
      : v5Checkpoint.currentDocumentDigests, `reverse ${batch.id} start`)
  }
  return { parent, documents }
}
function replayBatchTestArrays(registry: BatchedPrerequisiteReductionRegistry, checkpoint: BatchTestDocument[]) {
  // Only literal raw-array effects are repeated here. The genuine loader alone
  // establishes scope, fresh auditor findings, paths, continuations and applicability.
  const documents = structuredClone(checkpoint), goals = batchTestGoals(documents)
  const reference = (raw: string, source: string) => {
    const owner = source.split(':')[0]
    if (raw.includes(':')) {
      const [landscape, id] = raw.split(':')
      return `${landscape || owner}:${id}`
    }
    if (goals.has(`${owner}:${raw}`)) return `${owner}:${raw}`
    const matches = [...goals.keys()].filter(key => key.split(':')[1] === raw)
    assert.equal(matches.length, 1, `unambiguous literal test reference ${raw}`)
    return matches[0]
  }
  for (const batch of registry.batches) {
    for (const snapshot of batch.originalRequires) {
      const goal = goals.get(snapshot.source)!
      assert.equal(Object.hasOwn(goal, 'requires'), snapshot.requires !== null, 'forward exact requires presence')
      if (snapshot.requires !== null) assert.deepEqual(goal.requires, snapshot.requires, 'forward exact original array')
    }
    for (const operation of batch.operations) for (const step of 'steps' in operation ? operation.steps : [operation.step]) {
      const goal = goals.get(step.source)!, before = goal.requires ?? []
      const matches = before.filter(raw => reference(raw, step.source) === step.prerequisite)
      if ('operation' in step && step.operation === 'materialize-atomic') {
        assert.equal(matches.length, 0, 'new direct raw edge')
        const [owner, id] = step.prerequisite.split(':')
        goal.requires = [...before, owner === step.source.split(':')[0] ? id : step.prerequisite]
      } else {
        assert.equal(matches.length, 1, 'one actual authored raw edge removed')
        goal.requires = before.filter(raw => reference(raw, step.source) !== step.prerequisite)
      }
    }
    assertBatchTestDocuments(documents, registry, batch.currentDocumentDigests, `forward ${batch.id} end`)
  }
  return documents
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
function runBatchLiveHelperRegressions() {
  const document = clusterTargetBaseline()
  document.goals.push(goal('u', ['v', 'w', 'x']), goal('v', ['w', 'x']), goal('w', ['x']), goal('x'))
  const f = batchFixture(document)
  f.add([{ id: 'cut-u-w', step: { source: targetKey('u'), prerequisite: targetKey('w'),
    witness: ['u', 'v', 'w'].map(targetKey) }, endWitness: ['u', 'v', 'w'].map(targetKey) }],
  () => { f.get(targetKey('u')).requires = ['v', 'x'] })
  f.add([{ id: 'cut-u-x', step: { source: targetKey('u'), prerequisite: targetKey('x'),
    witness: ['u', 'v', 'x'].map(targetKey) }, endWitness: ['u', 'v', 'x'].map(targetKey) }],
  () => { f.get(targetKey('u')).requires = ['v'] })
  const current = f.registry.catalogSources.map(source => ({ path: source.path,
    document: f.documents.find(document => document.landscapeId === source.landscapeId)! }))
  const restored = restoreBoundV5TestCheckpoint(f.registry, current)
  assert.deepEqual(restored.parent, f.parent)
  assert.deepEqual(replayBatchTestArrays(f.registry, restored.documents), current)
  assert.deepEqual(earliestBatchTestOriginals(f.registry).get(targetKey('u'))!.requires, ['v', 'w', 'x'])
  const reject = (mutate: (registry: BatchedPrerequisiteReductionRegistry, documents: BatchTestDocument[]) => void, expected: RegExp) => {
    const registry = structuredClone(f.registry), documents = structuredClone(current)
    mutate(registry, documents)
    assert.throws(() => restoreBoundV5TestCheckpoint(registry, documents), expected)
  }
  reject(registry => { registry.batches[0].originalRequires[0].requires = null
    registry.batches[1].previousDigest = digest(registry.batches[0]) }, /reverse .* start/u)
  reject(registry => { registry.batches[0].originalRequires = [] }, /exact batch original source set/u)
  reject(registry => { registry.batches[0].originalRequires.push(structuredClone(registry.batches[0].originalRequires[0])) }, /exact batch original source set/u)
  reject(registry => { registry.v5Checkpoint.registryDigest = digest({ bad: true }) }, /complete unchanged V5/u)
  reject(registry => { registry.batches[0].currentDocumentDigests[0].currentDocumentDigest = digest({ bad: true })
    registry.batches[1].previousDigest = digest(registry.batches[0]) }, /reverse .* start/u)
  reject((_registry, documents) => { documents[0].document.title = 'Unreported content drift' }, /current: full document/u)
  const absentDocument = clusterTargetBaseline()
  absentDocument.goals.push({ ...goal('d', ['p']), type: 'cluster', contains: ['n'] }, goal('n'))
  delete (absentDocument.goals.find(goal => goal.id === 'n')! as Partial<Goal>).requires
  const absent = batchFixture(absentDocument)
  absent.add([{ id: 'add-n-p', step: { operation: 'materialize-atomic', source: targetKey('n'), prerequisite: targetKey('p'),
    origin: { source: targetKey('d'), prerequisite: 'p', sourceContainsPath: ['d', 'n'].map(targetKey), prerequisiteContainsPath: [targetKey('p')] } },
  endWitness: ['n', 'p'].map(targetKey) }], () => { absent.get(targetKey('n')).requires = ['p'] })
  const absentCurrent = absent.registry.catalogSources.map(binding => ({ path: binding.path,
    document: absent.documents.find(document => document.landscapeId === binding.landscapeId)! }))
  const absentRestored = restoreBoundV5TestCheckpoint(absent.registry, absentCurrent)
  assert.equal(Object.hasOwn(batchTestGoals(absentRestored.documents).get(targetKey('n'))!, 'requires'), false)
  assert.deepEqual(replayBatchTestArrays(absent.registry, absentRestored.documents), absentCurrent)
  const falseEmpty = structuredClone(absent.registry)
  falseEmpty.batches[0].originalRequires[0].requires = []
  assert.throws(() => restoreBoundV5TestCheckpoint(falseEmpty, absentCurrent), /reverse .* start/u)
  console.log('V6 live-frame helper checks passed: 9 (raw replay and binding only; no live catalog call)')
}

async function verifyHistoricalLiveV5Checkpoint(root: string) {
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
  const liveContext = await loadVerifiedPrerequisiteReductionContext({ repositoryRoot: root })
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
  const germanSource = '67bd301b-e11a-582d-94ba-4f4b1a4cefff:2fb368b0-7b9d-5df0-99b6-6d719fd47f95'
  const germanCluster = '67bd301b-e11a-582d-94ba-4f4b1a4cefff:53462f11-c368-51df-bb68-c36a83d761b1'
  assert.equal(v4Checkpoint.currentDocumentDigests.length, 21)
  assert.deepEqual(clusterTargetOriginalRequires, [{ source: germanSource,
    requires: ['53462f11-c368-51df-bb68-c36a83d761b1', 'bb3dee7b-d6d3-513b-8824-bdf6414e02df'] }])
  assert.ok(!allOriginals.some(entry => entry.source === germanSource), 'the new source is outside the 719-source prefix')
  assert.equal(clusterTargetSuffix.length, 11)
  assert.equal(clusterTargetSuffix.filter(step => step.operation === 'materialize-atomic').length, 10)
  assert.deepEqual(clusterTargetSuffix.at(-1), { operation: 'remove-cluster-target', source: germanSource, prerequisite: germanCluster })
  const germanAdds = clusterTargetSuffix.slice(0, -1) as AtomicPrerequisiteMaterialization[]
  assert.equal(new Set(germanAdds.map(step => step.prerequisite)).size, 10)
  for (const step of germanAdds) {
    assert.equal(step.source, germanSource)
    assert.equal(step.origin.source, germanSource)
    assert.equal(step.origin.prerequisite, '53462f11-c368-51df-bb68-c36a83d761b1')
    assert.deepEqual(step.origin.sourceContainsPath, [germanSource])
    assert.equal(step.origin.prerequisiteContainsPath[0], germanCluster)
    assert.equal(step.origin.prerequisiteContainsPath.at(-1), step.prerequisite)
  }
  assert.deepEqual(liveGoals.get(germanSource)!.requires,
    ['bb3dee7b-d6d3-513b-8824-bdf6414e02df', ...germanAdds.map(step => step.prerequisite.split(':')[1])])
  assert.ok([...liveGoals.values()].every(goal => !(goal.requires ?? []).some(raw => raw.split(':').at(-1) === germanSource.split(':')[1])),
    'the single new source has no incoming requires anywhere in the actual catalog')
  allOriginals.push(...clusterTargetOriginalRequires)
  assert.equal(new Set(allOriginals.map(entry => entry.source)).size, 720)
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
  for (const file of files(catalog)) {
    const document = JSON.parse(readFileSync(file, 'utf8')) as Document
    document.goals = document.goals.map(goal => structuredClone(reviewBindingGoal(liveContext, `${document.landscapeId}:${goal.id}`, goal)))
    const binding = liveRegistry.catalogSources.find(entry => entry.path === relative(root, file))!
    assert.equal(digest(document), binding.baselineDocumentDigest, `all original document fields restored exactly: ${file}`)
  }
  console.log(`Prerequisite reduction proof: strict negatives, bound V4 parent, ${liveRegistry.removals.length} historical operations, ${liveOrdered.suffix.length} V3 steps, ${liveContinued.atomicRemovals.length} atomic cuts, ${clusterTargetSuffix.length} cluster-target steps and ${allOriginals.length} snapshots passed.`)
}

async function verifyActualLiveV6(
  registry: BatchedPrerequisiteReductionRegistry, currentDocuments: BatchTestDocument[],
  checkpoint: ReturnType<typeof restoreBoundV5TestCheckpoint>, repositoryRoot = root,
) {
  // The checkpoint checks above remain V5 checks. This capability must be
  // obtained from the actual current registry and complete current catalog.
  const context = await loadVerifiedPrerequisiteReductionContext({ repositoryRoot })
  assert.ok(context)
  const summary = verifiedPrerequisiteReductionSummary(context)!
  assert.equal(summary.proofContract, BATCHED_PREREQUISITE_REDUCTION_CONTRACT)
  assert.equal(summary.registryDigest, `sha256:${createHash('sha256')
    .update(readFileSync(resolve(repositoryRoot, PREREQUISITE_REDUCTION_REGISTRY_PATH))).digest('hex')}`)
  assert.equal(registry.catalogSources.length, 21)
  assert.equal(batchTestGoals(currentDocuments).size, 6524)
  assert.deepEqual(replayBatchTestArrays(registry, checkpoint.documents), currentDocuments,
    'every final document field and ordered array equals the complete batch replay')
  const prefix = new Set([...checkpoint.parent.originalRequires, ...checkpoint.parent.suffixOriginalRequires,
    ...checkpoint.parent.tailOriginalRequires, ...checkpoint.parent.clusterTargetOriginalRequires].map(entry => entry.source))
  assert.equal(prefix.size, 720, 'the original V5 affected-source count remains exact')
  assert.ok(registry.batches.length === 1 || registry.batches.length === 2, 'only the reviewed German or German-then-Physics delivery is accepted')
  const [batch, physics] = registry.batches
  assert.equal(digest(batch), 'sha256:c21e1fcd260dc83fec0826388dabad3ae59432b1c94335a7d8257af7e3d6fe2e',
    'the entire first German batch, including all witnesses and bindings, remains exact')
  assert.equal(summary.registryDigest, physics
    ? 'sha256:dd38bd85793769d2afae6b34a3b0b89112c497ee1b17b54f92a61af5bf785c93'
    : 'sha256:ecaa33fc009f1b72f34edbfe8fbc67916e5e280026831333902038e1ecb0b109',
    'the complete V6 parent equals the approved German or Physics bytes')
  const sources = batchTestSources(batch)
  assert.equal(sources.length, 18)
  assert.deepEqual(sources.filter(source => prefix.has(source)),
    ['67bd301b-e11a-582d-94ba-4f4b1a4cefff:2fb368b0-7b9d-5df0-99b6-6d719fd47f95'])
  assert.equal(sources.filter(source => !prefix.has(source)).length, 17)
  assert.equal(batch.operations.filter(operation => 'steps' in operation).length, 45)
  assert.equal(batch.operations.filter(operation => 'step' in operation && !('operation' in operation.step)).length, 311)
  assert.equal(batch.operations.reduce((sum, operation) => sum + ('steps' in operation
    ? operation.steps.filter(step => step.operation === 'materialize-atomic').length
    : 'operation' in operation.step && operation.step.operation === 'materialize-atomic' ? 1 : 0), 0), 272)
  const afterGermanSources = new Set([...prefix, ...sources])
  assert.equal(afterGermanSources.size, 737, 'German batch 1 retains its exact 737-source union')
  const physicsSources = physics ? batchTestSources(physics) : []
  if (physics) {
    assert.equal(physics.id, 'ph-complete-atomic-prerequisites-and-transitive-reduction')
    assert.equal(physics.previousDigest, digest(batch), 'Physics is bound to the exact German end frame')
    assert.equal(physicsSources.length, 144)
    assert.ok(physicsSources.every(source => source.startsWith('7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a:')))
    assert.deepEqual(physicsSources.filter(source => afterGermanSources.has(source)), [],
      'all 144 Physics operation sources are new snapshots, independently of older witness obligations')
    assert.equal(physics.operations.length, 2843)
    const physicsStepCounts = { 'materialize-atomic': 0, 'remove-cluster-target': 0, 'remove-cluster': 0, atomic: 0 }
    for (const operation of physics.operations) for (const step of 'steps' in operation ? operation.steps : [operation.step]) {
      if ('operation' in step) physicsStepCounts[step.operation]++
      else physicsStepCounts.atomic++
    }
    assert.deepEqual(physicsStepCounts, { 'materialize-atomic': 1319, 'remove-cluster-target': 15, 'remove-cluster': 15, atomic: 1494 })
    assert.equal(physics.legacyContinuations.length, 17)
    assert.equal(physics.currentDocumentDigests.length, 21)
  }
  const expectedOriginals = new Set([...afterGermanSources, ...physicsSources])
  const originals = earliestBatchTestOriginals(registry)
  assert.equal(originals.size, physics ? 881 : 737)
  assert.deepEqual([...originals.keys()].sort(), [...expectedOriginals].sort(), 'the full source union is exact')
  if (physics) {
    const negativeDirectory = resolve(repositoryRoot, 'app/node_modules/.tmp/physics-live-negative-parents')
    mkdirSync(negativeDirectory, { recursive: true })
    try {
      const invalidPredecessor = structuredClone(registry)
      invalidPredecessor.batches[1].previousDigest = 'sha256:' + '0'.repeat(64)
      const invalidPredecessorPath = resolve(negativeDirectory, 'invalid-second-predecessor.json')
      writeFileSync(invalidPredecessorPath, JSON.stringify(invalidPredecessor))
      await assert.rejects(loadVerifiedPrerequisiteReductionContext({ repositoryRoot, registryPath: invalidPredecessorPath }),
        /batch predecessor digest differs/u, 'the genuine loader rejects the actual second-batch predecessor mutation')
      const missingContinuation = structuredClone(registry)
      missingContinuation.batches[1].legacyContinuations.shift()
      const missingContinuationPath = resolve(negativeDirectory, 'missing-prior-witness-continuation.json')
      writeFileSync(missingContinuationPath, JSON.stringify(missingContinuation))
      await assert.rejects(loadVerifiedPrerequisiteReductionContext({ repositoryRoot, registryPath: missingContinuationPath }),
        /literal atomic witness edge missing/u, 'removing one necessary actual prior witness-position continuation fails closed')
    } finally { rmSync(negativeDirectory, { recursive: true, force: true }) }
  }
  assert.deepEqual(summary.affectedGoalIds, [...originals.keys()].sort(), 'actual verified affected IDs equal the deduplicated source union')
  const currentGoals = batchTestGoals(currentDocuments)
  if (physics) {
    assert.equal(physicsSources.filter(source => !(currentGoals.get(source)!.contains?.length)).length, 139)
    assert.equal(physicsSources.filter(source => currentGoals.get(source)!.contains?.length).length, 5)
    assert.equal(physics.originalRequires.filter(original => {
      const raw = currentGoals.get(original.source)!
      return Object.hasOwn(raw, 'requires') !== (original.requires !== null)
        || JSON.stringify(raw.requires) !== JSON.stringify(original.requires === null ? undefined : original.requires)
    }).length, 140, 'all 144 operation snapshots remain required although only 140 arrays differ net')
  }
  for (const original of originals.values()) {
    const raw = currentGoals.get(original.source)!
    const restored = reviewBindingGoal(context, original.source, raw)
    assert.equal(Object.hasOwn(restored, 'requires'), original.requires !== null,
      `actual earliest original field presence: ${original.source}`)
    if (original.requires !== null) assert.deepEqual(restored.requires, original.requires,
      `actual earliest original ordered array: ${original.source}`)
    const currentAgain = structuredClone(restored)
    if (Object.hasOwn(raw, 'requires')) currentAgain.requires = structuredClone(raw.requires)
    else delete currentAgain.requires
    assert.deepEqual(currentAgain, raw, `only certified requires differ: ${original.source}`)
  }
  for (const { path, document } of currentDocuments) {
    const original = structuredClone(document)
    original.goals = original.goals.map(goal => structuredClone(reviewBindingGoal(context, `${original.landscapeId}:${goal.id}`, goal)) as Goal)
    assert.equal(digest(original), registry.catalogSources.find(entry => entry.path === path)!.baselineDocumentDigest,
      `all original document fields restored from actual V6: ${path}`)
  }
  const operationCount = registry.batches.reduce((sum, entry) => sum + entry.operations.length, 0)
  const allBatchSources = new Set(registry.batches.flatMap(batchTestSources))
  console.log(`Actual V6 registry: ${registry.batches.length} batches, ${operationCount} ordered operations, ${allBatchSources.size} batch sources, ${originals.size} deduplicated original snapshots and 21 complete documents passed.`)
}


function restoreBoundApplicabilityRefreshV6(
  registry: ApplicabilityRefreshPrerequisiteReductionRegistry, current: BatchTestDocument[],
) {
  assertBatchTestDocuments(current, registry, registry.catalogSources, 'V7 complete current')
  const parentFile = resolve(root, registry.parentRegistryPath)
  assert.equal(relative(root, parentFile), registry.parentRegistryPath, 'canonical relative live parent path')
  const parentBytes = readFileSync(parentFile)
  assert.equal(`sha256:${createHash('sha256').update(parentBytes).digest('hex')}`, registry.parentRegistryRawDigest)
  const physicsParent = registry.parentRegistryRawDigest === 'sha256:dd38bd85793769d2afae6b34a3b0b89112c497ee1b17b54f92a61af5bf785c93'
  assert.equal(registry.parentRegistryRawDigest, physicsParent
    ? 'sha256:dd38bd85793769d2afae6b34a3b0b89112c497ee1b17b54f92a61af5bf785c93'
    : 'sha256:ecaa33fc009f1b72f34edbfe8fbc67916e5e280026831333902038e1ecb0b109',
    'only the byte-pinned German V6 or its exact two-batch Physics continuation is accepted')
  assert.equal(registry.parentRegistryPath, physicsParent
    ? 'curricula/DE/Gymnasium/provenance/prerequisite-reduction-proof-registry-v6-physics-20261109.json'
    : 'curricula/DE/Gymnasium/provenance/prerequisite-reduction-proof-registry-v6-german-20261109.json')
  const parent = JSON.parse(parentBytes.toString('utf8')) as BatchedPrerequisiteReductionRegistry
  assert.equal(parent.proofContract, BATCHED_PREREQUISITE_REDUCTION_CONTRACT)
  const baseBindings = (sources: typeof registry.catalogSources) => sources.map(({ path, landscapeId, baselineDocumentDigest }) =>
    ({ path, landscapeId, baselineDocumentDigest }))
  assert.deepEqual(baseBindings(registry.catalogSources), baseBindings(parent.catalogSources))
  const documents = structuredClone(current), goals = batchTestGoals(documents)
  assert.equal(new Set(registry.originalApplicability.map(entry => entry.source)).size, registry.originalApplicability.length)
  for (const original of registry.originalApplicability) {
    const goal = goals.get(original.source)
    assert.ok(goal, `known original cache source ${original.source}`)
    const beforeFingerprint = fingerprintSemanticKindSourceGoal(goal)
    if (original.present) goal.applicability = structuredClone(original.value)
    else delete goal.applicability
    assert.equal(fingerprintSemanticKindSourceGoal(goal), beforeFingerprint, 'cache restoration does not change SourceFingerprint-v1')
  }
  assertBatchTestDocuments(documents, parent, parent.catalogSources, 'V7 restored complete V6 end frame')
  return { parent, parentBytes, documents }
}
async function verifyActualLiveApplicabilityRefresh(
  registry: ApplicabilityRefreshPrerequisiteReductionRegistry, current: BatchTestDocument[],
  parent: BatchedPrerequisiteReductionRegistry,
) {
  const context = await loadVerifiedPrerequisiteReductionContext()
  assert.ok(context)
  const summary = verifiedPrerequisiteReductionSummary(context)!
  assert.equal(summary.proofContract, APPLICABILITY_REFRESH_PREREQUISITE_REDUCTION_CONTRACT)
  assert.equal(summary.registryDigest, `sha256:${createHash('sha256')
    .update(readFileSync(resolve(root, PREREQUISITE_REDUCTION_REGISTRY_PATH))).digest('hex')}`)
  assert.equal(current.length, 21)
  assert.equal(batchTestGoals(current).size, 6524)
  assert.deepEqual(summary.affectedGoalIds, [...earliestBatchTestOriginals(parent).keys()].sort())
  const physicsParent = parent.batches.length === 2
  assert.equal(summary.affectedGoalIds.length, physicsParent ? 881 : 737,
    'cache-only sources never enlarge the exact approved prerequisite-source union')
  assert.equal(summary.registryDigest, physicsParent
    ? 'sha256:2fc01e8c0bd0cf1bf7af05d094cac9373ca985d9c9fd5128b3bd15745e614000'
    : 'sha256:8e56e88b70e0b34c649596e1d58acbf3e099e767f7bed92838153983decb2c25',
    'the actual complete V7 wrapper equals the reviewed German or Physics candidate')
  assert.equal(registry.originalApplicability.length, 27)
  assert.ok(registry.originalApplicability.every(original => original.present === true))
  assert.equal(digest(registry.originalApplicability),
    'sha256:3906dc1870fd98e2681029c3dd8c766f6c70436301c87b2ffb618a1100e57f11', 'all exact old cache values and presence flags are pinned')
  assert.deepEqual(registry.originalApplicability.map(original => original.source), [
    '7d51b38c-a149-5407-bddc-d2ce7878b020:de388e30-1623-5c21-9daf-1a985219da10',
    '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a:00e2ddfe-18c1-57a4-86ad-ee467a1a3d61',
    '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a:1ab5f599-0927-579d-94cc-feecdf3b5603',
    '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a:35dd0a33-e5d5-53b9-8438-3d339173db1b',
    '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a:3f477f0d-4f79-5eed-8671-fb2667d60910',
    '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a:52bdabb2-d9a1-56e6-bccf-ff58f299c739',
    '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a:58db62d4-458f-5e2d-9ca0-968e09f4944b',
    '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a:5e64eacd-5204-5028-af23-02a43377c56e',
    '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a:6367d45e-919e-4c19-bcd9-7770a2d51139',
    '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a:783c1ffe-d983-5c5a-8897-2c88fc64147c',
    '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a:7fe6f8a1-5580-4e37-bf8e-9772964a6b0a',
    '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a:841edfdb-5e12-5a37-ab12-552a1d8e92ca',
    '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a:9743baad-9371-52b6-98ee-72bc6dc68701',
    '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a:a24c41ce-68c5-56a7-8235-ef9a7dba7042',
    '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a:ba29e928-a287-5de7-b3fe-5c8c3731363b',
    '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a:cf570e66-2ce2-5923-9033-c97d74119553',
    '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a:d02438ba-0cc9-5993-831e-5e44d35e32c4',
    '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a:d441ee2f-9230-5751-832b-5b0b5cf14605',
    '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a:d8442d03-8b7e-54b7-9d9a-dc31ce541daa',
    '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a:db5f4121-d4b1-5006-b2da-6e76aac72bf5',
    'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0:17fe22c4-1248-5f37-9d0c-52ee4571d09f',
    'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0:7964cb36-e9b1-5176-9426-a82041a5b72f',
    'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0:79db6d68-b402-5563-a348-f2784fed8867',
    'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0:8576b82b-811a-5e13-b5dc-ec5d42030565',
    'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0:965ca297-5dbf-5e58-b5f0-6559a4433646',
    'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0:c441d9e8-d9d9-5e55-a189-a37345541321',
    'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0:fcaf8c9b-bd81-552e-9d91-43649895471e',
  ], 'the actual 19 Physics, 7 Chemistry and 1 Informatics cache sources are fixed')
  for (const { path, document } of current) {
    const original = structuredClone(document)
    original.goals = original.goals.map(goal => structuredClone(reviewBindingGoal(context, `${original.landscapeId}:${goal.id}`, goal)) as Goal)
    assert.equal(digest(original), parent.catalogSources.find(entry => entry.path === path)!.baselineDocumentDigest,
      `V7 capability restores the complete earliest baseline: ${path}`)
  }
  if (physicsParent) {
    const physics = current.find(({ document }) => document.landscapeId === '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a')!.document
    assert.equal(physics.goals.length, 766)
    const earliest = earliestBatchTestOriginals(parent)
    const beforePhysics = earliestBatchTestOriginals({ ...parent, batches: parent.batches.slice(0, 1) })
    assert.equal([...beforePhysics.keys()].filter(source => source.startsWith(`${physics.landscapeId}:`)).length, 4,
      'the four earlier Physics originals retain their chronological priority')
    for (const goal of physics.goals) {
      const source = `${physics.landscapeId}:${goal.id}`, expected = structuredClone(goal)
      const original = earliest.get(source)
      if (original) {
        if (original.requires === null) delete expected.requires
        else expected.requires = structuredClone(original.requires)
      }
      assert.equal(fingerprintSemanticKindSourceGoal(reviewBindingGoal(context, source, goal)),
        fingerprintSemanticKindSourceGoal(expected), `all 766 earliest Physics sourceFP baselines: ${source}`)
    }
  }
  console.log(`Actual V7 cache refresh: unchanged ${summary.affectedGoalIds.length} prerequisite sources, exact 27 cache snapshots and 21 complete current documents passed.`)
}

try {
  await runApplicabilityRefreshFixtureRegressions()
  await runBatchFixtureRegressions()
  await runBatchRequiredNegativeRegressions()
  runBatchLiveHelperRegressions()
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

  const activeRegistry = JSON.parse(readFileSync(resolve(root, PREREQUISITE_REDUCTION_REGISTRY_PATH), 'utf8')) as PrerequisiteReductionRegistry
  assert.ok(activeRegistry.proofContract === CLUSTER_TARGET_PREREQUISITE_REDUCTION_CONTRACT
    || activeRegistry.proofContract === BATCHED_PREREQUISITE_REDUCTION_CONTRACT
    || activeRegistry.proofContract === APPLICABILITY_REFRESH_PREREQUISITE_REDUCTION_CONTRACT, 'the active live proof uses V5, V6 or the V7 cache wrapper')
  if (activeRegistry.proofContract === CLUSTER_TARGET_PREREQUISITE_REDUCTION_CONTRACT) {
    await verifyHistoricalLiveV5Checkpoint(root)
  } else {
    const currentDocuments = activeRegistry.catalogSources.map(({ path }) => ({ path,
      document: JSON.parse(readFileSync(resolve(root, path), 'utf8')) as Document }))
    const refresh = activeRegistry.proofContract === APPLICABILITY_REFRESH_PREREQUISITE_REDUCTION_CONTRACT
      ? restoreBoundApplicabilityRefreshV6(activeRegistry, currentDocuments) : undefined
    const v6Registry = refresh ? refresh.parent : activeRegistry as BatchedPrerequisiteReductionRegistry
    const v6Documents = refresh ? refresh.documents : currentDocuments
    const checkpoint = restoreBoundV5TestCheckpoint(v6Registry, v6Documents)
    assert.equal(v6Registry.v5Checkpoint.registryDigest,
      'sha256:672c5e69194f23d3178a80225e804ca8c01ba88c0af37a7630a7a339b2e3c637', 'the unchanged complete live V5 prefix remains independently pinned')
    const checkpointRoot = resolve(temporaryRoot, 'bound-live-v5-checkpoint')
    for (const { path, document } of checkpoint.documents) {
      mkdirSync(dirname(resolve(checkpointRoot, path)), { recursive: true })
      writeFileSync(resolve(checkpointRoot, path), JSON.stringify(document))
    }
    mkdirSync(dirname(resolve(checkpointRoot, PREREQUISITE_REDUCTION_REGISTRY_PATH)), { recursive: true })
    writeFileSync(resolve(checkpointRoot, PREREQUISITE_REDUCTION_REGISTRY_PATH), JSON.stringify(checkpoint.parent))
    await verifyHistoricalLiveV5Checkpoint(checkpointRoot)
    let v6Root = root
    if (refresh) {
      v6Root = resolve(temporaryRoot, 'bound-live-v6-before-cache-refresh')
      for (const { path, document } of v6Documents) {
        mkdirSync(dirname(resolve(v6Root, path)), { recursive: true })
        writeFileSync(resolve(v6Root, path), JSON.stringify(document))
      }
      mkdirSync(dirname(resolve(v6Root, PREREQUISITE_REDUCTION_REGISTRY_PATH)), { recursive: true })
      writeFileSync(resolve(v6Root, PREREQUISITE_REDUCTION_REGISTRY_PATH), refresh.parentBytes)
    }
    await verifyActualLiveV6(v6Registry, v6Documents, checkpoint, v6Root)
    if (activeRegistry.proofContract === APPLICABILITY_REFRESH_PREREQUISITE_REDUCTION_CONTRACT)
      await verifyActualLiveApplicabilityRefresh(activeRegistry, currentDocuments, v6Registry)
  }
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true })
}
