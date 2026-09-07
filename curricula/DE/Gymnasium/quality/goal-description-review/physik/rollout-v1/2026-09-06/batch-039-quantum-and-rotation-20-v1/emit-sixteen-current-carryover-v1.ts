import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'
import { validateLegacyResolutionIndexSnapshot } from '../../../../../../../../../app/scripts/reportDeepUnderstandingRollout'
import { loadGoalBookBuildInputs, stableGoalBookJson, GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION } from '../../../../../../../../../app/scripts/goalBookModel'
import { materializeGoalDescriptionRolloutBatchDualSummary, buildGoalDescriptionRolloutSubsetModel } from '../../../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
import { extractGoalDescriptionDualRoundResolutionSource, buildGoalDescriptionDualRoundResolution, validateGoalDescriptionDualRoundResolution } from '../../../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution'
import { fingerprintGoalDescriptionRolloutSynthesisDecisionManifest, buildGoalDescriptionRolloutSynthesisRoundBinding, validateGoalDescriptionRolloutSynthesisDecisionManifest } from '../../../../../../../../../app/scripts/validateGoalDescriptionRolloutSynthesisDecisionManifest'
import { buildGoalDescriptionRolloutResolutionSynthesis } from '../../../../../../../../../app/scripts/goalDescriptionRolloutResolutionSynthesis'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import { fingerprintGoalForEvidence } from '../../../../../../../../../app/scripts/goalEvidenceProfileModel'

const prefix = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-06/batch-039-quantum-and-rotation-20-v1'
const helperPath = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-06/batch-039-quantum-and-rotation-20-v1/emit-sixteen-current-carryover-v1.ts'
const expectedGoalIds = ["d5bff282-741f-4cc5-9622-b77584fdcc5a","6031bed0-9baa-4f45-b2a5-57ffb00d39cc","f6e5929f-d52a-42a4-a5d2-ff498ee7083f","727d0946-7019-50ed-8fc6-85db12508733","e296aba6-f407-5944-a2bd-e5296e4c9f06","52b6722a-b3b2-5d2d-a507-0215532b0422","accb1d9e-cd48-5983-bcef-9b9bca4a9114","e2da5eec-45de-5527-9ad7-16f41cacbe58","39b2a0c4-eecf-5049-b58f-e790790a3bf2","cf570e66-2ce2-5923-9033-c97d74119553","37f17e7e-9fcf-5dca-ac10-e94cb8420be5","21c0a5f2-4152-549a-aa9c-e02ab772f589","8daaf751-93fe-56d9-8697-ac30237061bd","07f298b2-2f5e-5b16-8150-bc603fa78ecd","d02438ba-0cc9-5993-831e-5e44d35e32c4","58db62d4-458f-5e2d-9ca0-968e09f4944b"]
const explicitHolds: Record<string, string> = {
  '1a1c09f0-96b7-4c33-a623-0e8101537876': 'Changed single-quantum image bytes and page fingerprint; fresh current review required.',
  '642aebd7-66cd-5a50-b543-73c4b207525d': 'Changed successor title and new external reverse prerequisite; own text/goal fingerprint unchanged but full page differs.',
  '5a951a0b-fd6c-51a1-9ffb-2a34ed6d3931': 'Original split_review pair cannot review the revised energy-only goal; title/text/visual context and assessment neighbor changed.',
  'b49e0f6b-df2a-5643-b3ce-a9dfdf25f3bc': 'Original revise pair cannot review the corrected precession DE/EN description and visual alt text.'
}
const newMomentGoalId = 'c2c3cdc5-3e87-47c4-89fd-4eb2c5c2f2ea'
const expectedManifestId = 'physics-b039-sixteen-exact-current-root-synthesis-20260907'
// Read-only patch emitter for the sixteen explicitly selected unchanged Physics B039 KEEP/KEEP pairs.
// Apply the emitted patch once; final description/current-page bindings are checked natively.
// The V1 index is a partial-campaign compatibility snapshot, never a live progress denominator.
const read = (p: string) => readFileSync(p)
const json = (p: string) => JSON.parse(read(p).toString())
const digest = (b: Buffer | string): `sha256:${string}` => `sha256:${createHash('sha256').update(b).digest('hex')}`
const bytes = (x: unknown) => JSON.stringify(x, null, 2) + '\n'
const collectSourceFiles = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const path = directory + '/' + entry.name
  return entry.isDirectory() ? collectSourceFiles(path) : /\.(json|jsonl|md)$/.test(entry.name) ? [path] : []
}).sort()

