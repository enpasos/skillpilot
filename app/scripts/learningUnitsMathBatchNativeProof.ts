import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { atomicRelation, canonicalJson, digest, fullClosure, goalMeaning, mathCanonicalPath, type MathGoal } from './learningUnitsMathAuthoring'
import { requireNativeInventory } from './learningUnitsNativeMathInventory'
import { compactScalarArrays } from './learningUnits/compactJson'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const args = process.argv.slice(2)
const option = (flag: string, fallback: string) => { const index = args.indexOf(flag); return index < 0 ? fallback : args[index + 1] }
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const batch = read(option('--batch', 'app/scripts/config/learning-units/math-2026-11-05-batch-a.json'))
const beforePath = option('--before', 'tmp/math-learning-units/native-before-batch-a.raw.json')
const afterPath = option('--after', 'tmp/math-learning-units/native-backend.raw.json')
const before = read(beforePath); const after = read(afterPath)
requireNativeInventory(after); assert.equal(after.scopes.length, 182)
assert.deepEqual(after.plannerScopeIds, before.plannerScopeIds, 'Native planner offering denominator changed')
assert.deepEqual(after.declaredScopeIds, before.declaredScopeIds, 'Declared offering denominator changed')
assert.deepEqual(after.discoveryFailures, [], 'Native planner discovery failed')
assert.deepEqual(after.learningUnitCatalogQuarantines, {})
const originalRows = new Map<string, any>(before.scopes.map((row: any) => [row.scopeId, row]))
const expected = batch.nativeExpectation
assert.ok(expected, 'Batch needs explicit independently reviewed projection expectations')
const ordered = (ids: Iterable<string>) => [...new Set(ids)].sort()
const newQIds = Object.keys(expected.newAssessmentTargets)
const activeOffers = args.includes('--require-current-offers')
  ? read(option('--offer-binding', `curricula/${read('curricula/DE/Gymnasium/learning-units/catalog.json').currentOfferBinding.path}`)) : undefined
