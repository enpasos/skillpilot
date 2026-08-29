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
    rationale?: string
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
  materializationPlanSha256: string
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
const expectedBaseGoalBookConfigPath = 'app/scripts/config/goal-books/de-gym-math-national-atlas.json'
const expectedCanonicalGoalCount = 1174
const expectedCurriculumAtomicDenominator = 792
const expectedProjectedAtomicGoalCount = 919
const expectedExcludedTargetAtomicGoalCount = 127
const outputFileMode = 0o644 as const
const ownedDirectoryMode = 0o700 as const

const outputStem = 'stable-current-carryover-11-v1'
const synthesisRelativePath = `synthesis-decisions.${outputStem}.json`
const synthesisPath = `${batchDirectory}/${synthesisRelativePath}`
const resolutionDirectoryName = `resolutions-${outputStem}`
const resolutionDirectoryPath = `${batchDirectory}/${resolutionDirectoryName}`
const indexPath = `${batchDirectory}/resolution-index.${outputStem}.json`
const receiptPath = `${batchDirectory}/${outputStem}.compatibility-receipt.json`
const writeLockPath = `${batchDirectory}/.${outputStem}.write-lock`
const stagingSuffix = '.b020-stable-eleven-staging'
const stagingPath = (path: string): string => `${path}${stagingSuffix}`

const expectedBatchId = 'mathematik-rollout-v1-batch-020-q2-lines-planes-and-reverse-context-13-v1-20260829'
const expectedRoundARunId = 'b020-round-a-blind-20260829-codex'
const expectedRoundBRunId = 'b020-round-b-blind-20260829-codex-001'
const landscapeId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const mixedDissentGoalId = '9cc650e0-100d-5ae1-a83b-2b854ab7c5c8'

const sourceHashes = {
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
} as const

const expectedPostStateHashes: Record<
  'canonical' | 'semanticKindLedger' | 'goalBook',
  string
> = {
  canonical: '228a15eac60ec00257f25d021c1fa3ef93b873257e220b05d5756a878169f9d0',
  semanticKindLedger: '87d8ed2cd0a0712303caee5bbcb24ca55211f24a20536cbc2d5eb7d002a5abd9',
  goalBook: '2c09186739825ba3c9c463d64eced1992206602f67b21b96b3a9239480a1b17f',
}
const expectedPlanSha256: string = '1c0a59c06d557e02c1dbc0b043b1e4f3e0fba93bbf46915030f78f2a9c1b90ca'

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

