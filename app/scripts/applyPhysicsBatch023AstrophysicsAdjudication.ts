import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, relative, resolve, sep } from 'node:path'
import * as ts from 'typescript'

// The bounded curriculum ledgers predate a shared TypeScript schema and are
// checked field by field below.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonRecord = Record<string, any>
type PlannedFile = { path: string; bytes: string; appendOnly?: boolean }

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
const allowedArguments = new Set(['--write', '--check'])
const unexpectedArguments = process.argv.slice(2).filter((argument) => !allowedArguments.has(argument))
if (unexpectedArguments.length > 0) throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)
if (writeMode && checkMode) throw new Error('Use either --write or --check, not both')

const reviewedAt = '2026-08-28'
const reviewer = 'codex-physics-batch-023-astrophysics-adjudication-2026-08-28'
const physicsLandscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const bySourceLandscapeId = '42c2f7e3-91b4-5de8-bef0-d563440e9d52'
const expectedAdjudicationSha256 = '3f3cd8733b0bde60686b6f7b92f8538845631c752deb1c5fda285966ba81692e'
const expectedFollowUpConfigSha256 = '4da9c99d96a3feeb7f530610f7e82f6efb750cb21d0a246ddc7acb3e0e4682ee'

// This digest is bound only after independent review of the complete read-only
// plan. --write remains impossible while the value is PENDING.
const expectedBoundedPlanSha256 = '069b3f887d62626df9a4d3ba1a5676ae5ae84909d446b7dbbc00aefe41f74fbd'

const ids = {
  astronomicalUnit: '5cf160e5-e0c2-5552-b2cf-0f04871c5e7e',
  radiationEquilibrium: 'a5031dfc-6d25-5a04-850a-5c7d8a254c21',
  binaryGwMass: '4ea39b40-1563-58ab-8d54-5fc20efa5365',
  nightSkyNavigation: 'd024aa45-5dbb-51f7-87a6-9ba939858696',
  objectClassification: 'e06dd9c7-8c36-5ca4-880b-57b02d837085',
  spatiotemporalVisibility: '0b8a4215-e6ed-56c8-88c3-b3a2a99723c7',
  solarRadius: 'bebc3738-0be6-52cf-83db-f8b948f7cf7b',
  solarMass: '5e9cd796-3887-5457-8a1f-26863ca7eb28',
  solarLuminosity: '9851bd02-ca48-5ce4-8e9f-9ec4af1c43b8',
  solarRotation: '23335a89-f8e6-5c22-8705-d71193aeac96',
  planetaryConfigurations: '6e1cd027-040b-51d9-8764-3cf3daddb5ec',
  planetaryLoops: '44766569-6379-5fbc-8976-cd3fc2fd6ec4',
  galaxyDistanceMethods: '206a7d3d-9b11-56be-89ff-73898445c4f5',
  hubbleAge: '44f0eefa-2d93-5954-879f-f6c49e5cebc7',
  orbitalMass: 'f3dbcafa-1849-5ee1-8807-81e8d7fed73d',
  darkMatterCurves: 'c53b3f0c-b4fe-5509-8803-a36c2883e5d6',
  opticalDynamicalMass: '2014791b-af68-58d0-838b-fc9701202096',
  gwChirpMass: '1b7e800a-1c0d-5faa-886b-7ef2f3b8348c',
  gwGeneration: '09995ab9-86aa-5b02-8a58-62b16a37831d',
  twoBodyFoundation: '497f1311-17d6-56ff-afb1-422a738e5c16',
  waveFoundation: 'ba16948b-5e07-54af-b77b-776e677c6906',
  binaryGwCluster: '7c8f1e34-d81a-51a2-8aa0-a6ee8e1b03a4',
  byBinaryGwSource: '09a09524-4d0c-5f3f-b39e-3e669970a6a3',
} as const

const keepIds = [
  ids.radiationEquilibrium,
  ids.nightSkyNavigation,
  ids.objectClassification,
  ids.spatiotemporalVisibility,
  ids.solarMass,
  ids.solarLuminosity,
  ids.planetaryConfigurations,
  ids.planetaryLoops,
  ids.galaxyDistanceMethods,
  ids.hubbleAge,
  ids.darkMatterCurves,
] as const
const revisedIds = [
  ids.astronomicalUnit,
  ids.solarRadius,
  ids.solarRotation,
  ids.orbitalMass,
] as const
const childIds = [ids.opticalDynamicalMass, ids.gwChirpMass] as const
const requiredFollowUpGoalIds = [...revisedIds, ...childIds] as const
const exactByTargetGoalIds = [
  ids.opticalDynamicalMass,
  ids.gwChirpMass,
  ids.gwGeneration,
  ids.waveFoundation,
  ids.twoBodyFoundation,
] as const

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl',
  byGenerator: 'app/scripts/generateByPhysicsSourceExtraction.ts',
  byStructuredSource: 'curricula/DE/Gymnasium/input/BY/gymnasium/Physik.json',
  byLegacyMapping:
    'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_physics_to_canonical_physics.json',
  bySourceExtraction:
    'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/'
    + 'DE_BY_PHYSIK_GYMNASIUM_LEHRPLANPLUS.source-extraction.json',
  byMapping:
    'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/'
    + 'bavaria_physics_source_extraction_to_canonical_physics.review.json',
  hhGenerator: 'app/scripts/generateHhPhysicsSourceExtraction.ts',
  hhSourceExtraction:
    'curricula/DE/Gymnasium/input/HH/upper-secondary/source-extraction/'
    + 'DE_HH_PHYSIK_SEKII_BILDUNGSPLAN_2022.source-extraction.json',
  hhMapping:
    'curricula/DE/Gymnasium/mapping/DE-HH/upper-secondary/'
    + 'hh_physics_upper_secondary_source_extraction_to_canonical_physics.review.json',
  provenance: 'curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json',
  surrogateProvenance:
    'curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json',
  sourceGoalClosure: 'curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json',
  sourceGoalMembership: 'curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json',
  visualizationReview: 'curricula/DE/Gymnasium/quality/goal-visualization-review/physik-batch-083.md',
  visualizationArchiveFollowUp: 'app/scripts/archivePhysicsB023AstronomicalUnitVisualization.ts',
  physicsInputTest: 'app/scripts/testPhysicsGoalBookInputs.ts',
  physicsSourceManifest: 'app/scripts/config/goal-books/de-gym-physics-national-atlas.sources.json',
  adjudication:
    'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-28/'
    + 'batch-023-astrophysics-structural-follow-up-16-v1/third-adjudication/adjudication.json',
  followUpConfig:
    'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-28/'
    + 'batch-024-astrophysics-final-current-6-v1.config.json',
  compositionRoot: 'curricula/DE/Gymnasium/composition-views/physik',
  canonicalVisualizationRoot: 'curricula/DE/Gymnasium/visualizations/physik',
  publicVisualizationRoot: 'app/public/assets/goal-visualizations/physik',
} as const

const compositionViewPaths = [
  `${paths.compositionRoot}/de-by-gk.view.json`,
  `${paths.compositionRoot}/de-by-lk.view.json`,
  `${paths.compositionRoot}/de-by-sekii-gk.view.json`,
  `${paths.compositionRoot}/de-by-sekii-lk.view.json`,
] as const

const expectedBeforeHashes: Record<string, string> = {
  [paths.canonical]: '48820560030f203c106c5db2006771604e097a3d3b90188728bc1bb199424e4a',
  [paths.semanticKinds]: '5763011fd8df360fdaf7a94839720bb825612a40042e45ee862324d53ea8a86c',
  [paths.atomicity]: 'dfed601c05daedb040abe703b6ffe8ddf662b71ed4d332b9463d142f9ad75425',
  [paths.memory]: 'a455260e24a683767768facb7354140d6221921ff42c9f0eb44c11e718ff20f9',
  [paths.byGenerator]: '8c61a88801219f0995af2cd2c1ac520c554832d32cd44031e2ca460b10a4f2b1',
  [paths.byMapping]: '34b4d40e3567e7fb41918c14f359bb014e865da35da142a311343d26e80ae2aa',
  [paths.provenance]: '3a977244372ae01ff3f6b0f1af090dbe96eeda0df14f0e1013732690bd6ff560',
  [paths.visualizationQa]: '72477cba37e2a42af4e30470ac7d448660cc3c3c14b045c72c0b47e4c7db3478',
  [paths.physicsInputTest]: 'e43b731667e1e7a46af65ef06e0728ded7161c861ec0ba87f7b2e3c899c0a3e9',
  [paths.physicsSourceManifest]: '148bdc26907d5c19c06227c0a1997c8ddc8a465b8942a2765aabd21c619b4a19',
}

// Filled from the independently reviewed no-write output list before binding
// expectedBoundedPlanSha256. PENDING values cannot classify an after-state.
const expectedAfterHashes: Record<string, string> = {
  [paths.canonical]: '1cd096e078a8878da47e4a432aa078c770119349312788d6f1bb31761aea6c4c',
  [paths.semanticKinds]: '2de25f00336068060d0389605e821a3c4fecd5e54500dcf1fcf766a60675b06a',
  [paths.atomicity]: '570c31c1805c69c191dcbf89cef7cb510dd37ea498da1e4b029c3a3f26b7fb47',
  [paths.memory]: 'f59229ecf5f11756efa5b0efe23add1b5523c5f60d6b9185f8f5c1e69fd36385',
  [paths.byGenerator]: 'ff8833be7c75c9e0fca2cf553e356f261c66f1116ce662860082d8a24aee55be',
  [paths.byMapping]: '0e75231da9a4b18e45eed048a6a9feffd903fde92e32d8d948b2d3d0c5d9424d',
  [paths.provenance]: 'd24356366e3935a5680c45da890189209e93e810acc67d7dd8e70d36128fb500',
  [paths.visualizationQa]: '55141b784614ba36f309317cd16b7a68a681ca95bbb41b5b6ab363723ddd1c40',
  [paths.visualizationReview]: '29bd07f0751577755714dc0136ff1263f1f2e5e92b1fbbfe0ea23a7db0660382',
  [paths.physicsInputTest]: '5edbffe620b4dc48dfa14b780435d8bac1eeb8e0b884e6a19c3b41da160fc161',
  [paths.physicsSourceManifest]: '916a453e94840bb3afc94c53d1cad1d39a85e2309a7bc7006bf162fcc6631fa5',
}

