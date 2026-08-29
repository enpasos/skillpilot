import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, resolve } from 'node:path'

// The bounded curriculum ledgers predate a shared TypeScript model and are
// checked field by field below.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonRecord = Record<string, any>
type PlannedFile = { path: string; bytes: string; appendOnly?: boolean }

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
const allowedArguments = new Set(['--write', '--check'])
const unexpectedArguments = process.argv.slice(2).filter((argument) => !allowedArguments.has(argument))
if (unexpectedArguments.length > 0) {
  throw new Error('Unexpected arguments: ' + unexpectedArguments.join(', '))
}
if (writeMode && checkMode) throw new Error('Use either --write or --check, not both')

const reviewedAt = '2026-08-28'
const reviewer = 'codex-math-batch-017-trigonometric-adjudication-2026-08-28'
const visualizationReviewedAt = '2026-08-28T19:30:00.000Z'
const visualizationReviewer = 'codex-math-batch017-visual-compatibility-2026-08-28'
const mathLandscapeId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const expectedAdjudicationSha256 = '5eb027f3be62c82a040320df3938f3cb21f6461707d46c3a07b301873f37f60d'
const expectedFollowUpConfigSha256 = 'ed51b9cce4aef37c63a66aed067b7d4d1f707881992bb807a73c689a827d9198'

// This digest is deliberately bound only after the source-bound decisions and
// the complete read-only plan have Product-Owner approval.
const expectedBoundedPlanSha256 = '15beef21cf8dd4c843a94ae50b41e3ea4fc75aad9fc968ed75d906091913ecc8'

const ids = {
  differenceQuotientLimit: 'b42bdfcc-3db7-5697-8b3e-69e50962ca86',
  elementaryDerivatives: '858113c5-e53b-57bb-b01f-ba95c3ddcb6f',
  sineCosineUnderstanding: 'bbef7cf2-90fa-59fa-a115-8b651aab9231',
  parameterInterpretation: 'ea8e3dfb-7fd7-5d49-ae07-01864e6aa464',
  derivativeDerivation: 'e28e906e-e4f4-5cb1-b4b1-9bdc67d2ef32',
  derivativeApplication: '3401d95d-2191-5929-ac78-4de51d71a6be',
  transformedSineCosineChainRule: '58d2f963-4fb9-550d-a832-f5ac60808900',
  trigonometricEquations: 'ecd13e54-ab0e-550f-9400-66e13306635d',
  periodicModeling: '56fba457-ab98-5b96-963e-ec284458c17f',
  trigonometricAssessment: '2c30949d-0381-5d32-81cf-c6eac7711399',
} as const

const reviewGoalIds = [
  ids.differenceQuotientLimit,
  ids.elementaryDerivatives,
  ids.sineCosineUnderstanding,
  ids.parameterInterpretation,
  ids.derivativeDerivation,
  ids.derivativeApplication,
  ids.trigonometricEquations,
  ids.periodicModeling,
] as const

const expectedRevisedGoalIds = [
  ids.elementaryDerivatives,
  ids.derivativeDerivation,
  ids.derivativeApplication,
  ids.trigonometricEquations,
  ids.periodicModeling,
] as const

const protectedVisualizationGoalIds = [
  ids.elementaryDerivatives,
  ids.parameterInterpretation,
  ids.derivativeDerivation,
  ids.derivativeApplication,
  ids.trigonometricEquations,
  ids.periodicModeling,
] as const

const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
  visualizationQa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json',
  visualizationReview:
    'curricula/DE/Gymnasium/quality/goal-visualization-review/mathematik-batch-215.md',
  assessmentCoverageReview:
    'curricula/DE/Gymnasium/assessments/mathematik/sekii/e/'
    + 'trigonometric-understanding-model-derivative/coverage_correction_review_v2.md',
  assessmentDraft:
    'curricula/DE/Gymnasium/assessments/mathematik/sekii/e/'
    + 'trigonometric-understanding-model-derivative/draft_v1.md',
  assessmentSolution:
    'curricula/DE/Gymnasium/assessments/mathematik/sekii/e/'
    + 'trigonometric-understanding-model-derivative/solution_v1.md',
  assessmentReviewV1:
    'curricula/DE/Gymnasium/assessments/mathematik/sekii/e/'
    + 'trigonometric-understanding-model-derivative/simulated_review_v1.md',
  shSourceExtraction:
    'curricula/DE/Gymnasium/input/SH/upper-secondary/source-extraction/'
    + 'DE_SH_MATHEMATIK_SEKII_FACHANFORDERUNGEN_2024.source-extraction.json',
  shMappingReview:
    'curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/'
    + 'sh_math_upper_secondary_source_extraction_to_canonical_math.review.json',
  adjudication:
    'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-28/'
    + 'batch-017-e-trigonometric-context-recheck-8-v1/third-adjudication/adjudication.json',
  followUpConfig:
    'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-28/'
    + 'batch-018-e-trigonometric-final-current-5-v1.config.json',
  batchRoot:
    'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-28/'
    + 'batch-017-e-trigonometric-context-recheck-8-v1',
  batchConfig:
    'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-28/'
    + 'batch-017-e-trigonometric-context-recheck-8-v1.config.json',
} as const

const roundAStem =
  'mathematik-rollout-v1-batch-017-e-trigonometric-context-recheck-8-v1-20260828-first-pass-a'
const roundBStem =
  'mathematik-rollout-v1-batch-017-e-trigonometric-context-recheck-8-v1-20260828-first-pass-b'

const inputPaths = {
  config: paths.batchConfig,
  batchManifest: paths.batchRoot + '/batch-manifest.json',
  bundleManifest: paths.batchRoot + '/bundle/manifest.json',
  bundleReviewInputJson: paths.batchRoot + '/bundle/review-input.json',
  bundleReviewInputJsonl: paths.batchRoot + '/bundle/review-input.jsonl',
  dualSummary: paths.batchRoot + '/dual-summary.json',
  roundADescriptionInput: paths.batchRoot + '/round-a/description-review-input.json',
  roundABatchInput: paths.batchRoot + '/round-a/batches/' + roundAStem + '.batch-001.input.jsonl',
  roundARun: paths.batchRoot + '/round-a/results/' + roundAStem + '.batch-001.run.json',
  roundARecords: paths.batchRoot + '/round-a/results/' + roundAStem + '.batch-001.records.jsonl',
  roundBDescriptionInput: paths.batchRoot + '/round-b/description-review-input.json',
  roundBBatchInput: paths.batchRoot + '/round-b/batches/' + roundBStem + '.batch-001.input.jsonl',
  roundBRun: paths.batchRoot + '/round-b/results/' + roundBStem + '.batch-001.run.json',
  roundBRecords: paths.batchRoot + '/round-b/results/' + roundBStem + '.batch-001.records.jsonl',
} as const

const expectedInputHashes: Record<string, string> = {
  [inputPaths.config]: '8d4c613048ada997ef0a0119ea22b5efb04d91b63e17bcc298a90cdfe1246aed',
  [inputPaths.batchManifest]: '58d33959d0614fd03a818a406ded972447f2098bb15a743a14204c824b6787ff',
  [inputPaths.bundleManifest]: 'efc8545d483b8776b952e65c85374c81396080ea9b8f6b4bcc88042242bdc8e5',
  [inputPaths.bundleReviewInputJson]:
    '8922a477785c1d88efd8bf99d2747f2ffe155fcdd76981283e8bf0e0458c1d73',
  [inputPaths.bundleReviewInputJsonl]:
    '33482b65c90262acd5f040b08c0e1865f4d89507f57035ee234fe409edfb8b18',
  [inputPaths.dualSummary]: '3869808b52dd8a6a5416d428ee78d466ebcda83a49dfacc9d11c011800be58a9',
  [inputPaths.roundADescriptionInput]:
    'f57f79170a2389d9e1a00d8dbed92fd1d8c96c5f458205f2d04cfaae8cd505ae',
  [inputPaths.roundABatchInput]: '498d69f334d19ebc7df252fcbd6676c0d03db085f19d21c9de4ffd51f3084d6b',
  [inputPaths.roundARun]: 'e84d8f0e8f8e32472a12ff83fb230c10375cb5766bddc71b1f99e21391dc2a17',
  [inputPaths.roundARecords]: '1a0c01715b28cf5bb9655bc72cb5bce3aa376005d83a7b0bc2f7cda3449668dd',
  [inputPaths.roundBDescriptionInput]:
    'f57f79170a2389d9e1a00d8dbed92fd1d8c96c5f458205f2d04cfaae8cd505ae',
  [inputPaths.roundBBatchInput]: '657950a803d1ad78c093b3344ddc7d6d2b65b27aa5255c820cc6dd2c8a55ea32',
  [inputPaths.roundBRun]: '2e5d71829813fda2e5edd7e11516df1fd1f5a385dea764e564b9642c9d890567',
  [inputPaths.roundBRecords]: 'f2bf9d263bab1d729524d4161c63d8c8c8b08add520b1945a556066d7d3f10ed',
}

const sourceBindingInputHashes: Record<string, string> = {
  [paths.shSourceExtraction]: '71b9b16473d16ae6d526bfdc56a7c39b03a1ad0512f4dfd19a007213e583ac87',
  [paths.shMappingReview]: '235fa7a295ab2b8d44b9c25495730e4895d0ec3cc0aadb280cffc87c72807976',
}

const protectedAssessmentFiles: Record<string, string> = {
  [paths.assessmentDraft]: '243699d66802f0376b6c87c79796c0f9452acbfb82e42fb7c07a7f2edc6f437c',
  [paths.assessmentSolution]: 'ff8951926fcc861055f935cc8298f9e18bcac2ede67436598ae2468e4da1cccb',
  [paths.assessmentReviewV1]: '1bf0a22560eb1a1c99a214c28293d6fc1f44d0cda635490591de1984886523ad',
}

const assessmentCoverageBefore = [
  ids.sineCosineUnderstanding,
  ids.derivativeDerivation,
  ids.derivativeApplication,
  ids.periodicModeling,
] as const

