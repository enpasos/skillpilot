// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import { buildGoalBookModel, fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel'

const own = dirname(fileURLToPath(import.meta.url))
const root = resolve(own, '../../../../../../..')
const lane = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
const neuro = `${lane}biologie-q2-neurobiology-twenty-one-source-p-author-remediation-v2/`
const thAuthor = `${lane}biologie-neuro-outside-fifty-two-source-restoration-author-v2/`
const hhAuthor = `${lane}biologie-neuro-hh-thirty-two-source-restoration-author-v1/`
const thA = `${lane}biologie-neuro-th-nineteen-source-restoration-independent-a-v1/`
const thB = `${lane}biologie-neuro-th-nineteen-source-restoration-independent-b-v1/`
const hhA = `${lane}biologie-neuro-hh-twenty-one-source-independent-a-v1/`
const hhB = `${lane}biologie-neuro-hh-twenty-one-source-independent-b-v1/`
const worklistPath = `${lane}biologie-neuro-outside-fifty-two-source-restoration-worklist-v1/outside52.actual-source-debt-and-view-worklist.json`
const gatePath = `${lane}chemie-current-fifteen-reviewed-active-integration-v1/current-central-five-gate.actual.report.json`
const configPath = 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
const bookConfigPath = 'app/scripts/config/goal-books/de-gym-biology-national-atlas.json'
const tracked = new Map<string, string>()
const digest = (bytes: Buffer | string) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const json = (value: any) => JSON.stringify(value, null, 2) + '\n'
const rel = (path: string) => relative(root, path)
const read = (path: string) => {
  const bytes = readFileSync(resolve(root, path)); tracked.set(path, digest(bytes)); return JSON.parse(bytes.toString())
}
const write = (name: string, value: any) => {
  const path = resolve(own, name); assert.ok(!existsSync(path), `Preserve completed own file: ${name}`)
  mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, json(value)); return rel(path)
}
const same = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b)
const foreignSeals: any[] = []
const verifySeal = (path: string, collection = 'files') => {
  const freeze = read(path); let checked = 0
  for (const binding of freeze[collection]) {
    const bytes = readFileSync(resolve(root, binding.path)); tracked.set(binding.path, digest(bytes))
    assert.equal(digest(bytes).replace('sha256:', ''), binding.sha256.replace('sha256:', ''), binding.path)
    if (binding.bytes !== undefined) assert.equal(bytes.length, binding.bytes)
    checked++
  }
  foreignSeals.push({ path, sha256: tracked.get(path), exactFiles: checked }); return freeze
}
const neuroFreeze = verifySeal(`${neuro}author-neurobiology21-source-p-v2.final.freeze.json`)
const rpFreeze = verifySeal(`${neuro}author-neurobiology21-source-p-v2.with-exact-rp-raw-source.final.freeze.json`, 'additiveFiles')
verifySeal(`${thAuthor}th-largest-partial-author-v2.final.freeze.json`)
verifySeal(`${hhAuthor}hh-thirty-two-partial-source-author-v1.final.freeze.json`)
verifySeal(`${thA}nineteen-bounded-primary-source-scope.independent-a.final.freeze.json`, 'ownFiles')
verifySeal(`${thB}independent-b-th19.final.freeze.json`)
verifySeal(`${hhA}independent-hh-partial-source-a.final.freeze.json`)
verifySeal(`${hhB}hh-twenty-one-source-independent-b-v1.final.freeze.json`)
const currentGate = read(gatePath)
assert.equal(currentGate.blockingIssueCount, 0)
const expectedStrict: Record<string, number> = { biologie: 74, chemie: 127, mathematik: 807, physik: 478 }
const protectedRows = currentGate.subjects.map((subject: any) => {
  assert.equal(subject.strictCompleteGoalIds.length, expectedStrict[subject.subject])
  assert.deepEqual(subject.issues, [])
  const landscape = read(subject.landscapePath); const goals = new Map(landscape.goals.map((goal: any) => [goal.id, goal]))
  return { subject: subject.subject, landscapePath: subject.landscapePath,
    wholeLandscapeSha256: tracked.get(subject.landscapePath), strictGoalIds: subject.strictCompleteGoalIds,
    strictWholeGoals: subject.strictCompleteGoalIds.map((goalId: string) => ({ goalId, wholeGoalSha256: digest(JSON.stringify(goals.get(goalId))) })) }
})
const rolloutConfigPath = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const rollout = read(rolloutConfigPath)
for (const subject of rollout.subjects) {
  for (const [key, value] of Object.entries(subject)) {
    if (key.endsWith('Path') && typeof value === 'string' && existsSync(resolve(root, value))) read(value)
    if (key.endsWith('Paths') && Array.isArray(value)) for (const path of value) if (typeof path === 'string') read(path)
  }
}
const reviewTHA = read(`${thA}nineteen-bounded-primary-source-scope.independent-a.actual.json`)
const reviewTHB = read(`${thB}nineteen-components.independent-b.review.json`)
const reviewHHA = read(`${hhA}twenty-one-partial-science-scope.independent-a.review.json`)
const reviewHHB = read(`${hhB}HH.twenty-one-bounded-components-and-eleven-holds.independent-b.review.json`)
assert.equal(reviewTHA.boundedVerdicts.length, 19); assert.equal(reviewTHB.records.length, 19)
assert.ok(reviewTHA.boundedVerdicts.every((row: any) => row.decision === 'KEEP_BOUNDED_SOURCE_COMPONENT'))
assert.ok(reviewTHB.records.every((row: any) => row.decision === 'KEEP'))
assert.equal(reviewHHA.rows.length, 21); assert.equal(reviewHHB.componentDecisions.length, 21)
assert.ok(reviewHHA.rows.every((row: any) => row.verdict === 'KEEP_BOUNDED_PARTIAL_COMPONENT_ONLY'))
assert.ok(reviewHHB.componentDecisions.every((row: any) => row.independentBDecision === 'ACCEPT_BOUNDED_DIRECT_PARTIAL_COMPONENT_ONLY'))
const thMapping = read(`${thAuthor}TH.nineteen-component-mappings.author-v2.candidate.json`)
const hhMapping = read(`${hhAuthor}HH.bounded-component-mappings.author-v1.candidate.json`)
const componentPairs: any[] = []
for (const [jurisdiction, mapping, aRows, bRows] of [
  ['DE-TH', thMapping, reviewTHA.boundedVerdicts, reviewTHB.records],
  ['DE-HH', hhMapping, reviewHHA.rows, reviewHHB.componentDecisions],
] as any[]) {
  for (const row of mapping.mappings) {
    const a = aRows.find((review: any) => (review.sourceComponentId ?? review.sourceComponentId) === row.legacyGoalId)
    const b = bRows.find((review: any) => (review.sourceGoalId ?? review.candidateSourceGoalId) === row.legacyGoalId)
    assert.ok(a && b, row.legacyGoalId)
    assert.equal(a.canonicalGoalId ?? a.goalId, row.canonicalGoalId)
    assert.equal(b.canonicalGoalId, row.canonicalGoalId)
    componentPairs.push({ jurisdiction, scopeKey: `${jurisdiction}/SekI/`, canonicalGoalId: row.canonicalGoalId,
      sourceGoalId: row.legacyGoalId, sourceExtractionPath: mapping.sourceExtractionPath,
      adoptedAandBDecisionsForTechnicalPreparationOnly: true,
      sourceWholeCoverage: false, targetWholeCoverage: false,
      residuals: b.additionalOrClarifiedResidualRequirementsHeldByB ?? b.boundedApprovedSourceScope,
      inheritedAuthorResiduals: b.authorResidualsPreserved ?? [],
      historicalHHWorklistIndex: b.historicalHHWorklistIndex ?? null })
  }
}
assert.equal(componentPairs.length, 40)
const thScope = read(`${thAuthor}TH.forty-three-current-goal-primary-scope.decisions.author-v2.json`)
const hhScope = read(`${hhAuthor}HH.all-thirty-two-current-goal-primary-scope.decisions.author-v1.json`)
const worklist = read(worklistPath)
for (const pair of componentPairs) assert.ok(worklist.goalViewPairs.some((row: any) => row.goalId === pair.canonicalGoalId && row.viewJurisdiction === pair.jurisdiction))
const config = read(configPath)
const bookConfig = read(bookConfigPath)
assert.equal(config.expectedCurricularAtomicGoalCount, 390)
const currentLandscape = read(config.landscapePath)
const currentKinds = read(config.semanticKindLedgerPath)
const qa = read(bookConfig.goalVisualizationQaPath)
assert.equal(currentLandscape.goals.length, 472)
assert.equal(currentKinds.decisions.filter((row: any) => row.semanticKind === 'curricularAtomic').length, 390)
const oldBefore = read(`${neuro}canonical.current464.baseline.snapshot.json`)
const oldAfter = read(`${neuro}canonical.current464.author-v2.candidate.json`)
const selectedIds = new Set<string>(neuroFreeze.selectedGoalIds)
assert.equal(selectedIds.size, 21)
const beforeGoals = new Map(oldBefore.goals.map((goal: any) => [goal.id, goal]))
const afterGoals = new Map(oldAfter.goals.map((goal: any) => [goal.id, goal]))
const overlayLandscape = structuredClone(currentLandscape)
overlayLandscape.goals = overlayLandscape.goals.map((goal: any) => {
  if (!selectedIds.has(goal.id)) return goal
  assert.deepEqual(goal, beforeGoals.get(goal.id), `Current selected goal changed since frozen source overlay: ${goal.id}`)
  const next: any = afterGoals.get(goal.id)
  assert.deepEqual(next.requires, goal.requires); assert.deepEqual(next.contains, goal.contains)
  return structuredClone(next)
})
const overlayGoals = new Map<string, any>(overlayLandscape.goals.map((goal: any) => [goal.id, goal]))
const protectedBio = protectedRows.find((row: any) => row.subject === 'biologie')
assert.ok(protectedBio.strictGoalIds.every((goalId: string) => !selectedIds.has(goalId)))
for (const row of protectedBio.strictWholeGoals) assert.equal(digest(JSON.stringify(overlayGoals.get(row.goalId))), row.wholeGoalSha256)
const overlayKinds = structuredClone(currentKinds)
const kindChanges: any[] = []
for (const decision of overlayKinds.decisions) {
  const fingerprint = fingerprintSemanticKindSourceGoal(overlayGoals.get(decision.goalId))
  if (fingerprint !== decision.sourceFingerprint) {
    assert.ok(selectedIds.has(decision.goalId)); kindChanges.push({ goalId: decision.goalId,
      originalSourceFingerprint: decision.sourceFingerprint, candidateSourceFingerprint: fingerprint,
      semanticKindPreserved: decision.semanticKind, scientificReviewPromoted: false }); decision.sourceFingerprint = fingerprint
  }
}
write('current472-neuro21-overlay.canonical.candidate.json', overlayLandscape)
write('current390-neuro21-overlay.semantic-kinds.technical-candidate.json', overlayKinds)
write('current-kind-fingerprint-technical-deltas.json', kindChanges)
const baseline = buildGoalBookSourceAtlasInputs(config, root)
for (const binding of baseline.receipt.inputBindings) if (existsSync(resolve(root, binding.path))) {
  const bytes = readFileSync(resolve(root, binding.path)); assert.equal(digest(bytes), binding.sha256); tracked.set(binding.path, binding.sha256)
}
const sourceDeltas = read(`${neuro}source-candidate-files.actual.exact-deltas.json`)
const shadow = resolve(own, '.native-input-cache')
assert.ok(!existsSync(shadow)); mkdirSync(shadow)
const sourceSnapshots = new Set(config.sourceDocumentSnapshots.map((row: any) => row.path))
const shadowWrite = (path: string, bytes: Buffer | string) => {
  const output = resolve(shadow, path); assert.ok(output.startsWith(shadow + '/')); mkdirSync(dirname(output), { recursive: true }); writeFileSync(output, bytes)
}
for (const binding of baseline.receipt.inputBindings) {
  if (sourceSnapshots.has(binding.path)) continue
  shadowWrite(binding.path, readFileSync(resolve(root, binding.path)))
}
shadowWrite(config.landscapePath, json(overlayLandscape)); shadowWrite(config.semanticKindLedgerPath, json(overlayKinds))
const effectiveSourceOverrides: any[] = []
for (const entry of sourceDeltas.files) {
  const originalBytes = readFileSync(resolve(root, entry.originalPath)); tracked.set(entry.originalPath, digest(originalBytes))
  assert.equal(digest(originalBytes).replace('sha256:', ''), entry.originalSha256)
  let candidatePath = entry.candidatePath
  const override = rpFreeze.finalEffectiveInputOverrides.find((row: any) => row.originalInputPath === entry.originalPath)
  if (override) candidatePath = override.effectiveCandidatePath
  const candidateBytes = readFileSync(resolve(root, candidatePath)); tracked.set(candidatePath, digest(candidateBytes))
  shadowWrite(entry.originalPath, candidateBytes)
  effectiveSourceOverrides.push({ originalPath: entry.originalPath, effectiveCandidatePath: candidatePath,
    currentOriginalSha256: digest(originalBytes), effectiveCandidateSha256: digest(candidateBytes),
    originalAndCandidateBytesPreserved: true })
}
const adoptedMappingPaths: string[] = []
for (const [jurisdiction, originalMapping, aPath, bPath] of [
  ['DE-TH', thMapping, `${thA}nineteen-bounded-primary-source-scope.independent-a.actual.json`, `${thB}nineteen-components.independent-b.review.json`],
  ['DE-HH', hhMapping, `${hhA}twenty-one-partial-science-scope.independent-a.review.json`, `${hhB}HH.twenty-one-bounded-components-and-eleven-holds.independent-b.review.json`],
] as any[]) {
  const adopted = structuredClone(originalMapping)
  adopted.reviewStatus = 'two_independent_bounded_source_reviews_completed_technical_overlay_candidate_only'
  adopted.technicalPreparation = { aReview: aPath, bReview: bPath, wholeSourceApproval: false,
    wholeCanonicalGoalApproval: false, activeWrites: false, scope: `${jurisdiction}/SekI/` }
  for (const decision of adopted.decisions) {
    const pair = componentPairs.find(row => row.jurisdiction === jurisdiction && row.sourceGoalId === decision.sourceGoalId)
    assert.ok(pair); decision.independentReviewStatus = 'accepted_bounded_partial_component_by_separate_A_and_B'
    decision.technicalResidualBoundary = pair.residuals
    decision.wholeOriginalSourceCoverage = false; decision.wholeCanonicalGoalCoverage = false
  }
  const path = write(`${jurisdiction}.forty-component-reviewed.technical-mapping.candidate.json`, adopted)
  adoptedMappingPaths.push(path); shadowWrite(path, json(adopted))
  const sourceBytes = readFileSync(resolve(root, adopted.sourceExtractionPath)); tracked.set(adopted.sourceExtractionPath, digest(sourceBytes))
  shadowWrite(adopted.sourceExtractionPath, sourceBytes)
}
const attempts: any[] = []
const compile = (name: string, selectedConfig: any) => {
  let result: ReturnType<typeof buildGoalBookSourceAtlasInputs>
  try { result = buildGoalBookSourceAtlasInputs(selectedConfig, shadow); attempts.push({ phase: name,
    originalCurrent390Contract: 'PASS', expected: selectedConfig.expectedCurricularAtomicGoalCount }) }
  catch (error: any) {
    attempts.push({ phase: name, originalCurrent390Contract: 'FAIL', message: error.message, expected: error.expected, actual: error.actual })
    write(`${name}.original390-contract.actual.failure.json`, attempts.at(-1))
    assert.ok(error.message.includes('Source-supported atlas goal count changed') && Number.isInteger(error.actual), error.message)
    result = buildGoalBookSourceAtlasInputs({ ...selectedConfig, expectedCurricularAtomicGoalCount: error.actual }, shadow)
    attempts.push({ phase: name, explicitReducedUnionDiagnosticOnly: 'PASS', diagnosticCount: error.actual,
      original390ContractStillFail: true, scientificApproval: false })
  }
  write(`${name}.source-atlas.actual.receipt.json`, result.receipt); return result
}
const hold = compile('neuro21-hold-overlay', config)
const combined = compile('neuro21-hold-plus-reviewed40', { ...config, mappingPaths: [...config.mappingPaths, ...adoptedMappingPaths] })
const modelAssets: Record<string, string> = {}
for (const record of qa.records) if (record.visualizationState === 'available') {
  assert.equal(record.publicAssetPath, `app/public${record.imageUrl}`)
  const bytes = readFileSync(resolve(root, record.publicAssetPath)); tracked.set(record.publicAssetPath, digest(bytes))
  modelAssets[record.imageUrl] = digest(bytes)
}
const models = new Map<string, any>()
const buildModel = (name: string, result: ReturnType<typeof buildGoalBookSourceAtlasInputs>, landscape: any, kinds: any, atlas: boolean) => {
  const get = (path: string) => JSON.parse(result.outputs[path])
  const manifest = get(config.manifestPath)
  const raw = { landscape, semanticKindLedger: kinds, goalVisualizationQa: qa, goalVisualizationAssetDigests: modelAssets,
    evidenceReviewSources: [], config: { ...bookConfig, ...(atlas ? {} : { compositionViewManifestPath: undefined,
      compositionViewPath: 'app/scripts/config/goal-books/technical-current390-full-catalogue.view.json' }) } }
  const model = buildGoalBookModel(atlas ? { ...raw, compositionViewManifest: manifest,
    compositionViewSources: manifest.sourcePaths.map((path: string) => ({ path, view: get(path) })),
    navigationView: get(config.navigationViewPath), durationModelPolicy: read(config.durationModelPolicyPath) }
    : { ...raw, compositionView: { viewFormatVersion: '1.0', viewId: 'technical-current390-full-catalogue',
      landscapeId: landscape.landscapeId, language: 'de-DE', title: 'Biologie current390 inactive technical full catalogue',
      scope: { schoolForm: 'Gymnasium', stage: 'CrossStage' }, rootNodes: [{ kind: 'canonicalSubtree',
        goalId: landscape.goals.find((goal: any) => goal.tags?.includes('root')).id }] } })
  write(`${name}.actual.book-model.json`, model); models.set(name, model); return model
}
buildModel('baseline-current390-source-atlas', baseline, currentLandscape, currentKinds, true)
buildModel('neuro21-hold-overlay-source-atlas', hold, overlayLandscape, overlayKinds, true)
buildModel('neuro21-hold-plus-reviewed40-source-atlas', combined, overlayLandscape, overlayKinds, true)
buildModel('baseline-current390-full-catalogue', baseline, currentLandscape, currentKinds, false)
buildModel('neuro21-hold-plus-reviewed40-full-catalogue', combined, overlayLandscape, overlayKinds, false)
const scoped = (result: typeof baseline) => new Map(result.receipt.scopes.map(scope => [scope.key, scope]))
const beforeScopes = scoped(baseline), holdScopes = scoped(hold), afterScopes = scoped(combined)
assert.deepEqual([...afterScopes.keys()], [...beforeScopes.keys()])
const scopeDeltas: any[] = []
const actualRestoredPairs: any[] = []
const actualResidualLostPairs: any[] = []
for (const [key, before] of beforeScopes) {
  const held = holdScopes.get(key)!, after = afterScopes.get(key)!
  const removedByHold = before.goalIds.filter(id => !held.goalIds.includes(id))
  const restored = removedByHold.filter(id => after.goalIds.includes(id))
  const remaining = before.goalIds.filter(id => !after.goalIds.includes(id))
  const additions = after.goalIds.filter(id => !before.goalIds.includes(id))
  const additionsAlreadyInOriginalHoldOverlay = held.goalIds.filter(id => !before.goalIds.includes(id))
  assert.deepEqual(additions, additionsAlreadyInOriginalHoldOverlay,
    `Reviewed40 must not add targets beyond the actual historical overlay: ${key}`)
  for (const goalId of restored) actualRestoredPairs.push({ scopeKey: key, goalId })
  for (const goalId of remaining) actualResidualLostPairs.push({ scopeKey: key, goalId,
    isCurrent21: selectedIds.has(goalId), sourceDebtRetained: true })
  scopeDeltas.push({ key, baselineOrderedTargetIds: before.goalIds, holdOrderedTargetIds: held.goalIds,
    reviewed40OrderedTargetIds: after.goalIds, removedByHold, restoredOnlyByReviewed40: restored,
    remainingLostIds: remaining, addedVsCurrentBaseline: additions,
    additionsAlreadyInOriginalHoldOverlay,
    sourceStageCourseOrWholeRoutineApprovalOfAddedTargets: false })
}
const componentWitnesses = combined.receipt.scopes.flatMap(scope => scope.witnesses.filter(witness => adoptedMappingPaths.includes(witness.mappingPath))
  .map(witness => ({ scopeKey: scope.key, ...witness })))
