import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  materializeGoalDescriptionRolloutBatchDualSummary,
} from './materializeGoalDescriptionRolloutBatch'
import {
  buildGoalDescriptionDualRoundResolution,
  extractGoalDescriptionDualRoundResolutionSource,
  validateGoalDescriptionDualRoundResolution,
} from './validateGoalDescriptionDualRoundResolution'

type AuthoringDecision = {
  goalId: string
  evidenceRound: 'first' | 'second'
  rationaleDe: string
  rationaleEn: string
}

type CarryoverAuthoring = {
  schemaVersion: 1
  artifactType: 'goal-description-stable-current-carryover-authoring-v1'
  carryoverId: string
  synthesizedBy: string
  excludedGoalIds: string[]
  decisions: AuthoringDecision[]
}

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const write = process.argv.includes('--write')
const batchName = 'batch-031s-final-corrections-and-dependent-context-5-v1'
const rolloutDirectory = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-05',
)
const sourceConfigPath = join(rolloutDirectory, `${batchName}.config.json`)
const sourceDirectory = join(rolloutDirectory, batchName)
const authoringPath = join(sourceDirectory, 'stable-current-carryover-1-v1.authoring.json')
const landscapePath = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
)
const semanticKindLedgerPath = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
)
const outputStem = 'stable-current-carryover-1-v1'
const resolutionDirectoryName = `resolutions-${outputStem}`
const indexPath = join(sourceDirectory, `resolution-index.${outputStem}.json`)
const receiptPath = join(sourceDirectory, `${outputStem}.compatibility-receipt.json`)

const stableGoalIds = [
  'fa0b6b69-ce54-4711-90e6-26f27249cd71',
] as const

const excludedGoalIds = [
  '895a60ea-606a-4e77-a5af-ecc13d68e8fb',
  'a6c8db0a-a8a2-46bf-af04-d73d69d6c8b1',
  '0500f77f-8c12-5f7e-97b0-a75125eaa99b',
  '7f11ffe0-7c43-4507-9101-50374a60b0e8',
] as const

const sha256 = (value: Buffer | string): `sha256:${string}` => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)

const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)

const sameOrdered = (left: readonly string[], right: readonly string[]): boolean => (
  left.length === right.length && left.every((value, index) => value === right[index])
)

const sameMembers = (left: readonly string[], right: readonly string[]): boolean => (
  left.length === right.length && [...left].sort().every((value, index) => value === [...right].sort()[index])
)

