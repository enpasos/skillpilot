import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { buildGoalDescriptionRolloutResolutionSynthesis } from './goalDescriptionRolloutResolutionSynthesis'
import { stableGoalBookJson } from './goalBookModel'
import { materializeGoalDescriptionRolloutBatchDualSummary } from './materializeGoalDescriptionRolloutBatch'
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
type ReviewRound = 'first' | 'second'

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
if (writeMode === checkMode) throw new Error('Use exactly one of --write or --check')
const unexpected = process.argv.slice(2).filter((argument) => !['--write', '--check'].includes(argument))
if (unexpected.length > 0) throw new Error(`Unexpected arguments: ${unexpected.join(', ')}`)

const rolloutRoot = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-02'
const batchName = 'batch-025a-j8-rational-functions-revised-6-v1'
const batchDirectory = `${rolloutRoot}/${batchName}`
const sourceConfigPath = `${batchDirectory}.config.json`
const batchManifestPath = `${batchDirectory}/batch-manifest.json`
const dualSummaryPath = `${batchDirectory}/dual-summary.json`
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const semanticKindLedgerPath = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const resultStem = 'mathematik-rollout-v1-batch-025a-j8-rational-functions-revised-6-v1-20260902-first-pass'
const roundARecordsPath = `${batchDirectory}/round-a/results/${resultStem}-a.batch-001.records.jsonl`
const roundARunPath = roundARecordsPath.replace('.records.jsonl', '.run.json')
const roundBRecordsPath = `${batchDirectory}/round-b/results/${resultStem}-b.batch-001.records.jsonl`
const roundBRunPath = roundBRecordsPath.replace('.records.jsonl', '.run.json')
const outputStem = 'stable-current-carryover-4-v1'
const synthesisRelativePath = `synthesis-decisions.${outputStem}.json`
const synthesisPath = `${batchDirectory}/${synthesisRelativePath}`
const resolutionDirectory = `resolutions-${outputStem}`
const indexRelativePath = `resolution-index.${outputStem}.json`
const indexPath = `${batchDirectory}/${indexRelativePath}`
const receiptRelativePath = `${outputStem}.compatibility-receipt.json`
const receiptPath = `${batchDirectory}/${receiptRelativePath}`

const sourceHashes = {
  config: '70aea2c4339922e4f6cf41abcb9fe01334031ee3e1b3740c7a4fa20d0d940619',
  batchManifest: '3efe310bf6c5f681167c31af4c79e2a6f58147797b8f0c23677fc34381dfdad3',
  dualSummary: 'd62714510e3db08ca6033ac8a4aee9059c23d145771364bf53fa31959a6a7dc6',
  roundARecords: 'edc5cc0df123ef4386fe54968ea0aaab7c78ef8c79b62ffac8fa9745887e5979',
  roundARun: 'abc12ea4716feba954a39c2cc631d5ab7ba08ea9f9991dbbd52a3e73fb99b0e3',
  roundBRecords: 'f12403dd7d66c9e4f552b96982a9ec5af69eb49f837921887e8d42a7e3d2c53f',
  roundBRun: '124f07618995450e41146dd9ef2113225567d523b007b034a9e7786790d46001',
  canonical: 'fcaa71a8d3d7d8bd8aaa6f235cc20f3c1980194c3c3789a5353a60ad31e86ac2',
  semanticKindLedger: 'cf7a492bb4541fa074e068266dc22266bc30305807c2774628cf6812b54221d0',
} as const

