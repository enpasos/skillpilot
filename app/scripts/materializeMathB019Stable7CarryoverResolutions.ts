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
import { buildGoalDescriptionRolloutResolutionSynthesis } from './goalDescriptionRolloutResolutionSynthesis'
import {
  buildGoalDescriptionRolloutSubsetModel,
  materializeGoalDescriptionRolloutBatchDualSummary,
} from './materializeGoalDescriptionRolloutBatch'
import {
  buildGoalDescriptionDualRoundResolution,
  extractGoalDescriptionDualRoundResolutionSource,
  fingerprintGoalDescriptionReviewContext,
  validateGoalDescriptionDualRoundResolution,
} from './validateGoalDescriptionDualRoundResolution'
import { buildGoalDescriptionCanonicalContext } from './validateGoalDescriptionReviewCampaign'
import {
  buildGoalDescriptionRolloutSynthesisRoundBinding,
  fingerprintGoalDescriptionRolloutSynthesisDecisionManifest,
  validateGoalDescriptionRolloutSynthesisDecisionManifest,
  type GoalDescriptionRolloutSynthesisDecisionManifest,
  type GoalDescriptionRolloutSynthesisExpectedGoal,
  type GoalDescriptionSynthesisDigest,
} from './validateGoalDescriptionRolloutSynthesisDecisionManifest'

type ReviewRound = 'first' | 'second'
type Adjudication = {
  schemaVersion?: number
  validationContract?: string
  artifactType?: string
  batchId?: string
  subject?: string
  landscapeId?: string
  authority?: string
  materialized?: boolean
  noProgressClaim?: boolean
  campaignGoalCount?: number
  resolvedGoalCount?: number
  inputBinding?: {
    configSha256?: string
    batchManifestSha256?: string
    bookModelSha256?: string
    bundleManifestSha256?: string
    bundleReviewInputSha256?: string
    bundleReviewInputJsonlSha256?: string
    dualSummarySha256?: string
    bundleFingerprint?: string
    reviewInputFingerprint?: string
    roundA?: { runManifestSha256?: string; recordsSha256?: string; runId?: string }
    roundB?: { runManifestSha256?: string; recordsSha256?: string; runId?: string }
  }
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
    rationale?: string
  }>
}
type SemanticKindLedger = {
  documentType?: unknown
  sourceLandscapePath?: unknown
  counts?: { curricularAtomic?: unknown; total?: unknown }
  decisions?: Array<{
    goalId?: unknown
    semanticKind?: unknown
    decisionStatus?: unknown
  }>
}
type PlannedOutput = { path: string; bytes: Buffer; mode: typeof outputFileMode }
type TargetState = 'absent' | 'exact-after'
type StagingState = 'absent' | 'exact-staged'
type MaterializationState = 'exact-before' | 'resumable-mixed' | 'exact-after'
type RealDirectoryState = 'absent' | 'real-directory'
type ClassifiedOutput = PlannedOutput & { targetState: TargetState; stagingState: StagingState }
type ClassifiedMaterialization = {
  state: MaterializationState
  outputs: ClassifiedOutput[]
  absentTargetCount: number
  exactAfterTargetCount: number
  absentStagingCount: number
  exactStagedCount: number
}
type BuiltPlan = {
  outputs: PlannedOutput[]
  planSha256: string
  currentCanonicalSha256: string
  currentSemanticKindLedgerSha256: string
  currentGoalBookDigest: string
  currentSubsetDigest: string
  curriculumAtomicDenominator: number
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
const expectedBaseGoalBookConfigPath = 'app/scripts/config/goal-books/de-gym-math-national-atlas.json'
const expectedCanonicalGoalCount = 1174
const expectedCurriculumAtomicDenominator = 792
const expectedProjectedAtomicGoalCount = 919
const expectedExcludedTargetAtomicGoalCount = 127
const outputFileMode = 0o644 as const
const ownedDirectoryMode = 0o700 as const

const outputStem = 'stable-current-carryover-7-v1'
const synthesisRelativePath = `synthesis-decisions.${outputStem}.json`
const synthesisPath = `${batchDirectory}/${synthesisRelativePath}`
const resolutionDirectoryName = `resolutions-${outputStem}`
const resolutionDirectoryPath = `${batchDirectory}/${resolutionDirectoryName}`
const indexPath = `${batchDirectory}/resolution-index.${outputStem}.json`
const receiptPath = `${batchDirectory}/${outputStem}.compatibility-receipt.json`
const writeLockPath = `${batchDirectory}/.${outputStem}.write-lock`
const stagingSuffix = '.b019-stable-seven-staging'
const stagingPath = (path: string): string => `${path}${stagingSuffix}`

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
  semanticKindLedger: '674fcbe3b671abdc02a48f63d57c90df7a04146303d13d9139477d4671092e5c',
} as const

const expectedPostStateHashes = {
  canonical: 'b0b9e06c17430e98748d69533091ff14cfb0fa7d1946a21d8ca698f61cb1af7c',
  goalBook: '7697a5410dc1fad6b8eff2a462d7739fb409530f2197ce9e4030a7d7049b275f',
} as const
const expectedPlanSha256 = '3ecd1f0ac6e2dd28196dd54963fdd9234b70ac449c34bb17334dbb0e6b986425'

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

const selectionRationaleByGoalId = new Map<string, { de: string; en: string }>([
  ['36e0de23-1e3b-5c69-888f-e5e19e79cbbe', {
    de: 'Runde B ist bei Normierung, Vorzeichen, Betrag und Invarianz am vollständigsten.',
    en: 'Both reviews support the current advanced-course competency. Round B is more complete on normalization, sign, absolute value, and invariance.',
  }],
  ['d76766a5-ce07-5c7a-987b-157f2998b05e', {
    de: 'Runde B trennt den vollständigen Wechsel zwischen drei Ebenenformen besonders klar vom engeren Zweiformen-Ziel und prüft die Invarianz der Punktmenge.',
    en: 'The source explicitly requires converting plane representations. Round B best distinguishes the complete three-form conversion from the focused two-form goal and verifies point-set invariance.',
  }],
  ['27cfa1b3-be6f-5f81-b9a2-ae3bad9c14b6', {
    de: 'Runde B unterscheidet Rang, Konsistenz und freie Variablen besonders klar von einer bloßen Zählung der Gleichungen.',
    en: 'Both reviews support the current modeling-and-solving competency. Round B better distinguishes rank, consistency, and free variables from mere equation counting.',
  }],
  ['7aa1abee-d6ec-528a-b110-f2260b0cda51', {
    de: 'Runde B macht den Unterschied zwischen Trägergerade und begrenzter Strecke am deutlichsten.',
    en: 'Both reviews support the current point-test competence. Round B makes the supporting-line versus bounded-segment distinction most explicit.',
  }],
  ['a9fde754-51b4-58d7-85e5-5e36160581e6', {
    de: 'Runde A bewahrt die notwendigen Sonderfälle einer leeren Schnittmenge und einer vollständig enthaltenen Geraden ohne Erweiterung des kanonischen Ziels.',
    en: 'Both reviews support the current trace-point competence. Round A preserves the intrinsic empty and contained-line cases without expanding the canonical wording.',
  }],
  ['edaf0bb4-e12e-5a6c-b484-91124ba209f3', {
    de: 'Runde A trennt Scharparameter und Laufparameter zweisprachig am klarsten.',
    en: 'Both reviews support the current advanced-course competence. Round A has the cleaner bilingual distinction between family and running parameter.',
  }],
  ['fd4b7145-5c28-5b33-bf2e-0ca68f29f2fc', {
    de: 'Runde B trennt Scharparameter, Raumvariablen, Entartung und bloße Darstellungsskalierung am vollständigsten.',
    en: 'Both reviews support the current advanced-course competence. Round B most clearly distinguishes family parameters, spatial variables, degeneracy, and representational scaling.',
  }],
])

const sha256Hex = (value: Buffer | string): string => (
  createHash('sha256').update(value).digest('hex')
)
const digest = (value: Buffer | string): `sha256:${string}` => `sha256:${sha256Hex(value)}`
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const sameOrdered = (left: readonly string[], right: readonly string[]): boolean => (
  left.length === right.length && left.every((value, index) => value === right[index])
)
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

