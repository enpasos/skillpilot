import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PositiveGoalEvidenceProfile } from './positiveGoalEvidenceProfileModel'

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

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const write = process.argv.includes('--write')
const batchDirectory = resolve(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-28/'
    + 'batch-023-astrophysics-structural-follow-up-16-v1',
)
const roundAPath = resolve(
  batchDirectory,
  'round-a/results/'
    + 'physik-rollout-v1-batch-023-astrophysics-structural-follow-up-16-v1-20260828-first-pass-a.batch-001.records.jsonl',
)
const roundBPath = resolve(
  batchDirectory,
  'round-b/results/'
    + 'physik-rollout-v1-batch-023-astrophysics-structural-follow-up-16-v1-20260828-first-pass-b.batch-001.records.jsonl',
)
const dualSummaryPath = resolve(batchDirectory, 'dual-summary.json')
const adjudicationPath = resolve(batchDirectory, 'third-adjudication/adjudication.json')
const synthesisManifestPath = resolve(
  batchDirectory,
  'synthesis-decisions.stable-current-carryover-11-v1.json',
)
const targetPath = resolve(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-evidence/'
    + 'canonical-physics-positive-understanding-evidence-rollout-v1-'
    + 'batch-023-astrophysics-stable11-current-v1.candidates.json',
)

const expectedRoundADigest = '13c1ef2b2f911334fac5277ed97528e665d62ac3df6693f6f03859bdb10d79c2'
const expectedRoundBDigest = '275595839cb7ab6204e648801c19e94b9db80e478e9e7d4c1e33f60729d2d610'
const expectedDualSummaryDigest = 'c88e0619acab793ecb14b77b332bdb203621b7655817f1d02afb9fee6de3a5db'
const expectedAdjudicationDigest = '3f3cd8733b0bde60686b6f7b92f8538845631c752deb1c5fda285966ba81692e'
const expectedSynthesisManifestDigest = '10301d5dab7042b1a2517f7bb7126c370a926b9b7c8be15c027668dd83910a93'
const targetReviewId = 'canonical-physics-positive-evidence-v1-b023-astrophysics-stable11-v1'

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

const selectedRecordIdByGoalId = new Map<string, string>([
  ['a5031dfc-6d25-5a04-850a-5c7d8a254c21', 'physik-b023-a-002-a5031dfc'],
  ['d024aa45-5dbb-51f7-87a6-9ba939858696', 'physik-b023-a-004-d024aa45'],
  ['e06dd9c7-8c36-5ca4-880b-57b02d837085', 'physik-b023-a-005-e06dd9c7'],
  ['0b8a4215-e6ed-56c8-88c3-b3a2a99723c7', 'physik-b023-a-006-0b8a4215'],
  ['5e9cd796-3887-5457-8a1f-26863ca7eb28', 'physik-b023-a-008-5e9cd796'],
  ['9851bd02-ca48-5ce4-8e9f-9ec4af1c43b8', 'physik-b023-a-009-9851bd02'],
  ['6e1cd027-040b-51d9-8764-3cf3daddb5ec', 'physik-b023-a-011-6e1cd027'],
  ['44766569-6379-5fbc-8976-cd3fc2fd6ec4', 'physik-b023-a-012-44766569'],
  ['206a7d3d-9b11-56be-89ff-73898445c4f5', 'physik-b023-a-013-206a7d3d'],
  ['44f0eefa-2d93-5954-879f-f6c49e5cebc7', 'physik-b023-a-014-44f0eefa'],
  ['c53b3f0c-b4fe-5509-8803-a36c2883e5d6', 'physik-b023-a-016-c53b3f0c'],
])

