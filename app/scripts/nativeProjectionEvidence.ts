import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import type { NativeRow } from './learningUnits/adapterTypes'

const sha = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex')
const stable = (value: unknown): string => JSON.stringify(value, (_key, item) => item && typeof item === 'object' && !Array.isArray(item)
  ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b, 'en'))) : item)
const sorted = (values: Iterable<string>) => [...new Set(values)].sort()
const setHash = (values: string[]) => sha(JSON.stringify(sorted(values)))
export interface ProjectionInputDiscovery {
  directory: string
  kind: 'compositionView' | 'goalMapping' | 'javaSources'
  paths: string[]
}
export interface NativeProjectionEvidence {
  schemaVersion: 1
  semantics: 'actual-native-offer-projection-evidence-v1'
  resolverRevision: string
  landscapeId: string
  landscapeSourcePath: string
  inputs: Record<string, string>
  runtimeDependencySha256: Record<string, string>
  inputDiscovery: ProjectionInputDiscovery[]
  scopes: Array<{
    scopeId: string
    scope: Record<string, unknown>
    offeredByNativePlanner: boolean
    declaredByRepositoryGui: boolean
    compositionViewIds: string[]
    inputPaths: string[]
    targetSetSha256: string
    prerequisiteOnlySetSha256: string
    atomicPrerequisitesSha256: string
  }>
  targetAtomicMembership: Record<string, number[]>
  prerequisiteOnlyMembership: Record<string, number[]>
  atomicContextMembership: Record<string, number[]>
  atomicPrerequisites: Record<string, string[]>
}
function relativePath(path: string): string {
  assert.ok(path && !path.startsWith('/') && !path.includes('\\') && !path.split('/').some(part => !part || part === '.' || part === '..'), `Unsafe projection input: ${path}`)
  return path
}
export function discoverProjectionInputs(repo: string, landscapeId: string, descriptor: Pick<ProjectionInputDiscovery, 'directory' | 'kind'>): string[] {
  relativePath(descriptor.directory)
  const visit = (path: string): string[] => readdirSync(resolve(repo, path), { withFileTypes: true }).flatMap(entry => {
    const next = `${path}/${entry.name}`
    if (descriptor.kind === 'goalMapping' && entry.isDirectory() && entry.name === 'quality') return []
    if (entry.isDirectory()) return visit(next)
    if (descriptor.kind === 'javaSources') return entry.isFile() && entry.name.endsWith('.java') ? [next] : []
    if (!entry.isFile() || !entry.name.endsWith('.json') || descriptor.kind === 'goalMapping' && entry.name.endsWith('.review.json')) return []
    if (descriptor.kind === 'goalMapping' && !next.split('/').includes('mapping')) return []
    const value = JSON.parse(readFileSync(resolve(repo, next), 'utf8'))
    const matches = descriptor.kind === 'compositionView'
      ? value.landscapeId === landscapeId && typeof value.viewId === 'string'
      : value.version && value.targetLandscapeId === landscapeId && Array.isArray(value.mappings)
        && !value.reviewId && !value.sourceExtractionPath && !value.decisions
    return matches ? [next] : []
  })
  return visit(descriptor.directory).sort()
}
/** Project only actual resolver output; no mastery, measurement, unit selection or source inference. */
export function createNativeProjectionEvidence(options: {
  landscapeId: string; landscapeSourcePath: string; resolverRevision: string; inputs: Record<string, string>; runtimeDependencySha256: Record<string, string>; inputDiscovery: ProjectionInputDiscovery[]
  rows: Array<{ row: Pick<NativeRow, 'scopeId' | 'projectionResolved' | 'prerequisiteCompilationResolved' | 'offeredByNativePlanner' | 'declaredByRepositoryGui' | 'targetAtomicGoalIds' | 'prerequisiteOnlyGoalIds' | 'atomicPrerequisites'>; scope: Record<string, unknown>; viewIds: string[]; inputPaths: string[] }>
}): NativeProjectionEvidence {
  const rows = [...options.rows].sort((a, b) => a.row.scopeId.localeCompare(b.row.scopeId, 'en'))
  const targetAtomicMembership: Record<string, number[]> = {}
  const prerequisiteOnlyMembership: Record<string, number[]> = {}
  const atomicContextMembership: Record<string, number[]> = {}
  const atomicPrerequisites: Record<string, string[]> = {}
  const scopes = rows.map(({ row, scope, viewIds, inputPaths }, index) => {
    assert.equal(row.projectionResolved, true, `Failed native projection ${row.scopeId}`)
    assert.equal(row.prerequisiteCompilationResolved, true, `Failed native demand ${row.scopeId}`)
    assert.ok(row.offeredByNativePlanner || row.declaredByRepositoryGui, `Not an actual offered scope ${row.scopeId}`)
    const targets = sorted(row.targetAtomicGoalIds); const support = sorted(row.prerequisiteOnlyGoalIds)
    for (const id of targets) (targetAtomicMembership[id] ??= []).push(index)
    for (const id of support) (prerequisiteOnlyMembership[id] ??= []).push(index)
    const demand = Object.fromEntries(Object.entries(row.atomicPrerequisites as Record<string, string[]>).map(([id, values]) => [id, sorted(values)]))
    for (const [id, requirements] of Object.entries(demand)) {
      if (atomicPrerequisites[id]) assert.deepEqual(atomicPrerequisites[id], requirements, `Scope-dependent native demand needs an explicit adapter revision: ${id}`)
      atomicPrerequisites[id] = requirements
      ;(atomicContextMembership[id] ??= []).push(index)
    }
    return { scopeId: row.scopeId, scope, offeredByNativePlanner: row.offeredByNativePlanner,
      declaredByRepositoryGui: row.declaredByRepositoryGui, compositionViewIds: sorted(viewIds), inputPaths: sorted(inputPaths),
      targetSetSha256: setHash(targets), prerequisiteOnlySetSha256: setHash(support), atomicPrerequisitesSha256: sha(stable(demand)) }
  })
  assert.equal(new Set(scopes.map(row => row.scopeId)).size, scopes.length, 'Duplicate native scope')
  assert.equal(new Set(scopes.map(row => stable(row.scope))).size, scopes.length, 'Duplicate native semantic scope')
  return JSON.parse(stable({ schemaVersion: 1, semantics: 'actual-native-offer-projection-evidence-v1',
    resolverRevision: options.resolverRevision, landscapeId: options.landscapeId, landscapeSourcePath: options.landscapeSourcePath, inputs: options.inputs, runtimeDependencySha256: options.runtimeDependencySha256,
    inputDiscovery: options.inputDiscovery, scopes, targetAtomicMembership, prerequisiteOnlyMembership, atomicContextMembership, atomicPrerequisites }))
}
export function validateNativeProjectionEvidence(evidence: NativeProjectionEvidence, repo: string, landscapeId: string): void {
  assert.equal(evidence.schemaVersion, 1)
  assert.equal(evidence.semantics, 'actual-native-offer-projection-evidence-v1')
  assert.equal(evidence.landscapeId, landscapeId)
  assert.equal(evidence.resolverRevision, 'native-personal-curriculum-offers-v1')
  assert.ok(Object.keys(evidence.inputs).length > 0, 'Empty static projection inputs')
  assert.ok(Object.keys(evidence.runtimeDependencySha256).length > 0, 'Missing executed dependency bindings')
  Object.values(evidence.runtimeDependencySha256).forEach(digest => assert.match(digest, /^[a-f0-9]{64}$/))
  for (const [path, digest] of Object.entries(evidence.inputs)) {
    assert.match(digest, /^[a-f0-9]{64}$/)
    assert.equal(sha(readFileSync(resolve(repo, relativePath(path)))), digest, `Stale native projection input: ${path}`)
  }
  assert.ok(evidence.inputs[evidence.landscapeSourcePath], 'Native landscape source is unbound')
  const landscape = JSON.parse(readFileSync(resolve(repo, relativePath(evidence.landscapeSourcePath)), 'utf8'))
  assert.equal(landscape.landscapeId, landscapeId)
  const goalById = new Map<string, { contains?: string[] }>(landscape.goals.map((goal: { id: string }) => [goal.id, goal]))
  for (const id of Object.keys(evidence.targetAtomicMembership)) {
    const goal = goalById.get(id)
    assert.ok(goal && !goal.contains?.length, `Native target is not a known canonical atom: ${id}`)
  }
  Object.keys(evidence.prerequisiteOnlyMembership).forEach(id => assert.ok(goalById.has(id), `Unknown native support: ${id}`))
  for (const discovery of evidence.inputDiscovery) {
    assert.ok(['compositionView', 'goalMapping', 'javaSources'].includes(discovery.kind), 'Unknown projection input discovery')
    assert.deepEqual(discoverProjectionInputs(repo, landscapeId, discovery), discovery.paths, `Native projection input set changed: ${discovery.directory}`)
    discovery.paths.forEach(path => assert.ok(evidence.inputs[path], `Unbound projection candidate ${path}`))
  }
  assert.ok(evidence.scopes.length > 0, 'Empty offered projection')
  assert.equal(new Set(evidence.scopes.map(scope => scope.scopeId)).size, evidence.scopes.length, 'Duplicate projection scope')
  assert.equal(new Set(evidence.scopes.map(scope => stable(scope.scope))).size, evidence.scopes.length, 'Duplicate semantic projection scope')
  for (const [id, requirements] of Object.entries(evidence.atomicPrerequisites)) {
    assert.ok(goalById.has(id) && !goalById.get(id)?.contains?.length, `Unknown non-atomic native demand: ${id}`)
    assert.deepEqual(requirements, sorted(requirements), `Unnormalized native demand: ${id}`)
    requirements.forEach(required => assert.ok(evidence.atomicPrerequisites[required], `Unbound native demand endpoint: ${required}`))
  }
  assert.deepEqual(Object.keys(evidence.atomicPrerequisites).sort(), Object.keys(evidence.atomicContextMembership).sort(), 'Native context/demand keys differ')
  for (const membership of [evidence.targetAtomicMembership, evidence.prerequisiteOnlyMembership, evidence.atomicContextMembership]) {
    for (const [id, indices] of Object.entries(membership)) {
      assert.ok(id && indices.length > 0, 'Empty membership')
      assert.deepEqual(indices, [...new Set(indices)].sort((a, b) => a - b), `Invalid scope indices: ${id}`)
      indices.forEach(index => assert.ok(Number.isInteger(index) && index >= 0 && index < evidence.scopes.length, `Unknown scope index ${index}`))
    }
  }
  evidence.scopes.forEach((scope, index) => {
    assert.equal(scope.scope.landscapeId, landscapeId)
    assert.ok(scope.offeredByNativePlanner || scope.declaredByRepositoryGui, 'Unexposed projection row')
    assert.ok(scope.compositionViewIds.length > 0, 'Missing physical composition views')
    scope.inputPaths.forEach(path => assert.ok(evidence.inputs[path], `Unbound scope input ${path}`))
    const targets = Object.keys(evidence.targetAtomicMembership).filter(id => evidence.targetAtomicMembership[id].includes(index))
    const support = Object.keys(evidence.prerequisiteOnlyMembership).filter(id => evidence.prerequisiteOnlyMembership[id].includes(index))
    assert.equal(setHash(targets), scope.targetSetSha256, `Target membership drift ${scope.scopeId}`)
    assert.equal(setHash(support), scope.prerequisiteOnlySetSha256, `Support membership drift ${scope.scopeId}`)
    assert.match(scope.atomicPrerequisitesSha256, /^[a-f0-9]{64}$/)
    const context = Object.keys(evidence.atomicContextMembership).filter(id => evidence.atomicContextMembership[id].includes(index))
    assert.ok(targets.every(id => context.includes(id)), `Target outside native demand context ${scope.scopeId}`)
    context.forEach(id => assert.ok(evidence.atomicPrerequisites[id].every(required => context.includes(required)), `Incomplete native demand context ${scope.scopeId}: ${id}`))
    assert.equal(sha(stable(Object.fromEntries(context.map(id => [id, evidence.atomicPrerequisites[id]])))), scope.atomicPrerequisitesSha256, `Native demand relation drift ${scope.scopeId}`)
    assert.ok(targets.length > 0, `Empty native targets ${scope.scopeId}`)
    assert.ok(!targets.some(id => support.includes(id)), `Conflicting target/support ${scope.scopeId}`)
  })
}