const assertUnique = (values: readonly string[], role: string): void => {
  if (new Set(values).size !== values.length) throw new Error(`${role} contains duplicate goal IDs`)
}

const assertPinnedHash = (role: string, value: string): void => {
  if (!/^[0-9a-f]{64}$/u.test(value)) throw new Error(`${role} is not a lowercase SHA-256 hex digest`)
}

const assertOptionalPinsWellFormed = (): void => {
  for (const [role, value] of Object.entries(expectedPostStateHashes)) {
    if (value !== 'PENDING') assertPinnedHash(`expectedPostStateHashes.${role}`, value)
  }
  if (expectedPlanSha256 !== 'PENDING') assertPinnedHash('expectedPlanSha256', expectedPlanSha256)
}

const assertMutationPinsBound = (): void => {
  for (const [role, value] of Object.entries(expectedPostStateHashes)) {
    if (value === 'PENDING') {
      throw new Error(`Refusing mutation/check while expectedPostStateHashes.${role} is PENDING`)
    }
  }
  if (expectedPlanSha256 === 'PENDING') {
    throw new Error('Refusing mutation/check while expectedPlanSha256 is PENDING')
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
    || selectionRationaleByGoalId.size !== goalIds.length
  ) {
    throw new Error('B019 carryover scope must be exactly 19 = 7 stable + 12 follow-up')
  }
  const partition = [...goalIds, ...followUpGoalIds]
  if (
    new Set(partition).size !== campaignGoalIds.length
    || !campaignGoalIds.every((goalId) => partition.includes(goalId))
  ) {
    throw new Error('B019 stable and follow-up scopes must form a disjoint full campaign partition')
  }
}

const sourceSpecifications = [
  { key: 'config', path: sourceConfigPath, sha256: sourceHashes.config },
  { key: 'batchManifest', path: batchManifestPath, sha256: sourceHashes.batchManifest },
  { key: 'bookModel', path: bookModelPath, sha256: sourceHashes.bookModel },
  { key: 'bundleManifest', path: bundleManifestPath, sha256: sourceHashes.bundleManifest },
  { key: 'bundleReviewInput', path: bundleReviewInputPath, sha256: sourceHashes.bundleReviewInput },
  { key: 'bundleReviewInputJsonl', path: bundleReviewInputJsonlPath, sha256: sourceHashes.bundleReviewInputJsonl },
  { key: 'dualSummary', path: dualSummaryPath, sha256: sourceHashes.dualSummary },
  { key: 'adjudication', path: adjudicationPath, sha256: sourceHashes.adjudication },
  { key: 'roundARecords', path: roundARecordsPath, sha256: sourceHashes.roundARecords },
  { key: 'roundARun', path: roundARunPath, sha256: sourceHashes.roundARun },
  { key: 'roundBRecords', path: roundBRecordsPath, sha256: sourceHashes.roundBRecords },
  { key: 'roundBRun', path: roundBRunPath, sha256: sourceHashes.roundBRun },
  { key: 'semanticKindLedger', path: semanticKindLedgerPath, sha256: sourceHashes.semanticKindLedger },
] as const

type BoundSources = Record<typeof sourceSpecifications[number]['key'], Buffer>

const loadBoundSources = (): BoundSources => Object.fromEntries(
  sourceSpecifications.map(({ key, path, sha256 }) => [
    key,
    readBoundFile(path, sha256, `Bound B019 ${key} source`),
  ]),
) as BoundSources

