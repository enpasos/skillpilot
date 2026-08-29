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
import {
  loadGoalBookBuildInputs,
  stableGoalBookJson,
} from './goalBookModel'
import { buildGoalDescriptionRolloutSubsetModel } from './materializeGoalDescriptionRolloutBatch'
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
    bindingContract: 'math-b019-stable7-positive-evidence-sources-v1'
    batchId: string
    campaignGoalIds: readonly string[]
    stableGoalIds: readonly string[]
    followUpGoalIds: readonly string[]
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
  requiredFollowUpGoalIds?: string[]
  decisions?: Array<{
    goalId?: string
    roundA?: { recordId?: string; decision?: string }
    roundB?: { recordId?: string; decision?: string }
    resolutionDecision?: string
    evidenceRound?: ReviewRound
    evidenceRecordId?: string
    progressCounted?: boolean
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
    currentB019SubsetDigest?: string
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
const batchName = 'batch-019-q2-lines-planes-current-19-v1'
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
  'mathematik-rollout-v1-batch-019-q2-lines-planes-current-19-v1-20260829-first-pass'
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

const resolutionStem = 'stable-current-carryover-7-v1'
const synthesisRelativePath = `synthesis-decisions.${resolutionStem}.json`
const synthesisPath = `${batchDirectory}/${synthesisRelativePath}`
const resolutionDirectory = `resolutions-${resolutionStem}`
const resolutionIndexPath = `${batchDirectory}/resolution-index.${resolutionStem}.json`
const compatibilityReceiptPath = `${batchDirectory}/${resolutionStem}.compatibility-receipt.json`
const carryoverMaterializerPath = 'app/scripts/materializeMathB019Stable7CarryoverResolutions.ts'

const artifactStem = (
  'canonical-math-positive-understanding-evidence-rollout-v1-'
  + 'batch-019-q2-lines-planes-stable7-current-v1'
)
const artifactRoot = 'curricula/DE/Gymnasium/quality/goal-evidence'
const configPath = `${artifactRoot}/${artifactStem}.config.json`
const candidatesPath = `${artifactRoot}/${artifactStem}.candidates.json`
const reviewPath = `${artifactRoot}/${artifactStem}.review.jsonl`
const targetReviewId = 'canonical-math-positive-evidence-v1-b019-q2-lines-planes-stable7-v1'
const reviewedAt = '2026-08-29T05:20:00.000Z'
const reviewer = 'codex-math-b019-stable7-positive-evidence-candidate-2026-08-29'
const expectedBatchId = 'mathematik-rollout-v1-batch-019-q2-lines-planes-current-19-v1-20260829'
const expectedRoundARunId = 'mathematik-rollout-v1-b019-q2-lines-planes-20260829-openai-codex-gpt5-a'
const expectedRoundBRunId = 'mathematik-b019-q2-round-b-blind-codex-gpt5-20260829t020234z'
const landscapeId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'

const sourceHashes = {
  config: 'ed260ede97a458dddb272fc514965a9616facd392c760f9265272ffc6646474a',
  batchManifest: '5a28c4f03b46945522b9e4a82ba293bf073daafe4c5e738888f66bebb5bb5ddc',
  bookModel: '66f567693ca1ed325c2cd1255dc3666ce7aa4a228174a843ef75fb8611bbffae',
  bundleManifest: 'ca2ab91450f28155e45493af1ec132098fd5f76b34c33d380ccd36936924dbec',
  bundleReviewInput: '660b45ea2cbebccd209d29efef05ad17b8ea6e848d0bac272eb023b4b40bb60c',
  bundleReviewInputJsonl: '07366a5e635ce44f5cc7bf4ec643102884a8bcf8855ac0ca733cf316b7bfc38f',
  dualSummary: 'f4b4bfad37a85df8afe80af677030963b458a4a60e73398785df2bcd46958f9c',
  adjudication: '2992aa3172ed3f68adc8bd5c8ff82bb9dce4811c81cc8052e5553e61625dae20',
  roundARecords: '7b45073fa8b1b7e3d92402fb9b5fe7403762911372b0b75bc95a0cb32b814bdf',
  roundARun: 'be7f264eca73eed2b1da25b0d9547d036f5d77c97c8f17ddd044fb094bce2d37',
  roundBRecords: '44ee9f7cc550c94432e8cd32c488eb7b30f548c70df648bcf0a8a26788692014',
  roundBRun: '274d45cd3491aca659c3057b61ac0a8b00ce2de7c634b0fe055fc0b0a0e93c7a',
  carryoverMaterializer: '9b22bb7ffa1d204d17564ec73c2ed70fc402fe064d1cad44aada4c457ff4e0d4',
  canonical: '228a15eac60ec00257f25d021c1fa3ef93b873257e220b05d5756a878169f9d0',
  semanticKindLedger: '87d8ed2cd0a0712303caee5bbcb24ca55211f24a20536cbc2d5eb7d002a5abd9',
  criteria: '12063457ee847a35af2b29f203ff7dbc9a383f91cf4fafc3a5162015d73a4816',
  synthesisManifest: '04d2a7ca780a7b0e6e4f3356ee0307bf205aea74a853e4bb11a93e14c473b46e',
  compatibilityReceipt: '2ee9156eed56964721490558b94ff5c06510749c59ff68988df8fde826c56ae9',
  resolutionIndex: '4fb248090eff84688d7f2cfaceab4bec8c58b20f908f904d31482851cedd7341',
} as const

const expectedCurrentContextDigests = {
  goalBook: '2c09186739825ba3c9c463d64eced1992206602f67b21b96b3a9239480a1b17f',
  subset: 'b8d03b763ed50d736cc42121853bf03f52a6eea0f01cffcfc6b350ec16a1a6ff',
} as const
const historicalCarryoverPins = {
  canonical: 'b0b9e06c17430e98748d69533091ff14cfb0fa7d1946a21d8ca698f61cb1af7c',
  semanticKindLedger: '674fcbe3b671abdc02a48f63d57c90df7a04146303d13d9139477d4671092e5c',
  goalBook: '7697a5410dc1fad6b8eff2a462d7739fb409530f2197ce9e4030a7d7049b275f',
  subset: 'd2ab9b5151ce2a77aa3fa8d3d6b86e7e6ef8c59ec1f13c96776114dad649161f',
  producerPlan: '3ecd1f0ac6e2dd28196dd54963fdd9234b70ac449c34bb17334dbb0e6b986425',
  materializationPlan: 'bcc34111729a213400d5f536ff802df6d45e5a4364aa5a94d818df121e2ab5f1',
} as const
const expectedPlanSha256 = '53ee613416f961afc1f48b21f2737fb367b7811ff1c2544a915224a8f2609335'
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
  '36e0de23-1e3b-5c69-888f-e5e19e79cbbe',
  'd76766a5-ce07-5c7a-987b-157f2998b05e',
  'ce491ec0-c558-5872-86fd-289e60a38403',
  'ea4bd128-17ab-5a8b-ae98-29552d774fb0',
  'f613634b-39fb-5021-9970-790ef34c9932',
  '06de364f-9b63-4044-8229-a975621dc6df',
  '27cfa1b3-be6f-5f81-b9a2-ae3bad9c14b6',
  '436532fe-cee6-5a13-a4be-05522435937b',
  '7aa1abee-d6ec-528a-b110-f2260b0cda51',
  'a9fde754-51b4-58d7-85e5-5e36160581e6',
  'edaf0bb4-e12e-5a6c-b484-91124ba209f3',
  'fd4b7145-5c28-5b33-bf2e-0ca68f29f2fc',
] as const
const goalIds = [
  '36e0de23-1e3b-5c69-888f-e5e19e79cbbe',
  'd76766a5-ce07-5c7a-987b-157f2998b05e',
  '27cfa1b3-be6f-5f81-b9a2-ae3bad9c14b6',
  '7aa1abee-d6ec-528a-b110-f2260b0cda51',
  'a9fde754-51b4-58d7-85e5-5e36160581e6',
  'edaf0bb4-e12e-5a6c-b484-91124ba209f3',
  'fd4b7145-5c28-5b33-bf2e-0ca68f29f2fc',
] as const
const followUpGoalIds = [
  'effe43eb-cabe-56cb-a228-35887d7915c1',
  '525b1da9-7fdd-4a70-9f30-ff01d7511b04',
  'd785943c-d61b-51a1-a9c2-c36a9e0cc97d',
  'ec6447d1-97da-5b77-94ae-4973b43f094e',
  '66a96282-340d-5220-91a6-cc97e2ec2220',
  '9cc650e0-100d-5ae1-a83b-2b854ab7c5c8',
  'fa02cf14-0411-4fe3-8be7-a62c69743e26',
  'ea4bd128-17ab-5a8b-ae98-29552d774fb0',
  'f613634b-39fb-5021-9970-790ef34c9932',
  '06de364f-9b63-4044-8229-a975621dc6df',
  'ce491ec0-c558-5872-86fd-289e60a38403',
  '436532fe-cee6-5a13-a4be-05522435937b',
] as const

const selectedRoundByGoalId = new Map<string, ReviewRound>([
  ['36e0de23-1e3b-5c69-888f-e5e19e79cbbe', 'second'],
  ['d76766a5-ce07-5c7a-987b-157f2998b05e', 'second'],
  ['27cfa1b3-be6f-5f81-b9a2-ae3bad9c14b6', 'second'],
  ['7aa1abee-d6ec-528a-b110-f2260b0cda51', 'second'],
  ['a9fde754-51b4-58d7-85e5-5e36160581e6', 'first'],
  ['edaf0bb4-e12e-5a6c-b484-91124ba209f3', 'first'],
  ['fd4b7145-5c28-5b33-bf2e-0ca68f29f2fc', 'second'],
])

const resolutionFiles = goalIds.map((goalId) => ({
  goalId,
  path: `${batchDirectory}/${resolutionDirectory}/${goalId}.resolution.json`,
  sha256: ({
    '36e0de23-1e3b-5c69-888f-e5e19e79cbbe': '39fe0732a1a4e14b3cc4cf884d9acff3be3e53ccd6d823c46abadb3e5f398daf',
    'd76766a5-ce07-5c7a-987b-157f2998b05e': '8153135fc7febfcca0f6ebd7a04b90283cb59835b2ec152475528b4cf958c549',
    '27cfa1b3-be6f-5f81-b9a2-ae3bad9c14b6': 'f6c45dfc0d32994d3fb2b7aeda8d0210c6c7a409ba907ae3577e4a32318a0f6d',
    '7aa1abee-d6ec-528a-b110-f2260b0cda51': 'fb1e28d4751c00a5c6f9c6b4802576ac515f009d5cce41d0a56f3ad81b4008b1',
    'a9fde754-51b4-58d7-85e5-5e36160581e6': 'fe5b374aa11b4f249784e4de8a9b590f3cc3f24e87f9ca6aad9bba163a865bc9',
    'edaf0bb4-e12e-5a6c-b484-91124ba209f3': 'd4edb41106c2c68127b4314d71d70a054a43a512799b4c83d7a01d1e72bc7941',
    'fd4b7145-5c28-5b33-bf2e-0ca68f29f2fc': 'b295a5c5eed82ab7b2c182b7b3b352b3202ef862c1e123e2555470a5718547c4',
  } as const)[goalId],
}))

