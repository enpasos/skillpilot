import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
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
type RecordPin = { recordId: string; recordDigest: GoalDescriptionSynthesisDigest }
type AuthoringDecision = {
  goalId: string
  expectedDecisions: ['keep', 'keep']
  evidenceRound: 'first' | 'second'
  records: { first: RecordPin; second: RecordPin }
  rationaleDe: string
  rationaleEn: string
}
type CarryoverAuthoring = {
  schemaVersion: 1
  artifactType: 'goal-description-stable-current-carryover-authoring-v1'
  carryoverId: string
  synthesizedBy: string
  sourceRoundPins: {
    first: { recordsDigest: GoalDescriptionSynthesisDigest; runDigest: GoalDescriptionSynthesisDigest }
    second: { recordsDigest: GoalDescriptionSynthesisDigest; runDigest: GoalDescriptionSynthesisDigest }
  }
  excludedGoalIds: string[]
  decisions: AuthoringDecision[]
}

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const write = process.argv.includes('--write')
const unknownArguments = process.argv.slice(2).filter((argument) => argument !== '--write')
if (unknownArguments.length > 0) throw new Error(`Unknown arguments: ${unknownArguments.join(', ')}`)

const rolloutRoot = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-05'
const batchName = 'batch-032r-adjudicated-final-recheck-10-v1'
const batchDirectory = `${rolloutRoot}/${batchName}`
const configPath = `${rolloutRoot}/${batchName}.config.json`
const batchManifestPath = `${batchDirectory}/batch-manifest.json`
const dualSummaryPath = `${batchDirectory}/dual-summary.json`
const authoringRelativePath = 'stable-current-carryover-9-v1.authoring.json'
const authoringPath = `${batchDirectory}/${authoringRelativePath}`
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const semanticKindLedgerPath = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const resultStem = 'mathematik-rollout-v1-batch-032r-adjudicated-final-recheck-10-v1-20260905-first-pass'
const roundARecordsPath = `${batchDirectory}/round-a/results/${resultStem}-a.batch-001.records.jsonl`
const roundARunPath = `${batchDirectory}/round-a/results/${resultStem}-a.batch-001.run.json`
const roundBRecordsPath = `${batchDirectory}/round-b/results/${resultStem}-b.batch-001.records.jsonl`
const roundBRunPath = `${batchDirectory}/round-b/results/${resultStem}-b.batch-001.run.json`
const outputStem = 'stable-current-carryover-9-v1'
const synthesisRelativePath = `synthesis-decisions.${outputStem}.json`
const synthesisPath = `${batchDirectory}/${synthesisRelativePath}`
const resolutionDirectoryName = `resolutions-${outputStem}`
const indexPath = `${batchDirectory}/resolution-index.${outputStem}.json`
const receiptPath = `${batchDirectory}/${outputStem}.compatibility-receipt.json`

const sourcePins = {
  config: '6a8cc25344181abe8fb4c788d49882265fc64de476e38ca69093882fe83eb430',
  batchManifest: '76aa52b9d09d2ba900d27298ec12a1ab3e0aafac3d9325adcc8678ace86dadc0',
  dualSummary: 'e73666deadfca5700984971e7aa9ff2cce56ba32a7918be805eaa2e4fd802150',
  roundARecords: '033ccb404485764736226d360cb246521004432b661d9b4e7ec2d39ca7f45a40',
  roundARun: '15fe359807b8c078cde398c8d08239dad97a051bcea132a5fd3d5134eb6b02e8',
  roundBRecords: 'f3143b04c4fb0da1b57bfe97c06c2eb64733e1b98e554d092a43e93a69bbbfd7',
  roundBRun: '08d50ca1635d4637bea74187e1e002830a3b1d189ecf978d91b7639db0f2e159',
  canonical: '61f4852a1ec760ad86d7bacb8c168cac17fedfcf86195d8b3d061c931c0dea4c',
  semanticKinds: '384328a7ba3c333276a3f5b09403f07013e57ebaa1fe753bd5247da649b630be',
} as const

const campaignGoalIds = [
  '7676b0f9-340d-4a91-ab1f-92745a8f88db',
  'f9e21454-857c-5a6a-8367-32a34fc0026b',
  '66077296-a8f8-4645-938b-7c3424cb2f14',
  'eb28b403-f9fc-57ea-a793-b4555596fdd7',
  '97b3232d-b89f-48b8-9fa1-7a25a1bdbb3d',
  'c8818eae-0c4d-4fa1-9085-04a9c95a668b',
  '0c8c1ae9-135e-4fe5-bf67-e497eb3a9909',
  '786ae588-a4fb-40e6-a7f5-113cfc2bfd0f',
  '5bced7dc-6557-4af1-9e70-d87f850d3b7f',
  'e0c3359d-7d8a-4d01-a25e-a8cd5ebce90e',
] as const
const excludedGoalId = '5bced7dc-6557-4af1-9e70-d87f850d3b7f'
const claimedGoalIds = campaignGoalIds.filter((goalId) => goalId !== excludedGoalId)

