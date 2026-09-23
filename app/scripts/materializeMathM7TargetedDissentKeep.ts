import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoalDescriptionRolloutResolutionSynthesis } from './goalDescriptionRolloutResolutionSynthesis'
import { fingerprintSemanticKindSourceGoal, loadGoalBookBuildInputs, stableGoalBookJson, type GoalBookModel } from './goalBookModel'
import { buildGoalDescriptionRolloutSubsetModel, materializeGoalDescriptionRolloutBatchDualSummary } from './materializeGoalDescriptionRolloutBatch'
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
  type GoalDescriptionSynthesisDigest,
} from './validateGoalDescriptionRolloutSynthesisDecisionManifest'
import { validateLegacyResolutionIndexSnapshot, type AggregateResolutionIndex } from './reportDeepUnderstandingRollout'

type Authoring = {
  schemaVersion: 1
  artifactType: 'goal-description-targeted-dissent-keep-authoring-v1'
  sourceName: string
  outputStem: string
  manifestId: string
  expectedCampaignGoalCount: number
  goalId: string
  synthesizedBy: string
  rationaleDe: string
  rationaleEn: string
  revisionDissentRationaleDe: string
  revisionDissentRationaleEn: string
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const rollout = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-23'
const rolloutRoot = join(root, rollout)
const digest = (value: Buffer | string): GoalDescriptionSynthesisDigest => `sha256:${createHash('sha256').update(value).digest('hex')}`
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const same = (left: unknown, right: unknown): boolean => stableGoalBookJson(left) === stableGoalBookJson(right)
const readJson = async <T>(path: string): Promise<T> => JSON.parse((await readFile(path)).toString('utf8')) as T
const assert = (condition: unknown, message: string): asserts condition => { if (!condition) throw new Error(message) }
const assertText = (value: unknown, label: string): asserts value is string => {
  assert(typeof value === 'string' && value.length > 0 && value.trim() === value, `${label} must be non-blank and trimmed`)
}
const withinRollout = (path: string): string => {
  const absolute = resolve(root, path)
  const difference = relative(rolloutRoot, absolute)
  assert(difference !== '' && difference !== '..' && !difference.startsWith(`..${sep}`), `Path outside Mathematics rollout: ${path}`)
  return absolute
}
const verifyOrWrite = async (artifacts: Array<{ path: string; bytes: Buffer }>, write: boolean): Promise<void> => {
  for (const artifact of artifacts) {
    let previous: Buffer | null = null
    try { previous = await readFile(artifact.path) } catch (error) {
      if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
    }
    if (previous) {
      assert(previous.equals(artifact.bytes), `Existing targeted D artifact is stale: ${relative(root, artifact.path)}`)
    } else {
      assert(write, `Missing targeted D artifact: ${relative(root, artifact.path)}`)
      await mkdir(dirname(artifact.path), { recursive: true })
      await writeFile(artifact.path, artifact.bytes, { flag: 'wx' })
    }
  }
}

const main = async (): Promise<void> => {
  const args = process.argv.slice(2)
  assert(args.length === 3 && args[0] === '--authoring' && ['--write', '--check'].includes(args[2]),
    'Usage: tsx app/scripts/materializeMathM7TargetedDissentKeep.ts --authoring <authoring.json> --write|--check')
  const write = args[2] === '--write'
  const authoringPath = withinRollout(args[1])
  const authoringBytes = await readFile(authoringPath)
  const authoring = JSON.parse(authoringBytes.toString('utf8')) as Authoring
  assert(authoring.schemaVersion === 1 && authoring.artifactType === 'goal-description-targeted-dissent-keep-authoring-v1', 'Invalid authoring identity')
  assert(/^[a-z0-9][a-z0-9-]*-v\d+$/.test(authoring.sourceName), 'Invalid sourceName')
  assert(/^[a-z0-9][a-z0-9-]*-v\d+$/.test(authoring.outputStem), 'Invalid outputStem')
  assert(/^[a-z0-9][a-z0-9-]*-v\d+$/.test(authoring.manifestId), 'Invalid manifestId')
  assert(/^[a-f0-9-]{36}$/.test(authoring.goalId), 'Invalid goalId')
  assert(Number.isInteger(authoring.expectedCampaignGoalCount) && authoring.expectedCampaignGoalCount > 1, 'Invalid campaign count')
  for (const key of ['synthesizedBy', 'rationaleDe', 'rationaleEn', 'revisionDissentRationaleDe', 'revisionDissentRationaleEn'] as const) {
    assertText(authoring[key], key)
  }
  const source = join(rolloutRoot, authoring.sourceName)
  assert(dirname(authoringPath) === source, 'Authoring must be inside its exact source campaign')
  const configPath = join(rolloutRoot, `${authoring.sourceName}.config.json`)
  const [dual, configBytes, batchManifestBytes, frozenModel, canonicalBytes, ledgerBytes] = await Promise.all([
    materializeGoalDescriptionRolloutBatchDualSummary(configPath, false),
    readFile(configPath),
    readFile(join(source, 'batch-manifest.json')),
    readJson<GoalBookModel>(join(source, 'bundle/book-model.json')),
    readFile(join(root, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')),
    readFile(join(root, 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json')),
  ])
  const config = JSON.parse(configBytes.toString('utf8')) as { goalIds: string[]; baseGoalBookConfigPath: string; bookId: string; title: string }
  const landscape = JSON.parse(canonicalBytes.toString('utf8')) as { subject: string; goals: Array<Record<string, unknown>> }
  const ledger = JSON.parse(ledgerBytes.toString('utf8')) as { decisions: Array<{ goalId: string; semanticKind: string; decisionStatus: string; sourceFingerprint: string }> }
  assert(landscape.subject === 'Mathematik' && Array.isArray(landscape.goals), 'Current canonical landscape is not Mathematics')
  assert(config.goalIds.includes(authoring.goalId) && same(config.goalIds, dual.prepared.manifest.goalIds), 'Source campaign goal membership changed')
  assert(dual.summary.goalCount === authoring.expectedCampaignGoalCount && dual.summary.counts.requiresSynthesis === authoring.expectedCampaignGoalCount, 'Source dual summary changed')
  assert(frozenModel.digest === dual.prepared.manifest.artifacts.bookModelDigest, 'Frozen source GoalBook changed')
  const summary = dual.summary.goals.find(({ goalId }) => goalId === authoring.goalId)
  assert(summary?.firstDecision === 'keep' && summary.secondDecision === 'revise', 'Target must retain exact KEEP/REVISE pattern')
  const first = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.first, goalId: authoring.goalId, label: 'First' })
  const second = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.second, goalId: authoring.goalId, label: 'Second' })
  assert(first.errors.length === 0 && second.errors.length === 0 && first.source?.record && second.source?.record,
    `Invalid independent source records: ${[...first.errors, ...second.errors].join(' | ')}`)
  assert(first.source.decision === 'keep' && second.source.decision === 'revise', 'Exact source decision pattern changed')
  assertText(second.source.record.proposedDescriptionDe, 'Round B proposedDescriptionDe')
  assertText(second.source.record.proposedDescriptionEn, 'Round B proposedDescriptionEn')
  const canonicalGoal = landscape.goals.find(({ id }) => id === authoring.goalId)
  const semantic = ledger.decisions.find(({ goalId }) => goalId === authoring.goalId)
  assert(canonicalGoal && semantic?.semanticKind === 'curricularAtomic' && semantic.decisionStatus === 'authoritative'
    && semantic.sourceFingerprint === fingerprintSemanticKindSourceGoal(canonicalGoal), 'Target is not current authoritative curricularAtomic')
  const base = await loadGoalBookBuildInputs(config.baseGoalBookConfigPath)
  const current = buildGoalDescriptionRolloutSubsetModel({ baseModel: base.model, goalIds: config.goalIds, bookId: config.bookId, title: config.title })
  assert(base.model.pages.length === dual.prepared.manifest.curriculumAtomicDenominatorAtPreparation, 'CurricularAtomic denominator changed')
  const input = dual.first.input.goals.find(({ goalId }) => goalId === authoring.goalId)
  const secondInput = dual.second.input.goals.find(({ goalId }) => goalId === authoring.goalId)
  const frozenPage = frozenModel.pages.find(({ goalId }) => goalId === authoring.goalId)
  const currentPage = current.pages.find(({ goalId }) => goalId === authoring.goalId)
  assert(input && secondInput && frozenPage && currentPage, 'Target source/current GoalBook page missing')
  assert(same(input, secondInput) && same(input.reviewContext.page, frozenPage) && same(currentPage, frozenPage)
    && same(input.canonicalContext, buildGoalDescriptionCanonicalContext(canonicalGoal)),
  'Target canonical or full page differs from both reviewed contexts')
  const finalText = { titleDe: input.currentTitleDe, titleEn: input.currentTitleEn, descriptionDe: input.currentDescriptionDe, descriptionEn: input.currentDescriptionEn }
  assert(same(finalText, { titleDe: canonicalGoal.title, titleEn: canonicalGoal.titleEn, descriptionDe: canonicalGoal.description, descriptionEn: canonicalGoal.descriptionEn }),
    'Target DE/EN canonical text differs from reviewed text')
  const contextFingerprint = fingerprintGoalDescriptionReviewContext(input)
  assert(first.source.binding.goalReviewContextFingerprint === contextFingerprint
    && second.source.binding.goalReviewContextFingerprint === contextFingerprint, 'Independent record contexts are stale')
  const visualization = currentPage.visualization
  assert(visualization?.url && visualization.originalDigest, 'Target reviewed visualization missing')
  assert(visualization.url.startsWith(`/assets/goal-visualizations/mathematik/${authoring.goalId}/`), 'Target visualization URL escaped goal directory')
  const publicRoot = join(root, 'app/public')
  const imagePath = resolve(publicRoot, `.${visualization.url}`)
  const imageRelative = relative(publicRoot, imagePath)
  assert(imageRelative !== '..' && !imageRelative.startsWith(`..${sep}`), 'Target image escaped public assets')
  const imageDigest = digest(await readFile(imagePath))
  assert(imageDigest === visualization.originalDigest, 'Target reviewed image bytes changed')
  const completionTimes = [...dual.first.resultPairs, ...dual.second.resultPairs].map(({ run }) => Date.parse(run.completedAt))
  assert(completionTimes.length === 2 && completionTimes.every(Number.isFinite), 'Independent review completion times invalid')
  const expectedGoal = {
    goalId: authoring.goalId,
    effectiveSemanticKind: 'curricularAtomic' as const,
    goalFingerprint: input.goalFingerprint as GoalDescriptionSynthesisDigest,
    pageFingerprint: input.pageFingerprint as GoalDescriptionSynthesisDigest,
    goalReviewContextFingerprint: contextFingerprint,
    finalText,
    firstSource: first.source,
    secondSource: second.source,
  }
  const expected = {
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
      first: buildGoalDescriptionRolloutSynthesisRoundBinding(first.source.binding, dual.prepared.manifest.artifacts.rounds.first.batchInputFingerprint),
      second: buildGoalDescriptionRolloutSynthesisRoundBinding(second.source.binding, dual.prepared.manifest.artifacts.rounds.second.batchInputFingerprint),
    },
    synthesizedAt: new Date(Math.max(...completionTimes) + 1000).toISOString(),
    goals: [expectedGoal],
  }
  const payload: Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'> = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
    schemaVersion: 1,
    synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
    manifestId: authoring.manifestId,
    authority: 'ai_synthesis',
    synthesizedBy: authoring.synthesizedBy,
    synthesizedAt: expected.synthesizedAt,
    batch: expected.batch,
    rounds: expected.rounds,
    decisions: [{
      decisionId: `${authoring.manifestId}-decision-001`,
      goalId: authoring.goalId,
      effectiveSemanticKind: 'curricularAtomic',
      goalFingerprint: expectedGoal.goalFingerprint,
      pageFingerprint: expectedGoal.pageFingerprint,
      goalReviewContextFingerprint: contextFingerprint,
      finalText,
      resolutionDecision: 'keep_current',
      evidenceRound: 'first',
      records: {
        first: { recordId: first.source.binding.recordId, recordDigest: first.source.binding.recordDigest },
        second: { recordId: second.source.binding.recordId, recordDigest: second.source.binding.recordDigest },
      },
      revisionDissent: {
        sourceRound: 'second',
        disposition: 'rejected_keep_current',
        proposedDescriptionDe: second.source.record.proposedDescriptionDe,
        proposedDescriptionEn: second.source.record.proposedDescriptionEn,
        rationaleDe: authoring.revisionDissentRationaleDe,
        rationaleEn: authoring.revisionDissentRationaleEn,
      },
      rationaleDe: authoring.rationaleDe,
      rationaleEn: authoring.rationaleEn,
    }],
  }
  const synthesis: GoalDescriptionRolloutSynthesisDecisionManifest = {
    ...payload,
    manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(payload),
  }
  const manifestValidation = await validateGoalDescriptionRolloutSynthesisDecisionManifest({ manifest: synthesis, expected })
  assert(manifestValidation.errors.length === 0, `Native synthesis invalid: ${manifestValidation.errors.join(' | ')}`)
  const synthesisPath = `synthesis-decisions.${authoring.outputStem}.json`
  const resolutionPath = `resolutions-${authoring.outputStem}/${authoring.goalId}.resolution.json`
  const indexPath = `resolution-index.${authoring.outputStem}.json`
  const receiptPath = `${authoring.outputStem}.compatibility-receipt.json`
  const synthesisBytes = jsonBytes(synthesis)
  const resolution = buildGoalDescriptionDualRoundResolution({
    resolutionId: `${authoring.manifestId}-resolution-${authoring.goalId}`,
    goalId: authoring.goalId,
    effectiveSemanticKind: 'curricularAtomic',
    decision: 'keep_current',
    synthesis: buildGoalDescriptionRolloutResolutionSynthesis({
      batchId: dual.prepared.manifest.batchId,
      manifest: synthesis,
      decision: synthesis.decisions[0],
      summaryGoal: summary,
      firstSource: first.source,
      secondSource: second.source,
    }),
    dualSummaryBytes: dual.bytes,
    currentInput: dual.first.input,
    firstSource: first.source,
    secondSource: second.source,
    synthesisDecisionManifest: {
      contract: synthesis.synthesisContract,
      manifestPath: synthesisPath,
      manifestId: synthesis.manifestId,
      manifestDigest: digest(synthesisBytes),
      manifestFingerprint: synthesis.manifestFingerprint,
      decisionId: synthesis.decisions[0].decisionId,
    },
  })
  const resolutionValidation = await validateGoalDescriptionDualRoundResolution({
    resolution, dualSummary: dual.summary, dualSummaryBytes: dual.bytes, currentInput: dual.first.input,
    landscape, first: dual.first, second: dual.second,
    synthesisDecisionManifestArtifact: { manifest: synthesis, manifestBytes: synthesisBytes, manifestPath: synthesisPath },
  })
  assert(resolutionValidation.errors.length === 0 && resolutionValidation.strictDescriptionComplete,
    `Native strict D resolution invalid: ${resolutionValidation.errors.join(' | ')}`)
  const resolutionBytes = jsonBytes(resolution)
  const index: AggregateResolutionIndex = {
    schemaVersion: 1,
    artifactSetId: `${authoring.manifestId}-partial-group`,
    subject: 'Mathematik',
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: 1,
    curriculumAtomicDenominator: base.model.pages.length,
    descriptionReviewPercentage: Number((100 / base.model.pages.length).toFixed(1)),
    synthesisDecisionManifest: { path: synthesisPath, digest: digest(synthesisBytes), fingerprint: synthesis.manifestFingerprint },
    groups: [{
      groupId: dual.prepared.manifest.batchId,
      artifactDirectory: '.',
      dualSummaryPath: 'dual-summary.json',
      dualSummaryDigest: digest(dual.bytes),
      campaignGoalCount: dual.summary.goalCount,
      resolvedGoalCount: 1,
    }],
    resolutions: [{
      goalId: authoring.goalId,
      titleDe: finalText.titleDe,
      groupId: dual.prepared.manifest.batchId,
      decision: resolution.decision,
      resolutionPath,
      resolutionDigest: digest(resolutionBytes),
      resolutionFingerprint: resolution.resolutionFingerprint,
      strictDescriptionComplete: true,
    }],
  }
  const indexErrors = validateLegacyResolutionIndexSnapshot(index)
  assert(indexErrors.length === 0, `Native partial index invalid: ${indexErrors.join(' | ')}`)
  const indexBytes = jsonBytes(index)
  const receipt = {
    schemaVersion: 1,
    receiptId: `${authoring.manifestId}-receipt`,
    status: 'ai_synthesis_candidate_not_registered',
    claimedGoalId: authoring.goalId,
    sourceBatchId: dual.prepared.manifest.batchId,
    sourceCampaignGoalCount: dual.summary.goalCount,
    excludedGoalCount: dual.summary.goalCount - 1,
    sourceBundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint,
    sourceReviewInputFingerprint: dual.first.input.reviewInputFingerprint,
    sourceDualSummaryDigest: digest(dual.bytes),
    currentCanonicalLandscapeDigest: digest(canonicalBytes),
    currentSemanticKindLedgerDigest: digest(ledgerBytes),
    authoringPath: relative(source, authoringPath),
    authoringDigest: digest(authoringBytes),
    preparedBookDigest: frozenModel.digest,
    currentWholeBookDigest: base.model.digest,
    currentSubsetBookDigest: current.digest,
    currentGoalPageAndImageBinding: {
      pageFingerprint: input.pageFingerprint,
      goalReviewContextFingerprint: contextFingerprint,
      imagePath: relative(root, imagePath),
      imageDigest,
    },
    synthesisManifestPath: synthesisPath,
    synthesisManifestDigest: digest(synthesisBytes),
    resolutionIndexPath: indexPath,
    resolutionIndexDigest: digest(indexBytes),
    excludedGoalsRemainOpen: true,
    centralRegistryEdited: false,
    humanApprovalClaimed: false,
  }
  await verifyOrWrite([
    { path: join(source, synthesisPath), bytes: synthesisBytes },
    { path: join(source, resolutionPath), bytes: resolutionBytes },
    { path: join(source, indexPath), bytes: indexBytes },
    { path: join(source, receiptPath), bytes: jsonBytes(receipt) },
  ], write)
  console.log(`${write ? 'Materialized' : 'Verified'} targeted dissent KEEP: ${authoring.goalId}; index=${relative(root, join(source, indexPath))}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
