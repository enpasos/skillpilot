import { createHash } from 'node:crypto'
import { lstatSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildPositiveGoalEvidenceCandidateRecords } from './materializePositiveGoalEvidenceCandidates'
import type { PositiveGoalEvidenceProfile } from './positiveGoalEvidenceProfileModel'
import type { PositiveGoalEvidenceReviewConfig } from './positiveGoalEvidenceReview'

type Digest = `sha256:${string}`
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
type BoundRecord = { record: ReviewRecord; digest: Digest }
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
  manifestId?: string
  batch?: {
    batchId?: string
    batchManifestDigest?: Digest
    configDigest?: Digest
    dualSummaryDigest?: Digest
    canonicalLandscapeDigest?: Digest
  }
  rounds?: Record<ReviewRound, {
    runId?: string
    resultsDigest?: Digest
  }>
  decisions?: Array<{
    goalId?: string
    effectiveSemanticKind?: string
    resolutionDecision?: string
    evidenceRound?: string
    records?: Record<ReviewRound, { recordId?: string; recordDigest?: Digest }>
  }>
}
type ResolutionIndex = {
  schemaVersion?: number
  subject?: string
  semanticKind?: string
  batchGoalIds?: string[]
  strictDescriptionReviewCompleteCount?: number
  groups?: Array<{
    groupId?: string
    campaignGoalCount?: number
    resolvedGoalCount?: number
  }>
  resolutions?: Array<{
    goalId?: string
    groupId?: string
    decision?: string
    resolutionPath?: string
    resolutionDigest?: Digest
    strictDescriptionComplete?: boolean
  }>
}
type DualSummary = {
  goalCount?: number
  rounds?: Record<ReviewRound, { runIds?: string[] }>
  goals?: Array<{
    goalId?: string
    firstRecordId?: string
    secondRecordId?: string
    firstRunId?: string
    secondRunId?: string
    firstDecision?: string
    secondDecision?: string
    agreement?: string
    requiresSynthesis?: boolean
    automaticAcceptance?: boolean
  }>
}
type RunManifest = {
  runId?: string
  status?: string
  blindToOtherRuns?: boolean
  independenceGroupId?: string
  goalIds?: string[]
  outputDigest?: Digest
}
type PlannedOutput = { path: string; bytes: Buffer }
type OutputState = 'absent' | 'exact-after'

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
const batchName = 'batch-025b-e-mechanics-energy-revised-follow-up-5-v1'
const batchDirectory = `${rolloutRoot}/${batchName}`
const sourceConfigPath = `${rolloutRoot}/${batchName}.config.json`
const batchManifestPath = `${batchDirectory}/batch-manifest.json`
const dualSummaryPath = `${batchDirectory}/dual-summary.json`
const synthesisPath = `${batchDirectory}/synthesis-decisions.json`
const resolutionIndexPath = `${batchDirectory}/resolution-index.json`
const resultStem = (
  'physik-rollout-v1-batch-025b-e-mechanics-energy-revised-follow-up-5-v1-20260829-'
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
  + 'batch-025b-e-mechanics-energy-revised-five-current-v1'
)
const artifactRoot = 'curricula/DE/Gymnasium/quality/goal-evidence'
const configPath = `${artifactRoot}/${artifactStem}.config.json`
const candidatesPath = `${artifactRoot}/${artifactStem}.candidates.json`
const reviewPath = `${artifactRoot}/${artifactStem}.review.jsonl`
const targetReviewId = 'canonical-physics-positive-evidence-v1-b025b-e-mechanics-energy-revised-five-v1'
const reviewedAt = '2026-08-29T01:08:00.000Z'
const reviewer = 'codex-physics-b025b-revised-five-positive-evidence-candidate-2026-08-29'
const expectedBatchId = (
  'physik-rollout-v1-batch-025b-e-mechanics-energy-revised-follow-up-5-v1-20260829'
)
const expectedSynthesisId = 'physik-b025b-revised-five-keep-current-synthesis-20260829'
const expectedRoundARunId = 'physik-b025b-round-a-blind-reviewer-codex-gpt5-20260829t005218z'
const expectedRoundBRunId = 'physik-b025b-round-b-blind-reviewer-b-20260829-run-001'

const sourceHashes = {
  config: '88406b9f36d0be9a987561cba31497b9934faed25835354a079ea6cc7669c398',
  batchManifest: '413ed58f6702996459701cf0b749cc0d12e147922b59dd0540a8a9861f1b2e0c',
  dualSummary: '6a2cf1a5d073acae83a597f5c60c046a56f05df2ad6f4726bbadf23c670c06b7',
  roundARecords: 'b3a90c5749e3970c78aa9a7fddce4dfa75c46d470d39285c2574f82c7011339b',
  roundARun: '1401a13d0779d8d3f782c75b7aed822ef941e52d744acab055018db5e3291580',
  roundBRecords: '0ed9dcd2fb320caf62d0d80f2f7aec3ec7e9ff509bd333f30f851bc29ca0c1e7',
  roundBRun: 'fcf6093777531a276d29f0396658882f6d899392124960133f2ebc61a849b3a7',
  synthesis: '3bb0dcc9fe9b077ef9ba3de678482f743e58ba5c2e48c5deedb06f52910e49c2',
  resolutionIndex: '3ce382bb37533bd923fe271d3cebc50c9e39512af43ad09f84f9895b47114df6',
  canonical: 'a8eb1398a6d11dcdbdb02ccb4bd3526a512ecac8743630d24ae2381b8041a64c',
  semanticKindLedger: 'f880e255246c41aabc0ab346d43a074551cbd197b001905bfb46607d6639780f',
  criteria: '8d64a50ede312df08795f6fddec82c1c3bcc8b77e50dad62220c201c819fd460',
} as const

const goalIds = [
  '32b896b9-f2f1-4d4e-96ad-e869ac3d3759',
  'a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20',
  '253a71d2-e751-4c63-acbe-238b71463cd8',
  'f524f05c-4456-4fc3-a1f7-f40741fc1f16',
  'e790de73-f8e5-4027-bc05-9f12a0e8c9cb',
] as const

