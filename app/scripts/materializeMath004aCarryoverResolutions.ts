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
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-27/'
    + 'batch-004a-uncontested-16-current-v1.config.json',
)
const sourceDirectory = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-27/'
    + 'batch-004a-uncontested-16-current-v1',
)
const landscapePath = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
)
const indexPath = join(sourceDirectory, 'resolution-index.current-carryover-4-v1.json')
const receiptPath = join(sourceDirectory, 'current-carryover-4-v1.compatibility-receipt.json')
const resolutionDirectoryName = 'resolutions-current-carryover-4-v1'

const goalIds = [
  '804d7443-9976-5d81-a47d-1601f42f7e0e',
  '8da730f1-8947-498d-9e78-7fb20b00a994',
  '3e0c9bce-2528-4cf1-9b1f-c79146b0a5f2',
  'b819973b-4cad-48a4-9f7e-f74b5e75ea6c',
] as const

const preferredRoundByGoalId = new Map<string, 'first' | 'second'>([
  ['804d7443-9976-5d81-a47d-1601f42f7e0e', 'second'],
  ['8da730f1-8947-498d-9e78-7fb20b00a994', 'second'],
  ['3e0c9bce-2528-4cf1-9b1f-c79146b0a5f2', 'second'],
  ['b819973b-4cad-48a4-9f7e-f74b5e75ea6c', 'first'],
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
      throw new Error(`Existing carryover artifact is stale: ${path}`)
    }
    if (!current[index] && !write) throw new Error(`Missing carryover artifact: ${path}`)
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
      throw new Error(`${goalId}: carryover requires two exact keep records`)
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
      resolutionId: `math004a-current-carryover-4-v1-resolution-${goalId}`,
      goalId,
      effectiveSemanticKind: 'curricularAtomic',
      decision: 'keep_current',
      synthesis: {
        synthesisId: `math004a-current-carryover-4-v1-synthesis-${goalId}`,
        authority: 'ai_synthesis',
        synthesizedBy: 'OpenAI Codex AI synthesis candidate',
        synthesizedAt: '2026-08-28T07:30:00.000Z',
        rationaleDe: `Beide unabhängigen aktuellen Reviews bestätigen die unveränderte zweisprachige Beschreibung „${inputGoal.currentTitleDe}“ mit keep. Die Synthese übernimmt nach fachlichem Vergleich die konkretere Evidenzfassung der ${preferredRound === 'first' ? 'ersten' : 'zweiten'} Runde; die andere Runde ist damit vereinbar.`,
        rationaleEn: `Both independent current reviews confirm the unchanged bilingual description “${inputGoal.currentTitleEn}” with keep. After subject-specific comparison, the synthesis adopts the more concrete evidence formulation from the ${preferredRound} round; the other round is compatible with it.`,
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
    artifactSetId: `${dual.prepared.manifest.batchId}-current-carryover-4`,
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
    receiptId: 'mathematik-rollout-v1-batch-004a-current-carryover-4-v1-20260828',
    purpose: 'Bounded compatibility reuse of four exact-current keep/keep reviews from a closed 16-goal legacy campaign.',
    sourceBatchId: dual.prepared.manifest.batchId,
    sourceCampaignGoalCount: dual.summary.goalCount,
    claimedGoalIds: [...goalIds],
    claimedGoalCount: goalIds.length,
    sourceDualSummaryDigest: sha256(dual.bytes),
    currentCanonicalLandscapeDigest: sha256(landscapeBytes),
    resolutionIndexPath: 'resolution-index.current-carryover-4-v1.json',
    resolutionIndexFormat: 'legacy-schema-v1-partial-group',
    rationale: [
      'All four bilingual goal texts, goal fingerprints, and canonical review contexts remain exact-current and both independent source records remain keep.',
      'The source campaign contains 16 goals, while only these four are current and unowned; a schema-v2 index requires the complete campaign and would create duplicate or stale claims.',
      'A fresh four-goal campaign would repeat two already valid independent reviews without adding fachliche evidence. The supported schema-v1 partial-group compatibility path preserves fresh per-resolution production validation instead.',
      'This receipt changes no canonical goal, graph, mapping, assessment, atomicity, memory, or visualization bytes and grants no progress until the central five-gate rollout check passes.',
    ],
    safeguards: {
      individualResolutionsFreshlyValidated: true,
      duplicateOwnershipFailsClosed: true,
      staleCanonicalContextFailsClosed: true,
      positiveEvidenceValidatedSeparately: true,
      productOwnerEscalationRequired: false,
    },
  }
  await writeAllOrRequireExact([
    ...resolutionArtifacts,
    { path: indexPath, bytes: jsonBytes(index) },
    { path: receiptPath, bytes: jsonBytes(receipt) },
  ])
  console.log(
    `${write ? 'Materialized' : 'Verified'} Math004a current carryover: strict=${indexEntries.length}/${goalIds.length}; index=${indexPath}`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
