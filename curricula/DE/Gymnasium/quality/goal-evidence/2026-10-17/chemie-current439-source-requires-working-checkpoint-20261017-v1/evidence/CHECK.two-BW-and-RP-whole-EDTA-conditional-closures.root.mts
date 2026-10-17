import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {collectCompositionProjectionRoleGoalIds as roles,compileCompositionView} from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts';
const O='/mnt/e/skillpilot-chemie-L7-20261017/two-BW-data-teachers-and-coordinate-model-priors-author-root-v1';
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'));
const input=read(O+'/REVIEW-INPUT.clean-two-BW-data-targets-and-coordinate-prior-replacement.json');
const foreign=read(input.foreignInput.path); const base=read(input.baseCanonical.path),views=read(input.baseWhole39Views.path);
const clone=(x:any)=>JSON.parse(JSON.stringify(x)); const before=clone(base);
for(const x of foreign.separateWholeBeforeAndAfterGoalScopeAnnotations){const i=before.goals.findIndex((g:any)=>g.id===x.goalId);assert.deepEqual(before.goals[i],x.before);before.goals[i]=x.after;}
for(const x of foreign.wholeBeforeAndAfterViews){const i=views.findIndex((v:any)=>v.viewId===x.viewId);assert.deepEqual(views[i],x.before);views[i]=x.after;}
const after=clone(before);
for(const x of input.wholeGoalChanges){const i=after.goals.findIndex((g:any)=>g.id===x.goalId);assert.deepEqual(after.goals[i],x.before);after.goals[i]=x.after;}
const viewsAfter=clone(views);
for(const x of input.wholeViewChanges){const i=viewsAfter.findIndex((v:any)=>v.viewId===x.viewId);assert.deepEqual(viewsAfter[i],x.before);viewsAfter[i]=x.after;}
const rows:any[]=[];const mapB=new Map<string,any>(before.goals.map((g:any)=>[g.id,g])),mapA=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]));
for(const id of ['de-bw-gym-chemistry-lk','de-rp-gym-chemistry-lk']){
 const b=views.find((v:any)=>v.viewId===id),a=viewsAfter.find((v:any)=>v.viewId===id),br=roles(b.rootNodes,mapB),ar=roles(a.rootNodes,mapA);
 const lostTargets=[...br.targetGoalIds].filter(x=>!ar.targetGoalIds.has(x)); const lostSupport=[...br.prerequisiteOnlyGoalIds].filter(x=>!ar.prerequisiteOnlyGoalIds.has(x));assert.equal(lostTargets.length,0);assert.equal(lostSupport.length,0);
 const oldFindings=new Set(compileCompositionView(b,before).findings.map((x:any)=>JSON.stringify(x)));const newFindings=compileCompositionView(a,after).findings.filter((x:any)=>!oldFindings.has(JSON.stringify(x)));assert.equal(newFindings.filter((x:any)=>x.severity==='error').length,0);
 const start='e22a34d4-ac1e-5afe-8f77-0dfa4fd9f44f';
 const missing:any[]=[];const seen=new Set<string>();const walk=(gid:string)=>{if(seen.has(gid))return;seen.add(gid);for(const p of mapA.get(gid)?.requires??[]){if(!ar.targetGoalIds.has(p))missing.push({dependentGoalId:gid,priorId:p,actualRole:ar.prerequisiteOnlyGoalIds.has(p)?'prerequisiteOnly':'absent'});walk(p);}};walk(start);
 rows.push({viewId:id,addedTargets:[...ar.targetGoalIds].filter(x=>!br.targetGoalIds.has(x)),lostTargets,lostSupport,newFindings,selectedTeacherClosureStart:start,teacherClosureGoalCount:seen.size,remainingNonTargetTeacherPairs:missing,oldEPAAngleTargetPreserved:br.targetGoalIds.has('9b56d01e-c2d7-51d8-b78e-237592c1ed20')===ar.targetGoalIds.has('9b56d01e-c2d7-51d8-b78e-237592c1ed20'),oldAssayTargetPreserved:br.targetGoalIds.has('973c12d9-d863-5292-8c68-9c80cdacf9e2')===ar.targetGoalIds.has('973c12d9-d863-5292-8c68-9c80cdacf9e2')});
}
for(const edge of ['requires','contains']){const seen=new Set(),active=new Set();const walk=(id:string)=>{if(active.has(id))throw Error('cycle '+id);if(seen.has(id))return;assert(mapA.has(id));active.add(id);for(const t of mapA.get(id)[edge]??[])walk(t);active.delete(id);seen.add(id);};for(const g of after.goals)walk(g.id);}
const result={role:'Actual bounded stock-helper measurement of an inactive conditional author candidate, no independent science vote or full APV',inputSHA256:crypto.createHash('sha256').update(fs.readFileSync(O+'/REVIEW-INPUT.clean-two-BW-data-targets-and-coordinate-prior-replacement.json')).digest('hex'),foreignProposalIsOnlyConditionalBase:true,goals:after.goals.length,views:viewsAfter.length,rows,requiresAndContainsCycles:0,fullAPVOrNativeOrM7OrHumanApproval:false};
const out=O+'/MEASUREMENT.additive.actual-stock-helper-whole-two-EDTA-target-closures.json';fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
