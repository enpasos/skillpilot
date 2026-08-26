import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { stableGoalBookJson } from './goalBookModel'
import type {
  GoalDescriptionDualRoundResolution,
  GoalDescriptionDualRoundResolutionSource,
} from './validateGoalDescriptionDualRoundResolution'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const schemaPath = resolve(
  repositoryRoot,
  'contracts/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
)

export type GoalDescriptionSynthesisDigest = `sha256:${string}`

export type GoalDescriptionRolloutSynthesisRoundBinding = {
  campaignId: string
  campaignDigest: GoalDescriptionSynthesisDigest
  roundId: string
  independenceGroupId: string
  reviewInputFingerprint: GoalDescriptionSynthesisDigest
  batchId: string
  batchInputFingerprint: GoalDescriptionSynthesisDigest
  runId: string
  runManifestDigest: GoalDescriptionSynthesisDigest
  resultsDigest: GoalDescriptionSynthesisDigest
}

export type GoalDescriptionRolloutSynthesisDecisionManifest = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json'
  schemaVersion: 1
  synthesisContract: 'goal-description-rollout-synthesis-decision-v1'
  manifestId: string
  manifestFingerprint: GoalDescriptionSynthesisDigest
  authority: 'ai_synthesis'
  synthesizedBy: string
  synthesizedAt: string
  batch: {
    batchId: string
    batchManifestDigest: GoalDescriptionSynthesisDigest
    configDigest: GoalDescriptionSynthesisDigest
    bundleFingerprint: GoalDescriptionSynthesisDigest
    bookDigest: GoalDescriptionSynthesisDigest
    reviewInputFingerprint: GoalDescriptionSynthesisDigest
    dualSummaryDigest: GoalDescriptionSynthesisDigest
    canonicalLandscapeDigest: GoalDescriptionSynthesisDigest
  }
  rounds: {
    first: GoalDescriptionRolloutSynthesisRoundBinding
    second: GoalDescriptionRolloutSynthesisRoundBinding
  }
  decisions: Array<{
    decisionId: string
    goalId: string
    effectiveSemanticKind: 'curricularAtomic'
    goalFingerprint: GoalDescriptionSynthesisDigest
    pageFingerprint: GoalDescriptionSynthesisDigest
    goalReviewContextFingerprint: GoalDescriptionSynthesisDigest
    finalText: GoalDescriptionDualRoundResolution['goal']['finalText']
    resolutionDecision: GoalDescriptionDualRoundResolution['decision']
    evidenceRound: 'first' | 'second'
    records: {
      first: { recordId: string; recordDigest: GoalDescriptionSynthesisDigest }
      second: { recordId: string; recordDigest: GoalDescriptionSynthesisDigest }
    }
    rationaleDe: string
    rationaleEn: string
  }>
}

export type GoalDescriptionRolloutSynthesisExpectedGoal = {
  goalId: string
  effectiveSemanticKind: 'curricularAtomic'
  goalFingerprint: GoalDescriptionSynthesisDigest
  pageFingerprint: GoalDescriptionSynthesisDigest
  goalReviewContextFingerprint: GoalDescriptionSynthesisDigest
  finalText: GoalDescriptionDualRoundResolution['goal']['finalText']
  firstSource: GoalDescriptionDualRoundResolutionSource
  secondSource: GoalDescriptionDualRoundResolutionSource
}

export type GoalDescriptionRolloutSynthesisExpectedBindings = {
  batch: GoalDescriptionRolloutSynthesisDecisionManifest['batch']
  rounds: GoalDescriptionRolloutSynthesisDecisionManifest['rounds']
  synthesizedAt: string
  goals: GoalDescriptionRolloutSynthesisExpectedGoal[]
}

const sha256 = (value: Buffer | string): GoalDescriptionSynthesisDigest => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)

export const fingerprintGoalDescriptionRolloutSynthesisDecisionManifest = (
  manifest: Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'>,
): GoalDescriptionSynthesisDigest => sha256(stableGoalBookJson(manifest))

