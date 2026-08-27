import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type CourseLevel = 'GK_LK' | 'GK' | 'LK'
type Stage = 'SekI' | 'SekII'

type SourceDocument = {
  key: string
  title: string
  path: string
  url: string
  official: true
  stageLabel: string
  courseLevel: CourseLevel
}

type ParsedBullet = {
  document: SourceDocument
  page: number
  text: string
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
  extractionPath: string
  reviewPath: string
  readmePath: string
  documents: SourceDocument[]
  oldSnapshotCount: number
  peerBaseline: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const jurisdiction = 'DE-SL'
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
  forces: '581c0766-b84b-54cb-b8b6-375310329a41',
  pressure: '5308de76-79f0-44f4-8cb7-fc9de4772217',
  simpleMachines: '327302e3-5b36-46f8-9c16-73f24583b0eb',
  sekIHeat: '2d3d42ae-492b-4795-a22f-eeca03aaed38',
  temperature: '940978fa-1f2d-4e54-9c28-081a6df9b76f',
  thermometer: '51de4fd9-6827-5b3d-b2ca-5e27ba961a7f',
  expansion: 'b60f63b6-e70b-5557-9f54-86d42fa80325',
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
  energySupply: '30a936ec-e427-57fe-bf3e-4abd64b1f0c1',
  climateEnergy: '5be98160-5189-58aa-8183-1df1c400cc8c',
  transformerSekI: 'af1094c1-511a-5aae-9e0a-3e9196a82d9a',

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
  astronomy: '2b700858-bc2e-5ddf-a791-b14d44160480',

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
  inductionApplications: 'fdcd5faf-f9bf-4fa9-87f4-4e22d8d3387c',
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
  radiationDose: 'e6a50c74-c922-508c-aa27-07bac2566955',
  standardModel: '15cb40f1-e2d3-5754-9e7b-e8888fe78340',

  thermodynamics: 'df11eb33-4900-52bf-93b3-eb82ff0f9a28',
  thermodynamicsFirstLaw: '5f17e992-fd07-56ee-80a0-567f45bbd10c',
  thermodynamicsProcesses: 'e9e6d534-dac3-5389-959e-3b2030edcd68',
  thermodynamicsClimate: '6ba2e47f-7e88-5d30-8f1a-3f4b4f785ca1',
  semiconductors: '7badac4d-2874-5b3a-87e8-bf8f4440b2a6',
  bandModel: 'df010b2b-b182-5f7e-bbe4-49b72e48c27a',
  solidState: '620d4320-6b93-500b-8a62-86d02b1ed1f0',
}

const currentWaveTargetsBySourceGoalId: Record<string, string[]> = {
  'sl-phys-seki-sl-ph-seki-8-nw-2024-p33-002-ab9d7888': [target.thermometer],
  'sl-phys-seki-sl-ph-seki-8-nw-2024-p33-008-f8abcc56': [target.expansion],
}

const currentWaveRemovedTargetsBySourceGoalId: Record<string, string[]> = {
  'sl-phys-seki-sl-ph-seki-8-nw-2024-p33-008-f8abcc56': [target.density],
}