const assessmentCoverageFinal = [
  ids.sineCosineUnderstanding,
  ids.derivativeDerivation,
  ids.derivativeApplication,
  ids.transformedSineCosineChainRule,
  ids.periodicModeling,
] as const

const assessmentReviewNoteBefore =
  'released after focused simulated internal review on 2026-08-28 for the Batch-016 '
  + 'trigonometric understanding, modeling and derivative route'
const expectedAssessmentGoalBeforeHash =
  '79ea71f478703ba0c2e0e93c0c3dc86dfe4506e959d917460aa6c251633dbf14'
const expectedAssessmentImmutablePayloadHash =
  'da34130b4c6839e55fa1242e802148b93fd98f2432a271cb7f12babd713a4706'
const expectedAssessmentTaskContentSha256 =
  '38dbe4a45f7cc2ff60565320933398304be3b202996b142fc07c8a3a42743aca'
const expectedAssessmentSolutionContentSha256 =
  '5303263a5e39d0d2ae87288762b195e44cd9fc2f1b0188f12970a08a050a8209'
const expectedAssessmentScoringHash =
  '4e1140a2f71b193a59778676f0f8d2c03d2f7d4163a4014b6aadd3d3e7658a93'

const expectedShEvidence = [
  {
    code: 'K018',
    sourceGoalId:
      'de-sh-mathematik-sekii-fachanforderungen-2024-sh-sekii-l4-'
      + 'funktionaler-zusammenhang-K018-ea9c6d8ade',
    topicCode: 'SH-SEKII-L4-FUNKTIONALER-ZUSAMMENHANG-K018',
    sourceText: 'bilden Ableitungen der Funktionen der oben genannten Funktionsklassen',
    sourcePage: 67,
    sourceLine: 3594,
    mappingDecision: 'mapped',
    mappingMatchType: 'partial',
  },
  {
    code: 'T040',
    sourceGoalId:
      'de-sh-mathematik-sekii-fachanforderungen-2024-sh-sekii-l4-'
      + 'funktionaler-zusammenhang-T040-bd30abc57c',
    topicCode: 'SH-SEKII-L4-FUNKTIONALER-ZUSAMMENHANG-T040',
    sourceText: 'Sinusfunktion',
    sourcePage: 66,
    sourceLine: 3524,
    mappingDecision: 'mapped',
    mappingMatchType: 'partial',
  },
  {
    code: 'T041',
    sourceGoalId:
      'de-sh-mathematik-sekii-fachanforderungen-2024-sh-sekii-l4-'
      + 'funktionaler-zusammenhang-T041-bf2d1db023',
    topicCode: 'SH-SEKII-L4-FUNKTIONALER-ZUSAMMENHANG-T041',
    sourceText: 'Kosinusfunktion',
    sourcePage: 66,
    sourceLine: 3526,
    mappingDecision: 'mapped',
    mappingMatchType: 'partial',
  },
  {
    code: 'T052',
    sourceGoalId:
      'de-sh-mathematik-sekii-fachanforderungen-2024-sh-sekii-l4-'
      + 'funktionaler-zusammenhang-T052-ae5648aa91',
    topicCode: 'SH-SEKII-L4-FUNKTIONALER-ZUSAMMENHANG-T052',
    sourceText: 'Tangentensteigung',
    sourcePage: 67,
    sourceLine: 3561,
    mappingDecision: 'mapped',
    mappingMatchType: 'partial',
  },
  {
    code: 'T056',
    sourceGoalId:
      'de-sh-mathematik-sekii-fachanforderungen-2024-sh-sekii-l4-'
      + 'funktionaler-zusammenhang-T056-797b8e72f9',
    topicCode: 'SH-SEKII-L4-FUNKTIONALER-ZUSAMMENHANG-T056',
    sourceText: 'Ableitungsfunktion',
    sourcePage: 67,
    sourceLine: 3571,
    mappingDecision: 'mapped',
    mappingMatchType: 'partial',
  },
  {
    code: 'T065',
    sourceGoalId:
      'de-sh-mathematik-sekii-fachanforderungen-2024-sh-sekii-l4-'
      + 'funktionaler-zusammenhang-T065-c9112a010f',
    topicCode: 'SH-SEKII-L4-FUNKTIONALER-ZUSAMMENHANG-T065',
    sourceText: 'Ableitungsregeln zu den oben genannten Funktionsklassen',
    sourcePage: 67,
    sourceLine: 3594,
    mappingDecision: 'mapped',
    mappingMatchType: 'partial',
  },
] as const

const protectedVisualizationFiles: Record<string, string> = {
  ['curricula/DE/Gymnasium/visualizations/mathematik/' + ids.elementaryDerivatives
    + '/' + ids.elementaryDerivatives + '.jpg']:
    '6dd353e0f56b9e2fd5f93c02eaef3cca0107fef0e5645dc2e3963323120dd7ad',
  ['app/public/assets/goal-visualizations/mathematik/' + ids.elementaryDerivatives
    + '/' + ids.elementaryDerivatives + '.jpg']:
    '6dd353e0f56b9e2fd5f93c02eaef3cca0107fef0e5645dc2e3963323120dd7ad',
  ['curricula/DE/Gymnasium/visualizations/mathematik/' + ids.elementaryDerivatives
    + '/prompt.de.md']:
    'f66f692abcc41c8f9a42723c59c53a230b9dafb13ba90b8df03b0f85d7270c5a',
  ['curricula/DE/Gymnasium/visualizations/mathematik/' + ids.elementaryDerivatives
    + '/image-reconstruction-prompt.de.md']:
    '0c4b68bef42ea452aa8291b4d905e683632bee255be31988ff011ba19e905e70',
  ['curricula/DE/Gymnasium/visualizations/mathematik/' + ids.parameterInterpretation
    + '/' + ids.parameterInterpretation + '.jpg']:
    '6dd0693afc2a381a26ed23fe00a71308fa3ac45abdb32bd4fee75a3adf119a67',
  ['app/public/assets/goal-visualizations/mathematik/' + ids.parameterInterpretation
    + '/' + ids.parameterInterpretation + '.jpg']:
    '6dd0693afc2a381a26ed23fe00a71308fa3ac45abdb32bd4fee75a3adf119a67',
  ['curricula/DE/Gymnasium/visualizations/mathematik/' + ids.parameterInterpretation
    + '/prompt.de.md']:
    '1c8454f55d06558d3bab63d4be91ae8e57bd7f50d9cb5cebbe747f84af6488ae',
  ['curricula/DE/Gymnasium/visualizations/mathematik/' + ids.derivativeDerivation
    + '/' + ids.derivativeDerivation + '.jpg']:
    '96933056dc90a03f22ad469787213a303a32a4d8889135887cd67dcdf30874af',
  ['app/public/assets/goal-visualizations/mathematik/' + ids.derivativeDerivation
    + '/' + ids.derivativeDerivation + '.jpg']:
    '96933056dc90a03f22ad469787213a303a32a4d8889135887cd67dcdf30874af',
  ['curricula/DE/Gymnasium/visualizations/mathematik/' + ids.derivativeDerivation
    + '/prompt.de.md']:
    '2475adaf8316aaf3299f87de1592c8201e999f617c63f2efaa85e1ddeb85ecc3',
  ['curricula/DE/Gymnasium/visualizations/mathematik/' + ids.derivativeDerivation
    + '/image-reconstruction-prompt.de.md']:
    '99ca43f8628654bcc6bf41b587fe353a56e22ea80602a3a65eafb0d736931902',
  ['curricula/DE/Gymnasium/visualizations/mathematik/' + ids.derivativeApplication
    + '/' + ids.derivativeApplication + '.jpg']:
    'd24795b324991948910d8a91661e664f096a9fa1a8a3969a48732abe8e0a16ce',
  ['app/public/assets/goal-visualizations/mathematik/' + ids.derivativeApplication
    + '/' + ids.derivativeApplication + '.jpg']:
    'd24795b324991948910d8a91661e664f096a9fa1a8a3969a48732abe8e0a16ce',
  ['curricula/DE/Gymnasium/visualizations/mathematik/' + ids.derivativeApplication
    + '/prompt.de.md']:
    'd8304bd1b007eeee8a31b9d79f092403e4abed99b46d463cec82e4e7f8741bf2',
  ['curricula/DE/Gymnasium/visualizations/mathematik/' + ids.derivativeApplication
    + '/image-reconstruction-prompt.de.md']:
    '8db42997f3ad21529fe3ba4dd217f6dad4fd4c066c917166c26cb3da29f1ab15',
  ['curricula/DE/Gymnasium/visualizations/mathematik/' + ids.trigonometricEquations
    + '/' + ids.trigonometricEquations + '.jpg']:
    '9945eed964b3a2e9455a44c0cb5e721c5508f4e752ec3449210b85ed78602d62',
  ['app/public/assets/goal-visualizations/mathematik/' + ids.trigonometricEquations
    + '/' + ids.trigonometricEquations + '.jpg']:
    '9945eed964b3a2e9455a44c0cb5e721c5508f4e752ec3449210b85ed78602d62',
  ['curricula/DE/Gymnasium/visualizations/mathematik/' + ids.trigonometricEquations
    + '/prompt.de.md']:
    'cab583ca0dc7798f544c8b42f47415b5c71c4794093dd692ccc507dca3c72ed2',
  ['curricula/DE/Gymnasium/visualizations/mathematik/' + ids.trigonometricEquations
    + '/image-reconstruction-prompt.de.md']:
    'd29b3a6129694fa591e43e7ddc5300156e486d6e96c3bba66f46faff617e12da',
  ['curricula/DE/Gymnasium/visualizations/mathematik/' + ids.periodicModeling
    + '/' + ids.periodicModeling + '.jpg']:
    '6c88901fda888fe3eafa76f64e7a56e30515aa3f1dbe270089b43abbd6c8b2e6',
  ['app/public/assets/goal-visualizations/mathematik/' + ids.periodicModeling
    + '/' + ids.periodicModeling + '.jpg']:
    '6c88901fda888fe3eafa76f64e7a56e30515aa3f1dbe270089b43abbd6c8b2e6',
  ['curricula/DE/Gymnasium/visualizations/mathematik/' + ids.periodicModeling
    + '/prompt.de.md']:
    'ee2465a35f0da6f662837298370ff4b41cde5a7d50df1a3eb615c46f6e6bb1b1',
}

