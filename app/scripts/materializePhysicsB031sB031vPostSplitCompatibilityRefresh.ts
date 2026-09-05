import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { buildGoalDescriptionRolloutResolutionSynthesis } from './goalDescriptionRolloutResolutionSynthesis'
import {
  buildGoalDescriptionRolloutSubsetModel,
  materializeGoalDescriptionRolloutBatchDualSummary,
  type StandaloneBatchResolutionIndex,
} from './materializeGoalDescriptionRolloutBatch'
import { loadGoalBookBuildInputs, stableGoalBookJson } from './goalBookModel'
import {
  buildGoalDescriptionDualRoundResolution,
  extractGoalDescriptionDualRoundResolutionSource,
  fingerprintGoalDescriptionReviewContext,
  validateGoalDescriptionDualRoundResolution,
  type GoalDescriptionDualRoundResolution,
} from './validateGoalDescriptionDualRoundResolution'
import { buildGoalDescriptionCanonicalContext } from './validateGoalDescriptionReviewCampaign'
import {
  buildGoalDescriptionRolloutSynthesisRoundBinding,
  fingerprintGoalDescriptionRolloutSynthesisDecisionManifest,
  validateGoalDescriptionRolloutSynthesisDecisionManifest,
  validateGoalDescriptionRolloutSynthesisDecisionManifestStructure,
  type GoalDescriptionRolloutSynthesisDecisionManifest,
  type GoalDescriptionRolloutSynthesisExpectedGoal,
  type GoalDescriptionSynthesisDigest,
} from './validateGoalDescriptionRolloutSynthesisDecisionManifest'

type JsonGoal = Record<string, unknown>
type ReviewRound = 'first' | 'second'
type PlannedOutput = { path: string; bytes: Buffer }
type FileHash = {
  config: string
  batchManifest: string
  dualSummary: string
  roundARecords: string
  roundARun: string
  roundBRecords: string
  roundBRun: string
  synthesis: string
  resolutionIndex: string
}
type BatchSpec = {
  key: 'b031s' | 'b031v'
  batchDirectory: string
  outputStem: string
  manifestId: string
  receiptId: string
  roundAResultStem: string
  roundBResultStem: string
  goalIds: string[]
  sourceHashes: FileHash
}
type HistoricalIndex = StandaloneBatchResolutionIndex
type PageValue = { present: false } | { present: true; value: unknown }
type PageFieldTransition = {
  field: string
  source: PageValue
  current: PageValue
}
type Plan = {
  outputs: PlannedOutput[]
  report: Record<string, unknown>
}

const repoRoot = resolve(import.meta.dirname, '../..')
const baseGoalBookConfigPath = 'app/scripts/config/goal-books/de-gym-physics-national-atlas.json'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const semanticKindLedgerPath = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const indexSchemaPath = 'contracts/goal-description-review/v1/goal-description-standalone-batch-resolution-index.schema.json'
const curriculumAtomicDenominator = 462
const usage = 'Usage: tsx scripts/materializePhysicsB031sB031vPostSplitCompatibilityRefresh.ts (--write|--check)'

