import { createHash, randomBytes } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  type Dirent,
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
type SynthesisAuthoring = {
  evidenceRound: 'first' | 'second'
  rationaleDe: string
  rationaleEn: string
}
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

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
const allowedArguments = new Set(['--write', '--check'])
const unexpectedArguments = process.argv.slice(2).filter((argument) => !allowedArguments.has(argument))
if (unexpectedArguments.length > 0) throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)
if (writeMode && checkMode) throw new Error('Use either --write or --check, not both')

const rolloutRoot = (
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-29'
)
const batchName = 'batch-025a-e-mechanics-energy-structural-follow-up-17-v1'
const batchDirectory = `${rolloutRoot}/${batchName}`
const sourceConfigPath = `${rolloutRoot}/${batchName}.config.json`
const batchManifestPath = `${batchDirectory}/batch-manifest.json`
const dualSummaryPath = `${batchDirectory}/dual-summary.json`
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const semanticKindLedgerPath = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const expectedCurriculumAtomicDenominator = 461
const resultStem = (
  'physik-rollout-v1-batch-025a-e-mechanics-energy-structural-follow-up-17-v1-20260829-'
  + 'first-pass'
)
const roundARecordsPath = `${batchDirectory}/round-a/results/${resultStem}-a.batch-001.records.jsonl`
const roundARunPath = roundARecordsPath.replace('.records.jsonl', '.run.json')
const roundBRecordsPath = `${batchDirectory}/round-b/results/${resultStem}-b.batch-001.records.jsonl`
const roundBRunPath = roundBRecordsPath.replace('.records.jsonl', '.run.json')

const sourceHashes = {
  config: '7c3f610555750be16dea5f242b001c6b4bdc2f71a0dea16ccb249401f6a522e1',
  batchManifest: '739e068a7ac33103e4b0d09fc5d1b6765e166e816286c529f7d2addd424d0bb6',
  dualSummary: '7c47d894654f9f24dd67212af5361ab59080f351b0978ebf173c480d417dd51c',
  roundARecords: 'f4050489d29702d3e9b80a28ae3d9079da91e80efcadbada709745961af5689e',
  roundARun: 'dbf7bda526505ac444726c10c89a8b7741d7574de078a1382780883ae53bc1b2',
  roundBRecords: '3b19b758f08f95a81c1e7f3ed9120a2999fc009f49073159a3f148086b0ebcfe',
  roundBRun: 'bef87e512ce01e302d9e7d1255e9fa63a99611f085adf8f9bbe43d1fc3e715f5',
  semanticKindLedger: 'f880e255246c41aabc0ab346d43a074551cbd197b001905bfb46607d6639780f',
} as const

const expectedBatchBindings = {
  batchId: 'physik-rollout-v1-batch-025a-e-mechanics-energy-structural-follow-up-17-v1-20260829',
  configDigest: `sha256:${sourceHashes.config}`,
  baseBookDigest: 'sha256:d4e3ff74a34dbd7827b745977736e4d8dfd6dd5f9b4341476e7f154ec9fda40e',
  bookDigest: 'sha256:7987ffdeeecdf567dbb7292b126694139815ece34144d07297f18dbe73bcd94a',
  bundleFingerprint: 'sha256:5d5df15d9edcd57b55913c4071321bee222566b7d0194162d497bf289d351eeb',
  reviewInputFingerprint: 'sha256:f3d37c4f6577734f1b0df1e3802e6ab90477cf0a76903cc263ba2ada36851a8d',
  roundABatchInputFingerprint: 'sha256:37b045187785bd3d86ef06c3621101a18950a99787c0f07f7f6afdb3010b68e1',
  roundBBatchInputFingerprint: 'sha256:348e616c2c2eb461f216b505d5df157e9e2f65eead86be94c59b4ca4c3254a57',
} as const
const expectedPlanSha256 = '7b4c8af0b1a7dd39b6f1069a974edaffe9e8984810b45b65218133c7435fda2e'

