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
  evidenceRound: 'first' | 'second'
  rationaleDe: string
  rationaleEn: string
}

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const write = process.argv.includes('--write')
const rolloutDirectory = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-28',
)
const batchName = 'batch-022-astrophysics-current-20-v1'
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
  'synthesis-decisions.stable-current-carryover-12-v1.json',
)
const indexPath = join(sourceDirectory, 'resolution-index.stable-current-carryover-12-v1.json')
const receiptPath = join(sourceDirectory, 'stable-current-carryover-12-v1.compatibility-receipt.json')
const resolutionDirectoryName = 'resolutions-stable-current-carryover-12-v1'

const expectedConfigDigest = '8c6fa751fd722a72aceab4ebba9c7796117d6ea6ae3a768388992d9b5c1d7d97'
const expectedBatchManifestDigest = '254c30d4ccedadb982afc310953fa527eaf6703bbb1f2a6f77071a9bece37f48'
const expectedDualSummaryDigest = 'e9759f734266db617d93f7ddfe9998053757f63ee518843c7a2d11b3a725e7d4'
const expectedAdjudicationDigest = '2515d1f450ec081d16e4a52d1d005c4f6b7f288dd387f04392671ff1b1d16694'

const goalIds = [
  '6d18104b-5704-5c45-b39a-2c84565b1796',
  '982df2f3-e040-5f4b-b668-0fe05d994b29',
  '9f85de48-1b3f-5afb-8a34-ce94cf7a1b49',
  'ce037050-f94c-5828-883a-76385c84d1f7',
  '5c5d6698-c056-5850-8ecd-6dd87fb44549',
  'f9c025ce-4327-5de7-8288-a3358e14a576',
  '89124b92-5769-5e13-8a5d-78497936260f',
  '4e823349-b60c-5d2a-b96f-d3f23ae50e3a',
  '826af579-3e51-5ac9-bc2a-208d8a2fc99e',
  '09995ab9-86aa-5b02-8a58-62b16a37831d',
  'e2014db8-c97f-5ce1-82c5-2a42741f4a61',
  '6ae54ff9-dc3b-563b-b2ee-09a0f0d00162',
] as const

