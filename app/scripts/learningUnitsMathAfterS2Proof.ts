import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { canonicalJson, digest, fullClosure } from './learningUnitsMathAuthoring'
import { compactScalarArrays } from './learningUnits/compactJson'
import { requireNativeInventory } from './learningUnitsNativeMathInventory'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const baseline = read('docs/dev/learning-units-mathematics-offering-inventory.json')
const before = read('tmp/math-learning-units/native-before-s2.raw.json')
const after = read('tmp/math-learning-units/native-backend.raw.json')
requireNativeInventory(after)
assert.equal(after.scopes.length, 182)
assert.deepEqual(after.learningUnitCatalogQuarantines, {}, 'The actual application service quarantined S2')
assert.deepEqual(after.globalRecognitionAfterProjectionAssessment, ['3016ec37-1c2e-47db-83f5-e767923bc97e'])
const byBefore = new Map<string, typeof after.scopes[number]>(before.scopes.map((scope: { scopeId: string }) => [scope.scopeId, scope]))
const deltas = after.scopes.map(scope => {
  const original = byBefore.get(scope.scopeId); assert.ok(original, `New scope ${scope.scopeId}`)
  assert.ok(scope.projectionResolved && scope.prerequisiteCompilationResolved, `Failed current native scope ${scope.scopeId}`)
  for (const key of ['targetAtomicGoalIds', 'assessmentGoalIds', 'recallGoalIds', 'prerequisiteOnlyGoalIds', 'orientationGoalIds'] as const) {
    assert.deepEqual(scope[key], original[key], `S2 unexpectedly changed native ${key} in ${scope.scopeId}`)
  }
  assert.deepEqual(fullClosure(scope.atomicPrerequisites!), fullClosure(original.atomicPrerequisites!), `S2 changed transitive demand in ${scope.scopeId}`)
  return { scopeId: scope.scopeId, targetAtomicCount: scope.targetAtomicGoalIds!.length,
    assessmentCount: scope.assessmentGoalIds!.length, recallCount: scope.recallGoalIds!.length,
    targetQKAndSupportExactEqual: true, fullPrerequisiteReachabilityExactEqual: true }
})
assert.deepEqual(after.scopes.map(scope => scope.scopeId), before.scopes.map((scope: { scopeId: string }) => scope.scopeId))
const sourcePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const actualSourceDigest = digest(readFileSync(resolve(root, sourcePath)))
assert.equal(after.nativeMapperInputSha256[sourcePath], actualSourceDigest, 'Fresh native run did not load current authoritative source')
assert.notEqual(before.nativeMapperInputSha256[sourcePath], actualSourceDigest, 'Measurement still uses initial pre-S2 source')
const source = read(sourcePath)
const unit = source.programUnits.find((unit: { id: string }) => unit.id === 'de-gym-math-dot-product-projection')
assert.ok(unit?.learningUnit)
const placements = source.goalPlacements.filter((placement: { unitId: string; acquisition?: boolean }) => placement.unitId === unit.id && placement.acquisition)
assert.equal(placements.length, 2)
const own = ['3016ec37-1c2e-47db-83f5-e767923bc97e', 'e98672c6-871a-5d0b-889c-5afc51040f0d']
for (const scope of after.scopes) assert.equal(scope.learningUnitReadModel?.calculationStatus, 'valid', `Invalid API read model ${scope.scopeId}`)
const displayedScopeIds = after.scopes.filter(scope => scope.learningUnitReadModel!.units.some(unit => unit.contractId === 'math-dot-product-projection')).map(scope => scope.scopeId)
const expectedDisplayScopes = after.scopes.filter(scope => own.every(id => scope.targetAtomicGoalIds!.includes(id))).map(scope => scope.scopeId)
assert.deepEqual(displayedScopeIds, expectedDisplayScopes, 'Actual API display differs from exact Own-target visibility')
assert.equal(displayedScopeIds.length, 42)
const proof = { schemaVersion: 1, measurement: 'fresh-actual-backend-planner-and-projection-after-S2-metadata',
  sourceSha256: actualSourceDigest,
  initialInventoryFileSha256: digest(readFileSync(resolve(root, 'docs/dev/learning-units-mathematics-offering-inventory.json'))),
  initialNativeMeasurementPayloadSha256: baseline.sourceDigests.nativeMeasurementPayloadSha256,
  afterS2NativeMeasurementPayloadSha256: digest(canonicalJson(after)),
  afterS2NativeMapperInputManifestSha256: digest(canonicalJson(after.nativeMapperInputSha256)),
  afterS2NativeMapperInputCount: Object.keys(after.nativeMapperInputSha256).length,
  actualProgramUnit: unit, actualAcquisitionPlacements: placements,
  scopeCount: deltas.length, changedTargetQKOrSupportScopes: 0, changedFullPrerequisiteReachabilityScopes: 0,
  identicalOwnTargetMaskScopeCount: displayedScopeIds.length, identicalOwnTargetMaskScopeIds: displayedScopeIds,
  actualApplicationServiceCatalogQuarantines: after.learningUnitCatalogQuarantines,
  actualApiDisplayedUnitScopeCount: displayedScopeIds.length,
  actualApiHiddenUnitScopeCount: after.scopes.length - displayedScopeIds.length,
  globalRecognitionAfterProjectionAssessment: after.globalRecognitionAfterProjectionAssessment,
  scopes: deltas,
  limitation: 'Fresh native projection and actual application-service API read-model proof; HTTP transport, package proof, deployment and host acceptance are separate checks.',
  reproduction: 'Run nativeMathOfferingInventory Gradle adapter on current source, preserving initial native-before-s2.raw.json; then cd app && npx tsx scripts/learningUnitsMathAfterS2Proof.ts' }
writeFileSync(resolve(root, 'docs/dev/learning-units-mathematics-after-s2-native-proof.json'), `${compactScalarArrays(proof)}\n`)
console.log('Fresh S2 native proof: 182 actual projections; zero Target/Q/K/support/reachability deltas; 42 identical own-target masks')
