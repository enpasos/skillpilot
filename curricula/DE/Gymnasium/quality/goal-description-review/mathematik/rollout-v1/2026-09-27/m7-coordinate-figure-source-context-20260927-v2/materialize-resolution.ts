import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  fingerprintSemanticKindSourceGoal,
  loadGoalBookBuildInputs,
  stableGoalBookJson,
  type GoalBookModel,
} from '../../../../../../../../../app/scripts/goalBookModel'
import {
  buildGoalDescriptionRolloutSubsetModel,
  materializeGoalDescriptionRolloutBatchDualSummary,
  materializeGoalDescriptionRolloutBatchResolutionIndex,
} from '../../../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
import {
  buildGoalDescriptionDualRoundResolution,
  extractGoalDescriptionDualRoundResolutionSource,
  fingerprintGoalDescriptionReviewContext,
  validateGoalDescriptionDualRoundResolution,
} from '../../../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import { buildGoalDescriptionRolloutResolutionSynthesis } from '../../../../../../../../../app/scripts/goalDescriptionRolloutResolutionSynthesis'
import {
  buildGoalDescriptionRolloutSynthesisRoundBinding,
  fingerprintGoalDescriptionRolloutSynthesisDecisionManifest,
  validateGoalDescriptionRolloutSynthesisDecisionManifest,
  type GoalDescriptionRolloutSynthesisDecisionManifest,
  type GoalDescriptionSynthesisDigest,
} from '../../../../../../../../../app/scripts/validateGoalDescriptionRolloutSynthesisDecisionManifest'

type Authoring = {
  schemaVersion: 1
  artifactType: 'goal-description-single-keepkeep-authoring-v1'
  manifestId: string
  goalId: string
  expectedBundleFingerprint: GoalDescriptionSynthesisDigest
  expectedBookDigest: GoalDescriptionSynthesisDigest
  expectedGoalFingerprint: GoalDescriptionSynthesisDigest
  expectedPageFingerprint: GoalDescriptionSynthesisDigest
  expectedImageDigest: GoalDescriptionSynthesisDigest
  evidenceRound: 'first' | 'second'
  synthesizedBy: string
  rationaleDe: string
  rationaleEn: string
}

const packageDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(packageDirectory, '../../../../../../../../..')
const batchName = 'm7-coordinate-figure-source-context-20260927-v2'
const configPath = join(dirname(packageDirectory), `${batchName}.config.json`)
const canonicalPath = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
)
const semanticPath = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
)
const digest = (value: Buffer | string): GoalDescriptionSynthesisDigest => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const same = (left: unknown, right: unknown): boolean => stableGoalBookJson(left) === stableGoalBookJson(right)
const assert = (condition: unknown, message: string): asserts condition => {
  if (!condition) throw new Error(message)
}
const verifyOrWrite = async (path: string, expected: Buffer, write: boolean): Promise<void> => {
  let current: Buffer | null = null
  try {
    current = await readFile(path)
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
  }
  if (current) {
    assert(current.equals(expected), `Stale package artifact: ${relative(repositoryRoot, path)}`)
  } else {
    assert(write, `Missing package artifact: ${relative(repositoryRoot, path)}`)
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, expected, { flag: 'wx' })
  }
}

