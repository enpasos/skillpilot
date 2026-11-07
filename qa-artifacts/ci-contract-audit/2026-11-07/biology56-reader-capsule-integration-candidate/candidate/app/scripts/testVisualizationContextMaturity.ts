// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { captureCurriculumSource } from './lib/retainedAssessmentCoverage'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import { evaluateCurrentVisualizationGate, hasCompletePassingVisualizationContext,
  type CurriculumVisualizationValidation, type VisualizationGateRecord } from './lib/curriculumVisualizationValidation'
import { qualifiedVisualizationAuthority } from './lib/qualifiedVisualizationContextAuthority'
import { normalizeExistingRecord, type GoalVisualizationQaRecord } from './generateGoalVisualizationQaLedgers'
import { deriveCurriculumMaturity, discoverCurriculumAssessmentScope, evaluateCurriculumExamReadiness,
  evaluateDeepUnderstandingQa, evaluateGraphIntegrity } from './generateCurriculumQualityStatus'
import { evaluateExamTaskReadiness, routeProfiles } from './generateCurriculumQualityStatus'
import { collectCurriculumMaturityFloorFailures } from './checkCurriculumMaturityFloors'
import { deepUnderstandingCompletionCheckIds, hasStrictDeepUnderstandingCompletion, intersectStrictGoalGates,
  type DeepUnderstandingSubjectReport } from './reportDeepUnderstandingRollout'

type LocalGoal = LearningGoal & { titleEn?: string; descriptionEn?: string; level?: number }
const root = resolve(import.meta.dirname, '../..')
const economicsProbe = process.argv.includes('--economics-probe')
const subject = economicsProbe ? 'wirtschaftswissenschaften' : 'mathematik'
const sourcePath = economicsProbe ? 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json' : 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const source: SkillLandscape = JSON.parse(readFileSync(resolve(root, sourcePath), 'utf8'))
const goal = source.goals.find(goal => goal.id === (economicsProbe ? 'da73483a-2c18-5d42-b4f3-6ac6bcd6b5b0' : 'ce198bc9-b014-52ba-814f-25cc3e020668'))! as LocalGoal
assert.ok(goal)
const ledger: { records: GoalVisualizationQaRecord[] } = JSON.parse(readFileSync(resolve(root,
  `curricula/DE/Gymnasium/quality/goal-visualization-qa/${subject}.qa.json`), 'utf8'))
const row = ledger.records.find(row => row.goalId === goal.id)!
assert.ok(row)
const native = (definition: LocalGoal = goal, record: VisualizationGateRecord = row, landscapeId = source.landscapeId) =>
  evaluateCurrentVisualizationGate({ repositoryRoot: root, landscapeId, landscapePath: sourcePath, subject,
    goalById: new Map([[definition.id, definition]]), currentGoalIds: new Set([definition.id]), records: [record] })
const current = native()
const rejectMutation = process.argv.includes('--reject-external-authority-mutation')
let actualQualified = 0
const fixedIndex: { rows: Array<{ landscapeId: string; goalId: string }> } = JSON.parse(readFileSync(resolve(root,
  qualifiedVisualizationAuthority.indexPath), 'utf8'))
if (!rejectMutation) {
  assert.deepEqual(current.readyGoalIds, [goal.id], JSON.stringify(current.issues))
  assert.ok(Object.isFrozen(current) && Object.isFrozen(current.currentGoalIds) && Object.isFrozen(current.readyGoalIds))
  for (const [subject, name] of [['mathematik', 'MATHEMATIK'], ['wirtschaftswissenschaften', 'WIRTSCHAFT'], ['biologie', 'BIOLOGIE']]) {
    const path = `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_${name}.de.json`
    const landscape: SkillLandscape = JSON.parse(readFileSync(resolve(root, path), 'utf8'))
    const qa: { records: VisualizationGateRecord[] } = JSON.parse(readFileSync(resolve(root,
      `curricula/DE/Gymnasium/quality/goal-visualization-qa/${subject}.qa.json`), 'utf8'))
    const ids = fixedIndex.rows.filter(row => row.landscapeId === landscape.landscapeId).map(row => row.goalId).sort()
    const validation = evaluateCurrentVisualizationGate({ repositoryRoot: root, landscapeId: landscape.landscapeId,
      landscapePath: path, subject, goalById: new Map(landscape.goals.map(goal => [goal.id, goal])),
      currentGoalIds: new Set(ids), records: qa.records })
    assert.deepEqual(validation.readyGoalIds, ids, JSON.stringify(validation.issues))
    actualQualified += ids.length
  }
  assert.equal(actualQualified, 188, 'All fixed candidates must really pass through the authenticated shallow capsule.')

}

