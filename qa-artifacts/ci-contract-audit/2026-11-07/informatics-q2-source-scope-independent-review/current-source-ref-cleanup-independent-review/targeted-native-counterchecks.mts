import {readFileSync,writeFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {collectCompositionProjectionRoleGoalIds,compileCompositionView} from '/dev/shm/informatics-current-cleanup-20261107/native-code/app/src/utils/authoring/compositionViewAuthoring.ts';
import {resolveRetainedCoverage} from '/dev/shm/informatics-current-cleanup-20261107/native-code/app/scripts/lib/retainedAssessmentCoverage.ts';
import {collectWholeMaterialPrerequisiteClosure} from '../native-closure-functions.mts';
const R='/home/enpasos/projects/skillpilot',W='/dev/shm/informatics-current-cleanup-20261107/candidate',V='/dev/shm/informatics-q2-source-scope-v3-20261107/candidate';
const O=R+'/qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-source-scope-independent-review/current-source-ref-cleanup-independent-review',P=R+'/qa-artifacts/ci-contract-audit/2026-11-07/informatics-current-source-ref-cleanup-candidate';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),gz=(p:string)=>JSON.parse(gunzipSync(readFileSync(p)).toString());
const raw=readFileSync(W+'/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json');assert.equal(createHash('sha256').update(raw).digest('hex'),'d163550987320c6c8667fde4782a40ed4308525b8b9f025fcfc7fd6d70591d9c');
const after=JSON.parse(raw.toString()),before=read(V+'/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json');
const am=new Map<string,any>(after.goals.map((g:any)=>[g.id,g])),bm=new Map<string,any>(before.goals.map((g:any)=>[g.id,g]));
const inv=read(O+'/../current-informatics-cleanup-authority/eight-definition-inventory.json');
const renames=new Map<string,string>(inv.exactlyEightRows.filter((r:any)=>r.proposedNewId).map((r:any)=>[r.oldId,r.proposedNewId]));
const selectedViews=['de-de-gym-informatics-gk.view.json','de-de-gym-informatics-lk.view.json','de-he-gym-informatics-crossstage.view.json','de-de-gym-seki-informatics.view.json'].map(file=>{
 const path='/curricula/DE/Gymnasium/composition-views/informatik/'+file;
 // The unchanged SekI view is not part of the overlay; read its verified existing bytes.
 let av:any;try{av=read(W+path)}catch{av=read(R+path)}
 const bv=read(V+path),a=collectCompositionProjectionRoleGoalIds(av.rootNodes,am),b=collectCompositionProjectionRoleGoalIds(bv.rootNodes,bm);
 assert.deepEqual([...a.targetGoalIds].sort(),[...b.targetGoalIds].map(x=>renames.get(x)??x).sort());
 assert.equal(compileCompositionView(av,after).findings.filter((f:any)=>f.severity==='error').length,0);
 return {file,exactTargetEqualityModuloFiveIdentities:true,targetCount:a.targetGoalIds.size};
});
const runtime=gz(P+'/current-cleanup-global.runtime.json.gz').nativeAuthoredGlobalCases;
assert.equal(runtime.length,51);const complete=runtime.filter((r:any)=>r.nativeFinalPlan.stage==='COMPLETE');assert.equal(complete.length,39);
assert(runtime.every((r:any)=>r.masteryUnchanged===true&&r.oldMasteryCount===0&&r.allNewAssessmentResultsUnset===true));
const gk=complete.find((r:any)=>r.requestedJurisdiction==='canonical-own'&&r.requestedProfile==='GK');assert(gk);const target=new Set<string>(gk.targetIds);
const localId=(id:string)=>id.slice(id.lastIndexOf(':')+1);
const materialScope=inv.exactlyEightRows.filter((r:any)=>r.proposedNewId).map((r:any)=>{
 const g=am.get(r.proposedNewId),resolved=resolveRetainedCoverage(after,g.examData.coveredGoalIds);assert.deepEqual(resolved.issues,[]);
 const prep=collectWholeMaterialPrerequisiteClosure(after,g.id);
 const externalCoverage=resolved.atoms.map(localId).filter(id=>!target.has(id)),externalPrep=[...prep.atomicGoalIds].filter(id=>!target.has(id));
 return {route:g.id,title:g.title,currentCanonicalGkTarget:target.has(g.id),coveredAtoms:resolved.atoms.length,coveredAtomsAbsentFromActualCanonicalGkTargets:externalCoverage.map(id=>({id,title:am.get(id)?.title,tags:am.get(id)?.tags})),hardPrepAbsentFromActualCanonicalGkTargets:externalPrep.map(id=>({id,title:am.get(id)?.title,tags:am.get(id)?.tags}))};
});
// Concrete counterexample: shrinking the exam claim alone does not remove its prerequisite or the ordinary target.
const q1=after.goals.find((g:any)=>g.id==='7aec2086-2cfa-50d3-8503-b40e96ca3430'),flow='5ac3f762-2b2d-5414-9765-335962a3d2c1';
assert(q1.examData.coveredGoalIds.includes(flow));assert(resolveRetainedCoverage(after,q1.examData.coveredGoalIds).atoms.map(localId).includes(flow));const mutation=structuredClone(after),m=mutation.goals.find((g:any)=>g.id===q1.id);m.examData.coveredGoalIds=m.examData.coveredGoalIds.filter((id:string)=>id!==flow);
assert(!resolveRetainedCoverage(mutation,m.examData.coveredGoalIds).atoms.map(localId).includes(flow));assert(collectWholeMaterialPrerequisiteClosure(mutation,m.id).atomicGoalIds.has(flow));assert(mutation.goals.some((g:any)=>g.id===flow));
// Independently verify actual route-profile selection from its exact authored current cluster list.
const generator=readFileSync(W+'/app/scripts/generateCurriculumQualityStatus.ts','utf8');
const block=generator.match(/const CANONICAL_GYM_INFORMATICS_PRACTICE_CLUSTER_IDS = \[([\s\S]*?)\n\]/)![1];
const clusters=[...block.matchAll(/'([0-9a-f-]{36})'/g)].map(m=>m[1]);
const terminalIds=clusters.flatMap(id=>am.get(id)?.contains??[]);assert(!clusters.includes('010651ba-ddd0-510b-8ed1-e3610031f6e1'));
const own='6ebc2a67-ea20-5c4e-8a63-635f40438d6a';assert(target.has(own));assert(!terminalIds.includes(own));
const out={sourceSha256:'d163550987320c6c8667fde4782a40ed4308525b8b9f025fcfc7fd6d70591d9c',selectedViews,recordedRuntimeRechecked:{total:51,complete:39,selection:12,emptyMasteryUnchanged:true,notANewBackendRun:true},materialScope,coverageOnlyShrinkCounterexample:{examId:q1.id,removedClaim:flow,ordinaryGoalStillPresent:true,hardPreparationStillRequiresIt:true,conclusion:'A legitimate scope reduction must review claim, task, prerequisites, view target and remaining required route together; no coverage-array-only patch.'},q2ProfileBoundary:{currentClusterIds:clusters,selectedTerminalIds:terminalIds,own20VisibleInActualCanonicalGk:true,own20AbsentFromStaticRouteProfile:true,conclusion:'The one-line removal repairs the obsolete reference; it does not yet integrate the valid own20 offer as a Q2 route endpoint. No full route pass is claimed.'}};
writeFileSync(O+'/targeted-native-counterchecks.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({views:selectedViews.length,runtimeCases:runtime.length,materialScope:materialScope.map(r=>({id:r.route,cover:r.coveredAtoms,outsideGk:r.coveredAtomsAbsentFromActualCanonicalGkTargets.length,prepOutsideGk:r.hardPrepAbsentFromActualCanonicalGkTargets.length})),q2Own20NotInRouteProfile:true}));