/** Witness an already reviewed consumer's full demand in a real country scope. */
export function nativeReviewedDemandWitness(evidence: NativeProjectionEvidence, jurisdiction: string,
  consumerId: string, prerequisiteId: string, isEligibleOrdinary: (id: string) => boolean): string[] | null {
  if (!isEligibleOrdinary(consumerId) || !isEligibleOrdinary(prerequisiteId)) return null
  const scopes = evidence.atomicContextMembership[consumerId] ?? []
  const index = scopes.find(index => evidence.scopes[index].scope.jurisdiction === jurisdiction
    && evidence.atomicContextMembership[prerequisiteId]?.includes(index))
  if (index === undefined) return null
  const pending: string[][] = [[consumerId]]; const seen = new Set<string>()
  while (pending.length > 0) {
    const path = pending.shift()!; const id = path.at(-1)!
    if (seen.has(id)) continue
    seen.add(id)
    if (id === prerequisiteId && path.length > 1) return path
    for (const required of evidence.atomicPrerequisites[id] ?? []) {
      if (isEligibleOrdinary(required) && evidence.atomicContextMembership[required]?.includes(index)) pending.push([...path, required])
    }
  }
  return null
}
/** Union targets from actual offers of this jurisdiction; support never supplies coverage. */
export function nativeTargetsByJurisdiction(evidence: NativeProjectionEvidence): Map<string, Set<string>> {
  const result = new Map<string, Set<string>>()
  evidence.scopes.forEach((scope, index) => {
    const jurisdiction = scope.scope.jurisdiction
    assert.equal(typeof jurisdiction, 'string', 'Unresolved native jurisdiction')
    const targets = result.get(jurisdiction as string) ?? new Set<string>()
    Object.entries(evidence.targetAtomicMembership).forEach(([id, indices]) => { if (indices.includes(index)) targets.add(id) })
    result.set(jurisdiction as string, targets)
  })
  return result
}
