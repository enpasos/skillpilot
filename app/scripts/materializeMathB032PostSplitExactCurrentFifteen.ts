import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { buildPositiveGoalEvidenceCandidateRecords } from './materializePositiveGoalEvidenceCandidates'
import {
  reviewPositiveGoalEvidenceConfig,
  type PositiveGoalEvidenceReviewConfig,
} from './positiveGoalEvidenceReview'
import { buildGoalDescriptionCanonicalContext } from './validateGoalDescriptionReviewCampaign'
import { stableGoalBookJson } from './goalBookModel'

type JsonRecord = Record<string, unknown>

const repositoryRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const unknownArguments = process.argv.slice(2).filter((argument) => argument !== '--write')
if (unknownArguments.length > 0) throw new Error(`Unknown arguments: ${unknownArguments.join(', ')}`)

const batchDirectory = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-05/batch-032-atlas-next-20-v1'
const oldIndexPath = `${batchDirectory}/resolution-index.stable-current-carryover-16-v1.json`
const newIndexPath = `${batchDirectory}/resolution-index.post-b032r-split-exact-current-carryover-15-v1.json`
const receiptPath = `${batchDirectory}/post-b032r-split-exact-current-carryover-15-v1.compatibility-receipt.json`
const roundInputPath = `${batchDirectory}/round-a/description-review-input.json`
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const semanticKindLedgerPath = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const oldCandidateStem = 'canonical-math-positive-understanding-evidence-rollout-v1-batch-032-stable-current-carryover-16-v1'
const oldConfigPath = `curricula/DE/Gymnasium/quality/goal-evidence/${oldCandidateStem}.config.json`
const oldCandidatesPath = `curricula/DE/Gymnasium/quality/goal-evidence/${oldCandidateStem}.candidates.json`
const oldReviewPath = `curricula/DE/Gymnasium/quality/goal-evidence/${oldCandidateStem}.review.jsonl`
const newCandidateStem = 'canonical-math-positive-understanding-evidence-rollout-v1-batch-032-post-b032r-split-exact-current-15-v1'
const newConfigPath = `curricula/DE/Gymnasium/quality/goal-evidence/${newCandidateStem}.config.json`
const newCandidatesPath = `curricula/DE/Gymnasium/quality/goal-evidence/${newCandidateStem}.candidates.json`
const newReviewPath = `curricula/DE/Gymnasium/quality/goal-evidence/${newCandidateStem}.review.jsonl`

