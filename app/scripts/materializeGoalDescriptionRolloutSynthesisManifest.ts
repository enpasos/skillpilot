import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  materializeGoalDescriptionRolloutBatchDualSummary,
} from './materializeGoalDescriptionRolloutBatch'
import {
  extractGoalDescriptionDualRoundResolutionSource,
} from './validateGoalDescriptionDualRoundResolution'
import {
  buildGoalDescriptionRolloutSynthesisRoundBinding,
  fingerprintGoalDescriptionRolloutSynthesisDecisionManifest,
  validateGoalDescriptionRolloutSynthesisDecisionManifest,
  type GoalDescriptionRolloutSynthesisDecisionManifest,
  type GoalDescriptionRolloutSynthesisExpectedGoal,
  type GoalDescriptionSynthesisDigest,
} from './validateGoalDescriptionRolloutSynthesisDecisionManifest'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

type AuthoringDecision = {
  goalId: string
  resolutionDecision?: 'keep_current' | 'current_after_revision' | 'current_after_split'
  evidenceRound: 'first' | 'second'
  revisionDissent?: GoalDescriptionRolloutSynthesisDecisionManifest['decisions'][number]['revisionDissent']
  rationaleDe: string
  rationaleEn: string
}

type AuthoringSpec = {
  schemaVersion: 1
  manifestId: string
  synthesizedBy: string
  decisions: AuthoringDecision[]
}

const parseArgs = (args: string[]) => {
  let configPath = ''
  let authoringPath = ''
  let write = false
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--write') {
      if (write) throw new Error('Duplicate --write')
      write = true
      continue
    }
    if (arg === '--config') {
      if (configPath || !args[index + 1]) throw new Error('--config requires exactly one path')
      configPath = args[index + 1]
      index += 1
      continue
    }
    if (arg === '--authoring') {
      if (authoringPath || !args[index + 1]) throw new Error('--authoring requires exactly one path')
      authoringPath = args[index + 1]
      index += 1
      continue
    }
    throw new Error(`Unknown argument: ${arg}`)
  }
  if (!configPath || !authoringPath) {
    throw new Error(
      'Usage: tsx scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts --config <batch.config.json> --authoring <synthesis-authoring.json> [--write]',
    )
  }
  return { configPath, authoringPath, write }
}

const sha256 = (value: Buffer | string): GoalDescriptionSynthesisDigest => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)

