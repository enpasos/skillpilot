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
import { basename, dirname, resolve } from 'node:path'
import * as ts from 'typescript'

// The bounded curriculum ledgers predate a shared TypeScript schema and are
// checked field by field below.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonRecord = Record<string, any>
type PlannedFile = { path: string; bytes: string; appendOnly?: boolean }
type MappingAdjudication = {
  canonicalGoalIds: string[]
  matchTypes: Array<'exact' | 'partial'>
  rationale: string
}

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
const allowedArguments = new Set(['--write', '--check'])
const unexpectedArguments = process.argv.slice(2).filter((argument) => !allowedArguments.has(argument))
if (unexpectedArguments.length > 0) throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)
if (writeMode && checkMode) throw new Error('Use either --write or --check, not both')

const reviewedAt = '2026-08-28'
const reviewer = 'codex-physics-batch-022-astrophysics-structural-adjudication-2026-08-28'
const visualizationReviewedAt = '2026-08-28T22:00:00.000Z'
const visualizationReviewer = 'codex-physics-batch022-visual-compatibility-2026-08-28'
const physicsLandscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const bySourceLandscapeId = '42c2f7e3-91b4-5de8-bef0-d563440e9d52'
const hhSourceLandscapeId = 'b400d5b6-7b13-4a64-881d-7416dcf01785'
const expectedAdjudicationSha256 = '2515d1f450ec081d16e4a52d1d005c4f6b7f288dd387f04392671ff1b1d16694'
const expectedFollowUpConfigSha256 = '99ed9371f12a8642eea49e1eb3e5fcdcae183635eb36bf1e1f6bb309f1f323dc'

// Rebound only after independent review of the complete no-write plan that
// expands every curricular-area reference in the four Bavaria views.
const expectedBoundedPlanSha256: string = '4a6410355bff3e5cbb96e0c3cfc912b384725805e312fde7f612570a365e2dbc'

const ids = {
  worldview: '6d18104b-5704-5c45-b39a-2c84565b1796',
  solarSystemClassification: '982df2f3-e040-5f4b-b668-0fe05d994b29',
  nightSky: '2bc068de-5d2b-5f94-bd51-755982befb6f',
  astronomicalUnit: '5cf160e5-e0c2-5552-b2cf-0f04871c5e7e',
  solarObservations: '94a3a80e-f1de-51a2-b834-1e3431c5d3ca',
  astrometry: '9f85de48-1b3f-5afb-8a34-ce94cf7a1b49',
  radialVelocity: 'ce037050-f94c-5828-883a-76385c84d1f7',
  spectralClassification: '5c5d6698-c056-5850-8ecd-6dd87fb44549',
  fraunhofer: 'f9c025ce-4327-5de7-8288-a3358e14a576',
  stellarTemperature: '89124b92-5769-5e13-8a5d-78497936260f',
  radiationEquilibrium: 'a5031dfc-6d25-5a04-850a-5c7d8a254c21',
  planetaryVisibility: '0a172021-dfd9-5926-b92c-c01a9dfe9aa8',
  solarActivity: '4e823349-b60c-5d2a-b96f-d3f23ae50e3a',
  galaxyDistances: '61e84097-57b9-5434-9909-8ed8368a7823',
  telescopeMilkyWay: '826af579-3e51-5ac9-bc2a-208d8a2fc99e',
  binaryGwMass: '4ea39b40-1563-58ab-8d54-5fc20efa5365',
  gwGeneration: '09995ab9-86aa-5b02-8a58-62b16a37831d',
  exoplanets: 'e2014db8-c97f-5ce1-82c5-2a42741f4a61',
  cosmologyQuestions: '6ae54ff9-dc3b-563b-b2ee-09a0f0d00162',
  darkMatter: 'f203a552-fcf0-560c-baa2-47d4eb2379c8',
  astrophysicsCluster: 'b59cb1ef-05c2-5b09-abb3-8b6903ca0fd6',
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
  bySolarCompetency: '1292f05c-47da-5e95-a706-8f456b507d50',
  bySolarRadiusContent: 'b76d014a-487a-5342-8b68-00cd04f1f58f',
  bySolarMassContent: '2b355258-f7d4-5d20-80c5-3c7305527213',
  bySolarLuminosityContent: '584d940e-d7da-5e57-863c-737956230cb8',
  bySolarRotationContent: '212e1afe-722c-59c5-8305-716e2cab9775',
  bySolarTemperatureContent: '488f9749-e2f9-5c62-85e5-d09f237e748c',
} as const

const keepIds = [
  ids.worldview,
  ids.solarSystemClassification,
  ids.astrometry,
  ids.radialVelocity,
  ids.spectralClassification,
  ids.fraunhofer,
  ids.stellarTemperature,
  ids.solarActivity,
  ids.telescopeMilkyWay,
  ids.gwGeneration,
  ids.exoplanets,
  ids.cosmologyQuestions,
] as const

const revisedIds = [ids.astronomicalUnit, ids.radiationEquilibrium, ids.binaryGwMass] as const
const splitParentIds = [
  ids.nightSky,
  ids.solarObservations,
  ids.planetaryVisibility,
  ids.galaxyDistances,
  ids.darkMatter,
] as const
const childIds = [
  ids.nightSkyNavigation,
  ids.objectClassification,
  ids.spatiotemporalVisibility,
  ids.solarRadius,
  ids.solarMass,
  ids.solarLuminosity,
  ids.solarRotation,
  ids.planetaryConfigurations,
  ids.planetaryLoops,
  ids.galaxyDistanceMethods,
  ids.hubbleAge,
  ids.orbitalMass,
  ids.darkMatterCurves,
] as const
const compositionSubtreeGoalIds = [
  'e07f36de-2819-59f8-a707-fa25b4633ed3',
  'a7bec355-48c5-5107-bfab-d6956f9c9205',
  '7c8f1e34-d81a-51a2-8aa0-a6ee8e1b03a4',
  ...splitParentIds,
] as const
const requiredFollowUpGoalIds = [...revisedIds, ...childIds] as const
const officialSolarContentIds = [
  ids.bySolarRadiusContent,
  ids.bySolarMassContent,
  ids.bySolarLuminosityContent,
  ids.bySolarRotationContent,
  ids.bySolarTemperatureContent,
] as const

const visualParentIds = [...splitParentIds] as const
const revisedVisualIds = [ids.astronomicalUnit, ids.radiationEquilibrium] as const
const existingVisualGoalIds = [...visualParentIds, ...revisedVisualIds] as const

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl',
  byGenerator: 'app/scripts/generateByPhysicsSourceExtraction.ts',
  hhGenerator: 'app/scripts/generateHhPhysicsSourceExtraction.ts',
  bySourceExtraction:
    'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/'
    + 'DE_BY_PHYSIK_GYMNASIUM_LEHRPLANPLUS.source-extraction.json',
  hhSourceExtraction:
    'curricula/DE/Gymnasium/input/HH/upper-secondary/source-extraction/'
    + 'DE_HH_PHYSIK_SEKII_BILDUNGSPLAN_2022.source-extraction.json',
  byMapping:
    'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/'
    + 'bavaria_physics_source_extraction_to_canonical_physics.review.json',
  hhMapping:
    'curricula/DE/Gymnasium/mapping/DE-HH/upper-secondary/'
    + 'hh_physics_upper_secondary_source_extraction_to_canonical_physics.review.json',
  provenance: 'curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json',
  sourceGoalClosure: 'curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json',
  sourceGoalMembership: 'curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json',
  visualizationReview: 'curricula/DE/Gymnasium/quality/goal-visualization-review/physik-batch-082.md',
  physicsInputTest: 'app/scripts/testPhysicsGoalBookInputs.ts',
  physicsSourceManifest: 'app/scripts/config/goal-books/de-gym-physics-national-atlas.sources.json',
  adjudication:
    'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-28/'
    + 'batch-022-astrophysics-current-20-v1/third-adjudication/adjudication.json',
  followUpConfig:
    'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-28/'
    + 'batch-023-astrophysics-structural-follow-up-16-v1.config.json',
  compositionRoot: 'curricula/DE/Gymnasium/composition-views/physik',
  byStructuredSource: 'curricula/DE/Gymnasium/input/BY/gymnasium/Physik.json',
  byLegacyMapping:
    'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_physics_to_canonical_physics.json',
  hhSourcePdf: 'curricula/DE/Gymnasium/input/HH/physik-gyo-2022-data.pdf',
  sourceLandscapeRegistry: 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json',
  hhReadme: 'curricula/DE/Gymnasium/mapping/DE-HH/upper-secondary/PHYSIK.md',
} as const

const compositionViewPaths = [
  `${paths.compositionRoot}/de-by-gk.view.json`,
  `${paths.compositionRoot}/de-by-lk.view.json`,
  `${paths.compositionRoot}/de-by-sekii-gk.view.json`,
  `${paths.compositionRoot}/de-by-sekii-lk.view.json`,
] as const
const shTemplateViewPaths = [
  `${paths.compositionRoot}/de-sh-gk.view.json`,
  `${paths.compositionRoot}/de-sh-lk.view.json`,
  `${paths.compositionRoot}/de-sh-sekii-gk.view.json`,
  `${paths.compositionRoot}/de-sh-sekii-lk.view.json`,
] as const
const hhGeneratedViewPaths = [
  `${paths.compositionRoot}/de-hh-gk.view.json`,
  `${paths.compositionRoot}/de-hh-lk.view.json`,
  `${paths.compositionRoot}/de-hh-sekii-gk.view.json`,
  `${paths.compositionRoot}/de-hh-sekii-lk.view.json`,
] as const

const expectedBeforeHashes: Record<string, string> = {
  [paths.canonical]: 'f3a1912bb912badd3ff676f405b301f4461b30f48ed2f3ea95747a54bcd36152',
  [paths.semanticKinds]: 'b99db8f63d525689db76efedc8df839168e4dbd1c7c53557dffe79bf623897f2',
  [paths.atomicity]: '16d39276ff5a7b55f95d445284b2dfb0cff4f2e2aaa33f074f748e39309dbbb2',
  [paths.memory]: '4eb3b44cacd57b8c6de479de216921c09710c3ebe70acc06870e459d534bc13c',
  [paths.byGenerator]: '93b4a9cb161e1cfb8eb1c5f6009bac3c621be7857c34db6173810a3d22d02e24',
  [paths.hhGenerator]: '860a8f62fe64b1d262393675e77224570f4e9ad8a211ac5958ea2377b64aa96a',
  [paths.bySourceExtraction]: 'a51e264731060ce2a45ed195e5d3855414ebd84cdfbf4cf4766659bffd6966c1',
  [paths.hhSourceExtraction]: 'bdf230c0341a8e72dce882d603d979715708031c79511d5b12eb0ecbea44b426',
  [paths.byMapping]: '033377827c9a90c112da45c568496d3259ae78e7cbcf476da1440d43ac7e8789',
  [paths.hhMapping]: 'a351e0216cb53ad9d357cd75d8709842186835b873aa8c7b1574fcbc631b1798',
  [paths.provenance]: '670aefd89b442e7f620db527a4c4957595fc42323db3ab9683c27f55bbe58c9f',
  [paths.sourceGoalClosure]: '66f7d5ce4887f3f7365fcc71c05735a696432f836654d822b653357f243cd720',
  [paths.sourceGoalMembership]: '87fd61377f153ad3c455fd6bc89d7def21af35190ecb5c597ca6480b1abad6e5',
  [paths.visualizationQa]: '47f3fbd00c7ac59dceb60576816545e76a0e2a6173f0c256be9b3b4cd6e2d685',
  [paths.physicsInputTest]: '8e7b317dd7abcd9adb56e10608847335649f8713010f73965ffa10cb51389984',
  [paths.physicsSourceManifest]: '3fffba4b31ee67444977827a8b379bc11fd2690eb225ac6c60440d542090fe2f',
  [compositionViewPaths[0]]: '8800c783e2169fc54360df6a57c52634fe1d218e2f2c18d578cdd36dc079db01',
  [compositionViewPaths[1]]: '90b99937b768c0d41f9759ed9624c09d99a277ac90df45e29b0e5f70dcbe9645',
  [compositionViewPaths[2]]: '5f1c9624d2bc64420b30aa9aba92a007234fee6e0ddbbcc7d907cf63726e2d17',
  [compositionViewPaths[3]]: 'a15c3c3fa8001e2987732324a8c19b97110483589854be1e0c29c9ac3f5c93db',
}

