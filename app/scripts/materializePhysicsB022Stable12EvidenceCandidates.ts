import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PositiveGoalEvidenceProfile } from './positiveGoalEvidenceProfileModel'

type ReviewRecord = {
  recordId: string
  goalId: string
  decision: 'keep' | 'revise' | 'split_review' | 'block'
  proposedDescriptionDe?: string
  proposedDescriptionEn?: string
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

type ProfileDefinition = {
  archetype: PositiveGoalEvidenceProfile['archetype']
  selectionReasonDe: string
  selectionReasonEn: string
  additionalExpectations: PositiveGoalEvidenceProfile['expectations']
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

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const write = process.argv.includes('--write')
const batchDirectory = resolve(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-28/'
    + 'batch-022-astrophysics-current-20-v1',
)
const roundAPath = resolve(
  batchDirectory,
  'round-a/results/'
    + 'physik-rollout-v1-batch-022-astrophysics-current-20-v1-20260828-first-pass-a.batch-001.records.jsonl',
)
const roundBPath = resolve(
  batchDirectory,
  'round-b/results/'
    + 'physik-rollout-v1-batch-022-astrophysics-current-20-v1-20260828-first-pass-b.batch-001.records.jsonl',
)
const dualSummaryPath = resolve(batchDirectory, 'dual-summary.json')
const adjudicationPath = resolve(batchDirectory, 'third-adjudication/adjudication.json')
const synthesisManifestPath = resolve(
  batchDirectory,
  'synthesis-decisions.stable-current-carryover-12-v1.json',
)
const targetPath = resolve(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-evidence/'
    + 'canonical-physics-positive-understanding-evidence-rollout-v1-'
    + 'batch-022-astrophysics-stable12-current-v1.candidates.json',
)

const expectedRoundADigest = 'a5f7241856c10b169790ac203e446566113fc870e11b0119c6f2bb24fcf243da'
const expectedRoundBDigest = 'efc56ac825f5783e539a211e298c0a7463519abce5f608ab199150a684919353'
const expectedDualSummaryDigest = 'e9759f734266db617d93f7ddfe9998053757f63ee518843c7a2d11b3a725e7d4'
const expectedAdjudicationDigest = '2515d1f450ec081d16e4a52d1d005c4f6b7f288dd387f04392671ff1b1d16694'
const expectedSynthesisManifestDigest = '5adda323d5751ba1cb29317a73ba4bc14c0bb12f2f1172d3a2c1c66fbd49c733'
const targetReviewId = 'canonical-physics-positive-evidence-v1-b022-astrophysics-stable12-v1'

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

const selectedRoundAndRecordByGoalId = new Map<string, {
  round: 'first' | 'second'
  recordId: string
}>([
  ['6d18104b-5704-5c45-b39a-2c84565b1796', { round: 'first', recordId: 'physik-b022-round-a-a-001' }],
  ['982df2f3-e040-5f4b-b668-0fe05d994b29', { round: 'second', recordId: 'physik-b022-b-002' }],
  ['9f85de48-1b3f-5afb-8a34-ce94cf7a1b49', { round: 'first', recordId: 'physik-b022-round-a-a-006' }],
  ['ce037050-f94c-5828-883a-76385c84d1f7', { round: 'first', recordId: 'physik-b022-round-a-a-007' }],
  ['5c5d6698-c056-5850-8ecd-6dd87fb44549', { round: 'first', recordId: 'physik-b022-round-a-a-008' }],
  ['f9c025ce-4327-5de7-8288-a3358e14a576', { round: 'second', recordId: 'physik-b022-b-009' }],
  ['89124b92-5769-5e13-8a5d-78497936260f', { round: 'second', recordId: 'physik-b022-b-010' }],
  ['4e823349-b60c-5d2a-b96f-d3f23ae50e3a', { round: 'second', recordId: 'physik-b022-b-013' }],
  ['826af579-3e51-5ac9-bc2a-208d8a2fc99e', { round: 'first', recordId: 'physik-b022-round-a-a-015' }],
  ['09995ab9-86aa-5b02-8a58-62b16a37831d', { round: 'second', recordId: 'physik-b022-b-017' }],
  ['e2014db8-c97f-5ce1-82c5-2a42741f4a61', { round: 'first', recordId: 'physik-b022-round-a-a-018' }],
  ['6ae54ff9-dc3b-563b-b2ee-09a0f0d00162', { round: 'first', recordId: 'physik-b022-round-a-a-019' }],
])

const profileDefinitions = new Map<string, ProfileDefinition>([
  ['6d18104b-5704-5c45-b39a-2c84565b1796', {
    archetype: 'data',
    selectionReasonDe: 'Round A bindet Beobachtung, Theorie, Weltbildwechsel und kriteriengeleitete Wirkungsreflexion als vollständige Evidenzkette.',
    selectionReasonEn: 'Round A binds observation, theory, worldview change, and criteria-based reflection on impact as a complete evidence chain.',
    additionalExpectations: [{
      id: 'evidence-reception-and-impact',
      essentialUnderstandingDe: 'Wissenschaftliche Evidenz und Theorieentwicklung sind von ihrer historischen oder gesellschaftlichen Aufnahme zu unterscheiden; gesellschaftliche Wirkung beweist weder die fachliche Richtigkeit noch widerlegt sie diese.',
      essentialUnderstandingEn: 'Scientific evidence and theory development must be distinguished from their historical or social reception; social impact neither proves nor disproves scientific correctness.',
      observablePerformanceDe: 'Die lernende Person kennzeichnet in Quellen getrennt Beobachtungsbefund, physikalische Deutung, ältere Annahme, Rezeptionskontext und belegte Wirkung und begründet Zusammenhänge ohne zeitliche Abfolge mit Kausalität gleichzusetzen.',
      observablePerformanceEn: 'In source material, the learner separately identifies observational findings, physical interpretation, the earlier assumption, reception context, and documented impact and justifies connections without equating chronology with causation.',
    }],
    variationAxes: [
      { id: 'worldview-transition', textDe: 'Heliozentrischer Wandel, newtonsche Synthese oder expandierendes Universum', textEn: 'Heliocentric transition, Newtonian synthesis, or expanding universe' },
      { id: 'evidence-type', textDe: 'Beobachtung, Messreihe, mathematisches Modell oder physikalische Theorie', textEn: 'Observation, measurement series, mathematical model, or physical theory' },
      { id: 'reception-context', textDe: 'Unterschiedliche historische Institutionen, Kommunikationswege und gesellschaftliche Folgen', textEn: 'Different historical institutions, communication channels, and social consequences' },
    ],
    applicationCaseBriefs: [
      {
        id: 'heliocentric-evidence-chain',
        taskDemandDe: 'Ordne Quellen zu Planetenbeobachtungen, heliozentrischen Bahnmodellen und ihrer historischen Aufnahme. Rekonstruiere, welche Beobachtung welche ältere Annahme belastete, welche Theorie die Befunde erklärte und welche fachlichen und gesellschaftlichen Wirkungen belegt sind.',
        taskDemandEn: 'Classify sources on planetary observations, heliocentric orbital models, and their historical reception. Reconstruct which observation challenged which earlier assumption, which theory explained the findings, and which scientific and social impacts are documented.',
        expectedPerformanceDe: 'Die lernende Person erstellt eine belegte Kette, trennt Beobachtung, Erklärung und Rezeption und begrenzt Wirkungsbehauptungen auf die Quellen.',
        expectedPerformanceEn: 'The learner constructs a documented chain, distinguishes observation, explanation, and reception, and limits claims about impact to the sources.',
        understandingFocusDe: 'Der Fall verhindert eine bloße Namens- oder Datenchronologie ohne physikalische Kausalstruktur.',
        understandingFocusEn: 'The case prevents a mere chronology of names or dates without a physical causal structure.',
      },
      {
        id: 'expanding-universe-transfer',
        taskDemandDe: 'Untersuche einen anderen Wandel vom statischen zum expandierenden Universum anhand bereitgestellter Beobachtungs- und Theoriequellen. Vergleiche Evidenzrollen und Rezeptionsbedingungen mit dem ersten Fall.',
        taskDemandEn: 'Examine a different transition from a static to an expanding universe using supplied observational and theoretical sources. Compare the roles of evidence and conditions of reception with the first case.',
        expectedPerformanceDe: 'Die lernende Person überträgt das Raster, benennt veränderte Evidenz und Theorie und erklärt Gemeinsamkeiten und Unterschiede der Aufnahme ohne schematische Gleichsetzung.',
        expectedPerformanceEn: 'The learner transfers the framework, identifies changed evidence and theory, and explains similarities and differences in reception without treating the cases as identical.',
        understandingFocusDe: 'Der Transfer prüft das allgemeine Verständnis von Weltbildwechseln an einer anderen Evidenzart.',
        understandingFocusEn: 'The transfer tests general understanding of worldview change with a different type of evidence.',
      },
    ],
  }],
  ['982df2f3-e040-5f4b-b668-0fe05d994b29', {
    archetype: 'data',
    selectionReasonDe: 'Round B ergänzt die Klassifikation um unvollständige Daten, entscheidende Folgemessungen und revisionsfähige Schlüsse.',
    selectionReasonEn: 'Round B extends classification to incomplete data, decisive follow-up measurements, and revisable conclusions.',
    additionalExpectations: [{
      id: 'criteria-and-provisional-inference',
      essentialUnderstandingDe: 'Eine Klassifikation ist eine begründete, kriteriumsabhängige Schlussfolgerung und kann bei fehlenden oder widersprüchlichen Daten nur vorläufig sein; die entscheidende Zusatzmessung hängt vom konkreten Grenzfall ab.',
      essentialUnderstandingEn: 'A classification is a justified, criteria-dependent inference and may be only provisional when data are missing or conflicting; the decisive additional measurement depends on the particular boundary case.',
      observablePerformanceDe: 'Die lernende Person legt Kriterien und Datenqualität offen, markiert konkurrierende Zuordnungen, nennt eine entscheidende Zusatzmessung und zeigt, wie deren mögliche Ergebnisse die Klassifikation ändern würden.',
      observablePerformanceEn: 'The learner states the criteria and data quality, identifies competing assignments, names a decisive additional measurement, and shows how its possible outcomes would change the classification.',
    }],
    variationAxes: [
      { id: 'body-class', textDe: 'Planet, Zwergplanet, Mond, Asteroid oder Komet', textEn: 'Planet, dwarf planet, moon, asteroid, or comet' },
      { id: 'data-completeness', textDe: 'Vollständige Messwerte, Unsicherheitsintervalle oder fehlende Schlüsselgröße', textEn: 'Complete measurements, uncertainty intervals, or a missing key quantity' },
      { id: 'criterion-set', textDe: 'Zusammensetzung, Masse, Gestalt und Bahnmerkmale mit offengelegter Gewichtung', textEn: 'Composition, mass, shape, and orbital features with explicit weighting' },
    ],
    applicationCaseBriefs: [
      {
        id: 'solar-system-comparison-table',
        taskDemandDe: 'Klassifiziere mehrere Körper aus einer Tabelle mit Masse, Dichte, Gestalt, Bahn und dynamischer Umgebung. Lege das Kriteriensystem vor der Zuordnung fest und begründe einen Grenzfall.',
        taskDemandEn: 'Classify several bodies from a table of mass, density, shape, orbit, and dynamical environment. State the criterion system before assigning classes and justify one boundary case.',
        expectedPerformanceDe: 'Die lernende Person verwendet mehrere relevante Merkmale, belegt jede Zuordnung mit Daten und kennzeichnet, wo eine Klasse von der gewählten Definition abhängt.',
        expectedPerformanceEn: 'The learner uses several relevant features, supports every assignment with data, and identifies where a class depends on the chosen definition.',
        understandingFocusDe: 'Die Klassifikation wird als transparente Inferenz statt als Etikettenabfrage sichtbar.',
        understandingFocusEn: 'Classification becomes a transparent inference rather than label recall.',
      },
      {
        id: 'new-object-missing-data',
        taskDemandDe: 'Für ein neu beschriebenes Objekt fehlen Dichte und ein Teil der Bahndaten. Formuliere eine vorläufige Klassifikation, wähle die entscheidende Folgemessung und gib für zwei mögliche Messergebnisse an, wie sich der Schluss ändert.',
        taskDemandEn: 'Density and part of the orbital data are missing for a newly described object. Formulate a provisional classification, select the decisive follow-up measurement, and state how two possible results would change the conclusion.',
        expectedPerformanceDe: 'Die lernende Person begrenzt die Sicherheit, priorisiert eine inhaltlich entscheidende Messung und revidiert den Schluss konditional.',
        expectedPerformanceEn: 'The learner limits confidence, prioritizes a substantively decisive measurement, and revises the conclusion conditionally.',
        understandingFocusDe: 'Der Transfer prüft den Umgang mit Grenzfällen und Evidenzlücken.',
        understandingFocusEn: 'The transfer tests handling of boundary cases and evidence gaps.',
      },
    ],
  }],
  ['9f85de48-1b3f-5afb-8a34-ce94cf7a1b49', {
    archetype: 'data',
    selectionReasonDe: 'Round A trennt Tangential- und Radialkomponente und verbindet Einheiten, Unsicherheit und Reichweitenurteil am vollständigsten.',
    selectionReasonEn: 'Round A most fully distinguishes tangential and radial components and connects units, uncertainty, and range judgment.',
    additionalExpectations: [{
      id: 'geometry-components-and-uncertainty',
      essentialUnderstandingDe: 'Parallaxe erschließt Entfernung über eine Beobachtungsgeometrie, Eigenbewegung ist eine Winkelrate und liefert erst zusammen mit der Entfernung die quer zur Sichtlinie liegende Geschwindigkeit; die relative Entfernungsunsicherheit wächst bei kleiner Parallaxe stark.',
      essentialUnderstandingEn: 'Parallax infers distance through an observational geometry, proper motion is an angular rate, and only together with distance yields velocity transverse to the line of sight; relative distance uncertainty grows strongly for small parallax.',
      observablePerformanceDe: 'Die lernende Person dokumentiert Winkel-, Zeit- und Entfernungseinheiten, propagiert bereitgestellte Unsicherheiten, trennt Tangential- von Radialgeschwindigkeit und entscheidet, ob das Ergebnis noch belastbar ist.',
      observablePerformanceEn: 'The learner documents angular, time, and distance units, propagates supplied uncertainties, distinguishes tangential from radial velocity, and decides whether the result remains reliable.',
    }],
    variationAxes: [
      { id: 'parallax-scale', textDe: 'Große sichere oder kleine unsichere Parallaxe', textEn: 'Large well-measured or small uncertain parallax' },
      { id: 'proper-motion-direction', textDe: 'Unterschiedliche Winkelraten und Richtungen am Himmel', textEn: 'Different angular rates and directions on the sky' },
      { id: 'measurement-quality', textDe: 'Veränderte Parallaxen- oder Eigenbewegungsunsicherheit', textEn: 'Changed parallax or proper-motion uncertainty' },
    ],
    applicationCaseBriefs: [
      {
        id: 'nearby-star-astrometry',
        taskDemandDe: 'Bestimme aus Parallaxe, Eigenbewegung und ihren Unsicherheiten Entfernung und Tangentialgeschwindigkeit eines nahen Sterns. Erkläre die Messgeometrie und trenne das Ergebnis von einer zusätzlich gegebenen Radialgeschwindigkeit.',
        taskDemandEn: 'Use parallax, proper motion, and their uncertainties to determine the distance and tangential velocity of a nearby star. Explain the measurement geometry and distinguish the result from an additionally supplied radial velocity.',
        expectedPerformanceDe: 'Die lernende Person rechnet mit konsistenten Einheiten, gibt eine Unsicherheitsbewertung und benennt die geometrisch verschiedenen Geschwindigkeitskomponenten.',
        expectedPerformanceEn: 'The learner uses consistent units, provides an uncertainty assessment, and identifies the geometrically distinct velocity components.',
        understandingFocusDe: 'Der Fall prüft die komplette astrometrische Inferenz statt isolierter Formelwerte.',
        understandingFocusEn: 'The case tests the complete astrometric inference rather than isolated formula values.',
      },
      {
        id: 'small-parallax-range-limit',
        taskDemandDe: 'Analysiere denselben Beobachtungstyp für einen Stern mit deutlich kleinerer Parallaxe und veränderter Eigenbewegungsgenauigkeit. Sage die Unsicherheitswirkung vor der Rechnung voraus und beurteile die Reichweite der Methode.',
        taskDemandEn: 'Analyze the same observation type for a star with a much smaller parallax and changed proper-motion precision. Predict the uncertainty effect before calculating and assess the method range.',
        expectedPerformanceDe: 'Die lernende Person erkennt die nicht symmetrische Empfindlichkeit der inversen Entfernungsbeziehung und begrenzt Entfernung und Geschwindigkeit entsprechend.',
        expectedPerformanceEn: 'The learner recognizes the sensitivity of the inverse distance relation and bounds the distance and velocity accordingly.',
        understandingFocusDe: 'Der Transfer prüft Unsicherheits- und Gültigkeitsverständnis bei veränderter Messqualität.',
        understandingFocusEn: 'The transfer tests uncertainty and validity understanding under changed measurement quality.',
      },
    ],
  }],
  ['ce037050-f94c-5828-883a-76385c84d1f7', {
    archetype: 'data',
    selectionReasonDe: 'Round A bindet Linienidentifikation, Näherung, Bezugssystem, Vorzeichen und instrumentell begründete Unsicherheit besonders vollständig.',
    selectionReasonEn: 'Round A especially fully binds line identification, approximation, reference frame, sign convention, and instrument-based uncertainty.',
    additionalExpectations: [{
      id: 'line-shift-frame-and-validity',
      essentialUnderstandingDe: 'Eine Dopplerverschiebung liefert nur die Geschwindigkeitskomponente entlang der Sichtlinie; Richtung und Vorzeichen hängen von Konvention und Bezugssystem ab, und die verwendete Näherung sowie spektrale Auflösung begrenzen den Schluss.',
      essentialUnderstandingEn: 'A Doppler shift yields only the velocity component along the line of sight; direction and sign depend on convention and reference frame, and the approximation and spectral resolution limit the inference.',
      observablePerformanceDe: 'Die lernende Person identifiziert Ruhe- und Messlinie, begründet die Näherung, nennt Bezugssystem und Vorzeichenkonvention und leitet aus Linienbreite, Kalibrierung oder Auflösung eine Unsicherheit ab.',
      observablePerformanceEn: 'The learner identifies rest and measured lines, justifies the approximation, states the reference frame and sign convention, and derives an uncertainty from line width, calibration, or resolution.',
    }],
    variationAxes: [
      { id: 'shift-direction', textDe: 'Rot-, Blau- oder innerhalb der Auflösung nicht signifikante Verschiebung', textEn: 'Redshift, blueshift, or a shift not significant within resolution' },
      { id: 'spectral-evidence', textDe: 'Einzelne identifizierte Linie oder mehrere unterschiedlich präzise Linien', textEn: 'One identified line or several lines of differing precision' },
      { id: 'reference-frame', textDe: 'Beobachter-, System- oder anders korrigiertes Bezugssystem', textEn: 'Observer, system, or another corrected reference frame' },
    ],
    applicationCaseBriefs: [
      {
        id: 'single-line-radial-velocity',
        taskDemandDe: 'Bestimme aus Ruhe- und Messwellenlänge einer sicher identifizierten Linie Richtung und Betrag der Radialgeschwindigkeit. Lege Konvention und Bezugssystem fest und schätze die Unsicherheit aus der Auflösung.',
        taskDemandEn: 'Use the rest and measured wavelength of a securely identified line to determine the direction and magnitude of radial velocity. State the convention and reference frame and estimate uncertainty from resolution.',
        expectedPerformanceDe: 'Die lernende Person verwendet die passende Näherung, führt Einheiten und Vorzeichen konsistent und beschränkt die Aussage auf die Sichtlinienkomponente.',
        expectedPerformanceEn: 'The learner uses the appropriate approximation, handles units and sign consistently, and limits the claim to the line-of-sight component.',
        understandingFocusDe: 'Der Fall verbindet Messwert, Modell, Richtung und Unsicherheit.',
        understandingFocusEn: 'The case connects measurement, model, direction, and uncertainty.',
      },
      {
        id: 'multi-line-opposite-shift',
        taskDemandDe: 'Werte ein neues Spektrum mit entgegengesetzter Verschiebung und drei Linien unterschiedlicher Breite aus. Begründe Linienauswahl und gewichtete Gesamtaussage und erkläre, warum daraus keine Gesamtgeschwindigkeit folgt.',
        taskDemandEn: 'Analyze a fresh spectrum with the opposite shift and three lines of different widths. Justify line selection and the combined inference and explain why it does not give total velocity.',
        expectedPerformanceDe: 'Die lernende Person passt die Richtung an, gewichtet präzisere Linien stärker, benennt systematische Grenzen und trennt Radial- von Gesamtbewegung.',
        expectedPerformanceEn: 'The learner adapts the direction, gives greater weight to more precise lines, states systematic limits, and distinguishes radial from total motion.',
        understandingFocusDe: 'Der Transfer deckt starre Rot-/Blau-Regeln und unkritische Mittelung auf.',
        understandingFocusEn: 'The transfer exposes rigid red/blue rules and uncritical averaging.',
      },
    ],
  }],
  ['5c5d6698-c056-5850-8ecd-6dd87fb44549', {
    archetype: 'data',
    selectionReasonDe: 'Round A verbindet Linienmuster und relative Stärken am präzisesten mit Anregung, Ionisation, Temperatur und begrenzter Klassifikationssicherheit.',
    selectionReasonEn: 'Round A most precisely connects line patterns and relative strengths with excitation, ionization, temperature, and bounded classification confidence.',
    additionalExpectations: [{
      id: 'pattern-temperature-and-confidence',
      essentialUnderstandingDe: 'Spektralklassen beruhen auf Mustern und relativen Linienstärken, deren Temperaturabhängigkeit über Anregungs- und Ionisationszustände vermittelt ist; das bloße Vorhandensein einer Linie beweist weder eine Klasse noch direkt die Häufigkeit eines Elements.',
      essentialUnderstandingEn: 'Spectral classes depend on patterns and relative line strengths whose temperature dependence is mediated by excitation and ionization states; the mere presence of a line proves neither a class nor directly the abundance of an element.',
      observablePerformanceDe: 'Die lernende Person gewichtet mehrere diagnostische Merkmale, ordnet Klasse und Temperaturbereich zu und gibt bei Rauschen, Verbreiterung oder widersprüchlichen Merkmalen nur die tragfähige Genauigkeit an.',
      observablePerformanceEn: 'The learner weighs several diagnostic features, assigns a class and temperature range, and reports only defensible precision under noise, broadening, or conflicting features.',
    }],
    variationAxes: [
      { id: 'line-pattern', textDe: 'Unterschiedliche dominante Linien und relative Linienstärken', textEn: 'Different dominant lines and relative line strengths' },
      { id: 'data-quality', textDe: 'Hohes Signal, Rauschen, fehlende Bereiche oder Linienverbreiterung', textEn: 'High signal, noise, missing regions, or line broadening' },
      { id: 'class-boundary', textDe: 'Typischer Vertreter oder Grenzfall benachbarter Spektralklassen', textEn: 'Typical representative or boundary case between adjacent spectral classes' },
    ],
    applicationCaseBriefs: [
      {
        id: 'unknown-spectrum-reference-match',
        taskDemandDe: 'Vergleiche ein unbekanntes Sternspektrum mit mehreren Referenzspektren. Benenne diagnostische Linien und relative Stärken, ordne Klasse und Temperaturbereich zu und begründe die Zuordnung.',
        taskDemandEn: 'Compare an unknown stellar spectrum with several reference spectra. Identify diagnostic lines and relative strengths, assign a class and temperature range, and justify the assignment.',
        expectedPerformanceDe: 'Die lernende Person verwendet ein Muster mehrerer Merkmale und erklärt die Temperaturabhängigkeit, statt nur eine Linie wiederzuerkennen.',
        expectedPerformanceEn: 'The learner uses a pattern of several features and explains the temperature dependence rather than recognizing only one line.',
        understandingFocusDe: 'Der Fall prüft datengetragene Klassifikation und physikalische Begründung gemeinsam.',
        understandingFocusEn: 'The case jointly tests data-based classification and physical justification.',
      },
      {
        id: 'noisy-boundary-spectrum',
        taskDemandDe: 'Klassifiziere ein verrauschtes, linienverbreitertes Spektrum nahe einer Klassengrenze. Wähle robuste Merkmale neu und entscheide, ob eine Einzelklasse oder nur ein Bereich vertretbar ist.',
        taskDemandEn: 'Classify a noisy, broadened spectrum near a class boundary. Reselect robust features and decide whether one class or only a range is defensible.',
        expectedPerformanceDe: 'Die lernende Person kennzeichnet unsichere Merkmale, gewichtet robuste Linien und fordert gegebenenfalls gezielte zusätzliche Spektraldaten.',
        expectedPerformanceEn: 'The learner identifies uncertain features, weighs robust lines, and requests targeted additional spectral data when needed.',
        understandingFocusDe: 'Der Transfer prüft, ob das Kriterienmodell bei veränderter Datenqualität trägt.',
        understandingFocusEn: 'The transfer tests whether the criterion model holds under changed data quality.',
      },
    ],
  }],
  ['f9c025ce-4327-5de7-8288-a3358e14a576', {
    archetype: 'representation',
    selectionReasonDe: 'Round B rekonstruiert den Strahlungsweg, trennt Linienlage von Linienstärke und verlangt Vorhersagen aus einem anderen Energieniveauschema.',
    selectionReasonEn: 'Round B reconstructs the radiation path, distinguishes line position from line strength, and requires predictions from a different energy-level scheme.',
    additionalExpectations: [{
      id: 'transition-position-versus-strength',
      essentialUnderstandingDe: 'Energiedifferenzen bestimmen mögliche Linienwellenlängen, während Temperatur, Anregung, Ionisation und Besetzung vor allem die beobachtbare Linienstärke beeinflussen; eine veränderte Stärke verschiebt die Übergangsenergie nicht beliebig.',
      essentialUnderstandingEn: 'Energy differences determine possible line wavelengths, while temperature, excitation, ionization, and level populations mainly affect observed line strength; a changed strength does not arbitrarily shift the transition energy.',
      observablePerformanceDe: 'Die lernende Person übersetzt zwischen Energieniveauschema und Spektrallinien, erklärt den Strahlungsweg durch kühlere Atmosphärenschichten und trennt Vorhersagen zu Linienlage und -stärke.',
      observablePerformanceEn: 'The learner translates between an energy-level diagram and spectral lines, explains the radiation path through cooler atmospheric layers, and distinguishes predictions about line position and strength.',
    }],
    variationAxes: [
      { id: 'atomic-system', textDe: 'Anderes Atom oder Ion mit anderem Energieniveauschema', textEn: 'Different atom or ion with a different energy-level scheme' },
      { id: 'atmosphere-state', textDe: 'Veränderte Temperatur, Anregung oder Ionisation', textEn: 'Changed temperature, excitation, or ionization' },
      { id: 'representation-direction', textDe: 'Vom Spektrum zum Niveauübergang oder vom Niveauschema zur Linienvorhersage', textEn: 'From spectrum to level transition or from level diagram to line prediction' },
    ],
    applicationCaseBriefs: [
      {
        id: 'stellar-absorption-path',
        taskDemandDe: 'Ordne Intensitätsminima eines Sternspektrums Übergängen in einem Energieniveauschema zu und erkläre den Weg des kontinuierlichen Lichts aus heißeren Schichten durch eine kühlere Atmosphäre.',
        taskDemandEn: 'Match intensity minima in a stellar spectrum to transitions in an energy-level diagram and explain the path of continuum light from hotter layers through a cooler atmosphere.',
        expectedPerformanceDe: 'Die lernende Person berechnet oder vergleicht passende Energiedifferenzen und begründet, warum die Merkmale Absorption statt fehlender kontinuierlicher Emission anzeigen.',
        expectedPerformanceEn: 'The learner calculates or compares matching energy differences and justifies why the features indicate absorption rather than absent continuum emission.',
        understandingFocusDe: 'Der Fall verbindet beobachtetes Spektrum, Strahlungsweg und Modellrepräsentation.',
        understandingFocusEn: 'The case connects the observed spectrum, radiation path, and model representation.',
      },
      {
        id: 'new-ion-line-prediction',
        taskDemandDe: 'Sage aus einem neuen Energieniveauschema mögliche Absorptionslinien voraus. Beurteile danach, wie eine geänderte Temperatur oder Ionisation die Stärken, aber nicht beliebig die Linienlagen verändert.',
        taskDemandEn: 'Predict possible absorption lines from a new energy-level diagram. Then assess how changed temperature or ionization affects strengths but does not arbitrarily change line positions.',
        expectedPerformanceDe: 'Die lernende Person konstruiert Übergänge konsistent und trennt Energiedifferenz von Besetzungswahrscheinlichkeit.',
        expectedPerformanceEn: 'The learner constructs transitions consistently and distinguishes energy difference from population probability.',
        understandingFocusDe: 'Der Transfer deckt das bloße Zuordnen eines auswendig gelernten Linienmusters auf.',
        understandingFocusEn: 'The transfer exposes mere matching of a memorized line pattern.',
      },
    ],
  }],
  ['89124b92-5769-5e13-8a5d-78497936260f', {
    archetype: 'modeling',
    selectionReasonDe: 'Round B bindet thermische Modellannahme, Kugeloberfläche, Methodenvergleich und die Entscheidung bei unsicherem Radius oder nichtthermischem Spektrum.',
    selectionReasonEn: 'Round B binds the thermal-model assumption, spherical area, method comparison, and the decision under uncertain radius or a non-thermal spectrum.',
    additionalExpectations: [{
      id: 'law-selection-model-and-uncertainty',
      essentialUnderstandingDe: 'Wien und Stefan-Boltzmann erschließen unter dem thermischen Strahlungsmodell dieselbe effektive Oberflächentemperatur aus verschiedenen Messgrößen; Radiusunsicherheit, Spektralabweichung und Modellannahmen beeinflussen die Belastbarkeit unterschiedlich.',
      essentialUnderstandingEn: 'Under the thermal-radiation model, Wien and Stefan-Boltzmann infer the same effective surface temperature from different measurements; radius uncertainty, spectral departure, and model assumptions affect reliability differently.',
      observablePerformanceDe: 'Die lernende Person wählt anhand der Daten das passende Gesetz, verwendet beim Leistungsweg die abstrahlende Kugeloberfläche, führt Einheiten und Unsicherheit und vergleicht beide Wege, wenn genügend Daten vorliegen.',
      observablePerformanceEn: 'The learner selects the appropriate law from the data, uses the emitting spherical area in the luminosity route, handles units and uncertainty, and compares both routes when enough data are available.',
    }],
    variationAxes: [
      { id: 'available-data', textDe: 'Spektralmaximum oder Strahlungsleistung plus Radius', textEn: 'Spectral peak or luminosity plus radius' },
      { id: 'model-regime', textDe: 'Annähernd thermisches oder deutlich abweichendes Spektrum', textEn: 'Approximately thermal or substantially non-thermal spectrum' },
      { id: 'uncertainty-source', textDe: 'Unsicherheit des Maximums, der Leistung oder des Radius', textEn: 'Uncertainty in the peak, luminosity, or radius' },
    ],
    applicationCaseBriefs: [
      {
        id: 'wien-peak-estimate',
        taskDemandDe: 'Schätze aus einem Spektralmaximum mit Messunsicherheit die effektive Oberflächentemperatur. Begründe das thermische Modell und prüfe Größenordnung und Unsicherheit.',
        taskDemandEn: 'Estimate effective surface temperature from a spectral peak with measurement uncertainty. Justify the thermal model and check order of magnitude and uncertainty.',
        expectedPerformanceDe: 'Die lernende Person wählt Wien, führt Wellenlängen- und Temperatureinheiten konsistent und begrenzt die Aussage bei einem breiten oder verzerrten Maximum.',
        expectedPerformanceEn: 'The learner selects Wien, handles wavelength and temperature units consistently, and limits the claim for a broad or distorted peak.',
        understandingFocusDe: 'Der Fall prüft Modellwahl und unsicherheitsbewusste Inferenz aus Spektraldaten.',
        understandingFocusEn: 'The case tests model choice and uncertainty-aware inference from spectral data.',
      },
      {
        id: 'luminosity-radius-crosscheck',
        taskDemandDe: 'Bestimme aus Strahlungsleistung und Radius die Temperatur eines anderen Sterns und vergleiche sie mit einer unabhängigen Wien-Schätzung. Entscheide bei unsicherem Radius oder Spektralabweichung, welcher Weg belastbarer ist.',
        taskDemandEn: 'Determine the temperature of another star from luminosity and radius and compare it with an independent Wien estimate. Under uncertain radius or spectral departure, decide which route is more reliable.',
        expectedPerformanceDe: 'Die lernende Person verwendet 4πR², dokumentiert Annahmen, vergleicht Ergebnisse und erklärt Richtung und Ursache einer möglichen Verzerrung.',
        expectedPerformanceEn: 'The learner uses 4πR², documents assumptions, compares results, and explains the direction and cause of possible bias.',
        understandingFocusDe: 'Der Transfer trennt alternative Datenwege und ihre unterschiedlichen Modellgrenzen.',
        understandingFocusEn: 'The transfer distinguishes alternative data routes and their different model limits.',
      },
    ],
  }],
  ['4e823349-b60c-5d2a-b96f-d3f23ae50e3a', {
    archetype: 'data',
    selectionReasonDe: 'Round B unterscheidet Sonnenflecken als Aktivitätsindikatoren statt Ursachen und begrenzt physikalisch begründete Warnungen gegenüber sicheren Vorhersagen.',
    selectionReasonEn: 'Round B distinguishes sunspots as activity indicators rather than causes and limits physically grounded warnings relative to certain predictions.',
    additionalExpectations: [{
      id: 'indicator-mechanism-warning-limit',
      essentialUnderstandingDe: 'Sonnenflecken kennzeichnen magnetisch aktive Regionen, sind aber nicht alleinige Ursache des Weltraumwetters; erst mehrere Messgrößen und ein begründeter Wirkungsmechanismus tragen eine Warnung, die wegen Unsicherheit keine sichere Ereignisvorhersage ist.',
      essentialUnderstandingEn: 'Sunspots indicate magnetically active regions but are not the sole cause of space weather; only multiple measurements and a justified mechanism support a warning, which remains uncertain rather than a certain event prediction.',
      observablePerformanceDe: 'Die lernende Person trennt Korrelation, Mechanismus und Prognose, gewichtet mehrere Aktivitätsindikatoren und beurteilt Überwachungsnutzen anhand konkreter Folgen und ausgewiesener Unsicherheit.',
      observablePerformanceEn: 'The learner distinguishes correlation, mechanism, and forecast, weighs multiple activity indicators, and assesses monitoring value using concrete effects and stated uncertainty.',
    }],
    variationAxes: [
      { id: 'indicator-set', textDe: 'Sonnenflecken, Magnetfelddaten, Strahlung oder Teilchenmessungen', textEn: 'Sunspots, magnetic-field data, radiation, or particle measurements' },
      { id: 'affected-system', textDe: 'Satellit, Funkverkehr, Stromnetz oder Astronautik', textEn: 'Satellite, radio communication, power grid, or human spaceflight' },
      { id: 'data-pattern', textDe: 'Klarer Zusammenhang, widersprüchliche Zeitreihen oder neuer Aktivitätstyp', textEn: 'Clear relationship, conflicting time series, or a new activity type' },
    ],
    applicationCaseBriefs: [
      {
        id: 'activity-time-series-claim',
        taskDemandDe: 'Prüfe anhand bereitgestellter Zeitreihen zu Sonnenflecken, Magnetfeld und erdnahen Messgrößen die Behauptung, viele Sonnenflecken sagten ein konkretes Weltraumwetterereignis sicher voraus.',
        taskDemandEn: 'Use supplied time series on sunspots, magnetic fields, and near-Earth measurements to test the claim that many sunspots predict a specific space-weather event with certainty.',
        expectedPerformanceDe: 'Die lernende Person identifiziert Indikator und Mechanismus getrennt, prüft zeitliche Zusammenhänge und weist den sicheren Vorhersageanspruch bei unzureichender Evidenz zurück.',
        expectedPerformanceEn: 'The learner distinguishes indicator from mechanism, checks temporal relationships, and rejects the certainty claim when the evidence is insufficient.',
        understandingFocusDe: 'Der Fall prüft die Unterscheidung von Korrelation, Ursache und Warnwahrscheinlichkeit.',
        understandingFocusEn: 'The case tests the distinction among correlation, cause, and warning probability.',
      },
      {
        id: 'monitoring-strategy-transfer',
        taskDemandDe: 'Für ein anderes gefährdetes technisches System und ein neues Aktivitätsmuster wähle geeignete Überwachungsdaten, begründe eine Warnentscheidung und benenne verbleibende Unsicherheiten.',
        taskDemandEn: 'For a different vulnerable technological system and a new activity pattern, select suitable monitoring data, justify a warning decision, and state remaining uncertainties.',
        expectedPerformanceDe: 'Die lernende Person passt Indikatorgewichtung und Folgenkriterien an und formuliert eine proportionale, nicht deterministische Warnung.',
        expectedPerformanceEn: 'The learner adapts indicator weighting and consequence criteria and formulates a proportionate, non-deterministic warning.',
        understandingFocusDe: 'Der Transfer prüft den fachlichen Nutzen der Überwachung statt allgemeiner Risikorhetorik.',
        understandingFocusEn: 'The transfer tests the scientific value of monitoring rather than general risk rhetoric.',
      },
    ],
  }],
  ['826af579-3e51-5ac9-bc2a-208d8a2fc99e', {
    archetype: 'data',
    selectionReasonDe: 'Round A trennt beobachtete von erschlossenen Strukturen und bindet Instrumentgrenzen an ein nur datengetragen revidiertes Milchstraßenmodell.',
    selectionReasonEn: 'Round A distinguishes observed from inferred structures and binds instrument limits to a Milky Way model revised only as far as data support it.',
    additionalExpectations: [{
      id: 'band-selection-observation-and-inference',
      essentialUnderstandingDe: 'Spektralbereiche reagieren auf unterschiedliche Quellen und werden durch Atmosphäre, Staub, Auflösung und Messprinzip verschieden begrenzt; Mehrwellenlängendaten ergänzen sich, müssen räumlich abgestimmt werden und ergeben nicht automatisch ein widerspruchsfreies Modell.',
      essentialUnderstandingEn: 'Spectral bands respond to different sources and are differently limited by atmosphere, dust, resolution, and measurement principle; multiwavelength data complement one another, must be spatially aligned, and do not automatically yield a contradiction-free model.',
      observablePerformanceDe: 'Die lernende Person begründet die Wahl von Teleskop und Spektralbereich, führt räumlich abgestimmte Datensätze zusammen, trennt beobachtete Signale von Strukturinferenz und begrenzt das Modell auf die Daten.',
      observablePerformanceEn: 'The learner justifies telescope and band selection, combines spatially aligned datasets, distinguishes observed signals from structural inference, and bounds the model by the data.',
    }],
    variationAxes: [
      { id: 'spectral-band', textDe: 'Optisch, Infrarot, Radio, Röntgen oder Gamma', textEn: 'Optical, infrared, radio, X-ray, or gamma ray' },
      { id: 'obscuration-and-resolution', textDe: 'Staubverdeckung, Atmosphärengrenze und unterschiedliche Winkelauflösung', textEn: 'Dust obscuration, atmospheric limit, and differing angular resolution' },
      { id: 'target-component', textDe: 'Sternscheibe, Gas, Staub, Zentralregion oder Hochenergiequelle', textEn: 'Stellar disk, gas, dust, central region, or high-energy source' },
    ],
    applicationCaseBriefs: [
      {
        id: 'dust-obscured-galactic-plane',
        taskDemandDe: 'Vergleiche räumlich abgestimmte optische, Infrarot- und Radiodaten einer staubverdeckten Region. Begründe, welche Komponenten jeder Bereich zeigt, und entwickle ein begrenztes Strukturmodell.',
        taskDemandEn: 'Compare spatially aligned optical, infrared, and radio data for a dust-obscured region. Justify which components each band reveals and develop a bounded structural model.',
        expectedPerformanceDe: 'Die lernende Person berücksichtigt Absorption, Messprinzip und Auflösung, integriert komplementäre Signale und kennzeichnet beobachtete gegenüber erschlossenen Strukturen.',
        expectedPerformanceEn: 'The learner accounts for absorption, measurement principle, and resolution, integrates complementary signals, and distinguishes observed from inferred structures.',
        understandingFocusDe: 'Der Fall prüft instrumentengebundene Datendeutung und Modellbildung.',
        understandingFocusEn: 'The case tests instrument-dependent data interpretation and modeling.',
      },
      {
        id: 'additional-high-energy-band',
        taskDemandDe: 'Ein zusätzlicher Röntgen-Datensatz zeigt Quellen, die in anderen Bändern fehlen. Sage vorab den möglichen Informationsgewinn voraus und revidiere das Modell, ohne fehlende Signale als fehlende Materie zu deuten.',
        taskDemandEn: 'An additional X-ray dataset reveals sources absent in other bands. Predict the possible information gain and revise the model without interpreting missing signals as missing matter.',
        expectedPerformanceDe: 'Die lernende Person ordnet die neue Emission einer passenden Quellenklasse zu, prüft räumliche Übereinstimmung und begrenzt die Revision auf die Messdaten.',
        expectedPerformanceEn: 'The learner associates the new emission with an appropriate source class, checks spatial alignment, and limits revision to the measurement evidence.',
        understandingFocusDe: 'Der Transfer prüft, ob ein neues Band komplementär statt dekorativ genutzt wird.',
        understandingFocusEn: 'The transfer tests whether a new band is used complementarily rather than decoratively.',
      },
    ],
  }],
  ['09995ab9-86aa-5b02-8a58-62b16a37831d', {
    archetype: 'modeling',
    selectionReasonDe: 'Round B liefert die wissenschaftlich präzisere Quadrupolbedingung und die klarste Grenze der elektromagnetischen Analogie; ihr Ersatztext bleibt als verworfener Revisions-Dissent gebunden.',
    selectionReasonEn: 'Round B supplies the scientifically more precise quadrupole condition and the clearest boundary of the electromagnetic analogy; its replacement wording remains bound as rejected revision dissent.',
    additionalExpectations: [{
      id: 'quadrupole-symmetry-and-analogy-limit',
      essentialUnderstandingDe: 'Im führenden Modell erfordert Gravitationsstrahlung ein zeitlich veränderliches Massenquadrupol; kugelsymmetrische Änderung und stationäre achsensymmetrische Rotation genügen nicht. Die Analogie zu elektromagnetischer Strahlung trägt bei Ausbreitung und Energietransport, nicht bei Quellenart, Multipolordnung oder Wechselwirkung.',
      essentialUnderstandingEn: 'In the leading model, gravitational radiation requires a time-varying mass quadrupole; spherical change and steady axisymmetric rotation are insufficient. The analogy with electromagnetic radiation applies to propagation and energy transport, not source type, multipole order, or interaction.',
      observablePerformanceDe: 'Die lernende Person entscheidet für neue Massenbewegungen anhand von Symmetrie und Quadrupoländerung über erwartete Abstrahlung und nennt mindestens eine tragfähige Gemeinsamkeit und zwei konkrete Analogiegrenzen.',
      observablePerformanceEn: 'For fresh mass motions, the learner uses symmetry and quadrupole change to decide whether radiation is expected and states at least one valid similarity and two concrete limits of the analogy.',
    }],
    variationAxes: [
      { id: 'mass-motion-symmetry', textDe: 'Kugelsymmetrisch, achsensymmetrisch oder zeitlich asymmetrisch', textEn: 'Spherical, axisymmetric, or time-varying asymmetric motion' },
      { id: 'source-system', textDe: 'Doppelstern, rotierender verformter Körper oder Kollaps', textEn: 'Binary, rotating deformed body, or collapse' },
      { id: 'analogy-aspect', textDe: 'Ausbreitung, Energietransport, Quelle, Multipolordnung oder Wechselwirkung', textEn: 'Propagation, energy transport, source, multipole order, or interaction' },
    ],
    applicationCaseBriefs: [
      {
        id: 'binary-versus-spherical-collapse',
        taskDemandDe: 'Vergleiche ein umlaufendes asymmetrisches Zweikörpersystem mit einem ideal kugelsymmetrischen Kollaps. Entscheide qualitativ anhand der Quadrupoländerung, ob Gravitationsstrahlung erwartet wird.',
        taskDemandEn: 'Compare an orbiting asymmetric binary system with an ideal spherically symmetric collapse. Use quadrupole change to decide qualitatively whether gravitational radiation is expected.',
        expectedPerformanceDe: 'Die lernende Person identifiziert die zeitliche Quadrupoländerung im Doppelsternfall und den fehlenden führenden Strahlungsmechanismus im ideal kugelsymmetrischen Gegenfall.',
        expectedPerformanceEn: 'The learner identifies the time-varying quadrupole in the binary case and the absent leading radiation mechanism in the ideal spherical countercase.',
        understandingFocusDe: 'Der Kontrast prüft die Quellenbedingung statt der bloßen Aussage, beschleunigte Masse strahle immer.',
        understandingFocusEn: 'The contrast tests the source condition rather than the blanket claim that any accelerated mass radiates.',
      },
      {
        id: 'rotating-shapes-and-em-analogy',
        taskDemandDe: 'Vergleiche einen stationär rotierenden achsensymmetrischen und einen rotierenden verformten Körper. Begründe die Abstrahlungserwartung und prüfe getrennt, welche Aussagen der elektromagnetischen Analogie tragen.',
        taskDemandEn: 'Compare a steadily rotating axisymmetric body with a rotating deformed body. Justify the radiation expectation and separately assess which electromagnetic analogy statements remain valid.',
        expectedPerformanceDe: 'Die lernende Person verwendet die zeitliche Quadrupoländerung, unterscheidet Raumzeitstörung von elektromagnetischem Feld und begrenzt die Analogie auf passende Merkmale.',
        expectedPerformanceEn: 'The learner uses time-varying quadrupole change, distinguishes a spacetime disturbance from an electromagnetic field, and limits the analogy to applicable features.',
        understandingFocusDe: 'Der Transfer verbindet Symmetrieprüfung und explizite Modellgrenzen.',
        understandingFocusEn: 'The transfer connects symmetry analysis and explicit model limits.',
      },
    ],
  }],
  ['e2014db8-c97f-5ce1-82c5-2a42741f4a61', {
    archetype: 'data',
    selectionReasonDe: 'Round A trennt Messung, modellabhängige Inferenz und Spekulation und begrenzt Habitabilitätskriterien klar gegenüber einem Lebensnachweis.',
    selectionReasonEn: 'Round A distinguishes measurement, model-dependent inference, and speculation and clearly limits habitability criteria relative to evidence of life.',
    additionalExpectations: [{
      id: 'method-bias-habitability-and-source-quality',
      essentialUnderstandingDe: 'Nachweismethoden erschließen unterschiedliche Planeteneigenschaften mit Auswahlverzerrungen und Modellannahmen; günstige physikalische Bedingungen sind notwendige oder unterstützende Hinweise, aber weder sichere Bewohnbarkeit noch Lebensnachweis, und Quellenqualität begrenzt die Aussage zusätzlich.',
      essentialUnderstandingEn: 'Detection methods infer different planetary properties with selection biases and model assumptions; favorable physical conditions are necessary or supporting indications but prove neither certain habitability nor life, and source quality further limits the claim.',
      observablePerformanceDe: 'Die lernende Person vergleicht Messprinzip, ableitbare Größen und Grenzen zweier Methoden, prüft explizite physikalische Kriterien, trennt Messung, Inferenz und Spekulation und bewertet die Quelle unabhängig davon.',
      observablePerformanceEn: 'The learner compares the measurement principle, inferable quantities, and limitations of two methods, checks explicit physical criteria, distinguishes measurement, inference, and speculation, and independently evaluates source quality.',
    }],
    variationAxes: [
      { id: 'detection-method', textDe: 'Transit, Radialgeschwindigkeit, direkte Abbildung oder Spektroskopie', textEn: 'Transit, radial velocity, direct imaging, or spectroscopy' },
      { id: 'planet-star-system', textDe: 'Unterschiedliche Sterntypen, Bahnen und Atmosphärenhinweise', textEn: 'Different stellar types, orbits, and atmospheric indications' },
      { id: 'source-quality', textDe: 'Primärdaten, Fachquelle oder populärwissenschaftliche Zuspitzung', textEn: 'Primary data, scientific source, or popular-science overstatement' },
    ],
    applicationCaseBriefs: [
      {
        id: 'transit-rv-habitability-claim',
        taskDemandDe: 'Prüfe eine digitale Behauptung zur Habitabilität eines Exoplaneten anhand bereitgestellter Transit- und Radialgeschwindigkeitsdaten. Gib an, welche Größen tatsächlich gemessen oder modellabhängig erschlossen sind.',
        taskDemandEn: 'Assess a digital claim about an exoplanet’s habitability using supplied transit and radial-velocity data. State which quantities are measured and which are inferred through a model.',
        expectedPerformanceDe: 'Die lernende Person vergleicht Methoden und Verzerrungen, prüft Erdkriterien mit Unsicherheit und begrenzt den Schluss auf die belegten Eigenschaften.',
        expectedPerformanceEn: 'The learner compares methods and biases, checks Earth-related criteria with uncertainty, and limits the conclusion to supported properties.',
        understandingFocusDe: 'Der Fall trennt Nachweis, Inferenz und Habitabilitätsurteil.',
        understandingFocusEn: 'The case distinguishes detection, inference, and habitability judgment.',
      },
      {
        id: 'different-star-source-transfer',
        taskDemandDe: 'Bewerte eine neue Behauptung zu einem Planeten um einen anderen Sterntyp, die auf Atmosphärendaten aus einer andersartigen Quelle beruht. Passe Kriterien und Quellenurteil an.',
        taskDemandEn: 'Evaluate a new claim about a planet around a different type of star based on atmospheric data from a different kind of source. Adapt the criteria and source judgment.',
        expectedPerformanceDe: 'Die lernende Person berücksichtigt Sternumgebung und Methodenlimit, fordert unabhängige Belege und leitet aus keinem Einzelmerkmal Leben oder sichere Bewohnbarkeit ab.',
        expectedPerformanceEn: 'The learner accounts for the stellar environment and method limit, requires independent evidence, and infers neither life nor certain habitability from one feature.',
        understandingFocusDe: 'Der Transfer prüft kriteriums- und evidenzabhängige statt erdähnlichkeitsbasierte Schlussbildung.',
        understandingFocusEn: 'The transfer tests criterion- and evidence-dependent inference rather than Earth-similarity reasoning.',
      },
    ],
  }],
  ['6ae54ff9-dc3b-563b-b2ee-09a0f0d00162', {
    archetype: 'data',
    selectionReasonDe: 'Round A verbindet gesicherten Befund, Modell, offene Frage, unterscheidbare Vorhersage und die Prüfung populärwissenschaftlicher Sicherheit besonders vollständig.',
    selectionReasonEn: 'Round A most fully connects established findings, models, open questions, discriminating predictions, and scrutiny of confidence in popular-science accounts.',
    additionalExpectations: [{
      id: 'finding-model-question-and-source-confidence',
      essentialUnderstandingDe: 'Eine offene kosmologische Frage verlangt die Trennung von Beobachtungsbefund, modellabhängiger Deutung und Spekulation; untersuchbar wird sie durch messbare Größen oder unterscheidbare Vorhersagen, während die behauptete Sicherheit einer Darstellung an Evidenz, Unsicherheit und Quellenweg zu prüfen ist.',
      essentialUnderstandingEn: 'An open cosmological question requires distinguishing observational findings, model-dependent interpretation, and speculation; it becomes investigable through measurable quantities or discriminating predictions, while an account’s claimed confidence must be checked against evidence, uncertainty, and source traceability.',
      observablePerformanceDe: 'Die lernende Person formuliert aus einer offenen Problemstellung eine prüfbare Frage, benennt mögliche entscheidende Messungen, trennt Befund und Erklärung und bewertet populärwissenschaftliche Aussagen nach Beleg, Unsicherheitsangabe und Quellenqualität.',
      observablePerformanceEn: 'The learner formulates a testable question from an open problem, identifies potentially decisive measurements, distinguishes findings from explanations, and evaluates popular-science claims by evidence, uncertainty reporting, and source quality.',
    }],
    variationAxes: [
      { id: 'open-problem', textDe: 'Dunkle Materie, Dunkle Energie, Expansionsmessungen oder frühes Universum', textEn: 'Dark matter, dark energy, expansion measurements, or the early universe' },
      { id: 'evidence-type', textDe: 'Rotationsdaten, Linsenwirkung, Standardkerzen, Hintergrundstrahlung oder andere Messung', textEn: 'Rotation data, lensing, standard candles, background radiation, or another measurement' },
      { id: 'communication-quality', textDe: 'Transparente Unsicherheit, überzogene Sicherheit oder nach neuen Daten aktualisierte Darstellung', textEn: 'Transparent uncertainty, overstated certainty, or an account updated after new data' },
    ],
    applicationCaseBriefs: [
      {
        id: 'expansion-measurement-tension',
        taskDemandDe: 'Analysiere eine Darstellung zu voneinander abweichenden Expansionsmessungen. Trenne die gesicherten Datensätze von modellabhängigen Ableitungen, formuliere eine untersuchbare Frage und benenne eine Messung, die Erklärungen unterscheiden könnte.',
        taskDemandEn: 'Analyze an account of differing expansion measurements. Distinguish established datasets from model-dependent inferences, formulate an investigable question, and identify a measurement that could distinguish explanations.',
        expectedPerformanceDe: 'Die lernende Person trennt Befund, mögliche systematische Effekte und neue Physik, formuliert messbare Kriterien und begrenzt die Sicherheit der Schlussfolgerung.',
        expectedPerformanceEn: 'The learner distinguishes findings, possible systematic effects, and new physics, formulates measurable criteria, and limits confidence in the conclusion.',
        understandingFocusDe: 'Der Fall prüft offene Frage und prüfbare Vorhersage statt bloßer Themenbeschreibung.',
        understandingFocusEn: 'The case tests an open question and testable prediction rather than mere topic description.',
      },
      {
        id: 'dark-matter-source-transfer',
        taskDemandDe: 'Vergleiche zwei populärwissenschaftliche Darstellungen zur Natur Dunkler Materie mit bereitgestellten Primärbefunden anderer Evidenzart. Bewerte Ton, Unsicherheit und Quellenweg und formuliere eine passende Folgemessung.',
        taskDemandEn: 'Compare two popular-science accounts of the nature of dark matter with supplied primary findings of a different evidence type. Evaluate tone, uncertainty, and source traceability and formulate an appropriate follow-up measurement.',
        expectedPerformanceDe: 'Die lernende Person überträgt die Trennung von Befund, Modell und Spekulation, bewertet Quellen proportional und nennt eine inhaltlich unterscheidende Messung.',
        expectedPerformanceEn: 'The learner transfers the distinction among finding, model, and speculation, evaluates sources proportionately, and identifies a substantively discriminating measurement.',
        understandingFocusDe: 'Der Transfer prüft das epistemische Raster an einer anderen kosmologischen Evidenzart.',
        understandingFocusEn: 'The transfer tests the epistemic framework with a different type of cosmological evidence.',
      },
    ],
  }],
])

const sha256 = (value: Buffer): string => createHash('sha256').update(value).digest('hex')
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)

const parseJsonl = (bytes: Buffer): ReviewRecord[] => bytes.toString('utf8')
  .split(/\r?\n/u)
  .filter((line) => line.trim())
  .map((line) => JSON.parse(line) as ReviewRecord)

const readOptional = async (path: string): Promise<Buffer | null> => {
  try {
    return await readFile(path)
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}

const main = async (): Promise<void> => {
  const unknownArgs = process.argv.slice(2).filter((arg) => arg !== '--write')
  if (unknownArgs.length > 0) throw new Error(`Unknown arguments: ${unknownArgs.join(', ')}`)

  const [roundABytes, roundBBytes, dualSummaryBytes, adjudicationBytes, synthesisManifestBytes] = await Promise.all([
    readFile(roundAPath),
    readFile(roundBPath),
    readFile(dualSummaryPath),
    readFile(adjudicationPath),
    readFile(synthesisManifestPath),
  ])
  const digestChecks = [
    [roundABytes, expectedRoundADigest, roundAPath],
    [roundBBytes, expectedRoundBDigest, roundBPath],
    [dualSummaryBytes, expectedDualSummaryDigest, dualSummaryPath],
    [adjudicationBytes, expectedAdjudicationDigest, adjudicationPath],
    [synthesisManifestBytes, expectedSynthesisManifestDigest, synthesisManifestPath],
  ] as const
  for (const [bytes, expected, path] of digestChecks) {
    if (sha256(bytes) !== expected) throw new Error(`Physics B022 evidence source digest changed: ${path}`)
  }

  const rounds = {
    first: parseJsonl(roundABytes),
    second: parseJsonl(roundBBytes),
  }
  const dualSummary = JSON.parse(dualSummaryBytes.toString('utf8')) as {
    goals: Array<{ goalId: string; agreement: string; firstRecordId: string; secondRecordId: string }>
  }
  const adjudication = JSON.parse(adjudicationBytes.toString('utf8')) as {
    counts?: { keep_current?: number; requiresProductOwnerDecision?: number }
    decisions?: Array<{ goalId?: string; resolutionDecision?: string }>
  }
  const synthesisManifest = JSON.parse(synthesisManifestBytes.toString('utf8')) as {
    decisions?: Array<{ goalId?: string; evidenceRound?: string; resolutionDecision?: string }>
  }
  const keepIds = adjudication.decisions
    ?.filter(({ resolutionDecision }) => resolutionDecision === 'keep_current')
    .map(({ goalId }) => goalId) ?? []
  if (
    adjudication.counts?.keep_current !== 12
    || adjudication.counts.requiresProductOwnerDecision !== 0
    || JSON.stringify(keepIds) !== JSON.stringify(goalIds)
    || selectedRoundAndRecordByGoalId.size !== goalIds.length
    || profileDefinitions.size !== goalIds.length
    || synthesisManifest.decisions?.length !== goalIds.length
  ) {
    throw new Error('Physics B022 stable12 evidence scope or source adjudication is invalid')
  }

  const candidates: CandidateSet['goals'] = goalIds.map((goalId) => {
    const selected = selectedRoundAndRecordByGoalId.get(goalId)
    const definition = profileDefinitions.get(goalId)
    const manifestDecision = synthesisManifest.decisions?.find((decision) => decision.goalId === goalId)
    const summary = dualSummary.goals.find((goal) => goal.goalId === goalId)
    if (!selected || !definition || !manifestDecision || !summary) {
      throw new Error(`${goalId}: missing evidence selection, profile definition, manifest decision, or dual summary`)
    }
    if (
      manifestDecision.evidenceRound !== selected.round
      || manifestDecision.resolutionDecision !== 'keep_current'
      || summary.agreement !== 'disagreement'
    ) {
      throw new Error(`${goalId}: evidence selection disagrees with the bound B022 synthesis or dual summary`)
    }
    const selectedRecord = rounds[selected.round].find((record) => record.goalId === goalId)
    const otherRound = selected.round === 'first' ? 'second' : 'first'
    const otherRecord = rounds[otherRound].find((record) => record.goalId === goalId)
    if (
      !selectedRecord
      || !otherRecord
      || selectedRecord.recordId !== selected.recordId
      || selectedRecord.evidenceProfileContract !== 'positive-understanding-evidence-v2'
      || selectedRecord.evidenceProfileRecommendation !== 'create'
      || selectedRecord.recordStatus !== 'candidate'
      || selectedRecord.reviewAuthority !== 'ai_candidate'
      || summary.firstRecordId !== rounds.first.find((record) => record.goalId === goalId)?.recordId
      || summary.secondRecordId !== rounds.second.find((record) => record.goalId === goalId)?.recordId
    ) {
      throw new Error(`${goalId}: selected or alternate exact B022 record is invalid`)
    }
    const isMixed = goalId === '09995ab9-86aa-5b02-8a58-62b16a37831d'
    if (
      (!isMixed && (selectedRecord.decision !== 'keep' || otherRecord.decision !== 'keep'))
      || (isMixed && (
        selected.round !== 'second'
        || selectedRecord.decision !== 'revise'
        || otherRecord.decision !== 'keep'
        || !selectedRecord.proposedDescriptionDe
        || !selectedRecord.proposedDescriptionEn
      ))
    ) {
      throw new Error(`${goalId}: source decisions do not match the exact stable12 contract`)
    }

    const reviewedCore = {
      id: 'selected-blind-review-core',
      essentialUnderstandingDe: selectedRecord.understandingEvidence.essentialUnderstandingDe,
      essentialUnderstandingEn: selectedRecord.understandingEvidence.essentialUnderstandingEn,
      observablePerformanceDe: selectedRecord.understandingEvidence.observablePerformanceDe,
      observablePerformanceEn: selectedRecord.understandingEvidence.observablePerformanceEn,
    }
    const expectations = [reviewedCore, ...definition.additionalExpectations]
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
    const dissent = isMixed
      ? [
          `B022 revision dissent remains bound: Round B proposed DE “${selectedRecord.proposedDescriptionDe}” / EN “${selectedRecord.proposedDescriptionEn}”. The synthesis retains the exact current canonical text but accepts Round B's more precise quadrupole evidence.`,
        ]
      : [
          `B022 evidence-formulation dissent remains bound: selected ${selected.round} record ${selectedRecord.recordId}; compatible alternate ${otherRound} record ${otherRecord.recordId} remains preserved in the exact dual summary.`,
        ]
    return {
      goalId,
      reason: `DE: ${definition.selectionReasonDe} Das Profil übernimmt den Kernaussage- und Performanzblock bytegetreu aus ${selectedRecord.recordId}, operationalisiert ihn in zwei unabhängigen frischen Fällen und bindet die abweichende zweite Evidence-Fassung als Dissent. EN: ${definition.selectionReasonEn} The profile carries the core understanding and performance block byte-for-byte from ${selectedRecord.recordId}, operationalizes it in two independent fresh cases, and binds the alternate evidence formulation as dissent.`,
      evidenceLevel: 'E1',
      maximumClaimScope: 'G1',
      dissent,
      profile,
    }
  })

  const output: CandidateSet = {
    schemaVersion: 1,
    authoringContract: 'positive-understanding-evidence-candidates-v1',
    reviewId: targetReviewId,
    reviewedAt: '2026-08-28T22:45:00.000Z',
    reviewer: 'codex-physics-b022-stable12-positive-evidence-candidate-2026-08-28',
    goals: candidates,
  }
  const bytes = jsonBytes(output)
  const current = await readOptional(targetPath)
  if (current && !current.equals(bytes)) {
    throw new Error(`Existing Physics B022 stable12 evidence candidates are stale: ${targetPath}`)
  }
  if (!current && !write) throw new Error(`Missing Physics B022 stable12 evidence candidates: ${targetPath}`)
  if (!current && write) await writeFile(targetPath, bytes, { flag: 'wx' })
  console.log(
    `${write ? 'Materialized' : 'Verified'} Physics B022 stable12 evidence candidates: ${candidates.length}/${goalIds.length}`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
