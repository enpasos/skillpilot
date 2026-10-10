// SPDX-License-Identifier: Apache-2.0
// Read-only independent mechanical verification; no science release from a hash.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {resolve} from 'node:path'
import {createHash} from 'node:crypto'
const root=process.cwd()
const {stableGoalBookJson,fingerprintSemanticKindSourceGoal}=await import(resolve(root,'app/scripts/goalBookModel.ts'))
const {expandGoalBookSourceAtlasReceipt,buildGoalBookSourceAtlasInputs}=await import(resolve(root,'app/scripts/goalBookSourceAtlasInputs.ts'))
const B='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-3312-authored-operationalization-primary-source-author-successor-v3'
const A='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-3312-authored-source-native-independent-a-20261010-v1'
const ID='3312b2bb-bc90-5c0f-a859-4b4f9b8ff117',SID='8229f9d4-78f9-4968-8667-0c93aba0c0d6'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const digest=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const same=(a:any,b:any)=>stableGoalBookJson(a)===stableGoalBookJson(b)
const freeze=read(`${B}/author.final.freeze.json`)
assert.equal(digest(`${B}/author.final.freeze.json`),'sha256:64dc6b88632e27773ece5ed3a3be5e82569499a1e0fe22ded1fa98d719909353')
for(const x of [freeze.neutralEntry,...freeze.artifacts,...freeze.preservedWholeOriginalBindings]){
 assert.equal(digest(x.path),x.sha256,`Frozen input changed: ${x.path}`)
 if(x.bytes!==undefined)assert.equal(readFileSync(x.path).length,x.bytes)
}
const models=['before','after'].map(s=>read(`${B}/normal/national394-${s}.actual-model.json`))
assert.deepEqual(models[0],models[1]);assert.equal(models[0].pages.length,394)
const ids=read(`${B}/inputs/protected315-baseline-IDs.exact.json`).subjects.find((s:any)=>s.subject==='biologie').strictCompleteGoalIds
assert.equal(ids.length,315);assert.ok(!ids.includes(ID))
const pages=new Map(models[0].pages.map((p:any)=>[p.goalId,p]));for(const id of ids)assert.ok(pages.has(id))
const rowsByFamily:any={};const edgeChangesByFamily:any={}
for(const n of [144,150]){
 const be=read(`${B}/inputs/whole${n}-source-extraction.exact.json`),ae=read(`${B}/candidate/whole${n}-only8229-authored-operationalization.source-extraction.json`)
 assert.equal(be.sourceGoals.length,n);assert.equal(ae.sourceGoals.length,n)
 assert.deepEqual(be.sourceGoals.map((x:any)=>x.id),ae.sourceGoals.map((x:any)=>x.id))
 const changed=ae.sourceGoals.filter((x:any,i:number)=>!same(x,be.sourceGoals[i])).map((x:any)=>x.id);assert.deepEqual(changed,[SID])
 assert.deepEqual(be.passages,ae.passages)
 const bm=read(`${B}/inputs/whole${n}-mapping.exact.json`),am=read(`${B}/candidate/whole${n}-only8229-partial-edge.review.json`)
 assert.equal(bm.mappings.length,am.mappings.length)
 const delta=am.mappings.flatMap((x:any,i:number)=>same(x,bm.mappings[i])?[]:[{index:i,before:bm.mappings[i],after:x}])
 assert.equal(delta.length,1);assert.equal(delta[0].after.legacyGoalId,SID);assert.equal(delta[0].after.canonicalGoalId,ID);assert.equal(delta[0].before.matchType,'exact');assert.equal(delta[0].after.matchType,'partial')
 const decDelta=am.decisions.flatMap((x:any,i:number)=>same(x,bm.decisions[i])?[]:[i]);assert.deepEqual(decDelta,[61])
 rowsByFamily[n]={wholeCount:n,changedIds:changed,otherExactCount:n-1,wholePassagesExact:true,allOtherDecisionsExact:true};edgeChangesByFamily[n]=delta
}
const compact=['before','after'].map(s=>read(`${B}/normal/atlas-${s}-outputs/source-projection.receipt.json`))
const receipt=compact.map(expandGoalBookSourceAtlasReceipt)
assert.deepEqual(receipt[0].counts,receipt[1].counts);assert.equal(receipt[0].counts.canonicalCurricularAtomicGoals,394)
assert.deepEqual(receipt[0].scopes.map((s:any)=>[s.key,s.goalIds]),receipt[1].scopes.map((s:any)=>[s.key,s.goalIds]))
const src=['inputs/whole144-source-extraction.exact.json','candidate/whole144-only8229-authored-operationalization.source-extraction.json'].map(p=>read(`${B}/${p}`))
const mp=['inputs/whole144-mapping.exact.json','candidate/whole144-only8229-partial-edge.review.json'].map(p=>read(`${B}/${p}`))
const witnesses=receipt.map((r:any)=>r.scopes.flatMap((s:any)=>s.witnesses))
const sci=(i:number,id:string)=>witnesses[i].filter((r:any)=>r.goalId===id).map((r:any)=>{
 const x={...r};delete x.mappingPath;delete x.sourceExtractionPath
 if(r.sourceGoalId===SID){x.actualCurrentSourceRow=src[i].sourceGoals.find((g:any)=>g.id===SID);x.actualCurrentMappingRows=mp[i].mappings.filter((g:any)=>g.legacyGoalId===SID)}
 return stableGoalBookJson(x)
}).sort()
const witnessDelta=models[0].pages.filter((p:any)=>!same(sci(0,p.goalId),sci(1,p.goalId))).map((p:any)=>p.goalId)
assert.deepEqual(witnessDelta,[ID]);assert.deepEqual(ids.filter((id:string)=>witnessDelta.includes(id)),[])
const entry=read(`${B}/neutral-current3312-authored-source-and-native-one.independent-review.entry.json`)
const whole=read(entry.neutralWholeFirstInputs.whole479CurrentGoalBodies.path)
const ledger=read(entry.neutralWholeFirstInputs.wholeCurrent3312SemanticSourceFingerprintInput.path)
const decision=ledger.decisions.find((x:any)=>x.goalId===ID)
assert.equal(fingerprintSemanticKindSourceGoal(whole.goals.find((g:any)=>g.id===ID)),decision.sourceFingerprint)
const actualAtlasResults:any=[]
for(const stage of ['before','after']){
 const cfg=read(`${B}/normal/actual-operative144-atlas-${stage}.config.json`)
 assert.ok(cfg.mappingPaths.some((p:string)=>p.includes('whole144')||p.includes('HE144')))
 assert.ok(!cfg.mappingPaths.some((p:string)=>p.includes('whole150')))
 const result=buildGoalBookSourceAtlasInputs(cfg,root)
 assert.deepEqual(result.receipt.counts,receipt[stage==='before'?0:1].counts)
 assert.deepEqual(result.receipt.scopes.map((s:any)=>[s.key,s.goalIds]),receipt[stage==='before'?0:1].scopes.map((s:any)=>[s.key,s.goalIds]))
 actualAtlasResults.push({stage,ordinaryPureAPI:'buildGoalBookSourceAtlasInputs',computedInMemoryOnly:true,counts:result.receipt.counts,scopeGoalSetsMatchFrozenActual:true})
}
const out={schemaVersion:1,checkedAt:new Date().toISOString(),actualAPIs:['stableGoalBookJson','expandGoalBookSourceAtlasReceipt','fingerprintSemanticKindSourceGoal','buildGoalBookSourceAtlasInputs'],authorFreezeAndOriginalBindingsExact:true,whole394ModelsExact:true,all394WholePageBodiesExact:true,protected315Ids:ids,protected315WholePagesExact:true,protected315SourceScienceDeltaIds:[],sourceRows:rowsByFamily,sourceEdgeChanges:edgeChangesByFamily,actualSourceWitnessScienceDeltaIds:witnessDelta,wholeSourceScopeGoalSetsExact:true,normalAtlasComputations:actualAtlasResults,semanticFingerprintExact:decision.sourceFingerprint,oldAMAndPScientificBodiesReused:true,newScientificReviewFromMechanicalCheck:false,activeWrites:false,historicalWrites:false,humanApproval:false,strictGain:0}
mkdirSync(`${A}/checks`,{recursive:true});writeFileSync(`${A}/checks/own-394-315-source144-150-and-normal-atlas.actual.json`,JSON.stringify(out,null,2)+'\n')
console.log(JSON.stringify({actualProtected315PageDelta:[],actualProtected315SourceDelta:[],actualSourceScienceDelta:witnessDelta,all394PagesExact:true,operative144Only:true,normalPureAtlasRuns:actualAtlasResults.length},null,2))