const offerByScope = new Map<string, any>((activeOffers?.offers ?? []).map((row: any) => [canonicalJson(row.scope), row]))
const matches = (map: Record<string, string[]>, scopeId: string) => Object.keys(map).filter(id => map[id].includes(scopeId))
const rows = after.scopes.map((row: any) => {
  const old = originalRows.get(row.scopeId); assert.ok(old)
  assert.ok(row.projectionResolved && row.prerequisiteCompilationResolved)
  const shifted = matches(expected.originalTargetToSupport, row.scopeId)
  const added = matches(expected.newAssessmentTargets, row.scopeId)
  const support = matches(expected.newAssessmentSupport, row.scopeId)
  assert.deepEqual(ordered(row.targetAtomicGoalIds), ordered([...old.targetAtomicGoalIds.filter((id: string) => !shifted.includes(id)), ...added]), `Unexpected target delta ${row.scopeId}`)
  assert.deepEqual(ordered(row.assessmentGoalIds), ordered([...old.assessmentGoalIds, ...added]), `Unexpected Q delta ${row.scopeId}`)
  assert.deepEqual(ordered(row.prerequisiteOnlyGoalIds), ordered([...old.prerequisiteOnlyGoalIds, ...shifted, ...support]), `Unexpected support-role delta ${row.scopeId}`)
  for (const key of ['recallGoalIds', 'orientationGoalIds']) assert.deepEqual(row[key], old[key], `Old ${key} changed ${row.scopeId}`)
  assert.deepEqual(Object.keys(row.duplicateVisibleGoalPaths).sort(), Object.keys(old.duplicateVisibleGoalPaths).sort(), `New duplicate visible path ${row.scopeId}`)
  assert.deepEqual(row.missingVisibleGoalIds, old.missingVisibleGoalIds, `Missing visible target ${row.scopeId}`)
  for (const id of newQIds) assert.equal(row.visibleGoalPaths[id]?.length ?? 0, added.includes(id) ? 1 : 0, `New Q must have exactly its reviewed visible path ${row.scopeId}`)
  for (const id of shifted) assert.equal(row.visibleGoalPaths[id]?.length ?? 0, 0, 'Support must not remain in learner target tree')
  const oldClosure = fullClosure(old.atomicPrerequisites); const currentClosure = fullClosure(row.atomicPrerequisites)
  for (const id of old.targetAtomicGoalIds.filter((id: string) => !shifted.includes(id))) assert.deepEqual(currentClosure[id], oldClosure[id], `Existing offered target demand changed ${row.scopeId}/${id}`)
  const ctx = row.nativeOfferContext
  assert.deepEqual(ordered(ctx.targetIds), ordered(row.targetAtomicGoalIds)); assert.deepEqual(ordered(ctx.prerequisiteOnlyIds), ordered(row.prerequisiteOnlyGoalIds))
  if (activeOffers) {
    const authored = offerByScope.get(canonicalJson(ctx.scopeKey)); assert.ok(authored, `Missing exact authored offer ${row.scopeId}`)
    const model = row.learningUnitReadModel
    assert.equal(model.offerBinding.status, 'valid', `Actual offer API unavailable ${row.scopeId}`)
    assert.equal(model.offerBinding.revision, activeOffers.revision)
    assert.deepEqual(model.offerBinding.rootContractRefs, authored.rootContractRefs, `Actual API selected different roots ${row.scopeId}`)
    assert.deepEqual(ordered(model.units.map((unit: any) => `${unit.contractId}@${unit.revision}`)),
      ordered(authored.rootContractRefs.map((ref: any) => `${ref.contractId}@${ref.revision}`)), `Unexpected unit subset inference ${row.scopeId}`)
  }
  const owned = new Set<string>(); const eligible = batch.packets.filter((packet: any) => expected.ownTargetScopes[packet.contractId].includes(row.scopeId))
  for (const packet of eligible) for (const id of packet.ownGoalIds) { assert.ok(row.targetAtomicGoalIds.includes(id)); assert.ok(!owned.has(id), `Duplicate direct owner ${row.scopeId}/${id}`); owned.add(id) }
  return { scopeId: row.scopeId, shiftedOriginalTargetIds: shifted, addedAssessmentTargetIds: added,
    addedAssessmentSupportIds: support, eligibleBatchContractIds: eligible.map((packet: any) => packet.contractId),
    retainedLegacyDuplicateGoalCount: Object.keys(row.duplicateVisibleGoalPaths).length,
    droppedUnusedPrerequisiteContextIds: Object.keys(old.atomicPrerequisites).filter(id => !(id in row.atomicPrerequisites)).sort() }
})
const baseline = JSON.parse(execFileSync('git', ['-c', 'core.trustctime=false', 'show', `${batch.baselineRef}:${mathCanonicalPath}`],
  { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })) as { goals: MathGoal[] }
