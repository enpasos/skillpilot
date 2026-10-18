// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {convertLearningGoal} from '../../../../../../../../app/src/goalTypes';
import {applyCompositionViewProjection} from '../../../../../../../../app/src/utils/compositionViewRuntime';
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring';
import {buildDirectChildrenMap,getRenderedChildIds} from '../../../../../../../../app/src/utils/treeProjectionRuntime';
import {goalMatchesFilters} from '../../../../../../../../app/src/utils/goalFilters';
import {intersectApplicabilityJurisdictions} from '../../../../../../../../app/scripts/applicabilityCompiler';
const P='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-T4-operative-two-material-author-20261018-v2/';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const raw=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');
const before=structuredClone(raw),after=structuredClone(raw),goals=read(P+'AUTHOR.two-new-complete-exam-goals.pending.json').goals;
const operations=read(P+'PROPOSAL.exact-two-endpoint-view-child-array-CAS.pending.json').operations;
const proposal=read(P+'PROPOSAL.two-exact-source-view-placements.pending.json');
const by=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]));
by.get(proposal.placements[0].parentId).contains.push(...goals.map((g:any)=>g.id));after.goals.push(...goals);
const allIds=new Set(goals.map((g:any)=>g.id));
const make=(r:any)=>({meta:r,goals:r.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:r.landscapeId}))});
function project(r:any,v:any){
 const m=new Map<string,any>(r.goals.map((g:any)=>[g.id,g]));
 const roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,m);
 const p=applyCompositionViewProjection([make(r)],normalizeCompositionView(v))[0];
 const pm=new Map<string,any>(p.goals.map((g:any)=>[g.id,g])),children=buildDirectChildrenMap(pm);
 const stack=p.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id),seen=new Set<string>();
 while(stack.length){const id=stack.pop()!;if(seen.has(id))continue;seen.add(id);stack.push(...getRenderedChildIds(id,pm,children))}
 const filters=[v.scope.jurisdiction,v.scope.courseProfile,v.scope.durationModel].filter(Boolean);
 return new Set([...roles.targetGoalIds].filter(id=>seen.has(id)&&goalMatchesFilters(m.get(id),filters)));
}
const dir='curricula/DE/Gymnasium/composition-views/chemie/';
const paths=readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>dir+f).filter(f=>read(f).scope);
const results:any[]=[];
for(const path of paths){
 const v=read(path),av=structuredClone(v),op=operations.find((x:any)=>x.normalView.path===path);
 if(op){let ns=av.rootNodes;let node:any;for(const id of op.stableStructureIdPath){node=ns.find((n:any)=>n.id===id);assert(node);ns=node.children}assert.deepEqual(node.children,op.beforeChildren);node.children.push(...op.appendChildren)}
 const b=project(before,v),a=project(after,av),expected=proposal.placements.filter((x:any)=>x.currentTargetViews.includes(path)).map((x:any)=>x.endpointId);
 const ordinaryRemoved=[...b].filter(i=>!a.has(i)),ordinaryAdded=[...a].filter(i=>!b.has(i)&&!allIds.has(i));
 const actual=[...a].filter(i=>allIds.has(i));
 const missing=expected.filter((i:string)=>!a.has(i)),unexpected=actual.filter(i=>!expected.includes(i));
 const missingRequiredTargets=goals.filter((g:any)=>a.has(g.id)).flatMap((g:any)=>g.requires.filter((i:string)=>!a.has(i)).map((id:string)=>({examId:g.id,requiredGoalId:id})));
 results.push({path,expectedEndpointIds:expected,actualEndpointIds:actual,ordinaryRemoved,ordinaryAdded,missing,unexpected,missingRequiredTargets});
}
const stockAllOf=goals.map((g:any)=>{const computed=intersectApplicabilityJurisdictions(g.requires.map((i:string)=>by.get(i).applicability));assert.deepEqual(g.applicability.jurisdiction,computed);return {examId:g.id,currentMaterializedRequirementIntersection:computed,evidenceOnly:'assessment-requires, no official source coverage',fullAPCompilerRun:false}});
const failures=results.filter(r=>r.ordinaryRemoved.length||r.ordinaryAdded.length||r.missing.length||r.unexpected.length||r.missingRequiredTargets.length);
const report={status:failures.length?'HOLD_ACTUAL_PROJECTION':'PASS_ACTUAL_PROJECTION',functions:'Actual stock composition role/projection/tree/filter functions and stock all-of intersection; in-memory own candidate only',chemistryViewsChecked:results.length,results,stockAllOf,failures,normalWrites:0,fullAPCompilerOrBroadBuild:false};
writeFileSync(P+'CHECK.actual-stock-finite-view-projections-and-all-of.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,views:results.length,failures},null,2));process.exitCode=failures.length?1:0;