const selectionRationaleByGoalId = new Map<string, { de: string; en: string }>([
  ['effe43eb-cabe-56cb-a228-35887d7915c1', {
    de: 'Runde B beschreibt die Grenzen der Skalierung mit einem Faktor ungleich null und der Konstruktion aus zwei Punkten am klarsten, ohne die getrennte Punktprobe vorwegzunehmen.',
    en: 'Round B states the nonzero scaling and two-point construction boundaries most clearly without importing the separate point-membership test.',
  }],
  ['525b1da9-7fdd-4a70-9f30-ff01d7511b04', {
    de: 'Runde B erläutert Standardintervalle und äquivalente Umparametrisierungen am klarsten.',
    en: 'Round B gives the clearest account of standard intervals and equivalent reparametrizations.',
  }],
  ['d785943c-d61b-51a1-a9c2-c36a9e0cc97d', {
    de: 'Runde B verbindet lineare Unabhängigkeit am deutlichsten mit dem tatsächlichen Aufspannen einer Ebene.',
    en: 'Round B most explicitly connects linear independence with actually spanning a plane.',
  }],
  ['66a96282-340d-5220-91a6-cc97e2ec2220', {
    de: 'Runde A macht die Orthogonalitätsbedeutung durch eine konkrete Punktprobe beobachtbar.',
    en: 'Round A makes the orthogonality meaning observable through a concrete point check.',
  }],
  ['9cc650e0-100d-5ae1-a83b-2b854ab7c5c8', {
    de: 'Die Evidenz aus Runde B liefert die stärkste Punktmengen- und Skalierungsdeutung; ihr kanonischer Ersatztext wird nach dem Keep-current-Grundsatz ausdrücklich verworfen.',
    en: 'Round-B evidence supplies the strongest point-set and scaling interpretation, while its proposed canonical replacement is rejected under the keep-current default.',
  }],
  ['fa02cf14-0411-4fe3-8be7-a62c69743e26', {
    de: 'Runde A verlangt einen nachweislich auf der Ebene liegenden Punkt und eine ausdrückliche Äquivalenzprüfung.',
    en: 'Round A requires a demonstrable point on the plane and an explicit equivalence check.',
  }],
  ['ea4bd128-17ab-5a8b-ae98-29552d774fb0', {
    de: 'Runde B liefert den stärksten Transfer über entartete Daten und Eindeutigkeit.',
    en: 'Round B gives the strongest transfer over degenerate data and uniqueness.',
  }],
  ['f613634b-39fb-5021-9970-790ef34c9932', {
    de: 'Runde B verbindet Randgleichungen mit Ecken und Kanten und prüft alternative Ausgangsecken.',
    en: 'Round B connects boundary equalities to vertices and edges and checks alternative base vertices.',
  }],
  ['ce491ec0-c558-5872-86fd-289e60a38403', {
    de: 'Die umgekehrte Aufgabe mit unbekannter Koordinate aus Runde A liefert den stärkeren Transfer für die Punktzugehörigkeit.',
    en: "Round A's unknown-coordinate reversal provides the stronger transfer for point membership.",
  }],
  ['06de364f-9b63-4044-8229-a975621dc6df', {
    de: 'Runde A unterscheidet bei einem verschwindenden Koeffizienten ausdrücklich Parallelität von einer in der Ebene liegenden Achse.',
    en: 'Round A explicitly distinguishes parallelism from an axis lying in the plane when a coefficient vanishes.',
  }],
  ['436532fe-cee6-5a13-a4be-05522435937b', {
    de: 'Runde B liefert robusten Transfer über redundante Gleichungen, Widerspruchszeilen und unabhängige Bedingungen.',
    en: 'Round B gives robust transfer over redundant equations, contradiction rows, and independent conditions.',
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
    || selectionRationaleByGoalId.size !== goalIds.length
    || !goalIds.includes(mixedDissentGoalId)
  ) {
    throw new Error('B020 carryover scope must be exactly 13 = 11 new stable + 1 revised follow-up + 1 preexisting')
  }
  const partition = [...goalIds, ...followUpGoalIds, ...preexistingOwnedGoalIds]
  if (
    new Set(partition).size !== campaignGoalIds.length
    || !campaignGoalIds.every((goalId) => partition.includes(goalId))
  ) {
    throw new Error('B020 new-stable, follow-up, and preexisting scopes must form a disjoint full campaign partition')
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
] as const

type BoundSources = Record<typeof sourceSpecifications[number]['key'], Buffer>

const loadBoundSources = (): BoundSources => Object.fromEntries(
  sourceSpecifications.map(({ key, path, sha256 }) => [
    key,
    readBoundFile(path, sha256, `Bound B020 ${key} source`),
  ]),
) as BoundSources

const buildPlan = async (): Promise<BuiltPlan> => {
  assertOptionalPinsWellFormed()
  verifyStaticScope()
  const sources = loadBoundSources()
  const sourceConfig = parseJson<{ batchId?: string; subject?: string; goalIds?: string[] }>(
    sources.config,
    'B020 config',
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
  }>(sources.batchManifest, 'B020 batch manifest')
  const bookModel = parseJson<{
    digest?: string
    book?: { id?: string; title?: string; landscapeId?: string; pageCount?: number }
  }>(sources.bookModel, 'B020 imported book model')
  const bundleManifest = parseJson<{
    bookModelDigest?: string
    selectedGoalCount?: number
    goals?: Array<{ goalId?: string }>
    bundleFingerprint?: string
  }>(sources.bundleManifest, 'B020 bundle manifest')
  const adjudication = parseJson<Adjudication>(sources.adjudication, 'B020 third adjudication')
  const batchArtifacts = batchManifest.artifacts
  if (!batchArtifacts) throw new Error('B020 batch manifest has no artifacts binding')
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
    throw new Error('B020 config, batch, imported GoalBook, or bundle identity is invalid')
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
    throw new Error('B020 third adjudication does not authorize exactly this stable-eleven carryover')
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
    throw new Error('B020 adjudication input hashes do not match the bound config, bundle, or reviews')
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
    throw new Error('Fresh B020 dual-round validation disagrees with the exact bound source artifacts')
  }

  const canonicalBytes = expectedPostStateHashes.canonical === 'PENDING'
    ? readRegularFile(canonicalPath, 'Post-B020 current canonical Mathematics landscape')
    : readBoundFile(
      canonicalPath,
      expectedPostStateHashes.canonical,
      'Post-B020 current canonical Mathematics landscape',
    )
  const landscape = parseJson<{
    landscapeId?: string
    subject?: string
    goals?: Array<Record<string, unknown>>
  }>(canonicalBytes, 'Post-B020 current canonical Mathematics landscape')
  if (
    landscape.landscapeId !== landscapeId
    || landscape.subject !== 'Mathematik'
    || !Array.isArray(landscape.goals)
    || landscape.goals.length !== expectedCanonicalGoalCount
  ) {
    throw new Error('Post-B020 canonical Mathematics identity or goals array is invalid')
  }
  const canonicalGoals = landscape.goals
  const canonicalGoalIds = canonicalGoals.map((goal) => String(goal.id ?? ''))
  assertUnique(canonicalGoalIds, 'Post-B020 canonical Mathematics landscape')
  if (
    canonicalGoalIds.some((goalId) => goalId === '')
    || !campaignGoalIds.every((goalId) => canonicalGoalIds.includes(goalId))
  ) {
    throw new Error('At least one B020 campaign goal is missing from post-integration canonical Mathematics')
  }

  const semanticKindLedgerBytes = expectedPostStateHashes.semanticKindLedger === 'PENDING'
    ? readRegularFile(semanticKindLedgerPath, 'Post-B020 current Mathematics semantic-kind ledger')
    : readBoundFile(
      semanticKindLedgerPath,
      expectedPostStateHashes.semanticKindLedger,
      'Post-B020 current Mathematics semantic-kind ledger',
    )
  const semanticKindLedger = parseJson<SemanticKindLedger>(
    semanticKindLedgerBytes,
    'Bound B020 Mathematics semantic-kind ledger',
  )
  const ledgerDecisions = semanticKindLedger.decisions
  if (!Array.isArray(ledgerDecisions)) {
    throw new Error('Bound B020 Mathematics semantic-kind ledger has no decisions array')
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
      'Bound B020 Mathematics semantic-kind ledger path, 1174/792 counts, unique IDs, '
      + 'canonical membership, or campaign membership changed',
    )
  }

  const currentBase = await loadGoalBookBuildInputs(expectedBaseGoalBookConfigPath, repositoryRoot)
  if (
    expectedPostStateHashes.goalBook !== 'PENDING'
    && currentBase.model.digest !== `sha256:${expectedPostStateHashes.goalBook}`
  ) {
    throw new Error(
      `Post-B020 current GoalBook drift: ${currentBase.model.digest} != sha256:${expectedPostStateHashes.goalBook}`,
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
    throw new Error('Post-B020 GoalBook must prove 919 projected = 792 pages + 127 excluded targets')
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
    throw new Error('Post-B020 current GoalBook subset does not contain the exact campaign')
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
    const isMixedDissent = goalId === mixedDissentGoalId
    if (
      firstSource.decision !== 'keep'
      || (!isMixedDissent && secondSource.decision !== 'keep')
      || (isMixedDissent && secondSource.decision !== 'revise')
    ) {
      throw new Error(`${goalId}: stable carryover requires KEEP/KEEP except exact 9cc KEEP/REVISE dissent`)
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
      || decision.roundB.decision !== (isMixedDissent ? 'revise' : 'keep')
      || decision.resolutionDecision !== (isMixedDissent
        ? 'keep_current_with_revision_dissent'
        : 'keep_current')
      || decision.evidenceRound !== selectedRound
      || decision.evidenceRecordId !== selectedRecord.recordId
      || expectedSelectedRecordId !== selectedRecord.recordId
      || decision.progressCounted !== false
      || decision.rationale !== selectionRationale.en
      || summaryGoal.firstDecision !== 'keep'
      || summaryGoal.secondDecision !== (isMixedDissent ? 'revise' : 'keep')
      || summaryGoal.firstRecordId !== firstSource.record.recordId
      || summaryGoal.secondRecordId !== secondSource.record.recordId
      || summaryGoal.firstRunId !== expectedRoundARunId
      || summaryGoal.secondRunId !== expectedRoundBRunId
      || summaryGoal.requiresSynthesis !== true
      || summaryGoal.automaticAcceptance !== false
    ) {
      throw new Error(`${goalId}: selected source round conflicts with dual-summary or adjudication`)
    }
    if (isMixedDissent) {
      const dissent = decision.revisionDissent
      if (
        dissent?.rejectedRound !== 'second'
        || dissent.rejectedDecision !== 'revise'
        || dissent.disposition !== 'rejected_keep_current'
        || dissent.rejectedProposedDescriptionDe
          !== secondSource.record.proposedDescriptionDe
        || dissent.rejectedProposedDescriptionEn
          !== secondSource.record.proposedDescriptionEn
        || !dissent.rationaleDe
        || !dissent.rationaleEn
      ) {
        throw new Error(`${goalId}: mixed dissent is not exactly bound to the rejected Round-B revision`)
      }
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
      throw new Error(`${goalId}: post-B020 canonical or GoalBook context is not exact-current carryover`)
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
      throw new Error(`${goalId}: reviewed bilingual text is not exact-current after B020 integration`)
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
  if (!firstGoal) throw new Error('B020 stable-eleven carryover scope is empty')
  const runCompletionTimes = [...dual.first.resultPairs, ...dual.second.resultPairs]
    .map(({ run }) => Date.parse(run.completedAt))
  if (runCompletionTimes.length === 0 || runCompletionTimes.some((value) => !Number.isFinite(value))) {
    throw new Error('B020 blind runs must have valid completion timestamps')
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
  const synthesisManifestId = 'mathematik-b020-stable11-synthesis-openai-codex-20260829'
  const synthesisManifestPayload: Omit<
    GoalDescriptionRolloutSynthesisDecisionManifest,
    'manifestFingerprint'
  > = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
    schemaVersion: 1,
    synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
    manifestId: synthesisManifestId,
    authority: 'ai_synthesis',
    synthesizedBy: 'OpenAI Codex B020 stable-eleven bounded synthesis candidate',
    synthesizedAt,
    batch: expectedSynthesisBindings.batch,
    rounds: expectedSynthesisBindings.rounds,
    decisions: expectedGoals.map((goal, index) => {
      const source = sourceByGoalId.get(goal.goalId)
      const evidenceRound = selectedRoundByGoalId.get(goal.goalId)
      const rationale = selectionRationaleByGoalId.get(goal.goalId)
      if (!source?.first.record || !source.second.record || !evidenceRound || !rationale) {
        throw new Error(`${goal.goalId}: incomplete B020 stable-eleven synthesis authoring`)
      }
      const adjudicationDecision = adjudication.decisions?.find(
        (candidate) => candidate.goalId === goal.goalId,
      )
      const revisionDissent = goal.goalId === mixedDissentGoalId
        ? {
            sourceRound: 'second' as const,
            disposition: 'rejected_keep_current' as const,
            proposedDescriptionDe: source.second.record.proposedDescriptionDe ?? '',
            proposedDescriptionEn: source.second.record.proposedDescriptionEn ?? '',
            rationaleDe: adjudicationDecision?.revisionDissent?.rationaleDe ?? '',
            rationaleEn: adjudicationDecision?.revisionDissent?.rationaleEn ?? '',
          }
        : undefined
      if (
        revisionDissent
        && (
          !revisionDissent.proposedDescriptionDe
          || !revisionDissent.proposedDescriptionEn
          || !revisionDissent.rationaleDe
          || !revisionDissent.rationaleEn
        )
      ) {
        throw new Error(`${goal.goalId}: incomplete exact mixed-dissent synthesis binding`)
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
        ...(revisionDissent ? { revisionDissent } : {}),
        rationaleDe: revisionDissent
          ? `Die erste Blindprüfung bestätigt den aktuellen Wortlaut; die zweite liefert stärkere Evidenz, während ihr Ersatztext nach fachlicher Drittabwägung ausdrücklich verworfen wird. Der aktuelle kanonische Kontext ist exakt an den geprüften Nach-B020-Stand gebunden. ${rationale.de}`
          : `Beide unabhängigen Blindprüfungen bestätigen den unveränderten zweisprachigen Wortlaut mit KEEP. Der aktuelle kanonische Kontext ist exakt an den geprüften Nach-B020-Stand gebunden. ${rationale.de}`,
        rationaleEn: revisionDissent
          ? `The first blind review confirms the current wording; the second supplies stronger evidence while its replacement text is explicitly rejected by third subject adjudication. The current canonical context is exactly bound to the reviewed post-B020 state. ${rationale.en}`
          : `Both independent blind reviews confirm the unchanged bilingual wording with KEEP. The current canonical context is exactly bound to the reviewed post-B020 state. ${rationale.en}`,
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
      `B020 stable-eleven synthesis manifest: ${synthesisManifestValidation.errors.join(' | ')}`,
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
      throw new Error(`${goal.goalId}: incomplete B020 stable-eleven synthesis alignment`)
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
      resolutionId: `math-b020-stable11-current-carryover-v1-resolution-${goal.goalId}`,
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
    artifactSetId: `${expectedBatchId}-stable-current-carryover-11`,
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
    || index.descriptionReviewPercentage !== 1.4
  ) {
    throw new Error('B020 stable-eleven index must report exactly 11/792 = 1.4%')
  }
  const receiptBody = {
    schemaVersion: 1,
    receiptId: 'mathematik-rollout-v1-batch-020-stable-current-carryover-11-v1-20260829',
    purpose: 'Bounded compatibility resolution of eleven new exact-current goals from the thirteen-goal B020 Q2 lines-and-planes campaign.',
    sourceBatchId: expectedBatchId,
    sourceCampaignGoalCount: campaignGoalIds.length,
    claimedGoalIds: [...goalIds],
    claimedGoalCount: goalIds.length,
    followUpGoalIds: [...followUpGoalIds],
    followUpGoalCount: followUpGoalIds.length,
    preexistingOwnedGoalIds: [...preexistingOwnedGoalIds],
    preexistingOwnedGoalCount: preexistingOwnedGoalIds.length,
    noWholeBatchProgressClaim: true,
    selectedEvidenceRounds: Object.fromEntries(goalIds.map((goalId) => [
      goalId,
      selectedRoundByGoalId.get(goalId),
    ])),
    sourceBindings: [
      ...sourceSpecifications.map(({ key, path, sha256 }) => ({
        role: key,
        path,
        sha256: `sha256:${sha256}`,
      })),
      {
        role: 'semanticKindLedger',
        path: semanticKindLedgerPath,
        sha256: digest(semanticKindLedgerBytes),
      },
    ],
    currentCanonicalLandscape: { path: canonicalPath, sha256: digest(canonicalBytes) },
    currentSemanticKindLedger: {
      path: semanticKindLedgerPath,
      sha256: digest(semanticKindLedgerBytes),
      totalGoalCount: expectedCanonicalGoalCount,
      curriculumAtomicDenominator,
    },
    currentCanonicalContexts,
    currentGoalBook: {
      configPath: expectedBaseGoalBookConfigPath,
      digest: currentBase.model.digest,
      currentB020SubsetDigest: currentSubset.digest,
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
      'All eleven claimed bilingual texts, canonical contexts, complete GoalBook pages, and direct plus reverse relation contexts remain exact-current after the separate ec644 revision; ten have KEEP/KEEP records and 9cc has an explicitly adjudicated KEEP/REVISE dissent whose replacement is rejected.',
      'The revised ec644 goal remains excluded until a fresh post-revision dual review, and the already-owned 858 goal remains assigned exclusively to B018; neither receives a B020 resolution or progress claim here.',
      'The thirteen-goal source campaign is partitioned into eleven new claims, one revised follow-up, and one preexisting claim. The schema-v1 partial-group compatibility path performs fresh production validation for every new resolution.',
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
      preexistingOwnedGoalsExcluded: true,
      exactMixedRevisionDissentBound: true,
      positiveEvidenceValidatedSeparately: true,
      productOwnerEscalationRequired: false,
    },
  }
  const materializationPlanSha256 = sha256Hex(jsonBytes({
    materializationContract: 'math-b020-stable11-hardlink-no-clobber-v2',
    sourceHashes,
    currentPostStateHashes: {
      canonical: sha256Hex(canonicalBytes),
      goalBook: currentBase.model.digest.replace(/^sha256:/u, ''),
      semanticKindLedger: sha256Hex(semanticKindLedgerBytes),
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
    preexistingOwnedGoalIds,
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
      'B020 stable-eleven carryover plan must contain one synthesis manifest, '
      + 'eleven resolutions, one receipt, and one index',
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
    materializationPlanSha256,
    currentCanonicalSha256: sha256Hex(canonicalBytes),
    currentSemanticKindLedgerSha256: sha256Hex(semanticKindLedgerBytes),
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
    || left.materializationPlanSha256 !== right.materializationPlanSha256
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
    throw new Error(`${role}: B020 carryover inputs or deterministic output plan drifted`)
  }
}

const main = async (): Promise<void> => {
  const initialPlan = await buildPlan()
  if (expectedPlanSha256 !== 'PENDING' && initialPlan.planSha256 !== expectedPlanSha256) {
    throw new Error(
      `B020 stable-eleven plan drift: ${initialPlan.planSha256} != ${expectedPlanSha256}`,
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
      role: 'B020 stable-eleven batch output directory',
      allowAbsent: false,
    })
    classifyOwnedDirectory({
      path: resolutionDirectoryPath,
      role: 'B020 stable-eleven resolution output directory',
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
    assertRealParentChain(path, `B020 stable-eleven ${role}`)
    if (!stat.isFile()) {
      throw new Error(`B020 stable-eleven ${role} has unknown non-file state: ${path}`)
    }
    assertMode(stat.mode, mode, `B020 stable-eleven ${role} ${path}`)
    const actualSha256 = sha256Hex(readFileSync(candidate))
    const expectedSha256 = sha256Hex(bytes)
    if (actualSha256 !== expectedSha256) {
      throw new Error(
        `B020 stable-eleven ${role} has unknown bytes: ${path}: `
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
      `B020 stable-eleven write lock is present: ${writeLockPath}; `
      + 'inspect the bounded target, staging, and private-preparation state as stale crash residue',
    )
  }
  const assertWriteLockHeld = (): void => {
    classifyOwnedDirectory({
      path: writeLockPath,
      role: 'B020 stable-eleven write lock',
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
      throw new Error(`B020 stable-eleven write lock contains unknown entries: ${writeLockPath}`)
    }
    rmdirSync(lock)
    assertWriteLockAbsent()
  }

  const plannedOutputSha256 = new Map(
    initialPlan.outputs.map(({ path, bytes }) => [path, sha256Hex(bytes)]),
  )
  const privateWorkTag = '.b020-stable-eleven-prepare-'
  const privatePayloadName = 'prepared-output'
  const privateWorkPrefix = (output: PlannedOutput): string => {
    const outputSha256 = plannedOutputSha256.get(output.path)
    if (!outputSha256) throw new Error(`${output.path}: missing B020 planned output SHA-256`)
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
    throw new Error('B020 dedicated resolution output scope must contain exactly eleven files')
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
      role: 'B020 stable-eleven batch output directory',
      allowAbsent: false,
    })
    if (parent === batchOutputParent) return
    if (parent !== resolutionOutputParent) {
      throw new Error(`${output.path}: unexpected B020 stable-eleven output parent ${parent}`)
    }
    const state = classifyOwnedDirectory({
      path: parent,
      role: 'B020 stable-eleven resolution output directory',
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
      role: 'B020 stable-eleven resolution output directory',
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
          ? 'B020 stable-eleven resolution output directory'
          : 'B020 stable-eleven batch output directory',
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
          throw new Error(`Unknown entry in B020 stable-eleven resolution directory: ${entryPath}`)
        }
        if (entry.name.endsWith(stagingSuffix) && !expectedStagingPaths.has(entryPath)) {
          throw new Error(`Unknown adjacent B020 stable-eleven staging path: ${entryPath}`)
        }
        if (!isPrivateWorkEntry) continue
        const matches = definitions.filter(({ parent: candidateParent, prefix }) => (
          candidateParent === parent && entry.name.startsWith(prefix)
        ))
        if (matches.length !== 1 || !entry.isDirectory()) {
          throw new Error(`Unknown B020 stable-eleven private preparation entry: ${entryPath}`)
        }
        classifyOwnedDirectory({
          path: entryPath,
          role: 'B020 stable-eleven private preparation directory',
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
          throw new Error(`Unknown B020 stable-eleven private preparation contents: ${entryPath}`)
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
        role: 'B020 stable-eleven private preparation directory during recovery',
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
      throw new Error('B020 stable-eleven private residue recovery did not converge to zero')
    }
  }

  const assertCurrentInputsAndPlan = async (label: string): Promise<void> => {
    assertWriteLockHeld()
    const rebound = await buildPlan()
    assertSamePlan(initialPlan, rebound, label)
    if (expectedPlanSha256 === 'PENDING' || rebound.planSha256 !== expectedPlanSha256) {
      throw new Error(`${label}: B020 stable-eleven expected plan pin is absent or drifted`)
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
      role: 'new B020 stable-eleven private preparation directory',
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
      role: 'B020 stable-eleven private preparation directory',
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
      throw new Error(`B020 stable-eleven staging missed ${unstaged.length} output(s)`)
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
        'B020 stable-eleven --check requires exact-after, zero staging, and zero private residue; '
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
        throw new Error(`B020 stable-eleven staging left ${privateResidues.length} private residue(s)`)
      }
      await assertCurrentInputsAndPlan('Immediate pre-publish rebind')
      for (const output of initialPlan.outputs) publishNoClobber(output)
      await assertCurrentInputsAndPlan('Post-publish rebind')
      materialization = classifyMaterialization(inspectPrivateResidues().length)
      if (materialization.state !== 'exact-after') {
        throw new Error(`B020 stable-eleven post-write state is ${materialization.state}`)
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
    materializationPlanSha256: initialPlan.materializationPlanSha256,
    sourceBatchId: expectedBatchId,
    curriculumAuthority: {
      totalGoalCount: expectedCanonicalGoalCount,
      curricularAtomicGoalCount: initialPlan.curriculumAtomicDenominator,
      projectedAtomicGoalCount: expectedProjectedAtomicGoalCount,
      excludedTargetAtomicGoalCount: expectedExcludedTargetAtomicGoalCount,
      stableCarryoverProgress: `${goalIds.length}/${initialPlan.curriculumAtomicDenominator} = 1.4%`,
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
    preexistingOwnedGoalIds,
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
