import {readFileSync,writeFileSync,readdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {fingerprintPositiveGoalEvidenceReviewInput,positiveGoalEvidenceReviewInputPayload,fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceProfile,validatePositiveGoalEvidenceRecordSemantics} from '../../../app/scripts/positiveGoalEvidenceProfileModel.ts'
import {stableGoalEvidenceJson,fingerprintGoalEvidenceReviewInput} from '../../../app/scripts/goalEvidenceProfileModel.ts'
import {fingerprintSemanticKindSourceGoal} from '../../../app/scripts/goalBookModel.ts'
import {collectCompositionProjectionRoleGoalIds} from '../../../app/src/utils/authoring/compositionViewAuthoring.ts'
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../../..'),h=path.join(root,'tmp/approach-review-20261101/he-two-reference-gaps-integration-20261104-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex'),same=(a:any,b:any)=>stableGoalEvidenceJson(a)===stableGoalEvidenceJson(b)
let assertions=0;const check=(ok:boolean,label:string)=>{assertions++;if(!ok)throw Error(label)}
const write=(name:string,v:any)=>writeFileSync(path.join(here,name),JSON.stringify(v,null,2)+'\n')
const id='c9112f89-ffaf-40f3-af1f-86a04b5ad4ee',density='ec9f2ed4-c9e6-5fb3-a073-75b53127e55d',radian='8d30d241-0247-48ac-83d3-4e0de61584d3'
const canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',views='curricula/DE/Gymnasium/composition-views/mathematik'
const manifest=read(path.join(h,'preliminary-manifest.json'))
check(hash(path.join(h,'preliminary-manifest.json'))==='00d37f9217497f47e994714cca824191c3c9f94d449323d83def42da7fd69541','manifest binding')
check(hash(path.join(h,'preliminary-handoff.json'))==='872806e36903874a83b152b5e6e0a49b4c14ec90a7de67baee8be2f0e9926b10','handoff binding')
for(const e of [...manifest.candidateFiles,...manifest.evidence])check(hash(path.join(h,e.path))===e.sha256,'leaf '+e.path)
const whole=read(path.join(h,'four-whole-goals.before-after.json')),b=read(path.join(h,'before',canonical)),a=read(path.join(h,'host',canonical)),live=read(path.join(root,canonical))
const bm=new Map(b.goals.map((g:any)=>[g.id,g])),am=new Map(a.goals.map((g:any)=>[g.id,g])),lm=new Map(live.goals.map((g:any)=>[g.id,g]))
check(b.goals.length===a.goals.length,'same goal count')
const changed=b.goals.filter((g:any)=>!same(g,am.get(g.id))).map((g:any)=>g.id);check(same(changed,[id]),'exact one changed goal')
for(const goalId of Object.keys(whole.before)){check(same(whole.before[goalId],bm.get(goalId)),'whole before '+goalId);check(same(whole.after[goalId],am.get(goalId)),'whole after '+goalId);check(same(lm.get(goalId),bm.get(goalId)),'current bounded goal '+goalId)}
const before:any=bm.get(id),after:any=am.get(id),expected=structuredClone(before);expected.requires=expected.requires.filter((x:string)=>x!==density);check(same(after,expected),'only approved R removed')
const proposal=read(path.join(h,'fingerprint-rebinding-and-positive-review-proposal.json')),configPath=proposal.activePositiveConfiguration,config=read(path.join(root,configPath))
const row=readFileSync(path.join(root,config.reviewPath),'utf8').trim().split('\n').map(JSON.parse).find((r:any)=>r.goalId===id)
check(same(row,proposal.wholePositiveBefore),'current active whole row')
check(same(config.reviewedResourceTypes,[]),'active resource digest set is empty')
check('sha256:'+hash(path.join(root,config.reviewCriteriaPath))===row.reviewCriteriaFingerprint,'actual criteria bytes')
const v2Before=fingerprintPositiveGoalEvidenceReviewInput(before,row.reviewCriteriaFingerprint,{},'curricularAtomic'),v2After=fingerprintPositiveGoalEvidenceReviewInput(after,row.reviewCriteriaFingerprint,{},'curricularAtomic')
check(v2Before===row.reviewInputFingerprint,'registered positive input already current')
check(fingerprintGoalForPositiveEvidence(before,'curricularAtomic')===row.goalFingerprint,'goal fingerprint before')
check(fingerprintGoalForPositiveEvidence(after,'curricularAtomic')===row.goalFingerprint,'goal fingerprint after')
check(fingerprintPositiveGoalEvidenceProfile(row.profile)===row.profileFingerprint,'whole profile fingerprint')
check(validatePositiveGoalEvidenceRecordSemantics(row,before,{},'curricularAtomic').length===0,'active before semantics')
const incorrectProposalErrors=validatePositiveGoalEvidenceRecordSemantics(proposal.wholePositiveProposedAfter,after,{},'curricularAtomic')
check(incorrectProposalErrors.length===1&&incorrectProposalErrors[0].includes('stale reviewInputFingerprint'),'diagnosed proposal error')
const now=new Date().toISOString(),reviewer='/root/astra_markov_current_activation:he-c911-positive-revalidation-20261104-v1'
const replacement={...row,reviewInputFingerprint:v2After,reviewedAt:now,reviewer,reason:'Actual independent bounded revalidation in the named review session of the whole bilingual c911 competency, unchanged positive-understanding profile, all three application cases, variation/coverage requirements, current canonical prerequisite context and supplied teaching visual. Removing only the rational-density prerequisite is mathematically sound: unknown, varying-quantity and parameter roles are meaningful over discrete admissible values and require no density proof. All three profile expectations and fresh-transfer cases remain appropriate. Bound with the active positive-understanding-evidence-v2 input wrapper and unchanged criteria. The registered previous v2 input was current; the preliminary v1-hash proposal is rejected. E1/G1 AI-candidate status and pending human review are preserved. This is one targeted revalidation, not a new blind dual-round review, human approval, learner mastery, Stage/Native approval or full Mathematics acceptance.'}
check(validatePositiveGoalEvidenceRecordSemantics(replacement,after,{},'curricularAtomic').length===0,'replacement semantics')
check(same(Object.keys(row).filter(k=>!same(row[k],replacement[k])),['reviewInputFingerprint','reviewedAt','reviewer','reason']),'only four permitted row fields change')
write('whole-previous-positive-row.json',row);write('replacement-positive-row.json',replacement);writeFileSync(path.join(here,'replacement-positive-row.jsonl'),JSON.stringify(replacement)+'\n')
write('actual-positive-review-inputs.json',{before:positiveGoalEvidenceReviewInputPayload(before,row.reviewCriteriaFingerprint,{},'curricularAtomic'),after:positiveGoalEvidenceReviewInputPayload(after,row.reviewCriteriaFingerprint,{},'curricularAtomic'),v2Before,v2After,registeredBefore:row.reviewInputFingerprint,innerV1Before:fingerprintGoalEvidenceReviewInput(before,row.goalFingerprintRuleVersion,{},'curricularAtomic'),innerV1After:fingerprintGoalEvidenceReviewInput(after,row.goalFingerprintRuleVersion,{},'curricularAtomic'),incorrectProposalErrors,reviewedResourceTypes:config.reviewedResourceTypes,resourceDigests:{}})
const normalize=(v:any)=>String(v??'').normalize('NFKC').replace(/\s+/g,' ').trim()
const ampayload=(g:any,ruleVersion:string)=>({ruleVersion,goalId:g.id,shortKey:g.shortKey??'',title:normalize(g.title),titleEn:normalize(g.titleEn),description:normalize(g.description),descriptionEn:normalize(g.descriptionEn),phase:normalize(g.dimensionTags?.phase),area:normalize(g.dimensionTags?.area),topicCode:normalize(g.dimensionTags?.topicCode),nodeKind:normalize(g.nodeKind)})
const fp=(v:any)=>'sha256:'+createHash('sha256').update(stableGoalEvidenceJson(v)).digest('hex')
const amrows=read(path.join(h,'current-eight-am-rows-unchanged.json')).rows
const amResults=amrows.map((e:any)=>{const cfg=read(path.join(root,e.registeredConfigPath)),r=readFileSync(path.join(root,cfg.reviewPath),'utf8').trim().split('\n').map(JSON.parse).find((r:any)=>r.goalId===e.wholeCurrentRow.goalId);check(same(r,e.wholeCurrentRow),'active A/M row '+r.goalId+e.lane);const bf=fp(ampayload(bm.get(r.goalId),r.ruleVersion)),af=fp(ampayload(am.get(r.goalId),r.ruleVersion));check(bf===r.fingerprint&&af===r.fingerprint,'A/M fingerprint '+r.goalId+e.lane);return {lane:e.lane,goalId:r.goalId,before:bf,after:af,activeWholeRowUnchanged:true,registeredReviewPath:cfg.reviewPath}})
const kindPath='curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',kindB=read(path.join(h,'before',kindPath)),kindA=read(path.join(h,'host',kindPath)),k=kindA.decisions.find((d:any)=>d.goalId===id)
check(k.semanticKind==='curricularAtomic'&&k.sourceFingerprint===fingerprintSemanticKindSourceGoal(after),'same-kind refreshed source fingerprint')
const expectedKinds=structuredClone(kindB);expectedKinds.decisions.find((d:any)=>d.goalId===id).sourceFingerprint=k.sourceFingerprint;check(same(expectedKinds,kindA),'only c911 kind source fingerprint')
const preview=path.join(h,'host/tmp/he-radian-mechanical-preview',views),wanted=['de-he-seki-g9.view.json','de-he-gk-g9.view.json','de-he-lk-g9.view.json'],viewResults:any[]=[]
for(const file of readdirSync(preview).filter(f=>f.endsWith('.json')).sort()){
 const old=read(path.join(root,views,file)),next=read(path.join(preview,file)),oldP=collectCompositionProjectionRoleGoalIds(old.rootNodes,bm as any),newP=collectCompositionProjectionRoleGoalIds(next.rootNodes,am as any)
 const add=[...newP.targetGoalIds].filter(i=>!oldP.targetGoalIds.has(i)),remove=[...oldP.targetGoalIds].filter(i=>!newP.targetGoalIds.has(i)),pa=[...newP.prerequisiteOnlyGoalIds].filter(i=>!oldP.prerequisiteOnlyGoalIds.has(i)),pr=[...oldP.prerequisiteOnlyGoalIds].filter(i=>!newP.prerequisiteOnlyGoalIds.has(i))
 check(same(add,wanted.includes(file)?[radian]:[])&&!remove.length&&!pa.length&&!pr.length,'finite preview '+file)
 const paths:any[]=[];const walk=(nodes:any[],parents:any[])=>nodes.forEach(n=>{if(n.goalId===radian)paths.push([...parents,n]);if(n.children)walk(n.children,[...parents,{id:n.id,kind:n.kind,label:n.label}])});walk(next.rootNodes,[])
 if(wanted.includes(file))check(paths.length===1&&paths[0].some((n:any)=>n.id==='j10-g9-kompetenzen'),'existing J10 route '+file)
 viewResults.push({file,scope:next.scope,addedTargets:add,removedTargets:remove,addedPrerequisiteOnly:pa,removedPrerequisiteOnly:pr,radianAuthoredPaths:paths,candidateSha256:hash(path.join(preview,file)),rootSha256:hash(path.join(root,views,file))})
}
const extraction='curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_MATHEMATIK_SEKI_KC_G8_G9.source-extraction.json',seB=read(path.join(h,'before',extraction)),seA=read(path.join(h,'host',extraction)),sourceResults:any={}
for(const key of ['passages','sourceGoals']){const old=seB[key],next=seA[key];const idKey=key==='passages'?'passageId':'id'; const keys=Object.keys(old[0]);const identity=keys.includes(idKey)?idKey:keys.find((x:string)=>x.toLowerCase().endsWith('id'))!;const nm=new Map(next.map((v:any)=>[v[identity],v]));for(const v of old)check(same(v,nm.get(v[identity])),'old source preserved '+v[identity]);const om=new Set(old.map((v:any)=>v[identity]));sourceResults[key]={identity,oldCount:old.length,newCount:next.length,added:next.filter((v:any)=>!om.has(v[identity]))}}
check(sourceResults.passages.added.length===3&&sourceResults.sourceGoals.added.length===1,'bounded source additions')
const mapping='curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_math_lower_secondary_source_extraction_to_canonical_math.review.json',mapB=read(path.join(h,'before',mapping)),mapA=read(path.join(h,'host',mapping))
const sourceMapDelta={oldMappings:mapB.mappings.length,newMappings:mapA.mappings.length,removed:mapB.mappings.filter((x:any)=>!mapA.mappings.some((y:any)=>same(x,y))),addedOrChanged:mapA.mappings.filter((x:any)=>!mapB.mappings.some((y:any)=>same(x,y)))}
const imagePath='app/public'+before.resourceLinks[0].url
write('bounded-mechanical-proof.json',{status:'PASS_BOUNDED_MECHANICAL_CHECKS_WITH_INCORRECT_PRELIMINARY_POSITIVE_HASH_REJECTED',assertions,reviewer,reviewedAt:now,manifestSha256:hash(path.join(h,'preliminary-manifest.json')),candidateLeavesVerified:manifest.candidateFiles.length,evidenceLeavesVerified:manifest.evidence.length,currentFourWholeGoalsMatchFrozenBefore:true,canonicalChangedGoalIds:changed,positive:{goalFingerprint:row.goalFingerprint,profileFingerprint:row.profileFingerprint,v2Before,v2After,oldRowCurrent:true,originalProposedRowValid:false,replacementValidationErrors:[],fieldsChanged:['reviewInputFingerprint','reviewedAt','reviewer','reason']},amResults,semanticKind:{before:proposal.wholeSemanticKindBefore,after:k},viewResults,sourceResults,sourceMapDelta,inputPins:[configPath,config.reviewPath,config.reviewCriteriaPath,'app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/goalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceReview.ts','app/scripts/semanticAtomicityReview.ts','app/scripts/memoryCardReview.ts',imagePath].map(p=>({path:p,sha256:hash(path.join(root,p))})),teachingVisual:{path:imagePath,sha256:hash(path.join(root,imagePath)),independentlyViewed:true,activeConfigDoesNotBindImageBytes:true,notLearnerEvidence:true},stageNativeOrImportApproval:false})
console.log(JSON.stringify({assertions,v2Before,v2After,views:viewResults.length,changedViews:viewResults.filter(r=>r.addedTargets.length).map(r=>r.file),sourceMapDelta,reviewedAt:now},null,2))
