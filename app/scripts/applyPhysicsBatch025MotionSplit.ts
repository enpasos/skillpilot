import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import * as ts from 'typescript'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

// The bounded curriculum ledgers predate a shared TypeScript schema and are
// deliberately validated field by field below.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonRecord = Record<string, any>
type PlannedFile = { path: string; bytes: string }
type OutputState = 'before' | 'after'
type MappingChange = {
  sourceGoalId: string
  beforeCanonicalGoalIds: string[]
  removeCanonicalGoalIds?: string[]
  addCanonicalGoalIds?: string[]
  rationale: string
}

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
const allowedArguments = new Set(['--write', '--check'])
const unexpectedArguments = process.argv.slice(2).filter((argument) => !allowedArguments.has(argument))
if (unexpectedArguments.length > 0) throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)
if (writeMode && checkMode) throw new Error('Use either --write or --check, not both')

const reviewedAt = '2026-08-29'
const reviewer = 'codex-physics-batch-025-motion-split-2026-08-29'
const physicsLandscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'

const ids = {
  motionCorridor: '65ddd780-0323-45d1-8f94-5e31bf28da23',
  freeFallCluster: '230345f3-c360-4963-b390-ab94e3e2c864',
  uniformMotion: '971beafa-6ba5-4c82-ac8b-7ebf66eec3dd',
  accelerationFoundation: '5a9702f4-7e4d-457d-b98c-f0bafcd1e386',
  acceleratedMotion: 'e4b38061-1f28-43ad-8371-a3e7c0e81856',
  averageInstantaneousVelocity: 'bf8517a9-142b-5789-826a-767f3b277998',
  heLegacyMotion: 'd00d74e7-4fce-48e2-9d00-49f52082f8e6',
} as const

const stableCarryoverGoalIds = [
  '4a2bf015-052b-4af0-aed7-324259fa1a8a',
  '00245a43-eb89-47d2-92d7-21799dbec9f3',
  '94784e0a-7ddc-48be-91fb-dc82b78eb322',
  '7eeff2de-6015-49a6-a96e-a488d886dc9f',
] as const
const revisedFreshReviewGoalId = '253a71d2-e751-4c63-acbe-238b71463cd8'

const physicsSekIProjectionCounterContract = {
  visibleProjectedRouteTargetGoalOccurrences: 6387,
  visibleProfileSelectedAtomicGoalOccurrences: 6215,
  visibleProjectedRouteTargetGoalOccurrencesExcludedByProfileSelector: 172,
  uniqueProjectedRouteTargetsExcludedByProfileSelector: 57,
} as const

const allJurisdictions = [
  'DE-BB', 'DE-BE', 'DE-BW', 'DE-BY', 'DE-HB', 'DE-HE', 'DE-HH', 'DE-MV',
  'DE-NI', 'DE-NW', 'DE-RP', 'DE-SH', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH',
] as const

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl',
  provenance: 'curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json',
  heLegacyMapping:
    'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_to_canonical_physics.json',
  heGenerator: 'app/scripts/generateHePhysicsSourceExtraction.ts',
  mvGenerator: 'app/scripts/generateMvPhysicsSourceExtraction.ts',
  shGenerator: 'app/scripts/generateShPhysicsSourceExtraction.ts',
  slGenerator: 'app/scripts/generateSlPhysicsSourceExtraction.ts',
  snGenerator: 'app/scripts/generateSnPhysicsSourceExtraction.ts',
  stGenerator: 'app/scripts/generateStPhysicsSourceExtraction.ts',
  heUpperMapping:
    'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_source_extraction_to_canonical_physics.review.json',
  mvLowerMapping:
    'curricula/DE/Gymnasium/mapping/DE-MV/lower-secondary/mv_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  shUpperMapping:
    'curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_physics_upper_secondary_source_extraction_to_canonical_physics.review.json',
  slLowerMapping:
    'curricula/DE/Gymnasium/mapping/DE-SL/lower-secondary/sl_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  slUpperMapping:
    'curricula/DE/Gymnasium/mapping/DE-SL/upper-secondary/sl_physics_upper_secondary_source_extraction_to_canonical_physics.review.json',
  snLowerMapping:
    'curricula/DE/Gymnasium/mapping/DE-SN/lower-secondary/sn_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  snUpperMapping:
    'curricula/DE/Gymnasium/mapping/DE-SN/upper-secondary/sn_physics_upper_secondary_source_extraction_to_canonical_physics.review.json',
  stLowerMapping:
    'curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary/st_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
  heUpperSourceExtraction:
    'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_PHYSIK_SEKII_KC2024.source-extraction.json',
  mvLowerSourceExtraction:
    'curricula/DE/Gymnasium/input/MV/lower-secondary/source-extraction/DE_MV_PHYSIK_SEKI_RAHMENPLAN_2022.source-extraction.json',
  shUpperSourceExtraction:
    'curricula/DE/Gymnasium/input/SH/upper-secondary/source-extraction/DE_SH_PHYSIK_SEKII_FACHANFORDERUNGEN_2022.source-extraction.json',
  slLowerSourceExtraction:
    'curricula/DE/Gymnasium/input/SL/lower-secondary/source-extraction/DE_SL_PHYSIK_SEKI_GYM9_2023_2026.source-extraction.json',
  slUpperSourceExtraction:
    'curricula/DE/Gymnasium/input/SL/upper-secondary/source-extraction/DE_SL_PHYSIK_SEKII_GOS_2023.source-extraction.json',
  snLowerSourceExtraction:
    'curricula/DE/Gymnasium/input/SN/lower-secondary/source-extraction/DE_SN_PHYSIK_SEKI_LEHRPLAN_GYMNASIUM_2025.source-extraction.json',
  snUpperSourceExtraction:
    'curricula/DE/Gymnasium/input/SN/upper-secondary/source-extraction/DE_SN_PHYSIK_SEKII_LEHRPLAN_GYMNASIUM_2025.source-extraction.json',
  stLowerSourceExtraction:
    'curricula/DE/Gymnasium/input/ST/lower-secondary/source-extraction/DE_ST_PHYSIK_SEKI_FACHLEHRPLAN_GYMNASIUM_2022.source-extraction.json',
  batch025Config:
    'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-28/'
    + 'batch-025-e-mechanics-energy-current-20-v1.config.json',
  followUpConfig:
    'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-29/'
    + 'batch-025a-e-mechanics-energy-structural-follow-up-17-v1.config.json',
  physicsAtlasSourceManifest: 'app/scripts/config/goal-books/de-gym-physics-national-atlas.sources.json',
  physicsGoalBookInputTest: 'app/scripts/testPhysicsGoalBookInputs.ts',
  semanticFingerprintHelper: 'app/scripts/goalBookModel.ts',
  canonicalVisualization:
    `curricula/DE/Gymnasium/visualizations/physik/${ids.acceleratedMotion}/${ids.acceleratedMotion}.jpg`,
  canonicalVisualizationPrompt:
    `curricula/DE/Gymnasium/visualizations/physik/${ids.acceleratedMotion}/prompt.de.md`,
  publicVisualization:
    `app/public/assets/goal-visualizations/physik/${ids.acceleratedMotion}/${ids.acceleratedMotion}.jpg`,
} as const

const fourViewJurisdictions = [
  'bb', 'be', 'hb', 'he', 'hh', 'mv', 'ni', 'nw', 'rp', 'sh', 'sl', 'sn', 'st', 'th',
] as const
const compositionViewPaths = [
  ...fourViewJurisdictions.flatMap((jurisdiction) => [
    `curricula/DE/Gymnasium/composition-views/physik/de-${jurisdiction}-gk.view.json`,
    `curricula/DE/Gymnasium/composition-views/physik/de-${jurisdiction}-lk.view.json`,
    `curricula/DE/Gymnasium/composition-views/physik/de-${jurisdiction}-sekii-gk.view.json`,
    `curricula/DE/Gymnasium/composition-views/physik/de-${jurisdiction}-sekii-lk.view.json`,
  ]),
  'curricula/DE/Gymnasium/composition-views/physik/de-bw-gk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-bw-lk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-by-gk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-by-lk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-de-gym-physics-gk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-de-gym-physics-lk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-de-gym-sekii-physics-gk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-de-gym-sekii-physics-lk.view.json',
].sort()
if (compositionViewPaths.length !== 64 || new Set(compositionViewPaths).size !== 64) {
  throw new Error('Batch-025 motion split must bind exactly 64 Physics composition views')
}

const targetViewPrefixes = new Set(['de-he-', 'de-mv-', 'de-sh-', 'de-sl-', 'de-sn-', 'de-st-', 'de-de-'])
const isTargetView = (path: string): boolean => {
  const fileName = basename(path)
  return [...targetViewPrefixes].some((prefix) => fileName.startsWith(prefix))
}
if (compositionViewPaths.filter(isTargetView).length !== 28) {
  throw new Error('Batch-025 target-view contract must contain exactly 28 views')
}

const generatorPaths = [
  paths.heGenerator,
  paths.mvGenerator,
  paths.shGenerator,
  paths.slGenerator,
  paths.snGenerator,
  paths.stGenerator,
] as const
const mappingPaths = [
  paths.heUpperMapping,
  paths.mvLowerMapping,
  paths.shUpperMapping,
  paths.slLowerMapping,
  paths.slUpperMapping,
  paths.snLowerMapping,
  paths.snUpperMapping,
  paths.stLowerMapping,
] as const
const outputPaths = [
  paths.canonical,
  ...compositionViewPaths,
  ...generatorPaths,
  ...mappingPaths,
  paths.heLegacyMapping,
  paths.provenance,
  paths.semanticKinds,
  paths.atomicity,
  paths.memory,
  paths.physicsAtlasSourceManifest,
  paths.physicsGoalBookInputTest,
  paths.followUpConfig,
] as const
if (outputPaths.length !== 87 || new Set(outputPaths).size !== 87) {
  throw new Error('Batch-025 motion split output boundary must contain exactly 87 files')
}