const main = async (): Promise<void> => {
  const mode = process.argv[2]
  assert(mode === '--write' || mode === '--check', 'Usage: tsx materialize-resolution.ts --write|--check')
  const write = mode === '--write'
  const authoring = JSON.parse(await readFile(join(packageDirectory, 'synthesis-authoring.json'), 'utf8')) as Authoring
  assert(authoring.schemaVersion === 1 && authoring.artifactType === 'goal-description-single-keepkeep-authoring-v1', 'Invalid authoring contract')
  assert(authoring.manifestId === 'mathematik-m7-coordinate-figure-source-context-20260927-v2', 'Unexpected synthesis manifest')
  assert(authoring.goalId === '121e3fdf-54d2-4d46-bc2d-f6e725f10f41', 'Unexpected target goal')
  assert(authoring.evidenceRound === 'first' || authoring.evidenceRound === 'second', 'Invalid evidence round')
  for (const field of ['synthesizedBy', 'rationaleDe', 'rationaleEn'] as const) {
    assert(typeof authoring[field] === 'string' && authoring[field].trim() === authoring[field] && authoring[field].length > 0, `Invalid ${field}`)
  }

  const [dual, batchManifestBytes, canonicalBytes, semanticBytes, frozenModel] = await Promise.all([
    materializeGoalDescriptionRolloutBatchDualSummary(configPath, false),
    readFile(join(packageDirectory, 'batch-manifest.json')),
    readFile(canonicalPath),
    readFile(semanticPath),
    readFile(join(packageDirectory, 'bundle/book-model.json')).then((bytes) => JSON.parse(bytes.toString('utf8')) as GoalBookModel),
  ])
  assert(dual.prepared.manifest.batchId === authoring.manifestId, 'Batch identity changed')
  assert(same(dual.prepared.manifest.goalIds, [authoring.goalId]), 'Batch is no longer exactly one goal')
  assert(dual.prepared.manifest.artifacts.bundleFingerprint === authoring.expectedBundleFingerprint, 'Bundle fingerprint changed')
  assert(dual.prepared.manifest.artifacts.bookModelDigest === authoring.expectedBookDigest, 'Book digest changed')
  assert(dual.summary.goalCount === 1 && dual.summary.counts.requiresSynthesis === 1, 'Dual summary scope changed')
  const summaryGoal = dual.summary.goals[0]
  assert(summaryGoal.goalId === authoring.goalId && summaryGoal.firstDecision === 'keep' && summaryGoal.secondDecision === 'keep', 'Two current KEEP records are required')
  const first = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.first, goalId: authoring.goalId, label: 'First' })
  const second = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.second, goalId: authoring.goalId, label: 'Second' })
  assert(first.errors.length === 0 && second.errors.length === 0 && first.source?.record && second.source?.record,
    `Review source failed: ${[...first.errors, ...second.errors].join(' | ')}`)
  assert(first.source.decision === 'keep' && second.source.decision === 'keep', 'Current reviews no longer agree on KEEP')
  assert(first.source.binding.recordId !== second.source.binding.recordId, 'Independent records have the same ID')

  const input = dual.first.input.goals.find(({ goalId }) => goalId === authoring.goalId)
  const secondInput = dual.second.input.goals.find(({ goalId }) => goalId === authoring.goalId)
  const frozenPage = frozenModel.pages.find(({ goalId }) => goalId === authoring.goalId)
  assert(input && secondInput && frozenPage && same(input, secondInput), 'Bound page input changed between rounds')
  assert(input.goalFingerprint === authoring.expectedGoalFingerprint && input.pageFingerprint === authoring.expectedPageFingerprint, 'Goal or page fingerprint changed')
  const landscape = JSON.parse(canonicalBytes.toString('utf8')) as { subject: string; goals: Array<Record<string, unknown>> }
  const semanticLedger = JSON.parse(semanticBytes.toString('utf8')) as {
    decisions: Array<{ goalId: string; semanticKind: string; decisionStatus: string; sourceFingerprint: string }>
  }
  const canonicalGoal = landscape.goals.find(({ id }) => id === authoring.goalId)
  const semantic = semanticLedger.decisions.find(({ goalId }) => goalId === authoring.goalId)
  assert(landscape.subject === 'Mathematik' && canonicalGoal, 'Current canonical Mathematics goal missing')
  assert(semantic?.semanticKind === 'curricularAtomic' && semantic.decisionStatus === 'authoritative'
    && semantic.sourceFingerprint === fingerprintSemanticKindSourceGoal(canonicalGoal), 'Current semantic kind is not authoritative curricularAtomic')
  assert(same(input.canonicalContext, buildGoalDescriptionCanonicalContext(canonicalGoal)), 'Current canonical context differs from reviewed context')
  const currentBase = await loadGoalBookBuildInputs(dual.prepared.config.baseGoalBookConfigPath)
  const currentSubset = buildGoalDescriptionRolloutSubsetModel({
    baseModel: currentBase.model,
    goalIds: dual.prepared.config.goalIds,
    bookId: dual.prepared.config.bookId,
    title: dual.prepared.config.title,
  })
  const currentPage = currentSubset.pages.find(({ goalId }) => goalId === authoring.goalId)
  assert(currentPage && same(currentPage, frozenPage), 'Current national-atlas page differs from both reviewed rounds')
  const visualization = currentPage.visualization
  assert(visualization?.url && visualization.originalDigest === authoring.expectedImageDigest, 'Bound candidate image changed')
  const publicRoot = join(repositoryRoot, 'app/public')
  const imagePath = resolve(publicRoot, `.${visualization.url}`)
  const relativeImagePath = relative(publicRoot, imagePath)
  assert(relativeImagePath !== '..' && !relativeImagePath.startsWith(`..${sep}`), 'Image path left app/public')
  assert(digest(await readFile(imagePath)) === authoring.expectedImageDigest, 'Candidate image bytes changed')
  const finalText = {
    titleDe: input.currentTitleDe,
    titleEn: input.currentTitleEn,
    descriptionDe: input.currentDescriptionDe,
    descriptionEn: input.currentDescriptionEn,
  }
  assert(same(finalText, {
    titleDe: canonicalGoal.title,
    titleEn: canonicalGoal.titleEn,
    descriptionDe: canonicalGoal.description,
    descriptionEn: canonicalGoal.descriptionEn,
  }), 'Current bilingual canonical text changed')

  const contextFingerprint = fingerprintGoalDescriptionReviewContext(input)
  assert(first.source.binding.goalReviewContextFingerprint === contextFingerprint
    && second.source.binding.goalReviewContextFingerprint === contextFingerprint, 'Review context fingerprints differ')
  const completionTimes = [...dual.first.resultPairs, ...dual.second.resultPairs].map(({ run }) => Date.parse(run.completedAt))
  assert(completionTimes.length === 2 && completionTimes.every(Number.isFinite), 'Invalid review completion times')
  const expected = {
    batch: {
      batchId: dual.prepared.manifest.batchId,
      batchManifestDigest: digest(batchManifestBytes),
      configDigest: dual.prepared.manifest.configDigest,
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
    goals: [{
      goalId: authoring.goalId,
      effectiveSemanticKind: 'curricularAtomic' as const,
      goalFingerprint: authoring.expectedGoalFingerprint,
      pageFingerprint: authoring.expectedPageFingerprint,
      goalReviewContextFingerprint: contextFingerprint,
      finalText,
      firstSource: first.source,
      secondSource: second.source,
    }],
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
      goalFingerprint: authoring.expectedGoalFingerprint,
      pageFingerprint: authoring.expectedPageFingerprint,
      goalReviewContextFingerprint: contextFingerprint,
      finalText,
      resolutionDecision: 'keep_current',
      evidenceRound: authoring.evidenceRound,
      records: {
        first: { recordId: first.source.binding.recordId, recordDigest: first.source.binding.recordDigest },
        second: { recordId: second.source.binding.recordId, recordDigest: second.source.binding.recordDigest },
      },
      rationaleDe: authoring.rationaleDe,
      rationaleEn: authoring.rationaleEn,
    }],
  }
  const synthesis: GoalDescriptionRolloutSynthesisDecisionManifest = {
    ...payload,
    manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(payload),
  }
  const synthesisValidation = await validateGoalDescriptionRolloutSynthesisDecisionManifest({ manifest: synthesis, expected })
  assert(synthesisValidation.errors.length === 0, `Synthesis invalid: ${synthesisValidation.errors.join(' | ')}`)
  const synthesisBytes = jsonBytes(synthesis)
  const resolution = buildGoalDescriptionDualRoundResolution({
    resolutionId: `${authoring.manifestId}-resolution-${authoring.goalId}`,
    goalId: authoring.goalId,
    effectiveSemanticKind: 'curricularAtomic',
    decision: 'keep_current',
    synthesis: buildGoalDescriptionRolloutResolutionSynthesis({
      batchId: authoring.manifestId,
      manifest: synthesis,
      decision: synthesis.decisions[0],
      summaryGoal,
      firstSource: first.source,
      secondSource: second.source,
    }),
    dualSummaryBytes: dual.bytes,
    currentInput: dual.first.input,
    firstSource: first.source,
    secondSource: second.source,
    synthesisDecisionManifest: {
      contract: synthesis.synthesisContract,
      manifestPath: 'synthesis-decisions.json',
      manifestId: synthesis.manifestId,
      manifestDigest: digest(synthesisBytes),
      manifestFingerprint: synthesis.manifestFingerprint,
      decisionId: synthesis.decisions[0].decisionId,
    },
  })
  const resolutionValidation = await validateGoalDescriptionDualRoundResolution({
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
  assert(resolutionValidation.errors.length === 0 && resolutionValidation.strictDescriptionComplete,
    `Strict D resolution invalid: ${resolutionValidation.errors.join(' | ')}`)
  await verifyOrWrite(join(packageDirectory, 'synthesis-decisions.json'), synthesisBytes, write)
  await verifyOrWrite(join(packageDirectory, 'resolutions', `${authoring.goalId}.resolution.json`), jsonBytes(resolution), write)
  const index = await materializeGoalDescriptionRolloutBatchResolutionIndex(configPath, write)
  assert(index.index.resolutions.length === 1 && index.index.resolutions[0].goalId === authoring.goalId,
    'Standalone index does not contain exactly the target goal')
  console.log(`${write ? 'Materialized' : 'Verified'} current national-atlas D resolution: ${authoring.goalId}; strict=1/1; HE G8/G9 grade-5 projection remains separate and open`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