// Batch 084 is a separately reviewed storage follow-up. It does not replace
// or rebind the structural Batch-023 plan above: only the standard generated
// visualization-QA ledger differs inside the original 11-file output set.
const expectedArchivedFollowUpHashes: Record<string, string> = {
  ...expectedAfterHashes,
  [paths.visualizationQa]: '8509b203651185e17cbb461e4802e22b8b7432a31ecb34b590c64a3e80aa1861',
}

const protectedFileHashes: Record<string, string> = {
  [paths.byStructuredSource]: '6b49157703e7bad2685e09684d94248447da2f066a1c9cafc48bf11e758cbdfc',
  [paths.byLegacyMapping]: '9b3ffc11d81768326d19dac8691f1c04bdb9da6f4363624681e0d755c9a9c7fa',
  [paths.bySourceExtraction]: 'c8d655fc7ce812b9e4eebe23fe35d96af388871d9dd80dec9a7848e30d50fa17',
  [paths.hhGenerator]: '77e7355989a3e4b163002d2d3a24d4da4c7ff636676c1be85fcf22a79dbc890d',
  [paths.hhSourceExtraction]: 'bdf230c0341a8e72dce882d603d979715708031c79511d5b12eb0ecbea44b426',
  [paths.hhMapping]: 'a6ab9c9d7ba671c5fed0e4ce8c1865960afb11bd56c870a94817946226585a00',
  [paths.sourceGoalClosure]: '4c7f12410397dece9aa58b498a531f06fe7edc9a7edac707a834088be6181144',
  [paths.sourceGoalMembership]: 'b3fa299f332be9aec1d15b535187a13ef16fabde9cdc3911f7ff4122375a37a6',
  [paths.surrogateProvenance]: '33ebc9b355d7f8aec22911edd1a388b54dcc6d6a03514282f1d93585e7ff604c',
  [compositionViewPaths[0]]: '2c80b1313671d86042cee38e612613cce43168a00bd85a01d4e2da536c1abecd',
  [compositionViewPaths[1]]: '24617b88dcd89b6f02162d0eaa082860a95d111a992ef4aa93600a9e41943556',
  [compositionViewPaths[2]]: '234c328e1314b31b5ece88049c8f7670087c6d7362dde4511f59349be552c40b',
  [compositionViewPaths[3]]: 'e9719874174ac96f4902f7e003e4e83a18cdd7bc9b4ab252b9b4eed70a0371b4',
}

const expectedVisualizationTrees = {
  canonical: {
    fileCount: 1012,
    sha256: '6fd905fbe1f63bd2589571435b43f1d83bd7884d74c7f1718debde1569cc6e32',
  },
  public: {
    fileCount: 438,
    sha256: '44814e0414067ac4a6722573777bd225da0aece57bedc8b3622c2aeb5105f4a1',
  },
} as const

const expectedArchivedFollowUp = {
  scriptSha256: 'd2d15cc74c7d75bbdb9a6e92440f9d69b35462b612273d5160c6b84c283e64d3',
  planSha256: '93d44e8b76ff187371bdf0db3c4b7e4abc54519962cb0883a2cf47f535f46b18',
  canonicalVisualizationTree: {
    fileCount: 1010,
    sha256: 'bb8dc76338fadd950a19ae8b9c8669515204cc5af2d1f8109f524b842aa3a636',
  },
  publicVisualizationTree: {
    fileCount: 437,
    sha256: '476c2a013db443c95e3d8ae0810ff0d593e472b467fdde2549b4a4d963581ab5',
  },
} as const

const astronomicalUnitAssetSha256 = 'df281eca0a3fc705be47d0f32afc73eef5823baf1edcf988168d3db1b68a8bfd'
const astronomicalUnitPromptSha256 = '07d5bbf8e6164b019721bb45bec7ca45dbef9f13a78b97a6976e2feb10560112'

const atomicityReasons: Record<string, string> = {
  [ids.astronomicalUnit]: 'Aktuelle Definition und historische Beobachtungsrekonstruktion bilden eine gemeinsame, begrenzte Einordnungsleistung.',
  [ids.solarRadius]: 'Winkeldurchmesser und Entfernung werden in genau einem Geometriemodell zur Zielgröße Sonnenradius verknüpft.',
  [ids.solarRotation]: 'Strukturverfolgung, synodische Schätzung und Grenzen beurteilen dieselbe beobachterbezogene Rotationsinferenz.',
  [ids.orbitalMass]: 'Bahnparameter werden in einem begründeten Gravitationsmodell zu einer eingeschlossenen Masse invertiert.',
  [ids.opticalDynamicalMass]: 'Bahnperiode und räumliche Bahnskala erschließen genau die dynamische Gesamtmasse eines optischen Zweikörpersystems.',
  [ids.gwChirpMass]: 'Frequenz und Frequenzänderungsrate erschließen genau die Chirp-Masse in einem begrenzten Inspiral-Näherungsmodell.',
}

const memoryReasons: Record<string, string> = {
  [ids.astronomicalUnit]: 'Die Kompetenz ist eine historische und datengestützte Rekonstruktion; isolierte Faktenkarten würden das Modellverständnis nicht prüfen.',
  [ids.solarRadius]: 'Die Leistung verlangt Geometriemodell, sichere Datenwahl und Unsicherheitsbeurteilung statt bloßen Faktenabrufs.',
  [ids.solarRotation]: 'Die Leistung verlangt Bildauswertung und eine begrenzte synodische Inferenz statt auswendig gelernter Rotationswerte.',
  [ids.orbitalMass]: 'Die Leistung verlangt modellgestützte Inversion und Systemgrenzen; eine Karte wäre kein geeigneter Primärnachweis.',
  [ids.opticalDynamicalMass]: 'Die Leistung verlangt die Verbindung von Bahnperiode, räumlicher Skala, Modellannahmen und Unsicherheiten.',
  [ids.gwChirpMass]: 'Die Leistung verlangt eine signal- und modellgestützte Inferenz einschließlich der Bedeutung der Chirp-Masse.',
}

const byMappingRationale = 'Batch-023-Fachreview: Ph13-GA-ASTRO.4.5 trägt getrennt die dynamische Gesamtmasseninferenz aus optischen Zweikörperbahndaten und die Chirp-Masseninferenz aus der Frequenzentwicklung eines Gravitationswellensignals. Die physikalisch begrenzte Analogieerklärung der Gravitationswellenentstehung und beide Grundlagenziele bleiben erhalten; der nun strukturelle Sammelknoten wird nicht direkt gemappt.'

const absolute = (path: string): string => resolve(repoRoot, path)
const readJson = (path: string): JsonRecord => JSON.parse(readFileSync(absolute(path), 'utf8')) as JsonRecord
const readJsonl = (path: string): JsonRecord[] => readFileSync(absolute(path), 'utf8')
  .split(/\r?\n/u)
  .filter((line) => line.trim() !== '')
  .map((line) => JSON.parse(line) as JsonRecord)
const serializeJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`
const serializeJsonl = (records: JsonRecord[]): string => `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
const sha256 = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const sha256Digest = (value: string | Uint8Array): string => `sha256:${sha256(value)}`
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value as JsonRecord)
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`).join(',')}}`
  return JSON.stringify(value) ?? 'null'
}
const same = (left: unknown, right: unknown): boolean => stableJson(left) === stableJson(right)
const normalizeText = (value: unknown): string => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
const sortStrings = (values: string[]): string[] => [...values]
  .sort((left, right) => left < right ? -1 : left > right ? 1 : 0)

const semanticKindFingerprintDomain = 'skillpilot:semantic-kind-source-fingerprint:v1'
const semanticKindFingerprintProfilePath = (
  'contracts/curriculum-package/v1/profiles/semantic-normal-form-v1.profile.json'
)
const semanticKindFingerprintProfileSha256 = '22e48f2dea55fbc3d6b39fc196c31258ab1559ef6751df4882f43318eadd48ca'
const semanticKindFingerprintPointers = [
  '/id',
  '/type',
  '/nodeKind',
  '/title',
  '/titleEn',
  '/description',
  '/descriptionEn',
  '/tags',
  '/contains',
  '/requires',
  '/semanticAtomic',
  '/dimensionTags',
  '/examData',
  '/extendedData',
  '/release',
] as const

const compareUnicodeCodePoints = (left: string, right: string): number => {
  const leftPoints = Array.from(left, (value) => value.codePointAt(0) ?? 0)
  const rightPoints = Array.from(right, (value) => value.codePointAt(0) ?? 0)
  const length = Math.min(leftPoints.length, rightPoints.length)
  for (let index = 0; index < length; index += 1) {
    if (leftPoints[index] !== rightPoints[index]) return leftPoints[index] - rightPoints[index]
  }
  return leftPoints.length - rightPoints.length
}

const assertSemanticCanonicalString = (value: string, label: string): void => {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index)
    let codePoint = codeUnit
    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const low = value.charCodeAt(index + 1)
      if (!(low >= 0xdc00 && low <= 0xdfff)) throw new Error(`${label} contains an unpaired Unicode surrogate`)
      codePoint = ((codeUnit - 0xd800) * 0x400) + (low - 0xdc00) + 0x10000
      index += 1
    } else if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      throw new Error(`${label} contains an unpaired Unicode surrogate`)
    }
    if (
      (codePoint < 0x20 && codePoint !== 0x09 && codePoint !== 0x0a && codePoint !== 0x0d)
      || codePoint === 0xfffe
      || codePoint === 0xffff
    ) throw new Error(`${label} contains a forbidden semantic-normal-form-v1 character`)
  }
}

