import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=process.cwd(); const req=createRequire(resolve(root,'app/package.json'));
const ca=req(resolve(root,'app/src/utils/authoring/canonicalAuthoring.ts'));
const cv=req(resolve(root,'app/src/utils/authoring/compositionViewAuthoring.ts'));
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const ixInput=read("curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-thirteen-SekI-country-969-raw-unsupported-disjoint-role-boundaries-AUTHOR-INERT-v1/actual-thirteen-whole-views-969-disjoint-boundaries.AUTHOR-INERT.json"); const payment=read("curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-BE-payment-whole-contract-authored-SekI-exclusion-ADDENDUM-INERT-v1/actual-one-BE-real-payment-target-boundary-after969.AUTHOR-INERT.json");
const can=ca.normalizeCanonicalLandscape(read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')); const ix=ca.buildCanonicalGraphIndex(can);
const rows=ixInput.rows.map((r:any)=>{
 const before=cv.normalizeCompositionView(read(r.beforePath));
 const path=r.jurisdiction==='DE-BE'?payment.candidatePath:r.candidatePath;
 const after=cv.normalizeCompositionView(read(path));
 const beforeRoles=cv.collectCompositionProjectionRoleGoalIds(before.rootNodes,ix.goalById);
 const afterRoles=cv.collectCompositionProjectionRoleGoalIds(after.rootNodes,ix.goalById);
 const removals=[...r.excludedRawUnsupportedButNotRuntimeTargets,...(r.jurisdiction==='DE-BE'?['e2ac2cc2-894a-5e61-8acb-f5d88811739d']:[])];
 const exclusions=new Set(removals);const b=[...beforeRoles.targetGoalIds],a=[...afterRoles.targetGoalIds];
 const compiled=cv.compileCompositionView(after,can);const errors=compiled.findings.filter((f:any)=>f.severity==='error');
 const result={jurisdiction:r.jurisdiction,path,sha256:createHash('sha256').update(readFileSync(path)).digest('hex'),errors,
  orderedRawTargetRolesExactlyBeforeMinusSpecified:JSON.stringify(a)===JSON.stringify(b.filter(id=>!exclusions.has(id))),
  allExplicitNewExclusionsArePrerequisiteOnly:removals.every((id:string)=>afterRoles.prerequisiteOnlyGoalIds.has(id)&&!afterRoles.targetGoalIds.has(id)),
  existingPrerequisiteRolesNotRemoved:[...beforeRoles.prerequisiteOnlyGoalIds].every((id:string)=>afterRoles.prerequisiteOnlyGoalIds.has(id)),
  actualRawTargetIdsRemoved:b.filter(id=>!afterRoles.targetGoalIds.has(id)),
  actualRawTargetIdsAdded:a.filter(id=>!beforeRoles.targetGoalIds.has(id)),
  supportSetParityClaimed:false,newActualPrerequisiteNeedNotInferred:true};
 if(errors.length||!result.orderedRawTargetRolesExactlyBeforeMinusSpecified||!result.allExplicitNewExclusionsArePrerequisiteOnly||!result.existingPrerequisiteRolesNotRemoved||result.actualRawTargetIdsAdded.length||result.actualRawTargetIdsRemoved.length!==removals.length)throw new Error('bounded mismatch '+r.jurisdiction);
 return result;
});
const result={status:'INDEPENDENT_ORIGINAL_NATIVE13_ROLE_COMPILERS_969_DISJOINT_PLUS_ONE_REAL_"curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-BE-payment-whole-contract-authored-SekI-exclusion-ADDENDUM-INERT-v1/actual-one-BE-real-payment-target-boundary-after969.AUTHOR-INERT.json"_BOUNDARY',nativeNode:process.version,methods:['normalizeCanonicalLandscape','buildCanonicalGraphIndex','normalizeCompositionView','collectCompositionProjectionRoleGoalIds','compileCompositionView'],rows,viewCount:rows.length,actualBoundaryCount:rows.reduce((sum:number,r:any)=>sum+r.actualRawTargetIdsRemoved.length,0),nativeErrors:rows.reduce((sum:number,r:any)=>sum+r.errors.length,0),nativeBackendRerun:false,fullSourceCoverageRunClaimed:false,activeWrites:0};
writeFileSync("curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-three-real-SekI-source-gaps-and970-whole-view-boundaries-independent-a-READONLY-v1/actual-native13-969-disjoint-plus-real-payment970-role-parity.READONLY.json",JSON.stringify(result,null,2)+'\n'); console.log(JSON.stringify({views:result.viewCount,boundaries:result.actualBoundaryCount,errors:result.nativeErrors}));