const buildPlan = async (): Promise<BuiltPlan> => {
  assertOptionalPinsWellFormed()
  verifyStaticScope()
  const sources = loadBoundSources()
  const sourceConfig = parseJson<{ batchId?: string; subject?: string; goalIds?: string[] }>(
    sources.config,
    'B019 config',
  )
  const batchManifest = parseJson<{
    batchId?: string
    subject?: string
    goalIds?: string[]
    curriculumAtomicDenominatorAtPreparation?: number
    source?: { baseGoalBookConfigPath?: string; landscapePath?: string; landscapeId?: string }
    artifacts?: {
      bookModelDigest?: string
      bundleFingerprint?: string
      reviewInputFingerprint?: string
    }
  }>(sources.batchManifest, 'B019 batch manifest')
  const bookModel = parseJson<{
    digest?: string
    book?: { id?: string; title?: string; landscapeId?: string; pageCount?: number }
  }>(sources.bookModel, 'B019 imported book model')
  const bundleManifest = parseJson<{
    bookModelDigest?: string
    selectedGoalCount?: number
    goals?: Array<{ goalId?: string }>
    bundleFingerprint?: string
  }>(sources.bundleManifest, 'B019 bundle manifest')
  const adjudication = parseJson<Adjudication>(sources.adjudication, 'B019 third adjudication')
  const batchArtifacts = batchManifest.artifacts
  if (!batchArtifacts) throw new Error('B019 batch manifest has no artifacts binding')
  if (
    sourceConfig.batchId !== expectedBatchId
    || sourceConfig.subject !== 'mathematik'
    || !sameOrdered(sourceConfig.goalIds ?? [], campaignGoalIds)
    || batchManifest.batchId !== expectedBatchId
    || batchManifest.subject !== 'mathematik'
    || !sameOrdered(batchManifest.goalIds ?? [], campaignGoalIds)
    || batchManifest.curriculumAtomicDenominatorAtPreparation
      !== expectedCurriculumAtomicDenominator
    || batchManifest.source?.baseGoalBookConfigPath !== expectedBaseGoalBookConfigPath
    || batchManifest.source.landscapePath !== canonicalPath
    || batchManifest.source.landscapeId !== landscapeId
    || batchArtifacts.bookModelDigest !== bookModel.digest
    || batchArtifacts.bundleFingerprint !== bundleManifest.bundleFingerprint
    || bundleManifest.bookModelDigest !== bookModel.digest
    || bundleManifest.selectedGoalCount !== campaignGoalIds.length
    || !sameOrdered(bundleManifest.goals?.map(({ goalId }) => goalId ?? '') ?? [], campaignGoalIds)
    || bookModel.book?.landscapeId !== landscapeId
    || bookModel.book.pageCount !== campaignGoalIds.length
  ) {
    throw new Error('B019 config, batch, imported GoalBook, or bundle identity is invalid')
  }

  if (
    adjudication.schemaVersion !== 1
    || adjudication.validationContract !== 'goal-description-third-adjudication-v1'
    || adjudication.artifactType !== 'third_adjudication'
    || adjudication.batchId !== expectedBatchId
    || adjudication.subject !== 'mathematik'
    || adjudication.landscapeId !== landscapeId
    || adjudication.authority !== 'third_non_blind_subject_adjudication'
    || adjudication.materialized !== false
    || adjudication.noProgressClaim !== true
    || adjudication.campaignGoalCount !== campaignGoalIds.length
    || adjudication.resolvedGoalCount !== 0
    || !sameOrdered(adjudication.stableCurrentGoalIds ?? [], goalIds)
    || !sameOrdered(adjudication.requiredFollowUpGoalIds ?? [], followUpGoalIds)
    || adjudication.decisions?.length !== campaignGoalIds.length
    || !sameOrdered(adjudication.decisions.map(({ goalId }) => goalId ?? ''), campaignGoalIds)
  ) {
    throw new Error('B019 third adjudication does not authorize exactly this stable-seven carryover')
  }
  if (
    adjudication.inputBinding?.configSha256 !== sourceHashes.config
    || adjudication.inputBinding.batchManifestSha256 !== sourceHashes.batchManifest
    || adjudication.inputBinding.bookModelSha256 !== sourceHashes.bookModel
    || adjudication.inputBinding.bundleManifestSha256 !== sourceHashes.bundleManifest
    || adjudication.inputBinding.bundleReviewInputSha256 !== sourceHashes.bundleReviewInput
    || adjudication.inputBinding.bundleReviewInputJsonlSha256 !== sourceHashes.bundleReviewInputJsonl
    || adjudication.inputBinding.dualSummarySha256 !== sourceHashes.dualSummary
    || adjudication.inputBinding.bundleFingerprint !== bundleManifest.bundleFingerprint
    || adjudication.inputBinding.reviewInputFingerprint !== batchArtifacts.reviewInputFingerprint
    || adjudication.inputBinding.roundA?.runManifestSha256 !== sourceHashes.roundARun
    || adjudication.inputBinding.roundA.recordsSha256 !== sourceHashes.roundARecords
    || adjudication.inputBinding.roundA.runId !== expectedRoundARunId
    || adjudication.inputBinding.roundB?.runManifestSha256 !== sourceHashes.roundBRun
    || adjudication.inputBinding.roundB.recordsSha256 !== sourceHashes.roundBRecords
    || adjudication.inputBinding.roundB.runId !== expectedRoundBRunId
  ) {
    throw new Error('B019 adjudication input hashes do not match the bound config, bundle, or reviews')
  }

  const dual = await materializeGoalDescriptionRolloutBatchDualSummary(sourceConfigPath, false)
  if (
    !dual.bytes.equals(sources.dualSummary)
    || dual.prepared.manifest.batchId !== expectedBatchId
    || !sameOrdered(dual.prepared.manifest.goalIds, campaignGoalIds)
    || dual.prepared.manifest.curriculumAtomicDenominatorAtPreparation
      !== expectedCurriculumAtomicDenominator
    || dual.prepared.manifest.source.baseGoalBookConfigPath !== expectedBaseGoalBookConfigPath
    || dual.prepared.manifest.source.landscapePath !== canonicalPath
    || dual.prepared.manifest.artifacts.bundleFingerprint !== bundleManifest.bundleFingerprint
    || dual.prepared.manifest.artifacts.reviewInputFingerprint
      !== batchArtifacts.reviewInputFingerprint
    || dual.summary.goalCount !== campaignGoalIds.length
    || !sameOrdered(dual.summary.goals.map(({ goalId }) => goalId), campaignGoalIds)
  ) {
    throw new Error('Fresh B019 dual-round validation disagrees with the exact bound source artifacts')
  }

  const canonicalBytes = expectedPostStateHashes.canonical === 'PENDING'
    ? readRegularFile(canonicalPath, 'Post-B019 current canonical Mathematics landscape')
    : readBoundFile(
      canonicalPath,
      expectedPostStateHashes.canonical,
      'Post-B019 current canonical Mathematics landscape',
    )
  const landscape = parseJson<{
    landscapeId?: string
    subject?: string
    goals?: Array<Record<string, unknown>>
  }>(canonicalBytes, 'Post-B019 current canonical Mathematics landscape')
  if (
    landscape.landscapeId !== landscapeId
    || landscape.subject !== 'Mathematik'
    || !Array.isArray(landscape.goals)
    || landscape.goals.length !== expectedCanonicalGoalCount
  ) {
    throw new Error('Post-B019 canonical Mathematics identity or goals array is invalid')
  }
  const canonicalGoals = landscape.goals
  const canonicalGoalIds = canonicalGoals.map((goal) => String(goal.id ?? ''))
  assertUnique(canonicalGoalIds, 'Post-B019 canonical Mathematics landscape')
  if (
    canonicalGoalIds.some((goalId) => goalId === '')
    || !campaignGoalIds.every((goalId) => canonicalGoalIds.includes(goalId))
  ) {
    throw new Error('At least one B019 campaign goal is missing from post-integration canonical Mathematics')
  }

  const semanticKindLedger = parseJson<SemanticKindLedger>(
    sources.semanticKindLedger,
    'Bound B019 Mathematics semantic-kind ledger',
  )
  const ledgerDecisions = semanticKindLedger.decisions
  if (!Array.isArray(ledgerDecisions)) {
    throw new Error('Bound B019 Mathematics semantic-kind ledger has no decisions array')
  }
  const ledgerGoalIds = ledgerDecisions.map(({ goalId }) => (
    typeof goalId === 'string' ? goalId : ''
  ))
  const curricularAtomicGoalIds = ledgerDecisions.flatMap((decision) => (
    decision.semanticKind === 'curricularAtomic'
    && decision.decisionStatus === 'authoritative'
    && typeof decision.goalId === 'string'
      ? [decision.goalId]
      : []
  ))
  const curricularAtomicGoalIdSet = new Set(curricularAtomicGoalIds)
  if (
    semanticKindLedger.documentType !== 'semantic-kind-ledger'
    || semanticKindLedger.sourceLandscapePath !== canonicalPath
    || semanticKindLedger.counts?.total !== expectedCanonicalGoalCount
    || semanticKindLedger.counts.curricularAtomic !== expectedCurriculumAtomicDenominator
    || ledgerDecisions.length !== expectedCanonicalGoalCount
    || ledgerGoalIds.some((goalId) => goalId === '')
    || new Set(ledgerGoalIds).size !== expectedCanonicalGoalCount
    || canonicalGoalIds.some((goalId) => !ledgerGoalIds.includes(goalId))
    || ledgerGoalIds.some((goalId) => !canonicalGoalIds.includes(goalId))
    || curricularAtomicGoalIds.length !== expectedCurriculumAtomicDenominator
    || curricularAtomicGoalIdSet.size !== expectedCurriculumAtomicDenominator
    || campaignGoalIds.some((goalId) => !curricularAtomicGoalIdSet.has(goalId))
  ) {
    throw new Error(
      'Bound B019 Mathematics semantic-kind ledger path, 1174/792 counts, unique IDs, '
      + 'canonical membership, or campaign membership changed',
    )
  }

  const currentBase = await loadGoalBookBuildInputs(expectedBaseGoalBookConfigPath, repositoryRoot)
  if (
    expectedPostStateHashes.goalBook !== 'PENDING'
    && currentBase.model.digest !== `sha256:${expectedPostStateHashes.goalBook}`
  ) {
    throw new Error(
      `Post-B019 current GoalBook drift: ${currentBase.model.digest} != sha256:${expectedPostStateHashes.goalBook}`,
    )
  }
  if (
    currentBase.model.book.landscapeId !== landscapeId
    || currentBase.model.book.pageCount !== expectedCurriculumAtomicDenominator
    || currentBase.model.pages.length !== expectedCurriculumAtomicDenominator
    || currentBase.model.book.projectedAtomicGoalCount !== expectedProjectedAtomicGoalCount
    || currentBase.model.book.excludedTargetAtomicGoalCount
      !== expectedExcludedTargetAtomicGoalCount
    || currentBase.model.excludedTargetGoals.length !== expectedExcludedTargetAtomicGoalCount
    || currentBase.model.book.projectedAtomicGoalCount
      !== currentBase.model.pages.length + currentBase.model.excludedTargetGoals.length
  ) {
    throw new Error('Post-B019 GoalBook must prove 919 projected = 792 pages + 127 excluded targets')
  }
  const currentPageGoalIds = currentBase.model.pages.map(({ goalId }) => goalId)
  if (
    new Set(currentPageGoalIds).size !== expectedCurriculumAtomicDenominator
    || currentPageGoalIds.some((goalId) => !curricularAtomicGoalIdSet.has(goalId))
    || curricularAtomicGoalIds.some((goalId) => !currentPageGoalIds.includes(goalId))
  ) {
    throw new Error('Current GoalBook pages are not the exact unique 792 curricularAtomic ledger goals')
  }
  const currentSubset = buildGoalDescriptionRolloutSubsetModel({
    baseModel: currentBase.model,
    goalIds: [...campaignGoalIds],
    bookId: dual.prepared.model.book.id,
    title: dual.prepared.model.book.title,
  })
  if (currentSubset.pages.length !== campaignGoalIds.length) {
    throw new Error('Post-B019 current GoalBook subset does not contain the exact campaign')
  }

  const expectedGoals: GoalDescriptionRolloutSynthesisExpectedGoal[] = []
  const sourceByGoalId = new Map<string, {
    first: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
    second: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
  }>()
  const currentCanonicalContexts: Array<{
    goalId: string
    canonicalContext: ReturnType<typeof buildGoalDescriptionCanonicalContext>
    fingerprint: GoalDescriptionSynthesisDigest
  }> = []
  for (const goalId of goalIds) {
    const first = extractGoalDescriptionDualRoundResolutionSource({
      artifacts: dual.first,
      goalId,
      label: 'First',
    })
    const second = extractGoalDescriptionDualRoundResolutionSource({
      artifacts: dual.second,
      goalId,
      label: 'Second',
    })
    const sourceErrors = [...first.errors, ...second.errors]
    const firstSource = first.source
    const secondSource = second.source
    if (sourceErrors.length > 0 || !firstSource?.record || !secondSource?.record) {
      throw new Error(`${goalId}: ${sourceErrors.join(' | ') || 'missing exact blind-review source record'}`)
    }
    if (firstSource.decision !== 'keep' || secondSource.decision !== 'keep') {
      throw new Error(`${goalId}: stable carryover requires two exact KEEP records`)
    }

    const inputGoal = dual.first.input.goals.find((goal) => goal.goalId === goalId)
    const secondInputGoal = dual.second.input.goals.find((goal) => goal.goalId === goalId)
    const summaryGoal = dual.summary.goals.find((goal) => goal.goalId === goalId)
    const decision = adjudication.decisions?.find((candidate) => candidate.goalId === goalId)
    const selectedRound = selectedRoundByGoalId.get(goalId)
    const selectionRationale = selectionRationaleByGoalId.get(goalId)
    const currentPage = currentSubset.pages.find((page) => page.goalId === goalId)
    const canonicalGoal = canonicalGoals.find((goal) => goal.id === goalId)
    if (
      !inputGoal
      || !secondInputGoal
      || !summaryGoal
      || !decision
      || !selectedRound
      || !selectionRationale
      || !currentPage
      || !canonicalGoal
    ) {
      throw new Error(`${goalId}: missing aligned review, adjudication, canonical, or GoalBook context`)
    }
    const selectedSource = selectedRound === 'first' ? firstSource : secondSource
    const selectedRecord = selectedSource.record
    if (!selectedRecord) throw new Error(`${goalId}: selected blind-review source has no record`)
    const expectedSelectedRecordId = selectedRound === 'first'
      ? decision.roundA?.recordId
      : decision.roundB?.recordId
    if (
      decision.roundA?.recordId !== firstSource.record.recordId
      || decision.roundA.decision !== 'keep'
      || decision.roundB?.recordId !== secondSource.record.recordId
      || decision.roundB.decision !== 'keep'
      || decision.resolutionDecision !== 'keep_current'
      || decision.evidenceRound !== selectedRound
      || decision.evidenceRecordId !== selectedRecord.recordId
      || expectedSelectedRecordId !== selectedRecord.recordId
      || decision.progressCounted !== false
      || decision.rationale !== selectionRationale.en
      || summaryGoal.firstDecision !== 'keep'
      || summaryGoal.secondDecision !== 'keep'
      || summaryGoal.firstRecordId !== firstSource.record.recordId
      || summaryGoal.secondRecordId !== secondSource.record.recordId
      || summaryGoal.firstRunId !== expectedRoundARunId
      || summaryGoal.secondRunId !== expectedRoundBRunId
      || summaryGoal.requiresSynthesis !== true
      || summaryGoal.automaticAcceptance !== false
    ) {
      throw new Error(`${goalId}: selected source round conflicts with dual-summary or adjudication`)
    }
    const canonicalContext = buildGoalDescriptionCanonicalContext(canonicalGoal)
    const goalReviewContextFingerprint = fingerprintGoalDescriptionReviewContext(inputGoal)
    if (
      stableGoalBookJson(inputGoal) !== stableGoalBookJson(secondInputGoal)
      || stableGoalBookJson(inputGoal.canonicalContext)
        !== stableGoalBookJson(canonicalContext)
      || firstSource.binding.goalReviewContextFingerprint !== goalReviewContextFingerprint
      || secondSource.binding.goalReviewContextFingerprint !== goalReviewContextFingerprint
      || currentPage.goalFingerprint !== inputGoal.goalFingerprint
      || currentPage.pageFingerprint !== inputGoal.pageFingerprint
      || stableGoalBookJson(currentPage) !== stableGoalBookJson(inputGoal.reviewContext.page)
    ) {
      throw new Error(`${goalId}: post-B019 canonical or GoalBook context is not exact-current carryover`)
    }
    const finalText = {
      titleDe: inputGoal.currentTitleDe,
      titleEn: inputGoal.currentTitleEn,
      descriptionDe: inputGoal.currentDescriptionDe,
      descriptionEn: inputGoal.currentDescriptionEn,
    }
    const currentText = {
      titleDe: String(canonicalGoal.title ?? ''),
      titleEn: String(canonicalGoal.titleEn ?? ''),
      descriptionDe: String(canonicalGoal.description ?? ''),
      descriptionEn: String(canonicalGoal.descriptionEn ?? ''),
    }
    if (stableGoalBookJson(finalText) !== stableGoalBookJson(currentText)) {
      throw new Error(`${goalId}: reviewed bilingual text is not exact-current after B019 integration`)
    }
    expectedGoals.push({
      goalId,
      effectiveSemanticKind: 'curricularAtomic',
      goalFingerprint: inputGoal.goalFingerprint as GoalDescriptionSynthesisDigest,
      pageFingerprint: inputGoal.pageFingerprint as GoalDescriptionSynthesisDigest,
      goalReviewContextFingerprint,
      finalText,
      firstSource,
      secondSource,
    })
    sourceByGoalId.set(goalId, { first: firstSource, second: secondSource })
    currentCanonicalContexts.push({
      goalId,
      canonicalContext,
      fingerprint: digest(stableGoalBookJson(canonicalContext)),
    })
  }

  const firstGoal = expectedGoals[0]
  if (!firstGoal) throw new Error('B019 stable-seven carryover scope is empty')
  const runCompletionTimes = [...dual.first.resultPairs, ...dual.second.resultPairs]
    .map(({ run }) => Date.parse(run.completedAt))
  if (runCompletionTimes.length === 0 || runCompletionTimes.some((value) => !Number.isFinite(value))) {
    throw new Error('B019 blind runs must have valid completion timestamps')
  }
  const synthesizedAt = new Date(Math.max(...runCompletionTimes) + 1000).toISOString()
  const expectedSynthesisBindings = {
    batch: {
      batchId: expectedBatchId,
      batchManifestDigest: digest(sources.batchManifest),
      configDigest: digest(sources.config),
      bundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint,
      bookDigest: dual.first.input.bookDigest as GoalDescriptionSynthesisDigest,
      reviewInputFingerprint: dual.first.input.reviewInputFingerprint as GoalDescriptionSynthesisDigest,
      dualSummaryDigest: digest(dual.bytes),
      canonicalLandscapeDigest: digest(canonicalBytes),
    },
    rounds: {
      first: buildGoalDescriptionRolloutSynthesisRoundBinding(
        firstGoal.firstSource.binding,
        dual.prepared.manifest.artifacts.rounds.first.batchInputFingerprint,
      ),
      second: buildGoalDescriptionRolloutSynthesisRoundBinding(
        firstGoal.secondSource.binding,
        dual.prepared.manifest.artifacts.rounds.second.batchInputFingerprint,
      ),
    },
    synthesizedAt,
    goals: expectedGoals,
  }
  const synthesisManifestId = 'mathematik-b019-stable7-synthesis-openai-codex-20260829'
  const synthesisManifestPayload: Omit<
    GoalDescriptionRolloutSynthesisDecisionManifest,
    'manifestFingerprint'
  > = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
    schemaVersion: 1,
    synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
    manifestId: synthesisManifestId,
    authority: 'ai_synthesis',
    synthesizedBy: 'OpenAI Codex B019 stable-seven bounded synthesis candidate',
    synthesizedAt,
    batch: expectedSynthesisBindings.batch,
    rounds: expectedSynthesisBindings.rounds,
    decisions: expectedGoals.map((goal, index) => {
      const source = sourceByGoalId.get(goal.goalId)
      const evidenceRound = selectedRoundByGoalId.get(goal.goalId)
      const rationale = selectionRationaleByGoalId.get(goal.goalId)
      if (!source?.first.record || !source.second.record || !evidenceRound || !rationale) {
        throw new Error(`${goal.goalId}: incomplete B019 stable-seven synthesis authoring`)
      }
      return {
        decisionId: `${synthesisManifestId}-decision-${String(index + 1).padStart(3, '0')}`,
        goalId: goal.goalId,
        effectiveSemanticKind: goal.effectiveSemanticKind,
        goalFingerprint: goal.goalFingerprint,
        pageFingerprint: goal.pageFingerprint,
        goalReviewContextFingerprint: goal.goalReviewContextFingerprint,
        finalText: goal.finalText,
        resolutionDecision: 'keep_current' as const,
        evidenceRound,
        records: {
          first: {
            recordId: source.first.binding.recordId,
            recordDigest: source.first.binding.recordDigest,
          },
          second: {
            recordId: source.second.binding.recordId,
            recordDigest: source.second.binding.recordDigest,
          },
        },
        rationaleDe: `Beide unabhängigen Blindprüfungen bestätigen den unveränderten zweisprachigen Wortlaut mit KEEP. Der aktuelle kanonische Kontext ist exakt an den geprüften Nach-B019-Stand gebunden. ${rationale.de}`,
        rationaleEn: `Both independent blind reviews confirm the unchanged bilingual wording with KEEP. The current canonical context is exactly bound to the reviewed post-B019 state. ${rationale.en}`,
      }
    }),
  }
  const synthesisManifest: GoalDescriptionRolloutSynthesisDecisionManifest = {
    ...synthesisManifestPayload,
    manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(
      synthesisManifestPayload,
    ),
  }
  const synthesisManifestValidation = await validateGoalDescriptionRolloutSynthesisDecisionManifest({
    manifest: synthesisManifest,
    expected: expectedSynthesisBindings,
  })
  if (synthesisManifestValidation.errors.length > 0) {
    throw new Error(
      `B019 stable-seven synthesis manifest: ${synthesisManifestValidation.errors.join(' | ')}`,
    )
  }
  const synthesisBytes = jsonBytes(synthesisManifest)

  const resolutionArtifacts: PlannedOutput[] = []
  const indexEntries: Array<{
    goalId: string
    titleDe: string
    groupId: string
    decision: string
    resolutionPath: string
    resolutionDigest: `sha256:${string}`
    resolutionFingerprint: string
    strictDescriptionComplete: true
  }> = []
  for (const goal of expectedGoals) {
    const source = sourceByGoalId.get(goal.goalId)
    const summaryGoal = dual.summary.goals.find(({ goalId }) => goalId === goal.goalId)
    const synthesisDecision = synthesisManifest.decisions.find(({ goalId }) => goalId === goal.goalId)
    if (!source || !summaryGoal || !synthesisDecision) {
      throw new Error(`${goal.goalId}: incomplete B019 stable-seven synthesis alignment`)
    }
    const synthesis = buildGoalDescriptionRolloutResolutionSynthesis({
      batchId: expectedBatchId,
      manifest: synthesisManifest,
      decision: synthesisDecision,
      summaryGoal,
      firstSource: source.first,
      secondSource: source.second,
    })
    const resolution = buildGoalDescriptionDualRoundResolution({
      resolutionId: `math-b019-stable7-current-carryover-v1-resolution-${goal.goalId}`,
      goalId: goal.goalId,
      effectiveSemanticKind: 'curricularAtomic',
      decision: 'keep_current',
      synthesis,
      dualSummaryBytes: dual.bytes,
      currentInput: dual.first.input,
      firstSource: source.first,
      secondSource: source.second,
      synthesisDecisionManifest: {
        contract: synthesisManifest.synthesisContract,
        manifestPath: synthesisRelativePath,
        manifestId: synthesisManifest.manifestId,
        manifestDigest: digest(synthesisBytes),
        manifestFingerprint: synthesisManifest.manifestFingerprint,
        decisionId: synthesisDecision.decisionId,
      },
    })
    const validation = await validateGoalDescriptionDualRoundResolution({
      resolution,
      dualSummary: dual.summary,
      dualSummaryBytes: dual.bytes,
      currentInput: dual.first.input,
      landscape,
      first: dual.first,
      second: dual.second,
      synthesisDecisionManifestArtifact: {
        manifest: synthesisManifest,
        manifestBytes: synthesisBytes,
        manifestPath: synthesisRelativePath,
      },
    })
    if (validation.errors.length > 0 || !validation.strictDescriptionComplete) {
      throw new Error(
        `${goal.goalId}: ${validation.errors.join(' | ') || 'resolution is not strict complete'}`,
      )
    }

    const bytes = jsonBytes(resolution)
    const relativeResolutionPath = `${resolutionDirectoryName}/${goal.goalId}.resolution.json`
    resolutionArtifacts.push({
      path: `${batchDirectory}/${relativeResolutionPath}`,
      bytes,
      mode: outputFileMode,
    })
    indexEntries.push({
      goalId: goal.goalId,
      titleDe: resolution.goal.finalText.titleDe,
      groupId: expectedBatchId,
      decision: resolution.decision,
      resolutionPath: relativeResolutionPath,
      resolutionDigest: digest(bytes),
      resolutionFingerprint: resolution.resolutionFingerprint,
      strictDescriptionComplete: true,
    })
  }

  const curriculumAtomicDenominator = expectedCurriculumAtomicDenominator
  const index = {
    schemaVersion: 1,
    artifactSetId: `${expectedBatchId}-stable-current-carryover-7`,
    subject: 'Mathematik',
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: indexEntries.length,
    curriculumAtomicDenominator,
    descriptionReviewPercentage: Number(((indexEntries.length / curriculumAtomicDenominator) * 100).toFixed(1)),
    synthesisDecisionManifest: {
      path: synthesisRelativePath,
      digest: digest(synthesisBytes),
      fingerprint: synthesisManifest.manifestFingerprint,
    },
    groups: [{
      groupId: expectedBatchId,
      artifactDirectory: '.',
      dualSummaryPath: 'dual-summary.json',
      dualSummaryDigest: digest(dual.bytes),
      campaignGoalCount: campaignGoalIds.length,
      resolvedGoalCount: indexEntries.length,
    }],
    resolutions: indexEntries,
  }
  const indexBytes = jsonBytes(index)
  if (
    index.curriculumAtomicDenominator !== expectedCurriculumAtomicDenominator
    || index.descriptionReviewPercentage !== 0.9
  ) {
    throw new Error('B019 stable-seven index must report exactly 7/792 = 0.9%')
  }
  const receiptBody = {
    schemaVersion: 1,
    receiptId: 'mathematik-rollout-v1-batch-019-stable-current-carryover-7-v1-20260829',
    purpose: 'Bounded compatibility reuse of seven exact-current KEEP/KEEP goals from the nineteen-goal B019 Q2 lines-and-planes campaign.',
    sourceBatchId: expectedBatchId,
    sourceCampaignGoalCount: campaignGoalIds.length,
    claimedGoalIds: [...goalIds],
    claimedGoalCount: goalIds.length,
    followUpGoalIds: [...followUpGoalIds],
    followUpGoalCount: followUpGoalIds.length,
    noWholeBatchProgressClaim: true,
    selectedEvidenceRounds: Object.fromEntries(goalIds.map((goalId) => [
      goalId,
      selectedRoundByGoalId.get(goalId),
    ])),
    sourceBindings: sourceSpecifications.map(({ key, path, sha256 }) => ({
      role: key,
      path,
      sha256: `sha256:${sha256}`,
    })),
    currentCanonicalLandscape: { path: canonicalPath, sha256: digest(canonicalBytes) },
    currentSemanticKindLedger: {
      path: semanticKindLedgerPath,
      sha256: digest(sources.semanticKindLedger),
      totalGoalCount: expectedCanonicalGoalCount,
      curriculumAtomicDenominator,
    },
    currentCanonicalContexts,
    currentGoalBook: {
      configPath: expectedBaseGoalBookConfigPath,
      digest: currentBase.model.digest,
      currentB019SubsetDigest: currentSubset.digest,
      projectedAtomicGoalCount: expectedProjectedAtomicGoalCount,
      curricularAtomicPageCount: currentBase.model.pages.length,
      excludedTargetAtomicGoalCount: currentBase.model.excludedTargetGoals.length,
    },
    synthesisManifestPath: synthesisRelativePath,
    synthesisManifestDigest: digest(synthesisBytes),
    synthesisManifestFingerprint: synthesisManifest.manifestFingerprint,
    resolutionIndexPath: basename(indexPath),
    resolutionIndexDigest: digest(indexBytes),
    resolutionIndexFormat: 'legacy-schema-v1-partial-group',
    rationale: [
      'All seven bilingual texts, canonical contexts, complete GoalBook pages, and direct plus reverse relation contexts remain exact-current after the B019 integration, and both independent B019 records remain KEEP.',
      'The bound third adjudication assigns the other twelve goals to a fresh follow-up; this carryover receipt neither resolves those goals nor claims completion of the nineteen-goal campaign.',
      'The source campaign contains nineteen goals, while only these seven retain the exact reviewed context. The schema-v1 partial-group compatibility path performs fresh production validation for every resolution.',
      'No curriculum, mapping, assessment, atomicity, memory, visualization, Nano Banana, prompt, blind-review, or OpenAI V1 contract bytes are changed by this materializer.',
      'Positive-understanding evidence is materialized and reviewed separately before any strict rollout progress is counted.',
    ],
    safeguards: {
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
    },
  }
  const materializationPlanSha256 = sha256Hex(jsonBytes({
    materializationContract: 'math-b019-stable7-hardlink-no-clobber-v2',
    sourceHashes,
    currentPostStateHashes: {
      canonical: sha256Hex(canonicalBytes),
      goalBook: currentBase.model.digest.replace(/^sha256:/u, ''),
      semanticKindLedger: sha256Hex(sources.semanticKindLedger),
    },
    curriculumAuthority: {
      totalGoalCount: expectedCanonicalGoalCount,
      curricularAtomicGoalCount: curriculumAtomicDenominator,
      projectedAtomicGoalCount: expectedProjectedAtomicGoalCount,
      excludedTargetAtomicGoalCount: expectedExcludedTargetAtomicGoalCount,
    },
    modes: {
      outputFile: outputFileMode,
      ownedDirectory: ownedDirectoryMode,
      writeLockDirectory: ownedDirectoryMode,
      privatePreparationDirectory: ownedDirectoryMode,
    },
    ownedDirectories: [
      { path: batchDirectory, mode: ownedDirectoryMode },
      { path: resolutionDirectoryPath, mode: ownedDirectoryMode },
    ],
    writeLock: { path: writeLockPath, mode: ownedDirectoryMode },
    sourceBatchId: expectedBatchId,
    stableGoalIds: goalIds,
    followUpGoalIds,
    synthesisManifest: {
      path: synthesisPath,
      sha256: sha256Hex(synthesisBytes),
      mode: outputFileMode,
    },
    resolutionOutputs: resolutionArtifacts.map(({ path, bytes, mode }) => ({
      path,
      sha256: sha256Hex(bytes),
      mode,
    })),
    index: { path: indexPath, sha256: sha256Hex(indexBytes), mode: outputFileMode },
    receiptBody,
  }))
  const receiptBytes = jsonBytes({
    ...receiptBody,
    materializationPlanSha256: `sha256:${materializationPlanSha256}`,
  })
  const outputs: PlannedOutput[] = [
    { path: synthesisPath, bytes: synthesisBytes, mode: outputFileMode },
    ...resolutionArtifacts,
    { path: receiptPath, bytes: receiptBytes, mode: outputFileMode },
    { path: indexPath, bytes: indexBytes, mode: outputFileMode },
  ]
  if (outputs.length !== goalIds.length + 3) {
    throw new Error(
      'B019 stable-seven carryover plan must contain one synthesis manifest, '
      + 'seven resolutions, one receipt, and one index',
    )
  }
  const planSha256 = sha256Hex(jsonBytes({
    materializationPlanSha256,
    outputs: outputs.map(({ path, bytes, mode }) => ({
      path,
      sha256: sha256Hex(bytes),
      mode,
    })),
    stagingSuffix,
    modes: {
      outputFile: outputFileMode,
      ownedDirectory: ownedDirectoryMode,
    },
  }))
  return {
    outputs,
    planSha256,
    currentCanonicalSha256: sha256Hex(canonicalBytes),
    currentSemanticKindLedgerSha256: sha256Hex(sources.semanticKindLedger),
    currentGoalBookDigest: currentBase.model.digest,
    currentSubsetDigest: currentSubset.digest,
    curriculumAtomicDenominator,
  }
}

