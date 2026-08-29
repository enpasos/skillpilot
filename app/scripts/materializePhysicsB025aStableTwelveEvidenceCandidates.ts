import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildPositiveGoalEvidenceCandidateRecords } from './materializePositiveGoalEvidenceCandidates'
import type { PositiveGoalEvidenceProfile } from './positiveGoalEvidenceProfileModel'
import type { PositiveGoalEvidenceReviewConfig } from './positiveGoalEvidenceReview'

type ReviewRound = 'first' | 'second'
type ReviewRecord = {
  recordId: string
  goalId: string
  decision: 'keep' | 'revise' | 'split_review' | 'block'
  understandingEvidence: {
    essentialUnderstandingDe: string
    essentialUnderstandingEn: string
    observablePerformanceDe: string
    observablePerformanceEn: string
    transferExpectationDe: string
    transferExpectationEn: string
  }
  evidenceProfileContract: string
  evidenceProfileRecommendation: string
  recordStatus: string
  reviewAuthority: string
}
type BoundRecord = { record: ReviewRecord; digest: `sha256:${string}` }
type ProfileDefinition = {
  archetype: PositiveGoalEvidenceProfile['archetype']
  selectionReasonDe: string
  selectionReasonEn: string
  additionalExpectation: PositiveGoalEvidenceProfile['expectations'][number]
  variationAxes: PositiveGoalEvidenceProfile['variationAxes']
  applicationCaseBriefs: PositiveGoalEvidenceProfile['applicationCaseBriefs']
}
type CandidateSet = {
  schemaVersion: 1
  authoringContract: 'positive-understanding-evidence-candidates-v1'
  reviewId: string
  reviewedAt: string
  reviewer: string
  sourceBindings: {
    bindingContract: 'b025a-stable-twelve-positive-evidence-sources-v1'
    batchId: string
    campaignGoalIds: readonly string[]
    stableGoalIds: readonly string[]
    excludedRevisionGoalIds: readonly string[]
    sources: Array<{ role: string; path: string; sha256: `sha256:${string}` }>
    resolutionFiles: Array<{ goalId: string; path: string; sha256: string }>
  }
  goals: Array<{
    goalId: string
    reason: string
    evidenceLevel: 'E1'
    maximumClaimScope: 'G1'
    dissent: string[]
    profile: PositiveGoalEvidenceProfile
  }>
}
type SynthesisManifest = {
  batch?: {
    batchId?: string
    batchManifestDigest?: string
    configDigest?: string
    dualSummaryDigest?: string
    canonicalLandscapeDigest?: string
  }
  decisions?: Array<{
    goalId?: string
    effectiveSemanticKind?: string
    resolutionDecision?: string
    evidenceRound?: string
    records?: Record<ReviewRound, { recordId?: string; recordDigest?: string }>
  }>
}
type ResolutionIndex = {
  schemaVersion?: number
  subject?: string
  semanticKind?: string
  strictDescriptionReviewCompleteCount?: number
  curriculumAtomicDenominator?: number
  groups?: Array<{
    groupId?: string
    dualSummaryDigest?: string
    campaignGoalCount?: number
    resolvedGoalCount?: number
  }>
  resolutions?: Array<{
    goalId?: string
    decision?: string
    resolutionPath?: string
    resolutionDigest?: string
    strictDescriptionComplete?: boolean
  }>
}
type DualSummary = {
  goalCount?: number
  goals?: Array<{
    goalId?: string
    agreement?: string
    firstRecordId?: string
    secondRecordId?: string
    firstRunId?: string
    secondRunId?: string
    firstDecision?: string
    secondDecision?: string
    requiresSynthesis?: boolean
    automaticAcceptance?: boolean
  }>
}
type PlannedOutput = { path: string; bytes: Buffer }
type OutputState = 'absent' | 'expected-before' | 'exact-after'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const writeMode = process.argv.includes('--write')
const unexpectedArguments = process.argv.slice(2).filter((argument) => argument !== '--write')
if (unexpectedArguments.length > 0) throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)
if (process.argv.slice(2).filter((argument) => argument === '--write').length > 1) {
  throw new Error('Duplicate --write')
}

const rolloutRoot = (
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-29'
)
const batchName = 'batch-025a-e-mechanics-energy-structural-follow-up-17-v1'
const batchDirectory = `${rolloutRoot}/${batchName}`
const sourceConfigPath = `${rolloutRoot}/${batchName}.config.json`
const batchManifestPath = `${batchDirectory}/batch-manifest.json`
const dualSummaryPath = `${batchDirectory}/dual-summary.json`
const synthesisPath = `${batchDirectory}/synthesis-decisions.stable-current-carryover-12-v1.json`
const resolutionIndexPath = `${batchDirectory}/resolution-index.stable-current-carryover-12-v1.json`
const resultStem = (
  'physik-rollout-v1-batch-025a-e-mechanics-energy-structural-follow-up-17-v1-20260829-'
  + 'first-pass'
)
const roundARecordsPath = `${batchDirectory}/round-a/results/${resultStem}-a.batch-001.records.jsonl`
const roundARunPath = roundARecordsPath.replace('.records.jsonl', '.run.json')
const roundBRecordsPath = `${batchDirectory}/round-b/results/${resultStem}-b.batch-001.records.jsonl`
const roundBRunPath = roundBRecordsPath.replace('.records.jsonl', '.run.json')
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const semanticKindLedgerPath = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const criteriaPath = (
  'curricula/DE/Gymnasium/quality/goal-evidence/prompts/'
  + 'physics-positive-understanding-evidence-profile-criteria-v1.md'
)

const artifactStem = (
  'canonical-physics-positive-understanding-evidence-rollout-v1-'
  + 'batch-025a-e-mechanics-energy-stable12-current-v1'
)
const artifactRoot = 'curricula/DE/Gymnasium/quality/goal-evidence'
const configPath = `${artifactRoot}/${artifactStem}.config.json`
const candidatesPath = `${artifactRoot}/${artifactStem}.candidates.json`
const reviewPath = `${artifactRoot}/${artifactStem}.review.jsonl`
const targetReviewId = 'canonical-physics-positive-evidence-v1-b025a-e-mechanics-energy-stable12-v1'
const reviewedAt = '2026-08-29T00:55:00.000Z'
const reviewer = 'codex-physics-b025a-stable12-positive-evidence-candidate-2026-08-29'
const expectedBatchId = (
  'physik-rollout-v1-batch-025a-e-mechanics-energy-structural-follow-up-17-v1-20260829'
)

const sourceHashes = {
  config: '7c3f610555750be16dea5f242b001c6b4bdc2f71a0dea16ccb249401f6a522e1',
  batchManifest: '739e068a7ac33103e4b0d09fc5d1b6765e166e816286c529f7d2addd424d0bb6',
  dualSummary: '7c47d894654f9f24dd67212af5361ab59080f351b0978ebf173c480d417dd51c',
  roundARecords: 'f4050489d29702d3e9b80a28ae3d9079da91e80efcadbada709745961af5689e',
  roundARun: 'dbf7bda526505ac444726c10c89a8b7741d7574de078a1382780883ae53bc1b2',
  roundBRecords: '3b19b758f08f95a81c1e7f3ed9120a2999fc009f49073159a3f148086b0ebcfe',
  roundBRun: 'bef87e512ce01e302d9e7d1255e9fa63a99611f085adf8f9bbe43d1fc3e715f5',
  synthesis: '0e294dc70f8a311deb7ff57ca4d9c5673aab8ad6748d4ae27f34d9d1ee0a60ab',
  resolutionIndex: '84bfff8f6e923fc49ba930d5c654cdcf172a665f00f89fcdac0bf94f2fbfe310',
  canonical: 'a8eb1398a6d11dcdbdb02ccb4bd3526a512ecac8743630d24ae2381b8041a64c',
  semanticKindLedger: 'f880e255246c41aabc0ab346d43a074551cbd197b001905bfb46607d6639780f',
  criteria: '8d64a50ede312df08795f6fddec82c1c3bcc8b77e50dad62220c201c819fd460',
} as const

const campaignGoalIds = [
  'ce431132-dfc4-42c2-aff6-bd72035190f8',
  '971beafa-6ba5-4c82-ac8b-7ebf66eec3dd',
  'bf8517a9-142b-5789-826a-767f3b277998',
  'e4b38061-1f28-43ad-8371-a3e7c0e81856',
  '09029573-864f-40ca-bf8a-cee7bf6dcb73',
  '31a2ef52-114b-4d2c-a720-6ef5a390b6dc',
  '32b896b9-f2f1-4d4e-96ad-e869ac3d3759',
  'a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20',
  '5f289cdc-fda1-4058-b44f-041ba1398e79',
  'ad984bb6-e225-432a-952d-d83cda40b7f8',
  'c1c71daa-042b-4f4c-8c31-0ac366f5149e',
  '6affc2ea-ecd2-4fcd-8877-3ffa15b0425b',
  '91c49019-ea51-4ce5-a919-c91c45b25e83',
  '253a71d2-e751-4c63-acbe-238b71463cd8',
  '839ecc8f-3a60-418b-bc92-64bfeef33824',
  'f524f05c-4456-4fc3-a1f7-f40741fc1f16',
  'e790de73-f8e5-4027-bc05-9f12a0e8c9cb',
] as const
const goalIds = [
  'ce431132-dfc4-42c2-aff6-bd72035190f8',
  '971beafa-6ba5-4c82-ac8b-7ebf66eec3dd',
  'bf8517a9-142b-5789-826a-767f3b277998',
  'e4b38061-1f28-43ad-8371-a3e7c0e81856',
  '09029573-864f-40ca-bf8a-cee7bf6dcb73',
  '31a2ef52-114b-4d2c-a720-6ef5a390b6dc',
  '5f289cdc-fda1-4058-b44f-041ba1398e79',
  'ad984bb6-e225-432a-952d-d83cda40b7f8',
  'c1c71daa-042b-4f4c-8c31-0ac366f5149e',
  '6affc2ea-ecd2-4fcd-8877-3ffa15b0425b',
  '91c49019-ea51-4ce5-a919-c91c45b25e83',
  '839ecc8f-3a60-418b-bc92-64bfeef33824',
] as const
const excludedGoalIds = [
  '32b896b9-f2f1-4d4e-96ad-e869ac3d3759',
  'a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20',
  '253a71d2-e751-4c63-acbe-238b71463cd8',
  'f524f05c-4456-4fc3-a1f7-f40741fc1f16',
  'e790de73-f8e5-4027-bc05-9f12a0e8c9cb',
] as const
const selectedRoundByGoalId = new Map<string, ReviewRound>([
  ['ce431132-dfc4-42c2-aff6-bd72035190f8', 'second'],
  ['971beafa-6ba5-4c82-ac8b-7ebf66eec3dd', 'second'],
  ['bf8517a9-142b-5789-826a-767f3b277998', 'first'],
  ['e4b38061-1f28-43ad-8371-a3e7c0e81856', 'first'],
  ['09029573-864f-40ca-bf8a-cee7bf6dcb73', 'second'],
  ['31a2ef52-114b-4d2c-a720-6ef5a390b6dc', 'first'],
  ['5f289cdc-fda1-4058-b44f-041ba1398e79', 'second'],
  ['ad984bb6-e225-432a-952d-d83cda40b7f8', 'second'],
  ['c1c71daa-042b-4f4c-8c31-0ac366f5149e', 'second'],
  ['6affc2ea-ecd2-4fcd-8877-3ffa15b0425b', 'second'],
  ['91c49019-ea51-4ce5-a919-c91c45b25e83', 'second'],
  ['839ecc8f-3a60-418b-bc92-64bfeef33824', 'first'],
])

