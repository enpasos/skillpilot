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
const sourceName = 'm7-j10-functions-equations-18-current-20260923-v1'
const outputName = 'm7-j10-functions-equations-keep-ten-partial-20260923-v1'
const source = join(root, rollout, sourceName)
const output = join(root, rollout, outputName)
const configPath = join(root, rollout, `${sourceName}.config.json`)
const manifestId = 'mathematik-m7-j10-functions-equations-keep-ten-partial-20260923-v1'

// Decision consensus is necessary but not sufficient: every claimed page,
// canonical context and image is also rebound to the live build below. Eight
// dissenting or split-review goals remain open; neither round is overwritten.
const claimed = [
  { goalId: '42e19186-6769-41ac-a7bf-ab39bdb50661', evidenceRound: 'second' as const, rationaleDe: 'Beide unabhängigen Reviews bestätigen die integrierte Beschreibung exponentieller Prozesse über Term, Tabelle und Graph. Die zweite Evidenzfassung verbindet Startwert und Faktor mit einer eigenständig aus einer verbalen Abnahme konstruierten Darstellung und einem Zunahme-Transfer.', rationaleEn: 'Both independent reviews confirm the integrated description of exponential processes across expression, table, and graph. The second evidence version links initial value and factor to an independently constructed decay representation and a growth transfer.' },
  { goalId: '15ce2a7e-a5dc-44f7-8a5e-6d04dd81db12', evidenceRound: 'first' as const, rationaleDe: 'Beide unabhängigen Reviews bestätigen die aktuelle Potenzsummen-Kompetenz. Die erste Evidenzfassung prüft besonders klar die Umformung einer faktorisierten Darstellung und die Abgrenzung zu negativen oder gebrochenen Exponenten.', rationaleEn: 'Both independent reviews confirm the current power-sum competence. The first evidence version particularly clearly tests conversion from factored form and the distinction from negative or fractional exponents.' },
  { goalId: '283ec44e-747c-55e3-9a61-4a4cc70ebfab', evidenceRound: 'first' as const, rationaleDe: 'Beide unabhängigen Reviews bestätigen die Begründung des Randverhaltens aus Grad und Leitkoeffizient. Die erste Evidenzfassung benennt beide Richtungen x gegen plus und minus unendlich und transferiert gezielt Gradparität sowie Vorzeichen.', rationaleEn: 'Both independent reviews confirm reasoning about end behavior from degree and leading coefficient. The first evidence version names both positive and negative infinite directions and transfers parity and sign deliberately.' },
  { goalId: '0190e463-51a7-4860-9b35-d875530a85ba', evidenceRound: 'second' as const, rationaleDe: 'Beide unabhängigen Reviews bestätigen die Symmetrieprüfung über f(-x). Die zweite Evidenzfassung prüft eine neu hinzugefügte gerade oder ungerade Termkomponente und damit eine relevante Änderung der Symmetrie.', rationaleEn: 'Both independent reviews confirm symmetry checking through f(-x). The second evidence version tests a newly added even or odd term and thus a relevant symmetry change.' },
  { goalId: '9f2fc0d1-e1e7-4051-ba70-87ba1dd8dd1c', evidenceRound: 'first' as const, rationaleDe: 'Beide unabhängigen Reviews bestätigen die Anwendung von Faktor-, Summen- und Potenzregel auf einfache Terme. Die erste Evidenzfassung trennt die Rollen von Koeffizient, Exponent und Konstante und bleibt ohne nicht beanspruchte Produkt- oder Kettenregel.', rationaleEn: 'Both independent reviews confirm application of constant-factor, sum, and power rules to simple expressions. The first evidence version distinguishes coefficient, exponent, and constant without importing product or chain rules.' },
  { goalId: 'b43a1e45-f05c-4d78-8453-f6fa677dc24c', evidenceRound: 'second' as const, rationaleDe: 'Beide unabhängigen Reviews bestätigen Tangente und Normale als zusammenhängende Geradenkonstruktion im selben Punkt. Die zweite Evidenzfassung prüft den Sonderfall einer waagerechten Tangente mit vertikaler Normalen ausdrücklich.', rationaleEn: 'Both independent reviews confirm tangent and normal as one connected line construction at the same point. The second evidence version explicitly tests a horizontal tangent with a vertical normal.' },
  { goalId: '06bdbecb-53e0-5ac3-992f-d6fd20555b59', evidenceRound: 'first' as const, rationaleDe: 'Beide unabhängigen Reviews bestätigen die Tangente als lokale lineare Approximation. Die erste Evidenzfassung macht den Transfer vom nahen Schätzwert zu einem weiter entfernten Fall und der dort begrenzten Zuverlässigkeit besonders deutlich.', rationaleEn: 'Both independent reviews confirm the tangent as a local linear approximation. The first evidence version clearly transfers from a nearby estimate to a farther case with reduced reliability.' },
  { goalId: '14d0e697-3fb0-5074-a08c-7e01ca9bbda8', evidenceRound: 'second' as const, rationaleDe: 'Beide unabhängigen Reviews bestätigen einmaliges Quadrieren mit anschließender Probe. Die zweite Evidenzfassung macht an einer konkreten Gleichung Definitions- und Vorzeichenbedingungen sowie das Verwerfen einer Scheinlösung überprüfbar.', rationaleEn: 'Both independent reviews confirm one squaring step followed by checking. The second evidence version makes domain and sign conditions and rejection of an extraneous root assessable in a concrete equation.' },
  { goalId: 'd0db87c4-36f5-5ac6-8428-da96d31b253a', evidenceRound: 'first' as const, rationaleDe: 'Beide unabhängigen Reviews bestätigen die Lösung einfacher Potenzgleichungen. Die erste Evidenzfassung verknüpft Vorzeichen und gerade bzw. ungerade Exponenten mit der Anzahl zulässiger reeller Lösungen und einer geänderten rechten Seite.', rationaleEn: 'Both independent reviews confirm solving simple power equations. The first evidence version links sign and even or odd exponents to the number of admissible real solutions and a changed right-hand side.' },
  { goalId: '2bd88d66-5daf-53bb-aa02-4c010963679d', evidenceRound: 'first' as const, rationaleDe: 'Beide unabhängigen Reviews bestätigen Substitution, Rücksubstitution und Probe als einen Lösungsweg. Die erste Evidenzfassung prüft zusätzlich die Zulässigkeit der Hilfsvariablen an einem unabhängigen Fall.', rationaleEn: 'Both independent reviews confirm substitution, back-substitution, and checking as one solution pathway. The first evidence version also tests admissibility of the auxiliary variable in an independent case.' },
] as const
const openIds = [
  '31207307-0cf9-4a56-bf14-90196dc2b3d4',
  'c74d0c7e-44e2-46ab-8f95-b8dc45fcfae7',
  '3c1d6ce7-099e-4267-9ff2-3d1526209a89',
  '3010d965-b9b9-4dc5-9d04-d706725e9a30',
  '1ce8af38-082a-477b-af48-b924c92761bf',
  '1a18dbb3-f350-4766-9c8b-20ca018ccef1',
  'ad66009f-55fb-563f-ace0-dbfeae7c76c3',
  'f76d00dc-6b31-59cd-b01a-3610eadc9908',
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
    if (!existing.equals(bytes)) throw new Error(`Existing J10 partial artifact is stale: ${relative(root, path)}`)
    return
  }
  if (!write) throw new Error(`Missing J10 partial artifact: ${relative(root, path)}`)
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, bytes, { flag: 'wx' })
}

