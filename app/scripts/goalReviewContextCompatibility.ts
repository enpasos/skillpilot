import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { atomicRelation, fullClosure, type MathGoal } from './learningUnitsMathAuthoring'
import { validateNativeProjectionEvidence, type NativeProjectionEvidence } from './nativeProjectionEvidence'

interface CompatibilityRow {
  goalId: string
  oldGoalDigest: string
  currentGoalDigest: string
  oldDirectRequires: string[]
  currentDirectRequires: string[]
  fullAtomicRequires: string[]
  positive: { configPath: string; recordDigest: string; resourceDigests: Record<string, string> }
  description?: {
    contextCompatible: boolean
    originalImageBindings: Array<{ round: string; originalUrl: string; originalDigest: string; exactOriginalBytes: boolean }>
    resolutionDigest: string; inputDigest: string; firstSourceDigest: string; secondSourceDigest: string
  }
  pins: Record<string, string>
}
interface CompatibilityRegistration {
  semantics: string
  decision: string
  landscapeId: string
  canonicalPath: string
  predecessorPath: string
  nativeProjectionPath: string
  pins: Record<string, string>
  goals: CompatibilityRow[]
}
interface CompatibilityPredecessor {
  landscapeId: string
  graph: MathGoal[]
  changedGoals: Record<string, MathGoal>
  fullAtomicClosureDigest: string
}
export const contextCompatibilityPath = 'curricula/DE/Gymnasium/quality/context-compatibility/math-2026-11-05-redundant-requires-v1/compatibility.json'
const registeredDigest = 'd4e2aa4208720e85d5a8c2a01588c1140a08cfa880e8e6ad6532811413896be8'
const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const stable = (value: unknown): string => JSON.stringify(value, (_key, item) => item && typeof item === 'object' && !Array.isArray(item)
  ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b))) : item)
const sha = (value: string | Buffer) => createHash('sha256').update(value).digest('hex')
export const contextCompatibilityDigest = (value: unknown): string => sha(stable(value))
const same = (a: unknown, b: unknown) => stable(a) === stable(b)

export interface ContextCompatibilityRequest {
  kind: 'positive' | 'description'
  record?: unknown
  configPath?: string
  resourceDigests?: Readonly<Record<string, string>>
  currentInput?: unknown
  resolution?: unknown
  firstSource?: unknown
  secondSource?: unknown
}

/** A closed, exact registration, never a general requires-insensitive fingerprint.
 * The factory permits isolated filesystem fixtures; production readers use only
 * the single source-reviewed path and digest below. No receipt creates a D pass. */
