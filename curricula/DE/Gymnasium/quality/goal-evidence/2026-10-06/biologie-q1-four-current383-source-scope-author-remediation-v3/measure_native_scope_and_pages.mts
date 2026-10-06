// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import { loadGoalBookBuildInputs } from '../../../../../../../app/scripts/goalBookModel'
const own=dirname(fileURLToPath(import.meta.url)), root=resolve(own,'../../../../../../..')
const isolate=resolve(root,'tmp/biologie-q1-source-scope-remediation-native-20261006-v3')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const configPath='app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
const config=read(resolve(isolate,configPath))
const compiled=buildGoalBookSourceAtlasInputs(config,isolate)
for(const [p,bytes] of Object.entries(compiled.outputs)){
  mkdirSync(dirname(resolve(isolate,p)),{recursive:true});writeFileSync(resolve(isolate,p),bytes)
}
const base=read(resolve(own,'../biologie-q1-three-current383-author-continuation-v2/prospective-full.book-model.json'))
const current=await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-biology-national-atlas.json',isolate)
assert.equal(current.model.pages.length,383)
const oldBy=new Map(base.pages.map((p:any)=>[p.goalId,p]))
const pageDeltas=current.model.pages.flatMap((p:any)=>{
 const old:any=oldBy.get(p.goalId)
 if(JSON.stringify(old)===JSON.stringify(p))return []
 const fields=[...new Set([...Object.keys(old??{}),...Object.keys(p)])].filter(k=>JSON.stringify(old?.[k])!==JSON.stringify(p[k]))
 return [{goalId:p.goalId,changedPageFields:fields,beforePage:old,candidatePage:p}]
})
const helpers=['0daa79f6','475eebb4','ffef97e3','e70d8a85','0263fb84','3417bb28','e349d8c4','1ec4e3c2','1d2b1038']
const visibility=helpers.map(prefix=>{
 const p:any=current.model.pages.find((p:any)=>p.goalId.startsWith(prefix));assert.ok(p)
 return {goalId:p.goalId,applicability:p.applicability,visibleSourceScopes:compiled.receipt.scopes.filter((s:any)=>s.goalIds.includes(p.goalId)).map((s:any)=>s.key)}
})
writeFileSync(resolve(own,'source-atlas.native-technical.actual.json'),JSON.stringify(compiled.receipt,null,2)+'\n')
writeFileSync(resolve(own,'prospective-native383.book-model.json'),JSON.stringify(current.model,null,2)+'\n')
writeFileSync(resolve(own,'native-visibility-and-book-footprint.actual.json'),JSON.stringify({checkedAt:new Date().toISOString(),basePages:base.pages.length,candidatePages:current.model.pages.length,pageDeltas,visibility,activeWrites:0,humanApproval:false,claimLimit:'Technical compilation only. Partial source components do not certify whole-goal stage demand, source closure, D or M7. All changed native contexts require independent recheck.'},null,2)+'\n')
console.log(JSON.stringify({nativePages:current.model.pages.length,changedPages:pageDeltas.length,sourceViews:compiled.receipt.scopes.length,activeWrites:0}))
