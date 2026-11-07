import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {resolveRetainedCoverage} from '/home/enpasos/projects/skillpilot/app/scripts/lib/retainedAssessmentCoverage.ts';
import {collectCompositionProjectionRoleGoalIds,compileCompositionView} from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts';
import {findExamMarkdownTableIssues} from '/home/enpasos/projects/skillpilot/app/scripts/lib/examMarkdownValidation.ts';
import {collectWholeMaterialPrerequisiteClosure} from '/dev/shm/informatics-q2-source-scope-v3-20261107/native-closure-functions.mts';
const R='/home/enpasos/projects/skillpilot',W='/dev/shm/informatics-current-cleanup-20261107';
const P=R+'/qa-artifacts/ci-contract-audit/2026-11-07/informatics-e-minimal-material-design';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const sourceRel='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json';
const source=read(W+'/candidate/'+sourceRel),contract=read(P+'/integration-contract.json'),drafts=read(P+'/draft-goals.json');
const before=new Map(source.goals.map((g:any)=>[g.id,g]));
const candidate=structuredClone(source);
candidate.goals=candidate.goals.filter((g:any)=>!contract.supersededCurrentAssessmentIds.includes(g.id)).concat(drafts);
const parent=candidate.goals.find((g:any)=>g.id===contract.parentPatch.id);
parent.contains=contract.parentPatch.afterContains;parent.requires=[];parent.weight=3;
parent.applicability=contract.parentPatch.afterApplicability;parent.description=contract.parentPatch.afterDescription;parent.descriptionEn=contract.parentPatch.afterDescriptionEn;
const after=new Map(candidate.goals.map((g:any)=>[g.id,g]));
assert.equal(source.goals.filter((g:any)=>g.examData).length,22);assert.equal(candidate.goals.filter((g:any)=>g.examData).length,23);
for(const g of source.goals){if(contract.supersededCurrentAssessmentIds.includes(g.id)||g.id===parent.id)continue;assert.deepEqual(after.get(g.id),g);}
// Ensure the previously extracted native function is still the exact current function.
const actual=readFileSync(R+'/app/scripts/generateCurriculumQualityStatus.ts','utf8');
const extracted=readFileSync('/dev/shm/informatics-q2-source-scope-v3-20261107/native-closure-functions.mts','utf8');
const start=actual.indexOf('function collectWholeMaterialPrerequisiteClosure('),end=actual.indexOf('\nfunction evaluateRouteEndpointCompositionVisibility(',start);
assert(extracted.includes(actual.slice(start,end).trim()));
const orientation='d848ceb9-cd73-5a13-9407-f3364764c223';
const rows=[];
for(const g of drafts){
 const cov=resolveRetainedCoverage(candidate,g.examData.coveredGoalIds);
 assert.deepEqual(cov.issues,[]);assert.equal(cov.atoms.length,g.examData.coveredGoalIds.length);
 assert.equal(new Set(g.examData.coveredGoalIds).size,g.examData.coveredGoalIds.length);
 const prep=collectWholeMaterialPrerequisiteClosure(candidate,g.id);
 assert.equal(prep.unresolvedReferences.size,0);
 assert.deepEqual([...prep.atomicGoalIds].sort(),[...g.examData.coveredGoalIds,orientation].sort());
 for(const id of g.examData.coveredGoalIds){const a=after.get(id) as any;assert(a.tags.includes('GK')&&a.tags.includes('LK'));assert(a.applicability.jurisdiction.includes('DE-HE'));}
 for(const text of [g.examData.taskContent,g.examData.solutionContent])assert.deepEqual(findExamMarkdownTableIssues(text),[]);
 assert.equal(g.examData.scoring.steps.reduce((n:number,s:any)=>n+s.points,0),g.examData.scoring.maxPoints);
 assert.equal(g.examData.scoring.passingPoints,g.examData.scoring.maxPoints);
 const nonredundancy=[];
 for(const id of g.requires){
  const weakened=structuredClone(candidate);weakened.goals.find((x:any)=>x.id===g.id).requires=g.requires.filter((x:string)=>x!==id);
  const w=collectWholeMaterialPrerequisiteClosure(weakened,g.id);
  assert(!w.atomicGoalIds.has(id));nonredundancy.push({withdrawn:id,requiredContentLost:id});
 }
 rows.push({id:g.id,title:g.title,coverage:cov,wholeMaterialPreparation:[...prep.atomicGoalIds].sort(),onlyExtraPreparation:orientation,directEdgesAllNecessary:nonredundancy});
}
const broad=structuredClone(candidate);broad.goals.find((g:any)=>g.id===parent.id).requires=contract.parentPatch.beforeRequires;
const broadCounter=rows.map((r:any)=>{
 const p=collectWholeMaterialPrerequisiteClosure(broad,r.id),own=new Set(r.coverage.atoms.map((x:string)=>x.split(':')[1]));
 const wronglyInherited=[...p.atomicGoalIds].filter(x=>x!==orientation&&!own.has(x));assert(wronglyInherited.length>0);
 assert(wronglyInherited.includes('e3e5c851-39d8-569f-9f0a-d516c729ed36'));
 return {id:r.id,wholePreparationCount:p.atomicGoalIds.size,wronglyInheritedContent:wronglyInherited.sort()};
});
const views=[];
function withoutParent(nodes:any[]):any[]{return nodes.filter(n=>n.goalId!==parent.id).map(n=>({...n,...(n.children?{children:withoutParent(n.children)}:{})}));}
const ordinaryTargets=(view:any,landscape:any)=>{
 const map=new Map(landscape.goals.map((g:any)=>[g.id,g]));
 return [...collectCompositionProjectionRoleGoalIds(view.rootNodes,map as any).targetGoalIds].filter(id=>{const g:any=map.get(id);return g&&!g.examData&&!g.contains?.length;}).sort();
};
for(const id of [...contract.positiveScopes,'de-by-gym-informatics-crossstage']){
 const rel='curricula/DE/Gymnasium/composition-views/informatik/'+id+'.view.json';
 const path=existsSync(W+'/candidate/'+rel)?W+'/candidate/'+rel:R+'/'+rel;
 const view=read(path),next=structuredClone(view);
 const unqualified=collectCompositionProjectionRoleGoalIds(view.rootNodes,after as any).targetGoalIds;
 if(id==='de-by-gym-informatics-crossstage'){
  // Actual collector ignores the new HE applicability when following this subtree: a real negative.
  assert(drafts.every((g:any)=>unqualified.has(g.id)));
  next.rootNodes=withoutParent(next.rootNodes);
 }
 const comp=compileCompositionView(next,candidate);
 assert.equal(comp.findings.filter((f:any)=>f.severity==='error').length,0);
 const targets=collectCompositionProjectionRoleGoalIds(next.rootNodes,after as any).targetGoalIds;
 assert.deepEqual(ordinaryTargets(next,candidate),ordinaryTargets(view,source));
 for(const old of contract.supersededCurrentAssessmentIds)assert(!targets.has(old));
 if(id==='de-by-gym-informatics-crossstage')assert(drafts.every((g:any)=>!targets.has(g.id)));
 else assert(drafts.every((g:any)=>targets.has(g.id)&&g.examData.coveredGoalIds.every((a:string)=>targets.has(a))));
 views.push({viewId:id,inputSha256:createHash('sha256').update(readFileSync(path)).digest('hex'),compileErrors:0,
   ordinaryTargetsExactlyPreserved:true,newAssessmentTargets:drafts.filter((g:any)=>targets.has(g.id)).map((g:any)=>g.id),
   applicabilityOnlyWouldWronglyEnrollThree:id==='de-by-gym-informatics-crossstage'});
}
const output={status:'PASS_PRIVATE_FINITE_MATERIAL_AND_SCOPE_DESIGN_CHECKS',before:{definitions:source.goals.length,exams:22},afterInMemory:{definitions:candidate.goals.length,exams:23},
 sourceSha256:contract.sourceSha256,allOtherFullGoalObjectsUnchanged:true,tasks:rows,
 actualInheritedParentCounterexamples:broadCounter,focusedNativeComposition:views,
 limitations:['No Full-CQR, native backend, readiness approval, result migration or SourceA run.',
  'Only HE/ownGK/ownLK/BY composition compiled; remaining14 foreign views have exact reference plan and still need final native integration verification.',
  'All15 content goals carry both GK/LK tags and are present in relevant composition targets. This is not a service-selection or complete official HE curricular-coverage proof.']};
writeFileSync(P+'/scope-check-results.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({exams:'22->23',coverage:rows.map(r=>r.coverage.atoms.length),preparation:rows.map(r=>r.wholeMaterialPreparation.length),nativeViews:views.length,broadParentCounterexamples:broadCounter.length}));