const semanticCanonicalJson = (value: unknown, label: string): string => {
  if (value === null) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'string') {
    assertSemanticCanonicalString(value, label)
    return JSON.stringify(value)
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error(`${label} contains a non-finite number`)
    return JSON.stringify(Object.is(value, -0) ? 0 : value)
  }
  if (Array.isArray(value)) {
    return `[${value.map((item, index) => semanticCanonicalJson(item, `${label}[${index}]`)).join(',')}]`
  }
  if (value && typeof value === 'object') {
    return `{${Object.keys(value as JsonRecord)
      .sort(compareUnicodeCodePoints)
      .map((key) => {
        assertSemanticCanonicalString(key, `${label} object key`)
        return `${JSON.stringify(key)}:${semanticCanonicalJson((value as JsonRecord)[key], `${label}.${key}`)}`
      })
      .join(',')}}`
  }
  throw new Error(`${label} contains an unsupported canonical JSON value`)
}

const fingerprintSemanticKindSourceGoal = (rawGoal: JsonRecord): string => {
  assertSha256(
    semanticKindFingerprintProfilePath,
    semanticKindFingerprintProfileSha256,
    'Pinned semantic normal form',
  )
  if (typeof rawGoal.id !== 'string' || rawGoal.id.trim() === '') {
    throw new Error('Semantic-kind source goal ID must be a non-empty string')
  }
  const fields = semanticKindFingerprintPointers.map((pointer) => {
    const key = pointer.slice(1)
    if (!Object.prototype.hasOwnProperty.call(rawGoal, key)) return { path: pointer, state: 'missing' }
    let value = rawGoal[key]
    if (pointer === '/tags') {
      if (!Array.isArray(value) || !value.every((entry) => typeof entry === 'string')) {
        throw new Error(`Goal ${rawGoal.id} has invalid tags for semantic-kind fingerprint`)
      }
      if (new Set(value).size !== value.length) {
        throw new Error(`Goal ${rawGoal.id} has duplicate tags for semantic-kind fingerprint`)
      }
      value = [...value].sort(compareUnicodeCodePoints)
    }
    return { path: pointer, state: 'value', value }
  })
  const bytes = semanticCanonicalJson(
    { domain: semanticKindFingerprintDomain, fields },
    `semantic-kind source goal ${rawGoal.id}`,
  )
  return `sha256:${createHash('sha256').update(bytes, 'utf8').digest('hex')}`
}

const reviewFingerprint = (goal: JsonRecord, ruleVersion: string): string => sha256Digest(stableJson({
  ruleVersion,
  goalId: goal.id,
  shortKey: goal.shortKey ?? '',
  title: normalizeText(goal.title),
  titleEn: normalizeText(goal.titleEn),
  description: normalizeText(goal.description),
  descriptionEn: normalizeText(goal.descriptionEn),
  phase: normalizeText(goal.dimensionTags?.phase),
  area: normalizeText(goal.dimensionTags?.area),
  topicCode: normalizeText(goal.dimensionTags?.topicCode),
  nodeKind: normalizeText(goal.nodeKind),
}))

const deterministicUuidStyle = (value: string): string => {
  const digest = createHash('sha1').update(value).digest('hex')
  return `${digest.slice(0, 8)}-${digest.slice(8, 12)}-5${digest.slice(13, 16)}-8${digest.slice(17, 20)}-${digest.slice(20, 32)}`
}
const deterministicPhysicsGoalId = (shortKey: string): string => (
  deterministicUuidStyle(`DE-GYM-CANONICAL-PHYSICS:${shortKey}`)
)

function assertSha256(path: string, expected: string, label: string): void {
  if (!existsSync(absolute(path))) throw new Error(`${label}: missing ${path}`)
  const actual = sha256(readFileSync(absolute(path)))
  if (actual !== expected) throw new Error(`${label}: ${path} drifted (${actual} != ${expected})`)
}

function listTreeFiles(root: string): string[] {
  const result: string[] = []
  const visit = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name)
      if (entry.isDirectory()) visit(path)
      else if (entry.isFile()) result.push(path)
    }
  }
  visit(root)
  return result
}

function treeBinding(path: string): { fileCount: number; sha256: string } {
  const root = absolute(path)
  const rows = listTreeFiles(root).map((filePath) => ({
    path: relative(root, filePath).split(sep).join('/'),
    sha256: sha256(readFileSync(filePath)),
  })).sort((left, right) => left.path < right.path ? -1 : left.path > right.path ? 1 : 0)
  return { fileCount: rows.length, sha256: sha256(JSON.stringify(rows)) }
}

function countGoalReferences(value: unknown, goalId: string): number {
  if (Array.isArray(value)) return value.reduce((sum, entry) => sum + countGoalReferences(entry, goalId), 0)
  if (!value || typeof value !== 'object') return 0
  const record = value as JsonRecord
  return (record.goalId === goalId ? 1 : 0)
    + Object.values(record).reduce((sum, entry) => sum + countGoalReferences(entry, goalId), 0)
}

type BoundedState = 'exact-before' | 'exact-after' | 'exact-archived-follow-up'

function classifyBoundedState(): BoundedState {
  const matches = (bindings: Record<string, string>): boolean => Object.entries(bindings)
    .every(([path, expected]) => (
      expected !== 'PENDING'
      && existsSync(absolute(path))
      && sha256(readFileSync(absolute(path))) === expected
    ))
  const beforeMatches = matches(expectedBeforeHashes) && !existsSync(absolute(paths.visualizationReview))
  const afterMatches = matches(expectedAfterHashes)
  const archivedFollowUpMatches = matches(expectedArchivedFollowUpHashes)
  const matchingStates = [beforeMatches, afterMatches, archivedFollowUpMatches]
    .filter(Boolean).length
  if (matchingStates !== 1) {
    const pathsToReport = [...new Set([
      ...Object.keys(expectedBeforeHashes),
      ...Object.keys(expectedAfterHashes),
      ...Object.keys(expectedArchivedFollowUpHashes),
    ])]
    const report = pathsToReport.map((path) => (
      `${path}=${existsSync(absolute(path)) ? sha256(readFileSync(absolute(path))) : 'missing'}`
    )).join(',')
    throw new Error(`Batch-023 state is not one exact bound state: ${report}`)
  }
  if (beforeMatches) return 'exact-before'
  return afterMatches ? 'exact-after' : 'exact-archived-follow-up'
}

function assertArchivedVisualizationFollowUp(): void {
  assertSha256(
    paths.visualizationArchiveFollowUp,
    expectedArchivedFollowUp.scriptSha256,
    'Batch-084 exact archive follow-up checker',
  )
  const archiveCheckOutput = execFileSync(
    resolve(repoRoot, 'app/node_modules/.bin/tsx'),
    [absolute(paths.visualizationArchiveFollowUp), '--check'],
    { cwd: repoRoot, encoding: 'utf8' },
  ).trim()
  const expectedOutput = [
    'CHECK archive_physics_b023_astronomical_unit_visualization PASS active=0/4 archived=4/4',
    `ARCHIVE_PLAN_SHA256 ${expectedArchivedFollowUp.planSha256} binding=${expectedArchivedFollowUp.planSha256}`,
  ].join('\n')
  if (archiveCheckOutput !== expectedOutput) {
    throw new Error(`Batch-084 archive follow-up check drifted: ${archiveCheckOutput}`)
  }
}

function assertProtectedUnchangedState(state: BoundedState): void {
  for (const [path, expected] of Object.entries(protectedFileHashes)) {
    assertSha256(path, expected, 'Batch-023 protected unchanged file')
  }
  const canonicalTree = treeBinding(paths.canonicalVisualizationRoot)
  const publicTree = treeBinding(paths.publicVisualizationRoot)
  const expectedCanonicalTree = state === 'exact-archived-follow-up'
    ? expectedArchivedFollowUp.canonicalVisualizationTree
    : expectedVisualizationTrees.canonical
  const expectedPublicTree = state === 'exact-archived-follow-up'
    ? expectedArchivedFollowUp.publicVisualizationTree
    : expectedVisualizationTrees.public
  if (!same(canonicalTree, expectedCanonicalTree)) {
    throw new Error(`Canonical Physics visualization tree drifted: ${stableJson(canonicalTree)}`)
  }
  if (!same(publicTree, expectedPublicTree)) {
    throw new Error(`Public Physics visualization tree drifted: ${stableJson(publicTree)}`)
  }
  if (state === 'exact-archived-follow-up') {
    assertArchivedVisualizationFollowUp()
  } else {
    assertSha256(
      `${paths.canonicalVisualizationRoot}/${ids.astronomicalUnit}/${ids.astronomicalUnit}.jpg`,
      astronomicalUnitAssetSha256,
      'Retained incompatible astronomical-unit Nano Banana Pro asset',
    )
    assertSha256(
      `${paths.publicVisualizationRoot}/${ids.astronomicalUnit}/${ids.astronomicalUnit}.jpg`,
      astronomicalUnitAssetSha256,
      'Retained incompatible public astronomical-unit Nano Banana Pro asset',
    )
    assertSha256(
      `${paths.canonicalVisualizationRoot}/${ids.astronomicalUnit}/prompt.de.md`,
      astronomicalUnitPromptSha256,
      'Retained astronomical-unit Nano Banana Pro prompt',
    )
  }
  for (const childId of childIds) {
    for (const root of [paths.canonicalVisualizationRoot, paths.publicVisualizationRoot]) {
      const directory = absolute(`${root}/${childId}`)
      if (existsSync(directory) && readdirSync(directory).length > 0) {
        throw new Error(`Batch-023 child ${childId} unexpectedly has visual files in ${directory}`)
      }
    }
  }
  for (const path of compositionViewPaths) {
    const view = readJson(path)
    if (countGoalReferences(view, ids.binaryGwCluster) !== 1) {
      throw new Error(`${path}: expected one inherited binary/GW canonical subtree`)
    }
    for (const goalId of [ids.binaryGwMass, ...childIds]) {
      if (countGoalReferences(view, goalId) !== 0) {
        throw new Error(`${path}: Batch-023 goal ${goalId} must remain inherited, not directly duplicated`)
      }
    }
  }
  const surrogate = readJson(paths.surrogateProvenance)
  const affectedSurrogateEntries = (surrogate.entries ?? []).filter((entry: JsonRecord) => (
    [ids.binaryGwMass, ...childIds].includes(entry.goalId)
    || [ids.binaryGwMass, ...childIds].includes(entry.requiredByGoalId)
  ))
  if (affectedSurrogateEntries.length !== 0) {
    throw new Error('Batch-023 mass-inference split unexpectedly has surrogate-evidence entries')
  }
}

