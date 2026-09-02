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
type SourceHashes = {
  config: string
  batchManifest: string
  dualSummary: string
  roundARecords: string
  roundARun: string
  roundBRecords: string
  roundBRun: string
}
type CarryoverSpec = {
  key: 'b029a' | 'b029d'
  batchName: string
  stableGoalId: string
  excludedFreshGoalId: string
  roundAResultStem: string
  roundBResultStem: string
  selectedEvidenceRound: 'first' | 'second'
  rationale: { de: string; en: string }
  sourceHashes: SourceHashes
}

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
if (writeMode === checkMode) throw new Error('Use exactly one of --write or --check')
const unexpected = process.argv.slice(2).filter((argument) => !['--write', '--check'].includes(argument))
if (unexpected.length > 0) throw new Error(`Unexpected arguments: ${unexpected.join(', ')}`)

const rolloutRoot = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-02'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const semanticKindLedgerPath = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const baseGoalBookConfigPath = 'app/scripts/config/goal-books/de-gym-physics-national-atlas.json'
const rebaseSnapshotManifestPath = `${rolloutRoot}/batch-029r-e-thermodynamics-modeling-revised-8-v1/batch-manifest.json`
const outputStem = 'stable-current-carryover-1-v1'
const expectedCurriculumAtomicDenominator = 461

const sharedHashes = {
  canonical: '388e26ea071727043ad5a1f95f955ddf25923e0b038634432ecfb1786628fc10',
  semanticKindLedger: '80f35c789db98eb815c0a571d3511610591968912ab9f12af5fc2d86cb875cb8',
  rebaseSnapshotManifest: '3154337f07268f417c49a806595d362f940d0f5eea5beef7bcdad427875f0a89',
} as const

