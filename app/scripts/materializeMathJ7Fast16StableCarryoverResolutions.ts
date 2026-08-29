import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { stableGoalBookJson } from './goalBookModel'
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
  reviewPositions: { first: string; second: string }
  resolutionDecision: string
  evidenceRound: 'first' | 'second'
  finalizableNow: boolean
  understandingEvidence: UnderstandingEvidence
  rationaleDe: string
  rationaleEn: string
}

type Adjudication = {
  schemaVersion: number
  artifactType: string
  draftContract: string
  batchId: string
  subject: string
  authority: string
  mode: string
  noProgressClaim: boolean
  materialized: boolean
  inputBinding: {
    bundleFingerprint: string
    reviewInputFingerprint: string
    goalCount: number
  }
  counts: {
    total: number
    keep_current: number
    accepted_revision: number
    structural_split: number
    unresolved_block: number
    finalizableUnderCurrentText: number
    requiresCanonicalReworkAndFreshBlindReview: number
    requiresProductOwnerDecision: number
  }
  productOwnerEscalations: unknown[]
  decisions: AdjudicationDecision[]
}

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const write = process.argv.includes('--write')

const batchName = 'batch-014-j7-geometry-measurement-fast16-stable-carryover-3-v1'
const sourceConfigPath = join(
  repositoryRoot,
  `curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-28/${batchName}.config.json`,
)
const sourceDirectory = join(
  repositoryRoot,
  `curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-28/${batchName}`,
)
const landscapePath = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
)
const adjudicationPath = join(sourceDirectory, 'third-adjudication/adjudication.json')
const indexPath = join(sourceDirectory, 'resolution-index.stable-current-carryover-3-v1.json')
const receiptPath = join(sourceDirectory, 'stable-current-carryover-3-v1.compatibility-receipt.json')
const resolutionDirectoryName = 'resolutions-stable-current-carryover-3-v1'

const goalIds = [
  '121e3fdf-54d2-4d46-bc2d-f6e725f10f41',
  '3e53a39b-1c75-4034-a647-8de85719e1fb',
  'ad26e4d9-b025-57ec-8f25-df4a2415cc62',
] as const

const incompatibleCurrentCandidateGoalIds = [
  'fc047e6e-5d6d-460f-99fc-ade3a23b9a8e',
] as const

const directDeferredContextCandidateGoalIds = [
  '34200b88-c616-58f6-aa03-efb9fd766f88',
  'f509a549-aee5-5468-af73-5b1efa3f342c',
  'dcda6fdf-108f-5ea1-bce7-6f30d6443517',
  '3017e774-8d9f-5129-828f-7684db5afc1e',
] as const

const transitiveDeferredContextCandidateGoalIds = [
  'b37851f1-d64a-47ec-a54a-1e70fa5586a9',
  'de393ab3-d2af-5476-8b46-315185abb805',
] as const

const expectedEvidenceRoundByGoalId = new Map<string, 'first' | 'second'>([
  ['121e3fdf-54d2-4d46-bc2d-f6e725f10f41', 'second'],
  ['3e53a39b-1c75-4034-a647-8de85719e1fb', 'second'],
  ['ad26e4d9-b025-57ec-8f25-df4a2415cc62', 'first'],
])

const expectedDeferredPrerequisiteByGoalId = new Map<string, string>([
  ['34200b88-c616-58f6-aa03-efb9fd766f88', 'c31d3a7a-778b-5ae3-9aa4-7b5674047f83'],
  ['f509a549-aee5-5468-af73-5b1efa3f342c', 'c31d3a7a-778b-5ae3-9aa4-7b5674047f83'],
  ['dcda6fdf-108f-5ea1-bce7-6f30d6443517', 'c31d3a7a-778b-5ae3-9aa4-7b5674047f83'],
  ['3017e774-8d9f-5129-828f-7684db5afc1e', 'f0a49da2-018b-4cda-adbd-27047b610a0f'],
  ['b37851f1-d64a-47ec-a54a-1e70fa5586a9', 'fc047e6e-5d6d-460f-99fc-ade3a23b9a8e'],
  ['de393ab3-d2af-5476-8b46-315185abb805', 'fc047e6e-5d6d-460f-99fc-ade3a23b9a8e'],
])