const profileDefinitions = new Map<string, ProfileDefinition>([
  ['ce431132-dfc4-42c2-aff6-bd72035190f8', {
    archetype: 'representation',
    selectionReasonDe: 'Runde B ist für den Repräsentationsarchetyp am stärksten, weil sie gemessene und abgeleitete Größen, Achsen und Einheiten, konsistente Übergänge zwischen drei Diagrammen sowie einen Mehrphasen-Transfer ausdrücklich verbindet.',
    selectionReasonEn: 'Round B is strongest for the representation archetype because it explicitly connects measured and derived quantities, axes and units, consistency among three graphs, and transfer to multi-phase motion.',
    additionalExpectation: {
      id: 'measurement-resolution-bounds-graph-consistency',
      essentialUnderstandingDe: 'Aus diskreten Messpunkten abgeleitete Geschwindigkeits- und Beschleunigungsverläufe hängen von Abtastintervall und Messauflösung ab; Differenzbildung kann Rauschen verstärken. Konsistenz bedeutet daher Übereinstimmung innerhalb der Auflösung, nicht künstlich glatte Kurven.',
      essentialUnderstandingEn: 'Velocity and acceleration inferred from discrete measurements depend on sampling interval and resolution; differencing can amplify noise. Consistency therefore means agreement within resolution, not artificially smooth curves.',
      observablePerformanceDe: 'Die lernende Person wählt begründete Auswerteintervalle, kennzeichnet Unsicherheit und unterscheidet einen physikalischen Phasenwechsel von bloßen Schwankungen abgeleiteter Werte.',
      observablePerformanceEn: 'The learner justifies analysis intervals, marks uncertainty, and distinguishes a physical phase change from fluctuations caused by deriving quantities.',
    },
    variationAxes: [
      { id: 'motion-sequence', textDe: 'Ruhe, gleichförmige und beschleunigte Abschnitte sowie Richtungswechsel', textEn: 'Rest, uniform and accelerated intervals, and reversals' },
      { id: 'acquisition-quality', textDe: 'Abtastintervall, Ortsauflösung und Messrauschen', textEn: 'Sampling interval, position resolution, and measurement noise' },
      { id: 'given-representation-and-axis', textDe: 'Ausgangspunkt in t-s, t-v oder t-a sowie veränderte Achsenrichtung', textEn: 'Starting from a time-position, time-velocity, or time-acceleration graph with a changed axis direction' },
    ],
    applicationCaseBriefs: [
      {
        id: 'warehouse-cart-stop-and-reverse',
        taskDemandDe: 'Werte eine verrauschte Zeit-Ort-Messreihe eines Wagens aus, der anfährt, gleichförmig fährt, bremst und zurückrollt. Prognostiziere vor der Ableitung t-v und t-a, erstelle beide mit Einheiten und begründe echte Phasenübergänge.',
        taskDemandEn: 'Analyze noisy time-position data for a cart that starts, travels uniformly, brakes, and rolls back. Predict the time-velocity and time-acceleration graphs before deriving them, construct both with units, and justify genuine phase transitions.',
        expectedPerformanceDe: 'Mess- und Ableitungsgrößen werden getrennt, Richtungswechsel und Ruhepunkt vorzeichenrichtig erkannt und kleine Beschleunigungsschwankungen anhand der Auflösung begrenzt.',
        expectedPerformanceEn: 'Measured and derived quantities are separated, reversal and rest are identified with correct signs, and small acceleration fluctuations are bounded using measurement resolution.',
        understandingFocusDe: 'Konsistente Mehrfachdarstellung trotz Messrauschen.',
        understandingFocusEn: 'Consistent multiple representation despite measurement noise.',
      },
      {
        id: 'elevator-acceleration-log',
        taskDemandDe: 'Aus einem t-a-Protokoll eines Aufzugs sowie gegebenen Anfangswerten sollen qualitative t-v- und t-s-Verläufe vorhergesagt und mit Wegmarken verglichen werden.',
        taskDemandEn: 'Given a lift time-acceleration log and initial values, predict qualitative time-velocity and time-position graphs and compare them with position markers.',
        expectedPerformanceDe: 'Die lernende Person nutzt Vorzeichen und Flächen konsistent, unterscheidet Beschleunigung von Bewegungsrichtung und erklärt begrenzte Datenabweichungen.',
        expectedPerformanceEn: 'The learner uses signs and areas consistently, distinguishes acceleration from direction of motion, and explains bounded discrepancies in the data.',
        understandingFocusDe: 'Transfer von einer abgeleiteten Ausgangsdarstellung.',
        understandingFocusEn: 'Transfer from a derived starting representation.',
      },
    ],
  }],
  ['971beafa-6ba5-4c82-ac8b-7ebf66eec3dd', {
    archetype: 'experiment',
    selectionReasonDe: 'Runde B verbindet die experimentelle Entscheidung über Gleichförmigkeit mit Streuung, Diagrammform, Einheit, positiver Richtung und invariantem Geschwindigkeitsbetrag.',
    selectionReasonEn: 'Round B connects the experimental judgment of uniformity with scatter, graph shape, units, positive direction, and invariant speed magnitude.',
    additionalExpectation: {
      id: 'position-intercept-does-not-set-velocity',
      essentialUnderstandingDe: 'Für gleichförmige Bewegung gilt s(t) = s0 + v t; der Anfangsort verschiebt das t-s-Diagramm vertikal, während die Steigung die Geschwindigkeit bestimmt. Eine gleichförmige Bewegung muss daher nicht durch den Ursprung verlaufen.',
      essentialUnderstandingEn: 'Uniform motion follows s(t) = s0 + v t; initial position shifts the time-position graph vertically, whereas slope determines velocity. A uniform-motion graph therefore need not pass through the origin.',
      observablePerformanceDe: 'Die lernende Person vergleicht zwei lineare Messreihen, trennt Achsenabschnitt und Steigung und erkennt gleiche Geschwindigkeiten trotz verschiedener Anfangsorte.',
      observablePerformanceEn: 'The learner compares two linear data sets, distinguishes intercept from slope, and recognizes equal velocities despite different initial positions.',
    },
    variationAxes: [
      { id: 'moving-object', textDe: 'Wagen, Förderbandobjekt oder gehende Person', textEn: 'Cart, conveyor object, or walking person' },
      { id: 'sampling-and-scatter', textDe: 'Messintervall, Anzahl der Punkte und zufällige Streuung', textEn: 'Measurement interval, number of points, and random scatter' },
      { id: 'coordinate-choice', textDe: 'Unterschiedlicher Ursprung oder umgekehrte positive Richtung', textEn: 'Different origin or reversed positive direction' },
    ],
    applicationCaseBriefs: [
      {
        id: 'two-carts-offset-starts',
        taskDemandDe: 'Zwei Wagen liefern parallele t-s-Messreihen mit verschiedenen Anfangsorten. Entscheide mit Einheiten und Streuung, ob beide gleichförmig fahren und wie sich ihre Geschwindigkeiten unterscheiden.',
        taskDemandEn: 'Two carts produce parallel time-position data sets with different initial positions. Using units and scatter, decide whether both move uniformly and how their velocities differ.',
        expectedPerformanceDe: 'Beide Steigungen werden korrekt bestimmt; der unterschiedliche Achsenabschnitt wird nicht als Geschwindigkeitsunterschied gedeutet.',
        expectedPerformanceEn: 'Both slopes are determined correctly; the different intercept is not treated as a velocity difference.',
        understandingFocusDe: 'Anfangsort und Geschwindigkeit werden getrennt.',
        understandingFocusEn: 'Initial position and velocity are separated.',
      },
      {
        id: 'self-planned-cart-reversed-axis',
        taskDemandDe: 'Plane und führe auf einer gesicherten geraden Bahn mit einem langsam fahrenden Wagen einen Versuch zu der Frage durch, ob seine Bewegung gleichförmig ist. Lege Messstrecke und positive Richtung fest, erfasse Position und Zeit mit Video oder Zeitmarken, halte Bahnneigung und Antrieb kontrolliert, wiederhole die Messung und werte die Messreihe samt Streuung aus. Stelle dieselben Daten anschließend für eine umgekehrte Koordinatenachse dar.',
        taskDemandEn: 'Plan and carry out an experiment on a secured straight track with a slow-moving cart to test whether its motion is uniform. Define the measurement distance and positive direction, record position and time using video or time markers, control track inclination and propulsion, repeat the measurement, and analyze the data including scatter. Then represent the same data with the coordinate axis reversed.',
        expectedPerformanceDe: 'Versuchsfrage, sicherer Aufbau, Messprinzip und kontrollierte Größen sind nachvollziehbar; Position und Zeit werden als Messgrößen von der erschlossenen Geschwindigkeit getrennt, Wiederholungen begrenzen die Unsicherheit und die Gleichförmigkeit wird datenbasiert beurteilt. Bei Achsenumkehr bleiben Gleichförmigkeit und Geschwindigkeitsbetrag erhalten, während Steigung und vorzeichenbehaftete Geschwindigkeit konsistent das Vorzeichen wechseln.',
        expectedPerformanceEn: 'The testable question, safe setup, measurement principle, and controlled quantities are explicit; measured position and time are distinguished from inferred velocity, repetitions bound uncertainty, and uniformity is judged from the data. Reversing the axis preserves uniformity and speed magnitude while slope and signed velocity consistently change sign.',
        understandingFocusDe: 'Experimentelle Geschwindigkeitsbestimmung und Koordinateninvarianz werden gemeinsam nachgewiesen.',
        understandingFocusEn: 'Experimental determination of velocity and coordinate invariance are demonstrated together.',
      },
    ],
  }],
  ['bf8517a9-142b-5789-826a-767f3b277998', {
    archetype: 'representation',
    selectionReasonDe: 'Runde A trennt endliches Intervall und lokalen Zeitpunkt über Sekante und Tangente besonders klar und bindet Vorzeichen, Einheiten und einen nichttrivialen Rückkehrfall.',
    selectionReasonEn: 'Round A most clearly separates a finite interval from a local instant through secant and tangent slopes and binds signs, units, and a nontrivial return case.',
    additionalExpectation: {
      id: 'average-is-not-endpoint-speed-mean',
      essentialUnderstandingDe: 'Durchschnittsgeschwindigkeit ist Ortsänderung durch Zeitintervall und im Allgemeinen nicht das arithmetische Mittel zweier Momentangeschwindigkeiten; eine solche Gleichheit gilt nur unter zusätzlichen Bedingungen.',
      essentialUnderstandingEn: 'Average velocity is displacement divided by the time interval and is generally not the arithmetic mean of two instantaneous velocities; equality requires additional conditions.',
      observablePerformanceDe: 'Die lernende Person vergleicht an einem nichtlinearen Verlauf beide Berechnungen, verwirft eine unbegründete Mittelwertbildung und erklärt den Unterschied geometrisch.',
      observablePerformanceEn: 'On a nonlinear graph, the learner compares both calculations, rejects an unjustified endpoint average, and explains the difference geometrically.',
    },
    variationAxes: [
      { id: 'trajectory-shape', textDe: 'Monotone Beschleunigung, Verzögerung oder Richtungswechsel', textEn: 'Monotonic acceleration, deceleration, or reversal' },
      { id: 'interval-and-instant', textDe: 'Lage und Länge des Intervalls sowie gewählter Zeitpunkt', textEn: 'Location and length of the interval and selected instant' },
      { id: 'graph-resolution', textDe: 'Maßstab, Punktdichte, Einheit und Tangentenschätzung', textEn: 'Scale, point density, unit, and tangent estimation' },
    ],
    applicationCaseBriefs: [
      {
        id: 'train-shrinking-secants',
        taskDemandDe: 'Bestimme an einem gekrümmten t-s-Diagramm eines anfahrenden Zuges die Durchschnittsgeschwindigkeit über 20 s und schätze die Momentangeschwindigkeit bei 8 s durch zunehmend kleinere Sekantenintervalle.',
        taskDemandEn: 'From a curved time-position graph of a departing train, determine average velocity over 20 s and estimate instantaneous velocity at 8 s using progressively smaller secant intervals.',
        expectedPerformanceDe: 'Steigungen und Einheiten werden korrekt verwendet; die lokale Schätzung wird als auflösungsabhängig begrenzt.',
        expectedPerformanceEn: 'Slopes and units are used correctly; the local estimate is bounded by graph resolution.',
        understandingFocusDe: 'Übergang von endlichem zu lokalem Änderungsmaß.',
        understandingFocusEn: 'Transition from a finite to a local rate of change.',
      },
      {
        id: 'same-average-different-local-motion',
        taskDemandDe: 'Zwei Bewegungen haben gleiche Anfangs- und Endorte sowie dieselbe Dauer; eine ist gleichförmig, die andere enthält Pause und Beschleunigungsphase. Vergleiche Durchschnitts- und Momentangeschwindigkeiten.',
        taskDemandEn: 'Two motions have the same initial and final positions and duration; one is uniform, while the other includes a pause and an acceleration phase. Compare average and instantaneous velocities.',
        expectedPerformanceDe: 'Gleiche Durchschnittsgeschwindigkeit wird erkannt, ohne daraus gleiche Momentangeschwindigkeiten oder gleiche Bewegungsverläufe abzuleiten.',
        expectedPerformanceEn: 'Equal average velocity is recognized without inferring equal instantaneous velocities or identical motion histories.',
        understandingFocusDe: 'Ein Durchschnittswert bestimmt den lokalen Verlauf nicht.',
        understandingFocusEn: 'An average does not determine local behavior.',
      },
    ],
  }],
  ['e4b38061-1f28-43ad-8371-a3e7c0e81856', {
    archetype: 'representation',
    selectionReasonDe: 'Runde A fordert die selbstständige Konstruktion aller drei Darstellungen und verbindet Anfangswerte, Vorzeichen, Steigungen, Flächen, Einheiten und Umkehrzeitpunkt am vollständigsten.',
    selectionReasonEn: 'Round A requires independent construction of all three representations and most fully connects initial values, signs, slopes, areas, units, and reversal time.',
    additionalExpectation: {
      id: 'signed-displacement-differs-from-distance',
      essentialUnderstandingDe: 'Die vorzeichenbehaftete Fläche unter einem t-v-Diagramm ist die Ortsänderung. Nach einem Richtungswechsel ist die zurückgelegte Strecke die Summe der Beträge der Teilflächen und kann größer als der Betrag der Ortsänderung sein.',
      essentialUnderstandingEn: 'The signed area under a time-velocity graph is displacement. After a reversal, distance traveled is the sum of the magnitudes of the partial areas and may exceed the magnitude of displacement.',
      observablePerformanceDe: 'Die lernende Person zerlegt einen Verlauf am Nulldurchgang von v, bestimmt Ortsänderung und Strecke mit Einheiten und verbindet beide mit dem t-s-Verlauf.',
      observablePerformanceEn: 'The learner splits a graph at the zero crossing of v, determines displacement and distance with units, and relates both to the time-position graph.',
    },
    variationAxes: [
      { id: 'signed-initial-conditions', textDe: 'Verschiedene Anfangsorte, Anfangsgeschwindigkeiten und Vorzeichen der Beschleunigung', textEn: 'Different initial positions, initial velocities, and signs of acceleration' },
      { id: 'starting-representation', textDe: 'Gegebenes t-a-, t-v-, t-s-Diagramm oder Wertetabelle', textEn: 'Given time-acceleration, time-velocity, time-position graph, or table' },
      { id: 'model-interval', textDe: 'Vollständig konstante Beschleunigung oder begrenztes Gültigkeitsintervall', textEn: 'Fully constant acceleration or a bounded validity interval' },
    ],
    applicationCaseBriefs: [
      {
        id: 'ramp-cart-turnaround',
        taskDemandDe: 'Ein Wagen fährt mit positiver Anfangsgeschwindigkeit eine Rampe hinauf und erfährt konstante negative Beschleunigung. Konstruiere alle Diagramme, bestimme den Umkehrzeitpunkt sowie Ortsänderung und Strecke.',
        taskDemandEn: 'A cart travels up a ramp with positive initial velocity and constant negative acceleration. Construct all graphs and determine reversal time, displacement, and distance.',
        expectedPerformanceDe: 'Am Umkehrpunkt ist v = 0, aber a ist ungleich null; Vorzeichen, Flächen und Einheiten bleiben in allen Darstellungen konsistent.',
        expectedPerformanceEn: 'At the turning point v = 0 but a is nonzero; signs, areas, and units remain consistent across all representations.',
        understandingFocusDe: 'Geschwindigkeit null ist nicht Beschleunigung null.',
        understandingFocusEn: 'Zero velocity is not zero acceleration.',
      },
      {
        id: 'braking-model-beyond-stop',
        taskDemandDe: 'Bremsdaten eines Fahrzeugs passen bis zum Stillstand zu konstanter negativer Beschleunigung. Setze das mathematische Modell zunächst fort und entscheide dann, ab wann es den realen Vorgang nicht mehr beschreibt.',
        taskDemandEn: 'Vehicle braking data fit constant negative acceleration up to rest. First extend the mathematical model and then decide when it ceases to describe the real process.',
        expectedPerformanceDe: 'Die rechnerische Rückwärtsbewegung nach dem Nulldurchgang wird als Folge einer unzulässigen Modellfortsetzung erkannt und das Gültigkeitsintervall datenbezogen begrenzt.',
        expectedPerformanceEn: 'The calculated backward motion after the zero crossing is recognized as a consequence of invalid model extension, and the validity interval is bounded using the data.',
        understandingFocusDe: 'Modellgleichung und reale Gültigkeit werden getrennt.',
        understandingFocusEn: 'Model equation and physical validity are separated.',
      },
    ],
  }],
  ['09029573-864f-40ca-bf8a-cee7bf6dcb73', {
    archetype: 'experiment',
    selectionReasonDe: 'Runde B bindet sichere Messung, geeignete grafische Auswertung, Einheit und Unsicherheit von g, Anfangsbedingungen, Achsenwahl und Prüfung der Luftwiderstandsgrenze.',
    selectionReasonEn: 'Round B binds safe measurement, suitable graphical analysis, the unit and uncertainty of g, initial conditions, axis choice, and testing the no-drag limit.',
    additionalExpectation: {
      id: 'g-is-acceleration-not-weight-or-speed',
      essentialUnderstandingDe: 'g ist im luftwiderstandsfreien Modell die lokale Beschleunigung und weder eine Geschwindigkeit noch eine Kraft. Verschiedene Massen haben dieselbe Fallbeschleunigung, obwohl ihre Gewichtskräfte m g verschieden sind.',
      essentialUnderstandingEn: 'In the no-drag model, g is local acceleration, not a velocity or force. Different masses have the same falling acceleration even though their weights m g differ.',
      observablePerformanceDe: 'Die lernende Person vergleicht Daten zweier Körper, trennt Beschleunigung, Geschwindigkeit und Gewichtskraft mit Einheiten und entscheidet, ob Abweichungen auf Messunsicherheit oder Luftwiderstand hinweisen.',
      observablePerformanceEn: 'The learner compares data for two objects, distinguishes acceleration, velocity, and weight with units, and decides whether differences indicate uncertainty or drag.',
    },
    variationAxes: [
      { id: 'object-and-drag', textDe: 'Kompakter Körper, flächiger Körper oder unterschiedliche Massen', textEn: 'Compact object, broad object, or different masses' },
      { id: 'coordinate-and-initial-state', textDe: 'Fall aus Ruhe, Anfangsgeschwindigkeit, Bezugshöhe und Achsenrichtung', textEn: 'Drop from rest, initial velocity, reference height, and axis direction' },
      { id: 'measurement-method', textDe: 'Video, Lichtschranke, Sensor oder bereitgestellter Datensatz', textEn: 'Video, light gate, sensor, or supplied data' },
    ],
    applicationCaseBriefs: [
      {
        id: 'steel-ball-video-fit',
        taskDemandDe: 'Werte eine beaufsichtigt aufgezeichnete Fallbewegung einer Stahlkugel bei nach oben positiver Achse aus. Bestimme g grafisch, gib Unsicherheit und Einheit an und formuliere das Zeit-Ort-Gesetz.',
        taskDemandEn: 'Analyze a supervised video recording of a falling steel ball with upward chosen as positive. Determine g graphically, state uncertainty and unit, and formulate the time-position law.',
        expectedPerformanceDe: 'Gemessene Orte und Zeiten werden von g als erschlossener Größe getrennt; a = -g, Anfangshöhe und Anfangsgeschwindigkeit werden konsistent eingesetzt.',
        expectedPerformanceEn: 'Measured positions and times are distinguished from inferred g; a = -g, initial height, and initial velocity are used consistently.',
        understandingFocusDe: 'Vorzeichen und Anfangsbedingungen sind Teil des Modells.',
        understandingFocusEn: 'Signs and initial conditions are part of the model.',
      },
      {
        id: 'ball-and-filter-model-comparison',
        taskDemandDe: 'Vergleiche bereitgestellte Fallmessungen einer kompakten Kugel und eines Papierfilters aus gleicher Höhe. Prüfe für beide das Modell ohne Luftwiderstand.',
        taskDemandEn: 'Compare supplied falling-motion data for a compact ball and a paper filter released from the same height. Test the no-drag model for each.',
        expectedPerformanceDe: 'Die Kugeldaten liefern innerhalb der Unsicherheit konstantes g; die Filterabweichung wird nicht als anderes Gravitationsfeld oder bloßer Masseneffekt, sondern als Modellgrenze eingeordnet.',
        expectedPerformanceEn: 'The ball data yield constant g within uncertainty; the filter discrepancy is treated as a model limitation rather than a different gravitational field or merely a mass effect.',
        understandingFocusDe: 'Abweichung vom Modell verändert nicht die Bedeutung von g.',
        understandingFocusEn: 'Deviation from the model does not change the meaning of g.',
      },
    ],
  }],
  ['31a2ef52-114b-4d2c-a720-6ef5a390b6dc', {
    archetype: 'concept',
    selectionReasonDe: 'Runde A grenzt den Trägheitsbegriff durch gerichtete äußere Kräfte, vektorielle Resultierende und einen bereits bewegten Körper mit Kräftegleichgewicht besonders scharf ab.',
    selectionReasonEn: 'Round A most sharply delimits inertia through directed external forces, their vector resultant, and an already moving body under force equilibrium.',
    additionalExpectation: {
      id: 'inertial-frame-condition-is-essential',
      essentialUnderstandingDe: 'Die Aussage keine Resultierende, keine Geschwindigkeitsänderung gilt unmittelbar in Inertialsystemen. Eine scheinbare Beschleunigung in einem beschleunigten Bezugssystem widerlegt das Axiom nicht.',
      essentialUnderstandingEn: 'The statement no resultant, no change in velocity applies directly in inertial frames. Apparent acceleration in an accelerating reference frame does not contradict the law.',
      observablePerformanceDe: 'Die lernende Person vergleicht dieselbe Bewegung im Boden- und in einem beschleunigten Fahrzeugsystem, benennt das Inertialsystem und erklärt den Unterschied ohne eine unbelegte reale Kraft zu erfinden.',
      observablePerformanceEn: 'The learner compares the same motion in the ground frame and an accelerating vehicle frame, identifies the inertial frame, and explains the difference without inventing an unsupported real force.',
    },
    variationAxes: [
      { id: 'reference-frame', textDe: 'Boden-, gleichförmig bewegtes oder beschleunigtes System', textEn: 'Ground, uniformly moving, or accelerating frame' },
      { id: 'force-configuration', textDe: 'Keine äußere Kraft, mehrere ausgeglichene Kräfte oder kleine Resultierende', textEn: 'No external force, several balanced forces, or a small resultant' },
      { id: 'initial-motion', textDe: 'Ruhe, bereits gleichförmige Bewegung oder veränderte Bewegungsrichtung', textEn: 'Rest, existing uniform motion, or changed direction of motion' },
    ],
    applicationCaseBriefs: [
      {
        id: 'spacecraft-coast',
        taskDemandDe: 'Telemetriedaten zeigen ein Raumfahrzeug nach Abschalten der Triebwerke mit nahezu konstanter Geschwindigkeit. Erstelle eine Kräfte- und Bewegungsdeutung einschließlich Einheiten und Messgrenzen.',
        taskDemandEn: 'Telemetry shows a spacecraft moving at nearly constant velocity after its engines shut down. Construct a force and motion interpretation including units and measurement limits.',
        expectedPerformanceDe: 'Es wird keine fortdauernde Vortriebskraft erfunden; kleine reale Störungen werden von der Grundvorhersage bei verschwindender Resultierender getrennt.',
        expectedPerformanceEn: 'No continuing thrust is invented; small real disturbances are distinguished from the basic prediction under zero net force.',
        understandingFocusDe: 'Bewegung benötigt keine Kraft in Bewegungsrichtung.',
        understandingFocusEn: 'Motion does not require a force in its direction.',
      },
      {
        id: 'accelerating-train-loose-ball',
        taskDemandDe: 'Eine lose Kugel scheint in einem anfahrenden Zug nach hinten zu rollen. Deute den Vorgang im Zug- und im Bodensystem.',
        taskDemandEn: 'A loose ball appears to roll backward in a train that starts accelerating. Interpret the event in the train and ground frames.',
        expectedPerformanceDe: 'Im Boden-Inertialsystem behält die Kugel zunächst ihre Geschwindigkeit; die relative Rückwärtsbewegung wird dem beschleunigten Zugrahmen zugeordnet.',
        expectedPerformanceEn: 'In the ground inertial frame, the ball initially retains its velocity; the relative backward motion is attributed to the accelerating train frame.',
        understandingFocusDe: 'Bezugssystembedingung des Trägheitsprinzips.',
        understandingFocusEn: 'Frame condition of inertia.',
      },
    ],
  }],
  ['5f289cdc-fda1-4058-b44f-041ba1398e79', {
    archetype: 'modeling',
    selectionReasonDe: 'Runde B bildet die vollständige Modellkette aus Körperabgrenzung, gerichteten äußeren Kräften, Vorzeichenachse, Resultierender, Einheit und Richtungsplausibilität ab.',
    selectionReasonEn: 'Round B provides the complete modeling chain from body definition through directed external forces, sign convention, resultant, unit, and directional plausibility.',
    additionalExpectation: {
      id: 'same-net-force-mass-controls-acceleration',
      essentialUnderstandingDe: 'Bei gleicher resultierender Kraft ist der Betrag der Beschleunigung umgekehrt proportional zur Masse. Die Masse beschreibt dabei Trägheit; eine vorhandene Anfangsgeschwindigkeit ändert die momentane Beziehung zwischen Resultierender und Beschleunigung nicht.',
      essentialUnderstandingEn: 'For the same net force, acceleration magnitude is inversely proportional to mass. Mass represents inertia; an existing initial velocity does not change the instantaneous relation between net force and acceleration.',
      observablePerformanceDe: 'Die lernende Person prognostiziert für zwei Massen unter derselben Resultierenden das Beschleunigungsverhältnis, prüft es mit N = kg m/s² und trennt es von ihren möglichen Anfangsgeschwindigkeiten.',
      observablePerformanceEn: 'The learner predicts the acceleration ratio for two masses under the same resultant, checks it using N = kg m/s², and distinguishes it from their possible initial velocities.',
    },
    variationAxes: [
      { id: 'force-configuration', textDe: 'Zugkraft, Gewicht, Reibung oder mehrere entgegenwirkende Kräfte', textEn: 'Tension, weight, friction, or multiple opposing forces' },
      { id: 'mass-and-initial-motion', textDe: 'Verschiedene Massen sowie Ruhe, Beschleunigen oder Abbremsen', textEn: 'Different masses and states of rest, speeding up, or slowing down' },
      { id: 'axis-and-data', textDe: 'Umgekehrte Achse, Kraftwerte, Beschleunigungsdaten oder unbekannte Teilgröße', textEn: 'Reversed axis, force values, acceleration data, or an unknown quantity' },
    ],
    applicationCaseBriefs: [
      {
        id: 'elevator-moving-up-slowing',
        taskDemandDe: 'Ein Aufzug bewegt sich aufwärts, wird aber langsamer. Wähle die positive Richtung, bilanziere Gewicht und Seilkraft und bestimme Richtung sowie Betrag der Beschleunigung.',
        taskDemandEn: 'A lift moves upward but slows down. Choose a positive direction, balance weight and cable force, and determine acceleration direction and magnitude.',
        expectedPerformanceDe: 'Die abwärts gerichtete Resultierende und Beschleunigung werden trotz aufwärts gerichteter Geschwindigkeit korrekt erkannt; Kräfte und Einheiten sind konsistent.',
        expectedPerformanceEn: 'The downward net force and acceleration are identified despite upward velocity; forces and units are consistent.',
        understandingFocusDe: 'Beschleunigungsrichtung ist nicht notwendig Bewegungsrichtung.',
        understandingFocusEn: 'Acceleration direction need not equal motion direction.',
      },
      {
        id: 'two-carts-same-net-pull',
        taskDemandDe: 'Zwei Wagen verschiedener Masse erfahren nach Abzug gemessener Reibung dieselbe resultierende Zugkraft. Prognostiziere und prüfe ihre Beschleunigungen; werte einen Datensatz zusätzlich mit umgekehrter Achse aus.',
        taskDemandEn: 'Two carts of different masses experience the same net pulling force after measured friction is accounted for. Predict and test their accelerations, then evaluate one data set with the axis reversed.',
        expectedPerformanceDe: 'Das inverse Massenverhältnis wird erkannt; eine Achsenumkehr ändert Vorzeichen, aber weder Betrag noch physikalische Aussage.',
        expectedPerformanceEn: 'The inverse mass relation is recognized; reversing the axis changes signs but not magnitudes or physical conclusions.',
        understandingFocusDe: 'Masse, Resultierende und Koordinatenkonvention.',
        understandingFocusEn: 'Mass, net force, and coordinate convention.',
      },
    ],
  }],
  ['ad984bb6-e225-432a-952d-d83cda40b7f8', {
    archetype: 'concept',
    selectionReasonDe: 'Runde B bindet getrennte Kraftdarstellungen, Gleichzeitigkeit und verschiedene Angriffskörper und widerlegt sowohl das Wegkürzen in einer Bilanz als auch eine zeitlich versetzte Ursache-Wirkungs-Deutung.',
    selectionReasonEn: 'Round B binds separate force diagrams, simultaneity, and different receiving bodies and rejects both cancellation in one balance and a time-delayed cause-effect account.',
    additionalExpectation: {
      id: 'interaction-pair-is-not-equilibrium-pair',
      essentialUnderstandingDe: 'Ein Wechselwirkungspaar gehört zur selben Wechselwirkung und vertauscht Kraftausübenden und Kraftempfänger. Gleich große entgegengesetzte Kräfte auf demselben Körper können Kräftegleichgewicht bilden, sind aber kein Paar des dritten Axioms.',
      essentialUnderstandingEn: 'A third-law pair belongs to the same interaction and swaps force agent and receiver. Equal and opposite forces on one body may form equilibrium but are not a third-law pair.',
      observablePerformanceDe: 'Die lernende Person klassifiziert vorgeschlagene Kraftpaare, verwirft insbesondere Gewichtskraft und Normalkraft auf demselben Körper als Wechselwirkungspaar und benennt jeweils den wirklichen Partner.',
      observablePerformanceEn: "The learner classifies proposed force pairs, rejects weight and normal force on the same body as a third-law pair, and identifies each force's actual partner.",
    },
    variationAxes: [
      { id: 'interaction-type', textDe: 'Kontakt-, Gravitations- oder magnetische Wechselwirkung', textEn: 'Contact, gravitational, or magnetic interaction' },
      { id: 'mass-and-constraint', textDe: 'Gleiche oder stark verschiedene Massen sowie frei bewegte oder gehaltene Körper', textEn: 'Equal or very different masses and free or constrained bodies' },
      { id: 'diagram-view', textDe: 'Einzelnes Freikörperbild, zwei getrennte Bilder oder erweitertes Gesamtsystem', textEn: 'One free-body diagram, two separate diagrams, or an expanded total system' },
    ],
    applicationCaseBriefs: [
      {
        id: 'car-truck-collision',
        taskDemandDe: 'Kraftsensoren eines kurzen Pkw-Lkw-Stoßes zeigen zeitabhängige Kräfte. Ordne beide Kräfte den Körpern zu und erkläre gleiche Beträge, entgegengesetzte Richtungen und unterschiedliche Beschleunigungen.',
        taskDemandEn: 'Force sensors from a brief car-truck collision show time-dependent forces. Assign both forces to the bodies and explain equal magnitudes, opposite directions, and different accelerations.',
        expectedPerformanceDe: 'Die Kraftwerte werden in Newton korrekt gepaart; die größere Beschleunigung des Pkw wird seiner kleineren Masse und nicht einer größeren Stoßkraft zugeschrieben.',
        expectedPerformanceEn: "Force values in newtons are paired correctly; the car's greater acceleration is attributed to its smaller mass, not a larger collision force.",
        understandingFocusDe: 'Gleiche Kräfte bedeuten nicht gleiche Bewegungsänderungen.',
        understandingFocusEn: 'Equal forces do not imply equal motion changes.',
      },
      {
        id: 'magnet-cart-and-clamp',
        taskDemandDe: 'Zwei Magnetwagen wechselwirken berührungslos; anschließend wird einer festgeklemmt. Zeichne für beide Situationen die Kräfte und erkläre, wohin die zusätzliche Stützkraft gehört.',
        taskDemandEn: 'Two magnetic carts interact without contact; one is then clamped. Draw the forces in both situations and explain where the additional support force belongs.',
        expectedPerformanceDe: 'Das magnetische Paar bleibt gleichzeitig und betragsgleich; die Klemmkraft ist eine weitere Wechselwirkung und kein Partner nur einer Magnetkraft.',
        expectedPerformanceEn: 'The magnetic pair remains simultaneous and equal in magnitude; the clamp force is an additional interaction, not the partner of just one magnetic force.',
        understandingFocusDe: 'Wechselwirkungspaar und Kräftegleichgewicht werden getrennt.',
        understandingFocusEn: 'Interaction pair and force equilibrium are separated.',
      },
    ],
  }],
  ['c1c71daa-042b-4f4c-8c31-0ac366f5149e', {
    archetype: 'modeling',
    selectionReasonDe: 'Runde B ist für den Modellierungsarchetyp am stärksten, weil sie Systemgrenze, gerichtete Kraftkomponente, Vorzeichen, Einheit und weitere Energieübertragungen in einer vollständigen Bilanz verbindet.',
    selectionReasonEn: 'Round B is strongest for the modeling archetype because it connects system boundary, directed force component, sign, unit, and further energy transfers in a complete balance.',
    additionalExpectation: {
      id: 'variable-force-work-is-signed-area',
      essentialUnderstandingDe: 'Bei veränderlicher Kraft ist die mechanische Arbeit die vorzeichenbehaftete Fläche unter der Kraft-Weg-Kurve der Komponente in Wegrichtung. Ein einzelner Kraftwert mal Gesamtweg ist nur für eine konstante Kraft oder einen begründeten Mittelwert zulässig.',
      essentialUnderstandingEn: 'For a variable force, mechanical work is the signed area under the force-displacement graph of the component along the displacement. Multiplying one force value by the total displacement is valid only for constant force or a justified mean value.',
      observablePerformanceDe: 'Die lernende Person wertet eine stückweise oder grafisch gegebene Kraft aus, summiert positive und negative Flächen mit Einheit Joule und verbindet das Ergebnis mit der Energieänderung des festgelegten Systems.',
      observablePerformanceEn: 'The learner evaluates a piecewise or graphically supplied force, sums positive and negative areas in joules, and relates the result to the energy change of the defined system.',
    },
    variationAxes: [
      { id: 'force-displacement-geometry', textDe: 'Parallele, schräge oder entgegengesetzte Kraft sowie Richtungswechsel des Weges', textEn: 'Parallel, oblique, or opposing force and reversal of displacement' },
      { id: 'system-boundary', textDe: 'Körper allein, Körper plus Feder oder Körper plus Unterlage', textEn: 'Object alone, object plus spring, or object plus surface' },
      { id: 'force-profile', textDe: 'Konstante, stückweise konstante oder kontinuierlich veränderliche Kraft', textEn: 'Constant, piecewise constant, or continuously varying force' },
    ],
    applicationCaseBriefs: [
      {
        id: 'sled-oblique-pull-and-friction',
        taskDemandDe: 'Ein Schlitten wird mit schrägem Seil über eine raue horizontale Strecke gezogen. Lege das System fest, bestimme die Arbeiten von Seilkraft und Reibung samt Vorzeichen und bilanziere die Änderung der kinetischen Energie.',
        taskDemandEn: 'A sled is pulled by an oblique rope across a rough horizontal surface. Define the system, determine the work done by tension and friction with signs, and balance the change in kinetic energy.',
        expectedPerformanceDe: 'Nur die Wegkomponente der Seilkraft trägt bei; Reibungsarbeit ist für das Schlitten-System negativ, alle Terme werden in Joule geführt und die resultierende Energieänderung wird vorzeichenrichtig gedeutet.',
        expectedPerformanceEn: 'Only the component of tension along the displacement contributes; frictional work is negative for the sled system, all terms are expressed in joules, and the resulting energy change is interpreted with the correct sign.',
        understandingFocusDe: 'Kraftkomponente, Vorzeichen und Systemgrenze bestimmen die Arbeitsbilanz.',
        understandingFocusEn: 'Force component, sign, and system boundary determine the work balance.',
      },
      {
        id: 'spring-block-boundary-switch',
        taskDemandDe: 'Ein Klotz wird von einer gespannten Feder beschleunigt. Werte eine gegebene Federkraft-Weg-Kurve aus und stelle die Energieänderung einmal für den Klotz und einmal für das System Klotz-Feder dar.',
        taskDemandEn: 'A block is accelerated by a compressed spring. Evaluate a supplied spring-force versus displacement graph and represent the energy change once for the block and once for the block-spring system.',
        expectedPerformanceDe: 'Die Fläche wird als Arbeit am Klotz bestimmt; bei erweiterter Systemgrenze wird derselbe Vorgang als Abnahme elastischer Energie statt als Energieübertragung über die Grenze bilanziert.',
        expectedPerformanceEn: 'The area is determined as work on the block; with the expanded system boundary, the same process is balanced as a decrease in elastic energy rather than an energy transfer across the boundary.',
        understandingFocusDe: 'Dieselbe Physik erhält je nach Systemgrenze verschiedene, aber konsistente Bilanzterme.',
        understandingFocusEn: 'The same physics yields different but consistent balance terms for different system boundaries.',
      },
    ],
  }],
  ['6affc2ea-ecd2-4fcd-8877-3ffa15b0425b', {
    archetype: 'concept',
    selectionReasonDe: 'Runde B ist konzeptuell am stärksten, weil sie die Erde-Körper-Systemgrenze, die freie Wahl des Nullniveaus, negative Werte und die Invarianz der Energieänderung ausdrücklich zusammenführt.',
    selectionReasonEn: 'Round B is conceptually strongest because it explicitly brings together the Earth-object system boundary, free choice of zero level, negative values, and invariance of the energy change.',
    additionalExpectation: {
      id: 'zero-potential-does-not-mean-zero-gravity',
      essentialUnderstandingDe: 'Ein gewählter Wert E_p = 0 kennzeichnet nur das Bezugsniveau und bedeutet weder verschwindende Gravitation noch fehlende Gewichtskraft. Die Kraftwirkung und die Energieänderung bei einem Höhenwechsel bleiben von dieser Konvention unberührt.',
      essentialUnderstandingEn: 'A chosen value E_p = 0 marks only the reference level and means neither vanishing gravity nor zero weight. The force effect and the energy change during a height change are unaffected by this convention.',
      observablePerformanceDe: 'Die lernende Person widerlegt an einer Situation am Nullniveau die Behauptung, dort wirke keine Gewichtskraft, und zeigt mit Einheiten, dass zwei verschiedene Nullniveaus dieselbe Änderung m g delta h ergeben.',
      observablePerformanceEn: 'Using a situation at the zero level, the learner refutes the claim that no weight acts there and shows with units that two different zero levels give the same change m g delta h.',
    },
    variationAxes: [
      { id: 'reference-level', textDe: 'Nullniveau im Keller, am Boden oder oberhalb des betrachteten Körpers', textEn: 'Zero level in a basement, at ground level, or above the object' },
      { id: 'mass-and-height', textDe: 'Unterschiedliche Massen, Anfangshöhen und positive oder negative Höhendifferenzen', textEn: 'Different masses, initial heights, and positive or negative height changes' },
      { id: 'route-and-context', textDe: 'Direktes Heben, Rampe, Treppe oder Aufzug bei gleicher Höhendifferenz', textEn: 'Direct lifting, ramp, stairs, or lift for the same height change' },
    ],
    applicationCaseBriefs: [
      {
        id: 'elevator-basement-zero-level',
        taskDemandDe: 'Für einen Aufzug wird das Erdgeschoss als Nullniveau gewählt; das Untergeschoss hat negative Höhe. Bestimme potenzielle Energien und Änderungen für eine Fahrt vom Untergeschoss ins Obergeschoss und beurteile die Aussage, am Erdgeschoss wirke keine Gravitation.',
        taskDemandEn: 'For a lift, ground level is chosen as the zero level and the basement has negative height. Determine potential energies and changes for travel from the basement to an upper floor and assess the claim that gravity does not act at ground level.',
        expectedPerformanceDe: 'Negative Ausgangsenergie wird als Referenzfolge gedeutet; delta E_p = m g delta h ist positiv und in Joule, während Gewichtskraft und g am Nullniveau nicht verschwinden.',
        expectedPerformanceEn: 'The negative initial energy is interpreted as a consequence of the reference choice; delta E_p = m g delta h is positive and expressed in joules, while weight and g do not vanish at the zero level.',
        understandingFocusDe: 'Nullwert, Kraftwirkung und Energieänderung werden getrennt.',
        understandingFocusEn: 'Zero value, force effect, and energy change are distinguished.',
      },
      {
        id: 'crane-equal-height-change-two-references',
        taskDemandDe: 'Eine Last wird mit einem Kran auf direktem Weg und eine zweite gleiche Last über eine Rampe um dieselbe Höhe angehoben. Rechne beide Vorgänge mit zwei verschiedenen Nullniveaus und vergleiche die Ergebnisse.',
        taskDemandEn: 'A load is raised directly by a crane and an equal second load is moved up a ramp through the same height. Calculate both processes using two different zero levels and compare the results.',
        expectedPerformanceDe: 'Absolute Werte verschieben sich mit dem Nullniveau; die gravitative Energieänderung bleibt für beide Wege gleich. Zusätzliche Reibungsübertragung der Rampe wird nicht mit Lageenergie verwechselt.',
        expectedPerformanceEn: 'Absolute values shift with the zero level; the gravitational energy change remains the same for both paths. Additional frictional transfer on the ramp is not confused with potential energy.',
        understandingFocusDe: 'Potenzielle Energieänderung ist wegunabhängig, die Gesamtbilanz eines realen Prozesses nicht notwendig.',
        understandingFocusEn: 'Potential-energy change is path-independent, whereas the total balance of a real process need not be.',
      },
    ],
  }],
  ['91c49019-ea51-4ce5-a919-c91c45b25e83', {
    archetype: 'modeling',
    selectionReasonDe: 'Runde B ist für den Modellierungsarchetyp am stärksten, weil sie Systemwahl, Energieformen, Einheiten, Grenzübertragungen und den Wechsel zwischen geschlossener und offener Bilanz explizit fordert.',
    selectionReasonEn: 'Round B is strongest for the modeling archetype because it explicitly requires system choice, energy forms, units, boundary transfers, and switching between closed and open balances.',
    additionalExpectation: {
      id: 'conservation-constrains-but-does-not-predict-direction',
      essentialUnderstandingDe: 'Energieerhaltung allein legt nicht fest, welche von mehreren möglichen Umwandlungen spontan abläuft oder wie schnell sie erfolgt. Sie beschränkt zulässige Anfangs- und Endzustände; Richtung und Verlauf erfordern weitere physikalische Information.',
      essentialUnderstandingEn: 'Energy conservation alone does not determine which of several possible transformations occurs spontaneously or how fast it proceeds. It constrains permissible initial and final states; direction and time course require further physical information.',
      observablePerformanceDe: 'Die lernende Person erkennt zwei energiebilanziell mögliche Verläufe, verweigert eine unbegründete Richtungs- oder Zeitprognose und benennt die zusätzlich benötigte Wechselwirkungs-, Dissipations- oder Kraftinformation.',
      observablePerformanceEn: 'The learner recognizes two processes permitted by the energy balance, declines an unjustified direction or timing prediction, and identifies the additional interaction, dissipation, or force information required.',
    },
    variationAxes: [
      { id: 'system-boundary', textDe: 'Körper allein, Körper-Erde, Körper-Feder oder System einschließlich Umgebung', textEn: 'Object alone, object-Earth, object-spring, or system including surroundings' },
      { id: 'transformation-and-dissipation', textDe: 'Reversible mechanische Umwandlung, Reibung, Verformung oder Energiezufuhr', textEn: 'Reversible mechanical transformation, friction, deformation, or energy input' },
      { id: 'evidence-form', textDe: 'Qualitatives Energiediagramm, Zahlenbilanz oder Messdaten vor und nach dem Prozess', textEn: 'Qualitative energy diagram, numerical balance, or measurements before and after the process' },
    ],
    applicationCaseBriefs: [
      {
        id: 'bouncing-ball-boundary-comparison',
        taskDemandDe: 'Bilanziere einen fallenden und unvollkommen zurückspringenden Ball zunächst für das System Ball allein und danach für ein ausreichend erweitertes System aus Ball, Erde einschließlich Unterlage und relevanter Umgebung. Benenne jeweils Energieübertragungen über die Systemgrenze und unterscheide mechanische Energie von der Gesamtenergie. Erkläre damit die geringere Rücksprunghöhe.',
        taskDemandEn: 'Balance a falling ball that rebounds imperfectly, first for the ball alone and then for a sufficiently expanded system consisting of the ball, Earth including the supporting surface, and the relevant surroundings. In each case, identify energy transfers across the system boundary and distinguish mechanical energy from total energy. Use this to explain the lower rebound height.',
        expectedPerformanceDe: 'Für den Ball allein werden Energieübertragungen durch Gravitations- und Kontaktarbeit über die Grenze ausgewiesen. Im ausreichend erweiterten System wird die Abnahme mechanischer Energie als Zunahme von Verformungs-, innerer und gegebenenfalls Schallenergie bilanziert; sie wird nicht als Verlust von Gesamtenergie gedeutet.',
        expectedPerformanceEn: 'For the ball alone, energy transfers by gravitational and contact work across the boundary are identified. In the sufficiently expanded system, the decrease in mechanical energy is balanced by increases in deformation, internal, and possibly sound energy; it is not interpreted as a loss of total energy.',
        understandingFocusDe: 'Systemgrenze sowie mechanische und gesamte Energie werden konsistent getrennt.',
        understandingFocusEn: 'System boundary, mechanical energy, and total energy are distinguished consistently.',
      },
      {
        id: 'smooth-and-rough-ramp-prediction',
        taskDemandDe: 'Zwei Wagen starten aus gleicher Höhe auf einer glatten beziehungsweise rauen Rampe. Erstelle vor der Messung Energieprognosen, bilanziere die gemessenen Endgeschwindigkeiten und entscheide, welche Zusatzinformation Energieerhaltung nicht liefert.',
        taskDemandEn: 'Two carts start at the same height on a smooth and a rough ramp. Make energy predictions before measurement, balance the measured final speeds, and decide which additional information energy conservation does not provide.',
        expectedPerformanceDe: 'Für die raue Rampe wird ein innerer Energieterm ergänzt; Einheiten und System bleiben konsistent. Die Bilanz begrenzt mögliche Endzustände, bestimmt aber ohne Reibungsmodell weder Beschleunigungsverlauf noch Fahrzeit.',
        expectedPerformanceEn: 'An internal-energy term is added for the rough ramp; units and system remain consistent. The balance constrains possible final states but, without a friction model, determines neither the acceleration history nor travel time.',
        understandingFocusDe: 'Erhaltung ist eine Bilanzbedingung, kein vollständiges Dynamikmodell.',
        understandingFocusEn: 'Conservation is a balance constraint, not a complete dynamics model.',
      },
    ],
  }],
  ['839ecc8f-3a60-418b-bc92-64bfeef33824', {
    archetype: 'modeling',
    selectionReasonDe: 'Runde A ist für den Modellierungsarchetyp am stärksten, weil sie Systemabgrenzung, äußeren Kraftstoß, Vektorsumme, Rückstoßrichtung, ungleiche Massen und einen von null verschiedenen Anfangsimpuls verbindet.',
    selectionReasonEn: 'Round A is strongest for the modeling archetype because it connects system definition, external impulse, vector sum, recoil direction, unequal masses, and nonzero initial momentum.',
    additionalExpectation: {
      id: 'equal-opposite-momenta-do-not-imply-equal-speeds',
      essentialUnderstandingDe: 'Bei einem eindimensionalen Zweikörper-Rückstoß aus der Ruhe sind die beiden Teilimpulse gleich groß und entgegengesetzt gerichtet. Bei ungleichen Massen sind daher die Geschwindigkeitsbeträge verschieden; der leichtere Körper erhält den größeren Betrag.',
      essentialUnderstandingEn: 'In a one-dimensional two-body recoil from rest, the two component momenta have equal magnitudes and opposite directions. Unequal masses therefore produce different speed magnitudes, with the lighter body receiving the greater magnitude.',
      observablePerformanceDe: 'Die lernende Person prognostiziert für zwei gegebene Massen die Rückstoßrichtungen und das Verhältnis der Geschwindigkeitsbeträge, prüft vorgeschlagene oder gemessene Werte mit einer vorzeichenbehafteten Impulsbilanz samt Einheit und beurteilt ihre Plausibilität.',
      observablePerformanceEn: 'For two given masses, the learner predicts recoil directions and the ratio of speed magnitudes, checks proposed or measured values using a signed momentum balance with units, and judges their plausibility.',
    },
    variationAxes: [
      { id: 'initial-total-momentum', textDe: 'Eindimensionales System anfangs in Ruhe oder mit von null verschiedenem Gesamtimpuls', textEn: 'One-dimensional system initially at rest or with nonzero total momentum' },
      { id: 'mass-ratio', textDe: 'Gleiche oder ungleiche Massen der beiden Rückstoßkörper', textEn: 'Equal or unequal masses of the two recoiling bodies' },
      { id: 'system-and-external-impulse', textDe: 'Vollständiges System, ausgelassener Teil oder kleiner messbarer äußerer Kraftstoß', textEn: 'Complete system, omitted component, or a small measurable external impulse' },
    ],
    applicationCaseBriefs: [
      {
        id: 'astronaut-tool-recoil',
        taskDemandDe: 'Eine Astronautin und ein Werkzeugpaket driften gemeinsam mit von null verschiedenem Impuls. Nach dem Abstoßen ist die Geschwindigkeit des Pakets gegeben. Lege das System und die positive Richtung fest und bestimme Richtung und Geschwindigkeit der Astronautin.',
        taskDemandEn: 'An astronaut and a tool package drift together with nonzero momentum. After the package is pushed away, its velocity is given. Define the system and positive direction and determine the astronaut\'s direction and velocity.',
        expectedPerformanceDe: 'Anfangsimpuls, Teilimpulse und Einheiten kg m/s werden vorzeichenrichtig bilanziert; ungleiche Massen führen zu unterschiedlichen Geschwindigkeitsänderungen, ohne dass der Einzelimpuls erhalten sein muss.',
        expectedPerformanceEn: 'Initial momentum, component momenta, and units of kg m/s are balanced with correct signs; unequal masses lead to different velocity changes without requiring either individual momentum to be conserved.',
        understandingFocusDe: 'Gesamtimpuls bleibt erhalten, Einzelimpulse werden durch innere Wechselwirkung umverteilt.',
        understandingFocusEn: 'Total momentum is conserved while internal interaction redistributes component momenta.',
      },
      {
        id: 'two-carts-spring-recoil',
        taskDemandDe: 'Zwei Wagen unterschiedlicher Masse stehen auf einer geraden reibungsarmen Bahn und stoßen sich durch eine zuvor zusammengedrückte Feder voneinander ab. Prognostiziere vor dem Lösen ihre Richtungen und welcher Wagen den größeren Geschwindigkeitsbetrag erhält. Prüfe anschließend gegebene oder gemessene Geschwindigkeiten mit einer eindimensionalen Impulsbilanz.',
        taskDemandEn: 'Two carts of different masses stand on a straight low-friction track and push apart through a previously compressed spring. Before release, predict their directions and which cart receives the greater speed magnitude. Then check supplied or measured velocities using a one-dimensional momentum balance.',
        expectedPerformanceDe: 'Die Richtungen werden entgegengesetzt prognostiziert; für das anfangs ruhende Gesamtsystem wird p1 + p2 näherungsweise null geprüft, wobei der leichtere Wagen den größeren Geschwindigkeitsbetrag hat. Einheit, Vorzeichen, Systemabgrenzung und begrenzte Messabweichungen werden plausibel berücksichtigt.',
        expectedPerformanceEn: 'Opposite directions are predicted; for the initially stationary total system, p1 + p2 is checked to be approximately zero, with the lighter cart having the greater speed magnitude. Units, signs, system boundary, and bounded measurement discrepancies are handled plausibly.',
        understandingFocusDe: 'Ein einfacher Zweikörper-Rückstoß wird qualitativ erklärt und mit einer angemessenen Impulsbilanz geprüft.',
        understandingFocusEn: 'A simple two-body recoil is explained qualitatively and checked with an appropriate momentum balance.',
      },
    ],
  }],
])

