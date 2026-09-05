import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoalDescriptionRolloutResolutionSynthesis } from './goalDescriptionRolloutResolutionSynthesis'
import { stableGoalBookJson } from './goalBookModel'
import { materializeGoalDescriptionRolloutBatchDualSummary } from './materializeGoalDescriptionRolloutBatch'
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

type JsonGoal = Record<string, unknown>
type Decision = 'keep' | 'revise'
type GoalPlan = {
  goalId: string
  expectedDecisions: readonly [Decision, Decision]
  evidenceRound: 'first' | 'second'
  rationaleDe: string
  rationaleEn: string
  revisionDissent?: {
    sourceRound: 'first' | 'second'
    rationaleDe: string
    rationaleEn: string
  }
}
type SemanticKindLedger = {
  documentType?: unknown
  sourceLandscapePath?: unknown
  counts?: { curricularAtomic?: unknown; total?: unknown }
  decisions?: Array<{ goalId?: unknown; semanticKind?: unknown; decisionStatus?: unknown }>
}

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const write = process.argv.includes('--write')
const unknownArguments = process.argv.slice(2).filter((argument) => argument !== '--write')
if (unknownArguments.length > 0) throw new Error(`Unknown arguments: ${unknownArguments.join(', ')}`)

const rolloutRoot = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-05'
const batchName = 'batch-033r-adjudicated-final-recheck-20-v1'
const batchDirectory = `${rolloutRoot}/${batchName}`
const configPath = `${rolloutRoot}/${batchName}.config.json`
const batchManifestPath = `${batchDirectory}/batch-manifest.json`
const dualSummaryPath = `${batchDirectory}/dual-summary.json`
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const semanticKindLedgerPath = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const resultStem = 'physik-rollout-v1-batch-033r-adjudicated-final-recheck-20-v1-20260905-first-pass'
const roundARecordsPath = `${batchDirectory}/round-a/results/${resultStem}-a.batch-001.records.jsonl`
const roundARunPath = `${batchDirectory}/round-a/results/${resultStem}-a.batch-001.run.json`
const roundBRecordsPath = `${batchDirectory}/round-b/results/${resultStem}-b.batch-001.records.jsonl`
const roundBRunPath = `${batchDirectory}/round-b/results/${resultStem}-b.batch-001.run.json`

const sourcePins = {
  config: 'f380ddb46f174cba57e47f89a43af27c73c5a07630c409d961c4c450cb1345ae',
  batchManifest: 'ed76219d9dda4584c482c2808b156df602849f5e82e8a985630ea12255a482f7',
  dualSummary: '58172f5e308ac549563d8d4b6c922e0eec2c696e8aba8e22524388e4614c0d0d',
  roundARecords: 'aaedbb7bf78fcc0578470884cc4432719f969de55f9682f78aca07a79eb92e70',
  roundARun: 'c21e1c16b02e19c28019ccb3cbb4b865c45051ba7db6645c26afd95c3c7edf87',
  roundBRecords: 'ca4a01267bf7b94fc45e24356236f1bb82c5f7344ae4f240d1c929c54917406c',
  roundBRun: '9be66ac6d5d0128f97c96495112fa4f7b506335187dfd2f8b315cc82564f17cb',
  canonical: 'ff32c4d3d8b5162bf150c652e0b1919d4ecd2485c5ddbf760da0b55ab3d234a4',
  semanticKinds: '9f970923b0764f932c081e282b2ecefad537aaa09a3a7c3cbe60f70f71d351ba',
} as const

const campaignGoalIds = [
  '3d3e5917-d367-535d-a6ad-b9d87259e6ce',
  '8c97c234-a932-5e84-aed5-237b4e2a8336',
  'e5c08365-a0d3-592c-ad8e-d2c2c6e2b717',
  'b1ad9493-acca-5366-9ecd-4b7bf7edaf4a',
  '7badac4d-2874-5b3a-87e8-bf8f4440b2a6',
  '2b700858-bc2e-5ddf-a791-b14d44160480',
  'da3169ae-c72a-5782-ad95-408167a5c6da',
  'f06c581a-7157-584e-a692-99bcd613cff9',
  '9678afc1-44ca-54fb-b280-29336d45a928',
  'c2e0fc31-27a2-5727-9025-a824db9150d2',
  '8cdef591-6ddb-5151-8c74-a80be0271079',
  '41872413-497e-5b88-ac65-365ed7d9851f',
  '6d882aac-9658-5f0d-bf3d-9338f0143bbc',
  'db47ac91-7bb0-5ba3-b39d-e2d6fc98396e',
  'd67502e3-5e0a-595b-a24b-65b1c40de36e',
  'bbee4c52-4e95-5529-990f-706aa99316a3',
  '8da5c981-8216-5fcd-a393-19f392ae2006',
  '98e42cda-9e5d-5910-b2c0-3e631fd20c78',
  '4ca83b3f-3605-5c0d-abc4-9f24b9e29bbe',
  'f3de5922-dd45-4fb6-87c1-525d1952dd89',
] as const

