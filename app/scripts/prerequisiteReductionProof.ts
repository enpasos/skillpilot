// SPDX-License-Identifier: Apache-2.0
// A comparison-only capability for certified prerequisite-preserving reductions.
import { createHash } from 'node:crypto'
import { lstatSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { SkillLandscape } from '../src/landscapeTypes'
import { auditTransitiveMinimality, type AuditLandscape } from './auditTransitiveMinimality'

export const PREREQUISITE_REDUCTION_REGISTRY_PATH =
  'curricula/DE/Gymnasium/provenance/prerequisite-reduction-proof-registry.json'
export const PREREQUISITE_REDUCTION_CONTRACT = 'direct-atomic-leaf-prerequisite-reduction-v1' as const
export const CLUSTER_PREREQUISITE_REDUCTION_CONTRACT = 'atomic-descendant-covered-cluster-reduction-v2' as const
export const ORDERED_PREREQUISITE_REDUCTION_CONTRACT = 'ordered-atomic-materialization-and-cluster-reduction-v3' as const
export const CONTINUED_PREREQUISITE_REDUCTION_CONTRACT = 'continued-atomic-prerequisite-reduction-v4' as const
export const CLUSTER_TARGET_PREREQUISITE_REDUCTION_CONTRACT = 'atomic-cluster-target-normalization-v5' as const
type LegacyProofContract = typeof PREREQUISITE_REDUCTION_CONTRACT | typeof CLUSTER_PREREQUISITE_REDUCTION_CONTRACT
type ProofContract = LegacyProofContract | typeof ORDERED_PREREQUISITE_REDUCTION_CONTRACT | typeof CONTINUED_PREREQUISITE_REDUCTION_CONTRACT
  | typeof CLUSTER_TARGET_PREREQUISITE_REDUCTION_CONTRACT | typeof BATCHED_PREREQUISITE_REDUCTION_CONTRACT
export type DirectPrerequisiteReduction = { source: string; prerequisite: string; witness: string[] }
export type ClusterPrerequisiteReduction = { source: string; prerequisite: string; atomicWitnesses: string[][] }
export type AtomicPrerequisiteMaterialization = {
  operation: 'materialize-atomic'
  source: string
  prerequisite: string
  origin: {
    source: string
    prerequisite: string
    sourceContainsPath: string[]
    prerequisiteContainsPath: string[]
  }
}
export type OrderedPrerequisiteReductionStep = AtomicPrerequisiteMaterialization
  | (ClusterPrerequisiteReduction & { operation: 'remove-cluster' })
const CANONICAL_PATH = 'curricula/DE/Gymnasium/canonical'
const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
type RawGoal = Record<string, unknown> & { id: string; requires?: string[]; contains?: string[] }
type Document = Record<string, unknown> & { landscapeId: string; goals: RawGoal[] }
export interface LegacyPrerequisiteReductionRegistry {
  schemaVersion: 1
  proofContract: LegacyProofContract
  auditScope: 'origin-source-landscape-closure'
  catalogSources: Array<{
    path: string
    landscapeId: string
    baselineDocumentDigest: string
    currentDocumentDigest: string
  }>
  originalRequires: Array<{ source: string; requires: string[] }>
  removals: Array<DirectPrerequisiteReduction | ClusterPrerequisiteReduction>
}
export interface OrderedPrerequisiteReductionRegistry extends Omit<LegacyPrerequisiteReductionRegistry, 'proofContract'> {
  proofContract: typeof ORDERED_PREREQUISITE_REDUCTION_CONTRACT
  v2Checkpoint: {
    registryDigest: string
    currentDocumentDigests: Array<{ path: string; currentDocumentDigest: string }>
  }
  // null preserves an absent requires field in the original full document.
  suffixOriginalRequires: Array<{ source: string; requires: string[] | null }>
  suffix: OrderedPrerequisiteReductionStep[]
}
export interface ContinuedPrerequisiteReductionRegistry extends Omit<OrderedPrerequisiteReductionRegistry, 'proofContract'> {
  proofContract: typeof CONTINUED_PREREQUISITE_REDUCTION_CONTRACT
  v3Checkpoint: OrderedPrerequisiteReductionRegistry['v2Checkpoint']
  tailOriginalRequires: OrderedPrerequisiteReductionRegistry['suffixOriginalRequires']
  atomicRemovals: DirectPrerequisiteReduction[]
  witnessContinuations: Array<{ historicalRemovalIndex: number; edgeIndex: number; tailRemovalIndex: number }>
}
export type ClusterTargetPrerequisiteReduction = {
  operation: 'remove-cluster-target'
  source: string
  prerequisite: string
}
export interface ClusterTargetPrerequisiteReductionRegistry extends Omit<ContinuedPrerequisiteReductionRegistry, 'proofContract'> {
  proofContract: typeof CLUSTER_TARGET_PREREQUISITE_REDUCTION_CONTRACT
  v4Checkpoint: OrderedPrerequisiteReductionRegistry['v2Checkpoint']
  clusterTargetOriginalRequires: OrderedPrerequisiteReductionRegistry['suffixOriginalRequires']
  clusterTargetSuffix: Array<AtomicPrerequisiteMaterialization | ClusterTargetPrerequisiteReduction>
}
export const BATCHED_PREREQUISITE_REDUCTION_CONTRACT = 'append-only-prerequisite-reduction-batches-v6' as const
export type BatchWitnessReference =
  | { kind: 'legacy-path'; path: string }
  | { kind: 'legacy-cluster-target'; leaf: string }
  | { kind: 'batch-path'; operationId: string }
  | { kind: 'batch-coverage'; operationId: string; source: string; prerequisite: string }
export type BatchWitnessContinuation = {
  witness: BatchWitnessReference
  edgeIndex: number
  removalId: string
}
export type BatchedPrerequisiteReductionOperation =
  | { id: string; step: AtomicPrerequisiteMaterialization; endWitness: string[] }
  | { id: string; step: DirectPrerequisiteReduction; endWitness: string[] }
  | { id: string; step: ClusterPrerequisiteReduction & { operation: 'remove-cluster' }; endAtomicWitnesses: string[][] }
  | { id: string; steps: Array<AtomicPrerequisiteMaterialization | ClusterTargetPrerequisiteReduction>; endAtomicWitnesses: string[][] }
export type PrerequisiteReductionBatch = {
  id: string
  previousDigest: string
  originalRequires: Array<{ source: string; requires: string[] | null }>
  operations: BatchedPrerequisiteReductionOperation[]
  currentDocumentDigests: Array<{ path: string; currentDocumentDigest: string }>
  legacyContinuations: BatchWitnessContinuation[]
}
export interface BatchedPrerequisiteReductionRegistry extends Omit<ClusterTargetPrerequisiteReductionRegistry, 'proofContract'> {
  proofContract: typeof BATCHED_PREREQUISITE_REDUCTION_CONTRACT
  v5Checkpoint: { registryDigest: string; currentDocumentDigests: Array<{ path: string; currentDocumentDigest: string }> }
  batches: PrerequisiteReductionBatch[]
}

export type PrerequisiteReductionRegistry = LegacyPrerequisiteReductionRegistry | OrderedPrerequisiteReductionRegistry
  | ContinuedPrerequisiteReductionRegistry | ClusterTargetPrerequisiteReductionRegistry | BatchedPrerequisiteReductionRegistry
type LoadedDocument = { file: string; path: string; document: Document }
type VerifiedDocumentFrame = {
  currentDocuments: Document[]
  baselineDocuments: Document[]
  baselineApplicability: string
  affectedSources: ReadonlySet<string>
}

declare const verifiedReduction: unique symbol
export type VerifiedPrerequisiteReductionContext = Readonly<{ [verifiedReduction]: true }>
export interface PrerequisiteReductionProofSummary {
  proofContract: ProofContract
  mode: 'current-or-certified-baseline-comparison'
  auditScope: 'origin-source-landscape-closure'
  registryPath: string
  registryDigest: string
  affectedGoalIds: readonly string[]
}
type Snapshot = {
  current: ReadonlyMap<string, RawGoal>
  baseline: ReadonlyMap<string, RawGoal>
  summary: Readonly<PrerequisiteReductionProofSummary>
}
const verifiedContexts = new WeakMap<VerifiedPrerequisiteReductionContext, Snapshot>()
function ensure(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(`Prerequisite reduction proof: ${message}`)
}
function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value !== null && typeof value === 'object') return `{${Object.entries(value)
    .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
    .map(([key, child]) => `${JSON.stringify(key)}:${stableJson(child)}`).join(',')}}`
  return JSON.stringify(value)
}
export const fingerprintPrerequisiteReductionDocument = (document: unknown): string =>
  `sha256:${createHash('sha256').update(stableJson(document)).digest('hex')}`
const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
const nonempty = (value: unknown): value is string => typeof value === 'string' && value.length > 0
const qualified = (value: unknown): value is string =>
  nonempty(value) && /^[^:\s]+:[^:\s]+$/u.test(value)
