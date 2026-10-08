// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync, writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
import {stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'

const own = resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-basis2-supplement-context-independent-a-resumed-v1')
const author = resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-basis2-source-supplement-technical-author-resumed-v1')
const read = (p:string) => JSON.parse(readFileSync(p,'utf8'))
const comparison = read(resolve(author,'checks/current-word576.native-subset-page.context-comparison.json'))
const prior = read(resolve(comparison.priorActuallyReviewedNativeSubsetPath))
const full = read(resolve(author,'native/full394.ordinary-source-supplement.actual-model.json'))
const rebuilt = buildGoalDescriptionRolloutSubsetModel({baseModel:full,goalIds:[comparison.goalId],bookId:prior.book.id,title:prior.book.title})
const before = prior.pages[0], current = rebuilt.pages[0]
assert.equal(stableGoalBookJson(current),stableGoalBookJson(comparison.wholeCurrentSubsetPage))
const without = (p:any) => Object.fromEntries(Object.entries(p).filter(([key])=>!['externalReverseRequires','pageFingerprint'].includes(key)))
assert.equal(stableGoalBookJson(without(before)),stableGoalBookJson(without(current)))
const byId = (rows:any[]) => Object.fromEntries(rows.map(row=>[row.goalId,row]))
assert.equal(stableGoalBookJson(byId(before.externalReverseRequires)),stableGoalBookJson(byId(current.externalReverseRequires)))
assert.equal(current.externalReverseRequires.length,3)
assert.notEqual(before.pageFingerprint,current.pageFingerprint)
const proof = {
  schemaVersion:1,
  role:'Independent use of existing ordinary subset builder and actual whole native page comparison; no recreated scientific verdict by fingerprints',
  goalId:comparison.goalId,
  actualBuilder:'app/scripts/materializeGoalDescriptionRolloutBatch.ts:buildGoalDescriptionRolloutSubsetModel',
  sourceFullModelDigest:full.digest,
  actualCurrentSubsetPage:current,
  priorActuallyReviewedSubsetPage:before,
  changedPageKeys:['externalReverseRequires','pageFingerprint'],
  allThreeWholeExternalRelationObjectsExactAfterKeyingByGoalId:true,
  noRelationRemovedOrAdded:true,
  noPrerequisiteMeaningOrGoalTextApplicabilityImageChange:true,
  fullModelPaginationMovesVerifiedSeparately:true,
  actualCurrentSubsetPageSha256:'sha256:'+createHash('sha256').update(stableGoalBookJson(current)).digest('hex'),
  activeWrites:0,
}
writeFileSync(resolve(own,'word576.current-ordinary-subset.independent-exact-permutation.receipt.json'),JSON.stringify(proof,null,2)+'\n',{flag:'wx'})
console.log('PASS: independently rebuilt current word576 native subset; all three complete external relations exactly permuted, all other fields except page fingerprint unchanged.')
