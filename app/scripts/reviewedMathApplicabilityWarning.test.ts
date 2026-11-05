import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import test from 'node:test'
import type { ApplicabilityCompilationResult } from './applicabilityCompiler'
import { createNativeProjectionEvidence } from './nativeProjectionEvidence'
import { NATIVE_SOURCE_COVERAGE_POLICY as POLICY } from './nativeSourceCoverage'
import {
  filterFreshMathWarningAcceptances, mathWarningInputDigest,
  MATH_Q010_WARNING_GOAL as Q, MATH_Q010_WARNING_PREREQUISITE as A,
  MATH_Q010_WARNING_REVIEW as REVIEW, MATH_WARNING_LANDSCAPE as MATH,
  validateBoundMathWarningAcceptance, type BoundWarningReview, type ReviewedApplicabilityWarningEntry,
} from './reviewedMathApplicabilityWarning'

const CANONICAL = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const NATIVE = 'docs/dev/learning-units-mathematics-native-source-projection.json'
const REGISTRY = 'docs/qa-ci/applicability-accepted-warnings.json'
const sha = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex')

function fixture() {
  const repo = mkdtempSync(join(tmpdir(), 'math-bound-warning-'))
  const write = (p: string, value: unknown) => { mkdirSync(dirname(join(repo, p)), { recursive: true }); writeFileSync(join(repo, p), typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n') }
  const review = JSON.parse(readFileSync(resolve(import.meta.dirname, '../..', REVIEW), 'utf8')) as BoundWarningReview
  const originalNativePath = review.nativeProjectionPath
  review.nativeProjectionPath = NATIVE
  review.sourcePins.forEach(p => { if (p.path === originalNativePath) p.path = NATIVE })
  const goals = [
    { id: Q, title: 'Fixture Q', contains: [], requires: [A], applicability: { jurisdiction: ['DE-HE'] } },
    { id: A, title: 'Fixture A', contains: [], requires: [], applicability: { jurisdiction: ['DE-HE'] } },
    { id: 'target', title: 'Unrelated fixture target', contains: [], requires: [], applicability: { jurisdiction: ['DE-BY'] } },
  ]
  write(CANONICAL, { landscapeId: MATH, goals })
  write('views/current.json', { landscapeId: MATH, viewId: 'current' })
  const inputs = Object.fromEntries([CANONICAL, 'views/current.json'].map(p => [p, sha(readFileSync(join(repo, p)))]))
  const rows = review.scopeWitnesses.map(w => ({
    row: { scopeId: w.scopeId, offeredByNativePlanner: true, declaredByRepositoryGui: true,
      projectionResolved: true, prerequisiteCompilationResolved: true, targetAtomicGoalIds: ['target'], prerequisiteOnlyGoalIds: [Q, A],
      atomicPrerequisites: { [Q]: [A], [A]: [], target: [] } },
    scope: w.scope, viewIds: ['current'], inputPaths: Object.keys(inputs),
  }))
  while (rows.length < 182) rows.push({ ...rows[0], row: { ...rows[0].row, scopeId: `DE-HE/fixture-${rows.length}//` },
    scope: { ...rows[0].scope, jurisdiction: 'DE-HE', stage: `fixture-${rows.length}` } })
  const native = createNativeProjectionEvidence({ landscapeId: MATH, landscapeSourcePath: CANONICAL, resolverRevision: 'native-personal-curriculum-offers-v1', inputs,
    runtimeDependencySha256: { 'fixture.jar': 'a'.repeat(64) }, inputDiscovery: [{ directory: 'views', kind: 'compositionView', paths: ['views/current.json'] }], rows })
  write(NATIVE, native)
  const policy = { schemaVersion: 1, requiredLandscapeIds: [MATH], landscapes: { [MATH]: { path: NATIVE, sha256: sha(readFileSync(join(repo, NATIVE))) } } }
  write(POLICY, policy)
  const compilation: ApplicabilityCompilationResult = { reports: [{ landscapeId: MATH, title: 'Fixture', file: CANONICAL, dimensions: ['jurisdiction'],
    summary: { goals: 1, errors: 0, warnings: 1, diagnostics: 0 },
    goals: [{ goalId: Q, title: 'Fixture Q', goalType: 'atomic', compiledApplicability: { jurisdiction: ['DE-BY', 'DE-HE'] },
      evidence: [{ dimension: 'jurisdiction', value: 'DE-BY', kind: 'assessment-requires', source: `requires ${A}` }] }], projections: [],
    findings: [{ severity: 'warning', code: 'APV-203', landscapeId: MATH, goalId: Q, dimension: 'jurisdiction', message: 'Fixture reviewed BY surplus' }],
  }], summary: { dimensions: ['jurisdiction'], supportedValues: ['DE-BY', 'DE-HE'], landscapes: 1, goals: 1, errors: 0, warnings: 1, diagnostics: 0, reports: [] } }
  const legacy = { code: 'APV-201', landscapeId: 'other', rationale: 'Unchanged pre-existing decision' }
  const base = { version: 1, acceptedWarnings: [legacy] }
  review.authoredJurisdictions = ['DE-HE']
  review.compiledJurisdictions = ['DE-BY', 'DE-HE']
  review.goalInputSha256 = mathWarningInputDigest(goals[0])
  review.prerequisiteGoalInputSha256 = mathWarningInputDigest(goals[1])
  review.compiledGoalReportSha256 = mathWarningInputDigest(compilation.reports[0].goals[0])
  review.sourcePins.forEach(pin => {
    if (![REGISTRY, CANONICAL, NATIVE, POLICY].includes(pin.path)) write(pin.path, `Fixture source ${pin.path}\n`)
    pin.sha256 = pin.path === REGISTRY ? sha(JSON.stringify(base, null, 2) + '\n') : sha(readFileSync(join(repo, pin.path)))
  })
  review.scopeWitnesses.forEach(w => { w.targetSetSha256 = native.scopes.find(s => s.scopeId === w.scopeId)!.targetSetSha256 })
  let entry: ReviewedApplicabilityWarningEntry
  const commitReview = () => {
    write(REVIEW, review)
    entry = { code: 'APV-203', landscapeId: MATH, goalId: Q, dimension: 'jurisdiction', rationale: review.rationale,
      evidence: { reviewPath: REVIEW, reviewFileSha256: sha(readFileSync(join(repo, REVIEW))),
        humanApproval: false, reviewAuthority: review.reviewAuthority, reviewedAt: review.reviewedAt } }
    write(REGISTRY, { ...base, acceptedWarnings: [legacy, entry] })
    return entry
  }
  commitReview()
  return { repo, write, review, native, goals, compilation, commitReview, entry: () => entry, legacy,
    rebindNative: () => { write(NATIVE, native); policy.landscapes[MATH].sha256 = sha(readFileSync(join(repo, NATIVE))); write(POLICY, policy)
      review.sourcePins.find(p => p.path === NATIVE)!.sha256 = sha(readFileSync(join(repo, NATIVE)))
      review.sourcePins.find(p => p.path === POLICY)!.sha256 = sha(readFileSync(join(repo, POLICY))); commitReview() } }
}

test('only the exact independently reviewed Q/BY surplus is accepted; legacy decisions stay unchanged', () => {
  const f = fixture()
  try {
    validateBoundMathWarningAcceptance(f.entry(), f.compilation, f.repo)
    assert.deepEqual(filterFreshMathWarningAcceptances([f.legacy, f.entry()], f.compilation, f.repo), [f.legacy, f.entry()])
    for (const changed of [{ goalId: 'another' }, { landscapeId: 'another' }, { dimension: 'stage' }, { code: 'APV-201' }, { value: 'DE-BY' }]) {
      assert.throws(() => validateBoundMathWarningAcceptance({ ...f.entry(), ...changed }, f.compilation, f.repo))
      assert.deepEqual(filterFreshMathWarningAcceptances([f.legacy, { ...f.entry(), ...changed }], f.compilation, f.repo), [f.legacy])
    }
  } finally { rmSync(f.repo, { recursive: true, force: true }) }
})

test('goal, task, mapping, primary-source, view, report and review drift revoke acceptance', () => {
  const mutations: Array<(f: ReturnType<typeof fixture>) => void> = [
    f => { f.goals[0].title = 'Changed meaning'; f.write(CANONICAL, { landscapeId: MATH, goals: f.goals }) },
    f => f.write('curricula/DE/Gymnasium/assessments/mathematik/learning-units/monotonicity-2026-11-05/tasks.md', 'Changed task'),
    f => f.write('curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_source_extraction_to_canonical_math.review.json', 'Changed mapping'),
    f => f.write('curricula/DE/Gymnasium/input/BY/raw/Gymnasium_Mathematik_Jgst_11.pdf', 'Changed primary source'),
    f => f.write('views/current.json', { landscapeId: MATH, viewId: 'changed' }),
    f => { f.compilation.reports[0].goals[0].title = 'Changed compiled report' },
    f => f.write(REVIEW, { ...f.review, rationale: 'Changed review' }),
    f => { f.review.sourcePins = f.review.sourcePins.filter(p => !p.path.endsWith('Jgst_11.pdf')); f.commitReview() },
    f => { f.native.scopes[0].scope.durationModel = 'G8'; f.rebindNative() },
  ]
  for (const mutate of mutations) {
    const f = fixture()
    try {
      mutate(f)
      assert.throws(() => validateBoundMathWarningAcceptance(f.entry(), f.compilation, f.repo))
      assert.deepEqual(filterFreshMathWarningAcceptances([f.entry()], f.compilation, f.repo), [])
    } finally { rmSync(f.repo, { recursive: true, force: true }) }
  }
})

test('an extra surplus or either Q/A becoming a BY target cannot be cleared by refreshed artifact hashes', () => {
  const extra = fixture()
  try {
    extra.compilation.reports[0].goals[0].compiledApplicability.jurisdiction!.push('DE-BW')
    extra.review.compiledJurisdictions.push('DE-BW')
    extra.review.compiledGoalReportSha256 = mathWarningInputDigest(extra.compilation.reports[0].goals[0])
    extra.commitReview()
    assert.throws(() => validateBoundMathWarningAcceptance(extra.entry(), extra.compilation, extra.repo))
  } finally { rmSync(extra.repo, { recursive: true, force: true }) }
  for (const id of [Q, A]) {
    const f = fixture()
    try {
      const index = f.native.scopes.findIndex(s => s.scope.jurisdiction === 'DE-BY')
      f.native.targetAtomicMembership[id] = [index]
      f.native.prerequisiteOnlyMembership[id] = f.native.prerequisiteOnlyMembership[id].filter(i => i !== index)
      const targets = Object.keys(f.native.targetAtomicMembership).filter(g => f.native.targetAtomicMembership[g].includes(index)).sort()
      const support = Object.keys(f.native.prerequisiteOnlyMembership).filter(g => f.native.prerequisiteOnlyMembership[g].includes(index)).sort()
      f.native.scopes[index].targetSetSha256 = sha(JSON.stringify(targets))
      f.native.scopes[index].prerequisiteOnlySetSha256 = sha(JSON.stringify(support))
      f.review.scopeWitnesses.find(w => w.scopeId === f.native.scopes[index].scopeId)!.targetSetSha256 = f.native.scopes[index].targetSetSha256
      f.rebindNative()
      assert.throws(() => validateBoundMathWarningAcceptance(f.entry(), f.compilation, f.repo), /became a BY target/)
    } finally { rmSync(f.repo, { recursive: true, force: true }) }
  }
})
