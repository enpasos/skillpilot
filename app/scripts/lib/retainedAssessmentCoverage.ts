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
  contractVersion: 'informatics-retained-assessment-coverage-v1' | 'informatics-current-assessment-coverage-2026-11-07-v1'
  owner: string
  historySourceSha256: string
  historyInventorySha256: string
  frameDigest: string
  historicalGoalIds: string[]
  revision?: { revisionId: string; definitionSourcePath: string; initialSourceReference: { path: string; sha256: string; gzip?: boolean };
    initialInventoryReference: { path: string; sha256: string }; dataSha256: string; reviewPins: Array<{ path: string; sha256: string }> }
  retirementChecks?: Array<{ goalId: string; decision: 'retired-current-definition' | 'fail'; issues: string[] }>
  sourceMaterialFailures: { structureGoalIds: string[]; readinessGoalIds: string[] }
  currentDefinitionGoalIds: string[]
  introductionGoalIds: string[]
  rows: RetainedCoverageRow[]
  failingGoalIds: string[]
  discoveryIssues: string[]
  status: 'pass' | 'fail'
}
export interface CapturedSource { readonly path: string; readonly sha256: string; readonly owner: string }
export interface RetainedCoverageContext { readonly manifest: RetainedCoverageManifest }
export interface CurriculumSourceMaterialManifest {
  contractVersion: 'curriculum-source-assessment-material-v1'
  owner: string
  source?: CapturedSource
  frameDigest: string
  definitionGoalIds: string[]
  requiredGoalIds: string[]
  discoveryIssues: string[]
  sourceMaterialFailures: RetainedCoverageManifest['sourceMaterialFailures']
  views: Array<{ path: string; sha256: string }>
}
export interface CurriculumSourceMaterialContext { readonly manifest: CurriculumSourceMaterialManifest }
const captures = new WeakMap<object, CapturedSource>()
const contexts = new WeakMap<object, { kind: 'retained' | 'material'; discoveryIssues?: readonly string[]; owner: string; source?: CapturedSource; definitions: readonly string[]; required: readonly string[]; materialFailures: RetainedCoverageManifest['sourceMaterialFailures'] }>()
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
    if (typeof parsed.landscapeId === 'string' && Array.isArray(parsed.goals)) freeze(parsed)
  }
  return parsed as T
}
export const isTrustedRetainedCoverageContext = (value: unknown): value is RetainedCoverageContext =>
  value !== null && typeof value === 'object' && contexts.get(value)?.kind === 'retained'
export function retainedContextMatchesSource(context: unknown, source: SkillLandscape): boolean {
  if (!isTrustedRetainedCoverageContext(context)) return false
  const expected = contexts.get(context)!.source, actual = captures.get(source)
  return !!expected && !!actual && same(expected, actual)
}
export function retainedContextMatchesScope(context: unknown, owner: string, definitions: readonly string[], required: readonly string[]): boolean {
  if (!isTrustedRetainedCoverageContext(context)) return false
  const frame = contexts.get(context)!
  return frame.owner === owner && same(frame.definitions, definitions) && same(frame.required, required)
    && same(frame.materialFailures, context.manifest.sourceMaterialFailures)
}

function normalizeExamTextForInspection(value: unknown): string {
  return String(value ?? '')
    .toLocaleLowerCase('de')
    .normalize('NFKC')
    .replace(/ü/g, 'ue')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ß/g, 'ss')
    .replace(/\s+/g, ' ')
    .trim()
}

function hasExamSubtaskMarkers(normalizedTask: string): boolean {
  return /(?:\b1\.|\ba\)|\baufgabe\s+1\b|\bteilaufgabe\b)/u.test(normalizedTask)
}

function hasScoringStructure(goal: LearningGoal): boolean {
  const scoring = goal.examData?.scoring
  return !!scoring
    && Number(scoring.maxPoints) > 0
    && Number(scoring.passingPoints) > 0
    && Array.isArray(scoring.steps)
    && scoring.steps.length > 0
    && scoring.steps.every((step) =>
      !!step && typeof step.id === 'string'
      && step.id.trim().length > 0
      && Number(step.points) > 0
      && typeof step.description === 'string'
      && step.description.trim().length > 0)
}

function hasBlockingExamReviewStatus(goal: LearningGoal): boolean {
  const status = String(goal.examData?.reviewStatus ?? '').trim().toLowerCase()
  return status.length > 0 && status !== 'released'
}

function isPlaceholderExamData(goal: LearningGoal): boolean {
  if (!goal.examData) return false
  const task = normalizeExamTextForInspection(goal.examData.taskContent)
  const solution = normalizeExamTextForInspection(goal.examData.solutionContent)
  // This known boilerplate supplies no solution, regardless of task numbers
  // or subtask markers. Other text still requires substantive content review.
  if (solution === normalizeExamTextForInspection(
    'Erwartet wird eine fachlich korrekte, begründete und überprüfte Lösung, die die relevanten Kompetenzen des Abschnitts vernetzt nutzt.',
  )) return true
  if (/^eine materialgestuetzte j\d+[- ]uebungsaufgabe\b/u.test(task)) return true
  if (/^eine integrative sek[- ]i[- ]abschlussaufgabe\b/u.test(task)) return true
  if (task.includes('uebungsaufgabe verbindet') && !hasExamSubtaskMarkers(task)) return true
  return solution.startsWith('die loesung zeigt ')
    && !hasExamSubtaskMarkers(task)
    && !/\b\d+[,.]?\d*\b/u.test(task)
}

// Four independently established missing-input bodies, not a subject/ID ban.
// Review metadata is intentionally absent from this stable material fingerprint.
// New concrete material is still checked by the existing exact meaning/evidence
// contract; changing a review label cannot repair these unchanged inputs.
const KNOWN_INCOMPLETE_DB_MATERIALS: Readonly<Record<string, string>> = {
  'b86e8ab3-2c12-5b6b-b515-1e7d457c99c2': '1868fb107825df5c244488127c69fb1a75a844bd90eacb2e8f925a8c2f84f95c',
  'd13e297f-505d-576a-9a86-11ab4d7896c9': '18a92ce26b592d575294d5e7305163f7ee3032229c7f45dbc58c839fef0722d2',
  'd9892508-97b5-529e-9b9e-c4889fba2166': '581cebc5f8c3248bc6d32fd1954d88bafa2607d3641bcf9754e86710cadf83ce',
  '4e0668e3-edca-57f4-b258-df87f23d2b4e': 'd4f0ea6595865e623cd08099e986dc341012040d0fc11c28b00fabbd04c683b4',
}

export function concreteExamReadinessIssues(goal: LearningGoal, requireReadyStatus = true): string[] {
  if (!goal.examData) return ['missing examData']
  const issues: string[] = []
  const knownIncompleteMaterial = KNOWN_INCOMPLETE_DB_MATERIALS[goal.id]
  if (knownIncompleteMaterial && coverageSha256(stableCoverageJson({ taskContent: goal.examData.taskContent,
    solutionContent: goal.examData.solutionContent, scoring: goal.examData.scoring })) === knownIncompleteMaterial) {
    issues.push('missing concrete ER/schema/SQL/relational-algebra input materials')
  }
  if (requireReadyStatus && hasBlockingExamReviewStatus(goal)) {
    issues.push(`reviewStatus=${String(goal.examData.reviewStatus)}`)
  }
  if (typeof goal.examData.taskContent !== 'string' || goal.examData.taskContent.trim().length === 0) {
    issues.push('missing taskContent')
  }
  if (typeof goal.examData.solutionContent !== 'string' || goal.examData.solutionContent.trim().length === 0) {
    issues.push('missing solutionContent')
  }
  if (!hasScoringStructure(goal)) {
    issues.push('incomplete scoring')
  }
  if (isPlaceholderExamData(goal)) {
    issues.push('placeholder examData')
  }
  return issues
}

/** Ordinary curriculum material authority uses the same capture, immutable
 * context store and readiness engine, without any Informatics history policy.
 * Its scope inputs are the results of native discovery; failures are never an
 * input. A noncaptured mutable object cannot establish a passing authority. */
export function createCurriculumSourceMaterialContext(landscape: SkillLandscape,
  definitionGoalIds: readonly string[], requiredGoalIds: readonly string[], discoveryIssues: readonly string[],
  viewFiles: readonly string[], viewFrame?: ReadonlyMap<string, Buffer>): CurriculumSourceMaterialContext | undefined {
  if (landscape.landscapeId === RETAINED_INFO_OWNER) return
  const source = captures.get(landscape)
  const issues = [...discoveryIssues]
  if (!source || source.owner !== landscape.landscapeId || !Object.isFrozen(landscape)) issues.push('expected-context-missing: current source was not immutably captured')
  const byId = new Map(landscape.goals.map(goal => [goal.id, goal]))
  const failures = (ids: readonly string[], ready: boolean) => sorted(ids.filter(id => {
    const goal = byId.get(id)
    return !goal || concreteExamReadinessIssues(goal, ready).length > 0
  }))
  const sourceMaterialFailures = { structureGoalIds: failures(definitionGoalIds, false), readinessGoalIds: failures(requiredGoalIds, true) }
  const views = viewFiles.map(path => {
    try { return { path, sha256: coverageSha256(viewFrame?.get(path) ?? readFileSync(path)) } }
    catch { issues.push(`current-frame-invalid: ${path}`); return { path, sha256: '' } }
  })
  const manifest: CurriculumSourceMaterialManifest = { contractVersion: 'curriculum-source-assessment-material-v1', owner: landscape.landscapeId,
    ...(source ? { source } : {}), frameDigest: coverageSha256(stableCoverageJson({ source: source ?? null, views, definitionGoalIds, requiredGoalIds,
      discoveryIssues: sorted(issues), sourceMaterialFailures })), definitionGoalIds: [...definitionGoalIds], requiredGoalIds: [...requiredGoalIds],
    discoveryIssues: sorted(issues), sourceMaterialFailures, views }
  const context = freeze({ manifest })
  contexts.set(context, { kind: 'material', owner: landscape.landscapeId, source, definitions: [...definitionGoalIds], required: [...requiredGoalIds],
    discoveryIssues: [...discoveryIssues], materialFailures: sourceMaterialFailures })
  return context
}
export const isTrustedCurriculumSourceMaterialContext = (value: unknown): value is CurriculumSourceMaterialContext =>
  value !== null && typeof value === 'object' && contexts.get(value)?.kind === 'material'
