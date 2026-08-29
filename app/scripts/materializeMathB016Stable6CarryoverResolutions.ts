import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  loadGoalBookBuildInputs,
  stableGoalBookJson,
} from './goalBookModel'
import {
  buildGoalDescriptionRolloutSubsetModel,
  materializeGoalDescriptionRolloutBatchDualSummary,
  materializeGoalDescriptionRolloutBatchResolutionIndex,
} from './materializeGoalDescriptionRolloutBatch'
import {
  buildGoalDescriptionDualRoundResolution,
  extractGoalDescriptionDualRoundResolutionSource,
  validateGoalDescriptionDualRoundResolution,
} from './validateGoalDescriptionDualRoundResolution'

type AdjudicationDecision = {
  goalId: string
  reviewPositions: { first: string; second: string }
  resolutionDecision: string
  finalizableUnderCurrentText: boolean
  strictBeforeIntegratedFollowUp: boolean
  evidenceRound: 'first' | 'second'
  evidenceRecordId: string
  finalText: {
    titleDe: string
    titleEn: string
    descriptionDe: string
    descriptionEn: string
  }
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
    batchManifestDigest: string
    bundleFingerprint: string
    reviewInputFingerprint: string
    dualSummaryDigest: string
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
    requiresFullContextRecheck: number
    requiresProductOwnerDecision: number
  }
  productOwnerEscalations: unknown[]
  requiredFollowUpGoalIds: string[]
  decisions: AdjudicationDecision[]
}

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const write = process.argv.includes('--write')

const sourceBatchName = 'batch-016-e-trigonometric-functions-12-v1'
const followUpBatchName = 'batch-017-e-trigonometric-context-recheck-8-v1'
const rolloutDirectory = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-28',
)
const sourceConfigPath = join(rolloutDirectory, `${sourceBatchName}.config.json`)
const followUpConfigPath = join(rolloutDirectory, `${followUpBatchName}.config.json`)
const sourceDirectory = join(rolloutDirectory, sourceBatchName)
const landscapePath = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
)
const adjudicationPath = join(sourceDirectory, 'third-adjudication/adjudication.json')
const batchManifestPath = join(sourceDirectory, 'batch-manifest.json')
const indexPath = join(sourceDirectory, 'resolution-index.stable-current-carryover-6-v1.json')
const receiptPath = join(sourceDirectory, 'stable-current-carryover-6-v1.compatibility-receipt.json')
const resolutionDirectoryName = 'resolutions-stable-current-carryover-6-v1'

const goalIds = [
  'cdf49335-cebf-54b4-9f52-50d5badabe2f',
  'eda3a298-4965-525e-878d-f05b9e2d4503',
  '2411b2e9-75d7-5e8f-8eb4-f37c4ac555c2',
  '58d2f963-4fb9-550d-a832-f5ac60808900',
  '6acd79f5-9447-5ea1-8127-6dbb72bd057d',
  '2919b3f3-aca2-5add-beeb-de1b9e0eafd8',
] as const

const expectedFollowUpGoalIds = [
  'b42bdfcc-3db7-5697-8b3e-69e50962ca86',
  '858113c5-e53b-57bb-b01f-ba95c3ddcb6f',
  'bbef7cf2-90fa-59fa-a115-8b651aab9231',
  'ea8e3dfb-7fd7-5d49-ae07-01864e6aa464',
  'e28e906e-e4f4-5cb1-b4b1-9bdc67d2ef32',
  '3401d95d-2191-5929-ac78-4de51d71a6be',
  'ecd13e54-ab0e-550f-9400-66e13306635d',
  '56fba457-ab98-5b96-963e-ec284458c17f',
] as const

const expectedAdjudicationDigest = 'a1795706651c1e85e4b9d4c00c2d80c2df0ce0aff22a17bafebc7af7fbed915c'
const expectedDualSummaryDigest = 'eef85e81514b4a8e59405fea348bfce5a4b6f67beb8b9b75c8e9ae5d42dc55d7'
const expectedBatchManifestDigest = 'b1b605176166663b6a952475b7df3bd51286a33f7c1aa4d0a83fc805e2ed380e'

const sha256 = (value: Buffer | string): `sha256:${string}` => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)

const sha256Hex = (value: Buffer | string): string => (
  createHash('sha256').update(value).digest('hex')
)

const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)