const campaignGoalIds = [
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
const stableGoalIds = [
  'ce431132-dfc4-42c2-aff6-bd72035190f8',
  '971beafa-6ba5-4c82-ac8b-7ebf66eec3dd',
  'bf8517a9-142b-5789-826a-767f3b277998',
  'e4b38061-1f28-43ad-8371-a3e7c0e81856',
  '09029573-864f-40ca-bf8a-cee7bf6dcb73',
  '31a2ef52-114b-4d2c-a720-6ef5a390b6dc',
  '5f289cdc-fda1-4058-b44f-041ba1398e79',
  'ad984bb6-e225-432a-952d-d83cda40b7f8',
  'c1c71daa-042b-4f4c-8c31-0ac366f5149e',
  '6affc2ea-ecd2-4fcd-8877-3ffa15b0425b',
  '91c49019-ea51-4ce5-a919-c91c45b25e83',
  '839ecc8f-3a60-418b-bc92-64bfeef33824',
] as const
const excludedRevisionDecisions = [
  { goalId: '32b896b9-f2f1-4d4e-96ad-e869ac3d3759', first: 'keep', second: 'revise' },
  { goalId: 'a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20', first: 'block', second: 'revise' },
  { goalId: '253a71d2-e751-4c63-acbe-238b71463cd8', first: 'revise', second: 'revise' },
  { goalId: 'f524f05c-4456-4fc3-a1f7-f40741fc1f16', first: 'revise', second: 'revise' },
  { goalId: 'e790de73-f8e5-4027-bc05-9f12a0e8c9cb', first: 'block', second: 'revise' },
] as const

const synthesisByGoalId = new Map<string, SynthesisAuthoring>([
  ['ce431132-dfc4-42c2-aff6-bd72035190f8', {
    evidenceRound: 'second',
    rationaleDe: 'Beide Blindprüfungen bestätigen den aktuellen Wortlaut. Runde B wird gewählt, weil sie Messdaten und abgeleitete Größen ausdrücklich trennt, Größen und Einheiten in allen drei Diagrammen verlangt und den Transfer auf eine neue Mehrphasenbewegung bindet; Runde A bleibt als unabhängige Bestätigung gebunden.',
    rationaleEn: 'Both blind reviews confirm the current wording. Round B is selected because it explicitly separates measured and derived quantities, requires quantities and units in all three graphs, and binds transfer to a new multi-phase motion; Round A remains bound as independent confirmation.',
  }],
  ['971beafa-6ba5-4c82-ac8b-7ebf66eec3dd', {
    evidenceRound: 'second',
    rationaleDe: 'Beide Blindprüfungen bestätigen den aktuellen Wortlaut. Runde B operationalisiert die vorzeichenbehaftete Geschwindigkeit, die gewählte positive Richtung, Messstreuung und Diagrammform sowie den Achsenwechsel besonders vollständig; Runde A bleibt als unabhängige Bestätigung gebunden.',
    rationaleEn: 'Both blind reviews confirm the current wording. Round B most fully operationalizes signed velocity, the chosen positive direction, measurement scatter and graph shape, and reversal of the coordinate axis; Round A remains bound as independent confirmation.',
  }],
  ['bf8517a9-142b-5789-826a-767f3b277998', {
    evidenceRound: 'first',
    rationaleDe: 'Beide Blindprüfungen bestätigen den aktuellen Wortlaut. Runde A trennt endliches Intervall und lokalen Zeitpunkt besonders klar und prüft mit dem Hin-und-Rück-Fall unabhängig, warum verschwindende Durchschnittsgeschwindigkeit nicht verschwindende Momentangeschwindigkeiten zulässt; Runde B bleibt gebunden.',
    rationaleEn: 'Both blind reviews confirm the current wording. Round A most clearly separates a finite interval from a local instant and independently tests, through an out-and-back case, why zero average velocity permits nonzero instantaneous velocities; Round B remains bound.',
  }],
  ['e4b38061-1f28-43ad-8371-a3e7c0e81856', {
    evidenceRound: 'first',
    rationaleDe: 'Beide Blindprüfungen bestätigen den aktuellen Wortlaut. Runde A verlangt die eigenständige Konstruktion aller drei Darstellungen und verbindet Anfangswerte, Vorzeichen, Steigungen, Flächen, Einheiten und Umkehrzeitpunkt zu einer stärkeren Konsistenzprüfung; Runde B bleibt gebunden.',
    rationaleEn: 'Both blind reviews confirm the current wording. Round A requires independent construction of all three representations and connects initial values, signs, slopes, areas, units, and reversal time in the stronger consistency check; Round B remains bound.',
  }],
  ['09029573-864f-40ca-bf8a-cee7bf6dcb73', {
    evidenceRound: 'second',
    rationaleDe: 'Beide Blindprüfungen bestätigen den aktuellen Wortlaut. Runde B bildet Planung oder Nutzung einer sicheren Messung, grafische Bestimmung von g, begründete Unsicherheit, Modellpassung und den Transfer auf geänderte Achse sowie merklichen Luftwiderstand am vollständigsten ab; Runde A bleibt gebunden.',
    rationaleEn: 'Both blind reviews confirm the current wording. Round B most fully covers planning or using a safe measurement, graphical determination of g, justified uncertainty, model fit, and transfer to a changed axis and appreciable drag; Round A remains bound.',
  }],
  ['31a2ef52-114b-4d2c-a720-6ef5a390b6dc', {
    evidenceRound: 'first',
    rationaleDe: 'Beide Blindprüfungen bestätigen den aktuellen Wortlaut. Runde A fordert eine gerichtete Darstellung der äußeren Kräfte, die vektorielle Resultierende und einen bereits bewegten Körper mit ausgeglichenen Antriebs- und Widerstandskräften und grenzt damit die zentrale Fehlvorstellung am schärfsten ab; Runde B bleibt gebunden.',
    rationaleEn: 'Both blind reviews confirm the current wording. Round A requires a directional representation of external forces, their vector resultant, and an already moving body with balanced driving and resistive forces, most sharply separating the central misconception; Round B remains bound.',
  }],
  ['5f289cdc-fda1-4058-b44f-041ba1398e79', {
    evidenceRound: 'second',
    rationaleDe: 'Beide Blindprüfungen bestätigen den aktuellen Wortlaut. Runde B verbindet Körperabgrenzung, vollständige vorzeichenrichtige Kräftebilanz, Richtungsplausibilität und den Transfer zwischen Achsenumkehr, Vorzeichenwechsel der Resultierenden und Beschleunigung ohne Geschwindigkeit und Beschleunigung zu verwechseln; Runde A bleibt gebunden.',
    rationaleEn: 'Both blind reviews confirm the current wording. Round B connects system isolation, a complete signed force balance, directional plausibility, and transfer among axis reversal, a change in the resultant sign, and acceleration without confusing velocity and acceleration; Round A remains bound.',
  }],
  ['ad984bb6-e225-432a-952d-d83cda40b7f8', {
    evidenceRound: 'second',
    rationaleDe: 'Beide Blindprüfungen bestätigen den aktuellen Wortlaut. Runde B verlangt getrennte Kraftdarstellungen für beide Körper und widerlegt sowohl die Verwechslung mit zwei Kräften auf demselben Körper als auch eine zeitlich versetzte Ursache-Wirkungs-Deutung; Runde A bleibt gebunden.',
    rationaleEn: 'Both blind reviews confirm the current wording. Round B requires separate force representations for both bodies and rejects both confusion with two forces on one body and a time-delayed cause-and-effect interpretation; Round A remains bound.',
  }],
  ['c1c71daa-042b-4f4c-8c31-0ac366f5149e', {
    evidenceRound: 'second',
    rationaleDe: 'Beide Blindprüfungen bestätigen den aktuellen Wortlaut. Runde B bindet Systemgrenze, Kraftanteil in Wegrichtung, Vorzeichenkonvention, weitere Übertragungen und den Transfer auf schräge Kraft oder neu gewählte Systemgrenze in einer besonders vollständigen Energiebilanz; Runde A bleibt gebunden.',
    rationaleEn: 'Both blind reviews confirm the current wording. Round B binds the system boundary, force component along the displacement, sign convention, additional transfers, and transfer to an oblique force or a newly chosen boundary in an especially complete energy balance; Round A remains bound.',
  }],
  ['6affc2ea-ecd2-4fcd-8877-3ffa15b0425b', {
    evidenceRound: 'second',
    rationaleDe: 'Beide Blindprüfungen bestätigen den aktuellen Wortlaut. Runde B macht das Erde-Körper-System, das frei gewählte Nullniveau, mögliche negative Bezugswerte und die Invarianz der Energieänderung bei Weg- oder Nullniveauwechsel gemeinsam beobachtbar; Runde A bleibt gebunden.',
    rationaleEn: 'Both blind reviews confirm the current wording. Round B jointly makes observable the Earth-object system, the freely chosen zero level, possible negative reference values, and invariance of the energy change under a path or zero-level change; Round A remains bound.',
  }],
  ['91c49019-ea51-4ce5-a919-c91c45b25e83', {
    evidenceRound: 'second',
    rationaleDe: 'Beide Blindprüfungen bestätigen den aktuellen Wortlaut. Runde B prüft die Grenzbedingung fehlender Energieübertragung ausdrücklich und überträgt dieselbe Situation auf eine andere Systemgrenze, sodass entweder eine geschlossene Bilanz oder eine Bilanz mit Übertragungstermen begründet werden muss; Runde A bleibt gebunden.',
    rationaleEn: 'Both blind reviews confirm the current wording. Round B explicitly tests the no-transfer boundary condition and transfers the same situation to a different system boundary, requiring justification of either a closed balance or one with transfer terms; Round A remains bound.',
  }],
  ['839ecc8f-3a60-418b-bc92-64bfeef33824', {
    evidenceRound: 'first',
    rationaleDe: 'Beide Blindprüfungen bestätigen den aktuellen Wortlaut. Runde A verbindet System und äußeren Kraftstoß mit einer vorzeichenbehafteten oder vektoriellen Vorher-Nachher-Bilanz und prüft zusätzlich ungleiche Massen sowie einen von null verschiedenen Anfangsgesamtimpuls; Runde B bleibt gebunden.',
    rationaleEn: 'Both blind reviews confirm the current wording. Round A connects the system and external impulse with a signed or vector before-and-after balance and additionally tests unequal masses and nonzero initial total momentum; Round B remains bound.',
  }],
])

const outputStem = 'stable-current-carryover-12-v1'
const synthesisRelativePath = `synthesis-decisions.${outputStem}.json`
const synthesisPath = `${batchDirectory}/${synthesisRelativePath}`
const resolutionDirectory = `resolutions-${outputStem}`
const resolutionDirectoryPath = `${batchDirectory}/${resolutionDirectory}`
const indexPath = `${batchDirectory}/resolution-index.${outputStem}.json`
const receiptPath = `${batchDirectory}/${outputStem}.compatibility-receipt.json`
const stagingSuffix = '.b025a-stable-twelve-staging'
const stagingPath = (path: string): string => `${path}${stagingSuffix}`
const writeLockPath = `${batchDirectory}/.${outputStem}.write-lock`

const absolute = (path: string): string => resolve(repoRoot, path)
const sha256Hex = (bytes: string | Uint8Array): string => createHash('sha256').update(bytes).digest('hex')
const digest = (bytes: string | Uint8Array): GoalDescriptionSynthesisDigest => `sha256:${sha256Hex(bytes)}`
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
    if (hasErrorCode(error, 'ENOENT')) throw new Error(`Missing B025a stable-twelve ${role}: ${candidate}`)
    throw error
  }
  if (!isDirectory) {
    throw new Error(`B025a stable-twelve ${role} is not a real directory: ${candidate}`)
  }
  return 'real-directory'
}

