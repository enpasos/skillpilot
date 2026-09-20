import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  claimUniqueGoal,
  deepUnderstandingCompletionCheckIds,
  duplicateValues,
  formatRolloutPercentage,
  generateDeepUnderstandingRollout,
  hasCompletedDeepUnderstandingVisualizationReview,
  hasStrictDeepUnderstandingCompletion,
  intersectStrictGoalGates,
  loadDeepUnderstandingRolloutConfig,
  resolveResolutionBatchArtifactPath,
  type DeepUnderstandingSubjectReport,
} from './reportDeepUnderstandingRollout'
import {
  countHumanTrialBlockingFindings,
  deriveCurriculumMaturity,
  evaluateDeepUnderstandingQa,
} from './generateCurriculumQualityStatus'
import type { SkillLandscape } from '../src/landscapeTypes'
import { reviewPositiveGoalEvidenceConfig } from './positiveGoalEvidenceReview'
import { validatePositiveGoalEvidenceRecordSemantics } from './positiveGoalEvidenceProfileModel'

assert.deepEqual(duplicateValues(['a', 'b', 'a', 'c', 'b']), ['a', 'b'])
assert.equal(formatRolloutPercentage(0, 429), '0.0%')
assert.equal(formatRolloutPercentage(20, 800), '2.5%')
assert.equal(formatRolloutPercentage(1, null), 'n/a')

const completeReport: DeepUnderstandingSubjectReport = {
  subject: 'fixture', label: 'Fixture', landscapeId: 'fixture-landscape', landscapePath: 'fixture.json',
  currentGoalIds: ['goal-a', 'goal-b'], denominator: 2, strictComplete: 2, remaining: 0, percentage: '100.0%',
  strictCompleteGoalIds: ['goal-a', 'goal-b'], deferredVisualizationGoalIds: [],
  gates: {
    currentDescriptionResolutions: 2, currentPositiveEvidenceProfiles: 2,
    currentSemanticAtomicityDecisions: 2, currentMemoryReviewDecisions: 2, currentVisualizationQaRecords: 2,
  },
  requiredChecks: deepUnderstandingCompletionCheckIds.map((id) => ({ id, status: 'pass' })),
  strictCompletionReady: true, issues: [],
}
assert.equal(hasStrictDeepUnderstandingCompletion(completeReport), true)
for (const patch of [
  { denominator: null },
  { denominator: 0, currentGoalIds: [], strictCompleteGoalIds: [] },
  { currentGoalIds: ['goal-a', 'new-goal'] },
  { currentGoalIds: ['goal-a', 'goal-a'] },
  { strictCompleteGoalIds: ['goal-a', 'retired-goal'] },
  { strictCompleteGoalIds: ['goal-a', 'goal-a'] },
  { strictCompleteGoalIds: ['goal-a'] },
  { issues: ['An unresolved current finding'] },
  { requiredChecks: completeReport.requiredChecks.slice(1) },
  { requiredChecks: completeReport.requiredChecks.map((check) => ({ ...check, status: 'fail' as const })) },
  { requiredChecks: completeReport.requiredChecks.map(() => completeReport.requiredChecks[0]) },
]) assert.equal(hasStrictDeepUnderstandingCompletion({ ...completeReport, ...patch }), false, JSON.stringify(patch))
const roundedIds = Array.from({ length: 3000 }, (_, index) => `goal-${index}`)
assert.equal(formatRolloutPercentage(2999, 3000), '100.0%')
assert.equal(hasStrictDeepUnderstandingCompletion({
  ...completeReport, denominator: 3000, currentGoalIds: roundedIds, strictCompleteGoalIds: roundedIds.slice(1),
}), false, 'A rounded 100% must never grant M7.')

const imageReview = {
  goalId: 'goal-a', visualizationState: 'available' as const, missingReason: '',
  assetSha256: `sha256:${'a'.repeat(64)}`, aiApprovedAssetSha256: `sha256:${'a'.repeat(64)}`,
  humanApproved: 'no', humanIssueIdentified: 'no', aiApproved: 'yes',
}
assert.equal(hasCompletedDeepUnderstandingVisualizationReview(imageReview), true)
assert.equal(imageReview.humanApproved, 'no', 'An accepted AI review must not create human approval.')
assert.equal(hasCompletedDeepUnderstandingVisualizationReview({
  ...imageReview, humanIssueIdentified: 'yes',
}), true, 'A separate human finding must not change the machine-only M7 gate.')
assert.equal(hasCompletedDeepUnderstandingVisualizationReview({
  ...imageReview,
  aiApproved: 'no',
  humanApproved: 'yes',
}), false, 'Human approval alone must not satisfy the machine-only M7 gate.')
assert.equal(hasCompletedDeepUnderstandingVisualizationReview({ ...imageReview, aiApprovedAssetSha256: 'stale' }), false)
assert.equal(hasCompletedDeepUnderstandingVisualizationReview({
  ...imageReview, visualizationState: 'missing', missingReason: 'deferred_provider_limitation', humanApproved: 'yes',
}), false, 'Even a formerly approved image cannot complete deferred necessary work.')

