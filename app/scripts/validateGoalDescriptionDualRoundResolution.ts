import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import type { LearningGoal } from '../src/landscapeTypes'
import { buildGoalDescriptionRolloutResolutionSynthesis } from './goalDescriptionRolloutResolutionSynthesis'
import {
  GOAL_BOOK_EDITION,
  GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION,
  GOAL_BOOK_MODEL_SCHEMA_VERSION,
  stableGoalBookJson,
} from './goalBookModel'
import { fingerprintGoalForEvidence } from './goalEvidenceProfileModel'
import {
  buildGoalDescriptionCanonicalContext,
  fingerprintGoalDescriptionReviewInput,
  type GoalDescriptionReviewCampaign,
  type GoalDescriptionReviewInput,
  type GoalDescriptionReviewInputGoal,
  type GoalDescriptionReviewRecord,
} from './validateGoalDescriptionReviewCampaign'
import {
  loadGoalDescriptionReviewCampaignResultDirectories,
  type GoalDescriptionReviewCampaignResultPair,
} from './validateGoalDescriptionReviewCampaignResults'
import {
  validateGoalDescriptionReviewDualRound,
  type GoalDescriptionDualRoundSummary,
  type GoalDescriptionReviewRoundArtifacts,
} from './validateGoalDescriptionReviewDualRound'
import {
  validateGoalDescriptionRolloutSynthesisDecisionManifestStructure,
  type GoalDescriptionRolloutSynthesisDecisionManifest,
} from './validateGoalDescriptionRolloutSynthesisDecisionManifest'

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const RESOLUTION_SCHEMA_PATH = resolve(
  REPOSITORY_ROOT,
  'contracts/goal-description-review/v1/goal-description-dual-round-resolution.schema.json',
)
const INPUT_V3_SCHEMA_PATH = resolve(
  REPOSITORY_ROOT,
  'contracts/goal-description-review/v3/goal-description-review-input.schema.json',
)
const GOAL_BOOK_MODEL_SCHEMA_PATH = resolve(
  REPOSITORY_ROOT,
  'contracts/goal-book/v1/goal-book-model.schema.json',
)
const EVIDENCE_PROFILE_SCHEMA_PATH = resolve(
  REPOSITORY_ROOT,
  'contracts/goal-evidence/v1/goal-evidence-profile.schema.json',
)

type Digest = `sha256:${string}`

type UnderstandingEvidence = GoalDescriptionReviewRecord['understandingEvidence']

export type GoalDescriptionDualRoundResolutionRoundBinding = {
  campaignId: string
  campaignDigest: Digest
  roundId: string
  independenceGroupId: string
  reviewInputFingerprint: Digest
  goalReviewContextFingerprint: Digest
  batchId: string
  runId: string
  runManifestDigest: Digest
  resultsDigest: Digest
  recordId: string
  recordDigest: Digest
}

export type GoalDescriptionDualRoundResolution = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-dual-round-resolution.schema.json'
  schemaVersion: 1
  resolutionId: string
  resolutionFingerprint: Digest
  goal: {
    goalId: string
    effectiveSemanticKind:
      | 'orientation'
      | 'curricularAtomic'
      | 'curricularArea'
      | 'practiceAssessment'
      | 'memory'
      | 'programStructure'
      | 'runtimeSupport'
    goalFingerprint: Digest
    pageFingerprint: Digest
    goalReviewContextFingerprint: Digest
    finalText: {
      titleDe: string
      titleEn: string
      descriptionDe: string
      descriptionEn: string
    }
  }
  rounds: {
    first: GoalDescriptionDualRoundResolutionRoundBinding
    second: GoalDescriptionDualRoundResolutionRoundBinding
  }
  dualSummary: {
    validationContract: 'goal-description-dual-round-v1'
    digest: Digest
  }
  status: 'resolved' | 'open'
  decision: 'keep_current' | 'current_after_revision' | 'current_after_split'
  synthesisDecisionManifest?: {
    contract: 'goal-description-rollout-synthesis-decision-v1'
    manifestPath: string
    manifestId: string
    manifestDigest: Digest
    manifestFingerprint: Digest
    decisionId: string
  }
  synthesis: {
    synthesisId: string
    authority: 'ai_synthesis' | 'human'
    synthesizedBy: string
    synthesizedAt: string
    rationaleDe: string
    rationaleEn: string
    understandingEvidence: UnderstandingEvidence
    dissent: Array<{
      dissentId: string
      source: 'first' | 'second' | 'both' | 'synthesis'
      textDe: string
      textEn: string
      disposition: 'accepted_first' | 'accepted_second' | 'merged' | 'not_material' | 'rejected_revision_evidence_accepted' | 'unresolved'
    }>
    humanAttestation: null | {
      attestationId: string
      attestationDigest: Digest
      reviewedBy: string
      reviewedAt: string
      approvalBasis: string
    }
  }
}

export type GoalDescriptionDualRoundResolutionSource = {
  binding: GoalDescriptionDualRoundResolutionRoundBinding
  decision: GoalDescriptionReviewRecord['decision']
  record?: GoalDescriptionReviewRecord
}

export type GoalDescriptionDualRoundResolutionBindingArtifacts = {
  resolution: GoalDescriptionDualRoundResolution
  dualSummary: GoalDescriptionDualRoundSummary
  dualSummaryBytes: Buffer
  currentInput: GoalDescriptionReviewInput
  canonicalGoal: Record<string, unknown>
  firstSource: GoalDescriptionDualRoundResolutionSource
  secondSource: GoalDescriptionDualRoundResolutionSource
  synthesisDecisionManifestArtifact?: {
    manifest: GoalDescriptionRolloutSynthesisDecisionManifest
    manifestBytes: Buffer
    manifestPath: string
  }
  humanAttestationBytes?: Buffer
}