function fields(value: unknown, keys: string[], label: string): asserts value is Record<string, unknown> {
  ensure(object(value) && Object.keys(value).length === keys.length
    && keys.every((key) => Object.hasOwn(value, key)), `invalid ${label} fields`)
}
function parseRegistry(value: unknown): PrerequisiteReductionRegistry {
  if (object(value) && value.proofContract === BATCHED_PREREQUISITE_REDUCTION_CONTRACT) return parseBatchedRegistry(value)
  if (object(value) && value.proofContract === CLUSTER_TARGET_PREREQUISITE_REDUCTION_CONTRACT) return parseClusterTargetRegistry(value)
  if (object(value) && value.proofContract === CONTINUED_PREREQUISITE_REDUCTION_CONTRACT) return parseContinuedRegistry(value)
  if (object(value) && value.proofContract === ORDERED_PREREQUISITE_REDUCTION_CONTRACT) return parseOrderedRegistry(value)
  fields(value, ['schemaVersion', 'proofContract', 'auditScope', 'catalogSources', 'originalRequires', 'removals'], 'registry')
  ensure(value.schemaVersion === 1 && (value.proofContract === PREREQUISITE_REDUCTION_CONTRACT
    || value.proofContract === CLUSTER_PREREQUISITE_REDUCTION_CONTRACT),
    'unsupported registry contract')
  ensure(value.auditScope === 'origin-source-landscape-closure', 'unsupported audit scope')
  ensure(Array.isArray(value.catalogSources) && value.catalogSources.length > 0, 'empty catalog sources')
  for (const entry of value.catalogSources) {
    fields(entry, ['path', 'landscapeId', 'baselineDocumentDigest', 'currentDocumentDigest'], 'catalog source')
    ensure(nonempty(entry.path) && nonempty(entry.landscapeId)
      && [entry.baselineDocumentDigest, entry.currentDocumentDigest].every((digest) =>
        typeof digest === 'string' && /^sha256:[0-9a-f]{64}$/u.test(digest)), 'invalid catalog source')
  }
  ensure(Array.isArray(value.originalRequires) && value.originalRequires.length > 0, 'empty original requires')
  for (const entry of value.originalRequires) {
    fields(entry, ['source', 'requires'], 'original requires')
    ensure(qualified(entry.source) && Array.isArray(entry.requires)
      && entry.requires.every(nonempty), 'invalid original requires')
  }
  ensure(Array.isArray(value.removals) && value.removals.length > 0, 'empty removals')
  for (const entry of value.removals) {
    if (value.proofContract === CLUSTER_PREREQUISITE_REDUCTION_CONTRACT
      && object(entry) && Object.hasOwn(entry, 'atomicWitnesses')) {
      fields(entry, ['source', 'prerequisite', 'atomicWitnesses'], 'cluster removal')
      ensure(qualified(entry.source) && qualified(entry.prerequisite) && Array.isArray(entry.atomicWitnesses)
        && entry.atomicWitnesses.length > 0 && entry.atomicWitnesses.every((path) =>
          Array.isArray(path) && path.length >= 2 && path.every(qualified)), 'invalid cluster removal')
    } else {
      fields(entry, ['source', 'prerequisite', 'witness'], 'removal')
      ensure(qualified(entry.source) && qualified(entry.prerequisite) && Array.isArray(entry.witness)
        && entry.witness.length >= 3 && entry.witness.every(qualified), 'invalid removal')
    }
  }
  return value as unknown as PrerequisiteReductionRegistry
}
function parseOrderedRegistry(value: Record<string, unknown>): OrderedPrerequisiteReductionRegistry {
  fields(value, ['schemaVersion', 'proofContract', 'auditScope', 'catalogSources', 'originalRequires', 'removals',
    'v2Checkpoint', 'suffixOriginalRequires', 'suffix'], 'ordered registry')
  // The existing parser remains authoritative for every historical V2 field.
  parseRegistry({ schemaVersion: value.schemaVersion, proofContract: CLUSTER_PREREQUISITE_REDUCTION_CONTRACT,
    auditScope: value.auditScope, catalogSources: value.catalogSources,
    originalRequires: value.originalRequires, removals: value.removals })
  fields(value.v2Checkpoint, ['registryDigest', 'currentDocumentDigests'], 'V2 checkpoint')
  const isDigest = (digest: unknown) => typeof digest === 'string' && /^sha256:[0-9a-f]{64}$/u.test(digest)
  ensure(isDigest(value.v2Checkpoint.registryDigest) && Array.isArray(value.v2Checkpoint.currentDocumentDigests),
    'invalid V2 checkpoint')
  for (const entry of value.v2Checkpoint.currentDocumentDigests) {
    fields(entry, ['path', 'currentDocumentDigest'], 'V2 checkpoint document')
    ensure(nonempty(entry.path) && isDigest(entry.currentDocumentDigest), 'invalid V2 checkpoint document')
  }
  ensure(Array.isArray(value.suffixOriginalRequires), 'invalid suffix original requires')
  for (const entry of value.suffixOriginalRequires) {
    fields(entry, ['source', 'requires'], 'suffix original requires')
    ensure(qualified(entry.source) && (entry.requires === null
      || (Array.isArray(entry.requires) && entry.requires.every(nonempty))), 'invalid suffix original requires')
  }
  ensure(Array.isArray(value.suffix) && value.suffix.length > 0, 'empty ordered suffix')
  for (const entry of value.suffix) {
    ensure(object(entry), 'invalid ordered step')
    if (entry.operation === 'materialize-atomic') {
      fields(entry, ['operation', 'source', 'prerequisite', 'origin'], 'materialization')
      fields(entry.origin, ['source', 'prerequisite', 'sourceContainsPath', 'prerequisiteContainsPath'], 'materialization origin')
      ensure(qualified(entry.source) && qualified(entry.prerequisite) && qualified(entry.origin.source)
        && nonempty(entry.origin.prerequisite)
        && [entry.origin.sourceContainsPath, entry.origin.prerequisiteContainsPath].every((path) =>
          Array.isArray(path) && path.length > 0 && path.every(qualified)), 'invalid materialization')
    } else {
      ensure(entry.operation === 'remove-cluster', 'unsupported ordered operation')
      fields(entry, ['operation', 'source', 'prerequisite', 'atomicWitnesses'], 'ordered cluster removal')
      // Reuse the strict V2 operation parser; no new removal kind is accepted.
      parseRegistry({ schemaVersion: value.schemaVersion, proofContract: CLUSTER_PREREQUISITE_REDUCTION_CONTRACT,
        auditScope: value.auditScope, catalogSources: value.catalogSources, originalRequires: value.originalRequires,
        removals: [{ source: entry.source, prerequisite: entry.prerequisite, atomicWitnesses: entry.atomicWitnesses }] })
    }
  }
  return value as unknown as OrderedPrerequisiteReductionRegistry
}
function parseContinuedRegistry(value: Record<string, unknown>): ContinuedPrerequisiteReductionRegistry {
  fields(value, ['schemaVersion', 'proofContract', 'auditScope', 'catalogSources', 'originalRequires', 'removals',
    'v2Checkpoint', 'suffixOriginalRequires', 'suffix', 'v3Checkpoint', 'tailOriginalRequires', 'atomicRemovals',
    'witnessContinuations'], 'continued registry')
  const { v3Checkpoint, tailOriginalRequires, atomicRemovals, witnessContinuations, ...prefix } = value
  parseOrderedRegistry({ ...prefix, proofContract: ORDERED_PREREQUISITE_REDUCTION_CONTRACT })
  fields(v3Checkpoint, ['registryDigest', 'currentDocumentDigests'], 'V3 checkpoint')
  const digest = (item: unknown) => typeof item === 'string' && /^sha256:[0-9a-f]{64}$/u.test(item)
  ensure(digest(v3Checkpoint.registryDigest) && Array.isArray(v3Checkpoint.currentDocumentDigests), 'invalid V3 checkpoint')
  for (const entry of v3Checkpoint.currentDocumentDigests) {
    fields(entry, ['path', 'currentDocumentDigest'], 'V3 checkpoint document')
    ensure(nonempty(entry.path) && digest(entry.currentDocumentDigest), 'invalid V3 checkpoint document')
  }
  ensure(Array.isArray(tailOriginalRequires) && tailOriginalRequires.length > 0, 'empty tail original requires')
  for (const entry of tailOriginalRequires) {
    fields(entry, ['source', 'requires'], 'tail original requires')
    ensure(qualified(entry.source) && (entry.requires === null
      || (Array.isArray(entry.requires) && entry.requires.every(nonempty))), 'invalid tail original requires')
  }
  ensure(Array.isArray(atomicRemovals) && atomicRemovals.length > 0, 'empty atomic tail removals')
  // Retain the exact direct-removal shape, independently of the V2 cluster form.
  parseRegistry({ schemaVersion: value.schemaVersion, proofContract: PREREQUISITE_REDUCTION_CONTRACT,
    auditScope: value.auditScope, catalogSources: value.catalogSources, originalRequires: value.originalRequires,
    removals: atomicRemovals })
  ensure(Array.isArray(witnessContinuations), 'invalid witness continuations')
  for (const entry of witnessContinuations) {
    fields(entry, ['historicalRemovalIndex', 'edgeIndex', 'tailRemovalIndex'], 'witness continuation')
    ensure([entry.historicalRemovalIndex, entry.edgeIndex, entry.tailRemovalIndex]
      .every(index => Number.isSafeInteger(index) && Number(index) >= 0), 'invalid witness continuation indices')
  }
  return value as unknown as ContinuedPrerequisiteReductionRegistry
}
function parseClusterTargetRegistry(value: Record<string, unknown>): ClusterTargetPrerequisiteReductionRegistry {
  fields(value, ['schemaVersion', 'proofContract', 'auditScope', 'catalogSources', 'originalRequires', 'removals',
    'v2Checkpoint', 'suffixOriginalRequires', 'suffix', 'v3Checkpoint', 'tailOriginalRequires', 'atomicRemovals',
    'witnessContinuations', 'v4Checkpoint', 'clusterTargetOriginalRequires', 'clusterTargetSuffix'], 'cluster-target registry')
  const { v4Checkpoint, clusterTargetOriginalRequires, clusterTargetSuffix, ...prefix } = value
  parseContinuedRegistry({ ...prefix, proofContract: CONTINUED_PREREQUISITE_REDUCTION_CONTRACT })
  fields(v4Checkpoint, ['registryDigest', 'currentDocumentDigests'], 'V4 checkpoint')
  const digest = (item: unknown) => typeof item === 'string' && /^sha256:[0-9a-f]{64}$/u.test(item)
  ensure(digest(v4Checkpoint.registryDigest) && Array.isArray(v4Checkpoint.currentDocumentDigests), 'invalid V4 checkpoint')
  for (const entry of v4Checkpoint.currentDocumentDigests) {
    fields(entry, ['path', 'currentDocumentDigest'], 'V4 checkpoint document')
    ensure(nonempty(entry.path) && digest(entry.currentDocumentDigest), 'invalid V4 checkpoint document')
  }
  ensure(Array.isArray(clusterTargetOriginalRequires) && clusterTargetOriginalRequires.length === 1,
    'cluster-target normalization requires exactly one original snapshot')
  for (const entry of clusterTargetOriginalRequires) {
    fields(entry, ['source', 'requires'], 'cluster-target original requires')
    ensure(qualified(entry.source) && (entry.requires === null
      || (Array.isArray(entry.requires) && entry.requires.every(nonempty))), 'invalid cluster-target original requires')
  }
  ensure(Array.isArray(clusterTargetSuffix) && clusterTargetSuffix.length > 0, 'empty cluster-target suffix')
  const cut = clusterTargetSuffix.at(-1)
  fields(cut, ['operation', 'source', 'prerequisite'], 'cluster-target removal')
  ensure(cut.operation === 'remove-cluster-target' && qualified(cut.source) && qualified(cut.prerequisite),
    'cluster-target suffix requires one final target cut')
  const additions = clusterTargetSuffix.slice(0, -1)
  ensure(additions.every(step => object(step) && step.operation === 'materialize-atomic'),
    'cluster-target suffix permits materializations before its single final cut')
  if (additions.length) parseOrderedRegistry({
    schemaVersion: value.schemaVersion, proofContract: ORDERED_PREREQUISITE_REDUCTION_CONTRACT,
    auditScope: value.auditScope, catalogSources: value.catalogSources, originalRequires: value.originalRequires,
    removals: value.removals, v2Checkpoint: value.v2Checkpoint, suffixOriginalRequires: [], suffix: additions,
  })
  return value as unknown as ClusterTargetPrerequisiteReductionRegistry
}
function catalogFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return catalogFiles(path)
    return entry.isFile() && /\.json$/iu.test(entry.name) && !/_deck/iu.test(entry.name) ? [path] : []
  }).sort()
}
function repositoryPath(root: string, path: string): string {
  const absolute = resolve(root, path), local = relative(root, absolute)
  ensure(local !== '..' && !local.startsWith(`..${sep}`), `path escapes repository: ${path}`)
  return absolute
}
function goalIndex(documents: Document[]): Map<string, RawGoal> {
  const goals = new Map<string, RawGoal>(), landscapes = new Set<string>()
  for (const document of documents) {
    ensure(object(document) && nonempty(document.landscapeId) && Array.isArray(document.goals), 'invalid catalog document')
    ensure(!landscapes.has(document.landscapeId), `duplicate landscape ${document.landscapeId}`)
    landscapes.add(document.landscapeId)
    for (const goal of document.goals) {
      ensure(object(goal) && nonempty(goal.id), 'invalid catalog goal')
      const key = `${document.landscapeId}:${goal.id}`
      ensure(!goals.has(key), `duplicate goal ${key}`)
      goals.set(key, goal)
    }
  }
  return goals
}
function resolveReference(raw: string, source: string, goals: ReadonlyMap<string, RawGoal>): string {
  const landscapeId = source.split(':')[0]
  let key: string
  if (raw.includes(':')) {
    const parts = raw.split(':')
    ensure(parts.length === 2 && nonempty(parts[1]), `invalid reference ${raw}`)
    key = `${parts[0] || landscapeId}:${parts[1]}`
  } else if (goals.has(`${landscapeId}:${raw}`)) key = `${landscapeId}:${raw}`
  else {
    const matches = [...goals.keys()].filter((candidate) => candidate.split(':')[1] === raw)
    ensure(matches.length === 1, `ambiguous or unknown reference ${raw}`)
    key = matches[0]
  }
  ensure(goals.has(key), `unknown reference ${raw}`)
  return key
}
function requireDirectWitness(witness: string[], goals: ReadonlyMap<string, RawGoal>) {
  for (const key of witness) {
    const goal = goals.get(key)
    ensure(goal?.type === 'atomic' && (goal.contains === undefined || goal.contains.length === 0),
      `v1 requires actual atomic leaves: ${key}`)
  }
  for (let i = 0; i < witness.length - 1; i++) {
    const source = witness[i], target = witness[i + 1]
    ensure((goals.get(source)!.requires ?? []).some((raw) => resolveReference(raw, source, goals) === target),
      `witness edge is not directly authored or was deleted: ${source} -> ${target}`)
  }
}
function requireClusterWitnesses(operation: ClusterPrerequisiteReduction, goals: ReadonlyMap<string, RawGoal>) {
  const { source, prerequisite, atomicWitnesses } = operation
  const root = goals.get(source)
  ensure(root?.type === 'cluster' && Array.isArray(root.contains) && root.contains.length > 0,
    `cluster removal requires a nonempty cluster source: ${source}`)
  requireDirectWitness([prerequisite], goals)
  const atoms = new Set<string>(), clusters = new Set<string>(), visiting = new Set<string>()
  const visit = (key: string) => {
    ensure(!visiting.has(key), `contains cycle in cluster removal: ${key}`)
    if (atoms.has(key) || clusters.has(key)) return
    const goal = goals.get(key)
    ensure(goal && (goal.contains === undefined || Array.isArray(goal.contains)), `invalid contains at ${key}`)
    if (!goal.contains?.length) {
      requireDirectWitness([key], goals)
      atoms.add(key)
      return
    }
    ensure(goal.type === 'cluster', `non-atomic descendant must be a cluster: ${key}`)
    visiting.add(key)
    for (const raw of goal.contains) {
      ensure(nonempty(raw), `invalid contains reference at ${key}`)
      visit(resolveReference(raw, key, goals))
    }
    visiting.delete(key)
    clusters.add(key)
  }
  visit(source)
  ensure(atoms.size > 0, `cluster removal has no atomic descendants: ${source}`)
  // Every affected non-atomic descendant loses an inherited requirement too.
  // An incoming edge to any of them could change another atom's pre-expansion
  // goal-prerequisite closure even when its expanded atomic demand is equal.
  const clusterIds = new Set([...clusters].map((key) => key.split(':')[1]))
  for (const [key, goal] of goals) {
    ensure(goal.requires === undefined || Array.isArray(goal.requires), `cannot inspect incoming requires at ${key}`)
    for (const raw of goal.requires ?? []) {
      ensure(nonempty(raw), `cannot inspect incoming reference at ${key}`)
      // Under the existing exact reference grammar a different goal-id token
      // cannot name an affected cluster. Unrelated unknown experimental refs
      // remain unverified; this scan does not turn them into resolved edges.
      const parts = raw.split(':')
      if (!parts.some((part) => clusterIds.has(part))) continue
      const target = resolveReference(raw, key, goals)
      ensure(!clusters.has(target), `incoming requires to affected cluster: ${key} -> ${target}`)
    }
  }
  const covered = new Set<string>()
  for (const witness of atomicWitnesses) {
    const atom = witness[0]
    ensure(atoms.has(atom) && !covered.has(atom) && witness.at(-1) === prerequisite,
      `atomic witness descendant coverage differs: ${source}`)
    ensure(new Set(witness).size === witness.length, `atomic witness repeats a vertex: ${atom}`)
    covered.add(atom)
    requireDirectWitness(witness, goals)
  }
  ensure(covered.size === atoms.size, `atomic witness descendant coverage differs: ${source}`)
}
function requireContainsPath(path: string[], source: string, target: string, goals: ReadonlyMap<string, RawGoal>) {
  ensure(path[0] === source && path.at(-1) === target && new Set(path).size === path.length,
    `contains path endpoints differ or repeat a vertex: ${source} -> ${target}`)
  for (let index = 0; index < path.length; index++) {
    const key = path[index], goal = goals.get(key)
    ensure(goal, `unknown contains path reference ${key}`)
    if (index === path.length - 1) continue
    ensure(goal.type === 'cluster' && Array.isArray(goal.contains)
      && goal.contains.some((raw) => nonempty(raw) && resolveReference(raw, key, goals) === path[index + 1]),
    `contains path edge is not directly authored: ${key} -> ${path[index + 1]}`)
  }
}
function materializeAtomicPrerequisite(operation: AtomicPrerequisiteMaterialization, goals: ReadonlyMap<string, RawGoal>) {
  const { source, prerequisite, origin } = operation
  requireDirectWitness([source], goals)
  requireDirectWitness([prerequisite], goals)
  ensure(source !== prerequisite, `self materialization: ${source}`)
  const goal = goals.get(source)!, originGoal = goals.get(origin.source)
  ensure(goal.requires === undefined || Array.isArray(goal.requires), `invalid materialization requires: ${source}`)
  ensure(!(goal.requires ?? []).some((raw) => resolveReference(raw, source, goals) === prerequisite),
    `materialization is already directly authored: ${source} -> ${prerequisite}`)
  ensure(originGoal && Array.isArray(originGoal.requires) && originGoal.requires.includes(origin.prerequisite),
    `materialization origin is not directly authored: ${origin.source} -> ${origin.prerequisite}`)
  const originPrerequisite = resolveReference(origin.prerequisite, origin.source, goals)
  requireContainsPath(origin.sourceContainsPath, origin.source, source, goals)
  requireContainsPath(origin.prerequisiteContainsPath, originPrerequisite, prerequisite, goals)
  const [landscapeId, goalId] = prerequisite.split(':')
  goal.requires = [...(goal.requires ?? []), landscapeId === source.split(':')[0] ? goalId : prerequisite]
}
// V5 uses structural canonical leaves. Historical V3/V4 type guards above
// remain unchanged, including their interpretation of materialize-atomic.
function requireCanonicalLeaf(key: string, goals: ReadonlyMap<string, RawGoal>) {
  const goal = goals.get(key)
  ensure(goal && (goal.contains === undefined || Array.isArray(goal.contains)) && !goal.contains?.length
    && (goal.type === undefined || goal.type === 'atomic'), `expected a structural canonical leaf: ${key}`)
}
function canonicalClusterLeaves(root: string, goals: ReadonlyMap<string, RawGoal>): Set<string> {
  const leaves = new Set<string>(), visited = new Set<string>(), visiting = new Set<string>()
  const cluster = goals.get(root)
  ensure(cluster && Array.isArray(cluster.contains) && cluster.contains.length > 0,
    `cluster-target removal requires a nonempty canonical cluster: ${root}`)
  const visit = (key: string) => {
    ensure(!visiting.has(key), `contains cycle in cluster-target closure: ${key}`)
    if (visited.has(key)) return
    const goal = goals.get(key)
    ensure(goal && (goal.contains === undefined || Array.isArray(goal.contains)), `invalid canonical contains: ${key}`)
    if (!goal.contains?.length) {
      requireCanonicalLeaf(key, goals)
      leaves.add(key)
    } else {
      ensure(goal.type === undefined || goal.type === 'cluster', `inconsistent canonical cluster type: ${key}`)
      visiting.add(key)
      const children = new Set<string>()
      for (const raw of goal.contains) {
        ensure(nonempty(raw), `invalid canonical contains reference: ${key}`)
        const child = resolveReference(raw, key, goals)
        ensure(!children.has(child), `duplicate canonical contains reference: ${key} -> ${child}`)
        children.add(child)
        visit(child)
      }
      visiting.delete(key)
    }
    visited.add(key)
  }
  visit(root)
  ensure(leaves.size > 0, `cluster-target closure has no canonical leaves: ${root}`)
  return leaves
}
function requireCanonicalContainsPath(path: string[], source: string, target: string, goals: ReadonlyMap<string, RawGoal>) {
  ensure(path[0] === source && path.at(-1) === target && new Set(path).size === path.length,
    `canonical contains path endpoints differ or repeat: ${source} -> ${target}`)
  for (let index = 0; index < path.length; index++) {
    const key = path[index], goal = goals.get(key)
    ensure(goal, `unknown canonical contains path reference: ${key}`)
    if (index === path.length - 1) continue
    ensure((goal.type === undefined || goal.type === 'cluster') && Array.isArray(goal.contains)
      && goal.contains.some(raw => nonempty(raw) && resolveReference(raw, key, goals) === path[index + 1]),
    `canonical contains path edge is not directly authored: ${key} -> ${path[index + 1]}`)
  }
}
function requireUniqueClusterTarget(source: string, cluster: string, goals: ReadonlyMap<string, RawGoal>) {
  const goal = goals.get(source)
  requireCanonicalLeaf(source, goals)
  ensure(goal && Array.isArray(goal.requires)
    && goal.requires.filter(raw => resolveReference(raw, source, goals) === cluster).length === 1,
  `cluster-target source requires one unique authored cluster reference: ${source} -> ${cluster}`)
}
function materializeClusterTargetLeaf(
  operation: AtomicPrerequisiteMaterialization, cut: ClusterTargetPrerequisiteReduction,
  leaves: ReadonlySet<string>, goals: ReadonlyMap<string, RawGoal>,
) {
  const { source, prerequisite, origin } = operation
  ensure(source === cut.source && origin.source === source && leaves.has(prerequisite)
    && stableJson(origin.sourceContainsPath) === stableJson([source]), 'cluster-target materialization source or leaf differs')
  requireCanonicalLeaf(source, goals)
  requireCanonicalLeaf(prerequisite, goals)
  ensure(source !== prerequisite, `self cluster-target materialization: ${source}`)
  requireUniqueClusterTarget(source, cut.prerequisite, goals)
  const goal = goals.get(source)!
  ensure(goal.requires!.includes(origin.prerequisite)
    && resolveReference(origin.prerequisite, source, goals) === cut.prerequisite,
  'cluster-target materialization requires the original literal cluster origin')
  ensure(!goal.requires!.some(raw => resolveReference(raw, source, goals) === prerequisite),
    `cluster-target leaf is already directly authored: ${prerequisite}`)
  requireCanonicalContainsPath(origin.prerequisiteContainsPath, cut.prerequisite, prerequisite, goals)
  const [owner, id] = prerequisite.split(':')
  goal.requires = [...goal.requires!, owner === source.split(':')[0] ? id : prerequisite]
}
function requireDirectClusterTargetLeaves(source: string, leaves: ReadonlySet<string>, goals: ReadonlyMap<string, RawGoal>) {
  requireCanonicalLeaf(source, goals)
  const goal = goals.get(source)!
  ensure(Array.isArray(goal.requires), `invalid cluster-target requires: ${source}`)
  for (const leaf of leaves) {
    requireCanonicalLeaf(leaf, goals)
    ensure(goal.requires.filter(raw => resolveReference(raw, source, goals) === leaf).length === 1,
      `cluster-target leaf coverage is incomplete or duplicated: ${source} -> ${leaf}`)
  }
}
function requireEndWitnesses(
  operations: Array<DirectPrerequisiteReduction | ClusterPrerequisiteReduction>, goals: ReadonlyMap<string, RawGoal>,
) {
  for (const operation of operations) {
    if ('witness' in operation) requireDirectWitness(operation.witness, goals)
    else requireClusterWitnesses(operation, goals)
  }
}
function removePrerequisite(
  operation: DirectPrerequisiteReduction | ClusterPrerequisiteReduction,
  documents: Document[], goals: ReadonlyMap<string, RawGoal>, removed: Set<string>,
) {
  const { source, prerequisite } = operation
  const pair = `${source}->${prerequisite}`
  ensure(!removed.has(pair), `duplicate removal ${pair}`)
  removed.add(pair)
  // Retain the auditor's exact source-closure validity and finding checks.
  const audit = auditTransitiveMinimality(documents as AuditLandscape[], [source.split(':')[0]])
  if ('witness' in operation) {
    const { witness } = operation
    ensure(witness[0] === source && witness.at(-1) === prerequisite, `witness endpoints differ: ${pair}`)
    const finding = audit.findings.find((entry) => entry.source === source && entry.prerequisite === prerequisite)
    ensure(finding && stableJson(finding.witness) === stableJson(witness), `no matching concrete auditor finding: ${pair}`)
    requireDirectWitness(witness, goals)
    ensure(finding.supportingOrigins.every((origin, index) =>
      origin.source === witness[index] && origin.prerequisite === witness[index + 1]),
    `v1 rejects inherited witness origins: ${pair}`)
  } else requireClusterWitnesses(operation, goals)
  const goal = goals.get(source)!, before = goal.requires ?? []
  goal.requires = before.filter((raw) => resolveReference(raw, source, goals) !== prerequisite)
  ensure(goal.requires.length < before.length, `no authored origin removed: ${pair}`)
  requireEndWitnesses([operation], goals)
}
function historicalRegistry(registry: OrderedPrerequisiteReductionRegistry): LegacyPrerequisiteReductionRegistry {
  const checkpoints = new Map(registry.v2Checkpoint.currentDocumentDigests.map((entry) => [entry.path, entry.currentDocumentDigest]))
  ensure(checkpoints.size === registry.v2Checkpoint.currentDocumentDigests.length
    && checkpoints.size === registry.catalogSources.length, 'V2 checkpoint paths are missing, new, or duplicated')
  const historical: LegacyPrerequisiteReductionRegistry = {
    schemaVersion: registry.schemaVersion, proofContract: CLUSTER_PREREQUISITE_REDUCTION_CONTRACT,
    auditScope: registry.auditScope,
    catalogSources: registry.catalogSources.map((entry) => {
      const currentDocumentDigest = checkpoints.get(entry.path)
      ensure(currentDocumentDigest, `V2 checkpoint source missing: ${entry.path}`)
      return { ...entry, currentDocumentDigest }
    }),
    originalRequires: registry.originalRequires,
    removals: registry.removals,
  }
  ensure(fingerprintPrerequisiteReductionDocument(historical) === registry.v2Checkpoint.registryDigest,
    'historical V2 registry digest differs')
  return historical
}
function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze)
    Object.freeze(value)
  }
  return value
}