// Real original goal/image/review bytes, plus an actually checked minimal graph,
// isolate this V integration from unrelated prerequisites in the full landscape.
const exam = source.goals.find(candidate => candidate.examData && evaluateExamTaskReadiness([candidate]).status === 'pass')!
assert.ok(exam)
const routeClusterIds = [...new Set(routeProfiles.filter(profile => profile.landscapeId === source.landscapeId)
  .flatMap(profile => [...profile.terminalAutonomyClusterIds, ...Object.values(profile.terminalAutonomyClusterIdsByDurationModel ?? {}).flat()]))]
const routeClusters = routeClusterIds.map(id => {
  const original = source.goals.find(candidate => candidate.id === id)
  assert.ok(original)
  return { ...original, weight: 1, requires: [], contains: [exam.id] }
})
const fixture: SkillLandscape = captureCurriculumSource('fixtures/visualization-material.json', JSON.stringify({ ...source, goals: [{ ...goal, weight: 1, contains: [], requires: [] },
  { ...exam, weight: 1, contains: [], requires: [] }, ...routeClusters] }))
const graph = evaluateGraphIntegrity(fixture, [fixture])
assert.equal(graph.status, 'pass')
assert.equal(graph.graphIntegrity?.ok, true)
const assessment = discoverCurriculumAssessmentScope(fixture, [])
const assessmentRules = evaluateCurriculumExamReadiness(fixture, [], [fixture], assessment)
assert.ok(assessmentRules.every(rule => rule.status === 'pass'), JSON.stringify(assessmentRules))
const baseline: ReturnType<typeof evaluateGraphIntegrity>[] = [graph, ...assessmentRules, ...['CQR-000', 'CQR-002', 'CQR-003', 'CQR-301', 'CQR-401', 'CQR-501', 'CQR-302']
  .map(id => ({ id, status: 'pass' as const, summary: 'Other isolated fixture requirement passed' }))]
const routes = [{ scopeId: 'fixture', label: 'Fixture', maturity: 'M4' as const, selectedAtomicGoals: 1,
  rules: [{ id: 'CQR-101', status: 'pass' as const, summary: 'Fixture route passed' }] }]
const report = (validation: CurriculumVisualizationValidation): DeepUnderstandingSubjectReport => {
  const ids = new Set([goal.id]), other = new Set([goal.id])
  const complete = intersectStrictGoalGates(ids, [other, other, other, other, new Set(validation.readyGoalIds)])
  const result: DeepUnderstandingSubjectReport = { subject, label: 'Fixture', landscapeId: source.landscapeId,
    landscapePath: sourcePath, currentGoalIds: [...ids], denominator: 1, strictComplete: complete.length,
    remaining: 1 - complete.length, percentage: complete.length ? '100.0%' : '0.0%', strictCompleteGoalIds: complete,
    deferredVisualizationGoalIds: [...validation.deferredGoalIds], gates: { currentDescriptionResolutions: 1,
      currentPositiveEvidenceProfiles: 1, currentSemanticAtomicityDecisions: 1, currentMemoryReviewDecisions: 1,
      currentVisualizationQaRecords: validation.readyGoalIds.length },
    requiredChecks: deepUnderstandingCompletionCheckIds.map(id => ({ id,
      status: id === 'visualization-freshness-and-approval-check' && validation.issues.length ? 'fail' : 'pass' })),
    issues: [...validation.issues], visualizationValidation: structuredClone(validation), strictCompletionReady: false }
  result.strictCompletionReady = hasStrictDeepUnderstandingCompletion(result)
  return result
}
const deepRule = (validation: CurriculumVisualizationValidation) => evaluateDeepUnderstandingQa(fixture, sourcePath,
  { schemaVersion: 1, reportId: 'real-original-V-fixture', subjects: [report(validation)], blockingIssueCount: validation.issues.length }, validation)