const batch216B42Bindings: Record<string, string> = {
  ['curricula/DE/Gymnasium/visualizations/mathematik/' + ids.differenceQuotientLimit
    + '/' + ids.differenceQuotientLimit + '.png']:
    '514af0868752c41d908acc4989b683026a90ee144571ee6d5ead4fdfb93dacd0',
  ['app/public/assets/goal-visualizations/mathematik/' + ids.differenceQuotientLimit
    + '/' + ids.differenceQuotientLimit + '.png']:
    '514af0868752c41d908acc4989b683026a90ee144571ee6d5ead4fdfb93dacd0',
  ['backend/src/main/resources/static/assets/goal-visualizations/mathematik/'
    + ids.differenceQuotientLimit + '/' + ids.differenceQuotientLimit + '.png']:
    '514af0868752c41d908acc4989b683026a90ee144571ee6d5ead4fdfb93dacd0',
  ['curricula/DE/Gymnasium/visualizations/mathematik/' + ids.differenceQuotientLimit
    + '/repo-native-geometry-v4.svg']:
    '1b135b3a386bc1c568c6ee44ab06fc9f2f41711797473ffe521a7933ecd95713',
  ['curricula/DE/Gymnasium/visualizations/mathematik/' + ids.differenceQuotientLimit
    + '/prompt.nano-banana-original.de.md']:
    '529bc2d58dedfafcdb80bc228893a25d9b601207b9f9951eb0a605eba343ddc0',
  ['curricula/DE/Gymnasium/visualizations/mathematik/' + ids.differenceQuotientLimit
    + '/prompt.de.md']:
    'dab6fac2029107f5431559e0e3e76b6a714ad262b245e45699a56a30c9ae0f9c',
  ['curricula/DE/Gymnasium/quality/goal-visualization-review/mathematik-batch-216.md']:
    '4801a012a62f6d4e460fd522f81a1b77d2729d50340afaafb232274f7f90129d',
}

const expectedBeforeRecordHashes = {
  semanticKinds: {
    [ids.differenceQuotientLimit]: 'c7d39b26774502af47a99f308203290de33a1e20c39e972091cc58528ca482e0',
    [ids.elementaryDerivatives]: '0f4c5497f930e07c6bb9b343366d9a8b94ab2c96a0f3b1c6958b54b2d04391da',
    [ids.parameterInterpretation]: 'c8a92463020eb51e80d2e90a4e808f94d42e8855973a0d861864886b723821e3',
    [ids.derivativeDerivation]: 'f1c8c276aa8f4f9410b9ad362b7bedd2115c28028939a67ad728728af414fe61',
    [ids.derivativeApplication]: 'c3f19305468a27a72853bc7d01f8d6147f8be76248fb8d2469b7822a5f754fdf',
    [ids.trigonometricEquations]: '49c12fce9a1e739d93e17754930f5a11a19fabac921fca36ea9e48e34487843f',
    [ids.periodicModeling]: 'd478ccd7e58a98bf0035897c57f42a97fe6cc8f704b3a320beddc3af3ad6c24c',
    [ids.trigonometricAssessment]:
      '32fd3e98654901d72cfdf3f9d6e04b39dbbbbb3fcab5f1e8a9959c8bd8d7c4c0',
  },
  atomicity: {
    [ids.differenceQuotientLimit]: '6bb02763b4e520cd0610569a25eb5c28d64e0a0e0c87a706521262bed551b015',
    [ids.elementaryDerivatives]: '1eeb76886bedc91fa7e2b1b668a821f1a2183462b637a1c4854e1f04b2287b6b',
    [ids.parameterInterpretation]: 'e6cc73fddcdb952792cacba66adaee2d98e7bc23d4ad2ed21807e101a905eac8',
    [ids.derivativeDerivation]: '1f8f5cb13da920605706b570ad2850397e3e52b6c85c7c9f423f4b2f72560a35',
    [ids.derivativeApplication]: '3cd194dae81f5c5844c27dd8d4cd54f6853ea474cc238c4ca3f271ab58d17adb',
    [ids.trigonometricEquations]: 'a0768bf0174e05f1785ee4928033e19756247d0e23a40e7d1d8abba6ec6f32cb',
    [ids.periodicModeling]: '26b4296efd0445d4dc931c224636a933efebe0282c088d6543690e26f45c9479',
  },
  memory: {
    [ids.differenceQuotientLimit]: '6deb8311fcb3ce54afdc330ba5e689383d3cbac34dae0fa381eb6b5a0a692f80',
    [ids.elementaryDerivatives]: '9f5fcc235261fdde8b730315e9476c75fce11492c54cc9e69978db43f263fe68',
    [ids.parameterInterpretation]: '7cf42e618373166cd12578a218e9dae1a189d4aef489c8b7196af1d4a1467ee7',
    [ids.derivativeDerivation]: 'f26c0119c86b80071841d52e69046e082035d18eec799763acff14d4dbccc669',
    [ids.derivativeApplication]: 'bc9c3bfdbf9802870c324793e06ae23b642cec40173f0eae92014164677b654b',
    [ids.trigonometricEquations]: '2a5d2853a0e35a951138837eb237fc21629dd95fd991993e981f52042da5c69f',
    [ids.periodicModeling]: 'abf6929fa43939dcb65671045d78fabc76b3069a872a87818860a09c03503750',
  },
  visualizationQa: {
    [ids.differenceQuotientLimit]: 'f1fb6e645de3e923a969adefba70aa781ab99d3d9d1a9ba8a882e140fd6dfa01',
    [ids.elementaryDerivatives]: '66d26f62bf97ff54a809ea47f3ce53cfdb52670fc9064c860f89bae45f3eab1a',
    [ids.parameterInterpretation]: '71634d96313fecf721a7fcdef28ffd99f3d30e4ff9f76a50534e410b2c3a63d5',
    [ids.derivativeDerivation]: '00aa9d8ed8cc3efe9946a22a46211134aad4ce2766f8ea845837323508af0318',
    [ids.derivativeApplication]: 'eee014d4e5b6c6e902e3847fce1faf09dfc466fcfa99b435ed291556aa9f8ff7',
    [ids.trigonometricEquations]: '33fed9265cf2e218dc7724ba4fe8dd062ed589dd5c87cd84ba4cc5e7cfc879b5',
    [ids.periodicModeling]: '656d51e7e73c0c0ad9107f0d4f1b8c28d405154dae8dec0556f573a704d49cdc',
  },
} as const

const expectedMemoryStates: Record<string, JsonRecord> = {
  [ids.differenceQuotientLimit]: { status: 'no_memory_needed', memoryUseful: false },
  [ids.elementaryDerivatives]: {
    status: 'memory_required',
    memoryUseful: true,
    memoryGoalIds: ['ca708087-71f8-5fae-91c5-b80721a4208f'],
    deckIds: ['de_gymnasium_math_analysis_core'],
  },
  [ids.parameterInterpretation]: { status: 'no_memory_needed', memoryUseful: false },
  [ids.derivativeDerivation]: { status: 'no_memory_needed', memoryUseful: false },
  [ids.derivativeApplication]: { status: 'no_memory_needed', memoryUseful: false },
  [ids.trigonometricEquations]: { status: 'no_memory_needed', memoryUseful: false },
  [ids.periodicModeling]: { status: 'no_memory_needed', memoryUseful: false },
}

const atomicityReasons: Record<string, string> = {
  [ids.differenceQuotientLimit]:
    'Beidseitige numerische Annäherung und der Übergang von Sekanten- zu Tangentensteigung sind tabellarische und geometrische Aspekte desselben Grenzprozesses.',
  [ids.elementaryDerivatives]:
    'Aus dem Aufbau eines elementaren Funktionsterms eine passende Ableitungsregel auszuwählen und die Ableitung damit schrittweise zu berechnen bildet eine zusammenhängende, in einer Aufgabenfolge prüfbare Differentiationsroutine.',
  [ids.parameterInterpretation]:
    'Parameter-Graph-Beziehungen deuten, passende Parameter rekonstruieren und äquivalente Darstellungen erkennen sind aufeinander bezogene Richtungen derselben Repräsentationskompetenz.',
  [ids.derivativeDerivation]:
    'Die beiden gekoppelten Ableitungsidentitäten werden unter derselben Bogenmaß-, Additions- und Grenzwertgrundlage hergeleitet; die Begründung des Minuszeichens ist Teil genau dieser Herleitungskompetenz.',
  [ids.derivativeApplication]:
    'Ableitungsfunktion und Tangentensteigung an vorgegebenen Stellen zu bestimmen und beide Ergebnisse am Graphen zu überprüfen sind Rechen- und Kontrollschritte derselben Ableitungsanwendung für eine eng begrenzte Funktionsfamilie.',
  [ids.trigonometricEquations]:
    'Lösen, vollständige Lösungsmengen über Periodizität und Symmetrie sowie die Darstellung am Einheitskreis sind algebraische und geometrische Repräsentationen derselben Gleichungskompetenz.',
  [ids.periodicModeling]:
    'Begründete Annahmen, datenbasierte Parameterbestimmung, Kontextinterpretation sowie die Prüfung von Passung und Grenzen sind Phasen eines einzigen Modellierungszyklus.',
}