const profileDefinitions = new Map<string, ProfileDefinition>([
  ['32b896b9-f2f1-4d4e-96ad-e869ac3d3759', {
    archetype: 'concept',
    selectionReasonDe: 'Der Konzeptarchetyp passt, weil der Nachweis das Trägheitsprinzip über Körperabgrenzung, vektorielle Kräftebilanz, Anfangszustand und Bezugssystem erklären muss und nicht durch bloßes Formelabrufen erbracht ist.',
    selectionReasonEn: 'The concept archetype fits because evidence must explain inertia through body boundary, vector force balance, initial state, and reference frame rather than merely recall a formula.',
    additionalExpectation: {
      id: 'constant-velocity-is-a-vector-condition',
      essentialUnderstandingDe: 'Bei verschwindender äußerer Resultierender bleibt der gesamte Geschwindigkeitsvektor konstant: weder Betrag noch Richtung ändern sich. Eine Kurvenbewegung zeigt daher auch bei unverändertem Geschwindigkeitsbetrag eine nicht verschwindende Resultierende an; beim Abbremsen gilt dies wegen der Betragsänderung ebenfalls.',
      essentialUnderstandingEn: 'When the net external force is zero, the entire velocity vector remains constant: neither magnitude nor direction changes. Curved motion therefore indicates a nonzero resultant even at unchanged speed; slowing does so because the speed magnitude changes.',
      observablePerformanceDe: 'Die lernende Person vergleicht geradlinige, kreisförmige und langsamer werdende Bewegungen, entscheidet aus der Änderung des Geschwindigkeitsvektors über die Resultierende und begründet die Entscheidung mit Richtung und Einheit.',
      observablePerformanceEn: 'The learner compares rectilinear, circular, and slowing motion, infers the resultant from the change in velocity vector, and justifies the decision using direction and units.',
    },
    variationAxes: [
      { id: 'initial-motion-state', textDe: 'Ruhe oder bereits vorhandene gleichförmig-geradlinige Bewegung', textEn: 'Rest or pre-existing uniform rectilinear motion' },
      { id: 'external-force-configuration', textDe: 'Keine relevante äußere Kraft, mehrere ausgeglichene Kräfte oder eine kleine nicht ausgeglichene Kraft', textEn: 'No relevant external force, several balancing forces, or a small unbalanced force' },
      { id: 'inertial-observer-and-direction', textDe: 'Verschiedene gleichförmig bewegte Inertialbeobachter und unterschiedlich gewählte Achsenrichtungen', textEn: 'Different uniformly moving inertial observers and differently chosen axis directions' },
    ],
    applicationCaseBriefs: [
      {
        id: 'air-hockey-puck-after-push',
        taskDemandDe: 'Ein Puck gleitet nach einem kurzen Stoß nahezu reibungsfrei über einen Luftkissentisch. Grenze den Puck als System ab, zeichne die äußeren Kräfte nach Ende des Stoßes und prognostiziere seinen Geschwindigkeitsvektor aus Sicht zweier gleichförmig bewegter Beobachter.',
        taskDemandEn: 'After a brief push, a puck glides almost without friction across an air table. Define the puck as the system, draw the external forces after the push ends, and predict its velocity vector for two uniformly moving observers.',
        expectedPerformanceDe: 'Gewicht und Normalkraft werden als ausgeglichen bilanziert; eine fortdauernde Kraft in Bewegungsrichtung wird nicht erfunden. Beide Inertialbeobachter erhalten jeweils einen konstanten, möglicherweise verschieden angegebenen Geschwindigkeitsvektor.',
        expectedPerformanceEn: 'Weight and normal force are balanced, and no continuing force in the direction of motion is invented. Each inertial observer obtains a constant velocity vector, although the reported vectors may differ.',
        understandingFocusDe: 'Kräftegleichgewicht erhält Bewegung und ist nicht auf Ruhe beschränkt.',
        understandingFocusEn: 'Force balance preserves motion and is not restricted to rest.',
      },
      {
        id: 'towed-crate-at-constant-velocity',
        taskDemandDe: 'Eine Kiste wird auf horizontalem Boden mit konstanter Geschwindigkeit gezogen. Bestimme für die Kiste alle äußeren Kräfte und erkläre, warum Zugkraft und Reibung trotz vorhandener Bewegung gleich groß sein müssen; sage anschließend die Änderung bei etwas größerer Zugkraft voraus.',
        taskDemandEn: 'A crate is pulled across a horizontal floor at constant velocity. Identify all external forces on the crate and explain why pull and friction must be equal despite the motion; then predict the change when the pulling force becomes slightly larger.',
        expectedPerformanceDe: 'Die lernende Person trennt Geschwindigkeit von Resultierender, verwendet ausgeglichene, von null verschiedene Kräfte für den Ausgangsfall und sagt bei positiver horizontaler Resultierender eine Änderung des Geschwindigkeitsvektors in deren Richtung voraus.',
        expectedPerformanceEn: 'The learner distinguishes velocity from resultant force, uses balanced nonzero forces for the initial case, and predicts a change of velocity vector in the direction of a positive horizontal resultant.',
        understandingFocusDe: 'Fehlende Resultierende bedeutet nicht fehlende Einzelkräfte.',
        understandingFocusEn: 'Zero resultant does not mean that individual forces are absent.',
      },
    ],
  }],
  ['a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20', {
    archetype: 'modeling',
    selectionReasonDe: 'Der Modellierungsarchetyp passt, weil eine belastbare Leistung System und Koordinaten festlegt, innere und äußere Kräfte klassifiziert, die vektorielle Impulsänderung bilanziert und erst unter der passenden Massenbedingung auf die Beschleunigungsform reduziert.',
    selectionReasonEn: 'The modeling archetype fits because robust performance defines the system and coordinates, classifies internal and external forces, balances vector momentum change, and only then reduces to the acceleration form under the appropriate mass condition.',
    additionalExpectation: {
      id: 'force-changes-momentum-not-necessarily-speed',
      essentialUnderstandingDe: 'Die resultierende äußere Kraft legt die Richtung der zeitlichen Impulsänderung fest, nicht die Richtung des vorhandenen Impulses. Eine quer zum Impuls gerichtete Resultierende kann deshalb zunächst vor allem die Bewegungsrichtung ändern, während eine entgegengesetzte Resultierende den Impulsbetrag vermindert.',
      essentialUnderstandingEn: 'The net external force determines the direction of the rate of momentum change, not the direction of the existing momentum. A resultant perpendicular to momentum can therefore initially change mainly the direction of motion, whereas an opposing resultant reduces momentum magnitude.',
      observablePerformanceDe: 'Die lernende Person konstruiert für parallele, antiparallele und senkrechte Kraft-Impuls-Konfigurationen einen vektoriell richtigen Impulszuwachs, prüft Vorzeichen und Einheit und trennt Bewegungsrichtung von Beschleunigungsrichtung.',
      observablePerformanceEn: 'For parallel, antiparallel, and perpendicular force-momentum configurations, the learner constructs a correct vector momentum increment, checks signs and units, and distinguishes direction of motion from direction of acceleration.',
    },
    variationAxes: [
      { id: 'force-relative-to-momentum', textDe: 'Resultierende parallel, antiparallel oder quer zum vorhandenen Impuls', textEn: 'Resultant parallel, antiparallel, or transverse to existing momentum' },
      { id: 'system-boundary', textDe: 'Ein einzelner Körper oder ein erweitertes materiell abgeschlossenes Mehrkörpersystem', textEn: 'A single body or an expanded materially closed multi-body system' },
      { id: 'coordinates-mass-and-data', textDe: 'Geänderte Achsen, verschiedene konstante Massen sowie Kraft-, Impuls- oder Beschleunigungsdaten', textEn: 'Changed axes, different constant masses, and force, momentum, or acceleration data' },
    ],
    applicationCaseBriefs: [
      {
        id: 'cart-moving-right-under-braking-force',
        taskDemandDe: 'Ein Wagen bewegt sich nach rechts, während eine konstante resultierende äußere Kraft nach links wirkt. Lege System und positive Richtung fest, bestimme die zeitliche Impulsänderung und führe die Aussage für konstante Masse auf die Beschleunigung zurück.',
        taskDemandEn: 'A cart moves to the right while a constant net external force acts to the left. Define the system and positive direction, determine the rate of momentum change, and reduce the statement to acceleration for constant mass.',
        expectedPerformanceDe: 'Impuls und Geschwindigkeit sind zunächst positiv, Impulsänderung und Beschleunigung negativ. Die lernende Person verwendet N = kg m/s² beziehungsweise N = (kg m/s)/s und erklärt das Abbremsen ohne Kraft und Bewegung gleichzusetzen.',
        expectedPerformanceEn: 'Momentum and velocity are initially positive, while momentum change and acceleration are negative. The learner uses N = kg m/s² or N = (kg m/s)/s and explains the slowing without equating force with motion.',
        understandingFocusDe: 'Resultierende und vorhandene Bewegung können entgegengesetzt gerichtet sein.',
        understandingFocusEn: 'Resultant force and existing motion may point in opposite directions.',
      },
      {
        id: 'puck-with-sideways-force-and-boundary-change',
        taskDemandDe: 'Ein nach Osten gleitender Puck wird durch einen seitlich ziehenden Faden nach Norden abgelenkt. Bilanziere zunächst den Puck allein und anschließend Puck plus Zugvorrichtung; ordne die Fadenkraft jeweils ein und skizziere die Impulsänderung.',
        taskDemandEn: 'An eastward-gliding puck is deflected northward by a sideways pulling string. First balance the puck alone and then the puck plus pulling device; classify the string force in each system and sketch the momentum change.',
        expectedPerformanceDe: 'Für den Puck allein ist die Zugkraft äußerlich und d p/dt zeigt nach Norden; im erweiterten System wird die Wechselwirkung intern, während die verbleibenden äußeren Kräfte neu bilanziert werden. Die physikalische Vorhersage bleibt zur Systemwahl konsistent.',
        expectedPerformanceEn: 'For the puck alone, tension is external and d p/dt points north; in the expanded system the interaction becomes internal while the remaining external forces are rebalanced. The physical prediction remains consistent with the chosen system.',
        understandingFocusDe: 'Vektorrichtung und Systemgrenze bestimmen die korrekte Modellgleichung.',
        understandingFocusEn: 'Vector direction and system boundary determine the correct model equation.',
      },
    ],
  }],
  ['253a71d2-e751-4c63-acbe-238b71463cd8', {
    archetype: 'modeling',
    selectionReasonDe: 'Der Modellierungsarchetyp passt, weil Reibungsenergie nur über eine ausdrücklich gesetzte Systemgrenze, eine Anfangs-End-Bilanz und die Unterscheidung von Energieumwandlung und Energieübertragung fachlich tragfähig nachgewiesen wird.',
    selectionReasonEn: 'The modeling archetype fits because frictional energy is demonstrated soundly only through an explicit system boundary, an initial-final balance, and a distinction between energy transformation and energy transfer.',
    additionalExpectation: {
      id: 'total-balance-does-not-fix-energy-distribution',
      essentialUnderstandingDe: 'Eine makroskopische Bilanz kann die gesamte Zunahme innerer Energie der einbezogenen Körper bestimmen, legt aber ohne weitere Information nicht fest, wie sie sich auf die beteiligten Körper oder mikroskopischen Freiheitsgrade verteilt. Reibungsenergie ist daher keine zusätzliche gespeicherte Energie neben deren innerer Energie.',
      essentialUnderstandingEn: 'A macroscopic balance can determine the total increase in internal energy of the included bodies but, without further information, does not determine how it is distributed among bodies or microscopic degrees of freedom. Frictional energy is therefore not an additional stored energy alongside their internal energy.',
      observablePerformanceDe: 'Die lernende Person bestimmt für einen Reibungsvorgang die gesamte mechanisch-intern umgewandelte Energie, kennzeichnet eine nicht bestimmbare Aufteilung und verwirft eine Bilanz, die dieselbe Energie zusätzlich als eigene Reibungsenergie speichert.',
      observablePerformanceEn: 'For a friction process, the learner determines the total mechanical-to-internal conversion, marks an indeterminate distribution, and rejects an account that stores the same energy again as a separate frictional-energy term.',
    },
    variationAxes: [
      { id: 'chosen-system-boundary', textDe: 'Bewegter Körper allein, Kontaktpartner allein oder beide gemeinsam', textEn: 'Moving body alone, contact partner alone, or both together' },
      { id: 'friction-process', textDe: 'Gleiten, Bremsen oder eine Reibungsphase mit zusätzlicher äußerer Energieübertragung', textEn: 'Sliding, braking, or a friction phase with additional external energy transfer' },
      { id: 'available-energy-information', textDe: 'Qualitative Energieflussbilder, Anfangs-End-Werte oder unvollständige Angaben zur Temperaturverteilung', textEn: 'Qualitative energy-flow diagrams, initial-final values, or incomplete information about temperature distribution' },
    ],
    applicationCaseBriefs: [
      {
        id: 'block-sliding-on-rough-table',
        taskDemandDe: 'Ein Block gleitet auf einem rauen Tisch bis zum Stillstand. Bilanziere den Vorgang einmal für den Block allein und einmal für Block plus Tisch; ordne die Abnahme kinetischer Energie und die Zunahme innerer Energie zu.',
        taskDemandEn: 'A block slides on a rough table until it stops. Account for the process once for the block alone and once for block plus table; assign the decrease in kinetic energy and the increase in internal energy.',
        expectedPerformanceDe: 'Beim Gesamtsystem wird die mechanische Energie intern in innere Energie der beteiligten Körper umgewandelt; bei engerer Grenze erscheint ein Teil als Energieübertragung über die Systemgrenze. Energie wird weder vernichtet noch doppelt als Reibungsenergie gespeichert.',
        expectedPerformanceEn: 'For the combined system, mechanical energy is internally converted into internal energy of the interacting bodies; with a narrower boundary, part appears as energy transfer across the boundary. Energy is neither destroyed nor stored twice as frictional energy.',
        understandingFocusDe: 'Die Systemgrenze ändert die Bilanzdarstellung, nicht die Energieerhaltung.',
        understandingFocusEn: 'The system boundary changes the accounting representation, not energy conservation.',
      },
      {
        id: 'bicycle-braking-with-warm-rims',
        taskDemandDe: 'Ein Fahrrad wird mit Felgenbremsen abgebremst; danach sind Felgen und Bremsklötze wärmer. Erstelle eine qualitative Anfangs-End-Bilanz für Fahrrad plus Fahrerin und anschließend für ein erweitertes System einschließlich Umgebung und diskutiere, was über die Energieverteilung sicher folgt.',
        taskDemandEn: 'A bicycle is slowed by rim brakes; afterward the rims and brake pads are warmer. Construct a qualitative initial-final balance for bicycle plus rider and then for an expanded system including the surroundings, and discuss what can be concluded about energy distribution.',
        expectedPerformanceDe: 'Die Abnahme kinetischer Energie wird als Zunahme innerer Energie und gegebenenfalls Übertragung an die Umgebung bilanziert. Die Gesamtmenge ist bestimmbar, eine genaue Aufteilung auf Felge, Klötze, Reifen und Luft ohne Daten dagegen nicht.',
        expectedPerformanceEn: 'The decrease in kinetic energy is accounted for as increased internal energy and possible transfer to the surroundings. The total can be determined, but its exact distribution among rim, pads, tire, and air cannot be inferred without data.',
        understandingFocusDe: 'Reibungsenergie ist Bilanzsprache für Umwandlung, keine verlorene Energieform.',
        understandingFocusEn: 'Frictional energy is accounting language for conversion, not a lost form of energy.',
      },
    ],
  }],
  ['f524f05c-4456-4fc3-a1f7-f40741fc1f16', {
    archetype: 'proof',
    selectionReasonDe: 'Der Beweisarchetyp passt, weil der Nachweis die Impulsform des zweiten Axioms über alle Systemteile summiert, innere Wechselwirkungspaare mit dem dritten Axiom aufhebt und die genaue Bedingung an den äußeren Kraftstoß explizit ableitet.',
    selectionReasonEn: 'The proof archetype fits because evidence sums the momentum form of the second law over all system parts, cancels internal interaction pairs using the third law, and explicitly derives the precise condition on external impulse.',
    additionalExpectation: {
      id: 'zero-net-impulse-is-an-endpoint-condition',
      essentialUnderstandingDe: 'Ein verschwindender resultierender äußerer Kraftstoß über ein Intervall garantiert gleichen Gesamtimpuls an dessen Anfang und Ende, aber nicht notwendig einen zu jedem Zwischenzeitpunkt konstanten Gesamtimpuls. Fortlaufende Impulserhaltung folgt erst, wenn die resultierende äußere Kraft zu jedem Zeitpunkt verschwindet.',
      essentialUnderstandingEn: 'Zero net external impulse over an interval guarantees equal total momentum at its beginning and end, but not necessarily constant total momentum at every intermediate instant. Continuous momentum conservation follows only when the net external force vanishes at every instant.',
      observablePerformanceDe: 'Die lernende Person konstruiert oder analysiert einen äußeren Kraftverlauf mit positiver und negativer Teilphase, integriert ihn vektoriell und unterscheidet eine Endpunktgleichheit des Gesamtimpulses von seiner zeitlich durchgehenden Konstanz.',
      observablePerformanceEn: 'The learner constructs or analyzes an external force history with positive and negative phases, integrates it vectorially, and distinguishes equality of endpoint total momentum from continuous constancy in time.',
    },
    variationAxes: [
      { id: 'system-boundary-choice', textDe: 'Gesamtes wechselwirkendes System oder nur ein ausgewählter Teilkörper', textEn: 'Complete interacting system or only one selected body' },
      { id: 'external-impulse-history', textDe: 'Zu jeder Zeit null, nur über das Gesamtintervall null oder eindeutig von null verschieden', textEn: 'Zero at every instant, zero only over the full interval, or clearly nonzero' },
      { id: 'interaction-topology-and-frame', textDe: 'Zwei oder mehrere Körper in verschiedenen Inertialsystemen und mit unterschiedlichen inneren Wechselwirkungen', textEn: 'Two or more bodies in different inertial frames and with different internal interactions' },
    ],
    applicationCaseBriefs: [
      {
        id: 'two-cart-collision-and-narrower-system',
        taskDemandDe: 'Leite für den Stoß zweier Wagen auf einer horizontalen Bahn die Impulsbilanz aus Newtons zweitem und drittem Axiom her. Wiederhole die Bilanz danach nur für einen Wagen und erkläre die veränderte Rolle der Stoßkraft.',
        taskDemandEn: 'For a collision of two carts on a horizontal track, derive the momentum balance from Newton\'s second and third laws. Then repeat the balance for only one cart and explain the changed role of the collision force.',
        expectedPerformanceDe: 'Im Zweier-System heben sich die gleichzeitigen inneren Stoßkräfte paarweise auf, sodass bei vernachlässigbarem äußerem Kraftstoß der Gesamtimpuls erhalten ist. Für einen Wagen ist die Stoßkraft äußerlich und sein Einzelimpuls im Allgemeinen nicht erhalten.',
        expectedPerformanceEn: 'In the two-cart system, simultaneous internal collision forces cancel pairwise, so total momentum is conserved when external impulse is negligible. For one cart, the collision force is external and its individual momentum is generally not conserved.',
        understandingFocusDe: 'Die Herleitung und ihre Gültigkeit hängen ausdrücklich von der Systemgrenze ab.',
        understandingFocusEn: 'The derivation and its validity depend explicitly on the system boundary.',
      },
      {
        id: 'opposite-external-pulses-at-different-times',
        taskDemandDe: 'Auf ein abgeschlossen betrachtetes Wagensystem wirken nacheinander zwei gleich große entgegengesetzte äußere Kraftstöße. Leite die Gesamtimpulsänderung über das ganze Intervall und über beide Teilintervalle her und beurteile die Aussage Impuls bleibt erhalten.',
        taskDemandEn: 'A system of carts receives two equal and opposite external impulses at different times. Derive the total momentum change over the full interval and over each subinterval, then assess the statement momentum remains conserved.',
        expectedPerformanceDe: 'Über das Gesamtintervall ist der äußere Kraftstoß null und Anfangs- sowie Endimpuls sind gleich; zwischen den Pulsen ist der Gesamtimpuls verändert. Vektoren und Einheiten N s = kg m/s werden konsistent geführt.',
        expectedPerformanceEn: 'Over the full interval the external impulse is zero and initial and final momentum are equal; between the pulses total momentum is different. Vectors and units N s = kg m/s are handled consistently.',
        understandingFocusDe: 'Endpunktgleichheit ist schwächer als fortlaufende Erhaltung.',
        understandingFocusEn: 'Endpoint equality is weaker than continuous conservation.',
      },
    ],
  }],
  ['e790de73-f8e5-4027-bc05-9f12a0e8c9cb', {
    archetype: 'representation',
    selectionReasonDe: 'Der Repräsentationsarchetyp passt, weil ein tragfähiger Nachweis Kraftverlauf, vorzeichenbehaftete Fläche, Vektorimpuls, Einheit und Impulsänderung zwischen Diagramm, Rechnung und physikalischer Situation konsistent koordiniert.',
    selectionReasonEn: 'The representation archetype fits because robust evidence consistently coordinates force history, signed area, vector impulse, units, and momentum change among graph, calculation, and physical situation.',
    additionalExpectation: {
      id: 'same-impulse-does-not-fix-force-history',
      essentialUnderstandingDe: 'Gleicher Kraftstoß bedeutet gleiche Impulsänderung, legt aber weder Einwirkdauer noch mittlere oder maximale Kraft einzeln fest. Unterschiedlich geformte Kraft-Zeit-Verläufe können dieselbe vorzeichenbehaftete Fläche besitzen; aus dem Kraftstoß allein ist insbesondere keine Spitzenkraft bestimmbar.',
      essentialUnderstandingEn: 'Equal impulse means equal momentum change but does not separately determine duration, average force, or peak force. Differently shaped force-time histories can have the same signed area; in particular, peak force cannot be inferred from impulse alone.',
      observablePerformanceDe: 'Die lernende Person erzeugt oder vergleicht mindestens zwei verschieden geformte Kraft-Zeit-Verläufe mit gleichem Kraftstoß, prüft Flächen und Einheiten und begrenzt Aussagen über Mittel- und Spitzenkraft auf die tatsächlich gegebenen Daten.',
      observablePerformanceEn: 'The learner constructs or compares at least two differently shaped force-time histories with equal impulse, checks areas and units, and limits claims about average and peak force to what the supplied data support.',
    },
    variationAxes: [
      { id: 'force-time-shape-and-duration', textDe: 'Rechteckiger, dreieckiger oder gekrümmter Verlauf mit verschiedener Dauer', textEn: 'Rectangular, triangular, or curved history with different duration' },
      { id: 'sign-and-direction-changes', textDe: 'Nur eine Richtung oder positive und negative Teilflächen bei geänderter positiver Achse', textEn: 'One direction only or positive and negative partial areas with a changed positive axis' },
      { id: 'system-and-momentum-state', textDe: 'Verschiedene Systemgrenzen sowie Ruhe, Abbremsen, Umkehr oder seitliche Ablenkung', textEn: 'Different system boundaries and states of rest, slowing, reversal, or sideways deflection' },
    ],
    applicationCaseBriefs: [
      {
        id: 'signed-force-time-pulses',
        taskDemandDe: 'Ein Kraft-Zeit-Diagramm für einen Wagen enthält zunächst eine positive dreieckige und danach eine negative rechteckige Teilfläche. Lege die positive Richtung fest, bestimme beide Teilkraftstöße und verknüpfe ihre Summe mit der vektoriellen Impulsänderung.',
        taskDemandEn: 'A force-time graph for a cart contains a positive triangular area followed by a negative rectangular area. Define the positive direction, determine both partial impulses, and connect their sum to the vector momentum change.',
        expectedPerformanceDe: 'Die Teilflächen werden mit Vorzeichen und Einheit N s addiert und als Δp in kg m/s gedeutet. Betragsflächen, Spitzenkraft mal Gesamtdauer und das Ignorieren der negativen Phase werden ausdrücklich verworfen.',
        expectedPerformanceEn: 'The partial areas are added with signs and unit N s and interpreted as Δp in kg m/s. Unsigned areas, peak force times total duration, and ignoring the negative phase are explicitly rejected.',
        understandingFocusDe: 'Die algebraische Diagrammfläche ist die relevante vektorielle Bilanz.',
        understandingFocusEn: 'The algebraic graph area is the relevant vector balance.',
      },
      {
        id: 'airbag-and-rigid-stop-comparison',
        taskDemandDe: 'Dieselbe Person wird aus gleicher Anfangsgeschwindigkeit einmal über einen längeren Airbag-Kontakt und einmal über einen viel kürzeren starren Kontakt zum Stillstand gebracht. Vergleiche Kraftstoß, mittlere Kraft und die zulässige Aussage über Spitzenkräfte anhand zweier bereitgestellter Kraft-Zeit-Verläufe.',
        taskDemandEn: 'The same person is brought to rest from the same initial velocity once through a longer airbag contact and once through a much shorter rigid contact. Compare impulse, average force, and the justified claim about peak forces using two supplied force-time histories.',
        expectedPerformanceDe: 'Beide Verläufe liefern dieselbe Impulsänderung; die längere Dauer senkt bei gleicher Fläche den Betrag der mittleren Kraft. Spitzenkräfte werden nur aus den gegebenen Kurven und nicht aus dem Kraftstoß allein verglichen.',
        expectedPerformanceEn: 'Both histories yield the same momentum change; at equal area, the longer duration lowers average-force magnitude. Peak forces are compared only from the supplied curves, not from impulse alone.',
        understandingFocusDe: 'Gleicher Kraftstoß kann mit sehr verschiedenen Kraftverläufen entstehen.',
        understandingFocusEn: 'The same impulse can arise from very different force histories.',
      },
    ],
  }],
])

