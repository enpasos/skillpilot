import { createHash, randomBytes } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  type Dirent,
  chmodSync,
  linkSync,
  lstatSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { stableGoalBookJson } from './goalBookModel'
import { buildPositiveGoalEvidenceCandidateRecords } from './materializePositiveGoalEvidenceCandidates'
import type { PositiveGoalEvidenceProfile } from './positiveGoalEvidenceProfileModel'
import type { PositiveGoalEvidenceReviewConfig } from './positiveGoalEvidenceReview'
import { buildGoalDescriptionCanonicalContext } from './validateGoalDescriptionReviewCampaign'
import {
  fingerprintGoalDescriptionRolloutSynthesisDecisionManifest,
  type GoalDescriptionRolloutSynthesisDecisionManifest,
} from './validateGoalDescriptionRolloutSynthesisDecisionManifest'

type ReviewRound = 'first' | 'second'
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
  proposedDescriptionDe?: string
  proposedDescriptionEn?: string
}
type BoundRecord = { record: ReviewRecord; digest: `sha256:${string}` }
type ProfileDefinition = {
  archetype: PositiveGoalEvidenceProfile['archetype']
  selectionReasonDe: string
  selectionReasonEn: string
  additionalExpectation: PositiveGoalEvidenceProfile['expectations'][number]
  minimumIndependentDemonstrations: number
  variationAxes: PositiveGoalEvidenceProfile['variationAxes']
  applicationCaseBriefs: PositiveGoalEvidenceProfile['applicationCaseBriefs']
}
type CandidateSet = {
  schemaVersion: 1
  authoringContract: 'positive-understanding-evidence-candidates-v1'
  reviewId: string
  reviewedAt: string
  reviewer: string
  sourceBindings: {
    bindingContract: 'math-b020-stable11-positive-evidence-sources-v1'
    batchId: string
    campaignGoalIds: readonly string[]
    stableGoalIds: readonly string[]
    followUpGoalIds: readonly string[]
    preexistingOwnedGoalIds: readonly string[]
    sources: Array<{ role: string; path: string; sha256: `sha256:${string}` }>
    resolutionFiles: Array<{ goalId: string; path: string; sha256: `sha256:${string}` }>
  }
  goals: Array<{
    goalId: string
    reason: string
    evidenceLevel: 'E1'
    maximumClaimScope: 'G1'
    dissent: string[]
    profile: PositiveGoalEvidenceProfile
  }>
}
type DualSummary = {
  goalCount?: number
  goals?: Array<{
    goalId?: string
    agreement?: string
    firstRecordId?: string
    secondRecordId?: string
    firstRunId?: string
    secondRunId?: string
    firstDecision?: string
    secondDecision?: string
    requiresSynthesis?: boolean
    automaticAcceptance?: boolean
  }>
}
type Adjudication = {
  schemaVersion?: number
  validationContract?: string
  artifactType?: string
  batchId?: string
  subject?: string
  landscapeId?: string
  authority?: string
  campaignGoalCount?: number
  stableCurrentGoalIds?: string[]
  newStableClaimGoalIds?: string[]
  preexistingOwnedGoalIds?: string[]
  acceptedRevisionGoalIds?: string[]
  requiredFreshReviewGoalIds?: string[]
  decisions?: Array<{
    goalId?: string
    roundA?: { recordId?: string; decision?: string }
    roundB?: { recordId?: string; decision?: string }
    resolutionDecision?: string
    evidenceRound?: ReviewRound
    evidenceRecordId?: string
    progressCounted?: boolean
    revisionDissent?: {
      rejectedRound?: ReviewRound
      rejectedDecision?: string
      rejectedProposedDescriptionDe?: string
      rejectedProposedDescriptionEn?: string
      disposition?: string
      rationaleDe?: string
      rationaleEn?: string
    }
  }>
  inputBinding?: {
    configSha256?: string
    batchManifestSha256?: string
    dualSummarySha256?: string
    roundA?: { runManifestSha256?: string; recordsSha256?: string; runId?: string }
    roundB?: { runManifestSha256?: string; recordsSha256?: string; runId?: string }
  }
}
type ResolutionIndexEntry = {
  goalId?: string
  decision?: string
  resolutionPath?: string
  resolutionDigest?: string
  resolutionFingerprint?: string
  strictDescriptionComplete?: boolean
}
type ResolutionIndex = {
  schemaVersion?: number
  subject?: string
  semanticKind?: string
  strictDescriptionReviewCompleteCount?: number
  curriculumAtomicDenominator?: number
  descriptionReviewPercentage?: number
  synthesisDecisionManifest?: { path?: string; digest?: string; fingerprint?: string }
  groups?: Array<{
    groupId?: string
    dualSummaryDigest?: string
    campaignGoalCount?: number
    resolvedGoalCount?: number
  }>
  resolutions?: ResolutionIndexEntry[]
}
type CanonicalGoal = Record<string, unknown> & {
  id?: string
  title?: string
  titleEn?: string
  description?: string
  descriptionEn?: string
}
type CompatibilityReceipt = {
  schemaVersion?: number
  receiptId?: string
  sourceBatchId?: string
  sourceCampaignGoalCount?: number
  claimedGoalIds?: string[]
  claimedGoalCount?: number
  followUpGoalIds?: string[]
  followUpGoalCount?: number
  preexistingOwnedGoalIds?: string[]
  preexistingOwnedGoalCount?: number
  noWholeBatchProgressClaim?: boolean
  selectedEvidenceRounds?: Record<string, ReviewRound>
  sourceBindings?: Array<{ role?: string; path?: string; sha256?: string }>
  currentCanonicalLandscape?: { path?: string; sha256?: string }
  currentSemanticKindLedger?: {
    path?: string
    sha256?: string
    totalGoalCount?: number
    curriculumAtomicDenominator?: number
  }
  currentCanonicalContexts?: Array<{
    goalId?: string
    canonicalContext?: unknown
    fingerprint?: string
  }>
  currentGoalBook?: {
    configPath?: string
    digest?: string
    currentB020SubsetDigest?: string
    projectedAtomicGoalCount?: number
    curricularAtomicPageCount?: number
    excludedTargetAtomicGoalCount?: number
  }
  synthesisManifestPath?: string
  synthesisManifestDigest?: string
  synthesisManifestFingerprint?: string
  resolutionIndexPath?: string
  resolutionIndexDigest?: string
  resolutionIndexFormat?: string
  safeguards?: Record<string, boolean>
  materializationPlanSha256?: string
  [key: string]: unknown
}
type PlannedOutput = { path: string; bytes: Buffer; mode: typeof publishedFileMode }
type TargetState = 'absent' | 'exact-after'
type StagingState = 'absent' | 'exact-staged'
type MaterializationState = 'exact-before' | 'resumable-mixed' | 'exact-after'
type ClassifiedOutput = PlannedOutput & { targetState: TargetState; stagingState: StagingState }
type ClassifiedMaterialization = {
  state: MaterializationState
  outputs: ClassifiedOutput[]
  absentTargetCount: number
  exactAfterTargetCount: number
  absentStagingCount: number
  exactStagedCount: number
}
type CarryoverPlanOutput = {
  path?: unknown
  sha256?: unknown
  mode?: unknown
  targetState?: unknown
  stagingState?: unknown
}
type CarryoverPlanReport = {
  mode?: unknown
  status?: unknown
  computedPlanSha256?: unknown
  materializationPlanSha256?: unknown
  curriculumAuthority?: {
    totalGoalCount?: unknown
    curricularAtomicGoalCount?: unknown
    projectedAtomicGoalCount?: unknown
    excludedTargetAtomicGoalCount?: unknown
    stableCarryoverProgress?: unknown
  }
  currentPostStatePins?: {
    canonical?: unknown
    semanticKindLedger?: unknown
    goalBook?: unknown
  }
  currentSubsetDigest?: unknown
  stableGoalIds?: unknown
  followUpGoalIds?: unknown
  preexistingOwnedGoalIds?: unknown
  outputCount?: unknown
  outputFileMode?: unknown
  ownedDirectoryAndWriteLockMode?: unknown
  materializationState?: unknown
  outputs?: CarryoverPlanOutput[]
}

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
const allowedArguments = new Set(['--write', '--check'])
const unexpectedArguments = process.argv.slice(2).filter((argument) => !allowedArguments.has(argument))
if (unexpectedArguments.length > 0) throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)
for (const argument of allowedArguments) {
  if (process.argv.slice(2).filter((candidate) => candidate === argument).length > 1) {
    throw new Error(`Duplicate ${argument}`)
  }
}
if (writeMode && checkMode) throw new Error('Use either --write or --check, not both')

const rolloutRoot = (
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-29'
)
const batchName = 'batch-020-q2-lines-planes-and-reverse-context-13-v1'
const batchDirectory = `${rolloutRoot}/${batchName}`
const sourceConfigPath = `${rolloutRoot}/${batchName}.config.json`
const batchManifestPath = `${batchDirectory}/batch-manifest.json`
const bookModelPath = `${batchDirectory}/bundle/book-model.json`
const bundleManifestPath = `${batchDirectory}/bundle/manifest.json`
const bundleReviewInputPath = `${batchDirectory}/bundle/review-input.json`
const bundleReviewInputJsonlPath = `${batchDirectory}/bundle/review-input.jsonl`
const dualSummaryPath = `${batchDirectory}/dual-summary.json`
const adjudicationPath = `${batchDirectory}/third-adjudication/adjudication.json`
const resultStem = (
  'mathematik-rollout-v1-batch-020-q2-lines-planes-and-reverse-context-13-v1-20260829-first-pass'
)
const roundARecordsPath = `${batchDirectory}/round-a/results/${resultStem}-a.batch-001.records.jsonl`
const roundARunPath = roundARecordsPath.replace('.records.jsonl', '.run.json')
const roundBRecordsPath = `${batchDirectory}/round-b/results/${resultStem}-b.batch-001.records.jsonl`
const roundBRunPath = roundBRecordsPath.replace('.records.jsonl', '.run.json')
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const semanticKindLedgerPath = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const criteriaPath = (
  'curricula/DE/Gymnasium/quality/goal-evidence/prompts/'
  + 'mathematik-positive-understanding-evidence-profile-criteria-v2.md'
)

const resolutionStem = 'stable-current-carryover-11-v1'
const synthesisRelativePath = `synthesis-decisions.${resolutionStem}.json`
const synthesisPath = `${batchDirectory}/${synthesisRelativePath}`
const resolutionDirectory = `resolutions-${resolutionStem}`
const resolutionIndexPath = `${batchDirectory}/resolution-index.${resolutionStem}.json`
const compatibilityReceiptPath = `${batchDirectory}/${resolutionStem}.compatibility-receipt.json`
const carryoverMaterializerPath = 'app/scripts/materializeMathB020Stable11CarryoverResolutions.ts'

const artifactStem = (
  'canonical-math-positive-understanding-evidence-rollout-v1-'
  + 'batch-020-q2-lines-planes-stable11-current-v1'
)
const artifactRoot = 'curricula/DE/Gymnasium/quality/goal-evidence'
const configPath = `${artifactRoot}/${artifactStem}.config.json`
const candidatesPath = `${artifactRoot}/${artifactStem}.candidates.json`
const reviewPath = `${artifactRoot}/${artifactStem}.review.jsonl`
const targetReviewId = 'canonical-math-positive-evidence-v1-b020-q2-lines-planes-stable11-v1'
const reviewedAt = '2026-08-29T05:20:00.000Z'
const reviewer = 'codex-math-b020-stable11-positive-evidence-candidate-2026-08-29'
const expectedBatchId = 'mathematik-rollout-v1-batch-020-q2-lines-planes-and-reverse-context-13-v1-20260829'
const expectedRoundARunId = 'b020-round-a-blind-20260829-codex'
const expectedRoundBRunId = 'b020-round-b-blind-20260829-codex-001'
const landscapeId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const mixedDissentGoalId = '9cc650e0-100d-5ae1-a83b-2b854ab7c5c8'

const sourceHashes: Record<string, string> = {
  config: '8e735562e57cac117c8f488c92784a88af49fc7d7d633108b9c651d655b5ec9c',
  batchManifest: 'feb0679cac4c95828779ee4e87c6122b9315eceaab722ded8bda27ac151389cc',
  bookModel: '86d0ebccf27843e74824cb1919b2000d760a50ba48848e5d942f462b8be77402',
  bundleManifest: '0bd631c7f73ed2ff7a3efcc88f6b4cea12aad336bac04d9342b516320c67eeff',
  bundleReviewInput: 'ff15bdfac4f300f42270f773a3ffc8c39e8476d749996b20e8083d1b418a5452',
  bundleReviewInputJsonl: 'b49b7c2468eaa917f473d024d5eca17a754166be70ef7a9106a0a5c0426cadd1',
  dualSummary: 'efcb246292683bdcabfc4b5b4576ec7a9be7ff426bf5652474adac55999a492c',
  adjudication: 'b44d6cb1bfa60251d0d6ce5266fd9e58b7ed6f6dc56a724a52ac7e02352d2839',
  roundARecords: '76e09b4b783e3111c41798c7f79f67a24e839683fef0a44dd57f3b9754d947ba',
  roundARun: 'd609269a99fdf64d3cae0a9f2c66f6d2ff3dda80fa9fc76e0c86b49abd99306f',
  roundBRecords: '600079264d4960d749bd8d0eaf26891686559458c97a193f1b4a543d36474265',
  roundBRun: '394f4dbb58dd0f343f0dd7a3036e5a2a999347ff8379ba5c6644a598e282bc53',
  carryoverMaterializer: 'ae69bc286c0bfc458cacfb3cc86d6b8cb55512b761536d885a54e794fb31b36b',
  canonical: '228a15eac60ec00257f25d021c1fa3ef93b873257e220b05d5756a878169f9d0',
  semanticKindLedger: '87d8ed2cd0a0712303caee5bbcb24ca55211f24a20536cbc2d5eb7d002a5abd9',
  criteria: '12063457ee847a35af2b29f203ff7dbc9a383f91cf4fafc3a5162015d73a4816',
  synthesisManifest: '619960275c3a71d76ed145460793ac08808aa0cab2807d7259a65710cf805b1b',
  compatibilityReceipt: '1070711c4ad9ff6c497228ca639c8be040d24eee70a1de70b95c286ae0da3911',
  resolutionIndex: '9c0b7b6c7d723878169b5413a30a1cf882ed48ff5452a1268628e31627281db7',
}

const expectedCurrentContextDigests: Record<string, string> = {
  goalBook: '2c09186739825ba3c9c463d64eced1992206602f67b21b96b3a9239480a1b17f',
  subset: '0c3b2da22b55299f539eb4cf6cf19e20d48d229dc29aece3acd8711a21b72bc6',
  carryoverProducerPlan: '1c0a59c06d557e02c1dbc0b043b1e4f3e0fba93bbf46915030f78f2a9c1b90ca',
  carryoverMaterializationPlan: 'cab7ce1ce54d77ef0bd1c75597006f70fd168a4ebf495700014f1b47cd019c0f',
}
const expectedPlanSha256: string = '9b2dd088fc0f7d2723abc6c45297863c1a3f39217d2303ef9d04c25e86daa084'
const expectedCanonicalGoalCount = 1174
const expectedCurriculumAtomicDenominator = 792
const expectedProjectedAtomicGoalCount = 919
const expectedExcludedTargetAtomicGoalCount = 127
const publishedFileMode = 0o644 as const
const ownedDirectoryMode = 0o700 as const

const campaignGoalIds = [
  'effe43eb-cabe-56cb-a228-35887d7915c1',
  '525b1da9-7fdd-4a70-9f30-ff01d7511b04',
  'd785943c-d61b-51a1-a9c2-c36a9e0cc97d',
  'ec6447d1-97da-5b77-94ae-4973b43f094e',
  '66a96282-340d-5220-91a6-cc97e2ec2220',
  '9cc650e0-100d-5ae1-a83b-2b854ab7c5c8',
  'fa02cf14-0411-4fe3-8be7-a62c69743e26',
  'ea4bd128-17ab-5a8b-ae98-29552d774fb0',
  'f613634b-39fb-5021-9970-790ef34c9932',
  'ce491ec0-c558-5872-86fd-289e60a38403',
  '06de364f-9b63-4044-8229-a975621dc6df',
  '436532fe-cee6-5a13-a4be-05522435937b',
  '858113c5-e53b-57bb-b01f-ba95c3ddcb6f',
] as const
const goalIds = [
  'effe43eb-cabe-56cb-a228-35887d7915c1',
  '525b1da9-7fdd-4a70-9f30-ff01d7511b04',
  'd785943c-d61b-51a1-a9c2-c36a9e0cc97d',
  '66a96282-340d-5220-91a6-cc97e2ec2220',
  '9cc650e0-100d-5ae1-a83b-2b854ab7c5c8',
  'fa02cf14-0411-4fe3-8be7-a62c69743e26',
  'ea4bd128-17ab-5a8b-ae98-29552d774fb0',
  'f613634b-39fb-5021-9970-790ef34c9932',
  'ce491ec0-c558-5872-86fd-289e60a38403',
  '06de364f-9b63-4044-8229-a975621dc6df',
  '436532fe-cee6-5a13-a4be-05522435937b',
] as const
const followUpGoalIds = [
  'ec6447d1-97da-5b77-94ae-4973b43f094e',
] as const
const preexistingOwnedGoalIds = [
  '858113c5-e53b-57bb-b01f-ba95c3ddcb6f',
] as const