const rules = (validation: CurriculumVisualizationValidation) => [...baseline, deepRule(validation)]
const maturity = (validation: CurriculumVisualizationValidation) => deriveCurriculumMaturity(rules(validation), routes,
  source.landscapeId, assessment, validation)
const floors = (claimed: string, ruleSet = rules(current), expected: CurriculumVisualizationValidation | null = current) =>
  collectCurriculumMaturityFloorFailures({ curricula: [{ landscapeId: source.landscapeId, frameworkId: source.frameworkId,
    subject: source.subject, maturity: claimed, rules: ruleSet, scopes: routes }] }, {
    schemaVersion: 1, policyId: 'real-V-context-fixture', baselineDate: '2026-08-20', exceptions: [], knownPreBaselineRegressions: [],
    floors: [{ landscapeId: source.landscapeId, frameworkId: source.frameworkId, subject: source.subject,
      minimumMaturity: 'M7', reason: 'Current original-context V evidence must protect the existing M7 floor.' }],
  }, new Map([[source.landscapeId, assessment]]), expected ? new Map([[source.landscapeId, expected]]) : new Map())
if (rejectMutation) {
  assert.deepEqual(current.readyGoalIds, [])
  assert.match(current.issues.join(' '), /External visualization|Authenticated original-context capsule failed|Context receipt byte hash differs|Current goal\/image context differs|actual image bytes differ|Current image\/AI approval preconditions|current image\/AI approval preconditions/u)
  assert.equal(deepRule(current).status, 'fail')
  assert.equal(maturity(current), 'M6')
  const failures = floors('M7')
  assert.ok(failures.some(line => line.includes('no complete passing visualization context report')))
  assert.ok(!failures.some(line => line.includes('strict graph-integrity') || line.includes('assessment reports')))
  console.log('Actual private input/authority mutation rejected through V/CQR303/M6/direct floor with a real passing structural graph.')
  process.exit(0)
}
assert.equal(deepRule(current).status, 'pass')
assert.equal(maturity(current), 'M7')
assert.deepEqual(floors('M7'), [])
let negatives = 0
const denies = (name: string, validation: CurriculumVisualizationValidation, pattern: RegExp) => {
  assert.deepEqual(validation.readyGoalIds, [], name)
  assert.match(validation.issues.join(' '), pattern, name)
  assert.equal(deepRule(validation).status, 'fail', name)
  assert.equal(maturity(validation), 'M6', name)
  const failed = floors('M7', rules(validation), validation)
  assert.ok(failed.some(line => line.includes('no complete passing visualization context report')), name)
  assert.ok(!failed.some(line => line.includes('strict graph-integrity') || line.includes('assessment reports')), name)
  negatives++
}
// This is the original reproduced hole: freshly normalized display metadata,
// the same image and retained asset-only approval cannot review new competence.
const changedGoal = { ...goal, description: goal.description + ' Zusätzlich eine neue selbständige Leistung.' }
const relabelled = normalizeExistingRecord({ ...row, description: changedGoal.description }, { ...row })
assert.equal(relabelled.aiApproved, 'yes')
denies('Autogenerated current description cannot carry historical approval', native(changedGoal, relabelled), /Current goal\/image context differs/u)
assert.equal(maturity(native()), 'M7', 'No context result is cached across independent current reads.')
denies('Missing indexed receipt stays open', native({ ...goal, id: '00000000-0000-4000-8000-000000000099' },
  { ...row, goalId: '00000000-0000-4000-8000-000000000099' }), /Missing immutable reviewed-context receipt/u)