const expectedPlanSha256 = 'cd510ba9445eccdb51857e9504f14187e07079ac129923099f10462bf0a32db4'
const expectedPreviousOutputHashes: Record<string, string> = {
  [candidatesPath]: '48ad90746d80636a55ddc3aab43366d9c202de0bcc366e9906fab5a8c86806a1',
  [reviewPath]: '397ad3b9b205ff51075216100f99604c9a3063e5b5537b232cd3b4841146235e',
}
const writeLockPath = `${artifactRoot}/.${artifactStem}.write-lock`
const stagingSuffix = '.b025a-stable12-evidence-rewrite.staging'
const landscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const expectedRoundARunId = `${resultStem}-a.batch-001.run-001`
const expectedRoundBRunId = `${resultStem}-b.batch-001.run-001`

const sha256Hex = (value: Buffer | string): string => (
  createHash('sha256').update(value).digest('hex')
)
const digest = (value: Buffer | string): `sha256:${string}` => `sha256:${sha256Hex(value)}`
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const sameOrdered = (left: readonly string[], right: readonly string[]): boolean => (
  left.length === right.length && left.every((value, index) => value === right[index])
)
const hasErrorCode = (error: unknown, code: string): boolean => (
  typeof error === 'object'
  && error !== null
  && 'code' in error
  && error.code === code
)