function loadAdjudication(): JsonRecord {
  assertSha256(paths.adjudication, expectedAdjudicationSha256, 'Batch-023 adjudication')
  assertSha256(paths.followUpConfig, expectedFollowUpConfigSha256, 'Batch-024 follow-up config')
  const adjudication = readJson(paths.adjudication)
  const followUp = readJson(paths.followUpConfig)
  for (const binding of adjudication.exactInputSha256 ?? []) {
    assertSha256(String(binding.path), String(binding.sha256), 'Batch-023 blind-review input')
  }
  if (
    adjudication.schemaVersion !== 1
    || adjudication.subject !== 'physik'
    || adjudication.materialized !== false
    || adjudication.noProgressClaim !== true
    || adjudication.counts?.total !== 16
    || adjudication.counts?.keep_current !== 11
    || adjudication.counts?.accepted_revision !== 4
    || adjudication.counts?.structural_split !== 1
    || adjudication.counts?.newAtomicChildren !== 2
    || adjudication.counts?.curricularAtomicDenominatorBefore !== 459
    || adjudication.counts?.curricularAtomicDenominatorAfter !== 460
    || adjudication.counts?.bavariaMappingRowsAfter !== 1009
    || !same(adjudication.requiredFollowUpGoalIds, [...requiredFollowUpGoalIds])
    || adjudication.followUpConfigSha256 !== expectedFollowUpConfigSha256
    || followUp.subject !== 'physik'
    || !same(followUp.goalIds, [...requiredFollowUpGoalIds])
    || !Array.isArray(adjudication.decisions)
    || adjudication.decisions.length !== 16
  ) throw new Error('Unexpected Batch-023 adjudication or Batch-024 follow-up contract')

  const decisions = adjudication.decisions as JsonRecord[]
  const kept = decisions.filter((decision) => decision.resolutionDecision === 'keep_current')
    .map((decision) => String(decision.goalId))
  const revised = decisions.filter((decision) => decision.resolutionDecision === 'accepted_revision')
    .map((decision) => String(decision.goalId))
  const split = decisions.filter((decision) => decision.resolutionDecision === 'structural_split')
  if (!same(kept, [...keepIds]) || !same(revised, [...revisedIds]) || split.length !== 1) {
    throw new Error('Unexpected Batch-023 decision sets or order')
  }
  const splitDecision = split[0]
  if (
    splitDecision.goalId !== ids.binaryGwMass
    || !same((splitDecision.children as JsonRecord[]).map((child) => child.goalId), [...childIds])
    || !same(splitDecision.clusterConversion?.contains, [...childIds])
  ) throw new Error('Unexpected Batch-023 split contract')
  for (const child of splitDecision.children as JsonRecord[]) {
    if (deterministicPhysicsGoalId(String(child.shortKey)) !== child.goalId) {
      throw new Error(`Deterministic Physics child ID mismatch for ${String(child.shortKey)}`)
    }
  }
  const optical = (splitDecision.children as JsonRecord[])[0]
  const gravitationalWave = (splitDecision.children as JsonRecord[])[1]
  if (
    !same(optical.requires, [ids.twoBodyFoundation])
    || !same(gravitationalWave.requires, [ids.twoBodyFoundation, ids.waveFoundation])
  ) throw new Error('Batch-023 child prerequisite contract drifted')
  return adjudication
}

function assertGraph(goals: JsonRecord[]): void {
  const byId = new Map<string, JsonRecord>()
  for (const goal of goals) {
    if (typeof goal.id !== 'string' || byId.has(goal.id)) {
      throw new Error(`Duplicate or invalid canonical Physics goal ID ${String(goal.id)}`)
    }
    byId.set(goal.id, goal)
  }
  const allCanonicalGoalIds = new Set(byId.keys())
  const canonicalDirectory = dirname(absolute(paths.canonical))
  for (const fileName of readdirSync(canonicalDirectory)) {
    if (!fileName.endsWith('.json') || fileName === basename(paths.canonical)) continue
    const landscape = JSON.parse(readFileSync(resolve(canonicalDirectory, fileName), 'utf8')) as JsonRecord
    for (const goal of landscape.goals ?? []) if (typeof goal.id === 'string') allCanonicalGoalIds.add(goal.id)
  }
  for (const field of ['contains', 'requires'] as const) {
    for (const goal of goals) {
      const targets = goal[field] ?? []
      if (!Array.isArray(targets) || new Set(targets).size !== targets.length) {
        throw new Error(`${goal.id}: invalid or duplicate ${field}`)
      }
      for (const targetId of targets) {
        if (!allCanonicalGoalIds.has(targetId)) throw new Error(`${goal.id}: missing ${field} target ${targetId}`)
      }
    }
    const visiting = new Set<string>()
    const visited = new Set<string>()
    const visit = (goalId: string): void => {
      if (visited.has(goalId)) return
      if (visiting.has(goalId)) throw new Error(`${field} cycle at ${goalId}`)
      visiting.add(goalId)
      for (const targetId of byId.get(goalId)?.[field] ?? []) if (byId.has(targetId)) visit(targetId)
      visiting.delete(goalId)
      visited.add(goalId)
    }
    for (const goalId of byId.keys()) visit(goalId)
  }
}

function childTopicCode(shortKey: string): string {
  if (!shortKey.startsWith('canonical_physics_')) throw new Error(`Unexpected Physics child shortKey ${shortKey}`)
  return `CANONICAL_PHYSICS_${shortKey.slice('canonical_physics_'.length).toUpperCase()}`
}

function assessmentSnapshot(goals: JsonRecord[]): string {
  return stableJson(goals.filter((goal) => goal.type === 'practiceAssessment' || goal.examData !== undefined))
}

function buildCanonical(adjudication: JsonRecord): JsonRecord {
  const canonical = readJson(paths.canonical)
  if (canonical.landscapeId !== physicsLandscapeId || !Array.isArray(canonical.goals)) {
    throw new Error('Unexpected canonical Physics landscape')
  }
  const goals = canonical.goals as JsonRecord[]
  const currentById = new Map(goals.map((goal) => [String(goal.id), structuredClone(goal)]))
  const beforeAssessments = assessmentSnapshot(goals)
  const byId = new Map(goals.map((goal) => [String(goal.id), goal]))
  if (byId.size !== goals.length) throw new Error('Duplicate canonical Physics goal IDs')
  const goal = (goalId: string): JsonRecord => {
    const value = byId.get(goalId)
    if (!value) throw new Error(`Missing canonical Physics goal ${goalId}`)
    return value
  }
  const decisions = new Map<string, JsonRecord>(
    (adjudication.decisions as JsonRecord[]).map((decision) => [String(decision.goalId), decision]),
  )

  for (const goalId of revisedIds) {
    const current = goal(goalId)
    const before = structuredClone(current)
    const decision = decisions.get(goalId)
    const finalText = decision?.finalText
    if (
      decision?.resolutionDecision !== 'accepted_revision'
      || decision.changeScope !== 'description_de_and_description_en_only'
      || !finalText
      || finalText.titleDe !== before.title
      || finalText.titleEn !== before.titleEn
    ) throw new Error(`${goalId}: missing exact description-only Batch-023 revision`)
    current.description = finalText.descriptionDe
    current.descriptionEn = finalText.descriptionEn
    if (goalId === ids.astronomicalUnit) {
      const visualLinks = (current.resourceLinks ?? [])
        .filter((link: JsonRecord) => link.type === 'goal-visualization')
      if (
        visualLinks.length !== 1
        || visualLinks[0].provider !== 'Google Gemini / Nano Banana Pro'
        || visualLinks[0].skillpilotId !== goalId
        || !String(visualLinks[0].url).endsWith(`/${goalId}.jpg`)
      ) throw new Error('Astronomical-unit Nano Banana Pro link identity drifted before fail-closed unlink')
      current.resourceLinks = (current.resourceLinks ?? [])
        .filter((link: JsonRecord) => link.type !== 'goal-visualization')
    }
    const allowed = structuredClone(before)
    allowed.description = current.description
    allowed.descriptionEn = current.descriptionEn
    if (goalId === ids.astronomicalUnit) allowed.resourceLinks = current.resourceLinks
    if (!same(current, allowed)) throw new Error(`${goalId}: revision escaped its exact field boundary`)
  }

  const splitDecision = decisions.get(ids.binaryGwMass)
  const conversion = splitDecision?.clusterConversion as JsonRecord | undefined
  if (
    splitDecision?.resolutionDecision !== 'structural_split'
    || !conversion
    || !Array.isArray(splitDecision.children)
  ) throw new Error('Missing Batch-023 mass-inference structural split')
  const parent = goal(ids.binaryGwMass)
  const parentBefore = structuredClone(parent)
  const parentTemplate = {
    tags: structuredClone(parent.tags ?? []),
    dimensionTags: structuredClone(parent.dimensionTags ?? {}),
    applicability: structuredClone(parent.applicability ?? {}),
    competencyRefs: structuredClone(parent.competencyRefs ?? []),
  }
  if (
    conversion.retainedShortKey !== parent.shortKey
    || conversion.titleDe !== parent.title
    || conversion.titleEn !== parent.titleEn
    || !same(parent.resourceLinks ?? [], [])
  ) throw new Error('Batch-023 parent stable identity/title/no-asset contract drifted')
  Object.assign(parent, {
    description: conversion.descriptionDe,
    descriptionEn: conversion.descriptionEn,
    weight: conversion.weight,
    contains: [...conversion.contains],
    requires: [...conversion.requires],
    type: 'cluster',
  })
  delete parent.semanticAtomic

  const childGoals: JsonRecord[] = []
  for (const child of splitDecision.children as JsonRecord[]) {
    if (byId.has(child.goalId)) throw new Error(`Batch-023 child already exists: ${child.goalId}`)
    const childGoal: JsonRecord = {
      id: child.goalId,
      shortKey: child.shortKey,
      title: child.titleDe,
      titleEn: child.titleEn,
      description: child.descriptionDe,
      descriptionEn: child.descriptionEn,
      weight: 1,
      tags: structuredClone(parentTemplate.tags),
      contains: [],
      requires: [...child.requires],
      dimensionTags: {
        ...structuredClone(parentTemplate.dimensionTags),
        topicCode: childTopicCode(child.shortKey),
      },
      applicability: structuredClone(parentTemplate.applicability),
      type: 'atomic',
      semanticAtomic: true,
      competencyRefs: structuredClone(parentTemplate.competencyRefs),
      resourceLinks: [],
    }
    byId.set(child.goalId, childGoal)
    childGoals.push(childGoal)
  }
  const parentIndex = goals.findIndex((candidate) => candidate.id === ids.binaryGwMass)
  if (parentIndex < 0) throw new Error('Missing Batch-023 child insertion parent')
  goals.splice(parentIndex + 1, 0, ...childGoals)

  const outerCluster = goal(ids.binaryGwCluster)
  const outerClusterBefore = structuredClone(outerCluster)
  if (
    (outerCluster.contains as string[]).filter((goalId) => goalId === ids.binaryGwMass).length !== 1
    || childIds.some((childId) => (outerCluster.contains as string[]).includes(childId))
  ) throw new Error('Children must remain nested under the retained mass-inference parent')
  outerCluster.weight = 3
  const expectedOuterCluster = structuredClone(outerClusterBefore)
  expectedOuterCluster.weight = 3
  if (!same(outerCluster, expectedOuterCluster)) {
    throw new Error('Batch-023 outer cluster weight repair escaped its exact boundary')
  }
  for (const candidate of goals) {
    if ((candidate.requires ?? []).includes(ids.binaryGwMass)) {
      throw new Error(`${candidate.id}: unadjudicated prerequisite to split parent ${ids.binaryGwMass}`)
    }
    const covered = candidate.examData?.coveredGoalIds ?? []
    if ([ids.binaryGwMass, ...childIds].some((goalId) => covered.includes(goalId))) {
      throw new Error(`${candidate.id}: Batch-023 must not infer assessment coverage`)
    }
  }
  for (const keepId of keepIds) {
    if (!same(goal(keepId), currentById.get(keepId))) throw new Error(`KEEP goal changed: ${keepId}`)
  }
  const expectedParent = structuredClone(parentBefore)
  Object.assign(expectedParent, {
    description: conversion.descriptionDe,
    descriptionEn: conversion.descriptionEn,
    weight: 2,
    contains: [...childIds],
    requires: [],
    type: 'cluster',
  })
  delete expectedParent.semanticAtomic
  if (!same(parent, expectedParent)) throw new Error('Batch-023 parent conversion escaped its exact boundary')
  if (goals.length !== 705) throw new Error(`Unexpected post-Batch-023 canonical count ${goals.length}`)
  if (assessmentSnapshot(goals) !== beforeAssessments) throw new Error('Batch-023 changed assessment bytes')
  assertGraph(goals)
  canonical.goals = goals
  return canonical
}