const hasExactRejectedRevisionDissent = ({
  resolution,
  firstSource,
  secondSource,
}: {
  resolution: Pick<GoalDescriptionDualRoundResolution, 'decision' | 'synthesis'>
  firstSource: GoalDescriptionDualRoundResolutionSource
  secondSource: GoalDescriptionDualRoundResolutionSource
}) => {
  if (resolution.decision !== 'keep_current') return false
  const entries = [
    ['first', firstSource],
    ['second', secondSource],
  ] as const
  const keepEntries = entries.filter(([, source]) => source.decision === 'keep')
  const reviseEntries = entries.filter(([, source]) => source.decision === 'revise')
  if (keepEntries.length !== 1 || reviseEntries.length !== 1) return false
  const [reviseLabel, reviseSource] = reviseEntries[0]
  const proposedDescriptionDe = reviseSource.record?.proposedDescriptionDe
  const proposedDescriptionEn = reviseSource.record?.proposedDescriptionEn
  if (!proposedDescriptionDe || !proposedDescriptionEn) return false
  return resolution.synthesis.dissent.some((dissent) => (
    dissent.source === reviseLabel
    && dissent.disposition === 'rejected_revision_evidence_accepted'
    && dissent.textDe.includes(proposedDescriptionDe)
    && dissent.textEn.includes(proposedDescriptionEn)
  ))
}

const sha256 = (value: Buffer | string): Digest => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)

const stableDigest = (value: unknown): Digest => sha256(stableGoalBookJson(value))

export const fingerprintGoalDescriptionReviewContext = (
  goal: GoalDescriptionReviewInputGoal,
): Digest => stableDigest({
  contract: 'goal-description-review-context-v1',
  goal,
})

export const fingerprintGoalDescriptionDualRoundResolution = (
  resolution: Omit<GoalDescriptionDualRoundResolution, 'resolutionFingerprint'>,
): Digest => stableDigest(resolution)

export const fingerprintGoalDescriptionReviewCampaign = (
  campaign: GoalDescriptionReviewCampaign,
): Digest => stableDigest(campaign)

export const fingerprintGoalDescriptionReviewRunManifest = (
  run: GoalDescriptionReviewCampaignResultPair['run'],
): Digest => stableDigest(run)

export const fingerprintGoalDescriptionReviewPage = (
  page: GoalDescriptionReviewInputGoal['reviewContext']['page'],
) => {
  const pageWithoutFingerprint = Object.fromEntries(
    Object.entries(page).filter(([key]) => key !== 'pageFingerprint'),
  )
  return stableDigest({
    modelSchemaVersion: GOAL_BOOK_MODEL_SCHEMA_VERSION,
    edition: GOAL_BOOK_EDITION,
    page: pageWithoutFingerprint,
  })
}

const duplicateValues = (values: readonly string[]) => {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  values.forEach((value) => {
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  })
  return [...duplicates].sort()
}