const synthesisByGoalId = new Map<string, SynthesisAuthoring>([
  ['6d18104b-5704-5c45-b39a-2c84565b1796', {
    evidenceRound: 'first',
    rationaleDe: 'Beide unabhängigen Reviews bestätigen den aktuellen Wortlaut als eine zusammenhängende historische Reflexionskompetenz. Die erste Runde bildet die fachliche Kette von Beobachtung über Theorie und Weltbildwechsel bis zur kriteriengeleiteten Wirkungsreflexion vollständiger ab und wird deshalb als Evidenzgrundlage gewählt.',
    rationaleEn: 'Both independent reviews confirm the current wording as one coherent historical reflection competence. The first round more fully captures the chain from observation through theory and worldview change to criteria-based reflection on impacts and is therefore selected as the evidence basis.',
  }],
  ['982df2f3-e040-5f4b-b668-0fe05d994b29', {
    evidenceRound: 'second',
    rationaleDe: 'Beide Reviews bestätigen die daten- und kriteriengestützte Klassifikationskompetenz. Die zweite Runde prüft zusätzlich unvollständige Daten, eine entscheidende Folgemessung und die revisionsfähige Schlussfolgerung und ist damit die stärkere Transfergrundlage.',
    rationaleEn: 'Both reviews confirm the data- and criteria-based classification competence. The second round additionally tests incomplete data, a decisive follow-up measurement, and a revisable conclusion, making it the stronger transfer basis.',
  }],
  ['9f85de48-1b3f-5afb-8a34-ce94cf7a1b49', {
    evidenceRound: 'first',
    rationaleDe: 'Beide Reviews bestätigen die gemeinsame astrometrische Inferenzkette. Die erste Runde trennt Tangential- und Radialkomponente explizit und bindet Einheiten, Messunsicherheit und Tragfähigkeitsurteil am vollständigsten.',
    rationaleEn: 'Both reviews confirm the joint astrometric inference chain. The first round explicitly distinguishes tangential and radial components and most fully binds units, measurement uncertainty, and the reliability judgment.',
  }],
  ['ce037050-f94c-5828-883a-76385c84d1f7', {
    evidenceRound: 'first',
    rationaleDe: 'Beide Reviews bestätigen die Radialgeschwindigkeitsbestimmung aus identifizierten Linien. Die erste Runde macht Näherung, Bezugssystem, Vorzeichen und instrumentell begründete Unsicherheit besonders vollständig prüfbar.',
    rationaleEn: 'Both reviews confirm radial-velocity inference from identified lines. The first round makes the approximation, reference frame, sign convention, and instrument-based uncertainty especially complete and assessable.',
  }],
  ['5c5d6698-c056-5850-8ecd-6dd87fb44549', {
    evidenceRound: 'first',
    rationaleDe: 'Beide Reviews bestätigen die Spektralklassifikation als zusammenhängende Kompetenz. Die erste Runde verbindet Linienmuster und relative Linienstärken präziser mit Anregung, Ionisation, Temperaturbereich und der begrenzten Aussage bei verrauschten Daten.',
    rationaleEn: 'Both reviews confirm spectral classification as one coherent competence. The first round more precisely connects line patterns and relative line strengths with excitation, ionization, temperature range, and bounded claims from noisy data.',
  }],
  ['f9c025ce-4327-5de7-8288-a3358e14a576', {
    evidenceRound: 'second',
    rationaleDe: 'Beide Reviews bestätigen die modellgestützte Deutung der Fraunhoferlinien. Die zweite Runde rekonstruiert den Strahlungsweg durch heiße und kühlere Sternschichten, trennt Linienlage von Linienstärke und fordert eine Vorhersage für ein anderes Atom oder Ion.',
    rationaleEn: 'Both reviews confirm the model-based interpretation of Fraunhofer lines. The second round reconstructs the radiation path through hot and cooler stellar layers, distinguishes line position from line strength, and requires a prediction for another atom or ion.',
  }],
  ['89124b92-5769-5e13-8a5d-78497936260f', {
    evidenceRound: 'second',
    rationaleDe: 'Beide Reviews bestätigen Wien- und Stefan-Boltzmann-Gesetz als alternative Wege zur selben Zielgröße. Die zweite Runde bindet Kugeloberfläche, Methodenvergleich und die Entscheidung bei unsicherem Radius oder nichtthermischem Spektrum am stärksten.',
    rationaleEn: 'Both reviews confirm Wien and Stefan-Boltzmann laws as alternative routes to the same target quantity. The second round most strongly binds spherical area, method comparison, and the decision under uncertain radius or a non-thermal spectrum.',
  }],
  ['4e823349-b60c-5d2a-b96f-d3f23ae50e3a', {
    evidenceRound: 'second',
    rationaleDe: 'Beide Reviews bestätigen die Evidenz-zu-Urteil-Kette. Die zweite Runde unterscheidet Sonnenflecken präzise als Indikatoren statt Ursachen, verbindet magnetische Ereignisse mit erdnahen Folgen und begrenzt Warnungen ausdrücklich gegenüber sicheren Vorhersagen.',
    rationaleEn: 'Both reviews confirm the evidence-to-judgment chain. The second round precisely distinguishes sunspots as indicators rather than causes, connects magnetic events to near-Earth effects, and explicitly limits warnings relative to certain predictions.',
  }],
  ['826af579-3e51-5ac9-bc2a-208d8a2fc99e', {
    evidenceRound: 'first',
    rationaleDe: 'Beide Reviews bestätigen die Mehrwellenlängenanalyse als eine gemeinsame Strukturinferenz. Die erste Runde trennt beobachtete und erschlossene Strukturen besonders klar und fordert ein nur datengetragen revidiertes Milchstraßenmodell.',
    rationaleEn: 'Both reviews confirm multiwavelength analysis as one joint structural inference. The first round particularly clearly distinguishes observed and inferred structures and requires a Milky Way model revised only as far as the data support it.',
  }],
  ['09995ab9-86aa-5b02-8a58-62b16a37831d', {
    evidenceRound: 'second',
    rationaleDe: 'Die Drittabwägung behält den aktuellen qualitativen Wortlaut bei, weil die zeitlich veränderliche nicht kugelsymmetrische Massenverteilung im Zielkontext eine fachlich tragfähige Symmetriebedingung bezeichnet. Zugleich wird die wissenschaftlich präzisere Quadrupol-Evidenz der zweiten Runde verbindlich ausgewählt und deren engerer Ersatztext ausdrücklich als nicht notwendige Textrevision verworfen.',
    rationaleEn: 'The third adjudication retains the current qualitative wording because a time-varying non-spherical mass distribution states a scientifically defensible symmetry condition in this goal context. At the same time, the scientifically more precise quadrupole evidence from the second round is selected as binding, while its narrower replacement wording is explicitly rejected as an unnecessary text revision.',
  }],
  ['e2014db8-c97f-5ce1-82c5-2a42741f4a61', {
    evidenceRound: 'first',
    rationaleDe: 'Beide Reviews bestätigen die kohärente quellenkritische Habitabilitätsbewertung. Die erste Runde trennt Messung, modellabhängige Inferenz und Spekulation explizit und begrenzt Habitabilitätskriterien klar gegenüber einem Lebensnachweis.',
    rationaleEn: 'Both reviews confirm the coherent source-critical assessment of habitability. The first round explicitly distinguishes measurement, model-dependent inference, and speculation and clearly limits habitability criteria relative to evidence of life.',
  }],
  ['6ae54ff9-dc3b-563b-b2ee-09a0f0d00162', {
    evidenceRound: 'first',
    rationaleDe: 'Beide Reviews bestätigen die allgemeine wissenschaftliche Einordnungskompetenz. Die erste Runde verbindet gesicherten Befund, Modell, offene Frage, unterscheidbare Vorhersage und die Prüfung populärwissenschaftlicher Sicherheit besonders vollständig.',
    rationaleEn: 'Both reviews confirm the general scientific-assessment competence. The first round most fully connects established findings, models, open questions, discriminating predictions, and scrutiny of confidence in popular-science accounts.',
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
      throw new Error(`Existing Physics B022 stable carryover artifact is stale: ${path}`)
    }
    if (!current[index] && !write) {
      throw new Error(`Missing Physics B022 stable carryover artifact: ${path}`)
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
    throw new Error('B022 completed review runs must provide valid completedAt timestamps')
  }
  return new Date(Math.max(...completed) + 1000).toISOString()
}

const main = async (): Promise<void> => {
  const unknownArgs = process.argv.slice(2).filter((arg) => arg !== '--write')
  if (unknownArgs.length > 0) throw new Error(`Unknown arguments: ${unknownArgs.join(', ')}`)

  const [
    dual,
    configBytes,
    landscapeBytes,
    adjudicationBytes,
    batchManifestBytes,
  ] = await Promise.all([
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
    throw new Error('Physics B022 config, batch manifest, dual summary, or adjudication digest changed')
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
    || adjudication.authority !== 'root_synthesis_after_two_independent_blind_rounds_and_source_atomicity_audit'
    || adjudication.mode !== 'append_only_fail_closed_repository_local_subject_adjudication'
    || adjudication.noProgressClaim !== true
    || adjudication.materialized !== false
    || adjudication.inputBinding.configDigest !== sha256(configBytes)
    || adjudication.inputBinding.batchManifestDigest !== sha256(batchManifestBytes)
    || adjudication.inputBinding.bundleFingerprint !== dual.prepared.manifest.artifacts.bundleFingerprint
    || adjudication.inputBinding.reviewInputFingerprint !== dual.prepared.manifest.artifacts.reviewInputFingerprint
    || adjudication.inputBinding.goalCount !== dual.summary.goalCount
    || adjudication.counts.total !== 20
    || adjudication.counts.keep_current !== 12
    || adjudication.counts.accepted_revision !== 3
    || adjudication.counts.structural_split !== 5
    || adjudication.counts.unresolved_block !== 0
    || adjudication.counts.requiresProductOwnerDecision !== 0
    || !sameOrderedValues(adjudicatedKeepIds, goalIds)
    || synthesisByGoalId.size !== goalIds.length
  ) {
    throw new Error('Physics B022 third-adjudication binding or exact stable12 scope is invalid')
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
    const decisions = [firstResult.source.decision, secondResult.source.decision]
    const exactMixedGoal = goalId === '09995ab9-86aa-5b02-8a58-62b16a37831d'
    if (
      (!exactMixedGoal && !sameOrderedValues(decisions, ['keep', 'keep']))
      || (exactMixedGoal && !sameOrderedValues(decisions, ['keep', 'revise']))
    ) {
      throw new Error(`${goalId}: unexpected B022 source decisions ${decisions.join('/')}`)
    }

    const inputGoal = dual.first.input.goals.find((goal) => goal.goalId === goalId)
    const secondInputGoal = dual.second.input.goals.find((goal) => goal.goalId === goalId)
    const canonicalGoal = landscape.goals.find((goal) => goal.id === goalId)
    if (!inputGoal || !secondInputGoal || !canonicalGoal) {
      throw new Error(`${goalId}: missing B022 input or current canonical goal`)
    }
    if (
      stableGoalBookJson(inputGoal) !== stableGoalBookJson(secondInputGoal)
      || stableGoalBookJson(inputGoal.canonicalContext)
        !== stableGoalBookJson(buildGoalDescriptionCanonicalContext(canonicalGoal))
    ) {
      throw new Error(`${goalId}: B022 blind rounds or current direct canonical context are no longer exact`)
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
    sourceByGoalId.set(goalId, {
      first: firstResult.source,
      second: secondResult.source,
    })
    currentCanonicalGoals.push(canonicalGoal)
  }

  const firstGoal = expectedGoals[0]
  if (!firstGoal) throw new Error('Physics B022 stable12 scope must not be empty')
  const sourceCanonicalDigest = adjudication.currentContextBindings.canonicalLandscape.sha256
  if (!/^[a-f0-9]{64}$/u.test(sourceCanonicalDigest)) {
    throw new Error('Physics B022 adjudication has an invalid source canonical digest')
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
  const manifestId = 'physik-b022-stable12-synthesis-openai-codex-20260828'
  const manifestPayload: Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'> = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
    schemaVersion: 1,
    synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
    manifestId,
    authority: 'ai_synthesis',
    synthesizedBy: 'OpenAI Codex B022 subject synthesis candidate',
    synthesizedAt: expectedBindings.synthesizedAt,
    batch: expectedBindings.batch,
    rounds: expectedBindings.rounds,
    decisions: expectedGoals.map((goal, index) => {
      const authored = synthesisByGoalId.get(goal.goalId)
      const sources = sourceByGoalId.get(goal.goalId)
      if (!authored || !sources?.first.record || !sources.second.record) {
        throw new Error(`${goal.goalId}: missing synthesis authoring or source records`)
      }
      const revisionDissent = goal.goalId === '09995ab9-86aa-5b02-8a58-62b16a37831d'
        ? {
            sourceRound: 'second' as const,
            disposition: 'rejected_keep_current' as const,
            proposedDescriptionDe: sources.second.record.proposedDescriptionDe ?? '',
            proposedDescriptionEn: sources.second.record.proposedDescriptionEn ?? '',
            rationaleDe: 'Der aktuelle qualitative Wortlaut benennt eine zeitlich veränderliche nicht kugelsymmetrische Massenverteilung und ist im Zielkontext fachlich tragfähig. Die präzisere Quadrupolbedingung wird vollständig in die ausgewählte Evidenz übernommen; eine kanonische Textrevision ist dafür nicht erforderlich.',
            rationaleEn: 'The current qualitative wording identifies a time-varying non-spherical mass distribution and is scientifically defensible in the goal context. The more precise quadrupole condition is carried fully into the selected evidence; a canonical text revision is not required for that purpose.',
          }
        : undefined
      if (revisionDissent && (!revisionDissent.proposedDescriptionDe || !revisionDissent.proposedDescriptionEn)) {
        throw new Error(`${goal.goalId}: missing exact proposed bilingual revision for dissent`)
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
        ...(revisionDissent ? { revisionDissent } : {}),
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
    throw new Error(`Physics B022 stable12 synthesis manifest: ${manifestValidation.errors.join(' | ')}`)
  }
  const synthesisManifestBytes = jsonBytes(synthesisManifest)
  const relativeSynthesisManifestPath = 'synthesis-decisions.stable-current-carryover-12-v1.json'

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
      resolutionId: `physics-b022-stable12-current-carryover-v1-resolution-${goal.goalId}`,
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
    resolutionArtifacts.push({
      path: join(sourceDirectory, relativeResolutionPath),
      bytes,
    })
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
    artifactSetId: `${dual.prepared.manifest.batchId}-stable-current-carryover-12`,
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
    receiptId: 'physik-rollout-v1-batch-022-stable-current-carryover-12-v1-20260828',
    purpose: 'Bounded compatibility materialization of the exact twelve B022 KEEP goals after the adjudicated B022 structural changes.',
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
    resolutionIndexPath: 'resolution-index.stable-current-carryover-12-v1.json',
    resolutionIndexFormat: 'legacy-schema-v1-partial-group',
    evidenceRoundByGoalId: Object.fromEntries(
      goalIds.map((goalId) => [goalId, synthesisByGoalId.get(goalId)?.evidenceRound]),
    ),
    rationale: [
      'All twelve current canonical bilingual texts and direct canonical contexts remain exact to both B022 blind-review inputs; every source record is byte-bound and freshly production-validated.',
      'Eleven goals have two keep records. Goal 09995ab9 has one keep and one revise record; the partial synthesis manifest explicitly rejects the replacement text while accepting the scientifically stronger quadrupole evidence and binds the complete bilingual dissent.',
      'The B022 materialization changed surrounding learner-facing placement, applicability, and reverse-relation presentation for parts of the campaign, but it did not alter these twelve goals\' bilingual text or their own direct requires, contains, semantic fields, or resource links.',
      'A new twelve-goal campaign would duplicate two valid independent reviews without adding evidence. The bounded schema-v1 compatibility path preserves fresh resolution validation and a selected-goal direct-context digest without coupling the receipt to unrelated future landscape changes.',
      'This receipt changes no canonical goal, graph, mapping, assessment, atomicity, memory, visualization, or Nano Banana asset bytes and grants no progress until the central five-gate rollout check passes.',
    ],
    safeguards: {
      individualResolutionsFreshlyValidated: true,
      exactCurrentBilingualTextsRequired: true,
      exactCurrentDirectCanonicalContextsRequired: true,
      bothBlindReviewRecordsByteBound: true,
      mixedKeepReviseRequiresExactManifestDissent: true,
      selectedEvidenceRoundExplicitPerGoal: true,
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
    `${write ? 'Materialized' : 'Verified'} Physics B022 stable12 carryover: strict=${indexEntries.length}/${goalIds.length}; index=${indexPath}`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
