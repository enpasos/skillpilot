import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildPositiveGoalEvidenceCandidateRecords,
} from './materializePositiveGoalEvidenceCandidates'
import type { PositiveGoalEvidenceReviewRecord } from './positiveGoalEvidenceProfileModel'
import type { PositiveGoalEvidenceReviewConfig } from './positiveGoalEvidenceReview'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const configPath = resolve(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-calibration-v2.config.json',
)

const config = JSON.parse(await readFile(configPath, 'utf8')) as PositiveGoalEvidenceReviewConfig
const reviewPath = resolve(repositoryRoot, config.reviewPath)
const records = (await readFile(reviewPath, 'utf8'))
  .split(/\r?\n/u)
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => JSON.parse(line) as PositiveGoalEvidenceReviewRecord)

assert.ok(records.length > 0, 'Expected at least one current calibration profile fixture')
assert.ok(
  records.every(({ reviewedAt }) => reviewedAt === records[0].reviewedAt),
  'Materializer fixture records must share one reviewedAt value',
)
assert.ok(
  records.every(({ reviewer }) => reviewer === records[0].reviewer),
  'Materializer fixture records must share one reviewer value',
)

const materialized = await buildPositiveGoalEvidenceCandidateRecords({
  config,
  candidateSet: {
    schemaVersion: 1,
    authoringContract: 'positive-understanding-evidence-candidates-v1',
    reviewId: config.reviewId,
    reviewedAt: records[0].reviewedAt,
    reviewer: records[0].reviewer,
    goals: records.map((record) => ({
      goalId: record.goalId,
      reason: record.reason,
      evidenceLevel: record.evidenceLevel,
      maximumClaimScope: record.maximumClaimScope,
      dissent: record.dissent,
      profile: record.profile,
    })),
  },
})

assert.deepEqual(materialized, records)

await assert.rejects(
  buildPositiveGoalEvidenceCandidateRecords({
    config,
    candidateSet: {
      schemaVersion: 1,
      authoringContract: 'positive-understanding-evidence-candidates-v1',
      reviewId: config.reviewId,
      reviewedAt: records[0].reviewedAt,
      reviewer: records[0].reviewer,
      goals: [...records]
        .reverse()
        .map((record) => ({
          goalId: record.goalId,
          reason: record.reason,
          evidenceLevel: record.evidenceLevel,
          maximumClaimScope: record.maximumClaimScope,
          dissent: record.dissent,
          profile: record.profile,
        })),
    },
  }),
  /must match the configured scope exactly and in order/u,
)

console.log(`Positive understanding-evidence candidate materializer self-test passed: ${records.length} profile(s).`)
