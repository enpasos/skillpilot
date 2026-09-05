import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import {
  normalizeCanonicalLandscape,
  normalizeGoalRef,
  resolveCanonicalNodeType,
  type CanonicalAuthoringGoal,
  type CanonicalAuthoringLandscape,
} from '../src/utils/authoring/canonicalAuthoring'
import {
  compileCompositionView,
  normalizeCompositionView,
  type CompiledCompositionPreviewNode,
  type CompositionViewNode,
} from '../src/utils/authoring/compositionViewAuthoring'
import { buildApplicabilityCompilation } from './applicabilityCompiler'
import { parseSubjectDurationModelPolicy } from './goalBookModel'

type SemanticKind =
  | 'curricularAtomic'
  | 'curricularArea'
  | 'practiceAssessment'
  | 'programStructure'
  | 'memory'
  | 'runtimeSupport'
  | 'orientation'

interface SemanticKindDecision {
  goalId: string
  sourceFingerprint: string
  semanticKind: SemanticKind
  decisionStatus: string
  decisionBasis: string
}

interface SemanticKindLedger {
  documentType: string
  ledgerFormatVersion: number
  ledgerId: string
  profileId: string
  profileVersion: string
  sourceLandscapeId: string
  sourceLandscapePath: string
  sourceFingerprintContractId: string
  reviewMethod: string
  counts: Record<SemanticKind | 'total', number>
  decisions: SemanticKindDecision[]
}

interface AtomicityReviewRecord {
  schemaVersion: number
  reviewId: string
  ruleVersion: string
  landscapeId: string
  goalId: string
  fingerprint: string
  status: string
  semanticAtomic: boolean | null
}

interface SourceFingerprintContract {
  contractId: string
  algorithm: string
  domain: string
  canonicalJsonProfile: string
  canonicalJsonProfileVersion: string
  canonicalJsonProfilePath: string
  canonicalJsonProfileSha256: string
  pointers: string[]
}

interface PhysicsDurationDecision {
  subject?: string
  jurisdiction?: string
  stage?: string
  sourceExtractionPath?: string
  status?: string
  decision?: string
  durationModels?: string[]
  learnerFacingProjection?: string
  compositionViewIds?: string[]
  evidenceSources?: string[]
  rationale?: string
}