function buildSemanticKinds(canonical: JsonRecord): JsonRecord {
  const ledger = readJson(paths.semanticKinds)
  const goalById = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const decisions = new Map((ledger.decisions as JsonRecord[]).map((decision) => [String(decision.goalId), decision]))
  for (const goalId of [...revisedIds, ids.binaryGwMass, ...childIds]) {
    const sourceGoal = goalById.get(goalId)
    if (!sourceGoal) throw new Error(`${goalId}: missing semantic-kind source goal`)
    const existing = decisions.get(goalId)
    const splitParent = goalId === ids.binaryGwMass
    const child = childIds.includes(goalId as typeof childIds[number])
    if (!existing && !child) throw new Error(`${goalId}: missing existing semantic-kind decision`)
    decisions.set(goalId, {
      ...(existing ?? {}),
      goalId,
      sourceFingerprint: fingerprintSemanticKindSourceGoal(sourceGoal),
      semanticKind: splitParent ? 'curricularArea' : 'curricularAtomic',
      decisionStatus: 'authoritative',
      decisionBasis: splitParent
        ? 'reviewed-current-structural-split-curricular-area'
        : child
          ? 'reviewed-current-structural-split-curricular-atomic'
          : existing?.decisionBasis,
    })
  }
  ledger.decisions = [...decisions.values()].sort((left, right) => {
    const a = String(left.goalId)
    const b = String(right.goalId)
    return a < b ? -1 : a > b ? 1 : 0
  })
  const counts: Record<string, number> = {}
  for (const decision of ledger.decisions as JsonRecord[]) {
    counts[decision.semanticKind] = (counts[decision.semanticKind] ?? 0) + 1
  }
  const order = [
    'curricularAtomic', 'curricularArea', 'practiceAssessment', 'programStructure',
    'memory', 'runtimeSupport', 'orientation',
  ]
  ledger.counts = Object.fromEntries(order.map((kind) => [kind, counts[kind] ?? 0]))
  ledger.counts.total = ledger.decisions.length
  const expectedCounts = {
    curricularAtomic: 460,
    curricularArea: 101,
    practiceAssessment: 133,
    programStructure: 1,
    memory: 5,
    runtimeSupport: 4,
    orientation: 1,
    total: 705,
  }
  if (!same(ledger.counts, expectedCounts)) {
    throw new Error(`Unexpected post-Batch-023 semantic-kind counts ${stableJson(ledger.counts)}`)
  }
  return ledger
}

