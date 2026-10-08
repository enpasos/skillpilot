// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {loadGoalBookBuildInputs,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url)),read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const guard=read(resolve(own,'reviewed-supplement-adoption.candidate.guard.json'))
const loaded=await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-biology-national-atlas.json',root),actual=loaded.model
const expected=read(resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-basis2-source-supplement-technical-author-resumed-v1/native/full394.ordinary-source-supplement.actual-model.json'))
assert.equal(actual.pages.length,394);assert.equal(expected.pages.length,394)
const wholePageDiffs=expected.pages.flatMap((before:any)=>{const after=actual.pages.find(p=>p.goalId===before.goalId)!;assert.ok(after);const changed=Object.keys({...before,...after}).filter(k=>stableGoalBookJson(before[k])!==stableGoalBookJson((after as any)[k]));return changed.length?[{goalId:before.goalId,changedKeys:changed,wholeBefore:before,wholeActual:after}]:[]})
assert.deepEqual(wholePageDiffs,[],'Whole actual394 pages must exactly match the full model actually inspected by current A/B.')
const oldWord=read(resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-basis2-current-reviewed-integration-preparation-resumed-v1/native-d-existing576-context/bundle/book-model.json'))
const word=buildGoalDescriptionRolloutSubsetModel({baseModel:actual,goalIds:[guard.contextSupersessionGoalId],bookId:oldWord.book.id,title:oldWord.book.title})
const before=oldWord.pages[0],after=word.pages[0]
const withoutPermutation=(p:any)=>Object.fromEntries(Object.entries(p).filter(([k])=>!['externalReverseRequires','pageFingerprint'].includes(k)))
assert.equal(stableGoalBookJson(withoutPermutation(before)),stableGoalBookJson(withoutPermutation(after)))
const keyed=(p:any)=>[...p.externalReverseRequires].sort((a:any,b:any)=>a.goalId.localeCompare(b.goalId))
assert.equal(stableGoalBookJson(keyed(before)),stableGoalBookJson(keyed(after)))
assert.equal(actual.pages.find(p=>p.goalId==='32f47903-0788-5c27-ac88-7464f481f2f7')!.pageNumber,204)
assert.equal(actual.pages.find(p=>p.goalId==='32483d30-2162-50a5-a6cc-05b7f2467ab1')!.pageNumber,394)
const sourceModelPath=resolve(own,'checks/capsule-whole394.actual-normal-loader-model.json');writeFileSync(sourceModelPath,JSON.stringify(actual,null,2)+'\n',{flag:'wx'})
writeFileSync(resolve(own,'checks/capsule-whole394-genuine-reviewed-frame.actual.json'),JSON.stringify({schemaVersion:1,role:'ordinary whole-loader/source-frame and actual existing-word subset comparison; no new science verdict',actualPageCount:394,wholePageDifferencesToGenuineReviewedFull394:wholePageDiffs,existingWord576WholeContextEqualExceptReviewedRelationPermutation:true,wholeThreeExternalReverseRelationObjectsExactAfterKeying:true,existingWordGenuineSupersessionRetained:true,existingWordWholePUnchanged:true,fullModelPage204GoalId:'32f47903-0788-5c27-ac88-7464f481f2f7',fullModelPage394GoalId:'32483d30-2162-50a5-a6cc-05b7f2467ab1',old392AllPagesUnchangedClaim:false,activeWrites:0,humanApproval:false},null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({whole394ExactToGenuineReviewedModel:true,existing576ReviewedPermutationRetained:true,actualPage204:true,actualPage394:true,activeWrites:0}))
