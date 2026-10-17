import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildPositiveGoalEvidenceCandidateRecords,
  replaceFileAtomically,
} from './materializePositiveGoalEvidenceCandidates'
import type { PositiveGoalEvidenceReviewRecord } from './positiveGoalEvidenceProfileModel'
import {
  reviewPositiveGoalEvidenceConfig,
  type PositiveGoalEvidenceReviewConfig,
} from './positiveGoalEvidenceReview'
import {
  candidateSet,
  criteria,
  expectedRecords,
  goals,
  landscapeId,
} from './fixtures/positiveGoalEvidenceCandidates'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const temporaryParent = join(repositoryRoot, 'tmp')
await mkdir(temporaryParent, { recursive: true })
const temporaryRoot = await mkdtemp(join(temporaryParent, 'positive-evidence-materializer-test-'))
const repositoryRelative = (path: string) => relative(repositoryRoot, path).replaceAll('\\', '/')
const configPath = join(temporaryRoot, 'config.json')
const config: PositiveGoalEvidenceReviewConfig = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
  schemaVersion: 2,
  reviewId: candidateSet.reviewId,
  goalFingerprintRuleVersion: 'goal-evidence-v1',
  profileRuleVersion: 'positive-understanding-evidence-v2',
  landscapeId,
  landscapePath: repositoryRelative(join(temporaryRoot, 'landscape.json')),
  semanticKindLedgerPath: repositoryRelative(join(temporaryRoot, 'semantic-kinds.json')),
  reviewCriteriaPath: repositoryRelative(join(temporaryRoot, 'criteria.md')),
  reviewPath: repositoryRelative(join(temporaryRoot, 'review.jsonl')),
  reviewRunManifestPaths: [],
  reviewedResourceTypes: [],
  requireApproved: false,
  scope: { label: 'Synthetic materializer test scope', goalIds: goals.map(({ id }) => id) },
}
const writeLandscape = (updatedGoals = goals) => writeFile(
  resolve(repositoryRoot, config.landscapePath),
  JSON.stringify({ landscapeId, goals: updatedGoals }),
)
const writeRecords = (records: PositiveGoalEvidenceReviewRecord[]) => writeFile(
  resolve(repositoryRoot, config.reviewPath),
  `${records.map((record) => JSON.stringify(record)).join('\n')}\n`,
)
const review = () => reviewPositiveGoalEvidenceConfig(repositoryRelative(configPath))
const build = (candidates = candidateSet) => buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet: candidates })

