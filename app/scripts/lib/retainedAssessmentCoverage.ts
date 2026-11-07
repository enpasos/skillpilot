// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { gunzipSync } from 'node:zlib'
import type { LearningGoal, SkillLandscape } from '../../src/landscapeTypes'
import { collectCompositionProjectionRoleGoalIds, normalizeCompositionView } from '../../src/utils/authoring/compositionViewAuthoring'
import { checkSkillGraphIntegrity } from './skillGraphIntegrity'

export const RETAINED_INFO_OWNER = '7d51b38c-a149-5407-bddc-d2ce7878b020'
export const RETAINED_INFO_SOURCE_SHA = '85411185514af4b2ecf818807f3bd6fe5df17fb5011c5ebf8c4996de1a47817e'
export const RETAINED_INFO_INVENTORY_SHA = '3a1bf33c5dff8e310cc2ebc593a8fe61017bb34d8819a965fea0ec73a9e2f891'
const HISTORY = 'contracts/curriculum-assessment-coverage/v1/informatics'
export const INFO_FIRST = '6ebc2a67-ea20-5c4e-8a63-635f40438d6a'
export const INFO_HELD = 'f37f2d37-7686-5ed7-9c20-6f83d4fd2254'
export interface RetainedCoverageRow {
  goalId: string
  historyKind: 'declared' | 'undeclared' | 'first-definition'
  decision: 'declared-preserved' | 'undeclared-preserved' | 'first-definition-bound' | 'fail'
  coverage?: { historyAtomicGoalKeys?: string[]; initialAtomicGoalKeys?: string[]; currentAtomicGoalKeys: string[] }
  meaningEvidence: string
  issues: string[]
}
export interface RetainedCoverageManifest {
  contractVersion: 'informatics-retained-assessment-coverage-v1'
  owner: string
  historySourceSha256: string
  historyInventorySha256: string
  frameDigest: string
  historicalGoalIds: string[]
  currentDefinitionGoalIds: string[]
  introductionGoalIds: string[]
  rows: RetainedCoverageRow[]
  failingGoalIds: string[]
  discoveryIssues: string[]
  status: 'pass' | 'fail'
}
export interface CapturedSource { readonly path: string; readonly sha256: string; readonly owner: string }
export interface RetainedCoverageContext { readonly manifest: RetainedCoverageManifest }
const captures = new WeakMap<object, CapturedSource>()
const contexts = new WeakMap<object, { owner: string; source?: CapturedSource; definitions: readonly string[]; required: readonly string[] }>()
export const coverageSha256 = (bytes: string | Buffer): string => createHash('sha256').update(bytes).digest('hex')
export function stableCoverageJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableCoverageJson).join(',')}]`
  if (value !== null && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableCoverageJson((value as Record<string, unknown>)[key])}`).join(',')}}`
  return JSON.stringify(value)
}
const same = (a: unknown, b: unknown) => stableCoverageJson(a) === stableCoverageJson(b)
const sorted = (values: Iterable<string>): string[] => [...new Set(values)].sort()
function freeze<T>(value: T): T {
  if (value !== null && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value) }
  return value
}
/** Capture exactly once, parse these bytes, retain no mutable caller alias. */
export function captureCurriculumSource<T = SkillLandscape>(path: string, raw: string | Buffer): T {
  const bytes = Buffer.from(raw)
  const parsed = JSON.parse(bytes.toString('utf8'))
  if (parsed && typeof parsed === 'object') {
    captures.set(parsed, Object.freeze({ path, sha256: coverageSha256(bytes), owner: String(parsed.landscapeId ?? '') }))
    if (parsed.landscapeId === RETAINED_INFO_OWNER) freeze(parsed)
  }
  return parsed as T
}
export const isTrustedRetainedCoverageContext = (value: unknown): value is RetainedCoverageContext =>
  value !== null && typeof value === 'object' && contexts.has(value)
export function retainedContextMatchesSource(context: unknown, source: SkillLandscape): boolean {
  if (!isTrustedRetainedCoverageContext(context)) return false
  const expected = contexts.get(context)!.source, actual = captures.get(source)
  return !!expected && !!actual && same(expected, actual)
}
export function retainedContextMatchesScope(context: unknown, owner: string, definitions: readonly string[], required: readonly string[]): boolean {
  if (!isTrustedRetainedCoverageContext(context)) return false
  const frame = contexts.get(context)!
  return frame.owner === owner && same(frame.definitions, definitions) && same(frame.required, required)
}

/** Only these exact fields are nonsemantic in the finite retained contract. */
export function protectedAssessmentMeaning(goal: LearningGoal, exam = false): unknown {
  const result = structuredClone(goal) as unknown as Record<string, unknown>
  for (const key of ['requires', 'contains', 'phase']) delete result[key]
  for (const [parent, keys] of [ ['dimensionTags', ['phase']], ['extendedData', ['placementRevision']],
    ...(exam ? [['examData', ['coveredGoalIds', 'reviewStatus', 'reviewNote']]] : []) ] as Array<[string, string[]]>) {
    const nested = result[parent]
    if (!nested || typeof nested !== 'object' || Array.isArray(nested)) continue
    const fields = nested as Record<string, unknown>
    const hadOnlyRemoved = Object.keys(fields).every(key => keys.includes(key))
    for (const key of keys) delete fields[key]
    if (hadOnlyRemoved && Object.keys(fields).length === 0) delete result[parent]
  }
  return result
}

/** No new expansion engine: native projection computes the closure; the native
 * integrity checker validates the required containment slice, never requires. */
export function resolveRetainedCoverage(landscape: SkillLandscape, references: unknown): { atoms: string[]; definitions: string[]; issues: string[] } {
  const issues: string[] = []
  if (!Array.isArray(references) || !references.length) return { atoms: [], definitions: [], issues: ['unresolved-reference: nonempty reference array required'] }
  const byId = new Map(landscape.goals.map(goal => [goal.id.toLowerCase(), goal]))
  if (byId.size !== landscape.goals.length) issues.push('duplicate-definition')
  const local = (raw: unknown): string => {
    if (typeof raw !== 'string' || raw.trim() !== raw || !raw) { issues.push(`unresolved-reference: ${String(raw)}`); return String(raw) }
    const parts = raw.split(':')
    if (parts.length > 2 || parts.some(part => !part)) { issues.push(`unresolved-reference: ${raw}`); return raw }
    if (parts.length === 2 && parts[0] !== landscape.landscapeId) { issues.push(`owner-mismatch: ${raw}`); return raw }
    const id = parts.at(-1)!
    const goal = byId.get(id.toLowerCase())
    if (!goal) issues.push(`unresolved-reference: ${raw}`)
    return goal?.id ?? raw
  }
  const roots = references.map(local)
  // Normalize namespace syntax only after exact owner validation, retaining
  // errors. The native function follows every contains edge without filters.
  const normalized = new Map(landscape.goals.map(goal => [goal.id, { ...goal,
    contains: Array.isArray(goal.contains) ? goal.contains.map(raw => {
      const parts = typeof raw === 'string' ? raw.split(':') : []
      return parts.length === 2 && parts[0] === landscape.landscapeId
        ? byId.get(parts[1].toLowerCase())?.id ?? raw : typeof raw === 'string' ? byId.get(raw.toLowerCase())?.id ?? raw : String(raw)
    }) : [] }]))
  const roles = collectCompositionProjectionRoleGoalIds(roots.map(goalId => ({ kind: 'canonicalSubtree', goalId })), normalized)
  const definitions = sorted(roles.targetGoalIds)
  for (const id of definitions) {
    const goal = normalized.get(id)
    if (!goal) { issues.push(`unresolved-reference: ${id}`); continue }
    const originalGoal = byId.get(id.toLowerCase())
    if (originalGoal?.contains !== undefined && !Array.isArray(originalGoal.contains)) issues.push(`unresolved-reference: malformed contains ${id}`)
    for (const raw of Array.isArray(originalGoal?.contains) ? originalGoal.contains : []) local(raw)
  }
  const needed = landscape.goals.filter(goal => definitions.includes(goal.id)).map(goal => ({
    ...goal, contains: normalized.get(goal.id)?.contains, requires: [],
  }))
  if (needed.length) {
    const native = checkSkillGraphIntegrity([{ landscapeId: landscape.landscapeId, goals: needed }], [landscape.landscapeId])
    for (const finding of native.findings.filter(finding => ['G01a', 'G01b', 'G05', 'G06'].includes(finding.ruleId))) {
      issues.push(`unresolved-reference: ${finding.code} ${finding.goalId ?? ''}`)
    }
  }
  const atoms = definitions.filter(id => { const goal = normalized.get(id); return goal && (!goal.contains || goal.contains.length === 0) })
  if (!atoms.length) issues.push('unresolved-reference: empty atomic expansion')
  return { atoms: atoms.map(id => `${landscape.landscapeId}:${id}`), definitions, issues: sorted(issues) }
}

interface HistoryInventory { owner: string; historicalRawSourceSha256: string; declaredCount: number; undeclaredCount: number; definitions: unknown[] }
export function verifyRetainedHistory(raw: Buffer, inventoryRaw: Buffer): { landscape: SkillLandscape; inventory: HistoryInventory; issues: string[] } {
  const landscape = JSON.parse(raw.toString('utf8')) as SkillLandscape
  const inventory = JSON.parse(inventoryRaw.toString('utf8')) as HistoryInventory
  const issues: string[] = []
  if (coverageSha256(raw) !== RETAINED_INFO_SOURCE_SHA || coverageSha256(inventoryRaw) !== RETAINED_INFO_INVENTORY_SHA
    || landscape.landscapeId !== RETAINED_INFO_OWNER || inventory.owner !== RETAINED_INFO_OWNER
    || inventory.historicalRawSourceSha256 !== RETAINED_INFO_SOURCE_SHA) issues.push('history-binding-invalid')
  const exams = landscape.goals.filter(goal => goal.examData)
  const rows = exams.map(goal => {
    const base = { goalId: goal.id, title: goal.title, historicalGoalObjectSha256: coverageSha256(JSON.stringify(goal)),
      historicalExamDataSha256: coverageSha256(JSON.stringify(goal.examData)) }
    if (!Object.hasOwn(goal.examData!, 'coveredGoalIds')) return { ...base, coverage: { state: 'undeclared', reason: 'Field absent in exact historical source; historical competence coverage unknown.' } }
    const resolved = resolveRetainedCoverage(landscape, goal.examData!.coveredGoalIds)
    issues.push(...resolved.issues)
    return { ...base, coverage: { state: 'declared', references: goal.examData!.coveredGoalIds,
      resolvedAtomicGoalIds: resolved.atoms.map(key => key.slice(RETAINED_INFO_OWNER.length + 1)) } }
  }).sort((a, b) => a.goalId.localeCompare(b.goalId))
  if (exams.length !== 24 || inventory.declaredCount !== 14 || inventory.undeclaredCount !== 10
    || rows.filter(row => row.coverage.state === 'declared').length !== 14 || !same(rows, inventory.definitions)) issues.push('incomplete-inventory')
  return { landscape, inventory, issues: sorted(issues) }
}

/** Bind exact source, content and independently reviewed evidence. No arbitrary
 * approved boolean, candidate-derived report, aliases or UUID counts suffice. */
export interface ExactMeaningEvidence {
  kind: 'exact-equivalence-binding' | 'same-declared-contract-repair' | 'first-definition-binding'
  owner: string; goalId: string; sourceSha256: string; oldMeaningSha256?: string; newMeaningSha256: string
  sourcePath?: string; sourceReference?: { path: string; sha256: string; gzip?: boolean }; coverageState?: 'declared' | 'undeclared'
  protectedGoalMeanings?: Array<{ key: string; sha256: string }>
  atomicGoalKeys?: string[]; evidencePins: Array<{ path: string; sha256: string }>; rationale: string
}
export function exactMeaningEvidenceMatches(evidence: ExactMeaningEvidence, owner: string, goalId: string,
  sourceSha: string, oldMeaning: unknown, newMeaning: unknown, atoms: string[], read: (path: string) => Buffer): boolean {
  if (!evidence || newMeaning === undefined || evidence.owner !== owner || evidence.goalId !== goalId || evidence.sourceSha256 !== sourceSha
    || evidence.newMeaningSha256 !== coverageSha256(stableCoverageJson(newMeaning))
    || (oldMeaning !== undefined && evidence.oldMeaningSha256 !== coverageSha256(stableCoverageJson(oldMeaning)))
    || (evidence.atomicGoalKeys !== undefined && !same(evidence.atomicGoalKeys, atoms))
    || !evidence.rationale?.trim() || !Array.isArray(evidence.evidencePins) || evidence.evidencePins.length < 2) return false
  try { return evidence.evidencePins.every(pin => coverageSha256(read(pin.path)) === pin.sha256) } catch { return false }
}
/** First bindings are immutable input definitions, not a hash of each future
 * candidate. Verify their actual archived bytes, then compare the current
 * meaning and coverage against that fixed first contract. */
function verifiedInitialSource(binding: ExactMeaningEvidence, repoRoot: string): boolean {
  if (!binding.sourceReference) return false
  try {
    const archived = readFileSync(resolve(repoRoot, binding.sourceReference.path))
    if (coverageSha256(archived) !== binding.sourceReference.sha256) return false
    const raw = binding.sourceReference.gzip ? gunzipSync(archived) : archived
    if (coverageSha256(raw) !== binding.sourceSha256) return false
    const source = JSON.parse(raw.toString('utf8')) as SkillLandscape
    if (source.landscapeId !== binding.owner) return false
    const matches = source.goals.filter(goal => goal.id === binding.goalId)
    if (matches.length !== 1 || !matches[0].examData || (matches[0].contains?.length ?? 0) > 0
      || matches[0].type === 'cluster') return false
    const goal = matches[0]
    if (coverageSha256(stableCoverageJson(protectedAssessmentMeaning(goal, true))) !== binding.newMeaningSha256) return false
    if (!Object.hasOwn(goal.examData!, 'coveredGoalIds')) return binding.coverageState === 'undeclared'
      && binding.atomicGoalKeys === undefined && same(binding.protectedGoalMeanings, [])
    const resolved = resolveRetainedCoverage(source, goal.examData!.coveredGoalIds)
    return binding.coverageState === 'declared' && resolved.issues.length === 0
      && same(binding.atomicGoalKeys, resolved.atoms)
      && same(binding.protectedGoalMeanings, resolved.definitions.map(id => ({ key: `${source.landscapeId}:${id}`,
        sha256: coverageSha256(stableCoverageJson(protectedAssessmentMeaning(source.goals.find(goal => goal.id === id)!))),
      })))
  } catch { return false }
}

// Append-only concrete bindings are added only after exact source integration.
// Pending private candidates are deliberately not a passing baseline.
const CONCRETE_BINDINGS: readonly ExactMeaningEvidence[] = []

export function createRetainedCoverageContext(repoRoot: string, landscape: SkillLandscape,
  definitionGoalIds: readonly string[], requiredGoalIds: readonly string[], viewFiles: readonly string[], viewFrame?: ReadonlyMap<string, Buffer>): RetainedCoverageContext | undefined {
  if (landscape.landscapeId !== RETAINED_INFO_OWNER) return
  const discoveryIssues: string[] = []
  let historical: SkillLandscape = { landscapeId: RETAINED_INFO_OWNER, goals: [] } as unknown as SkillLandscape
  try {
    const checked = verifyRetainedHistory(gunzipSync(readFileSync(resolve(repoRoot, HISTORY, 'historical-informatics-source.json.gz'))),
      readFileSync(resolve(repoRoot, HISTORY, 'history-inventory.json')))
    historical = checked.landscape; discoveryIssues.push(...checked.issues)
  } catch (error) { discoveryIssues.push(`history-binding-invalid: ${String(error)}`) }
  const capture = captures.get(landscape)
  if (!capture || capture.owner !== RETAINED_INFO_OWNER) discoveryIssues.push('expected-context-missing: current source was not captured')
  const oldById = new Map(historical.goals.map(goal => [goal.id, goal]))
  const byId = new Map(landscape.goals.map(goal => [goal.id, goal]))
  const duplicateIds = sorted(landscape.goals.filter(goal => landscape.goals.filter(other => other.id.toLowerCase() === goal.id.toLowerCase()).length !== 1).map(goal => goal.id))
  const historicalGoalIds = sorted(historical.goals.filter(goal => goal.examData).map(goal => goal.id))
  const registeredFirstGoalIds = CONCRETE_BINDINGS.filter(binding => binding.kind === 'first-definition-binding').map(binding => binding.goalId)
  if (new Set(registeredFirstGoalIds).size !== registeredFirstGoalIds.length) discoveryIssues.push('incomplete-inventory: duplicate first-definition binding')
  if (CONCRETE_BINDINGS.some(binding => binding.kind === 'first-definition-binding'
    && (binding.owner !== RETAINED_INFO_OWNER || historicalGoalIds.includes(binding.goalId) || binding.goalId === INFO_HELD))) discoveryIssues.push('unbound-equivalence: invalid first-definition registry')
  const introductions = sorted([...definitionGoalIds.filter(id => !historicalGoalIds.includes(id)), ...registeredFirstGoalIds.filter(id => !historicalGoalIds.includes(id))])
  if (byId.has(INFO_HELD)) discoveryIssues.push('held-introduction: active source')
  const rows: RetainedCoverageRow[] = []
  const consumedPins: ExactMeaningEvidence[] = []
  for (const goalId of [...historicalGoalIds, ...introductions]) {
    const old = historicalGoalIds.includes(goalId) ? oldById.get(goalId) : undefined, current = byId.get(goalId)
    const declared = !!old?.examData && Object.hasOwn(old.examData, 'coveredGoalIds')
    const row: RetainedCoverageRow = { goalId, historyKind: old ? declared ? 'declared' : 'undeclared' : 'first-definition', decision: 'fail', meaningEvidence: 'exact', issues: [] }
    if (!current?.examData) row.issues.push(old || registeredFirstGoalIds.includes(goalId) ? 'missing-historical-definition' : 'current-frame-invalid')
    if (duplicateIds.includes(goalId)) row.issues.push('duplicate-definition')
    if (current && ((current.contains?.length ?? 0) > 0 || current.type === 'cluster')) row.issues.push('non-atomic-exam')
    let atoms: string[] = [], oldAtoms: string[] = [], referenced: string[] = []
    if (current?.examData && (declared || !old)) {
      if (Object.hasOwn(current.examData, 'coveredGoalIds')) {
        const resolved = resolveRetainedCoverage(landscape, current.examData.coveredGoalIds)
        atoms = resolved.atoms; row.issues.push(...resolved.issues)
      } else if (declared) row.issues.push('coverage-removed')
      if (declared) {
        const resolved = resolveRetainedCoverage(historical, old!.examData!.coveredGoalIds)
        oldAtoms = resolved.atoms; referenced = resolved.definitions; row.issues.push(...resolved.issues)
        if (atoms.some(id => !oldAtoms.includes(id))) row.issues.push('coverage-added')
        if (oldAtoms.some(id => !atoms.includes(id))) row.issues.push('coverage-removed')
        row.coverage = { historyAtomicGoalKeys: oldAtoms, currentAtomicGoalKeys: atoms }
      } else if (Object.hasOwn(current.examData, 'coveredGoalIds')) row.coverage = { currentAtomicGoalKeys: atoms }
    } else if (old && current?.examData && Object.hasOwn(current.examData, 'coveredGoalIds')) row.issues.push('undeclared-transition')
    if (old && current) {
      const oldMeaning = protectedAssessmentMeaning(old, true), newMeaning = protectedAssessmentMeaning(current, true)
      if (!same(oldMeaning, newMeaning)) {
        const binding = CONCRETE_BINDINGS.find(binding => (binding.kind === 'exact-equivalence-binding' || (declared && binding.kind === 'same-declared-contract-repair'))
          && exactMeaningEvidenceMatches(binding, RETAINED_INFO_OWNER, goalId, capture?.sha256 ?? '', oldMeaning, newMeaning, atoms,
            path => readFileSync(resolve(repoRoot, path))))
        if (binding && (!row.issues.length)) { row.meaningEvidence = `${binding.kind}:${coverageSha256(stableCoverageJson(binding))}`; consumedPins.push(binding) }
        else row.issues.push('meaning-change-unproved')
      }
      for (const id of referenced) {
        const oldGoal = oldById.get(id), newGoal = byId.get(id)
        if (!oldGoal || !newGoal || !same(protectedAssessmentMeaning(oldGoal), protectedAssessmentMeaning(newGoal))) row.issues.push(`meaning-change-unproved: ${id}`)
      }
      if (!row.issues.length) row.decision = declared ? 'declared-preserved' : 'undeclared-preserved'
    } else if (!old) {
      if (goalId === INFO_HELD) row.issues.push('held-introduction')
      else {
        const initial = CONCRETE_BINDINGS.find(binding => binding.kind === 'first-definition-binding'
          && binding.owner === RETAINED_INFO_OWNER && binding.goalId === goalId && verifiedInitialSource(binding, repoRoot))
        if (initial && current?.examData) {
          const hasCoverage = Object.hasOwn(current.examData, 'coveredGoalIds')
          if (initial.coverageState === 'undeclared' && hasCoverage) row.issues.push('undeclared-transition')
          if (initial.coverageState === 'declared') {
            const initialAtoms = initial.atomicGoalKeys!
            row.coverage = { initialAtomicGoalKeys: [...initialAtoms], currentAtomicGoalKeys: atoms }
            if (atoms.some(key => !initialAtoms.includes(key))) row.issues.push('coverage-added')
            if (initialAtoms.some(key => !atoms.includes(key))) row.issues.push('coverage-removed')
          }
          if (coverageSha256(stableCoverageJson(protectedAssessmentMeaning(current, true))) !== initial.newMeaningSha256) row.issues.push('meaning-change-unproved')
          for (const protectedGoal of initial.protectedGoalMeanings ?? []) {
            const parts = protectedGoal.key.split(':')
            const target = parts.length === 2 && parts[0] === RETAINED_INFO_OWNER ? byId.get(parts[1]) : undefined
            if (!target || coverageSha256(stableCoverageJson(protectedAssessmentMeaning(target))) !== protectedGoal.sha256) row.issues.push(`meaning-change-unproved: ${protectedGoal.key}`)
          }
        }
        const first = CONCRETE_BINDINGS.find(binding => binding.kind === 'first-definition-binding'
          && !oldById.has(goalId) && binding.sourcePath === capture?.path && verifiedInitialSource(binding, repoRoot)
          && binding.coverageState === (Object.hasOwn(current?.examData ?? {}, 'coveredGoalIds') ? 'declared' : 'undeclared')
          && (binding.coverageState !== 'declared' || (Array.isArray(binding.atomicGoalKeys) && binding.atomicGoalKeys.length > 0))
          && exactMeaningEvidenceMatches(binding, RETAINED_INFO_OWNER, goalId, binding.sourceSha256, undefined,
            current ? protectedAssessmentMeaning(current, true) : undefined, atoms, path => readFileSync(resolve(repoRoot, path)))
          && same(binding.protectedGoalMeanings, (binding.protectedGoalMeanings ?? []).map(protectedGoal => {
            const parts = protectedGoal.key.split(':')
            const target = parts.length === 2 && parts[0] === RETAINED_INFO_OWNER ? byId.get(parts[1]) : undefined
            return { key: protectedGoal.key, sha256: target ? coverageSha256(stableCoverageJson(protectedAssessmentMeaning(target))) : '' }
          })))
        if (first && row.issues.length === 0) {
          row.decision = 'first-definition-bound'; row.meaningEvidence = `first-definition-binding:${coverageSha256(stableCoverageJson(first))}`; consumedPins.push(first)
        } else if (initial) { if (!row.issues.length) row.issues.push('unbound-equivalence') }
        else row.issues.push(goalId === INFO_FIRST ? 'first-binding-pending' : 'unregistered-introduction')
      }
    }
    row.issues = sorted(row.issues); rows.push(row)
  }
  // A held reference in a view cannot be hidden by excluding it from definitions.
  const views = viewFiles.map(path => {
    try {
      const raw = viewFrame?.get(path) ?? readFileSync(path)
      const view = normalizeCompositionView(JSON.parse(raw.toString('utf8')))
      // Only authored goal references carry introduction semantics. Titles,
      // labels and metadata may discuss a held historical ID without offering it.
      // Native traversal includes both target and prerequisiteOnly assignments.
      const root = landscape.goals.find(goal => goal.tags?.includes('root'))
      const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, byId,
        root ? new Map([[landscape.landscapeId, root.id]]) : new Map())
      const references = [...roles.targetGoalIds, ...roles.prerequisiteOnlyGoalIds]
      const held = references.some(reference => {
        const parts = reference.split(':')
        if (parts.length < 1 || parts.length > 2 || parts.some(part => !part || part.trim() !== part)) return false
        const owner = parts.length === 2 ? parts[0] : view.landscapeId
        return owner.toLowerCase() === RETAINED_INFO_OWNER && parts.at(-1)!.toLowerCase() === INFO_HELD
      })
      if (held) discoveryIssues.push('held-introduction: active view')
      return { path, sha256: coverageSha256(raw) }
    }
    catch { discoveryIssues.push(`current-frame-invalid: ${path}`); return { path, sha256: '' } }
  })
  const manifest: RetainedCoverageManifest = { contractVersion: 'informatics-retained-assessment-coverage-v1', owner: RETAINED_INFO_OWNER,
    historySourceSha256: RETAINED_INFO_SOURCE_SHA, historyInventorySha256: RETAINED_INFO_INVENTORY_SHA,
    frameDigest: coverageSha256(stableCoverageJson({ source: capture ?? null, views, consumedPins, definitionGoalIds, requiredGoalIds })),
    historicalGoalIds, currentDefinitionGoalIds: [...definitionGoalIds], introductionGoalIds: introductions,
    rows, failingGoalIds: sorted(rows.filter(row => row.decision === 'fail').map(row => row.goalId)),
    discoveryIssues: sorted(discoveryIssues), status: rows.every(row => row.decision !== 'fail') && !discoveryIssues.length && historicalGoalIds.length === 24 ? 'pass' : 'fail' }
  const context = freeze({ manifest }); contexts.set(context, { owner: landscape.landscapeId, source: capture, definitions: [...definitionGoalIds], required: [...requiredGoalIds] }); return context
}