const fixtureLandscape = {
  landscapeId: 'fixture-landscape', goals: [{ id: 'goal-a' }, { id: 'goal-b' }],
} as SkillLandscape
const projected = evaluateDeepUnderstandingQa(fixtureLandscape, 'fixture.json', {
  schemaVersion: 1, reportId: 'fixture', subjects: [completeReport, {
    ...completeReport, subject: 'other', landscapeId: 'other', landscapePath: 'other.json',
    strictCompletionReady: false, issues: ['Another subject has a validation failure'],
  }], blockingIssueCount: 1,
})
assert.equal(projected.status, 'pass', 'One subject must not wait for another subject.')
assert.equal(projected.metrics?.expectedGoals, 2)
assert.equal(projected.metrics?.strictComplete, 2)
const noScopeReport = { schemaVersion: 1 as const, reportId: 'fixture', subjects: [], blockingIssueCount: 0 }
assert.equal(evaluateDeepUnderstandingQa(fixtureLandscape, 'fixture.json', noScopeReport).status, 'not_configured')
assert.equal(evaluateDeepUnderstandingQa(fixtureLandscape, 'mismatched.json', {
  ...noScopeReport, subjects: [completeReport],
}).status, 'fail')
assert.equal(evaluateDeepUnderstandingQa(fixtureLandscape, 'fixture.json', {
  ...noScopeReport, subjects: [{ ...completeReport, denominator: null, strictCompletionReady: false }],
}).metrics?.expectedGoals, undefined, 'Unknown target scope must not be shown as zero goals.')

const coreRules = ['CQR-000', 'CQR-001', 'CQR-002', 'CQR-003', 'CQR-301', 'CQR-401', 'CQR-501']
  .map((id) => ({ id, status: 'pass' as const, summary: 'Fixture prerequisite passed' }))
const routeScopes = [{
  scopeId: 'fixture', label: 'Fixture', maturity: 'M4' as const, selectedAtomicGoals: 2,
  rules: [{ id: 'CQR-101', status: 'pass' as const, summary: 'Fixture route passed' }],
}]
const memoryPassed = { id: 'CQR-302', status: 'pass' as const, summary: 'Fixture memory passed' }
assert.equal(deriveCurriculumMaturity([...coreRules, projected], routeScopes), 'M5', 'M7 requires current M6.')
assert.equal(deriveCurriculumMaturity([...coreRules, memoryPassed, projected], routeScopes), 'M7')
assert.equal(deriveCurriculumMaturity([...coreRules, memoryPassed, { ...projected, status: 'warn' }], routeScopes), 'M6')
assert.equal(deriveCurriculumMaturity([...coreRules, memoryPassed, projected], []), 'M2', 'M7 cannot bypass lower route gates.')
assert.equal(countHumanTrialBlockingFindings(fixtureLandscape, [{ schemaVersion: 1, records: [
  { goalId: 'goal-a', landscapeId: 'fixture-landscape', humanIssueIdentified: 'yes' },
  { goalId: 'goal-a', landscapeId: 'fixture-landscape', humanIssueIdentified: 'yes' },
  { goalId: 'goal-b', landscapeId: 'fixture-landscape', humanIssueIdentified: 'no' },
  { goalId: 'removed-goal', landscapeId: 'fixture-landscape', humanIssueIdentified: 'yes' },
  { goalId: 'goal-b', landscapeId: 'other-landscape', humanIssueIdentified: 'yes' },
] }]), 1, 'Findings are current, deduplicated and scoped to one curriculum.')

// Exercise the production P validator, including a scope that mandates human approval.
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const configuredEvidence = loadDeepUnderstandingRolloutConfig().subjects[0].positiveEvidenceConfigPaths[0]
const evidenceReview = reviewPositiveGoalEvidenceConfig(configuredEvidence)
assert.deepEqual(evidenceReview.errors, [])
const aiCandidate = evidenceReview.records.find(({ reviewAuthority }) => reviewAuthority === 'ai_candidate')
assert.ok(aiCandidate, 'The rollout fixture must retain an honestly identified AI candidate.')
assert.equal(aiCandidate.status, 'needs_human_review')
const evidenceLandscape = JSON.parse(readFileSync(resolve(repositoryRoot, evidenceReview.config.landscapePath), 'utf8')) as SkillLandscape
const evidenceGoal = evidenceLandscape.goals.find(({ id }) => id === aiCandidate.goalId)
assert.ok(validatePositiveGoalEvidenceRecordSemantics({ ...aiCandidate, goalFingerprint: 'stale' }, evidenceGoal, {}, 'curricularAtomic')
  .some((error) => error.includes('stale goalFingerprint')))
assert.ok(validatePositiveGoalEvidenceRecordSemantics({ ...aiCandidate, status: 'approved' }, evidenceGoal, {}, 'curricularAtomic')
  .some((error) => error.includes('approved profiles require human reviewAuthority')))
