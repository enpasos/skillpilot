// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
import ts from '/home/enpasos/projects/skillpilot/app/node_modules/typescript/lib/typescript.js'
const E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16',O=`${E}/chemie-shared-three-and-faraday-kind-current437-independent-b-20261016-v1`,T=`${E}/chemie-combined639-shared-six-exam-seven-native-four-private-L3-technical-20261016-v1`
const K=resolve('tmp/chemie-m7-resumed-20261016/chemie-combined639-shared-and-seven-final-review-capsule-v1'),C='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),rows=(p:string)=>readFileSync(p,'utf8').trim().split(/\r?\n/).map(l=>JSON.parse(l)),sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const save=(n:string,x:any)=>writeFileSync(`${O}/${n}`,JSON.stringify(x,null,2)+'\n',{flag:'wx'})
const saveRows=(n:string,x:any[])=>writeFileSync(`${O}/${n}`,x.map(r=>JSON.stringify(r)).join('\n')+'\n',{flag:'wx'})
const l=read(`${K}/${C}`);assert.equal(sha(`${K}/${C}`),'sha256:b3c50a6a0782247375dbad00a76a4ef5d5035030c12cbc2e9b190865e1ed33e1')
const by=new Map<string,any>(l.goals.map((g:any)=>[g.id,g])),input=read(`${T}/INPUT.four-whole-current-goals-and-whole-direct-prerequisites.json`),nativeInput=read(`${T}/native-four/round-b/description-review-input.json`)
const science=read(`${O}/science.native-four.actual-pages.independent-b.json`),ids=science.ordinaryJudgments.map((g:any)=>g.goalId)
assert.deepEqual(ids,nativeInput.goals.map((g:any)=>g.goalId))
for(const g of input.wholeGoals)assert.deepEqual(g,by.get(g.id))
const a=[...rows(`${O}/A3.shared-three-current.actual-independent-b.review.jsonl`),...rows(`${O}/A1.ordinary-kind-current.actual-independent-b.review.jsonl`)]
const m=[...rows(`${O}/M3.shared-three-current.actual-independent-b.review.jsonl`),...rows(`${O}/M1.ordinary-kind-current.actual-independent-b.review.jsonl`)]
const p=[...rows(`${O}/P3.shared-three-current.actual-independent-b.review.jsonl`),...rows(`${O}/P1.ordinary-kind-current.actual-independent-b.review.jsonl`)]
const sourceP=rows(`${T}/P4.whole-author-cases.current-L3.valid-lowercase-review-id.only.jsonl`)
function stockFp(file:string,endMarker:string){const s=readFileSync(`${K}/app/scripts/${file}`,'utf8'),start=s.indexOf('function normalizeText('),end=s.indexOf(endMarker,start);assert.ok(start>=0&&end>start);const js=ts.transpileModule(s.slice(start,end),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;return new Function('createHash',js+';return fingerprintGoal;')(createHash)}
const afp=stockFp('semanticAtomicityReview.ts','function isLeaf('),mfp=stockFp('memoryCardReview.ts','function fingerprintMemoryCard(')
const {fingerprintGoalForPositiveEvidence:pFp,fingerprintPositiveGoalEvidenceReviewInput:piFp,validatePositiveGoalEvidenceRecordSemantics:validateP}=await import(`${K}/app/scripts/positiveGoalEvidenceProfileModel.ts`)
const qa=read(`${T}/QA460.actual-L3-source-inputs.no-new-V-vote.json`),V=[],checks=[]
const now=new Date().toISOString(),reviewer='/root/chemie_native9_fresh_independent_b_20261016'
for(const id of ids){
 const g=by.get(id),ar=a.find(x=>x.goalId===id),mr=m.find(x=>x.goalId===id),pr=p.find(x=>x.goalId===id),sr=sourceP.find(x=>x.goalId===id)
 assert.deepEqual(pr.profile,sr.profile)
 assert.equal(ar.fingerprint,afp(g,ar.ruleVersion));assert.equal(mr.fingerprint,mfp(g,mr.ruleVersion))
 const resources:Record<string,string>={}
 for(const r of g.resourceLinks??[])if(r.type==='goal-visualization')resources[r.url]=sha(`${K}/app/public${r.url}`)
 assert.equal(pr.goalFingerprint,pFp(g,'curricularAtomic'));assert.equal(pr.reviewInputFingerprint,piFp(g,pr.reviewCriteriaFingerprint,resources,'curricularAtomic'));assert.deepEqual(validateP(pr,g,resources,'curricularAtomic'),[])
 const v=qa.records.find((x:any)=>x.goalId===id);assert.ok(v);assert.equal(v.description,g.description);assert.equal(v.title,g.title);assert.ok(Object.values(resources).includes(v.assetSha256))
 const page=nativeInput.goals.find((x:any)=>x.goalId===id).reviewContext.page
 assert.equal(page.visualization.originalDigest,v.assetSha256)
 const note=science.ordinaryJudgments.find((x:any)=>x.goalId===id).rationale+' Actual original image and physical native page viewed by this independent reviewer. Same image/text and whole P remain scientifically compatible; prerequisite-only/context metadata changes do not invent learner evidence or human approval.'
 const nv={...v,umlautsCorrectChatGpt:true,contentApprovedChatGpt:true,chatGptReviewedAt:now,chatGptReviewer:reviewer,chatGptNotes:note,aiApproved:true,aiApprovedAssetSha256:v.assetSha256,aiReviewedAt:now,aiReviewer:reviewer,aiNotes:note}
 const humanKeys=Object.keys(v).filter(k=>k.startsWith('human'));for(const key of humanKeys)assert.deepEqual(nv[key],v[key])
 V.push(nv);checks.push({goalId:id,wholeCanonicalGoalMatchesCurrentL3:true,currentCanonicalKind:'ordinary curricularAtomic',actualNativePhysicalPage:science.ordinaryJudgments.find((x:any)=>x.goalId===id).physicalPDFPage,wholeCurrentProfileBodyExact:true,positiveSemanticErrors:0,atomicityFingerprint:ar.fingerprint,memoryFingerprint:mr.fingerprint,positiveGoal:pr.goalFingerprint,positiveInput:pr.reviewInputFingerprint,pageFingerprint:page.pageFingerprint,actualOriginalImageDigest:v.assetSha256,humanFieldsPreservedExactly:humanKeys})
}
for(const [n,r] of [['A4',a],['M4',m],['P4',p],['V4',V]] as [string,any[]][])saveRows(`${n}.actual-current-L3-informed-independent-b.review.jsonl`,ids.map((id:string)=>r.find(x=>x.goalId===id)))
const render=read(`${T}/RENDER.actual-stock-Native4-PDF-and-four-direct-pages.receipt.json`)
for(const artifact of [render.actualPDF,render.model,render.reviewInput,...render.captures.map((x:any)=>x.capture)])assert.equal(sha(artifact.path),artifact.sha256)
assert.equal(render.canonicalSha256,sha(`${K}/${C}`))
save('CHECK.native-four-current-L3-exact-whole-context-A-M-P-V-bindings.independent-b.json',{role:'Actual independent B post-science stock binding checks; this is not new author content',canonicalSHA256:sha(`${K}/${C}`),PDF:render.actualPDF,modelDigest:render.modelDigest,currentNativeInputWholeProfilesExactlyOwnReviewedBodies:true,records:checks,allOriginalHumanFieldsExact:true,originalNineFIRST:'sha256:70cc3fe9a98d1bd1738f00cf8183d51b37a865373b4ee3e14f3cf2b55b665fc3',originalSharedFIRST:'sha256:0d0d7bdc473ae8c7e748cdf1ee30320de306eca1ac19448362e2b36aec1894d7',actualNativeFourScience:'sha256:f32155f02cf04d2dcc6412902c834e53774b1c06a3b0531be43a5aaa6d9f7257',HumanApproval:false,HumanTrial:false,M7Claim:false})
console.log(JSON.stringify({A:4,M:4,P:4,V:4,wholeP4Exact:true,allActualNativeArtifactsPinned:true,stockPositiveSemanticErrors:0,HumanFieldsExact:true}))