// Exact approved materialized bytes. These are deliberately independent of
// expectedBeforeHashes so a partially applied or otherwise mixed state can
// match neither state and must fail closed.
const expectedAfterHashes: Record<string, string> = {
  [paths.canonical]: '48820560030f203c106c5db2006771604e097a3d3b90188728bc1bb199424e4a',
  [paths.semanticKinds]: '5763011fd8df360fdaf7a94839720bb825612a40042e45ee862324d53ea8a86c',
  [paths.atomicity]: 'dfed601c05daedb040abe703b6ffe8ddf662b71ed4d332b9463d142f9ad75425',
  [paths.memory]: 'a455260e24a683767768facb7354140d6221921ff42c9f0eb44c11e718ff20f9',
  [paths.byGenerator]: '8c61a88801219f0995af2cd2c1ac520c554832d32cd44031e2ca460b10a4f2b1',
  [paths.hhGenerator]: '77e7355989a3e4b163002d2d3a24d4da4c7ff636676c1be85fcf22a79dbc890d',
  [paths.bySourceExtraction]: 'c8d655fc7ce812b9e4eebe23fe35d96af388871d9dd80dec9a7848e30d50fa17',
  [paths.hhSourceExtraction]: 'bdf230c0341a8e72dce882d603d979715708031c79511d5b12eb0ecbea44b426',
  [paths.byMapping]: '34b4d40e3567e7fb41918c14f359bb014e865da35da142a311343d26e80ae2aa',
  [paths.hhMapping]: 'a6ab9c9d7ba671c5fed0e4ce8c1865960afb11bd56c870a94817946226585a00',
  [paths.provenance]: '3a977244372ae01ff3f6b0f1af090dbe96eeda0df14f0e1013732690bd6ff560',
  [paths.sourceGoalClosure]: '4c7f12410397dece9aa58b498a531f06fe7edc9a7edac707a834088be6181144',
  [paths.sourceGoalMembership]: 'b3fa299f332be9aec1d15b535187a13ef16fabde9cdc3911f7ff4122375a37a6',
  [paths.visualizationQa]: '72477cba37e2a42af4e30470ac7d448660cc3c3c14b045c72c0b47e4c7db3478',
  [paths.visualizationReview]: 'a025b7609af5c6b7cdf866ec82fd1211ca07ba90442cef553f6da5419ccdd477',
  [paths.physicsInputTest]: 'e43b731667e1e7a46af65ef06e0728ded7161c861ec0ba87f7b2e3c899c0a3e9',
  [paths.physicsSourceManifest]: '148bdc26907d5c19c06227c0a1997c8ddc8a465b8942a2765aabd21c619b4a19',
  [compositionViewPaths[0]]: '2c80b1313671d86042cee38e612613cce43168a00bd85a01d4e2da536c1abecd',
  [compositionViewPaths[1]]: '24617b88dcd89b6f02162d0eaa082860a95d111a992ef4aa93600a9e41943556',
  [compositionViewPaths[2]]: '234c328e1314b31b5ece88049c8f7670087c6d7362dde4511f59349be552c40b',
  [compositionViewPaths[3]]: 'e9719874174ac96f4902f7e003e4e83a18cdd7bc9b4ab252b9b4eed70a0371b4',
}

const legacyAfterHashes: Record<string, string> = {
  ...expectedAfterHashes,
  [compositionViewPaths[0]]: '8800c783e2169fc54360df6a57c52634fe1d218e2f2c18d578cdd36dc079db01',
  [compositionViewPaths[1]]: '90b99937b768c0d41f9759ed9624c09d99a277ac90df45e29b0e5f70dcbe9645',
  [compositionViewPaths[2]]: '5f1c9624d2bc64420b30aa9aba92a007234fee6e0ddbbcc7d907cf63726e2d17',
  [compositionViewPaths[3]]: 'a15c3c3fa8001e2987732324a8c19b97110483589854be1e0c29c9ac3f5c93db',
}

const protectedGeneratorInputHashes: Record<string, string> = {
  [paths.byStructuredSource]: '6b49157703e7bad2685e09684d94248447da2f066a1c9cafc48bf11e758cbdfc',
  [paths.byLegacyMapping]: '9b3ffc11d81768326d19dac8691f1c04bdb9da6f4363624681e0d755c9a9c7fa',
  [paths.hhSourcePdf]: '3fe017388dd69f6b08167ed83e5c6de10296ddc9da4510865cd5bd11cb9e22ca',
  [paths.sourceLandscapeRegistry]: '1fde6c041437c060eac9ffed67ddbd4fe971e2160b0d94235989662f9c82a7e2',
  [shTemplateViewPaths[0]]: '6ba0a4ccff7263b21b8c2b18b51ce42811367ec86076a151f061c2bef4e715bc',
  [shTemplateViewPaths[1]]: 'faaf062c69f3ee38204ae4be91983e4065ec79920aff981ede53970b60c68b5b',
  [shTemplateViewPaths[2]]: '573a71ac153c3fcd1868eb7bbf8c5d3c915dff592039a55f3c23b468eefb8298',
  [shTemplateViewPaths[3]]: '4fecb66983ef717a9017e598989f789d24f535efb1a9a831eace1dc2bc474067',
}

const protectedAssetHashes: Record<string, string> = {
  [ids.nightSky]: 'd94f6d202d516181f9c1beee9acf00ca20ec798d0627dcaaadc160d6e12129b7',
  [ids.astronomicalUnit]: 'df281eca0a3fc705be47d0f32afc73eef5823baf1edcf988168d3db1b68a8bfd',
  [ids.solarObservations]: 'b3a5e8067fa261ac9f55e9309e79a9790e5762477fcc7d52283da8b0adde399f',
  [ids.radiationEquilibrium]: 'efc8ba716c4b7cec0d4915c2ae8812ace321383b0b52c04e7739855a0764e6d1',
  [ids.planetaryVisibility]: '8db3951f3b9132359c63d430e4114f9026937aad5d4dd2ef8ea5828d4be16c7b',
  [ids.galaxyDistances]: '850c2fe0910fceea8b7ce0d9535a4f3f35a9969f45048e6847a93eb069976319',
  [ids.darkMatter]: 'cc9846d8f6472e4e9680a22a83645d72e35c86757e732eb715820d26e0ef8b29',
}

const protectedPromptHashes: Record<string, string> = {
  [`curricula/DE/Gymnasium/visualizations/physik/${ids.nightSky}/prompt.de.md`]: '57c47ea5c75d115e36eefa48cffef2e279bf1503e091c45d4725f16dbae53c28',
  [`curricula/DE/Gymnasium/visualizations/physik/${ids.astronomicalUnit}/prompt.de.md`]: '07d5bbf8e6164b019721bb45bec7ca45dbef9f13a78b97a6976e2feb10560112',
  [`curricula/DE/Gymnasium/visualizations/physik/${ids.solarObservations}/prompt.de.md`]: '0449ff29be7caa10ae10425ad04741d2d9290f663d0a1a69117b139eeb4f8106',
  [`curricula/DE/Gymnasium/visualizations/physik/${ids.radiationEquilibrium}/prompt.de.md`]: 'a3c9f2fd53efbe768c004ddc63722b63ee7229b5ef4c10bb4091509a59b58f7f',
  [`curricula/DE/Gymnasium/visualizations/physik/${ids.radiationEquilibrium}/image-reconstruction-prompt.de.md`]: '45a5f80bcdcc55d076f3071be7cb2e62b510a4b697eaf16b5343b08115c30d26',
  [`curricula/DE/Gymnasium/visualizations/physik/${ids.planetaryVisibility}/prompt.de.md`]: '2f9f8edeb8aa3364b27d37c508535615bfda2761a181f56e97b090162eece957',
  [`curricula/DE/Gymnasium/visualizations/physik/${ids.galaxyDistances}/prompt.de.md`]: '64e19fe20a97eef043b41f494f340707952fd198c0d5d21ae6eed46b22eb776b',
  [`curricula/DE/Gymnasium/visualizations/physik/${ids.darkMatter}/prompt.de.md`]: '2b1ca7b5eab0b6095384c0c41a2b0033e7a436d63fe8203a6168fe4aea50007a',
}

const byMappingAdjudications: Record<string, MappingAdjudication> = {
  '7006a7a0-9f2e-5ea4-aa95-312ecd9db38e': {
    canonicalGoalIds: [
      ids.nightSkyNavigation,
      ids.objectClassification,
      ids.spatiotemporalVisibility,
      '2b700858-bc2e-5ddf-a791-b14d44160480',
      'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
    ],
    matchTypes: ['partial', 'partial', 'partial', 'partial', 'partial'],
    rationale: 'Batch-022-Fachreview: Ph13-GA-ASTRO.1.1 trägt getrennt die Navigation mit Sternkarte oder Software, die Klassifikation beobachtbarer Objekte und grundlegende räumlich-zeitliche Sichtbarkeitsaussagen. Die bereits passenden Beobachtungs- und Quellenkompetenzen bleiben erhalten; der frühere Sammelknoten entfällt.',
  },
  'a8775a10-9af9-586d-a90a-5ad3259bccac': {
    canonicalGoalIds: [
      ids.planetaryConfigurations,
      ids.planetaryLoops,
      ids.worldview,
      'c9405043-bdc0-5995-8b4d-5bb56d97d05d',
    ],
    matchTypes: ['partial', 'partial', 'partial', 'partial'],
    rationale: 'Batch-022-Fachreview: Der erste Satz von Ph13-GA-ASTRO.1.2 stützt Konstellationen und Sichtbarkeit, der zweite Schleifenbahnen und ihre historische Modell- und Weltbildbedeutung. Die vorhandenen Weltbild- und Kepler-Ziele bleiben erhalten.',
  },
  [ids.bySolarCompetency]: {
    canonicalGoalIds: [
      ids.solarRadius,
      ids.solarMass,
      ids.solarLuminosity,
      ids.solarRotation,
      ids.stellarTemperature,
      '2b700858-bc2e-5ddf-a791-b14d44160480',
    ],
    matchTypes: ['partial', 'partial', 'partial', 'partial', 'partial', 'partial'],
    rationale: 'Batch-022-Fachreview: Ph13-GA-ASTRO.3.1 trägt die beobachtungsbasierte Methoden- und Abschätzungskompetenz. Die amtliche Inhaltsliste des Lernbereichs 314021 begrenzt Zustandsgrößen propositionenscharf auf Radius, Masse, Leuchtkraft einschließlich Solarkonstante, Rotationsdauer und Oberflächentemperatur. Vier neue Kinder und das bestehende Temperaturziel bilden diese Größen ab; das Beobachtungsmethodenziel bleibt erhalten.',
  },
  [ids.bySolarRadiusContent]: {
    canonicalGoalIds: [ids.solarRadius],
    matchTypes: ['partial'],
    rationale: 'Batch-022-Inhaltsbeleg: Das amtliche officialContentItem Radius begrenzt zusammen mit Kompetenz 1292f05c die Zielgröße des Sonnenradius-Kindes; es wird nicht als eigenständige Kompetenz umgedeutet.',
  },
  [ids.bySolarMassContent]: {
    canonicalGoalIds: [ids.solarMass],
    matchTypes: ['partial'],
    rationale: 'Batch-022-Inhaltsbeleg: Das amtliche officialContentItem Masse begrenzt zusammen mit Kompetenz 1292f05c die Zielgröße des Sonnenmasse-Kindes; es wird nicht als eigenständige Kompetenz umgedeutet.',
  },
  [ids.bySolarLuminosityContent]: {
    canonicalGoalIds: [ids.solarLuminosity],
    matchTypes: ['partial'],
    rationale: 'Batch-022-Inhaltsbeleg: Das amtliche officialContentItem Leuchtkraft (auch Solarkonstante) begrenzt zusammen mit Kompetenz 1292f05c die Zielgröße des Leuchtkraft-Kindes; es wird nicht als eigenständige Kompetenz umgedeutet.',
  },
  [ids.bySolarRotationContent]: {
    canonicalGoalIds: [ids.solarRotation],
    matchTypes: ['partial'],
    rationale: 'Batch-022-Inhaltsbeleg: Das amtliche officialContentItem Rotationsdauer begrenzt zusammen mit Kompetenz 1292f05c die Zielgröße des Rotationsdauer-Kindes; es wird nicht als eigenständige Kompetenz umgedeutet.',
  },
  [ids.bySolarTemperatureContent]: {
    canonicalGoalIds: [ids.stellarTemperature],
    matchTypes: ['partial'],
    rationale: 'Batch-022-Inhaltsbeleg: Das amtliche officialContentItem Oberflächentemperatur begrenzt zusammen mit Kompetenz 1292f05c die Temperatur-Zielgröße. Es bindet das bereits vorhandene 89124b92 und erzeugt weder ein Doppelkind noch eine eigenständige Kompetenz.',
  },
  '9f0d2e0e-9bcf-5b30-9f78-af6374ca0a44': {
    canonicalGoalIds: [
      ids.orbitalMass,
      ids.darkMatterCurves,
      '14d99a65-8d58-5647-88ab-02137b96d55b',
      '5db07785-8cca-50d5-81a9-e0264d344af9',
    ],
    matchTypes: ['partial', 'partial', 'partial', 'partial'],
    rationale: 'Batch-022-Fachreview: Der erste Satz von Ph13-GA-ASTRO.5.2 trägt die gravitationsgestützte Massenabschätzung für Milchstraße und zentrales Schwarzes Loch; der zweite trägt den Dunkle-Materie-Schluss aus Rotationskurven. Die zwei bereits geprüften Grundlagenziele bleiben erhalten.',
  },
  '466996a2-112f-508c-9454-c59385ebda84': {
    canonicalGoalIds: [ids.galaxyDistanceMethods, 'db6b8de4-21e0-58e8-a347-2ae39f538f92'],
    matchTypes: ['partial', 'partial'],
    rationale: 'Batch-022-Fachreview: Ph13-GA-ASTRO.5.3 trägt ausschließlich Anwendung, Vergleich, Unsicherheit und Gültigkeitsgrenzen von Galaxien-Entfernungsverfahren. Der frühere Sammelknoten wird durch das Distanz-Kind ersetzt; das allgemeine Distanzziel bleibt erhalten.',
  },
  '6d7f80f4-e1ea-5de1-a826-09cc491de239': {
    canonicalGoalIds: [
      ids.hubbleAge,
      'e5b3d86c-0a74-5fa7-b9c4-7964bcb5ebc9',
      'aa0fa5fb-7bfb-5f9f-a606-3f7187cfb745',
    ],
    matchTypes: ['partial', 'partial', 'partial'],
    rationale: 'Batch-022-Fachreview: Ph13-GA-ASTRO.5.4 trägt die Hubble-Altersabschätzung und Aussagen zur Entwicklung des Universums. Der frühere Distanz-und-Alter-Sammelknoten wird durch das Hubble-Alter-Kind ersetzt; die vorhandenen Kosmologieziele bleiben erhalten.',
  },
}

