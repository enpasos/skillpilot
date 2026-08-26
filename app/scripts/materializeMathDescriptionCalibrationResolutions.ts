import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { GoalBookReviewBundleManifest } from './exportGoalBookReviewBundle'
import { verifyGoalBookReviewBundleArtifactBytes } from './createGoalDescriptionReviewCampaign'
import {
  buildGoalDescriptionDualRoundResolution,
  extractGoalDescriptionDualRoundResolutionSource,
  validateGoalDescriptionDualRoundResolution,
  type GoalDescriptionDualRoundResolution,
} from './validateGoalDescriptionDualRoundResolution'
import {
  type GoalDescriptionReviewCampaign,
  type GoalDescriptionReviewInput,
} from './validateGoalDescriptionReviewCampaign'
import { loadGoalDescriptionReviewCampaignResultDirectories } from './validateGoalDescriptionReviewCampaignResults'
import {
  validateGoalDescriptionReviewDualRound,
  type GoalDescriptionReviewRoundArtifacts,
} from './validateGoalDescriptionReviewDualRound'

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const ARTIFACT_ROOT = resolve(
  REPOSITORY_ROOT,
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/calibration-v2/2026-08-25',
)
const LANDSCAPE_PATH = resolve(
  REPOSITORY_ROOT,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
)
const RESOLUTIONS_DIRECTORY = resolve(ARTIFACT_ROOT, 'resolutions')
const INDEX_PATH = resolve(ARTIFACT_ROOT, 'resolution-index.json')
const THALES_GOAL_ID = '743e5470-ff39-551e-9aba-529656418c66'
const REPRESENTATION_METADATA_GOAL_ID = '8dd9f210-2683-5902-acab-e3be22725232'
const REVISED_GOAL_IDS = new Set([THALES_GOAL_ID, REPRESENTATION_METADATA_GOAL_ID])
const INITIAL_SYNTHESIZED_AT = '2026-08-25T20:56:20.000Z'
const REPRESENTATION_METADATA_SYNTHESIZED_AT = '2026-08-25T21:18:06.000Z'
const INDEX_SYNTHESIZED_AT = REPRESENTATION_METADATA_SYNTHESIZED_AT
const SYNTHESIZED_BY = 'OpenAI Codex AI synthesis'

type GroupDefinition = {
  id: 'calibration-20' | 'thales-current' | 'representation-metadata-current'
  directory: string
  summaryPath: string
  excludedGoalIds: Set<string>
  preferredEvidenceRound: 'first' | 'second'
  synthesizedAt: string
}

const groupDefinitions: GroupDefinition[] = [
  {
    id: 'calibration-20',
    directory: resolve(ARTIFACT_ROOT, 'calibration-20'),
    summaryPath: resolve(ARTIFACT_ROOT, 'calibration-20/dual-summary.json'),
    excludedGoalIds: new Set([THALES_GOAL_ID, REPRESENTATION_METADATA_GOAL_ID]),
    preferredEvidenceRound: 'second',
    synthesizedAt: INITIAL_SYNTHESIZED_AT,
  },
  {
    id: 'thales-current',
    directory: resolve(ARTIFACT_ROOT, 'thales-current'),
    summaryPath: resolve(ARTIFACT_ROOT, 'thales-current/dual-summary.json'),
    excludedGoalIds: new Set(),
    preferredEvidenceRound: 'first',
    synthesizedAt: INITIAL_SYNTHESIZED_AT,
  },
  {
    id: 'representation-metadata-current',
    directory: resolve(ARTIFACT_ROOT, 'representation-metadata-current'),
    summaryPath: resolve(ARTIFACT_ROOT, 'representation-metadata-current/dual-summary.json'),
    excludedGoalIds: new Set(),
    preferredEvidenceRound: 'first',
    synthesizedAt: REPRESENTATION_METADATA_SYNTHESIZED_AT,
  },
]

const sha256 = (value: Buffer | string) => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)

const jsonBytes = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)

