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
const sourceName = 'm7-upper-sec-next20-normal-spatial-methods-current-20260923-v1'
const outputName = 'm7-upper-sec-next20-double-keep12-partial-20260923-v1'
const source = join(root, rollout, sourceName)
const output = join(root, rollout, outputName)
const configPath = join(root, rollout, `${sourceName}.config.json`)
const manifestId = 'mathematik-m7-upper-sec-next20-double-keep12-partial-20260923-v1'

const claimed = [
  { goalId: '8c32d941-b51c-5663-951c-a610f8900f76', evidenceRound: 'second', rationaleDe: 'Beide Reviews bestätigen Wahrscheinlichkeit als Dichtefläche mit Kontextdeutung. Die zweite Evidenzfassung trennt ausdrücklich Dichtehöhe und Wahrscheinlichkeit und prüft einen Intervalltransfer bei veränderten Parametern.', rationaleEn: 'Both reviews confirm probability as density area with contextual interpretation. The second evidence version explicitly distinguishes density height from probability and tests interval transfer under changed parameters.' },
  { goalId: '55d0474b-b82c-59b6-a62a-b6a0a34d9c4b', evidenceRound: 'second', rationaleDe: 'Beide Reviews bestätigen die Unterscheidung diskreter und stetiger Zufallsgrößen. Die zweite Evidenzfassung behandelt gerundete Messwerte ausdrücklich als neuen Grenzfall zwischen angezeigten Werten und zugrunde liegender Größe.', rationaleEn: 'Both reviews confirm the distinction between discrete and continuous random variables. The second evidence version treats rounded measurements explicitly as a new boundary case between displayed values and the underlying variable.' },
  { goalId: 'a7778885-17aa-5eeb-a6a7-fbf4c8d55a16', evidenceRound: 'second', rationaleDe: 'Beide Reviews bestätigen die kumulierte Dichtefläche als Verteilungswert. Die zweite Evidenzfassung verbindet eine verschobene Verteilung mit dem festen Schwellenwert und der Differenz zweier kumulierter Flächen.', rationaleEn: 'Both reviews confirm accumulated density area as the cumulative value. The second evidence version links a shifted distribution to a fixed threshold and the difference between two accumulated areas.' },
  { goalId: '3256476b-ec65-4038-9f5a-a8808fbcf207', evidenceRound: 'first', rationaleDe: 'Beide Reviews bestätigen den Punkt-Gerade-Abstand als Lotlänge. Die erste Evidenzfassung lässt Projektion oder Lotbeziehung als gleichwertige Wege zu und prüft den Wechsel zu einer schrägen Geraden.', rationaleEn: 'Both reviews confirm point-line distance as perpendicular length. The first evidence version permits projection or a perpendicular relation as equivalent routes and tests a change to an oblique line.' },
  { goalId: 'fac75b4a-4ec2-5d38-bbce-9b002c8a4904', evidenceRound: 'first', rationaleDe: 'Beide Reviews bestätigen die lageabhängige Wahl eines analytischen Abstandsverfahrens. Die erste Evidenzfassung bleibt methodenoffen und verlangt eine räumliche Ergebnisprüfung bei veränderter Konfiguration.', rationaleEn: 'Both reviews confirm choosing an analytic distance method from the spatial configuration. The first evidence version remains method neutral and requires a spatial result check when the configuration changes.' },
  { goalId: '58f613da-03be-5c6a-90a9-ff0958aa7849', evidenceRound: 'first', rationaleDe: 'Beide Reviews bestätigen, dass Richtungsvektor und Stützpunkt besondere Geradenlagen bestimmen. Die erste Evidenzfassung verlangt rechnerische und räumliche Deutung sowie einen Transfer bei geändertem Stützpunkt.', rationaleEn: 'Both reviews confirm that direction vector and support point determine special line positions. The first evidence version requires algebraic and spatial interpretation and transfer when the support point changes.' },
  { goalId: 'a506fc1d-b784-548f-90c3-5aae1b819b68', evidenceRound: 'second', rationaleDe: 'Beide Reviews bestätigen Cavalieri als Plausibilisierung von G mal h beim schiefen Prisma. Die zweite Evidenzfassung unterscheidet senkrechte Höhe und schräge Kante an einer anders geformten Grundfläche.', rationaleEn: 'Both reviews confirm Cavalieri as a plausibility argument for G times h in an oblique prism. The second evidence version distinguishes perpendicular height from a slanted edge for a differently shaped base.' },
  { goalId: '5619ca5b-dc2a-504e-ad89-2e0ca0a83822', evidenceRound: 'second', rationaleDe: 'Beide Reviews bestätigen die geometrische Begründung des Drittelfaktors. Die zweite Evidenzfassung grenzt ihn von einer vermeintlich gekürzten Höhe ab und überträgt den Vergleich auf eine schiefe Pyramide.', rationaleEn: 'Both reviews confirm the geometric justification of the one-third factor. The second evidence version distinguishes it from a supposedly shortened height and transfers the comparison to an oblique pyramid.' },
  { goalId: 'd0475ed5-cb6f-5694-9501-a1c94288d65a', evidenceRound: 'second', rationaleDe: 'Beide Reviews bestätigen die Bewertung von Aussagekraft und Grenzen einer Visualisierung. Die zweite Evidenzfassung verknüpft Achse oder Datenbasis mit einer eigenständig neu begründeten Interpretation.', rationaleEn: 'Both reviews confirm evaluating the explanatory power and limitations of a visualization. The second evidence version links axis or data basis to an independently reconsidered interpretation.' },
  { goalId: '6fcd6a1a-88d3-59d2-9bf7-ee32babb773e', evidenceRound: 'second', rationaleDe: 'Beide Reviews bestätigen den Vergleich von Aufwand und Genauigkeit. Die zweite Evidenzfassung macht den Zielkonflikt und eine neue Fehlerschranke als Entscheidungsgrund ausdrücklich prüfbar.', rationaleEn: 'Both reviews confirm comparison of effort and accuracy. The second evidence version makes the tradeoff and a new error bound explicitly assessable as decision criteria.' },
  { goalId: 'fdce0ced-46a0-594a-9b5d-d2dc18e5e473', evidenceRound: 'first', rationaleDe: 'Beide Reviews bestätigen die Ortskurve tatsächlicher Extrempunkte nach Parameterelimination. Die erste Evidenzfassung prüft den tatsächlich durchlaufenen Kurvenabschnitt bei beschränktem Parameterbereich.', rationaleEn: 'Both reviews confirm the locus of actual extrema after parameter elimination. The first evidence version checks the portion genuinely traced under a restricted parameter domain.' },
  { goalId: '79444ef9-cc85-5ac4-a3bc-f10d3ffbfd16', evidenceRound: 'first', rationaleDe: 'Beide Reviews bestätigen die Ortskurve tatsächlicher Wendepunkte. Die erste Evidenzfassung prüft den Krümmungswechsel und schließt formale Kurvenpunkte ohne Wendepunkt aus.', rationaleEn: 'Both reviews confirm the locus of actual inflection points. The first evidence version checks the change in curvature and excludes formal curve points without an inflection point.' },
] as const