denies('Another namespace cannot borrow the original', native(goal, { ...row, landscapeId: 'foreign-owner' }, 'foreign-owner'), /Missing immutable reviewed-context receipt/u)
denies('Asset-only self-claim cannot change actual bytes', native(goal, { ...row, assetSha256: 'sha256:' + '1'.repeat(64),
  aiApprovedAssetSha256: 'sha256:' + '1'.repeat(64) }), /actual image bytes differ/u)
denies('Current negative AI decision remains binding', native(goal, { ...row, aiApproved: 'no' }), /approval preconditions/u)
denies('Technical deferral remains unfinished', native({ ...goal, resourceLinks: [] }, { ...row, visualizationState: 'missing',
  missingReason: 'deferred_provider_limitation', imageUrl: '', assetSha256: '' }), /missing or deferred/u)

// The original actual da47 definitions cannot stand in for the new current contexts.
const historical: { cases: Array<{ goal: LocalGoal; row: VisualizationGateRecord }> } = JSON.parse(readFileSync(resolve(root,
  'qa-artifacts/ci-contract-audit/2026-11-07/visualization-qualified-context-index-math3-2026-11-07/fixtures/historical-current-contexts.json'), 'utf8'))
for (const entry of economicsProbe ? [] : historical.cases) denies('Historical owner source is not a current reviewed definition: ' + entry.goal.id,
  native(entry.goal, entry.row), /Current goal\/image context differs/u)
denies('Full current EN context remains bound', native({ ...goal, descriptionEn: goal.descriptionEn + ' Additional unrelated competence.' }),
  /Current goal\/image context differs/u)
const previous: { rows: Array<{ landscapeId: string; goalId: string }> } = JSON.parse(readFileSync(resolve(root,
  'contracts/goal-visualization-context/v1/qualified-context-index-math3-2026-11-07.json'), 'utf8'))
const previousIds = new Set(previous.rows.map(row => row.landscapeId + ':' + row.goalId))
assert.deepEqual(fixedIndex.rows.filter(row => previousIds.has(row.landscapeId + ':' + row.goalId)), previous.rows)
assert.equal(fixedIndex.rows.filter(row => !previousIds.has(row.landscapeId + ':' + row.goalId)).length, 75)
const legacy74: typeof fixedIndex = JSON.parse(readFileSync(resolve(root,
  'contracts/goal-visualization-context/v1/qualified-context-index-economics17-2026-11-07.json'), 'utf8'))
