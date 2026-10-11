import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root='/home/enpasos/projects/skillpilot';
const req=createRequire(resolve(root,'app/package.json'));
const ca=req(resolve(root,'app/src/utils/authoring/canonicalAuthoring.ts'));
const cv=req(resolve(root,'app/src/utils/authoring/compositionViewAuthoring.ts'));
const sourceFile='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-SekI-29-actual-added-pairs-thirteen-country-view26-boundaries-AUTHOR-INERT-c-v2/ROOT-reviewable-thirteen-whole-SekI-country-views26-bounded-target-exclusions.GUARDED.AUTHOR-INERT.json';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const genericPath=resolve(root,'curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-seki-economics.view.json');
const canPath=resolve(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json');
const can=ca.normalizeCanonicalLandscape(read(canPath));
const ix=ca.buildCanonicalGraphIndex(can);
const generic=cv.normalizeCompositionView(read(genericPath));
const before=cv.collectCompositionProjectionRoleGoalIds(generic.rootNodes,ix.goalById);
const bTargets=[...before.targetGoalIds],bPrereqs=[...before.prerequisiteOnlyGoalIds];
const rows=read(sourceFile).rows.map((r:any)=>{
 const v=cv.normalizeCompositionView(read(r.candidatePath));
 const projected=cv.collectCompositionProjectionRoleGoalIds(v.rootNodes,ix.goalById);
 const targets=[...projected.targetGoalIds],prereqs=[...projected.prerequisiteOnlyGoalIds];
 const exclusions=new Set(r.addedDirectExclusionIds);
 const compile=cv.compileCompositionView(v,can);
 const errors=compile.findings.filter((f:any)=>f.severity==='error');
 const result={jurisdiction:r.jurisdiction,candidateView:r.candidatePath,candidateSha256:createHash('sha256').update(readFileSync(r.candidatePath)).digest('hex'),
  orderedTargetsExactlyPriorMinusSpecifiedExclusions:JSON.stringify(targets)===JSON.stringify(bTargets.filter(id=>!exclusions.has(id))),
  noExistingPrerequisiteRemoved:bPrereqs.every(id=>prereqs.includes(id)),
  onlySpecifiedPrerequisitesAdded:prereqs.filter(id=>!bPrereqs.includes(id)).length===exclusions.size&&prereqs.filter(id=>!bPrereqs.includes(id)).every(id=>exclusions.has(id)),
  actualRemovedTargetIds:bTargets.filter(id=>!targets.includes(id)),
  retainedTargetProof:r.retainedNewTargetIds.map((id:string)=>({id,retained:targets.includes(id)})),
  allSpecifiedBoundariesBecomePrerequisiteOnly:r.addedDirectExclusionIds.every((id:string)=>prereqs.includes(id)&&!targets.includes(id)),
  errors,wholeTargetIds:targets,wholePrerequisiteOnlyIds:prereqs};
 if(!result.orderedTargetsExactlyPriorMinusSpecifiedExclusions||!result.noExistingPrerequisiteRemoved||!result.onlySpecifiedPrerequisitesAdded||!result.allSpecifiedBoundariesBecomePrerequisiteOnly||result.retainedTargetProof.some((r:any)=>!r.retained)||errors.length)throw new Error('bounded native mismatch '+r.jurisdiction);
 return result;
});
const result={status:'INDEPENDENT_ACTUAL_NATIVE_ORIGINAL_COMPILER_BOUNDED13_VIEWS_ONLY',nativeNode:process.version,
 methods:['normalizeCanonicalLandscape','buildCanonicalGraphIndex','normalizeCompositionView','collectCompositionProjectionRoleGoalIds','compileCompositionView'],
 viewCount:rows.length,actualBoundaryCount:rows.reduce((a:number,r:any)=>a+r.actualRemovedTargetIds.length,0),nativeErrors:rows.reduce((a:number,r:any)=>a+r.errors.length,0),
 rows,sourceScienceIsSeparate:true,backendHTTPCountsNotClaimed:true,activeWrites:0};
writeFileSync('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-SekI13Views26-and-memory48-only-field-independent-a-READONLY-v1/actual-native13-whole-ordered-target-prerequisite-role-parity.READONLY.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({views:result.viewCount,boundaries:result.actualBoundaryCount,nativeErrors:result.nativeErrors,allOrderedTargetAndPrerequisiteBoundsPass:true}));
