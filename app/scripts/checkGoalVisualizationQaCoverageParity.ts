import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type VisualizationState = 'available' | 'missing'

interface QaRecord {
  goalId: string
  visualizationState: VisualizationState
  missingReason: '' | 'no_primary_link' | 'deferred_provider_limitation'
  imageUrl: string
  assetSha256: string
}

interface QaLedger {
  schemaVersion: number
  subject: string
  records: QaRecord[]
}

interface RolloutReport {
  request: { subject: string }
  summary: {
    atomicGoalsInScope: number
    goalsWithPrimaryVisualization: number
    openProviderDeferredGoals: number
    regularUnlinkedGoals: number
    coverageGatePassed: boolean
  }
  qualityQueues: {
    openProviderDeferred: Array<{ goalId: string }>
  }
  visualizedGoals: Array<{ goalId: string }>
}

const assertSameGoalIds = (
  actual: string[],
  expected: string[],
  message: string,
): void => {
  assert.deepEqual(
    [...new Set(actual)].sort(),
    [...new Set(expected)].sort(),
    message,
  )
}

const scriptDir = fileURLToPath(new URL('.', import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const requestedSubjects = process.argv.slice(2)
  .flatMap((arg) => arg.replace(/^--subjects?=/u, '').split(','))
  .map((subject) => subject.trim())
  .filter(Boolean)
const subjects = requestedSubjects.length > 0
  ? requestedSubjects
  : ['mathematik', 'physik', 'chemie']

for (const subject of subjects) {
  assert.match(subject, /^[a-z][a-z0-9-]*$/u, `Invalid subject slug: ${subject}`)
  const qaPath = resolve(
    repoRoot,
    `curricula/DE/Gymnasium/quality/goal-visualization-qa/${subject}.qa.json`,
  )
  const rolloutPath = resolve(
    repoRoot,
    `curricula/DE/Gymnasium/quality/goal-visualization-review/${subject}-rollout-status.json`,
  )
  const qa = JSON.parse(readFileSync(qaPath, 'utf8')) as QaLedger
  const rollout = JSON.parse(readFileSync(rolloutPath, 'utf8')) as RolloutReport

  assert.equal(qa.schemaVersion, 1, `${subject}: unsupported QA schema`)
  assert.equal(qa.subject, subject, `${subject}: QA subject mismatch`)
  assert.equal(rollout.request.subject, subject, `${subject}: rollout subject mismatch`)

  const goalIds = qa.records.map((record) => record.goalId)
  assert.equal(new Set(goalIds).size, goalIds.length, `${subject}: duplicate QA goal IDs`)

  const available = qa.records.filter((record) => record.visualizationState === 'available')
  const missing = qa.records.filter((record) => record.visualizationState === 'missing')
  const deferred = missing.filter((record) => record.missingReason === 'deferred_provider_limitation')
  const regularMissing = missing.filter((record) => record.missingReason !== 'deferred_provider_limitation')

  available.forEach((record) => {
    assert.ok(record.imageUrl, `${subject}:${record.goalId}: available record has no image URL`)
    assert.match(record.assetSha256, /^sha256:[0-9a-f]{64}$/u, `${subject}:${record.goalId}: invalid asset hash`)
    assert.equal(record.missingReason, '', `${subject}:${record.goalId}: available record has a missing reason`)
  })
  missing.forEach((record) => {
    assert.equal(record.imageUrl, '', `${subject}:${record.goalId}: missing record has an image URL`)
    assert.equal(record.assetSha256, '', `${subject}:${record.goalId}: missing record has an asset hash`)
  })

  assert.equal(qa.records.length, rollout.summary.atomicGoalsInScope, `${subject}: target-scope mismatch`)
  assert.equal(available.length, rollout.summary.goalsWithPrimaryVisualization, `${subject}: active-image mismatch`)
  assert.equal(deferred.length, rollout.summary.openProviderDeferredGoals, `${subject}: deferred mismatch`)
  assert.equal(regularMissing.length, rollout.summary.regularUnlinkedGoals, `${subject}: regular-missing mismatch`)
  assert.equal(rollout.summary.coverageGatePassed, regularMissing.length === 0, `${subject}: coverage-gate mismatch`)
  assertSameGoalIds(
    available.map((record) => record.goalId),
    rollout.visualizedGoals.map((record) => record.goalId),
    `${subject}: active-image goal IDs differ between QA and rollout report`,
  )
  assertSameGoalIds(
    deferred.map((record) => record.goalId),
    rollout.qualityQueues.openProviderDeferred.map((record) => record.goalId),
    `${subject}: deferred goal IDs differ between QA and rollout report`,
  )
  if (regularMissing.length === 0) {
    assertSameGoalIds(
      qa.records.map((record) => record.goalId),
      [
        ...rollout.visualizedGoals.map((record) => record.goalId),
        ...rollout.qualityQueues.openProviderDeferred.map((record) => record.goalId),
      ],
      `${subject}: target-scope goal IDs differ between QA and rollout report`,
    )
  }

  console.log(
    `${subject}: QA/rollout parity passed (${qa.records.length} scope, ${available.length} active, ${deferred.length} deferred, ${regularMissing.length} regular missing).`,
  )
}
