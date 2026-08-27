import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  materializeGoalDescriptionRolloutBatchDualSummary,
} from './materializeGoalDescriptionRolloutBatch'
import {
  buildGoalDescriptionRolloutResolutionSynthesis,
} from './goalDescriptionRolloutResolutionSynthesis'
import {
  buildGoalDescriptionDualRoundResolution,
  extractGoalDescriptionDualRoundResolutionSource,
  validateGoalDescriptionDualRoundResolution,
} from './validateGoalDescriptionDualRoundResolution'
import {
  buildGoalDescriptionRolloutSynthesisRoundBinding,
  validateGoalDescriptionRolloutSynthesisDecisionManifest,
  type GoalDescriptionRolloutSynthesisDecisionManifest,
  type GoalDescriptionRolloutSynthesisExpectedGoal,
  type GoalDescriptionSynthesisDigest,
} from './validateGoalDescriptionRolloutSynthesisDecisionManifest'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

export { buildGoalDescriptionRolloutResolutionSynthesis }

const parseArgs = (args: string[]) => {
  let configPath = ''
  let synthesisManifestPath = ''
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
    if (arg === '--synthesis-manifest') {
      if (synthesisManifestPath || !args[index + 1]) {
        throw new Error('--synthesis-manifest requires exactly one path')
      }
      synthesisManifestPath = args[index + 1]
      index += 1
      continue
    }
    throw new Error(`Unknown argument: ${arg}`)
  }
  if (!configPath || !synthesisManifestPath) {
    throw new Error(
      'Usage: tsx scripts/materializeGoalDescriptionRolloutResolutions.ts --config <batch.config.json> --synthesis-manifest <synthesis-decisions.json> [--write]',
    )
  }
  return { configPath, synthesisManifestPath, write }
}

const sha256 = (value: Buffer | string): GoalDescriptionSynthesisDigest => (
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

const readOptional = async (path: string) => {
  try {
    return await readFile(path)
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}

const writeAllOrRequireExact = async (
  artifacts: Array<{ path: string; bytes: Buffer }>,
  write: boolean,
) => {
  const current = await Promise.all(artifacts.map(({ path }) => readOptional(path)))
  artifacts.forEach(({ path, bytes }, index) => {
    if (current[index] && !current[index]?.equals(bytes)) {
      throw new Error(`Existing synthesis artifact is stale: ${path}`)
    }
    if (!current[index] && !write) throw new Error(`Missing synthesis artifact: ${path}`)
  })
  if (!write) return
  await Promise.all(artifacts.flatMap(({ path, bytes }, index) => (
    current[index]
      ? []
      : [mkdir(dirname(path), { recursive: true })
          .then(() => writeFile(path, bytes, { flag: 'wx' }))]
  )))
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

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const dual = await materializeGoalDescriptionRolloutBatchDualSummary(args.configPath, args.write)
  const landscapePath = repositoryPath(
    dual.prepared.manifest.source.landscapePath,
    'current canonical landscape',
  )
  const batchManifestPath = join(dual.prepared.outputDirectory, 'batch-manifest.json')
  const synthesisManifestPath = repositoryPath(args.synthesisManifestPath, 'synthesis decision manifest')
  const synthesisManifestRelativePath = relative(
    dual.prepared.outputDirectory,
    synthesisManifestPath,
  )
  if (
    synthesisManifestRelativePath === ''
    || synthesisManifestRelativePath === '..'
    || synthesisManifestRelativePath.startsWith(`..${sep}`)
  ) {
    throw new Error('Synthesis decision manifest must live inside the exact standalone batch directory')
  }
  const [landscapeBytes, batchManifestBytes, synthesisManifestBytes] = await Promise.all([
    readFile(landscapePath),
    readFile(batchManifestPath),
    readFile(synthesisManifestPath),
  ])
  const landscape = parseJson<{ subject?: string; goals?: Array<Record<string, unknown>> }>(
    landscapeBytes,
    landscapePath,
  )
  const synthesisManifest = parseJson<GoalDescriptionRolloutSynthesisDecisionManifest>(
    synthesisManifestBytes,
    synthesisManifestPath,
  )
  if (
    landscape.subject !== dual.prepared.manifest.subjectLabel
    || !Array.isArray(landscape.goals)
  ) {
    throw new Error('Current canonical landscape identity or goals array disagrees with the prepared batch')
  }

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
  const manifestValidation = await validateGoalDescriptionRolloutSynthesisDecisionManifest({
    manifest: synthesisManifest,
    expected,
  })
  if (manifestValidation.errors.length > 0) {
    throw new Error(manifestValidation.errors.join(' | '))
  }

  const resolutionArtifacts: Array<{ path: string; bytes: Buffer }> = []
  for (const [index, goalId] of dual.prepared.manifest.goalIds.entries()) {
    const expectedGoal = expectedGoals[index]
    const decision = synthesisManifest.decisions[index]
    const summaryGoal = dual.summary.goals.find((goal) => goal.goalId === goalId)
    if (!expectedGoal || !decision || !summaryGoal) {
      throw new Error(`${goalId}: missing validated synthesis decision or dual-summary goal`)
    }
    const synthesis = buildGoalDescriptionRolloutResolutionSynthesis({
      batchId: dual.prepared.manifest.batchId,
      manifest: synthesisManifest,
      decision,
      summaryGoal,
      firstSource: expectedGoal.firstSource,
      secondSource: expectedGoal.secondSource,
    })
    const resolution = buildGoalDescriptionDualRoundResolution({
      resolutionId: `${dual.prepared.manifest.batchId}-resolution-${goalId}`,
      goalId,
      effectiveSemanticKind: decision.effectiveSemanticKind,
      decision: decision.resolutionDecision,
      synthesis,
      dualSummaryBytes: dual.bytes,
      currentInput: dual.first.input,
      firstSource: expectedGoal.firstSource,
      secondSource: expectedGoal.secondSource,
      synthesisDecisionManifest: {
        contract: synthesisManifest.synthesisContract,
        manifestPath: synthesisManifestRelativePath.split(sep).join('/'),
        manifestId: synthesisManifest.manifestId,
        manifestDigest: sha256(synthesisManifestBytes),
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
        manifestBytes: synthesisManifestBytes,
        manifestPath: synthesisManifestRelativePath.split(sep).join('/'),
      },
    })
    if (validation.errors.length > 0) {
      throw new Error(`${goalId}: ${validation.errors.join(' | ')}`)
    }
    if (!validation.strictDescriptionComplete) {
      throw new Error(`${goalId}: synthesized resolution is not strict current-context keep/keep completion`)
    }
    resolutionArtifacts.push({
      path: join(dual.prepared.outputDirectory, 'resolutions', `${goalId}.resolution.json`),
      bytes: jsonBytes(resolution),
    })
  }
  await writeAllOrRequireExact(resolutionArtifacts, args.write)

  console.log(
    `Standalone manifest-bound resolutions ${args.write ? 'materialized' : 'valid'}: ${dual.prepared.manifest.batchId}; strict=${resolutionArtifacts.length}/${dual.prepared.manifest.goalIds.length}; manifest=${synthesisManifest.manifestFingerprint}`,
  )
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
