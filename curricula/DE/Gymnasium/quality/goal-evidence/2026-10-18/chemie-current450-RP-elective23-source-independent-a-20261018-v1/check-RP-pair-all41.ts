// SPDX-License-Identifier: Apache-2.0
// Bounded source/scope check of RP4a7 and its linked endpoint only. No full T2 vote.
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {convertLearningGoal} from '../../../../../../../app/src/goalTypes';
import {applyCompositionViewProjection} from '../../../../../../../app/src/utils/compositionViewRuntime';
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring';
import {buildDirectChildrenMap,getRenderedChildIds} from '../../../../../../../app/src/utils/treeProjectionRuntime';
import {goalMatchesFilters} from '../../../../../../../app/src/utils/goalFilters';
const O='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-RP-elective23-source-independent-a-20261018-v1/';
const A='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-T2-terminal-exams-interface-author-20261018-v6/';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const pin=(p:string)=>{const b=readFileSync(p);return{path:p,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length}};
const canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';
const before=read(canonical),after=structuredClone(before),ordinaryId='4a7dee38-1056-5e27-acec-e6a12f58109f',endpointId='e883c5e9-5634-5a46-a013-15d5a684c5cd';
const endpoint=read(A+'AUTHOR.new-goals.full.draft.json').newGoals.find((g:any)=>g.id===endpointId);after.goals.push(endpoint);after.goals.find((g:any)=>g.id==='5964272f-e835-5a24-b2b1-c162be6b75cb').contains.push(endpointId);
const beforeBy=new Map<string,any>(before.goals.map((g:any)=>[g.id,g]));const proposed=read(O+'input/AUTHOR.view-whole-CAS.json').records.filter((r:any)=>r.path.includes('/de-rp-'));
function project(raw:any,v:any){
 const m=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g]));const roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,m);
 const landscape={meta:raw,goals:raw.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:raw.landscapeId}))};
 const p=applyCompositionViewProjection([landscape],normalizeCompositionView(v))[0];
 const pm=new Map<string,any>(p.goals.map((g:any)=>[g.id,g])),children=buildDirectChildrenMap(pm);
 const stack=p.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id),seen=new Set<string>(),parents=new Map<string,Set<string>>();
 while(stack.length){const id=stack.pop()!;if(seen.has(id))continue;seen.add(id);for(const child of getRenderedChildIds(id,pm,children)){const ps=parents.get(child)??new Set<string>();ps.add(id);parents.set(child,ps);stack.push(child)}}
 const filters=[v.scope?.jurisdiction,v.scope?.courseProfile,v.scope?.durationModel].filter(Boolean);
 return {projected:pm,targets:new Set<string>([...roles.targetGoalIds].filter(id=>seen.has(id)&&goalMatchesFilters(m.get(id),filters))),roles,seen,parents};
}

const checks:any[]=[];
for(const name of readdirSync('curricula/DE/Gymnasium/composition-views/chemie').filter(n=>n.endsWith('.view.json'))){
 const path='curricula/DE/Gymnasium/composition-views/chemie/'+name,v=read(path),av=structuredClone(v),rp=proposed.find((r:any)=>r.path===path);
 let beforeCAS=true;
 if(rp){beforeCAS=isDeepStrictEqual(pin(path),rp.beforeFilePin)&&isDeepStrictEqual(v,rp.beforeWholeView);const op=rp.operations.find((x:any)=>x.sourceScope==='RP');function append(nodes:any[]):boolean{for(const n of nodes){if(n.id===op.parentStructureId){n.children.push(...op.appendChildren);return true}if(n.children&&append(n.children))return true}return false}if(!append(av.rootNodes))throw Error('Missing RP optional-unit parent');}
 const b=project(before,v),a=project(after,av),selected=new Set([ordinaryId,endpointId]);
 const actual=[...a.targets].filter(id=>selected.has(id)),expected=rp?[ordinaryId,endpointId]:[...b.targets].filter(id=>selected.has(id));
 const roleChangesOutsideIntendedPair=[...beforeBy.keys()].filter(id=>!(rp&&id===ordinaryId)&&(b.roles.targetGoalIds.has(id)!==a.roles.targetGoalIds.has(id)||b.roles.prerequisiteOnlyGoalIds.has(id)!==a.roles.prerequisiteOnlyGoalIds.has(id)));
 const oldTargetLoss=[...b.targets].filter(id=>!a.targets.has(id)),otherTargetAdds=[...a.targets].filter(id=>!b.targets.has(id)&&!selected.has(id));
 const oldParentChanges=[...b.parents].filter(([id,ps])=>!(rp&&id===ordinaryId)&&!isDeepStrictEqual([...ps].sort(),[...(a.parents.get(id)??[])].sort())).map(([id])=>id);
 const missingGraphPrerequisites=rp?[ordinaryId,endpointId].flatMap(id=>(after.goals.find((g:any)=>g.id===id)?.requires??[]).filter((r:string)=>!a.projected.has(r)).map((r:string)=>({goalId:id,requires:r}))):[];
 const missingRenderedTargetPrerequisites=rp?[ordinaryId,endpointId].flatMap(id=>(after.goals.find((g:any)=>g.id===id)?.requires??[]).filter((r:string)=>{const q=after.goals.find((g:any)=>g.id===r);return !(q?.contains?.length)&&!a.targets.has(r)}).map((r:string)=>({goalId:id,requires:r}))):[];
 const duplicatePairParents=rp?actual.filter(id=>(a.parents.get(id)?.size??0)!==1):[];
 checks.push({path,beforeCAS,actual,expected,exactIntendedPair:isDeepStrictEqual(actual.sort(),expected.sort()),roleChangesOutsideIntendedPair,oldTargetLoss,otherTargetAdds,oldParentChanges,missingGraphPrerequisites,missingRenderedTargetPrerequisites,duplicatePairParents,requiredDetails:rp?[ordinaryId,endpointId].flatMap(id=>(after.goals.find((g:any)=>g.id===id)?.requires??[]).map((r:string)=>({goalId:id,requires:r,graphAvailable:a.projected.has(r),target:a.targets.has(r),atomicDescendants:(after.goals.find((g:any)=>g.id===r)?.contains??[]).map((c:string)=>({id:c,graphAvailable:a.projected.has(c),target:a.targets.has(c)}))}))):[],selectedParents:rp?actual.map(id=>({id,parents:[...(a.parents.get(id)??[])]})):[]});
}
const blockers=checks.filter(r=>!r.beforeCAS||!r.exactIntendedPair||r.roleChangesOutsideIntendedPair.length||r.oldTargetLoss.length||r.otherTargetAdds.length||r.oldParentChanges.length||r.missingGraphPrerequisites.length||r.missingRenderedTargetPrerequisites.length||r.duplicatePairParents.length);
writeFileSync(O+'CHECK.actual-RP-pair-all41-scope-and-prerequisites.json',JSON.stringify({role:'BOUNDED_RP_SOURCE_SCOPE_PAIR_ONLY_NOT_FULL_T2_REVIEW',canonical:pin(canonical),views:checks.length,currentNodes:before.goals.length,checks,blockers,normalWrites:0},null,2)+'\n');console.log(JSON.stringify({views:checks.length,blockers}));
