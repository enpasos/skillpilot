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
const sourceName = 'm7-q2-spatial-relations-p14-current-v2'
const outputName = 'm7-q2-spatial-relations-p14-keep-eight-partial-20260923-v2'
const source = join(root, rollout, sourceName)
const output = join(root, rollout, outputName)
const configPath = join(root, rollout, `${sourceName}.config.json`)
const manifestId = 'mathematik-m7-q2-spatial-relations-p14-keep-eight-partial-20260923-v2'

// Decision consensus is necessary but not sufficient: every claimed page, canonical
// context and image is also rebound to the live build below. The other six goals
// remain open, including bda6a659 while its image is being corrected/reviewed.
const claimed = [
  { goalId: '509ae03b-96b1-4bb1-b015-b83d14569dae', rationaleDe: 'Beide unabhängigen Reviews bestätigen die aktuelle zweisprachige Abstands-Kompetenz. Die zweite Evidenzfassung trennt Schnitt, Parallelität und Windschiefe als prüfbare Fälle; weitergehende Quellenfreigaben werden daraus nicht abgeleitet.', rationaleEn: 'Both independent reviews confirm the current bilingual distance competence. The second evidence formulation distinguishes intersecting, parallel and skew cases for assessment; no further source approval is inferred.' },
  { goalId: '492463cf-6cb2-5a5a-98e0-c1d77c36c256', rationaleDe: 'Beide unabhängigen Reviews bestätigen die aktuelle Beschreibung als eine zusammenhängende Kompetenz zum geradlinigen Bewegungsmodell. Die zweite Evidenzfassung prüft Anfangsort, konstante Geschwindigkeit und Transfer in einer neuen Situation.', rationaleEn: 'Both independent reviews confirm the current description as one coherent rectilinear-motion competence. The second evidence formulation assesses initial position, constant velocity and transfer to a new situation.' },
  { goalId: 'bd3576b8-f4e5-542a-a8a2-74524d9cee21', rationaleDe: 'Beide unabhängigen Reviews bestätigen den aktuellen zweisprachigen Modellierungsauftrag. Die zweite Evidenzfassung verbindet mathematischen Ansatz und Kontextdeutung mit einem eigenständigen Transfer.', rationaleEn: 'Both independent reviews confirm the current bilingual modeling goal. The second evidence formulation connects the mathematical setup and contextual interpretation with independent transfer.' },
  { goalId: '2ac2e902-a6ad-53c9-b139-d1c63d823023', rationaleDe: 'Beide unabhängigen Reviews bestätigen die aktuelle Begriffs- und Darstellungsbeschreibung. Die zweite Evidenzfassung prüft den Zusammenhang der Darstellungen sowie die fachsprachliche Deutung an einem neuen Fall.', rationaleEn: 'Both independent reviews confirm the current concept and representation description. The second evidence formulation tests how the representations relate and how to interpret a new case precisely.' },
  { goalId: '5748633c-113f-5ea8-9041-24da55919de7', rationaleDe: 'Beide unabhängigen Reviews bestätigen die aktuelle Projektions-Kompetenz. Die zweite Evidenzfassung prüft dieselbe Koordinatenregel an einer neuen räumlichen Konfiguration ohne bloßes Bildabschreiben.', rationaleEn: 'Both independent reviews confirm the current projection competence. The second evidence formulation checks the same coordinate rule in a new spatial configuration without merely copying the image.' },
  { goalId: 'd8e56cfc-a58d-5529-ab9f-e5187e31dd34', rationaleDe: 'Beide unabhängigen Reviews bestätigen die aktuelle Flächenmodell-Kompetenz. Die zweite Evidenzfassung bindet Rechenweg und Sachdeutung an einen unabhängigen Transferfall.', rationaleEn: 'Both independent reviews confirm the current area-model competence. The second evidence formulation ties calculation and contextual interpretation to an independent transfer case.' },
  { goalId: '54541d08-61cc-5a6d-b6d9-d0270a7d1949', rationaleDe: 'Beide unabhängigen Reviews bestätigen die aktuelle Begriffsbildung zum Normalenvektor. Die zweite Evidenzfassung prüft Richtung, Betrag und Orthogonalität als Eigenschaften einer Definition, nicht als unverbundene Routinen.', rationaleEn: 'Both independent reviews confirm the current concept formation for a normal vector. The second evidence formulation checks direction, magnitude and orthogonality as properties of one definition, not unrelated routines.' },
  { goalId: 'eb112b6f-4cc4-58af-975a-f1ea61b727f0', rationaleDe: 'Beide unabhängigen Reviews bestätigen die aktuelle zweisprachige Parameterdeutung. Die zweite Evidenzfassung prüft die Darstellung und Deutung einer neuen Bewegung, ohne ein spezielles Wurfgesetz stillschweigend vorauszusetzen.', rationaleEn: 'Both independent reviews confirm the current bilingual parameter interpretation. The second evidence formulation tests representation and interpretation of a new motion without silently requiring a specific projectile law.' },
] as const
const openIds = [
  '8cb5c712-9c58-5910-8c63-8c3736369b80',
  '8eb14d81-353a-4909-9464-61be7b1ba5b8',
  '857c1c46-5d94-5dfb-9697-9a9fd04103c3',
  'bda6a659-9640-53a5-8be0-24705ab623ef',
  '5f90df42-8a71-534d-b995-b8f7dcaf1661',
  '7bb3c312-f714-55e6-a31f-f31605a93760',
] as const

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
    if (!existing.equals(bytes)) throw new Error(`Existing Q2 partial artifact is stale: ${relative(root, path)}`)
    return
  }
  if (!write) throw new Error(`Missing Q2 partial artifact: ${relative(root, path)}`)
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, bytes, { flag: 'wx' })
}

