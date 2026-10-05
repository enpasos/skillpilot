import {readFileSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {createHash} from 'node:crypto'
import {fingerprintSemanticKindSourceGoal} from '../../../../../../../app/scripts/goalBookModel'
const root=process.cwd(),own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-five-prospective-book-current-v1',iso=resolve(root,'tmp/chemie-b014-five-native-isolated-20261005-v1')
const read=(base:string,path:string):any=>JSON.parse(readFileSync(resolve(base,path),'utf8'))
const write=(path:string,v:any)=>writeFileSync(resolve(iso,path),JSON.stringify(v,null,2)+'\n')
const ids=read(root,own+'/batch.config.json').goalIds as string[],set=new Set(ids),canonPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',qaPath='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json',semanticPath='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const canonical=read(iso,canonPath),before=read(root,canonPath),qa=read(iso,qaPath),qaBefore=read(root,qaPath),semantic=read(iso,semanticPath),semanticBefore=read(root,semanticPath),bindings:any[]=[]
for(const id of ids){
 const goal=canonical.goals.find((g:any)=>g.id===id),decision=semantic.decisions.find((r:any)=>r.goalId===id)
 if(decision.semanticKind!=='curricularAtomic'||decision.decisionStatus!=='authoritative')throw new Error('Protected semantic classification changed')
 const old=decision.sourceFingerprint;decision.sourceFingerprint=fingerprintSemanticKindSourceGoal(goal)
 bindings.push({goalId:id,semanticFingerprintBefore:old,semanticFingerprintAfter:decision.sourceFingerprint,semanticKindUnchanged:decision.semanticKind,classificationAuthorityUnchanged:decision.decisionStatus,scientificDecisionReference:'chemie-b014-eleven-source-remediation-independent-a-v1/eight-complete-text-source-prerequisite-deltas.json',bindingUpdateIsNotNewScientificApproval:true})
}
const v16Path='curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-b014-redox-mobile-independent-v-qa-20261005-v1/independent-v-review.candidate.json',v026Path='curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-b014-titration-b010-ion-lattice-independent-v-qa-20261005-v1/independent-two-image-v-qa.receipt.json'
const v16=read(root,v16Path),v026All=read(root,v026Path),v026=v026All.records.find((r:any)=>r.goalId.startsWith('02634'))
const reviews=[{id:v16.goalId,assetSha:v16.assetSha256,description:v16.currentDescriptionDe,descriptionEn:v16.currentDescriptionEn,reviewed:v16.reviewedAt,reviewer:v16.reviewer,path:v16Path,decision:v16.decision,notes:read(root,'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-b014-redox-mobile-independent-v-qa-20261005-v1/native-v-fields.candidate.json').aiNotes}, {id:v026.goalId,assetSha:'sha256:'+v026.assetSha256,description:v026.boundGoalDescription,descriptionEn:v026.boundGoalDescriptionEn,reviewed:v026All.reviewedAtUtc,reviewer:v026All.reviewer,path:v026Path,decision:v026.decision,notes:'Actual original and independent fresh 360/680 PNG views: scientific and visual PASS for exact current titration text, colorless standard/sample/indicator, correctly increasing burette scale, faint endpoint, working-side notebook. Qualitative orientation, no volume measurement or practical-performance evidence.'}]
for(const v of reviews){
 const goal=canonical.goals.find((g:any)=>g.id===v.id),record=qa.records.find((r:any)=>r.goalId===v.id)
 if(v.decision!=='PASS'||goal.description!==v.description||goal.descriptionEn!==v.descriptionEn)throw new Error('Actual visual PASS scope mismatch')
 const primary=goal.resourceLinks.find((l:any)=>l.type==='goal-visualization'&&l.role==='primary'),url=primary.url,imageRel=url.replace(/^\//,'')
 const publicAssetPath='app/public/'+imageRel,canonicalAssetPath=`curricula/DE/Gymnasium/visualizations/chemie/${v.id}/${v.id}.png`
 for(const p of [publicAssetPath,canonicalAssetPath,'backend/src/main/resources/static/'+imageRel])if('sha256:'+createHash('sha256').update(readFileSync(resolve(iso,p))).digest('hex')!==v.assetSha)throw new Error('Pixels differ from actual reviewed image')
 const notes=v.notes+' Original independent receipt: '+v.path+'. Prospective binding only; no human approval.'
 Object.assign(record,{title:goal.title,description:goal.description,visualizationState:'available',missingReason:'',imageUrl:url,publicAssetPath,canonicalAssetPath,assetSha256:v.assetSha,umlautsCorrectChatGpt:'yes',contentApprovedChatGpt:'yes',humanApproved:'no',humanIssueIdentified:'no',humanIssueDescription:'',chatGptReviewedAt:v.reviewed,chatGptReviewer:v.reviewer,chatGptNotes:notes,humanReviewedAt:null,humanReviewer:'',aiApproved:'yes',aiApprovedAssetSha256:v.assetSha,aiReviewedAt:v.reviewed,aiReviewer:v.reviewer,aiNotes:notes})
}
if(!before.goals.filter((g:any)=>!set.has(g.id)).every((g:any)=>JSON.stringify(g)===JSON.stringify(canonical.goals.find((r:any)=>r.id===g.id))))throw new Error('Unrelated goal object changed')
if(!semanticBefore.decisions.filter((g:any)=>!set.has(g.goalId)).every((g:any)=>JSON.stringify(g)===JSON.stringify(semantic.decisions.find((r:any)=>r.goalId===g.goalId))))throw new Error('Unrelated semantic decision changed')
if(JSON.stringify(semantic.counts)!==JSON.stringify(semanticBefore.counts)||semantic.counts.curricularAtomic!==376||semantic.counts.total!==473)throw new Error('Protected semantic denominator changed')
if(!qaBefore.records.filter((r:any)=>!reviews.some(v=>v.id===r.goalId)).every((r:any)=>JSON.stringify(r)===JSON.stringify(qa.records.find((c:any)=>c.goalId===r.goalId))))throw new Error('Unrelated existing QA record changed')
write(semanticPath,semantic);write(qaPath,qa)
writeFileSync(resolve(root,own,'five-prospective-native-input-bindings.receipt.json'),JSON.stringify({status:'PASS_isolated_semantic_and_two_actual_independent_visual_bindings',bindings,all468OtherCanonicalGoalsUnchanged:true,allOtherSemanticDecisionsUnchanged:true,unchangedSemanticDenominator:376,totalGoalCount:473,twoNewReviewedPNGsAdoptedOnlyInIsolation:reviews.map(v=>({goalId:v.id,assetSha256:v.assetSha,independentVisualReceiptPath:v.path})),unchanged04faPixelsAndDescriptionRetainValidV:true,fd797AndEfaTargetedVisualTextBindingsStillPending:true,memory28NotActivated:true,strictNetDelta:0,humanApproval:false,activeWrites:0},null,2)+'\n')
console.log(JSON.stringify({status:'PASS_semantic_and_two_actual_V_bindings',atomicDenominator:376,goalCount:473,twoNewPNGs:reviews.length,fdAndEfaTextBindingReviewsPending:true,activeWrites:0}))