function requireCurrentCatalog(registry: PrerequisiteReductionRegistry, loaded: LoadedDocument[]): Document[] {
  const documents = loaded.map(({ document }) => document)
  goalIndex(documents)
  const declared = new Map(registry.catalogSources.map(entry => [entry.path, entry]))
  ensure(declared.size === registry.catalogSources.length && declared.size === loaded.length,
    'catalog source paths are missing, new, or duplicated')
  for (const { path, document } of loaded) {
    const binding = declared.get(path)
    ensure(binding && binding.landscapeId === document.landscapeId, `undeclared catalog source ${path}`)
    ensure(binding.currentDocumentDigest === fingerprintPrerequisiteReductionDocument(document),
      `current document digest differs: ${path}`)
  }
  return documents
}

function requireClosedAtomicScope(documents: Document[], goals: ReadonlyMap<string, RawGoal>, roots: string[]) {
  // Scope selection, reference validity and cycles remain the existing auditor's
  // responsibility. Its selected inventory must consist only of these complete
  // root documents and requirement-free foreign inheritance ancestors.
  const audit = auditTransitiveMinimality(documents as AuditLandscape[], roots)
  const rootSet = new Set(roots)
  const owned = [...goals].filter(([key]) => rootSet.has(key.split(':')[0]))
  const ancestors = new Set(audit.inheritanceOnlyAncestors)
  ensure(ancestors.size === audit.inheritanceOnlyAncestors.length
    && audit.nodeCount === owned.length + ancestors.size, 'closed atomic scope has expanded foreign nodes')
  for (const key of ancestors) {
    const goal = goals.get(key)
    ensure(goal && !rootSet.has(key.split(':')[0]) && (goal.requires === undefined || goal.requires.length === 0),
      `closed atomic scope has a foreign requirement origin: ${key}`)
  }
  let edges = 0
  for (const [source, goal] of owned) {
    ensure(goal.requires === undefined || Array.isArray(goal.requires), `closed atomic scope invalid requires: ${source}`)
    const targets = new Set<string>()
    if (goal.requires?.length) requireDirectWitness([source], goals)
    for (const raw of goal.requires ?? []) {
      const target = resolveReference(raw, source, goals)
      ensure(rootSet.has(target.split(':')[0]), `closed atomic scope has a foreign prerequisite target: ${target}`)
      requireDirectWitness([target], goals)
      ensure(!targets.has(target), `closed atomic scope has duplicate prerequisite aliases: ${source} -> ${target}`)
      targets.add(target)
      edges++
    }
  }
  ensure(audit.authoredRequiresCount === edges && audit.effectiveRequiresCount === edges,
    'closed atomic scope has unaccounted or inherited requirements')
  return audit
}

