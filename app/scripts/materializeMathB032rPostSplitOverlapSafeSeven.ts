import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { buildPositiveGoalEvidenceCandidateRecords } from './materializePositiveGoalEvidenceCandidates'
import type { PositiveGoalEvidenceReviewConfig } from './positiveGoalEvidenceReview'
import { buildGoalDescriptionCanonicalContext } from './validateGoalDescriptionReviewCampaign'
import { stableGoalBookJson } from './goalBookModel'

type JsonRecord = Record<string, unknown>

const repositoryRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const unknownArguments = process.argv.slice(2).filter((argument) => argument !== '--write')
if (unknownArguments.length > 0) throw new Error(`Unknown arguments: ${unknownArguments.join(', ')}`)

const batchDirectory = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-05/batch-032r-adjudicated-final-recheck-10-v1'
const oldIndexPath = `${batchDirectory}/resolution-index.stable-current-carryover-9-v1.json`
const newIndexPath = `${batchDirectory}/resolution-index.overlap-safe-exact-current-carryover-7-v1.json`
const receiptPath = `${batchDirectory}/overlap-safe-exact-current-carryover-7-v1.compatibility-receipt.json`
const roundInputPath = `${batchDirectory}/round-a/description-review-input.json`
const synthesisPath = `${batchDirectory}/synthesis-decisions.stable-current-carryover-9-v1.json`
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const semanticKindLedgerPath = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const oldCandidateStem = 'canonical-math-positive-understanding-evidence-rollout-v1-batch-032r-stable-current-carryover-9-v1'
const oldCandidatesPath = `curricula/DE/Gymnasium/quality/goal-evidence/${oldCandidateStem}.candidates.json`
const newCandidateStem = 'canonical-math-positive-understanding-evidence-rollout-v1-batch-032r-overlap-safe-exact-current-7-v1'
const newConfigPath = `curricula/DE/Gymnasium/quality/goal-evidence/${newCandidateStem}.config.json`
const newCandidatesPath = `curricula/DE/Gymnasium/quality/goal-evidence/${newCandidateStem}.candidates.json`
const newReviewPath = `curricula/DE/Gymnasium/quality/goal-evidence/${newCandidateStem}.review.jsonl`
const b032OwnerIndexPath = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-05/batch-032-atlas-next-20-v1/resolution-index.stable-current-carryover-16-v1.json'
const b032OwnerEvidenceConfigPath = 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-032-stable-current-carryover-16-v1.config.json'

const retainedDisputedId = '5bced7dc-6557-4af1-9e70-d87f850d3b7f'
const staleSuccessorId = 'e0c3359d-7d8a-4d01-a25e-a8cd5ebce90e'
const overlapOwnerId = '786ae588-a4fb-40e6-a7f5-113cfc2bfd0f'
const newSplitId = 'f7dcf8c8-06c1-5972-b02a-9d35e5ab7600'
const stableNineIds = [
  '7676b0f9-340d-4a91-ab1f-92745a8f88db',
  'f9e21454-857c-5a6a-8367-32a34fc0026b',
  '66077296-a8f8-4645-938b-7c3424cb2f14',
  'eb28b403-f9fc-57ea-a793-b4555596fdd7',
  '97b3232d-b89f-48b8-9fa1-7a25a1bdbb3d',
  'c8818eae-0c4d-4fa1-9085-04a9c95a668b',
  '0c8c1ae9-135e-4fe5-bf67-e497eb3a9909',
  overlapOwnerId,
  staleSuccessorId,
] as const
const exactCurrentEightIds = stableNineIds.filter((goalId) => goalId !== staleSuccessorId)
const claimedGoalIds = exactCurrentEightIds.filter((goalId) => goalId !== overlapOwnerId)

