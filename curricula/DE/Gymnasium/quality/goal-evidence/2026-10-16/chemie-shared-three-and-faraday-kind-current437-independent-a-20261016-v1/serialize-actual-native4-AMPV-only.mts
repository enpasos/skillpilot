// SPDX-License-Identifier: Apache-2.0
// Technical serialization of frozen independent decisions; no curriculum authoring.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import ts from '/home/enpasos/projects/skillpilot/app/node_modules/typescript/lib/typescript.js'
const R='/home/enpasos/projects/skillpilot'
const E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
const relativeOut=`${E}/chemie-shared-three-and-faraday-kind-current437-independent-a-20261016-v1`
const O=resolve(R,relativeOut)
const T=resolve(R,E,'chemie-combined639-shared-six-exam-seven-native-four-private-L3-technical-20261016-v1')
const K=resolve(R,'tmp/chemie-m7-resumed-20261016/chemie-combined639-shared-and-seven-final-review-capsule-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const firstPath=resolve(O,'FIRST.actual-native-four-current-L3-science.before-serialization.frozen.json')
const first=read(firstPath),seal={sha256:'sha256:201149e702b6cbe51c2ecce9ac546d89f791745b065619ae0949a6f75c3bf347'}
assert.equal(sha(firstPath),seal.sha256)
const firstRef=`${relativeOut}/FIRST.actual-native-four-current-L3-science.before-serialization.frozen.json ${seal.sha256}`
const landscapePath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const landscape=read(resolve(K,landscapePath)),by=new Map<string,any>(landscape.goals.map((g:any)=>[g.id,g]))
assert.equal(sha(resolve(K,landscapePath)),'sha256:b3c50a6a0782247375dbad00a76a4ef5d5035030c12cbc2e9b190865e1ed33e1')
const ids=first.rows.map((r:any)=>r.goalId),now=new Date().toISOString(),reviewer='/root/chemie_native9_fresh_independent_a_20261016'
const runId='chemie-shared-three-and-faraday-kind-current437-independent-a-20261016-v1'
const save=(name:string,x:any,jsonl=false)=>{const p=resolve(O,name);writeFileSync(p,jsonl?x.map((r:any)=>JSON.stringify(r)).join('\n')+'\n':JSON.stringify(x,null,2)+'\n');return p}

// Stock private fingerprint routines are evaluated exactly after type erasure.
// This avoids invoking their CLI mains or running a broader review scope.
function stockFingerprint(module:string,endMarker:string){
 const path=resolve(K,'app/scripts',module),source=readFileSync(path,'utf8')
 const start=source.indexOf('function normalizeText('),end=source.indexOf(endMarker,start)
 assert.ok(start>=0&&end>start)
 const fragment=source.slice(start,end)
 const js=ts.transpileModule(fragment,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText
 return {path:resolve('app/scripts',module),sourceSha256:sha(path),fragmentSha256:'sha256:'+createHash('sha256').update(fragment).digest('hex'),fn:new Function('createHash',js+';return fingerprintGoal;')(createHash)}
}
const afp=stockFingerprint('semanticAtomicityReview.ts','function isLeaf(')
const mfp=stockFingerprint('memoryCardReview.ts','function fingerprintMemoryCard(')
const aRows=first.rows.map((s:any)=>({schemaVersion:1,reviewId:runId,ruleVersion:'semantic-atomicity-v1',landscapeId:landscape.landscapeId,goalId:s.goalId,fingerprint:afp.fn(by.get(s.goalId),'semantic-atomicity-v1'),status:'atomic',semanticAtomic:true,reviewedAt:now,reviewer,reason:s.unit+' '+s.source+' Frozen first judgment: '+firstRef}))
const common={schemaVersion:1,reviewId:runId,landscapeId:landscape.landscapeId,landscapePath}
save('A4.current-independent.review.jsonl',aRows,true)
save('A4.current-independent.config.json',{...common,ruleVersion:'semantic-atomicity-v1',reviewPath:`${relativeOut}/A4.current-independent.review.jsonl`,scope:{label:'Independent A current four ordinary goals only',leafGoalIds:ids}})

const {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile,validatePositiveGoalEvidenceRecordSemantics}=await import(`${K}/app/scripts/positiveGoalEvidenceProfileModel.ts`)
const pInputs=readFileSync(resolve(T,'P4.whole-author-cases.current-L3.valid-lowercase-review-id.only.jsonl'),'utf8').trim().split(/\r?\n/).map(JSON.parse)
const kinds=new Map<string,string>(read(resolve(T,'SEMANTIC639.current-L3.classification-bindings-not-new-science.json')).decisions.map((d:any)=>[d.goalId,d.semanticKind]))
assert.deepEqual([...pInputs.map((p:any)=>p.goalId)].sort(),[...ids].sort())
const pRows=ids.map((id:string,index:number)=>{
 const input=pInputs.find((p:any)=>p.goalId===id)
 const g=by.get(input.goalId),resourceDigests:Record<string,string>={}
 for(const link of g.resourceLinks??[])if(link.type==='goal-visualization')resourceDigests[link.url]=sha(resolve(K,'app/public',link.url.slice(1)))
 assert.equal(input.goalFingerprint,fingerprintGoalForPositiveEvidence(g,kinds.get(g.id)))
 assert.equal(input.reviewInputFingerprint,fingerprintPositiveGoalEvidenceReviewInput(g,input.reviewCriteriaFingerprint,resourceDigests,kinds.get(g.id)))
 assert.equal(input.profileFingerprint,fingerprintPositiveGoalEvidenceProfile(input.profile))
 const row={...input,reviewId:runId,status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:now,reviewer,reason:first.rows[index].P+' Current independently inspected native page, source/prerequisite context and materials support this unchanged complete profile. Frozen first judgment: '+firstRef,evidenceLevel:'E0',maximumClaimScope:'G0',reviewRunIds:[],dissent:['Current independent AI design review only; separate human approval and actual learner evidence remain absent.']}
 assert.equal(JSON.stringify(row.profile),JSON.stringify(input.profile))
 assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(row,g,resourceDigests,kinds.get(g.id)),[])
 return row
})
save('P4.current-independent.review.jsonl',pRows,true)
save('P4.current-independent.config.json',{$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',schemaVersion:2,reviewId:runId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',landscapeId:landscape.landscapeId,landscapePath,semanticKindLedgerPath:`${E}/chemie-combined639-shared-six-exam-seven-native-four-private-L3-technical-20261016-v1/SEMANTIC639.current-L3.classification-bindings-not-new-science.json`,reviewCriteriaPath:'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md',reviewPath:`${relativeOut}/P4.current-independent.review.jsonl`,reviewedResourceTypes:['goal-visualization'],requireApproved:false,scope:{label:'Independent nonauthor current four profile designs, E0/G0 only',goalIds:ids}})

const activeM=read(resolve(K,'curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json'))
const mInputs=readFileSync(resolve(K,activeM.reviewPath),'utf8').trim().split(/\r?\n/).map(JSON.parse)
const mRows=first.rows.map((s:any)=>{
 const input=mInputs.find((r:any)=>r.goalId===s.goalId),required=s.M.startsWith('memory_required:')
 assert.ok(input)
 assert.equal(input.status,required?'memory_required':'no_memory_needed')
 const row:any={schemaVersion:1,reviewId:runId,ruleVersion:'memory-card-review-v1',landscapeId:landscape.landscapeId,goalId:s.goalId,fingerprint:mfp.fn(by.get(s.goalId),'memory-card-review-v1'),status:required?'memory_required':'no_memory_needed',memoryUseful:required,reviewedAt:now,reviewer,reason:s.M+' All current existing memory references are retained; this is a bounded necessity/binding review and no wholesale memory-layer acceptance. Frozen first judgment: '+firstRef}
 if(required){row.memoryGoalIds=input.memoryGoalIds;row.deckIds=input.deckIds}
 return row
})
save('M4.current-independent.review.jsonl',mRows,true)
save('M4.current-independent.config.json',{...common,ruleVersion:'memory-card-review-v1',reviewPath:`${relativeOut}/M4.current-independent.review.jsonl`,scope:{label:'Bounded independent M4 goal-level decisions; card/visibility science in FIRST and finite stock receipt, no full M check implied',leafGoalIds:ids}})

const qa=read(resolve(T,'QA460.actual-L3-source-inputs.no-new-V-vote.json'))
const {isAiApprovedForCurrentAsset}=await import(`${K}/app/src/utils/goalVisualizationQaStatus.ts`)
const vRows=first.rows.map((s:any)=>{
 const input=qa.records.find((r:any)=>r.goalId===s.goalId),g=by.get(s.goalId)
 assert.ok(input);assert.equal(input.humanApproved,'no');assert.equal(input.humanIssueIdentified,'no')
 const link=g.resourceLinks.find((r:any)=>r.type==='goal-visualization')
 assert.equal(input.imageUrl,link.url)
 assert.equal(input.assetSha256,sha(resolve(K,input.publicAssetPath)))
 assert.equal(input.assetSha256,sha(resolve(K,input.canonicalAssetPath)))
 const row={...input,aiApproved:'yes',aiApprovedAssetSha256:input.assetSha256,aiReviewedAt:now,aiReviewer:reviewer,aiNotes:s.V+' Actual current PDF page inspected; exact asset only. Frozen first judgment: '+firstRef}
 assert.ok(isAiApprovedForCurrentAsset(row))
 return row
})
save('V4.current-exact-assets-independent.qa.json',{...qa,records:vRows})

const files=['A4.current-independent.config.json','A4.current-independent.review.jsonl','P4.current-independent.config.json','P4.current-independent.review.jsonl','M4.current-independent.config.json','M4.current-independent.review.jsonl','V4.current-exact-assets-independent.qa.json']
const receipt={role:'Technical serialization only from sealed independent first science',firstScience:{path:firstRef.split(' ')[0],sha256:seal.sha256},canonicalSha256:sha(resolve(K,landscapePath)),A4:aRows.length,P4:pRows.length,M4:{count:mRows.length,memoryRequired:mRows.filter((r:any)=>r.status==='memory_required').length,noMemoryNeeded:mRows.filter((r:any)=>r.status==='no_memory_needed').length},V4:vRows.length,wholePProfilesExact:true,positiveStockSemanticsErrors:0,allFourCurrentVisualHashesMatchCanonicalAndPublicBytes:true,stockFingerprintSources:[{module:afp.path,sourceSha256:afp.sourceSha256,fragmentSha256:afp.fragmentSha256},{module:mfp.path,sourceSha256:mfp.sourceSha256,fragmentSha256:mfp.fragmentSha256}],files:files.map(name=>({path:`${relativeOut}/${name}`,sha256:sha(resolve(O,name))})),HumanApproval:false,HumanTrial:false,M7Claim:false,normalPromotion:false}
save('SERIALIZATION.A4-P4-M4-V4.actual-stock-bindings.receipt.json',receipt)
assert.equal(sha(firstPath),seal.sha256)
console.log(JSON.stringify({A4:aRows.length,P4:pRows.length,M4:mRows.length,V4:vRows.length,positiveSemanticsErrors:0,firstScienceExact:true}))