const absolute = (path: string): string => {
  const candidate = resolve(repositoryRoot, path)
  const repositoryRelative = relative(repositoryRoot, candidate)
  if (
    repositoryRelative === ''
    || repositoryRelative === '..'
    || repositoryRelative.startsWith(`..${sep}`)
  ) {
    throw new Error(`Path must resolve below the repository root: ${path}`)
  }
  return candidate
}

const assertRealDirectory = (path: string, role: string): void => {
  let stat
  try {
    stat = lstatSync(path)
  } catch (error) {
    throw new Error(`${role} is not an existing real directory: ${path}: ${String(error)}`)
  }
  if (!stat.isDirectory()) throw new Error(`${role} is not a real directory: ${path}`)
}

const assertRealParentChain = (path: string, role: string): void => {
  const candidate = absolute(path)
  assertRealDirectory(repositoryRoot, 'Repository root')
  const parentRelative = relative(repositoryRoot, dirname(candidate))
  if (parentRelative === '') return
  let current = repositoryRoot
  for (const part of parentRelative.split(sep)) {
    current = resolve(current, part)
    assertRealDirectory(current, `${role} parent`)
  }
}

const readRegularFile = (path: string, role: string): Buffer => {
  assertRealParentChain(path, role)
  const candidate = absolute(path)
  const stat = lstatSync(candidate)
  if (!stat.isFile()) throw new Error(`${role} is not a regular file: ${path}`)
  return readFileSync(candidate)
}