const absolute = (path: string): string => resolve(repositoryRoot, path)
const sha256 = (value: Buffer | string): `sha256:${string}` => `sha256:${createHash('sha256').update(value).digest('hex')}`
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const jsonlBytes = (values: unknown[]): Buffer => Buffer.from(`${values.map((value) => JSON.stringify(value)).join('\n')}\n`)
const sameOrdered = (left: readonly string[], right: readonly string[]): boolean => (
  left.length === right.length && left.every((value, index) => value === right[index])
)
const currentText = (goal: JsonRecord) => ({
  titleDe: String(goal.title ?? ''),
  titleEn: String(goal.titleEn ?? ''),
  descriptionDe: String(goal.description ?? ''),
  descriptionEn: String(goal.descriptionEn ?? ''),
})
const reviewedText = (goal: JsonRecord) => ({
  titleDe: String(goal.currentTitleDe ?? ''),
  titleEn: String(goal.currentTitleEn ?? ''),
  descriptionDe: String(goal.currentDescriptionDe ?? ''),
  descriptionEn: String(goal.currentDescriptionEn ?? ''),
})
const readPinned = (path: string, expected: string): Buffer => {
  const bytes = readFileSync(absolute(path))
  if (sha256(bytes) !== expected) throw new Error(`${path}: bound predecessor bytes drifted`)
  return bytes
}
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
  execFileSync('npm', ['exec', '--', 'tsx', 'scripts/applyMathBatch032rVertexFormSplit.ts', '--check'], {
    cwd: resolve(repositoryRoot, 'app'), stdio: 'inherit',
  })
  const oldIndexBytes = readPinned(oldIndexPath, 'sha256:55b3d6c9c2d13bbb62ed40af5c2c447122ee44050c738733333a3935bf5283fb')
  const oldCandidatesBytes = readPinned(oldCandidatesPath, 'sha256:88037f658047807eed7a7e320d6bf60468087c27cdaf3af1368c226d914b7dc8')
  const roundInputBytes = readPinned(roundInputPath, 'sha256:2ea5735b8ee372d54891c96caa066b25fc7bf39a1cf31a9a699f6ebee315020b')
  const synthesisBytes = readPinned(synthesisPath, 'sha256:45d2ac18975c9dda86302f15eb0f682b31f6b0099d001e2eccf1c4755c02c29c')
  const ownerIndexBytes = readPinned(b032OwnerIndexPath, 'sha256:e82a5fb2cc2af1e2e32d8dd34f1778cb3f83ef7ddd9051b7b4c399ebb4d0e004')
  const ownerConfigBytes = readPinned(b032OwnerEvidenceConfigPath, 'sha256:ffb5f9ea47645e92907f972eb372339e0e910c5f6f5e21e15477c7d56ba64104')
  const canonicalBytes = readFileSync(absolute(canonicalPath))
  const semanticBytes = readFileSync(absolute(semanticKindLedgerPath))
  const canonical = JSON.parse(canonicalBytes.toString('utf8')) as { landscapeId?: string; goals?: JsonRecord[] }
  const ledger = JSON.parse(semanticBytes.toString('utf8')) as JsonRecord
  if (canonical.landscapeId !== '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced' || !Array.isArray(canonical.goals)) throw new Error('Current Mathematics landscape is invalid')
  if ((ledger.counts as JsonRecord)?.curricularAtomic !== 795 || (ledger.counts as JsonRecord)?.total !== 1179) throw new Error('Current Mathematics denominator is not exactly 795/1179')
  const goalById = new Map(canonical.goals.map((goal) => [String(goal.id), goal]))
  const input = JSON.parse(roundInputBytes.toString('utf8')) as { goals?: JsonRecord[] }
  const inputById = new Map((input.goals ?? []).map((goal) => [String(goal.goalId), goal]))

  for (const goalId of exactCurrentEightIds) {
    const goal = goalById.get(goalId)
    const reviewed = inputById.get(goalId)
    if (!goal || !reviewed
      || stableGoalBookJson(currentText(goal)) !== stableGoalBookJson(reviewedText(reviewed))
      || stableGoalBookJson(buildGoalDescriptionCanonicalContext(goal)) !== stableGoalBookJson(reviewed.canonicalContext)) {
      throw new Error(`${goalId}: expected B032r stable9 artifact is not exact-current`)
    }
  }
  const staleGoal = goalById.get(staleSuccessorId)
  const staleInput = inputById.get(staleSuccessorId)
  if (!staleGoal || !staleInput
    || stableGoalBookJson(currentText(staleGoal)) !== stableGoalBookJson(reviewedText(staleInput))
    || stableGoalBookJson(buildGoalDescriptionCanonicalContext(staleGoal)) === stableGoalBookJson(staleInput.canonicalContext)
    || !sameOrdered((staleInput.canonicalContext as JsonRecord).requires as string[], [retainedDisputedId, '65365dce-f33f-49d8-9516-42f75883aa86', 'af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186'])
    || !sameOrdered((buildGoalDescriptionCanonicalContext(staleGoal) as JsonRecord).requires as string[], [newSplitId, '65365dce-f33f-49d8-9516-42f75883aa86', 'af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186'])) {
    throw new Error(`${staleSuccessorId}: expected exactly one successor prerequisite-context stale`)
  }
  const disputedGoal = goalById.get(retainedDisputedId)
  const disputedInput = inputById.get(retainedDisputedId)
  if (!disputedGoal || !disputedInput || stableGoalBookJson(currentText(disputedGoal)) === stableGoalBookJson(reviewedText(disputedInput))) {
    throw new Error(`${retainedDisputedId}: adjudicated disputed goal must remain changed and excluded`)
  }

  const oldIndex = JSON.parse(oldIndexBytes.toString('utf8')) as JsonRecord
  const oldEntries = oldIndex.resolutions as JsonRecord[]
  if (!Array.isArray(oldEntries) || !sameOrdered(oldEntries.map(({ goalId }) => String(goalId)), stableNineIds)) throw new Error('B032r stable9 predecessor index scope drifted')
  for (const entry of oldEntries) {
    const bytes = readFileSync(absolute(`${batchDirectory}/${String(entry.resolutionPath)}`))
    if (sha256(bytes) !== entry.resolutionDigest || entry.decision !== 'keep_current' || entry.strictDescriptionComplete !== true) {
      throw new Error(`${String(entry.goalId)}: predecessor strict resolution binding drifted`)
    }
  }
  const ownerIndex = JSON.parse(ownerIndexBytes.toString('utf8')) as JsonRecord
  const ownerEntries = (ownerIndex.resolutions as JsonRecord[]).filter(({ goalId }) => goalId === overlapOwnerId)
  const ownerConfig = JSON.parse(ownerConfigBytes.toString('utf8')) as JsonRecord
  if (ownerEntries.length !== 1 || ownerEntries[0].decision !== 'keep_current' || ownerEntries[0].strictDescriptionComplete !== true
    || !((ownerConfig.scope as JsonRecord).goalIds as string[]).includes(overlapOwnerId)) {
    throw new Error(`${overlapOwnerId}: existing central B032 resolution/evidence ownership drifted`)
  }

  const claimedEntries = oldEntries.filter(({ goalId }) => claimedGoalIds.includes(String(goalId)))
  if (!sameOrdered(claimedEntries.map(({ goalId }) => String(goalId)), claimedGoalIds)) throw new Error('Overlap-safe seven ordering drifted')
  const index = {
    schemaVersion: 1,
    artifactSetId: 'mathematik-rollout-v1-batch-032r-adjudicated-final-recheck-10-v1-20260905-overlap-safe-exact-current-carryover-7-v1',
    subject: 'Mathematik',
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: 7,
    curriculumAtomicDenominator: 795,
    descriptionReviewPercentage: 0.9,
    groups: [{
      groupId: 'mathematik-rollout-v1-batch-032r-adjudicated-final-recheck-10-v1-20260905',
      artifactDirectory: '.',
      dualSummaryPath: 'dual-summary.json',
      dualSummaryDigest: 'sha256:e73666deadfca5700984971e7aa9ff2cce56ba32a7918be805eaa2e4fd802150',
      campaignGoalCount: 10,
      resolvedGoalCount: 7,
    }],
    resolutions: claimedEntries,
  }
  const indexBytes = jsonBytes(index)

  const oldCandidates = JSON.parse(oldCandidatesBytes.toString('utf8')) as JsonRecord
  const oldCandidateGoals = oldCandidates.goals as JsonRecord[]
  const oldBindings = oldCandidates.sourceBindings as JsonRecord
  const filteredCandidates = oldCandidateGoals.filter(({ goalId }) => claimedGoalIds.includes(String(goalId)))
  const filteredBindings = (oldBindings.goals as JsonRecord[]).filter(({ goalId }) => claimedGoalIds.includes(String(goalId)))
  if (!sameOrdered(filteredCandidates.map(({ goalId }) => String(goalId)), claimedGoalIds)
    || !sameOrdered(filteredBindings.map(({ goalId }) => String(goalId)), claimedGoalIds)) throw new Error('B032r V2 predecessor profiles do not filter to the exact seven')
  const reviewId = 'canonical-math-positive-evidence-v1-b032r-overlap-safe-exact-current-7-v1'
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
      label: 'Canonical Mathematics B032r post-split overlap-safe carryover: seven exact-current KEEP/KEEP goals; one context-stale successor, the adjudicated split target, and one existing B032 owner excluded',
      goalIds: [...claimedGoalIds],
    },
  }
  const candidateSet = {
    ...oldCandidates,
    reviewId,
    sourceBindings: {
      ...oldBindings,
      bindingContract: 'math-b032r-post-split-overlap-safe-exact-current-seven-v1',
      curriculumAtomicDenominator: 795,
      excludedGoalIds: [retainedDisputedId, staleSuccessorId, overlapOwnerId],
      exactCurrentStableNineGoalIds: [...exactCurrentEightIds],
      contextStaleGoalIds: [staleSuccessorId],
      overlapOwner: {
        goalId: overlapOwnerId,
        resolutionIndexPath: b032OwnerIndexPath,
        resolutionIndexSha256: sha256(ownerIndexBytes),
        positiveEvidenceConfigPath: b032OwnerEvidenceConfigPath,
        positiveEvidenceConfigSha256: sha256(ownerConfigBytes),
      },
      resolutionIndex: { path: newIndexPath, sha256: sha256(indexBytes) },
      goals: filteredBindings,
    },
    goals: filteredCandidates,
  }
  const reviewRecords = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet: candidateSet as never })
  const receipt = {
    schemaVersion: 1,
    receiptId: 'mathematik-b032r-post-split-overlap-safe-exact-current-carryover-7-v1-20260905',
    purpose: 'Fail-closed post-split audit of the nine previously strict B032r carryovers: eight remain exact-current, e0c3359d is excluded for its prerequisite-context change, and 786ae588 remains with its already central B032 owner, leaving seven non-overlapping carryovers and byte-reused V2 profile authoring.',
    predecessor: {
      resolutionIndexPath: oldIndexPath,
      resolutionIndexSha256: sha256(oldIndexBytes),
      positiveEvidenceCandidatesPath: oldCandidatesPath,
      positiveEvidenceCandidatesSha256: sha256(oldCandidatesBytes),
      synthesisManifestPath: synthesisPath,
      synthesisManifestSha256: sha256(synthesisBytes),
    },
    current: {
      canonicalPath,
      canonicalSha256: sha256(canonicalBytes),
      semanticKindLedgerPath,
      semanticKindLedgerSha256: sha256(semanticBytes),
      curriculumAtomicDenominator: 795,
    },
    exactCurrentStableNineGoalIds: [...exactCurrentEightIds],
    exactCurrentStableNineCount: 8,
    contextStaleGoalIds: [staleSuccessorId],
    existingStrictOverlapOwner: {
      goalId: overlapOwnerId,
      resolutionIndexPath: b032OwnerIndexPath,
      resolutionIndexSha256: sha256(ownerIndexBytes),
      positiveEvidenceConfigPath: b032OwnerEvidenceConfigPath,
      positiveEvidenceConfigSha256: sha256(ownerConfigBytes),
    },
    claimedGoalIds: [...claimedGoalIds],
    claimedGoalCount: 7,
    resolutionIndexPath: newIndexPath,
    resolutionIndexSha256: sha256(indexBytes),
    positiveEvidenceConfigPath: newConfigPath,
    positiveEvidenceCandidatesPath: newCandidatesPath,
    positiveEvidenceReviewPath: newReviewPath,
    noCentralRolloutRegistration: true,
    safeguards: {
      originalReviewDecisionsAndProfileContentReusedWithoutNewJudgment: true,
      bilingualTextAndDirectCanonicalContextMustBeExactCurrent: true,
      singleExpectedContextStaleSuccessorRequired: true,
      existingCentralOverlapExcluded: true,
      centralRegistrationPerformed: false,
    },
  }

  if (writeMode) execFileSync(process.execPath, ['scripts/check_openai_plugin_review_freeze.mjs'], { cwd: repositoryRoot, stdio: 'inherit' })
  writeOrCheck(newIndexPath, indexBytes)
  writeOrCheck(newConfigPath, jsonBytes(config))
  writeOrCheck(newCandidatesPath, jsonBytes(candidateSet))
  writeOrCheck(newReviewPath, jsonlBytes(reviewRecords))
  writeOrCheck(receiptPath, jsonBytes(receipt))
  console.log(`CHECK math_b032r_post_split_overlap_safe ${writeMode ? 'WRITE' : 'PASS'} stable9Current=8/9 contextStale=1 overlapExcluded=1 claimed=7 denominator=795 v2Profiles=7 centralRegistered=false`)
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