export function sourceMaterialContextMatchesSource(context: unknown, source: SkillLandscape): boolean {
  if (!isTrustedCurriculumSourceMaterialContext(context)) return false
  const expected = contexts.get(context)!.source, actual = captures.get(source)
  return !!expected && !!actual && same(expected, actual)
}
export function sourceMaterialContextMatchesScope(context: unknown, owner: string, definitions: readonly string[], required: readonly string[], issues: readonly string[]): boolean {
  if (!isTrustedCurriculumSourceMaterialContext(context)) return false
  const frame = contexts.get(context)!
  return !!frame.source && frame.owner === owner && same(frame.definitions, definitions) && same(frame.required, required)
    && same(frame.discoveryIssues, issues) && same(frame.materialFailures, context.manifest.sourceMaterialFailures)
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

// One reviewed authoring revision at the existing canonical source identity.
// Historical fixture captures keep the immutable24 audit; the actual producer
// and independent floor capture this exact repository path. No current SHA
// allowlist: the archived SHA binds only the fixed initial definitions.
const CURRENT_INFO_SOURCE_PATH = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json'
const CURRENT_INFO_REVISION = {
  "kind": "PROPOSED single concrete owner-bound authoring revision; inert until pinned and verified by existing source reader",
  "revisionId": "informatics-current-definitions-2026-11-07-23",
  "owner": "7d51b38c-a149-5407-bddc-d2ce7878b020",
  "priorActiveSourceSha256": "85411185514af4b2ecf818807f3bd6fe5df17fb5011c5ebf8c4996de1a47817e",
  "priorHistoryInventorySha256": "3a1bf33c5dff8e310cc2ebc593a8fe61017bb34d8819a965fea0ec73a9e2f891",
  "initialSourceSha256": "50a26163a1934216727ee178f8b0d2740c2476f62482ce32911fecbf890654e8",
  "initialSourceReference": {
    "path": "contracts/curriculum-assessment-coverage/v1/informatics/revisions/2026-11-07-current23/initial-source.json.gz",
    "sha256": "5a0abd358cc2fe719a2b2a15ace63f580a3b8c18b6fe2eda12c0496c15e69eb3",
    "gzip": true
  },
  "initialInventoryReference": {
    "path": "contracts/curriculum-assessment-coverage/v1/informatics/revisions/2026-11-07-current23/current-inventory.json",
    "sha256": "031ba9480f0c4d46149647cbaedd6aea02cd1a8235c9506b3d0a1894473f767d"
  },
  "currentDefinitionGoalIds": [
    "0a16d19b-a826-5beb-b169-7a17fc7742f0",
    "0c346dc1-fdcc-5563-9154-28623d354574",
    "157e99a4-8517-5e16-92f8-8241827b7682",
    "309d4587-8080-5dd4-b329-785d9996a195",
    "3277867f-ede2-5dc4-bd76-1b03d992e9d5",
    "357fde7c-d334-50aa-be11-068ae8d832b3",
    "4e0668e3-edca-57f4-b258-df87f23d2b4e",
    "63509366-f5b2-58e5-9976-47df6f8c37e1",
    "661ec7d3-7371-5e7c-9137-4f643e6f9bf2",
    "6aa77baf-a199-5c66-b07c-8dc23439acca",
    "6ebc2a67-ea20-5c4e-8a63-635f40438d6a",
    "755d3459-44ff-5608-8c62-3a69900b9940",
    "7aec2086-2cfa-50d3-8503-b40e96ca3430",
    "8877a2e6-ebf8-5b73-a88b-56d5145a20ba",
    "893b6a69-1a1b-539b-981e-3982c52e590c",
    "a98dce49-cf4c-559b-a812-c10bff63d649",
    "b86e8ab3-2c12-5b6b-b515-1e7d457c99c2",
    "c24236b2-d783-53be-84d5-96b4f4ef8159",
    "c44643dc-39b1-5a21-8765-ab346751a184",
    "d13e297f-505d-576a-9a86-11ab4d7896c9",
    "d9892508-97b5-529e-9b9e-c4889fba2166",
    "da96fcb4-f601-5f66-9fec-12b5adc7f7f0",
    "ea2ce31f-a0c7-5102-9213-ee1db5b2d475"
  ],
  "survivingHistoricalGoalIds": [
    "0a16d19b-a826-5beb-b169-7a17fc7742f0",
    "0c346dc1-fdcc-5563-9154-28623d354574",
    "157e99a4-8517-5e16-92f8-8241827b7682",
    "4e0668e3-edca-57f4-b258-df87f23d2b4e",
    "63509366-f5b2-58e5-9976-47df6f8c37e1",
    "661ec7d3-7371-5e7c-9137-4f643e6f9bf2",
    "755d3459-44ff-5608-8c62-3a69900b9940",
    "8877a2e6-ebf8-5b73-a88b-56d5145a20ba",
    "893b6a69-1a1b-539b-981e-3982c52e590c",
    "a98dce49-cf4c-559b-a812-c10bff63d649",
    "b86e8ab3-2c12-5b6b-b515-1e7d457c99c2",
    "c44643dc-39b1-5a21-8765-ab346751a184",
    "d13e297f-505d-576a-9a86-11ab4d7896c9",
    "d9892508-97b5-529e-9b9e-c4889fba2166",
    "da96fcb4-f601-5f66-9fec-12b5adc7f7f0"
  ],
  "retiredHistoricalGoalIds": [
    "0df1bedd-5fda-5b3b-a959-c9610237bb3e",
    "1ce620dc-93cf-579c-a286-e74451d0a4d7",
    "269a561b-f12e-57b2-9b05-e20f58c9dcf6",
    "342511c3-45fb-5783-b601-906149e78c2d",
    "49ba66cf-accd-5938-a63e-f031bc786767",
    "65aa807f-f998-5648-a3a6-2e0e96dba714",
    "a5e33d4d-f312-51d2-816b-e0b10dd1e701",
    "bb651ed7-2674-580c-8916-ac5aa88d93f8",
    "ca2ff162-c71f-500f-8ce7-321ab2cf3f1f"
  ],
  "introductionGoalIds": [
    "309d4587-8080-5dd4-b329-785d9996a195",
    "3277867f-ede2-5dc4-bd76-1b03d992e9d5",
    "357fde7c-d334-50aa-be11-068ae8d832b3",
    "6aa77baf-a199-5c66-b07c-8dc23439acca",
    "6ebc2a67-ea20-5c4e-8a63-635f40438d6a",
    "7aec2086-2cfa-50d3-8503-b40e96ca3430",
    "c24236b2-d783-53be-84d5-96b4f4ef8159",
    "ea2ce31f-a0c7-5102-9213-ee1db5b2d475"
  ],
  "currentDeclaredCount": 13,
  "currentUndeclaredCount": 10,
  "reviewPins": [
    {
      "path": "qa-artifacts/ci-contract-audit/2026-11-07/informatics-current-definition-revision-plan/review-decision.json",
      "sha256": "306f474d9a8bd5a3fc79a3626a49c7409a71d968e08174d0df0a18f20667ebea"
    },
    {
      "path": "qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-source-scope-independent-review/current-informatics-cleanup-authority/authority.json",
      "sha256": "a0708d5d81ab461c54a9041d33d373d426cc5c9d46fdffe19b587e33f85e5065"
    },
    {
      "path": "qa-artifacts/ci-contract-audit/2026-11-07/informatics-e-independent-review/review-result.json",
      "sha256": "71ec7653107de3c75b87b39369358911b3813baef7b1624e26d277fa407fc05d"
    }
  ],
  "privateDiscardedNeverActiveId": "fa47a714-07c3-589b-a4e2-385a33e84c79",
  "heldStillUnintroducedId": "f37f2d37-7686-5ed7-9c20-6f83d4fd2254",
  "limits": [
    "All partition lists must be recomputed from exact archived source definitions and compared; caller JSON is not authority.",
    "Retired historical declarations stay in the original24 audit; never relabel or alias them as new births.",
    "Current source SHA is captured freshly, not tested against a pass whitelist. Immutable initial SHA binds the first contract only.",
    "Ten undeclared rows have no atomic coverage array, including no empty substitute.",
    "Four generic drafts, Own20 draft, four DB material drafts, current scope/source and graph findings remain hard failures."
  ]
} as const

// Existing finite first-definition evidence, not a caller/runtime registry.
const CONCRETE_BINDINGS: readonly ExactMeaningEvidence[] = [
  {
    "kind": "first-definition-binding",
    "owner": "7d51b38c-a149-5407-bddc-d2ce7878b020",
    "goalId": "309d4587-8080-5dd4-b329-785d9996a195",
    "sourcePath": "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json",
    "sourceReference": {
      "path": "contracts/curriculum-assessment-coverage/v1/informatics/revisions/2026-11-07-current23/initial-source.json.gz",
      "sha256": "5a0abd358cc2fe719a2b2a15ace63f580a3b8c18b6fe2eda12c0496c15e69eb3",
      "gzip": true
    },
    "sourceSha256": "50a26163a1934216727ee178f8b0d2740c2476f62482ce32911fecbf890654e8",
    "newMeaningSha256": "edc135e7a762d722cae7aec44cfc57b78e1d93dd2879841688b1a0dd3ef27b37",
    "coverageState": "declared",
    "atomicGoalKeys": [
      "7d51b38c-a149-5407-bddc-d2ce7878b020:00f23ea9-4b45-52ea-aef2-7e1314ea3b45",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:04b1796d-6086-59b0-9499-e463a7f44bc4",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:08bf5477-c346-525e-ac3c-e65f9fc64061",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:19204609-90fd-57c1-aca4-9e1a6a1fea6c",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:1d83ff25-9b5f-5bc5-9bd6-ba6218dc0aaa",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:27c7bc09-aa14-5296-aaf6-e59d278492da",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:42b52c57-426a-5868-91d1-33d0cb9d9801",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:4525b77a-02de-5ef2-8e93-dc28cc5f6644",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:4acfccb7-f38c-5fd4-b24d-b7b002373fde",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:50d82e9f-737c-5693-90fe-3d534dc8683d",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:7c909ddb-ac87-5b60-8f1c-dcc69831f401",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:859e875f-6730-5201-b8ed-60fb9374d27b",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:89dd309e-8d21-5259-a37b-d99ca572dffe",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:92f5ecc8-6d7f-50ce-99b9-080e21c894cc",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:9a6a75e7-e586-532f-91d5-92ca6159d47a",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:a2431bb5-6491-53fe-8dd3-309546a2cb97",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:a8206bfb-aaed-5502-9df1-55609f3d79b5",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:ae5ae291-aa50-5260-abf4-348a463e9974",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:bdce4bcd-f0fe-58ce-9781-39de2ade848c",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:bf23fafe-423d-561a-b832-cb25a327a508",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:c10e647b-2f51-5002-b352-830933a67214",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:d5056ca3-2a3d-5145-a28d-29038038a77f",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:de388e30-1623-5c21-9daf-1a985219da10",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:df0210bf-735b-54f8-8a1b-8dfca5598ff1",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:e05d4e40-6267-598c-8c11-8ab6420afea8",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:e382fc41-6f59-5bc5-9514-f2201a3a4c5a",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:e7e4995a-9900-5d60-ba6a-c794c70411bb",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:ef2af45a-1228-5747-ad7b-d9ba9b732786",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:ff6b67e8-dc27-5755-8dab-23ed658194fd"
    ],
    "protectedGoalMeanings": [
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:00f23ea9-4b45-52ea-aef2-7e1314ea3b45",
        "sha256": "a567eb401c866cfd08fbb51d59c370cd1c7a4d7bf9acbe0f080b5523dc242d65"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:04b1796d-6086-59b0-9499-e463a7f44bc4",
        "sha256": "4294e88301a7b64838ae86e2d9949c080b3f5395d39760a1d9cc49ccfee7329d"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:08bf5477-c346-525e-ac3c-e65f9fc64061",
        "sha256": "37a0868ebaca4974c1f605be7e8e4f733e4c90cd0921b80c91fefe9298c566f4"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:19204609-90fd-57c1-aca4-9e1a6a1fea6c",
        "sha256": "d32061cce779ef3594afcd1ac8d5d5af558ea580eda3816c093951ca639ac2f2"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:1d83ff25-9b5f-5bc5-9bd6-ba6218dc0aaa",
        "sha256": "555b4288be1532cb6d0b7870c0d45b37f9b853105cc4699ccf22f95ab2eab833"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:27c7bc09-aa14-5296-aaf6-e59d278492da",
        "sha256": "b8df38b90a1e924c5654506ab8c4bed18c819b8a23dbfc30ec5fe891582cfaff"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:42b52c57-426a-5868-91d1-33d0cb9d9801",
        "sha256": "4f91a4e62918fe61852e2517b6a1a7f694ae540055549244464b94dc0c73064a"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:4525b77a-02de-5ef2-8e93-dc28cc5f6644",
        "sha256": "dd7846b568b28155dee7672c0bf745c2f3839dfc12b4214434fa5d3845a1e32f"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:4acfccb7-f38c-5fd4-b24d-b7b002373fde",
        "sha256": "ce9f9597eda5761ffd2250000e65fac1f8c6810dc51d6fc3cbb4b61c0deff67e"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:50d82e9f-737c-5693-90fe-3d534dc8683d",
        "sha256": "45dff030d295723b58fd41e997ba418f1fa140b75a0c9e6e1d704b3b3632a66c"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:7c909ddb-ac87-5b60-8f1c-dcc69831f401",
        "sha256": "609e25355a21d484528b5b3f803aa15ca0c9ddfa7aa2d2aabfcb364ddc6451a1"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:859e875f-6730-5201-b8ed-60fb9374d27b",
        "sha256": "f2da77ddaac8f954acdc93478570d7d6058f5d758f4e10b285e50c2e00cadefd"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:89dd309e-8d21-5259-a37b-d99ca572dffe",
        "sha256": "876bcae7a8312419150bdb73521caee1c0183a8d05ad1121a04c70e64d232521"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:92f5ecc8-6d7f-50ce-99b9-080e21c894cc",
        "sha256": "7476c750c008854395f2707bdb5633259934dabc0257946d8806cc500d3969d0"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:9a6a75e7-e586-532f-91d5-92ca6159d47a",
        "sha256": "7f31242075c4173ceeb4b0fcc8951ceddbd41fd0e9760a6b85e328d50aea6070"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:a2431bb5-6491-53fe-8dd3-309546a2cb97",
        "sha256": "0db3439e13fc4c14aafbc20233ede475fb3e709a307f6ca0d41f8aa84f0246fd"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:a8206bfb-aaed-5502-9df1-55609f3d79b5",
        "sha256": "4813cf4a05f533029b10f870025a6d26e3f6ada2bfdd0238889b8ce69f00d402"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:ae5ae291-aa50-5260-abf4-348a463e9974",
        "sha256": "70b7dc65abc792001c7a8b0efa88aece31537e945f528a506bb8923171f868b1"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:bdce4bcd-f0fe-58ce-9781-39de2ade848c",
        "sha256": "71154a3b02c5e2fb9021a85f49c088b7d5c0e8af9f66a406dd0d2d4d97ddb2f6"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:bf23fafe-423d-561a-b832-cb25a327a508",
        "sha256": "9a4930522fdaa11f328ac65c26b19797b85bdfb3ce6a935c06cc851cd208d138"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:c10e647b-2f51-5002-b352-830933a67214",
        "sha256": "60663b4e48077f407fe75a36fb64ec26a1980a807660b5243ab7e1213e9bded9"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:d5056ca3-2a3d-5145-a28d-29038038a77f",
        "sha256": "cb1d0bf026ac2c93609805c7eba1a951c10b97c84b843874676aef8f5b80ff93"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:de388e30-1623-5c21-9daf-1a985219da10",
        "sha256": "fe97dce6e98acb32389abe307d6e0ac4a7189c95892d0cad1eb10743d83da104"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:df0210bf-735b-54f8-8a1b-8dfca5598ff1",
        "sha256": "d3e8c17e8fd73b9c8d2d37c5662fdeb66cc63be37b0cb36a2c180e2389e072ab"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:e05d4e40-6267-598c-8c11-8ab6420afea8",
        "sha256": "a53397494e48b6fffa7fc4beb1d9571e51ff40621cf7eff80247ade5fc962899"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:e382fc41-6f59-5bc5-9514-f2201a3a4c5a",
        "sha256": "96fe66245d80f8e2cd676f79f3d9feb243b3e7739e5d03035dcb5788fdcb41fc"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:e7e4995a-9900-5d60-ba6a-c794c70411bb",
        "sha256": "cd53e54d1cf6de26b5c78f9b1bad86b4ca9f415036fa6fe641b9d8964fdc4f5d"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:ef2af45a-1228-5747-ad7b-d9ba9b732786",
        "sha256": "7948a0f65a51966d7f74893cd53cda19952bfe5337cbb510d390c4dd44303ed7"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:ff6b67e8-dc27-5755-8dab-23ed658194fd",
        "sha256": "7bbc96810cdb27945236ebf1776d465628203f97c3d18c719ccecb8f2ec0c98b"
      }
    ],
    "evidencePins": [
      {
        "path": "qa-artifacts/ci-contract-audit/2026-11-07/informatics-current-definition-revision-plan/review-decision.json",
        "sha256": "306f474d9a8bd5a3fc79a3626a49c7409a71d968e08174d0df0a18f20667ebea"
      },
      {
        "path": "qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-source-scope-independent-review/current-informatics-cleanup-authority/authority.json",
        "sha256": "a0708d5d81ab461c54a9041d33d373d426cc5c9d46fdffe19b587e33f85e5065"
      }
    ],
    "rationale": "Prospective current authored identity absent from the immutable active historical24 snapshot; exact initial definition and declared coverage independently compared. No predecessor result or retrospective competence is transferred. This technical binding does not grant material readiness, official scope or maturity; existing draft/placeholder/source/scope holds remain hard failures."
  },
  {
    "kind": "first-definition-binding",
    "owner": "7d51b38c-a149-5407-bddc-d2ce7878b020",
    "goalId": "3277867f-ede2-5dc4-bd76-1b03d992e9d5",
    "sourcePath": "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json",
    "sourceReference": {
      "path": "contracts/curriculum-assessment-coverage/v1/informatics/revisions/2026-11-07-current23/initial-source.json.gz",
      "sha256": "5a0abd358cc2fe719a2b2a15ace63f580a3b8c18b6fe2eda12c0496c15e69eb3",
      "gzip": true
    },
    "sourceSha256": "50a26163a1934216727ee178f8b0d2740c2476f62482ce32911fecbf890654e8",
    "newMeaningSha256": "95520e74b502c7bc97a5077c92a8a85e14178c75677960c094a71c17d787b475",
    "coverageState": "declared",
    "atomicGoalKeys": [
      "7d51b38c-a149-5407-bddc-d2ce7878b020:004cf04d-f0d2-5673-a8a9-5973e51a039f",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:0515f5f1-22bb-5164-9af0-e84d8137085a",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:06999c9f-1c52-5284-adb4-bcd459ba14bf",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:081a6bf9-5bb1-5b90-b264-9d8d55637674",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:10a3b2a3-8c1c-4dfb-9d48-8f67f2c0004d",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:18691bbb-b996-57a6-9f91-8ff54acabbce",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:200ff84a-3158-5d2f-b065-36b77ea99ef1",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:21ce0c27-45fc-53c9-a8f2-161cc052f944",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:36725b54-fd0c-5b24-bf2f-399491562718",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:37c8a3b4-0f48-5836-b852-b4b4a3c91709",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:37e57f89-22d8-5565-b9a4-cce151b209a1",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:3e3264d6-8cf8-55f9-b085-1aa4a7865476",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:3f619eed-1049-53e2-af7e-7fc5ad6c0cfc",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:53c7f69f-1956-518f-8349-4029edee268d",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:5dbd950e-f7dc-5556-ba6d-b365b82dac01",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:67db0729-63ff-569c-84a6-cc0a559c5ada",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:7ad8caf0-3a31-56f1-bee1-574c01b0c156",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:7b491c6e-a03a-57bf-947d-a4a4f60785b4",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:7f41d0a1-19cb-5e08-be07-185a2c9d6bb5",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:871de3d3-4ff4-52bd-aeb7-b30dfdd72336",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:8835e942-93fd-51ba-bf11-e7cc65502ae6",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:88a8e785-dba3-5d69-9692-4cd32bdc3197",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:8f89ef67-f521-5eab-919b-e74f59f3178b",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:97f80e26-bc3b-5808-8c62-f114ae9ee143",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:baa4be56-45d0-539a-a810-113392bdaa23",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:c6fcb2d9-27ae-54d9-a3e1-bbbeb18f3565",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:cc1ffac9-5d27-5011-a159-4a72227ece5f",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:cdb24f8f-3596-5e68-a44f-9d651c7eed62",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:d6eb4c08-4994-5853-b2ba-f07a01ea823c",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:deea09c2-474e-5c3d-bd6b-ced143df8070",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:e14dc7c6-002b-5da0-af1c-507b6355ccb0",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:e7f0dec3-3d78-551b-8770-c182670eee6d",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:e7fb0601-4207-4bd8-8c40-1f544590b855",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:eb4b3d2b-6756-5d88-97de-c404793003d4",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:fbd4561a-573e-5f8c-b363-338ee9774b5c"
    ],
    "protectedGoalMeanings": [
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:004cf04d-f0d2-5673-a8a9-5973e51a039f",
        "sha256": "1ff3f6c511ed7042c6f270d387f096266b192ccb4f450a3a0c18545d8dc10191"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:0515f5f1-22bb-5164-9af0-e84d8137085a",
        "sha256": "7f414d2b20ae456628935b38af09818fb1e2062a583bd228700ce085efcb169f"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:06999c9f-1c52-5284-adb4-bcd459ba14bf",
        "sha256": "2c1c11d52b20a689a8dfe516febae731babffb7c177dff5503caaf434ad88e44"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:081a6bf9-5bb1-5b90-b264-9d8d55637674",
        "sha256": "06dcca8a2798218fd01269859485254b87a4ab59b9af35b1fc2fe67dcf8ffaf3"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:10a3b2a3-8c1c-4dfb-9d48-8f67f2c0004d",
        "sha256": "6f20684bd26f6c6cb827b3d126f5d02ff09d5652151aab7a4c307168efb6fd63"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:18691bbb-b996-57a6-9f91-8ff54acabbce",
        "sha256": "052a59dd98606d8703d0bf77f73ff8cf79fecfbe24347efda436b4bb76f30d4f"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:200ff84a-3158-5d2f-b065-36b77ea99ef1",
        "sha256": "74f73d99fbf3c9671b0010bd616acf0e078e8d4562f549cebddc8652791c25ae"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:21ce0c27-45fc-53c9-a8f2-161cc052f944",
        "sha256": "330514d69e79daae117f385967442bbd161a11ed34b1b3c8466d88f3734d1d41"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:36725b54-fd0c-5b24-bf2f-399491562718",
        "sha256": "eda03d9b6e575f4c7fe7fccbb7cf054b785ccb8d083dabd1859db929044afecb"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:37c8a3b4-0f48-5836-b852-b4b4a3c91709",
        "sha256": "50642c00fc25573add57347de9020bf9c64f98856a22ccf558482c192a109162"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:37e57f89-22d8-5565-b9a4-cce151b209a1",
        "sha256": "e6d57033c259ae9ffdf9251360e60d771e8b49c06d5270cf3710fa13b7f5be99"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:3e3264d6-8cf8-55f9-b085-1aa4a7865476",
        "sha256": "18aba8298dbe5120d4366c27b6bd8691c8f894963e3b24ceb2e3faf87b89f808"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:3f619eed-1049-53e2-af7e-7fc5ad6c0cfc",
        "sha256": "7399cbf3307f96e2dbe2664c007c22a0f1924962d50459180fe00fa335b4465a"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:53c7f69f-1956-518f-8349-4029edee268d",
        "sha256": "2ec93879f7a90c14fc10ef999fcc31582f17b847153701a5633bce3d33c7b86c"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:5dbd950e-f7dc-5556-ba6d-b365b82dac01",
        "sha256": "340c334f8b994c482b18b9a0e05929084aec9e8f92b1feb2d61ccfcddcd08c97"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:67db0729-63ff-569c-84a6-cc0a559c5ada",
        "sha256": "8c86d39b09e41e8770779a2d56f48a2ab9ff11ea08aecb194c81fa58404ba581"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:7ad8caf0-3a31-56f1-bee1-574c01b0c156",
        "sha256": "01bcc67939fc73ca17885ffcccea4cb4fcd5fd87527c59b68d4e0bac9a805ad7"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:7b491c6e-a03a-57bf-947d-a4a4f60785b4",
        "sha256": "bdaaafe1d7db3530bfd07fb7eb916d937e424326fa7833e824060275207f2e47"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:7f41d0a1-19cb-5e08-be07-185a2c9d6bb5",
        "sha256": "1d9c062468a8c73a74e49840fb92c4468c58008c16664089800ae4ceff593e4a"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:871de3d3-4ff4-52bd-aeb7-b30dfdd72336",
        "sha256": "efdfaa2b4940c99d970343a4a512c046a64cbf51e487f29843573f4dd0db0ce5"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:8835e942-93fd-51ba-bf11-e7cc65502ae6",
        "sha256": "e308377de18643fd452efcae5ff33f58c00fa4f0b4e74c8228212e8937c0db73"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:88a8e785-dba3-5d69-9692-4cd32bdc3197",
        "sha256": "e43e669163dac5b1ffbd1029f096c86a18d0ec1f21a2bfd9f2fd88a9cb9085fe"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:8f89ef67-f521-5eab-919b-e74f59f3178b",
        "sha256": "88bc3553f5d740a10f9e78dcd26dc95a6722779aff9f93b2e9fb20f321367486"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:97f80e26-bc3b-5808-8c62-f114ae9ee143",
        "sha256": "8023195edd342e670ffafea598fb7d0d4f0d85057b51e1c5dae77789dff89304"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:baa4be56-45d0-539a-a810-113392bdaa23",
        "sha256": "1f2f1d4fc42a2d1b3ff2ab63f7abe958481bdeda0328e0289d7e2c8a462c1e32"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:c6fcb2d9-27ae-54d9-a3e1-bbbeb18f3565",
        "sha256": "5adf440e3073551442cc49b0a07e355b1b3cff122de4b041de266d283a323ae8"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:cc1ffac9-5d27-5011-a159-4a72227ece5f",
        "sha256": "5b64804ed1d5c5eef5a554fa14bf46c1a7bc98acf6dcccb7b1f66f7fbd8b468e"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:cdb24f8f-3596-5e68-a44f-9d651c7eed62",
        "sha256": "97137184d4d686f42c4711f9511e104e50454609d24a06b7adf19f3c985d7d52"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:d6eb4c08-4994-5853-b2ba-f07a01ea823c",
        "sha256": "4759cbee0cf45599b34515635272ffa5d810f41c51312b4eedd5c459156fee68"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:deea09c2-474e-5c3d-bd6b-ced143df8070",
        "sha256": "97d5c484ba9e8313ee03423481ff9ed17f896889c997221bcc98e253b419a5d5"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:e14dc7c6-002b-5da0-af1c-507b6355ccb0",
        "sha256": "365ff595d7feb6fc083e188b8f906d3c8928c9a0ea4b1b6b010a9689fdbf99d4"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:e7f0dec3-3d78-551b-8770-c182670eee6d",
        "sha256": "a15126579dacfdccba305b6978b4a117124f2b54509c88b444c1ca09f746bd98"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:e7fb0601-4207-4bd8-8c40-1f544590b855",
        "sha256": "f864c4eb44a62455eba1a17dcd26d3e86ff1f7a30769eb28fa2e57a17f3007ca"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:eb4b3d2b-6756-5d88-97de-c404793003d4",
        "sha256": "c961310a91f1a717f3d7e65cf0d48ea9e39357b989f8f78efbae19897ab9b9ec"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:fbd4561a-573e-5f8c-b363-338ee9774b5c",
        "sha256": "cca5a7c2953330195e0bef89cfa4b58c7c514af6bbaaff996b1569aa88caa4f9"
      }
    ],
    "evidencePins": [
      {
        "path": "qa-artifacts/ci-contract-audit/2026-11-07/informatics-current-definition-revision-plan/review-decision.json",
        "sha256": "306f474d9a8bd5a3fc79a3626a49c7409a71d968e08174d0df0a18f20667ebea"
      },
      {
        "path": "qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-source-scope-independent-review/current-informatics-cleanup-authority/authority.json",
        "sha256": "a0708d5d81ab461c54a9041d33d373d426cc5c9d46fdffe19b587e33f85e5065"
      }
    ],
    "rationale": "Prospective current authored identity absent from the immutable active historical24 snapshot; exact initial definition and declared coverage independently compared. No predecessor result or retrospective competence is transferred. This technical binding does not grant material readiness, official scope or maturity; existing draft/placeholder/source/scope holds remain hard failures."
  },
  {
    "kind": "first-definition-binding",
    "owner": "7d51b38c-a149-5407-bddc-d2ce7878b020",
    "goalId": "357fde7c-d334-50aa-be11-068ae8d832b3",
    "sourcePath": "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json",
    "sourceReference": {
      "path": "contracts/curriculum-assessment-coverage/v1/informatics/revisions/2026-11-07-current23/initial-source.json.gz",
      "sha256": "5a0abd358cc2fe719a2b2a15ace63f580a3b8c18b6fe2eda12c0496c15e69eb3",
      "gzip": true
    },
    "sourceSha256": "50a26163a1934216727ee178f8b0d2740c2476f62482ce32911fecbf890654e8",
    "newMeaningSha256": "bbc3e75548f47a963280ef826b6f041ed2f591f11ab2221023deb4824907d9c7",
    "coverageState": "declared",
    "atomicGoalKeys": [
      "7d51b38c-a149-5407-bddc-d2ce7878b020:01cd4048-8ce2-5167-bfa6-f3cb042c84f1",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:170a6edb-64af-5bb5-a59d-69b6ac5ee7e8",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:17a72609-a619-52e7-a154-67b714826e74",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:325661fb-1df9-54d1-8fca-e651c94483f1",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:3b98d9f8-b63e-53b6-b447-3881a95e4841",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:42467606-f969-5bd7-bfc8-114c4853ecad",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:5f48f0bb-a1a6-588e-a498-fab20245efcd",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:5f6fb041-835b-51b1-aea9-6c42fee54e69",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:70b8919e-8707-580f-9e13-0536c9e81476",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:82911b58-bd79-5e96-8fcc-2adb029e2f70",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:9ab554ad-c308-50ed-a5d2-499dd06120ff",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:a93357e9-5e5b-57c5-98d2-35404a6e6e56",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:ca39fae0-1b12-5982-a453-54d12602dde8",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:d3adb904-ee7e-503b-b67b-c2a65497cb3b",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:d6577123-0842-520e-b039-8ac72ab507b6",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:e6b07eba-a0dd-5cbf-aed0-1c1259d21a7f",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:e9b74953-2c4c-553c-aa2c-eca278f336ed",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:e9f348d8-300e-5101-b7f1-3ba00ff969a1",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:feb50fce-1dad-5a48-8ff3-c9737d507843"
    ],
    "protectedGoalMeanings": [
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:01cd4048-8ce2-5167-bfa6-f3cb042c84f1",
        "sha256": "666080e7dc44300003eb5534b74611c0033c3acff46c4be6529e77f91325c005"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:170a6edb-64af-5bb5-a59d-69b6ac5ee7e8",
        "sha256": "ef1269ba8776f0f29fb8fb29b8f407d05a24e67d78820d1927b446467da1238d"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:17a72609-a619-52e7-a154-67b714826e74",
        "sha256": "bb6fe3d91f355ad8bf49fb8ff470276daea76f2feae505bcb6d4c8cf1e73cd9c"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:325661fb-1df9-54d1-8fca-e651c94483f1",
        "sha256": "f07a59d1fea059c636b59bd9165f3619c19ec9ab33f50f4036e93c3744ab74a1"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:3b98d9f8-b63e-53b6-b447-3881a95e4841",
        "sha256": "40e5933e13c5716fb4164be108a4b5a4b87dcb99655da8128cb4d4c887ea58f5"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:42467606-f969-5bd7-bfc8-114c4853ecad",
        "sha256": "78657072944d68c260da859239c64c4fb4847bd6eda0517091939aea6af13cb4"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:5f48f0bb-a1a6-588e-a498-fab20245efcd",
        "sha256": "605c30e978969d852ba5b0fe76e9243f240088eadeada736d47d5abe2856228c"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:5f6fb041-835b-51b1-aea9-6c42fee54e69",
        "sha256": "7db37ac8e01b02e5b6e897880de871236cf8070b6821a90947db72e9dc5d0a55"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:70b8919e-8707-580f-9e13-0536c9e81476",
        "sha256": "aeef23b947fddb2e12f1cd4658f04d41a1d66c982c34506093688fa0dba007c0"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:82911b58-bd79-5e96-8fcc-2adb029e2f70",
        "sha256": "fe99190397028243fb756edc3086298f39c4a880ebc085a0b97ee0d33dda5545"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:9ab554ad-c308-50ed-a5d2-499dd06120ff",
        "sha256": "19ed63f982887f5c848c32e499e416f507dde6dfded9b228fc0622597db43d09"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:a93357e9-5e5b-57c5-98d2-35404a6e6e56",
        "sha256": "3f633d0702c0ccad83b559fd98adc51436ac58c0f081b4c95ea076042e1191df"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:ca39fae0-1b12-5982-a453-54d12602dde8",
        "sha256": "cdb909f456186eb52d5eb4e5638f905dcb8a1f2444752ac868bbf1ef0dba6829"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:d3adb904-ee7e-503b-b67b-c2a65497cb3b",
        "sha256": "83c05672d729478ffe50e30be366290c8928a4a58779309701870af9e5c841a3"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:d6577123-0842-520e-b039-8ac72ab507b6",
        "sha256": "1991675fdc80911d8548b825bcfe6a34bf5e363c76d27601ae802d16c421ffa1"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:e6b07eba-a0dd-5cbf-aed0-1c1259d21a7f",
        "sha256": "ec956d4fb6b6ee571035963b6b5959d29c8a56cca631bd765b7a24f02306b1a9"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:e9b74953-2c4c-553c-aa2c-eca278f336ed",
        "sha256": "88a3e3bae3ded246f38b98979311dbc711a1567119d5ad81875f4775151df8c0"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:e9f348d8-300e-5101-b7f1-3ba00ff969a1",
        "sha256": "849514b00db48e8bf1354f03a56bec7be6792aeaa2244520b3b0d892d646037a"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:feb50fce-1dad-5a48-8ff3-c9737d507843",
        "sha256": "d51bb6982f5cfdecabff96e37f9b10e0d6d638df0b1faac93056e69cfb6d2c2e"
      }
    ],
    "evidencePins": [
      {
        "path": "qa-artifacts/ci-contract-audit/2026-11-07/informatics-current-definition-revision-plan/review-decision.json",
        "sha256": "306f474d9a8bd5a3fc79a3626a49c7409a71d968e08174d0df0a18f20667ebea"
      },
      {
        "path": "qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-source-scope-independent-review/current-informatics-cleanup-authority/authority.json",
        "sha256": "a0708d5d81ab461c54a9041d33d373d426cc5c9d46fdffe19b587e33f85e5065"
      }
    ],
    "rationale": "Prospective current authored identity absent from the immutable active historical24 snapshot; exact initial definition and declared coverage independently compared. No predecessor result or retrospective competence is transferred. This technical binding does not grant material readiness, official scope or maturity; existing draft/placeholder/source/scope holds remain hard failures."
  },
  {
    "kind": "first-definition-binding",
    "owner": "7d51b38c-a149-5407-bddc-d2ce7878b020",
    "goalId": "6aa77baf-a199-5c66-b07c-8dc23439acca",
    "sourcePath": "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json",
    "sourceReference": {
      "path": "contracts/curriculum-assessment-coverage/v1/informatics/revisions/2026-11-07-current23/initial-source.json.gz",
      "sha256": "5a0abd358cc2fe719a2b2a15ace63f580a3b8c18b6fe2eda12c0496c15e69eb3",
      "gzip": true
    },
    "sourceSha256": "50a26163a1934216727ee178f8b0d2740c2476f62482ce32911fecbf890654e8",
    "newMeaningSha256": "c4f215aa1fbc76cbd574631551c02c80ef43534ef19cc1eb7e6df19711271fe7",
    "coverageState": "declared",
    "atomicGoalKeys": [
      "7d51b38c-a149-5407-bddc-d2ce7878b020:18317e31-71f7-4e4a-b18c-f61e2b25769d",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:2aaefe0b-3e56-477e-94f0-bb05fa035ed5",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:5961bae4-87c0-52a3-b9cc-56a71b0d5abb",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:5ca1960e-6b02-5679-b271-043a5c29b189",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:8f1a342c-5976-5473-b0ee-c0180afd5861",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:a45e73d2-db0d-50b0-a984-44a5315474ce",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:d5914986-fba8-56cc-99be-d9560ac7666d"
    ],
    "protectedGoalMeanings": [
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:18317e31-71f7-4e4a-b18c-f61e2b25769d",
        "sha256": "eacd24d9a984206d9a60b6f33029c5a4f868e31e3627e0c40dc658d38f43b845"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:2aaefe0b-3e56-477e-94f0-bb05fa035ed5",
        "sha256": "1656d7bcae16e25bbe0172b32d5479a5049f2382a70624d27c4f2327448f57c1"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:5961bae4-87c0-52a3-b9cc-56a71b0d5abb",
        "sha256": "83c664c8dbb98e1b14bad2efac61fc999432bf36deb347692ec631e920862442"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:5ca1960e-6b02-5679-b271-043a5c29b189",
        "sha256": "7640b1fddab375f8e733865df879c7a7b3b8d3233f904aa63a6068ad72311e8c"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:8f1a342c-5976-5473-b0ee-c0180afd5861",
        "sha256": "ccc63ce535444b38f5e43f5dbce4d88aab23d325e8aa911e4b4dcd6c010a5997"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:a45e73d2-db0d-50b0-a984-44a5315474ce",
        "sha256": "801277cb94640a3e0aee0037629d7707e186560ca85b10953c13388343fa8076"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:d5914986-fba8-56cc-99be-d9560ac7666d",
        "sha256": "39bf98334ccbad50aa8227f225e65f47631ee97e9e398997c0791de419adb3c5"
      }
    ],
    "evidencePins": [
      {
        "path": "qa-artifacts/ci-contract-audit/2026-11-07/informatics-current-definition-revision-plan/review-decision.json",
        "sha256": "306f474d9a8bd5a3fc79a3626a49c7409a71d968e08174d0df0a18f20667ebea"
      },
      {
        "path": "qa-artifacts/ci-contract-audit/2026-11-07/informatics-e-independent-review/review-result.json",
        "sha256": "71ec7653107de3c75b87b39369358911b3813baef7b1624e26d277fa407fc05d"
      }
    ],
    "rationale": "Prospective current authored identity absent from the immutable active historical24 snapshot; exact initial definition and declared coverage independently compared. No predecessor result or retrospective competence is transferred. This technical binding does not grant material readiness, official scope or maturity; existing draft/placeholder/source/scope holds remain hard failures."
  },
  {
    "kind": "first-definition-binding",
    "owner": "7d51b38c-a149-5407-bddc-d2ce7878b020",
    "goalId": "6ebc2a67-ea20-5c4e-8a63-635f40438d6a",
    "sourcePath": "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json",
    "sourceReference": {
      "path": "contracts/curriculum-assessment-coverage/v1/informatics/revisions/2026-11-07-current23/initial-source.json.gz",
      "sha256": "5a0abd358cc2fe719a2b2a15ace63f580a3b8c18b6fe2eda12c0496c15e69eb3",
      "gzip": true
    },
    "sourceSha256": "50a26163a1934216727ee178f8b0d2740c2476f62482ce32911fecbf890654e8",
    "newMeaningSha256": "2a70e62dec12efde2a864a40afbd7c99e5a52df37a94be9b6a1f7aec8836d1b3",
    "coverageState": "declared",
    "atomicGoalKeys": [
      "7d51b38c-a149-5407-bddc-d2ce7878b020:0421e39b-1b35-5897-bbf8-38a75e4d221e",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:0cfb39a2-985f-55ba-b2b3-e667d07f48d3",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:13be8508-9eb3-510d-bd5c-4ba4efcc2589",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:2cf7589d-5451-5239-badf-1ebb981a2f20",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:2d1021d7-aa6a-520d-a56e-19a8305db9f3",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:42ad3e11-9e31-5e15-b65c-b611ce1537ce",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:46b4ebba-dbaf-5f5e-be48-7a1dd72bd471",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:58173dab-0cb2-52ae-a052-63d3a0f33644",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:58180f3b-3cf7-577d-b2ff-d9066ef481f5",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:5c6ba0c6-5b7a-512f-8c19-739b20473639",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:71fe327a-9677-5348-a405-fba0dbd302d7",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:7a9fdfe7-a806-5a31-b276-0da27a4617fc",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:9a4967d2-09dd-5712-926c-4ea8c5b8f1fa",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:b5926cbc-4bd6-589d-987e-ba468ccebc69",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:b855c123-cd28-5d6c-9485-4852d01bc5eb",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:de3af5ce-344c-5e04-a081-4c2904eb9fad",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:e00b6124-ce32-5fc9-8a52-f16d4283c16d",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:e67e06e6-cfd6-5251-b060-5aa81092d14c",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:fd1f5c79-20e6-5829-98c1-0909e047cad4",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:fdfa87be-06ca-5c54-9950-d8408dba8e38"
    ],
    "protectedGoalMeanings": [
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:0421e39b-1b35-5897-bbf8-38a75e4d221e",
        "sha256": "91ed95b198a8102c16fdb6953cd8d2837b7239c7f5e6e5f0b09c20a7b5cfda1c"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:0cfb39a2-985f-55ba-b2b3-e667d07f48d3",
        "sha256": "11a6322d8bc8114b941f9821f7ae6c65c78379b3c53b492cf0b9c28288f1531b"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:13be8508-9eb3-510d-bd5c-4ba4efcc2589",
        "sha256": "ec9c0c7990639c8947e3ee647adea799654638757f56cd77d8cdfdd8fb045a51"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:2cf7589d-5451-5239-badf-1ebb981a2f20",
        "sha256": "a6b5b3bd96dd7fe72dd869d9593f75449abadec3ed76dbf15268303f478b9376"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:2d1021d7-aa6a-520d-a56e-19a8305db9f3",
        "sha256": "7b2aab13190d02840dda4a5bfa354b9d140b9c79c72157306b47918d51f17a55"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:42ad3e11-9e31-5e15-b65c-b611ce1537ce",
        "sha256": "b0c5feca0298478d82f9b46552a29ae58af87201c6c2dd4b5478f3dcb8a41d1b"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:46b4ebba-dbaf-5f5e-be48-7a1dd72bd471",
        "sha256": "7879472a7599cc535239b8fe0872a001d00a0093533ed2a9d2d6aa7a8f2d6144"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:58173dab-0cb2-52ae-a052-63d3a0f33644",
        "sha256": "77513a47361a7ccc9e4de8fcb32b6eb37d62618a7613ac3adf9c7776e3f4c40f"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:58180f3b-3cf7-577d-b2ff-d9066ef481f5",
        "sha256": "196269196c3ddfdbf14183bc166054f5ae4b4c07039da937a6363546fd53bed0"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:5c6ba0c6-5b7a-512f-8c19-739b20473639",
        "sha256": "8f7f27b625df87951c9189f2ebafcc6d94018f4204390ca9c6d99947766ffd3e"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:71fe327a-9677-5348-a405-fba0dbd302d7",
        "sha256": "df94ffdc75243246530522c6c7bd008d489206a1ec5f937534d6cab0f5c32bf4"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:7a9fdfe7-a806-5a31-b276-0da27a4617fc",
        "sha256": "a58aa0786d1e8e591caf9987f204ae0ac47ed8a9a1599ea2e38d1f4324576b9b"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:9a4967d2-09dd-5712-926c-4ea8c5b8f1fa",
        "sha256": "76bfd3fe14bff56de7a9b8e49aba160d2e686687bd501d24f7c2c3979ae141a9"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:b5926cbc-4bd6-589d-987e-ba468ccebc69",
        "sha256": "4c68b87db89b6db0ecdc56afa89ac39b1c46d6232a97bc423ab66199cb71a875"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:b855c123-cd28-5d6c-9485-4852d01bc5eb",
        "sha256": "b70628d786efab5929862888c16057a15cd5f352b9fe3bc1ece86a5df53ff021"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:de3af5ce-344c-5e04-a081-4c2904eb9fad",
        "sha256": "5b3e16dd2904157aa55e29042d1e04a28ccf4f289a9a3f1208375ad9cb788858"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:e00b6124-ce32-5fc9-8a52-f16d4283c16d",
        "sha256": "fbf38b678e67ad0d946e1932bfb04528fe7fcd2a6fbfbdcb8ca7c921874349bf"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:e67e06e6-cfd6-5251-b060-5aa81092d14c",
        "sha256": "0bea7c083dc4d7d2af27233a4131567220f05aaa29579374fc61e5f2a695b026"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:fd1f5c79-20e6-5829-98c1-0909e047cad4",
        "sha256": "54d190b3faf19fe70b4740b3bc4814191c289af9cc4d2aa34c90a0500cb73829"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:fdfa87be-06ca-5c54-9950-d8408dba8e38",
        "sha256": "5887ed29bb5d41f6af0abef094a09d7ae2bae0a0680f2b21a839595dbbd91214"
      }
    ],
    "evidencePins": [
      {
        "path": "qa-artifacts/ci-contract-audit/2026-11-07/informatics-current-definition-revision-plan/review-decision.json",
        "sha256": "306f474d9a8bd5a3fc79a3626a49c7409a71d968e08174d0df0a18f20667ebea"
      },
      {
        "path": "qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-source-scope-independent-review/current-informatics-cleanup-authority/authority.json",
        "sha256": "a0708d5d81ab461c54a9041d33d373d426cc5c9d46fdffe19b587e33f85e5065"
      }
    ],
    "rationale": "Prospective current authored identity absent from the immutable active historical24 snapshot; exact initial definition and declared coverage independently compared. No predecessor result or retrospective competence is transferred. This technical binding does not grant material readiness, official scope or maturity; existing draft/placeholder/source/scope holds remain hard failures."
  },
  {
    "kind": "first-definition-binding",
    "owner": "7d51b38c-a149-5407-bddc-d2ce7878b020",
    "goalId": "7aec2086-2cfa-50d3-8503-b40e96ca3430",
    "sourcePath": "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json",
    "sourceReference": {
      "path": "contracts/curriculum-assessment-coverage/v1/informatics/revisions/2026-11-07-current23/initial-source.json.gz",
      "sha256": "5a0abd358cc2fe719a2b2a15ace63f580a3b8c18b6fe2eda12c0496c15e69eb3",
      "gzip": true
    },
    "sourceSha256": "50a26163a1934216727ee178f8b0d2740c2476f62482ce32911fecbf890654e8",
    "newMeaningSha256": "08cda778cbd83b707660ebf6e46596503efbb683d3e96dc422d9adf7074dd391",
    "coverageState": "declared",
    "atomicGoalKeys": [
      "7d51b38c-a149-5407-bddc-d2ce7878b020:038ca1a8-9d0d-5201-9148-d3984209c5bb",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:0b39206b-725d-5fca-bdd1-8d24c8d424f3",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:0bfd9371-8a7b-407c-9244-fe6ecbe2b56d",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:1891f6f8-5a1e-552a-adc4-1e25751d9a17",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:1c1c2576-3e02-5928-8c28-f3aaf528ae55",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:1dc5260a-f3c5-5f32-8ea5-6388126eb6fa",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:1f20ccda-2a88-5684-a03a-fd1a989588e6",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:25be929d-624d-5654-bbb8-32fa1fba50c2",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:2a87fb3c-394b-47b4-bda2-58c5f1403475",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:2b4e68c5-5105-5d04-a207-4edabfac4097",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:3035b447-8287-5d23-85a1-e92cc76248b3",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:35849012-1b9d-58dc-b5c9-e56912acbe96",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:4196aaa8-7e87-54f0-a624-d71ec3d823e1",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:45a27914-ccbd-5d0b-ad12-6a6ada4362c6",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:485ce283-3bb5-54a6-be3f-d6bda1e90f8a",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:4c12d4f5-ce17-561d-ae96-71bcc10d76c0",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:4ff6b2b1-97cd-5ccb-b5a2-dde71116f757",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:54d88684-d4e5-50d3-9453-d141af7316d2",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:56a88f2f-cc47-5e1d-b7d9-1822a66e3b91",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:5944b04b-cf9f-5a71-babe-f50014a7f478",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:59fe2996-e18b-5ee1-af74-de99176a694b",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:5ac3f762-2b2d-5414-9765-335962a3d2c1",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:61b14635-f827-5a5a-8416-fe6eddefc981",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:64b54f92-5895-5853-aab8-26942527d3f9",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:69f09bee-69a8-5155-9c81-9044e4bff5ac",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:6a946a09-ddac-5caa-aec7-0de66f33a05c",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:6c284640-1f28-4837-aabd-445656ad7f54",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:6d10ced5-0213-558c-9b65-db70ccb824b4",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:779ae14c-8bde-543e-b898-009bd9fe0b0a",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:814c7112-f2e7-5719-8896-765d7063e5ff",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:8179e63e-764c-4348-a5f1-f738fb2cc04e",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:82fe54dd-d29f-540c-9ef1-f4feb17845c6",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:83e24696-f094-5752-b0a6-40400312a8c5",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:84af2e26-45c9-5075-80f7-7c6f37847e9d",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:8522727c-8793-57ed-b314-eeff6d17f652",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:881edb2d-b0c9-5775-b2ba-3062f2e91f83",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:8d7aacfd-3e57-5c18-b97e-941ad402c5ab",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:91230113-91b0-5a8b-94e4-4419014cfb58",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:937f1429-1024-5710-b734-3ceb34d245c3",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:9952c581-7646-5205-8c07-f1fd32e2e547",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:9bb399e1-fd49-5220-9c81-82efbeae47eb",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:a8a53f33-ccce-5158-a810-c162113316b1",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:b24084e1-bff3-5fc6-800d-ec6c024e52aa",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:b899d7ee-5c05-54de-8be2-0b5ff00b134f",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:bb0173dc-5cda-50f6-ac10-6c439bbb2578",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:bc46922d-d874-528b-a183-5a3eaef12e4d",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:c54693ae-448b-5a06-8972-785022f35cd7",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:c5c1620d-60a7-521c-9fad-2a180c0a3169",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:c62c529f-3732-4c66-a8e4-6d91ed2285d0",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:c85e5d19-31e3-58d9-88f3-eae00a7af205",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:c9d20743-dfda-4425-ae40-8f51d9f0c72a",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:cb2af3ef-c261-4d92-bc30-3eeb7a2af96a",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:ce0966fa-ce95-5b26-81a1-85df48beeff4",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:d5d33c5f-83ac-5338-a922-5c99d4a2c351",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:d81e3ba4-bab6-5237-9315-fcdcf7775f52",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:d8f83bf0-5ab0-5bd8-b64d-87451653a296",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:f0910b55-48a9-4f81-aed6-d15ac0446c70",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:fb84fcc4-7a5c-533c-88ca-34b064c7f263"
    ],
    "protectedGoalMeanings": [
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:038ca1a8-9d0d-5201-9148-d3984209c5bb",
        "sha256": "3b7223767fe2f8874a4d8dd51eb0b900503e0d99c8e49919ba3eca625b7ecfbe"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:0b39206b-725d-5fca-bdd1-8d24c8d424f3",
        "sha256": "48798a6aa8db9b9a649d3a61768121c21b5274456c4b77624f0447bcb81d68af"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:0bfd9371-8a7b-407c-9244-fe6ecbe2b56d",
        "sha256": "f7bfcb154c8aeaeff81403038762f1bb658e24402e84b836d5d44af4ebce7792"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:1891f6f8-5a1e-552a-adc4-1e25751d9a17",
        "sha256": "b5a4e5badde460cb899cf7a0aa4a08b33b445ed611ed543469d48138b51030da"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:1c1c2576-3e02-5928-8c28-f3aaf528ae55",
        "sha256": "672ebd5890bec959778d741bbbfafa270dff754bca7d97c70d429d5c1857a6d4"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:1dc5260a-f3c5-5f32-8ea5-6388126eb6fa",
        "sha256": "ecbb0b1f7f628b28999878a8faf259dba21597dd819f5add387039dee85b67ca"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:1f20ccda-2a88-5684-a03a-fd1a989588e6",
        "sha256": "b9f72a0671bca505d9282ad035830d20f9533bd550c72fe62596bb7d61002e15"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:25be929d-624d-5654-bbb8-32fa1fba50c2",
        "sha256": "2f60fab6681862d71787bebefcd39b1453c6e0b5765e09b0b037524270f55c06"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:2a87fb3c-394b-47b4-bda2-58c5f1403475",
        "sha256": "05eb07b462d272860caf56b5114a063202ce80f528c56f3f14f40d5f3f911035"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:2b4e68c5-5105-5d04-a207-4edabfac4097",
        "sha256": "f02aff56cf62a6292670eb7471144514eb9f0191b6cb58aeff3f77dd64c29cc2"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:3035b447-8287-5d23-85a1-e92cc76248b3",
        "sha256": "968923e14a8665273af2a22aefec6df87616d0fd2141f5b7284e33272969c7c5"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:35849012-1b9d-58dc-b5c9-e56912acbe96",
        "sha256": "bc61a7fae4f2c3abcd1c5dd9c469295d08c5cf6c54e6f2e3b9fc7a66af2c8e06"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:4196aaa8-7e87-54f0-a624-d71ec3d823e1",
        "sha256": "3d86b5c03e30aa98434e433b23580756b36fa50205a848a63d3f7b69576dbd54"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:45a27914-ccbd-5d0b-ad12-6a6ada4362c6",
        "sha256": "cc303c87e27d166d375bc62bc072b08a4303211ed44cd89a834a68a5abbe9904"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:485ce283-3bb5-54a6-be3f-d6bda1e90f8a",
        "sha256": "41650f67725801dfee149e70a15106fbfaa667c16abc7f0d5a67faa057ca68bc"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:4c12d4f5-ce17-561d-ae96-71bcc10d76c0",
        "sha256": "81ecc39079c3e94ea3fd00c84c3205e246c2fccf2b992ec4e7a6a92af853031f"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:4ff6b2b1-97cd-5ccb-b5a2-dde71116f757",
        "sha256": "1d40817d97a57e090f645f2f37799b854213ebb87890312966429b1ba3797e67"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:54d88684-d4e5-50d3-9453-d141af7316d2",
        "sha256": "fea865220350c5707947b15c1294cf4446dc9919f4412b0a3236da9ab96d8da1"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:56a88f2f-cc47-5e1d-b7d9-1822a66e3b91",
        "sha256": "f12d7e1c7f9c9557c50f59a3532c67b7e8814247ed21b952d992307e908e14ea"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:5944b04b-cf9f-5a71-babe-f50014a7f478",
        "sha256": "a42cbea50f9b490b6dcf118539bc03aae9e0663f75d654594d480bfb7cb2b90b"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:59fe2996-e18b-5ee1-af74-de99176a694b",
        "sha256": "878c57b00ba35c470dee05019dcb67d7cd8e136c771106a3c4e0b49f0064e56e"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:5ac3f762-2b2d-5414-9765-335962a3d2c1",
        "sha256": "e028c1dc6b437dd926063f42854e872334ed15c635b370452e658c50bd5bb038"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:61b14635-f827-5a5a-8416-fe6eddefc981",
        "sha256": "207fa60e60258d325c1958d01784c529dbb1d45ac5b87402239c9b8dd706789c"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:64b54f92-5895-5853-aab8-26942527d3f9",
        "sha256": "ade90ef0ed77dc083709ebfd47202df4a25eafc0116409544bfaf82dac09026d"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:69f09bee-69a8-5155-9c81-9044e4bff5ac",
        "sha256": "5881cced4a96e7e162f5a16615b2fd7dd8116c4fb2085d64d5de0460983b2437"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:6a946a09-ddac-5caa-aec7-0de66f33a05c",
        "sha256": "ce1e207b125ba1d065dc505806737ee3dc8addee5a0bf8776691a92223281635"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:6c284640-1f28-4837-aabd-445656ad7f54",
        "sha256": "096b7da5f1c5a95bef1224ff6a5612eb7284f86057ac412da4c233c574a1f425"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:6d10ced5-0213-558c-9b65-db70ccb824b4",
        "sha256": "3c7a99383dc1a1ca10ca359f81a540df004f0d1fd2d87cf66bfec628d93bca4c"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:779ae14c-8bde-543e-b898-009bd9fe0b0a",
        "sha256": "2ff0fbad8a4e7fcddb4266de30480d6b0fac569c606a201fc23e3fa473078def"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:814c7112-f2e7-5719-8896-765d7063e5ff",
        "sha256": "19b18f7bba9c6db14e1baa08d545aa7d041002e78acfcb92a94dda3df4604cd8"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:8179e63e-764c-4348-a5f1-f738fb2cc04e",
        "sha256": "ef16720cfa82acdc9a04b9e33c7727646f13879d43f0399a16a0987f807d6d93"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:82fe54dd-d29f-540c-9ef1-f4feb17845c6",
        "sha256": "36267a23e103c4883105ef70d34ab75f6029c149f28cf4a3a3a1ad3c803b7d52"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:83e24696-f094-5752-b0a6-40400312a8c5",
        "sha256": "16c74be507500bbab7a2b5c1ab5284225e1a7fe31b48ec1dade36fc161458042"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:84af2e26-45c9-5075-80f7-7c6f37847e9d",
        "sha256": "98ae7d05bafeb054a7f811bab137fd14c837d857222a1351aa80bbbf1be342a0"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:8522727c-8793-57ed-b314-eeff6d17f652",
        "sha256": "fe3ca71103628818f9d95bd1112540de0d3bc9635f232e0082be67959699debd"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:881edb2d-b0c9-5775-b2ba-3062f2e91f83",
        "sha256": "70ce9d3f35858e56331027395f2f11d88f05a8993c92cb774eb32a498027693e"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:8d7aacfd-3e57-5c18-b97e-941ad402c5ab",
        "sha256": "e15bf68176c795b13d62d7fe45063ddb340f1703c50310b8f08629586858268e"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:91230113-91b0-5a8b-94e4-4419014cfb58",
        "sha256": "7d22b5ba9a41910a06b4508714f1c98ace7f2ab663de6e8349a4277f004748aa"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:937f1429-1024-5710-b734-3ceb34d245c3",
        "sha256": "d4a57f1b7a31798585b048c4b5e0027e1f7087e0cef6e1a85cd095b46e2deaac"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:9952c581-7646-5205-8c07-f1fd32e2e547",
        "sha256": "6b4befb2b1fc8f1735b8f3388f02f528719cdb2512f79ed3189478a0682553af"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:9bb399e1-fd49-5220-9c81-82efbeae47eb",
        "sha256": "30519e7a75ff301a42742842be21d22af7688b175acf4d0d3a7900d73f749a93"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:a8a53f33-ccce-5158-a810-c162113316b1",
        "sha256": "5047d9291a25c4cbd501a2431bd71932bab90cc30a6b3258059c565150fc62f2"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:b24084e1-bff3-5fc6-800d-ec6c024e52aa",
        "sha256": "ca0eff2db9c1799b859b493f23f2907fbee7bcb1b42655944e2bdacb4a314d2b"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:b899d7ee-5c05-54de-8be2-0b5ff00b134f",
        "sha256": "aec262ca4909f3513638bc1f6c793e66368a9b2f28aa766b01feb10de5516a3b"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:bb0173dc-5cda-50f6-ac10-6c439bbb2578",
        "sha256": "bab5a069c782523faaa5a73ba06d0d708cfa4f27612addf205e195001b227ccd"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:bc46922d-d874-528b-a183-5a3eaef12e4d",
        "sha256": "1581d537f613c661070ed659f693e91b281861e9ea9cf736e6d64192609fb997"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:c54693ae-448b-5a06-8972-785022f35cd7",
        "sha256": "d2943313afdeefe4280f70799503ccf96e40166122610dfb5453ac5864b81352"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:c5c1620d-60a7-521c-9fad-2a180c0a3169",
        "sha256": "f7b5d69f9ad1753967fed915abb93dc3a0f01fb701e4307024d2e4baffd5c486"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:c62c529f-3732-4c66-a8e4-6d91ed2285d0",
        "sha256": "d99a6b20151bad981aec2bbdc0d6af58c2b4ef3d78e2bea6dd8b4632e78f3476"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:c85e5d19-31e3-58d9-88f3-eae00a7af205",
        "sha256": "e5147f82740df67afa0eab1f6efdcf95751efdc705dac3e3b3b9b5912611d9c1"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:c9d20743-dfda-4425-ae40-8f51d9f0c72a",
        "sha256": "08da58b8338815449d9306881bc4a95dfee88538202be36fa79610f9a3ee0128"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:cb2af3ef-c261-4d92-bc30-3eeb7a2af96a",
        "sha256": "995b936a26e0ba44ada04c6be8e88b8a5d52ba4e0a8f45b2b2dbfe7247d14170"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:ce0966fa-ce95-5b26-81a1-85df48beeff4",
        "sha256": "b52bf9a9850ef71908e97d1baa9e4d8bdc69c1c827cd9474d8bc09de103c21e7"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:d5d33c5f-83ac-5338-a922-5c99d4a2c351",
        "sha256": "f3b35f3be46444568db2c4ebaefc2dde8115c9e2ab24b8783ded573557f42d35"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:d81e3ba4-bab6-5237-9315-fcdcf7775f52",
        "sha256": "5c63fe65aee0d2cc6a9064cad2fc6a4d6a57dfed5e7ad3b12bd38f3fc9a5bb8e"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:d8f83bf0-5ab0-5bd8-b64d-87451653a296",
        "sha256": "9e618f7f94bb1dc99f8707082b2058a6664b4ec8b44f40a8a6be3ee26c9938e0"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:f0910b55-48a9-4f81-aed6-d15ac0446c70",
        "sha256": "96a7c9040c6d8b25315bfa0b5a76cbd017bdbf3ae7b724817a26b93a4f6f62f9"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:fb84fcc4-7a5c-533c-88ca-34b064c7f263",
        "sha256": "f96f01a397092139b689d85200926ea9b7f6b668d2a89607d741016cd3833a25"
      }
    ],
    "evidencePins": [
      {
        "path": "qa-artifacts/ci-contract-audit/2026-11-07/informatics-current-definition-revision-plan/review-decision.json",
        "sha256": "306f474d9a8bd5a3fc79a3626a49c7409a71d968e08174d0df0a18f20667ebea"
      },
      {
        "path": "qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-source-scope-independent-review/current-informatics-cleanup-authority/authority.json",
        "sha256": "a0708d5d81ab461c54a9041d33d373d426cc5c9d46fdffe19b587e33f85e5065"
      }
    ],
    "rationale": "Prospective current authored identity absent from the immutable active historical24 snapshot; exact initial definition and declared coverage independently compared. No predecessor result or retrospective competence is transferred. This technical binding does not grant material readiness, official scope or maturity; existing draft/placeholder/source/scope holds remain hard failures."
  },
  {
    "kind": "first-definition-binding",
    "owner": "7d51b38c-a149-5407-bddc-d2ce7878b020",
    "goalId": "c24236b2-d783-53be-84d5-96b4f4ef8159",
    "sourcePath": "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json",
    "sourceReference": {
      "path": "contracts/curriculum-assessment-coverage/v1/informatics/revisions/2026-11-07-current23/initial-source.json.gz",
      "sha256": "5a0abd358cc2fe719a2b2a15ace63f580a3b8c18b6fe2eda12c0496c15e69eb3",
      "gzip": true
    },
    "sourceSha256": "50a26163a1934216727ee178f8b0d2740c2476f62482ce32911fecbf890654e8",
    "newMeaningSha256": "b9fc6480be8f11886c674a69dad23e44c7da51759da0c690f56a4216f24942f0",
    "coverageState": "declared",
    "atomicGoalKeys": [
      "7d51b38c-a149-5407-bddc-d2ce7878b020:1a03f790-a88f-57af-a618-80249960b63b",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:2897717b-e143-540d-9c7a-6d2120807675",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:4e0d72e9-2a30-5dc0-a856-1a2e2e353b03",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:757256e2-eb59-572f-a403-e1b1d53e37d4"
    ],
    "protectedGoalMeanings": [
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:1a03f790-a88f-57af-a618-80249960b63b",
        "sha256": "edf0cadcae20a78e1d0568d96e75581f2a611610fbfe861b8ef206ddc67ad13d"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:2897717b-e143-540d-9c7a-6d2120807675",
        "sha256": "f88d7e1f2f73839bf64b7601dd016d6b0fa8295b23050dec1c774f1258f58a8e"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:4e0d72e9-2a30-5dc0-a856-1a2e2e353b03",
        "sha256": "8636a47f5faac6905e92e258f7e0b7dbbfcc6edc78b3a01f1fe00c5e3833c605"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:757256e2-eb59-572f-a403-e1b1d53e37d4",
        "sha256": "720bea22d01bbfb5e03c127a4e135bfcfa4fe66571e9e42d76a771cef78c27e4"
      }
    ],
    "evidencePins": [
      {
        "path": "qa-artifacts/ci-contract-audit/2026-11-07/informatics-current-definition-revision-plan/review-decision.json",
        "sha256": "306f474d9a8bd5a3fc79a3626a49c7409a71d968e08174d0df0a18f20667ebea"
      },
      {
        "path": "qa-artifacts/ci-contract-audit/2026-11-07/informatics-e-independent-review/review-result.json",
        "sha256": "71ec7653107de3c75b87b39369358911b3813baef7b1624e26d277fa407fc05d"
      }
    ],
    "rationale": "Prospective current authored identity absent from the immutable active historical24 snapshot; exact initial definition and declared coverage independently compared. No predecessor result or retrospective competence is transferred. This technical binding does not grant material readiness, official scope or maturity; existing draft/placeholder/source/scope holds remain hard failures."
  },
  {
    "kind": "first-definition-binding",
    "owner": "7d51b38c-a149-5407-bddc-d2ce7878b020",
    "goalId": "ea2ce31f-a0c7-5102-9213-ee1db5b2d475",
    "sourcePath": "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json",
    "sourceReference": {
      "path": "contracts/curriculum-assessment-coverage/v1/informatics/revisions/2026-11-07-current23/initial-source.json.gz",
      "sha256": "5a0abd358cc2fe719a2b2a15ace63f580a3b8c18b6fe2eda12c0496c15e69eb3",
      "gzip": true
    },
    "sourceSha256": "50a26163a1934216727ee178f8b0d2740c2476f62482ce32911fecbf890654e8",
    "newMeaningSha256": "602042ee52587e06e9a66fe868a8dfa3b39028183368f369fe1c02c9df5366a5",
    "coverageState": "declared",
    "atomicGoalKeys": [
      "7d51b38c-a149-5407-bddc-d2ce7878b020:6539320a-aa0e-59e5-a34a-55f1a8b78337",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:6c4fd4a4-b245-512f-99ec-4ec6d1e37126",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:ace0c141-9e7c-546e-914f-64c24d42d85d",
      "7d51b38c-a149-5407-bddc-d2ce7878b020:ca07458c-1fc1-5ca1-b226-69f59e2d62d3"
    ],
    "protectedGoalMeanings": [
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:6539320a-aa0e-59e5-a34a-55f1a8b78337",
        "sha256": "6e60559ca371452f95c4fe6821264f4d22b60825c864ed7f8f914ede406b28c2"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:6c4fd4a4-b245-512f-99ec-4ec6d1e37126",
        "sha256": "302f1728978874875a887f414d83019a792f0f9a44c8808d42d611a20f13693f"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:ace0c141-9e7c-546e-914f-64c24d42d85d",
        "sha256": "0f078d4a8db4bf2014340ad44a7396ee0c8ed2f7b5ec9c6905b8cc4c12b287d1"
      },
      {
        "key": "7d51b38c-a149-5407-bddc-d2ce7878b020:ca07458c-1fc1-5ca1-b226-69f59e2d62d3",
        "sha256": "07014542380d716389d2e1527051d9881479a3deddcc57b3649552bbfd38f679"
      }
    ],
    "evidencePins": [
      {
        "path": "qa-artifacts/ci-contract-audit/2026-11-07/informatics-current-definition-revision-plan/review-decision.json",
        "sha256": "306f474d9a8bd5a3fc79a3626a49c7409a71d968e08174d0df0a18f20667ebea"
      },
      {
        "path": "qa-artifacts/ci-contract-audit/2026-11-07/informatics-e-independent-review/review-result.json",
        "sha256": "71ec7653107de3c75b87b39369358911b3813baef7b1624e26d277fa407fc05d"
      }
    ],
    "rationale": "Prospective current authored identity absent from the immutable active historical24 snapshot; exact initial definition and declared coverage independently compared. No predecessor result or retrospective competence is transferred. This technical binding does not grant material readiness, official scope or maturity; existing draft/placeholder/source/scope holds remain hard failures."
  }
]

