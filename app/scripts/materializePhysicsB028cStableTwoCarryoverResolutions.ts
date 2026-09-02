import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { buildGoalDescriptionRolloutResolutionSynthesis } from './goalDescriptionRolloutResolutionSynthesis'
import { loadGoalBookBuildInputs, stableGoalBookJson } from './goalBookModel'
import {
  buildGoalDescriptionRolloutSubsetModel,
  materializeGoalDescriptionRolloutBatchDualSummary,
} from './materializeGoalDescriptionRolloutBatch'
import {
  buildGoalDescriptionDualRoundResolution,
  extractGoalDescriptionDualRoundResolutionSource,
  fingerprintGoalDescriptionReviewContext,
  validateGoalDescriptionDualRoundResolution,
} from './validateGoalDescriptionDualRoundResolution'
import { buildGoalDescriptionCanonicalContext } from './validateGoalDescriptionReviewCampaign'
import {
  buildGoalDescriptionRolloutSynthesisRoundBinding,
  fingerprintGoalDescriptionRolloutSynthesisDecisionManifest,
  validateGoalDescriptionRolloutSynthesisDecisionManifest,
  type GoalDescriptionRolloutSynthesisDecisionManifest,
  type GoalDescriptionRolloutSynthesisExpectedGoal,
  type GoalDescriptionSynthesisDigest,
} from './validateGoalDescriptionRolloutSynthesisDecisionManifest'

type JsonGoal = Record<string, unknown>

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
if (writeMode === checkMode) throw new Error('Use exactly one of --write or --check')
const unexpected = process.argv.slice(2).filter((argument) => !['--write', '--check'].includes(argument))
if (unexpected.length > 0) throw new Error(`Unexpected arguments: ${unexpected.join(', ')}`)

const rolloutRoot = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-02'
const batchName = 'batch-028c-e-gravitation-worldviews-revised-3-v1'
const batchDirectory = `${rolloutRoot}/${batchName}`
const sourceConfigPath = `${batchDirectory}.config.json`
const batchManifestPath = `${batchDirectory}/batch-manifest.json`
const dualSummaryPath = `${batchDirectory}/dual-summary.json`
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const semanticKindLedgerPath = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const roundARecordsPath = `${batchDirectory}/round-a/results/physik-rollout-v1-batch-028c-e-gravitation-worldviews-revised-3-v1-20260902-first-pass-a.batch-001.records.jsonl`
const roundARunPath = roundARecordsPath.replace('.records.jsonl', '.run.json')
const roundBRecordsPath = `${batchDirectory}/round-b/results/physik-rollout-v1-batch-028c-e-gravitation-worldviews-revised-3-v1-20260902-first-pass-b.batch-001.records.jsonl`
const roundBRunPath = roundBRecordsPath.replace('.records.jsonl', '.run.json')
const outputStem = 'stable-current-carryover-2-v1'
const synthesisRelativePath = `synthesis-decisions.${outputStem}.json`
const synthesisPath = `${batchDirectory}/${synthesisRelativePath}`
const resolutionDirectory = `resolutions-${outputStem}`
const indexRelativePath = `resolution-index.${outputStem}.json`
const indexPath = `${batchDirectory}/${indexRelativePath}`
const receiptRelativePath = `${outputStem}.compatibility-receipt.json`
const receiptPath = `${batchDirectory}/${receiptRelativePath}`
const rebaseSnapshotManifestPath = `${rolloutRoot}/batch-028d-e-worldviews-revised-1-v1/batch-manifest.json`