async function main() {
  const checkMode = process.argv.includes('--check')
  const authored = json(prefix + '/synthesis-authoring.current-carryover-v1.json')
  const config = json(prefix + '.config.json')
  assert.equal(config.goalIds.length, 20)
  assert.equal(new Set(config.goalIds).size, 20)
  assert.equal(expectedGoalIds.length, 16)
  assert.equal(config.goalIds.includes(newMomentGoalId), false, 'New moment ID is not an original-campaign goal')
  assert.equal(authored.manifestId, expectedManifestId)
  assert.equal(authored.synthesizedBy, 'codex-root-full-dual-record-counterreview')
  assert.deepEqual(authored.decisions.map((d: any) => d.goalId), expectedGoalIds)
  const preflight = json(prefix + '/current-carryover-v1.preflight.json')
  assert.deepEqual(preflight.eligibleGoalIds, expectedGoalIds)
  assert.deepEqual(authored.decisions, preflight.draftSynthesisProposals.map((proposal: any) => ({
    goalId: proposal.goalId, resolutionDecision: 'keep_current', evidenceRound: proposal.proposedEvidenceRound,
    rationaleDe: proposal.rationaleDe + ' ' + proposal.reviewerDifferenceHandlingDe,
    rationaleEn: proposal.rationaleEn + ' ' + proposal.reviewerDifferenceHandlingEn,
  })), 'Authored decisions differ from the exact root-authorized preflight synthesis')
  assert.equal(authored.decisions.filter((d: any) => d.evidenceRound === 'first').length, 9)
  assert.equal(authored.decisions.filter((d: any) => d.evidenceRound === 'second').length, 7)
  assert.equal(existsSync(prefix + '/current-carryover-v1.currency-receipt.json'), checkMode, 'Use --check for existing artifacts; never replay writes')
  const sourcePaths = [...new Set([prefix + '.config.json', prefix + '/batch-manifest.json', prefix + '/dual-summary.json', prefix + '/current-carryover-v1.preflight.json', prefix + '/synthesis-authoring.current-carryover-v1.json', helperPath, ...collectSourceFiles(prefix + '/bundle'), ...collectSourceFiles(prefix + '/round-a'), ...collectSourceFiles(prefix + '/round-b')])]
  const sourceBytesBefore = new Map<string, Buffer>(sourcePaths.map(path => [path, read(path)]))
  const currentImageBytes = new Map<string, Buffer>()
  const dual = await materializeGoalDescriptionRolloutBatchDualSummary(prefix + '.config.json', false)
  const current = await loadGoalBookBuildInputs(config.baseGoalBookConfigPath)
  const subset = buildGoalDescriptionRolloutSubsetModel({ baseModel: current.model, goalIds: config.goalIds, bookId: config.bookId, title: config.title })
  const landscapeBytes = read(dual.prepared.manifest.source.landscapePath)
  const landscape = JSON.parse(landscapeBytes.toString())
  assert.equal(current.model.source.landscapeDigest, digest(stableGoalBookJson(landscape)), 'Fresh native model does not bind the canonical bytes read for synthesis')
  const runTimes = [...dual.first.resultPairs, ...dual.second.resultPairs].map(({ run }) => Date.parse(run.completedAt))
  assert.ok(runTimes.length > 0 && runTimes.every(Number.isFinite))
  const synthesizedAt = new Date(Math.max(...runTimes) + 1000).toISOString()
  assert.ok(Date.parse(synthesizedAt) <= Date.now(), 'Bound run timestamp is in the future')
  const historicalDenominator = dual.prepared.manifest.curriculumAtomicDenominatorAtPreparation
  assert.equal(historicalDenominator, 464)
  assert.equal(dual.first.input.goals.length, 20)
  assert.equal(dual.second.input.goals.length, 20)
  assert.ok(landscape.goals.some((goal: any) => goal.id === newMomentGoalId), 'New moment goal must remain independently present')
  const oldPages = json(prefix + '/bundle/book-model.json').pages
  const currentStateAudit = config.goalIds.map((id: string) => {
    const oldPage = oldPages.find((p: any) => p.goalId === id)
    const newPage = subset.pages.find(p => p.goalId === id)
    const canonicalGoal = landscape.goals.find((g: any) => g.id === id)
    const input = dual.first.input.goals.find(g => g.goalId === id)!
    const secondInput = dual.second.input.goals.find(g => g.goalId === id)!
    assert.ok(oldPage && newPage && canonicalGoal && input && secondInput)
    assert.deepEqual(input, secondInput, id + ': independent rounds must bind the same complete original input')
    assert.deepEqual(oldPage, input.reviewContext.page, id + ': original page must exactly match the sealed review input')
    const evidenceProfileEqual = input.reviewContext.evidenceProfile === null && newPage.evidenceReview === null
    let imageBinding: { path: string; originalDigest: string; currentDigest: string } | null = null
    if (newPage.visualization) {
      const path = 'app/public' + newPage.visualization.url
      const data = read(path)
      currentImageBytes.set(path, data)
      assert.equal(digest(data), newPage.visualization.originalDigest, id + ': current image bytes disagree with native page')
      imageBinding = { path, originalDigest: oldPage.visualization?.originalDigest ?? '', currentDigest: digest(data) }
    }
    const first = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.first, goalId: id, label: 'first' })
    const second = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.second, goalId: id, label: 'second' })
    assert.deepEqual([...first.errors, ...second.errors], [])
    assert.ok(first.source && second.source)
    const fullPageEqual = stableGoalBookJson(oldPage) === stableGoalBookJson(newPage)
    const canonicalContext = buildGoalDescriptionCanonicalContext(canonicalGoal)
    const currentGoalFingerprint = fingerprintGoalForEvidence(canonicalGoal, GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION, 'curricularAtomic')
    const roundCurrentChecks = [input, secondInput].map((roundInput, index) => ({
      round: index === 0 ? 'first' : 'second',
      canonicalContextEqual: stableGoalBookJson(roundInput.canonicalContext) === stableGoalBookJson(canonicalContext),
      bilingualTextEqual: roundInput.currentTitleDe === canonicalGoal.title && roundInput.currentTitleEn === canonicalGoal.titleEn && roundInput.currentDescriptionDe === canonicalGoal.description && roundInput.currentDescriptionEn === canonicalGoal.descriptionEn,
      goalFingerprintEqual: roundInput.goalFingerprint === currentGoalFingerprint,
      pageFingerprintEqual: roundInput.pageFingerprint === newPage.pageFingerprint,
    }))
    const canonicalContextEqual = roundCurrentChecks.every(row => row.canonicalContextEqual)
    const bilingualTextEqual = roundCurrentChecks.every(row => row.bilingualTextEqual)
    const goalFingerprintEqual = roundCurrentChecks.every(row => row.goalFingerprintEqual)
    const pageFingerprintEqual = roundCurrentChecks.every(row => row.pageFingerprintEqual)
    const bothKeep = first.source.decision === 'keep' && second.source.decision === 'keep'
    const structurallyEligibleForCarryover = fullPageEqual && canonicalContextEqual && bilingualTextEqual && goalFingerprintEqual && pageFingerprintEqual && evidenceProfileEqual && bothKeep
    const explicitHoldReason = explicitHolds[id] ?? null
    return { goalId: id, firstDecision: first.source.decision, secondDecision: second.source.decision, fullPageEqual, canonicalContextEqual, bilingualTextEqual, goalFingerprintEqual, pageFingerprintEqual, evidenceProfileEqual, imageBinding, roundCurrentChecks, structurallyEligibleForCarryover, explicitHoldReason, eligibleForCarryover: structurallyEligibleForCarryover && explicitHoldReason === null, changedPageFields: [...new Set([...Object.keys(oldPage), ...Object.keys(newPage)])].filter(key => stableGoalBookJson(oldPage[key]) !== stableGoalBookJson((newPage as any)[key])), originalPageFingerprint: oldPage.pageFingerprint, currentPageFingerprint: newPage.pageFingerprint }
  })
  const invalidSelected = currentStateAudit.filter((row: any) => expectedGoalIds.includes(row.goalId) && !row.eligibleForCarryover)
  if (invalidSelected.length) throw new Error('STOP: selected current pages or bindings differ: ' + JSON.stringify(invalidSelected))
  assert.deepEqual(Object.keys(explicitHolds).sort(), config.goalIds.filter((id: string) => !expectedGoalIds.includes(id)).sort())
  assert.deepEqual(currentStateAudit.filter((row: any) => row.eligibleForCarryover).map((row: any) => row.goalId), expectedGoalIds, 'Eligible current subset changed: require explicit updated synthesis, never auto-include extra goals')

  const expectedGoals = authored.decisions.map((decision: any) => {
    const id = decision.goalId
    const oldPage = oldPages.find((p: any) => p.goalId === id)
    const newPage = subset.pages.find(p => p.goalId === id)
    if (!newPage || stableGoalBookJson(oldPage) !== stableGoalBookJson(newPage)) throw new Error(`${id}: full current subset page differs from original review`)
    const first = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.first, goalId: id, label: 'first' })
    const second = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.second, goalId: id, label: 'second' })
    if (first.errors.length || second.errors.length || !first.source || !second.source) throw new Error(`${id}: missing validated review sources`)
    assert.equal(first.source.decision, 'keep')
    assert.equal(second.source.decision, 'keep')
    const input = dual.first.input.goals.find(g => g.goalId === id)!
    return { goalId: id, effectiveSemanticKind: 'curricularAtomic' as const, goalFingerprint: input.goalFingerprint as `sha256:${string}`, pageFingerprint: input.pageFingerprint as `sha256:${string}`, goalReviewContextFingerprint: first.source.binding.goalReviewContextFingerprint, finalText: { titleDe: input.currentTitleDe, titleEn: input.currentTitleEn, descriptionDe: input.currentDescriptionDe, descriptionEn: input.currentDescriptionEn }, firstSource: first.source, secondSource: second.source }
  })
  if (!expectedGoals.length || new Set(expectedGoals.map((g: any) => g.goalId)).size !== expectedGoals.length) throw new Error('Empty or duplicate selected goals')
  const goalSet = new Set(expectedGoals.map((g: any) => g.goalId))
  if (JSON.stringify(config.goalIds.filter((id: string) => goalSet.has(id))) !== JSON.stringify([...goalSet])) throw new Error('Selection order differs from original batch')
  const firstGoal = expectedGoals[0]
  const expected = {
    batch: { batchId: dual.prepared.manifest.batchId, batchManifestDigest: digest(read(prefix + '/batch-manifest.json')), configDigest: dual.prepared.manifest.configDigest, bundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint, bookDigest: dual.first.input.bookDigest as `sha256:${string}`, reviewInputFingerprint: dual.first.input.reviewInputFingerprint as `sha256:${string}`, dualSummaryDigest: digest(dual.bytes), canonicalLandscapeDigest: digest(landscapeBytes) },
    rounds: { first: buildGoalDescriptionRolloutSynthesisRoundBinding(firstGoal.firstSource.binding, dual.prepared.manifest.artifacts.rounds.first.batchInputFingerprint), second: buildGoalDescriptionRolloutSynthesisRoundBinding(firstGoal.secondSource.binding, dual.prepared.manifest.artifacts.rounds.second.batchInputFingerprint) },
    synthesizedAt,
    goals: expectedGoals,
  }
  const payload = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json' as const,
    schemaVersion: 1 as const, synthesisContract: 'goal-description-rollout-synthesis-decision-v1' as const,
    manifestId: authored.manifestId, authority: 'ai_synthesis' as const, synthesizedBy: authored.synthesizedBy,
    synthesizedAt: expected.synthesizedAt, batch: expected.batch, rounds: expected.rounds,
    decisions: expectedGoals.map((goal: any, i: number) => ({ decisionId: `${authored.manifestId}-decision-${String(i + 1).padStart(3, '0')}`, goalId: goal.goalId, effectiveSemanticKind: goal.effectiveSemanticKind, goalFingerprint: goal.goalFingerprint, pageFingerprint: goal.pageFingerprint, goalReviewContextFingerprint: goal.goalReviewContextFingerprint, finalText: goal.finalText, resolutionDecision: 'keep_current' as const, evidenceRound: authored.decisions[i].evidenceRound, records: { first: { recordId: goal.firstSource.binding.recordId, recordDigest: goal.firstSource.binding.recordDigest }, second: { recordId: goal.secondSource.binding.recordId, recordDigest: goal.secondSource.binding.recordDigest } }, ...(authored.decisions[i].revisionDissent ? { revisionDissent: authored.decisions[i].revisionDissent } : {}), rationaleDe: authored.decisions[i].rationaleDe, rationaleEn: authored.decisions[i].rationaleEn })),
  }
  const manifest = { ...payload, manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(payload) }
  const manifestCheck = await validateGoalDescriptionRolloutSynthesisDecisionManifest({ manifest, expected })
  if (manifestCheck.errors.length) throw new Error(manifestCheck.errors.join(' | '))
  const manifestPath = 'synthesis-decisions.current-carryover-v1.json'
  const manifestBytes = Buffer.from(bytes(manifest))
  const files: Array<{ path: string; text: string }> = [{ path: prefix + '/' + manifestPath, text: manifestBytes.toString() }]
  const entries: any[] = []
  for (const [i, goal] of expectedGoals.entries()) {
    const decision = manifest.decisions[i]
    const resolution = buildGoalDescriptionDualRoundResolution({ resolutionId: `${authored.manifestId}-${goal.goalId}`, goalId: goal.goalId, effectiveSemanticKind: 'curricularAtomic', decision: 'keep_current', currentInput: dual.first.input, dualSummaryBytes: dual.bytes, firstSource: goal.firstSource, secondSource: goal.secondSource, synthesis: buildGoalDescriptionRolloutResolutionSynthesis({ batchId: manifest.batch.batchId, manifest, decision, summaryGoal: dual.summary.goals.find(g => g.goalId === goal.goalId)!, firstSource: goal.firstSource, secondSource: goal.secondSource }), synthesisDecisionManifest: { contract: manifest.synthesisContract, manifestPath, manifestId: manifest.manifestId, manifestDigest: digest(manifestBytes), manifestFingerprint: manifest.manifestFingerprint, decisionId: decision.decisionId } })
    const validation = await validateGoalDescriptionDualRoundResolution({ resolution, dualSummary: dual.summary, dualSummaryBytes: dual.bytes, currentInput: dual.first.input, landscape, first: dual.first, second: dual.second, synthesisDecisionManifestArtifact: { manifest, manifestBytes, manifestPath } })
    if (validation.errors.length || !validation.strictDescriptionComplete) throw new Error(`${goal.goalId}: ${validation.errors.join(' | ')}`)
    const path = `resolutions-current-carryover-v1/${goal.goalId}.resolution.json`
    const text = bytes(resolution)
    files.push({ path: prefix + '/' + path, text })
    entries.push({ goalId: goal.goalId, titleDe: goal.finalText.titleDe, groupId: manifest.batch.batchId, decision: 'keep_current', resolutionPath: path, resolutionDigest: digest(text), resolutionFingerprint: resolution.resolutionFingerprint, strictDescriptionComplete: true })
  }
  const index = { schemaVersion: 1, artifactSetId: authored.manifestId, subject: config.subjectLabel, semanticKind: 'curricularAtomic', strictDescriptionReviewCompleteCount: entries.length, curriculumAtomicDenominator: historicalDenominator, descriptionReviewPercentage: Math.round(entries.length / historicalDenominator * 1000) / 10, groups: [{ groupId: manifest.batch.batchId, artifactDirectory: '.', dualSummaryPath: 'dual-summary.json', dualSummaryDigest: digest(dual.bytes), campaignGoalCount: config.goalIds.length, resolvedGoalCount: entries.length }], resolutions: entries }
  assert.deepEqual(validateLegacyResolutionIndexSnapshot(index), [])
  assert.equal(index.groups[0].campaignGoalCount, 20)
  assert.equal(index.groups[0].resolvedGoalCount, 16)
  assert.equal(index.strictDescriptionReviewCompleteCount, 16)
  files.push({ path: prefix + '/resolution-index.current-carryover-v1.json', text: bytes(index) })
  const currency = { schemaVersion: 1, artifactType: 'goal-description-current-subset-page-reuse-receipt-v1', checkedAt: checkMode ? json(prefix + '/current-carryover-v1.currency-receipt.json').checkedAt : new Date().toISOString(), currentBaseBookDigest: current.model.digest, currentStateAudit, synthesisAuthority: 'Root AI adjudication of original independent records; materializer performs structural checks only, not a new blind review', materializedBy: 'codex-physics-b038r-blind-b', underlyingModelIdentifier: 'not exposed', grantsBatchCompletion: false, grantsProgress: false, currentCanonicalLandscapeDigest: digest(landscapeBytes), originalBatchConfigPath: prefix + '.config.json', originalBatchConfigDigest: digest(read(prefix + '.config.json')), originalBookModelDigest: digest(read(prefix + '/bundle/book-model.json')), deterministicSynthesisTimestamp: synthesizedAt, timestampMeaning: 'Compatibility-contract timestamp: exactly one second after latest completed original run, not the actual later synthesis execution time. checkedAt records the observed current-state synthesis audit.', snapshotDenominatorAuthority: 'Legacy V1 partial-campaign compatibility only: curriculumAtomicDenominator is the original manifest curriculumAtomicDenominatorAtPreparation, not a live denominator. The central five-gate report remains sole live progress authority.', sourceArtifacts: [...sourceBytesBefore].map(([path, data]) => ({ path, sha256: digest(data) })), decision: 'Reuse exact original independent review records only for byte-equivalent current subset pages; no rebinding or fresh-review claim.', reusedGoalIds: [...goalSet], notReusedGoalIds: config.goalIds.filter((id: string) => !goalSet.has(id)), checkedFields: 'Every subset page field, both validated full campaigns, both rounds exact bilingual canonical text and canonical context, goal/page fingerprints and image bindings, selected synthesis manifest and strict resolution validators.', explicitHolds, outsideOriginalCampaign: [{ goalId: newMomentGoalId, reason: 'New independent moment goal; absent from original 20 and never covered by this carryover.' }], currentAtomicGoalCountObserved: current.model.pages.length, eligibilityPolicy: 'Carryover requires all native structural/current-page checks, KEEP in both original rounds, explicit root selection, and no fachlicher hold. Byte equality never overrides an explicit pending-image hold.', grantsHumanAuthority: false }
  files.push({ path: prefix + '/current-carryover-v1.currency-receipt.json', text: bytes(currency) })
  assert.deepEqual(read(dual.prepared.manifest.source.landscapePath), landscapeBytes, 'Canonical bytes changed during emission')
  for (const [path, data] of sourceBytesBefore) assert.deepEqual(read(path), data, 'Source artifact changed during emission: ' + path)
  for (const [path, data] of currentImageBytes) assert.deepEqual(read(path), data, 'Current image bytes changed during emission: ' + path)
  if (checkMode) {
    for (const file of files) assert.equal(read(file.path).toString(), file.text, 'Current carryover artifact differs: ' + file.path)
    console.log(JSON.stringify({ checked: files.length, strictDescriptionCompleteCount: entries.length, campaignGoalCount: config.goalIds.length, currentStateAudit, synthesizedAt, historicalDenominator, grantsProgress: false, grantsHumanAuthority: false, grantsBatchCompletion: false }))
    return
  }
  for (const file of files) assert.equal(existsSync(file.path), false, 'Refuse overwriting existing artifact: ' + file.path)
  const patch = '*** Begin Patch\n' + files.map(f => `*** Add File: ${resolve(f.path)}\n` + f.text.trimEnd().split('\n').map(l => '+' + l).join('\n') + '\n').join('') + '*** End Patch'
  console.log(JSON.stringify({ patch, summary: { selected: entries.map(e => e.goalId), files: files.length, indexPath: prefix + '/resolution-index.current-carryover-v1.json' } }))
}
void main()
