import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {collectCompositionProjectionRoleGoalIds as roles, compileCompositionView} from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts';
import {getSrsFilterTags} from '/home/enpasos/projects/skillpilot/app/src/utils/srsTags.ts';
const O='/mnt/e/skillpilot-chemie-L7-20261017/NI-organics-materials-retained-target-scope-author-root-v1';
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'));
const inputPath=O+'/REVIEW-INPUT.clean-NI-thirteen-retained-topics-one-real-teacher-and-two-Memory-routes.json';
const i=read(inputPath), before=read(i.baseCanonical.path), after=read(i.wholeCanonicalCandidate.path), bv=read(i.baseWhole39Views.path), av=read(i.whole39ViewsCandidate.path);
const mb=new Map<string,any>(before.goals.map((g:any)=>[g.id,g])),ma=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]));
const changedIds=new Set(i.wholeGuardedProposal.canonicalWholeGoalChanges.map((x:any)=>x.goalId));
assert.equal(changedIds.size,14);assert.equal(ma.size,650);
for(const g of before.goals)if(!changedIds.has(g.id))assert.deepEqual(g,ma.get(g.id));
const rows:any[]=[],addedTargets:any[]=[];
for(const v of av){
 const old=bv.find((x:any)=>x.viewId===v.viewId);assert(old);
 const rb=roles(old.rootNodes,mb),ra=roles(v.rootNodes,ma);
 const lostT=[...rb.targetGoalIds].filter(x=>!ra.targetGoalIds.has(x)),lostP=[...rb.prerequisiteOnlyGoalIds].filter(x=>!ra.prerequisiteOnlyGoalIds.has(x));
 assert.deepEqual(lostT,[]);assert.deepEqual(lostP,[]);
 for(const id of [...ra.targetGoalIds].filter(x=>!rb.targetGoalIds.has(x)))addedTargets.push({viewId:v.viewId,goalId:id});
 const oldFindings=new Set(compileCompositionView(old,before).findings.map(x=>JSON.stringify(x)));
 const newFindings=compileCompositionView(v,after).findings.filter(x=>!oldFindings.has(JSON.stringify(x)));
 assert.equal(newFindings.filter(x=>x.severity==='error').length,0);
 if(v.viewId!=='de-ni-gym-chemistry-lk')assert.deepEqual(v,old);
 if(!['de-ni-gym-chemistry-gk','de-ni-gym-chemistry-lk'].includes(v.viewId))continue;
 const starts=i.wholeOriginalFifteenExcludedTargetRows.filter((g:any)=>g.nodeKind!=='memory'&&g.viewIds.includes(v.viewId)).map((g:any)=>g.goalId);
 const seen=new Set<string>(),missing:any[]=[];
 const walk=(id:string)=>{if(seen.has(id))return;seen.add(id);for(const p of ma.get(id)?.requires??[]){if(!ra.targetGoalIds.has(p))missing.push({dependent:id,prior:p,role:ra.prerequisiteOnlyGoalIds.has(p)?'prerequisiteOnly':'absent'});walk(p);}};
 for(const id of starts)walk(id);assert.deepEqual(missing,[]);
 rows.push({viewId:v.viewId,starts,ordinaryTeacherClosureCount:seen.size,missingOrdinaryTargetTeachers:missing,newFindings});
}
assert.deepEqual(addedTargets,[{viewId:'de-ni-gym-chemistry-lk',goalId:'ca216bc6-5205-5b46-abbd-fd5628e4ca5b'}]);
const selections=[];
for(const row of i.all67ExistingMemorySelections){
 const g=ma.get(row.goalId);assert.deepEqual(g,mb.get(row.goalId));
 const tags=getSrsFilterTags(g.tags);assert.deepEqual(tags,row.actualFilterTags);
 const d=read(row.actualDeckPin.path),cards=Array.isArray(d)?d:d.cards;
 const selected=cards.filter((card:any)=>tags.length===0||tags.some(t=>(card.tags??[]).includes(t))).map((c:any)=>c.id);
 assert.deepEqual(selected,row.selectedCardIds);
 selections.push({goalId:g.id,actualFilterTags:tags,selectedCardIds:selected});
}
assert.equal(selections.length,67);
for(const relation of ['requires','contains']){
 const done=new Set<string>(),active=new Set<string>();const walk=(id:string)=>{assert(!active.has(id),'cycle '+relation+' '+id);if(done.has(id))return;active.add(id);for(const p of ma.get(id)?.[relation]??[]){assert(ma.has(p));walk(p);}active.delete(id);done.add(id);};
 for(const id of ma.keys())walk(id);
}
const result={role:'Actual bounded stock composition and SRS filter helpers on an unapplied author candidate. No new scientific vote or actual after-compiler acceptance.',inputSha256:crypto.createHash('sha256').update(fs.readFileSync(inputPath)).digest('hex'),wholeGoals:650,views:39,unchangedOtherGoals:636,unchangedOtherViews:38,addedTargets,lostTargetOrSupportRoles:0,newCompositionErrors:0,ordinaryTeacherRows:rows,all67ActualSrsSelections:selections,cycles:0,newActualCompilerRun:false,newNativeOrCentralRun:false,M7:false,HumanApproval:false};
const out=O+'/MEASUREMENT.actual-stock-roles-teacher-closures-and-all67-SRS-filters.json';fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({...result,all67ActualSrsSelections:selections.length,out}));
