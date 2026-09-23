import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal, loadGoalBookBuildInputs, stableGoalBookJson } from './goalBookModel'
import { buildGoalDescriptionRolloutSubsetModel, materializeGoalDescriptionRolloutBatchDualSummary } from './materializeGoalDescriptionRolloutBatch'
import { validateLegacyResolutionIndexSnapshot } from './reportDeepUnderstandingRollout'
import { buildGoalDescriptionCanonicalContext } from './validateGoalDescriptionReviewCampaign'
import {
  buildGoalDescriptionDualRoundResolution,
  extractGoalDescriptionDualRoundResolutionSource,
  validateGoalDescriptionDualRoundResolution,
} from './validateGoalDescriptionDualRoundResolution'

type Digest = `sha256:${string}`
type AuthoringDecision = {
  goalId: string
  goalFingerprint: Digest
  pageFingerprint: Digest
  imageDigest: Digest
  evidenceRound: 'first' | 'second'
  rationaleDe: string
  rationaleEn: string
}
type Authoring = {
  schemaVersion: 1
  artifactType: 'goal-description-partial-keepkeep-authoring-v1'
  partialClosureId: string
  synthesizedBy: string
  synthesizedAt: string
  sourceBundleFingerprint: Digest
  sourceBookDigest: Digest
  sourceReviewInputFingerprint: Digest
  currentBaseBookDigest: Digest
  currentSubsetBookDigest: Digest
  heldCurrentPageFingerprint: Digest
  excludedGoalIds: string[]
  visualizationHold: {
    goalId: string
    currentImageDigest: Digest
    status: 'D_AND_V_HOLD_CURRENT_PAGE_STALE'
    reasonDe: string
    reasonEn: string
  }
  decisions: AuthoringDecision[]
}

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const outputDirectory = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-23/m7-matrix-spatial-repaired-and-scope20-current-v2',
)
const configPath = join(dirname(outputDirectory), 'm7-matrix-spatial-repaired-and-scope20-current-v2.config.json')
const authoringPath = join(outputDirectory, 'stable-keepkeep-15-v1.authoring.json')
const semanticKindLedgerPath = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
)
const visualizationQaPath = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json',
)
const outputStem = 'stable-keepkeep-15-v1'
const resolutionDirectoryName = `resolutions-${outputStem}`
const indexPath = join(outputDirectory, `resolution-index.${outputStem}.json`)
const receiptPath = join(outputDirectory, `${outputStem}.compatibility-receipt.json`)
const heldGoalId = '6fc9246a-9448-4cdb-b627-cf20ea1c65d3'
const expectedClosureId = 'mathematik-m7-d20-current-keepkeep-15-20260923-v1'
const expectedBundle = 'sha256:ac6b0e618dddcd2d82f4ac754235b1e5b28aa92949f6c4c40811ab540e3928bf'
const expectedBook = 'sha256:75b11e839792e6543141fe39d86097af9264285d76ee0b96aa40febb57c47fb2'
const expectedInput = 'sha256:c894789d0e2df572be1c8923cd7103a66f44bc4a51faa767533c11a8be946f86'
const expectedPreparedBaseBook = 'sha256:2a698ea361b513f722cc625cfc52e9f74c451b50c5e24656c4a8a027524dea79'
const expectedCurrentBaseBook = 'sha256:6af830be9ae935c9605328f1e5509b157581c181b777619918ec763f88a9bf43'
const expectedCurrentSubsetBook = 'sha256:a9bd1a00a95aeb14e5f72cbb19e8e56d2cbf3e8035fe676c45bab959e94b172b'
const expectedHeldPreparedPage = 'sha256:12e525a08b070bc1f4c48e98eac73618c404dcc51e6b0cced9bd2117f4773823'
const expectedHeldCurrentPage = 'sha256:3c0fa5b4c4a3165a71b786eb94fcec301b5e90e23a832b21ab258d766b5e01f9'
const write = process.argv.includes('--write')