const selectedRoundByGoalId = new Map<string, ReviewRound>([
  ['effe43eb-cabe-56cb-a228-35887d7915c1', 'second'],
  ['525b1da9-7fdd-4a70-9f30-ff01d7511b04', 'second'],
  ['d785943c-d61b-51a1-a9c2-c36a9e0cc97d', 'second'],
  ['66a96282-340d-5220-91a6-cc97e2ec2220', 'first'],
  ['9cc650e0-100d-5ae1-a83b-2b854ab7c5c8', 'second'],
  ['fa02cf14-0411-4fe3-8be7-a62c69743e26', 'first'],
  ['ea4bd128-17ab-5a8b-ae98-29552d774fb0', 'second'],
  ['f613634b-39fb-5021-9970-790ef34c9932', 'second'],
  ['ce491ec0-c558-5872-86fd-289e60a38403', 'first'],
  ['06de364f-9b63-4044-8229-a975621dc6df', 'first'],
  ['436532fe-cee6-5a13-a4be-05522435937b', 'second'],
])

const resolutionSha256ByGoalId = new Map<string, string>([
  ['effe43eb-cabe-56cb-a228-35887d7915c1', '8cddc3f1be29491b3102b52a0c1f22dcc6e55005974ecae3474ee251704cb35b'],
  ['525b1da9-7fdd-4a70-9f30-ff01d7511b04', '9a46a001cf346595c645fbb4644f10ada4721372bf74cd9f60925a39a9d40adb'],
  ['d785943c-d61b-51a1-a9c2-c36a9e0cc97d', 'f6ca6d045439767ed8e8fbc58ef31a1137b68c289e9078d3e3ae9c8bb856a9e7'],
  ['66a96282-340d-5220-91a6-cc97e2ec2220', '3f62358dbee7bb56b170529ee1f96a4e805dfaa9e2792d368106b688d21d22d0'],
  ['9cc650e0-100d-5ae1-a83b-2b854ab7c5c8', 'a90b2ddf04ffc2c8f0bdf6b2b4ccc3f4f202a26b7f58badc01013edb89b81f48'],
  ['fa02cf14-0411-4fe3-8be7-a62c69743e26', 'f381db603b58511d4f14aa44d57895459cda1ee6e9aeffab54ba0a37b7d8642d'],
  ['ea4bd128-17ab-5a8b-ae98-29552d774fb0', 'a358e38eef64f7922f0ff0dba07fa649fa80e0d2467ae429fe5dbed9149047c8'],
  ['f613634b-39fb-5021-9970-790ef34c9932', '3a7ca543fc449fd3a9b2601deb5c8ad56253430abaa707b043d9fbb916e38e63'],
  ['ce491ec0-c558-5872-86fd-289e60a38403', '45ba247ca1538647f472c1dd596d7c1bfc2ea69217f81157fe1548c350dcf121'],
  ['06de364f-9b63-4044-8229-a975621dc6df', 'a470bb9d05a2e8614b6f5355801e41360010af1f32b1992b071149a178eb0b76'],
  ['436532fe-cee6-5a13-a4be-05522435937b', 'a8d06203d4a471d3beca9177b7e0674de4f17f19451fdce09bfd2c5a9fc28bcb'],
])
const resolutionFiles = goalIds.map((goalId) => {
  const sha256 = resolutionSha256ByGoalId.get(goalId)
  if (!sha256) throw new Error(`${goalId}: missing B020 resolution SHA-256 pin`)
  return {
    goalId,
    path: `${batchDirectory}/${resolutionDirectory}/${goalId}.resolution.json`,
    sha256,
  }
})

const axis = (
  id: string,
  textDe: string,
  textEn: string,
): PositiveGoalEvidenceProfile['variationAxes'][number] => ({ id, textDe, textEn })

const applicationCase = (
  id: string,
  taskDemandDe: string,
  taskDemandEn: string,
  expectedPerformanceDe: string,
  expectedPerformanceEn: string,
  understandingFocusDe: string,
  understandingFocusEn: string,
): PositiveGoalEvidenceProfile['applicationCaseBriefs'][number] => ({
  id,
  taskDemandDe,
  taskDemandEn,
  expectedPerformanceDe,
  expectedPerformanceEn,
  understandingFocusDe,
  understandingFocusEn,
})