const sameOrderedValues = (left: readonly string[], right: readonly string[]): boolean => (
  left.length === right.length && left.every((value, index) => value === right[index])
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
      throw new Error(`Existing Math B016 stable carryover artifact is stale: ${path}`)
    }
    if (!current[index] && !write) {
      throw new Error(`Missing Math B016 stable carryover artifact: ${path}`)
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

  const [
    dual,
    followUp,
    landscapeBytes,
    adjudicationBytes,
    batchManifestBytes,
  ] = await Promise.all([
    materializeGoalDescriptionRolloutBatchDualSummary(sourceConfigPath, false),
    materializeGoalDescriptionRolloutBatchResolutionIndex(followUpConfigPath, false),
    readFile(landscapePath),
    readFile(adjudicationPath),
    readFile(batchManifestPath),
  ])
  if (
    sha256Hex(adjudicationBytes) !== expectedAdjudicationDigest
    || sha256Hex(dual.bytes) !== expectedDualSummaryDigest
    || sha256Hex(batchManifestBytes) !== expectedBatchManifestDigest
  ) {
    throw new Error('Math B016 source adjudication, dual summary, or batch manifest digest changed')
  }
  if (
    followUp.index.resolutions.length !== expectedFollowUpGoalIds.length
    || !sameOrderedValues(followUp.prepared.manifest.goalIds, expectedFollowUpGoalIds)
    || !sameOrderedValues(
      followUp.index.resolutions.map(({ goalId }) => goalId),
      expectedFollowUpGoalIds,
    )
    || followUp.index.resolutions.some(({ strictDescriptionComplete }) => !strictDescriptionComplete)
  ) {
    throw new Error('Math B017 must be fully and exactly resolved before B016 carryover can claim progress')
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
    || adjudication.mode !== 'repository_local_subject_adjudication'
    || adjudication.materialized !== false
    || adjudication.noProgressClaim !== true
    || adjudication.inputBinding.batchManifestDigest !== sha256(batchManifestBytes)
    || adjudication.inputBinding.bundleFingerprint !== dual.prepared.manifest.artifacts.bundleFingerprint
    || adjudication.inputBinding.reviewInputFingerprint !== dual.prepared.manifest.artifacts.reviewInputFingerprint
    || adjudication.inputBinding.dualSummaryDigest !== sha256(dual.bytes)
    || adjudication.inputBinding.goalCount !== dual.summary.goalCount
    || adjudication.counts.total !== 12
    || adjudication.counts.keep_current !== 9
    || adjudication.counts.accepted_revision !== 3
    || adjudication.counts.structural_split !== 0
    || adjudication.counts.unresolved_block !== 0
    || adjudication.counts.finalizableUnderCurrentText !== 9
    || adjudication.counts.requiresCanonicalReworkAndFreshBlindReview !== 8
    || adjudication.counts.requiresFullContextRecheck !== 8
    || adjudication.counts.requiresProductOwnerDecision !== 0
    || adjudication.productOwnerEscalations.length !== 0
    || !sameOrderedValues(adjudication.requiredFollowUpGoalIds, expectedFollowUpGoalIds)
    || adjudication.decisions.length !== dual.summary.goalCount
  ) {
    throw new Error('Math B016 third-adjudication binding is invalid')
  }

  const currentBase = await loadGoalBookBuildInputs(
    dual.prepared.manifest.source.baseGoalBookConfigPath,
  )
  const currentSubset = buildGoalDescriptionRolloutSubsetModel({
    baseModel: currentBase.model,
    goalIds: dual.prepared.manifest.goalIds,
    bookId: dual.prepared.model.book.id,
    title: dual.prepared.model.book.title,
  })

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
    const currentPage = currentSubset.pages.find((page) => page.goalId === goalId)
    if (!inputGoal || !summaryGoal || !decision || !currentPage) {
      throw new Error(`${goalId}: missing aligned input, summary, adjudication, or current page`)
    }
    if (
      decision.reviewPositions.first !== 'keep'
      || decision.reviewPositions.second !== 'keep'
      || decision.resolutionDecision !== 'keep_current'
      || decision.finalizableUnderCurrentText !== true
      || decision.evidenceRound !== 'first'
      || decision.evidenceRecordId !== first.source.record.recordId
      || stableGoalBookJson(decision.finalText) !== stableGoalBookJson({
        titleDe: inputGoal.currentTitleDe,
        titleEn: inputGoal.currentTitleEn,
        descriptionDe: inputGoal.currentDescriptionDe,
        descriptionEn: inputGoal.currentDescriptionEn,
      })
    ) {
      throw new Error(`${goalId}: adjudication no longer matches an exact keep/keep current-text decision`)
    }
    if (
      currentPage.goalFingerprint !== inputGoal.goalFingerprint
      || currentPage.pageFingerprint !== inputGoal.pageFingerprint
      || stableGoalBookJson(currentPage) !== stableGoalBookJson(inputGoal.reviewContext.page)
    ) {
      throw new Error(`${goalId}: current canonical GoalBook context no longer matches the reviewed B016 page`)
    }

    const disagreementFields = summaryGoal.disagreementFields.join(', ')
    const resolution = buildGoalDescriptionDualRoundResolution({
      resolutionId: `math-b016-stable6-current-carryover-v1-resolution-${goalId}`,
      goalId,
      effectiveSemanticKind: 'curricularAtomic',
      decision: 'keep_current',
      synthesis: {
        synthesisId: `math-b016-stable6-current-carryover-v1-synthesis-${goalId}`,
        authority: 'ai_synthesis',
        synthesizedBy: 'OpenAI Codex subject adjudication candidate',
        synthesizedAt: '2026-08-28T17:30:00.000Z',
        rationaleDe: `Beide unabhängigen Reviews bestätigen die unveränderte zweisprachige Beschreibung „${inputGoal.currentTitleDe}“ mit keep. Der aktuelle kanonische Seiten- und Beziehungskontext ist bytegleich zum geprüften B016-Kontext. ${decision.rationaleDe}`,
        rationaleEn: `Both independent reviews confirm the unchanged bilingual description “${inputGoal.currentTitleEn}” with keep. The current canonical page and relation context is byte-identical to the reviewed B016 context. ${decision.rationaleEn}`,
        understandingEvidence: structuredClone(first.source.record.understandingEvidence),
        dissent: summaryGoal.agreement === 'disagreement'
          ? [{
              dissentId: `review-emphasis-${goalId}`,
              source: 'both',
              textDe: `Die beiden keep-Reviews formulieren ${disagreementFields} unterschiedlich, vertreten aber keine gegensätzliche Position zur Angemessenheit des Lernziels. Die Drittabwägung bindet die erste Evidenzrunde als präzisere Fassung ohne Umfangserweiterung.`,
              textEn: `The two keep reviews formulate ${disagreementFields} differently but do not conflict about the adequacy of the goal. The third adjudication binds the first evidence round as the more precise formulation without expanding scope.`,
              disposition: 'accepted_first',
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
    artifactSetId: `${dual.prepared.manifest.batchId}-stable-current-carryover-6`,
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
    receiptId: 'mathematik-rollout-v1-batch-016-stable-current-carryover-6-v1-20260828',
    purpose: 'Bounded compatibility reuse of six exact-current keep/keep reviews from the twelve-goal B016 trigonometry campaign after the complete eight-goal context follow-up passed.',
    sourceBatchId: dual.prepared.manifest.batchId,
    sourceCampaignGoalCount: dual.summary.goalCount,
    claimedGoalIds: [...goalIds],
    claimedGoalCount: goalIds.length,
    requiredFollowUpBatchId: followUp.prepared.manifest.batchId,
    requiredFollowUpGoalIds: [...expectedFollowUpGoalIds],
    requiredFollowUpStrictCompleteCount: followUp.index.resolutions.length,
    sourceDualSummaryDigest: sha256(dual.bytes),
    importedBundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint,
    sourceBatchManifestDigest: sha256(batchManifestBytes),
    sourceAdjudicationDigest: sha256(adjudicationBytes),
    currentCanonicalLandscapeDigest: sha256(landscapeBytes),
    currentSubsetBookDigest: currentSubset.digest,
    resolutionIndexPath: 'resolution-index.stable-current-carryover-6-v1.json',
    resolutionIndexFormat: 'legacy-schema-v1-partial-group',
    rationale: [
      'All six bilingual texts, goal fingerprints, complete GoalBook pages, and direct plus reverse relation contexts remain exact-current, and both independent B016 records remain keep.',
      'The eight context-sensitive goals identified by the bound third adjudication were independently re-reviewed and fully resolved in B017 before this carryover became materializable.',
      'The source campaign contains twelve goals, while only these six use the prior exact context. Schema v2 requires the complete campaign and cannot represent this bounded carryover.',
      'A fresh six-goal campaign would repeat two valid independent reviews without adding subject evidence. The schema-v1 partial-group compatibility path still performs fresh production validation for every resolution.',
      'This receipt changes no canonical goal, graph, mapping, assessment, atomicity, memory, visualization, or Nano Banana asset bytes and grants no progress until the central five-gate rollout check passes.',
    ],
    safeguards: {
      individualResolutionsFreshlyValidated: true,
      completeFollowUpBatchValidatedFirst: true,
      exactCurrentPageAndRelationContextsRequired: true,
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
    `${write ? 'Materialized' : 'Verified'} Math B016 stable carryover: strict=${indexEntries.length}/${goalIds.length}; followUp=${followUp.index.resolutions.length}/${expectedFollowUpGoalIds.length}; index=${indexPath}`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
