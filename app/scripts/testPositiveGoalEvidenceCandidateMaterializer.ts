import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildPositiveGoalEvidenceCandidateRecords,
  replaceFileAtomically,
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

const atomicWriteDirectory = await mkdtemp(join(tmpdir(), 'skillpilot-positive-evidence-atomic-'))
try {
  const targetPath = join(atomicWriteDirectory, 'review.jsonl')
  const expectedBytes = Buffer.from('{"goalId":"new"}\n')
  await writeFile(targetPath, '{"goalId":"old"}\n')
  await replaceFileAtomically(targetPath, expectedBytes)
  assert.deepEqual(await readFile(targetPath), expectedBytes)
  assert.deepEqual(await readdir(atomicWriteDirectory), ['review.jsonl'])
} finally {
  await rm(atomicWriteDirectory, { recursive: true, force: true })
}

const targetPath = '/repository/review.jsonl'
const oldTargetBytes = Buffer.from('{"goalId":"old"}\n')
const replacementBytes = Buffer.from('{"goalId":"new"}\n')
let targetBytes = oldTargetBytes
let temporaryPath = ''
const temporaryFiles = new Map<string, Buffer>()
const operationOrder: string[] = []
await replaceFileAtomically(targetPath, replacementBytes, {
  writeFile: async (path, bytes, options) => {
    assert.notEqual(path, targetPath)
    assert.equal(dirname(path), dirname(targetPath))
    assert.equal(options.flag, 'wx')
    assert.deepEqual(targetBytes, oldTargetBytes)
    temporaryPath = path
    temporaryFiles.set(path, Buffer.from(bytes))
    operationOrder.push('write-temp')
  },
  rename: async (sourcePath, destinationPath) => {
    assert.equal(sourcePath, temporaryPath)
    assert.equal(destinationPath, targetPath)
    assert.deepEqual(targetBytes, oldTargetBytes)
    targetBytes = temporaryFiles.get(sourcePath) ?? Buffer.alloc(0)
    temporaryFiles.delete(sourcePath)
    operationOrder.push('rename')
  },
  rm: async () => {
    assert.fail('Successful atomic replacement must not need cleanup')
  },
})
assert.deepEqual(operationOrder, ['write-temp', 'rename'])
assert.deepEqual(targetBytes, replacementBytes)
assert.equal(temporaryFiles.size, 0)

const renameFailure = new Error('simulated rename failure')
targetBytes = oldTargetBytes
temporaryPath = ''
await assert.rejects(
  replaceFileAtomically(targetPath, replacementBytes, {
    writeFile: async (path, bytes) => {
      temporaryPath = path
      temporaryFiles.set(path, Buffer.from(bytes))
    },
    rename: async () => {
      throw renameFailure
    },
    rm: async (path, options) => {
      assert.equal(path, temporaryPath)
      assert.equal(options.force, true)
      temporaryFiles.delete(path)
    },
  }),
  (error) => error === renameFailure,
)
assert.deepEqual(targetBytes, oldTargetBytes)
assert.equal(temporaryFiles.size, 0)

const writeFailure = new Error('simulated partial temporary write failure')
temporaryPath = ''
await assert.rejects(
  replaceFileAtomically(targetPath, replacementBytes, {
    writeFile: async (path, bytes) => {
      temporaryPath = path
      temporaryFiles.set(path, Buffer.from(bytes.subarray(0, 4)))
      throw writeFailure
    },
    rename: async () => {
      assert.fail('A failed temporary write must never be renamed')
    },
    rm: async (path, options) => {
      assert.equal(path, temporaryPath)
      assert.equal(options.force, true)
      temporaryFiles.delete(path)
    },
  }),
  (error) => error === writeFailure,
)
assert.deepEqual(targetBytes, oldTargetBytes)
assert.equal(temporaryFiles.size, 0)

console.log(`Positive understanding-evidence candidate materializer self-test passed: ${records.length} profile(s).`)