let validatorPromise: Promise<{
  ajv: Ajv2020
  validate: ReturnType<Ajv2020['compile']>
}> | null = null

const loadValidator = () => {
  validatorPromise ??= (async () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true })
    addFormats(ajv)
    const schema = JSON.parse(await readFile(schemaPath, 'utf8'))
    return { ajv, validate: ajv.compile(schema) }
  })()
  return validatorPromise
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

const same = (left: unknown, right: unknown) => (
  stableGoalBookJson(left) === stableGoalBookJson(right)
)

const withoutRecordBinding = (
  binding: GoalDescriptionDualRoundResolutionSource['binding'],
  batchInputFingerprint: GoalDescriptionSynthesisDigest,
): GoalDescriptionRolloutSynthesisRoundBinding => ({
  campaignId: binding.campaignId,
  campaignDigest: binding.campaignDigest,
  roundId: binding.roundId,
  independenceGroupId: binding.independenceGroupId,
  reviewInputFingerprint: binding.reviewInputFingerprint,
  batchId: binding.batchId,
  batchInputFingerprint,
  runId: binding.runId,
  runManifestDigest: binding.runManifestDigest,
  resultsDigest: binding.resultsDigest,
})

export const buildGoalDescriptionRolloutSynthesisRoundBinding = withoutRecordBinding

const recordCurrentText = (
  source: GoalDescriptionDualRoundResolutionSource,
): GoalDescriptionDualRoundResolution['goal']['finalText'] | null => (
  source.record
    ? {
        titleDe: source.record.currentTitleDe,
        titleEn: source.record.currentTitleEn,
        descriptionDe: source.record.currentDescriptionDe,
        descriptionEn: source.record.currentDescriptionEn,
      }
    : null
)

export const validateGoalDescriptionRolloutSynthesisDecisionManifestStructure = async (
  manifest: GoalDescriptionRolloutSynthesisDecisionManifest,
) => {
  const { ajv, validate } = await loadValidator()
  const errors: string[] = []
  if (!validate(manifest)) {
    errors.push(`Synthesis decision manifest: ${ajv.errorsText(validate.errors, { separator: '; ' })}`)
    return { errors, schemaValid: false }
  }
  const payload = Object.fromEntries(
    Object.entries(manifest).filter(([key]) => key !== 'manifestFingerprint'),
  ) as Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'>
  const expectedFingerprint = fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(payload)
  if (manifest.manifestFingerprint !== expectedFingerprint) {
    errors.push(`Synthesis decision manifest fingerprint is stale or foreign; expected ${expectedFingerprint}`)
  }
  return { errors, schemaValid: true }
}

