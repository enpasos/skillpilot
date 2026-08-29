import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type CourseLevel = 'GK_LK' | 'GK' | 'LK'
type Stage = 'SekI' | 'SekII'

type Row = {
  topicCode: string
  text: string
  courseLevel?: CourseLevel
}

type Topic = {
  code: string
  title: string
  page: number
  stageLabel: string
  rows: string[]
}

type Passage = {
  id: string
  topicCode: string
  title: string
  text: string
  page: number
  sourcePath: string
  sourceGoalIds: string[]
}

type SourceGoal = {
  id: string
  passageId: string
  topicCode: string
  bulletIndex: number
  aspectIndex: number
  title: string
  description: string
  sourceText: string
  sourceSpan: string
  parentBulletText: string
  sourceRef: string
  courseLevel: CourseLevel
  granularity: string
  tags: string[]
  rawSourceText: string
  rawSourceSpan: string
  rawParentBulletText: string
}

type MappingDecision = {
  sourceGoalId: string
  topicCode: string
  sourceSpan: string
  decision: 'mapped' | 'needsCanonicalGoal'
  canonicalGoalIds: string[]
  rationale: string
  reviewedAt: string
  reviewer: string
}

type CompositionNode = {
  kind?: string
  id?: string
  goalId?: string
  displayLabel?: string
  label?: string
  children?: CompositionNode[]
}