const readRegularFile = (path: string, label: string): Buffer => {
  classifyRealDirectory({
    path: dirname(absolute(path)),
    role: `${label} parent`,
    allowAbsent: false,
  })
  let isFile: boolean
  try {
    isFile = lstatSync(absolute(path)).isFile()
  } catch (error) {
    if (hasErrorCode(error, 'ENOENT')) throw new Error(`${label} is missing: ${path}`)
    throw error
  }
  if (!isFile) throw new Error(`${label} is not a regular file: ${path}`)
  return readFileSync(absolute(path))
}

const assertSource = (path: string, expected: string): Buffer => {
  const bytes = readRegularFile(path, 'Bound B025a source')
  const actual = sha256Hex(bytes)
  if (actual !== expected) throw new Error(`Bound B025a source drift: ${path}: ${actual} != ${expected}`)
  return bytes
}

const loadBoundSources = () => ({
  config: assertSource(sourceConfigPath, sourceHashes.config),
  batchManifest: assertSource(batchManifestPath, sourceHashes.batchManifest),
  dualSummary: assertSource(dualSummaryPath, sourceHashes.dualSummary),
  roundARecords: assertSource(roundARecordsPath, sourceHashes.roundARecords),
  roundARun: assertSource(roundARunPath, sourceHashes.roundARun),
  roundBRecords: assertSource(roundBRecordsPath, sourceHashes.roundBRecords),
  roundBRun: assertSource(roundBRunPath, sourceHashes.roundBRun),
  semanticKindLedger: assertSource(semanticKindLedgerPath, sourceHashes.semanticKindLedger),
})

const completionTimestamp = (
  dual: Awaited<ReturnType<typeof materializeGoalDescriptionRolloutBatchDualSummary>>,
): string => {
  const values = [...dual.first.resultPairs, ...dual.second.resultPairs]
    .map(({ run }) => Date.parse(run.completedAt))
  if (values.length === 0 || values.some((value) => !Number.isFinite(value))) {
    throw new Error('B025a blind runs must have valid completion timestamps')
  }
  return new Date(Math.max(...values) + 1000).toISOString()
}

