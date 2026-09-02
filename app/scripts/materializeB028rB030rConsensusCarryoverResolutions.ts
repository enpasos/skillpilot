import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { buildGoalDescriptionRolloutResolutionSynthesis } from './goalDescriptionRolloutResolutionSynthesis'
import {
  buildGoalDescriptionRolloutSubsetModel,
  materializeGoalDescriptionRolloutBatchDualSummary,
} from './materializeGoalDescriptionRolloutBatch'
import { loadGoalBookBuildInputs, stableGoalBookJson } from './goalBookModel'
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
type ReviewRound = 'first' | 'second'
type StableGoalSpec = {
  goalId: string
  evidenceRound: ReviewRound
  rationale: { de: string; en: string }
}
type SourceHashes = {
  config: string
  batchManifest: string
  dualSummary: string
  roundARecords: string
  roundARun: string
  roundBRecords: string
  roundBRun: string
}
type CurrentPins = {
  canonical: string
  semanticKindLedger: string
}
type CarryoverPlan = {
  key: 'mathematik' | 'physik'
  idPrefix: string
  outputStem: string
  manifestId: string
  synthesizedBy: string
  receiptId: string
  purpose: string
  rolloutRoot: string
  batchName: string
  baseGoalBookConfigPath: string
  canonicalPath: string
  semanticKindLedgerPath: string
  curriculumAtomicDenominator: number
  roundAResultStem: string
  roundBResultStem: string
  stableGoals: StableGoalSpec[]
  excludedFreshGoalIds: string[]
  sourceHashes: SourceHashes
  currentPins: CurrentPins
}

const repoRoot = resolve(import.meta.dirname, '../..')