const legacy74Ids = new Set(legacy74.rows.map(row => row.landscapeId + ':' + row.goalId))
assert.deepEqual(fixedIndex.rows.filter(row => legacy74Ids.has(row.landscapeId + ':' + row.goalId)), legacy74.rows)
assert.equal(fixedIndex.rows.filter(row => !legacy74Ids.has(row.landscapeId + ':' + row.goalId)).length, 58)
const goodRules = rules(current)
for (const mutated of [
  goodRules.filter(rule => rule.id !== 'CQR-303'),
  [...goodRules, deepRule(current)],
  goodRules.map(rule => rule.id === 'CQR-303' ? { ...rule, status: 'fail' as const } : rule),
  goodRules.map(rule => rule.id === 'CQR-303' ? { ...rule, visualizationValidation: undefined } : rule),
  goodRules.map(rule => rule.id === 'CQR-303' ? { ...rule, visualizationValidation: { ...current, readyGoalIds: [] } } : rule),
  goodRules.map(rule => rule.id === 'CQR-303' ? { ...rule, visualizationValidation: { ...current, contextsSha256: '1'.repeat(64) } } : rule),
  goodRules.map(rule => rule.id === 'CQR-303' ? { ...rule, visualizationValidation: { ...current, landscapeId: 'foreign-owner' } } : rule),
  goodRules.map(rule => rule.id === 'CQR-303' ? { ...rule, visualizationValidation: { ...current, currentGoalIds: [exam.id], readyGoalIds: [exam.id] } } : rule),
  goodRules.map(rule => rule.id === 'CQR-303' ? { ...rule, visualizationValidation: { ...current, currentGoalIds: [], readyGoalIds: [] },
    metrics: { ...rule.metrics, expectedGoals: 0, strictComplete: 0, currentVisualizationQaRecords: 0 } } : rule),
]) {
  assert.equal(deriveCurriculumMaturity(mutated, routes, source.landscapeId, assessment, current), 'M6')
  assert.ok(floors('M7', mutated).some(line => line.includes('no complete passing visualization context report')))
  negatives++
}
for (const metric of ['currentDescriptionResolutions', 'currentPositiveEvidenceProfiles', 'currentSemanticAtomicityDecisions',
  'currentMemoryReviewDecisions', 'currentVisualizationQaRecords', 'requiredChecksPassed', 'requiredChecksTotal', 'strictComplete',
  'expectedGoals', 'remaining', 'blockingIssues']) {
  const mutated = goodRules.map(rule => rule.id === 'CQR-303'
    ? { ...rule, metrics: { ...rule.metrics, [metric]: (rule.metrics?.[metric] ?? 0) + 1 } } : rule)
  assert.equal(deriveCurriculumMaturity(mutated, routes, source.landscapeId, assessment, current), 'M6')
  assert.ok(floors('M7', mutated).some(line => line.includes('no complete passing visualization context report')))
  negatives++
}
for (const absentOrFabricated of [undefined, structuredClone(current)]) {
  assert.equal(deriveCurriculumMaturity(goodRules, routes, source.landscapeId, assessment, absentOrFabricated), 'M6')
  assert.ok(floors('M7', goodRules, absentOrFabricated ?? null).some(line => line.includes('no complete passing visualization context report')))
  negatives++
}
const alias = deepRule(current)
assert.notEqual(alias.visualizationValidation?.readyGoalIds, current.readyGoalIds)
assert.throws(() => (current.readyGoalIds as string[]).splice(0), TypeError)
assert.equal(hasCompletePassingVisualizationContext(goodRules, source.landscapeId, current), true)
assert.equal(current.indexSha256, qualifiedVisualizationAuthority.indexSha256)
console.log(`Current original-context V → five-gate intersection → CQR-303 → M7 → direct floor passed; ${actualQualified} genuine shallow-capsule qualifications, ${negatives} genuine/context/manifest/expectation negatives; real valid strict graph.`)