const profileDefinitions = new Map<string, ProfileDefinition>([
  ['a5031dfc-6d25-5a04-850a-5c7d8a254c21', {
    archetype: 'modeling',
    selectionReasonDe: 'Runde A bindet Bezugsfläche, Parameterprognose, Einheiten, Messabweichung und die Grenzen von Atmosphäre, innerer Wärme sowie weiteren Lebensbedingungen in einer vollständigen Bilanz-zu-Urteil-Kette.',
    selectionReasonEn: 'Round A binds reference area, parameter prediction, units, discrepancy from measurement, and the limits introduced by atmosphere, internal heat, and further conditions for life in a complete balance-to-judgment chain.',
    additionalExpectation: {
      id: 'model-temperature-does-not-establish-habitability',
      essentialUnderstandingDe: 'Eine Gleichgewichtstemperatur ist eine durch Systemgrenze und Idealisierungen bestimmte Modellgröße. Selbst ein erdähnlicher Wert belegt weder eine gemessene Oberflächentemperatur noch flüssiges Wasser oder Leben; dafür sind unabhängige atmosphärische, chemische und geologische Daten nötig.',
      essentialUnderstandingEn: 'An equilibrium temperature is a model quantity determined by the system boundary and idealizations. Even an Earth-like value establishes neither a measured surface temperature nor liquid water or life; independent atmospheric, chemical, and geological data are required.',
      observablePerformanceDe: 'Die lernende Person trennt berechnete Modellgröße, Messbefund und Habitabilitätsurteil, nennt fehlende Evidenz und formuliert nur eine konditionale, durch die Daten begrenzte Aussage.',
      observablePerformanceEn: 'The learner separates the calculated model quantity, measured finding, and habitability judgment, identifies missing evidence, and states only a conditional conclusion bounded by the data.',
    },
    variationAxes: [
      { id: 'energy-input', textDe: 'Unterschiedliche Leuchtkraft, Entfernung und zeitliche Einstrahlung', textEn: 'Different luminosity, distance, and time-dependent irradiation' },
      { id: 'surface-atmosphere', textDe: 'Albedo, Emissivität, Wärmeverteilung, Atmosphäre oder innere Wärme', textEn: 'Albedo, emissivity, heat redistribution, atmosphere, or internal heat' },
      { id: 'evidence-state', textDe: 'Nur Modelldaten, zusätzlich gemessene Temperatur oder weitere chemisch-geologische Befunde', textEn: 'Model data only, an additional measured temperature, or further chemical-geological findings' },
    ],
    applicationCaseBriefs: [
      {
        id: 'airless-body-radiation-balance',
        taskDemandDe: 'Für einen luftlosen Himmelskörper sind Leuchtkraft des Sterns, Abstand, Albedo und eine Annahme zur Wärmeverteilung gegeben. Sage Parameterwirkungen voraus, stelle die Bilanz mit klarer Bezugsfläche auf, berechne die Gleichgewichtstemperatur und begrenze die Aussage zur realen Oberfläche.',
        taskDemandEn: 'For an airless celestial body, stellar luminosity, distance, albedo, and a heat-redistribution assumption are supplied. Predict parameter effects, set up the balance with a clear reference area, calculate the equilibrium temperature, and bound the claim about the actual surface.',
        expectedPerformanceDe: 'Die lernende Person unterscheidet absorbierende Querschnitts- und abstrahlende Oberfläche, rechnet einheitenrichtig, prüft die Größenordnung und erklärt räumliche beziehungsweise zeitliche Temperaturunterschiede als Modellgrenze.',
        expectedPerformanceEn: 'The learner distinguishes absorbing cross section from emitting area, calculates with consistent units, checks the order of magnitude, and explains spatial or temporal temperature differences as a model limitation.',
        understandingFocusDe: 'Der Fall prüft die physikalische Bilanz statt bloßer Formeleinsetzung.',
        understandingFocusEn: 'The case tests the physical balance rather than mere substitution.',
      },
      {
        id: 'same-equilibrium-different-habitability',
        taskDemandDe: 'Zwei Planeten haben rechnerisch dieselbe Gleichgewichtstemperatur, aber unterschiedliche Atmosphären, innere Wärme und Messwerte. Erkläre die Abweichungen und beurteile, welche Aussagen zu Lebensbedingungen jeweils tragfähig sind.',
        taskDemandEn: 'Two planets have the same calculated equilibrium temperature but different atmospheres, internal heat, and measurements. Explain the discrepancies and assess which claims about conditions for life are supported in each case.',
        expectedPerformanceDe: 'Die lernende Person passt Modellannahmen an, trennt Modellwert und Messwert und fordert zusätzliche Evidenz, statt aus einer Temperatur allein auf Habitabilität zu schließen.',
        expectedPerformanceEn: 'The learner adjusts model assumptions, separates model value from measurement, and requires additional evidence instead of inferring habitability from one temperature alone.',
        understandingFocusDe: 'Der Transfer prüft Modellkritik und die Grenze des Habitabilitätsschlusses.',
        understandingFocusEn: 'The transfer tests model criticism and the limit of the habitability inference.',
      },
    ],
  }],
  ['d024aa45-5dbb-51f7-87a6-9ba939858696', {
    archetype: 'representation',
    selectionReasonDe: 'Runde A verlangt zusätzlich zur korrekten Ausrichtung eine reale Suchroute über sichtbare Wegmarken und eine Identitätsprüfung anhand von Richtung, Höhe und Nachbarmustern.',
    selectionReasonEn: 'In addition to correct orientation, Round A requires a real search route from visible landmarks and an identity check using direction, altitude, and neighboring patterns.',
    additionalExpectation: {
      id: 'chart-conventions-must-map-to-local-horizon',
      essentialUnderstandingDe: 'Eine Sternkarte ist eine konventionsgebundene Projektion für Ort und Zeit; Norden, Ost-West-Sinn, Blickrichtung, Horizont und Kartenrand müssen aktiv auf die reale Beobachtung bezogen werden.',
      essentialUnderstandingEn: 'A star chart is a convention-bound projection for a location and time; north, east-west sense, viewing direction, horizon, and chart edge must be actively related to the real observation.',
      observablePerformanceDe: 'Die lernende Person erklärt die verwendeten Darstellungsregeln, korrigiert eine absichtlich falsch orientierte Karte und prüft ein Zielobjekt gegen mindestens zwei unabhängige Lagehinweise.',
      observablePerformanceEn: 'The learner explains the representation conventions, corrects an intentionally misoriented chart, and checks a target against at least two independent positional cues.',
    },
    variationAxes: [
      { id: 'place-and-time', textDe: 'Geografische Breite, Datum und lokale Beobachtungszeit', textEn: 'Geographic latitude, date, and local observing time' },
      { id: 'representation', textDe: 'Drehbare Sternkarte oder digitale Himmelssoftware mit verschiedener Projektion', textEn: 'Rotating star chart or digital sky software with different projection' },
      { id: 'landmark-route', textDe: 'Unterschiedliche Sternbilder, Himmelsrichtungen und Zielhöhen', textEn: 'Different constellations, cardinal directions, and target altitudes' },
    ],
    applicationCaseBriefs: [
      {
        id: 'landmark-to-target-route',
        taskDemandDe: 'Richte eine Sternkarte für einen angegebenen Ort und Abend aus und beschreibe vom hellen Wegweiserstern über ein markantes Sternmuster eine prüfbare Suchroute zu einem schwächeren Zielobjekt.',
        taskDemandEn: 'Orient a star chart for a specified place and evening and describe a checkable search route from a bright guide star through a prominent pattern to a fainter target.',
        expectedPerformanceDe: 'Die lernende Person dokumentiert Datum, Uhrzeit und Himmelsrichtung, hält die Kartenorientierung konsistent und bestätigt das Ziel durch Höhe und Nachbarsterne.',
        expectedPerformanceEn: 'The learner documents date, time, and direction, keeps chart orientation consistent, and confirms the target using altitude and neighboring stars.',
        understandingFocusDe: 'Der Fall prüft Navigation am realen Himmel statt bloßer Symbolsuche.',
        understandingFocusEn: 'The case tests navigation in the real sky rather than mere symbol lookup.',
      },
      {
        id: 'new-latitude-and-time',
        taskDemandDe: 'Für denselben Kalendertag werden Beobachtungsort und Uhrzeit deutlich verändert. Richte die Darstellung neu aus, sage geänderte Wegmarken voraus und finde ein neues Ziel mit angepasster Route.',
        taskDemandEn: 'For the same calendar date, the observing location and time are changed substantially. Reorient the representation, predict changed landmarks, and locate a new target using an adapted route.',
        expectedPerformanceDe: 'Die lernende Person übernimmt nicht die alte Kartenlage, sondern rekonstruiert Horizontbezug und sichtbaren Ausschnitt und begründet jede Änderung.',
        expectedPerformanceEn: 'The learner does not reuse the old chart orientation but reconstructs the horizon relation and visible region and justifies each change.',
        understandingFocusDe: 'Der Transfer prüft die Abhängigkeit der Darstellung von Ort und Zeit.',
        understandingFocusEn: 'The transfer tests the representation’s dependence on place and time.',
      },
    ],
  }],
  ['e06dd9c7-8c36-5ca4-880b-57b02d837085', {
    archetype: 'data',
    selectionReasonDe: 'Runde A trennt Beobachtung und Deutung, kombiniert mehrere trennscharfe Merkmale und fordert bei neuer Bewegungsinformation eine begründete Revision der Klassifikation.',
    selectionReasonEn: 'Round A separates observation from interpretation, combines multiple discriminating features, and requires justified revision of the classification when new motion information becomes available.',
    additionalExpectation: {
      id: 'classification-is-provisional-inference',
      essentialUnderstandingDe: 'Eine mit bloßem Auge gebildete Objektklasse ist eine Inferenz aus begrenzten Merkmalen; ein einzelnes Merkmal kann mehreren Klassen entsprechen, und Beobachtungsdauer sowie Bedingungen bestimmen die Trennschärfe.',
      essentialUnderstandingEn: 'An object class formed from naked-eye observations is an inference from limited features; one feature can fit several classes, and observing duration and conditions determine discriminating power.',
      observablePerformanceDe: 'Die lernende Person gibt zu jeder Zuordnung die tragenden Merkmale, plausible Alternativen und eine entscheidende Zusatzbeobachtung an und revidiert die Zuordnung bei widersprechender Evidenz.',
      observablePerformanceEn: 'For each assignment, the learner states the supporting features, plausible alternatives, and a decisive follow-up observation and revises the assignment when evidence conflicts.',
    },
    variationAxes: [
      { id: 'appearance', textDe: 'Punktförmig, ausgedehnt, farbig, helligkeitsveränderlich oder kurzzeitig leuchtend', textEn: 'Point-like, extended, colored, brightness-varying, or briefly luminous' },
      { id: 'motion', textDe: 'Ortsfest im Muster, langsame Drift, gleichförmige schnelle Bewegung oder kurze Spur', textEn: 'Fixed in a pattern, slow drift, uniform rapid motion, or short streak' },
      { id: 'data-duration', textDe: 'Einzelbeobachtung, kurze Folge oder mehrnächtige Beobachtungsserie', textEn: 'Single observation, short sequence, or multi-night observing series' },
    ],
    applicationCaseBriefs: [
      {
        id: 'mixed-observation-log',
        taskDemandDe: 'Ordne mehrere anonymisierte Beobachtungsprotokolle möglichen Klassen wie Stern, Planet, Mond, Meteor oder künstlicher Satellit zu. Trenne wörtliche Beobachtung und Deutung und verwende mindestens zwei Merkmale pro belastbarer Zuordnung.',
        taskDemandEn: 'Assign several anonymized observation logs to possible classes such as star, planet, Moon, meteor, or artificial satellite. Separate literal observation from interpretation and use at least two features for each defensible assignment.',
        expectedPerformanceDe: 'Die lernende Person legt ein transparentes Merkmalsraster an, begründet Zuordnungen und markiert unzureichende Daten als mehrdeutig.',
        expectedPerformanceEn: 'The learner constructs a transparent feature framework, justifies assignments, and marks insufficient data as ambiguous.',
        understandingFocusDe: 'Der Fall macht Klassifikation als evidenzgebundene Inferenz sichtbar.',
        understandingFocusEn: 'The case makes classification visible as evidence-bound inference.',
      },
      {
        id: 'ambiguous-object-follow-up',
        taskDemandDe: 'Ein zunächst punktförmiges Objekt ist in einer Einzelbeobachtung mehrdeutig. Wähle eine entscheidende Folgebeobachtung und revidiere die Klasse für zwei mögliche Bewegungsverläufe.',
        taskDemandEn: 'An initially point-like object is ambiguous in a single observation. Select a decisive follow-up observation and revise the class for two possible motion histories.',
        expectedPerformanceDe: 'Die lernende Person priorisiert zeitliche Bewegung relativ zum Sternhintergrund, formuliert bedingte Schlüsse und begründet eine Revision statt am ersten Etikett festzuhalten.',
        expectedPerformanceEn: 'The learner prioritizes motion over time relative to the stellar background, states conditional conclusions, and justifies revision instead of retaining the first label.',
        understandingFocusDe: 'Der Transfer prüft Unsicherheit und Revisionsfähigkeit.',
        understandingFocusEn: 'The transfer tests uncertainty and revisability.',
      },
    ],
  }],
  ['0b8a4215-e6ed-56c8-88c3-b3a2a99723c7', {
    archetype: 'modeling',
    selectionReasonDe: 'Runde A verbindet Horizont und Sonnenlage explizit mit Erdrotation, Erdumlauf und geografischer Breite und prüft Beobachtungsfenster sowie Zirkumpolarität im Transfer.',
    selectionReasonEn: 'Round A explicitly connects the horizon and solar position with Earth rotation, Earth orbit, and geographic latitude and tests observing windows and circumpolarity in transfer.',
    additionalExpectation: {
      id: 'visibility-needs-altitude-and-darkness',
      essentialUnderstandingDe: 'Über dem geometrischen Horizont zu stehen ist notwendig, aber für nächtliche Beobachtung nicht hinreichend: Sonnenhöhe, Dämmerung, Objekt-Helligkeit und ein brauchbarer Höhenwinkel begrenzen das Beobachtungsfenster zusätzlich.',
      essentialUnderstandingEn: 'Being above the geometric horizon is necessary but not sufficient for nighttime observation: solar altitude, twilight, object brightness, and a usable altitude angle further constrain the observing window.',
      observablePerformanceDe: 'Die lernende Person kombiniert Objekt- und Sonnenlage, gibt ein begründetes Zeitfenster statt nur eines Zeitpunkts an und kennzeichnet eine geometrisch sichtbare, praktisch aber ungeeignete Situation.',
      observablePerformanceEn: 'The learner combines object and solar position, states a justified observing window rather than only a time point, and identifies a geometrically visible but practically unsuitable situation.',
    },
    variationAxes: [
      { id: 'latitude', textDe: 'Niedrige, mittlere oder hohe geografische Breite', textEn: 'Low, middle, or high geographic latitude' },
      { id: 'season-time', textDe: 'Jahreszeit, lokale Uhrzeit und Dämmerungszustand', textEn: 'Season, local time, and twilight state' },
      { id: 'object-position', textDe: 'Äquatornahes, ekliptiknahes oder polnahes Objekt', textEn: 'Equatorial, ecliptic, or near-polar object' },
    ],
    applicationCaseBriefs: [
      {
        id: 'local-observing-window',
        taskDemandDe: 'Bestimme für ein Objekt, einen Ort und ein Datum aus einer Himmelsdarstellung Richtung, ungefähre Höhe und ein sinnvolles Beobachtungsfenster. Begründe es mit Horizont, Dunkelheit und Erdbewegung.',
        taskDemandEn: 'For an object, location, and date, use a sky representation to determine direction, approximate altitude, and a sensible observing window. Justify it using the horizon, darkness, and Earth’s motion.',
        expectedPerformanceDe: 'Die lernende Person verknüpft statt bloß abzulesen die Tagesbahn mit Sonnenuntergang beziehungsweise Dämmerung und begrenzt die praktische Sichtbarkeit.',
        expectedPerformanceEn: 'Rather than merely reading the chart, the learner connects the daily path with sunset or twilight and bounds practical visibility.',
        understandingFocusDe: 'Der Fall prüft die gemeinsame räumliche und zeitliche Geometrie.',
        understandingFocusEn: 'The case tests the joint spatial and temporal geometry.',
      },
      {
        id: 'latitude-season-circumpolar-transfer',
        taskDemandDe: 'Versetze denselben Beobachtungsfall an einen Ort mit deutlich anderer Breite und in eine andere Jahreszeit. Prognostiziere Auf- und Untergang, mögliche Zirkumpolarität und geänderte Dunkelheitsfenster vor der Kontrolle.',
        taskDemandEn: 'Move the same observing case to a location at substantially different latitude and to another season. Predict rising and setting, possible circumpolarity, and changed darkness windows before checking.',
        expectedPerformanceDe: 'Die lernende Person trennt Breitenwirkung, Jahreszeitenwirkung und Tagesrotation und überprüft eine begründete Vorhersage an der neu ausgerichteten Darstellung.',
        expectedPerformanceEn: 'The learner separates latitude, seasonal, and daily-rotation effects and checks a justified prediction against the reoriented representation.',
        understandingFocusDe: 'Der Transfer verhindert das Auswendiglernen lokaler Sichtbarkeitsdaten.',
        understandingFocusEn: 'The transfer prevents memorization of local visibility facts.',
      },
    ],
  }],
  ['5e9cd796-3887-5457-8a1f-26863ca7eb28', {
    archetype: 'modeling',
    selectionReasonDe: 'Runde A bindet große Halbachse, Periode, physikalische Herleitung, Einheiten- und Größenordnungsprüfung, Unsicherheit und den Wechsel zu Gesamtmasse und Relativbahn besonders vollständig.',
    selectionReasonEn: 'Round A most fully binds semimajor axis, period, physical derivation, unit and order-of-magnitude checks, uncertainty, and the change to total mass and relative orbit.',
    additionalExpectation: {
      id: 'inferred-mass-depends-on-orbit-definition',
      essentialUnderstandingDe: 'Die Kepler-Massenbeziehung erschließt im Zweikörpermodell die Gesamtmasse aus Periode und großer Halbachse der Relativbahn. Eine Sonnenmasse folgt nur, wenn die Begleitermasse gegenüber der Sonne vernachlässigbar ist und die verwendete Bahngröße korrekt definiert wurde.',
      essentialUnderstandingEn: 'The Kepler mass relation infers total mass in the two-body model from period and the semimajor axis of the relative orbit. A solar mass follows only when the companion mass is negligible relative to the Sun and the orbital size has been defined correctly.',
      observablePerformanceDe: 'Die lernende Person kennzeichnet Bezugsbahn und Zielmasse, korrigiert eine Verwechslung von Einzel- und Relativbahn und gibt den Einfluss einer nicht vernachlässigbaren Begleitermasse an.',
      observablePerformanceEn: 'The learner identifies the reference orbit and target mass, corrects a confusion between component and relative orbit, and states the effect of a non-negligible companion mass.',
    },
    variationAxes: [
      { id: 'orbit-shape', textDe: 'Nahezu kreisförmige oder deutlich exzentrische Bahn', textEn: 'Nearly circular or markedly eccentric orbit' },
      { id: 'companion-mass', textDe: 'Vernachlässigbarer Planet oder massereicher Begleiter', textEn: 'Negligible planet or massive companion' },
      { id: 'data-quality', textDe: 'Exakte Modelldaten oder Periode und Halbachse mit Unsicherheiten', textEn: 'Exact model data or period and semimajor axis with uncertainties' },
    ],
    applicationCaseBriefs: [
      {
        id: 'planetary-orbit-solar-mass',
        taskDemandDe: 'Schätze aus Umlaufzeit und großer Halbachse eines Planeten die Sonnenmasse. Begründe die Newton-Kepler-Beziehung, führe SI-Einheiten und Unsicherheiten und prüfe die Größenordnung.',
        taskDemandEn: 'Estimate the solar mass from a planet’s orbital period and semimajor axis. Justify the Newton-Kepler relation, carry SI units and uncertainties, and check the order of magnitude.',
        expectedPerformanceDe: 'Die lernende Person erschließt die Masse aus Bewegung, dokumentiert die Punktmassen- und Zweikörpernäherung und erklärt, weshalb das Resultat hier näherungsweise der Sonnenmasse entspricht.',
        expectedPerformanceEn: 'The learner infers mass from motion, documents the point-mass and two-body approximation, and explains why the result approximates the solar mass in this case.',
        understandingFocusDe: 'Der Fall prüft die vollständige Modellinferenz statt einer Formelsammlungseinsetzung.',
        understandingFocusEn: 'The case tests the complete model inference rather than formula-sheet substitution.',
      },
      {
        id: 'massive-companion-relative-orbit',
        taskDemandDe: 'Für ein exzentrisches Zweikörpersystem mit massereichem Begleiter sind Periode und Bahndaten beider Komponenten gegeben. Wähle die korrekte Halbachse und Zielmasse und erkläre die Änderung gegenüber dem Planetenfall.',
        taskDemandEn: 'For an eccentric two-body system with a massive companion, the period and orbital data for both components are given. Choose the correct semimajor axis and target mass and explain the change from the planetary case.',
        expectedPerformanceDe: 'Die lernende Person verwendet die große Halbachse der Relativbahn, bestimmt die Gesamtmasse und lehnt die unbegründete Gleichsetzung mit der Sonnenmasse ab.',
        expectedPerformanceEn: 'The learner uses the semimajor axis of the relative orbit, determines total mass, and rejects an unjustified identification with solar mass.',
        understandingFocusDe: 'Der Transfer prüft die Grenzen der sonnenzentrierten Näherung.',
        understandingFocusEn: 'The transfer tests the limits of the Sun-dominated approximation.',
      },
    ],
  }],
  ['9851bd02-ca48-5ce4-8e9f-9ec4af1c43b8', {
    archetype: 'modeling',
    selectionReasonDe: 'Runde A macht Messort, Bezugsfläche, Abstandsprognose, Unsicherheit und die Prüfung von Isotropie beziehungsweise Abschwächung besonders explizit.',
    selectionReasonEn: 'Round A makes the measurement location, reference area, distance prediction, uncertainty, and the test of isotropy or attenuation especially explicit.',
    additionalExpectation: {
      id: 'local-flux-is-not-total-power',
      essentialUnderstandingDe: 'Bestrahlungsstärke ist eine lokale Leistung pro Fläche; Leuchtkraft ist die Gesamtleistung der Quelle. Die Umrechnung über 4πr² ist eine geometrisch und physikalisch begründete Inferenz unter isotroper, stationärer und ungeschwächter Ausbreitung.',
      essentialUnderstandingEn: 'Irradiance is local power per area; luminosity is the source’s total power. Conversion through 4πr² is a geometrically and physically justified inference under isotropic, steady, unattenuated propagation.',
      observablePerformanceDe: 'Die lernende Person markiert Messort und Kugelfläche, sagt die 1/r²-Skalierung voraus und trennt Messwert, Ausbreitungsannahme und erschlossene Gesamtleistung.',
      observablePerformanceEn: 'The learner marks the measurement location and spherical area, predicts the 1/r² scaling, and separates measurement, propagation assumption, and inferred total power.',
    },
    variationAxes: [
      { id: 'distance', textDe: 'Messung am Erdabstand oder in einem anderen bekannten Abstand', textEn: 'Measurement at Earth’s distance or another known distance' },
      { id: 'emission-pattern', textDe: 'Isotrope, gerichtete oder teilweise abgeschwächte Abstrahlung', textEn: 'Isotropic, directional, or partly attenuated emission' },
      { id: 'uncertainty-source', textDe: 'Unsicherheit der Bestrahlungsstärke, des Abstands oder beider Größen', textEn: 'Uncertainty in irradiance, distance, or both quantities' },
    ],
    applicationCaseBriefs: [
      {
        id: 'solar-constant-to-luminosity',
        taskDemandDe: 'Schätze aus Solarkonstante und Sonne-Erde-Abstand die Sonnenleuchtkraft. Zeichne Messort und zugehörige Kugelfläche, prognostiziere die Abstandsabhängigkeit und führe Einheiten und Unsicherheiten.',
        taskDemandEn: 'Estimate solar luminosity from the solar constant and Sun-Earth distance. Draw the measurement location and corresponding spherical area, predict the distance dependence, and carry units and uncertainties.',
        expectedPerformanceDe: 'Die lernende Person erhält eine Leistung in Watt, erklärt den Faktor 4πr² und sagt ausdrücklich, dass nur die lokale Bestrahlungsstärke direkt gemessen wurde.',
        expectedPerformanceEn: 'The learner obtains power in watts, explains the factor 4πr², and explicitly states that only the local irradiance was measured directly.',
        understandingFocusDe: 'Der Fall prüft die Inferenz von lokaler Flussdichte zur Gesamtleistung.',
        understandingFocusEn: 'The case tests inference from local flux density to total power.',
      },
      {
        id: 'anisotropic-or-attenuated-source',
        taskDemandDe: 'Für eine andere Quelle ist die Bestrahlungsstärke in bekanntem Abstand gegeben, zugleich aber gerichtete Emission oder Abschwächung dokumentiert. Entscheide, ob 4πr² unverändert verwendet werden darf, und begrenze die Leuchtkraftinferenz.',
        taskDemandEn: 'For another source, irradiance is supplied at a known distance, but directional emission or attenuation is documented. Decide whether 4πr² may be used unchanged and bound the luminosity inference.',
        expectedPerformanceDe: 'Die lernende Person benennt die verletzte Annahme, passt den Raumwinkel- oder Transmissionsfaktor an, falls Daten vorliegen, oder verweigert eine unbegründet eindeutige Gesamtleistung.',
        expectedPerformanceEn: 'The learner identifies the violated assumption, adjusts a solid-angle or transmission factor if data are available, or declines to assert an unjustified unique total power.',
        understandingFocusDe: 'Der Transfer prüft Gültigkeitsgrenzen der Kugelverteilung.',
        understandingFocusEn: 'The transfer tests the validity limits of spherical spreading.',
      },
    ],
  }],
  ['6e1cd027-040b-51d9-8764-3cf3daddb5ec', {
    archetype: 'representation',
    selectionReasonDe: 'Runde A trennt heliozentrische Modellansicht und beobachtete Himmelsperspektive besonders klar und bindet Blickrichtung, Sonnenrichtung, Winkel sowie den Wechsel zwischen inneren und äußeren Planeten.',
    selectionReasonEn: 'Round A particularly clearly separates the heliocentric model view from the observed sky perspective and binds line of sight, solar direction, angles, and the change between inner and outer planets.',
    additionalExpectation: {
      id: 'elongation-links-geometry-to-observing-time',
      essentialUnderstandingDe: 'Die Elongation ist der vom irdischen Beobachter gesehene Winkel zwischen Planet und Sonne. Sie verbindet die heliozentrische Konstellation mit Morgen-, Abend- oder fehlender Nachtsichtbarkeit und ist nicht mit dem Bahnpositionswinkel am Sonnenzentrum gleichzusetzen.',
      essentialUnderstandingEn: 'Elongation is the angle between planet and Sun as seen by the terrestrial observer. It connects the heliocentric configuration with morning, evening, or absent nighttime visibility and is not the orbital position angle at the Sun.',
      observablePerformanceDe: 'Die lernende Person konstruiert die Beobachterblicklinien, bestimmt qualitativ oder quantitativ die Elongation und leitet daraus Sichtbarkeit und Tageszeit mit korrekter Perspektive ab.',
      observablePerformanceEn: 'The learner constructs the observer’s lines of sight, determines elongation qualitatively or quantitatively, and derives visibility and time of day from the correct perspective.',
    },
    variationAxes: [
      { id: 'planet-type', textDe: 'Innerer oder äußerer Planet', textEn: 'Inner or outer planet' },
      { id: 'configuration', textDe: 'Konjunktion, größte Elongation, Opposition oder Zwischenstellung', textEn: 'Conjunction, greatest elongation, opposition, or intermediate configuration' },
      { id: 'representation-mode', textDe: 'Geometrische Zeichnung oder Simulation mit veränderter Beobachterposition', textEn: 'Geometric drawing or simulation with changed observer position' },
    ],
    applicationCaseBriefs: [
      {
        id: 'inner-planet-evening-visibility',
        taskDemandDe: 'Konstruiere für einen inneren Planeten in gegebener Bahnstellung Sonne, Erde, Planet, Blickrichtungen und Elongation. Entscheide, ob er morgens, abends oder nachts nicht gut sichtbar ist, und begründe die Aussage.',
        taskDemandEn: 'For an inner planet at a specified orbital position, construct the Sun, Earth, planet, lines of sight, and elongation. Decide whether it is visible in the morning, evening, or not well at night and justify the conclusion.',
        expectedPerformanceDe: 'Die lernende Person übersetzt die heliozentrische Geometrie in die irdische Himmelsrichtung, berücksichtigt Sonnenabstand und Dunkelheit und nennt Modellvereinfachungen.',
        expectedPerformanceEn: 'The learner translates heliocentric geometry into terrestrial sky direction, considers angular separation from the Sun and darkness, and states model simplifications.',
        understandingFocusDe: 'Der Fall prüft den Perspektivwechsel vom Bahnmodell zur Beobachtung.',
        understandingFocusEn: 'The case tests the perspective change from orbital model to observation.',
      },
      {
        id: 'outer-planet-opposition-transfer',
        taskDemandDe: 'Ändere das Modell auf einen äußeren Planeten nahe Opposition und anschließend nahe Konjunktion. Prognostiziere Elongation, Aufgangszeit und Nachtsichtbarkeit jeweils vor der Simulation.',
        taskDemandEn: 'Change the model to an outer planet near opposition and then near conjunction. Predict elongation, rising time, and nighttime visibility before running the simulation.',
        expectedPerformanceDe: 'Die lernende Person erkennt große Elongation und lange Nachtsichtbarkeit bei Opposition sowie Sonnennähe und eingeschränkte Sichtbarkeit bei Konjunktion.',
        expectedPerformanceEn: 'The learner recognizes large elongation and long nighttime visibility at opposition and solar proximity with limited visibility at conjunction.',
        understandingFocusDe: 'Der Transfer prüft die Anpassung des Modells an einen anderen Planetentyp.',
        understandingFocusEn: 'The transfer tests adaptation of the model to another planet type.',
      },
    ],
  }],
  ['44766569-6379-5fbc-8976-cd3fc2fd6ec4', {
    archetype: 'modeling',
    selectionReasonDe: 'Runde A bindet die Relativbewegung an einen expliziten historischen Modellvergleich nach Vorhersagegüte, Kohärenz, Einfachheit und zeitgenössischen Beobachtungsmöglichkeiten.',
    selectionReasonEn: 'Round A binds relative motion to an explicit historical model comparison using predictive performance, coherence, simplicity, and contemporary observational capability.',
    additionalExpectation: {
      id: 'retrograde-motion-is-not-an-isolated-proof',
      essentialUnderstandingDe: 'Die scheinbare Richtungsumkehr folgt im heliozentrischen Modell aus Projektion und relativer Bewegung. Historische geozentrische Modelle konnten die Beobachtung mit Zusatzkonstruktionen ebenfalls darstellen; ihre Bedeutung entsteht daher aus einem breiteren Modellvergleich, nicht aus einem isolierten Beweis.',
      essentialUnderstandingEn: 'The apparent reversal follows in the heliocentric model from projection and relative motion. Historical geocentric models could also represent the observation with additional constructions; its significance therefore arises from a broader model comparison, not an isolated proof.',
      observablePerformanceDe: 'Die lernende Person rekonstruiert die Schleife geometrisch, vergleicht zwei Modelle anhand offengelegter Kriterien und formuliert ein historisch begrenztes Urteil ohne monokausale Erfolgsgeschichte.',
      observablePerformanceEn: 'The learner reconstructs the loop geometrically, compares two models using explicit criteria, and states a historically bounded judgment without a monocausal success narrative.',
    },
    variationAxes: [
      { id: 'planet-speed', textDe: 'Innere oder äußere Planeten mit unterschiedlichen relativen Umlaufgeschwindigkeiten', textEn: 'Inner or outer planets with different relative orbital speeds' },
      { id: 'historical-model', textDe: 'Heliozentrische Relativbewegung und bereitgestellte geozentrische Zusatzkonstruktion', textEn: 'Heliocentric relative motion and a supplied geocentric auxiliary construction' },
      { id: 'comparison-criterion', textDe: 'Vorhersagegüte, Kohärenz, Einfachheit und verfügbare Beobachtungsgenauigkeit', textEn: 'Predictive performance, coherence, simplicity, and available observational precision' },
    ],
    applicationCaseBriefs: [
      {
        id: 'mars-retrograde-model-comparison',
        taskDemandDe: 'Erkläre eine Folge beobachteter Marspositionen durch ein selbst konstruiertes heliozentrisches Relativbewegungsdiagramm. Vergleiche die Erklärung mit einem bereitgestellten historischen geozentrischen Modell nach expliziten Kriterien.',
        taskDemandEn: 'Explain a sequence of observed Mars positions using a self-constructed heliocentric relative-motion diagram. Compare the explanation with a supplied historical geocentric model using explicit criteria.',
        expectedPerformanceDe: 'Die lernende Person zeigt die projizierte Richtungsumkehr, trennt Beschreibung und Erklärung und beurteilt Vorhersagegüte, Kohärenz und Zusatzannahmen ohne die Schleife als Einzelbeweis auszugeben.',
        expectedPerformanceEn: 'The learner shows the projected reversal, separates description from explanation, and assesses predictive performance, coherence, and auxiliary assumptions without presenting the loop as a single proof.',
        understandingFocusDe: 'Der Fall verbindet physikalische Geometrie und reflektierte Wissenschaftsgeschichte.',
        understandingFocusEn: 'The case connects physical geometry and reflective history of science.',
      },
      {
        id: 'changed-relative-speed-transfer',
        taskDemandDe: 'Für einen anderen Planeten werden relative Bahngeschwindigkeiten verändert. Sage Zeitpunkt und Form der Schleife voraus und beurteile, wie eine neue Messabweichung die historischen Modelle nach denselben Kriterien gewichten würde.',
        taskDemandEn: 'For another planet, relative orbital speeds are changed. Predict the timing and shape of the loop and assess how a new measurement discrepancy would weigh the historical models under the same criteria.',
        expectedPerformanceDe: 'Die lernende Person überträgt die Projektionslogik, begründet die veränderte Schleife und revidiert das Modellurteil evidenzabhängig.',
        expectedPerformanceEn: 'The learner transfers the projection logic, justifies the changed loop, and revises the model judgment in light of evidence.',
        understandingFocusDe: 'Der Transfer prüft allgemeine Relativbewegung und revisionsfähigen Modellvergleich.',
        understandingFocusEn: 'The transfer tests general relative motion and revisable model comparison.',
      },
    ],
  }],
  ['206a7d3d-9b11-56be-89ff-73898445c4f5', {
    archetype: 'data',
    selectionReasonDe: 'Runde A trennt Messgröße, Kalibriergröße und erschlossene Entfernung, bindet die teilweise aufeinander aufbauende Entfernungsskala ein und prüft Extinktion sowie fehlende Kalibratoren.',
    selectionReasonEn: 'Round A distinguishes observable, calibration quantity, and inferred distance, incorporates the partly interdependent distance scale, and tests extinction and missing calibrators.',
    additionalExpectation: {
      id: 'method-choice-follows-range-and-calibration',
      essentialUnderstandingDe: 'Astronomische Entfernungen werden indirekt über kalibrierte Beziehungen erschlossen. Ein Verfahren ist nur dann geeignet, wenn Zielobjekt, Entfernungsbereich, beobachtbare Größe und Kalibration zusammenpassen; statistische und systematische Unsicherheiten sind getrennt zu beurteilen.',
      essentialUnderstandingEn: 'Astronomical distances are inferred indirectly through calibrated relationships. A method is suitable only when target object, distance range, observable, and calibration match; statistical and systematic uncertainties must be assessed separately.',
      observablePerformanceDe: 'Die lernende Person begründet die Verfahrenswahl, legt die ganze Inferenzkette offen, vergleicht mindestens eine Alternative und lehnt eine Entfernung ab, wenn Kalibration oder Gültigkeitsbereich fehlen.',
      observablePerformanceEn: 'The learner justifies method choice, makes the entire inference chain explicit, compares at least one alternative, and declines to report a distance when calibration or validity range is missing.',
    },
    variationAxes: [
      { id: 'distance-indicator', textDe: 'Standardkerze, Standardlineal, Rotverschiebungsbeziehung oder geometrische Kalibration', textEn: 'Standard candle, standard ruler, redshift relation, or geometric calibration' },
      { id: 'distance-range', textDe: 'Nahe, mittlere oder große kosmologische Entfernung', textEn: 'Nearby, intermediate, or large cosmological distance' },
      { id: 'systematic-effect', textDe: 'Extinktion, Metallizität, Populationsabhängigkeit oder fehlender Kalibrator', textEn: 'Extinction, metallicity, population dependence, or missing calibrator' },
    ],
    applicationCaseBriefs: [
      {
        id: 'calibrated-standard-candle-galaxy',
        taskDemandDe: 'Für eine Galaxie sind Daten eines geeigneten kalibrierten Standardkerzen-Verfahrens einschließlich Extinktions- und Messunsicherheit gegeben. Bestimme die Entfernung und vergleiche sie mit einem zweiten Verfahren.',
        taskDemandEn: 'For a galaxy, data from a suitable calibrated standard-candle method are supplied, including extinction and measurement uncertainty. Determine the distance and compare it with a second method.',
        expectedPerformanceDe: 'Die lernende Person trennt beobachtete Größe, Kalibration und Distanzinferenz, propagiert relevante Unsicherheiten und erklärt eine mögliche systematische Differenz.',
        expectedPerformanceEn: 'The learner separates observable, calibration, and distance inference, propagates relevant uncertainties, and explains a possible systematic difference.',
        understandingFocusDe: 'Der Fall prüft die vollständige kalibrierte Inferenzkette.',
        understandingFocusEn: 'The case tests the complete calibrated inference chain.',
      },
      {
        id: 'range-limit-and-missing-calibrator',
        taskDemandDe: 'Bei einer deutlich weiter entfernten oder stark extinktierten Galaxie fehlt der bisherige Kalibrator. Entscheide zwischen alternativen Verfahren oder begründe, warum die Daten keine belastbare Entfernung zulassen.',
        taskDemandEn: 'For a substantially more distant or strongly extinguished galaxy, the previous calibrator is unavailable. Choose among alternative methods or explain why the data do not support a reliable distance.',
        expectedPerformanceDe: 'Die lernende Person prüft Reichweite, Zielobjekteigenschaften und systematische Effekte, wählt begründet neu und kennzeichnet modellabhängige Aussagen.',
        expectedPerformanceEn: 'The learner checks range, target properties, and systematic effects, makes a new justified choice, and identifies model-dependent claims.',
        understandingFocusDe: 'Der Transfer prüft Methodenwahl statt universeller Rezeptanwendung.',
        understandingFocusEn: 'The transfer tests method choice rather than universal recipe use.',
      },
    ],
  }],
  ['44f0eefa-2d93-5954-879f-f6c49e5cebc7', {
    archetype: 'modeling',
    selectionReasonDe: 'Runde A verbindet Einheitenumrechnung und Größenordnungsprüfung mit einer veränderlichen Expansionsgeschichte und verlangt für Abbremsung oder Beschleunigung eine begründete Richtung des Modellfehlers.',
    selectionReasonEn: 'Round A connects unit conversion and order-of-magnitude checking with a changing expansion history and requires a justified direction of model error for deceleration or acceleration.',
    additionalExpectation: {
      id: 'inverse-hubble-parameter-is-a-timescale',
      essentialUnderstandingDe: 'Der Kehrwert des heutigen Hubble-Parameters ist zunächst eine Zeitskala. Nur eine idealisiert konstante Expansionsrate erlaubt die unmittelbare Rückextrapolation auf ein Alter; reale Expansionsgeschichte verändert den Zusammenhang.',
      essentialUnderstandingEn: 'The reciprocal of the present Hubble parameter is first a time scale. Only an idealized constant expansion rate permits direct backward extrapolation to an age; the real expansion history changes the relationship.',
      observablePerformanceDe: 'Die lernende Person unterscheidet Hubble-Zeit und kosmologisches Alter, benennt die Expansionsannahme und sagt für eine vorgegebene frühere Abbremsung oder spätere Beschleunigung die Richtung der Abweichung begründet voraus.',
      observablePerformanceEn: 'The learner distinguishes Hubble time from cosmological age, states the expansion assumption, and justifiably predicts the direction of the discrepancy for a specified earlier deceleration or later acceleration.',
    },
    variationAxes: [
      { id: 'hubble-data', textDe: 'Gegebener Parameter oder Steigung aus streuenden Geschwindigkeits-Entfernungs-Daten', textEn: 'Given parameter or slope from scattered velocity-distance data' },
      { id: 'unit-form', textDe: 'Kilometer pro Sekunde pro Megaparsec oder inverse SI-Zeit', textEn: 'Kilometres per second per megaparsec or inverse SI time' },
      { id: 'expansion-history', textDe: 'Konstant, früher abgebremst oder spät beschleunigt', textEn: 'Constant, formerly decelerating, or late-time accelerating' },
    ],
    applicationCaseBriefs: [
      {
        id: 'hubble-slope-to-timescale',
        taskDemandDe: 'Bestimme aus bereitgestellten Galaxien-Daten eine begründete Hubble-Steigung, rechne ihren Kehrwert transparent in Jahre um und beurteile die Aussage, dies sei ohne weitere Annahmen das gemessene Universumsalter.',
        taskDemandEn: 'Determine a justified Hubble slope from supplied galaxy data, transparently convert its reciprocal into years, and assess the claim that this is the measured age of the universe without further assumptions.',
        expectedPerformanceDe: 'Die lernende Person berücksichtigt Streuung, führt die Einheiten vollständig, prüft die Größenordnung und weist den unbedingten Altersanspruch als Modellüberschreitung zurück.',
        expectedPerformanceEn: 'The learner accounts for scatter, carries units fully, checks the order of magnitude, and rejects the unconditional age claim as exceeding the model.',
        understandingFocusDe: 'Der Fall prüft Dateninferenz, Einheiten und Deutungsgrenze zusammen.',
        understandingFocusEn: 'The case jointly tests data inference, units, and interpretive limits.',
      },
      {
        id: 'nonconstant-expansion-transfer',
        taskDemandDe: 'Vergleiche eine idealisiert konstante Expansion mit einer vorgegebenen Geschichte früherer Abbremsung und später Beschleunigung. Sage vor einer Modellrechnung voraus, ob die heutige Hubble-Zeit das wahre Alter über- oder unterschätzt.',
        taskDemandEn: 'Compare idealized constant expansion with a supplied history of earlier deceleration and later acceleration. Before a model calculation, predict whether the present Hubble time over- or underestimates the true age.',
        expectedPerformanceDe: 'Die lernende Person argumentiert über die Rückextrapolation der Expansionsrate und begrenzt die Richtungsaussage auf die vorgegebene Geschichte.',
        expectedPerformanceEn: 'The learner reasons from backward extrapolation of the expansion rate and bounds the directional claim to the supplied history.',
        understandingFocusDe: 'Der Transfer verhindert die Gleichsetzung einer Zeitskala mit einem modellunabhängigen Alter.',
        understandingFocusEn: 'The transfer prevents equating a time scale with a model-independent age.',
      },
    ],
  }],
  ['c53b3f0c-b4fe-5509-8803-a36c2883e5d6', {
    archetype: 'data',
    selectionReasonDe: 'Runde A verbindet den quantitativen Kurvenvergleich mit eingeschlossener Masse, Masse-Licht-Verhältnis und Gravitationsmodell und fordert eine unabhängige Prüfung durch andere baryonische Verteilung oder Linsendaten.',
    selectionReasonEn: 'Round A connects quantitative curve comparison with enclosed mass, mass-to-light ratio, and the gravitational model and requires an independent check using another baryonic distribution or lensing data.',
    additionalExpectation: {
      id: 'dark-matter-claim-is-model-mediated',
      essentialUnderstandingDe: 'Eine flache äußere Rotationskurve ist unter einem Gravitationsmodell und einer Schätzung der sichtbaren Materieverteilung indirekte Evidenz für zusätzliche gravitative Masse. Sie ist weder eine direkte Beobachtung dunkler Materie noch ohne Bahnneigung, Masse-Licht-Verhältnis und Alternativmodelle eindeutig.',
      essentialUnderstandingEn: 'Under a gravitational model and an estimate of the visible-matter distribution, a flat outer rotation curve is indirect evidence for additional gravitating mass. It is neither a direct observation of dark matter nor unique without inclination, mass-to-light ratio, and alternative-model considerations.',
      observablePerformanceDe: 'Die lernende Person trennt Geschwindigkeitsdaten, sichtbare-Materie-Modell, Erwartungskurve und Inferenz, quantifiziert wichtige Unsicherheiten und beurteilt, wie unabhängige Evidenz die Schlussstärke verändert.',
      observablePerformanceEn: 'The learner separates velocity data, visible-matter model, expected curve, and inference, quantifies important uncertainties, and assesses how independent evidence changes the strength of the conclusion.',
    },
    variationAxes: [
      { id: 'mass-distribution', textDe: 'Zentral konzentrierte, scheibenförmige oder anders verteilte baryonische Materie', textEn: 'Centrally concentrated, disk-like, or otherwise distributed baryonic matter' },
      { id: 'measurement-geometry', textDe: 'Unterschiedliche Bahnneigung, Geschwindigkeitsunsicherheit oder radiale Reichweite', textEn: 'Different inclination, velocity uncertainty, or radial coverage' },
      { id: 'independent-evidence', textDe: 'Keine Zusatzdaten, Gravitationslinsen- oder andere dynamische Massendaten', textEn: 'No additional data, gravitational-lensing data, or other dynamical mass data' },
    ],
    applicationCaseBriefs: [
      {
        id: 'rotation-curve-mass-discrepancy',
        taskDemandDe: 'Vergleiche für eine Galaxie beobachtete und aus der sichtbaren Materieverteilung erwartete Rotationskurve. Sage den äußeren Verlauf voraus, erschließe eingeschlossene Masse und bewerte die Abweichung samt Unsicherheiten.',
        taskDemandEn: 'For a galaxy, compare the observed rotation curve with that expected from the visible-matter distribution. Predict the outer trend, infer enclosed mass, and assess the discrepancy together with uncertainties.',
        expectedPerformanceDe: 'Die lernende Person liest die Kurven quantitativ, verbindet v²r/G mit eingeschlossener Masse, trennt leuchtende und benötigte Masse und formuliert den Dunkle-Materie-Schluss ausdrücklich modellgebunden.',
        expectedPerformanceEn: 'The learner reads the curves quantitatively, connects v²r/G with enclosed mass, separates luminous from required mass, and states the dark-matter inference explicitly as model-bound.',
        understandingFocusDe: 'Der Fall prüft die gesamte Daten-Modell-Inferenzkette.',
        understandingFocusEn: 'The case tests the entire data-model-inference chain.',
      },
      {
        id: 'inclination-and-lensing-transfer',
        taskDemandDe: 'Für eine zweite Galaxie werden Bahnneigung und sichtbare Massenverteilung revidiert; zusätzlich liegen Linsendaten vor. Konstruiere die Erwartung neu und entscheide, ob die unabhängige Evidenz den ursprünglichen Schluss stärkt, schwächt oder offenlässt.',
        taskDemandEn: 'For a second galaxy, inclination and visible-matter distribution are revised; lensing data are also available. Reconstruct the expectation and decide whether the independent evidence strengthens, weakens, or leaves open the original conclusion.',
        expectedPerformanceDe: 'Die lernende Person korrigiert Geschwindigkeiten und Erwartung, vergleicht unabhängige Massenindikatoren und revidiert die Schlussstärke statt die Erstdeutung unverändert zu wiederholen.',
        expectedPerformanceEn: 'The learner corrects velocities and expectations, compares independent mass indicators, and revises the strength of the conclusion instead of repeating the initial interpretation unchanged.',
        understandingFocusDe: 'Der Transfer prüft Unsicherheits-, Alternativ- und Evidenzverständnis.',
        understandingFocusEn: 'The transfer tests understanding of uncertainty, alternatives, and evidence.',
      },
    ],
  }],
])