// The text/card applier still runs before this split. Keep every write-enabling
// corpus/output/plan binding deliberately unbound until that exact post-text
// input state and this corrected 87-file plan have been independently reviewed.
const expectedBeforeCorpusSha256 = 'f1b085ea2a074a7a87254464310331fa7fce7118927113c82e8438b47aae1db5'
const expectedBeforeHashes: Record<string, string> = {
  "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json": "475149b902626c877973c45e78ec9d46965334f0172415fb3d9df2fae14524a1",
  "curricula/DE/Gymnasium/composition-views/physik/de-bb-gk.view.json": "bdb4ba3c6ad5f3983b5ba66aa308e558209592a5261eaf17d9c22ab581b7a793",
  "curricula/DE/Gymnasium/composition-views/physik/de-bb-lk.view.json": "a02ab995adbd492bdce0ca974831ff9bed9fa9638dc39e64b5dcbafd297b3b83",
  "curricula/DE/Gymnasium/composition-views/physik/de-bb-sekii-gk.view.json": "8bb7f14f4837e3c0c1bea38689193b165d07201d2d049450b54315654c7d46c8",
  "curricula/DE/Gymnasium/composition-views/physik/de-bb-sekii-lk.view.json": "b53f4463c237adc228eb0da8bb4563b34ea505271108aa7f2cca9ff8c0b45c41",
  "curricula/DE/Gymnasium/composition-views/physik/de-be-gk.view.json": "72aa9f2ec00d26c0774c061e0556f5309d2d83b299ad69695db1ea083939c04b",
  "curricula/DE/Gymnasium/composition-views/physik/de-be-lk.view.json": "98b8e76608602f8551ab5737fea116722d8d0defd7ec5f61abf926b4e2ee614b",
  "curricula/DE/Gymnasium/composition-views/physik/de-be-sekii-gk.view.json": "b1ff3e0d7f88dd07f741a4ece4d1129ea7bf97c4a95378474fedcabe90faf3ee",
  "curricula/DE/Gymnasium/composition-views/physik/de-be-sekii-lk.view.json": "6a8066a8753c4718f12c75681e814e2b628c552bc47a4597a3c8d3e20794ce59",
  "curricula/DE/Gymnasium/composition-views/physik/de-bw-gk.view.json": "bd9e8794594c4885677456f0ed2eb7ebe211c561d8fa5f4dd7a397a854ecc663",
  "curricula/DE/Gymnasium/composition-views/physik/de-bw-lk.view.json": "4e7b5d1c83037432bbbb893295687409248a9c07eab042a70d21aca82094d2a5",
  "curricula/DE/Gymnasium/composition-views/physik/de-by-gk.view.json": "2c80b1313671d86042cee38e612613cce43168a00bd85a01d4e2da536c1abecd",
  "curricula/DE/Gymnasium/composition-views/physik/de-by-lk.view.json": "24617b88dcd89b6f02162d0eaa082860a95d111a992ef4aa93600a9e41943556",
  "curricula/DE/Gymnasium/composition-views/physik/de-de-gym-physics-gk.view.json": "9d75482ea4451d7f42a1acc19b498d647d1e4e76a332ce3e6a213efd0836246d",
  "curricula/DE/Gymnasium/composition-views/physik/de-de-gym-physics-lk.view.json": "3d4e0ec8e427bfa79e50a1baec386a1c30a26236cb0b7fd31308f6f22b764ada",
  "curricula/DE/Gymnasium/composition-views/physik/de-de-gym-sekii-physics-gk.view.json": "f14776a1db667eb2dd88107f97ff8ab6d6f4614c9385487cecde5b39c56e7d23",
  "curricula/DE/Gymnasium/composition-views/physik/de-de-gym-sekii-physics-lk.view.json": "21e9b4bac5c5ccf3b5822e6643f7475a9e422f67211b7ea6982cda20f58818ac",
  "curricula/DE/Gymnasium/composition-views/physik/de-hb-gk.view.json": "cecd37d4d34c0caf602d2b7962d1519e471ac50a6f5db5c6dd24f1c54af3e48b",
  "curricula/DE/Gymnasium/composition-views/physik/de-hb-lk.view.json": "1a8519655b308915845810ac49678e36679e7db86852cf4f8607f31c66da6d9d",
  "curricula/DE/Gymnasium/composition-views/physik/de-hb-sekii-gk.view.json": "c1e409a891bd3452c8e8de6c045e20f4ee2d9ac4e7d56ec358d8dde07c597578",
  "curricula/DE/Gymnasium/composition-views/physik/de-hb-sekii-lk.view.json": "0dafb8d55d77a832029b2573458b12e734154c358ce12d2d42d5e8610bf21104",
  "curricula/DE/Gymnasium/composition-views/physik/de-he-gk.view.json": "6fd13a7efcdd133fcfa41605f0c596300ef0b74eee593db11c3b8094c2864f9c",
  "curricula/DE/Gymnasium/composition-views/physik/de-he-lk.view.json": "ea34854e6549fc1e6317b55f2eb492327518db2e95e7a592e6ec28da26f115f2",
  "curricula/DE/Gymnasium/composition-views/physik/de-he-sekii-gk.view.json": "f9face6c1babe179d3689721439faaa0879feb9a26676a4e10b18de2d95d4992",
  "curricula/DE/Gymnasium/composition-views/physik/de-he-sekii-lk.view.json": "5bef6ec9a4a0cbced2fc30347b276784f46941ebb6bf6c1851fad984d179557c",
  "curricula/DE/Gymnasium/composition-views/physik/de-hh-gk.view.json": "5ea09dcad06101fe2994b4ebf09c3ffcddf98e5515fd7d449acbd41824ff0d09",
  "curricula/DE/Gymnasium/composition-views/physik/de-hh-lk.view.json": "ab76a572c0554418d215f1c7d1e9f0067d925c54622348e452042941e7a86c40",
  "curricula/DE/Gymnasium/composition-views/physik/de-hh-sekii-gk.view.json": "504ab53bd989891e0a489d768ca9e9da3267c50ee5576182a3c391945c08abff",
  "curricula/DE/Gymnasium/composition-views/physik/de-hh-sekii-lk.view.json": "aa52b135f15e19611dacb714b03e5657f6701b8e64d18bf5d3fb9f5122420352",
  "curricula/DE/Gymnasium/composition-views/physik/de-mv-gk.view.json": "ec053adcb9cc1056a8ceb927695844175ed9497311dcf52695b91c5d46f75f0b",
  "curricula/DE/Gymnasium/composition-views/physik/de-mv-lk.view.json": "3d2433a7cf4fa7f9ceb1e7f9750d5a5c29dde0ffa2e8f4652270b32c73869bd2",
  "curricula/DE/Gymnasium/composition-views/physik/de-mv-sekii-gk.view.json": "0f461feccf5557c7731608f1439ef633124206533e6fa4f25e611cc273253540",
  "curricula/DE/Gymnasium/composition-views/physik/de-mv-sekii-lk.view.json": "9d765eec8e57a6c37573c739838c5df3340abadfc6edcfd2276e102692391cde",
  "curricula/DE/Gymnasium/composition-views/physik/de-ni-gk.view.json": "a76064ffbe2ac36bc27c931588e6bb732b1bf995db76f886edb738a3d50d4670",
  "curricula/DE/Gymnasium/composition-views/physik/de-ni-lk.view.json": "b7bcde8ab86d6719d01ab4369256156aece41e8f8d6e4d2eea571a6afe74ba33",
  "curricula/DE/Gymnasium/composition-views/physik/de-ni-sekii-gk.view.json": "7436a7406f7c6b3988e9581e22ca77068b743d2aa693bf6e5aacae4c3e7512a1",
  "curricula/DE/Gymnasium/composition-views/physik/de-ni-sekii-lk.view.json": "d789bc89a2866392bb8cd9cfeb286a815da48b9e094eeccf9c3c5216990bb4b0",
  "curricula/DE/Gymnasium/composition-views/physik/de-nw-gk.view.json": "b183bf78e06801f5e11c100df9b71e0ff7584e69c49268c8fcd8f82ee028e035",
  "curricula/DE/Gymnasium/composition-views/physik/de-nw-lk.view.json": "25b528e79a3a7be36a875431cda611644a7b0752fad9f2f4ffc84ffc08b1726a",
  "curricula/DE/Gymnasium/composition-views/physik/de-nw-sekii-gk.view.json": "6ef146ea8dd831fd901cb1b4ce17507885c764243c67283ad34c1b4aeea2a3fb",
  "curricula/DE/Gymnasium/composition-views/physik/de-nw-sekii-lk.view.json": "f2fba939a551b34533f1455c637ddb0a15609d9a93bfb7c226d8cf9b0e07987f",
  "curricula/DE/Gymnasium/composition-views/physik/de-rp-gk.view.json": "f25b0d676ac7b7a693b91486da3a5a587ac07079f66fe01eddf3f051d825f513",
  "curricula/DE/Gymnasium/composition-views/physik/de-rp-lk.view.json": "b4115394b3380c1944cc23d07ac88d0d082c7426b7ee9cb737e0f5ed22c1c9d2",
  "curricula/DE/Gymnasium/composition-views/physik/de-rp-sekii-gk.view.json": "979bf18e28f7ce82a715f0c0eda76a9d1e42301bd1279d058d22a3e333a3ce56",
  "curricula/DE/Gymnasium/composition-views/physik/de-rp-sekii-lk.view.json": "ac35682b705c177d4a747fea7178adfcadc9517204a16b687c5d12eeb8ebcf9f",
  "curricula/DE/Gymnasium/composition-views/physik/de-sh-gk.view.json": "6e4935223f720d914eea09e6f37b6f8b6fecfd2f02966705c8582a311396551f",
  "curricula/DE/Gymnasium/composition-views/physik/de-sh-lk.view.json": "faaf062c69f3ee38204ae4be91983e4065ec79920aff981ede53970b60c68b5b",
  "curricula/DE/Gymnasium/composition-views/physik/de-sh-sekii-gk.view.json": "0c59d520aef284f2ef9eb986f69973180aeca1b01245c372c3910dd61fb75f5e",
  "curricula/DE/Gymnasium/composition-views/physik/de-sh-sekii-lk.view.json": "4fecb66983ef717a9017e598989f789d24f535efb1a9a831eace1dc2bc474067",
  "curricula/DE/Gymnasium/composition-views/physik/de-sl-gk.view.json": "1a487e362b0c0f8bb4fe1ed7df70c68277522a56c2d385d870921199473e0592",
  "curricula/DE/Gymnasium/composition-views/physik/de-sl-lk.view.json": "0d00c79c6c6f57504da5ce5d84e3ed0e5cd6d35ae673709cec33ce2c17fb6040",
  "curricula/DE/Gymnasium/composition-views/physik/de-sl-sekii-gk.view.json": "7a98c45f7aa0540c19bf074a33a6b96b9b2ed61a6a394b26176b4531320c831b",
  "curricula/DE/Gymnasium/composition-views/physik/de-sl-sekii-lk.view.json": "7ad2ac6ab6b393018dd296e8b7c2182fe8fe01893ea5a7f3001a655efeaba2fb",
  "curricula/DE/Gymnasium/composition-views/physik/de-sn-gk.view.json": "a1ab987e169f94f950ad9e149bc7535d986b90ca9c14f14817a2f90a752c9724",
  "curricula/DE/Gymnasium/composition-views/physik/de-sn-lk.view.json": "2feec3fe568c1e98a828ef77c349ce1ee9fc44f71e640f3bbe9e43dbb66b58fc",
  "curricula/DE/Gymnasium/composition-views/physik/de-sn-sekii-gk.view.json": "0c48551be16db4a3dda3571fb38fbbe674b6ad9a7c41e916ad0ad0435c45a7c3",
  "curricula/DE/Gymnasium/composition-views/physik/de-sn-sekii-lk.view.json": "390fc16c27e8430b74d4264a6c59d0c6a50709085bf26d9a2793c371cb5339df",
  "curricula/DE/Gymnasium/composition-views/physik/de-st-gk.view.json": "bc4fa1c3b1451a7798864724a531d57a20b847b40689b200b1e231d7c6163082",
  "curricula/DE/Gymnasium/composition-views/physik/de-st-lk.view.json": "afcdb37579eea37c3c8ee2d5d02ffe294022ac88685459c12aecf01de5be8aba",
  "curricula/DE/Gymnasium/composition-views/physik/de-st-sekii-gk.view.json": "6c5a8684a0b8c89103f007c07518ebd951cfec23022924f25c3ba87a79f88e3c",
  "curricula/DE/Gymnasium/composition-views/physik/de-st-sekii-lk.view.json": "f60250e89258344db6f6c71185bd9ac898d432214e0c53e8ba1b437e70c90807",
  "curricula/DE/Gymnasium/composition-views/physik/de-th-gk.view.json": "989fb7dbaca4fdf0ecae831a63affe5165046860c100fa915004c47e605bbf6d",
  "curricula/DE/Gymnasium/composition-views/physik/de-th-lk.view.json": "8569703a656b3a06d1f50c91ada9664c6f64f719a06ef67380bac1c302ca8de7",
  "curricula/DE/Gymnasium/composition-views/physik/de-th-sekii-gk.view.json": "310f50fe49d21a85ab105a5eb0d1a40d7c47c269470629b14e69a391b07fab2b",
  "curricula/DE/Gymnasium/composition-views/physik/de-th-sekii-lk.view.json": "6640518708b38f7ff81c1658076f0fe1819af8576c8db0d5810a8fca7276d709",
  "app/scripts/generateHePhysicsSourceExtraction.ts": "647c1f65f8a7da4d2323379ba8e74d4dffe8d4d2c39976d6ca305283ad74415a",
  "app/scripts/generateMvPhysicsSourceExtraction.ts": "46bbdcabbdeb93c8b47a396dfd44307e68a48bc83b09d103b3728828a92e4b43",
  "app/scripts/generateShPhysicsSourceExtraction.ts": "e3c9af75b59f9cb28bb264677ba7d4ab92322bc7b9e9e383ad66a917f1755a1c",
  "app/scripts/generateSlPhysicsSourceExtraction.ts": "7666d8a6a4229223bc5dddda40426c598175dd694f0b836c1cc33ce9a23ca178",
  "app/scripts/generateSnPhysicsSourceExtraction.ts": "9693a2519228e9a9c29fbc5357254ed2a12594877440d2b332f15c095629184b",
  "app/scripts/generateStPhysicsSourceExtraction.ts": "c106b058734455a3f20365eebd745ad6613631fde9774c7d0d54b9e392550519",
  "curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_source_extraction_to_canonical_physics.review.json": "f10c87f245b5531d7b063c8720234d039e7ca684ba1fc0c98600c5707fa7e53e",
  "curricula/DE/Gymnasium/mapping/DE-MV/lower-secondary/mv_physics_lower_secondary_source_extraction_to_canonical_physics.review.json": "1778c32385eddd31901563a9e0abc6dd9ccf3a042d9b93b483c95a3015fb84bd",
  "curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_physics_upper_secondary_source_extraction_to_canonical_physics.review.json": "6db8745042568de178c5e048669c416f610b4425ce9aa20d167099059ae50c9e",
  "curricula/DE/Gymnasium/mapping/DE-SL/lower-secondary/sl_physics_lower_secondary_source_extraction_to_canonical_physics.review.json": "17a605ac97c187651f151cb161b572ccff9aca282ad727524c4eb59d7d759565",
  "curricula/DE/Gymnasium/mapping/DE-SL/upper-secondary/sl_physics_upper_secondary_source_extraction_to_canonical_physics.review.json": "144b9bbf79cc742a0628242da6e2cb712c65cdca26190537d4b47f93c6e87df9",
  "curricula/DE/Gymnasium/mapping/DE-SN/lower-secondary/sn_physics_lower_secondary_source_extraction_to_canonical_physics.review.json": "76e64f6119d745c83d20b265945e7854cadf9922824ce17bce02fbca54c08471",
  "curricula/DE/Gymnasium/mapping/DE-SN/upper-secondary/sn_physics_upper_secondary_source_extraction_to_canonical_physics.review.json": "c42eaf11cf8cf9f82d5061c28332056313380e4d89cf9cbab794d199f4bf4b60",
  "curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary/st_physics_lower_secondary_source_extraction_to_canonical_physics.review.json": "e9986e185069ff9ad3b54181deb2872eac69606bba755efe0d8314a23088b563",
  "curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_to_canonical_physics.json": "d432e9b41ef3359ed635e5deb320a62ff3865cf7afc613f1bbf4d8ab1f31f45c",
  "curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json": "d24356366e3935a5680c45da890189209e93e810acc67d7dd8e70d36128fb500",
  "curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json": "3251ed1a10d47771c06a899fded3f825087706cd9db81cb841ea8fcefe86dd99",
  "curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl": "545ebdacfd3f658fad7e6acdf90cb42e6d0bf58b9c71ab9c1c0c88c4b6674a39",
  "curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl": "f58b1d703da61b46597a650fc82c6bc0dead489e5837edc018d664e4515b3d24",
  "app/scripts/config/goal-books/de-gym-physics-national-atlas.sources.json": "916a453e94840bb3afc94c53d1cad1d39a85e2309a7bc7006bf162fcc6631fa5",
  "app/scripts/testPhysicsGoalBookInputs.ts": "5edbffe620b4dc48dfa14b780435d8bac1eeb8e0b884e6a19c3b41da160fc161",
  "curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-29/batch-025a-e-mechanics-energy-structural-follow-up-17-v1.config.json": "MISSING"
}
const expectedAfterHashes: Record<string, string> = {
  "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json": "c54ad2bb8dff45e0dca73e981f5f7049c07ad2f696081e8614ebd94475fc4d30",
  "curricula/DE/Gymnasium/composition-views/physik/de-bb-gk.view.json": "4baade3f773c01e336c1327d669939e6f4bbcbcd60301470d70b68191d8c78f5",
  "curricula/DE/Gymnasium/composition-views/physik/de-bb-lk.view.json": "5f30f2da4ba5e38ec8a6b2d6c72c431ae44cc72f73d8943f7e0e1258e0cab0b2",
  "curricula/DE/Gymnasium/composition-views/physik/de-bb-sekii-gk.view.json": "52b1b59df87288d2fd7572fd8efaf7ea8262ee7f6cdeb9cbdae677975cc8e4d4",
  "curricula/DE/Gymnasium/composition-views/physik/de-bb-sekii-lk.view.json": "cfd9febc3dc2a84a2af9f12c3717a50ca97887cfa7b4e3565c04d1f018db96bc",
  "curricula/DE/Gymnasium/composition-views/physik/de-be-gk.view.json": "915c5c2aedfb0111b104328eb91483d792db3119e730ffd53e9aed487820f8c5",
  "curricula/DE/Gymnasium/composition-views/physik/de-be-lk.view.json": "1b5103e1ecf8fd8468b3c1db60296900abcd56deeb3c2fe6d8d12ca8b0da2d8a",
  "curricula/DE/Gymnasium/composition-views/physik/de-be-sekii-gk.view.json": "a1cf696f5cf00791f12d85df62dbda9a6211c3ae5c06b453344ab8836123e65c",
  "curricula/DE/Gymnasium/composition-views/physik/de-be-sekii-lk.view.json": "fa9796fb59ed684d88ef5a8854375386b634509e793bc65c0f91876fcd7f17ce",
  "curricula/DE/Gymnasium/composition-views/physik/de-bw-gk.view.json": "c26ea17c9ac2ad4d0c31e81fd4fdddd2f8f619c7988abbd7e72a2ce46742dff3",
  "curricula/DE/Gymnasium/composition-views/physik/de-bw-lk.view.json": "ccba1a3c6d26e3c6c9bb7923288c64fe1381a601a8ce60005df0e23ddbcf1bfb",
  "curricula/DE/Gymnasium/composition-views/physik/de-by-gk.view.json": "c4a5a2de400122e61dfcdf762312a85d851bc1e1162d0c7fdd9a64c39c349e9b",
  "curricula/DE/Gymnasium/composition-views/physik/de-by-lk.view.json": "87ce49c7d7ad3caeacb77251e282ef670bc687c05d88e65442436663ae08aa84",
  "curricula/DE/Gymnasium/composition-views/physik/de-de-gym-physics-gk.view.json": "52129d463ffa4d51aa84efab67eca62a6f7d555b3c87113f2dd890129da0592a",
  "curricula/DE/Gymnasium/composition-views/physik/de-de-gym-physics-lk.view.json": "88359c914e02f8f6b51f6085f7a27befad61bf9de0f2d53eae6c89e8a4d2dc55",
  "curricula/DE/Gymnasium/composition-views/physik/de-de-gym-sekii-physics-gk.view.json": "909c9eb8ee1744585f21e21694ae2e5f9ce3d11f5d4b55778a47dc218eb4034c",
  "curricula/DE/Gymnasium/composition-views/physik/de-de-gym-sekii-physics-lk.view.json": "6dc605a3ca9cf0de29452619e560374bc0aca9f222b8654dac92d064f06e32bb",
  "curricula/DE/Gymnasium/composition-views/physik/de-hb-gk.view.json": "47d09837c21cd5057b0c862910241c3d66df5a84a307a705d1b024c56c004f6c",
  "curricula/DE/Gymnasium/composition-views/physik/de-hb-lk.view.json": "fe925c701c2f40952a263ee79b44aadc1bab3951992601a1964229e4d208c8eb",
  "curricula/DE/Gymnasium/composition-views/physik/de-hb-sekii-gk.view.json": "055d515a02688d23c12d1c42072f924151c988f9a7b5f6684e6af75c39dec38e",
  "curricula/DE/Gymnasium/composition-views/physik/de-hb-sekii-lk.view.json": "299893423b5dd566ada4d975bd13157e06c916b466aedbf9835d031694664e88",
  "curricula/DE/Gymnasium/composition-views/physik/de-he-gk.view.json": "189c62d90edf7d8e9412436bce434ecb683615693abffe0ab4cf1333cc57b467",
  "curricula/DE/Gymnasium/composition-views/physik/de-he-lk.view.json": "5d00ec99f2e6c21e4ccf7178a845e62f3dc86f6a9612f5333bb6f190690f59a1",
  "curricula/DE/Gymnasium/composition-views/physik/de-he-sekii-gk.view.json": "fe4c00512a1b5e18e08dbdc8d15b246338aee50e51194a8a28f56c1da9c4699c",
  "curricula/DE/Gymnasium/composition-views/physik/de-he-sekii-lk.view.json": "88e769b124358e58f27d66681287380d9aa0fce4b6ade88593cf7273715abf95",
  "curricula/DE/Gymnasium/composition-views/physik/de-hh-gk.view.json": "e690375124bcbca412034532a8ee4e307bcca37e08bcbc3233066310f44a0ae5",
  "curricula/DE/Gymnasium/composition-views/physik/de-hh-lk.view.json": "5eae7b8ae458a6fd822266849e9d0c3f71556d3cd7cc45ecec71f037af8eba17",
  "curricula/DE/Gymnasium/composition-views/physik/de-hh-sekii-gk.view.json": "e94fa135999546e387e3ea1406a68de92f4d266f2f7b45078403be5aba452f56",
  "curricula/DE/Gymnasium/composition-views/physik/de-hh-sekii-lk.view.json": "9cfd4c511b16ac5abee358e6f5f0529de8a23e927a125e2f826646ecb54d23f7",
  "curricula/DE/Gymnasium/composition-views/physik/de-mv-gk.view.json": "ea5052e1db8104e823ec805682aa0b0e4747e0fe2d406ee7a5e5b35e2d3b0329",
  "curricula/DE/Gymnasium/composition-views/physik/de-mv-lk.view.json": "029cc38409a1d44e7f823e7e4a9dc95b5ca3f7134188f9d7e39f4dce063144c5",
  "curricula/DE/Gymnasium/composition-views/physik/de-mv-sekii-gk.view.json": "d4a0bfcfbf371ce454e6fa35cc3f0dcb2ed668f78a14538b6af4f69e22fabe3a",
  "curricula/DE/Gymnasium/composition-views/physik/de-mv-sekii-lk.view.json": "b4f4fc7136c226a228773d44371feda800ac2a30563d78cfe9f5a3c001ca537c",
  "curricula/DE/Gymnasium/composition-views/physik/de-ni-gk.view.json": "fda4b5c1e92bef69b04e0faa991d7f6e872b7180a86d5b13bdbb6502ccd1a123",
  "curricula/DE/Gymnasium/composition-views/physik/de-ni-lk.view.json": "7e701906f53cf75de73d9f477bbf51c8fa3b7f7618385d23775a0b9cfd158e27",
  "curricula/DE/Gymnasium/composition-views/physik/de-ni-sekii-gk.view.json": "0fcf2281447049c5d98b5965ffccce25189f4f2f91cc568320ff716736c80d58",
  "curricula/DE/Gymnasium/composition-views/physik/de-ni-sekii-lk.view.json": "4ecf29c033ab7b72e459964d2f917d8fe40ce88e78f93a2a644a463f070a2d66",
  "curricula/DE/Gymnasium/composition-views/physik/de-nw-gk.view.json": "5ddf894d1a4a3b0b4e78324d7cc49992bb2dd30bda54316977a9cb4942ca9f2d",
  "curricula/DE/Gymnasium/composition-views/physik/de-nw-lk.view.json": "cacfde85b6f1a947f5e0cec5a253e915e4da9427b94a09431a7a7b110ee1b333",
  "curricula/DE/Gymnasium/composition-views/physik/de-nw-sekii-gk.view.json": "fc05cc29639a401108904ffc838212820b7a35969aba373bbe3e18c679d6311c",
  "curricula/DE/Gymnasium/composition-views/physik/de-nw-sekii-lk.view.json": "ef6f168dcbbf75648a80838fb5311ed60dacdd2e9ad1b19119eb669b00019137",
  "curricula/DE/Gymnasium/composition-views/physik/de-rp-gk.view.json": "f69c138cc2cf29341c1ff3ac2a7c1c793f5480429f3d4c01a33734ee5dfa5819",
  "curricula/DE/Gymnasium/composition-views/physik/de-rp-lk.view.json": "9592cb6c96dc9f50f83795e3b3f32660c0155f47bb381bcaeb748a4903045564",
  "curricula/DE/Gymnasium/composition-views/physik/de-rp-sekii-gk.view.json": "4a5f62d87a2431e8ae76e378e430bf39ed442f7247930ddcdeea1063fc5ef201",
  "curricula/DE/Gymnasium/composition-views/physik/de-rp-sekii-lk.view.json": "65c263c99324ae7fd352b0c0d3b64300dd23d4b2515130510cfa8418dcf1ff9c",
  "curricula/DE/Gymnasium/composition-views/physik/de-sh-gk.view.json": "bde11403c0fe34f1babf27494348a91eb213daa6af4891b764f8539807c5926e",
  "curricula/DE/Gymnasium/composition-views/physik/de-sh-lk.view.json": "195028cc97b34d0c552bf0a341b909e1fb0d86a32659278dcf0ce78cfc6275a0",
  "curricula/DE/Gymnasium/composition-views/physik/de-sh-sekii-gk.view.json": "a439edccc944a0d278b4a345e2c541cccd6fbba11782877f989424375535958b",
  "curricula/DE/Gymnasium/composition-views/physik/de-sh-sekii-lk.view.json": "029d3a8a6b35458eaf2769a34086892206e60482178190688778839f81f0ff1c",
  "curricula/DE/Gymnasium/composition-views/physik/de-sl-gk.view.json": "811146a9adb5444f5ff3da9e6c157bee7dbde6bc4faabc99bb07e05c30ea8c41",
  "curricula/DE/Gymnasium/composition-views/physik/de-sl-lk.view.json": "a2ed3dc605dc30e8af2087fedd7eb5c3475ac1839650c958b8c20639818bebdf",
  "curricula/DE/Gymnasium/composition-views/physik/de-sl-sekii-gk.view.json": "eb8e310625be3091b615b559ac9d27f198a9d45008bd039752468305f81a1cfd",
  "curricula/DE/Gymnasium/composition-views/physik/de-sl-sekii-lk.view.json": "712c99bc04fd3dfea4be0f99110d7ef8893ce1a5a1bb0b54fdcb9c0a2e17daab",
  "curricula/DE/Gymnasium/composition-views/physik/de-sn-gk.view.json": "75274946b9b33e661633675ff6628582308ff8a688c748a507eb641372a26ecc",
  "curricula/DE/Gymnasium/composition-views/physik/de-sn-lk.view.json": "65e5afc496589f726dad2044fe2842e72eddc366dd8e83025ba385955ee49046",
  "curricula/DE/Gymnasium/composition-views/physik/de-sn-sekii-gk.view.json": "396006ac426ee370610012036ca4f8114ae0f951f2ad4e0d8231459c0ce3450e",
  "curricula/DE/Gymnasium/composition-views/physik/de-sn-sekii-lk.view.json": "80db3bb90ae57525bcf734ff90d95203ff9e67aa5100774956b92add67f59ece",
  "curricula/DE/Gymnasium/composition-views/physik/de-st-gk.view.json": "4776a1c9534353997c3c610b67ee78aa5d8f16f1da61a079a1bc72ec2987ee32",
  "curricula/DE/Gymnasium/composition-views/physik/de-st-lk.view.json": "b7a2b2f64e4d2312abc9bff774c2c7f166c6b8c56fd0c1fbb865ae1d501789fe",
  "curricula/DE/Gymnasium/composition-views/physik/de-st-sekii-gk.view.json": "49d2d6fac258f466254aa085ba5ef26867b4f56b38102e6af53315c06e90d964",
  "curricula/DE/Gymnasium/composition-views/physik/de-st-sekii-lk.view.json": "3927c7444734b9c7ffc697e2f939e9096963f5047fbf4f34755b6ca6529bdc19",
  "curricula/DE/Gymnasium/composition-views/physik/de-th-gk.view.json": "d06d9ea67d37e594621d9b11f78e21901072bd32a666d1a9598fb22ba6bd70e2",
  "curricula/DE/Gymnasium/composition-views/physik/de-th-lk.view.json": "bbfa8fecd91467953db1ffd1da10a9b708b868b2d25a283084447dad16b116ce",
  "curricula/DE/Gymnasium/composition-views/physik/de-th-sekii-gk.view.json": "80b80a8d9fa0dfd76fa55f9882a0439c0ce92a55c073041c108aff2d560e2919",
  "curricula/DE/Gymnasium/composition-views/physik/de-th-sekii-lk.view.json": "34129bfa0b222c8c1ed1c7a6bda049e72721aa03282c1630fd286e0d5e87fa3d",
  "app/scripts/generateHePhysicsSourceExtraction.ts": "170835ab15be672d9c6726e1530eb9d8d95f93a0d539bb7e10afba7679b7b5af",
  "app/scripts/generateMvPhysicsSourceExtraction.ts": "1dd04e6d61538a6347649dc4873fec135b308ec143c05157c8caaaea179b7422",
  "app/scripts/generateShPhysicsSourceExtraction.ts": "b899ba520e0b63c0bd34836c89ec55ddaffd0e1d77e43d6af1c36e13890083e6",
  "app/scripts/generateSlPhysicsSourceExtraction.ts": "433b268a61ca5aad0d8302edaa204f7416f38797d681b326aaafb1ae2f751d77",
  "app/scripts/generateSnPhysicsSourceExtraction.ts": "c70cd0913f7e347d62c709d1a9864001d607b256b11472415fe848268eac895e",
  "app/scripts/generateStPhysicsSourceExtraction.ts": "de60aa2d70610c1462af871d92b689ce2a1edb852e53b5b6e4e786af9f58486a",
  "curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_source_extraction_to_canonical_physics.review.json": "93b13790b286cb67e0a90d1e9332cf3a2a8e2136cb628653876aa48a6a1c4c7e",
  "curricula/DE/Gymnasium/mapping/DE-MV/lower-secondary/mv_physics_lower_secondary_source_extraction_to_canonical_physics.review.json": "1e99271a9301f1ed2c5b15c1ae07bdb2a1e98b2c71cfb11b4915a250bb9ed2c2",
  "curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_physics_upper_secondary_source_extraction_to_canonical_physics.review.json": "b29d31cee3d747befe6a9e46565b69724f68f69b2be0f9a8a3a770a50245e74d",
  "curricula/DE/Gymnasium/mapping/DE-SL/lower-secondary/sl_physics_lower_secondary_source_extraction_to_canonical_physics.review.json": "8db92fd81d6785ecdae1d3872d9f904806fab7baf52aa0f30527ed0250f3e91b",
  "curricula/DE/Gymnasium/mapping/DE-SL/upper-secondary/sl_physics_upper_secondary_source_extraction_to_canonical_physics.review.json": "fb744d80b092768c2e235b824c2e149e1145ea605ab4ca4138439efde2a7140b",
  "curricula/DE/Gymnasium/mapping/DE-SN/lower-secondary/sn_physics_lower_secondary_source_extraction_to_canonical_physics.review.json": "126accc8cb49470bd0c5a44ddc84d0ecff647bed97dd1b5f7a57d7a7e5042946",
  "curricula/DE/Gymnasium/mapping/DE-SN/upper-secondary/sn_physics_upper_secondary_source_extraction_to_canonical_physics.review.json": "107ce9a7304ab89705b23f43fe6427fa73bea970f8d7a2ffae3e0a0ad27b340d",
  "curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary/st_physics_lower_secondary_source_extraction_to_canonical_physics.review.json": "b0c682de2355e60d2a7f3c5ac0e0c3959f400a783ce9ee228eef64e53b485500",
  "curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_to_canonical_physics.json": "5dc838bf76eec08849e758c743ccce16dd1b2ba5b44c232e272ba020cd7a57e6",
  "curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json": "34b292ea1dfec7903785d75d460efa22d71281a6cc96729bee38919d455b8629",
  "curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json": "6ea6d370f8657c4471ba36be74387f1326d297033831fddf14d05ce47288a86b",
  "curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl": "6d333d789f826410713944ada7f3802f775051d337cf59ea248431587854c850",
  "curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl": "f4966e34861e4822e76f15b2f2e5b477cb5f8142e97b7cfbe62250efaf795112",
  "app/scripts/config/goal-books/de-gym-physics-national-atlas.sources.json": "dad6d6942b77886235e74853c44cc920293ea0b835e90d0651ca373e0407ea93",
  "app/scripts/testPhysicsGoalBookInputs.ts": "bca398b76fd2d90a07016b2091427341cfeec4b2bf7a9c3421990200232450ec",
  "curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-29/batch-025a-e-mechanics-energy-structural-follow-up-17-v1.config.json": "7c3f610555750be16dea5f242b001c6b4bdc2f71a0dea16ccb249401f6a522e1"
}
const expectedBoundedPlanSha256 = '555af00596e99b13619ad49d9dd894cd59ae54b16af3ad9b287d74a891c85b42'
if (
  Object.keys(expectedBeforeHashes).length !== outputPaths.length
  || outputPaths.some((path) => !(path in expectedBeforeHashes))
  || Object.keys(expectedBeforeHashes).some((path) => !(outputPaths as readonly string[]).includes(path))
  || Object.keys(expectedAfterHashes).length !== outputPaths.length
  || outputPaths.some((path) => !(path in expectedAfterHashes))
  || Object.keys(expectedAfterHashes).some((path) => !(outputPaths as readonly string[]).includes(path))
) throw new Error('Expected before/after-hash boundaries must match the exact 87-file output boundary')

