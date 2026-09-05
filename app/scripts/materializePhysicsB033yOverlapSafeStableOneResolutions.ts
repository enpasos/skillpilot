import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoalDescriptionRolloutResolutionSynthesis } from './goalDescriptionRolloutResolutionSynthesis'
import { loadGoalBookBuildInputs, stableGoalBookJson } from './goalBookModel'
import { buildGoalDescriptionRolloutSubsetModel, materializeGoalDescriptionRolloutBatchDualSummary } from './materializeGoalDescriptionRolloutBatch'
import { buildGoalDescriptionDualRoundResolution, extractGoalDescriptionDualRoundResolutionSource, fingerprintGoalDescriptionReviewContext, validateGoalDescriptionDualRoundResolution } from './validateGoalDescriptionDualRoundResolution'
import { buildGoalDescriptionCanonicalContext } from './validateGoalDescriptionReviewCampaign'
import { buildGoalDescriptionRolloutSynthesisRoundBinding, fingerprintGoalDescriptionRolloutSynthesisDecisionManifest, validateGoalDescriptionRolloutSynthesisDecisionManifest, type GoalDescriptionRolloutSynthesisDecisionManifest, type GoalDescriptionRolloutSynthesisExpectedGoal, type GoalDescriptionSynthesisDigest } from './validateGoalDescriptionRolloutSynthesisDecisionManifest'