const profileDefinitions = new Map<string, ProfileDefinition>([
  ['effe43eb-cabe-56cb-a228-35887d7915c1', {
    archetype: 'representation',
    selectionReasonDe: 'Stütz- und Richtungsvektor werden als Darstellung einer Punktmenge konstruiert, gedeutet und unter zulässigem Wechsel auf Invarianz geprüft.',
    selectionReasonEn: 'Position and direction vectors are constructed and interpreted as a point-set representation and checked for invariance under admissible changes.',
    additionalExpectation: {
      id: 'line-equivalence-and-nonzero-direction',
      essentialUnderstandingDe: 'Ein anderer Stützpunkt auf der Geraden und jedes von null verschiedene Vielfache des Richtungsvektors erzeugen dieselbe Gerade; der Nullvektor legt keine Richtung fest.',
      essentialUnderstandingEn: 'Another position point on the line and any nonzero multiple of the direction vector generate the same line; the zero vector determines no direction.',
      observablePerformanceDe: 'Die lernende Person stellt zwei verschiedene Gleichungen derselben Geraden auf, gibt eine Parameterzuordnung an und begründet Punktmengengleichheit und Nichtnullbedingung.',
      observablePerformanceEn: 'The learner constructs two different equations of the same line, gives a parameter correspondence, and justifies point-set equality and the nonzero condition.',
    },
    minimumIndependentDemonstrations: 2,
    variationAxes: [
      axis('given-information', 'Punkt plus Richtung oder zwei verschiedene Punkte sind gegeben.', 'A point plus direction or two distinct points are given.'),
      axis('equivalent-representation', 'Stützpunkt, Orientierung und Skalierung wechseln.', 'The base point, orientation, and scaling vary.'),
      axis('verification-demand', 'Konstruktion, Parameterzuordnung oder Äquivalenzbegründung wird verlangt.', 'Construction, parameter correspondence, or equivalence justification is required.'),
    ],
    applicationCaseBriefs: [
      applicationCase(
        'two-points-and-reversal',
        'Stelle die Gerade durch A(1,-2,3) und B(4,0,-1) dar. Zeige die Äquivalenz einer Darstellung mit Stützpunkt B und umgekehrter Richtung.',
        'Represent the line through A(1,-2,3) and B(4,0,-1). Show equivalence of a representation based at B with reversed direction.',
        'x=A+t(3,2,-4) und x=B+s(-3,-2,4) erzeugen mit s=1-t dieselben Punkte; beide Richtungen sind von null verschieden.',
        'x=A+t(3,2,-4) and x=B+s(-3,-2,4) generate the same points under s=1-t; both directions are nonzero.',
        'Zweipunktkonstruktion und Invarianz bei Stützpunkt- und Richtungswechsel.',
        'Two-point construction and invariance under changing base point and direction.',
      ),
      applicationCase(
        'scaled-direction-and-new-base',
        'Für g: x=(-1,2,0)+r(2,-1,3) nutze Q(3,0,6) und eine negativ skalierte Richtung für eine äquivalente Gleichung.',
        'For g: x=(-1,2,0)+r(2,-1,3), use Q(3,0,6) and a negatively scaled direction for an equivalent equation.',
        'Q gehört für r=2 zu g; x=Q+u(-4,2,-6) ist mit r=2-2u äquivalent.',
        'Q lies on g at r=2; x=Q+u(-4,2,-6) is equivalent under r=2-2u.',
        'Von null verschiedene Skalierung und explizite Punktmengengleichheit.',
        'Nonzero scaling and explicit point-set equality.',
      ),
    ],
  }],
  ['525b1da9-7fdd-4a70-9f30-ff01d7511b04', {
    archetype: 'representation',
    selectionReasonDe: 'Gerade und Strecke unterscheiden sich in der durch den Parameterbereich codierten Reichweite, die unter Umparametrisierung erhalten werden muss.',
    selectionReasonEn: 'A line and a segment differ in the extent encoded by the parameter domain, which must be preserved under reparametrization.',
    additionalExpectation: {
      id: 'bounded-domain-and-reparametrization',
      essentialUnderstandingDe: 'Ein begrenztes Intervall beschreibt dieselbe Strecke, wenn seine Randwerte die Endpunkte und seine Zwischenwerte die inneren Streckenpunkte liefern; [0,1] ist nicht die einzige Wahl.',
      essentialUnderstandingEn: 'A bounded interval describes the same segment when its boundary values give the endpoints and its intermediate values the interior points; [0,1] is not the only choice.',
      observablePerformanceDe: 'Die lernende Person leitet einen passenden Bereich her, deutet Rand- und Innenwerte und grenzt Punkte der Trägergeraden außerhalb der Strecke ab.',
      observablePerformanceEn: 'The learner derives a suitable domain, interprets boundary and interior values, and distinguishes points on the supporting line outside the segment.',
    },
    minimumIndependentDemonstrations: 2,
    variationAxes: [
      axis('object-extent', 'Unbegrenzte Gerade und begrenzte Strecke wechseln.', 'The unbounded line and bounded segment vary.'),
      axis('parameter-domain-and-orientation', 'Standardintervall, symmetrisches Intervall sowie vertauschte Endpunkte mit entsprechend angepasster Parameterrichtung werden verwendet.', 'A standard interval, a symmetric interval, and reversed endpoints with a consistently adjusted parameter direction are used.'),
      axis('parameter-meaning', 'End-, Innen- und Außenwerte werden gedeutet.', 'Endpoint, interior, and exterior values are interpreted.'),
    ],
    applicationCaseBriefs: [
      applicationCase(
        'standard-line-and-segment',
        'Stelle Gerade und Strecke durch A(1,0,-2) und B(5,2,4) dar und deute t=0,1,1/4,3/2.',
        'Represent the line and segment through A(1,0,-2) and B(5,2,4), and interpret t=0,1,1/4,3/2.',
        'x=A+t(4,2,6): t reell beschreibt die Gerade, 0≤t≤1 die Strecke; 0 und 1 sind Endpunkte, 1/4 ist innen, 3/2 nur auf der Trägergeraden.',
        'x=A+t(4,2,6): real t describes the line and 0≤t≤1 the segment; 0 and 1 are endpoints, 1/4 is interior, and 3/2 only lies on the supporting line.',
        'Geometrisch entscheidender Parameterbereich bei gleichem Term.',
        'The geometrically decisive parameter domain for the same expression.',
      ),
      applicationCase(
        'symmetric-segment-domain',
        'Parametrisiere A(-2,1,0) bis B(4,-1,6) mit u in [-1,1], sodass u=0 der Mittelpunkt ist.',
        'Parametrize A(-2,1,0) to B(4,-1,6) with u in [-1,1] so that u=0 is the midpoint.',
        'M=(1,0,3), x=M+u(3,-1,3), -1≤u≤1; die Randwerte liefern A und B, ein Vorzeichenwechsel kehrt nur die Orientierung um.',
        'M=(1,0,3), x=M+u(3,-1,3), -1≤u≤1; boundary values give A and B, and a sign change only reverses orientation.',
        'Herleitung eines nichtstandardmäßigen Intervalls.',
        'Derivation of a nonstandard interval.',
      ),
    ],
  }],
  ['d785943c-d61b-51a1-a9c2-c36a9e0cc97d', {
    archetype: 'representation',
    selectionReasonDe: 'Stützpunkt, zwei unabhängige Spannrichtungen und Punktzugehörigkeit bestimmen gemeinsam die affine Ebene als Punktmenge.',
    selectionReasonEn: 'A base point, two independent spanning directions, and membership jointly determine the affine plane as a point set.',
    additionalExpectation: {
      id: 'independence-span-and-membership',
      essentialUnderstandingDe: 'Nur zwei linear unabhängige Spannvektoren erzeugen zwei Ebenenrichtungen; Zugehörigkeit bedeutet Darstellbarkeit des Verschiebungsvektors als Linearkombination.',
      essentialUnderstandingEn: 'Only two linearly independent spanning vectors generate two plane directions; membership means representability of the displacement as a linear combination.',
      observablePerformanceDe: 'Die lernende Person begründet Unabhängigkeit, löst eine Zweiparameter-Punktprobe und weist bei alternativer Basis denselben affinen Spann nach.',
      observablePerformanceEn: 'The learner justifies independence, solves a two-parameter membership test, and establishes the same affine span under an alternative basis.',
    },
    minimumIndependentDemonstrations: 2,
    variationAxes: [
      axis('plane-data', 'Stützpunkt mit Richtungen oder drei nicht kollineare Punkte sind gegeben.', 'A base point with directions or three noncollinear points are given.'),
      axis('basis-choice', 'Stützpunkt und unabhängige Basis wechseln.', 'The base point and independent basis vary.'),
      axis('membership-result', 'Die Punktprobe ist konsistent oder widersprüchlich.', 'The membership system is consistent or contradictory.'),
    ],
    applicationCaseBriefs: [
      applicationCase(
        'interpret-and-test-plane',
        'Für E: x=(1,0,2)+s(1,1,0)+t(0,1,2) begründe die Unabhängigkeit und prüfe Q(3,1,0) und R(2,1,3).',
        'For E: x=(1,0,2)+s(1,1,0)+t(0,1,2), justify independence and test Q(3,1,0) and R(2,1,3).',
        'Q entsteht mit s=2,t=-1. Bei R erzwingen x und z s=1,t=1/2, aber y wird 3/2 statt 1; R gehört nicht dazu.',
        'Q is obtained with s=2,t=-1. For R, x and z force s=1,t=1/2, but y becomes 3/2 rather than 1; R does not belong.',
        'Unabhängigkeit und vollständige Konsistenzprüfung.',
        'Independence and a complete consistency check.',
      ),
      applicationCase(
        'three-points-and-new-base',
        'Stelle die Ebene durch A(0,1,0), B(2,1,1), C(-1,3,1) dar, prüfe D(1,3,2) und nutze D als neuen Stützpunkt.',
        'Represent the plane through A(0,1,0), B(2,1,1), C(-1,3,1), test D(1,3,2), and use D as a new base point.',
        'u=(2,0,1), v=(-1,2,1) sind unabhängig und D=A+u+v; D mit derselben Basis beschreibt denselben affinen Spann.',
        'u=(2,0,1), v=(-1,2,1) are independent and D=A+u+v; using D with the same basis describes the same affine span.',
        'Konstruktion aus Punkten und Invarianz bei neuem Ebenenpunkt.',
        'Construction from points and invariance under a new plane point.',
      ),
    ],
  }],
  ['66a96282-340d-5220-91a6-cc97e2ec2220', {
    archetype: 'representation',
    selectionReasonDe: 'Die Punkt-Normalen-Form wird als Orthogonalitätsbedingung aufgebaut, termweise gedeutet und in äquivalenten Formen erkannt.',
    selectionReasonEn: 'Point-normal form is constructed as an orthogonality condition, interpreted term by term, and recognized across equivalent forms.',
    additionalExpectation: {
      id: 'anchor-scaling-and-invariance',
      essentialUnderstandingDe: 'Ein anderer Ebenenpunkt und jedes von null verschiedene Vielfache des Normalenvektors ändern die durch n·(x-p)=0 ausgewählte Punktmenge nicht.',
      essentialUnderstandingEn: 'Another point on the plane and any nonzero multiple of the normal vector do not change the point set selected by n·(x-p)=0.',
      observablePerformanceDe: 'Die lernende Person prüft einen alternativen Stützpunkt, skaliert die Normale zulässig und zeigt algebraisch dieselbe Ebene.',
      observablePerformanceEn: 'The learner verifies an alternative base point, scales the normal admissibly, and algebraically establishes the same plane.',
    },
    minimumIndependentDemonstrations: 2,
    variationAxes: [
      axis('normal-vector', 'Normalenrichtung, Vorzeichen und Skalierung wechseln.', 'Normal direction, sign, and scaling vary.'),
      axis('base-point', 'Der verwendete Ebenenpunkt wechselt.', 'The point used on the plane varies.'),
      axis('performance-direction', 'Aufstellen, Punktprüfung oder Äquivalenznachweis wird verlangt.', 'Construction, point checking, or equivalence proof is required.'),
    ],
    applicationCaseBriefs: [
      applicationCase(
        'construct-point-normal-form',
        'Stelle durch P(1,-1,2) mit n=(2,1,-1) die Form auf, deute x-P und prüfe Q(2,-3,2).',
        'Set up the form through P(1,-1,2) with n=(2,1,-1), interpret x-P, and test Q(2,-3,2).',
        '2(x-1)+(y+1)-(z-2)=0 beziehungsweise 2x+y-z+1=0; Q-P=(1,-2,0) ist orthogonal zu n.',
        '2(x-1)+(y+1)-(z-2)=0, equivalently 2x+y-z+1=0; Q-P=(1,-2,0) is orthogonal to n.',
        'Differenzvektor und Skalarprodukt null als Ebenenbedingung.',
        'The displacement and zero dot product as the plane condition.',
      ),
      applicationCase(
        'new-point-scaled-normal',
        'Für (1,2,2)·(x-(0,1,-1))=0 prüfe Q(2,0,-1) und stelle mit Q und (-3,-6,-6) neu dar.',
        'For (1,2,2)·(x-(0,1,-1))=0, test Q(2,0,-1) and re-express it using Q and (-3,-6,-6).',
        'Q-(0,1,-1)=(2,-1,0) ist orthogonal; die neue Normale ist das -3-Fache, daher bleibt die Punktmenge gleich.',
        'Q-(0,1,-1) is orthogonal; the new normal is -3 times the original, so the point set is unchanged.',
        'Invarianz unter neuem Ebenenpunkt und skalierter Normale.',
        'Invariance under a new plane point and scaled normal.',
      ),
    ],
  }],
  ['9cc650e0-100d-5ae1-a83b-2b854ab7c5c8', {
    archetype: 'representation',
    selectionReasonDe: 'Koeffizientenvektor, Konstante, Orientierung, Lage und Skalierungsinvarianz bilden die zusammenhängende Bedeutung der Koordinatenform.',
    selectionReasonEn: 'The coefficient vector, constant, orientation, position, and scaling invariance form the connected meaning of coordinate form.',
    additionalExpectation: {
      id: 'coefficients-constant-and-scaling',
      essentialUnderstandingDe: 'Erst der von null verschiedene Koeffizientenvektor zusammen mit d bestimmt die Ebene: Er legt die Normalenrichtung fest, d ihre Lage; gemeinsame Skalierung ändert die Bedingung nicht.',
      essentialUnderstandingEn: 'Only the nonzero coefficient vector together with d determines the plane: it fixes the normal direction and d its position; common scaling leaves the condition unchanged.',
      observablePerformanceDe: 'Die lernende Person vergleicht skalierte und nur in d veränderte Gleichungen und deutet einen Nullkoeffizienten über die Normalenrichtung.',
      observablePerformanceEn: 'The learner compares scaled equations with equations changed only in d and interprets a zero coefficient through the normal direction.',
    },
    minimumIndependentDemonstrations: 2,
    variationAxes: [
      axis('construction-data', 'Punkt plus Normale oder eine fertige Koordinatenform sind gegeben.', 'A point plus normal or a completed coordinate form is given.'),
      axis('coefficient-pattern', 'Alle Koeffizienten sind ungleich null oder ein Term fehlt.', 'All coefficients are nonzero or one term is absent.'),
      axis('equation-comparison', 'Gemeinsame Skalierung und Änderung nur der Konstanten werden unterschieden.', 'Common scaling and changing only the constant are distinguished.'),
    ],
    applicationCaseBriefs: [
      applicationCase(
        'form-from-normal-and-point',
        'Bestimme aus P(1,0,2) und n=(2,-1,3) eine Koordinatenform und erläutere Koeffizienten und rechte Seite.',
        'Determine a coordinate form from P(1,0,2) and n=(2,-1,3), and explain the coefficients and right-hand side.',
        'n·x=n·P=8 liefert 2x-y+3z=8; n legt die Normalenrichtung fest, n·x=8 die konkrete Lage.',
        'n·x=n·P=8 gives 2x-y+3z=8; n fixes the normal direction and n·x=8 the specific position.',
        'Zusammenwirken von Richtung und Konstante.',
        'Interaction of direction and constant.',
      ),
      applicationCase(
        'scaled-versus-parallel',
        'Vergleiche -4x+2y-6z=-16, 2x-y+3z=8 und 2x-y+3z=7; deute außerdem den fehlenden y-Term in 3x-2z=6.',
        'Compare -4x+2y-6z=-16, 2x-y+3z=8, and 2x-y+3z=7; also interpret the missing y-term in 3x-2z=6.',
        'Die ersten beiden Gleichungen sind proportional und identisch; die dritte ist parallel verschoben. Bei 3x-2z=6 ist (3,0,-2) normal und die Ebene enthält die y-Richtung.',
        'The first two equations are proportional and identical; the third is parallel-shifted. For 3x-2z=6, (3,0,-2) is normal and the plane contains the y direction.',
        'Die ausgewählte Round-B-Evidenz wird genutzt, ohne ihren verworfenen Ersatztext zu übernehmen.',
        'Selected Round-B evidence is used without adopting its rejected replacement wording.',
      ),
    ],
  }],
  ['fa02cf14-0411-4fe3-8be7-a62c69743e26', {
    archetype: 'representation',
    selectionReasonDe: 'Koordinaten- und Punkt-Normalen-Form werden als äquivalente Orthogonalitätsdarstellungen in beide Richtungen übersetzt.',
    selectionReasonEn: 'Coordinate and point-normal form are translated in both directions as equivalent orthogonality representations.',
    additionalExpectation: {
      id: 'valid-point-and-normal-equivalence',
      essentialUnderstandingDe: 'Zur Punkt-Normalen-Form gehört ein nachweislich auf der Ebene liegender Punkt; proportionale von null verschiedene Normalenvektoren sind gleichwertig.',
      essentialUnderstandingEn: 'Point-normal form requires a point demonstrably on the plane; proportional nonzero normal vectors are equivalent.',
      observablePerformanceDe: 'Die lernende Person prüft den Ebenenpunkt, formt in beide Richtungen um und belegt die Äquivalenz durch Ausmultiplizieren.',
      observablePerformanceEn: 'The learner verifies the plane point, converts in both directions, and establishes equivalence by expansion.',
    },
    minimumIndependentDemonstrations: 2,
    variationAxes: [
      axis('conversion-direction', 'Koordinatenform wird zur Normalenform oder umgekehrt.', 'Coordinate form is converted to normal form or conversely.'),
      axis('normal-scaling', 'Normalenvektoren sind unterschiedlich skaliert.', 'Normal vectors have different scalings.'),
      axis('plane-point-choice', 'Ein ablesbarer oder erst zu bestimmender Ebenenpunkt wird verwendet.', 'An evident or first-determined plane point is used.'),
    ],
    applicationCaseBriefs: [
      applicationCase(
        'coordinate-to-normal',
        'Forme 2x-y+2z=5 mit P(1,-1,1) in Punkt-Normalen-Form um und prüfe P.',
        'Convert 2x-y+2z=5 to point-normal form using P(1,-1,1), and verify P.',
        'P erfüllt die Gleichung; mit n=(2,-1,2) lautet die Form n·(x-P)=0 und expandiert zur Ausgangsform.',
        'P satisfies the equation; with n=(2,-1,2), the form is n·(x-P)=0 and expands to the original form.',
        'Notwendiger Ebenenpunkt und vollständige Äquivalenz.',
        'The required plane point and complete equivalence.',
      ),
      applicationCase(
        'normal-to-coordinate',
        'Forme (-3,0,6)·(x-(2,-1,1))=0 um und erkläre die Normalenvektoren.',
        'Convert (-3,0,6)·(x-(2,-1,1))=0 and explain the normal vectors.',
        'Ausmultiplizieren gibt -3x+6z=0 und vereinfacht x-2z=0; (-3,0,6) und (1,0,-2) sind proportional.',
        'Expansion gives -3x+6z=0 and simplifies to x-2z=0; (-3,0,6) and (1,0,-2) are proportional.',
        'Skalierungsinvarianz und Nullkoeffizient.',
        'Scaling invariance and a zero coefficient.',
      ),
    ],
  }],
  ['ea4bd128-17ab-5a8b-ae98-29552d774fb0', {
    archetype: 'representation',
    selectionReasonDe: 'Unterschiedliche geometrische Informationssätze werden in eine geeignete Ebenengleichung übersetzt und auf Nichtentartung geprüft.',
    selectionReasonEn: 'Different geometric information sets are translated into a suitable plane equation and checked for nondegeneracy.',
    additionalExpectation: {
      id: 'nondegeneracy-and-uniqueness',
      essentialUnderstandingDe: 'Nichtkollinearität, eine von null verschiedene Normale oder zwei unabhängige Spannvektoren sichern jeweils eine eindeutig bestimmte Ebene.',
      essentialUnderstandingEn: 'Noncollinearity, a nonzero normal, or two independent spanning vectors each ensure a uniquely determined plane.',
      observablePerformanceDe: 'Die lernende Person prüft die passende Bedingung, wählt eine Form und bestätigt alle Punkt-, Richtungs- oder Orthogonalitätsvorgaben.',
      observablePerformanceEn: 'The learner checks the appropriate condition, selects a form, and verifies all point, direction, or orthogonality requirements.',
    },
    minimumIndependentDemonstrations: 2,
    variationAxes: [
      axis('data-structure', 'Drei Punkte, Punkt plus Normale oder Punkt plus zwei Richtungen sind gegeben.', 'Three points, a point plus normal, or a point plus two directions are given.'),
      axis('degeneracy-risk', 'Nichtkollinearität, Nichtnullbedingung oder Unabhängigkeit wird geprüft.', 'Noncollinearity, a nonzero condition, or independence is checked.'),
      axis('target-form', 'Parameter-, Normalen- oder Koordinatenform wird gewählt.', 'Parametric, normal, or coordinate form is selected.'),
    ],
    applicationCaseBriefs: [
      applicationCase(
        'three-noncollinear-points',
        'Bestimme eine Ebene durch A(1,0,0), B(1,2,1), C(3,0,1), begründe Nichtkollinearität und prüfe alle Punkte.',
        'Determine a plane through A(1,0,0), B(1,2,1), C(3,0,1), justify noncollinearity, and verify all points.',
        'u=(0,2,1), v=(2,0,1) sind unabhängig; n=(1,1,-2) liefert x+y-2z=1, das alle Punkte erfüllt.',
        'u=(0,2,1), v=(2,0,1) are independent; n=(1,1,-2) gives x+y-2z=1, satisfied by all points.',
        'Übersetzung von Punktdaten in eine geprüfte Gleichung.',
        'Translation of point data into a verified equation.',
      ),
      applicationCase(
        'normal-and-spans',
        'Durch P(0,1,2), n=(1,-2,1) ist eine Ebene gegeben. Prüfe u=(2,1,0), v=(1,0,-1) als Spannvektoren derselben Ebene.',
        'A plane is given through P(0,1,2), n=(1,-2,1). Test u=(2,1,0), v=(1,0,-1) as spanning vectors of the same plane.',
        'x-2y+z=0; u und v sind zu n orthogonal und unabhängig, also beschreibt P+su+tv dieselbe Ebene.',
        'x-2y+z=0; u and v are orthogonal to n and independent, so P+su+tv describes the same plane.',
        'Wechsel der Datenstruktur mit Nichtentartungsprüfung.',
        'Changing data structure with a nondegeneracy check.',
      ),
    ],
  }],
  ['f613634b-39fb-5021-9970-790ef34c9932', {
    archetype: 'representation',
    selectionReasonDe: 'Affine Kombination und Parametergebiet erzeugen gemeinsam die begrenzte Punktmenge und codieren Ecken, Kanten und Inneres.',
    selectionReasonEn: 'The affine combination and parameter domain jointly generate the bounded point set and encode vertices, edges, and interior.',
    additionalExpectation: {
      id: 'boundaries-and-rebasing',
      essentialUnderstandingDe: 'Beim Parallelogramm sind die Grenzen unabhängig, beim Dreieck koppelt s+t≤1 die Parameter; Gleichheiten markieren Ränder und eine neue Ausgangsecke ändert die Figur nicht.',
      essentialUnderstandingEn: 'For a parallelogram the bounds are independent, while for a triangle s+t≤1 couples the parameters; equalities mark boundaries and a new base vertex does not change the figure.',
      observablePerformanceDe: 'Die lernende Person ordnet Randgleichungen geometrisch zu, klassifiziert Parameterpaare und parametrisiert von einer anderen Ecke aus neu.',
      observablePerformanceEn: 'The learner assigns boundary equalities geometrically, classifies parameter pairs, and reparametrizes from another vertex.',
    },
    minimumIndependentDemonstrations: 2,
    variationAxes: [
      axis('figure-type', 'Parallelogramm und Dreieck wechseln.', 'Parallelogram and triangle vary.'),
      axis('base-vertex', 'Ausgangsecke und Kantenorientierung wechseln.', 'The base vertex and edge orientation vary.'),
      axis('point-location', 'Ecke, Kante, Inneres und Außenbereich werden unterschieden.', 'Vertex, edge, interior, and exterior are distinguished.'),
    ],
    applicationCaseBriefs: [
      applicationCase(
        'parallelogram',
        'Für A(1,0,2), B(4,1,2), D(0,2,3) parametrisiere ABCD, bestimme C und deute ausgewählte Rand- und Innenwerte.',
        'For A(1,0,2), B(4,1,2), D(0,2,3), parametrize ABCD, determine C, and interpret selected boundary and interior values.',
        'u=(3,1,0), v=(-1,2,1), C=(3,3,3); 0≤s,t≤1, wobei Gleichheiten Ecken oder Kanten und echte Zwischenwerte das Innere beschreiben.',
        'u=(3,1,0), v=(-1,2,1), C=(3,3,3); 0≤s,t≤1, with equalities describing vertices or edges and strict intermediate values the interior.',
        'Unabhängige Grenzen und Randbedeutung.',
        'Independent bounds and boundary meaning.',
      ),
      applicationCase(
        'triangle-and-new-base',
        'Parametrisiere das Dreieck A(0,1,0), B(2,0,1), C(-1,3,2), ordne s=0,t=0,s+t=1 zu und nutze B als neue Ecke.',
        'Parametrize triangle A(0,1,0), B(2,0,1), C(-1,3,2), assign s=0,t=0,s+t=1, and use B as a new vertex.',
        'A+s(B-A)+t(C-A), s,t≥0,s+t≤1; die Gleichheiten markieren AC, AB, BC. B+r(A-B)+q(C-B) mit denselben Dreiecksgrenzen ist äquivalent.',
        'A+s(B-A)+t(C-A), s,t≥0,s+t≤1; equalities mark AC, AB, BC. B+r(A-B)+q(C-B) with the same triangular bounds is equivalent.',
        'Gekoppeltes Gebiet, Randzuordnung und neue Ausgangsecke.',
        'Coupled domain, boundary assignment, and new base vertex.',
      ),
    ],
  }],
  ['ce491ec0-c558-5872-86fd-289e60a38403', {
    archetype: 'procedure',
    selectionReasonDe: 'Einsetzen, Gleichheitsprüfung und eine auf Zugehörigkeit begrenzte Schlussfolgerung bilden ein zusammenhängendes Verfahren.',
    selectionReasonEn: 'Substitution, checking equality, and a conclusion limited to membership form one coherent procedure.',
    additionalExpectation: {
      id: 'reverse-membership',
      essentialUnderstandingDe: 'Bei unbekannter Koordinate liefert die Ebenengleichung genau die zugehörigen Werte; ein Restwert ungleich null beweist nur Nichtzugehörigkeit.',
      essentialUnderstandingEn: 'With an unknown coordinate, the plane equation gives exactly the values yielding membership; a nonzero residual proves only nonmembership.',
      observablePerformanceDe: 'Die lernende Person löst nach der unbekannten Koordinate, prüft sie und grenzt die Aussage von Abstand oder Seitenlage ab.',
      observablePerformanceEn: 'The learner solves for the unknown coordinate, verifies it, and limits the statement relative to distance or side classification.',
    },
    minimumIndependentDemonstrations: 2,
    variationAxes: [
      axis('membership-outcome', 'Gleichheit oder Restwert ungleich null tritt auf.', 'Equality or a nonzero residual occurs.'),
      axis('reasoning-direction', 'Punktprüfung oder Bestimmung einer unbekannten Koordinate wird verlangt.', 'Point testing or determining an unknown coordinate is required.'),
      axis('equation-form', 'Originale oder skalierte Koordinatenform wird verwendet.', 'The original or a scaled coordinate form is used.'),
    ],
    applicationCaseBriefs: [
      applicationCase(
        'membership-and-nonmembership',
        'Prüfe für 2x-y+z=4 die Punkte P(1,-1,1) und Q(0,0,0) und formuliere den Aussageumfang.',
        'For 2x-y+z=4, test P(1,-1,1) and Q(0,0,0), and state the claim scope.',
        'P liefert 4 und gehört dazu; Q liefert 0 und gehört nicht dazu. Abstand oder Seite folgen daraus nicht.',
        'P gives 4 and belongs; Q gives 0 and does not. Distance or side does not follow.',
        'Begründete Entscheidung mit begrenztem Aussageumfang.',
        'A justified decision with bounded claim scope.',
      ),
      applicationCase(
        'unknown-coordinate',
        'Für welche a liegt P(a,2,-1) auf x+3y-2z=10? Prüfe in -2x-6y+4z=-20.',
        'For which a does P(a,2,-1) lie on x+3y-2z=10? Verify in -2x-6y+4z=-20.',
        'a+6+2=10 ergibt genau a=2; derselbe Wert erfüllt die skalierte Gleichung.',
        'a+6+2=10 gives exactly a=2; the same value satisfies the scaled equation.',
        'Umkehrung und Skalierungsinvarianz der Punktprobe.',
        'Reversal and scaling invariance of the point test.',
      ),
    ],
  }],
  ['06de364f-9b63-4044-8229-a975621dc6df', {
    archetype: 'representation',
    selectionReasonDe: 'Achsenschnittpunkte, Normalenrichtung und Punktproben werden zu einer begründeten räumlichen Lagebeschreibung integriert.',
    selectionReasonEn: 'Axis intercepts, normal direction, and point tests are integrated into a reasoned spatial description.',
    additionalExpectation: {
      id: 'intercept-existence-and-special-position',
      essentialUnderstandingDe: 'Ein einzelner Achsenschnittpunkt liegt nur vor, wenn die Achsengleichung genau eine Lösung hat. Bei einem Nullkoeffizienten gibt es auf der betreffenden Achse entweder keinen Schnittpunkt oder – falls zugleich d = 0 gilt – die gesamte Achse liegt in der Ebene; d = 0 bedeutet außerdem, dass die Ebene durch den Ursprung geht.',
      essentialUnderstandingEn: 'A single axis-intercept point exists only when the axis equation has exactly one solution. If the corresponding coefficient is zero, the relevant axis either has no intersection point or—when d = 0 as well—the entire axis lies in the plane; d = 0 also means that the plane passes through the origin.',
      observablePerformanceDe: 'Die lernende Person behandelt Sonderfälle, unterscheidet einzelnen Schnitt von enthaltener Achse und verbindet dies mit der Normalenrichtung.',
      observablePerformanceEn: 'The learner handles special cases, distinguishes a single intercept from a contained axis, and connects this with the normal direction.',
    },
    minimumIndependentDemonstrations: 2,
    variationAxes: [
      axis('intercept-pattern', 'Drei Schnitte, fehlende Schnitte oder enthaltene Achse treten auf.', 'Three intercepts, missing intercepts, or a contained axis occur.'),
      axis('constant-case', 'Die Ebene geht durch den Ursprung oder nicht.', 'The plane passes through the origin or not.'),
      axis('output-mode', 'Rechnung, Skizzenbegründung oder Lagebeschreibung wird verlangt.', 'Calculation, sketch justification, or position description is required.'),
    ],
    applicationCaseBriefs: [
      applicationCase(
        'three-intercepts',
        'Beschreibe 2x+3y+z=6 mit Achsenschnitten, Normalenvektor und Punktprobe für P(1,1,1).',
        'Describe 2x+3y+z=6 using axis intercepts, the normal vector, and a point test for P(1,1,1).',
        'Schnitte (3,0,0),(0,2,0),(0,0,6), n=(2,3,1), und P erfüllt die Gleichung; alles wird konsistent zusammengeführt.',
        'Intercepts (3,0,0),(0,2,0),(0,0,6), n=(2,3,1), and P satisfies the equation; all facts are combined consistently.',
        'Integration verschiedener Lageinformationen.',
        'Integration of different position information.',
      ),
      applicationCase(
        'contained-axis',
        'Untersuche 2x-z=0 bezüglich Ursprung sowie x-, y-, z-Achse und beschreibe die Orientierung.',
        'Analyze 2x-z=0 relative to the origin and x-, y-, z-axes, and describe orientation.',
        'Die Ebene geht durch den Ursprung, n=(2,0,-1); die y-Achse liegt vollständig darin, x- und z-Achse schneiden nur im Ursprung.',
        'The plane passes through the origin, n=(2,0,-1); the y-axis lies entirely in it, while x- and z-axes intersect only at the origin.',
        'Sonderlage bei Nullkoeffizient und d=0.',
        'Special position with a zero coefficient and d=0.',
      ),
    ],
  }],
  ['436532fe-cee6-5a13-a4be-05522435937b', {
    archetype: 'concept',
    selectionReasonDe: 'Konsistenz, unabhängige Bedingungen und freie Variablen bestimmen die Dimension der geometrischen Schnittmenge.',
    selectionReasonEn: 'Consistency, independent conditions, and free variables determine the dimension of the geometric intersection.',
    additionalExpectation: {
      id: 'free-variables-and-dimension',
      essentialUnderstandingDe: 'Redundanz ändert die Schnittmenge nicht, Widerspruch macht sie leer, und bei Konsistenz bestimmt die Zahl freier Variablen die Dimension.',
      essentialUnderstandingEn: 'Redundancy does not change the intersection, contradiction makes it empty, and under consistency the number of free variables determines dimension.',
      observablePerformanceDe: 'Die lernende Person reduziert Systeme, erkennt Redundanz oder Widerspruch, parametrisiert freie Variablen und begründet die geometrische Klasse.',
      observablePerformanceEn: 'The learner reduces systems, recognizes redundancy or contradiction, parametrizes free variables, and justifies the geometric class.',
    },
    minimumIndependentDemonstrations: 2,
    variationAxes: [
      axis('consistency', 'Konsistente und widersprüchliche Systeme wechseln.', 'Consistent and contradictory systems vary.'),
      axis('independent-conditions', 'Unabhängige und redundante Gleichungen wechseln.', 'Independent and redundant equations vary.'),
      axis('solution-dimension', 'Leere Menge, Punkt, Gerade, Ebene oder Raum werden klassifiziert.', 'Empty set, point, line, plane, or space is classified.'),
    ],
    applicationCaseBriefs: [
      applicationCase(
        'unique-point',
        'Löse x+y+z=3, x-y=1, z=1 und deute die gemeinsame Lösung geometrisch.',
        'Solve x+y+z=3, x-y=1, z=1 and interpret the common solution geometrically.',
        'z=1, x+y=2 und x-y=1 liefern (3/2,1/2,1); drei unabhängige Bedingungen schneiden sich in einem Punkt.',
        'z=1, x+y=2, and x-y=1 give (3/2,1/2,1); three independent conditions intersect in a point.',
        'Algebraische Eindeutigkeit und nulldimensionale Schnittmenge.',
        'Algebraic uniqueness and a zero-dimensional intersection.',
      ),
      applicationCase(
        'redundancy-line-contradiction',
        'Klassifiziere A: x+y=2,2x+2y=4; B: x+y=2,y+z=3; C: x+y=2,2x+2y=5.',
        'Classify A: x+y=2,2x+2y=4; B: x+y=2,y+z=3; C: x+y=2,2x+2y=5.',
        'A hat eine unabhängige Bedingung und ist eine Ebene; B hat zwei und ist eine Gerade; C ist widersprüchlich und leer.',
        'A has one independent condition and is a plane; B has two and is a line; C is contradictory and empty.',
        'Robuste Einordnung unabhängig von bloßer Gleichungszahl.',
        'Robust classification independent of the mere number of equations.',
      ),
    ],
  }],
])