const protectedInputHashes: Record<string, string> = {
  [paths.batch025Config]: 'b60924ec6896316c1fb3259370a656e19180d0490620453b5bae342d74c8d1f7',
  [paths.semanticFingerprintHelper]: 'd8993c1270797f4e8406b2ef359eb0979768cc32078e5b988a32f50409207e60',
  [paths.canonicalVisualization]: 'aed034bd8eb6b248c898104282ee5fd1e5033106df042f9c82836c15caf03aaa',
  [paths.canonicalVisualizationPrompt]: 'c688ae6d26f5d314bf2494fe2d54a1245d882c4c8296d1444d14776d59bca01c',
  [paths.publicVisualization]: 'aed034bd8eb6b248c898104282ee5fd1e5033106df042f9c82836c15caf03aaa',
  [paths.heUpperSourceExtraction]: '9552cccda78f64503c338ee4f2c6adba2909f9cbdd8a8f3d111b97627ea7c27b',
  [paths.mvLowerSourceExtraction]: '7d83fa679f0bf1bcbd9f3de16505d1a1f29531cd06928785e64dc726ca8c8de5',
  [paths.shUpperSourceExtraction]: '1bd252c5d1f6eeec0075964f1fb77c305aa238c44b0e824bbe0e85d5deb55447',
  [paths.slLowerSourceExtraction]: 'b8f5865a252b33a51ed679bbaf9bd87983f4f54ad565e0c81cb0ad264a316246',
  [paths.slUpperSourceExtraction]: '9652cfff9789ed14fc3ab02ff523bcff6fc296a464ac2bee2d445a123a182ce8',
  [paths.snLowerSourceExtraction]: '8b872c7ffd35fa8ff4e0d54438998aeb457ce04beac3090f3d32dfcc9b5d665a',
  [paths.snUpperSourceExtraction]: '249ae63bd55e82444249f2add411bdef30a2d781fe2506feaaeb61bf5d8edc18',
  [paths.stLowerSourceExtraction]: 'cf23f90564c41051b5994fd459688572311648db28fb25371ab5ad2b7db6f501',
}

