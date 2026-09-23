import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadGoalBookBuildInputs, stableGoalBookJson, type GoalBookModel } from './goalBookModel'
import { buildGoalDescriptionRolloutResolutionSynthesis } from './goalDescriptionRolloutResolutionSynthesis'
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
import { validateLegacyResolutionIndexSnapshot } from './reportDeepUnderstandingRollout'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const rollout = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-23'
const sourceName = 'm7-image-delta-three-current-20260923-v1'
const outputName = 'm7-image-delta-three-keep-two-partial-20260923-v1'
const source = join(root, rollout, sourceName)
const output = join(root, rollout, outputName)
const configPath = join(root, rollout, `${sourceName}.config.json`)
const blockedGoalId = '163dd583-8308-53f0-b60d-34588787988d'
const claimed = [
  {
    goalId: '6fc9246a-9448-4cdb-b627-cf20ea1c65d3',
    evidenceRound: 'second' as const,
    rationaleDe: 'Beide unabhängigen Runden bestätigen den aktuellen zweisprachigen Zieltext. Die zweite Evidenzfassung prüft Nullkombination und räumliche Deutung an einer neuen Konfiguration besonders konkret; die erste bleibt als gebundene, kompatible Perspektive erhalten. Die gesondert erkannte resourceLink-Metadatenungenauigkeit wurde außerhalb des Zieltexts korrigiert.',
    rationaleEn: 'Both independent rounds confirm the current bilingual goal text. The second evidence formulation tests the zero combination and spatial interpretation particularly concretely in a new configuration; the first remains bound as a compatible perspective. The separately identified resource-link metadata inaccuracy was corrected outside the goal text.',
  },
  {
    goalId: 'fb4dcd2a-a6a9-5371-a2fc-95348ee130e0',
    evidenceRound: 'second' as const,
    rationaleDe: 'Beide unabhängigen Runden bestätigen den aktuellen zweisprachigen Zieltext. Die zweite Evidenzfassung macht den qualitativen Änderungs- und Transferfall konkret, ohne eine ungeprüfte Modellverbesserung als erwiesen auszugeben; die erste bleibt als gebundene, kompatible Perspektive erhalten.',
    rationaleEn: 'Both independent rounds confirm the current bilingual goal text. The second evidence formulation makes the qualitative change and transfer case concrete without presenting an untested model improvement as established; the first remains bound as a compatible perspective.',
  },
]
const manifestId = 'mathematik-m7-image-delta-three-keep-two-partial-20260923-v1'