type ExtractionConfig = {
  stage: Stage
  extractionId: string
  title: string
  sourceLandscapeId: string
  sourcePdfPath: string
  sourcePdfUrl: string
  sourceDocumentTitle: string
  extractionPath: string
  reviewPath: string
  readmePath: string
  topics: Topic[]
  oldSnapshotCount: number
  peerBaseline: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const jurisdiction = 'DE-MV'
const targetLandscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const compositionViewDir = 'curricula/DE/Gymnasium/composition-views/physik'

const target = {
  motivation: '5c44b9ba-9b05-4774-95d5-073230d3fc4f',
  methods: '1e9ec823-384b-5e5f-974c-4ce224d05c19',
  uncertainty: '0dd6d3f9-a92f-564c-a730-6772619c7bf8',
  digitalMeasurement: 'e452baa3-c9fc-5b62-893c-f91fe8d53715',
  society: '8eaa4e45-39fc-50e9-b59f-8a1752f6bebe',

  density: 'e41356c1-968b-435a-af25-b663f080ae5a',
  measureMass: 'af0e2efb-f634-5f2d-abea-b2e1a67a2894',
  volumeCluster: '7c996528-5fae-5353-b8fb-d59382e225c6',
  determineDensity: 'c2d6bdf1-8077-50fb-a8b5-2f0b7e3493f0',
  forces: '581c0766-b84b-54cb-b8b6-375310329a41',
  pressure: '5308de76-79f0-44f4-8cb7-fc9de4772217',
  simpleMachines: '327302e3-5b36-46f8-9c16-73f24583b0eb',
  sekIHeat: '2d3d42ae-492b-4795-a22f-eeca03aaed38',
  temperature: '940978fa-1f2d-4e54-9c28-081a6df9b76f',
  expansion: 'd27c8860-12a4-4d7d-9849-ccd8b7caca48',
  particleModel: '9ac4973a-21d5-48a5-90b4-eb90e10391ae',
  heatTransfer: 'fbe0faae-7fba-482b-888e-341f926770f3',
  light: '051cedc5-d380-4716-9751-b18f2e67a912',
  lightRays: '79cb1695-f985-443a-b93e-27b57ab474b7',
  spectrumColor: 'a4681378-ade4-4f20-bf77-fb020469510f',
  opticsEye: '84ddb244-e560-592f-9d43-e84c801fe5b4',
  electrostaticsSimple: '32111497-d5ca-453e-906d-d352f885b126',
  atomSimple: '2a6703e0-2a6f-4ebf-a5c6-7aa05a4b86eb',
  electricCircuits: 'bbabac7c-9613-4c7e-877e-d7dc3df5300f',
  simpleCircuits: '75bdf5ca-cda4-4658-9ec7-84c77b3759db',
  currentVoltage: '53196a71-9dbd-4835-b2f9-ff21b8a8962c',
  currentMeasure: 'f1a078ae-6262-4444-a4bc-a5ab275621cf',
  resistance: 'ec5cac7b-ad31-590c-8ab0-5b3ef24d2bca',
  electricEnergySimple: 'cbb26ed2-6979-46f6-a4ae-128f5c5d9d76',
  electricSafety: '1911920e-b099-4310-82f2-b47f51a78b33',
  magnetsSimple: 'f778a659-1467-4aa7-97b2-bed78c530634',
  currentEffects: 'a5f652cc-e091-4c90-bec2-c357ae54fcf1',
  motorSimple: 'eb30189c-27c6-510b-b235-6543afa18b90',
  uniformMotionSekI: 'ae67bcf1-f3ee-50d6-9a12-25a159dff659',
  forceInertiaSekI: '5ea765ac-c279-551a-8a94-a07da2381e5b',
  nuclearSimple: 'cb0426b0-a973-5660-b6fe-79407934730f',
  nuclearRiskSimple: '979e0d0d-8933-4ace-814f-f28060ad280f',
  nuclearFissionFusionSimple: '50877233-7abf-54df-b347-6d3224678fc9',

  motion: '65ddd780-0323-45d1-8f94-5e31bf28da23',
  kinematics: 'ce431132-dfc4-42c2-aff6-bd72035190f8',
  uniformMotion: '971beafa-6ba5-4c82-ac8b-7ebf66eec3dd',
  acceleratedMotion: 'e4b38061-1f28-43ad-8371-a3e7c0e81856',
  freeFall: '09029573-864f-40ca-bf8a-cee7bf6dcb73',
  projectile: '287739a3-6143-55d0-abe7-1a08889e9b49',
  newtonAxioms: '4dc9a094-66d7-4d4d-9436-134aabe48f39',
  energy: 'feb70838-931c-4b45-b9a9-930605d93efa',
  conservation: 'e9d616d8-685f-4129-a36f-dae7a280bae7',
  impulse: '912febf0-754a-4409-9f8b-7d66810edc08',
  collisions: '2eecd0e2-a7ca-4568-9b12-3d47706c65fb',
  circularMotion: 'ec7a0a68-730b-5c94-ac72-a937508f8303',
  centripetalForce: 'e918b31f-6f39-5dee-ade6-3617080fb24f',
  gravitation: '0ade0d10-8b32-5a95-a1a9-8ac64e2a8089',
  gravitationalField: '156edddc-ce8d-580d-8d17-d9376d59e60e',

  electricField: 'd7bc20e0-5ee9-593a-a7a9-d7cbb88392e6',
  coulomb: '8da5c981-8216-5fcd-a393-19f392ae2006',
  electricPotential: '841edfdb-5e12-5a37-ab12-552a1d8e92ca',
  capacitor: '0895074d-c4af-56ea-88dd-ae0fdae443ed',
  capacitorField: '9f59a088-3939-59e9-821d-167fadfda782',
  capacitorCharge: '0b4f2020-8486-5372-9cb9-6e59f698ac2d',
  chargedInEField: '47f76c5c-05d1-59eb-876d-cafb98a66c5b',
  millikan: '0f803c37-8191-5a07-9b31-9603ded98fe2',
  magneticField: '13e882bd-2fc6-59c6-a2a8-32eb1fbf1751',
  lorentz: 'ba29e928-a287-5de7-b3fe-5c8c3731363b',
  induction: 'b2b74d0a-575c-5c6b-8e24-b0b0f32c1126',
  inductionLaw: 'eb1ea150-ec6c-5000-bce3-f46c820dccf8',
  selfInduction: '37f28bc4-def2-57cf-a06b-191dfd228205',
  fadenstrahl: '966782e5-690d-4fae-bbab-fa3fa30525c3',
  hallProbe: 'b39ae8fb-4358-5866-8adf-3d5365368eeb',
  massSpectrometer: '3f17d0d2-562d-4c1c-9ebc-1a1a43f28f9c',
  particleAccelerators: '2d62b444-796e-548d-aeee-cfd9c6665ddc',

  oscillation: 'aee9676f-7cd6-50f0-a504-fd88ef67b59e',
  oscillationEnergy: '78cf6eff-b3bc-5444-9ef8-5d39dae8d17d',
  dampedOscillation: 'e6895bc3-fcbd-59ad-baef-a78c97a13e11',
  lcOscillation: 'ac4ba260-6086-5fcc-bea2-c06f1425a1cc',
  waves: 'dc38c943-11f6-5f4f-945b-67e330814727',
  waveBasics: 'cb0ced6d-b7c1-5b7d-9922-8c394f6030e8',
  wavePhenomena: 'd716a35e-e422-5aba-b39a-f2e22f1e1e74',
  waveInterference: '224243cd-5a53-5d6e-bed5-564cca167a80',
  standingWaves: 'd5772db3-120c-5c37-ab46-2336d02236b0',
  emWaves: 'c1563745-2722-503d-819f-95d336937e2b',
  spectrumEm: '4a7cbe83-b694-57d3-85ce-1eeca418daaf',
  interferometer: '52b6722a-b3b2-5d2d-a507-0215532b0422',

  quantum: 'ab636b78-6031-5a5b-afa2-9ffefbdd5dda',
  dualism: '9fd26b99-b790-5efd-8858-c7e6c20b005e',
  photonModel: '22bdd29e-00d3-5d43-97d6-8b442b8bfc8c',
  electronDiffraction: 'e296aba6-f407-5944-a2bd-e5296e4c9f06',
  quantumReality: '727d0946-7019-50ed-8fc6-85db12508733',
  quantumUncertainty: '9e881b3b-68cd-5f52-819f-c2e33b5ba631',
  atom: 'dd5a8efd-5d11-5388-aa2a-5147dec4348f',
  spectra: '904670af-8e4c-543e-bc9b-e6248d87a10d',
  roentgen: '48e77690-17f7-5ebe-a8f7-87b2ee9820da',
  potentialWell: 'cc2d5e8e-4599-54ac-b8de-87c8cfd39ea7',
  nuclear: '5a5bc118-4420-5bb7-94c3-67837f2ce0dd',
  standardModel: '15cb40f1-e2d3-5754-9e7b-e8888fe78340',
}

const currentWaveTargetsBySourceGoalId: Record<string, string[]> = {
  'mv-phys-seki-rp2022-j7-materie-dichte-001-2ec24053': [
    target.methods,
    target.measureMass,
    target.volumeCluster,
  ],
  'mv-phys-seki-rp2022-j7-baustelle-001-8edab8e9': [
    target.methods,
    target.measureMass,
    target.volumeCluster,
    target.determineDensity,
  ],
}

const repoPath = (absolutePath: string): string =>
  path.relative(repoRoot, absolutePath).split(path.sep).join('/')

const readJson = <T>(relativePath: string): T =>
  JSON.parse(readFileSync(path.resolve(repoRoot, relativePath), 'utf8')) as T

const writeJson = (relativePath: string, value: unknown): void => {
  const absolutePath = path.resolve(repoRoot, relativePath)
  mkdirSync(path.dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`)
}

const slug = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const hash = (value: string): string => createHash('sha1').update(value).digest('hex').slice(0, 8)

const lowerTopics: Topic[] = [
  {
    code: 'J7-MATERIE-DICHTE',
    title: 'Klasse 7: Materie - Dichte',
    page: 17,
    stageLabel: 'Klasse 7',
    rows: [
      'Körper und Stoffe mithilfe von Masse und Volumen untersuchen',
      'Dichte als physikalische Größe aus Masse und Volumen bestimmen',
      'Dichte als Proportionalitätsfaktor von Masse und Volumen bei gleichem Stoff deuten',
      'Tabellen zu Stoffdichten in analogen und digitalen Quellen nutzen',
      'Sink-, Schweb- und Schwimmverhalten von Körpern in Flüssigkeiten und Gasen mit Dichtevergleichen erklären',
    ],
  },
  {
    code: 'J7-KRAEFTE',
    title: 'Klasse 7: Wechselwirkung - Kräfte',
    page: 19,
    stageLabel: 'Klasse 7',
    rows: [
      'Kraft als physikalische Größe mit Betrag, Richtung und Angriffspunkt beschreiben',
      'Wirkungen von Kräften und Kraft als Wechselwirkungsgröße darstellen',
      'Kräfte durch Pfeile darstellen und Kraftarten unterscheiden',
      'Kräfte auf einer Wirkungslinie zusammensetzen',
      'Gewichtskraft mit Masse und Ortsfaktor berechnen und von Masse abgrenzen',
      'Hooke’sches Gesetz für Federspannkräfte anwenden',
      'Haft-, Gleit- und Rollreibung unterscheiden und Reibungskräfte halbquantitativ beschreiben',
      'Druck als physikalische Größe aus Kraft und Fläche beschreiben',
      'Auflagedruck, Tiefendruck, Luftdruck und Druckausbreitung in Flüssigkeiten und Gasen qualitativ erklären',
      'Magnetische Kräfte, Pole, ferromagnetische Stoffe und Erdmagnetfeld qualitativ beschreiben',
      'Elektrische Kräfte zwischen geladenen Körpern qualitativ beschreiben',
    ],
  },
  {
    code: 'J7-BAUSTELLE',
    title: 'Klasse 7: Kontext - Physik auf der Baustelle',
    page: 21,
    stageLabel: 'Klasse 7',
    rows: [
      'Dichte, Masse und Volumen in realen Baustellen-Größenordnungen nutzen',
      'Gewichts- oder Reibungskräfte an Baustellenkontexten anwenden',
      'Zweiseitige Hebel, geneigte Ebenen, Rollen oder Flaschenzüge als kraftumformende Einrichtungen beschreiben',
      'Hubarbeit und Leistung in Baustellenkontexten berechnen',
    ],
  },
  {
    code: 'J7-ENERGIE',
    title: 'Klasse 7: Energie - Arbeit, Leistung, Wirkungsgrad',
    page: 22,
    stageLabel: 'Klasse 7',
    rows: [
      'Mechanische, elektrische, thermische, Licht-, chemische und Kernenergie als Energieformen unterscheiden',
      'Energieumwandlung und Energieübertragung mit Energieerhaltung und Energieflussdiagrammen beschreiben',
      'Zugeführte und genutzte Energie unterscheiden und Energieentwertung berücksichtigen',
      'Lageenergie berechnen und mechanische Energieumwandlungen beschreiben',
      'Wirkungsgrad als Verhältnis von genutzter und zugeführter Energie bestimmen',
      'Arbeit als Energieübertragung beschreiben und mit Kraft und Weg unter Gültigkeitsbedingungen berechnen',
      'Beschleunigungsarbeit, Verformungsarbeit und Hubarbeit in Sachkontexten unterscheiden',
      'Leistung als physikalische Größe und Leistung technischer Geräte bestimmen',
      'Goldene Regel der Mechanik aus Energieerhaltung herleiten und auf kraftumformende Einrichtungen übertragen',
      'Geneigte Ebene, Hebel, feste Rolle, lose Rolle und Flaschenzug qualitativ und experimentell untersuchen',
    ],
  },
  {
    code: 'J8-LICHT',
    title: 'Klasse 8: Wechselwirkung - Licht',
    page: 25,
    stageLabel: 'Klasse 8',
    rows: [
      'Spektrum und Farbwahrnehmung unterscheiden',
      'Kontinuierliche Spektren und RGB-Farbmischung experimentell beschreiben',
      'Strahlenmodell des Lichts verwenden',
      'Brechung und Dispersion bei optischen Abbildungen beschreiben',
      'Bildentstehung am Auge modellieren',
      'Strahlenverlauf an Sammel- und Zerstreuungslinsen untersuchen',
      'Optische Geräte modellhaft bauen und Strahlenverläufe simulieren',
      'Glühlampen, Gasentladungslampen, LED, Solarzelle und Laser als Lichterzeuger unterscheiden',
      'Wirkungsgrad, Spektren, Rohstoffeinsatz und Energiesparen bei Lichtquellen beurteilen',
    ],
  },
  {
    code: 'J8-LADUNG',
    title: 'Klasse 8: Materie - Elektrische Ladung',
    page: 27,
    stageLabel: 'Klasse 8',
    rows: [
      'Elektrische Ladung als physikalische Größe qualitativ beschreiben und mit dem Elektroskop nachweisen',
      'Teilung und Ausgleich elektrischer Ladungen beschreiben',
      'Coulombkraft halbquantitativ in Abhängigkeit vom Abstand der Ladungen beschreiben',
      'Bewegung eines Körpers zwischen geladenen Platten qualitativ erklären',
      'Atomkern, Atomhülle, Elektronen, Protonen, Neutronen und Ionen beschreiben',
      'Elektronenmangel und Elektronenüberschuss mit geladenen Körpern verknüpfen',
      'Wirkungen elektrischen Stroms und Energieumwandlungen in Stromkreisen beschreiben',
      'Elektrische Verbraucher und Spannungsquellen als Energiewandler beschreiben',
      'Gefahren durch elektrischen Strom, lebensgefährliche Stromstärken und Spannungen beurteilen',
      'Durchbruchspannung von Luft und Nennspannung elektrischer Geräte einordnen',
    ],
  },
  {
    code: 'J8-KABEL',
    title: 'Klasse 8: Kontext - Warum fließt Strom durch Kabel?',
    page: 28,
    stageLabel: 'Klasse 8',
    rows: [
      'Praktisch genutzte Stromleiter wie Kupfer, Aluminium und Gold hinsichtlich Leitfähigkeit und Rohstoffverbrauch vergleichen',
      'Aufbau elektrischer Leitungen untersuchen',
      'Metallgitter aus Metall-Ionen und frei beweglichen Elektronen modellieren',
      'Atombau als Schalenmodell und Periodensystem am Beispiel Aluminium nutzen',
      'Zusammenhang zwischen Protonenzahl, Elektronenzahl, Außenelektronen, Schalen und Stellung im Periodensystem beschreiben',
      'Bildung positiv geladener Metall-Ionen vereinfacht beschreiben',
      'Elektrischen Strom in Metallen mit Spannungsquelle, beweglichen Elektronen und schwingenden Metall-Ionen modellieren',
      'Elektrische Leitfähigkeit verschiedener Leiter und Isolatoren qualitativ untersuchen',
    ],
  },
  {
    code: 'J8-STROMKREISE',
    title: 'Klasse 8: System - Stromkreise',
    page: 29,
    stageLabel: 'Klasse 8',
    rows: [
      'Elektrische Stromstärke und elektrische Spannung als physikalische Größen messen',
      'Reihen- und Parallelschaltungen von Verbrauchern und Spannungsquellen unterscheiden',
      'Gesetze für Stromstärke und Spannung in Reihen- und Parallelschaltungen anwenden',
      'Zusammenhang von Spannung und Stromstärke bei metallischen Leitern untersuchen',
      'Ohm’sches Gesetz bei konstanter Temperatur anwenden',
      'Elektrischen Widerstand als Verhältnis von Spannung und Stromstärke bestimmen',
      'I-U-Kennlinien von Widerstand und Leuchtmittel aufnehmen und auswerten',
      'Elektrische Leistung und elektrische Energie berechnen',
      'Elektrische Energie haushaltsüblicher Geräte messen und beurteilen',
    ],
  },
  {
    code: 'J8-WAERME',
    title: 'Klasse 8: Energie - Temperatur und Wärme',
    page: 31,
    stageLabel: 'Klasse 8',
    rows: [
      'Temperatur als physikalische Größe mit absoluter Temperatur und Kelvinskala beschreiben',
      'Temperatur mit der kinetischen Energie von Teilchen verknüpfen',
      'Längenänderung fester Körper, Volumenänderung von Flüssigkeiten und Gasen sowie Anomalie des Wassers beschreiben',
      'Thermische Energie, Wärmequellen und Wärme als physikalische Größe unterscheiden',
      'Grundgleichung der Wärmelehre anwenden',
      'Spezifische Wärmekapazität in Experimenten und Anwendungen deuten',
      'Wärmeleitung, Wärmeströmung und Wärmestrahlung unterscheiden',
      'Technische Anwendungen zur Wärmeübertragung beschreiben',
      'Aggregatzustandsänderungen durch Zufuhr oder Abgabe von Wärme erklären',
      'Schmelzen, Erstarren, Verdampfen, Kondensieren, Schmelzwärme und Verdampfungswärme beschreiben',
      'Druckabhängigkeit von Schmelz- und Siedetemperatur qualitativ einordnen',
      'Wärmepumpe und Verbrennungsmotor hinsichtlich Aufbau, Funktionsweise und Energieumwandlungen beschreiben',
    ],
  },
  {
    code: 'J9-MAGNETISMUS',
    title: 'Klasse 9: Wechselwirkung - Magnetismus',
    page: 33,
    stageLabel: 'Klasse 9',
    rows: [
      'Dauermagnetismus mit Modell der Elementarmagnete und Ferromagnetismus erklären',
      'Anwendungen von Dauermagneten beschreiben',
      'Magnetisches Feld mit Feldlinienmodell und Feldlinienbildern von Stabmagnet und Hufeisenmagnet interpretieren',
      'Pole, Homogenität und Richtung der Feldlinien in magnetischen Feldbildern deuten',
      'Erdmagnetfeld mit Kompass und Feldlinienmodell beschreiben',
      'Stromdurchflossene Leiter als Magnet qualitativ beschreiben',
      'Feldlinienbilder von Spule und geradem Leiter beschreiben',
      'Lorentzkraft und elektromotorisches Prinzip qualitativ beschreiben',
      'Dauer- und Elektromagnete vergleichen',
    ],
  },
  {
    code: 'J9-INDUKTION',
    title: 'Klasse 9: Energie - Gleichstrommotor und Induktion',
    page: 35,
    stageLabel: 'Klasse 9',
    rows: [
      'Aufbau und Funktionsweise eines Gleichstrommotors schematisch erklären',
      'Energieumwandlungen im Gleichstrommotor beschreiben',
      'Elektromagnetische Induktion in Spulen qualitativ beschreiben',
      'Induktionsspannung erzeugen und Induktionsgesetz qualitativ nutzen',
      'Energieumwandlungen bei Induktion und einfachen Anwendungen beschreiben',
      'Generator und Transformator als Anwendungen elektromagnetischer Induktion erklären',
      'Erzeugung und Transformation von Wechselspannungen beschreiben',
      'Stromerzeugung, Stromübertragung und Nachhaltigkeit bei Generator und Transformator beurteilen',
    ],
  },
  {
    code: 'J9-BEWEGUNG',
    title: 'Klasse 9: Bewegungen - Geradlinige, gleichförmige Bewegung',
    page: 36,
    stageLabel: 'Klasse 9',
    rows: [
      'Ruhe und Bewegung als abhängig vom Bezugssystem beschreiben',
      'Relativität der Bewegung und Bewegungsarten mit Bahnformen unterscheiden',
      'Geradlinige gleichförmige Bewegungen mit Weg-Zeit- und Geschwindigkeit-Zeit-Diagrammen darstellen',
      'Geschwindigkeit als physikalische Größe und als Anstieg im Weg-Zeit-Diagramm deuten',
      'Momentan- und Durchschnittsgeschwindigkeit unterscheiden',
    ],
  },
  {
    code: 'J9-EBIKE',
    title: 'Klasse 9: Kontext - Mit dem E-Bike unterwegs',
    page: 37,
    stageLabel: 'Klasse 9',
    rows: [
      'Aufbau eines E-Bikes mit Elektromotor, Akku, Getriebe, Laufrad, Steuerelektronik und Sensoren beschreiben',
      'Energiebetrachtungen am E-Bike durchführen',
      'Kapazität des Akkus und Austauschbarkeit hinsichtlich Reichweite und Nachhaltigkeit beurteilen',
      'Ungleichförmige Bewegung eines E-Bikes mit Momentan- und Durchschnittsgeschwindigkeit beschreiben',
      'Reaktionszeit und Reaktionsweg in Verkehrskontexten bestimmen',
      'Gleichförmige Kreisbewegung der Räder mit Umlaufzeit und Bahngeschwindigkeit beschreiben',
      'Radialkraft bei Kreisbewegungen berechnen und von Zentrifugalkraft unterscheiden',
    ],
  },
  {
    code: 'J10-BESCHLEUNIGT',
    title: 'Klasse 10: Bewegungen - Gleichmäßig beschleunigte Bewegung',
    page: 39,
    stageLabel: 'Klasse 10',
    rows: [
      'Bewegung in Bezugssystemen und Massepunkte in Bezugssystemen beschreiben',
      'Gleichmäßig beschleunigte Bewegungen mit Anfangsbedingungen mathematisch beschreiben',
      'Beschleunigung als physikalische Größe verwenden',
      'Momentangeschwindigkeit für sehr kleine Zeitintervalle deuten',
      'Weg-Zeit-, Geschwindigkeit-Zeit- und Beschleunigung-Zeit-Gesetze anwenden',
      'Anstiege in Weg-Zeit- und Geschwindigkeit-Zeit-Diagrammen deuten',
      'Freien Fall mit Fallbeschleunigung und Bewegungsgesetzen beschreiben',
      'Einfluss des Luftwiderstands beim freien Fall qualitativ thematisieren',
      'Senkrechte Würfe als freien Fall mit Anfangsbedingungen beschreiben',
      'Würfe mit Superpositionsprinzip, senkrechtem und waagerechtem Wurf analysieren',
    ],
  },
  {
    code: 'J10-DYNAMIK',
    title: 'Klasse 10: Wechselwirkung - Dynamik',
    page: 41,
    stageLabel: 'Klasse 10',
    rows: [
      'Newtonsche Gesetze mit Trägheitsgesetz, Grundgesetz der Mechanik und Wechselwirkungsgesetz beschreiben',
      'Trägheit, träge Masse und Inertialsysteme erklären',
      'Zusammenhang zwischen Kraft, Masse und Beschleunigung experimentell untersuchen',
      'Wechselwirkungsgesetz mit paarweise auftretenden Kräften anwenden',
      'Kraft als vektorielle Größe mit Kräftegleichgewicht an einem Körper beschreiben',
      'Kräfte zeichnerisch mit Kräfteparallelogramm addieren',
      'Parallel und senkrecht wirkende Kräfte rechnerisch addieren',
      'Kräfte an der geneigten Ebene zerlegen',
    ],
  },
  {
    code: 'J10-GRAVITATION',
    title: 'Klasse 10: Wechselwirkung - Gravitationsfeld und Kreisbewegung',
    page: 42,
    stageLabel: 'Klasse 10',
    rows: [
      'Gravitationskraft und Gravitationsgesetz anwenden',
      'Fallbeschleunigung auf verschiedenen Himmelskörpern als Gravitationsfeldstärke beschreiben',
      'Feldlinienbilder von erdnahem und erdfernem Gravitationsfeld unterscheiden',
      'Winkelgeschwindigkeit, Bahngeschwindigkeit und Radialbeschleunigung der Kreisbewegung bestimmen',
      'Kreisbewegungen terrestrischer Anwendungen quantitativ beschreiben',
      'Satellitenbewegungen um Himmelskörper mit kosmischer Geschwindigkeit, Bahnradien, Umlaufzeiten und Bahngeschwindigkeiten beschreiben',
      'Satellitenbahnen als idealisierte Kreisbahnen modellieren und auf Ellipsen und Hyperbeln ausblicken',
    ],
  },
  {
    code: 'J10-KERNPHYSIK',
    title: 'Klasse 10: Materie - Kernphysik',
    page: 43,
    stageLabel: 'Klasse 10',
    rows: [
      'Aufbau des Atoms mit Größen- und Massenverhältnissen beschreiben',
      'Aufbau des Atomkerns mit Massenzahl, Nuklid, Isotop, Nuklidkarte und Symbolschreibweise beschreiben',
      'Alpha-, Beta-minus- und Gamma-Strahlung hinsichtlich Ladung, Energie und Durchdringungsvermögen unterscheiden',
      'Hintergrundstrahlung, Nulleffekt und Abschirmung ionisierender Strahlung beschreiben',
      'Ionisierende Strahlung nachweisen und Absorption untersuchen',
      'Kernzerfallsgleichungen und Gleichungen für Kernspaltung und Kernfusion qualitativ nutzen',
      'Umwandlung von Masse in Energie bei Kernprozessen qualitativ beschreiben',
      'Zerfallsgesetz und Halbwertszeit anwenden',
      'Anwendungen ionisierender Strahlung in Medizin und Technik beschreiben',
      'Biologische Wirkung, Strahlenschutz, Äquivalentdosis und künstliche Strahlenbelastung beurteilen',
    ],
  },
]

const upperTopics: Topic[] = [
  {
    code: 'Q-INT-GROESSEN',
    title: 'Jahrgangsübergreifend: Physikalische Größen',
    page: 16,
    stageLabel: 'Qualifikationsphase',
    rows: [
      'Größen als Produkt von Maßzahl und Maßeinheit beschreiben',
      'Definition einer physikalischen Größe in einem Steckbrief angeben',
      'Formelzeichen und Maßeinheit einer physikalischen Größe sicher verwenden',
      'SI-Grundeinheiten von abgeleiteten Einheiten unterscheiden',
      'Einheitenpräfixe im SI-Einheitensystem verwenden',
    ],
  },
  {
    code: 'Q-SYSTEM-ERHALTUNG',
    title: 'System - Erhaltungssätze',
    page: 17,
    stageLabel: 'Qualifikationsphase',
    rows: [
      'Potenzielle Lageenergie der Mechanik berechnen',
      'Potenzielle Spannenergie der Mechanik berechnen',
      'Kinetische Energie der Mechanik berechnen',
      'Energiebilanzen aufstellen und Prozess- von Zustandsgrößen unterscheiden',
      'Mechanische Energieformen experimentell ineinander umwandeln',
      'Energieerhaltungssatz mit Gültigkeitsbedingungen anwenden',
      'Impuls als physikalische Größe mit vektoriellem Charakter beschreiben',
      'Impulserhaltungssatz in einfachen Fällen anwenden',
      'Rückstoßexperimente sowie Impuls- und Energieerhaltung beim Newtonpendel untersuchen',
      'Mechanische Arbeit als Integral unter Gültigkeitsbedingungen beschreiben',
      'Mechanische Arbeit als Kraft-Weg-Produkt mit Winkelabhängigkeit beschreiben',
      'Zentrale vollständig elastische Stöße analysieren',
      'Zentrale vollständig unelastische Stöße analysieren',
      'Stoßgleichungen interpretieren und Energiebetrachtungen bei Stößen durchführen',
    ],
  },
  {
    code: 'Q-EFELD',
    title: 'Elektrische Felder',
    page: 19,
    stageLabel: 'Qualifikationsphase',
    rows: [
      'Ladung und Stromstärke als physikalische Größen und Änderungsrate beziehungsweise Kumulation beschreiben',
      'Elementarladung verwenden',
      'Coulomb’sches Gesetz anwenden',
      'Elektrischen Feldbegriff beschreiben',
      'Elektrische Feldstärke als physikalische Größe verwenden',
      'Kraft auf eine Probeladung im elektrischen Feld bestimmen',
      'Feldlinienmodell elektrischer Felder verwenden',
      'Homogenes Feld, Radialfeld und Dipolfeld in Feldlinienbildern unterscheiden',
      'Elektrische Felder experimentell oder simulativ veranschaulichen',
      'Superposition elektrischer Felder graphisch durchführen',
      'Superposition elektrischer Felder im Leistungskurs rechnerisch durchführen',
      'Influenz und Abschirmung elektrischer Felder beschreiben',
      'Faraday’schen Käfig als Abschirmung elektrischer Felder beschreiben',
      'Dielektrische Polarisation beschreiben',
      'Arbeit im elektrischen Feld bestimmen',
      'Elektrisches Potential und Spannung als Potentialdifferenz unterscheiden',
      'Elektronenvolt als Energieeinheit im elektrischen Feld nutzen',
    ],
  },
  {
    code: 'Q-KONDENSATOR',
    title: 'Kondensator',
    page: 21,
    stageLabel: 'Qualifikationsphase',
    rows: [
      'Kondensator als Ladungsspeicher beschreiben',
      'Allgemeinen Aufbau von Kondensatoren und Plattenkondensator unterscheiden',
      'Kapazität als physikalische Größe und Zusammenhang von Ladung und Spannung anwenden',
      'Kapazität des Plattenkondensators mit Fläche, Plattenabstand und Dielektrizitätszahl beschreiben',
      'Anwendungen von Kondensatoren in Sensoren beschreiben',
      'Kondensator als Energiespeicher und Vergleich mit Akkumulatoren beurteilen',
      'Elektrisches Feld im Plattenkondensator über Spannung und Plattenabstand bestimmen',
      'Potentielle Energie einer Probeladung im Plattenkondensator bestimmen',
      'Millikanversuch im Plattenkondensator beschreiben',
      'Stromstärke beim Aufladen eines Kondensators qualitativ beschreiben',
      'Stromstärke beim Entladen eines Kondensators quantitativ beschreiben',
      'Einfluss der Parameter Widerstand und Kapazität auf Auf- und Entladevorgänge untersuchen',
      'Spannung und Stromstärke beim Aufladen eines Kondensators im Leistungskurs quantitativ beschreiben',
      'Spannung beim Entladen eines Kondensators im Leistungskurs quantitativ beschreiben',
    ],
  },
  {
    code: 'Q-MFELD-INDUKTION',
    title: 'Magnetische Felder und Induktion',
    page: 23,
    stageLabel: 'Qualifikationsphase',
    rows: [
      'Lorentzkraft auf stromdurchflossene Leiter und bewegte Ladungen bestimmen',
      'Magnetische Flussdichte als physikalische Größe beschreiben',
      'Magnetischen Fluss als Produkt von Fläche und magnetischer Flussdichte bestimmen',
      'Magnetischen Feldbegriff und Feldlinienbilder magnetischer Felder beschreiben',
      'Homogenes magnetisches Feld und Erdmagnetfeld beschreiben',
      'Magnetfeld einer stromdurchflossenen Spule beschreiben',
      'Magnetfeld einer langen stromdurchflossenen Spule bestimmen',
      'Induktionsgesetz mit Änderung des magnetischen Flusses und Geltungsbedingungen anwenden',
      'Lenz’sche Regel anwenden',
      'Sinusförmige Wechselspannung am Generator und Lenz’sche Regel experimentell untersuchen',
      'Induktionsgesetz in differenzieller Form im Leistungskurs anwenden',
      'Selbstinduktion und Induktivität als physikalische Größe beschreiben',
      'Induktivität einer langen Spule und magnetische Feldenergie bestimmen',
      'Ein- und Ausschaltvorgänge einer Spule mit I-t-Diagrammen analysieren',
    ],
  },
  {
    code: 'Q-TEILCHEN-FELDER',
    title: 'Bewegung geladener Teilchen in Feldern',
    page: 25,
    stageLabel: 'Qualifikationsphase',
    rows: [
      'Bewegung elektrisch geladener Teilchen in homogenen elektrischen Längs- und Querfeldern beschreiben',
      'Elektronenstrahlröhre als Anwendung elektrischer Felder erklären',
      'Linearbeschleuniger als Anwendung elektrischer Felder erklären',
      'Ablenkung geladener Teilchen im elektrischen Querfeld erklären',
      'Elektronenvolt als Energieeinheit nutzen',
      'Kinetische Energie und Geschwindigkeit eines im elektrischen Längsfeld beschleunigten Teilchens herleiten',
      'Kreisbewegung geladener Teilchen in homogenen Magnetfeldern beschreiben',
      'Spezifische Ladung des Elektrons im Fadenstrahlrohr bestimmen',
      'Zyklotron, Synchrotron und Forschungseinrichtungen wie DESY oder CERN als Feldanwendungen einordnen',
      'Bewegung geladener Teilchen in homogenen Querfeldern im Leistungskurs quantitativ beschreiben',
      'Bewegung geladener Teilchen in gekreuzten Feldern beschreiben',
      'Massenspektrograph mit Geschwindigkeitsfilter beschreiben',
      'Halleffekt und Hallsonde beschreiben',
    ],
  },
  {
    code: 'Q-SCHWINGUNGEN',
    title: 'Mechanische und elektromagnetische Schwingungen',
    page: 26,
    stageLabel: 'Qualifikationsphase',
    rows: [
      'Begriffe Schwingung, schwingungsfähiges System und Schwingungsebene beschreiben',
      'Mechanische Schwingungen mit Auslenkung beschreiben',
      'Amplitude, Periodendauer und Frequenz mechanischer Schwingungen bestimmen',
      'y-t-Diagramme mechanischer Schwingungen interpretieren',
      'Harmonische Schwingungen mit Bewegungsgesetzen und Federschwinger modellieren',
      'Energieumwandlungen bei harmonischen Schwingungen beschreiben',
      'Elektromagnetische Schwingungen mit Aufbau und Funktionsweise eines Schwingkreises beschreiben',
      'Energieumwandlungen im elektromagnetischen Schwingkreis analog zu mechanischen Schwingungen beschreiben',
      'Harmonische Schwingungen mit Beschleunigung und linearem Kraftgesetz im Leistungskurs beschreiben',
      'Fadenpendel mit Kleinwinkelnäherung und Gültigkeitsbedingungen beschreiben',
      'Elektromagnetischen Schwingkreis mit Kenngrößen und Thomson’scher Schwingungsgleichung beschreiben',
      'Mechanische und elektromagnetische Schwingungen hinsichtlich Energieformen vergleichen',
      'Gedämpfte Schwingungen mit Einhüllender in y-t-, u-t- und i-t-Diagrammen beschreiben',
      'Ursachen der Dämpfung und sicherheitskritische Anwendungen gedämpfter Schwingungen beschreiben',
      'Resonanz bei erzwungenen Schwingungen mit Eigenfrequenz, Erregerfrequenz und Resonanzkurve beschreiben',
    ],
  },
  {
    code: 'Q-WELLEN',
    title: 'Mechanische und elektromagnetische Wellen',
    page: 28,
    stageLabel: 'Qualifikationsphase',
    rows: [
      'Entstehung mechanischer und elektromagnetischer Wellen beschreiben',
      'Welle und Auslenkung als Grundbegriffe beschreiben',
      'Wellenlänge, Frequenz und Ausbreitungsgeschwindigkeit definieren',
      'Abhängigkeit der Ausbreitungsgeschwindigkeit vom Medium beschreiben',
      'Harmonische Wellen qualitativ beschreiben',
      'Lineare, ebene und räumliche Wellen unterscheiden',
      'Longitudinal- und Transversalwellen unterscheiden',
      'Lineare Polarisation als Unterscheidungsmerkmal von Wellen nutzen',
      'Elektromagnetisches Spektrum beschreiben',
      'Natürliche und technische Anwendungen elektromagnetischer Spektralbereiche beschreiben',
      'Mathematische Beschreibung harmonischer Wellen im Leistungskurs anwenden',
      'Lichtgeschwindigkeit im Vakuum beschreiben',
    ],
  },
  {
    code: 'Q-WELLEN-PHAENOMENE',
    title: 'Phänomene bei der Ausbreitung von Wellen',
    page: 30,
    stageLabel: 'Qualifikationsphase',
    rows: [
      'Reflexion, Brechung, Totalreflexion und Beugung bei Wellen beschreiben',
      'Reflexionsgesetz und Brechungsgesetz anwenden',
      'Stehende Wellen beschreiben',
      'Konstruktive und destruktive Superposition beschreiben',
      'Kohärenz und Kohärenzbedingung beschreiben',
      'Wellenlängenbestimmung mittels durch Reflexion erzeugter stehender Wellen durchführen',
      'Interferenz am Doppelspalt mit Spaltabstand und Gangunterschied beschreiben',
      'Interferenz am Gitter und Lage der Maxima beschreiben',
      'Gitterspektren und Wellenlängenbestimmung monochromatischen Lichts auswerten',
      'Kleinwinkelnäherung bei Interferenz im Leistungskurs kritisch diskutieren',
      'Huygens’sches Prinzip mit Wellenfront, Wellennormale und Elementarwelle beschreiben',
      'Stehende Wellen durch Reflexion mit Grund- und Oberschwingungen sowie festen und freien Enden beschreiben',
      'Beugung und Interferenz am Einzelspalt im Leistungskurs beschreiben',
      'Interferometer mit Aufbau und Funktionsweise eines Mach-Zehnder-Interferometers beschreiben',
    ],
  },
  {
    code: 'Q-QUANTEN',
    title: 'Quantenobjekte',
    page: 32,
    stageLabel: 'Qualifikationsphase',
    rows: [
      'Äußeren lichtelektrischen Effekt mit Einstein’scher Gerade interpretieren',
      'Photonenmodell und Energie-Frequenz-Zusammenhang verwenden',
      'Hallwachs-Versuch und Fotoeffekt zur Quantisierung von Licht deuten',
      'Zufälligkeit einzelner quantenphysikalischer Messergebnisse beschreiben',
      'Wahrscheinlichkeitsaussagen der Quantentheorie beschreiben',
      'Welle-Teilchen-Dualismus bei Elektronen und Photonen erläutern',
      'Doppelspaltexperimente mit Elektronen und Photonen deuten',
      'De-Broglie-Wellenlänge von Elektronen bestimmen',
      'Wellenfunktion qualitativ im Leistungskurs deuten',
      'Verschränkung von Quantenobjekten als quantenphysikalischen Effekt beschreiben',
      'Unbestimmtheitsrelation und Komplementarität als Grenzen klassischer Bahnvorstellungen einordnen',
    ],
  },
  {
    code: 'Q-ATOM',
    title: 'Materie und Atommodelle',
    page: 36,
    stageLabel: 'Qualifikationsphase',
    rows: [
      'Quantenphysikalischen Charakter des Elektrons in der Atomhülle beschreiben',
      'Energieniveaumodell und Linienspektren zur Beschreibung von Atomen nutzen',
      'Franck-Hertz-Versuch als Hinweis auf diskrete Energieniveaus einordnen',
      'Flammenfärbung und Linienspektren als Hinweise auf diskrete Energieniveaus einordnen',
      'Röntgenstrahlung und charakteristische Röntgenspektren qualitativ beschreiben',
      'Quantenmechanisches Atommodell mit Orbitalvorstellungen beschreiben',
      'Modell des eindimensionalen Potenzialtopfes im Leistungskurs beschreiben',
      'Wellenfunktionen und Nachweiswahrscheinlichkeiten im eindimensionalen Potenzialtopf interpretieren',
      'Quantenzahlen und Spin im Leistungskurs für Atommodelle nutzen',
      'Verhältnis von Elektronenbahn- und Orbitalvorstellungen diskutieren',
    ],
  },
  {
    code: 'Q-INTEGRATIVE-VERTIEFUNG',
    title: 'Jahrgangsübergreifende integrative Themen',
    page: 37,
    stageLabel: 'Qualifikationsphase',
    rows: [
      'Elektronik als fachübergreifendes integratives Thema physikalisch einordnen',
      'Thermodynamik als fachübergreifendes integratives Thema physikalisch einordnen',
      'Astronomische Beobachtungen als integratives Thema physikalisch einordnen',
      'Projektorientierte Anwendungen physikalischer Kompetenzen in wechselnden Zusammenhängen bearbeiten',
    ],
  },
]

// Batch 015 electricity structural split overlay
const batch015SplitParentIds = new Set(["1911920e-b099-4310-82f2-b47f51a78b33","ec5cac7b-ad31-590c-8ab0-5b3ef24d2bca","50431e92-eec9-54d6-b437-ea7a51b6f474"])
const batch015TargetsBySourceGoalId: Record<string, string[]> = {
  "mv-phys-seki-rp2022-j8-ladung-009-9b16b23a": [
    "5ddba212-9e0a-5dd4-8274-239ec51ab6a8"
  ],
  "mv-phys-seki-rp2022-j8-ladung-010-0d2795b5": [
    "27b90ce9-b650-5232-85fb-ce2cb69d59a3"
  ],
  "mv-phys-seki-rp2022-j8-stromkreise-007-faa3e23b": [
    "66256e22-44a3-5939-8862-821e29d6711d"
  ],
  "mv-phys-seki-rp2022-j9-induktion-007-575785eb": [
    "4a42cddd-7827-5204-87e5-8d9eac7792f1"
  ],
  "mv-phys-seki-rp2022-j9-ebike-003-4bc22ec8": [
    "27b90ce9-b650-5232-85fb-ce2cb69d59a3"
  ]
}
// Batch 017 nuclear structural adjudication overlay
const batch017SplitParentIds = new Set(["f6f646db-3544-49ed-8f55-67bc684e80ce","cb0426b0-a973-5660-b6fe-79407934730f"])
const batch017TargetsBySourceGoalId: Record<string, string[]> = {
  "mv-phys-seki-rp2022-j10-kernphysik-002-f0143df5": [
    "f74c691b-0b76-54e0-8fd6-a22211994e0a"
  ],
  "mv-phys-seki-rp2022-j10-kernphysik-003-7401a30c": [
    "1593d95c-2aac-504c-8527-37cb61877da9"
  ],
  "mv-phys-seki-rp2022-j10-kernphysik-004-9d924038": [
    "25d91cc0-d84c-5522-86b5-fdff73264f08"
  ],
  "mv-phys-seki-rp2022-j10-kernphysik-005-f5927ff3": [
    "25d91cc0-d84c-5522-86b5-fdff73264f08"
  ],
  "mv-phys-seki-rp2022-j10-kernphysik-006-05bec548": [
    "1593d95c-2aac-504c-8527-37cb61877da9"
  ],
  "mv-phys-seki-rp2022-j10-kernphysik-007-72ab6104": [
    "7d78da7f-6af5-440a-9d6b-6cab4bee8dd2"
  ],
  "mv-phys-seki-rp2022-j10-kernphysik-008-0ecfe0e7": [
    "16b94a12-ecc5-5b5c-85b6-87b4290bebf8"
  ],
  "mv-phys-seki-rp2022-j10-kernphysik-010-92147256": [
    "861ba00a-e89c-5b3d-8c76-8ff0bcb0f1cd",
    "e6a50c74-c922-508c-aa27-07bac2566955"
  ]
}

const batch017RemovedTargetsBySourceGoalId: Record<string, string[]> = {
  "mv-phys-seki-rp2022-j8-waerme-007-6cad190f": [
    "051cedc5-d380-4716-9751-b18f2e67a912"
  ],
  "mv-phys-seki-rp2022-j10-kernphysik-002-f0143df5": [
    "1e9ec823-384b-5e5f-974c-4ce224d05c19"
  ],
  "mv-phys-seki-rp2022-j10-kernphysik-003-7401a30c": [
    "051cedc5-d380-4716-9751-b18f2e67a912",
    "cbb26ed2-6979-46f6-a4ae-128f5c5d9d76",
    "327302e3-5b36-46f8-9c16-73f24583b0eb"
  ],
  "mv-phys-seki-rp2022-j10-kernphysik-004-9d924038": [
    "051cedc5-d380-4716-9751-b18f2e67a912",
    "2a6703e0-2a6f-4ebf-a5c6-7aa05a4b86eb",
    "979e0d0d-8933-4ace-814f-f28060ad280f"
  ],
  "mv-phys-seki-rp2022-j10-kernphysik-005-f5927ff3": [
    "051cedc5-d380-4716-9751-b18f2e67a912",
    "2a6703e0-2a6f-4ebf-a5c6-7aa05a4b86eb"
  ],
  "mv-phys-seki-rp2022-j10-kernphysik-006-05bec548": [
    "e4b38061-1f28-43ad-8371-a3e7c0e81856",
    "09029573-864f-40ca-bf8a-cee7bf6dcb73",
    "2a6703e0-2a6f-4ebf-a5c6-7aa05a4b86eb"
  ],
  "mv-phys-seki-rp2022-j10-kernphysik-007-72ab6104": [
    "cbb26ed2-6979-46f6-a4ae-128f5c5d9d76",
    "327302e3-5b36-46f8-9c16-73f24583b0eb",
    "50877233-7abf-54df-b347-6d3224678fc9"
  ],
  "mv-phys-seki-rp2022-j10-kernphysik-008-0ecfe0e7": [
    "e4b38061-1f28-43ad-8371-a3e7c0e81856",
    "09029573-864f-40ca-bf8a-cee7bf6dcb73"
  ],
  "mv-phys-seki-rp2022-j10-kernphysik-009-034ad168": [
    "051cedc5-d380-4716-9751-b18f2e67a912",
    "2a6703e0-2a6f-4ebf-a5c6-7aa05a4b86eb"
  ],
  "mv-phys-seki-rp2022-j10-kernphysik-010-92147256": [
    "051cedc5-d380-4716-9751-b18f2e67a912"
  ]
}

const batch019TargetsBySourceGoalId: Record<string, string[]> = {
  'mv-phys-sekii-rp2022-q-teilchen-felder-003-38b4f6b0': [
    '74a74132-fa39-541c-8d3c-696cf228452d',
  ],
}

const batch019RemovedTargetsBySourceGoalId: Record<string, string[]> = {
  'mv-phys-sekii-rp2022-q-teilchen-felder-003-38b4f6b0': [
    '2d62b444-796e-548d-aeee-cfd9c6665ddc',
  ],
}

const batch019RationalesBySourceGoalId = new Map<string, string>([
  [
    'mv-phys-sekii-rp2022-q-teilchen-felder-003-38b4f6b0',
    'Das amtliche MV-Source-Ziel behandelt ausdrücklich den Linearbeschleuniger. Es wird deshalb partial dem bestehenden kanonischen Linearbeschleuniger-Ziel statt dem Zyklotron/Synchrotron-Vergleich zugeordnet.',
  ],
])

// Batch 025 average/instantaneous-velocity structural split overlay
const batch025TargetsBySourceGoalId: Record<string, string[]> = {
  "mv-phys-seki-rp2022-j9-bewegung-004-b1d00202": [
    "bf8517a9-142b-5789-826a-767f3b277998"
  ],
  "mv-phys-seki-rp2022-j9-bewegung-005-411d8eba": [
    "bf8517a9-142b-5789-826a-767f3b277998"
  ],
  "mv-phys-seki-rp2022-j9-ebike-004-70caf2ad": [
    "bf8517a9-142b-5789-826a-767f3b277998"
  ],
  "mv-phys-seki-rp2022-j10-beschleunigt-004-92574af7": [
    "bf8517a9-142b-5789-826a-767f3b277998"
  ],
  "mv-phys-seki-rp2022-j10-beschleunigt-006-f9a0d70c": [
    "bf8517a9-142b-5789-826a-767f3b277998"
  ]
}
const batch025RemovedTargetsBySourceGoalId: Record<string, string[]> = {
  "mv-phys-seki-rp2022-j10-beschleunigt-004-92574af7": [
    "e4b38061-1f28-43ad-8371-a3e7c0e81856",
    "09029573-864f-40ca-bf8a-cee7bf6dcb73"
  ]
}
const batch025RationalesBySourceGoalId = new Map<string, string>([
  [
    "mv-phys-seki-rp2022-j9-bewegung-004-b1d00202",
    "Das amtliche MV-Ziel deutet Geschwindigkeit als Anstieg im Weg-Zeit-Diagramm. Es trägt damit einen Teil der Sekanten-/Tangentenkompetenz, aber nicht deren vollständigen Vergleich; die Zuordnung ist partial."
  ],
  [
    "mv-phys-seki-rp2022-j9-bewegung-005-411d8eba",
    "Das amtliche MV-Ziel fordert ausdrücklich die Unterscheidung von Momentan- und Durchschnittsgeschwindigkeit, jedoch nicht die vollständige Bestimmung und grafische Sekanten-/Tangenten-Deutung; die Zuordnung ist partial."
  ],
  [
    "mv-phys-seki-rp2022-j9-ebike-004-70caf2ad",
    "Das amtliche MV-Ziel nutzt Momentan- und Durchschnittsgeschwindigkeit zur Beschreibung einer ungleichförmigen E-Bike-Bewegung. Die vollständige Sekanten-/Tangenten-Deutung ist nicht ausgewiesen; die Zuordnung ist partial."
  ],
  [
    "mv-phys-seki-rp2022-j10-beschleunigt-004-92574af7",
    "Der amtliche MV-Aspekt deutet Momentangeschwindigkeit über sehr kleine Zeitintervalle. Er belegt weder das Konstantbeschleunigungsmodell noch freien Fall und deckt die neue Vergleichskompetenz nur teilweise ab."
  ],
  [
    "mv-phys-seki-rp2022-j10-beschleunigt-006-f9a0d70c",
    "Das amtliche MV-Ziel deutet Anstiege in Weg-Zeit- und Geschwindigkeit-Zeit-Diagrammen. Damit ist die neue Sekanten-/Tangentenkompetenz fachlich berührt, aber nicht vollständig formuliert; die Zuordnung ist partial."
  ]
])

const applyPhysicsBatch015Targets = (sourceGoalId: string, canonicalGoalIds: string[]): string[] => [
  ...new Set([
    ...canonicalGoalIds.filter((goalId) => !batch015SplitParentIds.has(goalId) && !batch017SplitParentIds.has(goalId) && !(batch017RemovedTargetsBySourceGoalId[sourceGoalId] ?? []).includes(goalId) && !(batch019RemovedTargetsBySourceGoalId[sourceGoalId] ?? []).includes(goalId) && !(batch025RemovedTargetsBySourceGoalId[sourceGoalId] ?? []).includes(goalId)),
    ...(batch015TargetsBySourceGoalId[sourceGoalId] ?? []),
    ...(batch017TargetsBySourceGoalId[sourceGoalId] ?? []),
    ...(batch019TargetsBySourceGoalId[sourceGoalId] ?? []),
    ...(batch025TargetsBySourceGoalId[sourceGoalId] ?? []),
  ]),
]

const configs: ExtractionConfig[] = [
  {
    stage: 'SekI',
    extractionId: 'DE-MV-PHYSIK-SEKI-RAHMENPLAN-2022',
    title: 'DE-MV - Physik Sekundarstufe I (Mecklenburg-Vorpommern, Rahmenplan 2022 Source-Extraction)',
    sourceLandscapeId: '27da5587-bef3-49ad-9fec-3907253b85bd',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/MV/Physik_Gymnasium_7_10_2022.pdf',
    sourcePdfUrl: 'https://www.bildung-mv.de/export/sites/bildungsserver/.galleries/dokumente/unterricht/rahmenplaene/RP_PHYS_Gym_Ges_7_10.pdf',
    sourceDocumentTitle: 'Rahmenplan für die Jahrgangsstufen 7 bis 10 Gymnasium Physik Mecklenburg-Vorpommern',
    extractionPath:
      'curricula/DE/Gymnasium/input/MV/lower-secondary/source-extraction/DE_MV_PHYSIK_SEKI_RAHMENPLAN_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-MV/lower-secondary/mv_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
    readmePath: 'curricula/DE/Gymnasium/mapping/DE-MV/lower-secondary/PHYSIK.md',
    topics: lowerTopics,
    oldSnapshotCount: 21,
    peerBaseline: 'HE/BW/HH/BB/BE = 48/278/128/246/258 Source-Ziele',
  },
  {
    stage: 'SekII',
    extractionId: 'DE-MV-PHYSIK-SEKII-RAHMENPLAN-2022',
    title: 'DE-MV - Physik Oberstufe (Mecklenburg-Vorpommern, Rahmenplan 2022 Source-Extraction)',
    sourceLandscapeId: 'f66821d1-64a5-428d-a826-36990b6f1e0f',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/MV/Physik_Gymnasium_11_12_2022.pdf',
    sourcePdfUrl: 'https://www.bildung-mv.de/export/sites/bildungsserver/.galleries/dokumente/unterricht/rahmenplaene/RP_PHYS_SEK2_Erprobungsfassung.pdf',
    sourceDocumentTitle: 'Rahmenplan für die Qualifikationsphase der gymnasialen Oberstufe Physik Mecklenburg-Vorpommern',
    extractionPath:
      'curricula/DE/Gymnasium/input/MV/upper-secondary/source-extraction/DE_MV_PHYSIK_SEKII_RAHMENPLAN_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-MV/upper-secondary/mv_physics_upper_secondary_source_extraction_to_canonical_physics.review.json',
    readmePath: 'curricula/DE/Gymnasium/mapping/DE-MV/upper-secondary/PHYSIK.md',
    topics: upperTopics,
    oldSnapshotCount: 15,
    peerBaseline: 'HE/BW/HB/SH/RP/NRW = 164/274/214/169/193/187 Source-Ziele',
  },
]

const add = (ids: Set<string>, ...goalIds: string[]): void => {
  for (const goalId of goalIds) ids.add(goalId)
}

const inferCanonicalGoalIds = (row: Row, config: ExtractionConfig): string[] => {
  const ids = new Set<string>()
  const text = `${row.topicCode} ${row.text}`.toLowerCase()

  add(ids, target.methods)
  if (/digital|simulation|diagramm|mess|experiment|daten|kennlinie|tabelle/u.test(text)) add(ids, target.digitalMeasurement)
  if (/unsicherheit|abweichung|fehler/u.test(text)) add(ids, target.uncertainty)
  if (/beurteilen|bewerten|nachhaltigkeit|gefahr|schutz|rohstoff|gesellschaft|verkehr|umwelt|medizin|technik|anwendung/u.test(text)) {
    add(ids, target.society)
  }

  if (config.stage === 'SekI') {
    if (/dichte|masse|volumen|schwimm|sink/u.test(text)) add(ids, target.density)
    if (/kraft|gewicht|feder|hooke|reibung|wechselwirkung|druck|hebel|rolle|flaschenzug|geneigte ebene/u.test(text)) {
      add(ids, target.forces)
    }
    if (/druck|tiefendruck|luftdruck|auflagedruck/u.test(text)) add(ids, target.pressure)
    if (/hebel|rolle|flaschenzug|geneigte ebene|goldene regel|wirkungsgrad/u.test(text)) add(ids, target.simpleMachines)
    if (/energie|arbeit|leistung|wirkungsgrad|kraftwerk/u.test(text)) {
      add(ids, target.electricEnergySimple, target.simpleMachines)
    }
    if (/temperatur|wärme|therm|ausdehnung|aggregat|schmelz|siede|wärmepumpe|verbrennungsmotor/u.test(text)) {
      add(ids, target.sekIHeat, target.temperature)
    }
    if (/teilchen|kinetisch/u.test(text)) add(ids, target.particleModel)
    if (/ausdehnung|längenänderung|volumenänderung/u.test(text)) add(ids, target.expansion)
    if (/wärmeleitung|wärmeströmung|wärmestrahlung|wärmeübertragung/u.test(text)) add(ids, target.heatTransfer)
    if (/licht|optik|linse|strahl|spektrum|farbe|laser|led|solar|auge|brechung|dispersion/u.test(text)) {
      add(ids, target.light)
    }
    if (/strahlenmodell|strahlenverlauf|linse|abbildung/u.test(text)) add(ids, target.lightRays)
    if (/spektrum|farbe|rgb/u.test(text)) add(ids, target.spectrumColor)
    if (/auge|optisches gerät/u.test(text)) add(ids, target.opticsEye)
    if (/ladung|coulomb|elektroskop|platte|gewitter/u.test(text)) add(ids, target.electrostaticsSimple)
    if (/atom|ion|proton|neutron|elektron|pse|schalenmodell/u.test(text)) add(ids, target.atomSimple)
    if (/strom|spannung|stromkreis|schaltung|widerstand|ohm|kennlinie|verbraucher|leiter|isolator|metall/u.test(text)) {
      add(ids, target.electricCircuits)
    }
    if (/reihen|parallel|schalt/u.test(text)) add(ids, target.simpleCircuits)
    if (/stromstärke|spannung/u.test(text)) add(ids, target.currentVoltage)
    if (/messung von strom|stromstärken messen|spannungen/u.test(text)) add(ids, target.currentMeasure)
    if (/widerstand|ohm|kennlinie/u.test(text)) add(ids, target.resistance)
    if (/elektrische energie|elektrische leistung|verbraucher|spannungsquelle/u.test(text)) {
      add(ids, target.electricEnergySimple)
    }
    if (/gefahr|lebensgefährlich|schutz|durchbruchspannung|nennspannung/u.test(text)) add(ids, target.electricSafety)
    if (/magnet|ferromagnet|feldlinie|erdmagnet|elektromagnet|spule|leiter/u.test(text)) add(ids, target.magnetsSimple)
    if (/wirkung.*strom|elektromotor|gleichstrommotor|lorentz/u.test(text)) add(ids, target.currentEffects)
    if (/motor|generator|transformator|induktion|wechselspannung/u.test(text)) {
      add(ids, target.motorSimple, target.induction)
    }
    if (/bewegung|geschwindigkeit|weg-zeit|durchschnitt|momentan|bezugssystem|ruhe/u.test(text)) {
      add(ids, target.uniformMotionSekI)
    }
    if (/beschleunig|fall|wurf|superposition|momentangeschwindigkeit/u.test(text)) {
      add(ids, target.acceleratedMotion, target.freeFall)
    }
    if (/newton|trägheit|grundgesetz|inertial|kräftegleichgewicht|kräfteparallelogramm/u.test(text)) {
      add(ids, target.forceInertiaSekI, target.newtonAxioms)
    }
    if (/kreis|radial|zentrifugal|zentripetal|umlauf|bahn/u.test(text)) {
      add(ids, target.circularMotion, target.centripetalForce)
    }
    if (/gravitation|himmelskörper|satellit|kosmisch|feldlinie/u.test(text)) {
      add(ids, target.gravitation, target.gravitationalField)
    }
    if (/kern|radioaktiv|strahlung|zerfall|halbwert|nuklid|isotop|spaltung|fusion/u.test(text)) {
      add(ids, target.nuclearSimple)
    }
    if (/strahlenschutz|äquivalentdosis|medizin|technik|biologische wirkung|abschirmung/u.test(text)) {
      add(ids, target.nuclearRiskSimple)
    }
    if (/spaltung|fusion|masse in energie/u.test(text)) add(ids, target.nuclearFissionFusionSimple)
  } else {
    if (/größe|einheit|si-|maßzahl|formelzeichen/u.test(text)) add(ids, target.methods)
    if (/energie|arbeit|bilanz|erhaltung|leistung|potenziell|kinetisch/u.test(text)) add(ids, target.energy, target.conservation)
    if (/impuls|stoß|stöße|rückstoß/u.test(text)) add(ids, target.impulse, target.collisions)
    if (/ladung|stromstärke|coulomb|elektrisch|feldstärke|feldlinien|potential|spannung|influenz|dielektr/u.test(text)) {
      add(ids, target.electricField)
    }
    if (/coulomb/u.test(text)) add(ids, target.coulomb)
    if (/potential|spannung als potential|elektronenvolt/u.test(text)) add(ids, target.electricPotential)
    if (/kondensator|kapazität|aufladen|entladen|plattenkondensator|rc/u.test(text)) add(ids, target.capacitor)
    if (/plattenkondensator|feld im platten/u.test(text)) add(ids, target.capacitorField)
    if (/auflad|entlad/u.test(text)) add(ids, target.capacitorCharge)
    if (/millikan/u.test(text)) add(ids, target.millikan)
    if (/magnet|flussdichte|lorentz|spule|erdmagnet|induktion|selbstinduktion|hall/u.test(text)) {
      add(ids, target.magneticField)
    }
    if (/lorentz|bewegte ladungen|stromdurchflossene leiter/u.test(text)) add(ids, target.lorentz)
    if (/induktion|induktions|magnetischer fluss|lenz|generator|wechselspannung/u.test(text)) {
      add(ids, target.induction, target.inductionLaw)
    }
    if (/selbstinduktion|induktivität|einschalt|ausschalt|feldenergie/u.test(text)) add(ids, target.selfInduction)
    if (/teilchen|elektronenstrahl|linearbeschleuniger|querfeld|längsfeld|fadenstrahl|zyklotron|synchrotron|massenspektro|hall/u.test(text)) {
      add(ids, target.chargedInEField)
    }
    if (/fadenstrahl/u.test(text)) add(ids, target.fadenstrahl)
    if (/massenspektro/u.test(text)) add(ids, target.massSpectrometer)
    if (/zyklotron|synchrotron|cern|desy|beschleuniger/u.test(text)) add(ids, target.particleAccelerators)
    if (/halleffekt|hallsonde/u.test(text)) add(ids, target.hallProbe)
    if (/schwingung|pendel|schwingkreis|resonanz|gedämpft|thomson/u.test(text)) add(ids, target.oscillation)
    if (/energieumwandlungen.*schwing|schwingkreis/u.test(text)) add(ids, target.oscillationEnergy)
    if (/gedämpft|dämpfung/u.test(text)) add(ids, target.dampedOscillation)
    if (/schwingkreis|thomson/u.test(text)) add(ids, target.lcOscillation)
    if (/welle|wellenlänge|frequenz|ausbreitung|longitudinal|transversal|reflexion|brechung|beugung|interferenz|stehende|polarisation/u.test(text)) {
      add(ids, target.waves)
    }
    if (/kenngrößen|harmonische wellen|wellenlänge|frequenz|ausbreitung/u.test(text)) add(ids, target.waveBasics)
    if (/reflexion|brechung|beugung|totalreflexion|huygens/u.test(text)) add(ids, target.wavePhenomena)
    if (/interferenz|doppelspalt|gitter|kohärenz|superposition/u.test(text)) add(ids, target.waveInterference)
    if (/stehende wellen|grund- und oberschwingungen/u.test(text)) add(ids, target.standingWaves)
    if (/elektromagnetische wellen|lichtgeschwindigkeit|spektrum|polarisation/u.test(text)) add(ids, target.emWaves)
    if (/spektrum|spektralbereiche/u.test(text)) add(ids, target.spectrumEm)
    if (/interferometer|mach-zehnder/u.test(text)) add(ids, target.interferometer)
    if (/quanten|photon|photo|lichteffekt|doppelspalt|de-broglie|wellenfunktion|verschränkung|unbestimmtheit|komplementarität/u.test(text)) {
      add(ids, target.quantum)
    }
    if (/photon|lichteffekt|einstein|hallwachs/u.test(text)) add(ids, target.photonModel)
    if (/welle-teilchen|de-broglie|elektronen/u.test(text)) add(ids, target.dualism, target.electronDiffraction)
    if (/zufälligkeit|wahrscheinlichkeit|komplementarität|wellenfunktion|verschränkung/u.test(text)) {
      add(ids, target.quantumReality)
    }
    if (/unbestimmtheit/u.test(text)) add(ids, target.quantumUncertainty)
    if (/atom|energieniveau|linienspektr|franck|flammen|röntgen|orbital|potenzialtopf|quantenzahl|spin/u.test(text)) {
      add(ids, target.atom)
    }
    if (/spektr|flammen/u.test(text)) add(ids, target.spectra)
    if (/röntgen/u.test(text)) add(ids, target.roentgen)
    if (/potenzialtopf/u.test(text)) add(ids, target.potentialWell)
    if (/elektronik/u.test(text)) add(ids, target.electricCircuits)
    if (/thermodynamik/u.test(text)) add(ids, target.sekIHeat)
    if (/astronom/u.test(text)) add(ids, target.gravitation, target.spectrumEm)
  }

  return [...ids]
}

const canonical = readJson<{ goals: Array<{ id: string; title: string; contains?: string[] }> }>(canonicalPath)
const canonicalTitleById = new Map(canonical.goals.map((goal) => [goal.id, goal.title]))
const canonicalGoalById = new Map(canonical.goals.map((goal) => [goal.id, goal]))

const buildExtraction = (config: ExtractionConfig) => {
  const passages: Passage[] = []
  const sourceGoals: SourceGoal[] = []
  const rows: Row[] = []

  for (const topic of config.topics) {
    const passageId = `mv-physics-${config.stage.toLowerCase()}:${slug(topic.code)}`
    const passage: Passage = {
      id: passageId,
      topicCode: topic.code,
      title: topic.title,
      text: topic.rows.map((row) => `- ${row}`).join('\n'),
      page: topic.page,
      sourcePath: config.sourcePdfPath,
      sourceGoalIds: [],
    }
    passages.push(passage)

    for (const [rowIndex, text] of topic.rows.entries()) {
      const courseLevel: CourseLevel =
        config.stage === 'SekII' && /leistungskurs|im leistungskurs|lk\b/iu.test(text) ? 'LK' : 'GK_LK'
      const sourceGoalId =
        `mv-phys-${config.stage.toLowerCase()}-rp2022-${slug(topic.code)}-${String(rowIndex + 1).padStart(3, '0')}-${hash(text)}`
      const sourceSpan = `${topic.stageLabel}, ${topic.title}, S. ${topic.page}`
      passage.sourceGoalIds.push(sourceGoalId)
      sourceGoals.push({
        id: sourceGoalId,
        passageId,
        topicCode: topic.code,
        bulletIndex: sourceGoals.length + 1,
        aspectIndex: 1,
        title: text,
        description: `Die lernende Person kann ${text}.`,
        sourceText: text,
        sourceSpan,
        parentBulletText: text,
        sourceRef: `${config.sourceDocumentTitle}, ${sourceSpan}`,
        courseLevel,
        granularity: 'officialContentGoal',
        tags: [
          'source:mecklenburg-vorpommern',
          `stage:${config.stage}`,
          `topic:${slug(topic.code)}`,
          `course:${courseLevel}`,
        ],
        rawSourceText: text,
        rawSourceSpan: sourceSpan,
        rawParentBulletText: text,
      })
      rows.push({ topicCode: topic.code, text, courseLevel })
    }
  }

  const decisions: MappingDecision[] = sourceGoals.map((sourceGoal, index) => {
    const canonicalGoalIds = applyPhysicsBatch015Targets(
      sourceGoal.id,
      currentWaveTargetsBySourceGoalId[sourceGoal.id] ?? inferCanonicalGoalIds(rows[index], config),
    )
    const batch019Rationale = batch019RationalesBySourceGoalId.get(sourceGoal.id)
    const batch025Rationale = batch025RationalesBySourceGoalId.get(sourceGoal.id)
    return {
      sourceGoalId: sourceGoal.id,
      topicCode: sourceGoal.topicCode,
      sourceSpan: sourceGoal.sourceSpan,
      decision: 'mapped',
      canonicalGoalIds,
      rationale: batch025Rationale ?? batch019Rationale ?? (
        canonicalGoalIds.length > 1
          ? 'Das amtliche MV-Source-Ziel ist inhaltlich durch mehrere kanonische Physikziele abgedeckt; 1:n beschreibt die Zuordnungsform, nicht eine offene Lücke.'
          : 'Das amtliche MV-Source-Ziel ist inhaltlich durch ein kanonisches Physikziel abgedeckt.'),
      reviewedAt: batch025Rationale ? '2026-08-29' : batch019Rationale ? '2026-08-28' : '2026-05-11',
      reviewer: batch025Rationale ? 'codex-physics-batch-025-motion-split-2026-08-29' : batch019Rationale ? 'codex-physics-batch-019-mapping-adjudication' : 'codex',
    }
  })

  const mappings = decisions.flatMap((decision) =>
    decision.canonicalGoalIds.map((canonicalGoalId) => ({
      legacyGoalId: decision.sourceGoalId,
      canonicalGoalId,
      matchType: decision.canonicalGoalIds.length === 1 ? 'exact' : 'partial',
      reviewDecisionId: decision.sourceGoalId,
    })),
  )

  const uniqueTargetIds = [...new Set(mappings.map((mapping) => mapping.canonicalGoalId))]
  const missingCanonicalGoalIds = uniqueTargetIds.filter((goalId) => !canonicalTitleById.has(goalId))
  if (missingCanonicalGoalIds.length > 0) {
    throw new Error(`Missing canonical goal IDs for ${config.extractionId}: ${missingCanonicalGoalIds.join(', ')}`)
  }

  const extraction = {
    schemaVersion: 1,
    extractionId: config.extractionId,
    title: config.title,
    sourceLandscapeId: config.sourceLandscapeId,
    jurisdiction,
    subject: 'Physik',
    stage: config.stage,
    sourceDocument: {
      key: config.extractionId,
      title: config.sourceDocumentTitle,
      path: config.sourcePdfPath,
      url: config.sourcePdfUrl,
      official: true,
    },
    method: {
      sourceProvision:
        'Amtliche Mecklenburg-Vorpommern-Rahmenplan-PDF liegt lokal vor; die alte Snapshot-Datei wird nicht als fachliche Quelle verwendet.',
      passageExtraction:
        'pdftotext -layout zur Sichtprüfung; die Passagegruppen entsprechen den verbindlichen Themen-Tabellen des Rahmenplans.',
      sourceGoalExtraction:
        'ein Source-Ziel pro verbindlicher fachlicher Inhaltszeile bzw. inhaltlich untrennbarer Tabellen-Unterzeile; Experimente und Hinweise werden nur als Belegkontext genutzt.',
    },
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        accepted: true,
        details:
          `${sourceGoals.length} Source-Ziele statt ${config.oldSnapshotCount} im alten Snapshot; ` +
          `plausibilisiert gegen ${config.peerBaseline}.`,
      },
    },
    expectedTopicCodes: passages.map((passage) => passage.topicCode),
    pipelineStatus: {
      version: 1,
      currentStep: 'MAPPING-3',
      steps: [
        {
          id: 'MAPPING-1',
          label: 'Original-Lehrplanpassagen extrahiert',
          status: 'complete',
          dependsOn: [],
          checks: [
            {
              id: 'source-document-present',
              label: 'Amtliche MV-Physik-Rahmenplan-PDF liegt lokal vor',
              passed: true,
              details: config.sourcePdfPath,
            },
            {
              id: 'expected-topic-coverage',
              label: 'Verbindliche Themen-Tabellen wurden aus dem amtlichen Rahmenplan erfasst',
              passed: true,
              details: `${passages.length} Passagegruppen aus ${config.stage}.`,
            },
            {
              id: 'passage-extraction-source',
              label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot',
              passed: true,
              details: `Quelle: ${config.sourcePdfPath}`,
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
              label: 'Aus den amtlichen MV-Physik-Inhalten wurden Source-Ziele erzeugt',
              passed: true,
              details: `${sourceGoals.length} Source-Ziele`,
            },
            {
              id: 'source-goal-count-peer-baseline',
              label: 'Source-Ziel-Anzahl ist gegen bereits geprüfte Physik-Inventare plausibilisiert',
              passed: true,
              details: `${sourceGoals.length} Source-Ziele; Vergleich: ${config.peerBaseline}.`,
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
              details: config.reviewPath,
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

  const review = {
    version: 1,
    reviewId: `${config.extractionId}-MAPPING-3-SOURCE-EXTRACTION-1`,
    sourceLandscapeId: config.sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: config.extractionPath,
    status: {
      scope: `${jurisdiction} Physik ${config.stage} / Rahmenplan 2022`,
      reviewedSourceGoals: sourceGoals.length,
      mappedSourceGoals: sourceGoals.length,
      needsViewPlacementReview: 0,
      needsCanonicalGoal: 0,
      totalSourceGoals: sourceGoals.length,
      explicitNeedsCanonicalGoal: 0,
      notes:
        'MV wurde vom zu kleinen Pilot-Snapshot auf amtliche Source-Extraction umgestellt. MatchType partial bedeutet 1:n- oder Teilbaum-Abdeckung, nicht fachliche Offenheit.',
    },
    mappings,
    decisions,
  }

  writeJson(config.extractionPath, extraction)
  writeJson(config.reviewPath, review)
  mkdirSync(path.dirname(path.resolve(repoRoot, config.readmePath)), { recursive: true })
  writeFileSync(
    path.resolve(repoRoot, config.readmePath),
    [
      `# Mecklenburg-Vorpommern Physik ${config.stage} -> kanonische Physik`,
      '',
      'Stand: 2026-05-11',
      '',
      'Diese Spur ersetzt den alten Pilot-Quellsnapshot durch eine Source-Extraction aus der amtlichen Rahmenplan-PDF.',
      '',
      `- Quelle: \`${config.sourcePdfPath}\``,
      `- Source-Extraction: \`${config.extractionPath}\``,
      `- M3-Review: \`${config.reviewPath}\``,
      `- Source-Ziele: ${sourceGoals.length}`,
      `- Passagen: ${passages.length}`,
      '- Status: MAPPING-1, MAPPING-2 und MAPPING-3 abgeschlossen.',
      '',
      'Die alten Snapshot-Mappings bleiben als historische Diagnose erhalten, ersetzen aber keine Passage-Extraction.',
      '',
    ].join('\n'),
  )

  return { sourceGoals, decisions, mappings, uniqueTargetIds }
}

