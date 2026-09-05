import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { buildPositiveGoalEvidenceCandidateRecords } from './materializePositiveGoalEvidenceCandidates'
import {
  reviewPositiveGoalEvidenceConfig,
  type PositiveGoalEvidenceReviewConfig,
} from './positiveGoalEvidenceReview'
import { stableGoalBookJson } from './goalBookModel'

type JsonRecord = Record<string, unknown>
type OwnerPair = {
  goalId: string
  resolutionIndexPath: string
  resolutionIndexSha256: `sha256:${string}`
  positiveEvidenceConfigPath: string
  positiveEvidenceConfigSha256: `sha256:${string}`
}

const repositoryRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const unknownArguments = process.argv.slice(2).filter((argument) => argument !== '--write')
if (unknownArguments.length > 0) throw new Error(`Unknown arguments: ${unknownArguments.join(', ')}`)

const batchDirectory = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-05/batch-032r-adjudicated-final-recheck-10-v1'
const currentSevenIndexPath = `${batchDirectory}/resolution-index.overlap-safe-exact-current-carryover-7-v1.json`
const currentSevenReceiptPath = `${batchDirectory}/overlap-safe-exact-current-carryover-7-v1.compatibility-receipt.json`
const newIndexPath = `${batchDirectory}/resolution-index.overlap-safe-exact-current-carryover-5-v1.json`
const newReceiptPath = `${batchDirectory}/overlap-safe-exact-current-carryover-5-v1.compatibility-receipt.json`
const underlyingIndexPath = `${batchDirectory}/resolution-index.stable-current-carryover-9-v1.json`
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const semanticKindLedgerPath = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const currentSevenStem = 'canonical-math-positive-understanding-evidence-rollout-v1-batch-032r-overlap-safe-exact-current-7-v1'
const currentSevenConfigPath = `curricula/DE/Gymnasium/quality/goal-evidence/${currentSevenStem}.config.json`
const currentSevenCandidatesPath = `curricula/DE/Gymnasium/quality/goal-evidence/${currentSevenStem}.candidates.json`
const currentSevenReviewPath = `curricula/DE/Gymnasium/quality/goal-evidence/${currentSevenStem}.review.jsonl`
const underlyingCandidatesPath = 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-032r-stable-current-carryover-9-v1.candidates.json'
const newStem = 'canonical-math-positive-understanding-evidence-rollout-v1-batch-032r-overlap-safe-exact-current-5-v1'
const newConfigPath = `curricula/DE/Gymnasium/quality/goal-evidence/${newStem}.config.json`
const newCandidatesPath = `curricula/DE/Gymnasium/quality/goal-evidence/${newStem}.candidates.json`
const newReviewPath = `curricula/DE/Gymnasium/quality/goal-evidence/${newStem}.review.jsonl`

const staleSuccessorId = 'e0c3359d-7d8a-4d01-a25e-a8cd5ebce90e'
const retainedSplitId = '5bced7dc-6557-4af1-9e70-d87f850d3b7f'
const currentSevenGoalIds = [
  '7676b0f9-340d-4a91-ab1f-92745a8f88db',
  'f9e21454-857c-5a6a-8367-32a34fc0026b',
  '66077296-a8f8-4645-938b-7c3424cb2f14',
  'eb28b403-f9fc-57ea-a793-b4555596fdd7',
  '97b3232d-b89f-48b8-9fa1-7a25a1bdbb3d',
  'c8818eae-0c4d-4fa1-9085-04a9c95a668b',
  '0c8c1ae9-135e-4fe5-bf67-e497eb3a9909',
] as const
const overlapGoalIds = [
  '786ae588-a4fb-40e6-a7f5-113cfc2bfd0f',
  'c8818eae-0c4d-4fa1-9085-04a9c95a668b',
  '0c8c1ae9-135e-4fe5-bf67-e497eb3a9909',
] as const
const claimedGoalIds = currentSevenGoalIds.filter((goalId) => !overlapGoalIds.includes(goalId as typeof overlapGoalIds[number]))

