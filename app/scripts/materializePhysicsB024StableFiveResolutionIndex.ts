import { createHash } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { dirname, resolve } from 'node:path'

type Digest = `sha256:${string}`
type ResolutionIndexEntry = {
  goalId: string
  titleDe: string
  groupId: string
  decision: string
  resolutionPath: string
  resolutionDigest: Digest
  resolutionFingerprint: Digest
  strictDescriptionComplete: boolean
}
type SourceIndex = {
  schemaVersion: 2
  artifactSetId: string
  subject: string
  semanticKind: string
  batchGoalIds: string[]
  groups: Array<{
    groupId: string
    artifactDirectory: string
    dualSummaryPath: string
    dualSummaryDigest: Digest
    campaignGoalCount: number
    resolvedGoalCount: number
  }>
  resolutions: ResolutionIndexEntry[]
}

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
const allowedArguments = new Set(['--write', '--check'])
const unexpectedArguments = process.argv.slice(2)
  .filter((argument) => !allowedArguments.has(argument))
if (unexpectedArguments.length > 0) {
  throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)
}
if (writeMode && checkMode) throw new Error('Use either --write or --check, not both')

const batchDirectory = (
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/'
  + 'rollout-v1/2026-08-28/batch-024-astrophysics-final-current-6-v1'
)
const sourceIndexPath = `${batchDirectory}/resolution-index.json`
const dualSummaryPath = `${batchDirectory}/dual-summary.json`
const adjudicationPath = (
  `${batchDirectory}/third-adjudication/solar-radius-evidence-geometry.json`
)
const canonicalPath = (
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
)
const outputIndexPath = (
  `${batchDirectory}/resolution-index.stable-current-five-after-geometry-audit-v1.json`
)
const receiptPath = (
  `${batchDirectory}/stable-current-five-after-geometry-audit-v1.compatibility-receipt.json`
)

const sourceIndexSha256 = '5203df9b5f1cb71125a68f8ce49f4d0690e7208a4d718840c0820b1c290c74b9'
const dualSummarySha256 = 'b539be198ca83fed7060b38d14f808fe06c1fb41ddb25e01bf80f3641764f668'
const adjudicationSha256 = '0bf7717fb9aed3db8af59b7ebf8c933b634ae969b6722586966e7cb2e96ab9f5'
const canonicalSha256 = '1cd096e078a8878da47e4a432aa078c770119349312788d6f1bb31761aea6c4c'
const expectedPlanSha256 = 'b56b19a3d902e96e7022a769f3026df7d74fc6b82f992e96417628d5fb8eaf6f'
const excludedGoalId = 'bebc3738-0be6-52cf-83db-f8b948f7cf7b'
const stableGoalIds = [
  '5cf160e5-e0c2-5552-b2cf-0f04871c5e7e',
  '23335a89-f8e6-5c22-8705-d71193aeac96',
  'f3dbcafa-1849-5ee1-8807-81e8d7fed73d',
  '2014791b-af68-58d0-838b-fc9701202096',
  '1b7e800a-1c0d-5faa-886b-7ef2f3b8348c',
] as const

const absolute = (path: string): string => resolve(repoRoot, path)
const sha256 = (value: string | Uint8Array): string => (
  createHash('sha256').update(value).digest('hex')
)
const jsonBytes = (value: unknown): Buffer => (
  Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
)
const assertFileHash = (path: string, expected: string, label: string): Buffer => {
  if (!existsSync(absolute(path))) throw new Error(`${label}: missing ${path}`)
  const bytes = readFileSync(absolute(path))
  const actual = sha256(bytes)
  if (actual !== expected) {
    throw new Error(`${label}: ${path} has ${actual}, expected ${expected}`)
  }
  return bytes
}

const sourceIndexBytes = assertFileHash(
  sourceIndexPath,
  sourceIndexSha256,
  'Exact B024 six-goal source index',
)
assertFileHash(dualSummaryPath, dualSummarySha256, 'Exact B024 dual summary')
assertFileHash(adjudicationPath, adjudicationSha256, 'Exact solar-radius evidence adjudication')
assertFileHash(canonicalPath, canonicalSha256, 'Current canonical Physics landscape')