const heChanges: MappingChange[] = [
  {
    sourceGoalId: 'he-phys-sekii-e-1-b06-a01-276db5cc',
    beforeCanonicalGoalIds: [ids.acceleratedMotion],
    rationale:
      'Das amtliche Hessen-Ziel behandelt die gleichmäßig beschleunigte Bewegung ohne Anfangsgeschwindigkeit und Anfangsort. Das revidierte kanonische Ziel beschreibt das allgemeinere Konstantbeschleunigungsmodell; die Zuordnung ist deshalb partial.',
  },
  {
    sourceGoalId: 'he-phys-sekii-e-1-b07-a01-5e3ee94d',
    beforeCanonicalGoalIds: [ids.acceleratedMotion],
    rationale:
      'Das amtliche Hessen-Ziel nennt die Definition der Beschleunigung. Das revidierte kanonische Ziel verlangt zusätzlich die konsistente Beschreibung in t-s-, t-v- und t-a-Darstellungen; die Zuordnung ist deshalb partial.',
  },
  {
    sourceGoalId: 'he-phys-sekii-e-1-b08-a01-1823c481',
    beforeCanonicalGoalIds: [ids.uniformMotion, ids.acceleratedMotion],
    removeCanonicalGoalIds: [ids.uniformMotion, ids.acceleratedMotion],
    addCanonicalGoalIds: [ids.averageInstantaneousVelocity],
    rationale:
      'Der amtliche Hessen-Aspekt fordert den Vergleich von Durchschnitts- und Momentangeschwindigkeit. Das neue kanonische Ziel operationalisiert ihn zusätzlich über Sekanten- und Tangentensteigung; die Zuordnung ist partial.',
  },
]

const mvChanges: MappingChange[] = [
  {
    sourceGoalId: 'mv-phys-seki-rp2022-j9-bewegung-004-b1d00202',
    beforeCanonicalGoalIds: [
      '1e9ec823-384b-5e5f-974c-4ce224d05c19',
      'e452baa3-c9fc-5b62-893c-f91fe8d53715',
      'ae67bcf1-f3ee-50d6-9a12-25a159dff659',
    ],
    addCanonicalGoalIds: [ids.averageInstantaneousVelocity],
    rationale:
      'Das amtliche MV-Ziel deutet Geschwindigkeit als Anstieg im Weg-Zeit-Diagramm. Es trägt damit einen Teil der Sekanten-/Tangentenkompetenz, aber nicht deren vollständigen Vergleich; die Zuordnung ist partial.',
  },
  {
    sourceGoalId: 'mv-phys-seki-rp2022-j9-bewegung-005-411d8eba',
    beforeCanonicalGoalIds: [
      '1e9ec823-384b-5e5f-974c-4ce224d05c19',
      'ae67bcf1-f3ee-50d6-9a12-25a159dff659',
    ],
    addCanonicalGoalIds: [ids.averageInstantaneousVelocity],
    rationale:
      'Das amtliche MV-Ziel fordert ausdrücklich die Unterscheidung von Momentan- und Durchschnittsgeschwindigkeit, jedoch nicht die vollständige Bestimmung und grafische Sekanten-/Tangenten-Deutung; die Zuordnung ist partial.',
  },
  {
    sourceGoalId: 'mv-phys-seki-rp2022-j9-ebike-004-70caf2ad',
    beforeCanonicalGoalIds: [
      '1e9ec823-384b-5e5f-974c-4ce224d05c19',
      'ae67bcf1-f3ee-50d6-9a12-25a159dff659',
    ],
    addCanonicalGoalIds: [ids.averageInstantaneousVelocity],
    rationale:
      'Das amtliche MV-Ziel nutzt Momentan- und Durchschnittsgeschwindigkeit zur Beschreibung einer ungleichförmigen E-Bike-Bewegung. Die vollständige Sekanten-/Tangenten-Deutung ist nicht ausgewiesen; die Zuordnung ist partial.',
  },
  {
    sourceGoalId: 'mv-phys-seki-rp2022-j10-beschleunigt-004-92574af7',
    beforeCanonicalGoalIds: [
      '1e9ec823-384b-5e5f-974c-4ce224d05c19',
      'ae67bcf1-f3ee-50d6-9a12-25a159dff659',
      ids.acceleratedMotion,
      '09029573-864f-40ca-bf8a-cee7bf6dcb73',
    ],
    removeCanonicalGoalIds: [ids.acceleratedMotion, '09029573-864f-40ca-bf8a-cee7bf6dcb73'],
    addCanonicalGoalIds: [ids.averageInstantaneousVelocity],
    rationale:
      'Der amtliche MV-Aspekt deutet Momentangeschwindigkeit über sehr kleine Zeitintervalle. Er belegt weder das Konstantbeschleunigungsmodell noch freien Fall und deckt die neue Vergleichskompetenz nur teilweise ab.',
  },
  {
    sourceGoalId: 'mv-phys-seki-rp2022-j10-beschleunigt-006-f9a0d70c',
    beforeCanonicalGoalIds: [
      '1e9ec823-384b-5e5f-974c-4ce224d05c19',
      'e452baa3-c9fc-5b62-893c-f91fe8d53715',
      'ae67bcf1-f3ee-50d6-9a12-25a159dff659',
      ids.acceleratedMotion,
      '09029573-864f-40ca-bf8a-cee7bf6dcb73',
    ],
    addCanonicalGoalIds: [ids.averageInstantaneousVelocity],
    rationale:
      'Das amtliche MV-Ziel deutet Anstiege in Weg-Zeit- und Geschwindigkeit-Zeit-Diagrammen. Damit ist die neue Sekanten-/Tangentenkompetenz fachlich berührt, aber nicht vollständig formuliert; die Zuordnung ist partial.',
  },
]

const shChanges: MappingChange[] = [{
  sourceGoalId: 'sh-physics-sekii-fa2022-2-3-1-kin-004-63b0c0f2',
  beforeCanonicalGoalIds: [ids.motionCorridor],
  removeCanonicalGoalIds: [ids.motionCorridor],
  addCanonicalGoalIds: [ids.averageInstantaneousVelocity],
  rationale:
    'Das amtliche SH-Ziel fordert das Bestimmen und Deuten von Durchschnitts- und Momentangeschwindigkeiten. Das neue kanonische Ziel präzisiert zusätzlich endliches Intervall, Zeitpunkt sowie Sekanten- und Tangentensteigung; die Zuordnung ist partial.',
}]

const slChanges: MappingChange[] = [
  {
    sourceGoalId: 'sl-phys-seki-sl-ph-seki-7-2023-p25-005-9ad772ee',
    beforeCanonicalGoalIds: [
      '1e9ec823-384b-5e5f-974c-4ce224d05c19',
      'ae67bcf1-f3ee-50d6-9a12-25a159dff659',
    ],
    addCanonicalGoalIds: [ids.averageInstantaneousVelocity],
    rationale:
      'Der amtliche SL-Aspekt interpretiert den Quotienten aus Weg- und Zeitintervall als mittlere Geschwindigkeit bei ungleichförmiger Bewegung. Momentangeschwindigkeit und Tangentensteigung fehlen; die Zuordnung ist partial.',
  },
  {
    sourceGoalId: 'sl-phys-sekii-sl-ph-sekii-ep-2023-p07-001-0e5f7431',
    beforeCanonicalGoalIds: [
      '1e9ec823-384b-5e5f-974c-4ce224d05c19',
      'ce431132-dfc4-42c2-aff6-bd72035190f8',
    ],
    addCanonicalGoalIds: [ids.averageInstantaneousVelocity],
    rationale:
      'Der amtliche SL-Aspekt definiert die mittlere Geschwindigkeit über ein endliches Intervall. Die Momentangeschwindigkeit und ihre Tangenteninterpretation sind hier nicht enthalten; die Zuordnung ist partial.',
  },
  {
    sourceGoalId: 'sl-phys-sekii-sl-ph-sekii-ep-2023-p08-011-133f2d5c',
    beforeCanonicalGoalIds: [
      '1e9ec823-384b-5e5f-974c-4ce224d05c19',
      'ce431132-dfc4-42c2-aff6-bd72035190f8',
      ids.acceleratedMotion,
    ],
    removeCanonicalGoalIds: [ids.acceleratedMotion],
    addCanonicalGoalIds: [ids.averageInstantaneousVelocity],
    rationale:
      'Der amtliche SL-Aspekt unterscheidet Momentangeschwindigkeit zu einem Zeitpunkt von mittlerer Geschwindigkeit über eine Zeitspanne. Die grafische Sekanten-/Tangenten-Deutung ist nicht vollständig enthalten; die Zuordnung ist partial.',
  },
  {
    sourceGoalId: 'sl-phys-sekii-sl-ph-sekii-ep-2023-p08-012-05fb050d',
    beforeCanonicalGoalIds: [
      '1e9ec823-384b-5e5f-974c-4ce224d05c19',
      'ce431132-dfc4-42c2-aff6-bd72035190f8',
      ids.acceleratedMotion,
    ],
    removeCanonicalGoalIds: [ids.acceleratedMotion],
    addCanonicalGoalIds: [ids.averageInstantaneousVelocity],
    rationale:
      'Der amtliche SL-Aspekt nähert Momentangeschwindigkeit mit dem Differenzenquotienten für kleine Zeitintervalle. Der vollständige Vergleich mit der Durchschnittsgeschwindigkeit und die explizite Tangentensteigung sind nur teilweise abgedeckt.',
  },
  {
    sourceGoalId: 'sl-phys-sekii-sl-ph-sekii-ep-2023-p08-013-554a317d',
    beforeCanonicalGoalIds: [
      '1e9ec823-384b-5e5f-974c-4ce224d05c19',
      'e452baa3-c9fc-5b62-893c-f91fe8d53715',
      'ce431132-dfc4-42c2-aff6-bd72035190f8',
      ids.acceleratedMotion,
    ],
    removeCanonicalGoalIds: [ids.acceleratedMotion],
    addCanonicalGoalIds: [ids.averageInstantaneousVelocity],
    rationale:
      'Der amtliche SL-Aspekt diskutiert Messmöglichkeiten für Momentangeschwindigkeit. Er belegt die neue Bestimmungs- und Vergleichskompetenz nur teilweise und nicht das revidierte Konstantbeschleunigungsmodell.',
  },
  {
    sourceGoalId: 'sl-phys-sekii-sl-ph-sekii-ep-2023-p08-014-32777fa3',
    beforeCanonicalGoalIds: [
      '1e9ec823-384b-5e5f-974c-4ce224d05c19',
      'e452baa3-c9fc-5b62-893c-f91fe8d53715',
      '8eaa4e45-39fc-50e9-b59f-8a1752f6bebe',
      'ce431132-dfc4-42c2-aff6-bd72035190f8',
      ids.acceleratedMotion,
      '4dc9a094-66d7-4d4d-9436-134aabe48f39',
      '0895074d-c4af-56ea-88dd-ae0fdae443ed',
    ],
    addCanonicalGoalIds: [ids.averageInstantaneousVelocity],
    rationale:
      'Das amtliche SL-Ziel verbindet die näherungsweise Momentangeschwindigkeitsbestimmung mit einem Experiment unter konstanter Kraft. Es trägt deshalb sowohl das Konstantbeschleunigungsmodell als auch teilweise die neue Vergleichskompetenz.',
  },
]

const snChanges: MappingChange[] = [
  {
    sourceGoalId: 'sn-phys-seki-sn-klassenstufe-6-lb2-010-07-b1cc6aa4',
    beforeCanonicalGoalIds: [
      '8eaa4e45-39fc-50e9-b59f-8a1752f6bebe',
      'cbb26ed2-6979-46f6-a4ae-128f5c5d9d76',
      '30a936ec-e427-57fe-bf3e-4abd64b1f0c1',
      '052a4cc8-2ccd-5cef-b022-55b554417c4a',
      '5be98160-5189-58aa-8183-1df1c400cc8c',
      'ae67bcf1-f3ee-50d6-9a12-25a159dff659',
    ],
    addCanonicalGoalIds: [ids.averageInstantaneousVelocity],
    rationale:
      'Der amtliche Sachsen-Aspekt nennt Durchschnittsgeschwindigkeit beim Beurteilen von Bewegungen. Momentangeschwindigkeit sowie Sekanten-/Tangentensteigung sind nicht vollständig enthalten; die Zuordnung ist partial.',
  },
  {
    sourceGoalId: 'sn-phys-sekii-sn-jahrgangsstufe-11-leistungskurs-lb2-047-03-526670cb',
    beforeCanonicalGoalIds: [
      '1e9ec823-384b-5e5f-974c-4ce224d05c19',
      'd3c153b9-e09b-5668-8386-73105546a7c1',
      'ce431132-dfc4-42c2-aff6-bd72035190f8',
      ids.acceleratedMotion,
      'feb70838-931c-4b45-b9a9-930605d93efa',
      'e9d616d8-685f-4129-a36f-dae7a280bae7',
      '0895074d-c4af-56ea-88dd-ae0fdae443ed',
      '13e882bd-2fc6-59c6-a2a8-32eb1fbf1751',
      '47f76c5c-05d1-59eb-876d-cafb98a66c5b',
      'b39ae8fb-4358-5866-8adf-3d5365368eeb',
    ],
    removeCanonicalGoalIds: [ids.acceleratedMotion],
    addCanonicalGoalIds: [ids.averageInstantaneousVelocity],
    rationale:
      'Der amtliche Sachsen-LK-Aspekt fordert die grafische Deutung von Durchschnitts- und Momentangeschwindigkeit über Differenzen- und Differenzialquotient. Er trägt das neue Ziel partial, nicht das revidierte Konstantbeschleunigungsmodell.',
  },
]

const stChanges: MappingChange[] = [
  {
    sourceGoalId:
      'st-phys-seki-st-schuljahrgang-6-eigenschaften-und-bewegung-von-korpern-und-teilchen-048-7cf285b3',
    beforeCanonicalGoalIds: [
      '2d3d42ae-492b-4795-a22f-eeca03aaed38',
      '9645f0d8-43a3-5f29-873c-daa5ace638db',
    ],
    addCanonicalGoalIds: [ids.averageInstantaneousVelocity],
    rationale:
      'Das amtliche Sachsen-Anhalt-Ziel fordert Durchschnittsgeschwindigkeiten bei ungleichförmigen Bewegungen zu berechnen. Momentangeschwindigkeit und Tangentensteigung fehlen; die Zuordnung ist partial.',
  },
  {
    sourceGoalId:
      'st-phys-seki-st-schuljahrgang-6-eigenschaften-und-bewegung-von-korpern-und-teilchen-064-3d3b23b8',
    beforeCanonicalGoalIds: [
      '2d3d42ae-492b-4795-a22f-eeca03aaed38',
      '9645f0d8-43a3-5f29-873c-daa5ace638db',
    ],
    addCanonicalGoalIds: [ids.averageInstantaneousVelocity],
    rationale:
      'Der amtliche Sachsen-Anhalt-Wissensbestand nennt Momentan- und Durchschnittsgeschwindigkeit. Die vollständige Bestimmung und Sekanten-/Tangenten-Deutung ist nicht ausgewiesen; die Zuordnung ist partial.',
  },
  {
    sourceGoalId: 'st-phys-seki-st-schuljahrgang-9-mechanik-der-punktmasse-279-ec7bf2a4',
    beforeCanonicalGoalIds: ['9645f0d8-43a3-5f29-873c-daa5ace638db'],
    addCanonicalGoalIds: [ids.averageInstantaneousVelocity],
    rationale:
      'Der amtliche Sachsen-Anhalt-Wissensbestand nennt Durchschnittsgeschwindigkeit. Momentangeschwindigkeit sowie Sekanten-/Tangentensteigung fehlen; die Zuordnung zum neuen Ziel ist partial.',
  },
]

