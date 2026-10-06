// SPDX-License-Identifier: Apache-2.0
// Independent source-projection comparison; never writes runtime inputs.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildGoalBookSourceAtlasInputs, type GoalBookSourceAtlasInputConfig } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'

const root = resolve('tmp/biologie-neuro-v3-source-independent-b-primary/sparse-native-inputs')
const output = resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-neuro-he-raw-nw-two-components-v3-independent-b-v1')
const author = resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-neuro-he-original-spelling-nw-two-source-components-author-v3')
const config = JSON.parse(readFileSync(resolve(root, 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'), 'utf8')) as GoalBookSourceAtlasInputConfig
const delta = JSON.parse(readFileSync(resolve(author, 'actual-author-delta-and-inputs.json'), 'utf8'))
const targetIds = ['5b2571d9-f079-52b2-b21b-8f389c7409f4', '49dbe8fa-7c4a-5ef5-9cd7-a40b60bf88dd'].sort()
const componentIds = ['22637879-a1cf-5128-bd59-2a2e12d8c193', '23c1ecdb-9a65-5e24-bb22-88852b178638'].sort()
const sha = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex')
const candidate = { ...config, mappingPaths: [...config.mappingPaths, delta.NWProspectiveMappingPath] }
assert.equal(config.expectedCurricularAtomicGoalCount, 383)
assert.equal(candidate.expectedCurricularAtomicGoalCount, 383)
assert.equal(config.expectedUnresolvedScopeDecisionCount, 0)
assert.equal(candidate.expectedUnresolvedScopeDecisionCount, 0)

const strictAttempt = (input: GoalBookSourceAtlasInputConfig) => {
  let failure: string | null = null
  try {
    buildGoalBookSourceAtlasInputs(input, root)
  } catch (error) {
    failure = String(error)
  }
  assert.ok(failure?.includes('375 !== 383'), `Unexpected original-contract result: ${failure}`)
  return { expected: 383, status: 'FAIL', actual: 375, error: failure }
}
const beforeStrict = strictAttempt(config)
const afterStrict = strictAttempt(candidate)
// Inspection only: a result under 375 never replaces the explicit 383 contract.
const before = buildGoalBookSourceAtlasInputs({ ...config, expectedCurricularAtomicGoalCount: 375 }, root)
const after = buildGoalBookSourceAtlasInputs({ ...candidate, expectedCurricularAtomicGoalCount: 375 }, root)
type Scope = {key: string, goalIds: string[], witnesses: Array<Record<string, unknown>>}
const beforeScopes = before.receipt.scopes as Scope[]
const afterScopes = after.receipt.scopes as Scope[]
assert.equal(beforeScopes.length, 20)
assert.equal(afterScopes.length, 20)
const comparisons = afterScopes.map(scope => {
  const previous = beforeScopes.find(old => old.key === scope.key)
  assert.ok(previous, scope.key)
  const added = scope.goalIds.filter(id => !previous.goalIds.includes(id))
  const removed = previous.goalIds.filter(id => !scope.goalIds.includes(id))
  assert.deepEqual(removed, [], `Unexpected removed target: ${scope.key}`)
  assert.deepEqual(added.sort(), scope.key === 'DE-NW/SekI/' ? targetIds : [], `Unexpected added target: ${scope.key}`)
  return {key: scope.key, beforeCount: previous.goalIds.length, afterCount: scope.goalIds.length, addedGoalIds: added, removedGoalIds: removed}
})
const nw = afterScopes.find(scope => scope.key === 'DE-NW/SekI/')!
const witnesses = nw.witnesses.filter(witness => targetIds.includes(String(witness.goalId)))
assert.equal(witnesses.length, 2)
assert.deepEqual(witnesses.map(w => String(w.sourceGoalId)).sort(), componentIds)
assert.ok(witnesses.every(w => w.coverage === 'direct' && w.profileBasis === 'source-metadata'))
assert.deepEqual(after.receipt.omittedGoals, before.receipt.omittedGoals)
assert.equal((after.receipt.omittedGoals as unknown[]).length, 8)
assert.equal(after.receipt.counts.canonicalCurricularAtomicGoals, 383)
assert.equal(after.receipt.counts.publishedCurricularAtomicGoals, 375)
assert.equal(after.receipt.counts.unresolvedSourceScopeDecisions, 0)

const inputBindings = after.receipt.inputBindings as Array<{path:string, sha256:string}>
for (const binding of inputBindings) {
  assert.equal(sha(readFileSync(resolve(root, binding.path))), binding.sha256.replace('sha256:', ''), `Stale actual native input: ${binding.path}`)
}
const outputBindings = Object.entries(after.outputs).map(([path, bytes]) => ({path, sha256:sha(bytes), bytes:Buffer.byteLength(bytes)}))
const name = resolve(output, 'native-two-target-restoration.actual.json')
assert.ok(!existsSync(name), 'Frozen/earlier output must not be overwritten.')
writeFileSync(name, `${JSON.stringify({
  schemaVersion: 1,
  createdAtUTC: new Date().toISOString(),
  reviewer: 'codex-neuro-v3-source-independent-b',
  nativeCodePath: 'app/scripts/goalBookSourceAtlasInputs.ts',
  nativeCodeSha256: sha(readFileSync(resolve('app/scripts/goalBookSourceAtlasInputs.ts'))),
  beforeStrict383: beforeStrict,
  afterStrict383: afterStrict,
  diagnosticOnlyExpected: 375,
  diagnosticIsNotAFinalGateOrCountOverride: true,
  actualNativeCounts: after.receipt.counts,
  allTwentyScopeComparisons: comparisons,
  restoredCandidateNRWGoals: targetIds,
  restoredCandidateBindings: 2,
  directSourceMetadataWitnesses: witnesses,
  allOtherScopeGoalIdSetsExact: true,
  omittedGoalsUnchanged: after.receipt.omittedGoals,
  diagnosticNativeInputBindings: inputBindings,
  diagnosticNativeOutputBindings: outputBindings,
  newNativeDApproval: false,
  newNativeVApproval: false,
  wholeSourceClearance: false,
  activeWrites: false,
  strictCompletionsAdded: 0,
  restoredActiveBindings: 0,
  integrableAsWholeNeuroPackage: false,
  humanApproval: false,
  humanTrial: false,
}, null, 2)}\n`)
console.log(JSON.stringify({beforeOriginal383:'FAIL375',afterOriginal383:'FAIL375',restoredCandidateNRWBindings:2,otherScopeTargetSetsExact:true,omittedGoals:8,activeGain:0}))
