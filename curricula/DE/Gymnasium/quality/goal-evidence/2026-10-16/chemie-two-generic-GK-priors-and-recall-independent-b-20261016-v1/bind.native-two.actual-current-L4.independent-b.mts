// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
const E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16',O=`${E}/chemie-two-generic-GK-priors-and-recall-independent-b-20261016-v1`,T=`${E}/chemie-combined639-two-gk-priors-native-two-private-l4-technical-20261016-v1`,A=`${E}/chemie-two-generic-GK-prior-boundaries-and-existing-recall-selection-author-20261016-v1`
const K=resolve('tmp/chemie-m7-resumed-20261016/chemie-combined639-two-GK-priors-final-review-capsule-v1'),prior=resolve('tmp/chemie-m7-resumed-20261016/chemie-combined639-current-type-corrected-review-capsule-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),rows=(p:string)=>readFileSync(p,'utf8').trim().split(/\r?\n/).map(l=>JSON.parse(l)),sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const save=(n:string,x:any)=>writeFileSync(`${O}/${n}`,JSON.stringify(x,null,2)+'\n',{flag:'wx'}),saveRows=(n:string,x:any[])=>writeFileSync(`${O}/${n}`,x.map(r=>JSON.stringify(r)).join('\n')+'\n',{flag:'wx'})
const render=read(`${T}/RENDER.actual-stock-native2-PDF-and-two-direct-pages.receipt.json`)
assert.equal(sha(render.canonical.path),'sha256:36975262a3d66998c75cca5c9bbe899d57f98b2614edcbded2baec4833e77903')
for(const artifact of [render.canonical,render.actualPDF,render.model,render.reviewInput,render.P2,...render.captures.map((x:any)=>x.capture)])assert.equal(sha(artifact.path),artifact.sha256)
const l=read(render.canonical.path),by=new Map<string,any>(l.goals.map((g:any)=>[g.id,g])),cas=read(`${A}/CAS.two-whole-ordinary-goals-and-two-generic-GK-views.author-inactive.json`)
for(const op of cas.ordinaryGoalOperations)assert.deepEqual(by.get(op.goalId),op.afterWhole)
for(const op of cas.wholeViewOperations)assert.deepEqual(read(`${K}/${op.targetPath}`),op.afterWhole)
for(const f of ['semanticAtomicityReview.ts','memoryCardReview.ts','positiveGoalEvidenceProfileModel.ts'])assert.equal(sha(`${K}/app/scripts/${f}`),sha(`${prior}/app/scripts/${f}`))
const {validatePositiveGoalEvidenceRecordSemantics:validateP}=await import(`${K}/app/scripts/positiveGoalEvidenceProfileModel.ts`)
const science=read(`${O}/science.native-two.actual-pages.independent-b.json`),ids=science.ordinaryJudgments.map((g:any)=>g.goalId),native=read(`${T}/native-two/round-b/description-review-input.json`),input=read(`${T}/INPUT.two-whole-current-goals-and-whole-direct-prerequisites.json`)
assert.deepEqual(ids,native.goals.map((g:any)=>g.goalId))
for(const g of input.wholeGoals)assert.deepEqual(g,by.get(g.id))
const A2=rows(`${O}/A2.actual-whole-two-incremental-independent-b.candidate.jsonl`),M2=rows(`${O}/M2.actual-whole-two-incremental-independent-b.candidate.jsonl`),P2=rows(`${O}/P2.actual-whole-two-incremental-independent-b.candidate.jsonl`),sourceP=rows(render.P2.path),qa=read(`${T}/QA460.actual-l4-byte-exact-no-new-vote.json`),V2=[],checks=[]
const reviewer='/root/chemie_native9_fresh_independent_b_20261016',now=new Date().toISOString()
for(const id of ids){
 const g=by.get(id),p=P2.find(x=>x.goalId===id),n=native.goals.find((x:any)=>x.goalId===id),supplied=sourceP.find(x=>x.goalId===id),resources:Record<string,string>={}
 assert.deepEqual(p.profile,supplied.profile);assert.deepEqual(p.profile,n.reviewContext.evidenceProfile.profile);assert.equal(p.goalFingerprint,n.goalFingerprint)
 for(const link of g.resourceLinks??[])if(link.type==='goal-visualization')resources[link.url]=sha(`${K}/app/public${link.url}`)
 assert.deepEqual(validateP(p,g,resources,'curricularAtomic'),[])
 const v=qa.records.find((x:any)=>x.goalId===id);assert.ok(v);assert.equal(v.description,g.description);assert.equal(v.title,g.title);assert.ok(Object.values(resources).includes(v.assetSha256));assert.equal(v.assetSha256,n.reviewContext.page.visualization.originalDigest)
 const judgment=science.ordinaryJudgments.find((x:any)=>x.goalId===id),note=judgment.rationale+' Actual original and current native page viewed independently. No actual learner measurement/experiment or human approval is inferred.'
 const nv={...v,umlautsCorrectChatGpt:true,contentApprovedChatGpt:true,chatGptReviewedAt:now,chatGptReviewer:reviewer,chatGptNotes:note,aiApproved:true,aiApprovedAssetSha256:v.assetSha256,aiReviewedAt:now,aiReviewer:reviewer,aiNotes:note}
 const humanKeys=Object.keys(v).filter(k=>k.startsWith('human'));for(const key of humanKeys)assert.deepEqual(nv[key],v[key]);V2.push(nv)
 checks.push({goalId:id,actualPhysicalPDFPage:judgment.physicalPDFPage,currentCanonicalWholeExactCAS:true,wholeCurrentPAndFiveCasesExact:true,stockPositiveSemanticErrors:0,goalFingerprint:n.goalFingerprint,pageFingerprint:n.pageFingerprint,imageDigest:v.assetSha256,humanFieldsPreservedExactly:humanKeys})
}
const currentP=P2.map(p=>({...p,dissent:['Actual independent current nativeD2 reviewed and KEEP; human approval/trial absent.'],reason:p.reason+' Actual current nativeD2 pages independently viewed and whole currentL4 context/P verified.'}))
for(const [n,r] of [['A2',A2],['M2',M2],['P2',currentP],['V2',V2]] as [string,any[]][])saveRows(`${n}.actual-current-L4-informed-independent-b.review.jsonl`,ids.map((id:string)=>r.find(x=>x.goalId===id)))
save('CHECK.native-two-current-L4-whole-context-AMPV-bindings.independent-b.json',{role:'Actual independent B currentL4 context/AMPV binding checks after own native2 science seal',canonical:render.canonical,PDF:render.actualPDF,modelDigest:render.modelDigest,records:checks,actualL4ViewsWholeExactTwoCASAfter:true,stockFingerprintFunctionsIdenticalToOwnExecutedInitialBinder:true,wholeP2BodiesExact:true,nativeD2ActuallyViewed:true,oldPendingScienceAndScopeSealPreserved:true,HumanApproval:false,HumanTrial:false,M7Claim:false})
console.log(JSON.stringify({A:2,M:2,P:2,V:2,actualCurrentL4WholeAndViewsExact:true,wholeP2Exact:true,stockPositiveSemanticErrors:0,HumanFieldsExact:true}))
