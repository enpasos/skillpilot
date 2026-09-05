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

type AuthoringDecision = {
  goalId: string
  evidenceRound: 'first' | 'second'
  rationaleDe: string
  rationaleEn: string
  revisionDissentRationaleDe?: string
  revisionDissentRationaleEn?: string
}

type AdjudicationAuthoring = {
  schemaVersion: 1
  artifactType: 'goal-description-stable-current-adjudication-authoring-v1'
  adjudicationId: string
  synthesizedBy: string
  excludedGoalIds: string[]
  decisions: AuthoringDecision[]
}

type JsonGoal = Record<string, unknown>

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const write = process.argv.includes('--write')
const batchName = 'batch-033s-dependent-context-final-recheck-8-v1'
const rolloutDirectory = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-05',
)
const sourceConfigPath = join(rolloutDirectory, `${batchName}.config.json`)
const sourceDirectory = join(rolloutDirectory, batchName)
const batchManifestPath = join(sourceDirectory, 'batch-manifest.json')
const authoringPath = join(sourceDirectory, 'stable-current-adjudicated-2-v1.authoring.json')
const landscapePath = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
)
const semanticKindLedgerPath = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
)
const outputStem = 'stable-current-adjudicated-2-v1'
const synthesisRelativePath = `synthesis-decisions.${outputStem}.json`
const synthesisPath = join(sourceDirectory, synthesisRelativePath)
const resolutionDirectoryName = `resolutions-${outputStem}`
const indexPath = join(sourceDirectory, `resolution-index.${outputStem}.json`)
const receiptPath = join(sourceDirectory, `${outputStem}.compatibility-receipt.json`)

const claimedGoalIds = [
  'bb5c5eab-2fc1-5336-b8cf-14d147695487',
  '9fb1dd85-11b7-4a5a-b124-27fea8d1788e',
] as const

const excludedGoalIds = [
  '1730c01d-8c85-57df-b031-c11e2a0511b1',
  'b9fcbad4-a855-54b7-8017-4caac1e2ffb7',
  'bdaa56ad-6257-58a3-a633-8a6339f72f09',
  'e19fccd7-6a35-5c9e-86e1-dcca76481e9c',
  '3aaac6ad-948e-502a-9d49-ce40db0f2ca3',
  '8fbae050-c5c9-52b6-9983-2c366e9c8ade',
] as const

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
    if (current[index] && !current[index]?.equals(bytes)) throw new Error(`Existing Physics B033s artifact is stale: ${path}`)
    if (!current[index] && !write) throw new Error(`Missing Physics B033s artifact: ${path}`)
  })
  if (!write) return
  await Promise.all(artifacts.flatMap(({ path, bytes }, index) => (
    current[index]
      ? []
      : [mkdir(dirname(path), { recursive: true }).then(() => writeFile(path, bytes, { flag: 'wx' }))]
  )))
}

