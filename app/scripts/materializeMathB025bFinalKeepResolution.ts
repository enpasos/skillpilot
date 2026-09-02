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

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
if (writeMode === checkMode) throw new Error('Use exactly one of --write or --check')
const unexpected = process.argv.slice(2).filter((argument) => !['--write', '--check'].includes(argument))
if (unexpected.length > 0) throw new Error(`Unexpected arguments: ${unexpected.join(', ')}`)

const rolloutRoot = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-02'
const batchName = 'batch-025b-j8-rational-parameter-effects-revised-1-v1'
const batchDirectory = `${rolloutRoot}/${batchName}`
const sourceConfigPath = `${batchDirectory}.config.json`
const batchManifestPath = `${batchDirectory}/batch-manifest.json`
const dualSummaryPath = `${batchDirectory}/dual-summary.json`
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const semanticKindLedgerPath = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const roundARecordsPath = `${batchDirectory}/round-a/results/mathematik-rollout-v1-batch-025b-j8-rational-parameter-effects-revised-1-v1-20260902-first-pass-a.batch-001.records.jsonl`
const roundARunPath = roundARecordsPath.replace('.records.jsonl', '.run.json')
const roundBRecordsPath = `${batchDirectory}/round-b/results/mathematik-rollout-v1-batch-025b-j8-rational-parameter-effects-revised-1-v1-20260902-first-pass-b.batch-001.records.jsonl`
const roundBRunPath = roundBRecordsPath.replace('.records.jsonl', '.run.json')
const outputStem = 'final-current-keep-1-v1'
const synthesisRelativePath = `synthesis-decisions.${outputStem}.json`
const synthesisPath = `${batchDirectory}/${synthesisRelativePath}`
const resolutionDirectory = `resolutions-${outputStem}`
const indexRelativePath = `resolution-index.${outputStem}.json`
const indexPath = `${batchDirectory}/${indexRelativePath}`
const receiptRelativePath = `${outputStem}.compatibility-receipt.json`
const receiptPath = `${batchDirectory}/${receiptRelativePath}`

const sourceHashes = {
  config: '61410bd7f7e70734d1dfa2f2611800936bc6966e66008263710a10bbbc7af1f5',
  batchManifest: '8a6670d6825a4c203766901c35b50a03cbb70e33ceb0be57a026b6d3f36ce016',
  dualSummary: 'c0784624124dad2713b21d78043ba83f8a2967f93dd526b8b2552abdfe4f19d6',
  roundARecords: 'e7b2acded3431ce9cf66c6e82b414d117b7fd0443f9a61799207f2c4bfd8e576',
  roundARun: 'a3791cd34823b3432a31ae9063b071c0c921e061fbfe3e9331d2cd7118d3812b',
  roundBRecords: '3680d112079b2e62cfd09264516f5b3a2667262ddc8160c15d88a517aa258cce',
  roundBRun: 'fda762f3536dd45797ee1fbc0b03fc17d07663a6d8315bc5b0515e14340161f2',
  canonical: 'fcaa71a8d3d7d8bd8aaa6f235cc20f3c1980194c3c3789a5353a60ad31e86ac2',
  semanticKindLedger: 'cf7a492bb4541fa074e068266dc22266bc30305807c2774628cf6812b54221d0',
} as const