const current = read(mathCanonicalPath); const currentGoals = new Map<string, MathGoal>(current.goals.map((goal: MathGoal) => [goal.id, goal]))
for (const goal of baseline.goals) assert.deepEqual(goalMeaning(currentGoals.get(goal.id)!), goalMeaning(goal), `Original fixed meaning changed ${goal.id}`)
const oldR = fullClosure(atomicRelation(baseline.goals)); const newR = fullClosure(atomicRelation(current.goals))
for (const [id, demand] of Object.entries(oldR)) assert.deepEqual(newR[id], demand, `Original full R changed ${id}`)
assert.deepEqual(ordered(current.goals.filter((goal: MathGoal) => !baseline.goals.some(old => old.id === goal.id)).map((goal: MathGoal) => goal.id)), ordered(newQIds))
assert.equal(after.nativeMapperInputSha256[mathCanonicalPath], digest(readFileSync(resolve(root, mathCanonicalPath))))
const projectionOnly = args.includes('--projection-only')
if (!projectionOnly) {
  for (const evidence of after.actualContractEvaluations as any[]) {
    assert.deepEqual(evidence.ownRecallGoalIds, [], 'This bounded proof covers the actual reviewed K-free contracts')
    assert.deepEqual(ordered(evidence.globalRecognitionAfterOwnQPass), ordered(evidence.ownOrdinaryGoalIds))
    assert.equal(evidence.ownQPassUnitResult.complete, true)
    assert.equal(evidence.onlyOrdinaryExplicitUnitResult.complete, false)
    assert.deepEqual(ordered(evidence.onlyOrdinaryExplicitUnitResult.pendingGoalIds), ordered(evidence.ownAssessmentGoalIds))
  }
  for (const packet of batch.packets) {
    const evidence = (after.actualContractEvaluations as any[]).find(row => row.contractId === packet.contractId)
    assert.ok(evidence, `Actual current catalog did not admit ${packet.contractId}`)
    assert.deepEqual(ordered(evidence.globalRecognitionAfterOwnQPass), ordered(evidence.ownOrdinaryGoalIds))
    assert.equal(evidence.ownQPassUnitResult.complete, true); assert.equal(evidence.ownQPassUnitResult.explicitTargetCount, evidence.ownAssessmentGoalIds.length)
    assert.equal(evidence.ownQPassUnitResult.recognizedTargetCount, evidence.ownOrdinaryGoalIds.length)
    assert.equal(evidence.onlyOrdinaryExplicitUnitResult.complete, false)
    assert.deepEqual(ordered(evidence.onlyOrdinaryExplicitUnitResult.pendingGoalIds), ordered(evidence.ownAssessmentGoalIds))
  }
}
const report = { schemaVersion: 1, semantics: 'actual-native-mathematics-batch-delta-proof-v1', generation: batch.generation,
  stage: projectionOnly ? 'projection-and-fixed-source-proof-before-catalog-admission' : 'actual-admitted-contracts-and-native-projection-proof',
  sourceSha256: digest(readFileSync(resolve(root, mathCanonicalPath))), scopeCount: rows.length,
  originalGoalMeaningsPreserved: baseline.goals.length, originalFullAtomicDemandClosuresPreserved: Object.keys(oldR).length,
  currentAtomicTargetUnion: new Set(after.scopes.flatMap((row: any) => row.targetAtomicGoalIds)).size,
  changedOriginalTargetScopeCount: rows.filter(row => row.shiftedOriginalTargetIds.length).length,
  newAssessmentTargetScopeCounts: Object.fromEntries(newQIds.map(id => [id, rows.filter(row => row.addedAssessmentTargetIds.includes(id)).length])),
  newAssessmentSupportScopeCounts: Object.fromEntries(newQIds.map(id => [id, rows.filter(row => row.addedAssessmentSupportIds.includes(id)).length])),
  eligibleUnitScopeCounts: Object.fromEntries(batch.packets.map((packet: any) => [packet.contractId, rows.filter(row => row.eligibleBatchContractIds.includes(packet.contractId)).length])),
  unchangedRecallOrientationAndOtherOriginalTargets: true, duplicateSelectedOwnPaths: 0,
  retainedLegacyDuplicateScopeCount: rows.filter(row => row.retainedLegacyDuplicateGoalCount).length,
  globalRecognitionAtEmptyMastery: after.globalRecognitionAtEmptyMastery,
  actualContractEvaluations: projectionOnly ? undefined : after.actualContractEvaluations,
  admittedContractCount: projectionOnly ? undefined : (after.actualContractEvaluations as any[]).length,
  actualValidCurrentOfferApiScopes: activeOffers ? rows.length : undefined,
  catalogAdmissionMeasurement: after.catalogAdmissionMeasurement,
  baselineNativeReportSha256: digest(readFileSync(resolve(root, beforePath))), currentNativeReportSha256: digest(readFileSync(resolve(root, afterPath))),
  currentNativeInputManifestSha256: digest(canonicalJson(after.nativeMapperInputSha256)), rows,
  boundary: 'Exact declared source correction and batch-only ownership proof; partial overall Mathematics. Legacy duplicate scopes and uncovered sphere A/Q masks remain open. Offer API/package/HTTP acceptance is separate.' }
assert.deepEqual(report.globalRecognitionAtEmptyMastery, [])
const output = resolve(root, option('--output', projectionOnly ? 'tmp/math-learning-units/batch-a-first-native-source-proof.json' : 'docs/dev/learning-units-mathematics-batch-a-native-proof.json'))
const serialized = `${compactScalarArrays(report)}\n`
assert.deepEqual(JSON.parse(serialized), JSON.parse(JSON.stringify(report)), 'Native proof must roundtrip as strict JSON')
mkdirSync(dirname(output), { recursive: true }); writeFileSync(output, serialized)
console.log(JSON.stringify({ stage: report.stage, scopes: report.scopeCount, oldTargetScopeCorrections: report.changedOriginalTargetScopeCount,
  qTargets: report.newAssessmentTargetScopeCounts, qSupport: report.newAssessmentSupportScopeCounts, units: report.eligibleUnitScopeCounts,
  oldMeanings: report.originalGoalMeaningsPreserved, oldFullClosures: report.originalFullAtomicDemandClosuresPreserved }))
