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

type UnderstandingEvidence = {
  essentialUnderstandingDe: string
  essentialUnderstandingEn: string
  observablePerformanceDe: string
  observablePerformanceEn: string
  transferExpectationDe: string
  transferExpectationEn: string
}

type AdjudicationDecision = {
  goalId: string
  goalFingerprint: string
  roundA: { recordId: string; decision: string }
  roundB: { recordId: string; decision: string }
  resolutionDecision: string
  finalizableNow: boolean
  understandingEvidence: UnderstandingEvidence
  rationale: string
}

type Adjudication = {
  schemaVersion: number
  batchId: string
  materialized: boolean
  noProgressClaim: boolean
  inputBinding: {
    bundleFingerprint: string
    reviewInputFingerprint: string
    goalCount: number
  }
  decisions: AdjudicationDecision[]
}

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const write = process.argv.includes('--write')

const sourceConfigPath = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-28/'
    + 'batch-013-j10-functions-trigonometry-deep8-carryover-2-v1.config.json',
)
const sourceDirectory = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-28/'
    + 'batch-013-j10-functions-trigonometry-deep8-carryover-2-v1',
)
const landscapePath = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
)
const adjudicationPath = join(sourceDirectory, 'third-adjudication/adjudication.json')
const adjudicationValidationPath = join(sourceDirectory, 'third-adjudication/validation.json')
const indexPath = join(sourceDirectory, 'resolution-index.stable-current-carryover-2-v1.json')
const receiptPath = join(sourceDirectory, 'stable-current-carryover-2-v1.compatibility-receipt.json')
const resolutionDirectoryName = 'resolutions-stable-current-carryover-2-v1'

const goalIds = [
  '78238608-aaaa-4d12-a9de-54f325e9cf6f',
  '302a857d-ad71-4bdf-81f3-851c95aeefe1',
] as const

const blockedCurrentCandidateGoalIds = [
  '7f11ffe0-7c43-4507-9101-50374a60b0e8',
] as const

const canonicalReworkGoalIds = [
  'c8818eae-0c4d-4fa1-9085-04a9c95a668b',
  '53b47494-ec60-4128-840d-2a4c4bab6d32',
  '6a4716bd-8038-46bb-b647-0db4a254fee7',
  '1a18dbb3-f350-4766-9c8b-20ca018ccef1',
  'f76d00dc-6b31-59cd-b01a-3610eadc9908',
] as const

const expectedAdjudicationDigest = '19acc2ea7569e51227c89623ef511b79f1b505672b35d4d78397eb59820c5f5c'
const expectedAdjudicationValidationDigest = 'd09cf0d984b34cdc89e065846d8680feba18fd9eb19edaef226e85720dd8d67f'

const sha256 = (value: Buffer | string): `sha256:${string}` => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)

const sha256Hex = (value: Buffer | string): string => (
  createHash('sha256').update(value).digest('hex')
)

const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)

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
      throw new Error(`Existing J10 clean2 carryover artifact is stale: ${path}`)
    }
    if (!current[index] && !write) throw new Error(`Missing J10 clean2 carryover artifact: ${path}`)
  })
  if (!write) return
  await Promise.all(artifacts.flatMap(({ path, bytes }, index) => (
    current[index]
      ? []
      : [mkdir(dirname(path), { recursive: true })
          .then(() => writeFile(path, bytes, { flag: 'wx' }))]
  )))
}

