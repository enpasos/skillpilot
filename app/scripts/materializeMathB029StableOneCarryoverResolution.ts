import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { buildGoalDescriptionRolloutResolutionSynthesis } from './goalDescriptionRolloutResolutionSynthesis'
import {
  buildGoalDescriptionRolloutSubsetModel,
  materializeGoalDescriptionRolloutBatchDualSummary,
} from './materializeGoalDescriptionRolloutBatch'
import { loadGoalBookBuildInputs, stableGoalBookJson } from './goalBookModel'
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
const rolloutRoot = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-02'
const batchName = 'batch-029-j8-interest-spreadsheet-parameters-3-v1'
const batchDirectory = `${rolloutRoot}/${batchName}`
const sourceConfigPath = `${batchDirectory}.config.json`
const batchManifestPath = `${batchDirectory}/batch-manifest.json`
const dualSummaryPath = `${batchDirectory}/dual-summary.json`
const roundAResultStem = 'mathematik-rollout-v1-batch-029-j8-interest-spreadsheet-parameters-3-v1-20260902-first-pass-a.batch-001'
const roundBResultStem = 'mathematik-rollout-v1-batch-029-j8-interest-spreadsheet-parameters-3-v1-20260902-first-pass-b.batch-001'
const roundARecordsPath = `${batchDirectory}/round-a/results/${roundAResultStem}.records.jsonl`
const roundARunPath = `${batchDirectory}/round-a/results/${roundAResultStem}.run.json`
const roundBRecordsPath = `${batchDirectory}/round-b/results/${roundBResultStem}.records.jsonl`
const roundBRunPath = `${batchDirectory}/round-b/results/${roundBResultStem}.run.json`
const baseGoalBookConfigPath = 'app/scripts/config/goal-books/de-gym-math-national-atlas.json'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const semanticKindLedgerPath = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const stableGoalId = '1842da92-ca2c-5fed-a946-e6413a6285bb'
const excludedFreshGoalIds = [
  'f6574cdc-e29c-5a8f-a009-9f28b3bcf9be',
  'fc34449a-fbf4-574c-884f-ecdf48b42d2e',
] as const
const curriculumAtomicDenominator = 793
const outputStem = 'stable-current-carryover-1-v1'
const synthesisRelativePath = `synthesis-decisions.${outputStem}.json`
const synthesisPath = `${batchDirectory}/${synthesisRelativePath}`
const resolutionDirectory = `resolutions-${outputStem}`
const resolutionRelativePath = `${resolutionDirectory}/${stableGoalId}.resolution.json`
const resolutionPath = `${batchDirectory}/${resolutionRelativePath}`
const indexRelativePath = `resolution-index.${outputStem}.json`
const indexPath = `${batchDirectory}/${indexRelativePath}`
const receiptRelativePath = `${outputStem}.compatibility-receipt.json`
const receiptPath = `${batchDirectory}/${receiptRelativePath}`
const manifestId = 'mathematik-b029-stable1-synthesis-openai-codex-20260902'

const sourceHashes = {
  config: '633ddb19ed76ae25e9849ddb45104b3bc7435b9305ff0fdd5104684b3965db56',
  batchManifest: '22289ef79d74a675182e41300e9f8164719ff7ddf7cbd5ec75288ec6f19e2362',
  dualSummary: '120536046309a8e7da28bbd8a48b7ac254aab3e957c84330de87d65be42a3b7f',
  roundARecords: '5b511f8f3b9c343936b7b7d942eb37caf2ad5e55e590da4fb0fa472400213bd2',
  roundARun: 'fc76e23c8792b6e5ff78377b69fb690435888bd8f475fa0dcf6d4af68c3e3605',
  roundBRecords: 'ea9a93284ff92d9338b14360d2c709c71665356713dfd00081b4d9f9af3efd73',
  roundBRun: 'c5d0c4b49a9b9d4db551db0f780efeddf23658c9e7e6e270475916f78fd6d80a',
} as const

const currentPins = {
  canonical: '0f824d61e27a059869274db08db6bf3ef727fde777360926fe2e4e34fdfc2be3',
  semanticKindLedger: '96a5e3aa38c88de40f75800adcd1606bc348630f48060c1183196264aad9cfe4',
} as const