const parseJson = <T>(value: Buffer | string, label: string): T => {
  try {
    return JSON.parse(value.toString()) as T
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const manifestRoundBindingFromSource = (
  source: GoalDescriptionDualRoundResolutionSource,
) => ({
  campaignId: source.binding.campaignId,
  campaignDigest: source.binding.campaignDigest,
  roundId: source.binding.roundId,
  independenceGroupId: source.binding.independenceGroupId,
  reviewInputFingerprint: source.binding.reviewInputFingerprint,
  batchId: source.binding.batchId,
  runId: source.binding.runId,
  runManifestDigest: source.binding.runManifestDigest,
  resultsDigest: source.binding.resultsDigest,
})

const manifestRoundBindingWithoutBatchInput = (
  round: GoalDescriptionRolloutSynthesisDecisionManifest['rounds']['first'],
) => ({
  campaignId: round.campaignId,
  campaignDigest: round.campaignDigest,
  roundId: round.roundId,
  independenceGroupId: round.independenceGroupId,
  reviewInputFingerprint: round.reviewInputFingerprint,
  batchId: round.batchId,
  runId: round.runId,
  runManifestDigest: round.runManifestDigest,
  resultsDigest: round.resultsDigest,
})

const validateManifestBoundResolutionSynthesis = async ({
  resolution,
  dualSummary,
  currentInput,
  firstSource,
  secondSource,
  artifact,
}: {
  resolution: GoalDescriptionDualRoundResolution
  dualSummary: GoalDescriptionDualRoundSummary
  currentInput: GoalDescriptionReviewInput
  firstSource: GoalDescriptionDualRoundResolutionSource
  secondSource: GoalDescriptionDualRoundResolutionSource
  artifact?: GoalDescriptionDualRoundResolutionBindingArtifacts['synthesisDecisionManifestArtifact']
}) => {
  const errors: string[] = []
  const keepCount = [firstSource, secondSource]
    .filter(({ decision }) => decision === 'keep').length
  const reviseCount = [firstSource, secondSource]
    .filter(({ decision }) => decision === 'revise').length
  const mixedKeepRevise = (
    resolution.decision === 'keep_current'
    && keepCount === 1
    && reviseCount === 1
  )
  const binding = resolution.synthesisDecisionManifest
  if (mixedKeepRevise && !binding) {
    errors.push('A keep_current resolution with exactly one keep and one revise source requires a synthesis-decision manifest binding')
  }
  if (binding && !artifact) {
    errors.push('A synthesis-decision manifest binding requires the exact supplied manifest bytes and parsed manifest')
  }
  if (artifact && !binding) {
    errors.push('Supplied synthesis-decision manifest bytes require a resolution manifest binding')
  }
  if (!binding || !artifact) {
    return { errors, exactManifestSynthesis: false, mixedKeepRevise }
  }

  const structure = await validateGoalDescriptionRolloutSynthesisDecisionManifestStructure(
    artifact.manifest,
  )
  errors.push(...structure.errors)
  if (!structure.schemaValid) {
    return { errors, exactManifestSynthesis: false, mixedKeepRevise }
  }
  try {
    const persistedManifest = parseJson<GoalDescriptionRolloutSynthesisDecisionManifest>(
      artifact.manifestBytes,
      'persisted synthesis-decision manifest',
    )
    if (stableGoalBookJson(persistedManifest) !== stableGoalBookJson(artifact.manifest)) {
      errors.push('Supplied synthesis-decision manifest object does not match the persisted manifest bytes')
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error))
  }
  if (binding.manifestPath !== artifact.manifestPath) {
    errors.push('Resolution synthesis-decision manifestPath does not match the supplied manifest artifact path')
  }
  if (
    binding.contract !== artifact.manifest.synthesisContract
    || binding.manifestId !== artifact.manifest.manifestId
    || binding.manifestDigest !== sha256(artifact.manifestBytes)
    || binding.manifestFingerprint !== artifact.manifest.manifestFingerprint
  ) {
    errors.push('Resolution does not bind the exact synthesis-decision manifest identity, bytes, and fingerprint')
  }
  const duplicateDecisionIds = duplicateValues(
    artifact.manifest.decisions.map(({ decisionId }) => decisionId),
  )
  const duplicateGoalIds = duplicateValues(
    artifact.manifest.decisions.map(({ goalId }) => goalId),
  )
  duplicateDecisionIds.forEach((decisionId) => {
    errors.push(`Synthesis-decision manifest contains duplicate decisionId ${decisionId}`)
  })
  duplicateGoalIds.forEach((goalId) => {
    errors.push(`Synthesis-decision manifest contains duplicate goalId ${goalId}`)
  })
  const goalDecisions = artifact.manifest.decisions.filter(
    ({ goalId }) => goalId === resolution.goal.goalId,
  )
  const boundDecisions = artifact.manifest.decisions.filter(
    ({ decisionId }) => decisionId === binding.decisionId,
  )
  if (goalDecisions.length !== 1 || boundDecisions.length !== 1 || goalDecisions[0] !== boundDecisions[0]) {
    errors.push(
      `Synthesis-decision manifest must contain exactly one bound decision for ${resolution.goal.goalId}`,
    )
    return { errors, exactManifestSynthesis: false, mixedKeepRevise }
  }
  const decision = goalDecisions[0]
  const summaryGoals = dualSummary.goals.filter(({ goalId }) => goalId === resolution.goal.goalId)
  if (summaryGoals.length !== 1) {
    errors.push(`Synthesis-decision validation requires exactly one dual-summary goal ${resolution.goal.goalId}`)
    return { errors, exactManifestSynthesis: false, mixedKeepRevise }
  }
  const expectedBatchBinding = {
    bundleFingerprint: currentInput.bundleFingerprint,
    bookDigest: currentInput.bookDigest,
    reviewInputFingerprint: currentInput.reviewInputFingerprint,
    dualSummaryDigest: resolution.dualSummary.digest,
  }
  const actualBatchBinding = {
    bundleFingerprint: artifact.manifest.batch.bundleFingerprint,
    bookDigest: artifact.manifest.batch.bookDigest,
    reviewInputFingerprint: artifact.manifest.batch.reviewInputFingerprint,
    dualSummaryDigest: artifact.manifest.batch.dualSummaryDigest,
  }
  if (stableGoalBookJson(actualBatchBinding) !== stableGoalBookJson(expectedBatchBinding)) {
    errors.push('Synthesis-decision manifest does not bind the supplied current input and dual summary')
  }
  const sources = { first: firstSource, second: secondSource } as const
  ;(['first', 'second'] as const).forEach((label) => {
    if (
      stableGoalBookJson(manifestRoundBindingWithoutBatchInput(artifact.manifest.rounds[label]))
      !== stableGoalBookJson(manifestRoundBindingFromSource(sources[label]))
    ) {
      errors.push(`Synthesis-decision manifest ${label} round does not bind the exact current review run`)
    }
  })
  const expectedDecisionBinding = {
    decisionId: binding.decisionId,
    goalId: resolution.goal.goalId,
    effectiveSemanticKind: resolution.goal.effectiveSemanticKind,
    goalFingerprint: resolution.goal.goalFingerprint,
    pageFingerprint: resolution.goal.pageFingerprint,
    goalReviewContextFingerprint: resolution.goal.goalReviewContextFingerprint,
    finalText: resolution.goal.finalText,
    resolutionDecision: resolution.decision,
    records: {
      first: {
        recordId: resolution.rounds.first.recordId,
        recordDigest: resolution.rounds.first.recordDigest,
      },
      second: {
        recordId: resolution.rounds.second.recordId,
        recordDigest: resolution.rounds.second.recordDigest,
      },
    },
    rationaleDe: resolution.synthesis.rationaleDe,
    rationaleEn: resolution.synthesis.rationaleEn,
  }
  const actualDecisionBinding = {
    decisionId: decision.decisionId,
    goalId: decision.goalId,
    effectiveSemanticKind: decision.effectiveSemanticKind,
    goalFingerprint: decision.goalFingerprint,
    pageFingerprint: decision.pageFingerprint,
    goalReviewContextFingerprint: decision.goalReviewContextFingerprint,
    finalText: decision.finalText,
    resolutionDecision: decision.resolutionDecision,
    records: decision.records,
    rationaleDe: decision.rationaleDe,
    rationaleEn: decision.rationaleEn,
  }
  if (stableGoalBookJson(actualDecisionBinding) !== stableGoalBookJson(expectedDecisionBinding)) {
    errors.push('Resolution goal, records, decision, final text, or rationale disagrees with its bound synthesis decision')
  }
  try {
    const expectedSynthesis = buildGoalDescriptionRolloutResolutionSynthesis({
      batchId: artifact.manifest.batch.batchId,
      manifest: artifact.manifest,
      decision,
      summaryGoal: summaryGoals[0],
      firstSource,
      secondSource,
    })
    if (stableGoalBookJson(resolution.synthesis) !== stableGoalBookJson(expectedSynthesis)) {
      errors.push('Resolution synthesis does not exactly match the manifest-selected current record evidence and deterministic dissent')
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error))
  }
  return {
    errors,
    exactManifestSynthesis: errors.length === 0,
    mixedKeepRevise,
  }
}

type RawRecord = {
  record: GoalDescriptionReviewRecord
  recordDigest: Digest
}