const main = async (): Promise<void> => {
  const unknownArgs = process.argv.slice(2).filter((argument) => argument !== '--write')
  if (unknownArgs.length > 0) throw new Error(`Unknown arguments: ${unknownArgs.join(', ')}`)
  const [dual, configBytes, batchManifestBytes, landscapeBytes, ledgerBytes, authoringBytes] = await Promise.all([
    materializeGoalDescriptionRolloutBatchDualSummary(sourceConfigPath, false),
    readFile(sourceConfigPath),
    readFile(batchManifestPath),
    readFile(landscapePath),
    readFile(semanticKindLedgerPath),
    readFile(authoringPath),
  ])
  const landscape = JSON.parse(landscapeBytes.toString('utf8')) as { goals: JsonGoal[] }
  const ledger = JSON.parse(ledgerBytes.toString('utf8')) as {
    decisions: Array<{ goalId?: string; semanticKind?: string; decisionStatus?: string }>
  }
  const authoring = JSON.parse(authoringBytes.toString('utf8')) as AdjudicationAuthoring
  if (
    authoring.schemaVersion !== 1
    || authoring.artifactType !== 'goal-description-stable-current-adjudication-authoring-v1'
    || authoring.adjudicationId !== 'physik-b033s-stable-current-adjudicated-2-v1-20260905'
  ) throw new Error('Physics B033s bounded adjudication authoring identity is invalid')
  assertTrimmed(authoring.synthesizedBy, 'synthesizedBy')
  if (
    !sameOrdered(authoring.excludedGoalIds, excludedGoalIds)
    || !sameOrdered(authoring.decisions.map(({ goalId }) => goalId), claimedGoalIds)
  ) throw new Error('Physics B033s bounded adjudication scope or order is invalid')
  if (
    dual.summary.goalCount !== 8
    || dual.summary.counts.requiresSynthesis !== 8
    || !sameMembers(dual.prepared.manifest.goalIds, [...claimedGoalIds, ...excludedGoalIds])
  ) throw new Error('Physics B033s no longer partitions into the exact claimed and excluded scopes')

  const bbSummary = dual.summary.goals.find(({ goalId }) => goalId === claimedGoalIds[0])
  const inductionSummary = dual.summary.goals.find(({ goalId }) => goalId === claimedGoalIds[1])
  if (bbSummary?.firstDecision !== 'keep' || bbSummary.secondDecision !== 'keep') {
    throw new Error(`${claimedGoalIds[0]}: expected exact KEEP/KEEP source decisions`)
  }
  if (inductionSummary?.firstDecision !== 'keep' || inductionSummary.secondDecision !== 'revise') {
    throw new Error(`${claimedGoalIds[1]}: expected exact KEEP/REVISE source decisions`)
  }
  for (const goalId of claimedGoalIds) {
    const kind = ledger.decisions.find((decision) => decision.goalId === goalId)
    if (kind?.semanticKind !== 'curricularAtomic' || kind.decisionStatus !== 'authoritative') {
      throw new Error(`${goalId}: missing authoritative curricularAtomic classification`)
    }
  }

  const expectedGoals: GoalDescriptionRolloutSynthesisExpectedGoal[] = []
  const sources = new Map<string, {
    first: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
    second: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
  }>()
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
    if (stableGoalBookJson(firstInput) !== stableGoalBookJson(secondInput)) throw new Error(`${goalId}: blind inputs differ`)
    const canonicalContext = buildGoalDescriptionCanonicalContext(canonicalGoal)
    if (stableGoalBookJson(firstInput.canonicalContext) !== stableGoalBookJson(canonicalContext)) {
      throw new Error(`${goalId}: canonical goal or direct review context drifted`)
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
      firstSource: first.source,
      secondSource: second.source,
    })
    sources.set(goalId, { first: first.source, second: second.source })
  }

  const completedAtValues = [...dual.first.resultPairs, ...dual.second.resultPairs]
    .map(({ run }) => Date.parse(run.completedAt))
  if (completedAtValues.length === 0 || completedAtValues.some((value) => !Number.isFinite(value))) {
    throw new Error('Physics B033s source runs must have valid completion timestamps')
  }
  const synthesizedAt = new Date(Math.max(...completedAtValues) + 1000).toISOString()
  const firstGoal = expectedGoals[0]
  if (!firstGoal) throw new Error('Physics B033s claimed scope is empty')
  const expectedBindings = {
    batch: {
      batchId: dual.prepared.manifest.batchId,
      batchManifestDigest: sha256(batchManifestBytes),
      configDigest: sha256(configBytes),
      bundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint,
      bookDigest: dual.first.input.bookDigest as GoalDescriptionSynthesisDigest,
      reviewInputFingerprint: dual.first.input.reviewInputFingerprint as GoalDescriptionSynthesisDigest,
      dualSummaryDigest: sha256(dual.bytes),
      canonicalLandscapeDigest: sha256(landscapeBytes),
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
  const manifestId = 'physik-b033s-stable-current-adjudicated-2-v1-openai-codex-20260905'
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
      const decision: GoalDescriptionRolloutSynthesisDecisionManifest['decisions'][number] = {
        decisionId: `${manifestId}-decision-${String(index + 1).padStart(3, '0')}`,
        goalId: goal.goalId,
        effectiveSemanticKind: goal.effectiveSemanticKind,
        goalFingerprint: goal.goalFingerprint,
        pageFingerprint: goal.pageFingerprint,
        goalReviewContextFingerprint: goal.goalReviewContextFingerprint,
        finalText: goal.finalText,
        resolutionDecision: 'keep_current',
        evidenceRound: authored.evidenceRound,
        records: {
          first: { recordId: source.first.binding.recordId, recordDigest: source.first.binding.recordDigest },
          second: { recordId: source.second.binding.recordId, recordDigest: source.second.binding.recordDigest },
        },
        rationaleDe: authored.rationaleDe,
        rationaleEn: authored.rationaleEn,
      }
      if (goal.goalId === claimedGoalIds[1]) {
        assertTrimmed(authored.revisionDissentRationaleDe, `${goal.goalId}.revisionDissentRationaleDe`)
        assertTrimmed(authored.revisionDissentRationaleEn, `${goal.goalId}.revisionDissentRationaleEn`)
        if (source.second.record.decision !== 'revise') throw new Error(`${goal.goalId}: second source is no longer REVISE`)
        decision.revisionDissent = {
          sourceRound: 'second',
          proposedDescriptionDe: source.second.record.proposedDescriptionDe as string,
          proposedDescriptionEn: source.second.record.proposedDescriptionEn as string,
          disposition: 'rejected_keep_current',
          rationaleDe: authored.revisionDissentRationaleDe,
          rationaleEn: authored.revisionDissentRationaleEn,
        }
      }
      return decision
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
      resolutionId: `physics-b033s-stable-current-adjudicated-2-v1-resolution-${goal.goalId}`,
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
      throw new Error(`${goal.goalId}: ${validation.errors.join(' | ') || 'resolution is not strict complete'}`)
    }
    const bytes = jsonBytes(resolution)
    const relativeResolutionPath = `${resolutionDirectoryName}/${goal.goalId}.resolution.json`
    resolutionArtifacts.push({ path: join(sourceDirectory, relativeResolutionPath), bytes })
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
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-standalone-batch-resolution-index.schema.json',
    schemaVersion: 2,
    indexContract: 'goal-description-standalone-batch-resolution-index-v1',
    artifactSetId: `${dual.prepared.manifest.batchId}-stable-current-adjudicated-2`,
    subject: dual.prepared.manifest.subjectLabel,
    semanticKind: 'curricularAtomic',
    batchGoalIds: [...claimedGoalIds],
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
    receiptId: 'physik-b033s-stable-current-adjudicated-2-v1-20260905',
    purpose: 'Hash-bound bounded integration of exactly one KEEP/KEEP and one adjudicated KEEP/REVISE current B033s goal; all other B033s goals remain excluded.',
    sourceBatchId: dual.prepared.manifest.batchId,
    sourceCampaignGoalCount: dual.summary.goalCount,
    sourceDualSummaryDigest: sha256(dual.bytes),
    importedBundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint,
    currentCanonicalLandscapeDigest: sha256(landscapeBytes),
    semanticKindLedgerDigest: sha256(ledgerBytes),
    authoringPath: 'stable-current-adjudicated-2-v1.authoring.json',
    authoringDigest: sha256(authoringBytes),
    synthesisManifestPath: synthesisRelativePath,
    synthesisManifestDigest: sha256(synthesisBytes),
    synthesisManifestFingerprint: synthesisManifest.manifestFingerprint,
    resolutionIndexPath: `resolution-index.${outputStem}.json`,
    resolutionIndexDigest: sha256(indexBytes),
    claimedGoalIds: [...claimedGoalIds],
    excludedGoalIds: [...excludedGoalIds],
    safeguards: {
      exactCampaignPartitionRequired: true,
      exactKeepKeepAndKeepRevisePatternRequired: true,
      rejectedRevisionTextByteBound: true,
      individualResolutionsFreshlyValidated: true,
      staleCanonicalContextFailsClosed: true,
      excludedScopeFailsClosed: true,
      centralRegistrationPerformed: false,
    },
  }
  const artifacts = [
    { path: synthesisPath, bytes: synthesisBytes },
    ...resolutionArtifacts,
    { path: indexPath, bytes: indexBytes },
    { path: receiptPath, bytes: jsonBytes(receipt) },
  ]
  if (write) {
    execFileSync(process.execPath, ['scripts/check_openai_plugin_review_freeze.mjs'], {
      cwd: repositoryRoot,
      stdio: 'inherit',
    })
  }
  await writeAllOrRequireExact(artifacts)
  console.log(
    `${write ? 'Materialized' : 'Verified'} Physics B033s bounded resolutions: strict=${indexEntries.length}/${claimedGoalIds.length}; excluded=${excludedGoalIds.length}; index=${indexPath}`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