const mappingChangesByPath = new Map<string, MappingChange[]>([
  [paths.heUpperMapping, heChanges],
  [paths.mvLowerMapping, mvChanges],
  [paths.shUpperMapping, shChanges],
  [paths.slLowerMapping, slChanges.slice(0, 1)],
  [paths.slUpperMapping, slChanges.slice(1)],
  [paths.snLowerMapping, snChanges.slice(0, 1)],
  [paths.snUpperMapping, snChanges.slice(1)],
  [paths.stLowerMapping, stChanges],
])
const allMappingChanges = [...mappingChangesByPath.values()].flat()
if (allMappingChanges.length !== 20 || new Set(allMappingChanges.map((change) => change.sourceGoalId)).size !== 20) {
  throw new Error('Batch-025 source-evidence contract must contain exactly 20 explicit source decisions')
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
const sortStrings = (values: string[]): string[] => [...values]
  .sort((left, right) => left < right ? -1 : left > right ? 1 : 0)

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
  if (expected === 'PENDING') throw new Error(`${label}: unbound hash for ${path}`)
  if (!existsSync(absolute(path))) throw new Error(`${label}: missing ${path}`)
  const actual = sha256(readFileSync(absolute(path)))
  if (actual !== expected) throw new Error(`${label}: ${path} drifted (${actual} != ${expected})`)
}

function currentBeforeCorpusBinding(): { fileCount: number; sha256: string; files: JsonRecord[] } {
  const boundPaths = [...new Set([
    ...outputPaths.filter((path) => path !== paths.followUpConfig),
    ...Object.keys(protectedInputHashes),
  ])].sort()
  const files = boundPaths.map((path) => ({
    path,
    state: existsSync(absolute(path)) ? 'file' : 'missing',
    sha256: existsSync(absolute(path)) ? sha256(readFileSync(absolute(path))) : '',
  }))
  return { fileCount: files.length, sha256: sha256(stableJson(files)), files }
}

const missingFileBinding = 'MISSING'
const currentOutputHash = (path: string): string => (
  existsSync(absolute(path)) ? sha256(readFileSync(absolute(path))) : missingFileBinding
)
const currentOutputBindings = (): Array<{ path: string; sha256: string }> => (
  outputPaths.map((path) => ({ path, sha256: currentOutputHash(path) }))
)
const stagingPath = (path: string): string => `${absolute(path)}.b025-motion-split-staging`

function assertProtectedInputs(): void {
  for (const [path, expected] of Object.entries(protectedInputHashes)) assertSha256(path, expected, 'Protected input')
}

function finalCanonicalIds(change: MappingChange): string[] {
  const removed = new Set(change.removeCanonicalGoalIds ?? [])
  return [...new Set([
    ...change.beforeCanonicalGoalIds.filter((goalId) => !removed.has(goalId)),
    ...(change.addCanonicalGoalIds ?? []),
  ])]
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
    const landscape = readJson(`${dirname(paths.canonical)}/${fileName}`)
    for (const goal of landscape.goals ?? []) {
      if (typeof goal.id === 'string') allCanonicalGoalIds.add(goal.id)
    }
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
      for (const targetId of byId.get(goalId)?.[field] ?? []) {
        if (byId.has(targetId)) visit(String(targetId))
      }
      visiting.delete(goalId)
      visited.add(goalId)
    }
    for (const goalId of byId.keys()) visit(goalId)
  }
}

function buildCanonical(): JsonRecord {
  const canonical = readJson(paths.canonical)
  if (canonical.landscapeId !== physicsLandscapeId || !Array.isArray(canonical.goals)) {
    throw new Error('Unexpected canonical Physics landscape')
  }
  const goals = canonical.goals as JsonRecord[]
  if (goals.length !== 705 || goals.some((goal) => goal.id === ids.averageInstantaneousVelocity)) {
    throw new Error('Batch-025 canonical input is not the exact 705-goal pre-split state')
  }
  if (deterministicPhysicsGoalId('canonical_physics_e_average_instantaneous_velocity') !== ids.averageInstantaneousVelocity) {
    throw new Error('Batch-025 deterministic child ID contract drifted')
  }
  const oldIndex = goals.findIndex((goal) => goal.id === ids.acceleratedMotion)
  const acceleratedMotion = goals[oldIndex]
  if (
    oldIndex < 0
    || acceleratedMotion.description
      !== 'Die lernende Person kann gleichmäßig beschleunigte Bewegungen beschreiben, den Begriff der Beschleunigung definieren und Durchschnitts- mit Momentangeschwindigkeit vergleichen.'
    || acceleratedMotion.descriptionEn
      !== 'The learner can describe uniformly accelerated motions, define the concept of acceleration, and compare average with instantaneous velocity.'
    || !same(acceleratedMotion.requires, [ids.uniformMotion, ids.accelerationFoundation])
    || acceleratedMotion.type !== 'atomic'
    || (acceleratedMotion.contains ?? []).length !== 0
  ) throw new Error('Accelerated-motion source goal drifted from the adjudicated pre-split state')

  acceleratedMotion.description =
    'Die lernende Person kann das Modell der gleichmäßig beschleunigten Bewegung mit konstanter Beschleunigung erläutern und in t-s-, t-v- und t-a-Darstellungen beschreiben.'
  acceleratedMotion.descriptionEn =
    'The learner can explain the model of uniformly accelerated motion with constant acceleration and describe it using time-position, time-velocity, and time-acceleration representations.'
  acceleratedMotion.requires = [ids.averageInstantaneousVelocity, ids.accelerationFoundation]

  const newGoal: JsonRecord = {
    id: ids.averageInstantaneousVelocity,
    shortKey: 'canonical_physics_e_average_instantaneous_velocity',
    title: 'Durchschnitts- und Momentangeschwindigkeit unterscheiden',
    titleEn: 'Distinguish Average and Instantaneous Velocity',
    description:
      'Die lernende Person kann Durchschnittsgeschwindigkeit für ein endliches Zeitintervall und Momentangeschwindigkeit für einen Zeitpunkt bestimmen, vergleichen und im t-s-Diagramm als Sekanten- beziehungsweise Tangentensteigung deuten.',
    descriptionEn:
      'The learner can determine and compare average velocity over a finite interval and instantaneous velocity at an instant, interpreting them in a time-position graph as secant and tangent slopes, respectively.',
    weight: 0.9,
    tags: [...acceleratedMotion.tags],
    contains: [],
    requires: [ids.uniformMotion],
    dimensionTags: {
      framework: 'canonical-gymnasium-physics',
      demandLevel: 'AB2',
      processCompetencies: ['PK3_MATHEMATISIEREN'],
      guidingIdeas: ['LI_BEWEGUNG'],
      phase: 'E',
      area: 'Mechanik',
      topicCode: 'CANONICAL.PHYSICS.E.MOTION.AVERAGE_INSTANTANEOUS_VELOCITY',
    },
    applicability: { jurisdiction: [...allJurisdictions] },
    extendedData: { applicabilityMappingInheritance: 'boundary' },
    type: 'atomic',
    semanticAtomic: true,
    competencyRefs: ['PROCESS.PK3'],
    resourceLinks: [],
  }
  goals.splice(oldIndex, 0, newGoal)

  const motionCorridor = goals.find((goal) => goal.id === ids.motionCorridor)
  const freeFallCluster = goals.find((goal) => goal.id === ids.freeFallCluster)
  if (
    !motionCorridor
    || !same(motionCorridor.contains, [
      'ce431132-dfc4-42c2-aff6-bd72035190f8',
      ids.uniformMotion,
      ids.acceleratedMotion,
      '09029573-864f-40ca-bf8a-cee7bf6dcb73',
      'd6dc0e02-831d-4894-a61a-852bcc74f147',
      '4a2bf015-052b-4af0-aed7-324259fa1a8a',
      ids.freeFallCluster,
    ])
    || !same(freeFallCluster?.contains, [ids.acceleratedMotion, '09029573-864f-40ca-bf8a-cee7bf6dcb73'])
  ) throw new Error('E.1 motion/free-fall contains contract drifted')
  motionCorridor.contains.splice(2, 0, ids.averageInstantaneousVelocity)

  const expectedDependents = sortStrings([
    'a9562b05-c54d-5635-9244-3f7dd24a8642',
    '2b9e565f-d9b4-5e23-b5b7-b7977cecff06',
    '4a2bf015-052b-4af0-aed7-324259fa1a8a',
    '09029573-864f-40ca-bf8a-cee7bf6dcb73',
    'd6dc0e02-831d-4894-a61a-852bcc74f147',
    '31a2ef52-114b-4d2c-a720-6ef5a390b6dc',
    'd03f1cb6-c224-53db-ad91-76cc7827978d',
    '7f83e25c-38f7-5ac2-8f9c-ec54eeef1026',
  ])
  const actualDependents = sortStrings(goals
    .filter((goal) => (goal.requires ?? []).includes(ids.acceleratedMotion))
    .map((goal) => String(goal.id)))
  if (!same(actualDependents, expectedDependents)) {
    throw new Error(`Accelerated-motion dependents drifted: ${actualDependents.join(',')}`)
  }
  if ((freeFallCluster.contains as string[]).includes(ids.averageInstantaneousVelocity)) {
    throw new Error('New velocity child must not be placed in the free-fall cluster')
  }
  if (goals.length !== 706) throw new Error(`Unexpected post-split Physics count ${goals.length}`)
  assertGraph(goals)
  canonical.goals = goals
  return canonical
}

function findStructures(value: unknown, id: string, result: JsonRecord[] = []): JsonRecord[] {
  if (Array.isArray(value)) {
    for (const entry of value) findStructures(entry, id, result)
  } else if (value && typeof value === 'object') {
    const record = value as JsonRecord
    if (record.kind === 'structure' && record.id === id) result.push(record)
    for (const nested of Object.values(record)) findStructures(nested, id, result)
  }
  return result
}

function countGoalReferences(value: unknown, goalId: string): number {
  if (Array.isArray(value)) return value.reduce((sum, entry) => sum + countGoalReferences(entry, goalId), 0)
  if (!value || typeof value !== 'object') return 0
  const record = value as JsonRecord
  return (record.goalId === goalId ? 1 : 0)
    + Object.values(record).reduce((sum, entry) => sum + countGoalReferences(entry, goalId), 0)
}

function findGoalReferenceParents(value: unknown, goalId: string, result: JsonRecord[][] = []): JsonRecord[][] {
  if (Array.isArray(value)) {
    if (value.some((entry) => entry?.goalId === goalId)) result.push(value as JsonRecord[])
    for (const entry of value) findGoalReferenceParents(entry, goalId, result)
  } else if (value && typeof value === 'object') {
    for (const nested of Object.values(value as JsonRecord)) findGoalReferenceParents(nested, goalId, result)
  }
  return result
}

function findGoalReferenceStructurePaths(
  value: unknown,
  goalId: string,
  structurePath: string[] = [],
  result: string[][] = [],
): string[][] {
  if (Array.isArray(value)) {
    for (const entry of value) findGoalReferenceStructurePaths(entry, goalId, structurePath, result)
    return result
  }
  if (!value || typeof value !== 'object') return result
  const record = value as JsonRecord
  const nextStructurePath = record.kind === 'structure' && typeof record.id === 'string'
    ? [...structurePath, record.id]
    : structurePath
  if (record.goalId === goalId) result.push(nextStructurePath)
  for (const nested of Object.values(record)) {
    findGoalReferenceStructurePaths(nested, goalId, nextStructurePath, result)
  }
  return result
}

function assertNewGoalDoesNotChangeSekIProjectionCounters(compositionViews: Map<string, JsonRecord>): void {
  let targetReferences = 0
  let prerequisiteOnlyReferences = 0
  for (const path of compositionViewPaths) {
    const view = compositionViews.get(path)
    if (!view) throw new Error(`${path}: missing planned composition view`)
    const structurePaths = findGoalReferenceStructurePaths(view, ids.averageInstantaneousVelocity)
    const parentArrays = findGoalReferenceParents(view, ids.averageInstantaneousVelocity)
    if (structurePaths.length !== 1 || parentArrays.length !== 1) {
      throw new Error(`${path}: expected one placement for the new velocity goal`)
    }
    const structurePath = structurePaths[0]
    const reference = parentArrays[0]
      .find((child) => child.goalId === ids.averageInstantaneousVelocity)
    if (isTargetView(path)) {
      const isInSekII = view.scope?.stage === 'SekII'
        || structurePath.some((structureId) => /^physics-sekii(?:-|$)/u.test(structureId))
      if (
        reference?.kind !== 'canonicalSubtree'
        || reference?.projectionRole !== undefined
        || !isInSekII
        || structurePath.includes('physics-seki')
      ) throw new Error(`${path}: new target velocity goal escaped its Sek-II placement`)
      targetReferences += 1
    } else {
      if (reference?.kind !== 'goalEntry' || reference?.projectionRole !== 'prerequisiteOnly') {
        throw new Error(`${path}: new non-target velocity reference is not prerequisiteOnly`)
      }
      prerequisiteOnlyReferences += 1
    }
  }
  if (targetReferences !== 28 || prerequisiteOnlyReferences !== 36) {
    throw new Error(
      `New velocity-goal projection roles drifted: target=${targetReferences} `
      + `prerequisiteOnly=${prerequisiteOnlyReferences}`,
    )
  }
}