const runFreezeCheck = (): void => {
  execFileSync('node', ['scripts/check_openai_plugin_review_freeze.mjs'], {
    cwd: repositoryRoot,
    stdio: 'inherit',
  })
}

const assertSamePlan = (left: BuiltPlan, right: BuiltPlan, role: string): void => {
  if (
    left.planSha256 !== right.planSha256
    || left.currentCanonicalSha256 !== right.currentCanonicalSha256
    || left.currentSemanticKindLedgerSha256 !== right.currentSemanticKindLedgerSha256
    || left.currentGoalBookDigest !== right.currentGoalBookDigest
    || left.currentSubsetDigest !== right.currentSubsetDigest
    || left.curriculumAtomicDenominator !== right.curriculumAtomicDenominator
    || left.outputs.length !== right.outputs.length
    || left.outputs.some((output, index) => (
      output.path !== right.outputs[index].path
      || output.mode !== right.outputs[index].mode
      || !output.bytes.equals(right.outputs[index].bytes)
    ))
  ) {
    throw new Error(`${role}: B019 carryover inputs or deterministic output plan drifted`)
  }
}

const main = async (): Promise<void> => {
  const initialPlan = await buildPlan()
  if (expectedPlanSha256 !== 'PENDING' && initialPlan.planSha256 !== expectedPlanSha256) {
    throw new Error(
      `B019 stable-seven plan drift: ${initialPlan.planSha256} != ${expectedPlanSha256}`,
    )
  }
  if (writeMode || checkMode) assertMutationPinsBound()

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
  const classifyOwnedDirectory = ({
    path,
    role,
    allowAbsent,
  }: {
    path: string
    role: string
    allowAbsent: boolean
  }): RealDirectoryState => {
    const candidate = absolute(path)
    let stat
    try {
      stat = lstatSync(candidate)
    } catch (error) {
      if (hasErrorCode(error, 'ENOENT') && allowAbsent) return 'absent'
      if (hasErrorCode(error, 'ENOENT')) throw new Error(`${role} is missing: ${path}`)
      throw error
    }
    if (!stat.isDirectory()) throw new Error(`${role} is not a real directory: ${path}`)
    assertMode(stat.mode, ownedDirectoryMode, role)
    return 'real-directory'
  }
  const assertOwnedOutputDirectories = (allowResolutionAbsent: boolean): void => {
    classifyOwnedDirectory({
      path: batchDirectory,
      role: 'B019 stable-seven batch output directory',
      allowAbsent: false,
    })
    classifyOwnedDirectory({
      path: resolutionDirectoryPath,
      role: 'B019 stable-seven resolution output directory',
      allowAbsent: allowResolutionAbsent,
    })
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
    assertRealParentChain(path, `B019 stable-seven ${role}`)
    if (!stat.isFile()) {
      throw new Error(`B019 stable-seven ${role} has unknown non-file state: ${path}`)
    }
    assertMode(stat.mode, mode, `B019 stable-seven ${role} ${path}`)
    const actualSha256 = sha256Hex(readFileSync(candidate))
    const expectedSha256 = sha256Hex(bytes)
    if (actualSha256 !== expectedSha256) {
      throw new Error(
        `B019 stable-seven ${role} has unknown bytes: ${path}: `
        + `${actualSha256} != ${expectedSha256}`,
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

  const assertWriteLockAbsent = (): void => {
    try {
      lstatSync(absolute(writeLockPath))
    } catch (error) {
      if (hasErrorCode(error, 'ENOENT')) return
      throw error
    }
    throw new Error(
      `B019 stable-seven write lock is present: ${writeLockPath}; `
      + 'inspect the bounded target, staging, and private-preparation state as stale crash residue',
    )
  }
  const assertWriteLockHeld = (): void => {
    classifyOwnedDirectory({
      path: writeLockPath,
      role: 'B019 stable-seven write lock',
      allowAbsent: false,
    })
  }
  const acquireWriteLock = (): void => {
    assertOwnedOutputDirectories(true)
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
      throw new Error(`B019 stable-seven write lock contains unknown entries: ${writeLockPath}`)
    }
    rmdirSync(lock)
    assertWriteLockAbsent()
  }

  const plannedOutputSha256 = new Map(
    initialPlan.outputs.map(({ path, bytes }) => [path, sha256Hex(bytes)]),
  )
  const privateWorkTag = '.b019-stable-seven-prepare-'
  const privatePayloadName = 'prepared-output'
  const privateWorkPrefix = (output: PlannedOutput): string => {
    const outputSha256 = plannedOutputSha256.get(output.path)
    if (!outputSha256) throw new Error(`${output.path}: missing B019 planned output SHA-256`)
    const pathKey = sha256Hex(Buffer.from(output.path)).slice(0, 16)
    return `${privateWorkTag}${pathKey}-${outputSha256}-`
  }
  const batchOutputParent = absolute(batchDirectory)
  const resolutionOutputParent = absolute(resolutionDirectoryPath)
  const outputParents = [...new Set(initialPlan.outputs.map(({ path }) => dirname(absolute(path))))]
  const expectedStagingPaths = new Set(
    initialPlan.outputs.map(({ path }) => absolute(stagingPath(path))),
  )
  const resolutionOutputs = initialPlan.outputs.filter(({ path }) => (
    dirname(absolute(path)) === resolutionOutputParent
  ))
  if (resolutionOutputs.length !== goalIds.length) {
    throw new Error('B019 dedicated resolution output scope must contain exactly seven files')
  }
  const expectedResolutionEntries = new Set(resolutionOutputs.flatMap(({ path }) => [
    basename(path),
    basename(stagingPath(path)),
  ]))

  const ensurePlannedOutputParent = (output: PlannedOutput): void => {
    assertWriteLockHeld()
    const parent = dirname(absolute(output.path))
    classifyOwnedDirectory({
      path: batchOutputParent,
      role: 'B019 stable-seven batch output directory',
      allowAbsent: false,
    })
    if (parent === batchOutputParent) return
    if (parent !== resolutionOutputParent) {
      throw new Error(`${output.path}: unexpected B019 stable-seven output parent ${parent}`)
    }
    const state = classifyOwnedDirectory({
      path: parent,
      role: 'B019 stable-seven resolution output directory',
      allowAbsent: true,
    })
    if (state === 'real-directory') return
    try {
      mkdirSync(parent, { mode: ownedDirectoryMode })
      chmodSync(parent, ownedDirectoryMode)
    } catch (error) {
      if (!hasErrorCode(error, 'EEXIST')) throw error
    }
    classifyOwnedDirectory({
      path: parent,
      role: 'B019 stable-seven resolution output directory',
      allowAbsent: false,
    })
  }

  type PrivateResidue = {
    directory: string
    output: PlannedOutput
    payload: string | null
  }
  const inspectPrivateResidues = (): PrivateResidue[] => {
    assertOwnedOutputDirectories(true)
    const residues: PrivateResidue[] = []
    const definitions = initialPlan.outputs.map((output) => ({
      output,
      parent: dirname(absolute(output.path)),
      prefix: privateWorkPrefix(output),
    }))
    for (const parent of outputParents) {
      const isResolutionParent = parent === resolutionOutputParent
      const parentState = classifyOwnedDirectory({
        path: parent,
        role: isResolutionParent
          ? 'B019 stable-seven resolution output directory'
          : 'B019 stable-seven batch output directory',
        allowAbsent: isResolutionParent,
      })
      if (parentState === 'absent') continue
      const entries: Dirent[] = readdirSync(parent, { encoding: 'utf8', withFileTypes: true })
      for (const entry of entries) {
        const entryPath = resolve(parent, entry.name)
        const isPrivateWorkEntry = entry.name.startsWith(privateWorkTag)
        if (
          isResolutionParent
          && !expectedResolutionEntries.has(entry.name)
          && !isPrivateWorkEntry
        ) {
          throw new Error(`Unknown entry in B019 stable-seven resolution directory: ${entryPath}`)
        }
        if (entry.name.endsWith(stagingSuffix) && !expectedStagingPaths.has(entryPath)) {
          throw new Error(`Unknown adjacent B019 stable-seven staging path: ${entryPath}`)
        }
        if (!isPrivateWorkEntry) continue
        const matches = definitions.filter(({ parent: candidateParent, prefix }) => (
          candidateParent === parent && entry.name.startsWith(prefix)
        ))
        if (matches.length !== 1 || !entry.isDirectory()) {
          throw new Error(`Unknown B019 stable-seven private preparation entry: ${entryPath}`)
        }
        classifyOwnedDirectory({
          path: entryPath,
          role: 'B019 stable-seven private preparation directory',
          allowAbsent: false,
        })
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
        ) {
          throw new Error(`Unknown B019 stable-seven private preparation contents: ${entryPath}`)
        }
        const payload = resolve(entryPath, privatePayloadName)
        const payloadState = classifyExpectedFile({
          ...definition.output,
          path: payload,
          exactState: 'exact-private',
          role: 'preparation',
        })
        if (payloadState !== 'exact-private') {
          throw new Error(`${definition.output.path}: private preparation payload is unexpectedly absent`)
        }
        residues.push({ directory: entryPath, output: definition.output, payload })
      }
    }
    return residues
  }
  const recoverPrivateResidues = (residues: readonly PrivateResidue[]): void => {
    assertWriteLockHeld()
    for (const residue of residues) {
      classifyOwnedDirectory({
        path: residue.directory,
        role: 'B019 stable-seven private preparation directory during recovery',
        allowAbsent: false,
      })
      if (residue.payload) {
        const payloadState = classifyExpectedFile({
          ...residue.output,
          path: residue.payload,
          exactState: 'exact-private',
          role: 'preparation',
        })
        if (payloadState !== 'exact-private') {
          throw new Error(`${residue.output.path}: private payload changed before recovery`)
        }
        unlinkSync(residue.payload)
      }
      if (readdirSync(residue.directory).length !== 0) {
        throw new Error(`${residue.output.path}: private residue is not empty after verified recovery`)
      }
      rmdirSync(residue.directory)
    }
    if (inspectPrivateResidues().length !== 0) {
      throw new Error('B019 stable-seven private residue recovery did not converge to zero')
    }
  }

  const assertCurrentInputsAndPlan = async (label: string): Promise<void> => {
    assertWriteLockHeld()
    const rebound = await buildPlan()
    assertSamePlan(initialPlan, rebound, label)
    if (expectedPlanSha256 === 'PENDING' || rebound.planSha256 !== expectedPlanSha256) {
      throw new Error(`${label}: B019 stable-seven expected plan pin is absent or drifted`)
    }
  }
  const privateWorkDirectory = (output: PlannedOutput): string => {
    assertWriteLockHeld()
    ensurePlannedOutputParent(output)
    const parent = dirname(absolute(stagingPath(output.path)))
    const nonce = randomBytes(16).toString('hex')
    const directory = mkdtempSync(resolve(
      parent,
      `${privateWorkPrefix(output)}${process.pid}-${nonce}-`,
    ))
    chmodSync(directory, ownedDirectoryMode)
    classifyOwnedDirectory({
      path: directory,
      role: 'new B019 stable-seven private preparation directory',
      allowAbsent: false,
    })
    return directory
  }
  const unlinkPrivateExactFile = ({
    path,
    directory,
    output,
  }: {
    path: string
    directory: string
    output: PlannedOutput
  }): void => {
    assertWriteLockHeld()
    classifyOwnedDirectory({
      path: directory,
      role: 'B019 stable-seven private preparation directory',
      allowAbsent: false,
    })
    const state = classifyExpectedFile({
      ...output,
      path,
      exactState: 'exact-private',
      role: 'preparation',
    })
    if (state !== 'exact-private') {
      throw new Error(`${output.path}: refusing to unlink missing private preparation file`)
    }
    unlinkSync(path)
    if (readdirSync(directory).length !== 0) {
      throw new Error(`${output.path}: private preparation directory is not empty after unlink`)
    }
    rmdirSync(directory)
  }
  const createExactAdjacentStaging = (output: PlannedOutput): void => {
    assertWriteLockHeld()
    const staging = absolute(stagingPath(output.path))
    ensurePlannedOutputParent(output)
    const preparationDirectory = privateWorkDirectory(output)
    const preparation = resolve(preparationDirectory, privatePayloadName)
    writeFileSync(preparation, output.bytes, { flag: 'wx', mode: output.mode })
    chmodSync(preparation, output.mode)
    const preparedState = classifyExpectedFile({
      ...output,
      path: preparation,
      exactState: 'exact-prepared',
      role: 'preparation',
    })
    if (preparedState !== 'exact-prepared') {
      throw new Error(`${output.path}: private wx preparation is not exact`)
    }
    try {
      linkSync(preparation, staging)
    } catch (error) {
      const racedState = classifyExpectedFile({
        ...output,
        path: stagingPath(output.path),
        exactState: 'exact-staged',
        role: 'staging',
      })
      if (racedState !== 'exact-staged') throw error
    }
    const stagedState = classifyExpectedFile({
      ...output,
      path: stagingPath(output.path),
      exactState: 'exact-staged',
      role: 'staging',
    })
    if (stagedState !== 'exact-staged') {
      throw new Error(`${output.path}: adjacent staging hardlink is not exact`)
    }
    unlinkPrivateExactFile({ path: preparation, directory: preparationDirectory, output })
  }
  const unlinkExactStagingUnderLock = (output: PlannedOutput): void => {
    assertWriteLockHeld()
    const state = classifyExpectedFile({
      ...output,
      path: stagingPath(output.path),
      exactState: 'exact-staged',
      role: 'staging',
    })
    if (state !== 'exact-staged') {
      throw new Error(`${output.path}: refusing to unlink absent staging under lock`)
    }
    unlinkSync(absolute(stagingPath(output.path)))
  }
  const stageEveryMissingOutput = (): void => {
    assertWriteLockHeld()
    for (const output of initialPlan.outputs) {
      let classified = classifyOutput(output)
      if (classified.targetState === 'exact-after') continue
      if (classified.stagingState === 'absent') createExactAdjacentStaging(output)
      classified = classifyOutput(output)
      if (classified.targetState === 'absent' && classified.stagingState !== 'exact-staged') {
        throw new Error(`${output.path}: missing target is not exact-staged`)
      }
    }
    const state = classifyMaterialization()
    const unstaged = state.outputs.filter(({ targetState, stagingState }) => (
      targetState === 'absent' && stagingState === 'absent'
    ))
    if (unstaged.length !== 0) {
      throw new Error(`B019 stable-seven staging missed ${unstaged.length} output(s)`)
    }
  }
  const publishNoClobber = (output: PlannedOutput): void => {
    assertWriteLockHeld()
    let classified = classifyOutput(output)
    if (classified.targetState === 'absent') {
      if (classified.stagingState !== 'exact-staged') {
        throw new Error(`${output.path}: refusing publish without exact adjacent staging`)
      }
      try {
        linkSync(absolute(stagingPath(output.path)), absolute(output.path))
      } catch (error) {
        classified = classifyOutput(output)
        if (classified.targetState !== 'exact-after') throw error
      }
    }
    classified = classifyOutput(output)
    if (classified.targetState !== 'exact-after') {
      throw new Error(`${output.path}: no-clobber hardlink publish did not reach exact-after`)
    }
    if (classified.stagingState === 'exact-staged') unlinkExactStagingUnderLock(output)
    classified = classifyOutput(output)
    if (classified.targetState !== 'exact-after' || classified.stagingState !== 'absent') {
      throw new Error(`${output.path}: published target or staging cleanup drifted`)
    }
  }

  assertWriteLockAbsent()
  assertOwnedOutputDirectories(true)
  let privateResidues = inspectPrivateResidues()
  let materialization = classifyMaterialization(privateResidues.length)
  if (checkMode) {
    if (privateResidues.length !== 0 || materialization.state !== 'exact-after') {
      throw new Error(
        'B019 stable-seven --check requires exact-after, zero staging, and zero private residue; '
        + `state=${materialization.state} targets=${materialization.exactAfterTargetCount}`
        + `/${initialPlan.outputs.length} staged=${materialization.exactStagedCount} `
        + `private=${privateResidues.length}`,
      )
    }
    assertOwnedOutputDirectories(false)
  }
  if (writeMode) {
    runFreezeCheck()
    acquireWriteLock()
    try {
      assertWriteLockHeld()
      privateResidues = inspectPrivateResidues()
      recoverPrivateResidues(privateResidues)
      privateResidues = []
      await assertCurrentInputsAndPlan('Immediate pre-staging rebind')
      stageEveryMissingOutput()
      privateResidues = inspectPrivateResidues()
      if (privateResidues.length !== 0) {
        throw new Error(`B019 stable-seven staging left ${privateResidues.length} private residue(s)`)
      }
      await assertCurrentInputsAndPlan('Immediate pre-publish rebind')
      for (const output of initialPlan.outputs) publishNoClobber(output)
      await assertCurrentInputsAndPlan('Post-publish rebind')
      materialization = classifyMaterialization(inspectPrivateResidues().length)
      if (materialization.state !== 'exact-after') {
        throw new Error(`B019 stable-seven post-write state is ${materialization.state}`)
      }
      assertOwnedOutputDirectories(false)
      assertWriteLockHeld()
    } finally {
      releaseWriteLock()
    }
    assertWriteLockAbsent()
    assertOwnedOutputDirectories(false)
    runFreezeCheck()
  }

  privateResidues = inspectPrivateResidues()
  materialization = classifyMaterialization(privateResidues.length)
  console.log(JSON.stringify({
    mode: writeMode ? 'WRITE' : checkMode ? 'CHECK' : 'PLAN',
    status: expectedPlanSha256 === 'PENDING'
      || Object.values(expectedPostStateHashes).includes('PENDING')
      ? 'PENDING_BINDING'
      : 'BOUND',
    computedPlanSha256: initialPlan.planSha256,
    expectedPlanSha256,
    sourceBatchId: expectedBatchId,
    curriculumAuthority: {
      totalGoalCount: expectedCanonicalGoalCount,
      curricularAtomicGoalCount: initialPlan.curriculumAtomicDenominator,
      projectedAtomicGoalCount: expectedProjectedAtomicGoalCount,
      excludedTargetAtomicGoalCount: expectedExcludedTargetAtomicGoalCount,
      stableCarryoverProgress: `${goalIds.length}/${initialPlan.curriculumAtomicDenominator} = 0.9%`,
    },
    currentPostStatePins: {
      canonical: initialPlan.currentCanonicalSha256,
      semanticKindLedger: initialPlan.currentSemanticKindLedgerSha256,
      goalBook: initialPlan.currentGoalBookDigest.replace(/^sha256:/u, ''),
    },
    configuredPostStatePins: expectedPostStateHashes,
    currentSubsetDigest: initialPlan.currentSubsetDigest,
    stableGoalIds: goalIds,
    followUpGoalIds,
    outputCount: initialPlan.outputs.length,
    outputFileMode: outputFileMode.toString(8).padStart(4, '0'),
    ownedDirectoryAndWriteLockMode: ownedDirectoryMode.toString(8).padStart(4, '0'),
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
