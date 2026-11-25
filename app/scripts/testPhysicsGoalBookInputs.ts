import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import './testHePhysicsQuantumTemplate'
import { achievableReviewRoot, coachScoringReviewRoot, verifiedCoachScoringReviewChain } from './lib/e1AchievableScoringReviews'
import { beforeReleasedMarkingHeadings, releasedHeadingsRoot } from './lib/e1ReleasedMarkingHeadings'
import { assertFinalPhysicsAtlasPublishedTargets, assertFinalPhysicsAtlasDraftTargets } from './lib/physicsFinalGoalBookAtlasTargets'
import { assessmentReviewRevisions } from './lib/learningUnitContracts'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { prepareLandscapeEntries } from '../src/hooks/useLandscapes'
import { applyCompositionViewProjection, applyPersonalCurriculumProjection } from '../src/utils/compositionViewRuntime'
import { normalizeLearnerProjectedEntries } from '../src/utils/learnerTreeProjection'
import {
  normalizeCanonicalLandscape,
  normalizeGoalRef,
  resolveCanonicalNodeType,
  type CanonicalAuthoringGoal,
  type CanonicalAuthoringLandscape,
} from '../src/utils/authoring/canonicalAuthoring'
import {
  compileCompositionView,
  collectCompositionProjectionRoleGoalIds,
  normalizeCompositionView,
  type CompiledCompositionPreviewNode,
  type CompositionViewNode,
} from '../src/utils/authoring/compositionViewAuthoring'
import { buildApplicabilityCompilation } from './applicabilityCompiler'
import { collectRenderedAtomicGoalIdsFromCompositionView, collectWholeMaterialPrerequisiteClosure, createRouteProfiles, evaluateRouteProfile, routeProfileDefinitions, sourceCoverageAtomicScopeMatcher } from './generateCurriculumQualityStatus'
import type { ExamData, SkillLandscape } from '../src/landscapeTypes'
import { fingerprintSemanticKindSourceGoal, parseSubjectDurationModelPolicy, type GoalBookDurationPolicyViewSource } from './goalBookModel'
import { loadActiveGymnasiumDurationPolicy } from './gymnasiumDurationPolicy'
import {
  loadVerifiedPrerequisiteReductionContext,
  reviewBindingGoal,
  type VerifiedPrerequisiteReductionContext,
} from './prerequisiteReductionProof'
import { HE_LK_ONLY_QUANTUM_GOAL_IDS, stripHeQuantumOverridesFromClonedView } from './lib/hePhysicsQuantumScope'

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
const prerequisiteReductionContext = await loadVerifiedPrerequisiteReductionContext()
const LANDSCAPE_ID = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const LANDSCAPE_PATH = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const ATOMICITY_CONFIG_PATH = 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.config.json'
const ATOMICITY_REVIEW_PATH = 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl'
const LEDGER_PATH = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const MATH_PROFILE_PATH = 'contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-v1.profile.json'
const MATH_LANDSCAPE_PATH = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const CHEMISTRY_LANDSCAPE_PATH = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const LEDGER_SCHEMA_PATH = 'contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json'
const LEGACY_SOURCE_MANIFEST_SCHEMA_PATH = 'contracts/goal-book/v1/goal-book-source-manifest.schema.json'
const SOURCE_MANIFEST_SCHEMA_PATH = 'contracts/goal-book/v1/goal-book-source-manifest-v2.schema.json'
const SOURCE_MANIFEST_PATH = 'app/scripts/config/goal-books/de-gym-physics-national-atlas.sources.json'
const CONFIG_PATH = 'app/scripts/config/goal-books/de-gym-physics-national-atlas.json'
const LEGACY_DURATION_POLICY_PATH = 'curricula/DE/Gymnasium/provenance/gymnasium-physics-duration-model-policy.json'
const DURATION_POLICY_PATH = 'curricula/DE/Gymnasium/provenance/gymnasium-physics-duration-model-policy-2026-11-16.json'
const SHARED_DURATION_POLICY_PATH = 'curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json'
const CURRICULUM_QUALITY_STATUS_PATH = 'docs/qa-ci/status/curriculum-quality-status.json'
const APPLICABILITY_OVERRIDE_REGISTRY_PATH =
  'curricula/DE/Gymnasium/provenance/canonical-goal-applicability-override-registry.json'