function verifyCurrentInfoRevision(repoRoot: string, historical: SkillLandscape): { issues: string[]; pins: Array<{ path: string; sha256: string }> } {
  const revision = CURRENT_INFO_REVISION, issues: string[] = [], pins = [revision.initialSourceReference, revision.initialInventoryReference, ...revision.reviewPins]
  try {
    for (const pin of pins) if (coverageSha256(readFileSync(resolve(repoRoot, pin.path))) !== pin.sha256) issues.push(`revision-pin-invalid: ${pin.path}`)
    const archive = readFileSync(resolve(repoRoot, revision.initialSourceReference.path)), raw = gunzipSync(archive)
    if (coverageSha256(raw) !== revision.initialSourceSha256 || revision.owner !== RETAINED_INFO_OWNER
      || revision.priorActiveSourceSha256 !== RETAINED_INFO_SOURCE_SHA || revision.priorHistoryInventorySha256 !== RETAINED_INFO_INVENTORY_SHA) issues.push('revision-source-binding-invalid')
    const initial = JSON.parse(raw.toString('utf8')) as SkillLandscape
    const inventory = JSON.parse(readFileSync(resolve(repoRoot, revision.initialInventoryReference.path), 'utf8'))
    if (initial.landscapeId !== RETAINED_INFO_OWNER || new Set(initial.goals.map(goal => goal.id.toLowerCase())).size !== initial.goals.length) issues.push('revision-owner-or-duplicate-invalid')
    const exams = initial.goals.filter(goal => goal.examData).sort((a, b) => a.id.localeCompare(b.id))
    const definitions = exams.map(goal => {
      const declared = Object.hasOwn(goal.examData!, 'coveredGoalIds')
      const coverage = declared ? resolveRetainedCoverage(initial, goal.examData!.coveredGoalIds) : undefined
      if (coverage?.issues.length) issues.push(...coverage.issues.map(issue => `revision-initial-coverage: ${issue}`))
      return { goalId: goal.id, title: goal.title, protectedMeaningSha256: coverageSha256(stableCoverageJson(protectedAssessmentMeaning(goal, true))),
        fullGoalObjectSha256: coverageSha256(stableCoverageJson(goal)), examDataSha256: coverageSha256(stableCoverageJson(goal.examData)),
        reviewStatus: goal.examData!.reviewStatus ?? null, coverage: declared
          ? { state: 'declared', references: goal.examData!.coveredGoalIds, atomicGoalKeys: coverage!.atoms }
          : { state: 'undeclared', reason: 'coveredGoalIds is absent in the exact current definition; external competence coverage remains UNKNOWN.' } }
    })
    const actualInventory = { kind: 'PROPOSED exact initial current-definition inventory; no material quality or maturity grant', owner: initial.landscapeId,
      sourceSha256: coverageSha256(raw), definitionCount: definitions.length, declaredCount: definitions.filter(row => row.coverage.state === 'declared').length,
      undeclaredCount: definitions.filter(row => row.coverage.state === 'undeclared').length, definitions }
    if (!same(inventory, actualInventory) || actualInventory.definitionCount !== 23
      || actualInventory.declaredCount !== revision.currentDeclaredCount || actualInventory.undeclaredCount !== revision.currentUndeclaredCount) issues.push('revision-inventory-invalid')
    const historicalIds = sorted(historical.goals.filter(goal => goal.examData).map(goal => goal.id)), initialIds = exams.map(goal => goal.id)
    const surviving = historicalIds.filter(id => initialIds.includes(id)), retired = historicalIds.filter(id => !initialIds.includes(id)), births = initialIds.filter(id => !historicalIds.includes(id))
    if (!same(initialIds, revision.currentDefinitionGoalIds) || !same(surviving, revision.survivingHistoricalGoalIds)
      || !same(retired, revision.retiredHistoricalGoalIds) || !same(births, revision.introductionGoalIds)
      || surviving.length !== 15 || retired.length !== 9 || births.length !== 8) issues.push('revision-partition-invalid')
    const oldById = new Map(historical.goals.map(goal => [goal.id, goal])), initialById = new Map(initial.goals.map(goal => [goal.id, goal]))
    for (const id of surviving) {
      const old = oldById.get(id)!, current = initialById.get(id)!, declared = Object.hasOwn(old.examData!, 'coveredGoalIds')
      if (!same(protectedAssessmentMeaning(old, true), protectedAssessmentMeaning(current, true))
        || declared !== Object.hasOwn(current.examData!, 'coveredGoalIds')) issues.push(`revision-survivor-meaning-invalid: ${id}`)
      if (declared) {
        const oldCoverage = resolveRetainedCoverage(historical, old.examData!.coveredGoalIds), newCoverage = resolveRetainedCoverage(initial, current.examData!.coveredGoalIds)
        if (oldCoverage.issues.length || newCoverage.issues.length || !same(oldCoverage.atoms, newCoverage.atoms)) issues.push(`revision-survivor-coverage-invalid: ${id}`)
        for (const ref of oldCoverage.definitions) if (!initialById.has(ref)
          || !same(protectedAssessmentMeaning(oldById.get(ref)!), protectedAssessmentMeaning(initialById.get(ref)!))) issues.push(`revision-survivor-target-meaning-invalid: ${id}:${ref}`)
      }
    }
    const firsts = CONCRETE_BINDINGS.filter(binding => binding.kind === 'first-definition-binding' && binding.sourcePath === CURRENT_INFO_SOURCE_PATH)
    if (firsts.length !== 8 || !same(sorted(firsts.map(binding => binding.goalId)), births)
      || firsts.some(binding => binding.owner !== revision.owner || binding.sourceSha256 !== revision.initialSourceSha256
        || !same(binding.sourceReference, revision.initialSourceReference) || !verifiedInitialSource(binding, repoRoot))) issues.push('revision-first-bindings-invalid')
  } catch (error) { issues.push(`revision-binding-invalid: ${String(error)}`) }
  return { issues: sorted(issues), pins }
}


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
  const activeIdentities = new Set(landscape.goals.map(goal => goal.id.toLowerCase()))
  const duplicateIds = sorted(landscape.goals.filter(goal => landscape.goals.filter(other => other.id.toLowerCase() === goal.id.toLowerCase()).length !== 1).map(goal => goal.id))
  const historicalGoalIds = sorted(historical.goals.filter(goal => goal.examData).map(goal => goal.id))
  const revisionRequested = capture?.path === CURRENT_INFO_SOURCE_PATH
  const revisionCheck = revisionRequested ? verifyCurrentInfoRevision(repoRoot, historical) : undefined
  discoveryIssues.push(...(revisionCheck?.issues ?? []))
  const currentRevision = revisionRequested && revisionCheck?.issues.length === 0
  // Source-path ownership is already part of every first binding. Historical
  // audit captures and existing isolated fixture frames cannot import births
  // registered for a different source identity.
  const sourceBindings = CONCRETE_BINDINGS.filter(binding => binding.kind !== 'first-definition-binding' || binding.sourcePath === capture?.path)
  const registeredFirstGoalIds = sourceBindings.filter(binding => binding.kind === 'first-definition-binding').map(binding => binding.goalId)
  if (revisionRequested) {
    const actualDefinitions = sorted(landscape.goals.filter(goal => goal.examData !== undefined || goal.nodeKind === 'exam'
      || (!(goal.contains?.length) && (goal.tags ?? []).some(tag => tag === 'Exam' || tag === 'Assessment'))).map(goal => goal.id))
    if (!same(sorted(definitionGoalIds), CURRENT_INFO_REVISION.currentDefinitionGoalIds)
      || !same(actualDefinitions, CURRENT_INFO_REVISION.currentDefinitionGoalIds)) discoveryIssues.push('current-definition-set-invalid')
    if (activeIdentities.has(CURRENT_INFO_REVISION.privateDiscardedNeverActiveId)) discoveryIssues.push('discarded-introduction: active source')
  }
  const retirementChecks = revisionRequested ? CURRENT_INFO_REVISION.retiredHistoricalGoalIds.map(goalId => {
    const issues = [...(!currentRevision ? ['revision-binding-invalid'] : []), ...(activeIdentities.has(goalId) || definitionGoalIds.some(id => id.toLowerCase() === goalId) ? ['retired-definition-reintroduced'] : [])]
    return { goalId, decision: issues.length ? 'fail' as const : 'retired-current-definition' as const, issues }
  }) : undefined
  if (new Set(registeredFirstGoalIds).size !== registeredFirstGoalIds.length) discoveryIssues.push('incomplete-inventory: duplicate first-definition binding')
  if (sourceBindings.some(binding => binding.kind === 'first-definition-binding'
    && (binding.owner !== RETAINED_INFO_OWNER || historicalGoalIds.includes(binding.goalId) || binding.goalId === INFO_HELD))) discoveryIssues.push('unbound-equivalence: invalid first-definition registry')
  const introductions = sorted([...definitionGoalIds.filter(id => !historicalGoalIds.includes(id)), ...registeredFirstGoalIds.filter(id => !historicalGoalIds.includes(id))])
  if (activeIdentities.has(INFO_HELD)) discoveryIssues.push('held-introduction: active source')
  const rows: RetainedCoverageRow[] = []
  const consumedPins: ExactMeaningEvidence[] = []
  const requiredHistoricalGoalIds = currentRevision ? [...CURRENT_INFO_REVISION.survivingHistoricalGoalIds] : historicalGoalIds
  for (const goalId of [...requiredHistoricalGoalIds, ...introductions]) {
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
        const binding = sourceBindings.find(binding => (binding.kind === 'exact-equivalence-binding' || (declared && binding.kind === 'same-declared-contract-repair'))
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
        const initial = sourceBindings.find(binding => binding.kind === 'first-definition-binding'
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
        const first = sourceBindings.find(binding => binding.kind === 'first-definition-binding' && binding.goalId === goalId
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
  const revision = revisionRequested ? { revisionId: CURRENT_INFO_REVISION.revisionId, definitionSourcePath: CURRENT_INFO_SOURCE_PATH,
    initialSourceReference: { ...CURRENT_INFO_REVISION.initialSourceReference }, initialInventoryReference: { ...CURRENT_INFO_REVISION.initialInventoryReference },
    dataSha256: coverageSha256(stableCoverageJson(CURRENT_INFO_REVISION)), reviewPins: CURRENT_INFO_REVISION.reviewPins.map(pin => ({ ...pin })) } : undefined
  // These are derived here from the immutable capture, never supplied by a
  // producer/report caller. The technical identity contract remains separate.
  const materialFailuresFor = (ids: readonly string[], ready: boolean) => sorted(ids.filter(id => {
    const goal = byId.get(id)
    return !goal || concreteExamReadinessIssues(goal, ready).length > 0
  }))
  const sourceMaterialFailures = { structureGoalIds: materialFailuresFor(definitionGoalIds, false),
    readinessGoalIds: materialFailuresFor(requiredGoalIds, true) }
  const manifest: RetainedCoverageManifest = { contractVersion: revisionRequested ? 'informatics-current-assessment-coverage-2026-11-07-v1' : 'informatics-retained-assessment-coverage-v1', owner: RETAINED_INFO_OWNER,
    historySourceSha256: RETAINED_INFO_SOURCE_SHA, historyInventorySha256: RETAINED_INFO_INVENTORY_SHA,
    frameDigest: coverageSha256(stableCoverageJson({ source: capture ?? null, views, consumedPins, ...(revisionRequested ? { revision, revisionPins: revisionCheck?.pins, retirementChecks } : {}), definitionGoalIds, requiredGoalIds, sourceMaterialFailures })),
    sourceMaterialFailures, historicalGoalIds, ...(revisionRequested ? { revision, retirementChecks } : {}), currentDefinitionGoalIds: [...definitionGoalIds], introductionGoalIds: introductions,
    rows, failingGoalIds: sorted([...rows.filter(row => row.decision === 'fail').map(row => row.goalId), ...(retirementChecks?.filter(row => row.decision === 'fail').map(row => row.goalId) ?? [])]),
    discoveryIssues: sorted(discoveryIssues), status: rows.every(row => row.decision !== 'fail') && !retirementChecks?.some(row => row.decision === 'fail')
      && !discoveryIssues.length && historicalGoalIds.length === 24 && (!revisionRequested || (currentRevision && rows.length === 23 && retirementChecks?.length === 9)) ? 'pass' : 'fail' }
  const context = freeze({ manifest }); contexts.set(context, { kind: 'retained', owner: landscape.landscapeId, source: capture, definitions: [...definitionGoalIds], required: [...requiredGoalIds], materialFailures: sourceMaterialFailures }); return context
}
