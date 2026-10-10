// SPDX-License-Identifier: Apache-2.0
// Read unchanged standard APIs. No helper, selector or validation instrumentation.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {createHash} from 'node:crypto'
import {loadGoalBookBuildInputs,stableGoalBookJson} from './isolated-normal-capsule/app/scripts/goalBookModel.ts'
const root=resolve('.'),p='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-protected-twelve-current-native-technical-author-20261010-v1'
const read=(f:string)=>JSON.parse(readFileSync(resolve(root,f),'utf8'))
const bind=(f:string)=>{const b=readFileSync(resolve(root,f));return {path:f,sha256:'sha256:'+createHash('sha256').update(b).digest('hex'),bytes:b.length}}
const put=(f:string,x:any)=>{assert.ok(f.startsWith(p+'/'));mkdirSync(dirname(resolve(root,f)),{recursive:true});writeFileSync(resolve(root,f),JSON.stringify(x,null,2)+'\n')}
const before=await loadGoalBookBuildInputs(p+'/native/before-whole-normal-book.config.json',root)
const after=await loadGoalBookBuildInputs(p+'/native/after-whole-normal-book.config.json',root)
assert.equal(before.model.pages.length,381);assert.equal(after.model.pages.length,398)
put(p+'/native/before-whole-with-current-protected-P-model.actual.json',before.model)
put(p+'/native/after-whole-with-current-protected-P-model.actual.json',after.model)
const scope=read(p+'/checks/actual-full381-to398-protected180-context-deltas.json')
const pBindingProof=read(p+'/checks/whole12-old-records-and-current-normal-P-A-M-kind-fingerprints.actual.json')
const metadata=new Set(['ordinal','navigationOrder','treeOrder','pageNumber','pageFingerprint'])
const content=(v:any):any=>Array.isArray(v)?v.map(content):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).filter(([k])=>!metadata.has(k)).map(([k,x])=>[k,content(x)])):v
const rows=scope.actualDeltaGoalIds.map((id:string)=>{
 const b=before.model.pages.find(x=>x.goalId===id),a=after.model.pages.find(x=>x.goalId===id)
 assert.ok(b&&a&&b.evidenceReview&&a.evidenceReview)
 const binding=pBindingProof.rows.find((x:any)=>x.goalId===id);assert.ok(binding)
 assert.equal(b.evidenceReview.profileFingerprint,a.evidenceReview.profileFingerprint)
 assert.equal(b.evidenceReview.reviewInputFingerprint,binding.normalBeforeReviewInputFingerprint)
 assert.equal(a.evidenceReview.reviewInputFingerprint,binding.normalAfterReviewInputFingerprint)
 return {goalId:id,wholeBeforePage:b,wholeInactiveAfterPage:a,actualChangedSubstantiveFields:Object.keys({...b,...a}).filter(k=>!metadata.has(k)&&stableGoalBookJson(content((b as any)[k]))!==stableGoalBookJson(content((a as any)[k]))),wholeExistingPProfileLoadedInBothNormalModels:true,currentTechnicalPInputPendingIndependentScience:binding.currentTargetedScientificPReviewPending}
})
const afterBy=new Map(after.model.pages.map(x=>[x.goalId,x]))
const actualProtectedIds=before.model.pages.filter(b=>scope.protectedStrict180Ids.includes(b.goalId)&&afterBy.has(b.goalId)&&stableGoalBookJson(content(b))!==stableGoalBookJson(content(afterBy.get(b.goalId)))).map(x=>x.goalId)
assert.deepEqual([...actualProtectedIds].sort(),[...scope.actualDeltaGoalIds].sort())
assert.equal(rows.length,12)
put(p+'/checks/normal-full381-to398-with-whole-P12-inputs.actual.json',{schemaVersion:1,role:'Actual normal full-model preparation and exact existing protected P input presence; no independent scientific review',normalAPI:'loadGoalBookBuildInputs',beforePageCount:381,afterPageCount:398,wholeBeforeModel:bind(p+'/native/before-whole-with-current-protected-P-model.actual.json'),wholeAfterModel:bind(p+'/native/after-whole-with-current-protected-P-model.actual.json'),wholeCurrentProtected180Ids:scope.protectedStrict180Ids,actualCurrentChangedProtectedGoalIds:actualProtectedIds,actualCurrentChangedProtectedCount:12,allWholeP12ProfilesActuallyLoaded:true,rows,activeWrites:[],strictGain:0,newIndependentScientificReviews:0,humanApproval:false})
console.log(JSON.stringify({actualBefore381:before.model.pages.length,actualAfter398:after.model.pages.length,actualProtectedContextDeltas:actualProtectedIds.length,wholeCurrentP12ProfilesLoaded:true,activeWrites:0,strictGain:0}))