const retainedSplitId = '5bced7dc-6557-4af1-9e70-d87f850d3b7f'
const newSplitId = 'f7dcf8c8-06c1-5972-b02a-9d35e5ab7600'
const staleSuccessorId = 'e0c3359d-7d8a-4d01-a25e-a8cd5ebce90e'
const stableSixteenIds = [
  '6596405a-9728-41df-9163-53670ec2a937',
  'f8704a7b-e93d-4e32-b0f9-1b171545fe28',
  '28b3a12f-aa7a-5c2a-92c7-6d64fa543ee5',
  'c9eb293a-9be7-4a3d-8cd0-a1d885a3fdc1',
  '4f889e45-3c1d-4a8e-8fcb-3582d40d9e8a',
  '7fad6a57-cda1-5dee-a55e-877be64ba992',
  '68505a32-3b1d-57b2-a495-00b4097eb50d',
  '62e0a4e3-d1d3-46a2-982d-6b99dca6d3fb',
  'e131c594-c45e-5718-9f33-7ae39ddc82ad',
  '47d8d47c-7c59-5394-9098-11d9ad3723f1',
  '4d78bbcc-89b8-47f0-aa45-516199e4da5d',
  '71a483ba-9680-4654-bb5e-5ab5427f0919',
  '786ae588-a4fb-40e6-a7f5-113cfc2bfd0f',
  'e663cc67-5249-55db-b103-357b58a1ca91',
  'e322310f-f33a-485d-bc23-2412a6b8fa12',
  staleSuccessorId,
] as const
const exactCurrentGoalIds = stableSixteenIds.filter((goalId) => goalId !== staleSuccessorId)

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
  const actual = sha256(bytes)
  if (actual !== expected) throw new Error(`${path}: bound predecessor bytes drifted (${actual} != ${expected})`)
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
  execFileSync('npm', ['exec', '--', 'tsx', 'scripts/applyMathBatch032rVertexFormSplit.ts', '--check'], {
    cwd: resolve(repositoryRoot, 'app'), stdio: 'inherit',
  })
  const oldIndexBytes = readPinned(oldIndexPath, 'sha256:e82a5fb2cc2af1e2e32d8dd34f1778cb3f83ef7ddd9051b7b4c399ebb4d0e004')
  const roundInputBytes = readPinned(roundInputPath, 'sha256:0a350a8337040f3d51473bec4ae84a8339ed268e50dad1ecea47e98931385f14')
  const oldConfigBytes = readPinned(oldConfigPath, 'sha256:ffb5f9ea47645e92907f972eb372339e0e910c5f6f5e21e15477c7d56ba64104')
  const oldCandidatesBytes = readPinned(oldCandidatesPath, 'sha256:b61031d32bacd110359479d0f3ff8b3da0bd45d637030ba19e341cc110a41811')
  const oldReviewBytes = readPinned(oldReviewPath, 'sha256:a75dc8568b883bf25e40bd428df9af66c9e74ba4281da564bea57298b0211779')
  const canonicalBytes = readFileSync(absolute(canonicalPath))
  const semanticBytes = readFileSync(absolute(semanticKindLedgerPath))
  const canonical = JSON.parse(canonicalBytes.toString('utf8')) as { landscapeId?: string; goals?: JsonRecord[] }
  const semantic = JSON.parse(semanticBytes.toString('utf8')) as JsonRecord
  if (canonical.landscapeId !== '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced' || !Array.isArray(canonical.goals)) throw new Error('Current Mathematics landscape is invalid')
  if ((semantic.counts as JsonRecord)?.curricularAtomic !== 795 || (semantic.counts as JsonRecord)?.total !== 1179) throw new Error('Current Mathematics denominator is not exactly 795/1179')

  const goalById = new Map(canonical.goals.map((goal) => [String(goal.id), goal]))
  const roundInput = JSON.parse(roundInputBytes.toString('utf8')) as { goals?: JsonRecord[] }
  const inputById = new Map((roundInput.goals ?? []).map((goal) => [String(goal.goalId), goal]))
  for (const goalId of exactCurrentGoalIds) {
    const goal = goalById.get(goalId)
    const reviewed = inputById.get(goalId)
    if (!goal || !reviewed
      || stableGoalBookJson(currentText(goal)) !== stableGoalBookJson(reviewedText(reviewed))
      || stableGoalBookJson(buildGoalDescriptionCanonicalContext(goal)) !== stableGoalBookJson(reviewed.canonicalContext)) {
      throw new Error(`${goalId}: expected B032 stable16 artifact is not exact-current`)
    }
  }
  const staleGoal = goalById.get(staleSuccessorId)
  const staleInput = inputById.get(staleSuccessorId)
  if (!staleGoal || !staleInput
    || stableGoalBookJson(currentText(staleGoal)) !== stableGoalBookJson(reviewedText(staleInput))
    || stableGoalBookJson(buildGoalDescriptionCanonicalContext(staleGoal)) === stableGoalBookJson(staleInput.canonicalContext)
    || !sameOrdered((staleInput.canonicalContext as JsonRecord).requires as string[], [retainedSplitId, '65365dce-f33f-49d8-9516-42f75883aa86', 'af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186'])
    || !sameOrdered((buildGoalDescriptionCanonicalContext(staleGoal) as JsonRecord).requires as string[], [newSplitId, '65365dce-f33f-49d8-9516-42f75883aa86', 'af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186'])) {
    throw new Error(`${staleSuccessorId}: expected exactly one prerequisite-context stale successor`)
  }

  const oldIndex = JSON.parse(oldIndexBytes.toString('utf8')) as JsonRecord
  const oldEntries = oldIndex.resolutions as JsonRecord[]
  if (!Array.isArray(oldEntries) || !sameOrdered(oldEntries.map(({ goalId }) => String(goalId)), stableSixteenIds)) throw new Error('B032 stable16 predecessor index scope drifted')
  for (const entry of oldEntries) {
    const resolutionBytes = readFileSync(absolute(`${batchDirectory}/${String(entry.resolutionPath)}`))
    if (sha256(resolutionBytes) !== entry.resolutionDigest || entry.decision !== 'keep_current' || entry.strictDescriptionComplete !== true) {
      throw new Error(`${String(entry.goalId)}: predecessor strict resolution binding drifted`)
    }
  }
  const exactEntries = oldEntries.filter(({ goalId }) => goalId !== staleSuccessorId)
  if (!sameOrdered(exactEntries.map(({ goalId }) => String(goalId)), exactCurrentGoalIds)) throw new Error('B032 current15 ordering drifted')
  const index = {
    schemaVersion: 1,
    artifactSetId: 'mathematik-rollout-v1-batch-032-atlas-next-20-v1-20260905-post-b032r-split-exact-current-carryover-15-v1',
    subject: 'Mathematik',
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: 15,
    curriculumAtomicDenominator: 795,
    descriptionReviewPercentage: 1.9,
    groups: [{
      groupId: 'mathematik-rollout-v1-batch-032-atlas-next-20-v1-20260905',
      artifactDirectory: '.',
      dualSummaryPath: 'dual-summary.json',
      dualSummaryDigest: 'sha256:1cd66dfeeaf74cd2249af7453fea1b033989e79bf1a8e5b6b041cd74d064e3bb',
      campaignGoalCount: 20,
      resolvedGoalCount: 15,
    }],
    resolutions: exactEntries,
  }
  const indexBytes = jsonBytes(index)

  const oldConfig = JSON.parse(oldConfigBytes.toString('utf8')) as JsonRecord
  const oldCandidates = JSON.parse(oldCandidatesBytes.toString('utf8')) as JsonRecord
  const oldReviews = parseJsonl(oldReviewBytes)
  const oldCandidateGoals = oldCandidates.goals as JsonRecord[]
  const oldBindings = oldCandidates.sourceBindings as JsonRecord
  if (!sameOrdered(((oldConfig.scope as JsonRecord).goalIds as string[]), stableSixteenIds)
    || !sameOrdered(oldCandidateGoals.map(({ goalId }) => String(goalId)), stableSixteenIds)
    || !sameOrdered(((oldBindings.goals as JsonRecord[]).map(({ goalId }) => String(goalId))), stableSixteenIds)
    || !sameOrdered(oldReviews.map(({ goalId }) => String(goalId)), stableSixteenIds)
    || oldReviews.some(({ status, profile }) => status !== 'needs_human_review' || !profile)) {
    throw new Error('B032 stable16 predecessor evidence/review scope or bindings drifted')
  }
  for (const [position, candidate] of oldCandidateGoals.entries()) {
    const review = oldReviews[position]
    if (stableGoalBookJson(candidate.profile) !== stableGoalBookJson(review.profile)
      || candidate.reason !== review.reason
      || candidate.evidenceLevel !== review.evidenceLevel
      || candidate.maximumClaimScope !== review.maximumClaimScope) {
      throw new Error(`${String(candidate.goalId)}: predecessor candidate/review evidence binding drifted`)
    }
  }
  const filteredCandidates = oldCandidateGoals.filter(({ goalId }) => goalId !== staleSuccessorId)
  const filteredBindings = (oldBindings.goals as JsonRecord[]).filter(({ goalId }) => goalId !== staleSuccessorId)
  if (!sameOrdered(filteredCandidates.map(({ goalId }) => String(goalId)), exactCurrentGoalIds)
    || !sameOrdered(filteredBindings.map(({ goalId }) => String(goalId)), exactCurrentGoalIds)) throw new Error('B032 V2 predecessor profiles do not filter to the exact current15')

  const reviewId = 'canonical-math-positive-evidence-v1-b032-post-b032r-split-exact-current-15-v1'
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
      label: 'Canonical Mathematics B032 post-B032r-split carryover: fifteen exact-current resolution and V2 evidence bindings; the single prerequisite-context-stale successor is excluded',
      goalIds: [...exactCurrentGoalIds],
    },
  }
  const candidateSet = {
    ...oldCandidates,
    reviewId,
    sourceBindings: {
      ...oldBindings,
      bindingContract: 'math-b032-post-b032r-split-exact-current-fifteen-v1',
      curriculumAtomicDenominator: 795,
      predecessorResolutionIndex: { path: oldIndexPath, sha256: sha256(oldIndexBytes) },
      predecessorEvidenceConfig: { path: oldConfigPath, sha256: sha256(oldConfigBytes) },
      predecessorEvidenceCandidates: { path: oldCandidatesPath, sha256: sha256(oldCandidatesBytes) },
      predecessorEvidenceReview: { path: oldReviewPath, sha256: sha256(oldReviewBytes) },
      excludedGoalIds: [staleSuccessorId],
      contextStaleGoalIds: [staleSuccessorId],
      resolutionIndex: { path: newIndexPath, sha256: sha256(indexBytes) },
      goals: filteredBindings,
    },
    goals: filteredCandidates,
  }
  const reviewRecords = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet: candidateSet as never })
  if (!sameOrdered(reviewRecords.map(({ goalId }) => String(goalId)), exactCurrentGoalIds)
    || reviewRecords.some((record, position) => record.status !== 'needs_human_review'
      || stableGoalBookJson(record.profile) !== stableGoalBookJson(filteredCandidates[position].profile))) {
    throw new Error('Generated B032 current15 review records do not preserve the exact existing evidence profiles')
  }
  const receipt = {
    schemaVersion: 1,
    receiptId: 'mathematik-b032-post-b032r-split-exact-current-carryover-15-v1-20260905',
    purpose: 'Fail-closed post-split replacement of the centrally registered B032 stable16 set: fifteen reviewed goals remain bilingual-text and direct-canonical-context exact-current; only e0c3359d is excluded because the split rewired its prerequisite from the retained goal to the new atomic child. Existing resolution, blind-round, V2 profile, and review bindings are reused without new review judgment.',
    predecessor: {
      resolutionIndexPath: oldIndexPath,
      resolutionIndexSha256: sha256(oldIndexBytes),
      positiveEvidenceConfigPath: oldConfigPath,
      positiveEvidenceConfigSha256: sha256(oldConfigBytes),
      positiveEvidenceCandidatesPath: oldCandidatesPath,
      positiveEvidenceCandidatesSha256: sha256(oldCandidatesBytes),
      positiveEvidenceReviewPath: oldReviewPath,
      positiveEvidenceReviewSha256: sha256(oldReviewBytes),
      reviewInputPath: roundInputPath,
      reviewInputSha256: sha256(roundInputBytes),
    },
    current: {
      canonicalPath,
      canonicalSha256: sha256(canonicalBytes),
      semanticKindLedgerPath,
      semanticKindLedgerSha256: sha256(semanticBytes),
      curriculumAtomicDenominator: 795,
    },
    exactCurrentGoalIds: [...exactCurrentGoalIds],
    exactCurrentGoalCount: 15,
    contextStaleGoalIds: [staleSuccessorId],
    resolutionIndexPath: newIndexPath,
    resolutionIndexSha256: sha256(indexBytes),
    positiveEvidenceConfigPath: newConfigPath,
    positiveEvidenceCandidatesPath: newCandidatesPath,
    positiveEvidenceReviewPath: newReviewPath,
    intendedCentralReplacement: {
      resolutionIndexPath: { replace: oldIndexPath, with: newIndexPath },
      positiveEvidenceConfigPath: { replace: oldConfigPath, with: newConfigPath },
    },
    noCentralRolloutRegistration: true,
    safeguards: {
      originalResolutionAndReviewBindingsReusedWithoutNewJudgment: true,
      existingV2ProfilesReusedExactly: true,
      bilingualTextAndDirectCanonicalContextMustBeExactCurrent: true,
      singleExpectedContextStaleSuccessorRequired: true,
      centralRegistrationPerformed: false,
    },
  }

  if (writeMode) execFileSync(process.execPath, ['scripts/check_openai_plugin_review_freeze.mjs'], { cwd: repositoryRoot, stdio: 'inherit' })
  writeOrCheck(newIndexPath, indexBytes)
  writeOrCheck(newConfigPath, jsonBytes(config))
  writeOrCheck(newCandidatesPath, jsonBytes(candidateSet))
  writeOrCheck(newReviewPath, jsonlBytes(reviewRecords))
  writeOrCheck(receiptPath, jsonBytes(receipt))
  const reviewed = reviewPositiveGoalEvidenceConfig(absolute(newConfigPath))
  if (reviewed.errors.length > 0 || reviewed.counts.needsHumanReview !== 15) {
    throw new Error(reviewed.errors.join('\n') || 'B032 post-split exact-current evidence count is not 15')
  }
  console.log(`CHECK math_b032_post_split_exact_current PASS stable16Current=15/16 contextStale=1 claimed=15 denominator=795 v2Profiles=15 centralRegistered=false`)
  console.log(`REPLACE_RESOLUTION ${oldIndexPath} -> ${newIndexPath}`)
  console.log(`REPLACE_EVIDENCE ${oldConfigPath} -> ${newConfigPath}`)
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
