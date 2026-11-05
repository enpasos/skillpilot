import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { isAbsolute, resolve, sep } from 'node:path'
import type { ApplicabilityCompilationResult } from './applicabilityCompiler'
import { NATIVE_SOURCE_COVERAGE_POLICY, readNativeSourceCoverageAdapters } from './nativeSourceCoverage'

export const MATH_WARNING_LANDSCAPE = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
export const MATH_Q010_WARNING_GOAL = '010c133c-dcf1-5530-8305-61bc638017bc'
export const MATH_Q010_WARNING_PREREQUISITE = '2850e8f6-2330-50d3-a577-d519540d9924'
export const MATH_Q010_WARNING_REVIEW = 'curricula/DE/Gymnasium/quality/source-scope-review/mathematik/2026-11-05/by-q010-native-scope-warning.review.json'
const REGISTRY = 'docs/qa-ci/applicability-accepted-warnings.json'

export interface ReviewedApplicabilityWarningEntry {
  code: string
  landscapeId: string
  goalId?: string
  dimension?: string
  value?: string
  rationale?: string
  evidence?: { reviewPath?: string; reviewFileSha256?: string; [key: string]: unknown }
}
export interface BoundWarningReview {
  schemaVersion: number
  reviewedAt: string
  decision: string
  reviewAuthority: string
  humanApproval: boolean
  code: string
  landscapeId: string
  goalId: string
  dimension: string
  warningValueAbsent: boolean
  onlyAcceptedSurplusJurisdictions: string[]
  authoredJurisdictions: string[]
  compiledJurisdictions: string[]
  goalInputSha256: string
  prerequisiteGoalId: string
  prerequisiteGoalInputSha256: string
  compiledGoalReportSha256: string
  rationale: string
  nativeProjectionPath: string
  sourcePins: Array<{ path: string; sha256: string }>
  scopeWitnesses: Array<{ scopeId: string; scope: Record<string, unknown>; targetSetSha256: string; qIsTarget: boolean; aIsTarget: boolean }>
}

const sha = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex')
export function mathWarningInputDigest(value: unknown): string {
  const ordered = (v: unknown): unknown => Array.isArray(v) ? v.map(ordered)
    : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b, 'en')).map(([k, x]) => [k, ordered(x)])) : v
  return sha(JSON.stringify(ordered(value)))
}
const isBoundEntry = (entry: ReviewedApplicabilityWarningEntry) => entry.goalId === MATH_Q010_WARNING_GOAL
  || entry.evidence?.reviewPath === MATH_Q010_WARNING_REVIEW