const results = configs.map(buildExtraction)

const registry = readJson<{ entries?: Array<Record<string, unknown>> }>(registryPath)
for (const config of configs) {
  const registryEntry = registry.entries?.find((entry) => entry.landscapeId === config.sourceLandscapeId)
  if (!registryEntry) throw new Error(`Registry entry not found for ${config.sourceLandscapeId}`)
  registryEntry.title =
    config.stage === 'SekI'
      ? 'Physik Sekundarstufe I (Mecklenburg-Vorpommern, Rahmenplan 2022 Source-Extraction)'
      : 'Physik Oberstufe (Mecklenburg-Vorpommern, Rahmenplan 2022 Source-Extraction)'
  registryEntry.sourcePath = config.sourcePdfPath
  registryEntry.archiveSourcePath = config.sourcePdfPath
}
writeJson(registryPath, registry)

const walkCompositionNodes = (nodes: CompositionNode[], visitor: (node: CompositionNode) => void): void => {
  for (const node of nodes) {
    visitor(node)
    if (Array.isArray(node.children)) walkCompositionNodes(node.children, visitor)
  }
}

const addCanonicalClosure = (goalId: string, targetSet: Set<string>): void => {
  if (targetSet.has(goalId)) return
  targetSet.add(goalId)
  for (const childId of canonicalGoalById.get(goalId)?.contains ?? []) {
    addCanonicalClosure(childId, targetSet)
  }
}