assert.equal(componentWitnesses.length, 40)
assert.ok(componentWitnesses.every(row => ['DE-TH/SekI/', 'DE-HH/SekI/'].includes(row.scopeKey)
  && row.coverage === 'direct' && row.goalId === row.mappedTargetGoalId && row.profileBasis === 'source-metadata'))
for (const pair of componentPairs) assert.ok(componentWitnesses.some(row => row.scopeKey === pair.scopeKey && row.goalId === pair.canonicalGoalId && row.sourceGoalId === pair.sourceGoalId))
const baseAtlasPages = new Map<string, any>(models.get('baseline-current390-source-atlas').pages.map((page: any) => [page.goalId, page]))
const afterAtlasPages = new Map<string, any>(models.get('neuro21-hold-plus-reviewed40-source-atlas').pages.map((page: any) => [page.goalId, page]))
const baseFullPages = new Map<string, any>(models.get('baseline-current390-full-catalogue').pages.map((page: any) => [page.goalId, page]))
const afterFullPages = new Map<string, any>(models.get('neuro21-hold-plus-reviewed40-full-catalogue').pages.map((page: any) => [page.goalId, page]))
const pageDeltas: any[] = []
for (const [goalId, before] of baseAtlasPages) {
  const after = afterAtlasPages.get(goalId)
  if (!after || !same(before, after)) pageDeltas.push({ goalId, currentTitle: before.title,
    protectedCurrentStrict74: protectedBio.strictGoalIds.includes(goalId), before, after: after ?? null,
    changedFields: after ? Object.keys(before).filter(key => !same(before[key], after[key])) : ['PAGE_OMITTED'],
    noWholeGoalScopeOrScientificApproval: true })
}
const protectedPageChecks = protectedBio.strictGoalIds.map((goalId: string) => ({ goalId,
  canonicalWholeGoalExact: true, fullCatalogueWholePageExact: same(baseFullPages.get(goalId), afterFullPages.get(goalId)),
  presentInBaselineAtlas: baseAtlasPages.has(goalId), presentInCandidateAtlas: afterAtlasPages.has(goalId),
  atlasWholePageExact: same(baseAtlasPages.get(goalId), afterAtlasPages.get(goalId)),
  baselineFullPageFingerprint: baseFullPages.get(goalId)?.pageFingerprint,
  candidateFullPageFingerprint: afterFullPages.get(goalId)?.pageFingerprint }))