function buildCompositionView(path: string): JsonRecord {
  const view = readJson(path)
  if (countGoalReferences(view, ids.acceleratedMotion) !== 1) {
    throw new Error(`${path}: expected exactly one accelerated-motion reference`)
  }
  if (countGoalReferences(view, ids.averageInstantaneousVelocity) !== 0) {
    throw new Error(`${path}: new velocity goal unexpectedly already present`)
  }
  if (isTargetView(path)) {
    const motionStructures = findStructures(view, 'physics-e1-motion')
    const acceleratedStructures = findStructures(view, 'physics-e1-accelerated-and-free-fall')
    if (motionStructures.length !== 1 || acceleratedStructures.length !== 1) {
      throw new Error(`${path}: expected one E.1 motion and one accelerated/free-fall structure`)
    }
    const motion = motionStructures[0]
    const accelerated = acceleratedStructures[0]
    if (!Array.isArray(motion.children) || !Array.isArray(accelerated.children)) {
      throw new Error(`${path}: invalid E.1 children arrays`)
    }
    const acceleratedIndex = motion.children.findIndex((child: JsonRecord) => (
      child.kind === 'structure' && child.id === 'physics-e1-accelerated-and-free-fall'
    ))
    if (
      acceleratedIndex < 0
      || !same(accelerated.children.map((child: JsonRecord) => child.goalId), [
        ids.acceleratedMotion,
        '09029573-864f-40ca-bf8a-cee7bf6dcb73',
      ])
    ) throw new Error(`${path}: accelerated/free-fall placement drifted`)
    motion.children.splice(acceleratedIndex, 0, {
      kind: 'canonicalSubtree',
      goalId: ids.averageInstantaneousVelocity,
    })
    if ((accelerated.children as JsonRecord[]).some((child) => child.goalId === ids.averageInstantaneousVelocity)) {
      throw new Error(`${path}: new velocity target escaped the E.1 sibling boundary`)
    }
  } else {
    const parentArrays = findGoalReferenceParents(view, ids.acceleratedMotion)
    if (parentArrays.length !== 1) throw new Error(`${path}: expected one parent array for prerequisite placement`)
    const siblings = parentArrays[0]
    const acceleratedIndex = siblings.findIndex((child) => child.goalId === ids.acceleratedMotion)
    if (acceleratedIndex < 0) throw new Error(`${path}: accelerated-motion sibling disappeared`)
    siblings.splice(acceleratedIndex, 0, {
      kind: 'goalEntry',
      goalId: ids.averageInstantaneousVelocity,
      projectionRole: 'prerequisiteOnly',
    })
  }
  if (countGoalReferences(view, ids.averageInstantaneousVelocity) !== 1) {
    throw new Error(`${path}: expected exactly one new velocity reference`)
  }
  return view
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

function overlayDefinitions(changes: MappingChange[]): string {
  const targets = Object.fromEntries(changes
    .filter((change) => (change.addCanonicalGoalIds ?? []).length > 0)
    .map((change) => [change.sourceGoalId, change.addCanonicalGoalIds]))
  const removals = Object.fromEntries(changes
    .filter((change) => (change.removeCanonicalGoalIds ?? []).length > 0)
    .map((change) => [change.sourceGoalId, change.removeCanonicalGoalIds]))
  const rationales = Object.fromEntries(changes.map((change) => [change.sourceGoalId, change.rationale]))
  return `// Batch 025 average/instantaneous-velocity structural split overlay
const batch025TargetsBySourceGoalId: Record<string, string[]> = ${JSON.stringify(targets, null, 2)}
const batch025RemovedTargetsBySourceGoalId: Record<string, string[]> = ${JSON.stringify(removals, null, 2)}
const batch025RationalesBySourceGoalId = new Map<string, string>(${JSON.stringify(Object.entries(rationales), null, 2)})`
}

function injectApplyOverlay(source: string, label: string): string {
  const start = source.indexOf('const applyPhysicsBatch015Targets = (')
  const end = source.indexOf('\n\n', start)
  if (start < 0 || end < 0 || source.indexOf('const applyPhysicsBatch015Targets = (', start + 1) >= 0) {
    throw new Error(`${label}: expected one apply-targets function`)
  }
  let block = source.slice(start, end)
  const filterTail = '),\n    ...(batch015TargetsBySourceGoalId[sourceGoalId] ?? []),'
  if (!block.includes(filterTail)) throw new Error(`${label}: apply-target filter anchor drifted`)
  block = block.replace(
    filterTail,
    ' && !(batch025RemovedTargetsBySourceGoalId[sourceGoalId] ?? []).includes(goalId)),\n'
      + '    ...(batch015TargetsBySourceGoalId[sourceGoalId] ?? []),',
  )
  const close = '\n  ]),\n]'
  if (!block.includes(close)) throw new Error(`${label}: apply-target close anchor drifted`)
  block = block.replace(
    close,
    '\n    ...(batch025TargetsBySourceGoalId[sourceGoalId] ?? []),\n  ]),\n]',
  )
  return `${source.slice(0, start)}${block}${source.slice(end)}`
}

function buildHeGenerator(): string {
  let source = readFileSync(absolute(paths.heGenerator), 'utf8')
  source = insertBeforeOnce(
    source,
    '// Batch 025 average/instantaneous-velocity structural split overlay',
    'const applyPhysicsBatch015Targets = (',
    overlayDefinitions(heChanges),
    'HE generator Batch-025 definitions',
  )
  source = injectApplyOverlay(source, 'HE generator')
  source = replaceOnceOrAfter(
    source,
    '      ...batch019PartialRationalesBySourceGoalId.keys(),',
    '      ...batch019PartialRationalesBySourceGoalId.keys(),\n'
      + '      ...batch025RationalesBySourceGoalId.keys(),',
    'HE generator Batch-025 partial IDs',
  )
  source = replaceOnceOrAfter(
    source,
    '    const batch019Rationale = batch019PartialRationalesBySourceGoalId.get(sourceGoal.id)',
    '    const batch019Rationale = batch019PartialRationalesBySourceGoalId.get(sourceGoal.id)\n'
      + '    const batch025Rationale = batch025RationalesBySourceGoalId.get(sourceGoal.id)',
    'HE generator Batch-025 rationale lookup',
  )
  source = replaceOnceOrAfter(
    source,
    '? batch019Rationale ?? partialRationalesBySourceKey.get(sourceKey)',
    '? batch025Rationale ?? batch019Rationale ?? partialRationalesBySourceKey.get(sourceKey)',
    'HE generator Batch-025 rationale precedence',
  )
  source = replaceOnceOrAfter(
    source,
    `      reviewedAt: batch019Rationale
        ? '2026-08-28'
        : new Set(['8.3b:4', '8.3b:5']).has(sourceKey) ? '2026-08-27' : '2026-05-09',`,
    `      reviewedAt: batch025Rationale
        ? '${reviewedAt}'
        : batch019Rationale
          ? '2026-08-28'
          : new Set(['8.3b:4', '8.3b:5']).has(sourceKey) ? '2026-08-27' : '2026-05-09',`,
    'HE generator Batch-025 review date',
  )
  source = replaceOnceOrAfter(
    source,
    `      reviewer: batch019Rationale
        ? 'codex-physics-batch-019-mapping-adjudication'
        : new Set(['8.3b:4', '8.3b:5']).has(sourceKey)
          ? 'codex-physics-batch-007-split-synthesis'
          : 'codex',`,
    `      reviewer: batch025Rationale
        ? '${reviewer}'
        : batch019Rationale
          ? 'codex-physics-batch-019-mapping-adjudication'
          : new Set(['8.3b:4', '8.3b:5']).has(sourceKey)
            ? 'codex-physics-batch-007-split-synthesis'
            : 'codex',`,
    'HE generator Batch-025 reviewer',
  )
  return source
}

function buildBatch019Generator(path: string, changes: MappingChange[], jurisdiction: 'MV' | 'SN'): string {
  let source = readFileSync(absolute(path), 'utf8')
  source = insertBeforeOnce(
    source,
    '// Batch 025 average/instantaneous-velocity structural split overlay',
    'const applyPhysicsBatch015Targets = (',
    overlayDefinitions(changes),
    `${jurisdiction} generator Batch-025 definitions`,
  )
  source = injectApplyOverlay(source, `${jurisdiction} generator`)
  source = replaceOnceOrAfter(
    source,
    '    const batch019Rationale = batch019RationalesBySourceGoalId.get(sourceGoal.id)',
    '    const batch019Rationale = batch019RationalesBySourceGoalId.get(sourceGoal.id)\n'
      + '    const batch025Rationale = batch025RationalesBySourceGoalId.get(sourceGoal.id)',
    `${jurisdiction} generator Batch-025 rationale lookup`,
  )
  source = replaceOnceOrAfter(
    source,
    '      rationale: batch019Rationale ?? (',
    '      rationale: batch025Rationale ?? batch019Rationale ?? (',
    `${jurisdiction} generator Batch-025 rationale precedence`,
  )
  source = replaceOnceOrAfter(
    source,
    "      reviewedAt: batch019Rationale ? '2026-08-28' : '2026-05-11',",
    `      reviewedAt: batch025Rationale ? '${reviewedAt}' : batch019Rationale ? '2026-08-28' : '2026-05-11',`,
    `${jurisdiction} generator Batch-025 review date`,
  )
  source = replaceOnceOrAfter(
    source,
    "      reviewer: batch019Rationale ? 'codex-physics-batch-019-mapping-adjudication' : 'codex',",
    `      reviewer: batch025Rationale ? '${reviewer}' : batch019Rationale ? 'codex-physics-batch-019-mapping-adjudication' : 'codex',`,
    `${jurisdiction} generator Batch-025 reviewer`,
  )
  return source
}

function buildSimpleGenerator(
  path: string,
  changes: MappingChange[],
  jurisdiction: 'SL' | 'ST',
  defaultSingleRationale: string,
): string {
  let source = readFileSync(absolute(path), 'utf8')
  source = insertBeforeOnce(
    source,
    '// Batch 025 average/instantaneous-velocity structural split overlay',
    'const applyPhysicsBatch015Targets = (',
    overlayDefinitions(changes),
    `${jurisdiction} generator Batch-025 definitions`,
  )
  source = injectApplyOverlay(source, `${jurisdiction} generator`)
  const canonicalLine = jurisdiction === 'SL'
    ? '    const canonicalGoalIds = applyPhysicsBatch015Targets(sourceGoal.id, inferCanonicalGoalIds(sourceGoal, config))'
    : '    const canonicalGoalIds = applyPhysicsBatch015Targets(sourceGoal.id, inferCanonicalGoalIds(sourceGoal, config.stage))'
  source = replaceOnceOrAfter(
    source,
    canonicalLine,
    `${canonicalLine}\n    const batch025Rationale = batch025RationalesBySourceGoalId.get(sourceGoal.id)`,
    `${jurisdiction} generator Batch-025 rationale lookup`,
  )
  source = replaceOnceOrAfter(
    source,
    `      rationale:
        canonicalGoalIds.length > 1
          ? '${jurisdiction === 'SL'
            ? 'Das amtliche SL-Source-Ziel ist inhaltlich durch mehrere kanonische Physikziele abgedeckt; 1:n beschreibt die Zuordnungsform, nicht eine offene Lücke.'
            : 'Das amtliche Sachsen-Anhalt-Source-Ziel ist inhaltlich durch mehrere kanonische Physikziele abgedeckt; 1:n beschreibt die Zuordnungsform, nicht eine offene Lücke.'}'
          : '${defaultSingleRationale}',`,
    `      rationale: batch025Rationale ?? (
        canonicalGoalIds.length > 1
          ? '${jurisdiction === 'SL'
            ? 'Das amtliche SL-Source-Ziel ist inhaltlich durch mehrere kanonische Physikziele abgedeckt; 1:n beschreibt die Zuordnungsform, nicht eine offene Lücke.'
            : 'Das amtliche Sachsen-Anhalt-Source-Ziel ist inhaltlich durch mehrere kanonische Physikziele abgedeckt; 1:n beschreibt die Zuordnungsform, nicht eine offene Lücke.'}'
          : '${defaultSingleRationale}'),`,
    `${jurisdiction} generator Batch-025 rationale precedence`,
  )
  source = replaceOnceOrAfter(
    source,
    "      reviewedAt: '2026-05-11',",
    `      reviewedAt: batch025Rationale ? '${reviewedAt}' : '2026-05-11',`,
    `${jurisdiction} generator Batch-025 review date`,
  )
  source = replaceOnceOrAfter(
    source,
    "      reviewer: 'codex',",
    `      reviewer: batch025Rationale ? '${reviewer}' : 'codex',`,
    `${jurisdiction} generator Batch-025 reviewer`,
  )
  return source
}

function buildShGenerator(): string {
  let source = readFileSync(absolute(paths.shGenerator), 'utf8')
  source = replaceOnceOrAfter(
    source,
    "  motion: '65ddd780-0323-45d1-8f94-5e31bf28da23',",
    "  motion: '65ddd780-0323-45d1-8f94-5e31bf28da23',\n"
      + `  averageInstantaneousVelocity: '${ids.averageInstantaneousVelocity}',`,
    'SH generator Batch-025 target ID',
  )
  const helper = `// Batch 025 average/instantaneous-velocity structural split overlay
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
  reviewedAt: '${reviewedAt}',
  reviewer: '${reviewer}',
})`
  source = insertBeforeOnce(
    source,
    '// Batch 025 average/instantaneous-velocity structural split overlay',
    'const rows: Row[] = [',
    helper,
    'SH generator Batch-025 helper',
  )
  source = replaceOnceOrAfter(
    source,
    "  row('2.3.1-KIN', 'Durchschnitts- und Momentangeschwindigkeiten bestimmen und deuten', [target.motion]),",
    `  batch025PartialRow(
    '2.3.1-KIN',
    'Durchschnitts- und Momentangeschwindigkeiten bestimmen und deuten',
    [target.averageInstantaneousVelocity],
    'GK_LK',
    ${JSON.stringify(shChanges[0].rationale)},
  ),`,
    'SH generator Batch-025 source row',
  )
  return source
}

function assertTypeScriptSyntax(path: string, source: string): void {
  const result = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    fileName: basename(path),
    reportDiagnostics: true,
  })
  const errors = (result.diagnostics ?? []).filter((diagnostic) => (
    diagnostic.category === ts.DiagnosticCategory.Error
  ))
  if (errors.length > 0) {
    throw new Error(`${path}: generated TypeScript syntax failed: ${ts.formatDiagnostics(errors, {
      getCanonicalFileName: (fileName) => fileName,
      getCurrentDirectory: () => repoRoot,
      getNewLine: () => '\n',
    })}`)
  }
}

function buildMappingReview(path: string, changes: MappingChange[]): JsonRecord {
  const review = readJson(path)
  if (!Array.isArray(review.decisions) || !Array.isArray(review.mappings)) {
    throw new Error(`${path}: invalid mapping-review structure`)
  }
  for (const change of changes) {
    const decision = review.decisions.find((candidate: JsonRecord) => (
      candidate.sourceGoalId === change.sourceGoalId
    ))
    if (!decision || !same(decision.canonicalGoalIds, change.beforeCanonicalGoalIds)) {
      throw new Error(`${path}: ${change.sourceGoalId} pre-split decision drifted`)
    }
    const finalIds = finalCanonicalIds(change)
    decision.canonicalGoalIds = finalIds
    decision.rationale = change.rationale
    decision.reviewedAt = reviewedAt
    decision.reviewer = reviewer

    const firstIndex = review.mappings.findIndex((mapping: JsonRecord) => (
      mapping.legacyGoalId === change.sourceGoalId
    ))
    const previous = review.mappings.filter((mapping: JsonRecord) => (
      mapping.legacyGoalId === change.sourceGoalId
    ))
    if (firstIndex < 0 || !same(previous.map((mapping: JsonRecord) => mapping.canonicalGoalId), change.beforeCanonicalGoalIds)) {
      throw new Error(`${path}: ${change.sourceGoalId} pre-split mapping rows drifted`)
    }
    review.mappings = review.mappings.filter((mapping: JsonRecord) => (
      mapping.legacyGoalId !== change.sourceGoalId
    ))
    review.mappings.splice(firstIndex, 0, ...finalIds.map((canonicalGoalId) => ({
      legacyGoalId: change.sourceGoalId,
      canonicalGoalId,
      matchType: 'partial',
      reviewDecisionId: change.sourceGoalId,
    })))
  }
  for (const change of changes) {
    const expectedIds = finalCanonicalIds(change)
    const decision = review.decisions.find((candidate: JsonRecord) => candidate.sourceGoalId === change.sourceGoalId)
    const rows = review.mappings.filter((mapping: JsonRecord) => mapping.legacyGoalId === change.sourceGoalId)
    if (
      !same(decision?.canonicalGoalIds, expectedIds)
      || decision?.rationale !== change.rationale
      || decision?.reviewer !== reviewer
      || !same(rows.map((mapping: JsonRecord) => ({
        canonicalGoalId: mapping.canonicalGoalId,
        matchType: mapping.matchType,
      })), expectedIds.map((canonicalGoalId) => ({ canonicalGoalId, matchType: 'partial' })))
    ) throw new Error(`${path}: ${change.sourceGoalId} post-split mapping contract failed`)
  }
  return review
}

function buildHeLegacyMapping(): JsonRecord {
  const mapping = readJson(paths.heLegacyMapping)
  if (!Array.isArray(mapping.mappings)) throw new Error('HE legacy mapping has no mappings array')
  const oldRows = mapping.mappings.filter((row: JsonRecord) => row.legacyGoalId === ids.heLegacyMotion)
  if (!same(oldRows, [{
    legacyGoalId: ids.heLegacyMotion,
    canonicalGoalId: ids.acceleratedMotion,
    matchType: 'exact',
  }])) throw new Error('HE legacy motion mapping drifted')
  const index = mapping.mappings.findIndex((row: JsonRecord) => row.legacyGoalId === ids.heLegacyMotion)
  mapping.mappings[index].matchType = 'partial'
  mapping.mappings.splice(index + 1, 0, {
    legacyGoalId: ids.heLegacyMotion,
    canonicalGoalId: ids.averageInstantaneousVelocity,
    matchType: 'partial',
  })
  return mapping
}