const memoryReasons: Record<string, string> = {
  [ids.differenceQuotientLimit]:
    'Der beidseitige Grenzprozess und seine Sekanten-Tangenten-Deutung müssen an Daten und Graphen verstanden werden; isoliertes Erinnern ersetzt diese Leistung nicht.',
  [ids.elementaryDerivatives]:
    'Der bestehende Memory-Anteil bleibt streng auf kompakte Ableitungsregeln im Deck de_gymnasium_math_analysis_core begrenzt; Regelauswahl und Anwendung werden weiterhin durch Verständnis und Aufgabenpraxis getragen.',
  [ids.parameterInterpretation]:
    'Die Formeln müssen mit Graphmerkmalen verbunden und äquivalente Parameterdarstellungen erkannt werden; ein isoliertes Formel-Deck ist für dieses Ziel nicht erforderlich.',
  [ids.derivativeDerivation]:
    'Die Ableitungsidentitäten sollen im Bogenmaß geometrisch oder über Grenzwerte hergeleitet und das Minuszeichen begründet werden; bloßes Auswendiglernen der Formeln genügt nicht.',
  [ids.derivativeApplication]:
    'Ableitungsfunktion, Tangentensteigung und Graphprüfung müssen zusammen angewendet werden; diese Untersuchungsleistung wird durch Anwendungspraxis statt ein eigenes Memory-Deck verankert.',
  [ids.trigonometricEquations]:
    'Vollständige Lösungsmengen müssen mithilfe von Periodizität, Symmetrie und Einheitskreis rekonstruiert werden; isoliertes Merken einzelner Lösungen genügt nicht.',
  [ids.periodicModeling]:
    'Annahmen, Modellwahl, datenbasierte Parameter, Kontextdeutung und Modellprüfung erfordern einen zusammenhängenden Modellierungsprozess; ein separates Memory-Deck ist nicht notwendig.',
}

const visualizationReviewNotes: Record<string, string> = {
  [ids.differenceQuotientLimit]:
    'Batch 215: Existing Nano Banana Pro asset remains compatible as an orientation. It correctly shows the secant-to-tangent limit for positive h only; the revised two-sided positive-and-negative-h evidence must come from tasks, not from this image. Image and historical prompt bytes remain unchanged.',
  [ids.elementaryDerivatives]:
    'Batch 215: Existing Nano Banana Pro asset remains compatible. Its polynomial, power, and exponential differentiation examples are correct and support selecting and applying the corresponding rules without expanding the goal. Image and historical prompt bytes remain unchanged.',
  [ids.parameterInterpretation]:
    'Batch 215: Existing Nano Banana Pro asset remains compatible. It shows one correct parameter specialization of the sine form; it does not depict the general non-uniqueness of equivalent parameter representations, which remains assessment evidence rather than an image claim. Image and historical prompt bytes remain unchanged.',
  [ids.derivativeDerivation]:
    'Batch 215: Existing Nano Banana Pro asset remains compatible because only the English title is aligned with the already depicted derivative identities and negative sign. Image and historical prompt bytes remain unchanged.',
  [ids.derivativeApplication]:
    'Batch 215: Existing Nano Banana Pro asset remains compatible as an orientation. It shows the correct base case a=1 and d=0 together with derivative values and tangent checks; the final goal also permits general nonzero vertical scale a, vertical shift d, and slopes at specified points. Image and historical prompt bytes remain unchanged.',
  [ids.trigonometricEquations]:
    'Batch 215: Existing Nano Banana Pro asset remains compatible. Its unit-circle example and periodic solution families correctly support complete solutions using periodicity and symmetry. Image and historical prompt bytes remain unchanged.',
  [ids.periodicModeling]:
    'Batch 215: Existing Nano Banana Pro asset remains compatible. Measured data, fitted curve, amplitude, period, midline, and bounded prediction support interpretation and assessment of fit and limitations. Image and historical prompt bytes remain unchanged.',
}

const visualizationReviewReasonsDe: Record<string, string> = {
  [ids.differenceQuotientLimit]:
    'Kompatibel als Orientierung: Der Grenzübergang von der Sekante zur Tangente ist korrekt, das Bild zeigt jedoch nur positive h-Werte. Die beidseitige numerische Evidenz muss eine Aufgabe liefern.',
  [ids.elementaryDerivatives]:
    'Kompatibel: Die dargestellten Polynom-, Potenz- und Exponentialableitungen sind korrekt und tragen die Auswahl und Anwendung passender Regeln.',
  [ids.parameterInterpretation]:
    'Kompatibel als korrekter Parameterspezialfall. Das Bild beansprucht keine allgemeine Eindeutigkeit, stellt äquivalente Parameterdarstellungen aber auch nicht allgemein dar.',
  [ids.derivativeDerivation]:
    'Kompatibel: Beide Ableitungsidentitäten und das Minuszeichen bleiben fachlich korrekt; geändert wird ausschließlich der englische Titel.',
  [ids.derivativeApplication]:
    'Kompatibel als korrekter Grundfall a=1, d=0 mit Ableitungswerten und Tangentenprüfung. Allgemeine vertikale Skalierung, Verschiebung und vorgegebene Auswertungsstellen bleiben Aufgabenevidenz.',
  [ids.trigonometricEquations]:
    'Kompatibel: Einheitskreis, konkrete Lösungen und periodische Lösungsfamilien sind fachlich korrekt und unterstützen vollständige Lösungsmengen.',
  [ids.periodicModeling]:
    'Kompatibel: Messdaten, Modellkurve und begrenzte Prognose stützen Parameterdeutung sowie die Prüfung von Passung und Modellgrenzen.',
}

const outputBoundary = [
  paths.canonical,
  paths.semanticKinds,
  paths.atomicity,
  paths.memory,
  paths.visualizationQa,
  paths.visualizationReview,
  paths.assessmentCoverageReview,
] as const

const absolute = (path: string): string => resolve(repoRoot, path)
const readJson = (path: string): JsonRecord =>
  JSON.parse(readFileSync(absolute(path), 'utf8')) as JsonRecord
const readJsonl = (path: string): JsonRecord[] => readFileSync(absolute(path), 'utf8')
  .split(/\r?\n/u)
  .filter((line) => line.trim() !== '')
  .map((line) => JSON.parse(line) as JsonRecord)
const serializeJson = (value: unknown): string => JSON.stringify(value, null, 2) + '\n'
const serializeJsonl = (records: JsonRecord[]): string =>
  records.map((record) => JSON.stringify(record)).join('\n') + '\n'
const sha256 = (value: string | Uint8Array): string =>
  createHash('sha256').update(value).digest('hex')
const sha256Digest = (value: string | Uint8Array): string => 'sha256:' + sha256(value)
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return '[' + value.map(stableJson).join(',') + ']'
  if (value && typeof value === 'object') {
    return '{' + Object.entries(value as JsonRecord)
      .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
      .map(([key, nested]) => JSON.stringify(key) + ':' + stableJson(nested))
      .join(',') + '}'
  }
  return JSON.stringify(value) ?? 'null'
}
const same = (left: unknown, right: unknown): boolean => stableJson(left) === stableJson(right)
const recordHash = (value: unknown): string => sha256(stableJson(value))
const normalizeText = (value: unknown): string =>
  String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()

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

function assertSemanticCanonicalString(value: string, label: string): void {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index)
    let codePoint = codeUnit
    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const low = value.charCodeAt(index + 1)
      if (!(low >= 0xdc00 && low <= 0xdfff)) {
        throw new Error(label + ' contains an unpaired Unicode surrogate')
      }
      codePoint = ((codeUnit - 0xd800) * 0x400) + (low - 0xdc00) + 0x10000
      index += 1
    } else if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      throw new Error(label + ' contains an unpaired Unicode surrogate')
    }
    if (
      (codePoint < 0x20 && codePoint !== 0x09 && codePoint !== 0x0a && codePoint !== 0x0d)
      || codePoint === 0xfffe
      || codePoint === 0xffff
    ) throw new Error(label + ' contains a forbidden character')
  }
}

function semanticCanonicalJson(value: unknown, label: string): string {
  if (value === null) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'string') {
    assertSemanticCanonicalString(value, label)
    return JSON.stringify(value)
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error(label + ' contains a non-finite number')
    return JSON.stringify(Object.is(value, -0) ? 0 : value)
  }
  if (Array.isArray(value)) {
    return '[' + value
      .map((item, index) => semanticCanonicalJson(item, label + '[' + index + ']'))
      .join(',') + ']'
  }
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value as Record<string, unknown>)
      .sort(compareUnicodeCodePoints)
      .map((key) => {
        assertSemanticCanonicalString(key, label + ' object key')
        return JSON.stringify(key) + ':'
          + semanticCanonicalJson((value as Record<string, unknown>)[key], label + '.' + key)
      })
      .join(',') + '}'
  }
  throw new Error(label + ' contains an unsupported canonical JSON value')
}