// The new profile must receive actual caller metadata through the shared gate,
// including a supplied scalar level rather than silently dropping that field.
const mathPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const mathSource: SkillLandscape = economicsProbe ? JSON.parse(readFileSync(resolve(root, mathPath), 'utf8')) : source
const mathQa: { records: VisualizationGateRecord[] } = economicsProbe
  ? JSON.parse(readFileSync(resolve(root, 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'), 'utf8')) : ledger
const math58Goal = mathSource.goals.find(goal => goal.id === 'b41cb496-dad5-596e-9c23-cdcbdab3ec2e')! as LocalGoal
const math58Row = mathQa.records.find(row => row.goalId === math58Goal.id)!
const math58Native = (definition: LocalGoal) => evaluateCurrentVisualizationGate({ repositoryRoot: root,
  landscapeId: mathSource.landscapeId, landscapePath: mathPath, subject: 'mathematik',
  goalById: new Map([[definition.id, definition]]), currentGoalIds: new Set([definition.id]), records: [math58Row] })
assert.deepEqual(math58Native(math58Goal).readyGoalIds, [math58Goal.id])
const math58Mutations: LocalGoal[] = [
  { ...math58Goal, titleEn: math58Goal.titleEn + ' Changed competence.' },
  { ...math58Goal, dimensionTags: { ...math58Goal.dimensionTags, demandLevel: math58Goal.dimensionTags?.demandLevel === 'AB1' ? 'AB2' : 'AB1' } },
  { ...math58Goal, level: math58Goal.level === 2 ? 3 : 2 },
]
for (const definition of math58Mutations) {
  const checked = math58Native(definition)
  assert.deepEqual(checked.readyGoalIds, [])
  assert.match(checked.issues.join(' '), /Current goal\/image context differs|Math58 current DE\/EN\/demand\/level\/phase differs/u)
}

// Additional real Q2 current-input checks at the ordinary native V boundary.
const econPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
const econSource = JSON.parse(readFileSync(resolve(root, econPath), 'utf8')) as SkillLandscape
const econQa = JSON.parse(readFileSync(resolve(root, 'curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json'), 'utf8')) as { records: VisualizationGateRecord[] }
const q2Id = 'da73483a-2c18-5d42-b4f3-6ac6bcd6b5b0', deOnlyId = '676684da-5ba2-5c2a-ba7e-a8413915c29c'
const q2Goal = econSource.goals.find(goal => goal.id === q2Id)! as LocalGoal
const q2Row = econQa.records.find(row => row.goalId === q2Id)!
const econNative = (definition: LocalGoal, record = econQa.records.find(row => row.goalId === definition.id)!) =>
  evaluateCurrentVisualizationGate({ repositoryRoot: root, landscapeId: econSource.landscapeId, landscapePath: econPath,
    subject: 'wirtschaftswissenschaften', goalById: new Map([[definition.id, definition]]), currentGoalIds: new Set([definition.id]), records: [record] })
assert.deepEqual(econNative(q2Goal).readyGoalIds, [q2Id])
for (const [name, definition, record] of [
  ['Q2 actual DE', { ...q2Goal, description: q2Goal.description + ' Neue eigene Leistung.' }, { ...q2Row, description: q2Goal.description + ' Neue eigene Leistung.' }],
  ['Q2 supplied EN', { ...q2Goal, descriptionEn: q2Goal.descriptionEn + ' Different competence.' }, q2Row],
  ['Q2 supplied demand', { ...q2Goal, dimensionTags: { ...q2Goal.dimensionTags, demandLevel: 'AB1' } }, q2Row],
  ['Q2 duplicate primary role', { ...q2Goal, resourceLinks: [...(q2Goal.resourceLinks ?? []), q2Goal.resourceLinks!.find(link => link.role === 'primary')!] }, q2Row],
] as const) {
  const checked = econNative(definition, record)
  assert.deepEqual(checked.readyGoalIds, [], name)
  assert.ok(checked.issues.length > 0, name)
}
assert.deepEqual(econNative(q2Goal).readyGoalIds, [q2Id], 'Q2 original context survives independent current reads')
const deOnlyGoal = econSource.goals.find(goal => goal.id === deOnlyId)! as LocalGoal
const deOnlyDrift = econNative({ ...deOnlyGoal, titleEn: 'Outside attested DE scope', descriptionEn: 'No English approval claimed.',
  dimensionTags: { ...deOnlyGoal.dimensionTags, demandLevel: 'AB1' } })
assert.deepEqual(deOnlyDrift.readyGoalIds, [deOnlyId], 'DE-only V pass does not certify EN/demand or curriculum scope')
// Test-only mutable RAM aliases never select production authority or alter host files.
for (const option of ['--cache-index-path=', '--cache-receipt-path=']) {
  const path = process.argv.find(value => value.startsWith(option))?.slice(option.length)
  if (!path) continue
  assert.ok(path.startsWith('/dev/shm/'))
  const raw = readFileSync(path)
  try {
    writeFileSync(path, Buffer.concat([raw, Buffer.from('\n')]))
    denies('Cached authority still rejects changed actual ' + option, native(), /External visualization|Context receipt byte hash differs/u)
  } finally { writeFileSync(path, raw) }
  assert.deepEqual(native().readyGoalIds, [goal.id], 'Restored exact private bytes are read again')
}
console.log('Exact Q2 DE/EN/demand and primary-role negatives passed; corrected676684da retains only its original DE V scope.')
