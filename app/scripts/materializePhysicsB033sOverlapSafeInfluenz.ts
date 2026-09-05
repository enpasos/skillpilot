import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { AggregateResolutionIndex } from './reportDeepUnderstandingRollout'
import type { PositiveGoalEvidenceReviewConfig } from './positiveGoalEvidenceReview'
import type { PositiveGoalEvidenceReviewRecord } from './positiveGoalEvidenceProfileModel'

type SemanticKindLedger = {
  decisions: Array<{ semanticKind: string; decisionStatus: string }>
}

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const write = process.argv.includes('--write')
const goalId = '9fb1dd85-11b7-4a5a-b124-27fea8d1788e'
const supersededOverlapGoalId = 'bb5c5eab-2fc1-5336-b8cf-14d147695487'
const batchDirectory = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-05/batch-033s-dependent-context-final-recheck-8-v1',
)
const evidenceDirectory = join(repositoryRoot, 'curricula/DE/Gymnasium/quality/goal-evidence')
const sourceIndexPath = join(batchDirectory, 'resolution-index.stable-current-adjudicated-2-v1.json')
const sourceConfigPath = join(
  evidenceDirectory,
  'canonical-physics-positive-understanding-evidence-rollout-v1-batch-033s-stable-current-adjudicated-2-v1.config.json',
)
const sourceReviewPath = join(
  evidenceDirectory,
  'canonical-physics-positive-understanding-evidence-rollout-v1-batch-033s-stable-current-adjudicated-2-v1.review.jsonl',
)
const outputIndexPath = join(batchDirectory, 'resolution-index.overlap-safe-current-influenz-1-v1.json')
const outputConfigName = 'canonical-physics-positive-understanding-evidence-rollout-v1-batch-033s-overlap-safe-current-influenz-1-v1.config.json'
const outputReviewName = 'canonical-physics-positive-understanding-evidence-rollout-v1-batch-033s-overlap-safe-current-influenz-1-v1.review.jsonl'
const outputConfigPath = join(evidenceDirectory, outputConfigName)
const outputReviewPath = join(evidenceDirectory, outputReviewName)
const receiptPath = join(batchDirectory, 'overlap-safe-current-influenz-1-v1.compatibility-receipt.json')