const COMPOSITION_VIEW_DIRECTORY = 'curricula/DE/Gymnasium/composition-views/physik'
const HE_DURATION_VIEW_SPECS = (['g8', 'g9'] as const).flatMap((duration) => [
  { path: `${COMPOSITION_VIEW_DIRECTORY}/de-he-gk-${duration}.view.json`, viewId: `de-he-gym-physics-gk-${duration}`, stage: 'CrossStage', courseProfile: 'GK', durationModel: duration.toUpperCase() },
  { path: `${COMPOSITION_VIEW_DIRECTORY}/de-he-lk-${duration}.view.json`, viewId: `de-he-gym-physics-lk-${duration}`, stage: 'CrossStage', courseProfile: 'LK', durationModel: duration.toUpperCase() },
  { path: `${COMPOSITION_VIEW_DIRECTORY}/de-he-seki-${duration}.view.json`, viewId: `de-he-gym-seki-physics-${duration}`, stage: 'SekI', courseProfile: undefined, durationModel: duration.toUpperCase() },
])
const HE_DURATION_VIEW_BY_PATH = new Map(HE_DURATION_VIEW_SPECS.map((spec) => [spec.path, spec]))
const HE_SEKI_UPPER_SUPPORT_LEAK_IDS = [
  '09029573-864f-40ca-bf8a-cee7bf6dcb73', '09f2cdbd-64e0-55d2-ada7-1190f4fd50df',
  '1b833656-cd16-5b21-973a-9810960dcfd2', '206fe51d-cc78-5422-b139-32cc97eb1c37',
  '330808f6-789a-583d-86df-e271a7683d8b', '38e0ff49-f132-44c8-b17a-73dada5344db',
  '481ffd56-d585-56fe-b525-ed423e30eed3', '73b309ed-1aab-5778-8494-d9b65f5a352b',
  'a0aaedcb-41f8-4891-af77-a69a76b8c10d', 'ad984bb6-e225-432a-952d-d83cda40b7f8',
  'c968d263-8be4-5cf9-b320-e95398fe648f', 'e3bce51c-cfeb-4706-b95e-a22b76e7dd73',
  'e4b38061-1f28-43ad-8371-a3e7c0e81856',
]
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
  ...HE_DURATION_VIEW_SPECS.filter(({ courseProfile }) => courseProfile === 'GK').map(({ viewId }) => viewId),
])
const EXPECTED_GRAVITATION_LK_VIEW_IDS = new Set([
  'de-de-gym-physics-lk',
  'de-de-gym-sekii-physics-lk',
  ...GRAVITATION_COMPOSITION_JURISDICTIONS.flatMap((jurisdiction) => [
    `de-${jurisdiction}-gym-physics-lk`,
    `de-${jurisdiction}-gym-sekii-physics-lk`,
  ]),
  ...HE_DURATION_VIEW_SPECS.filter(({ courseProfile }) => courseProfile === 'LK').map(({ viewId }) => viewId),
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
const SEMANTIC_RECHECK_ATOMIC_GOAL_IDS = new Set([
  // E.1: exact nine unanimously current-core reviewed curricular atoms.
  'ce431132-dfc4-42c2-aff6-bd72035190f8',
  '1e459a1b-4159-5049-84eb-9928129c1610',
  'e4b38061-1f28-43ad-8371-a3e7c0e81856',
  '262f807a-30d0-503e-986f-856cbd048e8e',
  '09029573-864f-40ca-bf8a-cee7bf6dcb73',
  'd9a6ea85-f7e8-5cbd-afe9-62596e22040d',
  'd6dc0e02-831d-4894-a61a-852bcc74f147',
  '89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2',
  '0fee53f2-1c02-5b12-9b6c-aa9fa462d921',
  // Individually reviewed current B043/B046 descriptions and B034 split competencies.
  '2825b528-00ee-52d0-870e-686890cb1195',
  '333ca92b-a92c-46a9-86be-dea8ddbd43e0',
  '50877233-7abf-54df-b347-6d3224678fc9',
  '5492f0e0-cbae-574e-a853-182616205ed3',
  '6f896466-e0ec-5f8d-82ad-2890433c82ba',
  '76bcbdcb-3003-5e6a-952e-aa36eb8f97ee',
  '7d78da7f-6af5-440a-9d6b-6cab4bee8dd2',
  '7e719cc2-0866-5267-a252-e7e7ac0d03f1',
  'af50bb9a-fd7b-50f5-9698-48c4efe99032',
  'bb5c5eab-2fc1-5336-b8cf-14d147695487',
  '922f32ba-f214-5a82-be5c-1111aca51d4a',
  'f505f039-3f07-5afe-88b8-f02532e9c2f0',
  '7d4d6a39-0c78-5fb0-b7bf-182ed00972f7',
  'c2af45aa-e3fc-5119-9159-c5a260b4135a',
  'e1b21fe9-ab6f-58c4-a0b6-9895061fbabb',
  '69280706-5af6-5788-85b7-93287c2ffe74',
  '68034218-8f3e-5f7f-ae4e-ed057dd4e44e',
  '37b33812-d428-5953-852e-57a53a4347fe',
  '7fe3022f-fad0-5f41-af1c-d55ff214ebc6',
  // B035: individually re-reviewed existing descriptions and the two separate well competencies.
  'bacae732-2016-5a83-bc61-d0f94ed5a0e4',
  'badb0ef3-233d-560e-bc2a-9df99f09fe7d',
  'd05a146f-7fcd-56ae-b9b9-b54203328579', // Discrete energies; no interval integration claim.
  'f2538793-8b0a-5c3b-b216-5d329a4e87bd', // Normalized interval probability; no energy calculation claim.
  // B053: substantive model-function recheck in model-wording-informed-layer-a-alignment-20260913-v1.receipt.json.
  'e5bc2227-d900-585f-8ac0-9d3f1cb40e27',
  // Feedback of 13 November 2026: targeted recheck after the umlaut correction of title and description,
  // quality/release-model/physics-feedback-spelling-semantic-review-2026-11-13.md.
  '727d0946-7019-50ed-8fc6-85db12508733',
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
  // B034 keeps the old combined IDs as navigation clusters, not mastery atoms.
  '49872cc0-401f-5464-9235-4763df4db5cf',
  '7df923a0-6470-595e-8cea-53126fad9506',
  'd36727cc-ce42-51a3-9425-41afb0b9acdd',
  'ea17b0af-3d53-5a10-acda-7fd9348537ce',
  'ad021f2e-6b94-5e6e-a264-3d1110094b87', // B035: groups exactly the energy and interval children.
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
  '4ea1b93f-2dba-59ac-87ab-29af6c55cc37',
  // B034: actual individually counter-reviewed tasks for the separated competencies.
  '51af53cb-8866-52cd-b2ca-af8bd8a836e0',
  '4dbe6eb9-4d77-58a9-a15c-f0b8bb110a65',
  '5902ebe8-2025-5a7c-b95d-13057398d6e6',
  '6da29199-f086-512c-89f2-1b5ca865eef9',
  '6c87a996-9166-5c6e-8cda-01d40720f9c8',
  '74a32716-2b46-5d96-8b57-3f6edb90e088',
  '144007cb-e2bc-5c82-bf9d-dda705b15257',
  'b585ff81-6332-5d11-ae63-ee6a9928c00d', // B035: actual energy calculation, not interval integration.
  '6d25344c-35d7-5853-925d-2bccbaf50630', // B039: both independent rotation targets assessed.
  '7f83e25c-38f7-5ac2-8f9c-ec54eeef1026', // B039: E-phase terminal route retains both targets.
  '879491c0-7153-570b-91f4-c61d9fe8a143', // B039: rotation assessment covers the separated mean-torque atom.
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
const WITHDRAWN_ROUTE_ASSESSMENT_IDS = new Set([
  '8ff2a728-fba3-538e-83e9-69bdd8e1369e',
  '367b17f8-972a-5f3e-8915-8cfe743132a3',
  '44985d9f-7b49-52e4-86ec-eddc7b70429f',
])

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
    ['4a2bf015-052b-4af0-aed7-324259fa1a8a', ['Reaktionsweg', 'Anhalteweg', 'Sicherheitsabstand']],
  ])],
  ['b8c3dfb7-9286-52ac-8b0f-ad0a0ce941ed', new Map([
    ['b3f3f4f7-b5cc-40e1-b57a-3d93649baa61', ['Kennzeichnen Sie Quarks und Leptonen', 'Quarkzusammensetzung']],
    ['a12fddce-0215-58d9-bd91-21be8a960d25', ['separat gemessene Aktivität der Mutterkerne', 'Aktivität bereits entstandener Tochterkerne', 'Zerfallsfolge']],
  ])],
  ['a77e53d5-246d-52df-86a2-d14f7a08fb77', new Map([
    ['50877233-7abf-54df-b347-6d3224678fc9', ['für Spaltung und Fusion', 'Ausgangskerne', 'typische Produkte', 'Kettenreaktion']],
    ['7d78da7f-6af5-440a-9d6b-6cab4bee8dd2', ['Herkunft der frei werdenden Energie qualitativ']],
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
    ['df010b2b-b182-5f7e-bbe4-49b72e48c27a', [
      'Bandmodelle A–C', 'erreichbare unbesetzte Energiezustände', 'Bandlücke',
      'n-Dotierung', 'p-Dotierung', 'vollständige Ladungsbilanz',
      'bloßer Erwärmung eines undotierten Halbleiters',
    ]],
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
    ['7d4d6a39-0c78-5fb0-b7bf-182ed00972f7', [
      'Steuer- und Lastpfad', 'dünne Basis', 'Demonstrationsdaten sind vorgegeben',
      'bescheinigt keinen selbst hergestellten Aufbau', 'elektronische Schaltwirkung',
      'beim Tausch dieser Sensorwirkung',
    ]],
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

const historicalThrowExamId = '6ea3fb3c-abdc-568f-ab13-97c36dc274e4'
const currentThrowExamId = 'bcc56921-7107-5f5f-b721-3d5e0d7e1cd9'
const KINEMATICS_ASSESSMENT_IDS = new Set([
  '4ab1cf6d-b808-5b86-9291-85df0b9f2496',
  '6ea3fb3c-abdc-568f-ab13-97c36dc274e4',
])
const HESSE_E1_ASSESSMENT_IDS = new Set([
  'ee7d5f3d-858f-59d6-89b0-e5a7f437f458',
  '39f52dcb-ff1d-5cad-9ccb-30da803cfa85',
  'c933b7d2-edcb-5747-9378-9762659f260a',
  'f13ca187-b680-5f47-b4ad-76bd474bd8a2',
])
const EXPECTED_COUNTS: SemanticKindLedger['counts'] = {
  curricularAtomic: 490,
  curricularArea: 112,
  practiceAssessment: 248,
  programStructure: 1,
  memory: 5,
  runtimeSupport: 4,
  orientation: 4,
  total: 864,
}
// One reviewed measurement-rate atom is preparation only in the atlas's
// current source views. It remains an ordinary curricular goal in the ledger.
const ATLAS_PREPARATION_ONLY_GOAL_ID = '13b338eb-f761-5817-9058-11043b9cb253'
const EXPECTED_ATLAS_TARGET_COUNT = 489
// These four reviewed E.1 split atoms extend the existing target set; every
// previous atlas and canonical-profile identity remains independently pinned.
const E1_ADDED_NATIONAL_TARGET_IDS = [
  '0fee53f2-1c02-5b12-9b6c-aa9fa462d921',
  '1e459a1b-4159-5049-84eb-9928129c1610',
  '262f807a-30d0-503e-986f-856cbd048e8e',
  'd9a6ea85-f7e8-5cbd-afe9-62596e22040d',
]
const STAGE_PLAN_ADDED_NATIONAL_TARGET_IDS = [
  '3ed3279e-c524-5230-a277-dda89493df6d',
  '5355fee0-0477-5570-a234-561477bf77ba',
  '677a192d-8bbe-57fc-bb7a-1c1ed5fba32b',
  '72effc66-87f4-5f5e-8d36-1547677365fb',
  'd2e6f87d-795b-5631-a7cc-0bfb5dc5142e',
  'd61ea362-f6c3-5eab-ac30-2d0e265ac0f6',
  'd8b2b349-b83a-5225-a180-1afe205750cd',
  'e5bc2227-d900-585f-8ac0-9d3f1cb40e27',
]
// Approved final diode/astronomy splits: exactly eight children replace three
// mixed content leaves, and six new singleton-coverage assessment tasks are added.
const FINAL_SPLIT_CHILD_IDS = [
  '2084b7d4-300d-5fa0-8b8d-c480c40f853e',
  '3857891b-d328-585b-9936-85c7aff122ee',
  '3b586f2a-60e2-5019-aa08-6a47616a1f1f',
  '49bb609a-bfb7-5391-9120-f5fc737efb9a',
  '6dca3b0a-c872-543b-808f-97e855f5fafd',
  '6a73cacc-e86d-5248-a180-fd3da8454b0f',
  '3a4b2f86-5c59-5429-8fb4-75d9b2589cb5',
  '946ecf7b-0fcf-5776-9fb6-d397423c2f12',
]
const SEMICONDUCTOR_ADDED_GOAL_IDS = [
  '9f265f49-1342-5ba7-9c5d-54e97fdb2f19', // Elementary carrier/doping model.
  'dc55adac-91a5-5cc3-ab47-be008480616f', // Functional diode curve and polarity.
  '77ab31a9-8961-511c-8637-06e98023d869', // Actual transistor construction and investigation.
]
const SEMICONDUCTOR_ADDED_PROFILE_TARGET_IDS = [
  ...SEMICONDUCTOR_ADDED_GOAL_IDS,
  'df010b2b-b182-5f7e-bbe4-49b72e48c27a', // Explicit advanced target accompanying its relocated band assessment.
]
const SEMICONDUCTOR_ADDED_SEKI_ROUTE_TARGET_IDS = [
  ...SEMICONDUCTOR_ADDED_GOAL_IDS,
  '7badac4d-2874-5b3a-87e8-bf8f4440b2a6', // Existing qualitative classification, now explicit lower-stage target.
]
const SEMICONDUCTOR_ASSESSMENT_COVERAGE = new Map([
  ['a8d99168-62cc-5771-bb5d-9ba833d84193', SEMICONDUCTOR_ADDED_GOAL_IDS[0]],
  ['8670cff6-fe9c-5f7e-8cba-d170134965a6', SEMICONDUCTOR_ADDED_GOAL_IDS[1]],
  ['2cfd5c6a-a16a-5f90-aab7-b27b29271f72', SEMICONDUCTOR_ADDED_GOAL_IDS[2]],
])
const FINAL_SPLIT_PARENT_CHILDREN = new Map([
  ['7f0798cb-5966-5dcb-beb3-84f637ab6139', [SEMICONDUCTOR_ADDED_GOAL_IDS[1], ...FINAL_SPLIT_CHILD_IDS.slice(0, 3)]],
  ['5b8eaf71-96fe-50eb-b9ea-a8fa392df086', FINAL_SPLIT_CHILD_IDS.slice(3, 5)],
  ['f67550ac-df22-5a3e-8172-f04642efca64', FINAL_SPLIT_CHILD_IDS.slice(5, 8)],
])
const FINAL_SPLIT_ASSESSMENT_COVERAGE = new Map([
  ['c61b2a69-b5cd-5785-bb04-5d6bca53b218', FINAL_SPLIT_CHILD_IDS[0]],
  ['4ac5a07c-fff0-5eae-890d-89e13eaf69c3', FINAL_SPLIT_CHILD_IDS[1]],
  ['18fb1470-5a03-5277-9486-ae74c63c8a8c', FINAL_SPLIT_CHILD_IDS[2]],
  ['dfeda6e5-3256-557c-a706-bec0d0c89ff4', FINAL_SPLIT_CHILD_IDS[5]],
  ['092017a7-1ce1-54b7-a14c-1658b72d70a7', FINAL_SPLIT_CHILD_IDS[6]],
  ['027d25fc-b609-5383-ac44-5dd3327ca577', FINAL_SPLIT_CHILD_IDS[7]],
])
// Actual learner-facing occurrences across all 106 Physics Sek-I route contexts.
// The four new goals contribute 24 motion-law, 24 signed-area, 6 fall-comparison
// and 12 velocity-vector occurrences in the reviewed state views.
// The diagnostic selector still includes 8,739. All 494 outside it enter CQR-104.
const EXPECTED_PHYSICS_SEKI_PROJECTED_ROUTE_TARGET_OCCURRENCES = 9233
const EXPECTED_PHYSICS_SEKI_PROFILE_SELECTED_TARGET_OCCURRENCES = 8739
const EXPECTED_PHYSICS_SEKI_PROFILE_SELECTOR_EXCLUDED_OCCURRENCES = 494
const EXPECTED_PHYSICS_SEKI_PROFILE_SELECTOR_EXCLUDED_UNIQUE_GOALS = 61
const EXPECTED_PHYSICS_SEKI_ADDED_TARGET_OCCURRENCES = new Map([
  [FINAL_SPLIT_CHILD_IDS[0], 30], // p-n model: 25 prior + 5 new lower-view occurrences
  [FINAL_SPLIT_CHILD_IDS[1], 24], // diode experiment: 20 + 4
  [FINAL_SPLIT_CHILD_IDS[2], 12], // rectifier: 10 + 2
  ['7d4d6a39-0c78-5fb0-b7bf-182ed00972f7', 6], // transistor: 5 + 1
  ['68034218-8f3e-5f7f-ae4e-ed057dd4e44e', 6], // reactor: 5 + 1
])

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

const currentRelationRecheckGoalIds = new Set(readJson<{
  resolutions: Array<{ goalId: string }>
}>(
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/'
  + '2026-10-17/existing-math-prerequisites-current-v1/resolution-index.json',
).resolutions.map(({ goalId }) => goalId))
assert.equal(currentRelationRecheckGoalIds.size, 128, 'the current relation recheck binds exactly 128 Physics goals')

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

// The reviewed stage-plan repairs retain their explicit practice classification,
// including pure task containers with nested assessment subtrees.
const STAGE_PLAN_PRACTICE_GOAL_IDS = new Set([
  '3b7b2b62-e39c-5936-b0d8-5406206e57b6', // Zwei Linsenaugen konstruieren und simulieren
  '57a03b38-5ec5-5e4f-b71a-4024bab1584c', // Zwei astronomische Beobachtungsfälle
  '797f5e93-b5fd-5ee3-9fb2-fcc9e1d12a00', // Zwei Zerfallsreihen prüfen
  '7cfaf48e-e420-5c09-8ec2-932f0dba4d08', // Zwei Untersuchungen dokumentieren
  '884bd99b-2373-5174-af7c-c6813b91bd93', // Zwei Ruheenergie-Systemvergleiche
  'bff1d8b0-fe2e-52e6-a467-dd0b6a1a4a04', // Zwei elektromagnetische Anwendungsspektren
  'e6a89922-75ce-53dd-9e7b-3a683398431c', // Zwei eigene Motoraufbauten
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691', // Zwei eigene freie Fallversuche
  'f602680f-ea75-5bed-ae87-72f6be34a99b', // Zwei ideale Transformatorfälle
  '85bbad98-2f48-5d64-85c4-ab6cf67f24c2', // Übungen Q4
  '020e9dd3-7f3d-55d8-bcdd-a8da0f779cdf', // Prüfungsaufgabe: Befund und physikalische Deutung trennen
  '2ff1abd4-1399-5e5a-aa91-7c6948e77ed1', // Prüfungsaufgabe: Gemeinsame SI-Bezüge sinnvoll nutzen
  'e5504ffe-b83f-50cd-87bb-2538ae0bfb75', // Prüfungsaufgabe: Zwei Modelle nutzen und begrenzen
  '84d4167d-415b-5c06-9d1f-23200b793837', // Prüfungsaufgabe: Quellen fachlich ordnen und prüfen
  'c19d58dc-2c6e-53a9-8c74-991b55e6f2d0', // Prüfungsaufgabe: Eigene Stromverstärkermessungen begründet auswerten
  'a6f40821-695f-5c38-a572-3bc912e3d8e7', // Prüfungsaufgabe: Brechung und scheinbare Lage in drei Anordnungen
  '2437c7ee-3d59-544a-b9a0-8c5de0af54ad', // Prüfungsaufgabe: Reelle und virtuelle Linsenbilder selbst konstruieren
  'a344295c-c346-58ea-8c69-f3e9caa9c7b6', // Messwerte: Änderungen im passenden Zeitintervall
  'cd182a3c-be23-5f5a-87f6-0898ea16cb74', // Eigene Bewegungsmessung und unabhängiges Geschwindigkeitsprotokoll
  'a8dc0290-9f80-5763-8943-e16b8d2aa860', // Beschleunigungsprotokoll: Geschwindigkeit, Ort und Modellgrenzen
  '28884133-b448-5eb2-a589-8907a78d7687', // Stromstärke: Nettoänderung, Puls und Zyklus
  '6345871e-eab4-59c1-a3b6-8456ab9bd7df', // Videoanalyse: eigene Kalibrierung und unabhängiger Wurftransfer
  'fbaeed34-81a0-5955-9777-bf103002feee', // Prüfungsaufgabe: Geschwindigkeitspfeile in einem echten Bewegungsvideo konstruieren
  '7c2a3450-9b82-54e6-b302-358a964b34ec', // Prüfungsaufgabe: Einen angeleiteten Beschleunigungsversuch planen, durchführen und vergleichen
  '04f643c6-74f5-56e9-a9c7-ea39ae98db31', // Prüfungsaufgabe: Zwei eigene Linse-Schirm-Untersuchungen begründet vergleichen
  '716acf20-d882-5152-9735-099876d631b4', // Prüfungsaufgabe: Coulombkräfte und Quellenfeld in zwei Fällen begründen
  'a0f83a92-bf9e-5325-a914-4b5f09ac67e7', // Prüfungsaufgabe: Eigene Augenauflösung unter zwei Bedingungen untersuchen
  '8939373f-a243-54e4-99c6-7a18f212edcf', // Prüfungsaufgabe: Ladung trennen und beim Ausgleich erhalten
  '4ad7303d-22ad-56e6-aee0-f05b2ca42a07', // Gemeinsame Grundlagen- und Methodenübungen
  '8e5c7195-eb30-55c1-a19a-630742620ba0', // Eigenständige Methodenübungen der E-Phase
  '5630f93b-82ce-5d76-a781-31accc6854e9', // Grundlagenaufgaben zu Sonnensystem und Galaxien
  '14cc61c4-4909-5671-b1ee-930a02cb9f51', // Sonnensystem: Rollen und Umlaufstruktur in zwei Fällen
  '50521f0d-71b1-51cf-b30d-650e3abf3036', // Sternsysteme und Galaxien in zwei Kontexten einordnen
  '0521c3ce-999b-5b35-bb3c-7042f24a30ce', // Prüfungsaufgabe: Messreihen, Unsicherheit und Gerätewahl
  'de1ed3f0-80b2-5544-9971-c8392f76a3e8', // Prüfungsaufgabe: Zwei Messkurven linearisieren
  '3791c574-2194-52fa-846b-ee1d4e2c5877', // Prüfungsaufgabe: Zwei Bewegungsmodelle in der Tabellenkalkulation
  'b4175564-4397-5c08-90ba-4f13231a75ec', // Feldbilder und Magnetfeldmodelle eigenständig anwenden
  'e0932fef-9e1c-5c95-b00c-7589e76d0e83', // Flussänderung und technische Induktion eigenständig erklären
  '7bdd1853-164e-54ca-8255-497ea8edd1f1', // Messgenauigkeit untersuchen
  'cc308bcc-435b-527d-b898-efafdf47c48a', // Messdaten und Bewegungen digital modellieren
  '2a5dfdf6-73e7-5336-a37f-cbf2dabec55e', // Magnetfelder und Induktion anwenden
])

const explicitClassification = (
  goal: CanonicalAuthoringGoal,
  reviewedAtomicGoalIds: ReadonlySet<string>,
  goalsById: ReadonlyMap<string, CanonicalAuthoringGoal>,
  parentIdsByChild: ReadonlyMap<string, string[]>,
): Pick<SemanticKindDecision, 'semanticKind' | 'decisionBasis'> => {
  if (reviewedAtomicGoalIds.has(goal.id)) {
    if (currentRelationRecheckGoalIds.has(goal.id)) {
      return {
        semanticKind: 'curricularAtomic',
        decisionBasis: 'reviewed-current-semantic-recheck-curricular-atomic',
      }
    }
    return {
      semanticKind: 'curricularAtomic',
      decisionBasis: STRUCTURAL_SPLIT_ATOMIC_GOAL_IDS.has(goal.id)
        && !['5e9cd796-3887-5457-8a1f-26863ca7eb28', '6f896466-e0ec-5f8d-82ad-2890433c82ba'].includes(goal.id)
        ? 'reviewed-current-structural-split-curricular-atomic'
        : new Set([
          ...FINAL_SPLIT_CHILD_IDS,
          'd8b2b349-b83a-5225-a180-1afe205750cd', // Independently reviewed own transistor experiment.
          '13b338eb-f761-5817-9058-11043b9cb253', // Measurement-rate preparation atom.
          'd61ea362-f6c3-5eab-ac30-2d0e265ac0f6', // Video velocity acquisition.
          '677a192d-8bbe-57fc-bb7a-1c1ed5fba32b', // Guided acceleration experiment.
          '7d4d6a39-0c78-5fb0-b7bf-182ed00972f7', // Narrowed prerequisite: pn model only.
          // Final astronomy package: four operationalised descriptions and one narrowed prerequisite.
          '4c5c7cb1-f238-52c8-b82c-159c6c299c0e',
          'db6b8de4-21e0-58e8-a347-2ae39f538f92',
          '5e9cd796-3887-5457-8a1f-26863ca7eb28',
          '6f896466-e0ec-5f8d-82ad-2890433c82ba',
          'e2014db8-c97f-5ce1-82c5-2a42741f4a61',
          '5a951a0b-fd6c-51a1-9ffb-2a34ed6d3931', // B039: rotational energy, separated from mean torque.
          'c2c3cdc5-3e87-47c4-89fd-4eb2c5c2f2ea', // B039: independent mean-torque goal.
          // B040: seven separately assessable competencies replace three compound leaves.
          'af5dfdbc-5fd6-5c3e-a81b-093cb7c14b93',
          '37013646-f13a-5faf-954c-940f2fd7502f',
          'c52d55c3-b687-586c-b0f9-8ffcd1069424',
          '3d466956-04fb-58d7-9008-ad8090f8706d',
          'b4772b06-b10c-52dd-841b-a96ffb7c7e28',
          '1b060e79-dc2d-5e4e-abb5-42eca39f9cc7',
          'db0394ca-297c-5892-b414-525ec186f928',
        ]).has(goal.id)
          ? 'reviewed-current-post-split-curricular-atomic'
          : SEMANTIC_RECHECK_ATOMIC_GOAL_IDS.has(goal.id)
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
    if (goal.id === '151edbf8-eb68-5ef7-8786-43e56a281b0b') {
      assert.equal((goal.extendedData as Record<string, unknown>).applicabilityProjection, 'excluded')
      // Eighteen identities since 24 Nov 2026; the mixed E.1 exam joined on 25 Nov 2026.
      assert.equal(goal.contains.length, 19, 'the archive keeps all nineteen original assessment identities')
      assert(goal.contains.every(id => goalsById.get(id)?.examData),
        'each child of the retained assessment collection must carry a scoring contract')
      return {
        semanticKind: 'practiceAssessment',
        decisionBasis: 'reviewed-current-pilot-practice-assessment',
      }
    }
    const isAssessmentSubtree = (goalId: string, ancestors = new Set<string>()): boolean => {
      const child = goalsById.get(goalId)
      assert(child, `missing practice subtree ${goalId}`)
      assert(!ancestors.has(goalId), `cyclic practice subtree ${goalId}`)
      if (child.examData !== undefined) return true
      const nextAncestors = new Set([...ancestors, goalId])
      return child.contains.length > 0
        && child.contains.every((id) => isAssessmentSubtree(id, nextAncestors))
    }
    if (goal.contains.every((goalId) => isAssessmentSubtree(goalId))) {
      return {
        semanticKind: 'practiceAssessment',
        decisionBasis: STAGE_PLAN_PRACTICE_GOAL_IDS.has(goal.id)
          ? 'reviewed-current-post-split-practice-assessment'
          : 'reviewed-current-pilot-practice-assessment',
      }
    }
    return {
      semanticKind: 'curricularArea',
      decisionBasis: STRUCTURAL_SPLIT_CLUSTER_GOAL_IDS.has(goal.id)
        ? 'reviewed-current-structural-split-curricular-area'
        : new Set([
          ...FINAL_SPLIT_PARENT_CHILDREN.keys(),
          '9743baad-9371-52b6-98ee-72bc6dc68701',
          'c9405043-bdc0-5995-8b4d-5bb56d97d05d',
          'e5b3d86c-0a74-5fa7-b9c4-7964bcb5ebc9',
          '5db07785-8cca-50d5-81a9-e0264d344af9',
        ]).has(goal.id)
          ? 'reviewed-current-post-split-curricular-area'
          : 'reviewed-current-pilot-curricular-area',
    }
  }
  if (
    goal.type === 'atomic'
    && goal.contains.length === 0
    && goal.examData !== undefined
    && (goal.nodeKind === undefined || (goal.nodeKind === 'exam' && HESSE_E1_ASSESSMENT_IDS.has(goal.id)))
  ) {
    return {
      semanticKind: 'practiceAssessment',
      decisionBasis: (POST_SPLIT_PRACTICE_ASSESSMENT_GOAL_IDS.has(goal.id)
        || STAGE_PLAN_PRACTICE_GOAL_IDS.has(goal.id)
        || FINAL_SPLIT_ASSESSMENT_COVERAGE.has(goal.id)
        || SEMICONDUCTOR_ASSESSMENT_COVERAGE.has(goal.id)
        || ['0f5346d6-de1b-5e38-aaba-68db205e594b', '4a58df57-f791-502f-8b8d-9ba155e46035', 'f61c424e-f091-5f9d-9d58-c1bd29733fc8'].includes(goal.id))
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
  includeAcquisitionPlacements = true,
): AuthoredPrerequisiteRoot[] => {
  const result: AuthoredPrerequisiteRoot[] = []
  const visit = (node: CompositionViewNode) => {
    if (node.kind === 'structure') {
      node.children.forEach(visit)
      return
    }
    if (node.kind === 'landscapeEntry') return
    if (node.projectionRole === 'prerequisiteOnly'
      && (includeAcquisitionPlacements || node.kind !== 'goalEntry' || node.acquisitionPlacement !== true)) {
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
const rawMathLandscape = readJson<Record<string, unknown> & { goals: Array<Record<string, unknown>> }>(MATH_LANDSCAPE_PATH)
const rawChemistryLandscape = readJson<Record<string, unknown> & { goals: Array<Record<string, unknown>> }>(CHEMISTRY_LANDSCAPE_PATH)
const mathLandscape = normalizeCanonicalLandscape(rawMathLandscape)
const chemistryLandscape = normalizeCanonicalLandscape(rawChemistryLandscape)
const preparationLandscape = {
  ...rawLandscape,
  goals: [...rawLandscape.goals, ...rawMathLandscape.goals, ...rawChemistryLandscape.goals],
} as unknown as SkillLandscape
assert.equal(new Set(preparationLandscape.goals.map(({ id }) => id)).size, preparationLandscape.goals.length,
  'the full Physics/Math/Chemistry preparation universe must have unique goal IDs')

function assertReviewedPreparation(
  assessmentId: string,
  reviewedRequires: string[],
  currentLandscape: SkillLandscape = preparationLandscape,
): void {
  assert(currentLandscape.goals.some(({ id }) => id === assessmentId), `missing assessment ${assessmentId}`)
  const expectedLandscape = {
    ...currentLandscape,
    goals: currentLandscape.goals.map((goal) => goal.id === assessmentId
      ? { ...goal, requires: reviewedRequires }
      : goal),
  }
  const current = collectWholeMaterialPrerequisiteClosure(currentLandscape, assessmentId)
  const reviewed = collectWholeMaterialPrerequisiteClosure(expectedLandscape, assessmentId)
  assert.deepEqual([...current.unresolvedReferences], [], `${assessmentId}: unresolved current preparation`)
  assert.deepEqual([...reviewed.unresolvedReferences], [], `${assessmentId}: unresolved reviewed preparation`)
  assert.deepEqual([...current.atomicGoalIds].sort(compareCodePoints), [...reviewed.atomicGoalIds].sort(compareCodePoints),
    `${assessmentId}: full atomic preparation must match its reviewed requirement seeds`)
}

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
// Actual blind review receipts bind exact scored payloads. A useful prerequisite
// or directly graded domain never implies a whole-goal or planning credit.
const currentExamEvidenceRoot = 'curricula/DE/Gymnasium/quality/assessment-review/physik/e1-current-assessments-20261124-v1/'
interface ActualExamReview {
  goalId: string; candidateDecision: string; recommendedRequires: string[]
  recommendedCoveredGoalIds: string[]; recommendedPassingPoints: number
}
function assertActualExamRounds(roundFolder: string, ids: string[]): Map<string, ActualExamReview[]> {
  const reviews = new Map<string, ActualExamReview[]>(ids.map(id => [id, []]))
  const threads: string[] = []
  for (const [round, model] of [['a', 'gpt-6.1-sol'], ['b', 'gpt-6.2-astra']]) {
    const dir = `${roundFolder}/round-${round}/`
    const run = readJson<{ model: string; reasoningEffort: string; threadId: string; exitCode: number
      sandbox: { type: string }; blindToOtherRun: boolean
      inputArtifacts: Array<{ path: string; sha256: string; capsulePath?: string }>
      outputArtifacts: Array<{ path: string; sha256: string }> }>(`${dir}run.actual.json`)
    assert.equal(run.model, model)
    assert.equal(run.reasoningEffort, 'ultra')
    assert.equal(run.sandbox.type, 'read-only')
    assert.equal(run.exitCode, 0)
    assert.equal(run.blindToOtherRun, true)
    threads.push(run.threadId)
    for (const artifact of [...run.inputArtifacts, ...run.outputArtifacts]) {
      const path = 'capsulePath' in artifact ? artifact.path : `${dir}${artifact.path}`
      assert.equal(createHash('sha256').update(readFileSync(resolve(repoRoot, path))).digest('hex'), artifact.sha256,
        `${dir}: actual review artifact changed: ${artifact.path}`)
    }
    const events = readFileSync(resolve(repoRoot, `${dir}events.jsonl`), 'utf8').trim().split('\n')
      .map(line => JSON.parse(line) as { type: string; thread_id?: string })
    assert.equal(events[0].thread_id, run.threadId)
    assert.equal(events.at(-1)?.type, 'turn.completed')
    const result = readJson<{ reviews: ActualExamReview[] }>(`${dir}response.json`)
    for (const id of ids) {
      const row = result.reviews.filter(review => review.goalId === id)
      assert.equal(row.length, 1)
      reviews.get(id)!.push(row[0])
    }
  }
  assert.notEqual(threads[0], threads[1], 'independent review sessions must be disjoint')
  return reviews
}
const mpId = '2b9e565f-d9b4-5e23-b5b7-b7977cecff06'
const mpReviewRows = assertActualExamRounds(currentExamEvidenceRoot + 'round1', [mpId]).get(mpId)!
const mpReceipt = readJson<{ status: string; currentGoalPath: string; currentRawSha256: string }>(
  `${currentExamEvidenceRoot}mp-current/activation.actual.json`)
assert.equal(mpReceipt.status, 'APPLIED_REVIEWED_CONTENT_WITH_OPEN_CQR203_COVERAGE_GATE')
assert.equal(sha256(readFileSync(resolve(repoRoot, mpReceipt.currentGoalPath), 'utf8')), mpReceipt.currentRawSha256)
const mpCurrent = rawGoalById.get(mpId)!
assert.deepEqual(mpCurrent, {
  ...readJson<Record<string, unknown>>(mpReceipt.currentGoalPath),
  applicability: {},
  extendedData: { applicabilityProjection: 'excluded', applicabilityMappingInheritance: 'boundary' },
}, 'historical passes retain the entire original reviewed exam and scoring contract')
const proposedMpId = '05cfd298-cb80-54c4-a898-b521ef270843'
assert(!rawGoalById.has(proposedMpId), 'both final reviews require a rubric revision before this identity can be offered')
const mpDispositionDirectory = 'curricula/DE/Gymnasium/quality/assessment-review/physik/stage-source-route-repair-20261117-v1/e1-proposal-review-20261124/mp-revised-edition-v2'
for (const round of ['a', 'b']) {
  const result = readJson<{
    exactProposalDecision: string
    recommendedCoveredGoalIds: string[]
    semanticKindReviews: Array<{ scenario: string; goalId: string; semanticKind: string }>
  }>(`${mpDispositionDirectory}/round-${round}/response.json`)
  assert.equal(result.exactProposalDecision, 'revise')
  assert.deepEqual(result.recommendedCoveredGoalIds, [])
  const retained = result.semanticKindReviews.filter(row => row.scenario === 'STOP_NO_SUCCESSOR')
  assert.deepEqual(new Set(retained.map(row => row.goalId)), new Set([
    mpId, '151edbf8-eb68-5ef7-8786-43e56a281b0b', '424b07df-bf66-5d7f-99f5-f28b32ad1f22',
  ]))
  assert(retained.every(row => row.semanticKind === 'practiceAssessment'))
}
const mpParents = rawLandscape.goals.filter(goal => Array.isArray(goal.contains) && goal.contains.includes(mpId))
assert.deepEqual(mpParents.map(goal => goal.id), ['151edbf8-eb68-5ef7-8786-43e56a281b0b'])
assert.deepEqual(mpCurrent.requires, ['89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2', 'd6dc0e02-831d-4894-a61a-852bcc74f147'])
const mpExam = mpCurrent.examData as ExamData
assert.deepEqual(mpExam.coveredGoalIds, [])
assert.equal(mpExam.scoring!.maxPoints, 30)
assert.equal(mpExam.scoring!.passingPoints, 18)
for (const review of mpReviewRows) {
  assert.equal(review.candidateDecision, 'accept')
  assert.deepEqual(review.recommendedRequires, mpCurrent.requires)
  assert.deepEqual(review.recommendedCoveredGoalIds, [])
  assert.equal(review.recommendedPassingPoints, 18)
}
assertReviewedPreparation(mpId, ['89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2', 'd6dc0e02-831d-4894-a61a-852bcc74f147'])
const mpNativeGate = readJson<{ emptyMpCoverage: { id: string; status: string; details: string[] } }>(
  `${currentExamEvidenceRoot}native-contract/mp-empty-native.actual.json`)
assert.equal(mpNativeGate.emptyMpCoverage.id, 'CQR-203')
assert.equal(mpNativeGate.emptyMpCoverage.status, 'warn', 'an honest uncovered practice score must retain its native open coverage gate')
assert(mpNativeGate.emptyMpCoverage.details.some(detail => detail.includes(mpId) && detail.includes('missing coveredGoalIds')))
interface CurrentExamActivation {
  goals: Array<{ goalId: string; before: { path: string; sha256: string }
    reviewedCandidate: { path: string; sha256: string }; current: { path: string; sha256: string }
    postReviewMetadataOnlyDelta: string[] }>
}
interface PartialCreditDecision {
  goalId: string
  candidate: { path: string; sha256: string }
  currentGoalComparedTo: { path: string; sha256: string }
  reviewReceipts: Array<{ path: string; sha256: string }>
  judgments: Array<{ round: string; decision: string; eligibleForActivation: boolean; validationFindings: string[] }>
  eligibleForActivation: boolean
}
interface PartialCreditGrade {
  submissionId: string
  demonstratedCore: boolean
  scores: Array<{ criterionId: string; pointsAwarded: number }>
  total: number
  passes: boolean
}

function bindPartialCreditSuccessor(
  original: Record<string, unknown> & { examData: ExamData },
  id: string,
  dispositionPath: string,
  dispositionSha: string,
) {
  const directory = dispositionPath.slice(0, dispositionPath.lastIndexOf('/'))
  assert.equal(sha256(readFileSync(resolve(repoRoot, dispositionPath), 'utf8')), dispositionSha)
  const receipt = readJson<PartialCreditDecision>(dispositionPath)
  assert.equal(receipt.goalId, id)
  assert(receipt.eligibleForActivation)
  assert.deepEqual(receipt.judgments.map(r => r.round), ['a', 'b'])
  assert(receipt.judgments.every(r => r.decision === 'accept' && r.eligibleForActivation && !r.validationFindings.length))
  assert.deepEqual(receipt.reviewReceipts.map(row => row.path), ['a', 'b'].map(letter =>
    `${directory}/round-${letter}/run.actual.json`))
  for (const artifact of [receipt.currentGoalComparedTo, receipt.candidate, ...receipt.reviewReceipts]) {
    assert.equal(sha256(readFileSync(resolve(repoRoot, artifact.path), 'utf8')), artifact.sha256)
  }
  assert.deepEqual(readJson(receipt.currentGoalComparedTo.path), original)
  const current = readJson<typeof original>(receipt.candidate.path)
  const newEdition = id === currentThrowExamId
  assert.equal(original.id, newEdition ? historicalThrowExamId : id)
  assert.deepEqual({ ...original, id, examData: undefined }, { ...current, examData: undefined })
  if (newEdition) {
    for (const field of ['taskContent', 'taskContentEn'] as const) {
      const previousParts = original.examData[field]!.split('\n6. ')
      const currentParts = current.examData[field]!.split('\n6. ')
      assert.equal(previousParts.length, 2)
      assert.equal(currentParts.length, 2)
      assert.equal(currentParts[0], previousParts[0], 'the approved revision is confined to task 6')
      assert.notEqual(currentParts[1], previousParts[1])
    }
  }
  const scoring = current.examData.scoring
  assert(scoring && original.examData.scoring)
  assert.deepEqual({ ...current.examData, scoring: original.examData.scoring,
    ...(newEdition ? { taskContent: original.examData.taskContent, taskContentEn: original.examData.taskContentEn } : {}),
    solutionContent: original.examData.solutionContent, solutionContentEn: original.examData.solutionContentEn,
    ...(Object.hasOwn(original.examData, 'reviewNote') ? { reviewNote: original.examData.reviewNote } : {}) }, original.examData)
  assert.equal(scoring.maxPoints, original.examData.scoring.maxPoints)
  assert(scoring.passingPoints > 0 && scoring.passingPoints < scoring.maxPoints)
  const reviews = assertActualExamRounds(directory, [id]).get(id)!
  for (const [i, review] of reviews.entries()) {
    assert.equal(review.candidateDecision, 'accept')
    assert.deepEqual(review.recommendedRequires, current.requires)
    assert.deepEqual(review.recommendedCoveredGoalIds, current.examData.coveredGoalIds)
    assert.equal(review.recommendedPassingPoints, scoring.passingPoints)
    const letter = ['a', 'b'][i]
    const input = readJson<{ original: unknown; candidate: unknown }>(`${directory}/round-${letter}/canonical-input.json`)
    assert.deepEqual(input.original, original)
    assert.deepEqual(input.candidate, current)
    const delivery = readJson<{ reviews: Array<{ goalId: string; gradedSubmissions: PartialCreditGrade[] }> }>(
      `${directory}/round-${letter}/response.json`)
    const graded = delivery.reviews.find(r => r.goalId === id)!.gradedSubmissions
    assert.equal(graded.length, 2)
    assert.deepEqual(graded.map(g => g.submissionId).sort(), ['X', 'Y'])
    for (const grade of graded) {
      assert.deepEqual(grade.scores.map(row => row.criterionId).sort(), scoring.steps.map(step => step.id).sort())
      for (const row of grade.scores) {
        const step = scoring.steps.find(item => item.id === row.criterionId)!
        assert(Number.isFinite(row.pointsAwarded) && row.pointsAwarded >= 0 && row.pointsAwarded <= step.points)
      }
      assert.equal(grade.total, grade.scores.reduce((n, row) => n + row.pointsAwarded, 0))
      assert.equal(grade.passes, grade.total >= scoring.passingPoints)
      assert.equal(grade.demonstratedCore, grade.submissionId === (letter === 'a' ? 'X' : 'Y'))
      assert.equal(grade.passes, grade.demonstratedCore)
    }
  }
  return current
}

const partialCreditRounds = new Map<string, { version: string; dispositionSha256: string }>([
  ['dfd2628f-b44e-51b3-86e8-99158861be8c', { version: 'v4', dispositionSha256: 'f9ce0fd729a8f6a9bea3385bb2dcbdf7cb454aeb149a8a0a455bfdddabf7419b' }],
  ['a8dc0290-9f80-5763-8943-e16b8d2aa860', { version: 'v3', dispositionSha256: '7bd9a1fc4d27b7085b156a57dcca7d09a9f8a76990bfaac91681974bd58c0e7c' }],
  ['4ea1b93f-2dba-59ac-87ab-29af6c55cc37', { version: 'v4', dispositionSha256: 'fa55c7b482804b78fb1779ce07de652b9bdd5bb9046b5d618afb644a14ad9877' }],
])
const ffxBindingRoot = 'curricula/DE/Gymnasium/quality/assessment-review/physik/e1-ffx-zwei-messreihen-20261125-v2/'
const ffxSuccessor = readJson<{reviewPath: string; original: {path: string; sha256: string}; candidate: {path: string; sha256: string};
  supersedes: {path: string; sha256: string}}>(ffxBindingRoot + 'accepted.actual.json')
execFileSync('python3', [resolve(repoRoot, ffxBindingRoot, 'verify.py')], {cwd: repoRoot})
assert.equal(ffxSuccessor.supersedes.path, 'curricula/DE/Gymnasium/quality/assessment-review/physik/e1-ffx-zwei-messreihen-20261125-v1/parked.actual.json')
assert.equal(sha256(readFileSync(resolve(repoRoot, ffxSuccessor.supersedes.path), 'utf8')), ffxSuccessor.supersedes.sha256)
const ffxGoalId = 'f41e4e30-794e-5ce4-ba5e-cc72712cd691'
const acceptedFfxGoal = readJson<Record<string, unknown>>(ffxBindingRoot + ffxSuccessor.candidate.path)
assert.deepEqual(rawGoalById.get(ffxGoalId), acceptedFfxGoal, 'live scored goal must be the candidate both markers accepted')
assert.equal(ffxSuccessor.original.path, ffxSuccessor.reviewPath + '/original.goal.json')
const originalFfxBytes = readFileSync(resolve(repoRoot, ffxBindingRoot + ffxSuccessor.original.path), 'utf8')
assert.equal(sha256(originalFfxBytes), 'c7e5d36026233cd6d79d6226c4b8e2101e96774e8e1201b6123f2f79c05100e4')
assert.equal(ffxSuccessor.original.sha256, sha256(originalFfxBytes))
const beforeFfx = new Map(rawGoalById)
beforeFfx.set(ffxGoalId, JSON.parse(originalFfxBytes))
const beforeHeadings = beforeReleasedMarkingHeadings(repoRoot, beforeFfx)
const priorAchievableGoals = verifiedCoachScoringReviewChain(repoRoot, beforeHeadings, canonicalJson)
// The last reviewed experimental rubric had one dissent. Its complete scored payload must fail activation.
const withParkedExperiment = new Map(beforeHeadings)
withParkedExperiment.set(ffxGoalId, readJson<Record<string, unknown>>(
  `${achievableReviewRoot}/${ffxGoalId}/v24/candidate.goal.json`,
))
assert.throws(() => verifiedCoachScoringReviewChain(repoRoot, withParkedExperiment, canonicalJson),
  new RegExp(ffxGoalId + ': changed without two accepted reviews'))
const currentReviewedExams = new Map<string, { before: object; current: object }>()
function bindCurrentAssessmentSuccessors(round: string, expectedHashes: Record<string, string>): void {
  const rows = assertActualExamRounds(currentExamEvidenceRoot + round, Object.keys(expectedHashes))
  const receipt = readJson<CurrentExamActivation>(`${currentExamEvidenceRoot}${round}-activation.actual.json`)
  for (const [id, expectedHash] of Object.entries(expectedHashes)) {
    const binding = receipt.goals.find(row => row.goalId === id)
    assert(binding, `${id}: exact activation binding required`)
    for (const artifact of [binding.before, binding.reviewedCandidate, binding.current]) {
      assert.equal(sha256(readFileSync(resolve(repoRoot, artifact.path), 'utf8')), artifact.sha256)
    }
    assert.equal(binding.current.sha256, expectedHash, `${id}: unreviewed scored payload mutation`)
    const before = readJson<Record<string, unknown>>(binding.before.path)
    const candidate = readJson<Record<string, unknown> & { examData: ExamData }>(binding.reviewedCandidate.path)
    const current = readJson<Record<string, unknown> & { examData: ExamData }>(binding.current.path)
    const expected = structuredClone(candidate)
    if (id === '4ea1b93f-2dba-59ac-87ab-29af6c55cc37') {
      assert.deepEqual(binding.postReviewMetadataOnlyDelta, ['examData.reviewStatus', 'examData.reviewNote'])
      assert.equal(current.examData.reviewStatus, 'released')
      expected.examData.reviewStatus = current.examData.reviewStatus
      expected.examData.reviewNote = current.examData.reviewNote
    } else assert.deepEqual(binding.postReviewMetadataOnlyDelta, [])
    assert.deepEqual(current, expected, `${id}: only declared release metadata may follow exact reviewed scoring`)
    for (const review of rows.get(id)!) {
      assert.equal(review.candidateDecision, 'accept')
      assert.deepEqual(review.recommendedRequires, current.requires)
      assert.deepEqual(review.recommendedCoveredGoalIds, current.examData.coveredGoalIds)
      assert.equal(review.recommendedPassingPoints, current.examData.scoring!.passingPoints)
    }
    const partial = partialCreditRounds.get(id)
    if (id === historicalThrowExamId) {
      const successor = bindPartialCreditSuccessor(current, currentThrowExamId,
        'curricula/DE/Gymnasium/quality/assessment-review/physik/e1-partial-credit-20261124-v1/6ea3fb3c-abdc-568f-ab13-97c36dc274e4/v2-new-identity/review-disposition.actual.json',
        '1c3657ba3883f9bc39b6c92c557dc191c317c69bf5f219126471331b243f4dde')
      const formerPublishedGoal = readJson<Record<string, unknown>>(
        'contracts/stage-plan-review-evidence/2026-11-24/e1-zb-assessment-identity/historical-base22.goal.json')
      assert.deepEqual(rawGoalById.get(id), {
        ...formerPublishedGoal, applicability: {},
        extendedData: { applicabilityProjection: 'excluded', applicabilityMappingInheritance: 'boundary' },
      })
      assert.deepEqual(parentIdsByChild.get(id), ['151edbf8-eb68-5ef7-8786-43e56a281b0b'])
      assert.deepEqual(priorAchievableGoals.get(currentThrowExamId), successor)
      assert.deepEqual(parentIdsByChild.get(currentThrowExamId), ['424b07df-bf66-5d7f-99f5-f28b32ad1f22'])
      currentReviewedExams.set(id, { before, current: rawGoalById.get(currentThrowExamId)! })
      continue
    }
    const active = partial
      ? bindPartialCreditSuccessor(current, id,
        `curricula/DE/Gymnasium/quality/assessment-review/physik/e1-partial-credit-20261124-v1/${id}/${partial.version}/review-disposition.actual.json`,
        partial.dispositionSha256)
      : current
    assert.deepEqual(priorAchievableGoals.get(id) ?? rawGoalById.get(id), active)
    currentReviewedExams.set(id, { before, current: rawGoalById.get(id)! })
  }
}
bindCurrentAssessmentSuccessors('round3', {
  'a8dc0290-9f80-5763-8943-e16b8d2aa860': '78fc60eb42b54c884c7a8499ab549b028455a41cffc505c820b01583639f80db',
  'dfd2628f-b44e-51b3-86e8-99158861be8c': '3d698f7e9c16a0e7837be0b796e8e1cc8d92c99cd16960e4946f8968303a72ea',
  '6ea3fb3c-abdc-568f-ab13-97c36dc274e4': '7403d384a8e1b459410f1f545d1b9cefb0469cceef70663743bbc797ec65b874',
})
bindCurrentAssessmentSuccessors('round2', {
  'f13ca187-b680-5f47-b4ad-76bd474bd8a2': 'e12d8bcafaa2bcd824b76bbab56e63ed7d3ef87044eafaa24f30f877a4e3683f',
  '4ea1b93f-2dba-59ac-87ab-29af6c55cc37': 'aa29afc76356544e72b2deafc87cbe175d907592c17a7e94cb40644e6ceddcb6',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691': 'c7e5d36026233cd6d79d6226c4b8e2101e96774e8e1201b6123f2f79c05100e4',
})
// These assertions reproduce the predecessor's grading. The successor gate above scores every audit submission.
const dfdExam = priorAchievableGoals.get('dfd2628f-b44e-51b3-86e8-99158861be8c')!.examData
assert.deepEqual(dfdExam.coveredGoalIds, ['4a2bf015-052b-4af0-aed7-324259fa1a8a'])
assert.equal(dfdExam.scoring.maxPoints, 16)
assert.equal(dfdExam.scoring.passingPoints, 15.5)
for (const step of dfdExam.scoring.steps) assert(dfdExam.scoring.maxPoints - step.points < dfdExam.scoring.passingPoints,
  'DFD cannot pass while omitting its traffic assessment or projectile part')
const nvxId = '4ea1b93f-2dba-59ac-87ab-29af6c55cc37'
const nvxGoal = rawGoalById.get(nvxId)!
const nvxExam = priorAchievableGoals.get(nvxId)!.examData
assert.deepEqual(nvxGoal.requires, ['0fee53f2-1c02-5b12-9b6c-aa9fa462d921'])
assertReviewedPreparation(nvxId, ['0fee53f2-1c02-5b12-9b6c-aa9fa462d921'])
assert.deepEqual(nvxExam.coveredGoalIds, ['0fee53f2-1c02-5b12-9b6c-aa9fa462d921'], 'using assigned frames does not assess BZ frame selection')
assert.equal(nvxExam.scoring!.maxPoints, 16)
assert.equal(nvxExam.scoring!.passingPoints, 15.5)
for (const step of nvxExam.scoring!.steps) assert(nvxExam.scoring!.maxPoints - step.points < nvxExam.scoring!.passingPoints,
  'NVX cannot pass while omitting a scored vector or assigned-frame performance')
const ownTaskActivation = readJson<{ tasks: Array<{
  id: string; releasedPath: string; releasedSha256: string; contentReview: string
  sourceArtifactPath: string; sourceArtifactSha256: string; offeredJurisdictions: string[]
}> }>('curricula/DE/Gymnasium/quality/assessment-review/physik/stage-source-route-repair-20261117-v1/nine-offers-activation.actual.json')
const coveredStrandsFollowup = readJson<{
  schema: string; status: string; independentPriorApproval: { reviewer: string }
  changes: Array<{ goalId: string; beforeGoalPath: string; beforeGoalSha256: string
    currentGoalPath: string; currentGoalSha256: string
    allowedDelta: { path: string; before: string[]; after: string[] } }>
}>('curricula/DE/Gymnasium/quality/assessment-review/physik/stage-source-route-repair-20261117-v1/metadata-followup/covered-strands-20261117-v1.actual.json')
assert.equal(coveredStrandsFollowup.schema, 'metadata-only-assessment-covered-strands-followup-v1')
assert.equal(coveredStrandsFollowup.status, 'APPLIED_APPROVED_METADATA_ONLY')
assert.equal(coveredStrandsFollowup.independentPriorApproval.reviewer, '/root')
assert.deepEqual(coveredStrandsFollowup.changes.map(change => change.goalId).sort(compareCodePoints), [
  'a8dc0290-9f80-5763-8943-e16b8d2aa860', '7cfaf48e-e420-5c09-8ec2-932f0dba4d08',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691',
].sort(compareCodePoints))
// Validate the historical strand-only payload first, then apply the two
// independently reviewed E.1 changes to a copy. Every other field stays pinned.
const saxonAccelerationExam = 'a8dc0290-9f80-5763-8943-e16b8d2aa860'
const saxonFreeFallExam = ffxGoalId
const e1StageReview = readJson<{ schema: string; status: string; goalBindings: Array<{
  goalId: string; currentGoalPath: string; currentGoalSha256: string; previousGoalPath: string; previousGoalSha256: string
  allowedDeltas: Array<{ path: string; before: string[]; after: string[] }>; reviewScope: { jurisdictions: string[] }
}> }>('curricula/DE/Gymnasium/quality/assessment-review/physik/stage-source-route-repair-20261117-v1/e1-stage-20261124/sn/review.actual.json')
assert.equal(e1StageReview.schema, 'independent-e1-saxon-source-stage-assessment-supersession-v1')
assert.equal(e1StageReview.status, 'PASS')
assert.deepEqual(e1StageReview.goalBindings.map(row => row.goalId).sort(compareCodePoints), [saxonAccelerationExam, saxonFreeFallExam])
const currentRelease = (id: string, historical: object): object => {
  const row = e1StageReview.goalBindings.find(binding => binding.goalId === id)
  if (!row) return historical
  const previous = coveredStrandsFollowup.changes.find(change => change.goalId === id)!
  assert.equal(row.previousGoalPath, previous.currentGoalPath)
  assert.equal(row.previousGoalSha256, previous.currentGoalSha256)
  assert.deepEqual(historical, readJson(row.previousGoalPath))
  assert.deepEqual(row.reviewScope.jurisdictions, ['DE-SN'])
  const deltas = id === saxonAccelerationExam
    ? [{ path: 'requires', before: ['e4b38061-1f28-43ad-8371-a3e7c0e81856'], after: ['262f807a-30d0-503e-986f-856cbd048e8e'] }]
    : ['applicability.jurisdiction', 'extendedData.applicabilityOverrides.jurisdiction'].map(path => ({ path, before: ['DE-SN'], after: ['DE-HE', 'DE-SN'] }))
  assert.deepEqual(row.allowedDeltas, deltas)
  const expected = structuredClone(historical) as Record<string, unknown>
  for (const delta of deltas) {
    const keys = delta.path.split('.')
    const field = keys.pop()!
    const parent = keys.reduce((node, key) => node[key] as Record<string, unknown>, expected)
    assert.deepEqual(parent[field], delta.before)
    parent[field] = delta.after
  }
  assert.equal(sha256(readFileSync(resolve(repoRoot, row.currentGoalPath), 'utf8')), row.currentGoalSha256)
  assert.deepEqual(readJson(row.currentGoalPath), expected)
  const successor = currentReviewedExams.get(id)
  if (successor) {
    assert.deepEqual(successor.before, expected, `${id}: successor must start at the exact immutable Task4 payload`)
    return successor.current
  }
  return expected
}
for (const change of coveredStrandsFollowup.changes) {
  assert.deepEqual(change.allowedDelta, { path: 'examData.coveredStrands', before: [], after: ['LI_BEWEGUNG'] })
  assert.equal(sha256(readFileSync(resolve(repoRoot, change.beforeGoalPath), 'utf8')), change.beforeGoalSha256)
  assert.equal(sha256(readFileSync(resolve(repoRoot, change.currentGoalPath), 'utf8')), change.currentGoalSha256)
  const expected = readJson<{ examData: { coveredStrands: string[] } }>(change.beforeGoalPath)
  assert.deepEqual(expected.examData.coveredStrands, [])
  expected.examData.coveredStrands = ['LI_BEWEGUNG']
  assert.deepEqual(readJson(change.currentGoalPath), expected, `${change.goalId}: no other field may change in the followup`)
  assert.deepEqual(rawGoalById.get(change.goalId), currentRelease(change.goalId, expected), `${change.goalId}: exact separately approved current payload`)
}
assert.deepEqual(ownTaskActivation.tasks.map(task => task.id).sort(compareCodePoints), [
  '3b7b2b62-e39c-5936-b0d8-5406206e57b6', '57a03b38-5ec5-5e4f-b71a-4024bab1584c',
  '797f5e93-b5fd-5ee3-9fb2-fcc9e1d12a00', '7cfaf48e-e420-5c09-8ec2-932f0dba4d08',
  '884bd99b-2373-5174-af7c-c6813b91bd93', 'bff1d8b0-fe2e-52e6-a467-dd0b6a1a4a04',
  'e6a89922-75ce-53dd-9e7b-3a683398431c', 'f41e4e30-794e-5ce4-ba5e-cc72712cd691',
  'f602680f-ea75-5bed-ae87-72f6be34a99b',
].sort(compareCodePoints), 'exact nine independently reviewed own task offerings')
for (const row of ownTaskActivation.tasks) {
  const task = rawGoalById.get(row.id)
  assert(task, `${row.id}: released own assessment exists`)
  const acceptedRelease = readJson<{ examData: { coveredStrands: string[] } }>(row.releasedPath)
  const followup = coveredStrandsFollowup.changes.find(change => change.goalId === row.id)
  if (followup) {
    assert.deepEqual(acceptedRelease, readJson(followup.beforeGoalPath), `${row.id}: followup starts at the exact original release`)
    acceptedRelease.examData.coveredStrands = ['LI_BEWEGUNG']
  }
  assert.deepEqual(task, currentRelease(row.id, acceptedRelease), `${row.id}: exact accepted release and reviewed successors`)
  assert.equal(sha256(readFileSync(resolve(repoRoot, row.releasedPath), 'utf8')), row.releasedSha256)
  assert.equal(sha256(readFileSync(resolve(repoRoot, row.sourceArtifactPath), 'utf8')), row.sourceArtifactSha256)
  assert.equal(String(readJson<{ status: string }>(row.contentReview).status).toUpperCase(), 'PASS')
  const exam = task.examData as { reviewStatus: string; coveredGoalIds: string[] }
  assert.equal(exam.reviewStatus, 'released')
  assert.deepEqual(task.requires, exam.coveredGoalIds)
  assert.equal(exam.coveredGoalIds.length, 1)
  const extended = task.extendedData as { applicabilityFromRequires?: boolean; applicabilityMappingInheritance: string; applicabilityOverrides: { jurisdiction: string[] } }
  assert.equal(extended.applicabilityFromRequires, undefined)
  assert.equal(extended.applicabilityMappingInheritance, 'boundary')
  // The E.1 cut also places this task in Hesse. This assertion checks the
  // live payload. The Saxon source-stage decision covers only the Saxon offer.
  if (row.id === saxonFreeFallExam) assert.deepEqual(row.offeredJurisdictions, ['DE-SN'])
  const liveJurisdictions = row.id === saxonFreeFallExam ? ['DE-HE', 'DE-SN'] : row.offeredJurisdictions
  assert.deepEqual(extended.applicabilityOverrides.jurisdiction, liveJurisdictions)
  assert.deepEqual(task.applicability, { jurisdiction: liveJurisdictions })
}
// The pooled source-stage dossier binds both previous scored tasks and all 216
// preparation payloads. A scoring successor supplies its own current endpoint.
const currentStageOffersPath = `${currentExamEvidenceRoot}dprime-passmark-successor-20261124/current-stage-offers.actual.json`
assert.equal(sha256(readFileSync(resolve(repoRoot, currentStageOffersPath), 'utf8')),
  'd802486bacafdd04bbea0b430edc689309469785262084d95a973a0b4416d451')
const currentStageOffers = readJson<{ status: string; currentSharedPreparation: { path: string; sha256: string }
  assessments: Array<{ goalId: string; currentGoal: { path: string; sha256: string }; fullRealPrerequisiteClosureCount: number
    approvedScopes: Array<{ jurisdiction: string; stage: string }> }>
  ffxContentAndSourceStageReview: { path: string; sha256: string }
  dprimeContentAndSourceStageReview: { STSource: { path: string; sha256: string } }
  immutablePredecessors: Array<{ path: string; sha256: string }> }>(currentStageOffersPath)
assert.equal(currentStageOffers.status, 'ACCEPT_EXACT_CURRENT_OFFERS_WITH_SEPARATE_CURRENT_PREPARATION')
assert.equal(currentStageOffers.currentSharedPreparation.sha256,
  'c7ceff01355131a3d846c18e3559138459dd7ac3cb71f0edd4a02a6cd7537607')
assert.equal(sha256(readFileSync(resolve(repoRoot, currentStageOffers.currentSharedPreparation.path), 'utf8')),
  currentStageOffers.currentSharedPreparation.sha256)
for (const prior of currentStageOffers.immutablePredecessors) {
  assert.equal(sha256(readFileSync(resolve(repoRoot, prior.path), 'utf8')), prior.sha256)
}
assert.equal(sha256(readFileSync(resolve(repoRoot, currentStageOffers.ffxContentAndSourceStageReview.path), 'utf8')),
  currentStageOffers.ffxContentAndSourceStageReview.sha256)
const ffxPrimarySources = readJson<{ sourceStageEvidence: Array<{ path: string; sha256: string }> }>(
  currentStageOffers.ffxContentAndSourceStageReview.path).sourceStageEvidence
for (const source of [...ffxPrimarySources, currentStageOffers.dprimeContentAndSourceStageReview.STSource]) {
  assert.equal(createHash('sha256').update(readFileSync(resolve(repoRoot, source.path))).digest('hex'), source.sha256)
}
const currentStagePreparation = readJson<{ payloads: Array<{ goalId: string; rawSha256: string; normalizedSha256: string }>
  assessments: Array<{ goalId: string; assessmentRawSha256: string; assessmentNormalizedSha256: string
    jurisdictions: string[]; fullRealPrerequisiteIds: string[] }> }>(currentStageOffers.currentSharedPreparation.path)
const rawStagePreparationById = new Map(preparationLandscape.goals.map(goal => [goal.id, goal]))
const normalizedStagePreparationById = new Map(normalizeCanonicalLandscape(preparationLandscape as unknown as CanonicalAuthoringLandscape)
  .goals.map(goal => [goal.id, goal]))
assert.equal(currentStagePreparation.payloads.length, 216)
for (const payload of currentStagePreparation.payloads) {
  assert.equal(sha256(JSON.stringify(rawStagePreparationById.get(payload.goalId))), payload.rawSha256,
    `${payload.goalId}: stale actual source-stage prerequisite bytes`)
  assert.equal(sha256(JSON.stringify(normalizedStagePreparationById.get(payload.goalId))), payload.normalizedSha256)
}
assert.deepEqual(currentStageOffers.assessments.map(row => row.goalId), [saxonAccelerationExam, saxonFreeFallExam])
type EvidenceFile = { path: string; sha256: string }
// 25 Nov 2026: the mixed exam "Bewegungsanalyse und freier Fall" is retired for all Länder. The E.1
// material no longer names it as closing exam: one further one-field successor of the same bytes.
const mixedRetirementDir = 'curricula/DE/Gymnasium/quality/assessment-review/physik/e1-mixed-exam-retirement-20261125-v1/'
const retiredMixedExamId = 'a9562b05-c54d-5635-9244-3f7dd24a8642'
const mixedRetirement = readJson<{
  goalId: string
  goal: { before: EvidenceFile & { jsonStringifySha256: string }; after: EvidenceFile & { jsonStringifySha256: string }; changedFields: string[] }
  catalog: { changedGoalIds: string[] }
  views: { total: number; changed: number; files: Array<{ file: string; afterSha256: string }> }
  semanticKinds: { path: string; afterSha256: string; changes: Array<{ goalId: string; semanticKind: string; currentSourceFingerprint: string }> }
  material: { currentPath: string; before: EvidenceFile; after: EvidenceFile
    allowedDelta: { path: string; before: string; after: null; operation: string }; supersedes: EvidenceFile
    unchangedPlanningFingerprints: string[] }
  storedData: { noNewPlanningCredit: boolean }
}>(mixedRetirementDir + 'retirement.actual.json')
type StageScoringSuccessor = {
  goalId: string; status: string; predecessorOffer: EvidenceFile; predecessorPreparation: EvidenceFile
  approvedScopes: Array<{jurisdiction: string; stage: string}>; previousGoal: EvidenceFile; currentGoal: EvidenceFile
  accepted: EvidenceFile; sourceDocuments: EvidenceFile[]; reviews: Array<{receipt: EvidenceFile; response: EvidenceFile; scopeVerdict: string}>
  currentPreparation: { rawSha256: string; normalizedSha256: string; fullRealPrerequisiteIds: string[] }
  hessianMaterial: EvidenceFile; materialRegistry: EvidenceFile; hessianPlanningFingerprint: string
  requiredPlanningPartIds: string[]; planningCreditGoalIds: string[]
  reviewAuthority: string; humanApproval: boolean
  newOfficialWholeGoalCredit: boolean; cutAndPlacementsUnchanged: boolean; planningCreditGranted: boolean; learnerResultTransfer: boolean; r2?: EvidenceFile
}
const stageScoringHashes: Record<string, string> = {
  'a8dc0290-9f80-5763-8943-e16b8d2aa860': 'a868da38f0d2515b0d7f50139889e09785f67c02f63e5dccba0992a0130ff2b4',
}
const coachStageScoringHashes: Record<string, string> = {
  'a8dc0290-9f80-5763-8943-e16b8d2aa860': 'a40333754c4c87cf567fde4ff35f5c7b96ee754942116e5c5aee225b51938a67',
}
const stageScoring = new Map<string, {record: StageScoringSuccessor; path: string}>()
const ffxStageOfferPath = ffxBindingRoot + 'source-stage-offer.actual.json'
const priorStageCatalog = {...preparationLandscape, goals: preparationLandscape.goals.map(goal => priorAchievableGoals.get(goal.id) ?? goal)}
const priorStageNormalized = new Map(normalizeCanonicalLandscape(priorStageCatalog as unknown as CanonicalAuthoringLandscape)
  .goals.map(goal => [goal.id, goal]))
const lowerSourceBindings = readJson<{reviewedLowerAssessmentBindings: Record<string, {assessments: Record<string, {
  independentReview: string; offerReview: string; requires: string[]; coveredGoalIds: string[]
}>}>}>('scripts/generate_laender_physics_stage_views.sources.json').reviewedLowerAssessmentBindings
const headingOfferPath = releasedHeadingsRoot + '/source-stage-offer.actual.json'
const headingOffer = readJson<{previousOffer: EvidenceFile; r2: EvidenceFile; goalId: string; approvedScopes: unknown[];
  coveredGoalIds: string[]; requires: string[]; currentPreparation: StageScoringSuccessor['currentPreparation'];
  diffReview: EvidenceFile; planningCreditGranted: boolean; learnerResultTransfer: boolean}>(headingOfferPath)
assert.equal(sha256(readFileSync(resolve(repoRoot, headingOfferPath), 'utf8')), '30f9d4fb2b2a1903e2ae8440c9dbb995703c09565f96f83f1ae22acacb46f8b7')
assert.equal(headingOffer.goalId, saxonAccelerationExam)
assert.equal(headingOffer.planningCreditGranted, false)
assert.equal(headingOffer.learnerResultTransfer, false)
const normalizedBeforeHeadings = new Map(normalizeCanonicalLandscape({...preparationLandscape,
  goals: preparationLandscape.goals.map(goal => beforeHeadings.get(goal.id) ?? goal)} as unknown as CanonicalAuthoringLandscape).goals.map(g => [g.id,g]))
for (const row of currentStageOffers.assessments) {
  const id = row.goalId
  const current = beforeHeadings.get(id)!
  const prior = priorAchievableGoals.get(id)!
  const initialPath = `${achievableReviewRoot}/${id}/source-stage-offer.actual.json`
  const initialHash = stageScoringHashes[id]
  assert.equal(Boolean(initialHash), existsSync(resolve(repoRoot, initialPath)))
  assert.equal(Boolean(initialHash), existsSync(resolve(repoRoot, achievableReviewRoot, id, 'accepted.actual.json')))
  if (initialHash) assert.equal(sha256(readFileSync(resolve(repoRoot, initialPath), 'utf8')), initialHash)
  const initial = initialHash ? readJson<StageScoringSuccessor>(initialPath) : undefined
  const path = `${coachScoringReviewRoot}/${id}/source-stage-offer.actual.json`
  const bound = coachStageScoringHashes[id]
  assert.equal(Boolean(bound), Boolean(initial))
  assert.equal(Boolean(bound), existsSync(resolve(repoRoot, path)))
  assert.equal(Boolean(bound), existsSync(resolve(repoRoot, coachScoringReviewRoot, id, 'accepted.actual.json')))
  const offers = Object.entries(lowerSourceBindings).flatMap(([state, bindings]) =>
    bindings.assessments[id] ? [{state, row: bindings.assessments[id]}] : [])
  assert.deepEqual(offers.map(offer => offer.state).sort(), id === saxonAccelerationExam ? ['SN','ST'] : ['SN'])
  for (const offer of offers) {
    assert.equal(offer.row.independentReview, id === saxonFreeFallExam ? ffxStageOfferPath : bound ? headingOfferPath : currentStageOffersPath)
    assert.equal(offer.row.offerReview, offer.row.independentReview)
    assert.deepEqual(offer.row.requires, current.requires)
    assert.deepEqual(offer.row.coveredGoalIds, (current.examData as ExamData).coveredGoalIds)
  }
  assert.equal(sha256(readFileSync(resolve(repoRoot, row.currentGoal.path), 'utf8')), row.currentGoal.sha256)
  assert.deepEqual(prior, readJson(row.currentGoal.path))
  const prep = currentStagePreparation.assessments.find(binding => binding.goalId === id)!
  assert.equal(sha256(JSON.stringify(prior)), prep.assessmentRawSha256)
  assert.equal(sha256(JSON.stringify(priorStageNormalized.get(id))), prep.assessmentNormalizedSha256)
  const closure = collectWholeMaterialPrerequisiteClosure(preparationLandscape, id)
  assert.deepEqual([...closure.unresolvedReferences], [])
  assert.equal(closure.atomicGoalIds.size, row.fullRealPrerequisiteClosureCount)
  assert.deepEqual([...closure.atomicGoalIds].sort(compareCodePoints), prep.fullRealPrerequisiteIds)
  assert.deepEqual(row.approvedScopes.map(scope => `${scope.jurisdiction}:${scope.stage}`), id === saxonAccelerationExam
    ? ['DE-SN:SekI', 'DE-ST:SekI'] : ['DE-HE:SekII', 'DE-SN:SekI'])
  if (!bound) {
    assert.deepEqual(current, prior)
    // The pooled record is historical. A new FFX rubric is verified against the live goal separately below.
    assert.equal(sha256(JSON.stringify(normalizedBeforeHeadings.get(id))), prep.assessmentNormalizedSha256)
    continue
  }
  assert.equal(sha256(readFileSync(resolve(repoRoot, path), 'utf8')), bound)
  const successor = readJson<StageScoringSuccessor>(path)
  stageScoring.set(id, {record: successor, path})
  assert.equal(successor.goalId, id)
  assert.equal(successor.status, 'ACCEPT_CURRENT_EXACT_PAYLOAD_FOR_OWN_OFFER')
  assert.deepEqual(successor.approvedScopes, row.approvedScopes)
  assert(initial)
  assert.equal(initial.predecessorOffer.path, currentStageOffersPath)
  assert.deepEqual(initial.previousGoal, row.currentGoal)
  assert.deepEqual(successor.predecessorOffer, {path: initialPath, sha256: initialHash})
  assert.deepEqual(successor.predecessorPreparation, currentStageOffers.currentSharedPreparation)
  assert.deepEqual(successor.previousGoal, initial.currentGoal)
  assert.equal(successor.accepted.path, `${coachScoringReviewRoot}/${id}/accepted.actual.json`)
  const attempt = `${coachScoringReviewRoot}/${id}/${readJson<{ reviewPath: string }>(successor.accepted.path).reviewPath}`
  assert.equal(successor.currentGoal.path, attempt + '/candidate.goal.json')
  assert.deepEqual(successor.reviews.map(review => review.receipt.path), ['a','b'].map(r => `${attempt}/round-${r}/run.actual.json`))
  assert.equal(successor.reviews.length, 2)
  for (const review of successor.reviews) {
    assert.equal(review.response.path, review.receipt.path.replace('run.actual.json', 'response.json'))
    assert.equal(review.scopeVerdict, readJson<{scopeVerdict: string}>(review.response.path).scopeVerdict)
    const context = readJson<{additionalFixedContext: {ownOfferScopes: unknown; currentPreparation: {goalIds: string[]}; sourceDocuments: EvidenceFile[]}}>(
      review.receipt.path.replace('run.actual.json','canonical-input.json')).additionalFixedContext
    assert.deepEqual(context.ownOfferScopes, row.approvedScopes)
    assert.deepEqual(context.currentPreparation.goalIds, prep.fullRealPrerequisiteIds)
    assert.deepEqual(context.sourceDocuments, successor.sourceDocuments)
  }
  for (const ref of [successor.predecessorOffer, successor.predecessorPreparation, successor.previousGoal, successor.currentGoal,
    successor.accepted, successor.materialRegistry, ...successor.sourceDocuments, ...successor.reviews.flatMap(r => [r.receipt, r.response])]) {
    assert.equal(createHash('sha256').update(readFileSync(resolve(repoRoot, ref.path))).digest('hex'), ref.sha256)
  }
  // The offer bound the Hessian parent material in its state before the mixed E.1 exam was retired.
  // The retirement record continues that state: the current bytes differ only by the removed
  // closing-exam binding, and the planning parts, credit and fingerprint named below are unchanged.
  assert.deepEqual(successor.hessianMaterial, { path: mixedRetirement.material.currentPath, sha256: mixedRetirement.material.before.sha256 })
  assert.equal(createHash('sha256').update(readFileSync(resolve(repoRoot, successor.hessianMaterial.path))).digest('hex'),
    mixedRetirement.material.after.sha256)
  assert.deepEqual(current, readJson(successor.currentGoal.path))
  assert.equal(sha256(JSON.stringify(current)), successor.currentPreparation.rawSha256)
  assert.equal(sha256(JSON.stringify(normalizedBeforeHeadings.get(id))), successor.currentPreparation.normalizedSha256)
  assert.deepEqual(headingOffer.previousOffer, {path, sha256: bound})
  assert.deepEqual(headingOffer.requires, current.requires)
  assert.deepEqual(headingOffer.coveredGoalIds, (current.examData as ExamData).coveredGoalIds)
  assert.deepEqual(headingOffer.approvedScopes, successor.approvedScopes)
  assert.deepEqual(headingOffer.currentPreparation.fullRealPrerequisiteIds, prep.fullRealPrerequisiteIds)
  assert.equal(headingOffer.currentPreparation.rawSha256, sha256(JSON.stringify(rawGoalById.get(id))))
  assert.equal(headingOffer.currentPreparation.normalizedSha256, sha256(JSON.stringify(goalById.get(id))))
  assert.deepEqual(successor.currentPreparation.fullRealPrerequisiteIds, prep.fullRealPrerequisiteIds)
  assert.equal(successor.hessianMaterial.path, 'curricula/DE/Gymnasium/materials/physics/he-e1-motion-practice.json')
  assert.equal(successor.materialRegistry.path, 'curricula/unit-learning-materials.json')
  assert.deepEqual(successor.requiredPlanningPartIds, ['f13ca187-b680-5f47-b4ad-76bd474bd8a2'])
  assert.deepEqual(successor.planningCreditGoalIds, ['e4b38061-1f28-43ad-8371-a3e7c0e81856'])
  assert.equal(successor.hessianPlanningFingerprint, 'sha256:efb05e6c680bd40abe5a947fcce45e638f41c35909762c7f429b0016b75bb94d')
  assert.equal(successor.reviewAuthority, 'ai_review')
  assert.equal(successor.humanApproval, false)
  assert.equal(successor.newOfficialWholeGoalCredit, false)
  assert.equal(successor.cutAndPlacementsUnchanged, true)
  assert.equal(successor.planningCreditGranted, false)
  assert.equal(successor.learnerResultTransfer, false)
}


// The pooled HE/SN record above describes the original 23/24 task. Bind the separately accepted successor to the live offers.
const ffxManifestPath = ffxBindingRoot + 'binding-successors.actual.json'
assert.equal(sha256(readFileSync(resolve(repoRoot, ffxManifestPath), 'utf8')), '0b19b85864dc39476cd0fbd622b84db42d5c71147a6a02389af3540479e4349b')
const ffxBindings = readJson<{
  accepted: EvidenceFile; stage: EvidenceFile; coverage: EvidenceFile
  warningRows: { after: object }; sourceRows: Array<{ authority: string; after: object }>
}>(ffxManifestPath)
const ffxStageOffer = readJson<StageScoringSuccessor>(ffxStageOfferPath)
assert.equal(ffxBindings.stage.path, ffxStageOfferPath)
assert.deepEqual(ffxStageOffer.accepted, ffxBindings.accepted)
assert.equal(ffxBindings.accepted.path, ffxBindingRoot + 'accepted.actual.json')
assert.deepEqual(ffxStageOffer.currentGoal, {path: ffxBindingRoot + ffxSuccessor.candidate.path, sha256: ffxSuccessor.candidate.sha256})
const ffxPriorOffer = currentStageOffers.assessments.find(row => row.goalId === ffxGoalId)!
assert.deepEqual(ffxStageOffer.previousGoal, ffxPriorOffer.currentGoal)
assert.deepEqual(ffxStageOffer.approvedScopes, ffxPriorOffer.approvedScopes)
assert.deepEqual(ffxStageOffer.predecessorPreparation, currentStageOffers.currentSharedPreparation)
const ffxPriorPrep = currentStagePreparation.assessments.find(row => row.goalId === ffxGoalId)!
assert.deepEqual(ffxStageOffer.currentPreparation, {
  fullRealPrerequisiteIds: ffxPriorPrep.fullRealPrerequisiteIds,
  rawSha256: sha256(JSON.stringify(acceptedFfxGoal)), normalizedSha256: sha256(JSON.stringify(goalById.get(ffxGoalId))),
})
assert.deepEqual(ffxStageOffer.reviews.map(review => review.receipt.path), ['a', 'b'].map(round =>
  ffxBindingRoot + ffxSuccessor.reviewPath + '/round-' + round + '/run.actual.json'))
for (const review of ffxStageOffer.reviews) {
  const response = readJson<{scopeVerdict: string; candidateDecision: string}>(review.response.path)
  assert.equal(review.response.path, review.receipt.path.replace('run.actual.json', 'response.json'))
  assert.equal(response.candidateDecision, 'accept')
  assert.equal(review.scopeVerdict, response.scopeVerdict)
  const { additionalFixedContext } = readJson<{additionalFixedContext: {
    ownOfferScopes: unknown; currentPreparation: {goalIds: string[]}; sourceDocuments: EvidenceFile[]
  }}>(review.receipt.path.replace('run.actual.json', 'canonical-input.json'))
  assert.deepEqual(additionalFixedContext.ownOfferScopes, ffxStageOffer.approvedScopes)
  assert.deepEqual(additionalFixedContext.currentPreparation.goalIds, ffxPriorPrep.fullRealPrerequisiteIds)
  assert.deepEqual(additionalFixedContext.sourceDocuments, ffxStageOffer.sourceDocuments)
}
for (const file of [ffxBindings.accepted, ffxBindings.stage, ffxBindings.coverage, ffxStageOffer.predecessorOffer,
  ffxStageOffer.currentGoal, ...ffxStageOffer.sourceDocuments, ...ffxStageOffer.reviews.flatMap(review => [review.response, review.receipt])]) {
  assert.equal(createHash('sha256').update(readFileSync(resolve(repoRoot, file.path))).digest('hex'), file.sha256, file.path)
}
const nationalFfx = readJson<{reviewedCrossStageAssessmentExposures: {DE: Record<string, unknown>}}>(
  'scripts/generate_laender_physics_stage_views.sources.json').reviewedCrossStageAssessmentExposures.DE[ffxGoalId]
assert.deepEqual(ffxBindings.sourceRows.map(row => [row.authority, row.after]), [
  ['SN', lowerSourceBindings.SN.assessments[ffxGoalId]], ['DE', nationalFfx],
])
stageScoring.set(ffxGoalId, {record: ffxStageOffer, path: ffxStageOfferPath})

const ffxCoverage = readJson<{
  supersedes: EvidenceFile; previousPayload: {goalId: string; normalizedSha256: string}
  previousOfferedAssessmentRow: Record<string, unknown>; currentOfferedAssessmentRow: Record<string, unknown>
  currentPayload: {goalId: string; normalizedSha256: string}; currentAssessmentRevisions: object
  accepted: EvidenceFile; coveredGoalIds: string[]; planningCreditGranted: boolean; declaredOwningUnitId: null
}>(ffxBindings.coverage.path)
const oldFfxCoverage = readJson<{otherOfferedAssessmentRows: Array<{goalId: string}>;
  currentGoalPayloads: Array<{goalId: string}>}>(ffxCoverage.supersedes.path)
assert.equal(sha256(readFileSync(resolve(repoRoot, ffxCoverage.supersedes.path), 'utf8')), ffxCoverage.supersedes.sha256)
assert.deepEqual(ffxCoverage.previousOfferedAssessmentRow, oldFfxCoverage.otherOfferedAssessmentRows.find(row => row.goalId === ffxGoalId))
assert.deepEqual(ffxCoverage.previousPayload, oldFfxCoverage.currentGoalPayloads.find(row => row.goalId === ffxGoalId))
assert.deepEqual(ffxCoverage.currentPayload, {goalId: ffxGoalId, normalizedSha256: 'sha256:' + sha256(canonicalJson(acceptedFfxGoal))})
assert.deepEqual(ffxCoverage.currentOfferedAssessmentRow, {
  ...ffxCoverage.previousOfferedAssessmentRow, passingPoints: 22, maxPoints: 26,
  currentRawGoalArtifact: ffxStageOffer.currentGoal.path, currentNormalizedGoalSha256: ffxCoverage.currentPayload.normalizedSha256,
})
assert.deepEqual(ffxCoverage.accepted, ffxStageOffer.accepted)
const ffxExam = acceptedFfxGoal.examData as ExamData
assert.deepEqual(ffxCoverage.coveredGoalIds, ffxExam.coveredGoalIds)
assert.deepEqual([ffxCoverage.planningCreditGranted, ffxCoverage.declaredOwningUnitId], [false, null])
assert(!(rawLandscape.programUnits as Array<{coverageReviews?: Array<{assessmentGoalId: string}>}>)
  .some(unit => unit.coverageReviews?.some(review => review.assessmentGoalId === ffxGoalId)))
assert(!(rawLandscape.goalPlacements as Array<{goalId: string; relation: string}>)
  .some(placement => placement.goalId === ffxGoalId && placement.relation === 'own'))
const ffxTaskRevision = 'sha256:' + sha256(canonicalJson({taskContent: ffxExam.taskContent, solutionContent: ffxExam.solutionContent}))
const ffxRubricRevision = 'sha256:' + sha256(canonicalJson(ffxExam.scoring))
assert.deepEqual(ffxCoverage.currentAssessmentRevisions, {
  taskRevision: ffxTaskRevision, rubricRevision: ffxRubricRevision,
  fingerprint: 'sha256:' + sha256(canonicalJson({taskRevision: ffxTaskRevision, rubricRevision: ffxRubricRevision,
    taskContentEn: ffxExam.taskContentEn, solutionContentEn: ffxExam.solutionContentEn})),
})

// The V3 record bound R2 to the owned BES atom at 19/20. A reviewed scoring
// revision retains this coverage and the distinct D-only planning release.
const dprimeSuccessorRoot = `${currentExamEvidenceRoot}dprime-passmark-successor-20261124/`
const previousDprimeR2Path = `${dprimeSuccessorRoot}r2-coverage.actual.json`
const previousDprimeR2Hash = '3d9151f0e303cbfa302d1bf812580915a92f5765df33704273efc15defa3401b'
assert.equal(sha256(readFileSync(resolve(repoRoot, previousDprimeR2Path), 'utf8')), previousDprimeR2Hash)
const nextR2 = stageScoring.get(saxonAccelerationExam)?.record.r2
assert.equal(Boolean(nextR2), stageScoring.has(saxonAccelerationExam))
const dprimeR2Path = nextR2?.path ?? previousDprimeR2Path
if (nextR2) assert.equal(sha256(readFileSync(resolve(repoRoot, dprimeR2Path), 'utf8')), nextR2.sha256)
const dprimeR2 = readJson<{ status: string; unitId: string; unitRevision: string; ordinaryGoalIds: string[]
  coverage: { assessmentGoalId: string; goalIds: string[]; reference: string; taskRevision: string; rubricRevision: string }
  wholeUnitPromiseCertified: boolean; ownExperimentCertified: boolean; requiredHessianE1Part: boolean
  planningCreditGranted: boolean; reviewBindings: { path: string; sha256: string } }>(dprimeR2Path)
assert.equal(dprimeR2.status, 'ACCEPT_EXACT_BES_ONLY_R2_NO_PLANNING_CREDIT')
if (nextR2) {
  const currentReview = readJson<{technicalActivationFindings: string[]; priorCoverageReview: EvidenceFile}>(dprimeR2Path)
  assert.deepEqual(currentReview.technicalActivationFindings, [])
  const initialOffer = readJson<StageScoringSuccessor>(`${achievableReviewRoot}/${saxonAccelerationExam}/source-stage-offer.actual.json`)
  assert(initialOffer.r2)
  assert.deepEqual(currentReview.priorCoverageReview, initialOffer.r2)
  assert.equal(sha256(readFileSync(resolve(repoRoot, initialOffer.r2.path),'utf8')), initialOffer.r2.sha256)
  assert.deepEqual(readJson<{priorCoverageReview: EvidenceFile}>(initialOffer.r2.path).priorCoverageReview,
    {path: previousDprimeR2Path, sha256: previousDprimeR2Hash})
}
assert.equal(dprimeR2.unitId, 'physics-constant-acceleration')
assert.equal(dprimeR2.unitRevision, '2026-11-23-v4')
assert.deepEqual(dprimeR2.ordinaryGoalIds, ['e4b38061-1f28-43ad-8371-a3e7c0e81856'])
assert.deepEqual(dprimeR2.coverage.goalIds, dprimeR2.ordinaryGoalIds)
assert.equal(dprimeR2.coverage.assessmentGoalId, saxonAccelerationExam)
assert.equal(dprimeR2.coverage.reference, dprimeR2Path)
const previousDprimeR2 = readJson<typeof dprimeR2>(previousDprimeR2Path)
assert.equal(previousDprimeR2.coverage.taskRevision, 'sha256:76fe443cf24fd8ce18237c569eda70913087f7e515e4dec447ed71536ef1e0de')
assert.equal(previousDprimeR2.coverage.rubricRevision, 'sha256:f6a52fb1691cc147712c707af3a2488e996b7d78c0151127f644301132eef2e2')
const currentDprimeRevisions = assessmentReviewRevisions({ id: saxonAccelerationExam,
  examData: rawGoalById.get(saxonAccelerationExam)!.examData as ExamData })
const headingR2 = readJson<{previousReview: EvidenceFile; diffReview: EvidenceFile; coverage: typeof dprimeR2.coverage;
  unitId: string; unitRevision: string; planningCreditGranted: boolean; learnerResultTransfer: boolean}>(headingOffer.r2.path)
assert.equal(sha256(readFileSync(resolve(repoRoot, headingOffer.r2.path), 'utf8')), headingOffer.r2.sha256)
assert.deepEqual(headingR2.previousReview, nextR2)
assert.deepEqual(headingR2.diffReview, headingOffer.diffReview)
assert.deepEqual([headingR2.unitId,headingR2.unitRevision,headingR2.planningCreditGranted,headingR2.learnerResultTransfer],
  [dprimeR2.unitId,dprimeR2.unitRevision,false,false])
assert.deepEqual(headingR2.coverage, {...dprimeR2.coverage, reference: headingOffer.r2.path, taskRevision: currentDprimeRevisions.taskRevision})
assert.equal(dprimeR2.coverage.taskRevision, assessmentReviewRevisions({id: saxonAccelerationExam,
  examData: beforeHeadings.get(saxonAccelerationExam)!.examData as ExamData}).taskRevision)
assert.equal(headingR2.coverage.rubricRevision, currentDprimeRevisions.rubricRevision)
for (const claimed of [dprimeR2.wholeUnitPromiseCertified, dprimeR2.ownExperimentCertified,
  dprimeR2.requiredHessianE1Part, dprimeR2.planningCreditGranted]) assert.equal(claimed, false)
const dprimeOwningUnit = (rawLandscape.programUnits as Array<{ id: string; coverageReviews: unknown[] }>)
  .find(unit => unit.id === dprimeR2.unitId)!
assert.deepEqual(dprimeOwningUnit.coverageReviews.find(row => (row as { assessmentGoalId: string }).assessmentGoalId === saxonAccelerationExam),
  headingR2.coverage)
assert.equal(sha256(readFileSync(resolve(repoRoot, dprimeR2.reviewBindings.path), 'utf8')), dprimeR2.reviewBindings.sha256)
const dprimePlanning = readJson<{ material: { path: string; sha256: string }; registry: { path: string; sha256: string }
  credit: { requiredPartIds: string[]; goalIds: string[]; release: { fingerprint: string } }; DCoverage: unknown }>(
  `${dprimeSuccessorRoot}planning-invariance.actual.json`)
const scopeSuccessorDir = 'curricula/DE/Gymnasium/quality/learning-units/physics-he-e1-planning-release-2026-11-24/zb-successor-voluntary-scope-20261124/'
const scopeSuccessor = readJson<{
  materialBefore: { path: string; sha256: string }; materialAfter: { path: string; sha256: string }
  priorDprimePlanningProof: { path: string; sha256: string }; unchangedPlanningFingerprint: string
  noNewPlanningCredit: boolean; noStoredResultTransfer: boolean
}>(scopeSuccessorDir + 'scope-successor.actual.json')
const materialBefore = scopeSuccessorDir + 'parent.before.material.json'
const materialAfter = scopeSuccessorDir + 'parent.after.material.json'
assert.deepEqual(scopeSuccessor.materialBefore, { path: materialBefore, sha256: dprimePlanning.material.sha256 })
assert.deepEqual(scopeSuccessor.materialAfter, { path: materialAfter, sha256: '669005e570ca942b2bb2ce8083ce1a1baac2bdadf412aa12f35b3b99d9d838d9' })
assert.equal(scopeSuccessor.priorDprimePlanningProof.path, dprimeSuccessorRoot + 'planning-invariance.actual.json')
assert.equal(sha256(readFileSync(resolve(repoRoot, scopeSuccessor.priorDprimePlanningProof.path), 'utf8')), scopeSuccessor.priorDprimePlanningProof.sha256)
assert.equal(scopeSuccessor.unchangedPlanningFingerprint, dprimePlanning.credit.release.fingerprint)
assert.equal(scopeSuccessor.noNewPlanningCredit, true)
assert.equal(scopeSuccessor.noStoredResultTransfer, true)
assert.equal(sha256(readFileSync(resolve(repoRoot, materialBefore), 'utf8')), dprimePlanning.material.sha256)
assert.equal(sha256(readFileSync(resolve(repoRoot, materialAfter), 'utf8')), scopeSuccessor.materialAfter.sha256)
// The E.1 material no longer names the retired mixed exam as closing exam (record read above).
assert.equal(mixedRetirement.goalId, retiredMixedExamId)
assert.deepEqual(mixedRetirement.material.before, { path: mixedRetirementDir + 'material.before.json', sha256: scopeSuccessor.materialAfter.sha256 })
assert.deepEqual(readFileSync(resolve(repoRoot, mixedRetirement.material.before.path)), readFileSync(resolve(repoRoot, materialAfter)),
  'the retirement starts from the exact bytes the voluntary-identity successor ended with')
assert.equal(sha256(readFileSync(resolve(repoRoot, mixedRetirement.material.after.path), 'utf8')), mixedRetirement.material.after.sha256)
assert.deepEqual(mixedRetirement.material.supersedes, { path: scopeSuccessorDir + 'scope-successor.actual.json',
  sha256: sha256(readFileSync(resolve(repoRoot, scopeSuccessorDir + 'scope-successor.actual.json'), 'utf8')) })
assert.deepEqual(mixedRetirement.material.allowedDelta, { path: '/unit/assessmentGoalId', before: retiredMixedExamId, after: null, operation: 'remove' })
const materialWithoutClosingExam = readJson<{ unit: Record<string, unknown> }>(materialAfter)
assert.equal(materialWithoutClosingExam.unit.assessmentGoalId, retiredMixedExamId)
delete materialWithoutClosingExam.unit.assessmentGoalId
assert.deepEqual(readJson(mixedRetirement.material.after.path), materialWithoutClosingExam, 'only the closing-exam binding leaves the material')
assert.equal(mixedRetirement.material.currentPath, dprimePlanning.material.path)
assert.deepEqual(readFileSync(resolve(repoRoot, dprimePlanning.material.path)), readFileSync(resolve(repoRoot, mixedRetirement.material.after.path)))
assert.deepEqual(mixedRetirement.material.unchangedPlanningFingerprints, [dprimePlanning.credit.release.fingerprint])
assert.equal(mixedRetirement.storedData.noNewPlanningCredit, true)
// The retired goal itself: only applicability and the exclusion marker changed; task, rubric and requires are the released bytes.
const retiredMixedExam = rawGoalById.get(retiredMixedExamId)!
for (const side of [mixedRetirement.goal.before, mixedRetirement.goal.after]) {
  assert.equal(sha256(readFileSync(resolve(repoRoot, side.path), 'utf8')), side.sha256)
  assert.equal(sha256(JSON.stringify(readJson(side.path))), side.jsonStringifySha256)
}
assert.deepEqual(readJson(mixedRetirement.goal.after.path), retiredMixedExam)
const retiredMixedExamBefore = readJson<Record<string, unknown>>(mixedRetirement.goal.before.path)
assert.deepEqual(mixedRetirement.goal.changedFields, ['applicability', 'extendedData'])
assert.deepEqual(Object.keys(retiredMixedExam).filter(key => JSON.stringify(retiredMixedExam[key]) !== JSON.stringify(retiredMixedExamBefore[key])).sort(),
  mixedRetirement.goal.changedFields)
assert.deepEqual(retiredMixedExam.applicability, {})
assert.deepEqual(retiredMixedExam.extendedData, { applicabilityProjection: 'excluded', applicabilityMappingInheritance: 'boundary' })
assert.deepEqual(mixedRetirement.catalog.changedGoalIds, ['151edbf8-eb68-5ef7-8786-43e56a281b0b', '424b07df-bf66-5d7f-99f5-f28b32ad1f22', retiredMixedExamId])
assert.deepEqual((rawLandscape.goals as Array<{ id: string; contains?: string[] }>).filter(goal => goal.contains?.includes(retiredMixedExamId))
  .map(goal => goal.id), ['151edbf8-eb68-5ef7-8786-43e56a281b0b'])
// Lasting state, checked on the current files: no Physics view names the retired exam. The hashes of
// the 64 views, of the catalog and of the semantic-kind ledger in the record are the state of
// 25 Nov 2026 and are deliberately not compared with later bytes.
assert.equal(mixedRetirement.views.changed, mixedRetirement.views.files.length)
assert.equal(mixedRetirement.views.changed, 64)
for (const name of readdirSync(resolve(repoRoot, 'curricula/DE/Gymnasium/composition-views/physik')).filter(file => file.endsWith('.view.json'))) {
  assert(!readFileSync(resolve(repoRoot, 'curricula/DE/Gymnasium/composition-views/physik', name), 'utf8').includes(retiredMixedExamId),
    `${name}: no Physics view offers the retired mixed exam`)
}
assert.deepEqual(mixedRetirement.semanticKinds.changes.map(change => change.goalId).sort(), [...mixedRetirement.catalog.changedGoalIds].sort())
for (const change of mixedRetirement.semanticKinds.changes) assert.equal(change.semanticKind, 'practiceAssessment')
// The retired goal itself is history and keeps its recorded fingerprint.
assert.equal(fingerprintSemanticKindSourceGoal(retiredMixedExam),
  mixedRetirement.semanticKinds.changes.find(change => change.goalId === retiredMixedExamId)!.currentSourceFingerprint)
assert.equal(sha256(readFileSync(resolve(repoRoot, dprimePlanning.registry.path), 'utf8')), dprimePlanning.registry.sha256)
const expectedMaterial = readJson<{ unit: { sectionAssessmentPolicy: { voluntaryAssessmentGoalIds: string[] } } }>(materialBefore)
const voluntary = expectedMaterial.unit.sectionAssessmentPolicy.voluntaryAssessmentGoalIds
assert.deepEqual(voluntary, [historicalThrowExamId, 'f41e4e30-794e-5ce4-ba5e-cc72712cd691'])
voluntary[0] = currentThrowExamId
assert.deepEqual(readJson(materialAfter), expectedMaterial, 'only the voluntary throw exam changes identity')
assert.deepEqual(dprimePlanning.credit.requiredPartIds, ['f13ca187-b680-5f47-b4ad-76bd474bd8a2'])
assert.deepEqual(dprimePlanning.credit.goalIds, dprimeR2.ordinaryGoalIds)
assert.equal(dprimePlanning.credit.release.fingerprint, 'sha256:efb05e6c680bd40abe5a947fcce45e638f41c35909762c7f429b0016b75bb94d')
assert.deepEqual(dprimeOwningUnit.coverageReviews.find(row => (row as { assessmentGoalId: string }).assessmentGoalId === 'f13ca187-b680-5f47-b4ad-76bd474bd8a2'),
  dprimePlanning.DCoverage)
const ffxWarningRows = readJson<{ acceptedWarnings: Array<{ code: string; goalId: string; evidence: {
  reviewPath: string; reviewFileSha256: string; releasedGoalPath: string; releasedGoalSha256: string
  currentGoalJsonStringifySha256: string; exactOverrideJurisdictions: string[]; compiledJurisdictions: string[]
  currentPreparationReviewPath: string; currentPreparationReviewSha256: string
} }> }>('docs/qa-ci/applicability-accepted-warnings.json').acceptedWarnings
  .filter(row => row.code === 'APV-201' && row.goalId === saxonFreeFallExam)
assert.equal(ffxWarningRows.length, 1)
assert.deepEqual(ffxWarningRows[0], ffxBindings.warningRows.after)
const ffxWarning = ffxWarningRows[0].evidence
const ffxStage = stageScoring.get(saxonFreeFallExam)
assert.equal(ffxWarning.reviewPath, ffxStage?.path ?? currentStageOffersPath)
assert.equal(ffxWarning.reviewFileSha256, sha256(readFileSync(resolve(repoRoot, ffxWarning.reviewPath), 'utf8')))
assert.deepEqual(readJson(ffxWarning.releasedGoalPath), rawGoalById.get(saxonFreeFallExam))
assert.equal(sha256(readFileSync(resolve(repoRoot, ffxWarning.releasedGoalPath), 'utf8')), ffxWarning.releasedGoalSha256)
assert.equal(sha256(JSON.stringify(rawGoalById.get(saxonFreeFallExam))), ffxWarning.currentGoalJsonStringifySha256)
assert.deepEqual(ffxWarning.exactOverrideJurisdictions, ['DE-HE', 'DE-SN'])
assert.deepEqual(ffxWarning.compiledJurisdictions, ['DE-HE', 'DE-SN'])
assert.equal(ffxWarning.currentPreparationReviewPath, ffxStage?.path ?? currentStageOffers.currentSharedPreparation.path)
assert.equal(ffxWarning.currentPreparationReviewSha256, sha256(readFileSync(resolve(repoRoot, ffxWarning.currentPreparationReviewPath), 'utf8')))
// The Fermi competency needs its own real band-model assessment; generic
// historical exam templates must not claim this newly checked coverage.
const fermiGoalId = '658cf33d-a0c2-5d47-801a-3dbcd5cac074'
const fermiAssessmentId = '71e8936b-fa8a-50dc-8c47-fca015b85ac5'
const fermiAssessment = rawGoalById.get(fermiAssessmentId)
assert(fermiAssessment, 'the concrete Fermi band-model assessment is required')
const fermiExam = fermiAssessment.examData as {
  reviewStatus: string; coveredGoalIds: string[]; taskContent: string
  solutionContent: string; scoring: { maxPoints: number; steps: Array<{ points: number }> }
}
assert.deepEqual(fermiAssessment.requires, [fermiGoalId])
assert.deepEqual(fermiExam.coveredGoalIds, [fermiGoalId])
assert.equal(
  (fermiAssessment.extendedData as Record<string, unknown>)?.applicabilityFromRequires,
  true,
  'the Fermi assessment must derive applicability from its exact competency prerequisite',
)
assert.equal(fermiExam.reviewStatus, 'released')
assert.equal(fermiExam.scoring.maxPoints, 16)
assert.equal(fermiExam.scoring.steps.reduce((sum, step) => sum + step.points, 0), 16)
for (const id of ['0f5346d6-de1b-5e38-aaba-68db205e594b', '4a58df57-f791-502f-8b8d-9ba155e46035']) {
  const historicalTask = rawGoalById.get(id)
  assert(historicalTask)
  assert(!(historicalTask.requires as string[]).includes(fermiGoalId))
  assert(!(historicalTask.examData as { coveredGoalIds: string[] }).coveredGoalIds.includes(fermiGoalId))
}
// B035: two independent competencies replace the mixed atomic goal. The old
// stable ID remains a cluster; interval probability has its own actual task.
const wellClusterId = 'ad021f2e-6b94-5e6e-a264-3d1110094b87'
const wellEnergyId = 'd05a146f-7fcd-56ae-b9b9-b54203328579'
const wellProbabilityId = 'f2538793-8b0a-5c3b-b216-5d329a4e87bd'
assert.deepEqual(
  goalById.get(wellClusterId)?.contains,
  [wellEnergyId, wellProbabilityId],
)
for (const [goalId, expectedRequires] of [
  [wellEnergyId, ['51bc5513-6879-548f-b19a-9746b667f1a3']],
  [wellProbabilityId, [
    '51bc5513-6879-548f-b19a-9746b667f1a3',
    'b9bbd2a8-1379-5ffb-817f-41467d48abef', // Definite integral for interval probability.
  ]],
] as const) {
  assert.deepEqual(goalById.get(goalId)?.contains, [])
  assert.deepEqual(goalById.get(goalId)?.requires, expectedRequires)
}
const wellProbabilityAssessment = rawGoalById.get('2f8d4250-66c5-54e9-abb8-80735dc408d2')
assert(wellProbabilityAssessment, 'a genuine terminal task for interval probability is required')
const wellProbabilityExam = wellProbabilityAssessment.examData as {
  reviewStatus: string; coveredGoalIds: string[]; taskContent: string
  solutionContent: string; scoring: { maxPoints: number; steps: Array<{ points: number }> }
}
assert.deepEqual(wellProbabilityAssessment.requires, [wellProbabilityId])
assert.deepEqual(wellProbabilityExam.coveredGoalIds, [wellProbabilityId])
assert.equal(wellProbabilityExam.reviewStatus, 'released')
assert(wellProbabilityExam.taskContent.includes('L/4'))
assert(wellProbabilityExam.solutionContent.includes('1/2+1/\\pi'))
assert.equal(wellProbabilityExam.scoring.maxPoints, 10)
assert.equal(wellProbabilityExam.scoring.steps.reduce((sum, step) => sum + step.points, 0), 10)
const wellEnergyAssessmentId = 'b585ff81-6332-5d11-ae63-ee6a9928c00d'
const wellEnergyAssessment = goalById.get(wellEnergyAssessmentId)
const wellEnergyExam = rawGoalById.get(wellEnergyAssessmentId)?.examData as {
  coveredGoalIds: string[]; taskContent: string
} | undefined
assert(wellEnergyAssessment && wellEnergyExam, 'the existing energy calculation task must remain present')
const wellSplitGoalIds = new Set([wellClusterId, wellEnergyId, wellProbabilityId])
assert.deepEqual(
  wellEnergyAssessment.requires.filter((goalId) => wellSplitGoalIds.has(goalId)),
  [wellEnergyId],
  'the existing task requires the energy child, not the former cluster or the unassessed interval child',
)
assert.deepEqual(
  wellEnergyExam.coveredGoalIds.filter((goalId) => wellSplitGoalIds.has(goalId)),
  [wellEnergyId],
  'the existing task must claim only its actual B035 energy calculation',
)
assert(wellEnergyExam.taskContent.includes('Berechnen Sie die Energien $E_1$ und $E_2$'))
const bavariaMotorTransformerAssessment = rawGoalById.get(BAVARIA_MOTOR_TRANSFORMER_ASSESSMENT_ID)
assert(bavariaMotorTransformerAssessment, 'Bavaria motor/transformer assessment is missing')
const reviewedBavariaMotorAssessment = reviewBindingGoal(prerequisiteReductionContext,
  `${LANDSCAPE_ID}:${BAVARIA_MOTOR_TRANSFORMER_ASSESSMENT_ID}`, bavariaMotorTransformerAssessment)
const reviewedBavariaMotorRequires = reviewedBavariaMotorAssessment.requires as string[]
assert.deepEqual((bavariaMotorTransformerAssessment.examData as { coveredGoalIds: string[] }).coveredGoalIds,
  (reviewedBavariaMotorAssessment.examData as { coveredGoalIds: string[] }).coveredGoalIds,
  'Bavaria motor/transformer coverage must retain its exact reviewed goals')
assertReviewedPreparation(BAVARIA_MOTOR_TRANSFORMER_ASSESSMENT_ID, reviewedBavariaMotorRequires)

CQR104_ROUTE_ASSESSMENT_EVIDENCE.forEach((evidenceByGoalId, assessmentId) => {
  const assessment = rawGoalById.get(assessmentId)
  assert(assessment, `CQR-104 route assessment ${assessmentId} is missing`)
  const examData = assessment.examData as {
    coveredGoalIds?: unknown
    taskContent?: unknown
  } | undefined
  // These reviewed tasks use the coverage IDs as preparation seeds, but a
  // transitive reduction may remove their redundant direct prerequisite edges.
  if (!WITHDRAWN_ROUTE_ASSESSMENT_IDS.has(assessmentId)) {
    assertReviewedPreparation(assessmentId, assessmentId === 'dfd2628f-b44e-51b3-86e8-99158861be8c'
      ? ['89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2', '4a2bf015-052b-4af0-aed7-324259fa1a8a', 'd6dc0e02-831d-4894-a61a-852bcc74f147']
      : [...evidenceByGoalId.keys()])
  }
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
  if (WITHDRAWN_ROUTE_ASSESSMENT_IDS.has(assessmentId)) {
    // Retain the historical material below, without reviving its withdrawn
    // whole-competence claim or treating it as a current acquisition route.
    assert.deepEqual(examData?.coveredGoalIds, [])
    assert.equal(extendedData?.applicabilityProjection, 'excluded')
    assert.deepEqual(parentIdsByChild.get(assessmentId), ['151edbf8-eb68-5ef7-8786-43e56a281b0b'])
  } else {
    assert.deepEqual(
      [...evidenceByGoalId.keys()].sort(compareCodePoints),
      [...((examData?.coveredGoalIds ?? []) as string[])].sort(compareCodePoints),
      `CQR-104 route assessment ${assessmentId} needs an explicit task-content evidence binding for every covered goal`,
    )
  }
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

// Actual transitive-reduction regression: the reviewed charge-conservation
// competency remains preparation through the retained charge-separation goal.
const reducedRouteAssessmentId = '119cb138-b0c4-559d-8f1a-a4ae42db0656'
const retainedChargeGoalId = '80dd0a2b-1422-5b00-89ff-ec4d0faa047e'
const indirectChargeGoalId = 'dc7dd287-6eac-574d-818d-65cfb23a2d94'
const chargePreparationSeeds = [...CQR104_ROUTE_ASSESSMENT_EVIDENCE.get(reducedRouteAssessmentId)!.keys()]
assert(!(rawGoalById.get(reducedRouteAssessmentId)!.requires as string[]).includes(indirectChargeGoalId))
assert(collectWholeMaterialPrerequisiteClosure(preparationLandscape, reducedRouteAssessmentId)
  .atomicGoalIds.has(indirectChargeGoalId), 'the removed direct prerequisite must still have an actual preparation path')
const missingChargePath = structuredClone(preparationLandscape)
const retainedChargeGoal = missingChargePath.goals.find(({ id }) => id === retainedChargeGoalId)!
assert(retainedChargeGoal.requires.includes(indirectChargeGoalId))
retainedChargeGoal.requires = retainedChargeGoal.requires.filter((id) => id !== indirectChargeGoalId)
assert.deepEqual(missingChargePath.goals.find(({ id }) => id === reducedRouteAssessmentId)!.examData,
  rawGoalById.get(reducedRouteAssessmentId)!.examData, 'missing-path control must preserve the actual assessment material and coverage')
assert.throws(() => assertReviewedPreparation(reducedRouteAssessmentId, chargePreparationSeeds, missingChargePath),
  /full atomic preparation/u, 'removing the real retained path must fail despite unchanged assessment coverage')
const unresolvedChargeGoal = structuredClone(preparationLandscape)
unresolvedChargeGoal.goals = unresolvedChargeGoal.goals.filter(({ id }) => id !== indirectChargeGoalId)
assert.throws(() => assertReviewedPreparation(reducedRouteAssessmentId, chargePreparationSeeds, unresolvedChargeGoal),
  /unresolved current preparation/u, 'an unresolved prerequisite must remain a hard error')

const bwElectricalEnergyAssessment = rawGoalById.get('4996346f-ab5d-4d09-9b9e-b9e559af153d')
assert(bwElectricalEnergyAssessment, 'BW electrical-energy assessment is missing')
const reviewedBwElectricalEnergyAssessment = reviewBindingGoal(prerequisiteReductionContext,
  `${LANDSCAPE_ID}:4996346f-ab5d-4d09-9b9e-b9e559af153d`, bwElectricalEnergyAssessment)
const reviewedBwElectricalEnergyRequires = reviewedBwElectricalEnergyAssessment.requires as string[]
assert.deepEqual((bwElectricalEnergyAssessment.examData as { coveredGoalIds: string[] }).coveredGoalIds,
  (reviewedBwElectricalEnergyAssessment.examData as { coveredGoalIds: string[] }).coveredGoalIds,
  'BW electrical-energy coverage must retain its exact reviewed goals')
assertReviewedPreparation('4996346f-ab5d-4d09-9b9e-b9e559af153d', reviewedBwElectricalEnergyRequires)
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
const applicabilityCompilation = buildApplicabilityCompilation()
const physicsApplicabilityReport = applicabilityCompilation.reports.find(
  ({ landscapeId }) => landscapeId === LANDSCAPE_ID,
)
assert(physicsApplicabilityReport, 'applicability compiler lacks canonical Physics report')
assert.equal(
  physicsApplicabilityReport.summary.errors,
  0,
  'Physics applicability compilation must not lose evidence for any goal',
)
// An experiment added directly below the subject root must not inherit broad
// parent mappings as if every Land explicitly required its personal execution.
const transistorExecutionId = '77ab31a9-8961-511c-8637-06e98023d869'
assert.equal(
  (rawGoalById.get(transistorExecutionId)?.extendedData as Record<string, unknown>)?.applicabilityMappingInheritance,
  'boundary',
)
for (const goalId of [transistorExecutionId, '2cfd5c6a-a16a-5f90-aab7-b27b29271f72']) {
  assert.deepEqual(rawGoalById.get(goalId)?.applicability, { jurisdiction: ['DE-BY'] })
  assert.deepEqual(physicsApplicabilityReport.goals.find(goal => goal.goalId === goalId)?.compiledApplicability,
    { jurisdiction: ['DE-BY'] }, 'own execution stays bound to its actual source clause')
}
for (const goalId of ['dc55adac-91a5-5cc3-ab47-be008480616f', '8670cff6-fe9c-5f7e-8cba-d170134965a6']) {
  const expected = { jurisdiction: ['DE-BW', 'DE-BY', 'DE-HE', 'DE-SL', 'DE-SN'] }
  assert.deepEqual(rawGoalById.get(goalId)?.applicability, expected)
  assert.deepEqual(physicsApplicabilityReport.goals.find(goal => goal.goalId === goalId)?.compiledApplicability,
    expected, 'functional diode scope follows source mappings and actual necessary preparation')
}
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
const mathGoalIds = new Set(mathLandscape.goals.map(({ id }) => id))
const chemistryGoalIds = new Set(chemistryLandscape.goals.map(({ id }) => id))
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
// Current, independently reviewed repairs may change a goal's preparation.
// V9 transfers unchanged goals individually; it does not require preserving an
// older whole-catalog prerequisite inventory. Resolve the actual foreign edges.
assert.equal(foreignRequiresEdges.length, 161, 'the current Physics inventory has 161 direct cross-subject prerequisites')
foreignRequiresEdges.forEach(({ ownerId, goalId }) => {
  assert(mathGoalIds.has(goalId) || chemistryGoalIds.has(goalId),
    `foreign prerequisite ${goalId} has no configured canonical owner`)
  const current = collectWholeMaterialPrerequisiteClosure(preparationLandscape, ownerId)
  assert.deepEqual([...current.unresolvedReferences], [], `unresolved current foreign preparation for ${ownerId}`)
  assert(current.atomicGoalIds.has(goalId), `current full preparation lost direct foreign demand ${ownerId}->${goalId}`)
})
assert.equal(
  new Set(foreignRequiresEdges.map(({ goalId }) => goalId)).size,
  57,
  'Physics directly requires 56 Mathematics atoms and one Chemistry atom',
)
assert.equal(new Set(foreignRequiresEdges.filter(({ goalId }) => mathGoalIds.has(goalId)).map(({ goalId }) => goalId)).size, 56)
assert.deepEqual(foreignRequiresEdges.filter(({ goalId }) => chemistryGoalIds.has(goalId)), [
  { ownerId: 'db47ac91-7bb0-5ba3-b39d-e2d6fc98396e', goalId: '5dd180f1-f1c8-5f76-9c9a-ea3fc3d921bf' },
])
assert(!foreignRequiresEdges.some(({ goalId }) => goalId === '71cec9fb-3751-4d61-8b34-c5adbbf6e5f2'))
const spectrumTransferAssessmentId = 'c2a6ce42-ba20-55c4-b958-c9edb4b98c4c'
const spectrumTransferGoalId = 'f06c581a-7157-584e-a692-99bcd613cff9'
const spectrumTransferMathPreparation = [
  '4eeab7d5-eeb3-579b-845e-1c52ffe9e89f', // Add/subtract the signed decimal time samples.
  'ee48e811-4c9c-5080-9836-8403fc9f0810', // Compute the reciprocal frequency for the period.
  'f2e42af5-67a6-477e-82ea-e65b09cc6cb3', // Convert the resulting seconds to milliseconds.
]
const spectrumTransferAssessment = rawGoalById.get(spectrumTransferAssessmentId)
assert(spectrumTransferAssessment, 'the released spectrum-transfer assessment is missing')
assert.deepEqual(spectrumTransferAssessment.requires,
  [...spectrumTransferMathPreparation, spectrumTransferGoalId].sort(compareCodePoints),
  'the existing independent spectrum task needs its own arithmetic and unit preparation')
const spectrumTransferPreparation = collectWholeMaterialPrerequisiteClosure(preparationLandscape, spectrumTransferAssessmentId)
assert.deepEqual([...spectrumTransferPreparation.unresolvedReferences], [])
for (const goalId of [spectrumTransferGoalId, ...spectrumTransferMathPreparation]) {
  assert(spectrumTransferPreparation.atomicGoalIds.has(goalId),
    `spectrum-transfer task preparation lost ${goalId}`)
}
assert.deepEqual((spectrumTransferAssessment.examData as { coveredGoalIds: string[] }).coveredGoalIds,
  [spectrumTransferGoalId], 'necessary Mathematics preparation must not become assessment coverage')
const mathFixtureGoal = rawMathLandscape.goals.find(({ id }) => id === '000b2764-c5d9-5521-b39e-fc15a4aa72e2')
assert(mathFixtureGoal, 'known mathematics source-fingerprint fixture is missing')
const mathFixtureKey = `${String(rawMathLandscape.landscapeId)}:${String(mathFixtureGoal.id)}`
const reviewedMathFixtureGoal = reviewBindingGoal(prerequisiteReductionContext, mathFixtureKey, mathFixtureGoal)
assert.equal(
  sourceFingerprint(reviewedMathFixtureGoal, fingerprintContract),
  'sha256:3f3ae251b2b2d66a0dc22eb0ec76584c9c3b5902a0ea9376aae5f3accc5a1d0a',
  'semantic-kind source-fingerprint implementation drifted from the reviewed mathematics fixture',
)
assert.deepEqual(reviewedMathFixtureGoal.requires, [])
assert.deepEqual(mathFixtureGoal.requires, ['71cec9fb-3751-4d61-8b34-c5adbbf6e5f2'])
assert.deepEqual({ ...reviewedMathFixtureGoal, requires: mathFixtureGoal.requires }, mathFixtureGoal,
  'the reviewed Math canary differs only by the certified raw prerequisite materialization')
assert.notEqual(
  sourceFingerprint(reviewBindingGoal(undefined, mathFixtureKey, mathFixtureGoal), fingerprintContract),
  sourceFingerprint(reviewedMathFixtureGoal, fingerprintContract),
  'without the verified context the current raw Math value cannot satisfy the historical canary',
)
if (prerequisiteReductionContext) {
  assert.throws(() => reviewBindingGoal(prerequisiteReductionContext, `${LANDSCAPE_ID}:${String(mathFixtureGoal.id)}`,
    mathFixtureGoal), /snapshot/u, 'the Physics owner cannot bind the Math canary')
  assert.throws(() => reviewBindingGoal(prerequisiteReductionContext, mathFixtureKey,
    { ...mathFixtureGoal, examples: ['unreviewed drift'] }), /snapshot/u,
  'unrelated Math canary drift is rejected before historical comparison')
}

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
  landscape.goals.map(({ id }) => id),
  'Physics semantic-kind decisions must follow the complete current canonical inventory',
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
const e1CoreReviewBase = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-11-24/e1-current-nine-v1/core-independent-review/'
const e1CoreActivationPath = `${e1CoreReviewBase}activation.receipt.json`
assert.equal(sha256(readFileSync(resolve(repoRoot, e1CoreActivationPath), 'utf8')),
  '77455058b522c5f145178da62a0c12592e81ec7548dbe33ea0dc9ec9f8a326c2')
const e1CoreActivation = readJson<{ atomicGoalIds: string[]; semanticKindGoalIds: string[]; unanimousAtomicityCount: number; unanimousKindCount: number }>(e1CoreActivationPath)
assert.equal(e1CoreActivation.unanimousAtomicityCount, 9)
assert.equal(e1CoreActivation.unanimousKindCount, 12)
assert.equal(e1CoreActivation.atomicGoalIds.length, 9)
assert.equal(e1CoreActivation.semanticKindGoalIds.length, 12)
for (const round of ['a', 'b']) {
  const result = readJson<{ semanticKindReviews: Array<{ goalId: string; semanticKind: SemanticKind }> }>(`${e1CoreReviewBase}round-${round}/response.json`)
  for (const id of e1CoreActivation.semanticKindGoalIds) {
    const kind = result.semanticKindReviews.filter(row => row.goalId === id)
    assert.equal(kind.length, 1)
    assert.equal(kind[0].semanticKind, e1CoreActivation.atomicGoalIds.includes(id) ? 'curricularAtomic' : 'practiceAssessment')
  }
}
const semanticKindSourceMatches = (
  decision: Pick<SemanticKindDecision, 'goalId' | 'sourceFingerprint'>,
  rawGoal: Record<string, unknown>,
  context: VerifiedPrerequisiteReductionContext | undefined,
): boolean => {
  // Validate even a currently matching fingerprint against the opaque snapshot.
  const historical = reviewBindingGoal(context, `${LANDSCAPE_ID}:${decision.goalId}`, rawGoal)
  return decision.sourceFingerprint === sourceFingerprint(rawGoal, fingerprintContract)
    || (context !== undefined && decision.sourceFingerprint === sourceFingerprint(historical, fingerprintContract))
}
const currentBindingFixture = rawLandscape.goals[0]
const currentMatchingDecision = {
  goalId: String(currentBindingFixture.id), sourceFingerprint: sourceFingerprint(currentBindingFixture, fingerprintContract),
}
assert.throws(() => semanticKindSourceMatches(currentMatchingDecision, currentBindingFixture,
  {} as VerifiedPrerequisiteReductionContext), /forged/u)
if (prerequisiteReductionContext) {
  assert.throws(() => semanticKindSourceMatches({ ...currentMatchingDecision, goalId: String(mathFixtureGoal.id) },
    currentBindingFixture, prerequisiteReductionContext), /snapshot/u, 'a foreign goal binding cannot authorize a matching hash')
  const changedBindingFixture = { ...currentBindingFixture, examples: ['unverified snapshot change'] }
  assert.throws(() => semanticKindSourceMatches({ ...currentMatchingDecision,
    sourceFingerprint: sourceFingerprint(changedBindingFixture, fingerprintContract),
  }, changedBindingFixture, prerequisiteReductionContext), /snapshot/u,
  'a freshly matching fingerprint cannot authorize a changed current snapshot')
}
ledger.decisions.forEach((decision) => {
  assert(!decisionByGoalId.has(decision.goalId), `duplicate semantic-kind decision ${decision.goalId}`)
  const goal = goalById.get(decision.goalId)
  const rawGoal = rawGoalById.get(decision.goalId)
  assert(goal && rawGoal, `obsolete semantic-kind decision ${decision.goalId}`)
  assert.equal(decision.decisionStatus, 'authoritative')
  if (decision.sourceFingerprint !== sourceFingerprint(rawGoal, fingerprintContract)) {
    assert.equal(semanticKindSourceMatches(decision, rawGoal, undefined), false,
      `without a context the original stale source guard remains strict: ${decision.goalId}`)
  }
  assert(semanticKindSourceMatches(decision, rawGoal, prerequisiteReductionContext),
    `stale source fingerprint ${decision.goalId}`)
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
const kinematicsReviewPath = 'curricula/DE/Gymnasium/quality/assessment-review/physics-kinematics-20261022/review.json'
// This immutable receipt binds the original material review, not today's
// narrowed/withdrawn coverage or the current acquisition-contract approval.
assert.equal(sha256(readFileSync(resolve(repoRoot, kinematicsReviewPath), 'utf8')),
  '2e85f07f92316968378141ce61ef911589b8859c3df2b5b392ed4c7bb216e46e')
const kinematicsReview = readJson<{
  reviewMethod: string
  result: string
  humanApproval: boolean
  assessments: Array<{
    goalId: string; sourceFingerprint: string; bodyHashes: Record<string, string>
    requires: string[]; coveredGoalIds: string[]
  }>
}>(kinematicsReviewPath)
assert.equal(kinematicsReview.reviewMethod, 'independent-ai-counterreview')
assert.equal(kinematicsReview.result, 'accepted')
assert.equal(kinematicsReview.humanApproval, false, 'AI counterreview must never become human approval')
assert.deepEqual(new Set(kinematicsReview.assessments.map(({ goalId }) => goalId)), KINEMATICS_ASSESSMENT_IDS)
const kinematicsBodyFields = ['taskContent', 'taskContentEn', 'solutionContent', 'solutionContentEn'] as const
const rawPhysicsAndMathGoals = new Map([...rawMathLandscape.goals, ...rawLandscape.goals]
  .map((goal) => [String(goal.id), goal]))
for (const reviewed of kinematicsReview.assessments) {
  const activeId = reviewed.goalId === historicalThrowExamId ? currentThrowExamId : reviewed.goalId
  const goal = rawGoalById.get(activeId)!
  const exam = goal.examData as {
    reviewStatus: string; coveredGoalIds: string[]; taskContent: string; taskContentEn: string
    solutionContent: string; solutionContentEn: string
    scoring: { maxPoints: number; passingPoints: number; steps: Array<{ id: string; points: number }> }
  }
  assert.equal(exam.reviewStatus, 'released')
  assert.equal(decisionByGoalId.get(activeId)?.semanticKind, 'practiceAssessment')
  assert.equal((goal.extendedData as Record<string, unknown>).applicabilityFromRequires, true)
  for (const field of kinematicsBodyFields) {
    assert(exam[field].trim().length > 500, `${reviewed.goalId}: missing complete bilingual ${field}`)
    const historicExam = currentReviewedExams.get(reviewed.goalId)?.before as { examData?: Record<string, string> } | undefined
    assert.equal(reviewed.bodyHashes[field], `sha256:${sha256(historicExam?.examData?.[field] ?? exam[field])}`,
      `${reviewed.goalId}: stale immutable original ${field} review`)
  }
  // The E.1 cut (Product Owner, 23 Nov 2026) moved the two-motions exam behind the throw
  // goal and the narrowed model-limits goal; its preparation needs a fresh independent review.
  assert.deepEqual(goal.requires, reviewed.goalId === historicalThrowExamId
    ? ['89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2', 'd6dc0e02-831d-4894-a61a-852bcc74f147']
    : ['e4b38061-1f28-43ad-8371-a3e7c0e81856'])
  assertReviewedPreparation(activeId, goal.requires as string[])
  assert.deepEqual(exam.coveredGoalIds, reviewed.goalId === '4ab1cf6d-b808-5b86-9291-85df0b9f2496'
    ? [] : ['d6dc0e02-831d-4894-a61a-852bcc74f147'])
  if (reviewed.goalId === '4ab1cf6d-b808-5b86-9291-85df0b9f2496') {
    assert.equal((goal.extendedData as Record<string, unknown>).applicabilityProjection, 'excluded')
    assert.deepEqual(parentIdsByChild.get(reviewed.goalId), ['151edbf8-eb68-5ef7-8786-43e56a281b0b'])
  }
  const originalScoring = reviewed.goalId === historicalThrowExamId
    ? priorAchievableGoals.get(currentThrowExamId)!.examData.scoring : exam.scoring
  assert.equal(originalScoring.maxPoints, 36)
  assert.equal(originalScoring.passingPoints, reviewed.goalId === historicalThrowExamId ? 35.5 : 22)
  assert.equal(originalScoring.steps.length, 36)
  if (reviewed.goalId === historicalThrowExamId) {
    for (const step of originalScoring.steps) assert(originalScoring.maxPoints - step.points < originalScoring.passingPoints,
      'ZB cannot pass while omitting an existing idealization or prediction-limit criterion')
  }
  assert.equal(new Set(originalScoring.steps.map(({ id }) => id)).size, 36)
  assert(originalScoring.steps.every(({ points }) => points === 1))
  assert.equal(originalScoring.steps.reduce((sum, { points }) => sum + points, 0), 36)
  const prerequisiteIds = new Set<string>()
  const pending = [...goal.requires as string[]]
  while (pending.length) {
    const id = normalizeGoalRef(pending.pop()!)
    if (prerequisiteIds.has(id)) continue
    prerequisiteIds.add(id)
    const required = rawPhysicsAndMathGoals.get(id)
    assert(required, `${reviewed.goalId}: missing prerequisite ${id}`)
    pending.push(...(required.requires as string[] ?? []), ...(required.contains as string[] ?? []))
  }
  for (const id of prerequisiteIds) {
    const required = rawPhysicsAndMathGoals.get(id)!
    assert(!/vektor|newton|reibung/iu.test(String(required.title)),
      `${reviewed.goalId}: vector-free kinematics must not require ${String(required.title)}`)
  }
  // Since the E.1 cut (23 Nov 2026) the narrowed model-limits goal is the covered goal and a direct prerequisite.
  if (reviewed.goalId === historicalThrowExamId) {
    assert(prerequisiteIds.has('d6dc0e02-831d-4894-a61a-852bcc74f147'), 'the covered model-limits goal lies on the prerequisite path')
  } else {
    assert(!prerequisiteIds.has('d6dc0e02-831d-4894-a61a-852bcc74f147'), 'assessed model limits must not import an unrelated prerequisite branch')
  }
  assert(!exam.coveredGoalIds.includes('09029573-864f-40ca-bf8a-cee7bf6dcb73'), 'a written model task does not establish a free-fall experiment')
  assert(!exam.coveredGoalIds.includes('89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2'), 'a written model task does not establish a horizontal-projection experiment')
}
assert.deepEqual(rawGoalById.get('4ab1cf6d-b808-5b86-9291-85df0b9f2496')?.requires,
  ['e4b38061-1f28-43ad-8371-a3e7c0e81856'])
assert.deepEqual(rawGoalById.get(currentThrowExamId)?.requires,
  ['89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2', 'd6dc0e02-831d-4894-a61a-852bcc74f147'])
assert.deepEqual((rawGoalById.get(currentThrowExamId)?.examData as { coveredGoalIds: string[] }).coveredGoalIds,
  ['d6dc0e02-831d-4894-a61a-852bcc74f147'])
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
  externalLandscapePaths: [
    MATH_LANDSCAPE_PATH,
    'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',
  ],
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
assert.equal(sourceManifest.expectedCurricularAtomicGoalCount, EXPECTED_ATLAS_TARGET_COUNT)
assert.equal(sourceManifest.sourcePaths.length, 70)
assert.deepEqual(
  sourceManifest.sourcePaths,
  [...sourceManifest.sourcePaths].sort(compareCodePoints),
  'Physics atlas source paths must stay sorted',
)
const discoveredStateViewPaths = readdirSync(resolve(repoRoot, COMPOSITION_VIEW_DIRECTORY))
  .filter((fileName) => /^(?:de-[a-z]{2})-(?:gk|lk|sekii-gk|sekii-lk)\.view\.json$/u.test(fileName))
  .map((fileName) => `${COMPOSITION_VIEW_DIRECTORY}/${fileName}`)
  .sort(compareCodePoints)
assert.equal(discoveredStateViewPaths.length, 64, 'the complete 64 duration-neutral state-view floor remains present')
assert.deepEqual(
  sourceManifest.sourcePaths.filter((path) => !HE_DURATION_VIEW_BY_PATH.has(path)),
  discoveredStateViewPaths,
  'Physics atlas must retain all and only the original 64 duration-neutral state views',
)
assert.deepEqual(
  sourceManifest.sourcePaths.filter((path) => HE_DURATION_VIEW_BY_PATH.has(path)),
  HE_DURATION_VIEW_SPECS.map(({ path }) => path).sort(compareCodePoints),
  'Physics atlas must add exactly the six reviewed HE G8/G9 SekI/CrossStage views',
)

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
  [chemistryLandscape.landscapeId, chemistryLandscape] as const,
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
const materializationSourceEntries = prepareLandscapeEntries(
  [rawLandscape, rawMathLandscape, rawChemistryLandscape] as unknown as SkillLandscape[],
)
const materializationSeedScopeMatchers = new Map(materializationSourceEntries.flatMap(entry => {
  const matches = sourceCoverageAtomicScopeMatcher({ ...entry.meta, goals: entry.goals } as SkillLandscape)
  return entry.goals.map(goal => [goal.id, matches] as const)
}))
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
assert.equal(allPhysicsViewPaths.length, 90, 'Physics projection QA must bind all 75 original views and 15 explicit Land SekI excerpts')
const addedLandSekIStates = ['BB', 'BE', 'BW', 'BY', 'HB', 'HH', 'MV', 'NI', 'NW', 'RP', 'SH', 'SL', 'SN', 'ST', 'TH']
const addedLandSekIPaths = addedLandSekIStates.map(state => `${COMPOSITION_VIEW_DIRECTORY}/de-${state.toLowerCase()}-seki.view.json`).sort(compareCodePoints)
assert.deepEqual(allPhysicsViewPaths.filter(path => /\/de-[a-z]{2}-seki\.view\.json$/u.test(path)), addedLandSekIPaths,
  'All 15 formerly missing Land SekI selections must have their own source-scoped Physics view')
addedLandSekIPaths.forEach((path) => {
  const view = normalizeCompositionView(readJson(path))
  const state = path.match(/\/de-([a-z]{2})-seki\.view\.json$/u)?.[1]?.toUpperCase()
  assert.equal(view.scope.stage, 'SekI', `${view.viewId}: explicit lower-stage scope`)
  assert.equal(view.scope.jurisdiction, `DE-${state}`, `${view.viewId}: matching Land scope`)
  assert.equal(view.scope.courseProfile, undefined, `${view.viewId}: lower-stage excerpt must not imply a course profile`)
})
const validatedNationalPhysicsViewIds = new Set<string>()
const validatedStrictBwBySekIViewIds = new Set<string>()
const validatedGravitationGkViewIds = new Set<string>()
const validatedGravitationLkViewIds = new Set<string>()
const ROAD_SAFETY_GOAL_ID = '4a2bf015-052b-4af0-aed7-324259fa1a8a'
const roadSafetyExplicitUpperViewIds = new Set([
  'de-de-gym-sekii-physics-gk', 'de-de-gym-sekii-physics-lk',
  'de-rp-gym-sekii-physics-gk', 'de-rp-gym-sekii-physics-lk',
])
const retainedPhysicsProjectionAuthority = readJson<{
  authorities: Record<string, { prerequisiteOnlyAtomicGoalIds: string[] }>
}>('scripts/generate_laender_physics_stage_views.memberships.json').authorities

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
  assert.equal(
    visibleGoalIds.has(ROAD_SAFETY_GOAL_ID),
    view.scope.stage === 'CrossStage'
      || (view.scope.stage === 'SekII' && !['DE-BW', 'DE-BY'].includes(view.scope.jurisdiction ?? ''))
      || ['de-bw-gym-seki-physics', 'de-by-gym-seki-physics'].includes(view.viewId),
    `${view.viewId}: preserve road-safety membership, including the existing source-selected BW/BY lower targets and four national/RP upper additions`,
  )
  if (roadSafetyExplicitUpperViewIds.has(view.viewId)) {
    const directTargets: string[] = []
    const collectRoadSafetyRefs = (nodes: CompositionViewNode[]) => nodes.forEach((node) => {
      if (node.kind === 'structure') collectRoadSafetyRefs(node.children)
      else if ((node.kind === 'goalEntry' || node.kind === 'canonicalSubtree') && node.goalId === ROAD_SAFETY_GOAL_ID && node.projectionRole !== 'prerequisiteOnly') directTargets.push(node.goalId)
    })
    collectRoadSafetyRefs(view.rootNodes)
    assert.deepEqual(directTargets, [ROAD_SAFETY_GOAL_ID], `${view.viewId}: one explicit road-safety target`)
  }
  // Fermi target visibility is checked after learner course/jurisdiction
  // filtering in testPhysicsAssessmentProjection; this preview retains the
  // shared exercise collections before those filters are applied.
  const hesseGravitationUnitId = `he-physics-topic-${GRAVITATION_ROOT_GOAL_ID}`
  const knownHesseView = ['de-he-gym-physics-gk', 'de-he-gym-physics-lk',
    'de-he-gym-sekii-physics-gk', 'de-he-gym-sekii-physics-lk',
    ...HE_DURATION_VIEW_SPECS.filter(({ stage }) => stage === 'CrossStage').map(({ viewId }) => viewId)].includes(view.viewId)
  const compiledHesseGravitation = (nodes: CompiledCompositionPreviewNode[]): boolean => nodes.some(node =>
    (node.kind === 'structure' && node.runtimeId === `structure:${hesseGravitationUnitId}`) || compiledHesseGravitation(node.children))
  if (knownHesseView) assert.equal(collectCompositionStructures(view.rootNodes, hesseGravitationUnitId).length, 1,
    `${view.viewId}: retain exactly one opened gravitation topic`)
  const gravitationRootIsTarget = EXPECTED_GRAVITATION_GK_VIEW_IDS.has(view.viewId)
    || EXPECTED_GRAVITATION_LK_VIEW_IDS.has(view.viewId)
  if (knownHesseView) assert(compiledHesseGravitation(compilation.compiledRootNodes))
  const gravitationAtomicIds = [...collectAuthoredProjectionGoalIds([
    { kind: 'canonicalSubtree', goalId: GRAVITATION_ROOT_GOAL_ID },
  ], semanticGoalById)].filter(id => resolveCanonicalNodeType(semanticGoalById.get(id)!) === 'atomic')
  if (gravitationRootIsTarget) gravitationAtomicIds.forEach(goalId => {
    const retainedSupport = retainedPhysicsProjectionAuthority[view.viewId]?.prerequisiteOnlyAtomicGoalIds ?? []
    const expectedTarget = !retainedSupport.includes(goalId)
      && (view.scope.courseProfile === 'LK' || !GRAVITATION_LK_ONLY_GOAL_IDS.some(id => id === goalId))
    assert.equal(visibleGoalIds.has(goalId), expectedTarget,
      `${view.viewId}: opened gravitation retains the exact reviewed atomic course scope ${goalId}`)
  })
  const authoredGravitationProjectionRoots = collectAuthoredPrerequisiteRoots(view.rootNodes, false)
    .filter(({ goalId }) => GRAVITATION_LK_ONLY_PROJECTION_ROOTS.some((root) => root.goalId === goalId))
    .sort((left, right) => compareCodePoints(left.goalId, right.goalId))
  if (view.scope.courseProfile === 'GK') {
    GRAVITATION_LK_ONLY_GOAL_IDS.forEach((goalId) => {
      if (resolveCanonicalNodeType(semanticGoalById.get(goalId)!) !== 'atomic') return
      assert(
        !visibleGoalIds.has(goalId),
        `${view.viewId} must not expose LK-only gravitation goal ${goalId} as a GK target`,
      )
    })
    if (gravitationRootIsTarget) {
      assert.deepEqual(
        authoredGravitationProjectionRoots,
        [...GRAVITATION_LK_ONLY_PROJECTION_ROOTS,
          ...(['de-de-gym-physics-gk', 'de-de-gym-sekii-physics-gk'].includes(view.viewId)
            ? ['16caf92e-2800-57d1-946c-5b92ce848a96', '89cadf81-143b-5f6b-82bd-29ba20d92a1b']
              .map(goalId => ({ goalId, kind: 'canonicalSubtree' as const })) : []),
        ]
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
      if (resolveCanonicalNodeType(semanticGoalById.get(goalId)!) !== 'atomic') return
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
      const ph10PreparationIds = [
        '8c9394cb-f54a-508d-9750-4c49e31b3fa9',
        'a5f652cc-e091-4c90-bec2-c357ae54fcf1',
      ]
      assert.deepEqual(
        [...collectAuthoredProjectionGoalIds([ph10Structures[0]], semanticGoalById)].sort(compareCodePoints),
        [...BAVARIA_PH10_1_GOAL_IDS,
          'b4175564-4397-5c08-90ba-4f13231a75ec',
          'e0932fef-9e1c-5c95-b00c-7589e76d0e83',
          ...ph10PreparationIds,
        ].sort(compareCodePoints),
        `${view.viewId} must retain the seven Ph10.1 goals, their two reviewed tasks, and exactly two conditional preparations`,
      )
      ph10PreparationIds.forEach(goalId => {
        const node = ph10Structures[0].children.find(child => child.kind === 'goalEntry' && child.goalId === goalId)
        assert(node?.kind === 'goalEntry', `${view.viewId}: explicit Ph10.1 preparation ${goalId}`)
        assert.equal(node.projectionRole, 'prerequisiteOnly')
        assert.equal(node.acquisitionPlacement, true)
      })
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
    const rootLevelPrerequisiteNodes = [
      ...view.rootNodes,
      ...rootStructures[0].children,
    ].filter((node) => (
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
    const strictLearningBasisGoalIds = new Set(strictRouteStartGoalIds)
    strictRouteStartGoalIds.forEach((goalId) => {
      const closure = collectWholeMaterialPrerequisiteClosure(preparationLandscape, goalId)
      assert.deepEqual([...closure.unresolvedReferences], [], `${view.viewId}: unresolved learning-basis preparation for ${goalId}`)
      closure.atomicGoalIds.forEach((id) => strictLearningBasisGoalIds.add(id))
    })
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
        strictSekIProjectionGoalIds.has(requiredGoalId) && strictLearningBasisGoalIds.has(requiredGoalId),
      )
      assert.equal(
        strictRouteStartGoalIds.includes(assessmentId),
        !WITHDRAWN_ROUTE_ASSESSMENT_IDS.has(assessmentId) && hasCompleteLocalSupport,
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
      // A foreign canonical root hands off to its configured owner's graph.
      // The full closure above resolves those atoms; this separate walk checks
      // Physics paths rather than claiming backend emission or acquisition.
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
          strictLearningBasisGoalIds.has(requiredGoalId),
          `${view.viewId} strict Sek-I all-of prerequisite closure leaves its native learning basis: ${nextRoutePath.join(' -> ')}`,
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

  const declaredForeignPrerequisiteRoots = collectAuthoredPrerequisiteRoots(view.rootNodes, false)
    .map((root) => ({ ...root, goalId: normalizeGoalRef(root.goalId) }))
    .filter(({ goalId }) => !semanticGoalById.has(goalId))
  const authoredForeignPrerequisiteRootById = new Map<string, AuthoredPrerequisiteRoot>()
  declaredForeignPrerequisiteRoots.forEach((root) => {
    const previous = authoredForeignPrerequisiteRootById.get(root.goalId)
    if (previous) {
      assert.deepEqual(root, previous, `${view.viewId}: repeated support must retain the same canonical role/kind`)
      assert.equal(root.kind, 'goalEntry', `${view.viewId}: broad legacy support roots must stay unique`)
      assert.equal(physicsAndMathGoalById.get(root.goalId)?.contains.length, 0,
        `${view.viewId}: repeated unmarked support must be the identical atomic alias`)
    }
    authoredForeignPrerequisiteRootById.set(root.goalId, root)
  })
  const authoredForeignPrerequisiteRoots = [...authoredForeignPrerequisiteRootById.values()]

  // Retain the exact legacy support roots and the reviewed shared Mathematics
  // subtree; its descendants supply the newly explicit direct prerequisites.
  const strictStateUpperScope = ['DE-BW', 'DE-BY'].includes(view.scope.jurisdiction ?? '')
    && view.scope.stage === 'SekII'
  const expectedForeignRoots: AuthoredPrerequisiteRoot[] = [
    { goalId: 'c01b1ce9-a667-4a46-b251-ec33ae602b15', kind: 'canonicalSubtree' },
  ]
  // The two HE Sek-I excerpts retain their CrossStage source's exact support
  // roots. The existing national Sek-I view keeps its narrower c01b-only floor.
  const hesseDurationSekI = HE_DURATION_VIEW_BY_PATH.get(viewPath)?.stage === 'SekI'
  if ((view.scope.stage !== 'SekI' || hesseDurationSekI || addedLandSekIPaths.includes(viewPath)) && !strictStateUpperScope) {
    expectedForeignRoots.push(
      { goalId: '09f47964-2cd0-410e-93ee-9632b582fc91', kind: 'goalEntry' },
      { goalId: '5a9702f4-7e4d-457d-b98c-f0bafcd1e386', kind: 'canonicalSubtree' },
      { goalId: 'a8c42ee9-2898-4247-819f-c235032ac78a', kind: 'goalEntry' },
      { goalId: 'af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186', kind: 'goalEntry' },
      { goalId: 'c1f50bcc-7848-4e49-b9de-0ec030cc6bca', kind: 'goalEntry' },
      { goalId: 'e4f3a846-d2b8-4ee5-b0a2-4dc2833b2ecb', kind: 'canonicalSubtree' },
    )
    if (view.scope.jurisdiction !== 'DE-BY') {
      expectedForeignRoots.push({ goalId: 'c65ecabf-d00b-4e2d-99ae-b64692325ffb', kind: 'goalEntry' })
    }
    if (!['DE-BW', 'DE-BY'].includes(view.scope.jurisdiction ?? '')) {
      expectedForeignRoots.push({ goalId: '858113c5-e53b-57bb-b01f-ba95c3ddcb6f', kind: 'goalEntry' })
    }
  }
  const expectedRootIds = new Set(expectedForeignRoots.map(root => root.goalId))
  const reviewedForeignSupport = collectAuthoredProjectionGoalIds(
    expectedForeignRoots.map(root => ({ ...root, projectionRole: 'prerequisiteOnly' })), physicsAndMathGoalById,
  )
  authoredForeignPrerequisiteRoots.filter(root => !expectedRootIds.has(root.goalId)).forEach((root) => {
    const goal = physicsAndMathGoalById.get(root.goalId)
    assert(goal && goal.contains.length === 0 && root.kind === 'goalEntry',
      `${view.viewId}: additional support alias must be an atomic entry: ${root.goalId}`)
    assert(reviewedForeignSupport.has(root.goalId),
      `${view.viewId}: additional support alias must stay inside its reviewed legacy support: ${root.goalId}`)
  })
  assert.deepEqual(
    authoredForeignPrerequisiteRoots.filter(root => expectedRootIds.has(root.goalId)).sort((left, right) => compareCodePoints(left.goalId, right.goalId)),
    expectedForeignRoots.sort((left, right) => compareCodePoints(left.goalId, right.goalId)),
    `${view.viewId} must retain exactly its reviewed foreign prerequisite roots and node kinds`,
  )
  const foreignProjectionGoalIds = collectAuthoredProjectionGoalIds(
    authoredForeignPrerequisiteRoots.map((root) => ({ ...root, projectionRole: 'prerequisiteOnly' })),
    physicsAndMathGoalById,
  )
  const chemistryPreparationNodes: Array<Extract<CompositionViewNode, { kind: 'goalEntry' }>> = []
  const collectChemistryPreparation = (nodes: CompositionViewNode[]) => nodes.forEach((node) => {
    if (node.kind === 'structure') collectChemistryPreparation(node.children)
    else if (node.kind === 'goalEntry' && chemistryGoalIds.has(node.goalId)) chemistryPreparationNodes.push(node)
  })
  collectChemistryPreparation(view.rootNodes)
  const expectedChemistryPreparationIds = [
    'a9c22adc-b543-5b0c-a2d8-3189facdff08',
    '13d4f336-ab16-54a7-9479-c920b458f385',
    '416dfd33-8b43-5c49-903c-9847b95e4208',
    'fcc73fb5-7413-557f-aea3-b9692a66ee75',
    '326d45bf-9f77-57d5-a054-93e76b034dd5',
    '988888bb-1f88-55f9-9a44-f3f60469a297',
    '5dd180f1-f1c8-5f76-9c9a-ea3fc3d921bf',
  ]
  assert.deepEqual(chemistryPreparationNodes.map(({ goalId }) => goalId).sort(compareCodePoints),
    view.scope.jurisdiction === 'DE-BY' && view.scope.stage !== 'SekI' ? expectedChemistryPreparationIds.sort(compareCodePoints) : [],
    `${view.viewId}: the seven reviewed Chemistry preparations retain their actual target placements`)
  chemistryPreparationNodes.forEach((node) => {
    assert.equal(node.projectionRole, 'target', 'reviewedPreparation metadata must not rewrite the actual target role')
    const evidence = node.placementEvidence as {
      role?: string; consumerGoalId?: string; requiredByPath?: string[]
    } | undefined
    assert.equal(evidence?.role, 'reviewedPreparation')
    assert.equal(evidence?.consumerGoalId, 'db47ac91-7bb0-5ba3-b39d-e2d6fc98396e')
    const path = evidence?.requiredByPath ?? []
    assert.equal(path[0], evidence?.consumerGoalId)
    assert.equal(path.at(-1), node.goalId)
    path.slice(0, -1).forEach((id, index) => assert(
      physicsAndMathGoalById.get(id)?.requires.includes(path[index + 1]),
      `${view.viewId}: invalid reviewed preparation path ${id} -> ${path[index + 1]}`,
    ))
    foreignProjectionGoalIds.add(node.goalId)
  })
  expectedForeignPrerequisiteIds.forEach((goalId) => {
    assert(mathGoalIds.has(goalId) || chemistryGoalIds.has(goalId), `${view.viewId} foreign prerequisite ${goalId} has no configured canonical owner`)
    assert(
      foreignProjectionGoalIds.has(goalId),
      `${view.viewId} direct foreign prerequisite ${goalId} is absent from its authored support/target preparation`,
    )
  })
  authoredForeignPrerequisiteRoots.forEach(({ goalId }) => {
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

  const markers: Array<Extract<CompositionViewNode, { kind: 'goalEntry' }>> = []
  const markerParents = new Map<string, string>()
  const collectMarkers = (nodes: CompositionViewNode[], parent?: string) => nodes.forEach(node => {
    if (node.kind === 'structure') collectMarkers(node.children, node.id)
    else if (node.kind === 'goalEntry' && node.acquisitionPlacement === true) {
      assert(parent, `${view.viewId}: explicit acquisition has an authored unit`)
      markers.push(node)
      markerParents.set(node.goalId, parent)
    }
  })
  collectMarkers(view.rootNodes)
  assert.equal(new Set(markers.map(node => node.goalId)).size, markers.length,
    `${view.viewId}: one explicit acquisition location per canonical atom`)
  const actualSeeds = new Set([...visibleGoalIds].filter((id) => {
    const goal = physicsAndMathGoalById.get(id)
    if (!goal || goal.contains.length > 0 || resolveCanonicalNodeType(goal) !== 'atomic') return false
    const matchesScope = materializationSeedScopeMatchers.get(id)
    assert(matchesScope, `${view.viewId}: canonical owner for projected seed ${id}`)
    return matchesScope(goal as unknown as SkillLandscape['goals'][number], view.scope)
  }))
  const actualLearning = new Set(actualSeeds)
  const pending = [...actualSeeds]
  while (pending.length > 0) {
    const id = pending.pop()!
    const goal = physicsAndMathGoalById.get(id)
    assert(goal, `${view.viewId}: unknown canonical learning atom ${id}`)
    goal.requires.map(normalizeGoalRef).forEach((required) => {
      if (!actualLearning.has(required)) { actualLearning.add(required); pending.push(required) }
    })
  }
  markers.forEach(node => {
    assert.equal(view.viewFormatVersion, '1.2')
    assert.equal(node.projectionRole, 'prerequisiteOnly')
    assert(!actualSeeds.has(node.goalId),
      `${view.viewId}: an acquisition template must never create a seed: ${node.goalId}`)
  })
  const personalSources = materializationSourceEntries.map(entry => ({ ...entry, meta: { ...entry.meta,
    personalCurriculumProjection: {
      revision: 'atomic-prerequisite-learning-v1' as const, rootLandscapeId: LANDSCAPE_ID, scopeRevision: view.viewId,
      seedAtomicGoalIds: entry.goals.filter(goal => actualSeeds.has(goal.id)).map(goal => goal.id),
      targetGoalIds: entry.goals.filter(goal => actualLearning.has(goal.id)).map(goal => goal.id), requiredByPaths: {},
    },
  } }))
  const materialized = applyPersonalCurriculumProjection(
    normalizeLearnerProjectedEntries(applyCompositionViewProjection(materializationSourceEntries, view)), personalSources,
  )
  const materializedGoals = new Map(materialized.flatMap(entry => entry.goals).map(goal => [goal.id, goal]))
  const localRoots = materialized.find(entry => entry.meta.landscapeId === LANDSCAPE_ID)?.goals
    .filter(goal => goal.tags.includes('root')) ?? []
  const visited = new Set<string>()
  const incoming = new Map<string, number>()
  const actualParents = new Map<string, string | undefined>()
  const visitMaterialized = (id: string) => {
    if (visited.has(id)) return
    visited.add(id)
    materializedGoals.get(id)?.contains.forEach(child => {
      incoming.set(child, (incoming.get(child) ?? 0) + 1)
      actualParents.set(child, materializedGoals.get(id)?.extendedData?.compositionNodeId as string | undefined)
      visitMaterialized(child)
    })
  }
  localRoots.forEach(goal => visitMaterialized(goal.id))
  markers.forEach(node => {
    if (!actualLearning.has(node.goalId)) {
      assert.equal(incoming.get(node.goalId) ?? 0, 0,
        `${view.viewId}: dormant acquisition template must stay invisible outside the actual learning basis: ${node.goalId}`)
      assert(!visited.has(node.goalId), `${view.viewId}: inactive acquisition creates no visible target`)
      return
    }
    assert.equal(incoming.get(node.goalId), 1,
      `${view.viewId}: active acquisition must materialize exactly once in the real learning tree: ${node.goalId}`)
    assert.equal(actualParents.get(node.goalId), markerParents.get(node.goalId),
      `${view.viewId}: needed nonseed must use its authored acquisition unit, not a broad support alias: ${node.goalId}`)
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
  'Physics projection QA must bind all 30 existing GK views plus both HE duration GK views with the broad gravitation target',
)
assert.deepEqual(
  [...validatedGravitationLkViewIds].sort(compareCodePoints),
  [...EXPECTED_GRAVITATION_LK_VIEW_IDS].sort(compareCodePoints),
  'Physics projection QA must bind all 30 existing matching LK views plus both HE duration LK views with the broad gravitation target',
)

const atlasCurricularAtomicGoalIds = new Set<string>()
let atlasPreparationOnlyOccurrences = 0
const sourceViews: GoalBookDurationPolicyViewSource[] = []
const roleCountByJurisdiction = new Map<string, Set<string>>()
sourceManifest.sourcePaths.forEach((sourcePath) => {
  assert(existsSync(resolve(repoRoot, sourcePath)), `missing Physics atlas source ${sourcePath}`)
  const view = normalizeCompositionView(readJson(sourcePath))
  atlasPreparationOnlyOccurrences += collectAuthoredPrerequisiteRoots(view.rootNodes)
    .filter(({ goalId }) => goalId === ATLAS_PREPARATION_ONLY_GOAL_ID).length
  assert.equal(view.landscapeId, LANDSCAPE_ID)
  assert(EXPECTED_JURISDICTIONS.includes(view.scope.jurisdiction as typeof EXPECTED_JURISDICTIONS[number]))
  const durationSpec = HE_DURATION_VIEW_BY_PATH.get(sourcePath)
  if (durationSpec) {
    assert.equal(view.viewId, durationSpec.viewId)
    assert.equal(view.scope.jurisdiction, 'DE-HE')
    assert.equal(view.scope.schoolForm, 'Gymnasium')
    assert.equal(view.scope.stage, durationSpec.stage)
    assert.equal(view.scope.courseProfile, durationSpec.courseProfile)
    assert.equal(view.scope.durationModel, durationSpec.durationModel)
    if (durationSpec.stage === 'CrossStage') {
      const original = normalizeCompositionView(readJson(
        `${COMPOSITION_VIEW_DIRECTORY}/de-he-${durationSpec.courseProfile!.toLowerCase()}.view.json`,
      ))
      const originalRoles = collectCompositionProjectionRoleGoalIds(original.rootNodes, physicsAndMathGoalById)
      const durationRoles = collectCompositionProjectionRoleGoalIds(view.rootNodes, physicsAndMathGoalById)
      for (const role of ['targetGoalIds', 'prerequisiteOnlyGoalIds'] as const) {
        const atoms = (ids: Set<string>) => [...ids]
          .filter((id) => physicsAndMathGoalById.get(id)?.contains.length === 0).sort(compareCodePoints)
        assert.deepEqual(atoms(durationRoles[role]), atoms(originalRoles[role]),
          `${view.viewId}: retain the exact canonical atomic ${role} from the reviewed neutral course`)
      }
      if (durationSpec.durationModel === 'G9') assert.deepEqual(view.rootNodes, original.rootNodes,
        'G9 duration alias must retain the entire existing reviewed tree, including every reference payload')
    } else {
      const crossStage = normalizeCompositionView(readJson(
        `${COMPOSITION_VIEW_DIRECTORY}/de-he-gk-${durationSpec.durationModel.toLowerCase()}.view.json`,
      ))
      const sourceStages = collectCompositionStructures(crossStage.rootNodes, 'physics-seki')
      const excerptStages = collectCompositionStructures(view.rootNodes, 'physics-seki')
      assert.equal(sourceStages.length, 1)
      assert.deepEqual(excerptStages, sourceStages,
        `${view.viewId}: preserve every exact lower-stage reference payload and acquisition placement`)
      const ownAtoms = (ids: Set<string>) => [...ids]
        .filter((id) => semanticGoalById.get(id)?.contains.length === 0).sort(compareCodePoints)
      const stageRoles = collectCompositionProjectionRoleGoalIds(sourceStages, physicsAndMathGoalById)
      const sourceRoles = collectCompositionProjectionRoleGoalIds(crossStage.rootNodes, physicsAndMathGoalById)
      const sourceTargetIds = new Set(ownAtoms(stageRoles.targetGoalIds))
      const required = new Set<string>()
      const pending = [...sourceTargetIds]
      while (pending.length > 0) {
        const id = pending.pop()!
        if (required.has(id)) continue
        required.add(id)
        pending.push(...(physicsAndMathGoalById.get(id)?.requires ?? []).map(normalizeGoalRef))
      }
      const explicitStageSupport = new Set(ownAtoms(stageRoles.prerequisiteOnlyGoalIds))
      const expectedSupport = new Set(ownAtoms(sourceRoles.prerequisiteOnlyGoalIds)
        .filter((id) => required.has(id) || explicitStageSupport.has(id)))
      explicitStageSupport.forEach((id) => expectedSupport.add(id))
      assert.deepEqual([...expectedSupport].sort(compareCodePoints),
        ['13b338eb-f761-5817-9058-11043b9cb253', 'f74c691b-0b76-54e0-8fd6-a22211994e0a',
          'b378c8b3-5e83-5abf-8243-b0f345037bfc', 'd3c153b9-e09b-5668-8386-73105546a7c1',
          'da26294f-4316-5bd5-a37a-bd89397b3b8b'].sort(compareCodePoints),
        'the stage-resolved excerpt retains the two declared supports and three genuinely required method preparations')
      for (const neededMethod of ['b378c8b3-5e83-5abf-8243-b0f345037bfc',
        'd3c153b9-e09b-5668-8386-73105546a7c1', 'da26294f-4316-5bd5-a37a-bd89397b3b8b']) {
        assert(required.has(neededMethod), `${view.viewId}: added method support must have a real unpruned source-seed requirement`)
      }
      const assertBoundStageRoles = (nodes: CompositionViewNode[]) => {
        const roles = collectCompositionProjectionRoleGoalIds(nodes, physicsAndMathGoalById)
        assert.deepEqual(ownAtoms(roles.targetGoalIds), [...sourceTargetIds].sort(compareCodePoints),
          'SekI excerpt must preserve the exact 134 own target atoms')
        assert.deepEqual(ownAtoms(roles.prerequisiteOnlyGoalIds), [...expectedSupport].sort(compareCodePoints),
          'SekI excerpt must preserve exactly the resolved required/explicit own support')
      }
      assertBoundStageRoles(view.rootNodes)
      const renderedOwnVisibleIds = collectRenderedAtomicGoalIdsFromCompositionView(
        rawLandscape as unknown as SkillLandscape, resolve(repoRoot, sourcePath), [durationSpec.durationModel],
        true, 'SekI', [], [rawLandscape, rawMathLandscape, rawChemistryLandscape] as unknown as SkillLandscape[],
      )
      assert.deepEqual(ownAtoms(renderedOwnVisibleIds), [...sourceTargetIds, ...expectedSupport].sort(compareCodePoints),
        'actual Sek-I own-Physics visibility agrees with its resolved target/support roles')
      for (const leakedId of HE_SEKI_UPPER_SUPPORT_LEAK_IDS) {
        assert(!required.has(leakedId), `${view.viewId}: do not prune a real required preparation ${leakedId}`)
        assert.throws(() => assertBoundStageRoles([...view.rootNodes,
          { kind: 'goalEntry', goalId: leakedId, projectionRole: 'prerequisiteOnly' }]),
        /resolved required\/explicit own support/u,
        `${view.viewId}: reject reintroduced upper-stage support ${leakedId}`)
      }
      for (const supportId of expectedSupport) {
        const removeSupport = (nodes: CompositionViewNode[]): CompositionViewNode[] => nodes.flatMap((node) => (
          node.kind === 'structure' ? [{ ...node, children: removeSupport(node.children) }]
            : collectCompositionProjectionRoleGoalIds([node], physicsAndMathGoalById).prerequisiteOnlyGoalIds.has(supportId) ? [] : [node]
        ))
        assert.throws(() => assertBoundStageRoles(removeSupport(view.rootNodes)),
          /resolved required\/explicit own support/u,
          `${view.viewId}: reject loss of necessary/explicit preparation ${supportId}`)
      }
    }
  } else {
    assert(view.scope.stage === 'CrossStage' || view.scope.stage === 'SekII')
    assert(view.scope.courseProfile === 'GK' || view.scope.courseProfile === 'LK')
    assert.equal(view.scope.durationModel, undefined, `${view.viewId} must stay duration-neutral`)
  }
  const expectedRole = sourcePath.endsWith('-sekii-gk.view.json')
    ? 'SekII:GK'
    : sourcePath.endsWith('-sekii-lk.view.json')
      ? 'SekII:LK'
      : sourcePath.endsWith('-gk.view.json')
        ? 'CrossStage:GK'
        : 'CrossStage:LK'
  if (!durationSpec) {
    assert.equal(`${view.scope.stage}:${view.scope.courseProfile}`, expectedRole, `${sourcePath} has the wrong state-view role`)
    const roleSet = roleCountByJurisdiction.get(view.scope.jurisdiction!) ?? new Set<string>()
    assert(!roleSet.has(expectedRole), `${view.scope.jurisdiction} has duplicate ${expectedRole} views`)
    roleSet.add(expectedRole)
    roleCountByJurisdiction.set(view.scope.jurisdiction!, roleSet)
  }
  const compilation = compileCompositionView(
    view,
    landscapeWithSemanticKinds,
    physicsAndMathGoalUniverse,
  )
  const errors = compilation.findings.filter(({ severity }) => severity === 'error')
  assert.deepEqual(errors, [], `invalid Physics atlas source ${sourcePath}`)
  if (view.scope.jurisdiction === 'DE-HE') {
    const targetIds = new Set(collectAtomicGoalIds(compilation.compiledRootNodes, physicsAndMathGoalById))
    for (const goalId of HE_LK_ONLY_QUANTUM_GOAL_IDS) {
      assert.equal(targetIds.has(goalId), view.scope.courseProfile === 'LK',
        `${view.viewId}: HE KC2024 Q3.3 p42 binds hydrogen-like energies and Pauli to LK, not GK`)
    }
    const clone = structuredClone(view)
    stripHeQuantumOverridesFromClonedView(clone)
    // In this counterfixture both former exclusions become ordinary targets.
    // Their conditional acquisition aliases consequently have no independent
    // placement role and must not override the restored target reference.
    const removeRestoredTargetTemplates = (nodes: CompositionViewNode[]): CompositionViewNode[] => nodes
      .filter(node => !(node.kind === 'goalEntry' && node.projectionRole === 'prerequisiteOnly'
        && node.acquisitionPlacement === true && HE_LK_ONLY_QUANTUM_GOAL_IDS.some(id => id === node.goalId)))
      .map(node => node.kind === 'structure' ? { ...node, children: removeRestoredTargetTemplates(node.children) } : node)
    clone.rootNodes = removeRestoredTargetTemplates(clone.rootNodes)
    const template = compileCompositionView(clone, landscapeWithSemanticKinds, physicsAndMathGoalUniverse)
    assert.deepEqual(template.findings.filter(({ severity }) => severity === 'error'), [])
    const templateIds = new Set(collectAtomicGoalIds(template.compiledRootNodes, physicsAndMathGoalById))
    assert.deepEqual([...targetIds].filter((id) => !templateIds.has(id)), [], 'template cleanup must not remove targets')
    assert.deepEqual([...templateIds].filter((id) => !targetIds.has(id)).sort(compareCodePoints),
      view.scope.courseProfile === 'GK' ? [...HE_LK_ONLY_QUANTUM_GOAL_IDS].sort(compareCodePoints) : [],
      'BB/BE template cloning removes only the two HE-specific quantum exclusions')
  }
  collectAtomicGoalIds(compilation.compiledRootNodes, physicsAndMathGoalById).forEach((goalId) => {
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
const e1NationalEvidenceRoot = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-11-24/e1-current-nine-v1/'
const atlasDeltaPath = `${e1NationalEvidenceRoot}national-atlas-inventory-delta.actual.json`
assert.equal(sha256(readFileSync(resolve(repoRoot, atlasDeltaPath), 'utf8')),
  '0677a4248f61248a29f9ebfe295051ec64d428115b2189811d1b1779f0295dcc')
const atlasDelta = readJson<{ beforeActualUnionCount: number; currentActualUnionCount: number
  addedTargetGoalIds: string[]; removedTargetGoalIds: string[]; beforeUnionGoalIds: string[]; currentUnionGoalIds: string[] }>(atlasDeltaPath)
assert.equal(atlasDelta.beforeActualUnionCount, 485)
assert.equal(atlasDelta.currentActualUnionCount, EXPECTED_ATLAS_TARGET_COUNT)
assert.deepEqual(atlasDelta.addedTargetGoalIds, E1_ADDED_NATIONAL_TARGET_IDS)
assert.deepEqual(atlasDelta.removedTargetGoalIds, [])
assert.deepEqual([...atlasCurricularAtomicGoalIds].sort(compareCodePoints), atlasDelta.currentUnionGoalIds)
assert.deepEqual([...atlasCurricularAtomicGoalIds].filter(id => !E1_ADDED_NATIONAL_TARGET_IDS.includes(id)).sort(compareCodePoints),
  atlasDelta.beforeUnionGoalIds, 'E.1 must preserve every independently bound prior atlas target')
assert.equal(atlasCurricularAtomicGoalIds.size, EXPECTED_ATLAS_TARGET_COUNT)
assert(atlasPreparationOnlyOccurrences > 0, 'the omitted target page must have a real authored prerequisite-only placement')
assert.deepEqual(
  [...reviewedAtomicGoalIds].filter((goalId) => !atlasCurricularAtomicGoalIds.has(goalId)),
  [ATLAS_PREPARATION_ONLY_GOAL_ID],
  'the nationwide atlas contains all current ordinary targets; only the explicit preparation-only atom has no target page',
)

const canonicalProfileTargetIds = new Set<string>()
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
  const profileTargetIds = new Set<string>()
  collectAtomicGoalIds(compilation.compiledRootNodes, physicsAndMathGoalById).forEach((goalId) => {
    if (decisionByGoalId.get(goalId)?.semanticKind === 'curricularAtomic') {
      canonicalProfileTargetIds.add(goalId)
      profileTargetIds.add(goalId)
    }
  })
  assert.deepEqual(
    [...profileTargetIds].filter((goalId) => wellSplitGoalIds.has(goalId)).sort(compareCodePoints),
    (view.scope.courseProfile === 'GK' ? [wellEnergyId] : [wellEnergyId, wellProbabilityId])
      .sort(compareCodePoints),
    `${view.viewId}: B035 projects energy in GK/LK and interval probability only in LK, never the cluster as an atom`,
  )
}
// Native projection against the pre-B035 checkpoint proved the exact delta:
// remove the former mixed atom, add energy and interval probability, keep all
// other target IDs unchanged. Bind that full prior set, not only the new count.
assert.equal(canonicalProfileTargetIds.size, 424)
const profileDeltaPath = `${e1NationalEvidenceRoot}national-canonical-profile-target-delta.actual.json`
assert.equal(sha256(readFileSync(resolve(repoRoot, profileDeltaPath), 'utf8')),
  '0a4ba6221468745be35580ec53f773c76706d19b6fbcb11fc0a1ecdb471241de')
const profileDelta = readJson<{ beforeCount: number; currentCount: number; addedGoalIds: string[]; removedGoalIds: string[]
  before: { union: string[] }; current: { union: string[] } }>(profileDeltaPath)
assert.equal(profileDelta.beforeCount, 420)
assert.equal(profileDelta.currentCount, 424)
assert.deepEqual(profileDelta.addedGoalIds, E1_ADDED_NATIONAL_TARGET_IDS)
assert.deepEqual(profileDelta.removedGoalIds, [])
assert.deepEqual([...canonicalProfileTargetIds].sort(compareCodePoints), profileDelta.current.union)
assert.deepEqual([...canonicalProfileTargetIds].filter(id => !E1_ADDED_NATIONAL_TARGET_IDS.includes(id)).sort(compareCodePoints),
  profileDelta.before.union, 'E.1 must preserve every independently bound prior canonical-profile target')
STAGE_PLAN_ADDED_NATIONAL_TARGET_IDS.forEach((id) => assert(canonicalProfileTargetIds.has(id)))
SEMICONDUCTOR_ADDED_PROFILE_TARGET_IDS.forEach((id) => assert(canonicalProfileTargetIds.has(id)))
FINAL_SPLIT_PARENT_CHILDREN.forEach((children, parentId) => {
  assert.deepEqual(semanticGoalById.get(parentId)?.contains, children)
  assert(!canonicalProfileTargetIds.has(parentId), `${parentId}: cluster is not a content atom`)
})
FINAL_SPLIT_CHILD_IDS.forEach((id) => assert(canonicalProfileTargetIds.has(id)))
const assessmentDataFor = (goalId: string) => rawGoalById.get(goalId)?.examData as ExamData | undefined
FINAL_SPLIT_ASSESSMENT_COVERAGE.forEach((coveredId, taskId) => {
  const task = semanticGoalById.get(taskId)
  assert.deepEqual(task?.requires, [coveredId])
  assert.deepEqual(assessmentDataFor(taskId)?.coveredGoalIds, [coveredId])
})
SEMICONDUCTOR_ASSESSMENT_COVERAGE.forEach((coveredId, taskId) => {
  const task = semanticGoalById.get(taskId)
  assert.deepEqual(task?.requires, [coveredId])
  assert.deepEqual(assessmentDataFor(taskId)?.coveredGoalIds, [coveredId])
})
assert.deepEqual(assessmentDataFor('88f27aab-8724-5a4d-8543-e49ebcb54b8e')?.coveredGoalIds,
  ['7d4d6a39-0c78-5fb0-b7bf-182ed00972f7'],
  'the historical transistor interpretation assessment must not acquire an own-experiment coverage claim')
// These content-reviewed rubrics score scientific essentials individually.
// Checking omission of a whole old point group missed within-group holes:
// correct labels/numbers could compensate for a false carrier/energy model.
// This is a score-contract regression for the reviewed criteria, not an
// automatic judgement of a learner's free-text scientific explanation.
const SEMICONDUCTOR_ESSENTIAL_CRITERIA = new Map([
  ['a8d99168-62cc-5771-bb5d-9ba833d84193', [
    'doping-donor-mobile', 'doping-donor-balance', 'doping-acceptor-hole',
    'doping-acceptor-balance', 'doping-hole-motion',
  ]],
  ['8670cff6-fe9c-5f7e-8cba-d170134965a6', [
    'diode-forward-appreciable', 'diode-forward-small', 'diode-reverse-nonzero',
    'diode-threshold-evidence', 'diode-applicability',
  ]],
  ['1abfd5ef-1f42-5b71-8c9a-80c0a6b0322e', [
    'band-conductor-states', 'band-gap-thermal-pairs', 'band-donor-carriers',
    'band-acceptor-hole', 'band-doping-versus-heating', 'band-both-charge-balances',
  ]],
  ['144007cb-e2bc-5c82-bf9d-dda705b15257', [
    'amplifier-a1', 'amplifier-a2', 'amplifier-a3', 'amplifier-a4',
    'amplifier-b1', 'amplifier-b2', 'amplifier-b3', 'amplifier-b4',
  ]],
  ['88f27aab-8724-5a4d-8543-e49ebcb54b8e', [
    'switch-paths-thin-base', 'switch-energy-control', 'switch-supplied-states',
    'switch-sensor-transfer', 'switch-electronic-limits',
  ]],
  ['2cfd5c6a-a16a-5f90-aab7-b27b29271f72', [
    'experiment-personal-assembly', 'experiment-own-switching', 'experiment-open-control',
    'experiment-fresh-mapping', 'experiment-evidence-boundary',
  ]],
])
for (const [taskId, essentialIds] of SEMICONDUCTOR_ESSENTIAL_CRITERIA) {
  const scoring = assessmentDataFor(taskId)?.scoring as {
    maxPoints: number; passingPoints: number; steps: Array<{ id: string; points: number }>
  } | undefined
  assert(scoring, `${taskId}: explicit analytical scoring is required`)
  assert.deepEqual(scoring.steps.map(step => step.id), essentialIds,
    `${taskId}: scientific criteria must remain separately assessable`)
  assert.equal(scoring.steps.reduce((sum, step) => sum + step.points, 0), scoring.maxPoints)
  assert(scoring.steps.every(step => step.points > 0))
  assert(scoring.maxPoints >= scoring.passingPoints, `${taskId}: complete evidence must pass`)
  for (const step of scoring.steps) {
    assert(scoring.maxPoints - step.points < scoring.passingPoints,
      `${taskId}: missing or contradicted ${step.id} cannot be compensated by all other criteria`)
  }
}
for (const taskId of ['8670cff6-fe9c-5f7e-8cba-d170134965a6', '1abfd5ef-1f42-5b71-8c9a-80c0a6b0322e',
  '144007cb-e2bc-5c82-bf9d-dda705b15257', '2cfd5c6a-a16a-5f90-aab7-b27b29271f72']) {
  const content = assessmentDataFor(taskId)?.taskContent as string
  const stimulus = content.match(/!\[[^\]]+\]\((\/assets\/(?:goal-visualizations|assessment-materials)\/physik\/[^)]+)\)/u)?.[1]
  assert(stimulus, `${taskId}: the described diagram must actually be supplied`)
  const expectedRoot = taskId === '2cfd5c6a-a16a-5f90-aab7-b27b29271f72'
    ? '/assets/goal-visualizations/physik/' : '/assets/assessment-materials/physik/'
  assert(stimulus.startsWith(expectedRoot), `${taskId}: primary goal image and assessment-only stimulus must use their declared roots`)
  assert(existsSync(resolve(repoRoot, 'app/public', stimulus.slice(1))), `${taskId}: missing diagram stimulus`)
}
// Undo the three added semiconductor atoms and explicit advanced band target,
// then the earlier final delta
// (+8 children, -3 former leaves, +road safety); preserve the old full-set proof.
// Keep the independently pinned 402 -> 393 -> 392 full-set proof below intact.
const preFinalProfileTargetIds = new Set([
  ...[...canonicalProfileTargetIds].filter((id) => !FINAL_SPLIT_CHILD_IDS.includes(id)
    && !SEMICONDUCTOR_ADDED_PROFILE_TARGET_IDS.includes(id) && id !== ROAD_SAFETY_GOAL_ID
    && !STAGE_PLAN_ADDED_NATIONAL_TARGET_IDS.includes(id)
    && !E1_ADDED_NATIONAL_TARGET_IDS.includes(id)),
  ...FINAL_SPLIT_PARENT_CHILDREN.keys(),
])
assert.equal(preFinalProfileTargetIds.size, 402)
// The B034 electronics/nuclear and B040 astronomy completion introduces exactly
// fourteen current atoms in place of five formerly visible mixed atoms. Undo
// only that reviewed delta before checking the independent B035 conservation
// proof below; no unrelated profile target may silently enter or disappear.
const completionAddedProfileTargetIds = [
  '7d4d6a39-0c78-5fb0-b7bf-182ed00972f7',
  '68034218-8f3e-5f7f-ae4e-ed057dd4e44e',
  'af5dfdbc-5fd6-5c3e-a81b-093cb7c14b93',
  '37013646-f13a-5faf-954c-940f2fd7502f',
  'c52d55c3-b687-586c-b0f9-8ffcd1069424',
  '3d466956-04fb-58d7-9008-ad8090f8706d',
  'b4772b06-b10c-52dd-841b-a96ffb7c7e28',
  '1b060e79-dc2d-5e4e-abb5-42eca39f9cc7',
  'db0394ca-297c-5892-b414-525ec186f928',
  'c2af45aa-e3fc-5119-9159-c5a260b4135a',
  'e1b21fe9-ab6f-58c4-a0b6-9895061fbabb',
  '69280706-5af6-5788-85b7-93287c2ffe74',
  '922f32ba-f214-5a82-be5c-1111aca51d4a',
  'f505f039-3f07-5afe-88b8-f02532e9c2f0',
]
const completionReplacedProfileTargetIds = [
  'ea17b0af-3d53-5a10-acda-7fd9348537ce',
  'c9405043-bdc0-5995-8b4d-5bb56d97d05d',
  'e5b3d86c-0a74-5fa7-b9c4-7964bcb5ebc9',
  '5db07785-8cca-50d5-81a9-e0264d344af9',
  '7df923a0-6470-595e-8cea-53126fad9506',
]
completionAddedProfileTargetIds.forEach((id) => assert(canonicalProfileTargetIds.has(id)))
completionReplacedProfileTargetIds.forEach((id) => assert(!canonicalProfileTargetIds.has(id)))
const preCompletionProfileTargetIds = new Set([
  ...[...preFinalProfileTargetIds].filter((id) => !completionAddedProfileTargetIds.includes(id)),
  ...completionReplacedProfileTargetIds,
])
assert.equal(preCompletionProfileTargetIds.size, 393)
const preWellSplitProfileTargetIds = new Set(
  [...preCompletionProfileTargetIds].filter((goalId) => !wellSplitGoalIds.has(goalId)),
)
preWellSplitProfileTargetIds.add(wellClusterId)
assert.equal(preWellSplitProfileTargetIds.size, 392)
assert.equal(
  sha256(`${[...preWellSplitProfileTargetIds].sort(compareCodePoints).join('\n')}\n`),
  '04cd2a9e19a6e49001f6fe1f322af35011f116131004159ca28cc0213cabfed5',
  'B035 must preserve every other canonical GK/LK target ID from the verified pre-split projection',
)
assert.equal(
  canonicalProfileTargetIds.has(ROAD_SAFETY_GOAL_ID),
  true,
  'the source-supported road-safety goal is explicitly restored to the national CrossStage target union',
)

const navigationView = normalizeCompositionView(readJson(sourceManifest.navigationViewPath))
assertFinalPhysicsAtlasPublishedTargets(atlasCurricularAtomicGoalIds)
assertFinalPhysicsAtlasDraftTargets(navigationView.rootNodes)
// Split-goal additions belong to the existing subject chapters, not alongside
// the Physics root. Keep the original branch IDs and explicit target roles.
const physicsRoot = collectCompositionStructures(navigationView.rootNodes, 'goal-book-physics-root')
assert.equal(physicsRoot.length, 1)
const expectedPhysicsBranchParents = [
  ['physics-b034-optical', 'canonical-goal-c1563745-2722-503d-819f-95d336937e2b'],
  ['physics-b034-transistor', 'canonical-goal-620d4320-6b93-500b-8a62-86d02b1ed1f0'],
  ['physics-b034-stars', 'canonical-goal-b59cb1ef-05c2-5b09-abb3-8b6903ca0fd6'],
  ['physics-b034-nuclear', 'canonical-goal-72c2bf5d-c62b-5744-9971-4c117f2a432d'],
] as const
for (const [branchId, parentId] of expectedPhysicsBranchParents) {
  const parents = collectCompositionStructures(physicsRoot[0].children, parentId)
  assert.equal(parents.length, 1, `missing unique Physics chapter ${parentId}`)
  assert.equal(collectCompositionStructures(navigationView.rootNodes, branchId).length, 1)
  assert.equal(
    parents[0].children.filter((node) => node.kind === 'structure' && node.id === branchId).length,
    1,
    `${branchId} must be nested in ${parentId}, not beside Physics`,
  )
}
for (const id of FINAL_SPLIT_CHILD_IDS) {
  const stalePublishedIds = new Set(atlasCurricularAtomicGoalIds)
  stalePublishedIds.delete(id)
  assert.throws(() => assertFinalPhysicsAtlasPublishedTargets(stalePublishedIds), /stale published model/u)
}
const missingFinalChildDraft = FINAL_SPLIT_CHILD_IDS.slice(1).map((goalId) => ({ kind: 'goalEntry', goalId }))
assert.throws(() => assertFinalPhysicsAtlasDraftTargets(missingFinalChildDraft), /exactly one explicit target/u)
assert.throws(() => assertFinalPhysicsAtlasDraftTargets([
  ...FINAL_SPLIT_CHILD_IDS.map((goalId) => ({ kind: 'goalEntry', goalId })),
  { kind: 'goalEntry', goalId: FINAL_SPLIT_CHILD_IDS[0] },
]), /exactly one explicit target/u)
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
const compiledPhysicsRoot = navigationCompilation.compiledRootNodes
  .filter((node) => node.runtimeId === 'structure:goal-book-physics-root')
assert.equal(compiledPhysicsRoot.length, 1)
// Inspect the compiled tree: two current targets come from authored subtrees,
// not direct goalEntry references. Compare lists, not sets, to catch duplicates.
const collectCompiledPhysicsTargets = (nodes: CompiledCompositionPreviewNode[]): string[] => nodes.flatMap((node) => [
  ...(node.kind === 'goal' && node.sourceGoalId
    && decisionByGoalId.get(node.sourceGoalId)?.semanticKind === 'curricularAtomic'
    ? [node.sourceGoalId] : []),
  ...collectCompiledPhysicsTargets(node.children),
])
assert.deepEqual(
  collectCompiledPhysicsTargets(compiledPhysicsRoot).sort(compareCodePoints),
  [...atlasCurricularAtomicGoalIds].sort(compareCodePoints),
  'every current curricularAtomic atlas target must occur exactly once below Physics',
)
const navigationGoalIds = new Set([...collectAtomicGoalIds(
  navigationCompilation.compiledRootNodes,
  physicsAndMathGoalById,
)].filter((goalId) => decisionByGoalId.get(goalId)?.semanticKind === 'curricularAtomic'))
assert.deepEqual(
  [...navigationGoalIds].sort(compareCodePoints),
  [...atlasCurricularAtomicGoalIds].sort(compareCodePoints),
  'canonical goal-book navigation must place all current atlas goals exactly once',
)

const durationPolicy = readJson<{
  schemaVersion: number
  updatedAt: string
  decisions: PhysicsDurationDecision[]
}>(LEGACY_DURATION_POLICY_PATH)
assert.equal(sha256(readFileSync(resolve(repoRoot, LEGACY_DURATION_POLICY_PATH), 'utf8')),
  '80f8697ebdbc457f2accd3f552b84f072d89b5852ebbd5e33b1da8116c6aaa07',
  'the complete 2026-08-20 Physics snapshot is immutable historical evidence')
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
  sourceViews.filter(({ durationModel }) => durationModel === null),
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

const activeDurationPolicy = readJson<{
  schemaVersion: number
  updatedAt: string
  parentPolicy: { path: string; sha256: string }
  decisions: PhysicsDurationDecision[]
}>(DURATION_POLICY_PATH)
assert.equal(activeDurationPolicy.schemaVersion, 1)
assert.equal(activeDurationPolicy.updatedAt, '2026-11-16')
assert.deepEqual(activeDurationPolicy.parentPolicy, {
  path: LEGACY_DURATION_POLICY_PATH,
  sha256: sha256(readFileSync(resolve(repoRoot, LEGACY_DURATION_POLICY_PATH), 'utf8')),
})
assert.equal(activeDurationPolicy.decisions.length, 17)
assert.deepEqual(
  activeDurationPolicy.decisions.filter(({ jurisdiction }) => jurisdiction !== 'DE-HE'),
  durationPolicy.decisions.filter(({ jurisdiction }) => jurisdiction !== 'DE-HE'),
  'all fifteen non-Hessen Physics decisions must exactly retain the complete parent rows',
)
const activeHeDecisions = activeDurationPolicy.decisions.filter(({ jurisdiction }) => jurisdiction === 'DE-HE')
assert.equal(activeHeDecisions.length, 2)
activeHeDecisions.forEach((decision, index) => {
  assert.equal(decision.subject, 'Physik')
  assert.equal(decision.status, 'reviewed')
  assert.equal(decision.stage, 'SekI')
  assert.equal(decision.decision, 'dual-duration-different-projection')
  assert.deepEqual(decision.durationModels, ['G8', 'G9'])
  assert.equal(decision.learnerFacingProjection, 'duration-specific-composition-views')
  assert.deepEqual(decision.compositionViewIds, HE_DURATION_VIEW_SPECS.map(({ viewId }) => viewId).sort(compareCodePoints))
  const durationModel = index === 0 ? 'G8' : 'G9'
  assert.equal(decision.sourceExtractionPath,
    `curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_PHYSIK_SEKI_${durationModel}.source-extraction.json`)
  const extraction = readJson<{
    subject: string; jurisdiction: string; stage: string; durationModel?: string
    sourceDocument: { key: string; official: boolean; path: string; sha256?: string }
  }>(decision.sourceExtractionPath!)
  assert.equal(extraction.subject, 'Physik')
  assert.equal(extraction.jurisdiction, 'DE-HE')
  assert.equal(extraction.stage, 'SekI')
  assert.equal(extraction.sourceDocument.key, durationModel)
  if (durationModel === 'G8') {
    assert.equal(extraction.durationModel, 'G8')
    assert.match(extraction.sourceDocument.sha256 ?? '', /^[0-9a-f]{64}$/u)
  }
  assert.equal(extraction.sourceDocument.official, true)
  // Retained PDFs are optional in repository checkouts; their extraction and
  // official locator stay mandatory. Verify bytes wherever the PDF is present.
  if (extraction.sourceDocument.sha256 && existsSync(resolve(repoRoot, extraction.sourceDocument.path))) {
    assert.equal(createHash('sha256').update(readFileSync(resolve(repoRoot, extraction.sourceDocument.path))).digest('hex'),
      extraction.sourceDocument.sha256)
  }
})
parseSubjectDurationModelPolicy(activeDurationPolicy, 'Physik', [...EXPECTED_JURISDICTIONS], sourceViews)
const activeOfferingPolicy = loadActiveGymnasiumDurationPolicy(repoRoot)
assert.deepEqual(
  activeOfferingPolicy.decisions.filter(({ subject, jurisdiction }) => subject !== 'Physik' || jurisdiction !== 'DE-HE'),
  sharedDurationPolicy.decisions.filter(({ subject, jurisdiction }) => subject !== 'Physik' || jurisdiction !== 'DE-HE'),
  'live offerings/readiness must retain every shared non-Hessen row exactly, including the other nine Physics rows',
)
assert.deepEqual(
  activeOfferingPolicy.decisions.filter(({ subject, jurisdiction }) => subject === 'Physik' && jurisdiction === 'DE-HE'),
  activeHeDecisions,
  'live offerings/readiness must replace only Hessen Physics with both active source rows',
)

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
assert.equal(routeProjectionRule.status, 'pass', 'current acquisition routes must retain the protected Physics quality floor')
const routeMetrics = routeProjectionRule.metrics ?? {}
const legacyRouteProfile = routeProfileDefinitions.find(profile => profile.profileId === 'canonical-physics-sek1')!
const currentRouteProfile = createRouteProfiles(repoRoot).find(profile => profile.profileId === legacyRouteProfile.profileId)!
const currentPhysics = rawLandscape as unknown as SkillLandscape
const currentSekIIProfile = createRouteProfiles(repoRoot).find(profile => profile.profileId === 'canonical-physics-sek2')!
const currentTerminalRelease = evaluateRouteProfile(currentPhysics, currentSekIIProfile, applicabilityCompilation)
  .rules.find(rule => rule.id === 'CQR-203')!
assert.equal(currentTerminalRelease.status, 'pass', 'every active terminal assessment must carry reviewed whole-goal coverage')
assert.equal(currentTerminalRelease.metrics?.releaseCoverageIncompleteExamData, 0)
// 110 since the mixed E.1 exam "Bewegungsanalyse und freier Fall" was retired on 25 Nov 2026 (111 before).
assert.equal(currentTerminalRelease.metrics?.releasedCoverageCompleteExamData, 110)
assert.equal(currentTerminalRelease.metrics?.terminalAutonomyGoals, currentTerminalRelease.metrics?.releasedCoverageCompleteExamData)

const legacySelectedGoalIds = currentPhysics.goals.filter(legacyRouteProfile.goalSelector).map(goal => goal.id)
const currentSelectedGoalIds = currentPhysics.goals.filter(currentRouteProfile.goalSelector).map(goal => goal.id)
assert.equal(legacySelectedGoalIds.length, 99)
assert.deepEqual(
  [...currentSelectedGoalIds].sort(compareCodePoints),
  [...legacySelectedGoalIds, ...EXPECTED_PHYSICS_SEKI_ADDED_TARGET_OCCURRENCES.keys(),
    ...SEMICONDUCTOR_ADDED_SEKI_ROUTE_TARGET_IDS,
    '8aff7aac-321b-5172-ac55-877876bfd2cd',
    'f6b1d812-ce8b-5852-b417-e6c29b533c7a',
    'b615830a-e8b0-5754-81e0-99da98343a8d',
    'f23fdfa9-38b6-5157-8301-ed302476c456',
    '75b9ca4c-178e-5df2-adc4-f7f78e9d28e5',
    '691c11d0-fa6a-5d2e-a19c-086e89c3c233',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
    'd8b2b349-b83a-5225-a180-1afe205750cd',
  ].sort(compareCodePoints),
  'The current shared Physics Sek-I lane retains the reviewed split/semiconductor targets and the eight reviewed stage-plan additions',
)
const addedTargetOccurrences = new Map([...EXPECTED_PHYSICS_SEKI_ADDED_TARGET_OCCURRENCES.keys()].map(goalId => {
  const measured = evaluateRouteProfile(currentPhysics, {
    ...currentRouteProfile, goalSelector: goal => goal.id === goalId,
  }, applicabilityCompilation).rules.find(rule => rule.id === 'CQR-104')!
  return [goalId, measured.metrics?.visibleProfileSelectedAtomicGoalOccurrences]
}))
assert.deepEqual(
  addedTargetOccurrences,
  EXPECTED_PHYSICS_SEKI_ADDED_TARGET_OCCURRENCES,
  'The 78 selected occurrences retain exactly the five reviewed targets across the expanded view inventory',
)
assert.equal([...addedTargetOccurrences.values()].reduce((sum, count) => sum + (count ?? 0), 0), 78)
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
  'The profile selector diagnostic must retain every remaining tag/phase mismatch after the five-target correction',
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
  + `${EXPECTED_COUNTS.curricularAtomic} ordinary curricular atoms, ${EXPECTED_ATLAS_TARGET_COUNT} atlas targets in 64 neutral plus six HE duration state views; `
  + `${EXPECTED_JURISDICTIONS.length} reviewed duration decisions.`,
)
