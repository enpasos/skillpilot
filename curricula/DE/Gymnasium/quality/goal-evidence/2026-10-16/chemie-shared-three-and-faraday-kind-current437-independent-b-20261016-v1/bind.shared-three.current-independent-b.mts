// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
import ts from '/home/enpasos/projects/skillpilot/app/node_modules/typescript/lib/typescript.js'
const E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
const O=`${E}/chemie-shared-three-and-faraday-kind-current437-independent-b-20261016-v1`
const S=`${E}/chemie-shared-carrier-three-boundaries-and-generic-four-view-author-successor-20261016-v1`
const K=resolve('tmp/chemie-m7-resumed-20261016/chemie-combined639-current-native-review-capsule-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
function stockFp(file:string,endMarker:string){const s=readFileSync(`${K}/app/scripts/${file}`,'utf8'),start=s.indexOf('function normalizeText('),end=s.indexOf(endMarker,start);assert.ok(start>=0&&end>start);const js=ts.transpileModule(s.slice(start,end),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;return new Function('createHash',js+';return fingerprintGoal;')(createHash)}
const afp=stockFp('semanticAtomicityReview.ts','function isLeaf('),mfp=stockFp('memoryCardReview.ts','function fingerprintMemoryCard(')
const {fingerprintGoalForPositiveEvidence:pFp,fingerprintPositiveGoalEvidenceReviewInput:piFp,fingerprintPositiveGoalEvidenceProfile:profileFp,validatePositiveGoalEvidenceRecordSemantics:validateP}=await import(`${K}/app/scripts/positiveGoalEvidenceProfileModel.ts`)
const ops=read(`${S}/CAS.three-ordinary-requires-only.frozen-author-v3.json`).operations
const reviewId='chemie-shared-three-and-faraday-kind-current437-independent-b-20261016-v1',reviewer='/root/chemie_native9_fresh_independent_b_20261016',reviewedAt=new Date().toISOString()
const A=[],M=[],P=[],checks=[]
for(const op of ops){
 const g=op.afterWhole,id=g.id
 const wrapper=read(`${S}/input/P.${id}.whole-existing-independent-body.json`),oldP=wrapper.wholeRecord
 const resources:Record<string,string>={}
 for(const r of g.resourceLinks??[])if(r.type==='goal-visualization')resources[r.url]=sha(`${K}/app/public${r.url}`)
 const reason='Actual independent B full current objective/prerequisite/task/material/P/image compatibility judgment sealed FIRST0d0d. Only didactic requires changes; source and full learner performance remain unchanged. Atomic scientific judgment is actual rereview, not inferred from matching hashes. No human trial/approval.'
 A.push({schemaVersion:1,reviewId,ruleVersion:'semantic-atomicity-v1',landscapeId:oldP.landscapeId,goalId:id,fingerprint:afp(g,'semantic-atomicity-v1'),status:'atomic',semanticAtomic:true,reviewedAt,reviewer,reason})
 const required=id.startsWith('4d9')
 M.push({schemaVersion:1,reviewId,ruleVersion:'memory-card-review-v1',landscapeId:oldP.landscapeId,goalId:id,fingerprint:mfp(g,'memory-card-review-v1'),status:required?'memory_required':'no_memory_needed',memoryUseful:required,reviewedAt,reviewer,reason:required?'Retain compact functional-group retrieval for biodiesel; actual chem_org_q1_002 lists alcohol/carboxylic acid/ester as needed, not carboxylate. Recall does not certify reaction planning or ecological judgment. Existing two carrier references retained; broad organic-carrier route issues remain separate, while the narrow98781 selection actually selects002.':'No additional recall atom is needed: actual method/data reasoning and evidence-bound interpretation carry this performance. Current prerequisite change adds no memorization duty.',...(required?{memoryGoalIds:['e3e8582a-976b-5f0f-b31b-3cf59a4fff24','98781dda-8049-5173-899b-42a5c2902b86'],deckIds:['de_gymnasium_chemistry_organic_q1']}:{})})
 const p={...oldP,reviewId,reviewer,reviewedAt,reason,goalFingerprint:pFp(g,'curricularAtomic'),reviewInputFingerprint:piFp(g,oldP.reviewCriteriaFingerprint,resources,'curricularAtomic'),status:'needs_human_review',reviewAuthority:'ai_candidate',evidenceLevel:'E0',maximumClaimScope:'G0',reviewRunIds:[],dissent:['Actual independent AI successor review; nativeD4 is separate and human approval/trial absent.']}
 assert.deepEqual(p.profile,oldP.profile);assert.equal(p.profileFingerprint,profileFp(p.profile));assert.deepEqual(validateP(p,g,resources,'curricularAtomic'),[]);P.push(p)
 checks.push({goalId:id,atomicityFingerprint:A.at(-1).fingerprint,memoryFingerprint:M.at(-1).fingerprint,positiveGoal:p.goalFingerprint,positiveInput:p.reviewInputFingerprint,profileFingerprint:p.profileFingerprint,completeProfileBodyExact:true,actualUnchangedImageResources:resources,positiveRecordSemanticErrors:0})
}
for(const [name,records] of [['A3',A],['M3',M],['P3',P]] as [string,any[]][])writeFileSync(`${O}/${name}.shared-three-current.actual-independent-b.review.jsonl`,records.map(x=>JSON.stringify(x)).join('\n')+'\n',{flag:'wx'})
writeFileSync(`${O}/CHECK.shared-three-current-A-M-P-stock-bindings.independent-b.json`,JSON.stringify({role:'Actual independent B serialization after sealed scientific rereview',records:checks,originalScience:'sha256:0d0d7bdc473ae8c7e748cdf1ee30320de306eca1ac19448362e2b36aec1894d7',HumanApproval:false,HumanTrial:false,M7Claim:false},null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({A:3,M:3,P:3,wholeProfilesExact:true,stockPositiveSemanticErrors:0}))