function requireContinuedHistory(registry: ContinuedPrerequisiteReductionRegistry, goals: ReadonlyMap<string, RawGoal>) {
  const continuations = new Map<string, DirectPrerequisiteReduction>()
  for (const entry of registry.witnessContinuations) {
    const historical = registry.removals[entry.historicalRemovalIndex]
    const replacement = registry.atomicRemovals[entry.tailRemovalIndex]
    ensure(historical && 'witness' in historical && replacement,
      'witness continuation references an unknown or non-direct operation')
    ensure(entry.edgeIndex < historical.witness.length - 1
      && replacement.source === historical.witness[entry.edgeIndex]
      && replacement.prerequisite === historical.witness[entry.edgeIndex + 1], 'witness continuation endpoints differ')
    const key = `${entry.historicalRemovalIndex}:${entry.edgeIndex}`
    ensure(!continuations.has(key), 'duplicate witness continuation position')
    requireDirectWitness(replacement.witness, goals)
    continuations.set(key, replacement)
  }
  const used = new Set<string>()
  registry.removals.forEach((operation, operationIndex) => {
    if (!('witness' in operation)) { requireClusterWitnesses(operation, goals); return }
    const composed = [operation.witness[0]]
    for (let edge = 0; edge < operation.witness.length - 1; edge++) {
      const source = operation.witness[edge], target = operation.witness[edge + 1]
      const key = `${operationIndex}:${edge}`, replacement = continuations.get(key)
      const literal = (goals.get(source)!.requires ?? []).some(raw => resolveReference(raw, source, goals) === target)
      if (replacement) {
        ensure(!literal, `unused witness continuation for surviving edge ${key}`)
        used.add(key)
        composed.push(...replacement.witness.slice(1))
      } else {
        ensure(literal, `missing witness continuation for historical edge ${key}`)
        requireDirectWitness([source, target], goals)
        composed.push(target)
      }
    }
    ensure(new Set(composed).size === composed.length, 'composed historical witness repeats a vertex')
    requireDirectWitness(composed, goals)
  })
  ensure(used.size === continuations.size, 'unused witness continuation')
}

async function verifyContinuedFrame(
  registry: ContinuedPrerequisiteReductionRegistry, loaded: LoadedDocument[],
): Promise<VerifiedDocumentFrame> {
  const currentDocuments = requireCurrentCatalog(registry, loaded)
  const { v3Checkpoint, tailOriginalRequires, atomicRemovals } = registry
  const checkpoints = new Map(v3Checkpoint.currentDocumentDigests.map(entry => [entry.path, entry.currentDocumentDigest]))
  ensure(checkpoints.size === v3Checkpoint.currentDocumentDigests.length && checkpoints.size === registry.catalogSources.length,
    'V3 checkpoint paths are missing, new, or duplicated')
  const parent: OrderedPrerequisiteReductionRegistry = {
    schemaVersion: registry.schemaVersion, proofContract: ORDERED_PREREQUISITE_REDUCTION_CONTRACT,
    auditScope: registry.auditScope,
    catalogSources: registry.catalogSources.map(entry => {
      const digest = checkpoints.get(entry.path)
      ensure(digest, `V3 checkpoint source missing: ${entry.path}`)
      return { ...entry, currentDocumentDigest: digest }
    }),
    originalRequires: registry.originalRequires, removals: registry.removals,
    v2Checkpoint: registry.v2Checkpoint, suffixOriginalRequires: registry.suffixOriginalRequires, suffix: registry.suffix,
  }
  ensure(fingerprintPrerequisiteReductionDocument(parent) === v3Checkpoint.registryDigest, 'historical V3 registry digest differs')
  const parentDocuments = structuredClone(currentDocuments), parentGoals = goalIndex(parentDocuments)
  const prefixSources = new Set([...parent.originalRequires.map(entry => entry.source), ...parent.suffix.map(step => step.source)])
  const tailSources = new Set(atomicRemovals.map(step => step.source))
  ensure([...tailSources].every(source => !prefixSources.has(source)), 'atomic tail sources overlap the certified prefix')
  const restored = new Set<string>()
  for (const entry of tailOriginalRequires) {
    ensure(tailSources.has(entry.source) && !restored.has(entry.source), `extra or duplicate tail original requires: ${entry.source}`)
    restored.add(entry.source)
    const goal = parentGoals.get(entry.source)
    ensure(goal, `unknown tail original source: ${entry.source}`)
    if (entry.requires === null) delete goal.requires
    else goal.requires = structuredClone(entry.requires)
  }
  ensure(restored.size === tailSources.size, 'missing tail original requires')
  // No tail operation or continuation can repair a bad parent: the unchanged
  // V3 path verifies its replay, every literal end witness and actual applicability.
  const parentFrame = await verifyDocumentFrame(parent, loaded.map((entry, index) => ({ ...entry, document: parentDocuments[index] })))
  deepFreeze(parentFrame.baselineDocuments)
  const replayDocuments = structuredClone(parentDocuments), replayGoals = goalIndex(replayDocuments)
  const roots = [...new Set(atomicRemovals.map(step => step.source.split(':')[0]))].sort()
  requireClosedAtomicScope(replayDocuments, replayGoals, roots)
  const removed = new Set<string>()
  for (const operation of atomicRemovals) {
    const { source, prerequisite, witness } = operation, pair = `${source}->${prerequisite}`
    ensure(!removed.has(pair), `duplicate atomic tail removal: ${pair}`)
    ensure(witness[0] === source && witness.at(-1) === prerequisite && new Set(witness).size === witness.length,
      `atomic tail witness endpoints differ or repeat a vertex: ${pair}`)
    requireDirectWitness(witness, replayGoals)
    const goal = replayGoals.get(source)!, before = goal.requires ?? []
    goal.requires = before.filter(raw => resolveReference(raw, source, replayGoals) !== prerequisite)
    ensure(goal.requires.length === before.length - 1, `no unique authored atomic tail edge removed: ${pair}`)
    removed.add(pair)
    requireDirectWitness(witness, replayGoals)
  }
  const finalAudit = requireClosedAtomicScope(replayDocuments, replayGoals, roots)
  ensure(finalAudit.findings.length === 0, 'atomic tail is not transitively minimal')
  atomicRemovals.forEach(operation => requireDirectWitness(operation.witness, replayGoals))
  requireContinuedHistory(registry, replayGoals)
  requireEndWitnesses(parent.suffix.filter(step => step.operation === 'remove-cluster'), replayGoals)
  ensure(stableJson(replayDocuments) === stableJson(currentDocuments),
    'atomic tail replay differs from the current catalog; undeclared fields, arrays, or aliases changed')
  // The identical deep-frozen baseline was already compiled in the complete
  // parent verification. Only its immutable comparison value is reused here.
  ensure(parentFrame.baselineApplicability === await compileApplicability(currentDocuments, loaded), 'compiled applicability changed after atomic tail')
  return { currentDocuments, baselineDocuments: parentFrame.baselineDocuments,
    baselineApplicability: parentFrame.baselineApplicability,
    affectedSources: new Set([...parentFrame.affectedSources, ...tailSources]) }
}

