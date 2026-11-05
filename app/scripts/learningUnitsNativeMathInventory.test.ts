import assert from 'node:assert/strict'
import { requireNativeInventory } from './learningUnitsNativeMathInventory'

const row = { scopeId: 'DE-HE/SekII/G9/LK', offeredByNativePlanner: true,
  declaredByRepositoryGui: true, projectionResolved: true, prerequisiteCompilationResolved: true,
  targetAtomicGoalIds: ['a', 'q'], assessmentGoalIds: ['q'], recallGoalIds: [], orientationGoalIds: [],
  compositionViewIds: ['reviewed-view'] }
const valid = { schemaVersion: 1, measurement: 'actual-backend-planner-and-learner-projection',
  scopes: [row], nativeMapperInputSha256: { 'canonical.json': 'a'.repeat(64) },
  plannerScopeIds: [row.scopeId], declaredScopeIds: [row.scopeId], discoveryFailures: [] }
requireNativeInventory(valid)
assert.throws(() => requireNativeInventory({ ...valid, scopes: [] }), /empty/)
assert.throws(() => requireNativeInventory({ ...valid, nativeMapperInputSha256: {} }), /inputs are empty/)
assert.throws(() => requireNativeInventory({ ...valid, nativeMapperInputSha256: { bad: 'unbound' } }), /Malformed native input/)
assert.throws(() => requireNativeInventory({ ...valid, scopes: [row, row] }), /duplicate scope/)
assert.throws(() => requireNativeInventory({ ...valid, declaredScopeIds: [row.scopeId, 'DE-BY/SekII/G9/GK'] }), /silently omitted/)
assert.throws(() => requireNativeInventory({ ...valid, scopes: [{ ...row, assessmentGoalIds: ['outside'] }] }), /foreign target/)
assert.throws(() => requireNativeInventory({ ...valid, scopes: [{ ...row, projectionResolved: false }] }), /lost its cause/)
requireNativeInventory({ ...valid, scopes: [{ ...row, projectionResolved: false, projectionError: 'Exact missing view' }] })
console.log('Native Mathematics inventory completeness and explicit-failure assertions passed')