const main = async () => {
  const args = process.argv.slice(2)
  if (args.length !== 1 || !['--write', '--check'].includes(args[0])) {
    throw new Error('Usage: tsx app/scripts/materializeMathM7Q2SpatialP14Partial.ts --write|--check')
  }
  const write = args[0] === '--write'
  const [dual, config, preparedModel, batchManifestBytes] = await Promise.all([
    materializeGoalDescriptionRolloutBatchDualSummary(configPath, false),
    readJson<{ goalIds: string[]; baseGoalBookConfigPath: string; bookId: string; title: string }>(configPath),
    readJson<GoalBookModel>(join(source, 'bundle/book-model.json')),
    readFile(join(source, 'batch-manifest.json')),
  ])
  const claimedIds = claimed.map(({ goalId }) => goalId)
  if (
    dual.summary.goalCount !== 14
    || dual.summary.counts.requiresSynthesis !== 14
    || !same(dual.prepared.manifest.goalIds, config.goalIds)
    || new Set([...claimedIds, ...openIds]).size !== 14
    || config.goalIds.some((id) => ![...claimedIds, ...openIds].includes(id))
  ) throw new Error('Q2 source campaign and KEEP-eight/open-six partition changed')
  for (const summary of dual.summary.goals) {
    if (claimedIds.includes(summary.goalId as typeof claimedIds[number])) {
      if (summary.firstDecision !== 'keep' || summary.secondDecision !== 'keep') {
        throw new Error(`${summary.goalId}: both independent decisions must remain KEEP`)
      }
    } else if (!openIds.includes(summary.goalId as typeof openIds[number])) {
      throw new Error(`${summary.goalId}: unclassified campaign goal`)
    } else if (summary.firstDecision === 'keep' && summary.secondDecision === 'keep') {
      throw new Error(`${summary.goalId}: an open goal now has two KEEP decisions; review selection anew`)
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
    || current.pages.length !== 14
    || base.model.pages.length !== dual.prepared.manifest.curriculumAtomicDenominatorAtPreparation
  ) throw new Error('Q2 prepared model or current curricularAtomic denominator changed')
  const landscapePath = join(root, dual.prepared.manifest.source.landscapePath)
  const canonicalBytes = await readFile(landscapePath)
  const landscape = JSON.parse(canonicalBytes.toString('utf8')) as {
    subject: string
    goals: Array<Record<string, unknown>>
  }
  if (landscape.subject !== 'Mathematik') throw new Error('Q2 canonical subject is not Mathematik')
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
  if (!firstGoal) throw new Error('Q2 KEEP-eight selection is empty')
  const completionDates = [...dual.first.resultPairs, ...dual.second.resultPairs]
    .map(({ run }) => Date.parse(run.completedAt))
  if (completionDates.length !== 2 || completionDates.some((value) => !Number.isFinite(value))) {
    throw new Error('Q2 independent runs lack exact valid completion times')
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
        evidenceRound: 'second' as const,
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
    throw new Error(`Q2 partial synthesis validation: ${synthesisValidation.errors.join(' | ')}`)
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
      throw new Error(`${goal.goalId}: native Q2 partial resolution invalid: ${validation.errors.join(' | ') || 'not strict D complete'}`)
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
  if (indexErrors.length) throw new Error(`Q2 partial-index validation: ${indexErrors.join(' | ')}`)
  const indexBytes = jsonBytes(index)
  const receipt = {
    schemaVersion: 1,
    receiptId: manifestId,
    status: 'ai_synthesis_candidate_not_registered',
    purpose: 'Partial D closure for exactly eight live-page KEEP/KEEP goals from a fourteen-goal independent Q2 spatial review; six contested or split goals remain open.',
    sourceBatchId: dual.prepared.manifest.batchId,
    sourceCampaignGoalCount: dual.summary.goalCount,
    claimedGoalIds: claimedIds,
    openGoalIds: openIds,
    openDisposition: 'No strict D closure, image acceptance, or human approval is inferred for these six. bda6a659 requires a corrected image and independent re-review.',
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
    globalBookDigestDriftDisposition: 'Whole-book and subset digests are provenance, not an equivalence claim. Each of the eight claimed goals is rechecked against the live canonical context, full GoalBook page, both review contexts and exact image bytes; the six open goals are not claimed.',
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
  console.log(`${write ? 'Materialized' : 'Verified'} Math Q2 partial: strict D=${entries.length}/8, open=${openIds.length}; index=${relative(root, join(output, 'resolution-index.json'))}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