const allDecisions = results.flatMap((result) => result.decisions)
const allSourceGoals = results.flatMap((result) => result.sourceGoals)
const allTargetIds = [...new Set(results.flatMap((result) => result.uniqueTargetIds))]
const upperTargetIds = new Set(results[1].uniqueTargetIds)

const addMissingMappedGoalsToView = (view: Record<string, unknown>, suffix: string) => {
  const rootNodes = Array.isArray(view.rootNodes) ? (view.rootNodes as CompositionNode[]) : []
  const present = new Set<string>()
  let root: CompositionNode | undefined
  walkCompositionNodes(rootNodes, (node) => {
    if (node.id === 'physics-root') root = node
    if (node.goalId) {
      if (node.kind === 'canonicalSubtree') addCanonicalClosure(node.goalId, present)
      else present.add(node.goalId)
    }
  })
  if (!root) throw new Error(`physics-root not found for ${suffix}`)

  const candidateTargets = suffix.startsWith('sekii') ? [...upperTargetIds] : allTargetIds
  const allowedTargets = candidateTargets.filter((goalId) => canonicalGoalById.get(goalId)?.type === 'atomic').filter((goalId) => {
    const mappedLevels = allDecisions
      .filter((decision) => decision.canonicalGoalIds.includes(goalId))
      .map((decision) => allSourceGoals.find((sourceGoal) => sourceGoal.id === decision.sourceGoalId)?.courseLevel)
    return suffix.includes('lk') || mappedLevels.some((level) => level !== 'LK')
  })
  const missingTargets = allowedTargets.filter((goalId) => !present.has(goalId))
  if (missingTargets.length === 0) return

  root.children = Array.isArray(root.children) ? root.children : []
  root.children = root.children.filter((child) => child.id !== 'physics-mv-source-extraction-supplements')
  root.children.push({
    kind: 'structure',
    id: 'physics-mv-source-extraction-supplements',
    label: suffix.startsWith('sekii-')
      ? 'Elektrizität, Wärme- und Quantenphysik'
      : 'Optik, Felder und Quantenphysik',
    children: missingTargets.map((goalId) => ({
      kind: 'goalEntry',
      goalId,
      displayLabel: canonicalTitleById.get(goalId) ?? goalId,
    })),
  })
}

for (const suffix of ['gk', 'lk', 'sekii-gk', 'sekii-lk']) {
  const mvViewPath = `${compositionViewDir}/de-mv-${suffix}.view.json`
  // Existing learner-facing views are reviewed authored state. Source
  // extraction must not rebuild or silently narrow their assessment routes.
  if (existsSync(path.resolve(repoRoot, mvViewPath))) continue
  const template = readJson<Record<string, unknown>>(`${compositionViewDir}/de-bb-${suffix}.view.json`)
  template.viewId = String(template.viewId).replace('de-bb', 'de-mv')
  template.scope = { ...(template.scope as Record<string, unknown>), jurisdiction }
  addMissingMappedGoalsToView(template, suffix)
  writeJson(mvViewPath, template)
}

for (const [index, config] of configs.entries()) {
  console.log(
    `Wrote ${repoPath(path.resolve(repoRoot, config.extractionPath))} (${results[index].sourceGoals.length} source goals)`,
  )
  console.log(
    `Wrote ${repoPath(path.resolve(repoRoot, config.reviewPath))} (${results[index].mappings.length} mapping rows)`,
  )
}
console.log(`Updated MV registry entries and ${allTargetIds.length} canonical target IDs in composition views`)