const parseJson = <T>(value: Buffer | string, label: string): T => {
  try {
    return JSON.parse(value.toString()) as T
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const repositoryPath = (configuredPath: string, label: string) => {
  const absolutePath = resolve(repositoryRoot, configuredPath)
  const relativePath = relative(repositoryRoot, absolutePath)
  if (
    relativePath === ''
    || relativePath === '..'
    || relativePath.startsWith(`..${sep}`)
  ) {
    throw new Error(`${label} must resolve below the repository root: ${configuredPath}`)
  }
  return absolutePath
}

const synthesisTimestamp = (
  first: Awaited<ReturnType<typeof materializeGoalDescriptionRolloutBatchDualSummary>>['first'],
  second: Awaited<ReturnType<typeof materializeGoalDescriptionRolloutBatchDualSummary>>['second'],
) => {
  const completedAtValues = [...first.resultPairs, ...second.resultPairs]
    .map(({ run }) => Date.parse(run.completedAt))
  if (completedAtValues.length === 0 || completedAtValues.some((value) => !Number.isFinite(value))) {
    throw new Error('Completed review runs must provide valid completedAt timestamps')
  }
  return new Date(Math.max(...completedAtValues) + 1000).toISOString()
}

const assertAuthoringSpec = (spec: AuthoringSpec, expectedGoalIds: string[]) => {
  if (spec.schemaVersion !== 1) throw new Error('Synthesis authoring schemaVersion must be 1')
  if (!/^[A-Za-z0-9][A-Za-z0-9._:+-]*$/u.test(spec.manifestId ?? '')) {
    throw new Error('Synthesis authoring manifestId is missing or invalid')
  }
  if (typeof spec.synthesizedBy !== 'string' || spec.synthesizedBy.trim() !== spec.synthesizedBy || !spec.synthesizedBy) {
    throw new Error('Synthesis authoring synthesizedBy must be non-blank and trimmed')
  }
  if (!Array.isArray(spec.decisions)) throw new Error('Synthesis authoring decisions must be an array')
  const goalIds = spec.decisions.map(({ goalId }) => goalId)
  if (JSON.stringify(goalIds) !== JSON.stringify(expectedGoalIds)) {
    throw new Error('Synthesis authoring decisions must contain configured goalIds in configured order')
  }
  for (const decision of spec.decisions) {
    if (decision.evidenceRound !== 'first' && decision.evidenceRound !== 'second') {
      throw new Error(`${decision.goalId}: evidenceRound must be first or second`)
    }
    if (
      typeof decision.rationaleDe !== 'string'
      || decision.rationaleDe.trim() !== decision.rationaleDe
      || !decision.rationaleDe
      || typeof decision.rationaleEn !== 'string'
      || decision.rationaleEn.trim() !== decision.rationaleEn
      || !decision.rationaleEn
    ) {
      throw new Error(`${decision.goalId}: bilingual synthesis rationale must be non-blank and trimmed`)
    }
  }
}

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const dual = await materializeGoalDescriptionRolloutBatchDualSummary(args.configPath, false)
  const landscapePath = repositoryPath(
    dual.prepared.manifest.source.landscapePath,
    'current canonical landscape',
  )
  const batchManifestPath = join(dual.prepared.outputDirectory, 'batch-manifest.json')
  const authoringPath = repositoryPath(args.authoringPath, 'synthesis authoring file')
  const outputPath = join(dual.prepared.outputDirectory, 'synthesis-decisions.json')
  const authoringRelativePath = relative(dual.prepared.outputDirectory, authoringPath)
  if (
    authoringRelativePath === ''
    || authoringRelativePath === '..'
    || authoringRelativePath.startsWith(`..${sep}`)
  ) {
    throw new Error('Synthesis authoring file must live inside the exact standalone batch directory')
  }

  const [landscapeBytes, batchManifestBytes, authoringBytes] = await Promise.all([
    readFile(landscapePath),
    readFile(batchManifestPath),
    readFile(authoringPath),
  ])
  const landscape = parseJson<{ subject?: string; goals?: Array<Record<string, unknown>> }>(
    landscapeBytes,
    landscapePath,
  )
  const authoring = parseJson<AuthoringSpec>(authoringBytes, authoringPath)
  if (
    landscape.subject !== dual.prepared.manifest.subjectLabel
    || !Array.isArray(landscape.goals)
  ) {
    throw new Error('Current canonical landscape identity or goals array disagrees with the prepared batch')
  }
  assertAuthoringSpec(authoring, dual.prepared.manifest.goalIds)

  const expectedGoals: GoalDescriptionRolloutSynthesisExpectedGoal[] = []
  for (const goalId of dual.prepared.manifest.goalIds) {
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
    if (sourceErrors.length > 0 || !firstResult.source || !secondResult.source) {
      throw new Error(sourceErrors.join(' | ') || `Missing exact source records for ${goalId}`)
    }
    const inputGoal = dual.first.input.goals.find((goal) => goal.goalId === goalId)
    if (!inputGoal) throw new Error(`${goalId}: missing current V3 input goal`)
    expectedGoals.push({
      goalId,
      effectiveSemanticKind: 'curricularAtomic',
      goalFingerprint: inputGoal.goalFingerprint as GoalDescriptionSynthesisDigest,
      pageFingerprint: inputGoal.pageFingerprint as GoalDescriptionSynthesisDigest,
      goalReviewContextFingerprint: firstResult.source.binding.goalReviewContextFingerprint,
      finalText: {
        titleDe: inputGoal.currentTitleDe,
        titleEn: inputGoal.currentTitleEn,
        descriptionDe: inputGoal.currentDescriptionDe,
        descriptionEn: inputGoal.currentDescriptionEn,
      },
      firstSource: firstResult.source,
      secondSource: secondResult.source,
    })
  }
  const firstGoal = expectedGoals[0]
  if (!firstGoal) throw new Error('Standalone rollout synthesis requires at least one configured goal')
  const expected = {
    batch: {
      batchId: dual.prepared.manifest.batchId,
      batchManifestDigest: sha256(batchManifestBytes),
      configDigest: dual.prepared.manifest.configDigest,
      bundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint,
      bookDigest: dual.first.input.bookDigest as GoalDescriptionSynthesisDigest,
      reviewInputFingerprint: dual.first.input.reviewInputFingerprint as GoalDescriptionSynthesisDigest,
      dualSummaryDigest: sha256(dual.bytes),
      canonicalLandscapeDigest: sha256(landscapeBytes),
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
    synthesizedAt: synthesisTimestamp(dual.first, dual.second),
    goals: expectedGoals,
  }
  const payload: Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'> = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
    schemaVersion: 1,
    synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
    manifestId: authoring.manifestId,
    authority: 'ai_synthesis',
    synthesizedBy: authoring.synthesizedBy,
    synthesizedAt: expected.synthesizedAt,
    batch: expected.batch,
    rounds: expected.rounds,
    decisions: expectedGoals.map((goal, index) => {
      const authored = authoring.decisions[index]
      if (!authored || authored.goalId !== goal.goalId) {
        throw new Error(`${goal.goalId}: missing aligned authoring decision`)
      }
      return {
        decisionId: `${authoring.manifestId}-decision-${String(index + 1).padStart(3, '0')}`,
        goalId: goal.goalId,
        effectiveSemanticKind: goal.effectiveSemanticKind,
        goalFingerprint: goal.goalFingerprint,
        pageFingerprint: goal.pageFingerprint,
        goalReviewContextFingerprint: goal.goalReviewContextFingerprint,
        finalText: goal.finalText,
        resolutionDecision: authored.resolutionDecision ?? 'keep_current',
        evidenceRound: authored.evidenceRound,
        records: {
          first: {
            recordId: goal.firstSource.binding.recordId,
            recordDigest: goal.firstSource.binding.recordDigest,
          },
          second: {
            recordId: goal.secondSource.binding.recordId,
            recordDigest: goal.secondSource.binding.recordDigest,
          },
        },
        ...(authored.revisionDissent ? { revisionDissent: structuredClone(authored.revisionDissent) } : {}),
        rationaleDe: authored.rationaleDe,
        rationaleEn: authored.rationaleEn,
      }
    }),
  }
  const manifest: GoalDescriptionRolloutSynthesisDecisionManifest = {
    ...payload,
    manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(payload),
  }
  const validation = await validateGoalDescriptionRolloutSynthesisDecisionManifest({ manifest, expected })
  if (validation.errors.length > 0) throw new Error(validation.errors.join(' | '))

  const bytes = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`)
  let current: Buffer | null = null
  try {
    current = await readFile(outputPath)
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
  }
  if (current && !current.equals(bytes)) throw new Error(`Existing synthesis manifest is stale: ${outputPath}`)
  if (!current && args.write) {
    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, bytes, { flag: 'wx' })
  }
  if (!current && !args.write) throw new Error(`Missing synthesis manifest: ${outputPath}`)

  console.log(
    `Standalone synthesis manifest ${args.write ? 'materialized' : 'valid'}: ${dual.prepared.manifest.batchId}; decisions=${manifest.decisions.length}; fingerprint=${manifest.manifestFingerprint}`,
  )
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