assert.ok(protectedPageChecks.every((row: any) => row.canonicalWholeGoalExact && row.fullCatalogueWholePageExact && row.presentInCandidateAtlas))
const historicalOutside = worklist.goalViewPairs
const outsideRestored = actualRestoredPairs.filter(pair => historicalOutside.some((row: any) => row.goalId === pair.goalId && row.lostViewKey === pair.scopeKey))
const freshDebtWorklist = actualResidualLostPairs.map(pair => ({ ...pair,
  historicalOutside52Pair: historicalOutside.some((row: any) => row.goalId === pair.goalId && (row.lostViewKey ?? `${row.viewJurisdiction}/${row.viewStage}/${row.viewCourseProfile ?? ''}`) === pair.scopeKey),
  existingReviewedPartialComponent: componentPairs.find(row => row.canonicalGoalId === pair.goalId && row.scopeKey === pair.scopeKey) ?? null,
  nextCandidateLimit: 'Read and bind an actual assessable source subroutine; retain full target and whole-source HOLD. Do not infer animal/respiration/circulation/sense-organ details from broad concepts.' }))
const actualScopeAdditions = scopeDeltas.flatMap(scope => scope.addedVsCurrentBaseline.map((goalId: string) => ({
  scopeKey: scope.key, goalId, currentCanonicalGoal: overlayGoals.get(goalId),
  alreadyIntroducedByFrozenNeuro21OriginalBulletSuccessorMapping: true,
  wholeCanonicalRoutineApproved: false, requiresIndependentSourceAndOperatorDepthDecisionBeforeIntegration: true,
  residualBoundary: goalId === '080b10c7-f308-57ff-b067-3bd189e37fea'
    ? 'A basic nerve-conduction source clause does not by itself require fibre comparison or a performance comparison of invertebrate and vertebrate nervous systems. No animal comparison claim is approved.'
    : goalId === 'e3fb5f1d-e277-5e28-8883-45821b972607'
      ? 'A resting-potential source clause does not by itself bind all measurement-data and energetic inference requirements of the current canonical goal.'
      : 'An action-potential and conduction source clause does not by itself bind every particle-level and neural-coding requirement of the current canonical goal.',
})))
write('all22-ordered-target-lists-and-actual-overlay-deltas.json', scopeDeltas)
write('actual-page-and-applicability-context-deltas.json', pageDeltas)
write('protected-current74-full-page-and-context-checks.json', protectedPageChecks)
write('actual-residual-source-scope-debt-and-next-bounded-worklist.json', freshDebtWorklist)
write('actual-original-overlay-stage-course-additions-and-depth-holds.json', actualScopeAdditions)
write('adopted40-reviewed-component-boundaries-and-whole-holds.json', { schemaVersion: 1,
  componentPairs, TH24WholePairHolds: thScope.openCurrentGoalScopeHolds, HH11WholePairHolds: hhScope.openCurrentGoalScopeHolds,
  HH22ExplicitBoundary: reviewHHB.componentDecisions.find((row: any) => row.historicalHHWorklistIndex === 22),
  HH29ExplicitBoundary: reviewHHB.componentDecisions.find((row: any) => row.historicalHHWorklistIndex === 29),
  noWholeOriginalSourceOrCanonicalGoalApproval: true, newScienceReview: false, activeWrites: false })
