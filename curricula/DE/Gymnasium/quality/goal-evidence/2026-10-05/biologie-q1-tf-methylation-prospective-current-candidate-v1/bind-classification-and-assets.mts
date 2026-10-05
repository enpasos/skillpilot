// SPDX-License-Identifier: Apache-2.0
import { readFileSync,writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
const root=process.cwd(), own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-tf-methylation-prospective-current-candidate-v1'
const meta=JSON.parse(readFileSync(resolve(root,own,'prospective-paths.json'),'utf8')), iso=meta.isolationRoot
const read=(p:string)=>JSON.parse(readFileSync(resolve(iso,p),'utf8'))
const write=(p:string,x:unknown)=>writeFileSync(resolve(iso,p),JSON.stringify(x,null,2)+'\n')
const {fingerprintSemanticKindSourceGoal}=await import(pathToFileURL(resolve(iso,'app/scripts/goalBookModel.ts')).href)
const canonical=read(meta.canonicalPath),semantic=read(meta.semanticPath),qa=read(meta.qaPath),plan=JSON.parse(readFileSync(resolve(root,own,'native-import-plan.json'),'utf8'))
const changedSemantic=[]
for(const id of [meta.goalIds[0],meta.goalIds[1],'96bdf495-2801-57e4-a0da-ce3bf91e402c','3ac1cbb1-a366-5ae5-85c0-76b08270869d','1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a']){
 const g=canonical.goals.find((g:any)=>g.id===id)
 let r=semantic.decisions.find((r:any)=>r.goalId===id)
 if(!r){r={goalId:id,semanticKind:'curricularAtomic',decisionStatus:'authoritative',decisionBasis:'reviewed-current-post-split-curricular-atomic'};semantic.decisions.push(r)}
 if(id===meta.goalIds[1])r.decisionBasis='reviewed-current-post-split-curricular-atomic'
 const before=r.sourceFingerprint;r.sourceFingerprint=fingerprintSemanticKindSourceGoal(g);changedSemantic.push({goalId:id,before,after:r.sourceFingerprint,semanticKind:r.semanticKind})
}
semantic.counts.total=442;semantic.counts.curricularAtomic=364;write(meta.semanticPath,semantic)
const assets=[]
for(const v of plan.visuals){
 const g=canonical.goals.find((g:any)=>g.id===v.id),link=g.resourceLinks.find((l:any)=>l.type==='goal-visualization'&&l.role==='primary'), paths=[`curricula/DE/Gymnasium/visualizations/biologie/${v.id}/${v.id}.png`,`app/public${link.url}`,`backend/src/main/resources/static${link.url}`]
 const hashes=paths.map(path=>({path,sha256:'sha256:'+createHash('sha256').update(readFileSync(resolve(iso,path))).digest('hex')}));if(hashes.some(r=>r.sha256!==v.hash))throw new Error('Imported PNG byte mismatch')
 assets.push({goalId:v.id,paths:hashes,title:g.title,description:g.description,altText:link.altText,provider:link.provider,currentBindingV:'pending independent inspection',newPixels:false})
 let r=qa.records.find((r:any)=>r.goalId===v.id)
 if(!r){r={...qa.records.find((r:any)=>r.goalId===meta.goalIds[0]),goalId:v.id};qa.records.push(r)}
 Object.assign(r,{title:g.title,description:g.description,subject:'biologie',landscapeId:canonical.landscapeId,landscapePath:meta.canonicalPath,visualizationState:'available',missingReason:'',imageUrl:link.url,publicAssetPath:paths[1],canonicalAssetPath:paths[0],assetSha256:v.hash,umlautsCorrectChatGpt:'no',contentApprovedChatGpt:'no',humanApproved:'no',humanIssueIdentified:'no',humanIssueDescription:'',humanReviewedAt:null,humanReviewer:'',chatGptReviewedAt:null,chatGptReviewer:'',chatGptNotes:'Actual preexisting approved candidate pixels preserved. New exact current goal/title/alt/source binding has not yet received independent current V approval.',aiApproved:'no',aiApprovedAssetSha256:'',aiReviewedAt:null,aiReviewer:'',aiNotes:''})
}
write(meta.qaPath,qa)
writeFileSync(resolve(root,own,'classification-and-asset-binding.candidate.receipt.json'),JSON.stringify({status:'inactive_author_candidate',newCanonicalCount:442,newCurricularAtomicCount:364,semanticBindings:changedSemantic,assets,currentBindingV:'pending',humanApproval:false,activeWrites:0},null,2)+'\n')
console.log(JSON.stringify({status:'prospective_classification_bound',count:442,denominator:364,assetsByteExact:true,currentV:'pending',activeWrites:0}))