function assertExactFollowUpFingerprintDelta(currentCanonical: JsonRecord, canonical: JsonRecord): void {
  const before = new Map((currentCanonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const after = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const semantic = (goal: JsonRecord): string => stableJson({
    title: goal.title,
    titleEn: goal.titleEn,
    description: goal.description,
    descriptionEn: goal.descriptionEn,
    shortKey: goal.shortKey ?? '',
    phase: goal.dimensionTags?.phase ?? '',
    area: goal.dimensionTags?.area ?? '',
    topicCode: goal.dimensionTags?.topicCode ?? '',
    nodeKind: goal.nodeKind ?? '',
  })
  const changedOrNewAtoms = [...after]
    .filter(([goalId, goal]) => (
      goal.type === 'atomic'
      && (!before.has(goalId) || semantic(before.get(goalId)!) !== semantic(goal))
    ))
    .map(([goalId]) => goalId)
  if (!same(sortStrings(changedOrNewAtoms), sortStrings([...requiredFollowUpGoalIds]))) {
    throw new Error(`Batch-024 fingerprint scope is not exactly six goals: ${changedOrNewAtoms.join(',')}`)
  }
}

function buildReviewLedger(
  canonical: JsonRecord,
  semanticKinds: JsonRecord,
  kind: 'atomicity' | 'memory',
): JsonRecord[] {
  const path = kind === 'atomicity' ? paths.atomicity : paths.memory
  const ruleVersion = kind === 'atomicity' ? 'semantic-atomicity-v1' : 'memory-card-review-v1'
  const reasons = kind === 'atomicity' ? atomicityReasons : memoryReasons
  const goalById = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const records = readJsonl(path)
  const byId = new Map(records.map((record) => [String(record.goalId), record]))
  byId.delete(ids.binaryGwMass)
  for (const goalId of requiredFollowUpGoalIds) {
    const goal = goalById.get(goalId)
    if (!goal) throw new Error(`${goalId}: missing current atomic goal for ${kind}`)
    const existing = byId.get(goalId)
    const reason = reasons[goalId]
    if (!reason) throw new Error(`${goalId}: missing individual ${kind} rationale`)
    if (existing && existing.ruleVersion !== ruleVersion) throw new Error(`${goalId}: ${kind} rule drift`)
    const base = existing ?? {
      schemaVersion: 1,
      reviewId: 'canonical-physics-full',
      ruleVersion,
      landscapeId: physicsLandscapeId,
      goalId,
    }
    if (kind === 'atomicity') {
      Object.assign(base, {
        fingerprint: reviewFingerprint(goal, ruleVersion),
        reviewedAt,
        reviewer,
        status: 'atomic',
        semanticAtomic: true,
        reason,
        suggestedSplit: [],
      })
    } else {
      Object.assign(base, {
        fingerprint: reviewFingerprint(goal, ruleVersion),
        status: 'no_memory_needed',
        memoryUseful: false,
        reviewedAt,
        reviewer,
        reason,
      })
      delete base.memoryGoalIds
      delete base.deckIds
    }
    byId.set(goalId, base)
  }
  const result = [...byId.values()].sort((left, right) => {
    const a = String(left.goalId)
    const b = String(right.goalId)
    return a < b ? -1 : a > b ? 1 : 0
  })
  const expectedAtomicIds = sortStrings((semanticKinds.decisions as JsonRecord[])
    .filter((decision) => decision.semanticKind === 'curricularAtomic')
    .map((decision) => String(decision.goalId)))
  const actualIds = result.map((record) => String(record.goalId))
  if (result.length !== 460 || !same(actualIds, expectedAtomicIds)) {
    throw new Error(`${kind} ledger does not exactly cover the 460 current curricularAtomic Physics goals`)
  }
  return result
}

function insertBeforeOnce(source: string, marker: string, anchor: string, insertion: string, label: string): string {
  if (source.includes(marker)) return source
  const first = source.indexOf(anchor)
  if (first < 0 || source.indexOf(anchor, first + anchor.length) >= 0) {
    throw new Error(`${label}: expected one insertion anchor`)
  }
  return `${source.slice(0, first)}${insertion}\n\n${source.slice(first)}`
}

function replaceOnceOrAfter(source: string, before: string, after: string, label: string): string {
  if (source.includes(after)) return source
  const first = source.indexOf(before)
  if (first < 0 || source.indexOf(before, first + before.length) >= 0) {
    throw new Error(`${label}: expected one replacement anchor`)
  }
  return `${source.slice(0, first)}${after}${source.slice(first + before.length)}`
}

function buildByGenerator(): string {
  let source = readFileSync(absolute(paths.byGenerator), 'utf8')
  const definitions = `// Batch 023 binary/GW mass-inference structural adjudication overlay
const batch023SplitParentIds = new Set(${JSON.stringify([ids.binaryGwMass])})
const batch023TargetsBySourceGoalId: Record<string, Array<{ targetGoalId: string; matchType: 'exact' | 'partial' }>> = ${JSON.stringify({
    [ids.byBinaryGwSource]: exactByTargetGoalIds.map((targetGoalId) => ({ targetGoalId, matchType: 'partial' })),
  }, null, 2)}
const batch023MappingRationaleBySourceGoalId: Record<string, string> = ${JSON.stringify({
    [ids.byBinaryGwSource]: byMappingRationale,
  }, null, 2)}`
  source = insertBeforeOnce(
    source,
    '// Batch 023 binary/GW mass-inference structural adjudication overlay',
    'const applyPhysicsBatch015Targets = (',
    definitions,
    'BY generator Batch-023 mapping definitions',
  )
  source = replaceOnceOrAfter(
    source,
    `  const batch022Targets = batch022TargetsBySourceGoalId[sourceGoalId]
  if (batch022Targets) {`,
    `  const batch023Targets = batch023TargetsBySourceGoalId[sourceGoalId]
  if (batch023Targets) {
    return batch023Targets.map((target) => ({
      canonicalGoalId: target.targetGoalId,
      matchType: target.matchType,
    }))
  }
  const batch022Targets = batch022TargetsBySourceGoalId[sourceGoalId]
  if (batch022Targets) {`,
    'BY generator Batch-023 target precedence',
  )
  source = replaceOnceOrAfter(
    source,
    '&& !batch022SplitParentIds.has(target.canonicalGoalId))',
    '&& !batch022SplitParentIds.has(target.canonicalGoalId) && !batch023SplitParentIds.has(target.canonicalGoalId))',
    'BY generator Batch-023 split-parent filter',
  )
  source = insertBeforeOnce(
    source,
    '// Batch 023 source-specific mapping rationales.',
    '  const mappings = decisions.flatMap((decision) => {',
    `  // Batch 023 source-specific mapping rationales.
  for (const decision of decisions) {
    const batch023Rationale = batch023MappingRationaleBySourceGoalId[decision.sourceGoalId]
    if (!batch023Rationale) continue
    decision.rationale = batch023Rationale
    decision.reviewedAt = '${reviewedAt}'
    decision.reviewer = '${reviewer}'
  }`,
    'BY generator Batch-023 rationale overlay',
  )
  return source
}

function assertGeneratedTypeScriptSyntax(path: string, source: string): void {
  const result = ts.transpileModule(source, {
    fileName: path,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
  })
  const errors = (result.diagnostics ?? []).filter((diagnostic) => (
    diagnostic.category === ts.DiagnosticCategory.Error
  ))
  if (errors.length > 0) {
    const formatted = ts.formatDiagnostics(errors, {
      getCanonicalFileName: (fileName) => fileName,
      getCurrentDirectory: () => repoRoot,
      getNewLine: () => '\n',
    })
    throw new Error(`Generated TypeScript syntax failed for ${path}:\n${formatted}`)
  }
}

function copyGeneratorInput(tempRoot: string, path: string): void {
  const destination = resolve(tempRoot, path)
  mkdirSync(dirname(destination), { recursive: true })
  cpSync(absolute(path), destination)
}

function reproduceByGenerator(byGenerator: string): { sourceExtraction: string; mapping: string } {
  const tempRoot = mkdtempSync('/dev/shm/skillpilot-b023-generator-')
  try {
    mkdirSync(resolve(tempRoot, 'app/scripts'), { recursive: true })
    writeFileSync(resolve(tempRoot, paths.byGenerator), byGenerator)
    for (const path of [paths.byStructuredSource, paths.byLegacyMapping]) copyGeneratorInput(tempRoot, path)
    execFileSync(absolute('app/node_modules/.bin/tsx'), [resolve(tempRoot, paths.byGenerator)], {
      cwd: resolve(tempRoot, 'app'),
      stdio: 'pipe',
      encoding: 'utf8',
    })
    return {
      sourceExtraction: readFileSync(resolve(tempRoot, paths.bySourceExtraction), 'utf8'),
      mapping: readFileSync(resolve(tempRoot, paths.byMapping), 'utf8'),
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true })
  }
}

function buildExpectedByMapping(): JsonRecord {
  const expected = readJson(paths.byMapping)
  const decision = (expected.decisions as JsonRecord[])
    .find((candidate) => candidate.sourceGoalId === ids.byBinaryGwSource)
  if (!decision || !same(decision.canonicalGoalIds, [
    ids.binaryGwMass,
    ids.gwGeneration,
    ids.waveFoundation,
    ids.twoBodyFoundation,
  ])) throw new Error('Unexpected pre-Batch-023 Bavaria mass-inference decision')
  decision.canonicalGoalIds = [...exactByTargetGoalIds]
  decision.rationale = byMappingRationale
  decision.reviewedAt = reviewedAt
  decision.reviewer = reviewer

  const mappings = expected.mappings as JsonRecord[]
  const firstIndex = mappings.findIndex((mapping) => mapping.legacyGoalId === ids.byBinaryGwSource)
  const previous = mappings.filter((mapping) => mapping.legacyGoalId === ids.byBinaryGwSource)
  if (
    firstIndex < 0
    || !same(previous.map((mapping) => mapping.canonicalGoalId), [
      ids.binaryGwMass,
      ids.gwGeneration,
      ids.waveFoundation,
      ids.twoBodyFoundation,
    ])
  ) throw new Error('Unexpected pre-Batch-023 Bavaria mass-inference mappings')
  const retained = mappings.filter((mapping) => mapping.legacyGoalId !== ids.byBinaryGwSource)
  retained.splice(firstIndex, 0, ...exactByTargetGoalIds.map((canonicalGoalId) => ({
    legacyGoalId: ids.byBinaryGwSource,
    canonicalGoalId,
    matchType: 'partial',
    reviewDecisionId: ids.byBinaryGwSource,
  })))
  expected.mappings = retained
  return expected
}

function validateGeneratedByOutputs(outputs: { sourceExtraction: string; mapping: string }): JsonRecord {
  if (sha256(outputs.sourceExtraction) !== protectedFileHashes[paths.bySourceExtraction]) {
    throw new Error('Batch-023 BY generator changed protected source-extraction bytes')
  }
  const extraction = JSON.parse(outputs.sourceExtraction) as JsonRecord
  const mapping = JSON.parse(outputs.mapping) as JsonRecord
  if (
    extraction.sourceLandscapeId !== bySourceLandscapeId
    || extraction.sourceGoals?.length !== 301
    || mapping.sourceLandscapeId !== bySourceLandscapeId
    || mapping.targetLandscapeId !== physicsLandscapeId
    || mapping.decisions?.length !== 301
    || mapping.mappings?.length !== 1009
  ) throw new Error('Unexpected generated Bavaria extraction or mapping counts')
  const expectedMapping = buildExpectedByMapping()
  if (!same(mapping, expectedMapping)) {
    throw new Error('Generated Bavaria mapping escaped the one-row Batch-023 adjudication boundary')
  }
  const relevantDecision = (mapping.decisions as JsonRecord[])
    .find((decision) => decision.sourceGoalId === ids.byBinaryGwSource)
  const relevantMappings = (mapping.mappings as JsonRecord[])
    .filter((entry) => entry.legacyGoalId === ids.byBinaryGwSource)
  if (
    !same(relevantDecision?.canonicalGoalIds, [...exactByTargetGoalIds])
    || relevantDecision?.rationale !== byMappingRationale
    || relevantDecision?.reviewer !== reviewer
    || !same(relevantMappings.map((entry) => ({
      canonicalGoalId: entry.canonicalGoalId,
      matchType: entry.matchType,
    })), exactByTargetGoalIds.map((canonicalGoalId) => ({ canonicalGoalId, matchType: 'partial' })))
    || (mapping.mappings as JsonRecord[]).some((entry) => entry.canonicalGoalId === ids.binaryGwMass)
    || (mapping.decisions as JsonRecord[]).some((entry) => (
      (entry.canonicalGoalIds ?? []).includes(ids.binaryGwMass)
    ))
  ) throw new Error('Generated Bavaria mass-inference mapping is not the exact child-level partial mapping')
  return mapping
}

function buildProvenance(byMapping: JsonRecord): JsonRecord {
  const registry = readJson(paths.provenance)
  const landscape = (registry.landscapes as JsonRecord[])
    .find((entry) => entry.landscapeId === physicsLandscapeId)
  if (!landscape?.goalProvenance || typeof landscape.goalProvenance !== 'object') {
    throw new Error('Missing canonical Physics provenance landscape')
  }
  const relevantTargets = new Set((byMapping.mappings as JsonRecord[])
    .filter((mapping) => mapping.legacyGoalId === ids.byBinaryGwSource)
    .map((mapping) => String(mapping.canonicalGoalId)))
  for (const childId of childIds) {
    if (!relevantTargets.has(childId)) throw new Error(`Missing Bavaria mapping for provenance child ${childId}`)
    if (landscape.goalProvenance[childId]) {
      throw new Error(`Batch-023 child unexpectedly has pre-existing provenance: ${childId}`)
    }
    landscape.goalProvenance[childId] = {
      sourceLandscapeId: bySourceLandscapeId,
      sourceGoalId: ids.byBinaryGwSource,
    }
  }
  const parentProvenance = landscape.goalProvenance[ids.binaryGwMass]
  if (
    parentProvenance?.sourceLandscapeId !== bySourceLandscapeId
    || parentProvenance?.sourceGoalId !== ids.byBinaryGwSource
  ) throw new Error('Retained mass-inference parent provenance drifted')
  delete landscape.goalProvenance[ids.binaryGwMass]
  landscape.goalProvenance = Object.fromEntries(Object.entries(landscape.goalProvenance)
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0))
  if (
    Object.keys(landscape.goalProvenance).length !== 456
    || landscape.goalProvenance[ids.binaryGwMass]
  ) {
    throw new Error(`Unexpected post-Batch-023 Physics provenance count ${Object.keys(landscape.goalProvenance).length}`)
  }
  return registry
}

