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

const rolloutRoot = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-02'
const batchName = 'batch-028b-e-chaos-gravitation-worldviews-revised-6-v1'
const batchDirectory = `${rolloutRoot}/${batchName}`
const sourceConfigPath = `${batchDirectory}.config.json`
const batchManifestPath = `${batchDirectory}/batch-manifest.json`
const dualSummaryPath = `${batchDirectory}/dual-summary.json`
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const semanticKindLedgerPath = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const roundARecordsPath = `${batchDirectory}/round-a/results/physik-rollout-v1-batch-028b-e-chaos-gravitation-worldviews-revised-6-v1-20260902-first-pass-a.batch-001.records.jsonl`
const roundARunPath = roundARecordsPath.replace('.records.jsonl', '.run.json')
const roundBRecordsPath = `${batchDirectory}/round-b/results/physik-rollout-v1-batch-028b-e-chaos-gravitation-worldviews-revised-6-v1-20260902-first-pass-b.batch-001.records.jsonl`
const roundBRunPath = roundBRecordsPath.replace('.records.jsonl', '.run.json')
const outputStem = 'stable-current-carryover-3-v1'
const synthesisRelativePath = `synthesis-decisions.${outputStem}.json`
const synthesisPath = `${batchDirectory}/${synthesisRelativePath}`
const resolutionDirectory = `resolutions-${outputStem}`
const indexRelativePath = `resolution-index.${outputStem}.json`
const indexPath = `${batchDirectory}/${indexRelativePath}`
const receiptRelativePath = `${outputStem}.compatibility-receipt.json`
const receiptPath = `${batchDirectory}/${receiptRelativePath}`

const sourceHashes = {
  config: 'e8ae60173cd095bcfdbe5a43ff799b8ead2fe5df7ac95437e09827eda0332435',
  batchManifest: '3c2f4d59597c1995a9a31aa5f69dcf3e4be5f74f8b0e0fa4c494351045b98096',
  dualSummary: '74bca7a61cbd563737145f1d76c419fd408c8fb90ca777afda04124a68c0ffd1',
  roundARecords: '13a423c72b77038c0f07e76ff3327609be66ce2016eee4e8ac799013f5539518',
  roundARun: '67ba5b41e33c037fbbed7a549634057b21a3ac7a4bfad4bdc26b5998107c49e9',
  roundBRecords: 'dc6a8d08439a479d9a74b790009f689c260933d31bf18dedbef330c77d7ec2b5',
  roundBRun: '71816569bc5239faaccd7a85441e93a4f9f4d56e4613a5162dd36b224c03d893',
  canonical: 'baa1453243aa379fe5fb5bfccd686228f02a1d3b681f08491f912680108cccb6',
  semanticKindLedger: '4b25a1e8b9406e8dc56ba9f5895b0261ddf51e9c079b010f88c047feed527fbd',
} as const

