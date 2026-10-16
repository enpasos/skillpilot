// SPDX-License-Identifier: Apache-2.0
// Technical serialization of frozen independent decisions; no curriculum authoring.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import ts from '/home/enpasos/projects/skillpilot/app/node_modules/typescript/lib/typescript.js'
const R='/home/enpasos/projects/skillpilot'
const E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
const relativeOut=`${E}/chemie-native9-current437-fresh-independent-a-20261016-v1`
const O=resolve(R,relativeOut)
const T=resolve(R,E,'chemie-current437-nine-targeted-native-pages-combined639-technical-20261016-v1')
const K=resolve(R,'tmp/chemie-m7-resumed-20261016/chemie-combined639-current-native-review-capsule-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const firstPath=resolve(O,'FIRST.independent-current-nine-science-and-separate699.frozen.json')
const first=read(firstPath),seal=read(resolve(O,'SEAL.first-science-before-native-serialization.json'))
assert.equal(sha(firstPath),seal.sha256)
const firstRef=`${relativeOut}/FIRST.independent-current-nine-science-and-separate699.frozen.json ${seal.sha256}`
const landscapePath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const landscape=read(resolve(K,landscapePath)),by=new Map<string,any>(landscape.goals.map((g:any)=>[g.id,g]))
assert.equal(sha(resolve(K,landscapePath)),'sha256:0c4277b9bc9ec90740dbe5b885e35cbbde777c488518252d623ce09b044b3cf9')
const ids=first.rows.map((r:any)=>r.goalId),now=new Date().toISOString(),reviewer='/root/chemie_native9_fresh_independent_a_20261016'
const runId='chemie-native9-current437-fresh-independent-a-20261016-v1'
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
save('A9.current-independent.review.jsonl',aRows,true)
save('A9.current-independent.config.json',{...common,ruleVersion:'semantic-atomicity-v1',reviewPath:`${relativeOut}/A9.current-independent.review.jsonl`,scope:{label:'Independent A current nine ordinary goals only',leafGoalIds:ids}})

const {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile,validatePositiveGoalEvidenceRecordSemantics}=await import(`${K}/app/scripts/positiveGoalEvidenceProfileModel.ts`)
const pInputs=readFileSync(resolve(T,'P9.whole-author-profiles.current-page-inputs.only.jsonl'),'utf8').trim().split(/\r?\n/).map(JSON.parse)
const kinds=new Map<string,string>(read(resolve(T,'SEMANTIC639.descriptive-classification.for-review-only.json')).decisions.map((d:any)=>[d.goalId,d.semanticKind]))
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
save('P9.current-independent.review.jsonl',pRows,true)
save('P9.current-independent.config.json',{$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',schemaVersion:2,reviewId:runId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',landscapeId:landscape.landscapeId,landscapePath,semanticKindLedgerPath:`${E}/chemie-current437-nine-targeted-native-pages-combined639-technical-20261016-v1/SEMANTIC639.descriptive-classification.for-review-only.json`,reviewCriteriaPath:'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md',reviewPath:`${relativeOut}/P9.current-independent.review.jsonl`,reviewedResourceTypes:['goal-visualization'],requireApproved:false,scope:{label:'Independent nonauthor current nine profile designs, E0/G0 only',goalIds:ids}})

const mInputs=readFileSync(resolve(T,'M437.current-prospective-decisions.v2-aggregate-review-id.not-new-science.jsonl'),'utf8').trim().split(/\r?\n/).map(JSON.parse)
const mRows=first.rows.map((s:any)=>{
 const input=mInputs.find((r:any)=>r.goalId===s.goalId),required=s.M.startsWith('memory_required:')
 assert.ok(input)
 assert.equal(input.status,required?'memory_required':'no_memory_needed')
 const row:any={schemaVersion:1,reviewId:runId,ruleVersion:'memory-card-review-v1',landscapeId:landscape.landscapeId,goalId:s.goalId,fingerprint:mfp.fn(by.get(s.goalId),'memory-card-review-v1'),status:required?'memory_required':'no_memory_needed',memoryUseful:required,reviewedAt:now,reviewer,reason:s.M+' All current existing memory references are retained; this is a bounded necessity/binding review and no wholesale memory-layer acceptance. Frozen first judgment: '+firstRef}
 if(required){row.memoryGoalIds=input.memoryGoalIds;row.deckIds=input.deckIds}
 assert.equal(row.fingerprint,input.fingerprint)
 return row
})
save('M9.current-independent.review.jsonl',mRows,true)
save('M9.current-independent.config.json',{...common,ruleVersion:'memory-card-review-v1',reviewPath:`${relativeOut}/M9.current-independent.review.jsonl`,scope:{label:'Bounded independent M9 goal-level decisions; card/visibility science in FIRST and finite stock receipt, no full M check implied',leafGoalIds:ids}})

const qa=read(resolve(T,'QA460.current-unapproved-candidate-contexts.json'))
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
save('V9.current-exact-assets-independent.qa.json',{...qa,records:vRows})

// Stage only this review's new serializations into the actual input capsule.
// No canonical, view, source mapping, ordinary stock ledger or asset is changed.
const files=['A9.current-independent.config.json','A9.current-independent.review.jsonl','P9.current-independent.config.json','P9.current-independent.review.jsonl','M9.current-independent.config.json','M9.current-independent.review.jsonl','V9.current-exact-assets-independent.qa.json']
for(const name of files){const target=resolve(K,relativeOut,name);mkdirSync(dirname(target),{recursive:true});copyFileSync(resolve(O,name),target)}
const receipt={role:'Technical serialization only from sealed independent first science',firstScience:{path:firstRef.split(' ')[0],sha256:seal.sha256},canonicalSha256:sha(resolve(K,landscapePath)),A9:aRows.length,P9:pRows.length,M9:{count:mRows.length,memoryRequired:mRows.filter((r:any)=>r.status==='memory_required').length,noMemoryNeeded:mRows.filter((r:any)=>r.status==='no_memory_needed').length},V9:vRows.length,wholePProfilesExact:true,positiveStockSemanticsErrors:0,allNineCurrentVisualHashesMatchCanonicalAndPublicBytes:true,stockFingerprintSources:[{module:afp.path,sourceSha256:afp.sourceSha256,fragmentSha256:afp.fragmentSha256},{module:mfp.path,sourceSha256:mfp.sourceSha256,fragmentSha256:mfp.fragmentSha256}],files:files.map(name=>({path:`${relativeOut}/${name}`,sha256:sha(resolve(O,name))})),HumanApproval:false,HumanTrial:false,M7Claim:false,normalPromotion:false}
save('SERIALIZATION.A9-P9-M9-V9.actual-stock-bindings.receipt.json',receipt)
assert.equal(sha(firstPath),seal.sha256)
console.log(JSON.stringify({A9:aRows.length,P9:pRows.length,M9:mRows.length,V9:vRows.length,positiveSemanticsErrors:0,firstScienceExact:true}))