const commonKeepKeep = (goalId: string, rationaleDe: string, rationaleEn: string): GoalPlan => ({
  goalId,
  expectedDecisions: ['keep', 'keep'],
  evidenceRound: 'second',
  rationaleDe,
  rationaleEn,
})

const goalPlans: GoalPlan[] = [
  commonKeepKeep(
    '3d3e5917-d367-535d-a6ad-b9d87259e6ce',
    'Beide Blindprüfungen bestätigen den aktuellen Wortlaut. Runde B wird gewählt, weil sie die Feldamplitudenprojektion als Ursache des cos²-Verlaufs, eine kontrollierte Winkelmessreihe, Unsicherheiten und die getrennte Diagnose von Offset und Nichtidealität besonders klar beobachtbar macht.',
    'Both blind reviews confirm the current wording. Round B is selected because it makes the electric-field amplitude projection behind the cos² trend, a controlled angular measurement series, uncertainty, and the separate diagnosis of offset and non-ideality especially observable.',
  ),
  commonKeepKeep(
    '8c97c234-a932-5e84-aed5-237b4e2a8336',
    'Beide Blindprüfungen bestätigen den aktuellen Wortlaut. Runde B bindet Aufbau, zugängliche Information, Detektionsstatistik und die Zurückweisung retrokausaler sowie klassischer Bahnaussagen in der stärkeren experimentellen Argumentationskette.',
    'Both blind reviews confirm the current wording. Round B binds setup, accessible information, detection statistics, and rejection of retrocausal and classical-path claims in the stronger experimental chain of reasoning.',
  ),
  commonKeepKeep(
    'e5c08365-a0d3-592c-ad8e-d2c2c6e2b717',
    'Beide Blindprüfungen bestätigen die fallbezogene Beurteilung. Runde B trennt Funktionskette, empirische Wirkung, Nutzenurteil und Gefährdung am klarsten und verlangt den erneuten Kriteriengebrauch bei geändertem Expositionsweg oder anderer Abschirmung.',
    'Both blind reviews confirm the case-based assessment. Round B most clearly separates the functional chain, empirical effect, benefit judgment, and hazard and requires renewed use of the criteria under a changed exposure pathway or shielding.',
  ),
  commonKeepKeep(
    'b1ad9493-acca-5366-9ecd-4b7bf7edaf4a',
    'Beide Blindprüfungen bestätigen den aktuellen Wortlaut. Runde B erklärt die nicht energieproportionale Impulsbildung im Geiger-Bereich kausal und grenzt Zählfähigkeit und Energieauflösung anhand neuer Signale und eines energieauflösenden Detektors besonders präzise ab.',
    'Both blind reviews confirm the current wording. Round B causally explains non-energy-proportional pulse formation in the Geiger region and especially precisely distinguishes counting ability from energy resolution using fresh signals and an energy-resolving detector.',
  ),
  {
    goalId: '2b700858-bc2e-5ddf-a791-b14d44160480',
    expectedDecisions: ['keep', 'revise'],
    evidenceRound: 'first',
    rationaleDe: 'Runde A bestätigt den aktuellen Wortlaut und liefert eine vollständige beobachtbare Evidenzkette. Die von Runde B vorgeschlagene funktionale Ausführung ist fachlich hilfreich, aber nicht zwingender Bestandteil des kanonischen Zieltexts: „erläutern“ umfasst bereits Sammeln, räumliches Auflösen, spektrales Zerlegen und begrenztes Erschließen. Diese Details werden im eigenen Evidenzprofil verbindlich geprüft, ohne das breite Methodenwahlziel im Text unnötig einzuengen.',
    rationaleEn: 'Round A confirms the current wording and supplies a complete observable evidence chain. The functional expansion proposed by Round B is useful but need not be part of the canonical goal text: “explain” already encompasses collection, spatial resolution, spectral separation, and bounded inference. The separate evidence profile assesses those details explicitly without unnecessarily narrowing the broad method-selection goal in the text.',
    revisionDissent: {
      sourceRound: 'second',
      rationaleDe: 'Die Ergänzung benennt sinnvolle Prüfkriterien, behebt aber keinen fachlichen Fehler oder Assessment-Blocker des aktuellen Textes. Teleskopfunktion, Spektralzerlegung, Daten-zu-Eigenschaft-Inferenz und Informationsgrenzen werden stattdessen im positiven Evidenzprofil konkret und bilingual operationalisiert.',
      rationaleEn: 'The expansion states useful assessment criteria but remedies no scientific error or assessment blocker in the current text. Telescope function, spectral separation, data-to-property inference, and information limits are instead operationalized concretely and bilingually in the positive evidence profile.',
    },
  },
  commonKeepKeep(
    'da3169ae-c72a-5782-ad95-408167a5c6da',
    'Beide Blindprüfungen bestätigen die Stabilitätskompetenz. Runde B verbindet Kraftbilanz, konkrete Druckquelle und eine qualitative Vorhersage bei veränderter Masse, Temperatur oder Zusammensetzung besonders vollständig.',
    'Both blind reviews confirm the stability competence. Round B most fully connects force balance, the specific pressure source, and a qualitative prediction under changed mass, temperature, or composition.',
  ),
  commonKeepKeep(
    'f06c581a-7157-584e-a692-99bcd613cff9',
    'Beide Blindprüfungen bestätigen den aktuellen Wortlaut. Runde B übersetzt Zeit- und Frequenzdarstellung explizit ineinander und trennt Grundfrequenz, relative Spektralanteile, Tonhöhe und Klangfarbe in der stärkeren Transferaufgabe.',
    'Both blind reviews confirm the current wording. Round B explicitly translates between time and frequency representations and separates fundamental frequency, relative spectral components, pitch, and timbre in the stronger transfer task.',
  ),
  commonKeepKeep(
    '9678afc1-44ca-54fb-b280-29336d45a928',
    'Beide Blindprüfungen bestätigen den aktuellen Wortlaut. Runde B verknüpft Laufzeitabschätzung, Pegel- und Spektralhinweise mit Geometrie und Frequenz und prüft deren wechselnde Aussagekraft in einer neuen Lokalisationssituation.',
    'Both blind reviews confirm the current wording. Round B connects time-difference estimation, level and spectral cues with geometry and frequency and assesses their changing reliability in a fresh localization situation.',
  ),
  commonKeepKeep(
    'c2e0fc31-27a2-5727-9025-a824db9150d2',
    'Beide Blindprüfungen bestätigen den Modellierungsumfang. Runde B ordnet Kapazität, Membran- und Axialwiderstand physikalisch zu, verlangt ein gekoppeltes Segmentmodell und markiert die Grenze zur regenerativen aktiven Leitung besonders deutlich.',
    'Both blind reviews confirm the modeling scope. Round B physically assigns capacitance, membrane resistance, and axial resistance, requires a coupled-segment model, and especially clearly marks the boundary to regenerative active conduction.',
  ),
  commonKeepKeep(
    '41872413-497e-5b88-ac65-365ed7d9851f',
    'Beide Blindprüfungen bestätigen den aktuellen Wortlaut. Runde B bindet die Kreisblenden-Näherung, Einheiten, Skalierung und den begründeten Vergleich mit biologisch bestimmter realer Sehschärfe am vollständigsten.',
    'Both blind reviews confirm the current wording. Round B most fully binds the circular-aperture approximation, units, scaling, and justified comparison with biologically determined real visual acuity.',
  ),
  commonKeepKeep(
    '6d882aac-9658-5f0d-bf3d-9338f0143bbc',
    'Beide Blindprüfungen bestätigen die experimentelle Kompetenz. Runde B verlangt ein vorab festgelegtes Trennkriterium, sichere kontrollierte Geometrie, Winkelumrechnung, Unsicherheitsanalyse und die saubere Trennung von realer Sehschärfe und idealer Beugungsgrenze.',
    'Both blind reviews confirm the experimental competence. Round B requires a pre-defined resolution criterion, safe controlled geometry, angular conversion, uncertainty analysis, and a clean distinction between real visual acuity and the ideal diffraction limit.',
  ),
  commonKeepKeep(
    'd67502e3-5e0a-595b-a24b-65b1c40de36e',
    'Beide Blindprüfungen bestätigen den aktuellen Wortlaut. Runde B trennt Pixel- und Bildzeitdaten von kalibrierten physikalischen Größen, verlangt Einheiten und prüft Bewegungsmodelle samt physikalischer und messtechnischer Abweichungsursachen.',
    'Both blind reviews confirm the current wording. Round B separates pixel and frame-time data from calibrated physical quantities, requires units, and tests motion models together with physical and measurement-related causes of deviations.',
  ),
  commonKeepKeep(
    'bbee4c52-4e95-5529-990f-706aa99316a3',
    'Beide Blindprüfungen bestätigen den aktuellen Wortlaut. Runde B macht Querschnitt, Netto-Ladung, Zeitintervall, Umstellen der Beziehung und die Bedeutung unterschiedlicher Mittelwerte bei zeitlich verändertem Transport besonders klar prüfbar.',
    'Both blind reviews confirm the current wording. Round B makes the cross-section, net charge, time interval, rearrangement of the relation, and the meaning of different averages under time-varying transfer especially assessable.',
  ),
  {
    goalId: '8da5c981-8216-5fcd-a393-19f392ae2006',
    expectedDecisions: ['revise', 'keep'],
    evidenceRound: 'second',
    rationaleDe: 'Runde B bestätigt den aktuellen Wortlaut und liefert die stärkere Evidenzfassung. Die von Runde A vorgeschlagene Ergänzung von Betrag, Richtung, Vorzeichen, Abstand und E = F/q ist eine sinnvolle Assessment-Operationalisierung, aber kein zwingender Textzusatz: Die quantitative Kraftberechnung und das begründete Feldstärkeverhältnis schließen diese fachlichen Bestandteile bereits ein. Das eigene Evidenzprofil prüft sie ausdrücklich in zwei unabhängigen Fällen.',
    rationaleEn: 'Round B confirms the current wording and supplies the stronger evidence formulation. Round A’s proposed addition of magnitude, direction, signs, separation, and E = F/q is a useful assessment operationalization but not a required textual addition: quantitative force calculation and a justified relation to field strength already entail these scientific components. The separate evidence profile assesses them explicitly in two independent cases.',
    revisionDissent: {
      sourceRound: 'first',
      rationaleDe: 'Die vorgeschlagene Fassung präzisiert die erwartete Lösungsausführung, behebt aber weder einen fachlichen Fehler noch eine echte Mehrdeutigkeit des aktuellen Ziels. Vorzeichen, Vektorrichtung, 1/r²-Skalierung, E = F/q und Probeladungsunabhängigkeit werden im Evidenzprofil verbindlich operationalisiert.',
      rationaleEn: 'The proposal clarifies expected solution work but remedies neither a scientific error nor a genuine ambiguity in the current goal. Signs, vector direction, inverse-square scaling, E = F/q, and test-charge independence are explicitly operationalized in the evidence profile.',
    },
  },
  commonKeepKeep(
    '98e42cda-9e5d-5910-b2c0-3e631fd20c78',
    'Beide Blindprüfungen bestätigen den aktuellen Wortlaut. Runde B verbindet Symmetrie, radiale Richtung, qualitative Feldliniendichte und 1/r²-Geometrie und grenzt Aussagen über den Außenraum sauber von unbelegten Aussagen über das Innere ab.',
    'Both blind reviews confirm the current wording. Round B connects symmetry, radial direction, qualitative field-line density, and inverse-square geometry and cleanly distinguishes exterior claims from unsupported claims about the interior.',
  ),
  commonKeepKeep(
    '4ca83b3f-3605-5c0d-abc4-9f24b9e29bbe',
    'Beide Blindprüfungen bestätigen den aktuellen Wortlaut. Runde B verlangt einzelne Feldbeiträge im gemeinsamen Maßstab, echte Vektoraddition und eine neue Geometrie mit Verstärkung, Abschwächung oder Aufhebung.',
    'Both blind reviews confirm the current wording. Round B requires individual field contributions on a common scale, genuine vector addition, and a fresh geometry exhibiting reinforcement, reduction, or cancellation.',
  ),
  commonKeepKeep(
    'f3de5922-dd45-4fb6-87c1-525d1952dd89',
    'Beide Blindprüfungen bestätigen den aktuellen Wortlaut. Runde B behandelt Feldlinien ausdrücklich als Modellrepräsentation und verbindet Tangente, relative Dichte, Leitergleichgewicht, Abschirmung und Spitzenwirkung in einer neuen Konstruktion oder Korrektur.',
    'Both blind reviews confirm the current wording. Round B explicitly treats field lines as a model representation and connects tangent, relative density, conductor equilibrium, shielding, and field enhancement at sharp points in a fresh construction or correction.',
  ),
]