const ownerPairs: readonly OwnerPair[] = [
  {
    goalId: overlapGoalIds[0],
    resolutionIndexPath: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-05/batch-032-atlas-next-20-v1/resolution-index.post-b032r-split-exact-current-carryover-15-v1.json',
    resolutionIndexSha256: 'sha256:a9c7ed7bcba870551045c6aa06cd23310ba9ab446820adc0cfa4d9a2a1f19823',
    positiveEvidenceConfigPath: 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-032-post-b032r-split-exact-current-15-v1.config.json',
    positiveEvidenceConfigSha256: 'sha256:a6fe0713eea26b1aeb7d95da90e6a37c68ac8922b0795af0cb34f5c8222c7fa1',
  },
  {
    goalId: overlapGoalIds[1],
    resolutionIndexPath: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-05/batch-030-atlas-context-recheck-18-v1/resolution-index.json',
    resolutionIndexSha256: 'sha256:01442e9fbe2342e26c4fb97da12403583add55713047a6efaf28e7874cbe2029',
    positiveEvidenceConfigPath: 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-030-atlas-context-recheck-18-current-v1.config.json',
    positiveEvidenceConfigSha256: 'sha256:f53471add8643eb9071c97acc28fd6c1cef4f18605e343f06949d4a10263a29c',
  },
  {
    goalId: overlapGoalIds[2],
    resolutionIndexPath: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/calibration-v2/2026-08-25/resolution-index.json',
    resolutionIndexSha256: 'sha256:6068c3b5c35ddabd3503fdf82aa7d072bc4fb63918b6e4ec06dc042e31536440',
    positiveEvidenceConfigPath: 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-calibration-v2.config.json',
    positiveEvidenceConfigSha256: 'sha256:4e264bfdeb48014ddad9c5618d644a76021806f14ef2f2088a725948b71a8352',
  },
] as const

const absolute = (path: string): string => resolve(repositoryRoot, path)
const sha256 = (value: Buffer | string): `sha256:${string}` => `sha256:${createHash('sha256').update(value).digest('hex')}`
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const jsonlBytes = (values: unknown[]): Buffer => Buffer.from(`${values.map((value) => JSON.stringify(value)).join('\n')}\n`)
const sameOrdered = (left: readonly string[], right: readonly string[]): boolean => (
  left.length === right.length && left.every((value, index) => value === right[index])
)
const readPinned = (path: string, expected: `sha256:${string}`): Buffer => {
  const bytes = readFileSync(absolute(path))
  const actual = sha256(bytes)
  if (actual !== expected) throw new Error(`${path}: bound bytes drifted (${actual} != ${expected})`)
  return bytes
}
const parseJsonl = (bytes: Buffer): JsonRecord[] => bytes.toString('utf8').trim().split(/\r?\n/u).map((line) => JSON.parse(line) as JsonRecord)
const writeOrCheck = (path: string, bytes: Buffer): void => {
  let current: Buffer | null = null
  try { current = readFileSync(absolute(path)) } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
  }
  if (current?.equals(bytes)) return
  if (!writeMode) throw new Error(`${path}: missing or stale; run with --write`)
  if (current) throw new Error(`${path}: refusing to overwrite a foreign or stale artifact`)
  mkdirSync(dirname(absolute(path)), { recursive: true })
  writeFileSync(absolute(path), bytes, { flag: 'wx' })
}

