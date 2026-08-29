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

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const write = process.argv.includes('--write')

const sourceConfigPath = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-28/'
    + 'batch-018-fast-measurement-mechanics-energy-18-carryover-11-v1.config.json',
)
const sourceDirectory = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-28/'
    + 'batch-018-fast-measurement-mechanics-energy-18-carryover-11-v1',
)
const landscapePath = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
)
const indexPath = join(sourceDirectory, 'resolution-index.stable-current-carryover-8-v1.json')
const receiptPath = join(sourceDirectory, 'stable-current-carryover-8-v1.compatibility-receipt.json')
const resolutionDirectoryName = 'resolutions-stable-current-carryover-8-v1'

const goalIds = [
  '8aff7aac-321b-5172-ac55-877876bfd2cd',
  'f6b1d812-ce8b-5852-b417-e6c29b533c7a',
  'f23fdfa9-38b6-5157-8301-ed302476c456',
  '264dc31c-ec92-5e39-a8b8-16f1d74366d4',
  '75b9ca4c-178e-5df2-adc4-f7f78e9d28e5',
  '691c11d0-fa6a-5d2e-a19c-086e89c3c233',
  '7ead007f-e85a-5cb5-b52d-76aae626119a',
  'e39c83b0-cb4f-5454-a143-b9a159c99cba',
] as const

const deferredCurrentCandidateGoalIds = [
  '00245a43-eb89-47d2-92d7-21799dbec9f3',
  '94784e0a-7ddc-48be-91fb-dc82b78eb322',
  '7eeff2de-6015-49a6-a96e-a488d886dc9f',
] as const

const preferredRoundByGoalId = new Map<string, 'first' | 'second'>([
  ['8aff7aac-321b-5172-ac55-877876bfd2cd', 'first'],
  ['f6b1d812-ce8b-5852-b417-e6c29b533c7a', 'first'],
  ['f23fdfa9-38b6-5157-8301-ed302476c456', 'second'],
  ['264dc31c-ec92-5e39-a8b8-16f1d74366d4', 'first'],
  ['75b9ca4c-178e-5df2-adc4-f7f78e9d28e5', 'first'],
  ['691c11d0-fa6a-5d2e-a19c-086e89c3c233', 'first'],
  ['7ead007f-e85a-5cb5-b52d-76aae626119a', 'second'],
  ['e39c83b0-cb4f-5454-a143-b9a159c99cba', 'first'],
])