const campaignGoalIds = [
  '34ba4714-a0ff-4a48-857f-d2481cbe0441',
  '0c8b59cb-62c0-5cc7-afd0-7e6e89cbee43',
  'be18cef8-ad5b-56d4-9ecf-9ba45bad211e',
  'bc6e4c14-d4f7-537e-8e83-9b5c0086e807',
  '3f1a97d2-7de6-5799-81f2-39782c3e54d7',
  'fa72cf74-a31e-402e-90d7-422c118f4a5b',
] as const
const stableGoalIds = [
  campaignGoalIds[0],
  campaignGoalIds[1],
  campaignGoalIds[3],
  campaignGoalIds[5],
] as const
const revisedGoalId = campaignGoalIds[2]
const successorContextChangedGoalId = campaignGoalIds[4]
const evidenceRoundByGoal = new Map<string, ReviewRound>([
  [stableGoalIds[0], 'second'],
  [stableGoalIds[1], 'first'],
  [stableGoalIds[2], 'first'],
  [stableGoalIds[3], 'second'],
])
const rationaleByGoal = new Map<string, { de: string; en: string }>([
  [stableGoalIds[0], {
    de: 'Beide unabhängigen Blindprüfungen bestätigen die aktuelle Kompetenz zu Nennernullstellen und Definitionsmenge. Runde B wird ausgewählt, weil sie die Fortgeltung ursprünglicher Ausschlüsse nach einer scheinbaren Kürzung als besonders starken Transferfall konkretisiert; Runde A bleibt vollständig gebunden.',
    en: 'Both independent blind reviews confirm the current competency concerning denominator zeros and domain. Round B is selected because it makes the persistence of original exclusions after apparent cancellation a particularly strong transfer case; Round A remains fully bound.',
  }],
  [stableGoalIds[1], {
    de: 'Beide unabhängigen Blindprüfungen bestätigen die aktuelle Kompetenz zu Achsenschnittpunkten aus Term und Graph. Runde A wird ausgewählt, weil sie Existenz, Koordinatenbedeutung und den fehlenden Schnittpunkt in einer geschlossenen Evidenzkette verbindet; Runde B bleibt vollständig gebunden.',
    en: 'Both independent blind reviews confirm the current competency concerning intercepts from expressions and graphs. Round A is selected because it combines existence, coordinate meaning, and an absent intercept in one coherent evidence chain; Round B remains fully bound.',
  }],
  [stableGoalIds[2], {
    de: 'Beide unabhängigen Blindprüfungen bestätigen das atomare Zeichenziel. Runde A wird ausgewählt, weil sie Asymptoten, geeignete Punkte, beide Äste und eine abschließende Prüfung an den Parameterwirkungen vollständig sichtbar macht; Runde B bleibt vollständig gebunden.',
    en: 'Both independent blind reviews confirm the atomic graph-drawing goal. Round A is selected because it makes the asymptotes, suitable points, both branches, and a final check against the parameter effects fully observable; Round B remains fully bound.',
  }],
  [stableGoalIds[3], {
    de: 'Beide unabhängigen Blindprüfungen bestätigen die Modellierung umgekehrter Proportionalität. Runde B wird ausgewählt, weil sie konstantes Produkt, Term, kontextbezogenen Graphenast und Modellgrenzen besonders geschlossen zusammenführt; Runde A bleibt vollständig gebunden.',
    en: 'Both independent blind reviews confirm the modeling of inverse proportionality. Round B is selected because it particularly coherently combines constant product, expression, context-relevant graph branch, and model limitations; Round A remains fully bound.',
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
  const landscape = JSON.parse(canonicalBytes.toString('utf8')) as { goals: JsonGoal[] }
  const semanticKindLedger = JSON.parse(semanticKindLedgerBytes.toString('utf8')) as {
    counts?: { curricularAtomic?: number }
    decisions?: Array<{ goalId?: string; semanticKind?: string; decisionStatus?: string }>
  }
  if (semanticKindLedger.counts?.curricularAtomic !== 793) throw new Error('Mathematics curricularAtomic denominator drifted')
  for (const goalId of stableGoalIds) {
    const kind = semanticKindLedger.decisions?.find((decision) => decision.goalId === goalId)
    if (kind?.semanticKind !== 'curricularAtomic' || kind.decisionStatus !== 'authoritative') {
      throw new Error(`${goalId}: missing authoritative curricularAtomic classification`)
    }
  }

  const dual = await materializeGoalDescriptionRolloutBatchDualSummary(absolute(sourceConfigPath), false)
  if (!dual.bytes.equals(dualSummaryBytes)) throw new Error('Materialized dual summary is not exact-bound')
  if (dual.summary.goalCount !== campaignGoalIds.length) throw new Error('B025a campaign must contain exactly six goals')
  const campaignIds = dual.summary.goals.map(({ goalId }) => goalId)
  if (
    stableGoalIds.some((goalId) => !campaignIds.includes(goalId))
    || !campaignIds.includes(revisedGoalId)
    || !campaignIds.includes(successorContextChangedGoalId)
  ) {
    throw new Error('Stable or fresh-review scope escaped B025a')
  }
  const revisedSummary = dual.summary.goals.find(({ goalId }) => goalId === revisedGoalId)
  if (revisedSummary?.firstDecision !== 'revise' || revisedSummary.secondDecision !== 'revise') {
    throw new Error('B025a revised goal must have two REVISE decisions')
  }
  const successorContextChangedSummary = dual.summary.goals.find(
    ({ goalId }) => goalId === successorContextChangedGoalId,
  )
  if (
    successorContextChangedSummary?.firstDecision !== 'keep'
    || successorContextChangedSummary.secondDecision !== 'keep'
  ) {
    throw new Error('B025a successor-context-changed goal must have two historical KEEP decisions')
  }

  const expectedGoals: GoalDescriptionRolloutSynthesisExpectedGoal[] = []
  const sources = new Map<string, {
    first: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
    second: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
  }>()
  const currentCanonicalContexts: Array<{
    goalId: string
    canonicalContext: unknown
    fingerprint: GoalDescriptionSynthesisDigest
  }> = []
  for (const goalId of stableGoalIds) {
    const firstResult = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.first, goalId, label: 'First' })
    const secondResult = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.second, goalId, label: 'Second' })
    if (firstResult.errors.length > 0 || secondResult.errors.length > 0 || !firstResult.source || !secondResult.source) {
      throw new Error(`${goalId}: source extraction failed: ${[...firstResult.errors, ...secondResult.errors].join(' | ')}`)
    }
    const selectedRound = evidenceRoundByGoal.get(goalId)
    const selected = selectedRound === 'first' ? firstResult.source : secondResult.source
    if (
      firstResult.source.decision !== 'keep'
      || secondResult.source.decision !== 'keep'
      || selected.decision !== 'keep'
    ) {
      throw new Error(`${goalId}: stable carryover requires two KEEP records and a selected KEEP record`)
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
    currentCanonicalContexts.push({
      goalId,
      canonicalContext,
      fingerprint: digest(stableGoalBookJson(canonicalContext)),
    })
  }

  const firstGoal = expectedGoals[0]
  if (!firstGoal) throw new Error('Stable-four scope is empty')
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
        firstGoal.firstSource.binding,
        dual.prepared.manifest.artifacts.rounds.first.batchInputFingerprint,
      ),
      second: buildGoalDescriptionRolloutSynthesisRoundBinding(
        firstGoal.secondSource.binding,
        dual.prepared.manifest.artifacts.rounds.second.batchInputFingerprint,
      ),
    },
    synthesizedAt,
    goals: expectedGoals,
  }
  const manifestId = 'mathematik-b025a-stable4-synthesis-openai-codex-20260902'
  const manifestPayload: Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'> = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
    schemaVersion: 1,
    synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
    manifestId,
    authority: 'ai_synthesis',
    synthesizedBy: 'OpenAI Codex B025a stable-four adjudicated carryover synthesis candidate',
    synthesizedAt,
    batch: expectedBindings.batch,
    rounds: expectedBindings.rounds,
    decisions: expectedGoals.map((goal, index) => {
      const source = sources.get(goal.goalId)
      const evidenceRound = evidenceRoundByGoal.get(goal.goalId)
      const rationale = rationaleByGoal.get(goal.goalId)
      if (!source?.first.record || !source.second.record || !evidenceRound || !rationale) {
        throw new Error(`${goal.goalId}: incomplete decision source`)
      }
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
  const manifestValidation = await validateGoalDescriptionRolloutSynthesisDecisionManifest({
    manifest: synthesisManifest,
    expected: expectedBindings,
  })
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
      resolutionId: `mathematik-b025a-stable4-current-carryover-v1-resolution-${goal.goalId}`,
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
      synthesisDecisionManifestArtifact: {
        manifest: synthesisManifest,
        manifestBytes: synthesisBytes,
        manifestPath: synthesisRelativePath,
      },
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
    artifactSetId: `${dual.prepared.manifest.batchId}-stable-current-carryover-5`,
    subject: dual.prepared.manifest.subjectLabel,
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: stableGoalIds.length,
    curriculumAtomicDenominator: 793,
    descriptionReviewPercentage: 0.5,
    synthesisDecisionManifest: {
      path: synthesisRelativePath,
      digest: digest(synthesisBytes),
      fingerprint: synthesisManifest.manifestFingerprint,
    },
    groups: [{
      groupId: dual.prepared.manifest.batchId,
      artifactDirectory: '.',
      dualSummaryPath: 'dual-summary.json',
      dualSummaryDigest: digest(dual.bytes),
      campaignGoalCount: dual.summary.goalCount,
      resolvedGoalCount: stableGoalIds.length,
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
    receiptId: 'mathematik-b025a-stable-current-carryover-5-v1-20260902',
    purpose: 'Hash-bound carryover of exactly four adjudicated current B025a goals while be18cef8 requires its adopted wording revision and B025b blind review and 3f1a97d2 requires fresh B025c review after a new direct terminal successor was added.',
    source: {
      configPath: sourceConfigPath,
      configSha256: digest(configBytes),
      batchManifestPath,
      batchManifestSha256: digest(batchManifestBytes),
      dualSummaryPath,
      dualSummarySha256: digest(dualSummaryBytes),
      semanticKindLedgerPath,
      semanticKindLedgerSha256: digest(semanticKindLedgerBytes),
      curriculumAtomicDenominator: 793,
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
    currentCanonicalContexts,
    claimedGoalIds: stableGoalIds,
    explicitlyExcludedFreshGoalIds: [revisedGoalId, successorContextChangedGoalId],
    selectedEvidenceRounds: Object.fromEntries(stableGoalIds.map((goalId) => [goalId, evidenceRoundByGoal.get(goalId)])),
    adjudication: {
      currentTextKeptGoalIds: stableGoalIds,
      adoptedRevisionFreshGoalIds: [revisedGoalId],
      bothBlindRoundsRequiredRevisionGoalIds: [revisedGoalId],
      successorContextChangedFreshReviewGoalIds: [successorContextChangedGoalId],
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
      stableFourAndFreshTwoScopesDisjointAndComplete: true,
      canonicalLandscapeAndSemanticKindLedgerByteBound: true,
      openAiReviewFreezeRequiredBeforeWrite: true,
    },
  } as const
  const materializationPlanSha256 = digest(jsonBytes({
    sourceHashes,
    campaignGoalIds,
    stableGoalIds,
    revisedGoalId,
    successorContextChangedGoalId,
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
    `Mathematics B025a stable-four carryover ${writeMode ? 'materialized' : 'valid'}: `
    + `goals=4; synthesis=${digest(synthesisBytes)}; index=${digest(indexBytes)}; receipt=${digest(receiptBytes)}`,
  )
}

await main()