function fingerprintSemanticKindSourceGoal(rawGoal: JsonRecord): string {
  const profilePath =
    'contracts/curriculum-package/v1/profiles/semantic-normal-form-v1.profile.json'
  assertSha256(
    profilePath,
    '22e48f2dea55fbc3d6b39fc196c31258ab1559ef6751df4882f43318eadd48ca',
    'Pinned semantic-kind canonicalization profile',
  )
  const profile = readJson(profilePath)
  if (
    profile.profileId !== 'semantic-normal-form-v1'
    || profile.version !== '1.0.0'
    || profile.canonicalJson?.algorithm !== 'skillpilot-canonical-json-v1'
  ) throw new Error('Pinned semantic-kind canonicalization profile identity drifted')
  if (typeof rawGoal.id !== 'string' || rawGoal.id.trim() === '') {
    throw new Error('Semantic-kind source goal lacks a non-empty ID')
  }
  const fields = semanticKindFingerprintPointers.map((pointer) => {
    const key = pointer.slice(1)
    if (!Object.prototype.hasOwnProperty.call(rawGoal, key)) {
      return { path: pointer, state: 'missing' }
    }
    let value: unknown = rawGoal[key]
    if (pointer === '/tags') {
      if (!Array.isArray(value) || !value.every((entry) => typeof entry === 'string')) {
        throw new Error(rawGoal.id + ': invalid tags for semantic-kind fingerprint')
      }
      const tags = value as string[]
      if (new Set(tags).size !== tags.length) {
        throw new Error(rawGoal.id + ': duplicate tags for semantic-kind fingerprint')
      }
      value = [...tags].sort(compareUnicodeCodePoints)
    }
    return { path: pointer, state: 'value', value }
  })
  const canonicalBytes = semanticCanonicalJson({
    domain: 'skillpilot:semantic-kind-source-fingerprint:v1',
    fields,
  }, 'semantic-kind source goal ' + rawGoal.id)
  return sha256Digest(canonicalBytes)
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

function assertSha256(path: string, expected: string, label: string): void {
  if (!existsSync(absolute(path))) throw new Error(label + ': missing ' + path)
  const actual = sha256(readFileSync(absolute(path)))
  if (actual !== expected) throw new Error(label + ': ' + path + ' drifted (' + actual + ' != ' + expected + ')')
}

function collectObjects(value: unknown, result: JsonRecord[] = []): JsonRecord[] {
  if (Array.isArray(value)) {
    for (const item of value) collectObjects(item, result)
  } else if (value && typeof value === 'object') {
    const record = value as JsonRecord
    result.push(record)
    for (const nested of Object.values(record)) collectObjects(nested, result)
  }
  return result
}

function validateDerivativeApplicationSourceBinding(adjudication: JsonRecord): void {
  const decision = (adjudication.decisions as JsonRecord[])
    .find((candidate) => candidate.goalId === ids.derivativeApplication)
  if (!decision) throw new Error('Missing 3401 source-bound adjudication decision')
  const expectedBinding = {
    sourceExtractionPath: paths.shSourceExtraction,
    sourceExtractionDigest: 'sha256:' + sourceBindingInputHashes[paths.shSourceExtraction],
    mappingReviewPath: paths.shMappingReview,
    mappingReviewDigest: 'sha256:' + sourceBindingInputHashes[paths.shMappingReview],
    mappingLedgerSemantics:
      'Existing mapped/partial decisions distribute the cited source elements across several '
      + 'canonical goals or a wider aggregate and do not denote an open subject-matter gap. '
      + 'This adjudication records a cross-record source binding for the bounded wording only '
      + 'and does not modify or reinterpret the mapping ledger.',
    evidence: expectedShEvidence,
  }
  if (!same(decision.sourceBinding, expectedBinding)) {
    throw new Error('3401 adjudication source binding drifted')
  }

  const sourceObjects = collectObjects(readJson(paths.shSourceExtraction))
  const mappingDecisions = readJson(paths.shMappingReview).decisions as JsonRecord[]
  if (!Array.isArray(mappingDecisions)) throw new Error('SH mapping review decisions missing')
  for (const evidence of expectedShEvidence) {
    const sourceMatches = sourceObjects.filter((record) => record.id === evidence.sourceGoalId)
    if (sourceMatches.length !== 1) throw new Error(evidence.code + ': exact SH source record missing')
    const source = sourceMatches[0]
    for (const field of ['topicCode', 'sourceText', 'sourcePage', 'sourceLine'] as const) {
      if (source[field] !== evidence[field]) {
        throw new Error(evidence.code + ': SH source field drifted: ' + field)
      }
    }
    const mappingMatches = mappingDecisions
      .filter((record) => record.sourceGoalId === evidence.sourceGoalId)
    if (mappingMatches.length !== 1) throw new Error(evidence.code + ': exact SH mapping decision missing')
    const mapping = mappingMatches[0]
    if (
      mapping.topicCode !== evidence.topicCode
      || mapping.decision !== evidence.mappingDecision
      || mapping.matchType !== evidence.mappingMatchType
      || !String(mapping.rationale).includes('nicht eine offene fachliche Luecke')
      || !Array.isArray(mapping.canonicalGoalIds)
      || mapping.canonicalGoalIds.includes(ids.derivativeApplication)
    ) {
      throw new Error(evidence.code + ': existing mapped/partial ledger semantics drifted')
    }
  }
}

function assertProtectedInputs(): void {
  for (const [path, expected] of Object.entries(expectedInputHashes)) {
    assertSha256(path, expected, 'Bound B017 input/review artifact')
  }
  assertSha256(paths.adjudication, expectedAdjudicationSha256, 'Bound B017 third adjudication')
  assertSha256(paths.followUpConfig, expectedFollowUpConfigSha256, 'Bound B018 follow-up config')
  for (const [path, expected] of Object.entries(sourceBindingInputHashes)) {
    assertSha256(path, expected, 'Bound 3401 SH source/mapping evidence')
  }
  for (const [path, expected] of Object.entries(protectedAssessmentFiles)) {
    assertSha256(path, expected, 'Protected assessment v1 artifact')
  }
  for (const [path, expected] of Object.entries(protectedVisualizationFiles)) {
    assertSha256(path, expected, path.includes('/prompt') ? 'Protected historical prompt' : 'Protected Nano Banana Pro asset')
  }
  for (const [path, expected] of Object.entries(batch216B42Bindings)) {
    assertSha256(path, expected, 'Protected independent Batch-216 b42 correction')
  }
}

function loadAdjudication(): {
  adjudication: JsonRecord
  followUpConfig: JsonRecord
  revisedGoalIds: string[]
  pendingGoalIds: string[]
} {
  const adjudication = readJson(paths.adjudication)
  const followUpConfig = readJson(paths.followUpConfig)
  const decisions = adjudication.decisions as JsonRecord[]
  if (
    adjudication.schemaVersion !== 1
    || adjudication.subject !== 'mathematik'
    || adjudication.materialized !== false
    || adjudication.noProgressClaim !== true
    || adjudication.counts?.total !== 8
    || adjudication.counts?.keep_current !== 3
    || adjudication.counts?.accepted_revision !== 5
    || adjudication.counts?.structural_split !== 0
    || adjudication.counts?.unresolved_block !== 0
    || adjudication.counts?.requiresSourceBindingDecision !== 0
    || adjudication.counts?.requiresProductOwnerDecision !== 0
    || !Array.isArray(decisions)
    || decisions.length !== 8
    || !same(decisions.map((decision) => decision.goalId), [...reviewGoalIds])
    || !same(adjudication.topologyDecisions, [])
    || !Array.isArray(adjudication.assessmentDecisions)
    || adjudication.assessmentDecisions.length !== 1
  ) throw new Error('Unexpected B017 adjudication contract')

  const assessmentDecision = adjudication.assessmentDecisions[0] as JsonRecord
  if (
    assessmentDecision.assessmentGoalId !== ids.trigonometricAssessment
    || assessmentDecision.resolutionDecision !== 'accepted_coverage_correction'
    || assessmentDecision.addedGoalId !== ids.transformedSineCosineChainRule
    || !same(assessmentDecision.beforeRequiresAndCoveredGoalIds, assessmentCoverageBefore)
    || !same(assessmentDecision.finalRequiresAndCoveredGoalIds, assessmentCoverageFinal)
    || assessmentDecision.appendOnlyReviewPath !== paths.assessmentCoverageReview
    || !same(assessmentDecision.unchangedPayloadFields, ['taskContent', 'solutionContent', 'scoring'])
  ) throw new Error('Unexpected B017 assessment coverage decision')

  const positions = [
    ['revise', 'keep'],
    ['revise', 'keep'],
    ['keep', 'keep'],
    ['revise', 'keep'],
    ['keep', 'keep'],
    ['block', 'revise'],
    ['revise', 'revise'],
    ['revise', 'revise'],
  ]
  decisions.forEach((decision, index) => {
    if (!same(
      [decision.reviewPositions?.first, decision.reviewPositions?.second],
      positions[index],
    )) throw new Error(String(decision.goalId) + ': B017 blind-review positions drifted')
    const resolution = String(decision.resolutionDecision)
    if (!['accepted_revision', 'keep_current'].includes(resolution)) {
      throw new Error(String(decision.goalId) + ': unexpected resolution ' + resolution)
    }
    const finalText = decision.finalText
    if (
      !finalText
      || !['titleDe', 'titleEn', 'descriptionDe', 'descriptionEn']
        .every((field) => typeof finalText[field] === 'string' && finalText[field].trim() !== '')
    ) throw new Error(String(decision.goalId) + ': resolved decision lacks complete bilingual finalText')
  })

  const revisedGoalIds = decisions
    .filter((decision) => decision.resolutionDecision === 'accepted_revision')
    .map((decision) => String(decision.goalId))
  const keepGoalIds = decisions
    .filter((decision) => decision.resolutionDecision === 'keep_current')
    .map((decision) => String(decision.goalId))
  const pendingGoalIds = decisions
    .filter((decision) => decision.resolutionDecision === 'unresolved_pending_source_binding')
    .map((decision) => String(decision.goalId))
  if (
    !same(revisedGoalIds, expectedRevisedGoalIds)
    || revisedGoalIds.length !== adjudication.counts.accepted_revision
    || keepGoalIds.length !== adjudication.counts.keep_current
    || pendingGoalIds.length !== adjudication.counts.unresolved_block
  ) throw new Error('B017 adjudication counts do not match decision records')

  if (
    pendingGoalIds.length !== 0
    || adjudication.followUpSelectionStatus !== 'FINAL'
    || !same(adjudication.requiredFollowUpGoalIds, revisedGoalIds)
    || !same(followUpConfig.goalIds, revisedGoalIds)
    || followUpConfig.batchId
      !== 'mathematik-rollout-v1-batch-018-e-trigonometric-final-current-5-v1-20260828'
    || followUpConfig.outputDirectory
      !== 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/'
        + '2026-08-28/batch-018-e-trigonometric-final-current-5-v1'
  ) {
    throw new Error('Resolved B017 adjudication is not paired with exactly the changed B018 goals')
  }

  const expectedBinding = {
    configDigest: 'sha256:' + expectedInputHashes[inputPaths.config],
    batchManifestDigest: 'sha256:' + expectedInputHashes[inputPaths.batchManifest],
    bundleManifestDigest: 'sha256:' + expectedInputHashes[inputPaths.bundleManifest],
    bundleFingerprint: 'sha256:3e28955a3034f81cce1d4936807061801af39b9daf0c929c258fb5b87709ac92',
    reviewInputFingerprint: 'sha256:e0d1e92af94b57f2355d4a086d3d0f72707b11662bc6487d857662cf5255f0a2',
    bookDigest: 'sha256:e9364558fedcff4c69901a43cec46904d15fc849a64adf56577ee65007537e05',
    bundleReviewInputJsonDigest: 'sha256:' + expectedInputHashes[inputPaths.bundleReviewInputJson],
    bundleReviewInputJsonlDigest: 'sha256:' + expectedInputHashes[inputPaths.bundleReviewInputJsonl],
    dualSummaryDigest: 'sha256:' + expectedInputHashes[inputPaths.dualSummary],
    goalCount: 8,
    roundA: {
      runId: 'math-b017-a-b61d8d2e-aac4-4947-8819-d7757738d2f0',
      descriptionReviewInputDigest: 'sha256:' + expectedInputHashes[inputPaths.roundADescriptionInput],
      batchInputDigest: 'sha256:' + expectedInputHashes[inputPaths.roundABatchInput],
      runDigest: 'sha256:' + expectedInputHashes[inputPaths.roundARun],
      recordsDigest: 'sha256:' + expectedInputHashes[inputPaths.roundARecords],
    },
    roundB: {
      runId: '6cc30e96-c150-4c12-b7cd-f324389e9234',
      descriptionReviewInputDigest: 'sha256:' + expectedInputHashes[inputPaths.roundBDescriptionInput],
      batchInputDigest: 'sha256:' + expectedInputHashes[inputPaths.roundBBatchInput],
      runDigest: 'sha256:' + expectedInputHashes[inputPaths.roundBRun],
      recordsDigest: 'sha256:' + expectedInputHashes[inputPaths.roundBRecords],
    },
    blindnessEndedOnlyForThisThirdAdjudication: true,
  }
  if (!same(adjudication.inputBinding, expectedBinding)) {
    throw new Error('B017 adjudication input/review hash binding drifted')
  }
  validateDerivativeApplicationSourceBinding(adjudication)
  return { adjudication, followUpConfig, revisedGoalIds, pendingGoalIds }
}

function loadBoundReviewInputs(adjudication: JsonRecord): Map<string, JsonRecord> {
  const records = readJsonl(inputPaths.roundABatchInput)
  if (records.length !== 8) throw new Error('Expected 8 B017 review inputs, found ' + records.length)
  const byId = new Map<string, JsonRecord>()
  for (const record of records) {
    if (record.reviewInputFingerprint !== adjudication.inputBinding.reviewInputFingerprint) {
      throw new Error(String(record.goal?.goalId ?? 'unknown') + ': review-input fingerprint drifted')
    }
    const goal = record.goal as JsonRecord
    if (!goal?.goalId || byId.has(goal.goalId)) throw new Error('Duplicate or missing B017 review-input goal')
    byId.set(goal.goalId, goal)
  }
  if (!same([...byId.keys()], [...reviewGoalIds])) throw new Error('B017 review-input goal order drifted')

  const dualSummary = readJson(inputPaths.dualSummary)
  const decisionsById = new Map(
    (adjudication.decisions as JsonRecord[]).map((decision) => [String(decision.goalId), decision]),
  )
  if (
    dualSummary.goalCount !== 8
    || dualSummary.counts?.requiresSynthesis !== 8
    || !same((dualSummary.goals as JsonRecord[]).map((goal) => goal.goalId), [...reviewGoalIds])
  ) throw new Error('Unexpected B017 dual-summary contract')
  for (const summary of dualSummary.goals as JsonRecord[]) {
    const decision = decisionsById.get(String(summary.goalId))
    if (!same(
      [summary.firstDecision, summary.secondDecision],
      [decision?.reviewPositions?.first, decision?.reviewPositions?.second],
    )) throw new Error(String(summary.goalId) + ': adjudication no longer matches dual summary')
  }
  return byId
}

function textTupleFromGoal(goal: JsonRecord): unknown[] {
  return [goal.title, goal.titleEn, goal.description, goal.descriptionEn]
}

function textTupleFromInput(input: JsonRecord): unknown[] {
  return [
    input.currentTitleDe,
    input.currentTitleEn,
    input.currentDescriptionDe,
    input.currentDescriptionEn,
  ]
}

function textTupleFromFinal(finalText: JsonRecord): unknown[] {
  return [finalText.titleDe, finalText.titleEn, finalText.descriptionDe, finalText.descriptionEn]
}

function stripMutableGoalText(goal: JsonRecord): JsonRecord {
  const copy = structuredClone(goal)
  delete copy.title
  delete copy.titleEn
  delete copy.description
  delete copy.descriptionEn
  for (const link of copy.resourceLinks ?? []) {
    if (link.type !== 'goal-visualization') continue
    delete link.title
    delete link.description
    delete link.altText
  }
  return copy
}

function buildCanonical(
  adjudication: JsonRecord,
  reviewInputs: Map<string, JsonRecord>,
  revisedGoalIds: string[],
): JsonRecord {
  const canonical = readJson(paths.canonical)
  if (canonical.landscapeId !== mathLandscapeId || !Array.isArray(canonical.goals)) {
    throw new Error('Unexpected canonical mathematics landscape')
  }
  const topologyBefore = new Map((canonical.goals as JsonRecord[]).map((goal) => [
    String(goal.id),
    structuredClone({
      type: goal.type,
      contains: goal.contains ?? [],
      requires: goal.requires ?? [],
    }),
  ]))
  const byId = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const decisionsById = new Map(
    (adjudication.decisions as JsonRecord[]).map((decision) => [String(decision.goalId), decision]),
  )
  for (const goalId of revisedGoalIds) {
    const goal = byId.get(goalId)
    const input = reviewInputs.get(goalId)
    const finalText = decisionsById.get(goalId)?.finalText as JsonRecord
    if (!goal || !input || !finalText) throw new Error(goalId + ': missing goal, review input, or final text')
    const currentTuple = textTupleFromGoal(goal)
    const inputTuple = textTupleFromInput(input)
    const finalTuple = textTupleFromFinal(finalText)
    if (!same(currentTuple, inputTuple) && !same(currentTuple, finalTuple)) {
      throw new Error(goalId + ': canonical text is neither reviewed current nor adjudicated final state')
    }
    const nonTextBefore = stripMutableGoalText(goal)
    Object.assign(goal, {
      title: finalText.titleDe,
      titleEn: finalText.titleEn,
      description: finalText.descriptionDe,
      descriptionEn: finalText.descriptionEn,
    })
    const links = (goal.resourceLinks ?? []).filter((link: JsonRecord) => link.type === 'goal-visualization')
    if (links.length !== 1) throw new Error(goalId + ': expected one existing goal-visualization link')
    Object.assign(links[0], {
      title: 'Visualisierung: ' + goal.title,
      description: 'Visualisierung zum Lernziel: ' + goal.title + '.',
      altText: 'Didaktische Visualisierung zum Lernziel "' + goal.title + '". ' + goal.description,
    })
    if (!same(nonTextBefore, stripMutableGoalText(goal))) {
      throw new Error(goalId + ': canonical mutation escaped bilingual text and visual-link text metadata')
    }
  }

  const assessment = byId.get(ids.trigonometricAssessment)
  if (!assessment || assessment.nodeKind !== 'exam' || assessment.type !== 'atomic') {
    throw new Error('Missing expected E-trigonometry assessment node')
  }
  const finalAssessment = structuredClone(assessment)
  finalAssessment.requires = [...assessmentCoverageFinal]
  if (!finalAssessment.examData || finalAssessment.examData.reviewStatus !== 'released') {
    throw new Error('Assessment release metadata drifted')
  }
  finalAssessment.examData.coveredGoalIds = [...assessmentCoverageFinal]
  if (
    recordHash(assessment) !== expectedAssessmentGoalBeforeHash
    && !same(assessment, finalAssessment)
  ) throw new Error('Assessment goal is neither bounded current nor final coverage-corrected state')
  if (
    !same(assessment.requires, assessmentCoverageBefore)
    && !same(assessment.requires, assessmentCoverageFinal)
  ) throw new Error('Assessment requires escaped the current-or-final boundary')
  if (
    !same(assessment.examData.coveredGoalIds, assessmentCoverageBefore)
    && !same(assessment.examData.coveredGoalIds, assessmentCoverageFinal)
  ) throw new Error('Assessment coveredGoalIds escaped the current-or-final boundary')
  if (assessment.examData.reviewNote !== assessmentReviewNoteBefore) {
    throw new Error('Assessment reviewNote drifted')
  }
  const immutablePayload = {
    taskContent: assessment.examData.taskContent,
    solutionContent: assessment.examData.solutionContent,
    scoring: assessment.examData.scoring,
    sourceArtifactPath: assessment.examData.sourceArtifactPath,
  }
  if (
    recordHash(immutablePayload) !== expectedAssessmentImmutablePayloadHash
    || sha256(String(assessment.examData.taskContent)) !== expectedAssessmentTaskContentSha256
    || sha256(String(assessment.examData.solutionContent)) !== expectedAssessmentSolutionContentSha256
    || recordHash(assessment.examData.scoring) !== expectedAssessmentScoringHash
    || assessment.examData.sourceArtifactPath !== paths.assessmentDraft
  ) throw new Error('Assessment task, solution, scoring, or source-artifact binding drifted')
  Object.assign(assessment, finalAssessment)

  for (const goal of canonical.goals as JsonRecord[]) {
    const before = topologyBefore.get(String(goal.id))
    if (!before) throw new Error(String(goal.id) + ': unexpected canonical goal appeared')
    const after = { type: goal.type, contains: goal.contains ?? [], requires: goal.requires ?? [] }
    if (goal.id === ids.trigonometricAssessment) {
      const expectedAfter = { ...before, requires: [...assessmentCoverageFinal] }
      if (!same(after, expectedAfter)) {
        throw new Error('Assessment topology mutation escaped the one approved requires correction')
      }
    } else if (!same(after, before)) {
      throw new Error(String(goal.id) + ': B017 plan changed unapproved canonical topology')
    }
  }
  return canonical
}

function assertBeforeOrFinal(
  kind: keyof typeof expectedBeforeRecordHashes,
  goalId: string,
  before: JsonRecord,
  final: JsonRecord,
): void {
  const expectedBefore = expectedBeforeRecordHashes[kind][
    goalId as keyof typeof expectedBeforeRecordHashes[typeof kind]
  ]
  if (recordHash(before) !== expectedBefore && !same(before, final)) {
    throw new Error(goalId + ': ' + kind + ' record is neither bounded current nor final state')
  }
}

function buildSemanticKinds(canonical: JsonRecord, fingerprintGoalIds: string[]): JsonRecord {
  const ledger = readJson(paths.semanticKinds)
  const goals = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const decisions = ledger.decisions as JsonRecord[]
  for (const goalId of fingerprintGoalIds) {
    const goal = goals.get(goalId)
    const matching = decisions.filter((decision) => decision.goalId === goalId)
    if (!goal || matching.length !== 1) throw new Error(goalId + ': missing or duplicate semantic-kind decision')
    const decision = matching[0]
    const expectedSemanticKind = goalId === ids.trigonometricAssessment
      ? 'practiceAssessment'
      : 'curricularAtomic'
    if (
      decision.semanticKind !== expectedSemanticKind
      || decision.decisionStatus !== 'authoritative'
    ) {
      throw new Error(goalId + ': unexpected semantic-kind decision')
    }
    const final = {
      ...structuredClone(decision),
      sourceFingerprint: fingerprintSemanticKindSourceGoal(goal),
    }
    assertBeforeOrFinal('semanticKinds', goalId, decision, final)
    Object.assign(decision, final)
  }
  return ledger
}

function buildReviewLedger(
  canonical: JsonRecord,
  revisedGoalIds: string[],
  kind: 'atomicity' | 'memory',
): JsonRecord[] {
  const path = kind === 'atomicity' ? paths.atomicity : paths.memory
  const ruleVersion = kind === 'atomicity' ? 'semantic-atomicity-v1' : 'memory-card-review-v1'
  const reasons = kind === 'atomicity' ? atomicityReasons : memoryReasons
  const records = readJsonl(path)
  const goals = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  for (const goalId of revisedGoalIds) {
    const goal = goals.get(goalId)
    const matching = records.filter((record) => record.goalId === goalId)
    const reason = reasons[goalId]
    if (!goal || matching.length !== 1 || !reason) {
      throw new Error(goalId + ': missing current goal, unique ' + kind + ' record, or individual reason')
    }
    const record = matching[0]
    if (record.ruleVersion !== ruleVersion) throw new Error(goalId + ': ' + kind + ' rule drift')
    const final = structuredClone(record)
    Object.assign(final, {
      fingerprint: reviewFingerprint(goal, ruleVersion),
      reviewedAt,
      reviewer,
      reason,
    })
    if (kind === 'atomicity') {
      if (record.status !== 'atomic' || record.semanticAtomic !== true || !same(record.suggestedSplit, [])) {
        throw new Error(goalId + ': atomicity decision must remain atomic without a split')
      }
      Object.assign(final, { status: 'atomic', semanticAtomic: true, suggestedSplit: [] })
    } else {
      const expectedState = expectedMemoryStates[goalId]
      if (!expectedState || Object.entries(expectedState).some(([field, value]) => !same(record[field], value))) {
        throw new Error(goalId + ': memory status or existing traces drifted')
      }
      for (const field of ['status', 'memoryUseful', 'memoryGoalIds', 'deckIds']) {
        if (expectedState[field] !== undefined) final[field] = structuredClone(expectedState[field])
      }
      if (goalId === ids.elementaryDerivatives && (
        !same(final.memoryGoalIds, ['ca708087-71f8-5fae-91c5-b80721a4208f'])
        || !same(final.deckIds, ['de_gymnasium_math_analysis_core'])
      )) throw new Error('Elementary-derivatives memory_required traces were not preserved')
    }
    assertBeforeOrFinal(kind, goalId, record, final)
    Object.assign(record, final)
  }
  return records
}

function expectedCanonicalAssetHash(goalId: string): string {
  const path = 'curricula/DE/Gymnasium/visualizations/mathematik/' + goalId + '/' + goalId + '.jpg'
  const expected = protectedVisualizationFiles[path]
  if (!expected) throw new Error(goalId + ': missing protected canonical visualization hash')
  return expected
}

function buildVisualizationQa(canonical: JsonRecord, revisedGoalIds: string[]): JsonRecord {
  const qa = readJson(paths.visualizationQa)
  const goals = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  for (const goalId of revisedGoalIds) {
    const goal = goals.get(goalId)
    const matching = (qa.records as JsonRecord[]).filter((record) => record.goalId === goalId)
    const notes = visualizationReviewNotes[goalId]
    if (!goal || matching.length !== 1 || !notes) {
      throw new Error(goalId + ': missing goal, unique visualization-QA record, or compatibility note')
    }
    const record = matching[0]
    const expectedAssetDigest = 'sha256:' + expectedCanonicalAssetHash(goalId)
    if (
      record.canonicalAssetPath
        !== 'curricula/DE/Gymnasium/visualizations/mathematik/' + goalId + '/' + goalId + '.jpg'
      || record.assetSha256 !== expectedAssetDigest
    ) throw new Error(goalId + ': visualization-QA asset binding drifted')
    const final = {
      ...structuredClone(record),
      title: goal.title,
      description: goal.description,
      umlautsCorrectChatGpt: 'yes',
      contentApprovedChatGpt: 'yes',
      chatGptReviewedAt: visualizationReviewedAt,
      chatGptReviewer: visualizationReviewer,
      chatGptNotes: notes,
      aiApproved: 'yes',
      aiApprovedAssetSha256: expectedAssetDigest,
      aiReviewedAt: visualizationReviewedAt,
      aiReviewer: visualizationReviewer,
      aiNotes: notes,
    }
    assertBeforeOrFinal('visualizationQa', goalId, record, final)
    Object.assign(record, final)
  }
  return qa
}

function buildVisualizationReview(canonical: JsonRecord, revisedGoalIds: string[]): string {
  const tick = String.fromCharCode(96)
  const goals = new Map((canonical.goals as JsonRecord[]).map((goal) => [String(goal.id), goal]))
  const rows = revisedGoalIds.map((goalId) => {
    const goal = goals.get(goalId)
    const reason = visualizationReviewReasonsDe[goalId]
    if (!goal || !reason) throw new Error(goalId + ': missing visualization-review row')
    return '| ' + tick + goalId + tick + ' | ' + goal.title + ' | '
      + tick + 'accepted_existing_asset' + tick + ' | ' + reason + ' |'
  })
  const protectedLines = protectedVisualizationGoalIds.flatMap((goalId) => {
    const entries = Object.entries(protectedVisualizationFiles)
      .filter(([path]) => path.includes('/' + goalId + '/'))
      .map(([path, digest]) => '- ' + tick + path + tick + ': SHA-256 ' + tick + digest + tick)
    if (entries.length < 3) throw new Error(goalId + ': incomplete visualization byte protection')
    return entries
  })
  return [
    '# Goal Visualization Review - Mathematik Batch 215',
    '',
    'Review date: 2026-08-28',
    '',
    'Scope: Kompatibilitätsprüfung und Metadaten-Rebinding für genau '
      + revisedGoalIds.length + ' textlich geänderte Ziele aus Math Batch 017.',
    'Die fachlich korrigierte b42-Visualisierung wird ausschließlich durch '
      + tick + 'Mathematik Batch 216' + tick + ' verwaltet und in Batch 215 nicht verändert.',
    'Die bestehenden Nano-Banana-Pro-Bilder sowie alle historischen '
      + tick + 'prompt.de.md' + tick + '- und '
      + tick + 'image-reconstruction-prompt.de.md' + tick + '-Dateien bleiben bytegleich.',
    '',
    'Status: ' + tick + 'accepted_existing_assets_metadata_rebound' + tick,
    '',
    '## Entscheidung',
    '',
    '| Goal ID | Lernziel | Entscheidung | Begründung und Scope-Grenze |',
    '| --- | --- | --- | --- |',
    ...rows,
    '',
    '## Byte-Schutz',
    '',
    ...protectedLines,
    '',
    '- Kanonische und öffentliche JPG-Kopien sind je Ziel byteidentisch.',
    '- Weder Bildbytes noch historische Promptbytes gehören zur Output-Grenze dieses Apply-Skripts.',
    '- Bestehende Human-Freigabefelder bleiben unverändert; QA-Titel, QA-Beschreibung und die',
    '  dokumentierte AI-Kompatibilitätsprüfung werden an den finalen Text gebunden.',
    '',
    '## Unveränderte Struktur',
    '',
    '- Keine Lernziel-Topologie-, Mapping-, Composition-View- oder Bildänderung.',
    '- Die separat geplante Assessment-Korrektur ergänzt nur das bereits geprüfte Kettenregelziel',
    '  in `requires` und `examData.coveredGoalIds`; Aufgabe, Lösung und Scoring bleiben unverändert.',
    '- Die Visualisierungen sind Orientierung und ersetzen keine vollständige fachliche Evidenz.',
    '',
  ].join('\n')
}

function buildAssessmentCoverageReview(canonical: JsonRecord): string {
  const tick = String.fromCharCode(96)
  const assessment = (canonical.goals as JsonRecord[])
    .find((goal) => goal.id === ids.trigonometricAssessment)
  if (
    !assessment
    || !same(assessment.requires, assessmentCoverageFinal)
    || !same(assessment.examData?.coveredGoalIds, assessmentCoverageFinal)
    || assessment.examData?.reviewNote !== assessmentReviewNoteBefore
  ) throw new Error('Cannot render v2 coverage correction from a non-final assessment state')
  return [
    '# Append-only Coverage Correction Review v2: E-Trigonometrie vertieft verknüpfen',
    '',
    'Review date: 2026-08-28',
    '',
    'Reviewer: internal focused mathematics coverage correction',
    '',
    'Decision: ' + tick + 'released_coverage_correction' + tick,
    '',
    '## Korrektur',
    '',
    '- Die historische ' + tick + 'simulated_review_v1.md' + tick + ' bleibt bytegleich und wird nicht überschrieben.',
    '- Teilaufgabe 4 leitet das transformierte Modell '
      + tick + 'h(t)=12-10 cos(pi t/20)' + tick + ' ab. Damit wird die innere lineare',
    '  Transformation tatsächlich geprüft; das vorhandene kanonische Ziel '
      + tick + ids.transformedSineCosineChainRule + tick + ' wird deshalb ergänzt.',
    '- Genau dieses Ziel wird an derselben Position in ' + tick + 'requires' + tick + ' und '
      + tick + 'examData.coveredGoalIds' + tick + ' eingefügt.',
    '- Aufgabenstellung, Musterlösung, Scoring, Punktzahlen und Bestehensgrenze bleiben unverändert.',
    '',
    '## Finale identische Abdeckungslisten',
    '',
    ...assessmentCoverageFinal.map((goalId) => '- ' + tick + goalId + tick),
    '',
    '## Byte- und Inhaltsschutz',
    '',
    '- ' + tick + paths.assessmentDraft + tick + ': SHA-256 '
      + tick + protectedAssessmentFiles[paths.assessmentDraft] + tick,
    '- ' + tick + paths.assessmentSolution + tick + ': SHA-256 '
      + tick + protectedAssessmentFiles[paths.assessmentSolution] + tick,
    '- ' + tick + paths.assessmentReviewV1 + tick + ': SHA-256 '
      + tick + protectedAssessmentFiles[paths.assessmentReviewV1] + tick,
    '- ' + tick + 'examData.taskContent' + tick + ': SHA-256 '
      + tick + expectedAssessmentTaskContentSha256 + tick,
    '- ' + tick + 'examData.solutionContent' + tick + ': SHA-256 '
      + tick + expectedAssessmentSolutionContentSha256 + tick,
    '- ' + tick + 'examData.scoring' + tick + ' (kanonisches Stable-JSON): SHA-256 '
      + tick + expectedAssessmentScoringHash + tick,
    '',
    '## Grenze',
    '',
    'Diese v2-Korrektur ändert keine Aufgabe, Lösung oder Bewertungsrubrik und trifft keine neue',
    'fachliche Freigabeentscheidung. Sie repariert ausschließlich die maschinenlesbare Coverage-',
    'Kopplung des bereits freigegebenen Assessments.',
    '',
  ].join('\n')
}

function assertOutputBoundary(files: PlannedFile[]): void {
  const expected = new Set<string>(outputBoundary)
  const actual = new Set(files.map((file) => file.path))
  if (actual.size !== expected.size || [...actual].some((path) => !expected.has(path))) {
    throw new Error('B017 planned outputs escaped the exact canonical/fingerprint/visual-metadata boundary')
  }
}

function assertAppendOnly(files: PlannedFile[]): void {
  for (const file of files) {
    if (!file.appendOnly || !existsSync(absolute(file.path))) continue
    if (readFileSync(absolute(file.path), 'utf8') !== file.bytes) {
      throw new Error('Refusing to overwrite append-only artifact ' + file.path)
    }
  }
}

function changedPlannedFiles(files: PlannedFile[]): PlannedFile[] {
  return files.filter((file) => (
    !existsSync(absolute(file.path))
    || readFileSync(absolute(file.path), 'utf8') !== file.bytes
  ))
}

assertProtectedInputs()
const {
  adjudication,
  followUpConfig,
  revisedGoalIds,
  pendingGoalIds,
} = loadAdjudication()
loadBoundReviewInputs(adjudication)

if (pendingGoalIds.length > 0) {
  console.log(
    'CHECK apply_math_batch017_trigonometric_adjudication BLOCKED'
    + ' pendingSourceBindings=' + pendingGoalIds.length
    + ' goalIds=' + pendingGoalIds.join(','),
  )
  console.log('OUTPUT_BOUNDARY ' + outputBoundary.join(','))
  throw new Error(
    'Refusing to construct or digest the B017 bounded plan while source-bound decisions are PENDING',
  )
}

const reviewInputs = loadBoundReviewInputs(adjudication)
const canonical = buildCanonical(adjudication, reviewInputs, revisedGoalIds)
const semanticKinds = buildSemanticKinds(
  canonical,
  [...revisedGoalIds, ids.trigonometricAssessment],
)
const atomicity = buildReviewLedger(canonical, revisedGoalIds, 'atomicity')
const memory = buildReviewLedger(canonical, revisedGoalIds, 'memory')
const visualizationQa = buildVisualizationQa(canonical, revisedGoalIds)
const visualizationReview = buildVisualizationReview(canonical, revisedGoalIds)
const assessmentCoverageReview = buildAssessmentCoverageReview(canonical)

const plannedFiles: PlannedFile[] = [
  { path: paths.canonical, bytes: serializeJson(canonical) },
  { path: paths.semanticKinds, bytes: serializeJson(semanticKinds) },
  { path: paths.atomicity, bytes: serializeJsonl(atomicity) },
  { path: paths.memory, bytes: serializeJsonl(memory) },
  { path: paths.visualizationQa, bytes: serializeJson(visualizationQa) },
  { path: paths.visualizationReview, bytes: visualizationReview, appendOnly: true },
  {
    path: paths.assessmentCoverageReview,
    bytes: assessmentCoverageReview,
    appendOnly: true,
  },
]
assertOutputBoundary(plannedFiles)
assertAppendOnly(plannedFiles)

const boundedPlanSha256 = sha256(stableJson({
  adjudicationSha256: expectedAdjudicationSha256,
  followUpConfigSha256: expectedFollowUpConfigSha256,
  b017InputAndReviewHashes: expectedInputHashes,
  revisedDecisions: (adjudication.decisions as JsonRecord[])
    .filter((decision) => decision.resolutionDecision === 'accepted_revision')
    .map((decision) => ({ goalId: decision.goalId, finalText: decision.finalText })),
  followUpGoalIds: followUpConfig.goalIds,
  derivativeApplicationSourceBinding:
    (adjudication.decisions as JsonRecord[])
      .find((decision) => decision.goalId === ids.derivativeApplication)?.sourceBinding,
  sourceBindingInputHashes,
  assessmentDecision: adjudication.assessmentDecisions[0],
  assessmentProtection: {
    protectedAssessmentFiles,
    expectedAssessmentGoalBeforeHash,
    expectedAssessmentImmutablePayloadHash,
    expectedAssessmentTaskContentSha256,
    expectedAssessmentSolutionContentSha256,
    expectedAssessmentScoringHash,
  },
  atomicityReasons: Object.fromEntries(
    revisedGoalIds.map((goalId) => [goalId, atomicityReasons[goalId]]),
  ),
  memoryReasons: Object.fromEntries(
    revisedGoalIds.map((goalId) => [goalId, memoryReasons[goalId]]),
  ),
  visualizationReviewNotes: Object.fromEntries(
    revisedGoalIds.map((goalId) => [goalId, visualizationReviewNotes[goalId]]),
  ),
  protectedVisualizationFiles,
  batch216B42Bindings,
  outputBoundary,
  plannedOutputBindings: plannedFiles.map((file) => ({
    path: file.path,
    sha256: sha256(file.bytes),
    appendOnly: file.appendOnly === true,
  })),
}))
if (expectedBoundedPlanSha256 !== 'PENDING' && boundedPlanSha256 !== expectedBoundedPlanSha256) {
  throw new Error(
    'B017 bounded plan drift: ' + boundedPlanSha256 + ' != ' + expectedBoundedPlanSha256,
  )
}

const changed = changedPlannedFiles(plannedFiles)
if (checkMode && changed.length > 0) {
  throw new Error('B017 is not applied; ' + changed.length + ' planned files differ')
}

if (writeMode) {
  if (expectedBoundedPlanSha256 === 'PENDING') {
    throw new Error(
      'Refusing --write until expectedBoundedPlanSha256 is bound to ' + boundedPlanSha256,
    )
  }
  execFileSync('node', ['scripts/check_openai_plugin_review_freeze.mjs'], {
    cwd: repoRoot,
    stdio: 'inherit',
  })
  for (const file of changed) {
    mkdirSync(dirname(absolute(file.path)), { recursive: true })
    if (file.appendOnly) writeFileSync(absolute(file.path), file.bytes, { flag: 'wx' })
    else writeFileSync(absolute(file.path), file.bytes)
  }
  assertProtectedInputs()
}

const status = writeMode ? 'WRITE' : changed.length === 0 ? 'PASS' : 'PLAN'
console.log(
  'CHECK apply_math_batch017_trigonometric_adjudication ' + status
  + ' revisions=' + revisedGoalIds.length
  + ' goalTopology=0 assessmentRequiresCorrections=1 mappings=0 assessments=1 views=0 images=0'
  + ' followUp=' + followUpConfig.goalIds.length
  + ' plannedWrites=' + changed.length
  + ' files=' + (changed.map((file) => basename(file.path)).join(',') || '-'),
)
console.log('OUTPUT_BOUNDARY ' + outputBoundary.join(','))
for (const file of plannedFiles) {
  const state = changed.some((candidate) => candidate.path === file.path) ? 'WRITE' : 'UNCHANGED'
  console.log('PLANNED_OUTPUT ' + sha256(file.bytes) + ' ' + state + ' ' + file.path)
}
console.log('BOUNDED_PLAN_SHA256 ' + boundedPlanSha256)
