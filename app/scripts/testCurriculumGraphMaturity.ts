// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import type { SkillLandscape } from '../src/landscapeTypes'
import {
  deriveCurriculumMaturity,
  discoverCurriculumAssessmentScope,
  evaluateCurriculumExamReadiness,
  evaluateGraphIntegrity,
} from './generateCurriculumQualityStatus'
import {
  checkCurriculumMaturityFloors,
  collectCurriculumMaturityFloorFailures,
} from './checkCurriculumMaturityFloors'
import {
  REQUIRED_SKILL_GRAPH_CHECKS,
  type IntegrityGoal,
  type IntegrityLandscape,
  type IntegrityReport,
} from './lib/skillGraphIntegrity'

export const strictGraphFixtureId = 'strict-maturity-fixture'
const A = '00000000-0000-4000-8000-000000000001'
const B = '00000000-0000-4000-8000-000000000002'
const C = '00000000-0000-4000-8000-000000000003'
const P = '00000000-0000-4000-8000-000000000004'
const MISSING = '00000000-0000-4000-8000-000000000099'
const goal = (id: string, requires: string[] = [], contains: string[] = []): IntegrityGoal => (
  { id, weight: 1, requires, contains }
)
const landscape = (goals: IntegrityGoal[], id = strictGraphFixtureId): IntegrityLandscape => (
  { landscapeId: id, sourceFile: `fixtures/${id}.json`, goals }
)
const evaluate = (root: IntegrityLandscape, catalog: IntegrityLandscape[] = [root]) => (
  evaluateGraphIntegrity(root as SkillLandscape, catalog)
)

// A real valid graph result, rather than a hand-written CQR-001 pass, isolates
// the downstream maturity tests from unrelated authored curriculum debt.
export const strictGraphFixtureRule = evaluate(landscape([goal(A, [B]), goal(B)]))
export const strictGraphFixtureAssessmentRules = evaluateCurriculumExamReadiness(
  landscape([goal(A, [B]), goal(B)]) as SkillLandscape, [],
)
export const strictGraphFixtureAssessmentScope = discoverCurriculumAssessmentScope(
  landscape([goal(A, [B]), goal(B)]) as SkillLandscape, [],
)
const expectedScopes = new Map([[strictGraphFixtureId, strictGraphFixtureAssessmentScope]])
assert.equal(strictGraphFixtureRule.status, 'pass')
assert.deepEqual(strictGraphFixtureRule.graphIntegrity?.checkedRules, REQUIRED_SKILL_GRAPH_CHECKS)

const otherRules = ['CQR-000', 'CQR-002', 'CQR-003', 'CQR-301', 'CQR-401', 'CQR-501', 'CQR-302']
  .map((id) => ({ id, status: 'pass' as const, summary: 'Other fixture requirement passed' }))
const deepPassed = { id: 'CQR-303', status: 'pass' as const, summary: 'Fixture five-gate report passed' }
const routeScopes = [{
  scopeId: 'fixture', label: 'Fixture', maturity: 'M4' as const, selectedAtomicGoals: 2,
  rules: [{ id: 'CQR-101', status: 'pass' as const, summary: 'Fixture route passed' }],
}]
type GraphRule = ReturnType<typeof evaluateGraphIntegrity>
const rulesWith = (graphRules: GraphRule[]) => [...otherRules, ...graphRules, ...strictGraphFixtureAssessmentRules, deepPassed]
const maturity = (graphRules: GraphRule[]) => (
  deriveCurriculumMaturity(rulesWith(graphRules), routeScopes, strictGraphFixtureId, strictGraphFixtureAssessmentScope)
)

const floorPolicy = (minimumMaturity: 'M6' | 'M7') => ({
  schemaVersion: 1, policyId: 'fixture-protected-floor', baselineDate: '2026-08-20',
  exceptions: [], knownPreBaselineRegressions: [],
  floors: [{
    landscapeId: strictGraphFixtureId, frameworkId: 'fixture-framework', subject: 'Fixture',
    minimumMaturity, reason: 'The test must preserve the actual protected-floor contract.',
  }],
})
const artifact = (graphRules: GraphRule[], claimedMaturity = maturity(graphRules)) => ({
  curricula: [{
    landscapeId: strictGraphFixtureId, frameworkId: 'fixture-framework', subject: 'Fixture',
    maturity: claimedMaturity, scopes: routeScopes, rules: rulesWith(graphRules),
  }],
})

assert.equal(maturity([strictGraphFixtureRule]), 'M6', 'A graph fixture has no native original-context V evidence.')
for (const floor of ['M6', 'M7'] as const) {
  if (floor === 'M6') {
    assert.deepEqual(collectCurriculumMaturityFloorFailures(artifact([strictGraphFixtureRule]), floorPolicy(floor), expectedScopes), [])
    assert.doesNotThrow(() => checkCurriculumMaturityFloors(artifact([strictGraphFixtureRule]), floorPolicy(floor), expectedScopes))
  } else assert.throws(() => checkCurriculumMaturityFloors(artifact([strictGraphFixtureRule]), floorPolicy(floor), expectedScopes),
    /no complete passing visualization context report/)
}