const sha256 = (value: Buffer | string): string => createHash('sha256').update(value).digest('hex')
const digest = (value: Buffer | string): Digest => `sha256:${sha256(value)}`
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const sameOrdered = (left: readonly string[], right: readonly string[]): boolean => (
  left.length === right.length && left.every((value, index) => value === right[index])
)

const repositoryPath = (configuredPath: string, label: string): string => {
  const absolutePath = resolve(repositoryRoot, configuredPath)
  const relativePath = relative(repositoryRoot, absolutePath)
  if (relativePath === '' || relativePath === '..' || relativePath.startsWith(`..${sep}`)) {
    throw new Error(`${label} must resolve below the repository root: ${configuredPath}`)
  }
  return absolutePath
}

const parseJson = <T>(bytes: Buffer, label: string): T => {
  try {
    return JSON.parse(bytes.toString('utf8')) as T
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const parseJsonl = (bytes: Buffer, label: string): BoundRecord[] => bytes.toString('utf8')
  .split(/\r?\n/u)
  .filter((line) => line.length > 0)
  .map((line, index) => {
    if (line !== line.trim()) throw new Error(`${label}:${index + 1} has surrounding whitespace`)
    return {
      record: parseJson<ReviewRecord>(Buffer.from(line), `${label}:${index + 1}`),
      digest: digest(line),
    }
  })

const readOptional = (path: string): Buffer | null => {
  try {
    return readFileSync(path)
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}

const classifyOutput = ({ path, bytes }: PlannedOutput): OutputState => {
  const absolutePath = repositoryPath(path, 'output')
  const current = readOptional(absolutePath)
  if (current === null) return 'absent'
  const stat = lstatSync(absolutePath)
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`Output is not a regular file: ${path}`)
  if (!current.equals(bytes)) {
    throw new Error(`No-clobber refusal: existing output differs from exact-after bytes: ${path}`)
  }
  return 'exact-after'
}

const main = async (): Promise<void> => {
  const sourcePaths = {
    config: sourceConfigPath,
    batchManifest: batchManifestPath,
    dualSummary: dualSummaryPath,
    roundARecords: roundARecordsPath,
    roundARun: roundARunPath,
    roundBRecords: roundBRecordsPath,
    roundBRun: roundBRunPath,
    synthesis: synthesisPath,
    resolutionIndex: resolutionIndexPath,
    canonical: canonicalPath,
    semanticKindLedger: semanticKindLedgerPath,
    criteria: criteriaPath,
  } as const
  const sourceBytes = Object.fromEntries(
    Object.entries(sourcePaths).map(([name, path]) => [name, readFileSync(repositoryPath(path, name))]),
  ) as Record<keyof typeof sourcePaths, Buffer>
  for (const [name, bytes] of Object.entries(sourceBytes)) {
    const expected = sourceHashes[name as keyof typeof sourceHashes]
    const actual = sha256(bytes)
    if (actual !== expected) {
      throw new Error(`Physics B025b revised-five source drift: ${name}: ${actual} != ${expected}`)
    }
  }

  const sourceConfig = parseJson<{ batchId?: string; subject?: string; goalIds?: string[] }>(
    sourceBytes.config,
    sourceConfigPath,
  )
  const batchManifest = parseJson<{ batchId?: string; subject?: string; goalIds?: string[] }>(
    sourceBytes.batchManifest,
    batchManifestPath,
  )
  const dualSummary = parseJson<DualSummary>(sourceBytes.dualSummary, dualSummaryPath)
  const roundARun = parseJson<RunManifest>(sourceBytes.roundARun, roundARunPath)
  const roundBRun = parseJson<RunManifest>(sourceBytes.roundBRun, roundBRunPath)
  const synthesis = parseJson<SynthesisManifest>(sourceBytes.synthesis, synthesisPath)
  const resolutionIndex = parseJson<ResolutionIndex>(sourceBytes.resolutionIndex, resolutionIndexPath)

  if (
    sourceConfig.batchId !== expectedBatchId
    || sourceConfig.subject !== 'physik'
    || !sameOrdered(sourceConfig.goalIds ?? [], goalIds)
    || batchManifest.batchId !== expectedBatchId
    || batchManifest.subject !== 'physik'
    || !sameOrdered(batchManifest.goalIds ?? [], goalIds)
  ) {
    throw new Error('Physics B025b revised-five config or batch-manifest scope is invalid')
  }
  if (
    roundARun.runId !== expectedRoundARunId
    || roundARun.status !== 'completed'
    || roundARun.blindToOtherRuns !== true
    || roundARun.outputDigest !== digest(sourceBytes.roundARecords)
    || !sameOrdered(roundARun.goalIds ?? [], goalIds)
    || roundBRun.runId !== expectedRoundBRunId
    || roundBRun.status !== 'completed'
    || roundBRun.blindToOtherRuns !== true
    || roundBRun.outputDigest !== digest(sourceBytes.roundBRecords)
    || !sameOrdered(roundBRun.goalIds ?? [], goalIds)
    || !roundARun.independenceGroupId
    || !roundBRun.independenceGroupId
    || roundARun.independenceGroupId === roundBRun.independenceGroupId
  ) {
    throw new Error('Physics B025b revised-five independent-run binding is invalid')
  }
  if (
    dualSummary.goalCount !== goalIds.length
    || dualSummary.goals?.length !== goalIds.length
    || !sameOrdered(dualSummary.goals.map(({ goalId }) => goalId ?? ''), goalIds)
    || synthesis.manifestId !== expectedSynthesisId
    || synthesis.batch?.batchId !== expectedBatchId
    || synthesis.batch.configDigest !== digest(sourceBytes.config)
    || synthesis.batch.batchManifestDigest !== digest(sourceBytes.batchManifest)
    || synthesis.batch.dualSummaryDigest !== digest(sourceBytes.dualSummary)
    || synthesis.batch.canonicalLandscapeDigest !== digest(sourceBytes.canonical)
    || synthesis.rounds?.first.runId !== expectedRoundARunId
    || synthesis.rounds.first.resultsDigest !== digest(sourceBytes.roundARecords)
    || synthesis.rounds?.second.runId !== expectedRoundBRunId
    || synthesis.rounds.second.resultsDigest !== digest(sourceBytes.roundBRecords)
    || synthesis.decisions?.length !== goalIds.length
    || !sameOrdered(synthesis.decisions.map(({ goalId }) => goalId ?? ''), goalIds)
    || resolutionIndex.schemaVersion !== 2
    || resolutionIndex.subject !== 'Physik'
    || resolutionIndex.semanticKind !== 'curricularAtomic'
    || !sameOrdered(resolutionIndex.batchGoalIds ?? [], goalIds)
    || resolutionIndex.groups?.length !== 1
    || resolutionIndex.groups[0].groupId !== expectedBatchId
    || resolutionIndex.groups[0].campaignGoalCount !== goalIds.length
    || resolutionIndex.groups[0].resolvedGoalCount !== goalIds.length
    || resolutionIndex.resolutions?.length !== goalIds.length
    || !sameOrdered(resolutionIndex.resolutions.map(({ goalId }) => goalId ?? ''), goalIds)
    || profileDefinitions.size !== goalIds.length
  ) {
    throw new Error('Physics B025b revised-five synthesis or resolution-index scope is invalid')
  }

  for (const resolution of resolutionIndex.resolutions) {
    if (
      resolution.groupId !== expectedBatchId
      || resolution.decision !== 'keep_current'
      || resolution.strictDescriptionComplete !== true
      || !resolution.resolutionPath
      || !resolution.resolutionDigest
    ) {
      throw new Error(`${resolution.goalId ?? '<unknown>'}: invalid strict B025b resolution entry`)
    }
    const resolutionRoot = repositoryPath(batchDirectory, 'batchDirectory')
    const resolutionPath = resolve(resolutionRoot, resolution.resolutionPath)
    const relativeResolutionPath = relative(resolutionRoot, resolutionPath)
    if (
      relativeResolutionPath === ''
      || relativeResolutionPath === '..'
      || relativeResolutionPath.startsWith(`..${sep}`)
    ) {
      throw new Error(`${resolution.goalId ?? '<unknown>'}: resolutionPath escapes the B025b batch`)
    }
    if (digest(readFileSync(resolutionPath)) !== resolution.resolutionDigest) {
      throw new Error(`${resolution.goalId ?? '<unknown>'}: resolution bytes disagree with the bound index`)
    }
  }

  const rounds = {
    first: parseJsonl(sourceBytes.roundARecords, roundARecordsPath),
    second: parseJsonl(sourceBytes.roundBRecords, roundBRecordsPath),
  }
  if (
    rounds.first.length !== goalIds.length
    || rounds.second.length !== goalIds.length
    || !sameOrdered(rounds.first.map(({ record }) => record.goalId), goalIds)
    || !sameOrdered(rounds.second.map(({ record }) => record.goalId), goalIds)
  ) {
    throw new Error('Physics B025b revised-five record scope or order is invalid')
  }

  const candidateGoals: CandidateSet['goals'] = goalIds.map((goalId) => {
    const definition = profileDefinitions.get(goalId)
    const summary = dualSummary.goals?.find((goal) => goal.goalId === goalId)
    const decision = synthesis.decisions?.find((item) => item.goalId === goalId)
    const selected = rounds.first.find(({ record }) => record.goalId === goalId)
    const alternate = rounds.second.find(({ record }) => record.goalId === goalId)
    if (!definition || !summary || !decision || !selected || !alternate) {
      throw new Error(`${goalId}: missing B025b evidence definition or bound source`)
    }
    if (
      summary.firstRecordId !== selected.record.recordId
      || summary.secondRecordId !== alternate.record.recordId
      || summary.firstRunId !== expectedRoundARunId
      || summary.secondRunId !== expectedRoundBRunId
      || summary.firstDecision !== 'keep'
      || summary.secondDecision !== 'keep'
      || summary.agreement !== 'disagreement'
      || summary.requiresSynthesis !== true
      || summary.automaticAcceptance !== false
      || decision.effectiveSemanticKind !== 'curricularAtomic'
      || decision.resolutionDecision !== 'keep_current'
      || decision.evidenceRound !== 'first'
      || decision.records?.first.recordId !== selected.record.recordId
      || decision.records.first.recordDigest !== selected.digest
      || decision.records?.second.recordId !== alternate.record.recordId
      || decision.records.second.recordDigest !== alternate.digest
    ) {
      throw new Error(`${goalId}: Round-A selection disagrees with B025b dual summary or synthesis`)
    }
    for (const [label, bound] of [['Round A', selected], ['Round B', alternate]] as const) {
      if (
        bound.record.decision !== 'keep'
        || bound.record.evidenceProfileContract !== 'positive-understanding-evidence-v2'
        || bound.record.evidenceProfileRecommendation !== 'create'
        || bound.record.recordStatus !== 'candidate'
        || bound.record.reviewAuthority !== 'ai_candidate'
      ) {
        throw new Error(`${goalId}: ${label} is not a valid KEEP/create V2 AI candidate`)
      }
    }
    if (
      definition.variationAxes.length !== 3
      || definition.applicationCaseBriefs.length !== 2
      || definition.additionalExpectation.id === 'selected-round-a-core'
    ) {
      throw new Error(`${goalId}: profile must contain one additional expectation, three axes, and two cases`)
    }

    const reviewedCore = {
      id: 'selected-round-a-core',
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
    return {
      goalId,
      reason: `DE: ${definition.selectionReasonDe} Der Kernblock wird bytegetreu aus ${selected.record.recordId} übernommen. Round-A-Transferbasis: ${selected.record.understandingEvidence.transferExpectationDe} EN: ${definition.selectionReasonEn} The core block is carried byte-for-byte from ${selected.record.recordId}. Round A transfer basis: ${selected.record.understandingEvidence.transferExpectationEn}`,
      evidenceLevel: 'E1',
      maximumClaimScope: 'G1',
      dissent: [
        `B025b independent-confirmation binding: selected Round A ${selected.record.recordId} (${selected.digest}); confirming Round B ${alternate.record.recordId} (${alternate.digest}); synthesis ${digest(sourceBytes.synthesis)}; resolution index ${digest(sourceBytes.resolutionIndex)}. Round B remains preserved as independent confirmation of KEEP/create while the synthesis selects evidenceRound=first.`,
      ],
      profile,
    }
  })

  const config: PositiveGoalEvidenceReviewConfig = {
    $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
    schemaVersion: 2,
    reviewId: targetReviewId,
    goalFingerprintRuleVersion: 'goal-evidence-v1',
    profileRuleVersion: 'positive-understanding-evidence-v2',
    landscapeId: '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a',
    landscapePath: canonicalPath,
    semanticKindLedgerPath,
    reviewCriteriaPath: criteriaPath,
    reviewPath,
    reviewRunManifestPaths: [],
    reviewedResourceTypes: [],
    requireApproved: false,
    scope: {
      label: 'Canonical Physics positive understanding-evidence rollout v1 B025b: five revised E-phase mechanics and energy goals',
      goalIds: [...goalIds],
    },
  }
  const candidates: CandidateSet = {
    schemaVersion: 1,
    authoringContract: 'positive-understanding-evidence-candidates-v1',
    reviewId: targetReviewId,
    reviewedAt,
    reviewer,
    goals: candidateGoals,
  }
  const reviewRecords = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet: candidates })
  if (reviewRecords.length !== goalIds.length) {
    throw new Error(`Candidate materializer returned ${reviewRecords.length}, expected ${goalIds.length}`)
  }

  const plannedOutputs: PlannedOutput[] = [
    { path: configPath, bytes: jsonBytes(config) },
    { path: candidatesPath, bytes: jsonBytes(candidates) },
    {
      path: reviewPath,
      bytes: Buffer.from(`${reviewRecords.map((record) => JSON.stringify(record)).join('\n')}\n`),
    },
  ]
  if (plannedOutputs.length !== 3 || new Set(plannedOutputs.map(({ path }) => path)).size !== 3) {
    throw new Error('Physics B025b evidence plan must contain exactly three distinct outputs')
  }
  const states = plannedOutputs.map(classifyOutput)
  const allAbsent = states.every((state) => state === 'absent')
  const allExactAfter = states.every((state) => state === 'exact-after')
  if (!allAbsent && !allExactAfter) {
    throw new Error(`No-clobber refusal: partial output set (${states.join(', ')})`)
  }
  if (!writeMode && !allExactAfter) {
    throw new Error('Missing exact-after Physics B025b evidence artifacts; rerun once with --write')
  }
  if (writeMode && allAbsent) {
    for (const output of plannedOutputs) {
      const absolutePath = repositoryPath(output.path, 'output')
      const parent = dirname(absolutePath)
      const parentStat = lstatSync(parent)
      if (!parentStat.isDirectory() || parentStat.isSymbolicLink()) {
        throw new Error(`Output parent is not a regular directory: ${relative(repositoryRoot, parent)}`)
      }
      writeFileSync(absolutePath, output.bytes, { flag: 'wx' })
    }
  }
  for (const output of plannedOutputs) {
    const actual = readFileSync(repositoryPath(output.path, 'output'))
    if (!actual.equals(output.bytes)) throw new Error(`Exact-after verification failed: ${output.path}`)
  }

  const planDigest = digest(jsonBytes(plannedOutputs.map((output) => ({
    path: output.path,
    digest: digest(output.bytes),
  }))))
  console.log(
    `${writeMode && allAbsent ? 'Materialized' : 'Verified'} Physics B025b revised-five evidence artifacts: `
      + `${reviewRecords.length}/${goalIds.length}; outputs=3; plan=${planDigest}`,
  )
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