const parseJsonlRecordsWithByteDigests = (bytes: Buffer, label: string): RawRecord[] => {
  const source = bytes.toString('utf8')
  const lines = source.split('\n')
  return lines.flatMap((line, index) => {
    const recordBytes = Buffer.from(line.endsWith('\r') ? line.slice(0, -1) : line, 'utf8')
    if (recordBytes.toString('utf8').trim() === '') return []
    return [{
      record: parseJson<GoalDescriptionReviewRecord>(recordBytes, `${label}:${index + 1}`),
      recordDigest: sha256(recordBytes),
    }]
  })
}

export const extractGoalDescriptionDualRoundResolutionSource = ({
  artifacts,
  goalId,
  label,
}: {
  artifacts: GoalDescriptionReviewRoundArtifacts
  goalId: string
  label: string
}): { errors: string[]; source?: GoalDescriptionDualRoundResolutionSource } => {
  const errors: string[] = []
  const inputGoals = artifacts.input.goals.filter((goal) => goal.goalId === goalId)
  if (inputGoals.length !== 1) {
    errors.push(`${label} round must contain exactly one V3 input goal ${goalId}; found ${inputGoals.length}`)
    return { errors }
  }
  const matchingPairs = artifacts.resultPairs.filter((pair) => (
    Array.isArray(pair.run.goalIds) && pair.run.goalIds.includes(goalId)
  ))
  if (matchingPairs.length !== 1) {
    errors.push(`${label} round must contain exactly one run for ${goalId}; found ${matchingPairs.length}`)
    return { errors }
  }
  const pair = matchingPairs[0]
  let rawRecords: RawRecord[]
  try {
    rawRecords = parseJsonlRecordsWithByteDigests(pair.recordsBytes, `${label} records`)
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error))
    return { errors }
  }
  const matches = rawRecords.filter(({ record }) => record.goalId === goalId)
  if (matches.length !== 1) {
    errors.push(`${label} round must contain exactly one record for ${goalId}; found ${matches.length}`)
    return { errors }
  }
  const { record, recordDigest } = matches[0]
  return {
    errors,
    source: {
      binding: {
        campaignId: artifacts.campaign.campaignId,
        campaignDigest: fingerprintGoalDescriptionReviewCampaign(artifacts.campaign),
        roundId: artifacts.campaign.roundId,
        independenceGroupId: artifacts.campaign.independenceGroupId,
        reviewInputFingerprint: artifacts.input.reviewInputFingerprint as Digest,
        goalReviewContextFingerprint: fingerprintGoalDescriptionReviewContext(inputGoals[0]),
        batchId: pair.batchId,
        runId: pair.run.runId,
        runManifestDigest: fingerprintGoalDescriptionReviewRunManifest(pair.run),
        resultsDigest: sha256(pair.recordsBytes),
        recordId: record.recordId,
        recordDigest,
      },
      decision: record.decision,
      record,
    },
  }
}

export const buildGoalDescriptionDualRoundResolution = ({
  resolutionId,
  goalId,
  effectiveSemanticKind,
  decision,
  synthesis,
  dualSummaryBytes,
  currentInput,
  firstSource,
  secondSource,
  synthesisDecisionManifest,
}: {
  resolutionId: string
  goalId: string
  effectiveSemanticKind: GoalDescriptionDualRoundResolution['goal']['effectiveSemanticKind']
  decision: GoalDescriptionDualRoundResolution['decision']
  synthesis: GoalDescriptionDualRoundResolution['synthesis']
  dualSummaryBytes: Buffer
  currentInput: GoalDescriptionReviewInput
  firstSource: GoalDescriptionDualRoundResolutionSource
  secondSource: GoalDescriptionDualRoundResolutionSource
  synthesisDecisionManifest?: NonNullable<GoalDescriptionDualRoundResolution['synthesisDecisionManifest']>
}): GoalDescriptionDualRoundResolution => {
  const matches = currentInput.goals.filter((goal) => goal.goalId === goalId)
  if (matches.length !== 1) {
    throw new Error(`Current V3 input must contain exactly one goal ${goalId}; found ${matches.length}`)
  }
  const currentGoal = matches[0]
  const withoutFingerprint = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-dual-round-resolution.schema.json' as const,
    schemaVersion: 1 as const,
    resolutionId,
    goal: {
      goalId,
      effectiveSemanticKind,
      goalFingerprint: currentGoal.goalFingerprint as Digest,
      pageFingerprint: currentGoal.pageFingerprint as Digest,
      goalReviewContextFingerprint: fingerprintGoalDescriptionReviewContext(currentGoal),
      finalText: {
        titleDe: currentGoal.currentTitleDe,
        titleEn: currentGoal.currentTitleEn,
        descriptionDe: currentGoal.currentDescriptionDe,
        descriptionEn: currentGoal.currentDescriptionEn,
      },
    },
    rounds: {
      first: firstSource.binding,
      second: secondSource.binding,
    },
    dualSummary: {
      validationContract: 'goal-description-dual-round-v1' as const,
      digest: sha256(dualSummaryBytes),
    },
    status: 'open' as GoalDescriptionDualRoundResolution['status'],
    decision,
    ...(synthesisDecisionManifest ? { synthesisDecisionManifest } : {}),
    synthesis,
  }
  const provisional = {
    ...withoutFingerprint,
  }
  provisional.status = (
    (firstSource.decision === 'keep' && secondSource.decision === 'keep')
    || hasExactRejectedRevisionDissent({ resolution: provisional, firstSource, secondSource })
      ? 'resolved'
      : 'open'
  )
  return {
    ...provisional,
    resolutionFingerprint: fingerprintGoalDescriptionDualRoundResolution(provisional),
  }
}

let validatorsPromise: ReturnType<typeof createValidators> | null = null

const createValidators = async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true })
  addFormats(ajv)
  const [resolutionSchema, inputV3Schema, goalBookSchema, evidenceProfileSchema] = await Promise.all([
    RESOLUTION_SCHEMA_PATH,
    INPUT_V3_SCHEMA_PATH,
    GOAL_BOOK_MODEL_SCHEMA_PATH,
    EVIDENCE_PROFILE_SCHEMA_PATH,
  ].map((path) => readFile(path, 'utf8').then((value) => JSON.parse(value))))
  ajv.addSchema(goalBookSchema)
  ajv.addSchema(evidenceProfileSchema)
  return {
    ajv,
    validateResolution: ajv.compile(resolutionSchema),
    validateInputV3: ajv.compile(inputV3Schema),
  }
}