const sourceIndex = JSON.parse(sourceIndexBytes.toString('utf8')) as SourceIndex
if (
  sourceIndex.schemaVersion !== 2
  || sourceIndex.subject !== 'Physik'
  || sourceIndex.semanticKind !== 'curricularAtomic'
  || sourceIndex.groups.length !== 1
  || sourceIndex.groups[0]?.campaignGoalCount !== 6
  || sourceIndex.groups[0]?.resolvedGoalCount !== 6
  || sourceIndex.resolutions.length !== 6
  || !sourceIndex.batchGoalIds.includes(excludedGoalId)
) throw new Error('B024 source index shape or exact six-goal scope changed')

const entryByGoalId = new Map(sourceIndex.resolutions.map((entry) => [entry.goalId, entry]))
const stableEntries = stableGoalIds.map((goalId) => {
  const entry = entryByGoalId.get(goalId)
  if (!entry || entry.strictDescriptionComplete !== true || entry.decision !== 'keep_current') {
    throw new Error(`${goalId}: missing exact strict current B024 resolution entry`)
  }
  const resolutionPath = `${batchDirectory}/${entry.resolutionPath}`
  const bytes = assertFileHash(
    resolutionPath,
    entry.resolutionDigest.replace(/^sha256:/u, ''),
    `${goalId}: bound B024 resolution`,
  )
  const resolution = JSON.parse(bytes.toString('utf8')) as {
    goal?: { goalId?: string; finalText?: { titleDe?: string } }
    decision?: string
    resolutionFingerprint?: string
  }
  if (
    resolution.goal?.goalId !== goalId
    || resolution.goal.finalText?.titleDe !== entry.titleDe
    || resolution.decision !== entry.decision
    || resolution.resolutionFingerprint !== entry.resolutionFingerprint
  ) throw new Error(`${goalId}: B024 resolution bytes disagree with their source-index binding`)
  return entry
})
if (stableEntries.some(({ goalId }) => goalId === excludedGoalId)) {
  throw new Error('Audited solar-radius evidence leaked into the stable-five scope')
}

const group = sourceIndex.groups[0]!
const outputIndex = {
  schemaVersion: 1,
  artifactSetId: (
    'physik-rollout-v1-batch-024-astrophysics-final-current-6-v1-20260828-'
    + 'stable-current-five-after-geometry-audit'
  ),
  subject: 'Physik',
  semanticKind: 'curricularAtomic',
  strictDescriptionReviewCompleteCount: stableEntries.length,
  curriculumAtomicDenominator: 460,
  descriptionReviewPercentage: Number(((stableEntries.length / 460) * 100).toFixed(1)),
  groups: [{
    groupId: group.groupId,
    artifactDirectory: '.',
    dualSummaryPath: 'dual-summary.json',
    dualSummaryDigest: group.dualSummaryDigest,
    campaignGoalCount: group.campaignGoalCount,
    resolvedGoalCount: stableEntries.length,
  }],
  resolutions: stableEntries,
}

const receiptBody = {
  schemaVersion: 1,
  receiptId: 'physik-b024-stable-current-five-after-geometry-audit-v1-20260828',
  purpose: (
    'Fail-closed carryover of the five scientifically valid B024 resolutions while '
    + 'the solar-radius goal is excluded for a targeted dual recheck.'
  ),
  source: {
    indexPath: sourceIndexPath,
    indexSha256: `sha256:${sourceIndexSha256}`,
    dualSummaryPath,
    dualSummarySha256: `sha256:${dualSummarySha256}`,
    canonicalPath,
    canonicalSha256: `sha256:${canonicalSha256}`,
  },
  adjudication: {
    path: adjudicationPath,
    sha256: `sha256:${adjudicationSha256}`,
    excludedGoalId,
    disposition: 'exclude_until_targeted_dual_recheck',
  },
  stableGoalIds,
  resolutionIndexPath: outputIndexPath,
} as const