const writeLockPath = `${artifactRoot}/.${artifactStem}.write-lock`
const stagingSuffix = '.b020-stable11-evidence-staging'
const stagingPath = (path: string): string => `${path}${stagingSuffix}`

const sha256Hex = (value: Buffer | string): string => (
  createHash('sha256').update(value).digest('hex')
)
const digest = (value: Buffer | string): `sha256:${string}` => `sha256:${sha256Hex(value)}`
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const sameOrdered = (left: readonly string[], right: readonly string[]): boolean => (
  left.length === right.length && left.every((value, index) => value === right[index])
)
const sameJson = (left: unknown, right: unknown): boolean => JSON.stringify(left) === JSON.stringify(right)
const hasErrorCode = (error: unknown, code: string): boolean => (
  typeof error === 'object'
  && error !== null
  && 'code' in error
  && error.code === code
)

const absolute = (path: string): string => {
  const candidate = resolve(repositoryRoot, path)
  const repositoryRelative = relative(repositoryRoot, candidate)
  if (
    repositoryRelative === ''
    || repositoryRelative === '..'
    || repositoryRelative.startsWith(`..${sep}`)
  ) {
    throw new Error(`Path must resolve below the repository root: ${path}`)
  }
  return candidate
}

const assertRealDirectory = (path: string, role: string): void => {
  let stat
  try {
    stat = lstatSync(path)
  } catch (error) {
    throw new Error(`${role} is not an existing real directory: ${path}: ${String(error)}`)
  }
  if (!stat.isDirectory()) throw new Error(`${role} is not a real directory: ${path}`)
}

const assertRealParentChain = (path: string, role: string): void => {
  const candidate = absolute(path)
  assertRealDirectory(repositoryRoot, 'Repository root')
  const parentRelative = relative(repositoryRoot, dirname(candidate))
  if (parentRelative === '') return
  let current = repositoryRoot
  for (const part of parentRelative.split(sep)) {
    current = resolve(current, part)
    assertRealDirectory(current, `${role} parent`)
  }
}

const readRegularFile = (path: string, role: string): Buffer => {
  assertRealParentChain(path, role)
  const candidate = absolute(path)
  let stat
  try {
    stat = lstatSync(candidate)
  } catch (error) {
    if (hasErrorCode(error, 'ENOENT')) throw new Error(`${role} is missing: ${path}`)
    throw error
  }
  if (!stat.isFile()) throw new Error(`${role} is not a regular file: ${path}`)
  return readFileSync(candidate)
}

const readBoundFile = (path: string, expectedSha256: string, role: string): Buffer => {
  const bytes = readRegularFile(path, role)
  const actualSha256 = sha256Hex(bytes)
  if (actualSha256 !== expectedSha256) {
    throw new Error(`${role} source drift: ${path}: ${actualSha256} != ${expectedSha256}`)
  }
  return bytes
}

