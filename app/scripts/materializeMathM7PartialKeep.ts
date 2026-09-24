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
import {
  classifyMathM7PartialPageOrImageBinding,
  validateMathM7PartialOpenReason,
  type MathM7PartialOpenGoal,
} from './mathM7PartialOpenReason'
import { validatePositiveGoalEvidenceRecordSemantics, type PositiveGoalEvidenceReviewRecord } from './positiveGoalEvidenceProfileModel'
import type { LearningGoal } from '../src/landscapeTypes'

type Claim = {
  goalId: string
  evidenceRound: 'first' | 'second'
  rationaleDe: string
  rationaleEn: string
}
type Config = {
  schemaVersion: 1
  sourceConfigPath: string
  sourceDirectory: string
  outputDirectory: string
  manifestId: string
  expectedGoalCount: number
  claimed: Claim[]
  open: MathM7PartialOpenGoal[]
  claimedEvidenceBindings?: Array<{
    goalId: string
    positiveEvidenceReviewPath: string
    bwMappingReviewPath: string
    bwSourceGoalId: string
    bySourcePath: string
    bySourceGoalId: string
  }>
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const rolloutRoot = join(root, 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1')
const sha256 = (bytes: Buffer | string): GoalDescriptionSynthesisDigest =>
  `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const jsonBytes = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const same = (left: unknown, right: unknown) => stableGoalBookJson(left) === stableGoalBookJson(right)
const readJson = async <T>(path: string): Promise<T> => JSON.parse((await readFile(path)).toString('utf8')) as T
const withinRollout = (path: string): string => {
  const resolved = resolve(root, path)
  const difference = relative(rolloutRoot, resolved)
  if (!difference || difference === '..' || difference.startsWith(`..${sep}`)) {
    throw new Error(`Partial materializer path is outside Mathematics rollout: ${path}`)
  }
  return resolved
}
const withinRepository = (path: string): string => {
  const resolved = resolve(root, path)
  const difference = relative(root, resolved)
  if (!difference || difference === '..' || difference.startsWith(`..${sep}`)) {
    throw new Error(`Partial evidence path is outside the repository: ${path}`)
  }
  return resolved
}
const verifyOrWrite = async (path: string, bytes: Buffer, write: boolean) => {
  let existing: Buffer | null = null
  try {
    existing = await readFile(path)
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
  }
  if (existing) {
    if (!existing.equals(bytes)) throw new Error(`Existing partial artifact is stale: ${relative(root, path)}`)
    return
  }
  if (!write) throw new Error(`Missing partial artifact: ${relative(root, path)}`)
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, bytes, { flag: 'wx' })
}

const main = async () => {
  const args = process.argv.slice(2)
  if (args.length !== 3 || args[0] !== '--config' || !['--write', '--check'].includes(args[2])) {
    throw new Error('Usage: tsx app/scripts/materializeMathM7PartialKeep.ts --config <config.json> --write|--check')
  }
  const write = args[2] === '--write'
  const configPath = withinRollout(args[1])
  const materialization = await readJson<Config>(configPath)
  if (
    materialization.schemaVersion !== 1
    || typeof materialization.manifestId !== 'string'
    || !/^[a-z0-9][a-z0-9-]*-v\d+$/.test(materialization.manifestId)
    || !Number.isInteger(materialization.expectedGoalCount)
    || materialization.expectedGoalCount < 1
    || !Array.isArray(materialization.claimed)
    || !Array.isArray(materialization.open)
    || materialization.claimed.length < 1
  ) throw new Error('Invalid Mathematics partial materialization config')
  const source = withinRollout(materialization.sourceDirectory)
  const output = withinRollout(materialization.outputDirectory)
  const sourceConfigPath = withinRollout(materialization.sourceConfigPath)
  if (source === output || output.startsWith(`${source}${sep}`) || source.startsWith(`${output}${sep}`)) {
    throw new Error('Source and output directories overlap')
  }
  const [dual, sourceConfig, preparedModel, batchManifestBytes, storedDualBytes] = await Promise.all([
    materializeGoalDescriptionRolloutBatchDualSummary(sourceConfigPath, false),
    readJson<{ goalIds: string[]; baseGoalBookConfigPath: string; bookId: string; title: string }>(sourceConfigPath),
    readJson<GoalBookModel>(join(source, 'bundle/book-model.json')),
    readFile(join(source, 'batch-manifest.json')),
    readFile(join(source, 'dual-summary.json')),
  ])
  const claimedIds = materialization.claimed.map(({ goalId }) => goalId)
  const openIds = materialization.open.map(({ goalId }) => goalId)
  const allIds = [...claimedIds, ...openIds]
  if (
    dual.summary.goalCount !== materialization.expectedGoalCount
    || dual.summary.counts.requiresSynthesis !== materialization.expectedGoalCount
    || !same(dual.prepared.manifest.goalIds, sourceConfig.goalIds)
    || !storedDualBytes.equals(dual.bytes)
    || allIds.length !== materialization.expectedGoalCount
    || new Set(allIds).size !== materialization.expectedGoalCount
    || !sourceConfig.goalIds.every((id) => allIds.includes(id))
    || !same(sourceConfig.goalIds.filter((id) => claimedIds.includes(id)), claimedIds)
    || materialization.claimed.some((choice) => !choice.rationaleDe?.trim() || !choice.rationaleEn?.trim() || !['first', 'second'].includes(choice.evidenceRound))
    || materialization.open.some((entry) => !entry.note?.trim() || !['review_dissent', 'review_revision', 'review_block', 'current_image_hold', 'unresolved_prior_dissent'].includes(entry.reason))
  ) throw new Error('Source campaign, dual summary, or claimed/open partition changed')
  const openById = new Map(materialization.open.map((entry) => [entry.goalId, entry]))
  for (const summary of dual.summary.goals) {
    if (claimedIds.includes(summary.goalId)) {
      if (summary.firstDecision !== 'keep' || summary.secondDecision !== 'keep') {
        throw new Error(`${summary.goalId}: both independent decisions must remain KEEP`)
      }
      continue
    }
    const entry = openById.get(summary.goalId)
    if (!entry) throw new Error(`${summary.goalId}: unclassified campaign goal`)
    let priorReviewRecord: { goalId: string; recordId: string; decision: string } | undefined
    if (entry.reason === 'unresolved_prior_dissent' && entry.priorDissent?.reviewRecordPath) {
      const priorPath = withinRollout(entry.priorDissent.reviewRecordPath)
      if (priorPath.startsWith(`${source}${sep}`) || !priorPath.endsWith('.records.jsonl')) {
        throw new Error(`${summary.goalId}: prior dissent must cite a different review campaign's records JSONL`)
      }
      const priorRecords = (await readFile(priorPath, 'utf8')).trim().split('\n')
        .map((line) => JSON.parse(line) as { goalId: string; recordId: string; decision: string })
      priorReviewRecord = priorRecords.find(({ recordId }) => recordId === entry.priorDissent?.recordId)
    }
    const openError = validateMathM7PartialOpenReason(
      entry,
      summary.firstDecision,
      summary.secondDecision,
      priorReviewRecord,
    )
    if (openError) throw new Error(openError)
  }

  const base = await loadGoalBookBuildInputs(sourceConfig.baseGoalBookConfigPath)
  const current = buildGoalDescriptionRolloutSubsetModel({
    baseModel: base.model,
    goalIds: sourceConfig.goalIds,
    bookId: sourceConfig.bookId,
    title: sourceConfig.title,
  })
  if (
    preparedModel.digest !== dual.prepared.manifest.artifacts.bookModelDigest
    || current.pages.length !== materialization.expectedGoalCount
    || base.model.pages.length !== dual.prepared.manifest.curriculumAtomicDenominatorAtPreparation
  ) throw new Error('Prepared model or current curricularAtomic denominator changed')
  let campaignBoundImageByteCount = 0
  let campaignExactPageCount = 0
  let campaignNoImagePageCount = 0
  const unclaimedPageOrImageDrift: Array<{ goalId: string; reason: string }> = []
  for (const goalId of sourceConfig.goalIds) {
    const preparedPage = preparedModel.pages.find((page) => page.goalId === goalId)
    const currentPage = current.pages.find((page) => page.goalId === goalId)
    if (classifyMathM7PartialPageOrImageBinding(
      goalId,
      claimedIds.includes(goalId),
      Boolean(preparedPage && currentPage && same(currentPage, preparedPage)),
      'GoalBook page',
    ) === 'unclaimed_drift') {
      unclaimedPageOrImageDrift.push({ goalId, reason: 'current GoalBook page differs from the reviewed source campaign' })
      continue
    }
    if (!currentPage) throw new Error(`${goalId}: exact current page unexpectedly missing`)
    campaignExactPageCount += 1
    const visualization = currentPage.visualization
    if (!visualization) {
      campaignNoImagePageCount += 1
      continue
    }
    if (!visualization.url || !visualization.originalDigest) {
      throw new Error(`${goalId}: source campaign image binding is incomplete`)
    }
    if (!visualization.url.startsWith(`/assets/goal-visualizations/mathematik/${goalId}/`)) {
      throw new Error(`${goalId}: source campaign image URL is outside its goal directory`)
    }
    const publicRoot = join(root, 'app/public')
    const imagePath = resolve(publicRoot, `.${visualization.url}`)
    const publicDifference = relative(publicRoot, imagePath)
    if (publicDifference === '..' || publicDifference.startsWith(`..${sep}`)) {
      throw new Error(`${goalId}: source campaign image escapes public root`)
    }
    let actualImageDigest: GoalDescriptionSynthesisDigest | null = null
    try {
      actualImageDigest = sha256(await readFile(imagePath))
    } catch (error) {
      if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
    }
    if (classifyMathM7PartialPageOrImageBinding(
      goalId,
      claimedIds.includes(goalId),
      actualImageDigest === visualization.originalDigest,
      'image bytes',
    ) === 'unclaimed_drift') {
      unclaimedPageOrImageDrift.push({ goalId, reason: 'bound image bytes differ from the reviewed source campaign' })
      continue
    }
    campaignBoundImageByteCount += 1
  }
  const landscapePath = join(root, dual.prepared.manifest.source.landscapePath)
  const canonicalBytes = await readFile(landscapePath)
  const landscape = JSON.parse(canonicalBytes.toString('utf8')) as {
    subject: string
    goals: Array<Record<string, unknown>>
  }
  if (landscape.subject !== 'Mathematik') throw new Error('Canonical subject is not Mathematik')
  const sources = new Map<string, {
    first: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
    second: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
  }>()
  const expectedGoals: GoalDescriptionRolloutSynthesisExpectedGoal[] = []
  const imageBindings: Array<Record<string, unknown>> = []
  const evidenceBindings: Array<Record<string, unknown>> = []
  if (materialization.claimedEvidenceBindings && (
    materialization.claimedEvidenceBindings.length !== claimedIds.length
    || new Set(materialization.claimedEvidenceBindings.map(({ goalId }) => goalId)).size !== claimedIds.length
    || !claimedIds.every((goalId) => materialization.claimedEvidenceBindings?.some((binding) => binding.goalId === goalId))
  )) throw new Error('Claimed source/P evidence bindings must cover exactly the claimed goals')
  for (const choice of materialization.claimed) {
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
    if (visualization) {
      if (!visualization.url || !visualization.originalDigest) throw new Error(`${goalId}: incomplete bound image`)
      if (!visualization.url.startsWith(`/assets/goal-visualizations/mathematik/${goalId}/`)) {
        throw new Error(`${goalId}: image URL is outside its goal directory`)
      }
      const publicRoot = join(root, 'app/public')
      const imagePath = resolve(publicRoot, `.${visualization.url}`)
      if (relative(publicRoot, imagePath).startsWith(`..${sep}`)) throw new Error(`${goalId}: image escapes public root`)
      const actualImageDigest = sha256(await readFile(imagePath))
      if (actualImageDigest !== visualization.originalDigest) throw new Error(`${goalId}: bound image bytes changed`)
      imageBindings.push({
        goalId,
        pageFingerprint: input.pageFingerprint,
        goalReviewContextFingerprint: contextFingerprint,
        imagePublicPath: relative(root, imagePath),
        imageDigest: actualImageDigest,
      })
    } else {
      // Full current-page equality above binds the reviewed absence exactly.
      // Strict D can be recorded without implying completion of image gate V.
      imageBindings.push({
        goalId,
        pageFingerprint: input.pageFingerprint,
        goalReviewContextFingerprint: contextFingerprint,
        imagePublicPath: null,
        imageDigest: null,
      })
    }
    const auxiliary = materialization.claimedEvidenceBindings?.find(({ goalId: id }) => id === goalId)
    if (auxiliary) {
      const positivePath = withinRepository(auxiliary.positiveEvidenceReviewPath)
      const positiveBytes = await readFile(positivePath)
      const positiveRecords = positiveBytes.toString('utf8').trim().split('\n')
        .map((line) => JSON.parse(line) as PositiveGoalEvidenceReviewRecord)
      const positive = positiveRecords.find((record) => record.goalId === goalId)
      if (!positive || positiveRecords.filter((record) => record.goalId === goalId).length !== 1) {
        throw new Error(`${goalId}: exactly one current positive-understanding-evidence-v2 record is required`)
      }
      const resourceDigests = visualization ? { [visualization.url]: visualization.originalDigest! } : {}
      const positiveErrors = validatePositiveGoalEvidenceRecordSemantics(
        positive,
        canonicalGoal as unknown as LearningGoal,
        resourceDigests,
        'curricularAtomic',
      )
      if (positiveErrors.length || positive.status !== 'needs_human_review' || positive.reviewAuthority !== 'ai_candidate') {
        throw new Error(`${goalId}: current P binding invalid or approval overstated: ${positiveErrors.join(' | ')}`)
      }
      const mappingPath = withinRepository(auxiliary.bwMappingReviewPath)
      const mappingBytes = await readFile(mappingPath)
      const mapping = JSON.parse(mappingBytes.toString('utf8')) as {
        sourceExtractionPath: string
        mappings: Array<{ legacyGoalId: string; canonicalGoalId: string; matchType: string }>
      }
      if (!mapping.mappings.some((entry) => entry.legacyGoalId === auxiliary.bwSourceGoalId && entry.canonicalGoalId === goalId && entry.matchType === 'exact')) {
        throw new Error(`${goalId}: active BW exact source mapping is missing`)
      }
      const extractionPath = withinRepository(mapping.sourceExtractionPath)
      const extractionBytes = await readFile(extractionPath)
      const extraction = JSON.parse(extractionBytes.toString('utf8')) as {
        sourceDocument: { path: string; official: boolean }
        sourceGoals: Array<{ id: string; sourceSpan: string }>
      }
      const bwSource = extraction.sourceGoals.find(({ id }) => id === auxiliary.bwSourceGoalId)
      if (!bwSource?.sourceSpan.includes('Gerade und Ebene') || !bwSource.sourceSpan.includes('zwischen Ebenen') || !extraction.sourceDocument.official) {
        throw new Error(`${goalId}: BW extraction/source-document binding changed`)
      }
      const bwDocumentPath = withinRepository(extraction.sourceDocument.path)
      const bwDocumentDigest = sha256(await readFile(bwDocumentPath))
      const byPath = withinRepository(auxiliary.bySourcePath)
      const byBytes = await readFile(byPath)
      const byLandscape = JSON.parse(byBytes.toString('utf8')) as { goals: Array<{ id: string; description: string }> }
      const bySource = byLandscape.goals.find(({ id }) => id === auxiliary.bySourceGoalId)
      if (!bySource?.description.includes('zweier Ebenen sowie einer Geraden von einer Ebene')) {
        throw new Error(`${goalId}: BY source does not substantiate both object pairs`)
      }
      evidenceBindings.push({
        goalId,
        positiveEvidenceReviewPath: auxiliary.positiveEvidenceReviewPath,
        positiveEvidenceReviewDigest: sha256(positiveBytes),
        positiveEvidenceProfileFingerprint: positive.profileFingerprint,
        positiveEvidenceStatus: positive.status,
        positiveEvidenceAuthority: positive.reviewAuthority,
        bwMappingReviewPath: auxiliary.bwMappingReviewPath,
        bwMappingReviewDigest: sha256(mappingBytes),
        bwSourceGoalId: auxiliary.bwSourceGoalId,
        bwSourceExtractionPath: mapping.sourceExtractionPath,
        bwSourceExtractionDigest: sha256(extractionBytes),
        bwOfficialDocumentPath: extraction.sourceDocument.path,
        bwOfficialDocumentDigest: bwDocumentDigest,
        bySourcePath: auxiliary.bySourcePath,
        bySourceDigest: sha256(byBytes),
        bySourceGoalId: auxiliary.bySourceGoalId,
        directGoalBookSourceRef: input.canonicalContext.sourceRef ?? null,
        interpretation: 'BW exact mapping and BY source passage are verified separately; no direct GoalBook sourceRef or BY exact mapping is inferred.',
      })
    }
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
  if (!firstGoal) throw new Error('KEEP selection is empty')
  const completionDates = [...dual.first.resultPairs, ...dual.second.resultPairs]
    .map(({ run }) => Date.parse(run.completedAt))
  if (completionDates.length !== 2 || completionDates.some((value) => !Number.isFinite(value))) {
    throw new Error('Independent runs lack exact valid completion times')
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
    manifestId: materialization.manifestId,
    authority: 'ai_synthesis',
    synthesizedBy: 'OpenAI Codex (exact model identifier unavailable); independent dual-review synthesis candidate',
    synthesizedAt: expected.synthesizedAt,
    batch: expected.batch,
    rounds: expected.rounds,
    decisions: expectedGoals.map((goal, index) => {
      const source = sources.get(goal.goalId)!
      const choice = materialization.claimed[index]
      return {
        decisionId: `${materialization.manifestId}-decision-${String(index + 1).padStart(3, '0')}`,
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
    throw new Error(`Partial synthesis validation: ${synthesisValidation.errors.join(' | ')}`)
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
      resolutionId: `${materialization.manifestId}-resolution-${goal.goalId}`,
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
      throw new Error(`${goal.goalId}: native partial resolution invalid: ${validation.errors.join(' | ') || 'not strict D complete'}`)
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
    artifactSetId: `${materialization.manifestId}-partial-group`,
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
      artifactDirectory: relative(output, source),
      dualSummaryPath: relative(output, join(source, 'dual-summary.json')),
      dualSummaryDigest: sha256(dual.bytes),
      campaignGoalCount: dual.summary.goalCount,
      resolvedGoalCount: entries.length,
    }],
    resolutions: entries,
  }
  const indexErrors = validateLegacyResolutionIndexSnapshot(index)
  if (indexErrors.length) throw new Error(`Partial-index validation: ${indexErrors.join(' | ')}`)
  const indexBytes = jsonBytes(index)
  const receipt = {
    schemaVersion: 1,
    receiptId: materialization.manifestId,
    status: 'ai_synthesis_candidate_not_registered',
    purpose: 'Partial strict-D closure for exactly the claimed live-page KEEP/KEEP Mathematics goals; excluded current or earlier dissent and image holds remain open.',
    materializationConfigPath: relative(root, configPath),
    materializationConfigDigest: sha256(await readFile(configPath)),
    sourceBatchId: dual.prepared.manifest.batchId,
    sourceCampaignGoalCount: dual.summary.goalCount,
    claimedGoalIds: claimedIds,
    openGoals: materialization.open,
    openDisposition: 'No strict D closure, image acceptance, or human approval is inferred for excluded goals. Current dissent, unresolved earlier dissent, source-campaign drift, and image holds require separate targeted handling.',
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
    globalBookDigestDriftDisposition: 'Whole-book and subset digests are provenance, not an equivalence claim. Every claimed goal is rechecked against live canonical context, full GoalBook page, both review contexts and exact current image bytes. Image quality approval is not inferred.',
    sourceCampaignPageAndImagePreflight: {
      goalCount: sourceConfig.goalIds.length,
      exactCurrentPageCount: campaignExactPageCount,
      exactBoundImageByteCount: campaignBoundImageByteCount,
      noImagePageCount: campaignNoImagePageCount,
      unclaimedPageOrImageDrift,
      meaning: 'Only claimed pages must equal their reviewed source pages and retain exact image bytes. Unclaimed drift is recorded, not accepted; this is no whole-campaign preflight pass, image-quality acceptance, or strict D closure for excluded goals.',
    },
    claimedPageAndImageBindings: imageBindings,
    claimedPositiveEvidenceAndSourceBindings: evidenceBindings,
    synthesisManifestPath: 'synthesis-decisions.json',
    synthesisManifestDigest: sha256(synthesisBytes),
    resolutionIndexPath: 'resolution-index.json',
    resolutionIndexDigest: sha256(indexBytes),
    noWholeBatchProgressClaim: true,
    noCanonicalOrRegistryOrQaEdits: true,
    noImageAcceptanceClaim: true,
    noHumanApprovalClaim: true,
  }
  for (const artifact of [
    { path: join(output, 'synthesis-decisions.json'), bytes: synthesisBytes },
    ...resolutionArtifacts,
    { path: join(output, 'resolution-index.json'), bytes: indexBytes },
    { path: join(output, 'compatibility-receipt.json'), bytes: jsonBytes(receipt) },
  ]) await verifyOrWrite(artifact.path, artifact.bytes, write)
  console.log(`${write ? 'Materialized' : 'Verified'} Math partial: strict D=${entries.length}/${materialization.expectedGoalCount}, open=${openIds.length}; index=${relative(root, join(output, 'resolution-index.json'))}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