const readOptional = async (path: string): Promise<Buffer | null> => {
  try {
    return await readFile(path)
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}

const writeAllOrRequireExact = async (
  artifacts: Array<{ path: string; bytes: Buffer }>,
): Promise<void> => {
  const current = await Promise.all(artifacts.map(({ path }) => readOptional(path)))
  artifacts.forEach(({ path, bytes }, index) => {
    if (current[index] && !current[index]?.equals(bytes)) {
      throw new Error(`Existing Mathematics B031s stable carryover artifact is stale: ${path}`)
    }
    if (!current[index] && !write) {
      throw new Error(`Missing Mathematics B031s stable carryover artifact: ${path}`)
    }
  })
  if (!write) return
  await Promise.all(artifacts.flatMap(({ path, bytes }, index) => (
    current[index]
      ? []
      : [mkdir(dirname(path), { recursive: true })
          .then(() => writeFile(path, bytes, { flag: 'wx' }))]
  )))
}

const assertTrimmed = (value: unknown, label: string): asserts value is string => {
  if (typeof value !== 'string' || value.length === 0 || value.trim() !== value) {
    throw new Error(`${label} must be a non-blank trimmed string`)
  }
}

const main = async (): Promise<void> => {
  const unknownArgs = process.argv.slice(2).filter((arg) => arg !== '--write')
  if (unknownArgs.length > 0) throw new Error(`Unknown arguments: ${unknownArgs.join(', ')}`)

  const [dual, landscapeBytes, ledgerBytes, authoringBytes] = await Promise.all([
    materializeGoalDescriptionRolloutBatchDualSummary(sourceConfigPath, false),
    readFile(landscapePath),
    readFile(semanticKindLedgerPath),
    readFile(authoringPath),
  ])
  const landscape = JSON.parse(landscapeBytes.toString('utf8')) as {
    goals: Array<Record<string, unknown>>
  }
  const ledger = JSON.parse(ledgerBytes.toString('utf8')) as {
    sourceLandscapeId: string
    decisions: Array<{ semanticKind: string; decisionStatus: string }>
  }
  const authoring = JSON.parse(authoringBytes.toString('utf8')) as CarryoverAuthoring
  if (
    authoring.schemaVersion !== 1
    || authoring.artifactType !== 'goal-description-stable-current-carryover-authoring-v1'
    || authoring.carryoverId !== 'mathematik-b031s-stable-current-carryover-1-v1-20260905'
  ) {
    throw new Error('Mathematics B031s stable carryover authoring identity is invalid')
  }
  assertTrimmed(authoring.synthesizedBy, 'synthesizedBy')
  if (
    !sameOrdered(authoring.excludedGoalIds, excludedGoalIds)
    || !sameOrdered(authoring.decisions.map(({ goalId }) => goalId), stableGoalIds)
  ) {
    throw new Error('Mathematics B031s carryover authoring scope or order is invalid')
  }
  const campaignGoalIds = dual.prepared.manifest.goalIds
  if (
    campaignGoalIds.length !== 5
    || !sameMembers(campaignGoalIds, [...stableGoalIds, ...excludedGoalIds])
    || dual.summary.goalCount !== 5
    || dual.summary.counts.requiresSynthesis !== 5
  ) {
    throw new Error('Mathematics B031s campaign no longer partitions into exact stable and excluded scopes')
  }
  for (const goalId of excludedGoalIds) {
    const summary = dual.summary.goals.find((goal) => goal.goalId === goalId)
    if (!summary) {
      throw new Error(`${goalId}: excluded B031s goal is missing from the source campaign`)
    }
  }

  const completedAtValues = [...dual.first.resultPairs, ...dual.second.resultPairs]
    .map(({ run }) => Date.parse(run.completedAt))
  if (completedAtValues.length === 0 || completedAtValues.some((value) => !Number.isFinite(value))) {
    throw new Error('B031s source runs must have valid completion timestamps')
  }
  const synthesizedAt = new Date(Math.max(...completedAtValues) + 1000).toISOString()
  const resolutionArtifacts: Array<{ path: string; bytes: Buffer }> = []
  const indexEntries: Array<Record<string, unknown>> = []

  for (const [index, goalId] of stableGoalIds.entries()) {
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
    if (sourceErrors.length > 0 || !first.source?.record || !second.source?.record) {
      throw new Error(`${goalId}: ${sourceErrors.join(' | ') || 'missing exact source record'}`)
    }
    if (first.source.decision !== 'keep' || second.source.decision !== 'keep') {
      throw new Error(`${goalId}: stable carryover requires two exact KEEP records`)
    }
    const authored = authoring.decisions[index]
    const inputGoal = dual.first.input.goals.find((goal) => goal.goalId === goalId)
    const summaryGoal = dual.summary.goals.find((goal) => goal.goalId === goalId)
    if (!authored || authored.goalId !== goalId || !inputGoal || !summaryGoal) {
      throw new Error(`${goalId}: missing aligned authoring, input, or dual-summary entry`)
    }
    if (authored.evidenceRound !== 'first' && authored.evidenceRound !== 'second') {
      throw new Error(`${goalId}: evidenceRound must be first or second`)
    }
    assertTrimmed(authored.rationaleDe, `${goalId}.rationaleDe`)
    assertTrimmed(authored.rationaleEn, `${goalId}.rationaleEn`)
    const preferredSource = authored.evidenceRound === 'first' ? first.source : second.source
    const resolution = buildGoalDescriptionDualRoundResolution({
      resolutionId: `mathematik-b031s-stable1-current-carryover-v1-resolution-${goalId}`,
      goalId,
      effectiveSemanticKind: 'curricularAtomic',
      decision: 'keep_current',
      synthesis: {
        synthesisId: `mathematik-b031s-stable1-current-carryover-v1-synthesis-${goalId}`,
        authority: 'ai_synthesis',
        synthesizedBy: authoring.synthesizedBy,
        synthesizedAt,
        rationaleDe: authored.rationaleDe,
        rationaleEn: authored.rationaleEn,
        understandingEvidence: structuredClone(preferredSource.record.understandingEvidence),
        dissent: [{
          dissentId: `review-emphasis-${goalId}`,
          source: 'both',
          textDe: 'Die beiden KEEP-Reviews unterscheiden sich nur in Evidenzformulierung und Begründung; die nicht gewählte Runde bleibt als unabhängige kompatible Bestätigung vollständig gebunden.',
          textEn: 'The two KEEP reviews differ only in evidence wording and rationale; the unselected round remains fully bound as an independent compatible confirmation.',
          disposition: authored.evidenceRound === 'first' ? 'accepted_first' : 'accepted_second',
        }],
        humanAttestation: null,
      },
      dualSummaryBytes: dual.bytes,
      currentInput: dual.first.input,
      firstSource: first.source,
      secondSource: second.source,
    })
    const validation = await validateGoalDescriptionDualRoundResolution({
      resolution,
      dualSummary: dual.summary,
      dualSummaryBytes: dual.bytes,
      currentInput: dual.first.input,
      landscape,
      first: dual.first,
      second: dual.second,
    })
    if (validation.errors.length > 0 || !validation.strictDescriptionComplete) {
      throw new Error(`${goalId}: ${validation.errors.join(' | ') || 'resolution is not strict complete'}`)
    }
    const bytes = jsonBytes(resolution)
    const relativeResolutionPath = `${resolutionDirectoryName}/${goalId}.resolution.json`
    resolutionArtifacts.push({ path: join(sourceDirectory, relativeResolutionPath), bytes })
    indexEntries.push({
      goalId,
      titleDe: resolution.goal.finalText.titleDe,
      groupId: dual.prepared.manifest.batchId,
      decision: resolution.decision,
      resolutionPath: relativeResolutionPath,
      resolutionDigest: sha256(bytes),
      resolutionFingerprint: resolution.resolutionFingerprint,
      strictDescriptionComplete: true,
    })
  }

  const curriculumAtomicDenominator = ledger.decisions.filter((decision) => (
    decision.semanticKind === 'curricularAtomic' && decision.decisionStatus === 'authoritative'
  )).length
  if (curriculumAtomicDenominator <= stableGoalIds.length) {
    throw new Error('Mathematics curricularAtomic denominator is invalid')
  }
  const index = {
    schemaVersion: 1,
    artifactSetId: `${dual.prepared.manifest.batchId}-stable-current-carryover-1`,
    subject: dual.prepared.manifest.subjectLabel,
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: indexEntries.length,
    curriculumAtomicDenominator,
    descriptionReviewPercentage: Number(((indexEntries.length / curriculumAtomicDenominator) * 100).toFixed(1)),
    groups: [{
      groupId: dual.prepared.manifest.batchId,
      artifactDirectory: '.',
      dualSummaryPath: 'dual-summary.json',
      dualSummaryDigest: sha256(dual.bytes),
      campaignGoalCount: dual.summary.goalCount,
      resolvedGoalCount: indexEntries.length,
    }],
    resolutions: indexEntries,
  }
  const receipt = {
    schemaVersion: 1,
    receiptId: 'mathematik-b031s-stable-current-carryover-1-v1-20260905',
    purpose: 'Hash-bound bounded carryover of exactly the one current B031s goal confirmed KEEP by both blind rounds; the four changed or context-affected goals remain excluded for a fresh final recheck.',
    sourceBatchId: dual.prepared.manifest.batchId,
    sourceCampaignGoalCount: dual.summary.goalCount,
    claimedGoalIds: [...stableGoalIds],
    claimedGoalCount: stableGoalIds.length,
    excludedGoalIds: [...excludedGoalIds],
    excludedGoalCount: excludedGoalIds.length,
    sourceDualSummaryDigest: sha256(dual.bytes),
    importedBundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint,
    currentCanonicalLandscapeDigest: sha256(landscapeBytes),
    authoringPath: 'stable-current-carryover-1-v1.authoring.json',
    authoringDigest: sha256(authoringBytes),
    resolutionIndexPath: `resolution-index.${outputStem}.json`,
    resolutionIndexFormat: 'legacy-schema-v1-partial-group',
    rationale: [
      'The one claimed bilingual text and context is exact-current and both independent source decisions are KEEP.',
      'The four named excluded goals changed or inherit changed context and receive no resolution, evidence profile, or progress claim from this carryover.',
      'The source campaign contains five goals while this bounded carryover contains one; the partial-group compatibility index represents only the claimed stable subset.',
      'Every individual resolution is freshly validated against both source rounds, the dual summary, and the current canonical landscape.',
      'This receipt changes no canonical text, graph, central configuration, in-flight ownership, assessment, memory, or visualization bytes and registers no central progress.',
    ],
    safeguards: {
      individualResolutionsFreshlyValidated: true,
      exactKeepKeepRequired: true,
      excludedScopeFailsClosed: true,
      staleCanonicalContextFailsClosed: true,
      positiveEvidenceValidatedSeparately: true,
      centralRegistrationPerformed: false,
    },
  }
  await writeAllOrRequireExact([
    ...resolutionArtifacts,
    { path: indexPath, bytes: jsonBytes(index) },
    { path: receiptPath, bytes: jsonBytes(receipt) },
  ])
  console.log(
    `${write ? 'Materialized' : 'Verified'} Mathematics B031s stable-current carryover: strict=${indexEntries.length}/${stableGoalIds.length}; excluded=${excludedGoalIds.length}; index=${indexPath}`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