const hhMappingAdjudications: Record<string, MappingAdjudication> = {
  'hh-physics-sekii-bp2022-4-2-134-94297a57': {
    canonicalGoalIds: [ids.spatiotemporalVisibility],
    matchTypes: ['partial'],
    rationale: 'Batch-022-Fachreview: Das Hamburger Ziel nennt die Sichtbarkeit von Sternbildern in Abhängigkeit von Uhrzeit und Jahreszeit. Es stützt das räumlich-zeitliche Sichtbarkeitskind teilweise, nicht aber Orientierung oder Objektklassifikation.',
  },
  'hh-physics-sekii-bp2022-4-2-135-07dea54b': {
    canonicalGoalIds: [ids.planetaryConfigurations],
    matchTypes: ['partial'],
    rationale: 'Batch-022-Fachreview: Das Hamburger Ziel zum Lauf von Sonne, Mond und Planeten am Himmel stützt das Konstellations- und Sichtbarkeitskind teilweise. Es enthält weder Schleifenbahnen noch deren historische Modellbedeutung.',
  },
}

const atomicityReasons: Record<string, string> = {
  [ids.astronomicalUnit]: 'Begriffliche Einordnung und Rekonstruktion einer beobachtungsbasierten Bestimmungsmethode bilden zwei notwendige Teile derselben Messgrößen-Erklärung.',
  [ids.radiationEquilibrium]: 'Gleichgewichtsansatz, Modellnäherung, Annahmenprüfung und begrenzte Habitabilitätsaussage sind Phasen eines einzigen Modellierungszyklus.',
  [ids.binaryGwMass]: 'Optische dynamische Systemmasse und gravitationswellenbasierter Massenparameter sind zwei bewusst verglichene Beobachtungswege derselben source-gebundenen Masseninferenzkompetenz.',
  [ids.nightSkyNavigation]: 'Ausrichtung eines Hilfsmittels und Auffinden von Himmelsobjekten sind Schritte genau einer Navigationsleistung für eine konkrete Beobachtungssituation.',
  [ids.objectClassification]: 'Merkmalsbeobachtung, Zuordnung und Begründung bilden genau eine Klassifikationsleistung.',
  [ids.spatiotemporalVisibility]: 'Ort, Uhrzeit und Jahreszeit sind gemeinsame Eingangsgrößen derselben Sichtbarkeitsbegründung.',
  [ids.solarRadius]: 'Winkeldurchmesser und Entfernung werden gemeinsam zu genau einer Zielgröße, dem Sonnenradius, ausgewertet.',
  [ids.solarMass]: 'Bahndaten, Newton-Kepler-Modell und Annahmenprüfung bilden eine einzige Sonnenmasseninferenz.',
  [ids.solarLuminosity]: 'Solarkonstante und Entfernung werden gemeinsam zu genau einer Zielgröße, der Sonnenleuchtkraft, ausgewertet.',
  [ids.solarRotation]: 'Zeitlich getrennte Bilder werden in einer einzigen Beobachtungsauswertung zur Rotationsdauer verbunden.',
  [ids.planetaryConfigurations]: 'Konstellationsmodell und daraus abgeleitete Sichtbarkeit sind zwei Schritte derselben Modellierungsleistung.',
  [ids.planetaryLoops]: 'Physikalische Erklärung der Schleifenbahn und historische Modellbedeutung sind am selben Phänomen gemeinsam zu reflektieren.',
  [ids.galaxyDistanceMethods]: 'Anwendung, Methodenvergleich, Unsicherheit und Gültigkeitsgrenze gehören zu einer einzigen Entfernungsverfahrensbeurteilung.',
  [ids.hubbleAge]: 'Berechnung eines Hubble-Alters und Begrenzung seiner Altersdeutung bilden eine einzige modellkritische Inferenz.',
  [ids.orbitalMass]: 'Bahngeschwindigkeit, Radius, Gravitationsmodell und Annahmenprüfung dienen genau einer eingeschlossenen Massenabschätzung.',
  [ids.darkMatterCurves]: 'Kurvenvergleich, Diskrepanz und begrenzte Dunkle-Materie-Deutung bilden eine einzige evidenzbezogene Schlussleistung.',
}

const memoryReasons: Record<string, string> = {
  [ids.astronomicalUnit]: 'Das Ziel verlangt die Rekonstruktion einer beobachtungsbasierten Methode; der Zahlenwert einer Astronomischen Einheit als Karte genügt nicht.',
  [ids.radiationEquilibrium]: 'Modellannahmen, Messwertabweichungen und begrenzte Aussagen müssen an einer neuen Situation reflektiert werden.',
  [ids.binaryGwMass]: 'Zwei Datentypen müssen mit verschiedenen Modellannahmen ausgewertet und in ihren Grenzen verglichen werden.',
  [ids.nightSkyNavigation]: 'Navigation ist eine orts- und zeitbezogene Anwendung einer Karte oder Software und keine isolierte Erinnerungsleistung.',
  [ids.objectClassification]: 'Unbekannte Beobachtungen müssen anhand von Merkmalen begründet klassifiziert werden; eine Klassenliste genügt nicht.',
  [ids.spatiotemporalVisibility]: 'Sichtbarkeit muss für wechselnde Orte und Zeiten räumlich-geometrisch begründet werden.',
  [ids.solarRadius]: 'Messdaten und Unsicherheit müssen in einer geometrischen Abschätzung zusammengeführt werden.',
  [ids.solarMass]: 'Bahndaten müssen unter expliziten Modellannahmen ausgewertet werden; Formelabruf allein reicht nicht.',
  [ids.solarLuminosity]: 'Bestrahlungsstärke und Gesamtleistung müssen an neuen Daten unterschieden und verknüpft werden.',
  [ids.solarRotation]: 'Eine Bildreihe muss ausgewertet und wiedererkennbare Struktur fachlich verfolgt werden.',
  [ids.planetaryConfigurations]: 'Konstellationen und Sichtbarkeit müssen in Zeichnung oder Simulation modelliert werden.',
  [ids.planetaryLoops]: 'Relative Bewegung und historische Modellbedeutung müssen kausal und kontextbezogen erklärt werden.',
  [ids.galaxyDistanceMethods]: 'Methodenwahl, Vergleich und Unsicherheitsurteil sind keine kompakte Erinnerungsleistung.',
  [ids.hubbleAge]: 'Die Rechnung muss mit Annahmen zur Expansionsgeschichte begrenzt gedeutet werden.',
  [ids.orbitalMass]: 'Neue Bahnparameter müssen in einem begründeten Gravitationsmodell invertiert werden.',
  [ids.darkMatterCurves]: 'Beobachtete und erwartete Kurven müssen verglichen und die Evidenzgrenze erläutert werden.',
}

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
const sortStrings = (values: string[]): string[] => [...values].sort((left, right) => left < right ? -1 : left > right ? 1 : 0)

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
  assertSha256(semanticKindFingerprintProfilePath, semanticKindFingerprintProfileSha256, 'Pinned semantic normal form')
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
const deterministicOfficialContentId = (url: string, span: string, text: string): string => (
  deterministicUuidStyle(`DE-BY-PHYSICS-OFFICIAL-CONTENT:${url}:${span}:${text}`)
)

const countGoalReferences = (value: unknown, goalId: string): number => {
  if (Array.isArray(value)) return value.reduce((sum, entry) => sum + countGoalReferences(entry, goalId), 0)
  if (!value || typeof value !== 'object') return 0
  const record = value as JsonRecord
  return (record.goalId === goalId ? 1 : 0)
    + Object.values(record).reduce((sum, entry) => sum + countGoalReferences(entry, goalId), 0)
}

function assertSha256(path: string, expected: string, label: string): void {
  if (!existsSync(absolute(path))) throw new Error(`${label}: missing ${path}`)
  const actual = sha256(readFileSync(absolute(path)))
  if (actual !== expected) throw new Error(`${label}: ${path} drifted (${actual} != ${expected})`)
}

type BoundedState = 'exact-before' | 'legacy-after-needs-view-expansion' | 'exact-after'

function classifyBoundedState(): BoundedState {
  const matches = (bindings: Record<string, string>): boolean => Object.entries(bindings)
    .every(([path, expected]) => existsSync(absolute(path)) && sha256(readFileSync(absolute(path))) === expected)
  const beforeMatches = matches(expectedBeforeHashes) && !existsSync(absolute(paths.visualizationReview))
  const legacyAfterMatches = matches(legacyAfterHashes)
  const afterMatches = matches(expectedAfterHashes)
  const matchCount = [beforeMatches, legacyAfterMatches, afterMatches].filter(Boolean).length
  if (matchCount !== 1) {
    const pathsToReport = [...new Set([
      ...Object.keys(expectedBeforeHashes),
      ...Object.keys(legacyAfterHashes),
      ...Object.keys(expectedAfterHashes),
    ])]
      .filter((path) => {
        if (!existsSync(absolute(path))) return true
        const actual = sha256(readFileSync(absolute(path)))
        return actual !== expectedBeforeHashes[path]
          && actual !== legacyAfterHashes[path]
          && actual !== expectedAfterHashes[path]
      })
    const mixedPaths = pathsToReport.length > 0
      ? pathsToReport.map((path) => `${path}=${existsSync(absolute(path)) ? sha256(readFileSync(absolute(path))) : 'missing'}`).join(',')
      : 'all bytes belong individually to a bound state, but the repository is mixed across states'
    throw new Error(`Batch-022 state is not one exact bound state: ${mixedPaths}`)
  }
  if (beforeMatches) return 'exact-before'
  if (legacyAfterMatches) return 'legacy-after-needs-view-expansion'
  return 'exact-after'
}

function assertImmutableProtectedInputs(): void {
  for (const [path, expected] of Object.entries(protectedGeneratorInputHashes)) {
    assertSha256(path, expected, 'Batch-022 protected generator input')
  }
  for (const [goalId, expected] of Object.entries(protectedAssetHashes)) {
    assertSha256(
      `curricula/DE/Gymnasium/visualizations/physik/${goalId}/${goalId}.jpg`,
      expected,
      'Protected canonical Nano Banana Pro asset',
    )
    assertSha256(
      `app/public/assets/goal-visualizations/physik/${goalId}/${goalId}.jpg`,
      expected,
      'Protected public Nano Banana Pro asset',
    )
  }
  for (const [path, expected] of Object.entries(protectedPromptHashes)) {
    assertSha256(path, expected, 'Protected historical visualization prompt')
  }
  for (const childId of childIds) {
    for (const directory of [
      `curricula/DE/Gymnasium/visualizations/physik/${childId}`,
      `app/public/assets/goal-visualizations/physik/${childId}`,
    ]) {
      if (existsSync(absolute(directory)) && readdirSync(absolute(directory)).length > 0) {
        throw new Error(`Batch-022 child ${childId} unexpectedly has visual files in ${directory}`)
      }
    }
  }
}