const outputIndexBytes = jsonBytes(outputIndex)
const planSha256 = sha256(jsonBytes({
  sourceIndexSha256,
  dualSummarySha256,
  adjudicationSha256,
  canonicalSha256,
  excludedGoalId,
  stableGoalIds,
  outputIndexPath,
  outputIndexSha256: sha256(outputIndexBytes),
  receiptPath,
  receiptBody,
}))
const receiptBytes = jsonBytes({
  ...receiptBody,
  materializationPlanSha256: `sha256:${planSha256}`,
})
const outputs = [
  { path: outputIndexPath, bytes: outputIndexBytes },
  { path: receiptPath, bytes: receiptBytes },
] as const

if (expectedPlanSha256 !== 'PENDING' && planSha256 !== expectedPlanSha256) {
  throw new Error(`Physics B024 stable-five plan drift: ${planSha256} != ${expectedPlanSha256}`)
}

const stagingPath = (path: string): string => `${path}.b024-stable-five-staging`
for (const { path, bytes } of outputs) {
  const staging = stagingPath(path)
  if (existsSync(absolute(staging)) && !readFileSync(absolute(staging)).equals(bytes)) {
    throw new Error(`Stale B024 stable-five staging output: ${path}`)
  }
}
const writeAtomicExact = (path: string, bytes: Buffer): void => {
  const target = absolute(path)
  const staging = absolute(stagingPath(path))
  mkdirSync(dirname(target), { recursive: true })
  if (existsSync(target)) {
    if (!readFileSync(target).equals(bytes)) throw new Error(`Stale B024 stable-five output: ${path}`)
    if (existsSync(staging)) {
      if (!readFileSync(staging).equals(bytes)) throw new Error(`Stale B024 staging output: ${path}`)
      unlinkSync(staging)
    }
    return
  }
  if (existsSync(staging)) {
    if (!readFileSync(staging).equals(bytes)) throw new Error(`Stale B024 staging output: ${path}`)
    renameSync(staging, target)
    return
  }
  writeFileSync(staging, bytes, { flag: 'wx' })
  if (!readFileSync(staging).equals(bytes)) throw new Error(`B024 staging write mismatch: ${path}`)
  renameSync(staging, target)
}

const missing = outputs.filter(({ path, bytes }) => (
  !existsSync(absolute(path)) || !readFileSync(absolute(path)).equals(bytes)
))
if (checkMode && missing.length > 0) {
  throw new Error(`Physics B024 stable-five outputs are not materialized; writes=${missing.length}`)
}
if (checkMode) {
  const staging = outputs.filter(({ path }) => existsSync(absolute(stagingPath(path))))
  if (staging.length > 0) {
    throw new Error(`Redundant Physics B024 stable-five staging outputs remain: ${staging.length}`)
  }
}
if (writeMode) {
  if (expectedPlanSha256 === 'PENDING') {
    throw new Error(`Refusing --write until expectedPlanSha256 is bound to ${planSha256}`)
  }
  outputs.forEach(({ path, bytes }) => writeAtomicExact(path, bytes))
  const staging = outputs.filter(({ path }) => existsSync(absolute(stagingPath(path))))
  if (staging.length > 0) {
    throw new Error(`Physics B024 stable-five write left staging outputs: ${staging.length}`)
  }
}
for (const { path, bytes } of outputs) {
  if (existsSync(absolute(path)) && !readFileSync(absolute(path)).equals(bytes)) {
    throw new Error(`Physics B024 stable-five output drift: ${path}`)
  }
}
const finalMissing = outputs.filter(({ path }) => !existsSync(absolute(path)))
console.log(
  `CHECK physics_b024_stable_five ${writeMode ? 'WRITE' : finalMissing.length ? 'PLAN' : 'PASS'} `
  + `plannedWrites=${finalMissing.length} outputs=${outputs.length}`,
)
outputs.forEach(({ path, bytes }) => {
  console.log(`PLANNED_OUTPUT ${sha256(bytes)} ${existsSync(absolute(path)) ? 'UNCHANGED' : 'WRITE'} ${path}`)
})
console.log(`MATERIALIZATION_PLAN_SHA256 ${planSha256} binding=${expectedPlanSha256}`)
