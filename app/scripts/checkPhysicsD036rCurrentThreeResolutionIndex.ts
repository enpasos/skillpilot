import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  generateDeepUnderstandingRollout,
  validateLegacyResolutionIndexSnapshot,
  type AggregateResolutionIndex,
  type StandaloneBatchResolutionIndex,
} from './reportDeepUnderstandingRollout'

// This checker has no write mode. Original four-goal evidence stays immutable.
const root = fileURLToPath(new URL('../..', import.meta.url))
const batch = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/'
  + 'rollout-v1/2026-09-06/batch-036r-four-translations-current-4-v1'
const sourcePath = `${batch}/resolution-index.json`
const indexPath = `${batch}/resolution-index.current-three-v1.json`
const receiptPath = `${batch}/current-three-v1.compatibility-receipt.json`
const configPath = `${batch}/current-three-v1.validation-config.json`
const sourceDigest = 'sha256:2ec54c722626a6ebada6ef7d6bfd0ca403c9ab6ee19acbf3338ef056badaa3d0'
const includedGoalIds = [
  '84ddb244-e560-592f-9d43-e84c801fe5b4',
  '8ac61062-f63e-5935-96ae-84014906c368',
  'ce14a7e7-7e2a-517f-a465-78ba3fbe414d',
]
const excludedGoalId = 'badb0ef3-233d-560e-bc2a-9df99f09fe7d'
const bytes = (path: string) => readFileSync(resolve(root, path))
const json = <T>(path: string): T => JSON.parse(bytes(path).toString('utf8')) as T
const digest = (path: string) => `sha256:${createHash('sha256').update(bytes(path)).digest('hex')}`

const main = async () => {
  assert.equal(process.argv.length, 2, 'This read-only checker takes no arguments')
  assert.equal(digest(sourcePath), sourceDigest, 'Original four-goal index changed')
  const source = json<StandaloneBatchResolutionIndex>(sourcePath)
  const index = json<AggregateResolutionIndex>(indexPath)
  const receipt = json<{
    source: { indexPath: string; indexDigest: string; campaignGoalCount: number }
    includedGoalIds: string[]
    excluded: Array<{ goalId: string; strictCompleteClaimed: boolean }>
    denominatorSnapshot: {
      count: number; observedAt: string; semanticKindLedgerDigest: string
    }
    derivedView: { originalV2BatchCompleteClaimed: boolean; noCrossBatchAggregation: boolean }
  }>(receiptPath)
  assert.deepEqual(receipt.includedGoalIds, includedGoalIds)
  assert.equal(receipt.source.indexPath, sourcePath)
  assert.equal(receipt.source.indexDigest, sourceDigest)
  assert.equal(receipt.source.campaignGoalCount, 4)
  assert.deepEqual(receipt.excluded.map(({ goalId }) => goalId), [excludedGoalId])
  assert.equal(receipt.excluded[0].strictCompleteClaimed, false)
  assert.equal(receipt.derivedView.originalV2BatchCompleteClaimed, false)
  assert.equal(receipt.derivedView.noCrossBatchAggregation, true)
  // Historical metadata stays 465 even after unrelated additions to the live scope.
  assert.equal(receipt.denominatorSnapshot.count, 465)
  assert.equal(receipt.denominatorSnapshot.observedAt, '2026-09-08T02:12:04.245Z')
  assert.equal(receipt.denominatorSnapshot.semanticKindLedgerDigest,
    'sha256:8fac01d5c7cc6bd4d86b01c96d088ffe307c059639d6083eaaddf124ee179bc3')
  const selected = includedGoalIds.map((goalId) => {
    const entry = source.resolutions.find((candidate) => candidate.goalId === goalId)
    assert.ok(entry, `${goalId}: missing original resolution`)
    assert.equal(digest(`${batch}/${entry.resolutionPath}`), entry.resolutionDigest)
    return entry
  })
  assert.deepEqual(index, {
    schemaVersion: 1,
    artifactSetId: 'physik-rollout-v1-batch-036r-four-translations-current-4-v1-20260906-current-three-v1',
    subject: 'Physik',
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: 3,
    curriculumAtomicDenominator: 465,
    descriptionReviewPercentage: 0.6,
    groups: [{ ...source.groups[0], resolvedGoalCount: 3 }],
    resolutions: selected,
  }, 'Derived view must retain the exact three original entries and full campaign binding')
  assert.equal(digest(`${batch}/${source.groups[0].dualSummaryPath}`), source.groups[0].dualSummaryDigest)
  assert.deepEqual(validateLegacyResolutionIndexSnapshot(index), [])
  const config = json<{ subjects: Array<{
    resolutionIndexPaths: string[]; positiveEvidenceConfigPaths: string[]
  }> }>(configPath)
  assert.equal(config.subjects.length, 1)
  assert.deepEqual(config.subjects[0].resolutionIndexPaths, [indexPath])
  assert.deepEqual(config.subjects[0].positiveEvidenceConfigPaths, [])
  // Invoke the unchanged central reporter, which revalidates both complete
  // campaigns, the complete dual summary and each selected current resolution.
  const report = await generateDeepUnderstandingRollout(configPath)
  assert.equal(report.blockingIssueCount, 0, JSON.stringify(report.subjects.map(({ issues }) => issues)))
  assert.equal(report.subjects.length, 1)
  const subject = report.subjects[0]
  assert.equal(subject.subject, 'physik')
  assert.equal(subject.gates.currentDescriptionResolutions, 3)
  assert.equal(subject.gates.currentPositiveEvidenceProfiles, 0)
  assert.equal(subject.strictComplete, 0, 'This isolated audit makes no full five-gate completion claim')
  console.log(JSON.stringify({
    check: 'physics-d036r-current-three-index', status: 'PASS',
    indexPath, indexDigest: digest(indexPath), sourceIndexDigest: sourceDigest,
    originalCampaignGoalCount: 4, currentDescriptionResolutions: 3,
    snapshotDenominator: 465, liveDenominator: subject.denominator,
    blockingIssueCount: report.blockingIssueCount,
    centralRegistryChanged: false, fullFiveGateCompletionClaimed: false,
  }, null, 2))
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