interface SourceManifest {
  schemaVersion: number
  manifestId: string
  landscapeId: string
  navigationOwnership: string
  navigationViewPath: string
  expectedJurisdictions: string[]
  durationModelPolicyPath: string
  expectedCurricularAtomicGoalCount: number
  sourcePaths: string[]
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const LANDSCAPE_ID = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const LANDSCAPE_PATH = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const ATOMICITY_CONFIG_PATH = 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.config.json'
const ATOMICITY_REVIEW_PATH = 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl'
const LEDGER_PATH = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const MATH_PROFILE_PATH = 'contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-v1.profile.json'
const MATH_LANDSCAPE_PATH = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const LEDGER_SCHEMA_PATH = 'contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json'
const LEGACY_SOURCE_MANIFEST_SCHEMA_PATH = 'contracts/goal-book/v1/goal-book-source-manifest.schema.json'
const SOURCE_MANIFEST_SCHEMA_PATH = 'contracts/goal-book/v1/goal-book-source-manifest-v2.schema.json'
const SOURCE_MANIFEST_PATH = 'app/scripts/config/goal-books/de-gym-physics-national-atlas.sources.json'
const CONFIG_PATH = 'app/scripts/config/goal-books/de-gym-physics-national-atlas.json'
const DURATION_POLICY_PATH = 'curricula/DE/Gymnasium/provenance/gymnasium-physics-duration-model-policy.json'
const SHARED_DURATION_POLICY_PATH = 'curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json'
const CURRICULUM_QUALITY_STATUS_PATH = 'docs/qa-ci/status/curriculum-quality-status.json'
const APPLICABILITY_OVERRIDE_REGISTRY_PATH =
  'curricula/DE/Gymnasium/provenance/canonical-goal-applicability-override-registry.json'
const COMPOSITION_VIEW_DIRECTORY = 'curricula/DE/Gymnasium/composition-views/physik'
const NATIONAL_PHYSICS_VIEW_IDS = new Set([
  'de-de-gym-physics-gk',
  'de-de-gym-physics-lk',
  'de-de-gym-sekii-physics-gk',
  'de-de-gym-sekii-physics-lk',
])
const GRAVITATION_ROOT_GOAL_ID = '0ade0d10-8b32-5a95-a1a9-8ac64e2a8089'
const GRAVITATION_LK_ONLY_PROJECTION_ROOTS = [
  {
    goalId: '16caf92e-2800-57d1-946c-5b92ce848a96',
    kind: 'goalEntry',
  },
  {
    goalId: '89cadf81-143b-5f6b-82bd-29ba20d92a1b',
    kind: 'goalEntry',
  },
  {
    goalId: '423e21b9-0d0c-5709-899d-7ab738b55e36',
    kind: 'canonicalSubtree',
  },
] as const
const GRAVITATION_LK_ONLY_GOAL_IDS = [
  ...GRAVITATION_LK_ONLY_PROJECTION_ROOTS.map(({ goalId }) => goalId),
  '481ffd56-d585-56fe-b525-ed423e30eed3',
  '1b833656-cd16-5b21-973a-9810960dcfd2',
  'c968d263-8be4-5cf9-b320-e95398fe648f',
] as const
const GRAVITATION_COMPOSITION_JURISDICTIONS = [
  'bb', 'be', 'hb', 'he', 'hh', 'mv', 'ni', 'nw', 'rp', 'sh', 'sl', 'sn', 'st', 'th',
] as const
const EXPECTED_GRAVITATION_GK_VIEW_IDS = new Set([
  'de-de-gym-physics-gk',
  'de-de-gym-sekii-physics-gk',
  ...GRAVITATION_COMPOSITION_JURISDICTIONS.flatMap((jurisdiction) => [
    `de-${jurisdiction}-gym-physics-gk`,
    `de-${jurisdiction}-gym-sekii-physics-gk`,
  ]),
])
const EXPECTED_GRAVITATION_LK_VIEW_IDS = new Set([
  'de-de-gym-physics-lk',
  'de-de-gym-sekii-physics-lk',
  ...GRAVITATION_COMPOSITION_JURISDICTIONS.flatMap((jurisdiction) => [
    `de-${jurisdiction}-gym-physics-lk`,
    `de-${jurisdiction}-gym-sekii-physics-lk`,
  ]),
])
const REVIEWED_NEWTON_ATOMIC_GOAL_IDS = [
  '31a2ef52-114b-4d2c-a720-6ef5a390b6dc',
  '32b896b9-f2f1-4d4e-96ad-e869ac3d3759',
  'a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20',
  '5f289cdc-fda1-4058-b44f-041ba1398e79',
  'ad984bb6-e225-432a-952d-d83cda40b7f8',
  'a0aaedcb-41f8-4891-af77-a69a76b8c10d',
  '00245a43-eb89-47d2-92d7-21799dbec9f3',
] as const
const BILINGUAL_COMPLETENESS_RECHECK_GOAL_IDS = new Set([
  '37b33812-d428-5953-852e-57a53a4347fe',
  '7fe3022f-fad0-5f41-af1c-d55ff214ebc6',
])
const STRUCTURAL_SPLIT_ATOMIC_GOAL_IDS = new Set([
  '2a6ad2c6-3e1b-57a9-82a1-e6620a532f5c',
  '41d35667-0296-5f84-bc12-202ffc440be0',
  '33e3417c-e062-5f4a-8df9-3195dca50089',
  '3c8e5510-a12d-5770-8a01-e5fe741b259c',
  '51de4fd9-6827-5b3d-b2ca-5e27ba961a7f',
  '67ffd0f0-a5ab-518f-8c45-4c0e7eb18390',
  'af0e2efb-f634-5f2d-abea-b2e1a67a2894',
  'b57427c9-1af5-5daa-8c65-b84a4cc20785',
  'b60f63b6-e70b-5557-9f54-86d42fa80325',
  'b92827a7-5d62-5fdb-a6f5-ac44461f4a7b',
  'c2d6bdf1-8077-50fb-a8b5-2f0b7e3493f0',
  'f0046ae8-cbfc-526b-8414-04e3595b6075',
  'f827b00f-af7f-52de-84aa-2a2bbaa035bd',
  'f92b5b8a-327f-50d2-8313-6a142399ebf0',
  'f7f2c254-1663-5861-bed7-a32c00495b19',
  'da0837c7-95a7-5a6a-81db-f33cb7f42d85',
  '7ca44ba0-b77e-52bf-8562-f67b44767172',
  '69f8f59c-b0c3-5b0b-82db-834a0e655736',
  'dc7dd287-6eac-574d-818d-65cfb23a2d94',
  '28237994-9c24-5a06-82fe-be1f494768ba',
  '80dd0a2b-1422-5b00-89ff-ec4d0faa047e',
  '5ddba212-9e0a-5dd4-8274-239ec51ab6a8',
  'c156d2fb-0fe9-5f13-8baa-3e74d7da151e',
  '66256e22-44a3-5939-8862-821e29d6711d',
  'af7855a3-6aea-5e05-8505-248bc9a8c219',
  '4a42cddd-7827-5204-87e5-8d9eac7792f1',
  '27b90ce9-b650-5232-85fb-ce2cb69d59a3',
  'f74c691b-0b76-54e0-8fd6-a22211994e0a',
  '25d91cc0-d84c-5522-86b5-fdff73264f08',
  '861ba00a-e89c-5b3d-8c76-8ff0bcb0f1cd',
  '1593d95c-2aac-504c-8527-37cb61877da9',
  '16b94a12-ecc5-5b5c-85b6-87b4290bebf8',
  '9f85de48-1b3f-5afb-8a34-ce94cf7a1b49',
  'ce037050-f94c-5828-883a-76385c84d1f7',
  '5c5d6698-c056-5850-8ecd-6dd87fb44549',
  'f9c025ce-4327-5de7-8288-a3358e14a576',
  '89124b92-5769-5e13-8a5d-78497936260f',
  '2014791b-af68-58d0-838b-fc9701202096',
  '1b7e800a-1c0d-5faa-886b-7ef2f3b8348c',
  '09995ab9-86aa-5b02-8a58-62b16a37831d',
  'd024aa45-5dbb-51f7-87a6-9ba939858696',
  'e06dd9c7-8c36-5ca4-880b-57b02d837085',
  '0b8a4215-e6ed-56c8-88c3-b3a2a99723c7',
  'bebc3738-0be6-52cf-83db-f8b948f7cf7b',
  '5e9cd796-3887-5457-8a1f-26863ca7eb28',
  '9851bd02-ca48-5ce4-8e9f-9ec4af1c43b8',
  '23335a89-f8e6-5c22-8705-d71193aeac96',
  '6e1cd027-040b-51d9-8764-3cf3daddb5ec',
  '44766569-6379-5fbc-8976-cd3fc2fd6ec4',
  '206a7d3d-9b11-56be-89ff-73898445c4f5',
  '44f0eefa-2d93-5954-879f-f6c49e5cebc7',
  'f3dbcafa-1849-5ee1-8807-81e8d7fed73d',
  'c53b3f0c-b4fe-5509-8803-a36c2883e5d6',
  'bf8517a9-142b-5789-826a-767f3b277998',
])
const STRUCTURAL_SPLIT_CLUSTER_GOAL_IDS = new Set([
  '3e33813d-db75-4571-8345-3845b02b956d',
  '1fede37b-6554-5dd3-93d9-08ed1fd09c91',
  '10bb8262-fb0f-40cf-94ef-408420ec7cf2',
  '201d353a-dfe7-521b-b0f6-eccb4d42945b',
  '7c996528-5fae-5353-b8fb-d59382e225c6',
  'cca06d84-28fe-4b80-9bcd-968dda026e0e',
  'd27c8860-12a4-4d7d-9849-ccd8b7caca48',
  'e41356c1-968b-435a-af25-b663f080ae5a',
  '75bdf5ca-cda4-4658-9ec7-84c77b3759db',
  '32111497-d5ca-453e-906d-d352f885b126',
  '59d1145e-ac54-5917-880a-21b4b80526d3',
  '1911920e-b099-4310-82f2-b47f51a78b33',
  'ec5cac7b-ad31-590c-8ab0-5b3ef24d2bca',
  '50431e92-eec9-54d6-b437-ea7a51b6f474',
  'f6f646db-3544-49ed-8f55-67bc684e80ce',
  'cb0426b0-a973-5660-b6fe-79407934730f',
  'e07f36de-2819-59f8-a707-fa25b4633ed3',
  'a7bec355-48c5-5107-bfab-d6956f9c9205',
  '7c8f1e34-d81a-51a2-8aa0-a6ee8e1b03a4',
  '4ea39b40-1563-58ab-8d54-5fc20efa5365',
  '2bc068de-5d2b-5f94-bd51-755982befb6f',
  '94a3a80e-f1de-51a2-b834-1e3431c5d3ca',
  '0a172021-dfd9-5926-b92c-c01a9dfe9aa8',
  '61e84097-57b9-5434-9909-8ed8368a7823',
  'f203a552-fcf0-560c-baa2-47d4eb2379c8',
])
const POST_SPLIT_PRACTICE_ASSESSMENT_GOAL_IDS = new Set([
  '3631c8f7-ff48-57ff-b7ee-8397ff1d166a',
  'ef2bb474-89e1-5deb-81c4-c6b05d174bbd',
  '44ada28b-8635-5481-8d09-2d91686d352b',
  '899481ae-2917-5fb0-805e-29e7c3c051be',
  '1a0dd12c-f30f-5e62-860b-93e393db9ce8',
  '0b8aff9a-6c77-51b9-82d4-725a21f32a90',
  'd8bad724-03ea-510a-8415-928332ed4979',
  '5353aabf-68c9-5788-8c25-8ed7e3ea42f3',
  '9fe4f83e-2065-53f5-8a35-ef4a3b76c17b',
  '924e1187-a067-5eb6-8d8d-85525ee6c837',
  '119cb138-b0c4-559d-8f1a-a4ae42db0656',
  '1ee79cae-a7da-53cb-86ff-872e8403f033',
  '5a530302-1303-517f-82cc-9cd457b792a8',
  '5f3bbce4-b0b9-5997-8c41-f58b2a8a8fa6',
  'def74475-7126-5e55-8517-498951118f26',
  '77257ded-ccf0-521f-8a8c-38c8f85fd3ca',
  '11c964ff-be82-5d02-8cd7-ccb41cda8f4f',
  '77b23e86-c39f-589e-8460-b28883baea51',
  '68061652-d617-5e51-8d2a-1c686c3c49df',
  'dfd2628f-b44e-51b3-86e8-99158861be8c',
  'b8c3dfb7-9286-52ac-8b0f-ad0a0ce941ed',
  'a77e53d5-246d-52df-86a2-d14f7a08fb77',
  'e1794352-ceee-5c27-8be4-224592ddbb89',
  'b637582c-a618-5698-817a-8d7bd1fa05f6',
  'b7e366e2-8323-5171-83a1-1f536c2062d8',
  'b1808b4c-5e02-5e1f-831f-47ee126e00ee',
  'ac6c578c-401b-5e4b-801a-6dff8fe8b93a',
  '198bfc8c-25f7-5a02-8618-47650ce36d14',
  '1abfd5ef-1f42-5b71-8c9a-80c0a6b0322e',
  'dbe230d5-31e1-5fca-8e11-2226821952ff',
  '93cdaa49-88e8-5e26-8506-656366d9ce3c',
  '8ff2a728-fba3-538e-83e9-69bdd8e1369e',
  '367b17f8-972a-5f3e-8915-8cfe743132a3',
  '654ec964-d982-593d-8c26-407a381675a6',
  '88f27aab-8724-5a4d-8543-e49ebcb54b8e',
  '8f62ab5e-20fc-562f-8121-63c082313e6e',
  '0cf2a5b0-8660-578d-8316-2b8a50fbdff7',
  'ca13e9cd-6377-540e-88c8-0308cddc8a7e',
  'a3c513d0-8fb9-5bd5-88cc-041527ff097d',
  'de7528cc-8c5d-5cd6-8d08-f8ce7457e666',
  'eb5e147f-a67c-542e-858b-533a00af7af2',
  '0b090935-1e43-581b-84ec-078741f8969e',
  '7cb0e5a0-c4ef-5e24-82b6-d8f85ffded8d',
  '2c195204-2e21-5369-8782-7bf4fc41bf9f',
  '44985d9f-7b49-52e4-86ec-eddc7b70429f',
  '35dd0a33-e5d5-53b9-8438-3d339173db1b',
  '00e2ddfe-18c1-57a4-86ad-ee467a1a3d61',
  '3f477f0d-4f79-5eed-8671-fb2667d60910',
  '0acb10a3-c5e2-5a76-8907-3dfe1b57e767',
  'bb7c5191-3c35-5ba6-85e0-795c7a049744',
  'd304cfd0-f87c-51f7-8dee-f5f405da4b3d',
  'e1d3c599-6964-5094-83ee-7fb1ecd161ce',
  '840a82e3-44aa-5d0f-8b6f-8a067d057d14',
  '7072dfbc-f684-5d4e-8c9a-ee74f7ebeeba',
  'd15764ce-ebea-5178-84ea-9351dd808b8c',
  '449d9732-a869-5126-8879-564da5c3d263',
  '4996346f-ab5d-4d09-9b9e-b9e559af153d',
  'bbe9a270-9b17-519f-8cd7-92c816ac4e29',
  '6c9d0ef3-c82f-534f-8024-6b0efcb88276',
])
const PHYSICS_MOTIVATION_GOAL_ID = '5c44b9ba-9b05-4774-95d5-073230d3fc4f'
const BAVARIA_PH10_1_GOAL_IDS = [
  '0f6b798b-594e-5480-8c5f-95e2486a4d85',
  '106417ed-80db-5490-a1ee-bb4160d3f2b4',
  'eb30189c-27c6-510b-b235-6543afa18b90',
  'a522c8c0-f3a4-5568-acae-3010ed9feb87',
  '1a037489-3c95-540b-8cae-0acd360358ee',
  'fdcd5faf-f9bf-4fa9-87f4-4e22d8d3387c',
  'af1094c1-511a-5aae-9e0a-3e9196a82d9a',
] as const
const BAVARIA_MOTOR_TRANSFORMER_ASSESSMENT_ID = '11c964ff-be82-5d02-8cd7-ccb41cda8f4f'
const GENERIC_SEKI_ASSESSMENT_ID = '3631c8f7-ff48-57ff-b7ee-8397ff1d166a'

const CQR104_ROUTE_ASSESSMENT_EVIDENCE = new Map<string, Map<string, string[]>>([
  ['924e1187-a067-5eb6-8d8d-85525ee6c837', new Map([
    ['baa2bf3c-798a-5ec3-a667-031bf062d96c', ['Kupfer, Aluminium, Glas und Kunststoff', 'Leiter und Nichtleiter']],
    ['66256e22-44a3-5939-8862-821e29d6711d', ['mindestens fünf U-I-Wertepaare', 'zeichnen und interpretieren Sie die Kennlinie']],
    ['af7855a3-6aea-5e05-8505-248bc9a8c219', ['Material, Leiterlänge und Querschnitt']],
    ['8f833b36-4126-52db-b210-79fb0023c7d9', ['Zwei gleiche Widerstände liegen zunächst in Reihe', 'parallele Zweige', 'Grenzfall']],
  ])],
  ['119cb138-b0c4-559d-8f1a-a4ae42db0656', new Map([
    ['dc7dd287-6eac-574d-818d-65cfb23a2d94', ['Richtung, in die sich Elektronen verschieben', 'keine elektrische Ladung erzeugt oder vernichtet', 'was bei einer leitenden Verbindung zwischen den entgegengesetzt geladenen Teilen geschieht']],
    ['80dd0a2b-1422-5b00-89ff-ec4d0faa047e', ['zwei voneinander isolierte Leiter mit getrennten entgegengesetzten Ladungen', 'für Stellung 2 die Ladungsvorzeichen beider Platten']],
  ])],
  ['1ee79cae-a7da-53cb-86ff-872e8403f033', new Map([
    ['f778a659-1467-4aa7-97b2-bed78c530634', ['Nordpol gegenüber einem Nordpol', 'Modell der Elementarmagnete']],
    ['a5f652cc-e091-4c90-bec2-c357ae54fcf1', ['Licht-, Wärme-, magnetischen und chemischen Wirkung', 'was nach dem Ausschalten']],
  ])],
  ['5a530302-1303-517f-82cc-9cd457b792a8', new Map([
    ['66256e22-44a3-5939-8862-821e29d6711d', ['mindestens fünf U-I-Wertepaare', 'zeichnen und interpretieren Sie die Kennlinie']],
    ['8f833b36-4126-52db-b210-79fb0023c7d9', ['hinzugefügt, entfernt oder stark vergrößert', 'Grenzfall eines nahezu offenen Zweigs']],
  ])],
  ['5f3bbce4-b0b9-5997-8c41-f58b2a8a8fa6', new Map([
    ['8a84de16-2fde-58ec-827a-f803e2ce8564', ['2,5 A = 1,5 A + I_L', 'an keinem Knoten Ladung ansammelt']],
    ['267170bd-f880-56a7-9719-ffb9751872c5', ['+12 V − 2 V − U_F = 0', 'Energie pro Ladung']],
  ])],
  ['68061652-d617-5e51-8d2a-1c686c3c49df', new Map([
    ['2eecd0e2-a7ca-4568-9b12-3d47706c65fb', ['mit Impulserhaltung die Geschwindigkeit', 'kinetischen Energien vor und nach dem Stoß']],
    ['e790de73-f8e5-4027-bc05-9f12a0e8c9cb', ['Bestimmen Sie den Kraftstoß', 'Impulsänderung']],
    ['32b896b9-f2f1-4d4e-96ad-e869ac3d3759', ['Newtons erstem Axiom', 'keine resultierende Kraft nötig']],
  ])],
  ['dfd2628f-b44e-51b3-86e8-99158861be8c', new Map([
    ['89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2', ['Videoauswertung', 'beide Teilbewegungen getrennt', 'Form der x-y-Bahn']],
    ['4a2bf015-052b-4af0-aed7-324259fa1a8a', ['Reaktionsweg', 'Anhalteweg', 'Sicherheitsabstand']],
  ])],
  ['b8c3dfb7-9286-52ac-8b0f-ad0a0ce941ed', new Map([
    ['b3f3f4f7-b5cc-40e1-b57a-3d93649baa61', ['Kennzeichnen Sie Quarks und Leptonen', 'Quarkzusammensetzung']],
    ['a12fddce-0215-58d9-bd91-21be8a960d25', ['separat gemessene Aktivität der Mutterkerne', 'Aktivität bereits entstandener Tochterkerne', 'Zerfallsfolge']],
  ])],
  ['a77e53d5-246d-52df-86a2-d14f7a08fb77', new Map([
    ['49872cc0-401f-5464-9235-4763df4db5cf', ['für Spaltung und Fusion', 'kontrollierte Reaktion', 'Kettenreaktion']],
    ['7e719cc2-0866-5267-a252-e7e7ac0d03f1', ['physikalische Bewertungskriterien', 'Kennzeichnen Sie mindestens zwei Unsicherheiten']],
  ])],
  ['e1794352-ceee-5c27-8be4-224592ddbb89', new Map([
    ['37b33812-d428-5953-852e-57a53a4347fe', ['absoluten Temperaturen', 'mittlere kinetische Energie', 'Teilchenebene']],
  ])],
  ['b637582c-a618-5698-817a-8d7bd1fa05f6', new Map([
    ['0da13365-02c2-44f1-8a81-d524ca0ac3ae', ['gemeinsame Geschwindigkeit aus der Impulserhaltung', 'kinetischen Energien vor und nach dem Stoß', 'Umwandlungsformen']],
  ])],
  ['b7e366e2-8323-5171-83a1-1f536c2062d8', new Map([
    ['12260012-cf04-5409-b57d-f5b3a46d9126', ['0, 1,8, 3,0, 3,8, 4,3 und 4,5 m/s', 'Gewichtskraft, Luftwiderstand und resultierende Kraft', 'Grenzgeschwindigkeit']],
  ])],
  ['b1808b4c-5e02-5e1f-831f-47ee126e00ee', new Map([
    ['accb1d9e-cd48-5983-bcef-9b9bca4a9114', ['Zentripetalbeschleunigung und Zentripetalkraft', 'größte im Modell sichere Geschwindigkeit']],
  ])],
  ['ac6c578c-401b-5e4b-801a-6dff8fe8b93a', new Map([
    ['eb0ffdea-c12d-56df-b7e8-c0297d2f8aff', ['Gravitationsgesetz', 'örtliche Feldstärke', 'Masse und Gewichtskraft']],
    ['05af2893-0201-4d7f-985b-272d7b88e26e', ['Federkonstante', 'harmonischen Schwingung', 'Vergleichen Sie beide Kraftgesetze ausdrücklich']],
  ])],
  ['198bfc8c-25f7-5a02-8618-47650ce36d14', new Map([
    ['2088ccf0-48f4-51d4-be5f-67affd0fb099', ['irreversiblen beziehungsweise näherungsweise reversiblen Vorgang', 'Nutzbarkeit der Energie']],
    ['f322c268-dc16-5d50-82dd-209834f20208', ['Klimawirkung der Entscheidung', 'Modellunsicherheiten', 'bedingtes Urteil']],
  ])],
  ['1abfd5ef-1f42-5b71-8c9a-80c0a6b0322e', new Map([
    ['df010b2b-b182-5f7e-bbe4-49b72e48c27a', ['teilweise besetztes Band', 'n-Dotierung', 'p-Dotierung']],
  ])],
  ['dbe230d5-31e1-5fca-8e11-2226821952ff', new Map([
    ['fdcd5faf-f9bf-4fa9-87f4-4e22d8d3387c', ['Induktionsladegerät', 'zeitlich veränderliches Magnetfeld', 'Strom im geschlossenen Sekundärkreis', 'Ladeelektronik', 'nutzbaren beziehungsweise im Akku gespeicherten Energie']],
    ['106417ed-80db-5490-a1ee-bb4160d3f2b4', ['langer gerader Leiter', 'lange Luftspule', 'Bestimmen Sie mit']],
  ])],
  ['93cdaa49-88e8-5e26-8506-656366d9ce3c', new Map([
    ['904670af-8e4c-543e-bc9b-e6248d87a10d', ['passenden Übergang', 'Emissionsspektrum', 'Absorptionsvorgang']],
    ['a359c859-eee0-40ef-a9d1-88db2e6c55b2', ['Einzelphotonen-Doppelspalt', 'Elektronen zeigen', 'Wellen- und Teilchenaspekte']],
    ['d2860d7f-32ff-5d74-b2f8-b7bfc8d75aec', ['Energie in Joule, Frequenz, Wellenlänge und Impuls', 'E = hf', 'p = h/λ']],
  ])],
  ['8ff2a728-fba3-538e-83e9-69bdd8e1369e', new Map([
    ['1730c01d-8c85-57df-b031-c11e2a0511b1', ['Arbeit, die das elektrische Feld', 'U = W/q', 'U = E·d']],
    ['bbee4c52-4e95-5529-990f-706aa99316a3', ['Bestimmen Sie die Stromstärke', 'Coulomb pro Sekunde']],
  ])],
  ['367b17f8-972a-5f3e-8915-8cfe743132a3', new Map([
    ['d67502e3-5e0a-595b-a24b-65b1c40de36e', ['Ablauf von Kalibrierung, Koordinatenwahl und punktweiser Markierung', 't-s-Diagramm', 'mittleren Geschwindigkeiten']],
    ['72effc66-87f4-5f5e-8d36-1547677365fb', ['zufällige beziehungsweise systematische Abweichung', 'Gegenmaßnahme']],
  ])],
  ['654ec964-d982-593d-8c26-407a381675a6', new Map([
    ['58fc7852-722c-5a67-be6a-bfd1be0b527e', ['Bedingungen für Totalreflexion', 'optisch dünnerer Mantel', 'Grenzwinkel']],
  ])],
  ['88f27aab-8724-5a4d-8543-e49ebcb54b8e', new Map([
    ['d36727cc-ce42-51a3-9425-41afb0b9acdd', ['Basis, Kollektor und Emitter', 'Steuer- und Lastkreis', 'Transistor als Schalter']],
  ])],
  ['8f62ab5e-20fc-562f-8121-63c082313e6e', new Map([
    ['41d35667-0296-5f84-bc12-202ffc440be0', ['Zeichnen Sie beide Kräfte', 'Konstruieren Sie die Resultierende', 'Betrag und Richtung']],
  ])],
  ['0cf2a5b0-8660-578d-8316-2b8a50fbdff7', new Map([
    ['7eeff2de-6015-49a6-a96e-a488d886dc9f', ['Materialwagen mit Rettungsausrüstung', 'kinetische Energie', 'Abhängigkeit von Masse und Geschwindigkeit']],
    ['6affc2ea-ecd2-4fcd-8877-3ffa15b0425b', ['potenziellen Energie', 'Bezugshöhe']],
    ['327302e3-5b36-46f8-9c16-73f24583b0eb', ['Zugkraft und den Zugweg', 'warum die kleinere Kraft keine Arbeit einspart']],
  ])],
  ['ca13e9cd-6377-540e-88c8-0308cddc8a7e', new Map([
    ['50877233-7abf-54df-b347-6d3224678fc9', ['Kernspaltung beziehungsweise Kernfusion', 'Kernkraftwerk', 'Inneren eines Sterns']],
  ])],
  ['a3c513d0-8fb9-5bd5-88cc-041527ff097d', new Map([
    ['28237994-9c24-5a06-82fe-be1f494768ba', ['Amperemeter in Reihe und Voltmeter parallel', 'messen Sie Stromstärke und Spannung']],
    ['f1a078ae-6262-4444-a4bc-a5ab275621cf', ['Amperemeter wurde versehentlich parallel geschaltet', 'fachgerechte Korrektur']],
  ])],
  ['de7528cc-8c5d-5cd6-8d08-f8ce7457e666', new Map([
    ['4a42cddd-7827-5204-87e5-8d9eac7792f1', ['Gleich- und Wechselspannung', 'Funktion des Ladegeräts']],
    ['27b90ce9-b650-5232-85fb-ce2cb69d59a3', ['Angaben V, W und Ah']],
    ['267170bd-f880-56a7-9719-ffb9751872c5', ['beiden Maschen', 'vorzeichenrichtige Spannungsbilanz', 'Energie pro Ladung']],
    ['8a84de16-2fde-58ec-827a-f803e2ce8564', ['Verzweigungsknoten', 'Lüfterstrom', 'Knotenregel mit Ladungserhaltung']],
  ])],
  ['eb5e147f-a67c-542e-858b-533a00af7af2', new Map([
    ['5ddba212-9e0a-5dd4-8274-239ec51ab6a8', ['Isolierung, Schutzleiter, Sicherung und Fehlerstrom-Schutzeinrichtung']],
    ['c156d2fb-0fe9-5f13-8baa-3e74d7da151e', ['Gewitterorte', 'Seitenblitz, Schrittspannung']],
  ])],
  ['0b090935-1e43-581b-84ec-078741f8969e', new Map([
    ['fbe0faae-7fba-482b-888e-341f926770f3', ['Wärmeleitung, Konvektion und Wärmestrahlung', 'Stofftransport beziehungsweise elektromagnetischer Übertragung']],
    ['eeba6bf8-a2b9-4d7d-a1d6-67286c923cef', ['Kammer als System', 'gespeicherte innere Energie und mechanische Arbeit', 'qualitative Energiebilanz']],
    ['5a3716dd-ec67-5c48-ba3d-1a29f05ba2ce', ['natürlichen Treibhauseffekt', 'anthropogenen Anteil', 'Treibhausgaskonzentration']],
  ])],
  ['7cb0e5a0-c4ef-5e24-82b6-d8f85ffded8d', new Map([
    ['30a936ec-e427-57fe-bf3e-4abd64b1f0c1', ['Kette von Energieträger beziehungsweise Primärenergie', 'Übertragung und Nutzung', 'Energieabgaben an die Umgebung']],
    ['5be98160-5189-58aa-8183-1df1c400cc8c', ['10–18 ct/kWh', '13–24 ct/kWh', 'abgewogenes Urteil', 'Klimawirkungen']],
  ])],
  ['2c195204-2e21-5369-8782-7bf4fc41bf9f', new Map([
    ['a4681378-ade4-4f20-bf77-fb020469510f', ['räumliche Spektralzerlegung', 'annähernd weißen Gesamteindruck', 'zeitliche Integration']],
    ['cdab9fd1-5054-4a7e-8c9a-4474062ddd23', ['Lichtüberlagerung additiv', 'Filtermischung aber subtraktiv']],
    ['9a9e2085-5ab6-534f-b622-83774d51f36b', ['breiter Lichtkegel sichtbar', 'Stoff erwärmt sich messbar', 'geringere Transmission allein', 'nebeneinander auftreten können']],
  ])],
  ['44985d9f-7b49-52e4-86ec-eddc7b70429f', new Map([
    ['6a4c6042-052b-502b-a39a-0ed8941247ac', ['Wasser-Luft-Grenze', 'Brechung sowie optische Hebung']],
    ['078ce4d2-3193-4cd0-ae59-4fb8ab16e9e5', ['mit Hauptstrahlen das reelle Bild', 'Zerstreuungswirkung der Konkavlinse']],
    ['e5bc2227-d900-585f-8ac0-9d3f1cb40e27', ['welche Fragen das Strahlenmodell', 'welche Annahmen es idealisiert', 'Teilchenmodell aus einem anderen Physikbereich']],
  ])],
  ['35dd0a33-e5d5-53b9-8438-3d339173db1b', new Map([
    ['1ab5f599-0927-579d-94cc-feecdf3b5603', ['Pfeilspitze und Pfeilfuß', 'geradlinigen Lichtweg', 'kleineres Loch Helligkeit und Schärfe']],
    ['90e1e6cf-4092-41d6-81f7-5206f9d68f84', ['Hornhaut, Linse und Netzhaut', 'Kurz- und Weitsichtigkeit', 'Zerstreuungs- beziehungsweise Sammellinse']],
  ])],
  ['00e2ddfe-18c1-57a4-86ad-ee467a1a3d61', new Map([
    ['c1006f55-0406-48cc-92d4-0d8345897cf4', ['Lautsprecher als Schallquelle', 'Mikrofon und Ohr als Empfänger']],
    ['10aad90e-a1db-42b6-8d1e-1d856e14b47d', ['Ton beziehungsweise Geräusch', 'Tonhöhe und Lautstärke', 'Frequenz und Amplitude']],
    ['a24c41ce-68c5-56a7-8235-ef9a7dba7042', ['drei Schallgeschwindigkeiten', 'elastischer Kopplung und Trägheit', 'Aggregatzustand allein']],
    ['2a6ad2c6-3e1b-57a9-82a1-e6620a532f5c', ['Weg des Schalls durch Außenohr, Mittelohr und Innenohr', 'Umwandlung der mechanischen Anregung in Nervensignale']],
    ['da0837c7-95a7-5a6a-81db-f33cb7f42d85', ['94 dB über 60 min', 'zwei konkrete Schutzmaßnahmen']],
  ])],
  ['3f477f0d-4f79-5eed-8671-fb2667d60910', new Map([
    ['6367d45e-919e-4c19-bcd9-7770a2d51139', ['Objektiv, Okular, optische Achse', 'reelle umgekehrte Zwischenbild', 'Grenzen des vereinfachten Strahlenmodells']],
  ])],
  ['0acb10a3-c5e2-5a76-8907-3dfe1b57e767', new Map([
    ['e62e48bc-2387-4b2b-8d6f-7a06c8e7580e', ['freie Saitenlänge', 'Lautstärke', 'unterschiedlich geformte periodische Signale', 'Resonanzkörper']],
  ])],
  ['bb7c5191-3c35-5ba6-85e0-795c7a049744', new Map([
    ['cc9eea77-2a7f-4f35-ac22-6c230c0d6fa5', ['Displayfarben mit additiver Farbmischung', 'Cyan- und Gelbtinte', 'subtraktive Farbmischung']],
    ['1c8dd14c-0fbf-44a5-85a3-25c8e3bd0075', ['Farbeindrücke der drei Kartenfelder', 'Beleuchtung', 'ins Auge gelangt']],
  ])],
  ['d304cfd0-f87c-51f7-8dee-f5f405da4b3d', new Map([
    ['af0e2efb-f634-5f2d-abea-b2e1a67a2894', ['geeignete Waage', 'Nullpunkt', 'beide Massen']],
    ['f827b00f-af7f-52de-84aa-2a2bbaa035bd', ['Länge, Breite und Höhe', 'sein Volumen', 'Größenordnung']],
    ['f92b5b8a-327f-50d2-8313-6a142399ebf0', ['Flüssigkeitsständen vor und nach', 'Meniskus', 'Luftblasen']],
    ['c2d6bdf1-8077-50fb-a8b5-2f0b7e3493f0', ['für beide Körper die Dichte', 'Dichtetabelle', 'Bei gleicher Masse']],
  ])],
  ['e1d3c599-6964-5094-83ee-7fb1ecd161ce', new Map([
    ['e11b2ee9-e528-4857-9ecd-59bd460fba81', ['Auftriebskraft', 'Gewichtskraft des verdrängten Wassers', 'Bedingung für Schweben', 'Gewichtskraft der verdrängten Luft', 'archimedische Prinzip auch in Luft']],
  ])],
  ['840a82e3-44aa-5d0f-8b6f-8a067d057d14', new Map([
    ['24b4686a-e8a6-4583-8952-33e6f653c2a3', ['Auftriebs- und Widerstandskraft', 'drei Messungen', 'energiesparenden Gleitflug']],
  ])],
  ['7072dfbc-f684-5d4e-8c9a-ee74f7ebeeba', new Map([
    ['581c0766-b84b-54cb-b8b6-375310329a41', ['Haftreibung', 'Gleitreibung', 'beim Gehen', 'auf Eis']],
  ])],
  ['d15764ce-ebea-5178-84ea-9351dd808b8c', new Map([
    ['327302e3-5b36-46f8-9c16-73f24583b0eb', ['vier tragenden Seilabschnitten', 'Zugkraft und den Zugweg', 'Hebelgesetz', 'kleinere Kraft keine mechanische Arbeit einspart']],
  ])],
  ['449d9732-a869-5126-8879-564da5c3d263', new Map([
    ['67ffd0f0-a5ab-518f-8c45-4c0e7eb18390', ['Angriffspunkt und Wirkungslinie', 'Schwerpunkt', 'resultierende Drehrichtung', 'Position, an die die einzelne Stütze für Gleichgewicht']],
  ])],
])

const EXPECTED_JURISDICTIONS = [
  'DE-BB', 'DE-BE', 'DE-BW', 'DE-BY', 'DE-HB', 'DE-HE', 'DE-HH', 'DE-MV',
  'DE-NI', 'DE-NW', 'DE-RP', 'DE-SH', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH',
] as const

const EXPECTED_COUNTS: SemanticKindLedger['counts'] = {
  curricularAtomic: 464,
  curricularArea: 101,
  practiceAssessment: 133,
  programStructure: 1,
  memory: 5,
  runtimeSupport: 4,
  orientation: 2,
  total: 710,
}
const EXPECTED_PHYSICS_SEKI_PROJECTED_ROUTE_TARGET_OCCURRENCES = 6308
const EXPECTED_PHYSICS_SEKI_PROFILE_SELECTED_TARGET_OCCURRENCES = 6136
const EXPECTED_PHYSICS_SEKI_PROFILE_SELECTOR_EXCLUDED_OCCURRENCES = 172
const EXPECTED_PHYSICS_SEKI_PROFILE_SELECTOR_EXCLUDED_UNIQUE_GOALS = 57

const EXPECTED_DURATION_DECISIONS = new Map<string, {
  stage: 'SekI' | 'SekI+SekII'
  decision: 'single-duration-source' | 'duration-neutral-projection'
  durationModels: Array<'G8' | 'G9'>
}>([
  ['DE-BB', { stage: 'SekI+SekII', decision: 'single-duration-source', durationModels: ['G8'] }],
  ['DE-BE', { stage: 'SekI+SekII', decision: 'single-duration-source', durationModels: ['G8'] }],
  ['DE-BW', { stage: 'SekI', decision: 'duration-neutral-projection', durationModels: ['G8', 'G9'] }],
  ['DE-BY', { stage: 'SekI+SekII', decision: 'single-duration-source', durationModels: ['G9'] }],
  ['DE-HB', { stage: 'SekI', decision: 'single-duration-source', durationModels: ['G8'] }],
  ['DE-HE', { stage: 'SekI', decision: 'single-duration-source', durationModels: ['G9'] }],
  ['DE-HH', { stage: 'SekI', decision: 'single-duration-source', durationModels: ['G8'] }],
  ['DE-MV', { stage: 'SekI', decision: 'single-duration-source', durationModels: ['G8'] }],
  ['DE-NI', { stage: 'SekI+SekII', decision: 'single-duration-source', durationModels: ['G9'] }],
  ['DE-NW', { stage: 'SekI+SekII', decision: 'duration-neutral-projection', durationModels: ['G8', 'G9'] }],
  ['DE-RP', { stage: 'SekI+SekII', decision: 'duration-neutral-projection', durationModels: ['G8', 'G9'] }],
  ['DE-SH', { stage: 'SekI+SekII', decision: 'duration-neutral-projection', durationModels: ['G8', 'G9'] }],
  ['DE-SL', { stage: 'SekI', decision: 'single-duration-source', durationModels: ['G9'] }],
  ['DE-SN', { stage: 'SekI', decision: 'single-duration-source', durationModels: ['G8'] }],
  ['DE-ST', { stage: 'SekI', decision: 'single-duration-source', durationModels: ['G8'] }],
  ['DE-TH', { stage: 'SekI', decision: 'single-duration-source', durationModels: ['G8'] }],
])

const EXPECTED_SHARED_PHYSICS_JURISDICTIONS = [
  'DE-BW', 'DE-BY', 'DE-HB', 'DE-HE', 'DE-HH',
  'DE-MV', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH',
] as const

const readJson = <T>(repositoryPath: string): T => (
  JSON.parse(readFileSync(resolve(repoRoot, repositoryPath), 'utf8')) as T
)

const readJsonLines = <T>(repositoryPath: string): T[] => (
  readFileSync(resolve(repoRoot, repositoryPath), 'utf8')
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T)
)