const excludedGoalDecisions = [
  { goalId: '7badac4d-2874-5b3a-87e8-bf8f4440b2a6', first: 'revise', second: 'revise' },
  { goalId: '8cdef591-6ddb-5151-8c74-a80be0271079', first: 'revise', second: 'revise' },
  { goalId: 'db47ac91-7bb0-5ba3-b39d-e2d6fc98396e', first: 'keep', second: 'revise' },
] as const

const outputStem = 'stable-current-carryover-17-v1'
const synthesisRelativePath = `synthesis-decisions.${outputStem}.json`
const synthesisPath = `${batchDirectory}/${synthesisRelativePath}`
const resolutionDirectoryName = `resolutions-${outputStem}`
const indexPath = `${batchDirectory}/resolution-index.${outputStem}.json`
const receiptPath = `${batchDirectory}/${outputStem}.compatibility-receipt.json`

const absolute = (path: string): string => resolve(repositoryRoot, path)
const sha256Hex = (value: Buffer | string): string => createHash('sha256').update(value).digest('hex')
const sha256 = (value: Buffer | string): GoalDescriptionSynthesisDigest => `sha256:${sha256Hex(value)}`
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const sameOrdered = (left: readonly string[], right: readonly string[]): boolean => (
  left.length === right.length && left.every((value, index) => value === right[index])
)

