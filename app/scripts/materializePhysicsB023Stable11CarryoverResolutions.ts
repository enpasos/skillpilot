import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoalDescriptionRolloutResolutionSynthesis } from './goalDescriptionRolloutResolutionSynthesis'
import { stableGoalBookJson } from './goalBookModel'
import {
  materializeGoalDescriptionRolloutBatchDualSummary,
} from './materializeGoalDescriptionRolloutBatch'
import {
  buildGoalDescriptionDualRoundResolution,
  extractGoalDescriptionDualRoundResolutionSource,
  fingerprintGoalDescriptionReviewContext,
  validateGoalDescriptionDualRoundResolution,
} from './validateGoalDescriptionDualRoundResolution'
import {
  buildGoalDescriptionCanonicalContext,
} from './validateGoalDescriptionReviewCampaign'
import {
  buildGoalDescriptionRolloutSynthesisRoundBinding,
  fingerprintGoalDescriptionRolloutSynthesisDecisionManifest,
  validateGoalDescriptionRolloutSynthesisDecisionManifest,
  type GoalDescriptionRolloutSynthesisDecisionManifest,
  type GoalDescriptionRolloutSynthesisExpectedGoal,
  type GoalDescriptionSynthesisDigest,
} from './validateGoalDescriptionRolloutSynthesisDecisionManifest'

type AdjudicationDecision = {
  goalId: string
  resolutionDecision: string
  rationaleDe?: string
}

type Adjudication = {
  schemaVersion: number
  artifactType: string
  draftContract: string
  batchId: string
  subject: string
  authority: string
  mode: string
  noProgressClaim: boolean
  materialized: boolean
  inputBinding: {
    configDigest: string
    batchManifestDigest: string
    bundleFingerprint: string
    reviewInputFingerprint: string
    goalCount: number
  }
  counts: {
    total: number
    keep_current: number
    accepted_revision: number
    structural_split: number
    unresolved_block: number
    requiresProductOwnerDecision: number
  }
  currentContextBindings: {
    canonicalLandscape: { sha256: string }
  }
  decisions: AdjudicationDecision[]
}

type SynthesisAuthoring = {
  evidenceRound: 'first'
  rationaleDe: string
  rationaleEn: string
}

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const write = process.argv.includes('--write')
const rolloutDirectory = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-28',
)
const batchName = 'batch-023-astrophysics-structural-follow-up-16-v1'
const sourceConfigPath = join(rolloutDirectory, `${batchName}.config.json`)
const sourceDirectory = join(rolloutDirectory, batchName)
const landscapePath = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
)
const adjudicationPath = join(sourceDirectory, 'third-adjudication/adjudication.json')
const batchManifestPath = join(sourceDirectory, 'batch-manifest.json')
const synthesisManifestPath = join(
  sourceDirectory,
  'synthesis-decisions.stable-current-carryover-11-v1.json',
)
const indexPath = join(sourceDirectory, 'resolution-index.stable-current-carryover-11-v1.json')
const receiptPath = join(sourceDirectory, 'stable-current-carryover-11-v1.compatibility-receipt.json')
const resolutionDirectoryName = 'resolutions-stable-current-carryover-11-v1'

const expectedConfigDigest = '99ed9371f12a8642eea49e1eb3e5fcdcae183635eb36bf1e1f6bb309f1f323dc'
const expectedBatchManifestDigest = 'e37004c065fc1d54be49d649d4397babc302625ac231739e356bf01f2677bdd0'
const expectedDualSummaryDigest = 'c88e0619acab793ecb14b77b332bdb203621b7655817f1d02afb9fee6de3a5db'
const expectedAdjudicationDigest = '3f3cd8733b0bde60686b6f7b92f8538845631c752deb1c5fda285966ba81692e'

const goalIds = [
  'a5031dfc-6d25-5a04-850a-5c7d8a254c21',
  'd024aa45-5dbb-51f7-87a6-9ba939858696',
  'e06dd9c7-8c36-5ca4-880b-57b02d837085',
  '0b8a4215-e6ed-56c8-88c3-b3a2a99723c7',
  '5e9cd796-3887-5457-8a1f-26863ca7eb28',
  '9851bd02-ca48-5ce4-8e9f-9ec4af1c43b8',
  '6e1cd027-040b-51d9-8764-3cf3daddb5ec',
  '44766569-6379-5fbc-8976-cd3fc2fd6ec4',
  '206a7d3d-9b11-56be-89ff-73898445c4f5',
  '44f0eefa-2d93-5954-879f-f6c49e5cebc7',
  'c53b3f0c-b4fe-5509-8803-a36c2883e5d6',
] as const