export function createGoalReviewContextCompatibilityReader(options: {
  repo: string; path: string; digest: string
  read?: (path: string) => Buffer
}) {
  const read = options.read ?? ((path: string) => readFileSync(resolve(options.repo, path)))
  let receipt: CompatibilityRegistration | undefined
  let current: { landscapeId: string; goals: MathGoal[] } | undefined
  let previous: CompatibilityPredecessor | undefined
  let freshness: string | undefined
  let globalPaths: string[] = []
  const safe = (path: string) => {
    assert.ok(path && !path.startsWith('/') && !path.includes('\\') && !path.split('/').some(p => !p || p === '.' || p === '..'), `Unsafe context compatibility path ${path}`)
    return path
  }
  const pinned = (path: string, expected: string) => {
    const bytes = read(safe(path))
    assert.equal(sha(bytes), expected, `Context compatibility input changed: ${path}`)
    return bytes
  }
  const stamps = (paths: string[]) => options.read ? undefined : paths.map(path => {
    const s = statSync(resolve(options.repo, safe(path)), { bigint: true })
    return `${path}:${s.ino}:${s.size}:${s.mtimeNs}:${s.ctimeNs}`
  }).join('|')
  const refresh = () => {
    // Include directory stamps, so newly added projection candidates also
    // invalidate the cached native validation. Every changed file is rehashed.
    if (receipt && freshness !== undefined && stamps(globalPaths) === freshness) return
    receipt = JSON.parse(pinned(options.path, options.digest).toString())
    assert.equal(receipt!.semantics, 'exact-redundant-requires-context-compatibility-v1')
    assert.equal(receipt!.decision, 'context_compatible_no_new_content_approval')
    assert.equal(new Set(receipt!.goals.map(row => row.goalId)).size, receipt!.goals.length)
    for (const [path, hash] of Object.entries(receipt!.pins as Record<string, string>)) pinned(path, hash)
    current = JSON.parse(read(receipt!.canonicalPath).toString())
    previous = JSON.parse(read(receipt!.predecessorPath).toString())
    const native: NativeProjectionEvidence = JSON.parse(read(receipt!.nativeProjectionPath).toString())
    for (const [path, digest] of Object.entries(native.inputs)) pinned(path, digest)
    validateNativeProjectionEvidence(native, options.repo, receipt!.landscapeId)
    assert.equal(current!.landscapeId, receipt!.landscapeId)
    assert.equal(previous!.landscapeId, receipt!.landscapeId)
    const before = fullClosure(atomicRelation(previous!.graph))
    const after = fullClosure(atomicRelation(current!.goals))
    assert.equal(contextCompatibilityDigest(before), previous!.fullAtomicClosureDigest)
    for (const [id, closure] of Object.entries(before)) assert.ok(same(closure, after[id]), `Full inherited demand changed: ${id}`)
    for (const row of receipt!.goals) {
      const oldGoal = previous!.changedGoals[row.goalId]
      const newGoal = current!.goals.find(g => g.id === row.goalId)
      assert.ok(oldGoal && newGoal, `Missing registered context ${row.goalId}`)
      assert.equal(contextCompatibilityDigest(oldGoal), row.oldGoalDigest)
      assert.equal(contextCompatibilityDigest(newGoal), row.currentGoalDigest)
      const withoutRequires = (g: MathGoal) => Object.fromEntries(Object.entries(g).filter(([key]) => key !== 'requires'))
      assert.ok(same(withoutRequires(oldGoal), withoutRequires(newGoal)), `Meaning/context changed: ${row.goalId}`)
      assert.ok(same(oldGoal.requires ?? [], row.oldDirectRequires) && same(newGoal.requires ?? [], row.currentDirectRequires))
      assert.ok((newGoal.requires ?? []).every(id => oldGoal.requires?.includes(id)), 'Added direct requirement')
      assert.ok((oldGoal.requires ?? []).length > (newGoal.requires ?? []).length, 'Not a registered edge reduction')
      assert.ok(same(before[row.goalId], row.fullAtomicRequires) && same(after[row.goalId], row.fullAtomicRequires), 'Registered full demand differs')
    }
    const allPaths = new Set<string>([options.path, ...Object.keys(receipt!.pins), ...Object.keys(native.inputs)])
    for (const item of native.inputDiscovery) allPaths.add(item.directory)
    for (const path of [...allPaths]) {
      let parent = dirname(path)
      while (parent !== '.') { allPaths.add(parent); parent = dirname(parent) }
    }
    globalPaths = [...allPaths].sort()
    freshness = stamps(globalPaths)
  }
  return <Goal extends object>(goal: Goal, request: ContextCompatibilityRequest): Goal | undefined => {
    try {
      refresh()
      const goalId = String((goal as { id?: unknown }).id ?? '')
      const row = receipt!.goals.find(r => r.goalId === goalId)
      if (!row || contextCompatibilityDigest(goal) !== row.currentGoalDigest) return undefined
      if (request.kind === 'positive') {
        if (request.configPath !== row.positive.configPath
          || contextCompatibilityDigest(request.record) !== row.positive.recordDigest
          || !same(request.resourceDigests ?? {}, row.positive.resourceDigests)) return undefined
      } else {
        if (!row.description?.contextCompatible
          || contextCompatibilityDigest(request.resolution) !== row.description.resolutionDigest
          || contextCompatibilityDigest(request.currentInput) !== row.description.inputDigest
          || contextCompatibilityDigest(request.firstSource) !== row.description.firstSourceDigest
          || contextCompatibilityDigest(request.secondSource) !== row.description.secondSourceDigest) return undefined
        const images = row.description.originalImageBindings
        if (images.length !== 2 || !same(images.map(image => image.round), ['first', 'second'])
          || images.some(image => !image.exactOriginalBytes
            || !image.originalUrl.startsWith('/assets/goal-visualizations/')
            || `sha256:${row.pins[`app/public${image.originalUrl}`]}` !== image.originalDigest)) return undefined
      }
      // Original bytes are always checked; the cache covers only common native
      // context validation, never per-goal reviews, rounds, criteria or images.
      for (const [path, hash] of Object.entries(row.pins as Record<string, string>)) pinned(path, hash)
      // Preserve the caller's complete goal type and object shape. The exact
      // predecessor differs solely in the registered direct requires array.
      const historical = structuredClone({ ...goal, requires: previous!.changedGoals[goalId].requires })
      assert.equal(contextCompatibilityDigest(historical), row.oldGoalDigest)
      return historical
    } catch {
      // Existing validators retain their original stale-context error. Absence,
      // corruption or drift is never converted to a successful compatibility.
      return undefined
    }
  }
}

const registeredReader = createGoalReviewContextCompatibilityReader({ repo, path: contextCompatibilityPath, digest: registeredDigest })
export const compatibleHistoricalReviewGoal = <Goal extends object>(goal: Goal, request: ContextCompatibilityRequest): Goal | undefined => registeredReader(goal, request)