const stableGoalIds = [
  '76fd0ab2-079a-516e-a33b-170355336d40',
  '92d8f398-0c9f-523c-88d7-44165b6b4768',
  '25edd154-b1d8-546c-94a5-88502b6725cd',
] as const
const excludedFreshGoalIds = [
  '156edddc-ce8d-580d-8d17-d9376d59e60e',
  '15b56a1e-3eec-52ca-82fa-b4df9ce88415',
  '481ffd56-d585-56fe-b525-ed423e30eed3',
] as const
const evidenceRoundByGoal = new Map<string, 'first' | 'second'>([
  [stableGoalIds[0], 'first'],
  [stableGoalIds[1], 'first'],
  [stableGoalIds[2], 'second'],
])
const rationaleByGoal = new Map<string, { de: string; en: string }>([
  [stableGoalIds[0], {
    de: 'Beide unabhängigen Blindprüfungen bestätigen die unveränderte Kompetenz. Die erste Runde liefert die ausgewählte Evidenzfassung; die zweite bleibt als vollständig gebundene unabhängige Bestätigung erhalten.',
    en: 'Both independent blind reviews confirm the unchanged competency. The first round supplies the selected evidence formulation; the second remains fully bound as independent confirmation.',
  }],
  [stableGoalIds[1], {
    de: 'Beide unabhängigen Blindprüfungen bestätigen die unveränderte Kompetenz. Die erste Runde liefert die ausgewählte Evidenzfassung; die zweite bleibt als vollständig gebundene unabhängige Bestätigung erhalten.',
    en: 'Both independent blind reviews confirm the unchanged competency. The first round supplies the selected evidence formulation; the second remains fully bound as independent confirmation.',
  }],
  [stableGoalIds[2], {
    de: 'Die erste Blindprüfung schlägt eine hilfreiche, aber für fachliche Richtigkeit, Atomarität und Prüfbarkeit nicht notwendige lokale Präzisierung vor. Die zweite Blindprüfung bestätigt den aktuellen Text; die fachliche Adjudikation verwirft die optionale Umformulierung und behält den aktuellen bilingualen Wortlaut. Deshalb liefert die zweite Runde die ausgewählte Evidenzfassung, während der vollständige Round-A-Dissent gebunden bleibt.',
    en: 'The first blind review proposes a helpful local clarification that is not necessary for scientific correctness, atomicity, or assessability. The second blind review confirms the current text; subject adjudication rejects the optional rewording and retains the current bilingual wording. The second round therefore supplies the selected evidence formulation while the complete Round A dissent remains bound.',
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
  if (semanticKindLedger.counts?.curricularAtomic !== 461) throw new Error('Physics curricularAtomic denominator drifted')
  for (const goalId of stableGoalIds) {
    const kind = semanticKindLedger.decisions?.find((decision) => decision.goalId === goalId)
    if (kind?.semanticKind !== 'curricularAtomic' || kind.decisionStatus !== 'authoritative') {
      throw new Error(`${goalId}: missing authoritative curricularAtomic classification`)
    }
  }

  const dual = await materializeGoalDescriptionRolloutBatchDualSummary(absolute(sourceConfigPath), false)
  if (!dual.bytes.equals(dualSummaryBytes)) throw new Error('Materialized dual summary is not exact-bound')
  if (dual.summary.goalCount !== 6) throw new Error('B028b campaign must contain exactly six goals')
  const campaignIds = dual.summary.goals.map(({ goalId }) => goalId)
  if (stableGoalIds.some((goalId) => !campaignIds.includes(goalId))) throw new Error('Stable scope escaped B028b')
  if (excludedFreshGoalIds.some((goalId) => !campaignIds.includes(goalId))) throw new Error('Fresh exclusion escaped B028b')

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
    if (goalId !== stableGoalIds[2] && (firstResult.source.decision !== 'keep' || secondResult.source.decision !== 'keep')) {
      throw new Error(`${goalId}: consensus-stable goals require two KEEP records`)
    }
    if (goalId === stableGoalIds[2] && (firstResult.source.decision !== 'revise' || secondResult.source.decision !== 'keep')) {
      throw new Error(`${goalId}: expected Round-A REVISE and Round-B KEEP dissent`)
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
  const manifestId = 'physik-b028b-stable3-synthesis-openai-codex-20260902'
  const manifestPayload: Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'> = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
    schemaVersion: 1,
    synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
    manifestId,
    authority: 'ai_synthesis',
    synthesizedBy: 'OpenAI Codex B028b stable-three adjudicated carryover synthesis candidate',
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
        ...(goal.goalId === stableGoalIds[2] ? {
          revisionDissent: {
            sourceRound: 'first' as const,
            disposition: 'rejected_keep_current' as const,
            proposedDescriptionDe: source.first.record.proposedDescriptionDe!,
            proposedDescriptionEn: source.first.record.proposedDescriptionEn!,
            rationaleDe: 'Die vorgeschlagene Fassung benennt ruhendes Zentrum und Modellbewegungen etwas expliziter. Diese Präzisierung ist fachlich hilfreich, aber nicht notwendig: Der aktuelle Wortlaut fordert bereits den Vergleich von Mittelpunkt, Stellung und zugeschriebenen Bewegungen und bleibt dadurch eindeutig, atomar und prüfbar.',
            rationaleEn: 'The proposed wording names the stationary center and model motions somewhat more explicitly. This clarification is helpful but unnecessary: the current wording already requires comparison of the center, positions, and attributed motions and is therefore clear, atomic, and assessable.',
          },
        } : {}),
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
      resolutionId: `physics-b028b-stable3-current-carryover-v1-resolution-${goal.goalId}`,
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
    artifactSetId: `${dual.prepared.manifest.batchId}-stable-current-carryover-3`,
    subject: dual.prepared.manifest.subjectLabel,
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: 3,
    curriculumAtomicDenominator: 461,
    descriptionReviewPercentage: 0.7,
    groups: [{
      groupId: dual.prepared.manifest.batchId,
      artifactDirectory: '.',
      dualSummaryPath: 'dual-summary.json',
      dualSummaryDigest: digest(dual.bytes),
      campaignGoalCount: dual.summary.goalCount,
      resolvedGoalCount: 3,
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
    receiptId: 'physik-b028b-stable-current-carryover-3-v1-20260902',
    purpose: 'Hash-bound carryover of exactly three adjudicated current B028b goals while the gravitation-field dissent and two adopted wording revisions require fresh B028c blind review.',
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
    currentCanonicalContexts,
    claimedGoalIds: stableGoalIds,
    explicitlyExcludedFreshGoalIds: excludedFreshGoalIds,
    adjudication: {
      currentTextKeptGoalIds: stableGoalIds,
      roundAOptionalRevisionRejectedGoalIds: [stableGoalIds[2]],
      splitReviewDissentFreshGoalIds: [excludedFreshGoalIds[0]],
      adoptedRevisionFreshGoalIds: [excludedFreshGoalIds[1], excludedFreshGoalIds[2]],
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
      stableThreeAndFreshThreeScopesDisjointAndComplete: true,
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
  console.log(`Physics B028b stable-three carryover ${writeMode ? 'materialized' : 'valid'}: goals=3; synthesis=${digest(synthesisBytes)}; index=${digest(indexBytes)}; receipt=${digest(receiptBytes)}`)
}

await main()
