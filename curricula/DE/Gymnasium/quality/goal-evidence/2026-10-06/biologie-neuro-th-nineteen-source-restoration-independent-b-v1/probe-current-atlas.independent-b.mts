// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'

const own = dirname(fileURLToPath(import.meta.url))
const root = resolve(own, '../../../../../../..')
const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-neuro-outside-fifty-two-source-restoration-author-v2'
const configPath = 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
const mappingPath = `${author}/TH.nineteen-component-mappings.author-v2.candidate.json`
const sha = (bytes: Buffer | string) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const configBytes = readFileSync(resolve(root, configPath))
const config = JSON.parse(configBytes.toString())
assert.equal(config.expectedCurricularAtomicGoalCount, 390)
assert.ok(!config.mappingPaths.includes(mappingPath), 'Isolated candidate must not already be active')
const baseline = buildGoalBookSourceAtlasInputs(config, root)
const prospective = buildGoalBookSourceAtlasInputs({ ...config, mappingPaths: [...config.mappingPaths, mappingPath] }, root)
const scopes = (result: typeof baseline) => result.receipt.scopes.map(scope => ({ key: scope.key, goalIds: scope.goalIds }))
assert.deepEqual(scopes(prospective), scopes(baseline), 'Whole actual country-view target lists must be preserved')
assert.deepEqual(baseline.outputs[config.navigationViewPath], prospective.outputs[config.navigationViewPath])
const mapping = read(mappingPath)
assert.equal(mapping.mappings.length, 19)
assert.equal(mapping.decisions.length, 19)
const targetIds = mapping.mappings.map((r: any) => r.canonicalGoalId).sort()
const witnesses = prospective.receipt.scopes.flatMap(scope => scope.witnesses
  .filter(witness => witness.mappingPath === mappingPath)
  .map(witness => ({ scopeKey: scope.key, ...witness })))
assert.equal(witnesses.length, 19)
assert.deepEqual(witnesses.map(w => w.goalId).sort(), targetIds)
assert.ok(witnesses.every(w => w.scopeKey === 'DE-TH/SekI/' && w.coverage === 'direct'
  && w.goalId === w.mappedTargetGoalId && w.profileBasis === 'source-metadata'))
const scopeDecisions = read(`${author}/TH.forty-three-current-goal-primary-scope.decisions.author-v2.json`)
const heldIds = scopeDecisions.openCurrentGoalScopeHolds.map((r: any) => r.goalId).sort()
assert.equal(heldIds.length, 24)
assert.ok(heldIds.every((id: string) => !targetIds.includes(id)))
const preservation = read(`${author}/current-canon-and-source-author-input-preservation.json`)
const canonical = read(config.landscapePath)
assert.deepEqual(canonical, preservation.currentCanonicalWholeGoalSnapshot)
assert.equal(sha(readFileSync(resolve(root, config.semanticKindLedgerPath))), preservation.currentKindLedger.sha256)
const frozenAuthorReceipt = read(`${author}/native-th-nineteen-current-atlas.author-v2.actual.receipt.json`)
assert.deepEqual(scopes(baseline), frozenAuthorReceipt.baselineScopes)
assert.deepEqual(scopes(prospective), frozenAuthorReceipt.candidateScopes)
for (const binding of prospective.receipt.inputBindings) {
  assert.equal(sha(readFileSync(resolve(root, binding.path))), binding.sha256, `Concurrent input drift: ${binding.path}`)
}
assert.equal(sha(readFileSync(resolve(root, configPath))), sha(configBytes))
const helperPaths = [
  'app/scripts/goalBookSourceAtlasInputs.ts', 'app/scripts/goalBookModel.ts',
  'app/src/utils/authoring/canonicalAuthoring.ts', 'app/src/utils/authoring/compositionViewAuthoring.ts',
]
const receipt = {
  schemaVersion: 1,
  reviewLane: 'independent-source-review-b',
  createdAtUTC: new Date().toISOString(),
  helper: 'unchanged production buildGoalBookSourceAtlasInputs; pure computation, no output integration',
  configBinding: { path: configPath, sha256: sha(configBytes) },
  productionHelperBindings: helperPaths.map(path => ({ path, sha256: sha(readFileSync(resolve(root, path))) })),
  inputBindings: prospective.receipt.inputBindings,
  baselineCounts: baseline.receipt.counts,
  prospectiveCounts: prospective.receipt.counts,
  exactAllCountryViewTargetListComparison: 'PASS actual deep comparison, not hash-only approval',
  exactFrozenAuthorCurrent390ScopeReproduction: 'PASS',
  exactWholeCanonicalAndKindsComparison: 'PASS',
  countryScopes: scopes(baseline).map(scope => ({
    key: scope.key, targetCount: scope.goalIds.length, orderedTargetIdsSha256: sha(JSON.stringify(scope.goalIds)),
    actualProspectiveOrderedTargetIdsExactlyEqual: true,
  })),
  newDirectComponentWitnesses: witnesses,
  remainingTHHeldGoalIds: heldIds,
  noNewWitnessForHeldGoal: true,
  unchangedCanonicalNodeCount: canonical.goals.length,
  currentCurricularAtomicCount: 390,
  fullProspectiveNeuro21HoldOverlay: 'NOT_RUN; separate pending work, not proved by current-atlas addition',
  compilerReviewStatusLimitation: 'Compiler accepts mapped author candidates for a pure prospective witness calculation; this receipt neither changes nor promotes source-review status.',
  scientificGateCompletionClaim: false,
  activeWrites: false, newStrictCompletions: 0, restoredActiveBindings: 0,
  humanApproval: false, humanTrial: false,
}
writeFileSync(resolve(own, 'native-current390-additive-atlas.independent-b.actual.receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`)
console.log(JSON.stringify({ nativeCurrent390: 'PASS', newDirectTHWitnesses: witnesses.length,
  exactCountryScopeTargetLists: 'PASS', THHeld: heldIds.length, strictGain: 0,
  receipt: relative(root, resolve(own, 'native-current390-additive-atlas.independent-b.actual.receipt.json')) }))