const readBoundFile = (path: string, expectedSha256: string, role: string): Buffer => {
  const bytes = readRegularFile(path, role)
  const expectedHex = expectedSha256.replace(/^sha256:/u, '')
  const actualHex = sha256Hex(bytes)
  if (actualHex !== expectedHex) {
    throw new Error(`${role} source drift: ${path}: ${actualHex} != ${expectedHex}`)
  }
  return bytes
}

const parseJson = <T>(bytes: Buffer, role: string): T => {
  try {
    return JSON.parse(bytes.toString('utf8')) as T
  } catch (error) {
    throw new Error(`${role} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const parseJsonl = (bytes: Buffer, role: string): BoundRecord[] => {
  const text = bytes.toString('utf8')
  if (!text.endsWith('\n')) throw new Error(`${role} must end with one LF-delimited record boundary`)
  const lines = text.split('\n')
  lines.pop()
  if (lines.length === 0 || lines.some((line) => line.length === 0 || line.endsWith('\r'))) {
    throw new Error(`${role} contains an empty or non-canonical CRLF record`)
  }
  return lines.map((line, index) => ({
    record: parseJson<ReviewRecord>(Buffer.from(line), `${role} line ${index + 1}`),
    digest: digest(Buffer.from(line)),
  }))
}

const assertUnique = (values: readonly string[], role: string): void => {
  if (new Set(values).size !== values.length) throw new Error(`${role} contains duplicate goal IDs`)
}

const verifyStaticScope = (): void => {
  assertUnique(campaignGoalIds, 'B025a campaign scope')
  assertUnique(goalIds, 'B025a stable scope')
  assertUnique(excludedGoalIds, 'B025a excluded revision scope')
  if (
    campaignGoalIds.length !== 17
    || goalIds.length !== 12
    || excludedGoalIds.length !== 5
    || selectedRoundByGoalId.size !== goalIds.length
    || profileDefinitions.size !== goalIds.length
  ) {
    throw new Error('B025a stable-twelve scope must be exactly 17 = 12 stable + 5 excluded')
  }
  const partition = [...goalIds, ...excludedGoalIds]
  if (
    new Set(partition).size !== campaignGoalIds.length
    || !campaignGoalIds.every((goalId) => partition.includes(goalId))
  ) {
    throw new Error('B025a stable and excluded scopes must be a disjoint full campaign partition')
  }
  if (
    [...selectedRoundByGoalId.keys()].some((goalId) => !goalIds.includes(goalId as typeof goalIds[number]))
    || [...profileDefinitions.keys()].some((goalId) => !goalIds.includes(goalId as typeof goalIds[number]))
  ) {
    throw new Error('B025a evidence selection or profile definition claims a non-stable goal')
  }
}

const sourceSpecifications = [
  { key: 'config', role: 'b025a_config', path: sourceConfigPath, sha256: sourceHashes.config },
  { key: 'batchManifest', role: 'b025a_batch_manifest', path: batchManifestPath, sha256: sourceHashes.batchManifest },
  { key: 'dualSummary', role: 'b025a_dual_summary', path: dualSummaryPath, sha256: sourceHashes.dualSummary },
  { key: 'roundARecords', role: 'b025a_round_a_records', path: roundARecordsPath, sha256: sourceHashes.roundARecords },
  { key: 'roundARun', role: 'b025a_round_a_run', path: roundARunPath, sha256: sourceHashes.roundARun },
  { key: 'roundBRecords', role: 'b025a_round_b_records', path: roundBRecordsPath, sha256: sourceHashes.roundBRecords },
  { key: 'roundBRun', role: 'b025a_round_b_run', path: roundBRunPath, sha256: sourceHashes.roundBRun },
  { key: 'synthesis', role: 'b025a_stable_twelve_synthesis', path: synthesisPath, sha256: sourceHashes.synthesis },
  { key: 'resolutionIndex', role: 'b025a_stable_twelve_resolution_index', path: resolutionIndexPath, sha256: sourceHashes.resolutionIndex },
  { key: 'canonical', role: 'current_canonical_physics', path: canonicalPath, sha256: sourceHashes.canonical },
  { key: 'semanticKindLedger', role: 'current_physics_semantic_kind_ledger', path: semanticKindLedgerPath, sha256: sourceHashes.semanticKindLedger },
  { key: 'criteria', role: 'positive_evidence_criteria', path: criteriaPath, sha256: sourceHashes.criteria },
] as const

type BoundSources = Record<typeof sourceSpecifications[number]['key'], Buffer>

const loadBoundSources = (): BoundSources => Object.fromEntries(
  sourceSpecifications.map(({ key, path, sha256, role }) => [
    key,
    readBoundFile(path, sha256, role),
  ]),
) as BoundSources

type BuiltPlan = {
  outputs: PlannedOutput[]
  planSha256: string
}

const buildPlan = async (): Promise<BuiltPlan> => {
  verifyStaticScope()
  const sources = loadBoundSources()
  const sourceConfig = parseJson<{ batchId?: string; subject?: string; goalIds?: string[] }>(
    sources.config,
    'B025a config',
  )
  const batchManifest = parseJson<{ batchId?: string; subject?: string; goalIds?: string[] }>(
    sources.batchManifest,
    'B025a batch manifest',
  )
  const roundARun = parseJson<{ runId?: string; status?: string; blindToOtherRuns?: boolean; goalIds?: string[] }>(
    sources.roundARun,
    'B025a Round A run',
  )
  const roundBRun = parseJson<{ runId?: string; status?: string; blindToOtherRuns?: boolean; goalIds?: string[] }>(
    sources.roundBRun,
    'B025a Round B run',
  )
  const dualSummary = parseJson<DualSummary>(sources.dualSummary, 'B025a dual summary')
  const synthesis = parseJson<SynthesisManifest>(sources.synthesis, 'B025a stable-twelve synthesis')
  const resolutionIndex = parseJson<ResolutionIndex>(
    sources.resolutionIndex,
    'B025a stable-twelve resolution index',
  )
  const canonical = parseJson<{ landscapeId?: string; goals?: Array<{ id?: string }> }>(
    sources.canonical,
    'Current canonical Physics landscape',
  )
  const semanticKindLedger = parseJson<{
    sourceLandscapeId?: string
    decisions?: Array<{ goalId?: string; semanticKind?: string; decisionStatus?: string }>
  }>(sources.semanticKindLedger, 'Current Physics semantic-kind ledger')

  if (
    sourceConfig.batchId !== expectedBatchId
    || sourceConfig.subject !== 'physik'
    || !sameOrdered(sourceConfig.goalIds ?? [], campaignGoalIds)
    || batchManifest.batchId !== expectedBatchId
    || batchManifest.subject !== 'physik'
    || !sameOrdered(batchManifest.goalIds ?? [], campaignGoalIds)
  ) {
    throw new Error('B025a config or batch-manifest scope is not the exact 17-goal campaign')
  }
  if (
    roundARun.runId !== expectedRoundARunId
    || roundARun.status !== 'completed'
    || roundARun.blindToOtherRuns !== true
    || !sameOrdered(roundARun.goalIds ?? [], campaignGoalIds)
    || roundBRun.runId !== expectedRoundBRunId
    || roundBRun.status !== 'completed'
    || roundBRun.blindToOtherRuns !== true
    || !sameOrdered(roundBRun.goalIds ?? [], campaignGoalIds)
  ) {
    throw new Error('B025a blind-review run bindings are invalid')
  }
  if (
    dualSummary.goalCount !== campaignGoalIds.length
    || dualSummary.goals?.length !== campaignGoalIds.length
    || !sameOrdered(dualSummary.goals.map(({ goalId }) => goalId ?? ''), campaignGoalIds)
  ) {
    throw new Error('B025a dual summary does not bind the exact ordered 17-goal campaign')
  }
  if (
    synthesis.batch?.batchId !== expectedBatchId
    || synthesis.batch.batchManifestDigest !== digest(sources.batchManifest)
    || synthesis.batch.configDigest !== digest(sources.config)
    || synthesis.batch.dualSummaryDigest !== digest(sources.dualSummary)
    || synthesis.batch.canonicalLandscapeDigest !== digest(sources.canonical)
    || synthesis.decisions?.length !== goalIds.length
    || !sameOrdered(synthesis.decisions.map(({ goalId }) => goalId ?? ''), goalIds)
  ) {
    throw new Error('B025a synthesis does not bind the exact stable-twelve source state')
  }
  const indexGroup = resolutionIndex.groups?.[0]
  if (
    resolutionIndex.schemaVersion !== 1
    || resolutionIndex.subject !== 'Physik'
    || resolutionIndex.semanticKind !== 'curricularAtomic'
    || resolutionIndex.strictDescriptionReviewCompleteCount !== goalIds.length
    || resolutionIndex.groups?.length !== 1
    || indexGroup?.groupId !== expectedBatchId
    || indexGroup.dualSummaryDigest !== digest(sources.dualSummary)
    || indexGroup.campaignGoalCount !== campaignGoalIds.length
    || indexGroup.resolvedGoalCount !== goalIds.length
    || resolutionIndex.resolutions?.length !== goalIds.length
    || !sameOrdered(resolutionIndex.resolutions.map(({ goalId }) => goalId ?? ''), goalIds)
  ) {
    throw new Error('B025a resolution index does not bind exactly twelve current resolutions')
  }

  if (canonical.landscapeId !== landscapeId || semanticKindLedger.sourceLandscapeId !== landscapeId) {
    throw new Error('Canonical Physics, semantic-kind ledger, and evidence review identity disagree')
  }
  const canonicalGoalIds = canonical.goals?.map(({ id }) => id ?? '') ?? []
  assertUnique(canonicalGoalIds, 'Canonical Physics landscape')
  if (!campaignGoalIds.every((goalId) => canonicalGoalIds.includes(goalId))) {
    throw new Error('At least one B025a campaign goal is absent from current canonical Physics')
  }
  const semanticDecisions = semanticKindLedger.decisions ?? []
  const authoritativeCurricularAtomic = semanticDecisions.filter((decision) => (
    decision.decisionStatus === 'authoritative' && decision.semanticKind === 'curricularAtomic'
  ))
  if (resolutionIndex.curriculumAtomicDenominator !== authoritativeCurricularAtomic.length) {
    throw new Error(
      'B025a resolution denominator does not match the bound current semantic-kind ledger count',
    )
  }
  for (const goalId of goalIds) {
    const matches = authoritativeCurricularAtomic.filter((decision) => decision.goalId === goalId)
    if (matches.length !== 1) {
      throw new Error(`${goalId}: expected exactly one authoritative curricularAtomic ledger decision`)
    }
  }

  const rounds = {
    first: parseJsonl(sources.roundARecords, 'B025a Round A records'),
    second: parseJsonl(sources.roundBRecords, 'B025a Round B records'),
  }
  for (const [round, records] of Object.entries(rounds)) {
    if (
      records.length !== campaignGoalIds.length
      || !sameOrdered(records.map(({ record }) => record.goalId), campaignGoalIds)
    ) {
      throw new Error(`B025a ${round} records do not match the exact ordered campaign`)
    }
    assertUnique(records.map(({ record }) => record.recordId), `B025a ${round} record IDs`)
  }

  const resolutionFiles: CandidateSet['sourceBindings']['resolutionFiles'] = []
  const resolutionsByGoalId = new Map<string, ResolutionIndex['resolutions'][number]>()
  for (const resolution of resolutionIndex.resolutions) {
    if (
      !resolution.goalId
      || !resolution.resolutionPath
      || !resolution.resolutionDigest
      || resolution.decision !== 'keep_current'
      || resolution.strictDescriptionComplete !== true
    ) {
      throw new Error('B025a resolution index contains a malformed or non-current entry')
    }
    const resolutionAbsolute = resolve(absolute(batchDirectory), resolution.resolutionPath)
    const resolutionRelativeToBatch = relative(absolute(batchDirectory), resolutionAbsolute)
    if (
      resolutionRelativeToBatch === ''
      || resolutionRelativeToBatch === '..'
      || resolutionRelativeToBatch.startsWith(`..${sep}`)
    ) {
      throw new Error(`${resolution.goalId}: resolution path escapes the B025a batch directory`)
    }
    const resolutionRepositoryPath = relative(repositoryRoot, resolutionAbsolute)
    const resolutionBytes = readBoundFile(
      resolutionRepositoryPath,
      resolution.resolutionDigest,
      `${resolution.goalId} B025a resolution`,
    )
    const resolutionBody = parseJson<{
      goal?: { goalId?: string; effectiveSemanticKind?: string }
      status?: string
      decision?: string
      synthesisDecisionManifest?: { manifestDigest?: string }
    }>(resolutionBytes, `${resolution.goalId} B025a resolution`)
    if (
      resolutionBody.goal?.goalId !== resolution.goalId
      || resolutionBody.goal.effectiveSemanticKind !== 'curricularAtomic'
      || resolutionBody.status !== 'resolved'
      || resolutionBody.decision !== 'keep_current'
      || resolutionBody.synthesisDecisionManifest?.manifestDigest !== digest(sources.synthesis)
    ) {
      throw new Error(`${resolution.goalId}: resolution body conflicts with the bound synthesis`)
    }
    resolutionsByGoalId.set(resolution.goalId, resolution)
    resolutionFiles.push({
      goalId: resolution.goalId,
      path: resolutionRepositoryPath,
      sha256: resolution.resolutionDigest,
    })
  }

  const candidates: CandidateSet['goals'] = goalIds.map((goalId) => {
    const selectedRound = selectedRoundByGoalId.get(goalId)
    const definition = profileDefinitions.get(goalId)
    const summary = dualSummary.goals?.find((goal) => goal.goalId === goalId)
    const synthesisDecision = synthesis.decisions?.find((decision) => decision.goalId === goalId)
    const resolution = resolutionsByGoalId.get(goalId)
    const first = rounds.first.find(({ record }) => record.goalId === goalId)
    const second = rounds.second.find(({ record }) => record.goalId === goalId)
    if (!selectedRound || !definition || !summary || !synthesisDecision || !resolution || !first || !second) {
      throw new Error(`${goalId}: missing stable evidence selection or bound authority source`)
    }
    const selected = selectedRound === 'first' ? first : second
    const alternateRound: ReviewRound = selectedRound === 'first' ? 'second' : 'first'
    const alternate = alternateRound === 'first' ? first : second
    if (
      summary.agreement !== 'disagreement'
      || summary.firstRecordId !== first.record.recordId
      || summary.secondRecordId !== second.record.recordId
      || summary.firstRunId !== expectedRoundARunId
      || summary.secondRunId !== expectedRoundBRunId
      || summary.firstDecision !== 'keep'
      || summary.secondDecision !== 'keep'
      || summary.requiresSynthesis !== true
      || summary.automaticAcceptance !== false
      || synthesisDecision.effectiveSemanticKind !== 'curricularAtomic'
      || synthesisDecision.resolutionDecision !== 'keep_current'
      || synthesisDecision.evidenceRound !== selectedRound
      || synthesisDecision.records?.first.recordId !== first.record.recordId
      || synthesisDecision.records.first.recordDigest !== first.digest
      || synthesisDecision.records.second.recordId !== second.record.recordId
      || synthesisDecision.records.second.recordDigest !== second.digest
    ) {
      throw new Error(`${goalId}: selected evidence conflicts with B025a dual/synthesis authority`)
    }
    for (const [label, bound] of [['selected', selected], ['alternate', alternate]] as const) {
      if (
        bound.record.decision !== 'keep'
        || bound.record.evidenceProfileContract !== 'positive-understanding-evidence-v2'
        || bound.record.evidenceProfileRecommendation !== 'create'
        || bound.record.recordStatus !== 'candidate'
        || bound.record.reviewAuthority !== 'ai_candidate'
      ) {
        throw new Error(`${goalId}: ${label} review is not a KEEP positive-evidence V2 AI candidate`)
      }
    }
    if (
      definition.additionalExpectation.id === 'selected-blind-review-core'
      || definition.variationAxes.length !== 3
      || definition.applicationCaseBriefs.length !== 2
    ) {
      throw new Error(`${goalId}: profile must add one expectation, three axes, and two fresh cases`)
    }
    const reviewedCore = {
      id: 'selected-blind-review-core',
      essentialUnderstandingDe: selected.record.understandingEvidence.essentialUnderstandingDe,
      essentialUnderstandingEn: selected.record.understandingEvidence.essentialUnderstandingEn,
      observablePerformanceDe: selected.record.understandingEvidence.observablePerformanceDe,
      observablePerformanceEn: selected.record.understandingEvidence.observablePerformanceEn,
    }
    const expectations = [reviewedCore, definition.additionalExpectation]
    const profile: PositiveGoalEvidenceProfile = {
      archetype: definition.archetype,
      expectations,
      coverageExpectations: {
        requiredExpectationIds: expectations.map(({ id }) => id),
        alternativeExpectationGroups: [],
        minimumIndependentDemonstrations: 2,
        freshVariationRequired: true,
        independentTransferRequired: true,
      },
      variationAxes: definition.variationAxes,
      applicationCaseBriefs: definition.applicationCaseBriefs,
    }
    const selectedLabel = selectedRound === 'first' ? 'Round A' : 'Round B'
    const alternateLabel = alternateRound === 'first' ? 'Round A' : 'Round B'
    return {
      goalId,
      reason: `DE: ${definition.selectionReasonDe} Der Kernblock stammt bytegetreu aus ${selected.record.recordId}; zwei unabhängige frische Anwendungsfälle operationalisieren Verständnis und Transfer. EN: ${definition.selectionReasonEn} The core block is carried byte-for-byte from ${selected.record.recordId}; two independent fresh application cases operationalize understanding and transfer.`,
      evidenceLevel: 'E1',
      maximumClaimScope: 'G1',
      dissent: [
        `B025a evidence-formulation dissent remains bound: selected ${selectedLabel} record ${selected.record.recordId} (${selected.digest}); compatible ${alternateLabel} record ${alternate.record.recordId} (${alternate.digest}) and both complete bilingual transfer blocks remain preserved in the exact dual-summary, synthesis (${digest(sources.synthesis)}), resolution, and resolution-index (${digest(sources.resolutionIndex)}) bindings.`,
      ],
      profile,
    }
  })

  if (candidates.some(({ goalId }) => excludedGoalIds.includes(goalId as typeof excludedGoalIds[number]))) {
    throw new Error('B025a positive-evidence candidates must not claim any of the five revision goals')
  }
  const config: PositiveGoalEvidenceReviewConfig = {
    $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
    schemaVersion: 2,
    reviewId: targetReviewId,
    goalFingerprintRuleVersion: 'goal-evidence-v1',
    profileRuleVersion: 'positive-understanding-evidence-v2',
    landscapeId,
    landscapePath: canonicalPath,
    semanticKindLedgerPath,
    reviewCriteriaPath: criteriaPath,
    reviewPath,
    reviewRunManifestPaths: [],
    reviewedResourceTypes: [],
    requireApproved: false,
    scope: {
      label: 'Canonical Physics positive understanding-evidence rollout v1 batch 025a: twelve stable E-phase mechanics and energy goals',
      goalIds: [...goalIds],
    },
  }
  const candidateSet: CandidateSet = {
    schemaVersion: 1,
    authoringContract: 'positive-understanding-evidence-candidates-v1',
    reviewId: targetReviewId,
    reviewedAt,
    reviewer,
    sourceBindings: {
      bindingContract: 'b025a-stable-twelve-positive-evidence-sources-v1',
      batchId: expectedBatchId,
      campaignGoalIds,
      stableGoalIds: goalIds,
      excludedRevisionGoalIds: excludedGoalIds,
      sources: sourceSpecifications.map(({ role, path, sha256 }) => ({
        role,
        path,
        sha256: `sha256:${sha256}`,
      })),
      resolutionFiles,
    },
    goals: candidates,
  }
  const reviewRecords = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet })
  if (
    reviewRecords.length !== goalIds.length
    || !sameOrdered(reviewRecords.map(({ goalId }) => goalId), goalIds)
  ) {
    throw new Error('Generic candidate materializer did not return the exact stable-twelve scope')
  }
  const configBytes = jsonBytes(config)
  const candidatesBytes = jsonBytes(candidateSet)
  const reviewBytes = Buffer.from(`${reviewRecords.map((record) => JSON.stringify(record)).join('\n')}\n`)
  const outputs: PlannedOutput[] = [
    { path: configPath, bytes: configBytes },
    { path: candidatesPath, bytes: candidatesBytes },
    { path: reviewPath, bytes: reviewBytes },
  ]
  if (outputs.length !== 3) throw new Error('B025a evidence plan must contain exactly three artifacts')
  const planSha256 = sha256Hex(jsonBytes({
    materializationContract: 'b025a-stable-twelve-positive-evidence-hash-bound-rewrite-v2',
    sourceHashes,
    resolutionFiles,
    campaignGoalIds,
    stableGoalIds: goalIds,
    excludedRevisionGoalIds: excludedGoalIds,
    expectedPreviousOutputHashes,
    outputs: outputs.map(({ path, bytes }) => ({ path, sha256: sha256Hex(bytes) })),
  }))
  if (planSha256 !== expectedPlanSha256) {
    throw new Error(`B025a evidence plan drift: ${planSha256} != ${expectedPlanSha256}`)
  }
  return { outputs, planSha256 }
}

const classifyOutput = ({ path, bytes }: PlannedOutput): OutputState => {
  assertRealParentChain(path, 'B025a evidence output')
  const candidate = absolute(path)
  let stat
  try {
    stat = lstatSync(candidate)
  } catch (error) {
    if (hasErrorCode(error, 'ENOENT')) return 'absent'
    throw error
  }
  if (!stat.isFile()) throw new Error(`B025a evidence output has unknown non-file state: ${path}`)
  const actualSha256 = sha256Hex(readFileSync(candidate))
  const expectedSha256 = sha256Hex(bytes)
  if (actualSha256 === expectedSha256) return 'exact-after'
  if (expectedPreviousOutputHashes[path] === actualSha256) return 'expected-before'
  throw new Error(`B025a evidence output has unknown bytes: ${path}: ${actualSha256} != ${expectedSha256}`)
}

const stagingPathFor = (path: string): string => `${path}${stagingSuffix}`

const assertNoStagingResidue = (outputs: PlannedOutput[]): void => {
  for (const output of outputs) {
    const stagingPath = stagingPathFor(output.path)
    assertRealParentChain(stagingPath, 'B025a evidence staging')
    try {
      lstatSync(absolute(stagingPath))
    } catch (error) {
      if (hasErrorCode(error, 'ENOENT')) continue
      throw error
    }
    throw new Error(`B025a evidence staging residue exists at ${stagingPath}; inspect it manually`)
  }
}

const removeOwnedStaging = (path: string, bytes: Buffer): void => {
  const stagingPath = stagingPathFor(path)
  const stagingBytes = readRegularFile(stagingPath, 'Owned B025a evidence staging')
  if (sha256Hex(stagingBytes) !== sha256Hex(bytes)) {
    throw new Error(`${path}: refusing to remove unknown B025a evidence staging residue`)
  }
  unlinkSync(absolute(stagingPath))
}

const assertNoWriteLock = (): void => {
  try {
    lstatSync(absolute(writeLockPath))
  } catch (error) {
    if (hasErrorCode(error, 'ENOENT')) return
    throw error
  }
  throw new Error(
    `B025a evidence write lock exists at ${writeLockPath}; inspect it as stale crash residue`,
  )
}

const acquireWriteLock = (): void => {
  assertRealParentChain(writeLockPath, 'B025a evidence write lock')
  assertNoWriteLock()
  try {
    mkdirSync(absolute(writeLockPath))
  } catch (error) {
    if (hasErrorCode(error, 'EEXIST')) assertNoWriteLock()
    throw error
  }
  assertRealDirectory(absolute(writeLockPath), 'B025a evidence write lock')
}

const releaseWriteLock = (): void => {
  const lock = absolute(writeLockPath)
  assertRealDirectory(lock, 'B025a evidence write lock')
  if (readdirSync(lock).length !== 0) {
    throw new Error(`B025a evidence write lock contains unknown residue: ${writeLockPath}`)
  }
  rmdirSync(lock)
}

const writeBoundedOutput = (output: PlannedOutput): void => {
  const before = classifyOutput(output)
  if (before === 'exact-after') return
  if (before === 'absent') {
    try {
      writeFileSync(absolute(output.path), output.bytes, { flag: 'wx' })
    } catch (error) {
      if (!hasErrorCode(error, 'EEXIST') || classifyOutput(output) !== 'exact-after') throw error
    }
    if (classifyOutput(output) !== 'exact-after') {
      throw new Error(`${output.path}: exclusive B025a evidence publish did not reach exact-after`)
    }
    return
  }

  const stagingPath = stagingPathFor(output.path)
  const stagingAbsolute = absolute(stagingPath)
  let stagingOwned = false
  try {
    writeFileSync(stagingAbsolute, output.bytes, { flag: 'wx', mode: 0o600 })
    stagingOwned = true
    if (sha256Hex(readRegularFile(stagingPath, 'B025a evidence staging')) !== sha256Hex(output.bytes)) {
      throw new Error(`${output.path}: B025a evidence staging digest mismatch`)
    }
    if (classifyOutput(output) !== 'expected-before') {
      throw new Error(`${output.path}: bounded previous output changed while staging`)
    }
    renameSync(stagingAbsolute, absolute(output.path))
    stagingOwned = false
  } finally {
    if (stagingOwned) removeOwnedStaging(output.path, output.bytes)
  }
  if (classifyOutput(output) !== 'exact-after') {
    throw new Error(`${output.path}: hash-bound B025a evidence rewrite did not reach exact-after`)
  }
}

const runFreezeCheck = (): void => {
  execFileSync('node', ['scripts/check_openai_plugin_review_freeze.mjs'], {
    cwd: repositoryRoot,
    stdio: 'inherit',
  })
}

const runGenericValidators = (): void => {
  const appRoot = resolve(repositoryRoot, 'app')
  execFileSync('npx', [
    'tsx',
    'scripts/materializePositiveGoalEvidenceCandidates.ts',
    '--config',
    configPath,
    '--candidates',
    candidatesPath,
  ], { cwd: appRoot, stdio: 'inherit' })
  execFileSync('npx', [
    'tsx',
    'scripts/positiveGoalEvidenceReview.ts',
    `--config=${configPath}`,
    '--mode=check',
  ], { cwd: appRoot, stdio: 'inherit' })
}

const assertSamePlan = (left: BuiltPlan, right: BuiltPlan, role: string): void => {
  if (
    left.planSha256 !== right.planSha256
    || left.outputs.length !== right.outputs.length
    || left.outputs.some((output, index) => (
      output.path !== right.outputs[index].path || !output.bytes.equals(right.outputs[index].bytes)
    ))
  ) {
    throw new Error(`${role}: B025a evidence inputs or deterministic output plan drifted`)
  }
}

const main = async (): Promise<void> => {
  const initialPlan = await buildPlan()
  assertNoStagingResidue(initialPlan.outputs)
  const initialStates = initialPlan.outputs.map(classifyOutput)
  if (writeMode) {
    runFreezeCheck()
    acquireWriteLock()
    try {
      const reboundPlan = await buildPlan()
      assertSamePlan(initialPlan, reboundPlan, 'Pre-publish rebind')
      assertNoStagingResidue(reboundPlan.outputs)
      reboundPlan.outputs.forEach(writeBoundedOutput)
      const postWritePlan = await buildPlan()
      assertSamePlan(reboundPlan, postWritePlan, 'Post-publish rebind')
      assertNoStagingResidue(postWritePlan.outputs)
      const postWriteStates = postWritePlan.outputs.map(classifyOutput)
      if (postWriteStates.some((state) => state !== 'exact-after')) {
        throw new Error('B025a evidence publish did not leave all three artifacts exact-after')
      }
    } finally {
      releaseWriteLock()
    }
    runFreezeCheck()
  } else {
    assertNoWriteLock()
  }

  const finalPlan = await buildPlan()
  assertSamePlan(initialPlan, finalPlan, 'Final plan rebind')
  const finalStates = finalPlan.outputs.map(classifyOutput)
  if (finalStates.every((state) => state === 'exact-after')) runGenericValidators()
  console.log(JSON.stringify({
    mode: writeMode ? 'WRITE' : 'PLAN',
    expectedPlanSha256,
    computedPlanSha256: finalPlan.planSha256,
    reviewId: targetReviewId,
    campaignGoalCount: campaignGoalIds.length,
    stableGoalIds: goalIds,
    excludedRevisionGoalIds: excludedGoalIds,
    outputs: finalPlan.outputs.map((output, index) => ({
      path: output.path,
      sha256: sha256Hex(output.bytes),
      initialState: initialStates[index],
      finalState: finalStates[index],
    })),
  }, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