const readBound = async (path: string, expected: string): Promise<Buffer> => {
  const bytes = await readFile(absolute(path))
  const actual = sha256Hex(bytes)
  if (actual !== expected) throw new Error(`${path}: bound digest drift ${actual} != ${expected}`)
  return bytes
}

const readOptional = async (path: string): Promise<Buffer | null> => {
  try {
    return await readFile(absolute(path))
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}

const writeAllOrRequireExact = async (artifacts: Array<{ path: string; bytes: Buffer }>): Promise<void> => {
  const current = await Promise.all(artifacts.map(({ path }) => readOptional(path)))
  artifacts.forEach(({ path, bytes }, index) => {
    if (current[index] && !current[index]?.equals(bytes)) {
      throw new Error(`Existing B033r stable17 artifact is stale: ${path}`)
    }
    if (!current[index] && !write) throw new Error(`Missing B033r stable17 artifact: ${path}`)
  })
  if (!write) return
  await Promise.all(artifacts.flatMap(({ path, bytes }, index) => (
    current[index]
      ? []
      : [mkdir(dirname(absolute(path)), { recursive: true })
          .then(() => writeFile(absolute(path), bytes, { flag: 'wx' }))]
  )))
}

const completionTimestamp = (
  dual: Awaited<ReturnType<typeof materializeGoalDescriptionRolloutBatchDualSummary>>,
): string => {
  const values = [...dual.first.resultPairs, ...dual.second.resultPairs]
    .map(({ run }) => Date.parse(run.completedAt))
  if (values.length === 0 || values.some((value) => !Number.isFinite(value))) {
    throw new Error('B033r blind runs must have valid completion timestamps')
  }
  return new Date(Math.max(...values) + 1000).toISOString()
}

const main = async (): Promise<void> => {
  const [
    configBytes,
    batchManifestBytes,
    dualSummaryBytes,
    roundARecordsBytes,
    roundARunBytes,
    roundBRecordsBytes,
    roundBRunBytes,
    canonicalBytes,
    semanticKindBytes,
  ] = await Promise.all([
    readBound(configPath, sourcePins.config),
    readBound(batchManifestPath, sourcePins.batchManifest),
    readBound(dualSummaryPath, sourcePins.dualSummary),
    readBound(roundARecordsPath, sourcePins.roundARecords),
    readBound(roundARunPath, sourcePins.roundARun),
    readBound(roundBRecordsPath, sourcePins.roundBRecords),
    readBound(roundBRunPath, sourcePins.roundBRun),
    readBound(canonicalPath, sourcePins.canonical),
    readBound(semanticKindLedgerPath, sourcePins.semanticKinds),
  ])
  const dual = await materializeGoalDescriptionRolloutBatchDualSummary(absolute(configPath), false)
  if (!dual.bytes.equals(dualSummaryBytes)) throw new Error('B033r dual summary is not exact-current')
  if (
    dual.summary.goalCount !== 20
    || !sameOrdered(dual.prepared.manifest.goalIds, campaignGoalIds)
    || !sameOrdered(dual.summary.goals.map(({ goalId }) => goalId), campaignGoalIds)
    || goalPlans.length !== 17
    || new Set(goalPlans.map(({ goalId }) => goalId)).size !== 17
  ) throw new Error('B033r campaign or stable17 scope changed')

  const selectedIds = goalPlans.map(({ goalId }) => goalId)
  const excludedIds = excludedGoalDecisions.map(({ goalId }) => goalId)
  if (
    selectedIds.some((goalId) => excludedIds.includes(goalId as typeof excludedIds[number]))
    || !sameOrdered(campaignGoalIds.filter((goalId) => selectedIds.includes(goalId)), selectedIds)
    || !sameOrdered(campaignGoalIds.filter((goalId) => excludedIds.includes(goalId as typeof excludedIds[number])), excludedIds)
    || new Set([...selectedIds, ...excludedIds]).size !== campaignGoalIds.length
  ) throw new Error('B033r selected and excluded goals do not form the exact ordered campaign partition')

  for (const excluded of excludedGoalDecisions) {
    const summary = dual.summary.goals.find(({ goalId }) => goalId === excluded.goalId)
    if (!summary || summary.firstDecision !== excluded.first || summary.secondDecision !== excluded.second) {
      throw new Error(`${excluded.goalId}: excluded B033r decision pair drifted`)
    }
  }

  const parsedLandscape = JSON.parse(canonicalBytes.toString('utf8')) as { subject?: string; goals?: JsonGoal[] }
  if (parsedLandscape.subject !== 'Physik' || !Array.isArray(parsedLandscape.goals)) {
    throw new Error('Current canonical Physics landscape is invalid')
  }
  const landscape = parsedLandscape as { subject: string; goals: JsonGoal[] }
  const semanticLedger = JSON.parse(semanticKindBytes.toString('utf8')) as SemanticKindLedger
  const curricularAtomicIds = new Set((semanticLedger.decisions ?? []).flatMap((decision) => (
    decision.semanticKind === 'curricularAtomic'
      && decision.decisionStatus === 'authoritative'
      && typeof decision.goalId === 'string'
      ? [decision.goalId]
      : []
  )))
  const curriculumAtomicDenominator = 461
  if (
    semanticLedger.documentType !== 'semantic-kind-ledger'
    || semanticLedger.sourceLandscapePath !== canonicalPath
    || semanticLedger.counts?.curricularAtomic !== curriculumAtomicDenominator
    || semanticLedger.counts?.total !== landscape.goals.length
    || curricularAtomicIds.size !== curriculumAtomicDenominator
    || selectedIds.some((goalId) => !curricularAtomicIds.has(goalId))
  ) throw new Error('B033r semantic-kind binding or curricularAtomic denominator changed')

  const expectedGoals: GoalDescriptionRolloutSynthesisExpectedGoal[] = []
  const sourceByGoalId = new Map<string, {
    first: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
    second: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
  }>()
  const currentCanonicalContexts: Array<Record<string, unknown>> = []

  for (const plan of goalPlans) {
    const firstResult = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.first, goalId: plan.goalId, label: 'First' })
    const secondResult = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.second, goalId: plan.goalId, label: 'Second' })
    const errors = [...firstResult.errors, ...secondResult.errors]
    if (errors.length > 0 || !firstResult.source?.record || !secondResult.source?.record) {
      throw new Error(`${plan.goalId}: ${errors.join(' | ') || 'missing exact source records'}`)
    }
    if (!sameOrdered(
      [firstResult.source.decision, secondResult.source.decision],
      plan.expectedDecisions,
    )) throw new Error(`${plan.goalId}: B033r review decisions changed`)

    const firstInput = dual.first.input.goals.find(({ goalId }) => goalId === plan.goalId)
    const secondInput = dual.second.input.goals.find(({ goalId }) => goalId === plan.goalId)
    const canonicalGoal = landscape.goals.find(({ id }) => id === plan.goalId)
    if (!firstInput || !secondInput || !canonicalGoal) throw new Error(`${plan.goalId}: missing input or canonical goal`)
    const canonicalContext = buildGoalDescriptionCanonicalContext(canonicalGoal)
    const reviewContextFingerprint = fingerprintGoalDescriptionReviewContext(firstInput)
    if (
      stableGoalBookJson(firstInput) !== stableGoalBookJson(secondInput)
      || stableGoalBookJson(firstInput.canonicalContext) !== stableGoalBookJson(canonicalContext)
      || firstResult.source.binding.goalReviewContextFingerprint !== reviewContextFingerprint
      || secondResult.source.binding.goalReviewContextFingerprint !== reviewContextFingerprint
    ) throw new Error(`${plan.goalId}: blind inputs or direct canonical context drifted`)
    const finalText = {
      titleDe: firstInput.currentTitleDe,
      titleEn: firstInput.currentTitleEn,
      descriptionDe: firstInput.currentDescriptionDe,
      descriptionEn: firstInput.currentDescriptionEn,
    }
    const currentText = {
      titleDe: String(canonicalGoal.title ?? ''),
      titleEn: String(canonicalGoal.titleEn ?? ''),
      descriptionDe: String(canonicalGoal.description ?? ''),
      descriptionEn: String(canonicalGoal.descriptionEn ?? ''),
    }
    if (stableGoalBookJson(finalText) !== stableGoalBookJson(currentText)) {
      throw new Error(`${plan.goalId}: reviewed bilingual text is not exact-current`)
    }
    expectedGoals.push({
      goalId: plan.goalId,
      effectiveSemanticKind: 'curricularAtomic',
      goalFingerprint: firstInput.goalFingerprint as GoalDescriptionSynthesisDigest,
      pageFingerprint: firstInput.pageFingerprint as GoalDescriptionSynthesisDigest,
      goalReviewContextFingerprint: reviewContextFingerprint,
      finalText,
      firstSource: firstResult.source,
      secondSource: secondResult.source,
    })
    sourceByGoalId.set(plan.goalId, { first: firstResult.source, second: secondResult.source })
    currentCanonicalContexts.push({
      goalId: plan.goalId,
      canonicalContext,
      canonicalContextFingerprint: sha256(stableGoalBookJson(canonicalContext)),
    })
  }

  const firstGoal = expectedGoals[0]
  if (!firstGoal) throw new Error('B033r stable17 scope is empty')
  const synthesizedAt = completionTimestamp(dual)
  const expectedBindings = {
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
    synthesizedAt,
    goals: expectedGoals,
  }
  const manifestId = 'physik-b033r-stable17-synthesis-openai-codex-20260905'
  const manifestPayload: Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'> = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
    schemaVersion: 1,
    synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
    manifestId,
    authority: 'ai_synthesis',
    synthesizedBy: 'OpenAI Codex Physics B033r bounded stable-seventeen synthesis candidate',
    synthesizedAt,
    batch: expectedBindings.batch,
    rounds: expectedBindings.rounds,
    decisions: expectedGoals.map((goal, index) => {
      const plan = goalPlans[index]
      const sources = sourceByGoalId.get(goal.goalId)
      if (!plan || plan.goalId !== goal.goalId || !sources?.first.record || !sources.second.record) {
        throw new Error(`${goal.goalId}: missing aligned synthesis plan or source records`)
      }
      const dissentSource = plan.revisionDissent?.sourceRound === 'first' ? sources.first : sources.second
      const revisionDissent = plan.revisionDissent && dissentSource.record
        ? {
            sourceRound: plan.revisionDissent.sourceRound,
            disposition: 'rejected_keep_current' as const,
            proposedDescriptionDe: dissentSource.record.proposedDescriptionDe ?? '',
            proposedDescriptionEn: dissentSource.record.proposedDescriptionEn ?? '',
            rationaleDe: plan.revisionDissent.rationaleDe,
            rationaleEn: plan.revisionDissent.rationaleEn,
          }
        : undefined
      if (revisionDissent && (!revisionDissent.proposedDescriptionDe || !revisionDissent.proposedDescriptionEn)) {
        throw new Error(`${goal.goalId}: exact bilingual revision dissent is missing`)
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
        evidenceRound: plan.evidenceRound,
        records: {
          first: { recordId: sources.first.binding.recordId, recordDigest: sources.first.binding.recordDigest },
          second: { recordId: sources.second.binding.recordId, recordDigest: sources.second.binding.recordDigest },
        },
        ...(revisionDissent ? { revisionDissent } : {}),
        rationaleDe: plan.rationaleDe,
        rationaleEn: plan.rationaleEn,
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
    throw new Error(`B033r stable17 synthesis manifest: ${manifestValidation.errors.join(' | ')}`)
  }
  const synthesisBytes = jsonBytes(synthesisManifest)

  const resolutionArtifacts: Array<{ path: string; bytes: Buffer }> = []
  const indexEntries: Array<Record<string, unknown>> = []
  for (const goal of expectedGoals) {
    const sources = sourceByGoalId.get(goal.goalId)
    const summaryGoal = dual.summary.goals.find(({ goalId }) => goalId === goal.goalId)
    const decision = synthesisManifest.decisions.find(({ goalId }) => goalId === goal.goalId)
    if (!sources || !summaryGoal || !decision) throw new Error(`${goal.goalId}: incomplete synthesis alignment`)
    const synthesis = buildGoalDescriptionRolloutResolutionSynthesis({
      batchId: synthesisManifest.batch.batchId,
      manifest: synthesisManifest,
      decision,
      summaryGoal,
      firstSource: sources.first,
      secondSource: sources.second,
    })
    const resolution = buildGoalDescriptionDualRoundResolution({
      resolutionId: `physics-b033r-${outputStem}-resolution-${goal.goalId}`,
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
        manifestPath: synthesisRelativePath,
        manifestId: synthesisManifest.manifestId,
        manifestDigest: sha256(synthesisBytes),
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
        manifestBytes: synthesisBytes,
        manifestPath: synthesisRelativePath,
      },
    })
    if (validation.errors.length > 0 || !validation.strictDescriptionComplete) {
      throw new Error(`${goal.goalId}: invalid resolution: ${validation.errors.join(' | ')}`)
    }
    const bytes = jsonBytes(resolution)
    const relativePath = `${resolutionDirectoryName}/${goal.goalId}.resolution.json`
    resolutionArtifacts.push({ path: `${batchDirectory}/${relativePath}`, bytes })
    indexEntries.push({
      goalId: goal.goalId,
      titleDe: resolution.goal.finalText.titleDe,
      groupId: dual.prepared.manifest.batchId,
      decision: resolution.decision,
      resolutionPath: relativePath,
      resolutionDigest: sha256(bytes),
      resolutionFingerprint: resolution.resolutionFingerprint,
      strictDescriptionComplete: true,
    })
  }

  const index = {
    schemaVersion: 1,
    artifactSetId: `${dual.prepared.manifest.batchId}-${outputStem}`,
    subject: dual.prepared.manifest.subjectLabel,
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: indexEntries.length,
    curriculumAtomicDenominator,
    descriptionReviewPercentage: Number(((indexEntries.length / curriculumAtomicDenominator) * 100).toFixed(1)),
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
  const indexBytes = jsonBytes(index)
  const receipt = {
    schemaVersion: 1,
    receiptId: 'physik-b033r-stable-current-carryover-17-v1-20260905',
    purpose: 'Fail-closed bounded materialization of fifteen exact KEEP/KEEP goals and two explicitly adjudicated KEEP-current dissent goals from Physics B033r.',
    source: {
      configPath,
      configDigest: sha256(configBytes),
      batchManifestPath,
      batchManifestDigest: sha256(batchManifestBytes),
      dualSummaryPath,
      dualSummaryDigest: sha256(dualSummaryBytes),
      roundA: { recordsPath: roundARecordsPath, recordsDigest: sha256(roundARecordsBytes), runPath: roundARunPath, runDigest: sha256(roundARunBytes) },
      roundB: { recordsPath: roundBRecordsPath, recordsDigest: sha256(roundBRecordsBytes), runPath: roundBRunPath, runDigest: sha256(roundBRunBytes) },
      canonicalPath,
      canonicalDigest: sha256(canonicalBytes),
      semanticKindLedgerPath,
      semanticKindLedgerDigest: sha256(semanticKindBytes),
    },
    sourceCampaignGoalCount: campaignGoalIds.length,
    claimedGoalIds: selectedIds,
    claimedGoalCount: selectedIds.length,
    exactKeepKeepGoalCount: goalPlans.filter(({ expectedDecisions }) => sameOrdered(expectedDecisions, ['keep', 'keep'])).length,
    adjudicatedKeepCurrentDissentGoalIds: goalPlans.filter(({ revisionDissent }) => revisionDissent).map(({ goalId }) => goalId),
    explicitlyExcludedGoals: excludedGoalDecisions,
    currentCanonicalContexts,
    evidenceRoundByGoalId: Object.fromEntries(goalPlans.map(({ goalId, evidenceRound }) => [goalId, evidenceRound])),
    synthesisManifestPath: synthesisRelativePath,
    synthesisManifestDigest: sha256(synthesisBytes),
    synthesisManifestFingerprint: synthesisManifest.manifestFingerprint,
    resolutionIndexPath: indexPath.replace(`${batchDirectory}/`, ''),
    resolutionIndexDigest: sha256(indexBytes),
    noCentralRolloutRegistration: true,
    safeguards: {
      allSourceArtifactsByteBound: true,
      exactCurrentBilingualTextAndDirectContextRequired: true,
      exactReviewDecisionPairsRequired: true,
      eachMixedDecisionRequiresExactBilingualRevisionDissent: true,
      individualResolutionsFreshlyValidated: true,
      evidenceProfilesRemainNeedsHumanReviewAiCandidates: true,
    },
  }

  await writeAllOrRequireExact([
    { path: synthesisPath, bytes: synthesisBytes },
    ...resolutionArtifacts,
    { path: indexPath, bytes: indexBytes },
    { path: receiptPath, bytes: jsonBytes(receipt) },
  ])
  console.log(`${write ? 'Materialized' : 'Verified'} Physics B033r stable17 resolutions: strict=${indexEntries.length}/17; index=${indexPath}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