const plans: Record<CarryoverPlan['key'], CarryoverPlan> = {
  mathematik: {
    key: 'mathematik',
    idPrefix: 'mathematik-b028r-stable2',
    outputStem: 'stable-current-carryover-2-v1',
    manifestId: 'mathematik-b028r-stable2-synthesis-openai-codex-20260902',
    synthesizedBy: 'OpenAI Codex Mathematics B028r consensus-stable two carryover synthesis candidate',
    receiptId: 'mathematik-b028r-stable-current-carryover-2-v1-20260902',
    purpose: 'Hash-bound carryover of exactly the two current B028r recheck goals confirmed KEEP by both blind rounds; the remaining source-batch goal stays excluded pending further review.',
    rolloutRoot: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-02',
    batchName: 'batch-028r-j8-systems-fractional-equations-revised-recheck-3-v1',
    baseGoalBookConfigPath: 'app/scripts/config/goal-books/de-gym-math-national-atlas.json',
    canonicalPath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
    semanticKindLedgerPath: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
    curriculumAtomicDenominator: 793,
    roundAResultStem: 'mathematik-rollout-v1-batch-028r-j8-systems-fractional-equations-revised-recheck-3-v1-20260902-first-pass-a.batch-001',
    roundBResultStem: 'mathematik-rollout-v1-batch-028r-j8-systems-fractional-equations-revised-recheck-3-v1-20260902-first-pass-b.batch-001',
    stableGoals: [
      {
        goalId: 'e42c208d-9555-43cc-92f5-5bb4c0688726',
        evidenceRound: 'second',
        rationale: {
          de: 'Beide unabhängigen Blindprüfungen bestätigen die aktuelle Kompetenz zu linearen Gleichungssystemen und ihrer Lösungsvielfalt. Runde B wird ausgewählt, weil sie den Abgleich von algebraischer und grafischer Darstellung mit der Einordnung in eine, keine oder unendlich viele Lösungen besonders geschlossen operationalisiert; Runde A bleibt vollständig gebunden.',
          en: 'Both independent blind reviews confirm the current competency concerning systems of linear equations and solution multiplicity. Round B is selected because it particularly coherently operationalizes the reconciliation of algebraic and graphical representations with classification into one, no, or infinitely many solutions; Round A remains fully bound.',
        },
      },
      {
        goalId: '797ee047-b8dd-45cf-880e-98571a56c690',
        evidenceRound: 'first',
        rationale: {
          de: 'Beide unabhängigen Blindprüfungen bestätigen die aktuelle Kompetenz zu Bruchgleichungen und ihrer Deutung als Schnittproblem. Runde A wird ausgewählt, weil sie gemeinsame Definitionsmenge, ausgeschlossene Kandidaten und die Zuordnung gültiger Lösungen zu Graphenschnittpunkten besonders klar miteinander verbindet; Runde B bleibt vollständig gebunden.',
          en: 'Both independent blind reviews confirm the current competency concerning fractional equations and their interpretation as intersection problems. Round A is selected because it particularly clearly connects the common domain, excluded candidates, and the correspondence of valid solutions with graph intersections; Round B remains fully bound.',
        },
      },
    ],
    excludedFreshGoalIds: [
      '0a154cbd-1218-4553-835c-a754e9901bba',
    ],
    sourceHashes: {
      config: '744a18165747421c8798e2b31e0d8a6c8f1ddfada5b5cd596a309d9daebbcd7f',
      batchManifest: '43789adc82da5ef498329a7c12fc42c97732006aa1e54dcf4fa344b24bf19005',
      dualSummary: '3e9ce38b07b721214265c155cce1ab1fc2ec81b3c8274981550ae89e360bf3f4',
      roundARecords: '561fe3dc405ea4c604cb78972c37c225bdc7343ae4b4f253685811ce252c9d46',
      roundARun: '91d3b7cc2359d2ef901308d649d90d15a26fe2ee79467428195cdc9b89b83dab',
      roundBRecords: 'bc17062d4f88b76ffb66344a877bc2435f4a9b953c40f4c2cfbab0331d3980f2',
      roundBRun: '95d8ded3a0f6938b4950a2bcbe0281993e66516243d8f817d8cc738dfc707832',
    },
    currentPins: {
      canonical: '80d3859390be46a9d9012839432688814258bff8cf09b0a5b6b17956a8db78cf',
      semanticKindLedger: 'dd8b0de6d7fce3d1245751f45373d6e42836d9a40ef7499e235fdfe204086153',
    },
  },
  physik: {
    key: 'physik',
    idPrefix: 'physik-b030r-stable1',
    outputStem: 'stable-current-carryover-1-v1',
    manifestId: 'physik-b030r-stable1-synthesis-openai-codex-20260902',
    synthesizedBy: 'OpenAI Codex Physics B030r consensus-stable one carryover synthesis candidate',
    receiptId: 'physik-b030r-stable-current-carryover-1-v1-20260902',
    purpose: 'Hash-bound carryover of exactly the one current B030r recheck goal confirmed KEEP by both blind rounds; the other two source-batch goals stay excluded pending further review.',
    rolloutRoot: 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-02',
    batchName: 'batch-030r-q1-charge-magnetism-revised-3-v1',
    baseGoalBookConfigPath: 'app/scripts/config/goal-books/de-gym-physics-national-atlas.json',
    canonicalPath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
    semanticKindLedgerPath: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
    curriculumAtomicDenominator: 461,
    roundAResultStem: 'physik-rollout-v1-batch-030r-q1-charge-magnetism-revised-3-v1-20260902-first-pass-a.batch-001',
    roundBResultStem: 'physik-rollout-v1-batch-030r-q1-charge-magnetism-revised-3-v1-20260902-first-pass-b.batch-001',
    stableGoals: [{
      goalId: 'a6e48b88-51ed-5942-bdb8-8d2192652e0d',
      evidenceRound: 'second',
      rationale: {
        de: 'Beide unabhängigen Blindprüfungen bestätigen die aktuelle Kompetenz zu Ladungsphänomenen und Reibungselektrizität. Runde B wird ausgewählt, weil sie sicheren Versuchsaufbau, kontrollierte Variation und die epistemische Trennung zwischen beobachteter Bewegung sowie erschlossener Kraft- und Ladungsbeschreibung besonders präzise verbindet; Runde A bleibt vollständig gebunden.',
        en: 'Both independent blind reviews confirm the current competency concerning charge phenomena and frictional electricity. Round B is selected because it particularly precisely connects a safe experimental setup, controlled variation, and the epistemic distinction between observed motion and the inferred descriptions of force and charge; Round A remains fully bound.',
      },
    }],
    excludedFreshGoalIds: [
      '0924162b-46d0-5c56-93bc-33e1f5ac6886',
      '9854589c-5feb-4942-b90f-311ddf36eb78',
    ],
    sourceHashes: {
      config: 'cfeef0c972ee3a446ee3b98f56b4fa935500ca99889784218b4e5b675be12326',
      batchManifest: 'faac03f4157fa1d87bd3a37e82671f25b47b58e5c004378628bec28ecd1531a2',
      dualSummary: 'feca32f98749e36b8ccfb7611f8fdef0dc50eb2a1d99bce1d38dbb90a133efaf',
      roundARecords: '59c22bc7eb1218a8c92b175ae0d77e8ea4dcff6efbfbe9ca8bc091ac169de2af',
      roundARun: '253afbe2bd34104feb27aff43b2962aa2e89d407a6ee0a52a50648e15920dd3a',
      roundBRecords: '108a1d3d70bdc65dd374b382cbb0f6f3492e1fd259d562161d610de1fd4d4d1d',
      roundBRun: '4b8120fe30a65eef68df0c82d57447d19f054e37830ede1ae43bcf40bc33c183',
    },
    currentPins: {
      canonical: 'b643589d6692a632ace446d96614d1524092dd5455fff06c22220b6ce186ed5e',
      semanticKindLedger: '9cd03fda2dfe2cc0b2b4bf282a77c02ce47e4d534de871c85da45065d20cb348',
    },
  },
}

