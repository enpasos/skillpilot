import assert from 'node:assert/strict'
import { dirname, resolve } from 'node:path'
import {
  claimUniqueGoal,
  duplicateValues,
  formatRolloutPercentage,
  generateDeepUnderstandingRollout,
  intersectStrictGoalGates,
  resolveResolutionBatchArtifactPath,
} from './reportDeepUnderstandingRollout'

assert.deepEqual(duplicateValues(['a', 'b', 'a', 'c', 'b']), ['a', 'b'])
assert.equal(formatRolloutPercentage(0, 429), '0.0%')
assert.equal(formatRolloutPercentage(20, 800), '2.5%')
assert.equal(formatRolloutPercentage(1, null), 'n/a')

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
}

console.log(`Deep-understanding rollout self-test passed: strict 5-gate intersection, fail-closed ownership, and live denominators Math=${mathematics.denominator}/Physics=${physics.denominator}.`)