const sha256 = (value: Buffer | string): `sha256:${string}` => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
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
      throw new Error(`Existing Fast18 carryover artifact is stale: ${path}`)
    }
    if (!current[index] && !write) throw new Error(`Missing Fast18 carryover artifact: ${path}`)
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

  const dual = await materializeGoalDescriptionRolloutBatchDualSummary(sourceConfigPath, false)
  const landscape = JSON.parse(await readFile(landscapePath, 'utf8')) as {
    goals: Array<Record<string, unknown>>
  }
  const landscapeBytes = await readFile(landscapePath)
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
      throw new Error(`${goalId}: stable carryover requires two exact keep records`)
    }

    const inputGoal = dual.first.input.goals.find((goal) => goal.goalId === goalId)
    const summaryGoal = dual.summary.goals.find((goal) => goal.goalId === goalId)
    const preferredRound = preferredRoundByGoalId.get(goalId)
    if (!inputGoal || !summaryGoal || !preferredRound) {
      throw new Error(`${goalId}: missing aligned input, dual summary, or evidence-round decision`)
    }
    const preferredSource = preferredRound === 'first' ? first.source : second.source
    const disagreementFields = summaryGoal.disagreementFields.join(', ')
    const resolution = buildGoalDescriptionDualRoundResolution({
      resolutionId: `physics-fast18-stable-current-carryover-8-v1-resolution-${goalId}`,
      goalId,
      effectiveSemanticKind: 'curricularAtomic',
      decision: 'keep_current',
      synthesis: {
        synthesisId: `physics-fast18-stable-current-carryover-8-v1-synthesis-${goalId}`,
        authority: 'ai_synthesis',
        synthesizedBy: 'OpenAI Codex AI synthesis candidate',
        synthesizedAt: '2026-08-28T10:45:00.000Z',
        rationaleDe: `Beide unabhängigen aktuellen Reviews bestätigen die unveränderte zweisprachige Beschreibung „${inputGoal.currentTitleDe}“ mit keep. Die fachliche Drittabwägung übernimmt die konkretere Evidenzfassung der ${preferredRound === 'first' ? 'ersten' : 'zweiten'} Runde; die andere Runde ist damit vereinbar.`,
        rationaleEn: `Both independent current reviews confirm the unchanged bilingual description “${inputGoal.currentTitleEn}” with keep. The subject-specific third adjudication adopts the more concrete evidence formulation from the ${preferredRound} round; the other round is compatible with it.`,
        understandingEvidence: structuredClone(preferredSource.record.understandingEvidence),
        dissent: summaryGoal.agreement === 'disagreement'
          ? [{
              dissentId: `review-emphasis-${goalId}`,
              source: 'both',
              textDe: `Die beiden keep-Reviews formulieren ${disagreementFields} unterschiedlich, vertreten aber keine fachlich gegensätzlichen Positionen zur Angemessenheit des aktuellen Lernziels.`,
              textEn: `The two keep reviews formulate ${disagreementFields} differently but do not take conflicting subject-matter positions on the adequacy of the current learning goal.`,
              disposition: preferredRound === 'first' ? 'accepted_first' : 'accepted_second',
            } as const]
          : [],
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
    artifactSetId: `${dual.prepared.manifest.batchId}-stable-current-carryover-8`,
    subject: dual.prepared.manifest.subjectLabel,
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: indexEntries.length,
    curriculumAtomicDenominator: 447,
    descriptionReviewPercentage: Number(((indexEntries.length / 447) * 100).toFixed(1)),
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
    receiptId: 'physik-rollout-v1-fast18-stable-current-carryover-8-v1-20260828',
    purpose: 'Bounded compatibility reuse of eight stable exact-current keep/keep reviews from a closed 18-goal campaign.',
    sourceBatchId: dual.prepared.manifest.batchId,
    sourceCampaignGoalCount: dual.summary.goalCount,
    claimedGoalIds: [...goalIds],
    claimedGoalCount: goalIds.length,
    deferredCurrentCandidateGoalIds: [...deferredCurrentCandidateGoalIds],
    deferredReason: 'These three exact-current keep profiles depend directly on already adjudicated pending prerequisite revisions. They remain prepared but unclaimed to avoid predictable stale-context re-review.',
    sourceDualSummaryDigest: sha256(dual.bytes),
    importedBundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint,
    currentCanonicalLandscapeDigest: sha256(landscapeBytes),
    sourceAdjudicationDigest: 'sha256:8f6c3781db657de7e61ec239d7d129aefb07b8c2b7cdc114f06bc44681984e52',
    sourceAdjudicationValidationDigest: 'sha256:a15f058fcc4c5c8f7c9edff2246ecbeabcada59cc1d25fe21775b71ce2522051',
    independentEvidenceAuditDigest: 'sha256:0eb01dde821050d138c3d88d5f7a422c5b5ed84dd35f0a767d2a61c6d589ee62',
    resolutionIndexPath: 'resolution-index.stable-current-carryover-8-v1.json',
    resolutionIndexFormat: 'legacy-schema-v1-partial-group',
    rationale: [
      'All eight bilingual goal texts, goal fingerprints, contexts, bundle bytes, and both independent source records are exact-current; both source decisions are keep.',
      'The source campaign contains 18 goals, while only these eight are stable and unowned. A schema-v2 index requires the complete campaign and cannot represent this bounded carryover.',
      'A fresh eight-goal campaign would repeat two already valid independent reviews without adding subject evidence. The supported schema-v1 partial-group compatibility path preserves fresh per-resolution production validation.',
      'The three deferred current candidates are deliberately not claimed because planned prerequisite revisions would predictably invalidate their current context bindings.',
      'This receipt changes no canonical goal, graph, mapping, assessment, atomicity, memory, or visualization bytes and grants no progress until the central five-gate rollout check passes.',
    ],
    safeguards: {
      individualResolutionsFreshlyValidated: true,
      duplicateOwnershipFailsClosed: true,
      staleCanonicalContextFailsClosed: true,
      positiveEvidenceValidatedSeparately: true,
      pendingPrerequisiteRevisionCandidatesExcluded: true,
      productOwnerEscalationRequired: false,
    },
  }
  await writeAllOrRequireExact([
    ...resolutionArtifacts,
    { path: indexPath, bytes: jsonBytes(index) },
    { path: receiptPath, bytes: jsonBytes(receipt) },
  ])
  console.log(
    `${write ? 'Materialized' : 'Verified'} Physics Fast18 stable carryover: strict=${indexEntries.length}/${goalIds.length}; index=${indexPath}`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