const absolute = (path: string): string => resolve(repositoryRoot, path)
const sha256Hex = (value: Buffer | string): string => createHash('sha256').update(value).digest('hex')
const sha256 = (value: Buffer | string): GoalDescriptionSynthesisDigest => `sha256:${sha256Hex(value)}`
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const sameOrdered = (left: readonly string[], right: readonly string[]): boolean => (
  left.length === right.length && left.every((value, index) => value === right[index])
)
const assertTrimmed = (value: unknown, label: string): asserts value is string => {
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
    if (current[index] && !current[index]?.equals(bytes)) {
      throw new Error(`Existing Mathematics B032r stable9 artifact is stale: ${path}`)
    }
    if (!current[index] && !write) throw new Error(`Missing Mathematics B032r stable9 artifact: ${path}`)
  })
  if (!write) return
  await Promise.all(artifacts.flatMap(({ path, bytes }, index) => (
    current[index]
      ? []
      : [mkdir(dirname(absolute(path)), { recursive: true })
          .then(() => writeFile(absolute(path), bytes, { flag: 'wx' }))]
  )))
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
    dual,
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
    materializeGoalDescriptionRolloutBatchDualSummary(absolute(configPath), false),
    readBound(configPath, sourcePins.config),
    readBound(batchManifestPath, sourcePins.batchManifest),
    readBound(dualSummaryPath, sourcePins.dualSummary),
    readBound(roundARecordsPath, sourcePins.roundARecords),
    readBound(roundARunPath, sourcePins.roundARun),
    readBound(roundBRecordsPath, sourcePins.roundBRecords),
    readBound(roundBRunPath, sourcePins.roundBRun),
    readBound(canonicalPath, sourcePins.canonical),
    readBound(semanticKindLedgerPath, sourcePins.semanticKinds),
    readFile(absolute(authoringPath)),
  ])
  if (!dual.bytes.equals(dualSummaryBytes)) throw new Error('Mathematics B032r dual summary is not exact-current')

  const landscape = JSON.parse(canonicalBytes.toString('utf8')) as { subject?: string; goals?: JsonGoal[] }
  if (landscape.subject !== 'Mathematik' || !Array.isArray(landscape.goals)) {
    throw new Error('Current canonical Mathematics landscape is invalid')
  }
  const semanticLedger = JSON.parse(semanticKindBytes.toString('utf8')) as {
    documentType?: unknown
    sourceLandscapePath?: unknown
    counts?: { curricularAtomic?: unknown; total?: unknown }
    decisions?: Array<{ goalId?: unknown; semanticKind?: unknown; decisionStatus?: unknown }>
  }
  const curriculumAtomicDenominator = 794
  const curricularAtomicIds = new Set((semanticLedger.decisions ?? []).flatMap((decision) => (
    decision.semanticKind === 'curricularAtomic'
      && decision.decisionStatus === 'authoritative'
      && typeof decision.goalId === 'string'
      ? [decision.goalId]
      : []
  )))
  if (
    semanticLedger.documentType !== 'semantic-kind-ledger'
    || semanticLedger.sourceLandscapePath !== canonicalPath
    || semanticLedger.counts?.curricularAtomic !== curriculumAtomicDenominator
    || semanticLedger.counts?.total !== landscape.goals.length
    || curricularAtomicIds.size !== curriculumAtomicDenominator
    || claimedGoalIds.some((goalId) => !curricularAtomicIds.has(goalId))
  ) throw new Error('Mathematics B032r semantic-kind binding or curricularAtomic denominator changed')

  const authoring = JSON.parse(authoringBytes.toString('utf8')) as CarryoverAuthoring
  if (
    authoring.schemaVersion !== 1
    || authoring.artifactType !== 'goal-description-stable-current-carryover-authoring-v1'
    || authoring.carryoverId !== 'mathematik-b032r-stable-current-carryover-9-v1-20260905'
  ) throw new Error('Mathematics B032r stable9 authoring identity is invalid')
  assertTrimmed(authoring.synthesizedBy, 'synthesizedBy')
  const expectedRoundPins = {
    first: { recordsDigest: sha256(roundARecordsBytes), runDigest: sha256(roundARunBytes) },
    second: { recordsDigest: sha256(roundBRecordsBytes), runDigest: sha256(roundBRunBytes) },
  }
  if (stableGoalBookJson(authoring.sourceRoundPins) !== stableGoalBookJson(expectedRoundPins)) {
    throw new Error('Mathematics B032r authoring does not bind both exact round result and run bytes')
  }
  if (
    !sameOrdered(authoring.excludedGoalIds, [excludedGoalId])
    || !sameOrdered(authoring.decisions.map(({ goalId }) => goalId), claimedGoalIds)
    || dual.summary.goalCount !== campaignGoalIds.length
    || !sameOrdered(dual.prepared.manifest.goalIds, campaignGoalIds)
    || !sameOrdered(dual.summary.goals.map(({ goalId }) => goalId), campaignGoalIds)
  ) throw new Error('Mathematics B032r no longer has the exact ordered 9/1 bounded partition')
  const excluded = dual.summary.goals.find(({ goalId }) => goalId === excludedGoalId)
  if (excluded?.firstDecision !== 'split_review' || excluded.secondDecision !== 'keep') {
    throw new Error(`${excludedGoalId}: disputed Mathematics B032r decision pair drifted`)
  }

  const expectedGoals: GoalDescriptionRolloutSynthesisExpectedGoal[] = []
  const sources = new Map<string, {
    first: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
    second: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
  }>()
  const currentCanonicalContexts: Array<Record<string, unknown>> = []
  for (const [index, goalId] of claimedGoalIds.entries()) {
    const authored = authoring.decisions[index]
    const firstResult = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.first, goalId, label: 'First' })
    const secondResult = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.second, goalId, label: 'Second' })
    const errors = [...firstResult.errors, ...secondResult.errors]
    if (errors.length > 0 || !firstResult.source?.record || !secondResult.source?.record) {
      throw new Error(`${goalId}: ${errors.join(' | ') || 'missing exact source records'}`)
    }
    const first = firstResult.source
    const second = secondResult.source
    if (!authored || authored.goalId !== goalId) throw new Error(`${goalId}: missing aligned authoring decision`)
    if (
      first.decision !== 'keep'
      || second.decision !== 'keep'
      || authored.expectedDecisions[0] !== 'keep'
      || authored.expectedDecisions[1] !== 'keep'
      || first.binding.recordId !== authored.records.first.recordId
      || first.binding.recordDigest !== authored.records.first.recordDigest
      || second.binding.recordId !== authored.records.second.recordId
      || second.binding.recordDigest !== authored.records.second.recordDigest
    ) throw new Error(`${goalId}: exact KEEP/KEEP or per-record digest binding drifted`)
    for (const [round, source] of [['first', first], ['second', second]] as const) {
      if (
        source.record.evidenceProfileContract !== 'positive-understanding-evidence-v2'
        || source.record.evidenceProfileRecommendation !== 'create'
        || source.record.recordStatus !== 'candidate'
        || source.record.reviewAuthority !== 'ai_candidate'
      ) throw new Error(`${goalId}: ${round} record is not a V2 create AI candidate`)
    }
    if (authored.evidenceRound !== 'first' && authored.evidenceRound !== 'second') {
      throw new Error(`${goalId}: evidenceRound must select one exact independent record`)
    }
    assertTrimmed(authored.rationaleDe, `${goalId}.rationaleDe`)
    assertTrimmed(authored.rationaleEn, `${goalId}.rationaleEn`)

    const firstInput = dual.first.input.goals.find((goal) => goal.goalId === goalId)
    const secondInput = dual.second.input.goals.find((goal) => goal.goalId === goalId)
    const canonicalGoal = landscape.goals.find((goal) => goal.id === goalId)
    if (!firstInput || !secondInput || !canonicalGoal) throw new Error(`${goalId}: missing input or canonical goal`)
    const canonicalContext = buildGoalDescriptionCanonicalContext(canonicalGoal)
    const reviewContextFingerprint = fingerprintGoalDescriptionReviewContext(firstInput)
    if (
      stableGoalBookJson(firstInput) !== stableGoalBookJson(secondInput)
      || stableGoalBookJson(firstInput.canonicalContext) !== stableGoalBookJson(canonicalContext)
      || stableGoalBookJson(inputText(firstInput)) !== stableGoalBookJson(currentText(canonicalGoal))
      || first.binding.goalReviewContextFingerprint !== reviewContextFingerprint
      || second.binding.goalReviewContextFingerprint !== reviewContextFingerprint
    ) throw new Error(`${goalId}: reviewed bilingual text or direct canonical context is not exact-current`)

    expectedGoals.push({
      goalId,
      effectiveSemanticKind: 'curricularAtomic',
      goalFingerprint: firstInput.goalFingerprint as GoalDescriptionSynthesisDigest,
      pageFingerprint: firstInput.pageFingerprint as GoalDescriptionSynthesisDigest,
      goalReviewContextFingerprint: reviewContextFingerprint,
      finalText: inputText(firstInput),
      firstSource: first,
      secondSource: second,
    })
    sources.set(goalId, { first, second })
    currentCanonicalContexts.push({
      goalId,
      canonicalContext,
      canonicalContextFingerprint: sha256(stableGoalBookJson(canonicalContext)),
    })
  }

  const completedAtValues = [...dual.first.resultPairs, ...dual.second.resultPairs]
    .map(({ run }) => Date.parse(run.completedAt))
  if (completedAtValues.length === 0 || completedAtValues.some((value) => !Number.isFinite(value))) {
    throw new Error('Mathematics B032r source runs must have valid completion timestamps')
  }
  const synthesizedAt = new Date(Math.max(...completedAtValues) + 1000).toISOString()
  const firstGoal = expectedGoals[0]
  if (!firstGoal) throw new Error('Mathematics B032r stable9 scope is empty')
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
  const manifestId = 'mathematik-b032r-stable-current-carryover-9-v1-openai-codex-20260905'
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
      if (!authored || authored.goalId !== goal.goalId) throw new Error(`${goal.goalId}: missing aligned synthesis authoring`)
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
        records: authored.records,
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
    throw new Error(`Mathematics B032r stable9 synthesis manifest: ${manifestValidation.errors.join(' | ')}`)
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
      resolutionId: `mathematics-b032r-${outputStem}-resolution-${goal.goalId}`,
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
    const relativePath = `${resolutionDirectoryName}/${goal.goalId}.resolution.json`
    resolutionArtifacts.push({ path: `${batchDirectory}/${relativePath}`, bytes })
    indexEntries.push({
      goalId: goal.goalId,
      titleDe: resolution.goal.finalText.titleDe,
      groupId: dual.prepared.manifest.batchId,
      decision: resolution.decision,
      resolutionPath: relativePath,
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
    receiptId: 'mathematik-b032r-stable-current-carryover-9-v1-20260905',
    purpose: `Fail-closed bounded materialization of exactly nine exact-current KEEP/KEEP Mathematics B032r goals; disputed split-review goal ${excludedGoalId} remains excluded.`,
    source: {
      configPath,
      configDigest: sha256(configBytes),
      batchManifestPath,
      batchManifestDigest: sha256(batchManifestBytes),
      dualSummaryPath,
      dualSummaryDigest: sha256(dualSummaryBytes),
      roundA: { recordsPath: roundARecordsPath, recordsDigest: sha256(roundARecordsBytes), runPath: roundARunPath, runDigest: sha256(roundARunBytes) },
      roundB: { recordsPath: roundBRecordsPath, recordsDigest: sha256(roundBRecordsBytes), runPath: roundBRunPath, runDigest: sha256(roundBRunBytes) },
      canonicalPath,
      canonicalDigest: sha256(canonicalBytes),
      semanticKindLedgerPath,
      semanticKindLedgerDigest: sha256(semanticKindBytes),
      authoringPath: authoringRelativePath,
      authoringDigest: sha256(authoringBytes),
    },
    sourceCampaignGoalCount: campaignGoalIds.length,
    claimedGoalIds: [...claimedGoalIds],
    claimedGoalCount: claimedGoalIds.length,
    exactKeepKeepGoalCount: claimedGoalIds.length,
    explicitlyExcludedGoals: [{ goalId: excludedGoalId, firstDecision: 'split_review', secondDecision: 'keep' }],
    evidenceContract: 'positive-understanding-evidence-v2',
    evidenceRecommendation: 'create',
    evidenceRoundByGoalId: Object.fromEntries(authoring.decisions.map(({ goalId, evidenceRound }) => [goalId, evidenceRound])),
    exactRecordBindings: Object.fromEntries(authoring.decisions.map(({ goalId, records }) => [goalId, records])),
    currentCanonicalContexts,
    currentCurriculumAtomicDenominator: curriculumAtomicDenominator,
    synthesisManifestPath: synthesisRelativePath,
    synthesisManifestDigest: sha256(synthesisBytes),
    synthesisManifestFingerprint: synthesisManifest.manifestFingerprint,
    resolutionIndexPath: `resolution-index.${outputStem}.json`,
    resolutionIndexDigest: sha256(indexBytes),
    noCentralRolloutRegistration: true,
    safeguards: {
      allSourceArtifactsByteBound: true,
      bothExactRecordDigestsBoundPerGoal: true,
      bothRecordsRequirePositiveUnderstandingEvidenceV2Create: true,
      exactCurrentBilingualTextAndDirectContextRequired: true,
      exactKeepKeepDecisionPairsRequired: true,
      disputedSplitReviewGoalExcluded: true,
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
    `${write ? 'Materialized' : 'Verified'} Mathematics B032r stable9: strict=${indexEntries.length}/9; excluded=1; denominator=${curriculumAtomicDenominator}; index=${indexPath}`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