async function verifyClusterTargetFrame(
  registry: ClusterTargetPrerequisiteReductionRegistry, loaded: LoadedDocument[],
): Promise<VerifiedDocumentFrame> {
  const currentDocuments = requireCurrentCatalog(registry, loaded)
  const { v4Checkpoint, clusterTargetOriginalRequires, clusterTargetSuffix, ...prefix } = registry
  const checkpoints = new Map(v4Checkpoint.currentDocumentDigests.map(entry => [entry.path, entry.currentDocumentDigest]))
  ensure(checkpoints.size === v4Checkpoint.currentDocumentDigests.length && checkpoints.size === registry.catalogSources.length,
    'V4 checkpoint paths are missing, new, or duplicated')
  const parent: ContinuedPrerequisiteReductionRegistry = {
    ...prefix, proofContract: CONTINUED_PREREQUISITE_REDUCTION_CONTRACT,
    catalogSources: registry.catalogSources.map(entry => {
      const digest = checkpoints.get(entry.path)
      ensure(digest, `V4 checkpoint source missing: ${entry.path}`)
      return { ...entry, currentDocumentDigest: digest }
    }),
  }
  ensure(fingerprintPrerequisiteReductionDocument(parent) === v4Checkpoint.registryDigest, 'historical V4 registry digest differs')
  const cut = clusterTargetSuffix.at(-1) as ClusterTargetPrerequisiteReduction
  const original = clusterTargetOriginalRequires[0]
  ensure(original.source === cut.source, 'cluster-target original snapshot source differs')
  const parentDocuments = structuredClone(currentDocuments), parentGoals = goalIndex(parentDocuments)
  const source = parentGoals.get(original.source)
  ensure(source, `unknown cluster-target original source: ${original.source}`)
  if (original.requires === null) delete source.requires
  else source.requires = structuredClone(original.requires)
  // Verify every V4 operation, continuation, document and App binding before
  // the new suffix can add an edge or remove its original cluster origin.
  const parentFrame = await verifyDocumentFrame(parent, loaded.map((entry, index) => ({ ...entry, document: parentDocuments[index] })))
  ensure(!parentFrame.affectedSources.has(cut.source), 'cluster-target source overlaps the certified prefix')
  deepFreeze(parentFrame.baselineDocuments)
  const replayDocuments = structuredClone(parentDocuments), replayGoals = goalIndex(replayDocuments)
  const leaves = canonicalClusterLeaves(cut.prerequisite, replayGoals)
  requireUniqueClusterTarget(cut.source, cut.prerequisite, replayGoals)
  const roots = [cut.source.split(':')[0]]
  auditTransitiveMinimality(replayDocuments as AuditLandscape[], roots)
  for (const addition of clusterTargetSuffix.slice(0, -1)) {
    materializeClusterTargetLeaf(addition as AtomicPrerequisiteMaterialization, cut, leaves, replayGoals)
  }
  requireUniqueClusterTarget(cut.source, cut.prerequisite, replayGoals)
  requireDirectClusterTargetLeaves(cut.source, leaves, replayGoals)
  const goal = replayGoals.get(cut.source)!, before = goal.requires!
  goal.requires = before.filter(raw => resolveReference(raw, cut.source, replayGoals) !== cut.prerequisite)
  ensure(goal.requires.length === before.length - 1, 'cluster-target cut did not remove exactly one authored reference')
  requireDirectClusterTargetLeaves(cut.source, leaves, replayGoals)
  auditTransitiveMinimality(replayDocuments as AuditLandscape[], roots)
  // No historical witness receives a skip: all V4, V3 and continued V2
  // positions remain literal under the already bound continuation.
  parent.atomicRemovals.forEach(operation => requireDirectWitness(operation.witness, replayGoals))
  requireContinuedHistory(parent, replayGoals)
  requireEndWitnesses(parent.suffix.filter(step => step.operation === 'remove-cluster'), replayGoals)
  ensure(stableJson(replayDocuments) === stableJson(currentDocuments),
    'cluster-target replay differs from the current catalog; undeclared fields, arrays, or aliases changed')
  ensure(parentFrame.baselineApplicability === await compileApplicability(currentDocuments, loaded),
    'compiled applicability changed after cluster-target normalization')
  return { currentDocuments, baselineDocuments: parentFrame.baselineDocuments,
    baselineApplicability: parentFrame.baselineApplicability,
    affectedSources: new Set([...parentFrame.affectedSources, cut.source]) }
}