const main = async (): Promise<void> => {
  execFileSync('npm', ['exec', '--', 'tsx', 'scripts/materializeMathB032rPostSplitOverlapSafeSeven.ts'], {
    cwd: resolve(repositoryRoot, 'app'), stdio: 'inherit',
  })
  const currentSevenIndexBytes = readPinned(currentSevenIndexPath, 'sha256:33ae29b7d3e215b578fd66156d3d72c0b1d515c218930bb7c2dfe3c47e6a5fb5')
  const currentSevenReceiptBytes = readPinned(currentSevenReceiptPath, 'sha256:766a29d7ffd1c30e09314c84c3dc42eccde071fe79d9f82bbad4ca685aef7f2b')
  const currentSevenConfigBytes = readPinned(currentSevenConfigPath, 'sha256:65d1b3c31347243e5b045a1fed07c1569fa2a1cb44f8afcc4507d3eebc27d9db')
  const currentSevenCandidatesBytes = readPinned(currentSevenCandidatesPath, 'sha256:385d4b1907d1e9b230fd9ce979c3423730e629fd2802709d344e71193f62823c')
  const currentSevenReviewBytes = readPinned(currentSevenReviewPath, 'sha256:c3f36ec9f637cc978942ab45a88866252b454e8a50e88e9fa5daeaf896853685')
  const underlyingIndexBytes = readPinned(underlyingIndexPath, 'sha256:55b3d6c9c2d13bbb62ed40af5c2c447122ee44050c738733333a3935bf5283fb')
  const underlyingCandidatesBytes = readPinned(underlyingCandidatesPath, 'sha256:88037f658047807eed7a7e320d6bf60468087c27cdaf3af1368c226d914b7dc8')
  const canonicalBytes = readFileSync(absolute(canonicalPath))
  const semanticBytes = readFileSync(absolute(semanticKindLedgerPath))
  const semantic = JSON.parse(semanticBytes.toString('utf8')) as JsonRecord
  if ((semantic.counts as JsonRecord)?.curricularAtomic !== 795 || (semantic.counts as JsonRecord)?.total !== 1179) throw new Error('Current Mathematics denominator is not exactly 795/1179')

  const currentSevenIndex = JSON.parse(currentSevenIndexBytes.toString('utf8')) as JsonRecord
  const currentSevenEntries = currentSevenIndex.resolutions as JsonRecord[]
  const currentSevenReceipt = JSON.parse(currentSevenReceiptBytes.toString('utf8')) as JsonRecord
  const currentSevenConfig = JSON.parse(currentSevenConfigBytes.toString('utf8')) as JsonRecord
  const currentSevenCandidates = JSON.parse(currentSevenCandidatesBytes.toString('utf8')) as JsonRecord
  const currentSevenReviews = parseJsonl(currentSevenReviewBytes)
  const currentSevenProfiles = currentSevenCandidates.goals as JsonRecord[]
  const currentSevenBindings = (currentSevenCandidates.sourceBindings as JsonRecord).goals as JsonRecord[]
  if (currentSevenIndex.strictDescriptionReviewCompleteCount !== 7 || currentSevenIndex.curriculumAtomicDenominator !== 795
    || !sameOrdered(currentSevenEntries.map(({ goalId }) => String(goalId)), currentSevenGoalIds)
    || !sameOrdered(((currentSevenConfig.scope as JsonRecord).goalIds as string[]), currentSevenGoalIds)
    || !sameOrdered(currentSevenProfiles.map(({ goalId }) => String(goalId)), currentSevenGoalIds)
    || !sameOrdered(currentSevenBindings.map(({ goalId }) => String(goalId)), currentSevenGoalIds)
    || !sameOrdered(currentSevenReviews.map(({ goalId }) => String(goalId)), currentSevenGoalIds)
    || (currentSevenReceipt.claimedGoalCount !== 7)) {
    throw new Error('B032r current7 predecessor scope or bindings drifted')
  }
  const underlyingIndex = JSON.parse(underlyingIndexBytes.toString('utf8')) as JsonRecord
  const underlyingCandidates = JSON.parse(underlyingCandidatesBytes.toString('utf8')) as JsonRecord
  const underlyingIndexIds = (underlyingIndex.resolutions as JsonRecord[]).map(({ goalId }) => String(goalId))
  const underlyingCandidateIds = (underlyingCandidates.goals as JsonRecord[]).map(({ goalId }) => String(goalId))
  if (!currentSevenGoalIds.every((goalId) => underlyingIndexIds.includes(goalId) && underlyingCandidateIds.includes(goalId))
    || !underlyingIndexIds.includes(overlapGoalIds[0]) || !underlyingIndexIds.includes(staleSuccessorId)
    || underlyingIndexIds.includes(retainedSplitId)) {
    throw new Error('Underlying B032r stable9 relationship to current7 drifted')
  }
  for (const [position, profile] of currentSevenProfiles.entries()) {
    const review = currentSevenReviews[position]
    if (review.status !== 'needs_human_review'
      || stableGoalBookJson(profile.profile) !== stableGoalBookJson(review.profile)
      || profile.reason !== review.reason
      || profile.evidenceLevel !== review.evidenceLevel
      || profile.maximumClaimScope !== review.maximumClaimScope) {
      throw new Error(`${String(profile.goalId)}: current7 candidate/review evidence binding drifted`)
    }
  }

  const ownerReceipts: JsonRecord[] = []
  for (const owner of ownerPairs) {
    const indexBytes = readPinned(owner.resolutionIndexPath, owner.resolutionIndexSha256)
    const configBytes = readPinned(owner.positiveEvidenceConfigPath, owner.positiveEvidenceConfigSha256)
    const index = JSON.parse(indexBytes.toString('utf8')) as JsonRecord
    const config = JSON.parse(configBytes.toString('utf8')) as JsonRecord
    const entries = (index.resolutions as JsonRecord[]).filter(({ goalId }) => goalId === owner.goalId)
    if (entries.length !== 1 || entries[0].decision !== 'keep_current' || entries[0].strictDescriptionComplete !== true
      || !((config.scope as JsonRecord).goalIds as string[]).includes(owner.goalId)) {
      throw new Error(`${owner.goalId}: existing resolution/evidence owner pair drifted`)
    }
    const resolutionPath = resolve(dirname(absolute(owner.resolutionIndexPath)), String(entries[0].resolutionPath))
    const resolutionBytes = readFileSync(resolutionPath)
    if (sha256(resolutionBytes) !== entries[0].resolutionDigest) throw new Error(`${owner.goalId}: owner resolution digest drifted`)
    ownerReceipts.push({
      goalId: owner.goalId,
      resolutionIndexPath: owner.resolutionIndexPath,
      resolutionIndexSha256: sha256(indexBytes),
      positiveEvidenceConfigPath: owner.positiveEvidenceConfigPath,
      positiveEvidenceConfigSha256: sha256(configBytes),
    })
  }

  const claimedEntries = currentSevenEntries.filter(({ goalId }) => claimedGoalIds.includes(String(goalId)))
  const claimedProfiles = currentSevenProfiles.filter(({ goalId }) => claimedGoalIds.includes(String(goalId)))
  const claimedBindings = currentSevenBindings.filter(({ goalId }) => claimedGoalIds.includes(String(goalId)))
  if (!sameOrdered(claimedEntries.map(({ goalId }) => String(goalId)), claimedGoalIds)
    || !sameOrdered(claimedProfiles.map(({ goalId }) => String(goalId)), claimedGoalIds)
    || !sameOrdered(claimedBindings.map(({ goalId }) => String(goalId)), claimedGoalIds)) {
    throw new Error('B032r current7 artifacts do not filter to exact overlap-safe current5')
  }
  const index = {
    schemaVersion: 1,
    artifactSetId: 'mathematik-rollout-v1-batch-032r-adjudicated-final-recheck-10-v1-20260905-overlap-safe-exact-current-carryover-5-v1',
    subject: 'Mathematik',
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: 5,
    curriculumAtomicDenominator: 795,
    descriptionReviewPercentage: 0.6,
    groups: [{
      groupId: 'mathematik-rollout-v1-batch-032r-adjudicated-final-recheck-10-v1-20260905',
      artifactDirectory: '.',
      dualSummaryPath: 'dual-summary.json',
      dualSummaryDigest: 'sha256:e73666deadfca5700984971e7aa9ff2cce56ba32a7918be805eaa2e4fd802150',
      campaignGoalCount: 10,
      resolvedGoalCount: 5,
    }],
    resolutions: claimedEntries,
  }
  const indexBytes = jsonBytes(index)
  const reviewId = 'canonical-math-positive-evidence-v1-b032r-overlap-safe-exact-current-5-v1'
  const config: PositiveGoalEvidenceReviewConfig = {
    $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
    schemaVersion: 2,
    reviewId,
    goalFingerprintRuleVersion: 'goal-evidence-v1',
    profileRuleVersion: 'positive-understanding-evidence-v2',
    landscapeId: '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced',
    landscapePath: canonicalPath,
    semanticKindLedgerPath,
    reviewCriteriaPath: 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/mathematik-positive-understanding-evidence-profile-criteria-v2.md',
    reviewPath: newReviewPath,
    reviewRunManifestPaths: [],
    reviewedResourceTypes: [],
    requireApproved: false,
    scope: {
      label: 'Canonical Mathematics B032r post-split overlap-safe carryover: five exact-current goals after excluding all three pre-existing centrally owned resolution/evidence pairs',
      goalIds: [...claimedGoalIds],
    },
  }
  const oldBindings = currentSevenCandidates.sourceBindings as JsonRecord
  const candidateSet = {
    ...currentSevenCandidates,
    reviewId,
    sourceBindings: {
      ...oldBindings,
      bindingContract: 'math-b032r-post-split-overlap-safe-exact-current-five-v1',
      curriculumAtomicDenominator: 795,
      predecessorCurrentSeven: {
        resolutionIndex: { path: currentSevenIndexPath, sha256: sha256(currentSevenIndexBytes) },
        receipt: { path: currentSevenReceiptPath, sha256: sha256(currentSevenReceiptBytes) },
        positiveEvidenceConfig: { path: currentSevenConfigPath, sha256: sha256(currentSevenConfigBytes) },
        positiveEvidenceCandidates: { path: currentSevenCandidatesPath, sha256: sha256(currentSevenCandidatesBytes) },
        positiveEvidenceReview: { path: currentSevenReviewPath, sha256: sha256(currentSevenReviewBytes) },
      },
      underlyingB032r: {
        resolutionIndex: { path: underlyingIndexPath, sha256: sha256(underlyingIndexBytes) },
        positiveEvidenceCandidates: { path: underlyingCandidatesPath, sha256: sha256(underlyingCandidatesBytes) },
      },
      excludedGoalIds: [...overlapGoalIds, staleSuccessorId, retainedSplitId],
      existingOwnerPairs: ownerReceipts,
      resolutionIndex: { path: newIndexPath, sha256: sha256(indexBytes) },
      goals: claimedBindings,
    },
    goals: claimedProfiles,
  }
  const reviewRecords = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet: candidateSet as never })
  if (!sameOrdered(reviewRecords.map(({ goalId }) => String(goalId)), claimedGoalIds)
    || reviewRecords.some((record, position) => record.status !== 'needs_human_review'
      || stableGoalBookJson(record.profile) !== stableGoalBookJson(claimedProfiles[position].profile))) {
    throw new Error('Generated B032r current5 reviews do not preserve the exact current7 evidence profiles')
  }
  const receipt = {
    schemaVersion: 1,
    receiptId: 'mathematik-b032r-post-split-overlap-safe-exact-current-carryover-5-v1-20260905',
    purpose: 'Fail-closed correction of B032r current7 to five non-overlapping exact-current goals. Existing owners are pinned for 786ae588 in B032 current15, c8818eae in B030, and 0c8c1ae9 in calibration-v2; all B032r review and V2 evidence content is reused without new judgment.',
    predecessorCurrentSeven: {
      resolutionIndexPath: currentSevenIndexPath,
      resolutionIndexSha256: sha256(currentSevenIndexBytes),
      receiptPath: currentSevenReceiptPath,
      receiptSha256: sha256(currentSevenReceiptBytes),
      positiveEvidenceConfigPath: currentSevenConfigPath,
      positiveEvidenceConfigSha256: sha256(currentSevenConfigBytes),
      positiveEvidenceCandidatesPath: currentSevenCandidatesPath,
      positiveEvidenceCandidatesSha256: sha256(currentSevenCandidatesBytes),
      positiveEvidenceReviewPath: currentSevenReviewPath,
      positiveEvidenceReviewSha256: sha256(currentSevenReviewBytes),
    },
    underlyingB032r: {
      resolutionIndexPath: underlyingIndexPath,
      resolutionIndexSha256: sha256(underlyingIndexBytes),
      positiveEvidenceCandidatesPath: underlyingCandidatesPath,
      positiveEvidenceCandidatesSha256: sha256(underlyingCandidatesBytes),
    },
    current: {
      canonicalPath,
      canonicalSha256: sha256(canonicalBytes),
      semanticKindLedgerPath,
      semanticKindLedgerSha256: sha256(semanticBytes),
      curriculumAtomicDenominator: 795,
    },
    predecessorGoalIds: [...currentSevenGoalIds],
    predecessorGoalCount: 7,
    existingOwnerPairs: ownerReceipts,
    overlapExcludedGoalIds: [...overlapGoalIds],
    claimedGoalIds: [...claimedGoalIds],
    claimedGoalCount: 5,
    resolutionIndexPath: newIndexPath,
    resolutionIndexSha256: sha256(indexBytes),
    positiveEvidenceConfigPath: newConfigPath,
    positiveEvidenceCandidatesPath: newCandidatesPath,
    positiveEvidenceReviewPath: newReviewPath,
    intendedCentralReplacement: {
      resolutionIndexPath: { replace: currentSevenIndexPath, with: newIndexPath },
      positiveEvidenceConfigPath: { replace: currentSevenConfigPath, with: newConfigPath },
    },
    noCentralRolloutRegistration: true,
    safeguards: {
      originalReviewAndProfileContentReusedWithoutNewJudgment: true,
      allThreeExistingResolutionAndEvidenceOwnerPairsPinned: true,
      overlapOwnerGoalsExcluded: true,
      centralRegistrationPerformed: false,
      canonicalOrLedgerOrImageMutationPerformed: false,
    },
  }

  writeOrCheck(newIndexPath, indexBytes)
  writeOrCheck(newConfigPath, jsonBytes(config))
  writeOrCheck(newCandidatesPath, jsonBytes(candidateSet))
  writeOrCheck(newReviewPath, jsonlBytes(reviewRecords))
  writeOrCheck(newReceiptPath, jsonBytes(receipt))
  const reviewed = reviewPositiveGoalEvidenceConfig(absolute(newConfigPath))
  if (reviewed.errors.length > 0 || reviewed.counts.needsHumanReview !== 5) {
    throw new Error(reviewed.errors.join('\n') || 'B032r overlap-safe exact-current evidence count is not 5')
  }
  console.log(`CHECK math_b032r_post_split_overlap_safe_five ${writeMode ? 'WRITE' : 'PASS'} current7=7 overlapExcluded=3 claimed=5 denominator=795 v2Profiles=5 centralRegistered=false`)
  console.log(`REPLACE_RESOLUTION ${currentSevenIndexPath} -> ${newIndexPath}`)
  console.log(`REPLACE_EVIDENCE ${currentSevenConfigPath} -> ${newConfigPath}`)
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