export const validateGoalDescriptionRolloutSynthesisDecisionManifest = async ({
  manifest,
  expected,
}: {
  manifest: GoalDescriptionRolloutSynthesisDecisionManifest
  expected: GoalDescriptionRolloutSynthesisExpectedBindings
}) => {
  const structure = await validateGoalDescriptionRolloutSynthesisDecisionManifestStructure(manifest)
  const errors = [...structure.errors]
  if (!structure.schemaValid) return { errors }
  if (!same(manifest.batch, expected.batch)) {
    errors.push('Synthesis decision manifest batch digests do not match the exact current batch artifacts')
  }
  if (!same(manifest.rounds, expected.rounds)) {
    errors.push('Synthesis decision manifest round digests do not match the two exact current review runs')
  }
  if (manifest.synthesizedAt !== expected.synthesizedAt) {
    errors.push(`Synthesis decision manifest synthesizedAt must be the deterministic current-run timestamp ${expected.synthesizedAt}`)
  }
  if (manifest.rounds.first.campaignId === manifest.rounds.second.campaignId) {
    errors.push('Synthesis decision manifest must bind two distinct campaignIds')
  }
  if (manifest.rounds.first.roundId === manifest.rounds.second.roundId) {
    errors.push('Synthesis decision manifest must bind two distinct roundIds')
  }
  if (manifest.rounds.first.independenceGroupId === manifest.rounds.second.independenceGroupId) {
    errors.push('Synthesis decision manifest must bind two distinct independenceGroupIds')
  }
  if (manifest.rounds.first.runId === manifest.rounds.second.runId) {
    errors.push('Synthesis decision manifest must bind two distinct runIds')
  }
  duplicateValues(manifest.decisions.map(({ decisionId }) => decisionId)).forEach((decisionId) => {
    errors.push(`Synthesis decision manifest contains duplicate decisionId ${decisionId}`)
  })
  duplicateValues(manifest.decisions.map(({ goalId }) => goalId)).forEach((goalId) => {
    errors.push(`Synthesis decision manifest contains duplicate goalId ${goalId}`)
  })
  const actualGoalIds = manifest.decisions.map(({ goalId }) => goalId)
  const expectedGoalIds = expected.goals.map(({ goalId }) => goalId)
  if (!same(actualGoalIds, expectedGoalIds)) {
    errors.push('Synthesis decision manifest must contain exactly one decision per configured goal in configured order')
  }

  expected.goals.forEach((goal, index) => {
    const decision = manifest.decisions[index]
    if (!decision || decision.goalId !== goal.goalId) return
    const expectedGoalBinding = {
      effectiveSemanticKind: goal.effectiveSemanticKind,
      goalFingerprint: goal.goalFingerprint,
      pageFingerprint: goal.pageFingerprint,
      goalReviewContextFingerprint: goal.goalReviewContextFingerprint,
      finalText: goal.finalText,
    }
    const actualGoalBinding = {
      effectiveSemanticKind: decision.effectiveSemanticKind,
      goalFingerprint: decision.goalFingerprint,
      pageFingerprint: decision.pageFingerprint,
      goalReviewContextFingerprint: decision.goalReviewContextFingerprint,
      finalText: decision.finalText,
    }
    if (!same(actualGoalBinding, expectedGoalBinding)) {
      errors.push(`${goal.goalId}: synthesis decision does not exactly bind the current canonical text and fingerprints`)
    }
    const sources = [goal.firstSource, goal.secondSource]
    const labels = ['first', 'second'] as const
    sources.forEach((source, sourceIndex) => {
      const label = labels[sourceIndex]
      const expectedRound = withoutRecordBinding(
        source.binding,
        expected.rounds[label].batchInputFingerprint,
      )
      if (!same(manifest.rounds[label], expectedRound)) {
        errors.push(`${goal.goalId}: ${label} source does not belong to the manifest-bound current run`)
      }
      if (source.decision !== 'keep' || !source.record) {
        errors.push(`${goal.goalId}: ${label} source must be a current keep record; found ${source.decision}`)
        return
      }
      if (
        source.record.goalId !== goal.goalId
        || source.record.goalFingerprint !== goal.goalFingerprint
        || source.record.pageFingerprint !== goal.pageFingerprint
        || source.binding.goalReviewContextFingerprint !== goal.goalReviewContextFingerprint
        || !same(recordCurrentText(source), goal.finalText)
      ) {
        errors.push(`${goal.goalId}: ${label} keep record is stale or foreign to the exact current goal context`)
      }
      const actualRecord = decision.records[label]
      if (
        actualRecord.recordId !== source.binding.recordId
        || actualRecord.recordDigest !== source.binding.recordDigest
      ) {
        errors.push(`${goal.goalId}: ${label} record id or byte digest does not match the exact current record`)
      }
    })
    if (goal.firstSource.binding.recordId === goal.secondSource.binding.recordId) {
      errors.push(`${goal.goalId}: synthesis requires two distinct recordIds`)
    }
    if (goal.firstSource.binding.goalReviewContextFingerprint !== goal.secondSource.binding.goalReviewContextFingerprint) {
      errors.push(`${goal.goalId}: source records do not share the exact current goal context fingerprint`)
    }
  })

  return { errors }
}