const parseArgs = (args: string[]): { plan: CarryoverPlan; write: boolean } => {
  let key: CarryoverPlan['key'] | '' = ''
  let write = false
  let check = false
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--write') {
      if (write) throw new Error('Duplicate --write')
      write = true
      continue
    }
    if (arg === '--check') {
      if (check) throw new Error('Duplicate --check')
      check = true
      continue
    }
    if (arg === '--subject') {
      const value = args[index + 1]
      if (key || (value !== 'mathematik' && value !== 'physik')) {
        throw new Error('--subject requires exactly one of mathematik or physik')
      }
      key = value
      index += 1
      continue
    }
    throw new Error(`Unexpected argument: ${arg}`)
  }
  if (!key || write === check) {
    throw new Error('Usage: tsx scripts/materializeB028rB030rConsensusCarryoverResolutions.ts --subject <mathematik|physik> (--write|--check)')
  }
  return { plan: plans[key], write }
}

const absolute = (path: string): string => resolve(repoRoot, path)
const sha256Hex = (bytes: string | Uint8Array): string => createHash('sha256').update(bytes).digest('hex')
const digest = (bytes: string | Uint8Array): GoalDescriptionSynthesisDigest => `sha256:${sha256Hex(bytes)}`
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const readBound = (path: string, expected: string): Buffer => {
  if (!/^[a-f0-9]{64}$/u.test(expected)) {
    throw new Error(`${path}: current post-adjudication SHA-256 pin has not been filled`)
  }
  const bytes = readFileSync(absolute(path))
  const actual = sha256Hex(bytes)
  if (actual !== expected) throw new Error(`${path}: bound digest drift ${actual} != ${expected}`)
  return bytes
}
const completionTimestamp = (runs: Array<{ completedAt: string }>): string => {
  const timestamps = runs.map(({ completedAt }) => Date.parse(completedAt))
  if (timestamps.length === 0 || timestamps.some((value) => !Number.isFinite(value))) {
    throw new Error('Blind runs must have valid completion timestamps')
  }
  return new Date(Math.max(...timestamps) + 1000).toISOString()
}
const assertOutput = (path: string, bytes: Buffer): void => {
  if (!existsSync(absolute(path))) throw new Error(`Missing generated output: ${path}`)
  const actual = readFileSync(absolute(path))
  if (!actual.equals(bytes)) throw new Error(`Generated output drift: ${path}`)
}
const publish = (path: string, bytes: Buffer): void => {
  mkdirSync(dirname(absolute(path)), { recursive: true })
  if (existsSync(absolute(path))) assertOutput(path, bytes)
  else writeFileSync(absolute(path), bytes, { flag: 'wx' })
}
const sameSet = (left: readonly string[], right: readonly string[]): boolean => (
  left.length === right.length && left.every((value) => right.includes(value))
)