const batches: BatchSpec[] = [
  {
    key: 'b031s',
    batchDirectory: 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-02/batch-031s-q2-oscillation-wave-model-limits-final-recheck-4-v1',
    outputStem: 'stable-current-carryover-4-v3',
    manifestId: 'physik-b031s-stable-current-carryover-4-v3-post-wave-split-openai-codex-20260905',
    receiptId: 'physik-b031s-stable-current-carryover-4-v3-post-wave-split-20260905',
    roundAResultStem: 'physik-rollout-v1-batch-031s-q2-oscillation-wave-model-limits-final-recheck-4-v1-20260902-first-pass-a.batch-001',
    roundBResultStem: 'physik-rollout-v1-batch-031s-q2-oscillation-wave-model-limits-final-recheck-4-v1-20260902-first-pass-b.batch-001',
    goalIds: [
      'd03f1cb6-c224-53db-ad91-76cc7827978d',
      'e7131fe3-1da6-5555-80ec-fb6bdf8fcc29',
      '0d2a4690-d891-503b-96f4-42c2de48fd8b',
      '1c430e0a-b63e-5729-8715-a96a5a68740f',
    ],
    sourceHashes: {
      config: '4a276066f73e52f469cb4a8af1b12d15e3ce9adf896879bae03eaa1574a289f0',
      batchManifest: 'a20a6a73bd4531574f3f87a3e86acbf87e16051f441deaec6adbfc04a476a270',
      dualSummary: '5fdbd2c2330fb12102ec7567beea44ebe6a8ba6009b8b96773980401b3450430',
      roundARecords: '6f3b9d21ac8e80594a8cae4153cffb76783d141dd5883798a6ce0d52cf1bbc1c',
      roundARun: '157433dc2a264bd069ebc63661464d3992062bc600ec9e03dd5c3bd0a03e0515',
      roundBRecords: '604cf8fcacbb274827d3ab31b7bdf436687509bc513f3c96917b56aca7f21d3b',
      roundBRun: '0c815cd5e2bf0a3e60d00a981b863cc90f823239bc1d1a6ea172e3554268fca1',
      synthesis: '8151d81a572be77237bd64af1c2eda80d40785c09e62798d3e822a4504be9aa5',
      resolutionIndex: 'e9a22dcbd256a3c8bb38a9af71adf70187e3dcde427405a15e45291bdcef3dce',
    },
  },
  {
    key: 'b031v',
    batchDirectory: 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-04/batch-031v-q2-characteristic-oscillation-quantities-explicit-time-equation-final-recheck-1-v1',
    outputStem: 'stable-current-carryover-1-v3',
    manifestId: 'physik-b031v-stable-current-carryover-1-v3-post-wave-split-openai-codex-20260905',
    receiptId: 'physik-b031v-stable-current-carryover-1-v3-post-wave-split-20260905',
    roundAResultStem: 'physik-rollout-v1-batch-031v-q2-characteristic-oscillation-quantities-explicit-time-equation-final-recheck-1-v1-20260904-first-pass-a.batch-001',
    roundBResultStem: 'physik-rollout-v1-batch-031v-q2-characteristic-oscillation-quantities-explicit-time-equation-final-recheck-1-v1-20260904-first-pass-b.batch-001',
    goalIds: ['fcf8580c-ecfd-58ea-bbf5-a1b29c9ecf8e'],
    sourceHashes: {
      config: '55d491b19ac393f972d892bc21291d84fb93c11b48521dbef5b0409047666a1b',
      batchManifest: '2a6074caa5112e12d8b9cfe3062cd54df6498928d2c1a153f5557e34e7dfbc71',
      dualSummary: '6bc272b047b77031d2637b94b23c0cc7dc52c974d2db2db59579f902cff5f020',
      roundARecords: '5eba324c8db654dd5411ed4b2f495bfa35c51544770fc68cdc779e4cb045b3a7',
      roundARun: '69fee9c6c0bb7932fa28a80f1d87a291048f80330cf66e7efbe3153d8c21cf88',
      roundBRecords: '7fddf9c65d821067187361ca09d16d2802349fb3eb8f8403aea018a421cecd48',
      roundBRun: '85ac469c28e88dfc08f2376d7069f71b9266c56870ba5c38b4508ed1aab14712',
      synthesis: '63754a41794ce1c876c9706d95a8fd021b9391d539101e3c696b6c762fdb88d7',
      resolutionIndex: '3bb2d3f9d676dd299cc9a38c1796eeb874633ebfc5342253e327fa0efe6387c5',
    },
  },
]

const absolute = (path: string): string => resolve(repoRoot, path)
const sha256Hex = (bytes: string | Uint8Array): string => createHash('sha256').update(bytes).digest('hex')
const digest = (bytes: string | Uint8Array): GoalDescriptionSynthesisDigest => (
  ('sha256:' + sha256Hex(bytes)) as GoalDescriptionSynthesisDigest
)
const jsonBytes = (value: unknown): Buffer => Buffer.from(JSON.stringify(value, null, 2) + '\n')
const parseJson = <T>(bytes: Buffer, label: string): T => {
  try {
    return JSON.parse(bytes.toString('utf8')) as T
  } catch (error) {
    throw new Error(label + ': invalid JSON: ' + (error instanceof Error ? error.message : String(error)))
  }
}
const readBound = (path: string, expected: string): Buffer => {
  if (!/^[a-f0-9]{64}$/u.test(expected)) throw new Error(path + ': invalid SHA-256 pin')
  const bytes = readFileSync(absolute(path))
  const actual = sha256Hex(bytes)
  if (actual !== expected) throw new Error(path + ': bound digest drift ' + actual + ' != ' + expected)
  return bytes
}
const assertOutput = (path: string, bytes: Buffer): void => {
  if (!existsSync(absolute(path))) throw new Error('Missing generated output: ' + path)
  if (!readFileSync(absolute(path)).equals(bytes)) throw new Error('Generated output drift: ' + path)
}
const publish = (path: string, bytes: Buffer): void => {
  mkdirSync(dirname(absolute(path)), { recursive: true })
  if (existsSync(absolute(path))) assertOutput(path, bytes)
  else writeFileSync(absolute(path), bytes, { flag: 'wx' })
}
const exactArray = (actual: readonly string[], expected: readonly string[], label: string): void => {
  if (stableGoalBookJson(actual) !== stableGoalBookJson(expected)) {
    throw new Error(label + ': ordered goal scope drifted')
  }
}
const pageValue = (page: Record<string, unknown>, field: string): PageValue => (
  Object.hasOwn(page, field) ? { present: true, value: page[field] } : { present: false }
)
const pageTransitions = (
  sourcePage: Record<string, unknown>,
  currentPage: Record<string, unknown>,
): PageFieldTransition[] => [...new Set([...Object.keys(sourcePage), ...Object.keys(currentPage)])]
  .filter((field) => field !== 'pageFingerprint')
  .sort()
  .filter((field) => stableGoalBookJson(pageValue(sourcePage, field)) !== stableGoalBookJson(pageValue(currentPage, field)))
  .map((field) => ({ field, source: pageValue(sourcePage, field), current: pageValue(currentPage, field) }))

