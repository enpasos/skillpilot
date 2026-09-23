// Read-only native-materializer wrapper. Emits an apply_patch input, never writes
// historical reviews, central registries, canonical goals or existing outputs.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadGoalBookBuildInputs, stableGoalBookJson, GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION } from '../../../../../../../../../app/scripts/goalBookModel'
import { buildGoalDescriptionRolloutSubsetModel, materializeGoalDescriptionRolloutBatchDualSummary } from '../../../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
import { buildGoalDescriptionDualRoundResolution, extractGoalDescriptionDualRoundResolutionSource, validateGoalDescriptionDualRoundResolution } from '../../../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import { fingerprintGoalForEvidence } from '../../../../../../../../../app/scripts/goalEvidenceProfileModel'
import { validateLegacyResolutionIndexSnapshot } from '../../../../../../../../../app/scripts/reportDeepUnderstandingRollout'
import { buildGoalDescriptionRolloutSynthesisRoundBinding, fingerprintGoalDescriptionRolloutSynthesisDecisionManifest, validateGoalDescriptionRolloutSynthesisDecisionManifest } from '../../../../../../../../../app/scripts/validateGoalDescriptionRolloutSynthesisDecisionManifest'
import { buildGoalDescriptionRolloutResolutionSynthesis } from '../../../../../../../../../app/scripts/goalDescriptionRolloutResolutionSynthesis'

const repo = resolve(fileURLToPath(new URL('../../../../../../../../../', import.meta.url)))
const output = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-21/m7-extended-integration-informed-keep-1-v1'
const source = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-07/batch-041-integral-applications-10-v1'
const positiveSource = 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-041-integral-applications-8-v1'
const goalId = '0d21097c-09bf-5375-8c56-34ce8dc5bc35'
const read = (path: string) => readFileSync(resolve(repo, path))
const json = (path: string) => JSON.parse(read(path).toString())
const digest = (value: Buffer | string): `sha256:${string}` => `sha256:${createHash('sha256').update(value).digest('hex')}`
const text = (value: unknown) => JSON.stringify(value, null, 2) + '\n'

