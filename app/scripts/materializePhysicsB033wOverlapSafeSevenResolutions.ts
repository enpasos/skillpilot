import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
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
type AuthoringDecision = {
  goalId: string
  evidenceRound: 'first' | 'second'
  rationaleDe: string
  rationaleEn: string
}
type CarryoverAuthoring = {
  schemaVersion: 1
  artifactType: 'goal-description-stable-current-carryover-authoring-v1'
  carryoverId: string
  synthesizedBy: string
  excludedGoalIds: string[]
  decisions: AuthoringDecision[]
}

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const write = process.argv.includes('--write')
const unknownArguments = process.argv.slice(2).filter((argument) => argument !== '--write')
if (unknownArguments.length > 0) throw new Error(`Unknown arguments: ${unknownArguments.join(', ')}`)

const batchName = 'batch-033w-final-adjudication-context-recheck-10-v1'
const rolloutDirectory = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-05',
)
const batchDirectory = join(rolloutDirectory, batchName)
const configPath = join(rolloutDirectory, `${batchName}.config.json`)
const batchManifestPath = join(batchDirectory, 'batch-manifest.json')
const dualSummaryPath = join(batchDirectory, 'dual-summary.json')
const authoringPath = join(batchDirectory, 'overlap-safe-stable-current-carryover-7-v1.authoring.json')
const canonicalPath = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
)
const semanticKindLedgerPath = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
)
const outputStem = 'overlap-safe-stable-current-carryover-7-v1'
const synthesisRelativePath = `synthesis-decisions.${outputStem}.json`
const synthesisPath = join(batchDirectory, synthesisRelativePath)
const resolutionDirectoryName = `resolutions-${outputStem}`
const indexPath = join(batchDirectory, `resolution-index.${outputStem}.json`)
const receiptPath = join(batchDirectory, `${outputStem}.compatibility-receipt.json`)
const overlapOwnerResolutionIndexPath = join(
  rolloutDirectory,
  'batch-033t-final-corrections-context-recheck-14-v1/resolution-index.stable-current-carryover-7-v1.json',
)

const campaignGoalIds = [
  '5fda8623-69e0-5503-9c6d-86d054a8cf91',
  '09f2cdbd-64e0-55d2-ada7-1190f4fd50df',
  '330808f6-789a-583d-86df-e271a7683d8b',
  '3aaac6ad-948e-502a-9d49-ce40db0f2ca3',
  '8fbae050-c5c9-52b6-9983-2c366e9c8ade',
  '0b08aed8-3c0f-5b38-844c-1bb363abbf68',
  'b2fb9a25-4d26-5cf2-a917-823909dcb6bd',
  '74a74132-fa39-541c-8d3c-696cf228452d',
  '8d34228c-da38-5c1e-97cc-571f3eafb9f4',
  'a684bec1-ba59-59d0-98d2-4ca37236f64c',
] as const

const claimedGoalIds = [
  '5fda8623-69e0-5503-9c6d-86d054a8cf91',
  '09f2cdbd-64e0-55d2-ada7-1190f4fd50df',
  '330808f6-789a-583d-86df-e271a7683d8b',
  '8fbae050-c5c9-52b6-9983-2c366e9c8ade',
  '0b08aed8-3c0f-5b38-844c-1bb363abbf68',
  '74a74132-fa39-541c-8d3c-696cf228452d',
  '8d34228c-da38-5c1e-97cc-571f3eafb9f4',
] as const

const overlapExcludedGoalIds = [
  '3aaac6ad-948e-502a-9d49-ce40db0f2ca3',
] as const

const changedExcludedGoalIds = [
  'b2fb9a25-4d26-5cf2-a917-823909dcb6bd',
  'a684bec1-ba59-59d0-98d2-4ca37236f64c',
] as const
const excludedGoalIds = [...overlapExcludedGoalIds, ...changedExcludedGoalIds] as const
const expectedExcludedDecisions = new Map<string, readonly [string, string]>([
  ['3aaac6ad-948e-502a-9d49-ce40db0f2ca3', ['keep', 'keep']],
  ['b2fb9a25-4d26-5cf2-a917-823909dcb6bd', ['revise', 'revise']],
  ['a684bec1-ba59-59d0-98d2-4ca37236f64c', ['keep', 'revise']],
])

