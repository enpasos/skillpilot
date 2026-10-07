import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { loadGoalBookBuildInputs, parseAndValidateGoalBookModel, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel.ts'
import { expandGoalBookSourceAtlasReceipt } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import { validatePreparedGoalDescriptionRolloutBatch } from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'

const root = process.cwd()
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
const author = base + 'chemie-current-fifteen-final-native-review-inputs-author-v3/'
const old = base + 'chemie-current-atomic-description-positive-gap-author-v1/'
const own = base + 'chemie-current-five-targeted-native-d-independent-b-v3/'
const get = async (p: string) => JSON.parse(await readFile(resolve(root, p), 'utf8'))
const sha = (bytes: string | Buffer) => 'sha256:' + createHash('sha256').update(bytes).digest('hex')
const sidecar = await get(author + 'actual-full378-national359-five-pages-native-context-source-bindings.json')
const prior = await get(old + 'actual-current378-national359-subset15-page-source-context-bindings.json')
const before = await get(old + 'actual-inputs.before-native-preparation.json')
const [currentFull, currentNational, prepared] = await Promise.all([
  loadGoalBookBuildInputs(old + 'full-current378.book.config.json'),
  loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json'),
  validatePreparedGoalDescriptionRolloutBatch(author + 'native-d-five.batch.config.json'),
])
const prospectiveFull = parseAndValidateGoalBookModel(await get(author + 'qa-artifacts/full-prospective378.book-model.json'))
assert.equal(currentFull.model.pages.length, 378)
assert.equal(currentNational.model.pages.length, 359)
assert.equal(prepared.model.pages.length, 5)
assert.equal(currentFull.model.digest, sidecar.currentFullModelDigest)
assert.equal(currentNational.model.digest, sidecar.currentNationalModelDigest)
assert.equal(prospectiveFull.digest, sidecar.fullProspectiveModelDigest)
assert.equal(prepared.model.digest, sidecar.subsetDigest)
const currentById = new Map(currentFull.model.pages.map(p => [p.goalId, p]))
const changed = prospectiveFull.pages.filter(p => stableGoalBookJson(p) !== stableGoalBookJson(currentById.get(p.goalId))).map(p => p.goalId)
assert.deepEqual([...changed].sort(), [...sidecar.actuallyChangedFullPageIds].sort())
assert.equal(changed.length, 5)
assert.deepEqual([...changed].sort(), [...prepared.model.pages.map(p => p.goalId)].sort())
const currentCanon = await get('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const prospectiveCanon = await get(author + 'prospective-current378.canonical.author-candidate.json')
const currentGoals = new Map(currentCanon.goals.map((g: any) => [g.id, g]))
const proposedGoals = new Map(prospectiveCanon.goals.map((g: any) => [g.id, g]))
assert.equal(currentGoals.size, proposedGoals.size)
const changedGoals = [...proposedGoals].filter(([id, g]) => stableGoalBookJson(g) !== stableGoalBookJson(currentGoals.get(id))).map(([id]) => id)
assert.deepEqual([...changedGoals].sort(), [...prepared.model.pages.map(p => p.goalId)].sort())
const literalGoalFieldsChanged = changedGoals.map(goalId => {
  const current: any = currentGoals.get(goalId)
  const proposed: any = proposedGoals.get(goalId)
  return { goalId, changedTopLevelFields: [...new Set([...Object.keys(current), ...Object.keys(proposed)])].filter(field => stableGoalBookJson(current[field]) !== stableGoalBookJson(proposed[field])) }
})
const protectedRows = before.protectedStrictGoalIds.map((id: string) => {
  assert.deepEqual(proposedGoals.get(id), currentGoals.get(id))
  const digest = sha(stableGoalBookJson(currentGoals.get(id)))
  assert.equal(digest, before.protected112WholeGoalDigests[id])
  return { goalId: id, digest, wholeGoalExact: true }
})
assert.equal(protectedRows.length, 112)
const atlasPath = 'app/scripts/config/goal-books/source-views/de-gym-chemistry-national-atlas/source-projection.receipt.json'
const atlas = expandGoalBookSourceAtlasReceipt(await get(atlasPath))
const countryTargets = atlas.scopes.map((s: any) => ({ key: s.key, count: s.goalIds.length, orderedGoalIds: s.goalIds, orderedDigest: sha(JSON.stringify(s.goalIds)) }))
assert.deepEqual(countryTargets, prior.countryViewTargets)
assert.deepEqual(countryTargets, sidecar.countryViewTargets)
assert.equal(countryTargets.length, 48)
const witnessChecks = sidecar.rows.map((r: any) => {
  const actual = atlas.scopes.flatMap((s: any) => s.witnesses.filter((w: any) => w.goalId === r.goalId).map((w: any) => ({scopeKey: s.key, ...w})))
  assert.deepEqual(actual, r.actualNativeSourceScopeWitnesses)
  assert.deepEqual(actual, prior.rows.find((p: any) => p.goalId === r.goalId).actualNativeSourceScopeWitnesses)
  assert.deepEqual(currentById.get(r.goalId), r.currentFull378Page)
  assert.deepEqual(prospectiveFull.pages.find(p => p.goalId === r.goalId), r.prospectiveFull378Page)
  return { goalId: r.goalId, witnessCount: actual.length, sourceWitnessDigest: sha(stableGoalBookJson(actual)), exactCurrentAndV1: true, sourceApproval: false }
})
assert.equal(witnessChecks.length, 15)
const reusedSeven = ['3be2d0b7-c22f-57d4-886a-10fc04a629f5', 'e1214210-406e-5075-b83c-086b3972ed66', '448815cc-4127-54b7-96bf-e54b3d2a38c5', 'b92bfa45-b500-5647-8fd2-a14b708aaf59', '345fdca9-038f-51e2-9bea-b6ac416a734a', '3899edf4-a809-54b1-8ee7-4e67aa82dc7c', 'd4928773-3be8-5cf1-907c-ef07c96751e8'].map(goalId => {
  assert.deepEqual(proposedGoals.get(goalId), currentGoals.get(goalId))
  assert.deepEqual(currentById.get(goalId), prospectiveFull.pages.find(p => p.goalId === goalId))
  assert.deepEqual(currentById.get(goalId), prior.rows.find((r: any) => r.goalId === goalId).fullCurrent378Page)
  return { goalId, wholeGoalExact: true, currentFullPageExactV1AndV3: true, scienceReviewRestarted: false }
})
const helperPath = 'app/scripts/goalBookModel.ts'
assert.equal(sha(await readFile(resolve(root, helperPath))), 'sha256:0363d5419a765508d82d06e50315c491c7292a02a07c98de1d919bba9386dd53')
await writeFile(resolve(root, own + 'targeted-native-preservation.actual.independent-b.json'), JSON.stringify({
  schemaVersion: 1, createdAtUTC: new Date().toISOString(), role: 'Independent B targeted native preparation and binding reproduction; not scientific or human approval',
  currentFullAtomPages: 378, nationalPublishedAtomPages: 359, prospectiveFullAtomPages: 378, targetedSubsetPages: 5,
  currentFullModelDigest: currentFull.model.digest, currentNationalModelDigest: currentNational.model.digest, prospectiveFullModelDigest: prospectiveFull.digest, subsetModelDigest: prepared.model.digest,
  nativePreparedBatchValidator: 'PASS', actuallyChangedFullPageIds: changed, other373FullPagePayloadsExact: true, changedWholeCanonicalGoalIds: changedGoals, literalGoalFieldsChanged,
  protectedRows, protected112WholeGoalsExact: true, countryTargetCount: countryTargets.length, all48OrderedCountryTargetsExactCurrentV1V3: true,
  sourceAtlasCounts: atlas.counts, sourceWitnessChecks: witnessChecks, reusedSeven,
  currentHelper: {path: helperPath, digest: sha(await readFile(resolve(root, helperPath))), actualDelta: 'Identical effective duration-policy decisions may be grouped by jurisdiction only across distinct bound sourceExtractionPath rows; conflicting effective decisions and duplicate/missing multi-row source bindings remain rejected. compositionViewIds is typed and validated. Historical helper pins are not rewritten.'},
  limits: ['Only prepared native input validation loads both author campaigns for technical consistency; no current peer review result was read.', 'Expanded current SourceAtlas witnesses and country target sets were compared mechanically to exact V1/V3 rows; inherited witness metadata is not independent physical source or grade evidence.', 'No full build or PDF render was run. Existing frozen actual PDF and HTML were directly inspected.', 'New P materials/profiles were not read; native P, integration and human release gates remain separate.'],
  activeWrites: false, newStrictClosures: 0, humanApproval: false, humanTrial: false,
}, null, 2) + '\n')
console.log(JSON.stringify({preparedNativeInput:'PASS', current378:378, national359:359, changedPages:changed.length, preservedPages:373, protected112:112, exactCountrySets:48, exactWitnessCollections:15, unchangedSevenScienceReuse:7}))