function resetMissingVisualizationRecord(record: JsonRecord, goal: JsonRecord): void {
  Object.assign(record, {
    title: goal.title,
    description: goal.description,
    visualizationState: 'missing',
    missingReason: 'deferred_provider_limitation',
    imageUrl: '',
    publicAssetPath: '',
    canonicalAssetPath: '',
    assetSha256: '',
    umlautsCorrectChatGpt: 'no',
    contentApprovedChatGpt: 'no',
    chatGptReviewedAt: null,
    chatGptReviewer: '',
    chatGptNotes: '',
  })
  delete record.aiApproved
  delete record.aiApprovedAssetSha256
  delete record.aiReviewedAt
  delete record.aiReviewer
  delete record.aiNotes
}

function buildVisualizationQa(canonical: JsonRecord): JsonRecord {
  const qa = readJson(paths.visualizationQa)
  const goalById = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const byId = new Map((qa.records as JsonRecord[]).map((record) => [String(record.goalId), record]))
  const astronomicalUnit = goalById.get(ids.astronomicalUnit)
  const astronomicalUnitRecord = byId.get(ids.astronomicalUnit)
  if (
    !astronomicalUnit
    || !astronomicalUnitRecord
    || astronomicalUnitRecord.visualizationState !== 'available'
    || astronomicalUnitRecord.assetSha256 !== `sha256:${astronomicalUnitAssetSha256}`
    || (astronomicalUnit.resourceLinks ?? []).some((link: JsonRecord) => link.type === 'goal-visualization')
  ) throw new Error('Astronomical-unit visualization before/unlink state drifted')
  resetMissingVisualizationRecord(astronomicalUnitRecord, astronomicalUnit)

  for (const goalId of [ids.solarRadius, ids.solarRotation, ids.orbitalMass, ids.binaryGwMass]) {
    const goal = goalById.get(goalId)
    const record = byId.get(goalId)
    if (
      !goal
      || !record
      || record.visualizationState !== 'missing'
      || record.missingReason !== 'deferred_provider_limitation'
      || record.assetSha256 !== ''
    ) throw new Error(`${goalId}: expected retained deferred visualization state`)
    resetMissingVisualizationRecord(record, goal)
  }
  for (const childId of childIds) {
    const goal = goalById.get(childId)
    if (!goal || byId.has(childId) || (goal.resourceLinks ?? []).length !== 0) {
      throw new Error(`Unexpected Batch-023 child visualization state ${childId}`)
    }
    byId.set(childId, {
      goalId: childId,
      title: goal.title,
      description: goal.description,
      subject: 'physik',
      landscapeId: physicsLandscapeId,
      landscapePath: paths.canonical,
      visualizationState: 'missing',
      missingReason: 'deferred_provider_limitation',
      imageUrl: '',
      publicAssetPath: '',
      canonicalAssetPath: '',
      assetSha256: '',
      umlautsCorrectChatGpt: 'no',
      contentApprovedChatGpt: 'no',
      humanApproved: 'no',
      humanIssueIdentified: 'no',
      humanIssueDescription: '',
      chatGptReviewedAt: null,
      chatGptReviewer: '',
      chatGptNotes: '',
      humanReviewedAt: null,
      humanReviewer: '',
    })
  }
  qa.records = [...byId.values()].sort((left, right) => (
    String(left.title).localeCompare(String(right.title), 'de-DE', { numeric: true, sensitivity: 'base' })
    || (String(left.goalId) < String(right.goalId) ? -1 : String(left.goalId) > String(right.goalId) ? 1 : 0)
  ))
  if (qa.records.length !== 483) throw new Error(`Unexpected post-Batch-023 visualization-QA count ${qa.records.length}`)
  return qa
}

function buildVisualizationReview(canonical: JsonRecord): string {
  const byId = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const rows = [
    ids.astronomicalUnit,
    ids.solarRadius,
    ids.solarRotation,
    ids.orbitalMass,
    ids.binaryGwMass,
    ...childIds,
  ].map((goalId) => {
    const goal = byId.get(goalId)
    if (!goal) throw new Error(`Missing Batch-083 review goal ${goalId}`)
    const note = goalId === ids.astronomicalUnit
      ? 'Das vorhandene Nano-Banana-Pro-Bild kennzeichnet einen geometrischen Näherungsweg als „exakt“ und trennt ihn nicht von der heutigen exakten Definition der AE. Der Primary-Link wird daher fail-closed entfernt; Bild und Prompt bleiben als Provenienz byte-identisch und dürfen nur nach einem gezielten neuen Nano-Banana-Pro-Lauf wieder aktiviert werden.'
      : childIds.includes(goalId as typeof childIds[number])
        ? 'Neues Strukturkind ohne Ersatzbild; spätere Visualisierung ausschließlich durch einen gezielten, fachlich geprüften Nano-Banana-Pro-Lauf.'
        : 'Beschreibung beziehungsweise Struktur wurde fachlich geändert; es bleibt beim bereits fehlenden, auf Nano Banana Pro wartenden Visualzustand.'
    return `| \`${goalId}\` | ${goal.title} | \`deferred_provider_limitation\` | ${note} |`
  }).join('\n')
  return `# Physik goal visualization review – Batch 083

Review date: 2026-08-28

Scope: Fail-closed visual handling for the bounded Batch-023 astrophysics
adjudication. No image or prompt bytes are changed, deleted, regenerated, or
replaced. In particular, the existing Google Gemini / Nano Banana Pro asset for
the astronomical unit remains in both canonical and public asset storage as
generation provenance, but its primary canonical resource link is removed
because the image labels an approximate reconstruction as exact and does not
separate that reconstruction from the exact modern definition.

The four other changed existing goals and both new children remain
\`deferred_provider_limitation\`. No hand-authored, programmatic, self-generated,
or substitute-provider image is introduced. Only a later targeted Nano Banana
Pro correction with a separate content review may reactivate the astronomical-
unit image binding or provide child-specific visuals. Human-review fields remain
unchanged and open.

| Goal ID | Goal title | Decision | Notes |
|---|---|---|---|
${rows}

## Byte and provider boundary

- The complete canonical and public Physics visualization trees remain
  byte-identical to the bound Batch-023 before-state.
- The astronomical-unit JPG retains SHA-256
  \`sha256:${astronomicalUnitAssetSha256}\`; its historical prompt retains
  SHA-256 \`sha256:${astronomicalUnitPromptSha256}\`.
- The two new children have no resource link and no canonical or public asset.
- Existing Nano Banana Pro material is not replaced merely because a local
  fallback would be easier to produce.
`
}

function buildPhysicsInputTest(): string {
  let source = readFileSync(absolute(paths.physicsInputTest), 'utf8')
  source = replaceOnceOrAfter(
    source,
    `  '${ids.binaryGwMass}',
  '${ids.gwGeneration}',`,
    `  '${ids.opticalDynamicalMass}',
  '${ids.gwChirpMass}',
  '${ids.gwGeneration}',`,
    'Physics input test Batch-023 structural atomic IDs',
  )
  source = replaceOnceOrAfter(
    source,
    `  '${ids.binaryGwCluster}',
  '2bc068de-5d2b-5f94-bd51-755982befb6f',`,
    `  '${ids.binaryGwCluster}',
  '${ids.binaryGwMass}',
  '2bc068de-5d2b-5f94-bd51-755982befb6f',`,
    'Physics input test Batch-023 structural cluster ID',
  )
  source = replaceOnceOrAfter(
    source,
    `  curricularAtomic: 459,
  curricularArea: 100,
  practiceAssessment: 133,
  programStructure: 1,
  memory: 5,
  runtimeSupport: 4,
  orientation: 1,
  total: 703,`,
    `  curricularAtomic: 460,
  curricularArea: 101,
  practiceAssessment: 133,
  programStructure: 1,
  memory: 5,
  runtimeSupport: 4,
  orientation: 1,
  total: 705,`,
    'Physics input test post-Batch-023 semantic counts',
  )
  return source
}

function buildPhysicsSourceManifest(): JsonRecord {
  const manifest = readJson(paths.physicsSourceManifest)
  if (manifest.expectedCurricularAtomicGoalCount !== 459) {
    throw new Error(`Unexpected Physics source-manifest denominator ${String(manifest.expectedCurricularAtomicGoalCount)}`)
  }
  manifest.expectedCurricularAtomicGoalCount = 460
  return manifest
}

function changedPlannedFiles(files: PlannedFile[]): PlannedFile[] {
  return files.filter(({ path, bytes }) => !existsSync(absolute(path)) || readFileSync(absolute(path), 'utf8') !== bytes)
}

function assertOutputBoundary(files: PlannedFile[]): void {
  const expected = new Set<string>([
    paths.canonical,
    paths.semanticKinds,
    paths.atomicity,
    paths.memory,
    paths.byGenerator,
    paths.byMapping,
    paths.provenance,
    paths.visualizationQa,
    paths.visualizationReview,
    paths.physicsInputTest,
    paths.physicsSourceManifest,
  ])
  const actual = new Set(files.map((file) => file.path))
  if (
    files.length !== actual.size
    || actual.size !== expected.size
    || [...actual].some((path) => !expected.has(path))
  ) throw new Error('Batch-023 planned outputs escaped the exact 11-file boundary')
}