const sha256 = (value: Buffer | string): GoalDescriptionSynthesisDigest => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const sameOrdered = (left: readonly string[], right: readonly string[]): boolean => (
  left.length === right.length && left.every((value, index) => value === right[index])
)
const sameMembers = (left: readonly string[], right: readonly string[]): boolean => (
  left.length === right.length && [...left].sort().every((value, index) => value === [...right].sort()[index])
)
const assertTrimmed = (value: unknown, label: string): asserts value is string => {
  if (typeof value !== 'string' || value.length === 0 || value.trim() !== value) {
    throw new Error(`${label} must be a non-blank trimmed string`)
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
const readOptional = async (path: string): Promise<Buffer | null> => {
  try {
    return await readFile(path)
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}
const writeAllOrRequireExact = async (artifacts: Array<{ path: string; bytes: Buffer }>): Promise<void> => {
  const current = await Promise.all(artifacts.map(({ path }) => readOptional(path)))
  artifacts.forEach(({ path, bytes }, index) => {
    if (current[index] && !current[index]?.equals(bytes)) throw new Error(`Existing Physics B033w overlap-safe stable7 artifact is stale: ${path}`)
    if (!current[index] && !write) throw new Error(`Missing Physics B033w overlap-safe stable7 artifact: ${path}`)
  })
  if (!write) return
  await Promise.all(artifacts.flatMap(({ path, bytes }, index) => (
    current[index]
      ? []
      : [mkdir(dirname(path), { recursive: true }).then(() => writeFile(path, bytes, { flag: 'wx' }))]
  )))
}

const main = async (): Promise<void> => {
  const [
    dual,
    configBytes,
    batchManifestBytes,
    dualSummaryBytes,
    canonicalBytes,
    semanticKindBytes,
    authoringBytes,
    overlapOwnerResolutionIndexBytes,
  ] = await Promise.all([
    materializeGoalDescriptionRolloutBatchDualSummary(configPath, false),
    readFile(configPath),
    readFile(batchManifestPath),
    readFile(dualSummaryPath),
    readFile(canonicalPath),
    readFile(semanticKindLedgerPath),
    readFile(authoringPath),
    readFile(overlapOwnerResolutionIndexPath),
  ])
  if (!dual.bytes.equals(dualSummaryBytes)) throw new Error('Physics B033w dual summary is not exact-current')
  const landscape = JSON.parse(canonicalBytes.toString('utf8')) as { subject?: string; goals?: JsonGoal[] }
  const ledger = JSON.parse(semanticKindBytes.toString('utf8')) as {
    sourceLandscapePath?: string
    counts?: { curricularAtomic?: number }
    decisions?: Array<{ goalId?: string; semanticKind?: string; decisionStatus?: string }>
  }
  const authoring = JSON.parse(authoringBytes.toString('utf8')) as CarryoverAuthoring
  const overlapOwnerResolutionIndex = JSON.parse(overlapOwnerResolutionIndexBytes.toString('utf8')) as {
    resolutions?: Array<{
      goalId?: string
      decision?: string
      strictDescriptionComplete?: boolean
      resolutionPath?: string
      resolutionDigest?: string
    }>
  }
  if (landscape.subject !== 'Physik' || !Array.isArray(landscape.goals)) {
    throw new Error('Current canonical Physics landscape is invalid')
  }
  if (
    authoring.schemaVersion !== 1
    || authoring.artifactType !== 'goal-description-stable-current-carryover-authoring-v1'
    || authoring.carryoverId !== 'physik-b033w-overlap-safe-stable-current-carryover-7-v1-20260905'
  ) throw new Error('Physics B033w overlap-safe stable7 authoring identity is invalid')
  assertTrimmed(authoring.synthesizedBy, 'synthesizedBy')
  if (
    !sameOrdered(authoring.excludedGoalIds, excludedGoalIds)
    || !sameOrdered(authoring.decisions.map(({ goalId }) => goalId), claimedGoalIds)
  ) throw new Error('Physics B033w overlap-safe stable7 authoring scope or order is invalid')
  if (
    dual.summary.goalCount !== campaignGoalIds.length
    || !sameOrdered(dual.prepared.manifest.goalIds, campaignGoalIds)
    || !sameOrdered(dual.summary.goals.map(({ goalId }) => goalId), campaignGoalIds)
    || !sameOrdered(campaignGoalIds.filter((goalId) => claimedGoalIds.includes(goalId as typeof claimedGoalIds[number])), claimedGoalIds)
    || !sameOrdered(campaignGoalIds.filter((goalId) => excludedGoalIds.includes(goalId as typeof excludedGoalIds[number])), excludedGoalIds)
    || !sameMembers([...claimedGoalIds, ...excludedGoalIds], campaignGoalIds)
  ) throw new Error('Physics B033w campaign no longer has the exact overlap-safe 7/3 bounded partition')

  const overlapOwnerResolution = overlapOwnerResolutionIndex.resolutions?.filter(
    ({ goalId }) => goalId === overlapExcludedGoalIds[0],
  ) ?? []
  if (
    overlapOwnerResolution.length !== 1
    || overlapOwnerResolution[0]?.decision !== 'keep_current'
    || overlapOwnerResolution[0].strictDescriptionComplete !== true
    || overlapOwnerResolution[0].resolutionPath !== 'resolutions-stable-current-carryover-7-v1/3aaac6ad-948e-502a-9d49-ce40db0f2ca3.resolution.json'
    || overlapOwnerResolution[0].resolutionDigest !== 'sha256:35b7df6119a9e39bd1a44aa8e89ff7f64bd9754b219f7ff66c0b58b0c2a4ae03'
  ) throw new Error('Physics B033w overlap goal is not exactly owned by the existing strict B033t resolution')

  const curricularAtomicIds = new Set((ledger.decisions ?? []).flatMap((decision) => (
    decision.semanticKind === 'curricularAtomic'
      && decision.decisionStatus === 'authoritative'
      && typeof decision.goalId === 'string'
      ? [decision.goalId]
      : []
  )))
  const curriculumAtomicDenominator = 461
  if (
    ledger.counts?.curricularAtomic !== curriculumAtomicDenominator
    || curricularAtomicIds.size !== curriculumAtomicDenominator
    || claimedGoalIds.some((goalId) => !curricularAtomicIds.has(goalId))
  ) throw new Error('Physics B033w semantic-kind binding or curricularAtomic denominator changed')

  for (const goalId of claimedGoalIds) {
    const summary = dual.summary.goals.find((goal) => goal.goalId === goalId)
    if (summary?.firstDecision !== 'keep' || summary.secondDecision !== 'keep') {
      throw new Error(`${goalId}: expected exact KEEP/KEEP decisions`)
    }
  }
  for (const goalId of excludedGoalIds) {
    const expected = expectedExcludedDecisions.get(goalId)
    const summary = dual.summary.goals.find((goal) => goal.goalId === goalId)
    if (!expected || summary?.firstDecision !== expected[0] || summary.secondDecision !== expected[1]) {
      throw new Error(`${goalId}: excluded decision pair drifted`)
    }
  }

  for (const goalId of changedExcludedGoalIds) {
    const reviewed = dual.first.input.goals.find((goal) => goal.goalId === goalId)
    const canonical = landscape.goals.find((goal) => goal.id === goalId)
    if (!reviewed || !canonical) throw new Error(`${goalId}: missing changed exclusion source`)
    const textChanged = stableGoalBookJson(inputText(reviewed)) !== stableGoalBookJson(currentText(canonical))
    const contextChanged = stableGoalBookJson(reviewed.canonicalContext)
      !== stableGoalBookJson(buildGoalDescriptionCanonicalContext(canonical))
    if (!textChanged && !contextChanged) {
      throw new Error(`${goalId}: expected changed exclusion is unexpectedly exact-current`)
    }
  }
  const expectedGoals: GoalDescriptionRolloutSynthesisExpectedGoal[] = []
  const sources = new Map<string, {
    first: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
    second: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
  }>()
  const currentPrerequisiteContexts: Array<Record<string, unknown>> = []
  for (const goalId of claimedGoalIds) {
    const first = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.first, goalId, label: 'First' })
    const second = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.second, goalId, label: 'Second' })
    if (first.errors.length > 0 || second.errors.length > 0 || !first.source?.record || !second.source?.record) {
      throw new Error(`${goalId}: source extraction failed: ${[...first.errors, ...second.errors].join(' | ')}`)
    }
    const firstInput = dual.first.input.goals.find((goal) => goal.goalId === goalId)
    const secondInput = dual.second.input.goals.find((goal) => goal.goalId === goalId)
    const canonicalGoal = landscape.goals.find((goal) => goal.id === goalId)
    if (!firstInput || !secondInput || !canonicalGoal) throw new Error(`${goalId}: missing review input or canonical goal`)
    if (
      stableGoalBookJson(firstInput) !== stableGoalBookJson(secondInput)
      || stableGoalBookJson(firstInput.canonicalContext) !== stableGoalBookJson(buildGoalDescriptionCanonicalContext(canonicalGoal))
      || stableGoalBookJson(inputText(firstInput)) !== stableGoalBookJson(currentText(canonicalGoal))
    ) throw new Error(`${goalId}: reviewed bilingual text or direct canonical context is not exact-current`)

    const page = firstInput.reviewContext.page
    const reviewPrerequisites = [...page.requires, ...page.externalPrerequisites]
    const reviewPrerequisiteIds = reviewPrerequisites.map(({ goalId: prerequisiteId }) => prerequisiteId)
    if (!sameMembers(reviewPrerequisiteIds, firstInput.canonicalContext.requires)) {
      throw new Error(`${goalId}: review page prerequisite references disagree with canonical requires`)
    }
    const prerequisites = reviewPrerequisites.map((reference) => {
      const canonicalPrerequisite = landscape.goals?.find((goal) => goal.id === reference.goalId)
      if (!canonicalPrerequisite || canonicalPrerequisite.title !== reference.title) {
        throw new Error(`${goalId}: prerequisite ${reference.goalId} title/context drifted`)
      }
      return {
        goalId: reference.goalId,
        titleDe: canonicalPrerequisite.title,
        canonicalContextFingerprint: sha256(stableGoalBookJson(buildGoalDescriptionCanonicalContext(canonicalPrerequisite))),
      }
    })
    currentPrerequisiteContexts.push({ goalId, prerequisites })

    const reviewContextFingerprint = fingerprintGoalDescriptionReviewContext(firstInput)
    if (
      first.source.binding.goalReviewContextFingerprint !== reviewContextFingerprint
      || second.source.binding.goalReviewContextFingerprint !== reviewContextFingerprint
    ) throw new Error(`${goalId}: review-context source binding drifted`)
    expectedGoals.push({
      goalId,
      effectiveSemanticKind: 'curricularAtomic',
      goalFingerprint: firstInput.goalFingerprint as GoalDescriptionSynthesisDigest,
      pageFingerprint: firstInput.pageFingerprint as GoalDescriptionSynthesisDigest,
      goalReviewContextFingerprint: reviewContextFingerprint,
      finalText: inputText(firstInput),
      firstSource: first.source,
      secondSource: second.source,
    })
    sources.set(goalId, { first: first.source, second: second.source })
  }

  const completionValues = [...dual.first.resultPairs, ...dual.second.resultPairs]
    .map(({ run }) => Date.parse(run.completedAt))
  if (completionValues.length === 0 || completionValues.some((value) => !Number.isFinite(value))) {
    throw new Error('Physics B033w source runs must have valid completion timestamps')
  }
  const synthesizedAt = new Date(Math.max(...completionValues) + 1000).toISOString()
  const firstGoal = expectedGoals[0]
  if (!firstGoal) throw new Error('Physics B033w overlap-safe stable7 scope is empty')
  const expectedBindings = {
    batch: {
      batchId: dual.prepared.manifest.batchId,
      batchManifestDigest: sha256(batchManifestBytes),
      configDigest: sha256(configBytes),
      bundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint,
      bookDigest: dual.first.input.bookDigest as GoalDescriptionSynthesisDigest,
      reviewInputFingerprint: dual.first.input.reviewInputFingerprint as GoalDescriptionSynthesisDigest,
      dualSummaryDigest: sha256(dual.bytes),
      canonicalLandscapeDigest: sha256(canonicalBytes),
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
  const manifestId = 'physik-b033w-overlap-safe-stable-current-carryover-7-v1-openai-codex-20260905'
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
    decisions: expectedGoals.map((goal, index) => {
      const authored = authoring.decisions[index]
      const source = sources.get(goal.goalId)
      if (!authored || authored.goalId !== goal.goalId || !source?.first.record || !source.second.record) {
        throw new Error(`${goal.goalId}: incomplete aligned authoring or source records`)
      }
      assertTrimmed(authored.rationaleDe, `${goal.goalId}.rationaleDe`)
      assertTrimmed(authored.rationaleEn, `${goal.goalId}.rationaleEn`)
      return {
        decisionId: `${manifestId}-decision-${String(index + 1).padStart(3, '0')}`,
        goalId: goal.goalId,
        effectiveSemanticKind: goal.effectiveSemanticKind,
        goalFingerprint: goal.goalFingerprint,
        pageFingerprint: goal.pageFingerprint,
        goalReviewContextFingerprint: goal.goalReviewContextFingerprint,
        finalText: goal.finalText,
        resolutionDecision: 'keep_current' as const,
        evidenceRound: authored.evidenceRound,
        records: {
          first: { recordId: source.first.binding.recordId, recordDigest: source.first.binding.recordDigest },
          second: { recordId: source.second.binding.recordId, recordDigest: source.second.binding.recordDigest },
        },
        rationaleDe: authored.rationaleDe,
        rationaleEn: authored.rationaleEn,
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
  if (manifestValidation.errors.length > 0) {
    throw new Error(`Physics B033w overlap-safe stable7 synthesis invalid: ${manifestValidation.errors.join(' | ')}`)
  }
  const synthesisBytes = jsonBytes(synthesisManifest)

  const resolutionArtifacts: Array<{ path: string; bytes: Buffer }> = []
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
      resolutionId: `physics-b033w-${outputStem}-resolution-${goal.goalId}`,
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
        manifestDigest: sha256(synthesisBytes),
        manifestFingerprint: synthesisManifest.manifestFingerprint,
        decisionId: decision.decisionId,
      },
    })
    const validation = await validateGoalDescriptionDualRoundResolution({
      resolution,
      dualSummary: dual.summary,
      dualSummaryBytes: dual.bytes,
      currentInput: dual.first.input,
      landscape: landscape as { subject: string; goals: JsonGoal[] },
      first: dual.first,
      second: dual.second,
      synthesisDecisionManifestArtifact: {
        manifest: synthesisManifest,
        manifestBytes: synthesisBytes,
        manifestPath: synthesisRelativePath,
      },
    })
    if (validation.errors.length > 0 || !validation.strictDescriptionComplete) {
      throw new Error(`${goal.goalId}: ${validation.errors.join(' | ') || 'resolution is not strict complete'}`)
    }
    const bytes = jsonBytes(resolution)
    const relativeResolutionPath = `${resolutionDirectoryName}/${goal.goalId}.resolution.json`
    resolutionArtifacts.push({ path: join(batchDirectory, relativeResolutionPath), bytes })
    indexEntries.push({
      goalId: goal.goalId,
      titleDe: resolution.goal.finalText.titleDe,
      groupId: dual.prepared.manifest.batchId,
      decision: resolution.decision,
      resolutionPath: relativeResolutionPath,
      resolutionDigest: sha256(bytes),
      resolutionFingerprint: resolution.resolutionFingerprint,
      strictDescriptionComplete: true,
    })
  }

  const index = {
    schemaVersion: 1,
    artifactSetId: `${dual.prepared.manifest.batchId}-${outputStem}`,
    subject: dual.prepared.manifest.subjectLabel,
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: indexEntries.length,
    curriculumAtomicDenominator,
    descriptionReviewPercentage: Number(((indexEntries.length / curriculumAtomicDenominator) * 100).toFixed(1)),
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
  const indexBytes = jsonBytes(index)
  const receipt = {
    schemaVersion: 1,
    receiptId: 'physik-b033w-overlap-safe-stable-current-carryover-7-v1-20260905',
    purpose: 'Fail-closed bounded materialization of exactly seven non-overlapping exact-current KEEP/KEEP Physics B033w goals; 3aaac6ad remains owned by its existing B033t strict artifacts, the two adjudicated revision targets remain excluded, and unchanged titles create no additional directly stale context.',
    sourceBatchId: dual.prepared.manifest.batchId,
    sourceCampaignGoalCount: dual.summary.goalCount,
    source: {
      configPath: `${batchName}.config.json`,
      configDigest: sha256(configBytes),
      batchManifestPath: 'batch-manifest.json',
      batchManifestDigest: sha256(batchManifestBytes),
      dualSummaryPath: 'dual-summary.json',
      dualSummaryDigest: sha256(dualSummaryBytes),
      canonicalLandscapeDigest: sha256(canonicalBytes),
      semanticKindLedgerDigest: sha256(semanticKindBytes),
      authoringPath: 'overlap-safe-stable-current-carryover-7-v1.authoring.json',
      authoringDigest: sha256(authoringBytes),
    },
    claimedGoalIds: [...claimedGoalIds],
    claimedGoalCount: claimedGoalIds.length,
    explicitlyExcludedChangedGoalIds: [...changedExcludedGoalIds],
    explicitlyExcludedOverlapGoalIds: [...overlapExcludedGoalIds],
    existingStrictOverlapOwner: {
      goalId: overlapExcludedGoalIds[0],
      resolutionIndexPath: 'batch-033t-final-corrections-context-recheck-14-v1/resolution-index.stable-current-carryover-7-v1.json',
      resolutionIndexDigest: sha256(overlapOwnerResolutionIndexBytes),
      resolutionPath: overlapOwnerResolution[0].resolutionPath,
      resolutionDigest: overlapOwnerResolution[0].resolutionDigest,
    },
    explicitlyExcludedContextStaleGoalIds: [],
    currentPrerequisiteContexts,
    synthesisManifestPath: synthesisRelativePath,
    synthesisManifestDigest: sha256(synthesisBytes),
    synthesisManifestFingerprint: synthesisManifest.manifestFingerprint,
    resolutionIndexPath: `resolution-index.${outputStem}.json`,
    resolutionIndexDigest: sha256(indexBytes),
    noCentralRolloutRegistration: true,
    safeguards: {
      exactCampaignPartitionRequired: true,
      exactKeepKeepDecisionPairsRequired: true,
      reviewedBilingualTextAndCanonicalContextMustRemainCurrent: true,
      directPrerequisiteIdsAndTitlesMustRemainCurrent: true,
      changedGoalsMustRemainExcluded: true,
      alreadyStrictOverlapMustRemainExcluded: true,
      noAdditionalDirectContextExclusionsRequiredBecauseTitlesRemainUnchanged: true,
      individualResolutionsFreshlyValidated: true,
      centralRegistrationPerformed: false,
    },
  }
  if (write) {
    execFileSync(process.execPath, ['scripts/check_openai_plugin_review_freeze.mjs'], {
      cwd: repositoryRoot,
      stdio: 'inherit',
    })
  }
  await writeAllOrRequireExact([
    { path: synthesisPath, bytes: synthesisBytes },
    ...resolutionArtifacts,
    { path: indexPath, bytes: indexBytes },
    { path: receiptPath, bytes: jsonBytes(receipt) },
  ])
  console.log(
    `${write ? 'Materialized' : 'Verified'} Physics B033w overlap-safe stable7 resolutions: strict=${indexEntries.length}/7; campaign=${dual.summary.goalCount}; index=${indexPath}`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