const loadValidators = () => {
  validatorsPromise ??= createValidators()
  return validatorsPromise
}

const validateCurrentGoalBindings = ({
  resolution,
  currentInput,
  canonicalGoal,
}: {
  resolution: GoalDescriptionDualRoundResolution
  currentInput: GoalDescriptionReviewInput
  canonicalGoal: Record<string, unknown>
}) => {
  const errors: string[] = []
  if (currentInput.schemaVersion !== 3) {
    errors.push('Current description-review input must use the V3 contextual contract')
    return { errors }
  }
  if (currentInput.goalCount !== currentInput.goals.length) {
    errors.push('Current V3 input goalCount does not match its goals array')
  }
  duplicateValues(currentInput.goals.map(({ goalId }) => goalId)).forEach((goalId) => {
    errors.push(`Current V3 input contains duplicate goalId ${goalId}`)
  })
  const expectedInputFingerprint = fingerprintGoalDescriptionReviewInput({
    $schema: currentInput.$schema,
    schemaVersion: currentInput.schemaVersion,
    bundleFingerprint: currentInput.bundleFingerprint,
    bookDigest: currentInput.bookDigest,
    goalCount: currentInput.goalCount,
    goals: currentInput.goals,
  })
  if (currentInput.reviewInputFingerprint !== expectedInputFingerprint) {
    errors.push('Current V3 input has a stale or foreign reviewInputFingerprint')
  }
  const matches = currentInput.goals.filter(({ goalId }) => goalId === resolution.goal.goalId)
  if (matches.length !== 1) {
    errors.push(`Current V3 input must contain exactly one goal ${resolution.goal.goalId}; found ${matches.length}`)
    return { errors }
  }
  const currentGoal = matches[0]
  const canonicalGoalId = String(canonicalGoal.id ?? '')
  if (canonicalGoalId !== resolution.goal.goalId) {
    errors.push(`Canonical goal id ${canonicalGoalId || '(missing)'} does not match resolution goal ${resolution.goal.goalId}`)
  }
  const expectedCanonicalContext = buildGoalDescriptionCanonicalContext(canonicalGoal)
  if (stableGoalBookJson(currentGoal.canonicalContext) !== stableGoalBookJson(expectedCanonicalContext)) {
    errors.push(`Current V3 context for ${resolution.goal.goalId} disagrees with the canonical goal`)
  }
  const expectedGoalFingerprint = fingerprintGoalForEvidence(
    canonicalGoal as unknown as LearningGoal,
    GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION,
    resolution.goal.effectiveSemanticKind,
  )
  if (currentGoal.goalFingerprint !== expectedGoalFingerprint) {
    errors.push(`Current V3 goalFingerprint for ${resolution.goal.goalId} disagrees with the canonical goal and effective semantic kind`)
  }
  if (fingerprintGoalDescriptionReviewPage(currentGoal.reviewContext.page) !== currentGoal.pageFingerprint) {
    errors.push(`Current V3 pageFingerprint for ${resolution.goal.goalId} is stale or foreign`)
  }
  const { page, evidenceProfile } = currentGoal.reviewContext
  if (
    page.goalId !== currentGoal.goalId
    || page.goalFingerprint !== currentGoal.goalFingerprint
    || page.pageFingerprint !== currentGoal.pageFingerprint
  ) {
    errors.push(`Current V3 GoalBook page for ${resolution.goal.goalId} has stale goal/page bindings`)
  }
  if (page.title !== currentGoal.currentTitleDe || page.description !== currentGoal.currentDescriptionDe) {
    errors.push(`Current V3 GoalBook page for ${resolution.goal.goalId} disagrees with its German text`)
  }
  if (page.evidenceReview === null) {
    if (evidenceProfile !== null) errors.push(`Current V3 goal ${resolution.goal.goalId} has an unbound evidence profile`)
  } else if (evidenceProfile === null) {
    errors.push(`Current V3 goal ${resolution.goal.goalId} is missing its bound evidence profile`)
  } else if (
    evidenceProfile.reviewId !== page.evidenceReview.reviewId
    || evidenceProfile.goalId !== currentGoal.goalId
    || evidenceProfile.goalFingerprint !== currentGoal.goalFingerprint
    || evidenceProfile.reviewInputFingerprint !== page.evidenceReview.reviewInputFingerprint
    || evidenceProfile.profileFingerprint !== page.evidenceReview.profileFingerprint
    || evidenceProfile.status !== page.evidenceReview.status
    || evidenceProfile.evidenceLevel !== page.evidenceReview.evidenceLevel
    || evidenceProfile.maximumClaimScope !== page.evidenceReview.maximumClaimScope
  ) {
    errors.push(`Current V3 evidence profile for ${resolution.goal.goalId} disagrees with its GoalBook page`)
  }
  const canonicalText = {
    titleDe: String(canonicalGoal.title ?? ''),
    titleEn: String(canonicalGoal.titleEn ?? ''),
    descriptionDe: String(canonicalGoal.description ?? ''),
    descriptionEn: String(canonicalGoal.descriptionEn ?? ''),
  }
  if (Object.values(canonicalText).some((value) => value === '')) {
    errors.push(`Canonical goal ${resolution.goal.goalId} is missing final bilingual title or description text`)
  }
  const currentText = {
    titleDe: currentGoal.currentTitleDe,
    titleEn: currentGoal.currentTitleEn,
    descriptionDe: currentGoal.currentDescriptionDe,
    descriptionEn: currentGoal.currentDescriptionEn,
  }
  if (stableGoalBookJson(currentText) !== stableGoalBookJson(canonicalText)) {
    errors.push(`Current V3 bilingual text for ${resolution.goal.goalId} disagrees with the canonical goal`)
  }
  if (stableGoalBookJson(resolution.goal.finalText) !== stableGoalBookJson(canonicalText)) {
    errors.push(`Resolution final bilingual text for ${resolution.goal.goalId} does not exactly match the current canonical goal`)
  }
  const currentContextFingerprint = fingerprintGoalDescriptionReviewContext(currentGoal)
  if (
    resolution.goal.goalFingerprint !== currentGoal.goalFingerprint
    || resolution.goal.pageFingerprint !== currentGoal.pageFingerprint
    || resolution.goal.goalReviewContextFingerprint !== currentContextFingerprint
  ) {
    errors.push(`Resolution goal ${resolution.goal.goalId} has stale or foreign current fingerprints`)
  }
  return { errors, currentGoal, currentContextFingerprint }
}

