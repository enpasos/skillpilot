// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import { loadGoalBookBuildInputs } from '../../../../../../../app/scripts/goalBookModel'
const own=dirname(fileURLToPath(import.meta.url)), root=resolve(own,'../../../../../../..')
const isolate=resolve(root,'tmp/biologie-q1-source-scope-remediation-native-20261006-v4')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const old=resolve(own,'../biologie-q1-four-current383-source-scope-author-remediation-v3')
const config=read(resolve(isolate,'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'))
const compiled=buildGoalBookSourceAtlasInputs(config,isolate)
for(const [p,bytes] of Object.entries(compiled.outputs)) {
  mkdirSync(dirname(resolve(isolate,p)),{recursive:true});writeFileSync(resolve(isolate,p),bytes)
}
const loaded=await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-biology-national-atlas.json',isolate)
const prior=read(resolve(old,'prospective-native383.book-model.json'))
assert.equal(loaded.model.pages.length,383)
const oldBy=new Map(prior.pages.map((p:any)=>[p.goalId,p]))
const deltas=loaded.model.pages.flatMap((page:any)=>{
  const previous:any=oldBy.get(page.goalId)
  return JSON.stringify(previous)===JSON.stringify(page)?[]:[{goalId:page.goalId,beforePage:previous,afterPage:page}]
})
assert.equal(deltas.length,0)
const previousReceipt=read(resolve(old,'source-atlas.native-technical.actual.json'))
assert.deepEqual(compiled.receipt.scopes,previousReceipt.scopes)
assert.equal(compiled.receipt.scopes.length,20)
assert.deepEqual(compiled.receipt.unresolvedSourceScopes,[])
const prefixes=['0daa79f6','475eebb4','ffef97e3','e70d8a85','0263fb84','3417bb28','74740709','e349d8c4','1ec4e3c2','76ad2d40']
const existingVisibility=prefixes.map(prefix=>{
  const p:any=loaded.model.pages.find((p:any)=>p.goalId.startsWith(prefix)); assert.ok(p)
  return {goalId:p.goalId,applicability:p.applicability,visibleSourceScopes:compiled.receipt.scopes.filter((s:any)=>s.goalIds.includes(p.goalId)).map((s:any)=>s.key)}
})
writeFileSync(resolve(own,'native-source-atlas.actual.receipt.json'),JSON.stringify(compiled.receipt,null,2)+'\n')
writeFileSync(resolve(own,'native-preserved383.book-model.actual.json'),JSON.stringify(loaded.model,null,2)+'\n')
writeFileSync(resolve(own,'native-visibility-and-book-footprint.actual.json'),JSON.stringify({checkedAtUTC:new Date().toISOString(),nativePages:383,wholePagesExactVsV3:383,changedPages:deltas,all20SourceScopesExactVsV3:true,unresolvedNativeSourceScopes:compiled.receipt.unresolvedSourceScopes,existingVisibility,nullIDCandidatesPresentInRuntime:false,sourceComponentClosure:false,nativeDRecords:0,activeWrites:0,humanApproval:false,claimLimit:'Technical visibility of preserved existing partial lanes only. Null-ID and new P components remain author candidates requiring independent scope/prerequisite/P review; no new machine closure.'},null,2)+'\n')
console.log(JSON.stringify({nativePages:383,wholePagesExact:383,sourceViews:20,unresolvedSourceScopes:0,nativeDRecords:0,activeWrites:0}))
