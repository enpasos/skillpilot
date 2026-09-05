import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoalDescriptionRolloutResolutionSynthesis } from './goalDescriptionRolloutResolutionSynthesis'
import { stableGoalBookJson } from './goalBookModel'
import { materializeGoalDescriptionRolloutBatchDualSummary } from './materializeGoalDescriptionRolloutBatch'
import {
  buildGoalDescriptionDualRoundResolution,
  extractGoalDescriptionDualRoundResolutionSource,
  fingerprintGoalDescriptionReviewContext,
  validateGoalDescriptionDualRoundResolution,
} from './validateGoalDescriptionDualRoundResolution'
import { buildGoalDescriptionCanonicalContext } from './validateGoalDescriptionReviewCampaign'
import {
  buildGoalDescriptionRolloutSynthesisRoundBinding,
  fingerprintGoalDescriptionRolloutSynthesisDecisionManifest,
  validateGoalDescriptionRolloutSynthesisDecisionManifest,
  type GoalDescriptionRolloutSynthesisDecisionManifest,
  type GoalDescriptionRolloutSynthesisExpectedGoal,
  type GoalDescriptionSynthesisDigest,
} from './validateGoalDescriptionRolloutSynthesisDecisionManifest'

type JsonGoal = Record<string, unknown>

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const write = process.argv.includes('--write')
const refresh = process.argv.includes('--refresh')
const rolloutDirectory = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-05',
)
const batchName = 'batch-033t-final-corrections-context-recheck-14-v1'
const configPath = join(rolloutDirectory, `${batchName}.config.json`)
const batchDirectory = join(rolloutDirectory, batchName)
const batchManifestPath = join(batchDirectory, 'batch-manifest.json')
const dualSummaryPath = join(batchDirectory, 'dual-summary.json')
const landscapePath = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
)
const semanticKindLedgerPath = join(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
)
const followupPath = join(repositoryRoot, 'app/scripts/applyPhysicsBatch033FinalFollowup.ts')
const outputStem = 'stable-current-carryover-7-v1'
const synthesisRelativePath = `synthesis-decisions.${outputStem}.json`
const synthesisPath = join(batchDirectory, synthesisRelativePath)
const resolutionDirectoryName = `resolutions-${outputStem}`
const indexPath = join(batchDirectory, `resolution-index.${outputStem}.json`)
const receiptPath = join(batchDirectory, `${outputStem}.compatibility-receipt.json`)

const campaignGoalIds = [
  '1730c01d-8c85-57df-b031-c11e2a0511b1',
  '9f59a088-3939-59e9-821d-167fadfda782',
  '7badac4d-2874-5b3a-87e8-bf8f4440b2a6',
  'df010b2b-b182-5f7e-bbe4-49b72e48c27a',
  '2622bef1-bdbc-504e-b468-b600b2ca3ed8',
  'b9fcbad4-a855-54b7-8017-4caac1e2ffb7',
  'bdaa56ad-6257-58a3-a633-8a6339f72f09',
  '09e058e9-f3ed-5046-b0e9-495b694bf2a1',
  'e19fccd7-6a35-5c9e-86e1-dcca76481e9c',
  'db47ac91-7bb0-5ba3-b39d-e2d6fc98396e',
  '8cdef591-6ddb-5151-8c74-a80be0271079',
  '3aaac6ad-948e-502a-9d49-ce40db0f2ca3',
  '8fbae050-c5c9-52b6-9983-2c366e9c8ade',
  '0b08aed8-3c0f-5b38-844c-1bb363abbf68',
] as const

const stableGoalIds = [
  campaignGoalIds[0],
  campaignGoalIds[2],
  campaignGoalIds[3],
  campaignGoalIds[5],
  campaignGoalIds[6],
  campaignGoalIds[10],
  campaignGoalIds[11],
] as const

const ownTextChangedGoalIds = [
  campaignGoalIds[1],
  campaignGoalIds[4],
  campaignGoalIds[7],
  campaignGoalIds[9],
  campaignGoalIds[12],
  campaignGoalIds[13],
] as const

