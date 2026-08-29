import { createHash, randomBytes } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  type Dirent,
  existsSync,
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
import { basename, dirname, resolve } from 'node:path'
import { buildGoalDescriptionRolloutResolutionSynthesis } from './goalDescriptionRolloutResolutionSynthesis'
import { stableGoalBookJson } from './goalBookModel'
import { materializeGoalDescriptionRolloutBatchDualSummary } from './materializeGoalDescriptionRolloutBatch'
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

type JsonGoal = Record<string, unknown>
type Adjudication = {
  schemaVersion: number
  artifactType: string
  batchId: string
  subject: string
  materialized: boolean
  noProgressClaim: boolean
  campaignGoalCount: number
  resolvedGoalCount: number
  progressAccounting: {
    strictProgressGoalCount: number
    excludedFromProgressGoalIds: string[]
  }
  inputBinding: {
    configSha256: string
    batchManifestSha256: string
    dualSummarySha256: string
    bundleFingerprint: string
    reviewInputFingerprint: string
    roundA: { runManifestSha256: string; recordsSha256: string }
    roundB: { runManifestSha256: string; recordsSha256: string }
  }
  decisions: Array<{
    goalId: string
    roundA: { recordId: string; decision: string }
    roundB: { recordId: string; decision: string }
    resolutionDecision: string
    progressCounted: boolean
    rationale: string
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

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
const allowedArguments = new Set(['--write', '--check'])
const unexpectedArguments = process.argv.slice(2).filter((argument) => !allowedArguments.has(argument))
if (unexpectedArguments.length > 0) throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)
if (writeMode && checkMode) throw new Error('Use either --write or --check, not both')

const rolloutRoot = (
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-28'
)
const batchName = 'batch-025-e-mechanics-energy-current-20-v1'
const batchDirectory = `${rolloutRoot}/${batchName}`
const sourceConfigPath = `${rolloutRoot}/${batchName}.config.json`
const batchManifestPath = `${batchDirectory}/batch-manifest.json`
const dualSummaryPath = `${batchDirectory}/dual-summary.json`
const adjudicationPath = `${batchDirectory}/third-adjudication/adjudication.json`
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const semanticKindLedgerPath = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const expectedCurriculumAtomicDenominator = 461
const roundARecordsPath = (
  `${batchDirectory}/round-a/results/physik-rollout-v1-batch-025-e-mechanics-energy-`
  + 'current-20-v1-20260828-first-pass-a.batch-001.records.jsonl'
)
const roundARunPath = roundARecordsPath.replace('.records.jsonl', '.run.json')
const roundBRecordsPath = (
  `${batchDirectory}/round-b/results/physik-rollout-v1-batch-025-e-mechanics-energy-`
  + 'current-20-v1-20260828-first-pass-b.batch-001.records.jsonl'
)
const roundBRunPath = roundBRecordsPath.replace('.records.jsonl', '.run.json')

const sourceHashes = {
  config: 'b60924ec6896316c1fb3259370a656e19180d0490620453b5bae342d74c8d1f7',
  batchManifest: '7b92d30ad287b6f9fea4e95297d8e7fe683f9becd14955ca8565da972e65a692',
  dualSummary: '384c0f4cf154cfe9558e3d885e094e396a5290bf75afe9b3b47718645617fb24',
  adjudication: '5351bba08ffbb83590ce530eb9d026dfb35cea1c6d9da8b8adaef4b9c50b0003',
  roundARecords: 'ec3e9fc0c6d94c342ff96ee09ea58a98061832cc06976da610aa2ed134a9b5a6',
  roundARun: '721e1a263acaa8fca11bc2ff3e5e53d5533fcb636e916aaf2e61d8fef3036650',
  roundBRecords: 'f08e7206b82cb6b1fe525463c1e0e7f8f99127d6cd1049f3e3bb43df4dc05793',
  roundBRun: '79cc0a73a3c1ff0fdbe17293259722635e073675854c23e1b327c42e73bbadc2',
  semanticKindLedger: 'f880e255246c41aabc0ab346d43a074551cbd197b001905bfb46607d6639780f',
} as const
const expectedPlanSha256 = '509554843ae4c1d4636c1db1190e77641beb0b088d2f2f19fa8a6a3a97e12251'

const stableGoalIds = [
  '4a2bf015-052b-4af0-aed7-324259fa1a8a',
  '00245a43-eb89-47d2-92d7-21799dbec9f3',
  '94784e0a-7ddc-48be-91fb-dc82b78eb322',
  '7eeff2de-6015-49a6-a96e-a488d886dc9f',
] as const
const freshGoalIds = [
  'ce431132-dfc4-42c2-aff6-bd72035190f8',
  '971beafa-6ba5-4c82-ac8b-7ebf66eec3dd',
  'bf8517a9-142b-5789-826a-767f3b277998',
  'e4b38061-1f28-43ad-8371-a3e7c0e81856',
  '09029573-864f-40ca-bf8a-cee7bf6dcb73',
  '31a2ef52-114b-4d2c-a720-6ef5a390b6dc',
  '32b896b9-f2f1-4d4e-96ad-e869ac3d3759',
  'a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20',
  '5f289cdc-fda1-4058-b44f-041ba1398e79',
  'ad984bb6-e225-432a-952d-d83cda40b7f8',
  'c1c71daa-042b-4f4c-8c31-0ac366f5149e',
  '6affc2ea-ecd2-4fcd-8877-3ffa15b0425b',
  '91c49019-ea51-4ce5-a919-c91c45b25e83',
  '253a71d2-e751-4c63-acbe-238b71463cd8',
  '839ecc8f-3a60-418b-bc92-64bfeef33824',
  'f524f05c-4456-4fc3-a1f7-f40741fc1f16',
  'e790de73-f8e5-4027-bc05-9f12a0e8c9cb',
] as const
const splitChildId = 'bf8517a9-142b-5789-826a-767f3b277998'

const outputStem = 'stable-current-carryover-4-v1'
const synthesisRelativePath = `synthesis-decisions.${outputStem}.json`
const synthesisPath = `${batchDirectory}/${synthesisRelativePath}`
const resolutionDirectory = `resolutions-${outputStem}`
const resolutionDirectoryPath = `${batchDirectory}/${resolutionDirectory}`
const indexPath = `${batchDirectory}/resolution-index.${outputStem}.json`
const receiptPath = `${batchDirectory}/${outputStem}.compatibility-receipt.json`
const stagingSuffix = '.b025-stable-four-staging'
const stagingPath = (path: string): string => `${path}${stagingSuffix}`
const writeLockPath = `${batchDirectory}/.${outputStem}.write-lock`

type PlannedOutput = { path: string; bytes: Buffer }
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

const absolute = (path: string): string => resolve(repoRoot, path)
const sha256Hex = (bytes: string | Uint8Array): string => createHash('sha256').update(bytes).digest('hex')
const digest = (bytes: string | Uint8Array): GoalDescriptionSynthesisDigest => `sha256:${sha256Hex(bytes)}`
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const sameOrdered = (left: readonly string[], right: readonly string[]): boolean => (
  left.length === right.length && left.every((value, index) => value === right[index])
)
const classifyRealDirectory = ({
  path,
  role,
  allowAbsent,
}: {
  path: string
  role: string
  allowAbsent: boolean
}): RealDirectoryState => {
  const candidate = absolute(path)
  let isDirectory: boolean
  try {
    isDirectory = lstatSync(candidate).isDirectory()
  } catch (error) {
    if (hasErrorCode(error, 'ENOENT') && allowAbsent) return 'absent'
    if (hasErrorCode(error, 'ENOENT')) throw new Error(`Missing B025 stable-four ${role}: ${candidate}`)
    throw error
  }
  if (!isDirectory) {
    throw new Error(`B025 stable-four ${role} is not a real directory: ${candidate}`)
  }
  return 'real-directory'
}
const assertRealFile = (path: string, role: string): void => {
  const candidate = absolute(path)
  let isFile: boolean
  try {
    isFile = lstatSync(candidate).isFile()
  } catch (error) {
    if (hasErrorCode(error, 'ENOENT')) throw new Error(`Missing B025 stable-four ${role}: ${candidate}`)
    throw error
  }
  if (!isFile) throw new Error(`B025 stable-four ${role} is not a real file: ${candidate}`)
}
const assertSource = (path: string, expected: string): Buffer => {
  if (!existsSync(absolute(path))) throw new Error(`Missing bound B025 source: ${path}`)
  const bytes = readFileSync(absolute(path))
  const actual = sha256Hex(bytes)
  if (actual !== expected) throw new Error(`Bound B025 source drift: ${path}: ${actual} != ${expected}`)
  return bytes
}
const loadBoundSources = () => ({
  config: assertSource(sourceConfigPath, sourceHashes.config),
  batchManifest: assertSource(batchManifestPath, sourceHashes.batchManifest),
  dualSummary: assertSource(dualSummaryPath, sourceHashes.dualSummary),
  adjudication: assertSource(adjudicationPath, sourceHashes.adjudication),
  roundARecords: assertSource(roundARecordsPath, sourceHashes.roundARecords),
  roundARun: assertSource(roundARunPath, sourceHashes.roundARun),
  roundBRecords: assertSource(roundBRecordsPath, sourceHashes.roundBRecords),
  roundBRun: assertSource(roundBRunPath, sourceHashes.roundBRun),
  semanticKindLedger: assertSource(semanticKindLedgerPath, sourceHashes.semanticKindLedger),
})

const hasErrorCode = (error: unknown, code: string): boolean => (
  typeof error === 'object'
  && error !== null
  && 'code' in error
  && error.code === code
)

const assertWriteLockAbsent = (): void => {
  classifyRealDirectory({ path: batchDirectory, role: 'batch output parent', allowAbsent: false })
  try {
    lstatSync(absolute(writeLockPath))
  } catch (error) {
    if (hasErrorCode(error, 'ENOENT')) return
    throw error
  }
  throw new Error(
    `B025 stable-four write lock is present: ${writeLockPath}; `
    + 'treat it as a stale-crash lock and inspect the bounded output/staging state manually',
  )
}

const acquireWriteLock = (): void => {
  classifyRealDirectory({ path: batchDirectory, role: 'batch output parent', allowAbsent: false })
  try {
    mkdirSync(absolute(writeLockPath))
  } catch (error) {
    if (hasErrorCode(error, 'EEXIST')) assertWriteLockAbsent()
    throw error
  }
}

const releaseWriteLock = (): void => {
  const lock = absolute(writeLockPath)
  classifyRealDirectory({ path: batchDirectory, role: 'batch output parent', allowAbsent: false })
  classifyRealDirectory({ path: lock, role: 'write lock', allowAbsent: false })
  if (readdirSync(lock).length !== 0) {
    throw new Error(`B025 stable-four write lock unexpectedly contains entries: ${writeLockPath}`)
  }
  rmdirSync(lock)
}

const classifyExpectedFile = <ExactState extends string>({
  path,
  bytes,
  exactState,
  role,
}: PlannedOutput & {
  exactState: ExactState
  role: 'target' | 'staging' | 'preparation' | 'quarantine'
}): 'absent' | ExactState => {
  const candidate = absolute(path)
  let isFile: boolean
  try {
    isFile = lstatSync(candidate).isFile()
  } catch (error) {
    if (hasErrorCode(error, 'ENOENT')) return 'absent'
    throw error
  }
  if (!isFile) {
    throw new Error(`B025 stable-four ${role} has unknown non-file state: ${path}`)
  }
  const expectedSha256 = sha256Hex(bytes)
  const actualSha256 = sha256Hex(readFileSync(candidate))
  if (actualSha256 !== expectedSha256) {
    throw new Error(
      `B025 stable-four ${role} has unknown bytes: ${path}: ${actualSha256} != ${expectedSha256}`,
    )
  }
  return exactState
}

const classifyOutput = ({ path, bytes }: PlannedOutput): ClassifiedOutput => ({
  path,
  bytes,
  ...((): Pick<ClassifiedOutput, 'targetState' | 'stagingState'> => {
    const parent = dirname(absolute(path))
    const batchParent = absolute(batchDirectory)
    const resolutionParent = absolute(resolutionDirectoryPath)
    const parentState = parent === batchParent
      ? classifyRealDirectory({ path: parent, role: 'batch output parent', allowAbsent: false })
      : parent === resolutionParent
        ? classifyRealDirectory({ path: parent, role: 'dedicated resolution output parent', allowAbsent: true })
        : (() => { throw new Error(`Unexpected B025 stable-four output parent: ${parent}`) })()
    if (parentState === 'absent') return { targetState: 'absent', stagingState: 'absent' }
    return {
      targetState: classifyExpectedFile({ path, bytes, exactState: 'exact-after', role: 'target' }),
      stagingState: classifyExpectedFile({
        path: stagingPath(path),
        bytes,
        exactState: 'exact-staged',
        role: 'staging',
      }),
    }
  })(),
})

const classifyMaterialization = (
  outputs: readonly PlannedOutput[],
  privateResidueCount = 0,
): ClassifiedMaterialization => {
  const classified = outputs.map(classifyOutput)
  const exactAfterTargetCount = classified.filter(({ targetState }) => targetState === 'exact-after').length
  const exactStagedCount = classified.filter(({ stagingState }) => stagingState === 'exact-staged').length
  const absentTargetCount = classified.length - exactAfterTargetCount
  const absentStagingCount = classified.length - exactStagedCount
  const state: MaterializationState = privateResidueCount > 0
    ? 'resumable-mixed'
    : exactAfterTargetCount === 0 && exactStagedCount === 0
    ? 'exact-before'
    : exactAfterTargetCount === classified.length && exactStagedCount === 0
      ? 'exact-after'
      : 'resumable-mixed'
  return {
    state,
    outputs: classified,
    absentTargetCount,
    exactAfterTargetCount,
    absentStagingCount,
    exactStagedCount,
  }
}

const completionTimestamp = (
  dual: Awaited<ReturnType<typeof materializeGoalDescriptionRolloutBatchDualSummary>>,
): string => {
  const values = [...dual.first.resultPairs, ...dual.second.resultPairs]
    .map(({ run }) => Date.parse(run.completedAt))
  if (values.length === 0 || values.some((value) => !Number.isFinite(value))) {
    throw new Error('B025 blind runs must have valid completion timestamps')
  }
  return new Date(Math.max(...values) + 1000).toISOString()
}

const main = async (): Promise<void> => {
  const boundSources = loadBoundSources()
  const {
    config: configBytes,
    batchManifest: batchManifestBytes,
    dualSummary: boundDualSummaryBytes,
    adjudication: adjudicationBytes,
    roundARecords: roundARecordsBytes,
    roundARun: roundARunBytes,
    roundBRecords: roundBRecordsBytes,
    roundBRun: roundBRunBytes,
    semanticKindLedger: semanticKindLedgerBytes,
  } = boundSources
  const canonicalBytes = readFileSync(absolute(canonicalPath))
  const parsedLandscape = JSON.parse(canonicalBytes.toString('utf8')) as unknown
  if (
    typeof parsedLandscape !== 'object'
    || parsedLandscape === null
    || !Array.isArray((parsedLandscape as { goals?: unknown }).goals)
  ) throw new Error('Current B025 canonical landscape is missing its goals array')
  const landscape = parsedLandscape as { goals: JsonGoal[] }
  const semanticKindLedger = JSON.parse(semanticKindLedgerBytes.toString('utf8')) as SemanticKindLedger
  const adjudication = JSON.parse(adjudicationBytes.toString('utf8')) as Adjudication
  const stableGoalIdSet = new Set<string>(stableGoalIds)
  const freshGoalIdSet = new Set<string>(freshGoalIds)
  const splitChildOccurrences = freshGoalIds.filter((goalId) => goalId === splitChildId).length
  if (stableGoalIds.length !== 4 || stableGoalIdSet.size !== 4) {
    throw new Error('B025 stable scope must contain exactly four unique goal IDs')
  }
  if (freshGoalIds.length !== 17 || freshGoalIdSet.size !== 17) {
    throw new Error('B025 fresh exclusion scope must contain exactly seventeen unique goal IDs')
  }
  if (stableGoalIds.some((goalId) => freshGoalIdSet.has(goalId))) {
    throw new Error('Stable and fresh B025 scopes overlap')
  }
  if (splitChildOccurrences !== 1 || stableGoalIdSet.has(splitChildId)) {
    throw new Error('B025 split child must occur exactly once and only in the fresh exclusion scope')
  }
  const canonicalGoalCounts = new Map<string, number>()
  for (const goal of landscape.goals) {
    if (typeof goal.id !== 'string') continue
    canonicalGoalCounts.set(goal.id, (canonicalGoalCounts.get(goal.id) ?? 0) + 1)
  }
  const boundedScopeGoalIds = [...stableGoalIds, ...freshGoalIds]
  const nonUniqueCanonicalScopeGoalIds = boundedScopeGoalIds.filter((goalId) => (
    canonicalGoalCounts.get(goalId) !== 1
  ))
  if (nonUniqueCanonicalScopeGoalIds.length > 0) {
    throw new Error(
      `B025 stable/fresh scope goals must each occur exactly once in the current canonical: ${nonUniqueCanonicalScopeGoalIds.join(', ')}`,
    )
  }
  const ledgerDecisions = semanticKindLedger.decisions
  if (!Array.isArray(ledgerDecisions)) throw new Error('Bound B025 semantic-kind ledger has no decisions array')
  const curricularAtomicGoalIds = ledgerDecisions
    .filter(({ semanticKind, decisionStatus }) => (
      semanticKind === 'curricularAtomic' && decisionStatus === 'authoritative'
    ))
    .map(({ goalId }) => goalId)
  const curricularAtomicGoalIdSet = new Set(curricularAtomicGoalIds)
  const declaredCurriculumAtomicDenominator = semanticKindLedger.counts?.curricularAtomic
  if (
    semanticKindLedger.documentType !== 'semantic-kind-ledger'
    || semanticKindLedger.sourceLandscapePath !== canonicalPath
    || declaredCurriculumAtomicDenominator !== expectedCurriculumAtomicDenominator
    || semanticKindLedger.counts?.total !== landscape.goals.length
    || ledgerDecisions.length !== landscape.goals.length
    || curricularAtomicGoalIds.length !== expectedCurriculumAtomicDenominator
    || curricularAtomicGoalIdSet.size !== expectedCurriculumAtomicDenominator
    || boundedScopeGoalIds.some((goalId) => !curricularAtomicGoalIdSet.has(goalId))
  ) throw new Error('Bound B025 semantic-kind ledger path, counts, or curricularAtomic scope changed')
  const curriculumAtomicDenominator = declaredCurriculumAtomicDenominator
  const dual = await materializeGoalDescriptionRolloutBatchDualSummary(absolute(sourceConfigPath), false)
  if (!dual.bytes.equals(boundDualSummaryBytes)) throw new Error('Materialized B025 dual summary is not exact-bound')
  if (dual.summary.goals.some(({ goalId }) => goalId === splitChildId)) {
    throw new Error('B025 post-integration split child must not occur in the original 20-goal source batch')
  }

  if (
    adjudication.schemaVersion !== 1
    || adjudication.artifactType !== 'third_adjudication'
    || adjudication.batchId !== dual.prepared.manifest.batchId
    || adjudication.subject !== 'physik'
    || adjudication.materialized !== false
    || adjudication.noProgressClaim !== true
    || adjudication.campaignGoalCount !== 20
    || adjudication.resolvedGoalCount !== 0
    || adjudication.progressAccounting.strictProgressGoalCount !== 0
    || adjudication.inputBinding.configSha256 !== sourceHashes.config
    || adjudication.inputBinding.batchManifestSha256 !== sourceHashes.batchManifest
    || adjudication.inputBinding.dualSummarySha256 !== sourceHashes.dualSummary
    || adjudication.inputBinding.bundleFingerprint !== dual.prepared.manifest.artifacts.bundleFingerprint
    || adjudication.inputBinding.reviewInputFingerprint !== dual.prepared.manifest.artifacts.reviewInputFingerprint
    || adjudication.inputBinding.roundA.runManifestSha256 !== sourceHashes.roundARun
    || adjudication.inputBinding.roundA.recordsSha256 !== sourceHashes.roundARecords
    || adjudication.inputBinding.roundB.runManifestSha256 !== sourceHashes.roundBRun
    || adjudication.inputBinding.roundB.recordsSha256 !== sourceHashes.roundBRecords
  ) throw new Error('B025 adjudication contract or source bindings changed')

  const decisions = stableGoalIds.map((goalId) => adjudication.decisions.find((item) => item.goalId === goalId))
  if (decisions.some((item) => (
    !item
    || item.roundA.decision !== 'keep'
    || item.roundB.decision !== 'keep'
    || item.resolutionDecision !== 'keep_current'
    || item.progressCounted !== false
  ))) throw new Error('B025 stable-four adjudication no longer requires exactly two KEEP decisions per goal')
  const originalNonStableIds = dual.summary.goals
    .map(({ goalId }) => goalId)
    .filter((goalId) => !stableGoalIds.includes(goalId as typeof stableGoalIds[number]))
  const expectedOriginalNonStableIds = freshGoalIds.filter((goalId) => goalId !== splitChildId)
  if (!sameOrdered(originalNonStableIds, expectedOriginalNonStableIds)) {
    throw new Error('The explicit B025 fresh-17 exclusion no longer matches the source 20 plus split child')
  }
  if (!expectedOriginalNonStableIds.every((goalId) => (
    adjudication.progressAccounting.excludedFromProgressGoalIds.includes(goalId)
  ))) {
    throw new Error('B025 adjudication does not exclude every source-campaign fresh goal from progress')
  }

  const expectedGoals: GoalDescriptionRolloutSynthesisExpectedGoal[] = []
  const sources = new Map<string, {
    first: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
    second: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
  }>()
  const currentContexts: Array<{ goalId: string; canonicalContext: unknown; fingerprint: GoalDescriptionSynthesisDigest }> = []
  for (const goalId of stableGoalIds) {
    const firstResult = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.first, goalId, label: 'First' })
    const secondResult = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.second, goalId, label: 'Second' })
    if (firstResult.errors.length > 0 || secondResult.errors.length > 0 || !firstResult.source || !secondResult.source) {
      throw new Error(`${goalId}: source extraction failed: ${[...firstResult.errors, ...secondResult.errors].join(' | ')}`)
    }
    if (firstResult.source.decision !== 'keep' || secondResult.source.decision !== 'keep') {
      throw new Error(`${goalId}: expected exactly two KEEP source records`)
    }
    const adjudicated = decisions.find((item) => item?.goalId === goalId)
    if (
      firstResult.source.record?.recordId !== adjudicated?.roundA.recordId
      || secondResult.source.record?.recordId !== adjudicated?.roundB.recordId
    ) throw new Error(`${goalId}: adjudicated record IDs do not bind the extracted records`)

    const firstInput = dual.first.input.goals.find((goal) => goal.goalId === goalId)
    const secondInput = dual.second.input.goals.find((goal) => goal.goalId === goalId)
    const canonicalGoal = landscape.goals.find((goal) => goal.id === goalId)
    if (!firstInput || !secondInput || !canonicalGoal) throw new Error(`${goalId}: missing review input or canonical goal`)
    const canonicalContext = buildGoalDescriptionCanonicalContext(canonicalGoal)
    if (
      stableGoalBookJson(firstInput) !== stableGoalBookJson(secondInput)
      || stableGoalBookJson(firstInput.canonicalContext) !== stableGoalBookJson(canonicalContext)
    ) throw new Error(`${goalId}: blind inputs or current direct canonical context differ`)
    const finalText = {
      titleDe: firstInput.currentTitleDe,
      titleEn: firstInput.currentTitleEn,
      descriptionDe: firstInput.currentDescriptionDe,
      descriptionEn: firstInput.currentDescriptionEn,
    }
    const currentText = {
      titleDe: String(canonicalGoal.title ?? ''),
      titleEn: String(canonicalGoal.titleEn ?? ''),
      descriptionDe: String(canonicalGoal.description ?? ''),
      descriptionEn: String(canonicalGoal.descriptionEn ?? ''),
    }
    if (stableGoalBookJson(finalText) !== stableGoalBookJson(currentText)) {
      throw new Error(`${goalId}: reviewed bilingual text is not exact-current`)
    }
    expectedGoals.push({
      goalId,
      effectiveSemanticKind: 'curricularAtomic',
      goalFingerprint: firstInput.goalFingerprint as GoalDescriptionSynthesisDigest,
      pageFingerprint: firstInput.pageFingerprint as GoalDescriptionSynthesisDigest,
      goalReviewContextFingerprint: fingerprintGoalDescriptionReviewContext(firstInput),
      finalText,
      firstSource: firstResult.source,
      secondSource: secondResult.source,
    })
    sources.set(goalId, { first: firstResult.source, second: secondResult.source })
    currentContexts.push({ goalId, canonicalContext, fingerprint: digest(stableGoalBookJson(canonicalContext)) })
  }

  const firstGoal = expectedGoals[0]
  if (!firstGoal) throw new Error('B025 stable-four scope is empty')
  const synthesizedAt = completionTimestamp(dual)
  const expectedBindings = {
    batch: {
      batchId: dual.prepared.manifest.batchId,
      batchManifestDigest: digest(batchManifestBytes),
      configDigest: digest(configBytes),
      bundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint,
      bookDigest: dual.first.input.bookDigest as GoalDescriptionSynthesisDigest,
      reviewInputFingerprint: dual.first.input.reviewInputFingerprint as GoalDescriptionSynthesisDigest,
      dualSummaryDigest: digest(dual.bytes),
      canonicalLandscapeDigest: digest(canonicalBytes),
    },
    rounds: {
      first: buildGoalDescriptionRolloutSynthesisRoundBinding(firstGoal.firstSource.binding, dual.prepared.manifest.artifacts.rounds.first.batchInputFingerprint),
      second: buildGoalDescriptionRolloutSynthesisRoundBinding(firstGoal.secondSource.binding, dual.prepared.manifest.artifacts.rounds.second.batchInputFingerprint),
    },
    synthesizedAt,
    goals: expectedGoals,
  }
  const manifestId = 'physik-b025-stable4-synthesis-openai-codex-20260829'
  const manifestPayload: Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'> = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
    schemaVersion: 1,
    synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
    manifestId,
    authority: 'ai_synthesis',
    synthesizedBy: 'OpenAI Codex B025 stable-four compatibility synthesis candidate',
    synthesizedAt,
    batch: expectedBindings.batch,
    rounds: expectedBindings.rounds,
    decisions: expectedGoals.map((goal, index) => {
      const source = sources.get(goal.goalId)
      const adjudicated = decisions.find((item) => item?.goalId === goal.goalId)
      if (!source?.first.record || !source.second.record || !adjudicated) throw new Error(`${goal.goalId}: missing source record`)
      return {
        decisionId: `${manifestId}-decision-${String(index + 1).padStart(3, '0')}`,
        goalId: goal.goalId,
        effectiveSemanticKind: goal.effectiveSemanticKind,
        goalFingerprint: goal.goalFingerprint,
        pageFingerprint: goal.pageFingerprint,
        goalReviewContextFingerprint: goal.goalReviewContextFingerprint,
        finalText: goal.finalText,
        resolutionDecision: 'keep_current' as const,
        evidenceRound: 'first' as const,
        records: {
          first: { recordId: source.first.binding.recordId, recordDigest: source.first.binding.recordDigest },
          second: { recordId: source.second.binding.recordId, recordDigest: source.second.binding.recordDigest },
        },
        rationaleDe: `Beide unabhängigen Blindprüfungen bestätigen die unveränderte Kompetenz. Die erste Runde ist die ausgewählte Evidenz; die zweite bleibt als gebundene unabhängige Bestätigung erhalten. Drittentscheidung: ${adjudicated.rationale}`,
        rationaleEn: 'Both independent blind reviews confirm the unchanged competency. The first round is selected as evidence; the second remains bound as independent confirmation.',
      }
    }),
  }
  const synthesisManifest: GoalDescriptionRolloutSynthesisDecisionManifest = {
    ...manifestPayload,
    manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(manifestPayload),
  }
  const manifestValidation = await validateGoalDescriptionRolloutSynthesisDecisionManifest({ manifest: synthesisManifest, expected: expectedBindings })
  if (manifestValidation.errors.length > 0) throw new Error(`B025 stable-four synthesis: ${manifestValidation.errors.join(' | ')}`)
  const synthesisBytes = jsonBytes(synthesisManifest)

  const resolutionOutputs: Array<{ path: string; bytes: Buffer }> = []
  const indexEntries: Array<Record<string, unknown>> = []
  for (const goal of expectedGoals) {
    const source = sources.get(goal.goalId)
    const summaryGoal = dual.summary.goals.find(({ goalId }) => goalId === goal.goalId)
    const decision = synthesisManifest.decisions.find(({ goalId }) => goalId === goal.goalId)
    if (!source || !summaryGoal || !decision) throw new Error(`${goal.goalId}: incomplete synthesis alignment`)
    const synthesis = buildGoalDescriptionRolloutResolutionSynthesis({
      batchId: synthesisManifest.batch.batchId,
      manifest: synthesisManifest,
      decision,
      summaryGoal,
      firstSource: source.first,
      secondSource: source.second,
    })
    const resolution = buildGoalDescriptionDualRoundResolution({
      resolutionId: `physics-b025-stable4-current-carryover-v1-resolution-${goal.goalId}`,
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
        decisionId: decision.decisionId,
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
      synthesisDecisionManifestArtifact: { manifest: synthesisManifest, manifestBytes: synthesisBytes, manifestPath: synthesisRelativePath },
    })
    if (validation.errors.length > 0 || !validation.strictDescriptionComplete) {
      throw new Error(`${goal.goalId}: resolution incomplete: ${validation.errors.join(' | ')}`)
    }
    const bytes = jsonBytes(resolution)
    const relativePath = `${resolutionDirectory}/${goal.goalId}.resolution.json`
    resolutionOutputs.push({ path: `${batchDirectory}/${relativePath}`, bytes })
    indexEntries.push({
      goalId: goal.goalId,
      titleDe: resolution.goal.finalText.titleDe,
      groupId: dual.prepared.manifest.batchId,
      decision: resolution.decision,
      resolutionPath: relativePath,
      resolutionDigest: digest(bytes),
      resolutionFingerprint: resolution.resolutionFingerprint,
      strictDescriptionComplete: true,
    })
  }

  const index = {
    schemaVersion: 1,
    artifactSetId: `${dual.prepared.manifest.batchId}-stable-current-carryover-4`,
    subject: dual.prepared.manifest.subjectLabel,
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: stableGoalIds.length,
    curriculumAtomicDenominator,
    descriptionReviewPercentage: Number((
      (stableGoalIds.length / curriculumAtomicDenominator) * 100
    ).toFixed(1)),
    groups: [{
      groupId: dual.prepared.manifest.batchId,
      artifactDirectory: '.',
      dualSummaryPath: 'dual-summary.json',
      dualSummaryDigest: digest(dual.bytes),
      campaignGoalCount: dual.summary.goalCount,
      resolvedGoalCount: 4,
    }],
    resolutions: indexEntries,
  }
  const indexBytes = jsonBytes(index)
  const receiptBody = {
    schemaVersion: 1,
    receiptId: 'physik-b025-stable-current-carryover-4-v1-20260829',
    purpose: 'Bounded carryover of exactly four unchanged B025 goals while seventeen post-integration goals require fresh blind review.',
    source: {
      configPath: sourceConfigPath,
      configSha256: `sha256:${sourceHashes.config}`,
      batchManifestPath,
      batchManifestSha256: `sha256:${sourceHashes.batchManifest}`,
      dualSummaryPath,
      dualSummarySha256: `sha256:${sourceHashes.dualSummary}`,
      adjudicationPath,
      adjudicationSha256: `sha256:${sourceHashes.adjudication}`,
      semanticKindLedgerPath,
      semanticKindLedgerSha256: digest(semanticKindLedgerBytes),
      curriculumAtomicDenominator,
      roundA: { recordsPath: roundARecordsPath, recordsSha256: digest(roundARecordsBytes), runPath: roundARunPath, runSha256: digest(roundARunBytes) },
      roundB: { recordsPath: roundBRecordsPath, recordsSha256: digest(roundBRecordsBytes), runPath: roundBRunPath, runSha256: digest(roundBRunBytes) },
    },
    currentCanonicalLandscape: { path: canonicalPath, sha256: digest(canonicalBytes) },
    currentCanonicalContexts: currentContexts,
    claimedGoalIds: stableGoalIds,
    explicitlyExcludedFreshGoalIds: freshGoalIds,
    synthesisManifestPath: synthesisRelativePath,
    synthesisManifestDigest: digest(synthesisBytes),
    synthesisManifestFingerprint: synthesisManifest.manifestFingerprint,
    resolutionIndexPath: indexPath.replace(`${batchDirectory}/`, ''),
    resolutionIndexDigest: digest(indexBytes),
    noProgressClaimUntilCentralFreshReviewAndFiveGates: true,
    safeguards: {
      exactlyTwoKeepRecordsPerGoalRequired: true,
      sourceRunsAndRecordsByteBound: true,
      exactCurrentBilingualTextsRequired: true,
      currentDirectCanonicalContextsRefingerprinted: true,
      freshSeventeenExplicitlyExcluded: true,
      semanticKindLedgerByteBoundAndCountValidated: true,
      exactStableFourAndFreshSeventeenScopesValidated: true,
      realOutputParentDirectoriesRequired: true,
      dedicatedResolutionDirectoryRejectsUnknownEntries: true,
      outputAndAdjacentStagingStatesFailClosed: true,
      missingOutputsFullyStagedWithExclusiveCreate: true,
      partialWxPreparationCannotPoisonAdjacentStaging: true,
      atomicNoClobberHardLinkPublish: true,
      classifiedCrashStatesForwardResumableAfterStaleLockReview: true,
      privateCrashResiduesInventoriedAndResumable: true,
      exclusiveBatchWriteLockSerializesStagingCleanup: true,
      rollbackNeverDeletesUnverifiedBytes: true,
      openAiReviewFreezeRequiredBeforeWrite: true,
    },
  } as const
  const outputsWithoutReceipt = [
    { path: synthesisPath, bytes: synthesisBytes },
    ...resolutionOutputs,
    { path: indexPath, bytes: indexBytes },
  ]
  const currentCanonicalSha256 = sha256Hex(canonicalBytes)
  const buildPlanSha256 = (canonicalSha256: string): string => sha256Hex(jsonBytes({
    sourceHashes,
    currentCanonicalSha256: canonicalSha256,
    stableGoalIds,
    freshGoalIds,
    outputs: outputsWithoutReceipt.map(({ path, bytes }) => ({ path, sha256: sha256Hex(bytes) })),
    receiptPath,
    receiptBody,
  }))
  const planSha256 = buildPlanSha256(currentCanonicalSha256)
  const receiptBytes = jsonBytes({ ...receiptBody, materializationPlanSha256: `sha256:${planSha256}` })
  const outputs: PlannedOutput[] = [...outputsWithoutReceipt, { path: receiptPath, bytes: receiptBytes }]
  const plannedOutputSha256 = new Map(outputs.map(({ path, bytes }) => [path, sha256Hex(bytes)]))
  type PrivateResidue = {
    directory: string
    output: PlannedOutput
    payload: string | null
    payloadSha256: string | null
  }

  const privatePayloadName = 'prepared-output'
  const privateWorkPrefix = (output: PlannedOutput): string => {
    const outputSha256 = plannedOutputSha256.get(output.path)
    if (!outputSha256) throw new Error(`${output.path}: missing B025 planned output hash`)
    const pathKey = sha256Hex(Buffer.from(output.path)).slice(0, 16)
    return `.b025-stable-four-prepare-${pathKey}-${outputSha256}-`
  }
  const outputParents = [...new Set(outputs.map(({ path }) => dirname(absolute(path))))]
  const expectedStagingPaths = new Set(outputs.map(({ path }) => absolute(stagingPath(path))))
  const batchOutputParent = absolute(batchDirectory)
  const dedicatedResolutionOutputParent = absolute(resolutionDirectoryPath)
  const dedicatedResolutionOutputs = outputs.filter(({ path }) => (
    dirname(absolute(path)) === dedicatedResolutionOutputParent
  ))
  if (dedicatedResolutionOutputs.length !== stableGoalIds.length) {
    throw new Error('B025 dedicated resolution output scope no longer contains exactly four planned files')
  }
  const expectedDedicatedResolutionEntryNames = new Set(dedicatedResolutionOutputs.flatMap(({ path }) => [
    basename(path),
    basename(stagingPath(path)),
  ]))

  const ensurePlannedOutputParent = (output: PlannedOutput): void => {
    const parent = dirname(absolute(output.path))
    classifyRealDirectory({ path: batchOutputParent, role: 'batch output parent', allowAbsent: false })
    if (parent === batchOutputParent) return
    if (parent !== dedicatedResolutionOutputParent) {
      throw new Error(`${output.path}: unexpected B025 stable-four output parent ${parent}`)
    }
    const currentState = classifyRealDirectory({
      path: parent,
      role: 'dedicated resolution output parent',
      allowAbsent: true,
    })
    if (currentState === 'real-directory') return
    try {
      mkdirSync(parent)
    } catch (error) {
      if (!hasErrorCode(error, 'EEXIST')) throw error
    }
    classifyRealDirectory({
      path: parent,
      role: 'dedicated resolution output parent',
      allowAbsent: false,
    })
  }

  const inspectPrivateResidues = (): PrivateResidue[] => {
    const residues: PrivateResidue[] = []
    const definitions = outputs.map((output) => ({
      output,
      parent: dirname(absolute(output.path)),
      prefix: privateWorkPrefix(output),
    }))
    for (const parent of outputParents) {
      const isDedicatedResolutionParent = parent === dedicatedResolutionOutputParent
      const parentState = classifyRealDirectory({
        path: parent,
        role: isDedicatedResolutionParent
          ? 'dedicated resolution output parent'
          : 'batch output parent',
        allowAbsent: isDedicatedResolutionParent,
      })
      if (parentState === 'absent') continue
      const entries: Dirent[] = readdirSync(parent, { encoding: 'utf8', withFileTypes: true })
      for (const entry of entries) {
        const entryPath = resolve(parent, entry.name)
        const isPrivateWorkEntry = (
          entry.name.startsWith('.b025-stable-four-prepare-')
          || entry.name.startsWith('.b025-stable-four-cleanup-')
        )
        if (
          isDedicatedResolutionParent
          && !expectedDedicatedResolutionEntryNames.has(entry.name)
          && !isPrivateWorkEntry
        ) {
          throw new Error(`Unknown entry in dedicated B025 stable-four resolution output directory: ${entryPath}`)
        }
        if (entry.name.endsWith(stagingSuffix) && !expectedStagingPaths.has(entryPath)) {
          throw new Error(`Unknown adjacent B025 stable-four staging path: ${entryPath}`)
        }
        if (!isPrivateWorkEntry) continue
        const matches = definitions.filter(({ parent: candidateParent, prefix }) => (
          candidateParent === parent && entry.name.startsWith(prefix)
        ))
        if (matches.length !== 1 || !entry.isDirectory()) {
          throw new Error(`Unknown B025 stable-four private work entry: ${entryPath}`)
        }
        classifyRealDirectory({ path: entryPath, role: 'private preparation directory', allowAbsent: false })
        const definition = matches[0]
        const privateEntries = readdirSync(entryPath, { encoding: 'utf8', withFileTypes: true })
        if (privateEntries.length === 0) {
          residues.push({
            directory: entryPath,
            output: definition.output,
            payload: null,
            payloadSha256: null,
          })
          continue
        }
        if (
          privateEntries.length !== 1
          || privateEntries[0].name !== privatePayloadName
          || !privateEntries[0].isFile()
        ) throw new Error(`Unknown B025 stable-four private work contents: ${entryPath}`)
        const payload = resolve(entryPath, privatePayloadName)
        assertRealFile(payload, 'private preparation payload')
        const payloadSha256 = sha256Hex(readFileSync(payload))
        residues.push({
          directory: entryPath,
          output: definition.output,
          payload,
          payloadSha256,
        })
      }
    }
    return residues
  }

  const recoverPrivateResidues = (residues: readonly PrivateResidue[]): void => {
    for (const residue of residues) {
      classifyRealDirectory({
        path: residue.directory,
        role: 'private preparation directory during recovery',
        allowAbsent: false,
      })
      if (residue.payload) {
        assertRealFile(residue.payload, 'private preparation payload during recovery')
        const actualSha256 = sha256Hex(readFileSync(residue.payload))
        if (actualSha256 !== residue.payloadSha256) {
          throw new Error(
            `${residue.output.path}: B025 private preparation residue changed before recovery: `
            + `${actualSha256} != ${residue.payloadSha256}`,
          )
        }
        unlinkSync(residue.payload)
      }
      if (readdirSync(residue.directory).length !== 0) {
        throw new Error(`${residue.output.path}: B025 private residue is not empty after verified recovery`)
      }
      rmdirSync(residue.directory)
    }
    const remaining = inspectPrivateResidues()
    if (remaining.length > 0) {
      throw new Error(`B025 stable-four private residue recovery left ${remaining.length} entry or entries`)
    }
  }

  const assertCurrentInputsAndPlan = (label: string): void => {
    loadBoundSources()
    const reboundCanonicalSha256 = sha256Hex(readFileSync(absolute(canonicalPath)))
    if (reboundCanonicalSha256 !== currentCanonicalSha256) {
      throw new Error(
        `${label}: B025 stable-four canonical drift: ${reboundCanonicalSha256} != ${currentCanonicalSha256}`,
      )
    }
    const reboundPlanSha256 = buildPlanSha256(reboundCanonicalSha256)
    if (reboundPlanSha256 !== planSha256) {
      throw new Error(`${label}: B025 stable-four plan rebind failed: ${reboundPlanSha256} != ${planSha256}`)
    }
    if (expectedPlanSha256 !== 'PENDING' && reboundPlanSha256 !== expectedPlanSha256) {
      throw new Error(`${label}: B025 stable-four bound plan drift: ${reboundPlanSha256} != ${expectedPlanSha256}`)
    }
    for (const { path, bytes } of outputs) {
      const actual = sha256Hex(bytes)
      const expected = plannedOutputSha256.get(path)
      if (!expected || actual !== expected) {
        throw new Error(`${label}: B025 stable-four planned output buffer drift: ${path}: ${actual} != ${expected}`)
      }
    }
  }

  const privateWorkDirectory = (output: PlannedOutput): string => {
    const parent = dirname(absolute(stagingPath(output.path)))
    ensurePlannedOutputParent(output)
    const nonce = randomBytes(16).toString('hex')
    const directory = mkdtempSync(resolve(parent, `${privateWorkPrefix(output)}${process.pid}-${nonce}-`))
    classifyRealDirectory({ path: directory, role: 'new private preparation directory', allowAbsent: false })
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
    classifyRealDirectory({ path: directory, role: 'private preparation directory', allowAbsent: false })
    const state = classifyExpectedFile({
      path,
      bytes: output.bytes,
      exactState: 'exact-private',
      role: 'preparation',
    })
    if (state !== 'exact-private') {
      throw new Error(`${output.path}: refusing to unlink missing B025 private preparation file`)
    }
    unlinkSync(path)
    rmdirSync(directory)
  }

  const createExactAdjacentStaging = (output: PlannedOutput): void => {
    const staging = absolute(stagingPath(output.path))
    ensurePlannedOutputParent(output)
    const preparationDirectory = privateWorkDirectory(output)
    const preparation = resolve(preparationDirectory, privatePayloadName)
    writeFileSync(preparation, output.bytes, { flag: 'wx' })
    const preparedState = classifyExpectedFile({
      path: preparation,
      bytes: output.bytes,
      exactState: 'exact-prepared',
      role: 'preparation',
    })
    if (preparedState !== 'exact-prepared') {
      throw new Error(`${output.path}: B025 private wx preparation is not exact`)
    }
    try {
      linkSync(preparation, staging)
    } catch (error) {
      const racedStagingState = classifyExpectedFile({
        path: stagingPath(output.path),
        bytes: output.bytes,
        exactState: 'exact-staged',
        role: 'staging',
      })
      if (racedStagingState !== 'exact-staged') throw error
    }
    const stagedState = classifyExpectedFile({
      path: stagingPath(output.path),
      bytes: output.bytes,
      exactState: 'exact-staged',
      role: 'staging',
    })
    if (stagedState !== 'exact-staged') {
      throw new Error(`${output.path}: B025 adjacent staging link is not exact`)
    }
    unlinkPrivateExactFile({
      path: preparation,
      directory: preparationDirectory,
      output,
    })
  }

  const unlinkExactStagingUnderLock = (output: PlannedOutput): void => {
    const classified = classifyOutput(output)
    if (classified.stagingState !== 'exact-staged') {
      throw new Error(`${output.path}: refusing to unlink missing B025 staging under the write lock`)
    }
    unlinkSync(absolute(stagingPath(output.path)))
  }

  const stageEveryMissingOutput = (): void => {
    for (const output of outputs) {
      let classified = classifyOutput(output)
      if (classified.targetState === 'exact-after') continue
      if (classified.stagingState === 'absent') {
        createExactAdjacentStaging(output)
      }
      classified = classifyOutput(output)
      if (classified.targetState === 'absent' && classified.stagingState !== 'exact-staged') {
        throw new Error(`${output.path}: missing B025 stable-four output is not fully exact-staged`)
      }
    }
    const staged = classifyMaterialization(outputs)
    const unstaged = staged.outputs.filter(({ targetState, stagingState }) => (
      targetState === 'absent' && stagingState === 'absent'
    ))
    if (unstaged.length > 0) {
      throw new Error(`B025 stable-four full staging failed for ${unstaged.length} missing output(s)`)
    }
  }

  const publishNoClobber = (output: PlannedOutput): void => {
    let classified = classifyOutput(output)
    if (classified.targetState === 'absent') {
      if (classified.stagingState !== 'exact-staged') {
        throw new Error(`${output.path}: refusing B025 publish without exact adjacent staging`)
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
      throw new Error(`${output.path}: B025 no-clobber publish did not produce exact-after`)
    }
    if (classified.stagingState === 'exact-staged') {
      unlinkExactStagingUnderLock(output)
    }
    if (classifyOutput(output).targetState !== 'exact-after') {
      throw new Error(`${output.path}: exact B025 output changed after staging cleanup`)
    }
  }

  if (expectedPlanSha256 !== 'PENDING' && planSha256 !== expectedPlanSha256) {
    throw new Error(`B025 stable-four plan drift: ${planSha256} != ${expectedPlanSha256}`)
  }
  assertWriteLockAbsent()
  let privateResidues = inspectPrivateResidues()
  let materialization = classifyMaterialization(outputs, privateResidues.length)
  if ((writeMode || checkMode) && expectedPlanSha256 === 'PENDING') {
    throw new Error(`Refusing --${writeMode ? 'write' : 'check'} until expectedPlanSha256 is bound to ${planSha256}`)
  }
  if (checkMode && materialization.state !== 'exact-after') {
    throw new Error(
      `B025 stable-four --check requires complete exact-after without staging; state=${materialization.state} `
      + `targets=${materialization.exactAfterTargetCount}/${outputs.length} `
      + `staged=${materialization.exactStagedCount}`,
    )
  }
  if (writeMode) {
    execFileSync('node', ['scripts/check_openai_plugin_review_freeze.mjs'], { cwd: repoRoot, stdio: 'inherit' })
    acquireWriteLock()
    try {
      recoverPrivateResidues(privateResidues)
      privateResidues = []
      assertCurrentInputsAndPlan('Immediate pre-staging rebind')
      stageEveryMissingOutput()
      privateResidues = inspectPrivateResidues()
      if (privateResidues.length > 0) {
        throw new Error(`B025 stable-four staging left ${privateResidues.length} private residue(s)`)
      }
      assertCurrentInputsAndPlan('Immediate pre-publish rebind')
      for (const output of outputs) publishNoClobber(output)
      assertCurrentInputsAndPlan('Post-write rebind')
      privateResidues = inspectPrivateResidues()
      materialization = classifyMaterialization(outputs, privateResidues.length)
      if (materialization.state !== 'exact-after') {
        throw new Error(
          `B025 stable-four post-write state is not complete exact-after without staging: ${materialization.state}`,
        )
      }
    } finally {
      releaseWriteLock()
    }
    assertWriteLockAbsent()
  }

  console.log(JSON.stringify({
    mode: writeMode ? 'WRITE' : checkMode ? 'CHECK' : 'PLAN',
    status: expectedPlanSha256 === 'PENDING' ? 'PENDING_BINDING' : 'BOUND',
    stableGoalIds,
    explicitlyExcludedFreshGoalIds: freshGoalIds,
    outputCount: outputs.length,
    materializationState: materialization.state,
    targetStates: {
      absent: materialization.absentTargetCount,
      exactAfter: materialization.exactAfterTargetCount,
    },
    stagingStates: {
      absent: materialization.absentStagingCount,
      exactStaged: materialization.exactStagedCount,
    },
    privateResidueCount: privateResidues.length,
    outputs: materialization.outputs.map(({ path, bytes, targetState, stagingState }) => ({
      path,
      sha256: sha256Hex(bytes),
      targetState,
      stagingState,
    })),
    planSha256,
  }, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