async function compileApplicability(documents: Document[], loaded: LoadedDocument[]): Promise<string> {
  const { buildApplicabilityCompilation } = await import('./applicabilityCompiler')
  return stableJson(buildApplicabilityCompilation(documents.map((document, index) => ({
    file: loaded[index].file, landscape: document as unknown as SkillLandscape,
  }))).reports.flatMap((report) => report.goals.map((goal) => ({
    key: `${report.landscapeId}:${goal.goalId}`, compiledApplicability: goal.compiledApplicability,
  }))).sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
}

async function verifyDocumentFrame(
  registry: PrerequisiteReductionRegistry, loaded: LoadedDocument[],
): Promise<VerifiedDocumentFrame> {
  if (registry.proofContract === BATCHED_PREREQUISITE_REDUCTION_CONTRACT) return verifyBatchedFrame(registry, loaded)
  if (registry.proofContract === CLUSTER_TARGET_PREREQUISITE_REDUCTION_CONTRACT) return verifyClusterTargetFrame(registry, loaded)
  if (registry.proofContract === CONTINUED_PREREQUISITE_REDUCTION_CONTRACT) return verifyContinuedFrame(registry, loaded)
  const currentDocuments = requireCurrentCatalog(registry, loaded)
  const declared = new Map(registry.catalogSources.map((entry) => [entry.path, entry]))
  const ordered = registry.proofContract === ORDERED_PREREQUISITE_REDUCTION_CONTRACT ? registry : undefined
  const historical = ordered ? historicalRegistry(ordered) : registry
  const replayDocuments = structuredClone(currentDocuments)
  const replayGoals = goalIndex(replayDocuments)
  const restored = new Set<string>()
  for (const entry of registry.originalRequires) {
    ensure(!restored.has(entry.source), `duplicate original requires ${entry.source}`)
    restored.add(entry.source)
    const goal = replayGoals.get(entry.source)
    ensure(goal, `unknown original source ${entry.source}`)
    goal.requires = structuredClone(entry.requires)
  }
  const removalSources = new Set(registry.removals.map(({ source }) => source))
  ensure(restored.size === removalSources.size && [...restored].every((key) => removalSources.has(key)),
    'original requires must describe exactly the removal sources')
  const affectedSources = new Set(removalSources)
  if (ordered) {
    const newSources = new Set(ordered.suffix.map(({ source }) => source).filter((source) => !restored.has(source)))
    const overlaid = new Set<string>()
    for (const entry of ordered.suffixOriginalRequires) {
      ensure(newSources.has(entry.source) && !overlaid.has(entry.source),
        `extra or duplicate suffix original requires: ${entry.source}`)
      overlaid.add(entry.source)
      const goal = replayGoals.get(entry.source)
      ensure(goal, `unknown suffix original source ${entry.source}`)
      if (entry.requires === null) delete goal.requires
      else goal.requires = structuredClone(entry.requires)
    }
    ensure(overlaid.size === newSources.size, 'missing suffix original requires')
    ordered.suffix.forEach(({ source }) => affectedSources.add(source))
  }
  replayDocuments.forEach((document, index) => ensure(
    declared.get(loaded[index].path)!.baselineDocumentDigest === fingerprintPrerequisiteReductionDocument(document),
    `baseline document digest differs: ${loaded[index].path}`,
  ))
  const baselineDocuments = structuredClone(replayDocuments)
  const removed = new Set<string>()
  for (const operation of registry.removals) {
    removePrerequisite(operation, replayDocuments, replayGoals, removed)
  }
  // Validate all historical witnesses before the suffix can add any support.
  requireEndWitnesses(registry.removals, replayGoals)
  if (ordered) {
    replayDocuments.forEach((document, index) => ensure(
      historical.catalogSources.find(({ path }) => path === loaded[index].path)!.currentDocumentDigest
        === fingerprintPrerequisiteReductionDocument(document),
      `V2 checkpoint document digest differs: ${loaded[index].path}`,
    ))
    for (const operation of ordered.suffix) {
      if (operation.operation === 'materialize-atomic') {
        materializeAtomicPrerequisite(operation, replayGoals)
        // Cluster-target expansion can expose an atomic cycle that the old
        // goal-node relation did not contain. Retain the existing validity gate;
        // ordinary redundancy findings are allowed during materialization.
        auditTransitiveMinimality(replayDocuments as AuditLandscape[], [operation.source.split(':')[0]])
      } else removePrerequisite(operation, replayDocuments, replayGoals, removed)
    }
    // A future atomic-reduction contract needs explicit witness continuation.
    // This bounded contract retains every literal historical end witness.
    requireEndWitnesses(registry.removals, replayGoals)
    requireEndWitnesses(ordered.suffix.filter((step) => step.operation === 'remove-cluster'), replayGoals)
  }
  ensure(stableJson(replayDocuments) === stableJson(currentDocuments),
    'replay differs from the current catalog; undeclared fields, arrays, or aliases changed')
  const baselineApplicability = await compileApplicability(baselineDocuments, loaded)
  ensure(baselineApplicability === await compileApplicability(currentDocuments, loaded), 'compiled applicability changed')
  return { currentDocuments, baselineDocuments, baselineApplicability, affectedSources }
}

/** Load once at a Node entrypoint, then pass explicitly to comparison consumers. */
export async function loadVerifiedPrerequisiteReductionContext({
  repositoryRoot = REPOSITORY_ROOT,
  registryPath = PREREQUISITE_REDUCTION_REGISTRY_PATH,
  catalogPath = CANONICAL_PATH,
}: { repositoryRoot?: string; registryPath?: string; catalogPath?: string } = {}):
  Promise<VerifiedPrerequisiteReductionContext | undefined> {
  const registryFile = repositoryPath(repositoryRoot, registryPath)
  try {
    ensure(lstatSync(registryFile).isFile(), `registry must be a regular file: ${registryPath}`)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
    throw error
  }
  // A declared proof is authoritative input: any failure is fatal, never a stale-check fallback.
  const registryBytes = readFileSync(registryFile)
  const registry = parseRegistry(JSON.parse(registryBytes.toString('utf8')))
  const loaded = catalogFiles(repositoryPath(repositoryRoot, catalogPath)).map((file) => ({
    file, path: relative(repositoryRoot, file).split(sep).join('/'),
    document: JSON.parse(readFileSync(file, 'utf8')) as Document,
  }))
  const { currentDocuments, baselineDocuments, affectedSources } = await verifyDocumentFrame(registry, loaded)
  const context = Object.freeze({}) as VerifiedPrerequisiteReductionContext
  deepFreeze(currentDocuments)
  deepFreeze(baselineDocuments)
  const summary = deepFreeze({
    proofContract: registry.proofContract,
    mode: 'current-or-certified-baseline-comparison' as const,
    auditScope: registry.auditScope,
    registryPath,
    registryDigest: `sha256:${createHash('sha256').update(registryBytes).digest('hex')}`,
    affectedGoalIds: [...affectedSources].sort(),
  })
  verifiedContexts.set(context, { current: goalIndex(currentDocuments), baseline: goalIndex(baselineDocuments), summary })
  return context
}

export function verifiedPrerequisiteReductionSummary(
  context: VerifiedPrerequisiteReductionContext | undefined,
): Readonly<PrerequisiteReductionProofSummary> | undefined {
  if (context === undefined) return undefined
  const snapshot = verifiedContexts.get(context)
  ensure(snapshot, 'unregistered or forged context')
  return snapshot.summary
}

/** Historical raw value solely for the four approved review-binding comparisons. */
export function reviewBindingGoal(
  context: VerifiedPrerequisiteReductionContext | undefined,
  qualifiedId: string,
  currentRawGoal: Record<string, unknown>,
): Record<string, unknown> {
  if (context === undefined) return currentRawGoal
  const snapshot = verifiedContexts.get(context)
  ensure(snapshot, 'unregistered or forged context')
  const verified = snapshot.current.get(qualifiedId)
  ensure(verified && stableJson(verified) === stableJson(currentRawGoal),
    `current goal differs from verified snapshot: ${qualifiedId}`)
  const baseline = snapshot.baseline.get(qualifiedId)
  ensure(baseline, `baseline goal missing from verified snapshot: ${qualifiedId}`)
  return baseline
}


function parseBatchedRegistry(value: Record<string, unknown>): BatchedPrerequisiteReductionRegistry {
  fields(value, ['schemaVersion', 'proofContract', 'auditScope', 'catalogSources', 'originalRequires', 'removals',
    'v2Checkpoint', 'suffixOriginalRequires', 'suffix', 'v3Checkpoint', 'tailOriginalRequires', 'atomicRemovals',
    'witnessContinuations', 'v4Checkpoint', 'clusterTargetOriginalRequires', 'clusterTargetSuffix',
    'v5Checkpoint', 'batches'], 'batched registry')
  const { v5Checkpoint, batches, ...prefix } = value
  const parent = { ...prefix, proofContract: CLUSTER_TARGET_PREREQUISITE_REDUCTION_CONTRACT }
  parseClusterTargetRegistry(parent)
  parseBatchCheckpoint(v5Checkpoint, 'V5 checkpoint')
  ensure(Array.isArray(batches) && batches.length > 0, 'empty V6 batches')
  const identifiers = new Set<string>()
  const identify = (id: unknown) => {
    ensure(typeof id === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]*$/u.test(id) && !identifiers.has(id),
      'invalid or duplicate V6 identifier')
    identifiers.add(id)
  }
  for (const batch of batches) {
    fields(batch, ['id', 'previousDigest', 'originalRequires', 'operations', 'currentDocumentDigests', 'legacyContinuations'], 'batch')
    identify(batch.id)
    ensure(batchDigest(batch.previousDigest), 'invalid batch predecessor digest')
    ensure(Array.isArray(batch.originalRequires) && batch.originalRequires.length > 0, 'empty batch original requires')
    for (const original of batch.originalRequires) {
      fields(original, ['source', 'requires'], 'batch original requires')
      ensure(qualified(original.source) && (original.requires === null
        || (Array.isArray(original.requires) && original.requires.every(nonempty))), 'invalid batch original requires')
    }
    parseBatchDocumentDigests(batch.currentDocumentDigests, 'batch end documents')
    ensure(Array.isArray(batch.operations) && batch.operations.length > 0, 'empty batch operations')
    for (const operation of batch.operations) {
      ensure(object(operation), 'invalid batched operation')
      identify(operation.id)
      if (Object.hasOwn(operation, 'steps')) {
        fields(operation, ['id', 'steps', 'endAtomicWitnesses'], 'batch cluster-target group')
        ensure(Array.isArray(operation.steps) && operation.steps.length > 0, 'empty batch cluster-target group')
        const cut = operation.steps.at(-1)
        ensure(object(cut) && qualified(cut.source), 'invalid batch cluster-target cut')
        parseClusterTargetRegistry({ ...parent,
          clusterTargetOriginalRequires: [{ source: cut.source, requires: null }], clusterTargetSuffix: operation.steps })
        parseBatchPaths(operation.endAtomicWitnesses, 'cluster-target end coverage')
      } else {
        ensure(object(operation.step), 'invalid batch step')
        const step = operation.step
        if (step.operation === 'remove-cluster') {
          fields(operation, ['id', 'step', 'endAtomicWitnesses'], 'batch cluster-source removal')
          parseBatchOrderedStep(step, parent)
          parseBatchPaths(operation.endAtomicWitnesses, 'cluster-source end coverage')
        } else if (step.operation === 'materialize-atomic') {
          fields(operation, ['id', 'step', 'endWitness'], 'batch materialization')
          parseBatchOrderedStep(step, parent)
          parseBatchPath(operation.endWitness, 2, 'materialization end witness')
        } else {
          fields(operation, ['id', 'step', 'endWitness'], 'batch atomic removal')
          parseRegistry({ schemaVersion: value.schemaVersion, proofContract: PREREQUISITE_REDUCTION_CONTRACT,
            auditScope: value.auditScope, catalogSources: value.catalogSources,
            originalRequires: value.originalRequires, removals: [step] })
          parseBatchPath(operation.endWitness, 3, 'atomic removal end witness')
        }
      }
    }
    ensure(Array.isArray(batch.legacyContinuations), 'invalid batch continuations')
    for (const continuation of batch.legacyContinuations) {
      fields(continuation, ['witness', 'edgeIndex', 'removalId'], 'batch continuation')
      ensure(Number.isSafeInteger(continuation.edgeIndex) && Number(continuation.edgeIndex) >= 0
        && nonempty(continuation.removalId), 'invalid batch continuation position or removal')
      const reference = continuation.witness
      ensure(object(reference), 'invalid batch witness reference')
      if (reference.kind === 'legacy-path') {
        fields(reference, ['kind', 'path'], 'legacy path reference')
        ensure(typeof reference.path === 'string'
          && /^\/(?:removals\/(?:0|[1-9]\d*)\/(?:witness|atomicWitnesses\/(?:0|[1-9]\d*))|suffix\/(?:0|[1-9]\d*)\/atomicWitnesses\/(?:0|[1-9]\d*)|atomicRemovals\/(?:0|[1-9]\d*)\/witness)$/u.test(reference.path),
        'unsupported legacy witness path')
      } else if (reference.kind === 'legacy-cluster-target') {
        fields(reference, ['kind', 'leaf'], 'legacy target coverage reference')
        ensure(qualified(reference.leaf), 'invalid legacy target coverage leaf')
      } else if (reference.kind === 'batch-path') {
        fields(reference, ['kind', 'operationId'], 'batch path reference')
        ensure(nonempty(reference.operationId), 'invalid batch path operation')
      } else {
        fields(reference, ['kind', 'operationId', 'source', 'prerequisite'], 'batch coverage reference')
        ensure(reference.kind === 'batch-coverage' && nonempty(reference.operationId) && qualified(reference.source) && qualified(reference.prerequisite),
          'invalid batch coverage reference')
      }
    }
  }
  return value as unknown as BatchedPrerequisiteReductionRegistry
}
function batchDigest(value: unknown): value is string {
  return typeof value === 'string' && /^sha256:[0-9a-f]{64}$/u.test(value)
}
function parseBatchDocumentDigests(value: unknown, label: string) {
  ensure(Array.isArray(value) && value.length > 0, `empty ${label}`)
  for (const entry of value) {
    fields(entry, ['path', 'currentDocumentDigest'], label)
    ensure(nonempty(entry.path) && batchDigest(entry.currentDocumentDigest), `invalid ${label}`)
  }
}
function parseBatchCheckpoint(value: unknown, label: string) {
  fields(value, ['registryDigest', 'currentDocumentDigests'], label)
  ensure(batchDigest(value.registryDigest), `invalid ${label} digest`)
  parseBatchDocumentDigests(value.currentDocumentDigests, label)
}
function parseBatchPath(value: unknown, minimum: number, label: string) {
  ensure(Array.isArray(value) && value.length >= minimum && value.every(qualified), `invalid ${label}`)
}
function parseBatchPaths(value: unknown, label: string) {
  ensure(Array.isArray(value) && value.length > 0, `empty ${label}`)
  value.forEach(path => parseBatchPath(path, 2, label))
}
function parseBatchOrderedStep(step: unknown, parent: Record<string, unknown>) {
  parseOrderedRegistry({ schemaVersion: parent.schemaVersion, proofContract: ORDERED_PREREQUISITE_REDUCTION_CONTRACT,
    auditScope: parent.auditScope, catalogSources: parent.catalogSources, originalRequires: parent.originalRequires,
    removals: parent.removals, v2Checkpoint: parent.v2Checkpoint, suffixOriginalRequires: [], suffix: [step] })
}