const sha256 = (bytes: Buffer | string): GoalDescriptionSynthesisDigest => (
  `sha256:${createHash('sha256').update(bytes).digest('hex')}`
)
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
    if (!existing.equals(bytes)) throw new Error(`Existing next20 partial artifact is stale: ${relative(root, path)}`)
    return
  }
  if (!write) throw new Error(`Missing next20 partial artifact: ${relative(root, path)}`)
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, bytes, { flag: 'wx' })
}

const main = async () => {
  const args = process.argv.slice(2)
  if (args.length !== 1 || !['--write', '--check'].includes(args[0])) {
    throw new Error('Usage: tsx scripts/materializeMathM7UpperSecNext20Keep12Partial.ts --write|--check')
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
    dual.summary.goalCount !== 20
    || dual.summary.counts.requiresSynthesis !== 20
    || !same(dual.prepared.manifest.goalIds, config.goalIds)
    || claimedIds.length !== 12
    || new Set(claimedIds).size !== 12
  ) throw new Error('Next20 source campaign or KEEP-twelve partition changed')
  const openIds = config.goalIds.filter((goalId) => !claimedIds.includes(goalId as typeof claimedIds[number]))
  if (openIds.length !== 8) throw new Error('Next20 does not have exactly eight open goals')
  for (const summary of dual.summary.goals) {
    if (claimedIds.includes(summary.goalId as typeof claimedIds[number])) {
      if (summary.firstDecision !== 'keep' || summary.secondDecision !== 'keep') {
        throw new Error(`${summary.goalId}: both independent decisions must remain KEEP`)
      }
    } else if (summary.firstDecision === 'keep' && summary.secondDecision === 'keep') {
      throw new Error(`${summary.goalId}: open goal acquired two KEEP decisions`)
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
    || current.pages.length !== 20
  ) throw new Error('Next20 prepared or current subset model is incomplete')
  const landscapePath = join(root, dual.prepared.manifest.source.landscapePath)
  const canonicalBytes = await readFile(landscapePath)
  const landscape = JSON.parse(canonicalBytes.toString('utf8')) as {
    subject: string
    goals: Array<Record<string, unknown>>
  }
  if (landscape.subject !== 'Mathematik') throw new Error('Next20 canonical subject is not Mathematik')

  // Audit all twenty live pages and actual image bytes, including the eight
  // open goals. These image observations remain separate from the D decision.
  const pageAndImageBindings: Array<Record<string, unknown>> = []
  const imageHolds: Array<Record<string, unknown>> = []
  for (const goalId of config.goalIds) {
    const input = dual.first.input.goals.find((goal) => goal.goalId === goalId)
    const secondInput = dual.second.input.goals.find((goal) => goal.goalId === goalId)
    const preparedPage = preparedModel.pages.find((page) => page.goalId === goalId)
    const currentPage = current.pages.find((page) => page.goalId === goalId)
    const canonicalGoal = landscape.goals.find((goal) => goal.id === goalId)
    if (!input || !secondInput || !preparedPage || !currentPage || !canonicalGoal) {
      throw new Error(`${goalId}: missing current page, review input, or canonical goal`)
    }
    const contextFingerprint = fingerprintGoalDescriptionReviewContext(input)
    if (
      !same(input, secondInput)
      || !same(currentPage, preparedPage)
      || !same(currentPage, input.reviewContext.page)
      || !same(buildGoalDescriptionCanonicalContext(canonicalGoal), input.canonicalContext)
      || currentPage.goalFingerprint !== input.goalFingerprint
      || currentPage.pageFingerprint !== input.pageFingerprint
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
    let imagePublicPath: string | null = null
    let imageDigest: string | null = null
    if (visualization) {
      if (!visualization.url?.startsWith(`/assets/goal-visualizations/mathematik/${goalId}/`) || !visualization.originalDigest) {
        throw new Error(`${goalId}: image metadata is incomplete or foreign`)
      }
      const publicRoot = join(root, 'app/public')
      const imagePath = resolve(publicRoot, `.${visualization.url}`)
      if (relative(publicRoot, imagePath).startsWith(`..${sep}`)) throw new Error(`${goalId}: image escapes public root`)
      imageDigest = sha256(await readFile(imagePath))
      if (imageDigest !== visualization.originalDigest) throw new Error(`${goalId}: image bytes disagree with the live page digest`)
      imagePublicPath = relative(root, imagePath)
    }
    if (!visualization || visualization.qaStatus !== 'approved' || visualization.approvedForPublication !== true) {
      imageHolds.push({ goalId, reason: !visualization ? 'missing' : `qaStatus:${visualization.qaStatus ?? 'unknown'}` })
    }
    pageAndImageBindings.push({
      goalId,
      goalFingerprint: input.goalFingerprint,
      pageFingerprint: input.pageFingerprint,
      goalReviewContextFingerprint: contextFingerprint,
      imagePublicPath,
      imageDigest,
      imageQaStatus: visualization?.qaStatus ?? 'missing',
      imageApprovedForPublication: visualization?.approvedForPublication ?? false,
      strictDClaimed: claimedIds.includes(goalId as typeof claimedIds[number]),
    })
  }

  const expectedGoals: GoalDescriptionRolloutSynthesisExpectedGoal[] = []
  const sources = new Map<string, {
    first: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
    second: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
  }>()
  for (const choice of claimed) {
    const goalId = choice.goalId
    const first = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.first, goalId, label: 'First' })
    const second = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.second, goalId, label: 'Second' })
    if (first.errors.length || second.errors.length || !first.source?.record || !second.source?.record) {
      throw new Error(`${goalId}: missing exact validated review source: ${[...first.errors, ...second.errors].join(' | ')}`)
    }
    const input = dual.first.input.goals.find((goal) => goal.goalId === goalId)!
    const contextFingerprint = fingerprintGoalDescriptionReviewContext(input)
    if (
      first.source.decision !== 'keep'
      || second.source.decision !== 'keep'
      || first.source.binding.goalReviewContextFingerprint !== contextFingerprint
      || second.source.binding.goalReviewContextFingerprint !== contextFingerprint
    ) throw new Error(`${goalId}: KEEP or context binding drift`)
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
  if (!firstGoal) throw new Error('Next20 KEEP-twelve selection is empty')
  const completionDates = [...dual.first.resultPairs, ...dual.second.resultPairs].map(({ run }) => Date.parse(run.completedAt))
  if (completionDates.length !== 2 || completionDates.some((value) => !Number.isFinite(value))) {
    throw new Error('Next20 independent runs lack valid completion times')
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
      first: buildGoalDescriptionRolloutSynthesisRoundBinding(firstGoal.firstSource.binding, dual.prepared.manifest.artifacts.rounds.first.batchInputFingerprint),
      second: buildGoalDescriptionRolloutSynthesisRoundBinding(firstGoal.secondSource.binding, dual.prepared.manifest.artifacts.rounds.second.batchInputFingerprint),
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
    synthesizedBy: 'OpenAI Codex independent dual-review synthesis candidate',
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
  if (synthesisValidation.errors.length) throw new Error(`Next20 partial synthesis: ${synthesisValidation.errors.join(' | ')}`)
  const synthesisBytes = jsonBytes(synthesis)

  const resolutions: Array<{ path: string; bytes: Buffer }> = []
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
      throw new Error(`${goal.goalId}: native partial resolution invalid: ${validation.errors.join(' | ') || 'not strict D complete'}`)
    }
    const bytes = jsonBytes(resolution)
    const resolutionPath = `resolutions/${goal.goalId}.resolution.json`
    resolutions.push({ path: join(output, resolutionPath), bytes })
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
  if (indexErrors.length) throw new Error(`Next20 partial index: ${indexErrors.join(' | ')}`)
  const indexBytes = jsonBytes(index)
  const receipt = {
    schemaVersion: 1,
    receiptId: manifestId,
    status: 'ai_synthesis_candidate_not_registered',
    purpose: 'Strict current D materialization of only twelve double-KEEP goals from the twenty-goal independent upper-secondary Math batch.',
    sourceBatchId: dual.prepared.manifest.batchId,
    sourceCampaignGoalCount: dual.summary.goalCount,
    claimedGoalIds: claimedIds,
    openGoalIds: openIds,
    openDisposition: 'No D closure for the eight revision, dissent or split-review goals. An exact open-only batch is prepared separately for further work.',
    sourceBundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint,
    sourceReviewInputFingerprint: dual.first.input.reviewInputFingerprint,
    sourceDualSummaryDigest: sha256(dual.bytes),
    preparedBaseGoalBookDigest: dual.prepared.manifest.source.baseBookDigest,
    preparedSubsetGoalBookDigest: preparedModel.digest,
    currentCanonicalLandscapeDigest: sha256(canonicalBytes),
    currentBaseGoalBookDigest: base.model.digest,
    currentSubsetGoalBookDigest: current.digest,
    globalBookDigestDriftObserved: dual.prepared.manifest.source.baseBookDigest !== base.model.digest || preparedModel.digest !== current.digest,
    globalBookDigestDriftDisposition: 'All twenty selected canonical contexts, bilingual texts, full GoalBook pages, goal/page/context fingerprints and actual image bytes were checked against the current build. Only twelve double-KEEP goals receive D resolutions; image observations do not grant V.',
    pageAndImageBindings,
    imageHolds,
    synthesisManifestPath: 'synthesis-decisions.json',
    synthesisManifestDigest: sha256(synthesisBytes),
    resolutionIndexPath: 'resolution-index.json',
    resolutionIndexDigest: sha256(indexBytes),
    noWholeBatchProgressClaim: true,
    noVisualGateClaim: true,
    noCanonicalOrRegistryOrLedgerOrQaEdits: true,
    noHumanApprovalClaim: true,
  }
  for (const artifact of [
    { path: join(output, 'synthesis-decisions.json'), bytes: synthesisBytes },
    ...resolutions,
    { path: join(output, 'resolution-index.json'), bytes: indexBytes },
    { path: join(output, 'compatibility-receipt.json'), bytes: jsonBytes(receipt) },
  ]) await verifyOrWrite(artifact.path, artifact.bytes, write)
  console.log(`${write ? 'Materialized' : 'Verified'} Math upper-sec next20 partial: strict D=${entries.length}/12, open=${openIds.length}, image HOLDs=${imageHolds.length}; index=${relative(root, join(output, 'resolution-index.json'))}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