const parseMode = (): 'help' | 'write' | 'check' => {
  const args = process.argv.slice(2)
  if (args.length === 1 && (args[0] === '--help' || args[0] === '-h')) return 'help'
  if (args.length === 1 && args[0] === '--write') return 'write'
  if (args.length === 1 && args[0] === '--check') return 'check'
  throw new Error(usage)
}

const buildPlan = async (): Promise<Plan> => {
  const baseConfigBytes = readFileSync(absolute(baseGoalBookConfigPath))
  const canonicalBytes = readFileSync(absolute(canonicalPath))
  const semanticKindLedgerBytes = readFileSync(absolute(semanticKindLedgerPath))
  const baseConfig = parseJson<{
    compositionViewManifestPath?: string
    goalVisualizationQaPath?: string
  }>(baseConfigBytes, baseGoalBookConfigPath)
  const atlasManifestPath = baseConfig.compositionViewManifestPath
  const visualizationQaPath = baseConfig.goalVisualizationQaPath
  if (!atlasManifestPath || !visualizationQaPath) {
    throw new Error('Physics Atlas configuration lacks required manifest or visualization QA path')
  }
  const atlasManifestBytes = readFileSync(absolute(atlasManifestPath))
  const atlasManifest = parseJson<{
    expectedCurricularAtomicGoalCount?: number
    navigationViewPath?: string
    durationModelPolicyPath?: string
    sourcePaths?: string[]
  }>(atlasManifestBytes, atlasManifestPath)
  if (
    atlasManifest.expectedCurricularAtomicGoalCount !== curriculumAtomicDenominator
    || !atlasManifest.navigationViewPath
    || !atlasManifest.durationModelPolicyPath
    || !Array.isArray(atlasManifest.sourcePaths)
  ) {
    throw new Error('Physics Atlas source manifest is incomplete or not pinned to 462 curricularAtomic goals')
  }
  const atlasControlPaths = [
    baseGoalBookConfigPath,
    atlasManifestPath,
    atlasManifest.navigationViewPath,
    atlasManifest.durationModelPolicyPath,
    visualizationQaPath,
  ]
  const atlasControlBindings = atlasControlPaths.map((path) => ({
    path,
    sha256: digest(readFileSync(absolute(path))),
  }))
  const landscape = parseJson<{ subject?: string; goals?: JsonGoal[] }>(canonicalBytes, canonicalPath)
  const semanticKindLedger = parseJson<{
    counts?: { curricularAtomic?: number }
    decisions?: Array<{ goalId?: string; semanticKind?: string; decisionStatus?: string }>
  }>(semanticKindLedgerBytes, semanticKindLedgerPath)
  if (landscape.subject !== 'Physik' || !Array.isArray(landscape.goals)) {
    throw new Error('Current canonical Physics landscape is invalid')
  }
  if (semanticKindLedger.counts?.curricularAtomic !== curriculumAtomicDenominator) {
    throw new Error('Current Physics curricularAtomic denominator drifted')
  }
  const currentBase = await loadGoalBookBuildInputs(baseGoalBookConfigPath)
  if (
    currentBase.config.landscapePath !== canonicalPath
    || currentBase.config.semanticKindLedgerPath !== semanticKindLedgerPath
    || currentBase.config.compositionViewManifestPath !== atlasManifestPath
  ) {
    throw new Error('Current Physics Atlas configuration points to unexpected canonical inputs')
  }

  const ajv = new Ajv2020({ allErrors: true, strict: true })
  addFormats(ajv)
  const validateIndex = ajv.compile(parseJson(readFileSync(absolute(indexSchemaPath)), indexSchemaPath))
  const allOutputs: PlannedOutput[] = []
  const batchReports: Array<Record<string, unknown>> = []

  for (const spec of batches) {
    const sourceConfigPath = spec.batchDirectory + '.config.json'
    const batchManifestPath = spec.batchDirectory + '/batch-manifest.json'
    const dualSummaryPath = spec.batchDirectory + '/dual-summary.json'
    const roundARecordsPath = spec.batchDirectory + '/round-a/results/' + spec.roundAResultStem + '.records.jsonl'
    const roundARunPath = spec.batchDirectory + '/round-a/results/' + spec.roundAResultStem + '.run.json'
    const roundBRecordsPath = spec.batchDirectory + '/round-b/results/' + spec.roundBResultStem + '.records.jsonl'
    const roundBRunPath = spec.batchDirectory + '/round-b/results/' + spec.roundBResultStem + '.run.json'
    const historicalSynthesisPath = spec.batchDirectory + '/synthesis-decisions.json'
    const historicalIndexPath = spec.batchDirectory + '/resolution-index.json'
    const synthesisRelativePath = 'synthesis-decisions.' + spec.outputStem + '.json'
    const synthesisPath = spec.batchDirectory + '/' + synthesisRelativePath
    const resolutionDirectory = 'resolutions-' + spec.outputStem
    const indexRelativePath = 'resolution-index.' + spec.outputStem + '.json'
    const indexPath = spec.batchDirectory + '/' + indexRelativePath
    const receiptRelativePath = spec.outputStem + '.compatibility-receipt.json'
    const receiptPath = spec.batchDirectory + '/' + receiptRelativePath

    const configBytes = readBound(sourceConfigPath, spec.sourceHashes.config)
    const batchManifestBytes = readBound(batchManifestPath, spec.sourceHashes.batchManifest)
    const dualSummaryBytes = readBound(dualSummaryPath, spec.sourceHashes.dualSummary)
    const roundARecordsBytes = readBound(roundARecordsPath, spec.sourceHashes.roundARecords)
    const roundARunBytes = readBound(roundARunPath, spec.sourceHashes.roundARun)
    const roundBRecordsBytes = readBound(roundBRecordsPath, spec.sourceHashes.roundBRecords)
    const roundBRunBytes = readBound(roundBRunPath, spec.sourceHashes.roundBRun)
    const historicalSynthesisBytes = readBound(historicalSynthesisPath, spec.sourceHashes.synthesis)
    const historicalIndexBytes = readBound(historicalIndexPath, spec.sourceHashes.resolutionIndex)
    const sourceConfig = parseJson<{
      baseGoalBookConfigPath?: string
      bookId: string
      title: string
      goalIds: string[]
    }>(configBytes, sourceConfigPath)
    if (sourceConfig.baseGoalBookConfigPath !== baseGoalBookConfigPath) {
      throw new Error(spec.key + ': source GoalBook configuration drifted')
    }
    exactArray(sourceConfig.goalIds, spec.goalIds, spec.key + ' source config')
    for (const goalId of spec.goalIds) {
      const kind = semanticKindLedger.decisions?.find((decision) => decision.goalId === goalId)
      if (kind?.semanticKind !== 'curricularAtomic' || kind.decisionStatus !== 'authoritative') {
        throw new Error(goalId + ': missing current authoritative curricularAtomic classification')
      }
    }

    const dual = await materializeGoalDescriptionRolloutBatchDualSummary(absolute(sourceConfigPath), false)
    if (!dual.bytes.equals(dualSummaryBytes)) throw new Error(spec.key + ': materialized dual summary drifted')
    exactArray(dual.summary.goals.map(({ goalId }) => goalId), spec.goalIds, spec.key + ' dual summary')
    const currentSubset = buildGoalDescriptionRolloutSubsetModel({
      baseModel: currentBase.model,
      goalIds: spec.goalIds,
      bookId: sourceConfig.bookId,
      title: sourceConfig.title,
    })

    const historicalSynthesis = parseJson<GoalDescriptionRolloutSynthesisDecisionManifest>(
      historicalSynthesisBytes,
      historicalSynthesisPath,
    )
    const historicalSynthesisValidation = await validateGoalDescriptionRolloutSynthesisDecisionManifestStructure(
      historicalSynthesis,
    )
    if (historicalSynthesisValidation.errors.length > 0 || !historicalSynthesisValidation.schemaValid) {
      throw new Error(spec.key + ': historical synthesis invalid: ' + historicalSynthesisValidation.errors.join(' | '))
    }
    exactArray(
      historicalSynthesis.decisions.map(({ goalId }) => goalId),
      spec.goalIds,
      spec.key + ' historical synthesis',
    )
    if (historicalSynthesis.decisions.some(({ resolutionDecision }) => resolutionDecision !== 'current_after_revision')) {
      throw new Error(spec.key + ': historical decision semantics are not uniformly current_after_revision')
    }

    const historicalIndex = parseJson<HistoricalIndex>(historicalIndexBytes, historicalIndexPath)
    if (!validateIndex(historicalIndex)) {
      throw new Error(spec.key + ': historical index invalid: ' + ajv.errorsText(validateIndex.errors, { separator: '; ' }))
    }
    exactArray(historicalIndex.batchGoalIds, spec.goalIds, spec.key + ' historical index')
    exactArray(historicalIndex.resolutions.map(({ goalId }) => goalId), spec.goalIds, spec.key + ' historical resolutions')
    if (
      historicalIndex.groups.length !== 1
      || historicalIndex.groups[0]?.resolvedGoalCount !== spec.goalIds.length
      || historicalIndex.resolutions.some(({ strictDescriptionComplete }) => !strictDescriptionComplete)
    ) {
      throw new Error(spec.key + ': historical index is not strictly complete')
    }

    const expectedGoals: GoalDescriptionRolloutSynthesisExpectedGoal[] = []
    const sources = new Map<string, {
      first: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
      second: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
    }>()
    const currentBindings: Array<Record<string, unknown>> = []
    const historicalResolutionBindings: Array<Record<string, unknown>> = []

    for (const goalId of spec.goalIds) {
      const firstResult = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.first, goalId, label: 'First' })
      const secondResult = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.second, goalId, label: 'Second' })
      if (
        firstResult.errors.length > 0
        || secondResult.errors.length > 0
        || !firstResult.source?.record
        || !secondResult.source?.record
      ) {
        throw new Error(goalId + ': source extraction failed: ' + [...firstResult.errors, ...secondResult.errors].join(' | '))
      }
      if (firstResult.source.decision !== 'keep' || secondResult.source.decision !== 'keep') {
        throw new Error(goalId + ': compatibility refresh requires two independent KEEP records')
      }
      const priorDecision = historicalSynthesis.decisions.find((decision) => decision.goalId === goalId)
      const firstInput = dual.first.input.goals.find((goal) => goal.goalId === goalId)
      const secondInput = dual.second.input.goals.find((goal) => goal.goalId === goalId)
      const sourcePage = dual.prepared.model.pages.find((page) => page.goalId === goalId)
      const currentPage = currentSubset.pages.find((page) => page.goalId === goalId)
      const canonicalMatches = landscape.goals.filter(({ id }) => id === goalId)
      if (!priorDecision || !firstInput || !secondInput || !sourcePage || !currentPage || canonicalMatches.length !== 1) {
        throw new Error(goalId + ': missing unique prior, review, page, or canonical input')
      }
      const canonicalGoal = canonicalMatches[0]
      const currentCanonicalContext = buildGoalDescriptionCanonicalContext(canonicalGoal)
      const sourceContextFingerprint = fingerprintGoalDescriptionReviewContext(firstInput)
      if (
        stableGoalBookJson(firstInput) !== stableGoalBookJson(secondInput)
        || stableGoalBookJson(firstInput.reviewContext.page) !== stableGoalBookJson(sourcePage)
        || stableGoalBookJson(firstInput.canonicalContext) !== stableGoalBookJson(currentCanonicalContext)
        || firstResult.source.binding.goalReviewContextFingerprint !== sourceContextFingerprint
        || secondResult.source.binding.goalReviewContextFingerprint !== sourceContextFingerprint
      ) {
        throw new Error(goalId + ': blind inputs or direct canonical context differ')
      }
      const reviewedText = {
        titleDe: firstInput.currentTitleDe,
        titleEn: firstInput.currentTitleEn,
        descriptionDe: firstInput.currentDescriptionDe,
        descriptionEn: firstInput.currentDescriptionEn,
      }
      const currentText = {
        titleDe: String(canonicalGoal.title ?? ''),
        titleEn: String(canonicalGoal.titleEn ?? ''),
        descriptionDe: String(canonicalGoal.description ?? ''),
        descriptionEn: String(canonicalGoal.descriptionEn ?? ''),
      }
      if (
        stableGoalBookJson(reviewedText) !== stableGoalBookJson(currentText)
        || currentPage.title !== currentText.titleDe
        || currentPage.description !== currentText.descriptionDe
        || currentPage.goalFingerprint !== firstInput.goalFingerprint
        || stableGoalBookJson(priorDecision.finalText) !== stableGoalBookJson(reviewedText)
        || priorDecision.goalFingerprint !== firstInput.goalFingerprint
        || priorDecision.pageFingerprint !== firstInput.pageFingerprint
        || priorDecision.goalReviewContextFingerprint !== sourceContextFingerprint
      ) {
        throw new Error(goalId + ': reviewed bilingual text, goal fingerprint, or historical binding is not exact-current')
      }
      if (
        goalId === 'fcf8580c-ecfd-58ea-bbf5-a1b29c9ecf8e'
        && (
          !currentText.descriptionDe.includes('Gleichung für die Auslenkung in Abhängigkeit von der Zeit')
          || !currentText.descriptionEn.includes('equation for displacement as a function of time')
        )
      ) {
        throw new Error(goalId + ': final wording no longer unambiguously denotes a displacement-time equation')
      }

      const historicalEntry = historicalIndex.resolutions.find((entry) => entry.goalId === goalId)
      if (!historicalEntry || historicalEntry.decision !== priorDecision.resolutionDecision) {
        throw new Error(goalId + ': historical resolution index disagrees with its synthesis')
      }
      const expectedHistoricalPath = 'resolutions/' + goalId + '.resolution.json'
      if (historicalEntry.resolutionPath !== expectedHistoricalPath) {
        throw new Error(goalId + ': historical resolution path drifted')
      }
      const historicalResolutionPath = spec.batchDirectory + '/' + historicalEntry.resolutionPath
      const historicalResolutionBytes = readFileSync(absolute(historicalResolutionPath))
      if (digest(historicalResolutionBytes) !== historicalEntry.resolutionDigest) {
        throw new Error(goalId + ': historical resolution byte digest drifted')
      }
      const historicalResolution = parseJson<GoalDescriptionDualRoundResolution>(
        historicalResolutionBytes,
        historicalResolutionPath,
      )
      if (historicalResolution.resolutionFingerprint !== historicalEntry.resolutionFingerprint) {
        throw new Error(goalId + ': historical resolution fingerprint drifted')
      }
      const historicalResolutionValidation = await validateGoalDescriptionDualRoundResolution({
        resolution: historicalResolution,
        dualSummary: dual.summary,
        dualSummaryBytes: dual.bytes,
        currentInput: dual.first.input,
        landscape,
        first: dual.first,
        second: dual.second,
        synthesisDecisionManifestArtifact: {
          manifest: historicalSynthesis,
          manifestBytes: historicalSynthesisBytes,
          manifestPath: 'synthesis-decisions.json',
        },
      })
      if (historicalResolutionValidation.errors.length > 0 || !historicalResolutionValidation.strictDescriptionComplete) {
        throw new Error(goalId + ': historical resolution no longer validates: ' + historicalResolutionValidation.errors.join(' | '))
      }

      expectedGoals.push({
        goalId,
        effectiveSemanticKind: 'curricularAtomic',
        goalFingerprint: firstInput.goalFingerprint as GoalDescriptionSynthesisDigest,
        pageFingerprint: firstInput.pageFingerprint as GoalDescriptionSynthesisDigest,
        goalReviewContextFingerprint: sourceContextFingerprint,
        finalText: reviewedText,
        firstSource: firstResult.source,
        secondSource: secondResult.source,
      })
      sources.set(goalId, { first: firstResult.source, second: secondResult.source })
      const changedFields = pageTransitions(
        sourcePage as unknown as Record<string, unknown>,
        currentPage as unknown as Record<string, unknown>,
      )
      const pageTransition = {
        sourcePageFingerprint: firstInput.pageFingerprint,
        currentPageFingerprint: currentPage.pageFingerprint,
        exactPageFingerprint: firstInput.pageFingerprint === currentPage.pageFingerprint,
        changedFields,
      }
      currentBindings.push({
        goalId,
        reviewedText,
        currentCanonicalContext,
        currentCanonicalContextFingerprint: digest(stableGoalBookJson(currentCanonicalContext)),
        sourceGoalFingerprint: firstInput.goalFingerprint,
        currentGoalFingerprint: currentPage.goalFingerprint,
        exactGoalFingerprint: firstInput.goalFingerprint === currentPage.goalFingerprint,
        sourceGoalReviewContextFingerprint: sourceContextFingerprint,
        pageTransition: {
          ...pageTransition,
          transitionDigest: digest(stableGoalBookJson(pageTransition)),
        },
        preservedHistoricalDecision: priorDecision.resolutionDecision,
        preservedEvidenceRound: priorDecision.evidenceRound,
      })
      historicalResolutionBindings.push({
        goalId,
        path: historicalResolutionPath,
        sha256: historicalEntry.resolutionDigest,
        resolutionFingerprint: historicalEntry.resolutionFingerprint,
        strictDescriptionComplete: true,
      })
    }

    const firstGoal = expectedGoals[0]
    if (!firstGoal) throw new Error(spec.key + ': empty compatibility scope')
    const expectedBindings = {
      batch: {
        batchId: dual.prepared.manifest.batchId,
        batchManifestDigest: digest(batchManifestBytes),
        configDigest: digest(configBytes),
        bundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint,
        bookDigest: dual.first.input.bookDigest as GoalDescriptionSynthesisDigest,
        reviewInputFingerprint: dual.first.input.reviewInputFingerprint as GoalDescriptionSynthesisDigest,
        dualSummaryDigest: digest(dual.bytes),
        canonicalLandscapeDigest: digest(canonicalBytes),
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
      synthesizedAt: historicalSynthesis.synthesizedAt,
      goals: expectedGoals,
    }
    const manifestPayload: Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'> = {
      $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
      schemaVersion: 1,
      synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
      manifestId: spec.manifestId,
      authority: 'ai_synthesis',
      synthesizedBy: 'OpenAI Codex Physics ' + spec.key.toUpperCase() + ' post-wave-split compatibility synthesis candidate',
      synthesizedAt: historicalSynthesis.synthesizedAt,
      batch: expectedBindings.batch,
      rounds: expectedBindings.rounds,
      decisions: expectedGoals.map((goal, index) => {
        const prior = historicalSynthesis.decisions.find((decision) => decision.goalId === goal.goalId)
        const source = sources.get(goal.goalId)
        if (!prior || !source) throw new Error(goal.goalId + ': missing preserved synthesis source')
        return {
          decisionId: spec.manifestId + '-decision-' + String(index + 1).padStart(3, '0'),
          goalId: goal.goalId,
          effectiveSemanticKind: goal.effectiveSemanticKind,
          goalFingerprint: goal.goalFingerprint,
          pageFingerprint: goal.pageFingerprint,
          goalReviewContextFingerprint: goal.goalReviewContextFingerprint,
          finalText: goal.finalText,
          resolutionDecision: prior.resolutionDecision,
          evidenceRound: prior.evidenceRound as ReviewRound,
          records: {
            first: { recordId: source.first.binding.recordId, recordDigest: source.first.binding.recordDigest },
            second: { recordId: source.second.binding.recordId, recordDigest: source.second.binding.recordDigest },
          },
          rationaleDe: prior.rationaleDe,
          rationaleEn: prior.rationaleEn,
        }
      }),
    }
    const synthesisManifest: GoalDescriptionRolloutSynthesisDecisionManifest = {
      ...manifestPayload,
      manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(manifestPayload),
    }
    const synthesisValidation = await validateGoalDescriptionRolloutSynthesisDecisionManifest({
      manifest: synthesisManifest,
      expected: expectedBindings,
    })
    if (synthesisValidation.errors.length > 0) {
      throw new Error(spec.key + ': refreshed synthesis invalid: ' + synthesisValidation.errors.join(' | '))
    }
    const synthesisBytes = jsonBytes(synthesisManifest)

    const resolutionOutputs: PlannedOutput[] = []
    const indexEntries: StandaloneBatchResolutionIndex['resolutions'] = []
    for (const goal of expectedGoals) {
      const source = sources.get(goal.goalId)
      const summaryGoal = dual.summary.goals.find(({ goalId }) => goalId === goal.goalId)
      const decision = synthesisManifest.decisions.find(({ goalId }) => goalId === goal.goalId)
      if (!source || !summaryGoal || !decision) throw new Error(goal.goalId + ': incomplete refreshed resolution input')
      const synthesis = buildGoalDescriptionRolloutResolutionSynthesis({
        batchId: synthesisManifest.batch.batchId,
        manifest: synthesisManifest,
        decision,
        summaryGoal,
        firstSource: source.first,
        secondSource: source.second,
      })
      const resolution = buildGoalDescriptionDualRoundResolution({
        resolutionId: 'physik-' + spec.key + '-' + spec.outputStem
          + '-post-wave-split-compatibility-resolution-' + goal.goalId,
        goalId: goal.goalId,
        effectiveSemanticKind: 'curricularAtomic',
        decision: decision.resolutionDecision,
        synthesis,
        dualSummaryBytes: dual.bytes,
        currentInput: dual.first.input,
        firstSource: source.first,
        secondSource: source.second,
        synthesisDecisionManifest: {
          contract: synthesisManifest.synthesisContract,
          manifestPath: synthesisRelativePath,
          manifestId: synthesisManifest.manifestId,
          manifestDigest: digest(synthesisBytes),
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
        throw new Error(goal.goalId + ': refreshed resolution invalid: ' + validation.errors.join(' | '))
      }
      const bytes = jsonBytes(resolution)
      const relativePath = resolutionDirectory + '/' + goal.goalId + '.resolution.json'
      resolutionOutputs.push({ path: spec.batchDirectory + '/' + relativePath, bytes })
      indexEntries.push({
        goalId: goal.goalId,
        titleDe: resolution.goal.finalText.titleDe,
        groupId: dual.prepared.manifest.batchId,
        decision: resolution.decision,
        resolutionPath: relativePath,
        resolutionDigest: digest(bytes),
        resolutionFingerprint: resolution.resolutionFingerprint,
        strictDescriptionComplete: true,
      })
    }

    const index: StandaloneBatchResolutionIndex = {
      $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-standalone-batch-resolution-index.schema.json',
      schemaVersion: 2,
      indexContract: 'goal-description-standalone-batch-resolution-index-v1',
      artifactSetId: dual.prepared.manifest.batchId + '-' + spec.outputStem + '-post-wave-split',
      subject: dual.prepared.manifest.subjectLabel,
      semanticKind: 'curricularAtomic',
      batchGoalIds: [...spec.goalIds],
      groups: [{
        groupId: dual.prepared.manifest.batchId,
        artifactDirectory: '.',
        dualSummaryPath: 'dual-summary.json',
        dualSummaryDigest: digest(dual.bytes),
        campaignGoalCount: dual.summary.goalCount,
        resolvedGoalCount: indexEntries.length,
      }],
      resolutions: indexEntries,
    }
    if (!validateIndex(index)) {
      throw new Error(spec.key + ': refreshed index invalid: ' + ajv.errorsText(validateIndex.errors, { separator: '; ' }))
    }
    const indexBytes = jsonBytes(index)
    const outputsWithoutReceipt = [
      { path: synthesisPath, bytes: synthesisBytes },
      ...resolutionOutputs,
      { path: indexPath, bytes: indexBytes },
    ]
    const receiptBody = {
      schemaVersion: 1,
      receiptId: spec.receiptId,
      purpose: 'Fail-closed compatibility refresh for exactly ' + spec.goalIds.length
        + ' unchanged direct goal contexts after the B031 harmonic-wave split; no historical review or adjudication is replaced.',
      source: {
        configPath: sourceConfigPath,
        configSha256: digest(configBytes),
        batchManifestPath,
        batchManifestSha256: digest(batchManifestBytes),
        dualSummaryPath,
        dualSummarySha256: digest(dualSummaryBytes),
        roundA: {
          recordsPath: roundARecordsPath,
          recordsSha256: digest(roundARecordsBytes),
          runPath: roundARunPath,
          runSha256: digest(roundARunBytes),
        },
        roundB: {
          recordsPath: roundBRecordsPath,
          recordsSha256: digest(roundBRecordsBytes),
          runPath: roundBRunPath,
          runSha256: digest(roundBRunBytes),
        },
        historicalSynthesisPath,
        historicalSynthesisSha256: digest(historicalSynthesisBytes),
        historicalResolutionIndexPath: historicalIndexPath,
        historicalResolutionIndexSha256: digest(historicalIndexBytes),
        historicalResolutions: historicalResolutionBindings,
      },
      currentRuntimeSnapshot: {
        canonicalLandscapePath: canonicalPath,
        canonicalLandscapeSha256: digest(canonicalBytes),
        semanticKindLedgerPath,
        semanticKindLedgerSha256: digest(semanticKindLedgerBytes),
        atlasControlBindings,
        atlasCompositionViewSourceCount: atlasManifest.sourcePaths.length,
        currentAtlasBookDigest: currentBase.model.digest,
        currentSubsetBookDigest: currentSubset.digest,
        curricularAtomicDenominator: curriculumAtomicDenominator,
        capturedAtMaterializationExecution: true,
      },
      compatibilityRefresh: {
        status: 'accepted_exact_current_direct_context_with_traced_page_transition',
        reason: 'Historical review page fingerprints stay byte-bound to both blind runs. The current Atlas page fingerprint advances only with an explicit field-by-field transition while bilingual text, goal fingerprint, and direct canonical context remain exact.',
        sourceBaseBookDigest: dual.prepared.manifest.source.baseBookDigest,
        sourceSubsetBookDigest: dual.prepared.model.digest,
        currentBindings,
      },
      claimedGoalIds: spec.goalIds,
      synthesisManifestPath: synthesisRelativePath,
      synthesisManifestDigest: digest(synthesisBytes),
      synthesisManifestFingerprint: synthesisManifest.manifestFingerprint,
      resolutionIndexPath: indexRelativePath,
      resolutionIndexDigest: digest(indexBytes),
      safeguards: {
        historicalConfigManifestDualSummaryRunsRecordsSynthesisIndexAndResolutionsHashBound: true,
        twoIndependentKeepDecisionsRequired: true,
        historicalResolutionDecisionEvidenceRoundAndRationalePreserved: true,
        currentBilingualTextRequiredExact: true,
        currentGoalFingerprintRequiredExact: true,
        currentDirectCanonicalContextRequiredExact: true,
        currentAtlasPageTransitionCapturedFieldByField: true,
        currentAtlasModelAndControlFilesHashBound: true,
        separateBatchResolutionIndex: true,
        currentRuntimeReplannedAfterFreezeCheckBeforeWrite: true,
        openAiReviewFreezeRequiredBeforeWrite: true,
      },
    } as const
    const materializationPlanSha256 = digest(jsonBytes({
      spec,
      outputs: outputsWithoutReceipt.map(({ path, bytes }) => ({ path, sha256: digest(bytes) })),
      receiptPath,
      receiptBody,
    }))
    const receiptBytes = jsonBytes({ ...receiptBody, materializationPlanSha256 })
    const outputs = [...outputsWithoutReceipt, { path: receiptPath, bytes: receiptBytes }]
    allOutputs.push(...outputs)
    batchReports.push({
      batch: spec.key,
      goalCount: spec.goalIds.length,
      decision: 'current_after_revision_preserved',
      evidenceRounds: historicalSynthesis.decisions.map(({ goalId, evidenceRound }) => ({ goalId, evidenceRound })),
      resolutionIndexPath: indexPath,
      resolutionIndexSha256: digest(indexBytes),
      receiptPath,
      outputCount: outputs.length,
    })
  }

  if (new Set(allOutputs.map(({ path }) => path)).size !== allOutputs.length) {
    throw new Error('Cross-batch compatibility plan contains duplicate output paths')
  }
  if (batchReports.length !== 2 || allOutputs.length !== 11) {
    throw new Error('Compatibility plan must produce exactly two indexes and eleven artifacts')
  }
  return {
    outputs: allOutputs,
    report: {
      currentAtlasBookDigest: currentBase.model.digest,
      currentCanonicalLandscapeSha256: digest(canonicalBytes),
      currentSemanticKindLedgerSha256: digest(semanticKindLedgerBytes),
      batches: batchReports,
    },
  }
}

const main = async (): Promise<void> => {
  const mode = parseMode()
  if (mode === 'help') {
    console.log(usage)
    return
  }
  let plan = await buildPlan()
  if (mode === 'write') {
    execFileSync(process.execPath, ['scripts/check_openai_plugin_review_freeze.mjs'], {
      cwd: repoRoot,
      stdio: 'inherit',
    })
    const refreshed = await buildPlan()
    if (
      stableGoalBookJson(plan.report) !== stableGoalBookJson(refreshed.report)
      || plan.outputs.length !== refreshed.outputs.length
      || plan.outputs.some((output, index) => (
        output.path !== refreshed.outputs[index]?.path
        || !output.bytes.equals(refreshed.outputs[index]?.bytes ?? Buffer.alloc(0))
      ))
    ) {
      throw new Error('Compatibility inputs or materialization plan drifted across the pre-write freeze check')
    }
    plan = refreshed
    for (const output of plan.outputs) publish(output.path, output.bytes)
  } else {
    for (const output of plan.outputs) assertOutput(output.path, output.bytes)
  }
  console.log(JSON.stringify({ mode: mode.toUpperCase(), ...plan.report }, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