const synthesisByGoalId = new Map<string, SynthesisAuthoring>([
  ['a5031dfc-6d25-5a04-850a-5c7d8a254c21', {
    evidenceRound: 'first',
    rationaleDe: 'Beide Reviews bestätigen die aktuelle Modellierungs- und Urteilskompetenz. Runde A ist die stärkere Evidenzgrundlage, weil sie Bezugsfläche, Parameterwirkungen, Einheiten, Messabweichung sowie Atmosphäre, innere Wärme und weitere Grenzen in einer vollständigen Bilanz-zu-Urteil-Kette verbindet; die kompatible Fassung aus Runde B bleibt als gebundener Dissent erhalten.',
    rationaleEn: 'Both reviews confirm the current modeling and judgment competence. Round A is the stronger evidence basis because it connects reference area, parameter effects, units, discrepancy from measurement, atmosphere, internal heat, and further limitations in a complete balance-to-judgment chain; the compatible Round B formulation remains bound as dissent.',
  }],
  ['d024aa45-5dbb-51f7-87a6-9ba939858696', {
    evidenceRound: 'first',
    rationaleDe: 'Beide Reviews bestätigen die orts- und zeitgebundene Himmelsnavigation. Runde A ist stärker, weil sie nicht nur die Ausrichtung, sondern eine nachvollziehbare Suchroute über sichtbare Wegmarken und die unabhängige Identitätsprüfung anhand von Richtung, Höhe und Nachbarmustern verlangt; Runde B bleibt als Dissent gebunden.',
    rationaleEn: 'Both reviews confirm location- and time-specific sky navigation. Round A is stronger because it requires not only orientation but also a traceable search route from visible landmarks and an independent identity check using direction, altitude, and neighboring patterns; Round B remains bound as dissent.',
  }],
  ['e06dd9c7-8c36-5ca4-880b-57b02d837085', {
    evidenceRound: 'first',
    rationaleDe: 'Beide Reviews bestätigen die merkmalsgestützte Klassifikation. Runde A macht Beobachtung und Deutung, mehrere trennscharfe Merkmale, verbleibende Mehrdeutigkeit und eine revisionsfähige Zuordnung nach zusätzlicher Bewegungsinformation am vollständigsten prüfbar; Runde B bleibt als Dissent gebunden.',
    rationaleEn: 'Both reviews confirm feature-based classification. Round A most fully makes assessable the separation of observation from interpretation, multiple discriminating features, residual ambiguity, and revisable assignment after additional motion information; Round B remains bound as dissent.',
  }],
  ['0b8a4215-e6ed-56c8-88c3-b3a2a99723c7', {
    evidenceRound: 'first',
    rationaleDe: 'Beide Reviews bestätigen die räumlich-zeitliche Sichtbarkeitsinferenz. Runde A verbindet lokalen Horizont und Sonnenlage explizit mit Erdrotation, Erdumlauf und geografischer Breite und prüft zusätzlich Beobachtungsfenster sowie Zirkumpolarität im Transfer; Runde B bleibt als Dissent gebunden.',
    rationaleEn: 'Both reviews confirm spatial-temporal visibility inference. Round A explicitly connects the local horizon and solar position with Earth rotation, Earth orbit, and geographic latitude and additionally tests observing windows and circumpolarity in transfer; Round B remains bound as dissent.',
  }],
  ['5e9cd796-3887-5457-8a1f-26863ca7eb28', {
    evidenceRound: 'first',
    rationaleDe: 'Beide Reviews bestätigen die Newton-Kepler-Masseninferenz. Runde A bindet große Halbachse, Periode, physikalische Herleitung, Einheiten- und Größenordnungsprüfung, Unsicherheit sowie den Wechsel zu Gesamtmasse und Relativbahn bei massereichem Begleiter besonders vollständig; Runde B bleibt als Dissent gebunden.',
    rationaleEn: 'Both reviews confirm Newton-Kepler mass inference. Round A most fully binds semimajor axis, period, physical derivation, unit and order-of-magnitude checks, uncertainty, and the change to total mass and relative orbit for a massive companion; Round B remains bound as dissent.',
  }],
  ['9851bd02-ca48-5ce4-8e9f-9ec4af1c43b8', {
    evidenceRound: 'first',
    rationaleDe: 'Beide Reviews bestätigen die Inferenz von lokaler Bestrahlungsstärke zur Gesamtleistung. Runde A macht Messort, Bezugsfläche, Abstandsprognose, Unsicherheit und die Prüfung von Isotropie beziehungsweise Abschwächung besonders explizit; Runde B bleibt als Dissent gebunden.',
    rationaleEn: 'Both reviews confirm inference from local irradiance to total power. Round A makes the measurement location, reference area, distance prediction, uncertainty, and the test of isotropy or attenuation especially explicit; Round B remains bound as dissent.',
  }],
  ['6e1cd027-040b-51d9-8764-3cf3daddb5ec', {
    evidenceRound: 'first',
    rationaleDe: 'Beide Reviews bestätigen die modellgestützte Planetensichtbarkeit. Runde A trennt heliozentrische Modelldarstellung und beobachtete Himmelsperspektive besonders klar und verlangt Blickrichtung, Sonnenrichtung, relevante Winkel sowie den Transfer zwischen inneren und äußeren Planeten; Runde B bleibt als Dissent gebunden.',
    rationaleEn: 'Both reviews confirm model-based planetary visibility. Round A particularly clearly separates the heliocentric model representation from the observed sky perspective and requires line of sight, solar direction, relevant angles, and transfer between inner and outer planets; Round B remains bound as dissent.',
  }],
  ['44766569-6379-5fbc-8976-cd3fc2fd6ec4', {
    evidenceRound: 'first',
    rationaleDe: 'Beide Reviews bestätigen die physikalische und historische Einordnung scheinbarer Schleifenbahnen. Runde A operationalisiert den Modellvergleich zusätzlich mit Vorhersagegüte, Kohärenz, Einfachheit und zeitgenössischen Beobachtungsmöglichkeiten und verhindert dadurch eine monokausale Beweisgeschichte; Runde B bleibt als Dissent gebunden.',
    rationaleEn: 'Both reviews confirm the physical and historical interpretation of apparent retrograde loops. Round A additionally operationalizes model comparison through predictive performance, coherence, simplicity, and contemporary observational capability, thereby preventing a monocausal proof narrative; Round B remains bound as dissent.',
  }],
  ['206a7d3d-9b11-56be-89ff-73898445c4f5', {
    evidenceRound: 'first',
    rationaleDe: 'Beide Reviews bestätigen die Methodenwahl für Galaxienentfernungen. Runde A trennt Messgröße, Kalibriergröße und erschlossene Entfernung, bindet die teilweise aufeinander aufbauende Entfernungsskala ein und prüft Reichweite, Extinktion sowie fehlende Kalibratoren im Transfer; Runde B bleibt als Dissent gebunden.',
    rationaleEn: 'Both reviews confirm method selection for galaxy distances. Round A distinguishes observable, calibration quantity, and inferred distance, incorporates the partly interdependent distance scale, and tests range, extinction, and missing calibrators in transfer; Round B remains bound as dissent.',
  }],
  ['44f0eefa-2d93-5954-879f-f6c49e5cebc7', {
    evidenceRound: 'first',
    rationaleDe: 'Beide Reviews bestätigen das Hubble-Alter als modellabhängige Zeitskala. Runde A verbindet transparente Einheitenumrechnung mit der durch Materie, Strahlung und dunkle Energie veränderten Expansionsgeschichte und verlangt für Abbremsung oder Beschleunigung eine begründete Über- beziehungsweise Unterschätzungsrichtung; Runde B bleibt als Dissent gebunden.',
    rationaleEn: 'Both reviews confirm the Hubble age as a model-dependent time scale. Round A connects transparent unit conversion with an expansion history altered by matter, radiation, and dark energy and requires a justified direction of over- or underestimation for deceleration or acceleration; Round B remains bound as dissent.',
  }],
  ['c53b3f0c-b4fe-5509-8803-a36c2883e5d6', {
    evidenceRound: 'first',
    rationaleDe: 'Beide Reviews bestätigen die begrenzte Dunkle-Materie-Inferenz. Runde A verbindet den quantitativen Kurvenvergleich mit eingeschlossener Masse, Masse-Licht-Verhältnis und Gravitationsmodell und fordert zusätzlich eine unabhängige Prüfung durch veränderte baryonische Verteilung oder Linsendaten; Runde B bleibt als Dissent gebunden.',
    rationaleEn: 'Both reviews confirm the bounded dark-matter inference. Round A connects quantitative curve comparison with enclosed mass, mass-to-light ratio, and the gravitational model and additionally requires an independent check using a changed baryonic distribution or lensing data; Round B remains bound as dissent.',
  }],
])