const sha256 = (value: Buffer): string => createHash('sha256').update(value).digest('hex')
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)

const parseJsonl = (bytes: Buffer): ReviewRecord[] => bytes.toString('utf8').trim().split('\n')
  .filter(Boolean)
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
  if (
    sha256(roundABytes) !== expectedRoundADigest
    || sha256(roundBBytes) !== expectedRoundBDigest
    || sha256(dualSummaryBytes) !== expectedDualSummaryDigest
    || sha256(adjudicationBytes) !== expectedAdjudicationDigest
    || sha256(synthesisManifestBytes) !== expectedSynthesisManifestDigest
  ) {
    throw new Error('Physics B023 stable11 evidence source digest changed')
  }

  const rounds = { first: parseJsonl(roundABytes), second: parseJsonl(roundBBytes) }
  const dualSummary = JSON.parse(dualSummaryBytes.toString('utf8')) as {
    goals: Array<{
      goalId: string
      agreement: string
      firstRecordId: string
      secondRecordId: string
    }>
  }
  const adjudication = JSON.parse(adjudicationBytes.toString('utf8')) as {
    counts?: { keep_current?: number; requiresProductOwnerDecision?: number }
    decisions?: Array<{ goalId?: string; resolutionDecision?: string }>
  }
  const synthesisManifest = JSON.parse(synthesisManifestBytes.toString('utf8')) as {
    decisions?: Array<{
      goalId?: string
      evidenceRound?: string
      resolutionDecision?: string
      records?: { second?: { recordId?: string; recordDigest?: string } }
    }>
  }
  const keepIds = adjudication.decisions
    ?.filter(({ resolutionDecision }) => resolutionDecision === 'keep_current')
    .map(({ goalId }) => goalId) ?? []
  if (
    adjudication.counts?.keep_current !== 11
    || adjudication.counts.requiresProductOwnerDecision !== 0
    || JSON.stringify(keepIds) !== JSON.stringify(goalIds)
    || selectedRecordIdByGoalId.size !== goalIds.length
    || profileDefinitions.size !== goalIds.length
    || synthesisManifest.decisions?.length !== goalIds.length
  ) {
    throw new Error('Physics B023 stable11 evidence scope or source adjudication is invalid')
  }

  const candidates: CandidateSet['goals'] = goalIds.map((goalId) => {
    const selectedRecordId = selectedRecordIdByGoalId.get(goalId)
    const definition = profileDefinitions.get(goalId)
    const manifestDecision = synthesisManifest.decisions?.find((decision) => decision.goalId === goalId)
    const summary = dualSummary.goals.find((goal) => goal.goalId === goalId)
    const selectedRecord = rounds.first.find((record) => record.goalId === goalId)
    const alternateRecord = rounds.second.find((record) => record.goalId === goalId)
    if (!selectedRecordId || !definition || !manifestDecision || !summary || !selectedRecord || !alternateRecord) {
      throw new Error(`${goalId}: missing evidence selection, profile definition, manifest decision, summary, or source record`)
    }
    if (
      manifestDecision.evidenceRound !== 'first'
      || manifestDecision.resolutionDecision !== 'keep_current'
      || manifestDecision.records?.second?.recordId !== alternateRecord.recordId
      || summary.agreement !== 'disagreement'
      || summary.firstRecordId !== selectedRecord.recordId
      || summary.secondRecordId !== alternateRecord.recordId
      || selectedRecord.recordId !== selectedRecordId
    ) {
      throw new Error(`${goalId}: evidence selection disagrees with the bound B023 synthesis or dual summary`)
    }
    for (const [label, record] of [['selected', selectedRecord], ['alternate', alternateRecord]] as const) {
      if (
        record.decision !== 'keep'
        || record.evidenceProfileContract !== 'positive-understanding-evidence-v2'
        || record.evidenceProfileRecommendation !== 'create'
        || record.recordStatus !== 'candidate'
        || record.reviewAuthority !== 'ai_candidate'
      ) {
        throw new Error(`${goalId}: ${label} B023 source record is not a valid KEEP V2 candidate`)
      }
    }

    const reviewedCore = {
      id: 'selected-blind-review-core',
      essentialUnderstandingDe: selectedRecord.understandingEvidence.essentialUnderstandingDe,
      essentialUnderstandingEn: selectedRecord.understandingEvidence.essentialUnderstandingEn,
      observablePerformanceDe: selectedRecord.understandingEvidence.observablePerformanceDe,
      observablePerformanceEn: selectedRecord.understandingEvidence.observablePerformanceEn,
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
    const alternateDigest = manifestDecision.records?.second?.recordDigest
    if (!alternateDigest?.startsWith('sha256:')) {
      throw new Error(`${goalId}: missing bound Round B record digest`)
    }
    return {
      goalId,
      reason: `DE: ${definition.selectionReasonDe} Das Profil übernimmt den Kernblock bytegetreu aus ${selectedRecord.recordId}, operationalisiert ihn in zwei unabhängigen frischen Fällen und bindet die kompatible Round-B-Fassung als Dissent. EN: ${definition.selectionReasonEn} The profile carries the core block byte-for-byte from ${selectedRecord.recordId}, operationalizes it in two independent fresh cases, and binds the compatible Round B formulation as dissent.`,
      evidenceLevel: 'E1',
      maximumClaimScope: 'G1',
      dissent: [
        `B023 evidence-formulation dissent remains bound: selected Round A record ${selectedRecord.recordId}; compatible Round B record ${alternateRecord.recordId} (${alternateDigest}) and its complete bilingual essential-understanding, observable-performance, and transfer blocks remain preserved in the exact dual summary and synthesis binding.`,
      ],
      profile,
    }
  })

  const output: CandidateSet = {
    schemaVersion: 1,
    authoringContract: 'positive-understanding-evidence-candidates-v1',
    reviewId: targetReviewId,
    reviewedAt: '2026-08-28T18:45:00.000Z',
    reviewer: 'codex-physics-b023-stable11-positive-evidence-candidate-2026-08-28',
    goals: candidates,
  }
  const bytes = jsonBytes(output)
  const current = await readOptional(targetPath)
  if (current && !current.equals(bytes)) {
    throw new Error(`Existing Physics B023 stable11 evidence candidates are stale: ${targetPath}`)
  }
  if (!current && !write) throw new Error(`Missing Physics B023 stable11 evidence candidates: ${targetPath}`)
  if (!current && write) await writeFile(targetPath, bytes, { flag: 'wx' })
  console.log(
    `${write ? 'Materialized' : 'Verified'} Physics B023 stable11 evidence candidates: ${candidates.length}/${goalIds.length}`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