const main = async (): Promise<void> => {
  const boundSources = loadBoundSources()
  const {
    config: configBytes,
    batchManifest: batchManifestBytes,
    dualSummary: boundDualSummaryBytes,
    roundARecords: roundARecordsBytes,
    roundARun: roundARunBytes,
    roundBRecords: roundBRecordsBytes,
    roundBRun: roundBRunBytes,
    semanticKindLedger: semanticKindLedgerBytes,
  } = boundSources
  const canonicalBytes = readRegularFile(canonicalPath, 'Current canonical Physics landscape')
  const parsedLandscape = JSON.parse(canonicalBytes.toString('utf8')) as unknown
  if (
    typeof parsedLandscape !== 'object'
    || parsedLandscape === null
    || !Array.isArray((parsedLandscape as { goals?: unknown }).goals)
  ) throw new Error('Current B025a canonical Physics landscape is missing its goals array')
  const landscape = parsedLandscape as { subject?: string; goals: JsonGoal[] }
  const semanticKindLedger = JSON.parse(semanticKindLedgerBytes.toString('utf8')) as SemanticKindLedger
  const campaignGoalIdSet = new Set<string>(campaignGoalIds)
  const stableGoalIdSet = new Set<string>(stableGoalIds)
  const excludedGoalIds = excludedRevisionDecisions.map(({ goalId }) => goalId)
  const excludedGoalIdSet = new Set<string>(excludedGoalIds)
  if (campaignGoalIds.length !== 17 || campaignGoalIdSet.size !== 17) {
    throw new Error('B025a campaign scope must contain exactly seventeen unique goal IDs')
  }
  if (stableGoalIds.length !== 12 || stableGoalIdSet.size !== 12) {
    throw new Error('B025a stable KEEP/KEEP scope must contain exactly twelve unique goal IDs')
  }
  if (excludedGoalIds.length !== 5 || excludedGoalIdSet.size !== 5) {
    throw new Error('B025a revision exclusion scope must contain exactly five unique goal IDs')
  }
  if (stableGoalIds.some((goalId) => excludedGoalIdSet.has(goalId))) {
    throw new Error('B025a stable and revision exclusion scopes overlap')
  }
  const partitionGoalIds = [...stableGoalIds, ...excludedGoalIds]
  if (
    partitionGoalIds.length !== campaignGoalIds.length
    || new Set(partitionGoalIds).size !== campaignGoalIds.length
    || partitionGoalIds.some((goalId) => !campaignGoalIdSet.has(goalId))
    || campaignGoalIds.some((goalId) => !stableGoalIdSet.has(goalId) && !excludedGoalIdSet.has(goalId))
  ) {
    throw new Error('B025a stable and revision exclusion scopes do not form the full 17-goal campaign partition')
  }
  if (
    synthesisByGoalId.size !== stableGoalIds.length
    || stableGoalIds.some((goalId) => !synthesisByGoalId.has(goalId))
    || [...synthesisByGoalId.keys()].some((goalId) => !stableGoalIdSet.has(goalId))
  ) throw new Error('B025a synthesis authoring is not the exact stable twelve')

  const canonicalGoalCounts = new Map<string, number>()
  for (const goal of landscape.goals) {
    if (typeof goal.id !== 'string') continue
    canonicalGoalCounts.set(goal.id, (canonicalGoalCounts.get(goal.id) ?? 0) + 1)
  }
  const nonUniqueCanonicalCampaignGoalIds = campaignGoalIds.filter((goalId) => (
    canonicalGoalCounts.get(goalId) !== 1
  ))
  if (nonUniqueCanonicalCampaignGoalIds.length > 0) {
    throw new Error(
      'Every B025a campaign goal must occur exactly once in the current canonical: '
      + nonUniqueCanonicalCampaignGoalIds.join(', '),
    )
  }

  const ledgerDecisions = semanticKindLedger.decisions
  if (!Array.isArray(ledgerDecisions)) {
    throw new Error('Bound B025a semantic-kind ledger has no decisions array')
  }
  const curricularAtomicGoalIds = ledgerDecisions.flatMap((decision) => (
    decision.semanticKind === 'curricularAtomic'
    && decision.decisionStatus === 'authoritative'
    && typeof decision.goalId === 'string'
      ? [decision.goalId]
      : []
  ))
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
    || campaignGoalIds.some((goalId) => !curricularAtomicGoalIdSet.has(goalId))
  ) {
    throw new Error('Bound B025a semantic-kind ledger path, counts, or curricularAtomic scope changed')
  }
  const curriculumAtomicDenominator = Number(declaredCurriculumAtomicDenominator)
  const dual = await materializeGoalDescriptionRolloutBatchDualSummary(absolute(sourceConfigPath), false)
  if (!dual.bytes.equals(boundDualSummaryBytes)) {
    throw new Error('Materialized B025a dual summary is not exact-bound')
  }
  if (
    landscape.subject !== 'Physik'
    || dual.prepared.manifest.batchId !== expectedBatchBindings.batchId
    || dual.prepared.manifest.configDigest !== expectedBatchBindings.configDigest
    || dual.prepared.manifest.source.baseBookDigest !== expectedBatchBindings.baseBookDigest
    || dual.prepared.manifest.artifacts.bookModelDigest !== expectedBatchBindings.bookDigest
    || dual.prepared.manifest.artifacts.bundleFingerprint !== expectedBatchBindings.bundleFingerprint
    || dual.prepared.manifest.artifacts.reviewInputFingerprint !== expectedBatchBindings.reviewInputFingerprint
    || dual.prepared.manifest.artifacts.rounds.first.batchInputFingerprint
      !== expectedBatchBindings.roundABatchInputFingerprint
    || dual.prepared.manifest.artifacts.rounds.second.batchInputFingerprint
      !== expectedBatchBindings.roundBBatchInputFingerprint
    || dual.prepared.manifest.curriculumAtomicDenominatorAtPreparation !== curriculumAtomicDenominator
    || dual.summary.goalCount !== 17
    || !sameOrdered(dual.prepared.manifest.goalIds, campaignGoalIds)
    || !sameOrdered(dual.summary.goals.map(({ goalId }) => goalId), campaignGoalIds)
  ) {
    throw new Error('B025a batch identity, prepared bindings, denominator, or exact 17-goal scope changed')
  }

  const actualStableIds = dual.summary.goals
    .filter(({ firstDecision, secondDecision }) => firstDecision === 'keep' && secondDecision === 'keep')
    .map(({ goalId }) => goalId)
  if (!sameOrdered(actualStableIds, stableGoalIds)) {
    throw new Error('B025a KEEP/KEEP scope is no longer the exact ordered stable twelve')
  }
  const actualExcludedIds = dual.summary.goals
    .filter(({ goalId }) => !stableGoalIds.includes(goalId as typeof stableGoalIds[number]))
    .map(({ goalId }) => goalId)
  if (!sameOrdered(actualExcludedIds, excludedRevisionDecisions.map(({ goalId }) => goalId))) {
    throw new Error('B025a excluded revision scope is no longer the exact ordered five')
  }
  for (const expected of excludedRevisionDecisions) {
    const summary = dual.summary.goals.find(({ goalId }) => goalId === expected.goalId)
    if (
      !summary
      || summary.firstDecision !== expected.first
      || summary.secondDecision !== expected.second
    ) {
      throw new Error(`${expected.goalId}: B025a excluded revision decision pair changed`)
    }
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

  for (const goalId of stableGoalIds) {
    const firstResult = extractGoalDescriptionDualRoundResolutionSource({
      artifacts: dual.first,
      goalId,
      label: 'First',
    })
    const secondResult = extractGoalDescriptionDualRoundResolutionSource({
      artifacts: dual.second,
      goalId,
      label: 'Second',
    })
    const sourceErrors = [...firstResult.errors, ...secondResult.errors]
    if (sourceErrors.length > 0 || !firstResult.source?.record || !secondResult.source?.record) {
      throw new Error(`${goalId}: ${sourceErrors.join(' | ') || 'missing exact source records'}`)
    }
    if (firstResult.source.decision !== 'keep' || secondResult.source.decision !== 'keep') {
      throw new Error(`${goalId}: B025a stable materialization requires exactly two KEEP records`)
    }

    const firstInput = dual.first.input.goals.find((goal) => goal.goalId === goalId)
    const secondInput = dual.second.input.goals.find((goal) => goal.goalId === goalId)
    const canonicalGoal = landscape.goals.find((goal) => goal.id === goalId)
    if (!firstInput || !secondInput || !canonicalGoal) {
      throw new Error(`${goalId}: missing B025a blind input or current canonical goal`)
    }
    const canonicalContext = buildGoalDescriptionCanonicalContext(canonicalGoal)
    const goalReviewContextFingerprint = fingerprintGoalDescriptionReviewContext(firstInput)
    if (
      stableGoalBookJson(firstInput) !== stableGoalBookJson(secondInput)
      || stableGoalBookJson(firstInput.canonicalContext) !== stableGoalBookJson(canonicalContext)
      || firstResult.source.binding.goalReviewContextFingerprint !== goalReviewContextFingerprint
      || secondResult.source.binding.goalReviewContextFingerprint !== goalReviewContextFingerprint
    ) {
      throw new Error(`${goalId}: blind inputs or current direct canonical context differ`)
    }
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
      goalReviewContextFingerprint,
      finalText,
      firstSource: firstResult.source,
      secondSource: secondResult.source,
    })
    sourceByGoalId.set(goalId, { first: firstResult.source, second: secondResult.source })
    currentCanonicalContexts.push({
      goalId,
      canonicalContext,
      fingerprint: digest(stableGoalBookJson(canonicalContext)),
    })
  }

  const firstGoal = expectedGoals[0]
  if (!firstGoal) throw new Error('B025a stable-twelve scope is empty')
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
  const manifestId = 'physik-b025a-stable12-synthesis-openai-codex-20260829'
  const manifestPayload: Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'> = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
    schemaVersion: 1,
    synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
    manifestId,
    authority: 'ai_synthesis',
    synthesizedBy: 'OpenAI Codex B025a stable-twelve bounded synthesis candidate',
    synthesizedAt,
    batch: expectedBindings.batch,
    rounds: expectedBindings.rounds,
    decisions: expectedGoals.map((goal, index) => {
      const source = sourceByGoalId.get(goal.goalId)
      const authored = synthesisByGoalId.get(goal.goalId)
      if (!source?.first.record || !source.second.record || !authored) {
        throw new Error(`${goal.goalId}: missing B025a source record or synthesis authoring`)
      }
      return {
        decisionId: `${manifestId}-decision-${String(index + 1).padStart(3, '0')}`,
        goalId: goal.goalId,
        effectiveSemanticKind: goal.effectiveSemanticKind,
        goalFingerprint: goal.goalFingerprint,
        pageFingerprint: goal.pageFingerprint,
        goalReviewContextFingerprint: goal.goalReviewContextFingerprint,
        finalText: goal.finalText,
        resolutionDecision: 'keep_current' as const,
        evidenceRound: authored.evidenceRound,
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
        rationaleDe: authored.rationaleDe,
        rationaleEn: authored.rationaleEn,
      }
    }),
  }
  const synthesisManifest: GoalDescriptionRolloutSynthesisDecisionManifest = {
    ...manifestPayload,
    manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(manifestPayload),
  }
  const manifestValidation = await validateGoalDescriptionRolloutSynthesisDecisionManifest({
    manifest: synthesisManifest,
    expected: expectedBindings,
  })
  if (manifestValidation.errors.length > 0) {
    throw new Error(`B025a stable-twelve synthesis: ${manifestValidation.errors.join(' | ')}`)
  }
  const synthesisBytes = jsonBytes(synthesisManifest)

  const resolutionOutputs: PlannedOutput[] = []
  const indexEntries: Array<Record<string, unknown>> = []
  for (const goal of expectedGoals) {
    const source = sourceByGoalId.get(goal.goalId)
    const summaryGoal = dual.summary.goals.find(({ goalId }) => goalId === goal.goalId)
    const decision = synthesisManifest.decisions.find(({ goalId }) => goalId === goal.goalId)
    if (!source || !summaryGoal || !decision) {
      throw new Error(`${goal.goalId}: incomplete B025a synthesis alignment`)
    }
    const synthesis = buildGoalDescriptionRolloutResolutionSynthesis({
      batchId: synthesisManifest.batch.batchId,
      manifest: synthesisManifest,
      decision,
      summaryGoal,
      firstSource: source.first,
      secondSource: source.second,
    })
    const resolution = buildGoalDescriptionDualRoundResolution({
      resolutionId: `physics-b025a-stable12-current-carryover-v1-resolution-${goal.goalId}`,
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
      synthesisDecisionManifestArtifact: {
        manifest: synthesisManifest,
        manifestBytes: synthesisBytes,
        manifestPath: synthesisRelativePath,
      },
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
    artifactSetId: `${dual.prepared.manifest.batchId}-stable-current-carryover-12`,
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
      resolvedGoalCount: stableGoalIds.length,
    }],
    resolutions: indexEntries,
  }
  const indexBytes = jsonBytes(index)
  const receiptBody = {
    schemaVersion: 1,
    receiptId: 'physik-b025a-stable-current-carryover-12-v1-20260829',
    purpose: (
      'Bounded compatibility materialization of exactly twelve current B025a KEEP/KEEP goals '
      + 'while five revision goals remain explicitly excluded.'
    ),
    source: {
      configPath: sourceConfigPath,
      configSha256: `sha256:${sourceHashes.config}`,
      batchManifestPath,
      batchManifestSha256: `sha256:${sourceHashes.batchManifest}`,
      dualSummaryPath,
      dualSummarySha256: `sha256:${sourceHashes.dualSummary}`,
      semanticKindLedgerPath,
      semanticKindLedgerSha256: digest(semanticKindLedgerBytes),
      curriculumAtomicDenominator,
      roundA: {
        recordsPath: roundARecordsPath,
        recordsSha256: digest(roundARecordsBytes),
        runPath: roundARunPath,
        runSha256: digest(roundARunBytes),
      },
      roundB: {
        recordsPath: roundBRecordsPath,
        recordsSha256: digest(roundBRecordsBytes),
        runPath: roundBRunPath,
        runSha256: digest(roundBRunBytes),
      },
    },
    sourceCampaignGoalCount: campaignGoalIds.length,
    currentCanonicalLandscape: { path: canonicalPath, sha256: digest(canonicalBytes) },
    currentCanonicalContexts,
    claimedGoalIds: stableGoalIds,
    claimedGoalCount: stableGoalIds.length,
    explicitlyExcludedRevisionDecisions: excludedRevisionDecisions,
    explicitlyExcludedRevisionGoalCount: excludedRevisionDecisions.length,
    evidenceRoundByGoalId: Object.fromEntries(
      stableGoalIds.map((goalId) => [goalId, synthesisByGoalId.get(goalId)?.evidenceRound]),
    ),
    synthesisManifestPath: synthesisRelativePath,
    synthesisManifestDigest: digest(synthesisBytes),
    synthesisManifestFingerprint: synthesisManifest.manifestFingerprint,
    resolutionIndexPath: indexPath.replace(`${batchDirectory}/`, ''),
    resolutionIndexDigest: digest(indexBytes),
    resolutionIndexFormat: 'legacy-schema-v1-partial-group',
    noProgressClaimUntilCentralFiveGateValidation: true,
    safeguards: {
      exactTwelveKeepKeepRecordsRequired: true,
      exactFiveRevisionGoalsExcluded: true,
      sourceConfigManifestDualRunsAndRecordsByteBound: true,
      semanticKindLedgerByteBoundAndCountValidated: true,
      exactCurrentBilingualTextsRequired: true,
      currentDirectCanonicalContextsRefingerprinted: true,
      currentFullCanonicalLandscapePlanBound: true,
      traversedAndOutputParentsMustBeRealDirectories: true,
      dedicatedResolutionDirectoryRejectsUnknownEntries: true,
      outputAndAdjacentStagingStatesFailClosed: true,
      missingOutputsFullyStagedWithExclusiveCreate: true,
      partialWxPreparationCannotPoisonAdjacentStaging: true,
      atomicNoClobberHardLinkPublish: true,
      classifiedCrashStatesForwardResumableAfterStaleLockReview: true,
      privateCrashResiduesInventoriedAndHashStableBeforeCleanup: true,
      exclusiveBatchWriteLockSerializesStagingCleanup: true,
      receiptAndIndexPublishedAfterAllResolutions: true,
      rollbackNeverDeletesPublishedTargets: true,
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
    materializationProtocol: 'b025a-stable-twelve-hardlink-no-clobber-v1',
    sourceHashes,
    currentCanonicalSha256: canonicalSha256,
    campaignGoalIds,
    stableGoalIds,
    excludedRevisionDecisions,
    outputs: outputsWithoutReceipt.map(({ path, bytes }) => ({ path, sha256: sha256Hex(bytes) })),
    receiptPath,
    receiptBody,
  }))
  const planSha256 = buildPlanSha256(currentCanonicalSha256)
  const receiptBytes = jsonBytes({
    ...receiptBody,
    materializationPlanSha256: `sha256:${planSha256}`,
  })
  const outputs: PlannedOutput[] = [
    { path: synthesisPath, bytes: synthesisBytes },
    ...resolutionOutputs,
    { path: receiptPath, bytes: receiptBytes },
    { path: indexPath, bytes: indexBytes },
  ]
  if (outputs.length !== 15) throw new Error(`B025a stable-twelve must plan exactly 15 outputs; found ${outputs.length}`)
  const plannedOutputSha256 = new Map(outputs.map(({ path, bytes }) => [path, sha256Hex(bytes)]))

  const classifyExpectedFile = <ExactState extends string>({
    path,
    bytes,
    exactState,
    role,
  }: PlannedOutput & {
    exactState: ExactState
    role: 'target' | 'staging' | 'preparation'
  }): 'absent' | ExactState => {
    const candidate = absolute(path)
    let isFile: boolean
    try {
      isFile = lstatSync(candidate).isFile()
    } catch (error) {
      if (hasErrorCode(error, 'ENOENT')) return 'absent'
      throw error
    }
    if (!isFile) throw new Error(`B025a stable-twelve ${role} has unknown non-file state: ${path}`)
    const expectedSha256 = sha256Hex(bytes)
    const actualSha256 = sha256Hex(readFileSync(candidate))
    if (actualSha256 !== expectedSha256) {
      throw new Error(
        `B025a stable-twelve ${role} has unknown bytes: ${path}: `
        + `${actualSha256} != ${expectedSha256}`,
      )
    }
    return exactState
  }

  const classifyOutput = ({ path, bytes }: PlannedOutput): ClassifiedOutput => ({
    path,
    bytes,
    targetState: classifyExpectedFile({ path, bytes, exactState: 'exact-after', role: 'target' }),
    stagingState: classifyExpectedFile({
      path: stagingPath(path),
      bytes,
      exactState: 'exact-staged',
      role: 'staging',
    }),
  })

  const classifyMaterialization = (
    privateResidueCount = 0,
  ): ClassifiedMaterialization => {
    const classified = outputs.map(classifyOutput)
    const exactAfterTargetCount = classified
      .filter(({ targetState }) => targetState === 'exact-after').length
    const exactStagedCount = classified
      .filter(({ stagingState }) => stagingState === 'exact-staged').length
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

  const assertWriteLockAbsent = (): void => {
    try {
      lstatSync(absolute(writeLockPath))
    } catch (error) {
      if (hasErrorCode(error, 'ENOENT')) return
      throw error
    }
    throw new Error(
      `B025a stable-twelve write lock is present: ${writeLockPath}; `
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
    classifyRealDirectory({ path: lock, role: 'write lock', allowAbsent: false })
    if (readdirSync(lock).length !== 0) {
      throw new Error(`B025a stable-twelve write lock unexpectedly contains entries: ${writeLockPath}`)
    }
    rmdirSync(lock)
  }

  type PrivateResidue = {
    directory: string
    output: PlannedOutput
    payload: string | null
    payloadSha256: string | null
  }
  const privatePayloadName = 'prepared-output'
  const privateWorkPrefix = (output: PlannedOutput): string => {
    const outputSha256 = plannedOutputSha256.get(output.path)
    if (!outputSha256) throw new Error(`${output.path}: missing B025a planned output hash`)
    const pathKey = sha256Hex(Buffer.from(output.path)).slice(0, 16)
    return `.b025a-stable-twelve-prepare-${pathKey}-${outputSha256}-`
  }
  const outputParents = [...new Set(outputs.map(({ path }) => dirname(absolute(path))))]
  const expectedStagingPaths = new Set(outputs.map(({ path }) => absolute(stagingPath(path))))
  const batchOutputParent = absolute(batchDirectory)
  const dedicatedResolutionOutputParent = absolute(resolutionDirectoryPath)
  const dedicatedResolutionOutputs = outputs.filter(({ path }) => (
    dirname(absolute(path)) === dedicatedResolutionOutputParent
  ))
  if (dedicatedResolutionOutputs.length !== stableGoalIds.length) {
    throw new Error('B025a dedicated resolution output scope must contain exactly twelve planned files')
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
      throw new Error(`${output.path}: unexpected B025a stable-twelve output parent ${parent}`)
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
        const isPrivateWorkEntry = entry.name.startsWith('.b025a-stable-twelve-prepare-')
        if (
          isDedicatedResolutionParent
          && !expectedDedicatedResolutionEntryNames.has(entry.name)
          && !isPrivateWorkEntry
        ) {
          throw new Error(
            `Unknown entry in dedicated B025a stable-twelve resolution output directory: ${entryPath}`,
          )
        }
        if (entry.name.endsWith(stagingSuffix) && !expectedStagingPaths.has(entryPath)) {
          throw new Error(`Unknown adjacent B025a stable-twelve staging path: ${entryPath}`)
        }
        if (!isPrivateWorkEntry) continue
        const matches = definitions.filter(({ parent: candidateParent, prefix }) => (
          candidateParent === parent && entry.name.startsWith(prefix)
        ))
        if (matches.length !== 1 || !entry.isDirectory()) {
          throw new Error(`Unknown B025a stable-twelve private work entry: ${entryPath}`)
        }
        classifyRealDirectory({
          path: entryPath,
          role: 'private preparation directory',
          allowAbsent: false,
        })
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
        ) {
          throw new Error(`Unknown B025a stable-twelve private work contents: ${entryPath}`)
        }
        const payload = resolve(entryPath, privatePayloadName)
        const payloadSha256 = sha256Hex(readRegularFile(payload, 'B025a private preparation payload'))
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
        const actualSha256 = sha256Hex(readRegularFile(
          residue.payload,
          'B025a private preparation payload during recovery',
        ))
        if (actualSha256 !== residue.payloadSha256) {
          throw new Error(
            `${residue.output.path}: B025a private preparation changed before recovery: `
            + `${actualSha256} != ${residue.payloadSha256}`,
          )
        }
        unlinkSync(residue.payload)
      }
      if (readdirSync(residue.directory).length !== 0) {
        throw new Error(`${residue.output.path}: B025a private residue is not empty after verified recovery`)
      }
      rmdirSync(residue.directory)
    }
    const remaining = inspectPrivateResidues()
    if (remaining.length > 0) {
      throw new Error(`B025a private residue recovery left ${remaining.length} entry or entries`)
    }
  }

  const assertCurrentInputsAndPlan = (label: string): void => {
    loadBoundSources()
    const reboundCanonicalBytes = readRegularFile(canonicalPath, 'Current canonical Physics landscape')
    const reboundCanonicalSha256 = sha256Hex(reboundCanonicalBytes)
    if (reboundCanonicalSha256 !== currentCanonicalSha256) {
      throw new Error(
        `${label}: B025a stable-twelve canonical drift: `
        + `${reboundCanonicalSha256} != ${currentCanonicalSha256}`,
      )
    }
    const reboundPlanSha256 = buildPlanSha256(reboundCanonicalSha256)
    if (reboundPlanSha256 !== planSha256) {
      throw new Error(`${label}: B025a stable-twelve plan rebind failed`)
    }
    if (expectedPlanSha256 !== 'PENDING' && reboundPlanSha256 !== expectedPlanSha256) {
      throw new Error(
        `${label}: B025a stable-twelve bound plan drift: `
        + `${reboundPlanSha256} != ${expectedPlanSha256}`,
      )
    }
    for (const { path, bytes } of outputs) {
      const actual = sha256Hex(bytes)
      const expected = plannedOutputSha256.get(path)
      if (!expected || actual !== expected) {
        throw new Error(`${label}: B025a planned output buffer drift: ${path}: ${actual} != ${expected}`)
      }
    }
  }

  const privateWorkDirectory = (output: PlannedOutput): string => {
    const parent = dirname(absolute(stagingPath(output.path)))
    ensurePlannedOutputParent(output)
    const nonce = randomBytes(16).toString('hex')
    const directory = mkdtempSync(resolve(parent, `${privateWorkPrefix(output)}${process.pid}-${nonce}-`))
    classifyRealDirectory({
      path: directory,
      role: 'new private preparation directory',
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
    classifyRealDirectory({
      path: directory,
      role: 'private preparation directory',
      allowAbsent: false,
    })
    const state = classifyExpectedFile({
      path,
      bytes: output.bytes,
      exactState: 'exact-private',
      role: 'preparation',
    })
    if (state !== 'exact-private') {
      throw new Error(`${output.path}: refusing to unlink missing B025a private preparation file`)
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
      throw new Error(`${output.path}: B025a private wx preparation is not exact`)
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
      throw new Error(`${output.path}: B025a adjacent staging link is not exact`)
    }
    unlinkPrivateExactFile({ path: preparation, directory: preparationDirectory, output })
  }

  const unlinkExactStagingUnderLock = (output: PlannedOutput): void => {
    const verifiedState = classifyExpectedFile({
      path: stagingPath(output.path),
      bytes: output.bytes,
      exactState: 'exact-staged',
      role: 'staging',
    })
    if (verifiedState !== 'exact-staged') {
      throw new Error(`${output.path}: refusing to unlink missing B025a staging under the write lock`)
    }
    unlinkSync(absolute(stagingPath(output.path)))
  }

  const stageEveryMissingOutput = (): void => {
    for (const output of outputs) {
      let classified = classifyOutput(output)
      if (classified.targetState === 'exact-after') continue
      if (classified.stagingState === 'absent') createExactAdjacentStaging(output)
      classified = classifyOutput(output)
      if (classified.targetState === 'absent' && classified.stagingState !== 'exact-staged') {
        throw new Error(`${output.path}: missing B025a output is not fully exact-staged`)
      }
    }
    const staged = classifyMaterialization()
    const unstaged = staged.outputs.filter(({ targetState, stagingState }) => (
      targetState === 'absent' && stagingState === 'absent'
    ))
    if (unstaged.length > 0) {
      throw new Error(`B025a stable-twelve full staging failed for ${unstaged.length} output(s)`)
    }
  }

  const publishNoClobber = (output: PlannedOutput): void => {
    let classified = classifyOutput(output)
    if (classified.targetState === 'absent') {
      if (classified.stagingState !== 'exact-staged') {
        throw new Error(`${output.path}: refusing B025a publish without exact adjacent staging`)
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
      throw new Error(`${output.path}: B025a no-clobber publish did not produce exact-after`)
    }
    if (classified.stagingState === 'exact-staged') unlinkExactStagingUnderLock(output)
    if (classifyOutput(output).targetState !== 'exact-after') {
      throw new Error(`${output.path}: exact B025a output changed after staging cleanup`)
    }
  }

  if (expectedPlanSha256 !== 'PENDING' && planSha256 !== expectedPlanSha256) {
    throw new Error(`B025a stable-twelve plan drift: ${planSha256} != ${expectedPlanSha256}`)
  }
  assertWriteLockAbsent()
  let privateResidues = inspectPrivateResidues()
  let materialization = classifyMaterialization(privateResidues.length)
  if ((writeMode || checkMode) && expectedPlanSha256 === 'PENDING') {
    throw new Error(`Refusing --${writeMode ? 'write' : 'check'} until expectedPlanSha256 is bound to ${planSha256}`)
  }
  if (checkMode && materialization.state !== 'exact-after') {
    throw new Error(
      `B025a stable-twelve --check requires complete exact-after without staging; `
      + `state=${materialization.state} targets=${materialization.exactAfterTargetCount}/${outputs.length} `
      + `staged=${materialization.exactStagedCount}`,
    )
  }
  if (writeMode) {
    execFileSync('node', ['scripts/check_openai_plugin_review_freeze.mjs'], {
      cwd: repoRoot,
      stdio: 'inherit',
    })
    acquireWriteLock()
    try {
      recoverPrivateResidues(privateResidues)
      privateResidues = []
      assertCurrentInputsAndPlan('Immediate pre-staging rebind')
      stageEveryMissingOutput()
      privateResidues = inspectPrivateResidues()
      if (privateResidues.length > 0) {
        throw new Error(`B025a stable-twelve staging left ${privateResidues.length} private residue(s)`)
      }
      assertCurrentInputsAndPlan('Immediate pre-publish rebind')
      for (const output of outputs) publishNoClobber(output)
      assertCurrentInputsAndPlan('Post-write rebind')
      privateResidues = inspectPrivateResidues()
      materialization = classifyMaterialization(privateResidues.length)
      if (materialization.state !== 'exact-after') {
        throw new Error(`B025a stable-twelve post-write state is not exact-after: ${materialization.state}`)
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
    explicitlyExcludedRevisionDecisions: excludedRevisionDecisions,
    evidenceRoundByGoalId: Object.fromEntries(
      stableGoalIds.map((goalId) => [goalId, synthesisByGoalId.get(goalId)?.evidenceRound]),
    ),
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