async function main() {
  const check = process.argv.includes('--check')
  assert.ok(process.argv.slice(2).every(arg => arg === '--check'))
  const authored = json(output + '/adjudication.json')
  assert.equal(authored.goalId, goalId)
  assert.equal(authored.decision, 'keep_current')
  assert.equal(authored.newIndependentReviewRound, false)
  const config = json(source + '.config.json')
  const dual = await materializeGoalDescriptionRolloutBatchDualSummary(resolve(repo, source + '.config.json'), false)
  const current = await loadGoalBookBuildInputs(resolve(repo, config.baseGoalBookConfigPath))
  const landscapePath = dual.prepared.manifest.source.landscapePath
  const landscapeBytes = read(landscapePath)
  const landscape = JSON.parse(landscapeBytes.toString())
  assert.equal(current.model.source.landscapeDigest, digest(stableGoalBookJson(landscape)))
  const subset = buildGoalDescriptionRolloutSubsetModel({ baseModel: current.model, goalIds: config.goalIds, bookId: config.bookId, title: config.title })
  const currentPage = subset.pages.find(page => page.goalId === goalId)
  const historicalPage = json(source + '/bundle/book-model.json').pages.find((page: any) => page.goalId === goalId)
  assert.ok(currentPage && historicalPage)
  assert.equal(stableGoalBookJson(currentPage), stableGoalBookJson(historicalPage), 'STOP: current target page differs; no hash-only review rebinding')
  const canonical = landscape.goals.find((goal: any) => goal.id === goalId)
  assert.ok(canonical)
  const first = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.first, goalId, label: 'First' })
  const second = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.second, goalId, label: 'Second' })
  assert.deepEqual([...first.errors, ...second.errors], [])
  assert.ok(first.source?.record && second.source?.record)
  assert.equal(first.source.decision, 'keep')
  assert.equal(second.source.decision, 'revise')
  const canonicalFingerprint = fingerprintGoalForEvidence(canonical, GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION, 'curricularAtomic')
  for (const round of [dual.first, dual.second]) {
    const input = round.input.goals.find(goal => goal.goalId === goalId)!
    assert.equal(stableGoalBookJson(input.canonicalContext), stableGoalBookJson(buildGoalDescriptionCanonicalContext(canonical)))
    assert.equal(input.goalFingerprint, canonicalFingerprint)
    assert.equal(input.pageFingerprint, currentPage.pageFingerprint)
    assert.deepEqual([input.currentTitleDe, input.currentTitleEn, input.currentDescriptionDe, input.currentDescriptionEn], [canonical.title, canonical.titleEn, canonical.description, canonical.descriptionEn])
  }
  const assetPath = 'app/public' + currentPage.visualization!.url
  assert.equal(digest(read(assetPath)), currentPage.visualization!.originalDigest)
  const synthesizedAt = new Date(Math.max(...[...dual.first.resultPairs, ...dual.second.resultPairs].map(({ run }) => Date.parse(run.completedAt))) + 1000).toISOString()
  const inputGoal = dual.first.input.goals.find(goal => goal.goalId === goalId)!
  const expectedGoal = {
    goalId,
    effectiveSemanticKind: 'curricularAtomic' as const,
    goalFingerprint: inputGoal.goalFingerprint as `sha256:${string}`,
    pageFingerprint: inputGoal.pageFingerprint as `sha256:${string}`,
    goalReviewContextFingerprint: first.source.binding.goalReviewContextFingerprint,
    finalText: { titleDe: canonical.title, titleEn: canonical.titleEn, descriptionDe: canonical.description, descriptionEn: canonical.descriptionEn },
    firstSource: first.source,
    secondSource: second.source,
  }
  // The persisted manifest records the authoring snapshot of the whole landscape.
  // Unrelated later edits must not rewrite that history. Fresh target-page and
  // canonical-context checks above still fail closed for any relevant change.
  const historicalManifest = check ? json(output + '/synthesis-decisions.json') : null
  const expected = {
    batch: { batchId: config.batchId, batchManifestDigest: digest(read(source + '/batch-manifest.json')), configDigest: dual.prepared.manifest.configDigest, bundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint, bookDigest: dual.first.input.bookDigest as `sha256:${string}`, reviewInputFingerprint: dual.first.input.reviewInputFingerprint as `sha256:${string}`, dualSummaryDigest: digest(dual.bytes), canonicalLandscapeDigest: historicalManifest?.batch.canonicalLandscapeDigest ?? digest(landscapeBytes) },
    rounds: { first: buildGoalDescriptionRolloutSynthesisRoundBinding(first.source.binding, dual.prepared.manifest.artifacts.rounds.first.batchInputFingerprint), second: buildGoalDescriptionRolloutSynthesisRoundBinding(second.source.binding, dual.prepared.manifest.artifacts.rounds.second.batchInputFingerprint) },
    synthesizedAt,
    goals: [expectedGoal],
  }
  const manifestPayload = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json' as const,
    schemaVersion: 1 as const,
    synthesisContract: 'goal-description-rollout-synthesis-decision-v1' as const,
    manifestId: authored.adjudicationId,
    authority: 'ai_synthesis' as const,
    synthesizedBy: authored.reviewer,
    synthesizedAt,
    batch: expected.batch,
    rounds: expected.rounds,
    decisions: [{
      decisionId: authored.adjudicationId + '-decision',
      goalId,
      effectiveSemanticKind: expectedGoal.effectiveSemanticKind,
      goalFingerprint: expectedGoal.goalFingerprint,
      pageFingerprint: expectedGoal.pageFingerprint,
      goalReviewContextFingerprint: expectedGoal.goalReviewContextFingerprint,
      finalText: expectedGoal.finalText,
      resolutionDecision: 'keep_current' as const,
      evidenceRound: 'second' as const,
      records: { first: { recordId: first.source.binding.recordId, recordDigest: first.source.binding.recordDigest }, second: { recordId: second.source.binding.recordId, recordDigest: second.source.binding.recordDigest } },
      revisionDissent: { sourceRound: 'second' as const, disposition: 'rejected_keep_current' as const, proposedDescriptionDe: second.source.record.proposedDescriptionDe!, proposedDescriptionEn: second.source.record.proposedDescriptionEn!, rationaleDe: authored.dissentDispositionDe, rationaleEn: authored.dissentDispositionEn },
      rationaleDe: authored.rationaleDe,
      rationaleEn: authored.rationaleEn,
    }],
  }
  const manifest = { ...manifestPayload, manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(manifestPayload) }
  const manifestValidation = await validateGoalDescriptionRolloutSynthesisDecisionManifest({ manifest, expected })
  assert.deepEqual(manifestValidation.errors, [])
  const manifestPath = 'synthesis-decisions.json'
  const manifestBytes = Buffer.from(text(manifest))
  const resolution = buildGoalDescriptionDualRoundResolution({
    resolutionId: authored.adjudicationId,
    goalId,
    effectiveSemanticKind: 'curricularAtomic',
    decision: 'keep_current',
    currentInput: dual.first.input,
    dualSummaryBytes: dual.bytes,
    firstSource: first.source,
    secondSource: second.source,
    synthesis: buildGoalDescriptionRolloutResolutionSynthesis({ batchId: config.batchId, manifest, decision: manifest.decisions[0], summaryGoal: dual.summary.goals.find(goal => goal.goalId === goalId)!, firstSource: first.source, secondSource: second.source }),
    synthesisDecisionManifest: { contract: manifest.synthesisContract, manifestPath, manifestId: manifest.manifestId, manifestDigest: digest(manifestBytes), manifestFingerprint: manifest.manifestFingerprint, decisionId: manifest.decisions[0].decisionId },
  })
  const validation = await validateGoalDescriptionDualRoundResolution({ resolution, dualSummary: dual.summary, dualSummaryBytes: dual.bytes, currentInput: dual.first.input, landscape, first: dual.first, second: dual.second, synthesisDecisionManifestArtifact: { manifest, manifestBytes, manifestPath } })
  assert.deepEqual(validation.errors, [])
  assert.equal(validation.strictDescriptionComplete, true)
  const resolutionPath = `resolutions/${goalId}.resolution.json`
  const sourceRelative = relative(resolve(repo, output), resolve(repo, source)).split('\\').join('/')
  const index = {
    schemaVersion: 1,
    artifactSetId: authored.adjudicationId,
    subject: 'Mathematik',
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: 1,
    curriculumAtomicDenominator: dual.prepared.manifest.curriculumAtomicDenominatorAtPreparation,
    descriptionReviewPercentage: Math.round(1000 / dual.prepared.manifest.curriculumAtomicDenominatorAtPreparation) / 10,
    groups: [{ groupId: config.batchId, artifactDirectory: sourceRelative, dualSummaryPath: sourceRelative + '/dual-summary.json', dualSummaryDigest: digest(dual.bytes), campaignGoalCount: config.goalIds.length, resolvedGoalCount: 1 }],
    resolutions: [{ goalId, titleDe: canonical.title, groupId: config.batchId, decision: 'keep_current', resolutionPath, resolutionDigest: digest(text(resolution)), resolutionFingerprint: resolution.resolutionFingerprint, strictDescriptionComplete: true }],
  }
  assert.deepEqual(validateLegacyResolutionIndexSnapshot(index), [])
  const oldCandidates = json(positiveSource + '.candidates.json')
  const oldCandidate = oldCandidates.goals.find((goal: any) => goal.goalId === goalId)
  assert.ok(oldCandidate)
  const reviewId = 'canonical-math-positive-evidence-extended-integration-informed-20260921-v1'
  const candidates = {
    ...oldCandidates,
    reviewId,
    reviewedAt: '2026-09-21T21:36:38.000Z',
    reviewer: authored.reviewer,
    goals: [{ ...oldCandidate, reason: 'Informiert wiederverwendeter B041-Autorenbody nach gezielter Prüfung von Rechnungen, DE/EN, Definitionsintervallen, a=0, Bildabstand und eigenständigem Transfer; siehe adjudication.json. Keine neue Autorenleistung, keine beobachtete Lernendenleistung und keine menschliche Freigabe behauptet.' }],
  }
  assert.equal(stableGoalBookJson(candidates.goals[0].profile), stableGoalBookJson(oldCandidate.profile))
  const positiveConfig = {
    ...json(positiveSource + '.config.json'),
    reviewId,
    reviewPath: output + '/positive-evidence.review.jsonl',
    reviewedResourceTypes: ['goal-visualization'],
    scope: { label: 'Ein unverändertes LK-Integrationsregel-Ziel; informierte D-Adjudikation und gezielt wiederverwendeter P-Body, AI-Kandidat.', goalIds: [goalId] },
  }
  const sourcePaths = [source + '.config.json', source + '/batch-manifest.json', source + '/dual-summary.json', output + '/adjudication.json', positiveSource + '.candidates.json', assetPath]
  const receipt = {
    schemaVersion: 1,
    artifactType: 'informed-current-goal-description-reuse-and-positive-evidence-v1',
    actualReviewDate: authored.actualReviewDate,
    reviewer: authored.reviewer,
    goalId,
    currentCanonicalLandscapeDigestAtMaterialization: digest(landscapeBytes),
    currentBaseBookDigest: current.model.digest,
    sourceArtifacts: sourcePaths.map(path => ({ path, digest: digest(read(path)) })),
    historicalReviewSources: { first: first.source.binding, second: second.source.binding },
    sourceDecisions: { first: first.source.decision, second: second.source.decision },
    currentBindingChecks: { bilingualTextEqual: true, canonicalContextEqual: true, fullNativeSubsetPageEqual: true, goalFingerprintEqual: true, pageFingerprintEqual: true, imageBytesEqual: true, bothHistoricalCampaignsNativelyValidated: true },
    goalFingerprint: canonicalFingerprint,
    pageFingerprint: currentPage.pageFingerprint,
    originalPositiveProfileBodyDigest: digest(stableGoalBookJson(oldCandidate.profile)),
    copiedPositiveProfileBodyDigest: digest(stableGoalBookJson(candidates.goals[0].profile)),
    sourceReconciliation: 'Existing canonical sourceRef and source extraction: HE KC2024 Q1.1 p36 bullet6 aspects affine rational powers and f-prime times exp(f), LK. No general substitution or further integration method added.',
    sourceAndScopeLimitation: 'The existing compiled applicability projection is preserved exactly; this is not a new cross-state mapping or course-profile audit.',
    nativeDescriptionValidation: { errors: validation.errors, strictDescriptionComplete: validation.strictDescriptionComplete },
    positiveEvidenceValidation: 'Run native positive-evidence materializer write/check separately; this receipt does not claim those runs have already occurred.',
    indexFormat: 'Supported V1 partial-campaign compatibility; historical denominator is metadata, not live progress. Existing B041 rounds are referenced, not copied or relabelled.',
    deterministicSynthesisTimestamp: synthesizedAt,
    timestampMeaning: 'One second after the last historical review run for compatibility, not the actual adjudication time; actualReviewDate records this later informed decision.',
    newIndependentReviewRound: false,
    historicalArtifactsChanged: false,
    canonicalChanged: false,
    registryChanged: false,
    ledgerChanged: false,
    grantsCentralProgress: false,
    grantsHumanApproval: false,
  }
  assert.equal(digest(read(landscapePath)), digest(landscapeBytes), 'Canonical changed during native materialization; retry at stable point')
  const files = [
    { path: output + '/' + manifestPath, content: manifestBytes.toString() },
    { path: output + '/' + resolutionPath, content: text(resolution) },
    { path: output + '/resolution-index.json', content: text(index) },
    { path: output + '/positive-evidence.config.json', content: text(positiveConfig) },
    { path: output + '/positive-evidence.candidates.json', content: text(candidates) },
    { path: output + '/current-bindings.receipt.json', content: text(receipt) },
  ]
  if (check) {
    for (const file of files.filter(file => !file.path.endsWith('current-bindings.receipt.json'))) assert.equal(read(file.path).toString(), file.content, `${file.path}: generated output drift`)
    console.log(JSON.stringify({ currentNativeDescriptionValidation: validation, currentTargetPageUnchanged: true, positiveBodyUnchanged: true, historicalReviewsUnchanged: true, centralWrites: false }, null, 2))
  } else {
    files.forEach(file => assert.equal(existsSync(resolve(repo, file.path)), false, `Refusing overwrite: ${file.path}`))
    console.log('*** Begin Patch\n' + files.map(file => `*** Add File: ${resolve(repo, file.path)}\n${file.content.trimEnd().split('\n').map(line => '+' + line).join('\n')}\n`).join('') + '*** End Patch')
  }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