const contextStaleGoalIds = [campaignGoalIds[8], campaignGoalIds[12]] as const
const excludedGoalIds = campaignGoalIds.filter((goalId) => !stableGoalIds.includes(goalId as typeof stableGoalIds[number]))
const expectedDecisionPairs = new Map<string, readonly [string, string]>([
  [campaignGoalIds[0], ['keep', 'keep']],
  [campaignGoalIds[1], ['keep', 'revise']],
  [campaignGoalIds[2], ['keep', 'keep']],
  [campaignGoalIds[3], ['keep', 'keep']],
  [campaignGoalIds[4], ['revise', 'revise']],
  [campaignGoalIds[5], ['keep', 'keep']],
  [campaignGoalIds[6], ['keep', 'keep']],
  [campaignGoalIds[7], ['block', 'block']],
  [campaignGoalIds[8], ['keep', 'keep']],
  [campaignGoalIds[9], ['keep', 'revise']],
  [campaignGoalIds[10], ['keep', 'keep']],
  [campaignGoalIds[11], ['keep', 'keep']],
  [campaignGoalIds[12], ['keep', 'keep']],
  [campaignGoalIds[13], ['split_review', 'split_review']],
])

const rationales = new Map<string, { de: string; en: string }>([
  [stableGoalIds[0], {
    de: 'Beide unabhängigen Runden bestätigen die fachlich kontrollierte Trennung von Potenzialdifferenz, Arbeit und Energieänderung sowie die Geltungsbedingungen von |U| = E·d. Eigener Text und direkter Voraussetzungskontext sind nach dem B033-Final-Follow-up bytegleich zum Reviewstand.',
    en: 'Both independent rounds confirm the controlled distinction among potential difference, work, and energy change and the validity conditions of |U| = E·d. The goal text and direct prerequisite context remain byte-identical to the reviewed state after the B033 final follow-up.',
  }],
  [stableGoalIds[1], {
    de: 'Beide Runden bestätigen die bedingungsbewusste Leitfähigkeitsklassifikation und begründete Zuordnung. Eigener Text und direkter Voraussetzungskontext sind nach dem B033-Final-Follow-up unverändert.',
    en: 'Both rounds confirm the condition-aware conductivity classification and justified assignment. The goal text and direct prerequisite context are unchanged after the B033 final follow-up.',
  }],
  [stableGoalIds[2], {
    de: 'Beide Runden bestätigen das qualitative Bändermodell und die korrekte Erklärung der Dotierungswirkung. Das Ziel und sein direkter stabiler Vorgänger 7bad… sind unverändert.',
    en: 'Both rounds confirm the qualitative band model and the correct explanation of doping effects. The goal and its direct stable prerequisite 7bad… are unchanged.',
  }],
  [stableGoalIds[3], {
    de: 'Beide Runden bestätigen die operationale Trennung von nichtklassischer Korrelation, Grenze lokaler realistischer Modelle und No-Signalling. Eigener Text und direkter Voraussetzungskontext sind unverändert.',
    en: 'Both rounds confirm the operational distinction among non-classical correlation, constraints on local realistic models, and no-signalling. The goal text and direct prerequisite context are unchanged.',
  }],
  [stableGoalIds[4], {
    de: 'Beide Runden bestätigen Frequenz-Orts-Zuordnung, mechanische Amplitudendeutung und die Grenze zur Wahrnehmung als kohärente Modellkompetenz. Eigener Text und direkter Voraussetzungskontext sind unverändert.',
    en: 'Both rounds confirm frequency-to-place mapping, interpretation of mechanical amplitude, and the boundary to perception as a coherent modelling competence. The goal text and direct prerequisite context are unchanged.',
  }],
  [stableGoalIds[5], {
    de: 'Beide Runden bestätigen Messung, mathematische Beschreibung und die entgegengesetzten Wirkungen von Membran- und Axialwiderstand im passiven Kabelmodell. Eigener Text und direkter Voraussetzungskontext sind unverändert.',
    en: 'Both rounds confirm measurement, mathematical description, and the opposing effects of membrane and axial resistance in the passive cable model. The goal text and direct prerequisite context are unchanged.',
  }],
  [stableGoalIds[6], {
    de: 'Beide Runden bestätigen die mathematische RC-Modellierung und die wesentliche Trennung von lokalem Zeitverlauf und räumlicher Abschwächung. Eigener Text und direkter Voraussetzungskontext sind unverändert.',
    en: 'Both rounds confirm the mathematical RC model and the essential distinction between local temporal response and spatial attenuation. The goal text and direct prerequisite context are unchanged.',
  }],
])