const parseJson = <T>(bytes: Buffer, role: string): T => {
  try {
    return JSON.parse(bytes.toString('utf8')) as T
  } catch (error) {
    throw new Error(`${role} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const parseJsonl = (bytes: Buffer, role: string): BoundRecord[] => {
  const text = bytes.toString('utf8')
  if (!text.endsWith('\n')) throw new Error(`${role} must end with one LF-delimited record boundary`)
  const lines = text.split('\n')
  lines.pop()
  if (lines.length === 0 || lines.some((line) => line.length === 0 || line.endsWith('\r'))) {
    throw new Error(`${role} contains an empty or non-canonical CRLF record`)
  }
  return lines.map((line, index) => ({
    record: parseJson<ReviewRecord>(Buffer.from(line), `${role} line ${index + 1}`),
    digest: digest(Buffer.from(line)),
  }))
}

const assertUnique = (values: readonly string[], role: string): void => {
  if (new Set(values).size !== values.length) throw new Error(`${role} contains duplicate goal IDs`)
}

const assertPinnedHash = (role: string, value: string): void => {
  if (!/^[0-9a-f]{64}$/u.test(value)) throw new Error(`${role} is not a lowercase SHA-256 hex digest`)
}

const assertOptionalPinsWellFormed = (): void => {
  for (const [role, value] of Object.entries(sourceHashes)) {
    if (value !== 'PENDING') assertPinnedHash(`sourceHashes.${role}`, value)
  }
  for (const [role, value] of Object.entries(expectedCurrentContextDigests)) {
    if (value !== 'PENDING') assertPinnedHash(`expectedCurrentContextDigests.${role}`, value)
  }
  for (const resolution of resolutionFiles) {
    if (resolution.sha256 !== 'PENDING') {
      assertPinnedHash(`resolutionFiles.${resolution.goalId}`, resolution.sha256)
    }
  }
  if (expectedPlanSha256 !== 'PENDING') assertPinnedHash('expectedPlanSha256', expectedPlanSha256)
}

const assertMutationPinsBound = (): void => {
  for (const [role, value] of Object.entries(sourceHashes)) {
    if (value === 'PENDING') throw new Error(`Refusing mutation/check while sourceHashes.${role} is PENDING`)
  }
  for (const [role, value] of Object.entries(expectedCurrentContextDigests)) {
    if (value === 'PENDING') {
      throw new Error(`Refusing mutation/check while expectedCurrentContextDigests.${role} is PENDING`)
    }
  }
  for (const resolution of resolutionFiles) {
    if (resolution.sha256 === 'PENDING') {
      throw new Error(`Refusing mutation/check while resolutionFiles.${resolution.goalId} is PENDING`)
    }
  }
  if (expectedPlanSha256 === 'PENDING') {
    throw new Error('Refusing mutation/check while expectedPlanSha256 is PENDING')
  }
}

const assertOptionalPinMatches = (role: string, configured: string, actual: string): void => {
  if (configured !== 'PENDING' && configured !== actual) {
    throw new Error(`${role} drift: ${actual} != ${configured}`)
  }
}

const verifyStaticScope = (): void => {
  assertUnique(campaignGoalIds, 'B020 campaign scope')
  assertUnique(goalIds, 'B020 stable-eleven scope')
  assertUnique(followUpGoalIds, 'B020 follow-up scope')
  assertUnique(preexistingOwnedGoalIds, 'B020 preexisting-owned scope')
  if (
    campaignGoalIds.length !== 13
    || goalIds.length !== 11
    || followUpGoalIds.length !== 1
    || preexistingOwnedGoalIds.length !== 1
    || selectedRoundByGoalId.size !== goalIds.length
    || profileDefinitions.size !== goalIds.length
    || resolutionFiles.length !== goalIds.length
    || !goalIds.includes(mixedDissentGoalId)
  ) {
    throw new Error(
      'B020 evidence scope must be exactly 13 = 11 new stable + 1 revised follow-up + 1 preexisting',
    )
  }
  const partition = [...goalIds, ...followUpGoalIds, ...preexistingOwnedGoalIds]
  if (
    new Set(partition).size !== campaignGoalIds.length
    || !campaignGoalIds.every((goalId) => partition.includes(goalId))
  ) {
    throw new Error(
      'B020 new-stable, follow-up, and preexisting scopes must form a disjoint full campaign partition',
    )
  }
  if (
    [...selectedRoundByGoalId.keys()].some((goalId) => !goalIds.includes(goalId as typeof goalIds[number]))
    || [...profileDefinitions.keys()].some((goalId) => !goalIds.includes(goalId as typeof goalIds[number]))
    || !sameOrdered(resolutionFiles.map(({ goalId }) => goalId), goalIds)
  ) {
    throw new Error('B020 evidence selection, profile, or resolution binding claims a non-stable goal')
  }
}

const fixedSourceSpecifications = [
  { key: 'config', role: 'math_b020_config', path: sourceConfigPath, sha256: sourceHashes.config },
  { key: 'batchManifest', role: 'math_b020_batch_manifest', path: batchManifestPath, sha256: sourceHashes.batchManifest },
  { key: 'bookModel', role: 'math_b020_book_model', path: bookModelPath, sha256: sourceHashes.bookModel },
  { key: 'bundleManifest', role: 'math_b020_bundle_manifest', path: bundleManifestPath, sha256: sourceHashes.bundleManifest },
  { key: 'bundleReviewInput', role: 'math_b020_bundle_review_input', path: bundleReviewInputPath, sha256: sourceHashes.bundleReviewInput },
  { key: 'bundleReviewInputJsonl', role: 'math_b020_bundle_review_input_jsonl', path: bundleReviewInputJsonlPath, sha256: sourceHashes.bundleReviewInputJsonl },
  { key: 'dualSummary', role: 'math_b020_dual_summary', path: dualSummaryPath, sha256: sourceHashes.dualSummary },
  { key: 'adjudication', role: 'math_b020_third_subject_adjudication', path: adjudicationPath, sha256: sourceHashes.adjudication },
  { key: 'roundARecords', role: 'math_b020_round_a_records', path: roundARecordsPath, sha256: sourceHashes.roundARecords },
  { key: 'roundARun', role: 'math_b020_round_a_run', path: roundARunPath, sha256: sourceHashes.roundARun },
  { key: 'roundBRecords', role: 'math_b020_round_b_records', path: roundBRecordsPath, sha256: sourceHashes.roundBRecords },
  { key: 'roundBRun', role: 'math_b020_round_b_run', path: roundBRunPath, sha256: sourceHashes.roundBRun },
  { key: 'criteria', role: 'math_positive_evidence_criteria_v2', path: criteriaPath, sha256: sourceHashes.criteria },
] as const

type FixedBoundSources = Record<typeof fixedSourceSpecifications[number]['key'], Buffer>

const loadFixedBoundSources = (): FixedBoundSources => Object.fromEntries(
  fixedSourceSpecifications.map(({ key, path, sha256, role }) => [
    key,
    readBoundFile(path, sha256, role),
  ]),
) as FixedBoundSources

type BuiltPlan = {
  outputs: PlannedOutput[]
  planSha256: string
  carryoverProducerPlanSha256: string
  carryoverMaterializationState: MaterializationState
  currentPins: {
    carryoverMaterializer: string
    canonical: string
    semanticKindLedger: string
    goalBook: string
    subset: string
    carryoverMaterializationPlan: string | null
    synthesisManifest: string
    compatibilityReceipt: string
    resolutionIndex: string
    resolutions: Record<string, string>
  }
}

const buildPlan = async (): Promise<BuiltPlan> => {
  assertOptionalPinsWellFormed()
  verifyStaticScope()
  const fixedSources = loadFixedBoundSources()
  const carryoverMaterializerBytes = readRegularFile(
    carryoverMaterializerPath,
    'B020 stable-eleven carryover-v2 materializer',
  )
  const actualCarryoverMaterializerSha256 = sha256Hex(carryoverMaterializerBytes)
  assertOptionalPinMatches(
    'sourceHashes.carryoverMaterializer',
    sourceHashes.carryoverMaterializer,
    actualCarryoverMaterializerSha256,
  )
  const carryoverPlanStdout = execFileSync('npx', [
    '--prefix',
    'app',
    'tsx',
    carryoverMaterializerPath,
  ], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  })
  const carryoverPlan = parseJson<CarryoverPlanReport>(
    Buffer.from(carryoverPlanStdout),
    'B020 stable-eleven carryover-v2 PLAN report',
  )
  const carryoverOutputs = carryoverPlan.outputs ?? []
  const expectedCarryoverPaths = [
    synthesisPath,
    ...resolutionFiles.map(({ path }) => path),
    compatibilityReceiptPath,
    resolutionIndexPath,
  ]
  if (
    carryoverPlan.mode !== 'PLAN'
    || carryoverPlan.status !== 'BOUND'
    || typeof carryoverPlan.computedPlanSha256 !== 'string'
    || !/^[0-9a-f]{64}$/u.test(carryoverPlan.computedPlanSha256)
    || typeof carryoverPlan.materializationPlanSha256 !== 'string'
    || !/^[0-9a-f]{64}$/u.test(carryoverPlan.materializationPlanSha256)
    || carryoverPlan.curriculumAuthority?.totalGoalCount !== expectedCanonicalGoalCount
    || carryoverPlan.curriculumAuthority.curricularAtomicGoalCount
      !== expectedCurriculumAtomicDenominator
    || carryoverPlan.curriculumAuthority.projectedAtomicGoalCount
      !== expectedProjectedAtomicGoalCount
    || carryoverPlan.curriculumAuthority.excludedTargetAtomicGoalCount
      !== expectedExcludedTargetAtomicGoalCount
    || carryoverPlan.curriculumAuthority.stableCarryoverProgress !== '11/792 = 1.4%'
    || carryoverPlan.outputCount !== expectedCarryoverPaths.length
    || carryoverPlan.outputFileMode !== '0644'
    || carryoverPlan.ownedDirectoryAndWriteLockMode !== '0700'
    || !sameOrdered(carryoverPlan.stableGoalIds as string[] ?? [], goalIds)
    || !sameOrdered(carryoverPlan.followUpGoalIds as string[] ?? [], followUpGoalIds)
    || !sameOrdered(
      carryoverPlan.preexistingOwnedGoalIds as string[] ?? [],
      preexistingOwnedGoalIds,
    )
    || carryoverOutputs.length !== expectedCarryoverPaths.length
    || !sameOrdered(carryoverOutputs.map(({ path }) => String(path ?? '')), expectedCarryoverPaths)
    || carryoverOutputs.some(({ sha256, mode }) => (
      typeof sha256 !== 'string'
      || !/^[0-9a-f]{64}$/u.test(sha256)
      || mode !== '0644'
    ))
    || !['exact-before', 'resumable-mixed', 'exact-after'].includes(
      String(carryoverPlan.materializationState),
    )
  ) {
    throw new Error('B020 carryover-v2 PLAN report identity, 1174/792/919/127 authority, or outputs changed')
  }
  const carryoverProducerPlanSha256 = carryoverPlan.computedPlanSha256
  const carryoverMaterializationPlanSha256 = carryoverPlan.materializationPlanSha256 as string
  const carryoverMaterializationState = carryoverPlan.materializationState as MaterializationState
  assertOptionalPinMatches(
    'expectedCurrentContextDigests.carryoverProducerPlan',
    expectedCurrentContextDigests.carryoverProducerPlan,
    carryoverProducerPlanSha256,
  )
  assertOptionalPinMatches(
    'expectedCurrentContextDigests.carryoverMaterializationPlan',
    expectedCurrentContextDigests.carryoverMaterializationPlan,
    carryoverMaterializationPlanSha256,
  )
  const plannedCarryoverHashes = new Map(carryoverOutputs.map(({ path, sha256 }) => [
    String(path),
    String(sha256),
  ]))
  const plannedSynthesisManifestSha256 = plannedCarryoverHashes.get(synthesisPath)
  const plannedCompatibilityReceiptSha256 = plannedCarryoverHashes.get(compatibilityReceiptPath)
  const plannedResolutionIndexSha256 = plannedCarryoverHashes.get(resolutionIndexPath)
  if (
    !plannedSynthesisManifestSha256
    || !plannedCompatibilityReceiptSha256
    || !plannedResolutionIndexSha256
  ) throw new Error('B020 carryover-v2 PLAN report is missing synthesis, receipt, or index hashes')
  assertOptionalPinMatches(
    'sourceHashes.synthesisManifest',
    sourceHashes.synthesisManifest,
    plannedSynthesisManifestSha256,
  )
  assertOptionalPinMatches(
    'sourceHashes.compatibilityReceipt',
    sourceHashes.compatibilityReceipt,
    plannedCompatibilityReceiptSha256,
  )
  assertOptionalPinMatches(
    'sourceHashes.resolutionIndex',
    sourceHashes.resolutionIndex,
    plannedResolutionIndexSha256,
  )
  const plannedResolutionHashes = new Map<string, string>()
  for (const resolution of resolutionFiles) {
    const actual = plannedCarryoverHashes.get(resolution.path)
    if (!actual) throw new Error(`${resolution.goalId}: carryover-v2 PLAN omitted the resolution hash`)
    assertOptionalPinMatches(`resolutionFiles.${resolution.goalId}`, resolution.sha256, actual)
    plannedResolutionHashes.set(resolution.goalId, actual)
  }

  const canonicalBytes = readRegularFile(canonicalPath, 'Post-B020 current canonical Mathematics landscape')
  const semanticKindLedgerBytes = readRegularFile(
    semanticKindLedgerPath,
    'Post-B020 current Mathematics semantic-kind ledger',
  )
  const actualCanonicalSha256 = sha256Hex(canonicalBytes)
  const actualSemanticKindLedgerSha256 = sha256Hex(semanticKindLedgerBytes)
  assertOptionalPinMatches('sourceHashes.canonical', sourceHashes.canonical, actualCanonicalSha256)
  assertOptionalPinMatches(
    'sourceHashes.semanticKindLedger',
    sourceHashes.semanticKindLedger,
    actualSemanticKindLedgerSha256,
  )
  const currentGoalBookSha256 = String(carryoverPlan.currentPostStatePins?.goalBook ?? '')
  const currentSubsetDigest = String(carryoverPlan.currentSubsetDigest ?? '')
  if (
    carryoverPlan.currentPostStatePins?.canonical !== actualCanonicalSha256
    || carryoverPlan.currentPostStatePins.semanticKindLedger !== actualSemanticKindLedgerSha256
    || !/^[0-9a-f]{64}$/u.test(currentGoalBookSha256)
    || !/^sha256:[0-9a-f]{64}$/u.test(currentSubsetDigest)
  ) {
    throw new Error('B020 carryover-v2 current canonical, ledger, GoalBook, or subset pins are malformed')
  }
  assertOptionalPinMatches(
    'expectedCurrentContextDigests.goalBook',
    expectedCurrentContextDigests.goalBook,
    currentGoalBookSha256,
  )
  assertOptionalPinMatches(
    'expectedCurrentContextDigests.subset',
    expectedCurrentContextDigests.subset,
    currentSubsetDigest.replace(/^sha256:/u, ''),
  )

  const sourceConfig = parseJson<{ batchId?: string; subject?: string; goalIds?: string[] }>(
    fixedSources.config,
    'B020 config',
  )
  const batchManifest = parseJson<{
    batchId?: string
    subject?: string
    goalIds?: string[]
    curriculumAtomicDenominatorAtPreparation?: number
    source?: { landscapePath?: string; landscapeId?: string }
    artifacts?: {
      bookModelDigest?: string
      bundleFingerprint?: string
      reviewInputFingerprint?: string
    }
  }>(
    fixedSources.batchManifest,
    'B020 batch manifest',
  )
  const roundARun = parseJson<{ runId?: string; status?: string; blindToOtherRuns?: boolean; goalIds?: string[] }>(
    fixedSources.roundARun,
    'B020 Round A run',
  )
  const roundBRun = parseJson<{ runId?: string; status?: string; blindToOtherRuns?: boolean; goalIds?: string[] }>(
    fixedSources.roundBRun,
    'B020 Round B run',
  )
  const dualSummary = parseJson<DualSummary>(fixedSources.dualSummary, 'B020 dual summary')
  const adjudication = parseJson<Adjudication>(fixedSources.adjudication, 'B020 third adjudication')
  const canonical = parseJson<{ landscapeId?: string; subject?: string; goals?: CanonicalGoal[] }>(
    canonicalBytes,
    'Post-B020 current canonical Mathematics landscape',
  )
  const semanticKindLedger = parseJson<{
    documentType?: string
    sourceLandscapeId?: string
    sourceLandscapePath?: string
    counts?: { curricularAtomic?: number; total?: number }
    decisions?: Array<{ goalId?: string; semanticKind?: string; decisionStatus?: string }>
  }>(semanticKindLedgerBytes, 'Post-B020 current Mathematics semantic-kind ledger')

  if (
    sourceConfig.batchId !== expectedBatchId
    || sourceConfig.subject !== 'mathematik'
    || !sameOrdered(sourceConfig.goalIds ?? [], campaignGoalIds)
    || batchManifest.batchId !== expectedBatchId
    || batchManifest.subject !== 'mathematik'
    || !sameOrdered(batchManifest.goalIds ?? [], campaignGoalIds)
    || batchManifest.curriculumAtomicDenominatorAtPreparation
      !== expectedCurriculumAtomicDenominator
    || batchManifest.source?.landscapePath !== canonicalPath
    || batchManifest.source.landscapeId !== landscapeId
  ) {
    throw new Error('B020 config or batch manifest is not the exact ordered 13-goal campaign')
  }
  if (
    roundARun.runId !== expectedRoundARunId
    || roundARun.status !== 'completed'
    || roundARun.blindToOtherRuns !== true
    || !sameOrdered(roundARun.goalIds ?? [], campaignGoalIds)
    || roundBRun.runId !== expectedRoundBRunId
    || roundBRun.status !== 'completed'
    || roundBRun.blindToOtherRuns !== true
    || !sameOrdered(roundBRun.goalIds ?? [], campaignGoalIds)
  ) {
    throw new Error('B020 blind-review run bindings are invalid')
  }
  if (
    dualSummary.goalCount !== campaignGoalIds.length
    || dualSummary.goals?.length !== campaignGoalIds.length
    || !sameOrdered(dualSummary.goals.map(({ goalId }) => goalId ?? ''), campaignGoalIds)
  ) {
    throw new Error('B020 dual summary does not bind the exact ordered campaign')
  }
  if (
    adjudication.schemaVersion !== 1
    || adjudication.validationContract !== 'goal-description-third-adjudication-v1'
    || adjudication.artifactType !== 'third_adjudication'
    || adjudication.batchId !== expectedBatchId
    || adjudication.subject !== 'mathematik'
    || adjudication.landscapeId !== landscapeId
    || adjudication.authority !== 'third_non_blind_subject_adjudication'
    || adjudication.campaignGoalCount !== campaignGoalIds.length
    || !sameOrdered(
      adjudication.stableCurrentGoalIds ?? [],
      [...goalIds, ...preexistingOwnedGoalIds],
    )
    || !sameOrdered(adjudication.newStableClaimGoalIds ?? [], goalIds)
    || !sameOrdered(adjudication.preexistingOwnedGoalIds ?? [], preexistingOwnedGoalIds)
    || !sameOrdered(adjudication.acceptedRevisionGoalIds ?? [], followUpGoalIds)
    || !sameOrdered(adjudication.requiredFreshReviewGoalIds ?? [], followUpGoalIds)
    || adjudication.decisions?.length !== campaignGoalIds.length
    || !sameOrdered(adjudication.decisions.map(({ goalId }) => goalId ?? ''), campaignGoalIds)
  ) {
    throw new Error('B020 third adjudication does not authorize exactly the stable-eleven scope')
  }
  if (
    adjudication.inputBinding?.configSha256 !== sourceHashes.config
    || adjudication.inputBinding.batchManifestSha256 !== sourceHashes.batchManifest
    || adjudication.inputBinding.dualSummarySha256 !== sourceHashes.dualSummary
    || adjudication.inputBinding.roundA?.runManifestSha256 !== sourceHashes.roundARun
    || adjudication.inputBinding.roundA.recordsSha256 !== sourceHashes.roundARecords
    || adjudication.inputBinding.roundA.runId !== expectedRoundARunId
    || adjudication.inputBinding.roundB?.runManifestSha256 !== sourceHashes.roundBRun
    || adjudication.inputBinding.roundB.recordsSha256 !== sourceHashes.roundBRecords
    || adjudication.inputBinding.roundB.runId !== expectedRoundBRunId
  ) {
    throw new Error('B020 third adjudication input hashes do not match the bound blind-review sources')
  }

  if (
    canonical.landscapeId !== landscapeId
    || canonical.subject !== 'Mathematik'
    || semanticKindLedger.documentType !== 'semantic-kind-ledger'
    || semanticKindLedger.sourceLandscapeId !== landscapeId
    || semanticKindLedger.sourceLandscapePath !== canonicalPath
  ) {
    throw new Error('Canonical Mathematics, semantic-kind ledger, and evidence review identity disagree')
  }
  const canonicalGoals = canonical.goals ?? []
  const canonicalGoalIds = canonicalGoals.map(({ id }) => id ?? '')
  assertUnique(canonicalGoalIds, 'Canonical Mathematics landscape')
  const ledgerDecisions = semanticKindLedger.decisions ?? []
  const ledgerGoalIds = ledgerDecisions.map(({ goalId }) => goalId ?? '')
  const authoritativeCurricularAtomic = ledgerDecisions.filter((decision) => (
    decision.decisionStatus === 'authoritative' && decision.semanticKind === 'curricularAtomic'
  ))
  const authoritativeCurricularAtomicIds = authoritativeCurricularAtomic.map(({ goalId }) => goalId ?? '')
  if (
    canonicalGoals.length !== expectedCanonicalGoalCount
    || canonicalGoalIds.some((goalId) => goalId === '')
    || ledgerDecisions.length !== expectedCanonicalGoalCount
    || ledgerGoalIds.some((goalId) => goalId === '')
    || new Set(ledgerGoalIds).size !== expectedCanonicalGoalCount
    || semanticKindLedger.counts?.total !== expectedCanonicalGoalCount
    || semanticKindLedger.counts.curricularAtomic !== expectedCurriculumAtomicDenominator
    || authoritativeCurricularAtomicIds.length !== expectedCurriculumAtomicDenominator
    || new Set(authoritativeCurricularAtomicIds).size !== expectedCurriculumAtomicDenominator
    || canonicalGoalIds.some((goalId) => !ledgerGoalIds.includes(goalId))
    || ledgerGoalIds.some((goalId) => !canonicalGoalIds.includes(goalId))
    || campaignGoalIds.some((goalId) => !authoritativeCurricularAtomicIds.includes(goalId))
  ) {
    throw new Error('Current Mathematics canonical/ledger must prove 1174 total and 792 unique curricularAtomic goals')
  }

  const rounds: Record<ReviewRound, BoundRecord[]> = {
    first: parseJsonl(fixedSources.roundARecords, 'B020 Round A records'),
    second: parseJsonl(fixedSources.roundBRecords, 'B020 Round B records'),
  }
  for (const [round, records] of Object.entries(rounds)) {
    if (
      records.length !== campaignGoalIds.length
      || !sameOrdered(records.map(({ record }) => record.goalId), campaignGoalIds)
    ) {
      throw new Error(`B020 ${round} records do not match the exact ordered campaign`)
    }
    assertUnique(records.map(({ record }) => record.recordId), `B020 ${round} record IDs`)
  }

  const boundResolutionFiles: CandidateSet['sourceBindings']['resolutionFiles'] = resolutionFiles.map((pin) => {
    const sha256 = plannedResolutionHashes.get(pin.goalId)
    if (!sha256) throw new Error(`${pin.goalId}: missing planned resolution SHA-256`)
    return { goalId: pin.goalId, path: pin.path, sha256: `sha256:${sha256}` }
  })
  let verifiedCarryoverMaterializationPlanSha256 = carryoverMaterializationPlanSha256
  if (carryoverMaterializationState === 'exact-after') {
    const synthesisManifestBytes = readBoundFile(
      synthesisPath,
      plannedSynthesisManifestSha256,
      'B020 stable-eleven synthesis manifest',
    )
    const compatibilityReceiptBytes = readBoundFile(
      compatibilityReceiptPath,
      plannedCompatibilityReceiptSha256,
      'B020 stable-eleven compatibility receipt',
    )
    const resolutionIndexBytes = readBoundFile(
      resolutionIndexPath,
      plannedResolutionIndexSha256,
      'B020 stable-eleven resolution index',
    )
    const synthesisManifest = parseJson<GoalDescriptionRolloutSynthesisDecisionManifest>(
      synthesisManifestBytes,
      'B020 stable-eleven synthesis manifest',
    )
    const compatibilityReceipt = parseJson<CompatibilityReceipt>(
      compatibilityReceiptBytes,
      'B020 stable-eleven compatibility receipt',
    )
    const resolutionIndex = parseJson<ResolutionIndex>(
      resolutionIndexBytes,
      'B020 stable-eleven resolution index',
    )
    const { manifestFingerprint, ...synthesisManifestPayload } = synthesisManifest
    if (
      synthesisManifest.schemaVersion !== 1
      || synthesisManifest.synthesisContract !== 'goal-description-rollout-synthesis-decision-v1'
      || synthesisManifest.authority !== 'ai_synthesis'
      || synthesisManifest.batch.batchId !== expectedBatchId
      || synthesisManifest.batch.batchManifestDigest !== digest(fixedSources.batchManifest)
      || synthesisManifest.batch.configDigest !== digest(fixedSources.config)
      || synthesisManifest.batch.bundleFingerprint !== batchManifest.artifacts?.bundleFingerprint
      || synthesisManifest.batch.bookDigest !== batchManifest.artifacts?.bookModelDigest
      || synthesisManifest.batch.reviewInputFingerprint !== batchManifest.artifacts?.reviewInputFingerprint
      || synthesisManifest.batch.dualSummaryDigest !== digest(fixedSources.dualSummary)
      || synthesisManifest.batch.canonicalLandscapeDigest !== digest(canonicalBytes)
      || synthesisManifest.rounds.first.runId !== expectedRoundARunId
      || synthesisManifest.rounds.first.resultsDigest !== digest(fixedSources.roundARecords)
      || synthesisManifest.rounds.second.runId !== expectedRoundBRunId
      || synthesisManifest.rounds.second.resultsDigest !== digest(fixedSources.roundBRecords)
      || synthesisManifest.decisions.length !== goalIds.length
      || !sameOrdered(synthesisManifest.decisions.map(({ goalId }) => goalId), goalIds)
      || fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(synthesisManifestPayload)
        !== manifestFingerprint
    ) throw new Error('B020 synthesis manifest does not bind the exact current eleven-goal authority chain')

    const indexGroup = resolutionIndex.groups?.[0]
    if (
      resolutionIndex.schemaVersion !== 1
      || resolutionIndex.subject !== 'Mathematik'
      || resolutionIndex.semanticKind !== 'curricularAtomic'
      || resolutionIndex.strictDescriptionReviewCompleteCount !== goalIds.length
      || resolutionIndex.curriculumAtomicDenominator !== expectedCurriculumAtomicDenominator
      || resolutionIndex.descriptionReviewPercentage !== 1.4
      || resolutionIndex.synthesisDecisionManifest?.path !== synthesisRelativePath
      || resolutionIndex.synthesisDecisionManifest.digest !== digest(synthesisManifestBytes)
      || resolutionIndex.synthesisDecisionManifest.fingerprint !== manifestFingerprint
      || resolutionIndex.groups?.length !== 1
      || indexGroup?.groupId !== expectedBatchId
      || indexGroup.dualSummaryDigest !== digest(fixedSources.dualSummary)
      || indexGroup.campaignGoalCount !== campaignGoalIds.length
      || indexGroup.resolvedGoalCount !== goalIds.length
      || resolutionIndex.resolutions?.length !== goalIds.length
      || !sameOrdered(resolutionIndex.resolutions.map(({ goalId }) => goalId ?? ''), goalIds)
    ) throw new Error('B020 resolution index must bind exactly 11/792 = 1.4%')

    for (const [index, resolution] of (resolutionIndex.resolutions ?? []).entries()) {
      const pin = resolutionFiles[index]
      const resolutionSha256 = plannedResolutionHashes.get(pin.goalId)
      const expectedRelativePath = `${resolutionDirectory}/${pin.goalId}.resolution.json`
      if (
        !resolutionSha256
        || resolution.goalId !== pin.goalId
        || resolution.decision !== 'keep_current'
        || resolution.resolutionPath !== expectedRelativePath
        || resolution.resolutionDigest !== `sha256:${resolutionSha256}`
        || resolution.strictDescriptionComplete !== true
      ) throw new Error(`${pin.goalId}: resolution-index entry conflicts with carryover-v2 PLAN`)
      const resolutionBytes = readBoundFile(
        pin.path,
        resolutionSha256,
        `${pin.goalId} B020 resolution`,
      )
    const resolutionBody = parseJson<{
      goal?: {
        goalId?: string
        effectiveSemanticKind?: string
        goalFingerprint?: string
        pageFingerprint?: string
        goalReviewContextFingerprint?: string
        finalText?: { titleDe?: string; titleEn?: string; descriptionDe?: string; descriptionEn?: string }
      }
      rounds?: Record<ReviewRound, {
        runId?: string
        resultsDigest?: string
        recordId?: string
        recordDigest?: string
      }>
      dualSummary?: { digest?: string }
      status?: string
      decision?: string
      synthesisDecisionManifest?: {
        contract?: string
        manifestPath?: string
        manifestId?: string
        manifestDigest?: string
        manifestFingerprint?: string
        decisionId?: string
      }
      synthesis?: { understandingEvidence?: ReviewRecord['understandingEvidence'] }
      resolutionFingerprint?: string
      }>(resolutionBytes, `${pin.goalId} B020 resolution`)
    const first = rounds.first.find(({ record }) => record.goalId === pin.goalId)
    const second = rounds.second.find(({ record }) => record.goalId === pin.goalId)
    const selectedRound = selectedRoundByGoalId.get(pin.goalId)
    const selected = selectedRound === 'first' ? first : second
    const canonicalGoal = canonicalGoals.find(({ id }) => id === pin.goalId)
    const manifestDecision = synthesisManifest.decisions[index]
    const adjudicationDecision = adjudication.decisions?.find(({ goalId }) => goalId === pin.goalId)
    if (
      !first
      || !second
      || !selectedRound
      || !selected
      || !canonicalGoal
      || !manifestDecision
      || !adjudicationDecision
    ) {
      throw new Error(`${pin.goalId}: missing review, adjudication, or canonical binding`)
    }
    const isMixedDissent = pin.goalId === mixedDissentGoalId
    const adjudicatedDissent = adjudicationDecision.revisionDissent
    const manifestDissent = manifestDecision.revisionDissent
    if (
      first.record.decision !== 'keep'
      || second.record.decision !== (isMixedDissent ? 'revise' : 'keep')
      || adjudicationDecision.roundA?.recordId !== first.record.recordId
      || adjudicationDecision.roundA.decision !== 'keep'
      || adjudicationDecision.roundB?.recordId !== second.record.recordId
      || adjudicationDecision.roundB.decision !== (isMixedDissent ? 'revise' : 'keep')
      || adjudicationDecision.resolutionDecision !== (isMixedDissent
        ? 'keep_current_with_revision_dissent'
        : 'keep_current')
      || adjudicationDecision.evidenceRound !== selectedRound
      || adjudicationDecision.evidenceRecordId !== selected.record.recordId
      || adjudicationDecision.progressCounted !== false
    ) {
      throw new Error(`${pin.goalId}: adjudicated source decisions conflict with carryover-v2`)
    }
    if (
      isMixedDissent
      && (
        selectedRound !== 'second'
        || adjudicatedDissent?.rejectedRound !== 'second'
        || adjudicatedDissent.rejectedDecision !== 'revise'
        || adjudicatedDissent.disposition !== 'rejected_keep_current'
        || adjudicatedDissent.rejectedProposedDescriptionDe !== second.record.proposedDescriptionDe
        || adjudicatedDissent.rejectedProposedDescriptionEn !== second.record.proposedDescriptionEn
        || manifestDissent?.sourceRound !== 'second'
        || manifestDissent.disposition !== 'rejected_keep_current'
        || manifestDissent.proposedDescriptionDe !== second.record.proposedDescriptionDe
        || manifestDissent.proposedDescriptionEn !== second.record.proposedDescriptionEn
        || manifestDissent.rationaleDe !== adjudicatedDissent.rationaleDe
        || manifestDissent.rationaleEn !== adjudicatedDissent.rationaleEn
      )
    ) {
      throw new Error(`${pin.goalId}: exact rejected Round-B replacement dissent is not bound`)
    }
    if (!isMixedDissent && (adjudicatedDissent || manifestDissent)) {
      throw new Error(`${pin.goalId}: unexpected revision dissent on a KEEP/KEEP resolution`)
    }
    const expectedFinalText = {
      titleDe: canonicalGoal.title,
      titleEn: canonicalGoal.titleEn,
      descriptionDe: canonicalGoal.description,
      descriptionEn: canonicalGoal.descriptionEn,
    }
    if (
      resolutionBody.goal?.goalId !== pin.goalId
      || resolutionBody.goal.effectiveSemanticKind !== 'curricularAtomic'
      || !sameJson(resolutionBody.goal.finalText, expectedFinalText)
      || manifestDecision.goalId !== pin.goalId
      || manifestDecision.effectiveSemanticKind !== 'curricularAtomic'
      || manifestDecision.resolutionDecision !== 'keep_current'
      || manifestDecision.evidenceRound !== selectedRound
      || !sameJson(manifestDecision.finalText, expectedFinalText)
      || manifestDecision.goalFingerprint !== resolutionBody.goal.goalFingerprint
      || manifestDecision.pageFingerprint !== resolutionBody.goal.pageFingerprint
      || manifestDecision.goalReviewContextFingerprint
        !== resolutionBody.goal.goalReviewContextFingerprint
      || manifestDecision.records.first.recordId !== first.record.recordId
      || manifestDecision.records.first.recordDigest !== first.digest
      || manifestDecision.records.second.recordId !== second.record.recordId
      || manifestDecision.records.second.recordDigest !== second.digest
      || resolutionBody.status !== 'resolved'
      || resolutionBody.decision !== 'keep_current'
      || resolutionBody.resolutionFingerprint !== resolution.resolutionFingerprint
      || resolutionBody.dualSummary?.digest !== digest(fixedSources.dualSummary)
      || resolutionBody.synthesisDecisionManifest?.contract
        !== synthesisManifest.synthesisContract
      || resolutionBody.synthesisDecisionManifest.manifestPath !== synthesisRelativePath
      || resolutionBody.synthesisDecisionManifest.manifestId !== synthesisManifest.manifestId
      || resolutionBody.synthesisDecisionManifest.manifestDigest
        !== digest(synthesisManifestBytes)
      || resolutionBody.synthesisDecisionManifest.manifestFingerprint !== manifestFingerprint
      || resolutionBody.synthesisDecisionManifest.decisionId !== manifestDecision.decisionId
      || resolutionBody.rounds?.first.runId !== expectedRoundARunId
      || resolutionBody.rounds.first.resultsDigest !== digest(fixedSources.roundARecords)
      || resolutionBody.rounds.first.recordId !== first.record.recordId
      || resolutionBody.rounds.first.recordDigest !== first.digest
      || resolutionBody.rounds?.second.runId !== expectedRoundBRunId
      || resolutionBody.rounds.second.resultsDigest !== digest(fixedSources.roundBRecords)
      || resolutionBody.rounds.second.recordId !== second.record.recordId
      || resolutionBody.rounds.second.recordDigest !== second.digest
      || !sameJson(resolutionBody.synthesis?.understandingEvidence, selected.record.understandingEvidence)
    ) {
      throw new Error(`${pin.goalId}: resolution body conflicts with current canonical or bound reviews`)
    }
    }

    const expectedSelectedEvidenceRounds = Object.fromEntries(
      goalIds.map((goalId) => [goalId, selectedRoundByGoalId.get(goalId)]),
    )
    const carryoverSourceHashes = {
      config: sourceHashes.config,
      batchManifest: sourceHashes.batchManifest,
      bookModel: sourceHashes.bookModel,
      bundleManifest: sourceHashes.bundleManifest,
      bundleReviewInput: sourceHashes.bundleReviewInput,
      bundleReviewInputJsonl: sourceHashes.bundleReviewInputJsonl,
      dualSummary: sourceHashes.dualSummary,
      adjudication: sourceHashes.adjudication,
      roundARecords: sourceHashes.roundARecords,
      roundARun: sourceHashes.roundARun,
      roundBRecords: sourceHashes.roundBRecords,
      roundBRun: sourceHashes.roundBRun,
    }
    const expectedCarryoverSourceBindings = [
      { role: 'config', path: sourceConfigPath, sha256: digest(fixedSources.config) },
      { role: 'batchManifest', path: batchManifestPath, sha256: digest(fixedSources.batchManifest) },
      { role: 'bookModel', path: bookModelPath, sha256: digest(fixedSources.bookModel) },
      { role: 'bundleManifest', path: bundleManifestPath, sha256: digest(fixedSources.bundleManifest) },
      { role: 'bundleReviewInput', path: bundleReviewInputPath, sha256: digest(fixedSources.bundleReviewInput) },
      { role: 'bundleReviewInputJsonl', path: bundleReviewInputJsonlPath, sha256: digest(fixedSources.bundleReviewInputJsonl) },
      { role: 'dualSummary', path: dualSummaryPath, sha256: digest(fixedSources.dualSummary) },
      { role: 'adjudication', path: adjudicationPath, sha256: digest(fixedSources.adjudication) },
      { role: 'roundARecords', path: roundARecordsPath, sha256: digest(fixedSources.roundARecords) },
      { role: 'roundARun', path: roundARunPath, sha256: digest(fixedSources.roundARun) },
      { role: 'roundBRecords', path: roundBRecordsPath, sha256: digest(fixedSources.roundBRecords) },
      { role: 'roundBRun', path: roundBRunPath, sha256: digest(fixedSources.roundBRun) },
      { role: 'semanticKindLedger', path: semanticKindLedgerPath, sha256: digest(semanticKindLedgerBytes) },
    ]
    const receiptContexts = compatibilityReceipt.currentCanonicalContexts ?? []
  if (
    receiptContexts.length !== goalIds.length
    || !sameOrdered(receiptContexts.map(({ goalId }) => goalId ?? ''), goalIds)
  ) {
    throw new Error('B020 compatibility receipt does not bind the exact ordered current contexts')
  }
  for (const [index, goalId] of goalIds.entries()) {
    const canonicalGoal = canonicalGoals.find(({ id }) => id === goalId)
    const receiptContext = receiptContexts[index]
    if (!canonicalGoal || !receiptContext) {
      throw new Error(`${goalId}: compatibility receipt current context is missing`)
    }
    const expectedCanonicalContext = buildGoalDescriptionCanonicalContext(canonicalGoal)
    if (
      !sameJson(receiptContext.canonicalContext, expectedCanonicalContext)
      || receiptContext.fingerprint !== digest(stableGoalBookJson(expectedCanonicalContext))
    ) {
      throw new Error(`${goalId}: compatibility receipt canonical context drifted`)
    }
  }
    const expectedSafeguards = {
      individualResolutionsFreshlyValidated: true,
      exactPostIntegrationCanonicalHashRequired: true,
      exactPostIntegrationGoalBookDigestRequired: true,
      semanticKindLedgerByteBoundAnd1174Total792CurricularAtomicValidated: true,
      goalBook919Equals792PagesPlus127ExcludedValidated: true,
      exactCurrentPageAndRelationContextsRequired: true,
      outputFilesMode0644Required: true,
      ownedDirectoriesAndWriteLockMode0700Required: true,
      outputsAreCrashSafeNoClobberOrExact: true,
      adjacentStagingAndPrivatePreparationRequired: true,
      followUpGoalsExcluded: true,
      preexistingOwnedGoalsExcluded: true,
      exactMixedRevisionDissentBound: true,
      positiveEvidenceValidatedSeparately: true,
      productOwnerEscalationRequired: false,
    }
  if (
    compatibilityReceipt.schemaVersion !== 1
    || compatibilityReceipt.receiptId
      !== 'mathematik-rollout-v1-batch-020-stable-current-carryover-11-v1-20260829'
    || compatibilityReceipt.sourceBatchId !== expectedBatchId
    || compatibilityReceipt.sourceCampaignGoalCount !== campaignGoalIds.length
    || !sameOrdered(compatibilityReceipt.claimedGoalIds ?? [], goalIds)
    || compatibilityReceipt.claimedGoalCount !== goalIds.length
    || !sameOrdered(compatibilityReceipt.followUpGoalIds ?? [], followUpGoalIds)
    || compatibilityReceipt.followUpGoalCount !== followUpGoalIds.length
    || !sameOrdered(
      compatibilityReceipt.preexistingOwnedGoalIds ?? [],
      preexistingOwnedGoalIds,
    )
    || compatibilityReceipt.preexistingOwnedGoalCount !== preexistingOwnedGoalIds.length
    || compatibilityReceipt.noWholeBatchProgressClaim !== true
    || !sameJson(compatibilityReceipt.selectedEvidenceRounds, expectedSelectedEvidenceRounds)
    || !sameJson(compatibilityReceipt.sourceBindings, expectedCarryoverSourceBindings)
    || compatibilityReceipt.currentCanonicalLandscape?.path !== canonicalPath
    || compatibilityReceipt.currentCanonicalLandscape.sha256 !== digest(canonicalBytes)
    || compatibilityReceipt.currentSemanticKindLedger?.path !== semanticKindLedgerPath
    || compatibilityReceipt.currentSemanticKindLedger.sha256 !== digest(semanticKindLedgerBytes)
    || compatibilityReceipt.currentSemanticKindLedger.totalGoalCount !== expectedCanonicalGoalCount
    || compatibilityReceipt.currentSemanticKindLedger.curriculumAtomicDenominator
      !== expectedCurriculumAtomicDenominator
    || compatibilityReceipt.currentGoalBook?.configPath
      !== 'app/scripts/config/goal-books/de-gym-math-national-atlas.json'
    || compatibilityReceipt.currentGoalBook.digest
      !== `sha256:${currentGoalBookSha256}`
    || compatibilityReceipt.currentGoalBook.currentB020SubsetDigest
      !== currentSubsetDigest
    || compatibilityReceipt.currentGoalBook.projectedAtomicGoalCount
      !== expectedProjectedAtomicGoalCount
    || compatibilityReceipt.currentGoalBook.curricularAtomicPageCount
      !== expectedCurriculumAtomicDenominator
    || compatibilityReceipt.currentGoalBook.excludedTargetAtomicGoalCount
      !== expectedExcludedTargetAtomicGoalCount
    || compatibilityReceipt.synthesisManifestPath !== synthesisRelativePath
    || compatibilityReceipt.synthesisManifestDigest !== digest(synthesisManifestBytes)
    || compatibilityReceipt.synthesisManifestFingerprint !== manifestFingerprint
    || compatibilityReceipt.resolutionIndexPath !== basename(resolutionIndexPath)
    || compatibilityReceipt.resolutionIndexDigest !== digest(resolutionIndexBytes)
    || compatibilityReceipt.resolutionIndexFormat !== 'legacy-schema-v1-partial-group'
    || !sameJson(compatibilityReceipt.safeguards, expectedSafeguards)
  ) {
    throw new Error('B020 compatibility receipt does not preserve the bounded stable-eleven contract')
  }
  const receiptBody = { ...compatibilityReceipt }
  delete receiptBody.materializationPlanSha256
  const reconstructedCarryoverPlanSha256 = sha256Hex(jsonBytes({
    materializationContract: 'math-b020-stable11-hardlink-no-clobber-v2',
    sourceHashes: carryoverSourceHashes,
    currentPostStateHashes: {
      canonical: actualCanonicalSha256,
      goalBook: currentGoalBookSha256,
      semanticKindLedger: actualSemanticKindLedgerSha256,
    },
    curriculumAuthority: {
      totalGoalCount: expectedCanonicalGoalCount,
      curricularAtomicGoalCount: expectedCurriculumAtomicDenominator,
      projectedAtomicGoalCount: expectedProjectedAtomicGoalCount,
      excludedTargetAtomicGoalCount: expectedExcludedTargetAtomicGoalCount,
    },
    modes: {
      outputFile: publishedFileMode,
      ownedDirectory: ownedDirectoryMode,
      writeLockDirectory: ownedDirectoryMode,
      privatePreparationDirectory: ownedDirectoryMode,
    },
    ownedDirectories: [
      { path: batchDirectory, mode: ownedDirectoryMode },
      { path: `${batchDirectory}/${resolutionDirectory}`, mode: ownedDirectoryMode },
    ],
    writeLock: {
      path: `${batchDirectory}/.${resolutionStem}.write-lock`,
      mode: ownedDirectoryMode,
    },
    sourceBatchId: expectedBatchId,
    stableGoalIds: goalIds,
    followUpGoalIds,
    preexistingOwnedGoalIds,
    synthesisManifest: {
      path: synthesisPath,
      sha256: plannedSynthesisManifestSha256,
      mode: publishedFileMode,
    },
    resolutionOutputs: resolutionFiles.map((resolution) => ({
      path: resolution.path,
      sha256: plannedResolutionHashes.get(resolution.goalId),
      mode: publishedFileMode,
    })),
    index: {
      path: resolutionIndexPath,
      sha256: plannedResolutionIndexSha256,
      mode: publishedFileMode,
    },
    receiptBody,
  }))
    if (
      compatibilityReceipt.materializationPlanSha256
        !== `sha256:${reconstructedCarryoverPlanSha256}`
      || reconstructedCarryoverPlanSha256 !== carryoverMaterializationPlanSha256
    ) {
      throw new Error('B020 compatibility receipt materialization plan cannot be reconstructed exactly')
    }
    assertOptionalPinMatches(
      'expectedCurrentContextDigests.carryoverMaterializationPlan',
      expectedCurrentContextDigests.carryoverMaterializationPlan,
      reconstructedCarryoverPlanSha256,
    )
    const reconstructedProducerPlanSha256 = sha256Hex(jsonBytes({
      materializationPlanSha256: reconstructedCarryoverPlanSha256,
      outputs: carryoverOutputs.map(({ path, sha256 }) => ({
        path,
        sha256,
        mode: publishedFileMode,
      })),
      stagingSuffix: '.b020-stable-eleven-staging',
      modes: {
        outputFile: publishedFileMode,
        ownedDirectory: ownedDirectoryMode,
      },
    }))
    if (reconstructedProducerPlanSha256 !== carryoverProducerPlanSha256) {
      throw new Error('B020 carryover-v2 outer producer plan cannot be reconstructed exactly')
    }
    verifiedCarryoverMaterializationPlanSha256 = reconstructedCarryoverPlanSha256
  } else if (writeMode || checkMode) {
    throw new Error(
      `B020 evidence mutation/check requires carryover sources exact-after; state=${carryoverMaterializationState}`,
    )
  }

  const candidates: CandidateSet['goals'] = goalIds.map((goalId) => {
    const selectedRound = selectedRoundByGoalId.get(goalId)
    const definition = profileDefinitions.get(goalId)
    const summary = dualSummary.goals?.find((goal) => goal.goalId === goalId)
    const adjudicationDecision = adjudication.decisions?.find((decision) => decision.goalId === goalId)
    const plannedResolutionSha256 = plannedResolutionHashes.get(goalId)
    const first = rounds.first.find(({ record }) => record.goalId === goalId)
    const second = rounds.second.find(({ record }) => record.goalId === goalId)
    if (
      !selectedRound
      || !definition
      || !summary
      || !plannedResolutionSha256
      || !adjudicationDecision
      || !first
      || !second
    ) {
      throw new Error(`${goalId}: missing stable evidence selection or bound authority source`)
    }
    const selected = selectedRound === 'first' ? first : second
    const alternateRound: ReviewRound = selectedRound === 'first' ? 'second' : 'first'
    const alternate = alternateRound === 'first' ? first : second
    const isMixedDissent = goalId === mixedDissentGoalId
    if (
      summary.agreement !== 'disagreement'
      || summary.firstRecordId !== first.record.recordId
      || summary.secondRecordId !== second.record.recordId
      || summary.firstRunId !== expectedRoundARunId
      || summary.secondRunId !== expectedRoundBRunId
      || summary.firstDecision !== 'keep'
      || summary.secondDecision !== (isMixedDissent ? 'revise' : 'keep')
      || summary.requiresSynthesis !== true
      || summary.automaticAcceptance !== false
      || adjudicationDecision.roundA?.recordId !== first.record.recordId
      || adjudicationDecision.roundA.decision !== 'keep'
      || adjudicationDecision.roundB?.recordId !== second.record.recordId
      || adjudicationDecision.roundB.decision !== (isMixedDissent ? 'revise' : 'keep')
      || adjudicationDecision.resolutionDecision !== (isMixedDissent
        ? 'keep_current_with_revision_dissent'
        : 'keep_current')
      || adjudicationDecision.evidenceRound !== selectedRound
      || adjudicationDecision.evidenceRecordId !== selected.record.recordId
      || adjudicationDecision.progressCounted !== false
    ) {
      throw new Error(`${goalId}: selected evidence conflicts with B020 dual-summary or adjudication authority`)
    }
    if (
      first.record.decision !== 'keep'
      || second.record.decision !== (isMixedDissent ? 'revise' : 'keep')
      || (isMixedDissent && (
        selectedRound !== 'second'
        || adjudicationDecision.revisionDissent?.rejectedRound !== 'second'
        || adjudicationDecision.revisionDissent.rejectedDecision !== 'revise'
        || adjudicationDecision.revisionDissent.disposition !== 'rejected_keep_current'
        || adjudicationDecision.revisionDissent.rejectedProposedDescriptionDe
          !== second.record.proposedDescriptionDe
        || adjudicationDecision.revisionDissent.rejectedProposedDescriptionEn
          !== second.record.proposedDescriptionEn
      ))
      || (!isMixedDissent && adjudicationDecision.revisionDissent)
    ) {
      throw new Error(`${goalId}: exact KEEP/KEEP or KEEP/REVISE source contract is invalid`)
    }
    for (const [label, bound] of [['selected', selected], ['alternate', alternate]] as const) {
      if (
        bound.record.evidenceProfileContract !== 'positive-understanding-evidence-v2'
        || bound.record.evidenceProfileRecommendation !== 'create'
        || bound.record.recordStatus !== 'candidate'
        || bound.record.reviewAuthority !== 'ai_candidate'
      ) {
        throw new Error(`${goalId}: ${label} review is not a positive-evidence V2 AI candidate`)
      }
    }
    if (
      definition.additionalExpectation.id === 'selected-blind-review-core'
      || definition.variationAxes.length !== 3
      || definition.applicationCaseBriefs.length !== definition.minimumIndependentDemonstrations
      || definition.minimumIndependentDemonstrations < 2
    ) {
      throw new Error(`${goalId}: profile must have one added expectation, three axes, and enough fresh cases`)
    }
    const reviewedCore = {
      id: 'selected-blind-review-core',
      essentialUnderstandingDe: selected.record.understandingEvidence.essentialUnderstandingDe,
      essentialUnderstandingEn: selected.record.understandingEvidence.essentialUnderstandingEn,
      observablePerformanceDe: selected.record.understandingEvidence.observablePerformanceDe,
      observablePerformanceEn: selected.record.understandingEvidence.observablePerformanceEn,
    }
    const expectations = [reviewedCore, definition.additionalExpectation]
    const profile: PositiveGoalEvidenceProfile = {
      archetype: definition.archetype,
      expectations,
      coverageExpectations: {
        requiredExpectationIds: expectations.map(({ id }) => id),
        alternativeExpectationGroups: [],
        minimumIndependentDemonstrations: definition.minimumIndependentDemonstrations,
        freshVariationRequired: true,
        independentTransferRequired: true,
      },
      variationAxes: definition.variationAxes,
      applicationCaseBriefs: definition.applicationCaseBriefs,
    }
    const selectedLabel = selectedRound === 'first' ? 'Round A' : 'Round B'
    const alternateLabel = alternateRound === 'first' ? 'Round A' : 'Round B'
    return {
      goalId,
      reason: `DE: ${definition.selectionReasonDe} Der Kernblock stammt bytegetreu aus ${selected.record.recordId}; die numerischen Anwendungsfälle sind neu und weder aus einem Lernzielbild noch aus einem vorhandenen Beispiel übernommen. EN: ${definition.selectionReasonEn} The core block is carried byte-for-byte from ${selected.record.recordId}; the numerical application cases are fresh and are not taken from a goal visualization or an existing example.`,
      evidenceLevel: 'E1',
      maximumClaimScope: 'G1',
      dissent: isMixedDissent
        ? [
            `B020 revision dissent remains bound: selected ${selectedLabel} record ${selected.record.recordId} (${selected.digest}) proposed DE “${selected.record.proposedDescriptionDe}” / EN “${selected.record.proposedDescriptionEn}”. Third subject adjudication (${digest(fixedSources.adjudication)}) and carryover-v2 resolution plan (sha256:${plannedResolutionSha256}) explicitly reject that replacement, retain the exact current canonical text, and select only its positive-understanding evidence; ${alternateLabel} KEEP record ${alternate.record.recordId} (${alternate.digest}) remains bound.`,
          ]
        : [
            `B020 evidence-formulation dissent remains bound: selected ${selectedLabel} record ${selected.record.recordId} (${selected.digest}); compatible ${alternateLabel} record ${alternate.record.recordId} (${alternate.digest}) remains preserved by the dual-summary, third adjudication (${digest(fixedSources.adjudication)}), and carryover-v2 resolution plan (sha256:${plannedResolutionSha256}).`,
          ],
      profile,
    }
  })

  if (candidates.some(({ goalId }) => (
    followUpGoalIds.includes(goalId as typeof followUpGoalIds[number])
    || preexistingOwnedGoalIds.includes(goalId as typeof preexistingOwnedGoalIds[number])
  ))) {
    throw new Error('B020 stable-eleven evidence candidates must not claim a follow-up or preexisting goal')
  }
  const config: PositiveGoalEvidenceReviewConfig = {
    $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
    schemaVersion: 2,
    reviewId: targetReviewId,
    goalFingerprintRuleVersion: 'goal-evidence-v1',
    profileRuleVersion: 'positive-understanding-evidence-v2',
    landscapeId,
    landscapePath: canonicalPath,
    semanticKindLedgerPath,
    reviewCriteriaPath: criteriaPath,
    reviewPath,
    reviewRunManifestPaths: [],
    reviewedResourceTypes: [],
    requireApproved: false,
    scope: {
      label: 'Canonical Mathematics positive understanding-evidence rollout v1 batch 020: eleven new stable Q2 lines-and-planes goals',
      goalIds: [...goalIds],
    },
  }
  const candidateSet: CandidateSet = {
    schemaVersion: 1,
    authoringContract: 'positive-understanding-evidence-candidates-v1',
    reviewId: targetReviewId,
    reviewedAt,
    reviewer,
    sourceBindings: {
      bindingContract: 'math-b020-stable11-positive-evidence-sources-v1',
      batchId: expectedBatchId,
      campaignGoalIds,
      stableGoalIds: goalIds,
      followUpGoalIds,
      preexistingOwnedGoalIds,
      sources: [
        ...fixedSourceSpecifications.map(({ role, path, sha256 }) => ({
          role,
          path,
          sha256: `sha256:${sha256}` as `sha256:${string}`,
        })),
        {
          role: 'math_b020_stable11_carryover_v2_materializer',
          path: carryoverMaterializerPath,
          sha256: `sha256:${actualCarryoverMaterializerSha256}` as `sha256:${string}`,
        },
        {
          role: 'post_b020_current_canonical_math',
          path: canonicalPath,
          sha256: digest(canonicalBytes),
        },
        {
          role: 'post_b020_current_math_semantic_kind_ledger',
          path: semanticKindLedgerPath,
          sha256: digest(semanticKindLedgerBytes),
        },
        {
          role: 'math_b020_stable11_synthesis_manifest',
          path: synthesisPath,
          sha256: `sha256:${plannedSynthesisManifestSha256}` as `sha256:${string}`,
        },
        {
          role: 'math_b020_stable11_compatibility_receipt',
          path: compatibilityReceiptPath,
          sha256: `sha256:${plannedCompatibilityReceiptSha256}` as `sha256:${string}`,
        },
        {
          role: 'math_b020_stable11_resolution_index',
          path: resolutionIndexPath,
          sha256: `sha256:${plannedResolutionIndexSha256}` as `sha256:${string}`,
        },
      ],
      resolutionFiles: boundResolutionFiles,
    },
    goals: candidates,
  }
  const reviewRecords = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet })
  if (
    reviewRecords.length !== goalIds.length
    || !sameOrdered(reviewRecords.map(({ goalId }) => goalId), goalIds)
    || reviewRecords.some(({ status, reviewAuthority, evidenceLevel, maximumClaimScope }) => (
      status !== 'needs_human_review'
      || reviewAuthority !== 'ai_candidate'
      || evidenceLevel !== 'E1'
      || maximumClaimScope !== 'G1'
    ))
  ) {
    throw new Error('Generic candidate materializer did not return eleven E1/G1 AI review candidates')
  }
  const outputs: PlannedOutput[] = [
    { path: configPath, bytes: jsonBytes(config), mode: publishedFileMode },
    { path: candidatesPath, bytes: jsonBytes(candidateSet), mode: publishedFileMode },
    {
      path: reviewPath,
      bytes: Buffer.from(`${reviewRecords.map((record) => JSON.stringify(record)).join('\n')}\n`),
      mode: publishedFileMode,
    },
  ]
  const planSha256 = sha256Hex(jsonBytes({
    materializationContract: 'math-b020-stable11-positive-evidence-hardlink-no-clobber-v2',
    actualSourceBindings: candidateSet.sourceBindings.sources,
    currentContextDigests: {
      goalBook: currentGoalBookSha256,
      subset: currentSubsetDigest.replace(/^sha256:/u, ''),
      carryoverProducerPlan: carryoverProducerPlanSha256,
      carryoverMaterializationPlan: verifiedCarryoverMaterializationPlanSha256,
    },
    resolutionFiles: boundResolutionFiles,
    campaignGoalIds,
    stableGoalIds: goalIds,
    followUpGoalIds,
    preexistingOwnedGoalIds,
    modes: {
      outputFile: publishedFileMode,
      privatePreparationDirectory: ownedDirectoryMode,
      writeLockDirectory: ownedDirectoryMode,
    },
    writeLock: { path: writeLockPath, mode: ownedDirectoryMode },
    stagingSuffix,
    outputs: outputs.map(({ path, bytes, mode }) => ({ path, sha256: sha256Hex(bytes), mode })),
  }))
  if (expectedPlanSha256 !== 'PENDING' && planSha256 !== expectedPlanSha256) {
    throw new Error(`B020 stable-eleven evidence plan drift: ${planSha256} != ${expectedPlanSha256}`)
  }
  return {
    outputs,
    planSha256,
    carryoverProducerPlanSha256,
    carryoverMaterializationState,
    currentPins: {
      carryoverMaterializer: actualCarryoverMaterializerSha256,
      canonical: actualCanonicalSha256,
      semanticKindLedger: actualSemanticKindLedgerSha256,
      goalBook: currentGoalBookSha256,
      subset: currentSubsetDigest.replace(/^sha256:/u, ''),
      carryoverMaterializationPlan: verifiedCarryoverMaterializationPlanSha256,
      synthesisManifest: plannedSynthesisManifestSha256,
      compatibilityReceipt: plannedCompatibilityReceiptSha256,
      resolutionIndex: plannedResolutionIndexSha256,
      resolutions: Object.fromEntries(plannedResolutionHashes),
    },
  }
}

const exactMode = (mode: number): number => mode & 0o7777
const assertMode = (actual: number, expected: number, role: string): void => {
  const actualMode = exactMode(actual)
  if (actualMode !== expected) {
    throw new Error(
      `${role} mode drift: ${actualMode.toString(8).padStart(4, '0')} `
      + `!= ${expected.toString(8).padStart(4, '0')}`,
    )
  }
}

const classifyExpectedFile = <ExactState extends string>({
  path,
  bytes,
  mode,
  exactState,
  role,
}: PlannedOutput & {
  exactState: ExactState
  role: 'target' | 'staging' | 'preparation'
}): 'absent' | ExactState => {
  const candidate = absolute(path)
  let stat
  try {
    stat = lstatSync(candidate)
  } catch (error) {
    if (hasErrorCode(error, 'ENOENT')) return 'absent'
    throw error
  }
  assertRealParentChain(path, `B020 stable-eleven evidence ${role}`)
  if (!stat.isFile()) throw new Error(`B020 evidence ${role} has unknown non-file state: ${path}`)
  assertMode(stat.mode, mode, `B020 stable-eleven evidence ${role} ${path}`)
  const actualSha256 = sha256Hex(readFileSync(candidate))
  const expectedSha256 = sha256Hex(bytes)
  if (actualSha256 !== expectedSha256) {
    throw new Error(
      `B020 evidence ${role} has unknown bytes: ${path}: ${actualSha256} != ${expectedSha256}`,
    )
  }
  return exactState
}

const classifyOutput = (output: PlannedOutput): ClassifiedOutput => ({
  ...output,
  targetState: classifyExpectedFile({
    ...output,
    exactState: 'exact-after',
    role: 'target',
  }),
  stagingState: classifyExpectedFile({
    ...output,
    path: stagingPath(output.path),
    exactState: 'exact-staged',
    role: 'staging',
  }),
})

const assertWriteLockAbsent = (): void => {
  try {
    lstatSync(absolute(writeLockPath))
  } catch (error) {
    if (hasErrorCode(error, 'ENOENT')) return
    throw error
  }
  throw new Error(`B020 evidence write lock exists at ${writeLockPath}; inspect it as stale crash residue`)
}

const assertOwnedDirectory = (path: string, role: string): void => {
  const candidate = absolute(path)
  assertRealDirectory(candidate, role)
  assertMode(lstatSync(candidate).mode, ownedDirectoryMode, role)
}

const assertWriteLockHeld = (): void => {
  assertOwnedDirectory(writeLockPath, 'B020 stable-eleven evidence write lock')
}

const acquireWriteLock = (): void => {
  assertRealParentChain(writeLockPath, 'B020 evidence write lock')
  assertWriteLockAbsent()
  try {
    mkdirSync(absolute(writeLockPath), { mode: ownedDirectoryMode })
    chmodSync(absolute(writeLockPath), ownedDirectoryMode)
  } catch (error) {
    if (hasErrorCode(error, 'EEXIST')) assertWriteLockAbsent()
    throw error
  }
  assertWriteLockHeld()
}

const releaseWriteLock = (): void => {
  assertWriteLockHeld()
  const lock = absolute(writeLockPath)
  if (readdirSync(lock).length !== 0) {
    throw new Error(`B020 evidence write lock contains unknown residue: ${writeLockPath}`)
  }
  rmdirSync(lock)
  assertWriteLockAbsent()
}

const runFreezeCheck = (): void => {
  execFileSync('node', ['scripts/check_openai_plugin_review_freeze.mjs'], {
    cwd: repositoryRoot,
    stdio: 'inherit',
  })
}

const runGenericValidators = (): void => {
  const appRoot = resolve(repositoryRoot, 'app')
  execFileSync('npx', [
    'tsx',
    'scripts/materializePositiveGoalEvidenceCandidates.ts',
    '--config',
    configPath,
    '--candidates',
    candidatesPath,
  ], { cwd: appRoot, stdio: 'inherit' })
  execFileSync('npx', [
    'tsx',
    'scripts/positiveGoalEvidenceReview.ts',
    `--config=${configPath}`,
    '--mode=check',
  ], { cwd: appRoot, stdio: 'inherit' })
}

const assertSamePlan = (left: BuiltPlan, right: BuiltPlan, role: string): void => {
  if (
    left.planSha256 !== right.planSha256
    || left.carryoverProducerPlanSha256 !== right.carryoverProducerPlanSha256
    || left.carryoverMaterializationState !== right.carryoverMaterializationState
    || !sameJson(left.currentPins, right.currentPins)
    || left.outputs.length !== right.outputs.length
    || left.outputs.some((output, index) => (
      output.path !== right.outputs[index].path
      || output.mode !== right.outputs[index].mode
      || !output.bytes.equals(right.outputs[index].bytes)
    ))
  ) {
    throw new Error(`${role}: B020 evidence inputs or deterministic output plan drifted`)
  }
}

const main = async (): Promise<void> => {
  if (writeMode || checkMode) assertMutationPinsBound()
  assertWriteLockAbsent()
  const initialPlan = await buildPlan()
  if (expectedPlanSha256 !== 'PENDING' && initialPlan.planSha256 !== expectedPlanSha256) {
    throw new Error(`B020 stable-eleven evidence plan drift: ${initialPlan.planSha256} != ${expectedPlanSha256}`)
  }

  const classifyMaterialization = (privateResidueCount = 0): ClassifiedMaterialization => {
    const outputs = initialPlan.outputs.map(classifyOutput)
    const exactAfterTargetCount = outputs
      .filter(({ targetState }) => targetState === 'exact-after').length
    const exactStagedCount = outputs
      .filter(({ stagingState }) => stagingState === 'exact-staged').length
    const absentTargetCount = outputs.length - exactAfterTargetCount
    const absentStagingCount = outputs.length - exactStagedCount
    const state: MaterializationState = privateResidueCount > 0
      ? 'resumable-mixed'
      : exactAfterTargetCount === 0 && exactStagedCount === 0
        ? 'exact-before'
        : exactAfterTargetCount === outputs.length && exactStagedCount === 0
          ? 'exact-after'
          : 'resumable-mixed'
    return {
      state,
      outputs,
      absentTargetCount,
      exactAfterTargetCount,
      absentStagingCount,
      exactStagedCount,
    }
  }
  const plannedOutputSha256 = new Map(
    initialPlan.outputs.map(({ path, bytes }) => [path, sha256Hex(bytes)]),
  )
  const privateWorkTag = '.b020-stable11-evidence-prepare-'
  const privatePayloadName = 'prepared-output'
  const privateWorkPrefix = (output: PlannedOutput): string => {
    const outputSha256 = plannedOutputSha256.get(output.path)
    if (!outputSha256) throw new Error(`${output.path}: missing B020 evidence output SHA-256`)
    const pathKey = sha256Hex(Buffer.from(output.path)).slice(0, 16)
    return `${privateWorkTag}${pathKey}-${outputSha256}-`
  }
  const outputParent = absolute(artifactRoot)
  const expectedStagingPaths = new Set(
    initialPlan.outputs.map(({ path }) => absolute(stagingPath(path))),
  )
  const inspectPrivateResidues = (): Array<{
    directory: string
    output: PlannedOutput
    payload: string | null
  }> => {
    assertRealDirectory(outputParent, 'B020 evidence shared output parent')
    const definitions = initialPlan.outputs.map((output) => ({
      output,
      prefix: privateWorkPrefix(output),
    }))
    const residues: Array<{
      directory: string
      output: PlannedOutput
      payload: string | null
    }> = []
    const entries: Dirent[] = readdirSync(outputParent, { encoding: 'utf8', withFileTypes: true })
    for (const entry of entries) {
      const entryPath = resolve(outputParent, entry.name)
      if (entry.name.endsWith(stagingSuffix) && !expectedStagingPaths.has(entryPath)) {
        throw new Error(`Unknown adjacent B020 evidence staging path: ${entryPath}`)
      }
      if (!entry.name.startsWith(privateWorkTag)) continue
      const matches = definitions.filter(({ prefix }) => entry.name.startsWith(prefix))
      if (matches.length !== 1 || !entry.isDirectory()) {
        throw new Error(`Unknown B020 evidence private preparation entry: ${entryPath}`)
      }
      assertOwnedDirectory(entryPath, 'B020 evidence private preparation directory')
      const definition = matches[0]
      const privateEntries = readdirSync(entryPath, { encoding: 'utf8', withFileTypes: true })
      if (privateEntries.length === 0) {
        residues.push({ directory: entryPath, output: definition.output, payload: null })
        continue
      }
      if (
        privateEntries.length !== 1
        || privateEntries[0].name !== privatePayloadName
        || !privateEntries[0].isFile()
      ) throw new Error(`Unknown B020 evidence private preparation contents: ${entryPath}`)
      const payload = resolve(entryPath, privatePayloadName)
      const state = classifyExpectedFile({
        ...definition.output,
        path: payload,
        exactState: 'exact-private',
        role: 'preparation',
      })
      if (state !== 'exact-private') throw new Error(`${definition.output.path}: private payload is absent`)
      residues.push({ directory: entryPath, output: definition.output, payload })
    }
    return residues
  }
  const recoverPrivateResidues = (residues: ReturnType<typeof inspectPrivateResidues>): void => {
    assertWriteLockHeld()
    for (const residue of residues) {
      assertOwnedDirectory(residue.directory, 'B020 evidence private preparation recovery directory')
      if (residue.payload) {
        const state = classifyExpectedFile({
          ...residue.output,
          path: residue.payload,
          exactState: 'exact-private',
          role: 'preparation',
        })
        if (state !== 'exact-private') throw new Error(`${residue.output.path}: private payload drifted`)
        unlinkSync(residue.payload)
      }
      if (readdirSync(residue.directory).length !== 0) {
        throw new Error(`${residue.output.path}: private recovery directory is not empty`)
      }
      rmdirSync(residue.directory)
    }
    if (inspectPrivateResidues().length !== 0) {
      throw new Error('B020 evidence private residue recovery did not converge to zero')
    }
  }
  const assertCurrentInputsAndPlan = async (role: string): Promise<void> => {
    assertWriteLockHeld()
    const rebound = await buildPlan()
    assertSamePlan(initialPlan, rebound, role)
    if (expectedPlanSha256 === 'PENDING' || rebound.planSha256 !== expectedPlanSha256) {
      throw new Error(`${role}: B020 evidence expected plan pin is absent or drifted`)
    }
  }
  const privateWorkDirectory = (output: PlannedOutput): string => {
    assertWriteLockHeld()
    assertRealDirectory(outputParent, 'B020 evidence shared output parent')
    const nonce = randomBytes(16).toString('hex')
    const directory = mkdtempSync(resolve(
      outputParent,
      `${privateWorkPrefix(output)}${process.pid}-${nonce}-`,
    ))
    chmodSync(directory, ownedDirectoryMode)
    assertOwnedDirectory(directory, 'new B020 evidence private preparation directory')
    return directory
  }
  const unlinkPrivateExactFile = (
    output: PlannedOutput,
    preparation: string,
    directory: string,
  ): void => {
    assertWriteLockHeld()
    assertOwnedDirectory(directory, 'B020 evidence private preparation directory')
    const state = classifyExpectedFile({
      ...output,
      path: preparation,
      exactState: 'exact-private',
      role: 'preparation',
    })
    if (state !== 'exact-private') throw new Error(`${output.path}: refusing missing private payload unlink`)
    unlinkSync(preparation)
    if (readdirSync(directory).length !== 0) {
      throw new Error(`${output.path}: private preparation directory is not empty after payload unlink`)
    }
    rmdirSync(directory)
  }
  const createExactAdjacentStaging = (output: PlannedOutput): void => {
    assertWriteLockHeld()
    const directory = privateWorkDirectory(output)
    const preparation = resolve(directory, privatePayloadName)
    writeFileSync(preparation, output.bytes, { flag: 'wx', mode: output.mode })
    chmodSync(preparation, output.mode)
    const prepared = classifyExpectedFile({
      ...output,
      path: preparation,
      exactState: 'exact-prepared',
      role: 'preparation',
    })
    if (prepared !== 'exact-prepared') throw new Error(`${output.path}: private preparation is not exact`)
    const staging = absolute(stagingPath(output.path))
    try {
      linkSync(preparation, staging)
    } catch (error) {
      const raced = classifyExpectedFile({
        ...output,
        path: stagingPath(output.path),
        exactState: 'exact-staged',
        role: 'staging',
      })
      if (raced !== 'exact-staged') throw error
    }
    const staged = classifyExpectedFile({
      ...output,
      path: stagingPath(output.path),
      exactState: 'exact-staged',
      role: 'staging',
    })
    if (staged !== 'exact-staged') throw new Error(`${output.path}: adjacent staging is not exact`)
    unlinkPrivateExactFile(output, preparation, directory)
  }
  const unlinkExactStaging = (output: PlannedOutput): void => {
    assertWriteLockHeld()
    const state = classifyExpectedFile({
      ...output,
      path: stagingPath(output.path),
      exactState: 'exact-staged',
      role: 'staging',
    })
    if (state !== 'exact-staged') throw new Error(`${output.path}: refusing absent staging unlink`)
    unlinkSync(absolute(stagingPath(output.path)))
  }
  const stageEveryMissingOutput = (): void => {
    assertWriteLockHeld()
    for (const output of initialPlan.outputs) {
      let state = classifyOutput(output)
      if (state.targetState === 'exact-after') continue
      if (state.stagingState === 'absent') createExactAdjacentStaging(output)
      state = classifyOutput(output)
      if (state.targetState === 'absent' && state.stagingState !== 'exact-staged') {
        throw new Error(`${output.path}: missing evidence target is not exact-staged`)
      }
    }
    const state = classifyMaterialization()
    if (state.outputs.some(({ targetState, stagingState }) => (
      targetState === 'absent' && stagingState === 'absent'
    ))) throw new Error('B020 evidence full staging left an unstaged output')
  }
  const publishNoClobber = (output: PlannedOutput): void => {
    assertWriteLockHeld()
    let state = classifyOutput(output)
    if (state.targetState === 'absent') {
      if (state.stagingState !== 'exact-staged') {
        throw new Error(`${output.path}: refusing evidence publish without exact staging`)
      }
      try {
        linkSync(absolute(stagingPath(output.path)), absolute(output.path))
      } catch (error) {
        state = classifyOutput(output)
        if (state.targetState !== 'exact-after') throw error
      }
    }
    state = classifyOutput(output)
    if (state.targetState !== 'exact-after') {
      throw new Error(`${output.path}: no-clobber evidence publish did not reach exact-after`)
    }
    if (state.stagingState === 'exact-staged') unlinkExactStaging(output)
    state = classifyOutput(output)
    if (state.targetState !== 'exact-after' || state.stagingState !== 'absent') {
      throw new Error(`${output.path}: evidence target or staging cleanup drifted`)
    }
  }

  let privateResidues = inspectPrivateResidues()
  let materialization = classifyMaterialization(privateResidues.length)
  if (checkMode && (privateResidues.length !== 0 || materialization.state !== 'exact-after')) {
    throw new Error(
      'B020 evidence --check requires exact-after, zero staging, and zero private residue; '
      + `state=${materialization.state} targets=${materialization.exactAfterTargetCount}`
      + `/${initialPlan.outputs.length} staged=${materialization.exactStagedCount} `
      + `private=${privateResidues.length}`,
    )
  }
  if (writeMode) {
    runFreezeCheck()
    acquireWriteLock()
    try {
      privateResidues = inspectPrivateResidues()
      recoverPrivateResidues(privateResidues)
      privateResidues = []
      await assertCurrentInputsAndPlan('Immediate pre-staging rebind')
      stageEveryMissingOutput()
      privateResidues = inspectPrivateResidues()
      if (privateResidues.length !== 0) {
        throw new Error(`B020 evidence staging left ${privateResidues.length} private residue(s)`)
      }
      await assertCurrentInputsAndPlan('Immediate pre-publish rebind')
      for (const output of initialPlan.outputs) publishNoClobber(output)
      await assertCurrentInputsAndPlan('Post-publish rebind')
      materialization = classifyMaterialization(inspectPrivateResidues().length)
      if (materialization.state !== 'exact-after') {
        throw new Error(`B020 evidence post-write state is ${materialization.state}`)
      }
      assertWriteLockHeld()
    } finally {
      releaseWriteLock()
    }
    assertWriteLockAbsent()
    runFreezeCheck()
  }

  privateResidues = inspectPrivateResidues()
  materialization = classifyMaterialization(privateResidues.length)
  if ((writeMode || checkMode) && materialization.state === 'exact-after') runGenericValidators()
  assertWriteLockAbsent()
  console.log(JSON.stringify({
    mode: writeMode ? 'WRITE' : checkMode ? 'CHECK' : 'PLAN',
    status: expectedPlanSha256 === 'PENDING' ? 'PENDING_BINDING' : 'BOUND',
    expectedPlanSha256,
    computedPlanSha256: initialPlan.planSha256,
    reviewId: targetReviewId,
    campaignGoalCount: campaignGoalIds.length,
    stableGoalIds: goalIds,
    followUpGoalIds,
    preexistingOwnedGoalIds,
    carryoverProducerPlanSha256: initialPlan.carryoverProducerPlanSha256,
    carryoverMaterializationState: initialPlan.carryoverMaterializationState,
    currentPins: initialPlan.currentPins,
    reviewedResourceTypes: [],
    outputCount: initialPlan.outputs.length,
    outputFileMode: publishedFileMode.toString(8).padStart(4, '0'),
    ownedPrivateDirectoryAndWriteLockMode: ownedDirectoryMode.toString(8).padStart(4, '0'),
    materializationState: materialization.state,
    stagingState: {
      exactAfterTargets: materialization.exactAfterTargetCount,
      absentTargets: materialization.absentTargetCount,
      exactStaged: materialization.exactStagedCount,
      absentStaging: materialization.absentStagingCount,
      privateResidues: privateResidues.length,
    },
    outputs: materialization.outputs.map((output) => ({
      path: output.path,
      sha256: sha256Hex(output.bytes),
      mode: output.mode.toString(8).padStart(4, '0'),
      targetState: output.targetState,
      stagingState: output.stagingState,
    })),
  }, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