mkdirSync(resolve(repositoryRoot, 'tmp'), { recursive: true })
const approvalFixtureDir = mkdtempSync(resolve(repositoryRoot, 'tmp/m7-human-approval-'))
try {
  const approvalConfigPath = resolve(approvalFixtureDir, 'require-approved.config.json')
  writeFileSync(approvalConfigPath, JSON.stringify({ ...evidenceReview.config, requireApproved: true }))
  const requiredApproval = reviewPositiveGoalEvidenceConfig(relative(repositoryRoot, approvalConfigPath))
  assert.ok(requiredApproval.errors.some((error) => error.includes('configured scope requires an approved profile')),
    'A mandatory human approval must continue to block a valid AI candidate.')
} finally {
  rmSync(approvalFixtureDir, { recursive: true, force: true })
}

const scope = new Set(['complete', 'missing-description', 'missing-evidence', 'missing-dependent-qa'])
const description = new Set(['complete', 'missing-evidence', 'missing-dependent-qa'])
const evidence = new Set(['complete', 'missing-description', 'missing-dependent-qa'])
const atomicity = new Set(['complete', 'missing-description', 'missing-evidence'])
const memory = new Set(['complete', 'missing-description', 'missing-evidence', 'missing-dependent-qa'])
const visualization = new Set(['complete', 'missing-description', 'missing-evidence', 'missing-dependent-qa'])
assert.deepEqual(
  intersectStrictGoalGates(scope, [description, evidence, atomicity, memory, visualization]),
  ['complete'],
  'Every strict gate must be present before a goal counts.',
)
for (let missingGate = 0; missingGate < 5; missingGate += 1) {
  assert.deepEqual(intersectStrictGoalGates(new Set(['goal-a']), Array.from({ length: 5 }, (_, index) => (
    new Set(index === missingGate ? [] : ['goal-a'])
  ))), [], `Missing gate ${missingGate} must leave the goal incomplete.`)
}

const owners = new Map<string, string>()
const ready = new Set<string>()
assert.equal(claimUniqueGoal('goal-1', 'batch-a', owners, ready), null)
assert.equal(ready.has('goal-1'), true)
assert.equal(claimUniqueGoal('goal-1', 'batch-b', owners, ready), 'batch-a')
assert.equal(ready.has('goal-1'), false, 'An overlapping goal must fail closed.')

const compositeIndexPath = resolve(
  '/tmp/skillpilot-deep-understanding-fixture/checkpoint-current-2026-08-26/resolution-index.json',
)
const groupRelativeResolutionPath = resolve(
  dirname(compositeIndexPath),
  '../calibration-v2/2026-08-25/final-20-v6/resolutions/goal-physics-01.resolution.json',
)
assert.equal(
  resolveResolutionBatchArtifactPath(groupRelativeResolutionPath, 'synthesis-decisions.json'),
  resolve(
    '/tmp/skillpilot-deep-understanding-fixture/calibration-v2/2026-08-25/final-20-v6/synthesis-decisions.json',
  ),
  'A composite index must resolve the manifest from the concrete resolution batch, not from the index directory.',
)
assert.throws(
  () => resolveResolutionBatchArtifactPath(
    groupRelativeResolutionPath,
    '../foreign-batch/synthesis-decisions.json',
  ),
  /leaves its batch root/u,
  'A resolution-bound manifest path must not escape its concrete batch root.',
)

const report = await generateDeepUnderstandingRollout()
assert.equal(report.blockingIssueCount, 0)
const mathematics = report.subjects.find(({ subject }) => subject === 'mathematik')
const physics = report.subjects.find(({ subject }) => subject === 'physik')
assert.ok(mathematics)
assert.ok(physics)
for (const subject of [mathematics, physics]) {
  assert.ok(subject.denominator && subject.denominator > 0)
  assert.equal(subject.strictCompleteGoalIds.length, subject.strictComplete)
  assert.ok(subject.strictComplete <= subject.denominator)
  assert.equal(subject.percentage, formatRolloutPercentage(subject.strictComplete, subject.denominator))
  assert.ok(subject.gates.currentDescriptionResolutions >= subject.strictComplete)
  assert.ok(subject.gates.currentPositiveEvidenceProfiles >= subject.strictComplete)
  assert.equal(subject.gates.currentSemanticAtomicityDecisions, subject.denominator)
  assert.equal(subject.gates.currentMemoryReviewDecisions, subject.denominator)
  assert.ok(subject.gates.currentVisualizationQaRecords >= subject.strictComplete)
  assert.equal(subject.strictCompletionReady, hasStrictDeepUnderstandingCompletion(subject))
  assert.ok(subject.requiredChecks.every(({ status }) => status === 'pass'))
  assert.equal(subject.currentGoalIds.length, subject.denominator)
  assert.ok(subject.deferredVisualizationGoalIds.every((goalId) => !subject.strictCompleteGoalIds.includes(goalId)))
}

console.log(`Deep-understanding rollout self-test passed: strict 5-gate intersection, fail-closed ownership, and live denominators Math=${mathematics.denominator}/Physics=${physics.denominator}.`)