const compareCodePoints = (left: string, right: string): number => {
  const leftPoints = Array.from(left, (value) => value.codePointAt(0) ?? 0)
  const rightPoints = Array.from(right, (value) => value.codePointAt(0) ?? 0)
  const length = Math.min(leftPoints.length, rightPoints.length)
  for (let index = 0; index < length; index += 1) {
    if (leftPoints[index] !== rightPoints[index]) return leftPoints[index] - rightPoints[index]
  }
  return leftPoints.length - rightPoints.length
}

const canonicalJson = (value: unknown): string => {
  if (value === null) return 'null'
  if (typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'number') {
    assert(Number.isFinite(value), 'canonical JSON rejects non-finite numbers')
    return JSON.stringify(Object.is(value, -0) ? 0 : value)
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  assert.equal(typeof value, 'object', 'canonical JSON received an unsupported value')
  assert(value, 'canonical JSON received undefined')
  const members = Object.keys(value as Record<string, unknown>)
    .sort(compareCodePoints)
    .map((key) => `${JSON.stringify(key)}:${canonicalJson((value as Record<string, unknown>)[key])}`)
  return `{${members.join(',')}}`
}

const sha256 = (value: string): string => createHash('sha256').update(value, 'utf8').digest('hex')

const sourceFingerprint = (
  goal: Record<string, unknown>,
  contract: SourceFingerprintContract,
): string => {
  const fields = contract.pointers.map((pointer) => {
    assert.match(pointer, /^\/[A-Za-z]+$/u, `unsupported source-fingerprint pointer ${pointer}`)
    const key = pointer.slice(1)
    if (!Object.prototype.hasOwnProperty.call(goal, key)) return { path: pointer, state: 'missing' }
    let value = structuredClone(goal[key])
    if (pointer === '/tags') {
      assert(Array.isArray(value) && value.every((entry) => typeof entry === 'string'), `invalid tags on ${String(goal.id)}`)
      assert.equal(new Set(value).size, value.length, `duplicate tags on ${String(goal.id)}`)
      value = [...value].sort(compareCodePoints)
    }
    return { path: pointer, state: 'value', value }
  })
  return `sha256:${sha256(canonicalJson({ domain: contract.domain, fields }))}`
}

const normalizeAtomicityText = (value: unknown): string => String(value ?? '')
  .normalize('NFKC')
  .replace(/\s+/gu, ' ')
  .trim()

const stableAtomicityJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableAtomicityJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableAtomicityJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

const atomicityFingerprint = (goal: CanonicalAuthoringGoal, ruleVersion: string): string => {
  const dimensionTags = goal.dimensionTags as Record<string, unknown> | undefined
  const payload = {
    ruleVersion,
    goalId: goal.id,
    shortKey: goal.shortKey ?? '',
    title: normalizeAtomicityText(goal.title),
    titleEn: normalizeAtomicityText(goal.titleEn),
    description: normalizeAtomicityText(goal.description),
    descriptionEn: normalizeAtomicityText(goal.descriptionEn),
    phase: normalizeAtomicityText(dimensionTags?.phase),
    area: normalizeAtomicityText(dimensionTags?.area),
    topicCode: normalizeAtomicityText(dimensionTags?.topicCode),
    nodeKind: normalizeAtomicityText(goal.nodeKind),
  }
  return `sha256:${sha256(stableAtomicityJson(payload))}`
}

const explicitClassification = (
  goal: CanonicalAuthoringGoal,
  reviewedAtomicGoalIds: ReadonlySet<string>,
  goalsById: ReadonlyMap<string, CanonicalAuthoringGoal>,
  parentIdsByChild: ReadonlyMap<string, string[]>,
): Pick<SemanticKindDecision, 'semanticKind' | 'decisionBasis'> => {
  if (reviewedAtomicGoalIds.has(goal.id)) {
    return {
      semanticKind: 'curricularAtomic',
      decisionBasis: STRUCTURAL_SPLIT_ATOMIC_GOAL_IDS.has(goal.id)
        ? 'reviewed-current-structural-split-curricular-atomic'
        : BILINGUAL_COMPLETENESS_RECHECK_GOAL_IDS.has(goal.id)
          ? 'reviewed-current-semantic-recheck-curricular-atomic'
          : 'reviewed-current-pilot-curricular-atomic',
    }
  }
  if (
    goal.type === 'cluster'
    && goal.contains.length > 0
  ) {
    if (goal.tags?.includes('root')) {
      return {
        semanticKind: 'programStructure',
        decisionBasis: 'reviewed-current-pilot-program-structure',
      }
    }
    if ((goal.release as { kind?: string } | undefined)?.kind === 'offer') {
      return {
        semanticKind: 'practiceAssessment',
        decisionBasis: 'reviewed-current-pilot-practice-assessment',
      }
    }
    const parentGoals = (parentIdsByChild.get(goal.id) ?? [])
      .map((goalId) => goalsById.get(goalId))
    if (parentGoals.some((parent) => (
      (parent?.release as { kind?: string } | undefined)?.kind === 'offer'
    ))) {
      return {
        semanticKind: 'runtimeSupport',
        decisionBasis: 'reviewed-current-pilot-runtime-support',
      }
    }
    if (goal.contains.every((goalId) => goalsById.get(goalId)?.examData !== undefined)) {
      return {
        semanticKind: 'practiceAssessment',
        decisionBasis: 'reviewed-current-pilot-practice-assessment',
      }
    }
    return {
      semanticKind: 'curricularArea',
      decisionBasis: STRUCTURAL_SPLIT_CLUSTER_GOAL_IDS.has(goal.id)
        ? 'reviewed-current-structural-split-curricular-area'
        : 'reviewed-current-pilot-curricular-area',
    }
  }
  if (
    goal.type === 'atomic'
    && goal.contains.length === 0
    && goal.examData !== undefined
    && goal.nodeKind === undefined
  ) {
    return {
      semanticKind: 'practiceAssessment',
      decisionBasis: POST_SPLIT_PRACTICE_ASSESSMENT_GOAL_IDS.has(goal.id)
        ? 'reviewed-current-post-split-practice-assessment'
        : 'reviewed-current-pilot-practice-assessment',
    }
  }
  if (
    goal.type === 'atomic'
    && goal.contains.length === 0
    && goal.examData === undefined
    && goal.nodeKind === 'memory'
  ) {
    return {
      semanticKind: 'memory',
      decisionBasis: 'reviewed-current-pilot-memory',
    }
  }
  if (
    goal.type === 'atomic'
    && goal.contains.length === 0
    && goal.examData === undefined
    && goal.nodeKind === undefined
    && goal.tags?.includes('Motivation')
    && goal.tags.includes('Orientation')
  ) {
    return {
      semanticKind: 'orientation',
      decisionBasis: 'reviewed-current-pilot-orientation',
    }
  }
  assert.fail(`goal ${goal.id} has no explicit authoritative Physics semantic-kind basis`)
}

const collectAtomicGoalIds = (
  nodes: CompiledCompositionPreviewNode[],
  goalById: ReadonlyMap<string, CanonicalAuthoringGoal>,
): Set<string> => {
  const result = new Set<string>()
  const visit = (node: CompiledCompositionPreviewNode) => {
    if (node.kind === 'goal' && node.sourceGoalId) {
      const goal = goalById.get(node.sourceGoalId)
      assert(goal, `compiled view references unknown goal ${node.sourceGoalId}`)
      if (resolveCanonicalNodeType(goal) === 'atomic') result.add(goal.id)
    }
    node.children.forEach(visit)
  }
  nodes.forEach(visit)
  return result
}

const collectVisibleGoalIds = (nodes: CompiledCompositionPreviewNode[]): Set<string> => {
  const result = new Set<string>()
  const visit = (node: CompiledCompositionPreviewNode) => {
    if (node.kind === 'goal' && node.sourceGoalId) result.add(node.sourceGoalId)
    node.children.forEach(visit)
  }
  nodes.forEach(visit)
  return result
}

interface AuthoredPrerequisiteRoot {
  goalId: string
  kind: 'goalEntry' | 'canonicalSubtree'
}

const collectAuthoredPrerequisiteRoots = (
  nodes: CompositionViewNode[],
): AuthoredPrerequisiteRoot[] => {
  const result: AuthoredPrerequisiteRoot[] = []
  const visit = (node: CompositionViewNode) => {
    if (node.kind === 'structure') {
      node.children.forEach(visit)
      return
    }
    if (node.kind === 'landscapeEntry') return
    if (node.projectionRole === 'prerequisiteOnly') {
      result.push({ goalId: node.goalId, kind: node.kind })
    }
  }
  nodes.forEach(visit)
  return result
}

const collectCompositionStructures = (
  nodes: CompositionViewNode[],
  structureId: string,
  matches: Extract<CompositionViewNode, { kind: 'structure' }>[] = [],
): Extract<CompositionViewNode, { kind: 'structure' }>[] => {
  nodes.forEach((node) => {
    if (node.kind !== 'structure') return
    if (node.id === structureId) matches.push(node)
    collectCompositionStructures(node.children, structureId, matches)
  })
  return matches
}

const collectAuthoredProjectionGoalIds = (
  nodes: CompositionViewNode[],
  goalsById: ReadonlyMap<string, CanonicalAuthoringGoal>,
): Set<string> => {
  const result = new Set<string>()
  const addCanonicalSubtree = (rootGoalId: string) => {
    const stack = [rootGoalId]
    while (stack.length > 0) {
      const goalId = stack.pop()
      if (!goalId || result.has(goalId)) continue
      const goal = goalsById.get(goalId)
      assert(goal, `authored projection references unknown goal ${goalId}`)
      result.add(goalId)
      goal.contains.map(normalizeGoalRef).forEach((childId) => stack.push(childId))
    }
  }
  const visit = (node: CompositionViewNode) => {
    if (node.kind === 'structure') {
      node.children.forEach(visit)
      return
    }
    if (node.kind === 'landscapeEntry') return
    if (node.kind === 'canonicalSubtree') addCanonicalSubtree(normalizeGoalRef(node.goalId))
    else result.add(normalizeGoalRef(node.goalId))
  }
  nodes.forEach(visit)
  return result
}

const rawLandscape = readJson<Record<string, unknown> & { goals: Array<Record<string, unknown>> }>(LANDSCAPE_PATH)
const landscape = normalizeCanonicalLandscape(rawLandscape)
assert.equal(landscape.landscapeId, LANDSCAPE_ID)
assert.equal(rawLandscape.subject, 'Physik')
assert.equal(landscape.goals.length, EXPECTED_COUNTS.total)
const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
const parentIdsByChild = new Map<string, string[]>()
landscape.goals.forEach((goal) => goal.contains.forEach((childId) => {
  const parents = parentIdsByChild.get(childId) ?? []
  parents.push(goal.id)
  parentIdsByChild.set(childId, parents)
}))
const rawGoalById = new Map(rawLandscape.goals.map((goal) => [String(goal.id), goal]))
assert.equal(goalById.size, EXPECTED_COUNTS.total, 'canonical Physics goal IDs must be unique')
const bavariaMotorTransformerAssessment = rawGoalById.get(BAVARIA_MOTOR_TRANSFORMER_ASSESSMENT_ID)
assert(bavariaMotorTransformerAssessment, 'Bavaria motor/transformer assessment is missing')
assert.deepEqual(
  bavariaMotorTransformerAssessment.requires,
  (bavariaMotorTransformerAssessment.examData as { coveredGoalIds?: unknown })?.coveredGoalIds,
  'Bavaria motor/transformer assessment requires must exactly match coveredGoalIds',
)

CQR104_ROUTE_ASSESSMENT_EVIDENCE.forEach((evidenceByGoalId, assessmentId) => {
  const assessment = rawGoalById.get(assessmentId)
  assert(assessment, `CQR-104 route assessment ${assessmentId} is missing`)
  const examData = assessment.examData as {
    coveredGoalIds?: unknown
    taskContent?: unknown
  } | undefined
  assert.deepEqual(
    assessment.requires,
    examData?.coveredGoalIds,
    `CQR-104 route assessment ${assessmentId} requires must exactly match coveredGoalIds`,
  )
  const extendedData = assessment.extendedData as Record<string, unknown> | undefined
  assert.equal(
    extendedData?.applicabilityFromRequires,
    true,
    `CQR-104 route assessment ${assessmentId} must derive applicability from its exact requires`,
  )
  assert.equal(
    extendedData?.applicabilityOverrides,
    undefined,
    `CQR-104 route assessment ${assessmentId} must not carry a jurisdiction override`,
  )
  assert.deepEqual(
    [...evidenceByGoalId.keys()].sort(compareCodePoints),
    [...((examData?.coveredGoalIds ?? []) as string[])].sort(compareCodePoints),
    `CQR-104 route assessment ${assessmentId} needs an explicit task-content evidence binding for every covered goal`,
  )
  const taskContent = String(examData?.taskContent ?? '')
  evidenceByGoalId.forEach((evidenceSnippets, coveredGoalId) => {
    evidenceSnippets.forEach((snippet) => {
      assert(
        taskContent.includes(snippet),
        `CQR-104 route assessment ${assessmentId} does not visibly assess ${coveredGoalId}; missing task evidence: ${snippet}`,
      )
    })
  })
})

const bwElectricalEnergyAssessment = rawGoalById.get('4996346f-ab5d-4d09-9b9e-b9e559af153d')
assert(bwElectricalEnergyAssessment, 'BW electrical-energy assessment is missing')
assert.deepEqual(
  bwElectricalEnergyAssessment.requires,
  (bwElectricalEnergyAssessment.examData as { coveredGoalIds?: unknown })?.coveredGoalIds,
  'BW electrical-energy assessment requires must exactly match coveredGoalIds',
)
assert.deepEqual(
  bwElectricalEnergyAssessment.applicability,
  { jurisdiction: ['DE-BW'] },
  'BW electrical-energy assessment must stay explicitly BW-only',
)
assert.deepEqual(
  bwElectricalEnergyAssessment.extendedData,
  {
    applicabilityMappingInheritance: 'boundary',
    applicabilityOverrides: { jurisdiction: ['DE-BW'] },
  },
  'BW electrical-energy assessment must retain its reviewed boundary override',
)
const bwElectricalEnergyTask = String(
  (bwElectricalEnergyAssessment.examData as { taskContent?: unknown })?.taskContent ?? '',
)
for (const snippet of [
  'Energieumwandlungskette',
  'nutzbare und unerwünschte Energieübertragungen',
  'unter gleichen Bedingungen energetisch geeigneter',
]) {
  assert(
    bwElectricalEnergyTask.includes(snippet),
    `BW electrical-energy assessment lacks task evidence: ${snippet}`,
  )
}

const genericSekIAssessment = rawGoalById.get(GENERIC_SEKI_ASSESSMENT_ID)
assert(genericSekIAssessment, 'generic Sek-I assessment is missing')
assert.equal(
  (genericSekIAssessment.extendedData as { applicabilityProjection?: unknown })?.applicabilityProjection,
  'excluded',
  'legacy aggregate Sek-I assessment must be excluded from applicability projection',
)
const genericSekIExtendedData = genericSekIAssessment.extendedData as {
  compatibilityOnly?: unknown
  applicabilityMappingInheritance?: unknown
  applicabilityOverrides?: unknown
}
assert.equal(
  genericSekIExtendedData.compatibilityOnly,
  true,
  'legacy aggregate Sek-I assessment must remain explicitly classified as compatibility-only',
)
assert.equal(
  genericSekIAssessment.applicability,
  undefined,
  'excluded legacy aggregate assessment must not retain compiled jurisdiction applicability',
)
assert.equal(
  genericSekIExtendedData.applicabilityMappingInheritance,
  undefined,
  'excluded legacy aggregate assessment needs no mapping-inheritance boundary',
)
assert.equal(
  genericSekIExtendedData.applicabilityOverrides,
  undefined,
  'excluded legacy aggregate assessment must not retain jurisdiction overrides',
)
const applicabilityOverrideRegistry = readJson<{
  version: number
  landscapes: Array<{
    landscapeId: string
    goalApplicabilityOverrides?: Record<string, { jurisdiction?: string[] }>
  }>
}>(APPLICABILITY_OVERRIDE_REGISTRY_PATH)
const genericSekIRegistryOverride = applicabilityOverrideRegistry.landscapes
  .find(({ landscapeId }) => landscapeId === LANDSCAPE_ID)
  ?.goalApplicabilityOverrides?.[GENERIC_SEKI_ASSESSMENT_ID]
assert.equal(
  genericSekIRegistryOverride,
  undefined,
  'excluded legacy aggregate assessment must not retain an external applicability override',
)
const physicsApplicabilityReport = buildApplicabilityCompilation().reports.find(
  ({ landscapeId }) => landscapeId === LANDSCAPE_ID,
)
assert(physicsApplicabilityReport, 'applicability compiler lacks canonical Physics report')
assert.equal(
  physicsApplicabilityReport.summary.errors,
  0,
  'Physics applicability compilation must not lose evidence for any goal',
)
const compiledGenericSekIApplicability = physicsApplicabilityReport.goals.find(
  ({ goalId }) => goalId === GENERIC_SEKI_ASSESSMENT_ID,
)
assert(compiledGenericSekIApplicability, 'applicability compiler lacks generic compatibility endpoint')
assert.deepEqual(
  compiledGenericSekIApplicability.compiledApplicability,
  {},
  'excluded legacy aggregate assessment must compile to no jurisdiction',
)
assert.deepEqual(
  compiledGenericSekIApplicability.evidence,
  [],
  'excluded legacy aggregate assessment must compile without applicability evidence',
)
assert(
  (parentIdsByChild.get(GENERIC_SEKI_ASSESSMENT_ID) ?? []).length === 0,
  'excluded legacy aggregate assessment must not remain in the live practice cluster',
)

const atomicityConfig = readJson<{
  reviewId: string
  ruleVersion: string
  landscapeId: string
  landscapePath: string
  reviewPath: string
}>(ATOMICITY_CONFIG_PATH)
assert.equal(atomicityConfig.landscapeId, LANDSCAPE_ID)
assert.equal(atomicityConfig.landscapePath, LANDSCAPE_PATH)
assert.equal(atomicityConfig.reviewPath, ATOMICITY_REVIEW_PATH)
const atomicityRecords = readJsonLines<AtomicityReviewRecord>(ATOMICITY_REVIEW_PATH)
assert.equal(atomicityRecords.length, EXPECTED_COUNTS.curricularAtomic)
const reviewedAtomicGoalIds = new Set<string>()
atomicityRecords.forEach((record) => {
  assert.equal(record.schemaVersion, 1)
  assert.equal(record.reviewId, atomicityConfig.reviewId)
  assert.equal(record.ruleVersion, atomicityConfig.ruleVersion)
  assert.equal(record.landscapeId, LANDSCAPE_ID)
  assert.equal(record.status, 'atomic', `${record.goalId} is not an approved atomic goal`)
  assert.equal(record.semanticAtomic, true, `${record.goalId} is not marked semanticAtomic`)
  assert(!reviewedAtomicGoalIds.has(record.goalId), `duplicate atomicity record ${record.goalId}`)
  const goal = goalById.get(record.goalId)
  assert(goal, `obsolete atomicity record ${record.goalId}`)
  assert.equal(record.fingerprint, atomicityFingerprint(goal, record.ruleVersion), `stale atomicity record ${record.goalId}`)
  reviewedAtomicGoalIds.add(record.goalId)
})

const mathProfile = readJson<{
  semanticKindDecisions: { sourceFingerprint: SourceFingerprintContract }
}>(MATH_PROFILE_PATH)
const fingerprintContract = mathProfile.semanticKindDecisions.sourceFingerprint
assert.equal(fingerprintContract.contractId, 'semantic-kind-source-fingerprint-v1')
assert.equal(fingerprintContract.algorithm, 'sha-256-over-skillpilot-canonical-json-v1')
assert.equal(fingerprintContract.domain, 'skillpilot:semantic-kind-source-fingerprint:v1')
assert.equal(fingerprintContract.canonicalJsonProfile, 'semantic-normal-form-v1')
assert.equal(fingerprintContract.canonicalJsonProfileVersion, '1.0.0')
assert.equal(
  fingerprintContract.canonicalJsonProfileSha256,
  sha256(readFileSync(resolve(repoRoot, fingerprintContract.canonicalJsonProfilePath), 'utf8')),
)
const rawMathLandscape = readJson<Record<string, unknown> & { goals: Array<Record<string, unknown>> }>(MATH_LANDSCAPE_PATH)
const mathLandscape = normalizeCanonicalLandscape(rawMathLandscape)
const mathGoalIds = new Set(mathLandscape.goals.map(({ id }) => id))
const foreignContainsEdges: Array<{ ownerId: string; goalId: string }> = []
const foreignRequiresEdges: Array<{ ownerId: string; goalId: string }> = []
rawLandscape.goals.forEach((goal) => {
  for (const relation of ['contains', 'requires'] as const) {
    const references = Array.isArray(goal[relation]) ? goal[relation] as unknown[] : []
    references.forEach((reference) => {
      const goalId = typeof reference === 'string'
        ? reference
        : String((reference as { goalId?: unknown }).goalId ?? '')
      if (rawGoalById.has(goalId)) return
      const edge = { ownerId: String(goal.id), goalId }
      if (relation === 'contains') foreignContainsEdges.push(edge)
      else foreignRequiresEdges.push(edge)
    })
  }
})
assert.deepEqual(foreignContainsEdges, [], 'Physics canonical contains must remain subject-internal')
assert.equal(foreignRequiresEdges.length, 10, 'Physics must retain exactly ten cross-subject prerequisites')
assert.equal(
  new Set(foreignRequiresEdges.map(({ goalId }) => goalId)).size,
  8,
  'Physics cross-subject prerequisites must resolve to exactly eight mathematics goals',
)
foreignRequiresEdges.forEach(({ goalId }) => {
  assert(mathGoalIds.has(goalId), `Physics cross-subject prerequisite ${goalId} is not canonical mathematics`)
})
assert(!foreignRequiresEdges.some(({ goalId }) => goalId === '71cec9fb-3751-4d61-8b34-c5adbbf6e5f2'))
const mathFixtureGoal = rawMathLandscape.goals.find(({ id }) => id === '000b2764-c5d9-5521-b39e-fc15a4aa72e2')
assert(mathFixtureGoal, 'known mathematics source-fingerprint fixture is missing')
assert.equal(
  sourceFingerprint(mathFixtureGoal, fingerprintContract),
  'sha256:3f3ae251b2b2d66a0dc22eb0ec76584c9c3b5902a0ea9376aae5f3accc5a1d0a',
  'semantic-kind source-fingerprint implementation drifted from the reviewed mathematics fixture',
)

const ledger = readJson<SemanticKindLedger>(LEDGER_PATH)
const ledgerSchema = readJson<Record<string, unknown>>(LEDGER_SCHEMA_PATH)
const ledgerAjv = new Ajv2020({ allErrors: true, strict: true })
addFormats(ledgerAjv)
const validateLedger = ledgerAjv.compile(ledgerSchema)
assert(validateLedger(ledger), ledgerAjv.errorsText(validateLedger.errors, { separator: '; ' }))
assert.equal(ledger.documentType, 'semantic-kind-ledger')
assert.equal(ledger.ledgerFormatVersion, 1)
assert.equal(ledger.ledgerId, 'de-gymnasium-physik-semantic-kinds-v1')
assert.equal(
  ledger.profileId,
  ledger.ledgerId,
  'Physics profileId is the embedded decision-profile identity, not a phantom ontology profile',
)
assert.equal(ledger.profileVersion, '1.0.0')
assert.equal(ledger.sourceLandscapeId, LANDSCAPE_ID)
assert.equal(ledger.sourceLandscapePath, LANDSCAPE_PATH)
assert.equal(ledger.sourceFingerprintContractId, fingerprintContract.contractId)
assert.equal(ledger.reviewMethod, 'one-time-reviewed-pilot-migration-v1')
assert.deepEqual(ledger.counts, EXPECTED_COUNTS)
assert.equal(ledger.decisions.length, EXPECTED_COUNTS.total)
assert.deepEqual(
  ledger.decisions.map(({ goalId }) => goalId),
  [...ledger.decisions.map(({ goalId }) => goalId)].sort(compareCodePoints),
  'Physics semantic-kind decisions must stay sorted by goal ID',
)
const decisionByGoalId = new Map<string, SemanticKindDecision>()
const actualCounts: SemanticKindLedger['counts'] = {
  curricularAtomic: 0,
  curricularArea: 0,
  practiceAssessment: 0,
  programStructure: 0,
  memory: 0,
  runtimeSupport: 0,
  orientation: 0,
  total: 0,
}
ledger.decisions.forEach((decision) => {
  assert(!decisionByGoalId.has(decision.goalId), `duplicate semantic-kind decision ${decision.goalId}`)
  const goal = goalById.get(decision.goalId)
  const rawGoal = rawGoalById.get(decision.goalId)
  assert(goal && rawGoal, `obsolete semantic-kind decision ${decision.goalId}`)
  assert.equal(decision.decisionStatus, 'authoritative')
  assert.equal(decision.sourceFingerprint, sourceFingerprint(rawGoal, fingerprintContract), `stale source fingerprint ${decision.goalId}`)
  assert.deepEqual(
    { semanticKind: decision.semanticKind, decisionBasis: decision.decisionBasis },
    explicitClassification(goal, reviewedAtomicGoalIds, goalById, parentIdsByChild),
    `semantic-kind decision lacks its explicit reviewed Physics basis for ${decision.goalId}`,
  )
  actualCounts[decision.semanticKind] += 1
  actualCounts.total += 1
  decisionByGoalId.set(decision.goalId, decision)
})
assert.equal(decisionByGoalId.size, goalById.size, 'semantic-kind ledger must bind every Physics goal exactly once')
assert.deepEqual(actualCounts, EXPECTED_COUNTS)
const incompleteBilingualAtomicGoals = ledger.decisions
  .filter(({ semanticKind }) => semanticKind === 'curricularAtomic')
  .flatMap(({ goalId }) => {
    const goal = rawGoalById.get(goalId)
    return (
      typeof goal?.titleEn === 'string'
      && goal.titleEn.trim() !== ''
      && typeof goal.descriptionEn === 'string'
      && goal.descriptionEn.trim() !== ''
    ) ? [] : [goalId]
  })
assert.deepEqual(
  incompleteBilingualAtomicGoals,
  [],
  'Every Physics curricularAtomic goal must have complete titleEn and descriptionEn before bilingual review campaigns',
)

const config = readJson<Record<string, unknown>>(CONFIG_PATH)
assert.deepEqual(config, {
  schemaVersion: 1,
  bookId: 'de-gym-physik-bundesweit',
  title: 'Lernzielbuch Physik – Gymnasium bundesweit',
  landscapePath: LANDSCAPE_PATH,
  compositionViewManifestPath: SOURCE_MANIFEST_PATH,
  semanticKindLedgerPath: LEDGER_PATH,
  goalVisualizationQaPath: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json',
  externalLandscapePaths: [MATH_LANDSCAPE_PATH],
  publicationMode: 'review',
  atlasBaseUrl: 'https://skillpilot.com/lernzielbuch',
  evidenceReviewPaths: [],
  outputPath: 'tmp/goal-books/de-gym-physik-bundesweit.book-model.json',
})

const sourceManifest = readJson<SourceManifest>(SOURCE_MANIFEST_PATH)
const sourceManifestSchema = readJson<Record<string, unknown>>(SOURCE_MANIFEST_SCHEMA_PATH)
const sourceManifestAjv = new Ajv2020({ allErrors: true, strict: true })
const validateSourceManifest = sourceManifestAjv.compile(sourceManifestSchema)
assert(validateSourceManifest(sourceManifest), sourceManifestAjv.errorsText(validateSourceManifest.errors, { separator: '; ' }))
assert.equal(sourceManifest.schemaVersion, 2)
const legacySourceManifestSchema = readJson<Record<string, unknown>>(LEGACY_SOURCE_MANIFEST_SCHEMA_PATH)
const legacySourceManifestAjv = new Ajv2020({ allErrors: true, strict: true })
const validateLegacySourceManifest = legacySourceManifestAjv.compile(legacySourceManifestSchema)
const legacySourceManifest = {
  schemaVersion: 1,
  manifestId: sourceManifest.manifestId,
  landscapeId: sourceManifest.landscapeId,
  navigationOwnership: 'common-topic-suffix-v1',
  expectedJurisdictions: sourceManifest.expectedJurisdictions,
  durationModelPolicyPath: sourceManifest.durationModelPolicyPath,
  expectedCurricularAtomicGoalCount: sourceManifest.expectedCurricularAtomicGoalCount,
  sourcePaths: sourceManifest.sourcePaths,
}
assert(
  validateLegacySourceManifest(legacySourceManifest),
  legacySourceManifestAjv.errorsText(validateLegacySourceManifest.errors, { separator: '; ' }),
)
assert.equal(validateSourceManifest(legacySourceManifest), false)
assert.equal(validateLegacySourceManifest(sourceManifest), false)
assert.equal(sourceManifest.manifestId, 'de-gym-physics-national-atlas')
assert.equal(sourceManifest.landscapeId, LANDSCAPE_ID)
assert.equal(sourceManifest.navigationOwnership, 'canonical-composition-view-v1')
assert.equal(
  sourceManifest.navigationViewPath,
  'app/scripts/config/goal-books/navigation/de-gym-physics-national-atlas.view.json',
)
assert.deepEqual(sourceManifest.expectedJurisdictions, EXPECTED_JURISDICTIONS)
assert.equal(sourceManifest.durationModelPolicyPath, DURATION_POLICY_PATH)
assert.equal(sourceManifest.expectedCurricularAtomicGoalCount, EXPECTED_COUNTS.curricularAtomic)
assert.equal(sourceManifest.sourcePaths.length, 64)
assert.deepEqual(
  sourceManifest.sourcePaths,
  [...sourceManifest.sourcePaths].sort(compareCodePoints),
  'Physics atlas source paths must stay sorted',
)
const discoveredStateViewPaths = readdirSync(resolve(repoRoot, COMPOSITION_VIEW_DIRECTORY))
  .filter((fileName) => /^(?:de-[a-z]{2})-(?:gk|lk|sekii-gk|sekii-lk)\.view\.json$/u.test(fileName))
  .map((fileName) => `${COMPOSITION_VIEW_DIRECTORY}/${fileName}`)
  .sort(compareCodePoints)
assert.deepEqual(sourceManifest.sourcePaths, discoveredStateViewPaths, 'Physics atlas manifest must bind all and only the 64 state views')

const landscapeWithSemanticKinds = {
  ...landscape,
  goals: landscape.goals.map((goal) => ({
    ...goal,
    semanticKind: decisionByGoalId.get(goal.id)?.semanticKind,
  })),
}
const semanticGoalById = new Map(landscapeWithSemanticKinds.goals.map((goal) => [goal.id, goal]))
const mathGoalById = new Map(mathLandscape.goals.map((goal) => [goal.id, goal]))
const canonicalGoalOwnerById = new Map<string, string>()
const physicsAndMathGoalUniverseGoals = [
  [LANDSCAPE_ID, landscapeWithSemanticKinds] as const,
  [mathLandscape.landscapeId, mathLandscape] as const,
].flatMap(([landscapeId, canonicalLandscape]) => canonicalLandscape.goals.map((goal) => {
  const previousOwner = canonicalGoalOwnerById.get(goal.id)
  assert(!previousOwner, `canonical goal ${goal.id} is duplicated in ${previousOwner} and ${landscapeId}`)
  canonicalGoalOwnerById.set(goal.id, landscapeId)
  return goal
}))
const physicsAndMathGoalUniverse: CanonicalAuthoringLandscape = {
  landscapeId: 'de-gymnasium-physics-goal-book-goal-universe',
  title: 'Canonical Physics goal-book goal universe',
  goals: physicsAndMathGoalUniverseGoals,
}
const physicsAndMathGoalById = new Map(
  physicsAndMathGoalUniverseGoals.map((goal) => [goal.id, goal]),
)
const effectivePhysicsRequiresByGoalId = new Map<string, string[]>()
landscapeWithSemanticKinds.goals.forEach((goal) => {
  const effectiveRequires = new Set(goal.requires.map(normalizeGoalRef))
  const seenAncestors = new Set<string>()
  const ancestorStack = [...(parentIdsByChild.get(goal.id) ?? [])]
  while (ancestorStack.length > 0) {
    const ancestorId = ancestorStack.pop()
    if (!ancestorId || seenAncestors.has(ancestorId)) continue
    seenAncestors.add(ancestorId)
    const ancestor = semanticGoalById.get(ancestorId)
    assert(ancestor, `Physics contains graph references unknown ancestor ${ancestorId}`)
    ancestor.requires.map(normalizeGoalRef).forEach((requiredGoalId) => {
      effectiveRequires.add(requiredGoalId)
    })
    ancestorStack.push(...(parentIdsByChild.get(ancestorId) ?? []))
  }
  effectivePhysicsRequiresByGoalId.set(goal.id, [...effectiveRequires].sort(compareCodePoints))
})
const allPhysicsViewPaths = readdirSync(resolve(repoRoot, COMPOSITION_VIEW_DIRECTORY))
  .filter((fileName) => fileName.endsWith('.view.json'))
  .map((fileName) => `${COMPOSITION_VIEW_DIRECTORY}/${fileName}`)
  .sort(compareCodePoints)
assert.equal(allPhysicsViewPaths.length, 69, 'Physics projection QA must bind all 69 composition views')
const validatedNationalPhysicsViewIds = new Set<string>()
const validatedStrictBwBySekIViewIds = new Set<string>()
const validatedGravitationGkViewIds = new Set<string>()
const validatedGravitationLkViewIds = new Set<string>()

allPhysicsViewPaths.forEach((viewPath) => {
  const view = normalizeCompositionView(readJson(viewPath))
  assert.equal(view.landscapeId, LANDSCAPE_ID, `${view.viewId} must reference canonical Physics`)
  const compilation = compileCompositionView(
    view,
    landscapeWithSemanticKinds,
    physicsAndMathGoalUniverse,
  )
  const errors = compilation.findings.filter(({ severity }) => severity === 'error')
  assert.deepEqual(errors, [], `invalid Physics composition view ${viewPath}`)

  const visibleGoalIds = collectVisibleGoalIds(compilation.compiledRootNodes)
  const gravitationRootIsTarget = visibleGoalIds.has(GRAVITATION_ROOT_GOAL_ID)
  const authoredGravitationProjectionRoots = collectAuthoredPrerequisiteRoots(view.rootNodes)
    .filter(({ goalId }) => GRAVITATION_LK_ONLY_PROJECTION_ROOTS.some((root) => root.goalId === goalId))
    .sort((left, right) => compareCodePoints(left.goalId, right.goalId))
  if (view.scope.courseProfile === 'GK') {
    GRAVITATION_LK_ONLY_GOAL_IDS.forEach((goalId) => {
      assert(
        !visibleGoalIds.has(goalId),
        `${view.viewId} must not expose LK-only gravitation goal ${goalId} as a GK target`,
      )
    })
    if (gravitationRootIsTarget) {
      assert.deepEqual(
        authoredGravitationProjectionRoots,
        [...GRAVITATION_LK_ONLY_PROJECTION_ROOTS]
          .sort((left, right) => compareCodePoints(left.goalId, right.goalId)),
        `${view.viewId} must retain all three explicit gravitation prerequisiteOnly overrides`,
      )
      validatedGravitationGkViewIds.add(view.viewId)
    }
  }
  if (view.scope.courseProfile === 'LK' && gravitationRootIsTarget) {
    assert.deepEqual(
      authoredGravitationProjectionRoots,
      [],
      `${view.viewId} must not downgrade LK gravitation targets to prerequisite-only`,
    )
    GRAVITATION_LK_ONLY_GOAL_IDS.forEach((goalId) => {
      assert(
        visibleGoalIds.has(goalId),
        `${view.viewId} must retain LK gravitation target ${goalId}`,
      )
    })
    validatedGravitationLkViewIds.add(view.viewId)
  }
  if (
    (view.scope.jurisdiction === 'DE-BW' || view.scope.jurisdiction === 'DE-BY')
    && view.scope.stage === 'CrossStage'
  ) {
    const sekIAnchorId = view.scope.jurisdiction === 'DE-BW' ? 'physics-bw-seki' : 'physics-seki'
    const sekIStructures = collectCompositionStructures(view.rootNodes, sekIAnchorId)
    assert.equal(sekIStructures.length, 1, `${view.viewId} must expose exactly one strict Sek-I structure`)
    const sekIStructure = sekIStructures[0]
    if (view.scope.jurisdiction === 'DE-BY') {
      const ph10Structures = collectCompositionStructures([sekIStructure], 'physics-by-ph10-1')
      assert.equal(ph10Structures.length, 1, `${view.viewId} must expose exactly one Ph10.1 structure`)
      assert.deepEqual(
        [...collectAuthoredProjectionGoalIds([ph10Structures[0]], semanticGoalById)].sort(compareCodePoints),
        [...BAVARIA_PH10_1_GOAL_IDS].sort(compareCodePoints),
        `${view.viewId} must retain the reviewed seven-goal Ph10.1 projection`,
      )
    }

    assert(
      visibleGoalIds.has(PHYSICS_MOTIVATION_GOAL_ID),
      `${view.viewId} must expose the Physics motivation anchor`,
    )

    const strictSekICompilation = compileCompositionView(
      {
        ...view,
        viewId: `${view.viewId}-strict-seki-closure`,
        rootNodes: [sekIStructure],
      },
      landscapeWithSemanticKinds,
      physicsAndMathGoalUniverse,
    )
    assert.deepEqual(
      strictSekICompilation.findings.filter(({ severity }) => severity === 'error'),
      [],
      `${view.viewId} strict Sek-I subtree must compile independently`,
    )
    const strictSekITargetGoalIds = collectVisibleGoalIds(strictSekICompilation.compiledRootNodes)
    const strictSekIProjectionGoalIds = collectAuthoredProjectionGoalIds(
      [sekIStructure],
      physicsAndMathGoalById,
    )

    // Root-level prerequisite-only references are explicit shared support for
    // the stage branch. Do not admit target goals from the sibling Sek-II
    // branch into this strict availability set.
    const rootStructures = collectCompositionStructures(view.rootNodes, 'physics-root')
    assert.equal(rootStructures.length, 1, `${view.viewId} must expose exactly one Physics root structure`)
    const rootLevelPrerequisiteNodes = rootStructures[0].children.filter((node) => (
      node.kind !== 'structure'
      && node.kind !== 'landscapeEntry'
      && node.projectionRole === 'prerequisiteOnly'
    ))
    collectAuthoredProjectionGoalIds(rootLevelPrerequisiteNodes, physicsAndMathGoalById)
      .forEach((goalId) => strictSekIProjectionGoalIds.add(goalId))
    strictSekIProjectionGoalIds.add(PHYSICS_MOTIVATION_GOAL_ID)

    const strictRouteStartGoalIds = [...strictSekITargetGoalIds]
      .filter((goalId) => {
        const goal = semanticGoalById.get(goalId)
        return !!goal && resolveCanonicalNodeType(goal) === 'atomic'
      })
      .sort(compareCodePoints)
    assert(strictRouteStartGoalIds.length > 0, `${view.viewId} strict Sek-I route needs target atoms`)
    CQR104_ROUTE_ASSESSMENT_EVIDENCE.forEach((_evidence, assessmentId) => {
      const assessment = semanticGoalById.get(assessmentId)
      assert(assessment, `Missing route assessment ${assessmentId}`)
      assert.equal(
        (assessment.extendedData as { applicabilityFromRequires?: unknown })?.applicabilityFromRequires,
        true,
        `${assessmentId} must derive local visibility from its exact requires`,
      )
      const requiredGoalIds = effectivePhysicsRequiresByGoalId.get(assessmentId) ?? []
      const hasCompleteLocalSupport = requiredGoalIds.every((requiredGoalId) =>
        strictSekIProjectionGoalIds.has(requiredGoalId),
      )
      assert.equal(
        strictRouteStartGoalIds.includes(assessmentId),
        hasCompleteLocalSupport,
        `${view.viewId} must project ${assessmentId} exactly when all requires are authoritatively visible`,
      )
    })

    const visitedPrerequisiteGoalIds = new Set<string>()
    const visitingPrerequisiteGoalIds = new Set<string>()
    let traversedPrerequisiteEdges = 0
    const visitAllPrerequisites = (goalId: string, routePath: string[]) => {
      if (visitingPrerequisiteGoalIds.has(goalId)) {
        assert.fail(`${view.viewId} strict Sek-I prerequisite cycle: ${[...routePath, goalId].join(' -> ')}`)
      }
      if (visitedPrerequisiteGoalIds.has(goalId)) return
      visitingPrerequisiteGoalIds.add(goalId)
      const goal = physicsAndMathGoalById.get(goalId)
      assert(goal, `${view.viewId} strict Sek-I route references unknown canonical goal ${goalId}`)
      // A foreign canonical root is the explicit cross-landscape hand-off:
      // this Physics view must authoritatively project it, while its internal
      // learning route remains owned and validated by the Mathematics view.
      // Within Physics, no visible local prerequisite may terminate recursion.
      if (!semanticGoalById.has(goalId)) {
        visitingPrerequisiteGoalIds.delete(goalId)
        visitedPrerequisiteGoalIds.add(goalId)
        return
      }
      const requiredGoalIds = effectivePhysicsRequiresByGoalId.get(goalId)
        ?? []
      requiredGoalIds.forEach((requiredGoalId) => {
        traversedPrerequisiteEdges += 1
        const nextRoutePath = [...routePath, goalId, requiredGoalId]
        assert(
          strictSekIProjectionGoalIds.has(requiredGoalId),
          `${view.viewId} strict Sek-I all-of prerequisite closure leaves its authoritative projection: ${nextRoutePath.join(' -> ')}`,
        )
        visitAllPrerequisites(requiredGoalId, [...routePath, goalId])
      })
      visitingPrerequisiteGoalIds.delete(goalId)
      visitedPrerequisiteGoalIds.add(goalId)
    }
    strictRouteStartGoalIds.forEach((goalId) => {
      assert(
        strictSekIProjectionGoalIds.has(goalId),
        `${view.viewId} strict Sek-I route start is not authoritatively projected: ${goalId}`,
      )
      visitAllPrerequisites(goalId, [])
    })
    assert(
      traversedPrerequisiteEdges > 0,
      `${view.viewId} strict Sek-I closure regression must traverse prerequisite edges`,
    )
    validatedStrictBwBySekIViewIds.add(view.viewId)
  }
  const expectedForeignPrerequisiteIds = new Set<string>()
  visibleGoalIds.forEach((goalId) => {
    const physicsGoal = semanticGoalById.get(goalId)
    if (!physicsGoal) return
    physicsGoal.requires
      .map(normalizeGoalRef)
      .filter((requiredGoalId) => !semanticGoalById.has(requiredGoalId))
      .forEach((requiredGoalId) => expectedForeignPrerequisiteIds.add(requiredGoalId))
  })

  const authoredForeignPrerequisiteRoots = collectAuthoredPrerequisiteRoots(view.rootNodes)
    .map((root) => ({ ...root, goalId: normalizeGoalRef(root.goalId) }))
    .filter(({ goalId }) => !semanticGoalById.has(goalId))
  const authoredForeignPrerequisiteRootById = new Map<string, AuthoredPrerequisiteRoot>()
  authoredForeignPrerequisiteRoots.forEach((root) => {
    assert(
      !authoredForeignPrerequisiteRootById.has(root.goalId),
      `${view.viewId} duplicates authored prerequisite-only root ${root.goalId}`,
    )
    authoredForeignPrerequisiteRootById.set(root.goalId, root)
  })

  assert.deepEqual(
    [...authoredForeignPrerequisiteRootById.keys()].sort(compareCodePoints),
    [...expectedForeignPrerequisiteIds].sort(compareCodePoints),
    `${view.viewId} prerequisite-only support roots must exactly match direct foreign requires of visible Physics targets`,
  )
  expectedForeignPrerequisiteIds.forEach((goalId) => {
    const mathGoal = mathGoalById.get(goalId)
    assert(mathGoal, `${view.viewId} foreign prerequisite ${goalId} is not canonical mathematics`)
    const expectedKind = resolveCanonicalNodeType(mathGoal) === 'cluster'
      ? 'canonicalSubtree'
      : 'goalEntry'
    assert.equal(
      authoredForeignPrerequisiteRootById.get(goalId)?.kind,
      expectedKind,
      `${view.viewId} prerequisite-only support root ${goalId} must use ${expectedKind}`,
    )
  })

  if (NATIONAL_PHYSICS_VIEW_IDS.has(view.viewId)) {
    REVIEWED_NEWTON_ATOMIC_GOAL_IDS.forEach((goalId) => {
      assert(
        visibleGoalIds.has(goalId),
        `${view.viewId} must retain reviewed Newton atom ${goalId}`,
      )
    })
    assert(
      !visibleGoalIds.has('4dc9a094-66d7-4d4d-9436-134aabe48f39'),
      `${view.viewId} must not expose the Newton curricular-area cluster as an opaque target`,
    )
    validatedNationalPhysicsViewIds.add(view.viewId)
  }
})
assert.deepEqual(
  [...validatedNationalPhysicsViewIds].sort(compareCodePoints),
  [...NATIONAL_PHYSICS_VIEW_IDS].sort(compareCodePoints),
  'Physics projection QA must bind all four national CrossStage/SekII GK/LK views',
)
assert.deepEqual(
  [...validatedStrictBwBySekIViewIds].sort(compareCodePoints),
  [
    'de-bw-gym-physics-gk',
    'de-bw-gym-physics-lk',
    'de-by-gym-physics-gk',
    'de-by-gym-physics-lk',
  ],
  'Physics projection QA must bind all strict BW/BY CrossStage Sek-I routes',
)
assert.deepEqual(
  [...validatedGravitationGkViewIds].sort(compareCodePoints),
  [...EXPECTED_GRAVITATION_GK_VIEW_IDS].sort(compareCodePoints),
  'Physics projection QA must bind exactly the 30 GK views with the broad gravitation target',
)
assert.deepEqual(
  [...validatedGravitationLkViewIds].sort(compareCodePoints),
  [...EXPECTED_GRAVITATION_LK_VIEW_IDS].sort(compareCodePoints),
  'Physics projection QA must bind exactly the 30 matching LK views with the broad gravitation target',
)

const atlasCurricularAtomicGoalIds = new Set<string>()
const sourceViews: Array<{
  viewId: string
  jurisdiction: string
  stage: string
  courseProfile: string | null
  durationModel: string | null
}> = []
const roleCountByJurisdiction = new Map<string, Set<string>>()
sourceManifest.sourcePaths.forEach((sourcePath) => {
  assert(existsSync(resolve(repoRoot, sourcePath)), `missing Physics atlas source ${sourcePath}`)
  const view = normalizeCompositionView(readJson(sourcePath))
  assert.equal(view.landscapeId, LANDSCAPE_ID)
  assert(EXPECTED_JURISDICTIONS.includes(view.scope.jurisdiction as typeof EXPECTED_JURISDICTIONS[number]))
  assert(view.scope.stage === 'CrossStage' || view.scope.stage === 'SekII')
  assert(view.scope.courseProfile === 'GK' || view.scope.courseProfile === 'LK')
  assert.equal(view.scope.durationModel, undefined, `${view.viewId} must stay duration-neutral`)
  const expectedRole = sourcePath.endsWith('-sekii-gk.view.json')
    ? 'SekII:GK'
    : sourcePath.endsWith('-sekii-lk.view.json')
      ? 'SekII:LK'
      : sourcePath.endsWith('-gk.view.json')
        ? 'CrossStage:GK'
        : 'CrossStage:LK'
  assert.equal(`${view.scope.stage}:${view.scope.courseProfile}`, expectedRole, `${sourcePath} has the wrong state-view role`)
  const roleSet = roleCountByJurisdiction.get(view.scope.jurisdiction!) ?? new Set<string>()
  assert(!roleSet.has(expectedRole), `${view.scope.jurisdiction} has duplicate ${expectedRole} views`)
  roleSet.add(expectedRole)
  roleCountByJurisdiction.set(view.scope.jurisdiction!, roleSet)
  const compilation = compileCompositionView(
    view,
    landscapeWithSemanticKinds,
    physicsAndMathGoalUniverse,
  )
  const errors = compilation.findings.filter(({ severity }) => severity === 'error')
  assert.deepEqual(errors, [], `invalid Physics atlas source ${sourcePath}`)
  collectAtomicGoalIds(compilation.compiledRootNodes, semanticGoalById).forEach((goalId) => {
    if (decisionByGoalId.get(goalId)?.semanticKind === 'curricularAtomic') {
      atlasCurricularAtomicGoalIds.add(goalId)
    }
  })
  sourceViews.push({
    viewId: view.viewId,
    jurisdiction: view.scope.jurisdiction!,
    stage: view.scope.stage!,
    courseProfile: view.scope.courseProfile ?? null,
    durationModel: view.scope.durationModel ?? null,
  })
})
EXPECTED_JURISDICTIONS.forEach((jurisdiction) => {
  assert.deepEqual(
    [...(roleCountByJurisdiction.get(jurisdiction) ?? [])].sort(compareCodePoints),
    ['CrossStage:GK', 'CrossStage:LK', 'SekII:GK', 'SekII:LK'],
    `${jurisdiction} must contribute exactly four Physics atlas roles`,
  )
})
assert.equal(atlasCurricularAtomicGoalIds.size, EXPECTED_COUNTS.curricularAtomic)
assert.deepEqual(
  [...reviewedAtomicGoalIds].filter((goalId) => !atlasCurricularAtomicGoalIds.has(goalId)),
  [],
  'all reviewed curricular Physics atoms must be visible in the nationwide atlas union',
)

const canonicalProfileTargetIds = new Set<string>()
const ROAD_SAFETY_GOAL_ID = '4a2bf015-052b-4af0-aed7-324259fa1a8a'
for (const profilePath of [
  'curricula/DE/Gymnasium/composition-views/physik/de-de-gym-physics-gk.view.json',
  'curricula/DE/Gymnasium/composition-views/physik/de-de-gym-physics-lk.view.json',
]) {
  const view = normalizeCompositionView(readJson(profilePath))
  const compilation = compileCompositionView(
    view,
    landscapeWithSemanticKinds,
    physicsAndMathGoalUniverse,
  )
  assert.deepEqual(
    compilation.findings.filter(({ severity }) => severity === 'error'),
    [],
    `invalid canonical Physics profile ${profilePath}`,
  )
  collectAtomicGoalIds(compilation.compiledRootNodes, semanticGoalById).forEach((goalId) => {
    if (decisionByGoalId.get(goalId)?.semanticKind === 'curricularAtomic') {
      canonicalProfileTargetIds.add(goalId)
    }
  })
}
assert.equal(canonicalProfileTargetIds.size, 391)
assert.equal(
  canonicalProfileTargetIds.has(ROAD_SAFETY_GOAL_ID),
  false,
  'the direct prerequisiteOnly goalEntry for road safety overrides its broader target subtree',
)

const navigationView = normalizeCompositionView(readJson(sourceManifest.navigationViewPath))
const combinedProfileBranches = collectCompositionStructures(
  navigationView.rootNodes,
  'goal-book-physics-sekii-gk-lk',
)
assert.equal(combinedProfileBranches.length, 1)
assert.equal(combinedProfileBranches[0].label, 'Sekundarstufe II (GK und LK)')
assert.equal(
  collectCompositionStructures(
    navigationView.rootNodes,
    'canonical-structure:physics-sekii-gk',
  ).length,
  0,
  'the nationwide Physics atlas must not retain a GK-only label for its GK/LK union',
)
const navigationCompilation = compileCompositionView(
  navigationView,
  landscapeWithSemanticKinds,
  physicsAndMathGoalUniverse,
)
assert.deepEqual(
  navigationCompilation.findings.filter(({ severity }) => severity === 'error'),
  [],
  'invalid canonical Physics goal-book navigation view',
)
const navigationGoalIds = new Set([...collectAtomicGoalIds(
  navigationCompilation.compiledRootNodes,
  semanticGoalById,
)].filter((goalId) => decisionByGoalId.get(goalId)?.semanticKind === 'curricularAtomic'))
assert.deepEqual(
  [...navigationGoalIds].sort(compareCodePoints),
  [...atlasCurricularAtomicGoalIds].sort(compareCodePoints),
  'canonical goal-book navigation must place all 464 atlas goals exactly once',
)

const durationPolicy = readJson<{
  schemaVersion: number
  updatedAt: string
  decisions: PhysicsDurationDecision[]
}>(DURATION_POLICY_PATH)
assert.equal(durationPolicy.schemaVersion, 1)
assert.equal(durationPolicy.updatedAt, '2026-08-20')
const physicsDurationDecisions = durationPolicy.decisions.filter(({ subject }) => subject === 'Physik')
assert.equal(physicsDurationDecisions.length, EXPECTED_JURISDICTIONS.length)
const physicsDurationDecisionByJurisdiction = new Map<string, PhysicsDurationDecision>()
physicsDurationDecisions.forEach((decision) => {
  assert(decision.jurisdiction, 'Physics duration decision lacks jurisdiction')
  assert(!physicsDurationDecisionByJurisdiction.has(decision.jurisdiction), `duplicate Physics duration decision ${decision.jurisdiction}`)
  const expected = EXPECTED_DURATION_DECISIONS.get(decision.jurisdiction)
  assert(expected, `unexpected Physics duration jurisdiction ${decision.jurisdiction}`)
  assert.equal(decision.status, 'reviewed')
  assert.equal(decision.stage, expected.stage)
  assert.equal(decision.decision, expected.decision)
  assert.deepEqual(decision.durationModels, expected.durationModels)
  assert.equal(decision.learnerFacingProjection, 'duration-neutral-composition-view')
  assert.equal(decision.compositionViewIds, undefined, `${decision.jurisdiction} must not invent duration-specific Physics views`)
  assert(decision.sourceExtractionPath && existsSync(resolve(repoRoot, decision.sourceExtractionPath)), `missing source extraction for ${decision.jurisdiction}`)
  const extraction = readJson<{ subject?: string; jurisdiction?: string; sourceDocument?: { official?: boolean } }>(decision.sourceExtractionPath)
  assert.equal(extraction.subject, 'Physik')
  assert.equal(extraction.jurisdiction, decision.jurisdiction)
  assert.equal(extraction.sourceDocument?.official, true, `${decision.jurisdiction} must bind an official Physics extraction`)
  physicsDurationDecisionByJurisdiction.set(decision.jurisdiction, decision)
})
assert.deepEqual(
  [...physicsDurationDecisionByJurisdiction.keys()].sort(compareCodePoints),
  [...EXPECTED_JURISDICTIONS],
)
for (const jurisdiction of ['DE-BB', 'DE-BE', 'DE-NI', 'DE-NW', 'DE-RP', 'DE-SH']) {
  const decision = physicsDurationDecisionByJurisdiction.get(jurisdiction)
  assert(decision)
  assert.equal(decision.stage, 'SekI+SekII')
  assert.equal(decision.evidenceSources?.length, 1, `${jurisdiction} must bind one reviewed official duration source`)
  assert.match(decision.evidenceSources![0], /^https:\/\//u)
  assert.match(decision.rationale ?? '', /reviewed on 2026-08-20/u)
  assert.match(decision.rationale ?? '', /Physics (?:extraction|source)/u)
}
parseSubjectDurationModelPolicy(
  durationPolicy,
  'Physik',
  [...EXPECTED_JURISDICTIONS],
  sourceViews,
)

const sharedDurationPolicy = readJson<{ decisions: PhysicsDurationDecision[] }>(
  SHARED_DURATION_POLICY_PATH,
)
const sharedPhysicsDecisions = sharedDurationPolicy.decisions
  .filter(({ subject }) => subject === 'Physik')
const sharedPhysicsJurisdictions = sharedPhysicsDecisions
  .map(({ jurisdiction }) => jurisdiction ?? '')
  .sort(compareCodePoints)
assert.deepEqual(
  sharedPhysicsJurisdictions,
  [...EXPECTED_SHARED_PHYSICS_JURISDICTIONS],
  'the shared legacy policy must retain exactly its ten byte-frozen Physics decisions',
)
sharedPhysicsDecisions.forEach((sharedDecision) => {
  const snapshotDecision = physicsDurationDecisionByJurisdiction.get(sharedDecision.jurisdiction!)
  assert(snapshotDecision, `Physics snapshot lacks shared decision ${sharedDecision.jurisdiction}`)
  assert.equal(
    canonicalJson(snapshotDecision),
    canonicalJson(sharedDecision),
    `${sharedDecision.jurisdiction} drifted between the shared legacy policy and Physics atlas snapshot`,
  )
})

const curriculumQualityStatus = readJson<{
  curricula: Array<{
    landscapeId: string
    scopes: Array<{
      scopeId: string
      rules: Array<{
        id: string
        status: string
        metrics?: Record<string, number>
      }>
    }>
  }>
}>(CURRICULUM_QUALITY_STATUS_PATH)
const physicsQuality = curriculumQualityStatus.curricula.find(({ landscapeId }) => landscapeId === LANDSCAPE_ID)
assert(physicsQuality, 'curriculum-quality status lacks canonical Physics')
const physicsSekIRouteScope = physicsQuality.scopes.find(({ scopeId }) => scopeId === 'canonical-physics-sek1')
assert(physicsSekIRouteScope, 'curriculum-quality status lacks canonical Physics Sek-I route scope')
const routeProjectionRule = physicsSekIRouteScope.rules.find(({ id }) => id === 'CQR-104')
assert(routeProjectionRule, 'curriculum-quality status lacks Physics Sek-I CQR-104')
const routeMetrics = routeProjectionRule.metrics ?? {}
assert.equal(
  routeMetrics.visibleProjectedRouteTargetGoalOccurrences,
  EXPECTED_PHYSICS_SEKI_PROJECTED_ROUTE_TARGET_OCCURRENCES,
  'Physics Sek-I CQR-104 must count every resolved learner-facing target occurrence',
)
assert.equal(
  routeMetrics.visibleProfileSelectedAtomicGoalOccurrences,
  EXPECTED_PHYSICS_SEKI_PROFILE_SELECTED_TARGET_OCCURRENCES,
)
assert.equal(
  routeMetrics.visibleProjectedRouteTargetGoalOccurrencesExcludedByProfileSelector,
  EXPECTED_PHYSICS_SEKI_PROFILE_SELECTOR_EXCLUDED_OCCURRENCES,
  'The profile selector diagnostic must retain the known tag/phase mismatch instead of hiding it',
)
assert.equal(
  routeMetrics.uniqueProjectedRouteTargetsExcludedByProfileSelector,
  EXPECTED_PHYSICS_SEKI_PROFILE_SELECTOR_EXCLUDED_UNIQUE_GOALS,
)
assert.equal(
  (routeMetrics.visibleProfileSelectedAtomicGoalOccurrences ?? 0)
    + (routeMetrics.visibleProjectedRouteTargetGoalOccurrencesExcludedByProfileSelector ?? 0),
  routeMetrics.visibleProjectedRouteTargetGoalOccurrences,
)
assert.equal(
  routeMetrics.visibleSelectedAtomicGoalOccurrences,
  routeMetrics.visibleProjectedRouteTargetGoalOccurrences,
  'Every projected route target occurrence must enter the route checks',
)
assert.equal(
  routeMetrics.visibleProjectedRouteTargetGoalOccurrencesExcludedFromRouteChecks,
  0,
  'CQR-104 must fail closed if any projected route target escapes route checks',
)
for (const suffix of [
  'EffectiveMotivationRoute',
  'DirectMotivationRoute',
  'EffectiveTerminalRoute',
  'DirectTerminalRoute',
] as const) {
  assert.equal(
    routeMetrics[`profileSelectorExcludedGoalOccurrencesMissing${suffix}`],
    routeMetrics[`visibleSelectedGoalOccurrencesMissing${suffix}`],
    `Known Physics Sek-I projection-local ${suffix} failures must not be removed by profile preselection`,
  )
}
const hasProjectionRouteFailure = [
  'visibleSelectedGoalOccurrencesMissingEffectiveMotivationRoute',
  'visibleSelectedGoalOccurrencesMissingDirectMotivationRoute',
  'visibleSelectedGoalOccurrencesMissingEffectiveTerminalRoute',
  'visibleSelectedGoalOccurrencesMissingDirectTerminalRoute',
].some((metric) => (routeMetrics[metric] ?? 0) > 0)
assert.equal(
  routeProjectionRule.status,
  hasProjectionRouteFailure ? 'fail' : 'pass',
  'Physics Sek-I CQR-104 status must reflect all projection-local route failures',
)

console.log(
  `Physics goal-book inputs verified: ${EXPECTED_COUNTS.total} semantic-kind decisions; `
  + `${EXPECTED_COUNTS.curricularAtomic} curricular atoms in 64 state views; `
  + `${EXPECTED_JURISDICTIONS.length} reviewed duration decisions.`,
)