const specs: CarryoverSpec[] = [
  {
    key: 'b029a',
    batchName: 'batch-029a-e-thermodynamic-state-variables-2-v1',
    stableGoalId: '36c4590c-6032-5a37-b660-f15951dee076',
    excludedFreshGoalId: 'cd1903a5-d70a-5320-9124-b6b24917ba14',
    roundAResultStem: 'physik-rollout-v1-batch-029a-e-thermodynamic-state-variables-2-v1-20260902-first-pass-a.batch-001',
    roundBResultStem: 'physik-rollout-v1-batch-029a-e-thermodynamic-state-variables-2-v1-20260902-first-pass-b.batch-001',
    selectedEvidenceRound: 'second',
    rationale: {
      de: 'Beide unabhängigen Blindprüfungen bestätigen den unveränderten bilingualen Wortlaut als fachlich korrekt, kohärent und prüfbar. Die zweite Runde liefert die ausgewählte, besonders systemgrenzenbewusste Evidenzfassung; die erste bleibt vollständig als unabhängige KEEP-Bestätigung gebunden.',
      en: 'Both independent blind reviews confirm the unchanged bilingual wording as scientifically correct, coherent, and assessable. The second round supplies the selected evidence formulation with particularly explicit attention to the system boundary; the first remains fully bound as an independent KEEP confirmation.',
    },
    sourceHashes: {
      config: 'a7e5ef187eb608c3ce88e7e468a7891af1b0088bca9ac362c0afa0c3867f87c6',
      batchManifest: '1129e022a10c1de75524d0547c41959bda3f5751a699a54c863c7b3b877ff24f',
      dualSummary: '9db1fa8a9a7ba907091139fbf37b9dc818968c2cf1b129a3cf5c405f5839ed72',
      roundARecords: 'ce5a0480b1cc52890ffb703d4558894b3c6a92005e6d2df5daf938395ff67af2',
      roundARun: 'e5b7a90ed7e2123aed698c70d50f75bde0536d35313f1a02ea49cc7fc59bcf27',
      roundBRecords: 'c2cb2130835ace1b19e43b5670cd140f14e9b4f51df5b1e0921f9dc96908f25d',
      roundBRun: 'a845d48c4bee4893965c730062b6438ccfc2eca1df17a00716dc58f7881f6a3e',
    },
  },
  {
    key: 'b029d',
    batchName: 'batch-029d-e-energy-quality-evaluation-2-v1',
    stableGoalId: 'aed9161b-ddc4-559c-be8f-baeeddf224f3',
    excludedFreshGoalId: 'cbdc0b5f-8a48-5ade-be53-ab6aacaa3e73',
    roundAResultStem: 'physik-rollout-v1-batch-029d-e-energy-quality-evaluation-2-v1-20260902-first-pass-a.batch-001',
    roundBResultStem: 'physik-rollout-v1-batch-029d-e-energy-quality-evaluation-2-v1-20260902-first-pass-b.batch-001',
    selectedEvidenceRound: 'first',
    rationale: {
      de: 'Beide unabhängigen Blindprüfungen bestätigen den unveränderten bilingualen Wortlaut als fachlich korrekt, kohärent und prüfbar. Die erste Runde liefert die ausgewählte kompakte Evidenzfassung; die zweite bleibt vollständig als unabhängige KEEP-Bestätigung gebunden.',
      en: 'Both independent blind reviews confirm the unchanged bilingual wording as scientifically correct, coherent, and assessable. The first round supplies the selected concise evidence formulation; the second remains fully bound as an independent KEEP confirmation.',
    },
    sourceHashes: {
      config: 'bb3f2f6f93e341194fc47e971375a518185c241d813adc659fbf0834135d79b6',
      batchManifest: '24d24403e9cadfbf6f87933c08fda046d65953e9d193369dfce10299e2aed34f',
      dualSummary: 'a22b7356bbbb81cc7e82c29e5976108acccd425f898b8bd1f72779f13d2a25fe',
      roundARecords: '428dc2f33885c6f2d5fb2f6d216bf7aac19e8549afacf149a29db6bbf2b068e0',
      roundARun: '4471939240ed385bb391a763b2cb793f414ba0b09cc54d17c1c6c539d38762e5',
      roundBRecords: '827fc4e30e0b3fff2bcfb198974ee83eeea67ed5820301c8e8262e1166b7554d',
      roundBRun: 'cefce7f689e22707818dab89d40da2e0a9549292254e59ecbbe0b752e97e2331',
    },
  },
]

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
  const canonicalBytes = readBound(canonicalPath, sharedHashes.canonical)
  const semanticKindLedgerBytes = readBound(semanticKindLedgerPath, sharedHashes.semanticKindLedger)
  const rebaseSnapshotManifestBytes = readBound(rebaseSnapshotManifestPath, sharedHashes.rebaseSnapshotManifest)
  const landscape = JSON.parse(canonicalBytes.toString('utf8')) as { goals: JsonGoal[] }
  const semanticKindLedger = JSON.parse(semanticKindLedgerBytes.toString('utf8')) as {
    counts?: { curricularAtomic?: number }
    decisions?: Array<{ goalId?: string; semanticKind?: string; decisionStatus?: string }>
  }
  const rebaseSnapshotManifest = JSON.parse(rebaseSnapshotManifestBytes.toString('utf8')) as {
    source: { baseBookDigest: GoalDescriptionSynthesisDigest }
    artifacts: { bookModelDigest: GoalDescriptionSynthesisDigest; bundleFingerprint: GoalDescriptionSynthesisDigest }
  }
  if (semanticKindLedger.counts?.curricularAtomic !== expectedCurriculumAtomicDenominator) {
    throw new Error('Physics curricularAtomic denominator drifted')
  }
  const currentBase = await loadGoalBookBuildInputs(baseGoalBookConfigPath)
  if (currentBase.model.digest !== rebaseSnapshotManifest.source.baseBookDigest) {
    throw new Error('Current Physics Atlas is not the exact B029r post-revision snapshot')
  }

  const allOutputs: Array<{ path: string; bytes: Buffer }> = []
  const resultMessages: string[] = []
  for (const spec of specs) {
    const batchDirectory = `${rolloutRoot}/${spec.batchName}`
    const sourceConfigPath = `${batchDirectory}.config.json`
    const batchManifestPath = `${batchDirectory}/batch-manifest.json`
    const dualSummaryPath = `${batchDirectory}/dual-summary.json`
    const roundARecordsPath = `${batchDirectory}/round-a/results/${spec.roundAResultStem}.records.jsonl`
    const roundARunPath = `${batchDirectory}/round-a/results/${spec.roundAResultStem}.run.json`
    const roundBRecordsPath = `${batchDirectory}/round-b/results/${spec.roundBResultStem}.records.jsonl`
    const roundBRunPath = `${batchDirectory}/round-b/results/${spec.roundBResultStem}.run.json`
    const synthesisRelativePath = `synthesis-decisions.${outputStem}.json`
    const synthesisPath = `${batchDirectory}/${synthesisRelativePath}`
    const resolutionDirectory = `resolutions-${outputStem}`
    const resolutionRelativePath = `${resolutionDirectory}/${spec.stableGoalId}.resolution.json`
    const resolutionPath = `${batchDirectory}/${resolutionRelativePath}`
    const indexRelativePath = `resolution-index.${outputStem}.json`
    const indexPath = `${batchDirectory}/${indexRelativePath}`
    const receiptRelativePath = `${outputStem}.compatibility-receipt.json`
    const receiptPath = `${batchDirectory}/${receiptRelativePath}`

    const configBytes = readBound(sourceConfigPath, spec.sourceHashes.config)
    const batchManifestBytes = readBound(batchManifestPath, spec.sourceHashes.batchManifest)
    const dualSummaryBytes = readBound(dualSummaryPath, spec.sourceHashes.dualSummary)
    const roundARecordsBytes = readBound(roundARecordsPath, spec.sourceHashes.roundARecords)
    const roundARunBytes = readBound(roundARunPath, spec.sourceHashes.roundARun)
    const roundBRecordsBytes = readBound(roundBRecordsPath, spec.sourceHashes.roundBRecords)
    const roundBRunBytes = readBound(roundBRunPath, spec.sourceHashes.roundBRun)
    const sourceConfig = JSON.parse(configBytes.toString('utf8')) as {
      baseGoalBookConfigPath: string
      bookId: string
      title: string
      goalIds: string[]
    }
    if (sourceConfig.baseGoalBookConfigPath !== baseGoalBookConfigPath) {
      throw new Error(`${spec.key}: unexpected base GoalBook configuration`)
    }

    const dual = await materializeGoalDescriptionRolloutBatchDualSummary(absolute(sourceConfigPath), false)
    if (!dual.bytes.equals(dualSummaryBytes)) throw new Error(`${spec.key}: materialized dual summary is not exact-bound`)
    if (dual.summary.goalCount !== 2) throw new Error(`${spec.key}: source campaign must contain exactly two goals`)
    const campaignIds = dual.summary.goals.map(({ goalId }) => goalId)
    if (!sameSet(campaignIds, [spec.stableGoalId, spec.excludedFreshGoalId])) {
      throw new Error(`${spec.key}: stable/fresh partition does not exactly cover the source batch`)
    }
    if (dual.prepared.manifest.source.baseBookDigest === rebaseSnapshotManifest.source.baseBookDigest) {
      throw new Error(`${spec.key}: B029r post-revision Atlas snapshot must differ from the original source Atlas`)
    }

    const kind = semanticKindLedger.decisions?.find((decision) => decision.goalId === spec.stableGoalId)
    if (kind?.semanticKind !== 'curricularAtomic' || kind.decisionStatus !== 'authoritative') {
      throw new Error(`${spec.stableGoalId}: missing authoritative curricularAtomic classification`)
    }
    const currentSubset = buildGoalDescriptionRolloutSubsetModel({
      baseModel: currentBase.model,
      goalIds: sourceConfig.goalIds,
      bookId: sourceConfig.bookId,
      title: sourceConfig.title,
    })
    const sourcePage = dual.prepared.model.pages.find((page) => page.goalId === spec.stableGoalId)
    const currentPage = currentSubset.pages.find((page) => page.goalId === spec.stableGoalId)
    if (!sourcePage || !currentPage) throw new Error(`${spec.stableGoalId}: missing source or current Atlas page`)
    if (stableGoalBookJson(sourcePage) !== stableGoalBookJson(currentPage)) {
      throw new Error(`${spec.stableGoalId}: current Atlas page context drifted`)
    }
    if (dual.prepared.model.digest === currentSubset.digest) {
      throw new Error(`${spec.key}: current subset must reflect its excluded goal's accepted wording revision`)
    }

    const firstResult = extractGoalDescriptionDualRoundResolutionSource({
      artifacts: dual.first,
      goalId: spec.stableGoalId,
      label: 'First',
    })
    const secondResult = extractGoalDescriptionDualRoundResolutionSource({
      artifacts: dual.second,
      goalId: spec.stableGoalId,
      label: 'Second',
    })
    if (firstResult.errors.length > 0 || secondResult.errors.length > 0 || !firstResult.source || !secondResult.source) {
      throw new Error(`${spec.stableGoalId}: source extraction failed: ${[...firstResult.errors, ...secondResult.errors].join(' | ')}`)
    }
    if (firstResult.source.decision !== 'keep' || secondResult.source.decision !== 'keep') {
      throw new Error(`${spec.stableGoalId}: stable carryover requires two independent KEEP records`)
    }
    const selected = spec.selectedEvidenceRound === 'first' ? firstResult.source : secondResult.source
    if (selected.decision !== 'keep') throw new Error(`${spec.stableGoalId}: selected evidence round must be KEEP`)

    const firstInput = dual.first.input.goals.find(({ goalId }) => goalId === spec.stableGoalId)
    const secondInput = dual.second.input.goals.find(({ goalId }) => goalId === spec.stableGoalId)
    const canonicalGoal = landscape.goals.find(({ id }) => id === spec.stableGoalId)
    if (!firstInput || !secondInput || !canonicalGoal) throw new Error(`${spec.stableGoalId}: missing input or canonical goal`)
    if (stableGoalBookJson(firstInput) !== stableGoalBookJson(secondInput)) {
      throw new Error(`${spec.stableGoalId}: blind inputs differ`)
    }
    const canonicalContext = buildGoalDescriptionCanonicalContext(canonicalGoal)
    if (stableGoalBookJson(firstInput.canonicalContext) !== stableGoalBookJson(canonicalContext)) {
      throw new Error(`${spec.stableGoalId}: direct current canonical context changed`)
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
      throw new Error(`${spec.stableGoalId}: bilingual text is not exact-current`)
    }

    const expectedGoal: GoalDescriptionRolloutSynthesisExpectedGoal = {
      goalId: spec.stableGoalId,
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
    const manifestId = `physik-${spec.key}-stable1-synthesis-openai-codex-20260902`
    const manifestPayload: Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'> = {
      $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
      schemaVersion: 1,
      synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
      manifestId,
      authority: 'ai_synthesis',
      synthesizedBy: `OpenAI Codex Physics ${spec.key.toUpperCase()} stable-current carryover synthesis candidate`,
      synthesizedAt,
      batch: expectedBindings.batch,
      rounds: expectedBindings.rounds,
      decisions: [{
        decisionId: `${manifestId}-decision-001`,
        goalId: expectedGoal.goalId,
        effectiveSemanticKind: expectedGoal.effectiveSemanticKind,
        goalFingerprint: expectedGoal.goalFingerprint,
        pageFingerprint: expectedGoal.pageFingerprint,
        goalReviewContextFingerprint: expectedGoal.goalReviewContextFingerprint,
        finalText: expectedGoal.finalText,
        resolutionDecision: 'keep_current',
        evidenceRound: spec.selectedEvidenceRound,
        records: {
          first: { recordId: firstResult.source.binding.recordId, recordDigest: firstResult.source.binding.recordDigest },
          second: { recordId: secondResult.source.binding.recordId, recordDigest: secondResult.source.binding.recordDigest },
        },
        rationaleDe: spec.rationale.de,
        rationaleEn: spec.rationale.en,
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
      throw new Error(`${spec.key}: synthesis invalid: ${manifestValidation.errors.join(' | ')}`)
    }
    const synthesisBytes = jsonBytes(synthesisManifest)
    const summaryGoal = dual.summary.goals.find(({ goalId }) => goalId === spec.stableGoalId)
    const decision = synthesisManifest.decisions[0]
    if (!summaryGoal || !decision) throw new Error(`${spec.stableGoalId}: incomplete resolution alignment`)
    const synthesis = buildGoalDescriptionRolloutResolutionSynthesis({
      batchId: synthesisManifest.batch.batchId,
      manifest: synthesisManifest,
      decision,
      summaryGoal,
      firstSource: firstResult.source,
      secondSource: secondResult.source,
    })
    const resolution = buildGoalDescriptionDualRoundResolution({
      resolutionId: `physics-${spec.key}-stable1-current-carryover-v1-resolution-${spec.stableGoalId}`,
      goalId: spec.stableGoalId,
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
      throw new Error(`${spec.stableGoalId}: resolution invalid: ${resolutionValidation.errors.join(' | ')}`)
    }
    const resolutionBytes = jsonBytes(resolution)
    const index = {
      schemaVersion: 1,
      artifactSetId: `${dual.prepared.manifest.batchId}-stable-current-carryover-1`,
      subject: dual.prepared.manifest.subjectLabel,
      semanticKind: 'curricularAtomic',
      strictDescriptionReviewCompleteCount: 1,
      curriculumAtomicDenominator: expectedCurriculumAtomicDenominator,
      descriptionReviewPercentage: 0.2,
      groups: [{
        groupId: dual.prepared.manifest.batchId,
        artifactDirectory: '.',
        dualSummaryPath: 'dual-summary.json',
        dualSummaryDigest: digest(dual.bytes),
        campaignGoalCount: dual.summary.goalCount,
        resolvedGoalCount: 1,
      }],
      resolutions: [{
        goalId: spec.stableGoalId,
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
      receiptId: `physik-${spec.key}-stable-current-carryover-1-v1-20260902`,
      purpose: `Hash-bound carryover of exactly the one consensus-stable ${spec.key.toUpperCase()} goal while the other source-batch goal receives fresh post-revision blind review.`,
      source: {
        configPath: sourceConfigPath,
        configSha256: digest(configBytes),
        batchManifestPath,
        batchManifestSha256: digest(batchManifestBytes),
        dualSummaryPath,
        dualSummarySha256: digest(dualSummaryBytes),
        semanticKindLedgerPath,
        semanticKindLedgerSha256: digest(semanticKindLedgerBytes),
        curriculumAtomicDenominator: expectedCurriculumAtomicDenominator,
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
        reason: 'The accepted B029 wording revisions change the full Physics Atlas and this source subset, while the claimed stable goal page remains byte-exact in the rebuilt current Atlas subset.',
        sourceBaseBookDigest: dual.prepared.manifest.source.baseBookDigest,
        sourceSubsetBookDigest: dual.prepared.model.digest,
        currentBaseBookDigest: currentBase.model.digest,
        currentSubsetBookDigest: currentSubset.digest,
        postRevisionSnapshot: {
          batchManifestPath: rebaseSnapshotManifestPath,
          batchManifestDigest: digest(rebaseSnapshotManifestBytes),
          baseBookDigest: rebaseSnapshotManifest.source.baseBookDigest,
          bookModelDigest: rebaseSnapshotManifest.artifacts.bookModelDigest,
          bundleFingerprint: rebaseSnapshotManifest.artifacts.bundleFingerprint,
        },
        fullAtlasDigestChangedAtPostRevisionSnapshot: true,
        currentSubsetDiffersFromSourceSubset: true,
        stableGoalPage: {
          goalId: spec.stableGoalId,
          sourceGoalFingerprint: sourcePage.goalFingerprint,
          currentGoalFingerprint: currentPage.goalFingerprint,
          sourcePageFingerprint: sourcePage.pageFingerprint,
          currentPageFingerprint: currentPage.pageFingerprint,
          exactPageContext: true,
        },
      },
      currentCanonicalContext: {
        goalId: spec.stableGoalId,
        canonicalContext,
        fingerprint: digest(stableGoalBookJson(canonicalContext)),
      },
      claimedGoalIds: [spec.stableGoalId],
      explicitlyExcludedFreshGoalIds: [spec.excludedFreshGoalId],
      adjudication: {
        currentTextKeptGoalIds: [spec.stableGoalId],
        adoptedRevisionFreshGoalIds: [spec.excludedFreshGoalId],
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
        currentBilingualTextAndDirectContextRequired: true,
        currentAtlasStablePageRequiredByteExact: true,
        stableAndFreshScopesDisjointAndComplete: true,
        canonicalLandscapeAndSemanticKindLedgerByteBound: true,
        openAiReviewFreezeRequiredBeforeWrite: true,
      },
    } as const
    const materializationPlanSha256 = digest(jsonBytes({
      sharedHashes,
      spec,
      outputs: outputsWithoutReceipt.map(({ path, bytes }) => ({ path, sha256: digest(bytes) })),
      receiptPath,
      receiptBody,
    }))
    const receiptBytes = jsonBytes({ ...receiptBody, materializationPlanSha256 })
    allOutputs.push(...outputsWithoutReceipt, { path: receiptPath, bytes: receiptBytes })
    resultMessages.push(
      `${spec.key}: goal=${spec.stableGoalId}; synthesis=${digest(synthesisBytes)}; index=${digest(indexBytes)}; receipt=${digest(receiptBytes)}`,
    )
  }

  if (writeMode) {
    execFileSync(process.execPath, ['scripts/check_openai_plugin_review_freeze.mjs'], {
      cwd: repoRoot,
      stdio: 'inherit',
    })
    for (const output of allOutputs) publish(output.path, output.bytes)
  } else {
    for (const output of allOutputs) assertOutput(output.path, output.bytes)
  }
  console.log(`Physics B029 cross-batch stable-two carryover ${writeMode ? 'materialized' : 'valid'}:\n${resultMessages.join('\n')}`)
}

await main()
