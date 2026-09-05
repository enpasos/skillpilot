import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
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
type Authoring = {
  schemaVersion: 1
  artifactType: 'goal-description-stable-current-carryover-authoring-v1'
  carryoverId: string
  synthesizedBy: string
  excludedGoalIds: string[]
  decisions: Array<{
    goalId: string
    evidenceRound: 'first' | 'second'
    rationaleDe: string
    rationaleEn: string
  }>
}

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const write = process.argv.includes('--write')
const unexpected = process.argv.slice(2).filter((argument) => argument !== '--write')
if (unexpected.length > 0) throw new Error(`Unknown arguments: ${unexpected.join(', ')}`)

const rolloutRoot = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-05'
const batchName = 'batch-033x-final-current-recheck-2-v1'
const batchRelativePath = `${rolloutRoot}/${batchName}`
const configRelativePath = `${batchRelativePath}.config.json`
const canonicalRelativePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const semanticKindRelativePath = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const authoringRelativePath = `${batchRelativePath}/stable-current-carryover-1-v1.authoring.json`
const batchManifestRelativePath = `${batchRelativePath}/batch-manifest.json`
const dualSummaryRelativePath = `${batchRelativePath}/dual-summary.json`
const resultStem = 'physik-rollout-v1-batch-033x-final-current-recheck-2-v1-20260905-first-pass'
const roundARecordsRelativePath = `${batchRelativePath}/round-a/results/${resultStem}-a.batch-001.records.jsonl`
const roundARunRelativePath = `${batchRelativePath}/round-a/results/${resultStem}-a.batch-001.run.json`
const roundBRecordsRelativePath = `${batchRelativePath}/round-b/results/${resultStem}-b.batch-001.records.jsonl`
const roundBRunRelativePath = `${batchRelativePath}/round-b/results/${resultStem}-b.batch-001.run.json`
const outputStem = 'stable-current-carryover-1-v1'
const synthesisRelativeToBatch = `synthesis-decisions.${outputStem}.json`
const synthesisRelativePath = `${batchRelativePath}/${synthesisRelativeToBatch}`
const resolutionDirectory = `resolutions-${outputStem}`
const resolutionRelativeToBatch = `${resolutionDirectory}/b2fb9a25-4d26-5cf2-a917-823909dcb6bd.resolution.json`
const resolutionRelativePath = `${batchRelativePath}/${resolutionRelativeToBatch}`
const indexRelativeToBatch = `resolution-index.${outputStem}.json`
const indexRelativePath = `${batchRelativePath}/${indexRelativeToBatch}`
const receiptRelativeToBatch = `${outputStem}.compatibility-receipt.json`
const receiptRelativePath = `${batchRelativePath}/${receiptRelativeToBatch}`
const baseGoalBookConfigPath = 'app/scripts/config/goal-books/de-gym-physics-national-atlas.json'

const stableGoalId = 'b2fb9a25-4d26-5cf2-a917-823909dcb6bd'
const disputedGoalId = 'a684bec1-ba59-59d0-98d2-4ca37236f64c'
const campaignGoalIds = [stableGoalId, disputedGoalId] as const
const curriculumAtomicDenominator = 461
const sourcePins = {
  config: '9c46158bd808952c522a04b8c53da88f0c500fb9e9d3ca0c5b99f5c6ed0f03bd',
  batchManifest: '5b5a6f7ee249a1a8765d8974e3e8c654a37eef71645ad97ecae2b2cddbc4247c',
  dualSummary: '7ceced7f5d92e644a5b29d59fd72d2772f93fe6d9c384bf1d56863ac20f37072',
  roundARecords: '2f71305e0ad543b80baf2f1610e26fc513c30323d95861c1e3d1b2eb3e497bb3',
  roundARun: 'a815c23581dc55f915a2ee4e7269fe3fa61e6e5d88c856c6cc382407d0308422',
  roundBRecords: 'e604456af7f6f03cae1a57ebf8c98d1d67fc758c543c364a9b63ccd4a1c5a2a3',
  roundBRun: '1ed63697e104d20a32fa9eb9b61617dcc6bd1358a8d9d96632fabb9dd06aad3c',
  canonical: 'feab56ab0e3d0c8cfce8a48f41aceabdda2e45c86512e6746b0a303b9a297736',
  semanticKind: 'f0ec73d8cfb1ea3ae329901d4881d1d398a325a4effa92f1fdb85afbe34ebaaf',
} as const

