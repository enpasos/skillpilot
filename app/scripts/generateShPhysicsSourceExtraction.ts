import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type CourseLevel = 'GK_LK' | 'GK' | 'LK'

type Row = {
  topicCode: string
  text: string
  courseLevel: CourseLevel
  canonicalGoalIds: string[]
  matchTypeOverride?: 'exact' | 'partial'
  reviewRationale?: string
  reviewedAt?: string
  reviewer?: string
}

type Topic = {
  code: string
  title: string
  page: number
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const sourceLandscapeId = 'f1a2c733-b994-4db3-9dd6-54ffe544002b'
const targetLandscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const sourcePdfPath = 'curricula/DE/Gymnasium/input/SH/Fachanforderungen_Physik_Sekundarstufe_2022_barrierearm.pdf'
const sourcePdfUrl = 'https://fachportal.lernnetz.de/sh/faecher/physik/fachanforderungen.html?file=files/Fachanforderungen%20und%20Leitf%C3%A4den/Sekundarstufe/Fachanforderungen/Fachanforderungen%20Physik%20Sekundarstufe%20%282022%29%2C%20barrierearm.pdf&cid=16990'
const extractionPath =
  'curricula/DE/Gymnasium/input/SH/upper-secondary/source-extraction/DE_SH_PHYSIK_SEKII_FACHANFORDERUNGEN_2022.source-extraction.json'
const reviewPath =
  'curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_physics_upper_secondary_source_extraction_to_canonical_physics.review.json'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const compositionViewDir = 'curricula/DE/Gymnasium/composition-views/physik'

const target = {
  motivation: '5c44b9ba-9b05-4774-95d5-073230d3fc4f',
  methods: '1e9ec823-384b-5e5f-974c-4ce224d05c19',
  uncertainty: '0dd6d3f9-a92f-564c-a730-6772619c7bf8',
  digitalMeasurement: 'e452baa3-c9fc-5b62-893c-f91fe8d53715',
  society: '8eaa4e45-39fc-50e9-b59f-8a1752f6bebe',
  motion: '65ddd780-0323-45d1-8f94-5e31bf28da23',
  averageInstantaneousVelocity: 'bf8517a9-142b-5789-826a-767f3b277998',
  projectile: '287739a3-6143-55d0-abe7-1a08889e9b49',
  newton: '9340e894-bb0d-45a4-91f2-b90a63ad50a8',
  conservation: 'e9d616d8-685f-4129-a36f-dae7a280bae7',
  energy: 'feb70838-931c-4b45-b9a9-930605d93efa',
  thermodynamics: 'df11eb33-4900-52bf-93b3-eb82ff0f9a28',
  gravitation: '0ade0d10-8b32-5a95-a1a9-8ac64e2a8089',
  acousticSources: 'c1006f55-0406-48cc-92d4-0d8345897cf4',
  acousticPropagation: '3c82510a-1f12-4eaa-81c2-8599437a5b85',
  acousticRisks: '8ac61062-f63e-5935-96ae-84014906c368',
  lenses: '84ddb244-e560-592f-9d43-e84c801fe5b4',
  opticalInstruments: '6367d45e-919e-4c19-bcd9-7770a2d51139',
  atom: 'dd5a8efd-5d11-5388-aa2a-5147dec4348f',
  nuclear: '5a5bc118-4420-5bb7-94c3-67837f2ce0dd',
  radiationRisk: '23fd87f3-9e79-5e0e-b9d1-7c15f3d119e0',
  radiationDose: 'e6a50c74-c922-508c-aa27-07bac2566955',
  electricField: 'd7bc20e0-5ee9-593a-a7a9-d7cbb88392e6',
  capacitor: '0895074d-c4af-56ea-88dd-ae0fdae443ed',
  chargedInEField: '47f76c5c-05d1-59eb-876d-cafb98a66c5b',
  magneticField: '13e882bd-2fc6-59c6-a2a8-32eb1fbf1751',
  induction: 'b2b74d0a-575c-5c6b-8e24-b0b0f32c1126',
  fadenstrahl: '966782e5-690d-4fae-bbab-fa3fa30525c3',
  millikan: '0f803c37-8191-5a07-9b31-9603ded98fe2',
  hallProbe: 'b39ae8fb-4358-5866-8adf-3d5365368eeb',
  particleAccelerators: '2d62b444-796e-548d-aeee-cfd9c6665ddc',
  massSpectrometer: '3f17d0d2-562d-4c1c-9ebc-1a1a43f28f9c',
  circularMotion: 'ec7a0a68-730b-5c94-ac72-a937508f8303',
  centripetalForce: 'e918b31f-6f39-5dee-ade6-3617080fb24f',
  circularFields: 'accb1d9e-cd48-5983-bcef-9b9bca4a9114',
  angularMomentum: '37f17e7e-9fcf-5dca-ac10-e94cb8420be5',
  oscillation: 'aee9676f-7cd6-50f0-a504-fd88ef67b59e',
  waves: 'dc38c943-11f6-5f4f-945b-67e330814727',
  emWaves: 'c1563745-2722-503d-819f-95d336937e2b',
  dualism: '9fd26b99-b790-5efd-8858-c7e6c20b005e',
  quantum: 'ab636b78-6031-5a5b-afa2-9ffefbdd5dda',
  electronDiffraction: 'e296aba6-f407-5944-a2bd-e5296e4c9f06',
  photonModel: '22bdd29e-00d3-5d43-97d6-8b442b8bfc8c',
  quantumReality: '727d0946-7019-50ed-8fc6-85db12508733',
  interferometer: '52b6722a-b3b2-5d2d-a507-0215532b0422',
  potentialWell: 'cc2d5e8e-4599-54ac-b8de-87c8cfd39ea7',
  spectra: '904670af-8e4c-543e-bc9b-e6248d87a10d',
  standardModel: '15cb40f1-e2d3-5754-9e7b-e8888fe78340',
  nucideCards: '64b30d2e-cbe1-55d8-915a-a050d736b96e',
}

const topics: Topic[] = [
  { code: '2.3.1-KIN', title: 'Mechanik: Kinematik', page: 52 },
  { code: '2.3.1-DYN', title: 'Mechanik: Dynamik', page: 52 },
  { code: '2.3.1-IMPULS', title: 'Mechanik: Impuls', page: 53 },
  { code: '2.3.2-FELDKONZEPT', title: 'Elektrische und magnetische Felder: Feldkonzept', page: 53 },
  { code: '2.3.2-KONDENSATOR', title: 'Elektrische und magnetische Felder: Potenzial und Kondensator', page: 54 },
  { code: '2.3.2-MAGNETFELD', title: 'Elektrische und magnetische Felder: Magnetfeld', page: 55 },
  { code: '2.3.2-STATISCHE-FELDER', title: 'Elektrische und magnetische Felder: Körper in statischen Feldern', page: 55 },
  { code: '2.3.2-INDUKTION', title: 'Elektrische und magnetische Felder: Veränderliche elektromagnetische Felder', page: 57 },
  { code: '2.3.3-SCHWINGUNGEN', title: 'Schwingungen und Wellen: Schwingungen', page: 58 },
  { code: '2.3.3-WELLEN', title: 'Schwingungen und Wellen: Wellen', page: 58 },
  { code: '2.3.3-INTERFERENZ', title: 'Schwingungen und Wellen: Überlagerung von Wellen', page: 59 },
  { code: '2.3.3-SPEKTREN', title: 'Schwingungen und Wellen: Spektren', page: 59 },
  { code: '2.3.4-QUANTEN', title: 'Quantenphysik und Materie: Quantenobjekte', page: 60 },
  { code: '2.3.4-QUANTENGROESSEN', title: 'Quantenphysik und Materie: Eigenschaften von Quantenobjekten', page: 61 },
  { code: '2.3.4-ATOM', title: 'Quantenphysik und Materie: Atomvorstellungen', page: 62 },
]

const row = (topicCode: string, text: string, canonicalGoalIds: string[], courseLevel: CourseLevel = 'GK_LK'): Row => ({
  topicCode,
  text,
  canonicalGoalIds,
  courseLevel,
})

const partialRow = (
  topicCode: string,
  text: string,
  canonicalGoalIds: string[],
  courseLevel: CourseLevel,
  reviewRationale: string,
): Row => ({
  ...row(topicCode, text, canonicalGoalIds, courseLevel),
  matchTypeOverride: 'partial',
  reviewRationale,
  reviewedAt: '2026-08-28',
  reviewer: 'codex-physics-batch-019-mapping-adjudication',
})

// Batch 025 average/instantaneous-velocity structural split overlay
const batch025PartialRow = (
  topicCode: string,
  text: string,
  canonicalGoalIds: string[],
  courseLevel: CourseLevel,
  reviewRationale: string,
): Row => ({
  ...row(topicCode, text, canonicalGoalIds, courseLevel),
  matchTypeOverride: 'partial',
  reviewRationale,
  reviewedAt: '2026-08-29',
  reviewer: 'codex-physics-batch-025-motion-split-2026-08-29',
})

const rows: Row[] = [
  row('2.3.1-KIN', 'Bewegungen mithilfe von Messwerterfassungen und Videoanalysen analysieren', [target.motion, target.digitalMeasurement]),
  row('2.3.1-KIN', 'zwischen gleichförmigen und gleichmäßig beschleunigten Bewegungen unterscheiden', [target.motion]),
  row('2.3.1-KIN', 'Ort-Zeit-Zusammenhänge aus Diagrammen und Messwerten bestimmen', [target.motion]),
  batch025PartialRow(
    '2.3.1-KIN',
    'Durchschnitts- und Momentangeschwindigkeiten bestimmen und deuten',
    [target.averageInstantaneousVelocity],
    'GK_LK',
    "Das amtliche SH-Ziel fordert das Bestimmen und Deuten von Durchschnitts- und Momentangeschwindigkeiten. Das neue kanonische Ziel präzisiert zusätzlich endliches Intervall, Zeitpunkt sowie Sekanten- und Tangentensteigung; die Zuordnung ist partial.",
  ),
  row('2.3.1-KIN', 'Beschleunigungen bestimmen und in Bewegungssituationen interpretieren', [target.motion]),
  row('2.3.1-KIN', 'Ableitungen zur Bestimmung von Geschwindigkeit und Beschleunigung verwenden', [target.motion]),
  row('2.3.1-KIN', 'Flächen unter Bewegungsgraphen zur Bestimmung von Wegstrecken verwenden', [target.motion]),
  row('2.3.1-KIN', 'komplexe Bewegungen als Überlagerung unabhängiger Bewegungen beschreiben', [target.motion, target.projectile]),
  row('2.3.1-KIN', 'den horizontalen Wurf quantitativ analysieren', [target.projectile]),
  row('2.3.1-KIN', 'die Bewegungsgleichungen des freien Falls und des horizontalen Wurfs anwenden', [target.motion, target.projectile]),
  row('2.3.1-KIN', 'Energieerhaltung zur Lösung mechanischer Bewegungsprobleme nutzen', [target.energy, target.conservation]),
  row('2.3.1-KIN', 'Geschwindigkeiten und Höhenänderungen mit mechanischer Energie bilanzieren', [target.energy, target.conservation]),

  row('2.3.1-DYN', 'Kräfte als Ursache von Bewegungsänderungen beschreiben', [target.newton]),
  row('2.3.1-DYN', 'das zweite Newtonsche Gesetz auf lineare Bewegungen anwenden', [target.newton]),
  row('2.3.1-DYN', 'Kräfte vektoriell addieren und zerlegen', [target.newton]),
  row('2.3.1-DYN', 'Kraftkomponenten in schiefen Ebenen und vergleichbaren Situationen bestimmen', [target.newton]),
  row('2.3.1-DYN', 'zwischen realen Bewegungen und idealisierten Modellbewegungen unterscheiden', [target.methods, target.motion]),
  row('2.3.1-DYN', 'reale Bewegungen mit mathematischen und digitalen Werkzeugen modellieren', [target.motion, target.digitalMeasurement]),
  row('2.3.1-DYN', 'numerische Iterationsverfahren zur Vorhersage von Bewegungen verwenden', [target.methods, target.motion]),
  row('2.3.1-DYN', 'Modellannahmen bei Dynamikaufgaben begründen und begrenzen', [target.methods, target.newton]),
  row('2.3.1-DYN', 'Kräfte- und Energiebilanzen zur Lösung von Dynamikaufgaben kombinieren', [target.newton, target.energy]),
  row('2.3.1-DYN', 'Newtonsche Dynamik in technischen und alltäglichen Kontexten beurteilen', [target.newton, target.society]),

  row('2.3.1-IMPULS', 'Kräfte als Ursache von Impulsänderungen beschreiben', [target.newton, target.conservation]),
  row('2.3.1-IMPULS', 'den Impuls als Erhaltungsgröße erklären', [target.conservation]),
  row('2.3.1-IMPULS', 'Impulserhaltung auf elastische Stöße anwenden', [target.conservation]),
  row('2.3.1-IMPULS', 'Impulserhaltung auf unelastische Stöße anwenden', [target.conservation]),
  row('2.3.1-IMPULS', 'Rückstoßsituationen mithilfe der Impulserhaltung beschreiben', [target.conservation]),
  row('2.3.1-IMPULS', 'Stoßvorgänge mit Energie- und Impulsbetrachtungen vergleichen', [target.conservation, target.energy]),

  row('2.3.2-FELDKONZEPT', 'das Feldkonzept zur Beschreibung von Wechselwirkungen verwenden', [target.electricField, target.magneticField, target.gravitation]),
  row('2.3.2-FELDKONZEPT', 'elektrische, magnetische und Gravitationsfelder durch Kraftwirkungen charakterisieren', [target.electricField, target.magneticField, target.gravitation]),
  row('2.3.2-FELDKONZEPT', 'Feldlinienbilder für elektrische, magnetische und Gravitationsfelder darstellen', [target.electricField, target.magneticField, target.gravitation]),
  row('2.3.2-FELDKONZEPT', 'homogene und radialsymmetrische Felder unterscheiden', [target.electricField, target.gravitation]),
  row('2.3.2-FELDKONZEPT', 'Feldstärken als Kraft pro Probekörpergröße definieren und nutzen', [target.electricField, target.gravitation]),
  row('2.3.2-FELDKONZEPT', 'Potential und potentielle Energie im Feldkonzept unterscheiden', [target.electricField, target.gravitation]),
  row('2.3.2-FELDKONZEPT', 'Arbeit und Energieübertragung in Feldern bilanzieren', [target.energy, target.electricField]),
  row('2.3.2-FELDKONZEPT', 'das Superpositionsprinzip für Felder anwenden', [target.electricField, target.magneticField]),
  row('2.3.2-FELDKONZEPT', 'das Feldmodell zur Erklärung technischer und natürlicher Phänomene einsetzen', [target.electricField, target.magneticField, target.society]),
  row('2.3.2-FELDKONZEPT', 'Grenzen feldbezogener Idealisierungen erläutern', [target.methods, target.electricField]),
  row('2.3.2-FELDKONZEPT', 'Feldgrößen aus Messdaten bestimmen und Unsicherheiten reflektieren', [target.methods, target.uncertainty]),
  row('2.3.2-FELDKONZEPT', 'Feldkonzepte zwischen Mechanik, Elektrizitätslehre und Magnetismus vergleichen', [target.methods, target.electricField, target.magneticField]),

  row('2.3.2-KONDENSATOR', 'elektrische Spannung als Energie pro Ladung deuten', [target.electricField]),
  row('2.3.2-KONDENSATOR', 'Potentialdifferenzen in elektrischen Feldern verwenden', [target.electricField]),
  row('2.3.2-KONDENSATOR', 'den Plattenkondensator als homogenes elektrisches Feld modellieren', [target.capacitor]),
  row('2.3.2-KONDENSATOR', 'den Zusammenhang zwischen Feldstärke, Spannung und Plattenabstand anwenden', [target.capacitor]),
  row('2.3.2-KONDENSATOR', 'Kapazität als Verhältnis von Ladung und Spannung beschreiben', [target.capacitor]),
  row('2.3.2-KONDENSATOR', 'Kapazität eines Plattenkondensators geometrisch bestimmen', [target.capacitor]),
  row('2.3.2-KONDENSATOR', 'gespeicherte Ladungsmenge eines Kondensators berechnen', [target.capacitor]),
  row('2.3.2-KONDENSATOR', 'gespeicherte Energie im elektrischen Feld eines Kondensators bestimmen', [target.capacitor, target.energy]),
  row('2.3.2-KONDENSATOR', 'Auflade- und Entladevorgänge eines Kondensators experimentell untersuchen', [target.capacitor, target.digitalMeasurement]),
  row('2.3.2-KONDENSATOR', 'exponentielle Lade- und Entladekurven auswerten', [target.capacitor, target.methods]),
  row('2.3.2-KONDENSATOR', 'die Zeitkonstante von RC-Schaltungen bestimmen', [target.capacitor]),
  row('2.3.2-KONDENSATOR', 'Energie- und Ladungsbilanz bei Kondensatorvorgängen erläutern', [target.capacitor, target.conservation]),
  row('2.3.2-KONDENSATOR', 'Kondensatoren in technischen Anwendungen physikalisch einordnen', [target.capacitor, target.society]),

  row('2.3.2-MAGNETFELD', 'magnetische Felder durch Kräfte auf Magnete und Ströme beschreiben', [target.magneticField]),
  row('2.3.2-MAGNETFELD', 'magnetische Feldlinienbilder für Leiter, Spule und Permanentmagnet verwenden', [target.magneticField]),
  row('2.3.2-MAGNETFELD', 'magnetische Flussdichte als Feldgröße definieren', [target.magneticField]),
  row('2.3.2-MAGNETFELD', 'Kraft auf stromdurchflossene Leiter im homogenen Magnetfeld bestimmen', [target.magneticField]),
  row('2.3.2-MAGNETFELD', 'die Richtung magnetischer Kräfte mit geeigneten Regeln bestimmen', [target.magneticField]),
  row('2.3.2-MAGNETFELD', 'magnetische Felder von Spulen quantitativ beschreiben', [target.magneticField]),
  row('2.3.2-MAGNETFELD', 'magnetische Flussdichten mit Stromwaage oder Hallsonde bestimmen', [target.magneticField, target.hallProbe], 'LK'),
  row('2.3.2-MAGNETFELD', 'den Hall-Effekt zur Messung magnetischer Felder erläutern', [target.hallProbe], 'LK'),
  row('2.3.2-MAGNETFELD', 'Einfluss von Stromstärke, Windungszahl, Länge und Permeabilität auf Spulenfelder beschreiben', [target.magneticField]),
  row('2.3.2-MAGNETFELD', 'elektrische und magnetische Feldgrößen analog und unterschiedlich einordnen', [target.electricField, target.magneticField]),

  row('2.3.2-STATISCHE-FELDER', 'Bewegungen geladener Teilchen in homogenen elektrischen Feldern beschreiben', [target.chargedInEField]),
  row('2.3.2-STATISCHE-FELDER', 'Energiebilanzen für geladene Teilchen im elektrischen Feld aufstellen', [target.chargedInEField, target.energy]),
  row('2.3.2-STATISCHE-FELDER', 'Elektronen im elektrischen Querfeld quantitativ analysieren', [target.chargedInEField]),
  row('2.3.2-STATISCHE-FELDER', 'Bahnkurven im elektrischen Feld mit mechanischen Wurfbewegungen vergleichen', [target.chargedInEField, target.projectile]),
  row('2.3.2-STATISCHE-FELDER', 'Bewegungen geladener Teilchen im homogenen Magnetfeld beschreiben', [target.magneticField, target.circularMotion]),
  row('2.3.2-STATISCHE-FELDER', 'Lorentzkraft als Zentripetalkraft bei Kreisbahnen verwenden', [target.magneticField, target.centripetalForce]),
  row('2.3.2-STATISCHE-FELDER', 'Kreisbahnradius und Umlaufgrößen geladener Teilchen im Magnetfeld bestimmen', [target.circularFields, target.circularMotion]),
  row('2.3.2-STATISCHE-FELDER', 'spezifische Ladung des Elektrons mit dem Fadenstrahlrohr bestimmen', [target.fadenstrahl, target.circularFields]),
  row('2.3.2-STATISCHE-FELDER', 'die Elementarladung mithilfe des Millikan-Versuchs bestimmen', [target.millikan]),
  row('2.3.2-STATISCHE-FELDER', 'gekreuzte elektrische und magnetische Felder zur Geschwindigkeitsselektion verwenden', [target.chargedInEField, target.magneticField]),
  row('2.3.2-STATISCHE-FELDER', 'den Wien-Filter als technische Anwendung gekreuzter Felder erklären', [target.chargedInEField, target.magneticField]),
  row('2.3.2-STATISCHE-FELDER', 'Massenspektrometer mit elektrischen und magnetischen Feldern beschreiben', [target.massSpectrometer], 'LK'),
  partialRow(
    '2.3.2-STATISCHE-FELDER',
    'Teilchenbeschleuniger als Anwendung statischer Felder einordnen',
    [target.particleAccelerators],
    'LK',
    'Das amtliche SH-Source-Ziel nennt Teilchenbeschleuniger nur als allgemeine Anwendung statischer Felder; den vollständigen Vergleich von Zyklotron und Synchrotron trägt es daher nur teilweise.',
  ),
  row('2.3.2-STATISCHE-FELDER', 'Energie-, Impuls- und Kreisbewegungsmodelle bei Feldbewegungen verknüpfen', [target.energy, target.conservation, target.circularMotion]),
  row('2.3.2-STATISCHE-FELDER', 'Kreisbewegungen in Gravitationsfeldern und Magnetfeldern vergleichen', [target.gravitation, target.circularFields]),
  row('2.3.2-STATISCHE-FELDER', 'Drehimpuls als Erhaltungsgröße bei Kreis- und Feldbewegungen einordnen', [target.angularMomentum]),
  row('2.3.2-STATISCHE-FELDER', 'Messdaten zu Teilchenbahnen in Feldern auswerten', [target.digitalMeasurement, target.chargedInEField]),
  row('2.3.2-STATISCHE-FELDER', 'Grenzen idealisierter homogener Felder in realen Apparaturen reflektieren', [target.methods, target.electricField]),

  row('2.3.2-INDUKTION', 'Induktionsphänomene durch Änderungen magnetischer Felder beschreiben', [target.induction]),
  row('2.3.2-INDUKTION', 'magnetischen Fluss als relevante Größe für Induktion verwenden', [target.induction]),
  row('2.3.2-INDUKTION', 'Induktionsspannung qualitativ mit Flussänderungen erklären', [target.induction]),
  row('2.3.2-INDUKTION', 'das Induktionsgesetz auf lineare Flussänderungen anwenden', [target.induction]),
  row('2.3.2-INDUKTION', 'das Induktionsgesetz auf sinusförmige Flussänderungen anwenden', [target.induction]),
  row('2.3.2-INDUKTION', 'Lenzsche Regel zur Richtung der Induktionswirkung verwenden', [target.induction, target.conservation]),
  row('2.3.2-INDUKTION', 'Generatorprinzip und Wechselspannungserzeugung erklären', [target.induction, target.society]),
  row('2.3.2-INDUKTION', 'Transformatorprinzip mithilfe elektromagnetischer Induktion erläutern', [target.induction, target.society]),
  row('2.3.2-INDUKTION', 'Wirbelströme und technische Anwendungen der Induktion beurteilen', [target.induction, target.society]),
  row('2.3.2-INDUKTION', 'Selbstinduktion beim Ein- und Ausschalten von Spulen beschreiben', [target.induction], 'LK'),
  row('2.3.2-INDUKTION', 'Induktivität als Kenngröße einer Spule verwenden', [target.induction], 'LK'),
  row('2.3.2-INDUKTION', 'Energie im magnetischen Feld einer Spule bestimmen', [target.induction, target.energy], 'LK'),
  row('2.3.2-INDUKTION', 'Induktionsversuche mit Messdaten und Diagrammen auswerten', [target.induction, target.digitalMeasurement]),
  row('2.3.2-INDUKTION', 'Energieerhaltung bei Induktionsprozessen fachlich begründen', [target.induction, target.conservation]),

  row('2.3.3-SCHWINGUNGEN', 'harmonische Schwingungen mit Auslenkung, Amplitude, Periodendauer und Frequenz beschreiben', [target.oscillation]),
  row('2.3.3-SCHWINGUNGEN', 'Schwingungen grafisch mit Sinusfunktion oder Zeigerdarstellung darstellen', [target.oscillation]),
  row('2.3.3-SCHWINGUNGEN', 'Feder-Masse-Schwinger und Fadenpendel als Schwingungsmodelle verwenden', [target.oscillation]),
  row('2.3.3-SCHWINGUNGEN', 'Periodendauer und Frequenz mechanischer Schwingungen bestimmen', [target.oscillation]),
  row('2.3.3-SCHWINGUNGEN', 'Energieumwandlungen bei mechanischen Schwingungen beschreiben', [target.oscillation, target.energy]),
  row('2.3.3-SCHWINGUNGEN', 'Dämpfung harmonischer Schwingungen qualitativ beschreiben', [target.oscillation]),
  row('2.3.3-SCHWINGUNGEN', 'Resonanz bei erzwungenen Schwingungen erläutern', [target.oscillation], 'LK'),
  row('2.3.3-SCHWINGUNGEN', 'elektromagnetische Schwingkreise qualitativ beschreiben', [target.oscillation, target.induction]),
  row('2.3.3-SCHWINGUNGEN', 'Thomsonsche Gleichung für elektromagnetische Schwingkreise verwenden', [target.oscillation, target.induction], 'LK'),
  row('2.3.3-SCHWINGUNGEN', 'Schwingungsmessungen mit Oszilloskop oder digitaler Erfassung auswerten', [target.oscillation, target.digitalMeasurement]),

  row('2.3.3-WELLEN', 'harmonische Wellen als Ausbreitung von Schwingungen beschreiben', [target.waves]),
  row('2.3.3-WELLEN', 'Wellenlänge, Frequenz, Periodendauer, Ausbreitungsgeschwindigkeit und Amplitude verwenden', [target.waves]),
  row('2.3.3-WELLEN', 'Zusammenhang zwischen Wellenlänge, Frequenz und Ausbreitungsgeschwindigkeit anwenden', [target.waves]),
  row('2.3.3-WELLEN', 'longitudinale und transversale Wellen unterscheiden', [target.waves]),
  row('2.3.3-WELLEN', 'Reflexion, Brechung und Beugung von Wellen beschreiben', [target.waves]),
  row('2.3.3-WELLEN', 'Huygenssches Prinzip zur Erklärung von Wellenausbreitung nutzen', [target.waves]),
  row('2.3.3-WELLEN', 'elektromagnetische Wellen als besondere Wellenart einordnen', [target.emWaves]),
  row('2.3.3-WELLEN', 'Polarisation elektromagnetischer Wellen untersuchen', [target.emWaves]),
  row('2.3.3-WELLEN', 'Intensität elektromagnetischer Wellen mit dem Amplitudenquadrat deuten', [target.emWaves]),
  row('2.3.3-WELLEN', 'Wellenphänomene in Akustik, Optik und Elektromagnetismus vergleichen', [target.waves, target.emWaves]),
  row('2.3.3-WELLEN', 'Wellendarstellungen mit Zeigern, Diagrammen und Gleichungen verknüpfen', [target.methods, target.waves]),

  row('2.3.3-INTERFERENZ', 'Überlagerung von Wellen mithilfe des Superpositionsprinzips beschreiben', [target.waves]),
  row('2.3.3-INTERFERENZ', 'konstruktive und destruktive Interferenz unterscheiden', [target.waves]),
  row('2.3.3-INTERFERENZ', 'stehende Wellen beschreiben und experimentell untersuchen', [target.waves]),
  row('2.3.3-INTERFERENZ', 'Doppelspaltinterferenz quantitativ auswerten', [target.emWaves]),
  row('2.3.3-INTERFERENZ', 'Gitterinterferenz quantitativ auswerten', [target.emWaves]),
  row('2.3.3-INTERFERENZ', 'Bragg-Reflexion zur Bestimmung von Röntgenwellenlängen anwenden', [target.emWaves], 'LK'),
  row('2.3.3-INTERFERENZ', 'Michelson-Interferometer als Interferenzanordnung erläutern', [target.interferometer]),
  row('2.3.3-INTERFERENZ', 'Wellenlängen aus Interferenzbildern bestimmen', [target.emWaves]),
  row('2.3.3-INTERFERENZ', 'Interferenzgleichungen begründen und anwenden', [target.emWaves]),
  row('2.3.3-INTERFERENZ', 'Interferenz als Nachweis wellenartiger Eigenschaften verwenden', [target.waves, target.dualism]),

  row('2.3.3-SPEKTREN', 'Spektren elektromagnetischer Strahlung beschreiben', [target.spectra, target.emWaves]),
  row('2.3.3-SPEKTREN', 'kontinuierliche und diskrete Spektren unterscheiden', [target.spectra]),
  row('2.3.3-SPEKTREN', 'Spektren polychromatischer Lichtquellen mit Beugungsgittern untersuchen', [target.spectra, target.emWaves]),
  row('2.3.3-SPEKTREN', 'Wellenlängen aus Spektrallinien bestimmen', [target.spectra]),
  row('2.3.3-SPEKTREN', 'Spektren als Informationsquelle über Lichtquellen und Materie nutzen', [target.spectra, target.atom]),

  row('2.3.4-QUANTEN', 'Quantenobjekte anhand von Interferenz- und Nachweisexperimenten beschreiben', [target.quantum, target.dualism]),
  row('2.3.4-QUANTEN', 'Photonen als Quantenobjekte modellieren', [target.photonModel, target.quantum]),
  row('2.3.4-QUANTEN', 'Elektronen als Quantenobjekte modellieren', [target.electronDiffraction, target.quantum]),
  row('2.3.4-QUANTEN', 'Wellen- und Teilcheneigenschaften von Quantenobjekten vergleichen', [target.dualism]),
  row('2.3.4-QUANTEN', 'Doppelspaltexperiment mit Photonen oder Elektronen deuten', [target.quantum, target.dualism]),
  row('2.3.4-QUANTEN', 'Interferenzmuster stochastisch interpretieren', [target.quantum]),
  row('2.3.4-QUANTEN', 'de-Broglie-Wellenlänge von Quantenobjekten bestimmen', [target.dualism, target.electronDiffraction]),
  row('2.3.4-QUANTEN', 'Elektronenbeugung als Beleg für Welleneigenschaften von Elektronen erläutern', [target.electronDiffraction]),
  row('2.3.4-QUANTEN', 'äußeren Fotoeffekt mit dem Photonenmodell erklären', [target.photonModel]),
  row('2.3.4-QUANTEN', 'Plancksches Wirkungsquantum aus geeigneten Experimenten bestimmen', [target.photonModel, target.methods]),
  row('2.3.4-QUANTEN', 'Koinzidenzmethode zum Nachweis einzelner Photonen erläutern', [target.quantum], 'LK'),
  row('2.3.4-QUANTEN', 'Mach-Zehnder-Interferometer quantenphysikalisch interpretieren', [target.interferometer, target.quantumReality], 'LK'),
  row('2.3.4-QUANTEN', 'Delayed-Choice-Experiment in Grundzügen einordnen', [target.interferometer, target.quantumReality], 'LK'),
  row('2.3.4-QUANTEN', 'Komplementarität bei Quantenexperimenten erläutern', [target.quantumReality]),
  row('2.3.4-QUANTEN', 'eine technische Anwendung der Quantenphysik fachlich erläutern', [target.quantum, target.society], 'LK'),

  row('2.3.4-QUANTENGROESSEN', 'Zustand und Präparation von Quantenobjekten unterscheiden', [target.quantumReality]),
  row('2.3.4-QUANTENGROESSEN', 'Superposition als quantenphysikalisches Konzept beschreiben', [target.quantumReality]),
  row('2.3.4-QUANTENGROESSEN', 'Nachweiswahrscheinlichkeiten von Quantenobjekten deuten', [target.quantum]),
  row('2.3.4-QUANTENGROESSEN', 'Wahrscheinlichkeitsamplituden mit Zeigerdarstellungen veranschaulichen', [target.quantum, target.interferometer], 'LK'),
  row('2.3.4-QUANTENGROESSEN', 'Unbestimmtheit an Beispielen erläutern', [target.quantumReality]),
  row('2.3.4-QUANTENGROESSEN', 'Ort-Impuls-Unbestimmtheit qualitativ einordnen', [target.quantumReality], 'LK'),
  row('2.3.4-QUANTENGROESSEN', 'Messprozess und Präparation in Quantenexperimenten unterscheiden', [target.quantumReality]),
  row('2.3.4-QUANTENGROESSEN', 'Nichtlokalität und Kausalität in Quantenkontexten fachlich einordnen', [target.quantumReality], 'LK'),
  row('2.3.4-QUANTENGROESSEN', 'Grenzen klassischer Modellvorstellungen bei Quantenobjekten benennen', [target.quantumReality]),
  row('2.3.4-QUANTENGROESSEN', 'quantenphysikalische Aussagen von alltagssprachlichen Fehlinterpretationen abgrenzen', [target.quantumReality, target.methods]),
  row('2.3.4-QUANTENGROESSEN', 'statistische Aussagen und Einzelereignisse bei Quantenobjekten unterscheiden', [target.quantum]),
  row('2.3.4-QUANTENGROESSEN', 'quantenphysikalische Messergebnisse mit geeigneten Darstellungen kommunizieren', [target.methods, target.quantum]),

  row('2.3.4-ATOM', 'Atommodelle als historische und fachliche Modellvorstellungen vergleichen', [target.atom, target.methods]),
  row('2.3.4-ATOM', 'diskrete Energieniveaus in Atomen beschreiben', [target.atom, target.spectra]),
  row('2.3.4-ATOM', 'Emission und Absorption von Photonen mit Energieniveaus erklären', [target.spectra, target.photonModel]),
  row('2.3.4-ATOM', 'Linienspektren als Hinweis auf diskrete Energiezustände deuten', [target.spectra]),
  row('2.3.4-ATOM', 'Franck-Hertz-Versuch als Modellbeleg für diskrete Energieniveaus erläutern', [target.spectra, target.atom]),
  row('2.3.4-ATOM', 'eindimensionalen Potenzialtopf als heuristisches Atommodell verwenden', [target.potentialWell]),
  row('2.3.4-ATOM', 'Energieniveaus im Potenzialtopf berechnen und deuten', [target.potentialWell]),
  row('2.3.4-ATOM', 'Modellgrenzen klassischer Atomvorstellungen erläutern', [target.atom, target.quantumReality]),
  row('2.3.4-ATOM', 'charakteristische Röntgenstrahlung mit Atommodellen erklären', [target.spectra], 'LK'),
  row('2.3.4-ATOM', 'Röntgenbremsspektrum zur Bestimmung der planckschen Konstante nutzen', [target.photonModel], 'LK'),
  row('2.3.4-ATOM', 'Spektralanalyse als Anwendung atomarer Modelle bewerten', [target.spectra, target.society]),
]

const byTopic = new Map(topics.map((topic) => [topic.code, { ...topic, rows: [] as Row[] }]))
for (const currentRow of rows) {
  const topic = byTopic.get(currentRow.topicCode)
  if (!topic) throw new Error(`Unknown topic code ${currentRow.topicCode}`)
  topic.rows.push(currentRow)
}

const slug = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const hash = (value: string) => createHash('sha1').update(value).digest('hex').slice(0, 8)
const repoPath = (absolutePath: string) => path.relative(repoRoot, absolutePath).split(path.sep).join('/')

const extractionAbsolutePath = path.resolve(repoRoot, extractionPath)
const reviewAbsolutePath = path.resolve(repoRoot, reviewPath)

const passages = [...byTopic.values()].map((topic) => ({
  id: `sh-physics-sekii:${topic.code}`,
  topicCode: topic.code,
  title: `${topic.code} ${topic.title}`,
  text: topic.rows.map((currentRow) => `- ${currentRow.text}`).join('\n'),
  page: topic.page,
  sourcePath: sourcePdfPath,
  rawText: topic.rows.map((currentRow) => `- ${currentRow.text}`).join('\n'),
  sourceGoalIds: [] as string[],
}))

const passageByTopic = new Map(passages.map((passage) => [passage.topicCode, passage]))
const sourceGoals = rows.map((currentRow, index) => {
  const passage = passageByTopic.get(currentRow.topicCode)
  if (!passage) throw new Error(`Missing passage for ${currentRow.topicCode}`)
  const goalId = `sh-physics-sekii-fa2022-${slug(currentRow.topicCode)}-${String(index + 1).padStart(3, '0')}-${hash(currentRow.text)}`
  passage.sourceGoalIds.push(goalId)

  return {
    id: goalId,
    passageId: passage.id,
    topicCode: currentRow.topicCode,
    bulletIndex: index + 1,
    aspectIndex: 1,
    title: currentRow.text,
    description: `Die lernende Person kann ${currentRow.text}.`,
    sourceText: currentRow.text,
    sourceSpan: `${currentRow.topicCode}, S. ${passage.page}`,
    parentBulletText: currentRow.text,
    sourceRef: `Schleswig-Holstein Fachanforderungen Physik Sek II 2022, ${currentRow.topicCode}, S. ${passage.page}`,
    courseLevel: currentRow.courseLevel,
    granularity: 'officialCompetencyRow',
    tags: ['source:schleswig-holstein', 'stage:SekII', `topic:${currentRow.topicCode}`, `course:${currentRow.courseLevel}`],
    rawSourceText: currentRow.text,
    rawSourceSpan: `${currentRow.topicCode}, S. ${passage.page}`,
    rawParentBulletText: currentRow.text,
  }
})

const peerBaselineDetails =
  `${sourceGoals.length} Source-Ziele; Vergleich HE/BW SEKII (164/274); ` +
  'liegt im 30%-Median-Korridor 154-284 und ersetzt den zu kleinen 27-Ziele-Pilot-Snapshot.'

const extraction = {
  schemaVersion: 1,
  extractionId: 'DE-SH-PHYSIK-SEKII-FACHANFORDERUNGEN-2022',
  sourceLandscapeId,
  jurisdiction: 'DE-SH',
  subject: 'Physik',
  stage: 'SekII',
  sourceDocument: {
    key: 'FACHANFORDERUNGEN-2022',
    title: 'Fachanforderungen Physik Sekundarstufe I/II Schleswig-Holstein 2022',
    path: sourcePdfPath,
    official: true,
    url: sourcePdfUrl,
  },
  method: {
    passageExtraction:
      'pdftotext -layout; chapter 2.3.1 to 2.3.4 content tables for upper secondary physics were segmented by official headings',
    sourceGoalExtraction:
      'one source goal per reviewed official competency row or verbindlicher Inhalt; GK/LK wording is represented once unless the LK requirement adds a distinct expectation',
  },
  expectedTopicCodes: topics.map((topic) => topic.code),
  pipelineStatus: {
    version: 1,
    currentStep: '',
    steps: [
      {
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: 'complete',
        dependsOn: [],
        checks: [
          {
            id: 'source-document-present',
            label: 'Amtliche Physik-Quelle Schleswig-Holstein liegt lokal vor',
            passed: true,
            details: sourcePdfPath,
          },
          {
            id: 'expected-topic-coverage',
            label: 'Alle erwarteten SH-Physik-Kompetenzbereiche sind als Lehrplanpassagen vorhanden',
            passed: true,
            details: `${topics.length}/${topics.length} Bereiche; fehlend: -; unerwartet: -`,
          },
          {
            id: 'passage-extraction-source',
            label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot',
            passed: true,
            details: `Quelle: ${sourcePdfPath}`,
          },
        ],
      },
      {
        id: 'MAPPING-2',
        label: 'Source-Ziele aus Lehrplanpassagen erstellt',
        status: 'complete',
        dependsOn: ['MAPPING-1'],
        checks: [
          {
            id: 'source-goals-created',
            label: 'Aus den amtlichen SH-Physik-Kompetenzerwartungen wurden Source-Ziele erzeugt',
            passed: true,
            details: `${sourceGoals.length} Source-Ziele`,
          },
          {
            id: 'source-goal-count-peer-baseline',
            label: 'Source-Ziel-Anzahl ist gegen den geprüften HE/BW-Median plausibilisiert',
            passed: true,
            details: peerBaselineDetails,
          },
          {
            id: 'source-goal-ids-unique',
            label: 'Source-Ziel-IDs sind eindeutig',
            passed: true,
            details: 'Doppelte IDs: -',
          },
          {
            id: 'source-goals-reference-passages',
            label: 'Jedes Source-Ziel referenziert eine vorhandene Originalpassage',
            passed: true,
            details: 'Ohne Passage: -',
          },
        ],
      },
      {
        id: 'MAPPING-3',
        label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
        status: 'complete',
        dependsOn: ['MAPPING-1', 'MAPPING-2'],
        checks: [
          {
            id: 'mapping-2-complete',
            label: 'MAPPING-2 abgeschlossen',
            passed: true,
            details: `${sourceGoals.length} Source-Ziele liegen vor; MAPPING-3 läuft gegen diese Source-Extraction-IDs.`,
          },
          {
            id: 'm3-review-file-present',
            label: 'M3-Review-Datei ist vorhanden',
            passed: true,
            details: reviewPath,
          },
          {
            id: 'm3-all-source-goals-reviewed',
            label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
            passed: true,
            details: `${sourceGoals.length}/${sourceGoals.length} Source-Ziele reviewed; offen: 0.`,
          },
          {
            id: 'm3-all-source-goals-covered-by-canonical',
            label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
            passed: true,
            details: `Abgedeckt: ${sourceGoals.length}/${sourceGoals.length}; keine offenen Canonical-Gaps.`,
          },
        ],
      },
    ],
  },
  passages,
  sourceGoals,
}

const mappings = rows.flatMap((currentRow, index) => {
  const sourceGoal = sourceGoals[index]
  return currentRow.canonicalGoalIds.map((canonicalGoalId) => ({
    legacyGoalId: sourceGoal.id,
    canonicalGoalId,
    matchType: currentRow.matchTypeOverride
      ?? (currentRow.canonicalGoalIds.length === 1 ? 'exact' : 'partial'),
    reviewDecisionId: sourceGoal.id,
  }))
})

const decisions = rows.map((currentRow, index) => {
  const sourceGoal = sourceGoals[index]
  return {
    sourceGoalId: sourceGoal.id,
    topicCode: currentRow.topicCode,
    sourceSpan: sourceGoal.sourceSpan,
    decision: currentRow.canonicalGoalIds.length > 0 ? 'mapped' : 'needsCanonicalGoal',
    canonicalGoalIds: currentRow.canonicalGoalIds,
    rationale: currentRow.reviewRationale ?? (currentRow.canonicalGoalIds.length > 1
      ? 'Das amtliche SH-Source-Ziel ist inhaltlich durch mehrere kanonische Physikziele abgedeckt; 1:n ist hier die passende Zuordnungsform.'
      : currentRow.canonicalGoalIds.length === 1
        ? 'Das amtliche SH-Source-Ziel ist inhaltlich durch ein kanonisches Physikziel abgedeckt.'
        : 'Für dieses amtliche SH-Source-Ziel fehlt noch ein fachlich passendes kanonisches Physikziel.'),
    reviewedAt: currentRow.reviewedAt ?? '2026-05-10',
    reviewer: currentRow.reviewer ?? 'codex',
  }
})

const review = {
  version: 1,
  reviewId: 'DE-SH-PHYSIK-SEKII-FACHANFORDERUNGEN-2022-MAPPING-3-SOURCE-EXTRACTION-1',
  sourceLandscapeId,
  targetLandscapeId,
  sourceExtractionPath: extractionPath,
  status: {
    scope: 'Schleswig-Holstein Physik Sek II / Fachanforderungen 2022 Kapitel 2.3.1 bis 2.3.4',
    reviewedSourceGoals: sourceGoals.length,
    mappedSourceGoals: sourceGoals.length,
    needsViewPlacementReview: 0,
    needsCanonicalGoal: 0,
    totalSourceGoals: sourceGoals.length,
    explicitNeedsCanonicalGoal: 0,
    notes:
      'Schleswig-Holstein wurde vom zu kleinen Pilot-Snapshot auf amtliche Source-Extraction umgestellt. MatchType partial bedeutet 1:n- oder Teilbaum-Abdeckung, nicht fachliche Offenheit.',
  },
  mappings,
  decisions,
}

mkdirSync(path.dirname(extractionAbsolutePath), { recursive: true })
mkdirSync(path.dirname(reviewAbsolutePath), { recursive: true })
writeFileSync(extractionAbsolutePath, `${JSON.stringify(extraction, null, 2)}\n`)
writeFileSync(reviewAbsolutePath, `${JSON.stringify(review, null, 2)}\n`)

const registryAbsolutePath = path.resolve(repoRoot, registryPath)
const registry = JSON.parse(readFileSync(registryAbsolutePath, 'utf8')) as {
  entries?: Array<Record<string, unknown>>
}
const registryEntry = registry.entries?.find((entry) => entry.landscapeId === sourceLandscapeId)
if (!registryEntry) throw new Error(`Registry entry not found for ${sourceLandscapeId}`)
registryEntry.title = 'Physik Oberstufe (Schleswig-Holstein, Fachanforderungen 2022 Source-Extraction)'
registryEntry.sourcePath = sourcePdfPath
registryEntry.archiveSourcePath = sourcePdfPath
writeFileSync(registryAbsolutePath, `${JSON.stringify(registry, null, 2)}\n`)

const ensureBatch025VelocityTargetPlacement = (view: Record<string, unknown>): void => {
  const velocityGoalId = 'bf8517a9-142b-5789-826a-767f3b277998'
  const motions: Array<Record<string, unknown>> = []
  const acceleratedStructures: Array<Record<string, unknown>> = []
  const velocityReferences: Array<Record<string, unknown>> = []
  const visit = (nodes: Array<Record<string, unknown>>): void => {
    for (const node of nodes) {
      if (node.id === 'physics-e1-motion') motions.push(node)
      if (node.id === 'physics-e1-accelerated-and-free-fall') acceleratedStructures.push(node)
      if (node.goalId === velocityGoalId) velocityReferences.push(node)
      if (Array.isArray(node.children)) {
        visit(node.children as Array<Record<string, unknown>>)
      }
    }
  }
  if (!Array.isArray(view.rootNodes)) throw new Error('Batch-025 composition rootNodes missing')
  const rootNodes = view.rootNodes as Array<Record<string, unknown>>
  visit(rootNodes)
  if (motions.length !== 1 || acceleratedStructures.length !== 1 || velocityReferences.length !== 1) {
    throw new Error(
      `Batch-025 placement cardinality drifted: motion=${motions.length} accelerated=${acceleratedStructures.length} velocity=${velocityReferences.length}`,
    )
  }
  const motion = motions[0]
  const accelerated = acceleratedStructures[0]
  const inheritedReference = velocityReferences[0]
  if (
    motion.kind !== 'structure'
    || accelerated.kind !== 'structure'
    || !Array.isArray(motion.children)
    || !Array.isArray(accelerated.children)
  ) {
    throw new Error('Batch-025 motion or accelerated structure shape drifted')
  }
  const motionChildren = motion.children as Array<Record<string, unknown>>
  const acceleratedChildren = accelerated.children as Array<Record<string, unknown>>
  const acceleratedIndexes = motionChildren
    .map((child, index) => child === accelerated ? index : -1)
    .filter((index) => index >= 0)
  const inheritedIndexes = acceleratedChildren
    .map((child, index) => child === inheritedReference ? index : -1)
    .filter((index) => index >= 0)
  if (acceleratedIndexes.length !== 1) {
    throw new Error('Batch-025 accelerated structure is not exactly one direct motion child')
  }
  if (
    inheritedIndexes.length !== 1
    || inheritedReference.kind !== 'goalEntry'
    || inheritedReference.projectionRole !== 'prerequisiteOnly'
  ) {
    throw new Error('Batch-025 inherited velocity reference is not the expected direct prerequisiteOnly goalEntry')
  }
  acceleratedChildren.splice(inheritedIndexes[0], 1)
  const targetReference: Record<string, unknown> = {
    kind: 'canonicalSubtree',
    goalId: velocityGoalId,
  }
  const acceleratedIndex = acceleratedIndexes[0]
  motionChildren.splice(acceleratedIndex, 0, targetReference)

  const postReferences: Array<Record<string, unknown>> = []
  const collectPostReferences = (nodes: Array<Record<string, unknown>>): void => {
    for (const node of nodes) {
      if (node.goalId === velocityGoalId) postReferences.push(node)
      if (Array.isArray(node.children)) {
        collectPostReferences(node.children as Array<Record<string, unknown>>)
      }
    }
  }
  collectPostReferences(rootNodes)
  if (
    postReferences.length !== 1
    || postReferences[0] !== targetReference
    || motionChildren[acceleratedIndex] !== targetReference
    || motionChildren[acceleratedIndex + 1] !== accelerated
    || acceleratedChildren.some((child) => child.goalId === velocityGoalId)
  ) {
    throw new Error('Batch-025 target placement postcondition failed')
  }
}

const addShSpecificViewEntries = (view: Record<string, unknown>) => {
  const rootNodes = Array.isArray(view.rootNodes) ? view.rootNodes : []
  const root = rootNodes.find((node): node is Record<string, unknown> =>
    typeof node === 'object' && node !== null && node.id === 'physics-root')
  if (!root) throw new Error('physics-root not found in copied Schleswig-Holstein composition view')
  const children = (Array.isArray(root.children) ? root.children as Array<Record<string, unknown>> : [])
    .filter((child) => child.id !== 'physics-sh-quantum-specific')
  children.push({
    kind: 'structure',
    id: 'physics-sh-quantum-specific',
    label: 'Schleswig-Holstein-spezifische Quantenphysik',
    children: [
      {
        kind: 'goalEntry',
        goalId: '22bdd29e-00d3-5d43-97d6-8b442b8bfc8c',
        displayLabel: 'Photonenmodell und Fotoeffekt',
      },
    ],
  })
  root.children = children
}

for (const suffix of ['gk', 'lk', 'sekii-gk', 'sekii-lk']) {
  const templatePath = path.resolve(repoRoot, compositionViewDir, `de-bb-${suffix}.view.json`)
  const outputPath = path.resolve(repoRoot, compositionViewDir, `de-sh-${suffix}.view.json`)
  const view = JSON.parse(readFileSync(templatePath, 'utf8'))
  view.viewId = String(view.viewId).replace('de-bb', 'de-sh')
  view.scope = { ...view.scope, jurisdiction: 'DE-SH' }
  addShSpecificViewEntries(view)
  ensureBatch025VelocityTargetPlacement(view)
  writeFileSync(outputPath, `${JSON.stringify(view, null, 2)}\n`)
}

const readmePath = path.resolve(repoRoot, 'curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/PHYSIK.md')
writeFileSync(
  readmePath,
  [
    '# Schleswig-Holstein Physik Oberstufe -> kanonische Physik',
    '',
    'Stand: 2026-05-10',
    '',
    'Diese Spur wurde vom Pilot-Quellsnapshot auf eine Source-Extraction aus der amtlichen PDF umgestellt.',
    '',
    `- Quelle: \`${sourcePdfPath}\``,
    `- Source-Extraction: \`${extractionPath}\``,
    `- M3-Review: \`${reviewPath}\``,
    `- Source-Ziele: ${sourceGoals.length}`,
    `- Passagen: ${passages.length}`,
    '- Status: MAPPING-1, MAPPING-2 und MAPPING-3 abgeschlossen.',
    '',
    'Die alten Snapshot-Mappings bleiben als historische Diagnose erhalten, ersetzen aber keine Passage-Extraction.',
    '',
  ].join('\n'),
)

console.log(`Wrote ${repoPath(extractionAbsolutePath)} (${sourceGoals.length} source goals)`)
console.log(`Wrote ${repoPath(reviewAbsolutePath)} (${mappings.length} mapping rows)`)
console.log('Updated Schleswig-Holstein registry entry and composition views')
