// SPDX-License-Identifier: Apache-2.0
// A comparison-only capability for certified, directly authored leaf reductions.
import { createHash } from 'node:crypto'
import { lstatSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { SkillLandscape } from '../src/landscapeTypes'
import { auditTransitiveMinimality, type AuditLandscape } from './auditTransitiveMinimality'

export const PREREQUISITE_REDUCTION_REGISTRY_PATH =
  'curricula/DE/Gymnasium/provenance/prerequisite-reduction-proof-registry.json'
export const PREREQUISITE_REDUCTION_CONTRACT = 'direct-atomic-leaf-prerequisite-reduction-v1' as const
const CANONICAL_PATH = 'curricula/DE/Gymnasium/canonical'
const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
type RawGoal = Record<string, unknown> & { id: string; requires?: string[]; contains?: string[] }
type Document = Record<string, unknown> & { landscapeId: string; goals: RawGoal[] }
export interface PrerequisiteReductionRegistry {
  schemaVersion: 1
  proofContract: typeof PREREQUISITE_REDUCTION_CONTRACT
  auditScope: 'origin-source-landscape-closure'
  catalogSources: Array<{
    path: string
    landscapeId: string
    baselineDocumentDigest: string
    currentDocumentDigest: string
  }>
  originalRequires: Array<{ source: string; requires: string[] }>
  removals: Array<{ source: string; prerequisite: string; witness: string[] }>
}

declare const verifiedReduction: unique symbol
export type VerifiedPrerequisiteReductionContext = Readonly<{ [verifiedReduction]: true }>
export interface PrerequisiteReductionProofSummary {
  proofContract: typeof PREREQUISITE_REDUCTION_CONTRACT
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
  fields(value, ['schemaVersion', 'proofContract', 'auditScope', 'catalogSources', 'originalRequires', 'removals'], 'registry')
  ensure(value.schemaVersion === 1 && value.proofContract === PREREQUISITE_REDUCTION_CONTRACT,
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
    fields(entry, ['source', 'prerequisite', 'witness'], 'removal')
    ensure(qualified(entry.source) && qualified(entry.prerequisite) && Array.isArray(entry.witness)
      && entry.witness.length >= 3 && entry.witness.every(qualified), 'invalid removal')
  }
  return value as unknown as PrerequisiteReductionRegistry
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
  replayDocuments.forEach((document, index) => ensure(
    declared.get(loaded[index].path)!.baselineDocumentDigest === fingerprintPrerequisiteReductionDocument(document),
    `baseline document digest differs: ${loaded[index].path}`,
  ))
  const baselineDocuments = structuredClone(replayDocuments)
  const removed = new Set<string>()
  for (const operation of registry.removals) {
    const { source, prerequisite, witness } = operation
    const pair = `${source}->${prerequisite}`
    ensure(!removed.has(pair), `duplicate removal ${pair}`)
    removed.add(pair)
    ensure(witness[0] === source && witness.at(-1) === prerequisite, `witness endpoints differ: ${pair}`)
    // The existing auditor selects the source landscape's complete outgoing
    // and inherited closure from this full catalog, as in its per-root CLI.
    const audit = auditTransitiveMinimality(replayDocuments as AuditLandscape[], [source.split(':')[0]])
    const finding = audit.findings.find((entry) => entry.source === source && entry.prerequisite === prerequisite)
    ensure(finding && stableJson(finding.witness) === stableJson(witness), `no matching concrete auditor finding: ${pair}`)
    requireDirectWitness(witness, replayGoals)
    ensure(finding.supportingOrigins.every((origin, index) =>
      origin.source === witness[index] && origin.prerequisite === witness[index + 1]),
    `v1 rejects inherited witness origins: ${pair}`)
    const goal = replayGoals.get(source)!
    const before = goal.requires ?? []
    goal.requires = before.filter((raw) => resolveReference(raw, source, replayGoals) !== prerequisite)
    ensure(goal.requires.length < before.length, `no authored origin removed: ${pair}`)
    requireDirectWitness(witness, replayGoals)
  }
  registry.removals.forEach(({ witness }) => requireDirectWitness(witness, replayGoals))
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
    affectedGoalIds: [...removalSources].sort(),
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