const parseJson = <T>(value: Buffer | string, label: string): T => {
  try {
    return JSON.parse(value.toString()) as T
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const loadRound = async (
  groupDirectory: string,
  roundDirectoryName: 'round-a' | 'round-b',
): Promise<GoalDescriptionReviewRoundArtifacts> => {
  const roundDirectory = resolve(groupDirectory, roundDirectoryName)
  const [bundleBytes, inputBytes, campaignBytes] = await Promise.all([
    readFile(resolve(groupDirectory, 'bundle/manifest.json')),
    readFile(resolve(roundDirectory, 'description-review-input.json')),
    readFile(resolve(roundDirectory, 'description-review-campaign.json')),
  ])
  const campaign = parseJson<GoalDescriptionReviewCampaign>(
    campaignBytes,
    `${roundDirectoryName} campaign`,
  )
  const bundle = parseJson<GoalBookReviewBundleManifest>(bundleBytes, `${roundDirectoryName} bundle`)
  await verifyGoalBookReviewBundleArtifactBytes(bundle, resolve(groupDirectory, 'bundle'))
  const loaded = await loadGoalDescriptionReviewCampaignResultDirectories({
    campaign,
    batchesDirectory: resolve(roundDirectory, 'batches'),
    resultsDirectory: resolve(roundDirectory, 'results'),
  })
  if (loaded.errors.length > 0) {
    throw new Error(loaded.errors.map((error) => `${roundDirectoryName}: ${error}`).join('\n'))
  }
  return {
    bundle,
    input: parseJson<GoalDescriptionReviewInput>(inputBytes, `${roundDirectoryName} input`),
    campaign,
    resultPairs: loaded.resultPairs,
  }
}

const synthesisForGoal = ({
  resolutionGoalId,
  titleDe,
  titleEn,
  summaryGoal,
  preferredEvidenceRound,
  synthesizedAt,
  firstSource,
  secondSource,
}: {
  resolutionGoalId: string
  titleDe: string
  titleEn: string
  summaryGoal: Awaited<ReturnType<typeof validateGoalDescriptionReviewDualRound>>['summary']['goals'][number]
  preferredEvidenceRound: GroupDefinition['preferredEvidenceRound']
  synthesizedAt: string
  firstSource: ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']
  secondSource: ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']
}): GoalDescriptionDualRoundResolution['synthesis'] => {
  if (!firstSource?.record || !secondSource?.record) {
    throw new Error(`Cannot synthesize ${resolutionGoalId} without both exact source records`)
  }
  const preferredSource = preferredEvidenceRound === 'first' ? firstSource : secondSource
  const preferredRoundDe = preferredEvidenceRound === 'first' ? 'ersten' : 'zweiten'
  const preferredRoundEn = preferredEvidenceRound
  const disagreementFields = summaryGoal.disagreementFields.join(', ')
  return {
    synthesisId: `math-calibration-v2-20260825-synthesis-${resolutionGoalId}`,
    authority: 'ai_synthesis',
    synthesizedBy: SYNTHESIZED_BY,
    synthesizedAt,
    rationaleDe: `Beide unabhängigen Reviews bestätigen die aktuelle zweisprachige Beschreibung „${titleDe}“ mit keep. Die Synthese übernimmt die fachlich konkretere, unmittelbar prüfbare Evidenzfassung aus der ${preferredRoundDe} Runde; die andere Runde ist damit vereinbar und erweitert lediglich Akzentuierung oder Detailtiefe.`,
    rationaleEn: `Both independent reviews confirm the current bilingual description “${titleEn}” with keep. The synthesis adopts the more concrete and directly assessable evidence formulation from the ${preferredRoundEn} round; the other round is compatible and differs only in emphasis or level of detail.`,
    understandingEvidence: structuredClone(preferredSource.record.understandingEvidence),
    dissent: summaryGoal.agreement === 'disagreement'
      ? [{
          dissentId: `review-emphasis-${resolutionGoalId}`,
          source: 'both',
          textDe: `Die beiden Reviews formulieren ${disagreementFields} unterschiedlich, vertreten aber keine fachlich gegensätzlichen Positionen zur Angemessenheit des aktuellen Lernziels.`,
          textEn: `The two reviews formulate ${disagreementFields} differently but do not take conflicting subject-matter positions on the adequacy of the current learning goal.`,
          disposition: preferredEvidenceRound === 'first' ? 'accepted_first' : 'accepted_second',
        }]
      : [],
    humanAttestation: null,
  }
}

const readOptional = async (path: string) => {
  try {
    return await readFile(path)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
}

const writeOrCheck = async ({
  path,
  expectedBytes,
  write,
}: {
  path: string
  expectedBytes: Buffer
  write: boolean
}) => {
  const currentBytes = await readOptional(path)
  if (write) {
    if (!currentBytes || !currentBytes.equals(expectedBytes)) {
      await mkdir(dirname(path), { recursive: true })
      await writeFile(path, expectedBytes)
    }
    return
  }
  if (!currentBytes) throw new Error(`Missing generated artifact ${relative(REPOSITORY_ROOT, path)}`)
  if (!currentBytes.equals(expectedBytes)) {
    throw new Error(`Stale generated artifact ${relative(REPOSITORY_ROOT, path)}`)
  }
}

const main = async () => {
  const args = process.argv.slice(2)
  if (args.some((arg) => arg !== '--write') || args.filter((arg) => arg === '--write').length > 1) {
    throw new Error('Usage: tsx scripts/materializeMathDescriptionCalibrationResolutions.ts [--write]')
  }
  const write = args.includes('--write')
  const landscape = parseJson<{ goals: Array<Record<string, unknown>> }>(
    await readFile(LANDSCAPE_PATH),
    LANDSCAPE_PATH,
  )
  const generated: Array<{
    goalId: string
    titleDe: string
    groupId: GroupDefinition['id']
    decision: GoalDescriptionDualRoundResolution['decision']
    resolutionPath: string
    resolutionDigest: string
    resolutionFingerprint: string
    strictDescriptionComplete: boolean
  }> = []
  const groups: Array<{
    groupId: GroupDefinition['id']
    dualSummaryPath: string
    dualSummaryDigest: string
    campaignGoalCount: number
    resolvedGoalCount: number
  }> = []

  for (const definition of groupDefinitions) {
    const [first, second] = await Promise.all([
      loadRound(definition.directory, 'round-a'),
      loadRound(definition.directory, 'round-b'),
    ])
    const dual = await validateGoalDescriptionReviewDualRound({ first, second })
    if (dual.errors.length > 0) throw new Error(dual.errors.join('\n'))
    const dualSummaryBytes = jsonBytes(dual.summary)
    await writeOrCheck({ path: definition.summaryPath, expectedBytes: dualSummaryBytes, write })
    const targetGoalIds = dual.summary.goals
      .map(({ goalId }) => goalId)
      .filter((goalId) => !definition.excludedGoalIds.has(goalId))
    let resolvedGoalCount = 0

    for (const goalId of targetGoalIds) {
      const firstResult = extractGoalDescriptionDualRoundResolutionSource({
        artifacts: first,
        goalId,
        label: 'First',
      })
      const secondResult = extractGoalDescriptionDualRoundResolutionSource({
        artifacts: second,
        goalId,
        label: 'Second',
      })
      const sourceErrors = [...firstResult.errors, ...secondResult.errors]
      if (sourceErrors.length > 0 || !firstResult.source || !secondResult.source) {
        throw new Error(sourceErrors.join('\n') || `Missing source record for ${goalId}`)
      }
      const inputGoal = first.input.goals.find((goal) => goal.goalId === goalId)
      const canonicalGoal = landscape.goals.find((goal) => goal.id === goalId)
      const summaryGoal = dual.summary.goals.find((goal) => goal.goalId === goalId)
      if (!inputGoal || !canonicalGoal || !summaryGoal) {
        throw new Error(`Missing current input, canonical goal, or dual-summary comparison for ${goalId}`)
      }
      const decision = REVISED_GOAL_IDS.has(goalId) ? 'current_after_revision' : 'keep_current'
      const resolution = buildGoalDescriptionDualRoundResolution({
        resolutionId: `math-calibration-v2-20260825-resolution-${goalId}`,
        goalId,
        effectiveSemanticKind: 'curricularAtomic',
        decision,
        synthesis: synthesisForGoal({
          resolutionGoalId: goalId,
          titleDe: inputGoal.currentTitleDe,
          titleEn: inputGoal.currentTitleEn,
          summaryGoal,
          preferredEvidenceRound: definition.preferredEvidenceRound,
          synthesizedAt: definition.synthesizedAt,
          firstSource: firstResult.source,
          secondSource: secondResult.source,
        }),
        dualSummaryBytes,
        currentInput: first.input,
        firstSource: firstResult.source,
        secondSource: secondResult.source,
      })
      const validation = await validateGoalDescriptionDualRoundResolution({
        resolution,
        dualSummary: dual.summary,
        dualSummaryBytes,
        currentInput: first.input,
        landscape,
        first,
        second,
      })
      if (validation.errors.length > 0) {
        throw new Error(`${goalId}: ${validation.errors.join('\n')}`)
      }
      if (!validation.strictDescriptionComplete) {
        throw new Error(`${goalId}: expected a strict current-context keep/keep resolution`)
      }
      resolvedGoalCount += 1
      const resolutionPath = resolve(RESOLUTIONS_DIRECTORY, `${goalId}.resolution.json`)
      const resolutionBytes = jsonBytes(resolution)
      await writeOrCheck({ path: resolutionPath, expectedBytes: resolutionBytes, write })
      generated.push({
        goalId,
        titleDe: inputGoal.currentTitleDe,
        groupId: definition.id,
        decision,
        resolutionPath: relative(ARTIFACT_ROOT, resolutionPath),
        resolutionDigest: sha256(resolutionBytes),
        resolutionFingerprint: resolution.resolutionFingerprint,
        strictDescriptionComplete: true,
      })
    }
    groups.push({
      groupId: definition.id,
      dualSummaryPath: relative(ARTIFACT_ROOT, definition.summaryPath),
      dualSummaryDigest: sha256(dualSummaryBytes),
      campaignGoalCount: dual.summary.goalCount,
      resolvedGoalCount,
    })
  }

  if (generated.length !== 20 || new Set(generated.map(({ goalId }) => goalId)).size !== 20) {
    throw new Error(`Expected exactly 20 unique strict resolutions; generated ${generated.length}`)
  }
  const index = {
    schemaVersion: 1,
    artifactSetId: 'math-positive-understanding-calibration-v2-2026-08-25',
    subject: 'Mathematik',
    semanticKind: 'curricularAtomic',
    synthesisAuthority: 'ai_synthesis',
    synthesizedAt: INDEX_SYNTHESIZED_AT,
    strictDescriptionReviewCompleteCount: generated.length,
    curriculumAtomicDenominator: 780,
    descriptionReviewPercentage: Number(((generated.length / 780) * 100).toFixed(1)),
    groups,
    resolutions: generated,
  }
  await writeOrCheck({ path: INDEX_PATH, expectedBytes: jsonBytes(index), write })
  console.log(
    `Math calibration dual resolutions ${write ? 'written' : 'current'}: ${generated.length}/780 description-review (${index.descriptionReviewPercentage.toFixed(1)}%)`,
  )
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