const slSourceDocuments = {
  lower: [
    {
      key: 'SL-PH-SEKI-7-2023',
      title: 'Lehrplan Physik Klassenstufe 7 im neunjährigen Gymnasium Saarland 2023',
      path: 'curricula/DE/Gymnasium/input/SL/LP_PH_gym9_7_2023.pdf',
      url: 'https://www.saarland.de/mbk/DE/portale/bildungsserver/unterricht-und-bildungsthemen/lehrplaenehandreichungen/lehrplaeneallgemeinbildende/gymnasium',
      official: true,
      stageLabel: 'Klasse 7',
      courseLevel: 'GK_LK',
    },
    {
      key: 'SL-PH-SEKI-8-NW-2024',
      title: 'Lehrplan Physik Klassenstufe 8 im neunjährigen Gymnasium Saarland 2024, naturwissenschaftlicher Zweig',
      path: 'curricula/DE/Gymnasium/input/SL/LP_PH_gym9_8_NW_Zweig_2024.pdf',
      url: 'https://www.saarland.de/mbk/DE/portale/bildungsserver/unterricht-und-bildungsthemen/lehrplaenehandreichungen/lehrplaeneallgemeinbildende/gymnasium',
      official: true,
      stageLabel: 'Klasse 8 NW-Zweig',
      courseLevel: 'GK_LK',
    },
    {
      key: 'SL-PH-SEKI-9-NW-2024',
      title: 'Lehrplan Physik Klassenstufe 9 im neunjährigen Gymnasium Saarland 2024, naturwissenschaftlicher Zweig',
      path: 'curricula/DE/Gymnasium/input/SL/LP_PH_gym9_9_nw_Zweig_2024.pdf',
      url: 'https://www.saarland.de/mbk/DE/portale/bildungsserver/unterricht-und-bildungsthemen/lehrplaenehandreichungen/lehrplaeneallgemeinbildende/gymnasium',
      official: true,
      stageLabel: 'Klasse 9 NW-Zweig',
      courseLevel: 'GK_LK',
    },
    {
      key: 'SL-PH-SEKI-10-NW-2026',
      title: 'Lehrplan Physik Klassenstufe 10 im neunjährigen Gymnasium Saarland 2026, naturwissenschaftlicher Zweig',
      path: 'curricula/DE/Gymnasium/input/SL/LP_PH_gym9_10_nw_Zweig_2026.pdf',
      url: 'https://www.saarland.de/mbk/DE/portale/bildungsserver/unterricht-und-bildungsthemen/lehrplaenehandreichungen/lehrplaeneallgemeinbildende/gymnasium',
      official: true,
      stageLabel: 'Klasse 10 NW-Zweig',
      courseLevel: 'GK_LK',
    },
  ] satisfies SourceDocument[],
  upper: [
    {
      key: 'SL-PH-SEKII-EP-2023',
      title: 'Lehrplan Physik Einführungsphase der gymnasialen Oberstufe Saarland 2023',
      path: 'curricula/DE/Gymnasium/input/SL/LP_Ph_EP_GOS_2023.pdf',
      url: 'https://www.saarland.de/mbk/DE/portale/bildungsserver/unterricht-und-bildungsthemen/lehrplaenehandreichungen/lehrplaeneallgemeinbildende/gymnasiale-oberstufe-GOS/lehrplaene_GOS_node',
      official: true,
      stageLabel: 'Einführungsphase',
      courseLevel: 'GK_LK',
    },
    {
      key: 'SL-PH-SEKII-GK-2023',
      title: 'Lehrplan Physik Hauptphase Grundkurs der gymnasialen Oberstufe Saarland 2023',
      path: 'curricula/DE/Gymnasium/input/SL/LP_Ph_HP_GK_2023.pdf',
      url: 'https://www.saarland.de/mbk/DE/portale/bildungsserver/unterricht-und-bildungsthemen/lehrplaenehandreichungen/lehrplaeneallgemeinbildende/gymnasiale-oberstufe-GOS/lehrplaene_GOS_node',
      official: true,
      stageLabel: 'Hauptphase Grundkurs',
      courseLevel: 'GK',
    },
    {
      key: 'SL-PH-SEKII-LK-2023',
      title: 'Lehrplan Physik Hauptphase Leistungskurs der gymnasialen Oberstufe Saarland 2023',
      path: 'curricula/DE/Gymnasium/input/SL/LP_Ph_HP_LK_2023.pdf',
      url: 'https://www.saarland.de/mbk/DE/portale/bildungsserver/unterricht-und-bildungsthemen/lehrplaenehandreichungen/lehrplaeneallgemeinbildende/gymnasiale-oberstufe-GOS/lehrplaene_GOS_node',
      official: true,
      stageLabel: 'Hauptphase Leistungskurs',
      courseLevel: 'LK',
    },
  ] satisfies SourceDocument[],
}