const main = async () => {
  const args = process.argv.slice(2)
  if (args.length !== 1 || !['--write', '--check'].includes(args[0])) {
    throw new Error('Usage: tsx app/scripts/materializeMathM7J10KeepTenPartial.ts --write|--check')
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
    dual.summary.goalCount !== 18
    || dual.summary.counts.requiresSynthesis !== 18
    || !same(dual.prepared.manifest.goalIds, config.goalIds)
    || new Set([...claimedIds, ...openIds]).size !== 18
    || config.goalIds.some((id) => ![...claimedIds, ...openIds].includes(id))
  ) throw new Error('J10 source campaign and KEEP-ten/open-eight partition changed')
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
    || current.pages.length !== 18
    || base.model.pages.length !== dual.prepared.manifest.curriculumAtomicDenominatorAtPreparation
  ) throw new Error('J10 prepared model or current curricularAtomic denominator changed')
  const landscapePath = join(root, dual.prepared.manifest.source.landscapePath)
  const canonicalBytes = await readFile(landscapePath)
  const landscape = JSON.parse(canonicalBytes.toString('utf8')) as {
    subject: string
    goals: Array<Record<string, unknown>>
  }
  if (landscape.subject !== 'Mathematik') throw new Error('J10 canonical subject is not Mathematik')
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
  if (!firstGoal) throw new Error('J10 KEEP-ten selection is empty')
  const completionDates = [...dual.first.resultPairs, ...dual.second.resultPairs]
    .map(({ run }) => Date.parse(run.completedAt))
  if (completionDates.length !== 2 || completionDates.some((value) => !Number.isFinite(value))) {
    throw new Error('J10 independent runs lack exact valid completion times')
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
    throw new Error(`J10 partial synthesis validation: ${synthesisValidation.errors.join(' | ')}`)
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
      throw new Error(`${goal.goalId}: native J10 partial resolution invalid: ${validation.errors.join(' | ') || 'not strict D complete'}`)
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
  if (indexErrors.length) throw new Error(`J10 partial-index validation: ${indexErrors.join(' | ')}`)
  const indexBytes = jsonBytes(index)
  const receipt = {
    schemaVersion: 1,
    receiptId: manifestId,
    status: 'ai_synthesis_candidate_not_registered',
    purpose: 'Partial D closure for exactly ten live-page KEEP/KEEP goals from an eighteen-goal independent J10 functions/equations review; eight dissenting, revision or split-review goals remain open.',
    sourceBatchId: dual.prepared.manifest.batchId,
    sourceCampaignGoalCount: dual.summary.goalCount,
    claimedGoalIds: claimedIds,
    openGoalIds: openIds,
    openDisposition: 'No strict D closure, image acceptance, or human approval is inferred for these eight. Revision and split-review decisions require separate targeted handling.',
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
    globalBookDigestDriftDisposition: 'Whole-book and subset digests are provenance, not an equivalence claim. Each of the ten claimed goals is rechecked against the live canonical context, full GoalBook page, both review contexts and exact image bytes; the eight open goals are not claimed.',
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
  console.log(`${write ? 'Materialized' : 'Verified'} Math J10 partial: strict D=${entries.length}/10, open=${openIds.length}; index=${relative(root, join(output, 'resolution-index.json'))}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
