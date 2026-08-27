import { createHash } from 'node:crypto'
import {
  cp,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  prepareGoalDescriptionRolloutBatch,
  type GoalDescriptionRolloutBatchManifest,
  type StandaloneBatchResolutionIndex,
} from './materializeGoalDescriptionRolloutBatch'
import {
  loadGoalDescriptionReviewCampaignResultDirectories,
  validateGoalDescriptionReviewCampaignResults,
} from './validateGoalDescriptionReviewCampaignResults'
import {
  validateGoalDescriptionReviewDualRound,
  type GoalDescriptionReviewRoundArtifacts,
} from './validateGoalDescriptionReviewDualRound'
import {
  buildGoalDescriptionDualRoundResolution,
  extractGoalDescriptionDualRoundResolutionSource,
  validateGoalDescriptionDualRoundResolution,
  type GoalDescriptionDualRoundResolution,
} from './validateGoalDescriptionDualRoundResolution'
import {
  buildGoalDescriptionRolloutSynthesisRoundBinding,
  fingerprintGoalDescriptionRolloutSynthesisDecisionManifest,
  validateGoalDescriptionRolloutSynthesisDecisionManifest,
  type GoalDescriptionRolloutSynthesisDecisionManifest,
  type GoalDescriptionRolloutSynthesisExpectedGoal,
  type GoalDescriptionSynthesisDigest,
} from './validateGoalDescriptionRolloutSynthesisDecisionManifest'
import { buildGoalDescriptionRolloutResolutionSynthesis } from './materializeGoalDescriptionRolloutResolutions'
import type {
  GoalDescriptionReviewCampaign,
  GoalDescriptionReviewInput,
  GoalDescriptionReviewRecord,
} from './validateGoalDescriptionReviewCampaign'
import type { GoalBookReviewBundleManifest } from './exportGoalBookReviewBundle'
import type { GoalEvidenceAiRunManifest } from './validateGoalEvidenceFindings'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const args = process.argv.slice(2)
if (args.some((arg) => arg !== '--write') || args.filter((arg) => arg === '--write').length > 1) {
  throw new Error('Usage: tsx app/scripts/rebindMathKnownReviewContextStales.ts [--write]')
}
const writeMode = args.includes('--write')

const batches = [
  {
    configPath: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-26/batch-003a-j6-nonstructural-17-current-v2.config.json',
    outputDirectory: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-26/batch-003a-j6-nonstructural-17-current-v2',
  },
  {
    configPath: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-27/batch-004-seki-repair-split-6-current-v3.config.json',
    outputDirectory: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-27/batch-004-seki-repair-split-6-current-v3',
  },
] as const

type JsonObject = Record<string, unknown>

const sha256 = (value: Buffer | string): GoalDescriptionSynthesisDigest => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)

const jsonBytes = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)

