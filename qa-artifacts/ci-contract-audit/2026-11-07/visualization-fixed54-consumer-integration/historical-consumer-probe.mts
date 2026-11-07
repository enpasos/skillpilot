// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const root = process.cwd()
const cqr = await import(pathToFileURL(resolve(root, 'app/scripts/generateCurriculumQualityStatus.ts')).href)
const deep = await import(pathToFileURL(resolve(root, 'app/scripts/reportDeepUnderstandingRollout.ts')).href)
const floor = await import(pathToFileURL(resolve(root, 'app/scripts/checkCurriculumMaturityFloors.ts')).href)
const path = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const qa = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'
const source = JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const goal = source.goals.find((g: { id: string }) => g.id === '922d89fc-1cbd-56e9-ac5d-5cb59085de6c')
const config = deep.loadDeepUnderstandingRolloutConfig().subjects.find((s: { subject: string }) => s.subject === 'mathematik')
const issues: string[] = [], deferred = new Set<string>()
const result = deep.probeLoadVisualizationReadyGoals(config, {
  landscape: source, rawLandscape: source, goalById: new Map(source.goals.map((g: { id: string }) => [g.id, g])),
  rawGoalById: new Map(source.goals.map((g: { id: string }) => [g.id, g])), atomicGoalIds: new Set([goal.id]), denominator: 1, issues: [],
}, issues, deferred)
const ready: Set<string> = result instanceof Set ? result : result.ready
const validation = result instanceof Set ? undefined : result.validation
const exam = source.goals.find((g: { examData?: unknown }) => g.examData && cqr.evaluateExamTaskReadiness([g]).status === 'pass')
const clusterIds = [...new Set(cqr.routeProfiles.filter((p: { landscapeId: string }) => p.landscapeId === source.landscapeId)
  .flatMap((p: { terminalAutonomyClusterIds: string[]; terminalAutonomyClusterIdsByDurationModel?: Record<string, string[]> }) =>
    [...p.terminalAutonomyClusterIds, ...Object.values(p.terminalAutonomyClusterIdsByDurationModel ?? {}).flat()]))]
const fixture = { ...source, goals: [{ ...goal, weight: 1, requires: [], contains: [] }, { ...exam, weight: 1, requires: [], contains: [] },
  ...clusterIds.map(id => ({ ...source.goals.find((g: { id: string }) => g.id === id), weight: 1, requires: [], contains: [exam.id] }))] }
const graph = cqr.evaluateGraphIntegrity(fixture, [fixture])
assert.equal(graph.status, 'pass')
const assessment = cqr.discoverCurriculumAssessmentScope(fixture, [])
const ids = new Set([goal.id])
const complete = deep.intersectStrictGoalGates(ids, [ids, ids, ids, ids, ready])
const subject = { subject: 'mathematik', label: 'Real context mutation', landscapeId: source.landscapeId, landscapePath: path,
  currentGoalIds: [goal.id], denominator: 1, strictComplete: complete.length, remaining: 1 - complete.length,
  percentage: complete.length ? '100.0%' : '0.0%', strictCompleteGoalIds: complete, deferredVisualizationGoalIds: [],
  gates: { currentDescriptionResolutions: 1, currentPositiveEvidenceProfiles: 1, currentSemanticAtomicityDecisions: 1,
    currentMemoryReviewDecisions: 1, currentVisualizationQaRecords: ready.size },
  requiredChecks: deep.deepUnderstandingCompletionCheckIds.map((id: string) => ({ id,
    status: id === 'visualization-freshness-and-approval-check' && issues.length ? 'fail' : 'pass' })),
  visualizationValidation: validation && structuredClone(validation), issues, strictCompletionReady: false }
subject.strictCompletionReady = deep.hasStrictDeepUnderstandingCompletion(subject)
const projected = cqr.evaluateDeepUnderstandingQa(fixture, path,
  { schemaVersion: 1, reportId: 'actual-original-consumer-mutation', subjects: [subject], blockingIssueCount: issues.length }, validation)
const rules = [graph, ...cqr.evaluateCurriculumExamReadiness(fixture, [], [fixture], assessment), projected,
  ...['CQR-000', 'CQR-002', 'CQR-003', 'CQR-301', 'CQR-401', 'CQR-501', 'CQR-302'].map(id => ({ id, status: 'pass', summary: 'Other isolated requirement passed' }))]
const scopes = [{ scopeId: 'fixture', label: 'Fixture', maturity: 'M4', selectedAtomicGoals: 1,
  rules: [{ id: 'CQR-101', status: 'pass', summary: 'Fixture route passed' }] }]
const maturity = cqr.deriveCurriculumMaturity(rules, scopes, source.landscapeId, assessment, validation)
const failures = floor.collectCurriculumMaturityFloorFailures({ curricula: [{ landscapeId: source.landscapeId,
  subject: source.subject, frameworkId: source.frameworkId, maturity: 'M7', rules, scopes }] }, {
  schemaVersion: 1, policyId: 'genuine-context-mutation-floor', baselineDate: '2026-08-20', exceptions: [], knownPreBaselineRegressions: [],
  floors: [{ landscapeId: source.landscapeId, subject: source.subject, frameworkId: source.frameworkId,
    minimumMaturity: 'M7', reason: 'A changed context cannot retain past approval.' }],
}, new Map([[source.landscapeId, assessment]]), validation && new Map([[source.landscapeId, validation]]))
const output = { actualGraphReady: graph.status, originalAssetApproval: JSON.parse(readFileSync(resolve(root, qa), 'utf8'))
  .records.find((r: { goalId: string }) => r.goalId === goal.id).aiApproved, readyGoalIds: [...ready], cqr303: projected.status,
  maturity, floorFailures: failures, issues }
console.log(JSON.stringify(output, null, 2))
assert.equal(ready.has(goal.id), false, 'Changed actual goal/normalized row must not retain historical V approval')
assert.equal(projected.status, 'fail')
assert.equal(maturity, 'M6')
assert.ok(failures.some((line: string) => line.includes('visualization context report')))