function buildProvenance(): JsonRecord {
  const registry = readJson(paths.provenance)
  const landscape = (registry.landscapes as JsonRecord[])
    .find((entry) => entry.landscapeId === physicsLandscapeId)
  if (!landscape?.goalProvenance || typeof landscape.goalProvenance !== 'object') {
    throw new Error('Missing canonical Physics provenance landscape')
  }
  if (landscape.goalProvenance[ids.averageInstantaneousVelocity]) {
    throw new Error('New velocity goal unexpectedly has pre-existing provenance')
  }
  const oldProvenance = landscape.goalProvenance[ids.acceleratedMotion]
  if (
    oldProvenance?.sourceLandscapeId !== '24f2ca0f-b94a-444e-bb70-677cb6f85c02'
    || oldProvenance?.sourceGoalId !== ids.heLegacyMotion
  ) throw new Error('Retained accelerated-motion provenance drifted')
  landscape.goalProvenance[ids.averageInstantaneousVelocity] = {
    sourceLandscapeId: '24f2ca0f-b94a-444e-bb70-677cb6f85c02',
    sourceGoalId: 'he-phys-sekii-e-1-b08-a01-1823c481',
    additionalSourceLandscapeIds: [
      '27da5587-bef3-49ad-9fec-3907253b85bd',
      '36092b29-547c-4018-8f47-97f04d786ba1',
      '3eedae6b-7e62-4e6e-a96c-78cd6df4c4aa',
      'd2e1fbb7-9e42-49a7-a07b-a7973156da12',
      'e1213911-abd2-4a1e-88ca-7a78a58c2189',
      'e5f66ad7-8f49-41f5-b8b2-52ab9a0ebcac',
      'f1a2c733-b994-4db3-9dd6-54ffe544002b',
    ],
  }
  landscape.goalProvenance = Object.fromEntries(Object.entries(landscape.goalProvenance)
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0))
  if (Object.keys(landscape.goalProvenance).length !== 457) {
    throw new Error(`Unexpected post-split Physics provenance count ${Object.keys(landscape.goalProvenance).length}`)
  }
  return registry
}