const goalId = 'be18cef8-ad5b-56d4-9ecf-9ba45bad211e'
const preparedCurricularAtomicDenominator = 793
const selectedEvidenceRound = 'first' as const
const rationale = {
  de: 'Beide unabhängigen Blindprüfungen bestätigen die kanonisch revidierte Beschreibung unverändert mit KEEP und verlangen ein positives Understanding-Evidence-Profil. Für die Evidenz wird Runde A gewählt: Sie begründet die Parameterwirkungen über die relativen Koordinaten u = x - d und v = f(x) - e mit der Invariante u·v = a, koordiniert Term, Wertpaare und Graph und fordert im Transfer gleichzeitig veränderte Verschiebung, Vorzeichen und Betrag. Runde B bleibt vollständig als unabhängige Bestätigung gebunden.',
  en: 'Both independent blind reviews confirm the canonically revised description unchanged with KEEP and require a positive understanding-evidence profile. Round A is selected for the evidence: it explains the parameter effects through the relative coordinates u = x - d and v = f(x) - e with the invariant u·v = a, coordinates expression, value pairs, and graph, and requires a transfer with simultaneous changes to translation, sign, and magnitude. Round B remains fully bound as an independent confirmation.',
}

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
  if (semanticKindLedger.counts?.curricularAtomic !== preparedCurricularAtomicDenominator) {
    throw new Error('Mathematics curricularAtomic denominator drifted')
  }
  const kind = semanticKindLedger.decisions?.find((decision) => decision.goalId === goalId)
  if (kind?.semanticKind !== 'curricularAtomic' || kind.decisionStatus !== 'authoritative') {
    throw new Error(`${goalId}: missing authoritative curricularAtomic classification`)
  }

  const dual = await materializeGoalDescriptionRolloutBatchDualSummary(absolute(sourceConfigPath), false)
  if (!dual.bytes.equals(dualSummaryBytes)) throw new Error('Materialized dual summary is not exact-bound')
  if (dual.summary.goalCount !== 1 || dual.summary.goals[0]?.goalId !== goalId) {
    throw new Error('B025b campaign must contain exactly the bound be18cef8 goal')
  }

  const firstResult = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.first, goalId, label: 'First' })
  const secondResult = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.second, goalId, label: 'Second' })
  if (firstResult.errors.length > 0 || secondResult.errors.length > 0 || !firstResult.source || !secondResult.source) {
    throw new Error(`${goalId}: source extraction failed: ${[...firstResult.errors, ...secondResult.errors].join(' | ')}`)
  }
  if (firstResult.source.decision !== 'keep' || secondResult.source.decision !== 'keep') {
    throw new Error(`${goalId}: final KEEP requires two independent KEEP records`)
  }
  const firstInput = dual.first.input.goals.find((goal) => goal.goalId === goalId)
  const secondInput = dual.second.input.goals.find((goal) => goal.goalId === goalId)
  const canonicalGoal = landscape.goals.find((goal) => goal.id === goalId)
  if (!firstInput || !secondInput || !canonicalGoal) throw new Error(`${goalId}: missing input or canonical goal`)
  const canonicalContext = buildGoalDescriptionCanonicalContext(canonicalGoal)
  if (stableGoalBookJson(firstInput) !== stableGoalBookJson(secondInput)) throw new Error(`${goalId}: blind inputs differ`)
  if (stableGoalBookJson(firstInput.canonicalContext) !== stableGoalBookJson(canonicalContext)) {
    throw new Error(`${goalId}: direct canonical context changed; compatibility carryover is forbidden`)
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
    throw new Error(`${goalId}: canonical revised bilingual text is no longer exact-current`)
  }
  const expectedGoal: GoalDescriptionRolloutSynthesisExpectedGoal = {
    goalId,
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
      first: buildGoalDescriptionRolloutSynthesisRoundBinding(firstResult.source.binding, dual.prepared.manifest.artifacts.rounds.first.batchInputFingerprint),
      second: buildGoalDescriptionRolloutSynthesisRoundBinding(secondResult.source.binding, dual.prepared.manifest.artifacts.rounds.second.batchInputFingerprint),
    },
    synthesizedAt,
    goals: [expectedGoal],
  }
  const manifestId = 'mathematik-b025b-be18cef8-final-keep-synthesis-openai-codex-20260902'
  const manifestPayload: Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'> = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
    schemaVersion: 1,
    synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
    manifestId,
    authority: 'ai_synthesis',
    synthesizedBy: 'OpenAI Codex B025b be18cef8 deterministic final KEEP synthesis candidate',
    synthesizedAt,
    batch: expectedBindings.batch,
    rounds: expectedBindings.rounds,
    decisions: [{
      decisionId: `${manifestId}-decision-001`,
      goalId,
      effectiveSemanticKind: expectedGoal.effectiveSemanticKind,
      goalFingerprint: expectedGoal.goalFingerprint,
      pageFingerprint: expectedGoal.pageFingerprint,
      goalReviewContextFingerprint: expectedGoal.goalReviewContextFingerprint,
      finalText: expectedGoal.finalText,
      resolutionDecision: 'keep_current',
      evidenceRound: selectedEvidenceRound,
      records: {
        first: { recordId: firstResult.source.binding.recordId, recordDigest: firstResult.source.binding.recordDigest },
        second: { recordId: secondResult.source.binding.recordId, recordDigest: secondResult.source.binding.recordDigest },
      },
      rationaleDe: rationale.de,
      rationaleEn: rationale.en,
    }],
  }
  const synthesisManifest: GoalDescriptionRolloutSynthesisDecisionManifest = {
    ...manifestPayload,
    manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(manifestPayload),
  }
  const manifestValidation = await validateGoalDescriptionRolloutSynthesisDecisionManifest({ manifest: synthesisManifest, expected: expectedBindings })
  if (manifestValidation.errors.length > 0) throw new Error(`Synthesis invalid: ${manifestValidation.errors.join(' | ')}`)
  const synthesisBytes = jsonBytes(synthesisManifest)
  const decision = synthesisManifest.decisions[0]
  const summaryGoal = dual.summary.goals[0]
  if (!decision || !summaryGoal) throw new Error('Missing one-goal synthesis alignment')
  const synthesis = buildGoalDescriptionRolloutResolutionSynthesis({
    batchId: synthesisManifest.batch.batchId,
    manifest: synthesisManifest,
    decision,
    summaryGoal,
    firstSource: firstResult.source,
    secondSource: secondResult.source,
  })
  const resolution = buildGoalDescriptionDualRoundResolution({
    resolutionId: `math-b025b-be18cef8-final-current-keep-v1-resolution-${goalId}`,
    goalId,
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
    throw new Error(`${goalId}: resolution invalid: ${validation.errors.join(' | ')}`)
  }
  const resolutionBytes = jsonBytes(resolution)
  const resolutionRelativePath = `${resolutionDirectory}/${goalId}.resolution.json`
  const resolutionPath = `${batchDirectory}/${resolutionRelativePath}`
  const index = {
    schemaVersion: 1,
    artifactSetId: `${dual.prepared.manifest.batchId}-final-current-keep-1`,
    subject: dual.prepared.manifest.subjectLabel,
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: 1,
    curriculumAtomicDenominator: preparedCurricularAtomicDenominator,
    descriptionReviewPercentage: 0.1,
    groups: [{
      groupId: dual.prepared.manifest.batchId,
      artifactDirectory: '.',
      dualSummaryPath: 'dual-summary.json',
      dualSummaryDigest: digest(dual.bytes),
      campaignGoalCount: 1,
      resolvedGoalCount: 1,
    }],
    resolutions: [{
      goalId,
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
  const currentCanonicalContextFingerprint = digest(stableGoalBookJson(canonicalContext))
  const receiptBody = {
    schemaVersion: 1,
    receiptId: 'mathematik-b025b-be18cef8-final-current-keep-1-v1-20260902',
    purpose: 'Hash-bound deterministic final resolution for exactly be18cef8 after two independent KEEP/create reviews; preserves the canonically revised bilingual description unchanged and selects the stronger Round A evidence.',
    source: {
      configPath: sourceConfigPath,
      configSha256: digest(configBytes),
      batchManifestPath,
      batchManifestSha256: digest(batchManifestBytes),
      dualSummaryPath,
      dualSummarySha256: digest(dualSummaryBytes),
      semanticKindLedgerPath,
      semanticKindLedgerSha256: digest(semanticKindLedgerBytes),
      curriculumAtomicDenominatorAtPreparation: preparedCurricularAtomicDenominator,
      roundA: { recordsPath: roundARecordsPath, recordsSha256: digest(roundARecordsBytes), runPath: roundARunPath, runSha256: digest(roundARunBytes) },
      roundB: { recordsPath: roundBRecordsPath, recordsSha256: digest(roundBRecordsBytes), runPath: roundBRunPath, runSha256: digest(roundBRunBytes) },
    },
    currentCanonicalLandscape: { path: canonicalPath, sha256: digest(canonicalBytes) },
    currentCanonicalContexts: [{ goalId, canonicalContext, fingerprint: currentCanonicalContextFingerprint }],
    claimedGoalIds: [goalId],
    adjudication: {
      resolutionDecision: 'keep_current',
      selectedEvidenceRound: 'A',
      selectedRecordId: firstResult.source.binding.recordId,
      confirmingRecordId: secondResult.source.binding.recordId,
      selectionBasisDe: rationale.de,
      selectionBasisEn: rationale.en,
    },
    compatibilityCarryover: {
      allowedScope: 'global-atlas-digest-only',
      directCanonicalContextFingerprint: currentCanonicalContextFingerprint,
      sourceGoalReviewContextFingerprint: expectedGoal.goalReviewContextFingerprint,
      canonicalRevisedTextExactCurrent: true,
      directCanonicalContextExactReviewInput: true,
    },
    synthesisManifestPath: synthesisRelativePath,
    synthesisManifestDigest: digest(synthesisBytes),
    synthesisManifestFingerprint: synthesisManifest.manifestFingerprint,
    resolutionIndexPath: indexRelativePath,
    resolutionIndexDigest: digest(indexBytes),
    safeguards: {
      sourceRunsRecordsAndDualSummaryByteBound: true,
      bothIndependentDecisionsMustBeKeep: true,
      selectedEvidenceRoundMustBeKeep: true,
      canonicalRevisedBilingualTextMustBeExactCurrent: true,
      directCanonicalContextMustMatchReviewInput: true,
      canonicalLandscapeAndSemanticKindLedgerByteBound: true,
      exactlyOneClaimedGoal: true,
      noCentralIntegrationOrInFlightLedgerMutation: true,
      openAiReviewFreezeRequiredBeforeWrite: true,
    },
  } as const
  const materializationPlanSha256 = digest(jsonBytes({
    sourceHashes,
    goalId,
    selectedEvidenceRound,
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
  console.log(`Mathematics B025b be18cef8 final KEEP ${writeMode ? 'materialized' : 'valid'}: synthesis=${digest(synthesisBytes)}; resolution=${digest(resolutionBytes)}; index=${digest(indexBytes)}; receipt=${digest(receiptBytes)}`)
}

await main()
