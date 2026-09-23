import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoalDescriptionRolloutResolutionSynthesis } from './goalDescriptionRolloutResolutionSynthesis'
import { loadGoalBookBuildInputs, stableGoalBookJson, type GoalBookModel } from './goalBookModel'
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
import {
  validateLegacyResolutionIndexSnapshot,
  type AggregateResolutionIndex,
} from './reportDeepUnderstandingRollout'

type Decision = {
  goalId: string
  evidenceRound: 'first' | 'second'
  rationaleDe: string
  rationaleEn: string
  revisionDissentRationaleDe: string
  revisionDissentRationaleEn: string
}

type Authoring = {
  schemaVersion: 1
  artifactType: 'goal-description-stable-current-adjudication-authoring-v1'
  adjudicationId: string
  synthesizedBy: string
  decisions: Decision[]
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const rollout = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-23'
const sourceName = 'm7-q4-lk-complex-number-theory-20-current-20260923-v1'
const source = join(root, rollout, sourceName)
const configPath = join(root, rollout, `${sourceName}.config.json`)
const authoringPath = join(source, 'stable-current-dissent-2-v1.authoring.json')
const outputStem = 'stable-current-dissent-2-v1'
const synthesisPath = `synthesis-decisions.${outputStem}.json`
const resolutionDirectory = `resolutions-${outputStem}`
const indexPath = `resolution-index.${outputStem}.json`
const receiptPath = `${outputStem}.compatibility-receipt.json`
const manifestId = 'mathematik-m7-q4-lk-stable-current-dissent-2-v1-openai-codex-20260923'
const goalIds = [
  '8e18154d-41d6-592e-ba98-537edad338e8',
  'e4eaff7f-1e3d-54ea-8a59-02864948b5eb',
] as const

const sha256 = (value: Buffer | string): GoalDescriptionSynthesisDigest => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const same = (left: unknown, right: unknown): boolean => (
  stableGoalBookJson(left) === stableGoalBookJson(right)
)
const readJson = async <T>(path: string): Promise<T> => JSON.parse((await readFile(path)).toString('utf8')) as T
const sameOrdered = (left: readonly string[], right: readonly string[]): boolean => (
  left.length === right.length && left.every((entry, index) => entry === right[index])
)
const assertText: (value: unknown, label: string) => asserts value is string = (value, label) => {
  if (typeof value !== 'string' || value.trim() !== value || value.length === 0) {
    throw new Error(`${label} must be non-blank and trimmed`)
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
const verifyOrWrite = async (artifacts: Array<{ path: string; bytes: Buffer }>, write: boolean): Promise<void> => {
  for (const artifact of artifacts) {
    const existing = await readOptional(artifact.path)
    if (existing) {
      if (!existing.equals(artifact.bytes)) throw new Error(`Existing Q4 LK dissent artifact is stale: ${relative(root, artifact.path)}`)
      continue
    }
    if (!write) throw new Error(`Missing Q4 LK dissent artifact: ${relative(root, artifact.path)}`)
    await mkdir(dirname(artifact.path), { recursive: true })
    await writeFile(artifact.path, artifact.bytes, { flag: 'wx' })
  }
}

const main = async (): Promise<void> => {
  const args = process.argv.slice(2)
  if (args.length !== 1 || !['--write', '--check'].includes(args[0])) {
    throw new Error('Usage: tsx app/scripts/materializeMathM7Q4LkDissentTwoResolutions.ts --write|--check')
  }
  const write = args[0] === '--write'
  const [dual, configBytes, batchManifestBytes, canonicalBytes, ledgerBytes, authoringBytes, frozenModel] = await Promise.all([
    materializeGoalDescriptionRolloutBatchDualSummary(configPath, false),
    readFile(configPath),
    readFile(join(source, 'batch-manifest.json')),
    readFile(join(root, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')),
    readFile(join(root, 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json')),
    readFile(authoringPath),
    readJson<GoalBookModel>(join(source, 'bundle/book-model.json')),
  ])
  const config = JSON.parse(configBytes.toString('utf8')) as {
    baseGoalBookConfigPath: string
    bookId: string
    title: string
    goalIds: string[]
  }
  const landscape = JSON.parse(canonicalBytes.toString('utf8')) as {
    subject: string
    goals: Array<Record<string, unknown>>
  }
  const ledger = JSON.parse(ledgerBytes.toString('utf8')) as {
    decisions: Array<{ goalId?: string; semanticKind?: string; decisionStatus?: string }>
  }
  const authoring = JSON.parse(authoringBytes.toString('utf8')) as Authoring
  if (
    authoring.schemaVersion !== 1
    || authoring.artifactType !== 'goal-description-stable-current-adjudication-authoring-v1'
    || authoring.adjudicationId !== 'mathematik-m7-q4-lk-stable-current-dissent-2-v1-20260923'
    || !sameOrdered(authoring.decisions.map(({ goalId }) => goalId), goalIds)
  ) throw new Error('Q4 LK authoring identity or bounded goal scope changed')
  assertText(authoring.synthesizedBy, 'synthesizedBy')
  if (
    landscape.subject !== 'Mathematik'
    || config.goalIds.length !== 20
    || dual.summary.goalCount !== 20
    || dual.summary.counts.requiresSynthesis !== 20
    || !sameOrdered(dual.prepared.manifest.goalIds, config.goalIds)
    || goalIds.some((goalId) => !config.goalIds.includes(goalId))
  ) throw new Error('Q4 LK campaign, current configuration, or two-goal subset changed')
  if (frozenModel.digest !== dual.prepared.manifest.artifacts.bookModelDigest) {
    throw new Error('Prepared GoalBook model no longer matches its frozen batch manifest')
  }
  const base = await loadGoalBookBuildInputs(config.baseGoalBookConfigPath)
  const current = buildGoalDescriptionRolloutSubsetModel({
    baseModel: base.model,
    goalIds: config.goalIds,
    bookId: config.bookId,
    title: config.title,
  })
  const atomicIds = new Set(ledger.decisions
    .filter(({ semanticKind, decisionStatus }) => semanticKind === 'curricularAtomic' && decisionStatus === 'authoritative')
    .map(({ goalId }) => goalId)
    .filter((goalId): goalId is string => typeof goalId === 'string'))
  const sources = new Map<string, {
    first: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
    second: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
  }>()
  const expectedGoals: GoalDescriptionRolloutSynthesisExpectedGoal[] = []
  const currentBindings: Array<Record<string, string>> = []
  for (const goalId of goalIds) {
    if (!atomicIds.has(goalId)) throw new Error(`${goalId}: not authoritative current curricularAtomic`)
    const summary = dual.summary.goals.find((entry) => entry.goalId === goalId)
    if (summary?.firstDecision !== 'keep' || summary.secondDecision !== 'revise') {
      throw new Error(`${goalId}: expected one independent KEEP and one independent REVISE`)
    }
    const first = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.first, goalId, label: 'First' })
    const second = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.second, goalId, label: 'Second' })
    if (first.errors.length || second.errors.length || !first.source?.record || !second.source?.record) {
      throw new Error(`${goalId}: invalid independent review sources: ${[...first.errors, ...second.errors].join(' | ')}`)
    }
    if (first.source.decision !== 'keep' || second.source.decision !== 'revise') {
      throw new Error(`${goalId}: exact source decision pattern changed`)
    }
    const firstInput = dual.first.input.goals.find((entry) => entry.goalId === goalId)
    const secondInput = dual.second.input.goals.find((entry) => entry.goalId === goalId)
    const canonicalGoal = landscape.goals.find((entry) => entry.id === goalId)
    const frozenPage = frozenModel.pages.find((entry) => entry.goalId === goalId)
    const currentPage = current.pages.find((entry) => entry.goalId === goalId)
    if (!firstInput || !secondInput || !canonicalGoal || !frozenPage || !currentPage) {
      throw new Error(`${goalId}: missing source input, canonical goal, or page`)
    }
    if (
      !same(firstInput, secondInput)
      || !same(firstInput.canonicalContext, buildGoalDescriptionCanonicalContext(canonicalGoal))
      || !same(firstInput.reviewContext.page, frozenPage)
      || !same(firstInput.reviewContext.page, currentPage)
    ) throw new Error(`${goalId}: direct goal, page, or image context drift requires a new targeted review`)
    const finalText = {
      titleDe: firstInput.currentTitleDe,
      titleEn: firstInput.currentTitleEn,
      descriptionDe: firstInput.currentDescriptionDe,
      descriptionEn: firstInput.currentDescriptionEn,
    }
    if (!same(finalText, {
      titleDe: canonicalGoal.title,
      titleEn: canonicalGoal.titleEn,
      descriptionDe: canonicalGoal.description,
      descriptionEn: canonicalGoal.descriptionEn,
    })) throw new Error(`${goalId}: canonical bilingual text is no longer exact-current`)
    const visualization = currentPage.visualization
    if (!visualization?.url || !visualization.originalDigest) throw new Error(`${goalId}: missing reviewed visualization`)
    if (!visualization.url.startsWith(`/assets/goal-visualizations/mathematik/${goalId}/`)) {
      throw new Error(`${goalId}: visualization URL escaped its goal directory`)
    }
    const publicRoot = join(root, 'app/public')
    const imagePath = resolve(publicRoot, `.${visualization.url}`)
    const publicRelative = relative(publicRoot, imagePath)
    if (publicRelative === '..' || publicRelative.startsWith(`..${sep}`)) {
      throw new Error(`${goalId}: visualization path escaped public assets`)
    }
    const imageDigest = sha256(await readFile(imagePath))
    if (imageDigest !== visualization.originalDigest) throw new Error(`${goalId}: actual reviewed image bytes changed`)
    const contextFingerprint = fingerprintGoalDescriptionReviewContext(firstInput)
    if (
      first.source.binding.goalReviewContextFingerprint !== contextFingerprint
      || second.source.binding.goalReviewContextFingerprint !== contextFingerprint
    ) throw new Error(`${goalId}: independent record contexts do not match current review input`)
    currentBindings.push({
      goalId,
      canonicalContextFingerprint: sha256(stableGoalBookJson(firstInput.canonicalContext)),
      pageFingerprint: firstInput.pageFingerprint,
      goalReviewContextFingerprint: contextFingerprint,
      imagePath: relative(root, imagePath),
      imageDigest,
    })
    expectedGoals.push({
      goalId,
      effectiveSemanticKind: 'curricularAtomic',
      goalFingerprint: firstInput.goalFingerprint as GoalDescriptionSynthesisDigest,
      pageFingerprint: firstInput.pageFingerprint as GoalDescriptionSynthesisDigest,
      goalReviewContextFingerprint: contextFingerprint,
      finalText,
      firstSource: first.source,
      secondSource: second.source,
    })
    sources.set(goalId, { first: first.source, second: second.source })
  }

  const firstGoal = expectedGoals[0]
  if (!firstGoal) throw new Error('Q4 LK claimed scope is empty')
  const completionTimes = [...dual.first.resultPairs, ...dual.second.resultPairs]
    .map(({ run }) => Date.parse(run.completedAt))
  if (completionTimes.length !== 2 || completionTimes.some((value) => !Number.isFinite(value))) {
    throw new Error('Q4 LK independent run completion times are invalid')
  }
  const expected = {
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
    synthesizedAt: new Date(Math.max(...completionTimes) + 1000).toISOString(),
    goals: expectedGoals,
  }
  const payload: Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'> = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
    schemaVersion: 1,
    synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
    manifestId,
    authority: 'ai_synthesis',
    synthesizedBy: authoring.synthesizedBy,
    synthesizedAt: expected.synthesizedAt,
    batch: expected.batch,
    rounds: expected.rounds,
    decisions: expectedGoals.map((goal, index) => {
      const authored = authoring.decisions[index]
      const source = sources.get(goal.goalId)
      if (!authored || authored.goalId !== goal.goalId || !source?.first.record || !source.second.record) {
        throw new Error(`${goal.goalId}: incomplete source or adjudication alignment`)
      }
      for (const [key, value] of Object.entries(authored)) {
        if (key !== 'goalId' && key !== 'evidenceRound') assertText(value, `${goal.goalId}.${key}`)
      }
      if (authored.evidenceRound !== 'first') throw new Error(`${goal.goalId}: KEEP evidence must come from Round A`)
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
        revisionDissent: {
          sourceRound: 'second' as const,
          disposition: 'rejected_keep_current' as const,
          proposedDescriptionDe: source.second.record.proposedDescriptionDe as string,
          proposedDescriptionEn: source.second.record.proposedDescriptionEn as string,
          rationaleDe: authored.revisionDissentRationaleDe,
          rationaleEn: authored.revisionDissentRationaleEn,
        },
        rationaleDe: authored.rationaleDe,
        rationaleEn: authored.rationaleEn,
      }
    }),
  }
  const synthesis: GoalDescriptionRolloutSynthesisDecisionManifest = {
    ...payload,
    manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(payload),
  }
  const manifestValidation = await validateGoalDescriptionRolloutSynthesisDecisionManifest({ manifest: synthesis, expected })
  if (manifestValidation.errors.length) throw new Error(`Q4 LK synthesis invalid: ${manifestValidation.errors.join(' | ')}`)
  const synthesisBytes = jsonBytes(synthesis)
  const resolutions: Array<{ path: string; bytes: Buffer }> = []
  const entries: AggregateResolutionIndex['resolutions'] = []
  for (const goal of expectedGoals) {
    const source = sources.get(goal.goalId)
    const decision = synthesis.decisions.find((entry) => entry.goalId === goal.goalId)
    const summary = dual.summary.goals.find((entry) => entry.goalId === goal.goalId)
    if (!source || !decision || !summary) throw new Error(`${goal.goalId}: incomplete resolution source`)
    const resolution = buildGoalDescriptionDualRoundResolution({
      resolutionId: `${manifestId}-resolution-${goal.goalId}`,
      goalId: goal.goalId,
      effectiveSemanticKind: 'curricularAtomic',
      decision: 'keep_current',
      synthesis: buildGoalDescriptionRolloutResolutionSynthesis({
        batchId: synthesis.batch.batchId,
        manifest: synthesis,
        decision,
        summaryGoal: summary,
        firstSource: source.first,
        secondSource: source.second,
      }),
      dualSummaryBytes: dual.bytes,
      currentInput: dual.first.input,
      firstSource: source.first,
      secondSource: source.second,
      synthesisDecisionManifest: {
        contract: synthesis.synthesisContract,
        manifestPath: synthesisPath,
        manifestId: synthesis.manifestId,
        manifestDigest: sha256(synthesisBytes),
        manifestFingerprint: synthesis.manifestFingerprint,
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
        manifest: synthesis,
        manifestBytes: synthesisBytes,
        manifestPath: synthesisPath,
      },
    })
    if (validation.errors.length || !validation.strictDescriptionComplete) {
      throw new Error(`${goal.goalId}: native D resolution invalid: ${validation.errors.join(' | ') || 'not strict D complete'}`)
    }
    const bytes = jsonBytes(resolution)
    const relativePath = `${resolutionDirectory}/${goal.goalId}.resolution.json`
    resolutions.push({ path: join(root, rollout, sourceName, relativePath), bytes })
    entries.push({
      goalId: goal.goalId,
      titleDe: goal.finalText.titleDe,
      groupId: dual.prepared.manifest.batchId,
      decision: resolution.decision,
      resolutionPath: relativePath,
      resolutionDigest: sha256(bytes),
      resolutionFingerprint: resolution.resolutionFingerprint,
      strictDescriptionComplete: true,
    })
  }
  const index: AggregateResolutionIndex = {
    schemaVersion: 1,
    artifactSetId: `${dual.prepared.manifest.batchId}-${outputStem}`,
    subject: 'Mathematik',
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: entries.length,
    curriculumAtomicDenominator: base.model.pages.length,
    descriptionReviewPercentage: Number(((entries.length / base.model.pages.length) * 100).toFixed(1)),
    groups: [{
      groupId: dual.prepared.manifest.batchId,
      artifactDirectory: '.',
      dualSummaryPath: 'dual-summary.json',
      dualSummaryDigest: sha256(dual.bytes),
      campaignGoalCount: dual.summary.goalCount,
      resolvedGoalCount: entries.length,
    }],
    resolutions: entries,
  }
  const indexErrors = validateLegacyResolutionIndexSnapshot(index)
  if (indexErrors.length) throw new Error(`Q4 LK partial index invalid: ${indexErrors.join(' | ')}`)
  const indexBytes = jsonBytes(index)
  const receipt = {
    schemaVersion: 1,
    receiptId: `${manifestId}-receipt`,
    status: 'ai_synthesis_candidate_not_registered',
    purpose: 'Bounded two-goal partial D resolution from a 20-goal KEEP/REVISE campaign; no other Q4 LK goal is claimed.',
    sourceBatchId: dual.prepared.manifest.batchId,
    sourceCampaignGoalCount: dual.summary.goalCount,
    claimedGoalIds: [...goalIds],
    excludedGoalCount: dual.summary.goalCount - goalIds.length,
    sourceConfigDigest: sha256(configBytes),
    sourceBatchManifestDigest: sha256(batchManifestBytes),
    sourceDualSummaryDigest: sha256(dual.bytes),
    sourceBundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint,
    currentCanonicalLandscapeDigest: sha256(canonicalBytes),
    currentSemanticKindLedgerDigest: sha256(ledgerBytes),
    authoringPath: 'stable-current-dissent-2-v1.authoring.json',
    authoringDigest: sha256(authoringBytes),
    sourcePreparedBookDigest: frozenModel.digest,
    currentWholeBookDigest: base.model.digest,
    wholeBookDigestDriftDoesNotAuthorizeTargetDrift: true,
    currentGoalPageAndImageBindings: currentBindings,
    synthesisManifestPath: synthesisPath,
    synthesisManifestDigest: sha256(synthesisBytes),
    resolutionIndexPath: indexPath,
    resolutionIndexDigest: sha256(indexBytes),
    resolutionIndexFormat: 'legacy-schema-v1-partial-group',
    safeguards: {
      bothIndependentReviewRecordsExactBound: true,
      keepRevisePatternExactBound: true,
      rejectedRevisionTextsExactBound: true,
      directCanonicalPageAndImageContextsRechecked: true,
      twoNativeStrictResolutionsValidated: true,
      partialIndexCampaignGoalCountMatchesTwentyGoalSource: true,
      centralRegistryOrLedgerUpdated: false,
      humanApprovalClaimed: false,
    },
  }
  await verifyOrWrite([
    { path: join(source, synthesisPath), bytes: synthesisBytes },
    ...resolutions,
    { path: join(source, indexPath), bytes: indexBytes },
    { path: join(source, receiptPath), bytes: jsonBytes(receipt) },
  ], write)
  console.log(`${write ? 'Materialized' : 'Verified'} Math Q4 LK dissent pair: strict D=${entries.length}/${goalIds.length}; index=${relative(root, join(source, indexPath))}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