const sha256 = (bytes: Buffer | string): GoalDescriptionSynthesisDigest =>
  `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const jsonBytes = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const same = (left: unknown, right: unknown) => stableGoalBookJson(left) === stableGoalBookJson(right)
const readJson = async <T>(path: string): Promise<T> => JSON.parse((await readFile(path)).toString('utf8')) as T

const verifyOrWrite = async (path: string, bytes: Buffer, write: boolean) => {
  let existing: Buffer | null = null
  try {
    existing = await readFile(path)
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
  }
  if (existing) {
    if (!existing.equals(bytes)) throw new Error(`Existing D3 partial artifact is stale: ${relative(root, path)}`)
    return
  }
  if (!write) throw new Error(`Missing D3 partial artifact: ${relative(root, path)}`)
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, bytes, { flag: 'wx' })
}

const main = async () => {
  const args = process.argv.slice(2)
  if (args.length !== 1 || !['--write', '--check'].includes(args[0])) {
    throw new Error('Usage: tsx app/scripts/materializeMathM7ImageDeltaThreePartial.ts --write|--check')
  }
  const write = args[0] === '--write'
  const [dual, config, preparedModel, batchManifestBytes] = await Promise.all([
    materializeGoalDescriptionRolloutBatchDualSummary(configPath, false),
    readJson<{ goalIds: string[]; baseGoalBookConfigPath: string; bookId: string; title: string }>(configPath),
    readJson<GoalBookModel>(join(source, 'bundle/book-model.json')),
    readFile(join(source, 'batch-manifest.json')),
  ])
  const campaignIds = dual.prepared.manifest.goalIds
  const claimedIds = claimed.map(({ goalId }) => goalId)
  if (
    campaignIds.length !== 3
    || dual.summary.goalCount !== 3
    || dual.summary.counts.requiresSynthesis !== 3
    || !same(campaignIds, config.goalIds)
    || new Set([...claimedIds, blockedGoalId]).size !== 3
    || campaignIds.some((goalId) => ![...claimedIds, blockedGoalId].includes(goalId))
  ) throw new Error('D3 source campaign/KEEP-two/BLOCK-one partition changed')
  for (const summary of dual.summary.goals) {
    const expected = summary.goalId === blockedGoalId ? 'block' : 'keep'
    if (summary.firstDecision !== expected || summary.secondDecision !== expected) {
      throw new Error(`${summary.goalId}: both independent decisions must remain ${expected}`)
    }
  }

  const base = await loadGoalBookBuildInputs(config.baseGoalBookConfigPath)
  const current = buildGoalDescriptionRolloutSubsetModel({
    baseModel: base.model,
    goalIds: config.goalIds,
    bookId: config.bookId,
    title: config.title,
  })
  if (
    preparedModel.digest !== dual.prepared.manifest.artifacts.bookModelDigest
    || current.pages.length !== 3
    || base.model.pages.length !== dual.prepared.manifest.curriculumAtomicDenominatorAtPreparation
  ) throw new Error('D3 prepared model/current curricularAtomic denominator changed')
  const landscapePath = join(root, dual.prepared.manifest.source.landscapePath)
  const canonicalBytes = await readFile(landscapePath)
  const landscape = JSON.parse(canonicalBytes.toString('utf8')) as {
    subject: string
    goals: Array<Record<string, unknown>>
  }
  if (landscape.subject !== 'Mathematik') throw new Error('D3 canonical subject is not Mathematik')
  const sources = new Map<string, {
    first: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
    second: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
  }>()
  const expectedGoals: GoalDescriptionRolloutSynthesisExpectedGoal[] = []
  const imageBindings: Array<Record<string, unknown>> = []
  for (const choice of claimed) {
    const goalId = choice.goalId
    const first = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.first, goalId, label: 'First' })
    const second = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.second, goalId, label: 'Second' })
    if (first.errors.length || second.errors.length || !first.source?.record || !second.source?.record) {
      throw new Error(`${goalId}: missing exact validated review source: ${[...first.errors, ...second.errors].join(' | ')}`)
    }
    const input = dual.first.input.goals.find((goal) => goal.goalId === goalId)
    const secondInput = dual.second.input.goals.find((goal) => goal.goalId === goalId)
    const preparedPage = preparedModel.pages.find((page) => page.goalId === goalId)
    const currentPage = current.pages.find((page) => page.goalId === goalId)
    const canonicalGoal = landscape.goals.find((goal) => goal.id === goalId)
    if (!input || !secondInput || !preparedPage || !currentPage || !canonicalGoal) {
      throw new Error(`${goalId}: missing current page, source input, or canonical goal`)
    }
    const contextFingerprint = fingerprintGoalDescriptionReviewContext(input)
    if (
      first.source.decision !== 'keep'
      || second.source.decision !== 'keep'
      || !same(input, secondInput)
      || !same(currentPage, preparedPage)
      || !same(currentPage, input.reviewContext.page)
      || !same(buildGoalDescriptionCanonicalContext(canonicalGoal), input.canonicalContext)
      || first.source.binding.goalReviewContextFingerprint !== contextFingerprint
      || second.source.binding.goalReviewContextFingerprint !== contextFingerprint
      || !same({
        titleDe: canonicalGoal.title,
        titleEn: canonicalGoal.titleEn,
        descriptionDe: canonicalGoal.description,
        descriptionEn: canonicalGoal.descriptionEn,
      }, {
        titleDe: input.currentTitleDe,
        titleEn: input.currentTitleEn,
        descriptionDe: input.currentDescriptionDe,
        descriptionEn: input.currentDescriptionEn,
      })
    ) throw new Error(`${goalId}: canonical/page/review context drift requires targeted new review`)
    const visualization = currentPage.visualization
    if (!visualization?.url || !visualization.originalDigest) throw new Error(`${goalId}: missing reviewed image`)
    if (!visualization.url.startsWith(`/assets/goal-visualizations/mathematik/${goalId}/`)) {
      throw new Error(`${goalId}: image URL is outside its goal directory`)
    }
    const publicRoot = join(root, 'app/public')
    const imagePath = resolve(publicRoot, `.${visualization.url}`)
    if (relative(publicRoot, imagePath).startsWith(`..${sep}`)) throw new Error(`${goalId}: image escapes public root`)
    const actualImageDigest = sha256(await readFile(imagePath))
    if (actualImageDigest !== visualization.originalDigest) throw new Error(`${goalId}: reviewed image bytes changed`)
    imageBindings.push({
      goalId,
      pageFingerprint: input.pageFingerprint,
      goalReviewContextFingerprint: contextFingerprint,
      imagePublicPath: relative(root, imagePath),
      imageDigest: actualImageDigest,
    })
    expectedGoals.push({
      goalId,
      effectiveSemanticKind: 'curricularAtomic',
      goalFingerprint: input.goalFingerprint as GoalDescriptionSynthesisDigest,
      pageFingerprint: input.pageFingerprint as GoalDescriptionSynthesisDigest,
      goalReviewContextFingerprint: contextFingerprint,
      finalText: {
        titleDe: input.currentTitleDe,
        titleEn: input.currentTitleEn,
        descriptionDe: input.currentDescriptionDe,
        descriptionEn: input.currentDescriptionEn,
      },
      firstSource: first.source,
      secondSource: second.source,
    })
    sources.set(goalId, { first: first.source, second: second.source })
  }

  const firstGoal = expectedGoals[0]
  if (!firstGoal) throw new Error('D3 KEEP-two selection is empty')
  const completionDates = [...dual.first.resultPairs, ...dual.second.resultPairs]
    .map(({ run }) => Date.parse(run.completedAt))
  if (completionDates.length !== 2 || completionDates.some((value) => !Number.isFinite(value))) {
    throw new Error('D3 independent runs lack exact valid completion times')
  }
  const expected = {
    batch: {
      batchId: dual.prepared.manifest.batchId,
      batchManifestDigest: sha256(batchManifestBytes),
      configDigest: dual.prepared.manifest.configDigest,
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
    synthesizedAt: new Date(Math.max(...completionDates) + 1000).toISOString(),
    goals: expectedGoals,
  }
  const payload: Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'> = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
    schemaVersion: 1,
    synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
    manifestId,
    authority: 'ai_synthesis',
    synthesizedBy: 'OpenAI Codex (exact model identifier unavailable); independent dual-review synthesis candidate',
    synthesizedAt: expected.synthesizedAt,
    batch: expected.batch,
    rounds: expected.rounds,
    decisions: expectedGoals.map((goal, index) => {
      const source = sources.get(goal.goalId)!
      const choice = claimed[index]
      return {
        decisionId: `${manifestId}-decision-${String(index + 1).padStart(3, '0')}`,
        goalId: goal.goalId,
        effectiveSemanticKind: goal.effectiveSemanticKind,
        goalFingerprint: goal.goalFingerprint,
        pageFingerprint: goal.pageFingerprint,
        goalReviewContextFingerprint: goal.goalReviewContextFingerprint,
        finalText: goal.finalText,
        resolutionDecision: 'keep_current' as const,
        evidenceRound: choice.evidenceRound,
        records: {
          first: { recordId: source.first.binding.recordId, recordDigest: source.first.binding.recordDigest },
          second: { recordId: source.second.binding.recordId, recordDigest: source.second.binding.recordDigest },
        },
        rationaleDe: choice.rationaleDe,
        rationaleEn: choice.rationaleEn,
      }
    }),
  }
  const synthesis: GoalDescriptionRolloutSynthesisDecisionManifest = {
    ...payload,
    manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(payload),
  }
  const synthesisValidation = await validateGoalDescriptionRolloutSynthesisDecisionManifest({ manifest: synthesis, expected })
  if (synthesisValidation.errors.length) {
    throw new Error(`D3 partial synthesis validation: ${synthesisValidation.errors.join(' | ')}`)
  }
  const synthesisBytes = jsonBytes(synthesis)
  const resolutionArtifacts: Array<{ path: string; bytes: Buffer }> = []
  const entries: Array<{
    goalId: string
    titleDe: string
    groupId: string
    decision: string
    resolutionPath: string
    resolutionDigest: GoalDescriptionSynthesisDigest
    resolutionFingerprint: string
    strictDescriptionComplete: true
  }> = []
  for (const goal of expectedGoals) {
    const source = sources.get(goal.goalId)!
    const decision = synthesis.decisions.find(({ goalId }) => goalId === goal.goalId)!
    const summaryGoal = dual.summary.goals.find(({ goalId }) => goalId === goal.goalId)!
    const resolution = buildGoalDescriptionDualRoundResolution({
      resolutionId: `${manifestId}-resolution-${goal.goalId}`,
      goalId: goal.goalId,
      effectiveSemanticKind: 'curricularAtomic',
      decision: 'keep_current',
      synthesis: buildGoalDescriptionRolloutResolutionSynthesis({
        batchId: dual.prepared.manifest.batchId,
        manifest: synthesis,
        decision,
        summaryGoal,
        firstSource: source.first,
        secondSource: source.second,
      }),
      dualSummaryBytes: dual.bytes,
      currentInput: dual.first.input,
      firstSource: source.first,
      secondSource: source.second,
      synthesisDecisionManifest: {
        contract: synthesis.synthesisContract,
        manifestPath: 'synthesis-decisions.json',
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
        manifestPath: 'synthesis-decisions.json',
      },
    })
    if (validation.errors.length || !validation.strictDescriptionComplete) {
      throw new Error(`${goal.goalId}: native D3 partial resolution invalid: ${validation.errors.join(' | ') || 'not strict D complete'}`)
    }
    const bytes = jsonBytes(resolution)
    const resolutionPath = `resolutions/${goal.goalId}.resolution.json`
    resolutionArtifacts.push({ path: join(output, resolutionPath), bytes })
    entries.push({
      goalId: goal.goalId,
      titleDe: goal.finalText.titleDe,
      groupId: dual.prepared.manifest.batchId,
      decision: resolution.decision,
      resolutionPath,
      resolutionDigest: sha256(bytes),
      resolutionFingerprint: resolution.resolutionFingerprint,
      strictDescriptionComplete: true,
    })
  }
  const index = {
    schemaVersion: 1 as const,
    artifactSetId: `${manifestId}-partial-group`,
    subject: 'Mathematik',
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: entries.length,
    curriculumAtomicDenominator: base.model.pages.length,
    descriptionReviewPercentage: Number(((entries.length / base.model.pages.length) * 100).toFixed(1)),
    synthesisDecisionManifest: {
      path: 'synthesis-decisions.json',
      digest: sha256(synthesisBytes),
      fingerprint: synthesis.manifestFingerprint,
    },
    groups: [{
      groupId: dual.prepared.manifest.batchId,
      artifactDirectory: `../${sourceName}`,
      dualSummaryPath: `../${sourceName}/dual-summary.json`,
      dualSummaryDigest: sha256(dual.bytes),
      campaignGoalCount: dual.summary.goalCount,
      resolvedGoalCount: entries.length,
    }],
    resolutions: entries,
  }
  const indexErrors = validateLegacyResolutionIndexSnapshot(index)
  if (indexErrors.length) throw new Error(`D3 partial-index validation: ${indexErrors.join(' | ')}`)
  const indexBytes = jsonBytes(index)
  const receipt = {
    schemaVersion: 1,
    receiptId: manifestId,
    status: 'ai_synthesis_candidate_not_registered',
    purpose: 'Partial D closure for exactly two current-page KEEP/KEEP goals from a three-goal independent D review; the LK/GK-scope BLOCK remains open.',
    sourceBatchId: dual.prepared.manifest.batchId,
    sourceCampaignGoalCount: 3,
    claimedGoalIds: claimedIds,
    blockedGoalId,
    blockedReason: 'Both independent reviews found an unresolved LK-only versus GK learner-facing projection conflict; no description or human approval is inferred.',
    sourceBundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint,
    sourceReviewInputFingerprint: dual.first.input.reviewInputFingerprint,
    sourceDualSummaryDigest: sha256(dual.bytes),
    preparedBaseGoalBookDigest: dual.prepared.manifest.source.baseBookDigest,
    preparedSubsetGoalBookDigest: preparedModel.digest,
    currentCanonicalLandscapeDigest: sha256(canonicalBytes),
    currentBaseGoalBookDigest: base.model.digest,
    currentSubsetGoalBookDigest: current.digest,
    globalBookDigestDriftObserved: (
      dual.prepared.manifest.source.baseBookDigest !== base.model.digest
      || preparedModel.digest !== current.digest
    ),
    globalBookDigestDriftDisposition: 'The prepared and current whole-book digests are provenance, not an equivalence claim. Each of the two claimed goals is rechecked against the live canonical context, complete GoalBook page, both review contexts and the exact image bytes. The blocked third goal and any unrelated global BookModel drift are not claimed.',
    claimedPageAndImageBindings: imageBindings,
    synthesisManifestPath: 'synthesis-decisions.json',
    synthesisManifestDigest: sha256(synthesisBytes),
    resolutionIndexPath: 'resolution-index.json',
    resolutionIndexDigest: sha256(indexBytes),
    noWholeBatchProgressClaim: true,
    noCanonicalOrRegistryOrQaEdits: true,
    noHumanApprovalClaim: true,
  }
  for (const artifact of [
    { path: join(output, 'synthesis-decisions.json'), bytes: synthesisBytes },
    ...resolutionArtifacts,
    { path: join(output, 'resolution-index.json'), bytes: indexBytes },
    { path: join(output, 'compatibility-receipt.json'), bytes: jsonBytes(receipt) },
  ]) await verifyOrWrite(artifact.path, artifact.bytes, write)
  console.log(`${write ? 'Materialized' : 'Verified'} Math D3 partial: strict D=${entries.length}/2, excluded BLOCK=${blockedGoalId}; index=${relative(root, join(output, 'resolution-index.json'))}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
