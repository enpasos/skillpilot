// SPDX-License-Identifier: Apache-2.0
// Independent, finite current-input replay. No normal writes.
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {isDeepStrictEqual} from 'node:util';
import {convertLearningGoal} from '../../../../../../../app/src/goalTypes';
import {applyCompositionViewProjection} from '../../../../../../../app/src/utils/compositionViewRuntime';
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring';
import {buildDirectChildrenMap,getRenderedChildIds} from '../../../../../../../app/src/utils/treeProjectionRuntime';
import {goalMatchesFilters} from '../../../../../../../app/src/utils/goalFilters';
import {intersectApplicabilityJurisdictions} from '../../../../../../../app/scripts/applicabilityCompiler';
const O='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-T5-terminal-exams-independent-a-20261018-v1/';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const pin=(p:string)=>{const b=readFileSync(p);return{path:p,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length}};
const canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';
const before=read(canonical),after=structuredClone(before),goals=read(O+'input/AUTHOR.eight-complete-exam-goals.draft.json');
const records=read(O+'input/INPUT.whole-current-fourteen-end-and-four-support-goals-and-P.json').records;
const operations=read(O+'input/PROPOSAL.five-exact-view-child-array-append-CAS.draft.json').operations;
const proposal=read(O+'input/PROPOSAL.placement-and-applicability.draft.json');
const beforeBy=new Map<string,any>(before.goals.map((g:any)=>[g.id,g]));
const contextChecks=records.map((r:any)=>{
 const nativePath=r.PRecordFile.path,nativeRecord=JSON.parse(readFileSync(nativePath,'utf8').trim().split('\n')[r.PLine-1]);
 return {goalId:r.goal.id,supportOnly:r.supportOnly,wholeCurrentGoalExact:isDeepStrictEqual(beforeBy.get(r.goal.id),r.goal),nativePFileRawExact:isDeepStrictEqual(pin(nativePath),r.PRecordFile),wholeNativeRecordExact:isDeepStrictEqual(nativeRecord,r.wholePRecord),nativeFile:pin(nativePath),lineOneBased:r.PLine};
});
const by=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]));
for(const g of goals)assert(!by.has(g.id),'Endpoint already normal; do not duplicate '+g.id);
by.get(proposal.neutralParentId).contains.push(...goals.map((g:any)=>g.id));after.goals.push(...goals);for(const g of goals)by.set(g.id,g);
const selected=new Set<string>(goals.map((g:any)=>g.id));
function project(raw:any,v:any){
 const m=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g]));const roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,m);
 const landscape={meta:raw,goals:raw.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:raw.landscapeId}))};
 const p=applyCompositionViewProjection([landscape],normalizeCompositionView(v))[0];
 const pm=new Map<string,any>(p.goals.map((g:any)=>[g.id,g])),children=buildDirectChildrenMap(pm);
 const stack=p.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id),seen=new Set<string>(),parents=new Map<string,Set<string>>();
 while(stack.length){const id=stack.pop()!;if(seen.has(id))continue;seen.add(id);for(const child of getRenderedChildIds(id,pm,children)){const ps=parents.get(child)??new Set<string>();ps.add(id);parents.set(child,ps);stack.push(child)}}
 const filters=[v.scope?.jurisdiction,v.scope?.courseProfile,v.scope?.durationModel].filter(Boolean);
 return {targets:new Set<string>([...roles.targetGoalIds].filter(id=>seen.has(id)&&goalMatchesFilters(m.get(id),filters))),roles,seen,parents};
}
const dir='curricula/DE/Gymnasium/composition-views/chemie/';
const paths=readdirSync(dir).filter(f=>f.endsWith('.view.json')).map(f=>dir+f);
const results:any[]=[];
for(const path of paths){
 const v=read(path),av=structuredClone(v),op=operations.find((x:any)=>x.normalView.path===path);
 let wholeViewRawCAS=true;
 if(op){wholeViewRawCAS=isDeepStrictEqual(pin(path),op.normalView);let ns=av.rootNodes,node:any;for(const id of op.stableStructureIdPath){node=ns.find((n:any)=>n.id===id);assert(node);ns=node.children}assert.deepEqual(node.children,op.beforeChildren);node.children.push(...op.appendChildren)}
 const b=project(before,v),a=project(after,av),expected=proposal.viewEndpointEntries.filter((x:any)=>x.viewPath===path).map((x:any)=>x.goalId);
 const oldLost=[...b.targets].filter(i=>!a.targets.has(i)),oldAdded=[...a.targets].filter(i=>!b.targets.has(i)&&!selected.has(i));
 const actual=[...a.targets].filter(i=>selected.has(i)),missing=expected.filter((i:string)=>!a.targets.has(i)),unexpected=actual.filter(i=>!expected.includes(i));
 const missingRequiredTargets=goals.filter((g:any)=>a.targets.has(g.id)).flatMap((g:any)=>g.requires.filter((i:string)=>!a.targets.has(i)).map((id:string)=>({examId:g.id,requiredGoalId:id})));
 const oldRoleChanges=[...beforeBy.keys()].filter(id=>b.roles.targetGoalIds.has(id)!==a.roles.targetGoalIds.has(id)||b.roles.prerequisiteOnlyGoalIds.has(id)!==a.roles.prerequisiteOnlyGoalIds.has(id));
 const oldRenderedSetChanges=[...beforeBy.keys()].filter(id=>b.seen.has(id)!==a.seen.has(id));
 const oldParentChanges=[...b.parents].filter(([id,ps])=>beforeBy.has(id)&&!isDeepStrictEqual([...ps].sort(),[...(a.parents.get(id)??[])].sort())).map(([id])=>id);
 const duplicateNewParents=actual.filter(id=>(a.parents.get(id)?.size??0)!==1);
 results.push({path,scope:v.scope,rawPin:pin(path),wholeViewRawCAS,expected,actual,oldLost,oldAdded,missing,unexpected,missingRequiredTargets,oldRoleChanges,oldRenderedSetChanges,oldParentChanges,duplicateNewParents});
}
const graphChecks:any[]=[];
for(const edge of ['requires','contains']){
 const state=new Map<string,number>();const errors:string[]=[];
 function visit(id:string){if(state.get(id)===1){errors.push('cycle:'+id);return}if(state.get(id)===2)return;state.set(id,1);for(const next of by.get(id)?.[edge]??[]){if(!by.has(next))errors.push('missing:'+next);else visit(next)}state.set(id,2)}
 for(const id of by.keys())visit(id);graphChecks.push({edge,errors});
}
const stockAllOf=goals.map((g:any)=>{const actual=intersectApplicabilityJurisdictions(g.requires.map((i:string)=>by.get(i).applicability));return{examId:g.id,computed:actual,authored:g.applicability.jurisdiction,exact:isDeepStrictEqual(actual,g.applicability.jurisdiction)}});
const blockers=results.filter(r=>r.oldLost.length+r.oldAdded.length+r.missing.length+r.unexpected.length+r.missingRequiredTargets.length+r.oldRoleChanges.length+r.oldRenderedSetChanges.length+r.oldParentChanges.length+r.duplicateNewParents.length);
const report={role:'INDEPENDENT_A_ACTUAL_CURRENT_RUNTIME_REPLAY_NO_NATIVE_PAGE_BINDING',canonical:pin(canonical),candidate:pin(O+'input/AUTHOR.eight-complete-exam-goals.draft.json'),currentNodeCount:before.goals.length,candidateNodeCount:after.goals.length,views:results.length,results,contextChecks,stockAllOf,graphChecks,blockers,normalWrites:0,fullAPCompilerOrBroadBuild:false};
writeFileSync(O+'CHECK.actual-all41-current-context-independent-a.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({views:results.length,appearances:results.reduce((n,r)=>n+r.actual.length,0),blockers,contextMismatches:contextChecks.filter((x:any)=>!x.wholeCurrentGoalExact||!x.nativePFileRawExact||!x.wholeNativeRecordExact),graphChecks,allOfErrors:stockAllOf.filter(x=>!x.exact)}));