type JsonGoal = Record<string, unknown>
type Authoring = { schemaVersion: number; artifactType: string; carryoverId: string; synthesizedBy: string; excludedGoalIds: string[]; decisions: Array<{ goalId: string; evidenceRound: 'first' | 'second'; rationaleDe: string; rationaleEn: string }> }
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const write = process.argv.includes('--write')
if (process.argv.slice(2).some((argument) => argument !== '--write')) throw new Error('Only --write is supported')
const batchName = 'batch-033y-relativity-split-final-current-recheck-6-v1'
const rollout = join(root, 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-05')
const batch = join(rollout, batchName)
const configPath = join(rollout, `${batchName}.config.json`)
const manifestPath = join(batch, 'batch-manifest.json')
const dualPath = join(batch, 'dual-summary.json')
const authoringPath = join(batch, 'overlap-safe-stable-current-carryover-1-v1.authoring.json')
const canonicalPath = join(root, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')
const semanticPath = join(root, 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json')
const outputStem = 'overlap-safe-stable-current-carryover-1-v1'
const synthesisRelativePath = `synthesis-decisions.${outputStem}.json`
const synthesisPath = join(batch, synthesisRelativePath)
const resolutionDirectory = `resolutions-${outputStem}`
const indexPath = join(batch, `resolution-index.${outputStem}.json`)
const receiptPath = join(batch, `${outputStem}.compatibility-receipt.json`)
const owner8Path = join(rollout, 'batch-033w-final-adjudication-context-recheck-10-v1/resolution-index.overlap-safe-stable-current-carryover-7-v1.json')
const ownerSyncPath = join(root, 'curricula/DE/Gymnasium/quality/goal-description-review/physik/checkpoint-current-2026-08-26/resolution-index.json')
const owner8Id = '8d34228c-da38-5c1e-97cc-571f3eafb9f4'
const staleId = 'a684bec1-ba59-59d0-98d2-4ca37236f64c'
const claimedId = '512f81af-1480-56a8-ae52-af3aa1a6a859'
const changedIds = ['19aef2ed-eb46-55b1-9486-ee83f7520bb6', '57ec031c-9a91-5331-81a7-6ef900f7c63e']
const ownerSyncId = 'a08e33db-d821-457b-86dd-870e7648c5f4'
const campaignIds = [owner8Id, staleId, claimedId, ...changedIds, ownerSyncId]
const excludedIds = [owner8Id, staleId, ...changedIds, ownerSyncId]
const sha256 = (value: Buffer | string): GoalDescriptionSynthesisDigest => `sha256:${createHash('sha256').update(value).digest('hex')}`
const bytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const sameOrdered = (a: readonly string[], b: readonly string[]): boolean => a.length === b.length && a.every((value, index) => value === b[index])
const currentText = (goal: JsonGoal) => ({ titleDe: String(goal.title ?? ''), titleEn: String(goal.titleEn ?? ''), descriptionDe: String(goal.description ?? ''), descriptionEn: String(goal.descriptionEn ?? '') })
const inputText = (goal: { currentTitleDe: string; currentTitleEn: string; currentDescriptionDe: string; currentDescriptionEn: string }) => ({ titleDe: goal.currentTitleDe, titleEn: goal.currentTitleEn, descriptionDe: goal.currentDescriptionDe, descriptionEn: goal.currentDescriptionEn })
const optional = async (path: string): Promise<Buffer | null> => { try { return await readFile(path) } catch (error) { if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null; throw error } }
const writeExact = async (artifacts: Array<{ path: string; bytes: Buffer }>): Promise<void> => {
  const existing = await Promise.all(artifacts.map(({ path }) => optional(path)))
  artifacts.forEach(({ path, bytes: expected }, index) => { if (existing[index] && !existing[index]?.equals(expected)) throw new Error(`Stale B033y stable artifact: ${path}`); if (!existing[index] && !write) throw new Error(`Missing B033y stable artifact: ${path}`) })
  if (write) for (let index = 0; index < artifacts.length; index += 1) if (!existing[index]) { await mkdir(dirname(artifacts[index]!.path), { recursive: true }); await writeFile(artifacts[index]!.path, artifacts[index]!.bytes, { flag: 'wx' }) }
}

const main = async (): Promise<void> => {
  const [dual, configBytes, manifestBytes, dualBytes, canonicalBytes, semanticBytes, authoringBytes, owner8Bytes, ownerSyncBytes] = await Promise.all([
    materializeGoalDescriptionRolloutBatchDualSummary(configPath, false), readFile(configPath), readFile(manifestPath), readFile(dualPath), readFile(canonicalPath), readFile(semanticPath), readFile(authoringPath), readFile(owner8Path), readFile(ownerSyncPath),
  ])
  if (!dual.bytes.equals(dualBytes)) throw new Error('B033y dual summary is not exact-current')
  const landscape = JSON.parse(canonicalBytes.toString('utf8')) as { subject?: string; goals?: JsonGoal[] }
  const semantic = JSON.parse(semanticBytes.toString('utf8')) as { counts?: { curricularAtomic?: number }; decisions?: Array<{ goalId?: string; semanticKind?: string; decisionStatus?: string }> }
  const authoring = JSON.parse(authoringBytes.toString('utf8')) as Authoring
  if (landscape.subject !== 'Physik' || !landscape.goals || semantic.counts?.curricularAtomic !== 464) throw new Error('Current Physics/denominator binding drifted')
  if (authoring.schemaVersion !== 1 || authoring.artifactType !== 'goal-description-stable-current-carryover-authoring-v1' || authoring.carryoverId !== 'physik-b033y-overlap-safe-stable-current-carryover-1-v1-20260905' || !sameOrdered(authoring.excludedGoalIds, excludedIds) || !sameOrdered(authoring.decisions.map(({ goalId }) => goalId), [claimedId])) throw new Error('B033y stable authoring partition drifted')
  if (dual.summary.goalCount !== 6 || !sameOrdered(dual.prepared.manifest.goalIds, campaignIds)) throw new Error('B033y campaign scope drifted')
  const expectedPairs = new Map([[owner8Id, 'keep/keep'], [staleId, 'keep/keep'], [claimedId, 'keep/keep'], [changedIds[0]!, 'split_review/split_review'], [changedIds[1]!, 'split_review/split_review'], [ownerSyncId, 'keep/keep']])
  for (const goal of dual.summary.goals) if (`${goal.firstDecision}/${goal.secondDecision}` !== expectedPairs.get(goal.goalId)) throw new Error(`${goal.goalId}: decision pair drifted`)
  const readOwner = (content: Buffer, goalId: string, path: string) => {
    const index = JSON.parse(content.toString('utf8')) as { resolutions?: Array<{ goalId?: string; decision?: string; strictDescriptionComplete?: boolean; resolutionPath?: string; resolutionDigest?: string }> }
    const matches = index.resolutions?.filter((entry) => entry.goalId === goalId) ?? []
    if (matches.length !== 1 || matches[0]?.decision !== 'keep_current' || matches[0].strictDescriptionComplete !== true) throw new Error(`${path}: strict owner pin drifted`)
    return matches[0]
  }
  const owner8 = readOwner(owner8Bytes, owner8Id, owner8Path)
  const ownerSync = readOwner(ownerSyncBytes, ownerSyncId, ownerSyncPath)
  const first = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.first, goalId: claimedId, label: 'First' })
  const second = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.second, goalId: claimedId, label: 'Second' })
  if (first.errors.length || second.errors.length || !first.source?.record || !second.source?.record) throw new Error(`B033y source extraction failed: ${[...first.errors, ...second.errors].join(' | ')}`)
  const firstInput = dual.first.input.goals.find((goal) => goal.goalId === claimedId)!
  const secondInput = dual.second.input.goals.find((goal) => goal.goalId === claimedId)!
  const canonicalGoal = landscape.goals.find((goal) => goal.id === claimedId)!
  if (!firstInput || !secondInput || !canonicalGoal || stableGoalBookJson(firstInput) !== stableGoalBookJson(secondInput) || stableGoalBookJson(firstInput.canonicalContext) !== stableGoalBookJson(buildGoalDescriptionCanonicalContext(canonicalGoal)) || stableGoalBookJson(inputText(firstInput)) !== stableGoalBookJson(currentText(canonicalGoal))) throw new Error('Claimed Michelson-Morley goal is not exact-current')
  const currentBase = await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-physics-national-atlas.json')
  const currentSubset = buildGoalDescriptionRolloutSubsetModel({ baseModel: currentBase.model, goalIds: campaignIds, bookId: 'de-gym-physics-b033y-relativity-split-final-current-recheck-6-v1-20260905', title: 'Physik B033y – Finale Nachprüfung des Relativitätspostulate/Michelson-Morley-Splits und direkt veralteter curricularAtomic-Kontexte' })
  const staleInput = dual.first.input.goals.find((goal) => goal.goalId === staleId)!
  const staleCurrentPage = currentSubset.pages.find((page) => page.goalId === staleId)
  if (!staleCurrentPage || stableGoalBookJson(staleInput.reviewContext.page) === stableGoalBookJson(staleCurrentPage)) throw new Error('Postulates overlap unexpectedly remained page-current after reverse-context changes')
  const claimedCurrentPage = currentSubset.pages.find((page) => page.goalId === claimedId)
  if (!claimedCurrentPage || stableGoalBookJson(firstInput.reviewContext.page) !== stableGoalBookJson(claimedCurrentPage)) throw new Error('Claimed Michelson-Morley Atlas page is not exact-current')
  const reviewContextFingerprint = fingerprintGoalDescriptionReviewContext(firstInput)
  if (first.source.binding.goalReviewContextFingerprint !== reviewContextFingerprint || second.source.binding.goalReviewContextFingerprint !== reviewContextFingerprint) throw new Error('Claimed review-context binding drifted')
  const expectedGoal: GoalDescriptionRolloutSynthesisExpectedGoal = { goalId: claimedId, effectiveSemanticKind: 'curricularAtomic', goalFingerprint: firstInput.goalFingerprint as GoalDescriptionSynthesisDigest, pageFingerprint: firstInput.pageFingerprint as GoalDescriptionSynthesisDigest, goalReviewContextFingerprint: reviewContextFingerprint, finalText: inputText(firstInput), firstSource: first.source, secondSource: second.source }
  const completion = [...dual.first.resultPairs, ...dual.second.resultPairs].map(({ run }) => Date.parse(run.completedAt))
  const synthesizedAt = new Date(Math.max(...completion) + 1000).toISOString()
  const bindings = {
    batch: { batchId: dual.prepared.manifest.batchId, batchManifestDigest: sha256(manifestBytes), configDigest: sha256(configBytes), bundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint, bookDigest: dual.first.input.bookDigest as GoalDescriptionSynthesisDigest, reviewInputFingerprint: dual.first.input.reviewInputFingerprint as GoalDescriptionSynthesisDigest, dualSummaryDigest: sha256(dual.bytes), canonicalLandscapeDigest: sha256(canonicalBytes) },
    rounds: { first: buildGoalDescriptionRolloutSynthesisRoundBinding(first.source.binding, dual.prepared.manifest.artifacts.rounds.first.batchInputFingerprint), second: buildGoalDescriptionRolloutSynthesisRoundBinding(second.source.binding, dual.prepared.manifest.artifacts.rounds.second.batchInputFingerprint) }, synthesizedAt, goals: [expectedGoal],
  }
  const authored = authoring.decisions[0]!
  const manifestId = 'physik-b033y-overlap-safe-stable-current-carryover-1-v1-openai-codex-20260905'
  const payload: Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'> = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json', schemaVersion: 1, synthesisContract: 'goal-description-rollout-synthesis-decision-v1', manifestId, authority: 'ai_synthesis', synthesizedBy: authoring.synthesizedBy, synthesizedAt, batch: bindings.batch, rounds: bindings.rounds,
    decisions: [{ decisionId: `${manifestId}-decision-001`, goalId: claimedId, effectiveSemanticKind: 'curricularAtomic', goalFingerprint: expectedGoal.goalFingerprint, pageFingerprint: expectedGoal.pageFingerprint, goalReviewContextFingerprint: reviewContextFingerprint, finalText: expectedGoal.finalText, resolutionDecision: 'keep_current', evidenceRound: authored.evidenceRound, records: { first: { recordId: first.source.binding.recordId, recordDigest: first.source.binding.recordDigest }, second: { recordId: second.source.binding.recordId, recordDigest: second.source.binding.recordDigest } }, rationaleDe: authored.rationaleDe, rationaleEn: authored.rationaleEn }],
  }
  const synthesis: GoalDescriptionRolloutSynthesisDecisionManifest = { ...payload, manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(payload) }
  const synthesisValidation = await validateGoalDescriptionRolloutSynthesisDecisionManifest({ manifest: synthesis, expected: bindings })
  if (synthesisValidation.errors.length) throw new Error(synthesisValidation.errors.join(' | '))
  const synthesisBytes = bytes(synthesis)
  const summaryGoal = dual.summary.goals.find((goal) => goal.goalId === claimedId)!
  const decision = synthesis.decisions[0]!
  const resolutionSynthesis = buildGoalDescriptionRolloutResolutionSynthesis({ batchId: synthesis.batch.batchId, manifest: synthesis, decision, summaryGoal, firstSource: first.source, secondSource: second.source })
  const resolution = buildGoalDescriptionDualRoundResolution({ resolutionId: `physics-b033y-${outputStem}-resolution-${claimedId}`, goalId: claimedId, effectiveSemanticKind: 'curricularAtomic', decision: 'keep_current', synthesis: resolutionSynthesis, dualSummaryBytes: dual.bytes, currentInput: dual.first.input, firstSource: first.source, secondSource: second.source, synthesisDecisionManifest: { contract: synthesis.synthesisContract, manifestPath: synthesisRelativePath, manifestId: synthesis.manifestId, manifestDigest: sha256(synthesisBytes), manifestFingerprint: synthesis.manifestFingerprint, decisionId: decision.decisionId } })
  const validation = await validateGoalDescriptionDualRoundResolution({ resolution, dualSummary: dual.summary, dualSummaryBytes: dual.bytes, currentInput: dual.first.input, landscape: landscape as { subject: string; goals: JsonGoal[] }, first: dual.first, second: dual.second, synthesisDecisionManifestArtifact: { manifest: synthesis, manifestBytes: synthesisBytes, manifestPath: synthesisRelativePath } })
  if (validation.errors.length || !validation.strictDescriptionComplete) throw new Error(validation.errors.join(' | ') || 'Resolution is not strict-complete')
  const resolutionBytes = bytes(resolution)
  const relativeResolutionPath = `${resolutionDirectory}/${claimedId}.resolution.json`
  const index = { schemaVersion: 1, artifactSetId: `${dual.prepared.manifest.batchId}-${outputStem}`, subject: 'Physik', semanticKind: 'curricularAtomic', strictDescriptionReviewCompleteCount: 1, curriculumAtomicDenominator: 464, descriptionReviewPercentage: 0.2, groups: [{ groupId: dual.prepared.manifest.batchId, artifactDirectory: '.', dualSummaryPath: 'dual-summary.json', dualSummaryDigest: sha256(dual.bytes), campaignGoalCount: 6, resolvedGoalCount: 1 }], resolutions: [{ goalId: claimedId, titleDe: resolution.goal.finalText.titleDe, groupId: dual.prepared.manifest.batchId, decision: resolution.decision, resolutionPath: relativeResolutionPath, resolutionDigest: sha256(resolutionBytes), resolutionFingerprint: resolution.resolutionFingerprint, strictDescriptionComplete: true }] }
  const indexBytes = bytes(index)
  const receipt = { schemaVersion: 1, receiptId: 'physik-b033y-overlap-safe-stable-current-carryover-1-v1-20260905', purpose: 'Fail-closed overlap-safe carryover of the sole unowned exact-current KEEP/KEEP goal; two central owners, one directly stale KEEP/KEEP context, and both split targets remain excluded.', sourceBatchId: dual.prepared.manifest.batchId, sourceCampaignGoalCount: 6, source: { configPath: `${batchName}.config.json`, configDigest: sha256(configBytes), batchManifestPath: 'batch-manifest.json', batchManifestDigest: sha256(manifestBytes), dualSummaryPath: 'dual-summary.json', dualSummaryDigest: sha256(dualBytes), canonicalLandscapeDigest: sha256(canonicalBytes), semanticKindLedgerDigest: sha256(semanticBytes), authoringPath: `${outputStem}.authoring.json`, authoringDigest: sha256(authoringBytes) }, claimedGoalIds: [claimedId], claimedGoalCount: 1, explicitlyExcludedChangedGoalIds: changedIds, explicitlyExcludedContextStaleGoalIds: [staleId], explicitlyExcludedOverlapGoalIds: [owner8Id, ownerSyncId], existingStrictOverlapOwners: [{ goalId: owner8Id, resolutionIndexPath: 'batch-033w-final-adjudication-context-recheck-10-v1/resolution-index.overlap-safe-stable-current-carryover-7-v1.json', resolutionIndexDigest: sha256(owner8Bytes), resolutionPath: owner8.resolutionPath, resolutionDigest: owner8.resolutionDigest }, { goalId: ownerSyncId, resolutionIndexPath: '../../../checkpoint-current-2026-08-26/resolution-index.json', resolutionIndexDigest: sha256(ownerSyncBytes), resolutionPath: ownerSync.resolutionPath, resolutionDigest: ownerSync.resolutionDigest }], currentPrerequisiteContexts: [{ goalId: claimedId, prerequisites: [] }], synthesisManifestPath: synthesisRelativePath, synthesisManifestDigest: sha256(synthesisBytes), synthesisManifestFingerprint: synthesis.manifestFingerprint, resolutionIndexPath: `resolution-index.${outputStem}.json`, resolutionIndexDigest: sha256(indexBytes), noCentralRolloutRegistration: true, safeguards: { exactCampaignPartitionRequired: true, exactKeepKeepDecisionPairRequired: true, reviewedBilingualTextAndCanonicalContextMustRemainCurrent: true, directlyStaleKeepMustRemainExcluded: true, alreadyStrictOverlapsMustRemainExcludedAndPinned: true, individualResolutionFreshlyValidated: true, centralRegistrationPerformed: false } }
  if (write) execFileSync(process.execPath, ['scripts/check_openai_plugin_review_freeze.mjs'], { cwd: root, stdio: 'inherit' })
  await writeExact([{ path: synthesisPath, bytes: synthesisBytes }, { path: join(batch, relativeResolutionPath), bytes: resolutionBytes }, { path: indexPath, bytes: indexBytes }, { path: receiptPath, bytes: bytes(receipt) }])
  console.log(`${write ? 'Materialized' : 'Verified'} Physics B033y overlap-safe stable1 resolutions: strict=1/1 campaign=6 owners=2 stale=1 index=${indexPath}`)
}
main().catch((error) => { console.error(error instanceof Error ? error.stack : String(error)); process.exitCode = 1 })