const sha256 = (value: Buffer | string): GoalDescriptionSynthesisDigest => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const goalText = (goal: JsonGoal) => ({
  titleDe: String(goal.title ?? ''),
  titleEn: String(goal.titleEn ?? ''),
  descriptionDe: String(goal.description ?? ''),
  descriptionEn: String(goal.descriptionEn ?? ''),
})
const inputText = (goal: { currentTitleDe: string; currentTitleEn: string; currentDescriptionDe: string; currentDescriptionEn: string }) => ({
  titleDe: goal.currentTitleDe,
  titleEn: goal.currentTitleEn,
  descriptionDe: goal.currentDescriptionDe,
  descriptionEn: goal.currentDescriptionEn,
})
const readOptional = async (path: string): Promise<Buffer | null> => {
  try { return await readFile(path) } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}
const writeAllOrRequireExact = async (artifacts: Array<{ path: string; bytes: Buffer }>): Promise<void> => {
  const current = await Promise.all(artifacts.map(({ path }) => readOptional(path)))
  artifacts.forEach(({ path, bytes }, index) => {
    if (current[index] && !current[index]?.equals(bytes) && !(write && refresh)) {
      throw new Error(`Existing Physics B033t artifact is stale: ${path}`)
    }
    if (!current[index] && !write) throw new Error(`Missing Physics B033t artifact: ${path}`)
  })
  if (!write) return
  await Promise.all(artifacts.map(async ({ path, bytes }, index) => {
    if (current[index]?.equals(bytes)) return
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, bytes, current[index] ? undefined : { flag: 'wx' })
  }))
}