const sha256 = (value: Buffer | string) => `sha256:${createHash('sha256').update(value).digest('hex')}`
const jsonBytes = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const readOptional = async (path: string) => {
  try {
    return await readFile(path)
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}
const writeAllOrRequireExact = async (artifacts: Array<{ path: string; bytes: Buffer }>) => {
  const current = await Promise.all(artifacts.map(({ path }) => readOptional(path)))
  artifacts.forEach(({ path, bytes }, index) => {
    if (current[index] && !current[index]?.equals(bytes)) throw new Error(`Existing overlap-safe artifact is stale: ${path}`)
    if (!current[index] && !write) throw new Error(`Missing overlap-safe artifact: ${path}`)
  })
  if (!write) return
  await Promise.all(artifacts.flatMap(({ path, bytes }, index) => current[index]
    ? []
    : [mkdir(dirname(path), { recursive: true }).then(() => writeFile(path, bytes, { flag: 'wx' }))]))
}

const main = async () => {
  const unknownArgs = process.argv.slice(2).filter((argument) => argument !== '--write')
  if (unknownArgs.length > 0) throw new Error(`Unknown arguments: ${unknownArgs.join(', ')}`)
  const [sourceIndexBytes, sourceConfigBytes, sourceReviewBytes, ledgerBytes] = await Promise.all([
    readFile(sourceIndexPath),
    readFile(sourceConfigPath),
    readFile(sourceReviewPath),
    readFile(join(repositoryRoot, 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json')),
  ])
  const sourceIndex = JSON.parse(sourceIndexBytes.toString('utf8')) as AggregateResolutionIndex
  const sourceConfig = JSON.parse(sourceConfigBytes.toString('utf8')) as PositiveGoalEvidenceReviewConfig
  const sourceRecords = sourceReviewBytes.toString('utf8').trim().split('\n').map((line) => JSON.parse(line) as PositiveGoalEvidenceReviewRecord)
  const ledger = JSON.parse(ledgerBytes.toString('utf8')) as SemanticKindLedger
  if (
    sourceIndex.resolutions?.length !== 2
    || sourceIndex.resolutions[0]?.goalId !== supersededOverlapGoalId
    || sourceIndex.resolutions[1]?.goalId !== goalId
    || sourceIndex.groups?.length !== 1
    || sourceIndex.groups[0]?.campaignGoalCount !== 8
  ) throw new Error('Source B033s resolution index is not the expected two-goal bounded artifact')
  if (
    sourceConfig.scope?.goalIds?.length !== 2
    || sourceConfig.scope.goalIds[0] !== supersededOverlapGoalId
    || sourceConfig.scope.goalIds[1] !== goalId
  ) throw new Error('Source B033s evidence scope is not the expected two-goal bounded artifact')
  const sourceRecord = sourceRecords.find((record) => record.goalId === goalId)
  if (!sourceRecord || sourceRecords.length !== 2) throw new Error('Source B033s evidence review is incomplete')
  const denominator = ledger.decisions.filter((decision) => (
    decision.semanticKind === 'curricularAtomic' && decision.decisionStatus === 'authoritative'
  )).length
  if (denominator !== 461) throw new Error(`Unexpected Physics curricularAtomic denominator: ${denominator}`)

  const index = {
    schemaVersion: 1,
    artifactSetId: `${sourceIndex.artifactSetId}-overlap-safe-current-influenz-1`,
    subject: 'Physik',
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: 1,
    curriculumAtomicDenominator: denominator,
    descriptionReviewPercentage: Number(((1 / denominator) * 100).toFixed(1)),
    groups: [{ ...sourceIndex.groups[0], resolvedGoalCount: 1 }],
    resolutions: [sourceIndex.resolutions[1]],
  }
  const reviewId = 'canonical-physics-positive-evidence-v1-b033s-overlap-safe-current-influenz-1-v1'
  const config = {
    ...sourceConfig,
    reviewId,
    reviewPath: `curricula/DE/Gymnasium/quality/goal-evidence/${outputReviewName}`,
    scope: {
      label: 'Canonical Physics positive understanding-evidence rollout v1 B033s: overlap-safe current Influenz goal',
      goalIds: [goalId],
    },
  }
  const reviewRecord = { ...sourceRecord, reviewId }
  const reviewBytes = Buffer.from(`${JSON.stringify(reviewRecord)}\n`)
  const indexBytes = jsonBytes(index)
  const configBytes = jsonBytes(config)
  const receipt = {
    schemaVersion: 1,
    receiptId: 'physik-b033s-overlap-safe-current-influenz-1-v1-20260905',
    purpose: 'Register only the newly covered Influenz goal while retaining the established calibration resolution and evidence for the already covered radiation-risk goal.',
    sourceResolutionIndexPath: 'resolution-index.stable-current-adjudicated-2-v1.json',
    sourceResolutionIndexDigest: sha256(sourceIndexBytes),
    sourceEvidenceConfigPath: `../../../../../../goal-evidence/${sourceConfigPath.split('/').pop()}`,
    sourceEvidenceConfigDigest: sha256(sourceConfigBytes),
    sourceEvidenceReviewDigest: sha256(sourceReviewBytes),
    claimedGoalIds: [goalId],
    excludedPreviouslyCoveredGoalIds: [supersededOverlapGoalId],
    outputResolutionIndexPath: 'resolution-index.overlap-safe-current-influenz-1-v1.json',
    outputResolutionIndexDigest: sha256(indexBytes),
    outputEvidenceConfigPath: `../../../../../../goal-evidence/${outputConfigName}`,
    outputEvidenceConfigDigest: sha256(configBytes),
    outputEvidenceReviewPath: `../../../../../../goal-evidence/${outputReviewName}`,
    outputEvidenceReviewDigest: sha256(reviewBytes),
    safeguards: {
      sourceArtifactsRemainUnchanged: true,
      overlapExcludedFailClosed: true,
      onlyExactCurrentInfluenzClaimed: true,
      centralRegistrationPerformed: false,
    },
  }
  await writeAllOrRequireExact([
    { path: outputIndexPath, bytes: indexBytes },
    { path: outputConfigPath, bytes: configBytes },
    { path: outputReviewPath, bytes: reviewBytes },
    { path: receiptPath, bytes: jsonBytes(receipt) },
  ])
  console.log(`${write ? 'Materialized' : 'Verified'} Physics B033s overlap-safe integration: 1/${denominator}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