function buildSemanticKinds(canonical: JsonRecord): JsonRecord {
  const ledger = readJson(paths.semanticKinds)
  const goalById = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const decisions = new Map((ledger.decisions as JsonRecord[]).map((decision) => [String(decision.goalId), decision]))
  for (const goalId of [ids.acceleratedMotion, ids.averageInstantaneousVelocity]) {
    const goal = goalById.get(goalId)
    if (!goal) throw new Error(`${goalId}: missing semantic-kind source goal`)
    const existing = decisions.get(goalId)
    if (goalId === ids.acceleratedMotion && !existing) throw new Error('Missing old semantic-kind decision')
    decisions.set(goalId, {
      ...(existing ?? {}),
      goalId,
      sourceFingerprint: fingerprintSemanticKindSourceGoal(goal as never),
      semanticKind: 'curricularAtomic',
      decisionStatus: 'authoritative',
      decisionBasis: goalId === ids.averageInstantaneousVelocity
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
    curricularAtomic: 461,
    curricularArea: 101,
    practiceAssessment: 133,
    programStructure: 1,
    memory: 5,
    runtimeSupport: 4,
    orientation: 1,
    total: 706,
  }
  if (!same(ledger.counts, expectedCounts)) {
    throw new Error(`Unexpected post-split semantic-kind counts ${stableJson(ledger.counts)}`)
  }
  return ledger
}

function buildAtomicity(canonical: JsonRecord, semanticKinds: JsonRecord): JsonRecord[] {
  const goalById = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const records = readJsonl(paths.atomicity)
  const byId = new Map(records.map((record) => [String(record.goalId), record]))
  const reasons: Record<string, string> = {
    [ids.acceleratedMotion]:
      'Konstante Beschleunigung und die drei äquivalenten Zeitdarstellungen beschreiben gemeinsam genau ein begrenztes Bewegungsmodell.',
    [ids.averageInstantaneousVelocity]:
      'Endliches Intervall, Zeitpunkt sowie Sekanten- und Tangentensteigung operationalisieren gemeinsam genau die Unterscheidung von Durchschnitts- und Momentangeschwindigkeit.',
  }
  for (const goalId of [ids.acceleratedMotion, ids.averageInstantaneousVelocity]) {
    const goal = goalById.get(goalId)
    const record = byId.get(goalId) ?? {
      schemaVersion: 1,
      reviewId: 'canonical-physics-full',
      ruleVersion: 'semantic-atomicity-v1',
      landscapeId: physicsLandscapeId,
      goalId,
    }
    if (!goal || record.ruleVersion !== 'semantic-atomicity-v1') throw new Error(`${goalId}: atomicity input drifted`)
    Object.assign(record, {
      fingerprint: reviewFingerprint(goal, 'semantic-atomicity-v1'),
      reviewedAt,
      reviewer,
      status: 'atomic',
      semanticAtomic: true,
      reason: reasons[goalId],
      suggestedSplit: [],
    })
    byId.set(goalId, record)
  }
  const result = [...byId.values()].sort((left, right) => {
    const a = String(left.goalId)
    const b = String(right.goalId)
    return a < b ? -1 : a > b ? 1 : 0
  })
  const expectedIds = sortStrings((semanticKinds.decisions as JsonRecord[])
    .filter((decision) => decision.semanticKind === 'curricularAtomic')
    .map((decision) => String(decision.goalId)))
  if (result.length !== 461 || !same(result.map((record) => String(record.goalId)), expectedIds)) {
    throw new Error('Atomicity ledger does not exactly cover 461 curricularAtomic Physics goals')
  }
  return result
}

function buildMemory(canonical: JsonRecord, semanticKinds: JsonRecord): JsonRecord[] {
  const goalById = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const records = readJsonl(paths.memory)
  const byId = new Map(records.map((record) => [String(record.goalId), record]))
  const oldRecord = byId.get(ids.acceleratedMotion)
  const oldGoal = goalById.get(ids.acceleratedMotion)
  const newGoal = goalById.get(ids.averageInstantaneousVelocity)
  if (
    !oldRecord
    || !oldGoal
    || !newGoal
    || oldRecord.status !== 'memory_required'
    || !same(oldRecord.memoryGoalIds, ['9f2f5ab8-0ae4-5792-b831-82a05af5895c'])
    || !same(oldRecord.deckIds, ['de_gymnasium_physics_mechanics_ephase'])
  ) throw new Error('Accelerated-motion memory-required decision drifted')
  Object.assign(oldRecord, {
    fingerprint: reviewFingerprint(oldGoal, 'memory-card-review-v1'),
    status: 'memory_required',
    memoryUseful: true,
    reviewedAt,
    reviewer,
    reason:
      'Für das Konstantbeschleunigungsmodell bleiben wenige kompakte Formel- und Diagrammzusammenhänge abrufwürdig; Modellverständnis, Anfangsbedingungen und Darstellungswechsel werden weiterhin in Coaching und Aufgaben geprüft.',
  })
  byId.set(ids.acceleratedMotion, oldRecord)
  byId.set(ids.averageInstantaneousVelocity, {
    schemaVersion: 1,
    reviewId: 'canonical-physics-full',
    ruleVersion: 'memory-card-review-v1',
    landscapeId: physicsLandscapeId,
    goalId: ids.averageInstantaneousVelocity,
    fingerprint: reviewFingerprint(newGoal, 'memory-card-review-v1'),
    status: 'no_memory_needed',
    memoryUseful: false,
    reviewedAt,
    reviewer,
    reason:
      'Die Unterscheidung von Intervall und Zeitpunkt sowie die Sekanten-/Tangenten-Deutung verlangen begriffliches und grafisches Verständnis statt isolierten Faktenabrufs.',
  })
  const result = [...byId.values()].sort((left, right) => {
    const a = String(left.goalId)
    const b = String(right.goalId)
    return a < b ? -1 : a > b ? 1 : 0
  })
  const expectedIds = sortStrings((semanticKinds.decisions as JsonRecord[])
    .filter((decision) => decision.semanticKind === 'curricularAtomic')
    .map((decision) => String(decision.goalId)))
  const statusCounts = result.reduce<Record<string, number>>((counts, record) => {
    counts[record.status] = (counts[record.status] ?? 0) + 1
    return counts
  }, {})
  if (
    result.length !== 461
    || !same(result.map((record) => String(record.goalId)), expectedIds)
    || !same(statusCounts, { memory_required: 127, no_memory_needed: 334 })
  ) throw new Error(`Memory ledger contract failed: ${stableJson(statusCounts)}`)
  return result
}

function buildPhysicsAtlasSourceManifest(): JsonRecord {
  const manifest = readJson(paths.physicsAtlasSourceManifest)
  if (
    manifest.manifestId !== 'de-gym-physics-national-atlas'
    || manifest.landscapeId !== physicsLandscapeId
    || manifest.expectedCurricularAtomicGoalCount !== 460
    || !Array.isArray(manifest.sourcePaths)
    || manifest.sourcePaths.length !== 64
  ) throw new Error('Physics atlas source manifest drifted from the exact 460-goal before-state')
  manifest.expectedCurricularAtomicGoalCount = 461
  return manifest
}

function readIntegerConstant(source: string, name: string): number {
  const matches = [...source.matchAll(new RegExp(`const ${name} = (\\d+)`, 'gu'))]
  if (matches.length !== 1) throw new Error(`Physics input test must contain exactly one ${name} constant`)
  return Number(matches[0][1])
}

function buildPhysicsGoalBookInputTest(compositionViews: Map<string, JsonRecord>): string {
  assertNewGoalDoesNotChangeSekIProjectionCounters(compositionViews)
  let source = readFileSync(absolute(paths.physicsGoalBookInputTest), 'utf8')
  source = replaceOnceOrAfter(
    source,
    '  curricularAtomic: 460,',
    '  curricularAtomic: 461,',
    'Physics input-test curricularAtomic count',
  )
  source = replaceOnceOrAfter(
    source,
    '  total: 705,',
    '  total: 706,',
    'Physics input-test total count',
  )
  const projectedCounters = {
    visibleProjectedRouteTargetGoalOccurrences: readIntegerConstant(
      source,
      'EXPECTED_PHYSICS_SEKI_PROJECTED_ROUTE_TARGET_OCCURRENCES',
    ),
    visibleProfileSelectedAtomicGoalOccurrences: readIntegerConstant(
      source,
      'EXPECTED_PHYSICS_SEKI_PROFILE_SELECTED_TARGET_OCCURRENCES',
    ),
    visibleProjectedRouteTargetGoalOccurrencesExcludedByProfileSelector: readIntegerConstant(
      source,
      'EXPECTED_PHYSICS_SEKI_PROFILE_SELECTOR_EXCLUDED_OCCURRENCES',
    ),
    uniqueProjectedRouteTargetsExcludedByProfileSelector: readIntegerConstant(
      source,
      'EXPECTED_PHYSICS_SEKI_PROFILE_SELECTOR_EXCLUDED_UNIQUE_GOALS',
    ),
  }
  if (!same(projectedCounters, physicsSekIProjectionCounterContract)) {
    throw new Error(`Physics Sek-I projection-counter contract drifted: ${stableJson(projectedCounters)}`)
  }
  return source
}

function buildFollowUpConfig(): JsonRecord {
  const source = readJson(paths.batch025Config)
  if (!Array.isArray(source.goalIds) || source.goalIds.length !== 20) {
    throw new Error('Batch-025 source config must contain exactly 20 goal IDs')
  }
  if (source.goalIds.includes(ids.averageInstantaneousVelocity)) {
    throw new Error('Batch-025 source config motion-goal contract drifted')
  }
  const stableIds = new Set<string>(stableCarryoverGoalIds)
  const goalIds = source.goalIds.filter((goalId: string) => !stableIds.has(goalId))
  if (
    goalIds.length !== 16
    || !goalIds.includes(revisedFreshReviewGoalId)
    || stableCarryoverGoalIds.some((goalId) => goalIds.includes(goalId))
  ) {
    throw new Error('Batch-025 stable-carryover exclusion contract drifted')
  }
  const oldIndex = goalIds.indexOf(ids.acceleratedMotion)
  if (oldIndex < 0) throw new Error('Batch-025 fresh-review config lacks accelerated motion')
  goalIds.splice(oldIndex, 0, ids.averageInstantaneousVelocity)
  if (goalIds.length !== 17 || new Set(goalIds).size !== 17) {
    throw new Error('Batch-025a follow-up must contain exactly 17 unique fresh-review goals')
  }
  return {
    ...source,
    batchId: 'physik-rollout-v1-batch-025a-e-mechanics-energy-structural-follow-up-17-v1-20260829',
    bookId: 'de-gym-physics-e-mechanics-energy-structural-follow-up-17-v1-20260829',
    title: 'Physik B025a – E-Phase: struktureller Follow-up nach Split (17 Atome)',
    goalIds,
    outputDirectory:
      'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-29/'
      + 'batch-025a-e-mechanics-energy-structural-follow-up-17-v1',
  }
}

function assertOutputBoundary(files: PlannedFile[]): void {
  const expected = new Set<string>(outputPaths)
  const actual = new Set(files.map((file) => file.path))
  if (
    files.length !== actual.size
    || actual.size !== expected.size
    || [...actual].some((path) => !expected.has(path))
  ) throw new Error('Batch-025 motion split escaped the exact 87-file output boundary')
}

function buildExactBeforePlan(): PlannedFile[] {
  const canonical = buildCanonical()
  const semanticKinds = buildSemanticKinds(canonical)
  const atomicity = buildAtomicity(canonical, semanticKinds)
  const memory = buildMemory(canonical, semanticKinds)
  const compositionViews = new Map<string, JsonRecord>(compositionViewPaths.map((path) => [
    path,
    buildCompositionView(path),
  ]))
  const physicsAtlasSourceManifest = buildPhysicsAtlasSourceManifest()
  const physicsGoalBookInputTest = buildPhysicsGoalBookInputTest(compositionViews)
  const generators = new Map<string, string>([
    [paths.heGenerator, buildHeGenerator()],
    [paths.mvGenerator, buildBatch019Generator(paths.mvGenerator, mvChanges, 'MV')],
    [paths.shGenerator, buildShGenerator()],
    [paths.slGenerator, buildSimpleGenerator(
      paths.slGenerator,
      slChanges,
      'SL',
      'Das amtliche SL-Source-Ziel ist inhaltlich durch ein kanonisches Physikziel abgedeckt.',
    )],
    [paths.snGenerator, buildBatch019Generator(paths.snGenerator, snChanges, 'SN')],
    [paths.stGenerator, buildSimpleGenerator(
      paths.stGenerator,
      stChanges,
      'ST',
      'Das amtliche Sachsen-Anhalt-Source-Ziel ist inhaltlich durch den angegebenen kanonischen Physik-Teilbaum abgedeckt; die Zuordnung auf ein Sammelziel ist eine fachliche Abdeckungsentscheidung.',
    )],
  ])
  for (const [path, source] of generators) assertTypeScriptSyntax(path, source)
  const files: PlannedFile[] = [
    { path: paths.canonical, bytes: serializeJson(canonical) },
    ...compositionViewPaths.map((path) => ({ path, bytes: serializeJson(compositionViews.get(path)!) })),
    ...generatorPaths.map((path) => ({ path, bytes: generators.get(path)! })),
    ...mappingPaths.map((path) => ({
      path,
      bytes: serializeJson(buildMappingReview(path, mappingChangesByPath.get(path)!)),
    })),
    { path: paths.heLegacyMapping, bytes: serializeJson(buildHeLegacyMapping()) },
    { path: paths.provenance, bytes: serializeJson(buildProvenance()) },
    { path: paths.semanticKinds, bytes: serializeJson(semanticKinds) },
    { path: paths.atomicity, bytes: serializeJsonl(atomicity) },
    { path: paths.memory, bytes: serializeJsonl(memory) },
    { path: paths.physicsAtlasSourceManifest, bytes: serializeJson(physicsAtlasSourceManifest) },
    { path: paths.physicsGoalBookInputTest, bytes: physicsGoalBookInputTest },
    { path: paths.followUpConfig, bytes: serializeJson(buildFollowUpConfig()) },
  ]
  assertOutputBoundary(files)
  return files
}

function assertMaterializedAfterState(files: PlannedFile[]): void {
  const canonical = JSON.parse(files.find((file) => file.path === paths.canonical)!.bytes) as JsonRecord
  const semanticKinds = JSON.parse(files.find((file) => file.path === paths.semanticKinds)!.bytes) as JsonRecord
  const physicsAtlasSourceManifest = JSON.parse(
    files.find((file) => file.path === paths.physicsAtlasSourceManifest)!.bytes,
  ) as JsonRecord
  const physicsGoalBookInputTest = files.find((file) => file.path === paths.physicsGoalBookInputTest)!.bytes
  const followUpConfig = JSON.parse(files.find((file) => file.path === paths.followUpConfig)!.bytes) as JsonRecord
  if (
    canonical.goals?.length !== 706
    || canonical.goals.filter((goal: JsonRecord) => goal.id === ids.averageInstantaneousVelocity).length !== 1
    || semanticKinds.counts?.curricularAtomic !== 461
    || semanticKinds.counts?.total !== 706
    || physicsAtlasSourceManifest.expectedCurricularAtomicGoalCount !== 461
    || !physicsGoalBookInputTest.includes('  curricularAtomic: 461,')
    || !physicsGoalBookInputTest.includes('  total: 706,')
  ) throw new Error('Materialized Batch-025 after-state semantic counts failed')
  if (
    !Array.isArray(followUpConfig.goalIds)
    || followUpConfig.goalIds.length !== 17
    || new Set(followUpConfig.goalIds).size !== 17
    || !followUpConfig.goalIds.includes(ids.averageInstantaneousVelocity)
    || !followUpConfig.goalIds.includes(revisedFreshReviewGoalId)
    || stableCarryoverGoalIds.some((goalId) => followUpConfig.goalIds.includes(goalId))
  ) throw new Error('Materialized Batch-025a fresh-review/carryover boundary failed')
  const materializedProjectionCounters = {
    visibleProjectedRouteTargetGoalOccurrences: readIntegerConstant(
      physicsGoalBookInputTest,
      'EXPECTED_PHYSICS_SEKI_PROJECTED_ROUTE_TARGET_OCCURRENCES',
    ),
    visibleProfileSelectedAtomicGoalOccurrences: readIntegerConstant(
      physicsGoalBookInputTest,
      'EXPECTED_PHYSICS_SEKI_PROFILE_SELECTED_TARGET_OCCURRENCES',
    ),
    visibleProjectedRouteTargetGoalOccurrencesExcludedByProfileSelector: readIntegerConstant(
      physicsGoalBookInputTest,
      'EXPECTED_PHYSICS_SEKI_PROFILE_SELECTOR_EXCLUDED_OCCURRENCES',
    ),
    uniqueProjectedRouteTargetsExcludedByProfileSelector: readIntegerConstant(
      physicsGoalBookInputTest,
      'EXPECTED_PHYSICS_SEKI_PROFILE_SELECTOR_EXCLUDED_UNIQUE_GOALS',
    ),
  }
  if (!same(materializedProjectionCounters, physicsSekIProjectionCounterContract)) {
    throw new Error('Materialized Physics Sek-I projection-counter contract failed')
  }
  let targetCount = 0
  let prerequisiteCount = 0
  const compositionViews = new Map<string, JsonRecord>()
  for (const path of compositionViewPaths) {
    const view = JSON.parse(files.find((file) => file.path === path)!.bytes) as JsonRecord
    compositionViews.set(path, view)
    const parentArrays = findGoalReferenceParents(view, ids.averageInstantaneousVelocity)
    if (countGoalReferences(view, ids.averageInstantaneousVelocity) !== 1 || parentArrays.length !== 1) {
      throw new Error(`${path}: materialized new-goal reference count failed`)
    }
    const reference = parentArrays[0]
      .find((child) => child.goalId === ids.averageInstantaneousVelocity)
    if (isTargetView(path)) {
      const motion = findStructures(view, 'physics-e1-motion')
      if (
        motion.length !== 1
        || parentArrays[0] !== motion[0].children
        || reference?.kind !== 'canonicalSubtree'
        || reference?.projectionRole !== undefined
      ) throw new Error(`${path}: materialized target placement/role failed`)
      targetCount += 1
    } else {
      if (reference?.kind !== 'goalEntry' || reference?.projectionRole !== 'prerequisiteOnly') {
        throw new Error(`${path}: materialized prerequisite-only role failed`)
      }
      prerequisiteCount += 1
    }
  }
  if (targetCount !== 28 || prerequisiteCount !== 36) {
    throw new Error(`Materialized projection counts failed: target=${targetCount} prerequisiteOnly=${prerequisiteCount}`)
  }
  assertNewGoalDoesNotChangeSekIProjectionCounters(compositionViews)
}

type BoundedState = 'exact-before' | 'mixed' | 'exact-after'

function pendingBindingLabels(): string[] {
  return [
    ...(expectedBeforeCorpusSha256 === 'PENDING' ? ['before-corpus'] : []),
    ...Object.entries(expectedBeforeHashes)
      .filter(([, value]) => value === 'PENDING')
      .map(([path]) => `before:${path}`),
    ...Object.entries(protectedInputHashes)
      .filter(([, value]) => value === 'PENDING')
      .map(([path]) => `protected:${path}`),
    ...Object.entries(expectedAfterHashes)
      .filter(([, value]) => value === 'PENDING')
      .map(([path]) => `after:${path}`),
    ...(expectedBoundedPlanSha256 === 'PENDING' ? ['bounded-plan'] : []),
  ]
}

function classifyBoundedOutputs(): {
  boundedState: BoundedState
  outputStates: Map<string, OutputState>
  beforeCount: number
  afterCount: number
} {
  const outputStates = new Map<string, OutputState>()
  let beforeCount = 0
  let afterCount = 0
  for (const path of outputPaths) {
    const before = expectedBeforeHashes[path]
    const after = expectedAfterHashes[path]
    if (!before || before === 'PENDING' || !after || after === 'PENDING') {
      throw new Error(`${path}: cannot classify an output with PENDING before/after binding`)
    }
    if (before === missingFileBinding && path !== paths.followUpConfig) {
      throw new Error(`${path}: only the new follow-up config may have a missing before-state`)
    }
    if (path === paths.followUpConfig && before !== missingFileBinding) {
      throw new Error(`${path}: follow-up config before-state must be MISSING`)
    }
    if (!/^[0-9a-f]{64}$/u.test(after) || (before !== missingFileBinding && !/^[0-9a-f]{64}$/u.test(before))) {
      throw new Error(`${path}: invalid bound before/after SHA-256`)
    }
    if (before === after) throw new Error(`${path}: before and after bindings must differ`)
    const actual = currentOutputHash(path)
    if (actual === before) {
      outputStates.set(path, 'before')
      beforeCount += 1
    } else if (actual === after) {
      outputStates.set(path, 'after')
      afterCount += 1
    } else {
      throw new Error(`${path}: unknown output bytes (${actual}); expected before=${before} or after=${after}`)
    }
  }
  const boundedState: BoundedState = beforeCount === outputPaths.length
    ? 'exact-before'
    : afterCount === outputPaths.length ? 'exact-after' : 'mixed'
  if (boundedState === 'exact-before') {
    const current = currentBeforeCorpusBinding()
    if (current.sha256 !== expectedBeforeCorpusSha256) {
      throw new Error(`Exact-before corpus drifted (${current.sha256} != ${expectedBeforeCorpusSha256})`)
    }
  }
  return { boundedState, outputStates, beforeCount, afterCount }
}

function loadResumableAfterPlan(outputStates: Map<string, OutputState>): PlannedFile[] {
  const files = outputPaths.map((path) => {
    const state = outputStates.get(path)
    if (!state) throw new Error(`${path}: missing bounded output state`)
    const staging = stagingPath(path)
    if (state === 'after') {
      if (existsSync(staging)) throw new Error(`${path}: unexpected staging file beside exact after-state`)
      return { path, bytes: readFileSync(absolute(path), 'utf8') }
    }
    if (!existsSync(staging)) {
      throw new Error(`${path}: mixed-state resume requires its pre-staged exact after-bytes`)
    }
    const bytes = readFileSync(staging, 'utf8')
    if (sha256(bytes) !== expectedAfterHashes[path]) {
      throw new Error(`${path}: stale staging bytes do not match the bound after-hash`)
    }
    return { path, bytes }
  })
  assertOutputBoundary(files)
  assertMaterializedAfterState(files)
  return files
}

const beforeBinding = currentBeforeCorpusBinding()
const pendingBindings = pendingBindingLabels()
if ((writeMode || checkMode) && pendingBindings.length > 0) {
  throw new Error(
    `Refusing ${writeMode ? '--write' : '--check'} while ${pendingBindings.length} binding(s) remain PENDING: `
    + pendingBindings.slice(0, 3).join(', '),
  )
}

if (!Object.values(protectedInputHashes).includes('PENDING')) assertProtectedInputs()

const outputBindingsBound = [...Object.values(expectedBeforeHashes), ...Object.values(expectedAfterHashes)]
  .every((value) => value !== 'PENDING')
let boundedState: BoundedState = 'exact-before'
let outputStates = new Map<string, OutputState>(outputPaths.map((path) => [path, 'before']))
let beforeCount = outputPaths.length
let afterCount = 0
if (outputBindingsBound) {
  ({ boundedState, outputStates, beforeCount, afterCount } = classifyBoundedOutputs())
} else {
  if (existsSync(absolute(paths.followUpConfig))) {
    throw new Error(`Unbound PLAN requires the exact missing follow-up config: ${paths.followUpConfig}`)
  }
  for (const [path, expected] of Object.entries(expectedBeforeHashes)) {
    if (expected !== 'PENDING' && currentOutputHash(path) !== expected) {
      throw new Error(`${path}: bound before-hash disagrees with the unbound PLAN input`)
    }
  }
  if (expectedBeforeCorpusSha256 !== 'PENDING' && beforeBinding.sha256 !== expectedBeforeCorpusSha256) {
    throw new Error(`Unbound PLAN before-corpus drifted (${beforeBinding.sha256} != ${expectedBeforeCorpusSha256})`)
  }
}

const plannedFiles = boundedState === 'exact-before'
  ? buildExactBeforePlan()
  : loadResumableAfterPlan(outputStates)
assertMaterializedAfterState(plannedFiles)
const plannedOutputBindings = plannedFiles.map(({ path, bytes }) => ({ path, sha256: sha256(bytes) }))
if (!Object.values(expectedAfterHashes).includes('PENDING')) {
  for (const { path, sha256: plannedSha256 } of plannedOutputBindings) {
    if (expectedAfterHashes[path] !== plannedSha256) {
      throw new Error(`${path}: planned output hash ${plannedSha256} != bound ${expectedAfterHashes[path]}`)
    }
  }
}
const boundedPlanSha256 = sha256(stableJson({
  planVersion: 'physics-batch-025-motion-split-v1',
  exactBeforeCorpusSha256: expectedBeforeCorpusSha256 === 'PENDING'
    ? beforeBinding.sha256
    : expectedBeforeCorpusSha256,
  beforeOutputBindings: outputPaths.map((path) => ({
    path,
    sha256: expectedBeforeHashes[path] === 'PENDING'
      ? currentOutputHash(path)
      : expectedBeforeHashes[path],
  })),
  protectedInputHashes: Object.fromEntries(Object.entries(protectedInputHashes).map(([path, expected]) => [
    path,
    expected === 'PENDING' ? currentOutputHash(path) : expected,
  ])),
  oldGoalId: ids.acceleratedMotion,
  newGoalId: ids.averageInstantaneousVelocity,
  deterministicShortKey: 'canonical_physics_e_average_instantaneous_velocity',
  canonicalParentId: ids.motionCorridor,
  excludedFreeFallClusterId: ids.freeFallCluster,
  targetViewCount: 28,
  prerequisiteOnlyViewCount: 36,
  freshReviewGoalCount: 17,
  stableCarryoverGoalIds,
  protectedSourceExtractionCount: 8,
  physicsSekIProjectionCounters: physicsSekIProjectionCounterContract,
  physicsSekIProjectionCounterDelta: {
    visibleProjectedRouteTargetGoalOccurrences: 0,
    visibleProfileSelectedAtomicGoalOccurrences: 0,
    visibleProjectedRouteTargetGoalOccurrencesExcludedByProfileSelector: 0,
    uniqueProjectedRouteTargetsExcludedByProfileSelector: 0,
  },
  mappingChanges: allMappingChanges,
  plannedOutputBindings,
}))
if (expectedBoundedPlanSha256 !== 'PENDING' && boundedPlanSha256 !== expectedBoundedPlanSha256) {
  throw new Error(`Batch-025 bounded plan drift: ${boundedPlanSha256} != ${expectedBoundedPlanSha256}`)
}

const changed = plannedFiles.filter(({ path, bytes }) => (
  !existsSync(absolute(path)) || readFileSync(absolute(path), 'utf8') !== bytes
))
if (changed.length !== beforeCount) {
  throw new Error(`Bounded output-state count disagrees with planned bytes: before=${beforeCount} changed=${changed.length}`)
}
if (checkMode && (boundedState !== 'exact-after' || changed.length > 0)) {
  throw new Error(`Batch-025 motion split is not exact-after; ${changed.length} planned files differ`)
}

if (writeMode) {
  execFileSync('node', ['scripts/check_openai_plugin_review_freeze.mjs'], {
    cwd: repoRoot,
    stdio: 'inherit',
  })
  const updates = plannedFiles.filter(({ path }) => outputStates.get(path) === 'before')
  for (const { path, bytes } of updates) {
    const staging = stagingPath(path)
    mkdirSync(dirname(staging), { recursive: true })
    if (existsSync(staging)) {
      if (sha256(readFileSync(staging)) !== expectedAfterHashes[path]) {
        throw new Error(`${path}: stale staging bytes do not match the bound after-hash`)
      }
    } else {
      writeFileSync(staging, bytes, { encoding: 'utf8', flag: 'wx' })
    }
    if (sha256(readFileSync(staging)) !== expectedAfterHashes[path]) {
      throw new Error(`${path}: staged output hash mismatch`)
    }
  }
  for (const { path } of plannedFiles) {
    if (outputStates.get(path) === 'after' && existsSync(stagingPath(path))) {
      throw new Error(`${path}: unexpected staging file beside exact after-state`)
    }
  }
  for (const { path } of updates) {
    renameSync(stagingPath(path), absolute(path))
    assertSha256(path, expectedAfterHashes[path], 'Renamed Batch-025 output')
  }
  for (const path of outputPaths) assertSha256(path, expectedAfterHashes[path], 'Written Batch-025 output')
  for (const [path, expected] of Object.entries(protectedInputHashes)) assertSha256(path, expected, 'Protected post-write input')
}

const status = writeMode ? 'WRITE' : changed.length === 0 ? 'PASS' : 'PLAN'
console.log(
  `CHECK apply_physics_batch025_motion_split ${status} state=${boundedState} before=${beforeCount} after=${afterCount} `
  + `canonical=705->706 views=64 target=28 prerequisiteOnly=36 mappings=20 generators=6 `
  + `curricularAtomic=460->461 memoryRequired=127 noMemoryNeeded=334 freshReview=17 carryover=4 `
  + `visualBytes=preserved plannedWrites=${changed.length}`,
)
console.log(`BEFORE_CORPUS_SHA256 ${beforeBinding.sha256} binding=${expectedBeforeCorpusSha256} files=${beforeBinding.fileCount}`)
console.log(`BEFORE_HASHES ${JSON.stringify(Object.fromEntries(currentOutputBindings().map(({ path, sha256: digest }) => [path, digest])))}`)
console.log(`BOUNDED_PLAN_SHA256 ${boundedPlanSha256} binding=${expectedBoundedPlanSha256}`)
console.log(
  `PHYSICS_SEKI_PROJECTION_COUNTERS ${JSON.stringify(physicsSekIProjectionCounterContract)} delta=0`,
)
console.log(`OUTPUT_HASHES ${JSON.stringify(Object.fromEntries(plannedOutputBindings.map(({ path, sha256: digest }) => [path, digest])))}`)
console.log(
  `PRESERVE dependents=8 freeFallCluster=no-new-child images=${ids.acceleratedMotion}:sha256:`
  + `${protectedInputHashes[paths.canonicalVisualization]} assessments=unchanged sourceExtractions=unchanged`,
)