const sourceHashes = {
  config: '0c248f3d8c70ce0015a0ad3b8b6f313702bd9a91f823510a1660344a8a590c9a',
  batchManifest: '50f75c1f5165e97812c7751c6302c3559fff170d761e603c80525ed4af939efd',
  dualSummary: 'ae39b4d50bf4b6a9d2d83d4a5f423d7b7e3ec0bbd8d8133a2fc3dd0a2f45bbf0',
  roundARecords: 'd419fec585ee03740ea366d5a1e5eefe9f3390bc7c9b14701d50803f5d673f0a',
  roundARun: '79521f7fd531ea7f26d7d98b6d48331b736037a33ddf83a8e94623c8a57edf2e',
  roundBRecords: '10cf847d212fcf8e30a3bfd6d2d082301e3ca22bf3f9bf2412f0aca4b8a51fd2',
  roundBRun: 'eef0c80823dd4ae938467f6ea3cf67a910d041a3fa2b8a7da66d18bf0e73bf44',
  canonical: 'f9a4038bf219e38fe2e073aa908f45e70abf60ff82ab76ea8d0c7bd530299a6b',
  semanticKindLedger: '8d35c661c271d536334b64dc6ca7aea33b0ce45fc1cb2a784cb3301754d1465b',
  rebaseSnapshotManifest: 'ca3768f55c1c4c30febc3b40e12291b667e0ff1f7e0edce5093e0670aabfea0f',
} as const

const stableGoalIds = [
  '156edddc-ce8d-580d-8d17-d9376d59e60e',
  '15b56a1e-3eec-52ca-82fa-b4df9ce88415',
] as const
const excludedFreshGoalIds = [
  '481ffd56-d585-56fe-b525-ed423e30eed3',
] as const
const evidenceRoundByGoal = new Map<string, 'first' | 'second'>([
  [stableGoalIds[0], 'second'],
  [stableGoalIds[1], 'first'],
])
const rationaleByGoal = new Map<string, { de: string; en: string }>([
  [stableGoalIds[0], {
    de: 'Nach dem früheren Split-Review-Dissent bestätigen beide frischen B028c-Blindprüfungen die unveränderte Feldbegriffskompetenz als kohärent. Die zweite Runde liefert die ausgewählte, besonders präzise Evidenzfassung; die erste bleibt vollständig als unabhängige Bestätigung gebunden.',
    en: 'After the earlier split-review dissent, both fresh B028c blind reviews confirm the unchanged field-concept competency as coherent. The second round supplies the selected, especially precise evidence formulation; the first remains fully bound as independent confirmation.',
  }],
  [stableGoalIds[1], {
    de: 'Beide unabhängigen Blindprüfungen bestätigen die unveränderte Kompetenz. Die erste Runde liefert die ausgewählte Evidenzfassung; die zweite bleibt als vollständig gebundene unabhängige Bestätigung erhalten.',
    en: 'Both independent blind reviews confirm the unchanged competency. The first round supplies the selected evidence formulation; the second remains fully bound as independent confirmation.',
  }],
])

const absolute = (path: string): string => resolve(repoRoot, path)
const sha256Hex = (bytes: string | Uint8Array): string => createHash('sha256').update(bytes).digest('hex')
const digest = (bytes: string | Uint8Array): GoalDescriptionSynthesisDigest => `sha256:${sha256Hex(bytes)}`
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const readBound = (path: string, expected: string): Buffer => {
  const bytes = readFileSync(absolute(path))
  const actual = sha256Hex(bytes)
  if (actual !== expected) throw new Error(`${path}: bound digest drift ${actual} != ${expected}`)
  return bytes
}
const completionTimestamp = (runs: Array<{ completedAt: string }>): string => {
  const timestamps = runs.map(({ completedAt }) => Date.parse(completedAt))
  if (timestamps.length === 0 || timestamps.some((value) => !Number.isFinite(value))) {
    throw new Error('Blind runs must have valid completion timestamps')
  }
  return new Date(Math.max(...timestamps) + 1000).toISOString()
}
const assertOutput = (path: string, bytes: Buffer): void => {
  if (!existsSync(absolute(path))) throw new Error(`Missing generated output: ${path}`)
  const actual = readFileSync(absolute(path))
  if (!actual.equals(bytes)) throw new Error(`Generated output drift: ${path}`)
}
const publish = (path: string, bytes: Buffer): void => {
  mkdirSync(dirname(absolute(path)), { recursive: true })
  if (existsSync(absolute(path))) assertOutput(path, bytes)
  else writeFileSync(absolute(path), bytes, { flag: 'wx' })
}