export const validateGoalDescriptionDualRoundResolutionBindings = async ({
  resolution,
  dualSummary,
  dualSummaryBytes,
  currentInput,
  canonicalGoal,
  firstSource,
  secondSource,
  synthesisDecisionManifestArtifact,
  humanAttestationBytes,
}: GoalDescriptionDualRoundResolutionBindingArtifacts) => {
  const { ajv, validateResolution, validateInputV3 } = await loadValidators()
  const errors: string[] = []
  if (!validateResolution(resolution)) {
    errors.push(`Resolution: ${ajv.errorsText(validateResolution.errors)}`)
  }
  if (!validateInputV3(currentInput)) {
    errors.push(`Current V3 input: ${ajv.errorsText(validateInputV3.errors)}`)
  }
  if (errors.length > 0) return { errors, strictDescriptionComplete: false }

  const resolutionPayload = Object.fromEntries(
    Object.entries(resolution).filter(([key]) => key !== 'resolutionFingerprint'),
  ) as Omit<GoalDescriptionDualRoundResolution, 'resolutionFingerprint'>
  const expectedResolutionFingerprint = fingerprintGoalDescriptionDualRoundResolution(resolutionPayload)
  if (resolution.resolutionFingerprint !== expectedResolutionFingerprint) {
    errors.push(`Resolution resolutionFingerprint is stale or foreign; expected ${expectedResolutionFingerprint}`)
  }
  if (resolution.dualSummary.digest !== sha256(dualSummaryBytes)) {
    errors.push('Resolution dualSummary digest does not match the persisted dual-summary bytes')
  }
  try {
    const persistedDualSummary = parseJson<GoalDescriptionDualRoundSummary>(
      dualSummaryBytes,
      'persisted dual summary',
    )
    if (stableGoalBookJson(persistedDualSummary) !== stableGoalBookJson(dualSummary)) {
      errors.push('Supplied dual-summary object does not match the persisted dual-summary bytes')
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error))
  }
  if (resolution.dualSummary.validationContract !== dualSummary.validationContract) {
    errors.push('Resolution dualSummary validationContract does not match the persisted dual summary')
  }

  const currentBindings = validateCurrentGoalBindings({ resolution, currentInput, canonicalGoal })
  errors.push(...currentBindings.errors)
  const summaryGoalMatches = dualSummary.goals.filter(({ goalId }) => goalId === resolution.goal.goalId)
  if (summaryGoalMatches.length !== 1) {
    errors.push(`Persisted dual summary must contain exactly one comparison for ${resolution.goal.goalId}; found ${summaryGoalMatches.length}`)
  }

  const expectedSources = [firstSource, secondSource]
  const actualBindings = [resolution.rounds.first, resolution.rounds.second]
  const labels = ['First', 'Second']
  const bindingEvidence: Record<keyof GoalDescriptionDualRoundResolutionRoundBinding, string> = {
    campaignId: 'validated campaign',
    campaignDigest: 'validated campaign bytes',
    roundId: 'validated campaign round',
    independenceGroupId: 'validated independence group',
    reviewInputFingerprint: 'validated V3 review input',
    goalReviewContextFingerprint: 'validated per-goal V3 review context',
    batchId: 'validated campaign batch',
    runId: 'validated run',
    runManifestDigest: 'validated run manifest',
    resultsDigest: 'actual results bytes',
    recordId: 'validated record',
    recordDigest: 'actual record bytes',
  }
  actualBindings.forEach((binding, index) => {
    const expected = expectedSources[index].binding
    ;(Object.keys(bindingEvidence) as Array<keyof GoalDescriptionDualRoundResolutionRoundBinding>)
      .forEach((field) => {
        if (binding[field] !== expected[field]) {
          errors.push(`${labels[index]} round ${field} does not match the ${bindingEvidence[field]}`)
        }
      })
  })
  duplicateValues(actualBindings.map(({ runId }) => runId)).forEach((runId) => {
    errors.push(`Resolution rounds must reference distinct runIds; duplicate ${runId}`)
  })
  duplicateValues(actualBindings.map(({ recordId }) => recordId)).forEach((recordId) => {
    errors.push(`Resolution rounds must reference distinct recordIds; duplicate ${recordId}`)
  })
  if (currentBindings.currentContextFingerprint) {
    actualBindings.forEach((binding, index) => {
      if (binding.goalReviewContextFingerprint !== currentBindings.currentContextFingerprint) {
        errors.push(`${labels[index]} round cites a stale per-goal V3 review context`)
      }
    })
  }

  const summaryGoal = summaryGoalMatches[0]
  if (summaryGoal) {
    const summaryIds = {
      firstRecordId: summaryGoal.firstRecordId,
      secondRecordId: summaryGoal.secondRecordId,
      firstRunId: summaryGoal.firstRunId,
      secondRunId: summaryGoal.secondRunId,
    }
    const resolutionIds = {
      firstRecordId: resolution.rounds.first.recordId,
      secondRecordId: resolution.rounds.second.recordId,
      firstRunId: resolution.rounds.first.runId,
      secondRunId: resolution.rounds.second.runId,
    }
    if (stableGoalBookJson(summaryIds) !== stableGoalBookJson(resolutionIds)) {
      errors.push('Resolution round IDs do not match the target-goal IDs in the persisted dual summary')
    }
    if (
      summaryGoal.firstDecision !== firstSource.decision
      || summaryGoal.secondDecision !== secondSource.decision
    ) {
      errors.push('Persisted dual-summary decisions do not match the validated source records')
    }
    if (summaryGoal.agreement === 'disagreement' && resolution.synthesis.dissent.length === 0) {
      errors.push('A dual-summary disagreement requires at least one explicit bilingual dissent disposition')
    }
  }

  const manifestValidation = await validateManifestBoundResolutionSynthesis({
    resolution,
    dualSummary,
    currentInput,
    firstSource,
    secondSource,
    artifact: synthesisDecisionManifestArtifact,
  })
  errors.push(...manifestValidation.errors)

  const bothKeep = firstSource.decision === 'keep' && secondSource.decision === 'keep'
  const acceptedKeepRevise = (
    manifestValidation.mixedKeepRevise
    && manifestValidation.exactManifestSynthesis
    && hasExactRejectedRevisionDissent({ resolution, firstSource, secondSource })
  )
  if (resolution.status === 'resolved' && !bothKeep && !acceptedKeepRevise) {
    errors.push('A non-keep source decision must remain open unless keep_current binds exactly one current keep plus one current revise record and explicitly rejects the revision as dissent')
  }
  if (
    resolution.status === 'resolved'
    && resolution.synthesis.dissent.some(({ disposition }) => disposition === 'unresolved')
  ) {
    errors.push('A resolved synthesis cannot retain unresolved dissent')
  }
  if (manifestValidation.mixedKeepRevise && resolution.status !== 'resolved') {
    errors.push('An exact manifest-bound keep_current keep/revise synthesis must have resolved status')
  }
  duplicateValues(resolution.synthesis.dissent.map(({ dissentId }) => dissentId)).forEach((dissentId) => {
    errors.push(`Resolution synthesis contains duplicate dissentId ${dissentId}`)
  })
  if (resolution.synthesis.authority === 'human') {
    const attestation = resolution.synthesis.humanAttestation
    if (!attestation || !humanAttestationBytes) {
      errors.push('Human synthesis authority requires separately supplied attestation bytes')
    } else if (attestation.attestationDigest !== sha256(humanAttestationBytes)) {
      errors.push('Human synthesis attestationDigest does not match the supplied attestation bytes')
    }
  } else if (humanAttestationBytes) {
    errors.push('AI synthesis must not be accompanied by human-attestation bytes')
  }

  const strictDescriptionComplete = (
    errors.length === 0
    && resolution.status === 'resolved'
    && (bothKeep || acceptedKeepRevise)
  )
  return { errors, strictDescriptionComplete }
}