const profileDefinitions = new Map<string, ProfileDefinition>([
  ['36e0de23-1e3b-5c69-888f-e5e19e79cbbe', {
    archetype: 'procedure',
    selectionReasonDe: 'Der Verfahrensarchetyp passt, weil der belastbare Nachweis Normierung, vorzeichenbehaftete Auswertung, Betragsbildung und Invarianz unter äquivalenter Skalierung zu einer begründeten Abstandsbestimmung verbindet.',
    selectionReasonEn: 'The procedure archetype fits because robust evidence combines normalization, signed evaluation, taking the absolute value, and invariance under equivalent scaling into a justified distance determination.',
    additionalExpectation: {
      id: 'orthogonal-distance-and-zero-case',
      essentialUnderstandingDe: 'Der mit der Hesseschen Normalenform bestimmte Betrag ist die kürzeste, senkrecht zur Ebene gemessene Entfernung; er ist genau dann null, wenn der geprüfte Punkt auf der Ebene liegt.',
      essentialUnderstandingEn: 'The magnitude determined with Hesse normal form is the shortest distance measured perpendicular to the plane; it is zero exactly when the tested point lies on the plane.',
      observablePerformanceDe: 'Die lernende Person verbindet das Rechenergebnis mit der orthogonalen Projektion, erkennt den Nullfall als Punktlage auf der Ebene und grenzt den Abstand von einer beliebigen schrägen Verbindung zur Ebene ab.',
      observablePerformanceEn: 'The learner connects the calculated result with orthogonal projection, recognizes the zero case as membership in the plane, and distinguishes the distance from an arbitrary oblique connection to the plane.',
    },
    minimumIndependentDemonstrations: 2,
    variationAxes: [
      { id: 'normal-scaling-and-orientation', textDe: 'Normalenvektor und Ebenengleichung werden positiv, negativ oder mit einem anderen Faktor skaliert.', textEn: 'The normal vector and plane equation are scaled by a positive, negative, or different factor.' },
      { id: 'point-side-and-membership', textDe: 'Der Punkt liegt auf der Ebene, auf der positiven oder auf der negativen orientierten Seite.', textEn: 'The point lies in the plane or on its positive or negative oriented side.' },
      { id: 'starting-plane-form', textDe: 'Ausgangspunkt ist eine Koordinaten-, Normalen- oder bereits teilweise normierte Form.', textEn: 'The starting point is coordinate, normal, or already partially normalized form.' },
    ],
    applicationCaseBriefs: [
      {
        id: 'scaled-normal-distance-check',
        taskDemandDe: 'Bestimme für E: 2x - 2y + z = 3 und Q(4|1|2) die Hessesche Normalenform, den orientierten Normalenausdruck und den geometrischen Abstand. Wiederhole die Rechnung mit der mit -3 multiplizierten Ebenengleichung und erkläre das Ergebnis.',
        taskDemandEn: 'For E: 2x - 2y + z = 3 and Q(4,1,2), determine Hesse normal form, the oriented normal expression, and the geometric distance. Repeat using the plane equation multiplied by -3 and explain the result.',
        expectedPerformanceDe: 'Der Normalenvektor wird auf Länge 1 normiert; der orientierte Wert ist zunächst 5/3 und nach Orientierungswechsel -5/3, während der Abstand 5/3 unverändert bleibt.',
        expectedPerformanceEn: 'The normal vector is normalized to unit length; the oriented value is initially 5/3 and becomes -5/3 after orientation reversal, while the distance remains 5/3.',
        understandingFocusDe: 'Normierungsfaktor, Vorzeichen und skalierungsinvarianter Abstand werden getrennt.',
        understandingFocusEn: 'Normalization factor, sign, and scale-invariant distance are distinguished.',
      },
      {
        id: 'two-sides-and-zero-transfer',
        taskDemandDe: 'Untersuche mit der Hesseschen Normalenform von E: x + 2y + 2z = 6 die Punkte A(4|1|1), B(0|0|0) und einen selbst gewählten Punkt C auf E. Deute Vorzeichen und Beträge geometrisch.',
        taskDemandEn: 'Use Hesse normal form for E: x + 2y + 2z = 6 to investigate A(4,1,1), B(0,0,0), and a self-chosen point C on E. Interpret signs and magnitudes geometrically.',
        expectedPerformanceDe: 'Für A entsteht der orientierte Wert 2/3, für B der Wert -2 und für C der Wert 0; die Beträge werden als senkrechte Abstände und der Nullfall als Ebenenzugehörigkeit gedeutet.',
        expectedPerformanceEn: 'The oriented value is 2/3 for A, -2 for B, and 0 for C; their magnitudes are interpreted as perpendicular distances and the zero case as plane membership.',
        understandingFocusDe: 'Seitenorientierung und orthogonaler Abstand werden auf unabhängig variierte Punkte übertragen.',
        understandingFocusEn: 'Side orientation and perpendicular distance are transferred to independently varied points.',
      },
    ],
  }],
  ['d76766a5-ce07-5c7a-987b-157f2998b05e', {
    archetype: 'representation',
    selectionReasonDe: 'Der Repräsentationsarchetyp passt, weil die Kompetenz dieselbe affine Punktmenge in Parameter-, Punkt-Normalen- und Koordinatenform ausdrückt und die Gleichwertigkeit der Darstellungen überprüfbar erhalten muss.',
    selectionReasonEn: 'The representation archetype fits because the competence expresses the same affine point set in parametric, point-normal, and coordinate form and must preserve verifiable equivalence among the representations.',
    additionalExpectation: {
      id: 'nonuniqueness-with-equivalent-point-set',
      essentialUnderstandingDe: 'Stützpunkt, Basis der Ebenenrichtungen und Normalenvektor sind nicht eindeutig; zulässige Basiswechsel und von null verschiedene Skalierungen ändern die Darstellung, aber nicht die beschriebene Ebene.',
      essentialUnderstandingEn: 'The position point, basis of plane directions, and normal vector are not unique; admissible basis changes and nonzero scalings change the representation but not the plane described.',
      observablePerformanceDe: 'Die lernende Person erzeugt zwei verschieden aussehende Darstellungen derselben Ebene und belegt ihre Gleichwertigkeit durch Orthogonalität, Punktproben und eine Rückumformung.',
      observablePerformanceEn: 'The learner produces two differently looking representations of the same plane and establishes their equivalence using orthogonality, point tests, and reverse conversion.',
    },
    minimumIndependentDemonstrations: 2,
    variationAxes: [
      { id: 'given-plane-form', textDe: 'Die Ausgangsdarstellung wechselt zwischen Parameter-, Punkt-Normalen- und Koordinatenform.', textEn: 'The initial representation varies among parametric, point-normal, and coordinate form.' },
      { id: 'basis-and-scaling', textDe: 'Spannvektorbasis, Stützpunkt und Skalierung der Koordinatengleichung werden variiert.', textEn: 'The spanning-vector basis, position point, and scaling of the coordinate equation are varied.' },
      { id: 'equivalence-check', textDe: 'Die Kontrolle erfolgt durch Skalarprodukte, mehrere Punktproben oder Rückumformung.', textEn: 'The check uses dot products, multiple point tests, or reverse conversion.' },
    ],
    applicationCaseBriefs: [
      {
        id: 'parameter-to-three-forms',
        taskDemandDe: 'Überführe E: x = (1|0|2) + s(1|1|0) + t(0|1|2) in Punkt-Normalen- und Koordinatenform. Prüfe anschließend einen nichttrivialen durch s = 2 und t = -1 erzeugten Ebenenpunkt in allen Darstellungen.',
        taskDemandEn: 'Convert E: x = (1,0,2) + s(1,1,0) + t(0,1,2) to point-normal and coordinate form. Then check a nontrivial plane point generated by s = 2 and t = -1 in every representation.',
        expectedPerformanceDe: 'Ein geeigneter Normalenvektor ist (2|-2|1); es entstehen (2|-2|1) · (x - (1|0|2)) = 0 und 2x - 2y + z = 4. Der Punkt (3|1|0) erfüllt alle drei Formen.',
        expectedPerformanceEn: 'A suitable normal vector is (2,-2,1); the resulting forms are (2,-2,1) · (x - (1,0,2)) = 0 and 2x - 2y + z = 4. The point (3,1,0) satisfies all three forms.',
        understandingFocusDe: 'Orthogonalität und Erhalt derselben Punktmenge werden beim vollständigen Formwechsel geprüft.',
        understandingFocusEn: 'Orthogonality and preservation of the same point set are checked through a complete conversion.',
      },
      {
        id: 'scaled-coordinate-to-parametric',
        taskDemandDe: 'Beginne mit -4x - 2y + 2z = -8, vereinfache nur begründet und konstruiere eine Punkt-Normalen- sowie eine Parameterform mit zwei linear unabhängigen Spannvektoren. Weise die Gleichwertigkeit nach.',
        taskDemandEn: 'Start from -4x - 2y + 2z = -8, simplify only with justification, and construct a point-normal form and a parametric form with two linearly independent spanning vectors. Establish equivalence.',
        expectedPerformanceDe: 'Nach Division durch -2 wird 2x + y - z = 4 verwendet. Mit p = (2|0|0), u = (1|-2|0) und v = (1|0|2) entsteht eine gültige Parameterform; beide Richtungen sind orthogonal zu (2|1|-1), unabhängig und der Stützpunkt erfüllt die Gleichung.',
        expectedPerformanceEn: 'After division by -2, 2x + y - z = 4 is used. With p = (2,0,0), u = (1,-2,0), and v = (1,0,2), a valid parametric form results; both directions are orthogonal to (2,1,-1), independent, and the position point satisfies the equation.',
        understandingFocusDe: 'Nicht eindeutige, aber äquivalente Darstellung wird aus einer skalierten impliziten Form konstruiert.',
        understandingFocusEn: 'A nonunique but equivalent representation is constructed from a scaled implicit form.',
      },
    ],
  }],
  ['27cfa1b3-be6f-5f81-b9a2-ae3bad9c14b6', {
    archetype: 'procedure',
    selectionReasonDe: 'Der Verfahrensarchetyp passt, weil die Kompetenz geometrische Bedingungen systematisch in ein lineares Gleichungssystem überführt, die Lösungsmenge durch äquivalente Schritte bewahrt und die vollständige Lösungsstruktur prüft.',
    selectionReasonEn: 'The procedure archetype fits because the competence systematically translates geometric conditions into a linear system, preserves the solution set through equivalent steps, and checks the complete solution structure.',
    additionalExpectation: {
      id: 'translate-complete-solution-set-back-to-geometry',
      essentialUnderstandingDe: 'Die algebraische Lösungsmenge erhält ihre Bedeutung erst durch die Rückübersetzung in die geometrische Ausgangssituation: Ein Parameterpaar kann einen Schnittpunkt festlegen, eine freie Variable eine Schnittgerade beschreiben und ein Widerspruch eine leere Schnittmenge belegen.',
      essentialUnderstandingEn: 'An algebraic solution set gains its meaning by being translated back into the original geometric situation: a parameter pair may determine an intersection point, a free variable may describe an intersection line, and a contradiction may establish an empty intersection.',
      observablePerformanceDe: 'Die lernende Person gibt nach dem Lösen nicht nur Parameterwerte oder Zeilenstufen an, sondern konstruiert daraus die vollständige geometrische Schnittmenge, prüft einen allgemeinen Repräsentanten an den Ausgangsobjekten und begründet deren Dimension.',
      observablePerformanceEn: 'After solving, the learner states more than parameter values or row-echelon form: they construct the complete geometric intersection set, check a general representative against the original objects, and justify its dimension.',
    },
    minimumIndependentDemonstrations: 3,
    variationAxes: [
      { id: 'geometric-origin', textDe: 'Das System entsteht aus Geraden-, Ebenen- oder kombinierten Punktbedingungen.', textEn: 'The system arises from line, plane, or combined point conditions.' },
      { id: 'solution-structure', textDe: 'Eindeutige Lösung, freie Variable oder Widerspruch werden systematisch variiert.', textEn: 'A unique solution, a free variable, or a contradiction is varied systematically.' },
      { id: 'system-shape', textDe: 'Quadratische, überbestimmte und unterbestimmte Systeme mit abhängigen Bedingungen treten auf.', textEn: 'Square, overdetermined, and underdetermined systems with dependent conditions occur.' },
    ],
    applicationCaseBriefs: [
      {
        id: 'line-intersection-overdetermined-consistent',
        taskDemandDe: 'Untersuche den Schnitt von g: x = (0|1|2) + s(1|2|-1) und h: x = (2|5|0) + t(-1|0|1), indem du alle drei Koordinatenbedingungen als lineares Gleichungssystem in s und t aufstellst und systematisch löst.',
        taskDemandEn: 'Investigate the intersection of g: x = (0,1,2) + s(1,2,-1) and h: x = (2,5,0) + t(-1,0,1) by setting up all three coordinate conditions as a linear system in s and t and solving it systematically.',
        expectedPerformanceDe: 'Das äußerlich überbestimmte System ist konsistent und besitzt s = 2, t = 0; der Punkt (2|5|0) wird in beiden Geraden geprüft. Die dritte Gleichung wird als bestätigende, nicht widersprechende Bedingung eingeordnet.',
        expectedPerformanceEn: 'The apparently overdetermined system is consistent and has s = 2, t = 0; the point (2,5,0) is checked in both lines. The third equation is recognized as confirming rather than contradicting the solution.',
        understandingFocusDe: 'Gleichungsanzahl wird von Unabhängigkeit und Konsistenz getrennt.',
        understandingFocusEn: 'Equation count is distinguished from independence and consistency.',
      },
      {
        id: 'two-planes-free-parameter',
        taskDemandDe: 'Löse das aus zwei Ebenenbedingungen stammende System x + y = 2 und y + z = 3 vollständig. Gib die Lösungsmenge parametrisch an und prüfe einen allgemeinen Lösungspunkt in beiden Gleichungen.',
        taskDemandEn: 'Completely solve the system x + y = 2 and y + z = 3 arising from two plane conditions. State the solution set parametrically and check a general solution point in both equations.',
        expectedPerformanceDe: 'Mit y = r ergibt sich (x|y|z) = (2 - r|r|3 - r), r in R. Die freie Variable wird als eindimensionale gemeinsame Lösungsmenge und nicht als unvollständige Rechnung gedeutet.',
        expectedPerformanceEn: 'With y = r, (x,y,z) = (2 - r,r,3 - r), r in R. The free variable is interpreted as a one-dimensional common solution set rather than an unfinished calculation.',
        understandingFocusDe: 'Freie Variable und vollständige parametrische Lösungsmenge werden beobachtbar.',
        understandingFocusEn: 'A free variable and a complete parametric solution set are made observable.',
      },
      {
        id: 'dependent-equation-with-contradiction',
        taskDemandDe: 'Untersuche x + y + z = 2, 2x + 2y + 2z = 4 und x + y + z = 3. Dokumentiere äquivalente Umformungen und deute das Ergebnis als gemeinsame geometrische Lösungsmenge.',
        taskDemandEn: 'Investigate x + y + z = 2, 2x + 2y + 2z = 4, and x + y + z = 3. Document equivalent transformations and interpret the result as a common geometric solution set.',
        expectedPerformanceDe: 'Die zweite Gleichung wird als abhängig erkannt; aus erster und dritter entsteht ein Widerspruch. Die Lösungsmenge ist leer, obwohl nicht jede zusätzliche Gleichung neue Information liefert.',
        expectedPerformanceEn: 'The second equation is recognized as dependent; the first and third produce a contradiction. The solution set is empty even though not every additional equation supplies new information.',
        understandingFocusDe: 'Abhängigkeit und Widerspruch werden unabhängig voneinander diagnostiziert.',
        understandingFocusEn: 'Dependence and contradiction are diagnosed independently.',
      },
    ],
  }],
  ['7aa1abee-d6ec-528a-b110-f2260b0cda51', {
    archetype: 'procedure',
    selectionReasonDe: 'Der Verfahrensarchetyp passt, weil eine gültige Punktprobe einen gemeinsamen Parameterwert in allen Koordinaten und bei Strecken zusätzlich die korrekte Intervallbedingung verlangt.',
    selectionReasonEn: 'The procedure archetype fits because a valid point test requires one common parameter value in every coordinate and, for segments, the correct interval condition as well.',
    additionalExpectation: {
      id: 'geometric-membership-is-reparametrization-invariant',
      essentialUnderstandingDe: 'Eine äquivalente Umparametrisierung kann den Parameterwert und das zulässige Intervall verändern, nicht aber die geometrische Zugehörigkeit eines Punktes zur Geraden oder Strecke.',
      essentialUnderstandingEn: 'An equivalent reparametrization may change the parameter value and admissible interval but not a point\'s geometric membership in the line or segment.',
      observablePerformanceDe: 'Die lernende Person wiederholt eine Punktprobe nach Vertauschen der Streckenendpunkte, übersetzt den Parameterbereich korrekt und begründet das unveränderte geometrische Urteil.',
      observablePerformanceEn: 'The learner repeats a point test after reversing the segment endpoints, translates the parameter interval correctly, and justifies the unchanged geometric conclusion.',
    },
    minimumIndependentDemonstrations: 2,
    variationAxes: [
      { id: 'object-bounds', textDe: 'Unbegrenzte Gerade und begrenzte Strecke mit verschiedenen Parameterintervallen.', textEn: 'Unbounded line and bounded segment with different parameter intervals.' },
      { id: 'point-position', textDe: 'Punkt auf dem Objekt, neben der Trägergeraden oder auf der Trägergeraden außerhalb der Strecke.', textEn: 'Point on the object, off the supporting line, or on the supporting line outside the segment.' },
      { id: 'parametrization', textDe: 'Orientierung, Stützpunkt und Skalierung des Richtungsvektors werden äquivalent verändert.', textEn: 'Orientation, position point, and direction-vector scaling are changed equivalently.' },
    ],
    applicationCaseBriefs: [
      {
        id: 'common-parameter-line-test',
        taskDemandDe: 'Prüfe P(5|0|6) und Q(5|0|5) auf g: x = (1|-2|0) + t(2|1|3). Begründe für jeden Punkt das Urteil aus allen drei Koordinatenbedingungen.',
        taskDemandEn: 'Test P(5,0,6) and Q(5,0,5) on g: x = (1,-2,0) + t(2,1,3). For each point, justify the conclusion using all three coordinate conditions.',
        expectedPerformanceDe: 'Für P gilt in allen Komponenten t = 2. Bei Q liefern x und y zwar t = 2, die z-Komponente widerspricht; Q liegt deshalb nicht auf g.',
        expectedPerformanceEn: 'For P, every component gives t = 2. For Q, x and y give t = 2 but the z component contradicts this, so Q is not on g.',
        understandingFocusDe: 'Ein gemeinsamer Parameter wird von komponentenweise passenden Einzelwerten unterschieden.',
        understandingFocusEn: 'One common parameter is distinguished from separately fitting component values.',
      },
      {
        id: 'segment-bound-and-reversal',
        taskDemandDe: 'Die Strecke von A(0|1|-1) nach B(4|-1|3) sei A + lambda(B - A) mit 0 <= lambda <= 1. Prüfe Q(3|-0,5|2) und R(6|-2|5), wiederhole die Prüfung nach Vertauschen der Endpunkte und vergleiche die Parameterwerte.',
        taskDemandEn: 'Let the segment from A(0,1,-1) to B(4,-1,3) be A + lambda(B - A) with 0 <= lambda <= 1. Test Q(3,-0.5,2) and R(6,-2,5), repeat after reversing the endpoints, and compare the parameter values.',
        expectedPerformanceDe: 'Q gehört mit lambda = 0,75 zur Strecke und erhält nach Umkehr den Wert 0,25. R liegt mit lambda = 1,5 nur auf der Trägergeraden; nach Umkehr ist der Wert -0,5 und bleibt außerhalb des zulässigen Intervalls.',
        expectedPerformanceEn: 'Q belongs to the segment with lambda = 0.75 and has value 0.25 after reversal. R lies only on the supporting line with lambda = 1.5; after reversal its value is -0.5 and remains outside the admissible interval.',
        understandingFocusDe: 'Trägergerade, Streckenintervall und Umparametrisierungsinvarianz werden gemeinsam geprüft.',
        understandingFocusEn: 'Supporting line, segment interval, and reparametrization invariance are tested together.',
      },
    ],
  }],
  ['a9fde754-51b4-58d7-85e5-5e36160581e6', {
    archetype: 'procedure',
    selectionReasonDe: 'Der Verfahrensarchetyp passt, weil jede Koordinatenebene eine gezielte Nullbedingung erzeugt, deren Lösung in Gerade und Ebene geprüft und einschließlich leerer oder enthaltener Sonderfälle geometrisch gedeutet werden muss.',
    selectionReasonEn: 'The procedure archetype fits because each coordinate plane produces a targeted zero condition whose solution must be checked in both line and plane and interpreted geometrically, including empty or contained special cases.',
    additionalExpectation: {
      id: 'trace-points-are-invariant-under-reparametrization',
      essentialUnderstandingDe: 'Eine äquivalente Umparametrisierung verändert die Parameterwerte der Durchstoßpunkte, aber weder ihre räumlichen Koordinaten noch die zugehörigen Koordinatenebenen.',
      essentialUnderstandingEn: 'An equivalent reparametrization changes the parameter values of trace points but neither their spatial coordinates nor their associated coordinate planes.',
      observablePerformanceDe: 'Die lernende Person bestimmt Durchstoßpunkte in zwei äquivalenten Parametrisierungen, übersetzt die Parameterwerte korrekt ineinander und weist durch Punkt- und Ebenenproben nach, dass dieselben geometrischen Schnittpunkte entstehen.',
      observablePerformanceEn: 'The learner determines trace points in two equivalent parametrizations, correctly translates the parameter values, and uses line and plane membership checks to show that the same geometric intersection points result.',
    },
    minimumIndependentDemonstrations: 2,
    variationAxes: [
      { id: 'coordinate-plane', textDe: 'xy-, xz- und yz-Ebene mit jeweils anderer Nullkoordinate.', textEn: 'The xy, xz, and yz planes with a different zero coordinate in each case.' },
      { id: 'component-condition', textDe: 'Lineare Nullstelle, konstante von null verschiedene Komponente oder identisch verschwindende Komponente.', textEn: 'A linear zero, a constant nonzero component, or an identically zero component.' },
      { id: 'line-representation', textDe: 'Richtung, Stützpunkt und äquivalente Umparametrisierung der Geraden werden variiert.', textEn: 'Direction, position point, and equivalent reparametrization of the line are varied.' },
    ],
    applicationCaseBriefs: [
      {
        id: 'three-coordinate-plane-trace-points',
        taskDemandDe: 'Bestimme für g: x = (2|-1|3) + t(-1|2|-3) die Durchstoßpunkte mit yz-, xz- und xy-Ebene. Wiederhole die Bestimmung mit der äquivalenten Darstellung x = (1|1|0) + u(2|-4|6), übersetze die Parameterwerte und prüfe jeden Punkt in Gerade und Koordinatenebene.',
        taskDemandEn: 'For g: x = (2,-1,3) + t(-1,2,-3), determine the trace points with the yz, xz, and xy planes. Repeat the determination using the equivalent representation x = (1,1,0) + u(2,-4,6), translate the parameter values, and check every point in both the line and coordinate plane.',
        expectedPerformanceDe: 'Es entstehen (0|3|-3), (1,5|0|1,5) und (1|1|0). Die Werte t = 2; 0,5; 1 entsprechen über t = 1 - 2u den Werten u = -0,5; 0,25; 0. Beide Darstellungen liefern dieselben Punkte und dieselbe Zuordnung zu yz-, xz- und xy-Ebene.',
        expectedPerformanceEn: 'The points are (0,3,-3), (1.5,0,1.5), and (1,1,0). Through t = 1 - 2u, the values t = 2, 0.5, 1 correspond to u = -0.5, 0.25, 0. Both representations yield the same points and the same assignment to the yz, xz, and xy planes.',
        understandingFocusDe: 'Drei Nullbedingungen werden konsistent gelöst; die geometrischen Durchstoßpunkte bleiben bei äquivalenter Umparametrisierung invariant.',
        understandingFocusEn: 'Three zero conditions are solved consistently; the geometric trace points remain invariant under equivalent reparametrization.',
      },
      {
        id: 'contained-and-disjoint-special-cases',
        taskDemandDe: 'Untersuche h: x = (1|0|2) + s(2|0|-1) bezüglich der xz-Ebene und k: x = (1|2|0) + r(0|1|3) bezüglich der yz-Ebene. Gib jeweils die vollständige Schnittmenge an und begründe, ob ein einzelner Durchstoßpunkt vorliegt.',
        taskDemandEn: 'Investigate h: x = (1,0,2) + s(2,0,-1) relative to the xz plane and k: x = (1,2,0) + r(0,1,3) relative to the yz plane. State the complete intersection set in each case and justify whether there is a single trace point.',
        expectedPerformanceDe: 'Bei h ist y für alle s gleich null, also liegt die ganze Gerade in der xz-Ebene. Bei k ist x konstant 1, also ist die Gerade zur yz-Ebene parallel und disjunkt; in keinem Fall existiert ein einzelner Durchstoßpunkt.',
        expectedPerformanceEn: 'For h, y is zero for every s, so the entire line lies in the xz plane. For k, x is constantly 1, so the line is parallel to and disjoint from the yz plane; neither case has a single trace point.',
        understandingFocusDe: 'Enthaltene und leere Schnittmenge werden ohne Scope-Erweiterung als notwendige Verfahrenssonderfälle unterschieden.',
        understandingFocusEn: 'Contained and empty intersections are distinguished as necessary procedural special cases without expanding scope.',
      },
    ],
  }],
  ['edaf0bb4-e12e-5a6c-b484-91124ba209f3', {
    archetype: 'concept',
    selectionReasonDe: 'Der Konzeptarchetyp passt, weil die zentrale Schwierigkeit in der sauberen Trennung von Scharparameter und Laufparameter sowie in der geometrischen Bedeutung besonderer Parameterwerte liegt.',
    selectionReasonEn: 'The concept archetype fits because the central difficulty is the clear distinction between family parameter and running parameter and the geometric meaning of exceptional parameter values.',
    additionalExpectation: {
      id: 'family-condition-must-be-complete',
      essentialUnderstandingDe: 'Eine Bedingung an eine Geradenschar kann keinen, genau einen oder mehrere Scharwerte liefern; jeder algebraisch gefundene Wert muss auf Zulässigkeit und die tatsächlich entstehende Geradenlage geprüft werden.',
      essentialUnderstandingEn: 'A condition on a family of lines may yield no, exactly one, or several family values; every algebraically obtained value must be checked for admissibility and the actual resulting line configuration.',
      observablePerformanceDe: 'Die lernende Person bestimmt alle Scharwerte einer Lage-, Schnitt- oder Punktbedingung, prüft sie in der ursprünglichen Schar und unterscheidet reguläre von qualitativ besonderen Konfigurationen.',
      observablePerformanceEn: 'The learner determines all family values for a positional, intersection, or point condition, checks them in the original family, and distinguishes regular from qualitatively exceptional configurations.',
    },
    minimumIndependentDemonstrations: 3,
    variationAxes: [
      { id: 'parameter-location', textDe: 'Der Scharparameter verändert Stützpunkt, Richtungsvektor oder beide Bestandteile.', textEn: 'The family parameter changes the position point, direction vector, or both.' },
      { id: 'geometric-condition', textDe: 'Schnitt, Parallelität und Zugehörigkeit eines festen Punkts werden unabhängig geprüft.', textEn: 'Intersection, parallelism, and membership of a fixed point are tested independently.' },
      { id: 'configuration-outcome', textDe: 'Eindeutiger Schnitt, parallele Geraden, identische Geraden oder windschiefe Lage können als Sonderfälle auftreten.', textEn: 'A unique intersection, parallel lines, identical lines, or a skew configuration may occur as special cases.' },
    ],
    applicationCaseBriefs: [
      {
        id: 'support-shift-intersection-or-skew',
        taskDemandDe: 'Untersuche die Lage von g_a: x = (0|a|a) + t(1|2|0) zur festen Geraden h: x = (0|0|0) + s(1|0|0). Bestimme alle a mit Schnitt und deute die übrigen Fälle.',
        taskDemandEn: 'Investigate the position of g_a: x = (0,a,a) + t(1,2,0) relative to the fixed line h: x = (0,0,0) + s(1,0,0). Determine every a producing an intersection and interpret the remaining cases.',
        expectedPerformanceDe: 'Nur a = 0 liefert mit t = s = 0 den Schnitt im Ursprung. Für a ungleich 0 sind die Richtungen nicht parallel, aber die z-Koordinate verhindert einen Schnitt; die Geraden sind windschief.',
        expectedPerformanceEn: 'Only a = 0 produces an intersection at the origin with t = s = 0. For a not equal to 0, the directions are not parallel but the z coordinate prevents intersection, so the lines are skew.',
        understandingFocusDe: 'Scharwert, Laufparameter und räumliche Lage werden getrennt bestimmt.',
        understandingFocusEn: 'Family value, running parameter, and spatial position are determined separately.',
      },
      {
        id: 'direction-parameter-parallel-special-value',
        taskDemandDe: 'Vergleiche g_a: x = (1|0|0) + t(1|a|0) mit h: x = (0|1|0) + s(1|2|0). Bestimme den besonderen Scharwert für Parallelität und untersuche, ob die Geraden dort identisch sind; deute auch a ungleich diesem Wert.',
        taskDemandEn: 'Compare g_a: x = (1,0,0) + t(1,a,0) with h: x = (0,1,0) + s(1,2,0). Determine the exceptional family value for parallelism and test whether the lines are identical there; also interpret values different from it.',
        expectedPerformanceDe: 'Für a = 2 sind die Richtungen parallel, die Geraden wegen der Stützpunktdifferenz jedoch verschieden. Für a ungleich 2 schneiden sich die beiden Geraden in der xy-Ebene eindeutig.',
        expectedPerformanceEn: 'For a = 2, the directions are parallel, but the lines are distinct because of the difference between position points. For a not equal to 2, the two lines intersect uniquely in the xy plane.',
        understandingFocusDe: 'Ein Richtungs-Sonderwert wird von Identität und regulärem Schnittverhalten abgegrenzt.',
        understandingFocusEn: 'An exceptional direction value is distinguished from identity and regular intersection behavior.',
      },
      {
        id: 'fixed-point-family-membership',
        taskDemandDe: 'Für g_a: x = (a|0|1) + t(1|a|0) soll P(2|1|1) auf einer Schargeraden liegen. Bestimme alle zulässigen Scharwerte und die zugehörigen Laufparameter und prüfe das Ergebnis vollständig.',
        taskDemandEn: 'For g_a: x = (a,0,1) + t(1,a,0), require P(2,1,1) to lie on a member of the family. Determine every admissible family value and associated running parameter and check the result completely.',
        expectedPerformanceDe: 'Aus a + t = 2 und at = 1 folgt eindeutig a = 1 und t = 1; die z-Koordinate ist konsistent. Schar- und Laufparameter werden nicht miteinander gleichgesetzt, sondern gemeinsam gelöst.',
        expectedPerformanceEn: 'The equations a + t = 2 and at = 1 uniquely give a = 1 and t = 1; the z coordinate is consistent. Family and running parameters are not conflated but solved jointly.',
        understandingFocusDe: 'Eine unabhängige Punktbedingung prüft die vollständige Parametertrennung.',
        understandingFocusEn: 'An independent point condition tests complete separation of the two parameters.',
      },
    ],
  }],
  ['fd4b7145-5c28-5b33-bf2e-0ca68f29f2fc', {
    archetype: 'concept',
    selectionReasonDe: 'Der Konzeptarchetyp passt, weil eine Ebenenschar nur verstanden ist, wenn Scharparameter und Raumvariablen getrennt, Normalen- und Konstantenänderungen geometrisch gedeutet und entartete Gleichungen erkannt werden.',
    selectionReasonEn: 'The concept archetype fits because understanding a family of planes requires distinguishing family parameters from spatial variables, interpreting changes in normals and constants geometrically, and recognizing degenerate equations.',
    additionalExpectation: {
      id: 'valid-plane-versus-equivalent-scaling-and-degeneracy',
      essentialUnderstandingDe: 'Von null verschiedene gemeinsame Skalierungen aller Koeffizienten beschreiben dieselbe Ebene; ein Parameterwert, der alle Koeffizienten auf null setzt, kann dagegen zur Aussage 0 = 0 oder 0 = c und damit zu keiner Ebene führen.',
      essentialUnderstandingEn: 'A common nonzero scaling of all coefficients describes the same plane; a parameter value that makes every coefficient zero may instead produce 0 = 0 or 0 = c and therefore no plane.',
      observablePerformanceDe: 'Die lernende Person prüft besondere Scharwerte zuerst auf eine von null verschiedene Normale, trennt bloße Gleichungsskalierung von geometrischer Änderung und deutet entartete Fälle korrekt als ganzen Raum oder leere Menge.',
      observablePerformanceEn: 'The learner first checks exceptional family values for a nonzero normal, distinguishes mere equation scaling from geometric change, and correctly interprets degenerate cases as all of space or the empty set.',
    },
    minimumIndependentDemonstrations: 3,
    variationAxes: [
      { id: 'parameter-placement', textDe: 'Der Scharparameter verändert die Normalkoeffizienten, das konstante Glied oder alle Koeffizienten gemeinsam.', textEn: 'The family parameter changes normal coefficients, the constant term, or all coefficients together.' },
      { id: 'geometric-condition', textDe: 'Parallelität, Schnitt, Punktzugehörigkeit und Identität werden als verschiedene Bedingungen eingesetzt.', textEn: 'Parallelism, intersection, point membership, and identity are used as distinct conditions.' },
      { id: 'exceptional-validity', textDe: 'Reguläre Ebenen, äquivalente Skalierungen und entartete Gleichungen werden variiert.', textEn: 'Regular planes, equivalent scalings, and degenerate equations are varied.' },
    ],
    applicationCaseBriefs: [
      {
        id: 'parallel-special-value-versus-intersection',
        taskDemandDe: 'Untersuche E_k: x + ky + z = 1 relativ zu F: 2x + 4y + 2z = 5. Bestimme alle k für Parallelität oder Identität und beschreibe die Lage für die übrigen Werte.',
        taskDemandEn: 'Investigate E_k: x + ky + z = 1 relative to F: 2x + 4y + 2z = 5. Determine every k producing parallelism or identity and describe the position for the remaining values.',
        expectedPerformanceDe: 'Nur k = 2 macht die Normalen parallel; nach Skalierung lauten die rechten Seiten 1 und 2,5, daher sind die Ebenen verschieden und parallel. Für k ungleich 2 sind die Normalen nicht parallel und die Ebenen schneiden sich in einer Geraden; Identität tritt nie auf.',
        expectedPerformanceEn: 'Only k = 2 makes the normals parallel; after scaling, the right-hand sides are 1 and 2.5, so the planes are distinct and parallel. For k not equal to 2, the normals are not parallel and the planes intersect in a line; identity never occurs.',
        understandingFocusDe: 'Normalenvergleich, Konstantenvergleich und vollständige Lageklassifikation werden verbunden.',
        understandingFocusEn: 'Normal comparison, constant comparison, and complete positional classification are combined.',
      },
      {
        id: 'point-condition-on-plane-family',
        taskDemandDe: 'Bestimme alle k, für die P(1|2|-1) auf E_k: x + ky + z = k + 1 liegt, und prüfe den gefundenen Wert in der ursprünglichen Gleichung.',
        taskDemandEn: 'Determine every k for which P(1,2,-1) lies on E_k: x + ky + z = k + 1, and check the resulting value in the original equation.',
        expectedPerformanceDe: 'Einsetzen liefert 2k = k + 1 und damit eindeutig k = 1; für diesen Wert erfüllt P die Ebene. k bleibt Scharparameter und wird nicht mit einer Raumkoordinate verwechselt.',
        expectedPerformanceEn: 'Substitution gives 2k = k + 1 and therefore uniquely k = 1; for this value P satisfies the plane. k remains the family parameter and is not confused with a spatial coordinate.',
        understandingFocusDe: 'Eine unabhängige Punktbedingung operationalisiert die Trennung der Variablenrollen.',
        understandingFocusEn: 'An independent point condition operationalizes the distinction between variable roles.',
      },
      {
        id: 'common-scaling-with-degenerate-member',
        taskDemandDe: 'Analysiere H_k: kx + ky + kz = k für alle reellen k. Entscheide, wann verschiedene Gleichungen dieselbe Ebene beschreiben und was beim besonderen Wert k = 0 geometrisch gilt.',
        taskDemandEn: 'Analyze H_k: kx + ky + kz = k for all real k. Decide when different equations describe the same plane and what holds geometrically at the exceptional value k = 0.',
        expectedPerformanceDe: 'Für jedes k ungleich 0 führt Division durch k zur selben Ebene x + y + z = 1. Für k = 0 entsteht 0 = 0, also der ganze Raum und keine Ebene; dieser Wert darf nicht durch die reguläre Division verdeckt werden.',
        expectedPerformanceEn: 'For every k not equal to 0, division by k gives the same plane x + y + z = 1. For k = 0, the equation is 0 = 0, representing all of space rather than a plane; this value must not be hidden by the regular division.',
        understandingFocusDe: 'Äquivalente Skalierung wird von einer entarteten Schargleichung getrennt.',
        understandingFocusEn: 'Equivalent scaling is distinguished from a degenerate family equation.',
      },
    ],
  }],
])