const sha256 = (value: Buffer | string): Digest => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)
const jsonBytes = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const sameOrdered = (left: readonly string[], right: readonly string[]) => (
  left.length === right.length && left.every((value, index) => value === right[index])
)
const assert = (condition: unknown, message: string): asserts condition => {
  if (!condition) throw new Error(message)
}
const assertText = (value: unknown, label: string): asserts value is string => {
  assert(typeof value === 'string' && value.length > 0 && value.trim() === value, `${label} must be non-blank and trimmed`)
}
const readJson = async <T>(path: string): Promise<{ value: T; bytes: Buffer }> => {
  const bytes = await readFile(path)
  return { value: JSON.parse(bytes.toString('utf8')) as T, bytes }
}
const readOptional = async (path: string): Promise<Buffer | null> => {
  try {
    return await readFile(path)
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}
const writeAllOrRequireExact = async (artifacts: Array<{ path: string; bytes: Buffer }>) => {
  const existing = await Promise.all(artifacts.map(({ path }) => readOptional(path)))
  artifacts.forEach(({ path, bytes }, index) => {
    if (existing[index] && !existing[index]?.equals(bytes)) throw new Error(`Existing partial-D artifact is stale: ${path}`)
    if (!existing[index] && !write) throw new Error(`Missing partial-D artifact: ${path}`)
  })
  if (!write) return
  await Promise.all(artifacts.flatMap(({ path, bytes }, index) => (
    existing[index]
      ? []
      : [mkdir(dirname(path), { recursive: true }).then(() => writeFile(path, bytes, { flag: 'wx' }))]
  )))
}

const main = async () => {
  const unknownArgs = process.argv.slice(2).filter((arg) => arg !== '--write')
  assert(unknownArgs.length === 0, `Unknown arguments: ${unknownArgs.join(', ')}`)
  const [dual, authoringArtifact, semanticLedgerArtifact, visualizationQaArtifact] = await Promise.all([
    materializeGoalDescriptionRolloutBatchDualSummary(configPath, false),
    readJson<Authoring>(authoringPath),
    readJson<{ sourceLandscapeId: string; decisions: Array<{ goalId: string; semanticKind: string; decisionStatus: string; sourceFingerprint: string }> }>(semanticKindLedgerPath),
    readJson<{ records: Array<{ goalId: string; imageUrl: string; publicAssetPath: string; canonicalAssetPath: string; assetSha256: string; aiApproved?: string; humanApproved?: string }> }>(visualizationQaPath),
  ])
  const authoring = authoringArtifact.value
  assert(
    authoring.schemaVersion === 1
    && authoring.artifactType === 'goal-description-partial-keepkeep-authoring-v1'
    && authoring.partialClosureId === expectedClosureId,
    'D20 partial authoring identity is invalid',
  )
  assertText(authoring.synthesizedBy, 'synthesizedBy')
  assertText(authoring.synthesizedAt, 'synthesizedAt')
  assert(
    authoring.sourceBundleFingerprint === expectedBundle
    && authoring.sourceBundleFingerprint === dual.prepared.manifest.artifacts.bundleFingerprint
    && authoring.sourceBookDigest === expectedBook
    && authoring.sourceBookDigest === dual.first.input.bookDigest
    && authoring.sourceReviewInputFingerprint === expectedInput
    && authoring.sourceReviewInputFingerprint === dual.first.input.reviewInputFingerprint
    && authoring.currentBaseBookDigest === expectedCurrentBaseBook
    && authoring.currentSubsetBookDigest === expectedCurrentSubsetBook
    && authoring.heldCurrentPageFingerprint === expectedHeldCurrentPage,
    'D20 partial source bundle/book/input binding changed',
  )
  assert(dual.summary.goalCount === 20 && dual.summary.counts.requiresSynthesis === 20, 'D20 source campaign is not the exact 20-goal dual summary')
  const keepKeepIds = dual.summary.goals
    .filter(({ firstDecision, secondDecision }) => firstDecision === 'keep' && secondDecision === 'keep')
    .map(({ goalId }) => goalId)
  const expectedClaimedIds = keepKeepIds.filter((goalId) => goalId !== heldGoalId)
  const expectedExcludedIds = dual.summary.goals
    .filter(({ goalId }) => !expectedClaimedIds.includes(goalId))
    .map(({ goalId }) => goalId)
  assert(keepKeepIds.length === 16 && expectedClaimedIds.length === 15 && expectedExcludedIds.length === 5, 'D20 dual summary no longer partitions into 15 page-current KEEP/KEEP and five excluded goals')
  assert(sameOrdered(authoring.decisions.map(({ goalId }) => goalId), expectedClaimedIds), 'D20 partial authoring claimed IDs/order differ from page-current KEEP/KEEP set')
  assert(sameOrdered(authoring.excludedGoalIds, expectedExcludedIds), 'D20 partial authoring excluded IDs/order differ from page-current excluded set')
  assert(
    authoring.visualizationHold.goalId === heldGoalId
    && authoring.visualizationHold.status === 'D_AND_V_HOLD_CURRENT_PAGE_STALE'
    && authoring.visualizationHold.currentImageDigest === 'sha256:ad5f2098065421f707e8f42637a4c427d5f7ce5fc136fb488d1195bd9b98507d'
    && keepKeepIds.includes(heldGoalId)
    && !expectedClaimedIds.includes(heldGoalId),
    '6fc D/V-HOLD must be excluded from the current closure',
  )
  assertText(authoring.visualizationHold.reasonDe, 'visualizationHold.reasonDe')
  assertText(authoring.visualizationHold.reasonEn, 'visualizationHold.reasonEn')

  const landscapePath = resolve(repositoryRoot, dual.prepared.manifest.source.landscapePath)
  const landscapeArtifact = await readJson<{ landscapeId: string; subject: string; goals: Array<Record<string, unknown>> }>(landscapePath)
  const landscape = landscapeArtifact.value
  assert(landscape.subject === 'Mathematik' && Array.isArray(landscape.goals), 'Current canonical Mathematics landscape identity is invalid')
  assert(semanticLedgerArtifact.value.sourceLandscapeId === landscape.landscapeId, 'Current semantic-kind ledger belongs to another landscape')
  const canonicalGoalById = new Map(landscape.goals.map((goal) => [String(goal.id), goal]))
  const semanticDecisionById = new Map(semanticLedgerArtifact.value.decisions.map((decision) => [decision.goalId, decision]))
  const qaById = new Map(visualizationQaArtifact.value.records.map((record) => [record.goalId, record]))
  const currentBase = await loadGoalBookBuildInputs(dual.prepared.manifest.source.baseGoalBookConfigPath, repositoryRoot)
  const currentSubset = buildGoalDescriptionRolloutSubsetModel({
    baseModel: currentBase.model,
    goalIds: dual.prepared.config.goalIds,
    bookId: dual.prepared.config.bookId,
    title: dual.prepared.config.title,
  })
  assert(
    dual.prepared.manifest.source.baseBookDigest === expectedPreparedBaseBook
    && currentBase.model.digest === authoring.currentBaseBookDigest
    && currentSubset.digest === authoring.currentSubsetBookDigest,
    'Base/subset BookModel drift differs from the individually audited 6fc-only status change',
  )
  const preparedPageById = new Map(dual.prepared.model.pages.map((page) => [page.goalId, page]))
  const currentPageById = new Map(currentSubset.pages.map((page) => [page.goalId, page]))
  assert(preparedPageById.size === 20 && currentPageById.size === 20, 'Prepared/current subset page count is not 20')
  for (const goalId of dual.prepared.config.goalIds) {
    const preparedPage = preparedPageById.get(goalId)
    const currentPage = currentPageById.get(goalId)
    assert(preparedPage && currentPage, `${goalId}: missing prepared/current subset page`)
    if (goalId !== heldGoalId) {
      assert(stableGoalBookJson(currentPage) === stableGoalBookJson(preparedPage), `${goalId}: current page differs from reviewed page`)
      continue
    }
    assert(
      preparedPage.goalFingerprint === currentPage.goalFingerprint
      && preparedPage.pageFingerprint === expectedHeldPreparedPage
      && currentPage.pageFingerprint === authoring.heldCurrentPageFingerprint
      && preparedPage.visualization?.qaStatus === 'review_candidate'
      && currentPage.visualization?.qaStatus === 'rejected',
      `${goalId}: held page drift is not the audited QA-status/fingerprint change`,
    )
    const normalizedPrepared = structuredClone(preparedPage)
    const normalizedCurrent = structuredClone(currentPage)
    normalizedCurrent.pageFingerprint = normalizedPrepared.pageFingerprint
    if (normalizedCurrent.visualization && normalizedPrepared.visualization) {
      normalizedCurrent.visualization.qaStatus = normalizedPrepared.visualization.qaStatus
    }
    assert(stableGoalBookJson(normalizedCurrent) === stableGoalBookJson(normalizedPrepared), `${goalId}: held page changed beyond QA status/fingerprint`)
  }
  const heldQa = qaById.get(heldGoalId)
  const heldInput = dual.first.input.goals.find((goal) => goal.goalId === heldGoalId)
  const heldCanonicalGoal = canonicalGoalById.get(heldGoalId)
  assert(heldQa && heldInput && heldCanonicalGoal, '6fc hold is missing current QA/input/canonical data')
  assert(
    heldQa.aiApproved === 'no'
    && heldQa.humanApproved !== 'yes'
    && heldQa.assetSha256 === authoring.visualizationHold.currentImageDigest
    && stableGoalBookJson(buildGoalDescriptionCanonicalContext(heldCanonicalGoal)) === stableGoalBookJson(heldInput.canonicalContext),
    '6fc hold current canonical context/image QA differs from the audited state',
  )
  const denominator = semanticLedgerArtifact.value.decisions.filter((decision) => (
    decision.semanticKind === 'curricularAtomic' && decision.decisionStatus === 'authoritative'
  )).length
  assert(denominator === dual.prepared.manifest.curriculumAtomicDenominatorAtPreparation, 'Current curricularAtomic denominator differs from batch preparation')
  const completionDates = [...dual.first.resultPairs, ...dual.second.resultPairs].map(({ run }) => Date.parse(run.completedAt))
  assert(completionDates.length === 2 && completionDates.every(Number.isFinite), 'Both current D20 runs need valid completion times')
  const synthesizedAt = authoring.synthesizedAt
  assert(
    new Date(synthesizedAt).toISOString() === synthesizedAt
    && Date.parse(synthesizedAt) > Math.max(...completionDates)
    && Date.parse(synthesizedAt) <= Date.now(),
    'Pinned synthesis authoring time must be real, current, and later than both D-review runs',
  )
  const resolutionArtifacts: Array<{ path: string; bytes: Buffer }> = []
  const indexEntries: Array<Record<string, unknown>> = []
  const imageBindings: Array<Record<string, unknown>> = []

  for (const [index, goalId] of expectedClaimedIds.entries()) {
    const authored = authoring.decisions[index]
    const inputGoal = dual.first.input.goals.find((goal) => goal.goalId === goalId)
    const summaryGoal = dual.summary.goals.find((goal) => goal.goalId === goalId)
    const canonicalGoal = canonicalGoalById.get(goalId)
    const semanticDecision = semanticDecisionById.get(goalId)
    const qa = qaById.get(goalId)
    assert(authored && inputGoal && summaryGoal && canonicalGoal && semanticDecision && qa, `${goalId}: missing current authoring, input, canonical, semantic, or image-QA record`)
    assertText(authored.rationaleDe, `${goalId}.rationaleDe`)
    assertText(authored.rationaleEn, `${goalId}.rationaleEn`)
    assert(authored.evidenceRound === 'first' || authored.evidenceRound === 'second', `${goalId}: evidenceRound must select one bound record`)
    assert(
      authored.goalFingerprint === inputGoal.goalFingerprint
      && authored.pageFingerprint === inputGoal.pageFingerprint,
      `${goalId}: authoring goal/page fingerprint changed; requires substantive recheck`,
    )
    assert(
      canonicalGoal.title === inputGoal.currentTitleDe
      && canonicalGoal.titleEn === inputGoal.currentTitleEn
      && canonicalGoal.description === inputGoal.currentDescriptionDe
      && canonicalGoal.descriptionEn === inputGoal.currentDescriptionEn
      && canonicalGoal.sourceRef === inputGoal.canonicalContext.sourceRef,
      `${goalId}: current canonical bilingual text or source reference differs from bound input`,
    )
    assert(
      stableGoalBookJson(buildGoalDescriptionCanonicalContext(canonicalGoal)) === stableGoalBookJson(inputGoal.canonicalContext),
      `${goalId}: current full canonical context differs from bound review input`,
    )
    const currentPage = currentPageById.get(goalId)
    assert(
      currentPage
      && currentPage.goalFingerprint === authored.goalFingerprint
      && currentPage.pageFingerprint === authored.pageFingerprint
      && stableGoalBookJson(currentPage) === stableGoalBookJson(inputGoal.reviewContext.page),
      `${goalId}: current GoalBook page/goal/context differs from bound review input`,
    )
    assert(
      semanticDecision.semanticKind === 'curricularAtomic'
      && semanticDecision.decisionStatus === 'authoritative'
      && semanticDecision.sourceFingerprint === fingerprintSemanticKindSourceGoal(canonicalGoal),
      `${goalId}: semantic-kind decision is not authoritative/current curricularAtomic`,
    )
    const visual = inputGoal.reviewContext.page.visualization
    assert(visual?.resourceType === 'image', `${goalId}: current page has no bound image`)
    assert(
      visual.originalDigest === authored.imageDigest
      && visual.qaStatus === 'review_candidate'
      && visual.approvedForPublication === false
      && qa.assetSha256 === authored.imageDigest
      && qa.imageUrl === visual.url,
      `${goalId}: current image/page/QA binding changed; no V status may be inferred`,
    )
    const [publicImageBytes, canonicalImageBytes] = await Promise.all([
      readFile(resolve(repositoryRoot, qa.publicAssetPath)),
      readFile(resolve(repositoryRoot, qa.canonicalAssetPath)),
    ])
    assert(
      sha256(publicImageBytes) === authored.imageDigest
      && sha256(canonicalImageBytes) === authored.imageDigest,
      `${goalId}: public or canonical visualization bytes differ from reviewed pin`,
    )
    imageBindings.push({ goalId, imageDigest: authored.imageDigest, qaStatus: visual.qaStatus, approvedForPublication: false })

    const first = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.first, goalId, label: 'First' })
    const second = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.second, goalId, label: 'Second' })
    assert(first.errors.length === 0 && second.errors.length === 0 && first.source?.record && second.source?.record, `${goalId}: missing valid exact A/B source (${[...first.errors, ...second.errors].join(' | ')})`)
    assert(first.source.decision === 'keep' && second.source.decision === 'keep', `${goalId}: partial closure requires two exact current KEEP records`)
    assert(
      first.source.binding.goalReviewContextFingerprint === second.source.binding.goalReviewContextFingerprint,
      `${goalId}: A/B context fingerprints differ`,
    )
    const selected = authored.evidenceRound === 'first' ? first.source : second.source
    const resolution = buildGoalDescriptionDualRoundResolution({
      resolutionId: `${expectedClosureId}-resolution-${goalId}`,
      goalId,
      effectiveSemanticKind: 'curricularAtomic',
      decision: 'keep_current',
      synthesis: {
        synthesisId: `${expectedClosureId}-synthesis-${goalId}`,
        authority: 'ai_synthesis',
        synthesizedBy: authoring.synthesizedBy,
        synthesizedAt,
        rationaleDe: authored.rationaleDe,
        rationaleEn: authored.rationaleEn,
        understandingEvidence: structuredClone(selected.record.understandingEvidence),
        dissent: [{
          dissentId: `compatible-review-emphasis-${goalId}`,
          source: 'both',
          textDe: 'Beide aktuellen KEEP-Records bleiben vollständig gebunden; die nicht gewählte Evidenzkette ist eine kompatible, aber anders akzentuierte AI-Kandidatenperspektive.',
          textEn: 'Both current KEEP records remain fully bound; the unselected evidence chain is a compatible but differently emphasized AI-candidate perspective.',
          disposition: authored.evidenceRound === 'first' ? 'accepted_first' : 'accepted_second',
        }],
        humanAttestation: null,
      },
      dualSummaryBytes: dual.bytes,
      currentInput: dual.first.input,
      firstSource: first.source,
      secondSource: second.source,
    })
    const validation = await validateGoalDescriptionDualRoundResolution({
      resolution,
      dualSummary: dual.summary,
      dualSummaryBytes: dual.bytes,
      currentInput: dual.first.input,
      landscape,
      first: dual.first,
      second: dual.second,
    })
    assert(validation.errors.length === 0 && validation.strictDescriptionComplete, `${goalId}: native resolution validation failed (${validation.errors.join(' | ') || 'not strict-complete'})`)
    const bytes = jsonBytes(resolution)
    const resolutionPath = `${resolutionDirectoryName}/${goalId}.resolution.json`
    resolutionArtifacts.push({ path: join(outputDirectory, resolutionPath), bytes })
    indexEntries.push({
      goalId,
      titleDe: resolution.goal.finalText.titleDe,
      groupId: dual.prepared.manifest.batchId,
      decision: 'keep_current',
      resolutionPath,
      resolutionDigest: sha256(bytes),
      resolutionFingerprint: resolution.resolutionFingerprint,
      strictDescriptionComplete: true,
    })
  }
  assert(imageBindings.length === 15 && indexEntries.length === 15, 'D20 partial resolution/image count is not 15')
  const index = {
    schemaVersion: 1,
    artifactSetId: `${dual.prepared.manifest.batchId}-${outputStem}`,
    subject: dual.prepared.manifest.subjectLabel,
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: indexEntries.length,
    curriculumAtomicDenominator: denominator,
    descriptionReviewPercentage: Number(((indexEntries.length / denominator) * 100).toFixed(1)),
    groups: [{
      groupId: dual.prepared.manifest.batchId,
      artifactDirectory: '.',
      dualSummaryPath: 'dual-summary.json',
      dualSummaryDigest: sha256(dual.bytes),
      campaignGoalCount: dual.summary.goalCount,
      resolvedGoalCount: indexEntries.length,
    }],
    resolutions: indexEntries,
  }
  const indexErrors = validateLegacyResolutionIndexSnapshot(index)
  assert(indexErrors.length === 0, `Native partial-index snapshot validation failed: ${indexErrors.join(' | ')}`)
  const receipt = {
    schemaVersion: 1,
    receiptId: `${expectedClosureId}-compatibility-receipt`,
    scope: 'Exactly 15 current-page KEEP/KEEP D descriptions out of the bound 20-goal campaign; four non-KEEP/KEEP goals and stale-page 6fc excluded',
    sourceBatchId: dual.prepared.manifest.batchId,
    sourceCampaignGoalCount: dual.summary.goalCount,
    claimedGoalIds: expectedClaimedIds,
    claimedGoalCount: indexEntries.length,
    excludedGoalIds: expectedExcludedIds,
    excludedGoalCount: expectedExcludedIds.length,
    sourceBundleFingerprint: expectedBundle,
    sourceBookDigest: expectedBook,
    preparedBaseBookDigest: expectedPreparedBaseBook,
    currentBaseBookDigest: currentBase.model.digest,
    currentSubsetBookDigest: currentSubset.digest,
    sourceReviewInputFingerprint: expectedInput,
    sourceDualSummaryDigest: sha256(dual.bytes),
    currentCanonicalLandscapeDigest: sha256(landscapeArtifact.bytes),
    currentSemanticKindLedgerDigest: sha256(semanticLedgerArtifact.bytes),
    authoringPath: 'stable-keepkeep-15-v1.authoring.json',
    authoringDigest: sha256(authoringArtifact.bytes),
    resolutionIndexPath: `resolution-index.${outputStem}.json`,
    resolutionIndexFormat: 'legacy-schema-v1-partial-group',
    imageBindings,
    currentPageDrift: {
      goalId: heldGoalId,
      preparedPageFingerprint: expectedHeldPreparedPage,
      currentPageFingerprint: expectedHeldCurrentPage,
      onlyChangedSemanticField: 'visualization.qaStatus: review_candidate -> rejected',
      currentDStatus: 'HOLD',
      currentVStatus: 'HOLD',
    },
    visualizationHold: authoring.visualizationHold,
    safeguards: {
      exactKeepKeepRequired: true,
      excludedScopeFailsClosed: true,
      allTwentyPreparedCurrentPageDeltasAudited: true,
      fifteenCurrentGoalPageContextPinned: true,
      staleSixteenthPageExcluded: true,
      publicAndCanonicalImageBytesChecked: true,
      semanticKindCurrentAndAuthoritative: true,
      individualResolutionsFreshlyValidated: true,
      partialIndexSnapshotNativeValidated: true,
      positiveEvidenceInScope: false,
      visualizationApprovalGranted: false,
      centralRegistrationPerformed: false,
      canonicalOrQaMutationPerformed: false,
      humanApprovalGranted: false,
    },
  }
  await writeAllOrRequireExact([
    ...resolutionArtifacts,
    { path: indexPath, bytes: jsonBytes(index) },
    { path: receiptPath, bytes: jsonBytes(receipt) },
  ])
  console.log(`${write ? 'Materialized' : 'Verified'} Mathematics M7 D20 partial D closure: strict=${indexEntries.length}/15; excluded=${expectedExcludedIds.length}; D/V-hold=${heldGoalId}; index=${indexPath}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