export const validateGoalDescriptionDualRoundResolution = async ({
  resolution,
  dualSummary,
  dualSummaryBytes,
  currentInput,
  landscape,
  first,
  second,
  synthesisDecisionManifestArtifact,
  humanAttestationBytes,
}: {
  resolution: GoalDescriptionDualRoundResolution
  dualSummary: GoalDescriptionDualRoundSummary
  dualSummaryBytes: Buffer
  currentInput: GoalDescriptionReviewInput
  landscape: unknown
  first: GoalDescriptionReviewRoundArtifacts
  second: GoalDescriptionReviewRoundArtifacts
  synthesisDecisionManifestArtifact?: GoalDescriptionDualRoundResolutionBindingArtifacts['synthesisDecisionManifestArtifact']
  humanAttestationBytes?: Buffer
}) => {
  const errors: string[] = []
  const { ajv, validateResolution, validateInputV3 } = await loadValidators()
  if (!validateResolution(resolution)) {
    errors.push(`Resolution: ${ajv.errorsText(validateResolution.errors)}`)
  }
  if (!validateInputV3(currentInput)) {
    errors.push(`Current V3 input: ${ajv.errorsText(validateInputV3.errors)}`)
  }
  if (errors.length > 0) return { errors, strictDescriptionComplete: false }
  if (first.input.schemaVersion !== 3 || second.input.schemaVersion !== 3) {
    errors.push('Dual-round resolutions require V3 review inputs for both source rounds')
  }
  const diversityPolicy = dualSummary.diversity?.policy
  if (!['report_only', 'require_distinct_provider_or_model'].includes(diversityPolicy)) {
    errors.push(`Persisted dual summary has unsupported diversity policy ${String(diversityPolicy)}`)
  }
  let dualValidation: Awaited<ReturnType<typeof validateGoalDescriptionReviewDualRound>>
  try {
    dualValidation = await validateGoalDescriptionReviewDualRound({
      first,
      second,
      diversityPolicy: diversityPolicy === 'require_distinct_provider_or_model'
        ? diversityPolicy
        : 'report_only',
    })
  } catch (error) {
    errors.push(`Dual-round validation failed: ${error instanceof Error ? error.message : String(error)}`)
    return { errors, strictDescriptionComplete: false }
  }
  errors.push(...dualValidation.errors)
  if (stableGoalBookJson(dualSummary) !== stableGoalBookJson(dualValidation.summary)) {
    errors.push('Persisted dual summary does not exactly match a fresh validation of the supplied rounds')
  }
  const landscapeGoals = (landscape as { goals?: unknown }).goals
  const canonicalMatches = Array.isArray(landscapeGoals)
    ? landscapeGoals.filter((candidate) => (
      candidate && typeof candidate === 'object'
      && (candidate as Record<string, unknown>).id === resolution.goal.goalId
    )) as Record<string, unknown>[]
    : []
  if (canonicalMatches.length !== 1) {
    errors.push(`Canonical landscape must contain exactly one goal ${resolution.goal.goalId}; found ${canonicalMatches.length}`)
  }
  const firstSourceResult = extractGoalDescriptionDualRoundResolutionSource({
    artifacts: first,
    goalId: resolution.goal.goalId,
    label: 'First',
  })
  const secondSourceResult = extractGoalDescriptionDualRoundResolutionSource({
    artifacts: second,
    goalId: resolution.goal.goalId,
    label: 'Second',
  })
  errors.push(...firstSourceResult.errors, ...secondSourceResult.errors)
  if (
    errors.length > 0
    || canonicalMatches.length !== 1
    || !firstSourceResult.source
    || !secondSourceResult.source
  ) {
    return { errors, strictDescriptionComplete: false }
  }
  const bindingResult = await validateGoalDescriptionDualRoundResolutionBindings({
    resolution,
    dualSummary,
    dualSummaryBytes,
    currentInput,
    canonicalGoal: canonicalMatches[0],
    firstSource: firstSourceResult.source,
    secondSource: secondSourceResult.source,
    synthesisDecisionManifestArtifact,
    humanAttestationBytes,
  })
  return {
    errors: [...errors, ...bindingResult.errors],
    strictDescriptionComplete: bindingResult.strictDescriptionComplete,
  }
}