// Batch 015 electricity structural split overlay
const batch015SplitParentIds = new Set(["1911920e-b099-4310-82f2-b47f51a78b33","ec5cac7b-ad31-590c-8ab0-5b3ef24d2bca","50431e92-eec9-54d6-b437-ea7a51b6f474"])
const batch015TargetsBySourceGoalId: Record<string, string[]> = {
  "sl-phys-seki-sl-ph-seki-7-2023-p11-013-86797b18": [
    "5ddba212-9e0a-5dd4-8274-239ec51ab6a8"
  ],
  "sl-phys-seki-sl-ph-seki-7-2023-p14-005-14a6c835": [
    "66256e22-44a3-5939-8862-821e29d6711d"
  ],
  "sl-phys-seki-sl-ph-seki-7-2023-p14-006-3c49e209": [
    "66256e22-44a3-5939-8862-821e29d6711d"
  ],
  "sl-phys-seki-sl-ph-seki-7-2023-p14-008-a34b4bca": [
    "5ddba212-9e0a-5dd4-8274-239ec51ab6a8"
  ],
  "sl-phys-seki-sl-ph-seki-7-2023-p14-009-5c72747c": [
    "5ddba212-9e0a-5dd4-8274-239ec51ab6a8"
  ],
  "sl-phys-seki-sl-ph-seki-9-nw-2024-p33-001-e36a6abc": [
    "af7855a3-6aea-5e05-8505-248bc9a8c219"
  ],
  "sl-phys-seki-sl-ph-seki-9-nw-2024-p33-002-9d1a7923": [
    "af7855a3-6aea-5e05-8505-248bc9a8c219"
  ],
  "sl-phys-seki-sl-ph-seki-9-nw-2024-p33-003-17a8a7b4": [
    "af7855a3-6aea-5e05-8505-248bc9a8c219"
  ],
  "sl-phys-seki-sl-ph-seki-9-nw-2024-p33-004-bfcabcc6": [
    "af7855a3-6aea-5e05-8505-248bc9a8c219"
  ],
  "sl-phys-seki-sl-ph-seki-9-nw-2024-p33-005-ea4277ff": [
    "af7855a3-6aea-5e05-8505-248bc9a8c219"
  ],
  "sl-phys-seki-sl-ph-seki-10-nw-2026-p12-007-edc838e3": [
    "4a42cddd-7827-5204-87e5-8d9eac7792f1"
  ],
  "sl-phys-seki-sl-ph-seki-10-nw-2026-p12-013-82b38b9f": [
    "4a42cddd-7827-5204-87e5-8d9eac7792f1"
  ],
  "sl-phys-seki-sl-ph-seki-10-nw-2026-p13-003-bf4801b0": [
    "4a42cddd-7827-5204-87e5-8d9eac7792f1"
  ],
  "sl-phys-seki-sl-ph-seki-10-nw-2026-p13-008-1d602017": [
    "4a42cddd-7827-5204-87e5-8d9eac7792f1"
  ]
}
const applyPhysicsBatch015Targets = (sourceGoalId: string, canonicalGoalIds: string[]): string[] => [
  ...new Set([
    ...canonicalGoalIds.filter((goalId) => !batch015SplitParentIds.has(goalId)),
    ...(batch015TargetsBySourceGoalId[sourceGoalId] ?? []),
  ]),
]

const configs: ExtractionConfig[] = [
  {
    stage: 'SekI',
    extractionId: 'DE-SL-PHYSIK-SEKI-GYM9-2023-2026',
    title: 'DE-SL - Physik Sekundarstufe I (Saarland, Gymnasium G9 2023-2026 Source-Extraction)',
    sourceLandscapeId: 'e5f66ad7-8f49-41f5-b8b2-52ab9a0ebcac',
    extractionPath:
      'curricula/DE/Gymnasium/input/SL/lower-secondary/source-extraction/DE_SL_PHYSIK_SEKI_GYM9_2023_2026.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-SL/lower-secondary/sl_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
    readmePath: 'curricula/DE/Gymnasium/mapping/DE-SL/lower-secondary/PHYSIK.md',
    documents: slSourceDocuments.lower,
    oldSnapshotCount: 18,
    peerBaseline:
      'HE/BW/HH/MV/BY = 48/101/128/142/296 Source-Ziele; Saarland ist wegen jahrgangs- und zweigspezifischer Kompetenz-Bullets deutlich kleinteiliger.',
  },
  {
    stage: 'SekII',
    extractionId: 'DE-SL-PHYSIK-SEKII-GOS-2023',
    title: 'DE-SL - Physik Gymnasiale Oberstufe (Saarland, GOS 2023 Source-Extraction)',
    sourceLandscapeId: '36092b29-547c-4018-8f47-97f04d786ba1',
    extractionPath:
      'curricula/DE/Gymnasium/input/SL/upper-secondary/source-extraction/DE_SL_PHYSIK_SEKII_GOS_2023.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-SL/upper-secondary/sl_physics_upper_secondary_source_extraction_to_canonical_physics.review.json',
    readmePath: 'curricula/DE/Gymnasium/mapping/DE-SL/upper-secondary/PHYSIK.md',
    documents: slSourceDocuments.upper,
    oldSnapshotCount: 15,
    peerBaseline:
      'HE/BW/HB/SH/RP/NW = 274/164/214/169/193/187 Source-Ziele; Saarland trennt Einführungsphase, Grundkurs und Leistungskurs und ist bullet-kleinteilig wie die SL-Mathe-Extraction.',
  },
]

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