const main = async (): Promise<void> => {
  const unknownArgs = process.argv.slice(2).filter((arg) => arg !== '--write')
  if (unknownArgs.length > 0) throw new Error(`Unknown arguments: ${unknownArgs.join(', ')}`)

  const [dual, landscapeBytes, adjudicationBytes, validationBytes] = await Promise.all([
    materializeGoalDescriptionRolloutBatchDualSummary(sourceConfigPath, false),
    readFile(landscapePath),
    readFile(adjudicationPath),
    readFile(adjudicationValidationPath),
  ])
  if (sha256Hex(adjudicationBytes) !== expectedAdjudicationDigest) {
    throw new Error(`J10 adjudication digest changed: ${adjudicationPath}`)
  }
  if (sha256Hex(validationBytes) !== expectedAdjudicationValidationDigest) {
    throw new Error(`J10 adjudication validation digest changed: ${adjudicationValidationPath}`)
  }
  const landscape = JSON.parse(landscapeBytes.toString('utf8')) as {
    goals: Array<Record<string, unknown>>
  }
  const adjudication = JSON.parse(adjudicationBytes.toString('utf8')) as Adjudication
  if (
    adjudication.schemaVersion !== 1
    || adjudication.batchId !== dual.prepared.manifest.batchId
    || adjudication.materialized !== false
    || adjudication.noProgressClaim !== true
    || adjudication.inputBinding.bundleFingerprint !== dual.prepared.manifest.artifacts.bundleFingerprint
    || adjudication.inputBinding.reviewInputFingerprint !== dual.prepared.manifest.artifacts.reviewInputFingerprint
    || adjudication.inputBinding.goalCount !== dual.summary.goalCount
  ) {
    throw new Error('J10 third-adjudication binding is invalid')
  }

  const resolutionArtifacts: Array<{ path: string; bytes: Buffer }> = []
  const indexEntries: Array<Record<string, unknown>> = []

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
    if (sourceErrors.length > 0 || !first.source?.record || !second.source?.record) {
      throw new Error(`${goalId}: ${sourceErrors.join(' | ') || 'missing exact source record'}`)
    }
    if (first.source.decision !== 'keep' || second.source.decision !== 'keep') {
      throw new Error(`${goalId}: clean carryover requires two exact keep records`)
    }

    const inputGoal = dual.first.input.goals.find((goal) => goal.goalId === goalId)
    const summaryGoal = dual.summary.goals.find((goal) => goal.goalId === goalId)
    const decision = adjudication.decisions.find((candidate) => candidate.goalId === goalId)
    if (!inputGoal || !summaryGoal || !decision) {
      throw new Error(`${goalId}: missing aligned input, dual summary, or adjudication`)
    }
    if (
      decision.goalFingerprint !== inputGoal.goalFingerprint
      || decision.roundA.recordId !== first.source.record.recordId
      || decision.roundB.recordId !== second.source.record.recordId
      || decision.roundA.decision !== 'keep'
      || decision.roundB.decision !== 'keep'
      || decision.resolutionDecision !== 'keep_current'
      || decision.finalizableNow !== true
    ) {
      throw new Error(`${goalId}: adjudication no longer matches the exact current review sources`)
    }

    const disagreementFields = summaryGoal.disagreementFields.join(', ')
    const resolution = buildGoalDescriptionDualRoundResolution({
      resolutionId: `math-j10-clean2-stable-current-carryover-v1-resolution-${goalId}`,
      goalId,
      effectiveSemanticKind: 'curricularAtomic',
      decision: 'keep_current',
      synthesis: {
        synthesisId: `math-j10-clean2-stable-current-carryover-v1-synthesis-${goalId}`,
        authority: 'ai_synthesis',
        synthesizedBy: 'OpenAI Codex subject adjudication candidate',
        synthesizedAt: '2026-08-28T13:15:00.000Z',
        rationaleDe: `Beide unabhängigen aktuellen Reviews bestätigen die unveränderte zweisprachige Beschreibung „${inputGoal.currentTitleDe}“ mit keep. Die gebundene fachliche Drittabwägung führt ihre Evidenzakzente ohne Erweiterung des Lernziels zusammen. ${decision.rationale}`,
        rationaleEn: `Both independent current reviews confirm the unchanged bilingual description “${inputGoal.currentTitleEn}” with keep. The bound subject-specific third adjudication combines their evidence emphases without expanding the learning goal.`,
        understandingEvidence: structuredClone(decision.understandingEvidence),
        dissent: [{
          dissentId: `review-emphasis-${goalId}`,
          source: 'both',
          textDe: `Die beiden keep-Reviews formulieren ${disagreementFields} unterschiedlich. Die fachliche Drittabwägung übernimmt die präziseren Gültigkeits-, Darstellungs- und Transferbedingungen der zweiten Runde und bewahrt kompatible Stärken der ersten Runde.`,
          textEn: `The two keep reviews formulate ${disagreementFields} differently. The subject adjudication adopts the more precise validity, representation, and transfer conditions from the second round while preserving compatible strengths from the first round.`,
          disposition: 'accepted_second',
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
    resolutionArtifacts.push({
      path: join(sourceDirectory, relativeResolutionPath),
      bytes,
    })
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

  const index = {
    schemaVersion: 1,
    artifactSetId: `${dual.prepared.manifest.batchId}-stable-current-carryover-2`,
    subject: dual.prepared.manifest.subjectLabel,
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: indexEntries.length,
    curriculumAtomicDenominator: 792,
    descriptionReviewPercentage: Number(((indexEntries.length / 792) * 100).toFixed(1)),
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
    receiptId: 'mathematik-rollout-v1-j10-clean2-stable-current-carryover-v1-20260828',
    purpose: 'Bounded compatibility reuse of two exact-current keep/keep reviews from a closed eight-goal J10 deep-review campaign.',
    sourceBatchId: dual.prepared.manifest.batchId,
    sourceCampaignGoalCount: dual.summary.goalCount,
    claimedGoalIds: [...goalIds],
    claimedGoalCount: goalIds.length,
    blockedCurrentCandidateGoalIds: [...blockedCurrentCandidateGoalIds],
    blockedCurrentCandidateReason: 'The periodic-modeling goal has many unrelated mapping edges and an assessment that overclaims the full competence; it remains excluded until both debts are repaired and revalidated.',
    canonicalReworkGoalIds: [...canonicalReworkGoalIds],
    canonicalReworkReason: 'These goals have adjudicated text revisions or structural splits and require canonical integration followed by two fresh blind reviews.',
    sourceDualSummaryDigest: sha256(dual.bytes),
    importedBundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint,
    currentCanonicalLandscapeDigest: sha256(landscapeBytes),
    sourceAdjudicationDigest: sha256(adjudicationBytes),
    sourceAdjudicationValidationDigest: sha256(validationBytes),
    resolutionIndexPath: 'resolution-index.stable-current-carryover-2-v1.json',
    resolutionIndexFormat: 'legacy-schema-v1-partial-group',
    rationale: [
      'Both bilingual goal texts, goal fingerprints, contexts, bundle bytes, and both independent keep records are exact-current.',
      'The source campaign contains eight goals, while only these two are currently clean, stable, and unowned. Schema v2 requires the complete campaign and cannot represent this bounded carryover.',
      'A fresh two-goal campaign would repeat two already valid independent reviews without adding subject evidence. The supported schema-v1 partial-group compatibility path preserves fresh per-resolution production validation.',
      'The third current KEEP goal is deliberately excluded because its mapping and assessment debt would make a strict integration claim unsound.',
      'This receipt changes no canonical goal, graph, mapping, assessment, atomicity, memory, visualization, or Nano Banana asset bytes and grants no progress until the central five-gate rollout check passes.',
    ],
    safeguards: {
      individualResolutionsFreshlyValidated: true,
      duplicateOwnershipFailsClosed: true,
      staleCanonicalContextFailsClosed: true,
      positiveEvidenceValidatedSeparately: true,
      blockedMappingAssessmentCandidateExcluded: true,
      canonicalRevisionAndSplitCandidatesExcluded: true,
      productOwnerEscalationRequired: false,
    },
  }
  await writeAllOrRequireExact([
    ...resolutionArtifacts,
    { path: indexPath, bytes: jsonBytes(index) },
    { path: receiptPath, bytes: jsonBytes(receipt) },
  ])
  console.log(
    `${write ? 'Materialized' : 'Verified'} Math J10 clean2 carryover: strict=${indexEntries.length}/${goalIds.length}; index=${indexPath}`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