const sha256 = (value: Buffer | string): GoalDescriptionSynthesisDigest => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)

const sha256Hex = (value: Buffer | string): string => (
  createHash('sha256').update(value).digest('hex')
)

const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)

const sameOrderedValues = (left: readonly string[], right: readonly string[]): boolean => (
  left.length === right.length && left.every((value, index) => value === right[index])
)

const readOptional = async (path: string): Promise<Buffer | null> => {
  try {
    return await readFile(path)
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}

const writeAllOrRequireExact = async (
  artifacts: Array<{ path: string; bytes: Buffer }>,
): Promise<void> => {
  const current = await Promise.all(artifacts.map(({ path }) => readOptional(path)))
  artifacts.forEach(({ path, bytes }, index) => {
    if (current[index] && !current[index]?.equals(bytes)) {
      throw new Error(`Existing Physics B023 stable carryover artifact is stale: ${path}`)
    }
    if (!current[index] && !write) {
      throw new Error(`Missing Physics B023 stable carryover artifact: ${path}`)
    }
  })
  if (!write) return
  await Promise.all(artifacts.flatMap(({ path, bytes }, index) => (
    current[index]
      ? []
      : [mkdir(dirname(path), { recursive: true })
          .then(() => writeFile(path, bytes, { flag: 'wx' }))]
  )))
}

const synthesisTimestamp = (
  dual: Awaited<ReturnType<typeof materializeGoalDescriptionRolloutBatchDualSummary>>,
): string => {
  const completed = [...dual.first.resultPairs, ...dual.second.resultPairs]
    .map(({ run }) => Date.parse(run.completedAt))
  if (completed.length === 0 || completed.some((value) => !Number.isFinite(value))) {
    throw new Error('B023 completed review runs must provide valid completedAt timestamps')
  }
  return new Date(Math.max(...completed) + 1000).toISOString()
}

const main = async (): Promise<void> => {
  const unknownArgs = process.argv.slice(2).filter((arg) => arg !== '--write')
  if (unknownArgs.length > 0) throw new Error(`Unknown arguments: ${unknownArgs.join(', ')}`)

  const [dual, configBytes, landscapeBytes, adjudicationBytes, batchManifestBytes] = await Promise.all([
    materializeGoalDescriptionRolloutBatchDualSummary(sourceConfigPath, false),
    readFile(sourceConfigPath),
    readFile(landscapePath),
    readFile(adjudicationPath),
    readFile(batchManifestPath),
  ])
  if (
    sha256Hex(configBytes) !== expectedConfigDigest
    || sha256Hex(batchManifestBytes) !== expectedBatchManifestDigest
    || sha256Hex(dual.bytes) !== expectedDualSummaryDigest
    || sha256Hex(adjudicationBytes) !== expectedAdjudicationDigest
  ) {
    throw new Error('Physics B023 config, batch manifest, dual summary, or adjudication digest changed')
  }

  const landscape = JSON.parse(landscapeBytes.toString('utf8')) as {
    goals: Array<Record<string, unknown>>
  }
  const adjudication = JSON.parse(adjudicationBytes.toString('utf8')) as Adjudication
  const adjudicatedKeepIds = adjudication.decisions
    .filter(({ resolutionDecision }) => resolutionDecision === 'keep_current')
    .map(({ goalId }) => goalId)
  if (
    adjudication.schemaVersion !== 1
    || adjudication.artifactType !== 'skillpilot-goal-description-third-adjudication-draft'
    || adjudication.draftContract !== 'skillpilot-goal-description-bilingual-adjudication-draft-v1'
    || adjudication.batchId !== dual.prepared.manifest.batchId
    || adjudication.subject !== 'physik'
    || adjudication.authority !== 'root_synthesis_after_two_independent_blind_rounds_and_primary_source_atomicity_audit'
    || adjudication.mode !== 'append_only_fail_closed_repository_local_subject_adjudication'
    || adjudication.noProgressClaim !== true
    || adjudication.materialized !== false
    || adjudication.inputBinding.configDigest !== sha256(configBytes)
    || adjudication.inputBinding.batchManifestDigest !== sha256(batchManifestBytes)
    || adjudication.inputBinding.bundleFingerprint !== dual.prepared.manifest.artifacts.bundleFingerprint
    || adjudication.inputBinding.reviewInputFingerprint !== dual.prepared.manifest.artifacts.reviewInputFingerprint
    || adjudication.inputBinding.goalCount !== dual.summary.goalCount
    || adjudication.counts.total !== 16
    || adjudication.counts.keep_current !== 11
    || adjudication.counts.accepted_revision !== 4
    || adjudication.counts.structural_split !== 1
    || adjudication.counts.unresolved_block !== 0
    || adjudication.counts.requiresProductOwnerDecision !== 0
    || !sameOrderedValues(adjudicatedKeepIds, goalIds)
    || synthesisByGoalId.size !== goalIds.length
  ) {
    throw new Error('Physics B023 third-adjudication binding or exact stable11 scope is invalid')
  }

  const expectedGoals: GoalDescriptionRolloutSynthesisExpectedGoal[] = []
  const sourceByGoalId = new Map<string, {
    first: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
    second: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
  }>()
  const currentCanonicalGoals: Record<string, unknown>[] = []

  for (const goalId of goalIds) {
    const firstResult = extractGoalDescriptionDualRoundResolutionSource({
      artifacts: dual.first,
      goalId,
      label: 'First',
    })
    const secondResult = extractGoalDescriptionDualRoundResolutionSource({
      artifacts: dual.second,
      goalId,
      label: 'Second',
    })
    const sourceErrors = [...firstResult.errors, ...secondResult.errors]
    if (sourceErrors.length > 0 || !firstResult.source?.record || !secondResult.source?.record) {
      throw new Error(`${goalId}: ${sourceErrors.join(' | ') || 'missing exact source record'}`)
    }
    if (!sameOrderedValues(
      [firstResult.source.decision, secondResult.source.decision],
      ['keep', 'keep'],
    )) {
      throw new Error(`${goalId}: expected two KEEP source decisions`)
    }

    const inputGoal = dual.first.input.goals.find((goal) => goal.goalId === goalId)
    const secondInputGoal = dual.second.input.goals.find((goal) => goal.goalId === goalId)
    const canonicalGoal = landscape.goals.find((goal) => goal.id === goalId)
    if (!inputGoal || !secondInputGoal || !canonicalGoal) {
      throw new Error(`${goalId}: missing B023 input or current canonical goal`)
    }
    if (
      stableGoalBookJson(inputGoal) !== stableGoalBookJson(secondInputGoal)
      || stableGoalBookJson(inputGoal.canonicalContext)
        !== stableGoalBookJson(buildGoalDescriptionCanonicalContext(canonicalGoal))
    ) {
      throw new Error(`${goalId}: B023 blind rounds or current direct canonical context are no longer exact`)
    }
    const finalText = {
      titleDe: inputGoal.currentTitleDe,
      titleEn: inputGoal.currentTitleEn,
      descriptionDe: inputGoal.currentDescriptionDe,
      descriptionEn: inputGoal.currentDescriptionEn,
    }
    const currentText = {
      titleDe: String(canonicalGoal.title ?? ''),
      titleEn: String(canonicalGoal.titleEn ?? ''),
      descriptionDe: String(canonicalGoal.description ?? ''),
      descriptionEn: String(canonicalGoal.descriptionEn ?? ''),
    }
    if (stableGoalBookJson(finalText) !== stableGoalBookJson(currentText)) {
      throw new Error(`${goalId}: reviewed bilingual text is not exact-current`)
    }
    expectedGoals.push({
      goalId,
      effectiveSemanticKind: 'curricularAtomic',
      goalFingerprint: inputGoal.goalFingerprint as GoalDescriptionSynthesisDigest,
      pageFingerprint: inputGoal.pageFingerprint as GoalDescriptionSynthesisDigest,
      goalReviewContextFingerprint: fingerprintGoalDescriptionReviewContext(inputGoal),
      finalText,
      firstSource: firstResult.source,
      secondSource: secondResult.source,
    })
    sourceByGoalId.set(goalId, { first: firstResult.source, second: secondResult.source })
    currentCanonicalGoals.push(canonicalGoal)
  }

  const firstGoal = expectedGoals[0]
  if (!firstGoal) throw new Error('Physics B023 stable11 scope must not be empty')
  const sourceCanonicalDigest = adjudication.currentContextBindings.canonicalLandscape.sha256
  if (!/^[a-f0-9]{64}$/u.test(sourceCanonicalDigest)) {
    throw new Error('Physics B023 adjudication has an invalid source canonical digest')
  }
  const expectedBindings = {
    batch: {
      batchId: dual.prepared.manifest.batchId,
      batchManifestDigest: sha256(batchManifestBytes),
      configDigest: dual.prepared.manifest.configDigest,
      bundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint,
      bookDigest: dual.first.input.bookDigest as GoalDescriptionSynthesisDigest,
      reviewInputFingerprint: dual.first.input.reviewInputFingerprint as GoalDescriptionSynthesisDigest,
      dualSummaryDigest: sha256(dual.bytes),
      canonicalLandscapeDigest: `sha256:${sourceCanonicalDigest}` as GoalDescriptionSynthesisDigest,
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
    synthesizedAt: synthesisTimestamp(dual),
    goals: expectedGoals,
  }
  const manifestId = 'physik-b023-stable11-synthesis-openai-codex-20260828'
  const manifestPayload: Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'> = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
    schemaVersion: 1,
    synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
    manifestId,
    authority: 'ai_synthesis',
    synthesizedBy: 'OpenAI Codex B023 subject synthesis candidate',
    synthesizedAt: expectedBindings.synthesizedAt,
    batch: expectedBindings.batch,
    rounds: expectedBindings.rounds,
    decisions: expectedGoals.map((goal, index) => {
      const authored = synthesisByGoalId.get(goal.goalId)
      const sources = sourceByGoalId.get(goal.goalId)
      if (!authored || !sources?.first.record || !sources.second.record) {
        throw new Error(`${goal.goalId}: missing synthesis authoring or source records`)
      }
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
          first: {
            recordId: sources.first.binding.recordId,
            recordDigest: sources.first.binding.recordDigest,
          },
          second: {
            recordId: sources.second.binding.recordId,
            recordDigest: sources.second.binding.recordDigest,
          },
        },
        rationaleDe: authored.rationaleDe,
        rationaleEn: authored.rationaleEn,
      }
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
  if (manifestValidation.errors.length > 0) {
    throw new Error(`Physics B023 stable11 synthesis manifest: ${manifestValidation.errors.join(' | ')}`)
  }
  const synthesisManifestBytes = jsonBytes(synthesisManifest)
  const relativeSynthesisManifestPath = 'synthesis-decisions.stable-current-carryover-11-v1.json'

  const resolutionArtifacts: Array<{ path: string; bytes: Buffer }> = []
  const indexEntries: Array<Record<string, unknown>> = []
  for (const goal of expectedGoals) {
    const sources = sourceByGoalId.get(goal.goalId)
    const summaryGoal = dual.summary.goals.find(({ goalId }) => goalId === goal.goalId)
    const decision = synthesisManifest.decisions.find(({ goalId }) => goalId === goal.goalId)
    if (!sources || !summaryGoal || !decision) {
      throw new Error(`${goal.goalId}: missing aligned synthesis inputs`)
    }
    const synthesis = buildGoalDescriptionRolloutResolutionSynthesis({
      batchId: synthesisManifest.batch.batchId,
      manifest: synthesisManifest,
      decision,
      summaryGoal,
      firstSource: sources.first,
      secondSource: sources.second,
    })
    const resolution = buildGoalDescriptionDualRoundResolution({
      resolutionId: `physics-b023-stable11-current-carryover-v1-resolution-${goal.goalId}`,
      goalId: goal.goalId,
      effectiveSemanticKind: 'curricularAtomic',
      decision: 'keep_current',
      synthesis,
      dualSummaryBytes: dual.bytes,
      currentInput: dual.first.input,
      firstSource: sources.first,
      secondSource: sources.second,
      synthesisDecisionManifest: {
        contract: synthesisManifest.synthesisContract,
        manifestPath: relativeSynthesisManifestPath,
        manifestId: synthesisManifest.manifestId,
        manifestDigest: sha256(synthesisManifestBytes),
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
        manifestBytes: synthesisManifestBytes,
        manifestPath: relativeSynthesisManifestPath,
      },
    })
    if (validation.errors.length > 0 || !validation.strictDescriptionComplete) {
      throw new Error(
        `${goal.goalId}: ${validation.errors.join(' | ') || 'resolution is not strict complete'}`,
      )
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

  const currentCanonicalGoalSubsetDigest = sha256(stableGoalBookJson(
    currentCanonicalGoals.map((goal) => ({
      goalId: goal.id,
      canonicalContext: buildGoalDescriptionCanonicalContext(goal),
    })),
  ))
  const index = {
    schemaVersion: 1,
    artifactSetId: `${dual.prepared.manifest.batchId}-stable-current-carryover-11`,
    subject: dual.prepared.manifest.subjectLabel,
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: indexEntries.length,
    curriculumAtomicDenominator: 459,
    descriptionReviewPercentage: Number(((indexEntries.length / 459) * 100).toFixed(1)),
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
  const receipt = {
    schemaVersion: 1,
    receiptId: 'physik-rollout-v1-batch-023-stable-current-carryover-11-v1-20260828',
    purpose: 'Bounded compatibility materialization of the exact eleven B023 KEEP goals, independent of the still-pending four revisions and one structural split.',
    sourceBatchId: dual.prepared.manifest.batchId,
    sourceCampaignGoalCount: dual.summary.goalCount,
    claimedGoalIds: [...goalIds],
    claimedGoalCount: goalIds.length,
    sourceConfigDigest: sha256(configBytes),
    sourceBatchManifestDigest: sha256(batchManifestBytes),
    sourceDualSummaryDigest: sha256(dual.bytes),
    sourceAdjudicationDigest: sha256(adjudicationBytes),
    importedBundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint,
    sourceCanonicalLandscapeDigest: `sha256:${sourceCanonicalDigest}`,
    currentCanonicalGoalSubsetDigest,
    synthesisManifestPath: relativeSynthesisManifestPath,
    synthesisManifestDigest: sha256(synthesisManifestBytes),
    synthesisManifestFingerprint: synthesisManifest.manifestFingerprint,
    resolutionIndexPath: 'resolution-index.stable-current-carryover-11-v1.json',
    resolutionIndexFormat: 'legacy-schema-v1-partial-group',
    evidenceRoundByGoalId: Object.fromEntries(goalIds.map((goalId) => [goalId, 'first'])),
    rationale: [
      'All eleven current canonical bilingual texts and direct canonical contexts remain exact to both B023 blind-review inputs; both source records are byte-bound and freshly production-validated for every goal.',
      'Both independent records decide KEEP for every claimed goal. Round A is selected goal by goal because its evidence chain is more explicit or complete; each compatible Round B evidence formulation remains bound through the synthesis records, bilingual rationale, compatibility receipt, and positive-evidence dissent.',
      'The third adjudication leaves these eleven goals unchanged and separately keeps four revisions plus one structural split pending. This lane neither materializes nor claims progress for those six follow-up atomic goals.',
      'A new eleven-goal campaign would duplicate two valid independent reviews without adding evidence. The bounded schema-v1 compatibility path preserves fresh resolution validation and a selected-goal direct-context digest without coupling the receipt to unrelated future landscape changes.',
      'This receipt changes no canonical goal, graph, mapping, assessment, atomicity, memory, visualization, or Nano Banana asset bytes and grants no progress until the central five-gate rollout check passes.',
    ],
    safeguards: {
      individualResolutionsFreshlyValidated: true,
      exactCurrentBilingualTextsRequired: true,
      exactCurrentDirectCanonicalContextsRequired: true,
      bothBlindReviewRecordsByteBound: true,
      selectedRoundAExplicitPerGoal: true,
      roundBEvidenceBoundAsDissent: true,
      pendingRevisionAndSplitGoalsExcluded: true,
      duplicateOwnershipFailsClosed: true,
      positiveEvidenceValidatedSeparately: true,
      productOwnerEscalationRequired: false,
    },
  }

  await writeAllOrRequireExact([
    { path: synthesisManifestPath, bytes: synthesisManifestBytes },
    ...resolutionArtifacts,
    { path: indexPath, bytes: jsonBytes(index) },
    { path: receiptPath, bytes: jsonBytes(receipt) },
  ])
  console.log(
    `${write ? 'Materialized' : 'Verified'} Physics B023 stable11 carryover: strict=${indexEntries.length}/${goalIds.length}; index=${indexPath}`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