let malformedGraphs = 0
function rejectsActualGraph(
  label: string,
  root: IntegrityLandscape,
  expectedRule: string,
  catalog: IntegrityLandscape[] = [root],
): void {
  const rule = evaluate(root, catalog)
  assert.equal(rule.status, 'fail', label)
  assert.ok(rule.graphIntegrity?.findings.some(({ ruleId }) => ruleId === expectedRule), label)
  assert.equal(maturity([rule]), 'M0', `${label}: the actual structural result must precede M6/M7`)
  for (const floor of ['M6', 'M7'] as const) {
    const failures = collectCurriculumMaturityFloorFailures(artifact([rule]), floorPolicy(floor), expectedScopes)
    assert.ok(failures.some((line) => line.includes(`current M0 is below protected floor ${floor}`)), label)
    assert.throws(() => checkCurriculumMaturityFloors(artifact([rule]), floorPolicy(floor), expectedScopes), /maturity regression/)
  }
  malformedGraphs++
}

rejectsActualGraph('Non-UUID IDs cannot retain M7', landscape([goal('legacy-label')]), 'G01a')
rejectsActualGraph('Duplicate logical definitions cannot retain M7', landscape([goal(A), goal(A)]), 'G01b')
rejectsActualGraph('UUID case aliases cannot retain M7', landscape([goal(A), goal(A.toUpperCase())]), 'G01b')
rejectsActualGraph('Non-positive weight cannot retain M7', landscape([{ ...goal(A), weight: 0 }]), 'G02')
rejectsActualGraph('Missing prerequisite cannot retain M7', landscape([goal(A, [MISSING])]), 'G05')
rejectsActualGraph('Empty canonical scope cannot retain M7', landscape([]), 'G05')
rejectsActualGraph('Missing root is unavailable, never complete', landscape([goal(A)]), 'G05', [])
rejectsActualGraph('Contains cycle cannot retain M7', landscape([goal(A, [], [B]), goal(B, [], [A])]), 'G06')
rejectsActualGraph('Direct requires cycle cannot retain M7', landscape([goal(A, [B]), goal(B, [A])]), 'G07')
rejectsActualGraph('Inherited self-requirement cannot retain M7', landscape([goal(P, [A], [A]), goal(A)]), 'G15')
rejectsActualGraph('Atomic expansion cycle cannot retain M7', landscape([goal(A, [P]), goal(P, [], [A])]), 'G42')
rejectsActualGraph('Locally inherited duplicate cannot retain M7', landscape([goal(P, [B], [A]), goal(A, [B]), goal(B)]), 'G16')
rejectsActualGraph('Authored transitive shortcut cannot retain M7', landscape([goal(A, [B, C]), goal(B, [C]), goal(C)]), 'G17')
const foreignCycle = landscape([goal(A, [`foreign:${B}`])])
rejectsActualGraph('Foreign cycle cannot disappear at a landscape boundary', foreignCycle, 'G07', [
  foreignCycle, landscape([goal(B, [`${strictGraphFixtureId}:${A}`])], 'foreign'),
])

// A report cannot become sufficient merely because a caller claims CQR-001
// passed, supplies matching counts, or omits a mandatory check from its manifest.
const validReport = strictGraphFixtureRule.graphIntegrity!
const rejectedReports: Array<[string, IntegrityReport | undefined]> = [
  ['missing check artifact', undefined],
  ['empty checked scope', { ...validReport, checkedGoalKeys: [] }],
  ['wrong root scope', { ...validReport, rootLandscapeIds: ['another-curriculum'] }],
  ['duplicate check entry', { ...validReport, checks: validReport.checks.map(() => validReport.checks[0]) }],
  ['undisclosed finding', { ...validReport, findings: [{
    ruleId: 'G17', code: 'TRANSITIVE_REDUNDANT_REQUIREMENT', landscapeId: strictGraphFixtureId,
    goalId: A, message: 'A claimed pass must not conceal a real finding.',
  }] }],
]
for (const id of REQUIRED_SKILL_GRAPH_CHECKS) {
  rejectedReports.push([
    `missing mandatory check ${id}`,
    { ...validReport, checks: validReport.checks.filter((check) => check.id !== id) },
  ], [
    `blocked mandatory check ${id}`,
    { ...validReport, checks: validReport.checks.map((check) => check.id === id ? { ...check, status: 'blocked' } : check) },
  ], [
    `unchecked mandatory rule ${id}`,
    { ...validReport, checkedRules: validReport.checkedRules.filter((checked) => checked !== id) },
  ])
}
for (const [label, report] of rejectedReports) {
  const forgedPass = { ...strictGraphFixtureRule, graphIntegrity: report }
  assert.equal(maturity([forgedPass]), 'M0', label)
  // The standalone floor check also rejects a claimed M7 with an incomplete
  // graph artifact; its default CLI does not trust the maturity string alone.
  assert.throws(() => checkCurriculumMaturityFloors(artifact([forgedPass], 'M7'), floorPolicy('M7'), expectedScopes),
    /no complete passing strict graph-integrity report/, label)
}
assert.equal(maturity([]), 'M0', 'A missing CQR-001 must not grant a maturity')
assert.equal(maturity([strictGraphFixtureRule, strictGraphFixtureRule]), 'M0', 'Duplicate CQR-001 is not unambiguous')

console.log(`Skill graph maturity integration passed: ${malformedGraphs} actual malformed graphs, ${rejectedReports.length} incomplete/forged reports, M6/M7 floor failures.`)