const absolute = (path: string): string => resolve(repoRoot, path)
const sha256Hex = (bytes: string | Uint8Array): string => createHash('sha256').update(bytes).digest('hex')
const digest = (bytes: string | Uint8Array): GoalDescriptionSynthesisDigest => `sha256:${sha256Hex(bytes)}`
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const sameSet = (left: readonly string[], right: readonly string[]): boolean => (
  left.length === right.length && left.every((value) => right.includes(value))
)
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
  const mode = process.argv[2]
  if ((mode !== '--write' && mode !== '--check') || process.argv.length !== 3) {
    throw new Error('Usage: tsx scripts/materializeMathB029StableOneCarryoverResolution.ts (--write|--check)')
  }
  const writeMode = mode === '--write'
  const configBytes = readBound(sourceConfigPath, sourceHashes.config)
  const batchManifestBytes = readBound(batchManifestPath, sourceHashes.batchManifest)
  const dualSummaryBytes = readBound(dualSummaryPath, sourceHashes.dualSummary)
  const roundARecordsBytes = readBound(roundARecordsPath, sourceHashes.roundARecords)
  const roundARunBytes = readBound(roundARunPath, sourceHashes.roundARun)
  const roundBRecordsBytes = readBound(roundBRecordsPath, sourceHashes.roundBRecords)
  const roundBRunBytes = readBound(roundBRunPath, sourceHashes.roundBRun)
  const canonicalBytes = readBound(canonicalPath, currentPins.canonical)
  const semanticKindLedgerBytes = readBound(semanticKindLedgerPath, currentPins.semanticKindLedger)
  const landscape = JSON.parse(canonicalBytes.toString('utf8')) as { subject?: string; goals: JsonGoal[] }
  const semanticKindLedger = JSON.parse(semanticKindLedgerBytes.toString('utf8')) as {
    counts?: { curricularAtomic?: number }
    decisions?: Array<{ goalId?: string; semanticKind?: string; decisionStatus?: string }>
  }
  const sourceConfig = JSON.parse(configBytes.toString('utf8')) as {
    baseGoalBookConfigPath: string
    bookId: string
    title: string
    goalIds: string[]
  }
  if (sourceConfig.baseGoalBookConfigPath !== baseGoalBookConfigPath) {
    throw new Error('Mathematics B029 source GoalBook configuration drifted')
  }
  if (semanticKindLedger.counts?.curricularAtomic !== curriculumAtomicDenominator) {
    throw new Error('Mathematics curricularAtomic denominator drifted')
  }
  if (!sameSet([stableGoalId, ...excludedFreshGoalIds], sourceConfig.goalIds)) {
    throw new Error('Stable and fresh scopes must be disjoint and exactly cover Mathematics B029')
  }
  const kind = semanticKindLedger.decisions?.find((decision) => decision.goalId === stableGoalId)
  if (kind?.semanticKind !== 'curricularAtomic' || kind.decisionStatus !== 'authoritative') {
    throw new Error(`${stableGoalId}: missing authoritative curricularAtomic classification`)
  }

  const dual = await materializeGoalDescriptionRolloutBatchDualSummary(absolute(sourceConfigPath), false)
  if (!dual.bytes.equals(dualSummaryBytes)) throw new Error('Mathematics B029 dual summary is not exact-bound')
  if (!sameSet(dual.summary.goals.map(({ goalId }) => goalId), sourceConfig.goalIds)) {
    throw new Error('Mathematics B029 source campaign goal scope drifted')
  }

  const currentBase = await loadGoalBookBuildInputs(baseGoalBookConfigPath)
  const currentSubset = buildGoalDescriptionRolloutSubsetModel({
    baseModel: currentBase.model,
    goalIds: sourceConfig.goalIds,
    bookId: sourceConfig.bookId,
    title: sourceConfig.title,
  })
  const firstResult = extractGoalDescriptionDualRoundResolutionSource({
    artifacts: dual.first,
    goalId: stableGoalId,
    label: 'First',
  })
  const secondResult = extractGoalDescriptionDualRoundResolutionSource({
    artifacts: dual.second,
    goalId: stableGoalId,
    label: 'Second',
  })
  if (firstResult.errors.length > 0 || secondResult.errors.length > 0 || !firstResult.source || !secondResult.source) {
    throw new Error(`${stableGoalId}: source extraction failed: ${[...firstResult.errors, ...secondResult.errors].join(' | ')}`)
  }
  if (firstResult.source.decision !== 'keep' || secondResult.source.decision !== 'keep') {
    throw new Error(`${stableGoalId}: stable carryover requires two independent KEEP records`)
  }
  const firstInput = dual.first.input.goals.find(({ goalId }) => goalId === stableGoalId)
  const secondInput = dual.second.input.goals.find(({ goalId }) => goalId === stableGoalId)
  const canonicalGoal = landscape.goals.find(({ id }) => id === stableGoalId)
  const sourcePage = dual.prepared.model.pages.find(({ goalId }) => goalId === stableGoalId)
  const currentPage = currentSubset.pages.find(({ goalId }) => goalId === stableGoalId)
  if (!firstInput || !secondInput || !canonicalGoal || !sourcePage || !currentPage) {
    throw new Error(`${stableGoalId}: missing source input, canonical goal, or Atlas page`)
  }
  if (stableGoalBookJson(firstInput) !== stableGoalBookJson(secondInput)) {
    throw new Error(`${stableGoalId}: blind inputs differ`)
  }
  if (stableGoalBookJson(sourcePage) !== stableGoalBookJson(currentPage)) {
    throw new Error(`${stableGoalId}: current Atlas page context is not exact-stable`)
  }
  if (dual.prepared.model.digest === currentSubset.digest) {
    throw new Error('Current B029 subset must reflect an excluded goal wording revision')
  }
  const canonicalContext = buildGoalDescriptionCanonicalContext(canonicalGoal)
  if (stableGoalBookJson(firstInput.canonicalContext) !== stableGoalBookJson(canonicalContext)) {
    throw new Error(`${stableGoalId}: direct current canonical context changed`)
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
  if (stableGoalBookJson(finalText) !== stableGoalBookJson(currentText)) {
    throw new Error(`${stableGoalId}: bilingual text is not exact-current`)
  }

  const expectedGoal: GoalDescriptionRolloutSynthesisExpectedGoal = {
    goalId: stableGoalId,
    effectiveSemanticKind: 'curricularAtomic',
    goalFingerprint: firstInput.goalFingerprint as GoalDescriptionSynthesisDigest,
    pageFingerprint: firstInput.pageFingerprint as GoalDescriptionSynthesisDigest,
    goalReviewContextFingerprint: fingerprintGoalDescriptionReviewContext(firstInput),
    finalText,
    firstSource: firstResult.source,
    secondSource: secondResult.source,
  }
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
      first: buildGoalDescriptionRolloutSynthesisRoundBinding(
        firstResult.source.binding,
        dual.prepared.manifest.artifacts.rounds.first.batchInputFingerprint,
      ),
      second: buildGoalDescriptionRolloutSynthesisRoundBinding(
        secondResult.source.binding,
        dual.prepared.manifest.artifacts.rounds.second.batchInputFingerprint,
      ),
    },
    synthesizedAt,
    goals: [expectedGoal],
  }
  const manifestPayload: Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'> = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
    schemaVersion: 1,
    synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
    manifestId,
    authority: 'ai_synthesis',
    synthesizedBy: 'OpenAI Codex Mathematics B029 consensus-stable one carryover synthesis candidate',
    synthesizedAt,
    batch: expectedBindings.batch,
    rounds: expectedBindings.rounds,
    decisions: [{
      decisionId: `${manifestId}-decision-001`,
      goalId: stableGoalId,
      effectiveSemanticKind: 'curricularAtomic',
      goalFingerprint: expectedGoal.goalFingerprint,
      pageFingerprint: expectedGoal.pageFingerprint,
      goalReviewContextFingerprint: expectedGoal.goalReviewContextFingerprint,
      finalText,
      resolutionDecision: 'keep_current',
      evidenceRound: 'second',
      records: {
        first: {
          recordId: firstResult.source.binding.recordId,
          recordDigest: firstResult.source.binding.recordDigest,
        },
        second: {
          recordId: secondResult.source.binding.recordId,
          recordDigest: secondResult.source.binding.recordDigest,
        },
      },
      rationaleDe: 'Beide unabhängigen Blindprüfungen bestätigen die unveränderte Kompetenz zur tabellarischen Näherung eines Zinssatzes. Runde B wird ausgewählt, weil sie Tabellenaufbau, systematisches Eingrenzen, Kontrollrechnung, Zinsperiode und Kontextplausibilität besonders geschlossen operationalisiert; Runde A bleibt vollständig gebunden.',
      rationaleEn: 'Both independent blind reviews confirm the unchanged competency for estimating an interest rate with a spreadsheet. Round B is selected because it particularly coherently operationalizes spreadsheet construction, systematic bracketing, recalculation, the interest period, and contextual plausibility; Round A remains fully bound.',
    }],
  }
  const synthesisManifest: GoalDescriptionRolloutSynthesisDecisionManifest = {
    ...manifestPayload,
    manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(manifestPayload),
  }
  const manifestValidation = await validateGoalDescriptionRolloutSynthesisDecisionManifest({
    manifest: synthesisManifest,
    expected: expectedBindings,
  })
  if (manifestValidation.errors.length > 0) {
    throw new Error(`Mathematics B029 synthesis invalid: ${manifestValidation.errors.join(' | ')}`)
  }
  const synthesisBytes = jsonBytes(synthesisManifest)

  const summaryGoal = dual.summary.goals.find(({ goalId }) => goalId === stableGoalId)
  const decision = synthesisManifest.decisions[0]
  if (!summaryGoal || !decision) throw new Error(`${stableGoalId}: incomplete resolution alignment`)
  const synthesis = buildGoalDescriptionRolloutResolutionSynthesis({
    batchId: synthesisManifest.batch.batchId,
    manifest: synthesisManifest,
    decision,
    summaryGoal,
    firstSource: firstResult.source,
    secondSource: secondResult.source,
  })
  const resolution = buildGoalDescriptionDualRoundResolution({
    resolutionId: `mathematik-b029-stable1-current-carryover-v1-resolution-${stableGoalId}`,
    goalId: stableGoalId,
    effectiveSemanticKind: 'curricularAtomic',
    decision: 'keep_current',
    synthesis,
    dualSummaryBytes: dual.bytes,
    currentInput: dual.first.input,
    firstSource: firstResult.source,
    secondSource: secondResult.source,
    synthesisDecisionManifest: {
      contract: synthesisManifest.synthesisContract,
      manifestPath: synthesisRelativePath,
      manifestId: synthesisManifest.manifestId,
      manifestDigest: digest(synthesisBytes),
      manifestFingerprint: synthesisManifest.manifestFingerprint,
      decisionId: decision.decisionId,
    },
  })
  const resolutionValidation = await validateGoalDescriptionDualRoundResolution({
    resolution,
    dualSummary: dual.summary,
    dualSummaryBytes: dual.bytes,
    currentInput: dual.first.input,
    landscape,
    first: dual.first,
    second: dual.second,
    synthesisDecisionManifestArtifact: {
      manifest: synthesisManifest,
      manifestBytes: synthesisBytes,
      manifestPath: synthesisRelativePath,
    },
  })
  if (resolutionValidation.errors.length > 0 || !resolutionValidation.strictDescriptionComplete) {
    throw new Error(`${stableGoalId}: resolution invalid: ${resolutionValidation.errors.join(' | ')}`)
  }
  const resolutionBytes = jsonBytes(resolution)
  const index = {
    schemaVersion: 1,
    artifactSetId: `${dual.prepared.manifest.batchId}-stable-current-carryover-1`,
    subject: dual.prepared.manifest.subjectLabel,
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: 1,
    curriculumAtomicDenominator,
    descriptionReviewPercentage: Number(((1 / curriculumAtomicDenominator) * 100).toFixed(1)),
    groups: [{
      groupId: dual.prepared.manifest.batchId,
      artifactDirectory: '.',
      dualSummaryPath: 'dual-summary.json',
      dualSummaryDigest: digest(dual.bytes),
      campaignGoalCount: dual.summary.goalCount,
      resolvedGoalCount: 1,
    }],
    resolutions: [{
      goalId: stableGoalId,
      titleDe: resolution.goal.finalText.titleDe,
      groupId: dual.prepared.manifest.batchId,
      decision: resolution.decision,
      resolutionPath: resolutionRelativePath,
      resolutionDigest: digest(resolutionBytes),
      resolutionFingerprint: resolution.resolutionFingerprint,
      strictDescriptionComplete: true,
    }],
  }
  const indexBytes = jsonBytes(index)
  const outputsWithoutReceipt = [
    { path: synthesisPath, bytes: synthesisBytes },
    { path: resolutionPath, bytes: resolutionBytes },
    { path: indexPath, bytes: indexBytes },
  ]
  const receiptBody = {
    schemaVersion: 1,
    receiptId: 'mathematik-b029-stable-current-carryover-1-v1-20260902',
    purpose: 'Hash-bound carryover of exactly the one unchanged B029 goal confirmed KEEP by both blind rounds; the other two source-batch goals remain explicitly excluded from this claim.',
    source: {
      configPath: sourceConfigPath,
      configSha256: digest(configBytes),
      batchManifestPath,
      batchManifestSha256: digest(batchManifestBytes),
      dualSummaryPath,
      dualSummarySha256: digest(dualSummaryBytes),
      semanticKindLedgerPath,
      semanticKindLedgerSha256: digest(semanticKindLedgerBytes),
      curriculumAtomicDenominator,
      roundA: {
        recordsPath: roundARecordsPath,
        recordsSha256: digest(roundARecordsBytes),
        runPath: roundARunPath,
        runSha256: digest(roundARunBytes),
      },
      roundB: {
        recordsPath: roundBRecordsPath,
        recordsSha256: digest(roundBRecordsBytes),
        runPath: roundBRunPath,
        runSha256: digest(roundBRunBytes),
      },
    },
    currentCanonicalLandscape: { path: canonicalPath, sha256: digest(canonicalBytes) },
    compatibilityRebase: {
      status: 'accepted_exact_stable_page_rebase',
      reason: 'The current Atlas contains an accepted wording revision for an excluded goal, while the claimed stable goal page, bilingual text, and direct canonical context remain exact to the reviewed source.',
      sourceBaseBookDigest: dual.prepared.manifest.source.baseBookDigest,
      sourceSubsetBookDigest: dual.prepared.model.digest,
      currentBaseBookDigest: currentBase.model.digest,
      currentSubsetBookDigest: currentSubset.digest,
      stableGoalPages: [{
        goalId: stableGoalId,
        sourcePageFingerprint: sourcePage.pageFingerprint,
        currentPageFingerprint: currentPage.pageFingerprint,
        exactPageContext: sourcePage.pageFingerprint === currentPage.pageFingerprint,
      }],
    },
    currentCanonicalContexts: [{
      goalId: stableGoalId,
      canonicalContext,
      fingerprint: digest(stableGoalBookJson(canonicalContext)),
    }],
    claimedGoalIds: [stableGoalId],
    explicitlyExcludedFreshGoalIds: excludedFreshGoalIds,
    adjudication: {
      currentTextKeptGoalIds: [stableGoalId],
      freshReviewGoalIds: excludedFreshGoalIds,
    },
    synthesisManifestPath: synthesisRelativePath,
    synthesisManifestDigest: digest(synthesisBytes),
    synthesisManifestFingerprint: synthesisManifest.manifestFingerprint,
    resolutionIndexPath: indexRelativePath,
    resolutionIndexDigest: digest(indexBytes),
    safeguards: {
      sourceRunsRecordsAndDualSummaryByteBound: true,
      twoIndependentKeepDecisionsRequired: true,
      selectedEvidenceRoundMustBeKeep: true,
      currentBilingualTextsAndDirectContextsRequired: true,
      currentAtlasStablePagesRequiredByteExact: true,
      stableAndFreshScopesDisjointAndComplete: true,
      canonicalLandscapeAndSemanticKindLedgerByteBound: true,
      openAiReviewFreezeRequiredBeforeWrite: true,
    },
  } as const
  const materializationPlanSha256 = digest(jsonBytes({
    sourceHashes,
    currentPins,
    stableGoalId,
    excludedFreshGoalIds,
    outputs: outputsWithoutReceipt.map(({ path, bytes }) => ({ path, sha256: digest(bytes) })),
    receiptPath,
    receiptBody,
  }))
  const receiptBytes = jsonBytes({ ...receiptBody, materializationPlanSha256 })
  const outputs = [...outputsWithoutReceipt, { path: receiptPath, bytes: receiptBytes }]

  if (writeMode) {
    execFileSync(process.execPath, ['scripts/check_openai_plugin_review_freeze.mjs'], {
      cwd: repoRoot,
      stdio: 'inherit',
    })
    for (const output of outputs) publish(output.path, output.bytes)
  } else {
    for (const output of outputs) assertOutput(output.path, output.bytes)
  }
  console.log(
    `mathematik B029 consensus carryover ${writeMode ? 'materialized' : 'valid'}: goals=1; synthesis=${digest(synthesisBytes)}; resolution=${digest(resolutionBytes)}; index=${digest(indexBytes)}; receipt=${digest(receiptBytes)}`,
  )
}

await main()