function assertAppendOnlyStates(files: PlannedFile[]): void {
  for (const { path, bytes, appendOnly } of files) {
    if (!appendOnly || !existsSync(absolute(path))) continue
    if (readFileSync(absolute(path), 'utf8') !== bytes) {
      throw new Error(`Refusing to overwrite append-only Batch-023 artifact ${path}`)
    }
  }
}

type BoundedPlan = {
  semanticKinds: JsonRecord
  visualizationReview: string
  plannedFiles: PlannedFile[]
}

function buildExactBeforePlan(adjudication: JsonRecord): BoundedPlan {
  const currentCanonical = readJson(paths.canonical)
  const canonical = buildCanonical(adjudication)
  assertExactFollowUpFingerprintDelta(currentCanonical, canonical)
  const semanticKinds = buildSemanticKinds(canonical)
  const atomicity = buildReviewLedger(canonical, semanticKinds, 'atomicity')
  const memory = buildReviewLedger(canonical, semanticKinds, 'memory')
  const byGenerator = buildByGenerator()
  assertGeneratedTypeScriptSyntax(paths.byGenerator, byGenerator)
  const generatorOutputs = reproduceByGenerator(byGenerator)
  const byMapping = validateGeneratedByOutputs(generatorOutputs)
  const provenance = buildProvenance(byMapping)
  const visualizationQa = buildVisualizationQa(canonical)
  const visualizationReview = buildVisualizationReview(canonical)
  const physicsInputTest = buildPhysicsInputTest()
  const physicsSourceManifest = buildPhysicsSourceManifest()
  assertGeneratedTypeScriptSyntax(paths.physicsInputTest, physicsInputTest)
  return {
    semanticKinds,
    visualizationReview,
    plannedFiles: [
      { path: paths.canonical, bytes: serializeJson(canonical) },
      { path: paths.semanticKinds, bytes: serializeJson(semanticKinds) },
      { path: paths.atomicity, bytes: serializeJsonl(atomicity) },
      { path: paths.memory, bytes: serializeJsonl(memory) },
      { path: paths.byGenerator, bytes: byGenerator },
      { path: paths.byMapping, bytes: generatorOutputs.mapping },
      { path: paths.provenance, bytes: serializeJson(provenance) },
      { path: paths.visualizationQa, bytes: serializeJson(visualizationQa) },
      { path: paths.visualizationReview, bytes: visualizationReview, appendOnly: true },
      { path: paths.physicsInputTest, bytes: physicsInputTest },
      { path: paths.physicsSourceManifest, bytes: serializeJson(physicsSourceManifest) },
    ],
  }
}

function loadMaterializedPlan(state: Exclude<BoundedState, 'exact-before'>): BoundedPlan {
  const orderedPaths = [
    paths.canonical,
    paths.semanticKinds,
    paths.atomicity,
    paths.memory,
    paths.byGenerator,
    paths.byMapping,
    paths.provenance,
    paths.visualizationQa,
    paths.visualizationReview,
    paths.physicsInputTest,
    paths.physicsSourceManifest,
  ]
  const plannedFiles = orderedPaths.map((path) => ({
    path,
    bytes: readFileSync(absolute(path), 'utf8'),
    ...(path === paths.visualizationReview ? { appendOnly: true } : {}),
  }))
  const canonical = readJson(paths.canonical)
  const semanticKinds = readJson(paths.semanticKinds)
  const qa = readJson(paths.visualizationQa)
  const expectedQaRecordCount = state === 'exact-archived-follow-up' ? 482 : 483
  if (
    canonical.goals?.length !== 705
    || semanticKinds.counts?.curricularAtomic !== 460
    || semanticKinds.counts?.curricularArea !== 101
    || semanticKinds.counts?.total !== 705
    || qa.records?.length !== expectedQaRecordCount
  ) throw new Error('Exact-after Physics semantic or visualization counts are inconsistent')
  return {
    semanticKinds,
    visualizationReview: readFileSync(absolute(paths.visualizationReview), 'utf8'),
    plannedFiles,
  }
}

function assertExactAfterBindings(files: PlannedFile[], state: BoundedState): void {
  const bindings = state === 'exact-archived-follow-up'
    ? expectedArchivedFollowUpHashes
    : expectedAfterHashes
  if (Object.values(bindings).some((value) => value === 'PENDING')) return
  if (files.length !== Object.keys(bindings).length) {
    throw new Error('Batch-023 exact-after binding count drifted')
  }
  for (const { path, bytes } of files) {
    const expected = bindings[path]
    if (!expected || sha256(bytes) !== expected) {
      throw new Error(`Batch-023 planned after-state drift for ${path}: ${sha256(bytes)} != ${String(expected)}`)
    }
  }
}

const boundedState = classifyBoundedState()
assertProtectedUnchangedState(boundedState)
const adjudication = loadAdjudication()
const plan = boundedState === 'exact-before'
  ? buildExactBeforePlan(adjudication)
  : loadMaterializedPlan(boundedState)
const { semanticKinds, visualizationReview, plannedFiles } = plan
assertOutputBoundary(plannedFiles)
assertAppendOnlyStates(plannedFiles)
assertExactAfterBindings(plannedFiles, boundedState)

// For the separately archived final state, compute the historical structural
// digest from its original exact-after bindings. Current bytes are still
// validated above against the distinct Batch-084 follow-up bindings.
const structuralPlannedOutputBindings = plannedFiles.map(({ path, bytes, appendOnly }) => ({
  path,
  sha256: boundedState === 'exact-archived-follow-up'
    ? expectedAfterHashes[path]
    : sha256(bytes),
  appendOnly: appendOnly === true,
}))
if (structuralPlannedOutputBindings.some(({ sha256: binding }) => !binding)) {
  throw new Error('Historical Batch-023 structural output binding is incomplete')
}

const boundedPlanSha256 = sha256(stableJson({
  adjudicationSha256: expectedAdjudicationSha256,
  followUpConfigSha256: expectedFollowUpConfigSha256,
  exactBeforeHashes: expectedBeforeHashes,
  protectedFileHashes,
  protectedVisualizationTrees: expectedVisualizationTrees,
  keepIds,
  revisedIds,
  splitParentId: ids.binaryGwMass,
  childIds,
  requiredFollowUpGoalIds,
  exactByTargetGoalIds,
  byMappingRationale,
  atomicityReasons,
  memoryReasons,
  visualizationReviewSha256: sha256(visualizationReview),
  plannedOutputBindings: structuralPlannedOutputBindings,
}))
if (expectedBoundedPlanSha256 !== 'PENDING' && boundedPlanSha256 !== expectedBoundedPlanSha256) {
  throw new Error(`Batch-023 bounded plan drift: ${boundedPlanSha256} != ${expectedBoundedPlanSha256}`)
}

const changed = changedPlannedFiles(plannedFiles)
if (checkMode && changed.length > 0) {
  throw new Error(`Batch-023 is not applied; ${changed.length} planned files differ`)
}

if (writeMode && boundedState === 'exact-archived-follow-up') {
  throw new Error('Refusing to reinterpret or replay the historical Batch-023 write after Batch-084 archival')
}

if (writeMode) {
  if (expectedBoundedPlanSha256 === 'PENDING') {
    throw new Error(`Refusing --write until expectedBoundedPlanSha256 is independently bound to ${boundedPlanSha256}`)
  }
  if (Object.values(expectedAfterHashes).some((value) => value === 'PENDING')) {
    throw new Error('Refusing --write until every exact after-state hash is independently bound')
  }
  execFileSync('node', ['scripts/check_openai_plugin_review_freeze.mjs'], {
    cwd: repoRoot,
    stdio: 'inherit',
  })
  for (const { path, bytes, appendOnly } of changed) {
    mkdirSync(dirname(absolute(path)), { recursive: true })
    if (appendOnly) writeFileSync(absolute(path), bytes, { flag: 'wx' })
    else writeFileSync(absolute(path), bytes)
  }
  for (const { path, bytes } of plannedFiles) assertSha256(path, sha256(bytes), 'Batch-023 written output')
  assertProtectedUnchangedState(boundedState)
}

const status = writeMode ? 'WRITE' : changed.length === 0 ? 'PASS' : 'PLAN'
console.log(
  `CHECK apply_physics_batch023_astrophysics_adjudication ${status} `
  + `state=${boundedState} keep=11 revisions=4 splitParents=1 children=2 followUp=6 `
  + `sourceGoals=BY301 mappings=BY1009 HH=byte-identical views=4-byte-identical assessments=unchanged `
  + `curricularAtomic=${semanticKinds.counts.curricularAtomic} curricularArea=${semanticKinds.counts.curricularArea} `
  + `plannedWrites=${changed.length} files=${changed.map(({ path }) => basename(path)).join(',') || '-'}`,
)
console.log(`BOUNDED_PLAN_SHA256 ${boundedPlanSha256} binding=${expectedBoundedPlanSha256}`)
console.log(`OUTPUT_HASHES ${JSON.stringify(Object.fromEntries(plannedFiles.map(({ path, bytes }) => [path, sha256(bytes)])))}`)
console.log(
  boundedState === 'exact-archived-follow-up'
    ? `ARCHIVE_FOLLOW_UP_SHA256 ${expectedArchivedFollowUp.planSha256} checker=${expectedArchivedFollowUp.scriptSha256}`
    : 'ARCHIVE_FOLLOW_UP_SHA256 not-applied',
)
console.log(
  boundedState === 'exact-archived-follow-up'
    ? 'PRESERVE source-extraction=all hh=all views=4 closure-membership=all assessments=all assets-prompts=archive-byte-identical'
    : 'PRESERVE source-extraction=all hh=all views=4 closure-membership=all assessments=all assets-prompts=all',
)
console.log(
  boundedState === 'exact-archived-follow-up'
    ? 'DEFER astronomical-unit=unlinked-incompatible-nbp-provenance-archived child-visualizations=2 provider=Google-Gemini-Nano-Banana-Pro no-substitute-assets'
    : 'DEFER astronomical-unit=unlinked-incompatible-nbp-provenance-retained child-visualizations=2 provider=Google-Gemini-Nano-Banana-Pro no-substitute-assets',
)