try {
  await Promise.all([
    writeLandscape(),
    writeFile(resolve(repositoryRoot, config.semanticKindLedgerPath), JSON.stringify({
      sourceLandscapeId: landscapeId,
      decisions: goals.map(({ id }) => ({ goalId: id, semanticKind: 'curricularAtomic', decisionStatus: 'authoritative' })),
    })),
    writeFile(resolve(repositoryRoot, config.reviewCriteriaPath), criteria),
    writeFile(configPath, JSON.stringify(config)),
    writeRecords(expectedRecords),
  ])

  const materialized = await build()
  assert.deepEqual(materialized, expectedRecords)
  assert.deepEqual(await build(), expectedRecords, 'Repeated materialization must be deterministic')
  assert.deepEqual(review().errors, [])

  await assert.rejects(
    build({ ...candidateSet, goals: [...candidateSet.goals].reverse() }),
    /must match the configured scope exactly and in order/u,
  )
  await assert.rejects(
    build({ ...candidateSet, goals: candidateSet.goals.slice(0, 1) }),
    /must match the configured scope exactly and in order/u,
  )
  await assert.rejects(
    build({ ...candidateSet, goals: [candidateSet.goals[0], candidateSet.goals[0]] }),
    /Candidate set repeats goalIds/u,
  )
  await assert.rejects(build({ ...candidateSet, reviewId: 'wrong-review' }), /does not match/u)
  await assert.rejects(build({ ...candidateSet, reviewedAt: 'not-a-date' }), /not a valid date-time/u)
  await assert.rejects(build({ ...candidateSet, reviewer: ' ' }), /reviewer must be non-blank/u)
  const invalidProfile = structuredClone(candidateSet)
  invalidProfile.goals[0].profile.coverageExpectations.minimumIndependentDemonstrations = 1
  await assert.rejects(build(invalidProfile), /minimumIndependentDemonstrations must be an integer from 2 to 8/u)

  // Metadata remains review input even when image-byte review is disabled. This
  // reproduces the historical fixture's image-link drift without reading or
  // rewriting any historical review record or live curriculum resource.
  const changedVisualization = structuredClone(goals)
  const visualization = changedVisualization[0].resourceLinks?.[0]
  assert.ok(visualization)
  visualization.url = '/assets/goal-visualizations/materializer-test/revised.png'
  visualization.altText = 'Zwei gleich große, beschriftete Mengen.'
  const changedDependency = structuredClone(goals)
  changedDependency[1].requires = []
  const changedDescription = structuredClone(goals)
  changedDescription[0].description += ' Sie begründet die Rechnung an einem neuen Beispiel.'

  for (const { changedGoals, changedIndex, semanticChange } of [
    { changedGoals: changedVisualization, changedIndex: 0, semanticChange: false },
    { changedGoals: changedDependency, changedIndex: 1, semanticChange: false },
    { changedGoals: changedDescription, changedIndex: 0, semanticChange: true },
  ]) {
    await writeLandscape(changedGoals)
    await writeRecords(expectedRecords)
    const staleErrors = review().errors
    assert.match(staleErrors.join('\n'), /stale reviewInputFingerprint/u)
    assert.equal(staleErrors.some((error) => error.includes('stale goalFingerprint')), semanticChange)
    const refreshed = await build()
    const prior = expectedRecords[changedIndex]
    const current = refreshed[changedIndex]
    assert.notEqual(current.reviewInputFingerprint, prior.reviewInputFingerprint)
    assert.equal(current.goalFingerprint !== prior.goalFingerprint, semanticChange)
    assert.equal(current.profileFingerprint, prior.profileFingerprint)
    assert.deepEqual(refreshed[1 - changedIndex], expectedRecords[1 - changedIndex])
    await writeRecords(refreshed)
    assert.deepEqual(review().errors, [])
  }

  await writeLandscape()
  await writeRecords(expectedRecords)
  await writeFile(resolve(repositoryRoot, config.reviewCriteriaPath), `${criteria}\nRevised test criterion.\n`)
  assert.match(review().errors.join('\n'), /reviewCriteriaFingerprint does not match/u)
  const newCriteriaRecords = await build()
  assert.notEqual(newCriteriaRecords[0].reviewCriteriaFingerprint, expectedRecords[0].reviewCriteriaFingerprint)
  assert.notEqual(newCriteriaRecords[0].reviewInputFingerprint, expectedRecords[0].reviewInputFingerprint)
  assert.equal(newCriteriaRecords[0].goalFingerprint, expectedRecords[0].goalFingerprint)
  await writeRecords(newCriteriaRecords)
  assert.deepEqual(review().errors, [])

  await writeFile(resolve(repositoryRoot, config.reviewCriteriaPath), criteria)
  const tamperedProfile = structuredClone(expectedRecords)
  tamperedProfile[0].profile.applicationCaseBriefs[0].expectedPerformanceDe = 'Eine andere Testantwort.'
  await writeRecords(tamperedProfile)
  assert.match(review().errors.join('\n'), /profileFingerprint does not match/u)
  await writeRecords(expectedRecords)
  assert.deepEqual(await build(), expectedRecords)
  assert.deepEqual(review().errors, [])
} finally {
  await rm(temporaryRoot, { recursive: true, force: true })
}

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
let targetBytes: Buffer = oldTargetBytes
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

console.log(`Positive understanding-evidence candidate materializer self-test passed: ${expectedRecords.length} synthetic profile(s), freshness regressions, and atomic-write checks.`)