const absolute = (path: string): string => resolve(repositoryRoot, path)
const sha256Hex = (value: Buffer | string): string => createHash('sha256').update(value).digest('hex')
const digest = (value: Buffer | string): GoalDescriptionSynthesisDigest => `sha256:${sha256Hex(value)}`
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const sameOrdered = (left: readonly string[], right: readonly string[]): boolean => (
  left.length === right.length && left.every((value, index) => value === right[index])
)
const assertTrimmed: (value: unknown, label: string) => asserts value is string = (value, label) => {
  if (typeof value !== 'string' || value.length === 0 || value.trim() !== value) {
    throw new Error(`${label} must be a non-blank trimmed string`)
  }
}
const readBound = async (path: string, expected: string): Promise<Buffer> => {
  const bytes = await readFile(absolute(path))
  const actual = sha256Hex(bytes)
  if (actual !== expected) throw new Error(`${path}: bound digest drift ${actual} != ${expected}`)
  return bytes
}
const readOptional = async (path: string): Promise<Buffer | null> => {
  try {
    return await readFile(absolute(path))
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}
const writeAllOrRequireExact = async (artifacts: Array<{ path: string; bytes: Buffer }>): Promise<void> => {
  const current = await Promise.all(artifacts.map(({ path }) => readOptional(path)))
  artifacts.forEach(({ path, bytes }, index) => {
    if (current[index] && !current[index]?.equals(bytes)) throw new Error(`Existing B033x stable-one artifact is stale: ${path}`)
    if (!current[index] && !write) throw new Error(`Missing B033x stable-one artifact: ${path}`)
  })
  if (!write) return
  for (let index = 0; index < artifacts.length; index += 1) {
    if (current[index]) continue
    const artifact = artifacts[index]
    if (!artifact) continue
    await mkdir(dirname(absolute(artifact.path)), { recursive: true })
    await writeFile(absolute(artifact.path), artifact.bytes, { flag: 'wx' })
  }
}
const currentText = (goal: JsonGoal) => ({
  titleDe: String(goal.title ?? ''),
  titleEn: String(goal.titleEn ?? ''),
  descriptionDe: String(goal.description ?? ''),
  descriptionEn: String(goal.descriptionEn ?? ''),
})
const inputText = (goal: {
  currentTitleDe: string
  currentTitleEn: string
  currentDescriptionDe: string
  currentDescriptionEn: string
}) => ({
  titleDe: goal.currentTitleDe,
  titleEn: goal.currentTitleEn,
  descriptionDe: goal.currentDescriptionDe,
  descriptionEn: goal.currentDescriptionEn,
})

const main = async (): Promise<void> => {
  const [
    configBytes,
    batchManifestBytes,
    dualSummaryBytes,
    roundARecordsBytes,
    roundARunBytes,
    roundBRecordsBytes,
    roundBRunBytes,
    canonicalBytes,
    semanticKindBytes,
    authoringBytes,
  ] = await Promise.all([
    readBound(configRelativePath, sourcePins.config),
    readBound(batchManifestRelativePath, sourcePins.batchManifest),
    readBound(dualSummaryRelativePath, sourcePins.dualSummary),
    readBound(roundARecordsRelativePath, sourcePins.roundARecords),
    readBound(roundARunRelativePath, sourcePins.roundARun),
    readBound(roundBRecordsRelativePath, sourcePins.roundBRecords),
    readBound(roundBRunRelativePath, sourcePins.roundBRun),
    readBound(canonicalRelativePath, sourcePins.canonical),
    readBound(semanticKindRelativePath, sourcePins.semanticKind),
    readFile(absolute(authoringRelativePath)),
  ])
  const config = JSON.parse(configBytes.toString('utf8')) as {
    baseGoalBookConfigPath?: string
    bookId?: string
    title?: string
    goalIds?: string[]
  }
  const landscape = JSON.parse(canonicalBytes.toString('utf8')) as { subject?: string; goals?: JsonGoal[] }
  const semanticKinds = JSON.parse(semanticKindBytes.toString('utf8')) as {
    counts?: { curricularAtomic?: number }
    decisions?: Array<{ goalId?: string; semanticKind?: string; decisionStatus?: string }>
  }
  const authoring = JSON.parse(authoringBytes.toString('utf8')) as Authoring
  if (
    config.baseGoalBookConfigPath !== baseGoalBookConfigPath
    || !config.bookId
    || !config.title
    || !sameOrdered(config.goalIds ?? [], campaignGoalIds)
  ) throw new Error('B033x source configuration drifted')
  if (landscape.subject !== 'Physik' || !Array.isArray(landscape.goals)) {
    throw new Error('Current canonical Physics landscape is invalid')
  }
  const semanticDecision = semanticKinds.decisions?.find(({ goalId }) => goalId === stableGoalId)
  if (
    semanticKinds.counts?.curricularAtomic !== curriculumAtomicDenominator
    || semanticDecision?.semanticKind !== 'curricularAtomic'
    || semanticDecision.decisionStatus !== 'authoritative'
  ) throw new Error('B033x semantic-kind binding or denominator drifted')
  if (
    authoring.schemaVersion !== 1
    || authoring.artifactType !== 'goal-description-stable-current-carryover-authoring-v1'
    || authoring.carryoverId !== 'physik-b033x-stable-current-carryover-1-v1-20260905'
    || !sameOrdered(authoring.excludedGoalIds, [disputedGoalId])
    || !sameOrdered(authoring.decisions.map(({ goalId }) => goalId), [stableGoalId])
  ) throw new Error('B033x stable-one authoring identity or 1/1 partition is invalid')
  assertTrimmed(authoring.synthesizedBy, 'synthesizedBy')

  const dual = await materializeGoalDescriptionRolloutBatchDualSummary(absolute(configRelativePath), false)
  if (!dual.bytes.equals(dualSummaryBytes)) throw new Error('B033x dual summary is not exact-current')
  if (
    dual.summary.goalCount !== 2
    || !sameOrdered(dual.prepared.manifest.goalIds, campaignGoalIds)
    || !sameOrdered(dual.summary.goals.map(({ goalId }) => goalId), campaignGoalIds)
  ) throw new Error('B033x dual-summary scope drifted')
  const stableSummary = dual.summary.goals.find(({ goalId }) => goalId === stableGoalId)
  const disputedSummary = dual.summary.goals.find(({ goalId }) => goalId === disputedGoalId)
  if (stableSummary?.firstDecision !== 'keep' || stableSummary.secondDecision !== 'keep') {
    throw new Error('B033x stable goal no longer has two independent KEEP decisions')
  }
  if (disputedSummary?.firstDecision !== 'split_review' || disputedSummary.secondDecision !== 'keep') {
    throw new Error('B033x disputed goal decision pair drifted')
  }

  const firstResult = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.first, goalId: stableGoalId, label: 'First' })
  const secondResult = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.second, goalId: stableGoalId, label: 'Second' })
  if (firstResult.errors.length > 0 || secondResult.errors.length > 0 || !firstResult.source || !secondResult.source) {
    throw new Error(`B033x source extraction failed: ${[...firstResult.errors, ...secondResult.errors].join(' | ')}`)
  }
  if (firstResult.source.decision !== 'keep' || secondResult.source.decision !== 'keep') {
    throw new Error('B033x carryover requires two exact KEEP sources')
  }
  const firstInput = dual.first.input.goals.find(({ goalId }) => goalId === stableGoalId)
  const secondInput = dual.second.input.goals.find(({ goalId }) => goalId === stableGoalId)
  const canonicalGoal = landscape.goals.find(({ id }) => id === stableGoalId)
  if (!firstInput || !secondInput || !canonicalGoal) throw new Error('B033x stable source context is incomplete')
  if (stableGoalBookJson(firstInput) !== stableGoalBookJson(secondInput)) {
    throw new Error('B033x blind inputs differ')
  }
  const canonicalContext = buildGoalDescriptionCanonicalContext(canonicalGoal)
  if (
    stableGoalBookJson(firstInput.canonicalContext) !== stableGoalBookJson(canonicalContext)
    || stableGoalBookJson(inputText(firstInput)) !== stableGoalBookJson(currentText(canonicalGoal))
  ) throw new Error('B033x reviewed bilingual text or direct canonical context is not exact-current')
  const currentBase = await loadGoalBookBuildInputs(baseGoalBookConfigPath)
  const currentSubset = buildGoalDescriptionRolloutSubsetModel({
    baseModel: currentBase.model,
    goalIds: [...campaignGoalIds],
    bookId: config.bookId,
    title: config.title,
  })
  const sourcePage = dual.prepared.model.pages.find(({ goalId }) => goalId === stableGoalId)
  const currentPage = currentSubset.pages.find(({ goalId }) => goalId === stableGoalId)
  if (!sourcePage || !currentPage || stableGoalBookJson(sourcePage) !== stableGoalBookJson(currentPage)) {
    throw new Error('B033x stable Atlas page is not exact-current')
  }
  const goalReviewContextFingerprint = fingerprintGoalDescriptionReviewContext(firstInput)
  if (
    firstResult.source.binding.goalReviewContextFingerprint !== goalReviewContextFingerprint
    || secondResult.source.binding.goalReviewContextFingerprint !== goalReviewContextFingerprint
  ) throw new Error('B033x review-context bindings drifted')

  const expectedGoal: GoalDescriptionRolloutSynthesisExpectedGoal = {
    goalId: stableGoalId,
    effectiveSemanticKind: 'curricularAtomic',
    goalFingerprint: firstInput.goalFingerprint as GoalDescriptionSynthesisDigest,
    pageFingerprint: firstInput.pageFingerprint as GoalDescriptionSynthesisDigest,
    goalReviewContextFingerprint,
    finalText: inputText(firstInput),
    firstSource: firstResult.source,
    secondSource: secondResult.source,
  }
  const completionTimes = [roundARunBytes, roundBRunBytes]
    .map((bytes) => Date.parse((JSON.parse(bytes.toString('utf8')) as { completedAt: string }).completedAt))
  if (completionTimes.some((value) => !Number.isFinite(value))) throw new Error('B033x run timestamps are invalid')
  const synthesizedAt = new Date(Math.max(...completionTimes) + 1000).toISOString()
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
  const authoredDecision = authoring.decisions[0]
  if (!authoredDecision || authoredDecision.goalId !== stableGoalId) throw new Error('B033x decision authoring is missing')
  assertTrimmed(authoredDecision.rationaleDe, 'rationaleDe')
  assertTrimmed(authoredDecision.rationaleEn, 'rationaleEn')
  const manifestId = 'physik-b033x-stable-current-carryover-1-v1-openai-codex-20260905'
  const manifestPayload: Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'> = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
    schemaVersion: 1,
    synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
    manifestId,
    authority: 'ai_synthesis',
    synthesizedBy: authoring.synthesizedBy,
    synthesizedAt,
    batch: expectedBindings.batch,
    rounds: expectedBindings.rounds,
    decisions: [{
      decisionId: `${manifestId}-decision-001`,
      goalId: stableGoalId,
      effectiveSemanticKind: 'curricularAtomic',
      goalFingerprint: expectedGoal.goalFingerprint,
      pageFingerprint: expectedGoal.pageFingerprint,
      goalReviewContextFingerprint,
      finalText: expectedGoal.finalText,
      resolutionDecision: 'keep_current',
      evidenceRound: authoredDecision.evidenceRound,
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
      rationaleDe: authoredDecision.rationaleDe,
      rationaleEn: authoredDecision.rationaleEn,
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
    throw new Error(`B033x stable-one synthesis invalid: ${manifestValidation.errors.join(' | ')}`)
  }
  const synthesisBytes = jsonBytes(synthesisManifest)
  const synthesisDecision = synthesisManifest.decisions[0]
  if (!synthesisDecision) throw new Error('B033x synthesis decision is missing')
  const synthesis = buildGoalDescriptionRolloutResolutionSynthesis({
    batchId: synthesisManifest.batch.batchId,
    manifest: synthesisManifest,
    decision: synthesisDecision,
    summaryGoal: stableSummary,
    firstSource: firstResult.source,
    secondSource: secondResult.source,
  })
  const resolution = buildGoalDescriptionDualRoundResolution({
    resolutionId: `physics-b033x-stable1-current-carryover-v1-resolution-${stableGoalId}`,
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
      manifestPath: synthesisRelativeToBatch,
      manifestId: synthesisManifest.manifestId,
      manifestDigest: digest(synthesisBytes),
      manifestFingerprint: synthesisManifest.manifestFingerprint,
      decisionId: synthesisDecision.decisionId,
    },
  })
  const resolutionValidation = await validateGoalDescriptionDualRoundResolution({
    resolution,
    dualSummary: dual.summary,
    dualSummaryBytes: dual.bytes,
    currentInput: dual.first.input,
    landscape: { subject: 'Physik', goals: landscape.goals },
    first: dual.first,
    second: dual.second,
    synthesisDecisionManifestArtifact: {
      manifest: synthesisManifest,
      manifestBytes: synthesisBytes,
      manifestPath: synthesisRelativeToBatch,
    },
  })
  if (resolutionValidation.errors.length > 0 || !resolutionValidation.strictDescriptionComplete) {
    throw new Error(`B033x stable-one resolution invalid: ${resolutionValidation.errors.join(' | ')}`)
  }
  const resolutionBytes = jsonBytes(resolution)
  const index = {
    schemaVersion: 1,
    artifactSetId: `${dual.prepared.manifest.batchId}-stable-current-carryover-1`,
    subject: 'Physik',
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: 1,
    curriculumAtomicDenominator,
    descriptionReviewPercentage: Number(((1 / curriculumAtomicDenominator) * 100).toFixed(1)),
    groups: [{
      groupId: dual.prepared.manifest.batchId,
      artifactDirectory: '.',
      dualSummaryPath: 'dual-summary.json',
      dualSummaryDigest: digest(dual.bytes),
      campaignGoalCount: 2,
      resolvedGoalCount: 1,
    }],
    resolutions: [{
      goalId: stableGoalId,
      titleDe: resolution.goal.finalText.titleDe,
      groupId: dual.prepared.manifest.batchId,
      decision: resolution.decision,
      resolutionPath: resolutionRelativeToBatch,
      resolutionDigest: digest(resolutionBytes),
      resolutionFingerprint: resolution.resolutionFingerprint,
      strictDescriptionComplete: true,
    }],
  }
  const indexBytes = jsonBytes(index)
  const outputsBeforeReceipt = [
    { path: synthesisRelativePath, bytes: synthesisBytes },
    { path: resolutionRelativePath, bytes: resolutionBytes },
    { path: indexRelativePath, bytes: indexBytes },
  ]
  const receiptBody = {
    schemaVersion: 1,
    receiptId: 'physik-b033x-stable-current-carryover-1-v1-20260905',
    purpose: 'Fail-closed materialization of exactly the one exact-current Physics B033x goal confirmed KEEP by both independent blind rounds; the disputed split-review/keep goal remains excluded and unresolved.',
    sourceBatchId: dual.prepared.manifest.batchId,
    sourceCampaignGoalCount: 2,
    source: {
      configPath: configRelativePath,
      configDigest: digest(configBytes),
      batchManifestPath: batchManifestRelativePath,
      batchManifestDigest: digest(batchManifestBytes),
      dualSummaryPath: dualSummaryRelativePath,
      dualSummaryDigest: digest(dualSummaryBytes),
      authoringPath: authoringRelativePath,
      authoringDigest: digest(authoringBytes),
      roundA: {
        recordsPath: roundARecordsRelativePath,
        recordsDigest: digest(roundARecordsBytes),
        runPath: roundARunRelativePath,
        runDigest: digest(roundARunBytes),
      },
      roundB: {
        recordsPath: roundBRecordsRelativePath,
        recordsDigest: digest(roundBRecordsBytes),
        runPath: roundBRunRelativePath,
        runDigest: digest(roundBRunBytes),
      },
    },
    currentCanonicalLandscape: { path: canonicalRelativePath, digest: digest(canonicalBytes) },
    semanticKindLedger: { path: semanticKindRelativePath, digest: digest(semanticKindBytes) },
    exactCurrentAtlas: {
      baseGoalBookConfigPath,
      sourceBaseBookDigest: dual.prepared.manifest.source.baseBookDigest,
      sourceSubsetBookDigest: dual.prepared.model.digest,
      currentBaseBookDigest: currentBase.model.digest,
      currentSubsetBookDigest: currentSubset.digest,
      stablePage: {
        goalId: stableGoalId,
        sourcePageFingerprint: sourcePage.pageFingerprint,
        currentPageFingerprint: currentPage.pageFingerprint,
        exactPageContext: sourcePage.pageFingerprint === currentPage.pageFingerprint,
      },
    },
    currentCanonicalContext: {
      goalId: stableGoalId,
      canonicalContext,
      fingerprint: digest(stableGoalBookJson(canonicalContext)),
    },
    claimedGoalIds: [stableGoalId],
    claimedGoalCount: 1,
    explicitlyExcludedDisputedGoalIds: [disputedGoalId],
    synthesisManifestPath: synthesisRelativeToBatch,
    synthesisManifestDigest: digest(synthesisBytes),
    synthesisManifestFingerprint: synthesisManifest.manifestFingerprint,
    resolutionIndexPath: indexRelativeToBatch,
    resolutionIndexDigest: digest(indexBytes),
    noCentralRolloutRegistration: true,
    safeguards: {
      sourceInputsAndOutputsByteBound: true,
      exactKeepKeepDecisionPairRequired: true,
      bothIndependentReviewRecordsBound: true,
      reviewedBilingualTextAndCanonicalContextMustRemainCurrent: true,
      fullAtlasPageMustRemainExactCurrent: true,
      disputedGoalMustRemainExcluded: true,
      individualResolutionFreshlyValidated: true,
      openAiReviewFreezeRequiredBeforeWrite: true,
      centralRegistrationPerformed: false,
    },
  } as const
  const materializationPlanDigest = digest(jsonBytes({
    sourcePins,
    outputs: outputsBeforeReceipt.map(({ path, bytes }) => ({
      path: relative(repositoryRoot, absolute(path)),
      digest: digest(bytes),
    })),
    receiptPath: receiptRelativePath,
    receiptBody,
  }))
  const receiptBytes = jsonBytes({ ...receiptBody, materializationPlanDigest })

  if (write) {
    execFileSync(process.execPath, ['scripts/check_openai_plugin_review_freeze.mjs'], {
      cwd: repositoryRoot,
      stdio: 'inherit',
    })
  }
  await writeAllOrRequireExact([
    ...outputsBeforeReceipt,
    { path: receiptRelativePath, bytes: receiptBytes },
  ])
  console.log(
    `Physics B033x stable-one carryover ${write ? 'materialized' : 'valid'}: goals=1; synthesis=${digest(synthesisBytes)}; resolution=${digest(resolutionBytes)}; index=${digest(indexBytes)}; receipt=${digest(receiptBytes)}`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