const parseJson = <T>(bytes: Buffer | string, label: string): T => {
  try {
    return JSON.parse(bytes.toString()) as T
  } catch (error) {
    throw new Error(`${label}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const parseJsonl = <T>(bytes: Buffer, label: string): T[] => bytes.toString('utf8')
  .split(/\r?\n/u)
  .filter((line) => line.trim() !== '')
  .map((line, index) => parseJson<T>(line, `${label}:${index + 1}`))

const roundArtifacts = async (
  outputDirectory: string,
  round: 'round-a' | 'round-b',
): Promise<GoalDescriptionReviewRoundArtifacts> => {
  const directory = join(outputDirectory, round)
  const [bundleBytes, inputBytes, campaignBytes] = await Promise.all([
    readFile(join(directory, 'review-bundle-manifest.json')),
    readFile(join(directory, 'description-review-input.json')),
    readFile(join(directory, 'description-review-campaign.json')),
  ])
  const campaign = parseJson<GoalDescriptionReviewCampaign>(campaignBytes, `${round} campaign`)
  const loaded = await loadGoalDescriptionReviewCampaignResultDirectories({
    campaign,
    batchesDirectory: join(directory, 'batches'),
    resultsDirectory: join(directory, 'results'),
  })
  if (loaded.errors.length > 0) throw new Error(`${round}: ${loaded.errors.join(' | ')}`)
  return {
    bundle: parseJson<GoalBookReviewBundleManifest>(bundleBytes, `${round} bundle`),
    input: parseJson<GoalDescriptionReviewInput>(inputBytes, `${round} input`),
    campaign,
    resultPairs: loaded.resultPairs,
  }
}

const rematerializeBatch = async ({ configPath, outputDirectory }: typeof batches[number]) => {
  const originalRoot = resolve(repoRoot, outputDirectory)
  const originalConfigBytes = await readFile(resolve(repoRoot, configPath))
  const originalConfig = parseJson<JsonObject>(originalConfigBytes, configPath)
  const originalManifest = parseJson<GoalDescriptionRolloutBatchManifest>(
    await readFile(join(originalRoot, 'batch-manifest.json')),
    'original batch manifest',
  )
  const oldSynthesis = parseJson<GoalDescriptionRolloutSynthesisDecisionManifest>(
    await readFile(join(originalRoot, 'synthesis-decisions.json')),
    'original synthesis manifest',
  )
  const oldIndex = parseJson<StandaloneBatchResolutionIndex>(
    await readFile(join(originalRoot, 'resolution-index.json')),
    'original resolution index',
  )
  const oldResolutionByGoalId = new Map<string, GoalDescriptionDualRoundResolution>()
  for (const goalId of originalManifest.goalIds) {
    oldResolutionByGoalId.set(goalId, parseJson<GoalDescriptionDualRoundResolution>(
      await readFile(join(originalRoot, 'resolutions', `${goalId}.resolution.json`)),
      `original resolution ${goalId}`,
    ))
  }

  const temporaryRoot = await mkdtemp(join(repoRoot, '.math-review-context-rebind-'))
  try {
    const temporaryOutput = join(temporaryRoot, 'batch')
    const temporaryConfigPath = join(temporaryRoot, 'batch.config.json')
    const temporaryConfig = {
      ...originalConfig,
      outputDirectory: relative(repoRoot, temporaryOutput),
    }
    await writeFile(temporaryConfigPath, jsonBytes(temporaryConfig))
    const prepared = await prepareGoalDescriptionRolloutBatch(relative(repoRoot, temporaryConfigPath))

    const preparedManifestPath = join(temporaryOutput, 'batch-manifest.json')
    const preparedManifest = parseJson<GoalDescriptionRolloutBatchManifest>(
      await readFile(preparedManifestPath),
      'prepared batch manifest',
    )
    const finalManifest: GoalDescriptionRolloutBatchManifest = {
      ...preparedManifest,
      configPath: originalManifest.configPath,
      configDigest: sha256(originalConfigBytes),
    }
    const finalManifestBytes = jsonBytes(finalManifest)
    await writeFile(preparedManifestPath, finalManifestBytes)

    for (const round of ['round-a', 'round-b'] as const) {
      const oldRoundRoot = join(originalRoot, round)
      const newRoundRoot = join(temporaryOutput, round)
      const campaign = parseJson<GoalDescriptionReviewCampaign>(
        await readFile(join(newRoundRoot, 'description-review-campaign.json')),
        `${round} campaign`,
      )
      const input = parseJson<GoalDescriptionReviewInput>(
        await readFile(join(newRoundRoot, 'description-review-input.json')),
        `${round} input`,
      )
      const batch = campaign.batches[0]
      if (!batch || campaign.batches.length !== 1) throw new Error(`${round}: expected exactly one batch`)
      const oldRecordsPath = join(oldRoundRoot, 'results', `${batch.batchId}.records.jsonl`)
      const oldRunPath = join(oldRoundRoot, 'results', `${batch.batchId}.run.json`)
      const oldRecords = parseJsonl<GoalDescriptionReviewRecord>(
        await readFile(oldRecordsPath),
        `${round} records`,
      )
      const inputGoalById = new Map(input.goals.map((goal) => [goal.goalId, goal]))
      const records = oldRecords.map((record) => {
        const goal = inputGoalById.get(record.goalId)
        if (!goal) throw new Error(`${round}: record ${record.recordId} has no current input goal`)
        return {
          ...record,
          campaignId: campaign.campaignId,
          roundId: campaign.roundId,
          bundleFingerprint: campaign.bundleFingerprint,
          bookDigest: campaign.bookDigest,
          goalFingerprint: goal.goalFingerprint,
          pageFingerprint: goal.pageFingerprint,
          currentTitleDe: goal.currentTitleDe,
          currentTitleEn: goal.currentTitleEn,
          currentDescriptionDe: goal.currentDescriptionDe,
          currentDescriptionEn: goal.currentDescriptionEn,
        }
      })
      const recordsBytes = Buffer.from(`${records.map((record) => JSON.stringify(record)).join('\n')}\n`)
      const oldRun = parseJson<GoalEvidenceAiRunManifest>(await readFile(oldRunPath), `${round} run`)
      const artifactDigestByRole = new Map(
        (parseJson<GoalBookReviewBundleManifest>(
          await readFile(join(newRoundRoot, 'review-bundle-manifest.json')),
          `${round} bundle`,
        )).artifacts.map((artifact) => [artifact.role, artifact.digest]),
      )
      const run: GoalEvidenceAiRunManifest = {
        ...oldRun,
        campaignId: campaign.campaignId,
        roundId: campaign.roundId,
        batchId: batch.batchId,
        batchInputFingerprint: batch.batchInputFingerprint,
        bundleFingerprint: campaign.bundleFingerprint,
        bookDigest: campaign.bookDigest,
        promptFingerprint: campaign.promptFingerprint,
        criteriaFingerprint: campaign.criteriaFingerprint,
        goalIds: [...batch.goalIds],
        inputArtifacts: oldRun.inputArtifacts.map((artifact) => ({
          ...artifact,
          digest: artifact.role === 'description_review_batch_input_jsonl'
            ? batch.batchInputFingerprint
            : artifactDigestByRole.get(artifact.role as GoalBookReviewBundleManifest['artifacts'][number]['role'])
              ?? artifact.digest,
        })),
        outputDigest: sha256(recordsBytes),
      }
      await Promise.all([
        writeFile(join(newRoundRoot, 'results', `${batch.batchId}.records.jsonl`), recordsBytes),
        writeFile(join(newRoundRoot, 'results', `${batch.batchId}.run.json`), jsonBytes(run)),
      ])
    }

    const [first, second] = await Promise.all([
      roundArtifacts(temporaryOutput, 'round-a'),
      roundArtifacts(temporaryOutput, 'round-b'),
    ])
    const [firstValidation, secondValidation, dual] = await Promise.all([
      validateGoalDescriptionReviewCampaignResults(first),
      validateGoalDescriptionReviewCampaignResults(second),
      validateGoalDescriptionReviewDualRound({ first, second }),
    ])
    const roundErrors = [
      ...firstValidation.errors.map((error) => `round-a: ${error}`),
      ...secondValidation.errors.map((error) => `round-b: ${error}`),
      ...dual.errors.map((error) => `dual: ${error}`),
    ]
    if (roundErrors.length > 0) throw new Error(roundErrors.join(' | '))
    const dualSummaryBytes = jsonBytes(dual.summary)
    await writeFile(join(temporaryOutput, 'dual-summary.json'), dualSummaryBytes)

    const canonicalBytes = await readFile(resolve(repoRoot, finalManifest.source.landscapePath))
    const canonical = parseJson<{ goals: JsonObject[] }>(canonicalBytes, 'canonical landscape')
    const firstSourceByGoalId = new Map()
    const secondSourceByGoalId = new Map()
    const expectedGoals: GoalDescriptionRolloutSynthesisExpectedGoal[] = []
    for (const goalId of finalManifest.goalIds) {
      const firstResult = extractGoalDescriptionDualRoundResolutionSource({ artifacts: first, goalId, label: 'First' })
      const secondResult = extractGoalDescriptionDualRoundResolutionSource({ artifacts: second, goalId, label: 'Second' })
      if (!firstResult.source || !secondResult.source || firstResult.errors.length || secondResult.errors.length) {
        throw new Error([...firstResult.errors, ...secondResult.errors].join(' | '))
      }
      firstSourceByGoalId.set(goalId, firstResult.source)
      secondSourceByGoalId.set(goalId, secondResult.source)
      const inputGoal = first.input.goals.find((goal) => goal.goalId === goalId)
      if (!inputGoal) throw new Error(`${goalId}: current input goal is missing`)
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
    const firstSource = firstSourceByGoalId.get(finalManifest.goalIds[0])!
    const secondSource = secondSourceByGoalId.get(finalManifest.goalIds[0])!
    const expected = {
      batch: {
        batchId: finalManifest.batchId,
        batchManifestDigest: sha256(finalManifestBytes),
        configDigest: finalManifest.configDigest,
        bundleFingerprint: finalManifest.artifacts.bundleFingerprint,
        bookDigest: first.input.bookDigest as GoalDescriptionSynthesisDigest,
        reviewInputFingerprint: first.input.reviewInputFingerprint as GoalDescriptionSynthesisDigest,
        dualSummaryDigest: sha256(dualSummaryBytes),
        canonicalLandscapeDigest: sha256(canonicalBytes),
      },
      rounds: {
        first: buildGoalDescriptionRolloutSynthesisRoundBinding(
          firstSource.binding,
          finalManifest.artifacts.rounds.first.batchInputFingerprint,
        ),
        second: buildGoalDescriptionRolloutSynthesisRoundBinding(
          secondSource.binding,
          finalManifest.artifacts.rounds.second.batchInputFingerprint,
        ),
      },
      synthesizedAt: oldSynthesis.synthesizedAt,
      goals: expectedGoals,
    }
    const expectedGoalById = new Map(expectedGoals.map((goal) => [goal.goalId, goal]))
    const manifestWithoutFingerprint = {
      ...oldSynthesis,
      batch: expected.batch,
      rounds: expected.rounds,
      decisions: oldSynthesis.decisions.map((decision) => {
        const goal = expectedGoalById.get(decision.goalId)
        if (!goal) throw new Error(`${decision.goalId}: synthesis decision is outside the current batch`)
        return {
          ...decision,
          goalFingerprint: goal.goalFingerprint,
          pageFingerprint: goal.pageFingerprint,
          goalReviewContextFingerprint: goal.goalReviewContextFingerprint,
          finalText: goal.finalText,
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
        }
      }),
    }
    delete (manifestWithoutFingerprint as Partial<GoalDescriptionRolloutSynthesisDecisionManifest>).manifestFingerprint
    const synthesisManifest: GoalDescriptionRolloutSynthesisDecisionManifest = {
      ...manifestWithoutFingerprint,
      manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(manifestWithoutFingerprint),
    }
    const synthesisValidation = await validateGoalDescriptionRolloutSynthesisDecisionManifest({
      manifest: synthesisManifest,
      expected,
    })
    if (synthesisValidation.errors.length > 0) throw new Error(synthesisValidation.errors.join(' | '))
    const synthesisBytes = jsonBytes(synthesisManifest)
    await writeFile(join(temporaryOutput, 'synthesis-decisions.json'), synthesisBytes)

    const resolutionBytesByGoalId = new Map<string, Buffer>()
    for (const goalId of finalManifest.goalIds) {
      const oldResolution = oldResolutionByGoalId.get(goalId)!
      const firstGoalSource = firstSourceByGoalId.get(goalId)!
      const secondGoalSource = secondSourceByGoalId.get(goalId)!
      const decision = synthesisManifest.decisions.find((candidate) => candidate.goalId === goalId)!
      const summaryGoal = dual.summary.goals.find((candidate) => candidate.goalId === goalId)!
      const resolution = buildGoalDescriptionDualRoundResolution({
        resolutionId: oldResolution.resolutionId,
        goalId,
        effectiveSemanticKind: oldResolution.goal.effectiveSemanticKind,
        decision: oldResolution.decision,
        synthesis: buildGoalDescriptionRolloutResolutionSynthesis({
          batchId: finalManifest.batchId,
          manifest: synthesisManifest,
          decision,
          summaryGoal,
          firstSource: firstGoalSource,
          secondSource: secondGoalSource,
        }),
        dualSummaryBytes,
        currentInput: first.input,
        firstSource: firstGoalSource,
        secondSource: secondGoalSource,
        synthesisDecisionManifest: {
          contract: 'goal-description-rollout-synthesis-decision-v1',
          manifestPath: 'synthesis-decisions.json',
          manifestId: synthesisManifest.manifestId,
          manifestDigest: sha256(synthesisBytes),
          manifestFingerprint: synthesisManifest.manifestFingerprint,
          decisionId: decision.decisionId,
        },
      })
      const semanticBefore = {
        decision: oldResolution.decision,
        finalText: oldResolution.goal.finalText,
        rationaleDe: oldResolution.synthesis.rationaleDe,
        rationaleEn: oldResolution.synthesis.rationaleEn,
        understandingEvidence: oldResolution.synthesis.understandingEvidence,
        dissent: oldResolution.synthesis.dissent,
      }
      const semanticAfter = {
        decision: resolution.decision,
        finalText: resolution.goal.finalText,
        rationaleDe: resolution.synthesis.rationaleDe,
        rationaleEn: resolution.synthesis.rationaleEn,
        understandingEvidence: resolution.synthesis.understandingEvidence,
        dissent: resolution.synthesis.dissent,
      }
      if (JSON.stringify(semanticBefore) !== JSON.stringify(semanticAfter)) {
        throw new Error(`${goalId}: context rebind changed semantic resolution content`)
      }
      const canonicalGoal = canonical.goals.find((goal) => goal.id === goalId)
      if (!canonicalGoal) throw new Error(`${goalId}: canonical goal is missing`)
      const validation = await validateGoalDescriptionDualRoundResolution({
        resolution,
        dualSummary: dual.summary,
        dualSummaryBytes,
        currentInput: first.input,
        landscape: canonical,
        first,
        second,
        synthesisDecisionManifestArtifact: {
          manifest: synthesisManifest,
          manifestBytes: synthesisBytes,
          manifestPath: 'synthesis-decisions.json',
        },
      })
      if (validation.errors.length > 0 || !validation.strictDescriptionComplete) {
        throw new Error(`${goalId}: ${validation.errors.join(' | ') || 'strict completion is false'}`)
      }
      const bytes = jsonBytes(resolution)
      resolutionBytesByGoalId.set(goalId, bytes)
      await writeFile(join(temporaryOutput, 'resolutions', `${goalId}.resolution.json`), bytes)
    }

    const index: StandaloneBatchResolutionIndex = {
      ...oldIndex,
      groups: oldIndex.groups.map((group) => ({
        ...group,
        dualSummaryDigest: sha256(dualSummaryBytes),
      })),
      resolutions: oldIndex.resolutions.map((entry) => {
        const bytes = resolutionBytesByGoalId.get(entry.goalId)
        if (!bytes) throw new Error(`${entry.goalId}: resolution index entry is outside the batch`)
        const resolution = parseJson<GoalDescriptionDualRoundResolution>(bytes, entry.goalId)
        return {
          ...entry,
          titleDe: resolution.goal.finalText.titleDe,
          decision: resolution.decision,
          resolutionDigest: sha256(bytes),
          resolutionFingerprint: resolution.resolutionFingerprint,
          strictDescriptionComplete: true,
        }
      }),
    }
    await writeFile(join(temporaryOutput, 'resolution-index.json'), jsonBytes(index))

    if (writeMode) {
      await Promise.all([
        cp(join(temporaryOutput, 'bundle'), join(originalRoot, 'bundle'), { recursive: true, force: true }),
        cp(join(temporaryOutput, 'round-a'), join(originalRoot, 'round-a'), { recursive: true, force: true }),
        cp(join(temporaryOutput, 'round-b'), join(originalRoot, 'round-b'), { recursive: true, force: true }),
        cp(join(temporaryOutput, 'resolutions'), join(originalRoot, 'resolutions'), { recursive: true, force: true }),
        writeFile(join(originalRoot, 'batch-manifest.json'), finalManifestBytes),
        writeFile(join(originalRoot, 'dual-summary.json'), dualSummaryBytes),
        writeFile(join(originalRoot, 'synthesis-decisions.json'), synthesisBytes),
        writeFile(join(originalRoot, 'resolution-index.json'), jsonBytes(index)),
      ])
    }
    console.log(
      `CHECK rebind_math_known_review_context_stales ${writeMode ? 'WRITE' : 'PASS'} `
      + `batch=${finalManifest.batchId} goals=${finalManifest.goalIds.length}`,
    )
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true })
  }
}

for (const batch of batches) await rematerializeBatch(batch)
