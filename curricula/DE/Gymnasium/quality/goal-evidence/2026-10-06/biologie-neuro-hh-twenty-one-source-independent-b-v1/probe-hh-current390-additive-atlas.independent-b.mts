// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'

const own = dirname(fileURLToPath(import.meta.url))
const root = resolve(own, '../../../../../../..')
const author = resolve(own, '../biologie-neuro-hh-thirty-two-source-restoration-author-v1')
const rel = (path: string) => relative(root, path)
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const digest = (value: Buffer | string) => `sha256:${createHash('sha256').update(value).digest('hex')}`
const configPath = 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
const mappingPath = rel(resolve(author, 'HH.bounded-component-mappings.author-v1.candidate.json'))
const config = read(configPath)
const sourceMapping = read(mappingPath)
const source = read(sourceMapping.sourceExtractionPath)
const scopeDecisions = read(rel(resolve(author, 'HH.all-thirty-two-current-goal-primary-scope.decisions.author-v1.json')))
const authorFreezePath = rel(resolve(author, 'hh-thirty-two-partial-source-author-v1.final.freeze.json'))
const authorFreeze = read(authorFreezePath)
const primaryReceipt = read(rel(resolve(own, 'HH.author-freeze-and-actual-primary-reading.independent-b.json')))
const historicalNative = read(rel(resolve(author, 'native-hh-current390-additive-atlas.author-v1.actual.receipt.json')))
const guard = read(rel(resolve(author, 'actual-author-input-and-protected-subject-preservation.json')))
const currentBefore = new Map<string, string>()
for (const path of [configPath, authorFreezePath,
  ...authorFreeze.files.map((row: any) => row.path), ...guard.inputBindings.map((row: any) => row.path),
  ...historicalNative.actualNativeInputBindings.map((row: any) => row.path),
  primaryReceipt.TH19AuthorFreezePreservation.path,
  ...primaryReceipt.TH19AuthorFreezePreservation.files.map((row: any) => row.path)]) {
  if (existsSync(resolve(root, path))) currentBefore.set(path, digest(readFileSync(resolve(root, path))))
}
for (const row of authorFreeze.files) assert.equal(currentBefore.get(row.path), row.sha256)
for (const row of primaryReceipt.TH19AuthorFreezePreservation.files) assert.equal(currentBefore.get(row.path), row.sha256)
assert.equal(config.expectedCurricularAtomicGoalCount, 390)
assert.ok(!config.mappingPaths.includes(mappingPath))
assert.equal(sourceMapping.reviewStatus, 'author_candidate_awaiting_two_independent_reviews')
assert.equal(sourceMapping.wholeOriginalSourceCoverage, false)
assert.ok(sourceMapping.decisions.every((row: any) => row.matchType === 'partial'
  && row.independentReviewStatus === 'pending_two_independent_source_scope_reviews'))
assert.equal(source.sourceGoals.length, 21)
assert.equal(scopeDecisions.openCurrentGoalScopeHolds.length, 11)
assert.equal(read(config.landscapePath).goals.length, 472)
const baseline = buildGoalBookSourceAtlasInputs(config, root)
const candidate = buildGoalBookSourceAtlasInputs({ ...config, mappingPaths: [...config.mappingPaths, mappingPath] }, root)
const scopeLists = (result: typeof baseline) => result.receipt.scopes.map(scope => ({ key: scope.key, goalIds: scope.goalIds }))
assert.equal(baseline.receipt.counts.canonicalCurricularAtomicGoals, 390)
assert.equal(candidate.receipt.counts.canonicalCurricularAtomicGoals, 390)
assert.equal(baseline.receipt.scopes.length, 22)
assert.deepEqual(scopeLists(candidate), scopeLists(baseline))
assert.equal(candidate.outputs[config.navigationViewPath], baseline.outputs[config.navigationViewPath])
const scopes = scopeLists(baseline).map(scope => ({ key: scope.key, targetCount: scope.goalIds.length,
  orderedTargetIdsSha256: digest(JSON.stringify(scope.goalIds)), orderedTargetIds: scope.goalIds,
  candidateOrderedTargetListExactlyEqual: true }))
const originalScopeDigests = historicalNative.countryScopes.map((row: any) => ({ key: row.key,
  targetCount: row.targetCount, orderedTargetIdsSha256: row.orderedTargetIdsSha256 }))
