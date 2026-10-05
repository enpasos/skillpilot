import { readFileSync,writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
async function main(){
const root=process.cwd(),own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-gel-prospective-book-current-v1',iso=resolve(root,'tmp/biologie-q1-gel-native-isolated-20261005-v1')
const {fingerprintSemanticKindSourceGoal}=await import(pathToFileURL(resolve(iso,'app/scripts/goalBookModel.ts')).href)
const read=(base:string,p:string)=>JSON.parse(readFileSync(resolve(base,p),'utf8'))
const write=(p:string,v:unknown)=>writeFileSync(resolve(iso,p),JSON.stringify(v,null,2)+'\n')
const id='8eb86a82-122d-5cae-8f80-bb2850b29c2f',canonPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',qaPath='curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json',semanticPath='curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
const before=read(root,canonPath),canonical=read(iso,canonPath),goal=canonical.goals.find((g:any)=>g.id===id)
const allOthersUnchanged=before.goals.filter((g:any)=>g.id!==id).every((g:any)=>JSON.stringify(g)===JSON.stringify(canonical.goals.find((c:any)=>c.id===g.id)))
if(!allOthersUnchanged||canonical.goals.length!==441)throw new Error('Unexpected canonical change or goal count')
const qa=read(iso,qaPath),qaBefore=read(root,qaPath),r=qa.records.find((r:any)=>r.goalId===id),imageQa=read(root,'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-q1-four-new-independent-v-qa-20261005-v1/independent-v-qa.receipt.json'),verdict=imageQa.goals.find((g:any)=>g.goalId===id)
if(verdict.candidateDecision!=='PASS_INACTIVE_REVISED_SCOPE')throw new Error('No actual independent scientific image PASS')
if(verdict.operativeScope.proposedDescriptionDe!==goal.description||verdict.operativeScope.proposedDescriptionEn!==goal.descriptionEn||JSON.stringify(verdict.operativeScope.proposedRequires)!==JSON.stringify(goal.requires))throw new Error('Image review scoped inputs do not match proposed final goal')
const primary=goal.resourceLinks.find((l:any)=>l.role==='primary'&&l.type==='goal-visualization'),imageRel=primary.url.replace(/^\//,'')
const assetPaths=[`curricula/DE/Gymnasium/visualizations/biologie/${id}/${id}.png`,`app/public/${imageRel}`,`backend/src/main/resources/static/${imageRel}`]
const assets=assetPaths.map(path=>({path,sha256:'sha256:'+createHash('sha256').update(readFileSync(resolve(iso,path))).digest('hex')}))
if(assets.some(a=>a.sha256!==verdict.assetSha256))throw new Error('Imported pixels differ from independent actual QA')
Object.assign(r,{title:goal.title,description:goal.description,visualizationState:'available',missingReason:'',imageUrl:primary.url,publicAssetPath:assets[1].path,canonicalAssetPath:assets[0].path,assetSha256:verdict.assetSha256,umlautsCorrectChatGpt:'yes',contentApprovedChatGpt:'yes',humanApproved:'no',humanIssueIdentified:'no',humanIssueDescription:'',chatGptReviewedAt:imageQa.reviewedAtUtc,chatGptReviewer:imageQa.reviewer,chatGptNotes:'Independent actual native/360/680 scientific and visual PASS for identical PNG and exact revised goal scope. Schematic is qualitative, linear fragments only; no bp calibration, sequence identity or laboratory-performance claim. Original independent receipt: curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-q1-four-new-independent-v-qa-20261005-v1/independent-v-qa.receipt.json; prospective integration bindings verified, no new human approval.',humanReviewedAt:null,humanReviewer:''})
if(!qaBefore.records.filter((r:any)=>r.goalId!==id).every((r:any)=>JSON.stringify(r)===JSON.stringify(qa.records.find((c:any)=>c.goalId===r.goalId))))throw new Error('Unrelated QA record changed')
write(qaPath,qa)
const semantic=read(iso,semanticPath),semanticBefore=read(root,semanticPath),decision=semantic.decisions.find((r:any)=>r.goalId===id),beforeFingerprint=decision.sourceFingerprint
if(decision.semanticKind!=='curricularAtomic'||decision.decisionStatus!=='authoritative')throw new Error('Classification must remain current curricularAtomic')
decision.sourceFingerprint=fingerprintSemanticKindSourceGoal(goal)
if(!semanticBefore.decisions.filter((r:any)=>r.goalId!==id).every((r:any)=>JSON.stringify(r)===JSON.stringify(semantic.decisions.find((c:any)=>c.goalId===r.goalId))))throw new Error('Unrelated semantic binding changed')
if(JSON.stringify(semantic.counts)!==JSON.stringify(semanticBefore.counts)||semantic.counts.curricularAtomic!==363||semantic.counts.total!==441)throw new Error('Changed semantic denominator')
write(semanticPath,semantic)
const receipt={status:'prospective_single_goal_inputs_bound',authority:'ai_candidate_native_binding_to_preexisting_independent_actual_visual_PASS',id,canonicalPath:canonPath,qaPath,semanticPath,all440OtherCanonicalGoalsUnchanged:allOthersUnchanged,currentCanonicalGoalCount:441,currentCurricularAtomicCount:363,all440OtherSemanticDecisionsUnchanged:true,allOtherVisualizationQARecordsUnchanged:true,semanticFingerprintBefore:beforeFingerprint,semanticFingerprintAfter:decision.sourceFingerprint,semanticClassificationUnchanged:decision.semanticKind,semanticAuthorityUnchanged:decision.decisionStatus,assetPathsAndHashes:assets,originalPromptRetained:true,originalProviderRetained:primary.provider,preservedPCRGoalId:'a3f483ce-126e-595c-999c-aa4d95106221',preservedPCRGoalUnchanged:JSON.stringify(before.goals.find((g:any)=>g.id==='a3f483ce-126e-595c-999c-aa4d95106221'))===JSON.stringify(canonical.goals.find((g:any)=>g.id==='a3f483ce-126e-595c-999c-aa4d95106221')),newOrdinaryGoalIds:[],strictNetDelta:0,humanApproval:false,activeWrites:0}
writeFileSync(resolve(root,own,'prospective-single-goal-native-inputs.receipt.json'),JSON.stringify(receipt,null,2)+'\n')
console.log(JSON.stringify({status:receipt.status,goalCount:441,denominator:363,changedCanonicalGoalIds:[id],semanticFingerprint:decision.sourceFingerprint,assetHashesIdentical:true,activeWrites:0}))
}
main().catch(e=>{console.error(e);process.exitCode=1})