function loadAdjudication(): JsonRecord {
  assertSha256(paths.adjudication, expectedAdjudicationSha256, 'Batch-022 adjudication')
  assertSha256(paths.followUpConfig, expectedFollowUpConfigSha256, 'Batch-023 follow-up config')
  const adjudication = readJson(paths.adjudication)
  const followUpConfig = readJson(paths.followUpConfig)
  if (
    adjudication.schemaVersion !== 1
    || adjudication.subject !== 'physik'
    || adjudication.materialized !== false
    || adjudication.noProgressClaim !== true
    || adjudication.counts?.total !== 20
    || adjudication.counts?.keep_current !== 12
    || adjudication.counts?.accepted_revision !== 3
    || adjudication.counts?.structural_split !== 5
    || adjudication.counts?.newAtomicChildren !== 13
    || adjudication.counts?.curricularAtomicDenominatorBefore !== 451
    || adjudication.counts?.curricularAtomicDenominatorAfter !== 459
    || adjudication.counts?.bavariaMappingRowsAfter !== 1008
    || !same(adjudication.requiredFollowUpGoalIds, [...requiredFollowUpGoalIds])
    || !same(followUpConfig.goalIds, [...requiredFollowUpGoalIds])
    || followUpConfig.subject !== 'physik'
    || !Array.isArray(adjudication.decisions)
    || adjudication.decisions.length !== 20
  ) throw new Error('Unexpected Batch-022 adjudication or Batch-023 follow-up contract')

  const decisions = adjudication.decisions as JsonRecord[]
  const kept = decisions.filter((decision) => decision.resolutionDecision === 'keep_current')
    .map((decision) => String(decision.goalId))
  const revised = decisions.filter((decision) => decision.resolutionDecision === 'accepted_revision')
    .map((decision) => String(decision.goalId))
  const split = decisions.filter((decision) => decision.resolutionDecision === 'structural_split')
    .map((decision) => String(decision.goalId))
  const children = decisions.flatMap((decision) => decision.children ?? [])
  if (!same(kept, [...keepIds]) || !same(revised, [...revisedIds]) || !same(split, [...splitParentIds])) {
    throw new Error('Unexpected Batch-022 decision sets')
  }
  if (!same(children.map((child: JsonRecord) => child.goalId), [...childIds])) {
    throw new Error('Unexpected Batch-022 child order')
  }
  for (const child of children) {
    if (deterministicPhysicsGoalId(String(child.shortKey)) !== child.goalId) {
      throw new Error(`Deterministic Physics child ID mismatch for ${String(child.shortKey)}`)
    }
  }
  const official = adjudication.officialSolarContentEvidence
  if (
    official?.url !== 'https://www.lehrplanplus.bayern.de/fachlehrplan/lernbereich/314021'
    || official?.parentText !== 'Zustandsgrößen der Sonne: Radius, Masse, Leuchtkraft (auch Solarkonstante), Rotationsdauer, Oberflächentemperatur'
    || !Array.isArray(official?.contentItems)
    || !same(official.contentItems.map((item: JsonRecord) => item.sourceGoalId), [...officialSolarContentIds])
  ) throw new Error('Unexpected official solar content evidence contract')
  for (const item of official.contentItems as JsonRecord[]) {
    if (item.granularity !== 'officialContentItem') throw new Error('Solar content evidence was competency-distorted')
    if (deterministicOfficialContentId(official.url, item.sourceSpan, item.sourceText) !== item.sourceGoalId) {
      throw new Error(`Deterministic official content ID mismatch for ${item.sourceSpan}`)
    }
  }
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

function updateVisualizationLink(goal: JsonRecord): void {
  const links = (goal.resourceLinks ?? []).filter((link: JsonRecord) => link.type === 'goal-visualization')
  if (
    links.length !== 1
    || links[0].provider !== 'Google Gemini / Nano Banana Pro'
    || links[0].skillpilotId !== goal.id
  ) throw new Error(`${goal.id}: expected one retained Nano Banana Pro goal-visualization link`)
  Object.assign(links[0], {
    title: `Visualisierung: ${goal.title}`,
    description: `Visualisierung zum Lernziel: ${goal.title}.`,
    altText: `Didaktische Visualisierung zum Lernziel "${goal.title}". ${goal.description}`,
  })
}

function childTopicCode(shortKey: string): string {
  if (!shortKey.startsWith('canonical_physics_')) throw new Error(`Unexpected Physics child shortKey ${shortKey}`)
  return `CANONICAL_PHYSICS_${shortKey.slice('canonical_physics_'.length).toUpperCase()}`
}

function buildCanonical(adjudication: JsonRecord): JsonRecord {
  const canonical = readJson(paths.canonical)
  if (canonical.landscapeId !== physicsLandscapeId || !Array.isArray(canonical.goals)) {
    throw new Error('Unexpected canonical Physics landscape')
  }
  const goals = canonical.goals as JsonRecord[]
  const currentById = new Map(goals.map((goal) => [String(goal.id), structuredClone(goal)]))
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

  const protectedLinkIdentity = new Map<string, string>()
  for (const goalId of existingVisualGoalIds) {
    const link = (goal(goalId).resourceLinks ?? []).find((candidate: JsonRecord) => candidate.type === 'goal-visualization')
    protectedLinkIdentity.set(goalId, stableJson({
      url: link?.url,
      provider: link?.provider,
      assetSha256: protectedAssetHashes[goalId],
    }))
  }

  for (const goalId of revisedIds) {
    const decision = decisions.get(goalId)
    const current = goal(goalId)
    const before = structuredClone(current)
    const finalText = decision?.finalText
    if (decision?.resolutionDecision !== 'accepted_revision' || !finalText) {
      throw new Error(`${goalId}: missing accepted Batch-022 final text`)
    }
    Object.assign(current, {
      title: finalText.titleDe,
      titleEn: finalText.titleEn,
      description: finalText.descriptionDe,
      descriptionEn: finalText.descriptionEn,
    })
    if (goalId === ids.astronomicalUnit) {
      if (
        decision.changeScope !== 'title_de_and_title_en_only'
        || current.description !== before.description
        || current.descriptionEn !== before.descriptionEn
      ) throw new Error('Astronomical Unit revision escaped its title-only boundary')
    } else if (goalId === ids.radiationEquilibrium) {
      if (
        decision.changeScope !== 'description_de_and_description_en_only'
        || current.title !== before.title
        || current.titleEn !== before.titleEn
      ) throw new Error('Radiation-equilibrium revision escaped its description-only boundary')
    }
    if (goalId !== ids.binaryGwMass) updateVisualizationLink(current)
  }

  const childSpecs: Array<{ parentId: string; child: JsonRecord }> = []
  for (const parentId of splitParentIds) {
    const decision = decisions.get(parentId)
    const conversion = decision?.clusterConversion as JsonRecord | undefined
    if (decision?.resolutionDecision !== 'structural_split' || !conversion || !Array.isArray(decision.children)) {
      throw new Error(`${parentId}: missing structural split contract`)
    }
    const parent = goal(parentId)
    const parentTemplate = {
      tags: structuredClone(parent.tags ?? []),
      dimensionTags: structuredClone(parent.dimensionTags ?? {}),
      applicability: structuredClone(parent.applicability ?? {}),
      competencyRefs: structuredClone(parent.competencyRefs ?? []),
    }
    Object.assign(parent, {
      title: conversion.titleDe,
      titleEn: conversion.titleEn,
      description: conversion.descriptionDe,
      descriptionEn: conversion.descriptionEn,
      weight: conversion.weight,
      contains: [...conversion.contains],
      requires: [...conversion.requires],
      type: 'cluster',
    })
    delete parent.semanticAtomic
    updateVisualizationLink(parent)

    for (const child of decision.children as JsonRecord[]) {
      const expectedChild: JsonRecord = {
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
      if (byId.has(child.goalId)) throw new Error(`Batch-022 child already exists before materialization: ${child.goalId}`)
      byId.set(child.goalId, expectedChild)
      childSpecs.push({ parentId, child: expectedChild })
    }
  }

  for (const parentId of splitParentIds) {
    const parentIndex = goals.findIndex((candidate) => candidate.id === parentId)
    if (parentIndex < 0) throw new Error(`Missing Batch-022 insertion parent ${parentId}`)
    goals.splice(
      parentIndex + 1,
      0,
      ...childSpecs.filter((spec) => spec.parentId === parentId).map((spec) => spec.child),
    )
  }

  const astrophysics = goal(ids.astrophysicsCluster)
  for (const parentId of splitParentIds) {
    if ((astrophysics.contains as string[]).filter((goalId) => goalId === parentId).length !== 1) {
      throw new Error(`Astrophysics cluster does not retain split parent exactly once: ${parentId}`)
    }
  }
  if (childIds.some((childId) => (astrophysics.contains as string[]).includes(childId))) {
    throw new Error('Batch-022 children must remain nested under retained parent clusters')
  }
  if (
    !(goal(ids.solarObservations).contains as string[]).every((goalId) => goalId !== ids.stellarTemperature)
    || (goal(ids.solarObservations).contains as string[]).length !== 4
  ) throw new Error('Solar split must retain temperature as the separate existing goal 89124b92')

  for (const candidate of goals) {
    const staleRequires = (candidate.requires ?? []).filter((goalId: string) => splitParentIds.includes(goalId as never))
    if (staleRequires.length > 0) {
      throw new Error(`${candidate.id}: unadjudicated requires edge to split parent ${staleRequires.join(',')}`)
    }
    const coveredGoalIds = candidate.examData?.coveredGoalIds ?? []
    const forbiddenCoverage = coveredGoalIds.filter((goalId: string) => (
      splitParentIds.includes(goalId as never) || childIds.includes(goalId as never)
    ))
    if (forbiddenCoverage.length > 0) {
      throw new Error(`${candidate.id}: Batch-022 must not infer assessment coverage ${forbiddenCoverage.join(',')}`)
    }
  }

  for (const keepId of keepIds) {
    if (!same(goal(keepId), currentById.get(keepId))) throw new Error(`KEEP goal changed: ${keepId}`)
  }
  if (goals.length !== 703) throw new Error(`Unexpected post-Batch-022 canonical count ${goals.length}`)
  assertGraph(goals)
  for (const [goalId, before] of protectedLinkIdentity) {
    const link = (goal(goalId).resourceLinks ?? []).find((candidate: JsonRecord) => candidate.type === 'goal-visualization')
    const after = stableJson({ url: link?.url, provider: link?.provider, assetSha256: protectedAssetHashes[goalId] })
    if (after !== before) throw new Error(`Protected Nano Banana Pro link identity changed for ${goalId}`)
  }
  for (const childId of childIds) {
    if ((goal(childId).resourceLinks ?? []).length !== 0) {
      throw new Error(`Batch-022 child ${childId} must remain without a substitute visual resource`)
    }
  }
  canonical.goals = goals
  return canonical
}

function buildSemanticKinds(canonical: JsonRecord): JsonRecord {
  const ledger = readJson(paths.semanticKinds)
  const goalById = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const decisions = new Map((ledger.decisions as JsonRecord[]).map((decision) => [String(decision.goalId), decision]))
  const refreshedIds = [...revisedIds, ...splitParentIds, ...childIds]
  for (const goalId of refreshedIds) {
    const sourceGoal = goalById.get(goalId)
    if (!sourceGoal) throw new Error(`${goalId}: missing semantic-kind source goal`)
    const existing = decisions.get(goalId)
    const splitParent = splitParentIds.includes(goalId as never)
    const child = childIds.includes(goalId as never)
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
    curricularAtomic: 459,
    curricularArea: 100,
    practiceAssessment: 133,
    programStructure: 1,
    memory: 5,
    runtimeSupport: 4,
    orientation: 1,
    total: 703,
  }
  if (!same(ledger.counts, expectedCounts)) {
    throw new Error(`Unexpected post-Batch-022 semantic-kind counts ${stableJson(ledger.counts)}`)
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
    throw new Error(
      `Batch-023 fingerprint scope is not exactly 16 goals: ${sortStrings(changedOrNewAtoms).join(',')}`,
    )
  }
}

function buildReviewLedger(canonical: JsonRecord, semanticKinds: JsonRecord, kind: 'atomicity' | 'memory'): JsonRecord[] {
  const path = kind === 'atomicity' ? paths.atomicity : paths.memory
  const ruleVersion = kind === 'atomicity' ? 'semantic-atomicity-v1' : 'memory-card-review-v1'
  const reasons = kind === 'atomicity' ? atomicityReasons : memoryReasons
  const goalById = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const records = readJsonl(path)
  const byId = new Map(records.map((record) => [String(record.goalId), record]))
  for (const parentId of splitParentIds) byId.delete(parentId)
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
  if (result.length !== 459 || !same(actualIds, expectedAtomicIds)) {
    throw new Error(`${kind} ledger does not exactly cover the 459 current curricularAtomic Physics goals`)
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

function replaceAllExpected(source: string, before: string, after: string, count: number, label: string): string {
  const occurrences = source.split(before).length - 1
  if (occurrences === 0 && source.includes(after)) return source
  if (occurrences !== count) throw new Error(`${label}: expected ${count} occurrences, found ${occurrences}`)
  return source.replaceAll(before, after)
}

function buildByGenerator(adjudication: JsonRecord): string {
  let source = readFileSync(absolute(paths.byGenerator), 'utf8')
  const officialEvidence = adjudication.officialSolarContentEvidence as JsonRecord
  const officialItems = (officialEvidence.contentItems as JsonRecord[]).map((item) => ({
    id: item.sourceGoalId,
    sourceSpan: item.sourceSpan,
    sourceText: item.sourceText,
  }))

  source = replaceOnceOrAfter(
    source,
    "  courseLevel: 'GK_LK' | 'LK' | 'unspecified'\n  granularity: 'officialCompetency'\n  tags: string[]",
    "  courseLevel: 'GK_LK' | 'LK' | 'unspecified'\n  granularity: 'officialCompetency' | 'officialContentItem'\n  tags: string[]",
    'BY generator SourceGoal granularity union',
  )

  const reviewedContentTargets = (officialEvidence.contentItems as JsonRecord[])
    .map((item) => `  '${item.sourceGoalId}': [\n    '${item.canonicalGoalId}',\n  ],`)
    .join('\n')
  source = insertBeforeOnce(
    source,
    '// Batch 022 official solar content targets.',
    '}\n\nconst sourceDocument: SourceDocument = {',
    `  // Batch 022 official solar content targets. These content items bound
  // proposition scope and are not rephrased as official competencies.
${reviewedContentTargets}\n`,
    'BY generator official solar reviewed targets',
  )

  const officialDefinitions = `// Batch 022 official LehrplanPLUS solar-content evidence.
// The item labels are reproduced as content, without invented competency verbs.
const batch022SolarContentUrl = ${JSON.stringify(officialEvidence.url)}
const batch022SolarParentText = ${JSON.stringify(officialEvidence.parentText)}
const batch022SolarOfficialContentItems = ${JSON.stringify(officialItems, null, 2)} as const`
  source = insertBeforeOnce(
    source,
    '// Batch 022 official LehrplanPLUS solar-content evidence.',
    'function buildExtraction(source: SourceLandscape):',
    officialDefinitions,
    'BY generator official solar evidence definitions',
  )

  const officialExtraction = `  // Batch 022: LehrplanPLUS learning-area 314021 publishes this content list
  // separately from the competency sentence. Keep each entry typed as content.
  const solarPassage = passages.find((passage) => passage.topicCode === 'Ph13-GA-ASTRO.3')
  const solarCompetencyIndex = sourceGoals.findIndex((sourceGoal) => sourceGoal.id === '${ids.bySolarCompetency}')
  if (!solarPassage || solarCompetencyIndex < 0) {
    throw new Error('Batch 022 solar competency passage not found')
  }
  const solarContentGoals: SourceGoal[] = batch022SolarOfficialContentItems.map((item, index) => ({
    id: item.id,
    passageId: solarPassage.id,
    topicCode: solarPassage.topicCode,
    bulletIndex: 1,
    aspectIndex: index + 1,
    title: item.sourceText,
    description: item.sourceText,
    sourceText: item.sourceText,
    sourceSpan: item.sourceSpan,
    parentBulletText: batch022SolarParentText,
    sourceRef: batch022SolarContentUrl,
    courseLevel: 'GK_LK',
    granularity: 'officialContentItem',
    tags: [
      'jurisdiction:DE-BY',
      'stage:SekII',
      'courseLevel:GK_LK',
      'topic:Ph13-GA-ASTRO.3',
      'source-kind:officialContentItem',
    ],
    rawSourceText: item.sourceText,
    rawSourceSpan: item.sourceSpan,
    rawParentBulletText: batch022SolarParentText,
  }))
  sourceGoals.splice(solarCompetencyIndex + 1, 0, ...solarContentGoals)
  const passageCompetencyIndex = solarPassage.sourceGoalIds.indexOf('${ids.bySolarCompetency}')
  if (passageCompetencyIndex < 0) throw new Error('Batch 022 solar passage lacks competency reference')
  solarPassage.sourceGoalIds.splice(passageCompetencyIndex + 1, 0, ...solarContentGoals.map((goal) => goal.id))
  solarPassage.text = \`${'${solarPassage.text}'}\\nInhalte zu den Kompetenzen: ${'${batch022SolarParentText}'}\`
  solarPassage.sourceUrl = batch022SolarContentUrl`
  source = insertBeforeOnce(
    source,
    '// Batch 022: LehrplanPLUS learning-area 314021 publishes this content list',
    '  return {\n    passages,',
    officialExtraction,
    'BY generator official solar content materialization',
  )

  source = replaceAllExpected(source, 'parsed.sourceGoals.length === 296', 'parsed.sourceGoals.length === 301', 2, 'BY generator exact SourceGoal checks')
  source = replaceAllExpected(source, '296 Source-Ziele', '301 Source-Ziele', 1, 'BY generator SourceGoal status text')
  source = replaceOnceOrAfter(
    source,
    "'296 BY-Physik-Source-Ziele liegen zwischen BW (265) und HE (322) und verletzen die 30-Prozent-Abweichungsheuristik nicht.'",
    "'301 BY-Physik-Source-Ziele einschließlich fünf amtlicher Inhaltslisteneinträge liegen zwischen BW (265) und HE (322) und verletzen die 30-Prozent-Abweichungsheuristik nicht.'",
    'BY generator peer-baseline rationale',
  )
  source = replaceOnceOrAfter(
    source,
    "sourceGoalExtraction: 'Alle in den Passage-Einheiten enthaltenen Kompetenzerwartungen mit Zieltext wurden als Source-Ziele persistiert.',",
    "sourceGoalExtraction: 'Alle in den Passage-Einheiten enthaltenen Kompetenzerwartungen mit Zieltext wurden als Source-Ziele persistiert; die amtliche Inhaltsliste zu Ph13-GA-ASTRO.3 ist zusätzlich propositionenscharf als officialContentItem erfasst und wird nicht als eigenständige Kompetenz umgedeutet.',",
    'BY generator extraction method',
  )

  const batch022Definitions = `// Batch 022 astrophysics structural adjudication overlay
const batch022SplitParentIds = new Set(${JSON.stringify([...splitParentIds])})
const batch022TargetsBySourceGoalId: Record<string, Array<{ targetGoalId: string; matchType: 'exact' | 'partial' }>> = ${JSON.stringify(Object.fromEntries(
    Object.entries(byMappingAdjudications).map(([sourceGoalId, adjudicationValue]) => [
      sourceGoalId,
      adjudicationValue.canonicalGoalIds.map((targetGoalId, index) => ({
        targetGoalId,
        matchType: adjudicationValue.matchTypes[index],
      })),
    ]),
  ), null, 2)}
const batch022MappingRationaleBySourceGoalId: Record<string, string> = ${JSON.stringify(Object.fromEntries(
    Object.entries(byMappingAdjudications).map(([sourceGoalId, adjudicationValue]) => [sourceGoalId, adjudicationValue.rationale]),
  ), null, 2)}`
  source = insertBeforeOnce(
    source,
    '// Batch 022 astrophysics structural adjudication overlay',
    'const applyPhysicsBatch015Targets = (',
    batch022Definitions,
    'BY generator Batch-022 mapping definitions',
  )
  source = replaceOnceOrAfter(
    source,
    `  const batch021Targets = batch021TargetsBySourceGoalId[sourceGoalId]
  if (batch021Targets) {`,
    `  const batch022Targets = batch022TargetsBySourceGoalId[sourceGoalId]
  if (batch022Targets) {
    return batch022Targets.map((target) => ({
      canonicalGoalId: target.targetGoalId,
      matchType: target.matchType,
    }))
  }
  const batch021Targets = batch021TargetsBySourceGoalId[sourceGoalId]
  if (batch021Targets) {`,
    'BY generator Batch-022 target precedence',
  )
  source = replaceOnceOrAfter(
    source,
    '&& !batch021SplitParentIds.has(target.canonicalGoalId))',
    '&& !batch021SplitParentIds.has(target.canonicalGoalId) && !batch022SplitParentIds.has(target.canonicalGoalId))',
    'BY generator Batch-022 split-parent filter',
  )
  source = insertBeforeOnce(
    source,
    '// Batch 022 source-specific mapping rationales.',
    '  const mappings = decisions.flatMap((decision) => {',
    `  // Batch 022 source-specific mapping rationales.
  for (const decision of decisions) {
    const batch022Rationale = batch022MappingRationaleBySourceGoalId[decision.sourceGoalId]
    if (!batch022Rationale) continue
    decision.rationale = batch022Rationale
    decision.reviewedAt = '${reviewedAt}'
    decision.reviewer = '${reviewer}'
  }`,
    'BY generator Batch-022 rationale overlay',
  )
  return source
}

function buildHhGenerator(): string {
  let source = readFileSync(absolute(paths.hhGenerator), 'utf8')
  source = replaceOnceOrAfter(
    source,
    `    path: sourcePdfPath,\n    official: true,\n  },`,
    `    path: sourcePdfPath,\n    official: true,\n    url: 'https://www.hamburg.de/resource/blob/123094/2691efabaaf2679cd7dd970a95a3c748/physik-gyo-2022-data.pdf',\n  },`,
    'HH generator official source URL reproduction',
  )
  source = replaceOnceOrAfter(
    source,
    `  astronomicalVisibility: '${ids.nightSky}',`,
    `  spatiotemporalVisibility: '${ids.spatiotemporalVisibility}',`,
    'HH generator spatial-temporal visibility target',
  )
  source = replaceOnceOrAfter(
    source,
    `  planetaryVisibility: '${ids.planetaryVisibility}',`,
    `  planetaryConfigurations: '${ids.planetaryConfigurations}',`,
    'HH generator planetary-configuration target',
  )
  source = replaceOnceOrAfter(
    source,
    "row('4.2', 'Sternbilder in Abhängigkeit von Uhrzeit und Jahreszeit sichtbarkeitsbezogen erschließen', [target.astronomicalVisibility]),",
    "row('4.2', 'Sternbilder in Abhängigkeit von Uhrzeit und Jahreszeit sichtbarkeitsbezogen erschließen', [target.spatiotemporalVisibility]),",
    'HH generator spatial-temporal visibility row',
  )
  source = replaceOnceOrAfter(
    source,
    "row('4.2', 'Sonnenlauf, Mondlauf, Tierkreiszeichen und Planetenbahnen am Himmel beschreiben', [target.planetaryVisibility]),",
    "row('4.2', 'Sonnenlauf, Mondlauf, Tierkreiszeichen und Planetenbahnen am Himmel beschreiben', [target.planetaryConfigurations]),",
    'HH generator planetary-configuration row',
  )

  const hhByText = {
    'Sternbilder in Abhängigkeit von Uhrzeit und Jahreszeit sichtbarkeitsbezogen erschließen': hhMappingAdjudications['hh-physics-sekii-bp2022-4-2-134-94297a57'],
    'Sonnenlauf, Mondlauf, Tierkreiszeichen und Planetenbahnen am Himmel beschreiben': hhMappingAdjudications['hh-physics-sekii-bp2022-4-2-135-07dea54b'],
  }
  const definitions = `// Batch 022 source-specific astrophysics mapping adjudications.
const batch022MappingAdjudicationBySourceText: Record<string, { rationale: string; matchTypes: Array<'exact' | 'partial'> }> = ${JSON.stringify(Object.fromEntries(
    Object.entries(hhByText).map(([text, adjudicationValue]) => [text, {
      rationale: adjudicationValue.rationale,
      matchTypes: adjudicationValue.matchTypes,
    }]),
  ), null, 2)}`
  source = insertBeforeOnce(
    source,
    '// Batch 022 source-specific astrophysics mapping adjudications.',
    'const mappings = rows.flatMap((currentRow, index) => {',
    definitions,
    'HH generator Batch-022 definitions',
  )
  source = replaceOnceOrAfter(
    source,
    `  const batch021Adjudication = batch021MappingAdjudicationBySourceText[currentRow.text]
  return currentRow.canonicalGoalIds.map((canonicalGoalId, targetIndex) => ({`,
    `  const batch022Adjudication = batch022MappingAdjudicationBySourceText[currentRow.text]
  const batch021Adjudication = batch021MappingAdjudicationBySourceText[currentRow.text]
  return currentRow.canonicalGoalIds.map((canonicalGoalId, targetIndex) => ({`,
    'HH generator Batch-022 mapping selection',
  )
  source = replaceOnceOrAfter(
    source,
    `    matchType: batch021Adjudication?.matchTypes[targetIndex]
      ?? (currentRow.canonicalGoalIds.length === 1 ? 'exact' : 'partial'),`,
    `    matchType: batch022Adjudication?.matchTypes[targetIndex]
      ?? batch021Adjudication?.matchTypes[targetIndex]
      ?? (currentRow.canonicalGoalIds.length === 1 ? 'exact' : 'partial'),`,
    'HH generator Batch-022 match-type precedence',
  )
  source = replaceOnceOrAfter(
    source,
    '    rationale: batch021MappingAdjudicationBySourceText[currentRow.text]?.rationale',
    '    rationale: batch022MappingAdjudicationBySourceText[currentRow.text]?.rationale\n      ?? batch021MappingAdjudicationBySourceText[currentRow.text]?.rationale',
    'HH generator Batch-022 decision rationale precedence',
  )
  source = replaceOnceOrAfter(
    source,
    "    reviewedAt: batch021MappingAdjudicationBySourceText[currentRow.text] ? '2026-08-28' : '2026-05-10',",
    "    reviewedAt: batch022MappingAdjudicationBySourceText[currentRow.text] || batch021MappingAdjudicationBySourceText[currentRow.text] ? '2026-08-28' : '2026-05-10',",
    'HH generator Batch-022 review date',
  )
  source = replaceOnceOrAfter(
    source,
    `    reviewer: batch021MappingAdjudicationBySourceText[currentRow.text]
      ? '${'codex-physics-batch-021-astrophysics-adjudication-2026-08-28'}'
      : 'codex',`,
    `    reviewer: batch022MappingAdjudicationBySourceText[currentRow.text]
      ? '${reviewer}'
      : batch021MappingAdjudicationBySourceText[currentRow.text]
        ? '${'codex-physics-batch-021-astrophysics-adjudication-2026-08-28'}'
        : 'codex',`,
    'HH generator Batch-022 reviewer precedence',
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

type GeneratorOutputs = {
  bySourceExtraction: string
  byMapping: string
  hhSourceExtraction: string
  hhMapping: string
}

function copyGeneratorInput(tempRoot: string, path: string): void {
  const destination = resolve(tempRoot, path)
  mkdirSync(dirname(destination), { recursive: true })
  cpSync(absolute(path), destination)
}

function reproduceGenerators(byGenerator: string, hhGenerator: string): GeneratorOutputs {
  const tempRoot = mkdtempSync('/dev/shm/skillpilot-b022-generator-')
  try {
    const tempAppScripts = resolve(tempRoot, 'app/scripts')
    mkdirSync(tempAppScripts, { recursive: true })
    writeFileSync(resolve(tempRoot, paths.byGenerator), byGenerator)
    writeFileSync(resolve(tempRoot, paths.hhGenerator), hhGenerator)
    for (const path of [
      paths.byStructuredSource,
      paths.byLegacyMapping,
      paths.hhSourcePdf,
      paths.sourceLandscapeRegistry,
      ...shTemplateViewPaths,
    ]) copyGeneratorInput(tempRoot, path)

    const tsx = absolute('app/node_modules/.bin/tsx')
    execFileSync(tsx, [resolve(tempRoot, paths.byGenerator)], {
      cwd: resolve(tempRoot, 'app'),
      stdio: 'pipe',
      encoding: 'utf8',
    })
    execFileSync(tsx, [resolve(tempRoot, paths.hhGenerator)], {
      cwd: resolve(tempRoot, 'app'),
      stdio: 'pipe',
      encoding: 'utf8',
    })

    const readTemp = (path: string): string => readFileSync(resolve(tempRoot, path), 'utf8')
    for (let index = 0; index < hhGeneratedViewPaths.length; index += 1) {
      const generated = readTemp(hhGeneratedViewPaths[index])
      if (generated !== readFileSync(absolute(hhGeneratedViewPaths[index]), 'utf8')) {
        throw new Error(`HH generator unexpectedly changes protected composition view ${hhGeneratedViewPaths[index]}`)
      }
    }
    if (readTemp(paths.sourceLandscapeRegistry) !== readFileSync(absolute(paths.sourceLandscapeRegistry), 'utf8')) {
      throw new Error('HH generator unexpectedly changes protected source-landscape registry')
    }
    if (readTemp(paths.hhReadme) !== readFileSync(absolute(paths.hhReadme), 'utf8')) {
      throw new Error('HH generator unexpectedly changes protected mapping README')
    }
    return {
      bySourceExtraction: readTemp(paths.bySourceExtraction),
      byMapping: readTemp(paths.byMapping),
      hhSourceExtraction: readTemp(paths.hhSourceExtraction),
      hhMapping: readTemp(paths.hhMapping),
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true })
  }
}

function validateSourceExtractionAndMappings(outputs: GeneratorOutputs, adjudication: JsonRecord): {
  byExtraction: JsonRecord
  byMapping: JsonRecord
  hhExtraction: JsonRecord
  hhMapping: JsonRecord
} {
  const byExtraction = JSON.parse(outputs.bySourceExtraction) as JsonRecord
  const byMapping = JSON.parse(outputs.byMapping) as JsonRecord
  const hhExtraction = JSON.parse(outputs.hhSourceExtraction) as JsonRecord
  const hhMapping = JSON.parse(outputs.hhMapping) as JsonRecord
  if (
    byExtraction.sourceLandscapeId !== bySourceLandscapeId
    || byExtraction.passages?.length !== 42
    || byExtraction.sourceGoals?.length !== 301
    || new Set((byExtraction.sourceGoals as JsonRecord[]).map((goal) => goal.id)).size !== 301
  ) throw new Error('Generated BY extraction does not have exactly 42 passages and 301 unique SourceGoals')
  if (outputs.hhSourceExtraction !== readFileSync(absolute(paths.hhSourceExtraction), 'utf8')) {
    throw new Error('HH extraction must remain byte-identical while its mappings are rebound')
  }
  if (
    hhExtraction.sourceLandscapeId !== hhSourceLandscapeId
    || hhExtraction.sourceGoals?.length !== 154
  ) throw new Error('Unexpected generated HH extraction')

  const evidence = adjudication.officialSolarContentEvidence as JsonRecord
  const sourceById = new Map((byExtraction.sourceGoals as JsonRecord[]).map((sourceGoal) => [String(sourceGoal.id), sourceGoal]))
  const solarPassage = (byExtraction.passages as JsonRecord[])
    .find((passage) => passage.topicCode === evidence.topicCode)
  if (
    !solarPassage
    || solarPassage.sourceUrl !== evidence.url
    || !String(solarPassage.text).includes(`Inhalte zu den Kompetenzen: ${evidence.parentText}`)
  ) throw new Error('Generated BY solar passage lacks the official learning-area content evidence')
  for (const item of evidence.contentItems as JsonRecord[]) {
    const sourceGoal = sourceById.get(item.sourceGoalId)
    if (!sourceGoal || !same({
      id: sourceGoal.id,
      passageId: sourceGoal.passageId,
      topicCode: sourceGoal.topicCode,
      bulletIndex: sourceGoal.bulletIndex,
      aspectIndex: sourceGoal.aspectIndex,
      title: sourceGoal.title,
      description: sourceGoal.description,
      sourceText: sourceGoal.sourceText,
      sourceSpan: sourceGoal.sourceSpan,
      parentBulletText: sourceGoal.parentBulletText,
      sourceRef: sourceGoal.sourceRef,
      courseLevel: sourceGoal.courseLevel,
      granularity: sourceGoal.granularity,
      rawSourceText: sourceGoal.rawSourceText,
      rawSourceSpan: sourceGoal.rawSourceSpan,
      rawParentBulletText: sourceGoal.rawParentBulletText,
    }, {
      id: item.sourceGoalId,
      passageId: solarPassage.id,
      topicCode: evidence.topicCode,
      bulletIndex: 1,
      aspectIndex: (evidence.contentItems as JsonRecord[]).indexOf(item) + 1,
      title: item.sourceText,
      description: item.sourceText,
      sourceText: item.sourceText,
      sourceSpan: item.sourceSpan,
      parentBulletText: evidence.parentText,
      sourceRef: evidence.url,
      courseLevel: 'GK_LK',
      granularity: 'officialContentItem',
      rawSourceText: item.sourceText,
      rawSourceSpan: item.sourceSpan,
      rawParentBulletText: evidence.parentText,
    })) throw new Error(`Generated official solar content item drifted: ${item.sourceGoalId}`)
    if (!solarPassage.sourceGoalIds.includes(item.sourceGoalId)) {
      throw new Error(`Solar passage does not reference official content item ${item.sourceGoalId}`)
    }
  }
  const generatedSolarIds = (byExtraction.sourceGoals as JsonRecord[])
    .filter((sourceGoal) => sourceGoal.granularity === 'officialContentItem')
    .map((sourceGoal) => sourceGoal.id)
  if (!same(generatedSolarIds, [...officialSolarContentIds])) {
    throw new Error('BY extraction has unexpected officialContentItem scope')
  }
  const byM2 = (byExtraction.pipelineStatus.steps as JsonRecord[]).find((step) => step.id === 'MAPPING-2')
  if (
    byM2?.status !== 'complete'
    || !(byM2.checks as JsonRecord[]).every((check) => check.passed === true)
    || byExtraction.qualityReview?.sourceGoalCountPeerBaseline?.count !== 301
  ) throw new Error('BY extraction pipeline or peer-baseline count was not updated to 301')

  const validateReview = (
    review: JsonRecord,
    extraction: JsonRecord,
    expectedSourceLandscapeId: string,
    expectedDecisions: number,
    expectedMappings: number,
    adjudications: Record<string, MappingAdjudication>,
    label: string,
  ): void => {
    if (
      review.sourceLandscapeId !== expectedSourceLandscapeId
      || review.targetLandscapeId !== physicsLandscapeId
      || review.decisions?.length !== expectedDecisions
      || review.mappings?.length !== expectedMappings
    ) throw new Error(`${label}: unexpected generated review counts`)
    const extractionIds = new Set((extraction.sourceGoals as JsonRecord[]).map((sourceGoal) => sourceGoal.id))
    const decisionIds = new Set((review.decisions as JsonRecord[]).map((decision) => decision.sourceGoalId))
    if (decisionIds.size !== expectedDecisions || [...decisionIds].some((sourceGoalId) => !extractionIds.has(sourceGoalId))) {
      throw new Error(`${label}: review decisions do not exactly reference the extraction`)
    }
    for (const [sourceGoalId, adjudicationValue] of Object.entries(adjudications)) {
      const decision = (review.decisions as JsonRecord[]).find((candidate) => candidate.sourceGoalId === sourceGoalId)
      const actualMappings = (review.mappings as JsonRecord[])
        .filter((mapping) => mapping.legacyGoalId === sourceGoalId)
        .map((mapping) => ({ canonicalGoalId: mapping.canonicalGoalId, matchType: mapping.matchType }))
      const expectedTargets = adjudicationValue.canonicalGoalIds.map((canonicalGoalId, index) => ({
        canonicalGoalId,
        matchType: adjudicationValue.matchTypes[index],
      }))
      if (
        !decision
        || decision.rationale !== adjudicationValue.rationale
        || decision.reviewer !== reviewer
        || !same(decision.canonicalGoalIds, adjudicationValue.canonicalGoalIds)
        || !same(actualMappings, expectedTargets)
      ) throw new Error(`${label}: adjudication mismatch for ${sourceGoalId}`)
    }
    for (const splitParentId of splitParentIds) {
      const decisionCount = (review.decisions as JsonRecord[])
        .filter((decision) => (decision.canonicalGoalIds ?? []).includes(splitParentId)).length
      const mappingCount = (review.mappings as JsonRecord[])
        .filter((mapping) => mapping.canonicalGoalId === splitParentId).length
      if (decisionCount !== 0 || mappingCount !== 0) {
        throw new Error(`${label}: split parent ${splitParentId} remains mapped`)
      }
    }
  }
  validateReview(byMapping, byExtraction, bySourceLandscapeId, 301, 1008, byMappingAdjudications, 'BY')
  validateReview(hhMapping, hhExtraction, hhSourceLandscapeId, 154, 220, hhMappingAdjudications, 'HH')
  return { byExtraction, byMapping, hhExtraction, hhMapping }
}

function buildProvenance(byMapping: JsonRecord, hhMapping: JsonRecord): JsonRecord {
  const registry = readJson(paths.provenance)
  const landscape = (registry.landscapes as JsonRecord[])
    .find((entry) => entry.landscapeId === physicsLandscapeId)
  if (!landscape?.goalProvenance || typeof landscape.goalProvenance !== 'object') {
    throw new Error('Missing canonical Physics provenance landscape')
  }
  const reviews = [byMapping, hhMapping]
  const preferredSourceGoalIds: Record<string, string> = {
    [ids.nightSkyNavigation]: '7006a7a0-9f2e-5ea4-aa95-312ecd9db38e',
    [ids.objectClassification]: '7006a7a0-9f2e-5ea4-aa95-312ecd9db38e',
    [ids.spatiotemporalVisibility]: '7006a7a0-9f2e-5ea4-aa95-312ecd9db38e',
    [ids.solarRadius]: ids.bySolarCompetency,
    [ids.solarMass]: ids.bySolarCompetency,
    [ids.solarLuminosity]: ids.bySolarCompetency,
    [ids.solarRotation]: ids.bySolarCompetency,
    [ids.planetaryConfigurations]: 'a8775a10-9af9-586d-a90a-5ad3259bccac',
    [ids.planetaryLoops]: 'a8775a10-9af9-586d-a90a-5ad3259bccac',
    [ids.galaxyDistanceMethods]: '466996a2-112f-508c-9454-c59385ebda84',
    [ids.hubbleAge]: '6d7f80f4-e1ea-5de1-a826-09cc491de239',
    [ids.orbitalMass]: '9f0d2e0e-9bcf-5b30-9f78-af6374ca0a44',
    [ids.darkMatterCurves]: '9f0d2e0e-9bcf-5b30-9f78-af6374ca0a44',
  }
  for (const childId of childIds) {
    const sources: Array<{ sourceLandscapeId: string; sourceGoalId: string }> = []
    for (const review of reviews) {
      for (const mapping of review.mappings as JsonRecord[]) {
        if (mapping.canonicalGoalId === childId) {
          sources.push({
            sourceLandscapeId: String(review.sourceLandscapeId),
            sourceGoalId: String(mapping.legacyGoalId),
          })
        }
      }
    }
    const preferred = sources.find((source) => source.sourceGoalId === preferredSourceGoalIds[childId])
    if (!preferred) throw new Error(`Missing preferred source provenance for Batch-022 child ${childId}`)
    const additionalSourceLandscapeIds = sortStrings([...new Set(sources
      .map((source) => source.sourceLandscapeId)
      .filter((sourceLandscapeId) => sourceLandscapeId !== preferred.sourceLandscapeId))])
    const expected = {
      sourceLandscapeId: preferred.sourceLandscapeId,
      sourceGoalId: preferred.sourceGoalId,
      ...(additionalSourceLandscapeIds.length > 0 ? { additionalSourceLandscapeIds } : {}),
    }
    if (landscape.goalProvenance[childId]) {
      throw new Error(`Batch-022 child unexpectedly has pre-existing provenance: ${childId}`)
    }
    landscape.goalProvenance[childId] = expected
  }
  landscape.goalProvenance = Object.fromEntries(Object.entries(landscape.goalProvenance)
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0))
  if (Object.keys(landscape.goalProvenance).length !== 455) {
    throw new Error(`Unexpected post-Batch-022 Physics provenance count ${Object.keys(landscape.goalProvenance).length}`)
  }
  return registry
}

function buildSourceGoalMembership(byExtraction: JsonRecord): JsonRecord {
  const registry = readJson(paths.sourceGoalMembership)
  const entry = (registry.landscapes as JsonRecord[])
    .find((candidate) => candidate.landscapeId === bySourceLandscapeId)
  if (!entry || !Array.isArray(entry.goalIds) || entry.goalIds.length !== 346) {
    throw new Error('Unexpected BY source-goal membership entry')
  }
  const parentIndex = entry.goalIds.indexOf(ids.bySolarCompetency)
  if (parentIndex < 0 || officialSolarContentIds.some((goalId) => entry.goalIds.includes(goalId))) {
    throw new Error('BY membership solar before-state drifted')
  }
  entry.goalIds.splice(parentIndex + 1, 0, ...officialSolarContentIds)
  const sourceGoalIds = (byExtraction.sourceGoals as JsonRecord[]).map((sourceGoal) => sourceGoal.id)
  const membershipIds = new Set(entry.goalIds as string[])
  if (
    Number(entry.goalIds.length) !== 351
    || new Set(entry.goalIds).size !== 351
    || sourceGoalIds.some((sourceGoalId) => !membershipIds.has(sourceGoalId))
  ) throw new Error('BY membership does not cover all 301 generated SourceGoals')
  return registry
}

function buildSourceGoalClosure(membership: JsonRecord): JsonRecord {
  const registry = readJson(paths.sourceGoalClosure)
  const entry = (registry.landscapes as JsonRecord[])
    .find((candidate) => candidate.landscapeId === bySourceLandscapeId)
  const membershipEntry = (membership.landscapes as JsonRecord[])
    .find((candidate) => candidate.landscapeId === bySourceLandscapeId)
  if (!entry?.goalAtomicClosures || Object.keys(entry.goalAtomicClosures).length !== 346 || !membershipEntry) {
    throw new Error('Unexpected BY source-goal closure entry')
  }
  const closures = entry.goalAtomicClosures as Record<string, string[]>
  const containingParent = Object.entries(closures)
    .filter(([, closure]) => closure.includes(ids.bySolarCompetency))
  if (containingParent.length !== 4) {
    throw new Error(`Unexpected BY solar closure ancestry count ${containingParent.length}`)
  }
  for (const [, closure] of containingParent) {
    if (officialSolarContentIds.some((goalId) => closure.includes(goalId))) {
      throw new Error('BY closure already contains Batch-022 official content')
    }
    const parentIndex = closure.indexOf(ids.bySolarCompetency)
    closure.splice(parentIndex + 1, 0, ...officialSolarContentIds)
  }
  for (const sourceGoalId of officialSolarContentIds) closures[sourceGoalId] = [sourceGoalId]
  const membershipIds = membershipEntry.goalIds as string[]
  if (
    Object.keys(closures).length !== 351
    || !same(sortStrings(Object.keys(closures)), sortStrings(membershipIds))
    || Object.values(closures).some((closure) => closure.some((goalId) => !membershipIds.includes(goalId)))
  ) throw new Error('BY closure keys or values escaped the 351-goal membership')
  return registry
}

const visualizationReviewNotes: Record<string, string> = Object.fromEntries([
  ...visualParentIds.map((goalId) => [
    goalId,
    'Batch 082 compatibility review: The byte-identical Nano Banana Pro asset remains appropriate as an overview for the retained parent cluster. It is not claimed as a child-specific visual; image and historical prompt bytes remain unchanged.',
  ]),
  ...revisedVisualIds.map((goalId) => [
    goalId,
    'Batch 082 compatibility review: The existing Nano Banana Pro asset remains consistent with the bounded Batch-022 bilingual wording revision. No visual proposition contradicts the final goal; image and historical prompt bytes remain unchanged.',
  ]),
])

function buildVisualizationQa(canonical: JsonRecord): JsonRecord {
  const qa = readJson(paths.visualizationQa)
  const goalById = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const byId = new Map((qa.records as JsonRecord[]).map((record) => [String(record.goalId), record]))
  for (const goalId of existingVisualGoalIds) {
    const goal = goalById.get(goalId)
    const record = byId.get(goalId)
    const expectedHash = protectedAssetHashes[goalId]
    if (!goal || !record || record.assetSha256 !== `sha256:${expectedHash}`) {
      throw new Error(`${goalId}: visualization-QA asset binding drifted`)
    }
    const note = visualizationReviewNotes[goalId]
    if (!note) throw new Error(`${goalId}: missing Batch-082 visual compatibility note`)
    Object.assign(record, {
      title: goal.title,
      description: goal.description,
      umlautsCorrectChatGpt: 'yes',
      contentApprovedChatGpt: 'yes',
      chatGptReviewedAt: visualizationReviewedAt,
      chatGptReviewer: visualizationReviewer,
      chatGptNotes: note,
      aiApproved: 'yes',
      aiApprovedAssetSha256: record.assetSha256,
      aiReviewedAt: visualizationReviewedAt,
      aiReviewer: visualizationReviewer,
      aiNotes: note,
    })
  }
  const binaryGoal = goalById.get(ids.binaryGwMass)
  const binaryRecord = byId.get(ids.binaryGwMass)
  if (
    !binaryGoal
    || !binaryRecord
    || binaryRecord.visualizationState !== 'missing'
    || binaryRecord.missingReason !== 'deferred_provider_limitation'
    || binaryRecord.assetSha256 !== ''
  ) throw new Error('Revised binary/GW mass goal must retain its missing/deferred visual state')
  binaryRecord.title = binaryGoal.title
  binaryRecord.description = binaryGoal.description

  for (const childId of childIds) {
    const goal = goalById.get(childId)
    if (!goal || byId.has(childId)) throw new Error(`Unexpected Batch-022 child visualization state ${childId}`)
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
  if (qa.records.length !== 481) throw new Error(`Unexpected post-Batch-022 visualization-QA count ${qa.records.length}`)
  return qa
}

function buildVisualizationReview(canonical: JsonRecord): string {
  const goalById = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const existingRows = existingVisualGoalIds.map((goalId) => {
    const goal = goalById.get(goalId)!
    const decision = splitParentIds.includes(goalId as never)
      ? 'accepted_existing_asset_as_cluster_overview'
      : 'accepted_existing_asset_metadata_rebound'
    const note = splitParentIds.includes(goalId as never)
      ? 'Stabile Eltern-ID ist nun ein Cluster; das vorhandene Überblicksbild bleibt ausschließlich dort gebunden.'
      : 'Die begrenzte Textrevision bleibt mit dem vorhandenen, bereits fachlich akzeptierten Bild vereinbar.'
    return `| \`${goalId}\` | ${goal.title} | \`${decision}\` | ${note} Asset SHA-256: \`sha256:${protectedAssetHashes[goalId]}\`. |`
  }).join('\n')
  const deferredRows = [ids.binaryGwMass, ...childIds].map((goalId) => {
    const goal = goalById.get(goalId)!
    const note = goalId === ids.binaryGwMass
      ? 'Der bereits fehlende Visualzustand bleibt unverändert; Titel und Beschreibung werden nur im QA-Datensatz nachgeführt.'
      : 'Kein Ersatzbild erzeugt; eine spätere Visualisierung bleibt einem fachlich geprüften Nano-Banana-Pro-Lauf vorbehalten.'
    return `| \`${goalId}\` | ${goal.title} | \`deferred_provider_limitation\` | ${note} |`
  }).join('\n')
  return `# Physik goal visualization review – Batch 082

Review date: 2026-08-28

Scope: Visual compatibility and metadata rebinding for the bounded Batch-022
astrophysics adjudication. Seven existing Google Gemini / Nano Banana Pro assets
remain byte-identical. Historical \`prompt.de.md\` and
\`image-reconstruction-prompt.de.md\` files remain byte-identical as generation
provenance. The five retained parent IDs keep their images only as cluster
overviews. No hand-authored, programmatic, self-generated, or substitute-provider
image was created for any of the thirteen new children or for the revised
binary/gravitational-wave mass goal that already lacked an image.

Human-review fields remain unchanged and open.

| Goal ID | Goal title | Decision | Notes |
|---|---|---|---|
${existingRows}
${deferredRows}

## Byte and provider boundary

- Existing canonical and public JPG copies remain byte-identical for every
  retained goal listed above.
- Canonical resource links keep their exact URL, provider, licence, and asset
  identity; only title/description bindings are synchronized to the adjudicated
  goal text.
- The thirteen new child records and the already missing revised mass-goal
  record use exactly \`missingReason: deferred_provider_limitation\`; they have no
  substitute resource link or newly generated visual content.
`
}

function expandCompositionClusterReferences(view: JsonRecord, path: string): JsonRecord {
  const counts = new Map(compositionSubtreeGoalIds.map((goalId) => [goalId, 0]))
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(visit)
      return
    }
    if (!value || typeof value !== 'object') return
    const node = value as JsonRecord
    const goalId = typeof node.goalId === 'string' ? node.goalId : ''
    if (compositionSubtreeGoalIds.includes(goalId as typeof compositionSubtreeGoalIds[number])) {
      if (node.kind !== 'goalEntry') {
        throw new Error(`${path}: curricular-area reference ${goalId} is not an exact pre-expansion goalEntry`)
      }
      if (Object.keys(node).sort().join(',') !== 'goalId,kind') {
        throw new Error(`${path}: curricular-area reference ${goalId} carries metadata that cannot be changed mechanically`)
      }
      node.kind = 'canonicalSubtree'
      counts.set(
        goalId as typeof compositionSubtreeGoalIds[number],
        (counts.get(goalId as typeof compositionSubtreeGoalIds[number]) ?? 0) + 1,
      )
    }
    Object.values(node).forEach(visit)
  }
  visit(view)
  for (const [goalId, count] of counts) {
    if (count !== 1) throw new Error(`${path}: expected one exact curricular-area reference to ${goalId}; found ${count}`)
  }
  return view
}

function buildCompositionViews(): Map<string, JsonRecord> {
  const views = new Map<string, JsonRecord>()
  for (const path of compositionViewPaths) {
    const view = readJson(path)
    for (const clusterId of compositionSubtreeGoalIds) {
      if (countGoalReferences(view, clusterId) !== 1) {
        throw new Error(`${path}: retained curricular-area goal ${clusterId} must appear exactly once`)
      }
    }
    for (const childId of childIds) {
      if (countGoalReferences(view, childId) !== 0) {
        throw new Error(`${path}: Batch-022 child ${childId} must be inherited below its parent, not duplicated`)
      }
    }
    views.set(path, expandCompositionClusterReferences(view, path))
  }
  return views
}

function buildPhysicsInputTest(): string {
  let source = readFileSync(absolute(paths.physicsInputTest), 'utf8')
  const b021AtomicIds = [
    ids.astrometry,
    ids.radialVelocity,
    ids.spectralClassification,
    ids.fraunhofer,
    ids.stellarTemperature,
    ids.binaryGwMass,
    ids.gwGeneration,
  ]
  const b021ClusterIds = [
    'e07f36de-2819-59f8-a707-fa25b4633ed3',
    'a7bec355-48c5-5107-bfab-d6956f9c9205',
    '7c8f1e34-d81a-51a2-8aa0-a6ee8e1b03a4',
  ]
  const atomicLines = [...b021AtomicIds, ...childIds].map((goalId) => `  '${goalId}',`).join('\n')
  const clusterLines = [...b021ClusterIds, ...splitParentIds].map((goalId) => `  '${goalId}',`).join('\n')
  source = replaceOnceOrAfter(
    source,
    `  '16b94a12-ecc5-5b5c-85b6-87b4290bebf8',\n])\nconst STRUCTURAL_SPLIT_CLUSTER_GOAL_IDS`,
    `  '16b94a12-ecc5-5b5c-85b6-87b4290bebf8',\n${atomicLines}\n])\nconst STRUCTURAL_SPLIT_CLUSTER_GOAL_IDS`,
    'Physics input test Batch-021/022 structural atomic IDs',
  )
  source = replaceOnceOrAfter(
    source,
    `  'cb0426b0-a973-5660-b6fe-79407934730f',\n])\nconst POST_SPLIT_PRACTICE_ASSESSMENT_GOAL_IDS`,
    `  'cb0426b0-a973-5660-b6fe-79407934730f',\n${clusterLines}\n])\nconst POST_SPLIT_PRACTICE_ASSESSMENT_GOAL_IDS`,
    'Physics input test Batch-021/022 structural cluster IDs',
  )
  source = replaceOnceOrAfter(
    source,
    `  curricularAtomic: 447,
  curricularArea: 92,
  practiceAssessment: 133,
  programStructure: 1,
  memory: 5,
  runtimeSupport: 4,
  orientation: 1,
  total: 683,`,
    `  curricularAtomic: 459,
  curricularArea: 100,
  practiceAssessment: 133,
  programStructure: 1,
  memory: 5,
  runtimeSupport: 4,
  orientation: 1,
  total: 703,`,
    'Physics input test post-Batch-022 semantic counts',
  )
  return source
}

function buildPhysicsSourceManifest(): JsonRecord {
  const manifest = readJson(paths.physicsSourceManifest)
  if (manifest.expectedCurricularAtomicGoalCount !== 451) {
    throw new Error(`Unexpected Physics source-manifest denominator ${String(manifest.expectedCurricularAtomicGoalCount)}`)
  }
  manifest.expectedCurricularAtomicGoalCount = 459
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
    paths.hhGenerator,
    paths.bySourceExtraction,
    paths.hhSourceExtraction,
    paths.byMapping,
    paths.hhMapping,
    paths.provenance,
    paths.sourceGoalClosure,
    paths.sourceGoalMembership,
    paths.visualizationQa,
    paths.visualizationReview,
    paths.physicsInputTest,
    paths.physicsSourceManifest,
    ...compositionViewPaths,
  ])
  const actual = new Set(files.map((file) => file.path))
  if (
    files.length !== actual.size
    || actual.size !== expected.size
    || [...actual].some((path) => !expected.has(path))
  ) {
    throw new Error('Batch-022 planned outputs escaped the exact 21-file curriculum/QA/source/generator/test/view boundary')
  }
}

function assertAppendOnlyStates(files: PlannedFile[]): void {
  for (const { path, bytes, appendOnly } of files) {
    if (!appendOnly || !existsSync(absolute(path))) continue
    if (readFileSync(absolute(path), 'utf8') !== bytes) {
      throw new Error(`Refusing to overwrite append-only Batch-022 artifact ${path}`)
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
  const byGenerator = buildByGenerator(adjudication)
  const hhGenerator = buildHhGenerator()
  assertGeneratedTypeScriptSyntax(paths.byGenerator, byGenerator)
  assertGeneratedTypeScriptSyntax(paths.hhGenerator, hhGenerator)
  const generatorOutputs = reproduceGenerators(byGenerator, hhGenerator)
  const { byExtraction, byMapping, hhMapping } = validateSourceExtractionAndMappings(generatorOutputs, adjudication)
  const provenance = buildProvenance(byMapping, hhMapping)
  const sourceGoalMembership = buildSourceGoalMembership(byExtraction)
  const sourceGoalClosure = buildSourceGoalClosure(sourceGoalMembership)
  const visualizationQa = buildVisualizationQa(canonical)
  const visualizationReview = buildVisualizationReview(canonical)
  const compositionViews = buildCompositionViews()
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
      { path: paths.hhGenerator, bytes: hhGenerator },
      { path: paths.bySourceExtraction, bytes: generatorOutputs.bySourceExtraction },
      { path: paths.hhSourceExtraction, bytes: generatorOutputs.hhSourceExtraction },
      { path: paths.byMapping, bytes: generatorOutputs.byMapping },
      { path: paths.hhMapping, bytes: generatorOutputs.hhMapping },
      { path: paths.provenance, bytes: serializeJson(provenance) },
      { path: paths.sourceGoalClosure, bytes: serializeJson(sourceGoalClosure) },
      { path: paths.sourceGoalMembership, bytes: serializeJson(sourceGoalMembership) },
      { path: paths.visualizationQa, bytes: serializeJson(visualizationQa) },
      { path: paths.visualizationReview, bytes: visualizationReview, appendOnly: true },
      { path: paths.physicsInputTest, bytes: physicsInputTest },
      { path: paths.physicsSourceManifest, bytes: serializeJson(physicsSourceManifest) },
      ...[...compositionViews].map(([path, view]) => ({ path, bytes: serializeJson(view) })),
    ],
  }
}

function loadMaterializedPlan(expandLegacyViews: boolean): BoundedPlan {
  const orderedPaths = [
    paths.canonical,
    paths.semanticKinds,
    paths.atomicity,
    paths.memory,
    paths.byGenerator,
    paths.hhGenerator,
    paths.bySourceExtraction,
    paths.hhSourceExtraction,
    paths.byMapping,
    paths.hhMapping,
    paths.provenance,
    paths.sourceGoalClosure,
    paths.sourceGoalMembership,
    paths.visualizationQa,
    paths.visualizationReview,
    paths.physicsInputTest,
    paths.physicsSourceManifest,
    ...compositionViewPaths,
  ]
  const expandedViews = expandLegacyViews ? buildCompositionViews() : new Map<string, JsonRecord>()
  const plannedFiles = orderedPaths.map((path) => ({
    path,
    bytes: expandedViews.has(path)
      ? serializeJson(expandedViews.get(path))
      : readFileSync(absolute(path), 'utf8'),
    ...(path === paths.visualizationReview ? { appendOnly: true } : {}),
  }))
  const canonical = readJson(paths.canonical)
  const semanticKinds = readJson(paths.semanticKinds)
  if (
    canonical.goals?.length !== 703
    || semanticKinds.counts?.curricularAtomic !== 459
    || semanticKinds.counts?.curricularArea !== 100
    || semanticKinds.counts?.total !== 703
  ) throw new Error('Exact-after Physics semantic counts are internally inconsistent')
  return {
    semanticKinds,
    visualizationReview: readFileSync(absolute(paths.visualizationReview), 'utf8'),
    plannedFiles,
  }
}

function assertExactAfterBindings(files: PlannedFile[]): void {
  if (files.length !== Object.keys(expectedAfterHashes).length) {
    throw new Error('Batch-022 exact-after binding count drifted')
  }
  for (const { path, bytes } of files) {
    const expected = expectedAfterHashes[path]
    if (!expected || sha256(bytes) !== expected) {
      throw new Error(`Batch-022 planned after-state drift for ${path}: ${sha256(bytes)} != ${String(expected)}`)
    }
  }
}

const boundedState = classifyBoundedState()
assertImmutableProtectedInputs()
const adjudication = loadAdjudication()
const plan = boundedState === 'exact-before'
  ? buildExactBeforePlan(adjudication)
  : loadMaterializedPlan(boundedState === 'legacy-after-needs-view-expansion')
const { semanticKinds, visualizationReview, plannedFiles } = plan
assertOutputBoundary(plannedFiles)
assertAppendOnlyStates(plannedFiles)
assertExactAfterBindings(plannedFiles)

const boundedPlanSha256 = sha256(stableJson({
  adjudicationSha256: expectedAdjudicationSha256,
  followUpConfigSha256: expectedFollowUpConfigSha256,
  exactBeforeHashes: expectedBeforeHashes,
  protectedGeneratorInputHashes,
  requiredFollowUpGoalIds,
  keepIds,
  revisedIds,
  splitParentIds,
  childIds,
  officialSolarContentEvidence: adjudication.officialSolarContentEvidence,
  byMappingAdjudications,
  hhMappingAdjudications,
  atomicityReasons,
  memoryReasons,
  protectedAssetHashes,
  protectedPromptHashes,
  visualizationReviewSha256: sha256(visualizationReview),
  plannedOutputBindings: plannedFiles.map(({ path, bytes, appendOnly }) => ({
    path,
    sha256: sha256(bytes),
    appendOnly: appendOnly === true,
  })),
}))
if (expectedBoundedPlanSha256 !== 'PENDING' && boundedPlanSha256 !== expectedBoundedPlanSha256) {
  throw new Error(`Batch-022 bounded plan drift: ${boundedPlanSha256} != ${expectedBoundedPlanSha256}`)
}

const changed = changedPlannedFiles(plannedFiles)
if (checkMode && changed.length > 0) {
  throw new Error(`Batch-022 is not applied; ${changed.length} planned files differ`)
}

if (writeMode) {
  if (expectedBoundedPlanSha256 === 'PENDING') {
    throw new Error(`Refusing --write until expectedBoundedPlanSha256 is independently bound to ${boundedPlanSha256}`)
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
  for (const { path, bytes } of plannedFiles) assertSha256(path, sha256(bytes), 'Batch-022 written output')
}

const status = writeMode ? 'WRITE' : changed.length === 0 ? 'PASS' : 'PLAN'
console.log(
  `CHECK apply_physics_batch022_astrophysics_adjudication ${status} `
  + `state=${boundedState} `
  + `keep=12 revisions=3 splitParents=5 children=13 followUp=16 `
  + `sourceGoals=BY301+HH154 mappings=BY1008+HH220 views=4-expanded-clusters assessments=unchanged `
  + `curricularAtomic=${semanticKinds.counts.curricularAtomic} curricularArea=${semanticKinds.counts.curricularArea} `
  + `plannedWrites=${changed.length} files=${changed.map(({ path }) => basename(path)).join(',') || '-'}`,
)
console.log(`BOUNDED_PLAN_SHA256 ${boundedPlanSha256} binding=${expectedBoundedPlanSha256}`)
console.log(`OUTPUT_HASHES ${JSON.stringify(Object.fromEntries(plannedFiles.map(({ path, bytes }) => [path, sha256(bytes)])))}`)
console.log('PRESERVE existing-nbp-assets=7 historical-prompts=8 hh-source-extraction=byte-identical assessments=all')
console.log('DEFER child-visualizations=13 revised-mass-visualization=1 provider=Google-Gemini-Nano-Banana-Pro no-substitute-assets')