assert.deepEqual(scopes.map(({ key, targetCount, orderedTargetIdsSha256 }) => ({ key, targetCount, orderedTargetIdsSha256 })), originalScopeDigests)
const targets = sourceMapping.mappings.map((row: any) => row.canonicalGoalId).sort()
assert.equal(new Set(targets).size, 21)
const witnesses = candidate.receipt.scopes.flatMap(scope => scope.witnesses
  .filter(witness => witness.mappingPath === mappingPath).map(witness => ({ scopeKey: scope.key, ...witness })))
assert.equal(witnesses.length, 21)
assert.deepEqual(witnesses.map(witness => witness.goalId).sort(), targets)
assert.ok(witnesses.every(witness => witness.scopeKey === 'DE-HH/SekI/' && witness.coverage === 'direct'
  && witness.goalId === witness.mappedTargetGoalId && witness.profileBasis === 'source-metadata'))
assert.ok(scopeDecisions.openCurrentGoalScopeHolds.every((row: any) => !targets.includes(row.goalId)))
assert.equal(source.retainedOriginalSourceObligations.originalWholeHoldDecision.decision, 'needs_canonical_goal')
for (const row of [...baseline.receipt.inputBindings, ...candidate.receipt.inputBindings]) {
  if (existsSync(resolve(root, row.path))) {
    assert.equal(digest(readFileSync(resolve(root, row.path))), row.sha256)
    if (currentBefore.has(row.path)) assert.equal(currentBefore.get(row.path), row.sha256)
    else currentBefore.set(row.path, row.sha256)
  }
}
for (const [path, sha256] of currentBefore) assert.equal(digest(readFileSync(resolve(root, path))), sha256, `Concurrent input drift: ${path}`)
const result = {
  schemaVersion: 1, createdAtUTC: new Date().toISOString(),
  role: 'independent B current technical rerun after recorded historical input drift; source decisions remain separate',
  nativeHelper: 'unchanged production buildGoalBookSourceAtlasInputs; two actual pure in-memory invocations',
  historicalAuthorFreeze: { path: authorFreezePath, sha256: digest(readFileSync(resolve(root, authorFreezePath))), allFilesExact: true },
  currentNativeHelperBinding: { path: 'app/scripts/goalBookSourceAtlasInputs.ts', sha256: digest(readFileSync(resolve(root, 'app/scripts/goalBookSourceAtlasInputs.ts'))) },
  actualCurrentInputBindings: [...currentBefore].sort(([a], [b]) => a.localeCompare(b)).map(([path, sha256]) => ({ path, sha256 })),
  historicalInputDriftsPreservedAsHistory: primaryReceipt.currentHistoricalInputDrifts,
  baselineCounts: baseline.receipt.counts, candidateCounts: candidate.receipt.counts,
  all22CompleteOrderedCountryTargetListsExactlyEqualByActualDeepComparison: true,
  same22OrderedTargetListsAsFrozenAuthorNativeReceipt: true,
  countryScopes: scopes, candidateOutputBindings: candidate.receipt.outputBindings,
  canonicalNavigationExactlyEqual: true, actualNewDirectHHComponentWitnesses: witnesses,
  canonical472AndKindsUnchangedDuringRun: true, noNewCanonicalGoalIds: true,
  allCurrentInputsRecheckedAfterRun: true,
  TH19FrozenAuthorFilesRecheckedUnchanged: true, chemistryProtected112WholeObjectsExact: primaryReceipt.chemistryProtected112WholeObjectsExact,
  originalWholeSourceHoldRetained: true,
  individualWholeCurrentGoalScopeHoldsRetained: scopeDecisions.openCurrentGoalScopeHolds.map((row: any) => row.goalId),
  partialComponentResidualRequirementsRetained: true,
  compilerDoesNotValidateScientificScopeOrIndependentStatus: true,
  fullNeuro21HoldOverlayAndGoalBookPlacement: 'NOT_RUN; this additive source-atlas run cannot establish it',
  activeWrites: false, gitMutation: false, restoredActiveBindings: 0,
  newStrictCompletions: 0, strictNetGain: 0, humanApproval: false, humanTrial: false,
}
const output = resolve(own, 'native-hh-current390-additive-atlas.independent-b.current.actual.receipt.json')
assert.ok(!existsSync(output))
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`)
console.log(JSON.stringify({ status: 'PASS_CURRENT_TECHNICAL_RERUN', currentCurricularAtomic: 390,
  completeOrderedCountrySets: scopes.length, directHHPartialWitnesses: witnesses.length,
  sameHistoricalTargetSets: true, individualHHHolds: 11, activeWrites: false, strictNetGain: 0 }))