type BatchPathDefinition = {
  reference: BatchWitnessReference
  path: string[]
  created: number
}
type BatchCoverageDefinition = {
  kind: 'cluster-source' | 'cluster-target'
  source: string
  prerequisite: string
  paths: BatchWitnessReference[]
  legacy: boolean
}
type BatchWitnessState = {
  paths: Map<string, BatchPathDefinition>
  replacements: Map<string, BatchWitnessReference>
  coverages: BatchCoverageDefinition[]
}
const batchReferenceKey = (reference: BatchWitnessReference) => stableJson(reference)
const batchPositionKey = (reference: BatchWitnessReference, edge: number) => stableJson([reference, edge])
function registerBatchPath(state: BatchWitnessState, reference: BatchWitnessReference, path: string[], created: number) {
  const key = batchReferenceKey(reference)
  ensure(!state.paths.has(key), `duplicate witness obligation ${key}`)
  state.paths.set(key, { reference, path: structuredClone(path), created })
}
function requireLiteralCanonicalPath(path: string[], goals: ReadonlyMap<string, RawGoal>) {
  ensure(path.length >= 2 && new Set(path).size === path.length, 'literal atomic path is empty, reflexive, or repeats a vertex')
  path.forEach(key => requireCanonicalLeaf(key, goals))
  for (let edge = 0; edge < path.length - 1; edge++) {
    const source = path[edge], target = path[edge + 1]
    ensure((goals.get(source)!.requires ?? []).some(raw => resolveReference(raw, source, goals) === target),
      `literal atomic witness edge missing: ${source} -> ${target}`)
  }
}
function canonicalRequirementLeaves(key: string, goals: ReadonlyMap<string, RawGoal>): Set<string> {
  const goal = goals.get(key)
  ensure(goal, `unknown canonical requirement ${key}`)
  if (goal.contains?.length) return canonicalClusterLeaves(key, goals)
  requireCanonicalLeaf(key, goals)
  return new Set([key])
}
function requireBatchedClusterCoverage(
  source: string, prerequisite: string, paths: string[][], goals: ReadonlyMap<string, RawGoal>, inspectIncoming: boolean,
) {
  const sources = canonicalClusterLeaves(source, goals), targets = canonicalRequirementLeaves(prerequisite, goals)
  const covered = new Set<string>()
  for (const path of paths) {
    ensure(sources.has(path[0]) && targets.has(path.at(-1)!), 'batch cluster Cartesian witness endpoints differ')
    const pair = stableJson([path[0], path.at(-1)])
    ensure(!covered.has(pair), 'duplicate batch Cartesian witness pair')
    covered.add(pair)
    requireLiteralCanonicalPath(path, goals)
  }
  ensure(covered.size === sources.size * targets.size, 'batch cluster Cartesian coverage is incomplete')
  if (inspectIncoming) {
    // Same incoming-source guard as V2; classification alone uses canonical structure in V6.
    const clusters = new Set<string>(), visit = (key: string) => {
      const goal = goals.get(key)!
      if (!goal.contains?.length || clusters.has(key)) return
      clusters.add(key)
      goal.contains.forEach(raw => visit(resolveReference(raw, key, goals)))
    }
    visit(source)
    const ids = new Set([...clusters].map(key => key.split(':')[1]))
    for (const [key, goal] of goals) {
      ensure(goal.requires === undefined || Array.isArray(goal.requires), `cannot inspect incoming requires at ${key}`)
      for (const raw of goal.requires ?? []) {
        ensure(nonempty(raw), `cannot inspect incoming reference at ${key}`)
        if (!raw.split(':').some(part => ids.has(part))) continue
        ensure(!clusters.has(resolveReference(raw, key, goals)), `incoming requires to affected cluster: ${key} -> ${raw}`)
      }
    }
  }
}
function registerBatchCoverage(
  state: BatchWitnessState, kind: BatchCoverageDefinition['kind'], source: string, prerequisite: string,
  paths: string[][], references: BatchWitnessReference[], created: number, goals: ReadonlyMap<string, RawGoal>,
) {
  const sources = kind === 'cluster-source' ? canonicalClusterLeaves(source, goals) : new Set([source])
  const targets = kind === 'cluster-source' ? canonicalRequirementLeaves(prerequisite, goals) : canonicalClusterLeaves(prerequisite, goals)
  ensure(paths.length === sources.size * targets.size && references.length === paths.length, 'batch end descendant coverage differs')
  const seen = new Set<string>()
  paths.forEach((path, index) => {
    const pair = stableJson([path[0], path.at(-1)])
    ensure(sources.has(path[0]) && targets.has(path.at(-1)!) && !seen.has(pair),
      'batch end descendant coverage endpoints differ or duplicate')
    seen.add(pair)
    registerBatchPath(state, references[index], path, created)
  })
  state.coverages.push({ kind, source, prerequisite, paths: references, legacy: created === 0 })
}
function materializeBatchedAtomic(operation: AtomicPrerequisiteMaterialization, goals: ReadonlyMap<string, RawGoal>) {
  const { source, prerequisite, origin } = operation
  requireCanonicalLeaf(source, goals)
  requireCanonicalLeaf(prerequisite, goals)
  ensure(source !== prerequisite, `self batch materialization: ${source}`)
  const goal = goals.get(source)!, originGoal = goals.get(origin.source)
  ensure(goal.requires === undefined || Array.isArray(goal.requires), `invalid batch materialization requires: ${source}`)
  ensure(!(goal.requires ?? []).some(raw => resolveReference(raw, source, goals) === prerequisite), 'batch atomic materialization is already direct')
  ensure(originGoal && Array.isArray(originGoal.requires) && originGoal.requires.includes(origin.prerequisite), 'batch materialization origin is not literal raw requires')
  const target = resolveReference(origin.prerequisite, origin.source, goals)
  requireCanonicalContainsPath(origin.sourceContainsPath, origin.source, source, goals)
  requireCanonicalContainsPath(origin.prerequisiteContainsPath, target, prerequisite, goals)
  const [owner, id] = prerequisite.split(':')
  goal.requires = [...(goal.requires ?? []), owner === source.split(':')[0] ? id : prerequisite]
}
function legacyBatchWitnessState(
  parent: ClusterTargetPrerequisiteReductionRegistry, goals: ReadonlyMap<string, RawGoal>,
): BatchWitnessState {
  const state: BatchWitnessState = { paths: new Map(), replacements: new Map(), coverages: [] }
  parent.removals.forEach((operation, index) => {
    if ('witness' in operation) registerBatchPath(state,
      { kind: 'legacy-path', path: `/removals/${index}/witness` }, operation.witness, 0)
    else registerBatchCoverage(state, 'cluster-source', operation.source, operation.prerequisite,
      operation.atomicWitnesses, operation.atomicWitnesses.map((_, witness) =>
        ({ kind: 'legacy-path', path: `/removals/${index}/atomicWitnesses/${witness}` })), 0, goals)
  })
  parent.suffix.forEach((operation, index) => {
    if (operation.operation === 'remove-cluster') registerBatchCoverage(state, 'cluster-source', operation.source,
      operation.prerequisite, operation.atomicWitnesses, operation.atomicWitnesses.map((_, witness) =>
        ({ kind: 'legacy-path', path: `/suffix/${index}/atomicWitnesses/${witness}` })), 0, goals)
  })
  parent.atomicRemovals.forEach((operation, index) => registerBatchPath(state,
    { kind: 'legacy-path', path: `/atomicRemovals/${index}/witness` }, operation.witness, 0))
  // The already verified V4 continuation is resolved before any V6 continuation.
  for (const continuation of parent.witnessContinuations) state.replacements.set(batchPositionKey(
    { kind: 'legacy-path', path: `/removals/${continuation.historicalRemovalIndex}/witness` }, continuation.edgeIndex),
  { kind: 'legacy-path', path: `/atomicRemovals/${continuation.tailRemovalIndex}/witness` })
  const cut = parent.clusterTargetSuffix.at(-1) as ClusterTargetPrerequisiteReduction
  const leaves = [...canonicalClusterLeaves(cut.prerequisite, goals)].sort()
  registerBatchCoverage(state, 'cluster-target', cut.source, cut.prerequisite,
    leaves.map(leaf => [cut.source, leaf]), leaves.map(leaf => ({ kind: 'legacy-cluster-target', leaf })), 0, goals)
  return state
}
function validateBatchWitnessState(state: BatchWitnessState, goals: ReadonlyMap<string, RawGoal>) {
  const resolved = new Map<string, string[]>(), visiting = new Set<string>()
  const expand = (reference: BatchWitnessReference): string[] => {
    const key = batchReferenceKey(reference), cached = resolved.get(key)
    if (cached) return cached
    const definition = state.paths.get(key)
    ensure(definition && !visiting.has(key), `unknown or cyclic witness obligation ${key}`)
    visiting.add(key)
    const path = [definition.path[0]]
    for (let edge = 0; edge < definition.path.length - 1; edge++) {
      const replacement = state.replacements.get(batchPositionKey(reference, edge))
      if (replacement) {
        const continued = expand(replacement)
        ensure(continued[0] === definition.path[edge] && continued.at(-1) === definition.path[edge + 1],
          'composed continuation endpoints differ')
        path.push(...continued.slice(1))
      } else path.push(definition.path[edge + 1])
    }
    requireLiteralCanonicalPath(path, goals)
    visiting.delete(key)
    resolved.set(key, path)
    return path
  }
  for (const definition of state.paths.values()) expand(definition.reference)
  for (const coverage of state.coverages) {
    const paths = coverage.paths.map(expand)
    if (coverage.kind === 'cluster-source' && coverage.legacy) requireClusterWitnesses({ source: coverage.source,
      prerequisite: coverage.prerequisite, atomicWitnesses: paths }, goals)
    else if (coverage.kind === 'cluster-source') requireBatchedClusterCoverage(coverage.source, coverage.prerequisite, paths, goals, true)
    else {
      const expected = canonicalClusterLeaves(coverage.prerequisite, goals), covered = new Set<string>()
      for (const path of paths) {
        ensure(path[0] === coverage.source && expected.has(path.at(-1)!) && !covered.has(path.at(-1)!),
          'continued cluster-target leaf coverage differs')
        covered.add(path.at(-1)!)
      }
      ensure(expected.size === covered.size, 'continued cluster-target leaf coverage missing')
    }
  }
}
function batchedOperationSources(operation: BatchedPrerequisiteReductionOperation): string[] {
  return 'steps' in operation ? operation.steps.map(step => step.source) : [operation.step.source]
}
function requireBatchDocumentBindings(
  documents: Document[], loaded: LoadedDocument[], entries: PrerequisiteReductionBatch['currentDocumentDigests'], label: string,
) {
  const bindings = new Map(entries.map(entry => [entry.path, entry.currentDocumentDigest]))
  ensure(bindings.size === entries.length && bindings.size === loaded.length, `${label} paths missing, extra, or duplicated`)
  loaded.forEach((entry, index) => ensure(bindings.get(entry.path) === fingerprintPrerequisiteReductionDocument(documents[index]),
    `${label} document digest differs: ${entry.path}`))
}
function requireBatchOriginalSources(batch: PrerequisiteReductionBatch, goals: ReadonlyMap<string, RawGoal>) {
  const sources = new Set(batch.operations.flatMap(batchedOperationSources)), snapshots = new Set<string>()
  for (const snapshot of batch.originalRequires) {
    ensure(sources.has(snapshot.source) && !snapshots.has(snapshot.source) && goals.has(snapshot.source),
      `extra, duplicate, or unknown batch original source: ${snapshot.source}`)
    snapshots.add(snapshot.source)
  }
  ensure(snapshots.size === sources.size, 'missing batch original requires')
  return sources
}
function requireUniqueAuthoredBatchEdge(source: string, prerequisite: string, goals: ReadonlyMap<string, RawGoal>) {
  const goal = goals.get(source)
  ensure(goal && Array.isArray(goal.requires)
    && goal.requires.filter(raw => resolveReference(raw, source, goals) === prerequisite).length === 1,
  `batch operation requires one unique authored edge: ${source} -> ${prerequisite}`)
}
function removeBatchedAtomic(
  operation: DirectPrerequisiteReduction, documents: Document[], goals: ReadonlyMap<string, RawGoal>,
) {
  const { source, prerequisite, witness } = operation
  requireUniqueAuthoredBatchEdge(source, prerequisite, goals)
  ensure(witness[0] === source && witness.at(-1) === prerequisite, 'batch atomic witness endpoints differ')
  requireLiteralCanonicalPath(witness, goals)
  const audit = auditTransitiveMinimality(documents as AuditLandscape[], [source.split(':')[0]])
  const finding = audit.findings.find(item => item.source === source && item.prerequisite === prerequisite)
  ensure(finding && stableJson(finding.witness) === stableJson(witness)
    && finding.supportingOrigins.length === witness.length - 1
    && finding.supportingOrigins.every((origin, edge) => origin.source === witness[edge] && origin.prerequisite === witness[edge + 1]),
  'batch removal has no exact fresh directly-authored auditor witness')
  const goal = goals.get(source)!, before = goal.requires!
  goal.requires = before.filter(raw => resolveReference(raw, source, goals) !== prerequisite)
  ensure(goal.requires.length === before.length - 1, 'batch atomic removal differs from one raw edge')
  requireLiteralCanonicalPath(witness, goals)
}
function replayBatchOperation(
  operation: BatchedPrerequisiteReductionOperation, documents: Document[], goals: ReadonlyMap<string, RawGoal>,
  state: BatchWitnessState, created: number, removed: Map<string, { operation: DirectPrerequisiteReduction; reference: BatchWitnessReference }>,
) {
  if ('steps' in operation) {
    const cut = operation.steps.at(-1) as ClusterTargetPrerequisiteReduction
    const leaves = canonicalClusterLeaves(cut.prerequisite, goals), roots = [cut.source.split(':')[0]]
    requireUniqueClusterTarget(cut.source, cut.prerequisite, goals)
    auditTransitiveMinimality(documents as AuditLandscape[], roots)
    for (const addition of operation.steps.slice(0, -1))
      materializeClusterTargetLeaf(addition as AtomicPrerequisiteMaterialization, cut, leaves, goals)
    requireUniqueClusterTarget(cut.source, cut.prerequisite, goals)
    requireDirectClusterTargetLeaves(cut.source, leaves, goals)
    const goal = goals.get(cut.source)!, before = goal.requires!
    goal.requires = before.filter(raw => resolveReference(raw, cut.source, goals) !== cut.prerequisite)
    ensure(goal.requires.length === before.length - 1, 'grouped target cut differs from one raw edge')
    requireDirectClusterTargetLeaves(cut.source, leaves, goals)
    auditTransitiveMinimality(documents as AuditLandscape[], roots)
    registerBatchCoverage(state, 'cluster-target', cut.source, cut.prerequisite, operation.endAtomicWitnesses,
      operation.endAtomicWitnesses.map(path => ({ kind: 'batch-coverage', operationId: operation.id, source: path[0], prerequisite: path.at(-1)! })), created, goals)
  } else if ('endAtomicWitnesses' in operation) {
    const step = operation.step
    requireUniqueAuthoredBatchEdge(step.source, step.prerequisite, goals)
    auditTransitiveMinimality(documents as AuditLandscape[], [step.source.split(':')[0]])
    requireBatchedClusterCoverage(step.source, step.prerequisite, step.atomicWitnesses, goals, true)
    const goal = goals.get(step.source)!, before = goal.requires!
    goal.requires = before.filter(raw => resolveReference(raw, step.source, goals) !== step.prerequisite)
    ensure(goal.requires.length === before.length - 1, 'batch cluster removal differs from one raw edge')
    requireBatchedClusterCoverage(step.source, step.prerequisite, step.atomicWitnesses, goals, true)
    auditTransitiveMinimality(documents as AuditLandscape[], [step.source.split(':')[0]])
    registerBatchCoverage(state, 'cluster-source', step.source, step.prerequisite, operation.endAtomicWitnesses,
      operation.endAtomicWitnesses.map(path => ({ kind: 'batch-coverage', operationId: operation.id, source: path[0], prerequisite: path.at(-1)! })), created, goals)
  } else if ('operation' in operation.step) {
    const step = operation.step
    materializeBatchedAtomic(step, goals)
    auditTransitiveMinimality(documents as AuditLandscape[], [step.source.split(':')[0]])
    ensure(operation.endWitness[0] === step.source && operation.endWitness.at(-1) === step.prerequisite,
      'materialization end witness endpoints differ')
    registerBatchPath(state, { kind: 'batch-path', operationId: operation.id }, operation.endWitness, created)
  } else {
    const direct = operation.step
    removeBatchedAtomic(direct, documents, goals)
    ensure(operation.endWitness[0] === direct.source && operation.endWitness.at(-1) === direct.prerequisite,
      'atomic end witness endpoints differ')
    const reference: BatchWitnessReference = { kind: 'batch-path', operationId: operation.id }
    registerBatchPath(state, reference, operation.endWitness, created)
    removed.set(operation.id, { operation: direct, reference })
  }
}
async function verifyBatchedFrame(
  registry: BatchedPrerequisiteReductionRegistry, loaded: LoadedDocument[],
): Promise<VerifiedDocumentFrame> {
  const currentDocuments = requireCurrentCatalog(registry, loaded)
  const { v5Checkpoint, batches, ...prefix } = registry
  const parentDigests = new Map(v5Checkpoint.currentDocumentDigests.map(entry => [entry.path, entry.currentDocumentDigest]))
  ensure(parentDigests.size === v5Checkpoint.currentDocumentDigests.length && parentDigests.size === loaded.length,
    'V5 checkpoint paths missing, extra, or duplicated')
  const parent: ClusterTargetPrerequisiteReductionRegistry = { ...prefix,
    proofContract: CLUSTER_TARGET_PREREQUISITE_REDUCTION_CONTRACT,
    catalogSources: registry.catalogSources.map(entry => {
      const currentDocumentDigest = parentDigests.get(entry.path)
      ensure(currentDocumentDigest, `V5 checkpoint source missing: ${entry.path}`)
      return { ...entry, currentDocumentDigest }
    }) }
  ensure(fingerprintPrerequisiteReductionDocument(parent) === v5Checkpoint.registryDigest, 'historical V5 registry digest differs')
  let predecessor = v5Checkpoint.registryDigest
  for (const batch of batches) {
    ensure(batch.previousDigest === predecessor, `batch predecessor digest differs: ${batch.id}`)
    predecessor = fingerprintPrerequisiteReductionDocument(batch)
  }
  const parentDocuments = structuredClone(currentDocuments), reverseGoals = goalIndex(parentDocuments)
  requireBatchDocumentBindings(parentDocuments, loaded, batches.at(-1)!.currentDocumentDigests, 'final batch')
  for (let index = batches.length - 1; index >= 0; index--) {
    const batch = batches[index]
    requireBatchOriginalSources(batch, reverseGoals)
    for (const snapshot of batch.originalRequires) {
      const goal = reverseGoals.get(snapshot.source)!
      if (snapshot.requires === null) delete goal.requires
      else goal.requires = structuredClone(snapshot.requires)
    }
    requireBatchDocumentBindings(parentDocuments, loaded,
      index === 0 ? v5Checkpoint.currentDocumentDigests : batches[index - 1].currentDocumentDigests, `batch ${batch.id} start`)
  }
  // Full V5 verification precedes every new edge and continuation. No suffix can repair bad history.
  const parentFrame = await verifyDocumentFrame(parent, loaded.map((entry, index) => ({ ...entry, document: parentDocuments[index] })))
  deepFreeze(parentFrame.baselineDocuments)
  const replayDocuments = structuredClone(parentDocuments), goals = goalIndex(replayDocuments)
  const state = legacyBatchWitnessState(parent, goals), affectedSources = new Set(parentFrame.affectedSources)
  validateBatchWitnessState(state, goals)
  batches.forEach((batch, index) => {
    const created = index + 1, sources = requireBatchOriginalSources(batch, goals)
    for (const snapshot of batch.originalRequires) {
      const goal = goals.get(snapshot.source)!
      ensure((snapshot.requires === null ? !Object.hasOwn(goal, 'requires')
        : Object.hasOwn(goal, 'requires') && stableJson(goal.requires) === stableJson(snapshot.requires)),
      `batch original requires differ at forward start: ${snapshot.source}`)
    }
    const removed = new Map<string, { operation: DirectPrerequisiteReduction; reference: BatchWitnessReference }>()
    for (const operation of batch.operations) replayBatchOperation(operation, replayDocuments, goals, state, created, removed)
    // End witnesses are explicit literal paths, independently of the initial fresh auditor witness.
    for (const definition of state.paths.values()) if (definition.created === created) requireLiteralCanonicalPath(definition.path, goals)
    for (const continuation of batch.legacyContinuations) {
      const definition = state.paths.get(batchReferenceKey(continuation.witness)), replacement = removed.get(continuation.removalId)
      ensure(definition && definition.created < created && replacement, 'unknown, current-batch, or non-atomic continuation reference')
      ensure(continuation.edgeIndex < definition.path.length - 1, 'continuation edge index is out of range')
      const source = definition.path[continuation.edgeIndex], prerequisite = definition.path[continuation.edgeIndex + 1]
      ensure(replacement.operation.source === source && replacement.operation.prerequisite === prerequisite,
        'legacy continuation removed-edge endpoints differ')
      const position = batchPositionKey(continuation.witness, continuation.edgeIndex)
      ensure(!state.replacements.has(position), 'duplicate or already continued legacy witness position')
      ensure(!(goals.get(source)!.requires ?? []).some(raw => resolveReference(raw, source, goals) === prerequisite),
        'unused continuation for a surviving literal edge')
      state.replacements.set(position, replacement.reference)
    }
    validateBatchWitnessState(state, goals)
    requireBatchDocumentBindings(replayDocuments, loaded, batch.currentDocumentDigests, `batch ${batch.id} end`)
    sources.forEach(source => affectedSources.add(source))
  })
  ensure(stableJson(replayDocuments) === stableJson(currentDocuments),
    'batch replay differs from the current catalog; undeclared fields, arrays, or aliases changed')
  ensure(parentFrame.baselineApplicability === await compileApplicability(currentDocuments, loaded),
    'compiled applicability changed after batches')
  return { currentDocuments, baselineDocuments: parentFrame.baselineDocuments,
    baselineApplicability: parentFrame.baselineApplicability, affectedSources }
}