const main = async (): Promise<void> => {
  const configBytes = readBound(sourceConfigPath, sourceHashes.config)
  const batchManifestBytes = readBound(batchManifestPath, sourceHashes.batchManifest)
  const dualSummaryBytes = readBound(dualSummaryPath, sourceHashes.dualSummary)
  const roundARecordsBytes = readBound(roundARecordsPath, sourceHashes.roundARecords)
  const roundARunBytes = readBound(roundARunPath, sourceHashes.roundARun)
  const roundBRecordsBytes = readBound(roundBRecordsPath, sourceHashes.roundBRecords)
  const roundBRunBytes = readBound(roundBRunPath, sourceHashes.roundBRun)
  const canonicalBytes = readBound(canonicalPath, sourceHashes.canonical)
  const semanticKindLedgerBytes = readBound(semanticKindLedgerPath, sourceHashes.semanticKindLedger)
  const rebaseSnapshotManifestBytes = readBound(rebaseSnapshotManifestPath, sourceHashes.rebaseSnapshotManifest)
  const rebaseSnapshotManifest = JSON.parse(rebaseSnapshotManifestBytes.toString('utf8')) as {
    source: { baseBookDigest: GoalDescriptionSynthesisDigest }
    artifacts: {
      bookModelDigest: GoalDescriptionSynthesisDigest
      bundleFingerprint: GoalDescriptionSynthesisDigest
    }
  }
  const sourceConfig = JSON.parse(configBytes.toString('utf8')) as {
    baseGoalBookConfigPath: string
    bookId: string
    title: string
    goalIds: string[]
  }
  const landscape = JSON.parse(canonicalBytes.toString('utf8')) as { goals: JsonGoal[] }
  const semanticKindLedger = JSON.parse(semanticKindLedgerBytes.toString('utf8')) as {
    counts?: { curricularAtomic?: number }
    decisions?: Array<{ goalId?: string; semanticKind?: string; decisionStatus?: string }>
  }
  if (semanticKindLedger.counts?.curricularAtomic !== 461) throw new Error('Physics curricularAtomic denominator drifted')
  for (const goalId of stableGoalIds) {
    const kind = semanticKindLedger.decisions?.find((decision) => decision.goalId === goalId)
    if (kind?.semanticKind !== 'curricularAtomic' || kind.decisionStatus !== 'authoritative') {
      throw new Error(`${goalId}: missing authoritative curricularAtomic classification`)
    }
  }

  const dual = await materializeGoalDescriptionRolloutBatchDualSummary(absolute(sourceConfigPath), false)
  if (!dual.bytes.equals(dualSummaryBytes)) throw new Error('Materialized dual summary is not exact-bound')
  if (dual.summary.goalCount !== 3) throw new Error('B028c campaign must contain exactly three goals')
  const campaignIds = dual.summary.goals.map(({ goalId }) => goalId)
  if (stableGoalIds.some((goalId) => !campaignIds.includes(goalId))) throw new Error('Stable scope escaped B028c')
  if (excludedFreshGoalIds.some((goalId) => !campaignIds.includes(goalId))) throw new Error('Fresh exclusion escaped B028c')

  const currentBase = await loadGoalBookBuildInputs(sourceConfig.baseGoalBookConfigPath)
  const currentSubset = buildGoalDescriptionRolloutSubsetModel({
    baseModel: currentBase.model,
    goalIds: sourceConfig.goalIds,
    bookId: sourceConfig.bookId,
    title: sourceConfig.title,
  })
  const stableCurrentAtlasPages = stableGoalIds.map((goalId) => {
    const sourcePage = dual.prepared.model.pages.find((page) => page.goalId === goalId)
    const currentPage = currentSubset.pages.find((page) => page.goalId === goalId)
    if (!sourcePage || !currentPage) throw new Error(`${goalId}: missing source or current Atlas page`)
    if (stableGoalBookJson(sourcePage) !== stableGoalBookJson(currentPage)) {
      throw new Error(`${goalId}: current Atlas page context drifted`)
    }
    return {
      goalId,
      sourceGoalFingerprint: sourcePage.goalFingerprint,
      currentGoalFingerprint: currentPage.goalFingerprint,
      sourcePageFingerprint: sourcePage.pageFingerprint,
      currentPageFingerprint: currentPage.pageFingerprint,
      exactPageContext: true,
    }
  })
  if (dual.prepared.manifest.source.baseBookDigest === rebaseSnapshotManifest.source.baseBookDigest) {
    throw new Error('B028d post-revision Atlas snapshot must differ from the source B028c base Atlas')
  }
  if (dual.prepared.model.digest === currentSubset.digest) {
    throw new Error('Current B028c subset must reflect the accepted 481 wording revision')
  }

  const expectedGoals: GoalDescriptionRolloutSynthesisExpectedGoal[] = []
  const sources = new Map<string, {
    first: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
    second: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
  }>()
  const currentCanonicalContexts: Array<{ goalId: string; canonicalContext: unknown; fingerprint: GoalDescriptionSynthesisDigest }> = []
  for (const goalId of stableGoalIds) {
    const firstResult = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.first, goalId, label: 'First' })
    const secondResult = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.second, goalId, label: 'Second' })
    if (firstResult.errors.length > 0 || secondResult.errors.length > 0 || !firstResult.source || !secondResult.source) {
      throw new Error(`${goalId}: source extraction failed: ${[...firstResult.errors, ...secondResult.errors].join(' | ')}`)
    }
    const selectedRound = evidenceRoundByGoal.get(goalId)
    const selected = selectedRound === 'first' ? firstResult.source : secondResult.source
    if (selected.decision !== 'keep') throw new Error(`${goalId}: selected evidence round must be KEEP`)
    if (firstResult.source.decision !== 'keep' || secondResult.source.decision !== 'keep') {
      throw new Error(`${goalId}: consensus-stable goals require two KEEP records`)
    }
    const firstInput = dual.first.input.goals.find((goal) => goal.goalId === goalId)
    const secondInput = dual.second.input.goals.find((goal) => goal.goalId === goalId)
    const canonicalGoal = landscape.goals.find((goal) => goal.id === goalId)
    if (!firstInput || !secondInput || !canonicalGoal) throw new Error(`${goalId}: missing input or canonical goal`)
    const canonicalContext = buildGoalDescriptionCanonicalContext(canonicalGoal)
    if (stableGoalBookJson(firstInput) !== stableGoalBookJson(secondInput)) throw new Error(`${goalId}: blind inputs differ`)
    if (stableGoalBookJson(firstInput.canonicalContext) !== stableGoalBookJson(canonicalContext)) {
      throw new Error(`${goalId}: direct canonical context changed`)
    }
    const finalText = {
      titleDe: firstInput.currentTitleDe,
      titleEn: firstInput.currentTitleEn,
      descriptionDe: firstInput.currentDescriptionDe,
      descriptionEn: firstInput.currentDescriptionEn,
    }
    const currentText = {
      titleDe: String(canonicalGoal.title ?? ''),
      titleEn: String(canonicalGoal.titleEn ?? ''),
      descriptionDe: String(canonicalGoal.description ?? ''),
      descriptionEn: String(canonicalGoal.descriptionEn ?? ''),
    }
    if (stableGoalBookJson(finalText) !== stableGoalBookJson(currentText)) throw new Error(`${goalId}: text is not exact-current`)
    expectedGoals.push({
      goalId,
      effectiveSemanticKind: 'curricularAtomic',
      goalFingerprint: firstInput.goalFingerprint as GoalDescriptionSynthesisDigest,
      pageFingerprint: firstInput.pageFingerprint as GoalDescriptionSynthesisDigest,
      goalReviewContextFingerprint: fingerprintGoalDescriptionReviewContext(firstInput),
      finalText,
      firstSource: firstResult.source,
      secondSource: secondResult.source,
    })
    sources.set(goalId, { first: firstResult.source, second: secondResult.source })
    currentCanonicalContexts.push({ goalId, canonicalContext, fingerprint: digest(stableGoalBookJson(canonicalContext)) })
  }

  const firstGoal = expectedGoals[0]
  if (!firstGoal) throw new Error('Stable scope is empty')
  const synthesizedAt = completionTimestamp([
    JSON.parse(roundARunBytes.toString('utf8')) as { completedAt: string },
    JSON.parse(roundBRunBytes.toString('utf8')) as { completedAt: string },
  ])
  const expectedBindings = {
    batch: {
      batchId: dual.prepared.manifest.batchId,
      batchManifestDigest: digest(batchManifestBytes),
      configDigest: digest(configBytes),
      bundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint,
      bookDigest: dual.first.input.bookDigest as GoalDescriptionSynthesisDigest,
      reviewInputFingerprint: dual.first.input.reviewInputFingerprint as GoalDescriptionSynthesisDigest,
      dualSummaryDigest: digest(dual.bytes),
      canonicalLandscapeDigest: digest(canonicalBytes),
    },
    rounds: {
      first: buildGoalDescriptionRolloutSynthesisRoundBinding(firstGoal.firstSource.binding, dual.prepared.manifest.artifacts.rounds.first.batchInputFingerprint),
      second: buildGoalDescriptionRolloutSynthesisRoundBinding(firstGoal.secondSource.binding, dual.prepared.manifest.artifacts.rounds.second.batchInputFingerprint),
    },
    synthesizedAt,
    goals: expectedGoals,
  }
  const manifestId = 'physik-b028c-stable2-synthesis-openai-codex-20260902'
  const manifestPayload: Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'> = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
    schemaVersion: 1,
    synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
    manifestId,
    authority: 'ai_synthesis',
    synthesizedBy: 'OpenAI Codex B028c stable-two adjudicated carryover synthesis candidate',
    synthesizedAt,
    batch: expectedBindings.batch,
    rounds: expectedBindings.rounds,
    decisions: expectedGoals.map((goal, index) => {
      const source = sources.get(goal.goalId)
      const evidenceRound = evidenceRoundByGoal.get(goal.goalId)
      const rationale = rationaleByGoal.get(goal.goalId)
      if (!source?.first.record || !source.second.record || !evidenceRound || !rationale) throw new Error(`${goal.goalId}: incomplete decision source`)
      return {
        decisionId: `${manifestId}-decision-${String(index + 1).padStart(3, '0')}`,
        goalId: goal.goalId,
        effectiveSemanticKind: goal.effectiveSemanticKind,
        goalFingerprint: goal.goalFingerprint,
        pageFingerprint: goal.pageFingerprint,
        goalReviewContextFingerprint: goal.goalReviewContextFingerprint,
        finalText: goal.finalText,
        resolutionDecision: 'keep_current' as const,
        evidenceRound,
        records: {
          first: { recordId: source.first.binding.recordId, recordDigest: source.first.binding.recordDigest },
          second: { recordId: source.second.binding.recordId, recordDigest: source.second.binding.recordDigest },
        },
        rationaleDe: rationale.de,
        rationaleEn: rationale.en,
      }
    }),
  }
  const synthesisManifest: GoalDescriptionRolloutSynthesisDecisionManifest = {
    ...manifestPayload,
    manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(manifestPayload),
  }
  const manifestValidation = await validateGoalDescriptionRolloutSynthesisDecisionManifest({ manifest: synthesisManifest, expected: expectedBindings })
  if (manifestValidation.errors.length > 0) throw new Error(`Synthesis invalid: ${manifestValidation.errors.join(' | ')}`)
  const synthesisBytes = jsonBytes(synthesisManifest)

  const resolutionOutputs: Array<{ path: string; bytes: Buffer }> = []
  const indexEntries: Array<Record<string, unknown>> = []
  for (const goal of expectedGoals) {
    const source = sources.get(goal.goalId)
    const summaryGoal = dual.summary.goals.find(({ goalId }) => goalId === goal.goalId)
    const decision = synthesisManifest.decisions.find(({ goalId }) => goalId === goal.goalId)
    if (!source || !summaryGoal || !decision) throw new Error(`${goal.goalId}: incomplete resolution alignment`)
    const synthesis = buildGoalDescriptionRolloutResolutionSynthesis({
      batchId: synthesisManifest.batch.batchId,
      manifest: synthesisManifest,
      decision,
      summaryGoal,
      firstSource: source.first,
      secondSource: source.second,
    })
    const resolution = buildGoalDescriptionDualRoundResolution({
      resolutionId: `physics-b028c-stable2-current-carryover-v1-resolution-${goal.goalId}`,
      goalId: goal.goalId,
      effectiveSemanticKind: 'curricularAtomic',
      decision: 'keep_current',
      synthesis,
      dualSummaryBytes: dual.bytes,
      currentInput: dual.first.input,
      firstSource: source.first,
      secondSource: source.second,
      synthesisDecisionManifest: {
        contract: synthesisManifest.synthesisContract,
        manifestPath: synthesisRelativePath,
        manifestId: synthesisManifest.manifestId,
        manifestDigest: digest(synthesisBytes),
        manifestFingerprint: synthesisManifest.manifestFingerprint,
        decisionId: decision.decisionId,
      },
    })
    const validation = await validateGoalDescriptionDualRoundResolution({
      resolution,
      dualSummary: dual.summary,
      dualSummaryBytes: dual.bytes,
      currentInput: dual.first.input,
      landscape,
      first: dual.first,
      second: dual.second,
      synthesisDecisionManifestArtifact: { manifest: synthesisManifest, manifestBytes: synthesisBytes, manifestPath: synthesisRelativePath },
    })
    if (validation.errors.length > 0 || !validation.strictDescriptionComplete) {
      throw new Error(`${goal.goalId}: resolution invalid: ${validation.errors.join(' | ')}`)
    }
    const bytes = jsonBytes(resolution)
    const relativePath = `${resolutionDirectory}/${goal.goalId}.resolution.json`
    resolutionOutputs.push({ path: `${batchDirectory}/${relativePath}`, bytes })
    indexEntries.push({
      goalId: goal.goalId,
      titleDe: resolution.goal.finalText.titleDe,
      groupId: dual.prepared.manifest.batchId,
      decision: resolution.decision,
      resolutionPath: relativePath,
      resolutionDigest: digest(bytes),
      resolutionFingerprint: resolution.resolutionFingerprint,
      strictDescriptionComplete: true,
    })
  }
  const index = {
    schemaVersion: 1,
    artifactSetId: `${dual.prepared.manifest.batchId}-stable-current-carryover-2`,
    subject: dual.prepared.manifest.subjectLabel,
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: 2,
    curriculumAtomicDenominator: 461,
    descriptionReviewPercentage: 0.4,
    groups: [{
      groupId: dual.prepared.manifest.batchId,
      artifactDirectory: '.',
      dualSummaryPath: 'dual-summary.json',
      dualSummaryDigest: digest(dual.bytes),
      campaignGoalCount: dual.summary.goalCount,
      resolvedGoalCount: 2,
    }],
    resolutions: indexEntries,
  }
  const indexBytes = jsonBytes(index)
  const outputsWithoutReceipt = [
    { path: synthesisPath, bytes: synthesisBytes },
    ...resolutionOutputs,
    { path: indexPath, bytes: indexBytes },
  ]
  const receiptBody = {
    schemaVersion: 1,
    receiptId: 'physik-b028c-stable-current-carryover-2-v1-20260902',
    purpose: 'Hash-bound carryover of exactly two consensus-stable B028c goals while the accepted local worldview wording revision requires fresh B028d blind review.',
    source: {
      configPath: sourceConfigPath,
      configSha256: digest(configBytes),
      batchManifestPath,
      batchManifestSha256: digest(batchManifestBytes),
      dualSummaryPath,
      dualSummarySha256: digest(dualSummaryBytes),
      semanticKindLedgerPath,
      semanticKindLedgerSha256: digest(semanticKindLedgerBytes),
      curriculumAtomicDenominator: 461,
      roundA: { recordsPath: roundARecordsPath, recordsSha256: digest(roundARecordsBytes), runPath: roundARunPath, runSha256: digest(roundARunBytes) },
      roundB: { recordsPath: roundBRecordsPath, recordsSha256: digest(roundBRecordsBytes), runPath: roundBRunPath, runSha256: digest(roundBRunBytes) },
    },
    currentCanonicalLandscape: { path: canonicalPath, sha256: digest(canonicalBytes) },
    compatibilityRebase: {
      status: 'accepted_exact_stable_page_rebase',
      reason: 'The accepted 481 wording revision changes the post-revision Atlas snapshot and B028c subset, while both claimed stable pages remain byte-exact in every rebuilt current Atlas subset. Later unrelated external-landscape drift is intentionally non-authoritative for these two page claims.',
      sourceBaseBookDigest: dual.prepared.manifest.source.baseBookDigest,
      sourceSubsetBookDigest: dual.prepared.model.digest,
      postRevisionSnapshot: {
        batchManifestPath: rebaseSnapshotManifestPath,
        batchManifestDigest: digest(rebaseSnapshotManifestBytes),
        baseBookDigest: rebaseSnapshotManifest.source.baseBookDigest,
        bookModelDigest: rebaseSnapshotManifest.artifacts.bookModelDigest,
        bundleFingerprint: rebaseSnapshotManifest.artifacts.bundleFingerprint,
      },
      fullAtlasDigestChangedAtPostRevisionSnapshot: true,
      currentSubsetDiffersFromSourceSubset: true,
      unrelatedExternalLandscapeDriftExcludedFromStablePageClaims: true,
      stableGoalPages: stableCurrentAtlasPages,
    },
    currentCanonicalContexts,
    claimedGoalIds: stableGoalIds,
    explicitlyExcludedFreshGoalIds: excludedFreshGoalIds,
    adjudication: {
      currentTextKeptGoalIds: stableGoalIds,
      freshlyResolvedPriorSplitReviewGoalIds: [stableGoalIds[0]],
      adoptedRevisionFreshGoalIds: excludedFreshGoalIds,
    },
    synthesisManifestPath: synthesisRelativePath,
    synthesisManifestDigest: digest(synthesisBytes),
    synthesisManifestFingerprint: synthesisManifest.manifestFingerprint,
    resolutionIndexPath: indexRelativePath,
    resolutionIndexDigest: digest(indexBytes),
    safeguards: {
      sourceRunsRecordsAndDualSummaryByteBound: true,
      selectedEvidenceRoundMustBeKeep: true,
      currentBilingualTextsAndDirectContextsRequired: true,
      currentAtlasStablePagesRequiredByteExact: true,
      stableTwoAndFreshOneScopesDisjointAndComplete: true,
      canonicalLandscapeAndSemanticKindLedgerByteBound: true,
      openAiReviewFreezeRequiredBeforeWrite: true,
    },
  } as const
  const materializationPlanSha256 = digest(jsonBytes({
    sourceHashes,
    stableGoalIds,
    excludedFreshGoalIds,
    outputs: outputsWithoutReceipt.map(({ path, bytes }) => ({ path, sha256: digest(bytes) })),
    receiptPath,
    receiptBody,
  }))
  const receiptBytes = jsonBytes({ ...receiptBody, materializationPlanSha256 })
  const outputs = [...outputsWithoutReceipt, { path: receiptPath, bytes: receiptBytes }]

  if (writeMode) {
    execFileSync(process.execPath, ['scripts/check_openai_plugin_review_freeze.mjs'], { cwd: repoRoot, stdio: 'inherit' })
    for (const output of outputs) publish(output.path, output.bytes)
  } else {
    for (const output of outputs) assertOutput(output.path, output.bytes)
  }
  console.log(`Physics B028c stable-two carryover ${writeMode ? 'materialized' : 'valid'}: goals=2; synthesis=${digest(synthesisBytes)}; index=${digest(indexBytes)}; receipt=${digest(receiptBytes)}`)
}

await main()
