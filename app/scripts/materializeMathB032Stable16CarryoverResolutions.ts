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
type Decision = 'keep' | 'revise'
type RecordPin = { recordId: string; recordDigest: GoalDescriptionSynthesisDigest }
type AuthoringDecision = {
  goalId: string
  expectedDecisions: [Decision, Decision]
  evidenceRound: 'first'
  records: { first: RecordPin; second: RecordPin }
  rationaleDe: string
  rationaleEn: string
  revisionDissent?: {
    sourceRound: 'second'
    disposition: 'rejected_keep_current'
    proposedDescriptionDe: string
    proposedDescriptionEn: string
    rationaleDe: string
    rationaleEn: string
  }
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
type SemanticKindLedger = {
  documentType?: unknown
  sourceLandscapePath?: unknown
  counts?: { curricularAtomic?: unknown; total?: unknown }
  decisions?: Array<{ goalId?: unknown; semanticKind?: unknown; decisionStatus?: unknown }>
}

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const write = process.argv.includes('--write')
const unknownArguments = process.argv.slice(2).filter((argument) => argument !== '--write')
if (unknownArguments.length > 0) throw new Error(`Unknown arguments: ${unknownArguments.join(', ')}`)

const rolloutRoot = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-05'
const batchName = 'batch-032-atlas-next-20-v1'
const batchDirectory = `${rolloutRoot}/${batchName}`
const configPath = `${rolloutRoot}/${batchName}.config.json`
const batchManifestPath = `${batchDirectory}/batch-manifest.json`
const dualSummaryPath = `${batchDirectory}/dual-summary.json`
const authoringRelativePath = 'stable-current-carryover-16-v1.authoring.json'
const authoringPath = `${batchDirectory}/${authoringRelativePath}`
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const semanticKindLedgerPath = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const resultStem = 'mathematik-rollout-v1-batch-032-atlas-next-20-v1-20260905-first-pass'
const roundARecordsPath = `${batchDirectory}/round-a/results/${resultStem}-a.batch-001.records.jsonl`
const roundARunPath = `${batchDirectory}/round-a/results/${resultStem}-a.batch-001.run.json`
const roundBRecordsPath = `${batchDirectory}/round-b/results/${resultStem}-b.batch-001.records.jsonl`
const roundBRunPath = `${batchDirectory}/round-b/results/${resultStem}-b.batch-001.run.json`

const sourcePins = {
  config: 'a6538515f402ca0c9c5eb5f156745431af0928491c3e80128c2701ddc426faf8',
  batchManifest: 'f454d626ce2d4bff8489995ee4306cf8b55ebb1d5aa053c65a2b8555dffe28cb',
  dualSummary: '1cd66dfeeaf74cd2249af7453fea1b033989e79bf1a8e5b6b041cd74d064e3bb',
  roundARecords: '42a3df07e6a19809f08afb49b103d1ac938f32082fda7db2b9cc78d8ec2f1d49',
  roundARun: '00c83c8ee4efe0a322123ba6bc3d6df5061117298e22bde62b07f97f3ddfb6f9',
  roundBRecords: '9706a62574acf918cceaf933049fda911796502cc06443b09bb42779d11cbc9c',
  roundBRun: '2fb74713b5f440a760820846efc103447d957afc16a1b0f6847438b001831212',
  canonical: '61f4852a1ec760ad86d7bacb8c168cac17fedfcf86195d8b3d061c931c0dea4c',
  semanticKinds: '384328a7ba3c333276a3f5b09403f07013e57ebaa1fe753bd5247da649b630be',
} as const

const campaignGoalIds = [
  '6596405a-9728-41df-9163-53670ec2a937',
  'f8704a7b-e93d-4e32-b0f9-1b171545fe28',
  '28b3a12f-aa7a-5c2a-92c7-6d64fa543ee5',
  '7676b0f9-340d-4a91-ab1f-92745a8f88db',
  'c9eb293a-9be7-4a3d-8cd0-a1d885a3fdc1',
  '4f889e45-3c1d-4a8e-8fcb-3582d40d9e8a',
  '7fad6a57-cda1-5dee-a55e-877be64ba992',
  '68505a32-3b1d-57b2-a495-00b4097eb50d',
  '62e0a4e3-d1d3-46a2-982d-6b99dca6d3fb',
  'e131c594-c45e-5718-9f33-7ae39ddc82ad',
  '47d8d47c-7c59-5394-9098-11d9ad3723f1',
  '66077296-a8f8-4645-938b-7c3424cb2f14',
  '4d78bbcc-89b8-47f0-aa45-516199e4da5d',
  '71a483ba-9680-4654-bb5e-5ab5427f0919',
  '97b3232d-b89f-48b8-9fa1-7a25a1bdbb3d',
  '786ae588-a4fb-40e6-a7f5-113cfc2bfd0f',
  'e663cc67-5249-55db-b103-357b58a1ca91',
  'e322310f-f33a-485d-bc23-2412a6b8fa12',
  '5bced7dc-6557-4af1-9e70-d87f850d3b7f',
  'e0c3359d-7d8a-4d01-a25e-a8cd5ebce90e',
] as const

const claimedGoalIds = [
  '6596405a-9728-41df-9163-53670ec2a937',
  'f8704a7b-e93d-4e32-b0f9-1b171545fe28',
  '28b3a12f-aa7a-5c2a-92c7-6d64fa543ee5',
  'c9eb293a-9be7-4a3d-8cd0-a1d885a3fdc1',
  '4f889e45-3c1d-4a8e-8fcb-3582d40d9e8a',
  '7fad6a57-cda1-5dee-a55e-877be64ba992',
  '68505a32-3b1d-57b2-a495-00b4097eb50d',
  '62e0a4e3-d1d3-46a2-982d-6b99dca6d3fb',
  'e131c594-c45e-5718-9f33-7ae39ddc82ad',
  '47d8d47c-7c59-5394-9098-11d9ad3723f1',
  '4d78bbcc-89b8-47f0-aa45-516199e4da5d',
  '71a483ba-9680-4654-bb5e-5ab5427f0919',
  '786ae588-a4fb-40e6-a7f5-113cfc2bfd0f',
  'e663cc67-5249-55db-b103-357b58a1ca91',
  'e322310f-f33a-485d-bc23-2412a6b8fa12',
  'e0c3359d-7d8a-4d01-a25e-a8cd5ebce90e',
] as const

const excludedGoalDecisions = [
  { goalId: '7676b0f9-340d-4a91-ab1f-92745a8f88db', first: 'split_review', second: 'split_review' },
  { goalId: '66077296-a8f8-4645-938b-7c3424cb2f14', first: 'revise', second: 'revise' },
  { goalId: '97b3232d-b89f-48b8-9fa1-7a25a1bdbb3d', first: 'revise', second: 'keep' },
  { goalId: '5bced7dc-6557-4af1-9e70-d87f850d3b7f', first: 'keep', second: 'revise' },
] as const

const adjudicatedKeepGoalId = '6596405a-9728-41df-9163-53670ec2a937'
const outputStem = 'stable-current-carryover-16-v1'
const synthesisRelativePath = `synthesis-decisions.${outputStem}.json`
const synthesisPath = `${batchDirectory}/${synthesisRelativePath}`
const resolutionDirectoryName = `resolutions-${outputStem}`
const indexPath = `${batchDirectory}/resolution-index.${outputStem}.json`
const receiptPath = `${batchDirectory}/${outputStem}.compatibility-receipt.json`

const absolute = (path: string): string => resolve(repositoryRoot, path)
const sha256Hex = (value: Buffer | string): string => createHash('sha256').update(value).digest('hex')
const sha256 = (value: Buffer | string): GoalDescriptionSynthesisDigest => `sha256:${sha256Hex(value)}`
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
    if (current[index] && !current[index]?.equals(bytes) && !write) {
      throw new Error(`Existing Mathematics B032 stable16 artifact is stale: ${path}`)
    }
    if (!current[index] && !write) throw new Error(`Missing Mathematics B032 stable16 artifact: ${path}`)
  })
  if (!write) return
  await Promise.all(artifacts.map(async ({ path, bytes }, index) => {
    if (current[index]?.equals(bytes)) return
    await mkdir(dirname(absolute(path)), { recursive: true })
    await writeFile(absolute(path), bytes, current[index] ? undefined : { flag: 'wx' })
  }))
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
  if (!dual.bytes.equals(dualSummaryBytes)) throw new Error('Mathematics B032 dual summary is not exact-current')

  const landscape = JSON.parse(canonicalBytes.toString('utf8')) as { subject?: string; goals?: JsonGoal[] }
  if (landscape.subject !== 'Mathematik' || !Array.isArray(landscape.goals)) {
    throw new Error('Current canonical Mathematics landscape is invalid')
  }
  const semanticLedger = JSON.parse(semanticKindBytes.toString('utf8')) as SemanticKindLedger
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
  ) throw new Error('Mathematics B032 semantic-kind binding or curricularAtomic denominator changed')

  const authoring = JSON.parse(authoringBytes.toString('utf8')) as CarryoverAuthoring
  if (
    authoring.schemaVersion !== 1
    || authoring.artifactType !== 'goal-description-stable-current-carryover-authoring-v1'
    || authoring.carryoverId !== 'mathematik-b032-stable-current-carryover-16-v1-20260905'
  ) throw new Error('Mathematics B032 stable16 authoring identity is invalid')
  assertTrimmed(authoring.synthesizedBy, 'synthesizedBy')
  const expectedRoundPins = {
    first: { recordsDigest: sha256(roundARecordsBytes), runDigest: sha256(roundARunBytes) },
    second: { recordsDigest: sha256(roundBRecordsBytes), runDigest: sha256(roundBRunBytes) },
  }
  if (stableGoalBookJson(authoring.sourceRoundPins) !== stableGoalBookJson(expectedRoundPins)) {
    throw new Error('Mathematics B032 authoring does not bind both exact round result and run bytes')
  }
  if (
    !sameOrdered(authoring.excludedGoalIds, excludedGoalDecisions.map(({ goalId }) => goalId))
    || !sameOrdered(authoring.decisions.map(({ goalId }) => goalId), claimedGoalIds)
  ) throw new Error('Mathematics B032 stable16 authoring scope or order is invalid')
  if (
    dual.summary.goalCount !== campaignGoalIds.length
    || !sameOrdered(dual.prepared.manifest.goalIds, campaignGoalIds)
    || !sameOrdered(dual.summary.goals.map(({ goalId }) => goalId), campaignGoalIds)
    || !sameOrdered(campaignGoalIds.filter((goalId) => claimedGoalIds.includes(goalId as typeof claimedGoalIds[number])), claimedGoalIds)
    || !sameMembers([...claimedGoalIds, ...excludedGoalDecisions.map(({ goalId }) => goalId)], campaignGoalIds)
  ) throw new Error('Mathematics B032 campaign no longer has the exact 16/4 bounded partition')
  for (const excluded of excludedGoalDecisions) {
    const summary = dual.summary.goals.find(({ goalId }) => goalId === excluded.goalId)
    if (!summary || summary.firstDecision !== excluded.first || summary.secondDecision !== excluded.second) {
      throw new Error(`${excluded.goalId}: excluded Mathematics B032 decision pair drifted`)
    }
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
      first.decision !== authored.expectedDecisions[0]
      || second.decision !== authored.expectedDecisions[1]
      || first.binding.recordId !== authored.records.first.recordId
      || first.binding.recordDigest !== authored.records.first.recordDigest
      || second.binding.recordId !== authored.records.second.recordId
      || second.binding.recordDigest !== authored.records.second.recordDigest
    ) throw new Error(`${goalId}: exact decision or per-record digest binding drifted`)
    for (const [round, source] of [['first', first], ['second', second]] as const) {
      if (
        source.record.evidenceProfileContract !== 'positive-understanding-evidence-v2'
        || source.record.evidenceProfileRecommendation !== 'create'
      ) throw new Error(`${goalId}: ${round} record must explicitly recommend create under positive-understanding-evidence-v2`)
    }
    if (authored.evidenceRound !== 'first') throw new Error(`${goalId}: Mathematics B032 stable16 must select Round A evidence`)
    assertTrimmed(authored.rationaleDe, `${goalId}.rationaleDe`)
    assertTrimmed(authored.rationaleEn, `${goalId}.rationaleEn`)

    if (goalId === adjudicatedKeepGoalId) {
      const dissent = authored.revisionDissent
      if (
        first.decision !== 'keep'
        || second.decision !== 'revise'
        || !dissent
        || dissent.sourceRound !== 'second'
        || dissent.disposition !== 'rejected_keep_current'
        || dissent.proposedDescriptionDe !== second.record.proposedDescriptionDe
        || dissent.proposedDescriptionEn !== second.record.proposedDescriptionEn
      ) throw new Error(`${goalId}: exact Round B bilingual revision dissent is not bound and rejected`)
      assertTrimmed(dissent.rationaleDe, `${goalId}.revisionDissent.rationaleDe`)
      assertTrimmed(dissent.rationaleEn, `${goalId}.revisionDissent.rationaleEn`)
    } else if (
      first.decision !== 'keep'
      || second.decision !== 'keep'
      || authored.revisionDissent !== undefined
    ) throw new Error(`${goalId}: stable Mathematics B032 carryover requires exact KEEP/KEEP without revision dissent`)

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
    throw new Error('Mathematics B032 source runs must have valid completion timestamps')
  }
  const synthesizedAt = new Date(Math.max(...completedAtValues) + 1000).toISOString()
  const firstGoal = expectedGoals[0]
  if (!firstGoal) throw new Error('Mathematics B032 stable16 scope is empty')
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
  const manifestId = 'mathematik-b032-stable16-synthesis-openai-codex-20260905'
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
        throw new Error(`${goal.goalId}: incomplete aligned synthesis authoring or sources`)
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
        evidenceRound: authored.evidenceRound,
        records: authored.records,
        ...(authored.revisionDissent ? { revisionDissent: authored.revisionDissent } : {}),
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
    throw new Error(`Mathematics B032 stable16 synthesis manifest: ${manifestValidation.errors.join(' | ')}`)
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
      resolutionId: `mathematics-b032-${outputStem}-resolution-${goal.goalId}`,
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
    receiptId: 'mathematik-b032-stable-current-carryover-16-v1-20260905',
    purpose: 'Fail-closed bounded carryover of fifteen exact KEEP/KEEP goals plus the explicitly adjudicated KEEP-current goal 6596405a from Mathematics B032; all source records require positive-understanding-evidence-v2/create.',
    source: {
      configPath,
      configDigest: sha256(configBytes),
      batchManifestPath,
      batchManifestDigest: sha256(batchManifestBytes),
      dualSummaryPath,
      dualSummaryDigest: sha256(dualSummaryBytes),
      roundA: {
        recordsPath: roundARecordsPath,
        recordsDigest: sha256(roundARecordsBytes),
        runPath: roundARunPath,
        runDigest: sha256(roundARunBytes),
      },
      roundB: {
        recordsPath: roundBRecordsPath,
        recordsDigest: sha256(roundBRecordsBytes),
        runPath: roundBRunPath,
        runDigest: sha256(roundBRunBytes),
      },
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
    exactKeepKeepGoalCount: claimedGoalIds.length - 1,
    adjudicatedKeepCurrentDissentGoalIds: [adjudicatedKeepGoalId],
    explicitlyExcludedGoals: excludedGoalDecisions,
    evidenceContract: 'positive-understanding-evidence-v2',
    evidenceRecommendation: 'create',
    evidenceRoundByGoalId: Object.fromEntries(claimedGoalIds.map((goalId) => [goalId, 'first'])),
    exactRecordBindings: Object.fromEntries(authoring.decisions.map(({ goalId, records }) => [goalId, records])),
    currentCanonicalContexts,
    curriculumAtomicDenominatorAtPreparation: dual.prepared.manifest.curriculumAtomicDenominatorAtPreparation,
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
      exactReviewDecisionPairsRequired: true,
      mixedDecisionRequiresExactRejectedBilingualRevisionDissent: true,
      roundAEvidenceSelectedForEveryClaimedGoal: true,
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
    `${write ? 'Materialized' : 'Verified'} Mathematics B032 stable16: strict=${indexEntries.length}/16; keepKeep=15; adjudicatedKeep=1; denominator=${curriculumAtomicDenominator}; index=${indexPath}`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
