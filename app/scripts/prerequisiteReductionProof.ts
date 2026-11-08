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
type LegacyProofContract = typeof PREREQUISITE_REDUCTION_CONTRACT | typeof CLUSTER_PREREQUISITE_REDUCTION_CONTRACT
type ProofContract = LegacyProofContract | typeof ORDERED_PREREQUISITE_REDUCTION_CONTRACT
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
export type PrerequisiteReductionRegistry = LegacyPrerequisiteReductionRegistry | OrderedPrerequisiteReductionRegistry

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
  const currentDocuments = loaded.map(({ document }) => document)
  const currentGoals = goalIndex(currentDocuments)
  const declared = new Map(registry.catalogSources.map((entry) => [entry.path, entry]))
  ensure(declared.size === registry.catalogSources.length && declared.size === loaded.length,
    'catalog source paths are missing, new, or duplicated')
  for (const { path, document } of loaded) {
    const binding = declared.get(path)
    ensure(binding && binding.landscapeId === document.landscapeId, `undeclared catalog source ${path}`)
    ensure(binding.currentDocumentDigest === fingerprintPrerequisiteReductionDocument(document),
      `current document digest differs: ${path}`)
  }
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
  const { buildApplicabilityCompilation } = await import('./applicabilityCompiler')
  const applicability = (documents: Document[]) => buildApplicabilityCompilation(documents.map((document, index) => ({
    file: loaded[index].file, landscape: document as unknown as SkillLandscape,
  }))).reports.flatMap((report) => report.goals.map((goal) => ({
    key: `${report.landscapeId}:${goal.goalId}`, compiledApplicability: goal.compiledApplicability,
  }))).sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0)
  ensure(stableJson(applicability(baselineDocuments)) === stableJson(applicability(currentDocuments)),
    'compiled applicability changed')
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
  verifiedContexts.set(context, { current: currentGoals, baseline: goalIndex(baselineDocuments), summary })
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