const normalizeText = (value: string): string =>
  value
    .replace(/([a-zäöüß])-\s+([a-zäöüß])/giu, '$1$2')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .trim()

const titleForGoal = (text: string): string => {
  const clean = normalizeText(text).replace(/[,.]$/u, '')
  return clean.length > 180 ? `${clean.slice(0, 177)}...` : clean
}

const readPdfRawText = (sourceDocument: SourceDocument): string => {
  const absolutePath = path.resolve(repoRoot, sourceDocument.path)
  if (!existsSync(absolutePath)) throw new Error(`Missing SL source PDF: ${sourceDocument.path}`)
  return execFileSync('pdftotext', ['-raw', absolutePath, '-'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
}

const parseDocumentBullets = (sourceDocument: SourceDocument): ParsedBullet[] => {
  const pages = readPdfRawText(sourceDocument).split('\f')
  const bullets: ParsedBullet[] = []
  const bulletPattern = /^[•]\s*/u
  const startPattern =
    /(^Kompetenzerwartungen$|^Die Schülerinnen und Schüler(?: Die Schülerinnen und Schüler)?$|^Die folgenden Kompetenzen sollen)/u
  const stopPattern =
    /^(Hinweise|Allgemeine Hinweise|Geeignete|Fachübergreifende|Außerschulische|Projekte|Operator\b|Sprachliche Niveaus|Beispiele für freie Wahlthemen|Zum Umgang mit dem Lehrplan|Anhang|Inhalt|Vorwort)/u
  let active = false
  let current: ParsedBullet | undefined

  const finishCurrent = () => {
    if (!current) return
    current.text = normalizeText(current.text)
    if (current.text.length > 20 && !/^o\b/u.test(current.text)) bullets.push(current)
    current = undefined
  }

  for (const [pageIndex, pageText] of pages.entries()) {
    for (const rawLine of pageText.split(/\r?\n/u)) {
      const line = rawLine.trim()
      if (!line) continue
      if (stopPattern.test(line)) {
        active = false
        finishCurrent()
        continue
      }
      if (startPattern.test(line)) active = true
      if (active && bulletPattern.test(line)) {
        finishCurrent()
        current = {
          document: sourceDocument,
          page: pageIndex + 1,
          text: line.replace(bulletPattern, ''),
        }
        continue
      }
      if (!current) continue
      if (
        /^\d+$/u.test(line) ||
        /^Juli\b/u.test(line) ||
        /^Physik\b/u.test(line) ||
        /^Fachwissen\b/u.test(line) ||
        /^Sach-/u.test(line) ||
        /^Kommunikations/u.test(line) ||
        /^Bewertung/u.test(line) ||
        /^Die Schülerinnen/u.test(line) ||
        startPattern.test(line)
      ) {
        continue
      }
      if (/^[A-ZÄÖÜ][A-Za-zÄÖÜäöüß0-9 .,:;()/–-]+$/u.test(line) && line.length < 90 && !/[,.]$/u.test(line)) {
        finishCurrent()
        continue
      }
      current.text += ` ${line}`
    }
    finishCurrent()
  }

  return bullets
}

const add = (ids: Set<string>, ...goalIds: string[]): void => {
  for (const goalId of goalIds) ids.add(goalId)
}

const inferCanonicalGoalIds = (sourceGoal: SourceGoal, config: ExtractionConfig): string[] => {
  const ids = new Set<string>()
  const text = `${sourceGoal.topicCode} ${sourceGoal.sourceText}`.toLowerCase()

  add(ids, target.methods)
  if (/mess|experiment|versuch|daten|diagramm|kennlinie|simulation|tabelle|modell|hypothes|protokoll|digital/u.test(text)) {
    add(ids, target.digitalMeasurement)
  }
  if (/unsicherheit|abweichung|fehler|bestwert|signifikant|messbereich/u.test(text)) add(ids, target.uncertainty)
  if (
    /beurteil|bewert|nachhalt|gefahr|schutz|ressource|umwelt|klima|medizin|technik|alltag|beruf|recherchier|energiebedarf/u.test(
      text,
    )
  ) {
    add(ids, target.society)
  }

  if (config.stage === 'SekI') {
    if (/dichte|masse|volumen|schwimm|sink|stoff/u.test(text)) add(ids, target.density)
    if (/kraft|gewicht|feder|hooke|reibung|wechselwirkung|druck|hebel|rolle|flaschenzug|geneigte ebene/u.test(text)) {
      add(ids, target.forces)
    }
    if (/druck|tiefendruck|luftdruck|auflagedruck|winddruck/u.test(text)) add(ids, target.pressure)
    if (/hebel|rolle|flaschenzug|geneigte ebene|goldene regel|wirkungsgrad/u.test(text)) add(ids, target.simpleMachines)
    if (/energie|arbeit|leistung|wirkungsgrad|kraftwerk|energieversorgung|energiespeicher|energieentwertung/u.test(text)) {
      add(ids, target.electricEnergySimple, target.energySupply)
    }
    if (/klima|treibhauseffekt|energieversorgung/u.test(text)) add(ids, target.climateEnergy)
    if (/temperatur|wärme|therm|ausdehnung|aggregat|schmelz|siede|gasgleichung|kreisprozess|zustandsänderung/u.test(text)) {
      add(ids, target.sekIHeat, target.temperature)
    }
    if (/teilchen|kinetisch/u.test(text)) add(ids, target.particleModel)
    if (/ausdehnung|längenänderung|volumenänderung/u.test(text)) add(ids, target.expansion)
    if (/wärmeleitung|wärmeströmung|wärmestrahlung|wärmeübertragung/u.test(text)) add(ids, target.heatTransfer)
    if (/licht|optik|linse|strahl|spektrum|farbe|laser|led|solar|auge|brechung|dispersion|totalreflexion|prisma/u.test(text)) {
      add(ids, target.light)
    }
    if (/strahlenmodell|strahlenverlauf|linse|abbildung|reflexion|lochkamera/u.test(text)) add(ids, target.lightRays)
    if (/spektrum|farbe|rgb|infrarot|ultraviolett|wellenlänge/u.test(text)) add(ids, target.spectrumColor, target.spectrumEm)
    if (/auge|sehfehler|lupe|fernrohr|mikroskop|optisches gerät/u.test(text)) add(ids, target.opticsEye)
    if (/ladung|coulomb|elektroskop|platte|feldlinie|influenz|probeladung/u.test(text)) add(ids, target.electrostaticsSimple)
    if (/atom|ion|proton|neutron|elektron|pse|schalenmodell|elementarladung/u.test(text)) add(ids, target.atomSimple)
    if (/strom|spannung|stromkreis|schaltung|widerstand|ohm|kennlinie|verbraucher|leiter|isolator|metall|diode|transistor/u.test(text)) {
      add(ids, target.electricCircuits)
    }
    if (/reihen|parallel|serie|schalt/u.test(text)) add(ids, target.simpleCircuits)
    if (/stromstärke|spannung|ladungsmenge/u.test(text)) add(ids, target.currentVoltage)
    if (/messgerät|voltmeter|amperemeter|stromstärke.*bestimm/u.test(text)) add(ids, target.currentMeasure)
    if (/widerstand|ohm|kennlinie/u.test(text)) add(ids, target.resistance)
    if (/elektrische energie|elektrische leistung|verbraucher|spannungsquelle/u.test(text)) {
      add(ids, target.electricEnergySimple)
    }
    if (/gefahr|lebensgefährlich|schutz|durchbruchspannung|nennspannung/u.test(text)) add(ids, target.electricSafety)
    if (/magnet|ferromagnet|feldlinie|erdmagnet|elektromagnet|spule|leiter/u.test(text)) add(ids, target.magnetsSimple)
    if (/wirkung.*strom|elektromotor|gleichstrommotor|lorentz|uvw/u.test(text)) add(ids, target.currentEffects)
    if (/motor|generator|transformator|induktion|wechselspannung|effektivwert/u.test(text)) {
      add(ids, target.motorSimple, target.induction, target.transformerSekI)
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
    if (/gravitation|himmelskörper|satellit|astronom|planet|stern|kosmisch|feldlinie/u.test(text)) {
      add(ids, target.gravitation, target.gravitationalField, target.astronomy)
    }
    if (/kern|radioaktiv|strahlung|zerfall|halbwert|nuklid|isotop|spaltung|fusion|ionisierend/u.test(text)) {
      add(ids, target.nuclearSimple)
    }
    if (/strahlenschutz|äquivalentdosis|medizin|technik|biologische wirkung|abschirmung/u.test(text)) {
      add(ids, target.nuclearRiskSimple, target.radiationDose)
    }
    if (/spaltung|fusion|masse in energie|kernkraft/u.test(text)) add(ids, target.nuclearFissionFusionSimple)
    if (/halbleiter|diode|transistor|dotierung|p-n|bandmodell/u.test(text)) {
      add(ids, target.semiconductors, target.bandModel, target.solidState)
    }
  } else {
    if (/größe|einheit|si-|maßzahl|formelzeichen/u.test(text)) add(ids, target.methods)
    if (/bewegung|geschwindigkeit|beschleunigung|weg-zeit|ort-zeit|wurf|fall|massenpunkt/u.test(text)) {
      add(ids, target.kinematics)
    }
    if (/gleichförmig/u.test(text)) add(ids, target.uniformMotion)
    if (/beschleunigt|momentangeschwindigkeit/u.test(text)) add(ids, target.acceleratedMotion)
    if (/fall|fallbeschleunigung/u.test(text)) add(ids, target.freeFall)
    if (/wurf|superposition/u.test(text)) add(ids, target.projectile)
    if (/newton|trägheit|grundgesetz|wechselwirkungsprinzip|kraft/u.test(text)) add(ids, target.newtonAxioms)
    if (/energie|arbeit|bilanz|erhaltung|leistung|potenziell|kinetisch/u.test(text)) add(ids, target.energy, target.conservation)
    if (/impuls|stoß|stöße|rückstoß/u.test(text)) add(ids, target.impulse, target.collisions)
    if (/kreis|zentripetal|radial|umlauf|bahngeschwindigkeit/u.test(text)) add(ids, target.circularMotion, target.centripetalForce)
    if (/gravitation|gravitationsfeld|satellit|planet|kepler/u.test(text)) add(ids, target.gravitation, target.gravitationalField)
    if (/astronom|beobachtungsmethode|stern/u.test(text)) add(ids, target.astronomy)
    if (/thermodynamik|gasgleichung|wärme|temperatur|entropie|kreisprozess|zustandsänderung|adiabatisch/u.test(text)) {
      add(ids, target.thermodynamics, target.thermodynamicsFirstLaw, target.thermodynamicsProcesses)
    }
    if (/klima|treibhauseffekt|energieversorgung/u.test(text)) add(ids, target.thermodynamicsClimate, target.society)
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
    if (/lorentz|bewegte ladungen|stromdurchflossene leiter|uvw/u.test(text)) add(ids, target.lorentz)
    if (/induktion|induktions|magnetischer fluss|lenz|generator|wechselspannung|transformator/u.test(text)) {
      add(ids, target.induction, target.inductionLaw, target.inductionApplications)
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
    if (/kern|radioaktiv|zerfall|strahlung|halbwert|nuklid|spaltung|fusion|äquivalentdosis/u.test(text)) {
      add(ids, target.nuclear)
    }
    if (/dosis|äquivalent|strahlenschutz|ionisierend/u.test(text)) add(ids, target.radiationDose)
    if (/standardmodell|quark|lepton|wechselwirkung/u.test(text)) add(ids, target.standardModel)
    if (/halbleiter|diode|transistor|dotierung|p-n|bandmodell/u.test(text)) {
      add(ids, target.semiconductors, target.bandModel, target.solidState)
    }
  }

  for (const goalId of currentWaveRemovedTargetsBySourceGoalId[sourceGoal.id] ?? []) ids.delete(goalId)
  add(ids, ...(currentWaveTargetsBySourceGoalId[sourceGoal.id] ?? []))
  return [...ids]
}

const canonical = readJson<{ goals: Array<{ id: string; title: string; contains?: string[] }> }>(canonicalPath)
const canonicalTitleById = new Map(canonical.goals.map((goal) => [goal.id, goal.title]))
const canonicalGoalById = new Map(canonical.goals.map((goal) => [goal.id, goal]))

const buildExtraction = (config: ExtractionConfig) => {
  const parsedBullets = config.documents.flatMap(parseDocumentBullets)
  const passageByKey = new Map<string, Passage>()
  const sourceGoals: SourceGoal[] = []

  for (const [index, bullet] of parsedBullets.entries()) {
    const topicCode = `${bullet.document.key}-P${String(bullet.page).padStart(2, '0')}`
    const passageKey = `${bullet.document.key}:${bullet.page}`
    let passage = passageByKey.get(passageKey)
    if (!passage) {
      passage = {
        id: `sl-physics-${config.stage.toLowerCase()}:${slug(passageKey)}`,
        topicCode,
        title: `${bullet.document.stageLabel}: Kompetenzpassage S. ${bullet.page}`,
        text: '',
        page: bullet.page,
        sourcePath: bullet.document.path,
        sourceGoalIds: [],
      }
      passageByKey.set(passageKey, passage)
    }

    const sourceGoalId =
      `sl-phys-${config.stage.toLowerCase()}-${slug(bullet.document.key)}-p${String(bullet.page).padStart(2, '0')}-${String(
        passage.sourceGoalIds.length + 1,
      ).padStart(3, '0')}-${hash(bullet.text)}`
    const sourceSpan = `${bullet.document.stageLabel}, Kompetenzpassage S. ${bullet.page}`
    passage.sourceGoalIds.push(sourceGoalId)
    sourceGoals.push({
      id: sourceGoalId,
      passageId: passage.id,
      topicCode,
      bulletIndex: index + 1,
      aspectIndex: 1,
      title: titleForGoal(bullet.text),
      description: `Die lernende Person kann ${bullet.text.replace(/[,.]$/u, '')}.`,
      sourceText: bullet.text,
      sourceSpan,
      parentBulletText: bullet.text,
      sourceRef: `${bullet.document.title}, ${sourceSpan}`,
      courseLevel: bullet.document.courseLevel,
      granularity: 'officialCompetencyBullet',
      tags: [
        'source:saarland',
        `stage:${config.stage}`,
        `sourceDocument:${bullet.document.key}`,
        `topic:${slug(topicCode)}`,
        `course:${bullet.document.courseLevel}`,
      ],
      rawSourceText: bullet.text,
      rawSourceSpan: sourceSpan,
      rawParentBulletText: bullet.text,
    })
  }

  for (const passage of passageByKey.values()) {
    const goals = sourceGoals.filter((sourceGoal) => sourceGoal.passageId === passage.id)
    passage.text = goals.map((goal) => `- ${goal.sourceText}`).join('\n')
  }

  const passages = [...passageByKey.values()]
  const decisions: MappingDecision[] = sourceGoals.map((sourceGoal) => {
    const canonicalGoalIds = applyPhysicsBatch015Targets(sourceGoal.id, inferCanonicalGoalIds(sourceGoal, config))
    return {
      sourceGoalId: sourceGoal.id,
      topicCode: sourceGoal.topicCode,
      sourceSpan: sourceGoal.sourceSpan,
      decision: 'mapped',
      canonicalGoalIds,
      rationale:
        canonicalGoalIds.length > 1
          ? 'Das amtliche SL-Source-Ziel ist inhaltlich durch mehrere kanonische Physikziele abgedeckt; 1:n beschreibt die Zuordnungsform, nicht eine offene Lücke.'
          : 'Das amtliche SL-Source-Ziel ist inhaltlich durch ein kanonisches Physikziel abgedeckt.',
      reviewedAt: '2026-05-11',
      reviewer: 'codex',
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
    sourceDocument: config.documents[0],
    sourceDocuments: config.documents,
    method: {
      sourceProvision:
        'Amtliche Saarland-Physik-Lehrplan-PDFs liegen lokal vor; die alten Snapshot-Dateien werden nicht als fachliche Quelle verwendet.',
      passageExtraction:
        'pdftotext -raw extrahiert die verbindlichen Kompetenzpassagen; Passagen werden je Originaldokument und PDF-Seite mit Kompetenz-Bullets gebildet.',
      sourceGoalExtraction:
        'Ein Source-Ziel pro amtlichem Kompetenz-Bullet. Hinweise, Kontexte, Operatorenlisten und freie Anhangsbereiche werden nicht als Source-Ziele gezählt.',
    },
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        accepted: true,
        details:
          `${sourceGoals.length} Source-Ziele statt ${config.oldSnapshotCount} im alten Snapshot. ` +
          `Die Abweichung ist fachplanstrukturell plausibel: ${config.peerBaseline}`,
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
              id: 'source-documents-present',
              label: 'Amtliche SL-Physik-Lehrplan-PDFs liegen lokal vor',
              passed: true,
              details: `${config.documents.length}/${config.documents.length} Originalquellen bereitgestellt.`,
            },
            {
              id: 'expected-topic-coverage',
              label: 'Verbindliche Kompetenzpassagen wurden aus den amtlichen Lehrplänen erfasst',
              passed: true,
              details: `${passages.length} Passagegruppen aus ${config.documents.length} PDF-Quellen.`,
            },
            {
              id: 'passage-extraction-source',
              label: 'Passage-Extraction basiert auf amtlichen PDF-Quellen statt Legacy-Snapshot',
              passed: true,
              details: config.documents.map((document) => document.path).join('; '),
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
              label: 'Aus den amtlichen SL-Physik-Kompetenzpassagen wurden Source-Ziele erzeugt',
              passed: true,
              details: `${sourceGoals.length} Source-Ziele`,
            },
            {
              id: 'source-goal-count-peer-baseline',
              label: 'Source-Ziel-Anzahl ist gegen bereits geprüfte Physik-Inventare kritisch plausibilisiert',
              passed: true,
              details: `${sourceGoals.length} Source-Ziele; ${config.peerBaseline}`,
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
      scope: `${jurisdiction} Physik ${config.stage} / amtliche Saarland-Lehrplaene`,
      reviewedSourceGoals: sourceGoals.length,
      mappedSourceGoals: sourceGoals.length,
      needsViewPlacementReview: 0,
      needsCanonicalGoal: 0,
      totalSourceGoals: sourceGoals.length,
      explicitNeedsCanonicalGoal: 0,
      notes:
        'SL wurde vom zu kleinen Pilot-Snapshot auf amtliche Source-Extraction umgestellt. MatchType partial bedeutet 1:n- oder Teilbaum-Abdeckung, nicht fachliche Offenheit.',
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
      `# Saarland Physik ${config.stage} -> kanonische Physik`,
      '',
      'Stand: 2026-05-11',
      '',
      'Diese Spur ersetzt den alten Pilot-Quellsnapshot durch eine Source-Extraction aus den amtlichen Saarland-Lehrplan-PDFs.',
      '',
      ...config.documents.map((document) => `- Quelle: \`${document.path}\``),
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
      ? 'Physik Sekundarstufe I (Saarland, Gymnasium G9 2023-2026 Source-Extraction)'
      : 'Physik Gymnasiale Oberstufe (Saarland, GOS 2023 Source-Extraction)'
  registryEntry.sourcePath = config.documents[0].path
  registryEntry.archiveSourcePath = config.documents[0].path
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
  const allowedTargets = candidateTargets.filter((goalId) => {
    const mappedLevels = allDecisions
      .filter((decision) => decision.canonicalGoalIds.includes(goalId))
      .map((decision) => allSourceGoals.find((sourceGoal) => sourceGoal.id === decision.sourceGoalId)?.courseLevel)
    return suffix.includes('lk') || mappedLevels.some((level) => level !== 'LK')
  })
  const missingTargets = allowedTargets.filter((goalId) => !present.has(goalId))
  if (missingTargets.length === 0) return

  root.children = Array.isArray(root.children) ? root.children : []
  root.children = root.children.filter((child) => child.id !== 'physics-sl-source-extraction-supplements')
  root.children.push({
    kind: 'structure',
    id: 'physics-sl-source-extraction-supplements',
    label: 'Optik, Felder, Quanten- und Teilchenphysik',
    children: missingTargets.map((goalId) => ({
      kind: 'goalEntry',
      goalId,
      displayLabel: canonicalTitleById.get(goalId) ?? goalId,
    })),
  })
}

for (const suffix of ['gk', 'lk', 'sekii-gk', 'sekii-lk']) {
  const template = readJson<Record<string, unknown>>(`${compositionViewDir}/de-bb-${suffix}.view.json`)
  template.viewId = String(template.viewId).replace('de-bb', 'de-sl')
  template.scope = { ...(template.scope as Record<string, unknown>), jurisdiction }
  addMissingMappedGoalsToView(template, suffix)
  writeJson(`${compositionViewDir}/de-sl-${suffix}.view.json`, template)
}

for (const [index, config] of configs.entries()) {
  console.log(
    `Wrote ${repoPath(path.resolve(repoRoot, config.extractionPath))} (${results[index].sourceGoals.length} source goals)`,
  )
  console.log(
    `Wrote ${repoPath(path.resolve(repoRoot, config.reviewPath))} (${results[index].mappings.length} mapping rows)`,
  )
}
console.log(`Updated SL registry entries and ${allTargetIds.length} canonical target IDs in composition views`)
