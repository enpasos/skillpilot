import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { canonicalJson, digest, fullClosure } from './learningUnitsMathAuthoring'
import { compactScalarArrays } from './learningUnits/compactJson'
import { requireNativeInventory } from './learningUnitsNativeMathInventory'

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const read = (path: string) => JSON.parse(readFileSync(resolve(repo, path), 'utf8'))
const baselinePath = 'tmp/math-learning-units/native-before-prism.raw.json'
const baseline = read(baselinePath)
const afterPath = 'tmp/math-learning-units/native-backend.raw.json'
const after = read(afterPath)
requireNativeInventory(after)
const config = read('app/scripts/config/learning-units/math-right-prisms-volume-surface.json')
const originalRows = new Map<string, typeof after.scopes[number]>(baseline.scopes.map((scope: { scopeId: string }) => [scope.scopeId, scope]))
assert.equal(after.scopes.length, 182)
assert.deepEqual(after.learningUnitCatalogQuarantines, {})
assert.deepEqual(after.globalRecognitionAtEmptyMastery, [])
assert.deepEqual((after.globalRecognitionAfterPrismAssessment as string[]).slice().sort(), [...config.ownOrdinaryGoalIds].sort())
assert.deepEqual(after.globalRecognitionAfterProjectionAssessment, ['3016ec37-1c2e-47db-83f5-e767923bc97e'])
const rows = after.scopes.map(scope => {
  const before = originalRows.get(scope.scopeId); assert.ok(before)
  const prismIsTarget = config.ownOrdinaryGoalIds.every((id: string) => before.targetAtomicGoalIds!.includes(id))
  assert.ok(scope.projectionResolved && scope.prerequisiteCompilationResolved)
  for (const key of ['targetAtomicGoalIds', 'assessmentGoalIds'] as const) {
    const actual = scope[key]!.filter(id => id !== config.assessmentGoalId)
    assert.deepEqual(actual, before[key], `An original ${key} changed: ${scope.scopeId}`)
    assert.equal(scope[key]!.includes(config.assessmentGoalId), prismIsTarget, `New Q appears outside the exact original mask: ${scope.scopeId}`)
  }
  for (const key of ['recallGoalIds', 'orientationGoalIds', 'prerequisiteOnlyGoalIds', 'externalSupportAtomicGoalIds'] as const) {
    assert.deepEqual(scope[key], before[key], `Existing ${key} changed: ${scope.scopeId}`)
  }
  const beforeClosure = fullClosure(before.atomicPrerequisites!)
  const afterClosure = fullClosure(scope.atomicPrerequisites!)
  for (const [id, demand] of Object.entries(beforeClosure)) assert.deepEqual(afterClosure[id], demand,
    `Original native transitive demand changed: ${scope.scopeId}/${id}`)
  const model = scope.learningUnitReadModel!
  assert.equal(model.calculationStatus, 'valid')
  const prismUnit = model.units.find(unit => unit.contractId === config.contractId)
  assert.equal(Boolean(prismUnit), prismIsTarget, `Unit visibility differs from its exact full Own target scope: ${scope.scopeId}`)
  const ownIds = model.units.flatMap(unit => unit.ownGoalIds)
  assert.equal(new Set(ownIds).size, ownIds.length, `Duplicate direct acquisition ownership in ${scope.scopeId}`)
  assert.ok(ownIds.every(id => scope.targetAtomicGoalIds!.includes(id)))
  const projectionVisibleBefore = before.learningUnitReadModel?.units.some(unit => unit.contractId === 'math-dot-product-projection')
  const projectionVisibleAfter = model.units.some(unit => unit.contractId === 'math-dot-product-projection')
  assert.equal(projectionVisibleAfter, projectionVisibleBefore, 'S2 display changed')
  assert.deepEqual(scope.duplicateVisibleGoalPaths, before.duplicateVisibleGoalPaths,
    `The new assessment introduced a duplicate visible path: ${scope.scopeId}`)
  assert.deepEqual(scope.missingVisibleGoalIds, before.missingVisibleGoalIds, `The new assessment disappeared from native navigation: ${scope.scopeId}`)
  assert.equal(scope.visibleGoalPaths?.[config.assessmentGoalId]?.length ?? 0, prismIsTarget ? 1 : 0,
    `New Q must appear exactly once in each of its 27 actual trees: ${scope.scopeId}`)
  return { scopeId: scope.scopeId, newPrismAssessmentTarget: prismIsTarget, prismUnitVisible: Boolean(prismUnit),
    existingTargetQKAndSupportPreserved: true, originalFullReachabilityPreserved: true, directAcquisitionOwnershipUnique: true,
    previousDuplicateVisibleGoalCount: Object.keys(before.duplicateVisibleGoalPaths ?? {}).length,
    actualDuplicateVisibleGoalCount: Object.keys(scope.duplicateVisibleGoalPaths ?? {}).length }
})
assert.equal(rows.filter(row => row.newPrismAssessmentTarget).length, 27)
assert.equal(rows.filter(row => !row.newPrismAssessmentTarget).length, 155)
const passModel = after.prismPassReadModelOverCanonicalMathTargets as { calculationStatus: string; units: Array<{ contractId: string; complete: boolean; targetCount: number; explicitTargetCount: number; recognizedTargetCount: number }> }
assert.equal(passModel.calculationStatus, 'valid')
const passUnit = passModel.units.find(unit => unit.contractId === config.contractId)!
assert.ok(passUnit.complete); assert.equal(passUnit.targetCount, 3); assert.equal(passUnit.explicitTargetCount, 1); assert.equal(passUnit.recognizedTargetCount, 2)
const sourcePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
assert.equal(after.nativeMapperInputSha256[sourcePath], digest(readFileSync(resolve(repo, sourcePath))))
const report = { schemaVersion: 1, proof: 'actual-182-scope-prism-target-delta-and-global-recognition',
  scopeCount: 182, newAssessmentTargetScopeCount: 27, unchangedOtherScopeCount: 155,
  originalTargetQKAndSupportChanges: 0, originalTransitiveDemandChanges: 0, duplicateOwnAcquisitionPaths: 0,
  addedAssessmentGoalIds: [config.assessmentGoalId], originalOrdinaryGoalsPreserved: 807,
  originalAtomicTargetsPreserved: 978, currentAtomicTargetUnion: new Set(after.scopes.flatMap(scope => scope.targetAtomicGoalIds!)).size,
  globalRecognitionAtEmptyMastery: after.globalRecognitionAtEmptyMastery,
  explicitPrismAssessmentPassRecognizesExactly: after.globalRecognitionAfterPrismAssessment,
  excludedBroadSurfaceGoal: config.excludedOldPrerequisiteId,
  derivedPrismUnitCompletion: passUnit, catalogQuarantines: after.learningUnitCatalogQuarantines,
  baselineNativeReportSha256: digest(readFileSync(resolve(repo, baselinePath))),
  currentNativeReportSha256: digest(readFileSync(resolve(repo, afterPath))),
  currentNativeInputManifestSha256: digest(canonicalJson(after.nativeMapperInputSha256)),
  currentCanonicalSourceSha256: after.nativeMapperInputSha256[sourcePath], rows,
  boundary: 'Unsaved native backend fixture and actual application-service read model; independent current-unit review, release gates, HTTP, deployment and host acceptance remain separate.',
  reproduction: 'Preserve the S2 native report as native-before-prism.raw.json; run the nativeMathOfferingInventory adapter on actual Prism source; cd app && npx tsx scripts/learningUnitsMathPrismNativeProof.ts' }
assert.equal(report.currentAtomicTargetUnion, 979)
writeFileSync(resolve(repo, 'docs/dev/learning-units-mathematics-prism-native-proof.json'), `${compactScalarArrays(report)}\n`)
console.log('Prism native proof PASS: exactly +newQ in 27/182 scopes, 155 unchanged, all original targets/Q/K/support/reachability and S2 preserved, M0 none, Q pass -> exactly two Own A')