write('effective-original-neuro21-source-overrides.json', effectiveSourceOverrides)
write('actual-native390-contract-attempts.json', attempts)
for (const [path, sha256] of tracked) assert.equal(digest(readFileSync(resolve(root, path))), sha256, `Concurrent current input drift: ${path}`)
write('actual-current-inputs-and-protected74-127-807-478.guard.json', { schemaVersion: 1,
  createdAtUTC: new Date().toISOString(), role: 'actual technical input preservation; no new scientific review',
  inputBindings: [...tracked].sort(([a], [b]) => a.localeCompare(b)).map(([path, sha256]) => ({ path, sha256 })),
  foreignSeals, protectedSubjects: protectedRows, allActualCurrentInputHashesRecheckedAfterRun: true,
  allCurrentStrictCanonicalWholeGoalsExact: true, activeWrites: false, gitMutation: false })
const result = { schemaVersion: 1, createdAtUTC: new Date().toISOString(),
  role: 'current390 native source HOLD overlay plus 40 previously independently reviewed bounded components; technical preparation only',
  baselineCounts: baseline.receipt.counts, holdCounts: hold.receipt.counts, reviewed40Counts: combined.receipt.counts,
  nativeOriginalCurrent390ContractAttempts: attempts,
  fullCurrent472CanonicalNodesPreserved: true, current390SemanticKindsPreserved: true,
  all451WholeGoalsOutsideSelected21Exact: true, allRequiresAndContainsExact: true,
  all22CompleteOrderedTargetListsActuallyCompared: true, actualRestoredGoalScopePairs: actualRestoredPairs,
  sourceStageCourseAdditionsAlreadyInFrozenOriginalOverlay: actualScopeAdditions,
  actualResidualLostGoalScopePairs: actualResidualLostPairs,
  directPreviouslyReviewedTH19HH21ComponentWitnesses: componentWitnesses,
  protectedCurrentBio74: { allWholeCanonicalGoalsExact: true, allFullCatalogueWholePagesExact: true,
    allRemainInSourceAtlas: true, changedSourceAtlasWholePages: protectedPageChecks.filter((row: any) => !row.atlasWholePageExact).length },
  protectedCurrentChem127Math807Phys478: { currentWholeCanonAndBoundGateInputsExact: true, noActiveMutation: true },
  actualBookModelPages: [...models].map(([phase, model]) => ({ phase, pageCount: model.pages.length,
    orderedPageGoalIdsSha256: digest(JSON.stringify(model.pages.map((page: any) => page.goalId))) })),
  countryScopeRestorationDoesNotApproveWholeGoalDepth: true, residualTH24HH11AndComponentLimitsHeld: true,
  HH22NoDirectDrugToSenseOrganClaim: true, HH29NoSpecificCirculationPreventionClaim: true,
  noAnimalRespirationCirculationSenseOrganSubclaimsInferred: true,
  existingNeuro21EightSourceGapsAndGK2LowerComparisonCohortLimitsRemainHeld: true,
  newScientificReview: false, currentActiveStrictCounts: expectedStrict,
  newStrictCompletions: 0, restoredActiveBindings: 0, strictNetGain: 0,
  activeWrites: false, gitMutation: false, humanApproval: false, humanTrial: false,
  integrationApproved: false, original390SourceGatePass: attempts.filter(row => row.originalCurrent390Contract).every(row => row.originalCurrent390Contract === 'PASS'),
}
write('reviewed40-current390-overlay-and-bookmodel.actual.result.json', result)
rmSync(shadow, { recursive: true })
console.log(JSON.stringify({ status: 'ACTUAL_TECHNICAL_OVERLAY_COMPLETED_WITH_RECORDED_ORIGINAL_GATE_LIMITS',
  canonicalAtomic: 390, baselineAtlas: baseline.receipt.counts.publishedCurricularAtomicGoals,
  holdAtlas: hold.receipt.counts.publishedCurricularAtomicGoals, reviewed40Atlas: combined.receipt.counts.publishedCurricularAtomicGoals,
  restoredCountryGoalPairs: actualRestoredPairs.length, residualLostCountryPairs: actualResidualLostPairs.length,
  directTHHHComponentWitnesses: componentWitnesses.length, sourcePageDeltas: pageDeltas.length,
  protected74AtlasContextChanges: result.protectedCurrentBio74.changedSourceAtlasWholePages,
  integrationApproved: false, activeWrites: false, strictNetGain: 0 }))