const materialize = async (plan: CarryoverPlan, writeMode: boolean): Promise<void> => {
  const batchDirectory = `${plan.rolloutRoot}/${plan.batchName}`
  const sourceConfigPath = `${batchDirectory}.config.json`
  const batchManifestPath = `${batchDirectory}/batch-manifest.json`
  const dualSummaryPath = `${batchDirectory}/dual-summary.json`
  const roundARecordsPath = `${batchDirectory}/round-a/results/${plan.roundAResultStem}.records.jsonl`
  const roundARunPath = `${batchDirectory}/round-a/results/${plan.roundAResultStem}.run.json`
  const roundBRecordsPath = `${batchDirectory}/round-b/results/${plan.roundBResultStem}.records.jsonl`
  const roundBRunPath = `${batchDirectory}/round-b/results/${plan.roundBResultStem}.run.json`
  const synthesisRelativePath = `synthesis-decisions.${plan.outputStem}.json`
  const synthesisPath = `${batchDirectory}/${synthesisRelativePath}`
  const resolutionDirectory = `resolutions-${plan.outputStem}`
  const indexRelativePath = `resolution-index.${plan.outputStem}.json`
  const indexPath = `${batchDirectory}/${indexRelativePath}`
  const receiptRelativePath = `${plan.outputStem}.compatibility-receipt.json`
  const receiptPath = `${batchDirectory}/${receiptRelativePath}`

  const configBytes = readBound(sourceConfigPath, plan.sourceHashes.config)
  const batchManifestBytes = readBound(batchManifestPath, plan.sourceHashes.batchManifest)
  const dualSummaryBytes = readBound(dualSummaryPath, plan.sourceHashes.dualSummary)
  const roundARecordsBytes = readBound(roundARecordsPath, plan.sourceHashes.roundARecords)
  const roundARunBytes = readBound(roundARunPath, plan.sourceHashes.roundARun)
  const roundBRecordsBytes = readBound(roundBRecordsPath, plan.sourceHashes.roundBRecords)
  const roundBRunBytes = readBound(roundBRunPath, plan.sourceHashes.roundBRun)
  const canonicalBytes = readBound(plan.canonicalPath, plan.currentPins.canonical)
  const semanticKindLedgerBytes = readBound(plan.semanticKindLedgerPath, plan.currentPins.semanticKindLedger)
  const landscape = JSON.parse(canonicalBytes.toString('utf8')) as { subject?: string; goals: JsonGoal[] }
  const semanticKindLedger = JSON.parse(semanticKindLedgerBytes.toString('utf8')) as {
    counts?: { curricularAtomic?: number }
    decisions?: Array<{ goalId?: string; semanticKind?: string; decisionStatus?: string }>
  }
  const sourceConfig = JSON.parse(configBytes.toString('utf8')) as {
    baseGoalBookConfigPath: string
    bookId: string
    title: string
    goalIds: string[]
  }
  if (sourceConfig.baseGoalBookConfigPath !== plan.baseGoalBookConfigPath) {
    throw new Error(`${plan.key}: source GoalBook configuration drifted`)
  }
  if (semanticKindLedger.counts?.curricularAtomic !== plan.curriculumAtomicDenominator) {
    throw new Error(`${plan.key}: curricularAtomic denominator drifted`)
  }
  const stableGoalIds = plan.stableGoals.map(({ goalId }) => goalId)
  const partition = [...stableGoalIds, ...plan.excludedFreshGoalIds]
  if (
    new Set(partition).size !== partition.length
    || !sameSet(partition, sourceConfig.goalIds)
  ) {
    throw new Error(`${plan.key}: stable and fresh scopes must be disjoint and exactly cover the source batch`)
  }
  for (const goalId of stableGoalIds) {
    const kind = semanticKindLedger.decisions?.find((decision) => decision.goalId === goalId)
    if (kind?.semanticKind !== 'curricularAtomic' || kind.decisionStatus !== 'authoritative') {
      throw new Error(`${goalId}: missing authoritative curricularAtomic classification`)
    }
  }

  const dual = await materializeGoalDescriptionRolloutBatchDualSummary(absolute(sourceConfigPath), false)
  if (!dual.bytes.equals(dualSummaryBytes)) throw new Error(`${plan.key}: materialized dual summary is not exact-bound`)
  const campaignGoalIds = dual.summary.goals.map(({ goalId }) => goalId)
  if (!sameSet(campaignGoalIds, sourceConfig.goalIds)) throw new Error(`${plan.key}: source campaign goal scope drifted`)

  const currentBase = await loadGoalBookBuildInputs(plan.baseGoalBookConfigPath)
  const currentSubset = buildGoalDescriptionRolloutSubsetModel({
    baseModel: currentBase.model,
    goalIds: sourceConfig.goalIds,
    bookId: sourceConfig.bookId,
    title: sourceConfig.title,
  })
  const expectedGoals: GoalDescriptionRolloutSynthesisExpectedGoal[] = []
  const sources = new Map<string, {
    first: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
    second: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
  }>()
  const currentCanonicalContexts: Array<{
    goalId: string
    canonicalContext: unknown
    fingerprint: GoalDescriptionSynthesisDigest
    sourcePageFingerprint: string
    currentPageFingerprint: string
  }> = []
  for (const spec of plan.stableGoals) {
    const firstResult = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.first, goalId: spec.goalId, label: 'First' })
    const secondResult = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.second, goalId: spec.goalId, label: 'Second' })
    if (firstResult.errors.length > 0 || secondResult.errors.length > 0 || !firstResult.source || !secondResult.source) {
      throw new Error(`${spec.goalId}: source extraction failed: ${[...firstResult.errors, ...secondResult.errors].join(' | ')}`)
    }
    const selected = spec.evidenceRound === 'first' ? firstResult.source : secondResult.source
    if (
      firstResult.source.decision !== 'keep'
      || secondResult.source.decision !== 'keep'
      || selected.decision !== 'keep'
    ) {
      throw new Error(`${spec.goalId}: consensus carryover requires two KEEP records and a selected KEEP record`)
    }
    const firstInput = dual.first.input.goals.find(({ goalId }) => goalId === spec.goalId)
    const secondInput = dual.second.input.goals.find(({ goalId }) => goalId === spec.goalId)
    const canonicalGoal = landscape.goals.find(({ id }) => id === spec.goalId)
    const sourcePage = dual.prepared.model.pages.find(({ goalId }) => goalId === spec.goalId)
    const currentPage = currentSubset.pages.find(({ goalId }) => goalId === spec.goalId)
    if (!firstInput || !secondInput || !canonicalGoal || !sourcePage || !currentPage) {
      throw new Error(`${spec.goalId}: missing source input, canonical goal, or Atlas page`)
    }
    if (stableGoalBookJson(firstInput) !== stableGoalBookJson(secondInput)) {
      throw new Error(`${spec.goalId}: blind inputs differ`)
    }
    if (stableGoalBookJson(sourcePage) !== stableGoalBookJson(currentPage)) {
      throw new Error(`${spec.goalId}: current Atlas page context is not exact-stable`)
    }
    const canonicalContext = buildGoalDescriptionCanonicalContext(canonicalGoal)
    if (stableGoalBookJson(firstInput.canonicalContext) !== stableGoalBookJson(canonicalContext)) {
      throw new Error(`${spec.goalId}: direct current canonical context changed`)
    }
    const finalText = {
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
    if (stableGoalBookJson(finalText) !== stableGoalBookJson(currentText)) {
      throw new Error(`${spec.goalId}: bilingual text is not exact-current`)
    }
    expectedGoals.push({
      goalId: spec.goalId,
      effectiveSemanticKind: 'curricularAtomic',
      goalFingerprint: firstInput.goalFingerprint as GoalDescriptionSynthesisDigest,
      pageFingerprint: firstInput.pageFingerprint as GoalDescriptionSynthesisDigest,
      goalReviewContextFingerprint: fingerprintGoalDescriptionReviewContext(firstInput),
      finalText,
      firstSource: firstResult.source,
      secondSource: secondResult.source,
    })
    sources.set(spec.goalId, { first: firstResult.source, second: secondResult.source })
    currentCanonicalContexts.push({
      goalId: spec.goalId,
      canonicalContext,
      fingerprint: digest(stableGoalBookJson(canonicalContext)),
      sourcePageFingerprint: sourcePage.pageFingerprint,
      currentPageFingerprint: currentPage.pageFingerprint,
    })
  }

  const firstGoal = expectedGoals[0]
  if (!firstGoal) throw new Error(`${plan.key}: stable carryover scope is empty`)
  const synthesizedAt = completionTimestamp([
    JSON.parse(roundARunBytes.toString('utf8')) as { completedAt: string },
    JSON.parse(roundBRunBytes.toString('utf8')) as { completedAt: string },
  ])
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
    synthesizedAt,
    goals: expectedGoals,
  }
  const manifestPayload: Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'> = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
    schemaVersion: 1,
    synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
    manifestId: plan.manifestId,
    authority: 'ai_synthesis',
    synthesizedBy: plan.synthesizedBy,
    synthesizedAt,
    batch: expectedBindings.batch,
    rounds: expectedBindings.rounds,
    decisions: expectedGoals.map((goal, index) => {
      const source = sources.get(goal.goalId)
      const spec = plan.stableGoals.find(({ goalId }) => goalId === goal.goalId)
      if (!source || !spec) throw new Error(`${goal.goalId}: incomplete stable decision source`)
      return {
        decisionId: `${plan.manifestId}-decision-${String(index + 1).padStart(3, '0')}`,
        goalId: goal.goalId,
        effectiveSemanticKind: goal.effectiveSemanticKind,
        goalFingerprint: goal.goalFingerprint,
        pageFingerprint: goal.pageFingerprint,
        goalReviewContextFingerprint: goal.goalReviewContextFingerprint,
        finalText: goal.finalText,
        resolutionDecision: 'keep_current' as const,
        evidenceRound: spec.evidenceRound,
        records: {
          first: { recordId: source.first.binding.recordId, recordDigest: source.first.binding.recordDigest },
          second: { recordId: source.second.binding.recordId, recordDigest: source.second.binding.recordDigest },
        },
        rationaleDe: spec.rationale.de,
        rationaleEn: spec.rationale.en,
      }
    }),
  }
  const synthesisManifest: GoalDescriptionRolloutSynthesisDecisionManifest = {
    ...manifestPayload,
    manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(manifestPayload),
  }
  const manifestValidation = await validateGoalDescriptionRolloutSynthesisDecisionManifest({
    manifest: synthesisManifest,
    expected: expectedBindings,
  })
  if (manifestValidation.errors.length > 0) {
    throw new Error(`${plan.key}: synthesis invalid: ${manifestValidation.errors.join(' | ')}`)
  }
  const synthesisBytes = jsonBytes(synthesisManifest)

  const resolutionOutputs: Array<{ path: string; bytes: Buffer }> = []
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
      resolutionId: `${plan.idPrefix}-current-carryover-v1-resolution-${goal.goalId}`,
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
      throw new Error(`${goal.goalId}: resolution invalid: ${validation.errors.join(' | ')}`)
    }
    const bytes = jsonBytes(resolution)
    const relativePath = `${resolutionDirectory}/${goal.goalId}.resolution.json`
    resolutionOutputs.push({ path: `${batchDirectory}/${relativePath}`, bytes })
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
  const stableCount = plan.stableGoals.length
  const index = {
    schemaVersion: 1,
    artifactSetId: `${dual.prepared.manifest.batchId}-stable-current-carryover-${stableCount}`,
    subject: dual.prepared.manifest.subjectLabel,
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: stableCount,
    curriculumAtomicDenominator: plan.curriculumAtomicDenominator,
    descriptionReviewPercentage: Number(((stableCount / plan.curriculumAtomicDenominator) * 100).toFixed(1)),
    groups: [{
      groupId: dual.prepared.manifest.batchId,
      artifactDirectory: '.',
      dualSummaryPath: 'dual-summary.json',
      dualSummaryDigest: digest(dual.bytes),
      campaignGoalCount: dual.summary.goalCount,
      resolvedGoalCount: stableCount,
    }],
    resolutions: indexEntries,
  }
  const indexBytes = jsonBytes(index)
  const outputsWithoutReceipt = [
    { path: synthesisPath, bytes: synthesisBytes },
    ...resolutionOutputs,
    { path: indexPath, bytes: indexBytes },
  ]
  const receiptBody = {
    schemaVersion: 1,
    receiptId: plan.receiptId,
    purpose: plan.purpose,
    source: {
      configPath: sourceConfigPath,
      configSha256: digest(configBytes),
      batchManifestPath,
      batchManifestSha256: digest(batchManifestBytes),
      dualSummaryPath,
      dualSummarySha256: digest(dualSummaryBytes),
      semanticKindLedgerPath: plan.semanticKindLedgerPath,
      semanticKindLedgerSha256: digest(semanticKindLedgerBytes),
      curriculumAtomicDenominator: plan.curriculumAtomicDenominator,
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
    },
    currentCanonicalLandscape: { path: plan.canonicalPath, sha256: digest(canonicalBytes) },
    compatibilityRebase: {
      status: 'accepted_exact_stable_page_rebase',
      reason: 'The full current Atlas may contain accepted changes for excluded goals, while every claimed stable goal page, bilingual text, and direct canonical context remains exact to the reviewed source.',
      sourceBaseBookDigest: dual.prepared.manifest.source.baseBookDigest,
      sourceSubsetBookDigest: dual.prepared.model.digest,
      currentBaseBookDigest: currentBase.model.digest,
      currentSubsetBookDigest: currentSubset.digest,
      stableGoalPages: currentCanonicalContexts.map(({ goalId, sourcePageFingerprint, currentPageFingerprint }) => ({
        goalId,
        sourcePageFingerprint,
        currentPageFingerprint,
        exactPageContext: sourcePageFingerprint === currentPageFingerprint,
      })),
    },
    currentCanonicalContexts: currentCanonicalContexts.map(({ goalId, canonicalContext, fingerprint }) => ({
      goalId,
      canonicalContext,
      fingerprint,
    })),
    claimedGoalIds: stableGoalIds,
    explicitlyExcludedFreshGoalIds: plan.excludedFreshGoalIds,
    adjudication: {
      currentTextKeptGoalIds: stableGoalIds,
      freshReviewGoalIds: plan.excludedFreshGoalIds,
    },
    synthesisManifestPath: synthesisRelativePath,
    synthesisManifestDigest: digest(synthesisBytes),
    synthesisManifestFingerprint: synthesisManifest.manifestFingerprint,
    resolutionIndexPath: indexRelativePath,
    resolutionIndexDigest: digest(indexBytes),
    safeguards: {
      sourceRunsRecordsAndDualSummaryByteBound: true,
      twoIndependentKeepDecisionsRequired: true,
      selectedEvidenceRoundMustBeKeep: true,
      currentBilingualTextsAndDirectContextsRequired: true,
      currentAtlasStablePagesRequiredByteExact: true,
      stableAndFreshScopesDisjointAndComplete: true,
      canonicalLandscapeAndSemanticKindLedgerByteBound: true,
      openAiReviewFreezeRequiredBeforeWrite: true,
    },
  } as const
  const materializationPlanSha256 = digest(jsonBytes({
    plan,
    outputs: outputsWithoutReceipt.map(({ path, bytes }) => ({ path, sha256: digest(bytes) })),
    receiptPath,
    receiptBody,
  }))
  const receiptBytes = jsonBytes({ ...receiptBody, materializationPlanSha256 })
  const outputs = [...outputsWithoutReceipt, { path: receiptPath, bytes: receiptBytes }]

  if (writeMode) {
    execFileSync(process.execPath, ['scripts/check_openai_plugin_review_freeze.mjs'], {
      cwd: repoRoot,
      stdio: 'inherit',
    })
    for (const output of outputs) publish(output.path, output.bytes)
  } else {
    for (const output of outputs) assertOutput(output.path, output.bytes)
  }
  console.log(
    `${plan.key} B028r/B030r consensus carryover ${writeMode ? 'materialized' : 'valid'}: goals=${stableCount}; synthesis=${digest(synthesisBytes)}; index=${digest(indexBytes)}; receipt=${digest(receiptBytes)}`,
  )
}

const { plan, write } = parseArgs(process.argv.slice(2))
await materialize(plan, write)