const writeLockPath = `${artifactRoot}/.${artifactStem}.write-lock`
const stagingSuffix = '.b019-stable7-evidence-staging'
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

const assertPathAbsent = (path: string, role: string): void => {
  try {
    lstatSync(absolute(path))
  } catch (error) {
    if (hasErrorCode(error, 'ENOENT')) return
    throw error
  }
  throw new Error(`${role} must be absent: ${path}`)
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
  for (const [role, value] of Object.entries(historicalCarryoverPins)) {
    assertPinnedHash(`historicalCarryoverPins.${role}`, value)
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
  assertUnique(campaignGoalIds, 'B019 campaign scope')
  assertUnique(goalIds, 'B019 stable-seven scope')
  assertUnique(followUpGoalIds, 'B019 follow-up scope')
  if (
    campaignGoalIds.length !== 19
    || goalIds.length !== 7
    || followUpGoalIds.length !== 12
    || selectedRoundByGoalId.size !== goalIds.length
    || profileDefinitions.size !== goalIds.length
    || resolutionFiles.length !== goalIds.length
  ) {
    throw new Error('B019 evidence scope must be exactly 19 = 7 stable + 12 follow-up')
  }
  const partition = [...goalIds, ...followUpGoalIds]
  if (
    new Set(partition).size !== campaignGoalIds.length
    || !campaignGoalIds.every((goalId) => partition.includes(goalId))
  ) {
    throw new Error('B019 stable and follow-up scopes must form a disjoint full campaign partition')
  }
  if (
    [...selectedRoundByGoalId.keys()].some((goalId) => !goalIds.includes(goalId as typeof goalIds[number]))
    || [...profileDefinitions.keys()].some((goalId) => !goalIds.includes(goalId as typeof goalIds[number]))
    || !sameOrdered(resolutionFiles.map(({ goalId }) => goalId), goalIds)
  ) {
    throw new Error('B019 evidence selection, profile, or resolution binding claims a non-stable goal')
  }
}

const fixedSourceSpecifications = [
  { key: 'config', role: 'math_b019_config', path: sourceConfigPath, sha256: sourceHashes.config },
  { key: 'batchManifest', role: 'math_b019_batch_manifest', path: batchManifestPath, sha256: sourceHashes.batchManifest },
  { key: 'bookModel', role: 'math_b019_book_model', path: bookModelPath, sha256: sourceHashes.bookModel },
  { key: 'bundleManifest', role: 'math_b019_bundle_manifest', path: bundleManifestPath, sha256: sourceHashes.bundleManifest },
  { key: 'bundleReviewInput', role: 'math_b019_bundle_review_input', path: bundleReviewInputPath, sha256: sourceHashes.bundleReviewInput },
  { key: 'bundleReviewInputJsonl', role: 'math_b019_bundle_review_input_jsonl', path: bundleReviewInputJsonlPath, sha256: sourceHashes.bundleReviewInputJsonl },
  { key: 'dualSummary', role: 'math_b019_dual_summary', path: dualSummaryPath, sha256: sourceHashes.dualSummary },
  { key: 'adjudication', role: 'math_b019_third_subject_adjudication', path: adjudicationPath, sha256: sourceHashes.adjudication },
  { key: 'roundARecords', role: 'math_b019_round_a_records', path: roundARecordsPath, sha256: sourceHashes.roundARecords },
  { key: 'roundARun', role: 'math_b019_round_a_run', path: roundARunPath, sha256: sourceHashes.roundARun },
  { key: 'roundBRecords', role: 'math_b019_round_b_records', path: roundBRecordsPath, sha256: sourceHashes.roundBRecords },
  { key: 'roundBRun', role: 'math_b019_round_b_run', path: roundBRunPath, sha256: sourceHashes.roundBRun },
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
  historicalCarryoverProducerPlanSha256: string
  historicalCarryoverMaterializationState: MaterializationState
  currentPins: {
    canonical: string
    semanticKindLedger: string
    goalBook: string
    subset: string
  }
  historicalPins: {
    carryoverMaterializer: string
    carryoverProducerPlan: string
    carryoverMaterializationPlan: string
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
    'B019 stable-seven carryover-v2 materializer',
  )
  const actualCarryoverMaterializerSha256 = sha256Hex(carryoverMaterializerBytes)
  assertOptionalPinMatches(
    'sourceHashes.carryoverMaterializer',
    sourceHashes.carryoverMaterializer,
    actualCarryoverMaterializerSha256,
  )
  const carryoverOutputs = [
    { path: synthesisPath, sha256: sourceHashes.synthesisManifest, mode: '0644' },
    ...resolutionFiles.map(({ path, sha256 }) => ({ path, sha256, mode: '0644' as const })),
    { path: compatibilityReceiptPath, sha256: sourceHashes.compatibilityReceipt, mode: '0644' },
    { path: resolutionIndexPath, sha256: sourceHashes.resolutionIndex, mode: '0644' },
  ]
  const expectedCarryoverPaths = [
    synthesisPath,
    ...resolutionFiles.map(({ path }) => path),
    compatibilityReceiptPath,
    resolutionIndexPath,
  ]
  if (
    carryoverOutputs.length !== expectedCarryoverPaths.length
    || !sameOrdered(carryoverOutputs.map(({ path }) => String(path ?? '')), expectedCarryoverPaths)
    || carryoverOutputs.some(({ sha256, mode }) => (
      typeof sha256 !== 'string'
      || !/^[0-9a-f]{64}$/u.test(sha256)
      || mode !== '0644'
    ))
  ) {
    throw new Error('Historical B019 carryover-v2 output scope or pinned hashes changed')
  }
  const carryoverProducerPlanSha256 = historicalCarryoverPins.producerPlan
  const carryoverMaterializationState: MaterializationState = 'exact-after'
  for (const output of carryoverOutputs) {
    readBoundFile(output.path, output.sha256, `Historical B019 carryover output ${output.path}`)
    assertMode(
      lstatSync(absolute(output.path)).mode,
      publishedFileMode,
      `Historical B019 carryover output ${output.path}`,
    )
    assertPathAbsent(
      `${output.path}.b019-stable-seven-staging`,
      'Historical B019 carryover staging residue',
    )
  }
  for (const directory of [batchDirectory, `${batchDirectory}/${resolutionDirectory}`]) {
    const candidate = absolute(directory)
    assertRealDirectory(candidate, 'Historical B019 carryover owned directory')
    assertMode(
      lstatSync(candidate).mode,
      ownedDirectoryMode,
      `Historical B019 carryover owned directory ${directory}`,
    )
    for (const entry of readdirSync(candidate, { encoding: 'utf8', withFileTypes: true })) {
      if (
        entry.name.startsWith('.b019-stable-seven-prepare-')
        || entry.name.endsWith('.b019-stable-seven-staging')
      ) {
        throw new Error(`Historical B019 carryover residue is present: ${resolve(candidate, entry.name)}`)
      }
    }
  }
  assertPathAbsent(
    `${batchDirectory}/.${resolutionStem}.write-lock`,
    'Historical B019 carryover write lock',
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
  ) throw new Error('B019 carryover-v2 PLAN report is missing synthesis, receipt, or index hashes')
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

  const canonicalBytes = readRegularFile(canonicalPath, 'Current post-B020 canonical Mathematics landscape')
  const semanticKindLedgerBytes = readRegularFile(
    semanticKindLedgerPath,
    'Current post-B020 Mathematics semantic-kind ledger',
  )
  const actualCanonicalSha256 = sha256Hex(canonicalBytes)
  const actualSemanticKindLedgerSha256 = sha256Hex(semanticKindLedgerBytes)
  assertOptionalPinMatches('sourceHashes.canonical', sourceHashes.canonical, actualCanonicalSha256)
  assertOptionalPinMatches(
    'sourceHashes.semanticKindLedger',
    sourceHashes.semanticKindLedger,
    actualSemanticKindLedgerSha256,
  )
  const historicalBookModel = parseJson<{
    book?: { id?: string; title?: string }
    pages?: Array<{ goalId?: string; [key: string]: unknown }>
  }>(fixedSources.bookModel, 'Historical reviewed B019 GoalBook subset')
  if (
    typeof historicalBookModel.book?.id !== 'string'
    || typeof historicalBookModel.book.title !== 'string'
    || historicalBookModel.pages?.length !== campaignGoalIds.length
    || !sameOrdered(historicalBookModel.pages.map(({ goalId }) => goalId ?? ''), campaignGoalIds)
  ) {
    throw new Error('Historical reviewed B019 GoalBook subset identity or ordered scope changed')
  }
  const currentGoalBook = await loadGoalBookBuildInputs(
    'app/scripts/config/goal-books/de-gym-math-national-atlas.json',
    repositoryRoot,
  )
  const currentSubset = buildGoalDescriptionRolloutSubsetModel({
    baseModel: currentGoalBook.model,
    goalIds: [...campaignGoalIds],
    bookId: historicalBookModel.book.id,
    title: historicalBookModel.book.title,
  })
  const currentGoalBookSha256 = currentGoalBook.model.digest.replace(/^sha256:/u, '')
  const currentSubsetDigest = currentSubset.digest
  if (
    !/^[0-9a-f]{64}$/u.test(currentGoalBookSha256)
    || !/^sha256:[0-9a-f]{64}$/u.test(currentSubsetDigest)
    || currentGoalBook.model.book.landscapeId !== landscapeId
    || currentGoalBook.model.book.pageCount !== expectedCurriculumAtomicDenominator
    || currentGoalBook.model.pages.length !== expectedCurriculumAtomicDenominator
    || currentGoalBook.model.book.projectedAtomicGoalCount !== expectedProjectedAtomicGoalCount
    || currentGoalBook.model.book.excludedTargetAtomicGoalCount
      !== expectedExcludedTargetAtomicGoalCount
    || currentGoalBook.model.excludedTargetGoals.length !== expectedExcludedTargetAtomicGoalCount
    || currentGoalBook.model.book.projectedAtomicGoalCount
      !== currentGoalBook.model.pages.length + currentGoalBook.model.excludedTargetGoals.length
    || currentSubset.pages.length !== campaignGoalIds.length
    || !sameOrdered(currentSubset.pages.map(({ goalId }) => goalId), campaignGoalIds)
  ) {
    throw new Error('Current post-B020 GoalBook must prove 919 = 792 pages + 127 excluded and the ordered B019 subset')
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
  for (const goalId of goalIds) {
    const historicalPage = historicalBookModel.pages.find((page) => page.goalId === goalId)
    const currentPage = currentSubset.pages.find((page) => page.goalId === goalId)
    if (
      !historicalPage
      || !currentPage
      || stableGoalBookJson(historicalPage) !== stableGoalBookJson(currentPage)
    ) {
      throw new Error(
        `${goalId}: current post-B020 GoalBook page or direct/reverse relation context `
        + 'differs from the reviewed B019 page',
      )
    }
  }

  const sourceConfig = parseJson<{ batchId?: string; subject?: string; goalIds?: string[] }>(
    fixedSources.config,
    'B019 config',
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
    'B019 batch manifest',
  )
  const roundARun = parseJson<{ runId?: string; status?: string; blindToOtherRuns?: boolean; goalIds?: string[] }>(
    fixedSources.roundARun,
    'B019 Round A run',
  )
  const roundBRun = parseJson<{ runId?: string; status?: string; blindToOtherRuns?: boolean; goalIds?: string[] }>(
    fixedSources.roundBRun,
    'B019 Round B run',
  )
  const dualSummary = parseJson<DualSummary>(fixedSources.dualSummary, 'B019 dual summary')
  const adjudication = parseJson<Adjudication>(fixedSources.adjudication, 'B019 third adjudication')
  const canonical = parseJson<{ landscapeId?: string; subject?: string; goals?: CanonicalGoal[] }>(
    canonicalBytes,
    'Current post-B020 canonical Mathematics landscape',
  )
  const semanticKindLedger = parseJson<{
    documentType?: string
    sourceLandscapeId?: string
    sourceLandscapePath?: string
    counts?: { curricularAtomic?: number; total?: number }
    decisions?: Array<{ goalId?: string; semanticKind?: string; decisionStatus?: string }>
  }>(semanticKindLedgerBytes, 'Current post-B020 Mathematics semantic-kind ledger')

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
    throw new Error('B019 config or batch manifest is not the exact ordered 19-goal campaign')
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
    throw new Error('B019 blind-review run bindings are invalid')
  }
  if (
    dualSummary.goalCount !== campaignGoalIds.length
    || dualSummary.goals?.length !== campaignGoalIds.length
    || !sameOrdered(dualSummary.goals.map(({ goalId }) => goalId ?? ''), campaignGoalIds)
  ) {
    throw new Error('B019 dual summary does not bind the exact ordered campaign')
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
    || !sameOrdered(adjudication.stableCurrentGoalIds ?? [], goalIds)
    || !sameOrdered(adjudication.requiredFollowUpGoalIds ?? [], followUpGoalIds)
    || adjudication.decisions?.length !== campaignGoalIds.length
    || !sameOrdered(adjudication.decisions.map(({ goalId }) => goalId ?? ''), campaignGoalIds)
  ) {
    throw new Error('B019 third adjudication does not authorize exactly the stable-seven scope')
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
    throw new Error('B019 third adjudication input hashes do not match the bound blind-review sources')
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
  const currentGoalBookPageGoalIds = currentGoalBook.model.pages.map(({ goalId }) => goalId)
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
    || new Set(currentGoalBookPageGoalIds).size !== expectedCurriculumAtomicDenominator
    || currentGoalBookPageGoalIds.some((goalId) => !authoritativeCurricularAtomicIds.includes(goalId))
    || authoritativeCurricularAtomicIds.some((goalId) => !currentGoalBookPageGoalIds.includes(goalId))
  ) {
    throw new Error(
      'Current Mathematics canonical/ledger/GoalBook must prove 1174 total '
      + 'and the same 792 unique curricularAtomic goals',
    )
  }

  const rounds: Record<ReviewRound, BoundRecord[]> = {
    first: parseJsonl(fixedSources.roundARecords, 'B019 Round A records'),
    second: parseJsonl(fixedSources.roundBRecords, 'B019 Round B records'),
  }
  for (const [round, records] of Object.entries(rounds)) {
    if (
      records.length !== campaignGoalIds.length
      || !sameOrdered(records.map(({ record }) => record.goalId), campaignGoalIds)
    ) {
      throw new Error(`B019 ${round} records do not match the exact ordered campaign`)
    }
    assertUnique(records.map(({ record }) => record.recordId), `B019 ${round} record IDs`)
  }

  const boundResolutionFiles: CandidateSet['sourceBindings']['resolutionFiles'] = resolutionFiles.map((pin) => {
    const sha256 = plannedResolutionHashes.get(pin.goalId)
    if (!sha256) throw new Error(`${pin.goalId}: missing planned resolution SHA-256`)
    return { goalId: pin.goalId, path: pin.path, sha256: `sha256:${sha256}` }
  })
  let verifiedCarryoverMaterializationPlanSha256: string | null = null
  if (carryoverMaterializationState === 'exact-after') {
    const synthesisManifestBytes = readBoundFile(
      synthesisPath,
      plannedSynthesisManifestSha256,
      'B019 stable-seven synthesis manifest',
    )
    const compatibilityReceiptBytes = readBoundFile(
      compatibilityReceiptPath,
      plannedCompatibilityReceiptSha256,
      'B019 stable-seven compatibility receipt',
    )
    const resolutionIndexBytes = readBoundFile(
      resolutionIndexPath,
      plannedResolutionIndexSha256,
      'B019 stable-seven resolution index',
    )
    const synthesisManifest = parseJson<GoalDescriptionRolloutSynthesisDecisionManifest>(
      synthesisManifestBytes,
      'B019 stable-seven synthesis manifest',
    )
    const compatibilityReceipt = parseJson<CompatibilityReceipt>(
      compatibilityReceiptBytes,
      'B019 stable-seven compatibility receipt',
    )
    const resolutionIndex = parseJson<ResolutionIndex>(
      resolutionIndexBytes,
      'B019 stable-seven resolution index',
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
      || synthesisManifest.batch.canonicalLandscapeDigest
        !== `sha256:${historicalCarryoverPins.canonical}`
      || synthesisManifest.rounds.first.runId !== expectedRoundARunId
      || synthesisManifest.rounds.first.resultsDigest !== digest(fixedSources.roundARecords)
      || synthesisManifest.rounds.second.runId !== expectedRoundBRunId
      || synthesisManifest.rounds.second.resultsDigest !== digest(fixedSources.roundBRecords)
      || synthesisManifest.decisions.length !== goalIds.length
      || !sameOrdered(synthesisManifest.decisions.map(({ goalId }) => goalId), goalIds)
      || fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(synthesisManifestPayload)
        !== manifestFingerprint
    ) throw new Error('Historical B019 synthesis manifest does not bind the exact seven-goal authority chain')

    const indexGroup = resolutionIndex.groups?.[0]
    if (
      resolutionIndex.schemaVersion !== 1
      || resolutionIndex.subject !== 'Mathematik'
      || resolutionIndex.semanticKind !== 'curricularAtomic'
      || resolutionIndex.strictDescriptionReviewCompleteCount !== goalIds.length
      || resolutionIndex.curriculumAtomicDenominator !== expectedCurriculumAtomicDenominator
      || resolutionIndex.descriptionReviewPercentage !== 0.9
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
    ) throw new Error('B019 resolution index must bind exactly 7/792 = 0.9%')

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
        `${pin.goalId} B019 resolution`,
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
      }>(resolutionBytes, `${pin.goalId} B019 resolution`)
    const first = rounds.first.find(({ record }) => record.goalId === pin.goalId)
    const second = rounds.second.find(({ record }) => record.goalId === pin.goalId)
    const selectedRound = selectedRoundByGoalId.get(pin.goalId)
    const selected = selectedRound === 'first' ? first : second
    const canonicalGoal = canonicalGoals.find(({ id }) => id === pin.goalId)
    const currentPage = currentSubset.pages.find(({ goalId }) => goalId === pin.goalId)
    const manifestDecision = synthesisManifest.decisions[index]
    if (
      !first
      || !second
      || !selectedRound
      || !selected
      || !canonicalGoal
      || !currentPage
      || !manifestDecision
    ) {
      throw new Error(`${pin.goalId}: missing review, adjudication, or canonical binding`)
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
      || resolutionBody.goal.goalFingerprint !== currentPage.goalFingerprint
      || resolutionBody.goal.pageFingerprint !== currentPage.pageFingerprint
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
      throw new Error(
        `${pin.goalId}: historical resolution conflicts with current compatible page/text or bound reviews`,
      )
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
      semanticKindLedger: historicalCarryoverPins.semanticKindLedger,
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
      {
        role: 'semanticKindLedger',
        path: semanticKindLedgerPath,
        sha256: `sha256:${historicalCarryoverPins.semanticKindLedger}`,
      },
    ]
    const receiptContexts = compatibilityReceipt.currentCanonicalContexts ?? []
  if (
    receiptContexts.length !== goalIds.length
    || !sameOrdered(receiptContexts.map(({ goalId }) => goalId ?? ''), goalIds)
  ) {
    throw new Error('B019 compatibility receipt does not bind the exact ordered current contexts')
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
      positiveEvidenceValidatedSeparately: true,
      productOwnerEscalationRequired: false,
    }
  if (
    compatibilityReceipt.schemaVersion !== 1
    || compatibilityReceipt.receiptId
      !== 'mathematik-rollout-v1-batch-019-stable-current-carryover-7-v1-20260829'
    || compatibilityReceipt.sourceBatchId !== expectedBatchId
    || compatibilityReceipt.sourceCampaignGoalCount !== campaignGoalIds.length
    || !sameOrdered(compatibilityReceipt.claimedGoalIds ?? [], goalIds)
    || compatibilityReceipt.claimedGoalCount !== goalIds.length
    || !sameOrdered(compatibilityReceipt.followUpGoalIds ?? [], followUpGoalIds)
    || compatibilityReceipt.followUpGoalCount !== followUpGoalIds.length
    || compatibilityReceipt.noWholeBatchProgressClaim !== true
    || !sameJson(compatibilityReceipt.selectedEvidenceRounds, expectedSelectedEvidenceRounds)
    || !sameJson(compatibilityReceipt.sourceBindings, expectedCarryoverSourceBindings)
    || compatibilityReceipt.currentCanonicalLandscape?.path !== canonicalPath
    || compatibilityReceipt.currentCanonicalLandscape.sha256
      !== `sha256:${historicalCarryoverPins.canonical}`
    || compatibilityReceipt.currentSemanticKindLedger?.path !== semanticKindLedgerPath
    || compatibilityReceipt.currentSemanticKindLedger.sha256
      !== `sha256:${historicalCarryoverPins.semanticKindLedger}`
    || compatibilityReceipt.currentSemanticKindLedger.totalGoalCount !== expectedCanonicalGoalCount
    || compatibilityReceipt.currentSemanticKindLedger.curriculumAtomicDenominator
      !== expectedCurriculumAtomicDenominator
    || compatibilityReceipt.currentGoalBook?.configPath
      !== 'app/scripts/config/goal-books/de-gym-math-national-atlas.json'
    || compatibilityReceipt.currentGoalBook.digest
      !== `sha256:${historicalCarryoverPins.goalBook}`
    || compatibilityReceipt.currentGoalBook.currentB019SubsetDigest
      !== `sha256:${historicalCarryoverPins.subset}`
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
    throw new Error('B019 compatibility receipt does not preserve the bounded stable-seven contract')
  }
  const receiptBody = { ...compatibilityReceipt }
  delete receiptBody.materializationPlanSha256
  const reconstructedCarryoverPlanSha256 = sha256Hex(jsonBytes({
    materializationContract: 'math-b019-stable7-hardlink-no-clobber-v2',
    sourceHashes: carryoverSourceHashes,
    currentPostStateHashes: {
      canonical: historicalCarryoverPins.canonical,
      goalBook: historicalCarryoverPins.goalBook,
      semanticKindLedger: historicalCarryoverPins.semanticKindLedger,
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
      || reconstructedCarryoverPlanSha256 !== historicalCarryoverPins.materializationPlan
    ) {
      throw new Error('B019 compatibility receipt materialization plan cannot be reconstructed exactly')
    }
    const reconstructedProducerPlanSha256 = sha256Hex(jsonBytes({
      materializationPlanSha256: reconstructedCarryoverPlanSha256,
      outputs: carryoverOutputs.map(({ path, sha256 }) => ({
        path,
        sha256,
        mode: publishedFileMode,
      })),
      stagingSuffix: '.b019-stable-seven-staging',
      modes: {
        outputFile: publishedFileMode,
        ownedDirectory: ownedDirectoryMode,
      },
    }))
    if (
      reconstructedProducerPlanSha256 !== carryoverProducerPlanSha256
      || reconstructedProducerPlanSha256 !== historicalCarryoverPins.producerPlan
    ) {
      throw new Error('B019 carryover-v2 outer producer plan cannot be reconstructed exactly')
    }
    verifiedCarryoverMaterializationPlanSha256 = reconstructedCarryoverPlanSha256
  } else if (writeMode || checkMode) {
    throw new Error(
      `B019 evidence mutation/check requires carryover sources exact-after; state=${carryoverMaterializationState}`,
    )
  }

  if (verifiedCarryoverMaterializationPlanSha256 === null) {
    throw new Error('B019 compatibility receipt materialization plan cannot be reconstructed exactly')
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
    if (
      summary.agreement !== 'disagreement'
      || summary.firstRecordId !== first.record.recordId
      || summary.secondRecordId !== second.record.recordId
      || summary.firstRunId !== expectedRoundARunId
      || summary.secondRunId !== expectedRoundBRunId
      || summary.firstDecision !== 'keep'
      || summary.secondDecision !== 'keep'
      || summary.requiresSynthesis !== true
      || summary.automaticAcceptance !== false
      || adjudicationDecision.roundA?.recordId !== first.record.recordId
      || adjudicationDecision.roundA.decision !== 'keep'
      || adjudicationDecision.roundB?.recordId !== second.record.recordId
      || adjudicationDecision.roundB.decision !== 'keep'
      || adjudicationDecision.resolutionDecision !== 'keep_current'
      || adjudicationDecision.evidenceRound !== selectedRound
      || adjudicationDecision.evidenceRecordId !== selected.record.recordId
      || adjudicationDecision.progressCounted !== false
    ) {
      throw new Error(`${goalId}: selected evidence conflicts with B019 dual-summary or adjudication authority`)
    }
    for (const [label, bound] of [['selected', selected], ['alternate', alternate]] as const) {
      if (
        bound.record.decision !== 'keep'
        || bound.record.evidenceProfileContract !== 'positive-understanding-evidence-v2'
        || bound.record.evidenceProfileRecommendation !== 'create'
        || bound.record.recordStatus !== 'candidate'
        || bound.record.reviewAuthority !== 'ai_candidate'
      ) {
        throw new Error(`${goalId}: ${label} review is not a KEEP positive-evidence V2 AI candidate`)
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
      dissent: [
        `B019 evidence-formulation dissent remains bound: selected ${selectedLabel} record ${selected.record.recordId} (${selected.digest}); compatible ${alternateLabel} record ${alternate.record.recordId} (${alternate.digest}) remains preserved by the dual-summary, third adjudication (${digest(fixedSources.adjudication)}), and carryover-v2 resolution plan (sha256:${plannedResolutionSha256}).`,
      ],
      profile,
    }
  })

  if (candidates.some(({ goalId }) => followUpGoalIds.includes(goalId as typeof followUpGoalIds[number]))) {
    throw new Error('B019 stable-seven evidence candidates must not claim a follow-up goal')
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
      label: 'Canonical Mathematics positive understanding-evidence rollout v1 batch 019: seven stable Q2 lines-and-planes goals',
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
      bindingContract: 'math-b019-stable7-positive-evidence-sources-v1',
      batchId: expectedBatchId,
      campaignGoalIds,
      stableGoalIds: goalIds,
      followUpGoalIds,
      sources: [
        ...fixedSourceSpecifications.map(({ role, path, sha256 }) => ({
          role,
          path,
          sha256: `sha256:${sha256}` as `sha256:${string}`,
        })),
        {
          role: 'historical_math_b019_stable7_carryover_v2_materializer',
          path: carryoverMaterializerPath,
          sha256: `sha256:${actualCarryoverMaterializerSha256}` as `sha256:${string}`,
        },
        {
          role: 'current_post_b020_canonical_math',
          path: canonicalPath,
          sha256: digest(canonicalBytes),
        },
        {
          role: 'current_post_b020_math_semantic_kind_ledger',
          path: semanticKindLedgerPath,
          sha256: digest(semanticKindLedgerBytes),
        },
        {
          role: 'math_b019_stable7_synthesis_manifest',
          path: synthesisPath,
          sha256: `sha256:${plannedSynthesisManifestSha256}` as `sha256:${string}`,
        },
        {
          role: 'math_b019_stable7_compatibility_receipt',
          path: compatibilityReceiptPath,
          sha256: `sha256:${plannedCompatibilityReceiptSha256}` as `sha256:${string}`,
        },
        {
          role: 'math_b019_stable7_resolution_index',
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
    throw new Error('Generic candidate materializer did not return seven E1/G1 AI review candidates')
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
    materializationContract: 'math-b019-stable7-positive-evidence-hardlink-no-clobber-v2',
    actualSourceBindings: candidateSet.sourceBindings.sources,
    currentContextDigests: {
      canonical: actualCanonicalSha256,
      semanticKindLedger: actualSemanticKindLedgerSha256,
      goalBook: currentGoalBookSha256,
      subset: currentSubsetDigest.replace(/^sha256:/u, ''),
    },
    historicalCarryoverDigests: {
      producerPlan: carryoverProducerPlanSha256,
      materializationPlan: verifiedCarryoverMaterializationPlanSha256,
    },
    resolutionFiles: boundResolutionFiles,
    campaignGoalIds,
    stableGoalIds: goalIds,
    followUpGoalIds,
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
    throw new Error(`B019 stable-seven evidence plan drift: ${planSha256} != ${expectedPlanSha256}`)
  }
  return {
    outputs,
    planSha256,
    historicalCarryoverProducerPlanSha256: carryoverProducerPlanSha256,
    historicalCarryoverMaterializationState: carryoverMaterializationState,
    currentPins: {
      canonical: actualCanonicalSha256,
      semanticKindLedger: actualSemanticKindLedgerSha256,
      goalBook: currentGoalBookSha256,
      subset: currentSubsetDigest.replace(/^sha256:/u, ''),
    },
    historicalPins: {
      carryoverMaterializer: actualCarryoverMaterializerSha256,
      carryoverProducerPlan: carryoverProducerPlanSha256,
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
  assertRealParentChain(path, `B019 stable-seven evidence ${role}`)
  if (!stat.isFile()) throw new Error(`B019 evidence ${role} has unknown non-file state: ${path}`)
  assertMode(stat.mode, mode, `B019 stable-seven evidence ${role} ${path}`)
  const actualSha256 = sha256Hex(readFileSync(candidate))
  const expectedSha256 = sha256Hex(bytes)
  if (actualSha256 !== expectedSha256) {
    throw new Error(
      `B019 evidence ${role} has unknown bytes: ${path}: ${actualSha256} != ${expectedSha256}`,
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
  throw new Error(`B019 evidence write lock exists at ${writeLockPath}; inspect it as stale crash residue`)
}

const assertOwnedDirectory = (path: string, role: string): void => {
  const candidate = absolute(path)
  assertRealDirectory(candidate, role)
  assertMode(lstatSync(candidate).mode, ownedDirectoryMode, role)
}

const assertWriteLockHeld = (): void => {
  assertOwnedDirectory(writeLockPath, 'B019 stable-seven evidence write lock')
}

const acquireWriteLock = (): void => {
  assertRealParentChain(writeLockPath, 'B019 evidence write lock')
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
    throw new Error(`B019 evidence write lock contains unknown residue: ${writeLockPath}`)
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
    || left.historicalCarryoverProducerPlanSha256
      !== right.historicalCarryoverProducerPlanSha256
    || left.historicalCarryoverMaterializationState
      !== right.historicalCarryoverMaterializationState
    || !sameJson(left.currentPins, right.currentPins)
    || !sameJson(left.historicalPins, right.historicalPins)
    || left.outputs.length !== right.outputs.length
    || left.outputs.some((output, index) => (
      output.path !== right.outputs[index].path
      || output.mode !== right.outputs[index].mode
      || !output.bytes.equals(right.outputs[index].bytes)
    ))
  ) {
    throw new Error(`${role}: B019 evidence inputs or deterministic output plan drifted`)
  }
}

const main = async (): Promise<void> => {
  if (writeMode || checkMode) assertMutationPinsBound()
  assertWriteLockAbsent()
  const initialPlan = await buildPlan()
  if (expectedPlanSha256 !== 'PENDING' && initialPlan.planSha256 !== expectedPlanSha256) {
    throw new Error(`B019 stable-seven evidence plan drift: ${initialPlan.planSha256} != ${expectedPlanSha256}`)
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
  const privateWorkTag = '.b019-stable7-evidence-prepare-'
  const privatePayloadName = 'prepared-output'
  const privateWorkPrefix = (output: PlannedOutput): string => {
    const outputSha256 = plannedOutputSha256.get(output.path)
    if (!outputSha256) throw new Error(`${output.path}: missing B019 evidence output SHA-256`)
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
    assertRealDirectory(outputParent, 'B019 evidence shared output parent')
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
        throw new Error(`Unknown adjacent B019 evidence staging path: ${entryPath}`)
      }
      if (!entry.name.startsWith(privateWorkTag)) continue
      const matches = definitions.filter(({ prefix }) => entry.name.startsWith(prefix))
      if (matches.length !== 1 || !entry.isDirectory()) {
        throw new Error(`Unknown B019 evidence private preparation entry: ${entryPath}`)
      }
      assertOwnedDirectory(entryPath, 'B019 evidence private preparation directory')
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
      ) throw new Error(`Unknown B019 evidence private preparation contents: ${entryPath}`)
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
      assertOwnedDirectory(residue.directory, 'B019 evidence private preparation recovery directory')
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
      throw new Error('B019 evidence private residue recovery did not converge to zero')
    }
  }
  const assertCurrentInputsAndPlan = async (role: string): Promise<void> => {
    assertWriteLockHeld()
    const rebound = await buildPlan()
    assertSamePlan(initialPlan, rebound, role)
    if (expectedPlanSha256 === 'PENDING' || rebound.planSha256 !== expectedPlanSha256) {
      throw new Error(`${role}: B019 evidence expected plan pin is absent or drifted`)
    }
  }
  const privateWorkDirectory = (output: PlannedOutput): string => {
    assertWriteLockHeld()
    assertRealDirectory(outputParent, 'B019 evidence shared output parent')
    const nonce = randomBytes(16).toString('hex')
    const directory = mkdtempSync(resolve(
      outputParent,
      `${privateWorkPrefix(output)}${process.pid}-${nonce}-`,
    ))
    chmodSync(directory, ownedDirectoryMode)
    assertOwnedDirectory(directory, 'new B019 evidence private preparation directory')
    return directory
  }
  const unlinkPrivateExactFile = (
    output: PlannedOutput,
    preparation: string,
    directory: string,
  ): void => {
    assertWriteLockHeld()
    assertOwnedDirectory(directory, 'B019 evidence private preparation directory')
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
    ))) throw new Error('B019 evidence full staging left an unstaged output')
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
      'B019 evidence --check requires exact-after, zero staging, and zero private residue; '
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
        throw new Error(`B019 evidence staging left ${privateResidues.length} private residue(s)`)
      }
      await assertCurrentInputsAndPlan('Immediate pre-publish rebind')
      for (const output of initialPlan.outputs) publishNoClobber(output)
      await assertCurrentInputsAndPlan('Post-publish rebind')
      materialization = classifyMaterialization(inspectPrivateResidues().length)
      if (materialization.state !== 'exact-after') {
        throw new Error(`B019 evidence post-write state is ${materialization.state}`)
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
    historicalCarryoverProducerPlanSha256: initialPlan.historicalCarryoverProducerPlanSha256,
    historicalCarryoverMaterializationState: initialPlan.historicalCarryoverMaterializationState,
    currentPins: initialPlan.currentPins,
    historicalPins: initialPlan.historicalPins,
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