const main = async (): Promise<void> => {
  const unexpected = process.argv.slice(2).filter((argument) => !['--write', '--refresh'].includes(argument))
  if (unexpected.length > 0) throw new Error(`Unknown arguments: ${unexpected.join(', ')}`)
  if (refresh && !write) throw new Error('--refresh requires --write')
  const [dual, configBytes, batchManifestBytes, committedDualBytes, landscapeBytes, ledgerBytes, followupBytes] = await Promise.all([
    materializeGoalDescriptionRolloutBatchDualSummary(configPath, false),
    readFile(configPath),
    readFile(batchManifestPath),
    readFile(dualSummaryPath),
    readFile(landscapePath),
    readFile(semanticKindLedgerPath),
    readFile(followupPath),
  ])
  if (sha256(configBytes) !== 'sha256:ac02af703e8dd8db1c44a21bb3d28995100cdeb7f5765d4427825091e76a0343') {
    throw new Error('Physics B033t source config drifted')
  }
  if (sha256(followupBytes) !== 'sha256:58ff0258a0ee24d50b7ac03ae9a22598fd8bdff55869f34b136e1a3fa5bb0d7d') {
    throw new Error('applyPhysicsBatch033FinalFollowup.ts drifted')
  }
  if (!committedDualBytes.equals(dual.bytes)) throw new Error('Physics B033t dual summary is not deterministic/current')
  if (
    dual.summary.goalCount !== campaignGoalIds.length
    || dual.summary.counts.requiresSynthesis !== campaignGoalIds.length
    || stableGoalBookJson(dual.prepared.manifest.goalIds) !== stableGoalBookJson(campaignGoalIds)
  ) throw new Error('Physics B033t campaign scope or order drifted')
  for (const goal of dual.summary.goals) {
    const pair = expectedDecisionPairs.get(goal.goalId)
    if (!pair || goal.firstDecision !== pair[0] || goal.secondDecision !== pair[1]) {
      throw new Error(`${goal.goalId}: unexpected dual-review decision pair`)
    }
  }

  const landscape = JSON.parse(landscapeBytes.toString('utf8')) as { goals: JsonGoal[] }
  const ledger = JSON.parse(ledgerBytes.toString('utf8')) as {
    decisions: Array<{ goalId?: string; semanticKind?: string; decisionStatus?: string }>
  }
  const canonicalById = new Map(landscape.goals.map((goal) => [String(goal.id), goal]))
  const firstInputById = new Map(dual.first.input.goals.map((goal) => [goal.goalId, goal]))
  const secondInputById = new Map(dual.second.input.goals.map((goal) => [goal.goalId, goal]))
  const observedOwnTextChanged = campaignGoalIds.filter((goalId) => {
    const input = firstInputById.get(goalId)
    const canonical = canonicalById.get(goalId)
    if (!input || !canonical) throw new Error(`${goalId}: missing input or canonical goal`)
    return stableGoalBookJson(inputText(input)) !== stableGoalBookJson(goalText(canonical))
  })
  if (stableGoalBookJson(observedOwnTextChanged) !== stableGoalBookJson(ownTextChangedGoalIds)) {
    throw new Error(`Physics B033t own-text drift partition changed: ${observedOwnTextChanged.join(', ')}`)
  }

  const contextStaleByGoal = new Map<string, string[]>(campaignGoalIds.map((goalId) => {
    const input = firstInputById.get(goalId)
    if (!input) throw new Error(`${goalId}: missing first input`)
    const stalePrerequisites = input.canonicalContext.requires.filter((requiredId) => {
      const reviewedPrerequisite = firstInputById.get(requiredId)
      const currentPrerequisite = canonicalById.get(requiredId)
      if (!reviewedPrerequisite) return false
      if (!currentPrerequisite) throw new Error(`${goalId}: missing canonical prerequisite ${requiredId}`)
      return stableGoalBookJson(inputText(reviewedPrerequisite)) !== stableGoalBookJson(goalText(currentPrerequisite))
    })
    return [goalId, stalePrerequisites]
  }))
  if (
    stableGoalBookJson(contextStaleByGoal.get(contextStaleGoalIds[0])) !== stableGoalBookJson([ownTextChangedGoalIds[1]])
    || stableGoalBookJson(contextStaleByGoal.get(contextStaleGoalIds[1])) !== stableGoalBookJson([ownTextChangedGoalIds[3]])
  ) throw new Error('Physics B033t direct-prerequisite stale-context partition changed')
  for (const goalId of stableGoalIds) {
    if ((contextStaleByGoal.get(goalId) ?? []).length > 0) throw new Error(`${goalId}: direct prerequisite text drifted`)
  }

  const expectedGoals: GoalDescriptionRolloutSynthesisExpectedGoal[] = []
  const sources = new Map<string, {
    first: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
    second: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
  }>()
  const prerequisiteContext = new Map<string, Array<Record<string, unknown>>>()
  for (const goalId of stableGoalIds) {
    const first = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.first, goalId, label: 'First' })
    const second = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.second, goalId, label: 'Second' })
    if (first.errors.length > 0 || second.errors.length > 0 || !first.source?.record || !second.source?.record) {
      throw new Error(`${goalId}: source extraction failed: ${[...first.errors, ...second.errors].join(' | ')}`)
    }
    if (first.source.record.decision !== 'keep' || second.source.record.decision !== 'keep') {
      throw new Error(`${goalId}: stable carryover requires KEEP/KEEP`)
    }
    const firstInput = firstInputById.get(goalId)
    const secondInput = secondInputById.get(goalId)
    const canonical = canonicalById.get(goalId)
    if (!firstInput || !secondInput || !canonical) throw new Error(`${goalId}: missing source input or canonical goal`)
    if (stableGoalBookJson(firstInput) !== stableGoalBookJson(secondInput)) throw new Error(`${goalId}: blind inputs differ`)
    if (stableGoalBookJson(firstInput.canonicalContext) !== stableGoalBookJson(buildGoalDescriptionCanonicalContext(canonical))) {
      throw new Error(`${goalId}: own canonical context drifted`)
    }
    const semanticDecision = ledger.decisions.find((decision) => decision.goalId === goalId)
    if (semanticDecision?.semanticKind !== 'curricularAtomic' || semanticDecision.decisionStatus !== 'authoritative') {
      throw new Error(`${goalId}: missing authoritative curricularAtomic classification`)
    }
    const directPrerequisites = firstInput.canonicalContext.requires.map((requiredId) => {
      const required = canonicalById.get(requiredId)
      if (!required) throw new Error(`${goalId}: missing direct prerequisite ${requiredId}`)
      return { goalId: requiredId, ...goalText(required) }
    })
    prerequisiteContext.set(goalId, directPrerequisites)
    expectedGoals.push({
      goalId,
      effectiveSemanticKind: 'curricularAtomic',
      goalFingerprint: firstInput.goalFingerprint as GoalDescriptionSynthesisDigest,
      pageFingerprint: firstInput.pageFingerprint as GoalDescriptionSynthesisDigest,
      goalReviewContextFingerprint: fingerprintGoalDescriptionReviewContext(firstInput),
      finalText: inputText(firstInput),
      firstSource: first.source,
      secondSource: second.source,
    })
    sources.set(goalId, { first: first.source, second: second.source })
  }

  const completedAtValues = [...dual.first.resultPairs, ...dual.second.resultPairs].map(({ run }) => Date.parse(run.completedAt))
  if (completedAtValues.length === 0 || completedAtValues.some((value) => !Number.isFinite(value))) {
    throw new Error('Physics B033t source runs must have valid completion timestamps')
  }
  const synthesizedAt = new Date(Math.max(...completedAtValues) + 1000).toISOString()
  const firstGoal = expectedGoals[0]
  if (!firstGoal) throw new Error('Physics B033t stable scope is empty')
  const expectedBindings = {
    batch: {
      batchId: dual.prepared.manifest.batchId,
      batchManifestDigest: sha256(batchManifestBytes),
      configDigest: sha256(configBytes),
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
    synthesizedAt,
    goals: expectedGoals,
  }
  const manifestId = 'physik-b033t-stable-current-carryover-7-v1-openai-codex-20260905'
  const payload: Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'> = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
    schemaVersion: 1,
    synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
    manifestId,
    authority: 'ai_synthesis',
    synthesizedBy: 'OpenAI Codex Physics B033t bounded stable-current-seven synthesis candidate',
    synthesizedAt,
    batch: expectedBindings.batch,
    rounds: expectedBindings.rounds,
    decisions: expectedGoals.map((goal, index) => {
      const source = sources.get(goal.goalId)
      const rationale = rationales.get(goal.goalId)
      if (!source || !rationale) throw new Error(`${goal.goalId}: incomplete source or rationale`)
      return {
        decisionId: `${manifestId}-decision-${String(index + 1).padStart(3, '0')}`,
        goalId: goal.goalId,
        effectiveSemanticKind: goal.effectiveSemanticKind,
        goalFingerprint: goal.goalFingerprint,
        pageFingerprint: goal.pageFingerprint,
        goalReviewContextFingerprint: goal.goalReviewContextFingerprint,
        finalText: goal.finalText,
        resolutionDecision: 'keep_current' as const,
        evidenceRound: 'first' as const,
        records: {
          first: { recordId: source.first.binding.recordId, recordDigest: source.first.binding.recordDigest },
          second: { recordId: source.second.binding.recordId, recordDigest: source.second.binding.recordDigest },
        },
        rationaleDe: rationale.de,
        rationaleEn: rationale.en,
      }
    }),
  }
  const synthesisManifest: GoalDescriptionRolloutSynthesisDecisionManifest = {
    ...payload,
    manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(payload),
  }
  const manifestValidation = await validateGoalDescriptionRolloutSynthesisDecisionManifest({
    manifest: synthesisManifest,
    expected: expectedBindings,
  })
  if (manifestValidation.errors.length > 0) throw new Error(`Synthesis invalid: ${manifestValidation.errors.join(' | ')}`)
  const synthesisBytes = jsonBytes(synthesisManifest)

  const resolutionArtifacts: Array<{ path: string; bytes: Buffer }> = []
  const indexEntries: Array<Record<string, unknown>> = []
  for (const goal of expectedGoals) {
    const source = sources.get(goal.goalId)
    const summaryGoal = dual.summary.goals.find(({ goalId }) => goalId === goal.goalId)
    const decision = synthesisManifest.decisions.find(({ goalId }) => goalId === goal.goalId)
    if (!source || !summaryGoal || !decision) throw new Error(`${goal.goalId}: incomplete resolution alignment`)
    const synthesis = buildGoalDescriptionRolloutResolutionSynthesis({
      batchId: synthesisManifest.batch.batchId,
      manifest: synthesisManifest,
      decision,
      summaryGoal,
      firstSource: source.first,
      secondSource: source.second,
    })
    const resolution = buildGoalDescriptionDualRoundResolution({
      resolutionId: `physics-b033t-stable-current-carryover-7-v1-resolution-${goal.goalId}`,
      goalId: goal.goalId,
      effectiveSemanticKind: 'curricularAtomic',
      decision: 'keep_current',
      synthesis,
      dualSummaryBytes: dual.bytes,
      currentInput: dual.first.input,
      firstSource: source.first,
      secondSource: source.second,
      synthesisDecisionManifest: {
        contract: synthesisManifest.synthesisContract,
        manifestPath: synthesisRelativePath,
        manifestId: synthesisManifest.manifestId,
        manifestDigest: sha256(synthesisBytes),
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
        manifestBytes: synthesisBytes,
        manifestPath: synthesisRelativePath,
      },
    })
    if (validation.errors.length > 0 || !validation.strictDescriptionComplete) {
      throw new Error(`${goal.goalId}: ${validation.errors.join(' | ') || 'resolution is not strict complete'}`)
    }
    const bytes = jsonBytes(resolution)
    const relativePath = `${resolutionDirectoryName}/${goal.goalId}.resolution.json`
    resolutionArtifacts.push({ path: join(batchDirectory, relativePath), bytes })
    indexEntries.push({
      goalId: goal.goalId,
      titleDe: resolution.goal.finalText.titleDe,
      groupId: dual.prepared.manifest.batchId,
      decision: resolution.decision,
      resolutionPath: relativePath,
      resolutionDigest: sha256(bytes),
      resolutionFingerprint: resolution.resolutionFingerprint,
      strictDescriptionComplete: true,
    })
  }

  const index = {
    schemaVersion: 1,
    artifactSetId: `${dual.prepared.manifest.batchId}-stable-current-carryover-7`,
    subject: dual.prepared.manifest.subjectLabel,
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: indexEntries.length,
    curriculumAtomicDenominator: 461,
    descriptionReviewPercentage: Number(((indexEntries.length / 461) * 100).toFixed(1)),
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
  const indexBytes = jsonBytes(index)
  const receipt = {
    schemaVersion: 1,
    receiptId: 'physik-b033t-stable-current-carryover-7-v1-20260905',
    purpose: 'Hash-bound partial integration of only the seven B033t KEEP/KEEP goals whose own bilingual text and direct prerequisite context remained current after applyPhysicsBatch033FinalFollowup.ts.',
    sourceBatchId: dual.prepared.manifest.batchId,
    sourceCampaignGoalCount: dual.summary.goalCount,
    sourceConfigDigest: sha256(configBytes),
    sourceBatchManifestDigest: sha256(batchManifestBytes),
    sourceDualSummaryDigest: sha256(dual.bytes),
    followupMaterializerPath: 'app/scripts/applyPhysicsBatch033FinalFollowup.ts',
    followupMaterializerDigest: sha256(followupBytes),
    currentCanonicalLandscapeDigest: sha256(landscapeBytes),
    semanticKindLedgerDigest: sha256(ledgerBytes),
    synthesisManifestPath: synthesisRelativePath,
    synthesisManifestDigest: sha256(synthesisBytes),
    synthesisManifestFingerprint: synthesisManifest.manifestFingerprint,
    resolutionIndexPath: `resolution-index.${outputStem}.json`,
    resolutionIndexDigest: sha256(indexBytes),
    campaignGoalIds: [...campaignGoalIds],
    stableGoalIds: [...stableGoalIds],
    ownTextChangedGoalIds: [...ownTextChangedGoalIds],
    contextStaleGoalIds: [...contextStaleGoalIds],
    excludedGoalIds,
    contextStalePrerequisiteGoalIds: Object.fromEntries(contextStaleGoalIds.map((goalId) => [
      goalId,
      contextStaleByGoal.get(goalId),
    ])),
    stableDirectPrerequisiteContexts: stableGoalIds.map((goalId) => ({
      goalId,
      contextDigest: sha256(Buffer.from(stableGoalBookJson(prerequisiteContext.get(goalId) ?? []))),
      prerequisites: prerequisiteContext.get(goalId),
    })),
    safeguards: {
      exactCampaignOrderAndDecisionPairsRequired: true,
      exactOwnTextChangedPartitionRequired: true,
      directPrerequisiteTextDriftFailsClosed: true,
      individualResolutionsFreshlyValidated: true,
      centralRegistrationPerformed: false,
      canonicalTextOrImageMutationPerformed: false,
    },
  }
  if (write) {
    execFileSync(process.execPath, ['scripts/check_openai_plugin_review_freeze.mjs'], {
      cwd: repositoryRoot,
      stdio: 'inherit',
    })
  }
  await writeAllOrRequireExact([
    { path: synthesisPath, bytes: synthesisBytes },
    ...resolutionArtifacts,
    { path: indexPath, bytes: indexBytes },
    { path: receiptPath, bytes: jsonBytes(receipt) },
  ])
  console.log(
    `${write ? 'Materialized' : 'Verified'} Physics B033t stable-current resolutions: strict=${indexEntries.length}/${stableGoalIds.length}; excluded=${excludedGoalIds.length}; index=${indexPath}`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
