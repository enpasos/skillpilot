// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync, writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'

const root=process.env.BASIS2_WORKSPACE_ROOT!,own=process.env.BASIS2_AUTHOR_OUTPUT!
const {buildGoalDescriptionRolloutSubsetModel}=await import(pathToFileURL(resolve('app/scripts/materializeGoalDescriptionRolloutBatch.ts')).href)
const {stableGoalBookJson}=await import(pathToFileURL(resolve('app/scripts/goalBookModel.ts')).href)
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const priorPath=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-basis2-current-reviewed-integration-preparation-resumed-v1/native-d-existing576-context/bundle/book-model.json')
const prior=read(priorPath),model=read(resolve(own,'native/full394.ordinary-source-supplement.actual-model.json'))
const gid='576d59e2-397a-5654-b853-7c0c4870fbd3'
const current=buildGoalDescriptionRolloutSubsetModel({baseModel:model,goalIds:[gid],bookId:prior.book.id,title:prior.book.title})
const before=prior.pages[0],after=current.pages[0]
const changedKeys=Object.keys({...before,...after}).filter(key=>stableGoalBookJson(before[key])!==stableGoalBookJson(after[key]))
writeFileSync(resolve(own,'checks/current-word576.native-subset-page.context-comparison.json'),JSON.stringify({
  role:'Actual comparison with previously independently reviewed native word-context page; no new scientific verdict',
  goalId:gid,priorActuallyReviewedNativeSubsetPath:priorPath.slice(root.length+1),
  exactPriorWholeNativePage:changedKeys.length===0,changedKeys,wholeBefore:before,wholeCurrentSubsetPage:after,
  oldFull392PageDifference:'One extra reverseRequires reference to unchanged new coupling goal at page394; no change to word semantics, prerequisites or native one-page context.',
  existingWordContextResolutionIndex:'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-basis2-current-reviewed-integration-preparation-resumed-v1/native-d-existing576-context/resolution-index.json',
  restoreBaselineWordIndexWithoutSupersession:false,
  noNewScientificReviewByAuthor:true,activeWrites:0,humanApproval:false,
},null,2)+'\n',{flag:'wx'})
assert.deepEqual(changedKeys,[])
console.log('PASS: current word576 native subset page exactly equals the actually independently reviewed word-context page; retain that existing genuine context supersession.')
