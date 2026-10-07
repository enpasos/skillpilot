// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'

const own = dirname(fileURLToPath(import.meta.url))
const root = resolve(own, '../../../../../../..')
const localPath = (name: string) => relative(root, resolve(own, name))
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const digest = (bytes: Buffer | string) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const configPath = 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
const configBytes = readFileSync(resolve(root, configPath))
const config = JSON.parse(configBytes.toString())
assert.equal(config.expectedCurricularAtomicGoalCount, 390)
const mappingPath = localPath('HH.bounded-component-mappings.author-v1.candidate.json')
assert.ok(!config.mappingPaths.includes(mappingPath))
const guard = read(localPath('actual-author-input-and-protected-subject-preservation.json'))
for (const binding of guard.inputBindings) {
  assert.equal(digest(readFileSync(resolve(root, binding.path))), binding.sha256)
}
const baseline = buildGoalBookSourceAtlasInputs(config, root)
const candidate = buildGoalBookSourceAtlasInputs({ ...config, mappingPaths: [...config.mappingPaths, mappingPath] }, root)
const scopes = (result: typeof baseline) => result.receipt.scopes.map(scope => ({ key: scope.key, goalIds: scope.goalIds }))
assert.deepEqual(scopes(candidate), scopes(baseline), 'Exact full country-scope target lists must stay unchanged')
assert.equal(candidate.outputs[config.navigationViewPath], baseline.outputs[config.navigationViewPath])
const mapping = read(mappingPath)
const source = read(mapping.sourceExtractionPath)
const candidates = source.sourceGoals
assert.equal(candidates.length, 21)
const scopeDecisions = read(localPath('HH.all-thirty-two-current-goal-primary-scope.decisions.author-v1.json'))
const targets = mapping.mappings.map((r: any) => r.canonicalGoalId).sort()
assert.equal(new Set(targets).size, 21)
const witnesses = candidate.receipt.scopes.flatMap(scope => scope.witnesses
  .filter(w => w.mappingPath === mappingPath).map(w => ({ scopeKey: scope.key, ...w })))
assert.equal(witnesses.length, 21)
assert.deepEqual(witnesses.map(w => w.goalId).sort(), targets)
assert.ok(witnesses.every(w => w.scopeKey === 'DE-HH/SekI/' && w.coverage === 'direct'
  && w.goalId === w.mappedTargetGoalId && w.profileBasis === 'source-metadata'))
assert.equal(scopeDecisions.openCurrentGoalScopeHolds.length, 11)
assert.ok(scopeDecisions.openCurrentGoalScopeHolds.every((r: any) => !targets.includes(r.goalId)))
assert.equal(source.retainedOriginalSourceObligations.originalWholeHoldDecision.decision, 'needs_canonical_goal')
for (const binding of [...guard.inputBindings, ...candidate.receipt.inputBindings]) {
  assert.equal(digest(readFileSync(resolve(root, binding.path))), binding.sha256, `Concurrent input drift: ${binding.path}`)
}
assert.equal(digest(readFileSync(resolve(root, configPath))), digest(configBytes))
const result = {
  schemaVersion: 1, createdAtUTC: new Date().toISOString(),
  role: 'source AUTHOR actual targeted native execution, not independent source review',
  nativeHelper: 'unchanged production buildGoalBookSourceAtlasInputs; pure in-memory baseline and candidate compile',
  nativeHelperBinding: { path: 'app/scripts/goalBookSourceAtlasInputs.ts', sha256: digest(readFileSync(resolve(root, 'app/scripts/goalBookSourceAtlasInputs.ts'))) },
  configBinding: { path: configPath, sha256: digest(configBytes) },
  baselineCounts: baseline.receipt.counts, candidateCounts: candidate.receipt.counts,
  exactCompleteCountryScopeTargetListsComparedAndPreserved: true,
  countryScopes: scopes(baseline).map(scope => ({ key: scope.key, targetCount: scope.goalIds.length,
    orderedTargetIdsSha256: digest(JSON.stringify(scope.goalIds)),
    candidateOrderedTargetListExactlyEqualByActualDeepComparison: true })),
  canonicalNavigationExactlyPreserved: true,
  currentCanonical472WholePayloadAndKindsExactBeforeAndAfter: true,
  actualNewDirectHHComponentWitnesses: witnesses,
  actualNativeInputBindings: candidate.receipt.inputBindings,
  originalWholeSourceDecisionHoldRetained: true,
  remaining11HHPairHolds: scopeDecisions.openCurrentGoalScopeHolds.map((r: any) => r.goalId),
  original155OtherHistoricalPairsNotTouched: true,
  fullNeuro21HoldOverlayAndGoalBookPlacement: 'NOT_RUN; additive current390 compile is not restoration of historical overlay',
  noCompilerStatusPromotion: 'Candidate metadata remains pending_two_independent_source_scope_reviews; compiler witness production does not approve those statuses.',
  otherSubjectCanonAndProtected112GuardAllExact: true,
  TH19FrozenAuthorInputsExactlyPreservedByHashReuse: true,
  newStrictCompletions: 0, restoredActiveBindings: 0, activeWrites: false,
  independentApproval: false, humanApproval: false, humanTrial: false,
}
writeFileSync(resolve(own, 'native-hh-current390-additive-atlas.author-v1.actual.receipt.json'), `${JSON.stringify(result, null, 2)}\n`)
console.log(JSON.stringify({ nativeCurrent390: 'PASS', exactCurrentCountryTargetSets: baseline.receipt.scopes.length,
  newDirectHHComponentWitnesses: witnesses.length, HHIndividualHolds: 11,
  fullNeuro21HoldOverlay: 'NOT_RUN', strictGain: 0, activeWrites: false }))