const parseArgs = (args: string[]) => {
  const values = new Map<string, string>()
  const roundSuffixes = ['bundle', 'input', 'campaign', 'batches-dir', 'results-dir'] as const
  const roundOptions = (['first', 'second'] as const).flatMap((round) => (
    roundSuffixes.map((suffix) => `--${round}-${suffix}`)
  ))
  const required = [
    '--resolution',
    '--dual-summary',
    '--current-input',
    '--landscape',
    ...roundOptions,
  ]
  const allowed = new Set([...required, '--human-attestation'])
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index]
    const value = args[index + 1]
    if (!allowed.has(key) || !value) {
      throw new Error(`Usage: tsx scripts/validateGoalDescriptionDualRoundResolution.ts ${required.map((key) => `${key} <path>`).join(' ')} [--human-attestation <path>]`)
    }
    if (values.has(key)) throw new Error(`Duplicate option ${key}`)
    values.set(key, value)
  }
  required.forEach((key) => {
    if (!values.has(key)) throw new Error(`Missing ${key}`)
  })
  const paths = (round: 'first' | 'second') => ({
    bundle: resolve(values.get(`--${round}-bundle`)!),
    input: resolve(values.get(`--${round}-input`)!),
    campaign: resolve(values.get(`--${round}-campaign`)!),
    batchesDirectory: resolve(values.get(`--${round}-batches-dir`)!),
    resultsDirectory: resolve(values.get(`--${round}-results-dir`)!),
  })
  return {
    resolution: resolve(values.get('--resolution')!),
    dualSummary: resolve(values.get('--dual-summary')!),
    currentInput: resolve(values.get('--current-input')!),
    landscape: resolve(values.get('--landscape')!),
    first: paths('first'),
    second: paths('second'),
    ...(values.has('--human-attestation')
      ? { humanAttestation: resolve(values.get('--human-attestation')!) }
      : {}),
  }
}

const loadRound = async (paths: ReturnType<typeof parseArgs>['first']) => {
  const [bundleBytes, inputBytes, campaignBytes] = await Promise.all([
    readFile(paths.bundle),
    readFile(paths.input),
    readFile(paths.campaign),
  ])
  const campaign = parseJson<GoalDescriptionReviewCampaign>(campaignBytes, paths.campaign)
  const loaded = await loadGoalDescriptionReviewCampaignResultDirectories({
    campaign,
    batchesDirectory: paths.batchesDirectory,
    resultsDirectory: paths.resultsDirectory,
  })
  return {
    errors: loaded.errors,
    artifacts: {
      bundle: parseJson<GoalDescriptionReviewRoundArtifacts['bundle']>(bundleBytes, paths.bundle),
      input: parseJson<GoalDescriptionReviewInput>(inputBytes, paths.input),
      campaign,
      resultPairs: loaded.resultPairs,
    },
  }
}

const main = async () => {
  const paths = parseArgs(process.argv.slice(2))
  const [
    resolutionBytes,
    dualSummaryBytes,
    currentInputBytes,
    landscapeBytes,
    first,
    second,
    humanAttestationBytes,
  ] = await Promise.all([
    readFile(paths.resolution),
    readFile(paths.dualSummary),
    readFile(paths.currentInput),
    readFile(paths.landscape),
    loadRound(paths.first),
    loadRound(paths.second),
    paths.humanAttestation ? readFile(paths.humanAttestation) : Promise.resolve(undefined),
  ])
  const resolution = parseJson<GoalDescriptionDualRoundResolution>(
    resolutionBytes,
    paths.resolution,
  )
  let synthesisDecisionManifestArtifact:
    GoalDescriptionDualRoundResolutionBindingArtifacts['synthesisDecisionManifestArtifact']
  if (resolution.synthesisDecisionManifest) {
    const batchRoot = dirname(dirname(paths.resolution))
    const manifestPath = resolve(batchRoot, resolution.synthesisDecisionManifest.manifestPath)
    const relativeManifestPath = relative(batchRoot, manifestPath)
    if (
      relativeManifestPath === ''
      || relativeManifestPath === '..'
      || relativeManifestPath.startsWith(`..${sep}`)
    ) {
      throw new Error('Resolution synthesis-decision manifestPath leaves its batch root')
    }
    const manifestBytes = await readFile(manifestPath)
    synthesisDecisionManifestArtifact = {
      manifest: parseJson<GoalDescriptionRolloutSynthesisDecisionManifest>(
        manifestBytes,
        manifestPath,
      ),
      manifestBytes,
      manifestPath: resolution.synthesisDecisionManifest.manifestPath,
    }
  }
  const result = await validateGoalDescriptionDualRoundResolution({
    resolution,
    dualSummary: parseJson<GoalDescriptionDualRoundSummary>(dualSummaryBytes, paths.dualSummary),
    dualSummaryBytes,
    currentInput: parseJson<GoalDescriptionReviewInput>(currentInputBytes, paths.currentInput),
    landscape: parseJson<unknown>(landscapeBytes, paths.landscape),
    first: first.artifacts,
    second: second.artifacts,
    synthesisDecisionManifestArtifact,
    humanAttestationBytes,
  })
  const errors = [
    ...first.errors.map((error) => `First round: ${error}`),
    ...second.errors.map((error) => `Second round: ${error}`),
    ...result.errors,
  ]
  if (errors.length > 0) {
    errors.forEach((error) => console.error(error))
    process.exitCode = 1
    return
  }
  console.log(
    `Goal-description dual-round resolution valid: ${resolution.goal.goalId}; strictDescriptionComplete=${result.strictDescriptionComplete}`,
  )
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