/** This one terminal warning is a BY whole-goal HOLD, never BY source coverage. */
export function validateBoundMathWarningAcceptance(
  entry: ReviewedApplicabilityWarningEntry,
  compilation: ApplicabilityCompilationResult,
  repo: string,
): void {
  const local = (path: string) => {
    assert.ok(path && !isAbsolute(path) && !path.includes('\\') && !path.split('/').includes('..'), 'Unsafe warning evidence path')
    const absolute = resolve(repo, path)
    assert.ok(absolute.startsWith(resolve(repo) + sep), 'Warning evidence escapes repository')
    return absolute
  }
  const parse = (path: string) => JSON.parse(readFileSync(local(path), 'utf8'))
  assert.equal(entry.code, 'APV-203')
  assert.equal(entry.landscapeId, MATH_WARNING_LANDSCAPE)
  assert.equal(entry.goalId, MATH_Q010_WARNING_GOAL)
  assert.equal(entry.dimension, 'jurisdiction')
  assert.equal(Object.hasOwn(entry, 'value'), false, 'Bound warning has no value wildcard')
  assert.equal(entry.evidence?.reviewPath, MATH_Q010_WARNING_REVIEW)
  const reviewBytes = readFileSync(local(MATH_Q010_WARNING_REVIEW))
  assert.equal(sha(reviewBytes), entry.evidence?.reviewFileSha256, 'Stale warning review bytes')
  const review = JSON.parse(reviewBytes.toString()) as BoundWarningReview
  assert.equal(review.schemaVersion, 1)
  assert.equal(review.decision, 'approve_bounded_warning_acceptance_only')
  assert.equal(review.reviewAuthority, 'independent_ai_review')
  assert.equal(review.humanApproval, false)
  assert.equal(entry.evidence?.humanApproval, false)
  assert.equal(entry.evidence?.reviewAuthority, review.reviewAuthority)
  assert.equal(entry.evidence?.reviewedAt, review.reviewedAt)
  assert.equal(review.code, entry.code)
  assert.equal(review.landscapeId, entry.landscapeId)
  assert.equal(review.goalId, entry.goalId)
  assert.equal(review.dimension, entry.dimension)
  assert.equal(review.warningValueAbsent, true)
  assert.equal(review.prerequisiteGoalId, MATH_Q010_WARNING_PREREQUISITE)
  assert.equal(review.rationale, entry.rationale)
  assert.deepEqual(review.onlyAcceptedSurplusJurisdictions, ['DE-BY'])
  const registry = parse(REGISTRY) as { version: number; acceptedWarnings: ReviewedApplicabilityWarningEntry[] }
  assert.equal(registry.acceptedWarnings.filter(isBoundEntry).length, 1, 'Missing/duplicate bound warning entry')
  assert.deepEqual(registry.acceptedWarnings.find(isBoundEntry), entry, 'Warning entry differs from registry')
  const requiredPins = [
    REGISTRY,
    'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
    review.nativeProjectionPath,
    NATIVE_SOURCE_COVERAGE_POLICY,
    'curricula/DE/Gymnasium/mapping/mathematik-j10-analysis-source-stage-decisions-20260929.md',
    'curricula/DE/Gymnasium/quality/source-scope-review/mathematik/2026-09-29/applicability-scope-warning-review.md',
    'curricula/DE/Gymnasium/input/BY/raw/Gymnasium_Mathematik_Jgst_11.pdf',
    'curricula/DE/Gymnasium/assessments/mathematik/learning-units/monotonicity-2026-11-05/tasks.md',
    'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_source_extraction_to_canonical_math.review.json',
    'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_to_canonical_math.json',
    'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_MATHEMATIK_GYMNASIUM_LEHRPLANPLUS.source-extraction.json',
  ]
  assert.equal(new Set(review.sourcePins.map(p => p.path)).size, review.sourcePins.length, 'Duplicate warning source pin')
  for (const path of requiredPins) assert.ok(review.sourcePins.some(p => p.path === path), `Missing warning source pin: ${path}`)
  for (const pin of review.sourcePins) {
    // Bind the unchanged pre-existing registry independently of the appended
    // entry; hashing the registry including its own review locator is cyclic.
    const bytes = pin.path === REGISTRY
      ? JSON.stringify({ ...registry, acceptedWarnings: registry.acceptedWarnings.filter(e => !isBoundEntry(e)) }, null, 2) + '\n'
      : readFileSync(local(pin.path))
    assert.equal(sha(bytes), pin.sha256, `Stale warning source input: ${pin.path}`)
  }
  const sourcePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
  const nativePath = review.nativeProjectionPath
  assert.equal(parse(NATIVE_SOURCE_COVERAGE_POLICY).landscapes?.[MATH_WARNING_LANDSCAPE]?.path, nativePath, 'Warning native authority differs from current QA adapter')
  assert.ok(review.sourcePins.some(p => p.path === sourcePath), 'Unbound warning canonical source')
  assert.ok(review.sourcePins.some(p => p.path === nativePath), 'Unbound warning native source')
  const source = parse(sourcePath) as { goals: Array<{ id: string; requires?: string[]; applicability?: { jurisdiction?: string[] } }> }
  const goal = source.goals.find(g => g.id === entry.goalId)
  const prerequisite = source.goals.find(g => g.id === review.prerequisiteGoalId)
  assert.ok(goal && prerequisite, 'Missing warning goal/prerequisite')
  assert.deepEqual(goal.requires, [review.prerequisiteGoalId], 'Warning requires relation changed')
  assert.equal(mathWarningInputDigest(goal), review.goalInputSha256, 'Warning goal drift')
  assert.equal(mathWarningInputDigest(prerequisite), review.prerequisiteGoalInputSha256, 'Warning prerequisite drift')
  assert.deepEqual(goal.applicability?.jurisdiction, review.authoredJurisdictions)
  const report = compilation.reports.find(r => r.landscapeId === entry.landscapeId)
  const compiledGoal = report?.goals.find(g => g.goalId === entry.goalId)
  assert.ok(compiledGoal, 'Missing current warning goal report')
  assert.equal(mathWarningInputDigest(compiledGoal), review.compiledGoalReportSha256, 'Warning compiled report drift')
  assert.deepEqual(compiledGoal.compiledApplicability.jurisdiction, review.compiledJurisdictions)
  assert.deepEqual(review.compiledJurisdictions.filter(j => !review.authoredJurisdictions.includes(j)), ['DE-BY'])
  assert.ok(report!.findings.some(f => f.severity === 'warning' && f.code === entry.code && f.goalId === entry.goalId
    && f.dimension === entry.dimension && f.value === undefined), 'Bound warning is no longer current')
  const native = readNativeSourceCoverageAdapters(repo).get(entry.landscapeId)!
  assert.equal(native.scopes.length, 182, 'Reviewed Mathematics offered denominator changed')
  const actualBY = native.scopes.filter(s => s.scope.jurisdiction === 'DE-BY')
  assert.equal(actualBY.length, 7, 'Reviewed BY offered denominator changed')
  assert.equal(review.scopeWitnesses.length, 7, 'Incomplete BY negative witnesses')
  assert.deepEqual(actualBY.map(s => s.scopeId).sort(), review.scopeWitnesses.map(s => s.scopeId).sort())
  for (const witness of review.scopeWitnesses) {
    const scope = actualBY.find(s => s.scopeId === witness.scopeId)!
    assert.equal(mathWarningInputDigest(scope.scope), mathWarningInputDigest(witness.scope), 'Warning scope drift')
    assert.equal(scope.targetSetSha256, witness.targetSetSha256, 'Warning target set drift')
    assert.equal(witness.qIsTarget, false)
    assert.equal(witness.aIsTarget, false)
    const index = native.scopes.indexOf(scope)
    assert.ok(!native.targetAtomicMembership[entry.goalId]?.includes(index), 'Warning Q became a BY target')
    assert.ok(!native.targetAtomicMembership[review.prerequisiteGoalId]?.includes(index), 'Warning A became a BY target')
  }
}

/** Legacy decisions keep their existing rules; only this explicit new binding is tightened. */
export function filterFreshMathWarningAcceptances<T extends ReviewedApplicabilityWarningEntry>(
  entries: T[], compilation: ApplicabilityCompilationResult, repo: string,
): T[] {
  return entries.filter(entry => {
    if (!isBoundEntry(entry)) return true
    try { validateBoundMathWarningAcceptance(entry, compilation, repo); return true } catch { return false }
  })
}