const canonicalReworkGoalIds = [
  'c31d3a7a-778b-5ae3-9aa4-7b5674047f83',
  '59d5a330-61be-4590-ab46-cf7cefecd144',
  '8064088b-dc0a-4a67-ad63-360fdcc9869d',
  'f0a49da2-018b-4cda-adbd-27047b610a0f',
  '0f6c1df6-0e30-54ae-8098-e9422833ba80',
  'd051857c-0707-544f-ae7a-f20690d182b2',
] as const

const expectedAdjudicationDigest = '44b17c1e316aa00590479a9ea9c0e3f0c1716ba4a2e39bdf22a3aae5aa5b9e63'

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
      throw new Error(`Existing Math J7 Fast16 stable carryover artifact is stale: ${path}`)
    }
    if (!current[index] && !write) {
      throw new Error(`Missing Math J7 Fast16 stable carryover artifact: ${path}`)
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

const main = async (): Promise<void> => {
  const unknownArgs = process.argv.slice(2).filter((arg) => arg !== '--write')
  if (unknownArgs.length > 0) throw new Error(`Unknown arguments: ${unknownArgs.join(', ')}`)

  const [dual, landscapeBytes, adjudicationBytes] = await Promise.all([
    materializeGoalDescriptionRolloutBatchDualSummary(sourceConfigPath, false),
    readFile(landscapePath),
    readFile(adjudicationPath),
  ])
  if (sha256Hex(adjudicationBytes) !== expectedAdjudicationDigest) {
    throw new Error(`Math J7 Fast16 adjudication digest changed: ${adjudicationPath}`)
  }

  const landscape = JSON.parse(landscapeBytes.toString('utf8')) as {
    goals: Array<Record<string, unknown>>
  }
  const adjudication = JSON.parse(adjudicationBytes.toString('utf8')) as Adjudication
  if (
    adjudication.schemaVersion !== 1
    || adjudication.artifactType !== 'skillpilot-goal-description-third-adjudication-draft'
    || adjudication.draftContract !== 'skillpilot-goal-description-bilingual-adjudication-draft-v1'
    || adjudication.batchId !== dual.prepared.manifest.batchId
    || adjudication.subject !== 'mathematik'
    || adjudication.authority !== 'third_non_blind_subject_adjudication'
    || adjudication.mode !== 'external_read_only_repository'
    || adjudication.materialized !== false
    || adjudication.noProgressClaim !== true
    || adjudication.inputBinding.bundleFingerprint !== dual.prepared.manifest.artifacts.bundleFingerprint
    || adjudication.inputBinding.reviewInputFingerprint !== dual.prepared.manifest.artifacts.reviewInputFingerprint
    || adjudication.inputBinding.goalCount !== dual.summary.goalCount
    || adjudication.counts.total !== 16
    || adjudication.counts.keep_current !== 10
    || adjudication.counts.accepted_revision !== 4
    || adjudication.counts.structural_split !== 2
    || adjudication.counts.unresolved_block !== 0
    || adjudication.counts.finalizableUnderCurrentText !== 10
    || adjudication.counts.requiresCanonicalReworkAndFreshBlindReview !== 6
    || adjudication.counts.requiresProductOwnerDecision !== 0
    || adjudication.productOwnerEscalations.length !== 0
    || adjudication.decisions.length !== dual.summary.goalCount
    || new Set(adjudication.decisions.map(({ goalId }) => goalId)).size !== dual.summary.goalCount
  ) {
    throw new Error('Math J7 Fast16 third-adjudication binding is invalid')
  }

  const incompatibleDecision = adjudication.decisions.find(
    ({ goalId }) => goalId === incompatibleCurrentCandidateGoalIds[0],
  )
  if (
    !incompatibleDecision
    || incompatibleDecision.reviewPositions.first !== 'split_review'
    || incompatibleDecision.reviewPositions.second !== 'keep'
    || incompatibleDecision.resolutionDecision !== 'keep_current'
    || incompatibleDecision.finalizableNow !== true
  ) {
    throw new Error('Math J7 Fast16 split-review/keep exclusion no longer matches adjudication')
  }
  for (const goalId of canonicalReworkGoalIds) {
    const decision = adjudication.decisions.find((candidate) => candidate.goalId === goalId)
    if (
      !decision
      || decision.finalizableNow !== false
      || !['accepted_revision', 'structural_split'].includes(decision.resolutionDecision)
    ) {
      throw new Error(`${goalId}: canonical rework exclusion no longer matches adjudication`)
    }
  }
  for (const goalId of [
    ...directDeferredContextCandidateGoalIds,
    ...transitiveDeferredContextCandidateGoalIds,
  ]) {
    const decision = adjudication.decisions.find((candidate) => candidate.goalId === goalId)
    const canonicalGoal = landscape.goals.find((candidate) => candidate.id === goalId)
    const expectedPrerequisiteId = expectedDeferredPrerequisiteByGoalId.get(goalId)
    const requires = Array.isArray(canonicalGoal?.requires) ? canonicalGoal.requires : []
    if (
      !decision
      || decision.reviewPositions.first !== 'keep'
      || decision.reviewPositions.second !== 'keep'
      || decision.resolutionDecision !== 'keep_current'
      || decision.finalizableNow !== true
      || !expectedPrerequisiteId
      || !requires.includes(expectedPrerequisiteId)
    ) {
      throw new Error(`${goalId}: deferred current-context candidate no longer matches adjudication`)
    }
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
      throw new Error(`${goalId}: stable carryover requires two exact keep records`)
    }

    const inputGoal = dual.first.input.goals.find((goal) => goal.goalId === goalId)
    const summaryGoal = dual.summary.goals.find((goal) => goal.goalId === goalId)
    const decision = adjudication.decisions.find((candidate) => candidate.goalId === goalId)
    const expectedEvidenceRound = expectedEvidenceRoundByGoalId.get(goalId)
    if (!inputGoal || !summaryGoal || !decision || !expectedEvidenceRound) {
      throw new Error(`${goalId}: missing aligned input, dual summary, or adjudication`)
    }
    if (
      decision.reviewPositions.first !== 'keep'
      || decision.reviewPositions.second !== 'keep'
      || decision.resolutionDecision !== 'keep_current'
      || decision.finalizableNow !== true
      || decision.evidenceRound !== expectedEvidenceRound
    ) {
      throw new Error(`${goalId}: adjudication no longer matches an exact keep/keep current-text decision`)
    }
    const preferredSource = expectedEvidenceRound === 'first' ? first.source : second.source
    if (
      !preferredSource.record?.understandingEvidence
      || stableGoalBookJson(decision.understandingEvidence)
        !== stableGoalBookJson(preferredSource.record.understandingEvidence)
    ) {
      throw new Error(`${goalId}: adjudicated understanding evidence no longer matches its selected review round`)
    }

    const disagreementFields = summaryGoal.disagreementFields.join(', ')
    const resolution = buildGoalDescriptionDualRoundResolution({
      resolutionId: `math-j7-fast16-stable3-current-carryover-v1-resolution-${goalId}`,
      goalId,
      effectiveSemanticKind: 'curricularAtomic',
      decision: 'keep_current',
      synthesis: {
        synthesisId: `math-j7-fast16-stable3-current-carryover-v1-synthesis-${goalId}`,
        authority: 'ai_synthesis',
        synthesizedBy: 'OpenAI Codex subject adjudication candidate',
        synthesizedAt: '2026-08-28T14:00:00.000Z',
        rationaleDe: `Beide unabhängigen aktuellen Reviews bestätigen die unveränderte zweisprachige Beschreibung „${inputGoal.currentTitleDe}“ mit keep. Die gebundene fachliche Drittabwägung führt die stärksten Verständnis-, Beobachtbarkeits- und Transferbedingungen zusammen. ${decision.rationaleDe}`,
        rationaleEn: `Both independent current reviews confirm the unchanged bilingual description “${inputGoal.currentTitleEn}” with keep. The bound subject-specific third adjudication combines the strongest understanding, observability, and transfer conditions. ${decision.rationaleEn}`,
        understandingEvidence: structuredClone(decision.understandingEvidence),
        dissent: summaryGoal.agreement === 'disagreement'
          ? [{
              dissentId: `review-emphasis-${goalId}`,
              source: 'both',
              textDe: `Die beiden keep-Reviews formulieren ${disagreementFields} unterschiedlich, vertreten aber keine gegensätzliche Position zur Angemessenheit des aktuellen Lernziels. Die Drittabwägung bindet die präzisere gemeinsame Evidenz ohne Umfangserweiterung.`,
              textEn: `The two keep reviews formulate ${disagreementFields} differently but do not conflict about the adequacy of the current goal. The third adjudication binds the more precise shared evidence without expanding scope.`,
              disposition: expectedEvidenceRound === 'first' ? 'accepted_first' : 'accepted_second',
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
    artifactSetId: `${dual.prepared.manifest.batchId}-stable-current-carryover-3`,
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
    receiptId: 'mathematik-rollout-v1-j7-fast16-stable3-current-carryover-v1-20260828',
    purpose: 'Bounded compatibility reuse of three exact-current, dependency-stable keep/keep reviews from a closed sixteen-goal J7 geometry and measurement campaign.',
    sourceBatchId: dual.prepared.manifest.batchId,
    sourceCampaignGoalCount: dual.summary.goalCount,
    claimedGoalIds: [...goalIds],
    claimedGoalCount: goalIds.length,
    incompatibleCurrentCandidateGoalIds: [...incompatibleCurrentCandidateGoalIds],
    incompatibleCurrentCandidateReason: 'The angle-relations goal has split_review/keep source decisions. The production resolution contract allows resolved keep_current only for keep/keep or an exact manifest-bound keep/revise rejection, so this goal requires a fresh dual review.',
    directDeferredContextCandidateGoalIds: [...directDeferredContextCandidateGoalIds],
    directDeferredContextCandidateReason: 'Four goals directly depend on prerequisites with adjudicated revisions. The current page fingerprint contract binds prerequisite IDs and titles but not prerequisite descriptions, so these four remain explicitly deferred rather than relying on a known context blind spot.',
    transitiveDeferredContextCandidateGoalIds: [...transitiveDeferredContextCandidateGoalIds],
    transitiveDeferredContextCandidateReason: 'Two goals directly depend on the split_review/keep angle-relations goal, whose fresh review may change its semantics or structure. They remain deferred until that prerequisite is final and their contexts are reviewed again.',
    canonicalReworkGoalIds: [...canonicalReworkGoalIds],
    canonicalReworkReason: 'These goals have adjudicated text revisions or structural splits and require canonical integration followed by two fresh blind reviews.',
    sourceDualSummaryDigest: sha256(dual.bytes),
    importedBundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint,
    currentCanonicalLandscapeDigest: sha256(landscapeBytes),
    sourceAdjudicationDigest: sha256(adjudicationBytes),
    resolutionIndexPath: 'resolution-index.stable-current-carryover-3-v1.json',
    resolutionIndexFormat: 'legacy-schema-v1-partial-group',
    rationale: [
      'All three bilingual goal texts, goal fingerprints, canonical review contexts, bundle bytes, and both independent keep records are exact-current.',
      'The source campaign contains sixteen goals, while only these three are both production-compatible and insulated from already-adjudicated direct or transitive prerequisite rework. Schema v2 requires the complete campaign and cannot represent this bounded carryover.',
      'A fresh three-goal campaign would repeat two already valid independent reviews without adding subject evidence. The supported schema-v1 partial-group compatibility path preserves fresh per-resolution production validation.',
      'The tenth current-text adjudication candidate is deliberately excluded because split_review/keep cannot satisfy the production resolved-resolution contract.',
      'Six otherwise current keep/keep candidates are deliberately deferred until their direct revised prerequisites or the disputed angle-relations prerequisite are final and their contexts can be reviewed again.',
      'The six revision and split goals are excluded. Their planned description-only revisions retain IDs, titles, and graph edges; the structural splits have no direct prerequisite or reverse-prerequisite page binding to these three goals. Any future context drift remains fail-closed in the central validator.',
      'This receipt changes no canonical goal, graph, mapping, assessment, atomicity, memory, visualization, or Nano Banana asset bytes and grants no progress until the central five-gate rollout check passes.',
    ],
    safeguards: {
      individualResolutionsFreshlyValidated: true,
      duplicateOwnershipFailsClosed: true,
      staleCanonicalContextFailsClosed: true,
      positiveEvidenceValidatedSeparately: true,
      incompatibleSplitReviewKeepCandidateExcluded: true,
      directAndTransitiveReworkContextsDeferred: true,
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
    `${write ? 'Materialized' : 'Verified'} Math J7 Fast16 stable carryover: strict=${indexEntries.length}/${goalIds.length}; index=${indexPath}`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
